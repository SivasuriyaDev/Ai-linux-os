import type { FsNode, StorageVolume } from './types';

export const INITIAL_STORAGE_VOLUMES: StorageVolume[] = [
  {
    id: 'home',
    letter: 'C:',
    label: 'AetherOS System',
    devicePath: '/dev/nvme0n1p2',
    mountPoint: '/',
    filesystem: 'ext4',
    kind: 'os-drive',
    totalGb: 256,
    usedGb: 42,
    mounted: true,
    readWrite: true,
  },
  {
    id: 'ntfs-drive',
    letter: 'D:',
    label: 'Windows_Data',
    devicePath: '/dev/nvme0n1p3',
    mountPoint: '/media/aether/Windows_Data',
    filesystem: 'NTFS',
    kind: 'local-disk',
    totalGb: 512,
    usedGb: 294,
    mounted: true,
    readWrite: true,
  },
  {
    id: 'vol-e',
    letter: 'E:',
    label: 'Creative Projects',
    devicePath: '/dev/sda1',
    mountPoint: '/media/aether/Creative_Projects',
    filesystem: 'NTFS',
    kind: 'local-disk',
    totalGb: 1000,
    usedGb: 412,
    mounted: true,
    readWrite: true,
  },
  {
    id: 'vol-f',
    letter: 'F:',
    label: 'SanDisk Extreme USB',
    devicePath: '/dev/sdb1',
    mountPoint: '/media/aether/SanDisk_Extreme',
    filesystem: 'exFAT',
    kind: 'external-usb',
    totalGb: 256,
    usedGb: 84,
    mounted: true,
    readWrite: true,
  },
  {
    id: 'smb-nas',
    letter: 'Z:',
    label: 'NAS Studio',
    devicePath: '//nas.studio.local/projects',
    mountPoint: '/mnt/nas-studio',
    filesystem: 'SMB 3.1',
    kind: 'network',
    totalGb: 4000,
    usedGb: 1840,
    mounted: true,
    readWrite: true,
  },
];

export const INITIAL_FS_NODES: FsNode[] = [
  // Root virtual mount points & Windows-style drive volumes (C:, D:, E:, F:, Z:)
  { id: 'home', name: 'AetherOS System (C:)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:40' },
  { id: 'downloads', name: 'Downloads', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:52' },
  { id: 'documents', name: 'Documents', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-24 19:15' },
  { id: 'pictures', name: 'Pictures', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-23 14:22' },
  { id: 'videos', name: 'Videos', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-22 11:05' },
  { id: 'ntfs-drive', name: 'Windows_Data (D:)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:10' },
  { id: 'vol-e', name: 'Creative Projects (E:)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:20' },
  { id: 'vol-f', name: 'SanDisk Extreme USB (F:)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:35' },
  { id: 'smb-nas', name: 'NAS Studio (Z:)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:45' },

  // Downloads (includes EXE, MSI, and ZIP archive for testing real workflows)
  {
    id: 'dl-ps-exe',
    name: 'Photoshop_2021_Setup.exe',
    parentId: 'downloads',
    kind: 'exe',
    sizeBytes: 2_384_120_000,
    modifiedAt: '2026-11-25 08:50',
    adobeHint: 'photoshop-2021',
    content: 'Win64 PE Installer · Adobe Photoshop 2021 (v22.5)\nRecommended Prefix: ~/.local/share/aether-adobe/prefixes/photoshop-2021\nGraphics Layer: DXVK 2.4.1 (Vulkan)\nRequired Runtimes: vcrun2019, vcrun2022, msxml6, gdiplus, atmlib, corefonts',
  },
  {
    id: 'dl-ai-msi',
    name: 'Illustrator_2021_x64.msi',
    parentId: 'downloads',
    kind: 'msi',
    sizeBytes: 1_912_400_000,
    modifiedAt: '2026-11-25 08:42',
    adobeHint: 'illustrator-2021',
    content: 'Windows MSI Package · Adobe Illustrator 2021 (v25.4)\nRecommended Prefix: ~/.local/share/aether-adobe/prefixes/illustrator-2021\nGraphics Layer: DXVK 2.4.1 (Vulkan)',
  },
  {
    id: 'dl-zip-plugins',
    name: 'Adobe_Color_LUTs_Pack.zip',
    parentId: 'downloads',
    kind: 'zip',
    sizeBytes: 48_230_000,
    modifiedAt: '2026-11-24 21:18',
    content: 'ZIP Archive (3 files) — Extract to install 3D .cube LUTs and brush presets.',
    archiveEntries: [
      {
        name: 'Kodak_2383_Print.cube',
        kind: 'document',
        sizeBytes: 1_450_000,
        content: 'TITLE "Kodak 2383 Rec709 Film Print LUT"\nLUT_3D_SIZE 33\nDOMAIN_MIN 0.0 0.0 0.0\nDOMAIN_MAX 1.0 1.0 1.0',
      },
      {
        name: 'Architectural_Neutral.cube',
        kind: 'document',
        sizeBytes: 1_210_000,
        content: 'TITLE "Architectural Cool Neutral Grade"\nLUT_3D_SIZE 33',
      },
      {
        name: 'README_LUT_Install.txt',
        kind: 'document',
        sizeBytes: 2_048,
        content: 'Copy .cube files into your Photoshop prefix under:\ndrive_c/Program Files/Adobe/Adobe Photoshop 2021/Presets/3DLUTs/',
      },
    ],
  },
  {
    id: 'dl-blender-deb',
    name: 'Blender_4.2_LTS_amd64.deb',
    parentId: 'downloads',
    kind: 'deb',
    sizeBytes: 312_400_000,
    modifiedAt: '2026-11-25 08:48',
    content: 'Debian Package (.deb) · Blender 4.2 LTS 3D Creation Suite\nDouble-click to install automatically with full APT dependency resolution — no terminal required.',
  },
  {
    id: 'dl-krita-appimage',
    name: 'Krita_5.2.6_x86_64.AppImage',
    parentId: 'downloads',
    kind: 'appimage',
    sizeBytes: 158_900_000,
    modifiedAt: '2026-11-25 08:46',
    content: 'Portable Linux AppImage · Krita 5.2.6 Digital Painting Studio\nDouble-click to auto-enable execute bit (no chmod +x needed), integrate into ~/Applications, and add Start Menu shortcut.',
  },
  {
    id: 'dl-fonts-folder',
    name: 'Creative_Fonts_Pack',
    parentId: 'downloads',
    kind: 'folder',
    sizeBytes: 0,
    modifiedAt: '2026-11-25 08:54',
  },
  {
    id: 'dl-font-montserrat',
    name: 'Montserrat-Bold.ttf',
    parentId: 'dl-fonts-folder',
    kind: 'font',
    sizeBytes: 248_000,
    modifiedAt: '2026-11-25 08:54',
    content: 'TrueType Font (.ttf) · Montserrat Bold\nSelect multiple fonts and click "Install Selected Fonts" to install to Linux & sync into all Adobe Wine prefixes automatically.',
  },
  {
    id: 'dl-font-poppins',
    name: 'Poppins-SemiBold.ttf',
    parentId: 'dl-fonts-folder',
    kind: 'font',
    sizeBytes: 196_000,
    modifiedAt: '2026-11-25 08:54',
    content: 'TrueType Font (.ttf) · Poppins SemiBold\nReady for 1-click bulk installation to ~/.local/share/fonts and Adobe Wine prefixes.',
  },
  {
    id: 'dl-font-playfair',
    name: 'PlayfairDisplay-Regular.otf',
    parentId: 'dl-fonts-folder',
    kind: 'font',
    sizeBytes: 284_000,
    modifiedAt: '2026-11-25 08:54',
    content: 'OpenType Font (.otf) · Playfair Display Editorial Serif\nReady for 1-click bulk installation to Linux and Adobe Photoshop / Illustrator.',
  },
  {
    id: 'dl-font-inter',
    name: 'Inter-Variable.ttf',
    parentId: 'dl-fonts-folder',
    kind: 'font',
    sizeBytes: 342_000,
    modifiedAt: '2026-11-25 08:54',
    content: 'TrueType Variable Font (.ttf) · Inter UI Sans\nReady for 1-click bulk installation to Linux and Adobe Wine prefixes.',
  },
  {
    id: 'dl-font-noto-tamil',
    name: 'NotoSansTamil-Regular.ttf',
    parentId: 'dl-fonts-folder',
    kind: 'font',
    sizeBytes: 174_000,
    modifiedAt: '2026-11-25 08:54',
    content: 'TrueType Font (.ttf) · Noto Sans Tamil Unicode\nSupports Tamil script rendering across Linux apps and Adobe Wine environments.',
  },
  {
    id: 'dl-davinci-deb',
    name: 'aether-vulkan-diagnostics.sh',
    parentId: 'downloads',
    kind: 'code',
    sizeBytes: 4_120,
    modifiedAt: '2026-11-24 17:04',
    content: '#!/usr/bin/env bash\nvulkaninfo --summary\nvainfo\nwine --version',
  },

  // Documents
  {
    id: 'doc-arch',
    name: 'AetherOS_Architecture_Notes.md',
    parentId: 'documents',
    kind: 'document',
    sizeBytes: 18_432,
    modifiedAt: '2026-11-25 08:30',
    content: '# AetherOS 1.0 LTS Build Summary\n- Base: Debian 12 Bookworm Minimal + Backports Linux 6.12 LTS\n- Idle RAM target: ~420 MB cold boot\n- Bootloader: GRUB2 Dual UEFI (shim-signed) + Legacy BIOS\n- Desktop: Qt 6.7 / QML Wayland Shell with Mica & Acrylic shaders',
  },
  {
    id: 'doc-wine-report',
    name: 'Adobe_Compatibility_Test_Log.txt',
    parentId: 'documents',
    kind: 'document',
    sizeBytes: 9_840,
    modifiedAt: '2026-11-24 22:10',
    content: '[PASS] Photoshop 2021 v22.5 — DXVK 2.4.1, Wacom pressure verified\n[PASS] Illustrator 2021 v25.4 — SVG/PDF vector export verified\n[WARN] Lightroom Classic v11 — Disable GPU Develop on hybrid laptops\n[FAIL] Premiere Pro 2024 v24.x — Blocked by CEF/DirectML/CUDA interop',
  },

  // Pictures
  {
    id: 'pic-brand',
    name: 'Editorial_Keynote_Poster.psd',
    parentId: 'pictures',
    kind: 'image',
    sizeBytes: 142_600_000,
    modifiedAt: '2026-11-23 16:40',
    content: 'Adobe Photoshop Document · 4096 × 2304 px · 16-bit sRGB · 18 Layers',
  },
  {
    id: 'pic-studio',
    name: 'Alpine_Raw_Capture_042.dng',
    parentId: 'pictures',
    kind: 'image',
    sizeBytes: 64_100_000,
    modifiedAt: '2026-11-23 11:12',
    content: 'Adobe DNG Raw Photograph · 6000 × 4000 px · ISO 100 · f/4.0 · 1/250s',
  },

  // Videos
  {
    id: 'vid-reel',
    name: 'Product_Launch_4K_ProRes.mov',
    parentId: 'videos',
    kind: 'video',
    sizeBytes: 1_840_000_000,
    modifiedAt: '2026-11-22 10:50',
    content: 'Apple ProRes 422 HQ · 3840 × 2160 · 24 fps · 02:14 · VA-API Hardware Decode Ready',
  },

  // NTFS External Drive (Read/Write mounted via kernel ntfs3)
  {
    id: 'ntfs-projects',
    name: 'Client_Brand_Assets',
    parentId: 'ntfs-drive',
    kind: 'folder',
    sizeBytes: 0,
    modifiedAt: '2026-11-21 15:20',
  },
  {
    id: 'ntfs-fonts',
    name: 'Licensed_Windows_Fonts_Backup.zip',
    parentId: 'ntfs-drive',
    kind: 'zip',
    sizeBytes: 86_400_000,
    modifiedAt: '2026-11-20 09:15',
    content: 'Mounted via Linux ntfs3 kernel driver (Read/Write enabled, Fast Startup disabled).',
    archiveEntries: [
      { name: 'SegoeUI_Ref.ttf', kind: 'document', sizeBytes: 940_000, content: 'Font archive entry' },
      { name: 'Calibri_Ref.ttf', kind: 'document', sizeBytes: 810_000, content: 'Font archive entry' },
    ],
  },
  {
    id: 'ntfs-logo',
    name: 'Client_Vector_Master.ai',
    parentId: 'ntfs-projects',
    kind: 'image',
    sizeBytes: 24_500_000,
    modifiedAt: '2026-11-21 15:18',
    content: 'Adobe Illustrator Artwork · CMYK · 6 Artboards (NTFS R/W verified)',
  },

  // Creative Projects (E: — Secondary Internal 1TB SSD/HDD NTFS R/W)
  {
    id: 'vole-exports',
    name: '4K_Commercial_Exports',
    parentId: 'vol-e',
    kind: 'folder',
    sizeBytes: 0,
    modifiedAt: '2026-11-24 18:10',
  },
  {
    id: 'vole-psd-master',
    name: 'Studio_Billboard_8K_Master.psd',
    parentId: 'vol-e',
    kind: 'image',
    sizeBytes: 486_000_000,
    modifiedAt: '2026-11-25 08:18',
    content: 'Adobe Photoshop PSB/PSD Master · 7680 × 4320 · 16-bit Adobe RGB · Stored on E:\\ (NTFS Read/Write)',
  },
  {
    id: 'vole-reel',
    name: 'Festival_Trailer_Grade.mov',
    parentId: 'vole-exports',
    kind: 'video',
    sizeBytes: 2_140_000_000,
    modifiedAt: '2026-11-24 18:05',
    content: 'DNxHR HQX 4K · 24 fps · Auto-mounted from /dev/sda1 (NTFS R/W)',
  },

  // SanDisk Extreme USB (F: — External USB 3.2 Gen 2 exFAT)
  {
    id: 'volf-camera',
    name: 'Camera_RAW_Backup',
    parentId: 'vol-f',
    kind: 'folder',
    sizeBytes: 0,
    modifiedAt: '2026-11-25 08:30',
  },
  {
    id: 'volf-notes',
    name: 'Shoot_Checklist.txt',
    parentId: 'vol-f',
    kind: 'document',
    sizeBytes: 3_420,
    modifiedAt: '2026-11-25 08:34',
    content: 'SanDisk Extreme NVMe USB-C (F:)\nMounted via exFAT Read/Write at 10 Gbps (USB 3.2 Gen 2).',
  },

  // SMB Network Storage (Z:)
  {
    id: 'smb-render',
    name: 'Shared_Studio_Footage.mov',
    parentId: 'smb-nas',
    kind: 'video',
    sizeBytes: 3_420_000_000,
    modifiedAt: '2026-11-25 07:30',
    content: 'SMB 3.1.1 Share (smb://nas.studio.local/projects) · 10GbE throughput verified',
  },
];

export function computeVolumeFreeGb(volume: StorageVolume): number {
  return Math.max(0, Math.round(volume.totalGb - volume.usedGb));
}

export function computeVolumeUsedPercent(volume: StorageVolume): number {
  if (volume.totalGb <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((volume.usedGb / volume.totalGb) * 100)));
}

export function getNextDriveLetter(volumes: StorageVolume[]): string {
  const used = new Set(volumes.map((v) => v.letter.toUpperCase()));
  const candidates = 'DEFGHIJKLMNOPQRSTUVWXY'.split('').map((c) => `${c}:`);
  return candidates.find((letter) => !used.has(letter)) ?? 'X:';
}

export function mountNewStorageVolume(
  volumes: StorageVolume[],
  nodes: FsNode[],
  options: {
    label: string;
    filesystem?: StorageVolume['filesystem'];
    kind?: StorageVolume['kind'];
    totalGb?: number;
    usedGb?: number;
  }
): { volumes: StorageVolume[]; nodes: FsNode[]; created: StorageVolume } {
  const letter = getNextDriveLetter(volumes);
  const cleanLabel = options.label.trim() || 'New Volume';
  const slug = letter.replace(':', '').toLowerCase();
  const id = `vol-${slug}-${Date.now()}`;
  const kind = options.kind ?? 'local-disk';
  const filesystem = options.filesystem ?? 'NTFS';
  const totalGb = Math.max(16, options.totalGb ?? 500);
  const usedGb = Math.min(totalGb, Math.max(0, options.usedGb ?? 64));
  const diskIndex = volumes.length + 1;

  const created: StorageVolume = {
    id,
    letter,
    label: cleanLabel,
    devicePath: kind === 'external-usb' ? `/dev/sd${String.fromCharCode(97 + diskIndex)}1` : `/dev/nvme1n1p${diskIndex}`,
    mountPoint: `/media/aether/${cleanLabel.replace(/\s+/g, '_')}`,
    filesystem,
    kind,
    totalGb,
    usedGb,
    mounted: true,
    readWrite: true,
  };

  const rootFolderNode: FsNode = {
    id,
    name: `${cleanLabel} (${letter})`,
    parentId: null,
    kind: 'folder',
    sizeBytes: 0,
    modifiedAt: 'Just now',
  };

  const readmeNode: FsNode = {
    id: `${id}-info`,
    name: 'Volume_Ready.txt',
    parentId: id,
    kind: 'document',
    sizeBytes: 1_024,
    modifiedAt: 'Just now',
    content: `${cleanLabel} (${letter}) auto-mounted via AetherOS Storage Service.\nDevice: ${created.devicePath}\nFilesystem: ${filesystem} (Read/Write Enabled)\nCapacity: ${totalGb} GB (${totalGb - usedGb} GB free)`,
  };

  return {
    volumes: [...volumes, created],
    nodes: [...nodes, rootFolderNode, readmeNode],
    created,
  };
}

export function classifyUploadedFile(fileName: string): FsNode['kind'] {
  const lower = fileName.trim().toLowerCase();
  if (lower.endsWith('.exe')) return 'exe';
  if (lower.endsWith('.msi')) return 'msi';
  if (lower.endsWith('.deb')) return 'deb';
  if (lower.endsWith('.appimage')) return 'appimage';
  if (lower.endsWith('.ttf') || lower.endsWith('.otf')) return 'font';
  if (lower.endsWith('.zip') || lower.endsWith('.tar.gz') || lower.endsWith('.7z')) return 'zip';
  if (/\.(png|jpe?g|webp|psd|ai|dng|svg|gif)$/i.test(lower)) return 'image';
  if (/\.(mp4|mov|mkv|webm|avi)$/i.test(lower)) return 'video';
  if (/\.(sh|py|ts|tsx|js|json|conf|qml|cfg)$/i.test(lower)) return 'code';
  return 'document';
}

export function isInstallablePackageKind(kind: FsNode['kind']): boolean {
  return kind === 'exe' || kind === 'msi' || kind === 'deb' || kind === 'appimage';
}

export function parseFontFamilyFromFilename(fileName: string): {
  family: string;
  format: 'TTF' | 'OTF';
} {
  const isOtf = fileName.trim().toLowerCase().endsWith('.otf');
  const withoutExt = fileName.trim().replace(/\.(ttf|otf)$/i, '');
  const cleaned = withoutExt
    .replace(/[-_](regular|bold|semibold|medium|light|italic|variable|vf)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
  return {
    family: cleaned || 'Custom Font',
    format: isOtf ? 'OTF' : 'TTF',
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let idx = 0;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val >= 100 || idx === 0 ? Math.round(val) : val.toFixed(1)} ${units[idx]}`;
}

export function getChildren(nodes: FsNode[], folderId: string): FsNode[] {
  return nodes
    .filter((n) => n.parentId === folderId)
    .sort((a, b) => {
      if (a.kind === 'folder' && b.kind !== 'folder') return -1;
      if (a.kind !== 'folder' && b.kind === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
}

export function getRecentFiles(nodes: FsNode[], limit = 6): FsNode[] {
  return nodes
    .filter((n) => n.kind !== 'folder')
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, limit);
}

export function getBreadcrumbs(nodes: FsNode[], folderId: string): FsNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const trail: FsNode[] = [];
  let cursor = byId.get(folderId);
  while (cursor) {
    trail.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }
  return trail;
}

export function searchFiles(nodes: FsNode[], query: string): FsNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return nodes.filter((n) => n.name.toLowerCase().includes(q));
}

export function createFolder(
  nodes: FsNode[],
  parentId: string,
  folderName: string
): { nodes: FsNode[]; created: FsNode } {
  const cleanName = folderName.trim() || 'New Folder';
  const existingNames = new Set(
    nodes.filter((n) => n.parentId === parentId).map((n) => n.name.toLowerCase())
  );
  let finalName = cleanName;
  let counter = 2;
  while (existingNames.has(finalName.toLowerCase())) {
    finalName = `${cleanName} (${counter})`;
    counter++;
  }

  const created: FsNode = {
    id: `folder-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: finalName,
    parentId,
    kind: 'folder',
    sizeBytes: 0,
    modifiedAt: '2026-11-25 09:05',
  };
  return { nodes: [...nodes, created], created };
}

export function renameNode(nodes: FsNode[], nodeId: string, newName: string): FsNode[] {
  const trimmed = newName.trim();
  if (!trimmed) return nodes;
  return nodes.map((n) => (n.id === nodeId ? { ...n, name: trimmed } : n));
}

export function deleteNode(nodes: FsNode[], nodeId: string): FsNode[] {
  const toDelete = new Set<string>([nodeId]);
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const node of nodes) {
      if (node.parentId && toDelete.has(node.parentId) && !toDelete.has(node.id)) {
        toDelete.add(node.id);
        expanded = true;
      }
    }
  }
  return nodes.filter((n) => !toDelete.has(n.id));
}

export function moveNode(
  nodes: FsNode[],
  nodeId: string,
  targetFolderId: string
): FsNode[] {
  if (nodeId === targetFolderId) return nodes;
  const target = nodes.find((n) => n.id === targetFolderId && n.kind === 'folder');
  if (!target) return nodes;
  // Prevent moving a folder into its own descendant
  const crumbs = getBreadcrumbs(nodes, targetFolderId);
  if (crumbs.some((c) => c.id === nodeId)) return nodes;

  return nodes.map((n) =>
    n.id === nodeId ? { ...n, parentId: targetFolderId } : n
  );
}

export function createTextFile(
  nodes: FsNode[],
  parentId: string,
  baseName = 'New Text Document.txt'
): { nodes: FsNode[]; created: FsNode } {
  const existingNames = new Set(
    nodes.filter((n) => n.parentId === parentId).map((n) => n.name.toLowerCase())
  );
  const dotIdx = baseName.lastIndexOf('.');
  const stem = dotIdx > 0 ? baseName.slice(0, dotIdx) : baseName;
  const ext = dotIdx > 0 ? baseName.slice(dotIdx) : '';

  let finalName = baseName;
  let counter = 2;
  while (existingNames.has(finalName.toLowerCase())) {
    finalName = `${stem} (${counter})${ext}`;
    counter++;
  }

  const created: FsNode = {
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: finalName,
    parentId,
    kind: 'document',
    sizeBytes: 128,
    modifiedAt: 'Just now',
    content: `${finalName}\nCreated via AetherOS Explorer.`,
  };
  return { nodes: [...nodes, created], created };
}

function deduplicateCopyName(existingNames: Set<string>, originalName: string): string {
  if (!existingNames.has(originalName.toLowerCase())) return originalName;
  const dotIdx = originalName.lastIndexOf('.');
  const hasExt = dotIdx > 0 && dotIdx < originalName.length - 1;
  const stem = hasExt ? originalName.slice(0, dotIdx) : originalName;
  const ext = hasExt ? originalName.slice(dotIdx) : '';

  let candidate = `${stem} - Copy${ext}`;
  let counter = 2;
  while (existingNames.has(candidate.toLowerCase())) {
    candidate = `${stem} - Copy (${counter})${ext}`;
    counter++;
  }
  return candidate;
}

export function pasteNodes(
  nodes: FsNode[],
  sourceIds: string[],
  targetFolderId: string,
  mode: 'copy' | 'cut'
): { nodes: FsNode[]; pastedCount: number } {
  const target = nodes.find((n) => n.id === targetFolderId && n.kind === 'folder');
  if (!target || sourceIds.length === 0) {
    return { nodes, pastedCount: 0 };
  }

  if (mode === 'cut') {
    let next = nodes;
    let moved = 0;
    for (const id of sourceIds) {
      const src = next.find((n) => n.id === id);
      if (!src || src.parentId === targetFolderId) continue;
      const updated = moveNode(next, id, targetFolderId);
      if (updated !== next) {
        next = updated;
        moved++;
      }
    }
    return { nodes: next, pastedCount: moved };
  }

  // Deep copy mode (clones files and nested folder trees recursively)
  const existingNames = new Set(
    nodes.filter((n) => n.parentId === targetFolderId).map((n) => n.name.toLowerCase())
  );
  const additions: FsNode[] = [];
  let pastedCount = 0;
  let seq = 0;

  const cloneRecursive = (src: FsNode, newParentId: string, isTopLevel: boolean) => {
    seq++;
    const newId = `copy-${Date.now()}-${seq}-${Math.floor(Math.random() * 10000)}`;
    const newName = isTopLevel
      ? deduplicateCopyName(existingNames, src.name)
      : src.name;
    if (isTopLevel) {
      existingNames.add(newName.toLowerCase());
    }
    const cloned: FsNode = {
      ...src,
      id: newId,
      parentId: newParentId,
      name: newName,
      modifiedAt: 'Just now',
    };
    additions.push(cloned);
    if (src.kind === 'folder') {
      const children = nodes.filter((n) => n.parentId === src.id);
      for (const child of children) {
        cloneRecursive(child, newId, false);
      }
    }
  };

  for (const id of sourceIds) {
    const src = nodes.find((n) => n.id === id);
    if (!src) continue;
    // Prevent copying a folder into itself or its own descendant
    if (src.kind === 'folder') {
      const crumbs = getBreadcrumbs(nodes, targetFolderId);
      if (crumbs.some((c) => c.id === src.id)) continue;
    }
    cloneRecursive(src, targetFolderId, true);
    pastedCount++;
  }

  return {
    nodes: [...nodes, ...additions],
    pastedCount,
  };
}

export function extractZipArchive(
  nodes: FsNode[],
  zipNodeId: string
): { nodes: FsNode[]; extractedFolder: FsNode | null; extractedCount: number } {
  const zipNode = nodes.find((n) => n.id === zipNodeId && n.kind === 'zip');
  if (!zipNode || !zipNode.parentId) {
    return { nodes, extractedFolder: null, extractedCount: 0 };
  }

  const baseFolderName = zipNode.name.replace(/\.zip$/i, '');
  const { nodes: withFolder, created: extractedFolder } = createFolder(
    nodes,
    zipNode.parentId,
    baseFolderName
  );

  const entries = zipNode.archiveEntries ?? [
    { name: 'extracted_readme.txt', kind: 'document' as const, sizeBytes: 1024, content: 'Archive extracted.' },
  ];

  const extractedChildren: FsNode[] = entries.map((entry, idx) => ({
    id: `${extractedFolder.id}-item-${idx}`,
    name: entry.name,
    parentId: extractedFolder.id,
    kind: entry.kind,
    sizeBytes: entry.sizeBytes,
    modifiedAt: '2026-11-25 09:05',
    content: entry.content,
  }));

  return {
    nodes: [...withFolder, ...extractedChildren],
    extractedFolder,
    extractedCount: extractedChildren.length,
  };
}
