/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FolderPlus,
  ImagePlus,
  Laptop,
  Lock,
  Palette,
  RefreshCw,
  Usb,
} from 'lucide-react';
import { AltTabSwitcher } from './components/AltTabSwitcher';
import { AppIconBadge } from './components/AppIcons';
import { ClipboardOverlay } from './components/ClipboardOverlay';
import { LockAndBootOverlay } from './components/LockAndBootOverlay';
import { NotificationCenter } from './components/NotificationCenter';
import { OneClickInstallerModal } from './components/OneClickInstallerModal';
import { QuickSettingsPanel } from './components/QuickSettingsPanel';
import { StartMenu } from './components/StartMenu';
import { Taskbar } from './components/Taskbar';
import { VirtualDesktopOverlay } from './components/VirtualDesktopOverlay';
import { WallpaperBackdrop } from './components/WallpaperBackdrop';
import { WindowFrame } from './components/WindowFrame';
import { AdobeCompatApp } from './components/apps/AdobeCompatApp';
import { AppManagerApp } from './components/apps/AppManagerApp';
import { FileManagerApp } from './components/apps/FileManagerApp';
import { FontManagerApp } from './components/apps/FontManagerApp';
import { OsInstallerApp } from './components/apps/OsInstallerApp';
import { OsStudioApp } from './components/apps/OsStudioApp';
import { SnipRecorderApp } from './components/apps/SnipRecorderApp';
import {
  SystemSettingsApp,
  type SettingsSection,
} from './components/apps/SystemSettingsApp';
import { TabletColorApp } from './components/apps/TabletColorApp';
import { TaskManagerApp } from './components/apps/TaskManagerApp';
import { TerminalApp } from './components/apps/TerminalApp';
import {
  INITIAL_WINE_PREFIXES,
  createWinePrefix,
  installMissingDependencies,
} from './os/adobeEngine';
import {
  INITIAL_CLIPBOARD_ITEMS,
  INITIAL_FONTS,
  addClipboardItem,
  addCustomFont,
  buildSystemProcesses,
  bulkInstallFontsFromFiles,
  clearUnpinnedClipboard,
  computeSystemUsage,
  removeClipboardItem,
  syncFontsToPrefixes,
  togglePinClipboardItem,
} from './os/creativeTools';
import {
  INITIAL_FS_NODES,
  INITIAL_STORAGE_VOLUMES,
  createFolder,
  deleteNode,
  extractZipArchive,
  mountNewStorageVolume,
  moveNode,
  renameNode,
} from './os/fileSystem';
import {
  INITIAL_USB_PORTS,
  autoInstallAllDrivers,
  buildInitialDrivers,
  ejectUsbPort,
  installDriverById,
  rescanUsbPorts,
  testUsbPort,
} from './os/hardwareEngine';
import { INITIAL_PACKAGES } from './os/packagesData';
import type {
  AdobeVersionEntry,
  AppId,
  ClipboardItem,
  ExeInstallRequest,
  FontEntry,
  FsNode,
  GraphicsLayer,
  HardwareDriverItem,
  NotificationItem,
  OSWindow,
  ProcessItem,
  SnapZone,
  SoftwarePackage,
  StorageVolume,
  SystemSettingsState,
  UsbPortDevice,
  VirtualDesktop,
  WinePrefix,
} from './os/types';
import {
  addVirtualDesktop,
  closeWindow,
  focusWindow,
  minimizeWindow,
  moveWindow,
  openOrFocusApp,
  removeVirtualDesktop,
  resizeWindow,
  snapWindow,
  type ViewportSize,
} from './os/windowManager';

interface DesktopShortcut {
  id: AppId;
  label: string;
  x: number;
  y: number;
}

const INITIAL_SHORTCUTS: DesktopShortcut[] = [
  { id: 'adobe-manager', label: 'Adobe Manager', x: 18, y: 18 },
  { id: 'file-manager', label: 'Files', x: 18, y: 118 },
  { id: 'app-manager', label: 'App Manager', x: 18, y: 218 },
  { id: 'os-installer', label: 'Install AetherOS', x: 18, y: 318 },
  { id: 'os-studio', label: 'OS Build Studio', x: 18, y: 418 },
  { id: 'settings', label: 'Settings', x: 18, y: 518 },
  { id: 'task-manager', label: 'Task Manager', x: 116, y: 18 },
  { id: 'terminal', label: 'Terminal', x: 116, y: 118 },
  { id: 'font-manager', label: 'Font Manager', x: 116, y: 218 },
  { id: 'tablet-color', label: 'Tablet & Color', x: 116, y: 318 },
  { id: 'snip-recorder', label: 'Snip & Record', x: 116, y: 418 },
];

const INITIAL_SETTINGS: SystemSettingsState = {
  theme: 'dark',
  wallpaper: 'mica-dark',
  customWallpaperUrl: null,
  customWallpaperFit: 'cover',
  accentColor: 'sky',
  transparencyLevel: 60,
  taskbarCentered: true,
  wifiEnabled: true,
  wifiNetwork: 'Studio-5G',
  bluetoothEnabled: true,
  volume: 76,
  brightness: 100,
  nightLight: false,
  powerProfile: 'Balanced',
  renderBoost: false,
  doNotDisturb: false,
  activeColorProfile: 'srgb',
  gpuVendor: 'AMD',
  resolution: '2560x1440',
  refreshRate: '120 Hz',
  multiMonitorMode: 'Extend',
  firewallEnabled: true,
  appArmorWineSandbox: true,
  autoSecurityUpdates: true,
  luksEncryption: true,
  secureBootMOK: true,
  ssdTrimEnabled: true,
  zramSwapPercent: 50,
  language: 'English (US)',
  keyboardLayout: 'US QWERTY',
  timezone: 'America/Los_Angeles',
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Photoshop 2021 Prefix Verified',
    body: 'DXVK 2.4.1 Vulkan translation and Microsoft VC++ 2022 runtimes are ready.',
    source: 'Adobe Compatibility Manager',
    timestamp: '08:54',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'NTFS Volume Mounted (Read/Write)',
    body: 'Windows_Data (NTFS) mounted cleanly via Linux 6.12 ntfs3 driver.',
    source: 'Storage Service',
    timestamp: '08:41',
    read: false,
  },
];

type ActiveOverlay =
  | 'none'
  | 'start'
  | 'search'
  | 'desktops'
  | 'clipboard'
  | 'quick-settings'
  | 'notifications';

export default function App() {
  const [viewport, setViewport] = useState<ViewportSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  const [sessionLock, setSessionLock] = useState<'none' | 'boot' | 'lock'>(() => {
    if (typeof window === 'undefined') return 'none';
    const params = new URLSearchParams(window.location.search);
    if (params.get('boot') === '1' && params.get('autostart') !== '1') {
      return 'boot';
    }
    return 'none';
  });

  const [settings, setSettings] = useState<SystemSettingsState>(INITIAL_SETTINGS);
  const [desktops, setDesktops] = useState<VirtualDesktop[]>([
    { id: 1, name: 'Desktop 1 · Creative' },
    { id: 2, name: 'Desktop 2 · OS Build' },
  ]);
  const [activeDesktopId, setActiveDesktopId] = useState<number>(1);
  const [windows, setWindows] = useState<OSWindow[]>(() => {
    const initial = openOrFocusApp([], 'adobe-manager', 1, {
      width: typeof window !== 'undefined' ? window.innerWidth : 1440,
      height: typeof window !== 'undefined' ? window.innerHeight : 900,
    });
    // Position neatly right of the two desktop icon columns
    const win = initial.windows[0];
    const startX = Math.max(226, Math.min(win.bounds.x + 86, (typeof window !== 'undefined' ? window.innerWidth : 1440) - win.bounds.width - 20));
    return [
      {
        ...win,
        bounds: {
          ...win.bounds,
          x: startX,
          y: Math.max(20, win.bounds.y - 10),
        },
        restoreBounds: {
          ...win.bounds,
          x: startX,
          y: Math.max(20, win.bounds.y - 10),
        },
      },
    ];
  });
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(
    () => windows[0]?.id ?? null
  );

  const [overlay, setOverlay] = useState<ActiveOverlay>('none');
  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>(INITIAL_SHORTCUTS);
  const [draggingIconId, setDraggingIconId] = useState<AppId | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Core OS subsystem state
  const [files, setFiles] = useState<FsNode[]>(INITIAL_FS_NODES);
  const [volumes, setVolumes] = useState<StorageVolume[]>(INITIAL_STORAGE_VOLUMES);
  const [fileManagerFolder, setFileManagerFolder] = useState<string>('this-pc');
  const [prefixes, setPrefixes] = useState<WinePrefix[]>(INITIAL_WINE_PREFIXES);
  const [packages, setPackages] = useState<SoftwarePackage[]>(INITIAL_PACKAGES);
  const [pendingExeRequest, setPendingExeRequest] = useState<ExeInstallRequest | null>(null);
  const [quickInstallRequest, setQuickInstallRequest] = useState<ExeInstallRequest | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Creative & Power User subsystems
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>(INITIAL_CLIPBOARD_ITEMS);
  const [fonts, setFonts] = useState<FontEntry[]>(INITIAL_FONTS);
  const [terminatedPids, setTerminatedPids] = useState<number[]>([]);
  const [priorityOverrides, setPriorityOverrides] = useState<
    Record<number, ProcessItem['priority']>
  >({});
  const [altTabOpen, setAltTabOpen] = useState(false);
  const [altTabIndex, setAltTabIndex] = useState(0);

  // Automatic Hardware Drivers, USB Ports & Desktop Refresh state
  const [drivers, setDrivers] = useState<HardwareDriverItem[]>(() =>
    buildInitialDrivers(INITIAL_SETTINGS.gpuVendor)
  );
  const [usbPorts, setUsbPorts] = useState<UsbPortDevice[]>(INITIAL_USB_PORTS);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('drivers-usb');
  const [desktopRefreshing, setDesktopRefreshing] = useState(false);
  const desktopWallpaperInputRef = useRef<HTMLInputElement>(null);
  const refreshTimerRef = useRef<number | null>(null);

  // Sync Tailwind v4 .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Track viewport resize
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const desktopWindows = useMemo(
    () => windows.filter((w) => w.desktopId === activeDesktopId),
    [windows, activeDesktopId]
  );

  const processes = useMemo(
    () =>
      buildSystemProcesses(
        windows,
        prefixes,
        settings,
        terminatedPids,
        priorityOverrides
      ),
    [windows, prefixes, settings, terminatedPids, priorityOverrides]
  );

  const systemUsage = useMemo(
    () => computeSystemUsage(processes, settings.renderBoost),
    [processes, settings.renderBoost]
  );

  const handleRefreshDesktop = () => {
    setOverlay('none');
    setContextMenu(null);
    setDesktopRefreshing(true);
    setUsbPorts((prev) => rescanUsbPorts(prev));
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      setDesktopRefreshing(false);
      refreshTimerRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Global desktop shortcuts: Escape, F5 (Desktop Refresh), Alt+V (Clipboard History), Alt+Tab (Window Switcher)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        const tag = (document.activeElement as HTMLElement | null)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          handleRefreshDesktop();
          return;
        }
      }
      if (e.key === 'Escape') {
        setOverlay('none');
        setContextMenu(null);
        setAltTabOpen(false);
        return;
      }
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setAltTabOpen(false);
        setOverlay((o) => (o === 'clipboard' ? 'none' : 'clipboard'));
        return;
      }
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        if (desktopWindows.length === 0) return;
        setOverlay('none');
        setAltTabOpen((open) => {
          if (!open) {
            setAltTabIndex(desktopWindows.length > 1 ? 1 : 0);
            return true;
          }
          setAltTabIndex((idx) => (idx + 1) % desktopWindows.length);
          return true;
        });
        return;
      }
      if (altTabOpen && e.key === 'Enter' && desktopWindows.length > 0) {
        e.preventDefault();
        const target = desktopWindows[altTabIndex % desktopWindows.length];
        if (target) {
          setWindows((prev) => focusWindow(prev, target.id));
          setFocusedWindowId(target.id);
        }
        setAltTabOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [altTabOpen, altTabIndex, desktopWindows]);

  const pushNotification = (
    title: string,
    body: string,
    source: string,
    bypassDnd = false
  ) => {
    if (settings.doNotDisturb && !bypassDnd) return;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title,
        body,
        source,
        timestamp,
        read: false,
      },
      ...prev,
    ]);
  };

  const handleCopyToClipboard = (text: string, source: string) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setClipboardItems((prev) => addClipboardItem(prev, text, source, timestamp));
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // Ignore browser clipboard permission errors in sandboxed iframes
      });
    }
  };

  const handleToggleRenderBoost = () => {
    const nextBoost = !settings.renderBoost;
    setSettings((prev) => ({
      ...prev,
      renderBoost: nextBoost,
      doNotDisturb: nextBoost,
      powerProfile: nextBoost ? 'Performance' : 'Balanced',
    }));
    if (!nextBoost) {
      pushNotification(
        'Render Boost Disabled',
        'Background indexing resumed and notifications unmuted (Balanced governor).',
        'Task Manager',
        true
      );
    }
  };

  const handleEndProcess = (proc: ProcessItem) => {
    if (!proc.killable) return;
    if (proc.windowId) {
      setWindows((prev) => closeWindow(prev, proc.windowId!));
      if (focusedWindowId === proc.windowId) setFocusedWindowId(null);
      return;
    }
    setTerminatedPids((prev) => (prev.includes(proc.pid) ? prev : [...prev, proc.pid]));
    pushNotification(
      'Process Terminated',
      `Stopped ${proc.name} (PID ${proc.pid}) and reclaimed ${proc.ramMb} MB RAM.`,
      'Task Manager'
    );
  };

  const handleSaveCapture = (entry: {
    folderId: 'pictures' | 'videos';
    fileName: string;
    kind: 'image' | 'video';
    sizeBytes: number;
    content: string;
  }) => {
    const createdNode: FsNode = {
      id: `capture-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: entry.fileName,
      kind: entry.kind,
      parentId: entry.folderId,
      sizeBytes: entry.sizeBytes,
      modifiedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      content: entry.content,
    };
    setFiles((prev) => [createdNode, ...prev]);
    pushNotification(
      entry.kind === 'image' ? 'Screenshot Saved' : 'Screen Recording Saved',
      `Saved ${entry.fileName} to ~/${entry.folderId === 'pictures' ? 'Pictures' : 'Videos'}.`,
      'Snipping Tool & Recorder'
    );
  };

  const handleLaunchApp = (appId: AppId) => {
    setOverlay('none');
    setContextMenu(null);
    const res = openOrFocusApp(windows, appId, activeDesktopId, viewport);
    setWindows(res.windows);
    setFocusedWindowId(res.focusedId);
  };

  const handleTaskbarAppClick = (appId: AppId) => {
    setOverlay('none');
    const existing = windows.find(
      (w) => w.appId === appId && w.desktopId === activeDesktopId
    );
    if (existing && existing.id === focusedWindowId && !existing.minimized) {
      setWindows((prev) => minimizeWindow(prev, existing.id));
      setFocusedWindowId(null);
      return;
    }
    handleLaunchApp(appId);
  };

  const handleUpdateSettings = (patch: Partial<SystemSettingsState>) => {
    if (patch.gpuVendor && patch.gpuVendor !== settings.gpuVendor) {
      const updatedGpuDriver = buildInitialDrivers(patch.gpuVendor)[0];
      setDrivers((prev) =>
        prev.map((d) => (d.id === 'drv-gpu' ? updatedGpuDriver : d))
      );
    }
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleUploadCustomWallpaper = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSettings((prev) => ({
          ...prev,
          wallpaper: 'custom',
          customWallpaperUrl: reader.result as string,
        }));
        pushNotification(
          'Custom Wallpaper Applied',
          `Loaded "${file.name}" as your desktop & lock-screen wallpaper.`,
          'Personalization'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInstallDriver = (driverId: string) => {
    const target = drivers.find((d) => d.id === driverId);
    setDrivers((prev) => installDriverById(prev, driverId));
    if (target) {
      pushNotification(
        `${target.category} Driver Installed`,
        `Configured ${target.packageName} (${target.deviceHardware}) with auto-loaded kernel module.`,
        'Hardware Driver Engine'
      );
    }
  };

  const handleAutoInstallAllDrivers = () => {
    const res = autoInstallAllDrivers(drivers);
    setDrivers(res.drivers);
    pushNotification(
      res.installedCount > 0
        ? `Auto-Installed ${res.installedCount} Hardware Driver${res.installedCount === 1 ? '' : 's'}`
        : 'All Device Drivers Up to Date',
      res.installedCount > 0
        ? 'Graphics, Display, Audio, Wi-Fi/BT, and USB xHCI drivers are active and verified.'
        : 'Every detected hardware driver is already installed and working.',
      'Hardware Driver Engine'
    );
  };

  const handleTestUsbPort = (portId: string) => {
    const target = usbPorts.find((p) => p.id === portId);
    setUsbPorts((prev) => testUsbPort(prev, portId));
    if (target) {
      pushNotification(
        `USB Port Verified: ${target.portLabel}`,
        `${target.connectedDevice ?? 'Port power rail'} passed xHCI ${target.standard} (${target.maxSpeed}) & ${target.powerDrawMa} mA bus health check.`,
        'USB Bus Monitor'
      );
    }
  };

  const handleEjectUsbPort = (portId: string) => {
    const target = usbPorts.find((p) => p.id === portId);
    setUsbPorts((prev) => ejectUsbPort(prev, portId));
    if (target) {
      pushNotification(
        'Safely Ejected USB Device',
        `Unmounted and powered down ${target.connectedDevice ?? 'USB device'} on ${target.portLabel}.`,
        'USB Bus Monitor'
      );
    }
  };

  const handleRescanUsbPorts = () => {
    setUsbPorts((prev) => rescanUsbPorts(prev));
    pushNotification(
      'USB Bus Rescanned',
      'Re-probed all xHCI USB 3.2 / Type-C / 2.0 host controllers.',
      'USB Bus Monitor'
    );
  };

  const handleCreatePrefix = (
    profile: AdobeVersionEntry,
    gpuBackend: WinePrefix['gpuBackend']
  ) => {
    const { prefixes: next, created } = createWinePrefix(prefixes, profile, gpuBackend);
    setPrefixes(next);
    pushNotification(
      `Wine Prefix Created`,
      `Provisioned isolated 64-bit prefix for ${created.appName} ${created.version}.`,
      'Adobe Compatibility Manager'
    );
  };

  const handleInstallRuntimes = (prefixId: string) => {
    setPrefixes((prev) => installMissingDependencies(prev, prefixId));
    pushNotification(
      'Winetricks Dependencies Installed',
      'Installed Visual C++ 2022, msxml6, gdiplus, corefonts, and Vulkan translation layers.',
      'Adobe Compatibility Manager'
    );
  };

  const handleUpdatePrefixGraphics = (prefixId: string, layer: GraphicsLayer) => {
    setPrefixes((prev) =>
      prev.map((p) => (p.id === prefixId ? { ...p, graphicsLayer: layer } : p))
    );
  };

  const handleCreateLauncher = (prefixId: string) => {
    setPrefixes((prev) =>
      prev.map((p) => (p.id === prefixId ? { ...p, launcherCreated: true } : p))
    );
    pushNotification(
      'Desktop Launcher Generated',
      'Saved freedesktop .desktop entry under ~/.local/share/applications/.',
      'Adobe Compatibility Manager'
    );
  };

  const handleDeletePrefix = (prefixId: string) => {
    setPrefixes((prev) => prev.filter((p) => p.id !== prefixId));
  };

  const handleExtractZip = (zipNodeId: string) => {
    const res = extractZipArchive(files, zipNodeId);
    if (res.extractedFolder) {
      setFiles(res.nodes);
      pushNotification(
        'ZIP Archive Extracted',
        `Unpacked ${res.extractedCount} files into "${res.extractedFolder.name}".`,
        'Files'
      );
    }
  };

  const handleLaunchExeInstaller = (req: ExeInstallRequest) => {
    setQuickInstallRequest(req);
  };

  const handleCompleteExeInstall = (config: {
    fileName: string;
    format: ExeInstallRequest['format'];
    prefixName: string;
    useDxvk: boolean;
    winVersion: 'win10' | 'win11';
    installVcRun: boolean;
  }) => {
    const cleanName = config.fileName
      .replace(/\.(exe|msi|deb|appimage)$/i, '')
      .replace(/[_-]+(setup|installer|x64|x86_64|amd64)$/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();
    const isWine = config.format === 'EXE' || config.format === 'MSI';
    const newPkg: SoftwarePackage = {
      id: `pkg-inst-${Date.now()}`,
      name: isWine ? `${cleanName} (Wine)` : cleanName,
      publisher: isWine
        ? `Isolated Prefix: ${config.prefixName}`
        : config.format === 'AppImage'
          ? 'Auto-integrated ~/Applications'
          : 'Debian APT Auto-Resolver',
      version: isWine ? config.winVersion : 'Latest',
      format: config.format,
      category: 'Creative',
      sizeLabel: isWine
        ? config.useDxvk
          ? 'DXVK Enabled'
          : 'OpenGL'
        : '1-Click Installed',
      installed: true,
      description: isWine
        ? `Installed via AetherOS 1-Click ${config.format} workflow in ~/.local/share/aether-adobe/prefixes/${config.prefixName}.`
        : config.format === 'AppImage'
          ? `Auto-marked executable (no chmod +x needed) and integrated into Start Menu.`
          : `Installed via AetherOS 1-Click GUI APT resolver with all Debian dependencies.`,
    };
    setPackages((prev) => [newPkg, ...prev]);
    pushNotification(
      `${cleanName} Installed`,
      `1-Click Setup finished (${config.format}) and registered launcher automatically.`,
      '1-Click Express Installer'
    );
  };

  const handleBulkInstallFontsFromFiles = (
    fontFiles: { fileName: string; family: string; format: 'TTF' | 'OTF' }[]
  ): number => {
    const activePrefixIds = prefixes.map((p) => p.id);
    const res = bulkInstallFontsFromFiles(fonts, fontFiles, activePrefixIds);
    setFonts(res.fonts);
    pushNotification(
      `Installed ${res.installedCount} Font${res.installedCount === 1 ? '' : 's'}`,
      `Installed directly from Files to Linux (~/.local/share/fonts) & synced to ${activePrefixIds.length} Adobe Wine prefixes.`,
      'Font Installer'
    );
    return res.installedCount;
  };

  const handleImportFilesToFolder = (
    parentId: string,
    imported: { name: string; kind: FsNode['kind']; sizeBytes: number; content: string }[]
  ) => {
    const stamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const createdNodes: FsNode[] = imported.map((item, idx) => ({
      id: `import-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      parentId,
      kind: item.kind,
      sizeBytes: item.sizeBytes,
      modifiedAt: stamp,
      content: item.content,
    }));
    setFiles((prev) => [...createdNodes, ...prev]);
  };

  const handleMountVolume = (options: {
    label: string;
    filesystem?: StorageVolume['filesystem'];
    kind?: StorageVolume['kind'];
    totalGb?: number;
    usedGb?: number;
  }) => {
    const res = mountNewStorageVolume(volumes, files, options);
    setVolumes(res.volumes);
    setFiles(res.nodes);
    pushNotification(
      `Mounted Volume ${res.created.letter}`,
      `${res.created.label} (${res.created.filesystem} R/W, ${res.created.totalGb} GB) is now ready in This PC.`,
      'Storage Service'
    );
  };

  const handleOpenFileFromStart = (node: FsNode) => {
    if (node.parentId) setFileManagerFolder(node.parentId);
    handleLaunchApp('file-manager');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDesktopContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('section, nav, [role="dialog"]')) return;
    e.preventDefault();
    setOverlay('none');
    setContextMenu({
      x: Math.min(e.clientX, viewport.width - 220),
      y: Math.min(e.clientY, viewport.height - 240),
    });
  };

  const handleDesktopDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggingIconId) return;
    e.preventDefault();
    const x = Math.max(12, Math.min(e.clientX - 42, viewport.width - 108));
    const y = Math.max(12, Math.min(e.clientY - 42, viewport.height - 150));
    setShortcuts((prev) =>
      prev.map((s) => (s.id === draggingIconId ? { ...s, x, y } : s))
    );
    setDraggingIconId(null);
  };

  return (
    <div
      onContextMenu={handleDesktopContextMenu}
      onDragOver={(e) => {
        if (draggingIconId) e.preventDefault();
      }}
      onDrop={handleDesktopDrop}
      onMouseDown={(e) => {
        if (!(e.target as HTMLElement).closest('[role="dialog"], [role="menu"], nav')) {
          setOverlay('none');
          setContextMenu(null);
        }
      }}
      className="relative h-screen w-screen overflow-hidden select-none"
    >
      {/* Dynamic Architectural or Custom Uploaded Wallpaper */}
      <WallpaperBackdrop
        wallpaper={settings.wallpaper}
        customWallpaperUrl={settings.customWallpaperUrl}
        customWallpaperFit={settings.customWallpaperFit}
      />

      {/* Hidden File Picker for Desktop Right-Click "Set Custom Wallpaper..." */}
      <input
        ref={desktopWallpaperInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        aria-label="Upload custom desktop wallpaper"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadCustomWallpaper(file);
          e.target.value = '';
        }}
      />

      {/* Desktop Shortcuts Layer */}
      <main aria-label="AetherOS Desktop" className="relative h-[calc(100vh-54px)] w-full">
        {shortcuts.map((sc) => (
          <button
            key={sc.id}
            type="button"
            draggable
            onDragStart={() => setDraggingIconId(sc.id)}
            onClick={() => handleLaunchApp(sc.id)}
            style={{ left: `${sc.x}px`, top: `${sc.y}px` }}
            className={`absolute flex w-[92px] flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-all duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:hover:bg-white/10 ${
              desktopRefreshing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            <AppIconBadge appId={sc.id} size="lg" />
            <span
              className={`line-clamp-2 text-[11px] font-medium leading-tight ${
                settings.wallpaper === 'mica-light'
                  ? 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]'
                  : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
              }`}
            >
              {sc.label}
            </span>
          </button>
        ))}

        {/* Open Application Windows on Active Virtual Desktop */}
        {desktopWindows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            isFocused={win.id === focusedWindowId}
            transparencyLevel={settings.transparencyLevel}
            onFocus={() => {
              setWindows((prev) => focusWindow(prev, win.id));
              setFocusedWindowId(win.id);
            }}
            onClose={() => {
              setWindows((prev) => closeWindow(prev, win.id));
              if (focusedWindowId === win.id) setFocusedWindowId(null);
            }}
            onMinimize={() => {
              setWindows((prev) => minimizeWindow(prev, win.id));
              if (focusedWindowId === win.id) setFocusedWindowId(null);
            }}
            onSnap={(zone: SnapZone) => {
              setWindows((prev) => snapWindow(prev, win.id, zone, viewport));
              setFocusedWindowId(win.id);
            }}
            onMove={(x, y) =>
              setWindows((prev) => moveWindow(prev, win.id, x, y, viewport))
            }
            onResize={(w, h) =>
              setWindows((prev) => resizeWindow(prev, win.id, w, h, viewport))
            }
          >
            {win.appId === 'adobe-manager' && (
              <AdobeCompatApp
                prefixes={prefixes}
                gpuVendor={settings.gpuVendor}
                onCreatePrefix={handleCreatePrefix}
                onInstallRuntimes={handleInstallRuntimes}
                onUpdatePrefixGraphics={handleUpdatePrefixGraphics}
                onCreateLauncher={handleCreateLauncher}
                onDeletePrefix={handleDeletePrefix}
              />
            )}

            {win.appId === 'file-manager' && (
              <FileManagerApp
                nodes={files}
                volumes={volumes}
                initialFolderId={fileManagerFolder}
                activePrefixCount={prefixes.length}
                onCreateFolder={(parentId, name) =>
                  setFiles((prev) => createFolder(prev, parentId, name).nodes)
                }
                onRenameNode={(nodeId, name) =>
                  setFiles((prev) => renameNode(prev, nodeId, name))
                }
                onDeleteNode={(nodeId) =>
                  setFiles((prev) => deleteNode(prev, nodeId))
                }
                onDeleteNodes={(nodeIds) =>
                  setFiles((prev) =>
                    nodeIds.reduce((acc, id) => deleteNode(acc, id), prev)
                  )
                }
                onMoveNode={(nodeId, targetId) =>
                  setFiles((prev) => moveNode(prev, nodeId, targetId))
                }
                onExtractZip={handleExtractZip}
                onLaunchExeInstaller={handleLaunchExeInstaller}
                onBulkInstallFonts={handleBulkInstallFontsFromFiles}
                onImportFiles={handleImportFilesToFolder}
                onMountVolume={handleMountVolume}
                onOpenFontManager={() => handleLaunchApp('font-manager')}
              />
            )}

            {win.appId === 'app-manager' && (
              <AppManagerApp
                packages={packages}
                pendingExeRequest={pendingExeRequest}
                onClearExeRequest={() => setPendingExeRequest(null)}
                onToggleInstall={(pkgId) =>
                  setPackages((prev) =>
                    prev.map((p) =>
                      p.id === pkgId ? { ...p, installed: !p.installed } : p
                    )
                  )
                }
                onCompleteExeInstall={handleCompleteExeInstall}
              />
            )}

            {win.appId === 'settings' && (
              <SystemSettingsApp
                settings={settings}
                initialSection={settingsSection}
                drivers={drivers}
                usbPorts={usbPorts}
                onUpdate={handleUpdateSettings}
                onUploadCustomWallpaper={handleUploadCustomWallpaper}
                onInstallDriver={handleInstallDriver}
                onAutoInstallAllDrivers={handleAutoInstallAllDrivers}
                onTestUsbPort={handleTestUsbPort}
                onEjectUsbPort={handleEjectUsbPort}
                onRescanUsbPorts={handleRescanUsbPorts}
              />
            )}

            {win.appId === 'os-installer' && <OsInstallerApp />}

            {win.appId === 'os-studio' && (
              <OsStudioApp onCopyToClipboard={handleCopyToClipboard} />
            )}

            {win.appId === 'task-manager' && (
              <TaskManagerApp
                processes={processes}
                usage={systemUsage}
                settings={settings}
                onToggleRenderBoost={handleToggleRenderBoost}
                onEndProcess={handleEndProcess}
                onChangePriority={(pid, priority) =>
                  setPriorityOverrides((prev) => ({ ...prev, [pid]: priority }))
                }
              />
            )}

            {win.appId === 'terminal' && (
              <TerminalApp
                context={{
                  settings,
                  prefixes,
                  files,
                  fonts,
                  ramUsedMb: systemUsage.ramUsedMb,
                  activeServices: systemUsage.activeServices,
                }}
                onCopyToClipboard={handleCopyToClipboard}
              />
            )}

            {win.appId === 'tablet-color' && (
              <TabletColorApp
                activeColorProfile={settings.activeColorProfile}
                onSelectColorProfile={(profileId) =>
                  handleUpdateSettings({ activeColorProfile: profileId })
                }
                onCopyHex={handleCopyToClipboard}
              />
            )}

            {win.appId === 'font-manager' && (
              <FontManagerApp
                fonts={fonts}
                prefixes={prefixes}
                onSyncAllToWine={() => {
                  const ids = prefixes.map((p) => p.id);
                  setFonts((prev) => syncFontsToPrefixes(prev, ids));
                  pushNotification(
                    'Fonts Synced to Adobe Prefixes',
                    `Mirrored installed Linux fonts into ${ids.length} isolated Wine prefixes.`,
                    'Font Manager'
                  );
                }}
                onSyncFontToWine={(fontId) => {
                  const ids = prefixes.map((p) => p.id);
                  setFonts((prev) => syncFontsToPrefixes(prev, ids, fontId));
                  pushNotification(
                    'Font Synced to Wine',
                    `Copied font file to drive_c/windows/Fonts across ${ids.length} prefixes.`,
                    'Font Manager'
                  );
                }}
                onAddFont={(family, format, category) => {
                  const res = addCustomFont(fonts, family, format, category);
                  setFonts(res.fonts);
                  pushNotification(
                    'Custom Font Installed',
                    `Added ${res.created.family} (${res.created.fileName}) to ~/.local/share/fonts.`,
                    'Font Manager'
                  );
                }}
              />
            )}

            {win.appId === 'snip-recorder' && (
              <SnipRecorderApp
                settings={settings}
                onSaveCapture={handleSaveCapture}
                onOpenFolderInFiles={(folderId) => {
                  setFileManagerFolder(folderId);
                  handleLaunchApp('file-manager');
                }}
              />
            )}
          </WindowFrame>
        ))}

        {/* Custom Windows-Style Desktop Right-Click Context Menu */}
        {contextMenu && (
          <div
            role="menu"
            aria-label="Desktop Context Menu"
            style={{
              left: `${Math.min(contextMenu.x, viewport.width - 248)}px`,
              top: `${Math.min(contextMenu.y, viewport.height - 340)}px`,
            }}
            className="acrylic-panel fixed z-50 w-60 rounded-xl border border-slate-300/80 bg-white/95 p-1.5 text-xs text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100"
          >
            <button
              type="button"
              onClick={handleRefreshDesktop}
              className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left font-medium hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2.5">
                <RefreshCw className="h-3.5 w-3.5 text-sky-500" />
                <span>Refresh</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">F5</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                desktopWallpaperInputRef.current?.click();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <ImagePlus className="h-3.5 w-3.5 text-emerald-500" />
              <span>Set Custom Wallpaper...</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const order = ['mica-dark', 'mica-light', 'alpine-dusk', 'obsidian-grid'] as const;
                const currentIdx =
                  settings.wallpaper === 'custom'
                    ? -1
                    : order.indexOf(settings.wallpaper);
                const nextWp = order[(currentIdx + 1) % order.length];
                handleUpdateSettings({
                  wallpaper: nextWp,
                  theme: nextWp === 'mica-light' ? 'light' : 'dark',
                });
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Cycle Built-in Wallpaper</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShortcuts(INITIAL_SHORTCUTS);
                handleRefreshDesktop();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Arrange Desktop Icons</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const { nodes } = createFolder(files, 'documents', 'New Project');
                setFiles(nodes);
                setFileManagerFolder('documents');
                handleLaunchApp('file-manager');
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>New Folder in Documents</span>
            </button>

            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

            <button
              type="button"
              onClick={() => {
                setSettingsSection('drivers-usb');
                handleLaunchApp('settings');
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Usb className="h-3.5 w-3.5 text-sky-500" />
              <span>Auto Drivers &amp; USB Ports</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunchApp('os-installer')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Laptop className="h-3.5 w-3.5 text-violet-500" />
              <span>Switch from Windows (No Pendrive)</span>
            </button>

            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                setSessionLock('lock');
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Lock Session</span>
            </button>
          </div>
        )}
      </main>

      {/* Shell Flyout Overlays */}
      {(overlay === 'start' || overlay === 'search') && (
        <StartMenu
          mode={overlay}
          files={files}
          onLaunchApp={handleLaunchApp}
          onOpenFileInManager={handleOpenFileFromStart}
          onLockScreen={() => setSessionLock('lock')}
          onRestartSystem={() => setSessionLock('boot')}
          onClose={() => setOverlay('none')}
        />
      )}

      {overlay === 'desktops' && (
        <VirtualDesktopOverlay
          desktops={desktops}
          activeDesktopId={activeDesktopId}
          windows={windows}
          onSelectDesktop={(id) => setActiveDesktopId(id)}
          onAddDesktop={() => {
            const res = addVirtualDesktop(desktops);
            setDesktops(res.desktops);
            setActiveDesktopId(res.created.id);
          }}
          onRemoveDesktop={(id) => {
            const res = removeVirtualDesktop(desktops, windows, id);
            setDesktops(res.desktops);
            setWindows(res.windows);
            if (activeDesktopId === id) setActiveDesktopId(res.fallbackDesktopId);
          }}
          onClose={() => setOverlay('none')}
        />
      )}

      {overlay === 'clipboard' && (
        <ClipboardOverlay
          items={clipboardItems}
          onCopy={(text) => handleCopyToClipboard(text, 'Clipboard History')}
          onAdd={(text) => handleCopyToClipboard(text, 'Manual Snippet')}
          onTogglePin={(id) =>
            setClipboardItems((prev) => togglePinClipboardItem(prev, id))
          }
          onRemove={(id) =>
            setClipboardItems((prev) => removeClipboardItem(prev, id))
          }
          onClearUnpinned={() =>
            setClipboardItems((prev) => clearUnpinnedClipboard(prev))
          }
        />
      )}

      {overlay === 'quick-settings' && (
        <QuickSettingsPanel
          settings={settings}
          onUpdate={handleUpdateSettings}
          onToggleRenderBoost={handleToggleRenderBoost}
          onOpenSettings={() => handleLaunchApp('settings')}
        />
      )}

      {overlay === 'notifications' && (
        <NotificationCenter
          notifications={notifications}
          onDismiss={(id) =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
          onClearAll={() => setNotifications([])}
        />
      )}

      {altTabOpen && (
        <AltTabSwitcher
          windows={desktopWindows}
          selectedIndex={altTabIndex}
          onSelectWindow={(windowId) => {
            setWindows((prev) => focusWindow(prev, windowId));
            setFocusedWindowId(windowId);
            setAltTabOpen(false);
          }}
          onClose={() => setAltTabOpen(false)}
        />
      )}

      {quickInstallRequest && (
        <OneClickInstallerModal
          request={quickInstallRequest}
          onClose={() => setQuickInstallRequest(null)}
          onCompleteInstall={(cfg) => handleCompleteExeInstall(cfg)}
          onOpenAppManager={() => handleLaunchApp('app-manager')}
        />
      )}

      {/* Centered Windows 11-Inspired Taskbar */}
      <Taskbar
        windows={windows}
        activeDesktopId={activeDesktopId}
        focusedWindowId={focusedWindowId}
        settings={settings}
        unreadNotifications={unreadCount}
        clipboardCount={clipboardItems.length}
        startOpen={overlay === 'start'}
        searchOpen={overlay === 'search'}
        desktopsOpen={overlay === 'desktops'}
        clipboardOpen={overlay === 'clipboard'}
        quickSettingsOpen={overlay === 'quick-settings'}
        notificationsOpen={overlay === 'notifications'}
        onToggleStart={() =>
          setOverlay((o) => (o === 'start' ? 'none' : 'start'))
        }
        onToggleSearch={() =>
          setOverlay((o) => (o === 'search' ? 'none' : 'search'))
        }
        onToggleDesktops={() =>
          setOverlay((o) => (o === 'desktops' ? 'none' : 'desktops'))
        }
        onToggleAltTab={() => {
          setOverlay('none');
          if (desktopWindows.length === 0) return;
          setAltTabIndex(desktopWindows.length > 1 ? 1 : 0);
          setAltTabOpen((open) => !open);
        }}
        onToggleClipboard={() => {
          setAltTabOpen(false);
          setOverlay((o) => (o === 'clipboard' ? 'none' : 'clipboard'));
        }}
        onToggleQuickSettings={() =>
          setOverlay((o) => (o === 'quick-settings' ? 'none' : 'quick-settings'))
        }
        onToggleNotifications={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setOverlay((o) => (o === 'notifications' ? 'none' : 'notifications'));
        }}
        onAppClick={handleTaskbarAppClick}
      />

      {/* Software Display Brightness & Night Light Filters */}
      {settings.brightness < 100 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[90] bg-black transition-opacity duration-150"
          style={{ opacity: ((100 - settings.brightness) / 100) * 0.65 }}
        />
      )}
      {settings.nightLight && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[91] bg-amber-500/15 mix-blend-multiply"
        />
      )}

      {/* Boot Animation & Modern Login Screen */}
      {sessionLock !== 'none' && (
        <LockAndBootOverlay
          mode={sessionLock}
          wallpaper={settings.wallpaper}
          customWallpaperUrl={settings.customWallpaperUrl}
          customWallpaperFit={settings.customWallpaperFit}
          onUnlock={() => setSessionLock('none')}
        />
      )}
    </div>
  );
}
