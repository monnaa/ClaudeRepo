"""Props and effects: chair, desk, laptop + calm chatbot screen, marks, bubble."""
import math
import random

from style import (CHARCOAL, CREAM, GREY, GREY_SOFT, LIGHT, RED, SKIN, LINE,
                   ellipse_pts, rrect, smooth)

DESK_Y = 1180
SCREEN = (622, 862, 968, 1118)  # inner screen box
ANSWER = [0.95, 0.86, 0.92, 0.7, 0.9, 0.82, 0.55]  # the one generic grey block


def chair(cv, p):
    dx = p["bx"] - 380
    pts = rrect(170 + dx, 955, 590 + dx, 1205, 40)
    cv.shape(pts, "chair", fill=SKIN)


def desk(cv, p):
    cv.shape([(70, DESK_Y), (1010, DESK_Y), (1010, DESK_Y + 34), (70, DESK_Y + 34)], "desktop", fill=SKIN)
    for k, x in enumerate((120, 960)):
        cv.shape([(x - 14, DESK_Y + 34), (x + 14, DESK_Y + 34), (x + 12, 1465), (x - 12, 1465)], f"leg{k}", fill=SKIN)
    cv.line([(134, DESK_Y + 80), (946, DESK_Y + 80)], "rail", width=LINE * 0.8)


def laptop(cv, p):
    s = p["screen"]
    cv.shape(rrect(600, 840, 990, 1140, 16), "lid", fill=SKIN)
    x0, y0, x1, y1 = SCREEN
    cv.shape(rrect(x0, y0, x1, y1, 8), "screen", fill=LIGHT, width=LINE * 0.8)
    cv.shape([(585, 1140), (1005, 1140), (1018, DESK_Y), (572, DESK_Y)], "base", fill=SKIN)
    cv.line([(640, 1158), (950, 1158)], "keys", color=GREY, width=LINE * 0.7)
    # input bar
    cv.shape(rrect(640, 1066, 950, 1102, 14), "input", fill=None, outline=GREY, width=LINE * 0.7, amp=1.0)
    if s.get("input", 0) > 0:
        L = 270 * s["input"]
        cv.line([(658, 1084), (658 + L, 1084)], "typed", color=GREY, width=9, amp=0.8)
    if s.get("cursor"):
        cx = 658 + 270 * s.get("input", 0) + 8
        cv.line([(cx, 1074), (cx, 1095)], "cursor", color=GREY, width=4, amp=0.3)
    if s.get("user"):
        cv.shape(rrect(800, 880, 950, 910, 14), "ubub", fill=GREY_SOFT, outline=None, amp=0.8)
        cv.line([(816, 895), (930, 895)], "uline", color=GREY, width=7, amp=0.6)
    n = s.get("answer", 0)
    for k in range(min(n, len(ANSWER))):
        y = 934 + 17 * k
        cv.line([(642, y), (642 + 290 * ANSWER[k], y)], f"ans{k}", color=GREY, width=8, amp=0.7)


def vein(cv, cx, cy, s, key, width=LINE * 1.5):
    for k, (qx, qy) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
        pts = smooth([(cx + qx * 0.28 * s, cy + qy * 1.0 * s), (cx + qx * 0.36 * s, cy + qy * 0.36 * s),
                      (cx + qx * 1.0 * s, cy + qy * 0.28 * s)], samples=5)
        cv.line(pts, f"{key}{k}", color=RED, width=width, amp=1.0)


def anger(cv, p, level, hair_r):
    if level <= 0:
        return
    hx, hy, r = p["hx"], p["hy"], p["r"]
    if level == 1:
        vein(cv, hx + 0.95 * r, hy - 0.95 * r, 0.12 * r, "v1")
        return
    vein(cv, hx + 1.0 * r, hy - 1.0 * r, 0.18 * r, "v1", width=LINE * 1.8)
    vein(cv, hx - 0.95 * r, hy - 0.9 * r, 0.12 * r, "v2")
    n = 4 if level == 2 else 11
    rng = random.Random(77)
    R = hair_r + 0.08 * r
    for k in range(n):
        a = -math.pi * 0.95 + math.pi * 0.9 * k / max(1, n - 1) + rng.uniform(-0.06, 0.06)
        if level == 2:
            a = -math.pi * 0.35 + 0.18 * k
        L = (0.16 if level == 2 else 0.28) * r
        cv.line([(hx + math.cos(a) * R, hy + math.sin(a) * R),
                 (hx + math.cos(a) * (R + L), hy + math.sin(a) * (R + L))], f"al{k}", color=RED,
                width=LINE * 1.3, amp=0.8)
    if level >= 3:
        for k, side in enumerate((-1, 1)):
            cx, cy = hx + side * (hair_r - 0.02 * r), hy + 0.6 * r
            cloud(cv, cx, cy, 0.17 * r, 0.12 * r, f"steam{k}", bumps=5)


def cloud(cv, cx, cy, rx, ry, key, bumps=7):
    pts = []
    n = 80
    for i in range(n):
        th = 2 * math.pi * i / n
        b = 1 + 0.16 * abs(math.sin(th * bumps / 2)) ** 0.6
        pts.append((cx + rx * b * math.cos(th), cy + ry * b * math.sin(th)))
    cv.shape(pts, key, fill=LIGHT)


def surprise(cv, p):
    hx, hy, r = p["hx"], p["hy"], p["r"]
    u = 0.32 * r
    x, y = hx + 1.12 * r, hy - 1.15 * r
    q = [(-0.35, -0.55), (-0.28, -0.82), (0, -0.95), (0.3, -0.84), (0.38, -0.56), (0.2, -0.3), (0.02, -0.12),
         (0.0, 0.12)]
    cv.line(smooth([(x + a * u, y + b * u) for a, b in q], samples=5), "qm", width=LINE * 1.9)
    cv.dot(x, y + 0.4 * u, 0.09 * u, 0.09 * u, "qd")
    x2 = x + 0.75 * u
    cv.line([(x2, y - 0.95 * u), (x2 - 0.03 * u, y + 0.12 * u)], "ex", width=LINE * 1.9)
    cv.dot(x2 - 0.03 * u, y + 0.4 * u, 0.09 * u, 0.09 * u, "exd")
    for k, a in enumerate((-2.4, -2.05, -1.7)):
        R = 1.45 * r
        cv.line([(hx + math.cos(a) * R, hy + math.sin(a) * R),
                 (hx + math.cos(a) * (R + 0.18 * r), hy + math.sin(a) * (R + 0.18 * r))], f"st{k}",
                width=LINE * 1.1)


def impact(cv, x, y, r):
    for k in range(6):
        a = math.pi + math.pi * k / 5
        cv.line([(x + math.cos(a) * 0.28 * r, y + math.sin(a) * 0.2 * r),
                 (x + math.cos(a) * 0.48 * r, y + math.sin(a) * 0.36 * r)], f"imp{k}", width=LINE * 1.1)
    for k, side in enumerate((-1, 1)):
        cloud(cv, x + side * 0.42 * r, y + 0.02 * r, 0.08 * r, 0.05 * r, f"dust{k}", bumps=4)


def pop_lines(cv, x, y, r, key):
    for k in range(4):
        a = -math.pi / 2 + (k - 1.5) * 0.6
        cv.line([(x + math.cos(a) * 0.12 * r, y + math.sin(a) * 0.12 * r),
                 (x + math.cos(a) * 0.24 * r, y + math.sin(a) * 0.24 * r)], f"{key}{k}", width=LINE)


def bubble(cv, p, grow=1.0):
    cx, cy = 870, 420
    cloud(cv, cx, cy, 140 * grow, 100 * grow, "bubble", bumps=9)
    for k, (x, y, rr) in enumerate(((752, 548, 20), (722, 590, 13), (704, 622, 8))):
        if grow > 0.3 * k:
            cv.dot(x, y, rr, rr, f"trail{k}", fill=LIGHT, outline=CHARCOAL, width=LINE)
