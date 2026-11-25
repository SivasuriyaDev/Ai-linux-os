import type { WallpaperId } from '../os/types';

interface WallpaperBackdropProps {
  wallpaper: WallpaperId;
  customWallpaperUrl?: string | null;
  customWallpaperFit?: 'cover' | 'contain' | 'fill';
}

export function WallpaperBackdrop({
  wallpaper,
  customWallpaperUrl,
  customWallpaperFit = 'cover',
}: WallpaperBackdropProps) {
  if (wallpaper === 'custom' && customWallpaperUrl) {
    const objectFitClass =
      customWallpaperFit === 'contain'
        ? 'object-contain'
        : customWallpaperFit === 'fill'
          ? 'object-fill'
          : 'object-cover';
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden bg-slate-950 transition-colors duration-300"
      >
        <img
          src={customWallpaperUrl}
          alt=""
          className={`h-full w-full ${objectFitClass}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/15" />
      </div>
    );
  }

  if (wallpaper === 'mica-light') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden bg-[#eaf0f8] transition-colors duration-300"
      >
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <radialGradient id="lightBloomCore" cx="52%" cy="46%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#dbeafe" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.35" />
            </radialGradient>
            <linearGradient id="lightRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="lightRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#93c5fd" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.22" />
            </linearGradient>
            <filter id="softLightBlur">
              <feGaussianBlur stdDeviation="24" />
            </filter>
          </defs>
          <rect width="1600" height="900" fill="url(#lightBloomCore)" />
          <path
            d="M260,640 C420,240 780,140 1060,360 C1240,500 1340,680 1120,760 C860,850 480,790 260,640 Z"
            fill="url(#lightRibbon1)"
            filter="url(#softLightBlur)"
          />
          <path
            d="M420,560 C560,260 880,180 1160,310 C1320,385 1270,580 1060,650 C810,735 530,680 420,560 Z"
            fill="url(#lightRibbon2)"
          />
          <path
            d="M520,515 C640,310 920,255 1110,365 C1210,425 1150,550 980,595 C790,645 610,600 520,515 Z"
            fill="#ffffff"
            fillOpacity="0.65"
          />
        </svg>
      </div>
    );
  }

  if (wallpaper === 'alpine-dusk') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden bg-[#0c1424] transition-colors duration-300"
      >
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="alpineSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b1324" />
              <stop offset="52%" stopColor="#1e3150" />
              <stop offset="82%" stopColor="#3b5374" />
              <stop offset="100%" stopColor="#182235" />
            </linearGradient>
            <linearGradient id="ridgeFar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334b6b" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#162238" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="ridgeNear" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c2a42" />
              <stop offset="100%" stopColor="#090f1c" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#alpineSky)" />
          <circle cx="1180" cy="240" r="140" fill="#93c5fd" fillOpacity="0.09" />
          <path
            d="M0,620 L240,460 L480,545 L790,375 L1080,520 L1360,415 L1600,530 L1600,900 L0,900 Z"
            fill="url(#ridgeFar)"
          />
          <path
            d="M0,700 L310,565 L590,645 L910,485 L1250,625 L1600,520 L1600,900 L0,900 Z"
            fill="url(#ridgeNear)"
          />
        </svg>
      </div>
    );
  }

  if (wallpaper === 'obsidian-grid') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden bg-[#080c14] transition-colors duration-300"
      >
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <pattern id="archGrid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="#334155"
                strokeOpacity="0.22"
                strokeWidth="1"
              />
            </pattern>
            <radialGradient id="obsidianSpot" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.16" />
              <stop offset="55%" stopColor="#1e293b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1600" height="900" fill="#080c14" />
          <rect width="1600" height="900" fill="url(#archGrid)" />
          <rect width="1600" height="900" fill="url(#obsidianSpot)" />
        </svg>
      </div>
    );
  }

  // Default: mica-dark (Sculpted Windows 11-inspired midnight bloom)
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#070b14] transition-colors duration-300"
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="darkBgHalo" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#172554" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#0c1528" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#050811" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="darkPetal1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.52" />
            <stop offset="48%" stopColor="#2563eb" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="darkPetal2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="darkPetal3" x1="15%" y1="100%" x2="85%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.25" />
          </linearGradient>
          <filter id="darkBloomBlur">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>
        <rect width="1600" height="900" fill="url(#darkBgHalo)" />
        <path
          d="M270,640 C430,220 820,120 1120,340 C1310,480 1350,690 1110,775 C840,870 460,790 270,640 Z"
          fill="url(#darkPetal1)"
          filter="url(#darkBloomBlur)"
        />
        <path
          d="M420,575 C540,260 885,175 1165,305 C1325,380 1275,585 1065,655 C815,740 530,685 420,575 Z"
          fill="url(#darkPetal2)"
        />
        <path
          d="M545,515 C650,320 910,260 1095,365 C1190,420 1140,545 975,590 C785,642 625,595 545,515 Z"
          fill="url(#darkPetal3)"
        />
        <path
          d="M660,475 C730,365 895,335 1005,400 C1060,432 1030,505 935,530 C815,562 715,525 660,475 Z"
          fill="#bae6fd"
          fillOpacity="0.22"
        />
      </svg>
    </div>
  );
}
