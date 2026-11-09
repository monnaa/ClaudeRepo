import { Interactive } from "remotion";
import { CUES, SCENES } from "../cues";
import { ChatPanel } from "../components/ChatPanel";
import { Character, type Motion } from "../components/Character";
import { Shadow } from "../components/Marks";

// Scene 6 (18-21 s): exhausted, no more red. Three slow stabs at the keys,
// the same generic answer at 20.5 s. Only one small twitch.
const T0 = SCENES.s6.start;
const keys = CUES.keys3.map((k) => k - T0);
const enter = CUES.enter3 - T0;

const slumped: Motion = (t) => {
  const base = { rot: 2.2, y: 14 };
  if (keys.some((k) => Math.abs(t - (k - 0.2)) < 0.05)) return { ...base, y: 4, sy: 1.03 }; // lifts the finger...
  if (keys.some((k) => Math.abs(t - k) < 0.05)) return { ...base, y: 32, sy: 0.95, sx: 1.02 }; // ...stabs
  if (Math.abs(t - enter) < 0.05) return { ...base, y: 36, sy: 0.94 };
  if (Math.abs(t - 2.8) < 0.05) return { rot: 1.2, y: 8 }; // the only twitch
  return base;
};

const Scene6Inner = () => (
  <>
    <Shadow style={{ left: 190, top: 1592, width: 700, height: 60 }} />
    <Character
      name="Elle épuisée"
      pose="bank/P01_ordinateur.png"
      shake={1.2}
      seed={601}
      pivot="50% 100%"
      freezeAfter={0}
      motion={slumped}
      style={{ left: 128, top: 545, width: 825, height: 1100 }}
    />
    <ChatPanel
      name="Chatbot"
      keys={keys}
      enter={enter}
      userAt={0}
      botAt={2.5}
      botHideAt={enter}
      cursorOnAt={[]}
      barOnly={false}
      seed={6}
      style={{ left: 130, top: 245, width: 820, height: 290 }}
    />
  </>
);

export const Scene6 = Interactive.create({
  Component: Scene6Inner,
  componentName: "Scene6",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
