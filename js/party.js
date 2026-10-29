import { api } from './api.js';

export const party = {
  room: null,
  timer: null,
  listeners: new Set(),
  offset: 0,
  lastChat: 0,

  get active() { return !!this.room; },
  get code() { return this.room?.code || null; },
  get memberId() { return this.room?.you ?? null; },
  get isHost() { return !!this.room && this.room.host === this.room.you; },
  serverNow() { return Date.now() + this.offset; },

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { this.listeners.forEach((fn) => fn(this.room)); },
  setRoom(room) {
    this.room = room || null;
    if (room?.now) this.offset = room.now - Date.now();
    if (room) this.poll(); else clearInterval(this.timer);
    this.emit();
  },

  async create(design, subject) { this.setRoom((await api('/api/party/create', { design, subject })).room); },
  async join(code, design, subject) { this.setRoom((await api('/api/party/join', { code, design, subject })).room); },
  async resume() { try { this.setRoom((await api('/api/party/mine')).room); } catch { this.setRoom(null); } },
  async refresh() {
    try { this.setRoom((await api('/api/party/ping', {})).room); } catch (e) { if (e.status === 404 || e.status === 401) this.setRoom(null); }
  },
  poll() {
    if (this.timer) return;
    this.timer = setInterval(() => { if (this.room) this.refresh(); else { clearInterval(this.timer); this.timer = null; } }, 2000);
  },
  async send(path, body = {}) { if (this.active) this.setRoom((await api(path, body)).room); },
  start(minutes, durationMs) { return this.send('/api/party/start', { minutes, durationMs }); },
  status(fields) { return this.send('/api/party/status', fields).catch(() => {}); },
  reset() { return this.send('/api/party/reset'); },
  chat(text) { return this.send('/api/party/chat', { text }); },
  cheer(to) { return this.send('/api/party/cheer', { to }); },
  makeHost(to) { return this.send('/api/party/host', { to }); },
  async leave() { if (this.active) await api('/api/party/leave', {}).catch(() => {}); clearInterval(this.timer); this.timer = null; this.setRoom(null); },
};
