import type React from "react";
import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";
import { drawingAt, ellipse, GREY, INK, line, popScale, rng, rrect, variantAt } from "../lib/rig";

const S = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const G = { stroke: GREY, strokeWidth: 9, strokeLinecap: "round" as const, fill: "none" };
const N = 8; // dashes that fill the input bar
const dashX = (i: number) => 62 + i * 76;

/** Seconds -> "appears at" semantics: null = never, <= 0 = there from the start, > 0 = pops then. */
type At = number | null;
const shownScale = (at: At, t: number) => {
  if (at === null) return 0;
  if (at <= 0) return 1;
  if (t < at) return 0;
  return popScale(Math.floor((t - at) * 10 + 1e-6), 1.1);
};

const ChatPanelInner: React.FC<{
  readonly keys: number[];
  readonly enter: At;
  readonly userAt: At;
  readonly botAt: At;
  readonly botHideAt: At;
  readonly cursorOnAt: number[];
  readonly barOnly: boolean;
  readonly seed: number;
  readonly style?: React.CSSProperties;
}> = ({ keys, enter, userAt, botAt, botHideAt, cursorOnAt, barOnly, seed, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drawing = drawingAt(frame, fps);
  const t = Math.floor((frame / fps) * 10 + 1e-6) / 10; // on the drawing grid
  const R = (part: number) => rng(seed * 13 + part * 7 + variantAt(drawing, seed + part) * 101);

  // typed dashes: each key press fills the bar a little more; Enter empties it
  const pressed = keys.filter((k) => t >= k - 1e-6).length;
  const sent = enter !== null && enter > 0 && t >= enter - 1e-6;
  const typed = sent || pressed === 0 ? -1 : Math.ceil((pressed * N) / keys.length) - 1;
  const cursorX = typed < 0 ? 62 : dashX(typed) + 64;
  // cursor: steady while typing, blinks twice a second otherwise, or on given beats
  let cursorOn: boolean;
  if (cursorOnAt.length > 0) {
    cursorOn = cursorOnAt.some((c) => t >= c && t < c + 1);
  } else {
    cursorOn = pressed > 0 && !sent ? true : Math.floor(t * 2) % 2 === 0;
  }
  const userScale = sent ? popScale(Math.floor((t - (enter as number)) * 10 + 1e-6)) : shownScale(userAt, t);
  const botScale = botHideAt !== null && t >= botHideAt && (botAt === null || botAt <= botHideAt || t < botAt) ? 0 : shownScale(botAt, t);

  const box = (cx: number, cy: number, k: number) => ({
    transformOrigin: `${cx}px ${cy}px`,
    scale: k,
    opacity: k > 0 ? 1 : 0,
  });

  return (
    <svg viewBox="0 0 820 290" style={{ position: "absolute", overflow: "visible", ...style }}>
      {!barOnly && (
        <g>
          <path d={rrect(8, 8, 804, 274, 30, R(1), 2.2)} fill="#FFFCF6" {...S} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={ellipse(40 + i * 26, 34, 7, 7, R(2 + i), 1, 10)} fill="none" {...S} strokeWidth={3} />
          ))}
          {/* her message: a short terracotta bubble */}
          <g style={box(625, 43, userScale)}>
            <path d={rrect(470, 22, 310, 42, 21, R(5), 2)} fill="#EDC7B3" {...S} />
            <path d={line(500, 43, 700, 43, R(6), 1.2)} stroke="#B9785A" strokeWidth={9} strokeLinecap="round" fill="none" />
          </g>
          {/* the chatbot's generic answer: grey lines, no words */}
          <g style={box(316, 140, botScale)}>
            <path d={rrect(36, 78, 560, 124, 22, R(7), 2)} fill="#EFEBE4" {...S} />
            {[430, 480, 380, 450, 300].map((w, i) => (
              <path key={i} d={line(64, 98 + i * 22, 64 + w, 98 + i * 22, R(8 + i), 1.2)} {...G} strokeWidth={8} />
            ))}
          </g>
        </g>
      )}
      <path d={rrect(30, 216, 760, 52, 26, R(20), 2)} fill="#FFFFFF" {...S} />
      <path d={ellipse(752, 242, 17, 17, R(21), 1.2, 12)} fill="#C4623E" {...S} strokeWidth={3} />
      {Array.from({ length: N }, (_, i) =>
        i <= typed ? <path key={i} d={line(dashX(i), 242, dashX(i) + 44 + ((i * 37) % 23), 242, R(30 + i), 1.4)} {...G} /> : null,
      )}
      {cursorOn && <path d={line(cursorX, 226, cursorX, 258, R(40), 1)} stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" />}
    </svg>
  );
};

/**
 * The chatbot window: only grey lines and boxes, never text.
 * Times (keys, enter, userAt, botAt...) are in seconds from the start of its clip.
 */
export const ChatPanel = Interactive.create({
  Component: ChatPanelInner,
  componentName: "ChatPanel",
  layout: "none",
  schema: {
    barOnly: { type: "boolean", default: false, description: "Only the input bar" },
    seed: { type: "number", default: 1, step: 1, description: "Line variation", keyframable: false, hiddenFromList: false },
  },
});
