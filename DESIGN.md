---
name: SMISHA Interactive Deck
description: The SMISHA seminar deck rebuilt as live, presenter-paced web scenes.
colors:
  navy-ground: "#0f253a"
  navy-deep: "#0a1b2d"
  navy-panel: "#15304b"
  navy-raised: "#1d3d5e"
  paper: "#eef2f7"
  muted: "#93a6bf"
  logo-gold: "#ffb800"
  candle-up: "#22b07d"
  candle-down: "#e5484d"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(34px, 3.7vw, 76px)"
    fontWeight: 850
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  tagline-word:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.9vw, 76px)"
    fontWeight: 850
    lineHeight: 1
    letterSpacing: "-0.01em"
  scene-heading:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(28px, 2.9vw, 46px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(16px, 1.25vw, 19px)"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  pill: "999px"
  stage: "20px"
  panel: "14px"
  step: "10px"
spacing:
  gutter: "clamp(16px, 4vw, 64px)"
  rail: "64px"
components:
  button-primary:
    backgroundColor: "{colors.logo-gold}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
  button-secondary:
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
  chart-stage:
    backgroundColor: "{colors.navy-panel}"
    rounded: "{rounded.stage}"
  trade-ticket:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
  rail:
    backgroundColor: "{colors.navy-deep}"
    height: "{spacing.rail}"
---

# Design System: SMISHA Interactive Deck

## Overview

A seminar deck turned into full-screen web scenes, projected for a live audience and advanced by the trainer. The market is the material: every price, pattern and number is drawn live from data on canvas, never pasted as a picture. The world is the deck's own: deep navy ground, the logo's gold, and the green and red of real candles. One idea leads each scene, and the chart is usually that idea.

## Colors

### Primary
- **Logo gold** `#ffb800`: the SMISHA mark's gold. Reserved for what the presenter is pointing at: the active tagline word, a trigger or breakout line, a moving average, the primary button, the current step. Never decoration.

### Neutral
- **Navy ground** `#0f253a`: the deck's own background, sampled from the PPT. Scene grounds.
- **Navy deep** `#0a1b2d`: the rail, ticket and toast surfaces that sit over a scene.
- **Navy panel** `#15304b` / **Navy raised** `#1d3d5e`: chart stages and scrollbar thumbs.
- **Paper** `#eef2f7`: text and completed states. **Muted** `#93a6bf`: supporting copy, axis labels.

### Semantic
- **Candle up** `#22b07d`, **Candle down** `#e5484d`: price direction only; also targets (green) and stop-losses (red).

### Named Rules
- **Gold points.** If gold appears, it marks the one thing to look at now. Two gold focal points in one frame is a defect.
- **The deck's navy, not black.** Grounds stay at the sampled deck navy; drifting darker toward blue-black loses the brand.

## Typography

One family, Archivo (variable width, self-hosted), used at two widths:
- **Wide and heavy** (stretch 108–125%, weight 800–850) for headlines and tagline words, echoing the wide SMISHA wordmark.
- **Condensed** (stretch 75–90%) with tabular numerals for prices, step numbers and ticket figures.

### Hierarchy
Display headline (title scene) → tagline words on the chart → scene heading → lede → step captions → data labels. Headings use `text-wrap: balance`. Body lines stay under ~42ch in story columns.

## Layout

- Scenes are full-viewport, one at a time; a 64px rail is fixed at the bottom (count, title, disclaimer, Previous/Next).
- Title scene: the chart is full-bleed edge to edge; copy sits in the upper-left over empty chart space; the price path runs diagonally from bottom-left to top-right.
- Content scenes: story column (heading, lede, numbered steps, actions) left; chart stage right at about 2:1.
- Under 900px: single column; the title chart takes the lower 52% of the screen; content scenes scroll.
- Projector first: 16:9 at 1920×1080 and 1280×720 are the reference sizes; no feature depends on hover.

## Elevation & Depth

Flat. Depth comes from navy steps (ground → panel → deep overlays) and a backdrop blur only on the trade ticket, which floats over a live chart. No drop shadows.

## Shapes

Pills for buttons and toasts; 20px radius on chart stages; 14px on the trade ticket; 10px on step rows. Price tags on lines are 5px-radius chips.

## Components

### Buttons
Gold pill for the scene's primary action; outlined pill for secondary actions. Press scales to 0.97.

### Steps list
Numbered rows that mirror the scene's in-scene steps; the current row is gold-tinted with a gold number, done rows dim, future rows faint. Rows are clickable to jump.

### Chart stage and engine
`CandleChart` draws candles from waypoint-generated OHLC data and animates them printing left to right. Overlays: horizontal lines (optionally draggable, with grip and price tag), zones, callout markers, touch rings, paths (moving averages). Optional ghost mode draws not-yet-printed candles faintly so the full path is hinted.

### Trade ticket
Entry, stop-loss, target, risk, reward and the risk:reward ratio, updating live as lines are dragged.

### Rail
Slide count, scene title, disclaimer, Previous/Next; a gold progress line across the top edge tracks scenes and in-scene steps.

## Do's and Don'ts

- Do draw every chart from data; label illustrative price data as illustrative.
- Do advance one idea per click; the presenter controls pace.
- Do keep the disclaimer on every scene.
- Don't place text over candles without clear space; move the chart or the copy.
- Don't use gold for anything the audience shouldn't look at right now.
- Don't add labels above headings, numbered markers on non-sequences, or glyphs as icons.
