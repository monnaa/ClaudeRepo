import { Img, Interactive, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CUES, SCENES } from "../cues";
import { ChatPanel } from "../components/ChatPanel";
import { Character, type Motion } from "../components/Character";

// Scene 8 (25-30 s): the punchline. Close-up, deadpan; an empty input bar
// whose cursor blinks on the two ticks; a post-it slides down over one eye.
const T0 = SCENES.s8.start;
const ticks = CUES.ticks.map((t) => t - T0); // 1.5 s, 3.5 s
const NOD = 3.0; // "Va apprendre à prompter."

const deadpan: Motion = (t) => {
  const k = Math.round((t - NOD) * 10);
  if (k === 0) return { y: 14, sy: 0.985 };
  if (k === 1) return { y: -6, sy: 1.01 };
  return {};
};

/** The post-it in her hair slides down, step by step, until it covers one eye. */
const SlidingPostIt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = Math.min(9, Math.floor(frame / fps / 0.4));
  return (
    <Img
      name="Post-it qui glisse"
      src={staticFile("bank/A08_postit_02.png")}
      style={{ position: "absolute", left: 455, top: -10, width: 150, translate: `0px ${k * 26}px`, rotate: `${-10 + k * 1.6}deg` }}
    />
  );
};

const Scene8Inner = () => (
  <>
    <Character
      name="Elle face caméra (gros plan)"
      pose="bank/P03_idee.png"
      shake={1}
      seed={801}
      pivot="50% 100%"
      freezeAfter={0}
      motion={deadpan}
      style={{ left: -35, top: 400, width: 1150, height: 1533 }}
    >
      <SlidingPostIt />
    </Character>
    <ChatPanel
      name="Barre de saisie vide"
      keys={[]}
      enter={null}
      userAt={null}
      botAt={null}
      botHideAt={null}
      cursorOnAt={[0, ...ticks]}
      barOnly
      seed={8}
      style={{ left: 130, top: 30, width: 820, height: 290 }}
    />
  </>
);

export const Scene8 = Interactive.create({
  Component: Scene8Inner,
  componentName: "Scene8",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
