import {
  Activity,
  Camera,
  FolderOpen,
  HardDriveDownload,
  Layers,
  Package,
  PenTool,
  Settings,
  Terminal,
  TerminalSquare,
  Type,
} from 'lucide-react';
import type { AppId } from '../os/types';

export function AetherStartEmblem({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2" fill="currentColor" fillOpacity="0.95" />
      <rect x="13" y="2.5" width="8.5" height="8.5" rx="2" fill="currentColor" fillOpacity="0.78" />
      <rect x="2.5" y="13" width="8.5" height="8.5" rx="2" fill="currentColor" fillOpacity="0.78" />
      <rect x="13" y="13" width="8.5" height="8.5" rx="2" fill="currentColor" fillOpacity="0.58" />
    </svg>
  );
}

export function AppIconBadge({
  appId,
  size = 'md',
}: {
  appId: AppId;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dim =
    size === 'sm' ? 'h-6 w-6 rounded-md' : size === 'lg' ? 'h-11 w-11 rounded-xl' : 'h-8 w-8 rounded-lg';
  const iconDim = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  switch (appId) {
    case 'adobe-manager':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-sky-600 text-white shadow-sm ${dim}`}>
          <Layers className={iconDim} />
        </span>
      );
    case 'file-manager':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-amber-500 text-slate-950 shadow-sm ${dim}`}>
          <FolderOpen className={iconDim} />
        </span>
      );
    case 'app-manager':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-indigo-600 text-white shadow-sm ${dim}`}>
          <Package className={iconDim} />
        </span>
      );
    case 'settings':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-slate-600 text-white shadow-sm ${dim}`}>
          <Settings className={iconDim} />
        </span>
      );
    case 'os-installer':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-emerald-600 text-white shadow-sm ${dim}`}>
          <HardDriveDownload className={iconDim} />
        </span>
      );
    case 'os-studio':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-slate-800 text-sky-300 ring-1 ring-white/15 shadow-sm ${dim}`}>
          <TerminalSquare className={iconDim} />
        </span>
      );
    case 'task-manager':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-teal-600 text-white shadow-sm ${dim}`}>
          <Activity className={iconDim} />
        </span>
      );
    case 'terminal':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-zinc-900 text-emerald-400 ring-1 ring-white/15 shadow-sm ${dim}`}>
          <Terminal className={iconDim} />
        </span>
      );
    case 'tablet-color':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-violet-600 text-white shadow-sm ${dim}`}>
          <PenTool className={iconDim} />
        </span>
      );
    case 'font-manager':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-rose-600 text-white shadow-sm ${dim}`}>
          <Type className={iconDim} />
        </span>
      );
    case 'snip-recorder':
      return (
        <span className={`inline-flex shrink-0 items-center justify-center bg-cyan-600 text-white shadow-sm ${dim}`}>
          <Camera className={iconDim} />
        </span>
      );
  }
}
