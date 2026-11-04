"""music.wav: 30.0 s of quiet loop music + synthesized sound cues. Standard library only."""
import math
import os
import random
import struct
import wave

import keys

SR = 44100
DUR = 30.0
N = int(SR * DUR)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", "music.wav")


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def tri(phase):
    x = (phase / (2 * math.pi)) % 1.0
    return 4 * abs(x - 0.5) - 1


def music():
    bpm = 80
    beat = 60 / bpm            # 0.75 s
    bar = 4 * beat             # 3.0 s
    chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]  # Fmaj7 Em7 Dm7 Cmaj7
    buf = [0.0] * N
    # pads: soft sine + a little triangle, slow attack/release per bar
    for b in range(int(DUR / bar) + 1):
        ch = chords[b % 4]
        t0 = b * bar
        s0, s1 = int(t0 * SR), min(N, int((t0 + bar + 0.4) * SR))
        freqs = [note(m) for m in ch]
        for s in range(s0, s1):
            lt = (s - s0) / SR
            env = min(1.0, lt / 0.35) * min(1.0, max(0.0, (bar + 0.4 - lt) / 0.6))
            tt = s / SR
            v = 0.0
            for f in freqs:
                ph = 2 * math.pi * f * tt
                v += 0.75 * math.sin(ph) + 0.25 * tri(ph)
            buf[s] += 0.03 * env * v
    # light pulse on each beat: a soft plucked chord tone + soft bass on beat 1
    k = 0
    t = 0.0
    while t < DUR:
        ch = chords[int(t // bar) % 4]
        f = note(ch[(k % 3) + 1] + 12)
        s0 = int(t * SR)
        for s in range(s0, min(N, s0 + int(0.35 * SR))):
            lt = (s - s0) / SR
            buf[s] += 0.05 * math.exp(-lt / 0.08) * math.sin(2 * math.pi * f * lt) * min(1, lt / 0.004)
        if k % 4 == 0:
            fb = note(ch[0] - 12)
            for s in range(s0, min(N, s0 + int(0.6 * SR))):
                lt = (s - s0) / SR
                buf[s] += 0.07 * math.exp(-lt / 0.22) * math.sin(2 * math.pi * fb * lt) * min(1, lt / 0.01)
        k += 1
        t += beat
    peak = max(abs(v) for v in buf)
    gain = 0.25 / peak
    for s in range(N):
        tt = s / SR
        g = 1.0
        g *= min(1.0, tt / 1.0)                      # fade in 1 s
        g *= min(1.0, max(0.0, (DUR - tt) / 2.0))    # fade out 2 s
        # dip almost to silence 21-24 s, come back softly
        if 18.0 <= tt < 18.4:
            g *= 1 - (tt - 18.0) / 0.4 * 0.5     # duck under the heavy keys so the fist stays the peak
        elif 18.4 <= tt < 20.7:
            g *= 0.5
        elif 20.7 <= tt < 21.0:
            g *= 0.5 - (tt - 20.7) / 0.3 * 0.45
        elif 21.0 <= tt < 24.0:
            g *= 0.05
        elif 24.0 <= tt < 25.5:
            g *= 0.05 + (tt - 24.0) / 1.5 * 0.7
        elif tt >= 25.5:
            g *= 0.75
        buf[s] *= gain * g
    return buf


def add(buf, t, samples):
    s0 = int(round(t * SR))
    for k, v in enumerate(samples):
        if 0 <= s0 + k < N:
            buf[s0 + k] += v


def click(rng, vol, thock=0.0, deep=False, tail=0.0):
    """One key press: short noise click (+ optional low thock, + optional tail)."""
    dur = rng.uniform(0.010, 0.025)
    n = int((dur + max(0.07 if thock else 0, tail)) * SR)
    out = []
    prev = 0.0
    tau = dur / 4
    f = rng.uniform(110, 130) if deep else rng.uniform(140, 180)
    for i in range(n):
        lt = i / SR
        w = rng.uniform(-1, 1)
        hp = w - prev          # brighten the click
        prev = w
        v = 0.6 * hp * math.exp(-lt / tau) if lt < dur * 1.6 else 0.0
        if thock:
            v += thock * math.sin(2 * math.pi * f * lt) * math.exp(-lt / 0.015) * min(1, lt / 0.002)
        if tail:
            v += 0.35 * math.sin(2 * math.pi * (f * 1.6) * lt) * math.exp(-lt / (tail / 3)) * min(1, lt / 0.004)
        out.append(vol * v)
    return out


def thud(vol):
    rng = random.Random(9)
    out, n, phase, lp = [], int(0.25 * SR), 0.0, 0.0
    for i in range(n):
        lt = i / SR
        f = 55 + 60 * math.exp(-lt / 0.04)
        phase += 2 * math.pi * f / SR
        v = math.sin(phase) * math.exp(-lt / 0.06)
        lp += 0.08 * (rng.uniform(-1, 1) - lp)
        v += 2.2 * lp * math.exp(-lt / 0.012)
        out.append(vol * v * min(1, lt / 0.0015))
    return out


def pop(vol):
    out, n, phase = [], int(0.09 * SR), 0.0
    for i in range(n):
        lt = i / SR
        f = 380 + 700 * min(1, lt / 0.04)
        phase += 2 * math.pi * f / SR
        out.append(vol * math.sin(phase) * math.exp(-lt / 0.025) * min(1, lt / 0.003))
    return out


def tick(vol):
    out = []
    for i in range(int(0.04 * SR)):
        lt = i / SR
        out.append(vol * math.sin(2 * math.pi * 2100 * lt) * math.exp(-lt / 0.006) * min(1, lt / 0.0008))
    return out


def normalize_peak(samples, target):
    p = max(abs(v) for v in samples) or 1.0
    return [v * target / p for v in samples]


def main():
    buf = music()
    rng = random.Random(2026)
    # level 1: light dry clicks, no thock
    for kt in keys.LEVEL1:
        add(buf, kt + rng.uniform(-0.006, 0.006), normalize_peak(click(rng, 1.0), 0.10 * rng.uniform(0.8, 1.15)))
    add(buf, keys.ENTER[1], normalize_peak(click(rng, 1.0, thock=0.15), 0.12))
    # level 2: faster, harder, click + thock
    for kt in keys.LEVEL2:
        add(buf, kt + rng.uniform(-0.005, 0.005),
            normalize_peak(click(rng, 1.0, thock=0.8), 0.20 * rng.uniform(0.85, 1.12)))
    add(buf, keys.ENTER[2], normalize_peak(click(rng, 1.0, thock=1.0), 0.26))
    # level 3: slow but heavy stabs, deep thock, Enter with a short tail
    for kt in keys.LEVEL3:
        add(buf, kt, normalize_peak(click(rng, 1.0, thock=1.2, deep=True), 0.32 * rng.uniform(0.95, 1.05)))
    add(buf, keys.ENTER[3], normalize_peak(click(rng, 1.0, thock=1.2, deep=True, tail=0.18), 0.36))
    # the fist: loudest sound of the Reel
    add(buf, keys.THUD, normalize_peak(thud(1.0), 0.45))
    add(buf, keys.POP, normalize_peak(pop(1.0), 0.14))
    for tt in keys.TICKS:
        add(buf, tt, normalize_peak(tick(1.0), 0.07))
    peak = max(abs(v) for v in buf)
    if peak > 0.95:
        buf = [v * 0.95 / peak for v in buf]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with wave.open(OUT, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v)) * 32767)) for v in buf))
    print(OUT, f"{N / SR:.3f} s, peak {max(abs(v) for v in buf):.2f}")


if __name__ == "__main__":
    main()
