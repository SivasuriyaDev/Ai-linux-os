import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FolderPlus,
  Layers,
  Play,
  ShieldCheck,
  Terminal,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  ADOBE_COMPATIBILITY_DB,
  runPrefixDiagnostics,
} from '../../os/adobeEngine';
import type {
  AdobeVersionEntry,
  CompatibilityTier,
  GraphicsLayer,
  WinePrefix,
} from '../../os/types';

interface AdobeCompatAppProps {
  prefixes: WinePrefix[];
  gpuVendor: 'Intel' | 'AMD' | 'NVIDIA';
  onCreatePrefix: (profile: AdobeVersionEntry, gpuBackend: WinePrefix['gpuBackend']) => void;
  onInstallRuntimes: (prefixId: string) => void;
  onUpdatePrefixGraphics: (prefixId: string, layer: GraphicsLayer) => void;
  onCreateLauncher: (prefixId: string) => void;
  onDeletePrefix: (prefixId: string) => void;
}

const TIER_STYLES: Record<CompatibilityTier, string> = {
  Gold: 'text-emerald-700 dark:text-emerald-400',
  Silver: 'text-sky-700 dark:text-sky-400',
  Bronze: 'text-amber-700 dark:text-amber-400',
  Unsupported: 'text-rose-700 dark:text-rose-400',
};

function gpuVendorToBackend(vendor: 'Intel' | 'AMD' | 'NVIDIA'): WinePrefix['gpuBackend'] {
  if (vendor === 'Intel') return 'Intel Arc / iGPU (Mesa Vulkan)';
  if (vendor === 'NVIDIA') return 'NVIDIA RTX (Proprietary 565 Vulkan)';
  return 'AMD Radeon RDNA (RADV Vulkan)';
}

export function AdobeCompatApp({
  prefixes,
  gpuVendor,
  onCreatePrefix,
  onInstallRuntimes,
  onUpdatePrefixGraphics,
  onCreateLauncher,
  onDeletePrefix,
}: AdobeCompatAppProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'prefixes' | 'diagnostics'>('matrix');
  const [tierFilter, setTierFilter] = useState<'All' | CompatibilityTier>('All');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(ADOBE_COMPATIBILITY_DB[0].id);
  const [selectedPrefixId, setSelectedPrefixId] = useState<string>(prefixes[0]?.id ?? '');
  const [diagRanAt, setDiagRanAt] = useState<string>('Ready');

  const filteredProfiles = useMemo(() => {
    if (tierFilter === 'All') return ADOBE_COMPATIBILITY_DB;
    return ADOBE_COMPATIBILITY_DB.filter((p) => p.tier === tierFilter);
  }, [tierFilter]);

  const selectedProfile =
    ADOBE_COMPATIBILITY_DB.find((p) => p.id === selectedProfileId) ?? ADOBE_COMPATIBILITY_DB[0];

  const activePrefix =
    prefixes.find((p) => p.id === selectedPrefixId) ?? prefixes[0] ?? null;

  const diagnosticChecks = useMemo(
    () => (activePrefix ? runPrefixDiagnostics(activePrefix) : []),
    [activePrefix]
  );

  const handleProvisionPrefix = (profile: AdobeVersionEntry) => {
    onCreatePrefix(profile, gpuVendorToBackend(gpuVendor));
    setActiveTab('prefixes');
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/60 text-slate-900 dark:bg-slate-950/50 dark:text-slate-100">
      {/* Top Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Adobe Compatibility Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Wine Staging 9.21 · Bottles · DXVK 2.4.1 · VKD3D-Proton 2.13 · Honest Version Matrix
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Adobe Compatibility sections"
          className="flex items-center gap-1 rounded-lg bg-slate-200/75 p-1 dark:bg-slate-800/80"
        >
          {[
            { id: 'matrix', label: 'Compatibility Matrix' },
            { id: 'prefixes', label: `Wine Prefixes (${prefixes.length})` },
            { id: 'diagnostics', label: 'Diagnostics & GPU' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Licensing & Honest Reporting Notice */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/75 px-5 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <span>
            Legitimate Adobe Creative Cloud license required. AetherOS never bypasses Adobe DRM or authentication and documents real Linux blockers honestly.
          </span>
        </div>
        <span className="hidden shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400 lg:inline">
          GPU: {gpuVendor} Vulkan
        </span>
      </div>

      {/* TAB 1: COMPATIBILITY MATRIX */}
      {activeTab === 'matrix' && (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          {/* Left: Application List */}
          <div className="flex min-h-0 flex-col border-b border-slate-200 lg:col-span-7 lg:border-b-0 lg:border-r dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 px-4 py-2.5 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Filter by verified tier
              </span>
              <div className="flex items-center gap-1">
                {(['All', 'Gold', 'Silver', 'Bronze', 'Unsupported'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTierFilter(tier)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      tierFilter === tier
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-800/80">
              {filteredProfiles.map((entry) => {
                const isSelected = entry.id === selectedProfile.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedProfileId(entry.id)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-sky-500/10 dark:bg-sky-500/15'
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        style={{ backgroundColor: entry.accentHex }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold text-slate-950"
                      >
                        {entry.shortCode}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {entry.appName}{' '}
                          <span className="font-normal text-slate-500 dark:text-slate-400">
                            {entry.version}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {entry.graphicsLayer} · {entry.wineRunner}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className={`text-xs font-semibold ${TIER_STYLES[entry.tier]}`}>
                        {entry.tier}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                        {entry.requiredRuntimes.length} runtimes
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Version Detail Inspector */}
          <div className="flex min-h-0 flex-col overflow-y-auto p-5 lg:col-span-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedProfile.appName}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Version {selectedProfile.version} · Tier:{' '}
                  <span className={`font-semibold ${TIER_STYLES[selectedProfile.tier]}`}>
                    {selectedProfile.tier}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleProvisionPrefix(selectedProfile)}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Create Prefix</span>
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedProfile.testedNotes}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Verified Working Capabilities
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {selectedProfile.workingFeatures.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Known Linux / Wine Blockers
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {selectedProfile.knownBlockers.map((blocker) => (
                    <li key={blocker} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>{blocker}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Required Winetricks Runtimes
                </h3>
                <p className="mt-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                  {selectedProfile.requiredRuntimes.join(' · ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISOLATED WINE PREFIXES */}
      {activeTab === 'prefixes' && (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col border-b border-slate-200 lg:col-span-5 lg:border-b-0 lg:border-r dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-2.5 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Isolated Wine Prefixes
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
              >
                + Provision from Matrix
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-200/70 dark:divide-slate-800">
              {prefixes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No Wine prefixes created yet. Pick an Adobe app from the Compatibility Matrix to provision an isolated prefix.
                </div>
              ) : (
                prefixes.map((prefix) => {
                  const active = activePrefix?.id === prefix.id;
                  return (
                    <button
                      key={prefix.id}
                      type="button"
                      onClick={() => setSelectedPrefixId(prefix.id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        active
                          ? 'bg-sky-500/10 dark:bg-sky-500/15'
                          : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {prefix.appName}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-medium ${
                            prefix.status === 'Ready'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : prefix.status === 'Needs Dependencies'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {prefix.status}
                        </span>
                      </div>
                      <div className="mt-1 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {prefix.version} · {prefix.path}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 lg:col-span-7">
            {!activePrefix ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a Wine prefix to manage dependencies, graphics acceleration, and desktop launchers.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                      {activePrefix.appName} ({activePrefix.version})
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      WINEPREFIX={activePrefix.path}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiagRanAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                        setActiveTab('diagnostics');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/70 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Run Diagnostics</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePrefix(activePrefix.id)}
                      className="rounded-lg border border-rose-300/70 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50 whitespace-nowrap shrink-0"
                    >
                      Remove Prefix
                    </button>
                  </div>
                </div>

                {/* Graphics Acceleration & Runner Config */}
                <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 dark:border-slate-800">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Graphics Acceleration Layer
                    </span>
                    <select
                      value={activePrefix.graphicsLayer}
                      onChange={(e) =>
                        onUpdatePrefixGraphics(activePrefix.id, e.target.value as GraphicsLayer)
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="DXVK 2.4.1 (Vulkan)">DXVK 2.4.1 (D3D11 -&gt; Vulkan)</option>
                      <option value="VKD3D-Proton 2.13 (D3D12->Vulkan)">VKD3D-Proton 2.13 (D3D12 -&gt; Vulkan)</option>
                      <option value="OpenGL Fallback">OpenGL Fallback (WineD3D)</option>
                      <option value="Software Mercury">Software Mercury (CPU Only)</option>
                    </select>
                  </label>

                  <div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Active Host Vulkan Backend
                    </span>
                    <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      <Cpu className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                      <span className="truncate">{activePrefix.gpuBackend}</span>
                    </div>
                  </div>
                </div>

                {/* Dependency & Runtime Checklist */}
                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Windows Runtimes & Winetricks Dependencies
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Installed: {activePrefix.installedRuntimes.join(', ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onInstallRuntimes(activePrefix.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Install Missing Runtimes</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Launcher Generator */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Freedesktop Application Launcher
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {activePrefix.launcherCreated
                        ? `Registered: ~/.local/share/applications/aether-${activePrefix.profileId}.desktop`
                        : 'Creates an isolated Start Menu & Desktop shortcut bound strictly to this WINEPREFIX.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCreateLauncher(activePrefix.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/70 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>{activePrefix.launcherCreated ? 'Refresh Launcher' : 'Create Launcher'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE DIAGNOSTICS & GPU STACK */}
      {activeTab === 'diagnostics' && (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                Prefix Compatibility Diagnostics
              </h2>
              <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                Inspecting {activePrefix ? `${activePrefix.appName} ${activePrefix.version}` : 'Host System'} · Last check: {diagRanAt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {prefixes.length > 0 && (
                <select
                  aria-label="Select Wine prefix for diagnostics"
                  value={activePrefix?.id ?? ''}
                  onChange={(e) => setSelectedPrefixId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {prefixes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.appName} ({p.version})
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() =>
                  setDiagRanAt(
                    new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  )
                }
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 whitespace-nowrap shrink-0"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Re-run Diagnostics</span>
              </button>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-200/80 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70">
            {diagnosticChecks.map((check) => (
              <div key={check.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                <div className="flex items-start gap-3">
                  {check.status === 'Pass' && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  {check.status === 'Warning' && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  {check.status === 'Blocker' && (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {check.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {check.detail}
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold ${
                    check.status === 'Pass'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : check.status === 'Warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
