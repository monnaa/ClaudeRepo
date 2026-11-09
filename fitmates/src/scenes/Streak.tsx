import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, fontFamily } from "../theme";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Feature 2: the shared streak counts up while the week fills in.
const StreakInner = ({ streakDays }: { readonly streakDays: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 16 } });
  const count = Math.round(
    interpolate(frame, [10, 60], [0, streakDays], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 70, fontFamily }}>
      <Interactive.Div
        name="Streak headline"
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: COLORS.ink,
          textAlign: "center",
          textWrap: "balance",
          lineHeight: 1.05,
          padding: "0 100px",
          opacity: head,
          translate: `0 ${interpolate(head, [0, 1], [50, 0])}px`,
        }}
      >
        Keep each other going
      </Interactive.Div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 380, fontWeight: 800, color: COLORS.white, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {count}
        </div>
        <Interactive.Div name="Streak label" style={{ fontSize: 64, fontWeight: 700, color: COLORS.ink }}>
          day streak together
        </Interactive.Div>
      </div>

      <div style={{ display: "flex", gap: 22 }}>
        {DAYS.map((d, i) => {
          const on = spring({ frame: frame - 18 - i * 6, fps, config: { damping: 12 } });
          return (
            <div
              key={i}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: on > 0.5 ? COLORS.ink : "rgba(14,15,19,0.18)",
                color: on > 0.5 ? COLORS.lime : COLORS.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 800,
                scale: String(interpolate(on, [0, 1], [0.8, 1])),
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Streak = Interactive.create({
  Component: StreakInner,
  componentName: "Streak",
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    streakDays: { type: "number", default: 21, min: 1, max: 365, step: 1, hiddenFromList: false, description: "Streak days" },
  },
});
