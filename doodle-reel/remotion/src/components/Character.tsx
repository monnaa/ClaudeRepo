import type React from "react";
import { Img, Interactive, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { boil, drawingAt } from "../lib/rig";

/** What the pose does at a moment: offsets on top of the hand-held boil. */
export type Motion = (t: number, drawing: number) => {
  x?: number;
  y?: number;
  rot?: number;
  sx?: number;
  sy?: number;
};

const still: Motion = () => ({});

const CharacterInner: React.FC<{
  readonly pose: string;
  readonly shake: number;
  readonly seed: number;
  readonly pivot: string;
  readonly freezeAfter: number;
  readonly motion?: Motion;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ pose, shake, seed, pivot, freezeAfter, motion = still, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // after `freezeAfter` seconds the drawing holds (a comic freeze); 0 = never
  const t = freezeAfter > 0 ? Math.min(frame / fps, freezeAfter) : frame / fps;
  const drawing = drawingAt(t * fps, fps);
  const b = boil(drawing, seed, shake, shake * 0.15);
  const m = motion(Math.round(t * 10) / 10, drawing);
  return (
    <div style={{ position: "absolute", ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: pivot,
          translate: `${b.x + (m.x ?? 0)}px ${b.y + (m.y ?? 0)}px`,
          rotate: `${b.rot + (m.rot ?? 0)}deg`,
          scale: `${m.sx ?? 1} ${m.sy ?? 1}`,
        }}
      >
        <Img showInTimeline={false} src={staticFile(pose)} style={{ width: "100%", height: "100%", display: "block" }} />
        {children}
      </div>
    </div>
  );
};

/**
 * The woman from the character bank. In Studio you can swap the pose image,
 * change how much she shakes, and move or resize her.
 */
export const Character = Interactive.create({
  Component: CharacterInner,
  componentName: "Character",
  layout: "none",
  schema: {
    pose: { type: "asset", assetType: "image", default: "bank/P01_ordinateur.png", description: "Pose (image)" },
    shake: { type: "number", default: 2, min: 0, max: 20, step: 0.5, description: "Hand-held shake (px)", hiddenFromList: false },
    seed: { type: "number", default: 1, step: 1, description: "Shake variation", keyframable: false, hiddenFromList: false },
    pivot: { type: "string", default: "50% 100%", description: "Squash pivot" },
    freezeAfter: { type: "number", default: 0, min: 0, step: 0.1, description: "Freeze after (s), 0 = never", keyframable: false, hiddenFromList: false },
  },
});
