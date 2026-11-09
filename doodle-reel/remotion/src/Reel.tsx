import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, Track, useVideoConfig } from "remotion";
import { CUES } from "./cues";
import { Caption } from "./components/Caption";
import { rng } from "./lib/rig";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";
import { Scene8 } from "./scenes/Scene8";

export type ReelProps = {
  readonly showCaptions: boolean;
};

// Peaks of the sound files, so `volume` lands each key at its intended level.
const KEY_SOFT = 1 / 0.537;
const KEY_PRESS = 1 / 0.519;

/** Each key press of a typing burst, one sound per press, read from cues.ts. */
const KeyBurst: React.FC<{ readonly times: number[]; readonly file: string; readonly level: number; readonly seed: number }> = ({
  times,
  file,
  level,
  seed,
}) => {
  const { fps } = useVideoConfig();
  const r = rng(seed);
  return (
    <>
      {times.map((t, i) => (
        <Audio
          key={i}
          name={`Touche ${i + 1}`}
          src={staticFile(file)}
          from={Math.round(t * fps)}
          durationInFrames={12}
          volume={level * (0.85 + r() * 0.3)}
        />
      ))}
    </>
  );
};

export const Reel: React.FC<ReelProps> = ({ showCaptions }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6EFE3" }}>
      <Track name="Scènes">
        <Scene1 name="1 · Elle tape" durationInFrames={4 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene2 name="2 · Réponse générique" from={4 * fps} durationInFrames={3 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene3 name="3 · Je reste calme" from={7 * fps} durationInFrames={3 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene4 name="4 · Elle retape" from={10 * fps} durationInFrames={4 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene5 name="5 · Elle explose" from={14 * fps} durationInFrames={4 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene6 name="6 · Dernier essai" from={18 * fps} durationInFrames={3 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene7 name="7 · Silence" from={21 * fps} durationInFrames={4 * fps} style={{ backgroundColor: "#F6EFE3" }} />
        <Scene8 name="8 · La chute" from={25 * fps} durationInFrames={5 * fps} style={{ backgroundColor: "#F6EFE3" }} />
      </Track>

      <Track name="Sous-titres" hidden={!showCaptions}>
        <Caption name="ST 1" from={0.3 * fps} durationInFrames={3.5 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Fais-moi un truc sur le marketing.
        </Caption>
        <Caption name="ST 2" from={4.2 * fps} durationInFrames={2.7 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Une réponse générique. Évidemment.
        </Caption>
        <Caption name="ST 3" from={7.2 * fps} durationInFrames={2.7 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Je reste calme.
        </Caption>
        <Caption name="ST 4" from={10 * fps} durationInFrames={2 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Je retape. En plus fort.
        </Caption>
        <Caption name="ST 5" from={12.2 * fps} durationInFrames={1.8 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Toujours aussi générique.
        </Caption>
        <Caption name="ST 6" from={14.2 * fps} durationInFrames={3.7 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Cette IA est nulle !
        </Caption>
        <Caption name="ST 7" from={18.2 * fps} durationInFrames={2.7 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Dernier essai.
        </Caption>
        <Caption name="ST 8" from={25.2 * fps} durationInFrames={2.8 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          L'IA ne lit pas dans ta tête.
        </Caption>
        <Caption name="ST 9" from={28 * fps} durationInFrames={2 * fps} style={{ color: "#FFFFFF", fontSize: 54, fontWeight: 700 }}>
          Va apprendre à prompter.
        </Caption>
      </Track>

      <Track name="Musique">
        <Audio name="Musique" src={staticFile("audio/music.wav")} volume={1} />
      </Track>

      <Track name="Clavier (temps dans cues.ts)">
        <KeyBurst times={CUES.keys1} file="audio/key-soft.mp3" level={0.1 * KEY_SOFT} seed={11} />
        <KeyBurst times={CUES.keys2} file="audio/key-press.mp3" level={0.2 * KEY_PRESS} seed={22} />
        <KeyBurst times={CUES.keys3} file="audio/key-press.mp3" level={0.32 * KEY_PRESS} seed={33} />
      </Track>

      <Track name="Bruitages">
        <Audio name="Entrée 1" src={staticFile("audio/key-press.mp3")} from={Math.round(CUES.enter1 * fps)} durationInFrames={12} volume={0.23} />
        <Audio name="Entrée 2" src={staticFile("audio/key-press.mp3")} from={Math.round(CUES.enter2 * fps)} durationInFrames={12} volume={0.5} />
        <Audio name="Coup de poing" src={staticFile("audio/thud.mp3")} from={Math.round(CUES.slam * fps)} durationInFrames={2 * fps} volume={0.47} />
        <Audio name="Entrée 3" src={staticFile("audio/key-press.mp3")} from={Math.round(CUES.enter3 * fps)} durationInFrames={12} volume={0.69} />
        <Audio name="Pop des post-it" src={staticFile("audio/pop.mp3")} from={Math.round(CUES.pop * fps)} durationInFrames={21} volume={0.2} />
        <Audio name="Tic 1" src={staticFile("audio/click.mp3")} from={Math.round(CUES.ticks[0] * fps)} durationInFrames={11} volume={0.13} />
        <Audio name="Tic 2" src={staticFile("audio/click.mp3")} from={Math.round(CUES.ticks[1] * fps)} durationInFrames={11} volume={0.13} />
      </Track>
    </AbsoluteFill>
  );
};
