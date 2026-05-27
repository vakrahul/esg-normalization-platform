/** Modern environmental hero — mesh gradients + abstract data-flow lines (no stock globe icons). */
export default function EnvHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="hero-mesh absolute inset-0" />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129 / 0.12) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="flow-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        <path
          d="M-40 520 C200 420, 380 580, 620 500 S980 380, 1180 460 S1380 540, 1520 480 L1520 900 L-40 900 Z"
          fill="url(#hill)"
        />
        <path
          d="M-40 600 C180 540, 420 640, 700 580 S1100 500, 1520 560 L1520 900 L-40 900 Z"
          fill="#10b981"
          fillOpacity="0.06"
        />

        <path
          d="M120 280 Q420 220 720 280 T1320 260"
          stroke="url(#flow-a)"
          strokeWidth="2"
          strokeDasharray="8 14"
          className="hero-flow-line"
        />
        <path
          d="M80 360 Q360 300 680 340 T1280 320"
          stroke="url(#flow-a)"
          strokeWidth="1.5"
          strokeDasharray="6 12"
          opacity="0.7"
          className="hero-flow-line hero-flow-line-delay"
        />

        {[180, 420, 680, 940, 1180].map((x, i) => (
          <g key={x} opacity={0.25 + i * 0.05}>
            <circle cx={x} cy={280 + (i % 2) * 40} r="5" fill="#059669" />
            <circle cx={x} cy={280 + (i % 2) * 40} r="18" stroke="#10b981" strokeWidth="1" opacity="0.4" />
          </g>
        ))}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent" />
    </div>
  );
}
