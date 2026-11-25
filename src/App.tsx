/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { FolderPlus, Lock, Monitor, Palette, RefreshCw } from 'lucide-react';
import { AppIconBadge } from './components/AppIcons';
import { LockAndBootOverlay } from './components/LockAndBootOverlay';
import { NotificationCenter } from './components/NotificationCenter';
import { QuickSettingsPanel } from './components/QuickSettingsPanel';
import { StartMenu } from './components/StartMenu';
import { Taskbar } from './components/Taskbar';
import { VirtualDesktopOverlay } from './components/VirtualDesktopOverlay';
import { WallpaperBackdrop } from './components/WallpaperBackdrop';
import { WindowFrame } from './components/WindowFrame';
import { AdobeCompatApp } from './components/apps/AdobeCompatApp';
import { AppManagerApp } from './components/apps/AppManagerApp';
import { FileManagerApp } from './components/apps/FileManagerApp';
import { OsInstallerApp } from './components/apps/OsInstallerApp';
import { OsStudioApp } from './components/apps/OsStudioApp';
import { SystemSettingsApp } from './components/apps/SystemSettingsApp';
import {
  INITIAL_WINE_PREFIXES,
  createWinePrefix,
  installMissingDependencies,
} from './os/adobeEngine';
import {
  INITIAL_FS_NODES,
  createFolder,
  deleteNode,
  extractZipArchive,
  moveNode,
  renameNode,
} from './os/fileSystem';
import { INITIAL_PACKAGES } from './os/packagesData';
import type {
  AdobeVersionEntry,
  AppId,
  ExeInstallRequest,
  FsNode,
  GraphicsLayer,
  NotificationItem,
  OSWindow,
  SnapZone,
  SoftwarePackage,
  SystemSettingsState,
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
  { id: 'adobe-manager', label: 'Adobe Manager', x: 20, y: 20 },
  { id: 'file-manager', label: 'Files', x: 20, y: 122 },
  { id: 'app-manager', label: 'App Manager', x: 20, y: 224 },
  { id: 'os-installer', label: 'Install AetherOS', x: 20, y: 326 },
  { id: 'os-studio', label: 'OS Build Studio', x: 20, y: 428 },
  { id: 'settings', label: 'Settings', x: 20, y: 530 },
];

const INITIAL_SETTINGS: SystemSettingsState = {
  theme: 'dark',
  wallpaper: 'mica-dark',
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
    // Position neatly right of the desktop icon column
    const win = initial.windows[0];
    return [
      {
        ...win,
        bounds: {
          ...win.bounds,
          x: Math.max(144, win.bounds.x + 28),
          y: Math.max(24, win.bounds.y - 8),
        },
        restoreBounds: {
          ...win.bounds,
          x: Math.max(144, win.bounds.x + 28),
          y: Math.max(24, win.bounds.y - 8),
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
  const [fileManagerFolder, setFileManagerFolder] = useState<string>('downloads');
  const [prefixes, setPrefixes] = useState<WinePrefix[]>(INITIAL_WINE_PREFIXES);
  const [packages, setPackages] = useState<SoftwarePackage[]>(INITIAL_PACKAGES);
  const [pendingExeRequest, setPendingExeRequest] = useState<ExeInstallRequest | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

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

  // Close overlays on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOverlay('none');
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const pushNotification = (title: string, body: string, source: string) => {
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
    setSettings((prev) => ({ ...prev, ...patch }));
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
    setPendingExeRequest(req);
    handleLaunchApp('app-manager');
  };

  const handleCompleteExeInstall = (config: {
    fileName: string;
    format: 'EXE' | 'MSI';
    prefixName: string;
    useDxvk: boolean;
    winVersion: 'win10' | 'win11';
    installVcRun: boolean;
  }) => {
    const newPkg: SoftwarePackage = {
      id: `pkg-win-${Date.now()}`,
      name: `${config.fileName.replace(/\.(exe|msi)$/i, '')} (Wine)`,
      publisher: `Prefix: ${config.prefixName}`,
      version: config.winVersion,
      format: config.format,
      category: 'Creative',
      sizeLabel: config.useDxvk ? 'DXVK Enabled' : 'OpenGL',
      installed: true,
      description: `Installed via AetherOS ${config.format} workflow in ~/.local/share/aether-adobe/prefixes/${config.prefixName}.`,
    };
    setPackages((prev) => [newPkg, ...prev]);
    pushNotification(
      `${config.format} Application Installed`,
      `Registered "${newPkg.name}" inside isolated prefix ${config.prefixName}.`,
      'Application Manager'
    );
  };

  const handleOpenFileFromStart = (node: FsNode) => {
    if (node.parentId) setFileManagerFolder(node.parentId);
    handleLaunchApp('file-manager');
  };

  const desktopWindows = useMemo(
    () => windows.filter((w) => w.desktopId === activeDesktopId),
    [windows, activeDesktopId]
  );

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
      {/* Dynamic Architectural Wallpaper */}
      <WallpaperBackdrop wallpaper={settings.wallpaper} />

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
            className="absolute flex w-[92px] flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:hover:bg-white/10"
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
                initialFolderId={fileManagerFolder}
                onCreateFolder={(parentId, name) =>
                  setFiles((prev) => createFolder(prev, parentId, name).nodes)
                }
                onRenameNode={(nodeId, name) =>
                  setFiles((prev) => renameNode(prev, nodeId, name))
                }
                onDeleteNode={(nodeId) =>
                  setFiles((prev) => deleteNode(prev, nodeId))
                }
                onMoveNode={(nodeId, targetId) =>
                  setFiles((prev) => moveNode(prev, nodeId, targetId))
                }
                onExtractZip={handleExtractZip}
                onLaunchExeInstaller={handleLaunchExeInstaller}
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
                onUpdate={handleUpdateSettings}
              />
            )}

            {win.appId === 'os-installer' && <OsInstallerApp />}

            {win.appId === 'os-studio' && <OsStudioApp />}
          </WindowFrame>
        ))}

        {/* Custom Desktop Right-Click Context Menu */}
        {contextMenu && (
          <div
            role="menu"
            aria-label="Desktop Context Menu"
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
            className="acrylic-panel fixed z-50 w-52 rounded-xl border border-slate-300/80 bg-white/95 p-1.5 text-xs text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100"
          >
            <button
              type="button"
              onClick={() => {
                setShortcuts(INITIAL_SHORTCUTS);
                setContextMenu(null);
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

            <button
              type="button"
              onClick={() => {
                const order = ['mica-dark', 'mica-light', 'alpine-dusk', 'obsidian-grid'] as const;
                const nextWp = order[(order.indexOf(settings.wallpaper) + 1) % order.length];
                handleUpdateSettings({
                  wallpaper: nextWp,
                  theme: nextWp === 'mica-light' ? 'light' : 'dark',
                });
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Cycle Wallpaper</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunchApp('settings')}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Display &amp; GPU Settings</span>
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

      {overlay === 'quick-settings' && (
        <QuickSettingsPanel
          settings={settings}
          onUpdate={handleUpdateSettings}
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

      {/* Centered Windows 11-Inspired Taskbar */}
      <Taskbar
        windows={windows}
        activeDesktopId={activeDesktopId}
        focusedWindowId={focusedWindowId}
        settings={settings}
        unreadNotifications={unreadCount}
        startOpen={overlay === 'start'}
        searchOpen={overlay === 'search'}
        desktopsOpen={overlay === 'desktops'}
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
          onUnlock={() => setSessionLock('none')}
        />
      )}
    </div>
  );
}
