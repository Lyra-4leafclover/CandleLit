import { CANDLES, CAKES, TOPPERS, KINDS, DURATIONS, RARITY, STUDIO, STUDIO_COST, AMBIENCE, CAKE_SLOTS, kindFor } from './data.js';
import {
  state, save, resetAll, dayKey, newId, allCandles, getCandle, getCake, ownsCandle, streak, isBlue,
  currentCake, serveCake, rolloverIfNewDay, addCandleToCake, spend, weekStats, totals, encodeGift, decodeGift,
} from './store.js';
import { candleSVG, cakeSVG, sculptureSVG } from './render.js';
import * as audio from './audio.js';
import { party } from './party.js';

const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const BASE_TITLE = document.title;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (ms) => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : m) + ':' + String(s).padStart(2, '0');
};
const msPerMin = () => (state.settings.demo ? 1000 : 60000);
const FLAME = '<svg class="ico" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1c1.5 4 6.5 6.5 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3.2 1.8-5.4 3.2-7.3.2 2.2 1.2 3.4 2.4 3.6-.4-3.3.1-6.2.9-8.8z"/></svg>';
const DROP = '<svg class="ico" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/></svg>';
const cakeOpts = (extra = {}) => ({ getDesign: getCandle, ...extra });

const ui = {
  view: 'focus', shopTab: 'candles', recapWeek: 0, agitatedUntil: 0, lastRem: -1, lastAgitated: false,
  studio: { name: '', c1: '#fde4ec', c2: '#f6c6d6', c3: '#e2668e', pattern: 'solid', shape: 'taper', holder: 'ornate', decor: 'roses', scent: STUDIO.scents[0] },
  joinCode: '', blown: false, newSubject: '',
};

/* ---------- helpers ---------- */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function modal(html) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-card">${html}<button class="x" data-act="closeModal" aria-label="Close">×</button></div>`;
  m.classList.remove('hidden');
}
function closeModal() { $('#modal').classList.add('hidden'); $('#modal').innerHTML = ''; }
function confetti(n = 60) {
  const cols = ['#f7c6d9', '#cfcaf7', '#bfe3ee', '#f8e3a8', '#cfe6c4', '#f2a7bf'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = cols[i % cols.length];
    c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
    c.style.animationDelay = Math.random() * 0.6 + 's';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 5500);
  }
}
const setDim = (v) => { $('#dim').style.opacity = v; };
const rarityBadge = (r) => `<span class="badge" style="background:${RARITY[r].color}">${RARITY[r].label}</span>`;
const candleThumb = (d, kind = 'taper', lit = true) => candleSVG(d, kind, 1, { lit, cls: 'thumb', blue: isBlue() });

function renderWallet() {
  const s = streak();
  $('#wallet').innerHTML = `
    <span class="pill ${s >= 7 ? 'blue' : ''}" title="Flames${s >= 7 ? ' — blue flame streak: 2x' : ''}">${FLAME} ${state.flames}</span>
    <span class="pill drop" title="Wax drips">${DROP} ${state.wax}</span>
    <span class="pill" title="Day streak">${s}-day streak</span>`;
}

/* ---------- router ---------- */
const VIEWS = {};
function route() {
  const a = state.active;
  let name = location.hash.replace(/^#\/?/, '').split('?')[0] || 'focus';
  if (a?.type === 'focus') name = 'focus';
  else if (a?.type === 'break') name = 'break';
  else if (name === 'done' && !state.pending) name = 'focus';
  else if (name === 'break') name = 'focus';
  if (!VIEWS[name]) name = 'focus';
  ui.view = name;
  document.body.classList.toggle('immersive', !!a);
  document.querySelectorAll('#nav a').forEach((el) => el.classList.toggle('on', el.dataset.view === name));
  if (!a) { setDim(0); document.title = BASE_TITLE; }
  VIEWS[name]();
  renderWallet();
}
window.addEventListener('hashchange', route);
const go = (v) => { if (location.hash === '#/' + v) route(); else location.hash = '#/' + v; };

/* ---------- ambience ---------- */
function ambienceControls() {
  return `<div class="row">${AMBIENCE.map((a) => `<button class="chip ${state.settings.ambience.includes(a.id) ? 'on' : ''}" data-act="ambience" data-id="${a.id}">${a.label}</button>`).join('')}
    <input type="range" min="0" max="1" step="0.05" value="${state.settings.volume}" data-change="volume" title="Volume" style="width:110px"></div>`;
}

/* ---------- focus (setup) ---------- */
VIEWS.focus = () => {
  if (state.active?.type === 'focus') return focusActive();
  const st = state.settings;
  const d = getCandle(st.design);
  const kind = kindFor(st.minutes);
  const s = streak();
  const owned = allCandles().filter((c) => ownsCandle(c.id));
  const isCustom = !DURATIONS.some((x) => x.minutes === st.minutes);
  view.innerHTML = `
  <section class="focus-grid">
    <div class="altar">
      ${candleSVG(d, kind, 1, { lit: true, sparkles: true, cls: 'candle-svg' })}
      <div class="altar-name">${esc(d.name)}</div>
      <p class="muted" style="margin:2px 0 0;position:relative">${KINDS[kind].label} · ${KINDS[kind].desc}</p>
    </div>
    <div class="card">
      ${party.active ? `<div class="banner">You're in study party <b>${party.code}</b>. <a href="#/party">Light candles together →</a></div>` : ''}
      <div class="banner ${s >= 7 ? 'blue' : ''}">${s >= 7 ? `<b>Blue flame unlocked.</b> Your ${s}-day streak doubles every flame you earn.` : `${s}-day streak · ${7 - s} more day${7 - s === 1 ? '' : 's'} until your flames burn <b style="color:#7fd1ff">blue (2x)</b>.`}</div>
      <h2>Light a candle</h2>
      <label class="field">How long?</label>
      <div class="chips">
        ${DURATIONS.map((x) => `<button class="chip ${st.minutes === x.minutes ? 'on' : ''}" data-act="minutes" data-min="${x.minutes}">${x.minutes} min <small>${KINDS[x.kind].label.split(' ')[0]}</small></button>`).join('')}
        <input type="number" min="1" max="180" placeholder="custom" value="${isCustom ? st.minutes : ''}" data-change="customMin" style="width:110px">
      </div>
      <label class="field">Candle</label>
      <div class="candle-picker">
        ${owned.map((c) => `<div class="candle-opt ${c.id === st.design ? 'on' : ''}" data-act="design" data-id="${c.id}">${candleThumb(c, 'taper', false)}${esc(c.name)}</div>`).join('')}
        <a class="candle-opt" href="#/shop" style="display:flex;align-items:center;justify-content:center;text-decoration:none">+ more in the shop</a>
      </div>
      <label class="field">Studying</label>
      <div class="chips">
        ${state.subjects.map((x) => `<button class="chip ${st.subject === x ? 'on' : ''}" data-act="subject" data-id="${esc(x)}">${esc(x)}</button>`).join('')}
        <input type="text" placeholder="+ add subject" data-change="newSubject" style="width:150px">
      </div>
      <label class="field">Ambience</label>
      ${ambienceControls()}
      <div class="row" style="margin-top:22px">
        <button class="btn big" data-act="light">Light the candle</button>
        <label class="muted" title="1 minute = 1 second, for trying things out"><input type="checkbox" data-change="demo" ${st.demo ? 'checked' : ''}> Demo speed</label>
      </div>
      <p class="muted" style="margin-top:12px">Finish and the candle goes on today's cake, plus you earn <b>${Math.round(st.minutes * (s >= 7 ? 2 : 1))} flames</b>. Blow it out early and a half-melted stub goes on the cake instead. You'll see the cake once the timer ends.</p>
    </div>
  </section>`;
};

function focusActive() {
  const a = state.active;
  view.innerHTML = `
  <section class="burn">
    <div class="burn-subject">${esc(a.subject)} · ${a.minutes} min${a.party ? ` · party ${esc(party.code || '')}` : ''}</div>
    <div id="time" class="time">${fmt(a.durationMs)}</div>
    <div id="stage" class="stage"></div>
    <div id="friends" class="friends"></div>
    <div class="burn-actions">${ambienceControls()}<button class="btn ghost" data-act="giveUp">Blow out early</button></div>
    <p class="hint">Stay on this tab. Your flame flickers when you wander off.</p>
  </section>`;
  ui.lastRem = -1;
  tick();
}

function renderFriends(p) {
  const el = $('#friends');
  if (!el || !state.active?.party || !party.room) return;
  el.innerHTML = party.room.members.filter((m) => m.id !== party.memberId).map((m) => {
    const quit = m.status === 'quit';
    return `<div class="friend">${candleSVG(getCandle(m.design), kindFor(state.active.minutes), quit ? 0.45 : 1 - p, { lit: !quit && p > 0, cls: '', smoke: quit })}<div>${esc(m.name)}</div><div class="st">${quit ? 'blew out early' : m.status === 'done' ? 'melted' : 'burning'}</div></div>`;
  }).join('');
}

/* ---------- timer ---------- */
function tick() {
  const a = state.active;
  if (!a) return;
  const now = Date.now();
  const elapsed = now - a.startedAt;
  if (a.type === 'focus') {
    const stage = $('#stage');
    if (elapsed < 0) {
      if (stage && ui.lastRem !== 2) {
        stage.innerHTML = candleSVG(getCandle(a.design), a.kind, 1, { lit: false, cls: 'candle-big' });
        ui.lastRem = 2;
      }
      const t = $('#time');
      if (t) t.innerHTML = `<span class="countdown">Lighting in ${Math.ceil(-elapsed / 1000)}…</span>`;
      return;
    }
    const p = Math.min(1, elapsed / a.durationMs);
    setDim(0.05 + p * 0.45);
    const left = a.durationMs - elapsed;
    const t = $('#time');
    if (t) t.textContent = fmt(left);
    if (!document.hidden) document.title = `${fmt(left)} · Candlelit`;
    const rem = Math.round((1 - p) * 400) / 400;
    const agitated = now < ui.agitatedUntil;
    if (stage && (rem !== ui.lastRem || agitated !== ui.lastAgitated)) {
      stage.innerHTML = candleSVG(getCandle(a.design), a.kind, rem, { lit: true, blue: a.blue, agitated, sparkles: true, cls: 'candle-big' });
      ui.lastRem = rem;
      ui.lastAgitated = agitated;
      renderFriends(p);
    }
    if (p >= 1) finishSession(true);
  } else if (a.type === 'break') {
    const p = Math.min(1, elapsed / a.durationMs);
    setDim(0.05);
    const t = $('#time');
    if (t) t.textContent = fmt(a.durationMs - elapsed);
    if (!document.hidden) document.title = `Break ${fmt(a.durationMs - elapsed)} · Candlelit`;
    const sc = $('#sculpt');
    if (sc) sc.innerHTML = sculptureSVG(a.sculpture, Math.max(0.05, p));
    if (p >= 1) finishBreak(true);
  }
}

function startFocus(partySession) {
  audio.unlock();
  audio.setAmbience(state.settings.ambience);
  const minutes = partySession ? partySession.minutes : state.settings.minutes;
  state.active = {
    type: 'focus',
    startedAt: partySession ? partySession.startAt - party.offset : Date.now(),
    durationMs: partySession ? partySession.durationMs : minutes * msPerMin(),
    minutes,
    kind: kindFor(minutes),
    design: state.settings.design,
    subject: state.settings.subject,
    blue: isBlue(),
    party: !!partySession,
    partySession: partySession?.id || null,
    distractions: 0,
  };
  if (partySession) state.lastPartySession = partySession.id;
  state.pending = null;
  ui.blown = false;
  save();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
  go('focus');
}

function finishSession(completed) {
  const a = state.active;
  if (!a || a.type !== 'focus') return;
  const elapsed = Math.max(0, Math.min(a.durationMs, Date.now() - a.startedAt));
  const p = elapsed / a.durationMs;
  const flames = completed ? Math.round(a.minutes * (a.party ? 1.2 : 1) * (a.blue ? 2 : 1)) : 0;
  const wax = completed ? Math.round(a.minutes / 5) + Math.floor(Math.random() * 4) : 1;
  const candle = {
    id: newId(), design: a.design, kind: a.kind, minutes: a.minutes, subject: a.subject, melted: !completed,
    remaining: Math.min(0.6, Math.max(0.15, 1 - p)), blue: a.blue, date: dayKey(), party: a.party,
  };
  state.sessions.push({ date: dayKey(), minutes: completed ? a.minutes : Math.round(a.minutes * p), subject: a.subject, completed, flames, party: a.party, distractions: a.distractions });
  state.flames += flames;
  state.wax += wax;
  const res = addCandleToCake(candle);
  let partyMembers = null;
  if (a.party && party.room) {
    partyMembers = party.room.members.map((m) => ({ name: m.name, design: m.design, status: m.id === party.memberId ? (completed ? 'done' : 'quit') : m.status, me: m.id === party.memberId }));
    if (completed) state.partyCakes.unshift({ id: newId(), date: dayKey(), code: party.code, minutes: a.minutes, members: partyMembers, design: 'funfetti' });
    party.status({ status: completed ? 'done' : 'quit' });
  }
  state.pending = { candle, flames, wax, served: res.served, cakeId: res.cake.id, completed, partyMembers, design: a.design };
  state.active = null;
  save();
  if (completed) {
    audio.chime();
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') new Notification('Your candle has melted', { body: `+${flames} flames. Come see your cake.` });
  } else audio.blow();
  go('done');
}

/* ---------- done ---------- */
VIEWS.done = () => {
  const pd = state.pending;
  const c = pd.candle;
  const cake = pd.served ? state.gallery.find((x) => x.id === pd.cakeId) : currentCake();
  const d = getCandle(c.design);
  const completedToday = state.sessions.filter((s) => s.date === dayKey() && s.completed).length;
  const partyBlock = pd.partyMembers && pd.completed ? `
    <div class="card" style="margin-top:24px;text-align:center">
      <h2>Blow out together</h2>
      <p class="muted">Everyone's candles burned down at the same time. Make a wish and blow.</p>
      <div class="members ${ui.blown ? 'blowing' : ''}" id="partyCandles" style="justify-content:center">
        ${pd.partyMembers.map((m) => `<div class="member">${candleSVG(getCandle(m.design), c.kind, m.status === 'quit' ? 0.45 : 0.12, { lit: m.status !== 'quit' && !ui.blown, smoke: ui.blown || m.status === 'quit', cls: '' })}<div>${esc(m.name)}${m.me ? ' (you)' : ''}</div></div>`).join('')}
      </div>
      ${ui.blown ? '<p class="served">Wish made. Party cake added to your Bakery.</p>' : '<button class="btn rose big" data-act="blowTogether">Blow!</button>'}
    </div>` : '';
  view.innerHTML = `
  <section>
    <div class="done-grid">
      <div class="card" style="text-align:center">
        <h1>${pd.completed ? 'Melted all the way down.' : 'Blown out early.'}</h1>
        <div style="height:300px;display:flex;justify-content:center;align-items:flex-end">${candleSVG(d, c.kind, pd.completed ? 0 : c.remaining, { lit: false, smoke: true, cls: 'candle-svg' })}</div>
        <div class="earn">
          ${pd.completed ? `<span class="pill ${c.blue ? 'blue' : ''}">${FLAME} +${pd.flames} flames</span>` : ''}
          <span class="pill drop">${DROP} +${pd.wax} wax drips</span>
        </div>
        <p class="muted">${pd.completed ? `${c.minutes} minutes of ${esc(c.subject)}.${c.blue ? ' Blue flame: 2x.' : ''}${c.party ? ' Party bonus: 1.2x.' : ''}` : "No flames this time. A half-melted stub was left on the cake as a reminder."}</p>
      </div>
      <div class="reveal">
        <h2 style="text-align:center">${pd.served ? 'Cake complete!' : "Today's cake"}</h2>
        ${cakeSVG(getCake(cake.design), cake.candles, cake.toppers, cakeOpts({ seed: cake.id }))}
        ${pd.served ? `<p class="served">${CAKE_SLOTS} candles. Your cake was served to the Bakery.</p>` : `<p style="text-align:center" class="muted">${cake.candles.length}/${CAKE_SLOTS} candles. Fill the cake to serve it to your Bakery.</p>`}
      </div>
    </div>
    ${partyBlock}
    <div class="card plain" style="margin-top:24px">
      <div class="row">
        <b style="font-family:var(--serif)">Break time:</b>
        ${[5, 10, 15].map((m) => `<button class="btn sm" data-act="startBreak" data-min="${m}">${m} min</button>`).join('')}
        <span class="muted">Your drips cool into a wax sculpture while you rest.</span>
        <span class="spacer"></span>
        <button class="btn ghost sm" data-act="share" data-cake="${cake.id}">Share today (${completedToday} candle${completedToday === 1 ? '' : 's'})</button>
        <button class="btn ghost sm" data-act="lightAnother">Light another</button>
        <a class="btn ghost sm" href="#/bakery" data-act="clearPending">Bakery</a>
      </div>
    </div>
  </section>`;
  if (pd.completed && !pd.celebrated) { confetti(pd.served ? 140 : 50); pd.celebrated = true; save(); }
};

/* ---------- break ---------- */
function startBreak(min) {
  const d = getCandle(state.pending?.design || state.settings.design);
  state.active = { type: 'break', startedAt: Date.now(), durationMs: min * msPerMin(), minutes: min, sculpture: { seed: newId(), c1: d.c1, c2: d.c2, drip: d.drip || d.c1, name: d.name } };
  state.pending = null;
  save();
  go('break');
}
VIEWS.break = () => {
  view.innerHTML = `
  <section class="burn">
    <div class="burn-subject">Break · ${state.active.minutes} min</div>
    <div id="time" class="time"></div>
    <p class="muted">Leftover wax is cooling into a one-of-a-kind sculpture. Stretch, sip some water, look out a window.</p>
    <div id="sculpt" style="width:320px;height:320px"></div>
    <div class="burn-actions">${ambienceControls()}<button class="btn ghost" data-act="endBreak">End break</button></div>
  </section>`;
  tick();
};
function finishBreak(complete) {
  const a = state.active;
  const growth = Math.min(1, (Date.now() - a.startedAt) / a.durationMs);
  state.sculptures.unshift({ ...a.sculpture, growth: Math.max(0.15, growth), date: dayKey() });
  if (complete) state.wax += 3;
  state.active = null;
  save();
  if (complete) { audio.chime(); toast(`Break over. Sculpture added to your shelf (+3 wax drips)`); } else toast('Sculpture added to your shelf');
  go('focus');
}

/* ---------- bakery ---------- */
VIEWS.bakery = () => {
  rolloverIfNewDay();
  const cake = currentCake();
  const ownedCakes = CAKES.filter((c) => state.owned.cakes.includes(c.id));
  const ownedToppers = TOPPERS.filter((t) => state.owned.toppers.includes(t.id));
  view.innerHTML = `
  <section class="grid">
    <div class="bakery-top">
      <div class="card">
        <h2>Cake in the oven</h2>
        ${cakeSVG(getCake(cake.design), cake.candles, cake.toppers, cakeOpts({ seed: cake.id }))}
        <p style="text-align:center" class="muted">${cake.candles.length}/${CAKE_SLOTS} candles · started ${cake.started}</p>
      </div>
      <div class="card">
        <h3>Cake design</h3>
        <div class="chips">${ownedCakes.map((c) => `<button class="chip ${cake.design === c.id ? 'on' : ''}" data-act="cakeDesign" data-id="${c.id}">${esc(c.name)}</button>`).join('')}</div>
        <h3 style="margin-top:18px">Toppers</h3>
        ${ownedToppers.length ? `<div class="chips">${ownedToppers.map((t) => `<button class="chip ${cake.toppers.includes(t.id) ? 'on' : ''}" data-act="topper" data-id="${t.id}">${esc(t.name)}</button>`).join('')}</div>` : '<p class="muted">No toppers yet. <a href="#/shop">Pick some up in the shop</a>.</p>'}
        <h3 style="margin-top:18px">Candles on this cake</h3>
        ${candleLog(cake.candles)}
        <div class="row" style="margin-top:16px">
          <button class="btn sm" data-act="serve" ${cake.candles.length ? '' : 'disabled'}>Serve it now</button>
          <button class="btn ghost sm" data-act="share" data-cake="${cake.id}" ${cake.candles.length ? '' : 'disabled'}>Share card</button>
        </div>
        <p class="muted" style="font-size:.9rem">Cakes get served automatically when they fill up or when the day ends.</p>
      </div>
    </div>
    <div class="card">
      <h2>Your Bakery <span class="muted" style="font-size:1rem">${state.gallery.length} cake${state.gallery.length === 1 ? '' : 's'} served</span></h2>
      ${state.gallery.length ? `<div class="gallery">${state.gallery.map((c) => `
        <div class="cake-tile" data-act="cakeDetail" data-id="${c.id}">
          ${cakeSVG(getCake(c.design), c.candles, c.toppers, cakeOpts({ seed: c.id }))}
          <div><b>${esc(getCake(c.design).name)}</b></div>
          <div class="muted" style="font-size:.85rem">${c.served} · ${c.candles.filter((x) => !x.melted).length} lit${c.candles.some((x) => x.melted) ? ` · ${c.candles.filter((x) => x.melted).length} stub` : ''}</div>
        </div>`).join('')}</div>` : '<p class="muted">Your bakery is empty for now. Finish candles to fill a cake. Full cakes show up here, like trees in a forest.</p>'}
    </div>
    ${state.partyCakes.length ? `<div class="card"><h2>Party cakes</h2><div class="gallery">${state.partyCakes.map((pc) => `
      <div class="cake-tile">
        ${cakeSVG(getCake(pc.design), pc.members.map((m) => ({ design: m.design, kind: kindFor(pc.minutes), minutes: pc.minutes, subject: m.name, melted: m.status === 'quit', remaining: 0.45 })), ['sprinkles'], cakeOpts({ seed: pc.id }))}
        <div><b>Party ${esc(pc.code)}</b></div>
        <div class="muted" style="font-size:.85rem">${pc.date} · ${pc.members.map((m) => esc(m.name)).join(', ')}</div>
      </div>`).join('')}</div></div>` : ''}
    <div class="card">
      <h2>Wax sculpture shelf</h2>
      ${state.sculptures.length ? `<div class="shelf">${state.sculptures.map((s) => `<div class="item">${sculptureSVG(s, s.growth)}<div>${s.date}</div></div>`).join('')}</div>` : '<p class="muted">Take a break after a session and your drips harden into a sculpture.</p>'}
    </div>
  </section>`;
};

function candleLog(candles) {
  if (!candles.length) return '<p class="muted">None yet.</p>';
  return `<ul class="log">${candles.map((c) => `<li><span>${esc(getCandle(c.design).name)} <span class="muted">· ${esc(c.subject)}</span></span><span>${c.minutes} min <span class="tag ${c.melted ? 'dead' : ''}">${c.melted ? 'blown out' : c.party ? 'party' : 'melted'}</span></span></li>`).join('')}</ul>`;
}

/* ---------- share card ---------- */
async function shareCard(cakeId) {
  const cake = cakeId === state.cake?.id ? state.cake : state.gallery.find((c) => c.id === cakeId);
  if (!cake) return;
  const day = cake.served || cake.started;
  const lit = cake.candles.filter((c) => !c.melted);
  const mins = lit.reduce((a, c) => a + c.minutes, 0);
  const isToday = day === dayKey();
  const headline = `I studied ${lit.length} candle${lit.length === 1 ? '' : 's'} ${isToday ? 'today' : 'on ' + day}`;
  let inner = cakeSVG(getCake(cake.design), cake.candles, cake.toppers, cakeOpts({ seed: cake.id }));
  inner = inner.replace('<svg ', '<svg x="90" y="330" width="900" height="760" ');
  const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs><radialGradient id="bgG" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#fdf3ec"/><stop offset="1" stop-color="#f4e6dc"/></radialGradient>
    <radialGradient id="glowG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd9a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient></defs>
    <rect width="1080" height="1350" fill="url(#bgG)"/>
    <circle cx="540" cy="700" r="520" fill="url(#glowG)"/>
    <rect x="40" y="40" width="1000" height="1270" rx="56" fill="none" stroke="#1f1a1c" stroke-opacity=".08" stroke-width="3"/>
    <text x="540" y="150" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="46" fill="#e2668e">Candlelit</text>
    <text x="540" y="250" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="64" fill="#1f1a1c">${esc(headline)}</text>
    <text x="540" y="310" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#8a7f82">${Math.floor(mins / 60)}h ${mins % 60}m · studying until my candle melts</text>
    ${inner}
    <text x="540" y="1240" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#8a7f82">${esc(getCake(cake.design).name)} · ${streak()}-day streak</text>
  </svg>`;
  const url = URL.createObjectURL(new Blob([card], { type: 'image/svg+xml' }));
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas');
    cv.width = 1080; cv.height = 1350;
    cv.getContext('2d').drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    cv.toBlob((blob) => {
      const png = URL.createObjectURL(blob);
      const file = new File([blob], 'candlelit-cake.png', { type: 'image/png' });
      const canShare = navigator.canShare && navigator.canShare({ files: [file] });
      modal(`<h2>Your cake card</h2><img class="share-img" src="${png}" alt="Share card">
        <div class="row" style="margin-top:14px"><a class="btn" href="${png}" download="candlelit-cake.png">Download PNG</a>${canShare ? '<button class="btn rose" data-act="nativeShare">Share…</button>' : ''}</div>`);
      ui.shareFile = file;
    }, 'image/png');
  };
  img.src = url;
}

/* ---------- shop ---------- */
VIEWS.shop = () => {
  const tab = ui.shopTab;
  let items = '';
  if (tab === 'candles') {
    items = CANDLES.map((c) => {
      const owned = ownsCandle(c.id);
      const unavailable = c.available === false;
      return `<div class="item-card ${c.rarity}">${candleThumb(c, 'taper')}${rarityBadge(c.rarity)}<b>${esc(c.name)}</b>
        ${owned ? `<button class="btn sm ${state.settings.design === c.id ? 'ghost' : ''}" data-act="equipCandle" data-id="${c.id}">${state.settings.design === c.id ? 'Equipped' : 'Use'}</button>`
          : unavailable ? `<span class="muted">Returns in ${c.season}</span>`
          : `<button class="btn sm" data-act="buy" data-type="candle" data-id="${c.id}" ${state.flames < c.price ? 'disabled' : ''}>${FLAME} ${c.price}</button>`}
        ${!unavailable && c.price ? `<button class="btn ghost sm" data-act="gift" data-type="candle" data-id="${c.id}">Gift</button>` : ''}</div>`;
    }).join('');
  } else if (tab === 'cakes') {
    const sample = [{ design: 'striped', kind: 'birthday', minutes: 25 }, { design: 'classic', kind: 'taper', minutes: 50 }, { design: 'polka', kind: 'birthday', minutes: 25 }];
    items = CAKES.map((c) => {
      const owned = state.owned.cakes.includes(c.id);
      const unavailable = c.available === false;
      return `<div class="item-card ${c.rarity}">${cakeSVG(c, sample, [], cakeOpts({ cls: 'cake-svg thumb-cake' }))}${rarityBadge(c.rarity)}<b>${esc(c.name)}</b>
        ${owned ? `<button class="btn sm ${currentCake().design === c.id ? 'ghost' : ''}" data-act="cakeDesign" data-id="${c.id}">${currentCake().design === c.id ? 'Baking now' : 'Bake next'}</button>`
          : unavailable ? `<span class="muted">Returns in ${c.season}</span>`
          : `<button class="btn sm" data-act="buy" data-type="cake" data-id="${c.id}" ${state.flames < c.price ? 'disabled' : ''}>${FLAME} ${c.price}</button>`}
        ${!unavailable && c.price ? `<button class="btn ghost sm" data-act="gift" data-type="cake" data-id="${c.id}">Gift</button>` : ''}</div>`;
    }).join('');
  } else {
    const base = getCake('vanilla');
    items = TOPPERS.map((t) => {
      const owned = state.owned.toppers.includes(t.id);
      return `<div class="item-card">${cakeSVG(base, [], [t.id], cakeOpts({ cls: 'cake-svg thumb-cake', seed: t.id }))}<b>${esc(t.name)}</b>
        ${owned ? '<span class="muted">Owned. Add it to a cake in the Bakery.</span>' : `<button class="btn sm" data-act="buy" data-type="topper" data-id="${t.id}" ${state.flames < t.price ? 'disabled' : ''}>${FLAME} ${t.price}</button>`}
        <button class="btn ghost sm" data-act="gift" data-type="topper" data-id="${t.id}">Gift</button></div>`;
    }).join('');
  }
  view.innerHTML = `
  <section>
    <div class="card plain">
      <div class="row"><h1 style="margin:0">The Candle Shop</h1><span class="spacer"></span>
        <input type="text" placeholder="Got a gift code? Paste it here" data-change="redeem" style="width:280px"><button class="btn sm" data-act="redeem">Redeem</button></div>
      <div class="tabs">${['candles', 'cakes', 'toppers'].map((t) => `<button class="chip ${tab === t ? 'on' : ''}" data-act="shopTab" data-id="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
      <div class="shop-grid">${items}</div>
    </div>
  </section>`;
};

const catalog = (type, id) => (type === 'candle' ? CANDLES : type === 'cake' ? CAKES : TOPPERS).find((x) => x.id === id);

/* ---------- studio ---------- */
const mixLight = (c) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(c.slice(i, i + 2), 16) + (255 - parseInt(c.slice(i, i + 2), 16)) * 0.5).toString(16).padStart(2, '0')).join('');
function studioDesign() {
  const s = ui.studio;
  return { id: 'preview', name: s.name || 'Untitled candle', pattern: s.pattern === 'solid' ? undefined : s.pattern, c1: s.c1, c2: s.c2, c3: s.c3, accent: s.c3, hc: s.holder === 'ornate' ? '#f6f0e6' : '#fbf3ea', drip: mixLight(s.c1), shape: s.shape, holder: s.holder, decor: s.decor === 'none' ? [] : [s.decor], rarity: 'custom' };
}
function renderStudioPreview() {
  const el = $('#studio-preview');
  if (el) el.innerHTML = ['birthday', 'taper', 'pillar'].map((k) => candleSVG(studioDesign(), k, 1, { lit: true, cls: '' })).join('');
}
VIEWS.studio = () => {
  const s = ui.studio;
  view.innerHTML = `
  <section class="studio-grid">
    <div class="card">
      <h1>Wax Studio</h1>
      <p class="muted">Pour your own candle with the wax drips you collect from sessions and breaks. Each pour costs <b>${STUDIO_COST} drips</b>. You have ${state.wax}.</p>
      <label class="field">Name</label><input type="text" data-studio="name" value="${esc(s.name)}" placeholder="e.g. Exam Season Survivor" style="width:100%">
      <label class="field">Colours</label><div class="row"><input type="color" data-studio="c1" value="${s.c1}"><input type="color" data-studio="c2" value="${s.c2}"><input type="color" data-studio="c3" value="${s.c3}"><span class="muted">top · bottom · accent</span></div>
      ${[['shape', 'Shape', STUDIO.shapes], ['holder', 'Holder', STUDIO.holders], ['decor', 'Decoration', STUDIO.decors]].map(([k, label, list]) => `<label class="field">${label}</label><div class="chips">${list.map((x) => `<button class="chip ${s[k] === x ? 'on' : ''}" data-act="studioOpt" data-key="${k}" data-id="${x}">${x}</button>`).join('')}</div>`).join('')}
      <label class="field">Pattern</label><div class="chips">${STUDIO.patterns.map((p) => `<button class="chip ${s.pattern === p ? 'on' : ''}" data-act="studioPattern" data-id="${p}">${p}</button>`).join('')}</div>
      <label class="field">Scent</label><select data-studio="scent">${STUDIO.scents.map((x) => `<option ${x === s.scent ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <div class="row" style="margin-top:22px"><button class="btn big" data-act="pour" ${state.wax < STUDIO_COST ? 'disabled' : ''}>Pour candle · ${DROP} ${STUDIO_COST}</button></div>
    </div>
    <div class="card">
      <div id="studio-preview" class="studio-preview"></div>
      <h3 style="margin-top:20px">Your poured candles</h3>
      ${state.custom.length ? `<div class="candle-picker">${state.custom.map((c) => `<div class="candle-opt ${state.settings.design === c.id ? 'on' : ''}" data-act="design" data-id="${c.id}">${candleThumb(c, 'taper')}${esc(c.name)}<br><span class="muted">${esc(c.scent)}</span></div>`).join('')}</div>` : '<p class="muted">Nothing poured yet.</p>'}
    </div>
  </section>`;
  renderStudioPreview();
};

/* ---------- party ---------- */
VIEWS.party = () => {
  if (!party.active) {
    view.innerHTML = `
    <section class="grid" style="max-width:760px;margin:0 auto">
      <div class="card">
        <h1>Study Party</h1>
        <p class="muted">Light candles with friends. Everyone's candle burns at the same time, and at the end you blow them out together and get a party cake.</p>
        <label class="field">Your name</label><input type="text" data-change="name" value="${esc(state.name)}" placeholder="Annika" style="width:100%">
        <div class="row" style="margin-top:18px"><button class="btn" data-act="createParty">Start a party</button></div>
        <label class="field" style="margin-top:24px">…or join with a code</label>
        <div class="row"><input type="text" data-change="joinCode" value="${esc(ui.joinCode)}" placeholder="ABCDE" style="width:160px;text-transform:uppercase;letter-spacing:.2em"><button class="btn rose" data-act="joinParty">Join</button></div>
      </div>
    </section>`;
    return;
  }
  const room = party.room || { members: [] };
  const sess = room.session;
  const now = party.serverNow();
  const live = sess && now < sess.startAt + sess.durationMs;
  const link = `${location.origin}${location.pathname}?party=${party.code}`;
  view.innerHTML = `
  <section class="grid" style="max-width:900px;margin:0 auto">
    <div class="card" style="text-align:center">
      <p class="muted">Party code</p>
      <div class="party-code">${party.code}</div>
      <div class="row" style="justify-content:center"><button class="btn ghost sm" data-act="copy" data-text="${esc(link)}">Copy invite link</button><button class="btn ghost sm" data-act="leaveParty">Leave party</button></div>
      <div class="members" style="justify-content:center">
        ${room.members.map((m) => `<div class="member">${candleSVG(getCandle(m.design), 'taper', m.status === 'quit' ? 0.45 : 1, { lit: m.status === 'burning', cls: '' })}<div>${room.host === m.id ? '<span class="crown">♛</span> ' : ''}${esc(m.name)}${m.id === party.memberId ? ' (you)' : ''}</div><div class="muted" style="font-size:.8rem">${esc(m.subject || '')} ${m.status !== 'idle' ? '· ' + m.status : ''}</div></div>`).join('')}
      </div>
      ${live ? `<p class="served">A party session is burning. <a href="#/focus">Join the flame →</a></p>`
        : party.isHost ? `
        <h3>Light everyone's candles</h3>
        <div class="chips" style="justify-content:center">${DURATIONS.map((x) => `<button class="chip ${state.settings.minutes === x.minutes ? 'on' : ''}" data-act="minutes" data-min="${x.minutes}">${x.minutes} min</button>`).join('')}</div>
        <p class="muted">Each person uses their own equipped candle and subject${state.settings.demo ? ' · demo speed is on' : ''}.</p>
        <button class="btn big" data-act="partyStart">Light together</button>`
        : '<p class="muted">Waiting for the host to light the candles…</p>'}
    </div>
  </section>`;
};

party.onChange((room) => {
  const s = room?.session;
  if (s && !state.active && state.lastPartySession !== s.id) {
    const me = room.members.find((m) => m.id === party.memberId);
    if (me?.status === 'burning' && party.serverNow() < s.startAt + s.durationMs) {
      party.status({ design: state.settings.design, subject: state.settings.subject });
      startFocus(s);
      return;
    }
  }
  if (ui.view === 'party') VIEWS.party();
  if (state.active?.party) ui.lastRem = -1;
});

/* ---------- recap ---------- */
VIEWS.recap = () => {
  const w = weekStats(ui.recapWeek);
  const t = totals();
  const maxDay = Math.max(30, ...w.perDay.map((d) => d.minutes));
  const subj = Object.entries(w.subjects).sort((a, b) => b[1] - a[1]);
  const maxSubj = Math.max(1, ...subj.map((s) => s[1]));
  const hours = (m) => (m / 60).toFixed(m % 60 ? 1 : 0);
  const impactGoal = 25;
  const impactHours = t.minutes / 60;
  view.innerHTML = `
  <section class="grid">
    <div class="card">
      <div class="row"><h1 style="margin:0">Weekly recap</h1><span class="spacer"></span>
        <button class="chip ${ui.recapWeek === 0 ? 'on' : ''}" data-act="recapWeek" data-id="0">This week</button>
        <button class="chip ${ui.recapWeek === 1 ? 'on' : ''}" data-act="recapWeek" data-id="1">Last week</button></div>
      <p class="served" style="text-align:left;margin:16px 0">You baked ${w.cakes} cake${w.cakes === 1 ? '' : 's'}, burned ${w.candles} candle${w.candles === 1 ? '' : 's'}, and studied ${hours(w.minutes)} hrs.</p>
      <div class="stats">
        <div class="stat"><b>${w.cakes}</b>cakes served</div>
        <div class="stat"><b>${w.candles}</b>candles melted</div>
        <div class="stat"><b>${hours(w.minutes)}</b>hours focused</div>
        <div class="stat"><b>${w.flames}</b>flames earned</div>
        <div class="stat"><b>${w.melted}</b>blown out early</div>
        <div class="stat"><b>${streak()}</b>day streak</div>
      </div>
    </div>
    <div class="bakery-top">
      <div class="card"><h2>Minutes per day</h2><div class="bars">${w.perDay.map((d) => `<div class="bar"><span class="muted">${d.minutes || ''}</span><i style="height:${(d.minutes / maxDay) * 100}%"></i>${d.label}</div>`).join('')}</div></div>
      <div class="card"><h2>By subject</h2>${subj.length ? subj.map(([k, v]) => `<div class="hbar"><div class="row"><span>${esc(k)}</span><span class="spacer"></span><span class="muted">${v} min</span></div><div class="track"><div class="fill" style="width:${(v / maxSubj) * 100}%"></div></div></div>`).join('') : '<p class="muted">Tag your candles with a subject and the breakdown shows up here.</p>'}</div>
    </div>
    <div class="card">
      <h2>Light a candle for a cause <span class="badge" style="background:#ffd27a">concept</span></h2>
      <p class="muted">Like Forest's real-tree planting: every ${impactGoal} hours studied across Candlelit could fund a real donation (e.g. school supplies or literacy programs). All-time you've studied <b>${impactHours.toFixed(1)} hrs</b> across ${t.candles} candles and ${t.cakes} cakes.</p>
      <div class="progress"><div style="width:${Math.min(100, ((impactHours % impactGoal) / impactGoal) * 100)}%"></div></div>
      <p class="muted" style="font-size:.9rem">${(impactGoal - (impactHours % impactGoal)).toFixed(1)} hrs until your next contribution.</p>
    </div>
    <div class="card plain">
      <h3>Settings</h3>
      <div class="row">
        <label>Name <input type="text" data-change="name" value="${esc(state.name)}" style="width:160px"></label>
        <span class="spacer"></span>
        <button class="btn ghost sm" data-act="reset">Reset all data</button>
      </div>
    </div>
  </section>`;
};

/* ---------- actions ---------- */
const actions = {
  closeModal,
  minutes: ({ min }) => { state.settings.minutes = +min; save(); route(); },
  design: ({ id }) => { state.settings.design = id; save(); if (party.active) party.status({ design: id }); route(); },
  subject: ({ id }) => { state.settings.subject = id; save(); route(); },
  ambience: ({ id }) => {
    const list = state.settings.ambience;
    state.settings.ambience = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    save();
    audio.setAmbience(state.settings.ambience);
    document.querySelectorAll(`[data-act="ambience"][data-id="${id}"]`).forEach((el) => el.classList.toggle('on', state.settings.ambience.includes(id)));
  },
  light: () => startFocus(null),
  giveUp: () => modal(`<h2>Blow it out early?</h2><p>A half-melted stub will be left on today's cake and you won't earn flames for this one.</p>
    <div class="row"><button class="btn" data-act="closeModal">Keep burning</button><button class="btn ghost" data-act="confirmGiveUp">Blow it out</button></div>`),
  confirmGiveUp: () => { closeModal(); finishSession(false); },
  blowTogether: () => {
    audio.blow();
    ui.blown = true;
    const el = $('#partyCandles');
    if (el) el.classList.add('blowing');
    setTimeout(() => { confetti(120); VIEWS.done(); }, 900);
  },
  startBreak: ({ min }) => startBreak(+min),
  endBreak: () => finishBreak(false),
  lightAnother: () => { state.pending = null; save(); if (party.active && party.isHost) party.reset().catch(() => {}); go('focus'); },
  clearPending: () => { state.pending = null; save(); },
  share: ({ cake }) => shareCard(cake),
  nativeShare: () => navigator.share({ files: [ui.shareFile], title: 'Candlelit', text: 'studying until my candle melts' }).catch(() => {}),
  serve: () => { const c = serveCake(); if (c) { confetti(80); toast('Cake served to your Bakery'); } route(); },
  cakeDesign: ({ id }) => { currentCake().design = id; state.settings.cakeDesign = id; save(); route(); },
  topper: ({ id }) => { const c = currentCake(); c.toppers = c.toppers.includes(id) ? c.toppers.filter((x) => x !== id) : [...c.toppers, id]; save(); route(); },
  cakeDetail: ({ id }) => {
    const c = state.gallery.find((x) => x.id === id);
    modal(`<h2>${esc(getCake(c.design).name)}</h2><p class="muted">Served ${c.served}</p>${cakeSVG(getCake(c.design), c.candles, c.toppers, cakeOpts({ seed: c.id }))}
      <h3>Study log</h3>${candleLog(c.candles)}<div class="row" style="margin-top:14px"><button class="btn" data-act="share" data-cake="${c.id}">Make share card</button></div>`);
  },
  shopTab: ({ id }) => { ui.shopTab = id; route(); },
  buy: ({ type, id }) => {
    const item = catalog(type, id);
    if (!spend('flames', item.price)) return toast('Not enough flames yet');
    state.owned[type + 's'].push(id);
    save();
    toast(`${esc(item.name)} is yours`);
    if (item.rarity === 'legendary') confetti(80);
    route();
  },
  equipCandle: ({ id }) => { state.settings.design = id; save(); toast('Equipped'); route(); },
  gift: ({ type, id }) => {
    const item = catalog(type, id);
    modal(`<h2>Gift ${esc(item.name)}</h2><p>Buy it for a friend for <b>${item.price} flames</b>. You'll get a code to send them.</p>
      <div class="row"><button class="btn rose" data-act="confirmGift" data-type="${type}" data-id="${id}" ${state.flames < item.price ? 'disabled' : ''}>Wrap it up (${item.price})</button></div>`);
  },
  confirmGift: ({ type, id }) => {
    const item = catalog(type, id);
    if (!spend('flames', item.price)) return toast('Not enough flames');
    const code = encodeGift({ type, id, from: state.name || 'a friend' });
    modal(`<h2>Gift wrapped</h2><p>Send this code to your friend. They can redeem it in the shop.</p><div class="code-box">${code}</div>
      <div class="row" style="margin-top:12px"><button class="btn" data-act="copy" data-text="${code}">Copy code</button></div>`);
    renderWallet();
  },
  redeem: () => {
    const g = decodeGift(ui.redeemCode || '');
    if (!g || !g.type || !catalog(g.type, g.id)) return toast('That gift code looks invalid');
    if (state.redeemed.includes(g.n)) return toast('Already redeemed');
    const list = state.owned[g.type + 's'];
    state.redeemed.push(g.n);
    if (!list.includes(g.id)) list.push(g.id);
    else state.flames += Math.round(catalog(g.type, g.id).price / 2);
    save();
    confetti(60);
    modal(`<h2>A gift from ${esc(g.from)}!</h2><p>You received <b>${esc(catalog(g.type, g.id).name)}</b>.</p>`);
    route();
  },
  copy: ({ text }) => { navigator.clipboard?.writeText(text).then(() => toast('Copied'), () => toast(text)); },
  studioOpt: ({ key, id }) => { ui.studio[key] = id; document.querySelectorAll(`[data-act="studioOpt"][data-key="${key}"]`).forEach((el) => el.classList.toggle('on', el.dataset.id === id)); renderStudioPreview(); },
  studioPattern: ({ id }) => { ui.studio.pattern = id; document.querySelectorAll('[data-act="studioPattern"]').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); renderStudioPreview(); },
  pour: () => {
    if (!spend('wax', STUDIO_COST)) return toast('Not enough wax drips');
    const d = { ...studioDesign(), id: 'custom-' + newId(), scent: ui.studio.scent, name: ui.studio.name || `${ui.studio.scent} candle` };
    state.custom.push(d);
    state.settings.design = d.id;
    save();
    confetti(50);
    toast(`Poured "${esc(d.name)}" and equipped it`);
    route();
  },
  createParty: async () => {
    if (!state.name) return toast('Add your name first');
    try { await party.create(state.name, state.settings.design); party.status({ subject: state.settings.subject }); route(); } catch (e) { toast(esc(e.message)); }
  },
  joinParty: async () => {
    if (!state.name) return toast('Add your name first');
    if (!ui.joinCode) return toast('Enter a party code');
    try { await party.join(ui.joinCode.toUpperCase(), state.name, state.settings.design); party.status({ subject: state.settings.subject }); route(); } catch (e) { toast(esc(e.message)); }
  },
  leaveParty: async () => { await party.leave(); route(); },
  partyStart: async () => {
    try {
      await party.status({ design: state.settings.design, subject: state.settings.subject });
      await party.start(state.settings.minutes, state.settings.minutes * msPerMin());
    } catch (e) { toast(esc(e.message)); }
  },
  recapWeek: ({ id }) => { ui.recapWeek = +id; route(); },
  reset: () => modal(`<h2>Reset everything?</h2><p>This deletes all cakes, candles, flames and sculptures on this device.</p><button class="btn ghost" data-act="confirmReset">Yes, reset</button>`),
  confirmReset: resetAll,
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.tagName === 'BUTTON' || el.dataset.act !== 'clearPending') e.preventDefault();
  if (el.dataset.act === 'clearPending') { actions.clearPending(); return; }
  actions[el.dataset.act]?.(el.dataset, el);
});
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

document.addEventListener('change', (e) => {
  const k = e.target.dataset.change;
  if (!k) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (k === 'customMin') { const n = Math.max(1, Math.min(180, parseInt(v, 10) || 25)); state.settings.minutes = n; save(); route(); }
  if (k === 'newSubject' && v.trim()) { const s = v.trim().slice(0, 24); if (!state.subjects.includes(s)) state.subjects.push(s); state.settings.subject = s; save(); route(); }
  if (k === 'demo') { state.settings.demo = v; save(); route(); }
  if (k === 'name') { state.name = v.trim().slice(0, 24); save(); }
});
document.addEventListener('input', (e) => {
  const k = e.target.dataset.change;
  if (k === 'volume') { state.settings.volume = +e.target.value; audio.setVolume(+e.target.value); save(); }
  if (k === 'joinCode') ui.joinCode = e.target.value.trim();
  if (k === 'redeem') ui.redeemCode = e.target.value.trim();
  if (k === 'name') state.name = e.target.value.trim().slice(0, 24);
  const s = e.target.dataset.studio;
  if (s) { ui.studio[s] = e.target.value; renderStudioPreview(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.dataset.change === 'newSubject') e.target.blur();
});

document.addEventListener('visibilitychange', () => {
  const a = state.active;
  if (!a || a.type !== 'focus' || Date.now() < a.startedAt) return;
  if (document.hidden) {
    a.distractions++;
    save();
    document.title = 'Your flame is flickering… come back';
  } else {
    ui.agitatedUntil = Date.now() + 6000;
    toast('Your flame flickered while you were away');
  }
});

/* ---------- boot ---------- */
audio.setVolume(state.settings.volume);
rolloverIfNewDay();
const params = new URLSearchParams(location.search);
if (params.get('party')) {
  ui.joinCode = params.get('party').toUpperCase();
  history.replaceState(null, '', location.pathname + '#/party');
}
if (state.settings.ambience.length) {
  window.addEventListener('pointerdown', () => audio.setAmbience(state.settings.ambience), { once: true });
}
party.resume().then(route);
route();
setInterval(tick, 250);
