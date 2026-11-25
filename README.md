# SMISHA interactive deck

An interactive web version of the SMISHA Share Market Classes seminar deck.
Each slide is a full-screen scene; charts are drawn live from price data, not images.

## Run locally

Any static file server works, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Use the arrow keys to move, F for full screen.
A scene's address is its number, e.g. `#02`.

## Structure

- `index.html`: the scenes
- `css/styles.css`: theme and layout
- `js/main.js`: navigation (scenes, in-scene steps, URL, keyboard, swipe)
- `js/candles.js`: candlestick chart engine (data generation, animation, draggable levels)
- `js/scenes/`: one module per interactive scene (`hero.js`, the 3D candle field, is kept for the closing scene)
- `vendor/`: three.js (3D hero) and GSAP, pinned copies so the deck works offline
- `assets/`: Archivo variable font (self-hosted) and the SMISHA logo
- `PRODUCT.md`, `DESIGN.md`: product context and the design system
- `docs/slide-content.md`: text and build notes for every slide

## Adding a scene

1. Add a `<section class="scene" data-scene="my-scene">` to `index.html`.
2. Create `js/scenes/my-scene.js` exporting `{ id, title, steps, init(root), enter(step, instant), leave(), go(step, instant) }`.
3. Register it in `MODULES` in `js/main.js`.

Price data in the chart scenes is illustrative and built around the levels taught in class.
