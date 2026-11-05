# Review: Reel v2 (character bank)

Render: `outputs/v2/reel.mp4`, 1080x1920, 30 fps, 30.0 s, H.264 + AAC.
`npx hyperframes check`: 0 findings (lint, runtime, layout, motion, contrast, audio).

## What changed from the storyboard
The character comes from the bank `banque_personnage_mycaracter_v3` (assets/bank/), not the drawn doodle.
Each scene uses one pose, animated as a cut-out on the 10-drawings-a-second grid (stepped jitter,
squash and stretch, pops). The chatbot is a drawn panel with grey lines only.

| # | Time | Pose | Beat |
|---|------|------|------|
| 1 | 0-4 | P01 ordinateur | types (level 1 keys), sends a short line |
| 2 | 4-7 | P01 -> P04 loupe | generic answer arrives, "?!" |
| 3 | 7-10 | P06 pause café (close-up) | "Je reste calme.", tremble, first red mark |
| 4 | 10-14 | P01 | retypes harder (level 2), same answer, red marks |
| 5 | 14-18 | P10 stress | explodes, slam + frame jolt at 16.2 s, freeze last 20 frames |
| 6 | 18-21 | P01 slumped | three heavy stabs (level 3), same answer at 20.5 s |
| 7 | 21-25 | P07 post-it | silence, sweat drop, post-its land in her hair at 22 s, empty thought bubble |
| 8 | 25-30 | P03 idée (close-up) | empty input bar, cursor blinks on the ticks, post-it slides over one eye |

## Sound (measured, not listened to)
- Music: the bed from the first Reel (`../music.py`, music only): HeyGen's catalog needs the `heygen` CLI, which is not installed here.
- Effects: HyperFrames' bundled library (key clicks, key press, bass impact, pop, click).
- Mix: integrated -20.7 LUFS, true peak -5.3 dBTP, no clipping. Quieter than the usual -16/-14 LUFS social target, by design of the brief's levels.

## Known limits
- The bank's poses are illustrated (not flat doodles), and some carry their own props (heart, bulb, scribble, post-its).
- No real arm or face animation: poses are single images, not rigs.
- The P03 light bulb is part of the pose, so it is there from the first frame of scene 8.
