import React, { useMemo, useState } from 'react';
import {
  Archive,
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
  Network,
  Pencil,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  formatBytes,
  getBreadcrumbs,
  getChildren,
  getRecentFiles,
  searchFiles,
} from '../../os/fileSystem';
import type { ExeInstallRequest, FsNode } from '../../os/types';

interface FileManagerAppProps {
  nodes: FsNode[];
  initialFolderId?: string;
  onCreateFolder: (parentId: string, name: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, targetFolderId: string) => void;
  onExtractZip: (zipNodeId: string) => void;
  onLaunchExeInstaller: (req: ExeInstallRequest) => void;
}

interface ExplorerTab {
  id: string;
  folderId: string; // 'recent' is a virtual view
}

const SIDEBAR_LOCATIONS = [
  { id: 'recent', label: 'Recent Files', icon: Clock },
  { id: 'home', label: 'Quick Access', icon: Star },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'pictures', label: 'Pictures', icon: Image },
  { id: 'videos', label: 'Videos', icon: Film },
];

const EXTERNAL_LOCATIONS = [
  { id: 'ntfs-drive', label: 'Windows_Data (NTFS)', icon: HardDrive },
  { id: 'smb-nas', label: 'NAS Studio (SMB)', icon: Network },
];

function FileKindIcon({ kind }: { kind: FsNode['kind'] }) {
  switch (kind) {
    case 'folder':
      return <Folder className="h-4 w-4 text-amber-500" />;
    case 'exe':
    case 'msi':
      return <Play className="h-4 w-4 text-sky-500" />;
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

export function FileManagerApp({
  nodes,
  initialFolderId = 'downloads',
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onMoveNode,
  onExtractZip,
  onLaunchExeInstaller,
}: FileManagerAppProps) {
  const [tabs, setTabs] = useState<ExplorerTab[]>([
    { id: 'tab-1', folderId: initialFolderId },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const currentFolderId = activeTab.folderId;

  const navigateTab = (folderId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab.id ? { ...t, folderId } : t))
    );
    setSelectedId(null);
    setSearchQuery('');
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs((prev) => [...prev, { id, folderId: 'home' }]);
    setActiveTabId(id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const next = tabs.filter((t) => t.id !== tabId);
    setTabs(next);
    if (activeTabId === tabId) setActiveTabId(next[0].id);
  };

  const visibleItems = useMemo(() => {
    if (searchQuery.trim()) return searchFiles(nodes, searchQuery);
    if (currentFolderId === 'recent') return getRecentFiles(nodes, 12);
    return getChildren(nodes, currentFolderId);
  }, [nodes, currentFolderId, searchQuery]);

  const breadcrumbs = useMemo(() => {
    if (currentFolderId === 'recent') return [];
    return getBreadcrumbs(nodes, currentFolderId);
  }, [nodes, currentFolderId]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  const getTabTitle = (folderId: string) => {
    if (folderId === 'recent') return 'Recent Files';
    return nodes.find((n) => n.id === folderId)?.name ?? 'Files';
  };

  const handleOpenNode = (node: FsNode) => {
    if (node.kind === 'folder') {
      navigateTab(node.id);
      return;
    }
    if (node.kind === 'exe' || node.kind === 'msi') {
      onLaunchExeInstaller({
        fileName: node.name,
        filePath: `~/Downloads/${node.name}`,
        format: node.kind === 'exe' ? 'EXE' : 'MSI',
        suggestedAppId: node.adobeHint,
      });
    }
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
    <div className="flex h-full flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
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
            onClick={() => navigateTab('home')}
            aria-label="Go to Home directory"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          {currentFolderId === 'recent' ? (
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

        <div className="flex items-center gap-2">
          {currentFolderId !== 'recent' && (
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
              className="w-44 rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </div>
      </div>

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
            <div className="mb-1.5 px-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Drives & Network
            </div>
            <div className="space-y-0.5">
              {EXTERNAL_LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                const active = currentFolderId === loc.id && !searchQuery;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => navigateTab(loc.id)}
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
          </div>
        </aside>

        {/* Center File List */}
        <div className="col-span-5 flex min-h-0 flex-col border-r border-slate-200 dark:border-slate-800">
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
                This folder is empty.
              </div>
            ) : (
              visibleItems.map((node) => {
                const selected = node.id === selectedId;
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
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 transition-colors ${
                      selected
                        ? 'bg-sky-500/12 dark:bg-sky-500/15'
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/70'
                    }`}
                  >
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
                        onClick={() => setSelectedId(node.id)}
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
          {!selectedNode ? (
            <div className="my-auto text-center text-xs text-slate-500 dark:text-slate-400">
              Select a file to inspect metadata, preview contents, extract ZIP archives, or launch `.exe`/`.msi` installers with Wine.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800">
                  <FileKindIcon kind={selectedNode.kind} />
                </div>
                <div className="min-w-0">
                  <h3 className="break-all font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedNode.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                    {selectedNode.kind.toUpperCase()} · {formatBytes(selectedNode.sizeBytes)} · {selectedNode.modifiedAt}
                  </p>
                </div>
              </div>

              {/* Context Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedNode.kind === 'folder' && (
                  <button
                    type="button"
                    onClick={() => navigateTab(selectedNode.id)}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
                  >
                    Open Folder
                  </button>
                )}

                {(selectedNode.kind === 'exe' || selectedNode.kind === 'msi') && (
                  <button
                    type="button"
                    onClick={() => handleOpenNode(selectedNode)}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Open with Wine Installer</span>
                  </button>
                )}

                {selectedNode.kind === 'zip' && (
                  <button
                    type="button"
                    onClick={() => onExtractZip(selectedNode.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>Extract Archive Here</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setRenamingId(selectedNode.id);
                    setRenameValue(selectedNode.name);
                  }}
                  aria-label={`Rename ${selectedNode.name}`}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Rename</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDeleteNode(selectedNode.id);
                    setSelectedId(null);
                  }}
                  aria-label={`Delete ${selectedNode.name}`}
                  className="flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              {/* File Preview Content */}
              {selectedNode.content && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Preview
                  </div>
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedNode.content}
                  </pre>
                </div>
              )}

              {selectedNode.kind === 'zip' && selectedNode.archiveEntries && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Archive Contents ({selectedNode.archiveEntries.length})
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {selectedNode.archiveEntries.map((entry) => (
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
      </div>
    </div>
  );
}
