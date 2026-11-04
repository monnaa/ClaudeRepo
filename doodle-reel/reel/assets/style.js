/* Shared style: palette, seeded random, wobbly hand-drawn strokes and flat fills.
   Everything is a pure function of (scene, drawing index): no Date.now(), no Math.random(). */
(function () {
  const D = (window.Doodle = window.Doodle || {});

  D.W = 1080;
  D.H = 1920;
  D.SAFE_TOP = Math.round(1920 * 0.12); // 230
  D.SAFE_BOTTOM = Math.round(1920 * 0.78); // 1498

  D.C = {
    ink: "#2B2B2B", // charcoal outlines
    paper: "#F6EFE3", // cream paper
    terra: "#C4623E", // sweater and props
    terraDeep: "#A9522F", // sweater ribs (same hue, darker)
    mustard: "#D9A21B", // ONLY the two shoulder buttons
    red: "#D63A2E", // ONLY anger marks, scenes 3-5
    hair: "#4A3227", // dark brown hair
    hairLine: "#2B2B2B",
    skin: "#FCF4EA",
    light: "#FFFBF4",
    grey: "#A9A39B",
    greySoft: "#D9D3CA",
    chair: "#EDE3D3",
    sticky: "#F4E8C8",
  };

  D.LINE = 4.2; // base outline width

  // ---- seeded random -------------------------------------------------------
  D.hash = function () {
    const s = Array.prototype.join.call(arguments, "|");
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  };
  D.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  D.uni = (r, a, b) => a + (b - a) * r();

  // smooth 2D offset along a path (arc length s), seeded
  function noise(seed) {
    const r = D.rng(seed);
    const mk = () => [0, 1, 2].map(() => [D.uni(r, 0.018, 0.05), D.uni(r, 0, 6.283), D.uni(r, 0.5, 1)]);
    const cx = mk(), cy = mk();
    const hf = [D.uni(r, 0.15, 0.3), D.uni(r, 0, 6.283)];
    return function (s) {
      let x = 0, y = 0;
      for (const [f, p, a] of cx) x += a * Math.sin(f * s + p);
      for (const [f, p, a] of cy) y += a * Math.sin(f * s + p);
      const j = 0.18 * Math.sin(hf[0] * s + hf[1]);
      return [x / 1.7 + j, y / 1.7 - j];
    };
  }

  // ---- geometry helpers ----------------------------------------------------
  D.smooth = function (pts, closed, samples) {
    samples = samples || 8;
    const n = pts.length;
    if (n < 3) return pts.slice();
    const out = [];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = closed ? pts[(i - 1 + n) % n] : pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = closed ? pts[(i + 1) % n] : pts[i + 1];
      const p3 = closed ? pts[(i + 2) % n] : pts[Math.min(i + 2, n - 1)];
      for (let k = 0; k < samples; k++) {
        const t = k / samples, t2 = t * t, t3 = t2 * t;
        const q = [0, 1].map(
          (j) =>
            0.5 *
            (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
              (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)
        );
        out.push(q);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  };

  D.ellipse = function (cx, cy, rx, ry, n, a0, a1, rot) {
    n = n || 48;
    a0 = a0 || 0;
    a1 = a1 === undefined ? Math.PI * 2 : a1;
    rot = rot || 0;
    const c = Math.cos(rot), s = Math.sin(rot);
    const closed = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
    const m = closed ? n : n + 1;
    const out = [];
    for (let i = 0; i < m; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const x = rx * Math.cos(a), y = ry * Math.sin(a);
      out.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
    return out;
  };

  D.rot = function (pts, cx, cy, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
  };

  D.rrect = function (x0, y0, x1, y1, rad) {
    const pts = [];
    const corners = [
      [x1 - rad, y0 + rad, -Math.PI / 2],
      [x1 - rad, y1 - rad, 0],
      [x0 + rad, y1 - rad, Math.PI / 2],
      [x0 + rad, y0 + rad, Math.PI],
    ];
    for (const [cx, cy, a] of corners)
      for (let k = 0; k <= 4; k++) {
        const t = a + ((Math.PI / 2) * k) / 4;
        pts.push([cx + rad * Math.cos(t), cy + rad * Math.sin(t)]);
      }
    return pts;
  };

  function resample(pts, step, closed) {
    const P = closed ? pts.concat([pts[0]]) : pts;
    const out = [], ss = [];
    let s = 0;
    for (let i = 0; i < P.length - 1; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[i + 1];
      const d = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(1, Math.floor(d / step));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
        ss.push(s + d * t);
      }
      s += d;
    }
    if (!closed) {
      out.push(P[P.length - 1]);
      ss.push(s);
    }
    return [out, ss];
  }

  const f1 = (v) => Math.round(v * 10) / 10;
  const pathOf = (pts, close) =>
    "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join("L") + (close ? "Z" : "");

  // ---- the canvas: collects SVG markup for one drawing ---------------------
  D.Canvas = function (dseed) {
    this.dseed = dseed;
    this.out = [];
  };
  const CP = D.Canvas.prototype;

  CP.wob = function (pts, key, amp, closed, step) {
    amp = amp === undefined ? 2.2 : amp;
    const [rs, ss] = resample(pts, step || 7, closed);
    if (amp <= 0) return rs;
    const n = noise(D.hash(this.dseed, key));
    return rs.map(([x, y], i) => {
      const [dx, dy] = n(ss[i]);
      return [x + amp * dx, y + amp * dy];
    });
  };

  // a charcoal line made of short pieces with slightly different widths
  CP._stroke = function (wp, key, width, color) {
    const r = D.rng(D.hash(this.dseed, key, "w"));
    const n = wp.length;
    let i = 0;
    while (i < n - 1) {
      const j = Math.min(n - 1, i + 4 + Math.floor(r() * 6));
      const w = Math.max(1, width * D.uni(r, 0.75, 1.25));
      this.out.push(
        `<path d="${pathOf(wp.slice(i, j + 1))}" fill="none" stroke="${color}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`
      );
      i = j;
    }
  };

  CP.shape = function (pts, key, o) {
    o = o || {};
    const outline = o.outline === undefined ? D.C.ink : o.outline;
    const width = o.width === undefined ? D.LINE : o.width;
    const wp = this.wob(pts, key, o.amp, true, o.step);
    if (o.fill) this.out.push(`<path d="${pathOf(wp, true)}" fill="${o.fill}"/>`);
    if (outline && width > 0) this._stroke(wp.concat([wp[0]]), key, width, outline);
    return wp;
  };

  CP.line = function (pts, key, o) {
    o = o || {};
    const wp = this.wob(pts, key, o.amp, false, o.step);
    this._stroke(wp, key, o.width === undefined ? D.LINE : o.width, o.color || D.C.ink);
    return wp;
  };

  // thick outlined stroke: arms, sleeves, the sock
  CP.tube = function (pts, key, fill, width, o) {
    o = o || {};
    const ow = o.ow === undefined ? D.LINE : o.ow;
    const wp = this.wob(pts, key, o.amp === undefined ? 1.6 : o.amp, false, 6);
    const d = pathOf(wp);
    this.out.push(
      `<path d="${d}" fill="none" stroke="${o.outline || D.C.ink}" stroke-width="${f1(width + 2 * ow)}" stroke-linecap="round" stroke-linejoin="round"/>`
    );
    this.out.push(
      `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${f1(width)}" stroke-linecap="round" stroke-linejoin="round"/>`
    );
    return wp;
  };

  CP.dot = function (cx, cy, rx, ry, key, o) {
    o = Object.assign({ fill: D.C.ink, outline: null, amp: 0.7 }, o || {});
    return this.shape(D.ellipse(cx, cy, rx, ry, 26), key, o);
  };

  // raw markup (used for clipping groups)
  CP.raw = function (s) {
    this.out.push(s);
  };

  CP.svg = function (zoom) {
    // closer framing than the drawing coordinates: scale around the desk's front edge
    let body = `<g transform="translate(548 1236) scale(1.17) translate(-530 -1236)">${this.out.join("")}</g>`;
    if (zoom) {
      // close-up by cropping: a per-drawing scale, never tweened
      const [z, cx, cy] = zoom;
      const bw = D.W / z, bh = D.H / z;
      const x0 = Math.min(Math.max(cx - bw / 2, 0), D.W - bw);
      const y0 = Math.min(Math.max(cy - bh / 2, 0), D.H - bh);
      body = `<g transform="scale(${z}) translate(${f1(-x0)} ${f1(-y0)})">${body}</g>`;
    }
    return `<rect width="${D.W}" height="${D.H}" fill="${D.C.paper}"/>` + body;
  };

  D.ease = (x) => {
    x = Math.min(Math.max(x, 0), 1);
    return x * x * (3 - 2 * x);
  };
})();
