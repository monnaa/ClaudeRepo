import { Composition, Folder } from "remotion";
import { FitMates } from "./FitMates";
import { Match } from "./scenes/Match";
import { Streak } from "./scenes/Streak";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="FitMatesPromo" component={FitMates} durationInFrames={450} fps={30} width={1080} height={1920} />
      <Folder name="Scenes">
        <Composition
          id="MatchScene"
          component={Match}
          durationInFrames={114}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            mateName: "Sam",
            distance: "0.8 km away",
            activity: "Running · 6 AM",
            style: { backgroundColor: "#0E0F13", justifyContent: "center", alignItems: "center" },
          }}
        />
        <Composition
          id="StreakScene"
          component={Streak}
          durationInFrames={105}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            streakDays: 21,
            style: { backgroundColor: "#FF5C39", justifyContent: "center", alignItems: "center" },
          }}
        />
      </Folder>
    </>
  );
};
