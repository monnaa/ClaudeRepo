import { Interactive, useVideoConfig } from "remotion";
import { Character, type Motion } from "../components/Character";
import { Mark } from "../components/Marks";

// Scene 3 (7-10 s): "Je reste calme." Close-up with her coffee; the calm cracks:
// the tremble grows, one twitch, the first small red mark.
const cracking: Motion = (t, drawing) => {
  const grow = t < 1.4 ? 0 : (t - 1.4) / 1.6;
  const wobble = ((drawing * 37) % 9) / 9 - 0.5;
  const twitch = Math.abs(t - 2.3) < 0.05;
  return { x: wobble * grow * 8, y: twitch ? -10 : wobble * grow * 6, rot: (twitch ? 1.2 : 0) + wobble * grow };
};

const Scene3Inner = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Character
        name="Elle au café (gros plan)"
        pose="bank/P06_pause_cafe.png"
        shake={1.2}
        seed={301}
        pivot="50% 30%"
        freezeAfter={0}
        motion={cracking}
        style={{ left: -135, top: 330, width: 1350, height: 1800 }}
      />
      <Mark
        name="Première veine rouge"
        from={1.8 * fps}
        kind="anger"
        color="#D63A2E"
        overshoot={1.35}
        shake={2}
        flip={false}
        seed={31}
        style={{ left: 190, top: 420, width: 120, height: 120 }}
      />
    </>
  );
};

export const Scene3 = Interactive.create({
  Component: Scene3Inner,
  componentName: "Scene3",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
