import { Composition, Folder } from "remotion";
import { Reel } from "./Reel";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";
import { Scene8 } from "./scenes/Scene8";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ showCaptions: false }}
      />
      <Folder name="Scenes">
        <Composition id="Scene1" component={Scene1} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene2" component={Scene2} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene3" component={Scene3} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene4" component={Scene4} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene5" component={Scene5} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene6" component={Scene6} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene7" component={Scene7} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
        <Composition id="Scene8" component={Scene8} durationInFrames={150} fps={30} width={1080} height={1920} defaultProps={{ style: { backgroundColor: "#F6EFE3" } }} />
      </Folder>
    </>
  );
};
