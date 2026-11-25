import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HardDrive, ShieldCheck } from 'lucide-react';
import {
  calculatePartitionLayout,
  validateInstallerUser,
  type FirmwareMode,
  type InstallerUserConfig,
  type PartitionMode,
} from '../../os/installerValidation';

const STEPS = [
  'Language',
  'Keyboard',
  'Disk & Dual-Boot',
  'Bootloader',
  'User Account',
  'Time Zone',
  'Install',
];

const INSTALL_LOGS = [
  'Creating GPT/MBR partition table via parted...',
  'Formatting EFI System Partition (FAT32) and AetherOS Root (ext4)...',
  'Extracting Debian 12 Bookworm Minimal SquashFS root image...',
  'Installing Linux 6.12 LTS kernel & updating initramfs...',
  'Configuring systemd services, ZRAM lz4 swap, PipeWire & nftables...',
  'Installing GRUB 2.12 bootloader & detecting Windows 11 EFI entry...',
  'Generating user account, sudoers, and Adobe Compatibility prefix templates...',
  'Installation complete. Ready for first-boot restart.',
];

export function OsInstallerApp() {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('English (United States) — en_US.UTF-8');
  const [keyboard, setKeyboard] = useState('English (US QWERTY)');
  const [keyboardTest, setKeyboardTest] = useState('');
  const [partitionMode, setPartitionMode] = useState<PartitionMode>('dual-boot');
  const [firmware, setFirmware] = useState<FirmwareMode>('uefi');
  const [luksEncrypt, setLuksEncrypt] = useState(true);
  const [aetherShareGb, setAetherShareGb] = useState(180);
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [user, setUser] = useState<InstallerUserConfig>({
    fullName: '',
    username: '',
    hostname: 'aether-workstation',
    password: '',
    confirmPassword: '',
  });
  const [userErrors, setUserErrors] = useState<
    Partial<Record<keyof InstallerUserConfig, string>>
  >({});

  const [installing, setInstalling] = useState(false);
  const [logCount, setLogCount] = useState(0);

  const partitions = useMemo(
    () => calculatePartitionLayout(512, partitionMode, firmware, luksEncrypt, aetherShareGb),
    [partitionMode, firmware, luksEncrypt, aetherShareGb]
  );

  useEffect(() => {
    if (!installing) return;
    if (logCount >= INSTALL_LOGS.length) return;
    const timer = window.setTimeout(() => setLogCount((c) => c + 1), 420);
    return () => window.clearTimeout(timer);
  }, [installing, logCount]);

  const installComplete = installing && logCount >= INSTALL_LOGS.length;

  const handleNext = () => {
    if (step === 4) {
      const result = validateInstallerUser(user);
      if (!result.valid) {
        setUserErrors(result.errors);
        return;
      }
      setUserErrors({});
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="grid h-full grid-cols-12 bg-slate-50/75 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Left Step Rail */}
      <aside className="col-span-4 border-r border-slate-200 bg-slate-100/70 p-4 sm:col-span-3 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4">
          <h1 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            Install AetherOS
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Debian 12 LTS · x86_64
          </p>
        </div>

        <ol className="space-y-1.5">
          {STEPS.map((label, idx) => {
            const done = idx < step || (idx === STEPS.length - 1 && installComplete);
            const active = idx === step;
            return (
              <li
                key={label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium ${
                  active
                    ? 'bg-sky-600 text-white'
                    : done
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="font-mono text-[11px] tabular-nums">
                  {done ? '✓' : `0${idx + 1}`}
                </span>
                <span className="truncate">{label}</span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Step Content */}
      <div className="col-span-8 flex min-h-0 flex-col sm:col-span-9">
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div className="max-w-lg space-y-4">
              <h2 className="font-display text-lg font-semibold">
                Select System Language
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the locale used for the desktop shell, system utilities, and Wine regional defaults.
              </p>
              <label className="block">
                <span className="text-xs font-medium">Installation Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option>English (United States) — en_US.UTF-8</option>
                  <option>English (United Kingdom) — en_GB.UTF-8</option>
                  <option>Deutsch (Deutschland) — de_DE.UTF-8</option>
                  <option>Français (France) — fr_FR.UTF-8</option>
                  <option>日本語 (日本) — ja_JP.UTF-8</option>
                </select>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="max-w-lg space-y-4">
              <h2 className="font-display text-lg font-semibold">
                Keyboard Layout
              </h2>
              <label className="block">
                <span className="text-xs font-medium">Layout</span>
                <select
                  value={keyboard}
                  onChange={(e) => setKeyboard(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option>English (US QWERTY)</option>
                  <option>English (UK ISO)</option>
                  <option>German (QWERTZ)</option>
                  <option>French (AZERTY)</option>
                  <option>US Dvorak</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium">Type here to test your keyboard</span>
                <input
                  type="text"
                  value={keyboardTest}
                  onChange={(e) => setKeyboardTest(e.target.value)}
                  placeholder="Test keys and symbols..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Disk Partitioning (NVMe 512 GB · /dev/nvme0n1)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports SSD/HDD, automatic install, manual partitions, and Windows 11 dual-boot.
                  </p>
                </div>
                <HardDrive className="h-5 w-5 text-sky-500" />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'dual-boot' as const, title: 'Dual-Boot', desc: 'Install alongside Windows 11' },
                  { id: 'automatic' as const, title: 'Automatic', desc: 'Erase disk & install AetherOS' },
                  { id: 'manual' as const, title: 'Manual', desc: 'Separate /, /home & swap' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPartitionMode(opt.id)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      partitionMode === opt.id
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {partitionMode === 'dual-boot' && (
                <label className="block rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1 flex justify-between text-xs font-medium">
                    <span>Allocate Space for AetherOS (Shrinks NTFS safely)</span>
                    <span className="font-mono tabular-nums">{aetherShareGb} GB</span>
                  </div>
                  <input
                    type="range"
                    min={64}
                    max={360}
                    step={8}
                    value={aetherShareGb}
                    onChange={(e) => setAetherShareGb(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </label>
              )}

              {/* Visual Partition Bar */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-6 w-full overflow-hidden rounded-md">
                  {partitions.map((slice) => (
                    <div
                      key={slice.device}
                      style={{
                        width: `${Math.max(4, (slice.sizeGb / 512) * 100)}%`,
                        backgroundColor: slice.color,
                      }}
                      title={`${slice.label} (${slice.sizeGb} GB)`}
                    />
                  ))}
                </div>

                <div className="divide-y divide-slate-200/70 pt-2 text-xs dark:divide-slate-800">
                  {partitions.map((slice) => (
                    <div key={slice.device} className="flex items-center justify-between py-1.5">
                      <span className="font-mono text-[11px]">{slice.device}</span>
                      <span>{slice.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">{slice.filesystem}</span>
                      <span className="font-mono tabular-nums">{slice.sizeGb} GB</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Encrypt AetherOS root volume with LUKS2 (Argon2id)
                </span>
                <input
                  type="checkbox"
                  checked={luksEncrypt}
                  onChange={(e) => setLuksEncrypt(e.target.checked)}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-lg space-y-4">
              <h2 className="font-display text-lg font-semibold">
                Bootloader Configuration (GRUB 2.12)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select firmware target. UEFI mode installs Debian shim-signed for Secure Boot compatibility.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setFirmware('uefi')}
                  className={`w-full rounded-xl border p-4 text-left ${
                    firmware === 'uefi'
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="text-xs font-semibold">UEFI + GRUB2 (Recommended · Secure Boot Shim)</div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Installs to /boot/efi (GPT) with os-prober dual-boot detection for Windows Boot Manager.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFirmware('bios')}
                  className={`w-full rounded-xl border p-4 text-left ${
                    firmware === 'bios'
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="text-xs font-semibold">Legacy BIOS (MBR · i386-pc)</div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Installs GRUB stage 1 to /dev/nvme0n1 MBR for older non-UEFI motherboards.
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-lg space-y-3.5">
              <h2 className="font-display text-lg font-semibold">
                Create Administrator Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your user account is added to sudo, video, audio, and render groups for GPU &amp; PipeWire access.
              </p>

              <label className="block">
                <span className="text-xs font-medium">Full Name</span>
                <input
                  type="text"
                  value={user.fullName}
                  onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                  placeholder="e.g. Jordan Patel"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
                {userErrors.fullName && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                    {userErrors.fullName}
                  </p>
                )}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Username</span>
                  <input
                    type="text"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    placeholder="e.g. jpatel"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  {userErrors.username && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                      {userErrors.username}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-xs font-medium">Computer Hostname</span>
                  <input
                    type="text"
                    value={user.hostname}
                    onChange={(e) => setUser({ ...user, hostname: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  {userErrors.hostname && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                      {userErrors.hostname}
                    </p>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Password (min 8 chars)</span>
                  <input
                    type="password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  {userErrors.password && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                      {userErrors.password}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-xs font-medium">Confirm Password</span>
                  <input
                    type="password"
                    value={user.confirmPassword}
                    onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  {userErrors.confirmPassword && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                      {userErrors.confirmPassword}
                    </p>
                  )}
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-lg space-y-4">
              <h2 className="font-display text-lg font-semibold">
                Time Zone &amp; Clock Synchronization
              </h2>
              <label className="block">
                <span className="text-xs font-medium">Region / Time Zone</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                systemd-timesyncd NTP synchronization is enabled automatically; dual-boot RTC offset is configured when Windows 11 is detected.
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="max-w-2xl space-y-4">
              <h2 className="font-display text-lg font-semibold">
                {installComplete ? 'AetherOS 1.0 LTS Ready for First Boot' : 'Review & Install AetherOS'}
              </h2>

              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
                <div><span className="text-slate-500">Language:</span> {language.split('—')[0]}</div>
                <div><span className="text-slate-500">Keyboard:</span> {keyboard}</div>
                <div><span className="text-slate-500">Partitioning:</span> {partitionMode} ({luksEncrypt ? 'LUKS2' : 'ext4'})</div>
                <div><span className="text-slate-500">Bootloader:</span> GRUB 2.12 ({firmware.toUpperCase()})</div>
                <div><span className="text-slate-500">Account:</span> {user.username || 'pending'}@{user.hostname}</div>
                <div><span className="text-slate-500">Time Zone:</span> {timezone}</div>
              </div>

              {installing ? (
                <div className="space-y-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-sky-600 transition-all duration-300"
                      style={{
                        width: `${Math.round((logCount / INSTALL_LOGS.length) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300">
                    {INSTALL_LOGS.slice(0, logCount).map((line) => (
                      <div key={line} className="py-0.5">
                        {line}
                      </div>
                    ))}
                  </div>

                  {installComplete && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Installer dry-run completed. Use OS Build Studio to download calamares_installer.py and build-iso.sh for bare-metal or QEMU deployment.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLogCount(1);
                    setInstalling(true);
                  }}
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Begin Installation Preview
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Wizard Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            disabled={step === 0 || installing}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-sky-600 px-5 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setInstalling(false);
                setLogCount(0);
                setStep(0);
              }}
              className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Reset Wizard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
