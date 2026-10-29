import { CANDLES, CAKES, TOPPERS, KINDS, DURATIONS, RARITY, STUDIO, STUDIO_COST, AMBIENCE, CAKE_SLOTS, kindFor } from './data.js';
import {
  state, save, resetAll, dayKey, newId, allCandles, getCandle, getCake, ownsCandle, streak, isBlue,
  replaceState, loadLocal, GUEST_KEY, setSync, flushSync,
  currentCake, serveCake, rolloverIfNewDay, applyStreakFreeze, addCandleToCake, spend, totals, encodeGift, decodeGift,
} from './store.js';
import { candleSVG, cakeSVG, sculptureSVG, setCakeStyle, setArtMode, getArtMode, PSTUDIO } from './render.js';
import * as audio from './audio.js';
import { party } from './party.js';
import { api, auth } from './api.js';
import { sceneSVG } from './scenes.js';
import { periodStats, barChart, donut, hourChart, trendChart, heatmap, tagColor, fmtMin, PALETTE } from './stats.js';

const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const BASE_TITLE = document.title;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (ms) => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : m) + ':' + String(s).padStart(2, '0');
};
const msPerMin = () => 60000;
const FLAME = '<svg class="ico" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1c1.5 4 6.5 6.5 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3.2 1.8-5.4 3.2-7.3.2 2.2 1.2 3.4 2.4 3.6-.4-3.3.1-6.2.9-8.8z"/></svg>';
const DROP = '<svg class="ico" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/></svg>';
const cakeOpts = (extra = {}) => ({ getDesign: getCandle, ...extra });

const ui = {
  view: 'focus', shopTab: 'candles', shopCol: 'All', statsPeriod: 'week', statsOffset: 0, taskTitle: '', taskTag: '', taskEst: 1, taskFilter: 'all', agitatedUntil: 0, lastRem: -1, lastAgitated: false,
  studioSlot: 'c1',
  wheel: { h: 0, s: 0, v: 1 },
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
    <span class="pill" title="Day streak · ${state.freeze?.left ?? 3} streak freezes left this month">${s}-day streak <span class="frz">❄${state.freeze?.left ?? 3}</span></span>`;
}

/* ---------- router ---------- */
const VIEWS = {};
function route() {
  const a = state.active;
  let name = location.hash.replace(/^#\/?/, '').split('?')[0] || 'focus';
  if (name === 'recap') name = 'stats';
  if (a?.type === 'focus') name = 'focus';
  else if (a?.type === 'break') name = 'break';
  else if (name === 'done' && !state.pending) name = 'focus';
  else if (name === 'break') name = 'focus';
  if (!VIEWS[name]) name = 'focus';
  const viewKey = name + (a ? ':' + a.type : '');
  if (ui.viewKey !== viewKey) { ui.viewKey = viewKey; window.scrollTo(0, 0); }
  ui.view = name;
  document.body.classList.toggle('immersive', !!a);
  document.querySelectorAll('#nav a').forEach((el) => el.classList.toggle('on', el.dataset.view === name));
  if (!a) { setDim(0); document.title = BASE_TITLE; }
  VIEWS[name]();
  renderWallet();
  renderAccount();
}
window.addEventListener('hashchange', route);
const go = (v) => { if (location.hash === '#/' + v) route(); else location.hash = '#/' + v; };

/* ---------- ambience ---------- */
function ambienceControls() {
  return `<div class="row">${AMBIENCE.map((a) => `<button class="chip ${state.settings.ambience.includes(a.id) ? 'on' : ''}" data-act="ambience" data-id="${a.id}">${a.label}</button>`).join('')}
    <input type="range" min="0" max="1" step="0.05" value="${state.settings.volume}" data-change="volume" title="Volume" style="width:110px"></div>`;
}

/* ---------- focus (setup) ---------- */
/* Recently used first, then newest acquired, then the rest from newest to oldest. */
function candleOrder(list) {
  let recent = state.recent;
  if (!recent) {
    const used = [...state.gallery.flatMap((c) => c.candles || []), ...(state.cake?.candles || [])].map((c) => c.design).reverse();
    recent = [...new Set([state.settings.design, ...used])].filter(Boolean).slice(0, 6);
  }
  const acq = state.acquired || {};
  const ownedAt = (id) => { const i = state.owned.candles.indexOf(id); return i >= 0 ? i : state.custom.findIndex((c) => c.id === id); };
  const rank = (c) => { const r = recent.indexOf(c.id); return r >= 0 ? [0, r] : [1, -(acq[c.id] || ownedAt(c.id))]; };
  return [...list].sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1]; });
}
const markAcquired = (id) => { state.acquired = { ...(state.acquired || {}), [id]: Date.now() }; };
VIEWS.focus = () => {
  if (state.active?.type === 'focus') return focusActive();
  const st = state.settings;
  const linkedTask = state.tasks.find((t) => t.id === st.taskId && !t.done);
  const d = getCandle(st.design);
  const kind = kindFor(st.minutes);
  const s = streak();
  const owned = candleOrder(allCandles().filter((c) => ownsCandle(c.id)));
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
      <label class="field">Task</label>
      <div class="row"><select data-change="linkTask" style="flex:1;min-width:220px"><option value="">No task, just focus</option>${state.tasks.filter((t) => !t.done).map((t) => `<option value="${t.id}" ${linkedTask?.id === t.id ? 'selected' : ''}>${esc(t.title)} · ${esc(t.tag)}</option>`).join('')}</select><a class="btn ghost sm" href="#/tasks">Manage to-do</a></div>
      <label class="field">Tag${linkedTask ? ' <span style="text-transform:none;letter-spacing:0;font-weight:500">· set by the linked task</span>' : ''}</label>
      <div class="chips">
        ${state.subjects.map((x) => `<button class="chip ${st.subject === x ? 'on' : ''}" data-act="subject" data-id="${esc(x)}" ${linkedTask ? 'disabled' : ''}>${esc(x)}</button>`).join('')}
        <input type="text" placeholder="+ add subject" data-change="newSubject" style="width:150px">
      </div>
      <label class="field">Ambience</label>
      ${ambienceControls()}
      <div class="row" style="margin-top:22px">
        <button class="btn big" data-act="light">Light the candle</button>
      </div>
      <p class="muted" style="margin-top:12px">Finish and the candle goes on today's cake, plus you earn <b>${Math.round(st.minutes * (s >= 7 ? 2 : 1))} flames</b>. Blow it out early and a half-melted stub goes on the cake instead. You'll see the cake once the timer ends.</p>
      <label class="field">Candle <span style="text-transform:none;letter-spacing:0;font-weight:500">· recently used first</span></label>
      <div class="candle-picker">
        ${owned.map((c) => `<div class="candle-opt ${c.id === st.design ? 'on' : ''}" data-act="design" data-id="${c.id}">${candleThumb(c, 'taper', false)}${esc(c.name)}</div>`).join('')}
        <a class="candle-opt" href="#/shop" style="display:flex;align-items:center;justify-content:center;text-decoration:none">+ more in the shop</a>
      </div>
    </div>
  </section>`;
};

function focusActive() {
  const a = state.active;
  view.innerHTML = `
  <section class="burn">
    <div class="burn-subject">${a.task ? esc(state.tasks.find((t) => t.id === a.task)?.title || '') + ' · ' : ''}${esc(a.subject)} · ${a.minutes} min${a.party ? ` · party ${esc(party.code || '')}` : ''}</div>
    <div id="time" class="time">${fmt(a.durationMs)}</div>
    <div id="stage" class="stage"></div>
    <div id="friends" class="friends"></div>
    ${a.party && party.active ? `<div class="burn-chat"><div id="burn-chat-log" class="chat-log mini">${chatLogHTML(party.room, 4)}</div><form class="chat-form"><input type="text" maxlength="240" placeholder="Say something to the party…" aria-label="Party message"><button class="btn sm" type="submit">Send</button><button class="btn ghost sm" type="button" data-act="cheerAll">Cheer everyone</button></form></div>` : ''}
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
  state.recent = [state.settings.design, ...(state.recent || []).filter((x) => x !== state.settings.design)].slice(0, 6);
  audio.unlock();
  audio.setAmbience(state.settings.ambience);
  const minutes = partySession ? partySession.minutes : state.settings.minutes;
  const linked = !partySession && state.tasks.find((t) => t.id === state.settings.taskId && !t.done);
  state.active = {
    type: 'focus',
    startedAt: partySession ? partySession.startAt - party.offset : Date.now(),
    durationMs: partySession ? partySession.durationMs : minutes * msPerMin(),
    minutes,
    kind: kindFor(minutes),
    design: state.settings.design,
    subject: linked ? linked.tag : state.settings.subject,
    task: linked ? linked.id : null,
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
  state.sessions.push({ date: dayKey(), minutes: completed ? a.minutes : Math.round(a.minutes * p), subject: a.subject, completed, flames, party: a.party, distractions: a.distractions, ts: Date.now(), task: a.task || null });
  const task = a.task && state.tasks.find((t) => t.id === a.task);
  if (task && completed) task.pomos++;
  state.flames += flames;
  state.wax += wax;
  const res = addCandleToCake(candle);
  let partyMembers = null;
  if (a.party && party.room) {
    partyMembers = party.room.members.map((m) => ({ name: m.name, design: m.design, status: m.id === party.memberId ? (completed ? 'done' : 'quit') : m.status, me: m.id === party.memberId }));
    if (completed) state.partyCakes.unshift({ id: newId(), date: dayKey(), code: party.code, minutes: a.minutes, members: partyMembers, design: party.room?.cake || 'funfetti' });
    party.status({ status: completed ? 'done' : 'quit' });
  }
  state.pending = { candle, flames, wax, served: res.served, cakeId: res.cake.id, completed, partyMembers, design: a.design, task: a.task || null };
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
        ${pd.task && state.tasks.some((t) => t.id === pd.task && !t.done) ? `<button class="btn sm" data-act="toggleTask" data-id="${pd.task}">Mark “${esc(state.tasks.find((t) => t.id === pd.task).title)}” done</button>` : ''}
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
      <div class="card scene-card scene-${state.settings.scene || 'plain'}">${sceneBg(state.settings.scene)}
        <h2>Cake in the oven</h2>
        ${cakeSVG(getCake(cake.design), cake.candles, cake.toppers, cakeOpts({ seed: cake.id }))}
        <p style="text-align:center" class="muted">${cake.candles.length}/${CAKE_SLOTS} candles · started ${cake.started}</p>
      </div>
      <div class="card">
        ${getArtMode() === 'drawn' ? `<div class="row" style="margin-bottom:14px"><h3 style="margin:0">Cake style</h3><span class="spacer"></span><div class="seg">${[['new', '3D'], ['classic', 'Classic']].map(([k, l]) => `<button class="${(state.settings.cakeStyle === 'classic' ? 'classic' : 'new') === k ? 'on' : ''}" data-act="cakeStyle" data-id="${k}">${l}</button>`).join('')}</div></div>` : ''}
        <div class="row" style="margin-bottom:14px"><h3 style="margin:0">Scene</h3><span class="spacer"></span><div class="chips">${SCENE_LIST.map(([k, l]) => `<button class="chip sm ${(state.settings.scene || 'plain') === k ? 'on' : ''}" data-act="scene" data-id="${k}">${l}</button>`).join('')}</div></div>
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
const SCENE_LIST = [['plain', 'Plain'], ['gingham', 'Gingham'], ['window', 'Window'], ['garden', 'Garden'], ['night', 'Night'], ['gothic', 'Gothic'], ['emo', 'Emo'], ['halloween2', 'Halloween'], ['christmas', 'Christmas'], ['cottagecore', 'Cottagecore'], ['gamer', 'Gamer'], ['minecraft', 'Minecraft'], ['chess', 'Chess'], ['soccer', 'Soccer'], ['basketball', 'Basketball'], ['tennis', 'Tennis'], ['baseball', 'Baseball'], ['volleyball', 'Volleyball'], ['golf', 'Golf']];
const SCENE_DIR = { gingham: 'art5', window: 'art5', garden: 'art5', night: 'art5', gothic: 'art6', emo: 'art6', halloween2: 'art6', christmas: 'art6', cottagecore: 'art6', gamer: 'art6', minecraft: 'art6', chess: 'art7', soccer: 'art7', basketball: 'art7', tennis: 'art7', baseball: 'art7', volleyball: 'art7', golf: 'art7' };
const PAINTED_SCENES = Object.keys(SCENE_DIR);
const sceneBg = (name) => (getArtMode() === 'painted' && PAINTED_SCENES.includes(name) ? `<img class="scene-bg" src="/${SCENE_DIR[name]}/scene_${name}.webp" alt="">` : sceneSVG(name));
function cardBackground(name) {
  if (getArtMode() === 'painted' && PAINTED_SCENES.includes(name)) return `<image href="/${SCENE_DIR[name]}/scene_${name}.webp" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>`;
  const svg = sceneSVG(name);
  return svg ? svg.replace('<svg class="scene-bg"', '<svg x="0" y="0" width="1080" height="1350"') : '';
}
async function inlineArt(svg) {
  const urls = [...new Set([...svg.matchAll(/href="(\/art\d?\/[^"]+)"/g)].map((m) => m[1]))];
  const data = await Promise.all(urls.map((u) => fetch(u).then((r) => r.blob()).then((b) => new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); })).catch(() => u)));
  urls.forEach((u, i) => { svg = svg.split(`href="${u}"`).join(`href="${data[i]}"`); });
  return svg;
}
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
  let card = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs><radialGradient id="bgG" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#fdf3ec"/><stop offset="1" stop-color="#f4e6dc"/></radialGradient>
    <radialGradient id="glowG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd9a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient></defs>
    <rect width="1080" height="1350" fill="url(#bgG)"/>
    ${cardBackground(state.settings.scene) || '<circle cx="540" cy="700" r="520" fill="url(#glowG)"/>'}
    ${cardBackground(state.settings.scene) ? '<rect x="110" y="95" width="860" height="250" rx="40" fill="#fffaf5" opacity=".86"/><rect x="230" y="1192" width="620" height="72" rx="36" fill="#fffaf5" opacity=".86"/>' : ''}
    <rect x="40" y="40" width="1000" height="1270" rx="56" fill="none" stroke="#1f1a1c" stroke-opacity=".08" stroke-width="3"/>
    <text x="540" y="${getArtMode() === 'painted' ? 178 : 150}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="46" fill="#e2668e">Candlelit</text>
    <text x="540" y="250" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="64" fill="#1f1a1c">${esc(headline)}</text>
    <text x="540" y="310" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#8a7f82">${Math.floor(mins / 60)}h ${mins % 60}m · studying until my candle melts</text>
    ${inner}
    <text x="540" y="1240" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#8a7f82">${esc(getCake(cake.design).name)} · ${streak()}-day streak</text>
  </svg>`;
  if (getArtMode() === 'painted' && !cardBackground(state.settings.scene)) {
    const deco = `<image href="/art4/dec_roses.webp" x="40" y="1040" width="230" height="249"/><image href="/art4/dec_roses.webp" x="1040" y="1040" width="230" height="249" transform="translate(2080,0) scale(-1,1)"/><image href="/art4/dec_bow.webp" x="495" y="34" width="90" height="108"/><image href="/art4/dec_butterfly.webp" x="830" y="70" width="150" height="110"/>`;
    card = card.replace(/<\/svg>\s*$/, `${deco}</svg>`);
  }
  card = await inlineArt(card.replace(/<image class="pflame"[^>]*\/>/g, ''));
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
        <div class="row" style="margin-top:14px"><button class="btn" data-act="downloadCard">Download PNG</button><a class="btn ghost" href="${png}" target="_blank" rel="noopener" download="candlelit-cake.png">Open image</a>${canShare ? '<button class="btn rose" data-act="nativeShare">Share…</button>' : ''}</div>
        <p class="muted small" style="margin-top:8px">If the download doesn't start, right-click the image (or press and hold on a phone) and choose <b>Save image</b>.</p>`);
      ui.shareFile = file;
      ui.shareBlob = blob;
    }, 'image/png');
  };
  img.src = url;
}

/* ---------- shop ---------- */
VIEWS.shop = () => {
  const tab = ui.shopTab;
  let items = '';
  if (tab === 'candles') {
    items = CANDLES.filter((c) => ui.shopCol === 'All' || (ui.shopCol === 'New drop' ? c.drop : c.collection === ui.shopCol)).map((c) => {
      const owned = ownsCandle(c.id);
      const unavailable = c.available === false;
      return `<div class="item-card ${c.rarity}">${candleThumb(c, 'taper')}<div class="row" style="gap:6px">${rarityBadge(c.rarity)}${c.drop ? '<span class="badge new">New drop</span>' : ''}${c.collection ? `<span class="muted" style="font-size:.75rem">${c.collection}</span>` : ''}</div><b>${esc(c.name)}</b>
        ${owned ? `<button class="btn sm ${state.settings.design === c.id ? 'ghost' : ''}" data-act="equipCandle" data-id="${c.id}">${state.settings.design === c.id ? 'Equipped' : 'Use'}</button>`
          : unavailable ? `<span class="muted">Returns in ${c.season}</span>`
          : `<button class="btn sm" data-act="buy" data-type="candle" data-id="${c.id}" ${state.flames < c.price ? 'disabled' : ''}>${FLAME} ${c.price}</button>`}
        ${!unavailable && c.price ? `<button class="btn ghost sm" data-act="gift" data-type="candle" data-id="${c.id}">Gift</button>` : ''}</div>`;
    }).join('');
  } else if (tab === 'cakes') {
    items = CAKES.map((c) => {
      const owned = state.owned.cakes.includes(c.id);
      const unavailable = c.available === false;
      return `<div class="item-card ${c.rarity}">${cakeSVG(c, [], [], cakeOpts({ cls: 'cake-svg thumb-cake' }))}${rarityBadge(c.rarity)}<b>${esc(c.name)}</b>
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
      ${tab === 'candles' ? `<div class="chips" style="margin-top:14px">${['All', 'New drop', ...new Set(CANDLES.map((c) => c.collection).filter(Boolean))].map((c) => `<button class="chip sm ${ui.shopCol === c ? 'on' : ''}" data-act="shopCol" data-id="${c}">${c}</button>`).join('')}</div>` : ''}
      <div class="shop-grid">${items}</div>
    </div>
  </section>`;
};

const catalog = (type, id) => (type === 'candle' ? CANDLES : type === 'cake' ? CAKES : TOPPERS).find((x) => x.id === id);

/* ---------- studio ---------- */
const SWATCHES = ['#fde4ec', '#f6c6d6', '#e2668e', '#fbe3c8', '#f2a65a', '#fff3c4', '#e8c35a', '#dff2d8', '#9fd68c', '#d8f0f2', '#7fd1c7', '#dbe8fb', '#7fa8e8', '#ece3fb', '#b49ce8', '#fffaf0', '#c8b8a6', '#3a2f3a'];
const hsvToHex = (h, s, v) => { const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
const hexToHsv = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b); let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return { h, s: mx ? d / mx : 0, v: mx }; };
function syncWheel(fromHex = true) {
  const s = ui.studio, k = ui.studioSlot || 'c1';
  if (fromHex) ui.wheel = hexToHsv(s[k]);
  const { h, s: sat, v } = ui.wheel, el = $('#wheel');
  if (!el) return;
  const rad = el.clientWidth / 2, a = (h * Math.PI) / 180;
  $('#wheelKnob').style.left = `${rad + Math.sin(a) * sat * rad}px`;
  $('#wheelKnob').style.top = `${rad - Math.cos(a) * sat * rad}px`;
  $('#wheelKnob').style.background = s[k];
  $('#wheelDim').style.opacity = String(1 - v);
  $('#wheelV').value = Math.round(v * 100);
  $('#wheelV').style.setProperty('--hue', hsvToHex(h, sat, 1));
  if (document.activeElement !== $('#wheelHex')) $('#wheelHex').value = s[k];
  const slot = document.querySelector(`.color-slot[data-id="${k}"]`);
  if (slot) { slot.querySelector('.sw').style.background = s[k]; slot.querySelector('small').textContent = s[k]; }
}
function setStudioColor(hex, fromHex = true) { ui.studio[ui.studioSlot || 'c1'] = hex; syncWheel(fromHex); renderStudioPreview(); }
function initWheel() {
  const el = $('#wheel');
  if (!el) return;
  const pick = (e) => {
    const r = el.getBoundingClientRect(), rad = r.width / 2, dx = e.clientX - r.left - rad, dy = e.clientY - r.top - rad;
    ui.wheel.h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    ui.wheel.s = Math.min(1, Math.hypot(dx, dy) / rad);
    if (ui.wheel.v < 0.15) ui.wheel.v = 1;
    setStudioColor(hsvToHex(ui.wheel.h, ui.wheel.s, ui.wheel.v), false);
  };
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); pick(e); });
  el.addEventListener('pointermove', (e) => { if (el.hasPointerCapture(e.pointerId)) pick(e); });
  $('#wheelV').addEventListener('input', (e) => { ui.wheel.v = +e.target.value / 100; setStudioColor(hsvToHex(ui.wheel.h, ui.wheel.s, ui.wheel.v), false); });
  $('#wheelHex').addEventListener('input', (e) => { let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) setStudioColor(v.toLowerCase()); });
  syncWheel();
}
const mixLight = (c) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(c.slice(i, i + 2), 16) + (255 - parseInt(c.slice(i, i + 2), 16)) * 0.5).toString(16).padStart(2, '0')).join('');
function studioDesign() {
  const s = ui.studio;
  if (getArtMode() === 'painted') return { id: 'preview', name: s.name || 'Untitled candle', shape: 'pstudio', body: s.pbody || 'pillar', holder: s.pholder || 'slice', pattern: s.ppattern && s.ppattern !== 'none' ? s.ppattern : undefined, decor: s.pdecor && s.pdecor !== 'none' ? s.pdecor : undefined, c1: s.c1, c2: s.c2, c3: s.c3, accent: s.c3, drip: mixLight(s.c1), rarity: 'custom' };
  return { id: 'preview', name: s.name || 'Untitled candle', pattern: s.pattern === 'solid' ? undefined : s.pattern, c1: s.c1, c2: s.c2, c3: s.c3, accent: s.c3, hc: s.holder === 'ornate' ? '#f6f0e6' : '#fbf3ea', drip: mixLight(s.c1), shape: s.shape, holder: s.holder, engrave: (s.engrave || '').slice(0, 18), decor: s.decor === 'none' ? [] : [s.decor], rarity: 'custom' };
}
const PNAMES = { pillar: 'Pillar', taper: 'Taper', votive: 'Votive', brass: 'Brass candlestick', rococo: 'Rococo porcelain', glass: 'Cut glass', pinkscroll: 'Pink scroll', silver: 'Silver', woodstick: 'Wood candlestick', chamber: 'Brass chamberstick', slice: 'Birch slice', pinkdish: 'Pink scallop dish', goldplate: 'Gold-rim plate', floralsaucer: 'Floral saucer', shelldish: 'Shell dish' };
const pname = (x) => PNAMES[x] || x[0].toUpperCase() + x.slice(1);
function paintedStudioOpts(s) {
  const body = s.pbody || 'pillar';
  const rows = [['pbody', 'Candle', PSTUDIO.bodies, body], ['pholder', 'Holder', PSTUDIO.holders, s.pholder || 'slice'], ['ppattern', 'Pattern', ['none', ...PSTUDIO.patterns], s.ppattern || 'none'], ['pdecor', 'Decoration', ['none', ...PSTUDIO.decors], s.pdecor || 'none']];
  return rows.map(([k, label, list, cur]) => `<label class="field">${label}</label><div class="chips">${list.map((x) => `<button class="chip ${cur === x ? 'on' : ''}" data-act="studioOpt" data-key="${k}" data-id="${x}">${pname(x)}</button>`).join('')}</div>`).join('') + (body !== 'taper' ? '<p class="muted" style="font-size:12px;margin:4px 0 0">Candlesticks fit taper candles; pillars and votives sit on dishes.</p>' : '');
}
function renderStudioPreview() {
  const el = $('#studio-preview');
  if (el) el.innerHTML = getArtMode() === 'painted' ? [1, 0.55].map((r) => candleSVG(studioDesign(), 'pillar', r, { lit: true, cls: '' })).join('') : ['birthday', 'taper', 'pillar'].map((k) => candleSVG(studioDesign(), k, 1, { lit: true, cls: '' })).join('');
}
VIEWS.studio = () => {
  const s = ui.studio;
  view.innerHTML = `
  <section class="studio-grid">
    <div class="card">
      <h1>Wax Studio</h1>
      <p class="muted">Pour your own candle with the wax drips you collect from sessions and breaks. Each pour costs <b>${STUDIO_COST} drips</b>. You have ${state.wax}.</p>
      <label class="field">Name</label><input type="text" data-studio="name" value="${esc(s.name)}" placeholder="e.g. Exam Season Survivor" style="width:100%">
      <label class="field">Engraving</label><input type="text" data-studio="engrave" value="${esc(s.engrave || '')}" maxlength="18" placeholder="e.g. you got this" style="width:100%">
      <label class="field">Colours</label>
      <div class="color-slots">${[['c1', 'Top'], ['c2', 'Bottom'], ['c3', 'Accent']].map(([k, l]) => `<button class="color-slot ${ui.studioSlot === k ? 'on' : ''}" data-act="colorSlot" data-id="${k}"><span class="sw" style="background:${s[k]}"></span><span class="cs-text"><b>${l}</b><small>${s[k]}</small></span></button>`).join('')}</div>
      <div class="wheel-wrap">
        <div class="wheel" id="wheel"><div class="wheel-dim" id="wheelDim"></div><span class="wheel-knob" id="wheelKnob"></span></div>
        <div class="wheel-side">
          <label class="muted" for="wheelV">Brightness</label><input type="range" id="wheelV" min="0" max="100">
          <label class="muted" for="wheelHex">Hex</label><input type="text" id="wheelHex" maxlength="7" spellcheck="false">
          <div class="swatches">${SWATCHES.map((c) => `<button class="swatch" data-act="swatch" data-id="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>
        </div>
      </div>
      ${getArtMode() === 'painted' ? paintedStudioOpts(s) : `${[['shape', 'Shape', STUDIO.shapes], ['holder', 'Holder', STUDIO.holders], ['decor', 'Decoration', STUDIO.decors]].map(([k, label, list]) => `<label class="field">${label}</label><div class="chips">${list.map((x) => `<button class="chip ${s[k] === x ? 'on' : ''}" data-act="studioOpt" data-key="${k}" data-id="${x}">${x}</button>`).join('')}</div>`).join('')}
      <label class="field">Pattern</label><div class="chips">${STUDIO.patterns.map((p) => `<button class="chip ${s.pattern === p ? 'on' : ''}" data-act="studioPattern" data-id="${p}">${p}</button>`).join('')}</div>`}
      <label class="field">Scent</label><select data-studio="scent">${STUDIO.scents.map((x) => `<option ${x === s.scent ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <label class="field">Presets</label><div class="chips">${state.studioPresets.map((p, i) => `<span class="chip-del-wrap"><button class="chip" data-act="loadPreset" data-id="${i}">${esc(p.name || 'Preset ' + (i + 1))}</button><button class="chip-del" data-act="delPreset" data-id="${i}" aria-label="Delete preset ${esc(p.name || '')}" title="Delete preset">×</button></span>`).join('')}<button class="chip" data-act="savePreset">+ Save current design</button></div>
      <div class="row" style="margin-top:22px"><button class="btn big" data-act="pour" ${state.wax < STUDIO_COST ? 'disabled' : ''}>Pour candle · ${DROP} ${STUDIO_COST}</button></div>
    </div>
    <div class="card">
      <div id="studio-preview" class="studio-preview"></div>
      <h3 style="margin-top:20px">Your poured candles</h3>
      ${state.custom.some((c) => !c.deleted) ? `<div class="candle-picker">${state.custom.filter((c) => !c.deleted).map((c) => `<div class="candle-opt ${state.settings.design === c.id ? 'on' : ''}" data-act="design" data-id="${c.id}"><button class="opt-del" data-act="delCustom" data-id="${c.id}" aria-label="Delete ${esc(c.name)}" title="Delete candle">×</button>${candleThumb(c, 'taper')}${esc(c.name)}<br><span class="muted">${esc(c.scent)}</span></div>`).join('')}</div>` : '<p class="muted">Nothing poured yet.</p>'}
    </div>
  </section>`;
  renderStudioPreview();
  initWheel();
};

/* ---------- party ---------- */
function chatLogHTML(room, limit = 60) {
  if (!room) return '';
  return room.chat.slice(-limit).map((c) => (c.system
    ? `<div class="msg sys ${c.cheer ? 'cheer' : ''}">${esc(c.text)}</div>`
    : `<div class="msg ${c.from === room.you ? 'me' : ''}"><b>${esc(c.from === room.you ? 'You' : c.name)}</b><span>${esc(c.text)}</span></div>`)).join('') || '<div class="msg sys">Say hi to your study buddies.</div>';
}
function partyMembersHTML(room) {
  return room.members.map((m) => {
    const me = m.id === room.you;
    return `<div class="member">${candleSVG(getCandle(m.design), 'taper', m.status === 'quit' ? 0.45 : 1, { lit: m.status === 'burning', cls: '' })}
      <div class="member-name">${room.host === m.id ? '<span class="crown" title="Host">♛</span> ' : ''}${esc(m.name)}${me ? ' (you)' : ''}</div>
      <div class="muted" style="font-size:.78rem">${esc(m.subject || '')}${m.status !== 'idle' ? ` · ${esc(m.status)}` : ''}</div>
      ${me ? '' : `<div class="member-actions"><button class="chip sm" data-act="cheer" data-id="${m.id}">Cheer</button>${party.isHost ? `<button class="chip sm" data-act="makeHost" data-id="${m.id}">Make host</button>` : ''}</div>`}</div>`;
  }).join('');
}
function partyControlsHTML(room) {
  const sess = room.session;
  const live = sess && party.serverNow() < sess.startAt + sess.durationMs;
  if (live) return `<p class="served">A party session is burning. <a href="#/focus">Join the flame →</a></p>`;
  if (!party.isHost) return '<p class="muted">Waiting for the host to light the candles…</p>';
  return `<h3>Light everyone's candles</h3>
    <div class="chips" style="justify-content:center">${DURATIONS.map((x) => `<button class="chip ${state.settings.minutes === x.minutes ? 'on' : ''}" data-act="minutes" data-min="${x.minutes}">${x.minutes} min</button>`).join('')}</div>
    <p class="muted">Everyone uses their own equipped candle and tag.</p>
    <button class="btn big" data-act="partyStart">Light together</button>`;
}
function partySetupHTML(room) {
  const sess = room.session;
  if (sess && party.serverNow() < sess.startAt + sess.durationMs) return '';
  const me = room.members.find((m) => m.id === room.you);
  const owned = allCandles().filter((c) => ownsCandle(c.id));
  const cakes = CAKES.filter((c) => state.owned.cakes.includes(c.id) || c.id === room.cake);
  const pc = getCake(room.cake);
  const preview = cakeSVG(pc, room.members.map((m) => ({ design: m.design, kind: 'taper', minutes: 25, subject: m.name })), [], cakeOpts({ seed: room.code, cls: 'cake-svg party-cake-preview' }));
  return `<div class="party-setup"><div class="party-setup-cake">${preview}<div class="muted" style="font-size:.85rem">Party cake: <b>${esc(pc.name)}</b></div></div>
    <div class="party-setup-pick"><label class="field">Your candle for this party</label><div class="mini-picker">${owned.map((c) => `<button class="mini-candle ${me?.design === c.id ? 'on' : ''}" data-act="partyCandle" data-id="${c.id}" title="${esc(c.name)}" aria-label="${esc(c.name)}">${candleSVG(c, 'taper', 1, { lit: false, cls: 'mini-thumb' })}</button>`).join('')}</div>
    ${party.isHost ? `<label class="field">Party cake</label><div class="chips">${cakes.map((c) => `<button class="chip sm ${room.cake === c.id ? 'on' : ''}" data-act="partyCake" data-id="${c.id}">${esc(c.name)}</button>`).join('')}</div>` : '<p class="muted" style="font-size:.85rem;margin-top:14px">The host picks the party cake.</p>'}</div></div>`;
}
function partyBoardHTML(room) {
  if (!room.board?.length) return '';
  return `<h3 style="margin-top:22px">Room leaderboard</h3><ol class="board">${room.board.map((b) => `<li><span>${esc(b.name)}</span><span class="muted">${b.sessions} session${b.sessions === 1 ? '' : 's'}</span><b>${fmtMin(b.minutes)}</b></li>`).join('')}</ol>`;
}
const lobbyCache = {};
function setIf(sel, html) { const el = $(sel); if (el && lobbyCache[sel] !== html) { lobbyCache[sel] = html; el.innerHTML = html; return true; } return false; }
function updatePartyLobby() {
  const room = party.room;
  if (!room) return;
  setIf('#party-members', partyMembersHTML(room));
  setIf('#party-setup', partySetupHTML(room));
  setIf('#party-controls', partyControlsHTML(room));
  setIf('#party-board', partyBoardHTML(room));
  const log = $('#chat-log');
  if (log) {
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
    if (setIf('#chat-log', chatLogHTML(room)) && atBottom) log.scrollTop = log.scrollHeight;
  }
}
VIEWS.party = () => {
  view.innerHTML = `<section class="grid" style="max-width:640px;margin:0 auto"><div class="card" style="text-align:center;padding:48px 32px">
    <p class="eyebrow">Coming soon</p>
    <h1>Study Party</h1>
    <p class="muted">Soon you'll be able to light candles with friends: everyone's candle burns together, then you blow them out at the same time and each get a party cake.</p>
    <a class="btn big" href="#/focus" style="margin-top:12px">Light a candle on your own</a>
  </div></section>`;
};

const SOCIALS = [
  { label: 'GitHub', handle: '@Lyra-4leafclover', url: 'https://github.com/Lyra-4leafclover', icon: '<path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>' },
  { label: 'X', handle: '@Lyra_void', url: 'https://x.com/Lyra_void', icon: '<path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"/>' },
  { label: 'Portfolio', handle: 'lyradossier.vercel.app', url: 'https://lyradossier.vercel.app/', icon: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8ZM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82A13.9 13.9 0 0 1 12 4.04ZM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26Zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.07 16Zm2.95-8H5.07a7.99 7.99 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8ZM12 19.96A14 14 0 0 1 10.09 16h3.82A14 14 0 0 1 12 19.96ZM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4Zm.26 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56ZM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38Z"/>' }
];
VIEWS.connect = () => {
  view.innerHTML = `<section class="grid" style="max-width:640px;margin:0 auto"><div class="card" style="text-align:center;padding:44px 32px">
    <p class="eyebrow">Connect with me</p>
    <h1>Hi, I'm Lyra</h1>
    <p class="muted">I made Candlelit. Say hi, see what else I'm building, or follow along.</p>
    <div class="socials">${SOCIALS.map((x) => `<a class="social" href="${x.url}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true">${x.icon}</svg><span><b>${x.label}</b><small>${x.handle}</small></span></a>`).join('')}</div>
  </div></section>`;
};

party.onChange((room) => {
  const s = room?.session;
  if (s && !state.active && state.lastPartySession !== s.id) {
    const me = room.members.find((m) => m.id === room.you);
    if (me?.status === 'burning' && party.serverNow() < s.startAt + s.durationMs) {
      party.status({ design: state.settings.design, subject: state.settings.subject });
      startFocus(s);
      return;
    }
  }
  if (ui.view === 'party') { if (party.active && $('#party-members')) updatePartyLobby(); else VIEWS.party(); }
  const bl = $('#burn-chat-log');
  if (bl && room) bl.innerHTML = chatLogHTML(room, 4);
  if (state.active?.party) ui.lastRem = -1;
});

/* ---------- stats ---------- */
VIEWS.stats = () => {
  const P = ui.statsPeriod, off = ui.statsOffset;
  const st = periodStats(P, off);
  const prev = periodStats(P, off + 1);
  const n = P === 'year' ? 5 : 8;
  const trend = Array.from({ length: n }, (_, i) => {
    const x = periodStats(P, off + n - 1 - i);
    const d = x.range.start;
    return { minutes: x.minutes, label: x.range.label, short: P === 'week' ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : P === 'month' ? d.toLocaleDateString(undefined, { month: 'short' }) : String(d.getFullYear()) };
  });
  const delta = prev.minutes ? Math.round(((st.minutes - prev.minutes) / prev.minutes) * 100) : null;
  const avg = st.activeDays ? Math.round(st.minutes / st.activeDays) : 0;
  const peak = Math.max(...st.hours);
  const peakH = st.hours.indexOf(peak);
  const hLabel = (h) => (h === 0 ? '12am' : h < 12 ? h + 'am' : h === 12 ? '12pm' : h - 12 + 'pm');
  const taskTags = Object.entries(st.tasksByTag).sort((x, y) => y[1] - x[1]);
  const maxT = Math.max(1, ...taskTags.map((x) => x[1]));
  const stat = (label, val, sub = '') => `<div class="stat"><span>${label}</span><b>${val}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  view.innerHTML = `
  <section class="grid">
    <div class="stats-head">
      <div><h1 style="margin:0">Stats</h1><p class="muted" style="margin:2px 0 0">${esc(st.range.label)}</p></div>
      <span class="spacer"></span>
      <div class="seg">${['week', 'month', 'year'].map((x) => `<button class="${P === x ? 'on' : ''}" data-act="statsPeriod" data-id="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
      <button class="btn ghost sm" data-act="exportCsv">Export CSV</button>
      <div class="row" style="gap:6px"><button class="icon-btn" data-act="statsShift" data-id="1" aria-label="Previous ${P}">‹</button><button class="icon-btn" data-act="statsShift" data-id="-1" ${off === 0 ? 'disabled' : ''} aria-label="Next ${P}">›</button></div>
    </div>
    <div class="stats">
      ${stat('Focus time', fmtMin(st.minutes), delta === null ? `this ${P}` : `<span class="${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%</span> vs last ${P}`)}
      ${stat('Pomodoros', st.done.length, `${st.blown} blown out early`)}
      ${stat('Daily average', fmtMin(avg), `${st.activeDays} active day${st.activeDays === 1 ? '' : 's'}`)}
      ${stat('Completion', st.rate + '%', 'sessions finished')}
      ${stat('Tasks done', st.tasksDone.length, `${Object.keys(st.tasksByTag).length} tag${Object.keys(st.tasksByTag).length === 1 ? '' : 's'}`)}
      ${stat('Cakes served', st.cakes, `${st.flames} flames earned`)}
      ${stat('Streak', `${streak()} day${streak() === 1 ? '' : 's'}`, (streak() >= 7 ? 'blue flame active' : `${7 - streak()} to blue flame`) + ` · ❄ ${state.freeze?.left ?? 3} freezes left`)}
      ${stat('Distractions', st.distractions, 'tab switches')}
    </div>
    ${insightHTML(st, prev, P)}
    ${P === 'week' ? goalsHTML(st) : ''}
    <div class="card"><div class="row"><h2 style="margin:0">Focus time</h2><span class="spacer"></span><span class="muted">${st.best?.total ? `Best ${P === 'year' ? 'month' : 'day'}: ${esc(st.best.full)} · ${fmtMin(st.best.total)}` : ''}</span></div>${barChart(st.buckets, { labelEvery: P === 'month' ? 3 : 1 })}</div>
    <div class="two">
      <div class="card"><h2>By tag</h2>${donut(st.byTag)}</div>
      <div class="card"><h2>Tasks completed by tag</h2>${taskTags.length ? taskTags.map(([k, v]) => `<div class="hbar"><span class="legend-row"><i style="background:${tagColor(k)}"></i>${esc(k)}</span><div class="track"><div class="fill" style="width:${(v / maxT) * 100}%;background:${tagColor(k)}"></div></div><b>${v}</b></div>`).join('') : `<p class="muted">No tasks finished this ${P}. <a href="#/tasks">Open your to-do list</a>.</p>`}</div>
    </div>
    <div class="two">
      <div class="card"><h2>When you focus</h2><p class="muted" style="margin-top:-6px">${peak ? `You focus most around <b>${hLabel(peakH)}</b>.` : 'Finish a few sessions to see your best hours.'}</p>${hourChart(st.hours)}</div>
      <div class="card"><h2>Trend</h2><p class="muted" style="margin-top:-6px">Focus time over your last ${n} ${P}s</p>${trendChart(trend)}</div>
    </div>
    ${P === 'year' ? `<div class="card"><h2>${st.range.start.getFullYear()} at a glance</h2>${heatmap(st.range.start.getFullYear())}</div>` : ''}
    <div class="card plain">
      <div class="row">${auth.user ? `<label class="muted">Display name <input type="text" data-change="displayName" value="${esc(auth.user.name)}" style="width:180px" maxlength="24"></label>` : ''}<span class="spacer"></span><button class="btn ghost sm" data-act="reset">Reset all data</button></div>
    </div>
  </section>`;
};

function insightHTML(st, prev, P) {
  if (!st.done.length) return `<div class="card insight"><div class="eyebrow">Your ${P} in review</div><p>No finished candles yet this ${P}. Light one and your summary shows up here.</p></div>`;
  const top = Object.entries(st.byTag).sort((a, b) => b[1] - a[1])[0];
  const peak = st.hours.indexOf(Math.max(...st.hours));
  const hl = (h) => (h === 0 ? '12am' : h < 12 ? h + 'am' : h === 12 ? '12pm' : h - 12 + 'pm');
  const lines = [`You focused for <b>${fmtMin(st.minutes)}</b> across <b>${st.done.length}</b> candle${st.done.length === 1 ? '' : 's'}${prev.minutes ? `, ${st.minutes >= prev.minutes ? 'up' : 'down'} <b>${Math.abs(Math.round(((st.minutes - prev.minutes) / prev.minutes) * 100))}%</b> from last ${P}` : ''}.`];
  if (top) lines.push(`Most of it went to <b>${esc(top[0])}</b> (${Math.round((top[1] / st.minutes) * 100)}%).`);
  if (Math.max(...st.hours)) lines.push(`Your sweet spot is around <b>${hl(peak)}</b>, so try putting hard tasks there.`);
  if (st.best?.total) lines.push(`Best ${P === 'year' ? 'month' : 'day'}: <b>${esc(st.best.full)}</b>.`);
  lines.push(st.rate >= 90 ? 'You almost never blow out early. Impressive.' : st.blown ? `${st.blown} candle${st.blown === 1 ? '' : 's'} got blown out early. Shorter sessions might help.` : '');
  return `<div class="card insight"><div class="eyebrow">Your ${P} in review</div><p>${lines.filter(Boolean).join(' ')}</p></div>`;
}
function goalsHTML(st) {
  const goals = Object.entries(state.goals).filter(([t, m]) => m > 0 && state.subjects.includes(t));
  return `<div class="card"><div class="row"><h2 style="margin:0">Weekly goals</h2><span class="spacer"></span><button class="btn ghost sm" data-act="editGoals">${goals.length ? 'Edit goals' : 'Set goals'}</button></div>
    ${goals.length ? goals.map(([t, m]) => { const done = st.byTag[t] || 0; const pct = Math.min(100, Math.round((done / m) * 100)); return `<div class="goal"><span class="legend-row"><i style="background:${tagColor(t)}"></i>${esc(t)}</span><div class="track"><div class="fill" style="width:${pct}%;background:${tagColor(t)}"></div></div><span class="muted">${fmtMin(done)} / ${fmtMin(m)}</span>${pct >= 100 ? '<span class="tag">done</span>' : ''}</div>`; }).join('') : '<p class="muted">Give a tag a weekly target, like 5 hours of Chem, and track it here.</p>'}</div>`;
}
function goalsEditor() {
  modal(`<h2>Weekly goals</h2><p class="muted" style="margin-top:-4px">Hours per week for each tag. Leave a tag at 0 for no goal.</p>
    <div class="tag-edit-list">${state.subjects.map((t) => `<div class="tag-edit" style="grid-template-columns:auto 1fr 110px"><span class="dot-btn" style="background:${tagColor(t)}"></span><span>${esc(t)}</span><input type="number" min="0" max="80" step="0.5" value="${(state.goals[t] || 0) / 60}" data-goal="${esc(t)}" aria-label="${esc(t)} hours per week"></div>`).join('')}</div>
    <div class="row" style="margin-top:16px"><button class="btn" data-act="closeModal">Done</button></div>`);
}
function exportCsv() {
  const rows = [['date', 'time', 'tag', 'task', 'minutes', 'completed', 'flames', 'distractions']];
  state.sessions.forEach((x) => rows.push([x.date, x.ts ? new Date(x.ts).toTimeString().slice(0, 5) : '', x.subject, state.tasks.find((t) => t.id === x.task)?.title || '', x.minutes, x.completed ? 'yes' : 'no', x.flames || 0, x.distractions || 0]));
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `candlelit-sessions-${dayKey()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- to-do ---------- */
VIEWS.tasks = () => {
  const f = ui.taskFilter;
  const match = (t) => f === 'all' || t.tag === f;
  const active = state.tasks.filter((t) => !t.done && match(t));
  const done = state.tasks.filter((t) => t.done && match(t)).sort((x, y) => String(y.doneAt).localeCompare(String(x.doneAt)));
  const today = dayKey();
  const doneToday = state.tasks.filter((t) => t.done && t.doneAt === today).length;
  const pomToday = state.sessions.filter((x) => x.completed && x.date === today && x.task).length;
  const usedTags = [...new Set(state.tasks.map((t) => t.tag))];
  const openByTag = {};
  state.tasks.filter((t) => !t.done).forEach((t) => { openByTag[t.tag] = (openByTag[t.tag] || 0) + 1; });
  const linked = state.settings.taskId;
  const row = (t) => `<li class="task ${t.done ? 'done' : ''} ${linked === t.id && !t.done ? 'linked' : ''}">
    <button class="check ${t.done ? 'on' : ''}" data-act="toggleTask" data-id="${t.id}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}"></button>
    <div class="task-main"><div class="task-title">${esc(t.title)}</div>
      <div class="task-meta"><span class="tagpill" style="--c:${tagColor(t.tag)}">${esc(t.tag)}</span><span class="pomos" title="${t.pomos} of ${t.est} pomodoros">${Array.from({ length: Math.max(t.est, t.pomos) }, (_, i) => `<i class="${i < t.pomos ? 'on' : ''}"></i>`).join('')}</span><span class="muted">${t.pomos}/${t.est}</span></div></div>
    ${t.done ? '' : `<button class="btn sm ${linked === t.id ? '' : 'ghost'}" data-act="focusTask" data-id="${t.id}">${linked === t.id ? 'Linked · start' : 'Focus'}</button>`}
    <button class="icon-btn" data-act="editTask" data-id="${t.id}" aria-label="Edit task">✎</button>
    <button class="icon-btn" data-act="deleteTask" data-id="${t.id}" aria-label="Delete task">×</button></li>`;
  view.innerHTML = `
  <section class="tasks-grid">
    <div class="grid">
      <div class="card">
        <h1 style="margin:0 0 4px">To-do</h1>
        <p class="muted" style="margin:0">Link a task to a pomodoro. Every task needs a tag so its focus time counts in your stats.</p>
        <input type="text" id="taskTitle" class="task-input" placeholder="What are you working on?" value="${esc(ui.taskTitle)}" data-input="taskTitle" maxlength="80">
        <label class="field">Tag <span class="req">required</span><button class="link-btn" data-act="editTags">Edit tags</button></label>
        <div class="chips" id="tagChips">${state.subjects.map((x) => `<button class="chip tagchip ${ui.taskTag === x ? 'on' : ''}" style="--c:${tagColor(x)}" data-act="taskTag" data-id="${esc(x)}"><i></i>${esc(x)}</button>`).join('')}<input type="text" placeholder="+ new tag" data-change="newTag" style="width:130px"></div>
        <label class="field">Estimated pomodoros</label>
        <div class="row"><div class="chips">${[1, 2, 3, 4, 5, 6].map((k) => `<button class="chip est ${ui.taskEst === k ? 'on' : ''}" data-act="taskEst" data-id="${k}">${k}</button>`).join('')}</div><span class="spacer"></span><button class="btn" data-act="addTask">Add task</button></div>
      </div>
      <div class="card">
        <div class="row"><h2 style="margin:0">Tasks</h2><span class="spacer"></span><div class="chips">${['all', ...usedTags].map((x) => `<button class="chip sm ${f === x ? 'on' : ''}" data-act="taskFilter" data-id="${esc(x)}">${x === 'all' ? 'All' : esc(x)}</button>`).join('')}</div></div>
        ${active.length ? `<ul class="task-list">${active.map(row).join('')}</ul>` : '<p class="muted">Nothing here. Add a task above.</p>'}
        ${done.length ? `<details class="done-list"><summary>Completed (${done.length})</summary><ul class="task-list">${done.map(row).join('')}</ul></details>` : ''}
      </div>
    </div>
    <aside class="grid">
      <div class="card tint-pink"><div class="eyebrow">Today</div><div class="big-n">${doneToday}</div><div class="muted">tasks done</div><div class="big-n" style="margin-top:14px">${pomToday}</div><div class="muted">pomodoros on tasks</div></div>
      <div class="card"><h3>Open by tag</h3>${Object.keys(openByTag).length ? Object.entries(openByTag).sort((x, y) => y[1] - x[1]).map(([k, v]) => `<div class="legend-row"><i style="background:${tagColor(k)}"></i><span>${esc(k)}</span><span class="spacer"></span><b>${v}</b></div>`).join('') : '<p class="muted">All clear.</p>'}
        <p class="muted" style="font-size:.85rem;margin-bottom:0">Want the full picture? <a href="#/stats">See your stats</a>.</p></div>
    </aside>
  </section>`;
};

/* ---------- tag & task editing ---------- */
function renameTag(old, nu) {
  nu = String(nu).trim().slice(0, 24);
  if (!nu || nu === old || !state.subjects.includes(old)) return false;
  const merge = state.subjects.includes(nu);
  state.subjects = merge ? state.subjects.filter((x) => x !== old) : state.subjects.map((x) => (x === old ? nu : x));
  const fix = (o, k) => { if (o && o[k] === old) o[k] = nu; };
  state.tasks.forEach((t) => fix(t, 'tag'));
  state.sessions.forEach((x) => fix(x, 'subject'));
  [state.cake, ...state.gallery].forEach((c) => c?.candles?.forEach((x) => fix(x, 'subject')));
  fix(state.active, 'subject');
  fix(state.settings, 'subject');
  if (state.tagColors[old] && !state.tagColors[nu]) state.tagColors[nu] = state.tagColors[old];
  delete state.tagColors[old];
  if (ui.taskTag === old) ui.taskTag = nu;
  if (ui.taskFilter === old) ui.taskFilter = nu;
  save();
  return true;
}
function tagEditor() {
  const uses = (t) => state.tasks.filter((x) => x.tag === t).length + state.sessions.filter((x) => x.subject === t).length;
  modal(`<h2>Edit tags</h2><p class="muted" style="margin-top:-4px">Renaming a tag updates its tasks and past stats. Click a dot to change its colour.</p>
    <div class="tag-edit-list">${state.subjects.map((t) => `<div class="tag-edit"><button class="dot-btn" style="background:${tagColor(t)}" data-act="tagColor" data-tag="${esc(t)}" aria-label="Change colour of ${esc(t)}"></button><input type="text" value="${esc(t)}" data-tagrename="${esc(t)}" maxlength="24" aria-label="Tag name"><span class="muted">${uses(t)} uses</span><button class="icon-btn" data-act="deleteTag" data-tag="${esc(t)}" ${state.subjects.length <= 1 ? 'disabled' : ''} aria-label="Delete ${esc(t)}">×</button></div>`).join('')}</div>
    <div class="row" style="margin-top:16px"><input type="text" placeholder="+ new tag" data-change="newTagModal" style="flex:1" maxlength="24"><button class="btn" data-act="closeModal">Done</button></div>`);
}
function taskEditor(id) {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  ui.edit = { id, tag: t.tag, est: t.est };
  modal(`<h2>Edit task</h2>
    <input type="text" id="editTitle" class="task-input" value="${esc(t.title)}" maxlength="80" aria-label="Task name">
    <label class="field">Tag <span class="req">required</span></label>
    <div class="chips">${state.subjects.map((x) => `<button class="chip tagchip ${t.tag === x ? 'on' : ''}" style="--c:${tagColor(x)}" data-act="editTaskTag" data-id="${esc(x)}"><i></i>${esc(x)}</button>`).join('')}</div>
    <label class="field">Estimated pomodoros</label>
    <div class="chips">${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<button class="chip ${t.est === k ? 'on' : ''}" data-act="editTaskEst" data-id="${k}">${k}</button>`).join('')}</div>
    <label class="field">Pomodoros done</label><input type="number" id="editPomos" min="0" max="99" value="${t.pomos}" style="width:110px">
    <div class="row" style="margin-top:24px"><button class="btn" data-act="saveTask">Save changes</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`);
  setTimeout(() => $('#editTitle')?.focus(), 0);
}

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
    markAcquired(id);
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
    const code = encodeGift({ type, id, from: auth.user?.name || state.name || 'a friend' });
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
    if (!list.includes(g.id)) { list.push(g.id); markAcquired(g.id); }
    else state.flames += Math.round(catalog(g.type, g.id).price / 2);
    save();
    confetti(60);
    modal(`<h2>A gift from ${esc(g.from)}!</h2><p>You received <b>${esc(catalog(g.type, g.id).name)}</b>.</p>`);
    route();
  },
  copy: ({ text }) => { navigator.clipboard?.writeText(text).then(() => toast('Copied'), () => toast(text)); },
  colorSlot: ({ id }) => { ui.studioSlot = id; document.querySelectorAll('.color-slot').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); syncWheel(); },
  swatch: ({ id }) => setStudioColor(id),
  studioOpt: ({ key, id }) => { ui.studio[key] = id; document.querySelectorAll(`[data-act="studioOpt"][data-key="${key}"]`).forEach((el) => el.classList.toggle('on', el.dataset.id === id)); renderStudioPreview(); },
  studioPattern: ({ id }) => { ui.studio.pattern = id; document.querySelectorAll('[data-act="studioPattern"]').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); renderStudioPreview(); },
  pour: () => {
    if (!spend('wax', STUDIO_COST)) return toast('Not enough wax drips');
    const d = { ...studioDesign(), id: 'custom-' + newId(), scent: ui.studio.scent, name: ui.studio.name || `${ui.studio.scent} candle` };
    state.custom.push(d);
    markAcquired(d.id);
    state.settings.design = d.id;
    save();
    confetti(50);
    toast(`Poured "${esc(d.name)}" and equipped it`);
    route();
  },
  createParty: async () => {
    try { await party.create(state.settings.design, state.settings.subject); route(); } catch (e) { toast(esc(e.message)); }
  },
  joinParty: async () => {
    const code = (ui.joinCode || '').trim().toUpperCase();
    if (code.length !== 5) return toast('Party codes are 5 letters');
    try { await party.join(code, state.settings.design, state.settings.subject); ui.joinCode = ''; route(); } catch (e) { toast(esc(e.message)); }
  },
  cheer: ({ id }) => party.cheer(+id).then(() => toast('Cheer sent')).catch((e) => toast(esc(e.message))),
  cheerAll: () => party.chat('🔥 Keep going, everyone!').catch(() => {}),
  makeHost: ({ id }) => party.makeHost(+id).catch((e) => toast(esc(e.message))),
  partyCandle: ({ id }) => { state.settings.design = id; save(); party.status({ design: id }); },
  partyCake: ({ id }) => party.send('/api/party/cake', { cake: id }).catch((e) => toast(esc(e.message))),
  saveRoom: () => party.send('/api/party/save', { name: `${auth.user.name}'s study room` }).then(() => {
    if (!state.savedRooms.some((r) => r.code === party.code)) state.savedRooms.push({ code: party.code, name: party.room.name });
    save(); toast('Saved. Rejoin this room any time with the same code.'); route();
  }).catch((e) => toast(esc(e.message))),
  openRoom: ({ id }) => party.join(id, state.settings.design, state.settings.subject).then(route).catch((e) => toast(esc(e.message))),
  shopCol: ({ id }) => { ui.shopCol = id; route(); },
  exportCsv: () => exportCsv(),
  editGoals: () => goalsEditor(),
  delPreset: ({ id }) => { state.studioPresets.splice(+id, 1); save(); route(); toast('Preset deleted'); },
  delCustom: ({ id }) => {
    const c = state.custom.find((x) => x.id === id);
    if (c) modal(`<h2>Delete "${esc(c.name)}"?</h2><p>It disappears from your candles. The wax drips you spent aren't refunded. Cakes it already sits on keep it.</p>
      <div class="row" style="margin-top:16px"><button class="btn" data-act="confirmDelCustom" data-id="${c.id}">Delete candle</button><button class="btn ghost" data-act="closeModal">Keep it</button></div>`);
  },
  confirmDelCustom: ({ id }) => {
    const c = state.custom.find((x) => x.id === id);
    if (c) c.deleted = true;
    if (state.settings.design === id) state.settings.design = state.owned.candles[0] || 'classic';
    save(); closeModal(); route(); toast('Candle deleted');
  },
  downloadCard: () => {
    if (!ui.shareBlob) return;
    const fr = new FileReader();
    fr.onload = () => {
      const a = document.createElement('a');
      a.href = fr.result;
      a.download = 'candlelit-cake.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast('Saved candlelit-cake.png');
    };
    fr.readAsDataURL(ui.shareBlob);
  },
  savePreset: () => { state.studioPresets.push({ ...ui.studio, name: ui.studio.name || `Preset ${state.studioPresets.length + 1}` }); state.studioPresets = state.studioPresets.slice(-12); save(); route(); toast('Preset saved'); },
  loadPreset: ({ id }) => { const p = state.studioPresets[+id]; if (p) { ui.studio = { ...ui.studio, ...p }; route(); } },
  scene: ({ id }) => { state.settings.scene = id; save(); route(); },
  setPalette: ({ id }) => { localStorage.setItem('candlelit-palette', id); applyTheme(); },
  setArtMode: ({ id }) => { state.settings.artMode = id; setArtMode(id); save(); renderAccount(); route(); },
  toggleTheme: () => { localStorage.setItem('candlelit-theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); applyTheme(); },
  setTheme: ({ id }) => { localStorage.setItem('candlelit-theme', id); applyTheme(); },
  accountMenu: () => { ui.menuOpen = !ui.menuOpen; renderAccount(); },
  goStats: () => { ui.menuOpen = false; go('stats'); },
  signIn: () => { if (state.active) return toast('Finish your session first'); ui.menuOpen = false; showAuth('login'); },
  signOut: async () => {
    if (state.active) return toast('Finish your session first');
    ui.menuOpen = false;
    await flushSync();
    await party.leave();
    await auth.logout();
    setSync(null);
    replaceState(loadLocal(GUEST_KEY), GUEST_KEY);
    localStorage.removeItem('candlelit-guest');
    showAuth('login');
  },
  authMode: ({ id }) => showAuth(id),
  guest: () => { localStorage.setItem('candlelit-guest', '1'); countVisit(true); startApp(); },
  leaveParty: async () => { await party.leave(); route(); },
  partyStart: async () => {
    try {
      await party.status({ design: state.settings.design, subject: state.settings.subject });
      await party.start(state.settings.minutes, state.settings.minutes * msPerMin());
    } catch (e) { toast(esc(e.message)); }
  },
  cakeStyle: ({ id }) => { state.settings.cakeStyle = id; setCakeStyle(id); save(); route(); },
  editTags: () => tagEditor(),
  tagColor: ({ tag }) => { const i = PALETTE.indexOf(tagColor(tag)); state.tagColors[tag] = PALETTE[(i + 1) % PALETTE.length]; save(); route(); tagEditor(); },
  deleteTag: ({ tag }) => {
    if (state.subjects.length <= 1) return toast('Keep at least one tag');
    const n = state.tasks.filter((t) => t.tag === tag).length;
    const btn = (mode, label, cls = '') => `<button class="btn ${cls}" data-act="confirmDelTag" data-tag="${esc(tag)}" data-mode="${mode}">${label}</button>`;
    modal(`<h2>Delete the “${esc(tag)}” tag?</h2><p>Your stats keep every session you logged under ${esc(tag)} either way. You just won't be able to pick it for new tasks or pomodoros.</p>
      ${n ? `<p><b>${n} task${n === 1 ? '' : 's'}</b> use${n === 1 ? 's' : ''} this tag.</p>` : ''}
      <div class="row" style="margin-top:16px;flex-wrap:wrap">${n ? btn('keep', 'Keep its tasks') + btn('purge', `Delete its task${n === 1 ? '' : 's'} too`, 'ghost') : btn('keep', 'Delete tag')}<button class="btn ghost" data-act="tagEditorBack">Cancel</button></div>`);
  },
  confirmDelTag: ({ tag, mode }) => {
    if (!state.subjects.includes(tag)) return tagEditor();
    state.tagColors[tag] = tagColor(tag);
    state.subjects = state.subjects.filter((x) => x !== tag);
    if (mode === 'purge') state.tasks = state.tasks.filter((t) => t.tag !== tag);
    if (state.settings.subject === tag) state.settings.subject = state.subjects[0];
    save(); route(); tagEditor();
    toast(mode === 'purge' ? `Deleted “${esc(tag)}” and its tasks. Its stats history stays.` : `Deleted “${esc(tag)}”. Its tasks and stats history stay.`);
  },
  tagEditorBack: () => tagEditor(),
  editTask: ({ id }) => taskEditor(id),
  editTaskTag: ({ id }) => { ui.edit.tag = id; document.querySelectorAll('#modal [data-act="editTaskTag"]').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); },
  editTaskEst: ({ id }) => { ui.edit.est = +id; document.querySelectorAll('#modal [data-act="editTaskEst"]').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); },
  saveTask: () => {
    const t = state.tasks.find((x) => x.id === ui.edit?.id);
    if (!t) return closeModal();
    const title = ($('#editTitle')?.value || '').trim();
    if (!title) { toast('A task needs a name'); return; }
    if (t.tag !== ui.edit.tag) {
      state.sessions.forEach((x) => { if (x.task === t.id) x.subject = ui.edit.tag; });
      if (state.settings.taskId === t.id) state.settings.subject = ui.edit.tag;
    }
    t.title = title.slice(0, 80);
    t.tag = ui.edit.tag;
    t.est = ui.edit.est;
    t.pomos = Math.max(0, Math.min(99, parseInt($('#editPomos')?.value, 10) || 0));
    save(); closeModal(); route();
    toast('Task updated');
  },
  statsPeriod: ({ id }) => { ui.statsPeriod = id; ui.statsOffset = 0; route(); },
  statsShift: ({ id }) => { ui.statsOffset = Math.max(0, ui.statsOffset + +id); route(); },
  taskTag: ({ id }) => { ui.taskTag = id; $('#tagChips')?.classList.remove('invalid'); document.querySelectorAll('[data-act="taskTag"]').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); },
  taskEst: ({ id }) => { ui.taskEst = +id; document.querySelectorAll('[data-act="taskEst"]').forEach((el) => el.classList.toggle('on', el.dataset.id === id)); },
  taskFilter: ({ id }) => { ui.taskFilter = id; route(); },
  addTask: () => {
    const title = ui.taskTitle.trim();
    if (!title) { toast('Give the task a name first'); $('#taskTitle')?.focus(); return; }
    if (!ui.taskTag) {
      const el = $('#tagChips');
      if (el) { el.classList.remove('invalid'); void el.offsetWidth; el.classList.add('invalid'); }
      toast('Pick a tag. Tags are how tasks show up in your stats.');
      return;
    }
    state.tasks.unshift({ id: newId(), title: title.slice(0, 80), tag: ui.taskTag, est: ui.taskEst, pomos: 0, done: false, createdAt: dayKey(), doneAt: null });
    ui.taskTitle = '';
    save(); route();
    setTimeout(() => $('#taskTitle')?.focus(), 0);
  },
  toggleTask: ({ id }) => {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    t.doneAt = t.done ? dayKey() : null;
    if (t.done) { if (state.settings.taskId === id) state.settings.taskId = null; confetti(30); toast(`Done: ${esc(t.title)}`); }
    save(); route();
  },
  deleteTask: ({ id }) => {
    state.tasks = state.tasks.filter((x) => x.id !== id);
    if (state.settings.taskId === id) state.settings.taskId = null;
    save(); route();
  },
  focusTask: ({ id }) => {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    state.settings.taskId = id;
    state.settings.subject = t.tag;
    save(); go('focus');
  },
  reset: () => modal(`<h2>Reset everything?</h2><p>This deletes all cakes, candles, flames and sculptures on this device.</p><button class="btn ghost" data-act="confirmReset">Yes, reset</button>`),
  confirmReset: resetAll,
};

document.addEventListener('click', (e) => {
  if (ui.menuOpen && !e.target.closest('#account')) { ui.menuOpen = false; renderAccount(); }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.tagName === 'BUTTON' || el.dataset.act !== 'clearPending') e.preventDefault();
  if (el.dataset.act === 'clearPending') { actions.clearPending(); return; }
  actions[el.dataset.act]?.(el.dataset, el);
});
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

document.addEventListener('change', (e) => {
  const k = e.target.dataset.change;
  if (!k && e.target.dataset.tagrename === undefined && e.target.dataset.goal === undefined) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (k === 'customMin') { const n = Math.max(1, Math.min(180, parseInt(v, 10) || 25)); state.settings.minutes = n; save(); route(); }
  if (k === 'newSubject' && v.trim()) { const s = v.trim().slice(0, 24); if (!state.subjects.includes(s)) state.subjects.push(s); state.settings.subject = s; save(); route(); }
  if (e.target.dataset.tagrename !== undefined) { if (renameTag(e.target.dataset.tagrename, v)) { route(); tagEditor(); } return; }
  if (k === 'newTagModal' && v.trim()) { const s = v.trim().slice(0, 24); if (!state.subjects.includes(s)) state.subjects.push(s); save(); route(); tagEditor(); return; }
  if (e.target.dataset.goal !== undefined) { state.goals[e.target.dataset.goal] = Math.max(0, Math.round((parseFloat(v) || 0) * 60)); save(); route(); return; }
  if (k === 'linkTask') { const t = state.tasks.find((x) => x.id === v); state.settings.taskId = t ? t.id : null; if (t) state.settings.subject = t.tag; save(); route(); }
  if (k === 'newTag' && v.trim()) { const s = v.trim().slice(0, 24); if (!state.subjects.includes(s)) state.subjects.push(s); ui.taskTag = s; save(); route(); }
  if (k === 'name') { state.name = v.trim().slice(0, 24); save(); }
  if (k === 'displayName' && v.trim()) auth.rename(v.trim()).then(() => { toast('Name updated'); renderAccount(); }).catch((er) => toast(esc(er.message)));
});
document.addEventListener('input', (e) => {
  const k = e.target.dataset.change;
  if (k === 'volume') { state.settings.volume = +e.target.value; audio.setVolume(+e.target.value); save(); }
  if (k === 'joinCode') ui.joinCode = e.target.value.trim();
  if (k === 'redeem') ui.redeemCode = e.target.value.trim();
  if (k === 'name') state.name = e.target.value.trim().slice(0, 24);
  if (e.target.dataset.input === 'taskTitle') ui.taskTitle = e.target.value;
  const s = e.target.dataset.studio;
  if (s) { ui.studio[s] = e.target.value; renderStudioPreview(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.target.dataset.change === 'newSubject' || e.target.dataset.change === 'newTag')) e.target.blur();
  if (e.key === 'Enter' && e.target.id === 'taskTitle') actions.addTask();
  if (e.key === 'Enter' && e.target.id === 'editTitle') actions.saveTask();
  if (e.key === 'Enter' && (e.target.dataset.tagrename !== undefined || e.target.dataset.change === 'newTagModal')) e.target.blur();
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

/* ---------- theme & account ---------- */
const SUN = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>';
const themePref = () => localStorage.getItem('candlelit-theme') || 'system';
const PALETTES = [['blush', '#f2b8cf'], ['lavender', '#b9b5f0'], ['matcha', '#a9d6a0'], ['ocean', '#9fd3e6'], ['peach', '#f5b48a']];
const palettePref = () => localStorage.getItem('candlelit-palette') || 'blush';
function applyTheme() {
  const t = themePref();
  const d = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = d ? 'dark' : 'light';
  document.documentElement.dataset.palette = palettePref();
  renderAccount();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
function renderAccount() {
  const el = $('#account');
  if (!el) return;
  const dark = document.documentElement.dataset.theme === 'dark';
  const u = auth.user;
  el.innerHTML = `<div class="seg seg-sm mode-switch" role="group" aria-label="Art style">${[['painted', 'Watercolor'], ['drawn', 'Classic']].map(([k, l]) => `<button class="${getArtMode() === k ? 'on' : ''}" data-act="setArtMode" data-id="${k}" aria-pressed="${getArtMode() === k}">${l}</button>`).join('')}</div><button class="icon-btn" data-act="toggleTheme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode" title="${dark ? 'Light' : 'Dark'} mode">${dark ? SUN : MOON}</button>
    ${u ? `<button class="avatar" data-act="accountMenu" aria-label="Account menu" aria-expanded="${!!ui.menuOpen}">${esc((u.name || '?')[0].toUpperCase())}</button>` : '<button class="btn sm" data-act="signIn">Sign in</button>'}
    ${ui.menuOpen && u ? `<div class="menu" role="menu"><div class="menu-head"><b>${esc(u.name)}</b><span class="muted">${u.username.includes("@") ? "" : "@"}${esc(u.username)}</span></div>
      <div class="menu-label">Theme</div><div class="seg seg-sm">${['light', 'dark', 'system'].map((t) => `<button class="${themePref() === t ? 'on' : ''}" data-act="setTheme" data-id="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
      <div class="menu-label">Accent</div><div class="swatches">${PALETTES.map(([k, c]) => `<button class="swatch ${palettePref() === k ? 'on' : ''}" style="background:${c}" data-act="setPalette" data-id="${k}" aria-label="${k} accent" title="${k}"></button>`).join('')}</div>
      <button class="menu-item" data-act="goStats">Stats &amp; settings</button>
      <button class="menu-item danger" data-act="signOut">Sign out</button></div>` : ''}`;
}

/* ---------- auth screen ---------- */
function showAuth(mode = ui.authMode || 'login') {
  ui.authMode = mode;
  document.body.classList.add('auth-mode');
  document.body.classList.remove('immersive');
  view.innerHTML = `
  <section class="auth">
    <div class="auth-art">
      <div class="auth-brand"><span class="brand-mark"></span>Candlelit</div>
      <div class="auth-candles">${[['rosestick', 1], ['striped', 0.72], ['teacup', 0.85]].map(([id, r], i) => candleSVG(getCandle(id), 'taper', r, { lit: true, sparkles: i === 0, cls: 'auth-candle' })).join('')}</div>
      <h1>Study until your candle melts.</h1>
      <p>Light a candle, focus until it burns down, and fill your bakery with cakes.</p>
    </div>
    <div class="auth-card">
      <div class="seg auth-seg"><button class="${mode === 'login' ? 'on' : ''}" data-act="authMode" data-id="login">Sign in</button><button class="${mode === 'signup' ? 'on' : ''}" data-act="authMode" data-id="signup">Create account</button></div>
      <h2>${mode === 'login' ? 'Welcome back' : 'Make your account'}</h2>
      <p class="muted">${mode === 'login' ? 'Sign in to pick up where you left off.' : 'Your candles, cakes, tasks and stats save to your account.'}</p>
      <form id="authForm" novalidate>
        ${mode === 'signup' ? '<label class="field" for="f-name">Display name <span class="muted">(optional)</span></label><input id="f-name" type="text" name="name" placeholder="Annika" maxlength="24" autocomplete="nickname">' : ''}
        <label class="field" for="f-user">Email</label><input id="f-user" type="email" name="email" maxlength="254" autocomplete="${mode === 'signup' ? 'email' : 'username'}" autocapitalize="off" spellcheck="false" placeholder="you@example.com">
        <label class="field" for="f-pass">Password</label><input id="f-pass" type="password" name="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'signup' ? 'at least 8 characters' : ''}">
        <p class="auth-error" id="authError" role="alert"></p>
        <button class="btn big" type="submit" style="width:100%">${mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <div class="auth-alt"><button class="link-btn" data-act="guest">Continue as guest</button><span class="muted">Guest progress stays on this device.</span></div>
    </div>
  </section>`;
  setTimeout(() => $('#authForm input')?.focus(), 0);
}

async function enterAccount(user) {
  const key = `candlelit-u${user.id}`;
  let remote = null;
  try { remote = await api('/api/state'); } catch { remote = null; }
  let version = remote?.version || 0;
  const push = (st) => api('/api/state', { data: st, base: version }, 'PUT').then((r) => { version = r.version; ui.syncError = false; }).catch(async (e) => {
    if (e.status !== 409) { ui.syncError = true; return; }
    const fresh = await api('/api/state').catch(() => null);
    if (!fresh?.data) { ui.syncError = true; return; }
    version = fresh.version;
    replaceState(fresh.data, key);
    if (started) { renderWallet(); route(); }
    toast('Your account changed in another tab, so this tab reloaded it.');
  });
  if (remote?.data) replaceState(remote.data, key);
  else {
    replaceState(loadLocal(key) || loadLocal(GUEST_KEY), key);
    await push(state);
  }
  setSync(push);
}

let started = false;
function startApp() {
  document.body.classList.remove('auth-mode');
  if (!state.settings.v3art) { state.settings.v3art = true; state.settings.cakeStyle = 'painted'; }
  setCakeStyle(state.settings.cakeStyle);
  setArtMode(state.settings.artMode);
  audio.setVolume(state.settings.volume);
  rolloverIfNewDay();
  const froze = applyStreakFreeze();
  if (froze) setTimeout(() => toast(`A streak freeze covered ${froze} missed day${froze === 1 ? '' : 's'}. Your ${streak()}-day streak is safe.`), 600);
  route();
  if (!started) {
    started = true;
    setInterval(tick, 250);
    if (state.settings.ambience.length) window.addEventListener('pointerdown', () => audio.setAmbience(state.settings.ambience), { once: true });
  }
}

document.addEventListener('submit', async (e) => {
  if (e.target.id === 'authForm') {
    e.preventDefault();
    const f = new FormData(e.target);
    const err = $('#authError');
    const btn = e.target.querySelector('button[type=submit]');
    const username = String(f.get('email') || '').trim(), password = String(f.get('password') || '');
    if (!username || !password) { err.textContent = 'Enter your email and password.'; return; }
    if (ui.authMode === 'signup' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username)) { err.textContent = 'Enter a valid email address.'; return; }
    if (ui.authMode === 'signup' && password.length < 8) { err.textContent = 'Use at least 8 characters for your password.'; return; }
    btn.disabled = true;
    try {
      const user = ui.authMode === 'signup' ? await auth.signup(username, password, String(f.get('name') || '').trim()) : await auth.login(username, password);
      localStorage.removeItem('candlelit-guest');
      await enterAccount(user);
      startApp();
      toast(ui.authMode === 'signup' ? `Welcome, ${esc(user.name)}!` : `Welcome back, ${esc(user.name)}`);
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    return;
  }
  if (e.target.classList.contains('chat-form')) {
    e.preventDefault();
    const inp = e.target.querySelector('input');
    const t = inp.value.trim();
    if (!t) return;
    inp.value = '';
    try { await party.chat(t); const log = $('#chat-log'); if (log) log.scrollTop = log.scrollHeight; } catch (ex) { toast(esc(ex.message)); }
  }
});
window.addEventListener('beforeunload', () => { flushSync(); });

/* ---------- boot ---------- */
function countVisit(guest) { api('/api/visit', { guest }).catch(() => {}); }
const params = new URLSearchParams(location.search);
if (params.get('party')) history.replaceState(null, '', location.pathname + '#/party');
applyTheme();
(async () => {
  let user = null;
  try { user = await auth.me(); } catch { user = null; }
  if (user) { await enterAccount(user); startApp(); }
  else if (localStorage.getItem('candlelit-guest') === '1') startApp();
  else showAuth(ui.joinCode ? 'signup' : 'login');
  if (!sessionStorage.getItem('candlelit-visit')) {
    sessionStorage.setItem('candlelit-visit', '1');
    countVisit(!user && localStorage.getItem('candlelit-guest') === '1');
  }
})();
