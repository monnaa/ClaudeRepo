/* The character rig: one young woman, after the character sheet (planche).
   Large round head seen three-quarter toward the laptop, small dot eyes with a highlight,
   hatched cheeks, curly dark-brown hair with a bun, ribbed terracotta sweater with two
   small mustard buttons on one shoulder. Same proportions and outfit in every scene:
   only the hair level (1..5), the expression and the hair accessories change. */
(function () {
  const D = window.Doodle;
  const C = D.C;
  const L = D.LINE;

  // hair level 1..5: neat waves + bun, lifting, frizzy, very frizzy, exploded
  const SPREAD = [1.0, 1.05, 1.14, 1.27, 1.45];
  const AMP = [0.09, 0.12, 0.16, 0.21, 0.27];
  const BUMPS = [11, 12, 14, 16, 19];
  const STRANDS = [0, 2, 5, 9, 14];
  const CURLS = [3, 4, 6, 8, 10];

  // fixed strand directions (angle, length, curl side) so the hair grows, never reshuffles
  const SR = D.rng(4242);
  const STRAND_DIRS = [];
  for (let k = 0; k < 14; k++) {
    const a = k === 0 ? -Math.PI / 2 - 0.3 : D.uni(SR, -Math.PI + 0.1, -0.05);
    STRAND_DIRS.push([a, D.uni(SR, 0.3, 0.55), SR() < 0.5 ? -1 : 1]);
  }

  D.base = function () {
    return {
      seed: null,
      hx: 395, hy: 680, r: 170, sx: 1, sy: 1,
      turn: 0, // 0 = three-quarter toward the laptop, 1 = facing the camera
      gaze: [0.04, 0.0],
      eyes: ["dot", "dot"], brows: [[0, -0.3], [0, -0.3]], mouth: "smile", mouthOpen: 1,
      blush: true, sweat: false,
      hair: 1, sticky: false, glasses: false, sock: null,
      arms: "rest", lift: [0, 0],
      screen: {}, anger: 0, surprise: false, impact: false, pop: false, bubble: 0,
      zoom: null, bodyDy: 0, shake: 0,
    };
  };

  D.EXPR = {
    smile: { eyes: ["dot", "dot"], brows: [[-0.02, -0.35], [-0.02, -0.35]], mouth: "smile", blush: true },
    blink: { eyes: ["closed", "closed"], brows: [[-0.02, -0.35], [-0.02, -0.35]], mouth: "smile", blush: true },
    notice: { eyes: ["dot", "dot"], brows: [[-0.05, -0.3], [-0.05, -0.3]], mouth: "flat", blush: true },
    surprised: { eyes: ["wide", "wide"], brows: [[-0.15, -0.45], [-0.19, -0.45]], mouth: "O", blush: true },
    stare: { eyes: ["half", "half"], brows: [[0.05, 0.55], [-0.08, -0.2]], mouth: "flat", blush: false },
    stareTwitch: { eyes: ["half", "twitch"], brows: [[0.05, 0.55], [-0.12, -0.4]], mouth: "flat", blush: false },
    stubborn: { eyes: ["half", "half"], brows: [[0.06, 0.95], [0.06, 0.95]], mouth: "grit", blush: false },
    stubbornTwitch: { eyes: ["twitch", "half"], brows: [[0.09, 1.15], [0.06, 1.0]], mouth: "grit", blush: false },
    fume: { eyes: ["squint", "squint"], brows: [[0.08, 1.3], [0.08, 1.3]], mouth: "grit", blush: true },
    angry: { eyes: ["squint", "squint"], brows: [[0.06, 1.45], [0.06, 1.45]], mouth: "shout", blush: true },
    tired: { eyes: ["half", "half"], brows: [[0.03, -0.65], [0.03, -0.65]], mouth: "flat", blush: false },
    tiredTwitch: { eyes: ["half", "twitch"], brows: [[0.03, -0.65], [-0.02, -0.4]], mouth: "flat", blush: false },
    ah: { eyes: ["dot", "dot"], brows: [[-0.09, -0.8], [-0.09, -0.8]], mouth: "o", blush: true, sweat: true },
    thinking: { eyes: ["dot", "dot"], brows: [[-0.04, -0.45], [-0.12, -0.2]], mouth: "wavy", blush: true, sweat: true },
    deadpan: { eyes: ["half", "half"], brows: [[0.0, 0.0], [0.0, 0.0]], mouth: "flat", blush: false },
  };

  D.expr = function (p, name) {
    Object.assign(p, D.EXPR[name]);
    p.sweat = !!D.EXPR[name].sweat;
  };

  // ---- helpers ---------------------------------------------------------------
  const faceX = (p) => p.hx + (1 - p.turn) * 0.3 * p.r * p.sx;
  const backCx = (p) => p.hx - (1 - p.turn) * 0.12 * p.r;
  D.hairRadius = (p) => p.r * 1.22 * SPREAD[p.hair - 1] * (1 + AMP[p.hair - 1]);
  D.shoulders = function (p) {
    const r = p.r, bx = p.hx - 0.05 * r, y0 = p.hy + 0.95 * r + p.bodyDy;
    return { bx, y0, L: [bx - 0.8 * r, y0 + 0.38 * r], R: [bx + 0.72 * r, y0 + 0.32 * r] };
  };

  // ---- hair ------------------------------------------------------------------
  function curlyOutline(cx, cy, rx, ryTop, ryBot, bumps, amp, seed, narrowBottom) {
    const r = D.rng(seed);
    const jit = [];
    for (let k = 0; k < bumps; k++) jit.push(D.uni(r, 0.6, 1.35));
    const pts = [];
    const n = 220;
    for (let i = 0; i < n; i++) {
      const th = (2 * Math.PI * i) / n - Math.PI / 2;
      const c = Math.cos(th), s = Math.sin(th);
      const ry = s < 0 ? ryTop : ryBot;
      const bx = rx * c * (1 - narrowBottom * Math.max(0, s));
      const by = ry * s;
      const u = ((th + Math.PI / 2) * bumps) / (2 * Math.PI);
      const k = Math.floor(u) % bumps;
      const f = u - Math.floor(u);
      const bump = jit[k] * Math.pow(Math.sin(Math.PI * f), 0.9) * (0.75 + 0.5 * f);
      const lean = amp * 0.45 * jit[k] * Math.sin(2 * Math.PI * f) * (k % 2 ? 1 : -0.6);
      pts.push([cx + bx + c * amp * bump - s * lean, cy + by + s * amp * bump + c * lean]);
    }
    return pts;
  }

  function bun(cv, p) {
    const lvl = p.hair, r = p.r;
    const cx = p.hx - 0.18 * r - 0.05 * (lvl - 1) * r * (1 - p.turn);
    const cy = p.hy - 1.08 * r * SPREAD[lvl - 1] - 0.04 * lvl * r;
    const R = (0.34 + 0.05 * (lvl - 1)) * r;
    const pts = curlyOutline(cx, cy, R, R * 0.92, R * 0.92, 9 + lvl * 2, (0.05 + 0.04 * lvl) * r, 900 + lvl, 0);
    cv.shape(pts, "bun", { fill: C.hair, amp: 1.2 + 0.4 * lvl, step: 6 });
    // swirl inside the bun
    const sw = [];
    for (let k = 0; k <= 22; k++) {
      const a = -0.5 + k * 0.42;
      const rr = R * (0.15 + 0.6 * (k / 22));
      sw.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85]);
    }
    cv.line(sw, "bunswirl", { width: L * 0.6, amp: 1.0 });
  }

  function strands(cv, p) {
    const lvl = p.hair, r = p.r;
    const n = STRANDS[lvl - 1];
    const cx = backCx(p), cy = p.hy + 0.05 * r;
    const base = r * 1.18 * SPREAD[lvl - 1];
    for (let k = 0; k < n; k++) {
      const [ang, ln0, side] = STRAND_DIRS[k];
      const ln = ln0 * r * (0.6 + 0.12 * (lvl - 2));
      const pts = [];
      for (let j = 0; j <= 14; j++) {
        const t = j / 14;
        const d = base * 0.95 + ln * t;
        const lat = side * 0.18 * ln * Math.sin(2.2 * Math.PI * t);
        pts.push([cx + Math.cos(ang) * d - Math.sin(ang) * lat, cy + Math.sin(ang) * d + Math.cos(ang) * lat]);
      }
      // open loop at the tip (a curl, like the sheet's wiry hair)
      const [ex, ey] = pts[pts.length - 1];
      const cr = 0.07 * r;
      const ox = ex + Math.cos(ang + side * Math.PI / 2) * cr, oy = ey + Math.sin(ang + side * Math.PI / 2) * cr;
      const a0 = Math.atan2(ey - oy, ex - ox);
      for (let j = 1; j <= 12; j++) {
        const a = a0 + side * (j / 12) * Math.PI * 1.6;
        const rr = cr * (1 - j / 30);
        pts.push([ox + Math.cos(a) * rr, oy + Math.sin(a) * rr]);
      }
      cv.line(pts, "strand" + k, { width: L * 0.75, amp: 1.2 + 0.3 * lvl, color: C.hairLine });
    }
  }

  function hairBack(cv, p) {
    const lvl = p.hair, r = p.r;
    const sp = SPREAD[lvl - 1];
    if (lvl <= 4 || true) bun(cv, p);
    strands(cv, p);
    const cx = backCx(p), cy = p.hy + 0.05 * r;
    const pts = curlyOutline(cx, cy, r * 1.2 * sp, r * 1.12 * sp, r * (1.15 + 0.06 * lvl) * sp,
      BUMPS[lvl - 1], AMP[lvl - 1] * r, 500 + lvl, 0.12);
    cv.shape(pts, "hairback", { fill: C.hair, amp: 1.6 + 0.5 * lvl, step: 6 });
    // strand lines that follow the hair flow from the crown down the locks (like the sheet)
    const r2 = D.rng(700 + lvl);
    const nc = 6 + CURLS[lvl - 1];
    const crown = [p.hx - 0.15 * r, p.hy - 0.85 * r];
    for (let k = 0; k < nc; k++) {
      const a = D.uni(r2, Math.PI * 0.45, Math.PI * 1.55) + (k % 3 === 0 ? D.uni(r2, 0.9, 1.4) : 0);
      const rr = r * sp * D.uni(r2, 1.0, 1.2);
      const end = [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.02];
      const mid = [(crown[0] + end[0]) / 2 + Math.cos(a) * 0.35 * r * sp, (crown[1] + end[1]) / 2 + Math.sin(a) * 0.2 * r];
      const st = [crown[0] + (end[0] - crown[0]) * 0.35, crown[1] + (end[1] - crown[1]) * 0.35];
      const wig = 0.05 * r * (1 + 0.4 * lvl) * (k % 2 ? 1 : -1);
      const pts = D.smooth([st, [mid[0] + wig, mid[1] - wig], end], false, 8);
      cv.line(pts, "hl" + k, { width: L * 0.55, amp: 1 + 0.4 * lvl });
    }
  }

  function fringe(cv, p) {
    const lvl = p.hair, r = p.r, sx = p.sx, sy = p.sy;
    const hx = p.hx, hy = p.hy, fx = faceX(p), t = p.turn;
    const sp = 1 + 0.03 * (lvl - 1);
    const amp = (0.025 + 0.03 * (lvl - 1)) * r;
    const pts = [];
    // outer edge: around the top of the head, a little outside it
    const a0 = Math.PI + 0.45, a1 = 2 * Math.PI - 0.2 + 0.25 * t;
    const n = 50;
    for (let i = 0; i <= n; i++) {
      const th = a0 + ((a1 - a0) * i) / n;
      const bump = Math.pow(Math.abs(Math.sin(th * (6 + 2 * lvl))), 0.6);
      const rr = 1.06 * sp + (amp / r) * bump;
      pts.push([hx + rr * r * sx * Math.cos(th), hy + rr * 0.95 * r * sy * Math.sin(th)]);
    }
    // lower edge: curly ends over the forehead, swept toward the back of the head
    const right = [hx + 1.0 * r * sx * Math.cos(a1), hy + 0.95 * r * sy * Math.sin(a1)];
    const ctrl = [
      right,
      [fx + 0.42 * r * sx, hy - 0.3 * r * sy],
      [fx + 0.22 * r * sx, hy - 0.42 * r * sy - 0.02 * lvl * r],
      [fx + 0.02 * r * sx, hy - 0.3 * r * sy],
      [fx - 0.2 * r * sx, hy - 0.4 * r * sy - 0.02 * lvl * r],
      [fx - 0.42 * r * sx, hy - 0.22 * r * sy],
      [hx - (0.62 - 0.3 * t) * r * sx, hy - 0.12 * r * sy],
      [hx - (0.82 - 0.2 * t) * r * sx, hy + 0.08 * r * sy],
      [hx + 1.06 * sp * r * sx * Math.cos(a0), hy + 1.06 * 0.95 * sp * r * sy * Math.sin(a0)],
    ];
    const low = D.smooth(ctrl, false, 6).slice(1, -1);
    // a lock that falls past the far cheek, in front of the face edge (three-quarter view)
    if (t < 0.5) {
      const ex = hx + 0.98 * r * sx, top = hy - 0.25 * r * sy;
      const lock = D.smooth([[ex - 0.1 * r, top], [ex + 0.12 * r, hy + 0.1 * r], [ex + 0.04 * r, hy + 0.45 * r * sy],
        [ex + 0.12 * r + 0.03 * lvl * r, hy + 0.72 * r * sy], [ex - 0.04 * r, hy + 0.4 * r * sy], [ex - 0.08 * r, hy + 0.05 * r]], true, 5);
      cv.shape(lock, "cheeklock", { fill: C.hair, amp: 1.2 + 0.4 * lvl });
    }
    const all = pts.concat(low);
    cv.shape(all, "fringe", { fill: C.hair, amp: 1.3 + 0.4 * lvl });
    // hair flow lines on the fringe
    const flows = [
      [[hx - 0.1 * r, hy - 0.95 * r * sy], [fx - 0.05 * r, hy - 0.62 * r * sy], [fx - 0.2 * r, hy - 0.45 * r * sy]],
      [[hx + 0.25 * r, hy - 0.92 * r * sy], [fx + 0.3 * r, hy - 0.6 * r * sy], [fx + 0.22 * r, hy - 0.45 * r * sy]],
      [[hx - 0.45 * r, hy - 0.8 * r * sy], [hx - 0.6 * r, hy - 0.45 * r * sy], [hx - 0.62 * r, hy - 0.2 * r * sy]],
    ];
    flows.forEach((f, k) => cv.line(D.smooth(f, false, 6), "flow" + k, { width: L * 0.6, amp: 0.9 + 0.3 * lvl }));
  }

  // ---- body ------------------------------------------------------------------
  function chairBack(cv, p) {
    const sh = D.shoulders(p);
    cv.shape(D.rrect(sh.bx - 1.25 * p.r, sh.y0 + 0.2 * p.r, sh.bx - 0.25 * p.r, 1160, 46), "chair", { fill: C.chair });
  }

  function body(cv, p) {
    const r = p.r, sh = D.shoulders(p), bx = sh.bx, y0 = sh.y0;
    const ctrl = [
      [bx - 0.3 * r, y0], [bx - 0.7 * r, y0 + 0.08 * r], [bx - 0.92 * r, y0 + 0.36 * r],
      [bx - 1.0 * r, y0 + 0.9 * r], [bx - 1.02 * r, 1200], [bx + 0.95 * r, 1200],
      [bx + 0.92 * r, y0 + 0.85 * r], [bx + 0.85 * r, y0 + 0.3 * r], [bx + 0.62 * r, y0 + 0.06 * r],
      [bx + 0.3 * r, y0],
    ];
    cv.shape(D.smooth(ctrl, true, 6), "sweater", { fill: C.terra });
    // knit ribs
    for (let k = 0; k < 9; k++) {
      const x = bx - 0.72 * r + k * 0.19 * r;
      cv.line([[x, y0 + 0.32 * r + Math.abs(k - 4) * 0.02 * r], [x - 0.03 * r, 1190]], "rib" + k,
        { color: C.terraDeep, width: L * 0.55, amp: 1.2 });
    }
    // neck
    const hx = p.hx, hy = p.hy, fx = faceX(p);
    const nx = (hx + fx) / 2 - 0.05 * r;
    cv.shape([[nx - 0.17 * r, hy + 0.6 * r], [nx + 0.17 * r, hy + 0.6 * r], [nx + 0.24 * r, y0 + 0.06 * r],
      [nx - 0.26 * r, y0 + 0.06 * r]], "neck", { fill: C.skin, outline: null });
    cv.line([[nx - 0.16 * r, hy + 0.72 * r], [nx - 0.22 * r, y0 + 0.04 * r]], "neckl");
    cv.line([[nx + 0.16 * r, hy + 0.72 * r], [nx + 0.2 * r, y0 + 0.04 * r]], "neckr");
    // ribbed round collar
    const col = D.smooth([[nx - 0.4 * r, y0 - 0.01 * r], [nx, y0 + 0.16 * r], [nx + 0.38 * r, y0 - 0.01 * r]], false, 8);
    const col2 = D.smooth([[nx - 0.44 * r, y0 + 0.08 * r], [nx, y0 + 0.27 * r], [nx + 0.42 * r, y0 + 0.08 * r]], false, 8);
    cv.shape(col.concat(col2.slice().reverse()), "collar", { fill: C.terra, width: L * 0.9 });
    for (let k = 0; k < 7; k++) {
      const a = col[Math.round((k + 0.5) * (col.length - 1) / 7)], b = col2[Math.round((k + 0.5) * (col2.length - 1) / 7)];
      cv.line([a, b], "colrib" + k, { color: C.terraDeep, width: L * 0.5, amp: 0.5 });
    }
    // two small mustard buttons on the shoulder nearest the laptop
    for (let k = 0; k < 2; k++) {
      cv.dot(bx + (0.47 + 0.16 * k) * r, y0 + (0.2 + 0.1 * k) * r, 0.07 * r, 0.07 * r, "btn" + k,
        { fill: C.mustard, outline: C.ink, width: L * 0.8 });
    }
  }

  function head(cv, p) {
    const r = p.r, hx = p.hx, hy = p.hy, sx = p.sx, sy = p.sy;
    const pts = [];
    for (let i = 0; i < 64; i++) {
      const th = (2 * Math.PI * i) / 64;
      const s = Math.sin(th);
      const narrow = 1 - 0.07 * Math.max(0, s);
      pts.push([hx + r * sx * Math.cos(th) * narrow, hy + 0.95 * r * sy * s]);
    }
    cv.shape(pts, "head", { fill: C.skin });
    // ear on the back side (three-quarter view only)
    if (p.turn < 0.5) {
      const ex = hx - 0.86 * r * sx, ey = hy + 0.16 * r * sy;
      cv.shape(D.ellipse(ex, ey, 0.12 * r, 0.16 * r, 24), "ear", { fill: C.skin, width: L * 0.9 });
      cv.line(D.smooth([[ex + 0.02 * r, ey - 0.08 * r], [ex - 0.05 * r, ey], [ex + 0.03 * r, ey + 0.07 * r]], false, 5),
        "earin", { width: L * 0.6, amp: 0.5 });
      cv.dot(ex + 0.01 * r, ey + 0.2 * r, 0.045 * r, 0.045 * r, "earring", { fill: C.light, outline: C.ink, width: L * 0.8 });
    }
  }

  function eye(cv, ex, ey, kind, r, side, gx, gy, key) {
    if (kind === "dot") {
      cv.dot(ex + gx, ey + gy, 0.078 * r, 0.11 * r, key);
      cv.dot(ex + gx + 0.028 * r, ey + gy - 0.04 * r, 0.027 * r, 0.027 * r, key + "h", { fill: C.light });
    } else if (kind === "wide") {
      cv.dot(ex, ey, 0.115 * r, 0.145 * r, key, { fill: C.light, outline: C.ink, width: L * 0.9 });
      cv.dot(ex + gx * 1.4, ey + gy * 1.4, 0.05 * r, 0.06 * r, key + "p");
    } else if (kind === "half" || kind === "twitch") {
      const s = kind === "twitch" ? 0.8 : 1;
      const oy = kind === "twitch" ? -0.025 * r : 0;
      cv.shape(D.ellipse(ex + gx, ey + oy, 0.075 * r * s, 0.07 * r * s, 16, 0, Math.PI), key, { fill: C.ink, outline: null, amp: 0.6 });
      cv.line([[ex - 0.11 * r, ey + oy], [ex + 0.11 * r, ey + oy - (kind === "twitch" ? 0.025 * r : 0)]], key + "lid", { width: L * 1.2, amp: 0.8 });
      if (kind === "twitch") {
        const tx = ex + side * 0.17 * r;
        cv.line([[tx, ey - 0.12 * r], [tx + side * 0.05 * r, ey - 0.17 * r]], key + "t1", { width: L * 0.8 });
        cv.line([[tx + side * 0.01 * r, ey + 0.02 * r], [tx + side * 0.07 * r, ey + 0.02 * r]], key + "t2", { width: L * 0.8 });
      }
    } else if (kind === "squint") {
      const d = side; // the point aims at the nose
      cv.line([[ex + d * 0.08 * r, ey - 0.08 * r], [ex - d * 0.07 * r, ey], [ex + d * 0.08 * r, ey + 0.08 * r]], key, { width: L * 1.4, amp: 1.0 });
    } else if (kind === "closed") {
      cv.line(D.smooth([[ex - 0.08 * r, ey], [ex, ey + 0.04 * r], [ex + 0.08 * r, ey]], false, 5), key, { width: L * 1.2, amp: 0.8 });
    }
  }

  function mouth(cv, mx, my, kind, r, sx, sy, open) {
    if (kind === "smile") {
      cv.line(D.smooth([[mx - 0.12 * r, my - 0.03 * r], [mx, my + 0.06 * r], [mx + 0.12 * r, my - 0.03 * r]], false, 6), "mouth", { width: L * 1.1 });
    } else if (kind === "flat") {
      cv.line([[mx - 0.08 * r, my], [mx + 0.09 * r, my + 0.006 * r]], "mouth", { width: L * 1.1 });
    } else if (kind === "o") {
      cv.dot(mx, my, 0.045 * r, 0.06 * r, "mouth", { fill: C.terra, outline: C.ink, width: L * 0.9 });
    } else if (kind === "O") {
      cv.dot(mx, my + 0.03 * r, 0.085 * r, 0.115 * r, "mouth", { fill: C.ink });
      cv.dot(mx, my + 0.09 * r, 0.05 * r, 0.03 * r, "mouthT", { fill: C.terra });
    } else if (kind === "shout") {
      const rx = (0.13 + 0.14 * open) * r * sx, ry = (0.08 + 0.2 * open) * r * sy;
      const cy = my + 0.07 * r;
      cv.shape(D.ellipse(mx, cy, rx, ry, 40), "mouth", { fill: C.ink });
      cv.shape(D.ellipse(mx, cy + ry * 0.5, rx * 0.6, ry * 0.36, 24), "mouthT", { fill: C.terra, outline: null });
      cv.shape(D.ellipse(mx, cy - ry * 0.72, rx * 0.7, ry * 0.18, 20, Math.PI, 2 * Math.PI), "teeth", { fill: C.light, outline: null });
    } else if (kind === "grit") {
      // the open frown of the sheet: a down-turned mouth showing teeth
      const pts = D.smooth([[mx - 0.13 * r, my + 0.05 * r], [mx - 0.06 * r, my - 0.04 * r], [mx + 0.06 * r, my - 0.04 * r],
        [mx + 0.13 * r, my + 0.05 * r], [mx, my + 0.07 * r]], true, 5);
      cv.shape(pts, "mouth", { fill: C.light, width: L * 1.1 });
      cv.line([[mx - 0.1 * r, my + 0.02 * r], [mx + 0.1 * r, my + 0.02 * r]], "mouthm", { width: L * 0.7 });
    } else if (kind === "wavy") {
      const pts = [];
      for (let k = 0; k < 5; k++) pts.push([mx - 0.1 * r + 0.05 * r * k, my + (k % 2 ? 0.02 : -0.02) * r]);
      cv.line(D.smooth(pts, false, 4), "mouth", { width: L });
    }
  }

  function brows(cv, p) {
    const r = p.r, fx = faceX(p), ey = p.hy + 0.15 * p.r * p.sy;
    const sp = (p.turn > 0.5 ? 0.34 : 0.31) * r * p.sx;
    [-1, 1].forEach((side, k) => {
      const [dy, tilt] = p.brows[k];
      const ex = fx + side * sp + (p.turn < 0.5 && side > 0 ? -0.02 * r : 0);
      const by = ey - 0.29 * r + dy * r;
      const inner = [ex - side * 0.11 * r, by + tilt * 0.09 * r];
      const outer = [ex + side * 0.11 * r, by - tilt * 0.09 * r];
      const mid = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 0.025 * r];
      cv.line(D.smooth([outer, mid, inner], false, 5), "brow" + side, { width: L * 1.25, amp: 0.8 });
    });
  }

  function face(cv, p) {
    const r = p.r, sx = p.sx, sy = p.sy, fx = faceX(p);
    const ey = p.hy + 0.15 * r * sy;
    const gx = p.gaze[0] * r, gy = p.gaze[1] * r;
    const sp = (p.turn > 0.5 ? 0.34 : 0.31) * r * sx;
    [-1, 1].forEach((side, k) => {
      const ex = fx + side * sp + (p.turn < 0.5 && side > 0 ? -0.02 * r : 0);
      eye(cv, ex, ey, p.eyes[k], r, side, gx, gy, "eye" + side);
      if (p.blush) {
        const bx = ex + side * 0.06 * r, by = ey + 0.2 * r;
        for (let j = 0; j < 3; j++) {
          const x = bx + (j - 1) * 0.05 * r;
          cv.line([[x + 0.016 * r, by - 0.032 * r], [x - 0.016 * r, by + 0.032 * r]], "bl" + side + j,
            { color: C.terra, width: L * 0.8, amp: 0.5 });
        }
      }
    });
    // tiny nose hint (three-quarter)
    if (p.turn < 0.5) cv.line([[fx + 0.04 * r, ey + 0.14 * r], [fx + 0.08 * r, ey + 0.19 * r]], "nose", { width: L * 0.7, amp: 0.4 });
    mouth(cv, fx + 0.02 * r, p.hy + 0.5 * r * sy, p.mouth, r, sx, sy, p.mouthOpen);
    if (p.sweat) {
      const x = p.hx - (0.62 - 0.4 * p.turn) * r * sx, y = p.hy + 0.25 * r;
      const drop = [[x, y - 0.13 * r], [x + 0.06 * r, y + 0.02 * r], [x + 0.04 * r, y + 0.07 * r], [x, y + 0.09 * r],
        [x - 0.04 * r, y + 0.07 * r], [x - 0.06 * r, y + 0.02 * r]];
      cv.shape(D.smooth(drop, true, 4), "sweat", { fill: C.light, width: L * 0.8 });
    }
  }

  // ---- things stuck in the exploded hair (scenes 7-8) -------------------------
  function accessories(cv, p) {
    const r = p.r, hx = p.hx, hy = p.hy;
    const hr = D.hairRadius(p);
    if (p.sticky) {
      const cx = hx - 0.75 * r, cy = hy - 0.95 * hr / 1.22, s = 0.2 * r;
      const sq = D.rot([[cx - s, cy - s], [cx + s, cy - s], [cx + s, cy + s * 0.5], [cx + s * 0.5, cy + s], [cx - s, cy + s]], cx, cy, -0.3);
      cv.shape(sq, "sticky", { fill: C.sticky });
      const fold = D.rot([[cx + s, cy + s * 0.5], [cx + s * 0.5, cy + s * 0.5], [cx + s * 0.5, cy + s]], cx, cy, -0.3);
      cv.shape(fold, "stickyf", { fill: C.light, width: L * 0.8 });
      // a little drawn heart, like the sheet
      const h = [];
      for (let k = 0; k < 30; k++) {
        const t = (k / 30) * 2 * Math.PI;
        h.push([cx - 0.02 * r + 0.006 * r * 16 * Math.pow(Math.sin(t), 3),
          cy - 0.01 * r - 0.006 * r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
      }
      cv.shape(D.rot(h, cx, cy, -0.3), "stickyh", { fill: null, outline: C.terra, width: L * 0.8, amp: 0.4 });
    }
    if (p.glasses) {
      const cx = hx + 0.05 * r, cy = hy - 0.98 * hr / 1.22;
      [-1, 1].forEach((side, k) => {
        const lc = D.rot([[cx + side * 0.25 * r, cy]], cx, cy, -0.3)[0];
        cv.shape(D.ellipse(lc[0], lc[1], 0.17 * r, 0.15 * r, 30), "lens" + k, { fill: null, width: L * 1.7 });
      });
      cv.line(D.rot([[cx - 0.08 * r, cy - 0.02 * r], [cx, cy - 0.07 * r], [cx + 0.08 * r, cy - 0.02 * r]], cx, cy, -0.3), "bridge", { width: L * 1.5 });
      cv.line(D.rot([[cx + 0.42 * r, cy - 0.02 * r], [cx + 0.62 * r, cy + 0.1 * r]], cx, cy, -0.3), "garm", { width: L * 1.5 });
    }
    if (p.sock !== null && p.sock !== undefined) {
      const t = p.sock;
      const fx = faceX(p);
      const ex = fx + 0.34 * r * p.sx; // her right-hand eye (viewer right)
      const top = hy - hr / 1.22 * 1.05;
      const a = [[hx + 0.25 * r, top - 0.1 * r], [hx + 0.55 * r, top - 0.05 * r], [hx + 0.8 * r, top + 0.05 * r], [hx + 1.08 * r, top + 0.02 * r]];
      const b = [[hx + 0.55 * r, top + 0.05 * r], [ex + 0.22 * r, hy - 0.55 * r], [ex + 0.06 * r, hy - 0.08 * r], [ex - 0.03 * r, hy + 0.2 * r]];
      const e = D.ease(t);
      const ctrl = a.map((q, k) => [q[0] + (b[k][0] - q[0]) * e, q[1] + (b[k][1] - q[1]) * e]);
      const path = D.smooth(ctrl, false, 10);
      const w = 0.2 * r;
      const wp = cv.tube(path, "sock", C.light, w, { amp: 1.2 });
      // terracotta stripes along the sock
      let acc = 0, cur = [], stripe = 0;
      const band = 0.1 * r;
      for (let i = 1; i < wp.length; i++) {
        acc += Math.hypot(wp[i][0] - wp[i - 1][0], wp[i][1] - wp[i - 1][1]);
        cur.push(wp[i - 1]);
        if (acc >= band) {
          cur.push(wp[i]);
          if (stripe % 2 === 0) cv.raw(`<path d="M${cur.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L")}" fill="none" stroke="${C.terra}" stroke-width="${w.toFixed(1)}" stroke-linecap="butt"/>`);
          cur = [];
          acc = 0;
          stripe++;
        }
      }
      const tip = wp[wp.length - 1];
      cv.dot(tip[0], tip[1], w * 0.45, w * 0.45, "toe", { fill: C.terra, outline: null });
    }
  }

  // ---- arms ------------------------------------------------------------------
  // arm poses: [elbow, hand, kind] for the back arm (viewer left) then the front arm
  const ARMS = {
    rest: [[[400, 1178], [505, 1184], "flat"], [[590, 1110], [618, 1178], "flat"]],
    type: [[[410, 1180], [585, 1160], "flat"], [[600, 1105], [700, 1146], "flat"]],
    up: [[[178, 1000], [192, 805], "up"], [[630, 1010], [655, 815], "up"]],
    fists: [[[400, 1178], [500, 1180], "fist"], [[590, 1110], [615, 1176], "fist"]],
    slamUp: [[[400, 1178], [500, 1180], "fist"], [[640, 1060], [600, 915], "fist"]],
    slamDown: [[[400, 1178], [500, 1180], "fist"], [[610, 1105], [590, 1182], "fist"]],
    poke: [[[400, 1178], [500, 1182], "flat"], [[610, 1070], [690, 1100], "poke"]],
    limp: [[[360, 1185], [450, 1194], "flat"], [[560, 1120], [560, 1194], "flat"]],
  };

  function hand(cv, x, y, kind, r, k) {
    if (kind === "fist") {
      cv.dot(x, y, 0.15 * r, 0.135 * r, "hand" + k, { fill: C.skin, outline: C.ink, width: L });
      for (let j = 0; j < 3; j++)
        cv.line([[x - 0.06 * r + j * 0.06 * r, y - 0.11 * r], [x - 0.055 * r + j * 0.06 * r, y - 0.04 * r]], "kn" + k + j, { width: L * 0.6 });
    } else if (kind === "poke") {
      // fist with the index finger stabbing down at the keyboard
      cv.tube([[x + 0.04 * r, y], [x + 0.1 * r, y + 0.2 * r]], "fing" + k, C.skin, 0.06 * r, { amp: 0.5 });
      cv.dot(x, y, 0.13 * r, 0.12 * r, "hand" + k, { fill: C.skin, outline: C.ink, width: L });
    } else if (kind === "up") {
      cv.dot(x, y, 0.13 * r, 0.15 * r, "hand" + k, { fill: C.skin, outline: C.ink, width: L });
      for (let j = 0; j < 4; j++) {
        const a = -Math.PI / 2 + (j - 1.5) * 0.36;
        cv.tube([[x + Math.cos(a) * 0.12 * r, y + Math.sin(a) * 0.13 * r], [x + Math.cos(a) * 0.24 * r, y + Math.sin(a) * 0.26 * r]],
          "fg" + k + j, C.skin, 0.04 * r, { amp: 0.4, ow: L * 0.8 });
      }
      cv.dot(x, y, 0.12 * r, 0.14 * r, "palm" + k, { fill: C.skin, outline: null });
    } else {
      cv.dot(x, y, 0.14 * r, 0.1 * r, "hand" + k, { fill: C.skin, outline: C.ink, width: L });
      cv.line([[x + 0.05 * r, y - 0.02 * r], [x + 0.1 * r, y + 0.03 * r]], "thumb" + k, { width: L * 0.6, amp: 0.4 });
    }
  }

  D.drawArms = function (cv, p) {
    const r = p.r, sh = D.shoulders(p);
    const pose = typeof p.arms === "string" ? ARMS[p.arms] : p.arms;
    const dxh = p.hx - 395;
    [sh.L, sh.R].forEach((s, k) => {
      const [el, hd, kind] = pose[k];
      const lift = (p.lift && p.lift[k]) || 0;
      const e = [el[0] + dxh, el[1] - lift * 0.4];
      const h = [hd[0] + dxh, hd[1] - lift];
      const path = D.smooth([s, e, h], false, 8);
      cv.tube(path, "arm" + k, C.terra, 0.4 * r, { amp: 1.4 });
      [-0.07, 0.07].forEach((o, j) => {
        const ln = [];
        for (let q = 2; q < path.length - 5; q++) {
          const q0 = path[q - 1], q1 = path[q + 1];
          const an = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]);
          ln.push([path[q][0] - Math.sin(an) * o * r, path[q][1] + Math.cos(an) * o * r]);
        }
        if (ln.length > 2) cv.line(ln, "sknit" + k + j, { color: C.terraDeep, width: L * 0.5, amp: 1.0 });
      });
      // ribbed cuff
      const n = path.length;
      const c0 = path[Math.max(0, n - 6)];
      const ang = Math.atan2(h[1] - c0[1], h[0] - c0[0]);
      const cx = h[0] - Math.cos(ang) * 0.13 * r, cy = h[1] - Math.sin(ang) * 0.13 * r;
      const nx = -Math.sin(ang), ny = Math.cos(ang);
      cv.line([[cx + nx * 0.19 * r, cy + ny * 0.19 * r], [cx - nx * 0.19 * r, cy - ny * 0.19 * r]], "cuff" + k, { width: L * 0.8, amp: 0.6 });
      hand(cv, h[0], h[1], kind, r, k);
      if (k === 1) {
        const wx = h[0] - Math.cos(ang) * 0.1 * r, wy = h[1] - Math.sin(ang) * 0.1 * r;
        cv.line([[wx + nx * 0.1 * r, wy + ny * 0.1 * r], [wx - nx * 0.1 * r, wy - ny * 0.1 * r]], "watch", { width: L * 2.6, amp: 0.4 });
      }
    });
  };

  D.handPos = function (p, k) {
    const pose = typeof p.arms === "string" ? ARMS[p.arms] : p.arms;
    const lift = (p.lift && p.lift[k]) || 0;
    return [pose[k][1][0] + p.hx - 395, pose[k][1][1] - lift];
  };

  D.drawCharacter = function (cv, p) {
    chairBack(cv, p);
    hairBack(cv, p);
    body(cv, p);
    head(cv, p);
    face(cv, p);
    fringe(cv, p);
    brows(cv, p);
    accessories(cv, p);
  };
})();
