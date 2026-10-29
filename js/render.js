import { ART3, CAKE_ART } from './art3.js';
import { ART4 } from './art4.js';

let uidN = 0;
const uid = () => `u${++uidN}${Math.random().toString(36).slice(2, 5)}`;

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function rng(seed) {
  let a = typeof seed === 'number' ? seed : hash(String(seed));
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mix(hex, other, amt) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(other);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, '0')).join('');
}
const light = (c, a = 0.35) => mix(c, '#ffffff', a);
const dark = (c, a = 0.3) => mix(c, '#000000', a);

const lum = (hex) => { const v = parseInt((hex || '#888888').slice(1, 7), 16); return (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255; };
/* Keep a motif colour readable on its background: if the two are too close in brightness, push the motif lighter or darker. */
const onColor = (fg, bg, min = 0.22) => {
  if (Math.abs(lum(fg) - lum(bg)) >= min) return fg;
  return lum(bg) < 0.55 ? mix(fg, '#ffffff', 0.62) : mix(fg, '#000000', 0.38);
};
function patternDefs(d, P, h) {
  const { c1, c2 } = d;
  const c3 = d.c3 || c2;
  const pat = (w, ht, inner, extra = '') => `<pattern id="${P}" patternUnits="userSpaceOnUse" width="${w}" height="${ht}" ${extra}>${inner}</pattern>`;
  switch (d.pattern) {
    case 'stripes': return pat(12, 12, `<rect width="12" height="12" fill="${c1}"/><rect width="5" height="12" fill="${c2}"/>`, 'patternTransform="rotate(-35)"');
    case 'spiral': return pat(16, 16, `<rect width="16" height="16" fill="${c1}"/><rect width="7" height="16" fill="${c2}"/><rect x="7" width="1.5" height="16" fill="${dark(c1, 0.08)}"/>`, 'patternTransform="rotate(28)"');
    case 'polka': return pat(16, 16, `<rect width="16" height="16" fill="${c1}"/><circle cx="4" cy="4" r="2.6" fill="${c2}"/><circle cx="12" cy="12" r="2.6" fill="${c2}"/>`);
    case 'sparkle': return pat(18, 18, `<rect width="18" height="18" fill="${c1}"/><path d="M5 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="${c2}"/><circle cx="13" cy="13" r="1.2" fill="#fff"/><circle cx="15" cy="4" r=".8" fill="${c2}"/>`);
    case 'ombre':
    case 'ombre-twist':
      return `<linearGradient id="${P}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${-h}"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${d.c3 || c2}"/></linearGradient>`
        + (d.pattern === 'ombre-twist' ? `<pattern id="${P}t" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(35)"><rect width="4" height="14" fill="#fff" opacity=".28"/><rect x="4" width="1" height="14" fill="#000" opacity=".08"/></pattern>` : '');
    case 'marble': return pat(60, 70, `<rect width="60" height="70" fill="${c1}"/><path d="M-5 10 C10 18 18 5 30 20 S50 30 65 22" stroke="${c2}" stroke-width="1.3" fill="none"/><path d="M-5 45 C12 38 20 55 35 48 S52 60 65 52" stroke="#b9b2a8" stroke-width=".8" fill="none"/><path d="M20 20 C24 32 15 40 22 52" stroke="${c2}" stroke-width=".7" fill="none"/>`);
    case 'floral': return pat(28, 28, `<rect width="28" height="28" fill="${c1}"/><ellipse cx="9" cy="14" rx="4" ry="2" fill="${c3}" transform="rotate(-30 9 14)"/><circle cx="14" cy="10" r="5" fill="${c2}"/><path d="M14 7 a3 3 0 1 1 -2 4 a1.6 1.6 0 1 1 2 -2" stroke="${dark(c2, 0.35)}" stroke-width=".9" fill="none"/><circle cx="3" cy="25" r="2.2" fill="${light(c2, 0.3)}"/><circle cx="25" cy="24" r="1.4" fill="#fff"/>`);
    case 'lace': return pat(14, 14, `<rect width="14" height="14" fill="${c1}"/><circle cx="7" cy="7" r="4.2" fill="none" stroke="${c2}" stroke-width="1"/><circle cx="7" cy="7" r="1.2" fill="${c2}"/><circle cx="0" cy="0" r="1.5" fill="${c2}"/><circle cx="14" cy="0" r="1.5" fill="${c2}"/><circle cx="0" cy="14" r="1.5" fill="${c2}"/><circle cx="14" cy="14" r="1.5" fill="${c2}"/>`);
    case 'disco': {
      const g = ['#eef1f5', '#aab2bd', '#ffffff', '#8e97a3', '#d6dbe2', '#c4ccd6'];
      let s = '';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += `<rect x="${i * 4}" y="${j * 4}" width="4" height="4" fill="${g[(i * 3 + j * 5) % g.length]}" stroke="#6b7380" stroke-width=".35"/>`;
      return pat(16, 16, s);
    }
    case 'cherub': return pat(20, 22, `<rect width="20" height="22" fill="${c1}"/><path d="M10 1 c-6 4 6 7 0 11 c-6 4 6 7 0 10" stroke="${c2}" stroke-width="1" fill="none"/><circle cx="3" cy="6" r="1.2" fill="${c2}"/><circle cx="17" cy="16" r="1.2" fill="${c2}"/>`);
    case 'galaxy': {
      const r = rng(d.id);
      let stars = '';
      for (let i = 0; i < 14; i++) stars += `<circle cx="${(r() * 40).toFixed(1)}" cy="${(r() * 40).toFixed(1)}" r="${(0.3 + r() * 0.9).toFixed(2)}" fill="#fff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
      return pat(40, 40, `<rect width="40" height="40" fill="${c1}"/><ellipse cx="20" cy="18" rx="22" ry="9" fill="${c2}" opacity=".45" transform="rotate(-25 20 18)"/><ellipse cx="10" cy="32" rx="10" ry="5" fill="${c3}" opacity=".35"/>${stars}`);
    }
    case 'geode': return pat(18, 18, `<rect width="18" height="18" fill="${c1}"/><polygon points="0,0 9,5 0,12" fill="${c2}"/><polygon points="9,5 18,0 18,11" fill="${c3}"/><polygon points="0,12 9,5 10,18" fill="${light(c1, 0.2)}"/><polygon points="9,5 18,11 10,18" fill="${dark(c1, 0.15)}"/><polygon points="0,0 18,0 9,5" fill="${light(c2, 0.4)}"/>`);
    case 'pumpkin': return pat(12, 20, `<rect width="12" height="20" fill="${c1}"/><rect x="5.5" width="1.6" height="20" fill="${c2}" opacity=".55"/><rect x="0" width="1" height="20" fill="${light(c1, 0.25)}" opacity=".6"/>`);
    case 'sakura': return pat(24, 24, `<rect width="24" height="24" fill="${c1}"/><g fill="${c2}"><ellipse cx="6" cy="6" rx="3" ry="1.6" transform="rotate(30 6 6)"/><ellipse cx="18" cy="16" rx="2.6" ry="1.4" transform="rotate(-40 18 16)"/></g><circle cx="16" cy="5" r="1" fill="#fff"/>`);
    case 'gingham': return pat(14, 14, `<rect width="14" height="14" fill="${c1}"/><rect width="7" height="14" fill="${c2}" opacity=".45"/><rect width="14" height="7" fill="${c2}" opacity=".45"/>`);
    case 'hearts': return pat(18, 18, `<rect width="18" height="18" fill="${c1}"/><path d="M5 7 C3 5 1 7 3 9 L5 11 L7 9 C9 7 7 5 5 7Z" fill="${c2}"/><path d="M14 16 C12.5 14.5 11 16 12.5 17.5 L14 19 L15.5 17.5 C17 16 15.5 14.5 14 16Z" fill="${c2}" opacity=".7"/>`);
    case 'checker': return pat(14, 14, `<rect width="14" height="14" fill="${c1}"/><rect width="7" height="7" fill="${c2}"/><rect x="7" y="7" width="7" height="7" fill="${c2}"/>`);
    case 'leopard': return pat(26, 26, `<rect width="26" height="26" fill="${c1}"/><path d="M4 5 q3 -3 6 0 q-1 4 -4 4 q-3 -1 -2 -4z M16 14 q4 -2 6 1 q-1 4 -5 3 q-2 -1 -1 -4z M3 18 q3 -1 4 2 q-2 3 -4 1z" fill="none" stroke="${c2}" stroke-width="1.8"/><circle cx="7" cy="7" r="1.4" fill="${dark(c1, 0.2)}"/><circle cx="19" cy="16" r="1.4" fill="${dark(c1, 0.2)}"/>`);
    case 'cow': return pat(36, 36, `<rect width="36" height="36" fill="${c1}"/><path d="M4 6 q6 -4 10 1 q2 6 -5 7 q-7 -1 -5 -8z M22 20 q8 -3 11 3 q0 7 -7 6 q-6 -2 -4 -9z M2 28 q4 -2 5 2 q-1 4 -5 2z" fill="${c2}"/>`);
    case 'waves': return pat(20, 12, `<rect width="20" height="12" fill="${c1}"/><path d="M0 6 q5 -5 10 0 t10 0" stroke="${c2}" stroke-width="2.2" fill="none"/>`);
    case 'stars': return pat(22, 22, `<rect width="22" height="22" fill="${c1}"/><path d="M6 2 l1.4 3 3.2 .4 -2.4 2.2 .7 3.2 -2.9 -1.6 -2.9 1.6 .7 -3.2 -2.4 -2.2 3.2 -.4z" fill="${c2}"/><circle cx="16" cy="15" r="1.3" fill="${c2}"/><circle cx="18" cy="5" r=".8" fill="${c2}"/>`);
    case 'argyle': return pat(20, 28, `<rect width="20" height="28" fill="${c1}"/><polygon points="10,0 20,14 10,28 0,14" fill="${c2}" opacity=".6"/><path d="M0 0 L20 28 M20 0 L0 28" stroke="#fff" stroke-width=".7" stroke-dasharray="2 2" opacity=".8"/>`);
    case 'strawberry': return pat(20, 20, `<rect width="20" height="20" fill="${c1}"/><path d="M6 13 C1 9 2 4 6 5 C10 4 11 9 6 13Z" fill="#ef5f6e"/><path d="M4 5 l2 -2 l2 2z" fill="#5a9a4f"/><circle cx="5" cy="8" r=".5" fill="#fff6d6"/><circle cx="7" cy="9" r=".5" fill="#fff6d6"/><circle cx="15" cy="16" r="1" fill="${c2}"/>`);
    case 'tiedye': return `<radialGradient id="${P}" gradientUnits="userSpaceOnUse" cx="0" cy="${-h * 0.5}" r="${h * 0.6}" spreadMethod="reflect"><stop offset="0" stop-color="${c1}"/><stop offset=".33" stop-color="${c2}"/><stop offset=".66" stop-color="${c3 === c2 ? light(c1, 0.4) : c3}"/><stop offset="1" stop-color="${c1}"/></radialGradient>`;
    case 'scallop': return pat(16, 10, `<rect width="16" height="10" fill="${c1}"/><path d="M0 10 a8 8 0 0 1 16 0" fill="none" stroke="${c2}" stroke-width="1.6"/>`);
    default: return `<linearGradient id="${P}" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2 || c1}"/></linearGradient>`;
  }
}

const KMUL = { birthday: 0.78, taper: 1, pillar: 1.15 };
const SHAPES = { painted: { w: 100, h: 110 }, pumpkin: { w: 116, h: 62 }, seashell: { w: 112, h: 92 }, tamagotchi: { w: 74, h: 92 }, toadstool: { w: 104, h: 122 }, taper: { w: 30, h: 200 }, spiral: { w: 30, h: 200 }, pillar: { w: 74, h: 130 }, jar: { w: 84, h: 96 }, teacup: { w: 96, h: 50 } };
const GOLD = '#e0bb72';

function flameMarkup(blue, agitated, id) {
  const c = blue ? { halo: '#9fd3ff', o1: '#5aa8ff', o2: '#dff2ff', inn: '#ffffff' } : { halo: '#ffc875', o1: '#ffab45', o2: '#fff0c4', inn: '#fffdf4' };
  return `<defs><radialGradient id="${id}h"><stop offset="0" stop-color="${c.halo}" stop-opacity=".55"/><stop offset=".45" stop-color="${c.halo}" stop-opacity=".16"/><stop offset="1" stop-color="${c.halo}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.o1}"/><stop offset=".55" stop-color="${c.o2}"/><stop offset="1" stop-color="${c.o2}" stop-opacity=".85"/></linearGradient></defs>
    <circle class="glow" style="${phaseVar(3)}" cy="-18" r="48" fill="url(#${id}h)"/>
    <g class="flame ${agitated ? 'agitated' : ''}" style="${phaseVar(2.6)}">
      <path d="M0,-42 C4,-29 11,-18 9,-8 C7.5,-1 3.5,2 0,2 C-3.5,2 -7.5,-1 -9,-8 C-11,-18 -4,-29 0,-42Z" fill="url(#${id}f)"/>
      <path d="M0,-23 C3,-15 5,-9 4,-4 C3,-.5 1.5,1 0,1 C-1.5,1 -3,-.5 -4,-4 C-5,-9 -3,-15 0,-23Z" fill="${c.inn}"/>
    </g>`;
}

let ART_MODE = 'painted';
export const setArtMode = (m) => { ART_MODE = m === 'drawn' ? 'drawn' : 'painted'; };
export const getArtMode = () => ART_MODE;
const modeDesign = (d) => (ART_MODE === 'drawn' && d.shape0 ? { ...d, shape: d.shape0, art: undefined } : d);
const PFLAME = { ar: ART4.flame.ar, h: 54 };
function paintedFlameMarkup(blue, agitated, id) {
  const h = PFLAME.h, w = h * PFLAME.ar;
  const glow = blue ? '#9fd3ff' : '#ffc875';
  const frames = [0, 1, 2, 3].map((i) => `<image class="pflame" style="${phase(1.6, i * 0.4)}" href="/art4/flame_${i}.webp" x="${(-w / 2).toFixed(1)}" y="${(-h + 4).toFixed(1)}" width="${w.toFixed(1)}" height="${h}"/>`).join('');
  return `<defs><radialGradient id="${id}h"><stop offset="0" stop-color="${glow}" stop-opacity=".5"/><stop offset=".45" stop-color="${glow}" stop-opacity=".14"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs>
    <circle class="glow" style="${phaseVar(3)}" cy="-18" r="48" fill="url(#${id}h)"/>
    <g class="flame pflame-g ${agitated ? 'agitated' : ''} ${blue ? 'pflame-blue' : ''}" style="${phaseVar(2.6)}"><image href="/art4/flame_0.webp" x="${(-w / 2).toFixed(1)}" y="${(-h + 4).toFixed(1)}" width="${w.toFixed(1)}" height="${h}"/>${frames}</g>`;
}

function cherubMarkup(y) {
  return `<g transform="translate(0,${y})">
    <path d="M-4 -12 C-18 -26 -30 -14 -24 -6 C-20 -1 -10 -4 -4 -8Z" fill="#fff" stroke="#ead9c4" stroke-width=".8"/>
    <path d="M4 -12 C18 -26 30 -14 24 -6 C20 -1 10 -4 4 -8Z" fill="#fff" stroke="#ead9c4" stroke-width=".8"/>
    <ellipse cy="-8" rx="7" ry="8" fill="#ffe0cc"/>
    <circle cy="-21" r="6.5" fill="#ffe6d4"/>
    <path d="M-6 -24 q2 -5 6 -3.5 q4 -2.5 6 2.5" stroke="${GOLD}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="-2.3" cy="-21" r=".8" fill="#6b4a3a"/><circle cx="2.3" cy="-21" r=".8" fill="#6b4a3a"/>
    <ellipse cx="-4" cy="-18.5" rx="1.6" ry="1" fill="#ffb3b3" opacity=".7"/><ellipse cx="4" cy="-18.5" rx="1.6" ry="1" fill="#ffb3b3" opacity=".7"/>
    <ellipse cy="-31" rx="6" ry="1.8" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
  </g>`;
}

const FIGS = {
  bunny: (y) => `<g transform="translate(0,${y})"><ellipse cx="-4" cy="-30" rx="3.2" ry="10" fill="#fff" stroke="#f0d2dc"/><ellipse cx="-4" cy="-30" rx="1.4" ry="7" fill="#ffc6d6"/><ellipse cx="4" cy="-30" rx="3.2" ry="10" fill="#fff" stroke="#f0d2dc"/><ellipse cx="4" cy="-30" rx="1.4" ry="7" fill="#ffc6d6"/><ellipse cy="-7" rx="10" ry="8" fill="#fff"/><circle cy="-18" r="7.5" fill="#fff"/><circle cx="-2.6" cy="-19" r=".9" fill="#5a4040"/><circle cx="2.6" cy="-19" r=".9" fill="#5a4040"/><ellipse cy="-16" rx="1.3" ry=".9" fill="#ff9fb8"/><ellipse cx="-4.5" cy="-16" rx="1.6" ry="1" fill="#ffc6d6" opacity=".8"/><ellipse cx="4.5" cy="-16" rx="1.6" ry="1" fill="#ffc6d6" opacity=".8"/><circle cx="9" cy="-4" r="3" fill="#fff"/></g>`,
  kitty: (y) => `<g transform="translate(0,${y})"><path d="M-9 -22 L-7 -31 L-2 -25Z M9 -22 L7 -31 L2 -25Z" fill="#f6f1ea" stroke="#e5d9cc" stroke-width=".7"/><ellipse cy="-7" rx="10" ry="8" fill="#f6f1ea"/><circle cy="-19" r="8" fill="#f6f1ea"/><path d="M-4.5 -19.5 q1.5 -1.5 3 0 M1.5 -19.5 q1.5 -1.5 3 0" stroke="#5a4040" stroke-width=".9" fill="none"/><path d="M-1 -16.5 l1 1 l1 -1" stroke="#e48aa0" stroke-width=".8" fill="none"/><path d="M-6 -16 l-5 -1 M-6 -15 l-5 1 M6 -16 l5 -1 M6 -15 l5 1" stroke="#cbbcae" stroke-width=".4"/><path d="M9 -4 C16 -6 16 -16 12 -18" stroke="#f6f1ea" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-4 -26 l1 -2 l1 2 M2 -26 l1 -2 l1 2" stroke="${GOLD}" stroke-width=".6" fill="none"/><path d="M-5 -26.5 h10 l-1 -3 -2 2 -2 -3 -2 3 -2 -2z" fill="${GOLD}"/></g>`,
  swan: (y) => `<g transform="translate(0,${y})"><path d="M-12 -4 C-12 -14 4 -14 10 -6 C12 -2 8 0 0 0 C-8 0 -12 -1 -12 -4Z" fill="#fff" stroke="#e6e0ea" stroke-width=".7"/><path d="M-8 -6 C-14 -16 -6 -26 -2 -22 C0 -20 -2 -16 -5 -14" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-2 -22 l3 1 -3 1z" fill="#f2a65a"/><circle cx="-3.4" cy="-22.3" r=".6" fill="#333"/><path d="M-4 -10 C2 -14 6 -12 8 -8" stroke="#e6e0ea" stroke-width=".7" fill="none"/><path d="M-4 -27 h5 l-.5 -2.5 -1 1.2 -1 -1.8 -1 1.8 -1 -1.2z" fill="${GOLD}"/></g>`,
  teddy: (y) => `<g transform="translate(0,${y})"><circle cx="-6.5" cy="-25" r="3.2" fill="#c99470"/><circle cx="6.5" cy="-25" r="3.2" fill="#c99470"/><circle cx="-6.5" cy="-25" r="1.6" fill="#f0c6a6"/><circle cx="6.5" cy="-25" r="1.6" fill="#f0c6a6"/><ellipse cy="-7" rx="10" ry="8.5" fill="#c99470"/><ellipse cy="-6" rx="5.5" ry="5" fill="#f0c6a6"/><circle cy="-19" r="8" fill="#c99470"/><ellipse cy="-16.5" rx="3.6" ry="2.8" fill="#f0c6a6"/><ellipse cy="-17.5" rx="1.3" ry=".9" fill="#4a3020"/><circle cx="-3" cy="-20.5" r=".9" fill="#4a3020"/><circle cx="3" cy="-20.5" r=".9" fill="#4a3020"/><path d="M-5 -12 l5 2 5 -2 -1 3 -4 -1 -4 1z" fill="#f28fae"/></g>`,
  froggy: (y) => `<g transform="translate(0,${y})"><ellipse cy="-7" rx="11" ry="8" fill="#9fd68c"/><ellipse cy="-5" rx="6" ry="4.5" fill="#d9f2cc"/><ellipse cy="-15" rx="9" ry="6.5" fill="#9fd68c"/><circle cx="-5" cy="-20" r="3.6" fill="#9fd68c"/><circle cx="5" cy="-20" r="3.6" fill="#9fd68c"/><circle cx="-5" cy="-20" r="1.6" fill="#2a3a20"/><circle cx="5" cy="-20" r="1.6" fill="#2a3a20"/><path d="M-4 -13 q4 3 8 0" stroke="#3f7a32" stroke-width=".9" fill="none"/><ellipse cx="-6.5" cy="-13.5" rx="1.6" ry="1" fill="#ffa6b8"/><ellipse cx="6.5" cy="-13.5" rx="1.6" ry="1" fill="#ffa6b8"/>${'<g transform="translate(4,-25)">' + [0, 72, 144, 216, 288].map((r) => `<ellipse cy="-2.4" rx="1.6" ry="2.4" fill="#ffd1e0" transform="rotate(${r})"/>`).join('') + '<circle r="1.1" fill="#ffd36e"/></g>'}</g>`,
  fairy: (y) => { const g = uid(); return `<g transform="translate(0,${y})"><defs><linearGradient id="${g}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdf6ff"/><stop offset=".5" stop-color="#e8dcff"/><stop offset="1" stop-color="#cfeaff"/></linearGradient><linearGradient id="${g}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c2"/><stop offset="1" stop-color="#efc760"/></linearGradient><linearGradient id="${g}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3d6fb"/><stop offset="1" stop-color="#b49ce8"/></linearGradient></defs>
    <path d="M-1 -17 C-10 -33 -25 -29 -20 -19 C-17 -13 -8 -14 -1 -15Z M1 -17 C10 -33 25 -29 20 -19 C17 -13 8 -14 1 -15Z" fill="url(#${g}w)" fill-opacity=".9" stroke="#c9b6f2" stroke-width=".6"/>
    <path d="M-1 -14 C-9 -14 -15 -7 -11 -4 C-7 -2 -3 -8 -1 -12Z M1 -14 C9 -14 15 -7 11 -4 C7 -2 3 -8 1 -12Z" fill="url(#${g}w)" fill-opacity=".9" stroke="#c9b6f2" stroke-width=".6"/>
    <path d="M-3 -18 C-9 -24 -16 -25 -18 -21 M3 -18 C9 -24 16 -25 18 -21 M-3 -13 C-7 -11 -10 -8 -10 -6 M3 -13 C7 -11 10 -8 10 -6" stroke="#fff" stroke-width=".7" fill="none" opacity=".9"/>
    <path d="M-15 -9 A15 11 0 0 0 15 -9 A13 7 0 0 1 -15 -9Z" fill="url(#${g}m)" stroke="#e0b44e" stroke-width=".6"/>
    <path d="M5 -8 C7 -6 8 -3 9 0 M7 -8 C9 -6 11 -4 12 -1" stroke="#ffe0cc" stroke-width="2.2" stroke-linecap="round" fill="none"/><ellipse cx="9.3" cy=".4" rx="1.6" ry="1.1" fill="#c9b6f2"/><ellipse cx="12.3" cy="-.6" rx="1.6" ry="1.1" fill="#c9b6f2"/>
    <path d="M-7 -8 C-8 -11 -5 -13 0 -13 C5 -13 9 -11 8 -7 C4 -5 -3 -5 -7 -8Z" fill="url(#${g}d)"/><path d="M-6 -8 q2 2 4 0 q2 2 4 0 q2 2 4 0 q2 2 3 0" stroke="#fff" stroke-width=".6" fill="none" opacity=".8"/>
    <path d="M-3 -13 L-2.4 -18.5 L2.4 -18.5 L3 -13Z" fill="url(#${g}d)"/><path d="M-2.4 -18 C-5 -16 -6 -13 -5 -11 M2.4 -18 C6 -18 9 -21 11 -23" stroke="#ffe0cc" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M11 -23 L13 -27" stroke="${GOLD}" stroke-width=".8"/><path d="M13.5 -30.5 l.9 2.1 2.2 .2 -1.7 1.4 .5 2.2 -1.9 -1.2 -1.9 1.2 .5 -2.2 -1.7 -1.4 2.2 -.2z" fill="#ffe27a" stroke="${GOLD}" stroke-width=".4"/>
    <path d="M-6.3 -24 C-7.5 -19 -6.5 -16 -4.5 -15 L4.5 -15 C6.5 -16 7.5 -19 6.3 -24Z" fill="#f6dcae"/>
    <circle cy="-24" r="5.6" fill="#ffe8d8"/><circle cx="4.6" cy="-29" r="2.6" fill="#f3d39a"/>
    <path d="M-5.8 -24.5 C-6 -30.5 6 -30.5 5.8 -24.5 C4 -27 1 -27.6 -.5 -26.4 C-2 -27.2 -4.2 -26.6 -5.8 -24.5Z" fill="#f3d39a"/>
    <path d="M-3.2 -23.6 q1.2 1 2.2 0 M1 -23.6 q1.2 1 2.2 0" stroke="#6b4a3a" stroke-width=".7" fill="none" stroke-linecap="round"/><path d="M-.8 -21.4 q.8 .6 1.6 0" stroke="#e48aa0" stroke-width=".6" fill="none"/>
    <ellipse cx="-3.6" cy="-22" rx="1.4" ry=".8" fill="#ffb3c1" opacity=".7"/><ellipse cx="3.6" cy="-22" rx="1.4" ry=".8" fill="#ffb3c1" opacity=".7"/>
    ${[-4.2, -1.4, 1.4, 4.2].map((x, i) => `<circle cx="${x}" cy="${-28.6 + Math.abs(x) * 0.25}" r="1.2" fill="${i % 2 ? '#fff' : '#f9c6d8'}"/>`).join('')}
    <path d="M-14 -24 l.5 1.2 1.2 .5 -1.2 .5 -.5 1.2 -.5 -1.2 -1.2 -.5 1.2 -.5z M17 -12 l.4 1 1 .4 -1 .4 -.4 1 -.4 -1 -1 -.4 1 -.4z" fill="#ffe9a8"/></g>`; },
  mermaid: (y) => { const g = uid(); return `<g transform="translate(0,${y})"><defs><linearGradient id="${g}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fe3d6"/><stop offset=".55" stop-color="#5cc2b8"/><stop offset="1" stop-color="#6aa6d8"/></linearGradient><linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2f0"/><stop offset="1" stop-color="#f6bfc8"/></linearGradient><linearGradient id="${g}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f58a8f"/><stop offset="1" stop-color="#e9667a"/></linearGradient><radialGradient id="${g}p" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e6dad2"/></radialGradient></defs>
    <path d="M-14 -5 C-20 -22 -9 -33 0 -33 C9 -33 20 -22 14 -5Z" fill="url(#${g}s)" stroke="#eaa7b3" stroke-width=".6"/>
    ${[-60, -35, -12, 12, 35, 60].map((a) => `<path d="M0 -5 L${(Math.sin(a * Math.PI / 180) * 16).toFixed(1)} ${(-5 - Math.cos(a * Math.PI / 180) * 26).toFixed(1)}" stroke="#eaa7b3" stroke-width=".6" opacity=".7"/>`).join('')}
    <path d="M-6.8 -24 C-8.5 -17 -9.5 -12 -8 -7 C-6 -9 -5.5 -12 -4.5 -15 L4.5 -15 C5.5 -12 6 -9 8 -7 C9.5 -12 8.5 -17 6.8 -24Z" fill="url(#${g}h)"/>
    <path d="M-4.5 -11 C-6.5 -5 -3 -1 4 -1.5 C7.5 -1.8 9.5 -.5 11 1.5 L13.4 .6 C12.4 -2.6 9 -5 5 -5 C2.5 -5 3 -8 4 -11Z" fill="url(#${g}t)" stroke="#3f9e98" stroke-width=".5"/>
    ${[[-2.5, -7], [0, -4.5], [3, -3], [6, -3.2], [-3, -4]].map(([x, yy]) => `<path d="M${x - 1.2} ${yy} q1.2 1.4 2.4 0" stroke="#d9fbf4" stroke-width=".5" fill="none" opacity=".8"/>`).join('')}
    <path d="M12 1 C13.5 -3.5 19 -4 19.5 -.5 C17.5 1 15 1.6 12.8 1.8Z M12.6 1.6 C13.5 5 17.5 7.4 18.8 5 C17.5 3 15.4 2.2 12.8 1.8Z" fill="#b6ece4" stroke="#5cc2b8" stroke-width=".5"/><path d="M13.5 1.2 L18 -1.5 M13.5 2 L17.5 4.6" stroke="#fff" stroke-width=".4" opacity=".8"/>
    <path d="M-16 -4 C-16 -9 16 -9 16 -4 Q0 2 -16 -4Z" fill="url(#${g}s)" stroke="#e79fae" stroke-width=".6"/>${[-11, -5.5, 0, 5.5, 11].map((x) => `<path d="M0 0 L${x} -6.6" stroke="#eaa7b3" stroke-width=".5" opacity=".7"/>`).join('')}
    <path d="M-4.4 -11 C-4.4 -14 -3.8 -16.5 -2.4 -18 L2.4 -18 C3.8 -16.5 4.4 -14 4.4 -11Z" fill="#ffe2cf"/>
    <path d="M-2.4 -17.5 C-5.5 -15 -6.5 -11 -4.8 -8.6 M2.4 -17.5 C5.5 -15 6.5 -11 4.8 -8.6" stroke="#ffe2cf" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M-4 -14.6 C-4 -16.4 -.6 -16.4 -.3 -14.4 Q-2 -13.4 -4 -14.6Z M4 -14.6 C4 -16.4 .6 -16.4 .3 -14.4 Q2 -13.4 4 -14.6Z" fill="#c9b6f2" stroke="#a48ad8" stroke-width=".3"/>
    <circle cy="-24" r="5.6" fill="#ffe8d8"/>
    <path d="M-6 -24 C-6.4 -30.6 6.4 -30.6 6 -24 C5 -27.2 2 -27.8 0 -26.6 C-2 -27.8 -4.6 -26.8 -6 -24Z" fill="url(#${g}h)"/><path d="M-6 -24 C-7.5 -20 -5.8 -17 -6.5 -13" stroke="#ec7484" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <circle cx="-2.1" cy="-23.6" r=".85" fill="#4a3a4a"/><circle cx="2.1" cy="-23.6" r=".85" fill="#4a3a4a"/><circle cx="-1.8" cy="-23.9" r=".3" fill="#fff"/><circle cx="2.4" cy="-23.9" r=".3" fill="#fff"/><path d="M-1 -21.3 q1 .9 2 0" stroke="#e48aa0" stroke-width=".6" fill="none"/>
    <ellipse cx="-3.7" cy="-22" rx="1.3" ry=".8" fill="#ffb3c1" opacity=".75"/><ellipse cx="3.7" cy="-22" rx="1.3" ry=".8" fill="#ffb3c1" opacity=".75"/>
    <path d="M4.5 -30 l.7 1.6 1.7 .2 -1.3 1.1 .4 1.7 -1.5 -.9 -1.5 .9 .4 -1.7 -1.3 -1.1 1.7 -.2z" fill="#ffd36e" stroke="#e0a83e" stroke-width=".3"/>
    <circle cx="-9" cy="-3.6" r="2.2" fill="url(#${g}p)"/><circle cx="-5.6" cy="-2.8" r="1.6" fill="url(#${g}p)"/></g>`; },
};

/* ---- molded (figure) candles: shaded 3D body that melts from the top with a wax pool, drips and a puddle ---- */
const ptsPath = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + 'Z';
const mirrorPts = (right) => [...right, ...right.slice().reverse().map(([x, y]) => [-x, y])];
function halfAt(right, y) {
  for (let i = 0; i < right.length - 1; i++) {
    const [x0, y0] = right[i], [x1, y1] = right[i + 1];
    if (y <= y0 && y >= y1) return y0 === y1 ? Math.max(x0, x1) : x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}
const cubic = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };
const shellPt = (w, h, deg, k = 1) => { const a = (deg * Math.PI) / 180; return [Math.cos(a) * w * 0.5 * k, -8 + Math.sin(a) * (h - 8) * k]; };
const OUTLINE = {
  pumpkin: (w, h) => { const r = []; for (let i = 0; i <= 24; i++) { const t = 0.03 + (i / 24) * 0.94, v = 2 * t - 1; r.push([(w / 2) * Math.pow(1 - Math.pow(Math.abs(v), 2.4), 1 / 2.4), -t * h]); } r[0][1] = 0; r.push([0, -h]); return r; },
  tamagotchi: (w, h) => { const r = []; for (let i = 0; i <= 30; i++) { const p = Math.PI - (i / 30) * Math.PI; r.push([Math.max(i ? 0 : w * 0.2, (w / 2) * Math.sin(p) * (1 - 0.1 * Math.cos(p))), -h / 2 - (h / 2) * Math.cos(p)]); } r[0] = [w * 0.2, 0]; return r.filter((p, i) => i === 0 || p[1] < -2); },
  seashell: (w, h) => { const E = shellPt(w, h, -18); const r = [[w * 0.22, 0], [w * 0.22, -9]]; for (let i = 1; i <= 6; i++) { const t = i / 6; r.push([E[0] * t, -8 + (E[1] + 8) * t]); } for (let a = -26; a >= -90; a -= 8) r.push(shellPt(w, h, a)); r.push([0, -h]); return r.filter((p, i) => i < 2 || p[1] < r[1][1]); },
  toadstool: (w, h) => { const r = [[w * 0.46, 0], [w * 0.4, -h * 0.06], [w * 0.22, -h * 0.11], [w * 0.2, -h * 0.2], [w * 0.17, -h * 0.44], [w * 0.48, -h * 0.47]]; for (let i = 0; i <= 14; i++) { const t = 1 - (i / 14) * 0.5; r.push([cubic(-w / 2, -w / 2, w / 2, w / 2, t), cubic(-h * 0.5, -h * 1.16, -h * 1.16, -h * 0.5, t)]); } return r; },
};
const MOLD = { pumpkin: { k: 0.3, top: 0.06, tw: 0.16 }, tamagotchi: { k: 0.3, top: 0.025, tw: 0.09 }, seashell: { k: 0.2, top: 0.02, tw: 0 }, toadstool: { k: 0.32, top: 0.02, tw: 0.1 } };

const FIGURES = {
  pumpkin: (d, w, h, id) => {
    const lobes = [[-0.33, 0.19, 0.86], [0.33, 0.19, 0.86], [-0.22, 0.21, 0.95], [0.22, 0.21, 0.95], [-0.1, 0.2, 0.99], [0.1, 0.2, 0.99], [0, 0.17, 1]];
    const defs = `<radialGradient id="${id}lb" cx=".42" cy=".36" r=".66"><stop offset="0" stop-color="${light(d.c1, 0.4)}"/><stop offset=".42" stop-color="${d.c1}"/><stop offset=".82" stop-color="${d.c2}"/><stop offset="1" stop-color="${dark(d.c2, 0.28)}"/></radialGradient><linearGradient id="${id}st" x1="0" x2="1"><stop offset="0" stop-color="#5e7c3c"/><stop offset=".5" stop-color="#8fae5f"/><stop offset="1" stop-color="#55703a"/></linearGradient>`;
    let body = lobes.map(([x, rx, sy]) => `<ellipse cx="${(x * w).toFixed(1)}" cy="${(-sy * h / 2).toFixed(1)}" rx="${(rx * w).toFixed(1)}" ry="${(sy * h / 2).toFixed(1)}" fill="url(#${id}lb)" stroke="${dark(d.c2, 0.3)}" stroke-width=".8" stroke-opacity=".45"/>`).join('');
    body += [[-0.1, 0.99], [0, 1], [0.22, 0.95]].map(([x, sy]) => `<path d="M${(x * w - w * 0.07).toFixed(1)} ${(-h * sy * 0.78).toFixed(1)} q${(-w * 0.025).toFixed(1)} ${(h * 0.22).toFixed(1)} ${(w * 0.005).toFixed(1)} ${(h * 0.42).toFixed(1)}" stroke="#fff" stroke-width="${(w * 0.028).toFixed(1)}" stroke-linecap="round" fill="none" opacity=".28"/>`).join('');
    body += `<ellipse cy="${(-h * 0.06).toFixed(1)}" rx="${(w * 0.3).toFixed(1)}" ry="${(h * 0.05).toFixed(1)}" fill="${dark(d.c2, 0.3)}" opacity=".18"/>`;
    body += `<path d="M${w * 0.06} ${-h + 7} C${w * 0.05} ${-h - 2} ${w * 0.09} ${-h - 9} ${w * 0.16} ${-h - 11} L${w * 0.18} ${-h - 7} C${w * 0.13} ${-h - 5} ${w * 0.13} ${-h} ${w * 0.14} ${-h + 7}Z" fill="url(#${id}st)" stroke="#4c6632" stroke-width=".6"/>${leaf(w * 0.17, -h + 4, -15, 0.95, '#9cbf6e')}<path d="M${w * 0.06} ${-h + 5} c-6 -2 -10 -8 -6 -11 c3 -2 5 2 2 3" stroke="#7c9a52" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    return { defs, body };
  },
  seashell: (d, w, h, id) => {
    const N = 11, a0 = -164, a1 = -16, st = (a1 - a0) / N;
    let defs = '', body = '';
    for (let i = 0; i < N; i++) {
      const a = a0 + i * st, b = a + st, pa = shellPt(w, h, a), pb = shellPt(w, h, b), pm = shellPt(w, h, (a + b) / 2, 1.075);
      defs += `<linearGradient id="${id}r${i}" gradientUnits="userSpaceOnUse" x1="${pa[0].toFixed(1)}" y1="${pa[1].toFixed(1)}" x2="${pb[0].toFixed(1)}" y2="${pb[1].toFixed(1)}"><stop offset="0" stop-color="${dark(d.c2, 0.14)}"/><stop offset=".45" stop-color="${light(d.c1, 0.5)}"/><stop offset=".62" stop-color="${d.c1}"/><stop offset="1" stop-color="${dark(d.c2, 0.2)}"/></linearGradient>`;
      body += `<path d="M0 -8 L${pa[0].toFixed(1)} ${pa[1].toFixed(1)} Q${pm[0].toFixed(1)} ${pm[1].toFixed(1)} ${pb[0].toFixed(1)} ${pb[1].toFixed(1)}Z" fill="url(#${id}r${i})" stroke="${dark(d.c2, 0.18)}" stroke-width=".5" stroke-opacity=".5"/>`;
    }
    defs += `<radialGradient id="${id}sh" cx=".36" cy=".2" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="${dark(d.c2, 0.4)}" stop-opacity=".25"/></radialGradient><radialGradient id="${id}pl" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f6ede6"/><stop offset="1" stop-color="#dccfc4"/></radialGradient>`;
    body += `<path d="${ptsPath(mirrorPts(OUTLINE.seashell(w, h)).filter((p) => p[1] < -9))}" fill="url(#${id}sh)"/>`;
    [0.42, 0.62, 0.82].forEach((f) => { let p = ''; for (let a = a0 + 4; a <= a1 - 4; a += 6) { const q = shellPt(w, h, a, f); p += `${p ? ' L' : 'M'}${q[0].toFixed(1)} ${(q[1] + (1 - f) * 2).toFixed(1)}`; } body += `<path d="${p}" stroke="${dark(d.c2, 0.25)}" stroke-width=".6" fill="none" opacity=".35"/>`; });
    const ear = (s) => `<path d="M${s * w * 0.05} -6 L${s * w * 0.23} -1 L${s * w * 0.23} -11 L${s * w * 0.07} -13Z" fill="${d.c2}" stroke="${dark(d.c2, 0.2)}" stroke-width=".6"/><path d="M${s * w * 0.1} -5 L${s * w * 0.1} -12 M${s * w * 0.16} -3 L${s * w * 0.16} -12" stroke="${dark(d.c2, 0.2)}" stroke-width=".5" opacity=".6"/>`;
    body += ear(-1) + ear(1) + `<rect x="${-w * 0.08}" y="-12" width="${w * 0.16}" height="12" rx="3" fill="${dark(d.c2, 0.06)}"/><circle cx="${w * 0.3}" cy="-5" r="5.5" fill="url(#${id}pl)"/><circle cx="${w * 0.39}" cy="-3.5" r="3.4" fill="url(#${id}pl)"/><circle cx="${w * 0.285}" cy="-6.5" r="1.4" fill="#fff"/>`;
    return { defs, body };
  },
  tamagotchi: (d, w, h, id) => {
    const acc = d.accent || '#f6a6c1';
    const defs = `<radialGradient id="${id}eg" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${light(d.c1, 0.5)}"/><stop offset=".35" stop-color="${d.c1}"/><stop offset=".8" stop-color="${d.c2}"/><stop offset="1" stop-color="${dark(d.c2, 0.25)}"/></radialGradient><linearGradient id="${id}lcd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9dcae"/><stop offset=".25" stop-color="#e3f0cf"/><stop offset="1" stop-color="#d2e4b8"/></linearGradient><radialGradient id="${id}bt" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${light(acc, 0.6)}"/><stop offset=".55" stop-color="${acc}"/><stop offset="1" stop-color="${dark(acc, 0.25)}"/></radialGradient>`;
    const sx = -w * 0.26, sy = -h * 0.72, sw = w * 0.52, shh = h * 0.36;
    const pet = ['..XXXX..', '.X....X.', 'X.X..X.X', 'X......X', 'X..XX..X', '.X....X.', '..X..X..'];
    const cell = (sw - 14) / 8 * 0.62;
    let px = '';
    pet.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'X') px += `<rect x="${(x * cell).toFixed(2)}" y="${(y * cell).toFixed(2)}" width="${(cell * 0.9).toFixed(2)}" height="${(cell * 0.9).toFixed(2)}" fill="#34452a"/>`; }));
    let body = `<path d="${ptsPath(mirrorPts(OUTLINE.tamagotchi(w, h)))}" fill="url(#${id}eg)" stroke="${dark(d.c2, 0.22)}" stroke-width=".8"/>`;
    body += `<path d="M${-w * 0.36} ${-h * 0.5} C${-w * 0.36} ${-h * 0.8} ${-w * 0.14} ${-h * 0.95} ${w * 0.04} ${-h * 0.96}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>`;
    body += `<rect x="${sx - 4}" y="${sy - 4}" width="${sw + 8}" height="${shh + 8}" rx="10" fill="${dark(d.c2, 0.14)}"/><rect x="${sx - 3}" y="${sy - 3}" width="${sw + 6}" height="${shh + 6}" rx="9" fill="none" stroke="${light(d.c1, 0.5)}" stroke-width="1" opacity=".6" transform="translate(.6 .8)"/>`;
    body += `<rect x="${sx}" y="${sy}" width="${sw}" height="${shh}" rx="6" fill="url(#${id}lcd)"/><rect x="${sx}" y="${sy}" width="${sw}" height="3" rx="1.5" fill="#000" opacity=".1"/>`;
    body += `<g transform="translate(${(-cell * 4).toFixed(1)},${(sy + shh * 0.3).toFixed(1)})">${px}</g><path transform="translate(${(sx + 6).toFixed(1)},${(sy + 6).toFixed(1)}) scale(.22)" d="${heartPath}" fill="#34452a"/><path transform="translate(${(sx + 12).toFixed(1)},${(sy + 6).toFixed(1)}) scale(.22)" d="${heartPath}" fill="#34452a"/><path transform="translate(${(sx + 18).toFixed(1)},${(sy + 6).toFixed(1)}) scale(.22)" d="${heartPath}" fill="#34452a" opacity=".3"/>`;
    body += [[-0.2, 0.2], [0, 0.155], [0.2, 0.2]].map(([x, y]) => `<circle cx="${x * w}" cy="${-h * y + 1}" r="${w * 0.068}" fill="${dark(acc, 0.35)}" opacity=".35"/><circle cx="${x * w}" cy="${-h * y}" r="${w * 0.065}" fill="url(#${id}bt)"/><circle cx="${x * w - w * 0.02}" cy="${-h * y - w * 0.022}" r="${w * 0.018}" fill="#fff" opacity=".8"/>`).join('');
    body += [-1, 0, 1].map((x) => `<circle cx="${x * 4}" cy="${-h * 0.07}" r=".9" fill="${dark(d.c2, 0.3)}" opacity=".5"/>`).join('');
    body += `<circle cx="${-w * 0.22}" cy="${-h - 1}" r="4.2" fill="none" stroke="${GOLD}" stroke-width="1.7"/><circle cx="${-w * 0.27}" cy="${-h - 7}" r="2.4" fill="none" stroke="${GOLD}" stroke-width="1.3"/>`;
    return { defs, body };
  },
  toadstool: (d, w, h, id, opts) => {
    const acc = d.accent || '#e9898c', ink = mix(dark(acc, 0.55), '#6b4a3a', 0.5);
    const capD = `M${-w * 0.49} ${-h * 0.49} C${-w * 0.52} ${-h * 0.82} ${-w * 0.22} ${-h * 1.02} ${w * 0.02} ${-h * 1.0} C${w * 0.3} ${-h * 0.99} ${w * 0.53} ${-h * 0.8} ${w * 0.49} ${-h * 0.5} C${w * 0.3} ${-h * 0.475} ${-w * 0.3} ${-h * 0.475} ${-w * 0.49} ${-h * 0.49}Z`;
    const defs = `<filter id="${id}wc" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter><radialGradient id="${id}cap" cx=".42" cy=".3" r=".75"><stop offset="0" stop-color="${light(acc, 0.4)}"/><stop offset=".55" stop-color="${acc}"/><stop offset="1" stop-color="${dark(acc, 0.18)}"/></radialGradient><linearGradient id="${id}stm" x1="0" x2="1"><stop offset="0" stop-color="${dark(d.c2, 0.06)}"/><stop offset=".38" stop-color="${light(d.c1, 0.5)}"/><stop offset=".75" stop-color="${d.c1}"/><stop offset="1" stop-color="${dark(d.c2, 0.1)}"/></linearGradient>`;
    const stroke = `stroke="${ink}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"`;
    let body = `<ellipse cy="1" rx="${w * 0.36}" ry="3.5" fill="${ink}" opacity=".12"/>`;
    body += `<path d="M${-w * 0.15} ${-h * 0.47} C${-w * 0.17} ${-h * 0.32} ${-w * 0.26} ${-h * 0.12} ${-w * 0.22} ${-h * 0.03} C${-w * 0.12} ${h * 0.01} ${w * 0.12} ${h * 0.01} ${w * 0.22} ${-h * 0.03} C${w * 0.26} ${-h * 0.12} ${w * 0.17} ${-h * 0.32} ${w * 0.15} ${-h * 0.47}Z" fill="url(#${id}stm)" ${stroke}/>`;
    body += `<path d="M${-w * 0.08} ${-h * 0.4} C${-w * 0.1} ${-h * 0.28} ${-w * 0.13} ${-h * 0.16} ${-w * 0.12} ${-h * 0.08}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>`;
    let frill = `M${-w * 0.46} ${-h * 0.49}`;
    for (let i = 0; i < 10; i++) { const x0 = -w * 0.46 + (i / 10) * w * 0.92, x1 = x0 + w * 0.092; frill += ` Q${((x0 + x1) / 2).toFixed(1)} ${(-h * 0.415 - Math.sin(((i + 0.5) / 10) * Math.PI) * h * 0.035).toFixed(1)} ${x1.toFixed(1)} ${(-h * 0.49 + Math.sin(((i + 1) / 10) * Math.PI) * h * 0.035 * 0).toFixed(1)}`; }
    body += `<path d="${frill} C${w * 0.3} ${-h * 0.51} ${-w * 0.3} ${-h * 0.51} ${-w * 0.46} ${-h * 0.49}Z" fill="${light(d.c1, 0.3)}" ${stroke}/>`;
    body += `<path d="${capD}" fill="url(#${id}cap)" ${stroke}/>`;
    body += `<path d="M${-w * 0.36} ${-h * 0.62} C${-w * 0.33} ${-h * 0.78} ${-w * 0.2} ${-h * 0.9} ${-w * 0.05} ${-h * 0.93}" stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".45"/>`;
    body += [[-0.25, -0.7, 0.085, 0.75, -10], [0.12, -0.86, 0.07, 0.8, 15], [0.31, -0.64, 0.075, 0.7, 25], [-0.05, -0.62, 0.05, 0.75, 0], [-0.13, -0.88, 0.035, 0.85, 0], [0.4, -0.54, 0.035, 0.7, 0], [-0.4, -0.55, 0.04, 0.7, 0]].map(([x, y, r, k, rot]) => `<ellipse transform="rotate(${rot} ${x * w} ${y * h})" cx="${x * w}" cy="${y * h}" rx="${r * w}" ry="${r * w * k}" fill="${light(d.c1, 0.6)}" stroke="${ink}" stroke-width=".7" stroke-opacity=".55"/>`).join('');
    const baby = `<g transform="translate(${-w * 0.33},${-h * 0.01}) rotate(-14)"><path d="M-3.4 0 C-3.8 -5 -2.6 -9 -2.4 -12 L2.4 -12 C2.6 -9 3.8 -5 3.4 0Z" fill="url(#${id}stm)" ${stroke}/><path d="M-10 -11 C-10 -21 10 -21 10 -11 C5 -9.5 -5 -9.5 -10 -11Z" fill="url(#${id}cap)" ${stroke}/><ellipse cx="-3.5" cy="-15.5" rx="2.2" ry="1.6" fill="${light(d.c1, 0.6)}"/><ellipse cx="3.5" cy="-16" rx="1.6" ry="1.2" fill="${light(d.c1, 0.6)}"/></g>`;
    const clover = (x, s) => `<g transform="translate(${x * w},0) scale(${s})" ${stroke} stroke-width="0.9"><path d="M0 0 C0 -4 1 -7 2 -9" fill="none"/>${[-60, 30, 120].map((a) => `<path transform="translate(2 -9) rotate(${a})" d="M0 0 C-3 -2 -3 -6 0 -5 C3 -6 3 -2 0 0Z" fill="#a9cf8e"/>`).join('')}</g>`;
    body += baby + clover(0.27, 0.9) + clover(0.36, 0.65) + `<path d="M${w * 0.15} -1 l2 -4 M${w * 0.19} -1 l-1 -4.5 M${-w * 0.18} -1 l1.5 -3.5" ${stroke} stroke="#7aa462"/>`;
    return { defs, body: `<g filter="url(#${id}wc)">${body}</g>` };
  },
};

/* ---- painted candles: 6 watercolor melt stages crossfaded by remaining wax, plus live wax animation ---- */
const ART = {
  scallop: { ar: 0.921, h: 112, drip: '#f9b3c3', molded: true, st: [[0.471, 0.004, 0.12], [0.474, 0.096, 0.2], [0.473, 0.107, 0.2], [0.473, 0.122, 0.22], [0.471, 0.326, 0.33], [0.473, 0.604, 0.42]] },
  pumpkin: { ar: 1.069, h: 98, drip: '#f7a53e', molded: true, st: [[0.475, 0.166, 0.18], [0.469, 0.271, 0.28], [0.48, 0.268, 0.3], [0.481, 0.336, 0.33], [0.477, 0.436, 0.36], [0.479, 0.639, 0.44]] },
  clam: { ar: 0.82, h: 120, drip: '#fff6ea', st: [[0.471, 0.531, 0.4], [0.47, 0.594, 0.4], [0.465, 0.605, 0.4], [0.469, 0.624, 0.4], [0.488, 0.705, 0.36], [0.483, 0.727, 0.34]] },
  conch: { ar: 0.527, h: 150, drip: '#f9c2a4', molded: true, st: [[0.463, 0.006, 0.08], [0.447, 0.12, 0.16], [0.451, 0.143, 0.2], [0.453, 0.259, 0.26], [0.452, 0.462, 0.28], [0.469, 0.728, 0.3]] },
  abalone: { ar: 1.295, h: 82, drip: '#bfe8da', st: [[0.502, 0.29, 0.4], [0.507, 0.364, 0.4], [0.508, 0.364, 0.4], [0.506, 0.413, 0.4], [0.506, 0.495, 0.38], [0.524, 0.54, 0.36]] },
};
Object.assign(ART, ART3);
const BODY_H = { pillar: 120, taper: 150, votive: 78 };
for (const [k, b] of Object.entries(ART4.body)) ART['b_' + k] = { file: 'body_' + k, dir: 'art4', ar: b.ar, h: BODY_H[k], st: b.st, drip: '#fff8ee', molded: 1, baseW: b.baseW };
const artSize = (d) => { const a = ART[d.art]; return { w: Math.round(a.h * a.ar), h: a.h }; };
const artStops = (a) => a.rs || (a.rs = a.st.map(([, y]) => (a.st[a.st.length - 1][1] - y) / (a.st[a.st.length - 1][1] - a.st[0][1])).map((v, i, arr) => Math.min(v, ...arr.slice(0, i + 1)) - i * 0.01).map((v, i, arr) => (i === arr.length - 1 ? 0 : v)));
const phaseVar = (dur, off = 0) => `--ph:${(-((Date.now() / 1000 + off) % dur)).toFixed(2)}s`;
const phase = (dur, off = 0) => `animation-duration:${dur}s;animation-delay:${(-((Date.now() / 1000 + off) % dur)).toFixed(2)}s`;
function paintedCandle(d, r, id, opts) {
  const a = ART[d.art], { w, h } = artSize(d), rs = artStops(a), n = rs.length;
  let k = 0;
  while (k < n - 2 && r < rs[k + 1]) k++;
  const t = Math.max(0, Math.min(1, (r - rs[k + 1]) / (rs[k] - rs[k + 1] || 1)));
  const src = (i) => `href="/${a.dir || 'art'}/${a.file || d.art}_${i}.webp" x="${-w / 2}" y="${-h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"`;
  const sm = (x) => x * x * (3 - 2 * x);
  const q = 1 - Math.min(1, t / 0.4), qa = sm(Math.min(1, q / 0.7)), qb = Math.max(0, (q - 0.7) / 0.3);
  const lerp = (j) => a.st[k][j] * (1 - qa) + a.st[k + 1][j] * qa;
  const wx = (lerp(0) - 0.5) * w, wy = -h + lerp(1) * h, span = lerp(2) * w;
  const box = `maskUnits="userSpaceOnUse" x="${-w / 2}" y="${-h}" width="${w}" height="${h}"`;
  let art;
  if (q <= 0) art = `<image ${src(k)}/>`;
  else if (qb <= 0) {
    const cy = wy + h * 0.03, f = h * 0.035;
    art = `<image ${src(k + 1)}/><linearGradient id="${id}ag" gradientUnits="userSpaceOnUse" x1="0" y1="${(cy - f).toFixed(1)}" x2="0" y2="${(cy + f).toFixed(1)}"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="${id}am" ${box}><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="url(#${id}ag)"/></mask><image ${src(k)} mask="url(#${id}am)"/>`;
  } else art = `<image ${src(k + 1)}/>${qb < 0.99 ? `<mask id="${id}am" mask-type="alpha" ${box}><image ${src(k + 1)}/></mask><image ${src(k)} opacity="${(1 - sm(qb)).toFixed(2)}" mask="url(#${id}am)"/>` : ''}`;
  let out = `<ellipse cy="1" rx="${w * 0.4}" ry="4" fill="#3a2420" opacity=".1"/>${art}`;
  if (opts.lit && r > 0.01) {
    const py = wy + h * 0.05, ry = Math.max(2, span * 0.3), u = h / 110;
    out += `<defs><radialGradient id="${id}wg"><stop offset="0" stop-color="#fff2c8" stop-opacity=".75"/><stop offset=".5" stop-color="#ffd38a" stop-opacity=".3"/><stop offset="1" stop-color="#ffc070" stop-opacity="0"/></radialGradient></defs>`;
    out += `<ellipse class="wax-glow" style="${phase(2.6)}" cx="${wx.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(span * 1.15 + 8).toFixed(1)}" ry="${(ry * 1.4 + 6).toFixed(1)}" fill="url(#${id}wg)"/>`;
    out += `<ellipse class="wax-ripple" style="${phase(3.4)}" cx="${wx.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(span * 0.6 + 3).toFixed(1)}" ry="${(ry * 0.6 + 1).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${(0.9 * u).toFixed(2)}"/>`;
    out += `<ellipse class="wax-ripple" style="${phase(3.4, 1.7)}" cx="${wx.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(span * 0.6 + 3).toFixed(1)}" ry="${(ry * 0.6 + 1).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${(0.8 * u).toFixed(2)}"/>`;
    out += `<ellipse class="wax-sheen" style="${phase(5)}" cx="${(wx - span * 0.25).toFixed(1)}" cy="${(py - ry * 0.25).toFixed(1)}" rx="${(span * 0.22 + 1.5).toFixed(1)}" ry="${(ry * 0.25 + 0.6).toFixed(1)}" fill="#fff" opacity=".55"/>`;
    if (a.molded && span > 6) {
      const R = rng(d.id + 'drip');
      [-0.72, -0.2, 0.34, 0.8].forEach((f, i) => {
        const dx = wx + f * span, dy = py + ry * Math.sqrt(1 - f * f) - 0.6 * u, dur = +(6 + R() * 5).toFixed(1), off = R() * dur;
        out += `<g transform="translate(${dx.toFixed(1)},${dy.toFixed(1)}) scale(${(u * (0.6 + R() * 0.35)).toFixed(2)})"><g class="wax-drip" style="${phase(dur, off)}"><path d="M-1.7 -1 C-1.5 2.5 -1 5.5 -1.3 7.6 a1.65 1.65 0 0 0 3.3 0 C1.7 5.5 1.9 2.5 2.1 -1Z" fill="${a.drip}" fill-opacity=".9"/><ellipse cx="-.1" cy="7.7" rx=".55" ry=".8" fill="#fff" opacity=".75"/></g></g>`;
      });
    }
  }
  return { out, tip: wy, x: wx, art };
}

/* ---- vessel candles: wax poured into a ceramic pumpkin / real shell; the wax level sinks as it burns ---- */
const pearl = (x, y, r, g) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#${g})"/>`;
const VESSELS = {
  pumpkin: (d, w, h, r, opts, id) => {
    const rxR = w * 0.46, ryR = w * 0.13, rxO = w * 0.24, ryO = w * 0.068, top = -h;
    const molten = opts.lit ? mix(d.drip, '#ffd58a', 0.35) : d.drip;
    let defs = `<radialGradient id="${id}lb" cx=".34" cy=".28" r=".8"><stop offset="0" stop-color="${light(d.c1, 0.45)}"/><stop offset=".35" stop-color="${d.c1}"/><stop offset=".85" stop-color="${d.c2}"/><stop offset="1" stop-color="${dark(d.c2, 0.25)}"/></radialGradient><radialGradient id="${id}sho" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="${d.c2}"/><stop offset=".7" stop-color="${d.c1}"/><stop offset="1" stop-color="${light(d.c1, 0.2)}"/></radialGradient><radialGradient id="${id}wx" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="${light(molten, 0.5)}"/><stop offset="1" stop-color="${dark(molten, 0.05)}"/></radialGradient><clipPath id="${id}op"><ellipse cy="${top}" rx="${rxO}" ry="${ryO}"/></clipPath>`;
    let back = `<ellipse cy="3" rx="${w * 0.48}" ry="6" fill="#3a2420" opacity=".12"/>`;
    back += `<ellipse cy="${top}" rx="${rxR * 0.9}" ry="${ryR}" fill="url(#${id}sho)" stroke="${dark(d.c2, 0.3)}" stroke-width=".6" stroke-opacity=".4"/>`;
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; back += `<path d="M${(Math.cos(a) * rxO * 1.05).toFixed(1)} ${(top + Math.sin(a) * ryO * 1.05).toFixed(1)} L${(Math.cos(a) * rxR * 0.86).toFixed(1)} ${(top + Math.sin(a) * ryR * 0.92).toFixed(1)}" stroke="${dark(d.c2, 0.28)}" stroke-width=".8" opacity=".35"/>`; }
    back += `<ellipse cy="${top}" rx="${rxO + 2.5}" ry="${ryO + 1.2}" fill="${light(d.c1, 0.35)}"/><ellipse cy="${top}" rx="${rxO}" ry="${ryO}" fill="${dark(d.c2, 0.4)}"/>`;
    const lvl = top + 2 + (1 - r) * h * 0.5, wrx = rxO * (0.96 - (1 - r) * 0.12);
    back += `<g clip-path="url(#${id}op)"><ellipse cy="${(lvl + ryO * 0.15).toFixed(1)}" rx="${wrx.toFixed(1)}" ry="${(ryO * 0.9).toFixed(1)}" fill="url(#${id}wx)"/><rect x="${-rxO}" y="${(lvl + ryO * 0.15).toFixed(1)}" width="${2 * rxO}" height="${h}" fill="${dark(molten, 0.08)}"/></g>`;
    const xs = [[-0.36, 0.085], [0.36, 0.085], [-0.21, 0.12], [0.21, 0.12], [0, 0.14]];
    let front = '';
    xs.forEach(([f, lwf]) => {
      const x = f * w, lw = w * lwf, t = top + ryR * Math.sqrt(Math.max(0, 1 - Math.pow(x / rxR, 2))) * 0.55, mid = -h * 0.46, bx = x * 0.9;
      const p = (sx) => `C${(x + sx * lw * 0.55).toFixed(1)} ${t.toFixed(1)} ${(x + sx * lw * 1.3).toFixed(1)} ${(t + (mid - t) * 0.35).toFixed(1)} ${(x + sx * lw * 1.3).toFixed(1)} ${mid.toFixed(1)}`;
      front += `<path d="M${x.toFixed(1)} ${t.toFixed(1)} ${p(-1)} C${(x - lw * 1.3).toFixed(1)} ${(-h * 0.12).toFixed(1)} ${(bx - lw * 0.8).toFixed(1)} 0 ${bx.toFixed(1)} 0 C${(bx + lw * 0.8).toFixed(1)} 0 ${(x + lw * 1.3).toFixed(1)} ${(-h * 0.12).toFixed(1)} ${(x + lw * 1.3).toFixed(1)} ${mid.toFixed(1)} C${(x + lw * 1.3).toFixed(1)} ${(t + (mid - t) * 0.35).toFixed(1)} ${(x + lw * 0.55).toFixed(1)} ${t.toFixed(1)} ${x.toFixed(1)} ${t.toFixed(1)}Z" fill="url(#${id}lb)" stroke="${dark(d.c2, 0.32)}" stroke-width=".7" stroke-opacity=".45"/>`;
      front += `<path d="M${(x - lw * 0.55).toFixed(1)} ${(t + (mid - t) * 0.45).toFixed(1)} Q${(x - lw * 0.8).toFixed(1)} ${mid.toFixed(1)} ${(x - lw * 0.55).toFixed(1)} ${(-h * 0.2).toFixed(1)}" stroke="#fff" stroke-width="${(lw * 0.16).toFixed(1)}" stroke-linecap="round" fill="none" opacity=".4"/>`;
    });
    front += `<path d="M${-rxO * 0.6} ${top + ryR * 0.62} Q0 ${top + ryR * 0.9} ${rxO * 0.6} ${top + ryR * 0.62}" stroke="${dark(d.c2, 0.25)}" stroke-width=".8" fill="none" opacity=".3"/>`;
    
front += `<path d="M${-rxO - 2.5} ${top} A${rxO + 2.5} ${ryO + 1.2} 0 0 0 ${rxO + 2.5} ${top}" stroke="${light(d.c1, 0.55)}" stroke-width="1.6" fill="none"/>`;
    if (d.dots) front += Array.from({ length: 16 }, (_, i) => `<circle cx="${((i % 8) - 3.5) * w * 0.1}" cy="${-h * (0.3 + Math.floor(i / 8) * 0.25) - (i % 3) * 3}" r="1.2" fill="#fff" opacity=".85"/>`).join('');
    return { defs, back, front, wick: lvl + ryO * 0.15 };
  },
  seashell: (d, w, h, r, opts, id) => {
    const A = [0, -h * 0.2], N = 13, a0 = -166, a1 = -14, st = (a1 - a0) / N;
    const P = (deg, k = 1) => { const a = (deg * Math.PI) / 180; return [Math.cos(a) * w * 0.47 * k, A[1] + Math.sin(a) * h * 0.8 * k]; };
    const molten = opts.lit ? mix(mix(d.drip, d.c1, 0.3), '#ffd58a', 0.3) : mix(d.drip, d.c1, 0.3);
    let defs = `<filter id="${id}wc" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter><linearGradient id="${id}ir" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9c8ff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#bdf0e6" stop-opacity=".35"/></linearGradient><radialGradient id="${id}pr" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fbf1ec"/><stop offset="1" stop-color="#dcc9c0"/></radialGradient><radialGradient id="${id}wx" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="${light(molten, 0.5)}"/><stop offset="1" stop-color="${molten}"/></radialGradient><linearGradient id="${id}bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light(d.c1, 0.4)}"/><stop offset="1" stop-color="${d.c2}"/></linearGradient>`;
    let lid = '', outline = '';
    for (let i = 0; i < N; i++) {
      const a = a0 + i * st, b = a + st, pa = P(a), pb = P(b), pm = P((a + b) / 2, 1.065), pc = P((a + b) / 2, 0.9);
      defs += `<linearGradient id="${id}r${i}" gradientUnits="userSpaceOnUse" x1="${pa[0].toFixed(1)}" y1="${pa[1].toFixed(1)}" x2="${pb[0].toFixed(1)}" y2="${pb[1].toFixed(1)}"><stop offset="0" stop-color="${d.c2}"/><stop offset=".5" stop-color="${light(d.c1, 0.6)}"/><stop offset="1" stop-color="${dark(d.c2, 0.06)}"/></linearGradient>`;
      lid += `<path d="M${A[0]} ${A[1]} L${pa[0].toFixed(1)} ${pa[1].toFixed(1)} Q${pm[0].toFixed(1)} ${pm[1].toFixed(1)} ${pb[0].toFixed(1)} ${pb[1].toFixed(1)}Z" fill="url(#${id}r${i})"/><path d="M${(A[0] + (pc[0] - A[0]) * 0.25).toFixed(1)} ${(A[1] + (pc[1] - A[1]) * 0.25).toFixed(1)} L${pc[0].toFixed(1)} ${pc[1].toFixed(1)}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`;
      outline += `${i ? '' : `M${pa[0].toFixed(1)} ${pa[1].toFixed(1)}`} Q${pm[0].toFixed(1)} ${pm[1].toFixed(1)} ${pb[0].toFixed(1)} ${pb[1].toFixed(1)}`;
    }
    lid += `<path d="M${A[0]} ${A[1]} L${P(a0)[0].toFixed(1)} ${P(a0)[1].toFixed(1)}${outline}Z" fill="url(#${id}ir)"/><path d="${outline}" stroke="${light(d.c1, 0.7)}" stroke-width="2.2" fill="none" opacity=".9"/><path d="${outline}" stroke="${dark(d.c2, 0.15)}" stroke-width=".6" fill="none" opacity=".5"/>`;
    const y0 = -h * 0.3, rx = w * 0.46, ry = w * 0.075;
    const lvl = y0 + 3 + (1 - r) * h * 0.14, wrx = rx * (0.9 - (1 - r) * 0.3);
    let back = `<ellipse cy="3" rx="${w * 0.42}" ry="5" fill="#3a2420" opacity=".1"/><g filter="url(#${id}wc)">${lid}</g>`;
    defs += `<clipPath id="${id}op"><ellipse cy="${y0}" rx="${rx - 2}" ry="${ry - 1}"/></clipPath>`;
    back += `<ellipse cy="${y0}" rx="${rx}" ry="${ry}" fill="${dark(d.c2, 0.12)}"/><g clip-path="url(#${id}op)"><ellipse cy="${lvl.toFixed(1)}" rx="${wrx.toFixed(1)}" ry="${(ry * 0.85).toFixed(1)}" fill="url(#${id}wx)"/></g>`;
    let front = `<path d="M${-rx} ${y0} C${-rx * 0.98} ${y0 + h * 0.2} ${-rx * 0.45} -1 0 -1 C${rx * 0.45} -1 ${rx * 0.98} ${y0 + h * 0.2} ${rx} ${y0} A${rx} ${ry} 0 0 1 ${-rx} ${y0}Z" fill="url(#${id}bw)"/>`;
    for (let i = 1; i < 12; i++) { const a = Math.PI * (i / 12); front += `<path d="M0 -3 L${(-Math.cos(a) * rx * 0.98).toFixed(1)} ${(y0 + Math.sin(a) * ry * 0.98).toFixed(1)}" stroke="#fff" stroke-width="1.3" opacity=".45"/>`; }
    let edge = `M${-rx} ${y0}`;
    for (let i = 0; i < 12; i++) { const a = Math.PI - (i / 12) * Math.PI, b = Math.PI - ((i + 1) / 12) * Math.PI, m = (a + b) / 2; edge += ` Q${(Math.cos(m) * rx * 1.02).toFixed(1)} ${(y0 + Math.sin(m) * ry * 1.25 + 1.5).toFixed(1)} ${(Math.cos(b) * rx).toFixed(1)} ${(y0 + Math.sin(b) * ry).toFixed(1)}`; }
    front += `<path d="${edge}" stroke="${light(d.c1, 0.7)}" stroke-width="2" fill="none"/>`;
    front = `<g filter="url(#${id}wc)">${front}</g>`;
    let strand = '';
    for (let i = 0; i <= 22; i++) { const t = i / 22, x = -rx * 0.78 + t * rx * 1.56, y = y0 + ry * 0.9 + Math.sin(t * Math.PI) * h * 0.07; strand += pearl(x, y, 1.9, `${id}pr`); }
    const loop = (s) => { let o = ''; for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; o += pearl(s * (7 + Math.cos(t) * 6.5), -h * 0.06 + Math.sin(t) * 4, 1.5, `${id}pr`); } return o; };
    const tail = (s) => { let o = ''; for (let i = 1; i <= 6; i++) o += pearl(s * (1.5 + i * 1.6), -h * 0.06 + i * 2.6, 1.5, `${id}pr`); return o; };
    front += strand + loop(-1) + loop(1) + tail(-1) + tail(1) + pearl(0, -h * 0.06, 2.6, `${id}pr`);
    return { defs, back, front, wick: lvl };
  },
};

function moldedCandle(d, shape, w, h, r, opts, id) {
  const right = OUTLINE[shape](w, h), sil = ptsPath(mirrorPts(right)), M = MOLD[shape];
  const full = r >= 0.999, cut = full ? -h : -h * Math.max(0.1, r);
  const art = FIGURES[shape](d, w, h, id, opts);
  const molten = opts.lit ? mix(d.drip, '#ffc56b', 0.45) : d.drip;
  let defs = `${art.defs}<clipPath id="${id}sil"><path d="${sil}"/></clipPath><clipPath id="${id}cl"><rect x="-300" y="${full ? -h - 80 : cut}" width="600" height="${h + 100}"/></clipPath>
    <radialGradient id="${id}glo" gradientUnits="userSpaceOnUse" cx="0" cy="${cut}" r="${w * 0.8}"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".65"/><stop offset=".45" stop-color="#ffcf7a" stop-opacity=".2"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}pool" cx=".5" cy=".35" r=".65"><stop offset="0" stop-color="${light(molten, 0.4)}"/><stop offset="1" stop-color="${dark(molten, 0.06)}"/></radialGradient>`;
  const baseHalf = Math.max(w * 0.2, halfAt(right, -h * 0.04));
  let out = `<ellipse cy="2" rx="${(baseHalf + 6 + (1 - r) * w * 0.3).toFixed(1)}" ry="${(4.5 + (1 - r) * 4).toFixed(1)}" fill="${d.drip}"/><ellipse cx="${(-baseHalf * 0.3).toFixed(1)}" cy="1" rx="${(baseHalf * 0.45 + (1 - r) * w * 0.1).toFixed(1)}" ry="1.4" fill="#fff" opacity=".55"/>`;
  out += `<g clip-path="url(#${id}cl)">${art.body}${opts.lit ? `<rect x="${-w}" y="${-h - 10}" width="${2 * w}" height="${h + 20}" fill="url(#${id}glo)" clip-path="url(#${id}sil)"/>` : ''}</g>`;
  let wickBase;
  if (full) {
    const yT = -h + M.top * h;
    if (M.tw) out += `<ellipse cy="${yT.toFixed(1)}" rx="${(M.tw * w).toFixed(1)}" ry="${(M.tw * w * M.k).toFixed(1)}" fill="${dark(d.c2, 0.2)}" opacity=".35"/><ellipse cy="${(yT + 0.6).toFixed(1)}" rx="${(M.tw * w * 0.7).toFixed(1)}" ry="${(M.tw * w * M.k * 0.6).toFixed(1)}" fill="url(#${id}pool)"/>`;
    wickBase = yT + 1;
  } else {
    const rx = Math.max(5, halfAt(right, cut) * 0.97), ry = Math.max(2, rx * M.k);
    const R = rng((d.id || 'custom') + shape);
    let drips = '';
    const dc = mix(d.drip, d.c1, 0.45);
    [-0.74, -0.34, 0.16, 0.6].forEach((fx0) => {
      const fx = fx0 + (R() - 0.5) * 0.12, x = fx * rx, y0 = cut + ry * Math.sqrt(1 - fx * fx) * 0.9;
      const len = 3 + (1 - r) * h * (0.18 + R() * 0.38), end = Math.min(-3, y0 + len), dw = 2 + R() * 1.8;
      drips += `<path d="M${(x - dw).toFixed(1)} ${(y0 - 2).toFixed(1)} L${(x - dw).toFixed(1)} ${end.toFixed(1)} a${dw.toFixed(1)} ${(dw * 1.2).toFixed(1)} 0 0 0 ${(2 * dw).toFixed(1)} 0 L${(x + dw).toFixed(1)} ${(y0 - 2).toFixed(1)}Z" fill="${dc}"/><path d="M${(x - dw * 0.35).toFixed(1)} ${(y0 + 1).toFixed(1)} L${(x - dw * 0.35).toFixed(1)} ${(end - 1).toFixed(1)}" stroke="#fff" stroke-width=".7" opacity=".4"/>`;
    });
    out += `<g clip-path="url(#${id}sil)">${drips}</g>`;
    out += `<ellipse cy="${cut.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${light(d.c1, 0.3)}"/><ellipse cy="${(cut + ry * 0.1).toFixed(1)}" rx="${(rx * 0.8).toFixed(1)}" ry="${(ry * 0.72).toFixed(1)}" fill="url(#${id}pool)"/><path d="M${(-rx * 0.8).toFixed(1)} ${(cut + ry * 0.1).toFixed(1)} A${(rx * 0.8).toFixed(1)} ${(ry * 0.72).toFixed(1)} 0 0 1 ${(rx * 0.8).toFixed(1)} ${(cut + ry * 0.1).toFixed(1)}" stroke="${dark(d.c1, 0.2)}" stroke-width="1" fill="none" opacity=".45"/><path d="M${(-rx * 0.5).toFixed(1)} ${(cut + ry * 0.45).toFixed(1)} q${(rx * 0.3).toFixed(1)} ${(ry * 0.2).toFixed(1)} ${(rx * 0.55).toFixed(1)} 0" stroke="#fff" stroke-width="1" fill="none" opacity=".5"/>`;
    wickBase = cut + ry * 0.1;
  }
  return { defs, out, wickBase };
}

/* ---- little illustrated motifs ---- */
const rose = (x, y, s, col) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s})">
  <circle r="10" fill="${col}"/>
  <path d="M-9.5 1 C-9 -8 0 -11.5 6 -7.5 C10.5 -4 9.5 4 4 7.5 C-1 10.5 -8.5 7.5 -9.5 1Z" fill="${dark(col, 0.18)}" opacity=".35"/>
  <path d="M-6 -1 C-5 -6.5 3.5 -7.5 5.5 -2 C6.5 2.5 1 5.5 -2 3.5 C-4.5 2 -3 -2.5 .5 -2" stroke="${dark(col, 0.32)}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M-10 2 C-8 9.5 6 11.5 10 3" stroke="${dark(col, 0.25)}" stroke-width="1" fill="none"/>
  <ellipse cx="-3.5" cy="-5.5" rx="3" ry="2" fill="#fff" opacity=".35"/></g>`;
const leaf = (x, y, rot, s = 1, col = '#9cbf8e') => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s})"><path d="M0 0 C4 -6 12 -6 17 0 C12 6 4 6 0 0Z" fill="${col}"/><path d="M1 0 L15 0" stroke="${dark(col, 0.2)}" stroke-width=".7"/></g>`;
const blossom = (x, y, s, col, mid = '#ffd98a') => {
  let p = '';
  for (let k = 0; k < 5; k++) p += `<ellipse cy="-4.2" rx="3" ry="4.4" fill="${col}" transform="rotate(${k * 72})"/>`;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s})">${p}<circle r="2" fill="${mid}"/></g>`;
};
const sparkle = (x, y, s, col, delay) => `<path class="twinkle" style="${phase(2.4, delay)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})" d="M0 -6 C.6 -1.4 1.4 -.6 6 0 C1.4 .6 .6 1.4 0 6 C-.6 1.4 -1.4 .6 -6 0 C-1.4 -.6 -.6 -1.4 0 -6Z" fill="${col}"/>`;
const heartPath = 'M0 7 C-13 -2 -13 -13 -6.5 -13 C-3 -13 -1 -10.5 0 -8.5 C1 -10.5 3 -13 6.5 -13 C13 -13 13 -2 0 7Z';
const bow = (x, y, s, col) => `<g transform="translate(${x},${y}) scale(${s})">
  <path d="M0 0 C-6 -9 -16 -9 -15 -1 C-14 5 -6 4 0 0Z" fill="${col}"/><path d="M0 0 C6 -9 16 -9 15 -1 C14 5 6 4 0 0Z" fill="${col}"/>
  <path d="M-1 1 L-7 15 L-3.5 13.5 L-2 16.5 Z M1 1 L7 15 L3.5 13.5 L2 16.5 Z" fill="${dark(col, 0.08)}"/>
  <path d="M-12 -3 C-9 -6 -5 -5 -2 -1" stroke="#fff" stroke-opacity=".5" stroke-width="1" fill="none"/>
  <ellipse rx="3" ry="3.4" fill="${dark(col, 0.15)}"/></g>`;
const butterfly = (x, y, s, col, rot = 0) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot}) scale(${s})">
  <path d="M0 0 C-6 -12 -15 -9 -12 -2 C-10 2 -4 2 0 0Z" fill="${col}"/><path d="M0 0 C6 -12 15 -9 12 -2 C10 2 4 2 0 0Z" fill="${col}"/>
  <path d="M0 0 C-5 7 -10 7 -8 2Z M0 0 C5 7 10 7 8 2Z" fill="${light(col, 0.3)}"/>
  <circle cx="-7" cy="-5" r="1.6" fill="#fff" opacity=".7"/><circle cx="7" cy="-5" r="1.6" fill="#fff" opacity=".7"/>
  <rect x="-.8" y="-5" width="1.6" height="9" rx=".8" fill="${dark(col, 0.45)}"/></g>`;

function decorMarkup(d, w, h, R) {
  const acc = d.accent || '#e7a8b8';
  let s = '';
  const strand = (y, sag, col = '#fffaf3') => {
    let o = '';
    for (let x = -w / 2 + 2; x <= w / 2 - 1; x += 4.2) o += `<circle cx="${x.toFixed(1)}" cy="${(y + Math.cos((x / w) * Math.PI) * sag).toFixed(1)}" r="1.9" fill="${col}" stroke="#eadfcf" stroke-width=".4"/>`;
    return o;
  };
  const band = (y, hh, col) => `<rect x="${-w / 2}" y="${y}" width="${w}" height="${hh}" fill="${col}"/><rect x="${-w / 2}" y="${y}" width="${w}" height="1.4" fill="#fff" opacity=".35"/>`;
  if (d.engrave) s += `<text x="0" y="${-h * 0.2}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${Math.max(5, Math.min(11, (w * 1.6) / Math.max(4, d.engrave.length)))}" fill="${dark(mix(d.c1, d.c2, 0.5), 0.35)}" stroke="${light(d.c1, 0.6)}" stroke-width=".3">${String(d.engrave).replace(/[<>&"]/g, '')}</text>`;
  (d.decor || []).forEach((k) => {
    switch (k) {
      case 'ribbon':
        s += band(-h * 0.34, 9, acc) + bow(0, -h * 0.34 + 4.5, 0.75, dark(acc, 0.05))
          + `<path d="M6 ${-h * 0.34 + 9} l6 16" stroke="#c9b08a" stroke-width=".8"/><rect x="8" y="${-h * 0.34 + 24}" width="13" height="9" rx="2" fill="#fffaf0" stroke="#e0d2bb" stroke-width=".6" transform="rotate(-12 14 ${-h * 0.34 + 28})"/>`;
        break;
      case 'heart': {
        const sc = w / 28;
        s += `<g transform="translate(0,${-h * 0.42}) scale(${sc})"><path d="${heartPath}" fill="${light(acc, 0.45)}" transform="scale(1.18) translate(0,-.6)"/><path d="${heartPath}" fill="${acc}"/><path d="${heartPath}" fill="url(#hlg)" opacity=".0"/><ellipse cx="-5" cy="-7" rx="3" ry="2" fill="#fff" opacity=".45"/><path d="M3 -10 C7 -10 9 -6 7 -2" stroke="${dark(acc, 0.2)}" stroke-width=".8" fill="none" opacity=".6"/></g>`;
        break;
      }
      case 'pearls': s += strand(-h * 0.66, 3) + strand(-h * 0.56, 4); break;
      case 'bow': s += bow(0, -h * 0.42, w / 26, acc); break;
      case 'lavender':
        [-w * 0.22, 0, w * 0.22].forEach((x, i) => {
          const topY = -h * (0.78 - i * 0.04 + (i === 1 ? 0.06 : 0));
          s += `<path d="M${x * 0.4} ${-h * 0.12} Q${x} ${-h * 0.4} ${x} ${topY}" stroke="#93ad86" stroke-width="1.3" fill="none"/>`;
          for (let j = 0; j < 7; j++) {
            const yy = topY + j * 4.2;
            s += `<ellipse cx="${(x - 2).toFixed(1)}" cy="${yy.toFixed(1)}" rx="2" ry="2.8" fill="${j % 2 ? acc : light(acc, 0.25)}" transform="rotate(-25 ${x - 2} ${yy})"/><ellipse cx="${(x + 2).toFixed(1)}" cy="${(yy + 1.5).toFixed(1)}" rx="2" ry="2.8" fill="${j % 2 ? light(acc, 0.2) : acc}" transform="rotate(25 ${x + 2} ${yy + 1.5})"/>`;
          }
        });
        break;
      case 'twine': {
        const y = -h * 0.24;
        s += `<g stroke="#c4a173" stroke-width="1.6" fill="none"><path d="M${-w / 2} ${y} Q0 ${y + 4} ${w / 2} ${y}"/><path d="M${-w / 2} ${y + 3.5} Q0 ${y + 7.5} ${w / 2} ${y + 3.5}"/><path d="M0 ${y + 5} c-6 3 -9 10 -7 14 M0 ${y + 5} c5 4 6 10 3 13"/></g><circle cx="0" cy="${y + 5}" r="2.2" fill="#b38e5f"/>`;
        break;
      }
      case 'strawberries':
        [[-0.22, 0.62], [0.2, 0.5], [-0.15, 0.32], [0.24, 0.2], [-0.25, 0.12]].forEach(([fx, fy], i) => {
          const x = fx * w, y = -h * fy;
          s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${i * 37 - 40}) scale(${w / 74})"><path d="M0 9 C-11 3 -10 -8 0 -8 C10 -8 11 3 0 9Z" fill="#ef5f6e"/><path d="M0 6 C-7 2 -6 -5 0 -5 C6 -5 7 2 0 6Z" fill="#ffc9cf"/><path d="M0 -5 L0 5" stroke="#fff" stroke-width="1"/><g fill="#fff6d6"><circle cx="-4" cy="0" r=".8"/><circle cx="4" cy="0" r=".8"/><circle cx="-2" cy="3" r=".8"/><circle cx="2" cy="3" r=".8"/></g></g>`;
        });
        break;
      case 'roses':
        s += `<path d="M${w * 0.1} ${-h * 0.05} C${-w * 0.9} ${-h * 0.22} ${w * 0.9} ${-h * 0.4} ${-w * 0.2} ${-h * 0.62}" stroke="#8fb07f" stroke-width="1.2" fill="none"/>`
          + leaf(-w / 2 - 2, -h * 0.48, 200, 0.9) + leaf(-w / 2 + 4, -h * 0.33, 150, 0.8, '#b3cfa3')
          + rose(-w / 2, -h * 0.44, 1.15, '#c84a6e') + rose(-w / 2 + 2, -h * 0.32, 0.9, '#c3a2dc')
          + blossom(w * 0.12, -h * 0.55, 0.8, '#f4a6b9') + blossom(w * 0.25, -h * 0.25, 0.6, '#f7c3cf') + blossom(-w * 0.05, -h * 0.16, 0.7, '#f4a6b9');
        break;
      case 'vine':
        s += `<path d="M${w * 0.4} 0 C${w * 1.3} ${-h * 0.2} ${-w * 0.4} ${-h * 0.32} ${w * 0.35} ${-h * 0.5} c${w * 0.2} ${-h * 0.05} ${w * 0.1} ${-h * 0.12} ${-w * 0.08} ${-h * 0.1}" stroke="${GOLD}" stroke-width="1" fill="none" opacity=".9"/>`;
        break;
      case 'blossoms':
        for (let i = 0; i < 6; i++) s += blossom((R() - 0.5) * (w - 12), -h * (0.15 + R() * 0.7), 0.7 + R() * 0.4, i % 2 ? acc : light(acc, 0.35));
        break;
      case 'moon':
        s += `<g transform="translate(0,${-h * 0.62})"><circle r="${w * 0.3}" fill="${GOLD}"/><circle cx="${w * 0.12}" cy="${-w * 0.06}" r="${w * 0.26}" fill="${mix(d.c1, d.c2, 0.6)}"/></g>`;
        [[-0.18, 0.78], [0.22, 0.48], [-0.2, 0.38], [0.15, 0.25], [-0.1, 0.14], [0.25, 0.7]].forEach(([fx, fy], i) => {
          s += `<path transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) scale(${i % 2 ? 0.45 : 0.6})" d="M0 -6 C.6 -1.4 1.4 -.6 6 0 C1.4 .6 .6 1.4 0 6 C-.6 1.4 -1.4 .6 -6 0 C-1.4 -.6 -.6 -1.4 0 -6Z" fill="${i % 3 ? '#fff8e1' : GOLD}"/>`;
        });
        break;
      case 'butterflies':
        s += butterfly(-w * 0.1, -h * 0.66, 0.55, acc, -15) + butterfly(w * 0.15, -h * 0.42, 0.45, '#f2b6d0', 20) + butterfly(-w * 0.12, -h * 0.22, 0.5, '#a9cdf0', -5);
        break;
      case 'pressed':
        s += leaf(-w * 0.25, -h * 0.4, -60, 0.8) + blossom(-w * 0.15, -h * 0.5, 1, acc) + blossom(w * 0.15, -h * 0.35, 0.8, '#f7d27a') + leaf(w * 0.1, -h * 0.25, 30, 0.7);
        break;
      case 'wings':
        s += `<g transform="translate(0,${-h * 0.45}) scale(${w / 74})" fill="none" stroke="${GOLD}" stroke-width="1.4"><path d="M-3 0 C-12 -16 -30 -16 -30 -4 C-24 -6 -20 -2 -22 2 C-16 0 -12 4 -14 8 C-8 4 -5 4 -3 0Z" fill="#fff6e3"/><path d="M3 0 C12 -16 30 -16 30 -4 C24 -6 20 -2 22 2 C16 0 12 4 14 8 C8 4 5 4 3 0Z" fill="#fff6e3"/><path d="${heartPath}" transform="scale(.35) translate(0,10)" fill="${GOLD}" stroke="none"/></g>`;
        break;
      case 'leaves':
        s += leaf(-w * 0.3, -h * 0.55, -30, 1.1, '#d9733c') + leaf(w * 0.05, -h * 0.4, 20, 1, '#e8a04a') + leaf(-w * 0.2, -h * 0.35, 160, 0.9, '#b5532a') + `<circle cx="${w * 0.2}" cy="${-h * 0.6}" r="3" fill="#b5532a"/><circle cx="${w * 0.26}" cy="${-h * 0.57}" r="2.6" fill="#a8472a"/>`;
        break;
      case 'branch':
        s += `<path d="M${-w * 0.4} 0 C${w * 0.9} ${-h * 0.2} ${-w * 0.9} ${-h * 0.45} ${w * 0.3} ${-h * 0.75} M${-w * 0.2} ${-h * 0.32} l${-w * 0.5} ${-h * 0.06}" stroke="#7d5a4a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
        [[0.25, 0.12], [-0.3, 0.3], [-0.65, 0.38], [0.2, 0.5], [-0.1, 0.62], [0.3, 0.74]].forEach(([fx, fy], i) => { s += blossom(fx * w, -h * fy, 0.8, i % 2 ? '#f7b6c9' : acc, '#fff1f4'); });
        break;
      case 'fairywings':
        [-1, 1].forEach((sd) => {
          s += `<g transform="translate(${sd * (w / 2 - 2)},${-h * 0.56}) scale(${sd},1)" opacity=".85"><path d="M0 0 C10 -26 34 -30 30 -10 C28 0 12 4 0 2Z" fill="#ffffff" fill-opacity=".55" stroke="${acc}" stroke-width=".9"/><path d="M0 3 C12 6 24 14 18 24 C12 30 4 18 0 6Z" fill="#ffffff" fill-opacity=".45" stroke="${acc}" stroke-width=".8"/><path d="M2 0 C10 -10 20 -18 26 -14 M2 4 C8 10 12 16 14 20" stroke="${acc}" stroke-width=".5" fill="none"/></g>`;
        });
        break;
      case 'glow':
        for (let i = 0; i < 9; i++) s += `<circle class="twinkle" style="animation-delay:${(R() * 2).toFixed(2)}s" cx="${((R() - 0.5) * (w + 30)).toFixed(1)}" cy="${(-h * (0.1 + R() * 0.85)).toFixed(1)}" r="${(1 + R() * 1.4).toFixed(1)}" fill="#fff6b0" stroke="#ffe066" stroke-opacity=".5" stroke-width="2.5"/>`;
        break;
      case 'mushrooms':
        [[-0.28, 0.1, 1], [0.05, 0.07, 1.3], [0.3, 0.12, 0.85]].forEach(([fx, fy, sc]) => {
          s += `<g transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) scale(${(sc * w / 74).toFixed(2)})"><rect x="-2.5" y="-6" width="5" height="10" rx="2" fill="#fff6e8"/><path d="M-10 -5 C-10 -15 10 -15 10 -5 Z" fill="#e5484d"/><circle cx="-4" cy="-10" r="1.5" fill="#fff"/><circle cx="3" cy="-11" r="1.8" fill="#fff"/><circle cx="6" cy="-7" r="1" fill="#fff"/></g>`;
        });
        s += leaf(-w * 0.45, -h * 0.05, -20, 0.8, '#8fbf7f') + leaf(w * 0.2, -h * 0.03, 200, 0.7, '#8fbf7f');
        break;
      case 'scales': {
        for (let row = 0, y = -h * 0.12; y > -h * 0.9; y -= 6, row++) {
          for (let x = -w / 2 + (row % 2 ? 4 : 0); x < w / 2 + 4; x += 8) s += `<path d="M${(x - 4).toFixed(1)} ${y.toFixed(1)} a4 4 0 0 0 8 0" fill="${(row + Math.round(x)) % 3 ? light(acc, 0.35) : acc}" fill-opacity=".55" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>`;
        }
        break;
      }
      case 'tailfin':
        s += `<g transform="translate(0,${-h * 0.2}) scale(${w / 30})"><path d="M0 0 C-4 -6 -14 -4 -16 4 C-10 2 -5 4 0 8 C5 4 10 2 16 4 C14 -4 4 -6 0 0Z" fill="${acc}" fill-opacity=".85"/><path d="M0 1 L-11 2 M0 1 L11 2 M0 1 L-6 5 M0 1 L6 5" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/></g>`;
        break;
      case 'shells':
        [[-0.2, 0.62, 1], [0.22, 0.35, 0.8], [-0.12, 0.2, 0.7]].forEach(([fx, fy, sc]) => {
          s += `<g transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) scale(${(sc * Math.max(0.6, w / 50)).toFixed(2)})"><path d="M0 6 L-9 -3 C-6 -10 6 -10 9 -3 Z" fill="#fde2e4" stroke="#e8a9b4" stroke-width=".7"/><path d="M0 6 L-5 -7 M0 6 L0 -8 M0 6 L5 -7 M0 6 L-8 -4 M0 6 L8 -4" stroke="#e8a9b4" stroke-width=".6"/><rect x="-3" y="5" width="6" height="2.5" rx="1" fill="#e8a9b4"/></g>`;
        });
        break;
      case 'carvedrose': case 'carveddamask': case 'carvedmoon': {
        const base = mix(d.c1, d.c2, 0.5);
        const carve = (path) => `<path d="${path}" fill="none" stroke="${dark(base, 0.28)}" stroke-width="1.6" stroke-linecap="round" transform="translate(.7,.7)"/><path d="${path}" fill="none" stroke="${light(base, 0.55)}" stroke-width="1.2" stroke-linecap="round"/>`;
        const sc = w / 74;
        if (k === 'carvedrose') s += `<g transform="translate(0,${-h * 0.5}) scale(${sc})">${carve('M0 -2 C-4 -6 4 -10 7 -4 C10 2 2 8 -4 5 C-10 2 -8 -10 0 -12 C8 -14 16 -4 12 6 C8 14 -8 14 -13 6 M-13 6 C-20 14 -22 26 -14 32 M12 6 C20 12 22 24 14 32 M-2 14 L-2 40 M-2 26 C-12 22 -18 26 -20 30 C-12 32 -6 30 -2 26 M-2 32 C8 28 14 30 16 34 C8 36 2 34 -2 32')}</g>`;
        else if (k === 'carveddamask') for (let i = 0; i < 3; i++) s += `<g transform="translate(0,${-h * (0.22 + i * 0.26)}) scale(${sc * 1.6})">${carve('M0 -10 C-6 -6 -6 0 0 4 C6 0 6 -6 0 -10 M0 4 L0 10 M-8 2 C-12 -2 -10 -8 -5 -7 M8 2 C12 -2 10 -8 5 -7 M-6 10 L6 10')}</g>`;
        else s += `<g transform="translate(0,${-h * 0.55}) scale(${sc})">${carve('M8 -18 A20 20 0 1 0 8 18 A15 15 0 1 1 8 -18 M20 -26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M24 10 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z M-22 30 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z')}</g>`;
        break;
      }
      case 'honeycomb': {
        const hx = (cx0, cy0, r) => Array.from({ length: 6 }, (_, q) => `${(cx0 + r * Math.cos((Math.PI / 3) * q)).toFixed(1)},${(cy0 + r * Math.sin((Math.PI / 3) * q)).toFixed(1)}`).join(' ');
        for (let row = 0, y = -h * 0.08; y > -h * 0.95; y -= 7, row++) for (let x = -w / 2 + (row % 2 ? 6 : 0); x < w / 2 + 6; x += 12) s += `<polygon points="${hx(x, y, 4.2)}" fill="none" stroke="${dark(d.c2, 0.18)}" stroke-opacity=".55" stroke-width="1"/>`;
        s += `<g transform="translate(${w * 0.18},${-h * 0.6}) scale(${Math.max(0.7, w / 74)})"><ellipse cx="-3" cy="-5" rx="4" ry="3" fill="#fff" fill-opacity=".8" transform="rotate(-20)"/><ellipse cx="3" cy="-5" rx="4" ry="3" fill="#fff" fill-opacity=".8" transform="rotate(20)"/><ellipse rx="5.5" ry="3.8" fill="#f6c343"/><path d="M-1.5 -3.5 v7 M1.8 -3.5 v7" stroke="#3a2a1a" stroke-width="1.3"/><circle cx="5.5" r="2" fill="#3a2a1a"/></g>`;
        break;
      }
      case 'crystals':
        [[-0.32, 0.02, 1.2, -12], [-0.05, 0.02, 1.6, 4], [0.28, 0.02, 1.1, 16], [0.12, 0.55, 0.8, 8]].forEach(([fx, fy, sc, rot]) => {
          s += `<g transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) rotate(${rot}) scale(${(sc * w / 74).toFixed(2)})"><polygon points="-5,0 -5,-18 0,-26 5,-18 5,0" fill="${light(acc, 0.35)}" fill-opacity=".9"/><polygon points="0,-26 5,-18 5,0 0,0" fill="${acc}" fill-opacity=".7"/><path d="M-3 -16 L-3 -4" stroke="#fff" stroke-opacity=".7" stroke-width="1"/></g>`;
        });
        break;
      case 'feathers':
        [[-0.15, 0.5, -25], [0.18, 0.32, 20]].forEach(([fx, fy, rot]) => {
          s += `<g transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) rotate(${rot}) scale(${Math.max(0.6, w / 40).toFixed(2)})"><path d="M0 14 C-6 4 -6 -8 0 -16 C6 -8 6 4 0 14Z" fill="#ffffff" stroke="#e3dcea" stroke-width=".6"/><path d="M0 16 L0 -14" stroke="#cfc6d8" stroke-width=".7"/><path d="M0 -6 l-4 -3 M0 0 l-4 -3 M0 6 l-3 -3 M0 -6 l4 -3 M0 0 l4 -3 M0 6 l3 -3" stroke="#e3dcea" stroke-width=".5"/></g>`;
        });
        break;
      case 'daisies':
        [[-0.22, 0.6, 1], [0.2, 0.45, 0.8], [-0.1, 0.28, 0.9], [0.25, 0.15, 0.7]].forEach(([fx, fy, sc]) => {
          let pet = '';
          for (let q = 0; q < 10; q++) pet += `<ellipse cy="-5" rx="1.6" ry="4" fill="#ffffff" transform="rotate(${q * 36})"/>`;
          s += `<g transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) scale(${(sc * Math.max(0.6, w / 60)).toFixed(2)})">${pet}<circle r="2.6" fill="#f6c343"/></g>`;
        });
        break;
      case 'nebula':
        s += `<ellipse cx="${-w * 0.1}" cy="${-h * 0.6}" rx="${w * 0.5}" ry="${h * 0.12}" fill="#f29de0" opacity=".35"/><ellipse cx="${w * 0.15}" cy="${-h * 0.35}" rx="${w * 0.45}" ry="${h * 0.1}" fill="#7fd1ff" opacity=".3"/>`;
        for (let i = 0; i < 14; i++) s += `<circle cx="${((R() - 0.5) * w).toFixed(1)}" cy="${(-h * (0.05 + R() * 0.9)).toFixed(1)}" r="${(0.4 + R() * 0.9).toFixed(1)}" fill="#fff"/>`;
        break;
      case 'clouds':
        [[-0.15, 0.65, 1], [0.2, 0.42, 0.8], [-0.1, 0.2, 0.9]].forEach(([fx, fy, sc]) => {
          s += `<g transform="translate(${(fx * w).toFixed(1)},${(-h * fy).toFixed(1)}) scale(${(sc * Math.max(0.55, w / 60)).toFixed(2)})" fill="#ffffff"><circle cx="-6" r="5"/><circle cx="0" cy="-3" r="6.5"/><circle cx="7" r="5"/><rect x="-11" y="0" width="23" height="5" rx="2.5"/></g>`;
        });
        break;
      default: break;
    }
  });
  return s;
}

function holderMarkup(d, w, id) {
  const type = d.holder || 'glass';
  const hc = d.hc || '#f3d6dd';
  const g = (c) => `<linearGradient id="${id}hg${c.slice(1)}" x1="0" x2="1"><stop offset="0" stop-color="${dark(c, 0.14)}"/><stop offset=".3" stop-color="${light(c, 0.35)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.18)}"/></linearGradient>`;
  const f = (c) => `url(#${id}hg${c.slice(1)})`;
  if (type === 'ornate') {
    const c = hc, cl = light(c, 0.35);
    const scrolls = [-1, 1].map((s) => `<path d="M${s * 8} 20 C${s * 30} 12 ${s * 40} 34 ${s * 26} 38 C${s * 17} 40 ${s * 15} 30 ${s * 22} 29" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${s * 9} 19 C${s * 29} 11 ${s * 39} 33 ${s * 26} 37" stroke="${cl}" stroke-width="1.4" fill="none"/>`).join('');
    let flowers = '';
    if (d.holderFlowers) {
      flowers = `<path d="M30 138 C40 120 44 110 40 96 M-30 140 C-38 128 -42 118 -36 108" stroke="#c9a46a" stroke-width="1" fill="none"/>`
        + leaf(34, 126, -40, 1.1) + leaf(20, 130, 200, 0.9, '#b3cfa3') + leaf(-34, 132, 210, 0.9) + rose(34, 130, 1.5, '#f2a5ad') + rose(-30, 136, 0.9, '#e88a9a')
        + blossom(44, 108, 0.7, '#f5b8c6') + blossom(-38, 112, 0.6, '#d9b0e0') + blossom(14, 140, 0.6, '#f5b8c6');
    }
    return {
      h: 150, hw: 120,
      defs: g(c) + g(GOLD),
      back: `<g><path d="M-46 134 C-46 126 -30 121 0 121 C30 121 46 126 46 134 L46 140 C46 145 30 148 0 148 C-30 148 -46 145 -46 140Z" fill="${f(c)}"/><ellipse cy="127" rx="38" ry="6" fill="${cl}"/><path d="M-44 137 C-30 142 30 142 44 137" stroke="${GOLD}" stroke-width="1.4" fill="none"/>
        <path d="M-9 85 C-8 100 -14 112 -20 122 L20 122 C14 112 8 100 9 85Z" fill="${f(c)}"/>
        <ellipse cy="82" rx="13" ry="5" fill="${f(GOLD)}"/>
        <path d="M-7 30 C-9 50 -5 62 -6 80 L6 80 C5 62 9 50 7 30Z" fill="${f(c)}"/>
        <ellipse cy="28" rx="11" ry="5" fill="${dark(c, 0.1)}"/>${scrolls}
        <path d="M${-w / 2 - 9} 3 C${-w / 2 - 6} 16 -9 18 -7 24 L7 24 C9 18 ${w / 2 + 6} 16 ${w / 2 + 9} 3 Z" fill="${f(c)}"/></g>${flowers}`,
      front: `<path d="M${-w / 2 - 10} 3 A${w / 2 + 10} 4.5 0 0 0 ${w / 2 + 10} 3" fill="${cl}" stroke="${GOLD}" stroke-width="1.2"/>`,
    };
  }
  if (type === 'brass') {
    const rx = w / 2 + 30;
    return {
      h: 22, hw: rx * 2 + 24, defs: g(GOLD),
      back: `<ellipse cy="12" rx="${rx}" ry="9" fill="${dark(GOLD, 0.25)}"/><ellipse cy="9" rx="${rx}" ry="8" fill="${f(GOLD)}"/><ellipse cy="8" rx="${rx - 8}" ry="5.5" fill="${light(GOLD, 0.3)}"/><circle cx="${rx + 2}" cy="6" r="7" fill="none" stroke="${GOLD}" stroke-width="3"/>`,
      front: `<rect x="${-w / 2 - 3}" y="-7" width="${w + 6}" height="12" rx="3" fill="${f(GOLD)}"/><rect x="${-w / 2 - 3}" y="-7" width="${w + 6}" height="2" rx="1" fill="#fff" opacity=".35"/>`,
    };
  }
  if (type === 'wood') {
    const rx = w / 2 + 24;
    return {
      h: 18, hw: rx * 2, defs: '',
      back: `<ellipse cy="10" rx="${rx}" ry="9" fill="#8d5f43"/><ellipse cy="7" rx="${rx}" ry="8" fill="#b3805c"/><ellipse cy="6" rx="${rx - 6}" ry="5.5" fill="#c89773"/><path d="M${-rx + 14} 6 q${rx * 0.5} -3 ${rx} 0 M${-rx + 22} 8 q${rx * 0.4} 2 ${rx * 0.8} 0" stroke="#a87553" stroke-width=".8" fill="none"/>`,
      front: '',
    };
  }
  if (type === 'ceramic') {
    const rx = w / 2 + 22;
    let dots = '';
    for (let a = 0.15; a < Math.PI - 0.1; a += 0.32) dots += `<circle cx="${(Math.cos(a) * (rx - 4)).toFixed(1)}" cy="${(7 + Math.sin(a) * 6).toFixed(1)}" r="1.4" fill="${d.accent || '#e7a8b8'}" opacity=".7"/>`;
    return {
      h: 16, hw: rx * 2, defs: '',
      back: `<ellipse cy="9" rx="${rx}" ry="8" fill="${dark(hc, 0.12)}"/><ellipse cy="7" rx="${rx}" ry="8" fill="${hc}"/><ellipse cy="6" rx="${rx - 9}" ry="4.5" fill="${dark(hc, 0.04)}"/>${dots}`,
      front: '',
    };
  }
  const rx = w / 2 + 20;
  return {
    h: 14, hw: rx * 2, defs: '',
    back: `<ellipse cy="8" rx="${rx}" ry="7" fill="#ffffff" opacity=".55" stroke="#ffffff" stroke-width="1.5"/><ellipse cy="6" rx="${rx - 7}" ry="4" fill="#ffffff" opacity=".5"/><path d="M${-rx + 6} 9 q${rx * 0.4} 5 ${rx * 0.9} 3" stroke="#fff" stroke-width="1.6" fill="none"/>`,
    front: '',
  };
}

function sparkles(w, h, R, acc) {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    s += sparkle(side * (w / 2 + 16 + R() * 26), -h * (0.1 + R() * 0.95), 0.45 + R() * 0.5, i % 3 ? acc : GOLD, R() * 2.5);
  }
  return s;
}

function bodyMarkup(d, shape, w, h, r, opts, id, R) {
  const bodyH = Math.max(h * r, 4);
  const top = -bodyH;
  const melt = 1 - r;
  const drip = d.drip || light(d.c1, 0.4);
  const ry = Math.max(2.5, w * 0.15);
  const P = id + 'p';
  let defs = `<linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#7a4a3a" stop-opacity=".16"/><stop offset=".22" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7a4a3a" stop-opacity=".2"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd58a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}c"><rect x="-400" y="${top + ry * 0.6}" width="800" height="${bodyH + 400}"/></clipPath>`;
  let fill;
  if (d.pattern) { defs += patternDefs(d, P, h); fill = `url(#${P})`; }
  else { defs += `<linearGradient id="${P}" gradientUnits="userSpaceOnUse" x1="0" y1="${-h}" x2="0" y2="0"><stop offset="0" stop-color="${d.c1}"/><stop offset="1" stop-color="${d.c2 || d.c1}"/></linearGradient>`; fill = `url(#${P})`; }
  if (shape === 'spiral') defs += `<pattern id="${id}sp" patternUnits="userSpaceOnUse" width="18" height="18" patternTransform="rotate(32)"><rect width="8" height="18" fill="${d.c3 || '#f7b9cc'}"/><rect x="8" width="1.2" height="18" fill="#fff" opacity=".6"/></pattern>`;

  const x0 = -w / 2;
  let body = `<ellipse cy="1" rx="${(w / 2 + melt * w * 0.45 + 3).toFixed(1)}" ry="${(3 + melt * 3).toFixed(1)}" fill="${drip}"/>`;
  body += `<path d="M${x0} ${top} L${x0} -3 Q${x0} 0 ${x0 + 3} 0 L${-x0 - 3} 0 Q${-x0} 0 ${-x0} -3 L${-x0} ${top} Z" fill="${fill}"/>`;
  if (shape === 'spiral') body += `<rect x="${x0}" y="${top}" width="${w}" height="${bodyH}" fill="url(#${id}sp)" opacity=".9"/>`;
  body += `<g clip-path="url(#${id}c)">${decorMarkup(d, w, h, R)}</g>`;
  body += `<rect x="${x0}" y="${top}" width="${w}" height="${bodyH}" fill="url(#${id}s)"/>`;
  if (opts.lit) body += `<rect x="${x0}" y="${top}" width="${w}" height="${Math.min(bodyH, 46)}" fill="url(#${id}w)"/>`;
  const n = shape === 'pillar' ? 7 : 3;
  for (let i = 0; i < n; i++) {
    const dw = shape === 'pillar' ? 6 + R() * 5 : 3.4 + R() * 1.8;
    const x = i === 0 ? x0 + dw / 2 + 0.3 : i === 1 ? -x0 - dw / 2 - 0.3 : x0 + dw + R() * (w - dw * 2);
    const len = Math.min(bodyH - 3, 4 + R() * 7 + melt * h * (0.08 + R() * 0.32));
    if (len > 2) body += `<rect x="${(x - dw / 2).toFixed(1)}" y="${top}" width="${dw.toFixed(1)}" height="${len.toFixed(1)}" rx="${(dw / 2).toFixed(1)}" fill="${drip}"/><circle cx="${x.toFixed(1)}" cy="${(top + len - dw * 0.3).toFixed(1)}" r="${(dw * 0.62).toFixed(1)}" fill="${drip}"/><rect x="${(x - dw / 4).toFixed(1)}" y="${top + 2}" width="1" height="${Math.max(0, len - 4).toFixed(1)}" rx=".5" fill="#fff" opacity=".6"/>`;
  }
  body += `<ellipse cy="${top}" rx="${w / 2 + 0.6}" ry="${ry}" fill="${drip}"/><ellipse cy="${top + 0.6}" rx="${w / 2 - 3}" ry="${ry * 0.62}" fill="${opts.lit ? mix(drip, '#ffd27a', 0.35) : dark(drip, 0.04)}"/>`;
  return { defs, body, top };
}

/** Candle with its base at (0,0). rem = fraction of wax remaining. opts: lit, blue, agitated, smoke, bare (no holder, for cakes), sparkles */
export function candleGroup(d, kind, rem, opts = {}) {
  d = modeDesign(d);
  const id = uid();
  const R = rng(d.id + kind);
  const r = Math.max(0, Math.min(1, rem));
  let shape = d.shape || (d.pattern === 'spiral' ? 'taper' : 'taper');
  if (opts.bare && (shape === 'jar' || shape === 'teacup')) shape = 'pillar';
  const S = shape === 'pstudio' ? pstudioSize(d) : d.art && ART[d.art] ? artSize(d) : SHAPES[shape];
  const w = S.w;
  const h = FIGURES[shape] || shape === 'painted' || shape === 'pstudio' ? S.h : S.h * (KMUL[kind] || 1);
  const holder = opts.bare || FIGURES[shape] || shape === 'painted' || shape === 'pstudio' || shape === 'pstudio' || shape === 'jar' || shape === 'teacup' ? null : holderMarkup(d, w, id);
  let defs = holder ? holder.defs : '';
  let out = holder ? holder.back : '';
  let wickBase, flameDrawnEarly = false;
  let front = '';

  if (shape === 'jar') {
    const L = 10 + (h - 24) * r;
    const wt = -L;
    defs += `<linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d.c1}"/><stop offset="1" stop-color="${d.c2}"/></linearGradient><linearGradient id="${id}gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".18" stop-color="#fff" stop-opacity=".15"/><stop offset=".8" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></linearGradient>`;
    out += `<ellipse cy="6" rx="${w / 2 + 14}" ry="7" fill="#c89773"/><ellipse cy="4" rx="${w / 2 + 14}" ry="6" fill="#d9ab86"/>`;
    out += `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h + 2}" rx="16" fill="#fdf6ee" opacity=".55"/>`;
    out += `<rect x="${-w / 2 + 5}" y="${wt}" width="${w - 10}" height="${L - 3}" rx="10" fill="url(#${id}p)"/><ellipse cy="${wt}" rx="${w / 2 - 5}" ry="6" fill="${opts.lit ? mix(d.drip, '#ffd27a', 0.3) : d.drip}"/>`;
    wickBase = wt;
    front = `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h + 2}" rx="16" fill="url(#${id}gl)" stroke="#fff" stroke-opacity=".95" stroke-width="2"/>
      <rect x="${-w / 2 + 8}" y="${-h + 12}" width="5" height="${h - 30}" rx="2.5" fill="#fff" opacity=".7"/>
      <ellipse cy="${-h}" rx="${w / 2 - 1}" ry="5" fill="none" stroke="#fff" stroke-width="2"/>
      <g transform="translate(0,${-h * 0.42})"><rect x="-22" y="-14" width="44" height="30" rx="6" fill="#fffaf2" stroke="#ead9c4" stroke-width=".8"/>${leaf(-14, 6, -50, 0.7)}${blossom(-8, -2, 0.9, d.accent)}${blossom(9, 4, 0.7, '#f7d27a')}${leaf(6, 8, 20, 0.6)}</g>`;
  } else if (shape === 'pstudio') {
    const p = studioPainted(d, r, id, opts);
    out += p.out;
    wickBase = p.tip + 9;
    var paintedX = p.x;
  } else if (shape === 'painted' && ART[d.art]) {
    const p = paintedCandle(d, r, id, opts);
    out += p.out;
    wickBase = p.tip + 9;
    var paintedX = p.x;
  } else if (VESSELS[shape]) {
    const v = VESSELS[shape](d, w, S.h, r, opts, id);
    defs += v.defs;
    out += v.back;
    front = v.front;
    wickBase = v.wick;
    flameDrawnEarly = true;
  } else if (FIGURES[shape]) {
    const m = moldedCandle(d, shape, w, S.h, r, opts, id);
    defs += m.defs;
    out += m.out;
    wickBase = m.wickBase;
  } else if (shape === 'teacup') {
    const cw = w, ch = h;
    const hc = d.hc || '#ffffff';
    const wy = -ch + 6 + (1 - r) * (ch - 18);
    defs += `<clipPath id="${id}cc"><ellipse cy="${-ch}" rx="${cw / 2 - 2}" ry="8"/><rect x="${-cw / 2}" y="${-ch}" width="${cw}" height="${ch}"/></clipPath><linearGradient id="${id}cup" x1="0" x2="1"><stop offset="0" stop-color="${dark(hc, 0.1)}"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="${hc}"/><stop offset="1" stop-color="${dark(hc, 0.14)}"/></linearGradient>`;
    out += `<ellipse cy="3" rx="${cw / 2 + 24}" ry="10" fill="${dark(hc, 0.1)}"/><ellipse cy="1" rx="${cw / 2 + 24}" ry="9.5" fill="${hc}"/><ellipse cy="1" rx="${cw / 2 + 16}" ry="6" fill="none" stroke="${d.accent}" stroke-width="1.2" opacity=".7"/>`;
    out += `<path d="M${cw / 2 - 4} ${-ch * 0.75} C${cw / 2 + 22} ${-ch * 0.85} ${cw / 2 + 22} ${-ch * 0.15} ${cw / 2 - 10} ${-ch * 0.2}" stroke="${hc}" stroke-width="6" fill="none"/><path d="M${cw / 2 - 4} ${-ch * 0.75} C${cw / 2 + 22} ${-ch * 0.85} ${cw / 2 + 22} ${-ch * 0.15} ${cw / 2 - 10} ${-ch * 0.2}" stroke="${GOLD}" stroke-width="1" fill="none"/>`;
    out += `<ellipse cy="${-ch}" rx="${cw / 2}" ry="9" fill="${dark(hc, 0.08)}"/><g clip-path="url(#${id}cc)"><ellipse cy="${wy}" rx="${cw / 2 - 3}" ry="8" fill="${opts.lit ? mix(d.drip, '#ffd27a', 0.3) : d.drip}"/><rect x="${-cw / 2}" y="${wy}" width="${cw}" height="${ch}" fill="${d.c2}"/></g>`;
    wickBase = wy;
    let flowers = '';
    for (let i = 0; i < 5; i++) flowers += blossom(-cw * 0.32 + i * cw * 0.16, -ch * (0.45 + (i % 2) * 0.12), 0.75, i % 2 ? '#f6b8c8' : d.accent);
    front = `<path d="M${-cw / 2} ${-ch} C${-cw / 2} ${-ch * 0.25} ${-cw * 0.25} 0 0 0 C${cw * 0.25} 0 ${cw / 2} ${-ch * 0.25} ${cw / 2} ${-ch} A${cw / 2} 9 0 0 1 ${-cw / 2} ${-ch} Z" fill="url(#${id}cup)"/>${flowers}<path d="M${cw / 2} ${-ch} A${cw / 2} 9 0 0 1 ${-cw / 2} ${-ch}" stroke="${GOLD}" stroke-width="1.6" fill="none"/>`;
    flameDrawnEarly = true;
  } else {
    const b = bodyMarkup(d, shape, w, h, r, opts, id, R);
    defs += b.defs;
    out += b.body;
    wickBase = b.top;
  }

  let wickTop = wickBase - 9;
  let topper = '';
  const figK = d.topper && FIGS[d.topper] ? 1.5 : 1;
  if (d.topper && (shape === 'pillar' || shape === 'taper' || shape === 'spiral')) { topper = FIGS[d.topper] ? `<g transform="translate(0,${wickBase}) scale(${figK})">${FIGS[d.topper](0)}</g>` : cherubMarkup(wickBase); wickTop = wickBase - 40 * figK; }
  const wick = topper ? `<path d="M0 ${wickBase - 33 * figK} q1.5 -4 0 -${8 * figK}" stroke="#3a2a22" stroke-width="1.6" fill="none"/>` : `<path d="M0 ${wickBase} q1.6 -4.5 0 -9" stroke="#3a2a22" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  const fl = opts.lit ? `<g transform="translate(${shape === 'painted' || shape === 'pstudio' ? (paintedX || 0).toFixed(1) : 0},${wickTop + 1})">${(ART_MODE === 'painted' ? paintedFlameMarkup : flameMarkup)(opts.blue, opts.agitated, id)}</g>` : '';
  const smoke = opts.smoke ? `<path class="smoke" d="M0 ${wickTop} c-6 -10 6 -16 0 -26 c-6 -10 6 -16 0 -26" stroke="#cfc6cc" stroke-width="2" fill="none" opacity=".7"/>` : '';
  const sp = opts.sparkles ? sparkles(w, h + (holder ? 0 : 0), R, d.accent || '#e7a8b8') : '';
  const fr = holder ? holder.front : '';
  const body = shape === 'painted' || shape === 'pstudio' ? `${out}${fl}${smoke}` : flameDrawnEarly ? `${out}${topper}${wick}${fl}${front}${smoke}` : `${out}${fr}${front}${topper}${wick}${fl}${smoke}`;
  return `<defs>${defs}</defs><g class="candle">${sp}${body}</g>`;
}

export function candleMetrics(d, kind, bare = false) {
  d = modeDesign(d);
  let shape = d.shape || 'taper';
  if (bare && (shape === 'jar' || shape === 'teacup')) shape = 'pillar';
  const S = shape === 'pstudio' ? pstudioSize(d) : d.art && ART[d.art] ? artSize(d) : SHAPES[shape];
  const h = FIGURES[shape] || shape === 'painted' || shape === 'pstudio' ? S.h : S.h * (KMUL[kind] || 1);
  const hold = bare || FIGURES[shape] || shape === 'painted' || shape === 'jar' || shape === 'teacup' ? { h: shape === 'teacup' || shape === 'jar' ? 12 : 0, hw: S.w + 60 } : ({ ornate: { h: 150, hw: 120 }, brass: { h: 22, hw: S.w + 84 }, wood: { h: 18, hw: S.w + 48 }, ceramic: { h: 16, hw: S.w + 44 } }[d.holder] || { h: 14, hw: S.w + 40 });
  return { w: S.w, h, holderH: hold.h, holderW: hold.hw, extraTop: d.topper ? (FIGS[d.topper] ? 60 : 40) : 0 };
}

export function candleSVG(d, kind, rem, opts = {}) {
  const m = candleMetrics(d, kind, opts.bare);
  const W = Math.max(m.w + 120, m.holderW + 30);
  const top = m.h + 78 + m.extraTop;
  const H = top + m.holderH + 6;
  return `<svg class="${opts.cls || 'candle-svg'}" viewBox="${-W / 2} ${-top} ${W} ${H}" preserveAspectRatio="xMidYMax meet">${candleGroup(d, kind, rem, opts)}</svg>`;
}

function onFront(cx, w, ry, x) {
  const t = (x - cx) / (w / 2);
  return ry * Math.sqrt(Math.max(0, 1 - t * t));
}

function toppersMarkup(toppers, tiers, R) {
  let s = '';
  const cx = 200;
  toppers.forEach((t) => {
    if (t === 'sprinkles') {
      const cols = ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#c77dff', '#ffffff'];
      tiers.forEach((tr) => {
        for (let i = 0; i < 28; i++) {
          const x = cx - tr.w / 2 + 8 + R() * (tr.w - 16);
          const y = tr.top + onFront(cx, tr.w, tr.ry, x) + 6 + R() * (tr.h - 16);
          s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="6" height="2" rx="1" fill="${cols[i % cols.length]}" transform="rotate(${(R() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        }
        for (let i = 0; i < 16; i++) {
          const a = R() * Math.PI * 2, rr = Math.sqrt(R());
          const x = cx + Math.cos(a) * rr * (tr.w / 2 - 8), y = tr.top + Math.sin(a) * rr * (tr.ry - 3);
          s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5" height="1.8" rx="1" fill="${cols[i % cols.length]}" transform="rotate(${(R() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        }
      });
    }
    if (t === 'pearls') {
      tiers.forEach((tr) => {
        const yb = tr.top + tr.h * 0.5;
        for (let x = cx - tr.w / 2 + 6; x < cx + tr.w / 2 - 4; x += 9) {
          const y = yb + onFront(cx, tr.w, tr.ry, x) + Math.sin((x - cx) / 14) * 5;
          s += `<circle cx="${x}" cy="${y.toFixed(1)}" r="3.4" fill="#fffaf2" stroke="#e8dcc8" stroke-width=".6"/><circle cx="${x - 1}" cy="${(y - 1).toFixed(1)}" r="1" fill="#fff"/>`;
        }
      });
    }
    if (t === 'goldleaf') {
      tiers.forEach((tr) => {
        for (let i = 0; i < 6; i++) {
          const x = cx - tr.w / 2 + 14 + R() * (tr.w - 28);
          const y = tr.top + onFront(cx, tr.w, tr.ry, x) + 10 + R() * (tr.h - 26);
          const pts = Array.from({ length: 6 }, (_, k) => {
            const a = (k / 6) * Math.PI * 2, rr = 4 + R() * 6;
            return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
          }).join(' ');
          s += `<polygon points="${pts}" fill="#e8b84a" opacity=".92"/><polygon points="${pts}" fill="#fff3c4" opacity=".35" transform="translate(-1,-1)"/>`;
        }
      });
    }
    if (t === 'bows') {
      const tr = tiers[0];
      [-0.3, 0, 0.3].forEach((f) => {
        const x = cx + f * tr.w;
        const y = tr.top + onFront(cx, tr.w, tr.ry, x) + tr.h * 0.45;
        s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><path d="M0 0 L-12 -7 L-12 7Z M0 0 L12 -7 L12 7Z" fill="#ff5c8a" stroke="#c2185b" stroke-width="1"/><path d="M-2 2 l-6 12 M2 2 l6 12" stroke="#ff5c8a" stroke-width="3"/><circle r="3.5" fill="#e0245e"/></g>`;
      });
    }
  });
  return s;
}

function topperFront(toppers, top, R) {
  let s = '';
  if (toppers.includes('cherries')) {
    [-0.36, -0.12, 0.12, 0.36].forEach((f) => {
      const x = 200 + f * top.w;
      const y = top.top + onFront(200, top.w, top.ry, x) - 6;
      s += `<path d="M${x} ${y} q4 -10 10 -14" stroke="#4a7c2a" stroke-width="1.4" fill="none"/><circle cx="${x}" cy="${y}" r="6.5" fill="#d90429"/><circle cx="${x - 2}" cy="${y - 2}" r="1.8" fill="#fff" opacity=".7"/>`;
    });
  }
  return s;
}

function figurines(toppers, plateY) {
  let s = '';
  if (toppers.includes('bunny')) s += `<g transform="translate(48,${plateY - 6})"><ellipse cx="-4" cy="-30" rx="3.5" ry="10" fill="#fff" stroke="#f0c8d4"/><ellipse cx="4" cy="-30" rx="3.5" ry="10" fill="#fff" stroke="#f0c8d4"/><ellipse cy="-8" rx="11" ry="10" fill="#fff"/><circle cy="-20" r="8" fill="#fff"/><circle cx="-3" cy="-21" r="1" fill="#333"/><circle cx="3" cy="-21" r="1" fill="#333"/><ellipse cy="-17" rx="1.6" ry="1" fill="#ff8fb3"/></g>`;
  if (toppers.includes('frog')) s += `<g transform="translate(352,${plateY - 6})"><ellipse cy="-8" rx="13" ry="9" fill="#7ccf6b"/><circle cx="-6" cy="-17" r="5" fill="#7ccf6b"/><circle cx="6" cy="-17" r="5" fill="#7ccf6b"/><circle cx="-6" cy="-17" r="2" fill="#222"/><circle cx="6" cy="-17" r="2" fill="#222"/><path d="M-5 -8 q5 4 10 0" stroke="#2f6b25" stroke-width="1.2" fill="none"/><ellipse cx="-8" cy="-6" rx="2" ry="1.2" fill="#ff9eb5"/><ellipse cx="8" cy="-6" rx="2" ry="1.2" fill="#ff9eb5"/></g>`;
  return s;
}

function decoMarkup(design, tr, i, R) {
  const cx = 200;
  let s = '';
  const front = (x) => tr.top + onFront(cx, tr.w, tr.ry, x);
  const spots = (n) => Array.from({ length: n }, (_, k) => {
    const x = cx - tr.w / 2 + ((k + 0.5) / n) * tr.w;
    return [x, front(x) + tr.h * (0.35 + R() * 0.3)];
  });
  switch (design.deco) {
    case 'confetti': {
      const cols = ['#ff4d6d', '#ffd166', '#06d6a0', '#7fd1ff', '#c77dff'];
      for (let k = 0; k < 40; k++) {
        const x = cx - tr.w / 2 + 6 + R() * (tr.w - 12);
        s += `<circle cx="${x.toFixed(1)}" cy="${(front(x) + 10 + R() * (tr.h - 18)).toFixed(1)}" r="${(1.5 + R() * 2).toFixed(1)}" fill="${cols[k % 5]}"/>`;
      }
      break;
    }
    case 'gold':
      spots(7).forEach(([x, y]) => { s += `<path transform="translate(${x.toFixed(1)},${y.toFixed(1)})" d="M0 -7L2 -2 7 0 2 2 0 7 -2 2 -7 0 -2 -2Z" fill="#e8b84a"/>`; });
      break;
    case 'bats':
      if (i === 0) spots(5).forEach(([x, y]) => { s += `<path transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(.9)" d="M0 0 c-4 -6 -10 -6 -16 -2 c4 0 6 2 6 5 c2 -2 4 -2 5 0 c1 -2 3 -3 5 -3 c2 0 4 1 5 3 c1 -2 3 -2 5 0 c0 -3 2 -5 6 -5 c-6 -4 -12 -4 -16 2z" fill="#140a1a"/>`; });
      else spots(4).forEach(([x, y]) => { s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})" fill="#2a1a00"><polygon points="-8,-3 -3,-3 -5.5,-8"/><polygon points="8,-3 3,-3 5.5,-8"/><path d="M-9 3 q9 8 18 0 l-3 1 -2 -2 -2 2 -2 -2 -2 2 -2 -2 -2 2z"/></g>`; });
      break;
    case 'blossoms':
      spots(i === 0 ? 6 : 4).forEach(([x, y]) => {
        let p = '';
        for (let k = 0; k < 5; k++) p += `<ellipse cx="0" cy="-5" rx="3.6" ry="5" fill="#ff9ec0" transform="rotate(${k * 72})"/>`;
        s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">${p}<circle r="2.4" fill="#ffd166"/></g>`;
      });
      break;
    case 'strawberries':
      [-0.38, -0.19, 0, 0.19, 0.38].forEach((f) => {
        const x = cx + f * tr.w, y = front(x) - 4;
        s += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><path d="M0 10 C-10 2 -9 -6 0 -5 C9 -6 10 2 0 10Z" fill="#e63946"/><path d="M-5 -5 l5 -4 l5 4 l-5 -1z" fill="#2d6a4f"/><circle cx="-3" cy="0" r=".7" fill="#ffd166"/><circle cx="2" cy="2" r=".7" fill="#ffd166"/><circle cx="0" cy="-2" r=".7" fill="#ffd166"/></g>`;
      });
      break;
    case 'finals': {
      const y = front(cx) + tr.h * 0.5;
      s += `<text x="${cx}" y="${y + 6}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="#6b4226">you got this</text>`;
      s += `<g transform="translate(${cx - 110},${y + 2})"><rect x="-10" y="-6" width="20" height="18" rx="2" fill="#fff"/><path d="M10 -2 q8 2 0 10" stroke="#fff" stroke-width="3" fill="none"/><rect x="-10" y="-6" width="20" height="5" fill="#6b4226"/></g>`;
      s += `<g transform="translate(${cx + 105},${y + 4})"><rect x="-14" y="2" width="28" height="7" fill="#e63946"/><rect x="-12" y="-5" width="26" height="7" fill="#118ab2"/><rect x="-13" y="-12" width="24" height="7" fill="#ffd166"/></g>`;
      break;
    }
    default: break;
  }
  return s;
}

/** Renders a full cake SVG with candles on the top tier. */
function cakeSVGClassic(design, candles = [], toppers = [], opts = {}) {
  const R = rng(opts.seed || design.id);
  const cx = 200;
  const plateY = 380;
  let y = plateY - 6;
  const tiers = design.tiers.map((t) => {
    const ry = t.w * 0.11;
    const bottom = y;
    const top = y - t.h;
    y = top;
    return { ...t, ry, top, bottom };
  });
  const topTier = tiers[tiers.length - 1];
  const minY = topTier.top - 150;
  const id = uid();

  let out = `<defs><linearGradient id="${id}sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>`;
  out += `<ellipse cx="${cx}" cy="${plateY + 4}" rx="196" ry="30" fill="${dark(design.plate, 0.25)}"/><ellipse cx="${cx}" cy="${plateY}" rx="196" ry="28" fill="${design.plate}"/><ellipse cx="${cx}" cy="${plateY - 2}" rx="170" ry="21" fill="${light(design.plate, 0.25)}"/>`;
  out += figurines(toppers, plateY);

  tiers.forEach((t, i) => {
    const x1 = cx - t.w / 2, x2 = cx + t.w / 2;
    const side = `M${x1} ${t.top} L${x1} ${t.bottom} A${t.w / 2} ${t.ry} 0 0 0 ${x2} ${t.bottom} L${x2} ${t.top} Z`;
    out += `<path d="${side}" fill="${t.c}"/>`;
    out += decoMarkup(design, t, i, R);
    out += `<path d="${side}" fill="url(#${id}sh)"/>`;
    out += `<ellipse cx="${cx}" cy="${t.top}" rx="${t.w / 2}" ry="${t.ry}" fill="${design.drip || light(t.c, 0.2)}"/>`;
    if (design.drip) {
      out += `<ellipse cx="${cx}" cy="${t.top}" rx="${t.w / 2 - 6}" ry="${t.ry - 3}" fill="${light(design.drip, 0.12)}"/>`;
      let d = `M${x1} ${t.top}`;
      for (let x = x1; x <= x2; x += 4) d += ` L${x} ${(t.top + onFront(cx, t.w, t.ry, x) + 4).toFixed(1)}`;
      d += ` L${x2} ${t.top} Z`;
      out += `<path d="${d}" fill="${design.drip}"/>`;
      for (let x = x1 + 8; x < x2 - 4; x += 12 + R() * 10) {
        const fy = t.top + onFront(cx, t.w, t.ry, x);
        const len = 8 + R() * (t.h * 0.45);
        out += `<rect x="${(x - 3.5).toFixed(1)}" y="${fy.toFixed(1)}" width="7" height="${len.toFixed(1)}" rx="3.5" fill="${design.drip}"/><circle cx="${x.toFixed(1)}" cy="${(fy + len - 1).toFixed(1)}" r="4.6" fill="${design.drip}"/>`;
      }
    }
    for (let x = x1 + 5; x <= x2 - 4; x += 10) {
      out += `<circle cx="${x}" cy="${(t.bottom + onFront(cx, t.w, t.ry, x) - 3).toFixed(1)}" r="6" fill="${design.piping}"/><circle cx="${x - 1.5}" cy="${(t.bottom + onFront(cx, t.w, t.ry, x) - 5).toFixed(1)}" r="1.8" fill="#fff" opacity=".5"/>`;
    }
    if (design.lambeth) {
      const n = Math.round(t.w / 50);
      for (let k = 0; k < n; k++) {
        const xa = x1 + (k / n) * t.w, xb = x1 + ((k + 1) / n) * t.w, xm = (xa + xb) / 2;
        const ya = t.top + onFront(cx, t.w, t.ry, xa) + 6, yb = t.top + onFront(cx, t.w, t.ry, xb) + 6;
        const ym = t.top + onFront(cx, t.w, t.ry, xm) + t.h * 0.42;
        out += `<path d="M${xa} ${ya} Q${xm} ${ym + 8} ${xb} ${yb}" stroke="${design.piping2 || '#fff'}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="1 6"/>`;
        out += `<path d="M${xa} ${ya} Q${xm} ${ym - 6} ${xb} ${yb}" stroke="${design.piping}" stroke-width="3" fill="none"/>`;
        out += `<circle cx="${xa}" cy="${ya}" r="5" fill="${design.piping2 || '#fff'}"/>`;
        out += `<circle cx="${xm}" cy="${(ym + 4).toFixed(1)}" r="3.5" fill="${design.piping}"/>`;
      }
    }
    for (let x = x1 + 4; x <= x2 - 3; x += 9) {
      out += `<circle cx="${x}" cy="${(t.top + onFront(cx, t.w, t.ry, x)).toFixed(1)}" r="4.6" fill="${design.piping2 || design.piping}"/>`;
    }
  });

  out += toppersMarkup(toppers, tiers, R);
  out += topperFront(toppers, topTier, R);

  const n = candles.length;
  const scaleFor = () => 0.4;
  const place = (list, rowY, spread) => list.forEach((c, k) => {
    const x = cx + (list.length === 1 ? 0 : (k / (list.length - 1) - 0.5) * spread);
    const cd = opts.getDesign(c.design);
    const rem = c.melted ? Math.max(0.12, c.remaining ?? 0.5) : 1;
    out += `<g transform="translate(${x.toFixed(1)},${rowY.toFixed(1)}) scale(${scaleFor(c.kind)})"><title>${c.subject || ''} · ${c.minutes} min${c.melted ? ' (blown out early)' : ''}</title>${candleGroup(cd, c.kind, rem, { bare: true, lit: !c.melted && opts.lit !== false, blue: c.blue })}</g>`;
  });
  const spread = topTier.w * 0.72;
  if (n <= 4) place(candles, topTier.top + 2, spread * Math.min(1, n / 4 + 0.2));
  else {
    const back = candles.slice(0, Math.ceil(n / 2));
    const front = candles.slice(Math.ceil(n / 2));
    place(back, topTier.top - topTier.ry * 0.45, spread * 0.85);
    place(front, topTier.top + topTier.ry * 0.5, spread);
  }

  return `<svg class="${opts.cls || 'cake-svg'}" viewBox="0 ${minY} 400 ${plateY + 40 - minY}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

/** Procedural wax sculpture; growth 0..1 */
export function sculptureSVG(s, growth = 1) {
  const R = rng(s.seed);
  const cols = [s.c1, s.drip, s.c2 || s.c1];
  let out = `<ellipse cx="60" cy="108" rx="${(20 + growth * 22).toFixed(1)}" ry="${(4 + growth * 3).toFixed(1)}" fill="${s.drip}" opacity=".9"/>`;
  const lumps = 9 + Math.floor(R() * 5);
  let y = 104, x = 60, size = 22;
  for (let i = 0; i < lumps; i++) {
    const vis = Math.max(0, Math.min(1, growth * lumps - i));
    const rx = size * (0.7 + R() * 0.5), ry = size * (0.45 + R() * 0.3);
    const col = cols[i % cols.length];
    if (vis > 0) {
      out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(rx * vis).toFixed(1)}" ry="${(ry * vis).toFixed(1)}" fill="${col}"/>`;
      out += `<ellipse cx="${(x - rx * 0.3).toFixed(1)}" cy="${(y - ry * 0.3).toFixed(1)}" rx="${(rx * 0.3 * vis).toFixed(1)}" ry="${(ry * 0.25 * vis).toFixed(1)}" fill="#fff" opacity=".35"/>`;
      if (R() > 0.4) {
        const dx = x + (R() - 0.5) * rx * 1.4;
        const len = (6 + R() * 16) * vis;
        out += `<rect x="${(dx - 2.5).toFixed(1)}" y="${y.toFixed(1)}" width="5" height="${len.toFixed(1)}" rx="2.5" fill="${col}"/><circle cx="${dx.toFixed(1)}" cy="${(y + len).toFixed(1)}" r="3.2" fill="${col}"/>`;
      }
    }
    y -= ry * (0.9 + R() * 0.4);
    x += (R() - 0.5) * 14;
    x = Math.max(30, Math.min(90, x));
    size *= 0.84 + R() * 0.1;
  }
  return `<svg class="sculpture-svg" viewBox="0 0 120 120">${out}</svg>`;
}

/* ---------- 3D cake ---------- */
let CAKE_STYLE = 'painted';
export const setCakeStyle = (s) => { CAKE_STYLE = s === 'classic' || s === 'new' ? s : 'painted'; };
export function cakeSVG(design, candles = [], toppers = [], opts = {}) {
  if (ART_MODE === 'painted' && CAKE_STYLE === 'painted' && CAKE_ART[design.id]) return cakeSVGPainted(design, candles, toppers, opts);
  return CAKE_STYLE === 'classic' ? cakeSVGClassic(design, candles, toppers, opts) : cakeSVG3D(design, candles, toppers, opts);
}

const TILT = 0.2;
const sideGrad = (id, c) => `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${dark(c, 0.2)}"/><stop offset=".1" stop-color="${dark(c, 0.05)}"/><stop offset=".3" stop-color="${light(c, 0.4)}"/><stop offset=".48" stop-color="${light(c, 0.14)}"/><stop offset=".78" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.26)}"/></linearGradient>`;
const topGrad = (id, c) => `<radialGradient id="${id}" cx=".38" cy=".3" r=".9"><stop offset="0" stop-color="${light(c, 0.55)}"/><stop offset=".55" stop-color="${light(c, 0.18)}"/><stop offset="1" stop-color="${dark(c, 0.05)}"/></radialGradient>`;
const ballGrad = (id, c) => `<radialGradient id="${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${light(c, 0.75)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.22)}"/></radialGradient>`;

function ring(cx, yc, rx, ry, front, step, fn) {
  let s = '';
  const n = Math.max(6, Math.round((Math.PI * (rx + ry)) / 2 / step));
  for (let k = 0; k <= n; k++) {
    const th = (front ? 0 : Math.PI) + (k / n) * Math.PI;
    const sin = Math.sin(th);
    const x = cx - Math.cos(th) * rx, y = yc + sin * ry;
    const depth = 0.78 + 0.22 * sin;
    const ang = (Math.atan2(Math.cos(th) * ry, sin * rx) * 180) / Math.PI;
    s += fn(x, y, depth, ang, th);
  }
  return s;
}

function pipingRing(style, cx, yc, rx, ry, front, size, G) {
  if (style === 'pearl') return ring(cx, yc, rx, ry, front, size * 1.9, (x, y, d) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size * d).toFixed(2)}" fill="url(#${G})"/>`);
  if (style === 'rosette') return ring(cx, yc, rx, ry, front, size * 2.1, (x, y, d, a) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(d * size / 6).toFixed(3)})"><circle r="6.6" fill="url(#${G})"/><path d="M0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.2 3.2 0 1 1 3.2 3.2 a4.6 4.6 0 1 1 -4.6 -4.6" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".9" transform="rotate(${a.toFixed(0)})"/></g>`);
  return ring(cx, yc, rx, ry, front, size * 1.55, (x, y, d, a) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${(d * size / 6).toFixed(3)})"><path d="M-8 1 C-8 -6 4 -7 8 -1 C9 2 6 5 2 5 C-3 5 -8 4 -8 1Z" fill="url(#${G})"/><path d="M-5 0 C-2 -3 3 -3 5 0" stroke="#000" stroke-opacity=".1" stroke-width=".8" fill="none"/></g>`);
}

const sidePt = (t, th, f) => ({ x: 200 - Math.cos(th) * (t.w / 2), y: t.top + Math.sin(th) * t.ry + f * t.h, sx: Math.max(0.25, Math.sin(th)) });

function strawberry3D(x, y, s) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})"><ellipse cy="9" rx="8" ry="2.5" fill="#000" opacity=".12"/><path d="M0 10 C-11 3 -10 -8 0 -7 C10 -8 11 3 0 10Z" fill="#e8394d"/><path d="M-5 -4 C-3 -6 0 -6 1 -5" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/><g fill="#ffe08a"><circle cx="-4" cy="0" r=".7"/><circle cx="3" cy="-1" r=".7"/><circle cx="0" cy="3" r=".7"/><circle cx="-2" cy="6" r=".6"/><circle cx="4" cy="4" r=".6"/></g><path d="M0 -7 l-6 -2 l3 3 l-4 2 l5 -1 l2 3 l2 -3 l5 1 l-4 -2 l3 -3z" fill="#3f8f4f"/></g>`;
}
const berry3D = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})"><ellipse cy="5" rx="6" ry="1.8" fill="#000" opacity=".12"/><circle r="5.5" fill="#5361c9"/><circle cx="-1.8" cy="-1.8" r="1.6" fill="#fff" opacity=".45"/><path d="M-1.5 -4.6 l1.5 1 l1.5 -1" stroke="#2c3480" stroke-width=".8" fill="none"/></g>`;
const cherry3D = (x, y, s) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})"><ellipse cy="6" rx="6" ry="1.8" fill="#000" opacity=".12"/><path d="M0 -4 q3 -9 9 -12" stroke="#5a7d2a" stroke-width="1.3" fill="none"/><circle r="6.5" fill="#c8102e"/><circle cx="-2.2" cy="-2.2" r="1.9" fill="#fff" opacity=".55"/></g>`;

function sideDeco(design, t, i, R, G) {
  let s = '';
  const front = (n, f0 = 0.35, f1 = 0.65) => Array.from({ length: n }, (_, k) => sidePt(t, 0.22 + ((k + 0.5) / n) * (Math.PI - 0.44), f0 + R() * (f1 - f0)));
  switch (design.deco) {
    case 'confetti': {
      const cols = ['#f48fb1', '#ffd166', '#8fd3b6', '#8fc7f0', '#c6a7f2'];
      for (let k = 0; k < 46; k++) { const p = sidePt(t, 0.08 + R() * (Math.PI - 0.16), 0.15 + R() * 0.75); s += `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(2.2 * p.sx).toFixed(2)}" ry="2.2" fill="${cols[k % 5]}"/>`; }
      break;
    }
    case 'gold':
      front(7, 0.3, 0.7).forEach((p) => { s += `<path transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${p.sx.toFixed(2)},1)" d="M0 -7C.8 -1.8 1.8 -.8 7 0C1.8 .8 .8 1.8 0 7C-.8 1.8 -1.8 .8 -7 0C-1.8 -.8 -.8 -1.8 0 -7Z" fill="url(#${G}g)"/>`; });
      break;
    case 'bats':
      if (i === 0) front(5).forEach((p) => { s += `<path transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${(0.9 * p.sx).toFixed(2)},.9)" d="M0 0 c-4 -6 -10 -6 -16 -2 c4 0 6 2 6 5 c2 -2 4 -2 5 0 c1 -2 3 -3 5 -3 c2 0 4 1 5 3 c1 -2 3 -2 5 0 c0 -3 2 -5 6 -5 c-6 -4 -12 -4 -16 2z" fill="#2a1f33"/>`; });
      else front(4).forEach((p) => { s += `<g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${p.sx.toFixed(2)},1)" fill="#5a3010"><polygon points="-8,-3 -3,-3 -5.5,-8"/><polygon points="8,-3 3,-3 5.5,-8"/><path d="M-9 3 q9 8 18 0 l-3 1 -2 -2 -2 2 -2 -2 -2 2 -2 -2 -2 2z"/></g>`; });
      break;
    case 'blossoms': {
      const n = i === 0 ? 7 : 5;
      for (let k = 0; k < n; k++) {
        const th = 0.5 + (k / n) * 1.3 + R() * 0.2, p = sidePt(t, th, 0.15 + (k / n) * 0.7);
        let pet = '';
        for (let q = 0; q < 5; q++) pet += `<ellipse cy="-4.6" rx="3.4" ry="4.8" fill="url(#${G}bl)" transform="rotate(${q * 72})"/>`;
        s += `<g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${(p.sx * (0.9 + R() * 0.4)).toFixed(2)},${(0.9 + R() * 0.3).toFixed(2)})">${pet}<circle r="2.2" fill="#ffd36e"/></g>`;
      }
      break;
    }
    case 'bows':
      [0.3, 0.5, 0.7].forEach((f) => { const p = sidePt(t, Math.PI * f, 0.45); s += `<g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${p.sx.toFixed(2)},1)"><path d="M0 0 C-6 -9 -16 -9 -15 -1 C-14 5 -6 4 0 0Z M0 0 C6 -9 16 -9 15 -1 C14 5 6 4 0 0Z" fill="url(#${G}bw)"/><path d="M-1 1 L-7 15 L-3.5 13.5 L-2 16.5 Z M1 1 L7 15 L3.5 13.5 L2 16.5 Z" fill="${dark(design.bow || '#f28fae', 0.08)}"/><ellipse rx="3" ry="3.4" fill="${dark(design.bow || '#f28fae', 0.18)}"/></g>`; });
      break;
    case 'finals': {
      if (i !== 0) break;
      const y = t.top + t.h * 0.72, rx = t.w / 2;
      s += `<path id="${G}fp" d="M${200 - rx} ${y} A${rx} ${t.ry} 0 0 0 ${200 + rx} ${y}" fill="none"/><text font-family="Georgia, serif" font-style="italic" font-size="24" fill="#6b4226"><textPath href="#${G}fp" startOffset="50%" text-anchor="middle">you got this ♡</textPath></text>`;
      break;
    }
    default: break;
  }
  if (design.lambeth) {
    const m = Math.max(4, Math.round(t.w / 55));
    const sag = t.h * 0.32;
    for (let k = 0; k < m; k++) {
      const a = 0.05 + (k / m) * (Math.PI - 0.1), b = 0.05 + ((k + 1) / m) * (Math.PI - 0.1);
      let d = '';
      for (let q = 0; q <= 14; q++) { const u = a + (b - a) * (q / 14); const p = sidePt(t, u, 0); d += `${q ? 'L' : 'M'}${p.x.toFixed(1)} ${(p.y + 8 + sag * Math.sin((Math.PI * q) / 14)).toFixed(1)}`; }
      s += `<path d="${d}" stroke="${design.piping2 || '#fff'}" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-dasharray=".1 6.5"/><path d="${d}" stroke="${design.piping}" stroke-width="2.2" fill="none" opacity=".9"/>`;
      const p = sidePt(t, a, 0);
      if (k) s += `<circle cx="${p.x.toFixed(1)}" cy="${(p.y + 9).toFixed(1)}" r="${(4 * (0.7 + 0.3 * p.sx)).toFixed(1)}" fill="url(#${G}p2)"/><path d="M${p.x.toFixed(1)} ${(p.y + 13).toFixed(1)} l0 ${(t.h * 0.18).toFixed(1)}" stroke="${design.piping}" stroke-width="2" stroke-linecap="round"/>`;
    }
  }
  if (design.pipe === 'ruffle') {
    const rows = Math.max(4, Math.round(t.h / 13));
    for (let r = 1; r < rows; r++) {
      const f = r / rows;
      let d = '';
      for (let q = 0; q <= 60; q++) { const u = (q / 60) * Math.PI; const p = sidePt(t, u, f); d += `${q ? 'L' : 'M'}${p.x.toFixed(1)} ${(p.y + Math.abs(Math.sin(q * 1.6)) * 3.2).toFixed(1)}`; }
      s += `<path d="${d}" stroke="${dark(t.c, 0.12)}" stroke-width="2.2" fill="none" opacity=".35" transform="translate(0,1.4)"/><path d="${d}" stroke="${light(t.c, 0.55)}" stroke-width="1.8" fill="none"/>`;
    }
  }
  return s;
}

function topperSide(toppers, t, R, G) {
  let s = '';
  if (toppers.includes('pearls')) s += ring(200, t.top + t.h * 0.55, t.w / 2, t.ry, true, 7.5, (x, y, d) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.4 * d).toFixed(2)}" fill="url(#${G}pl)"/>`);
  if (toppers.includes('goldleaf')) for (let k = 0; k < 6; k++) {
    const p = sidePt(t, 0.3 + R() * (Math.PI - 0.6), 0.2 + R() * 0.6);
    const pts = Array.from({ length: 7 }, (_, q) => { const a = (q / 7) * Math.PI * 2, rr = 4 + R() * 6; return `${(p.x + Math.cos(a) * rr * p.sx).toFixed(1)},${(p.y + Math.sin(a) * rr).toFixed(1)}`; }).join(' ');
    s += `<polygon points="${pts}" fill="url(#${G}g)" opacity=".95"/>`;
  }
  if (toppers.includes('sprinkles')) {
    const cols = ['#f06292', '#ffd166', '#5fd0a6', '#5fb2e8', '#b388ff', '#ffffff'];
    for (let k = 0; k < 30; k++) { const p = sidePt(t, 0.1 + R() * (Math.PI - 0.2), 0.12 + R() * 0.75); s += `<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${(6 * p.sx).toFixed(1)}" height="2" rx="1" fill="${cols[k % 6]}" transform="rotate(${(R() * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`; }
  }
  if (toppers.includes('bows')) [0.32, 0.68].forEach((f) => { const p = sidePt(t, Math.PI * f, 0.25); s += `<g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${(p.sx * 0.9).toFixed(2)},.9)"><path d="M0 0 C-6 -9 -16 -9 -15 -1 C-14 5 -6 4 0 0Z M0 0 C6 -9 16 -9 15 -1 C14 5 6 4 0 0Z" fill="#f48fb1"/><path d="M-1 1 L-6 14 M1 1 L6 14" stroke="#f48fb1" stroke-width="3"/><circle r="3.2" fill="#e05b8a"/></g>`; });
  return s;
}

function cakeSVG3D(design, candles = [], toppers = [], opts = {}) {
  const R = rng(opts.seed || design.id);
  const id = uid();
  const cx = 200;
  const plateY = 352;
  const maxW = Math.max(...design.tiers.map((t) => t.w));
  const PR = maxW / 2 + 30, Pry = PR * TILT;
  let y = plateY - 2;
  const tiers = design.tiers.map((t) => { const ry = (t.w / 2) * TILT; const bottom = y; const top = y - t.h; y = top; return { ...t, ry, top, bottom }; });
  const tt = tiers[tiers.length - 1];
  const minY = tt.top - tt.ry - 128;
  const pc = design.plate;
  const pipe = design.pipe || 'shell';

  let defs = sideGrad(`${id}ps`, pc) + topGrad(`${id}pt`, pc) + ballGrad(`${id}p1`, design.piping) + ballGrad(`${id}p2`, design.piping2 || design.piping)
    + `<radialGradient id="${id}gs"><stop offset="0" stop-color="#5a3a30" stop-opacity=".28"/><stop offset="1" stop-color="#5a3a30" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${id}ao"><stop offset=".6" stop-color="#3a2420" stop-opacity=".22"/><stop offset="1" stop-color="#3a2420" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="${id}edge" x1="0" x2="1"><stop offset="0" stop-color="#2a1a18" stop-opacity=".22"/><stop offset=".16" stop-color="#2a1a18" stop-opacity="0"/><stop offset=".8" stop-color="#2a1a18" stop-opacity="0"/><stop offset="1" stop-color="#2a1a18" stop-opacity=".28"/></linearGradient>`
    + `<linearGradient id="${id}vb" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#2a1a18" stop-opacity="0"/><stop offset="1" stop-color="#2a1a18" stop-opacity=".12"/></linearGradient>`
    + ballGrad(`${id}pl`, '#fffaf1') + ballGrad(`${id}bl`, '#ffb3cb') + ballGrad(`${id}bw`, design.bow || '#f28fae')
    + `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".45" stop-color="#e3b85c"/><stop offset="1" stop-color="#b8862f"/></linearGradient>`;
  if (design.drip) defs += topGrad(`${id}dt`, design.drip);

  let out = '';
  // stand
  out += `<ellipse cx="${cx}" cy="${plateY + 70}" rx="${PR * 0.75}" ry="14" fill="url(#${id}gs)"/>`;
  out += `<ellipse cx="${cx}" cy="${plateY + 64}" rx="62" ry="12" fill="${dark(pc, 0.18)}"/><path d="M${cx - 62} ${plateY + 58} L${cx - 62} ${plateY + 64} A62 12 0 0 0 ${cx + 62} ${plateY + 64} L${cx + 62} ${plateY + 58}Z" fill="url(#${id}ps)"/><ellipse cx="${cx}" cy="${plateY + 58}" rx="62" ry="12" fill="url(#${id}pt)"/>`;
  out += `<path d="M${cx - 13} ${plateY + 6} C${cx - 9} ${plateY + 26} ${cx - 8} ${plateY + 38} ${cx - 30} ${plateY + 56} L${cx + 30} ${plateY + 56} C${cx + 8} ${plateY + 38} ${cx + 9} ${plateY + 26} ${cx + 13} ${plateY + 6}Z" fill="url(#${id}ps)"/>`;
  out += `<path d="M${cx - PR} ${plateY} L${cx - PR} ${plateY + 8} A${PR} ${Pry} 0 0 0 ${cx + PR} ${plateY + 8} L${cx + PR} ${plateY}Z" fill="url(#${id}ps)"/><ellipse cx="${cx}" cy="${plateY}" rx="${PR}" ry="${Pry}" fill="url(#${id}pt)"/><ellipse cx="${cx}" cy="${plateY}" rx="${PR - 6}" ry="${Pry - 1.5}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>`;
  out += ring(cx, plateY + 4, PR, Pry, true, 9, (x, yy, d) => `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${(1.6 * d).toFixed(2)}" fill="#fff" opacity=".6"/>`);

  tiers.forEach((t, i) => {
    const x1 = cx - t.w / 2, x2 = cx + t.w / 2, rx = t.w / 2;
    defs += sideGrad(`${id}s${i}`, t.c) + topGrad(`${id}t${i}`, design.drip || light(t.c, 0.1));
    out += `<ellipse cx="${cx}" cy="${t.bottom + 1}" rx="${rx + 10}" ry="${t.ry + 5}" fill="url(#${id}ao)"/>`;
    out += pipingRing(pipe, cx, t.bottom - 3, rx + 1, t.ry, false, 5.5, `${id}p1`);
    const side = `M${x1} ${t.top} L${x1} ${t.bottom} A${rx} ${t.ry} 0 0 0 ${x2} ${t.bottom} L${x2} ${t.top} Z`;
    out += `<path d="${side}" fill="url(#${id}s${i})"/>`;
    out += sideDeco(design, t, i, R, id);
    out += topperSide(toppers, t, R, id);
    out += `<path d="${side}" fill="url(#${id}edge)"/><path d="${side}" fill="url(#${id}vb)"/>`;
    if (design.drip) {
      const dc = design.drip;
      let d = `M${x1} ${t.top}`;
      for (let q = 0; q <= 50; q++) { const th = (q / 50) * Math.PI; d += ` L${(cx - Math.cos(th) * rx).toFixed(1)} ${(t.top + Math.sin(th) * t.ry + 5 + Math.sin(q * 1.3) * 1.5).toFixed(1)}`; }
      out += `<path d="${d} L${x2} ${t.top}Z" fill="${dc}"/>`;
      for (let th = 0.1 + R() * 0.1; th < Math.PI - 0.08; th += 0.13 + R() * 0.16) {
        const sin = Math.sin(th), x = cx - Math.cos(th) * rx, yb = t.top + sin * t.ry + 3;
        const len = (8 + R() * t.h * 0.5) * (0.45 + 0.55 * sin), dw = 7.5 * (0.3 + 0.7 * sin);
        const col = dark(dc, (1 - sin) * 0.22 + (Math.cos(th) < 0 ? 0.05 : 0));
        out += `<rect x="${(x - dw / 2).toFixed(1)}" y="${yb.toFixed(1)}" width="${dw.toFixed(1)}" height="${len.toFixed(1)}" rx="${(dw / 2).toFixed(1)}" fill="${col}"/><circle cx="${x.toFixed(1)}" cy="${(yb + len - dw * 0.2).toFixed(1)}" r="${(dw * 0.62).toFixed(1)}" fill="${col}"/><rect x="${(x - dw * 0.25).toFixed(1)}" y="${(yb + 2).toFixed(1)}" width="${(dw * 0.18).toFixed(1)}" height="${Math.max(0, len - 3).toFixed(1)}" rx="1" fill="#fff" opacity="${(0.35 * sin).toFixed(2)}"/>`;
      }
    }
    out += `<ellipse cx="${cx}" cy="${t.top}" rx="${rx}" ry="${t.ry}" fill="url(#${id}t${i})"/>`;
    if (!design.drip) out += `<ellipse cx="${cx}" cy="${t.top + 1}" rx="${rx * 0.72}" ry="${t.ry * 0.72}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.5"/>`;
    if (i < tiers.length - 1) out += `<ellipse cx="${cx}" cy="${t.top + 1}" rx="${tiers[i + 1].w / 2 + 12}" ry="${tiers[i + 1].ry + 5}" fill="url(#${id}ao)"/>`;
    out += pipingRing(pipe === 'ruffle' ? 'pearl' : pipe, cx, t.top, rx - 3, t.ry - 1, false, 4.4, `${id}p2`);
    if (i < tiers.length - 1) out += pipingRing(pipe === 'ruffle' ? 'pearl' : pipe, cx, t.top, rx - 3, t.ry - 1, true, 4.4, `${id}p2`);
  });

  // items standing on the top tier, depth sorted
  const items = [];
  const rxT = tt.w / 2, ryT = tt.ry;
  const onTop = (f, th) => ({ x: cx + Math.cos(th) * rxT * f, y: tt.top + Math.sin(th) * ryT * f });
  const rimItem = (n, f, draw, off = 0) => { for (let k = 0; k < n; k++) { const th = off + (k / n) * Math.PI * 2; const p = onTop(f, th); items.push({ y: p.y, s: draw(p.x, p.y, 0.85 + 0.15 * Math.sin(th)) }); } };
  if (design.deco === 'strawberries') rimItem(9, 0.84, strawberry3D, 0.2);
  if (design.deco === 'berries') rimItem(14, 0.86, berry3D, 0.1);
  if (toppers.includes('cherries')) rimItem(6, 0.78, cherry3D, 0.5);
  if (toppers.includes('sprinkles') || design.deco === 'confetti') {
    const cols = ['#f06292', '#ffd166', '#5fd0a6', '#5fb2e8', '#b388ff', '#ffffff'];
    let sp = '';
    for (let k = 0; k < 40; k++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.86; const p = onTop(rr, a); sp += `<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="5" height="1.8" rx=".9" fill="${cols[k % 6]}" transform="rotate(${(R() * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`; }
    items.push({ y: -1e9, s: sp });
  }
  const n = candles.length;
  const outer = n <= 6 ? n : Math.ceil(n * 0.62);
  candles.forEach((c, k) => {
    let p;
    if (n === 1) p = { x: cx, y: tt.top };
    else if (k < outer) p = onTop(n <= 3 ? 0.42 : 0.6, Math.PI / 2 + (k / outer) * Math.PI * 2 + (n % 2 ? 0 : Math.PI / (2 * outer)));
    else p = onTop(0.2, Math.PI / 2 + ((k - outer) / (n - outer)) * Math.PI * 2 + 0.6);
    const cd = opts.getDesign(c.design);
    const rem = c.melted ? Math.max(0.12, c.remaining ?? 0.5) : 1;
    items.push({ y: p.y, s: `<ellipse cx="${p.x.toFixed(1)}" cy="${(p.y + 1).toFixed(1)}" rx="9" ry="2.6" fill="#3a2420" opacity=".14"/><g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(.4)"><title>${c.subject || ''} · ${c.minutes} min${c.melted ? ' (blown out early)' : ''}</title>${candleGroup(cd, c.kind, rem, { bare: true, lit: !c.melted && opts.lit !== false, blue: c.blue })}</g>` });
  });
  // front rim piping of top tier sits in front of back items but behind front ones: add as an item at rim front depth
  items.push({ y: tt.top + ryT * 0.5, s: pipingRing(pipe === 'ruffle' ? 'pearl' : pipe, cx, tt.top, rxT - 3, ryT - 1, true, 4.4, `${id}p2`) });
  items.sort((a, b) => a.y - b.y).forEach((it) => { out += it.s; });

  // front bottom piping + stand-side extras
  tiers.forEach((t) => { out += pipingRing(pipe, cx, t.bottom - 3, t.w / 2 + 1, t.ry, true, 5.5, `${id}p1`); });
  if (design.deco === 'finals') {
    out += `<g transform="translate(${cx - PR + 34},${plateY + 10})"><ellipse cy="8" rx="13" ry="3" fill="#000" opacity=".12"/><path d="M-10 -10 L-9 6 Q0 10 9 6 L10 -10Z" fill="#fff"/><ellipse cy="-10" rx="10" ry="3" fill="#6b4226"/><path d="M10 -6 q8 2 0 9" stroke="#fff" stroke-width="3" fill="none"/></g>`;
    out += `<g transform="translate(${cx + PR - 38},${plateY + 12})"><rect x="-16" y="0" width="32" height="7" rx="1.5" fill="#e76f6f"/><rect x="-14" y="-7" width="29" height="7" rx="1.5" fill="#6aa9d8"/><rect x="-15" y="-14" width="27" height="7" rx="1.5" fill="#f3cd6f"/></g>`;
  }
  const fig = (x, yy, svg) => `<g transform="translate(${x},${yy})"><ellipse cy="0" rx="13" ry="3.5" fill="#000" opacity=".12"/>${svg}</g>`;
  if (toppers.includes('bunny')) out += fig(cx - PR + 26, plateY + 8, `<ellipse cx="-4" cy="-30" rx="3.5" ry="10" fill="#fff" stroke="#f0c8d4"/><ellipse cx="4" cy="-30" rx="3.5" ry="10" fill="#fff" stroke="#f0c8d4"/><ellipse cy="-8" rx="11" ry="10" fill="#fff"/><circle cy="-20" r="8" fill="#fff"/><circle cx="-3" cy="-21" r="1" fill="#333"/><circle cx="3" cy="-21" r="1" fill="#333"/><ellipse cy="-17" rx="1.6" ry="1" fill="#ff8fb3"/>`);
  if (toppers.includes('frog')) out += fig(cx + PR - 26, plateY + 8, `<ellipse cy="-8" rx="13" ry="9" fill="#8bd47a"/><circle cx="-6" cy="-17" r="5" fill="#8bd47a"/><circle cx="6" cy="-17" r="5" fill="#8bd47a"/><circle cx="-6" cy="-17" r="2" fill="#222"/><circle cx="6" cy="-17" r="2" fill="#222"/><path d="M-5 -8 q5 4 10 0" stroke="#2f6b25" stroke-width="1.2" fill="none"/><ellipse cx="-8" cy="-6" rx="2" ry="1.2" fill="#ff9eb5"/><ellipse cx="8" cy="-6" rx="2" ry="1.2" fill="#ff9eb5"/>`);

  return `<svg class="${opts.cls || 'cake-svg'}" viewBox="0 ${minY} 400 ${plateY + 90 - minY}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${out}</svg>`;
}

const CAKE_TOP = { cx: 0.5, cy: 0.165, rx: 0.33, ry: 0.1 };
function cakeSVGPainted(design, candles = [], toppers = [], opts = {}) {
  const R = rng(opts.seed || design.id);
  const art = CAKE_ART[design.id], top = { ...CAKE_TOP, ...(art.top || {}) };
  const W = 360, H = Math.round(W / art.ar), X0 = 20, Y0 = 130;
  const cx = X0 + top.cx * W, cy = Y0 + top.cy * H, rxT = top.rx * W, ryT = top.ry * H;
  const onTop = (f, th) => ({ x: cx + Math.cos(th) * rxT * f, y: cy + Math.sin(th) * ryT * f });
  const items = [];
  if (toppers.includes('cherries')) for (let k = 0; k < 6; k++) { const th = 0.5 + (k / 6) * Math.PI * 2; const p = onTop(0.8, th); items.push({ y: p.y, s: cherry3D(p.x, p.y, 0.85 + 0.15 * Math.sin(th)) }); }
  if (toppers.includes('sprinkles')) {
    const cols = ['#f06292', '#ffd166', '#5fd0a6', '#5fb2e8', '#b388ff', '#ffffff'];
    let sp = '';
    for (let k = 0; k < 40; k++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.86; const p = onTop(rr, a); sp += `<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="5" height="1.8" rx=".9" fill="${cols[k % 6]}" transform="rotate(${(R() * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`; }
    items.push({ y: -1e9, s: sp });
  }
  const n = candles.length, outer = n <= 6 ? n : Math.ceil(n * 0.62);
  candles.forEach((c, k) => {
    let p;
    if (n === 1) p = { x: cx, y: cy };
    else if (k < outer) p = onTop(n <= 3 ? 0.42 : 0.62, Math.PI / 2 + (k / outer) * Math.PI * 2 + (n % 2 ? 0 : Math.PI / (2 * outer)));
    else p = onTop(0.22, Math.PI / 2 + ((k - outer) / (n - outer)) * Math.PI * 2 + 0.6);
    const cd = opts.getDesign(c.design);
    const rem = c.melted ? Math.max(0.12, c.remaining ?? 0.5) : 1;
    items.push({ y: p.y, s: `<ellipse cx="${p.x.toFixed(1)}" cy="${(p.y + 1).toFixed(1)}" rx="13" ry="3.6" fill="#3a2420" opacity=".14"/><g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(.6)"><title>${c.subject || ''} · ${c.minutes} min${c.melted ? ' (blown out early)' : ''}</title>${candleGroup(cd, c.kind, rem, { bare: true, lit: !c.melted && opts.lit !== false, blue: c.blue })}</g>` });
  });
  const body = items.sort((a, b) => a.y - b.y).map((it) => it.s).join('');
  return `<svg class="${opts.cls || 'cake-svg'}" viewBox="0 0 400 ${Y0 + H + 12}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="200" cy="${Y0 + H - 4}" rx="${W * 0.3}" ry="9" fill="#3a2420" opacity=".1"/><image href="/art3/cake_${design.id}.webp" x="${X0}" y="${Y0}" width="${W}" height="${H}"/>${body}</svg>`;
}

export const PSTUDIO = { bodies: Object.keys(ART4.body), holders: Object.keys(ART4.holder), patterns: ART4.pattern, decors: Object.keys(ART4.decor) };
function studioPainted(d, r, id, opts) {
  const body = ART4.body[d.body] ? d.body : 'pillar';
  const bd = { ...d, art: 'b_' + body, id: d.id || 'studio' };
  const a = ART['b_' + body], bw = Math.round(a.h * a.ar), bh = a.h, basePx = a.baseW * bw;
  let hk = ART4.holder[d.holder] ? d.holder : 'slice';
  if (body !== 'taper' && ART4.holder[hk].stick) hk = 'slice';
  const H = ART4.holder[hk];
  const hw = H.stick ? Math.min(150, (basePx * 1.15) / Math.max(0.15, H.topW)) : Math.max(basePx * 1.9, 70), hh = hw / H.ar;
  const yb = H.stick ? -hh + hh * (hk === 'chamber' ? 0.12 : 0.05) : -hh * 0.42;
  const himg = `<image href="/art4/holder_${hk}.webp" x="${(-hw / 2).toFixed(1)}" y="${(-hh).toFixed(1)}" width="${hw.toFixed(1)}" height="${hh.toFixed(1)}"/>`;
  const p = paintedCandle(bd, r, id, opts);
  const top = d.c1 || '#fdf6ec', bot = d.c2 || top, acc = onColor(d.c3 || d.c2 || top, mix(top, bot, 0.5), 0.2);
  const box = `x="${-bw}" y="${-bh * 1.1}" width="${bw * 2}" height="${bh * 1.2}"`;
  let defs = `<linearGradient id="${id}tg" gradientUnits="userSpaceOnUse" x1="0" y1="${-bh}" x2="0" y2="0"><stop offset=".08" stop-color="${top}"/><stop offset=".92" stop-color="${bot}"/></linearGradient><mask id="${id}pm" mask-type="alpha" maskUnits="userSpaceOnUse" ${box}><g>${p.art}</g></mask>`;
  let bodyG = `${p.out}<g mask="url(#${id}pm)" style="mix-blend-mode:multiply"><rect ${box} fill="url(#${id}tg)"/></g>`;
  if (d.pattern && ART4.pattern.includes(d.pattern)) {
    const ps = Math.round(bh * 1.8);
    defs += `<pattern id="${id}pp" patternUnits="userSpaceOnUse" width="${ps}" height="${ps}"><image href="/art4/pat_${d.pattern}.webp" width="${ps}" height="${ps}"/></pattern><filter id="${id}pc" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.1 -1.1 -1.1 0 3.15" result="a"/><feFlood flood-color="${acc}"/><feComposite in2="a" operator="in"/></filter>`;
    bodyG += `<g mask="url(#${id}pm)"><rect ${box} fill="url(#${id}pp)" filter="url(#${id}pc)" opacity=".92"/></g>`;
  }
  if (d.decor && ART4.decor[d.decor]) {
    const D = ART4.decor[d.decor], dw = Math.max(bw * (body === 'taper' ? 1.5 : 0.62), 26), dh = dw / D.ar;
    const dy = -bh * (body === 'taper' ? 0.3 : 0.4), topY = dy - dh / 2, vis = Math.max(0, Math.min(1, (topY - p.tip) / (bh * 0.08) + 1));
    if (vis > 0) bodyG += `<image href="/art4/dec_${d.decor}.webp" x="${(-dw / 2).toFixed(1)}" y="${(dy - dh / 2).toFixed(1)}" width="${dw.toFixed(1)}" height="${dh.toFixed(1)}" opacity="${vis.toFixed(2)}"/>`;
  }
  const bodyT = `<g transform="translate(0,${yb.toFixed(1)})">${bodyG}</g>`;
  return { out: `<defs>${defs}</defs>` + (H.stick ? bodyT + himg : himg + bodyT), tip: p.tip + yb, x: p.x, w: Math.max(hw, bw), h: bh - yb };
}
function pstudioSize(d) {
  const a = ART['b_' + (ART4.body[d.body] ? d.body : 'pillar')];
  const hk = ART4.holder[d.holder] ? d.holder : 'slice', H = ART4.holder[hk];
  const extra = H.stick && d.body === 'taper' ? 110 : 24;
  return { w: Math.round(Math.max(a.h * a.ar, 90)), h: a.h + extra };
}
