// THE TIMING OF THE REEL, in seconds from the start of the video.
// The drawings (key presses, slam, pop, cursor) and the sounds both read this
// file, so picture and sound stay in sync. Change a number here and both move.

export const SCENES = {
  s1: { start: 0, duration: 4 },
  s2: { start: 4, duration: 3 },
  s3: { start: 7, duration: 3 },
  s4: { start: 10, duration: 4 },
  s5: { start: 14, duration: 4 },
  s6: { start: 18, duration: 3 },
  s7: { start: 21, duration: 4 },
  s8: { start: 25, duration: 5 },
};

export const CUES = {
  /** Scene 1: light, quick key clicks. */
  keys1: [0.6, 0.8, 0.9, 1.1, 1.3, 1.5, 1.6, 1.8, 1.9],
  enter1: 2.2,
  /** Scene 4: faster and harder. */
  keys2: [10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6],
  enter2: 11.8,
  /** Scene 6: three slow, heavy stabs. */
  keys3: [18.6, 19.1, 19.7],
  enter3: 20.2,
  /** Scene 5: the fist on the desk, the loudest moment. */
  slam: 16.2,
  /** Scene 7: post-its land in her hair. */
  pop: 22.0,
  /** Scene 8: the cursor blinks back on. */
  ticks: [26.5, 28.5],
};
