# Design

[← back to AGENTS.md](AGENTS.md)

## UI direction

- The first version used a dark burgundy/gold "maximalist" UI with simple stick candles. The owner rejected it as random and not cozy.
- Accepted direction: clean, professional and cozy, like a Dribbble app shot. Cream background, soft pastel cards, clean sans-serif type, black pill buttons.
- "Maximalist" applies to the **candle designs** (ornate holders, roses, hearts, bows, teacups, jars, figurines), not the UI.
- Bakery scenes should look like detailed Pinterest-style illustrations. Plain gradient scenes were called "basic".
- Dark mode: all labels must stay readable (e.g. the "Cake in the oven" label and the Top/Bottom/Accent slots were fixed for dark mode).

## Art modes

There are two art modes, switched from a toggle in the **top bar** (not hidden in a menu). They are named **Watercolor** and **Classic**, never "painted / non-painted". Internally they are `painted` and `drawn` (`setArtMode` in `js/render.js`).

| | Watercolor | Classic |
|---|---|---|
| Candles | Painted WebP art with 6 melt stages | Hand-written SVG (the v2 art) |
| Flame | Painted flame frames (`art4/flame_*.webp`). An SVG flame on painted art looked bad. | SVG flame |
| Cakes | Always painted, everywhere (Shop, Bakery, share card) | SVG, with a Classic / 3D style switch shown only in this mode |
| Scenes | Watercolor paintings | Drawn SVG scenes (`js/scenes.js`) |
| Wax Studio | Layered painted parts, tinted by the colour wheel | SVG patterns, kept exactly as in v2 |

Anything new must be made in both modes.

## Feedback that shaped the art

- **Shaped candles:** flat SVG outlines clipped as they melt looked like "random pngs being burnt". Molded 3D SVG versions looked "squished and unreal". The answer was real painted art, plus vessel candles where the wax level sinks.
- **Figurines:** the first mermaid and moon fairy toppers looked like "bad art" and were redrawn. The owner loved the Cherub's Wish figurine candle and asked for more like it.
- **Toadstool:** a busy glossy toadstool (door, window, fireflies) "looks AI generated". Prefer a soft hand-drawn look over clutter.
- **Melting:** a candle that only gets smaller isn't satisfying. It needs many melt stages plus visible animation (drips, moving wax pool, sheen).
- **No ghost of the previous stage:** a translucent previous stage behind the current one was called a "random ass shadow thing". Old stages wipe off top-down, then fade masked to the new stage's alpha.
- **Classic themed items must show their theme** with motifs, pixel/checker bands, ball seams, pitch lines and so on. Plain recoloured cakes or candles were rejected (the first gamer candles and themed cakes).
- **Candles on cakes must sit in the frosting.** Painted cakes with figures standing on top made candles look like floating emojis. Cake tops are now flat patterns, candles are smaller, and each has a contact shadow.
- **Wax Studio colours:** all three picked colours (Top, Bottom, Accent) must show in both modes. Watercolor patterns use the `onColor` contrast helper. That contrast fix was reverted in Classic at the owner's request.
- **Wax Studio patterns** must be big enough to read (overcrowded tiny patterns were enlarged).
- **Sound:** synthesized ambience all sounded like rain and the fire crackle sounded fake. Only real recordings are used now (`audio/`, credits in `audio/CREDITS.txt`).

## Responsive layout

The owner wants the site to adapt like a normal responsive website on every device, not be sized to her screen. `css/style.css` scales the whole UI with `body { zoom: var(--z) }`, where `--z` is set by media queries (1 → 0.9 → 0.8 → 0.72 on short screens, 0.92 on phones). Viewport-height sizes divide by `--z`. Bakery and result cakes have a maximum size.
