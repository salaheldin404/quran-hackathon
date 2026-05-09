import quranData from "@/data/all-quran-surah.json";
import { BgStar, Point, Theme } from "@/types/galaxy";

export function milkyWayPositions(rotations: number): Point[] {
  const n = 114;

  // ── Layout Constants ─────────────────────────────────
  const layout = {
    centerX: 50,
    centerY: 50,
    ySqueeze: 0.65,
    minBound: 3,
    maxBound: 97,
  };

  // ── Spiral Configuration ─────────────────────────────
  const spiral = {
    rotations,
    rMin: 13,
    rMax: 46,
    tilt: Math.PI * 0.12,
  };

  // ── Physics / Relaxation ─────────────────────────────
  const physics = {
    scatterStrength: 1.0,
    minGap: 0.8,
    iterations: 35,
    damping: 0.5,
    epsilon: 0.0001,
  };

  // ── Derived Values ───────────────────────────────────
  const totalAngle = spiral.rotations * 2 * Math.PI;
  const growthRate = (spiral.rMax - spiral.rMin) / totalAngle;

  const radius = (5 / 1280) * 100; // constant

  // ── RNG (Mulberry32 - deterministic) ─────────────────
  let seed = 7919;
  const rng = (): number => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
  };

  // ── Helpers ──────────────────────────────────────────
  const clamp = (v: number): number =>
    parseFloat(
      Math.max(layout.minBound, Math.min(layout.maxBound, v)).toFixed(2),
    );

  // ── Generate Spiral Positions ────────────────────────
  const positions: Point[] = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);

    const theta = t * totalAngle + spiral.tilt;
    const radial = spiral.rMin + growthRate * (theta - spiral.tilt);

    const scatterOffset = (rng() - 0.5) * physics.scatterStrength;
    const perpendicular = theta + Math.PI / 2;

    const x =
      layout.centerX +
      radial * Math.cos(theta) +
      scatterOffset * Math.cos(perpendicular);

    const y =
      layout.centerY +
      (radial * Math.sin(theta) + scatterOffset * Math.sin(perpendicular)) *
        layout.ySqueeze;

    return { x: clamp(x), y: clamp(y) };
  });

  // ── Repulsion (collision avoidance) ──────────────────
  for (let iter = 0; iter < physics.iterations; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = (positions[j].y - positions[i].y) / layout.ySqueeze;

        const dist = Math.hypot(dx, dy) || physics.epsilon;
        const minDist = radius * 2 + physics.minGap;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const push = (overlap / 2) * physics.damping;

          const nx = dx / dist;
          const ny = (dy / dist) * layout.ySqueeze;

          positions[i].x -= nx * push;
          positions[i].y -= ny * push;

          positions[j].x += nx * push;
          positions[j].y += ny * push;
        }
      }
    }
  }

  // ── Final Clamp ──────────────────────────────────────
  return positions.map(({ x, y }) => ({
    x: clamp(x),
    y: clamp(y),
  }));
}

// ─── Colour palette ───────────────────────────────────────────────────────────
const MECCAN_COLORS = ["#FFD700", "#FFA500", "#FFB6C1", "#E0B4FF", "#FFFACD"];
const MEDINAN_COLORS = ["#00BFFF", "#7FFFD4", "#B0E0E6", "#87CEEB", "#ADD8E6"];

export const galaxySurahs = quranData.data.map((surah, i) => {
  const isMeccan = surah.revelationType === "Meccan";
  const palette = isMeccan ? MECCAN_COLORS : MEDINAN_COLORS;
  const color = palette[i % palette.length];
  return {
    ...surah,
    color,
  };
});

const focusedLayoutCache = new Map<number, Point[]>();

export const generateFocusedLayout = (count: number): Point[] => {
  if (focusedLayoutCache.has(count)) return focusedLayoutCache.get(count)!;

  const layout = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 23 + Math.sin(i) * 4;
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  });

  focusedLayoutCache.set(count, layout);
  return layout;
};

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function gaussPos(i: number): { x: number; y: number } {
  const u = Math.max(sr(i * 3.71 + 0.1), 1e-9);
  const v = sr(i * 7.13 + 0.4);
  const mag = 22 * Math.sqrt(-2 * Math.log(u));
  return {
    x: Math.max(1, Math.min(99, 50 + mag * Math.cos(2 * Math.PI * v))),
    y: Math.max(1, Math.min(99, 50 + mag * Math.sin(2 * Math.PI * v) * 0.62)),
  };
}

export function makeStars(count: number): BgStar[] {
  return Array.from({ length: count }, (_, i) => {
    const useGauss = sr(i * 17.3) < 0.6;
    const pos = useGauss
      ? gaussPos(i)
      : { x: sr(i * 3) * 100, y: sr(i * 3 + 1) * 100 };
    const size = sr(i * 3 + 2) * 1.6 + 0.4;
    const op = sr(i * 7) * 0.45 + 0.15;

    // Bigger/brighter stars drift more — parallax depth cue
    const driftScale = 0.8 + size * 1.4;

    return {
      id: i,
      x: pos.x,
      y: pos.y,
      size,
      op,
      dx: (sr(i * 19 + 1) * 4 + 1.5) * driftScale,
      dy: (sr(i * 23 + 2) * 3 + 1.0) * driftScale,
      // Short enough to be visible, long enough to feel like space
      driftDur: sr(i * 29 + 3) * 10 + 8, // 8–18 s
      twinkleDur: sr(i * 11) * 4 + 2, // 2–6 s
      driftDelay: sr(i * 37 + 5) * 8,
      twinkleDelay: sr(i * 13) * 5,
    };
  });
}

export const STAR_SIZE = 5;

export const THEMES: Theme[] = [
  {
    id: "prophets",
    label: "قصص الأنبياء",
    subtitle: "Stories of the Prophets",
    color: "#34d399", // emerald
    surahIds: [
      2, 3, 6, 7, 10, 11, 12, 14, 15, 19, 20, 21, 26, 27, 28, 37, 38, 71,
    ],
  },
  {
    id: "afterlife",
    label: "الآخرة",
    subtitle: "The Hereafter",
    color: "#a78bfa", // violet
    surahIds: [22, 36, 39, 50, 55, 56, 67, 69, 75, 78, 81, 82, 83, 84, 99, 101],
  },
  {
    id: "aqeedah",
    label: "التوحيد",
    subtitle: "Faith & Monotheism",
    color: "#fbbf24", // amber
    surahIds: [
      1, 6, 13, 16, 25, 31, 35, 40, 41, 42, 50, 51, 52, 53, 87, 112, 113, 114,
    ],
  },
  {
    id: "ethics",
    label: "الأخلاق",
    subtitle: "Ethics & Conduct",
    color: "#38bdf8", // sky
    surahIds: [17, 23, 24, 49, 60, 68, 80, 83, 90, 103, 107],
  },
  {
    id: "legislation",
    label: "التشريع",
    subtitle: "Divine Legislation",
    color: "#fb923c", // orange
    surahIds: [2, 4, 5, 8, 9, 24, 33, 60, 65],
  },
];

export const createGlassStyle = (color: string) => ({
  backgroundColor: `${color}08`,
  border: `1px solid ${color}20`,
});
