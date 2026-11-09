// Hand-drawn helpers shared by every scene: seeded randomness, the
// 10-drawings-a-second grid, and wobbly SVG paths whose line "boils".
// Everything depends only on the frame, so every render is identical.

export const INK = "#2B2B2B";
export const GREY = "#A9A39A";
export const RED = "#D63A2E";
export const PAPER = "#F6EFE3";

/** Drawings per second: the picture changes on this grid (limited animation). */
export const DRAWINGS_PER_SECOND = 10;

export const rng = (seed: number) => {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const jit = (r: () => number, a: number) => (r() * 2 - 1) * a;

/** Index of the current drawing (changes 10 times a second). */
export const drawingAt = (frame: number, fps: number) =>
  Math.floor((frame / fps) * DRAWINGS_PER_SECOND);

/** Which of 3 line variants to show for this drawing. */
export const variantAt = (drawing: number, seed: number) =>
  Math.floor(rng(seed * 97 + drawing)() * 3);

type Pt = [number, number];

export const polyPath = (pts: Pt[], r: () => number, amp: number, closed: boolean) => {
  const p = pts.map(([x, y]) => [x + jit(r, amp), y + jit(r, amp)] as Pt);
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const mx = (x0 + x1) / 2 + jit(r, amp * 0.6);
    const my = (y0 + y1) / 2 + jit(r, amp * 0.6);
    d += ` Q${mx.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return closed ? d + " Z" : d;
};

export const line = (x0: number, y0: number, x1: number, y1: number, r: () => number, amp = 1.6) => {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 40));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  return polyPath(pts, r, amp, false);
};

export const rrect = (x: number, y: number, w: number, h: number, rad: number, r: () => number, amp = 2) => {
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (Math.PI / 2) * (i / 6);
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
  };
  corner(x + w - rad, y + rad, -Math.PI / 2);
  corner(x + w - rad, y + h - rad, 0);
  corner(x + rad, y + h - rad, Math.PI / 2);
  corner(x + rad, y + rad, Math.PI);
  return polyPath(pts, r, amp, true);
};

export const ellipse = (cx: number, cy: number, rx: number, ry: number, r: () => number, amp = 2, n = 18) => {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return polyPath(pts, r, amp, true);
};

export const cloud = (cx: number, cy: number, rx: number, ry: number, r: () => number, amp = 2) => {
  const pts: Pt[] = [];
  const n = 54;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = 1 + 0.09 * Math.abs(Math.sin((a * 9) / 2));
    pts.push([cx + Math.cos(a) * rx * b, cy + Math.sin(a) * ry * b]);
  }
  return polyPath(pts, r, amp, true);
};

/** Small hand-held shake for a cut-out pose, new on every drawing. */
export const boil = (drawing: number, seed: number, amp = 2, rot = 0.3) => {
  const r = rng(seed * 7919 + drawing);
  return { x: jit(r, amp), y: jit(r, amp), rot: jit(r, rot) };
};

/** A pop on the drawing grid: small, overshoot, settle. `k` = drawings since it appeared. */
export const popScale = (k: number, big = 1.18) => (k <= 0 ? 0.55 : k === 1 ? big : k === 2 ? 0.94 : 1);
