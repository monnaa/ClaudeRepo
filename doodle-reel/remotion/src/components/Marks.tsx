import type React from "react";
import { Img, Interactive, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cloud, drawingAt, ellipse, GREY, INK, jit, line, polyPath, popScale, RED, rng, variantAt } from "../lib/rig";

const stroke = (c: string, w: number) => ({
  stroke: c,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

// Each drawing returns SVG children for one line variant, in its own viewBox.
const DRAW: Record<string, { box: [number, number]; draw: (r: () => number, color: string) => React.ReactNode }> = {
  // "?!" drawn with strokes (no letters)
  qbang: {
    box: [160, 160],
    draw: (r) => (
      <>
        <path d={polyPath([[22, 46], [34, 22], [62, 16], [82, 34], [76, 60], [56, 74], [54, 100]], r, 2.5, false)} {...stroke(INK, 11)} />
        <path d={ellipse(54, 130, 6, 6, r, 1, 8)} {...stroke(INK, 5)} fill={INK} />
        <path d={line(118, 18, 112, 98, r, 2.5)} {...stroke(INK, 12)} />
        <path d={ellipse(111, 130, 6.5, 6.5, r, 1, 8)} {...stroke(INK, 5)} fill={INK} />
      </>
    ),
  },
  // surprise lines fanning out
  lines: {
    box: [200, 120],
    draw: (r, color) => (
      <>
        {[[30, 100, 10, 70], [70, 60, 60, 20], [120, 56, 130, 16], [165, 96, 190, 66]].map(([a, b, c, d], i) => (
          <path key={i} d={line(a, b, c, d, r, 2)} {...stroke(color, 8)} />
        ))}
      </>
    ),
  },
  // anger vein
  anger: {
    box: [120, 120],
    draw: (r, color) => (
      <>
        {[
          [[52, 18], [50, 48], [20, 50]],
          [[68, 18], [70, 48], [100, 50]],
          [[52, 102], [50, 72], [20, 70]],
          [[68, 102], [70, 72], [100, 70]],
        ].map((pts, i) => (
          <path key={i} d={polyPath(pts as [number, number][], r, 2.5, false)} {...stroke(color, 11)} />
        ))}
      </>
    ),
  },
  // impact burst
  burst: {
    box: [400, 400],
    draw: (r, color) => (
      <>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + jit(r, 0.12);
          const r0 = 120 + jit(r, 14);
          const r1 = 185 + jit(r, 18);
          return (
            <path
              key={i}
              d={line(200 + Math.cos(a) * r0, 200 + Math.sin(a) * r0, 200 + Math.cos(a) * r1, 200 + Math.sin(a) * r1, r, 3)}
              {...stroke(i % 2 ? INK : color, 12)}
            />
          );
        })}
      </>
    ),
  },
  // empty thought bubble (a shape, no text)
  thought: {
    box: [460, 360],
    draw: (r) => (
      <>
        <path d={cloud(260, 140, 170, 105, r, 3)} {...stroke(INK, 6)} fill="#FFFCF6" />
        <path d={ellipse(110, 285, 26, 20, r, 2, 12)} {...stroke(INK, 5)} fill="#FFFCF6" />
        <path d={ellipse(58, 335, 14, 11, r, 1.5, 10)} {...stroke(INK, 5)} fill="#FFFCF6" />
      </>
    ),
  },
  // sweat drop
  sweat: {
    box: [60, 90],
    draw: (r) => (
      <path d={polyPath([[30, 6], [44, 46], [42, 70], [30, 82], [18, 70], [16, 46]], r, 1.5, true)} {...stroke(INK, 5)} fill="#BFD9E6" />
    ),
  },
  // soft floor shadow
  shadow: {
    box: [700, 60],
    draw: (r) => <path d={ellipse(350, 30, 330, 24, r, 3, 20)} fill="#E9DDCB" />,
  },
  // a short grey line (placeholder for text, never letters)
  dash: { box: [200, 20], draw: (r) => <path d={line(10, 10, 190, 10, r, 1.4)} {...stroke(GREY, 9)} /> },
};

export type MarkKind = keyof typeof DRAW;

const MarkInner: React.FC<{
  readonly kind: MarkKind;
  readonly color: string;
  readonly overshoot: number;
  readonly shake: number;
  readonly flip: boolean;
  readonly seed: number;
  readonly style?: React.CSSProperties;
}> = ({ kind, color, overshoot, shake, flip, seed, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drawing = drawingAt(frame, fps);
  const def = DRAW[kind] ?? DRAW.anger;
  const v = variantAt(drawing, seed);
  const r = rng(seed * 31 + v * 7 + 1);
  const s = rng(seed * 131 + drawing);
  const k = popScale(drawing, overshoot);
  const dx = drawing > 3 ? jit(s, shake) : 0;
  const dy = drawing > 3 ? jit(s, shake) : 0;
  return (
    <svg
      viewBox={`0 0 ${def.box[0]} ${def.box[1]}`}
      style={{
        position: "absolute",
        overflow: "visible",
        translate: `${dx}px ${dy}px`,
        scale: `${flip ? -k : k} ${k}`,
        ...style,
      }}
    >
      {def.draw(r, color)}
    </svg>
  );
};

/**
 * A hand-drawn mark (anger vein, "?!", burst, thought bubble...). It pops in
 * when its clip starts: drag the clip in Studio to change when it appears.
 */
export const Mark = Interactive.create({
  Component: MarkInner,
  componentName: "Mark",
  layout: "none",
  schema: {
    kind: {
      type: "enum",
      default: "anger",
      description: "Mark",
      variants: { qbang: {}, lines: {}, anger: {}, burst: {}, thought: {}, sweat: {}, shadow: {}, dash: {} },
    },
    color: { type: "color", default: RED, description: "Colour" },
    overshoot: { type: "number", default: 1.2, min: 1, max: 2, step: 0.05, description: "Pop overshoot", hiddenFromList: false },
    shake: { type: "number", default: 0, min: 0, max: 20, step: 0.5, description: "Shake after pop (px)", hiddenFromList: false },
    flip: { type: "boolean", default: false, description: "Mirror" },
    seed: { type: "number", default: 1, step: 1, description: "Line variation", keyframable: false, hiddenFromList: false },
  },
});

const StickerInner: React.FC<{
  readonly src: string;
  readonly overshoot: number;
  readonly shake: number;
  readonly seed: number;
  readonly style?: React.CSSProperties;
}> = ({ src, overshoot, shake, seed, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drawing = drawingAt(frame, fps);
  const k = popScale(drawing, overshoot);
  const s = rng(seed * 131 + drawing);
  return (
    <div
      style={{
        position: "absolute",
        translate: drawing > 3 ? `${jit(s, shake)}px ${jit(s, shake)}px` : "0px 0px",
        scale: k,
        ...style,
      }}
    >
      <Img showInTimeline={false} src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

/** An image from the bank's accessories (post-it, lightning...) that pops in. */
export const Sticker = Interactive.create({
  Component: StickerInner,
  componentName: "Sticker",
  layout: "none",
  schema: {
    src: { type: "asset", assetType: "image", default: "bank/A08_postit_02.png", description: "Image" },
    overshoot: { type: "number", default: 1.3, min: 1, max: 2, step: 0.05, description: "Pop overshoot", hiddenFromList: false },
    shake: { type: "number", default: 0, min: 0, max: 20, step: 0.5, description: "Shake after pop (px)", hiddenFromList: false },
    seed: { type: "number", default: 1, step: 1, description: "Shake variation", keyframable: false, hiddenFromList: false },
  },
});

/** The soft floor shadow under her (decoration, not a timeline item). */
export const Shadow: React.FC<{ readonly style: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = rng(77 + variantAt(drawingAt(frame, fps), 77));
  return (
    <svg viewBox="0 0 700 60" style={{ position: "absolute", overflow: "visible", ...style }}>
      <path d={ellipse(350, 30, 330, 24, r, 3, 20)} fill="#E9DDCB" />
    </svg>
  );
};
