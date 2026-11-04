"""Pose-to-pose timeline: pose(scene, i) -> params for drawing i (10 drawings/s)."""
import keys

DURATIONS = [4.0, 3.0, 3.0, 4.0, 4.0, 3.0, 4.0, 5.0]
STARTS = [sum(DURATIONS[:k]) for k in range(8)]

EXPR = {
    "smile": dict(eyes=("dot", "dot"), brows=((0, -0.3), (0, -0.3)), mouth="smile", blush=True),
    "blink": dict(eyes=("closed", "closed"), brows=((0, -0.3), (0, -0.3)), mouth="smile", blush=True),
    "notice": dict(eyes=("dot", "dot"), brows=((-0.04, -0.3), (-0.04, -0.3)), mouth="flat"),
    "surprised": dict(eyes=("wide", "wide"), brows=((-0.13, -0.45), (-0.16, -0.45)), mouth="O"),
    "stare": dict(eyes=("half", "half"), brows=((0.04, 0.5), (-0.07, -0.15)), mouth="flat"),
    "stare_twitch": dict(eyes=("half", "twitch"), brows=((0.04, 0.5), (-0.11, -0.35)), mouth="flat"),
    "stubborn": dict(eyes=("half", "half"), brows=((0.05, 0.9), (0.05, 0.9)), mouth="grit"),
    "stubborn_twitch": dict(eyes=("twitch", "half"), brows=((0.08, 1.15), (0.06, 1.0)), mouth="grit"),
    "fume": dict(eyes=("squint", "squint"), brows=((0.07, 1.3), (0.07, 1.3)), mouth="grit"),
    "angry": dict(eyes=("squint", "squint"), brows=((0.06, 1.4), (0.06, 1.4)), mouth="shout"),
    "tired": dict(eyes=("half", "half"), brows=((0.03, -0.6), (0.03, -0.6)), mouth="flat"),
    "tired_twitch": dict(eyes=("half", "twitch"), brows=((0.03, -0.6), (-0.01, -0.4)), mouth="flat"),
    "ah": dict(eyes=("dot", "dot"), brows=((-0.07, -0.75), (-0.07, -0.75)), mouth="o", sweat=True, blush=True),
    "thinking": dict(eyes=("dot", "dot"), brows=((-0.03, -0.4), (-0.1, -0.2)), mouth="wavy", sweat=True,
                     blush=True),
    "deadpan": dict(eyes=("half", "half"), brows=((0.0, 0.0), (0.0, 0.0)), mouth="flat"),
}

# (elbow, hand, kind) for her right arm (viewer-left) then left arm; coordinates for bx=380
ARMS = {
    "rest": (((255, 1110), (420, 1172), "flat"), ((565, 1095), (600, 1170), "flat")),
    "up": (((150, 975), (165, 770), "up"), ((625, 965), (612, 760), "up")),
    "fists": (((262, 1118), (425, 1166), "fist"), ((568, 1105), (580, 1166), "fist")),
    "slam_up": (((262, 1118), (425, 1166), "fist"), ((655, 985), (630, 815), "fist")),
    "slam_down": (((262, 1118), (425, 1166), "fist"), ((612, 1090), (612, 1166), "fist")),
    "limp": (((245, 1125), (335, 1176), "flat"), ((540, 1120), (468, 1176), "flat")),
}


def type_arms(down_l, down_r, lift=28):
    return (((340, 1152), (650, 1160 - (0 if down_l else lift)), "flat"),
            ((650, 1070), (775, 1148 - (0 if down_r else lift)), "flat"))


def poke_arms(level):
    y = {"hi": 1020, "mid": 1085, "dn": 1132}[level]
    return (((255, 1110), (420, 1172), "flat"), ((605, 1050 + (y - 1085) * 0.4), (700, y), "poke"))


def base():
    return dict(seed=None, bx=380, hx=380, hy=720, r=165, sx=1.0, sy=1.0, look=1.0, gaze=(0, 0), hair=1,
                arms=ARMS["rest"], screen={}, anger=0, zoom=None, bubble=0.0, mouth_open=1.0,
                surprise=False, impact=False, pop=False, sticky=False, glasses=False, sock=None,
                blush=False, sweat=False)


def _keys_at(times, t0, t1):
    return [k for k, kt in enumerate(times) if t0 - 1e-6 <= kt < t1 - 1e-6]


def _ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def pose(scene, i):
    p = base()
    t = i / 10
    G = STARTS[scene - 1] + t
    globals()[f"_s{scene}"](p, i, t, G)
    if p["seed"] is None:
        p["seed"] = i
    return p


def _expr(p, name):
    p.update(EXPR[name])


def _s1(p, i, t, G):
    _expr(p, "smile")
    L1 = keys.LEVEL1
    enter = keys.ENTER[1]
    if G < 2.3:
        ks = _keys_at(L1, G, G + 0.1)
        is_enter = abs(G - enter) < 0.05
        typed = len([k for k in L1 if k < G + 0.05])
        down_l = any(k % 2 == 0 for k in ks)
        down_r = any(k % 2 == 1 for k in ks) or is_enter
        lift = 44 if abs(G + 0.1 - enter) < 0.05 else 26
        p["arms"] = type_arms(down_l, down_r, lift)
        if ks or is_enter:
            p["hy"] += 6
            p["sy"] = 0.98
        p["screen"] = dict(input=0.75 * typed / len(L1), cursor=True)
        if G >= enter + 0.05:
            p["screen"] = dict(user=True)
    else:
        p.update(bx=364, hx=358, hy=712, look=0.9, arms=ARMS["rest"])
        p["screen"] = dict(user=True)
        if 26 <= i <= 31:
            p["seed"] = 26
        if i == 34:
            _expr(p, "blink")


def _s2(p, i, t, G):
    p["screen"] = dict(user=True, answer=0 if t < 0.1 else min(7, int((t - 0.1) / 0.08) + 1))
    if i < 7:
        p.update(bx=364, hx=358, hy=712, look=0.9, arms=ARMS["rest"])
        _expr(p, "smile" if i < 5 else "notice")
        return
    _expr(p, "surprised")
    p.update(hair=2, arms=ARMS["up"], surprise=i < 26)
    if i == 7:
        p.update(sx=0.9, sy=1.15, hy=704)
    elif i == 8:
        p.update(sx=0.97, sy=1.05, hy=714)
    elif 9 <= i <= 14:
        p["seed"] = 9
    if i in (21, 22):
        p["brows"] = ((-0.18, -0.5), (-0.2, -0.5))


def _s3(p, i, t, G):
    p.update(zoom=(1.2, 560, 1020), screen=dict(user=True, answer=7))
    _expr(p, "stare")
    p["hair"] = 2 if i < 12 else 3
    if i <= 5:
        p["seed"] = 0
    if i in (10, 11, 23):
        _expr(p, "stare_twitch")
    if i == 12:
        p["hx"] += 5
    if i >= 14:
        p["anger"] = 1


def _s4(p, i, t, G):
    _expr(p, "stubborn")
    p["hair"] = 3 if i < 10 else 4
    p["anger"] = 1 if i < 10 else 2
    L2 = keys.LEVEL2
    enter = keys.ENTER[2]
    old = dict(user=True, answer=7)
    if G < 10.35:
        p["arms"] = type_arms(False, False, 34)
        p["screen"] = dict(old, input=0.0, cursor=True)
    elif G < 11.9:
        ks = _keys_at(L2, G, G + 0.1)
        is_enter = abs(G - enter) < 0.05
        typed = len([k for k in L2 if k < G + 0.05])
        down_l = any(k % 2 == 0 for k in ks)
        down_r = any(k % 2 == 1 for k in ks) or is_enter
        lift = 56 if abs(G + 0.1 - enter) < 0.05 else 38
        p["arms"] = type_arms(down_l, down_r, lift)
        if ks or is_enter:
            p["hy"] += 10
            p.update(sy=0.95, sx=1.03)
        p["screen"] = dict(old, input=0.75 * min(1, typed / len(L2)), cursor=True)
        if G >= enter + 0.05:
            p["screen"] = dict(user=True)
    else:
        p["arms"] = type_arms(False, False, 30)
        p["screen"] = dict(user=True, answer=0 if t < 2.2 else min(7, int((t - 2.2) / 0.08) + 1))
    if i in (29, 30):
        _expr(p, "stubborn_twitch")
    if i >= 31:
        _expr(p, "stubborn_twitch")
        p["eyes"] = ("half", "half")
        if i <= 36:
            p["seed"] = 31


def _s5(p, i, t, G):
    p["screen"] = dict(user=True, answer=7)
    p["hair"] = 4 if i < 22 else 5
    p["anger"] = 2 if i < 22 else 3
    if i < 10:
        _expr(p, "fume")
        p.update(sx=1.07, sy=0.91, hy=730, arms=ARMS["fists"])
        p["hx"] += 4 if i % 2 else -4
    elif i < 22:
        _expr(p, "angry")
        p.update(mouth_open=min(1.0, 0.35 + (t - 1.0) * 0.6), sx=0.9, sy=1.15, hy=705, arms=ARMS["slam_up"])
        p["hx"] += 3 if i % 2 else -3
    elif i == 22:
        _expr(p, "angry")
        p.update(sx=1.14, sy=0.85, hy=740, arms=ARMS["slam_down"], impact=True)
    else:
        _expr(p, "angry")
        j = min(i, 33)
        p.update(sx=0.97, sy=1.06, hy=716, arms=ARMS["slam_down"], impact=(j == 23))
        p["hx"] += 6 if j % 2 else -6
        if i >= 33:
            p["seed"] = 33


def _s6(p, i, t, G):
    _expr(p, "tired")
    p.update(hair=5, hy=732, look=1.0)
    stabs = [round((k - 18.0) * 10) for k in keys.LEVEL3] + [round((keys.ENTER[3] - 18.0) * 10)]
    if i in stabs:
        lvl = "dn"
        p["hy"] += 5
    elif i + 1 in stabs or i + 2 in stabs:
        lvl = "hi"
    else:
        lvl = "mid"
    p["arms"] = poke_arms(lvl)
    typed = len([s for s in stabs[:3] if s <= i])
    if i < stabs[3] + 1:
        p["screen"] = dict(user=True, answer=7, input=0.55 * typed / 3, cursor=True)
    else:
        p["screen"] = dict(user=True, answer=0 if G < 20.5 - 1e-6 else 7)
    if i in (27, 28):
        _expr(p, "tired_twitch")


def _s7(p, i, t, G):
    _expr(p, "ah")
    p.update(hair=5, hy=730, arms=ARMS["limp"], screen=dict(user=True, answer=7))
    if i <= 5:
        p["seed"] = 0
    if i >= 10:
        p.update(sticky=True, glasses=True, sock=0.0)
    if i in (10, 11):
        p["pop"] = True
        p.update(sy=0.95, sx=1.03)
    if t >= 1.5:
        e = _ease((t - 1.5) / 1.5)
        _expr(p, "thinking")
        p["look"] = 1.0 - 0.55 * e
        p["gaze"] = (0.03 * e, -0.06 * e)
        p["hy"] = 730 - 10 * e
    if t >= 2.0:
        p["bubble"] = min(1.0, 0.6 + (t - 2.0) * 2)
    if 31 <= i <= 36:
        p["seed"] = 31
    elif i >= 37:
        p["seed"] = 37


def _s8(p, i, t, G):
    _expr(p, "deadpan")
    p.update(hair=5, sticky=True, glasses=True, sock=0.0, arms=ARMS["rest"])
    p["look"] = 0.45 if i < 2 else 0.0
    if i == 2:
        p["sy"] = 0.96
    p["sock"] = _ease((t - 1.0) / 2.6)
    cursor = (1.5 <= t + 1e-6 < 2.5) or (3.5 <= t + 1e-6 < 4.5)
    p["screen"] = dict(cursor=cursor)
    if 40 <= i <= 45:
        p["seed"] = 40
    elif i >= 46:
        p["seed"] = 46
