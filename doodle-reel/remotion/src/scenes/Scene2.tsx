import { Interactive, useVideoConfig } from "remotion";
import { ChatPanel } from "../components/ChatPanel";
import { Character, type Motion } from "../components/Character";
import { Mark, Shadow } from "../components/Marks";

// Scene 2 (4-7 s): the generic answer arrives; she reads it, then the take:
// squash, cut to the magnifier pose, stretch, "?!".
const reading: Motion = (t) => (t >= 0.4 ? { sy: 0.93, sx: 1.04, y: 8 } : {}); // anticipation
const lookingClose: Motion = (t) => {
  const k = Math.round(t * 10);
  if (k === 0) return { sy: 1.1, sx: 0.94, y: -20 };
  if (k === 1) return { sy: 0.96, sx: 1.03 };
  return {};
};

const Scene2Inner = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Shadow style={{ left: 190, top: 1592, width: 700, height: 60 }} />
      <Character
        name="Elle lit"
        durationInFrames={0.6 * fps}
        pose="bank/P01_ordinateur.png"
        shake={1.6}
        seed={201}
        pivot="50% 100%"
        freezeAfter={0}
        motion={reading}
        style={{ left: 128, top: 545, width: 825, height: 1100 }}
      />
      <Character
        name="Elle à la loupe"
        from={0.6 * fps}
        pose="bank/P04_loupe.png"
        shake={2.5}
        seed={202}
        pivot="50% 100%"
        freezeAfter={0}
        motion={lookingClose}
        style={{ left: 128, top: 545, width: 825, height: 1100 }}
      />
      <ChatPanel
        name="Chatbot"
        keys={[]}
        enter={null}
        userAt={0}
        botAt={0.2}
        botHideAt={null}
        cursorOnAt={[]}
        barOnly={false}
        seed={2}
        style={{ left: 130, top: 245, width: 820, height: 290 }}
      />
      <Mark
        name="Traits de surprise"
        from={0.7 * fps}
        kind="lines"
        color="#2B2B2B"
        overshoot={1.2}
        shake={0}
        flip={false}
        seed={22}
        style={{ left: 250, top: 560, width: 200, height: 120 }}
      />
      <Mark
        name="?!"
        from={0.8 * fps}
        kind="qbang"
        color="#2B2B2B"
        overshoot={1.3}
        shake={4}
        flip={false}
        seed={21}
        style={{ left: 720, top: 560, width: 160, height: 160 }}
      />
    </>
  );
};

export const Scene2 = Interactive.create({
  Component: Scene2Inner,
  componentName: "Scene2",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
