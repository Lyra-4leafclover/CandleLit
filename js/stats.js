import { state, dayKey } from './store.js';

export const PALETTE = ['#f2a7bf', '#b9b5f0', '#9fd3e6', '#f3cd6f', '#a9d6a0', '#f5b48a', '#d7a6e8', '#8fc1b5', '#f09a9a', '#c9b79c'];
export const tagColor = (tag) => {
  const i = state.subjects.indexOf(tag);
  return PALETTE[(i < 0 ? [...tag].reduce((a, c) => a + c.charCodeAt(0), 0) : i) % PALETTE.length];
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`);
const parseDay = (d) => new Date(d + 'T12:00:00');

export function periodRange(period, offset = 0) {
  const now = new Date();
  let start, end, buckets;
  if (period === 'week') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - offset * 7);
    end = new Date(start); end.setDate(end.getDate() + 7);
    buckets = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return { key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), full: d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) }; });
    const last = new Date(end); last.setDate(last.getDate() - 1);
    const f = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { start, end, buckets, label: `${f(start)} – ${f(last)}`, idx: (d) => Math.floor((parseDay(d) - start) / 864e5) };
  }
  if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const n = Math.round((end - start) / 864e5);
    buckets = Array.from({ length: n }, (_, i) => { const d = new Date(start.getFullYear(), start.getMonth(), i + 1); return { key: dayKey(d), label: String(i + 1), full: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }; });
    return { start, end, buckets, label: start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), idx: (d) => parseDay(d).getDate() - 1 };
  }
  start = new Date(now.getFullYear() - offset, 0, 1);
  end = new Date(start.getFullYear() + 1, 0, 1);
  buckets = Array.from({ length: 12 }, (_, i) => { const d = new Date(start.getFullYear(), i, 1); return { key: i, label: d.toLocaleDateString(undefined, { month: 'short' }), full: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) }; });
  return { start, end, buckets, label: String(start.getFullYear()), idx: (d) => parseDay(d).getMonth() };
}

export function periodStats(period, offset = 0) {
  const r = periodRange(period, offset);
  const inR = (d) => { if (!d) return false; const t = parseDay(String(d).slice(0, 10)); return t >= r.start && t < r.end; };
  const sessions = state.sessions.filter((s) => inR(s.date));
  const done = sessions.filter((s) => s.completed);
  const minutes = done.reduce((a, s) => a + s.minutes, 0);
  const byTag = {};
  done.forEach((s) => { byTag[s.subject] = (byTag[s.subject] || 0) + s.minutes; });
  const buckets = r.buckets.map((b) => ({ ...b, total: 0, segs: {} }));
  done.forEach((s) => { const b = buckets[r.idx(s.date)]; if (b) { b.total += s.minutes; b.segs[s.subject] = (b.segs[s.subject] || 0) + s.minutes; } });
  const hours = Array(24).fill(0);
  done.forEach((s) => { if (s.ts) hours[new Date(s.ts).getHours()] += s.minutes; });
  const days = new Set(done.map((s) => s.date));
  const tasksDone = state.tasks.filter((t) => t.done && inR(t.doneAt));
  const tasksByTag = {};
  tasksDone.forEach((t) => { tasksByTag[t.tag] = (tasksByTag[t.tag] || 0) + 1; });
  const best = buckets.reduce((a, b) => (b.total > a.total ? b : a), buckets[0]);
  return {
    range: r, sessions, done, minutes, byTag, buckets, hours, tasksDone, tasksByTag, best,
    activeDays: days.size,
    flames: done.reduce((a, s) => a + (s.flames || 0), 0),
    blown: sessions.length - done.length,
    rate: sessions.length ? Math.round((done.length / sessions.length) * 100) : 0,
    cakes: state.gallery.filter((c) => inR(c.served)).length,
    distractions: done.reduce((a, s) => a + (s.distractions || 0), 0),
  };
}

function niceMax(v) {
  const rough = v / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  return [1, 1.5, 2, 2.5, 3, 5, 10].find((m) => m * mag >= rough) * mag * 4;
}
const axisLabel = (v, max) => (max >= 120 ? `${+(v / 60).toFixed(1)}h` : `${v}m`);

export function barChart(buckets, { labelEvery = 1 } = {}) {
  const W = 720, H = 240, pl = 40, pr = 6, pt = 12, pb = 26;
  const max = niceMax(Math.max(60, ...buckets.map((b) => b.total)));
  const ih = H - pt - pb;
  const cw = (W - pl - pr) / buckets.length;
  const bw = Math.min(40, cw * 0.62);
  let s = '';
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i, y = pt + ih - (v / max) * ih;
    s += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="#1f1a1c" stroke-opacity="${i ? 0.06 : 0.14}" ${i ? 'stroke-dasharray="3 5"' : ''}/><text x="${pl - 8}" y="${y + 4}" text-anchor="end" class="ax">${axisLabel(v, max)}</text>`;
  }
  buckets.forEach((b, i) => {
    const x = pl + i * cw + (cw - bw) / 2;
    const id = 'b' + Math.random().toString(36).slice(2, 7);
    const th = (b.total / max) * ih;
    let y = pt + ih;
    let segs = '';
    Object.entries(b.segs).sort((a, c) => c[1] - a[1]).forEach(([tag, m]) => {
      const h = (m / max) * ih;
      y -= h;
      segs += `<rect x="${x}" y="${y}" width="${bw}" height="${h + 0.5}" fill="${tagColor(tag)}"/>`;
    });
    const tip = `${b.full}: ${fmtMin(b.total)}${Object.entries(b.segs).map(([t, m]) => `\n${t} · ${fmtMin(m)}`).join('')}`;
    s += `<g class="barg"><title>${esc(tip)}</title><rect x="${pl + i * cw}" y="${pt}" width="${cw}" height="${ih}" fill="transparent"/>`;
    if (th > 0) s += `<clipPath id="${id}"><rect x="${x}" y="${pt + ih - th}" width="${bw}" height="${th}" rx="${Math.min(8, bw / 3)}"/><rect x="${x}" y="${pt + ih - Math.min(th, 8)}" width="${bw}" height="${Math.min(th, 8)}"/></clipPath><g clip-path="url(#${id})">${segs}</g>`;
    else s += `<rect x="${x}" y="${pt + ih - 3}" width="${bw}" height="3" rx="1.5" fill="#1f1a1c" opacity=".06"/>`;
    s += '</g>';
    if (i % labelEvery === 0 || i === buckets.length - 1) s += `<text x="${pl + i * cw + cw / 2}" y="${H - 6}" text-anchor="middle" class="ax">${esc(b.label)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

export function donut(byTag) {
  const entries = Object.entries(byTag).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, e) => a + e[1], 0);
  const R = 62, C = 2 * Math.PI * R;
  let off = 0, arcs = '';
  if (!total) arcs = `<circle r="${R}" fill="none" stroke="#f1ebe2" stroke-width="22"/>`;
  entries.forEach(([tag, m]) => {
    const len = (m / total) * C;
    arcs += `<circle r="${R}" fill="none" stroke="${tagColor(tag)}" stroke-width="22" stroke-dasharray="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90)"><title>${esc(tag)} · ${fmtMin(m)}</title></circle>`;
    off += len;
  });
  const legend = entries.map(([tag, m]) => `<div class="legend-row"><i style="background:${tagColor(tag)}"></i><span>${esc(tag)}</span><span class="spacer"></span><b>${fmtMin(m)}</b><span class="muted">${Math.round((m / total) * 100)}%</span></div>`).join('');
  return `<div class="donut-wrap"><svg class="donut" viewBox="-80 -80 160 160">${arcs}<text y="-2" text-anchor="middle" class="donut-n">${+(total / 60).toFixed(1)}</text><text y="16" text-anchor="middle" class="ax">hours</text></svg><div class="legend">${legend || '<p class="muted">No focus time yet in this period.</p>'}</div></div>`;
}

export function hourChart(hours) {
  const W = 440, H = 150, pl = 4, pb = 22, pt = 8;
  const max = Math.max(1, ...hours);
  const cw = (W - pl * 2) / 24, bw = cw * 0.66, ih = H - pb - pt;
  let s = '';
  hours.forEach((m, h) => {
    const bh = Math.max(3, (m / max) * ih);
    const x = pl + h * cw + (cw - bw) / 2;
    s += `<rect x="${x}" y="${pt + ih - bh}" width="${bw}" height="${bh}" rx="${bw / 3}" fill="${m ? '#b9b5f0' : '#1f1a1c'}" opacity="${m ? 0.35 + (m / max) * 0.65 : 0.06}"><title>${h}:00 · ${fmtMin(m)}</title></rect>`;
    if (h % 3 === 0) s += `<text x="${pl + h * cw + cw / 2}" y="${H - 5}" text-anchor="middle" class="ax">${h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : h - 12 + 'p'}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

export function trendChart(points) {
  const W = 440, H = 200, pl = 40, pr = 14, pt = 14, pb = 26;
  const max = niceMax(Math.max(60, ...points.map((p) => p.minutes)));
  const ih = H - pt - pb, iw = W - pl - pr;
  const xy = points.map((p, i) => [pl + (i / (points.length - 1)) * iw, pt + ih - (p.minutes / max) * ih]);
  const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  let s = `<defs><linearGradient id="trendG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a7bf" stop-opacity=".45"/><stop offset="1" stop-color="#f2a7bf" stop-opacity="0"/></linearGradient></defs>`;
  for (let i = 0; i <= 4; i++) { const v = (max / 4) * i, y = pt + ih - (v / max) * ih; s += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="#1f1a1c" stroke-opacity="${i ? 0.06 : 0.14}" ${i ? 'stroke-dasharray="3 5"' : ''}/><text x="${pl - 8}" y="${y + 4}" text-anchor="end" class="ax">${axisLabel(v, max)}</text>`; }
  s += `<path d="${line} L${xy[xy.length - 1][0]} ${pt + ih} L${xy[0][0]} ${pt + ih}Z" fill="url(#trendG)"/><path d="${line}" fill="none" stroke="#e2668e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  xy.forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="${i === xy.length - 1 ? 5.5 : 4}" fill="${i === xy.length - 1 ? '#e2668e' : '#fff'}" stroke="#e2668e" stroke-width="2"><title>${esc(points[i].label)} · ${fmtMin(points[i].minutes)}</title></circle><text x="${x}" y="${H - 6}" text-anchor="middle" class="ax">${esc(points[i].short)}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

export function heatmap(year) {
  const mins = {};
  state.sessions.filter((s) => s.completed && s.date.startsWith(String(year))).forEach((s) => { mins[s.date] = (mins[s.date] || 0) + s.minutes; });
  const start = new Date(year, 0, 1);
  const lead = (start.getDay() + 6) % 7;
  const cell = 12, gap = 3, top = 18, left = 26;
  const levels = ['#f1ebe2', '#f8d3e0', '#f2a7bf', '#e2789c', '#c4486f'];
  let s = '';
  ['Mon', 'Wed', 'Fri'].forEach((d, i) => { s += `<text x="0" y="${top + (i * 2) * (cell + gap) + 10}" class="ax">${d}</text>`; });
  for (let d = new Date(start); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
    const n = Math.round((d - start) / 864e5) + lead;
    const col = Math.floor(n / 7), row = n % 7;
    const k = dayKey(d), m = mins[k] || 0;
    const lv = m === 0 ? 0 : m < 30 ? 1 : m < 60 ? 2 : m < 120 ? 3 : 4;
    if (d.getDate() === 1) s += `<text x="${left + col * (cell + gap)}" y="11" class="ax">${d.toLocaleDateString(undefined, { month: 'short' })}</text>`;
    s += `<rect x="${left + col * (cell + gap)}" y="${top + row * (cell + gap)}" width="${cell}" height="${cell}" rx="3" fill="${levels[lv]}"><title>${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${fmtMin(m)}</title></rect>`;
  }
  const W = left + 54 * (cell + gap);
  const legend = `<div class="heat-legend"><span class="muted">Less</span>${levels.map((c) => `<i style="background:${c}"></i>`).join('')}<span class="muted">More</span></div>`;
  return `<div class="heat-scroll"><svg class="heat" viewBox="0 0 ${W} ${top + 7 * (cell + gap)}" style="min-width:${W}px">${s}</svg></div>${legend}`;
}
