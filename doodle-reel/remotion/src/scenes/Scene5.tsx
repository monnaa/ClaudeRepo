import { AbsoluteFill, Interactive, useCurrentFrame, useVideoConfig } from "remotion";
import { CUES, SCENES } from "../cues";
import { Character, type Motion } from "../components/Character";
import { Mark, Shadow, Sticker } from "../components/Marks";

// Scene 5 (14-18 s): she explodes. Squash and stretch, a tremble that builds,
// the slam (with a frame jolt), then a freeze mid-shout for the last 20 frames.
const T0 = SCENES.s5.start;
const SLAM = CUES.slam - T0; // 2.2 s
const FREEZE = SCENES.s5.duration - 20 / 30;

const exploding: Motion = (t, drawing) => {
  const k = Math.round(t * 10);
  const s = SLAM * 10;
  const tremble = (((drawing * 61) % 11) / 11 - 0.5) * (8 + t * 5);
  if (k === 0) return { sy: 0.86, sx: 1.09 };
  if (k === 1) return { sy: 1.1, sx: 0.94, y: -18 };
  if (k === s - 1) return { sy: 1.12, sx: 0.93, y: -26 }; // wind-up
  if (k === s) return { sy: 0.84, sx: 1.12, y: 10 }; // SLAM
  if (k === s + 1) return { sy: 1.05, sx: 0.97 };
  if (k >= 28) return { sy: 1.07, sx: 0.96, y: -12, x: tremble }; // mid-shout
  return { x: tremble, rot: tremble * 0.1 };
};

/** The whole frame jolts on the slam. */
const Jolt: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = Math.floor((frame / fps - SLAM) * 10 + 1e-6);
  const a = k >= 0 ? [26, 16, 9, 5, 2, 0][k] ?? 0 : 0;
  return <AbsoluteFill style={{ translate: `${k % 2 ? -a : a}px ${a * (k % 2 ? -0.6 : 0.8)}px` }}>{children}</AbsoluteFill>;
};

const Scene5Inner = () => {
  const { fps } = useVideoConfig();
  return (
    <Jolt>
      <Mark
        name="Explosion"
        from={2.2 * fps}
        kind="burst"
        color="#D63A2E"
        overshoot={1.3}
        shake={0}
        flip={false}
        seed={51}
        style={{ left: 340, top: 600, width: 440, height: 440 }}
      />
      <Shadow style={{ left: 190, top: 1592, width: 700, height: 60 }} />
      <Character
        name="Elle explose"
        pose="bank/P10_stress.png"
        shake={4}
        seed={501}
        pivot="50% 100%"
        freezeAfter={FREEZE}
        motion={exploding}
        style={{ left: 128, top: 545, width: 825, height: 1100 }}
      />
      <Sticker
        name="Éclairs"
        from={2.2 * fps}
        src="bank/A03_eclairs_stress.png"
        overshoot={1.25}
        shake={6}
        seed={53}
        style={{ left: 170, top: 300, width: 735 }}
      />
      <Mark
        name="Veine gauche"
        kind="anger"
        color="#D63A2E"
        overshoot={1.3}
        shake={4}
        flip={false}
        seed={52}
        style={{ left: 250, top: 700, width: 130, height: 130 }}
      />
      <Mark
        name="Veine droite"
        from={0.5 * fps}
        kind="anger"
        color="#D63A2E"
        overshoot={1.3}
        shake={4}
        flip={false}
        seed={54}
        style={{ left: 720, top: 680, width: 140, height: 140 }}
      />
      <Mark
        name="Veine du haut"
        from={1.3 * fps}
        kind="anger"
        color="#D63A2E"
        overshoot={1.3}
        shake={4}
        flip={false}
        seed={55}
        style={{ left: 470, top: 560, width: 120, height: 120 }}
      />
    </Jolt>
  );
};

export const Scene5 = Interactive.create({
  Component: Scene5Inner,
  componentName: "Scene5",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
