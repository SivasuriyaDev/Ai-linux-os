import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Box,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Download,
  FileCode,
  FileText,
  Film,
  Folder,
  FolderPlus,
  HardDrive,
  Home,
  Image,
  Monitor,
  Network,
  Package,
  Pencil,
  Play,
  Plus,
  Search,
  Square,
  Star,
  Trash2,
  Type,
  Upload,
  Usb,
  X,
} from 'lucide-react';
import {
  classifyUploadedFile,
  computeVolumeFreeGb,
  computeVolumeUsedPercent,
  formatBytes,
  getBreadcrumbs,
  getChildren,
  getRecentFiles,
  isInstallablePackageKind,
  parseFontFamilyFromFilename,
  searchFiles,
} from '../../os/fileSystem';
import type { ExeInstallRequest, FsNode, StorageVolume } from '../../os/types';

interface FileManagerAppProps {
  nodes: FsNode[];
  volumes: StorageVolume[];
  initialFolderId?: string;
  activePrefixCount: number;
  onCreateFolder: (parentId: string, name: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteNodes: (nodeIds: string[]) => void;
  onMoveNode: (nodeId: string, targetFolderId: string) => void;
  onExtractZip: (zipNodeId: string) => void;
  onLaunchExeInstaller: (req: ExeInstallRequest) => void;
  onBulkInstallFonts: (
    fontFiles: { fileName: string; family: string; format: 'TTF' | 'OTF' }[]
  ) => number;
  onImportFiles: (
    parentId: string,
    imported: { name: string; kind: FsNode['kind']; sizeBytes: number; content: string }[]
  ) => void;
  onMountVolume: (options: {
    label: string;
    filesystem?: StorageVolume['filesystem'];
    kind?: StorageVolume['kind'];
    totalGb?: number;
    usedGb?: number;
  }) => void;
  onOpenFontManager: () => void;
}

interface ExplorerTab {
  id: string;
  folderId: string;
}

const SIDEBAR_LOCATIONS = [
  { id: 'this-pc', label: 'This PC (All Drives)', icon: Monitor },
  { id: 'recent', label: 'Recent Files', icon: Clock },
  { id: 'home', label: 'Quick Access', icon: Star },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'pictures', label: 'Pictures', icon: Image },
  { id: 'videos', label: 'Videos', icon: Film },
];

function FileKindIcon({ kind }: { kind: FsNode['kind'] }) {
  switch (kind) {
    case 'folder':
      return <Folder className="h-4 w-4 text-amber-500" />;
    case 'exe':
    case 'msi':
      return <Play className="h-4 w-4 text-sky-500" />;
    case 'deb':
      return <Package className="h-4 w-4 text-rose-500" />;
    case 'appimage':
      return <Box className="h-4 w-4 text-emerald-500" />;
    case 'font':
      return <Type className="h-4 w-4 text-pink-500" />;
    case 'zip':
      return <Archive className="h-4 w-4 text-indigo-500" />;
    case 'image':
      return <Image className="h-4 w-4 text-emerald-500" />;
    case 'video':
      return <Film className="h-4 w-4 text-purple-500" />;
    case 'code':
      return <FileCode className="h-4 w-4 text-sky-400" />;
    default:
      return <FileText className="h-4 w-4 text-slate-400" />;
  }
}

function mapKindToInstallerFormat(kind: FsNode['kind']): ExeInstallRequest['format'] {
  if (kind === 'msi') return 'MSI';
  if (kind === 'deb') return 'Debian (.deb)';
  if (kind === 'appimage') return 'AppImage';
  return 'EXE';
}

export function FileManagerApp({
  nodes,
  volumes,
  initialFolderId = 'this-pc',
  activePrefixCount,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onDeleteNodes,
  onMoveNode,
  onExtractZip,
  onLaunchExeInstaller,
  onBulkInstallFonts,
  onImportFiles,
  onMountVolume,
  onOpenFontManager,
}: FileManagerAppProps) {
  const [tabs, setTabs] = useState<ExplorerTab[]>([
    { id: 'tab-1', folderId: initialFolderId },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [attachingDrive, setAttachingDrive] = useState(false);
  const [newDriveLabel, setNewDriveLabel] = useState('Media Disk');
  const [newDriveFs, setNewDriveFs] = useState<StorageVolume['filesystem']>('NTFS');
  const [newDriveGb, setNewDriveGb] = useState(500);
  const [fileContextMenu, setFileContextMenu] = useState<{
    x: number;
    y: number;
    node: FsNode;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigate active tab when external action opens a specific folder (e.g., Pictures from Snip Tool)
  useEffect(() => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, folderId: initialFolderId } : t
      )
    );
    setSelectedIds([]);
  }, [initialFolderId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const currentFolderId = activeTab.folderId;

  const navigateTab = (folderId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, folderId } : t))
    );
    setSelectedIds([]);
    setSearchQuery('');
    setFileContextMenu(null);
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs((prev) => [...prev, { id, folderId: 'home' }]);
    setActiveTabId(id);
    setSelectedIds([]);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const next = tabs.filter((t) => t.id !== tabId);
    setTabs(next);
    if (activeTabId === tabId) setActiveTabId(next[0].id);
  };

  const isThisPcView = currentFolderId === 'this-pc' && !searchQuery.trim();

  const visibleItems = useMemo(() => {
    if (searchQuery.trim()) return searchFiles(nodes, searchQuery);
    if (currentFolderId === 'this-pc') return [];
    if (currentFolderId === 'recent') return getRecentFiles(nodes, 12);
    return getChildren(nodes, currentFolderId);
  }, [nodes, currentFolderId, searchQuery]);

  const breadcrumbs = useMemo(() => {
    if (currentFolderId === 'recent' || currentFolderId === 'this-pc') return [];
    return getBreadcrumbs(nodes, currentFolderId);
  }, [nodes, currentFolderId]);

  const selectedNodes = useMemo(
    () => nodes.filter((n) => selectedIds.includes(n.id)),
    [nodes, selectedIds]
  );

  const primarySelectedNode =
    selectedNodes.length === 1
      ? selectedNodes[0]
      : selectedNodes[selectedNodes.length - 1] ?? null;

  const visibleFontNodes = useMemo(
    () => visibleItems.filter((n) => n.kind === 'font'),
    [visibleItems]
  );

  const selectedFontNodes = useMemo(
    () => selectedNodes.filter((n) => n.kind === 'font'),
    [selectedNodes]
  );

  const allVisibleSelected =
    visibleItems.length > 0 &&
    visibleItems.every((item) => selectedIds.includes(item.id));

  const getTabTitle = (folderId: string) => {
    if (folderId === 'this-pc') return 'This PC';
    if (folderId === 'recent') return 'Recent Files';
    return nodes.find((n) => n.id === folderId)?.name ?? 'Files';
  };

  const triggerInstallFonts = (fontNodes: FsNode[]) => {
    if (fontNodes.length === 0) return;
    const payload = fontNodes.map((n) => ({
      fileName: n.name,
      ...parseFontFamilyFromFilename(n.name),
    }));
    const count = onBulkInstallFonts(payload);
    setBannerMsg(
      `Installed ${count} font${count === 1 ? '' : 's'} to Linux & synced to ${activePrefixCount} Adobe Wine prefix${activePrefixCount === 1 ? '' : 'es'}!`
    );
    setFileContextMenu(null);
  };

  const handleOpenNode = (node: FsNode) => {
    setFileContextMenu(null);
    if (node.kind === 'folder') {
      navigateTab(node.id);
      return;
    }
    if (isInstallablePackageKind(node.kind)) {
      onLaunchExeInstaller({
        fileName: node.name,
        filePath: `~/Downloads/${node.name}`,
        format: mapKindToInstallerFormat(node.kind),
        sizeBytes: node.sizeBytes,
        suggestedAppId: node.adobeHint,
      });
      return;
    }
    if (node.kind === 'font') {
      triggerInstallFonts([node]);
      return;
    }
    if (node.kind === 'zip') {
      onExtractZip(node.id);
      setBannerMsg(`Extracted "${node.name}" into current folder.`);
    }
  };

  const toggleRowCheckbox = (nodeId: string) => {
    setSelectedIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleRowClick = (e: React.MouseEvent, node: FsNode) => {
    setFileContextMenu(null);
    if (e.ctrlKey || e.metaKey) {
      toggleRowCheckbox(node.id);
      return;
    }
    setSelectedIds([node.id]);
  };

  const handleRowContextMenu = (e: React.MouseEvent, node: FsNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.includes(node.id)) {
      setSelectedIds([node.id]);
    }
    setFileContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 260),
      y: Math.min(e.clientY, window.innerHeight - 240),
      node,
    });
  };

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleItems.map((i) => i.id));
    }
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const targetFolder = currentFolderId === 'recent' ? 'downloads' : currentFolderId;
    const mapped = picked.map((f) => {
      const kind = classifyUploadedFile(f.name);
      return {
        name: f.name,
        kind,
        sizeBytes: f.size || 240_000,
        content:
          kind === 'font'
            ? `Imported Font (${f.name}) · Ready for 1-click bulk install to Linux & Adobe Wine prefixes.`
            : isInstallablePackageKind(kind)
              ? `Imported Installer (${f.name}) · Double-click for 1-Click Express Setup.`
              : `Imported file (${f.name}) · ${formatBytes(f.size || 0)}`,
      };
    });
    onImportFiles(targetFolder, mapped);
    setBannerMsg(
      `Added ${mapped.length} file${mapped.length === 1 ? '' : 's'} to ${getTabTitle(targetFolder)}.`
    );
    e.target.value = '';
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFolderId === 'recent') return;
    onCreateFolder(currentFolderId, newFolderName || 'New Folder');
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && renameValue.trim()) {
      onRenameNode(renamingId, renameValue);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div
      onClick={() => setFileContextMenu(null)}
      className="relative flex h-full flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100"
    >
      {/* Multi-Tab Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-100/80 px-3 pt-2 dark:border-slate-800 dark:bg-slate-900/70">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <div
              key={tab.id}
              className={`flex max-w-[180px] items-center gap-2 rounded-t-lg border-x border-t px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'border-slate-200 bg-white font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
                  : 'border-transparent text-slate-600 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800/70'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className="truncate text-left"
              >
                {getTabTitle(tab.folderId)}
              </button>
              {tabs.length > 1 && (
                <button
                  type="button"
                  aria-label={`Close ${getTabTitle(tab.folderId)} tab`}
                  onClick={() => closeTab(tab.id)}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addTab}
          aria-label="Open new file manager tab"
          className="mb-1 flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Address Breadcrumbs & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex min-w-0 items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => navigateTab('this-pc')}
            aria-label="Go to This PC drives overview"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          {currentFolderId === 'this-pc' ? (
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              This PC · All Storage Volumes ({volumes.length})
            </span>
          ) : currentFolderId === 'recent' ? (
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Recent Files
            </span>
          ) : (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => navigateTab(crumb.id)}
                  className={`rounded px-1.5 py-0.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    idx === breadcrumbs.length - 1
                      ? 'font-semibold text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileImportChange}
            className="hidden"
            aria-label="Import local files into File Manager"
          />
          {!isThisPcView && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Add Files</span>
            </button>
          )}

          {currentFolderId !== 'recent' && !isThisPcView && (
            <button
              type="button"
              onClick={() => setCreatingFolder(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>New Folder</span>
            </button>
          )}

          <label className="relative">
            <span className="sr-only">Search files</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-40 rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </div>
      </div>

      {/* Zero-Terminal Action Feedback Banner */}
      {bannerMsg && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{bannerMsg}</span>
          </div>
          <div className="flex items-center gap-3">
            {bannerMsg.toLowerCase().includes('font') && (
              <button
                type="button"
                onClick={onOpenFontManager}
                className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
              >
                Open Font Manager
              </button>
            )}
            <button
              type="button"
              onClick={() => setBannerMsg(null)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Windows-Simple Smart Folder / Multi-Select Action Strip */}
      {(visibleFontNodes.length > 0 || selectedIds.length > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-sky-500/8 px-4 py-2 text-xs dark:border-slate-800 dark:bg-sky-500/10">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {allVisibleSelected ? (
                <CheckSquare className="h-3.5 w-3.5 text-sky-500" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              <span>{allVisibleSelected ? 'Clear Selection' : 'Select All'}</span>
            </button>

            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              {selectedIds.length > 0
                ? `${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'} selected`
                : `${visibleFontNodes.length} font file${visibleFontNodes.length === 1 ? '' : 's'} ready for 1-click bulk install`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(selectedFontNodes.length > 0 || visibleFontNodes.length > 0) && (
              <button
                type="button"
                onClick={() =>
                  triggerInstallFonts(
                    selectedFontNodes.length > 0 ? selectedFontNodes : visibleFontNodes
                  )
                }
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
              >
                <Type className="h-3.5 w-3.5" />
                <span>
                  {selectedFontNodes.length > 0
                    ? `Install Selected Fonts (${selectedFontNodes.length})`
                    : `Install All ${visibleFontNodes.length} Fonts (Linux + Adobe)`}
                </span>
              </button>
            )}

            {selectedIds.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  onDeleteNodes(selectedIds);
                  setSelectedIds([]);
                }}
                className="flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50 whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Split: Sidebar + File List + Preview */}
      <div className="grid min-h-0 flex-1 grid-cols-12">
        {/* Sidebar */}
        <aside className="col-span-3 overflow-y-auto border-r border-slate-200 bg-slate-100/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="space-y-0.5">
            {SIDEBAR_LOCATIONS.map((loc) => {
              const Icon = loc.icon;
              const active = currentFolderId === loc.id && !searchQuery;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => navigateTab(loc.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedId && loc.id !== 'recent') {
                      onMoveNode(draggedId, loc.id);
                      setDraggedId(null);
                    }
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    active
                      ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                      : 'text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{loc.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-3 dark:border-slate-800">
            <div className="mb-1.5 flex items-center justify-between px-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>This PC · Drives</span>
              <span className="font-mono tabular-nums">{volumes.length}</span>
            </div>
            <div className="space-y-0.5">
              {volumes.map((vol) => {
                const Icon =
                  vol.kind === 'network'
                    ? Network
                    : vol.kind === 'external-usb'
                      ? Usb
                      : HardDrive;
                const active = currentFolderId === vol.id && !searchQuery;
                return (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => navigateTab(vol.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedId) {
                        onMoveNode(draggedId, vol.id);
                        setDraggedId(null);
                      }
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                      active
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                        : 'text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{vol.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      ({vol.letter})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {isThisPcView ? (
          <div className="col-span-9 min-h-0 overflow-y-auto p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  This PC — Devices and Drives ({volumes.length})
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Every internal SSD/HDD partition (NTFS R/W, ext4, exFAT) and USB drive auto-mounts with Windows-style drive letters (C:, D:, E:, F:...).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachingDrive((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Attach / Detect Volume</span>
              </button>
            </div>

            {attachingDrive && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onMountVolume({
                    label: newDriveLabel,
                    filesystem: newDriveFs,
                    kind: newDriveFs === 'exFAT' ? 'external-usb' : 'local-disk',
                    totalGb: newDriveGb,
                    usedGb: Math.round(newDriveGb * 0.22),
                  });
                  setAttachingDrive(false);
                  setBannerMsg(
                    `Auto-mounted "${newDriveLabel}" (${newDriveFs} Read/Write) into This PC.`
                  );
                }}
                className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-sky-500/40 bg-sky-500/8 p-4"
              >
                <label className="min-w-[150px] flex-1">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Volume Label
                  </span>
                  <input
                    type="text"
                    value={newDriveLabel}
                    onChange={(e) => setNewDriveLabel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </label>
                <label>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Filesystem
                  </span>
                  <select
                    value={newDriveFs}
                    onChange={(e) =>
                      setNewDriveFs(e.target.value as StorageVolume['filesystem'])
                    }
                    className="mt-1 block rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="NTFS">NTFS (Windows R/W)</option>
                    <option value="exFAT">exFAT (USB Drive)</option>
                    <option value="ext4">ext4 (Linux SSD)</option>
                    <option value="Btrfs">Btrfs</option>
                  </select>
                </label>
                <label>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Size (GB)
                  </span>
                  <select
                    value={newDriveGb}
                    onChange={(e) => setNewDriveGb(Number(e.target.value))}
                    className="mt-1 block rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value={128}>128 GB</option>
                    <option value={256}>256 GB</option>
                    <option value={500}>500 GB</option>
                    <option value={1000}>1 TB (1000 GB)</option>
                    <option value={2000}>2 TB (2000 GB)</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                >
                  Mount Drive
                </button>
              </form>
            )}

            <div className="space-y-5">
              {[
                {
                  title: 'Local & Internal Disk Volumes',
                  items: volumes.filter(
                    (v) => v.kind === 'os-drive' || v.kind === 'local-disk'
                  ),
                },
                {
                  title: 'External USB & Network Drives',
                  items: volumes.filter(
                    (v) => v.kind === 'external-usb' || v.kind === 'network'
                  ),
                },
              ].map((group) => (
                <div key={group.title}>
                  <div className="mb-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {group.title} ({group.items.length})
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.items.map((vol) => {
                      const freeGb = computeVolumeFreeGb(vol);
                      const usedPct = computeVolumeUsedPercent(vol);
                      const Icon =
                        vol.kind === 'network'
                          ? Network
                          : vol.kind === 'external-usb'
                            ? Usb
                            : HardDrive;
                      return (
                        <button
                          key={vol.id}
                          type="button"
                          onClick={() => navigateTab(vol.id)}
                          className="group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-sky-500/70 hover:bg-sky-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/60 dark:hover:bg-slate-900/90"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 dark:text-sky-400">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                {vol.label} ({vol.letter})
                              </span>
                              <span className="shrink-0 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                {vol.filesystem} {vol.readWrite ? 'R/W' : 'RO'}
                              </span>
                            </div>

                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className={`h-full transition-all ${
                                  usedPct >= 85 ? 'bg-rose-500' : 'bg-sky-500'
                                }`}
                                style={{ width: `${usedPct}%` }}
                              />
                            </div>

                            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                              <span>
                                {freeGb} GB free of {vol.totalGb} GB
                              </span>
                              <span className="truncate font-mono text-[10px]">
                                {vol.devicePath}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <>
        {/* Center File List */}
        <div className="col-span-5 flex min-h-0 flex-col border-r border-slate-200 dark:border-slate-800">
          {/* Quick select header */}
          {visibleItems.length > 0 && (
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleToggleSelectAll}
                  aria-label="Select all items in folder"
                  className="h-3.5 w-3.5 rounded accent-sky-600"
                />
                <span>Name ({visibleItems.length})</span>
              </label>
              <span>Double-click to open / install</span>
            </div>
          )}

          {creatingFolder && (
            <form
              onSubmit={handleCreateFolderSubmit}
              className="flex items-center gap-2 border-b border-slate-200 bg-sky-50/70 px-3 py-2 dark:border-slate-800 dark:bg-sky-950/30"
            >
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-500"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setCreatingFolder(false)}
                className="rounded px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800/70">
            {visibleItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                This folder is empty. Click &quot;Add Files&quot; above to drop fonts or installers.
              </div>
            ) : (
              visibleItems.map((node) => {
                const selected = selectedIds.includes(node.id);
                return (
                  <div
                    key={node.id}
                    draggable
                    onDragStart={() => setDraggedId(node.id)}
                    onDragOver={(e) => {
                      if (node.kind === 'folder') e.preventDefault();
                    }}
                    onDrop={() => {
                      if (draggedId && node.kind === 'folder' && draggedId !== node.id) {
                        onMoveNode(draggedId, node.id);
                        setDraggedId(null);
                      }
                    }}
                    onContextMenu={(e) => handleRowContextMenu(e, node)}
                    className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
                      selected
                        ? 'bg-sky-500/12 dark:bg-sky-500/15'
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleRowCheckbox(node.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${node.name}`}
                      className="h-3.5 w-3.5 shrink-0 rounded accent-sky-600"
                    />

                    {renamingId === node.id ? (
                      <form onSubmit={handleRenameSubmit} className="flex flex-1 items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 rounded border border-sky-500 bg-white px-2 py-1 text-xs text-slate-900 dark:bg-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="rounded bg-sky-600 px-2 py-1 text-[11px] font-medium text-white"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleRowClick(e, node)}
                        onDoubleClick={() => handleOpenNode(node)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <FileKindIcon kind={node.kind} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                            {node.name}
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                            {node.modifiedAt} · {formatBytes(node.sizeBytes)}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right File Preview & Action Pane */}
        <div className="col-span-4 flex min-h-0 flex-col overflow-y-auto p-4">
          {selectedNodes.length > 1 ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedNodes.length} Items Selected
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {selectedFontNodes.length > 0
                    ? `${selectedFontNodes.length} font file${selectedFontNodes.length === 1 ? '' : 's'} ready for bulk installation — just like Windows Explorer.`
                    : 'Choose a bulk action for the selected files.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedFontNodes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => triggerInstallFonts(selectedFontNodes)}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500"
                  >
                    <Type className="h-3.5 w-3.5" />
                    <span>Install All {selectedFontNodes.length} Fonts</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onDeleteNodes(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Selected</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Selected Files
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {selectedNodes.map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{n.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-slate-400">
                        {formatBytes(n.sizeBytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : !primarySelectedNode ? (
            <div className="my-auto space-y-2 text-center text-xs text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Windows-Simple Zero-Terminal File Manager
              </p>
              <p>
                Double-click any <span className="font-mono">.exe</span>, <span className="font-mono">.msi</span>, <span className="font-mono">.deb</span>, or <span className="font-mono">.AppImage</span> for 1-click install, or select multiple <span className="font-mono">.ttf</span> / <span className="font-mono">.otf</span> fonts to install all at once.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800">
                  <FileKindIcon kind={primarySelectedNode.kind} />
                </div>
                <div className="min-w-0">
                  <h3 className="break-all font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {primarySelectedNode.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    {primarySelectedNode.kind.toUpperCase()} · {formatBytes(primarySelectedNode.sizeBytes)} · {primarySelectedNode.modifiedAt}
                  </p>
                </div>
              </div>

              {/* Context Actions */}
              <div className="flex flex-wrap gap-2">
                {primarySelectedNode.kind === 'folder' && (
                  <button
                    type="button"
                    onClick={() => navigateTab(primarySelectedNode.id)}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
                  >
                    Open Folder
                  </button>
                )}

                {isInstallablePackageKind(primarySelectedNode.kind) && (
                  <button
                    type="button"
                    onClick={() => handleOpenNode(primarySelectedNode)}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>1-Click Express Install</span>
                  </button>
                )}

                {primarySelectedNode.kind === 'font' && (
                  <button
                    type="button"
                    onClick={() => triggerInstallFonts([primarySelectedNode])}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                  >
                    <Type className="h-3.5 w-3.5" />
                    <span>Install Font (Linux + Adobe)</span>
                  </button>
                )}

                {primarySelectedNode.kind === 'zip' && (
                  <button
                    type="button"
                    onClick={() => handleOpenNode(primarySelectedNode)}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>Extract Archive Here</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setRenamingId(primarySelectedNode.id);
                    setRenameValue(primarySelectedNode.name);
                  }}
                  aria-label={`Rename ${primarySelectedNode.name}`}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Rename</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteNode(primarySelectedNode.id);
                    setSelectedIds([]);
                  }}
                  aria-label={`Delete ${primarySelectedNode.name}`}
                  className="flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Live Font Specimen Preview */}
              {primarySelectedNode.kind === 'font' && (
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Font Specimen Preview
                  </div>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    Aa Bb Cc · 0123456789
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              )}

              {/* File Preview Content */}
              {primarySelectedNode.content && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Preview
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    {primarySelectedNode.content}
                  </pre>
                </div>
              )}

              {primarySelectedNode.kind === 'zip' && primarySelectedNode.archiveEntries && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Archive Contents ({primarySelectedNode.archiveEntries.length})
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {primarySelectedNode.archiveEntries.map((entry) => (
                      <li key={entry.name} className="flex items-center justify-between gap-2">
                        <span className="truncate">{entry.name}</span>
                        <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                          {formatBytes(entry.sizeBytes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* Windows-Style File Right-Click Context Menu */}
      {fileContextMenu && (
        <div
          role="menu"
          aria-label="File Context Menu"
          style={{ left: `${fileContextMenu.x}px`, top: `${fileContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
          className="acrylic-panel fixed z-[82] w-60 rounded-xl border border-slate-300/80 bg-white/95 p-1.5 text-xs text-slate-900 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100"
        >
          {selectedFontNodes.length > 0 && (
            <button
              type="button"
              onClick={() => triggerInstallFonts(selectedFontNodes)}
              className="flex w-full items-center gap-2 rounded-lg bg-sky-600/12 px-2.5 py-2 text-left font-semibold text-sky-700 hover:bg-sky-600/20 dark:text-sky-300"
            >
              <Type className="h-3.5 w-3.5 shrink-0" />
              <span>
                Install {selectedFontNodes.length > 1 ? `All ${selectedFontNodes.length} Fonts` : 'Font'} (Linux + Adobe)
              </span>
            </button>
          )}

          {isInstallablePackageKind(fileContextMenu.node.kind) && (
            <button
              type="button"
              onClick={() => handleOpenNode(fileContextMenu.node)}
              className="flex w-full items-center gap-2 rounded-lg bg-sky-600/12 px-2.5 py-2 text-left font-semibold text-sky-700 hover:bg-sky-600/20 dark:text-sky-300"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>1-Click Express Install</span>
            </button>
          )}

          {fileContextMenu.node.kind === 'zip' && (
            <button
              type="button"
              onClick={() => handleOpenNode(fileContextMenu.node)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Archive className="h-3.5 w-3.5 shrink-0" />
              <span>Extract Here</span>
            </button>
          )}

          {fileContextMenu.node.kind === 'folder' && (
            <button
              type="button"
              onClick={() => handleOpenNode(fileContextMenu.node)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
            >
              <Folder className="h-3.5 w-3.5 shrink-0" />
              <span>Open Folder</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setRenamingId(fileContextMenu.node.id);
              setRenameValue(fileContextMenu.node.name);
              setFileContextMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-slate-200/75 dark:hover:bg-slate-800"
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" />
            <span>Rename</span>
          </button>

          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

          <button
            type="button"
            onClick={() => {
              onDeleteNodes(selectedIds.length > 0 ? selectedIds : [fileContextMenu.node.id]);
              setSelectedIds([]);
              setFileContextMenu(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              Delete {selectedIds.length > 1 ? `(${selectedIds.length} items)` : ''}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
