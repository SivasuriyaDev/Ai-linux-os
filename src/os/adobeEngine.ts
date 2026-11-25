import type { AdobeVersionEntry, DiagnosticCheck, WinePrefix } from './types';

export const ADOBE_COMPATIBILITY_DB: AdobeVersionEntry[] = [
  {
    id: 'photoshop-2021',
    appName: 'Adobe Photoshop',
    shortCode: 'Ps',
    accentHex: '#31A8FF',
    version: '2021 (v22.5)',
    tier: 'Gold',
    wineRunner: 'Wine Staging 9.21 + Fsync',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2019', 'vcrun2022', 'msxml6', 'gdiplus', 'atmlib', 'corefonts', 'dxvk'],
    workingFeatures: [
      'GPU-accelerated canvas zoom/rotate via DXVK',
      'Layers, masks, Smart Objects, Camera Raw 13',
      'Wacom / XP-Pen stylus pressure sensitivity',
      'PSD / TIFF / PNG / WebP export pipeline',
    ],
    knownBlockers: [
      'Creative Cloud Desktop sign-in window occasionally requires WebView2 fallback',
      'Cloud-hosted Neural Filters require newer Windows runtime hooks',
    ],
    testedNotes: 'Most dependable Photoshop release for production raster work on Debian LTS + Vulkan.',
  },
  {
    id: 'photoshop-2024',
    appName: 'Adobe Photoshop',
    shortCode: 'Ps',
    accentHex: '#31A8FF',
    version: '2024 (v25.9)',
    tier: 'Silver',
    wineRunner: 'Bottles Soda 9.0 + Fsync',
    graphicsLayer: 'VKD3D-Proton 2.13 (D3D12->Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'msxml6', 'gdiplus', 'corefonts', 'dotnet48', 'dxvk', 'vkd3d'],
    workingFeatures: [
      'Core 2D editing, masking, adjustment layers',
      'Basic Direct3D 12 canvas via VKD3D-Proton',
    ],
    knownBlockers: [
      'UXP plugin panels & Home Screen CEF subprocesses can crash intermittently',
      'Generative Fill & cloud authentication require official CC daemon stability',
    ],
    testedNotes: 'Usable with UXP plugins disabled; prefer v2021 (v22.5) for mission-critical sessions.',
  },
  {
    id: 'illustrator-2021',
    appName: 'Adobe Illustrator',
    shortCode: 'Ai',
    accentHex: '#FF9A00',
    version: '2021 (v25.4)',
    tier: 'Gold',
    wineRunner: 'Wine Staging 9.21 + Fsync',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2019', 'vcrun2022', 'msxml6', 'gdiplus', 'corefonts', 'dxvk'],
    workingFeatures: [
      'Bezier pen tools, multi-artboard layouts, Pathfinder',
      'CMYK print PDF, EPS, and clean SVG export',
      'Sharp font rendering with corefonts + fontsmooth=rgb',
    ],
    knownBlockers: [
      'Disable GPU Performance preview on hybrid Intel/NVIDIA laptops if viewport flickers',
    ],
    testedNotes: 'Strong daily driver compatibility under isolated 64-bit Wine prefix.',
  },
  {
    id: 'illustrator-2024',
    appName: 'Adobe Illustrator',
    shortCode: 'Ai',
    accentHex: '#FF9A00',
    version: '2024 (v28.5)',
    tier: 'Silver',
    wineRunner: 'Wine Staging 9.21 + Fsync',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'msxml6', 'gdiplus', 'corefonts', 'dxvk'],
    workingFeatures: [
      'Vector authoring, gradients, typography, artboards',
      'PDF & SVG production exports',
    ],
    knownBlockers: [
      'Welcome screen CEF frame may render blank (use File -> New)',
      'Cloud Generative Recolor requires active CC background IPC',
    ],
    testedNotes: 'Core vector editing works cleanly once past the welcome screen.',
  },
  {
    id: 'lightroom-11',
    appName: 'Adobe Lightroom Classic',
    shortCode: 'Lr',
    accentHex: '#31A8FF',
    version: 'v11.5',
    tier: 'Silver',
    wineRunner: 'Wine Staging 9.21 + Fsync',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'msxml6', 'gdiplus', 'corefonts', 'dxvk'],
    workingFeatures: [
      'SQLite catalog management, keywording, star ratings',
      'RAW/DNG Develop sliders, tone curve, HSL, batch export',
    ],
    knownBlockers: [
      'GPU acceleration in Develop module can stall on NVIDIA 565; switch to Basic/CPU if needed',
      'Map module (embedded browser) does not load reliably',
    ],
    testedNotes: 'Good compatibility for RAW photo catalogs and exports on CPU/Basic GPU mode.',
  },
  {
    id: 'audition-2022',
    appName: 'Adobe Audition',
    shortCode: 'Au',
    accentHex: '#9999FF',
    version: '2022 (v22.6)',
    tier: 'Silver',
    wineRunner: 'Wine Staging 9.21 + PipeWire-JACK',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'corefonts', 'gdiplus', 'dxvk'],
    workingFeatures: [
      'Waveform & Multitrack editing, spectral frequency display',
      'Low-latency playback/recording via PipeWire-Pulse or WineASIO',
      'WAV / FLAC / MP3 mastering exports',
    ],
    knownBlockers: [
      'Some third-party Windows VST3 plugins with kernel anti-tamper drivers fail to scan',
    ],
    testedNotes: 'Performs reliably with AetherOS PipeWire audio routing.',
  },
  {
    id: 'premiere-2022',
    appName: 'Adobe Premiere Pro',
    shortCode: 'Pr',
    accentHex: '#9999FF',
    version: '2022 (v22.6)',
    tier: 'Bronze',
    wineRunner: 'Bottles Soda 9.0 + Fsync',
    graphicsLayer: 'Software Mercury',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'msxml6', 'corefonts', 'dxvk', 'vkd3d'],
    workingFeatures: [
      'Basic timeline assembly using Mercury Playback Engine (Software Only)',
      'ProRes & DNxHR software decoding',
    ],
    knownBlockers: [
      'CUDA / NVENC hardware encoding & OpenCL GPU effects fail inside Wine',
      'H.265 hardware decode and Lumetri GPU scopes frequently crash',
      'Creative Cloud CEF Essential Graphics panels are unstable',
    ],
    testedNotes: 'Not recommended for commercial deadlines; Premiere Pro 2024+ is currently Unsupported.',
  },
  {
    id: 'premiere-2024',
    appName: 'Adobe Premiere Pro',
    shortCode: 'Pr',
    accentHex: '#9999FF',
    version: '2024 (v24.4)',
    tier: 'Unsupported',
    wineRunner: 'Wine Staging 9.21',
    graphicsLayer: 'Software Mercury',
    winVersion: 'win11',
    requiredRuntimes: ['vcrun2022', 'msxml6', 'dotnet48', 'vkd3d'],
    workingFeatures: [
      'Splash screen & partial UI initialization only',
    ],
    knownBlockers: [
      'Blocked by mandatory DirectML/DirectCompute hooks and Windows 11 Media Foundation calls',
      'Creative Cloud IPC daemon disconnects during project open',
      'Use native Linux DaVinci Resolve or Kdenlive for GPU-accelerated video editing on AetherOS',
    ],
    testedNotes: 'Explicitly marked Unsupported per AetherOS engineering transparency policy.',
  },
  {
    id: 'after-effects-2022',
    appName: 'Adobe After Effects',
    shortCode: 'Ae',
    accentHex: '#9999FF',
    version: '2022 (v22.6)',
    tier: 'Bronze',
    wineRunner: 'Bottles Soda 9.0 + Fsync',
    graphicsLayer: 'VKD3D-Proton 2.13 (D3D12->Vulkan)',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'msxml6', 'corefonts', 'dxvk', 'vkd3d'],
    workingFeatures: [
      'Simple 2D keyframe compositions on CPU renderer',
    ],
    knownBlockers: [
      'Multi-Frame Rendering and Cinema 4D Lite bridge crash under Wine',
      'Dynamic Link IPC to Premiere Pro / Media Encoder is broken',
      'v2024+ fails initialization due to DirectX 12 / DirectML dependencies',
    ],
    testedNotes: 'Experimental only; Blender / Natron recommended natively on Linux for VFX.',
  },
  {
    id: 'media-encoder-2022',
    appName: 'Adobe Media Encoder',
    shortCode: 'Me',
    accentHex: '#9999FF',
    version: '2022 (v22.6)',
    tier: 'Bronze',
    wineRunner: 'Wine Staging 9.21',
    graphicsLayer: 'Software Mercury',
    winVersion: 'win10',
    requiredRuntimes: ['vcrun2022', 'corefonts', 'dxvk'],
    workingFeatures: [
      'Standalone drag-and-drop CPU H.264 / ProRes transcoding',
    ],
    knownBlockers: [
      'Dynamic Link queue handoff from Premiere Pro or After Effects fails',
      'No NVENC / QuickSync hardware encode bridge inside Wine prefix',
    ],
    testedNotes: 'Use native FFmpeg / HandBrake with VA-API or NVENC for full hardware encoding speed.',
  },
];

export const INITIAL_WINE_PREFIXES: WinePrefix[] = [
  {
    id: 'prefix-ps-2021',
    profileId: 'photoshop-2021',
    appName: 'Adobe Photoshop',
    version: '2021 (v22.5)',
    path: '~/.local/share/aether-adobe/prefixes/photoshop-2021',
    wineRunner: 'Wine Staging 9.21 + Fsync',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    gpuBackend: 'AMD Radeon RDNA (RADV Vulkan)',
    installedRuntimes: ['vcrun2019', 'vcrun2022', 'msxml6', 'gdiplus', 'atmlib', 'corefonts', 'dxvk'],
    launcherCreated: true,
    status: 'Ready',
    createdAt: '2026-11-24',
  },
  {
    id: 'prefix-ai-2021',
    profileId: 'illustrator-2021',
    appName: 'Adobe Illustrator',
    version: '2021 (v25.4)',
    path: '~/.local/share/aether-adobe/prefixes/illustrator-2021',
    wineRunner: 'Wine Staging 9.21 + Fsync',
    graphicsLayer: 'DXVK 2.4.1 (Vulkan)',
    winVersion: 'win10',
    gpuBackend: 'AMD Radeon RDNA (RADV Vulkan)',
    installedRuntimes: ['vcrun2019', 'vcrun2022', 'corefonts'],
    launcherCreated: false,
    status: 'Needs Dependencies',
    createdAt: '2026-11-25',
  },
];

export function evaluatePrefixStatus(
  prefix: WinePrefix,
  profile: AdobeVersionEntry | undefined
): WinePrefix['status'] {
  if (!profile) return 'Limited / Experimental';
  if (profile.tier === 'Bronze' || profile.tier === 'Unsupported') {
    return 'Limited / Experimental';
  }
  const missing = profile.requiredRuntimes.filter(
    (req) => !prefix.installedRuntimes.includes(req)
  );
  return missing.length === 0 ? 'Ready' : 'Needs Dependencies';
}

export function createWinePrefix(
  existing: WinePrefix[],
  profile: AdobeVersionEntry,
  gpuBackend: WinePrefix['gpuBackend']
): { prefixes: WinePrefix[]; created: WinePrefix } {
  const slug = `${profile.id}-${existing.length + 1}`;
  const initialRuntimes = ['vcrun2022', 'corefonts'];
  const created: WinePrefix = {
    id: `prefix-${slug}`,
    profileId: profile.id,
    appName: profile.appName,
    version: profile.version,
    path: `~/.local/share/aether-adobe/prefixes/${slug}`,
    wineRunner: profile.wineRunner,
    graphicsLayer: profile.graphicsLayer,
    winVersion: profile.winVersion,
    gpuBackend,
    installedRuntimes: initialRuntimes,
    launcherCreated: false,
    status: 'Needs Dependencies',
    createdAt: '2026-11-25',
  };
  created.status = evaluatePrefixStatus(created, profile);
  return {
    prefixes: [created, ...existing],
    created,
  };
}

export function installMissingDependencies(
  prefixes: WinePrefix[],
  prefixId: string
): WinePrefix[] {
  return prefixes.map((prefix) => {
    if (prefix.id !== prefixId) return prefix;
    const profile = ADOBE_COMPATIBILITY_DB.find((p) => p.id === prefix.profileId);
    if (!profile) return prefix;
    const merged = Array.from(
      new Set([...prefix.installedRuntimes, ...profile.requiredRuntimes])
    );
    const updated: WinePrefix = { ...prefix, installedRuntimes: merged };
    return {
      ...updated,
      status: evaluatePrefixStatus(updated, profile),
    };
  });
}

export function runPrefixDiagnostics(prefix: WinePrefix): DiagnosticCheck[] {
  const profile = ADOBE_COMPATIBILITY_DB.find((p) => p.id === prefix.profileId);
  const missingRuntimes = profile
    ? profile.requiredRuntimes.filter((r) => !prefix.installedRuntimes.includes(r))
    : [];

  const checks: DiagnosticCheck[] = [
    {
      id: 'wine-fsync',
      label: 'Kernel Fsync / Futex2 Synchronization',
      status: 'Pass',
      detail: `Linux 6.12 LTS active with ${prefix.wineRunner}`,
    },
    {
      id: 'vulkan-icd',
      label: 'Vulkan ICD & Graphics Translation',
      status:
        prefix.graphicsLayer === 'Software Mercury'
          ? 'Warning'
          : 'Pass',
      detail: `${prefix.gpuBackend} · Layer: ${prefix.graphicsLayer}`,
    },
    {
      id: 'runtimes',
      label: 'Microsoft Visual C++ / Corefonts / XML Runtimes',
      status: missingRuntimes.length === 0 ? 'Pass' : 'Warning',
      detail:
        missingRuntimes.length === 0
          ? `All ${prefix.installedRuntimes.length} required winetricks runtimes verified.`
          : `Missing runtimes: ${missingRuntimes.join(', ')}`,
    },
    {
      id: 'drm-compliance',
      label: 'Licensing & Authentication Integrity',
      status: 'Pass',
      detail: 'Clean unmodified prefix. Requires legitimate Adobe Creative Cloud license.',
    },
  ];

  if (profile && (profile.tier === 'Bronze' || profile.tier === 'Unsupported')) {
    checks.push({
      id: 'known-upstream-blockers',
      label: `${profile.appName} ${profile.version} Upstream Linux Compatibility`,
      status: 'Blocker',
      detail: profile.knownBlockers[0] ?? 'Severe upstream Wine/DirectML incompatibility.',
    });
  } else {
    checks.push({
      id: 'launcher',
      label: 'Desktop Launcher (.desktop) Integration',
      status: prefix.launcherCreated ? 'Pass' : 'Warning',
      detail: prefix.launcherCreated
        ? `Registered in ~/.local/share/applications/aether-${prefix.profileId}.desktop`
        : 'Not generated yet — click "Create Launcher" to pin to Start Menu.',
    });
  }

  return checks;
}
