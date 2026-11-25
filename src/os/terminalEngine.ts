import type { FontEntry, FsNode, SystemSettingsState, WinePrefix } from './types';

export interface TerminalContext {
  settings: SystemSettingsState;
  prefixes: WinePrefix[];
  files: FsNode[];
  fonts: FontEntry[];
  ramUsedMb: number;
  activeServices: number;
}

export interface TerminalResult {
  output: string;
  clear?: boolean;
}

export function executeTerminalCommand(
  rawInput: string,
  ctx: TerminalContext
): TerminalResult {
  const trimmed = rawInput.trim();
  if (!trimmed) return { output: '' };

  const [cmd, ...args] = trimmed.split(/\s+/);
  const lower = cmd.toLowerCase();

  switch (lower) {
    case 'clear':
      return { output: '', clear: true };

    case 'help':
      return {
        output: [
          'AetherOS Shell (bash 5.2 · Debian 12 Bookworm Minimal)',
          'Available commands:',
          '  aetherfetch        Display OS, kernel, desktop, GPU, and RAM summary',
          '  uname -a           Print Linux LTS kernel information',
          '  free -h            Show system RAM and ZRAM swap usage',
          '  vulkaninfo         Inspect active Intel/AMD/NVIDIA Vulkan ICD',
          '  wine --version     Show Wine Staging / DXVK / VKD3D stack versions',
          '  prefix list        List isolated Adobe Wine prefixes and status',
          '  fonts list         Show installed fonts & Wine prefix sync counts',
          '  systemctl          Check active systemd units & Render Boost status',
          '  nft list ruleset   Show active nftables host firewall policy',
          '  ls [folder]        List files in Home, Downloads, Documents, Pictures, Videos',
          '  cat <filename>     Print file contents from virtual filesystem',
          '  whoami | date      Display active user or system clock',
          '  clear              Clear terminal buffer',
        ].join('\n'),
      };

    case 'whoami':
      return { output: 'aether-studio' };

    case 'date':
      return { output: new Date().toString() };

    case 'uname':
      return {
        output:
          'Linux aether-workstation 6.12.11-aether-lts #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
      };

    case 'aetherfetch':
    case 'neofetch':
      return {
        output: [
          '    ▄▄▄▄  ▄▄▄▄    aether-studio@aether-workstation',
          '    ████  ████    --------------------------------',
          '                  OS: AetherOS 1.0 LTS (Debian 12 Bookworm Minimal)',
          '    ████  ████    Kernel: Linux 6.12.11-lts x86_64 (Fsync enabled)',
          '    ▀▀▀▀  ▀▀▀▀    Shell: aether-shell (Qt 6.7 / QML Wayland)',
          `                  Display: ${ctx.settings.resolution} @ ${ctx.settings.refreshRate} (${ctx.settings.activeColorProfile})`,
          `                  GPU: ${ctx.settings.gpuVendor} Vulkan 1.3 · DXVK 2.4.1 · VKD3D 2.13`,
          `                  Memory: ${ctx.ramUsedMb} MiB / 16384 MiB (ZRAM ${ctx.settings.zramSwapPercent}%)`,
          `                  Services: ${ctx.activeServices} systemd units · Render Boost: ${ctx.settings.renderBoost ? 'ON' : 'OFF'}`,
          `                  Wine Prefixes: ${ctx.prefixes.length} isolated Adobe environments`,
        ].join('\n'),
      };

    case 'free':
      return {
        output: [
          '               total        used        free      shared  buff/cache   available',
          `Mem:           16Gi       ${(ctx.ramUsedMb / 1024).toFixed(2)}Gi      ${(14.8 - ctx.ramUsedMb / 1024).toFixed(2)}Gi       112Mi       1.1Gi      ${(15.6 - ctx.ramUsedMb / 1024).toFixed(2)}Gi`,
          `Swap (zram):    8.0Gi       0.0Gi       8.0Gi`,
        ].join('\n'),
      };

    case 'vulkaninfo': {
      const driver =
        ctx.settings.gpuVendor === 'NVIDIA'
          ? 'NVIDIA Proprietary 565.57.01 (NVDEC/NVENC ready)'
          : ctx.settings.gpuVendor === 'Intel'
            ? 'Mesa 24.2 ANV Vulkan (Intel QuickSync VA-API)'
            : 'Mesa 24.2 RADV Vulkan (AMD VCN VA-API)';
      return {
        output: [
          'Vulkan Instance Version: 1.3.289',
          `GPU0: ${ctx.settings.gpuVendor} Graphics Adapter`,
          `  driverName = ${driver}`,
          '  DXVK_ASYNC / Vulkan Pipeline Cache = Enabled',
          '  Wayland + XWayland Presentation = OK',
        ].join('\n'),
      };
    }

    case 'wine':
      return {
        output: [
          'wine-9.21 (Staging + Fsync + WoW64)',
          'DXVK: 2.4.1 (D3D9/10/11 -> Vulkan)',
          'VKD3D-Proton: 2.13 (D3D12 -> Vulkan)',
          'Bottles Runner: soda-9.0-1',
        ].join('\n'),
      };

    case 'prefix': {
      if (ctx.prefixes.length === 0) {
        return { output: 'No isolated Adobe Wine prefixes found. Create one in Adobe Compatibility Manager.' };
      }
      const rows = ctx.prefixes.map(
        (p) =>
          `[${p.status}] ${p.appName} ${p.version}\n  WINEPREFIX=${p.path}\n  Graphics=${p.graphicsLayer} | Runtimes=${p.installedRuntimes.join(',')}`
      );
      return { output: rows.join('\n\n') };
    }

    case 'fonts': {
      const rows = ctx.fonts.map(
        (f) =>
          `${f.installedLinux ? '[LINUX]' : '[-----]'} ${f.family.padEnd(32)} (${f.format}) · Synced to ${f.syncedWinePrefixes.length}/${ctx.prefixes.length} Wine prefixes`
      );
      return { output: rows.join('\n') };
    }

    case 'systemctl':
      return {
        output: [
          `Active systemd units: ${ctx.activeServices} (Render Boost: ${ctx.settings.renderBoost ? 'ACTIVE — background indexers paused' : 'NORMAL'})`,
          '  ● NetworkManager.service    active (running)',
          '  ● pipewire.service          active (running)',
          `  ● nftables.service          ${ctx.settings.firewallEnabled ? 'active (exited)' : 'inactive (stopped)'}`,
          `  ● apparmor.service          ${ctx.settings.appArmorWineSandbox ? 'active (exited)' : 'inactive'}`,
          `  ● fstrim.timer              ${ctx.settings.ssdTrimEnabled ? 'active (waiting)' : 'disabled'}`,
          '  ● zramswap.service          active (exited)',
        ].join('\n'),
      };

    case 'nft':
      return {
        output: ctx.settings.firewallEnabled
          ? [
              'table inet aether_filter {',
              '  chain input { type filter hook input priority 0; policy drop;',
              '    iifname "lo" accept',
              '    ct state established,related accept',
              '    udp dport 5353 accept',
              '  }',
              '}',
            ].join('\n')
          : 'nftables firewall is currently disabled in System Settings -> Privacy & Security.',
      };

    case 'ls': {
      const targetArg = (args[0] || 'home').toLowerCase().replace(/^~\//, '');
      const folderMap: Record<string, string> = {
        home: 'home',
        '~': 'home',
        downloads: 'downloads',
        documents: 'documents',
        pictures: 'pictures',
        videos: 'videos',
        ntfs: 'ntfs-drive',
        smb: 'smb-nas',
      };
      const folderId = folderMap[targetArg] ?? targetArg;
      const children = ctx.files.filter((f) => f.parentId === folderId);
      if (children.length === 0) {
        return { output: `ls: directory '${targetArg}' is empty or not found. Try: ls downloads` };
      }
      return {
        output: children
          .map((c) => `${c.kind === 'folder' ? 'drwxr-xr-x' : '-rw-r--r--'}  ${c.modifiedAt}  ${c.name}`)
          .join('\n'),
      };
    }

    case 'cat': {
      const target = args.join(' ').trim().toLowerCase();
      if (!target) return { output: 'Usage: cat <filename>  (example: cat Adobe_Compatibility_Test_Log.txt)' };
      const match = ctx.files.find(
        (f) => f.kind !== 'folder' && f.name.toLowerCase().includes(target)
      );
      if (!match) return { output: `cat: ${args.join(' ')}: No such file in AetherOS filesystem` };
      return { output: match.content ?? `[Binary file: ${match.name}]` };
    }

    default:
      return {
        output: `bash: ${cmd}: command not found. Type 'help' to see available AetherOS commands.`,
      };
  }
}
