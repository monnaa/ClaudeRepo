import { Interactive, useVideoConfig } from "remotion";
import { CUES, SCENES } from "../cues";
import { Character, type Motion } from "../components/Character";
import { Mark, Shadow, Sticker } from "../components/Marks";

// Scene 7 (21-25 s): silence. She freezes ("ah..."), a sweat drop; at 22 s
// post-its land in her hair in one beat; an empty thought bubble; a slow tilt.
const POP = CUES.pop - SCENES.s7.start; // 1.0 s

const frozenThenTilt: Motion = (t) => {
  const k = Math.round((t - POP) * 10);
  if (k === 0) return { sy: 0.95, sx: 1.03 };
  if (k === 1) return { sy: 1.03, sx: 0.98 };
  if (t >= 2.2) return { rot: -Math.min(3.5, Math.floor((t - 2.2) / 0.3) * 0.7) }; // slow, stepped tilt
  return {};
};

const Scene7Inner = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shadow style={{ left: 190, top: 1615, width: 700, height: 60 }} />
      <Character
        name="Elle figée"
        pose="bank/P07_postit.png"
        shake={1.2}
        seed={701}
        pivot="50% 100%"
        freezeAfter={0}
        motion={frozenThenTilt}
        style={{ left: 128, top: 545, width: 825, height: 1100 }}
      />
      <Sticker
        name="Post-it jaune dans les cheveux"
        from={1 * fps}
        src="bank/A08_postit_02.png"
        overshoot={1.35}
        shake={0}
        seed={71}
        style={{ left: 478, top: 531, width: 84, rotate: "-14deg" }}
      />
      <Sticker
        name="Post-it rose dans les cheveux"
        from={1 * fps}
        src="bank/A10_postit_04.png"
        overshoot={1.35}
        shake={0}
        seed={72}
        style={{ left: 596, top: 585, width: 66, rotate: "18deg" }}
      />
      <Mark
        name="Goutte de sueur"
        from={0.3 * fps}
        kind="sweat"
        color="#2B2B2B"
        overshoot={1.2}
        shake={0}
        flip={false}
        seed={73}
        style={{ left: 650, top: 600, width: 46, height: 69 }}
      />
      <Mark
        name="Bulle de pensée vide"
        from={2 * fps}
        kind="thought"
        color="#2B2B2B"
        overshoot={1.08}
        shake={0}
        flip
        seed={74}
        style={{ left: 40, top: 245, width: 460, height: 360 }}
      />
    </>
  );
};

export const Scene7 = Interactive.create({
  Component: Scene7Inner,
  componentName: "Scene7",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
