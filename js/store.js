import { CANDLES, CAKES, TOPPERS, CAKE_SLOTS, DEFAULT_SUBJECTS } from './data.js';

const KEY = 'candlelit-v1';

export const dayKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const newId = () => Math.random().toString(36).slice(2, 10);

function fresh() {
  return {
    flames: 120,
    wax: 15,
    owned: { candles: ['classic', 'striped'], cakes: ['vanilla'], toppers: [] },
    custom: [],
    cake: null,
    gallery: [],
    partyCakes: [],
    sculptures: [],
    sessions: [],
    tasks: [],
    subjects: [...DEFAULT_SUBJECTS],
    redeemed: [],
    name: '',
    settings: { volume: 0.5, ambience: [], demo: false, design: 'classic', cakeDesign: 'vanilla', minutes: 25, subject: 'General', breakMin: 5, taskId: null },
    active: null,
    pending: null,
  };
}

export const state = load();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw) {
      const base = fresh();
      return { ...base, ...raw, owned: { ...base.owned, ...raw.owned }, settings: { ...base.settings, ...raw.settings } };
    }
  } catch (e) { /* ignore corrupt storage */ }
  return fresh();
}

export function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetAll() {
  localStorage.removeItem(KEY);
  location.reload();
}

export const allCandles = () => [...CANDLES, ...state.custom];
export const getCandle = (id) => allCandles().find((c) => c.id === id) || CANDLES[0];
export const getCake = (id) => CAKES.find((c) => c.id === id) || CAKES[0];
export const getTopper = (id) => TOPPERS.find((t) => t.id === id);
export const ownsCandle = (id) => state.owned.candles.includes(id) || state.custom.some((c) => c.id === id);

export function streak() {
  const days = new Set(state.sessions.filter((s) => s.completed).map((s) => s.date));
  let d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const isBlue = () => streak() >= 7;

function newCake() {
  return { id: newId(), design: state.settings.cakeDesign, toppers: [], candles: [], started: dayKey() };
}

export function currentCake() {
  if (!state.cake) state.cake = newCake();
  return state.cake;
}

export function serveCake() {
  const cake = state.cake;
  if (!cake || !cake.candles.length) return null;
  cake.served = dayKey();
  state.gallery.unshift(cake);
  state.cake = newCake();
  save();
  return cake;
}

export function rolloverIfNewDay() {
  if (state.cake && state.cake.candles.length && state.cake.started !== dayKey()) serveCake();
}

export function addCandleToCake(candle) {
  rolloverIfNewDay();
  const cake = currentCake();
  cake.candles.push(candle);
  let served = null;
  if (cake.candles.length >= CAKE_SLOTS) served = serveCake();
  save();
  return { cake: served || cake, served: !!served };
}

export function spend(currency, amount) {
  if (state[currency] < amount) return false;
  state[currency] -= amount;
  save();
  return true;
}

export function weekStats(offsetWeeks = 0) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - offsetWeeks * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const inRange = (d) => {
    const t = new Date(d + 'T12:00:00');
    return t >= start && t < end;
  };
  const sessions = state.sessions.filter((s) => inRange(s.date));
  const done = sessions.filter((s) => s.completed);
  const subjects = {};
  done.forEach((s) => { subjects[s.subject] = (subjects[s.subject] || 0) + s.minutes; });
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const k = dayKey(d);
    return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), minutes: done.filter((s) => s.date === k).reduce((a, s) => a + s.minutes, 0) };
  });
  const cakes = state.gallery.filter((c) => inRange(c.served)).length;
  return {
    start, candles: done.length, melted: sessions.length - done.length,
    minutes: done.reduce((a, s) => a + s.minutes, 0),
    flames: done.reduce((a, s) => a + (s.flames || 0), 0),
    cakes, subjects, perDay,
  };
}

export function totals() {
  const done = state.sessions.filter((s) => s.completed);
  return { minutes: done.reduce((a, s) => a + s.minutes, 0), candles: done.length, cakes: state.gallery.length };
}

export function encodeGift(gift) {
  return 'CAKE-' + btoa(unescape(encodeURIComponent(JSON.stringify({ ...gift, n: newId() })))).replace(/=+$/, '');
}

export function decodeGift(code) {
  try {
    const raw = code.trim().replace(/^CAKE-/, '');
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch {
    return null;
  }
}
