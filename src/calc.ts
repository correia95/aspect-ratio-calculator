// Aspect-ratio maths. Pure functions.

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

// Simplify w:h to smallest integer ratio (rounds to nearest px first).
export function simplify(w: number, h: number): [number, number] {
  const rw = Math.round(w);
  const rh = Math.round(h);
  if (rw <= 0 || rh <= 0) return [0, 0];
  const g = gcd(rw, rh);
  return [rw / g, rh / g];
}

export interface RatioInfo {
  a: number; // simplified numerator
  b: number; // simplified denominator
  decimal: number; // w / h
  label: string; // e.g. "16:9" plus a name if recognised
  name?: string;
}

const NAMED: { r: number; text: string }[] = [
  { r: 16 / 9, text: '16:9 — widescreen HD / most TVs & monitors' },
  { r: 4 / 3, text: '4:3 — classic TV / older monitors' },
  { r: 64 / 27, text: '≈21:9 — ultrawide monitor (64:27, e.g. 2560×1080)' },
  { r: 2.389, text: '≈2.39:1 — anamorphic cinema, also 3440×1440 "21:9" ultrawide' },
  { r: 1, text: '1:1 — square (Instagram post)' },
  { r: 3 / 2, text: '3:2 — 35 mm film / many mirrorless cameras' },
  { r: 9 / 16, text: '9:16 — vertical video / phone Stories & Reels' },
  { r: 5 / 4, text: '5:4 — 1280×1024 monitors' },
  { r: 1.85, text: '1.85:1 — US theatrical "flat"' },
  { r: 1.414, text: '≈1.414:1 — ISO A-series paper (√2)' },
  { r: 1.618, text: '≈1.618:1 — the golden ratio' },
];

export function describe(w: number, h: number): RatioInfo {
  const [a, b] = simplify(w, h);
  const decimal = h > 0 ? w / h : 0;
  let name: string | undefined;
  for (const n of NAMED) {
    if (Math.abs(decimal - n.r) / n.r < 0.012) {
      name = n.text;
      break;
    }
  }
  const label = a && b ? `${a}:${b}` : '—';
  return { a, b, decimal, label, name };
}

// Given ratio a:b and one dimension, get the other.
export function fromWidth(a: number, b: number, width: number): number {
  return a > 0 ? (width * b) / a : 0;
}
export function fromHeight(a: number, b: number, height: number): number {
  return b > 0 ? (height * a) / b : 0;
}

// Scale (w,h) to fit inside (boxW, boxH) without distortion.
export function fitInside(w: number, h: number, boxW: number, boxH: number): { w: number; h: number; scale: number } {
  if (w <= 0 || h <= 0) return { w: 0, h: 0, scale: 0 };
  const s = Math.min(boxW / w, boxH / h);
  return { w: w * s, h: h * s, scale: s };
}

export interface Preset {
  label: string;
  a: number;
  b: number;
}
export const PRESETS: Preset[] = [
  { label: '16:9', a: 16, b: 9 },
  { label: '4:3', a: 4, b: 3 },
  { label: '21:9', a: 64, b: 27 },
  { label: '1:1', a: 1, b: 1 },
  { label: '3:2', a: 3, b: 2 },
  { label: '9:16', a: 9, b: 16 },
  { label: '2:1', a: 2, b: 1 },
  { label: '2.39:1', a: 239, b: 100 },
];

export const round = (n: number) => Math.round(n * 100) / 100;
export const px = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
