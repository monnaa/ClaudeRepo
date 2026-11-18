import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, fontFamily } from "../theme";

// Feature 1: a profile card slides in, gets swiped right, "It's a match!" pops.
const MatchInner = ({ mateName, distance, activity }: { readonly mateName: string; readonly distance: string; readonly activity: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 16 } });
  const card = spring({ frame: frame - 12, fps, config: { damping: 14 } });
  const swipe = spring({ frame: frame - 55, fps, config: { damping: 18 } });
  const badge = spring({ frame: frame - 62, fps, config: { damping: 8 } });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 90, fontFamily }}>
      <Interactive.Div
        name="Match headline"
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: COLORS.white,
          textAlign: "center",
          textWrap: "balance",
          lineHeight: 1.05,
          padding: "0 100px",
          opacity: head,
          translate: `0 ${interpolate(head, [0, 1], [50, 0])}px`,
        }}
      >
        Match with mates <span style={{ color: COLORS.lime }}>near you</span>
      </Interactive.Div>

      <div style={{ position: "relative", width: 760, height: 820 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 56,
            backgroundColor: COLORS.card,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            translate: `${interpolate(card, [0, 1], [900, 0]) + swipe * 50}px 0`,
            rotate: `${swipe * 4}deg`,
            boxShadow: `0 0 0 6px ${interpolate(swipe, [0, 1], [0, 1]) > 0.5 ? COLORS.lime : "transparent"}`,
          }}
        >
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 150,
              background: `linear-gradient(135deg, ${COLORS.coral}, ${COLORS.lime})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 130,
              fontWeight: 800,
              color: COLORS.ink,
            }}
          >
            {mateName.slice(0, 1)}
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, color: COLORS.white }}>{mateName}</div>
          <div style={{ fontSize: 48, fontWeight: 500, color: COLORS.muted }}>{distance}</div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: COLORS.ink,
              backgroundColor: COLORS.lime,
              padding: "14px 40px",
              borderRadius: 100,
            }}
          >
            {activity}
          </div>
        </div>

        <Interactive.Div
          name="Match badge"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -70,
            translate: "-50% 0",
            whiteSpace: "nowrap",
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.ink,
            backgroundColor: COLORS.coral,
            padding: "22px 56px",
            borderRadius: 100,
            scale: String(badge),
            rotate: "-4deg",
          }}
        >
          It's a match!
        </Interactive.Div>
      </div>
    </div>
  );
};

export const Match = Interactive.create({
  Component: MatchInner,
  componentName: "Match",
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    mateName: { type: "string", default: "Sam", description: "Mate name" },
    distance: { type: "string", default: "0.8 km away", description: "Distance" },
    activity: { type: "string", default: "Running · 6 AM", description: "Activity" },
  },
});
