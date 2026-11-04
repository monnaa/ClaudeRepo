"""The character rig: one young woman, same proportions and outfit in every scene.

Pose params (dict p) come from scenes.pose(). Only hair level and expression change.
"""
import math
import random

from style import (CHARCOAL, HAIR, LIGHT, MUSTARD, SKIN, TERRA, LINE,
                   ellipse_pts, rot_pts, smooth)

BODY_Y = 900  # top of the sweater (shoulders line)

# hair level 1..5: neat waves, lifting, frizzy, very frizzy, exploded
HAIR_SPREAD = [1.0, 1.04, 1.12, 1.22, 1.34]
HAIR_AMP = [0.045, 0.07, 0.11, 0.16, 0.22]
HAIR_BUMPS = [13, 15, 19, 23, 27]
HAIR_POW = [1.0, 1.0, 1.5, 2.0, 2.6]
STRAND_COUNT = [0, 1, 3, 5, 8]

_srng = random.Random(4242)
STRANDS = [(-math.pi / 2 - 0.25, 0.55, 1)]  # level-2 "lifted lock" on top
for _ in range(11):
    STRANDS.append((_srng.uniform(-math.pi + 0.15, -0.15), _srng.uniform(0.28, 0.5), _srng.choice((-1, 1))))


def hair_radius(p):
    lvl = p["hair"]
    return p["r"] * 1.2 * HAIR_SPREAD[lvl - 1] * (1 + HAIR_AMP[lvl - 1])


def hair_back(cv, p):
    hx, hy, r, lvl = p["hx"], p["hy"], p["r"], p["hair"]
    spread, amp = HAIR_SPREAD[lvl - 1], HAIR_AMP[lvl - 1] * r
    bumps, power = HAIR_BUMPS[lvl - 1], HAIR_POW[lvl - 1]
    rng = random.Random(500 + lvl)
    jit = [rng.uniform(0.55, 1.35) for _ in range(bumps)]
    cx, cy = hx, hy + 0.04 * r
    pts = []
    n = 200
    for i in range(n):
        th = 2 * math.pi * i / n - math.pi / 2
        c, s = math.cos(th), math.sin(th)
        rx = r * 1.2 * spread
        ry = r * (1.16 if s < 0 else 1.22) * spread
        bx = rx * c * (1 - 0.1 * max(0.0, s))
        by = ry * s
        u = (th + math.pi / 2) * bumps / (2 * math.pi)
        k = int(u) % bumps
        bump = jit[k] * abs(math.sin(math.pi * (u - int(u)))) ** power
        pts.append((cx + bx + c * amp * bump, cy + by + s * amp * bump))
    # strands behind the silhouette
    base_r = r * 1.2 * spread
    for idx in range(STRAND_COUNT[lvl - 1]):
        ang, ln, side = STRANDS[idx]
        ln = ln * r * (0.55 + 0.1 * (lvl - 2))
        sx0 = cx + math.cos(ang) * base_r * 0.85
        sy0 = cy + math.sin(ang) * base_r * 0.85
        spts = []
        for k in range(9):
            t = k / 8
            d = base_r * 0.15 + ln * t
            lat = side * 0.45 * ln * math.sin(1.7 * math.pi * t) * t
            spts.append((sx0 + math.cos(ang) * d - math.sin(ang) * lat,
                         sy0 + math.sin(ang) * d + math.cos(ang) * lat))
        cv.tube(spts, f"strand{idx}", HAIR, 0.085 * r, amp=1.0 + 0.3 * lvl)
    cv.shape(pts, "hairback", fill=HAIR, amp=1.6 + 0.5 * lvl, step=6)


def body(cv, p):
    bx, r = p["bx"], p["r"]
    y0 = BODY_Y + p.get("body_dy", 0)
    ctrl = [(bx - 0.4 * r, y0), (bx - 0.78 * r, y0 + 0.06 * r), (bx - 1.0 * r, y0 + 0.32 * r),
            (bx - 1.06 * r, y0 + 0.8 * r), (bx - 1.08 * r, 1205), (bx + 1.08 * r, 1205),
            (bx + 1.06 * r, y0 + 0.8 * r), (bx + 1.0 * r, y0 + 0.32 * r), (bx + 0.78 * r, y0 + 0.06 * r),
            (bx + 0.4 * r, y0)]
    cv.shape(smooth(ctrl, closed=True, samples=6), "sweater", fill=TERRA)
    # neck + collar
    hx, hy = p["hx"], p["hy"]
    neck = [(hx - 0.17 * r, hy + 0.6 * r), (hx + 0.17 * r, hy + 0.6 * r),
            (bx + 0.3 * r, y0 + 0.02 * r), (bx, y0 + 0.17 * r), (bx - 0.3 * r, y0 + 0.02 * r)]
    cv.shape(neck, "neck", fill=SKIN, outline=None)
    cv.line([(hx - 0.17 * r, hy + 0.75 * r), (bx - 0.2 * r, y0 + 0.02 * r)], "neckl")
    cv.line([(hx + 0.17 * r, hy + 0.75 * r), (bx + 0.2 * r, y0 + 0.02 * r)], "neckr")
    cv.line(smooth([(bx - 0.42 * r, y0), (bx, y0 + 0.2 * r), (bx + 0.42 * r, y0)], samples=8), "collar")
    cv.line(smooth([(bx - 0.36 * r, y0 + 0.06 * r), (bx, y0 + 0.26 * r), (bx + 0.36 * r, y0 + 0.06 * r)],
                   samples=8), "collar2", width=LINE * 0.7)
    for side in (-1, 1):
        cv.dot(bx + side * 0.68 * r, y0 + 0.13 * r, 0.065 * r, 0.065 * r, f"btn{side}",
               fill=MUSTARD, outline=CHARCOAL, width=LINE * 0.8)


def head(cv, p):
    hx, hy, r, sx, sy = p["hx"], p["hy"], p["r"], p["sx"], p["sy"]
    cv.shape(ellipse_pts(hx, hy, r * sx, r * 0.96 * sy, 64), "head", fill=SKIN)


def fringe(cv, p):
    hx, hy, r, sx, sy, lvl = p["hx"], p["hy"], p["r"], p["sx"], p["sy"], p["hair"]
    look = p["look"]
    amp = (0.02 + 0.03 * (lvl - 1)) * r
    pts = []
    n = 48
    for i in range(n + 1):
        th = math.pi - 0.3 + (math.pi + 0.6) * i / n
        bump = abs(math.sin(th * (7 + 2 * lvl))) ** (1 + 0.3 * lvl)
        rr = 1.07 + amp / r * bump
        pts.append((hx + rr * r * sx * math.cos(th), hy + rr * 0.97 * r * sy * math.sin(th)))
    icx, icy = hx + 0.1 * look * r * sx, hy + 0.3 * r * sy
    for i in range(n + 1):
        ph = -0.02 - (math.pi - 0.04) * i / n
        scal = 0.07 * abs(math.sin(ph * 6 + 0.4))
        pts.append((icx + 0.93 * r * sx * math.cos(ph), icy + (0.72 - scal) * r * sy * math.sin(ph)))
    cv.shape(pts, "fringe", fill=HAIR, amp=1.4 + 0.4 * lvl)
    # two wavy lines on the fringe to read as waves
    for k, off in enumerate((-0.35, 0.3)):
        x0 = hx + off * r * sx
        cv.line(smooth([(x0 - 0.05 * r, hy - 0.9 * r * sy), (x0 + 0.08 * r, hy - 0.7 * r * sy),
                        (x0 - 0.02 * r, hy - 0.5 * r * sy)], samples=5), f"wave{k}",
                color=CHARCOAL, width=LINE * 0.7)


def _eye(cv, ex, ey, kind, r, side, gx, gy, key):
    if kind == "dot":
        cv.dot(ex + gx, ey + gy, 0.06 * r, 0.085 * r, key)
        cv.dot(ex + gx + 0.02 * r, ey + gy - 0.03 * r, 0.018 * r, 0.018 * r, key + "h", fill=LIGHT)
    elif kind == "wide":
        cv.dot(ex, ey, 0.11 * r, 0.14 * r, key, fill=LIGHT, outline=CHARCOAL, width=LINE * 0.9)
        cv.dot(ex + gx * 1.4, ey + gy * 1.4, 0.04 * r, 0.055 * r, key + "p")
    elif kind in ("half", "twitch"):
        s = 0.8 if kind == "twitch" else 1.0
        oy = -0.03 * r if kind == "twitch" else 0
        pts = ellipse_pts(ex + gx, ey + oy, 0.075 * r * s, 0.07 * r * s, 16, 0, math.pi)
        cv.shape(pts, key, fill=CHARCOAL, outline=None, amp=0.6)
        cv.line([(ex - 0.11 * r, ey + oy), (ex + 0.11 * r, ey + oy - (0.02 * r if kind == "twitch" else 0))],
                key + "lid", width=LINE * 1.2, amp=0.8)
        if kind == "twitch":
            tx = ex - side * 0.17 * r
            cv.line([(tx, ey - 0.12 * r), (tx - side * 0.05 * r, ey - 0.17 * r)], key + "t1", width=LINE * 0.8)
            cv.line([(tx + side * 0.01 * r, ey + 0.02 * r), (tx - side * 0.06 * r, ey + 0.02 * r)], key + "t2",
                    width=LINE * 0.8)
    elif kind == "squint":
        d = -side  # point toward the face centre
        cv.line([(ex - d * 0.08 * r, ey - 0.08 * r), (ex + d * 0.07 * r, ey), (ex - d * 0.08 * r, ey + 0.08 * r)],
                key, width=LINE * 1.4, amp=1.0)
    elif kind == "closed":
        cv.line(smooth([(ex - 0.08 * r, ey), (ex, ey + 0.035 * r), (ex + 0.08 * r, ey)], samples=5), key,
                width=LINE * 1.2, amp=0.8)


def _mouth(cv, mx, my, kind, r, sx, sy, open_, key):
    if kind == "smile":
        cv.line(smooth([(mx - 0.13 * r, my - 0.03 * r), (mx, my + 0.07 * r), (mx + 0.13 * r, my - 0.03 * r)],
                       samples=6), key, width=LINE * 1.1)
    elif kind == "flat":
        cv.line([(mx - 0.08 * r, my), (mx + 0.09 * r, my + 0.005 * r)], key, width=LINE * 1.1)
    elif kind == "frown":
        cv.line(smooth([(mx - 0.1 * r, my + 0.04 * r), (mx, my - 0.02 * r), (mx + 0.1 * r, my + 0.04 * r)],
                       samples=6), key, width=LINE * 1.1)
    elif kind == "o":
        cv.dot(mx, my, 0.045 * r, 0.06 * r, key)
    elif kind == "O":
        cv.dot(mx, my + 0.02 * r, 0.09 * r, 0.12 * r, key, fill=CHARCOAL, outline=CHARCOAL)
        cv.dot(mx, my + 0.09 * r, 0.05 * r, 0.03 * r, key + "t", fill=TERRA)
    elif kind == "shout":
        rx, ry = (0.12 + 0.14 * open_) * r * sx, (0.08 + 0.2 * open_) * r * sy
        cy = my + 0.06 * r
        cv.shape(ellipse_pts(mx, cy, rx, ry, 40), key, fill=CHARCOAL)
        cv.shape(ellipse_pts(mx, cy + ry * 0.55, rx * 0.55, ry * 0.32, 24), key + "t", fill=TERRA, outline=None)
    elif kind == "grit":
        pts = [(mx - 0.15 * r, my - 0.05 * r), (mx + 0.15 * r, my - 0.05 * r),
               (mx + 0.13 * r, my + 0.05 * r), (mx - 0.13 * r, my + 0.05 * r)]
        cv.shape(pts, key, fill=LIGHT)
        cv.line([(mx - 0.14 * r, my), (mx + 0.14 * r, my)], key + "m", width=LINE * 0.8)
        for k, x in enumerate((-0.05, 0.05)):
            cv.line([(mx + x * r, my - 0.045 * r), (mx + x * r, my + 0.045 * r)], key + f"v{k}", width=LINE * 0.7)
    elif kind == "wavy":
        pts = [(mx - 0.1 * r + 0.05 * r * k, my + (0.02 if k % 2 else -0.02) * r) for k in range(5)]
        cv.line(smooth(pts, samples=4), key, width=LINE)


def face(cv, p):
    hx, hy, r, sx, sy, look = p["hx"], p["hy"], p["r"], p["sx"], p["sy"], p["look"]
    fx = hx + look * 0.22 * r * sx
    ey = hy + 0.12 * r * sy
    gx, gy = p["gaze"][0] * r, p["gaze"][1] * r
    for side, kind, (dy, tilt) in zip((-1, 1), p["eyes"], p["brows"]):
        ex = fx + side * 0.36 * r * sx
        _eye(cv, ex, ey, kind, r, side, gx, gy, f"eye{side}")
        by = ey - 0.31 * r + dy * r
        inner = (ex - side * 0.13 * r, by + tilt * 0.1 * r)
        outer = (ex + side * 0.13 * r, by - tilt * 0.1 * r)
        mid = ((inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 0.025 * r)
        cv.line(smooth([outer, mid, inner], samples=5), f"brow{side}", width=LINE * 1.9, amp=1.0)
        if p.get("blush"):
            bxx, byy = ex + side * 0.05 * r, ey + 0.2 * r
            for k in range(3):
                x = bxx + (k - 1) * 0.05 * r
                cv.line([(x + 0.015 * r, byy - 0.03 * r), (x - 0.015 * r, byy + 0.03 * r)], f"bl{side}{k}",
                        color=TERRA, width=LINE * 0.8, amp=0.6)
    _mouth(cv, fx + 0.02 * r, hy + 0.5 * r * sy, p["mouth"], r, sx, sy, p.get("mouth_open", 1.0), "mouth")
    if p.get("sweat"):
        x, y = hx + 0.88 * r * sx, hy - 0.2 * r
        drop = [(x, y - 0.12 * r), (x + 0.06 * r, y + 0.02 * r), (x + 0.04 * r, y + 0.07 * r), (x, y + 0.09 * r),
                (x - 0.04 * r, y + 0.07 * r), (x - 0.06 * r, y + 0.02 * r)]
        cv.shape(smooth(drop, closed=True, samples=4), "sweat", fill=LIGHT, width=LINE * 0.8)


def accessories(cv, p):
    """Things stuck in the exploded hair (scenes 7-8)."""
    hx, hy, r = p["hx"], p["hy"], p["r"]
    if p.get("sticky"):
        cx, cy, s = hx - 0.72 * r, hy - 1.08 * r, 0.21 * r
        sq = rot_pts([(cx - s, cy - s), (cx + s, cy - s), (cx + s, cy + s * 0.55), (cx + s * 0.55, cy + s),
                      (cx - s, cy + s)], cx, cy, -0.3)
        cv.shape(sq, "sticky", fill=LIGHT)
        fold = rot_pts([(cx + s, cy + s * 0.55), (cx + s * 0.55, cy + s * 0.55), (cx + s * 0.55, cy + s)], cx, cy, -0.3)
        cv.shape(fold, "stickyf", fill=SKIN, width=LINE * 0.8)
    if p.get("glasses"):
        cx, cy = hx + 0.02 * r, hy - 0.8 * r
        for k, side in enumerate((-1, 1)):
            lc = rot_pts([(cx + side * 0.26 * r, cy)], cx, cy, -0.28)[0]
            cv.shape(ellipse_pts(lc[0], lc[1], 0.19 * r, 0.17 * r, 32), f"lens{k}", fill=LIGHT, width=LINE * 1.6)
        br = rot_pts([(cx - 0.08 * r, cy - 0.02 * r), (cx, cy - 0.07 * r), (cx + 0.08 * r, cy - 0.02 * r)], cx, cy, -0.28)
        cv.line(br, "bridge", width=LINE * 1.6)
        arm = rot_pts([(cx + 0.45 * r, cy - 0.02 * r), (cx + 0.66 * r, cy + 0.08 * r)], cx, cy, -0.28)
        cv.line(arm, "garm", width=LINE * 1.6)
    if p.get("sock") is not None:
        t = p["sock"]
        a = [(hx + 0.3 * r, hy - 1.3 * r), (hx + 0.62 * r, hy - 1.18 * r), (hx + 0.86 * r, hy - 1.02 * r),
             (hx + 1.12 * r, hy - 1.06 * r)]
        fx = hx + p["look"] * 0.22 * r * p["sx"] + 0.36 * r
        b = [(hx + 0.22 * r, hy - 1.0 * r), (fx - 0.02 * r, hy - 0.6 * r), (fx + 0.03 * r, hy - 0.02 * r),
             (fx + 0.0 * r, hy + 0.26 * r)]
        e = t * t * (3 - 2 * t)
        ctrl = [(ax + (bx - ax) * e, ay + (by - ay) * e) for (ax, ay), (bx, by) in zip(a, b)]
        path = smooth(ctrl, samples=10)
        width = 0.22 * r
        wp = cv.tube(path, "sock", LIGHT, width, amp=1.2)
        # stripes: alternate terracotta bands along the path
        acc, band, cur = 0.0, 0.11 * r, []
        stripe = 0
        for i in range(1, len(wp)):
            seg = math.dist(wp[i - 1], wp[i])
            acc += seg
            cur.append(wp[i - 1])
            if acc >= band:
                cur.append(wp[i])
                if stripe % 2 == 0:
                    cv.d.line(cv._sc(cur), fill=TERRA, width=int(width * 2), joint="curve")
                cur, acc, stripe = [], 0.0, stripe + 1
        # toe / heel accent
        cv.dot(wp[-1][0], wp[-1][1], width * 0.42, width * 0.42, "toe", fill=TERRA, outline=None)


def arms(cv, p):
    """Arms are drawn after the desk so hands rest on top of it."""
    bx, r = p["bx"], p["r"]
    y0 = BODY_Y + p.get("body_dy", 0)
    dx = bx - 380
    shoulders = ((bx - 0.86 * r, y0 + 0.3 * r), (bx + 0.86 * r, y0 + 0.3 * r))
    for k, ((ex, ey), (hx_, hy_), kind) in enumerate(p["arms"]):
        sh = shoulders[k]
        path = smooth([sh, (ex + dx, ey), (hx_ + dx, hy_)], samples=8)
        cv.tube(path, f"arm{k}", TERRA, 0.2 * r, amp=1.6)
        x, y = hx_ + dx, hy_
        cv.line([(x - 0.12 * r, y - 0.07 * r), (x - 0.02 * r, y - 0.13 * r)], f"cuff{k}", width=LINE * 0.6)
        if kind == "fist":
            cv.dot(x, y, 0.15 * r, 0.14 * r, f"hand{k}", fill=SKIN, outline=CHARCOAL)
            for j in range(2):
                cv.line([(x - 0.05 * r + j * 0.07 * r, y - 0.1 * r), (x - 0.04 * r + j * 0.07 * r, y - 0.02 * r)],
                        f"kn{k}{j}", width=LINE * 0.7)
        elif kind == "poke":
            cv.tube([(x, y), (x + 0.02 * r, y + 0.17 * r)], f"fing{k}", SKIN, 0.055 * r, amp=0.6)
            cv.dot(x, y, 0.12 * r, 0.12 * r, f"hand{k}", fill=SKIN, outline=CHARCOAL)
        elif kind == "up":
            cv.dot(x, y, 0.12 * r, 0.14 * r, f"hand{k}", fill=SKIN, outline=CHARCOAL)
            for j in range(3):
                a = -math.pi / 2 + (j - 1) * 0.45
                cv.line([(x + math.cos(a) * 0.12 * r, y + math.sin(a) * 0.13 * r),
                         (x + math.cos(a) * 0.22 * r, y + math.sin(a) * 0.23 * r)], f"fg{k}{j}",
                        width=LINE * 0.8)
        else:
            cv.dot(x, y, 0.13 * r, 0.11 * r, f"hand{k}", fill=SKIN, outline=CHARCOAL)


def draw_character(cv, p):
    hair_back(cv, p)
    body(cv, p)
    head(cv, p)
    face(cv, p)
    fringe(cv, p)
    # brows sit on top of the fringe edge: redraw them after it
    _brows_only(cv, p)
    accessories(cv, p)


def _brows_only(cv, p):
    hx, hy, r, sx, sy, look = p["hx"], p["hy"], p["r"], p["sx"], p["sy"], p["look"]
    fx = hx + look * 0.22 * r * sx
    ey = hy + 0.12 * r * sy
    for side, (dy, tilt) in zip((-1, 1), p["brows"]):
        ex = fx + side * 0.36 * r * sx
        by = ey - 0.31 * r + dy * r
        inner = (ex - side * 0.13 * r, by + tilt * 0.1 * r)
        outer = (ex + side * 0.13 * r, by - tilt * 0.1 * r)
        mid = ((inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 0.025 * r)
        cv.line(smooth([outer, mid, inner], samples=5), f"brow{side}", width=LINE * 1.9, amp=1.0)
