"""Shared style: palette, seeded noise, wobbly hand-drawn strokes and fills."""
import math
import random
import zlib

from PIL import Image, ImageDraw

W, H = 1080, 1920
SS = 2  # supersampling factor (drawn at 2x, downscaled with Lanczos)
FPS, DPS = 30, 10  # video frames per second, unique drawings per second

SAFE_TOP = int(H * 0.12)        # 230
SAFE_BOTTOM = int(H * 0.78)     # 1497

CHARCOAL = (43, 43, 43)
CREAM = (246, 239, 227)
TERRA = (196, 98, 62)
MUSTARD = (217, 162, 27)
RED = (214, 58, 46)
HAIR = (78, 55, 43)
SKIN = (252, 247, 239)
LIGHT = (255, 252, 246)
GREY = (172, 166, 158)
GREY_SOFT = (214, 209, 201)

LINE = 4.5  # base outline width at 1x


def seed_of(*parts):
    return zlib.crc32("|".join(map(str, parts)).encode())


class Noise:
    """Smooth 2D offset along a path, seeded so a render can be repeated."""

    def __init__(self, seed):
        rng = random.Random(seed)
        self.cx = [(rng.uniform(0.018, 0.05), rng.uniform(0, 6.283), rng.uniform(0.5, 1.0)) for _ in range(3)]
        self.cy = [(rng.uniform(0.018, 0.05), rng.uniform(0, 6.283), rng.uniform(0.5, 1.0)) for _ in range(3)]
        self.hf = (rng.uniform(0.15, 0.3), rng.uniform(0, 6.283))

    def __call__(self, s):
        x = sum(a * math.sin(f * s + p) for f, p, a in self.cx) / 1.7
        y = sum(a * math.sin(f * s + p) for f, p, a in self.cy) / 1.7
        j = 0.18 * math.sin(self.hf[0] * s + self.hf[1])
        return x + j, y - j


def resample(pts, step=7.0, closed=False):
    pts = list(pts)
    if closed:
        pts = pts + [pts[0]]
    out, ss, s = [], [], 0.0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        d = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(d / step))
        for k in range(n):
            t = k / n
            out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
            ss.append(s + d * t)
        s += d
    if not closed:
        out.append(pts[-1])
        ss.append(s)
    return out, ss


def smooth(pts, closed=False, samples=8):
    """Catmull-Rom through control points."""
    pts = list(pts)
    n = len(pts)
    if n < 3:
        return pts
    out = []
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if closed else pts[max(i - 1, 0)]
        p1 = pts[i]
        p2 = pts[(i + 1) % n] if closed else pts[i + 1]
        p3 = pts[(i + 2) % n] if closed else pts[min(i + 2, n - 1)]
        for k in range(samples):
            t = k / samples
            t2, t3 = t * t, t * t * t
            out.append(tuple(
                0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                       + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2)))
    if not closed:
        out.append(pts[-1])
    return out


def ellipse_pts(cx, cy, rx, ry, n=48, a0=0.0, a1=2 * math.pi, rot=0.0):
    cr, sr = math.cos(rot), math.sin(rot)
    out = []
    closed = abs(a1 - a0 - 2 * math.pi) < 1e-6
    m = n if closed else n + 1
    for i in range(m):
        a = a0 + (a1 - a0) * i / n
        x, y = rx * math.cos(a), ry * math.sin(a)
        out.append((cx + x * cr - y * sr, cy + x * sr + y * cr))
    return out


def rot_pts(pts, cx, cy, ang):
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c) for x, y in pts]


def rrect(x0, y0, x1, y1, rad):
    pts = []
    for cx, cy, a in ((x1 - rad, y0 + rad, -math.pi / 2), (x1 - rad, y1 - rad, 0),
                      (x0 + rad, y1 - rad, math.pi / 2), (x0 + rad, y0 + rad, math.pi)):
        for k in range(5):
            t = a + (math.pi / 2) * k / 4
            pts.append((cx + rad * math.cos(t), cy + rad * math.sin(t)))
    return pts


class Canvas:
    def __init__(self, dseed):
        self.img = Image.new("RGB", (W * SS, H * SS), CREAM)
        self.d = ImageDraw.Draw(self.img)
        self.dseed = dseed

    @staticmethod
    def _sc(pts):
        return [(x * SS, y * SS) for x, y in pts]

    def wob(self, pts, key, amp=2.0, closed=False, step=7.0):
        rs, ss = resample(pts, step, closed)
        if amp <= 0:
            return rs
        n = Noise(seed_of(self.dseed, key))
        out = []
        for (x, y), s in zip(rs, ss):
            dx, dy = n(s)
            out.append((x + amp * dx, y + amp * dy))
        return out

    def _stroke(self, wp, key, width, color):
        rng = random.Random(seed_of(self.dseed, key, "w"))
        i = 0
        n = len(wp)
        while i < n - 1:
            j = min(n, i + rng.randint(5, 10))
            seg = wp[i:j + 1] if j < n else wp[i:]
            w = max(1.0, width * rng.uniform(0.78, 1.22)) * SS
            if len(seg) >= 2:
                self.d.line(self._sc(seg), fill=color, width=int(round(w)), joint="curve")
                for (x, y) in (seg[0], seg[-1]):
                    r = w / 2
                    self.d.ellipse((x * SS - r, y * SS - r, x * SS + r, y * SS + r), fill=color)
            i = j

    def shape(self, pts, key, fill=None, outline=CHARCOAL, width=LINE, amp=2.0, step=7.0):
        wp = self.wob(pts, key, amp, closed=True, step=step)
        if fill is not None:
            self.d.polygon(self._sc(wp), fill=fill)
        if outline is not None and width > 0:
            self._stroke(wp + [wp[0]], key, width, outline)
        return wp

    def line(self, pts, key, color=CHARCOAL, width=LINE, amp=2.0, step=7.0):
        wp = self.wob(pts, key, amp, closed=False, step=step)
        self._stroke(wp, key, width, color)
        return wp

    def tube(self, pts, key, fill, width, outline=CHARCOAL, ow=LINE, amp=2.0):
        """Thick outlined stroke (arms, strands, sock)."""
        wp = self.wob(pts, key, amp, closed=False, step=6)
        sc = self._sc(wp)
        for color, w in ((outline, width + 2 * ow), (fill, width)):
            r = w * SS / 2
            self.d.line(sc, fill=color, width=int(w * SS), joint="curve")
            for x, y in (sc[0], sc[-1]):
                self.d.ellipse((x - r, y - r, x + r, y + r), fill=color)
        return wp

    def dot(self, cx, cy, rx, ry, key, fill=CHARCOAL, outline=None, width=LINE, amp=0.8):
        return self.shape(ellipse_pts(cx, cy, rx, ry, 28), key, fill=fill, outline=outline, width=width, amp=amp)

    def finish(self, zoom=None):
        img = self.img
        if zoom:
            z, cx, cy = zoom
            bw, bh = W / z, H / z
            x0 = min(max(cx - bw / 2, 0), W - bw)
            y0 = min(max(cy - bh / 2, 0), H - bh)
            img = img.crop((int(x0 * SS), int(y0 * SS), int((x0 + bw) * SS), int((y0 + bh) * SS)))
        return img.resize((W, H), Image.LANCZOS)
