import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  FolderArchive,
  GitBranch,
  Terminal,
} from 'lucide-react';
import {
  OS_SOURCE_ARTIFACTS,
  buildSelfExtractingBundleScript,
  type OsSourceArtifact,
} from '../../os/sourceBundle';

const CATEGORIES: ('All' | OsSourceArtifact['category'])[] = [
  'All',
  'Architecture',
  'ISO Build & Boot',
  'Qt 6 / QML Desktop',
  'Adobe Manager',
  'Installer & Security',
  'Testing & Docs',
];

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface OsStudioAppProps {
  onCopyToClipboard?: (text: string, source: string) => void;
}

export function OsStudioApp({ onCopyToClipboard }: OsStudioAppProps) {
  const [category, setCategory] = useState<'All' | OsSourceArtifact['category']>('All');
  const [selectedId, setSelectedId] = useState<string>(OS_SOURCE_ARTIFACTS[1].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleArtifacts = useMemo(() => {
    if (category === 'All') return OS_SOURCE_ARTIFACTS;
    return OS_SOURCE_ARTIFACTS.filter((a) => a.category === category);
  }, [category]);

  const activeArtifact =
    OS_SOURCE_ARTIFACTS.find((a) => a.id === selectedId) ?? OS_SOURCE_ARTIFACTS[0];

  const handleCopy = async () => {
    onCopyToClipboard?.(
      activeArtifact.content.split('\n').slice(0, 4).join('\n'),
      `OS Build Studio (${activeArtifact.fileName})`
    );
    try {
      await navigator.clipboard.writeText(activeArtifact.content);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
    setCopiedId(activeArtifact.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadBundle = () => {
    const script = buildSelfExtractingBundleScript();
    triggerDownload('aetheros-1.0-lts-source-bundle.sh', script);
  };

  const handleDownloadGithubWorkflow = () => {
    const workflow = OS_SOURCE_ARTIFACTS.find((a) => a.id === 'github-actions-iso');
    if (!workflow) return;
    setSelectedId(workflow.id);
    triggerDownload('build-aetheros-iso.yml', workflow.content);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950/60 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            OS Architecture &amp; ISO Build Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Debian Stable Minimal source tree (/os-src/) · Automatic GitHub Actions Cloud ISO Builder · GRUB2 · QEMU
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadGithubWorkflow}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <GitBranch className="h-3.5 w-3.5 text-emerald-500" />
            <span>GitHub Action ISO (.yml)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBundle}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap"
          >
            <FolderArchive className="h-3.5 w-3.5" />
            <span>Download Build Bundle (.sh)</span>
          </button>
        </div>
      </div>

      {/* Honest Host & GitHub Cloud Build Note */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-white/75 px-5 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <Terminal className="h-4 w-4 shrink-0 text-sky-500" />
        <span>
          <strong className="font-semibold text-slate-900 dark:text-white">Auto GitHub ISO Build:</strong> Push to GitHub and click{' '}
          <code className="font-mono text-emerald-600 dark:text-emerald-400">
            Actions → Build AetherOS Bootable ISO → Run workflow
          </code>{' '}
          to auto-publish the bootable <code className="font-mono">.iso</code> to Releases — or build locally via{' '}
          <code className="font-mono text-sky-700 dark:text-sky-300">
            sudo ./build-iso.sh
          </code>
          .
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/80 px-5 py-2 dark:border-slate-800">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              category === cat
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Split Explorer & Code Viewer */}
      <div className="grid min-h-0 flex-1 grid-cols-12">
        <div className="col-span-4 overflow-y-auto border-r border-slate-200 bg-slate-100/50 divide-y divide-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40 dark:divide-slate-800/80">
          {visibleArtifacts.map((art) => {
            const active = art.id === activeArtifact.id;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => setSelectedId(art.id)}
                className={`w-full px-3.5 py-3 text-left transition-colors ${
                  active
                    ? 'bg-sky-500/15 text-slate-950 dark:text-white'
                    : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span className="truncate font-mono text-xs font-semibold">
                    {art.fileName}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {art.path}
                </div>
              </button>
            );
          })}
        </div>

        <div className="col-span-8 flex min-h-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="min-w-0">
              <div className="truncate font-mono text-xs font-semibold text-slate-900 dark:text-white">
                {activeArtifact.path}
              </div>
              <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {activeArtifact.summary}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {copiedId === activeArtifact.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => triggerDownload(activeArtifact.fileName, activeArtifact.content)}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <pre className="min-h-0 flex-1 overflow-auto bg-[#0b101b] p-4 font-mono text-xs leading-relaxed text-slate-200">
            <code>{activeArtifact.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
