import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";

// The uploaded Fitmates_v2 video, as is, so it can be viewed and trimmed in Studio.
export const FitmatesV2 = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }}>
    <Video name="Fitmates v2" src={staticFile("fitmates-v2.mp4")} />
  </AbsoluteFill>
);
