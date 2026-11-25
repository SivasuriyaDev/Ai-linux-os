import { useState } from 'react';
import {
  Bluetooth,
  Cpu,
  Globe,
  HardDrive,
  Keyboard,
  Monitor,
  Palette,
  RefreshCw,
  Shield,
  Users,
  Volume2,
  Wifi,
} from 'lucide-react';
import type { SystemSettingsState, WallpaperId } from '../../os/types';

interface SystemSettingsAppProps {
  settings: SystemSettingsState;
  onUpdate: (patch: Partial<SystemSettingsState>) => void;
}

type SettingsSection =
  | 'display'
  | 'personalization'
  | 'graphics'
  | 'sound'
  | 'network'
  | 'storage'
  | 'security'
  | 'system';

const NAV_ITEMS: { id: SettingsSection; label: string; icon: typeof Monitor }[] = [
  { id: 'display', label: 'Display & Monitors', icon: Monitor },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'graphics', label: 'GPU & Graphics', icon: Cpu },
  { id: 'sound', label: 'Sound & PipeWire', icon: Volume2 },
  { id: 'network', label: 'Network & Bluetooth', icon: Wifi },
  { id: 'storage', label: 'Storage & Power', icon: HardDrive },
  { id: 'security', label: 'Privacy & Security', icon: Shield },
  { id: 'system', label: 'Accounts, Input & Updates', icon: Users },
];

const WALLPAPER_OPTIONS: { id: WallpaperId; label: string; previewBg: string }[] = [
  { id: 'mica-dark', label: 'Aether Bloom (Dark)', previewBg: 'from-slate-950 via-blue-900 to-sky-700' },
  { id: 'mica-light', label: 'Pearl Mica (Light)', previewBg: 'from-slate-100 via-sky-200 to-blue-300' },
  { id: 'alpine-dusk', label: 'Alpine Dusk', previewBg: 'from-slate-900 via-slate-700 to-blue-900' },
  { id: 'obsidian-grid', label: 'Obsidian Studio', previewBg: 'from-slate-950 via-slate-900 to-sky-950' },
];

const GPU_PROFILES = {
  Intel: {
    driver: 'Mesa 24.2 ANV Vulkan + i915/Xe',
    videoDecode: 'VA-API Intel QuickSync (H.264 / HEVC / AV1)',
    vram: 'Shared Unified Memory (4.0 GB allocated)',
    vulkan: 'Vulkan 1.3.289 · OpenGL 4.6',
  },
  AMD: {
    driver: 'Mesa 24.2 RADV Vulkan + amdgpu',
    videoDecode: 'VA-API / VCN 4.0 Hardware Decode & Encode',
    vram: '8.0 GB GDDR6 (1.1 GB active)',
    vulkan: 'Vulkan 1.3.289 · OpenGL 4.6',
  },
  NVIDIA: {
    driver: 'NVIDIA Proprietary 565.57.01 (DKMS + MOK)',
    videoDecode: 'NVDEC / NVENC Hardware Video Engine',
    vram: '12.0 GB GDDR6X (1.4 GB active)',
    vulkan: 'Vulkan 1.3.289 · OpenGL 4.6 · Prime Offload',
  },
};

export function SystemSettingsApp({ settings, onUpdate }: SystemSettingsAppProps) {
  const [section, setSection] = useState<SettingsSection>('display');
  const [updateStatus, setUpdateStatus] = useState('Up to date · Debian 12.8 Security Channel');

  const gpuInfo = GPU_PROFILES[settings.gpuVendor];

  return (
    <div className="grid h-full grid-cols-12 bg-slate-50/70 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Settings Sidebar */}
      <aside className="col-span-4 overflow-y-auto border-r border-slate-200 bg-slate-100/60 p-3 sm:col-span-3 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-3 px-2.5">
          <div className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            System Settings
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            AetherOS 1.0 LTS
          </div>
        </div>

        <nav aria-label="System settings categories" className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                  active
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Settings Content */}
      <div className="col-span-8 overflow-y-auto p-6 sm:col-span-9">
        {section === 'display' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Display &amp; Multiple Monitors
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wayland compositor output geometry, scaling, and Night Light color temperature.
              </p>
            </div>

            {/* Dual Monitor Preview */}
            <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-24 w-40 flex-col items-center justify-center rounded-lg border-2 border-sky-500 bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300">
                <span>1 · Primary</span>
                <span className="mt-0.5 font-mono text-[10px] font-normal tabular-nums">
                  {settings.resolution} · {settings.refreshRate}
                </span>
              </div>
              {settings.multiMonitorMode !== 'Primary Only' && (
                <div className="flex h-20 w-32 flex-col items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>2 · External</span>
                  <span className="mt-0.5 font-mono text-[10px]">
                    {settings.multiMonitorMode}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Resolution
                </span>
                <select
                  value={settings.resolution}
                  onChange={(e) =>
                    onUpdate({ resolution: e.target.value as SystemSettingsState['resolution'] })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="1920x1080">1920 × 1080 (FHD)</option>
                  <option value="2560x1440">2560 × 1440 (QHD)</option>
                  <option value="3840x2160">3840 × 2160 (4K UHD)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Refresh Rate
                </span>
                <select
                  value={settings.refreshRate}
                  onChange={(e) =>
                    onUpdate({ refreshRate: e.target.value as SystemSettingsState['refreshRate'] })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="60 Hz">60 Hz</option>
                  <option value="120 Hz">120 Hz</option>
                  <option value="144 Hz">144 Hz</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Multiple Displays
                </span>
                <select
                  value={settings.multiMonitorMode}
                  onChange={(e) =>
                    onUpdate({
                      multiMonitorMode: e.target.value as SystemSettingsState['multiMonitorMode'],
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="Extend">Extend displays</option>
                  <option value="Mirror">Mirror displays</option>
                  <option value="Primary Only">Primary display only</option>
                </select>
              </label>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <label className="block">
                <div className="mb-1 flex justify-between text-xs">
                  <span>Screen Brightness</span>
                  <span className="font-mono tabular-nums">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={100}
                  value={settings.brightness}
                  onChange={(e) => onUpdate({ brightness: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900">
                <span>Night Light (Warm color filter)</span>
                <input
                  type="checkbox"
                  checked={settings.nightLight}
                  onChange={(e) => onUpdate({ nightLight: e.target.checked })}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>
            </div>
          </div>
        )}

        {section === 'personalization' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Personalization &amp; Mica Materials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure theme polarity, desktop wallpapers, Acrylic transparency, and taskbar alignment.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ theme: 'dark', wallpaper: 'mica-dark' })}
                className={`rounded-lg border px-4 py-2 text-xs font-medium ${
                  settings.theme === 'dark'
                    ? 'border-sky-500 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                Dark Mode
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ theme: 'light', wallpaper: 'mica-light' })}
                className={`rounded-lg border px-4 py-2 text-xs font-medium ${
                  settings.theme === 'light'
                    ? 'border-sky-500 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                Light Mode
              </button>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Desktop Wallpaper
              </div>
              <div className="grid grid-cols-2 gap-3">
                {WALLPAPER_OPTIONS.map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => onUpdate({ wallpaper: wp.id })}
                    className={`overflow-hidden rounded-xl border p-2 text-left transition-colors ${
                      settings.wallpaper === wp.id
                        ? 'border-sky-500 ring-2 ring-sky-500/30'
                        : 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`h-16 w-full rounded-lg bg-gradient-to-br ${wp.previewBg}`}
                    />
                    <div className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {wp.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900">
              <span>Center Taskbar Icons (Windows 11 style)</span>
              <input
                type="checkbox"
                checked={settings.taskbarCentered}
                onChange={(e) => onUpdate({ taskbarCentered: e.target.checked })}
                className="h-4 w-4 accent-sky-600"
              />
            </label>
          </div>
        )}

        {section === 'graphics' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                GPU Drivers &amp; Vulkan Acceleration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hardware video decode/encode, Vulkan ICD routing, and creative driver profile for Intel, AMD, and NVIDIA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['Intel', 'AMD', 'NVIDIA'] as const).map((vendor) => (
                <button
                  key={vendor}
                  type="button"
                  onClick={() => onUpdate({ gpuVendor: vendor })}
                  className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                    settings.gpuVendor === vendor
                      ? 'border-sky-500 bg-sky-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {vendor} Graphics
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400">Active Driver Stack</span>
                <span className="font-mono font-medium">{gpuInfo.driver}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400">API Support</span>
                <span className="font-mono font-medium">{gpuInfo.vulkan}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400">Hardware Video Decode / Encode</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {gpuInfo.videoDecode}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400">GPU Memory Telemetry</span>
                <span className="font-mono tabular-nums">{gpuInfo.vram}</span>
              </div>
            </div>
          </div>
        )}

        {section === 'sound' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Sound &amp; PipeWire Routing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Low-latency PipeWire + WirePlumber audio graph with WineASIO / JACK bridge for Adobe Audition.
              </p>
            </div>

            <label className="block rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex justify-between text-xs font-medium">
                <span>Master Output Volume (Studio Monitors · 48 kHz)</span>
                <span className="font-mono tabular-nums">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.volume}
                onChange={(e) => onUpdate({ volume: Number(e.target.value) })}
                className="w-full accent-sky-600"
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="font-semibold">PipeWire-JACK Bridge Status</div>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Quantum: 256 samples · Latency: 5.3 ms · Ready for Adobe Audition &amp; native DAWs.
              </p>
            </div>
          </div>
        )}

        {section === 'network' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Network &amp; Bluetooth
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Managed via NetworkManager and BlueZ with low idle background overhead.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="flex items-center gap-2 font-medium">
                  <Wifi className="h-4 w-4 text-sky-500" />
                  Wi-Fi ({settings.wifiEnabled ? `Connected to ${settings.wifiNetwork}` : 'Disabled'})
                </span>
                <input
                  type="checkbox"
                  checked={settings.wifiEnabled}
                  onChange={(e) => onUpdate({ wifiEnabled: e.target.checked })}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="flex items-center gap-2 font-medium">
                  <Bluetooth className="h-4 w-4 text-sky-500" />
                  Bluetooth ({settings.bluetoothEnabled ? 'Wacom Intuos Pro Paired' : 'Disabled'})
                </span>
                <input
                  type="checkbox"
                  checked={settings.bluetoothEnabled}
                  onChange={(e) => onUpdate({ bluetoothEnabled: e.target.checked })}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>
            </div>
          </div>
        )}

        {section === 'storage' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Storage, Memory &amp; Power Optimization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Debian Minimal footprint tuned for low idle RAM, SSD longevity, and fast systemd boot.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="font-mono text-lg font-semibold text-sky-600 tabular-nums dark:text-sky-400">
                  424 MB
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Idle Desktop RAM
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="font-mono text-lg font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                  6.8 s
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Target NVMe Boot
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums dark:text-white">
                  38 units
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Active systemd Services
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium">CPU Governor / Power Profile</span>
                <select
                  value={settings.powerProfile}
                  onChange={(e) =>
                    onUpdate({
                      powerProfile: e.target.value as SystemSettingsState['powerProfile'],
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="Performance">Performance (Render &amp; Export)</option>
                  <option value="Balanced">Balanced (Default)</option>
                  <option value="Power Saver">Power Saver (Laptop Battery)</option>
                </select>
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                <span>Weekly NVMe / SSD TRIM (fstrim.timer)</span>
                <input
                  type="checkbox"
                  checked={settings.ssdTrimEnabled}
                  onChange={(e) => onUpdate({ ssdTrimEnabled: e.target.checked })}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>
            </div>
          </div>
        )}

        {section === 'security' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Privacy &amp; Security Hardening
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                nftables host firewall, AppArmor Wine prefix sandboxing, LUKS2 encryption, and Secure Boot MOK.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'firewallEnabled' as const,
                  label: 'nftables Host Firewall (Default-drop inbound policy)',
                  checked: settings.firewallEnabled,
                },
                {
                  key: 'appArmorWineSandbox' as const,
                  label: 'AppArmor Wine Sandboxing (Blocks access to ~/.ssh & GPG keys)',
                  checked: settings.appArmorWineSandbox,
                },
                {
                  key: 'autoSecurityUpdates' as const,
                  label: 'Automatic Debian Security Patches (unattended-upgrades)',
                  checked: settings.autoSecurityUpdates,
                },
                {
                  key: 'luksEncryption' as const,
                  label: 'LUKS2 Argon2id Full-Disk Encryption Policy',
                  checked: settings.luksEncryption,
                },
                {
                  key: 'secureBootMOK' as const,
                  label: 'UEFI Secure Boot (Debian shim-signed + MOK DKMS)',
                  checked: settings.secureBootMOK,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => onUpdate({ [item.key]: e.target.checked })}
                    className="h-4 w-4 accent-sky-600"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {section === 'system' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Accounts, Input, Region &amp; Updates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure keyboard, language, timezone, and verify Debian security updates.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <Globe className="h-3.5 w-3.5" /> Language
                </span>
                <select
                  value={settings.language}
                  onChange={(e) => onUpdate({ language: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Deutsch">Deutsch</option>
                  <option value="Français">Français</option>
                  <option value="日本語">日本語</option>
                </select>
              </label>

              <label className="block">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <Keyboard className="h-3.5 w-3.5" /> Keyboard
                </span>
                <select
                  value={settings.keyboardLayout}
                  onChange={(e) => onUpdate({ keyboardLayout: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="US QWERTY">US QWERTY</option>
                  <option value="UK ISO">UK ISO</option>
                  <option value="DE QWERTZ">DE QWERTZ</option>
                  <option value="Dvorak">Dvorak</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium">Time Zone</span>
                <select
                  value={settings.timezone}
                  onChange={(e) => onUpdate({ timezone: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <div className="text-xs font-semibold">Software Updates</div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {updateStatus}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setUpdateStatus(
                    `Checked ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · All security packages current`
                  )
                }
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-sky-500 whitespace-nowrap shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Check for Updates</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
