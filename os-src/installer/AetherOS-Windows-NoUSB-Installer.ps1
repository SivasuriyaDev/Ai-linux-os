<#
.SYNOPSIS
  AetherOS No-Pendrive Windows-to-Linux Direct Installer (PowerShell / Administrator)
.DESCRIPTION
  Allows switching from Windows 10/11 to AetherOS 1.0 LTS WITHOUT a USB pendrive on BOTH:
    - Legacy BIOS + MBR PCs (even with 4/4 primary partitions - stages directly on C:\live\ via GRUB4DOS 0.4.6a + BCD)
    - UEFI + GPT PCs (stages FAT32 AETHER_BOOT partition + UEFI firmware entry)
#>

#Requires -RunAsAdministrator
param(
  [int]$AllocateGB = 60,
  [switch]$ReplaceWindows,
  [string]$IsoFolder = "",
  [string]$IsoPath = ""
)

$ErrorActionPreference = "Stop"
Write-Host "=== AetherOS 1.0 LTS - No-Pendrive Direct Installer (Windows -> Linux) ===" -ForegroundColor Cyan

$searchDir = if ([string]::IsNullOrWhiteSpace($IsoFolder)) { $PSScriptRoot } else { $IsoFolder }

if ([string]::IsNullOrWhiteSpace($IsoPath)) {
  $localIso = Get-ChildItem -Path $searchDir -Filter "aetheros-*.iso" -File -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($localIso) {
    $IsoPath = $localIso.FullName
  } else {
    $anyIso = Get-ChildItem -Path $searchDir -Filter "*.iso" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($anyIso) {
      $IsoPath = $anyIso.FullName
    } else {
      $dlIso = Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Filter "aetheros-*.iso" -File -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($dlIso) { $IsoPath = $dlIso.FullName }
    }
  }
}

if ([string]::IsNullOrWhiteSpace($IsoPath) -or -not (Test-Path -LiteralPath $IsoPath)) {
  throw "AetherOS ISO not found! Place aetheros-1.0-lts-x86_64.iso in $searchDir and run again."
}
Write-Host "[OK] Found ISO: $IsoPath" -ForegroundColor Green

$bcdCurrent = (& bcdedit /enum '{current}' 2>$null) -join "`n"
$isUefi = ($env:firmware_type -eq "UEFI") -or ($bcdCurrent -match "winload\.efi")
$cPart = Get-Partition -DriveLetter C
$disk = Get-Disk -Number $cPart.DiskNumber
$allParts = @(Get-Partition -DiskNumber $cPart.DiskNumber)

Write-Host "[INFO] Firmware: $(if ($isUefi) { 'UEFI' } else { 'Legacy BIOS' }) | Disk $($disk.Number): $($disk.PartitionStyle) ($($allParts.Count) partitions)" -ForegroundColor Cyan

function Restore-CDriveUnallocated {
  try {
    $sup = Get-PartitionSupportedSize -DriveLetter C
    $cur = Get-Partition -DriveLetter C
    if ($sup.SizeMax -gt ($cur.Size + [int64]50 * 1MB)) {
      $reclaimGB = [Math]::Round(($sup.SizeMax - $cur.Size) / 1GB, 2)
      Write-Host "[AUTO-FIX] Restoring ${reclaimGB} GB of unallocated space back into C:\ safely..." -ForegroundColor Yellow
      Resize-Partition -DriveLetter C -Size $sup.SizeMax
      Write-Host "[OK] C:\ expanded back to full size (${reclaimGB} GB recovered)." -ForegroundColor Green
    }
  } catch {
    Write-Host "[INFO] Could not auto-extend C:\: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

function Remove-OldAetherBcdEntries {
  try {
    $enumLines = & bcdedit /enum /v 2>$null
    $curId = $null
    foreach ($line in $enumLines) {
      if ($line -match '^\s*identifier\s+(\{[0-9a-fA-F\-]{36}\})\s*$') {
        $curId = $Matches[1]
      } elseif ($curId -and $line -match '^\s*description\s+.*AetherOS 1\.0 LTS') {
        & bcdedit /delete $curId /f | Out-Null
        $curId = $null
      } elseif ([string]::IsNullOrWhiteSpace($line)) {
        $curId = $null
      }
    }
  } catch {}
}

function Mount-AetherIsoDrive {
  param([string]$Path)
  $existing = Get-DiskImage -ImagePath $Path -ErrorAction SilentlyContinue
  $weMounted = $false
  if (-not ($existing -and $existing.Attached)) {
    Mount-DiskImage -ImagePath $Path -ErrorAction Stop | Out-Null
    $weMounted = $true
  }
  $isoDrive = $null
  for ($i = 0; $i -lt 15; $i++) {
    $img = Get-DiskImage -ImagePath $Path -ErrorAction SilentlyContinue
    $vol = $img | Get-Volume -ErrorAction SilentlyContinue | Where-Object { $_.DriveLetter } | Select-Object -First 1
    if ($vol -and $vol.DriveLetter) {
      $candidate = "$($vol.DriveLetter):"
      if (Test-Path -LiteralPath "$candidate\") {
        $isoDrive = $candidate
        break
      }
    }
    Start-Sleep -Milliseconds 800
  }
  if (-not $isoDrive) {
    if ($weMounted) { Dismount-DiskImage -ImagePath $Path -ErrorAction SilentlyContinue | Out-Null }
    throw "Could not read mounted ISO drive letter for $Path."
  }
  return @{ Drive = $isoDrive; WeMounted = $weMounted }
}

function Find-AetherIsoLiveFiles {
  param([string]$IsoDrive)
  $liveDir = "$IsoDrive\live"
  if (-not (Test-Path -LiteralPath $liveDir)) {
    $foundDir = Get-ChildItem -LiteralPath "$IsoDrive\" -Directory -Recurse -Depth 2 -ErrorAction SilentlyContinue | Where-Object { $_.Name -ieq "live" } | Select-Object -First 1
    if ($foundDir) { $liveDir = $foundDir.FullName }
  }
  if (-not (Test-Path -LiteralPath $liveDir)) {
    $rootItems = (Get-ChildItem -LiteralPath "$IsoDrive\" -Force -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) -join ', '
    throw "ISO at $IsoDrive is missing /live directory. Root contents: [$rootItems]"
  }
  $files = @(Get-ChildItem -LiteralPath $liveDir -File -Force -ErrorAction SilentlyContinue)
  $kernel = $files | Where-Object { $_.Name -ieq "vmlinuz" } | Select-Object -First 1
  if (-not $kernel) { $kernel = $files | Where-Object { $_.Name -imatch '^vmlinuz' } | Select-Object -First 1 }

  $initrd = $files | Where-Object { $_.Name -ieq "initrd.img" } | Select-Object -First 1
  if (-not $initrd) { $initrd = $files | Where-Object { $_.Name -imatch '^initrd' } | Select-Object -First 1 }

  $squash = $files | Where-Object { $_.Name -ieq "filesystem.squashfs" } | Select-Object -First 1
  if (-not $squash) {
    $squash = $files | Where-Object { $_.Name -imatch '\.(squashfs|squ)$' -or ($_.Name -imatch '^filesys' -and $_.Length -gt 10MB) } | Sort-Object Length -Descending | Select-Object -First 1
  }
  if (-not $squash) {
    $squash = $files | Where-Object { $_.Length -gt 100MB } | Sort-Object Length -Descending | Select-Object -First 1
  }

  if (-not $kernel -or -not $initrd -or -not $squash) {
    $foundList = ($files | ForEach-Object { "$($_.Name) ($([Math]::Round($_.Length/1MB,1)) MB)" }) -join ', '
    throw "ISO is missing required boot files in $liveDir (expected vmlinuz, initrd.img, filesystem.squashfs). Found: [$foundList]"
  }
  return @{ LiveDir = $liveDir; Kernel = $kernel; Initrd = $initrd; Squash = $squash }
}

$bl = Get-BitLockerVolume -MountPoint "C:" -ErrorAction SilentlyContinue
if ($bl -and $bl.ProtectionStatus -eq "On") {
  throw "BitLocker is enabled on C:. Run 'Suspend-BitLocker -MountPoint C: -RebootCount 2' first."
}
Write-Host "[OK] BitLocker is not blocking C:." -ForegroundColor Green

powercfg /h off | Out-Null
Write-Host "[OK] Disabled Windows Fast Startup (hiberfil.sys cleared)." -ForegroundColor Green

# BRANCH A: LEGACY BIOS MODE (Works on MBR even with 4/4 partitions - NO new partition!)
if (-not $isUefi) {
  Write-Host "[MODE] Legacy BIOS No-Partition Mode activated (zero new partitions needed!)." -ForegroundColor Cyan
  Restore-CDriveUnallocated

  $cVol = Get-Volume -DriveLetter C
  $freeGB = [Math]::Round($cVol.SizeRemaining / 1GB, 2)
  if ($cVol.SizeRemaining -lt ([int64]2500 * 1MB)) {
    throw "Not enough free space on C:\ (need at least 2.5 GB free, found ${freeGB} GB)."
  }
  Write-Host "[OK] C:\ has ${freeGB} GB free - staging AetherOS directly into C:\live\..." -ForegroundColor Green

  Write-Host "[ISO] Mounting ISO and copying AetherOS live image to C:\live\ (1-2 minutes)..." -ForegroundColor Cyan
  $mountInfo = Mount-AetherIsoDrive -Path $IsoPath
  try {
    $isoDrive = $mountInfo.Drive
    $live = Find-AetherIsoLiveFiles -IsoDrive $isoDrive
    if ($live.Squash.Name -ine "filesystem.squashfs") {
      Write-Host "[ISO] Detected ISO-9660 8.3 name '$($live.Squash.Name)' -> normalizing to filesystem.squashfs..." -ForegroundColor Yellow
    }
    if (Test-Path -LiteralPath "C:\live") { Remove-Item -LiteralPath "C:\live" -Recurse -Force }
    New-Item -ItemType Directory -Path "C:\live" -Force | Out-Null
    Copy-Item -LiteralPath $live.Kernel.FullName -Destination "C:\live\vmlinuz" -Force
    Copy-Item -LiteralPath $live.Initrd.FullName -Destination "C:\live\initrd.img" -Force
    Copy-Item -LiteralPath $live.Squash.FullName -Destination "C:\live\filesystem.squashfs" -Force
    Get-ChildItem -LiteralPath "C:\live" -File -ErrorAction SilentlyContinue | ForEach-Object { $_.IsReadOnly = $false }
  } finally {
    if ($mountInfo.WeMounted) {
      Dismount-DiskImage -ImagePath $IsoPath -ErrorAction SilentlyContinue | Out-Null
    }
  }
  Write-Host "[OK] AetherOS kernel, initrd, and SquashFS copied to C:\live\." -ForegroundColor Green

  $needGrldr = (-not (Test-Path -LiteralPath "C:\grldr")) -or ((Get-Item -LiteralPath "C:\grldr").Length -lt 100000)
  $needGrldrMbr = (-not (Test-Path -LiteralPath "C:\grldr.mbr")) -or ((Get-Item -LiteralPath "C:\grldr.mbr").Length -ne 8192)

  if ($needGrldr -and (Test-Path -LiteralPath "$searchDir\grldr")) {
    Copy-Item -LiteralPath "$searchDir\grldr" -Destination "C:\grldr" -Force
    $needGrldr = $false
  }
  if ($needGrldrMbr -and (Test-Path -LiteralPath "$searchDir\grldr.mbr")) {
    Copy-Item -LiteralPath "$searchDir\grldr.mbr" -Destination "C:\grldr.mbr" -Force
    $needGrldrMbr = $false
  }

  if ($needGrldr -or $needGrldrMbr) {
    Write-Host "[BOOT] Downloading official GRUB4DOS 0.4.6a Legacy BIOS bootloader (~300 KB)..." -ForegroundColor Cyan
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $tmpG4d = Join-Path $env:TEMP ("aether-g4d-" + [Guid]::NewGuid().ToString("N").Substring(0, 8))
    New-Item -ItemType Directory -Path $tmpG4d -Force | Out-Null
    try {
      $g4dUrl = "https://github.com/chenall/grub4dos/releases/download/2020-08-09-0da21fe/grub4dos-0.4.6a-2020-08-09.7z"
      $g4dArchive = Join-Path $tmpG4d "grub4dos.7z"
      Invoke-WebRequest -Uri $g4dUrl -OutFile $g4dArchive -UseBasicParsing

      $sevenZip = $null
      foreach ($c in @("C:\Program Files\7-Zip\7z.exe", "C:\Program Files (x86)\7-Zip\7z.exe")) {
        if (Test-Path -LiteralPath $c) { $sevenZip = $c; break }
      }
      if (-not $sevenZip) {
        $cmd7z = Get-Command "7z.exe" -ErrorAction SilentlyContinue
        if ($cmd7z) { $sevenZip = $cmd7z.Source }
      }
      if (-not $sevenZip) {
        Write-Host "[BOOT] Fetching official 7zr.exe extractor (600 KB, temporary)..." -ForegroundColor Cyan
        $sevenZip = Join-Path $tmpG4d "7zr.exe"
        Invoke-WebRequest -Uri "https://www.7-zip.org/a/7zr.exe" -OutFile $sevenZip -UseBasicParsing
      }

      $g4dExtract = Join-Path $tmpG4d "out"
      New-Item -ItemType Directory -Path $g4dExtract -Force | Out-Null
      & $sevenZip x "$g4dArchive" "-o$g4dExtract" -y | Out-Null
      if ($LASTEXITCODE -ne 0) { throw "7-Zip failed to extract GRUB4DOS archive (exit code $LASTEXITCODE)." }

      $grldrSrc = Get-ChildItem -Path $g4dExtract -File -Recurse | Where-Object { $_.Name -eq "grldr" } | Select-Object -First 1
      $grldrMbrSrc = Get-ChildItem -Path $g4dExtract -File -Recurse | Where-Object { $_.Name -eq "grldr.mbr" } | Select-Object -First 1

      if ($grldrSrc) { Copy-Item -LiteralPath $grldrSrc.FullName -Destination "C:\grldr" -Force }
      if ($grldrMbrSrc) {
        Copy-Item -LiteralPath $grldrMbrSrc.FullName -Destination "C:\grldr.mbr" -Force
      } else {
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/pbatard/rufus/master/res/grub/grldr.mbr" -OutFile "C:\grldr.mbr" -UseBasicParsing
      }
    } finally {
      Remove-Item -LiteralPath $tmpG4d -Recurse -Force -ErrorAction SilentlyContinue
    }
  }

  if ((-not (Test-Path -LiteralPath "C:\grldr")) -or ((Get-Item -LiteralPath "C:\grldr").Length -lt 100000)) {
    throw "Failed to install C:\grldr. Check your internet connection or place grldr + grldr.mbr next to this script."
  }
  if ((-not (Test-Path -LiteralPath "C:\grldr.mbr")) -or ((Get-Item -LiteralPath "C:\grldr.mbr").Length -ne 8192)) {
    throw "Failed to install C:\grldr.mbr (expected 8192 bytes)."
  }
  Write-Host "[OK] GRUB4DOS 0.4.6a bootloader ready at C:\grldr and C:\grldr.mbr." -ForegroundColor Green

  $ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
  $defaultIdx = if ($ReplaceWindows -and ($ramBytes -ge ([int64]3500 * 1MB))) { 1 } else { 0 }

  $menuLines = @(
    "timeout 8",
    "default $defaultIdx",
    "",
    "title AetherOS 1.0 LTS (Live Desktop & Installer - Direct Boot)",
    "find --set-root --ignore-floppies /live/vmlinuz",
    "kernel /live/vmlinuz boot=live components quiet splash",
    "initrd /live/initrd.img",
    "",
    "title AetherOS 1.0 LTS (Full RAM Mode - Safe to Replace Windows)",
    "find --set-root --ignore-floppies /live/vmlinuz",
    "kernel /live/vmlinuz boot=live toram components quiet splash",
    "initrd /live/initrd.img",
    "",
    "title AetherOS 1.0 LTS (Safe Graphics Mode - nomodeset)",
    "find --set-root --ignore-floppies /live/vmlinuz",
    "kernel /live/vmlinuz boot=live components nomodeset",
    "initrd /live/initrd.img",
    "",
    "title Return to Windows Boot Manager",
    "find --set-root --ignore-floppies /bootmgr",
    "chainloader /bootmgr",
    ""
  )
  [System.IO.File]::WriteAllText("C:\menu.lst", ($menuLines -join "`n"), (New-Object System.Text.ASCIIEncoding))
  Write-Host "[OK] Wrote C:\menu.lst (Default entry: #$defaultIdx)." -ForegroundColor Green

  Write-Host "[BOOT] Registering AetherOS in Windows Boot Manager (Legacy BIOS BCD)..." -ForegroundColor Cyan
  Remove-OldAetherBcdEntries
  $createOut = (& bcdedit /create /d "AetherOS 1.0 LTS (No-Pendrive)" /application bootsector) -join "`n"
  if ($createOut -match '(\{[0-9a-fA-F\-]+\})') { $biosGuid = $Matches[1] } else { throw "Failed to create Legacy BIOS BCD entry: $createOut" }
  & bcdedit /set $biosGuid device "partition=C:" | Out-Null
  & bcdedit /set $biosGuid path "\grldr.mbr" | Out-Null
  & bcdedit /displayorder $biosGuid /addlast | Out-Null
  & bcdedit /timeout 10 | Out-Null
  & bcdedit /set '{bootmgr}' displaybootmenu yes | Out-Null

  Write-Host "[READY] AetherOS 1.0 LTS staged for Legacy BIOS + MBR on C:\! Click Start -> Restart and select 'AetherOS 1.0 LTS (No-Pendrive)'." -ForegroundColor Green
  exit 0
}

# BRANCH B: UEFI MODE
if ($disk.PartitionStyle -eq "MBR" -and $allParts.Count -ge 4) {
  Restore-CDriveUnallocated
  $allParts | Format-Table PartitionNumber, DriveLetter, Type, @{N='SizeGB';E={[Math]::Round($_.Size/1GB,2)}} -AutoSize | Out-String | Write-Host
  throw "Disk $($disk.Number) is MBR and already has $($allParts.Count)/4 primary partitions (MBR hardware limit = 4). Any unallocated space has been restored to C:\. Flash $IsoPath to a USB pendrive with Rufus/Ventoy, or convert Disk $($disk.Number) to GPT."
}

Write-Host "[OK] UEFI + $($disk.PartitionStyle) disk verified." -ForegroundColor Green

$existingStage = Get-Volume -FileSystemLabel "AETHER_BOOT" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingStage) {
  $stageLetter = $existingStage.DriveLetter
  if (-not $stageLetter) {
    $existingPart = $existingStage | Get-Partition | Select-Object -First 1
    $existingPart | Add-PartitionAccessPath -AssignDriveLetter
    Start-Sleep -Seconds 1
    $stageLetter = ($existingPart | Get-Volume).DriveLetter
  }
  Write-Host "[OK] Reusing existing AETHER_BOOT partition at ${stageLetter}: (formatting fresh FAT32)..." -ForegroundColor Green
  Format-Volume -DriveLetter $stageLetter -FileSystem FAT32 -NewFileSystemLabel "AETHER_BOOT" -Confirm:$false | Out-Null
  $stageDrive = "${stageLetter}:"
} else {
  $disk = Get-Disk -Number $cPart.DiskNumber
  $minStageBytes = [int64]2500 * 1MB
  $targetStageBytes = [int64]3500 * 1MB

  if ($disk.LargestFreeExtent -ge $minStageBytes) {
    Write-Host "[OK] Found $([Math]::Round($disk.LargestFreeExtent / 1GB, 2)) GB unallocated space on Disk $($cPart.DiskNumber) - skipping C:\ shrink." -ForegroundColor Green
  } else {
    $supported = Get-PartitionSupportedSize -DriveLetter C
    $shrinkBytes = if ($ReplaceWindows) { [int64]4200 * 1MB } else { [int64]([Math]::Max($AllocateGB, 20)) * 1GB }
    $maxShrinkBytes = $cPart.Size - $supported.SizeMin
    if ($maxShrinkBytes -lt $shrinkBytes) {
      $availGB = [Math]::Floor($maxShrinkBytes / 1GB)
      $needGB = [Math]::Ceiling($shrinkBytes / 1GB)
      throw "Not enough contiguous free space on C:\ to shrink by ${needGB} GB (Windows allows max ${availGB} GB). Enter a smaller GB value or choose Mode 2."
    }
    $targetSize = $cPart.Size - $shrinkBytes
    Write-Host "[DISK] Shrinking C:\ by $([Math]::Round($shrinkBytes / 1GB, 1)) GB..." -ForegroundColor Yellow
    Resize-Partition -DriveLetter C -Size $targetSize
    Start-Sleep -Seconds 2
    Update-HostStorageCache
    $disk = Get-Disk -Number $cPart.DiskNumber
  }

  Write-Host "[DISK] Creating FAT32 staging partition (AETHER_BOOT)..." -ForegroundColor Yellow
  if ($ReplaceWindows -or $disk.LargestFreeExtent -le ([int64]5 * 1GB)) {
    $stagePart = New-Partition -DiskNumber $cPart.DiskNumber -UseMaximumSize -AssignDriveLetter
  } else {
    $createSize = [Math]::Min($targetStageBytes, $disk.LargestFreeExtent - ([int64]16 * 1MB))
    $stagePart = New-Partition -DiskNumber $cPart.DiskNumber -Size $createSize -AssignDriveLetter
  }
  Start-Sleep -Seconds 1
  Format-Volume -DriveLetter $stagePart.DriveLetter -FileSystem FAT32 -NewFileSystemLabel "AETHER_BOOT" -Confirm:$false | Out-Null
  $stageDrive = "$($stagePart.DriveLetter):"
  Write-Host "[OK] Staging partition ready at $stageDrive" -ForegroundColor Green
}

Write-Host "[ISO] Mounting ISO and copying AetherOS live image to $stageDrive (1-2 minutes)..." -ForegroundColor Cyan
$mountInfo = Mount-AetherIsoDrive -Path $IsoPath
try {
  $isoDrive = $mountInfo.Drive
  $live = Find-AetherIsoLiveFiles -IsoDrive $isoDrive
  Copy-Item -Path "$isoDrive\*" -Destination "$stageDrive\" -Recurse -Force
  Get-ChildItem -LiteralPath "$stageDrive\live" -File -ErrorAction SilentlyContinue | ForEach-Object { $_.IsReadOnly = $false }
  if (-not (Test-Path -LiteralPath "$stageDrive\live\filesystem.squashfs")) {
    $copiedSquash = Get-ChildItem -LiteralPath "$stageDrive\live" -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -imatch '\.(squashfs|squ)$' -or ($_.Name -imatch '^filesys' -and $_.Length -gt 10MB) -or $_.Length -gt 100MB } | Sort-Object Length -Descending | Select-Object -First 1
    if ($copiedSquash) { Rename-Item -LiteralPath $copiedSquash.FullName -NewName "filesystem.squashfs" -Force }
  }
} finally {
  if ($mountInfo.WeMounted) {
    Dismount-DiskImage -ImagePath $IsoPath -ErrorAction SilentlyContinue | Out-Null
  }
}
Write-Host "[OK] AetherOS boot files copied to $stageDrive." -ForegroundColor Green

$efiPath = "\EFI\BOOT\BOOTX64.EFI"
if (-not (Test-Path -LiteralPath "$stageDrive$efiPath")) {
  $altEfi = Get-ChildItem -Path "$stageDrive\EFI" -Filter "*.efi" -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($altEfi) {
    $efiPath = $altEfi.FullName.Substring(2)
  } else {
    throw "Loose \EFI\BOOT\BOOTX64.EFI was not found in this older ISO image. Re-run the updated GitHub workflow once to include loose EFI/BOOT/BOOTX64.EFI, OR flash this ISO to a USB drive with Rufus/Ventoy."
  }
}

Write-Host "[BOOT] Registering AetherOS UEFI firmware boot entry ($stageDrive$efiPath)..." -ForegroundColor Cyan
Remove-OldAetherBcdEntries
$copyOut = & bcdedit /copy '{bootmgr}' /d "AetherOS 1.0 LTS Installer (No-USB)"
if ($copyOut -match '(\{[0-9a-fA-F\-]+\})') { $efiGuid = $Matches[1] } else { throw "Failed to create UEFI boot entry: $copyOut" }
& bcdedit /set $efiGuid device "partition=$stageDrive" | Out-Null
& bcdedit /set $efiGuid path $efiPath | Out-Null
try {
  & bcdedit /set '{fwbootmgr}' displayorder $efiGuid /addfirst | Out-Null
} catch {
  & bcdedit /displayorder $efiGuid /addfirst | Out-Null
}

Write-Host "[READY] AetherOS 1.0 LTS staged on $stageDrive! Restart PC (disable Secure Boot in BIOS if prompted)." -ForegroundColor Green
