import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { useVideoConfig } from "remotion";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Match } from "./scenes/Match";
import { Reveal } from "./scenes/Reveal";
import { Streak } from "./scenes/Streak";

// 5 scenes, 4 transitions of 12 frames: 84+84+114+105+111 - 48 = 450 frames (15 s at 30 fps).
export const FitMates = () => {
  const { fps } = useVideoConfig();
  const t = linearTiming({ durationInFrames: 12 });
  return (
    <TransitionSeries name="Scenes">
      <TransitionSeries.Sequence name="1 · Hook" durationInFrames={84}>
        <Hook name="Hook" style={{ backgroundColor: "#0E0F13", justifyContent: "center", alignItems: "center" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={t} />
      <TransitionSeries.Sequence name="2 · Reveal" durationInFrames={84}>
        <Reveal name="Reveal" style={{ backgroundColor: "#C6FF3D", justifyContent: "center", alignItems: "center" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t} />
      <TransitionSeries.Sequence name="3 · Match" durationInFrames={114}>
        <Match
          name="Match"
          mateName="Sam"
          distance="0.8 km away"
          activity="Running · 6 AM"
          style={{ backgroundColor: "#0E0F13", justifyContent: "center", alignItems: "center" }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
      <TransitionSeries.Sequence name="4 · Streak" durationInFrames={105}>
        <Streak name="Streak" streakDays={21} style={{ backgroundColor: "#FF5C39", justifyContent: "center", alignItems: "center" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: Math.round(0.4 * fps) })} />
      <TransitionSeries.Sequence name="5 · CTA" durationInFrames={111}>
        <Cta name="CTA" style={{ backgroundColor: "#0E0F13", justifyContent: "center", alignItems: "center" }} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
