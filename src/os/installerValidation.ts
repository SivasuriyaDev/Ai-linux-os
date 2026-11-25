export type PartitionMode = 'automatic' | 'dual-boot' | 'manual';
export type FirmwareMode = 'uefi' | 'bios';

export interface PartitionSlice {
  device: string;
  label: string;
  filesystem: 'FAT32 (EFI)' | 'ext4' | 'ext4 (LUKS2)' | 'NTFS (Windows 11)' | 'linux-swap';
  mountPoint: string;
  sizeGb: number;
  color: string;
}

export interface InstallerUserConfig {
  fullName: string;
  username: string;
  hostname: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof InstallerUserConfig, string>>;
}

export function calculatePartitionLayout(
  totalDiskGb: number,
  mode: PartitionMode,
  firmware: FirmwareMode,
  luksEncrypt: boolean,
  aetherShareGb: number
): PartitionSlice[] {
  const rootFs: PartitionSlice['filesystem'] = luksEncrypt ? 'ext4 (LUKS2)' : 'ext4';
  const clampedDisk = Math.max(40, totalDiskGb);

  if (mode === 'dual-boot') {
    const efiGb = 0.5;
    const minWindowsGb = 40;
    const minAetherGb = 30;
    const safeAetherGb = Math.min(
      Math.max(aetherShareGb, minAetherGb),
      clampedDisk - minWindowsGb - efiGb
    );
    const windowsGb = Number((clampedDisk - safeAetherGb - efiGb).toFixed(1));
    return [
      {
        device: '/dev/nvme0n1p1',
        label: 'EFI System',
        filesystem: 'FAT32 (EFI)',
        mountPoint: '/boot/efi',
        sizeGb: efiGb,
        color: '#f59e0b',
      },
      {
        device: '/dev/nvme0n1p2',
        label: 'Windows 11 (Preserved)',
        filesystem: 'NTFS (Windows 11)',
        mountPoint: '/mnt/windows',
        sizeGb: windowsGb,
        color: '#64748b',
      },
      {
        device: '/dev/nvme0n1p3',
        label: 'AetherOS Root',
        filesystem: rootFs,
        mountPoint: '/',
        sizeGb: Number(safeAetherGb.toFixed(1)),
        color: '#0ea5e9',
      },
    ];
  }

  if (mode === 'manual') {
    const efiGb = firmware === 'uefi' ? 0.5 : 0;
    const swapGb = 8;
    const homeGb = Math.round((clampedDisk - efiGb - swapGb) * 0.65);
    const rootGb = Number((clampedDisk - efiGb - swapGb - homeGb).toFixed(1));
    const slices: PartitionSlice[] = [];
    if (efiGb > 0) {
      slices.push({
        device: '/dev/nvme0n1p1',
        label: 'EFI System',
        filesystem: 'FAT32 (EFI)',
        mountPoint: '/boot/efi',
        sizeGb: efiGb,
        color: '#f59e0b',
      });
    }
    slices.push(
      {
        device: '/dev/nvme0n1p2',
        label: 'AetherOS Root',
        filesystem: rootFs,
        mountPoint: '/',
        sizeGb: rootGb,
        color: '#0ea5e9',
      },
      {
        device: '/dev/nvme0n1p3',
        label: 'User Home & Wine Prefixes',
        filesystem: rootFs,
        mountPoint: '/home',
        sizeGb: homeGb,
        color: '#10b981',
      },
      {
        device: '/dev/nvme0n1p4',
        label: 'Swap / Hibernate',
        filesystem: 'linux-swap',
        mountPoint: 'swap',
        sizeGb: swapGb,
        color: '#8b5cf6',
      }
    );
    return slices;
  }

  // Automatic erase & install
  const slices: PartitionSlice[] = [];
  const efiGb = firmware === 'uefi' ? 0.5 : 0;
  if (efiGb > 0) {
    slices.push({
      device: '/dev/nvme0n1p1',
      label: 'EFI System',
      filesystem: 'FAT32 (EFI)',
      mountPoint: '/boot/efi',
      sizeGb: efiGb,
      color: '#f59e0b',
    });
  }
  slices.push({
    device: firmware === 'uefi' ? '/dev/nvme0n1p2' : '/dev/nvme0n1p1',
    label: 'AetherOS Root + ZRAM',
    filesystem: rootFs,
    mountPoint: '/',
    sizeGb: Number((clampedDisk - efiGb).toFixed(1)),
    color: '#0ea5e9',
  });
  return slices;
}

export function validateInstallerUser(user: InstallerUserConfig): ValidationResult {
  const errors: Partial<Record<keyof InstallerUserConfig, string>> = {};

  if (!user.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!user.username.trim()) {
    errors.username = 'Username is required.';
  } else if (!/^[a-z][a-z0-9_-]{1,23}$/.test(user.username)) {
    errors.username = 'Use 2–24 lowercase letters, numbers, hyphens, or underscores starting with a letter.';
  }

  if (!user.hostname.trim()) {
    errors.hostname = 'Computer hostname is required.';
  } else if (!/^[a-zA-Z0-9-]{2,32}$/.test(user.hostname)) {
    errors.hostname = 'Hostname may only contain letters, numbers, and hyphens.';
  }

  if (user.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (user.confirmPassword !== user.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
