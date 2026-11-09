import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../Logo";
import { COLORS, fontFamily } from "../theme";

// Brand reveal: logo pops, tagline rises underneath.
const RevealInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 11 } });
  const tag = spring({ frame: frame - 20, fps, config: { damping: 16 } });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 60 }}>
      <Logo
        name="Logo"
        ringColor={COLORS.ink}
        textColor={COLORS.ink}
        style={{ scale: String(interpolate(pop, [0, 1], [0.5, 1])), opacity: pop }}
      />
      <Interactive.Div
        name="Tagline"
        style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 64,
          color: COLORS.ink,
          textAlign: "center",
          textWrap: "balance",
          opacity: tag,
          translate: `0 ${interpolate(tag, [0, 1], [40, 0])}px`,
        }}
      >
        Your workout partner is out there
      </Interactive.Div>
    </div>
  );
};

export const Reveal = Interactive.create({
  Component: RevealInner,
  componentName: "Reveal",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
