import type React from "react";
import { Interactive } from "remotion";

const CaptionInner: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 90,
      right: 90,
      top: 1560,
      textAlign: "center",
      fontFamily: "Arial, Helvetica, sans-serif",
      lineHeight: 1.2,
      ...style,
    }}
  >
    <span
      style={{
        display: "inline-block",
        padding: "14px 30px",
        borderRadius: 28,
        background: "rgba(43,43,43,0.88)",
        boxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  </div>
);

/** One subtitle line. Edit the text, colour and size in Studio; drag it on the timeline. */
export const Caption = Interactive.create({
  Component: CaptionInner,
  componentName: "Caption",
  layout: "none",
  schema: {
    ...Interactive.textSchema,
    ...Interactive.childrenSchema,
  },
});
