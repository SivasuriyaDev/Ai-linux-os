import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_WINE_PREFIXES } from './adobeEngine';
import {
  INITIAL_CLIPBOARD_ITEMS,
  INITIAL_FONTS,
  addClipboardItem,
  addCustomFont,
  buildSystemProcesses,
  bulkInstallFontsFromFiles,
  clearUnpinnedClipboard,
  computeSystemUsage,
  evaluatePressureCurve,
  syncFontsToPrefixes,
  togglePinClipboardItem,
} from './creativeTools';
import type { SystemSettingsState } from './types';

const BASE_SETTINGS: SystemSettingsState = {
  theme: 'dark',
  wallpaper: 'mica-dark',
  accentColor: 'sky',
  transparencyLevel: 60,
  taskbarCentered: true,
  wifiEnabled: true,
  wifiNetwork: 'Studio-5G',
  bluetoothEnabled: true,
  volume: 76,
  brightness: 100,
  nightLight: false,
  renderBoost: false,
  doNotDisturb: false,
  activeColorProfile: 'srgb',
  powerProfile: 'Balanced',
  gpuVendor: 'AMD',
  resolution: '2560x1440',
  refreshRate: '120 Hz',
  multiMonitorMode: 'Extend',
  firewallEnabled: true,
  appArmorWineSandbox: true,
  autoSecurityUpdates: true,
  luksEncryption: true,
  secureBootMOK: true,
  ssdTrimEnabled: true,
  zramSwapPercent: 50,
  language: 'English (US)',
  keyboardLayout: 'US QWERTY',
  timezone: 'America/Los_Angeles',
};

test('clipboard history adds, detects kind, pins, and clears only unpinned items', () => {
  const added = addClipboardItem(INITIAL_CLIPBOARD_ITEMS, '#22C55E', 'Color Hub', '09:45');
  assert.equal(added[0].kind, 'color');
  const pinned = togglePinClipboardItem(added, added[0].id);
  assert.equal(pinned[0].pinned, true);

  const cleared = clearUnpinnedClipboard(pinned);
  assert.ok(cleared.every((item) => item.pinned));
  assert.ok(cleared.some((item) => item.text === '#22C55E'));
});

test('font sync propagates fonts across all active Adobe Wine prefixes', () => {
  const { fonts, created } = addCustomFont(INITIAL_FONTS, 'Inter Display Alt', 'OTF', 'Sans-Serif');
  assert.equal(created.syncedWinePrefixes.length, 0);

  const prefixIds = INITIAL_WINE_PREFIXES.map((p) => p.id);
  const synced = syncFontsToPrefixes(fonts, prefixIds);
  const updated = synced.find((f) => f.id === created.id)!;
  assert.deepEqual(updated.syncedWinePrefixes, prefixIds);
});

test('pen tablet pressure curve responds accurately to soft, linear, and firm presets', () => {
  const linear = evaluatePressureCurve(0.5, 'linear');
  const soft = evaluatePressureCurve(0.5, 'soft');
  const firm = evaluatePressureCurve(0.5, 'firm');
  assert.equal(linear, 0.5);
  assert.ok(soft > linear, 'Soft curve should output higher pressure at mid input');
  assert.ok(firm < linear, 'Firm curve should output lower pressure at mid input');
});

test('Render Boost lowers active systemd services and reduces background RAM usage', () => {
  const normalProcs = buildSystemProcesses([], INITIAL_WINE_PREFIXES, BASE_SETTINGS, [], {});
  const normalUsage = computeSystemUsage(normalProcs, false);

  const boostedSettings = { ...BASE_SETTINGS, renderBoost: true, doNotDisturb: true };
  const boostedProcs = buildSystemProcesses([], INITIAL_WINE_PREFIXES, boostedSettings, [], {});
  const boostedUsage = computeSystemUsage(boostedProcs, true);

  assert.ok(boostedUsage.activeServices < normalUsage.activeServices);
  assert.ok(boostedUsage.ramUsedMb < normalUsage.ramUsedMb);
});

test('bulkInstallFontsFromFiles installs multiple fonts from File Manager and syncs to all Adobe Wine prefixes', () => {
  const prefixIds = INITIAL_WINE_PREFIXES.map((p) => p.id);
  const res = bulkInstallFontsFromFiles(
    INITIAL_FONTS,
    [
      { fileName: 'Montserrat-Bold.ttf', family: 'Montserrat', format: 'TTF' },
      { fileName: 'PlayfairDisplay-Regular.otf', family: 'Playfair Display', format: 'OTF' },
      { fileName: 'NotoSansTamil-Regular.ttf', family: 'Noto Sans Tamil', format: 'TTF' },
    ],
    prefixIds
  );

  assert.equal(res.installedCount, 3);
  assert.equal(res.newlyAdded.length, 3);
  const tamil = res.fonts.find((f) => f.family === 'Noto Sans Tamil');
  assert.ok(tamil);
  assert.equal(tamil.installedLinux, true);
  assert.deepEqual(tamil.syncedWinePrefixes, prefixIds);

  // Re-installing the same font should deduplicate cleanly
  const repeat = bulkInstallFontsFromFiles(
    res.fonts,
    [{ fileName: 'Montserrat-Bold.ttf', family: 'Montserrat', format: 'TTF' }],
    prefixIds
  );
  assert.equal(repeat.newlyAdded.length, 0);
  assert.equal(repeat.fonts.length, res.fonts.length);
});
