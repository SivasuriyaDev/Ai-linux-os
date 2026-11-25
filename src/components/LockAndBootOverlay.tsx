import React, { useEffect, useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { AetherStartEmblem } from './AppIcons';
import { WallpaperBackdrop } from './WallpaperBackdrop';
import type { WallpaperId } from '../os/types';

interface LockAndBootOverlayProps {
  mode: 'boot' | 'lock';
  wallpaper: WallpaperId;
  onUnlock: () => void;
}

const BOOT_STEPS = [
  'GRUB 2.12 · Verifying Debian shim-signed UEFI Secure Boot chain',
  'Loading Linux 6.12 LTS (x86_64) · PREEMPT_DYNAMIC · Fsync enabled',
  'systemd[1]: Mounting /dev/nvme0n1p2 (ext4) + ZRAM lz4 swap (50%)',
  'systemd[1]: Starting PipeWire, WirePlumber, NetworkManager, nftables',
  'aether-shell: Initializing Qt 6.7 Wayland compositor & Vulkan ICDs',
];

export function LockAndBootOverlay({
  mode,
  wallpaper,
  onUnlock,
}: LockAndBootOverlayProps) {
  const [stage, setStage] = useState<'boot' | 'lock'>(mode);
  const [bootIndex, setBootIndex] = useState(0);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setStage(mode);
    setBootIndex(0);
  }, [mode]);

  useEffect(() => {
    if (stage !== 'boot') return;
    if (bootIndex >= BOOT_STEPS.length) {
      const doneTimer = window.setTimeout(() => setStage('lock'), 350);
      return () => window.clearTimeout(doneTimer);
    }
    const timer = window.setTimeout(() => setBootIndex((i) => i + 1), 420);
    return () => window.clearTimeout(timer);
  }, [stage, bootIndex]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (stage === 'boot') {
    return (
      <div
        role="dialog"
        aria-label="AetherOS Boot Sequence"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060911] px-6 text-slate-100"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-400/30">
            <AetherStartEmblem className="h-9 w-9" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
            AetherOS
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Debian Stable Minimal · Linux 6.12 LTS
          </p>

          <div className="mt-8 w-full max-w-md overflow-hidden rounded-full bg-slate-800/90 h-1.5">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (bootIndex / BOOT_STEPS.length) * 100)}%` }}
            />
          </div>

          <div className="mt-5 w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-left font-mono text-[11px] text-slate-300">
            {BOOT_STEPS.slice(0, Math.max(1, bootIndex)).map((line) => (
              <div key={line} className="truncate py-0.5">
                {line}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStage('lock')}
            className="mt-5 text-xs text-slate-400 hover:text-slate-200"
          >
            Skip boot splash
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock();
  };

  return (
    <div
      role="dialog"
      aria-label="AetherOS Sign In Screen"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between px-6 py-12 text-white"
    >
      <WallpaperBackdrop wallpaper={wallpaper} />
      <div className="pointer-events-none fixed inset-0 bg-slate-950/45 backdrop-blur-md" />

      <div className="relative z-10 text-center">
        <div className="font-display text-6xl font-semibold tracking-tight tabular-nums">
          {timeStr}
        </div>
        <div className="mt-1 text-sm text-slate-200">{dateStr}</div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="acrylic-panel relative z-10 flex w-full max-w-xs flex-col items-center rounded-2xl border border-white/15 bg-slate-900/75 p-6 text-center shadow-2xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg">
          <User className="h-8 w-8" />
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold text-white">
          aether-studio
        </h2>
        <p className="text-xs text-slate-300">
          Wayland Session · Qt 6.7 Shell
        </p>

        <label className="mt-5 block w-full">
          <span className="sr-only">Session passphrase</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passphrase (press Enter to unlock)"
            className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
        >
          <span>Sign In to Desktop</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="relative z-10 text-xs text-slate-300">
        AetherOS 1.0 LTS · Debian Bookworm Minimal
      </div>
    </div>
  );
}
