
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
const SHAPES = { pumpkin: { w: 96, h: 74 }, seashell: { w: 100, h: 78 }, tamagotchi: { w: 70, h: 88 }, taper: { w: 30, h: 200 }, spiral: { w: 30, h: 200 }, pillar: { w: 74, h: 130 }, jar: { w: 84, h: 96 }, teacup: { w: 96, h: 50 } };
const GOLD = '#e0bb72';

function flameMarkup(blue, agitated, id) {
  const c = blue ? { halo: '#9fd3ff', o1: '#5aa8ff', o2: '#dff2ff', inn: '#ffffff' } : { halo: '#ffc875', o1: '#ffab45', o2: '#fff0c4', inn: '#fffdf4' };
  return `<defs><radialGradient id="${id}h"><stop offset="0" stop-color="${c.halo}" stop-opacity=".55"/><stop offset=".45" stop-color="${c.halo}" stop-opacity=".16"/><stop offset="1" stop-color="${c.halo}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c.o1}"/><stop offset=".55" stop-color="${c.o2}"/><stop offset="1" stop-color="${c.o2}" stop-opacity=".85"/></linearGradient></defs>
    <circle class="glow" cy="-18" r="48" fill="url(#${id}h)"/>
    <g class="flame ${agitated ? 'agitated' : ''}">
      <path d="M0,-42 C4,-29 11,-18 9,-8 C7.5,-1 3.5,2 0,2 C-3.5,2 -7.5,-1 -9,-8 C-11,-18 -4,-29 0,-42Z" fill="url(#${id}f)"/>
      <path d="M0,-23 C3,-15 5,-9 4,-4 C3,-.5 1.5,1 0,1 C-1.5,1 -3,-.5 -4,-4 C-5,-9 -3,-15 0,-23Z" fill="${c.inn}"/>
    </g>`;
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
  fairy: (y) => `<g transform="translate(0,${y})"><path d="M-2 -16 C-14 -30 -22 -18 -14 -12 C-10 -9 -5 -12 -2 -14Z M2 -16 C14 -30 22 -18 14 -12 C10 -9 5 -12 2 -14Z" fill="#e6f6ff" fill-opacity=".85" stroke="#b9d9f0" stroke-width=".6"/><path d="M-7 0 L0 -14 L7 0Z" fill="#c9b6f2"/><path d="M-7 0 Q0 3 7 0" fill="#b49ce8"/><circle cy="-18" r="5.5" fill="#ffe6d4"/><path d="M-5.5 -19 C-6 -25 6 -25 5.5 -19 C4 -22 -4 -22 -5.5 -19Z" fill="#f3c98b"/><circle cx="-2" cy="-18" r=".6" fill="#5a4040"/><circle cx="2" cy="-18" r=".6" fill="#5a4040"/><path d="M6 -10 L12 -20" stroke="${GOLD}" stroke-width=".8"/><path d="M12 -23 l.8 2 2 .8 -2 .8 -.8 2 -.8 -2 -2 -.8 2 -.8z" fill="${GOLD}"/></g>`,
  mermaid: (y) => `<g transform="translate(0,${y})"><path d="M-4 -12 C-6 -4 -2 2 6 2 C10 2 12 6 14 4 C13 0 10 -2 8 -2 C4 -3 4 -8 4 -12Z" fill="#7fd1c7"/><path d="M8 -2 C12 -6 16 -4 16 -2 C14 0 12 0 8 -2Z" fill="#a7e3db"/><path d="M-4 -12 h8 l-1 -8 h-6z" fill="#ffe0cc"/><path d="M-4 -16 a2 2 0 0 0 4 0 a2 2 0 0 0 4 0" fill="#c9b6f2"/><circle cy="-23" r="5" fill="#ffe6d4"/><path d="M-5 -24 C-8 -16 -7 -10 -9 -6 M5 -24 C8 -16 7 -10 9 -6" stroke="#f08a9e" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-5 -24 C-5 -29 5 -29 5 -24" stroke="#f08a9e" stroke-width="2.6" fill="none"/><circle cx="-1.8" cy="-23" r=".6" fill="#5a4040"/><circle cx="1.8" cy="-23" r=".6" fill="#5a4040"/><path d="M-3 -29 l1 -2 1 1.5 1 -2.2 1 2.2 1 -1.5 1 2z" fill="#fff4c4"/></g>`,
};

/* ---- shaped (figure) candles: drawn whole, then clipped as they melt ---- */
const FIGURES = {
  pumpkin: (d, w, h, id) => {
    const lobes = [[-0.3, 0.34], [0.3, 0.34], [-0.16, 0.4], [0.16, 0.4], [0, 0.42]];
    return `<path d="M-2 ${-h + 2} C-1 ${-h - 8} 6 ${-h - 12} 9 ${-h - 10}" stroke="#7a9a4a" stroke-width="5" fill="none" stroke-linecap="round"/>${lobes.map(([x, rx]) => `<ellipse cx="${x * w}" cy="${-h / 2}" rx="${rx * w}" ry="${h / 2}" fill="url(#${id}p)" stroke="${dark(d.c2, 0.18)}" stroke-width="1.2"/>`).join('')}<ellipse cx="${-w * 0.08}" cy="${-h * 0.7}" rx="${w * 0.06}" ry="${h * 0.16}" fill="#fff" opacity=".35"/><path d="M${w * 0.28} ${-h + 6} q10 -6 12 4" stroke="#8fae5a" stroke-width="1.4" fill="none"/>`;
  },
  seashell: (d, w, h, id) => {
    let ribs = '';
    for (let i = -4; i <= 4; i++) ribs += `<path d="M0 -4 L${i * w * 0.11} ${-h + Math.abs(i) * h * 0.08 + 4}" stroke="${dark(d.c2, 0.15)}" stroke-width="1.2" opacity=".7"/>`;
    let edge = `M${-w / 2} ${-h * 0.45}`;
    for (let i = 0; i < 9; i++) { const a0 = Math.PI + (i / 9) * Math.PI, a1 = Math.PI + ((i + 1) / 9) * Math.PI; const x1 = Math.cos(a1) * w / 2, y1 = -h * 0.45 + Math.sin(a1) * h * 0.55; const xm = Math.cos((a0 + a1) / 2) * w * 0.56, ym = -h * 0.45 + Math.sin((a0 + a1) / 2) * h * 0.62; edge += ` Q${xm.toFixed(1)} ${ym.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`; }
    edge += ` L${w * 0.14} -4 L${-w * 0.14} -4 Z`;
    return `<path d="${edge}" fill="url(#${id}p)" stroke="${dark(d.c2, 0.2)}" stroke-width="1"/>${ribs}<path d="M${-w * 0.2} -2 h${w * 0.4} v-8 h${-w * 0.4}z" fill="${dark(d.c2, 0.08)}"/><ellipse cx="${-w * 0.18}" cy="${-h * 0.62}" rx="${w * 0.08}" ry="${h * 0.14}" fill="#fff" opacity=".35"/><circle cx="${w * 0.25}" cy="${-h * 0.15}" r="4" fill="#fffaf2" stroke="#eadfcf" stroke-width=".6"/>`;
  },
  tamagotchi: (d, w, h, id) => {
    const px = [[2, 0], [3, 0], [1, 1], [4, 1], [0, 2], [2, 2], [3, 2], [5, 2], [0, 3], [5, 3], [1, 4], [4, 4], [2, 5], [3, 5]];
    return `<path d="M-6 ${-h - 4} a6 6 0 1 1 12 0" stroke="${GOLD}" stroke-width="2.4" fill="none"/><path d="M0 ${-h} C${w * 0.62} ${-h} ${w * 0.6} 0 0 0 C${-w * 0.6} 0 ${-w * 0.62} ${-h} 0 ${-h}Z" fill="url(#${id}p)" stroke="${dark(d.c2, 0.15)}" stroke-width="1.2"/>
      <rect x="${-w * 0.26}" y="${-h * 0.7}" width="${w * 0.52}" height="${h * 0.36}" rx="5" fill="#e4f0d0" stroke="${dark(d.c2, 0.2)}" stroke-width="1.5"/>
      <g transform="translate(${-w * 0.11},${-h * 0.64})">${px.map(([x, y]) => `<rect x="${x * 2.6}" y="${y * 2.6}" width="2.4" height="2.4" fill="#3a4a2a"/>`).join('')}</g>
      ${[-0.18, 0, 0.18].map((x, i) => `<circle cx="${x * w}" cy="${-h * (0.22 - (i === 1 ? 0.04 : 0))}" r="${w * 0.055}" fill="${d.accent}" stroke="${dark(d.accent, 0.2)}" stroke-width=".8"/>`).join('')}
      <ellipse cx="${-w * 0.2}" cy="${-h * 0.82}" rx="${w * 0.08}" ry="${h * 0.06}" fill="#fff" opacity=".5"/>`;
  },
};

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
const sparkle = (x, y, s, col, delay) => `<path class="twinkle" style="animation-delay:${delay.toFixed(2)}s" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})" d="M0 -6 C.6 -1.4 1.4 -.6 6 0 C1.4 .6 .6 1.4 0 6 C-.6 1.4 -1.4 .6 -6 0 C-1.4 -.6 -.6 -1.4 0 -6Z" fill="${col}"/>`;
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
  const id = uid();
  const R = rng(d.id + kind);
  const r = Math.max(0, Math.min(1, rem));
  let shape = d.shape || (d.pattern === 'spiral' ? 'taper' : 'taper');
  if (opts.bare && (shape === 'jar' || shape === 'teacup')) shape = 'pillar';
  const S = SHAPES[shape];
  const w = S.w;
  const h = S.h * (KMUL[kind] || 1);
  const holder = opts.bare ? null : (shape === 'jar' || shape === 'teacup') ? null : holderMarkup(d, w, id);
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
  } else if (FIGURES[shape]) {
    const cut = -h * r;
    defs += `<linearGradient id="${id}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light(d.c1, 0.2)}"/><stop offset=".5" stop-color="${d.c1}"/><stop offset="1" stop-color="${d.c2}"/></linearGradient><clipPath id="${id}cl"><rect x="-200" y="${r >= 0.999 ? -h - 40 : cut}" width="400" height="${h + 60}"/></clipPath>`;
    out += `<ellipse cy="2" rx="${(w * 0.45 + (1 - r) * w * 0.2).toFixed(1)}" ry="${(4 + (1 - r) * 3).toFixed(1)}" fill="${d.drip}"/><g clip-path="url(#${id}cl)">${FIGURES[shape](d, w, h, id)}</g>`;
    if (r < 0.999) out += `<ellipse cy="${cut}" rx="${(w * 0.42 * Math.sqrt(Math.max(0.15, 1 - Math.pow((cut + h / 2) / (h / 2), 2)))).toFixed(1)}" ry="${(w * 0.07).toFixed(1)}" fill="${opts.lit ? mix(d.drip, '#ffd27a', 0.3) : d.drip}"/>`;
    wickBase = r >= 0.999 ? -h + (shape === 'pumpkin' ? 4 : shape === 'seashell' ? h * 0.12 : 2) : cut;
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
  const fl = opts.lit ? `<g transform="translate(0,${wickTop + 1})">${flameMarkup(opts.blue, opts.agitated, id)}</g>` : '';
  const smoke = opts.smoke ? `<path class="smoke" d="M0 ${wickTop} c-6 -10 6 -16 0 -26 c-6 -10 6 -16 0 -26" stroke="#cfc6cc" stroke-width="2" fill="none" opacity=".7"/>` : '';
  const sp = opts.sparkles ? sparkles(w, h + (holder ? 0 : 0), R, d.accent || '#e7a8b8') : '';
  const fr = holder ? holder.front : '';
  const body = flameDrawnEarly ? `${out}${topper}${wick}${fl}${front}${smoke}` : `${out}${fr}${front}${topper}${wick}${fl}${smoke}`;
  return `<defs>${defs}</defs><g class="candle">${sp}${body}</g>`;
}

export function candleMetrics(d, kind, bare = false) {
  let shape = d.shape || 'taper';
  if (bare && (shape === 'jar' || shape === 'teacup')) shape = 'pillar';
  const S = SHAPES[shape];
  const h = S.h * (KMUL[kind] || 1);
  const hold = bare || shape === 'jar' || shape === 'teacup' ? { h: shape === 'teacup' || shape === 'jar' ? 12 : 0, hw: S.w + 60 } : ({ ornate: { h: 150, hw: 120 }, brass: { h: 22, hw: S.w + 84 }, wood: { h: 18, hw: S.w + 48 }, ceramic: { h: 16, hw: S.w + 44 } }[d.holder] || { h: 14, hw: S.w + 40 });
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
let CAKE_STYLE = 'new';
export const setCakeStyle = (s) => { CAKE_STYLE = s === 'classic' ? 'classic' : 'new'; };
export function cakeSVG(design, candles = [], toppers = [], opts = {}) {
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
