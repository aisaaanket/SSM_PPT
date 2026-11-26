// Candle chart engine: generates OHLC data from waypoints and draws an
// animated, interactive candlestick chart on a <canvas>.

export const COLORS = {
  bull: "#22b07d",
  bear: "#e5484d",
  gold: "#ffb800",
  paper: "#eef2f7",
  muted: "#93a6bf",
  grid: "rgba(238,242,247,0.07)",
  axis: "rgba(238,242,247,0.45)",
  bg: "#15304b",
};

const FONT = '"Archivo", system-ui, sans-serif';
export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- data

function rng(seed) {
  // mulberry32: small deterministic PRNG so every replay looks identical
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build candles that pass through the given waypoints.
 * waypoints: [{ i, p, kind }] where kind is "low" (candle low = p),
 * "high" (candle high = p) or "close" (close = p). Must include i = 0 and i = n - 1.
 */
export function candlesFromWaypoints(waypoints, n, { vol = 1, seed = 7 } = {}) {
  const r = rng(seed);
  const pts = [...waypoints].sort((a, b) => a.i - b.i);
  const target = new Array(n);
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1];
    for (let i = a.i; i <= b.i; i++) {
      const t = (i - a.i) / Math.max(1, b.i - a.i);
      const eased = t * t * (3 - 2 * t) * 0.35 + t * 0.65; // slightly curved legs
      target[i] = a.p + (b.p - a.p) * eased;
    }
  }

  const out = [];
  let prevClose = target[0] - (target[1] - target[0]) * 0.5;
  for (let i = 0; i < n; i++) {
    const noise = (r() - 0.5) * vol * 1.1;
    const close = target[i] + noise;
    const open = prevClose + (r() - 0.5) * vol * 0.25;
    const top = Math.max(open, close);
    const bot = Math.min(open, close);
    out.push({
      o: open,
      c: close,
      h: top + r() * vol * 0.9 + vol * 0.1,
      l: bot - r() * vol * 0.9 - vol * 0.1,
    });
    prevClose = close;
  }

  // Pin the waypoint extremes exactly and keep neighbours from crossing them.
  for (const w of pts) {
    const c = out[w.i];
    if (!c) continue;
    if (w.kind === "low") {
      c.l = w.p;
      c.o = Math.max(c.o, w.p + vol * 0.3);
      c.c = Math.max(c.c, w.p + vol * 0.3);
      for (let j = w.i - 4; j <= w.i + 4; j++) {
        if (j === w.i || !out[j]) continue;
        const d = out[j];
        const floor = w.p + vol * 0.4;
        d.l = Math.max(d.l, floor);
        d.o = Math.max(d.o, floor);
        d.c = Math.max(d.c, floor);
      }
    } else if (w.kind === "high") {
      c.h = w.p;
      c.o = Math.min(c.o, w.p - vol * 0.3);
      c.c = Math.min(c.c, w.p - vol * 0.3);
      for (let j = w.i - 4; j <= w.i + 4; j++) {
        if (j === w.i || !out[j]) continue;
        const d = out[j];
        const ceil = w.p - vol * 0.4;
        d.h = Math.min(d.h, ceil);
        d.o = Math.min(d.o, ceil);
        d.c = Math.min(d.c, ceil);
      }
    } else if (w.kind === "close") {
      c.c = w.p;
      if (out[w.i + 1]) out[w.i + 1].o = w.p;
    }
  }
  // Repair any wick that ended up inside a body after pinning.
  for (const c of out) {
    c.h = Math.max(c.h, c.o, c.c);
    c.l = Math.min(c.l, c.o, c.c);
  }
  return out;
}

/** Swing lows/highs: candles whose low/high is the extreme of a +-w window. */
export function pivots(candles, w = 3) {
  const lows = [], highs = [];
  for (let i = w; i < candles.length - w; i++) {
    let isLow = true, isHigh = true;
    for (let j = i - w; j <= i + w; j++) {
      if (j === i) continue;
      if (candles[j].l <= candles[i].l) isLow = false;
      if (candles[j].h >= candles[i].h) isHigh = false;
    }
    if (isLow) lows.push(i);
    if (isHigh) highs.push(i);
  }
  return { lows, highs };
}

// ---------------------------------------------------------------- chart

export class CandleChart {
  constructor(canvas, { candles, yMin, yMax, gridStep, pad, decimals = 0, axis = true, maxBody = 18, ghost = 0, palette = {} }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.candles = candles;
    this.yMin = yMin;
    this.yMax = yMax;
    this.gridStep = gridStep;
    this.decimals = decimals;
    this.axis = axis; // false: full-bleed chart with no price labels
    this.maxBody = maxBody;
    this.col = { ...COLORS, ...palette }; // light scenes pass their own candle and grid colours
    this.ghost = ghost; // 0 = off; otherwise alpha for not-yet-printed candles
    this.padOpt = pad || {};
    this.pad = { l: 24, r: axis ? 76 : 24, t: 28, b: 28, ...pad };
    this.visible = 0; // number of candles shown (fractional = growing candle)
    this.overlays = new Map(); // id -> overlay
    this.running = false;
    this.drag = null;
    this.onDrag = null;
    this.onDragEnd = null;

    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(canvas);
    this._bindPointer();
    this.resize();
  }

  // --- geometry
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = this.canvas.getBoundingClientRect();
    if (!width || !height) return;
    this.w = width;
    this.h = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // narrow screens: tighten the price axis
    if (this.axis && this.padOpt.r == null) this.pad.r = width < 520 ? 58 : 76;
    this.onResize && this.onResize();
    this.draw();
  }
  get plotW() { return this.w - this.pad.l - this.pad.r; }
  get plotH() { return this.h - this.pad.t - this.pad.b; }
  slot() { return this.plotW / this.candles.length; }
  x(i) { return this.pad.l + (i + 0.5) * this.slot(); }
  y(p) { return this.pad.t + (1 - (p - this.yMin) / (this.yMax - this.yMin)) * this.plotH; }
  price(y) { return this.yMin + (1 - (y - this.pad.t) / this.plotH) * (this.yMax - this.yMin); }
  fmt(p) { return p.toLocaleString("en-IN", { maximumFractionDigits: this.decimals, minimumFractionDigits: this.decimals }); }

  // --- overlays
  set(id, overlay) {
    const prev = this.overlays.get(id);
    this.overlays.set(id, { alpha: prev ? prev.alpha : 0, ...overlay, target: 1 });
    this.kick();
  }
  remove(id) {
    const o = this.overlays.get(id);
    if (o) { o.target = 0; this.kick(); }
  }
  clear() { this.overlays.clear(); this.kick(); }
  get(id) { return this.overlays.get(id); }

  // --- animation
  /** Animate the number of visible candles to `count`. Resolves when done. */
  play(count, { speed = 9, instant = false } = {}) {
    count = Math.min(count, this.candles.length);
    if (instant || reducedMotion()) {
      this.visible = count;
      this._finishOverlays();
      this.draw();
      return Promise.resolve();
    }
    this._playTo = count;
    this._speed = speed; // candles per second
    this.kick();
    return new Promise((res) => (this._playDone = res));
  }
  _finishOverlays() {
    for (const o of this.overlays.values()) o.alpha = o.target;
  }
  kick() {
    if (this.running) return;
    this.running = true;
    this._last = performance.now();
    requestAnimationFrame((t) => this._frame(t));
  }
  _frame(t) {
    // rAF timestamps can predate the performance.now() taken in kick()
    const dt = Math.max(0, Math.min(0.05, (t - this._last) / 1000));
    this._last = t;
    let busy = false;

    if (this._playTo != null) {
      const dir = Math.sign(this._playTo - this.visible);
      this.visible += dir * this._speed * dt;
      if ((dir > 0 && this.visible >= this._playTo) || (dir < 0 && this.visible <= this._playTo) || dir === 0) {
        this.visible = this._playTo;
        this._playTo = null;
        const done = this._playDone;
        this._playDone = null;
        done && done();
      } else busy = true;
    }

    for (const [id, o] of this.overlays) {
      if (reducedMotion()) o.alpha = o.target;
      const k = Math.min(1, dt * 6);
      o.alpha += (o.target - o.alpha) * k;
      if (Math.abs(o.target - o.alpha) > 0.01) busy = true;
      else o.alpha = o.target;
      if (o.target === 0 && o.alpha === 0) this.overlays.delete(id);
    }
    if (this.pulse) busy = true;
    this.onFrame && this.onFrame(this.visible);

    this.draw(t);
    if (busy) requestAnimationFrame((tt) => this._frame(tt));
    else this.running = false;
  }

  // --- drawing
  draw(t = performance.now()) {
    const { ctx, w, h } = this;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    this._drawGrid();

    // zones go under the candles
    for (const o of this.overlays.values()) if (o.type === "zone") this._drawZone(o);
    this._drawCandles();
    for (const o of this.overlays.values()) {
      if (o.type === "hline") this._drawHLine(o, t);
      else if (o.type === "marker") this._drawMarker(o);
      else if (o.type === "dots") this._drawDots(o);
      else if (o.type === "path") this._drawPath(o);
      else if (o.type === "trades") this._drawTrades(o);
    }
  }

  _drawGrid() {
    const { ctx } = this;
    ctx.save();
    ctx.font = `500 12px ${FONT}`;
    ctx.fontStretch = "condensed";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.col.axis;
    ctx.strokeStyle = this.col.grid;
    ctx.lineWidth = 1;
    const start = Math.ceil(this.yMin / this.gridStep) * this.gridStep;
    for (let p = start; p <= this.yMax; p += this.gridStep) {
      const y = Math.round(this.y(p)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(this.axis ? this.pad.l : 0, y);
      ctx.lineTo(this.axis ? this.w - this.pad.r : this.w, y);
      ctx.stroke();
      if (this.axis) ctx.fillText(this.fmt(p), this.w - this.pad.r + 10, y);
    }
    ctx.restore();
  }

  _drawCandles() {
    const { ctx } = this;
    const n = Math.floor(this.visible);
    const frac = this.visible - n;
    const slot = this.slot();
    const bw = Math.max(2, Math.min(this.maxBody, slot * 0.62));
    const draw = (c, i, grow) => {
      const up = c.c >= c.o;
      const color = up ? this.col.bull : this.col.bear;
      // a growing candle opens at `o` and stretches towards its close
      const close = c.o + (c.c - c.o) * grow;
      const hi = Math.max(c.o, close) + (c.h - Math.max(c.o, c.c)) * grow;
      const lo = Math.min(c.o, close) - (Math.min(c.o, c.c) - c.l) * grow;
      const x = this.x(i);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(1, Math.min(2, slot * 0.08));
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, this.y(hi));
      ctx.lineTo(Math.round(x) + 0.5, this.y(lo));
      ctx.stroke();
      const top = this.y(Math.max(c.o, close));
      const bot = this.y(Math.min(c.o, close));
      ctx.fillRect(x - bw / 2, top, bw, Math.max(1.5, bot - top));
    };
    // ghost: the candles still to come, drawn faintly so the whole path is hinted
    if (this.ghost) {
      ctx.save();
      ctx.globalAlpha = this.ghost;
      for (let i = Math.ceil(this.visible); i < this.candles.length; i++) draw(this.candles[i], i, 1);
      ctx.restore();
    }
    for (let i = 0; i < n && i < this.candles.length; i++) draw(this.candles[i], i, 1);
    if (frac > 0.02 && n < this.candles.length) draw(this.candles[n], n, frac);
  }

  _drawZone(o) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = o.alpha;
    const y1 = this.y(o.to), y2 = this.y(o.from);
    const x1 = o.fromI != null ? this.x(o.fromI) - this.slot() / 2 : this.pad.l;
    const x2 = o.toI != null ? this.x(o.toI) + this.slot() / 2 : this.w - this.pad.r;
    ctx.fillStyle = o.fill;
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    if (o.label) {
      ctx.font = `600 13px ${FONT}`;
      ctx.fillStyle = o.color || this.col.paper;
      // label sits on a pill so it stays legible over candles
      const lw = ctx.measureText(o.label).width + 12;
      const ly = o.labelBelow ? y2 + 4 : y1 - 24;
      ctx.fillStyle = "rgba(4,13,26,0.85)";
      ctx.beginPath();
      ctx.roundRect(x1, ly, lw, 20, 6);
      ctx.fill();
      ctx.fillStyle = o.color || this.col.paper;
      ctx.textBaseline = "middle";
      ctx.fillText(o.label, x1 + 6, ly + 10.5);
    }
    ctx.restore();
  }

  _drawHLine(o, t) {
    const { ctx } = this;
    const y = Math.round(this.y(o.price)) + 0.5;
    ctx.save();
    ctx.globalAlpha = o.alpha;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = o.width || 1.5;
    ctx.setLineDash(o.dash ? [6, 5] : []);
    const x1 = o.fromI != null ? this.x(o.fromI) : this.pad.l;
    const x2 = o.toI != null ? this.x(o.toI) : this.w - this.pad.r;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // draggable lines get a grip and a soft halo while hovered/dragged
    if (o.draggable) {
      const hot = this.drag?.id === o.id || this.hover === o.id;
      if (hot) {
        ctx.globalAlpha = o.alpha * 0.18;
        ctx.fillStyle = o.color;
        ctx.fillRect(this.pad.l, y - 9, this.plotW, 18);
        ctx.globalAlpha = o.alpha;
      }
      const gx = this.pad.l + 18;
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.roundRect(gx - 14, y - 9, 28, 18, 9);
      ctx.fill();
      ctx.fillStyle = this.col.bg;
      for (const dy of [-3, 0, 3]) ctx.fillRect(gx - 6, y + dy - 0.75, 12, 1.5);
    }

    // price tag on the axis
    if (o.tag === false) { ctx.restore(); return; }
    const tag = this.fmt(o.price);
    ctx.font = `700 12px ${FONT}`;
    const tw = ctx.measureText(tag).width + 14;
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.roundRect(this.w - this.pad.r + 4, y - 10, tw, 20, 5);
    ctx.fill();
    ctx.fillStyle = o.tagInk || this.col.bg;
    ctx.textBaseline = "middle";
    ctx.fillText(tag, this.w - this.pad.r + 11, y + 0.5);

    if (o.label) {
      ctx.font = `600 13px ${FONT}`;
      ctx.fillStyle = o.color;
      ctx.textBaseline = o.labelBelow ? "top" : "bottom";
      const ly = o.labelBelow ? y + 6 : y - 6;
      if (o.labelAt != null) {
        // anchor the label to a candle (left-aligned) instead of the axis
        ctx.textAlign = "right";
        ctx.fillText(o.label, this.x(o.labelAt), ly);
      } else {
        ctx.textAlign = "right";
        ctx.fillText(o.label, this.w - this.pad.r - 8, ly);
      }
    }
    ctx.restore();
  }

  _drawMarker(o) {
    // a callout pinned to a candle: dot + label above or below
    const { ctx } = this;
    const c = this.candles[o.i];
    if (!c || o.i >= this.visible - 0.2) return;
    const below = o.dir === "below";
    const p = o.price ?? (below ? c.l : c.h);
    const x = this.x(o.i);
    const y = this.y(p);
    ctx.save();
    ctx.globalAlpha = o.alpha;
    ctx.fillStyle = o.color;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 1.5;
    const off = below ? 14 : -14;
    ctx.beginPath();
    ctx.moveTo(x, y + (below ? 6 : -6));
    ctx.lineTo(x, y + off + (below ? 6 : -6));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const fs = o.size || 13;
    ctx.font = `700 ${fs}px ${FONT}`;
    const lines = String(o.text).split("\n");
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + fs * 1.2;
    const th = lines.length * fs * 1.3 + fs * 0.6;
    let bx = x - tw / 2;
    bx = Math.max(this.pad.l, Math.min(bx, this.w - this.pad.r - tw));
    const by = below ? y + off + 6 : y + off - 6 - th;
    ctx.fillStyle = o.fill || "rgba(4,13,26,0.9)";
    ctx.beginPath();
    ctx.roundRect(bx, by, tw, th, 8);
    ctx.fill();
    ctx.strokeStyle = o.color;
    ctx.globalAlpha = o.alpha * 0.6;
    ctx.stroke();
    ctx.globalAlpha = o.alpha;
    ctx.fillStyle = o.ink || o.color;
    ctx.textBaseline = "top";
    lines.forEach((l, k) => ctx.fillText(l, bx + fs * 0.6, by + fs * 0.35 + k * fs * 1.3));
    ctx.restore();
  }

  _drawPath(o) {
    // a polyline through {i, p} points, revealed as the candles print
    const { ctx } = this;
    const pts = o.points.filter((q) => q.i < this.visible - 0.5);
    if (pts.length < 2) return;
    ctx.save();
    ctx.globalAlpha = o.alpha;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = o.width || 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach((q, k) => (k ? ctx.lineTo(this.x(q.i), this.y(q.p)) : ctx.moveTo(this.x(q.i), this.y(q.p))));
    ctx.stroke();
    ctx.restore();
  }

  _drawTrades(o) {
    // small triangles: buys point up under the candle, sells point down above it
    const { ctx } = this;
    const s = Math.max(5, Math.min(9, this.slot() * 0.45));
    ctx.save();
    ctx.globalAlpha = o.alpha;
    for (const t of o.points) {
      if (t.i >= this.visible - 0.2) continue;
      const c = this.candles[t.i];
      const x = this.x(t.i);
      const buy = t.side === "buy";
      const y = buy ? this.y(c.l) + s + 4 : this.y(c.h) - s - 4;
      ctx.fillStyle = buy ? o.buy : o.sell;
      ctx.strokeStyle = o.ring || "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (buy) { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.7); ctx.lineTo(x - s, y + s * 0.7); }
      else { ctx.moveTo(x, y + s); ctx.lineTo(x + s, y - s * 0.7); ctx.lineTo(x - s, y - s * 0.7); }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    ctx.restore();
  }

  _drawDots(o) {
    // rings around touch points (e.g. swing lows touching support)
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = o.alpha;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 2;
    for (const { i, p } of o.points) {
      if (i >= this.visible - 0.2) continue;
      ctx.beginPath();
      ctx.arc(this.x(i), this.y(p), 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- dragging horizontal lines
  _bindPointer() {
    const c = this.canvas;
    const local = (e) => {
      const r = c.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hit = (pt) => {
      let best = null, bestD = 14;
      for (const o of this.overlays.values()) {
        if (o.type !== "hline" || !o.draggable || o.target === 0) continue;
        const d = Math.abs(this.y(o.price) - pt.y);
        if (d < bestD) { best = o; bestD = d; }
      }
      return best;
    };
    c.addEventListener("pointerdown", (e) => {
      const o = hit(local(e));
      if (!o) return;
      this.drag = { id: o.id };
      c.setPointerCapture(e.pointerId);
      e.preventDefault();
      this.draw();
    });
    c.addEventListener("pointermove", (e) => {
      const pt = local(e);
      if (this.drag) {
        const o = this.overlays.get(this.drag.id);
        if (!o) return;
        let p = this.price(pt.y);
        const step = o.snap || 1;
        p = Math.round(p / step) * step;
        p = Math.max(o.min ?? this.yMin, Math.min(o.max ?? this.yMax, p));
        if (p !== o.price) {
          o.price = p;
          this.onDrag && this.onDrag(o.id, p);
        }
        this.draw();
        return;
      }
      const o = hit(pt);
      const id = o ? o.id : null;
      if (id !== this.hover) {
        this.hover = id;
        c.style.cursor = id ? "ns-resize" : "default";
        this.draw();
      }
    });
    const end = () => {
      if (!this.drag) return;
      const id = this.drag.id;
      this.drag = null;
      this.draw();
      this.onDragEnd && this.onDragEnd(id);
    };
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);
  }

  /** Keyboard nudge for the focused draggable line (accessibility). */
  nudge(id, delta) {
    const o = this.overlays.get(id);
    if (!o) return;
    o.price = Math.max(o.min ?? this.yMin, Math.min(o.max ?? this.yMax, o.price + delta));
    this.onDrag && this.onDrag(id, o.price);
    this.onDragEnd && this.onDragEnd(id);
    this.draw();
  }
}
