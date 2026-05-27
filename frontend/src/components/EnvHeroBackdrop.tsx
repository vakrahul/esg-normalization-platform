import HeroFallingLeaves from "./HeroFallingLeaves";

/** Full-screen cover image with subtle motion (gradient drift + particles + soft line). */
export default function EnvHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src="/hero-landscape.png"
        alt=""
        className="h-full w-full object-cover object-center"
      />

      <div className="hero-overlay-drift absolute inset-0" />
      <div className="hero-particles absolute inset-0" />
      <HeroFallingLeaves />

      <svg
        className="hero-soft-line absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 200 Q360 160 720 200 T1440 190"
          stroke="url(#heroLineGrad)"
          strokeWidth="1"
          strokeDasharray="6 14"
        />
        <defs>
          <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
