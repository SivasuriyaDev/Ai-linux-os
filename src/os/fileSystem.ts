import type { FsNode } from './types';

export const INITIAL_FS_NODES: FsNode[] = [
  // Root virtual mount points
  { id: 'home', name: 'Home', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:40' },
  { id: 'downloads', name: 'Downloads', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:52' },
  { id: 'documents', name: 'Documents', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-24 19:15' },
  { id: 'pictures', name: 'Pictures', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-23 14:22' },
  { id: 'videos', name: 'Videos', parentId: 'home', kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-22 11:05' },
  { id: 'ntfs-drive', name: 'Windows_Data (NTFS)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:10' },
  { id: 'smb-nas', name: 'NAS Studio (SMB)', parentId: null, kind: 'folder', sizeBytes: 0, modifiedAt: '2026-11-25 08:45' },

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

  // SMB Network Storage
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
