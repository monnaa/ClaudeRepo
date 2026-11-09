import { Interactive } from "remotion";
import { COLORS, fontFamily } from "./theme";

// Two overlapping rings (two mates) next to the wordmark.
const LogoInner = ({
  ringColor,
  textColor,
  style,
}: {
  readonly ringColor: string;
  readonly textColor: string;
  readonly style?: React.CSSProperties;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28, ...style }}>
    <svg width={150} height={100} viewBox="0 0 150 100">
      <circle cx={50} cy={50} r={38} fill="none" stroke={ringColor} strokeWidth={14} />
      <circle cx={100} cy={50} r={38} fill="none" stroke={ringColor} strokeWidth={14} />
    </svg>
    <span style={{ fontFamily, fontWeight: 800, fontSize: 120, color: textColor, letterSpacing: -4 }}>
      FitMates
    </span>
  </div>
);

export const Logo = Interactive.create({
  Component: LogoInner,
  componentName: "Logo",
  layout: "none",
  schema: {
    ringColor: { type: "color", default: COLORS.ink, description: "Ring color" },
    textColor: { type: "color", default: COLORS.ink, description: "Text color" },
  },
});
