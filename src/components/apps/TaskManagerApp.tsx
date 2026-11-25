import { useEffect, useMemo, useState } from 'react';
import { Activity, BellOff, Cpu, Flame, MemoryStick, Square, Zap } from 'lucide-react';
import type { ProcessItem, SystemSettingsState } from '../../os/types';

interface TaskManagerAppProps {
  processes: ProcessItem[];
  usage: {
    cpuPercent: number;
    ramUsedMb: number;
    ramTotalMb: number;
    gpuPercent: number;
    activeServices: number;
    idleBaselineMb: number;
  };
  settings: SystemSettingsState;
  onToggleRenderBoost: () => void;
  onEndProcess: (proc: ProcessItem) => void;
  onChangePriority: (pid: number, priority: ProcessItem['priority']) => void;
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  const max = Math.max(100, ...values);
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 180;
      const y = 44 - (v / max) * 40;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 180 46" className="h-11 w-full" aria-hidden="true">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function TaskManagerApp({
  processes,
  usage,
  settings,
  onToggleRenderBoost,
  onEndProcess,
  onChangePriority,
}: TaskManagerAppProps) {
  const [tab, setTab] = useState<'processes' | 'performance'>('processes');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProcessItem['category']>('All');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => [
    12, 14, 13, 15, 11, 13, 14, 12, 13, 14, 12, 13,
  ]);
  const [gpuHistory, setGpuHistory] = useState<number[]>(() => [
    14, 15, 16, 15, 14, 17, 16, 15, 16, 15, 17, 16,
  ]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCpuHistory((prev) => [
        ...prev.slice(1),
        Math.max(2, Math.min(96, Math.round(usage.cpuPercent + (Math.random() * 4 - 2)))),
      ]);
      setGpuHistory((prev) => [
        ...prev.slice(1),
        Math.max(1, Math.min(98, Math.round(usage.gpuPercent + (Math.random() * 5 - 2)))),
      ]);
    }, 1800);
    return () => window.clearInterval(id);
  }, [usage.cpuPercent, usage.gpuPercent]);

  const filteredProcesses = useMemo(() => {
    if (categoryFilter === 'All') return processes;
    return processes.filter((p) => p.category === categoryFilter);
  }, [processes, categoryFilter]);

  const selectedProc = processes.find((p) => p.pid === selectedPid) ?? null;

  return (
    <div className="flex h-full flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Header + Render Boost Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Task Manager &amp; System Monitor
          </h1>
          <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            Idle Baseline: {usage.idleBaselineMb} MB · Active systemd units: {usage.activeServices} · Governor: {settings.powerProfile}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleRenderBoost}
            aria-pressed={settings.renderBoost}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              settings.renderBoost
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{settings.renderBoost ? 'Render Boost: ON (DND)' : 'Enable Render Boost'}</span>
          </button>

          <div className="flex items-center gap-1 rounded-lg bg-slate-200/75 p-1 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setTab('processes')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                tab === 'processes'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Processes ({processes.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('performance')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                tab === 'performance'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Performance
            </button>
          </div>
        </div>
      </div>

      {/* Render Boost Info Strip */}
      {settings.renderBoost && (
        <div className="flex items-center justify-between gap-2 border-b border-amber-300/60 bg-amber-50 px-5 py-2 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <BellOff className="h-3.5 w-3.5 shrink-0" />
            <span>
              Render Boost active: non-essential indexers paused, notifications silenced (Do Not Disturb), Wine prefixes elevated to High priority.
            </span>
          </div>
          <span className="shrink-0 font-mono text-[11px] tabular-nums">-95 MB freed</span>
        </div>
      )}

      {/* Top Live Metrics Strip */}
      <div className="grid grid-cols-4 gap-3 border-b border-slate-200 bg-white/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-sky-500" />
            <span>CPU Utilization</span>
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
            {usage.cpuPercent}%
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <MemoryStick className="h-3.5 w-3.5 text-emerald-500" />
            <span>Memory (16 GB)</span>
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
            {usage.ramUsedMb} MB
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Flame className="h-3.5 w-3.5 text-indigo-500" />
            <span>{settings.gpuVendor} Vulkan GPU</span>
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
            {usage.gpuPercent}%
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Activity className="h-3.5 w-3.5 text-amber-500" />
            <span>systemd Units</span>
          </div>
          <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
            {usage.activeServices} active
          </div>
        </div>
      </div>

      {tab === 'processes' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Category Filter + End Task Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-5 py-2 dark:border-slate-800">
            <div className="flex items-center gap-1">
              {(['All', 'Wine Prefix', 'Desktop App', 'System', 'Background'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-sky-600'
                        : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedProc && (
                <select
                  aria-label={`Set priority for ${selectedProc.name}`}
                  value={selectedProc.priority}
                  onChange={(e) =>
                    onChangePriority(
                      selectedProc.pid,
                      e.target.value as ProcessItem['priority']
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="High">Priority: High</option>
                  <option value="Normal">Priority: Normal</option>
                  <option value="Low">Priority: Low</option>
                </select>
              )}

              <button
                type="button"
                disabled={!selectedProc || !selectedProc.killable}
                onClick={() => {
                  if (selectedProc && selectedProc.killable) {
                    onEndProcess(selectedProc);
                    setSelectedPid(null);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Square className="h-3 w-3" />
                <span>End Task</span>
              </button>
            </div>
          </div>

          {/* Process Table */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-100/95 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2">Process</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">PID</th>
                  <th className="px-3 py-2 text-right">CPU</th>
                  <th className="px-3 py-2 text-right">Memory</th>
                  <th className="px-3 py-2 text-right">GPU</th>
                  <th className="px-4 py-2 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {filteredProcesses.map((proc) => {
                  const selected = proc.pid === selectedPid;
                  return (
                    <tr
                      key={proc.pid}
                      onClick={() => setSelectedPid(proc.pid)}
                      className={`cursor-pointer transition-colors ${
                        selected
                          ? 'bg-sky-500/15'
                          : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedPid(proc.pid)}
                          className="text-left focus:outline-none"
                        >
                          {proc.name}
                          {proc.pausedByBoost && (
                            <span className="ml-2 text-[11px] text-amber-600 dark:text-amber-400">
                              Paused by Render Boost
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                        {proc.category}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {proc.pid}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                        {proc.cpuPercent.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                        {proc.ramMb} MB
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                        {proc.gpuPercent}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">
                        {proc.priority}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Performance Sparkline Graphs */
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">CPU — Linux 6.12 LTS Scheduler</span>
              <span className="font-mono text-sky-600 tabular-nums dark:text-sky-400">
                {usage.cpuPercent}%
              </span>
            </div>
            <div className="mt-3">
              <Sparkline values={cpuHistory} stroke="#0ea5e9" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              PREEMPT_DYNAMIC · Fsync futex2 active · Governor: {settings.powerProfile}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{settings.gpuVendor} Vulkan Graphics</span>
              <span className="font-mono text-indigo-600 tabular-nums dark:text-indigo-400">
                {usage.gpuPercent}%
              </span>
            </div>
            <div className="mt-3">
              <Sparkline values={gpuHistory} stroke="#6366f1" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              DXVK 2.4.1 &amp; VKD3D-Proton 2.13 ready · Hardware video decode active
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Memory &amp; ZRAM Swap Breakdown</span>
              <span className="font-mono tabular-nums">
                {usage.ramUsedMb} MB / {usage.ramTotalMb} MB
              </span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(4, (usage.ramUsedMb / usage.ramTotalMb) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Debian Minimal idle footprint: {usage.idleBaselineMb} MB · ZRAM lz4 compressed swap ({settings.zramSwapPercent}% allocation) prevents OOM stalls during large Photoshop PSD layers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
