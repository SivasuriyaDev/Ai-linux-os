import type {
  ClipboardItem,
  ColorProfileId,
  FontEntry,
  OSWindow,
  ProcessItem,
  SystemSettingsState,
  WinePrefix,
} from './types';

export const INITIAL_CLIPBOARD_ITEMS: ClipboardItem[] = [
  {
    id: 'clip-1',
    text: 'WINEPREFIX=~/.local/share/aether-adobe/prefixes/photoshop-2021 WINEFSYNC=1 wine photoshop.exe',
    source: 'Adobe Compatibility Manager',
    kind: 'command',
    pinned: true,
    timestamp: '08:52',
  },
  {
    id: 'clip-2',
    text: '#0EA5E9',
    source: 'Color Calibration Hub',
    kind: 'color',
    pinned: false,
    timestamp: '08:47',
  },
  {
    id: 'clip-3',
    text: 'sudo ./build-iso.sh',
    source: 'OS Build Studio',
    kind: 'command',
    pinned: false,
    timestamp: '08:40',
  },
];

export function detectClipboardKind(text: string): ClipboardItem['kind'] {
  const trimmed = text.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return 'color';
  if (/^(~\/|\/[a-zA-Z0-9._-]+|smb:\/\/)/.test(trimmed)) return 'path';
  if (/^(sudo|wine|WINEPREFIX|vulkaninfo|apt|nft|systemctl|bash|\.\/*)/.test(trimmed)) {
    return 'command';
  }
  return 'text';
}

export function addClipboardItem(
  items: ClipboardItem[],
  text: string,
  source: string,
  timestamp = 'Now'
): ClipboardItem[] {
  const trimmed = text.trim();
  if (!trimmed) return items;
  const deduped = items.filter((item) => item.text !== trimmed);
  const created: ClipboardItem = {
    id: `clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    text: trimmed,
    source,
    kind: detectClipboardKind(trimmed),
    pinned: false,
    timestamp,
  };
  return [created, ...deduped].slice(0, 20);
}

export function togglePinClipboardItem(items: ClipboardItem[], id: string): ClipboardItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, pinned: !item.pinned } : item
  );
}

export function removeClipboardItem(items: ClipboardItem[], id: string): ClipboardItem[] {
  return items.filter((item) => item.id !== id);
}

export function clearUnpinnedClipboard(items: ClipboardItem[]): ClipboardItem[] {
  return items.filter((item) => item.pinned);
}

export const INITIAL_FONTS: FontEntry[] = [
  {
    id: 'font-jakarta',
    family: 'Plus Jakarta Sans',
    fileName: 'PlusJakartaSans-Variable.ttf',
    format: 'TTF',
    category: 'Sans-Serif',
    cssFont: '"Plus Jakarta Sans", sans-serif',
    installedLinux: true,
    syncedWinePrefixes: ['prefix-ps-2021'],
  },
  {
    id: 'font-dm-sans',
    family: 'DM Sans',
    fileName: 'DMSans-Regular.ttf',
    format: 'TTF',
    category: 'Sans-Serif',
    cssFont: '"DM Sans", sans-serif',
    installedLinux: true,
    syncedWinePrefixes: ['prefix-ps-2021'],
  },
  {
    id: 'font-jetbrains',
    family: 'JetBrains Mono',
    fileName: 'JetBrainsMono-Regular.ttf',
    format: 'TTF',
    category: 'Monospace',
    cssFont: '"JetBrains Mono", monospace',
    installedLinux: true,
    syncedWinePrefixes: ['prefix-ps-2021'],
  },
  {
    id: 'font-liberation-sans',
    family: 'Liberation Sans (Arial Metric)',
    fileName: 'LiberationSans-Regular.ttf',
    format: 'TTF',
    category: 'Windows Core',
    cssFont: 'Arial, sans-serif',
    installedLinux: true,
    syncedWinePrefixes: ['prefix-ps-2021', 'prefix-ai-2021'],
  },
  {
    id: 'font-liberation-serif',
    family: 'Liberation Serif (Times Metric)',
    fileName: 'LiberationSerif-Regular.ttf',
    format: 'TTF',
    category: 'Serif',
    cssFont: 'Georgia, serif',
    installedLinux: true,
    syncedWinePrefixes: [],
  },
  {
    id: 'font-carlito',
    family: 'Carlito (Calibri Metric)',
    fileName: 'Carlito-Regular.otf',
    format: 'OTF',
    category: 'Windows Core',
    cssFont: 'system-ui, sans-serif',
    installedLinux: false,
    syncedWinePrefixes: [],
  },
];

export function syncFontsToPrefixes(
  fonts: FontEntry[],
  prefixIds: string[],
  fontId?: string
): FontEntry[] {
  return fonts.map((font) => {
    if (fontId && font.id !== fontId) return font;
    if (!font.installedLinux && !fontId) return font;
    return {
      ...font,
      installedLinux: true,
      syncedWinePrefixes: Array.from(new Set([...font.syncedWinePrefixes, ...prefixIds])),
    };
  });
}

export function addCustomFont(
  fonts: FontEntry[],
  family: string,
  format: 'TTF' | 'OTF',
  category: FontEntry['category']
): { fonts: FontEntry[]; created: FontEntry } {
  const clean = family.trim() || 'Custom Studio Font';
  const slug = clean.replace(/[^a-zA-Z0-9]+/g, '');
  const created: FontEntry = {
    id: `font-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    family: clean,
    fileName: `${slug || 'StudioFont'}-Regular.${format.toLowerCase()}`,
    format,
    category,
    cssFont:
      category === 'Monospace'
        ? '"JetBrains Mono", monospace'
        : category === 'Serif'
          ? 'Georgia, serif'
          : '"Plus Jakarta Sans", sans-serif',
    installedLinux: true,
    syncedWinePrefixes: [],
  };
  return { fonts: [created, ...fonts], created };
}

export function bulkInstallFontsFromFiles(
  existingFonts: FontEntry[],
  fontFiles: { fileName: string; family: string; format: 'TTF' | 'OTF' }[],
  activePrefixIds: string[]
): { fonts: FontEntry[]; installedCount: number; newlyAdded: string[] } {
  const updated = [...existingFonts];
  const newlyAdded: string[] = [];
  let installedCount = 0;

  for (const file of fontFiles) {
    const existingIdx = updated.findIndex(
      (f) =>
        f.fileName.toLowerCase() === file.fileName.toLowerCase() ||
        f.family.toLowerCase() === file.family.toLowerCase()
    );

    if (existingIdx >= 0) {
      const current = updated[existingIdx];
      updated[existingIdx] = {
        ...current,
        installedLinux: true,
        syncedWinePrefixes: Array.from(
          new Set([...current.syncedWinePrefixes, ...activePrefixIds])
        ),
      };
      installedCount++;
      continue;
    }

    const lower = file.family.toLowerCase();
    const category: FontEntry['category'] = lower.includes('mono') || lower.includes('code')
      ? 'Monospace'
      : lower.includes('serif') || lower.includes('playfair') || lower.includes('times')
        ? 'Serif'
        : 'Sans-Serif';

    const created: FontEntry = {
      id: `font-${Date.now()}-${Math.floor(Math.random() * 10000)}-${installedCount}`,
      family: file.family,
      fileName: file.fileName,
      format: file.format,
      category,
      cssFont:
        category === 'Monospace'
          ? '"JetBrains Mono", monospace'
          : category === 'Serif'
            ? 'Georgia, serif'
            : '"Plus Jakarta Sans", sans-serif',
      installedLinux: true,
      syncedWinePrefixes: [...activePrefixIds],
    };
    updated.unshift(created);
    newlyAdded.push(file.family);
    installedCount++;
  }

  return { fonts: updated, installedCount, newlyAdded };
}

export interface IccColorProfile {
  id: ColorProfileId;
  name: string;
  gamutCoverage: string;
  whitePoint: string;
  gamma: string;
  deltaE: string;
  bestFor: string;
  swatches: { label: string; hex: string }[];
}

export const ICC_PROFILES: IccColorProfile[] = [
  {
    id: 'srgb',
    name: 'sRGB IEC61966-2.1',
    gamutCoverage: '100% sRGB',
    whitePoint: 'D65 (6500K)',
    gamma: '2.2',
    deltaE: '0.68 ΔE',
    bestFor: 'Web design, UI mockups, and cross-platform Photoshop exports.',
    swatches: [
      { label: 'Red', hex: '#dc2626' },
      { label: 'Green', hex: '#16a34a' },
      { label: 'Blue', hex: '#2563eb' },
      { label: 'Cyan', hex: '#0891b2' },
      { label: 'Amber', hex: '#d97706' },
      { label: 'Neutral', hex: '#64748b' },
    ],
  },
  {
    id: 'display-p3',
    name: 'Display P3 (Wide Gamut)',
    gamutCoverage: '98% DCI-P3',
    whitePoint: 'D65 (6500K)',
    gamma: '2.2',
    deltaE: '0.82 ΔE',
    bestFor: 'Modern OLED/IPS creative monitors, Lightroom photo grading, digital cinema.',
    swatches: [
      { label: 'P3 Red', hex: '#ef4444' },
      { label: 'P3 Emerald', hex: '#10b981' },
      { label: 'P3 Cobalt', hex: '#3b82f6' },
      { label: 'P3 Teal', hex: '#06b6d4' },
      { label: 'P3 Gold', hex: '#f59e0b' },
      { label: 'P3 Slate', hex: '#475569' },
    ],
  },
  {
    id: 'adobe-rgb',
    name: 'Adobe RGB (1998)',
    gamutCoverage: '94% AdobeRGB',
    whitePoint: 'D65 (6500K)',
    gamma: '2.2',
    deltaE: '0.94 ΔE',
    bestFor: 'CMYK print proofing in Adobe Illustrator and high-bit-depth Photoshop PSDs.',
    swatches: [
      { label: 'Print Cyan', hex: '#0284c7' },
      { label: 'Print Magenta', hex: '#c026d3' },
      { label: 'Print Yellow', hex: '#eab308' },
      { label: 'Deep Forest', hex: '#15803d' },
      { label: 'Crimson', hex: '#b91c1c' },
      { label: 'Rich Black', hex: '#1e293b' },
    ],
  },
  {
    id: 'rec709',
    name: 'Rec.709 (Broadcast Video)',
    gamutCoverage: '100% Rec.709',
    whitePoint: 'D65 (6500K)',
    gamma: '2.4',
    deltaE: '0.74 ΔE',
    bestFor: 'Color grading & export checks in Kdenlive, DaVinci Resolve, and OBS recordings.',
    swatches: [
      { label: '709 Red', hex: '#b91c1c' },
      { label: '709 Green', hex: '#15803d' },
      { label: '709 Blue', hex: '#1d4ed8' },
      { label: 'Skin Ref', hex: '#d4a373' },
      { label: 'Mid Gray', hex: '#737373' },
      { label: 'Video Black', hex: '#171717' },
    ],
  },
];

export type PressureCurvePreset = 'linear' | 'soft' | 'firm' | 'custom';

export function evaluatePressureCurve(
  rawInput: number,
  preset: PressureCurvePreset,
  customGamma = 1.0
): number {
  const clamped = Math.min(1, Math.max(0, rawInput));
  const gamma =
    preset === 'soft'
      ? 0.65
      : preset === 'firm'
        ? 1.55
        : preset === 'custom'
          ? Math.min(2.5, Math.max(0.35, customGamma))
          : 1.0;
  return Number(Math.pow(clamped, gamma).toFixed(3));
}

export function buildSystemProcesses(
  windows: OSWindow[],
  prefixes: WinePrefix[],
  settings: SystemSettingsState,
  terminatedPids: number[],
  priorityOverrides: Record<number, ProcessItem['priority']>
): ProcessItem[] {
  const baseProcesses: ProcessItem[] = [
    {
      pid: 1,
      name: 'systemd (Debian 12 Minimal)',
      category: 'System',
      cpuPercent: 0.4,
      ramMb: 44,
      gpuPercent: 0,
      priority: 'High',
      killable: false,
    },
    {
      pid: 412,
      name: 'aether-shell (Qt 6.7 Wayland)',
      category: 'System',
      cpuPercent: 1.8,
      ramMb: 148,
      gpuPercent: 4,
      priority: 'High',
      killable: false,
    },
    {
      pid: 518,
      name: 'pipewire + wireplumber',
      category: 'System',
      cpuPercent: 0.6,
      ramMb: 36,
      gpuPercent: 0,
      priority: 'High',
      killable: false,
    },
    {
      pid: 620,
      name: 'nftables / apparmor-daemon',
      category: 'System',
      cpuPercent: 0.2,
      ramMb: 18,
      gpuPercent: 0,
      priority: 'Normal',
      killable: false,
    },
    {
      pid: 742,
      name: 'aether-file-indexer',
      category: 'Background',
      cpuPercent: settings.renderBoost ? 0 : 2.1,
      ramMb: settings.renderBoost ? 14 : 68,
      gpuPercent: 0,
      priority: 'Low',
      killable: true,
      pausedByBoost: settings.renderBoost,
    },
    {
      pid: 788,
      name: 'unattended-upgrades-check',
      category: 'Background',
      cpuPercent: settings.renderBoost ? 0 : 0.9,
      ramMb: settings.renderBoost ? 8 : 49,
      gpuPercent: 0,
      priority: 'Low',
      killable: true,
      pausedByBoost: settings.renderBoost,
    },
  ];

  const windowProcs: ProcessItem[] = windows.map((w, idx) => ({
    pid: 1200 + idx * 17,
    name: `${w.title} (${w.appId})`,
    category: 'Desktop App',
    cpuPercent: Number((1.2 + (idx % 3) * 0.7).toFixed(1)),
    ramMb: 54 + (idx % 4) * 18,
    gpuPercent: w.appId === 'tablet-color' || w.appId === 'snip-recorder' ? 6 : 2,
    priority: 'Normal',
    killable: true,
    windowId: w.id,
  }));

  const wineProcs: ProcessItem[] = prefixes.map((p, idx) => ({
    pid: 2400 + idx * 31,
    name: `wineserver · ${p.appName} ${p.version}`,
    category: 'Wine Prefix',
    cpuPercent: p.status === 'Ready' ? 3.4 : 0.5,
    ramMb: p.status === 'Ready' ? 310 : 72,
    gpuPercent: p.graphicsLayer.includes('Vulkan') ? 11 : 1,
    priority: settings.renderBoost ? 'High' : 'Normal',
    killable: true,
  }));

  return [...baseProcesses, ...wineProcs, ...windowProcs]
    .filter((proc) => !terminatedPids.includes(proc.pid))
    .map((proc) => ({
      ...proc,
      priority: priorityOverrides[proc.pid] ?? proc.priority,
    }));
}

export function computeSystemUsage(
  processes: ProcessItem[],
  renderBoost: boolean
): {
  cpuPercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  gpuPercent: number;
  activeServices: number;
  idleBaselineMb: number;
} {
  const cpuRaw = processes.reduce((sum, p) => sum + p.cpuPercent, 0);
  const ramUsedMb = Math.round(processes.reduce((sum, p) => sum + p.ramMb, 0));
  const gpuRaw = processes.reduce((sum, p) => sum + p.gpuPercent, 0);
  return {
    cpuPercent: Math.min(98, Number(cpuRaw.toFixed(1))),
    ramUsedMb,
    ramTotalMb: 16384,
    gpuPercent: Math.min(99, Math.round(gpuRaw)),
    activeServices: renderBoost ? 26 : 38,
    idleBaselineMb: renderBoost ? 329 : 424,
  };
}
