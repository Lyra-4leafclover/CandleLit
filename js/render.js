import { KINDS } from './data.js';

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

function flameMarkup(blue, cls, id) {
  const outer = blue ? ['#2f7dff', '#8fd0ff'] : ['#ff5a1f', '#ffb347'];
  const inner = blue ? '#e9f7ff' : '#fff3b0';
  const glow = blue ? '#6fb8ff' : '#ffb347';
  return `<g class="flame ${cls}">
    <circle r="34" cy="-14" fill="url(#${id}g)" class="glow"/>
    <defs>
      <radialGradient id="${id}g"><stop offset="0" stop-color="${glow}" stop-opacity=".55"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}o" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${outer[0]}"/><stop offset="1" stop-color="${outer[1]}"/></linearGradient>
    </defs>
    <path class="outer" d="M0,-32 C11,-17 10,-4 0,0 C-10,-4 -11,-17 0,-32Z" fill="url(#${id}o)"/>
    <path class="inner" d="M0,-20 C5,-12 5,-4 0,-1 C-5,-4 -5,-12 0,-20Z" fill="${inner}"/>
    ${blue ? '' : '<ellipse cy="-2" rx="2.5" ry="3.5" fill="#3a6dff" opacity=".55"/>'}
  </g>`;
}

function cherubMarkup(y) {
  return `<g transform="translate(0,${y})">
    <ellipse cx="-8" cy="-14" rx="7" ry="4" fill="#fff" stroke="#e8d7c9" stroke-width=".6" transform="rotate(-25 -8 -14)"/>
    <ellipse cx="8" cy="-14" rx="7" ry="4" fill="#fff" stroke="#e8d7c9" stroke-width=".6" transform="rotate(25 8 -14)"/>
    <ellipse cy="-8" rx="6" ry="7" fill="#ffd9c2"/>
    <circle cy="-19" r="5.5" fill="#ffe1cc"/>
    <path d="M-5 -22 q2 -4 5 -3 q3 -2 5 2" stroke="#e7b44a" stroke-width="2" fill="none"/>
    <circle cx="-2" cy="-19" r=".7" fill="#5a3a2a"/><circle cx="2" cy="-19" r=".7" fill="#5a3a2a"/>
    <path d="M-1.5 -16.5 q1.5 1 3 0" stroke="#d26a6a" stroke-width=".7" fill="none"/>
  </g>`;
}

/** Returns SVG markup for a candle group with its base at (0,0). rem = fraction of wax remaining. */
export function candleGroup(d, kind, rem, opts = {}) {
  const K = KINDS[kind] || KINDS.taper;
  const { w, h } = K;
  const id = uid();
  const P = id + 'p';
  const r = Math.max(0, Math.min(1, rem));
  const bodyH = Math.max(h * r, 3);
  const top = -bodyH;
  const melt = 1 - r;
  const drip = d.drip || light(d.c1, 0.4);
  const ry = Math.max(2, w * 0.17);
  const R = rng(d.id + kind);

  let drips = '';
  const n = kind === 'pillar' ? 6 : 3;
  for (let i = 0; i < n; i++) {
    const dw = kind === 'pillar' ? 5 + R() * 4 : 2.6 + R() * 2;
    const side = i === 0 ? -1 : i === 1 ? 1 : 0;
    const x = side ? side * (w / 2 - dw / 2 + 0.8) : -w / 2 + dw + R() * (w - dw * 2);
    const len = Math.min(bodyH - 2, 3 + melt * h * (0.15 + R() * 0.45) + R() * 4);
    if (len > 1) drips += `<rect x="${(x - dw / 2).toFixed(1)}" y="${top}" width="${dw.toFixed(1)}" height="${len.toFixed(1)}" rx="${(dw / 2).toFixed(1)}" fill="${drip}"/><circle cx="${x.toFixed(1)}" cy="${(top + len - dw * 0.3).toFixed(1)}" r="${(dw * 0.62).toFixed(1)}" fill="${drip}"/>`;
  }

  let extras = '';
  if (d.pattern === 'lace') {
    [0.25, 0.62].forEach((f) => {
      const y = -h * f;
      if (y > top + 4) for (let x = -w / 2 + 2; x <= w / 2 - 1; x += 4) extras += `<circle cx="${x}" cy="${(y + Math.cos((x / w) * Math.PI) * 2).toFixed(1)}" r="1.7" fill="#fff" stroke="#e6dcf2" stroke-width=".4"/>`;
    });
  }
  if (d.pattern === 'disco' || d.pattern === 'sparkle' || d.pattern === 'galaxy') {
    for (let i = 0; i < (kind === 'pillar' ? 7 : 4); i++) {
      const x = (R() - 0.5) * (w - 6);
      const y = -R() * h;
      if (y > top + 5) extras += `<path class="twinkle" style="animation-delay:${(R() * 2).toFixed(2)}s" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" d="M0 -4L1 -1 4 0 1 1 0 4 -1 1 -4 0 -1 -1Z" fill="#fff"/>`;
    }
  }
  if (d.pattern === 'pumpkin' && bodyH > h * 0.55) {
    const fy = -h * 0.42;
    const s = w / 24;
    extras += `<g transform="translate(0,${fy}) scale(${s})" fill="#3a1600"><polygon points="-7,-4 -3,-4 -5,-8"/><polygon points="7,-4 3,-4 5,-8"/><path d="M-8 2 q8 7 16 0 l-3 1 -2 -2 -2 2 -2 -2 -2 2 -2-2z"/></g>`;
  }

  const shade = `<linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>`;
  const defs = `<defs>${patternDefs(d, P, h)}${shade}</defs>`;
  const puddle = `<ellipse cy="0" rx="${(w / 2 + melt * w * 0.9 + 2).toFixed(1)}" ry="${(3 + melt * 4).toFixed(1)}" fill="${drip}" opacity=".95"/>`;
  const body = `<rect x="${-w / 2}" y="${top}" width="${w}" height="${bodyH}" fill="url(#${P})"/>`
    + (d.pattern === 'ombre-twist' ? `<rect x="${-w / 2}" y="${top}" width="${w}" height="${bodyH}" fill="url(#${P}t)"/>` : '')
    + extras
    + `<rect x="${-w / 2}" y="${top}" width="${w}" height="${bodyH}" fill="url(#${id}s)"/>`;
  const pool = `<ellipse cy="${top}" rx="${w / 2}" ry="${ry}" fill="${drip}"/>${opts.lit ? `<ellipse cy="${top + 0.5}" rx="${w / 2 - 2.5}" ry="${ry * 0.6}" fill="${mix(drip, '#ffcf70', 0.35)}" opacity=".8"/>` : ''}`;

  let wickTop = top - 9;
  let topper = '';
  if (d.topper === 'cherub') {
    topper = cherubMarkup(top);
    wickTop = top - 32;
  }
  const wick = d.topper === 'cherub'
    ? `<path d="M0 ${top - 24} q1.5 -4 0 -8" stroke="#2b1d14" stroke-width="1.6" fill="none"/>`
    : `<path d="M0 ${top - ry * 0.2} q1.5 -4 0 -9" stroke="#2b1d14" stroke-width="1.6" fill="none"/>`;
  const flame = opts.lit ? `<g transform="translate(0,${wickTop + 1})">${flameMarkup(opts.blue, opts.agitated ? 'agitated' : '', id)}</g>` : '';
  const smoke = opts.smoke ? `<path class="smoke" d="M0 ${wickTop} c-6 -10 6 -16 0 -26 c-6 -10 6 -16 0 -26" stroke="#d8d0e0" stroke-width="2" fill="none" opacity=".7"/>` : '';

  return `${defs}<g class="candle">${puddle}${body}${drips}${pool}${topper}${wick}${flame}${smoke}</g>`;
}

export function candleSVG(d, kind, rem, opts = {}) {
  const K = KINDS[kind] || KINDS.taper;
  const W = Math.max(K.w * 3, 110);
  const H = K.h + 90;
  return `<svg class="${opts.cls || 'candle-svg'}" viewBox="${-W / 2} ${-H + 14} ${W} ${H}" preserveAspectRatio="xMidYMax meet">${candleGroup(d, kind, rem, opts)}</svg>`;
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
  const scaleFor = (k) => (k === 'pillar' ? 0.42 : k === 'taper' ? 0.42 : 0.62);
  const place = (list, rowY, spread) => list.forEach((c, k) => {
    const x = cx + (list.length === 1 ? 0 : (k / (list.length - 1) - 0.5) * spread);
    const cd = opts.getDesign(c.design);
    const rem = c.melted ? Math.max(0.12, c.remaining ?? 0.5) : 1;
    out += `<g transform="translate(${x.toFixed(1)},${rowY.toFixed(1)}) scale(${scaleFor(c.kind)})"><title>${c.subject || ''} · ${c.minutes} min${c.melted ? ' (blown out early)' : ''}</title>${candleGroup(cd, c.kind, rem, { lit: !c.melted && opts.lit !== false, blue: c.blue })}</g>`;
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
