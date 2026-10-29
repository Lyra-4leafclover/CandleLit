/* Illustrated backdrops for the Bakery cake card. */
const flower = (x, y, s, c, mid = '#ffe08a') => `<g transform="translate(${x},${y}) scale(${s})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cy="-5" rx="3.6" ry="5.2" fill="${c}" transform="rotate(${r})"/>`).join('')}<circle r="2.3" fill="${mid}"/></g>`;
const hydrangea = (x, y, s, c) => { let o = ''; for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 3 + (i % 5) * 3.2; o += flower((Math.cos(a) * r).toFixed(1), (Math.sin(a) * r * 0.8).toFixed(1), 0.42, i % 3 ? c : '#ffffff', '#fff'); } return `<g transform="translate(${x},${y}) scale(${s})">${o}</g>`; };
const leaf = (x, y, r, s = 1, c = '#9cc48a') => `<path transform="translate(${x},${y}) rotate(${r}) scale(${s})" d="M0 0 C6 -8 18 -8 24 0 C18 8 6 8 0 0Z" fill="${c}"/>`;
const rose = (x, y, s, c) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="9" fill="${c}"/><path d="M-5 -1 C-4 -6 4 -6 5 -1 C5 4 -1 5 -2 2 C-3 0 -1 -2 1 -1" stroke="rgba(0,0,0,.18)" stroke-width="1.2" fill="none"/><circle cx="-3" cy="-4" r="2.4" fill="#fff" opacity=".3"/></g>`;
const lights = (y0, w, n, sag) => { let o = `<path d="M0 ${y0} Q${w / 2} ${y0 + sag} ${w} ${y0}" stroke="#7a6a5a" stroke-width="1" fill="none" opacity=".6"/>`; for (let i = 1; i < n; i++) { const t = i / n, x = t * w, y = y0 + 4 * sag * t * (1 - t) / 2 * 2 / 2 * 2; o += `<circle cx="${x.toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="9" fill="#fff3c4" opacity=".35"/><ellipse class="twinkle" style="animation-delay:${(i * 0.37) % 2}s" cx="${x.toFixed(1)}" cy="${(y + 4).toFixed(1)}" rx="3" ry="4" fill="#ffe7a0"/>`; } return o; };
const stars = (n, w, h, seed = 7) => { let o = '', a = seed; const r = () => ((a = (a * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < n; i++) o += `<circle class="twinkle" style="animation-delay:${(r() * 3).toFixed(2)}s" cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(0.6 + r() * 1.3).toFixed(1)}" fill="#fff"/>`; return o; };

const SCENES = {
  gingham: () => `<defs><pattern id="sg-g" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fffaf6"/><rect width="20" height="40" fill="#f7c9d6" opacity=".45"/><rect width="40" height="20" fill="#f7c9d6" opacity=".45"/></pattern><radialGradient id="sg-v" cx=".5" cy=".4" r=".75"><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#f3d9e0" stop-opacity=".7"/></radialGradient></defs>
    <rect width="600" height="700" fill="url(#sg-g)"/><rect width="600" height="700" fill="url(#sg-v)"/>
    ${[[60, 90, '#f6a5bc'], [530, 140, '#f9d77e'], [80, 600, '#c7b6f2'], [520, 610, '#f6a5bc'], [300, 60, '#fff']].map(([x, y, c]) => flower(x, y, 2.2, c)).join('')}
    ${leaf(40, 120, -30, 1.6)}${leaf(560, 170, 200, 1.5)}${leaf(110, 630, 20, 1.5)}`,
  window: () => `<defs><linearGradient id="sw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd5c7"/><stop offset=".55" stop-color="#f9e6d6"/><stop offset="1" stop-color="#e9ecf7"/></linearGradient><linearGradient id="sw-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf1e6"/><stop offset="1" stop-color="#f3e3d2"/></linearGradient><linearGradient id="sw-cur" x1="0" x2="1"><stop offset="0" stop-color="#fbe3ea"/><stop offset=".5" stop-color="#fff6f8"/><stop offset="1" stop-color="#f7d6e0"/></linearGradient><linearGradient id="sw-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d2bd"/><stop offset="1" stop-color="#d9bba2"/></linearGradient></defs>
    <rect width="600" height="700" fill="url(#sw-wall)"/>
    <path d="M120 470 V200 A180 180 0 0 1 480 200 V470Z" fill="url(#sw-sky)"/>
    <circle cx="390" cy="230" r="42" fill="#fff4dc" opacity=".9"/><circle cx="390" cy="230" r="80" fill="#fff4dc" opacity=".25"/>
    <path d="M150 400 q40 -40 80 -10 q30 -30 70 0 q40 -35 80 -5 q35 -25 70 10 V470 H150Z" fill="#cfe0c4" opacity=".9"/><path d="M120 430 q60 -30 120 0 q60 -25 120 0 q60 -30 120 5 V470 H120Z" fill="#b9d3ad"/>
    <path d="M120 470 V200 A180 180 0 0 1 480 200 V470" fill="none" stroke="#fffaf3" stroke-width="16"/><path d="M300 22 V470 M120 300 H480" stroke="#fffaf3" stroke-width="9"/>
    <path d="M70 0 C120 120 80 300 150 470 L60 470 C40 300 50 120 30 0Z" fill="url(#sw-cur)"/><path d="M530 0 C480 120 520 300 450 470 L540 470 C560 300 550 120 570 0Z" fill="url(#sw-cur)"/>
    <path d="M90 300 q30 10 50 -6" stroke="#e8a9bc" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M510 300 q-30 10 -50 -6" stroke="#e8a9bc" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${lights(14, 600, 13, 70)}
    <rect x="100" y="466" width="400" height="16" rx="6" fill="#fffaf3"/>
    <g transform="translate(160,466)"><path d="M-18 0 L-14 -26 H14 L18 0Z" fill="#e8b4a0"/>${leaf(0, -26, -120, 1.3, '#8fbf7f')}${leaf(0, -26, -60, 1.3, '#a7cf95')}${leaf(0, -26, -95, 1.5, '#7fb06e')}</g>
    <g transform="translate(440,466)"><rect x="-14" y="-30" width="28" height="30" rx="5" fill="#cfe3f0"/>${flower(-6, -40, 1.3, '#f6a5bc')}${flower(7, -46, 1.1, '#fff')}${flower(2, -34, 1, '#f9d77e')}</g>
    <path d="M0 540 H600 V700 H0Z" fill="url(#sw-table)"/><path d="M0 540 H600" stroke="#fffaf3" stroke-width="3" opacity=".6"/>
    <path d="M0 560 H600" stroke="#cfae94" stroke-width="1" opacity=".5"/>`,
  garden: () => `<defs><linearGradient id="sgd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f1fb"/><stop offset=".6" stop-color="#fdf3f0"/><stop offset="1" stop-color="#eef6e6"/></linearGradient><radialGradient id="sgd-sun" cx=".75" cy=".15" r=".5"><stop offset="0" stop-color="#fff7d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient><pattern id="sgd-blanket" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="skewX(-25)"><rect width="36" height="36" fill="#fff"/><rect width="18" height="36" fill="#f4a9bd" opacity=".5"/><rect width="36" height="18" fill="#f4a9bd" opacity=".5"/></pattern></defs>
    <rect width="600" height="700" fill="url(#sgd-sky)"/><rect width="600" height="700" fill="url(#sgd-sun)"/>
    ${[[480, 90, 60], [540, 160, 30], [430, 170, 22], [80, 120, 18]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".35"/>`).join('')}
    <path d="M0 470 q150 -60 300 -10 q150 -50 300 0 V700 H0Z" fill="#cfe5bf"/><path d="M0 520 q200 -40 400 0 q120 20 200 0 V700 H0Z" fill="#bcdcab"/>
    <path d="M90 520 V160 A210 210 0 0 1 510 160 V520" fill="none" stroke="#fffaf3" stroke-width="12"/><path d="M90 520 V160 A210 210 0 0 1 510 160 V520" fill="none" stroke="#e9dccb" stroke-width="2" stroke-dasharray="2 14" transform="translate(0,4)"/>
    ${Array.from({ length: 18 }, (_, i) => { const a = Math.PI + (i / 17) * Math.PI; const x = 300 + Math.cos(a) * 210, y = 160 + Math.sin(a) * 210; return leaf(x, y, (i * 47) % 360, 1.2, i % 2 ? '#9cc48a' : '#b6d6a2') + rose(x + 6, y + 4, 1.1 + (i % 3) * 0.25, ['#f6a5bc', '#fbd0dc', '#e98aa5', '#fff1f4'][i % 4]); }).join('')}
    ${[[80, 160], [86, 260], [92, 360], [520, 170], [514, 280], [508, 380]].map(([x, y], i) => leaf(x, y, i < 3 ? 160 : 20, 1.3) + rose(x + (i < 3 ? 6 : -6), y + 10, 1.2, i % 2 ? '#fbd0dc' : '#f6a5bc')).join('')}
    ${hydrangea(60, 560, 2.2, '#c7d2f6')}${hydrangea(545, 570, 2.2, '#e3c9f2')}${hydrangea(110, 610, 1.6, '#f6c9d9')}
    <path d="M60 650 L200 560 L560 600 L470 700 L40 700Z" fill="url(#sgd-blanket)" opacity=".9"/>
    ${[[150, 230, '#f6a5bc'], [440, 110, '#c7b6f2'], [380, 300, '#9fd3e6']].map(([x, y, c]) => `<g transform="translate(${x},${y})"><path d="M0 0 C-8 -14 -20 -10 -16 -2 C-14 3 -6 3 0 0Z M0 0 C8 -14 20 -10 16 -2 C14 3 6 3 0 0Z" fill="${c}"/><rect x="-1" y="-6" width="2" height="10" rx="1" fill="#6a5a5a"/></g>`).join('')}`,
  night: () => `<defs><linearGradient id="sn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b3f"/><stop offset=".6" stop-color="#3b2f63"/><stop offset="1" stop-color="#6a4a7a"/></linearGradient><linearGradient id="sn-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2440"/><stop offset="1" stop-color="#3a2c48"/></linearGradient><radialGradient id="sn-glow" cx=".5" cy=".72" r=".55"><stop offset="0" stop-color="#ffc98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffc98a" stop-opacity="0"/></radialGradient><radialGradient id="sn-moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8dc" stop-opacity=".55"/><stop offset="1" stop-color="#fff8dc" stop-opacity="0"/></radialGradient></defs>
    <rect width="600" height="700" fill="url(#sn-wall)"/>
    <path d="M110 470 V210 A190 190 0 0 1 490 210 V470Z" fill="url(#sn-sky)"/>${stars(60, 600, 460)}
    <circle cx="380" cy="170" r="110" fill="url(#sn-moon)"/><mask id="sn-cres"><rect x="300" y="90" width="160" height="160" fill="#fff"/><circle cx="398" cy="156" r="34" fill="#000"/></mask><circle cx="380" cy="170" r="38" fill="#fff6d6" mask="url(#sn-cres)"/>
    <path d="M110 420 q80 -30 150 -5 q70 -40 140 -10 q50 -15 90 5 V470 H110Z" fill="#2a2348" opacity=".9"/>
    <path d="M110 470 V210 A190 190 0 0 1 490 210 V470" fill="none" stroke="#4a3d63" stroke-width="16"/><path d="M300 22 V470 M110 310 H490" stroke="#4a3d63" stroke-width="8"/>
    ${lights(18, 600, 14, 80)}
    <rect width="600" height="700" fill="url(#sn-glow)"/>
    <rect x="80" y="466" width="440" height="16" rx="6" fill="#55456e"/>
    <g transform="translate(150,466)"><rect x="-26" y="-12" width="52" height="12" rx="2" fill="#c9a6e8"/><rect x="-22" y="-23" width="46" height="11" rx="2" fill="#f2a6c0"/><rect x="-24" y="-33" width="44" height="10" rx="2" fill="#9fd3e6"/></g>
    <g transform="translate(455,466)"><rect x="-7" y="-34" width="14" height="34" rx="3" fill="#fff1e2"/><ellipse cy="-46" rx="5" ry="9" fill="#ffd27a"/><circle cy="-44" r="26" fill="#ffd27a" opacity=".18"/></g>
    <path d="M0 540 H600 V700 H0Z" fill="#2f2540"/><path d="M0 540 H600" stroke="#6a5a85" stroke-width="2" opacity=".6"/>`,
};

export function sceneSVG(name) {
  const f = SCENES[name];
  return f ? `<svg class="scene-bg" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${f()}</svg>` : '';
}
