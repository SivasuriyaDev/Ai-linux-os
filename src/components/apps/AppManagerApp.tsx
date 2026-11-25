import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileUp,
  Package,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import type { ExeInstallRequest, PackageFormat, SoftwarePackage } from '../../os/types';

interface AppManagerAppProps {
  packages: SoftwarePackage[];
  pendingExeRequest: ExeInstallRequest | null;
  onClearExeRequest: () => void;
  onToggleInstall: (pkgId: string) => void;
  onCompleteExeInstall: (config: {
    fileName: string;
    format: 'EXE' | 'MSI';
    prefixName: string;
    useDxvk: boolean;
    winVersion: 'win10' | 'win11';
    installVcRun: boolean;
  }) => void;
}

const FORMAT_FILTERS: ('All' | PackageFormat)[] = [
  'All',
  'Debian (.deb)',
  'Flatpak',
  'AppImage',
  'Wine',
  'EXE',
  'MSI',
];

export function AppManagerApp({
  packages,
  pendingExeRequest,
  onClearExeRequest,
  onToggleInstall,
  onCompleteExeInstall,
}: AppManagerAppProps) {
  const [formatFilter, setFormatFilter] = useState<'All' | PackageFormat>('All');
  const [search, setSearch] = useState('');
  const [showManualWizard, setShowManualWizard] = useState(false);

  // EXE / MSI Wine Wizard form state
  const [manualFileName, setManualFileName] = useState('Photoshop_2021_Setup.exe');
  const [manualFormat, setManualFormat] = useState<'EXE' | 'MSI'>('EXE');
  const [prefixName, setPrefixName] = useState('photoshop-2021-isolated');
  const [useDxvk, setUseDxvk] = useState(true);
  const [winVersion, setWinVersion] = useState<'win10' | 'win11'>('win10');
  const [installVcRun, setInstallVcRun] = useState(true);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);

  const wizardActive = Boolean(pendingExeRequest) || showManualWizard;
  const activeFileName = pendingExeRequest?.fileName ?? manualFileName;
  const activeFormat = pendingExeRequest?.format ?? manualFormat;

  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (formatFilter !== 'All' && pkg.format !== formatFilter) return false;
      if (!q) return true;
      return (
        pkg.name.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q) ||
        pkg.format.toLowerCase().includes(q)
      );
    });
  }, [packages, formatFilter, search]);

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = activeFileName.trim() || 'Windows_Installer.exe';
    const cleanedPrefix = prefixName.trim() || 'custom-wine-prefix';
    onCompleteExeInstall({
      fileName: cleanedName,
      format: activeFormat,
      prefixName: cleanedPrefix,
      useDxvk,
      winVersion,
      installVcRun,
    });
    setInstallSuccess(`Configured isolated prefix "${cleanedPrefix}" and registered launcher for ${cleanedName}.`);
    setShowManualWizard(false);
    onClearExeRequest();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Unified Application Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Debian APT · Flatpak · AppImage · Wine Prefixes · EXE &amp; MSI Installer Workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search applications and packages</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packages..."
              className="w-44 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setInstallSuccess(null);
              setShowManualWizard(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
          >
            <FileUp className="h-3.5 w-3.5" />
            <span>Install EXE / MSI</span>
          </button>
        </div>
      </div>

      {/* Format Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/80 bg-white/80 px-5 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        {FORMAT_FILTERS.map((fmt) => (
          <button
            key={fmt}
            type="button"
            onClick={() => setFormatFilter(fmt)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              formatFilter === fmt
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {fmt}
          </button>
        ))}
      </div>

      {installSuccess && (
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-5 py-2.5 text-xs text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{installSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setInstallSuccess(null)}
            className="text-xs font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Guided EXE / MSI Wine Installer Workflow */}
      {wizardActive ? (
        <form
          onSubmit={handleWizardSubmit}
          className="min-h-0 flex-1 overflow-y-auto p-6"
        >
          <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  Windows {activeFormat} Guided Wine Installer
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Automatically isolates the application in its own 64-bit Wine prefix with Vulkan acceleration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowManualWizard(false);
                  onClearExeRequest();
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Installer File
                  </span>
                  <input
                    type="text"
                    value={activeFileName}
                    disabled={Boolean(pendingExeRequest)}
                    onChange={(e) => setManualFileName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Package Format
                  </span>
                  <select
                    value={activeFormat}
                    disabled={Boolean(pendingExeRequest)}
                    onChange={(e) => setManualFormat(e.target.value as 'EXE' | 'MSI')}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="EXE">Windows EXE</option>
                    <option value="MSI">Windows MSI</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Isolated Wine Prefix Name
                  </span>
                  <input
                    type="text"
                    value={prefixName}
                    onChange={(e) => setPrefixName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Emulated Windows Target
                  </span>
                  <select
                    value={winVersion}
                    onChange={(e) => setWinVersion(e.target.value as 'win10' | 'win11')}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="win10">Windows 10 (Recommended for Adobe)</option>
                    <option value="win11">Windows 11</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={useDxvk}
                    onChange={(e) => setUseDxvk(e.target.checked)}
                    className="h-4 w-4 rounded accent-sky-600"
                  />
                  <span>Install DXVK 2.4.1 &amp; VKD3D-Proton (Vulkan GPU Acceleration)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={installVcRun}
                    onChange={(e) => setInstallVcRun(e.target.checked)}
                    className="h-4 w-4 rounded accent-sky-600"
                  />
                  <span>Pre-install Microsoft Visual C++ 2022, msxml6, gdiplus &amp; corefonts</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualWizard(false);
                    onClearExeRequest();
                  }}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-500"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Configure Prefix &amp; Install</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Package Catalog List */
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {filteredPackages.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No packages match the selected format or search query.
            </p>
          ) : (
            <div className="divide-y divide-slate-200/80 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-sky-400">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {pkg.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {pkg.format} · v{pkg.version} · {pkg.sizeLabel} · {pkg.publisher}
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleInstall(pkg.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      pkg.installed
                        ? 'border border-slate-300 text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-700 dark:hover:text-rose-400'
                        : 'bg-sky-600 text-white hover:bg-sky-500'
                    }`}
                  >
                    {pkg.installed ? (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Uninstall</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Install</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
