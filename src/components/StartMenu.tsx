import { useMemo, useState } from 'react';
import { FileText, Lock, RotateCcw, Search, User } from 'lucide-react';
import type { AppId, FsNode } from '../os/types';
import { getRecentFiles } from '../os/fileSystem';
import { AppIconBadge } from './AppIcons';

interface StartMenuProps {
  mode: 'start' | 'search';
  files: FsNode[];
  onLaunchApp: (appId: AppId) => void;
  onOpenFileInManager: (node: FsNode) => void;
  onLockScreen: () => void;
  onRestartSystem: () => void;
  onClose: () => void;
}

const APPS: { id: AppId; name: string; subtitle: string }[] = [
  { id: 'adobe-manager', name: 'Adobe Compatibility', subtitle: 'Wine Prefixes & DXVK' },
  { id: 'file-manager', name: 'Files', subtitle: 'Tabs, NTFS & SMB' },
  { id: 'app-manager', name: 'Application Manager', subtitle: 'DEB, Flatpak, EXE/MSI' },
  { id: 'settings', name: 'System Settings', subtitle: 'GPU, Display & Security' },
  { id: 'os-installer', name: 'Install AetherOS', subtitle: 'Disk & Dual-Boot Wizard' },
  { id: 'os-studio', name: 'OS Build Studio', subtitle: 'ISO Scripts & Qt/QML' },
];

export function StartMenu({
  mode,
  files,
  onLaunchApp,
  onOpenFileInManager,
  onLockScreen,
  onRestartSystem,
  onClose,
}: StartMenuProps) {
  const [query, setQuery] = useState('');

  const recentFiles = useMemo(() => getRecentFiles(files, 4), [files]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APPS;
    return APPS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const matchedFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recentFiles;
    return files
      .filter((f) => f.kind !== 'folder' && f.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [files, query, recentFiles]);

  return (
    <div
      role="dialog"
      aria-label={mode === 'search' ? 'AetherOS Search' : 'AetherOS Start Menu'}
      className="animate-flyout-up acrylic-panel fixed bottom-[64px] left-1/2 z-50 w-[min(620px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-300/80 bg-white/94 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/94 dark:text-slate-100"
    >
      <div className="p-5">
        {/* Search Input */}
        <label className="relative block">
          <span className="sr-only">Search apps, settings, and files</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, Wine prefixes, settings, or files..."
            className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-950"
          />
        </label>

        {/* Pinned Applications */}
        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="font-display text-xs font-semibold text-slate-600 dark:text-slate-300">
              {query.trim() ? 'Matching Applications' : 'Pinned Applications'}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Debian 12 LTS · Qt 6 Shell
            </span>
          </div>

          {filteredApps.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching applications found.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    onLaunchApp(app.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-200/70 dark:hover:bg-slate-800/80"
                >
                  <AppIconBadge appId={app.id} size="md" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {app.name}
                    </div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {app.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recommended / Matching Files */}
        <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
          <h3 className="mb-2 font-display text-xs font-semibold text-slate-600 dark:text-slate-300">
            {query.trim() ? 'Matching Files' : 'Recommended & Recent Files'}
          </h3>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {matchedFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => {
                  onOpenFileInManager(file);
                  onClose();
                }}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-200/70 dark:hover:bg-slate-800/80"
              >
                <FileText className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    {file.modifiedAt}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Profile & Session Power Bar */}
      <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-100/75 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
            <User className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              aether-studio
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Administrator · Linux 6.12 LTS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLockScreen();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Lock</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRestartSystem();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reboot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
