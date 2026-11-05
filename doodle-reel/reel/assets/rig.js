// Shared helpers for every scene: seeded randomness, the 10-drawings-a-second grid,
// hand-drawn wobbly SVG shapes (3 variants that "boil"), and the shared cue times.
// Everything is a function of timeline time, so every render matches.
(function () {
  const FPS_DRAW = 10; // drawings per second
  const STEP = 1 / FPS_DRAW;

  function rng(seed) {
    let a = (seed * 2654435761) >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Shared cue list (whole-Reel seconds). Picture and sound both read it.
  function level1() {
    const r = rng(11);
    let t = 6;
    const out = [];
    while (t <= 20) {
      out.push(t / 10);
      t += [1, 2, 2][Math.floor(r() * 3)];
    }
    return out;
  }
  function level2() {
    const out = [];
    for (let t = 104; t <= 116; t++) out.push(t / 10);
    return out;
  }
  const CUES = {
    L1: level1(), // scene 1, light clicks
    L2: level2(), // scene 4, faster and harder
    L3: [18.6, 19.1, 19.7], // scene 6, three heavy stabs
    ENTER: { 1: 2.2, 2: 11.8, 3: 20.2 },
    THUD: 16.2,
    POP: 22.0,
    TICKS: [26.5, 28.5],
    SCENE_START: [0, 4, 7, 10, 14, 18, 21, 25, 30],
  };

  // ---- wobbly line drawing -------------------------------------------------
  function jit(r, a) {
    return (r() * 2 - 1) * a;
  }
  function polyPath(pts, r, amp, closed) {
    const p = pts.map(([x, y]) => [x + jit(r, amp), y + jit(r, amp)]);
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      const mx = (x0 + x1) / 2 + jit(r, amp * 0.6);
      const my = (y0 + y1) / 2 + jit(r, amp * 0.6);
      d += ` Q${mx.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    if (closed) d += " Z";
    return d;
  }
  function line(x0, y0, x1, y1, r, amp = 1.6) {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 40));
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
    return polyPath(pts, r, amp, false);
  }
  function rrect(x, y, w, h, rad, r, amp = 2) {
    const pts = [];
    const k = 6;
    const corner = (cx, cy, a0) => {
      for (let i = 0; i <= k; i++) {
        const a = a0 + (Math.PI / 2) * (i / k);
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
    };
    corner(x + w - rad, y + rad, -Math.PI / 2);
    corner(x + w - rad, y + h - rad, 0);
    corner(x + rad, y + h - rad, Math.PI / 2);
    corner(x + rad, y + rad, Math.PI);
    return polyPath(pts, r, amp, true);
  }
  function ellipse(cx, cy, rx, ry, r, amp = 2, n = 18) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return polyPath(pts, r, amp, true);
  }
  function cloud(cx, cy, rx, ry, r, amp = 2) {
    const pts = [];
    const bumps = 9;
    const n = bumps * 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const b = 1 + 0.09 * Math.abs(Math.sin((a * bumps) / 2));
      pts.push([cx + Math.cos(a) * rx * b, cy + Math.sin(a) * ry * b]);
    }
    return polyPath(pts, r, amp, true);
  }

  // Fill an element with N variants of a drawing (class "v v0", "v v1", ...).
  // draw(r, i) returns SVG markup for one variant.
  function variants(el, seed, draw, n = 3) {
    let html = "";
    for (let i = 0; i < n; i++) {
      html += `<g class="v v${i}" style="opacity:${i === 0 ? 1 : 0}">${draw(rng(seed * 31 + i * 7 + 1), i)}</g>`;
    }
    el.innerHTML = html;
  }

  // Make the line boil: show one variant per drawing on the 10/s grid.
  function boilLines(tl, scope, t0, t1, seed = 1) {
    const groups = Array.from(document.querySelectorAll(scope)).filter((g) => g.querySelector(".v"));
    groups.forEach((g, gi) => {
      const vs = g.querySelectorAll(":scope > .v");
      if (!vs.length) return;
      const r = rng(seed * 97 + gi);
      let prev = -1;
      for (let t = t0; t < t1 - 1e-6; t += STEP) {
        let k = Math.floor(r() * vs.length);
        if (k === prev) k = (k + 1) % vs.length;
        prev = k;
        vs.forEach((v, i) => tl.set(v, { opacity: i === k ? 1 : 0 }, +t.toFixed(3)));
      }
    });
  }

  // Stepped transform track on the 10/s grid. fn(t, r) returns {x, y, rotation, scaleX, scaleY}.
  function steps(tl, sel, t0, t1, fn, seed = 1) {
    const r = rng(seed);
    for (let t = t0; t < t1 - 1e-6; t += STEP) {
      const tt = +t.toFixed(3);
      tl.set(sel, fn(tt, r), tt);
    }
  }

  // Gentle hand-held "boil" for a cut-out pose: tiny shifts every drawing.
  function jitter(amp = 2.5, rot = 0.35) {
    return (t, r) => ({ x: jit(r, amp), y: jit(r, amp), rotation: jit(r, rot) });
  }

  // Snap to the drawing grid.
  function grid(t) {
    return Math.round(t * FPS_DRAW) / FPS_DRAW;
  }

  // ---- the chatbot panel (no text: only grey lines and boxes) -------------
  // Builds groups inside an <svg viewBox="0 0 820 290">: <p>-frame, <p>-user, <p>-bot,
  // <p>-d0..d(n-1) (typed dashes in the input bar), <p>-cursor. Each one boils.
  const INK = "#2B2B2B";
  const GREY = "#A9A39A";
  function buildPanel(svg, p, seed, nDashes = 8) {
    const S = `stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
    const G = `stroke="${GREY}" stroke-width="9" stroke-linecap="round" fill="none"`;
    const groups = [];
    const add = (id, draw) => groups.push([id, draw]);
    add("frame", (r) =>
      `<path d="${rrect(8, 8, 804, 274, 30, r, 2.2)}" fill="#FFFCF6" ${S}/>` +
      [0, 1, 2].map((i) => `<path d="${ellipse(40 + i * 26, 34, 7, 7, r, 1, 10)}" fill="none" ${S} stroke-width="3"/>`).join(""),
    );
    add("user", (r) =>
      `<path d="${rrect(470, 22, 310, 42, 21, r, 2)}" fill="#EDC7B3" ${S}/>` +
      `<path d="${line(500, 43, 700, 43, r, 1.2)}" stroke="#B9785A" stroke-width="9" stroke-linecap="round" fill="none"/>`,
    );
    add("bot", (r) =>
      `<path d="${rrect(36, 78, 560, 124, 22, r, 2)}" fill="#EFEBE4" ${S}/>` +
      [430, 480, 380, 450, 300]
        .map((w, i) => `<path d="${line(64, 98 + i * 22, 64 + w, 98 + i * 22, r, 1.2)}" ${G} stroke-width="8"/>`)
        .join(""),
    );
    add("bar", (r) =>
      `<path d="${rrect(30, 216, 760, 52, 26, r, 2)}" fill="#FFFFFF" ${S}/>` +
      `<path d="${ellipse(752, 242, 17, 17, r, 1.2, 12)}" fill="#C4623E" ${S} stroke-width="3"/>`,
    );
    for (let i = 0; i < nDashes; i++) {
      const x = 62 + i * 76;
      const w = 44 + ((i * 37) % 23);
      add("d" + i, (r) => `<path d="${line(x, 242, x + w, 242, r, 1.4)}" ${G}/>`);
    }
    add("cursor", (r) => `<path d="${line(0, 226, 0, 258, r, 1)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>`);
    svg.innerHTML = groups.map(([id]) => `<g id="${p}-${id}" class="boil"></g>`).join("");
    groups.forEach(([id, draw], gi) => variants(svg.querySelector("#" + p + "-" + id), seed * 13 + gi, draw));
    return { dashX: (i) => 62 + i * 76 };
  }

  // ---- comic marks, drawn as strokes (no letters) --------------------------
  const RED = "#D63A2E";
  const stroke = (c, w) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const MARKS = {
    // "?!" drawn with strokes, in a 160x160 box
    qbang: (r) =>
      `<path d="${polyPath([[22, 46], [34, 22], [62, 16], [82, 34], [76, 60], [56, 74], [54, 100]], r, 2.5, false)}" ${stroke(INK, 11)}/>` +
      `<path d="${ellipse(54, 130, 6, 6, r, 1, 8)}" fill="${INK}" ${stroke(INK, 5)}/>` +
      `<path d="${line(118, 18, 112, 98, r, 2.5)}" ${stroke(INK, 12)}/>` +
      `<path d="${ellipse(111, 130, 6.5, 6.5, r, 1, 8)}" fill="${INK}" ${stroke(INK, 5)}/>`,
    // short surprise lines fanning out, 200x120 box
    pop: (r, c = INK) =>
      [[30, 100, 10, 70], [70, 60, 60, 20], [120, 56, 130, 16], [165, 96, 190, 66]]
        .map(([a, b, cc, d]) => `<path d="${line(a, b, cc, d, r, 2)}" ${stroke(c, 8)}/>`)
        .join(""),
    // anger vein mark, 120x120 box
    anger: (r) =>
      [[[52, 18], [50, 48], [20, 50]], [[68, 18], [70, 48], [100, 50]], [[52, 102], [50, 72], [20, 70]], [[68, 102], [70, 72], [100, 70]]]
        .map((pts) => `<path d="${polyPath(pts, r, 2.5, false)}" ${stroke(RED, 11)}/>`)
        .join(""),
    // impact burst: radial red strokes, 400x400 box
    burst: (r) => {
      let s = "";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + jit(r, 0.12);
        const r0 = 120 + jit(r, 14);
        const r1 = 185 + jit(r, 18);
        s += `<path d="${line(200 + Math.cos(a) * r0, 200 + Math.sin(a) * r0, 200 + Math.cos(a) * r1, 200 + Math.sin(a) * r1, r, 3)}" ${stroke(i % 2 ? INK : RED, 12)}/>`;
      }
      return s;
    },
    // empty thought bubble (a shape, no text), 460x360 box
    thought: (r) =>
      `<path d="${cloud(260, 140, 170, 105, r, 3)}" fill="#FFFCF6" ${stroke(INK, 6)}/>` +
      `<path d="${ellipse(110, 285, 26, 20, r, 2, 12)}" fill="#FFFCF6" ${stroke(INK, 5)}/>` +
      `<path d="${ellipse(58, 335, 14, 11, r, 1.5, 10)}" fill="#FFFCF6" ${stroke(INK, 5)}/>`,
    // sweat drop, 60x90 box
    sweat: (r) =>
      `<path d="${polyPath([[30, 6], [44, 46], [42, 70], [30, 82], [18, 70], [16, 46]], r, 1.5, true)}" fill="#BFD9E6" ${stroke(INK, 5)}/>`,
    // soft floor shadow, 700x60 box
    shadow: (r) => `<path d="${ellipse(350, 30, 330, 24, r, 3, 20)}" fill="#E9DDCB"/>`,
  };
  function mark(el, kind, seed, ...args) {
    variants(el, seed, (r) => MARKS[kind](r, ...args));
  }

  // Pop on the drawing grid: small -> overshoot -> settle (stepped, no smooth ease).
  function popIn(tl, sel, t, big = 1.18) {
    tl.set(sel, { opacity: 1, scale: 0.55, transformOrigin: "50% 50%" }, t);
    tl.set(sel, { scale: big }, +(t + STEP).toFixed(3));
    tl.set(sel, { scale: 0.94 }, +(t + 2 * STEP).toFixed(3));
    tl.set(sel, { scale: 1 }, +(t + 3 * STEP).toFixed(3));
  }
  function hide(tl, sel, t) {
    tl.set(sel, { opacity: 0 }, t);
  }

  window.Rig = {
    buildPanel,
    popIn,
    hide,
    mark,
    RED,
    INK, rng, CUES, STEP, line, rrect, ellipse, cloud, polyPath, variants, boilLines, steps, jitter, grid, jit };
})();
