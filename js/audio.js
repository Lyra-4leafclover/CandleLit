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

const TRACKS = ['crackle', 'rain', 'cafe', 'lofi', 'ocean', 'thunder', 'library', 'forest'];
const buffers = {};
const loadBuf = (k) => buffers[k] || (buffers[k] = fetch(`/audio/${k}.mp3`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)));
/* Recorded loop: each pass overlaps the next by a few seconds so the faded ends crossfade. */
function loopTrack(k, out) {
  let alive = true, timer = null, srcs = [];
  const g = ctx.createGain();
  g.gain.value = 0.9;
  g.connect(out);
  loadBuf(k).then((buf) => {
    if (!alive) return;
    const ov = Math.min(2.5, buf.duration / 4);
    const play = (at) => {
      if (!alive) return;
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.connect(g);
      s.start(at);
      srcs.push(s);
      s.onended = () => { srcs = srcs.filter((x) => x !== s); };
      const next = at + buf.duration - ov;
      timer = setTimeout(() => play(next), Math.max(0, (next - ctx.currentTime - 1) * 1000));
    };
    play(ctx.currentTime + 0.05);
  }).catch(() => { delete buffers[k]; });
  return () => {
    alive = false;
    clearTimeout(timer);
    g.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    setTimeout(() => { srcs.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } }); g.disconnect(); }, 1500);
  };
}

export function setAmbience(list) {
  if (list.length) ensure();
  Object.keys(channels).forEach((k) => {
    if (!list.includes(k)) { channels[k](); delete channels[k]; }
  });
  list.forEach((k) => {
    if (!channels[k] && TRACKS.includes(k)) channels[k] = loopTrack(k, master);
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
