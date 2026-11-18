import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../Logo";
import { COLORS, fontFamily } from "../theme";

// Close: slogan, logo, pulsing download button.
const CtaInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 14 } });
  const logo = spring({ frame: frame - 16, fps, config: { damping: 14 } });
  const btn = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  const pulse = 1 + Math.max(0, Math.sin((frame - 45) / 7)) * 0.04 * (frame > 45 ? 1 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 110, fontFamily }}>
      <Interactive.Div
        name="Slogan"
        style={{
          fontSize: 150,
          fontWeight: 800,
          color: COLORS.white,
          textAlign: "center",
          textWrap: "balance",
          lineHeight: 1,
          padding: "0 100px",
          opacity: head,
          translate: `0 ${interpolate(head, [0, 1], [60, 0])}px`,
        }}
      >
        Never sweat <span style={{ color: COLORS.lime }}>alone.</span>
      </Interactive.Div>
      <Logo
        name="CTA logo"
        ringColor={COLORS.lime}
        textColor={COLORS.white}
        style={{ opacity: logo, scale: String(interpolate(logo, [0, 1], [0.8, 0.85])) }}
      />
      <Interactive.Div
        name="Download button"
        style={{
          fontSize: 60,
          fontWeight: 800,
          color: COLORS.ink,
          backgroundColor: COLORS.lime,
          padding: "34px 80px",
          borderRadius: 100,
          scale: String(btn * pulse),
        }}
      >
        Download the app
      </Interactive.Div>
    </div>
  );
};

export const Cta = Interactive.create({
  Component: CtaInner,
  componentName: "Cta",
  layout: "absolute-fill",
  schema: { ...Interactive.backgroundSchema },
});
