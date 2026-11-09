import { Interactive, useVideoConfig } from "remotion";
import { CUES, SCENES } from "../cues";
import { ChatPanel } from "../components/ChatPanel";
import { Character, type Motion } from "../components/Character";
import { Mark, Shadow } from "../components/Marks";

// Scene 4 (10-14 s): she retypes the same line, faster and harder; the same
// generic answer comes back; red marks grow.
const T0 = SCENES.s4.start;
const keys = CUES.keys2.map((k) => k - T0);
const enter = CUES.enter2 - T0;

const motion: Motion = (t, drawing) => {
  const typing = t >= keys[0] - 0.05 && t < keys[keys.length - 1] + 0.1;
  const extra = typing ? (((drawing * 53) % 7) / 7 - 0.5) * 4 : 0;
  if (Math.abs(t - enter) < 0.05) return { y: 16, sy: 0.96, sx: 1.02 };
  if (keys.some((k) => Math.abs(t - k) < 0.05)) return { y: 10 + extra, sy: 0.98, rot: extra * 0.2 };
  if (t >= 2.3) return { rot: 1.2, y: 4 }; // glares at the same answer
  return { x: extra };
};

const Scene4Inner = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shadow style={{ left: 190, top: 1592, width: 700, height: 60 }} />
      <Character
        name="Elle retape"
        pose="bank/P01_ordinateur.png"
        shake={2.5}
        seed={401}
        pivot="50% 100%"
        freezeAfter={0}
        motion={motion}
        style={{ left: 128, top: 545, width: 825, height: 1100 }}
      />
      <ChatPanel
        name="Chatbot"
        keys={keys}
        enter={enter}
        userAt={0}
        botAt={2.2}
        botHideAt={enter}
        cursorOnAt={[]}
        barOnly={false}
        seed={4}
        style={{ left: 130, top: 245, width: 820, height: 290 }}
      />
      <Mark
        name="Veine gauche"
        from={0.6 * fps}
        kind="anger"
        color="#D63A2E"
        overshoot={1.3}
        shake={3}
        flip={false}
        seed={41}
        style={{ left: 270, top: 580, width: 120, height: 120 }}
      />
      <Mark
        name="Veine droite"
        from={1.2 * fps}
        kind="anger"
        color="#D63A2E"
        overshoot={1.3}
        shake={3}
        flip={false}
        seed={42}
        style={{ left: 690, top: 560, width: 130, height: 130 }}
      />
    </>
  );
};

export const Scene4 = Interactive.create({
  Component: Scene4Inner,
  componentName: "Scene4",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
