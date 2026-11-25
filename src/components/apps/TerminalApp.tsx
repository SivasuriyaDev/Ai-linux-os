import React, { useEffect, useRef, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { executeTerminalCommand, type TerminalContext } from '../../os/terminalEngine';

interface TerminalAppProps {
  context: TerminalContext;
  onCopyToClipboard: (text: string, source: string) => void;
}

interface LogEntry {
  id: string;
  command?: string;
  output: string;
}

const QUICK_COMMANDS = [
  'aetherfetch',
  'vulkaninfo',
  'prefix list',
  'free -h',
  'systemctl',
  'nft list ruleset',
  'ls downloads',
];

export function TerminalApp({ context, onCopyToClipboard }: TerminalAppProps) {
  const [entries, setEntries] = useState<LogEntry[]>(() => [
    {
      id: 'welcome',
      output:
        'AetherOS 1.0 LTS (Debian 12 Bookworm Minimal · Linux 6.12 LTS)\nType "help" for available commands, or click a diagnostic shortcut above.',
    },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const res = executeTerminalCommand(cmd, context);
    setHistory((prev) => [cmd, ...prev].slice(0, 30));
    setHistoryIdx(-1);

    if (res.clear) {
      setEntries([]);
    } else {
      setEntries((prev) => [
        ...prev,
        { id: `cmd-${Date.now()}-${Math.random()}`, command: cmd, output: res.output },
      ]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIdx - 1;
      if (nextIdx < 0) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    }
  };

  const lastOutput = entries[entries.length - 1]?.output ?? '';

  return (
    <div className="flex h-full flex-col bg-[#090d16] text-slate-200">
      {/* Quick Command Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-[#0d1320] px-4 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => runCommand(cmd)}
              className="rounded-md border border-slate-700/80 bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-sky-300 transition-colors hover:border-sky-500/60 hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!lastOutput}
            onClick={() => onCopyToClipboard(lastOutput, 'Aether Terminal')}
            className="flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <Copy className="h-3 w-3" />
            <span>Copy Last Output</span>
          </button>
          <button
            type="button"
            onClick={() => setEntries([])}
            aria-label="Clear terminal output"
            className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Scrollback Log */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        {entries.map((entry) => (
          <div key={entry.id} className="mb-3">
            {entry.command && (
              <div className="flex items-center gap-2 text-emerald-400">
                <span>aether-studio@aetheros:~$</span>
                <span className="text-white">{entry.command}</span>
              </div>
            )}
            <pre className="mt-1 whitespace-pre-wrap break-words text-slate-300">
              {entry.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Prompt Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(input);
        }}
        className="flex items-center gap-2 border-t border-slate-800 bg-[#0d1320] px-4 py-2.5 font-mono text-xs"
      >
        <label htmlFor="aether-terminal-input" className="shrink-0 text-emerald-400">
          aether-studio@aetheros:~$
        </label>
        <input
          id="aether-terminal-input"
          type="text"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (e.g. aetherfetch, prefix list, help)..."
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-sky-600 px-3 py-1 font-sans text-xs font-medium text-white hover:bg-sky-500"
        >
          Run
        </button>
      </form>
    </div>
  );
}
