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

const px = (x, y, n, m, sz, cols, seed = 3) => { let o = '', a = seed; const r = () => ((a = (a * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) o += `<rect x="${x + i * sz}" y="${y + j * sz}" width="${sz}" height="${sz}" fill="${cols[Math.floor(r() * cols.length)]}"/>`; return o; };
const bat = (x, y, s) => `<path transform="translate(${x},${y}) scale(${s})" d="M0 0 C-4 -6 -10 -6 -14 -2 C-11 -2 -10 1 -12 3 C-8 1 -5 2 -4 5 C-2 2 0 2 0 2 C0 2 2 2 4 5 C5 2 8 1 12 3 C10 1 11 -2 14 -2 C10 -6 4 -6 0 0Z" fill="#2a2140"/>`;
const pumpkin = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse rx="22" ry="17" fill="#f39a4a"/><ellipse rx="11" ry="17" fill="#f7aa5e"/><path d="M0 -17 q2 -8 7 -10" stroke="#5b7a3a" stroke-width="3" fill="none"/></g>`;
const heart = (x, y, s, c) => `<path transform="translate(${x},${y}) scale(${s})" d="M0 4 C-6 -2 -10 -6 -6 -10 C-3 -12 0 -10 0 -7 C0 -10 3 -12 6 -10 C10 -6 6 -2 0 4Z" fill="${c}"/>`;
const star5 = (x, y, s, c) => `<path transform="translate(${x},${y}) scale(${s})" d="M0 -10 L2.9 -3.1 10 -3.1 4.3 1.3 6.5 8.5 0 4.2 -6.5 8.5 -4.3 1.3 -10 -3.1 -2.9 -3.1Z" fill="${c}"/>`;
const bauble = (x, y, c) => `<line x1="${x}" y1="${y - 22}" x2="${x}" y2="${y - 8}" stroke="#c9a24a"/><circle cx="${x}" cy="${y}" r="9" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="2.5" fill="#fff" opacity=".6"/>`;
Object.assign(SCENES, {
  gothic: () => `<defs><linearGradient id="sgo-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1f2e"/><stop offset="1" stop-color="#140f18"/></linearGradient><linearGradient id="sgo-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2d52"/><stop offset="1" stop-color="#7a4a6a"/></linearGradient></defs>
    <rect width="600" height="700" fill="url(#sgo-w)"/>
    <path d="M150 470 V190 Q150 60 300 30 Q450 60 450 190 V470Z" fill="url(#sgo-s)"/>${stars(40, 600, 300, 11)}<circle cx="370" cy="150" r="34" fill="#f4ecdc" opacity=".9"/>
    <path d="M150 470 V190 Q150 60 300 30 Q450 60 450 190 V470" fill="none" stroke="#4a3a4e" stroke-width="14"/><path d="M300 30 V470 M150 260 H450" stroke="#4a3a4e" stroke-width="7"/>
    <path d="M40 0 C90 140 60 320 130 470 L40 470Z" fill="#0d0a10" opacity=".85"/><path d="M560 0 C510 140 540 320 470 470 L560 470Z" fill="#0d0a10" opacity=".85"/>
    ${[[70, 470], [530, 470]].map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-4" y="-80" width="8" height="80" fill="#b9b2c4"/><path d="M-30 -80 h60" stroke="#b9b2c4" stroke-width="5"/>${[-30, 0, 30].map((dx) => `<rect x="${dx - 4}" y="-112" width="8" height="30" fill="#1b1520"/><ellipse cx="${dx}" cy="-122" rx="4" ry="8" fill="#ffcf7a"/><circle cx="${dx}" cy="-120" r="16" fill="#ffcf7a" opacity=".18"/>`).join('')}</g>`).join('')}
    <path d="M0 540 H600 V700 H0Z" fill="#1c1420"/>${[[60, 600], [540, 610], [110, 650], [490, 660]].map(([x, y]) => rose(x, y, 2, '#7a1f2e')).join('')}`,
  emo: () => `<defs><pattern id="sem-c" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#1a1418"/><rect width="30" height="30" fill="#f472b6" opacity=".35"/><rect x="30" y="30" width="30" height="30" fill="#f472b6" opacity=".35"/></pattern></defs>
    <rect width="600" height="700" fill="url(#sem-c)"/><rect width="600" height="700" fill="#000" opacity=".25"/>
    ${lights(20, 600, 14, 60)}
    ${[[70, 140, 1.6], [520, 120, 1.3], [90, 420, 1.2], [510, 400, 1.7], [300, 80, 1]].map(([x, y, s], i) => (i % 2 ? heart(x, y, s * 2, '#ff5fa2') : star5(x, y, s * 2, '#ffd1e8'))).join('')}
    <rect x="30" y="200" width="110" height="150" rx="6" fill="#2b2229" stroke="#ff5fa2" stroke-width="3" transform="rotate(-6 85 275)"/><rect x="460" y="190" width="110" height="150" rx="6" fill="#2b2229" stroke="#ffd1e8" stroke-width="3" transform="rotate(5 515 265)"/>
    <path d="M0 560 H600 V700 H0Z" fill="#141014"/><path d="M0 560 H600" stroke="#ff5fa2" stroke-width="3" opacity=".7"/>`,
  halloween2: () => `<defs><linearGradient id="sh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a63"/><stop offset=".7" stop-color="#8a5a9a"/><stop offset="1" stop-color="#f3a96a"/></linearGradient></defs>
    <rect width="600" height="700" fill="url(#sh2)"/>${stars(40, 600, 380, 5)}<circle cx="460" cy="130" r="70" fill="#fff1d0"/><circle cx="460" cy="130" r="110" fill="#fff1d0" opacity=".15"/>
    ${[[120, 120, 1.6], [200, 170, 1.1], [520, 260, 1.3], [80, 300, 1]].map(([x, y, s]) => bat(x, y, s * 1.8)).join('')}
    <path d="M0 520 q150 -50 300 -10 q150 -40 300 0 V700 H0Z" fill="#3b2a4a"/><g transform="translate(470,500)"><rect x="-30" y="-50" width="60" height="50" fill="#2a1f36"/><path d="M-38 -50 L0 -85 L38 -50Z" fill="#2a1f36"/><rect x="-8" y="-38" width="10" height="12" fill="#ffcf7a"/></g>
    ${[[80, 620, 1.6], [150, 650, 1.1], [520, 630, 1.5], [450, 665, 1]].map(([x, y, s]) => pumpkin(x, y, s)).join('')}`,
  christmas: () => `<defs><linearGradient id="sxw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e2a2f"/><stop offset="1" stop-color="#6b1f24"/></linearGradient><linearGradient id="sxs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a6a"/><stop offset="1" stop-color="#6c86b8"/></linearGradient></defs>
    <rect width="600" height="700" fill="url(#sxw)"/><rect x="170" y="80" width="260" height="300" rx="12" fill="url(#sxs)"/>${stars(30, 600, 380, 9).replace(/class="twinkle"/g, 'class="twinkle" ').replace(/fill="#fff[^"]*"/g, 'fill="#ffffff"')}
    <path d="M170 360 q60 -20 130 0 q70 -20 130 0 V380 H170Z" fill="#f4f7fb"/><rect x="170" y="80" width="260" height="300" rx="12" fill="none" stroke="#f6efe2" stroke-width="12"/><path d="M300 80 V380 M170 230 H430" stroke="#f6efe2" stroke-width="6"/>
    <path d="M0 40 Q150 110 300 40 T600 40" stroke="#2f6b3a" stroke-width="14" fill="none"/>${[60, 150, 240, 360, 450, 540].map((x, i) => bauble(x, 70 + (i % 2) * 14, ['#d4af37', '#e8e2d0', '#c43b3b'][i % 3])).join('')}
    <g transform="translate(70,540)"><path d="M0 -200 L55 -60 H-55Z M0 -150 L70 0 H-70Z" fill="#2f6b3a"/><rect x="-10" y="0" width="20" height="18" fill="#7a4a2a"/>${star5(0, -205, 1.4, '#ffd76a')}${[[-20, -90, '#c43b3b'], [25, -40, '#d4af37'], [-30, -20, '#e8e2d0'], [15, -120, '#c43b3b']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`).join('')}</g>
    <path d="M0 560 H600 V700 H0Z" fill="#5a3a2a"/><path d="M0 560 H600" stroke="#d4af37" stroke-width="2" opacity=".6"/>`,
  cottagecore: () => `<defs><linearGradient id="scc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcebf6"/><stop offset=".6" stop-color="#fbf1e2"/><stop offset="1" stop-color="#e6f0d2"/></linearGradient></defs>
    <rect width="600" height="700" fill="url(#scc)"/><circle cx="480" cy="110" r="50" fill="#fff6dc" opacity=".8"/>
    <path d="M0 430 q150 -50 300 -10 q150 -40 300 0 V700 H0Z" fill="#cfe2b5"/><g transform="translate(150,430)"><rect x="-40" y="-50" width="80" height="50" fill="#f3e6d2"/><path d="M-50 -50 L0 -90 L50 -50Z" fill="#c98b6a"/><rect x="-10" y="-30" width="20" height="30" fill="#8a6a4a"/><rect x="18" y="-40" width="14" height="12" fill="#bfe0f0"/></g>
    <path d="M0 500 q200 -30 400 0 q120 15 200 0 V700 H0Z" fill="#b9d79e"/>
    ${Array.from({ length: 26 }, (_, i) => flower(20 + (i * 97) % 580, 520 + (i * 53) % 170, 1.3, ['#f6a5bc', '#fff', '#f9d77e', '#c7b6f2'][i % 4])).join('')}
    ${[[70, 620], [530, 640]].map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-5" y="-18" width="10" height="18" fill="#f3e6d2"/><path d="M-18 -16 Q0 -36 18 -16Z" fill="#d9534f"/><circle cx="-6" cy="-24" r="2.5" fill="#fff"/><circle cx="6" cy="-21" r="2" fill="#fff"/></g>`).join('')}`,
  gamer: () => `<defs><linearGradient id="sgm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2340"/><stop offset="1" stop-color="#3a2a52"/></linearGradient><linearGradient id="sgr" x1="0" x2="1"><stop offset="0" stop-color="#ff7ab6"/><stop offset=".33" stop-color="#b48cff"/><stop offset=".66" stop-color="#6fe3ff"/><stop offset="1" stop-color="#7affc1"/></linearGradient></defs>
    <rect width="600" height="700" fill="url(#sgm)"/><rect x="0" y="36" width="600" height="6" fill="url(#sgr)" opacity=".9"/>
    <rect x="20" y="120" width="150" height="100" rx="10" fill="#151122" stroke="url(#sgr)" stroke-width="4"/><rect x="430" y="120" width="150" height="100" rx="10" fill="#151122" stroke="url(#sgr)" stroke-width="4"/>
    ${px(40, 140, 6, 4, 12, ['#ff7ab6', '#b48cff', '#6fe3ff', '#151122'], 7)}${px(450, 140, 6, 4, 12, ['#7affc1', '#6fe3ff', '#b48cff', '#151122'], 13)}
    ${[[80, 330], [520, 360], [300, 90]].map(([x, y], i) => heart(x, y, 2.4, ['#ff7ab6', '#7affc1', '#b48cff'][i])).join('')}
    <path d="M0 540 H600 V700 H0Z" fill="#1c1630"/><rect x="0" y="536" width="600" height="5" fill="url(#sgr)"/>
    <g transform="translate(90,610)"><rect x="-38" y="-16" width="76" height="34" rx="16" fill="#c9b6ff"/><circle cx="-18" cy="0" r="5" fill="#2a2340"/><circle cx="18" cy="-4" r="4" fill="#ff7ab6"/><circle cx="26" cy="4" r="4" fill="#7affc1"/></g>`,
  minecraft: () => `<rect width="600" height="700" fill="#8ec9f5"/>${px(60, 70, 8, 2, 16, ['#ffffff', '#f4f8fb'], 4)}${px(380, 120, 7, 2, 16, ['#ffffff', '#eef4f9'], 9)}<rect x="470" y="40" width="64" height="64" fill="#fff3a8"/>
    <g>${px(30, 260, 3, 3, 30, ['#3f8a2e', '#4f9e38', '#367a28'], 2)}<rect x="62" y="350" width="26" height="110" fill="#7a5a3a"/></g><g>${px(480, 280, 3, 3, 30, ['#3f8a2e', '#4f9e38', '#367a28'], 5)}<rect x="512" y="370" width="26" height="90" fill="#7a5a3a"/></g>
    ${px(0, 460, 20, 1, 30, ['#5aa83c', '#4f9e38', '#62b445'], 6)}${px(0, 490, 20, 7, 30, ['#8a5f3c', '#7a5232', '#94683f', '#6e4a2c'], 8)}`,
});

export function sceneSVG(name) {
  const f = SCENES[name];
  return f ? `<svg class="scene-bg" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${f()}</svg>` : '';
}
