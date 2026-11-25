// Scene 01: title. Cream and emerald world from the client's reference slide:
// a live candle chart rises across the green panel behind the gold bull, and
// the three pillars (Learn, Analyze, Grow) light up as the presenter clicks.

import { candlesFromWaypoints, reducedMotion } from "../candles.js";

const N = 26;
const UP = "#7fd6a4";
const DOWN = "#e8b863";
const GLOW = "#ffd56b";

const candles = candlesFromWaypoints(
  // closes only: pinning highs/lows flattens neighbouring bodies on a short chart
  [
    { i: 0, p: 100, kind: "close" },
    { i: 3, p: 110, kind: "close" },
    { i: 5, p: 104, kind: "close" },
    { i: 9, p: 120, kind: "close" },
    { i: 11, p: 113, kind: "close" },
    { i: 15, p: 132, kind: "close" },
    { i: 17, p: 124, kind: "close" },
    { i: 21, p: 146, kind: "close" },
    { i: 22, p: 139, kind: "close" },
    { i: 25, p: 158, kind: "close" },
  ],
  N,
  { vol: 6, seed: 9 }
);
// the reference slide's candles are tall and chunky: widen each body and its wicks
candles.forEach((c, i) => {
  const mid = (c.o + c.c) / 2;
  let half = Math.max(2.2, Math.abs(c.c - c.o) * 1.3);
  const up = i % 5 === 3 ? c.c < c.o : c.c >= c.o; // keep a few gold (down) candles in the climb
  c.o = up ? mid - half : mid + half;
  c.c = up ? mid + half : mid - half;
  c.h = Math.max(c.o, c.c) + 1.5 + ((i * 7) % 5) * 0.8;
  c.l = Math.min(c.o, c.c) - 1.5 - ((i * 3) % 4) * 0.8;
});

const Y_MIN = 78, Y_MAX = 170;

// smoothed trend under the candles, ending in the arrow
const trend = (() => {
  const k = 2 / 7;
  let v = candles[0].c - 6;
  return candles.map((c, i) => {
    v = (Math.min(c.o, c.c) - 12) * k + v * (1 - k);
    return { i, p: v };
  });
})();

const STOP = [9, 18, N];

export default {
  id: "title",
  title: "SMISHA Share Market Classes",
  steps: STOP.length,

  init(root) {
    this.root = root;
    this.pillars = [...root.querySelectorAll("[data-pillar]")];
    this.canvas = root.querySelector(".title-chart");
    this.ctx = this.canvas.getContext("2d");
    this.visible = 0;
    this.arrow = 0; // 0..1 draw-in of the arrow head
    new ResizeObserver(() => this.resize()).observe(this.canvas);
    this.resize();
  },

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = this.canvas.getBoundingClientRect();
    if (!width) return;
    this.w = width;
    this.h = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  },

  x(i) { return (i + 0.5) * (this.w / (N + 2.2)); },
  y(p) { return (1 - (p - Y_MIN) / (Y_MAX - Y_MIN)) * this.h; },

  draw() {
    const { ctx, w, h } = this;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const slot = w / (N + 2.2);
    const bw = Math.min(30, slot * 0.62);
    const shown = this.visible;

    const candle = (c, i, alpha) => {
      ctx.globalAlpha = alpha;
      const col = c.c >= c.o ? UP : DOWN;
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = Math.max(1.2, slot * 0.06);
      const x = this.x(i);
      ctx.beginPath();
      ctx.moveTo(x, this.y(c.h));
      ctx.lineTo(x, this.y(c.l));
      ctx.stroke();
      const top = this.y(Math.max(c.o, c.c));
      const bot = this.y(Math.min(c.o, c.c));
      ctx.fillRect(x - bw / 2, top, bw, Math.max(2, bot - top));
    };
    candles.forEach((c, i) => {
      if (i < Math.floor(shown)) candle(c, i, 0.92);
      else candle(c, i, 0.2); // ghost: the rest of the climb, hinted
    });
    ctx.globalAlpha = 1;

    // glowing trend line, drawn as far as the candles have printed
    const pts = trend.filter((q) => q.i < shown);
    if (pts.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#fff1c4";
      ctx.lineWidth = Math.max(3, this.w * 0.0055);
      ctx.lineJoin = ctx.lineCap = "round";
      ctx.shadowColor = GLOW;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      pts.forEach((q, k) => {
        const X = this.x(q.i), Y = this.y(q.p);
        if (!k) ctx.moveTo(X, Y);
        else {
          const prev = pts[k - 1];
          const mx = (this.x(prev.i) + X) / 2;
          ctx.bezierCurveTo(mx, this.y(prev.p), mx, Y, X, Y);
        }
      });
      // the final stretch rises past the last candle to the arrow
      if (this.arrow > 0) {
        const last = pts[pts.length - 1];
        const lx = this.x(last.i), ly = this.y(last.p);
        const tx = lx + (w - 14 - lx) * this.arrow;
        const ty = ly + (this.h * 0.04 - ly) * this.arrow;
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (this.arrow > 0.98) this.arrowHead(tx, ty, Math.atan2(ty - ly, tx - lx));
      } else ctx.stroke();
      ctx.restore();
    }
  },

  arrowHead(x, y, ang) {
    const { ctx } = this;
    const s = Math.max(16, this.w * 0.05);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = "#fff1c4";
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-s, -s * 0.62);
    ctx.lineTo(-s * 0.7, 0);
    ctx.lineTo(-s, s * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  animateTo(target, arrow) {
    cancelAnimationFrame(this.raf);
    if (reducedMotion() || target < this.visible) {
      this.visible = target;
      this.arrow = arrow;
      this.draw();
      return;
    }
    let last = performance.now();
    const tick = (t) => {
      const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
      last = t;
      if (this.visible < target) this.visible = Math.min(target, this.visible + dt * 10);
      else if (this.arrow < arrow) this.arrow = Math.min(arrow, this.arrow + dt * 2.2);
      this.draw();
      if (this.visible < target || this.arrow < arrow) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },

  enter(step, instant) { this.go(step, instant); },
  leave() { cancelAnimationFrame(this.raf); },

  go(step, instant = false) {
    this.pillars.forEach((el, k) => el.classList.toggle("is-current", k === step));
    this.root.classList.add("is-entered");
    const arrow = step === STOP.length - 1 ? 1 : 0;
    if (step < STOP.length - 1) this.arrow = 0;
    if (instant) {
      this.visible = STOP[step];
      this.arrow = arrow;
      this.draw();
    } else this.animateTo(STOP[step], arrow);
  },
};
