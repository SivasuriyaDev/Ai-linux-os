import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addVirtualDesktop,
  closeWindow,
  computeSnapBounds,
  minimizeWindow,
  openOrFocusApp,
  removeVirtualDesktop,
  snapWindow,
} from './windowManager';

const VIEWPORT = { width: 1440, height: 900 };

test('openOrFocusApp opens a new window and focuses existing window on same desktop', () => {
  const first = openOrFocusApp([], 'adobe-manager', 1, VIEWPORT);
  assert.equal(first.windows.length, 1);
  assert.equal(first.windows[0].appId, 'adobe-manager');

  const second = openOrFocusApp(first.windows, 'file-manager', 1, VIEWPORT);
  assert.equal(second.windows.length, 2);
  assert.ok(second.windows[1].zIndex > second.windows[0].zIndex);

  const refocus = openOrFocusApp(second.windows, 'adobe-manager', 1, VIEWPORT);
  assert.equal(refocus.windows.length, 2);
  const adobeWin = refocus.windows.find((w) => w.appId === 'adobe-manager')!;
  const fileWin = refocus.windows.find((w) => w.appId === 'file-manager')!;
  assert.ok(adobeWin.zIndex > fileWin.zIndex);
});

test('snapWindow snaps to left half and toggles back to restore bounds', () => {
  const { windows, focusedId } = openOrFocusApp([], 'file-manager', 1, VIEWPORT);
  const originalWidth = windows[0].bounds.width;

  const snapped = snapWindow(windows, focusedId, 'left', VIEWPORT);
  assert.equal(snapped[0].snap, 'left');
  assert.equal(snapped[0].bounds.x, 8);
  assert.equal(snapped[0].bounds.width, Math.floor(VIEWPORT.width / 2 - 12));

  const restored = snapWindow(snapped, focusedId, 'left', VIEWPORT);
  assert.equal(restored[0].snap, 'none');
  assert.equal(restored[0].bounds.width, originalWidth);
});

test('computeSnapBounds calculates 4-quadrant and 66/33 layouts cleanly', () => {
  const restore = { x: 100, y: 100, width: 800, height: 500 };
  const twoThirds = computeSnapBounds('two-thirds-left', VIEWPORT, restore);
  const oneThird = computeSnapBounds('one-third-right', VIEWPORT, restore);
  assert.ok(twoThirds.width > oneThird.width);
  assert.ok(oneThird.x > twoThirds.x + twoThirds.width);
});

test('minimize, close, and virtual desktop migration work cleanly', () => {
  const { desktops, created } = addVirtualDesktop([{ id: 1, name: 'Desktop 1' }]);
  assert.equal(desktops.length, 2);

  const opened = openOrFocusApp([], 'settings', created.id, VIEWPORT);
  const minimized = minimizeWindow(opened.windows, opened.focusedId);
  assert.equal(minimized[0].minimized, true);

  const removed = removeVirtualDesktop(desktops, minimized, created.id);
  assert.equal(removed.desktops.length, 1);
  assert.equal(removed.windows[0].desktopId, 1);

  const afterClose = closeWindow(removed.windows, opened.focusedId);
  assert.equal(afterClose.length, 0);
});
