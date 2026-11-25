import type { HardwareDriverItem, SystemSettingsState, UsbPortDevice } from './types';

export function buildInitialDrivers(
  gpuVendor: SystemSettingsState['gpuVendor']
): HardwareDriverItem[] {
  const gpuRow: HardwareDriverItem =
    gpuVendor === 'NVIDIA'
      ? {
          id: 'drv-gpu',
          category: 'Graphics',
          name: 'NVIDIA RTX Proprietary Driver + NVENC/Vulkan',
          deviceHardware: 'NVIDIA GeForce RTX Series (PCIe 4.0 x16)',
          packageName: 'nvidia-driver + nvidia-vulkan-icd + nvenc',
          version: '565.57.01 DKMS',
          status: 'Needs Auto-Install',
          autoDetected: true,
        }
      : gpuVendor === 'Intel'
        ? {
            id: 'drv-gpu',
            category: 'Graphics',
            name: 'Intel Arc / Iris Xe Mesa ANV Vulkan + QuickSync',
            deviceHardware: 'Intel Integrated / Arc GPU (i915 / Xe)',
            packageName: 'mesa-vulkan-drivers + intel-media-va-driver',
            version: 'Mesa 24.2.6',
            status: 'Update Available',
            autoDetected: true,
          }
        : {
            id: 'drv-gpu',
            category: 'Graphics',
            name: 'AMD Radeon RADV Vulkan + VCN Video Hardware Engine',
            deviceHardware: 'AMD Radeon RDNA Graphics (amdgpu)',
            packageName: 'mesa-vulkan-drivers + firmware-amd-graphics + mesa-va-drivers',
            version: 'Mesa 24.2.6',
            status: 'Update Available',
            autoDetected: true,
          };

  return [
    gpuRow,
    {
      id: 'drv-display',
      category: 'Display',
      name: 'Wayland DRM/KMS HiDPI, 120Hz & DDC/CI Monitor Control',
      deviceHardware: '2560×1440 Primary + External HDMI/DP Output',
      packageName: 'xwayland + ddcutil + colord',
      version: 'Linux 6.12 KMS',
      status: 'Installed & Active',
      autoDetected: true,
    },
    {
      id: 'drv-audio',
      category: 'Audio',
      name: 'PipeWire HD Audio + Realtek ALC / HDMI / Bluetooth LDAC',
      deviceHardware: 'Realtek ALC1220 HD Audio + HDMI Display Audio',
      packageName: 'pipewire-audio + wireplumber + firmware-sof-signed',
      version: 'PipeWire 1.2.4',
      status: 'Needs Auto-Install',
      autoDetected: true,
    },
    {
      id: 'drv-network',
      category: 'Network & Bluetooth',
      name: 'Wi-Fi 6E & Bluetooth 5.3 Unified Firmware Pack',
      deviceHardware: 'Intel AX210 / Realtek RTL8852BE Wireless Controller',
      packageName: 'firmware-iwlwifi + firmware-realtek + bluez',
      version: '20241110-backports',
      status: 'Installed & Active',
      autoDetected: true,
    },
    {
      id: 'drv-usb-input',
      category: 'USB & Input',
      name: 'USB 3.2 xHCI Host, NTFS3 Auto-Mount & Pen Tablet Driver',
      deviceHardware: 'USB 3.2 Gen 2 Controller + Wacom / XP-Pen HID',
      packageName: 'xhci_hcd + ntfs3 + xserver-xorg-input-wacom + libinput',
      version: 'Kernel 6.12 LTS',
      status: 'Installed & Active',
      autoDetected: true,
    },
  ];
}

export const INITIAL_USB_PORTS: UsbPortDevice[] = [
  {
    id: 'usb-c-1',
    portLabel: 'Port 1 · USB-C 3.2 Gen 2',
    standard: 'USB-C 3.2 Gen 2',
    maxSpeed: '10 Gbps',
    connectedDevice: 'SanDisk Extreme NVMe (Windows_Data NTFS)',
    deviceKind: 'Storage (NTFS)',
    status: 'Working (OK)',
    powerDrawMa: 896,
  },
  {
    id: 'usb-a-1',
    portLabel: 'Port 2 · USB-A 3.2 (Rear)',
    standard: 'USB-A 3.2 Gen 1',
    maxSpeed: '5 Gbps',
    connectedDevice: 'Wacom Intuos Pro Pen Tablet',
    deviceKind: 'Pen Tablet',
    status: 'Working (OK)',
    powerDrawMa: 340,
  },
  {
    id: 'usb-a-2',
    portLabel: 'Port 3 · USB-A 3.2 (Rear)',
    standard: 'USB-A 3.2 Gen 1',
    maxSpeed: '5 Gbps',
    connectedDevice: 'Focusrite Scarlett Solo USB Audio DAC',
    deviceKind: 'Audio DAC',
    status: 'Working (OK)',
    powerDrawMa: 500,
  },
  {
    id: 'usb-a-3',
    portLabel: 'Port 4 · USB-A 2.0 (Front)',
    standard: 'USB-A 2.0',
    maxSpeed: '480 Mbps',
    connectedDevice: 'Logitech Unifying Wireless Mouse/Keyboard',
    deviceKind: 'Input HID',
    status: 'Working (OK)',
    powerDrawMa: 98,
  },
  {
    id: 'usb-c-2',
    portLabel: 'Port 5 · USB-C PD (Side)',
    standard: 'USB-C PD',
    maxSpeed: '10 Gbps · 65W PD',
    connectedDevice: null,
    deviceKind: 'Empty',
    status: 'Ready (Empty)',
    powerDrawMa: 0,
  },
];

export function installDriverById(
  drivers: HardwareDriverItem[],
  driverId: string
): HardwareDriverItem[] {
  return drivers.map((d) =>
    d.id === driverId ? { ...d, status: 'Installed & Active' } : d
  );
}

export function autoInstallAllDrivers(
  drivers: HardwareDriverItem[]
): { drivers: HardwareDriverItem[]; installedCount: number } {
  let installedCount = 0;
  const next = drivers.map((d) => {
    if (d.status !== 'Installed & Active') {
      installedCount++;
      return { ...d, status: 'Installed & Active' as const };
    }
    return d;
  });
  return { drivers: next, installedCount };
}

export function testUsbPort(
  ports: UsbPortDevice[],
  portId: string,
  timestamp = 'Just now'
): UsbPortDevice[] {
  return ports.map((p) => {
    if (p.id !== portId) return p;
    if (!p.connectedDevice) {
      return { ...p, status: 'Ready (Empty)', lastTested: `${timestamp} · 5V Bus OK` };
    }
    return {
      ...p,
      status: 'Verified',
      lastTested: `${timestamp} · Link & Power OK`,
    };
  });
}

export function ejectUsbPort(ports: UsbPortDevice[], portId: string): UsbPortDevice[] {
  return ports.map((p) =>
    p.id === portId && p.connectedDevice
      ? {
          ...p,
          status: 'Safely Ejected',
          powerDrawMa: 0,
          lastTested: 'Safe to unplug',
        }
      : p
  );
}

export function rescanUsbPorts(ports: UsbPortDevice[]): UsbPortDevice[] {
  return ports.map((p) => {
    if (!p.connectedDevice) {
      return { ...p, status: 'Ready (Empty)', lastTested: 'Bus OK' };
    }
    if (p.status === 'Safely Ejected') {
      return {
        ...p,
        status: 'Working (OK)',
        powerDrawMa: p.deviceKind === 'Storage (NTFS)' ? 896 : 300,
        lastTested: 'Re-mounted automatically',
      };
    }
    return { ...p, status: 'Working (OK)', lastTested: 'Bus Verified' };
  });
}

export interface NoUsbMigrationConfig {
  windowsFreeGb: number;
  allocateGb: number;
  bitLockerEnabled: boolean;
  uefiMode: boolean;
  keepWindowsDualBoot: boolean;
  importWindowsUserFiles: boolean;
}

export interface NoUsbMigrationReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  windowsRemainingGb: number;
  bootMethod: string;
}

export function evaluateNoUsbMigrationReadiness(
  cfg: NoUsbMigrationConfig
): NoUsbMigrationReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!cfg.uefiMode) {
    blockers.push('UEFI GPT firmware is required for zero-pendrive BCD/GRUB2-EFI boot staging.');
  }
  if (cfg.bitLockerEnabled) {
    blockers.push('Suspend Windows BitLocker temporarily before shrinking C:\\ so NTFS resizes safely.');
  }
  if (cfg.allocateGb < 32) {
    blockers.push('Allocate at least 32 GB for AetherOS + Adobe Wine prefixes.');
  }
  const windowsRemainingGb = cfg.windowsFreeGb - cfg.allocateGb;
  if (windowsRemainingGb < 20) {
    blockers.push('Keep at least 20 GB free on Windows C:\\ to avoid Windows boot errors.');
  }
  if (!cfg.keepWindowsDualBoot) {
    warnings.push(
      'Replace-Windows mode will wipe C:\\ after rebooting into the staged AetherOS RAM installer. Back up critical files first.'
    );
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    windowsRemainingGb: Math.max(0, windowsRemainingGb),
    bootMethod: cfg.keepWindowsDualBoot
      ? 'Windows UEFI Boot Manager + GRUB2 Dual-Boot Entry (No USB Pendrive)'
      : 'Staged EFI RAM-Boot Installer (Auto-replaces Windows on reboot, No USB Pendrive)',
  };
}
