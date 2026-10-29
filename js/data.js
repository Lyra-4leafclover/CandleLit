export const CAKE_SLOTS = 8;
export const STUDIO_COST = 25;

export const KINDS = {
  birthday: { label: 'Birthday candle', w: 16, h: 90, desc: 'short & sweet' },
  taper: { label: 'Taper candle', w: 24, h: 170, desc: 'steady focus' },
  pillar: { label: 'Pillar candle', w: 64, h: 140, desc: 'deep work' },
};

export const DURATIONS = [
  { minutes: 25, kind: 'birthday' },
  { minutes: 50, kind: 'taper' },
  { minutes: 90, kind: 'pillar' },
];

export function kindFor(minutes) {
  if (minutes <= 30) return 'birthday';
  if (minutes <= 60) return 'taper';
  return 'pillar';
}

const m = new Date().getMonth();
const isHalloween = m === 9 || m === 10;
const isSpring = m >= 2 && m <= 4;
const isFinals = m === 11 || m === 4 || m === 3;

export const RARITY = {
  common: { label: 'Common', color: '#eef0e6' },
  rare: { label: 'Rare', color: '#d6ebf3' },
  legendary: { label: 'Legendary', color: '#f8e7b5' },
  seasonal: { label: 'Limited', color: '#f9d9e6' },
  custom: { label: 'Studio', color: '#e3defb' },
};

export const CANDLES = [
  { id: 'classic', name: 'Vanilla Ribbon Pillar', rarity: 'common', price: 0, shape: 'pillar', c1: '#fff8ea', c2: '#f1dfc0', drip: '#fffaf0', holder: 'wood', decor: ['ribbon'], accent: '#e7a8b8' },
  { id: 'striped', name: 'Watercolor Heart', rarity: 'common', price: 0, shape: 'pillar', c1: '#fbe1e8', c2: '#efb6c6', drip: '#fdeaf0', holder: 'wood', decor: ['heart'], accent: '#d9668a' },
  { id: 'pearl', name: 'Pearl & Bow Taper', rarity: 'common', price: 80, shape: 'taper', c1: '#fde9ec', c2: '#f5c9d2', drip: '#fff2f4', holder: 'glass', decor: ['pearls', 'bow'], accent: '#ef9fb2' },
  { id: 'lavender', name: 'Lavender Fields', rarity: 'common', price: 120, shape: 'pillar', c1: '#efe8fc', c2: '#d4c4f1', drip: '#f6f1fe', holder: 'ceramic', hc: '#f7f3ea', decor: ['lavender', 'twine'], accent: '#9b7fd6' },
  { id: 'strawberry', name: 'Strawberry Milk', rarity: 'common', price: 140, shape: 'pillar', c1: '#fff3f4', c2: '#ffd0d8', drip: '#fff7f8', holder: 'ceramic', hc: '#ffe6ea', decor: ['strawberries'], accent: '#ee5d6c' },
  { id: 'spiral', name: 'Twisted Sorbet', rarity: 'rare', price: 220, shape: 'spiral', c1: '#dcf3ec', c2: '#bfe6dc', c3: '#f7bccd', drip: '#eefaf6', holder: 'brass', decor: [], accent: '#f29db7' },
  { id: 'rosestick', name: 'Rose Candlestick', rarity: 'rare', price: 300, shape: 'taper', c1: '#fff5e4', c2: '#f2ddbb', drip: '#fff9ee', holder: 'ornate', hc: '#eaa9b6', holderFlowers: true, decor: ['roses', 'vine'], accent: '#c9466b' },
  { id: 'teacup', name: 'Teatime Teacup', rarity: 'rare', price: 320, shape: 'teacup', c1: '#fff6e8', c2: '#f6e3c4', drip: '#fff8ee', hc: '#ffffff', decor: ['blossoms'], accent: '#8fb4e3' },
  { id: 'moon', name: 'Moon & Stars', rarity: 'rare', price: 360, shape: 'taper', c1: '#cfd2f5', c2: '#9ea5e3', drip: '#e2e5fb', holder: 'brass', decor: ['moon'], accent: '#e7c46f' },
  { id: 'butterfly', name: 'Butterfly Dream', rarity: 'legendary', price: 650, shape: 'taper', c1: '#f5ecff', c2: '#dbc9f6', drip: '#faf5ff', holder: 'ornate', hc: '#f6f0e6', decor: ['butterflies'], accent: '#b48be8' },
  { id: 'garden', name: 'Secret Garden Jar', rarity: 'legendary', price: 720, shape: 'jar', c1: '#fffaf0', c2: '#f4e6cc', drip: '#fffdf6', decor: ['pressed'], accent: '#e98aa5' },
  { id: 'cherub', name: "Cherub's Wish", rarity: 'legendary', price: 800, shape: 'pillar', c1: '#fffaf4', c2: '#f3e5d4', drip: '#fffdf9', holder: 'ceramic', hc: '#fdf3e3', decor: ['wings', 'pearls'], topper: 'cherub', accent: '#e2b65c' },
  { id: 'faeriewing', name: 'Faerie Glow Taper', collection: 'Faerie', rarity: 'rare', price: 340, shape: 'taper', c1: '#e9f7ef', c2: '#d7c9f3', drip: '#f6f2ff', holder: 'ornate', hc: '#f3ead6', decor: ['fairywings', 'glow'], accent: '#a98be0', drop: true },
  { id: 'faeriemush', name: 'Mushroom Ring Pillar', collection: 'Faerie', rarity: 'rare', price: 300, shape: 'pillar', c1: '#fbf3e4', c2: '#e9dcc0', drip: '#fffaf0', holder: 'wood', decor: ['mushrooms', 'glow'], accent: '#e5484d' },
  { id: 'faeriecrown', name: 'Faerie Queen', collection: 'Faerie', rarity: 'legendary', price: 760, shape: 'spiral', c1: '#f3ecff', c2: '#dcd0f7', c3: '#c8f0dc', drip: '#faf7ff', holder: 'ornate', hc: '#efe6d4', decor: ['fairywings', 'blossoms', 'glow'], accent: '#c79be8' },
  { id: 'mermaidscale', name: 'Mermaid Scales', collection: 'Mermaid', rarity: 'rare', price: 340, shape: 'pillar', c1: '#d6f3f1', c2: '#c9c6f2', drip: '#eefbfa', holder: 'ceramic', hc: '#e3f6f3', decor: ['scales', 'shells'], accent: '#6cc7c1', drop: true },
  { id: 'mermaidtail', name: 'Siren Tail Taper', collection: 'Mermaid', rarity: 'legendary', price: 680, shape: 'taper', c1: '#c8f1ee', c2: '#9fd8e6', drip: '#e6fbfa', holder: 'glass', decor: ['scales', 'tailfin', 'pearls'], accent: '#7a8fe6' },
  { id: 'seashell', name: 'Seashell Pearl Pillar', collection: 'Mermaid', rarity: 'common', price: 160, shape: 'pillar', c1: '#fff1ee', c2: '#f8d8d4', drip: '#fff7f5', holder: 'ceramic', hc: '#fdf0ec', decor: ['shells', 'pearls'], accent: '#e8a9b4' },
  { id: 'carvedrose', name: 'Carved Rose Pillar', collection: 'Carved', rarity: 'rare', price: 380, shape: 'pillar', c1: '#f6c9d4', c2: '#e79cb0', drip: '#fbe3ea', holder: 'wood', decor: ['carvedrose'], accent: '#c9466b' },
  { id: 'carveddamask', name: 'Carved Damask Taper', collection: 'Carved', rarity: 'rare', price: 320, shape: 'taper', c1: '#fbf4e6', c2: '#efdfc0', drip: '#fffaf0', holder: 'ornate', hc: '#f1e3c4', decor: ['carveddamask'], accent: '#d8ad5e' },
  { id: 'carvedmoon', name: 'Carved Celestial', collection: 'Carved', rarity: 'legendary', price: 700, shape: 'pillar', c1: '#c3c8ef', c2: '#8f97d8', drip: '#dde0fa', holder: 'brass', decor: ['carvedmoon'], accent: '#e7c46f' },
  { id: 'honeycomb', name: 'Honeycomb Beeswax', collection: 'Cottage', rarity: 'common', price: 150, shape: 'pillar', c1: '#fbe3a0', c2: '#f1c35c', drip: '#fdeec4', holder: 'wood', decor: ['honeycomb'], accent: '#d9952b' },
  { id: 'daisy', name: 'Cottagecore Daisy', collection: 'Cottage', rarity: 'common', price: 130, shape: 'pillar', c1: '#fff8dc', c2: '#f7e7a8', drip: '#fffbea', holder: 'wood', decor: ['daisies', 'twine'], accent: '#f6c343' },
  { id: 'quartz', name: 'Rose Quartz Crystal', collection: 'Crystal', rarity: 'rare', price: 360, shape: 'pillar', c1: '#fde4ea', c2: '#f4c1cf', drip: '#fff0f3', holder: 'ceramic', hc: '#fbeef1', decor: ['crystals'], accent: '#ee9ab2' },
  { id: 'swan', name: 'Swan Lake Taper', collection: 'Ballet', rarity: 'rare', price: 300, shape: 'taper', c1: '#ffffff', c2: '#ece8f2', drip: '#ffffff', holder: 'glass', decor: ['feathers', 'pearls', 'bow'], accent: '#f2b8c8' },
  { id: 'nebula', name: 'Nebula Taper', collection: 'Celestial', rarity: 'legendary', price: 720, shape: 'taper', c1: '#4a3a8a', c2: '#241c4f', drip: '#7a68c8', holder: 'brass', decor: ['nebula'], accent: '#f29de0' },
  { id: 'cloudnine', name: 'Cloud Nine Pillar', collection: 'Celestial', rarity: 'common', price: 140, shape: 'pillar', c1: '#e3f1fb', c2: '#c7e2f5', drip: '#f2f9fe', holder: 'ceramic', hc: '#eef6fc', decor: ['clouds'], accent: '#9fc9ea' },
  { id: 'pumpkin', name: 'Pumpkin Spice', rarity: 'seasonal', price: 280, shape: 'pillar', c1: '#fcd6ad', c2: '#f0a464', drip: '#fde5ca', holder: 'wood', decor: ['leaves', 'twine'], accent: '#b5532a', available: isHalloween, season: 'Halloween' },
  { id: 'sakura', name: 'Sakura Branch', rarity: 'seasonal', price: 280, shape: 'taper', c1: '#fff1f5', c2: '#ffd3e0', drip: '#fff7f9', holder: 'ornate', hc: '#fdfaf6', decor: ['branch'], accent: '#f28cab', available: isSpring, season: 'Spring' },
];

export const CAKES = [
  { id: 'vanilla', name: 'Classic Vanilla', rarity: 'common', price: 0, tiers: [{ w: 290, h: 115, c: '#fdf1dc' }], piping: '#ffffff', pipe: 'shell', deco: 'none', plate: '#f6efe6' },
  { id: 'peach', name: 'Peach Bow Cake', rarity: 'common', price: 160, tiers: [{ w: 290, h: 118, c: '#ffd9c6' }], piping: '#fff7f0', pipe: 'rosette', deco: 'bows', bow: '#f6a6b2', plate: '#ffffff' },
  { id: 'strawberry', name: 'Strawberry Shortcake', rarity: 'common', price: 180, tiers: [{ w: 290, h: 115, c: '#ffe3e8' }], piping: '#ffffff', pipe: 'rosette', drip: '#f26b80', deco: 'strawberries', plate: '#ffffff' },
  { id: 'chocolate', name: 'Chocolate Drip', rarity: 'common', price: 220, tiers: [{ w: 290, h: 120, c: '#a8704f' }], piping: '#f4dcc0', pipe: 'shell', drip: '#4a2a1a', deco: 'strawberries', plate: '#f0e6d8' },
  { id: 'heart', name: 'Vintage Heart (Lambeth)', rarity: 'rare', price: 420, tiers: [{ w: 300, h: 120, c: '#ffc2d2' }], piping: '#f27a9e', piping2: '#ffffff', pipe: 'shell', deco: 'bows', bow: '#ffffff', plate: '#fff0f4', lambeth: true },
  { id: 'berry', name: 'Blueberry Lemon Drip', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 115, c: '#fff1b8' }], piping: '#ffffff', pipe: 'rosette', drip: '#8a97e6', deco: 'berries', plate: '#eef1fb' },
  { id: 'funfetti', name: 'Rainbow Funfetti', rarity: 'rare', price: 380, tiers: [{ w: 300, h: 82, c: '#ffffff' }, { w: 216, h: 72, c: '#fff6fb' }], piping: '#b9dff0', pipe: 'pearl', deco: 'confetti', plate: '#e8f7ff' },
  { id: 'matcha', name: 'Matcha Tier', rarity: 'rare', price: 450, tiers: [{ w: 300, h: 85, c: '#c3dea8' }, { w: 210, h: 75, c: '#e0efcf' }], piping: '#fffbea', pipe: 'rosette', drip: '#7fa65a', deco: 'none', plate: '#f4f1e6' },
  { id: 'ruffle', name: 'Lavender Ruffle', rarity: 'rare', price: 480, tiers: [{ w: 300, h: 88, c: '#ddd3f5' }, { w: 212, h: 80, c: '#e9e2f9' }], piping: '#ffffff', pipe: 'ruffle', deco: 'none', plate: '#ffffff' },
  { id: 'royal', name: 'Royal Gold Tier', rarity: 'legendary', price: 1100, tiers: [{ w: 320, h: 80, c: '#e4def7' }, { w: 240, h: 70, c: '#efeafb' }, { w: 160, h: 60, c: '#e4def7' }], piping: '#d8ad5e', piping2: '#ffffff', pipe: 'pearl', deco: 'gold', plate: '#f3ead8', lambeth: true },
  { id: 'halloween', name: 'Halloween Drip', rarity: 'seasonal', price: 500, tiers: [{ w: 300, h: 90, c: '#5b4a66' }, { w: 210, h: 70, c: '#f6a35c' }], piping: '#fff3e0', pipe: 'shell', drip: '#3a2e44', deco: 'bats', plate: '#efe6dc', available: isHalloween, season: 'Halloween' },
  { id: 'blossom', name: 'Cherry Blossom Tier', rarity: 'seasonal', price: 500, tiers: [{ w: 300, h: 90, c: '#fff0f5' }, { w: 210, h: 75, c: '#ffd9e6' }], piping: '#ffffff', pipe: 'pearl', deco: 'blossoms', plate: '#ffffff', available: isSpring, season: 'Spring' },
  { id: 'finals', name: 'Finals Week Survival', rarity: 'seasonal', price: 450, tiers: [{ w: 290, h: 105, c: '#e2d2b4' }], piping: '#7a4e2e', pipe: 'shell', drip: '#5a3520', deco: 'finals', plate: '#dfe6ee', available: isFinals, season: 'Finals season' },
];

export const TOPPERS = [
  { id: 'sprinkles', name: 'Rainbow Sprinkles', price: 40 },
  { id: 'cherries', name: 'Glacé Cherries', price: 60 },
  { id: 'pearls', name: 'Sugar Pearls', price: 80 },
  { id: 'bows', name: 'Satin Bows', price: 90 },
  { id: 'goldleaf', name: 'Gold Leaf', price: 120 },
  { id: 'bunny', name: 'Mini Bunny Figurine', price: 110 },
  { id: 'frog', name: 'Mini Frog Figurine', price: 110 },
];

export const STUDIO = {
  shapes: ['taper', 'pillar', 'spiral', 'jar', 'teacup'],
  holders: ['glass', 'wood', 'ceramic', 'brass', 'ornate'],
  decors: ['none', 'heart', 'bow', 'pearls', 'roses', 'moon', 'butterflies', 'blossoms', 'lavender', 'strawberries', 'fairywings', 'mushrooms', 'scales', 'shells', 'carvedrose', 'carveddamask', 'honeycomb', 'crystals', 'daisies', 'clouds', 'nebula'],
  patterns: ['solid', 'stripes', 'spiral', 'polka', 'ombre', 'sparkle'],
  scents: ['Vanilla Bean', 'Old Library', 'Rain on Stone', 'Burnt Sugar', 'Fig & Cedar', 'Midnight Espresso', 'Pink Peppercorn', 'Strawberry Milk'],
};

export const AMBIENCE = [
  { id: 'crackle', label: 'Fire crackle' },
  { id: 'rain', label: 'Rain' },
  { id: 'cafe', label: 'Café' },
  { id: 'lofi', label: 'Lo-fi' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'thunder', label: 'Thunderstorm' },
  { id: 'library', label: 'Library' },
  { id: 'forest', label: 'Forest birds' },
];

export const DEFAULT_SUBJECTS = ['General', 'Math', 'Chem', 'Essay', 'Reading', 'Coding'];
