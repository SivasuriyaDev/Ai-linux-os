import { Plus, X } from 'lucide-react';
import type { OSWindow, VirtualDesktop } from '../os/types';

interface VirtualDesktopOverlayProps {
  desktops: VirtualDesktop[];
  activeDesktopId: number;
  windows: OSWindow[];
  onSelectDesktop: (id: number) => void;
  onAddDesktop: () => void;
  onRemoveDesktop: (id: number) => void;
  onClose: () => void;
}

export function VirtualDesktopOverlay({
  desktops,
  activeDesktopId,
  windows,
  onSelectDesktop,
  onAddDesktop,
  onRemoveDesktop,
  onClose,
}: VirtualDesktopOverlayProps) {
  return (
    <div
      role="dialog"
      aria-label="Virtual Desktops"
      className="animate-flyout-up acrylic-panel fixed bottom-[64px] left-3 z-50 w-[min(640px,calc(100vw-24px))] rounded-2xl border border-slate-300/80 bg-white/94 p-4 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/94 dark:text-slate-100"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xs font-semibold text-slate-900 dark:text-slate-100">
            Virtual Desktops
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Separate Adobe creative sessions from OS engineering and build tools.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddDesktop}
          className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Desktop</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {desktops.map((desktop) => {
          const count = windows.filter((w) => w.desktopId === desktop.id).length;
          const active = desktop.id === activeDesktopId;
          return (
            <div
              key={desktop.id}
              className={`relative rounded-xl border p-3 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-slate-200 bg-slate-100/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectDesktop(desktop.id);
                  onClose();
                }}
                className="w-full text-left"
              >
                <div className="font-display text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {desktop.name}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                  {count} {count === 1 ? 'open window' : 'open windows'}
                </div>
              </button>

              {desktops.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveDesktop(desktop.id)}
                  aria-label={`Remove ${desktop.name}`}
                  className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
