import type { OSWindow } from '../os/types';
import { AppIconBadge } from './AppIcons';

interface AltTabSwitcherProps {
  windows: OSWindow[];
  selectedIndex: number;
  onSelectWindow: (windowId: string) => void;
  onClose: () => void;
}

export function AltTabSwitcher({
  windows,
  selectedIndex,
  onSelectWindow,
  onClose,
}: AltTabSwitcherProps) {
  if (windows.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-label="Window Switcher"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="acrylic-panel w-[min(740px,calc(100vw-32px))] rounded-2xl border border-slate-300/80 bg-white/95 p-5 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xs font-semibold">
              Active Window Switcher
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Alt + Tab to cycle · Click any window to bring to front
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            Esc to close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {windows.map((win, idx) => {
            const active = idx === selectedIndex % windows.length;
            return (
              <button
                key={win.id}
                type="button"
                onClick={() => onSelectWindow(win.id)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? 'border-sky-500 bg-sky-500/15 ring-2 ring-sky-500/30'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex w-full items-center gap-2.5">
                  <AppIconBadge appId={win.appId} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {win.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {win.minimized ? 'Minimized' : win.snap !== 'none' ? `Snapped: ${win.snap}` : 'Active'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
