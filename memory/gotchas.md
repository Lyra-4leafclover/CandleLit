# Gotchas

[← back to AGENTS.md](AGENTS.md)

## App behaviour

- **Saved settings can override modes:** a leftover `cakeStyle: 'new'` once made Watercolor show drawn cakes, which looked like the painted cakes had been lost. Watercolor now ignores the cake-style setting.
- **Guests live in localStorage:** the owner often tests as a guest, so her settings and currency aren't in the database and can't be edited server-side.
- **Stale tabs overwrite edits:** state sync is versioned. Bump `states.version` when editing the database by hand, or an open tab saves its old data over it.
- **Fresh accounts have `cake: null`;** seed a full cake object before adding candles in tests.
- **Re-renders restart animations:** the focus candle re-renders through `innerHTML`, so use negative `animation-delay` (`phase()`), never positive.
- **Wax Studio preview must stay visible** (sticky) while picking options, or it looks like the options do nothing.
- **Share card scene:** the exported card must use the scene picked in the Bakery.

## Browser and preview

- PNG and CSV downloads don't work inside the Devin preview iframe, but work on the real site. The share card also shows the image with a right-click / long-press "Save image" hint.
- A plain `<a href=blob: download>` didn't download; downloads go through a data URL and a temporary link (`downloadCard`).

## Tooling

- Node isn't on PATH in the agent VM: `source ~/.nvm/nvm.sh` first.
- The bundled Chrome needs `--headless=new` (old headless mode was removed).
- Chrome DevTools screencast frames lose the bottom ~87 px of the viewport; record at 1920×1167 for a 1920×1080 video.
- `pkill -f` / `pgrep -f` patterns can match the shell running them; use PIDs or anchored patterns.
- `vercel build` locally needs `uv` and a Python 3.12 venv.
- Testing `/api/visit` against production adds a real visitor row; test locally instead.
