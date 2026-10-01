// Shared by the film page and the soundtrack, so picture and sound line up exactly.
var FPS = 30;
var DURATION = 22.5;
// [start, end, fromP, toP]: camera/story moves; the story holds still between them.
var MOVES = [
  [3.6, 4.8, 0, 1],
  [6.0, 7.4, 1, 2],
  [8.6, 9.8, 2, 3],
  [11.2, 13.0, 3, 4],
  [14.2, 15.4, 4, 5],
  [16.4, 17.8, 5, 6],
];
function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function clamp01(x) { return Math.min(1, Math.max(0, x)); }
function pAt(t) {
  var p = 0;
  for (var i = 0; i < MOVES.length; i++) {
    var m = MOVES[i];
    if (t >= m[1]) p = m[3];
    else if (t > m[0]) return m[2] + (m[3] - m[2]) * ease((t - m[0]) / (m[1] - m[0]));
  }
  return p;
}
// First time the story reaches position p.
function timeOfP(p) {
  for (var t = 0; t <= DURATION; t += 0.001) if (pAt(t) >= p) return t;
  return DURATION;
}
// Overlay envelopes.
function smooth(a, b, t) { var x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); }
var HOOK_WORDS = ["You", "tap", "Confirm."];
var HOOK = { wordAt: [0.15, 0.4, 0.65], out: [1.5, 1.85] };
var SITE_IN = [1.6, 2.3];
var SITE_OUT = [18.85, 19.25];
var END = { in: [19.15, 19.6], line: [19.5, 19.9], cta: [19.85, 20.25] };
if (typeof module !== "undefined") module.exports = { FPS, DURATION, MOVES, pAt, timeOfP, HOOK, SITE_IN, SITE_OUT, END };
