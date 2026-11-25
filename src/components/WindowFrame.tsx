import React, { useRef, useState } from 'react';
import { Columns2, Minus, Square, X } from 'lucide-react';
import type { OSWindow, SnapZone } from '../os/types';
import { AppIconBadge } from './AppIcons';

interface WindowFrameProps {
  win: OSWindow;
  isFocused: boolean;
  transparencyLevel: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onSnap: (zone: SnapZone) => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export function WindowFrame({
  win,
  isFocused,
  transparencyLevel,
  onFocus,
  onClose,
  onMinimize,
  onSnap,
  onMove,
  onResize,
  children,
}: WindowFrameProps) {
  const [snapMenuOpen, setSnapMenuOpen] = useState(false);
  const dragOrigin = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number } | null>(null);
  const resizeOrigin = useRef<{ mouseX: number; mouseY: number; width: number; height: number } | null>(null);

  if (win.minimized) return null;

  const isMaximized = win.snap === 'maximized';
  const alpha = Math.max(0.76, 1 - (transparencyLevel / 100) * 0.22);

  const handleTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onFocus();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.bounds.x,
      winY: win.bounds.y,
    };
  };

  const handleTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.mouseX;
    const dy = e.clientY - dragOrigin.current.mouseY;
    onMove(dragOrigin.current.winX + dx, dragOrigin.current.winY + dy);
  };

  const handleTitlePointerUp = () => {
    dragOrigin.current = null;
  };

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeOrigin.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: win.bounds.width,
      height: win.bounds.height,
    };
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeOrigin.current) return;
    const dx = e.clientX - resizeOrigin.current.mouseX;
    const dy = e.clientY - resizeOrigin.current.mouseY;
    onResize(resizeOrigin.current.width + dx, resizeOrigin.current.height + dy);
  };

  const handleResizePointerUp = () => {
    resizeOrigin.current = null;
  };

  return (
    <section
      aria-label={win.title}
      data-testid={`window-${win.appId}`}
      onMouseDown={onFocus}
      style={{
        left: `${win.bounds.x}px`,
        top: `${win.bounds.y}px`,
        width: `${win.bounds.width}px`,
        height: `${win.bounds.height}px`,
        zIndex: win.zIndex,
        ['--mica-alpha' as string]: alpha,
      }}
      className={`animate-window-in mica-window fixed flex flex-col overflow-hidden border transition-shadow duration-150 ${
        isMaximized ? 'rounded-none' : 'rounded-xl'
      } ${
        isFocused
          ? 'border-slate-300 shadow-2xl shadow-slate-950/35 dark:border-slate-700 dark:shadow-black/70'
          : 'border-slate-300/80 shadow-xl shadow-slate-950/20 dark:border-slate-800 dark:shadow-black/50'
      } bg-[#f8fafc] text-slate-900 dark:bg-[#0d1320] dark:text-slate-100`}
    >
      {/* Window Title Bar */}
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={() => onSnap('maximized')}
        className="flex h-11 shrink-0 select-none items-center justify-between border-b border-slate-200/80 bg-slate-50/75 px-3 dark:border-slate-800/90 dark:bg-slate-950/55"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <AppIconBadge appId={win.appId} size="sm" />
          <h2 className="truncate font-display text-xs font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {win.title}
          </h2>
        </div>

        <div className="relative flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSnapMenuOpen((prev) => !prev)}
            aria-label={`Snap layout for ${win.title}`}
            aria-expanded={snapMenuOpen}
            title="Snap window layout"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${win.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onSnap('maximized')}
            aria-label={isMaximized ? `Restore ${win.title}` : `Maximize ${win.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Square className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${win.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-rose-600 hover:text-white dark:text-slate-400 dark:hover:bg-rose-600 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Windows 11-Inspired Snap Layouts Popover */}
          {snapMenuOpen && (
            <div
              role="menu"
              aria-label={`Snap zones for ${win.title}`}
              className="acrylic-panel absolute right-0 top-9 z-50 w-64 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95"
            >
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Snap Layout
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 50 / 50 Split */}
                <div className="flex h-11 gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                  <button
                    type="button"
                    aria-label="Snap Left Half"
                    onClick={() => {
                      onSnap('left');
                      setSnapMenuOpen(false);
                    }}
                    className="flex-1 rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                  <button
                    type="button"
                    aria-label="Snap Right Half"
                    onClick={() => {
                      onSnap('right');
                      setSnapMenuOpen(false);
                    }}
                    className="flex-1 rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                </div>

                {/* 66 / 33 Studio Split */}
                <div className="flex h-11 gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                  <button
                    type="button"
                    aria-label="Snap Two-Thirds Left"
                    onClick={() => {
                      onSnap('two-thirds-left');
                      setSnapMenuOpen(false);
                    }}
                    className="w-2/3 rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                  <button
                    type="button"
                    aria-label="Snap One-Third Right"
                    onClick={() => {
                      onSnap('one-third-right');
                      setSnapMenuOpen(false);
                    }}
                    className="w-1/3 rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                </div>

                {/* 4-Quadrant Grid */}
                <div className="grid h-11 grid-cols-2 grid-rows-2 gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                  <button
                    type="button"
                    aria-label="Snap Top Left"
                    onClick={() => {
                      onSnap('top-left');
                      setSnapMenuOpen(false);
                    }}
                    className="rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                  <button
                    type="button"
                    aria-label="Snap Top Right"
                    onClick={() => {
                      onSnap('top-right');
                      setSnapMenuOpen(false);
                    }}
                    className="rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                  <button
                    type="button"
                    aria-label="Snap Bottom Left"
                    onClick={() => {
                      onSnap('bottom-left');
                      setSnapMenuOpen(false);
                    }}
                    className="rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                  <button
                    type="button"
                    aria-label="Snap Bottom Right"
                    onClick={() => {
                      onSnap('bottom-right');
                      setSnapMenuOpen(false);
                    }}
                    className="rounded bg-slate-200 transition-colors hover:bg-sky-500 dark:bg-slate-700 dark:hover:bg-sky-500"
                  />
                </div>

                {/* Full Screen / Restore */}
                <div className="flex h-11 gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                  <button
                    type="button"
                    aria-label="Snap Full Screen"
                    onClick={() => {
                      onSnap('maximized');
                      setSnapMenuOpen(false);
                    }}
                    className="flex-1 rounded bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors hover:bg-sky-500 hover:text-white dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-sky-500"
                  >
                    Full
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Viewport */}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

      {/* Bottom-Right Resize Grip */}
      {!isMaximized && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
        />
      )}
    </section>
  );
}
