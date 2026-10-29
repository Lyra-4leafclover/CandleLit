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
  common: { label: 'Common', color: '#e8d9b5' },
  rare: { label: 'Rare', color: '#7fd1ff' },
  legendary: { label: 'Legendary', color: '#ffb84d' },
  seasonal: { label: 'Limited', color: '#ff7ab6' },
  custom: { label: 'Studio', color: '#c59bff' },
};

export const CANDLES = [
  { id: 'classic', name: 'Classic Ivory Taper', rarity: 'common', price: 0, pattern: 'solid', c1: '#f6ecd6', c2: '#e6d3ad', drip: '#fff6e4' },
  { id: 'striped', name: 'Striped Birthday', rarity: 'common', price: 0, pattern: 'stripes', c1: '#ffffff', c2: '#ff5f8f', drip: '#ffe0ea' },
  { id: 'polka', name: 'Pastel Polka', rarity: 'common', price: 60, pattern: 'polka', c1: '#c9f0e4', c2: '#ff9ec7', drip: '#e9fff8' },
  { id: 'butter', name: 'Buttercream Swirl', rarity: 'common', price: 80, pattern: 'spiral', c1: '#fff1b8', c2: '#ffffff', drip: '#fffbe6' },
  { id: 'ombre', name: 'Twisted Sunset Ombré', rarity: 'rare', price: 220, pattern: 'ombre-twist', c1: '#ff6f61', c2: '#ffd36e', c3: '#b05cff', drip: '#ffc7a8' },
  { id: 'marble', name: 'Gilded Marble', rarity: 'rare', price: 260, pattern: 'marble', c1: '#fbf8f2', c2: '#d4a537', drip: '#ffffff' },
  { id: 'rose', name: 'Rose Garden', rarity: 'rare', price: 300, pattern: 'floral', c1: '#ffd6e0', c2: '#e0245e', c3: '#3f8f4f', drip: '#ffe8ee' },
  { id: 'lace', name: 'Pearl & Lace', rarity: 'rare', price: 340, pattern: 'lace', c1: '#f3e9ff', c2: '#ffffff', drip: '#ffffff' },
  { id: 'disco', name: 'Disco Ball', rarity: 'legendary', price: 650, pattern: 'disco', c1: '#c9ced6', c2: '#ffffff', drip: '#e6e9ee' },
  { id: 'cherub', name: 'Burning Cherub', rarity: 'legendary', price: 800, pattern: 'cherub', c1: '#fff4f0', c2: '#f2c14e', drip: '#fff9f5', topper: 'cherub' },
  { id: 'galaxy', name: 'Midnight Galaxy', rarity: 'legendary', price: 720, pattern: 'galaxy', c1: '#1b0b3a', c2: '#7a3cff', c3: '#ff5fd2', drip: '#6b4bd6' },
  { id: 'geode', name: 'Amethyst Geode', rarity: 'legendary', price: 900, pattern: 'geode', c1: '#8e44ad', c2: '#d7b4ff', c3: '#4a1a6b', drip: '#c8a2ff' },
  { id: 'pumpkin', name: 'Jack-o’-Lantern', rarity: 'seasonal', price: 280, pattern: 'pumpkin', c1: '#ff8a1f', c2: '#c25700', drip: '#ffb15c', available: isHalloween, season: 'Halloween' },
  { id: 'sakura', name: 'Sakura Petal', rarity: 'seasonal', price: 280, pattern: 'sakura', c1: '#ffe3ec', c2: '#ff8fb3', drip: '#fff0f5', available: isSpring, season: 'Spring' },
];

export const CAKES = [
  { id: 'vanilla', name: 'Classic Vanilla', rarity: 'common', price: 0, tiers: [{ w: 300, h: 110, c: '#fff4dc' }], piping: '#ffffff', deco: 'none', plate: '#e9e2f5' },
  { id: 'strawberry', name: 'Strawberry Shortcake', rarity: 'common', price: 180, tiers: [{ w: 300, h: 115, c: '#ffe0e6' }], piping: '#ffffff', drip: '#ff4d6d', deco: 'strawberries', plate: '#ffffff' },
  { id: 'chocolate', name: 'Chocolate Drip', rarity: 'common', price: 220, tiers: [{ w: 300, h: 120, c: '#8a4b2a' }], piping: '#f4d9b8', drip: '#3b1d0f', deco: 'none', plate: '#f0e6d8' },
  { id: 'heart', name: 'Vintage Heart (Lambeth)', rarity: 'rare', price: 420, tiers: [{ w: 310, h: 120, c: '#ffb3c7' }], piping: '#ff5c8a', piping2: '#ffffff', deco: 'bows', plate: '#ffe6ee', lambeth: true },
  { id: 'funfetti', name: 'Rainbow Funfetti', rarity: 'rare', price: 380, tiers: [{ w: 300, h: 80, c: '#ffffff' }, { w: 220, h: 70, c: '#fff6fb' }], piping: '#7fd1ff', deco: 'confetti', plate: '#e8f7ff' },
  { id: 'matcha', name: 'Matcha Tier', rarity: 'rare', price: 450, tiers: [{ w: 300, h: 85, c: '#b7d89a' }, { w: 210, h: 75, c: '#d9edc5' }], piping: '#fffbea', drip: '#6f9a4a', deco: 'none', plate: '#f4f1e6' },
  { id: 'royal', name: 'Royal Gold Tier', rarity: 'legendary', price: 1100, tiers: [{ w: 320, h: 80, c: '#2b1640' }, { w: 240, h: 70, c: '#3d1f5c' }, { w: 160, h: 60, c: '#2b1640' }], piping: '#e8b84a', piping2: '#fff1c2', deco: 'gold', plate: '#e8b84a', lambeth: true },
  { id: 'halloween', name: 'Halloween Drip', rarity: 'seasonal', price: 500, tiers: [{ w: 300, h: 90, c: '#2a1a33' }, { w: 210, h: 70, c: '#ff7a1a' }], piping: '#a6ff4d', drip: '#7cff3a', deco: 'bats', plate: '#3a2a44', available: isHalloween, season: 'Halloween' },
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
