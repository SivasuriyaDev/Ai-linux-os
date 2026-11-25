import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePartitionLayout, validateInstallerUser } from './installerValidation';

test('dual-boot partition layout preserves Windows 11 NTFS and allocates EFI + AetherOS', () => {
  const slices = calculatePartitionLayout(512, 'dual-boot', 'uefi', true, 160);
  assert.equal(slices.length, 3);
  assert.equal(slices[0].filesystem, 'FAT32 (EFI)');
  assert.equal(slices[1].filesystem, 'NTFS (Windows 11)');
  assert.equal(slices[2].filesystem, 'ext4 (LUKS2)');
  const total = slices.reduce((sum, s) => sum + s.sizeGb, 0);
  assert.equal(Math.round(total), 512);
});

test('validateInstallerUser rejects invalid usernames and mismatched passwords', () => {
  const bad = validateInstallerUser({
    fullName: '',
    username: 'Admin User!',
    hostname: 'bad host',
    password: '123',
    confirmPassword: '456',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.username);
  assert.ok(bad.errors.hostname);
  assert.ok(bad.errors.password);
  assert.ok(bad.errors.confirmPassword);

  const good = validateInstallerUser({
    fullName: 'Alex Mercer',
    username: 'amercer',
    hostname: 'aether-workstation',
    password: 'StrongPassword99',
    confirmPassword: 'StrongPassword99',
  });
  assert.equal(good.valid, true);
  assert.deepEqual(good.errors, {});
});
