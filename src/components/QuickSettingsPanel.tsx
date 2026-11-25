import {
  Bluetooth,
  Eye,
  Moon,
  Shield,
  Sun,
  Volume2,
  Wifi,
  Zap,
} from 'lucide-react';
import type { SystemSettingsState } from '../os/types';

interface QuickSettingsPanelProps {
  settings: SystemSettingsState;
  onUpdate: (patch: Partial<SystemSettingsState>) => void;
  onToggleRenderBoost: () => void;
  onOpenSettings: () => void;
}

export function QuickSettingsPanel({
  settings,
  onUpdate,
  onToggleRenderBoost,
  onOpenSettings,
}: QuickSettingsPanelProps) {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const nextWallpaper =
      nextTheme === 'light' && settings.wallpaper === 'mica-dark'
        ? 'mica-light'
        : nextTheme === 'dark' && settings.wallpaper === 'mica-light'
          ? 'mica-dark'
          : settings.wallpaper;
    onUpdate({ theme: nextTheme, wallpaper: nextWallpaper });
  };

  return (
    <div
      role="dialog"
      aria-label="Quick Settings"
      className="animate-flyout-up acrylic-panel fixed bottom-[64px] right-3 z-50 w-[348px] rounded-2xl border border-slate-300/80 bg-white/94 p-4 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/94 dark:text-slate-100"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">
          Quick Settings
        </h3>
        <button
          type="button"
          onClick={onOpenSettings}
          className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          All Settings
        </button>
      </div>

      {/* 3x2 Quick Action Tiles */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onUpdate({ wifiEnabled: !settings.wifiEnabled })}
          aria-pressed={settings.wifiEnabled}
          className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
            settings.wifiEnabled
              ? 'border-sky-500/40 bg-sky-600 text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span className="text-[11px] font-medium">
            {settings.wifiEnabled ? 'Studio-5G' : 'Wi-Fi Off'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onUpdate({ bluetoothEnabled: !settings.bluetoothEnabled })}
          aria-pressed={settings.bluetoothEnabled}
          className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
            settings.bluetoothEnabled
              ? 'border-sky-500/40 bg-sky-600 text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Bluetooth className="h-4 w-4" />
          <span className="text-[11px] font-medium">
            {settings.bluetoothEnabled ? 'Bluetooth On' : 'Bluetooth Off'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={settings.theme === 'dark'}
          className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
            settings.theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-amber-300 bg-amber-50 text-slate-900 hover:bg-amber-100'
          }`}
        >
          {settings.theme === 'dark' ? (
            <Moon className="h-4 w-4 text-sky-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-600" />
          )}
          <span className="text-[11px] font-medium">
            {settings.theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onUpdate({ nightLight: !settings.nightLight })}
          aria-pressed={settings.nightLight}
          className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
            settings.nightLight
              ? 'border-amber-500/40 bg-amber-600 text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span className="text-[11px] font-medium">Night Light</span>
        </button>

        <button
          type="button"
          onClick={onToggleRenderBoost}
          aria-pressed={settings.renderBoost}
          className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
            settings.renderBoost
              ? 'border-amber-400 bg-amber-500 text-slate-950'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span className="truncate text-[11px] font-medium">
            {settings.renderBoost ? 'Boost + DND' : 'Render Boost'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onUpdate({ firewallEnabled: !settings.firewallEnabled })}
          aria-pressed={settings.firewallEnabled}
          className={`flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
            settings.firewallEnabled
              ? 'border-emerald-500/40 bg-emerald-600 text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span className="text-[11px] font-medium">
            {settings.firewallEnabled ? 'Firewall On' : 'Firewall Off'}
          </span>
        </button>
      </div>

      {/* Brightness & Volume Sliders */}
      <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-3.5 dark:border-slate-800">
        <label className="block">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Sun className="h-3.5 w-3.5" />
              Display Brightness
            </span>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
              {settings.brightness}%
            </span>
          </div>
          <input
            type="range"
            min={35}
            max={100}
            value={settings.brightness}
            onChange={(e) => onUpdate({ brightness: Number(e.target.value) })}
            className="h-1.5 w-full cursor-pointer accent-sky-500"
          />
        </label>

        <label className="block">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Volume2 className="h-3.5 w-3.5" />
              PipeWire Volume
            </span>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
              {settings.volume}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => onUpdate({ volume: Number(e.target.value) })}
            className="h-1.5 w-full cursor-pointer accent-sky-500"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-[11px] text-slate-500 tabular-nums dark:border-slate-800 dark:text-slate-400">
        <span>Idle RAM: 424 MB · ZRAM 50%</span>
        <span>Battery 92%</span>
      </div>
    </div>
  );
}
