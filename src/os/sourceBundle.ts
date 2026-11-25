import archSpec from '../../os-src/arch/system-architecture.md?raw';
import buildIsoSh from '../../os-src/build/build-iso.sh?raw';
import grubCfg from '../../os-src/build/grub.cfg?raw';
import desktopShellQml from '../../os-src/desktop/qml/DesktopShell.qml?raw';
import taskbarQml from '../../os-src/desktop/qml/Taskbar.qml?raw';
import zeroTerminalHandlersSh from '../../os-src/desktop/aether-zero-terminal-handlers.sh?raw';
import autoDriversSh from '../../os-src/drivers/aether-auto-drivers.sh?raw';
import adobeManagerPy from '../../os-src/adobe-manager/adobe_compat_manager.py?raw';
import installerPy from '../../os-src/installer/calamares_installer.py?raw';
import noUsbWindowsPs1 from '../../os-src/installer/AetherOS-Windows-NoUSB-Installer.ps1?raw';
import doubleClickWindowsBat from '../../os-src/installer/Install-AetherOS-DoubleClick.bat?raw';
import windowsDrivesMountSh from '../../os-src/storage/aether-windows-drives-automount.sh?raw';
import nftablesConf from '../../os-src/security/nftables.conf?raw';
import testQemuSh from '../../os-src/testing/test-qemu.sh?raw';
import compatMatrixMd from '../../os-src/docs/COMPATIBILITY_MATRIX.md?raw';
import troubleshootingMd from '../../os-src/docs/TROUBLESHOOTING.md?raw';

export interface OsSourceArtifact {
  id: string;
  path: string;
  fileName: string;
  category: 'Architecture' | 'ISO Build & Boot' | 'Qt 6 / QML Desktop' | 'Adobe Manager' | 'Installer & Security' | 'Testing & Docs';
  language: 'markdown' | 'bash' | 'qml' | 'python' | 'conf';
  summary: string;
  content: string;
}

export const OS_SOURCE_ARTIFACTS: OsSourceArtifact[] = [
  {
    id: 'arch-spec',
    path: 'os-src/arch/system-architecture.md',
    fileName: 'system-architecture.md',
    category: 'Architecture',
    language: 'markdown',
    summary: 'Complete Debian Stable Minimal + Linux 6.12 LTS architecture, Wayland/Qt6 shell, Adobe Wine subsystem, and security blueprint.',
    content: archSpec,
  },
  {
    id: 'build-iso',
    path: 'os-src/build/build-iso.sh',
    fileName: 'build-iso.sh',
    category: 'ISO Build & Boot',
    language: 'bash',
    summary: 'Reproducible Debian Bookworm debootstrap, Linux LTS kernel, SquashFS (zstd), and hybrid UEFI/BIOS GRUB2 ISO builder.',
    content: buildIsoSh,
  },
  {
    id: 'grub-cfg',
    path: 'os-src/build/grub.cfg',
    fileName: 'grub.cfg',
    category: 'ISO Build & Boot',
    language: 'conf',
    summary: 'Dual UEFI (shim-signed Secure Boot) & Legacy BIOS GRUB2 bootloader menu with Plymouth splash, Safe Graphics, and Recovery entries.',
    content: grubCfg,
  },
  {
    id: 'desktop-qml',
    path: 'os-src/desktop/qml/DesktopShell.qml',
    fileName: 'DesktopShell.qml',
    category: 'Qt 6 / QML Desktop',
    language: 'qml',
    summary: 'Qt 6.7 / QML main desktop shell implementing Mica/Acrylic materials, desktop grid, snap layouts, and software brightness.',
    content: desktopShellQml,
  },
  {
    id: 'taskbar-qml',
    path: 'os-src/desktop/qml/Taskbar.qml',
    fileName: 'Taskbar.qml',
    category: 'Qt 6 / QML Desktop',
    language: 'qml',
    summary: 'Qt 6 / QML centered Windows 11-inspired taskbar with Start button, pinned apps, Quick Settings trigger, and system clock.',
    content: taskbarQml,
  },
  {
    id: 'zero-terminal-handlers',
    path: 'os-src/desktop/aether-zero-terminal-handlers.sh',
    fileName: 'aether-zero-terminal-handlers.sh',
    category: 'Qt 6 / QML Desktop',
    language: 'bash',
    summary: 'Registers Windows-style double-click 1-click installers (.exe, .msi, .deb, .AppImage) and File Manager bulk Font install (Linux + Adobe Wine sync).',
    content: zeroTerminalHandlersSh,
  },
  {
    id: 'adobe-py',
    path: 'os-src/adobe-manager/adobe_compat_manager.py',
    fileName: 'adobe_compat_manager.py',
    category: 'Adobe Manager',
    language: 'python',
    summary: 'Python 3 Adobe Compatibility Manager creating isolated 64-bit Wine prefixes, DXVK/VKD3D-Proton, winetricks runtimes, and .desktop launchers.',
    content: adobeManagerPy,
  },
  {
    id: 'installer-py',
    path: 'os-src/installer/calamares_installer.py',
    fileName: 'calamares_installer.py',
    category: 'Installer & Security',
    language: 'python',
    summary: 'Graphical & scripted installer backend handling GPT/MBR partitioning, dual-boot, LUKS2 encryption, and chroot GRUB installation.',
    content: installerPy,
  },
  {
    id: 'no-usb-ps1',
    path: 'os-src/installer/AetherOS-Windows-NoUSB-Installer.ps1',
    fileName: 'AetherOS-Windows-NoUSB-Installer.ps1',
    category: 'Installer & Security',
    language: 'bash',
    summary: 'Windows 10/11 PowerShell No-Pendrive direct migration script: shrinks C:\\ safely, stages AetherOS on FAT32, and adds UEFI GRUB2 boot entry.',
    content: noUsbWindowsPs1,
  },
  {
    id: 'double-click-bat',
    path: 'os-src/installer/Install-AetherOS-DoubleClick.bat',
    fileName: 'Install-AetherOS-DoubleClick.bat',
    category: 'Installer & Security',
    language: 'bash',
    summary: 'Windows 10/11 Double-Click Auto-UAC Launcher: double-click to request Admin rights and run AetherOS No-Pendrive setup without opening PowerShell manually.',
    content: doubleClickWindowsBat,
  },
  {
    id: 'windows-drives-automount',
    path: 'os-src/storage/aether-windows-drives-automount.sh',
    fileName: 'aether-windows-drives-automount.sh',
    category: 'Installer & Security',
    language: 'bash',
    summary: 'Automatically mounts every internal SSD/HDD partition (NTFS R/W, exFAT, ext4) and USB drive on boot/hotplug as familiar C:, D:, E:, F: volumes.',
    content: windowsDrivesMountSh,
  },
  {
    id: 'auto-drivers-sh',
    path: 'os-src/drivers/aether-auto-drivers.sh',
    fileName: 'aether-auto-drivers.sh',
    category: 'Installer & Security',
    language: 'bash',
    summary: 'Automatic PCI/USB hardware driver installer for NVIDIA/AMD/Intel Graphics, PipeWire HD Audio, Wi-Fi/Bluetooth, Wacom, and USB 3.2 health verification.',
    content: autoDriversSh,
  },
  {
    id: 'nftables',
    path: 'os-src/security/nftables.conf',
    fileName: 'nftables.conf',
    category: 'Installer & Security',
    language: 'conf',
    summary: 'Default-drop inbound nftables host firewall preserving loopback, stateful return traffic, and local NAS mDNS discovery.',
    content: nftablesConf,
  },
  {
    id: 'test-qemu',
    path: 'os-src/testing/test-qemu.sh',
    fileName: 'test-qemu.sh',
    category: 'Testing & Docs',
    language: 'bash',
    summary: 'QEMU/KVM verification script testing UEFI (OVMF) and Legacy BIOS boot, VirtIO-GPU OpenGL/Vulkan, audio, networking, and virtual disk install.',
    content: testQemuSh,
  },
  {
    id: 'compat-matrix',
    path: 'os-src/docs/COMPATIBILITY_MATRIX.md',
    fileName: 'COMPATIBILITY_MATRIX.md',
    category: 'Testing & Docs',
    language: 'markdown',
    summary: 'Honest version-by-version Linux compatibility report for Photoshop, Illustrator, Lightroom, Audition, Premiere Pro, After Effects, and Media Encoder.',
    content: compatMatrixMd,
  },
  {
    id: 'troubleshooting',
    path: 'os-src/docs/TROUBLESHOOTING.md',
    fileName: 'TROUBLESHOOTING.md',
    category: 'Testing & Docs',
    language: 'markdown',
    summary: 'Diagnostic playbooks for hybrid NVIDIA/Intel graphics, Photoshop DXVK canvas, Windows font rendering, NTFS dual-boot, and Secure Boot MOK.',
    content: troubleshootingMd,
  },
];

export function buildSelfExtractingBundleScript(): string {
  const lines: string[] = [
    '#!/usr/bin/env bash',
    '# AetherOS 1.0 LTS — Self-Extracting Complete OS Source & ISO Build Bundle',
    '# Run: bash aetheros-source-bundle.sh && cd aetheros-src/build && sudo ./build-iso.sh',
    'set -euo pipefail',
    'ROOT_DIR="aetheros-src"',
    'echo "Extracting AetherOS source tree into ./${ROOT_DIR}..."',
  ];

  for (const artifact of OS_SOURCE_ARTIFACTS) {
    const relPath = artifact.path.replace(/^os-src\//, '');
    const dirName = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
    if (dirName) {
      lines.push(`mkdir -p "\${ROOT_DIR}/${dirName}"`);
    }
    const marker = `EOF_${artifact.id.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
    lines.push(`cat <<'${marker}' > "\${ROOT_DIR}/${relPath}"`);
    lines.push(artifact.content.trimEnd());
    lines.push(marker);
    if (artifact.language === 'bash' || artifact.language === 'python') {
      lines.push(`chmod +x "\${ROOT_DIR}/${relPath}"`);
    }
  }

  lines.push('echo "Done! Next step on a Debian/Ubuntu x86_64 host:"');
  lines.push('echo "  cd ${ROOT_DIR}/build && sudo ./build-iso.sh"');
  return lines.join('\n') + '\n';
}
