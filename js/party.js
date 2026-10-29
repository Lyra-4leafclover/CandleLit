async function call(path, body) {
  const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Party server unavailable');
  return data;
}

export const party = {
  code: null,
  memberId: null,
  room: null,
  timer: null,
  listeners: new Set(),
  offset: 0,

  get active() { return !!this.code; },
  get isHost() { return this.room && this.room.host === this.memberId; },
  serverNow() { return Date.now() + this.offset; },

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { this.listeners.forEach((fn) => fn(this.room)); },
  setRoom(room) {
    this.room = room;
    if (room && room.now) this.offset = room.now - Date.now();
    this.emit();
  },

  async create(name, design) {
    const r = await call('/api/party/create', { name, design });
    this.code = r.code; this.memberId = r.memberId; this.setRoom(r.room); this.poll();
    sessionStorage.setItem('candlelit-party', JSON.stringify({ code: r.code, memberId: r.memberId }));
  },
  async join(code, name, design) {
    const r = await call('/api/party/join', { code, name, design });
    this.code = r.code; this.memberId = r.memberId; this.setRoom(r.room); this.poll();
    sessionStorage.setItem('candlelit-party', JSON.stringify({ code: r.code, memberId: r.memberId }));
  },
  async resume() {
    const saved = JSON.parse(sessionStorage.getItem('candlelit-party') || 'null');
    if (!saved) return;
    this.code = saved.code; this.memberId = saved.memberId;
    try { await this.refresh(); this.poll(); } catch { this.clear(); }
  },
  async refresh() {
    const room = await call(`/api/party/state?code=${this.code}&member=${this.memberId}`);
    this.setRoom(room);
  },
  poll() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.refresh().catch(() => {}), 2000);
  },
  async start(minutes, durationMs) { this.setRoom(await call('/api/party/start', { code: this.code, memberId: this.memberId, minutes, durationMs })); },
  async status(fields) { if (this.active) this.setRoom(await call('/api/party/status', { code: this.code, memberId: this.memberId, ...fields }).catch(() => this.room)); },
  async reset() { this.setRoom(await call('/api/party/reset', { code: this.code, memberId: this.memberId })); },
  async leave() {
    if (this.active) await call('/api/party/leave', { code: this.code, memberId: this.memberId }).catch(() => {});
    this.clear();
  },
  clear() {
    clearInterval(this.timer);
    this.code = null; this.memberId = null; this.room = null;
    sessionStorage.removeItem('candlelit-party');
    this.emit();
  },
};
