
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
    default: return `<linearGradient id="${P}" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2 || c1}"/></linearGradient>`;
  }
}

const KMUL = { birthday: 0.78, taper: 1, pillar: 1.15 };
const SHAPES = { taper: { w: 30, h: 200 }, spiral: { w: 30, h: 200 }, pillar: { w: 74, h: 130 }, jar: { w: 84, h: 96 }, teacup: { w: 96, h: 50 } };
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
  if (d.topper === 'cherub' && shape === 'pillar') { topper = cherubMarkup(wickBase); wickTop = wickBase - 40; }
  const wick = topper ? `<path d="M0 ${wickBase - 33} q1.5 -4 0 -8" stroke="#3a2a22" stroke-width="1.6" fill="none"/>` : `<path d="M0 ${wickBase} q1.6 -4.5 0 -9" stroke="#3a2a22" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
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
  return { w: S.w, h, holderH: hold.h, holderW: hold.hw, extraTop: d.topper === 'cherub' ? 40 : 0 };
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
export function cakeSVG(design, candles = [], toppers = [], opts = {}) {
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
