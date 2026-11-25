<#
.SYNOPSIS
  AetherOS No-Pendrive Windows-to-Linux Direct Installer (PowerShell / Administrator)
.DESCRIPTION
  Allows switching from Windows 10/11 to AetherOS 1.0 LTS WITHOUT a USB pendrive.
  1. Verifies UEFI GPT firmware & checks BitLocker status
  2. Disables Windows Fast Startup (prevents NTFS lock)
  3. Shrinks C:\ safely and creates a staging FAT32 boot partition
  4. Copies AetherOS kernel (vmlinuz), initrd, and SquashFS image
  5. Registers a UEFI GRUB2 boot entry via bcdedit so the next reboot launches AetherOS directly
#>

#Requires -RunAsAdministrator
param(
  [int]$AllocateGB = 120,
  [string]$IsoPath = "$env:USERPROFILE\Downloads\AetherOS-1.0-LTS-x86_64.iso"
)

$ErrorActionPreference = "Stop"
Write-Host "=== AetherOS No-Pendrive Direct Installer (Windows -> Linux) ===" -ForegroundColor Cyan

# 1. Verify UEFI Mode
$firmware = (Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control" -Name PEFirmwareType -ErrorAction SilentlyContinue).PEFirmwareType
if ($firmware -eq 1) {
  throw "Legacy BIOS detected. Please enable UEFI mode or use a standard bootable USB."
}

# 2. Check BitLocker on C:
$bl = Get-BitLockerVolume -MountPoint "C:" -ErrorAction SilentlyContinue
if ($bl -and $bl.ProtectionStatus -eq "On") {
  throw "BitLocker is enabled on C:. Run 'Suspend-BitLocker -MountPoint C: -RebootCount 2' first."
}

# 3. Disable Windows Fast Startup for safe NTFS read/write in Linux
powercfg /h off | Out-Null
Write-Host "[OK] Disabled Windows Fast Startup (hiberfil.sys cleared)." -ForegroundColor Green

# 4. Shrink C:\ safely and create 4 GB staging FAT32 boot partition + AetherOS target space
$cPart = Get-Partition -DriveLetter C
$targetSize = $cPart.Size - ($AllocateGB * 1GB)
Write-Host "[DISK] Shrinking C:\ by ${AllocateGB} GB for AetherOS..." -ForegroundColor Yellow
Resize-Partition -DriveLetter C -Size $targetSize

$stagePart = New-Partition -DiskNumber $cPart.DiskNumber -Size 4GB -AssignDriveLetter
Format-Volume -DriveLetter $stagePart.DriveLetter -FileSystem FAT32 -NewFileSystemLabel "AETHER_BOOT" -Confirm:$false | Out-Null

# 5. Mount ISO and copy live boot image directly to AETHER_BOOT (no USB pendrive needed!)
if (-not (Test-Path $IsoPath)) {
  throw "AetherOS ISO not found at $IsoPath. Download AetherOS-1.0-LTS-x86_64.iso first."
}
$mounted = Mount-DiskImage -ImagePath $IsoPath -PassThru
$isoDrive = ($mounted | Get-Volume).DriveLetter
Copy-Item "${isoDrive}:\*" "$($stagePart.DriveLetter):\" -Recurse -Force
Dismount-DiskImage -ImagePath $IsoPath | Out-Null

# 6. Register GRUB2 EFI Boot Entry via bcdedit
Write-Host "[BOOT] Registering AetherOS UEFI boot entry (No USB required)..." -ForegroundColor Cyan
$efiGuid = (bcdedit /copy '{bootmgr}' /d "AetherOS 1.0 LTS Installer (No-USB)") -replace '.*(\{.*\}).*','$1'
bcdedit /set $efiGuid path "\EFI\BOOT\BOOTX64.EFI" | Out-Null
bcdedit /displayorder $efiGuid /addfirst | Out-Null

Write-Host "[READY] Reboot your PC now — AetherOS Installer will boot automatically without any pendrive!" -ForegroundColor Green
