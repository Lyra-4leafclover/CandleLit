# Art pipeline

[← back to AGENTS.md](AGENTS.md)

The painted (Watercolor) art is generated with an image model, then processed into transparent WebP files. The working scripts live outside the repo (in the agent's `~/work/`); only the processed output is committed.

## Candles

1. Generate one image per candle: watercolor, unlit (wick only), on a white background.
2. Make 5 more melt stages by editing each stage from the previous one (6 stages in total). About 10 run in parallel; 222 images took about 7 minutes.
3. Process: remove the white background with a flood fill, crop all stages of a candle to one shared box, and save as `artN/<name>_<stage>.webp`.
4. Generate metadata (`js/artN.js`): file names, per-stage wick point, cake art. Keys look like `p3<id>` / `p7<id>`.
5. In `js/data.js`, the candle gets `shape: 'painted', art: '<key>'` plus `shape0` and Classic attributes so Classic mode can still draw it as SVG.

Rendering crossfades the stages by remaining wax, with a painted flame on the wick point. Animations (drips, wax pool ripples, sheen, glow) use negative `animation-delay` from `Date.now()` (`phase()` in `js/render.js`), because the focus view re-renders through `innerHTML` and positive delays would restart them.

## Folders

| Folder | Contents |
|---|---|
| `art/` | First painted candles (pumpkin, shells) |
| `art3/` | v3: painted versions of all earlier candles + painted cakes |
| `art4/` | Painted Wax Studio parts (cream bodies with 6 stages, holders, pattern tiles, decorations) and flame frames |
| `art5/` | Painted scenes |
| `art6/` | More painted cakes and scenes |
| `art7/` | v4 theme collections (Gothic … Golf): candles, cakes, scenes |

## Wax Studio in Watercolor

Colour comes from multiply-tinting the cream body with an SVG filter (Top → Bottom gradient); patterns are masked to the body's alpha, and the accent colours the motifs. This is what lets the colour wheel work on painted art.

## Share card

The card is drawn as SVG and then onto a canvas, so relative image links must be turned into data URLs first (`inlineArt` in `js/app.js`).

## Lessons

- Tapers in tall holders often barely melt in the early edited stages; check every stage.
- PIL's flood fill needs `Image.fromarray(...).copy()`, or it silently does nothing.
- Python 3.10's `mimetypes` doesn't know `.webp`, so `server.py` registers it.
- Painted cakes need flat tops so candles can stand on them.
