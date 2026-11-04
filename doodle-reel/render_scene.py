"""Render one scene: unique drawings at 10/s -> 1080x1920, 30 fps mp4 (no audio).

Usage: python3 render_scene.py <scene> [--still i,i,...]
"""
import os
import subprocess
import sys
from multiprocessing import Pool

import character
import props
import scenes
from style import Canvas, seed_of

ROOT = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(ROOT, "build")


def draw(scene, i):
    p = scenes.pose(scene, i)
    cv = Canvas(seed_of("doodle", scene, p["seed"]))
    props.chair(cv, p)
    character.draw_character(cv, p)
    hair_r = character.hair_radius(p)
    props.anger(cv, p, p["anger"], hair_r)
    if p["surprise"]:
        props.surprise(cv, p)
    if p["pop"]:
        hx, hy, r = p["hx"], p["hy"], p["r"]
        for k, (x, y) in enumerate(((hx - 0.72 * r, hy - 1.38 * r), (hx + 0.75 * r, hy - 1.42 * r),
                                     (hx + 0.02 * r, hy - 1.05 * r))):
            props.pop_lines(cv, x, y, r, f"pop{k}")
    props.desk(cv, p)
    props.laptop(cv, p)
    character.arms(cv, p)
    if p["impact"]:
        (_, (x, y), _) = p["arms"][1]
        props.impact(cv, x + p["bx"] - 380, y + 10, p["r"])
    if p["bubble"] > 0:
        props.bubble(cv, p, p["bubble"])
    return cv.finish(p["zoom"])


def _job(args):
    scene, i, out = args
    draw(scene, i).save(out, compress_level=1)
    return out


def render(scene):
    n = int(round(scenes.DURATIONS[scene - 1] * 10))
    fdir = os.path.join(BUILD, "frames", f"s{scene}")
    os.makedirs(fdir, exist_ok=True)
    os.makedirs(os.path.join(BUILD, "scenes"), exist_ok=True)
    jobs = [(scene, i, os.path.join(fdir, f"{i:03d}.png")) for i in range(n)]
    with Pool(4) as pool:
        pool.map(_job, jobs)
    out = os.path.join(BUILD, "scenes", f"scene{scene}.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "10", "-i", os.path.join(fdir, "%03d.png"),
                    "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                    "-r", "30", "-an", out], check=True)
    return out


if __name__ == "__main__":
    sc = int(sys.argv[1])
    if len(sys.argv) > 2 and sys.argv[2] == "--still":
        os.makedirs(os.path.join(BUILD, "stills"), exist_ok=True)
        for s in sys.argv[3].split(","):
            path = os.path.join(BUILD, "stills", f"s{sc}_{int(s):03d}.png")
            draw(sc, int(s)).save(path)
            print(path)
    else:
        print(render(sc))
