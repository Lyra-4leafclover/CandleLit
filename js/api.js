export async function api(path, body, method) {
  const opts = { method: method || (body ? 'POST' : 'GET'), credentials: 'same-origin', headers: {} };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(path, opts); } catch { throw new Error("Can't reach the server. Check your connection."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Something went wrong'); e.status = res.status; throw e; }
  return data;
}

export const auth = {
  user: null,
  async me() { this.user = (await api('/api/auth/me')).user; return this.user; },
  async login(email, password) { this.user = (await api('/api/auth/login', { email, password })).user; return this.user; },
  async signup(email, password, name) { this.user = (await api('/api/auth/signup', { email, password, name })).user; return this.user; },
  async logout() { await api('/api/auth/logout', {}).catch(() => {}); this.user = null; },
  async rename(name) { this.user = (await api('/api/auth/profile', { name })).user; return this.user; },
};
