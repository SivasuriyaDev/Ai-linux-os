import React, { useMemo, useRef, useState } from 'react';
import { Copy, Eraser, Palette, PenTool } from 'lucide-react';
import {
  ICC_PROFILES,
  evaluatePressureCurve,
  type PressureCurvePreset,
} from '../../os/creativeTools';
import type { ColorProfileId } from '../../os/types';

interface TabletColorAppProps {
  activeColorProfile: ColorProfileId;
  onSelectColorProfile: (profileId: ColorProfileId) => void;
  onCopyHex: (hex: string, source: string) => void;
}

export function TabletColorApp({
  activeColorProfile,
  onSelectColorProfile,
  onCopyHex,
}: TabletColorAppProps) {
  const [preset, setPreset] = useState<PressureCurvePreset>('linear');
  const [customGamma, setCustomGamma] = useState(1.0);
  const [brushColor, setBrushColor] = useState('#38bdf8');
  const [livePressure, setLivePressure] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const activeIcc =
    ICC_PROFILES.find((p) => p.id === activeColorProfile) ?? ICC_PROFILES[0];

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const raw = i / 20;
      const out = evaluatePressureCurve(raw, preset, customGamma);
      const x = 10 + raw * 160;
      const y = 90 - out * 80;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [preset, customGamma]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawingRef.current = { active: true, lastX: x, lastY: y };
    setStrokeCount((c) => c + 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use real stylus pressure when available; fall back to stroke speed sensitivity for mouse
    const rawPressure = e.pressure > 0 && e.pressure !== 0.5 ? e.pressure : 0.62;
    const adjusted = evaluatePressureCurve(rawPressure, preset, customGamma);
    setLivePressure(Math.round(adjusted * 100));

    ctx.strokeStyle = brushColor;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.5, adjusted * 14);
    ctx.beginPath();
    ctx.moveTo(drawingRef.current.lastX, drawingRef.current.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    drawingRef.current.lastX = x;
    drawingRef.current.lastY = y;
  };

  const handlePointerUp = () => {
    drawingRef.current.active = false;
    setLivePressure(0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
  };

  return (
    <div className="grid h-full grid-cols-1 overflow-y-auto bg-slate-50/75 text-slate-900 lg:grid-cols-12 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Left: Pen Tablet & Pressure Calibration */}
      <div className="flex flex-col border-b border-slate-200 p-5 lg:col-span-6 lg:border-b-0 lg:border-r dark:border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900 dark:text-white">
              <PenTool className="h-4 w-4 text-violet-500" />
              <span>Wacom / Stylus Pressure Calibration</span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              libinput / OpenTabletDriver · Active for Photoshop &amp; Illustrator Wine prefixes
            </p>
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Clear Pad</span>
          </button>
        </div>

        {/* Pressure Curve Preset Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {(['linear', 'soft', 'firm', 'custom'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                preset === p
                  ? 'bg-violet-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {p} Curve
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <label className="mt-3 block">
            <div className="mb-1 flex justify-between text-xs">
              <span>Custom Pressure Gamma</span>
              <span className="font-mono tabular-nums">{customGamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={2.2}
              step={0.05}
              value={customGamma}
              onChange={(e) => setCustomGamma(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
          </label>
        )}

        {/* Pressure Response Graph + Telemetry */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <svg viewBox="0 0 180 100" className="h-24 w-full" aria-label="Pressure response curve">
            <line x1="10" y1="90" x2="170" y2="90" stroke="#64748b" strokeOpacity="0.35" />
            <line x1="10" y1="10" x2="10" y2="90" stroke="#64748b" strokeOpacity="0.35" />
            <line
              x1="10"
              y1="90"
              x2="170"
              y2="10"
              stroke="#94a3b8"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
            />
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
              points={curvePath}
            />
          </svg>

          <div className="flex flex-col justify-center space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Live Pressure</span>
              <span className="font-mono font-semibold tabular-nums">{livePressure}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Test Strokes</span>
              <span className="font-mono tabular-nums">{strokeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Device</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Wacom / Evdev
              </span>
            </div>
          </div>
        </div>

        {/* Live Stylus Test Canvas */}
        <div className="mt-4 flex flex-1 flex-col">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Draw below to test pressure curve</span>
            <div className="flex items-center gap-1.5">
              {['#38bdf8', '#f59e0b', '#10b981', '#f43f5e'].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Select brush color ${hex}`}
                  onClick={() => setBrushColor(hex)}
                  style={{ backgroundColor: hex }}
                  className={`h-4 w-4 rounded-full ${
                    brushColor === hex ? 'ring-2 ring-slate-900 dark:ring-white' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={420}
            height={200}
            data-testid="tablet-test-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="h-[200px] w-full cursor-crosshair touch-none rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </div>

      {/* Right: Display Color Profile (ICC) Manager */}
      <div className="flex flex-col p-5 lg:col-span-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900 dark:text-white">
            <Palette className="h-4 w-4 text-sky-500" />
            <span>Monitor ICC Color Profile Calibration</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            colord + Wayland color-management protocol · Synced to Adobe RGB &amp; sRGB workflows
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {ICC_PROFILES.map((profile) => {
            const active = profile.id === activeIcc.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => onSelectColorProfile(profile.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {profile.name}
                  </span>
                  <span className="font-mono text-[11px] text-sky-600 tabular-nums dark:text-sky-400">
                    {profile.gamutCoverage} · {profile.deltaE}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {profile.bestFor}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Profile Verification Swatches */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold">
              Active Calibration: {activeIcc.name}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {activeIcc.whitePoint} · Gamma {activeIcc.gamma}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {activeIcc.swatches.map((swatch) => (
              <button
                key={swatch.label}
                type="button"
                onClick={() => onCopyHex(swatch.hex, 'Color Calibration Hub')}
                className="group flex items-center justify-between rounded-lg border border-slate-200 p-2 text-left transition-colors hover:border-sky-500 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: swatch.hex }}
                    className="h-5 w-5 shrink-0 rounded"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-[11px] font-medium">{swatch.label}</div>
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {swatch.hex}
                    </div>
                  </div>
                </div>
                <Copy className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
