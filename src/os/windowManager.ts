import type { AppId, OSWindow, SnapZone, VirtualDesktop, WindowBounds } from './types';

export interface ViewportSize {
  width: number;
  height: number;
}

export const TASKBAR_HEIGHT = 54;
const MIN_WINDOW_WIDTH = 520;
const MIN_WINDOW_HEIGHT = 380;

export const APP_DEFAULT_CONFIG: Record<
  AppId,
  { title: string; width: number; height: number }
> = {
  'adobe-manager': {
    title: 'Adobe Compatibility Manager',
    width: 1020,
    height: 660,
  },
  'file-manager': {
    title: 'Files',
    width: 960,
    height: 620,
  },
  'app-manager': {
    title: 'Application Manager',
    width: 940,
    height: 620,
  },
  settings: {
    title: 'System Settings',
    width: 980,
    height: 640,
  },
  'os-installer': {
    title: 'Install AetherOS 1.0 LTS',
    width: 880,
    height: 630,
  },
  'os-studio': {
    title: 'OS Architecture & ISO Build Studio',
    width: 1040,
    height: 660,
  },
  'task-manager': {
    title: 'Task Manager & System Monitor',
    width: 960,
    height: 630,
  },
  terminal: {
    title: 'Aether Terminal',
    width: 860,
    height: 560,
  },
  'tablet-color': {
    title: 'Pen Tablet & Color Calibration Hub',
    width: 980,
    height: 640,
  },
  'font-manager': {
    title: 'Font Manager (Linux + Wine Sync)',
    width: 940,
    height: 610,
  },
  'snip-recorder': {
    title: 'Snipping Tool & Screen Recorder',
    width: 860,
    height: 590,
  },
};

export function clampWindowBounds(
  bounds: WindowBounds,
  viewport: ViewportSize
): WindowBounds {
  const usableHeight = Math.max(MIN_WINDOW_HEIGHT, viewport.height - TASKBAR_HEIGHT);
  const width = Math.min(Math.max(bounds.width, MIN_WINDOW_WIDTH), viewport.width - 16);
  const height = Math.min(Math.max(bounds.height, MIN_WINDOW_HEIGHT), usableHeight - 12);
  const maxX = Math.max(0, viewport.width - Math.min(width, 180));
  const maxY = Math.max(0, usableHeight - 48);
  const x = Math.min(Math.max(bounds.x, -(width - 180)), maxX);
  const y = Math.min(Math.max(bounds.y, 0), maxY);
  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

export function computeSnapBounds(
  zone: SnapZone,
  viewport: ViewportSize,
  restoreBounds: WindowBounds
): WindowBounds {
  const w = viewport.width;
  const h = Math.max(MIN_WINDOW_HEIGHT, viewport.height - TASKBAR_HEIGHT);
  const gap = 8;

  switch (zone) {
    case 'maximized':
      return { x: 0, y: 0, width: w, height: h };
    case 'left':
      return {
        x: gap,
        y: gap,
        width: Math.floor(w / 2 - gap * 1.5),
        height: h - gap * 2,
      };
    case 'right':
      return {
        x: Math.ceil(w / 2 + gap * 0.5),
        y: gap,
        width: Math.floor(w / 2 - gap * 1.5),
        height: h - gap * 2,
      };
    case 'two-thirds-left':
      return {
        x: gap,
        y: gap,
        width: Math.floor(w * 0.66 - gap * 1.5),
        height: h - gap * 2,
      };
    case 'one-third-right':
      return {
        x: Math.ceil(w * 0.66 + gap * 0.5),
        y: gap,
        width: Math.floor(w * 0.34 - gap * 1.5),
        height: h - gap * 2,
      };
    case 'top-left':
      return {
        x: gap,
        y: gap,
        width: Math.floor(w / 2 - gap * 1.5),
        height: Math.floor(h / 2 - gap * 1.5),
      };
    case 'top-right':
      return {
        x: Math.ceil(w / 2 + gap * 0.5),
        y: gap,
        width: Math.floor(w / 2 - gap * 1.5),
        height: Math.floor(h / 2 - gap * 1.5),
      };
    case 'bottom-left':
      return {
        x: gap,
        y: Math.ceil(h / 2 + gap * 0.5),
        width: Math.floor(w / 2 - gap * 1.5),
        height: Math.floor(h / 2 - gap * 1.5),
      };
    case 'bottom-right':
      return {
        x: Math.ceil(w / 2 + gap * 0.5),
        y: Math.ceil(h / 2 + gap * 0.5),
        width: Math.floor(w / 2 - gap * 1.5),
        height: Math.floor(h / 2 - gap * 1.5),
      };
    case 'none':
    default:
      return clampWindowBounds(restoreBounds, viewport);
  }
}

export function getNextZIndex(windows: OSWindow[]): number {
  return windows.reduce((max, w) => Math.max(max, w.zIndex), 10) + 1;
}

export function openOrFocusApp(
  windows: OSWindow[],
  appId: AppId,
  activeDesktopId: number,
  viewport: ViewportSize
): { windows: OSWindow[]; focusedId: string } {
  const existing = windows.find(
    (w) => w.appId === appId && w.desktopId === activeDesktopId
  );
  const nextZ = getNextZIndex(windows);

  if (existing) {
    return {
      windows: windows.map((w) =>
        w.id === existing.id ? { ...w, minimized: false, zIndex: nextZ } : w
      ),
      focusedId: existing.id,
    };
  }

  const cfg = APP_DEFAULT_CONFIG[appId];
  const openCountOnDesktop = windows.filter((w) => w.desktopId === activeDesktopId).length;
  const offset = (openCountOnDesktop % 5) * 28;
  const usableH = Math.max(MIN_WINDOW_HEIGHT, viewport.height - TASKBAR_HEIGHT);
  const width = Math.min(cfg.width, viewport.width - 48);
  const height = Math.min(cfg.height, usableH - 36);
  const baseBounds: WindowBounds = clampWindowBounds(
    {
      x: Math.max(24, Math.floor((viewport.width - width) / 2) + offset - 20),
      y: Math.max(16, Math.floor((usableH - height) / 2) + offset - 16),
      width,
      height,
    },
    viewport
  );

  const newWin: OSWindow = {
    id: `${appId}-${Date.now()}-${openCountOnDesktop}`,
    appId,
    title: cfg.title,
    desktopId: activeDesktopId,
    bounds: baseBounds,
    restoreBounds: baseBounds,
    minimized: false,
    snap: 'none',
    zIndex: nextZ,
  };

  return {
    windows: [...windows, newWin],
    focusedId: newWin.id,
  };
}

export function focusWindow(windows: OSWindow[], windowId: string): OSWindow[] {
  const nextZ = getNextZIndex(windows);
  return windows.map((w) =>
    w.id === windowId ? { ...w, minimized: false, zIndex: nextZ } : w
  );
}

export function closeWindow(windows: OSWindow[], windowId: string): OSWindow[] {
  return windows.filter((w) => w.id !== windowId);
}

export function minimizeWindow(windows: OSWindow[], windowId: string): OSWindow[] {
  return windows.map((w) =>
    w.id === windowId ? { ...w, minimized: true } : w
  );
}

export function snapWindow(
  windows: OSWindow[],
  windowId: string,
  zone: SnapZone,
  viewport: ViewportSize
): OSWindow[] {
  const nextZ = getNextZIndex(windows);
  return windows.map((w) => {
    if (w.id !== windowId) return w;
    const toggleOff = zone === w.snap && zone !== 'none';
    const targetZone: SnapZone = toggleOff ? 'none' : zone;
    const savedRestore = w.snap === 'none' ? w.bounds : w.restoreBounds;
    const nextBounds = computeSnapBounds(targetZone, viewport, savedRestore);
    return {
      ...w,
      snap: targetZone,
      restoreBounds: savedRestore,
      bounds: nextBounds,
      minimized: false,
      zIndex: nextZ,
    };
  });
}

export function moveWindow(
  windows: OSWindow[],
  windowId: string,
  x: number,
  y: number,
  viewport: ViewportSize
): OSWindow[] {
  return windows.map((w) => {
    if (w.id !== windowId) return w;
    const targetBounds =
      w.snap !== 'none'
        ? clampWindowBounds(
            { x, y, width: w.restoreBounds.width, height: w.restoreBounds.height },
            viewport
          )
        : clampWindowBounds({ ...w.bounds, x, y }, viewport);
    return {
      ...w,
      snap: 'none',
      bounds: targetBounds,
      restoreBounds: targetBounds,
    };
  });
}

export function resizeWindow(
  windows: OSWindow[],
  windowId: string,
  width: number,
  height: number,
  viewport: ViewportSize
): OSWindow[] {
  return windows.map((w) => {
    if (w.id !== windowId) return w;
    const clamped = clampWindowBounds(
      { ...w.bounds, width, height },
      viewport
    );
    return {
      ...w,
      snap: 'none',
      bounds: clamped,
      restoreBounds: clamped,
    };
  });
}

export function addVirtualDesktop(desktops: VirtualDesktop[]): {
  desktops: VirtualDesktop[];
  created: VirtualDesktop;
} {
  const nextId = desktops.reduce((max, d) => Math.max(max, d.id), 0) + 1;
  const created: VirtualDesktop = {
    id: nextId,
    name: `Desktop ${nextId}`,
  };
  return {
    desktops: [...desktops, created],
    created,
  };
}

export function removeVirtualDesktop(
  desktops: VirtualDesktop[],
  windows: OSWindow[],
  desktopId: number
): { desktops: VirtualDesktop[]; windows: OSWindow[]; fallbackDesktopId: number } {
  if (desktops.length <= 1) {
    return { desktops, windows, fallbackDesktopId: desktops[0].id };
  }
  const remaining = desktops.filter((d) => d.id !== desktopId);
  const fallbackDesktopId = remaining[0].id;
  const migratedWindows = windows.map((w) =>
    w.desktopId === desktopId ? { ...w, desktopId: fallbackDesktopId } : w
  );
  return {
    desktops: remaining,
    windows: migratedWindows,
    fallbackDesktopId,
  };
}
