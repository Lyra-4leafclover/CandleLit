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
  { id: 'pumpkin', name: 'Pumpkin Spice', rarity: 'seasonal', price: 280, shape: 'pillar', c1: '#fcd6ad', c2: '#f0a464', drip: '#fde5ca', holder: 'wood', decor: ['leaves', 'twine'], accent: '#b5532a', available: isHalloween, season: 'Halloween' },
  { id: 'sakura', name: 'Sakura Branch', rarity: 'seasonal', price: 280, shape: 'taper', c1: '#fff1f5', c2: '#ffd3e0', drip: '#fff7f9', holder: 'ornate', hc: '#fdfaf6', decor: ['branch'], accent: '#f28cab', available: isSpring, season: 'Spring' },
];

export const CAKES = [
  { id: 'vanilla', name: 'Classic Vanilla', rarity: 'common', price: 0, tiers: [{ w: 300, h: 110, c: '#fff4dc' }], piping: '#ffffff', deco: 'none', plate: '#f3ede4' },
  { id: 'strawberry', name: 'Strawberry Shortcake', rarity: 'common', price: 180, tiers: [{ w: 300, h: 115, c: '#ffe0e6' }], piping: '#ffffff', drip: '#ff4d6d', deco: 'strawberries', plate: '#ffffff' },
  { id: 'chocolate', name: 'Chocolate Drip', rarity: 'common', price: 220, tiers: [{ w: 300, h: 120, c: '#8a4b2a' }], piping: '#f4d9b8', drip: '#3b1d0f', deco: 'none', plate: '#f0e6d8' },
  { id: 'heart', name: 'Vintage Heart (Lambeth)', rarity: 'rare', price: 420, tiers: [{ w: 310, h: 120, c: '#ffb3c7' }], piping: '#ff5c8a', piping2: '#ffffff', deco: 'bows', plate: '#ffe6ee', lambeth: true },
  { id: 'funfetti', name: 'Rainbow Funfetti', rarity: 'rare', price: 380, tiers: [{ w: 300, h: 80, c: '#ffffff' }, { w: 220, h: 70, c: '#fff6fb' }], piping: '#b9dff0', deco: 'confetti', plate: '#e8f7ff' },
  { id: 'matcha', name: 'Matcha Tier', rarity: 'rare', price: 450, tiers: [{ w: 300, h: 85, c: '#b7d89a' }, { w: 210, h: 75, c: '#d9edc5' }], piping: '#fffbea', drip: '#6f9a4a', deco: 'none', plate: '#f4f1e6' },
  { id: 'royal', name: 'Royal Gold Tier', rarity: 'legendary', price: 1100, tiers: [{ w: 320, h: 80, c: '#e4def7' }, { w: 240, h: 70, c: '#efeafb' }, { w: 160, h: 60, c: '#e4def7' }], piping: '#d8ad5e', piping2: '#ffffff', deco: 'gold', plate: '#f3ead8', lambeth: true },
  { id: 'halloween', name: 'Halloween Drip', rarity: 'seasonal', price: 500, tiers: [{ w: 300, h: 90, c: '#5b4a66' }, { w: 210, h: 70, c: '#f6a35c' }], piping: '#fff3e0', drip: '#4a3a55', deco: 'bats', plate: '#efe6dc', available: isHalloween, season: 'Halloween' },
  { id: 'blossom', name: 'Cherry Blossom Tier', rarity: 'seasonal', price: 500, tiers: [{ w: 300, h: 90, c: '#ffeef4' }, { w: 210, h: 75, c: '#ffd3e2' }], piping: '#ffffff', deco: 'blossoms', plate: '#ffffff', available: isSpring, season: 'Spring' },
  { id: 'finals', name: 'Finals Week Survival', rarity: 'seasonal', price: 450, tiers: [{ w: 300, h: 100, c: '#d9c7a7' }], piping: '#6b4226', drip: '#4a2c17', deco: 'finals', plate: '#cfd8e3', available: isFinals, season: 'Finals season' },
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
  shapes: ['taper', 'pillar', 'spiral'],
  holders: ['glass', 'wood', 'ceramic', 'brass', 'ornate'],
  decors: ['none', 'heart', 'bow', 'pearls', 'roses', 'moon', 'butterflies', 'blossoms', 'lavender', 'strawberries'],
  patterns: ['solid', 'stripes', 'spiral', 'polka', 'ombre', 'sparkle'],
  scents: ['Vanilla Bean', 'Old Library', 'Rain on Stone', 'Burnt Sugar', 'Fig & Cedar', 'Midnight Espresso', 'Pink Peppercorn', 'Strawberry Milk'],
};

export const AMBIENCE = [
  { id: 'crackle', label: 'Fire crackle' },
  { id: 'rain', label: 'Rain' },
  { id: 'cafe', label: 'Café' },
  { id: 'lofi', label: 'Lo-fi' },
];

export const DEFAULT_SUBJECTS = ['General', 'Math', 'Chem', 'Essay', 'Reading', 'Coding'];
