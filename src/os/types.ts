export type AppId =
  | 'adobe-manager'
  | 'file-manager'
  | 'app-manager'
  | 'settings'
  | 'os-installer'
  | 'os-studio';

export type SnapZone =
  | 'none'
  | 'maximized'
  | 'left'
  | 'right'
  | 'two-thirds-left'
  | 'one-third-right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OSWindow {
  id: string;
  appId: AppId;
  title: string;
  desktopId: number;
  bounds: WindowBounds;
  restoreBounds: WindowBounds;
  minimized: boolean;
  snap: SnapZone;
  zIndex: number;
}

export interface VirtualDesktop {
  id: number;
  name: string;
}

export type FileKind =
  | 'folder'
  | 'exe'
  | 'msi'
  | 'zip'
  | 'image'
  | 'document'
  | 'video'
  | 'code';

export interface FsNode {
  id: string;
  name: string;
  parentId: string | null;
  kind: FileKind;
  sizeBytes: number;
  modifiedAt: string;
  content?: string;
  archiveEntries?: { name: string; kind: FileKind; sizeBytes: number; content?: string }[];
  adobeHint?: string;
  readonly?: boolean;
}

export type CompatibilityTier = 'Gold' | 'Silver' | 'Bronze' | 'Unsupported';

export type GraphicsLayer = 'DXVK 2.4.1 (Vulkan)' | 'VKD3D-Proton 2.13 (D3D12->Vulkan)' | 'OpenGL Fallback' | 'Software Mercury';

export interface AdobeVersionEntry {
  id: string;
  appName:
    | 'Adobe Photoshop'
    | 'Adobe Premiere Pro'
    | 'Adobe After Effects'
    | 'Adobe Illustrator'
    | 'Adobe Audition'
    | 'Adobe Lightroom Classic'
    | 'Adobe Media Encoder';
  shortCode: 'Ps' | 'Pr' | 'Ae' | 'Ai' | 'Au' | 'Lr' | 'Me';
  accentHex: string;
  version: string;
  tier: CompatibilityTier;
  wineRunner: string;
  graphicsLayer: GraphicsLayer;
  winVersion: 'win10' | 'win11';
  requiredRuntimes: string[];
  workingFeatures: string[];
  knownBlockers: string[];
  testedNotes: string;
}

export interface WinePrefix {
  id: string;
  profileId: string;
  appName: string;
  version: string;
  path: string;
  wineRunner: string;
  graphicsLayer: GraphicsLayer;
  winVersion: 'win10' | 'win11';
  gpuBackend: 'Intel Arc / iGPU (Mesa Vulkan)' | 'AMD Radeon RDNA (RADV Vulkan)' | 'NVIDIA RTX (Proprietary 565 Vulkan)';
  installedRuntimes: string[];
  launcherCreated: boolean;
  status: 'Ready' | 'Needs Dependencies' | 'Limited / Experimental';
  createdAt: string;
}

export interface DiagnosticCheck {
  id: string;
  label: string;
  status: 'Pass' | 'Warning' | 'Blocker';
  detail: string;
}

export type PackageFormat = 'Debian (.deb)' | 'Flatpak' | 'AppImage' | 'Wine' | 'EXE' | 'MSI';

export interface SoftwarePackage {
  id: string;
  name: string;
  publisher: string;
  version: string;
  format: PackageFormat;
  category: 'Creative' | 'Compatibility' | 'System' | 'Development';
  sizeLabel: string;
  installed: boolean;
  description: string;
}

export interface ExeInstallRequest {
  fileName: string;
  filePath: string;
  format: 'EXE' | 'MSI';
  suggestedAppId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  source: string;
  timestamp: string;
  read: boolean;
}

export type WallpaperId = 'mica-dark' | 'mica-light' | 'alpine-dusk' | 'obsidian-grid';

export interface SystemSettingsState {
  theme: 'dark' | 'light';
  wallpaper: WallpaperId;
  accentColor: 'sky' | 'indigo' | 'emerald' | 'amber';
  transparencyLevel: number; // 0 to 100
  taskbarCentered: boolean;
  wifiEnabled: boolean;
  wifiNetwork: string;
  bluetoothEnabled: boolean;
  volume: number;
  brightness: number;
  nightLight: boolean;
  powerProfile: 'Performance' | 'Balanced' | 'Power Saver';
  gpuVendor: 'Intel' | 'AMD' | 'NVIDIA';
  resolution: '2560x1440' | '1920x1080' | '3840x2160';
  refreshRate: '60 Hz' | '120 Hz' | '144 Hz';
  multiMonitorMode: 'Extend' | 'Mirror' | 'Primary Only';
  firewallEnabled: boolean;
  appArmorWineSandbox: boolean;
  autoSecurityUpdates: boolean;
  luksEncryption: boolean;
  secureBootMOK: boolean;
  ssdTrimEnabled: boolean;
  zramSwapPercent: number;
  language: string;
  keyboardLayout: string;
  timezone: string;
}
