import { useEffect, useState } from 'react';
import { Camera, CheckCircle2, Circle, FolderOpen, Square, Video } from 'lucide-react';
import type { SystemSettingsState } from '../../os/types';

interface SnipRecorderAppProps {
  settings: SystemSettingsState;
  onSaveCapture: (entry: {
    folderId: 'pictures' | 'videos';
    fileName: string;
    kind: 'image' | 'video';
    sizeBytes: number;
    content: string;
  }) => void;
  onOpenFolderInFiles: (folderId: 'pictures' | 'videos') => void;
}

export function SnipRecorderApp({
  settings,
  onSaveCapture,
  onOpenFolderInFiles,
}: SnipRecorderAppProps) {
  const [mode, setMode] = useState<'snip' | 'record'>('snip');
  const [captureTarget, setCaptureTarget] = useState<'Full Desktop' | 'Active Window' | 'Region Selection'>('Full Desktop');
  const [codec, setCodec] = useState<'H.264 (VA-API / NVENC)' | 'HEVC 10-bit' | 'AV1 Hardware'>('H.264 (VA-API / NVENC)');
  const [fps, setFps] = useState<'60 FPS' | '30 FPS'>('60 FPS');
  const [recording, setRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recentCaptures, setRecentCaptures] = useState<
    { id: string; fileName: string; folder: 'pictures' | 'videos'; detail: string }[]
  >([]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleCaptureScreenshot = () => {
    const stamp = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const fileName = `AetherOS_Snip_${stamp}.png`;
    const detail = `${captureTarget} · ${settings.resolution} · ICC: ${settings.activeColorProfile}`;
    onSaveCapture({
      folderId: 'pictures',
      fileName,
      kind: 'image',
      sizeBytes: 1_840_000,
      content: `PNG Screenshot · ${detail}\nSaved directly to ~/Pictures/${fileName}`,
    });
    setRecentCaptures((prev) => [
      { id: `cap-${Date.now()}`, fileName, folder: 'pictures', detail },
      ...prev,
    ]);
  };

  const handleToggleRecording = () => {
    if (!recording) {
      setElapsedSec(0);
      setRecording(true);
      return;
    }
    setRecording(false);
    const duration = Math.max(1, elapsedSec);
    const stamp = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const fileName = `AetherOS_Capture_${stamp}.mkv`;
    const detail = `${codec} · ${fps} · ${formatTimer(duration)} · ${settings.gpuVendor} Hardware Encode`;
    onSaveCapture({
      folderId: 'videos',
      fileName,
      kind: 'video',
      sizeBytes: duration * 3_200_000,
      content: `Hardware Screen Recording · ${detail}\nSaved directly to ~/Videos/${fileName}`,
    });
    setRecentCaptures((prev) => [
      { id: `rec-${Date.now()}`, fileName, folder: 'videos', detail },
      ...prev,
    ]);
    setElapsedSec(0);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/75 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Snipping Tool &amp; Hardware Screen Recorder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Wayland PipeWire Portal · {settings.gpuVendor} VA-API / NVENC · Saves directly into Files
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-200/75 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setMode('snip')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'snip'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Screenshot Snip</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('record')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'record'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>Screen Recorder</span>
          </button>
        </div>
      </div>

      {/* Capture Controls */}
      <div className="p-5">
        {mode === 'snip' ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Capture Mode
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['Full Desktop', 'Active Window', 'Region Selection'] as const).map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCaptureTarget(opt)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          captureTarget === opt
                            ? 'border-sky-500 bg-sky-600 text-white'
                            : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCaptureScreenshot}
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 whitespace-nowrap shrink-0"
              >
                <Camera className="h-4 w-4" />
                <span>Capture &amp; Save to Pictures</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Hardware Encoder</span>
                  <select
                    value={codec}
                    disabled={recording}
                    onChange={(e) => setCodec(e.target.value as typeof codec)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="H.264 (VA-API / NVENC)">H.264 (VA-API / NVENC)</option>
                    <option value="HEVC 10-bit">HEVC 10-bit Hardware</option>
                    <option value="AV1 Hardware">AV1 Hardware</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium">Frame Rate</span>
                  <select
                    value={fps}
                    disabled={recording}
                    onChange={(e) => setFps(e.target.value as typeof fps)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="60 FPS">60 FPS</option>
                    <option value="30 FPS">30 FPS</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-3">
                {recording && (
                  <span className="font-mono text-sm font-semibold text-rose-600 tabular-nums dark:text-rose-400">
                    REC {formatTimer(elapsedSec)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 ${
                    recording
                      ? 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {recording ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span>Stop &amp; Save to Videos</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-3.5 w-3.5 fill-current" />
                      <span>Start Recording</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Captures List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Session Captures ({recentCaptures.length})
        </div>
        {recentCaptures.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Captured screenshots save directly to ~/Pictures and screen recordings save to ~/Videos in Files.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {recentCaptures.map((cap) => (
              <div
                key={cap.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white">
                      {cap.fileName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cap.detail}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenFolderInFiles(cap.folder)}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Open in Files</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
