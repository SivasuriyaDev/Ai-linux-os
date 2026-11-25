import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADOBE_COMPATIBILITY_DB,
  INITIAL_WINE_PREFIXES,
  createWinePrefix,
  installMissingDependencies,
  runPrefixDiagnostics,
} from './adobeEngine';

test('compatibility database covers all 7 required Adobe Creative Cloud apps honestly', () => {
  const apps = new Set(ADOBE_COMPATIBILITY_DB.map((e) => e.appName));
  const required = [
    'Adobe Photoshop',
    'Adobe Premiere Pro',
    'Adobe After Effects',
    'Adobe Illustrator',
    'Adobe Audition',
    'Adobe Lightroom Classic',
    'Adobe Media Encoder',
  ];
  for (const name of required) {
    assert.ok(apps.has(name as any), `Missing Adobe app: ${name}`);
  }
  // Honest reporting: Premiere Pro 2024 must not falsely claim Gold support
  const premiere2024 = ADOBE_COMPATIBILITY_DB.find((e) => e.id === 'premiere-2024')!;
  assert.equal(premiere2024.tier, 'Unsupported');
});

test('creating a prefix and installing missing dependencies transitions Gold app to Ready', () => {
  const ps2021 = ADOBE_COMPATIBILITY_DB.find((e) => e.id === 'photoshop-2021')!;
  const { prefixes, created } = createWinePrefix(
    INITIAL_WINE_PREFIXES,
    ps2021,
    'Intel Arc / iGPU (Mesa Vulkan)'
  );
  assert.equal(created.status, 'Needs Dependencies');

  const resolved = installMissingDependencies(prefixes, created.id);
  const updated = resolved.find((p) => p.id === created.id)!;
  assert.equal(updated.status, 'Ready');
  assert.ok(updated.installedRuntimes.includes('dxvk'));
  assert.ok(updated.installedRuntimes.includes('msxml6'));
});

test('runPrefixDiagnostics surfaces real blocker for Premiere Pro 2024', () => {
  const pr2024 = ADOBE_COMPATIBILITY_DB.find((e) => e.id === 'premiere-2024')!;
  const { created } = createWinePrefix([], pr2024, 'NVIDIA RTX (Proprietary 565 Vulkan)');
  const report = runPrefixDiagnostics(created);
  assert.ok(report.some((c) => c.status === 'Blocker'));
});
