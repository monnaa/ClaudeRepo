#!/usr/bin/env bash
# Join the 8 scenes, mix music.wav under them (AAC, picture copied), write the 4 deliverables.
set -euo pipefail
cd "$(dirname "$0")"
OUT=outputs; B=build
mkdir -p "$OUT"
: > $B/list.txt
for s in 1 2 3 4 5 6 7 8; do echo "file 'scenes/scene$s.mp4'" >> $B/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i $B/list.txt -c copy $B/video.mp4
if [ -s $B/music.wav ]; then
  ffmpeg -y -loglevel error -i $B/video.mp4 -i $B/music.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
    -movflags +faststart $OUT/reel.mp4
else
  echo "no music.wav: shipping silent"; cp $B/video.mp4 $OUT/reel.mp4
fi
ffmpeg -y -loglevel error -i $OUT/reel.mp4 -vf "fps=10,scale=200:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=24:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" $OUT/reel-preview.gif
F=$B/frames
python3 sheet.py $OUT/reel-stills.png $F/s1/015.png $F/s2/012.png $F/s3/020.png $F/s4/026.png \
  $F/s5/025.png $F/s6/022.png $F/s7/032.png $F/s8/045.png
cat > $OUT/captions.srt <<'SRT'
1
00:00:00,300 --> 00:00:03,800
Fais-moi un truc sur le marketing.

2
00:00:04,200 --> 00:00:06,900
Une réponse générique. Évidemment.

3
00:00:07,200 --> 00:00:09,900
Je reste calme.

4
00:00:10,000 --> 00:00:12,000
Je retape. En plus fort.

5
00:00:12,200 --> 00:00:14,000
Toujours aussi générique.

6
00:00:14,200 --> 00:00:17,900
Cette IA est nulle !

7
00:00:18,200 --> 00:00:20,900
Dernier essai.

8
00:00:25,200 --> 00:00:28,000
L'IA ne lit pas dans ta tête.

9
00:00:28,000 --> 00:00:30,000
Va apprendre à prompter.
SRT
ls -la $OUT
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames -of compact $OUT/reel.mp4
