import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_WINE_PREFIXES } from './adobeEngine';
import { INITIAL_FONTS } from './creativeTools';
import { INITIAL_FS_NODES } from './fileSystem';
import { executeTerminalCommand } from './terminalEngine';
import type { SystemSettingsState } from './types';

const MOCK_SETTINGS: SystemSettingsState = {
  theme: 'dark',
  wallpaper: 'mica-dark',
  accentColor: 'sky',
  transparencyLevel: 60,
  taskbarCentered: true,
  wifiEnabled: true,
  wifiNetwork: 'Studio-5G',
  bluetoothEnabled: true,
  volume: 75,
  brightness: 100,
  nightLight: false,
  renderBoost: true,
  doNotDisturb: true,
  activeColorProfile: 'display-p3',
  powerProfile: 'Performance',
  gpuVendor: 'NVIDIA',
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

const CTX = {
  settings: MOCK_SETTINGS,
  prefixes: INITIAL_WINE_PREFIXES,
  files: INITIAL_FS_NODES,
  fonts: INITIAL_FONTS,
  ramUsedMb: 512,
  activeServices: 26,
};

test('aetherfetch and vulkaninfo reflect active GPU vendor and Render Boost state', () => {
  const fetchRes = executeTerminalCommand('aetherfetch', CTX);
  assert.match(fetchRes.output, /Debian 12 Bookworm Minimal/);
  assert.match(fetchRes.output, /Render Boost: ON/);
  assert.match(fetchRes.output, /NVIDIA/);

  const vkRes = executeTerminalCommand('vulkaninfo', CTX);
  assert.match(vkRes.output, /NVIDIA Proprietary 565/);
});

test('prefix list, ls downloads, cat, and clear execute deterministically', () => {
  const prefRes = executeTerminalCommand('prefix list', CTX);
  assert.match(prefRes.output, /Adobe Photoshop/);

  const lsRes = executeTerminalCommand('ls downloads', CTX);
  assert.match(lsRes.output, /Photoshop_2021_Setup\.exe/);

  const catRes = executeTerminalCommand('cat Adobe_Compatibility_Test_Log.txt', CTX);
  assert.match(catRes.output, /\[PASS\] Photoshop 2021/);

  const clearRes = executeTerminalCommand('clear', CTX);
  assert.equal(clearRes.clear, true);
});
