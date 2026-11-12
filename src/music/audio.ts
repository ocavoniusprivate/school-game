// Sounds made in the browser with the Web Audio API — no sound files needed.
//
// Two browser rules make this tricky on phones:
// 1. Audio may only start after the player has tapped something. `unlockAudio`
//    runs on the very first tap anywhere and wakes the audio up.
// 2. On iPhone, Web Audio is silenced by the ringer/silent switch unless the
//    page tells iOS this is media playback. We do that with
//    `navigator.audioSession` (newer iOS) and by playing a silent <audio>
//    element (older iOS), which switches the page to "media" sound.

import { midiToFrequency } from "./theory";

let ctx: AudioContext | null = null;
let muted = false;
let unlocked = false;
const active = new Set<AudioScheduledSourceNode>();

function audio(): AudioContext {
  ctx ??= new AudioContext();
  if (ctx.state !== "running") void ctx.resume();
  return ctx;
}

/** A tiny silent WAV file, made in code (0.1 s of silence). */
function silentWavUrl(): string {
  const rate = 8000;
  const samples = rate / 10;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // 8-bit
  text(36, "data");
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) view.setUint8(44 + i, 128); // 8-bit silence
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

/** Call from a tap/click handler: makes sound work on phones (see top of file). */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) {
    try {
      session.type = "playback";
    } catch {
      // not supported
    }
  }
  try {
    const el = new Audio(silentWavUrl());
    el.setAttribute("playsinline", "");
    void el.play().catch(() => {});
  } catch {
    // no <audio> support
  }
  const ac = audio();
  // A one-sample silent buffer started inside the tap fully wakes the context.
  const src = ac.createBufferSource();
  src.buffer = ac.createBuffer(1, 1, 22050);
  src.connect(ac.destination);
  src.start(0);
}

/** Whether the browser is currently letting us play sound. */
export function audioState(): AudioContextState | "not-started" {
  return ctx ? ctx.state : "not-started";
}

export function setMuted(value: boolean) {
  muted = value;
  if (muted) stopAll();
}

export function isMuted() {
  return muted;
}

/** Stop everything that is playing or scheduled (e.g. when leaving a screen). */
export function stopAll() {
  for (const node of active) {
    try {
      node.stop();
    } catch {
      // already stopped
    }
  }
  active.clear();
}

export type Timbre = "piano" | "soft" | "bright" | "flute" | "strings" | "brass";

interface ToneOptions {
  duration?: number;
  volume?: number;
  timbre?: Timbre;
  /** Seconds from now. */
  delay?: number;
}

const WAVES: Record<Timbre, OscillatorType> = {
  piano: "triangle",
  soft: "sine",
  bright: "sawtooth",
  flute: "sine",
  strings: "sawtooth",
  brass: "square",
};

export function playFrequency(freq: number, opts: ToneOptions = {}) {
  if (muted) return;
  const ac = audio();
  const { duration = 0.6, volume = 0.4, timbre = "piano", delay = 0 } = opts;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  osc.type = WAVES[timbre];
  osc.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.value = timbre === "bright" ? 6000 : timbre === "brass" ? 2400 : timbre === "strings" ? 3000 : 2200;

  // Gentle vibrato for flute and strings.
  if (timbre === "flute" || timbre === "strings") {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = 5.5;
    depth.gain.value = freq * 0.006;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(start);
    lfo.stop(start + duration + 0.1);
    active.add(lfo);
  }

  const peak = Math.max(0.0001, volume * 0.5);
  const attack = timbre === "piano" ? 0.005 : timbre === "strings" ? 0.12 : 0.04;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  if (timbre === "piano") {
    gain.gain.exponentialRampToValueAtTime(peak * 0.35, start + Math.min(0.4, duration));
  }
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
  active.add(osc);
  osc.onended = () => active.delete(osc);
}

export function playMidi(midi: number, opts: ToneOptions = {}) {
  playFrequency(midiToFrequency(midi), opts);
}

/** A metronome click; `accent` for the first beat of a bar. */
export function click(accent = false, delay = 0) {
  playFrequency(accent ? 1500 : 1000, { duration: 0.06, volume: accent ? 0.7 : 0.45, timbre: "soft", delay });
}

/** Play `count` clicks at `bpm`; returns the total length in seconds. */
export function metronome(bpm: number, count: number, beatsPerBar = 4): number {
  const beat = 60 / bpm;
  for (let i = 0; i < count; i++) click(i % beatsPerBar === 0, i * beat);
  return count * beat;
}

/** Notes one after another: [midi, beats] at the given tempo. */
export function playMelody(notes: [number, number][], bpm = 100, timbre: Timbre = "piano") {
  const beat = 60 / bpm;
  let t = 0;
  for (const [midi, beats] of notes) {
    playMidi(midi, { duration: beats * beat * 0.95, delay: t, timbre });
    t += beats * beat;
  }
}

/** Short feedback sounds for right and wrong answers. */
export function playCorrect() {
  playMidi(72, { duration: 0.15, volume: 0.35, timbre: "soft" });
  playMidi(79, { duration: 0.3, volume: 0.35, timbre: "soft", delay: 0.12 });
}

export function playWrong() {
  playMidi(55, { duration: 0.25, volume: 0.3, timbre: "brass" });
}

/** The current audio clock, for measuring taps against the beat. */
export function audioTime(): number {
  return audio().currentTime;
}
