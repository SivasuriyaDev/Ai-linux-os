import React, { useMemo, useState } from 'react';
import { CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import type { FontEntry, WinePrefix } from '../../os/types';

interface FontManagerAppProps {
  fonts: FontEntry[];
  prefixes: WinePrefix[];
  onSyncAllToWine: () => void;
  onSyncFontToWine: (fontId: string) => void;
  onAddFont: (family: string, format: 'TTF' | 'OTF', category: FontEntry['category']) => void;
}

export function FontManagerApp({
  fonts,
  prefixes,
  onSyncAllToWine,
  onSyncFontToWine,
  onAddFont,
}: FontManagerAppProps) {
  const [sampleText, setSampleText] = useState(
    'The quick brown fox jumps over 128 creative layers — AetherOS 1.0'
  );
  const [previewSize, setPreviewSize] = useState(20);
  const [category, setCategory] = useState<'All' | FontEntry['category']>('All');
  const [newFamily, setNewFamily] = useState('');
  const [newFormat, setNewFormat] = useState<'TTF' | 'OTF'>('OTF');
  const [newCategory, setNewCategory] = useState<FontEntry['category']>('Sans-Serif');

  const visibleFonts = useMemo(() => {
    if (category === 'All') return fonts;
    return fonts.filter((f) => f.category === category);
  }, [fonts, category]);

  const handleInstallCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.trim()) return;
    onAddFont(newFamily, newFormat, newCategory);
    setNewFamily('');
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/75 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Font Manager (Linux + Adobe Wine Sync)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Installs fonts to ~/.local/share/fonts and mirrors them into {prefixes.length} isolated Adobe Wine prefixes
          </p>
        </div>

        <button
          type="button"
          onClick={onSyncAllToWine}
          className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync All to Wine Prefixes</span>
        </button>
      </div>

      {/* Live Preview Controls & Add Font Bar */}
      <div className="space-y-2.5 border-b border-slate-200/80 bg-white/85 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-[240px] flex-1">
            <span className="sr-only">Live font preview text</span>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Type sample text to preview fonts..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <label className="flex w-44 shrink-0 items-center gap-2 text-xs">
            <span className="shrink-0 text-slate-500 tabular-nums dark:text-slate-400">
              {previewSize}px
            </span>
            <input
              type="range"
              min={14}
              max={34}
              value={previewSize}
              onChange={(e) => setPreviewSize(Number(e.target.value))}
              aria-label="Preview font size"
              className="w-full accent-sky-600"
            />
          </label>
        </div>

        <form onSubmit={handleInstallCustom} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newFamily}
            onChange={(e) => setNewFamily(e.target.value)}
            placeholder="Install custom .ttf / .otf font family (e.g. Inter Display)..."
            aria-label="Custom font family name"
            className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <select
            aria-label="Font format"
            value={newFormat}
            onChange={(e) => setNewFormat(e.target.value as 'TTF' | 'OTF')}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="OTF">OTF</option>
            <option value="TTF">TTF</option>
          </select>
          <select
            aria-label="Font category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as FontEntry['category'])}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="Sans-Serif">Sans-Serif</option>
            <option value="Serif">Serif</option>
            <option value="Monospace">Monospace</option>
            <option value="Windows Core">Windows Core</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Install Font</span>
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 px-5 py-2 dark:border-slate-800">
        {(['All', 'Sans-Serif', 'Serif', 'Monospace', 'Windows Core'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              category === cat
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Font Specimen Cards */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
        {visibleFonts.map((font) => {
          const allSynced =
            prefixes.length > 0 &&
            prefixes.every((p) => font.syncedWinePrefixes.includes(p.id));
          return (
            <div
              key={font.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {font.family}
                  </span>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    {font.fileName} · {font.category} · {font.syncedWinePrefixes.length}/{prefixes.length} Wine prefixes synced
                  </span>
                </div>

                {allSynced ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Synced to Adobe Prefixes
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSyncFontToWine(font.id)}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Sync to Wine Prefixes
                  </button>
                )}
              </div>

              <div
                style={{ fontFamily: font.cssFont, fontSize: `${previewSize}px` }}
                className="mt-3 truncate text-slate-800 dark:text-slate-100"
              >
                {sampleText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
