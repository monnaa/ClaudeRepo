/* Props and effects: desk, mug, notebook, laptop + calm chatbot screen (abstract grey lines only),
   anger marks, "?!", impact, pop lines, empty thought bubble. Plus D.compose(): one drawing. */
(function () {
  const D = window.Doodle;
  const C = D.C;
  const L = D.LINE;

  const DESK_BACK = 1135, DESK_FRONT = 1228;
  const SCREEN = [650, 815, 982, 1118]; // inner screen box
  const ANSWER = [0.92, 0.84, 0.9, 0.62, 0.88, 0.78]; // the one generic grey block

  function desk(cv) {
    cv.shape([[22, DESK_BACK], [1058, DESK_BACK], [1058, DESK_FRONT], [22, DESK_FRONT]], "desktop", { fill: C.light });
    cv.shape([[22, DESK_FRONT], [1058, DESK_FRONT], [1058, DESK_FRONT + 26], [22, DESK_FRONT + 26]], "deskedge", { fill: C.chair });
    [150, 960].forEach((x, k) =>
      cv.shape([[x - 13, DESK_FRONT + 26], [x + 13, DESK_FRONT + 26], [x + 11, 1420], [x - 11, 1420]], "leg" + k, { fill: C.chair }));
  }

  function mug(cv, i) {
    const x0 = 150, x1 = 254, y0 = 1084, y1 = 1192;
    // steam: two soft wavy lines that change every drawing
    for (let k = 0; k < 2; k++) {
      const bx = 186 + k * 34;
      const pts = [];
      for (let j = 0; j <= 6; j++) pts.push([bx + Math.sin(j * 1.3 + k + i * 0.9) * 9, y0 - 18 - j * 14]);
      cv.line(D.smooth(pts, false, 5), "steam" + k, { width: L * 0.7, amp: 1.5 });
    }
    // handle on the left
    cv.line(D.smooth([[x0 + 4, y0 + 28], [x0 - 30, y0 + 34], [x0 - 32, y0 + 64], [x0 + 2, y0 + 78]], false, 6), "mugh", { width: L * 2.6, amp: 1 });
    cv.line(D.smooth([[x0 + 4, y0 + 28], [x0 - 30, y0 + 34], [x0 - 32, y0 + 64], [x0 + 2, y0 + 78]], false, 6), "mughin", { width: L * 0.9, amp: 1, color: C.light });
    const body = [[x0, y0], [x1, y0], [x1 - 3, y1 - 14], [x1 - 18, y1], [x0 + 18, y1], [x0 + 3, y1 - 14]];
    cv.shape(D.smooth(body, true, 4), "mug", { fill: C.light });
    cv.shape(D.ellipse((x0 + x1) / 2, y0 + 2, (x1 - x0) / 2, 9, 30), "mugtop", { fill: C.chair, width: L * 0.8 });
    // terracotta heart
    const cx = (x0 + x1) / 2, cy = y0 + 58, h = [];
    for (let k = 0; k < 32; k++) {
      const t = (k / 32) * 2 * Math.PI;
      h.push([cx + 1.6 * 16 * Math.pow(Math.sin(t), 3) * 0.9, cy - 1.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.9]);
    }
    cv.shape(h, "heart", { fill: null, outline: C.terra, width: L * 1.1, amp: 0.6 });
  }

  function notebook(cv) {
    const pts = [[236, 1176], [470, 1170], [486, 1214], [226, 1220]];
    cv.shape(pts, "note", { fill: C.light });
    for (let k = 0; k < 4; k++) cv.line([[262 + k * 40, 1188 + k * 0.5], [300 + k * 40 + (k === 3 ? -10 : 0), 1188]], "noteline" + k, { color: C.grey, width: L * 0.5, amp: 0.4 });
    for (let k = 0; k < 9; k++) cv.shape(D.ellipse(250 + k * 25, 1173 - k * 0.6, 6, 8, 12), "ring" + k, { fill: null, width: L * 0.6, amp: 0.3 });
    // terracotta pen
    cv.tube([[300, 1206], [440, 1196]], "pen", C.terra, 9, { amp: 0.5, ow: L * 0.7 });
    cv.line([[440, 1196], [458, 1194]], "pentip", { width: L * 1.2, amp: 0.2 });
  }

  function laptop(cv, s) {
    // lid in three-quarter: an affine lean around its bottom-left corner (top edge rises to the right)
    cv.raw('<g transform="matrix(1 -0.09 0.08 1 -91.4 56.3)">');
    cv.shape(D.rrect(626, 792, 1006, 1142, 18), "lid", { fill: C.skin });
    const [x0, y0, x1, y1] = SCREEN;
    cv.shape(D.rrect(x0, y0, x1, y1, 10), "screen", { fill: C.light, width: L * 0.8 });
    // the chatbot: abstract grey lines and boxes only, always calm
    if (s.user) {
      cv.shape(D.rrect(806, 838, 962, 874, 16), "ububble", { fill: C.greySoft, outline: null, amp: 0.7 });
      cv.line([[824, 856], [944, 856]], "uline", { color: C.grey, width: 8, amp: 0.5 });
    }
    const n = Math.min(s.answer || 0, ANSWER.length);
    if (n > 0) {
      const top = 896, h = 26 + 22 * n;
      cv.shape(D.rrect(668, top, 950, top + h, 16), "abubble", { fill: null, outline: C.grey, width: L * 0.7, amp: 0.7 });
      for (let k = 0; k < n; k++) {
        const y = top + 24 + 22 * k;
        cv.line([[688, y], [688 + 240 * ANSWER[k], y]], "ans" + k, { color: C.grey, width: 8, amp: 0.6 });
      }
    }
    cv.shape(D.rrect(668, 1064, 962, 1100, 16), "input", { fill: null, outline: C.grey, width: L * 0.7, amp: 0.8 });
    const inp = s.input || 0;
    if (inp > 0) cv.line([[686, 1082], [686 + 250 * inp, 1082]], "typed", { color: C.grey, width: 9, amp: 0.6 });
    if (s.cursor) {
      const cx = 686 + 250 * inp + 9;
      cv.line([[cx, 1071], [cx, 1094]], "cursor", { color: C.ink, width: 4, amp: 0.2 });
    }
    cv.raw("</g>");
    // base / keyboard, receding to the right
    const yb = (x) => 1144 - 0.09 * (x - 626);
    cv.shape([[612, yb(612)], [1010, yb(1010)], [1050, yb(1010) + 50], [596, yb(612) + 56]], "base", { fill: C.skin });
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 11; k++) {
        const x = 640 - row * 8 + k * 32;
        const y = yb(x) + 13 + row * 13;
        cv.line([[x, y], [x + 19, y - 1.7]], "key" + row + k, { color: C.grey, width: 5.5, amp: 0.3 });
      }
    }
  }

  // red marks: only scenes 3-5
  function vein(cv, cx, cy, s, key, w) {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([qx, qy], k) => {
      const pts = D.smooth([[cx + qx * 0.28 * s, cy + qy * s], [cx + qx * 0.36 * s, cy + qy * 0.36 * s], [cx + qx * s, cy + qy * 0.28 * s]], false, 5);
      cv.line(pts, key + k, { color: C.red, width: w || L * 1.5, amp: 0.9 });
    });
  }
  function spiral(cv, cx, cy, R, key, color) {
    const pts = [];
    for (let k = 0; k <= 40; k++) {
      const a = k * 0.42;
      const rr = R * (1 - k / 46);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8]);
    }
    cv.line(pts, key, { color, width: L * 0.9, amp: 0.8 });
  }
  function ticks(cv, cx, cy, R, a0, a1, n, len, key, color, w) {
    for (let k = 0; k < n; k++) {
      const a = a0 + ((a1 - a0) * k) / Math.max(1, n - 1);
      cv.line([[cx + Math.cos(a) * R, cy + Math.sin(a) * R], [cx + Math.cos(a) * (R + len), cy + Math.sin(a) * (R + len)]], key + k,
        { color, width: w || L * 1.3, amp: 0.7 });
    }
  }
  function cloud(cv, cx, cy, rx, ry, key, bumps) {
    const pts = [];
    for (let i = 0; i < 90; i++) {
      const th = (2 * Math.PI * i) / 90;
      const b = 1 + 0.16 * Math.pow(Math.abs(Math.sin((th * (bumps || 7)) / 2)), 0.6);
      pts.push([cx + rx * b * Math.cos(th), cy + ry * b * Math.sin(th)]);
    }
    cv.shape(pts, key, { fill: C.light });
  }

  function anger(cv, p) {
    const lvl = p.anger;
    if (lvl <= 0) return;
    const r = p.r, hx = p.hx, hy = p.hy, hr = D.hairRadius(p);
    if (lvl === 1) {
      vein(cv, hx + 0.95 * r, hy - 1.0 * r, 0.11 * r, "v1");
      ticks(cv, hx - 0.05 * r, hy - 0.2 * r, hr + 0.05 * r, -1.1, -0.75, 3, 0.15 * r, "at", C.red);
      return;
    }
    vein(cv, hx + 1.05 * r, hy - 1.02 * r, 0.17 * r, "v1", L * 1.8);
    spiral(cv, hx + 0.35 * r, hy - hr - 0.12 * r, 0.16 * r, "spi", C.red);
    if (lvl === 2) {
      ticks(cv, hx - 0.05 * r, hy - 0.2 * r, hr + 0.05 * r, -1.2, -0.6, 4, 0.18 * r, "at", C.red);
      ticks(cv, hx - 0.05 * r, hy - 0.2 * r, hr + 0.05 * r, -2.75, -2.25, 3, 0.15 * r, "al", C.red);
      return;
    }
    ticks(cv, hx - 0.05 * r, hy - 0.1 * r, hr + 0.06 * r, -1.25, -0.2, 6, 0.26 * r, "at", C.red);
    ticks(cv, hx - 0.05 * r, hy - 0.1 * r, hr + 0.06 * r, -2.95, -2.0, 5, 0.24 * r, "al", C.red);
    vein(cv, hx - 1.0 * r, hy - 0.95 * r, 0.12 * r, "v2");
    // puffs of steam on both sides, charcoal outline (like the sheet)
    cloud(cv, hx - hr - 0.02 * r, hy - 0.62 * r, 0.16 * r, 0.12 * r, "puffL", 6);
    cloud(cv, hx + hr + 0.0 * r, hy - 0.7 * r, 0.16 * r, 0.12 * r, "puffR", 6);
  }

  function surprise(cv, p) {
    const r = p.r;
    const u = 0.3 * r;
    const x = p.hx + 1.2 * r, y = p.hy - 1.2 * r;
    const q = [[-0.35, -0.55], [-0.28, -0.82], [0, -0.95], [0.3, -0.84], [0.38, -0.56], [0.2, -0.3], [0.02, -0.12], [0, 0.12]];
    cv.line(D.smooth(q.map(([a, b]) => [x + a * u, y + b * u]), false, 5), "qm", { width: L * 1.9 });
    cv.dot(x, y + 0.4 * u, 0.1 * u, 0.1 * u, "qd");
    const x2 = x + 0.75 * u;
    cv.line([[x2, y - 0.95 * u], [x2 - 0.03 * u, y + 0.12 * u]], "ex", { width: L * 1.9 });
    cv.dot(x2 - 0.03 * u, y + 0.4 * u, 0.1 * u, 0.1 * u, "exd");
    ticks(cv, p.hx, p.hy, D.hairRadius(p) + 0.08 * r, -2.5, -1.75, 3, 0.18 * r, "st", C.ink, L * 1.1);
  }

  function impact(cv, x, y, r) {
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + (Math.PI * k) / 6;
      cv.line([[x + Math.cos(a) * 0.3 * r, y + Math.sin(a) * 0.18 * r], [x + Math.cos(a) * 0.52 * r, y + Math.sin(a) * 0.34 * r]], "imp" + k, { width: L * 1.1 });
    }
    // little shake lines on the desk
    for (let k = 0; k < 3; k++) cv.line([[x - 0.6 * r + k * 0.5 * r, y + 0.22 * r], [x - 0.42 * r + k * 0.5 * r, y + 0.2 * r]], "shk" + k, { width: L * 0.8 });
  }

  function popLines(cv, x, y, r, key) {
    for (let k = 0; k < 4; k++) {
      const a = -Math.PI / 2 + (k - 1.5) * 0.6;
      cv.line([[x + Math.cos(a) * 0.12 * r, y + Math.sin(a) * 0.12 * r], [x + Math.cos(a) * 0.24 * r, y + Math.sin(a) * 0.24 * r]], key + k, { width: L });
    }
  }

  function bubble(cv, grow) {
    const cx = 830, cy = 450;
    cloud(cv, cx, cy, 160 * grow, 110 * grow, "bubble", 9);
    [[690, 590, 22], [656, 632, 14], [636, 664, 9]].forEach(([x, y, rr], k) => {
      if (grow > 0.3 * k) cv.dot(x, y, rr, rr, "trail" + k, { fill: C.light, outline: C.ink, width: L });
    });
  }

  // one drawing of one scene
  D.compose = function (scene, i, p) {
    const cv = new D.Canvas(D.hash("doodle", scene, p.seed === null ? i : p.seed));
    D.drawCharacter(cv, p);
    anger(cv, p);
    if (p.surprise) surprise(cv, p);
    if (p.pop) {
      const r = p.r, hx = p.hx, hy = p.hy;
      [[hx - 0.78 * r, hy - 1.35 * r], [hx + 0.75 * r, hy - 1.45 * r], [hx + 0.05 * r, hy - 1.2 * r]].forEach(([x, y], k) => popLines(cv, x, y, r, "pop" + k));
    }
    desk(cv);
    mug(cv, p.seed === null ? i : p.seed);
    notebook(cv);
    cv.raw('<g transform="translate(-48 0)">');
    laptop(cv, p.screen || {});
    cv.raw("</g>");
    D.drawArms(cv, p);
    if (p.impact) {
      const [x, y] = D.handPos(p, 1);
      impact(cv, x, y + 10, p.r);
    }
    if (p.bubble > 0) bubble(cv, p.bubble);
    return cv.svg(p.zoom);
  };

  // mount helper used by every scene: one paused timeline, drawings swapped on the 10/s grid
  D.mountScene = function (id, scene, svg, poseFn) {
    const dur = D.KEYS.DURATIONS[scene - 1];
    const n = Math.round(dur * 10);
    let shown = -1;
    const draw = (i) => {
      i = Math.max(0, Math.min(n - 1, i));
      if (i === shown) return;
      shown = i;
      svg.innerHTML = D.compose(scene, i, poseFn(i));
    };
    const clock = { t: 0 };
    const tl = gsap.timeline({ paused: true });
    tl.to(clock, {
      t: dur, duration: dur, ease: "none",
      onUpdate: () => draw(Math.floor(clock.t * 10 + 1e-6)),
    }, 0);
    draw(0);
    window.__timelines = window.__timelines || {};
    window.__timelines[id] = tl;
    return tl;
  };
})();
