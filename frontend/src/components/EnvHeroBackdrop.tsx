import HeroFallingLeaves from "./HeroFallingLeaves";

/** Full-screen cover image with smooth atmospheric air + light effects. */
export default function EnvHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>

      {/* Base hero image */}
      <img
        src="/hero-landscape.png"
        alt=""
        className="h-full w-full object-cover object-center"
      />

      {/* ── Atmospheric layers ───────────────────────────────────────────── */}

      {/* 1. Slow gradient overlay drift */}
      <div className="hero-overlay-drift absolute inset-0" />

      {/* 2. Soft light ray beams */}
      <div className="hero-light-rays absolute inset-0" />

      {/* 3. Mist wisps (blurred blobs that drift) */}
      <div className="hero-mist-1 absolute" />
      <div className="hero-mist-2 absolute" />
      <div className="hero-mist-3 absolute" />

      {/* 4. Smooth SVG air-wave ribbons — each in its own animating <g> */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="airGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#a7f3d0" stopOpacity="0" />
            <stop offset="40%"  stopColor="#6ee7b7" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="airGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#bfdbfe" stopOpacity="0" />
            <stop offset="50%"  stopColor="#93c5fd" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="airGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#d1fae5" stopOpacity="0" />
            <stop offset="60%"  stopColor="#6ee7b7" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#d1fae5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%"  stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Wrap each wave in its own <g> — CSS transforms work on <g> reliably */}
        <g className="hero-air-wave-1">
          <path
            d="M-200 320 C200 280 500 370 800 310 S1200 260 1640 330"
            stroke="url(#airGrad1)"
            strokeWidth="80"
            strokeLinecap="round"
          />
        </g>

        <g className="hero-air-wave-2">
          <path
            d="M-200 480 C300 440 600 520 900 470 S1300 410 1640 490"
            stroke="url(#airGrad2)"
            strokeWidth="60"
            strokeLinecap="round"
          />
        </g>

        <g className="hero-air-wave-3">
          <path
            d="M-200 180 C250 150 550 220 850 170 S1250 130 1640 200"
            stroke="url(#airGrad3)"
            strokeWidth="50"
            strokeLinecap="round"
          />
        </g>

        {/* Dashed accent line */}
        <path
          className="hero-soft-line-path"
          d="M0 200 Q360 160 720 200 T1440 190"
          stroke="url(#heroLineGrad)"
          strokeWidth="1"
          strokeDasharray="6 14"
        />
      </svg>

      {/* 5. Floating air particle dots */}
      <div className="hero-particles absolute inset-0" />

      {/* 6. Falling leaves + water drops */}
      <HeroFallingLeaves />
    </div>
  );
}
