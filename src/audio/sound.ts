/**
 * Tiny synthesized sound kit (Web Audio, no audio files): wind + campfire ambience,
 * snow-crunch footsteps, dialogue blips and a couple of chimes.
 *
 * Off by default. The choice is remembered per browser; browsers only allow audio to
 * start after a user gesture, so a remembered "on" waits for the first click or key.
 */

const STORAGE_KEY = 'outpost:sound';
const MASTER_VOLUME = 0.55;

type Listener = () => void;

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
};

let enabled = readSaved();
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let crackleTimer: number | undefined;
const listeners = new Set<Listener>();

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  startWind(ctx, master, noise);
  return ctx;
}

/** Looping filtered noise whose volume and pitch drift slowly, like gusts. */
function startWind(c: AudioContext, out: AudioNode, buffer: AudioBuffer) {
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 420;
  filter.Q.value = 0.6;

  const gain = c.createGain();
  gain.gain.value = 0.05;

  const gust = c.createOscillator();
  gust.frequency.value = 0.07;
  const gustDepth = c.createGain();
  gustDepth.gain.value = 0.03;
  gust.connect(gustDepth).connect(gain.gain);

  const sweep = c.createOscillator();
  sweep.frequency.value = 0.11;
  const sweepDepth = c.createGain();
  sweepDepth.gain.value = 180;
  sweep.connect(sweepDepth).connect(filter.frequency);

  src.connect(filter).connect(gain).connect(out);
  src.start();
  gust.start();
  sweep.start();
}

/** Soft random pops from the campfire. */
function scheduleCrackle() {
  window.clearTimeout(crackleTimer);
  if (!enabled) return;
  crackleTimer = window.setTimeout(() => {
    if (Math.random() < 0.7) burst({ duration: 0.012 + Math.random() * 0.02, freq: 1800 + Math.random() * 2400, type: 'highpass', volume: 0.015 + Math.random() * 0.03 });
    scheduleCrackle();
  }, 70 + Math.random() * 380);
}

function live(): AudioContext | null {
  return enabled && ctx && ctx.state === 'running' && master ? ctx : null;
}

/** Short shaped noise burst (footsteps, crackles). */
function burst({ duration, freq, type = 'bandpass', volume, q = 1 }: { duration: number; freq: number; type?: BiquadFilterType; volume: number; q?: number }) {
  const c = live();
  if (!c || !noise || !master) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(filter).connect(gain).connect(master);
  src.start(t, Math.random() * 1.5, duration + 0.02);
}

function tone(freq: number, delay: number, duration: number, volume: number, type: OscillatorType = 'triangle') {
  const c = live();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function applyState() {
  if (!enabled) {
    window.clearTimeout(crackleTimer);
    if (ctx && master) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      window.setTimeout(() => !enabled && ctx?.suspend(), 250);
    }
    return;
  }
  const c = ensureContext();
  if (!c || !master) return;
  if (document.visibilityState === 'hidden') return;
  void c.resume().then(() => {
    if (!enabled || !master) return;
    master.gain.setTargetAtTime(MASTER_VOLUME, c.currentTime, 0.3);
    scheduleCrackle();
  });
}

if (typeof window !== 'undefined') {
  // A remembered "on" needs a user gesture before the browser lets audio play.
  const unlock = () => {
    if (enabled && ctx?.state !== 'running') applyState();
  };
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });

  // Go quiet in background tabs.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      window.clearTimeout(crackleTimer);
      void ctx?.suspend();
    } else if (enabled) applyState();
  });
}

export const sound = {
  isEnabled: () => enabled,

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setEnabled(on: boolean) {
    if (on === enabled) return;
    enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      // Storage blocked: the choice just won't be remembered.
    }
    applyState();
    if (on) sound.chime();
    listeners.forEach((l) => l());
  },

  toggle() {
    sound.setEnabled(!enabled);
  },

  footstep(run = false) {
    burst({ duration: run ? 0.07 : 0.09, freq: 700 + Math.random() * 700, volume: run ? 0.16 : 0.12, q: 0.9 });
  },

  /** One letter of dialogue. */
  blip() {
    tone(480 + Math.random() * 90, 0, 0.035, 0.035, 'square');
  },

  /** Something opened. */
  chime() {
    tone(660, 0, 0.12, 0.07);
    tone(990, 0.07, 0.16, 0.06);
  },

  /** Met everyone. */
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, i === 3 ? 0.5 : 0.14, 0.08));
  },
};
