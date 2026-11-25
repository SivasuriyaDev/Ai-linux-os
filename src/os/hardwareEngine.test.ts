import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_USB_PORTS,
  autoInstallAllDrivers,
  buildInitialDrivers,
  ejectUsbPort,
  evaluateNoUsbMigrationReadiness,
  rescanUsbPorts,
  testUsbPort,
} from './hardwareEngine';

test('autoInstallAllDrivers transitions all pending graphics and audio drivers to Installed & Active', () => {
  const initial = buildInitialDrivers('NVIDIA');
  assert.ok(initial.some((d) => d.status !== 'Installed & Active'));

  const res = autoInstallAllDrivers(initial);
  assert.ok(res.installedCount >= 2);
  assert.ok(res.drivers.every((d) => d.status === 'Installed & Active'));
});

test('USB port diagnostics verify, safely eject, and rescan ports cleanly', () => {
  const tested = testUsbPort(INITIAL_USB_PORTS, 'usb-c-1', '10:30');
  assert.equal(tested[0].status, 'Verified');

  const ejected = ejectUsbPort(tested, 'usb-c-1');
  assert.equal(ejected[0].status, 'Safely Ejected');
  assert.equal(ejected[0].powerDrawMa, 0);

  const rescanned = rescanUsbPorts(ejected);
  assert.equal(rescanned[0].status, 'Working (OK)');
  assert.ok(rescanned[0].powerDrawMa > 0);
});

test('evaluateNoUsbMigrationReadiness blocks BitLocker and insufficient space while approving clean UEFI dual-boot', () => {
  const blocked = evaluateNoUsbMigrationReadiness({
    windowsFreeGb: 180,
    allocateGb: 170,
    bitLockerEnabled: true,
    uefiMode: true,
    keepWindowsDualBoot: true,
    importWindowsUserFiles: true,
  });
  assert.equal(blocked.ready, false);
  assert.equal(blocked.blockers.length, 2);

  const ok = evaluateNoUsbMigrationReadiness({
    windowsFreeGb: 240,
    allocateGb: 120,
    bitLockerEnabled: false,
    uefiMode: true,
    keepWindowsDualBoot: true,
    importWindowsUserFiles: true,
  });
  assert.equal(ok.ready, true);
  assert.equal(ok.windowsRemainingGb, 120);
  assert.ok(ok.bootMethod.includes('No USB Pendrive'));
});
