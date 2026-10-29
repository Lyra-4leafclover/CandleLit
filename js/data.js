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
  { id: 'classic', name: 'Vanilla Ribbon Pillar', rarity: 'common', price: 0, shape: 'painted', art: 'p3classic', shape0: 'pillar', c1: '#fff8ea', c2: '#f1dfc0', drip: '#fffaf0', holder: 'wood', decor: ['ribbon'], accent: '#e7a8b8' },
  { id: 'striped', name: 'Watercolor Heart', rarity: 'common', price: 0, shape: 'painted', art: 'p3striped', shape0: 'pillar', c1: '#fbe1e8', c2: '#efb6c6', drip: '#fdeaf0', holder: 'wood', decor: ['heart'], accent: '#d9668a' },
  { id: 'pearl', name: 'Pearl & Bow Taper', rarity: 'common', price: 80, shape: 'painted', art: 'p3pearl', shape0: 'taper', c1: '#fde9ec', c2: '#f5c9d2', drip: '#fff2f4', holder: 'glass', decor: ['pearls', 'bow'], accent: '#ef9fb2' },
  { id: 'lavender', name: 'Lavender Fields', rarity: 'common', price: 120, shape: 'painted', art: 'p3lavender', shape0: 'pillar', c1: '#efe8fc', c2: '#d4c4f1', drip: '#f6f1fe', holder: 'ceramic', hc: '#f7f3ea', decor: ['lavender', 'twine'], accent: '#9b7fd6' },
  { id: 'strawberry', name: 'Strawberry Milk', rarity: 'common', price: 140, shape: 'painted', art: 'p3strawberry', shape0: 'pillar', c1: '#fff3f4', c2: '#ffd0d8', drip: '#fff7f8', holder: 'ceramic', hc: '#ffe6ea', decor: ['strawberries'], accent: '#ee5d6c' },
  { id: 'spiral', name: 'Twisted Sorbet', rarity: 'rare', price: 220, shape: 'painted', art: 'p3spiral', shape0: 'spiral', c1: '#dcf3ec', c2: '#bfe6dc', c3: '#f7bccd', drip: '#eefaf6', holder: 'brass', decor: [], accent: '#f29db7' },
  { id: 'rosestick', name: 'Rose Candlestick', rarity: 'rare', price: 300, shape: 'painted', art: 'p3rosestick', shape0: 'taper', c1: '#fff5e4', c2: '#f2ddbb', drip: '#fff9ee', holder: 'ornate', hc: '#eaa9b6', holderFlowers: true, decor: ['roses', 'vine'], accent: '#c9466b' },
  { id: 'teacup', name: 'Teatime Teacup', rarity: 'rare', price: 320, shape: 'painted', art: 'p3teacup', shape0: 'teacup', c1: '#fff6e8', c2: '#f6e3c4', drip: '#fff8ee', hc: '#ffffff', decor: ['blossoms'], accent: '#8fb4e3' },
  { id: 'moon', name: 'Moon & Stars', rarity: 'rare', price: 360, shape: 'painted', art: 'p3moon', shape0: 'taper', c1: '#cfd2f5', c2: '#9ea5e3', drip: '#e2e5fb', holder: 'brass', decor: ['moon'], accent: '#e7c46f' },
  { id: 'butterfly', name: 'Butterfly Dream', rarity: 'legendary', price: 650, shape: 'painted', art: 'p3butterfly', shape0: 'taper', c1: '#f5ecff', c2: '#dbc9f6', drip: '#faf5ff', holder: 'ornate', hc: '#f6f0e6', decor: ['butterflies'], accent: '#b48be8' },
  { id: 'garden', name: 'Secret Garden Jar', rarity: 'legendary', price: 720, shape: 'painted', art: 'p3garden', shape0: 'jar', c1: '#fffaf0', c2: '#f4e6cc', drip: '#fffdf6', decor: ['pressed'], accent: '#e98aa5' },
  { id: 'cherub', name: "Cherub's Wish", rarity: 'legendary', price: 800, shape: 'painted', art: 'p3cherub', shape0: 'pillar', c1: '#fffaf4', c2: '#f3e5d4', drip: '#fffdf9', holder: 'ceramic', hc: '#fdf3e3', decor: ['wings', 'pearls'], topper: 'cherub', accent: '#e2b65c' },
  { id: 'faeriewing', name: 'Faerie Glow Taper', collection: 'Faerie', rarity: 'rare', price: 340, shape: 'painted', art: 'p3faeriewing', shape0: 'taper', c1: '#e9f7ef', c2: '#d7c9f3', drip: '#f6f2ff', holder: 'ornate', hc: '#f3ead6', decor: ['fairywings', 'glow'], accent: '#a98be0', drop: true },
  { id: 'faeriemush', name: 'Mushroom Ring Pillar', collection: 'Faerie', rarity: 'rare', price: 300, shape: 'painted', art: 'p3faeriemush', shape0: 'pillar', c1: '#fbf3e4', c2: '#e9dcc0', drip: '#fffaf0', holder: 'wood', decor: ['mushrooms', 'glow'], accent: '#e5484d' },
  { id: 'faerietoad', name: 'Enchanted Toadstool', collection: 'Faerie', rarity: 'legendary', price: 760, shape: 'painted', art: 'p3faerietoad', shape0: 'toadstool', c1: '#fdf4e6', c2: '#ecdcc2', drip: '#fff6ea', accent: '#e98a8f', drop: true },
  { id: 'faeriecrown', name: 'Faerie Queen', collection: 'Faerie', rarity: 'legendary', price: 760, shape: 'painted', art: 'p3faeriecrown', shape0: 'spiral', c1: '#f3ecff', c2: '#dcd0f7', c3: '#c8f0dc', drip: '#faf7ff', holder: 'ornate', hc: '#efe6d4', decor: ['fairywings', 'blossoms', 'glow'], accent: '#c79be8' },
  { id: 'mermaidscale', name: 'Mermaid Scales', collection: 'Mermaid', rarity: 'rare', price: 340, shape: 'painted', art: 'p3mermaidscale', shape0: 'pillar', c1: '#d6f3f1', c2: '#c9c6f2', drip: '#eefbfa', holder: 'ceramic', hc: '#e3f6f3', decor: ['scales', 'shells'], accent: '#6cc7c1', drop: true },
  { id: 'mermaidtail', name: 'Siren Tail Taper', collection: 'Mermaid', rarity: 'legendary', price: 680, shape: 'painted', art: 'p3mermaidtail', shape0: 'taper', c1: '#c8f1ee', c2: '#9fd8e6', drip: '#e6fbfa', holder: 'glass', decor: ['scales', 'tailfin', 'pearls'], accent: '#7a8fe6' },
  { id: 'seashell', name: 'Seashell Pearl Pillar', collection: 'Mermaid', rarity: 'common', price: 160, shape: 'painted', art: 'p3seashell', shape0: 'pillar', c1: '#fff1ee', c2: '#f8d8d4', drip: '#fff7f5', holder: 'ceramic', hc: '#fdf0ec', decor: ['shells', 'pearls'], accent: '#e8a9b4' },
  { id: 'carvedrose', name: 'Carved Rose Pillar', collection: 'Carved', rarity: 'rare', price: 380, shape: 'painted', art: 'p3carvedrose', shape0: 'pillar', c1: '#f6c9d4', c2: '#e79cb0', drip: '#fbe3ea', holder: 'wood', decor: ['carvedrose'], accent: '#c9466b' },
  { id: 'carveddamask', name: 'Carved Damask Taper', collection: 'Carved', rarity: 'rare', price: 320, shape: 'painted', art: 'p3carveddamask', shape0: 'taper', c1: '#fbf4e6', c2: '#efdfc0', drip: '#fffaf0', holder: 'ornate', hc: '#f1e3c4', decor: ['carveddamask'], accent: '#d8ad5e' },
  { id: 'carvedmoon', name: 'Carved Celestial', collection: 'Carved', rarity: 'legendary', price: 700, shape: 'painted', art: 'p3carvedmoon', shape0: 'pillar', c1: '#c3c8ef', c2: '#8f97d8', drip: '#dde0fa', holder: 'brass', decor: ['carvedmoon'], accent: '#e7c46f' },
  { id: 'honeycomb', name: 'Honeycomb Beeswax', collection: 'Cottage', rarity: 'common', price: 150, shape: 'painted', art: 'p3honeycomb', shape0: 'pillar', c1: '#fbe3a0', c2: '#f1c35c', drip: '#fdeec4', holder: 'wood', decor: ['honeycomb'], accent: '#d9952b' },
  { id: 'daisy', name: 'Cottagecore Daisy', collection: 'Cottage', rarity: 'common', price: 130, shape: 'painted', art: 'p3daisy', shape0: 'pillar', c1: '#fff8dc', c2: '#f7e7a8', drip: '#fffbea', holder: 'wood', decor: ['daisies', 'twine'], accent: '#f6c343' },
  { id: 'quartz', name: 'Rose Quartz Crystal', collection: 'Crystal', rarity: 'rare', price: 360, shape: 'painted', art: 'p3quartz', shape0: 'pillar', c1: '#fde4ea', c2: '#f4c1cf', drip: '#fff0f3', holder: 'ceramic', hc: '#fbeef1', decor: ['crystals'], accent: '#ee9ab2' },
  { id: 'swan', name: 'Swan Lake Taper', collection: 'Ballet', rarity: 'rare', price: 300, shape: 'painted', art: 'p3swan', shape0: 'taper', c1: '#ffffff', c2: '#ece8f2', drip: '#ffffff', holder: 'glass', decor: ['feathers', 'pearls', 'bow'], accent: '#f2b8c8' },
  { id: 'nebula', name: 'Nebula Taper', collection: 'Celestial', rarity: 'legendary', price: 720, shape: 'painted', art: 'p3nebula', shape0: 'taper', c1: '#4a3a8a', c2: '#241c4f', drip: '#7a68c8', holder: 'brass', decor: ['nebula'], accent: '#f29de0' },
  { id: 'cloudnine', name: 'Cloud Nine Pillar', collection: 'Celestial', rarity: 'common', price: 140, shape: 'painted', art: 'p3cloudnine', shape0: 'pillar', c1: '#e3f1fb', c2: '#c7e2f5', drip: '#f2f9fe', holder: 'ceramic', hc: '#eef6fc', decor: ['clouds'], accent: '#9fc9ea' },
  { id: 'pumpkinshape', name: 'Little Pumpkin', collection: 'Shaped', rarity: 'rare', price: 320, shape: 'painted', art: 'p3pumpkinshape', shape0: 'pumpkin', c1: '#f7a25a', c2: '#d9661f', drip: '#fff7ea', accent: '#e07a45', drop: true },
  { id: 'shellshape', name: 'Pearl Seashell', collection: 'Shaped', rarity: 'rare', price: 340, shape: 'painted', art: 'p3shellshape', shape0: 'seashell', c1: '#ffd9dc', c2: '#f29fae', drip: '#fff6f2', accent: '#e8a9b4', drop: true },
  { id: 'tamashape', name: 'Tamagotchi', collection: 'Shaped', rarity: 'legendary', price: 700, shape: 'painted', art: 'p3tamashape', shape0: 'tamagotchi', c1: '#d9ccfa', c2: '#b5a2ef', drip: '#ede6fd', accent: '#f6a6c1', drop: true },
  { id: 'paintpumpkin', name: 'Painted Pumpkin', collection: 'Shaped', rarity: 'rare', price: 360, shape: 'painted', art: 'pumpkin', c1: '#f7a25a', c2: '#d9661f', drip: '#ffd9a8', accent: '#e07a45', drop: true },
  { id: 'paintscallop', name: 'Pink Scallop', collection: 'Mermaid', rarity: 'rare', price: 380, shape: 'painted', art: 'scallop', c1: '#ffd9dc', c2: '#f29fae', drip: '#ffe6ea', accent: '#e8a9b4', drop: true },
  { id: 'paintclam', name: 'Pearl Clam', collection: 'Mermaid', rarity: 'rare', price: 520, shape: 'painted', art: 'clam', c1: '#e6e0fb', c2: '#b9b2ec', drip: '#fffaf2', accent: '#b49ce8', drop: true },
  { id: 'paintconch', name: 'Peach Conch', collection: 'Mermaid', rarity: 'rare', price: 480, shape: 'painted', art: 'conch', c1: '#ffd8c0', c2: '#f3a98a', drip: '#ffe4d2', accent: '#f08a8a', drop: true },
  { id: 'paintabalone', name: 'Abalone Tide Pool', collection: 'Mermaid', rarity: 'legendary', price: 760, shape: 'painted', art: 'abalone', c1: '#cdeee3', c2: '#9fd9c8', drip: '#dff5ee', accent: '#7fd1c7', drop: true },
  { id: 'bunnywish', name: "Bunny's Garden", collection: 'Figurines', rarity: 'legendary', price: 780, shape: 'painted', art: 'p3bunnywish', shape0: 'pillar', c1: '#fff6f8', c2: '#fbdbe4', drip: '#fffafb', holder: 'ceramic', hc: '#fdf0f3', decor: ['blossoms', 'pearls'], topper: 'bunny', accent: '#f4a6b9' },
  { id: 'kittywish', name: 'Princess Kitty', collection: 'Figurines', rarity: 'legendary', price: 780, shape: 'painted', art: 'p3kittywish', shape0: 'pillar', c1: '#f3effc', c2: '#ddd3f5', drip: '#faf8ff', holder: 'ceramic', hc: '#f5f1fb', decor: ['bow', 'pearls'], topper: 'kitty', accent: '#c4a6ec' },
  { id: 'swanwish', name: 'Swan Princess', collection: 'Figurines', rarity: 'legendary', price: 820, shape: 'painted', art: 'p3swanwish', shape0: 'pillar', c1: '#ffffff', c2: '#eceaf3', drip: '#ffffff', holder: 'glass', decor: ['feathers', 'pearls'], topper: 'swan', accent: '#e8c3d2' },
  { id: 'teddywish', name: 'Teddy Picnic', collection: 'Figurines', rarity: 'legendary', price: 760, shape: 'painted', art: 'p3teddywish', shape0: 'pillar', c1: '#fff1e2', c2: '#f3d6b6', pattern: 'gingham', drip: '#fff7ee', holder: 'wood', decor: ['strawberries'], topper: 'teddy', accent: '#f28fae' },
  { id: 'frogwish', name: 'Froggy Pond', collection: 'Figurines', rarity: 'legendary', price: 760, shape: 'painted', art: 'p3frogwish', shape0: 'pillar', c1: '#e6f5df', c2: '#c4e3b6', drip: '#f2faee', holder: 'ceramic', hc: '#eef7ea', decor: ['daisies'], topper: 'froggy', accent: '#8cc77a' },
  { id: 'fairywish', name: 'Moon Fairy', collection: 'Figurines', rarity: 'legendary', price: 840, shape: 'painted', art: 'p3fairywish', shape0: 'taper', c1: '#e9e6fb', c2: '#c9c3f1', drip: '#f5f3fe', holder: 'ornate', hc: '#f3ecdc', decor: ['moon', 'glow'], topper: 'fairy', accent: '#b49ce8' },
  { id: 'mermaidwish', name: 'Little Mermaid', collection: 'Figurines', rarity: 'legendary', price: 840, shape: 'painted', art: 'p3mermaidwish', shape0: 'pillar', c1: '#dff5f2', c2: '#bfe3ea', drip: '#f0fbfa', holder: 'ceramic', hc: '#e8f7f5', decor: ['shells', 'pearls'], topper: 'mermaid', accent: '#7fd1c7' },
  { id: 'pumpkin', name: 'Pumpkin Spice', rarity: 'seasonal', price: 280, shape: 'painted', art: 'p3pumpkin', shape0: 'pillar', c1: '#fcd6ad', c2: '#f0a464', drip: '#fde5ca', holder: 'wood', decor: ['leaves', 'twine'], accent: '#b5532a', available: isHalloween, season: 'Halloween' },
  { id: 'sakura', name: 'Sakura Branch', rarity: 'seasonal', price: 280, shape: 'painted', art: 'p3sakura', shape0: 'taper', c1: '#fff1f5', c2: '#ffd3e0', drip: '#fff7f9', holder: 'ornate', hc: '#fdfaf6', decor: ['branch'], accent: '#f28cab', available: isSpring, season: 'Spring' },
  { id: 'gothrose', name: 'Midnight Rose Taper', collection: 'Gothic', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6gothrose', shape0: 'taper', c1: '#2a2228', c2: '#141014', drip: '#7a1f2e', holder: 'ornate', hc: '#c9c4cf', decor: ['roses'], accent: '#7a1f2e' },
  { id: 'gothskull', name: 'Crescent Noir Pillar', collection: 'Gothic', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6gothskull', shape0: 'pillar', c1: '#2a2430', c2: '#121016', drip: '#3a3340', holder: 'ceramic', decor: ['moon'], accent: '#cfc8d8' },
  { id: 'emoheart', name: 'Broken Heart Stripe', collection: 'Emo', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6emoheart', shape0: 'pillar', pattern: 'stripes', c1: '#1a1418', c2: '#ff5fa2', drip: '#ff9cc8', holder: 'ceramic', decor: ['heart'], accent: '#ff5fa2' },
  { id: 'emostar', name: 'Starry Spike Taper', collection: 'Emo', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6emostar', shape0: 'taper', pattern: 'stars', c1: '#1a1418', c2: '#ffb3d6', drip: '#3a2a34', holder: 'brass', decor: [], accent: '#ffb3d6' },
  { id: 'hallowghost', name: 'Little Ghost', collection: 'Halloween', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6hallowghost', shape0: 'pillar', c1: '#ffffff', c2: '#eef0f4', drip: '#ffffff', holder: 'ceramic', decor: [], accent: '#f6a5bc' },
  { id: 'hallowcat', name: 'Black Cat Pillar', collection: 'Halloween', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6hallowcat', shape0: 'pillar', pattern: 'ombre', c1: '#f6a35c', c2: '#2a2028', drip: '#ffcf9a', holder: 'wood', decor: ['moon'], accent: '#2a2028' },
  { id: 'xmastree', name: 'Little Fir Tree', collection: 'Christmas', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6xmastree', shape0: 'pillar', pattern: 'sparkle', c1: '#4f9e58', c2: '#d4af37', drip: '#9fd8a8', holder: 'wood', decor: [], accent: '#d4af37' },
  { id: 'xmascane', name: 'Candy Cane Taper', collection: 'Christmas', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6xmascane', shape0: 'taper', pattern: 'spiral', c1: '#ffffff', c2: '#d43b3b', drip: '#ffffff', holder: 'brass', decor: [], accent: '#2f6b3a' },
  { id: 'cottagemush', name: 'Wildflower Meadow', collection: 'Cottagecore', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6cottagemush', shape0: 'pillar', c1: '#fdf3e2', c2: '#f1dfc4', drip: '#fff8ec', holder: 'wood', decor: ['mushrooms', 'daisies'], accent: '#d9534f' },
  { id: 'cottagejar', name: 'Mason Jar Candle', collection: 'Cottagecore', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6cottagejar', shape0: 'jar', c1: '#fdf6ec', c2: '#f1e6d4', drip: '#fffaf2', decor: [], accent: '#9cc48a' },
  { id: 'gamerpad', name: 'Pastel Controller', collection: 'Gamer', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6gamerpad', shape0: 'pillar', pattern: 'controller', c1: '#e8dcff', c2: '#ff7ab6', c3: '#a58cf0', drip: '#f3edff', holder: 'ceramic', decor: [], accent: '#7affc1' },
  { id: 'gamerrgb', name: 'RGB Glow Pillar', collection: 'Gamer', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6gamerrgb', shape0: 'pillar', pattern: 'rgb', c1: '#ff7ab6', c2: '#6fe3ff', c3: '#7affc1', drip: '#ffffff', holder: 'glass', decor: [], accent: '#b48cff' },
  { id: 'mcgrass', name: 'Grass Block', collection: 'Minecraft', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6mcgrass', shape0: 'pillar', pattern: 'checker', c1: '#7a5232', c2: '#8a5f3c', drip: '#62b445', holder: 'wood', decor: [], accent: '#5aa83c' },
  { id: 'mctnt', name: 'TNT Block', collection: 'Minecraft', rarity: 'rare', price: 300, drop: true, shape: 'painted', art: 'p6mctnt', shape0: 'pillar', pattern: 'checker', c1: '#d43b3b', c2: '#b52e2e', drip: '#ffffff', holder: 'ceramic', decor: [], accent: '#ffffff' },
  { id: 'gothlace', name: 'Black Lace Taper', collection: 'Gothic', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7gothlace', shape0: 'taper', c1: '#5a1f2e', c2: '#2a0f16', drip: '#1a1418', holder: 'ornate', hc: '#2a2228', decor: [], accent: '#c9c4cf' },
  { id: 'gothbat', name: 'Silver Bat Pillar', collection: 'Gothic', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7gothbat', shape0: 'pillar', pattern: 'stars', c1: '#1c1820', c2: '#c9c4cf', drip: '#3a3340', holder: 'ceramic', decor: ['moon'], accent: '#c9c4cf' },
  { id: 'emoskull', name: 'Pink Skull Pillar', collection: 'Emo', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7emoskull', shape0: 'pillar', pattern: 'checker', c1: '#ff5fa2', c2: '#1a1418', drip: '#1a1418', holder: 'ceramic', decor: [], accent: '#1a1418' },
  { id: 'emoplaid', name: 'Tartan Pin Pillar', collection: 'Emo', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7emoplaid', shape0: 'pillar', pattern: 'gingham', c1: '#b5262e', c2: '#1a1418', drip: '#7a1f2e', holder: 'ceramic', decor: [], accent: '#c9c4cf' },
  { id: 'hallowpump', name: 'Jack-o-Lantern', collection: 'Halloween', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7hallowpump', shape0: 'pumpkin', c1: '#f39a4a', c2: '#d9661f', drip: '#ffd9a8', decor: [], accent: '#5b7a3a' },
  { id: 'hallowwitch', name: 'Witchy Spiral Taper', collection: 'Halloween', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7hallowwitch', shape0: 'taper', pattern: 'spiral', c1: '#7a4ab8', c2: '#1a1418', drip: '#b58ae0', holder: 'brass', decor: [], accent: '#ffd76a' },
  { id: 'xmasgnome', name: 'Christmas Gnome', collection: 'Christmas', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7xmasgnome', shape0: 'pillar', pattern: 'ombre', c1: '#d43b3b', c2: '#ffffff', drip: '#ffffff', holder: 'wood', decor: [], accent: '#ffffff' },
  { id: 'xmassnow', name: 'Snowflake Pillar', collection: 'Christmas', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7xmassnow', shape0: 'pillar', pattern: 'sparkle', c1: '#ffffff', c2: '#8ab8e8', drip: '#ffffff', holder: 'ceramic', decor: ['bow'], accent: '#d43b3b' },
  { id: 'cottagebee', name: 'Honey Bee Pillar', collection: 'Cottagecore', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7cottagebee', shape0: 'pillar', pattern: 'honeycomb', c1: '#f6c445', c2: '#e0a020', drip: '#ffe28a', holder: 'wood', decor: ['honeycomb', 'daisies'], accent: '#3a2a1a' },
  { id: 'cottagestraw', name: 'Strawberry Candle', collection: 'Cottagecore', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7cottagestraw', shape0: 'pillar', pattern: 'strawberry', c1: '#ffd6dc', c2: '#ef5f6e', drip: '#ffe6ea', holder: 'ceramic', decor: [], accent: '#5a9a4f' },
  { id: 'gamerpixel', name: 'Pixel Heart Pillar', collection: 'Gamer', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7gamerpixel', shape0: 'pillar', pattern: 'pixelheart', c1: '#fff6fb', c2: '#ff7ab6', c3: '#b48cff', drip: '#ffffff', holder: 'ceramic', decor: [], accent: '#ff7ab6' },
  { id: 'gamerconsole', name: 'Pocket Console', collection: 'Gamer', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7gamerconsole', shape0: 'pillar', pattern: 'controller', c1: '#bff0dc', c2: '#ff7ab6', c3: '#2a2340', drip: '#e2fbf1', holder: 'ceramic', decor: [], accent: '#ff7ab6' },
  { id: 'mcdiamond', name: 'Diamond Ore Block', collection: 'Minecraft', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7mcdiamond', shape0: 'pillar', pattern: 'checker', c1: '#8a8a8a', c2: '#6fe3ff', drip: '#cfd4d8', holder: 'ceramic', decor: [], accent: '#6fe3ff' },
  { id: 'mccreeper', name: 'Creeper Block', collection: 'Minecraft', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7mccreeper', shape0: 'pillar', pattern: 'checker', c1: '#4f9e38', c2: '#367a28', drip: '#62b445', holder: 'wood', decor: [], accent: '#1a1418' },
  { id: 'chessking', name: 'King Piece', collection: 'Chess', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7chessking', shape0: 'pillar', c1: '#f6efe2', c2: '#e2d6c2', drip: '#fffaf2', holder: 'wood', decor: ['crystals'], accent: '#1a1418' },
  { id: 'chessboard', name: 'Checkmate Pillar', collection: 'Chess', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7chessboard', shape0: 'pillar', pattern: 'checker', c1: '#f6efe2', c2: '#1a1418', drip: '#fffaf2', holder: 'wood', decor: [], accent: '#1a1418' },
  { id: 'soccerball', name: 'Soccer Ball', collection: 'Soccer', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7soccerball', shape0: 'pillar', pattern: 'soccer', c1: '#ffffff', c2: '#1a1418', drip: '#ffffff', holder: 'ceramic', decor: [], accent: '#1a1418' },
  { id: 'soccerpitch', name: 'Pitch Pillar', collection: 'Soccer', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7soccerpitch', shape0: 'pillar', pattern: 'pitch', c1: '#4f9e38', c2: '#ffffff', drip: '#9fd88a', holder: 'ceramic', decor: [], accent: '#ffffff' },
  { id: 'bball', name: 'Basketball', collection: 'Basketball', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7bball', shape0: 'pillar', pattern: 'basketball', c1: '#f08a2c', c2: '#2a1a10', drip: '#ffc48a', holder: 'ceramic', decor: [], accent: '#2a1a10' },
  { id: 'bbhoop', name: 'Hoop Stripe Taper', collection: 'Basketball', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7bbhoop', shape0: 'taper', pattern: 'stripes', c1: '#ffffff', c2: '#f08a2c', drip: '#ffd9b0', holder: 'brass', decor: [], accent: '#1a1418' },
  { id: 'tennisball', name: 'Tennis Ball', collection: 'Tennis', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7tennisball', shape0: 'pillar', pattern: 'tennis', c1: '#d8ec4a', c2: '#ffffff', drip: '#f2fbb0', holder: 'ceramic', decor: [], accent: '#ffffff' },
  { id: 'tennisracket', name: 'Court Pillar', collection: 'Tennis', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7tennisracket', shape0: 'pillar', pattern: 'pitch', c1: '#9fd8c0', c2: '#ffffff', drip: '#e2f6ec', holder: 'ceramic', decor: [], accent: '#d8ec4a' },
  { id: 'baseball', name: 'Baseball', collection: 'Baseball', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7baseball', shape0: 'pillar', pattern: 'baseball', c1: '#ffffff', c2: '#d43b3b', drip: '#ffffff', holder: 'ceramic', decor: [], accent: '#d43b3b' },
  { id: 'baseballbat', name: 'Home Run Pillar', collection: 'Baseball', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7baseballbat', shape0: 'pillar', pattern: 'baseball', c1: '#f6ead6', c2: '#d43b3b', drip: '#fffaf2', holder: 'wood', decor: [], accent: '#8a5f3c' },
  { id: 'volleyball', name: 'Volleyball', collection: 'Volleyball', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7volleyball', shape0: 'pillar', pattern: 'volleyball', c1: '#ffffff', c2: '#2f6fd4', c3: '#f6c445', drip: '#ffffff', holder: 'ceramic', decor: [], accent: '#f6c445' },
  { id: 'volleybeach', name: 'Beach Net Pillar', collection: 'Volleyball', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7volleybeach', shape0: 'pillar', pattern: 'waves', c1: '#f3e2c4', c2: '#7ac8e8', drip: '#fff6e6', holder: 'ceramic', decor: ['shells'], accent: '#7ac8e8' },
  { id: 'golfball', name: 'Golf Ball', collection: 'Golf', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7golfball', shape0: 'pillar', pattern: 'golf', c1: '#ffffff', c2: '#d8d8d8', drip: '#ffffff', holder: 'wood', decor: [], accent: '#4f9e38' },
  { id: 'golfflag', name: 'Fairway Pillar', collection: 'Golf', rarity: 'rare', price: 320, drop: true, shape: 'painted', art: 'p7golfflag', shape0: 'pillar', pattern: 'ombre', c1: '#7ac85a', c2: '#3f8a2e', drip: '#b8e6a0', holder: 'ceramic', decor: [], accent: '#d43b3b' },
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
  { id: 'gothic', name: 'Gothic Rose Cake', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 118, c: '#2a2228' }], piping: '#141014', pipe: 'shell', drip: '#7a1f2e', deco: 'none', plate: '#e9e4ea' },
  { id: 'emo', name: 'Emo Checker Cake', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 118, c: '#ff8cc0' }], piping: '#1a1418', pipe: 'shell', drip: '#1a1418', deco: 'none', plate: '#f3eef2' },
  { id: 'halloween2', name: 'Pastel Spooky Cake', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 118, c: '#f6b071' }], piping: '#9a7ac8', pipe: 'rosette', drip: '#8a5ab8', deco: 'none', plate: '#efe6dc' },
  { id: 'christmas', name: 'Christmas Holly Cake', rarity: 'rare', price: 400, tiers: [{ w: 300, h: 90, c: '#ffffff' }, { w: 210, h: 70, c: '#fdf6ee' }], piping: '#c43b3b', pipe: 'shell', deco: 'strawberries', plate: '#f3ead8' },
  { id: 'cottagecore', name: 'Cottagecore Meadow Cake', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 118, c: '#fdf3e2' }], piping: '#ffffff', pipe: 'rosette', deco: 'strawberries', plate: '#ffffff' },
  { id: 'gamer', name: 'Pastel Gamer Cake', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 118, c: '#c9b6ff' }], piping: '#7affc1', pipe: 'shell', deco: 'confetti', plate: '#f3f0fb' },
  { id: 'minecraft', name: 'Grass Block Cake', rarity: 'rare', price: 400, tiers: [{ w: 290, h: 118, c: '#7a5232' }], piping: '#5aa83c', pipe: 'shell', drip: '#5aa83c', deco: 'none', plate: '#f0f0f0' },
  { id: 'gothic2', name: 'Moonlit Lace Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#4a2a4e' }], piping: '#1a1418', pipe: 'shell', deco: 'none', plate: '#f3eee8', drip: '#1a1418' },
  { id: 'emo2', name: 'Tartan Rebel Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#1a1418' }], piping: '#ff5fa2', pipe: 'shell', deco: 'none', plate: '#f3eee8', drip: '#ff5fa2' },
  { id: 'halloween3', name: 'Witchy Brew Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#8fc46a' }], piping: '#7a4ab8', pipe: 'shell', deco: 'none', plate: '#f3eee8', drip: '#7a4ab8' },
  { id: 'christmas2', name: 'Gingerbread Snow Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#ffffff' }], piping: '#d43b3b', pipe: 'rosette', deco: 'none', plate: '#f3eee8' },
  { id: 'cottagecore2', name: 'Honeybee Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#f6c445' }], piping: '#ffffff', pipe: 'rosette', deco: 'none', plate: '#f3eee8', drip: '#e0a020' },
  { id: 'gamer2', name: 'Pixel Console Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#bff0dc' }], piping: '#ff7ab6', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'minecraft2', name: 'Diamond Ore Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#8a8a8a' }], piping: '#6fe3ff', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'chess', name: 'Checkmate Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#f6efe2' }], piping: '#1a1418', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'soccer', name: 'Soccer Pitch Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#4f9e38' }], piping: '#ffffff', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'basketball', name: 'Basketball Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#f08a2c' }], piping: '#2a1a10', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'tennis', name: 'Tennis Court Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#9fd8c0' }], piping: '#ffffff', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'baseball', name: 'Baseball Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#ffffff' }], piping: '#d43b3b', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'volleyball', name: 'Volleyball Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#f3e2c4' }], piping: '#2f6fd4', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
  { id: 'golf', name: 'Golf Green Cake', rarity: 'rare', price: 420, tiers: [{ w: 290, h: 118, c: '#7ac85a' }], piping: '#ffffff', pipe: 'shell', deco: 'none', plate: '#f3eee8' },
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
  shapes: ['taper', 'pillar', 'spiral', 'jar', 'teacup', 'pumpkin', 'seashell', 'tamagotchi', 'toadstool'],
  holders: ['glass', 'wood', 'ceramic', 'brass', 'ornate'],
  decors: ['none', 'heart', 'bow', 'pearls', 'roses', 'moon', 'butterflies', 'blossoms', 'lavender', 'strawberries', 'fairywings', 'mushrooms', 'scales', 'shells', 'carvedrose', 'carveddamask', 'honeycomb', 'crystals', 'daisies', 'clouds', 'nebula'],
  patterns: ['solid', 'stripes', 'spiral', 'polka', 'ombre', 'sparkle', 'gingham', 'hearts', 'checker', 'leopard', 'cow', 'waves', 'stars', 'argyle', 'strawberry', 'tiedye', 'scallop', 'marble', 'lace', 'floral'],
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
