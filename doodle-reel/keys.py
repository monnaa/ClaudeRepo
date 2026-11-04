"""Key-press timings shared by the picture (hand drawings) and the sound.

Times are in tenths of a second so every press lands on a drawing (10 drawings/s).
Level 2 adds a few half-step presses (+0.05 s) to reach about 12 presses a second.
"""
import random


def level1():
    rng = random.Random(11)
    t, out = 6, []
    while t <= 20:
        out.append(t / 10)
        t += rng.choice((1, 2, 2))
    return out


def level2():
    rng = random.Random(22)
    out = []
    for t in range(104, 117):
        out.append(t / 10)
        if rng.random() < 0.15:
            out.append(round(t / 10 + 0.05, 2))
    return out


LEVEL1 = level1()          # scene 1, 0.6 - 2.0 s
LEVEL2 = level2()          # scene 4, 10.4 - 11.6 s
LEVEL3 = [18.6, 19.1, 19.7]  # scene 6, three heavy stabs
ENTER = {1: 2.2, 2: 11.8, 3: 20.2}
THUD = 16.2
POP = 22.0
TICKS = [26.5, 28.5]
