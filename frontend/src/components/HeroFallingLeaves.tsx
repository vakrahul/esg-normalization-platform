const LEAF_PATH = "M12 2C8 8 4 10 4 14c0 3 3 6 8 8 5-2 8-5 8-8 0-4-4-6-8-12Z";

const leaves = [
  { left: "6%", delay: "0s", duration: "16s", size: 22, opacity: 0.45 },
  { left: "18%", delay: "4s", duration: "19s", size: 16, opacity: 0.35 },
  { left: "32%", delay: "1s", duration: "14s", size: 20, opacity: 0.4 },
  { left: "48%", delay: "7s", duration: "18s", size: 14, opacity: 0.3 },
  { left: "62%", delay: "2s", duration: "17s", size: 24, opacity: 0.42 },
  { left: "76%", delay: "9s", duration: "15s", size: 18, opacity: 0.38 },
  { left: "88%", delay: "5s", duration: "20s", size: 15, opacity: 0.32 },
  { left: "94%", delay: "11s", duration: "16s", size: 12, opacity: 0.28 },
];

const drops = [
  { left: "12%", delay: "0.5s", duration: "11s", size: 6 },
  { left: "28%", delay: "3s", duration: "13s", size: 5 },
  { left: "55%", delay: "6s", duration: "10s", size: 7 },
  { left: "70%", delay: "2s", duration: "12s", size: 5 },
  { left: "82%", delay: "8s", duration: "11s", size: 6 },
  { left: "40%", delay: "4.5s", duration: "14s", size: 4 },
];

export default function HeroFallingLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {leaves.map((leaf, i) => (
        <svg
          key={`leaf-${i}`}
          className="hero-falling-leaf absolute text-emerald-600"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            opacity: leaf.opacity,
            animationDuration: leaf.duration,
            animationDelay: leaf.delay,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d={LEAF_PATH} />
        </svg>
      ))}
      {drops.map((drop, i) => (
        <span
          key={`drop-${i}`}
          className="hero-falling-drop absolute rounded-full bg-emerald-400/50"
          style={{
            left: drop.left,
            width: drop.size,
            height: drop.size * 1.4,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </div>
  );
}
