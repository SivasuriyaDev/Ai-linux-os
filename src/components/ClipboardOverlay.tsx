import React, { useState } from 'react';
import { Check, Copy, Pin, Plus, Trash2 } from 'lucide-react';
import type { ClipboardItem } from '../os/types';

interface ClipboardOverlayProps {
  items: ClipboardItem[];
  onCopy: (text: string) => void;
  onAdd: (text: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
  onClearUnpinned: () => void;
}

export function ClipboardOverlay({
  items,
  onCopy,
  onAdd,
  onTogglePin,
  onRemove,
  onClearUnpinned,
}: ClipboardOverlayProps) {
  const [draft, setDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  const handleCopyItem = (item: ClipboardItem) => {
    onCopy(item.text);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <div
      role="dialog"
      aria-label="Clipboard History"
      className="animate-flyout-up acrylic-panel fixed bottom-[64px] right-3 z-50 flex max-h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-300/80 bg-white/95 text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100"
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <div>
          <h3 className="font-display text-xs font-semibold text-slate-900 dark:text-white">
            Clipboard History
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Shortcut: Alt + V · {items.length} saved items
          </p>
        </div>
        {items.some((i) => !i.pinned) && (
          <button
            type="button"
            onClick={onClearUnpinned}
            className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
          >
            Clear Unpinned
          </button>
        )}
      </div>

      {/* Add Quick Snippet */}
      <form
        onSubmit={handleAdd}
        className="flex items-center gap-2 border-b border-slate-200/80 px-3 py-2.5 dark:border-slate-800"
      >
        <label className="sr-only" htmlFor="clipboard-quick-add">
          Add text or hex color to clipboard
        </label>
        <input
          id="clipboard-quick-add"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Save snippet, command, or #HEX color..."
          className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="submit"
          aria-label="Save to clipboard history"
          className="flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Save</span>
        </button>
      </form>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {items.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Clipboard is empty. Copy code from OS Build Studio, Terminal, or add a snippet above.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 dark:border-slate-800 dark:bg-slate-950/70"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {item.kind === 'color' && (
                    <span
                      style={{ backgroundColor: item.text }}
                      className="h-4 w-4 shrink-0 rounded border border-slate-400/50"
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {item.source} · {item.timestamp}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopyItem(item)}
                    aria-label={`Copy clipboard item ${item.text.slice(0, 24)}`}
                    className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onTogglePin(item.id)}
                    aria-label={item.pinned ? 'Unpin clipboard item' : 'Pin clipboard item'}
                    aria-pressed={item.pinned}
                    className={`rounded p-1 transition-colors ${
                      item.pinned
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                        : 'text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Delete clipboard item ${item.text.slice(0, 24)}`}
                    className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p
                className={`mt-1.5 line-clamp-2 break-all text-xs leading-relaxed text-slate-800 dark:text-slate-200 ${
                  item.kind === 'command' || item.kind === 'path' || item.kind === 'color'
                    ? 'font-mono text-[11px]'
                    : ''
                }`}
              >
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
