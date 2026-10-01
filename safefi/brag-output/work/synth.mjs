// Procedural soundtrack: D-major bed at 96 BPM + in-key effects timed from the
// same timeline as the picture. Writes soundtrack.wav (48 kHz stereo).
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const tl = createRequire(import.meta.url)("./timeline.js");
const SR = 48000, DUR = tl.DURATION, N = Math.round(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const sendL = new Float32Array(N), sendR = new Float32Array(N); // reverb send
const BEAT = 60 / 96, BAR = BEAT * 4;

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const N_ = { D: 62, E: 64, Fs: 66, G: 67, A: 69, B: 71, Cs: 73 };

function add(t0, len, fn, { gain = 1, pan = 0, send = 0 } = {}) {
  const s0 = Math.max(0, Math.floor(t0 * SR)), s1 = Math.min(N, Math.floor((t0 + len) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR, v = fn(t);
    L[i] += v * gl; R[i] += v * gr;
    if (send) { sendL[i] += v * gl * send; sendR[i] += v * gr * send; }
  }
}
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

// ---- instruments -----------------------------------------------------------
function padNote(t0, len, midi, gain) {
  const f = hz(midi);
  add(t0, len + 0.6, (t) => {
    const e = Math.min(1, t / 0.45) * (t > len ? Math.exp(-(t - len) / 0.25) : 1);
    let v = 0;
    for (const d of [-0.12, 0, 0.11]) {
      const ff = f * Math.pow(2, d / 12);
      v += Math.sin(2 * Math.PI * ff * t) + 0.28 * Math.sin(4 * Math.PI * ff * t) + 0.08 * Math.sin(6 * Math.PI * ff * t);
    }
    return (v / 3) * e;
  }, { gain, pan: (midi % 5) / 5 - 0.4, send: 0.5 });
}
function pluck(t0, midi, gain, pan = 0, send = 0.35) {
  const f = hz(midi);
  add(t0, 0.9, (t) => {
    const e = env(t, 0.004, 0.18);
    return (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t / 0.05)) * e;
  }, { gain, pan, send });
}
function bell(t0, midi, gain, pan = 0) {
  const f = hz(midi);
  add(t0, 2.6, (t) => {
    const e = env(t, 0.003, 0.7);
    return (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * f * 2.0 * t) * Math.exp(-t / 0.35) + 0.2 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t / 0.2)) * e;
  }, { gain, pan, send: 0.6 });
}
function bass(t0, midi, gain, len = 0.55) {
  const f = hz(midi);
  add(t0, len + 0.2, (t) => {
    const e = Math.min(1, t / 0.008) * Math.exp(-t / (len * 0.7));
    return (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * e;
  }, { gain });
}
function kick(t0, gain) {
  add(t0, 0.45, (t) => {
    const ph = 2 * Math.PI * (45 * t + (75 / 18) * (1 - Math.exp(-18 * t)) );
    return Math.sin(ph) * Math.exp(-t / 0.13);
  }, { gain });
}
function hat(t0, gain, pan) {
  let lp = 0;
  add(t0, 0.08, (t) => { const n = rnd(); lp += 0.6 * (n - lp); return (n - lp) * Math.exp(-t / 0.022); }, { gain, pan });
}
function swell(t0, len, gain) {
  // Airy filtered-noise rise for camera moves.
  let lp = 0;
  add(t0 - 0.15, len + 0.4, (t) => {
    const x = Math.min(1, t / (len + 0.4));
    const cutoff = 0.01 + 0.07 * Math.sin(Math.PI * x);
    lp += cutoff * (rnd() - lp);
    return lp * Math.pow(Math.sin(Math.PI * x), 1.6);
  }, { gain, send: 0.6 });
}
function tick(t0, gain) {
  add(t0, 0.12, (t) => Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t / 0.012) + rnd() * 0.3 * Math.exp(-t / 0.004), { gain, send: 0.3 });
}
function thump(t0, gain) {
  add(t0, 0.8, (t) => Math.sin(2 * Math.PI * (hz(38) * t + 6 * (1 - Math.exp(-25 * t)))) * Math.exp(-t / 0.22), { gain, send: 0.2 });
}

// ---- music -----------------------------------------------------------------
const D = N_.D, CH = {
  D: [D - 12, N_.Fs - 12, N_.A - 12, N_.Cs - 12],
  Bm: [N_.B - 24, N_.D - 12, N_.Fs - 12, N_.A - 12],
  G: [N_.G - 24, N_.B - 24, N_.D - 12, N_.Fs - 12],
  A: [N_.A - 24, N_.Cs - 12, N_.E - 12, N_.G - 12],
  Dend: [D - 12, N_.Fs - 12, N_.A - 12, N_.E],
};
const ROOT = { D: 38, Bm: 35, G: 43, A: 45, Dend: 38 };
const PROG = ["D", "D", "Bm", "G", "A", "D", "Bm", "A", "Dend"];
PROG.forEach((c, bar) => {
  const t = bar * BAR;
  const last = bar === PROG.length - 1;
  CH[c].forEach((m) => padNote(t, last ? DUR - t : BAR, m, bar === 0 ? 0.05 : 0.065));
  if (bar >= 1 && !last) {
    bass(t, ROOT[c], 0.24); bass(t + BEAT * 2, ROOT[c], 0.2); bass(t + BEAT * 3.5, ROOT[c] + 12, 0.14, 0.25);
  }
  if (last) bass(t, ROOT[c], 0.32, 2.2);
  if (bar >= 1 && !last) for (let b = 0; b < 4; b++) if (bar >= 2 || b % 2 === 0) kick(t + b * BEAT, 0.2);
  if (last) kick(t, 0.2);
  if (bar >= 2 && !last) for (let b = 0; b < 4; b++) hat(t + b * BEAT + BEAT / 2, 0.07, b % 2 ? 0.3 : -0.3);
  if (bar >= 2 && !last) {
    const tones = CH[c].slice(1).map((m) => m + 24);
    for (let k = 0; k < 8; k++) pluck(t + k * BEAT / 2, tones[[0, 1, 2, 1, 0, 2, 1, 2][k]], 0.06, k % 2 ? 0.45 : -0.45);
  }
});

// ---- effects, from the picture's timeline ---------------------------------
tick(tl.HOOK.wordAt[2] + 0.05, 0.16);
pluck(tl.HOOK.wordAt[2] + 0.05, N_.A + 12, 0.12, 0, 0.6);
tl.MOVES.forEach(([a, b]) => swell(a, b - a, 0.1));
const at = (p) => tl.timeOfP(p);
bell(at(1.86), N_.A + 12, 0.14, 0.2); bell(at(1.86) + 0.12, N_.D + 24, 0.1, 0.3);   // gate turns green
bell(at(2.5), N_.Fs + 12, 0.12, -0.2); pluck(at(2.5), N_.B + 12, 0.08, 0.2);        // block opens
const scale = [N_.D + 12, N_.E + 12, N_.Fs + 12, N_.A + 12, N_.B + 12, N_.D + 24, N_.E + 24, N_.Fs + 24];
for (let k = 0; k < 8; k++) pluck(at(3 + 0.35 + ((k + 1) / 8) * 0.6), scale[k], 0.085, (k / 7) * 1.2 - 0.6, 0.5); // votes
thump(at(4.62), 0.4); bell(at(4.62) + 0.02, N_.D + 12, 0.1, 0);                      // lock into chain
[N_.D + 24, N_.Fs + 24, N_.A + 24].forEach((m, i) => bell(at(5.6) + i * 0.06, m, 0.09, (i - 1) * 0.4)); // settled
[N_.D + 12, N_.A + 12, N_.E + 24].forEach((m, i) => bell(tl.END.in[0] + i * 0.09, m, 0.07, (i - 1) * 0.5)); // outro

// ---- reverb (Schroeder) on the send, then master ------------------------------
function reverb(inp) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round(d * SR / 44100), b: new Float32Array(Math.round(d * SR / 44100)), i: 0 }));
  const aps = [225, 556].map((d) => ({ b: new Float32Array(Math.round(d * SR / 44100)), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.b[c.i]; c.b[c.i] = inp[n] + y * 0.83; c.i = (c.i + 1) % c.d; s += y; }
    s /= 4;
    for (const a of aps) { const y = a.b[a.i]; const x = s + y * -0.5; a.b[a.i] = x; s = y - x * 0.5; a.i = (a.i + 1) % a.b.length; }
    out[n] = s;
  }
  return out;
}
const rl = reverb(sendL), rr = reverb(sendR);
let peak = 0;
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fade = Math.min(1, t / 0.25) * Math.min(1, (DUR - t) / 1.2);
  L[n] = Math.tanh((L[n] + rl[n] * 0.35) * 1.4) * fade;
  R[n] = Math.tanh((R[n] + rr[n] * 0.35) * 1.4) * fade;
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
const g = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) { buf.writeInt16LE(Math.round(L[n] * g * 32767), 44 + n * 4); buf.writeInt16LE(Math.round(R[n] * g * 32767), 46 + n * 4); }
writeFileSync("soundtrack.wav", buf);
console.log("soundtrack.wav", DUR, "s, peak gain", g.toFixed(2));
