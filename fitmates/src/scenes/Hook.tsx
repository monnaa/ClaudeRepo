import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, fontFamily } from "../theme";

// 0-2.8 s: the problem. "Skipped the gym" lands, then "again?" shakes in.
const HookInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line1 = spring({ frame, fps, config: { damping: 14 } });
  const line2 = spring({ frame: frame - 22, fps, config: { damping: 9 } });
  const shake = frame > 30 && frame < 48 ? Math.sin(frame * 2.2) * 10 : 0;

  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: "0 100px", fontFamily, fontWeight: 800, lineHeight: 1.02 }}>
      <Interactive.Div
        name="Hook line 1"
        style={{
          fontSize: 140,
          color: COLORS.white,
          opacity: line1,
          translate: `0 ${interpolate(line1, [0, 1], [80, 0])}px`,
        }}
      >
        Skipped the gym
      </Interactive.Div>
      <Interactive.Div
        name="Hook line 2"
        style={{
          fontSize: 190,
          color: COLORS.coral,
          scale: String(interpolate(line2, [0, 1], [0.4, 1])),
          opacity: Math.min(1, line2 * 2),
          rotate: `${shake / 4}deg`,
          translate: `${shake}px 0`,
          transformOrigin: "left center",
        }}
      >
        again?
      </Interactive.Div>
    </div>
  );
};

export const Hook = Interactive.create({
  Component: HookInner,
  componentName: "Hook",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
