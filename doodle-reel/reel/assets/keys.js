/* Key-press and cue times shared by the drawings (hands) and the sound clips.
   Seconds, whole Reel. Every press lands on the 10-drawings-per-second grid
   (level 2 adds a few half-step presses at +0.05 s to reach ~12 presses a second). */
(function () {
  const D = (window.Doodle = window.Doodle || {});

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // level 1: ~6 light clicks a second, 0.6 - 2.0 s
  const L1 = [];
  {
    const r = rng(11);
    let t = 6;
    while (t <= 20) {
      L1.push(t / 10);
      t += [1, 2, 2][Math.floor(r() * 3)];
    }
  }
  // level 2: ~12 harder presses a second, 10.4 - 11.6 s
  const L2 = [];
  {
    const r = rng(22);
    for (let t = 104; t <= 116; t++) {
      L2.push(t / 10);
      if (r() < 0.15) L2.push(Math.round((t / 10 + 0.05) * 100) / 100);
    }
  }

  D.KEYS = {
    DURATIONS: [4, 3, 3, 4, 4, 3, 4, 5],
    STARTS: [0, 4, 7, 10, 14, 18, 21, 25],
    LEVEL1: L1,
    LEVEL2: L2,
    LEVEL3: [18.6, 19.1, 19.7], // three slow, heavy stabs
    ENTER: { 1: 2.2, 2: 11.8, 3: 20.2 },
    THUD: 16.2, // fist on the desk, loudest sound
    ANSWER3: 20.5, // the third generic answer
    POP: 22.0, // things pop into her hair
    TICKS: [26.5, 28.5], // cursor blinks
  };
})();
