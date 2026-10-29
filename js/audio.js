let ctx = null;
let master = null;
const channels = {};
let volume = 0.5;

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBuffer(kind = 'white', seconds = 3) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return buf;
}

function loopNoise(kind, filters, gain, out) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(kind);
  src.loop = true;
  let node = src;
  filters.forEach(([type, freq, q]) => {
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    node.connect(f); node = f;
  });
  const g = ctx.createGain();
  g.gain.value = gain;
  node.connect(g); g.connect(out);
  src.start();
  return src;
}

function pop(out, { freq = 2500, dur = 0.03, gain = 0.4, type = 'highpass' } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer('white', dur + 0.02);
  const f = ctx.createBiquadFilter();
  f.type = type; f.frequency.value = freq;
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(t); src.stop(t + dur + 0.05);
}

function tone(out, freq, { type = 'sine', dur = 1, gain = 0.2, at = 0, attack = 0.01 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime + at;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.05);
}

const BUILDERS = {
  crackle(out) {
    const src = loopNoise('brown', [['lowpass', 500]], 0.35, out);
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) setTimeout(() => alive && pop(out, { freq: 1500 + Math.random() * 3000, dur: 0.01 + Math.random() * 0.04, gain: 0.15 + Math.random() * 0.5 }), i * 30);
      setTimeout(tick, 60 + Math.random() * 400);
    };
    tick();
    return () => { alive = false; src.stop(); };
  },
  rain(out) {
    const a = loopNoise('white', [['highpass', 900], ['lowpass', 7000]], 0.12, out);
    const b = loopNoise('brown', [['lowpass', 900]], 0.25, out);
    let alive = true;
    const drop = () => {
      if (!alive) return;
      pop(out, { freq: 3000 + Math.random() * 3000, dur: 0.015, gain: 0.08 + Math.random() * 0.12, type: 'bandpass' });
      setTimeout(drop, 20 + Math.random() * 120);
    };
    drop();
    return () => { alive = false; a.stop(); b.stop(); };
  },
  cafe(out) {
    const a = loopNoise('brown', [['lowpass', 380]], 0.5, out);
    const b = loopNoise('white', [['bandpass', 550, 0.8]], 0.05, out);
    let alive = true;
    const clink = () => {
      if (!alive) return;
      const f = 2200 + Math.random() * 1800;
      tone(out, f, { dur: 0.6, gain: 0.05 }); tone(out, f * 1.5, { dur: 0.4, gain: 0.025 });
      setTimeout(clink, 1500 + Math.random() * 5000);
    };
    setTimeout(clink, 1200);
    return () => { alive = false; a.stop(); b.stop(); };
  },
  lofi(out) {
    const vinyl = loopNoise('white', [['highpass', 3000]], 0.015, out);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1300;
    lp.connect(out);
    const chords = [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [293.7, 349.2, 440, 523.3], [196, 246.9, 293.7, 349.2]];
    const beat = 60 / 72;
    let bar = 0, alive = true;
    const play = () => {
      if (!alive) return;
      const ch = chords[bar % 4];
      ch.forEach((f, i) => tone(lp, f, { type: 'triangle', dur: beat * 4, gain: 0.05, attack: 0.08, at: i * 0.02 }));
      tone(lp, ch[0] / 2, { type: 'sine', dur: beat * 2, gain: 0.12 });
      tone(lp, ch[0] / 2, { type: 'sine', dur: beat * 1.5, gain: 0.1, at: beat * 2.5 });
      for (let b = 0; b < 4; b++) {
        if (b % 2 === 0) tone(out, 55, { dur: 0.25, gain: 0.25, at: b * beat });
        setTimeout(() => alive && pop(out, { freq: 7000, dur: 0.03, gain: 0.05 }), (b * beat + beat / 2) * 1000);
      }
      const mel = ch[Math.floor(Math.random() * 4)] * 2;
      if (Math.random() > 0.3) tone(lp, mel, { type: 'sine', dur: beat * 1.2, gain: 0.04, at: beat * (1 + Math.floor(Math.random() * 2)) });
      bar++;
    };
    play();
    const iv = setInterval(play, beat * 4000);
    return () => { alive = false; clearInterval(iv); vinyl.stop(); };
  },
};

export function setAmbience(list) {
  if (list.length) ensure();
  Object.keys(channels).forEach((k) => {
    if (!list.includes(k)) { channels[k](); delete channels[k]; }
  });
  list.forEach((k) => {
    if (!channels[k] && BUILDERS[k]) channels[k] = BUILDERS[k](master);
  });
}

export function setVolume(v) {
  volume = v;
  if (master) master.gain.value = v;
}

export function blow() {
  ensure();
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer('white', 1.2);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.Q.value = 0.6;
  const t = ctx.currentTime;
  f.frequency.setValueAtTime(1800, t);
  f.frequency.exponentialRampToValueAtTime(300, t + 0.9);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.6, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t);
}

export function chime() {
  ensure();
  [784, 988, 1175, 1568].forEach((f, i) => tone(master, f, { dur: 2.2, gain: 0.12, at: i * 0.14 }));
}

export function unlock() { ensure(); }
