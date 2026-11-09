import { Interactive } from "remotion";
import { CUES, SCENES } from "../cues";
import { ChatPanel } from "../components/ChatPanel";
import { Character, type Motion } from "../components/Character";
import { Shadow } from "../components/Marks";

// Scene 1 (0-4 s): she types a short prompt, sends it, leans back pleased.
const T0 = SCENES.s1.start;
const keys = CUES.keys1.map((k) => k - T0);
const enter = CUES.enter1 - T0;

const motion: Motion = (t) => {
  const onKey = keys.some((k) => Math.abs(t - k) < 0.05);
  if (Math.abs(t - enter) < 0.05) return { y: 9, sy: 0.985 };
  if (t >= enter + 0.4) return { rot: -1.6, y: -6, sy: 1.01 }; // leans back
  return onKey ? { y: 6, rot: 0.5 } : {};
};

const Scene1Inner = () => (
  <>
    <Shadow style={{ left: 190, top: 1592, width: 700, height: 60 }} />
    <Character
      name="Elle"
      pose="bank/P01_ordinateur.png"
      shake={2}
      seed={101}
      pivot="50% 100%"
      freezeAfter={0}
      motion={motion}
      style={{ left: 128, top: 545, width: 825, height: 1100 }}
    />
    <ChatPanel
      name="Chatbot"
      keys={keys}
      enter={enter}
      userAt={null}
      botAt={null}
      botHideAt={null}
      cursorOnAt={[]}
      barOnly={false}
      seed={1}
      style={{ left: 130, top: 245, width: 820, height: 290 }}
    />
  </>
);

export const Scene1 = Interactive.create({
  Component: Scene1Inner,
  componentName: "Scene1",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
