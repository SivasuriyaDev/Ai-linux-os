import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_FS_NODES,
  classifyUploadedFile,
  createFolder,
  deleteNode,
  extractZipArchive,
  getBreadcrumbs,
  getChildren,
  isInstallablePackageKind,
  moveNode,
  parseFontFamilyFromFilename,
  renameNode,
  searchFiles,
} from './fileSystem';

test('getChildren lists folders before files alphabetically', () => {
  const withSub = createFolder(INITIAL_FS_NODES, 'downloads', 'Adobe_Installers').nodes;
  const children = getChildren(withSub, 'downloads');
  assert.equal(children[0].kind, 'folder');
  assert.equal(children[0].name, 'Adobe_Installers');
});

test('extractZipArchive creates folder and unpacks entries inside parent directory', () => {
  const result = extractZipArchive(INITIAL_FS_NODES, 'dl-zip-plugins');
  assert.ok(result.extractedFolder);
  assert.equal(result.extractedFolder.name, 'Adobe_Color_LUTs_Pack');
  assert.equal(result.extractedCount, 3);

  const inside = getChildren(result.nodes, result.extractedFolder.id);
  assert.equal(inside.length, 3);
  assert.ok(inside.some((f) => f.name === 'Kodak_2383_Print.cube'));
});

test('rename, move, search, breadcrumbs, and recursive delete behave deterministically', () => {
  const created = createFolder(INITIAL_FS_NODES, 'documents', 'Work_2026');
  const renamed = renameNode(created.nodes, created.created.id, 'Studio_2026');
  const found = searchFiles(renamed, 'studio_2026');
  assert.equal(found.length, 1);

  const moved = moveNode(renamed, 'doc-arch', created.created.id);
  const crumbs = getBreadcrumbs(moved, created.created.id);
  assert.deepEqual(
    crumbs.map((c) => c.name),
    ['Home', 'Documents', 'Studio_2026']
  );

  const deleted = deleteNode(moved, created.created.id);
  assert.equal(deleted.some((n) => n.id === 'doc-arch'), false);
  assert.equal(deleted.some((n) => n.id === created.created.id), false);
});

test('classifyUploadedFile and parseFontFamilyFromFilename support Windows-simple installers and fonts', () => {
  assert.equal(classifyUploadedFile('Photoshop_Setup.exe'), 'exe');
  assert.equal(classifyUploadedFile('Illustrator.msi'), 'msi');
  assert.equal(classifyUploadedFile('Blender_4.2_amd64.deb'), 'deb');
  assert.equal(classifyUploadedFile('Krita_5.2.6.AppImage'), 'appimage');
  assert.equal(classifyUploadedFile('Montserrat-Bold.ttf'), 'font');
  assert.equal(classifyUploadedFile('PlayfairDisplay-Regular.otf'), 'font');

  assert.equal(isInstallablePackageKind('deb'), true);
  assert.equal(isInstallablePackageKind('appimage'), true);
  assert.equal(isInstallablePackageKind('font'), false);

  const parsed = parseFontFamilyFromFilename('PlayfairDisplay-Regular.otf');
  assert.equal(parsed.family, 'Playfair Display');
  assert.equal(parsed.format, 'OTF');
});
