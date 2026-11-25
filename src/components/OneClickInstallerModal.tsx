import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Package,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { formatBytes } from '../os/fileSystem';
import type { ExeInstallRequest } from '../os/types';

interface OneClickInstallerModalProps {
  request: ExeInstallRequest;
  onClose: () => void;
  onCompleteInstall: (config: {
    fileName: string;
    format: ExeInstallRequest['format'];
    prefixName: string;
    useDxvk: boolean;
    winVersion: 'win10' | 'win11';
    installVcRun: boolean;
    createDesktopShortcut: boolean;
  }) => void;
  onOpenAppManager: () => void;
}

function getReadableAppName(fileName: string): string {
  return fileName
    .replace(/\.(exe|msi|deb|appimage)$/i, '')
    .replace(/[_-]+(setup|installer|x64|x86_64|amd64)$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

function getDefaultPrefixSlug(fileName: string): string {
  return (
    fileName
      .toLowerCase()
      .replace(/\.(exe|msi|deb|appimage)$/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'custom-app'
  );
}

function getAutoSteps(format: ExeInstallRequest['format']): string[] {
  if (format === 'Debian (.deb)') {
    return [
      'Verifying .deb package signature & metadata',
      'Resolving Debian dependencies automatically via APT (zero terminal)',
      'Registering Start Menu & Desktop launcher',
    ];
  }
  if (format === 'AppImage') {
    return [
      'Auto-enabling executable permission (no manual chmod +x)',
      'Integrating portable bundle into ~/Applications',
      'Creating Start Menu & Desktop application shortcut',
    ];
  }
  return [
    'Creating isolated 64-bit Wine prefix automatically',
    'Enabling Vulkan DXVK GPU acceleration & Microsoft VC++ runtimes',
    'Running Windows installer & registering native Linux launcher',
  ];
}

export function OneClickInstallerModal({
  request,
  onClose,
  onCompleteInstall,
  onOpenAppManager,
}: OneClickInstallerModalProps) {
  const isWindowsPkg = request.format === 'EXE' || request.format === 'MSI';
  const appName = getReadableAppName(request.fileName);
  const steps = getAutoSteps(request.format);

  const [phase, setPhase] = useState<'ready' | 'installing' | 'done'>('ready');
  const [stepIdx, setStepIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [prefixName, setPrefixName] = useState(() =>
    request.suggestedAppId || getDefaultPrefixSlug(request.fileName)
  );
  const [useDxvk, setUseDxvk] = useState(true);
  const [winVersion, setWinVersion] = useState<'win10' | 'win11'>('win10');
  const [installVcRun, setInstallVcRun] = useState(true);
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);

  const completeRef = useRef(onCompleteInstall);
  completeRef.current = onCompleteInstall;

  const configRef = useRef({
    fileName: request.fileName,
    format: request.format,
    prefixName,
    useDxvk,
    winVersion,
    installVcRun,
    createDesktopShortcut,
  });
  configRef.current = {
    fileName: request.fileName,
    format: request.format,
    prefixName: prefixName.trim() || getDefaultPrefixSlug(request.fileName),
    useDxvk,
    winVersion,
    installVcRun,
    createDesktopShortcut,
  };

  useEffect(() => {
    if (phase !== 'installing') return;
    const t1 = window.setTimeout(() => setStepIdx(1), 350);
    const t2 = window.setTimeout(() => setStepIdx(2), 700);
    const t3 = window.setTimeout(() => {
      completeRef.current(configRef.current);
      setPhase('done');
    }, 1050);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [phase]);

  return (
    <div
      role="dialog"
      aria-label="1-Click Express Installer"
      className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && phase !== 'installing') onClose();
      }}
    >
      <div className="acrylic-panel w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-300/85 bg-white text-slate-900 shadow-2xl dark:border-slate-700/85 dark:bg-[#0f172a] dark:text-slate-100">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Package className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                AetherOS 1-Click Setup
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Zero-terminal Windows-style installer · {request.format}
              </p>
            </div>
          </div>

          {phase !== 'installing' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close 1-Click Installer"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          {/* App Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {appName}
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {request.fileName}
                  {request.sizeBytes ? ` · ${formatBytes(request.sizeBytes)}` : ''}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-medium text-sky-600 dark:text-sky-400">
                {request.format}
              </span>
            </div>
          </div>

          {phase === 'ready' && (
            <div className="mt-4 space-y-4">
              {/* Automatic steps explanation */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                  <span>Automatic Express Configuration (No Terminal Needed)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {steps.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={createDesktopShortcut}
                  onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                  className="h-4 w-4 rounded accent-sky-600"
                />
                <span>Add shortcut to Start Menu &amp; Application Manager</span>
              </label>

              {/* Optional Advanced toggle for Windows EXE/MSI */}
              {isWindowsPkg && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    <span>Advanced Wine Prefix Options (Optional)</span>
                    {showAdvanced ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-3 border-t border-slate-200 p-3.5 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-2.5">
                        <label className="block">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Isolated Prefix Folder
                          </span>
                          <input
                            type="text"
                            value={prefixName}
                            onChange={(e) => setPrefixName(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Windows Target
                          </span>
                          <select
                            value={winVersion}
                            onChange={(e) =>
                              setWinVersion(e.target.value as 'win10' | 'win11')
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                          >
                            <option value="win10">Windows 10</option>
                            <option value="win11">Windows 11</option>
                          </select>
                        </label>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={useDxvk}
                          onChange={(e) => setUseDxvk(e.target.checked)}
                          className="h-3.5 w-3.5 rounded accent-sky-600"
                        />
                        <span>Enable DXVK Vulkan GPU Acceleration</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={installVcRun}
                          onChange={(e) => setInstallVcRun(e.target.checked)}
                          className="h-3.5 w-3.5 rounded accent-sky-600"
                        />
                        <span>Auto-install Visual C++ 2022 &amp; corefonts</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStepIdx(0);
                    setPhase('installing');
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-500"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Install Now</span>
                </button>
              </div>
            </div>
          )}

          {phase === 'installing' && (
            <div className="mt-5 space-y-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="space-y-2 text-xs">
                {steps.map((step, idx) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 ${
                      idx <= stepIdx
                        ? 'font-medium text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        idx < stepIdx
                          ? 'text-emerald-500'
                          : idx === stepIdx
                            ? 'text-sky-500'
                            : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <div className="font-semibold">
                    {appName} installed successfully!
                  </div>
                  <p className="mt-1 opacity-90">
                    All permissions, dependencies, and launchers were configured automatically. Ready to use from Application Manager and Start Menu.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAppManager();
                  }}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  View in App Manager
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-500"
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
