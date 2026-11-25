import { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  ClipboardList,
  Layers2,
  LayoutGrid,
  Search,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  BatteryCharging,
} from 'lucide-react';
import type { AppId, OSWindow, SystemSettingsState } from '../os/types';
import { AetherStartEmblem, AppIconBadge } from './AppIcons';

interface TaskbarProps {
  windows: OSWindow[];
  activeDesktopId: number;
  focusedWindowId: string | null;
  settings: SystemSettingsState;
  unreadNotifications: number;
  clipboardCount: number;
  startOpen: boolean;
  searchOpen: boolean;
  desktopsOpen: boolean;
  clipboardOpen: boolean;
  quickSettingsOpen: boolean;
  notificationsOpen: boolean;
  onToggleStart: () => void;
  onToggleSearch: () => void;
  onToggleDesktops: () => void;
  onToggleAltTab: () => void;
  onToggleClipboard: () => void;
  onToggleQuickSettings: () => void;
  onToggleNotifications: () => void;
  onAppClick: (appId: AppId) => void;
}

const PINNED_APPS: { id: AppId; label: string }[] = [
  { id: 'adobe-manager', label: 'Adobe Compatibility Manager' },
  { id: 'file-manager', label: 'Files' },
  { id: 'app-manager', label: 'Application Manager' },
  { id: 'task-manager', label: 'Task Manager & System Monitor' },
  { id: 'terminal', label: 'Aether Terminal' },
  { id: 'settings', label: 'System Settings' },
  { id: 'os-installer', label: 'Install AetherOS' },
  { id: 'os-studio', label: 'OS Architecture & ISO Build Studio' },
];

export function Taskbar({
  windows,
  activeDesktopId,
  focusedWindowId,
  settings,
  unreadNotifications,
  clipboardCount,
  startOpen,
  searchOpen,
  desktopsOpen,
  clipboardOpen,
  quickSettingsOpen,
  notificationsOpen,
  onToggleStart,
  onToggleSearch,
  onToggleDesktops,
  onToggleAltTab,
  onToggleClipboard,
  onToggleQuickSettings,
  onToggleNotifications,
  onAppClick,
}: TaskbarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const desktopWindows = windows.filter((w) => w.desktopId === activeDesktopId);

  return (
    <nav
      aria-label="AetherOS Taskbar"
      className="acrylic-panel fixed bottom-0 left-0 right-0 z-50 flex h-[54px] items-center justify-between border-t border-slate-300/70 bg-white/82 px-3 text-slate-900 dark:border-slate-700/70 dark:bg-slate-950/82 dark:text-slate-100"
    >
      {/* Left Spacer / Desktop & Window Switcher */}
      <div className="hidden flex-1 items-center gap-1.5 sm:flex">
        <button
          type="button"
          onClick={onToggleDesktops}
          aria-label="Switch Virtual Desktops"
          aria-expanded={desktopsOpen}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            desktopsOpen
              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
              : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/80'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Desktop {activeDesktopId}</span>
        </button>

        <button
          type="button"
          onClick={onToggleAltTab}
          aria-label="Open Window Switcher (Alt+Tab)"
          title="Window Switcher (Alt + Tab)"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/80 whitespace-nowrap shrink-0"
        >
          <Layers2 className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Switch</span>
        </button>
      </div>

      {/* Centered Dock Controls */}
      <div
        className={`flex shrink-0 items-center gap-1.5 ${
          settings.taskbarCentered ? '' : 'mr-auto'
        }`}
      >
        <button
          type="button"
          onClick={onToggleStart}
          aria-label="Open Start Menu"
          aria-expanded={startOpen}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            startOpen
              ? 'bg-sky-600 text-white'
              : 'text-sky-600 hover:bg-slate-200/75 dark:text-sky-400 dark:hover:bg-slate-800/80'
          }`}
        >
          <AetherStartEmblem className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSearch}
          aria-label="Search AetherOS"
          aria-expanded={searchOpen}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs transition-colors whitespace-nowrap shrink-0 ${
            searchOpen
              ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300'
              : 'border-slate-300/70 bg-white/70 text-slate-600 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search</span>
        </button>

        <div className="mx-1 h-5 w-px bg-slate-300/70 dark:bg-slate-700/70" aria-hidden="true" />

        {PINNED_APPS.map((app) => {
          const running = desktopWindows.find((w) => w.appId === app.id);
          const isActive = running && running.id === focusedWindowId && !running.minimized;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => onAppClick(app.id)}
              aria-label={app.label}
              title={app.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-200/90 dark:bg-slate-800/95'
                  : 'hover:bg-slate-200/65 dark:hover:bg-slate-800/65'
              }`}
            >
              <AppIconBadge appId={app.id} size="md" />
              {running && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0.5 h-1 rounded-full transition-all ${
                    isActive
                      ? 'w-4 bg-sky-500'
                      : 'w-1.5 bg-slate-400 dark:bg-slate-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right System Tray */}
      <div className="flex flex-1 items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onToggleClipboard}
          aria-label="Open Clipboard History"
          aria-expanded={clipboardOpen}
          title={`Clipboard History (${clipboardCount}) · Alt+V`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors dark:text-slate-200 ${
            clipboardOpen
              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleQuickSettings}
          aria-label="Open Quick Settings"
          aria-expanded={quickSettingsOpen}
          className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-slate-700 transition-colors dark:text-slate-200 ${
            quickSettingsOpen
              ? 'bg-slate-200/90 dark:bg-slate-800'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
          }`}
        >
          {settings.wifiEnabled ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-slate-400" />
          )}
          {settings.volume > 0 ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-slate-400" />
          )}
          <BatteryCharging className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleNotifications}
          aria-label="Open Calendar and Notification Center"
          aria-expanded={notificationsOpen}
          className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-right transition-colors whitespace-nowrap ${
            notificationsOpen
              ? 'bg-slate-200/90 dark:bg-slate-800'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
          }`}
        >
          <div className="leading-tight tabular-nums whitespace-nowrap">
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
              {timeString}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {dateString}
            </div>
          </div>
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center text-slate-600 dark:text-slate-300">
            {settings.doNotDisturb ? (
              <BellOff className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Bell className="h-3.5 w-3.5" />
            )}
            {!settings.doNotDisturb && unreadNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-600 px-1 text-[9px] font-semibold text-white tabular-nums">
                {unreadNotifications}
              </span>
            )}
          </span>
        </button>
      </div>
    </nav>
  );
}
