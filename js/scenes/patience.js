// Scene 02: Warren Buffett's quote (client reference layout). The faint gold
// chart along the bottom is live: each click draws one investor's ₹1,00,000
// through the same illustrative six years — impatient first, then patient.

import { reducedMotion } from "../candles.js";
import { simulate, START } from "../lib/patience-sim.js";

const GREEN = "#2f7a55";   // impatient: the green highlight
const GOLD = "#b7852a";    // patient: the gold highlight
const inr = (v) => "₹" + Math.round(v).toLocaleString("en-IN");

export default {
  id: "patience",
  title: "From the impatient to the patient",
  steps: 3,

  init(root) {
    this.root = root;
    this.canvas = root.querySelector(".s2-chart");
    this.ctx = this.canvas.getContext("2d");
    this.hl = {
      impatient: root.querySelector('[data-hl="impatient"]'),
      patient: root.querySelector('[data-hl="patient"]'),
    };
    this.keys = Object.fromEntries([...root.querySelectorAll("[data-key]")].map((el) => [el.dataset.key, el]));
    this.vals = Object.fromEntries([...root.querySelectorAll("[data-val]")].map((el) => [el.dataset.val, el]));
    const sim = simulate(0.08);
    this.series = { impatient: sim.impatient, patient: sim.patient };
    this.trades = sim.trades;
    this.n = sim.patient.length;
    this.progress = { impatient: 0, patient: 0 }; // 0..1 of each line drawn
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

  x(i) { return 6 + (i / (this.n - 1)) * (this.w - 12); },
  y(v) {
    const lo = 70000, hi = 260000;
    return 6 + (1 - (v - lo) / (hi - lo)) * (this.h - 12);
  },

  draw() {
    const { ctx, w, h } = this;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);

    // faint gold grid, as in the reference
    ctx.strokeStyle = "rgba(183,133,42,0.14)";
    ctx.lineWidth = 1;
    const cols = 12, rows = 4;
    for (let c = 0; c <= cols; c++) {
      const X = Math.round((c / cols) * w) + 0.5;
      ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, h); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const Y = Math.round((r / rows) * h) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, Y); ctx.lineTo(w, Y); ctx.stroke();
    }
    // starting line: both begin at ₹1,00,000
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(2,45,29,0.25)";
    ctx.beginPath(); ctx.moveTo(0, this.y(START)); ctx.lineTo(w, this.y(START)); ctx.stroke();
    ctx.setLineDash([]);

    this.line("impatient", GREEN, true);
    this.line("patient", GOLD, false);
  },

  line(key, color, markTrades) {
    const p = this.progress[key];
    if (p <= 0) return;
    const { ctx } = this;
    const data = this.series[key];
    const last = p * (this.n - 1);
    const end = Math.floor(last);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2.5, this.h * 0.022);
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i <= end; i++) {
      const X = this.x(i), Y = this.y(data[i]);
      i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    }
    // interpolate the head between monthly points
    let hx = this.x(end), hy = this.y(data[end]);
    if (end < this.n - 1) {
      const f = last - end;
      hx = this.x(end + f);
      hy = this.y(data[end] + (data[end + 1] - data[end]) * f);
      ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // the impatient trader's sells (hollow) and buy-backs (filled)
    if (markTrades) {
      for (const t of this.trades) {
        if (t.i > last) continue;
        const X = this.x(t.i), Y = this.y(data[t.i]);
        ctx.beginPath();
        ctx.arc(X, Y, Math.max(3.5, this.h * 0.03), 0, Math.PI * 2);
        ctx.fillStyle = t.side === "sell" ? "#fdf8f0" : color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    // glowing head
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
    g.addColorStop(0, "rgba(255,236,170,0.95)");
    g.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(hx, hy, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    this.vals[key].textContent = inr(data[Math.min(this.n - 1, Math.round(last))]);
  },

  animate(target) {
    cancelAnimationFrame(this.raf);
    const keys = ["impatient", "patient"];
    if (reducedMotion()) {
      keys.forEach((k) => (this.progress[k] = target[k]));
      this.draw();
      this.finish();
      return;
    }
    let lastT = performance.now();
    const tick = (t) => {
      const dt = Math.max(0, Math.min(0.05, (t - lastT) / 1000));
      lastT = t;
      let busy = false;
      for (const k of keys) {
        const cur = this.progress[k];
        if (cur < target[k]) { this.progress[k] = Math.min(target[k], cur + dt / 2.6); busy = true; }
        else if (cur > target[k]) this.progress[k] = target[k];
      }
      this.draw();
      if (busy) this.raf = requestAnimationFrame(tick);
      else this.finish();
    };
    this.raf = requestAnimationFrame(tick);
  },

  finish() {
    const done = this.progress.patient >= 1 && this.progress.impatient >= 1;
    if (done) {
      const gap = this.series.patient[this.n - 1] - this.series.impatient[this.n - 1];
      this.vals.gap.textContent = inr(gap);
    }
    this.keys.gap.classList.toggle("is-on", done);
  },

  enter(step, instant) { this.go(step, instant); },
  leave() { cancelAnimationFrame(this.raf); },

  go(step, instant = false) {
    this.root.classList.add("is-entered");
    this.hl.impatient.classList.toggle("is-active", step === 1);
    this.hl.patient.classList.toggle("is-active", step === 2);
    this.keys.impatient.classList.toggle("is-on", step >= 1);
    this.keys.patient.classList.toggle("is-on", step >= 2);
    const target = { impatient: step >= 1 ? 1 : 0, patient: step >= 2 ? 1 : 0 };
    if (step < 2) this.keys.gap.classList.remove("is-on");
    if (instant) {
      this.progress = { ...target };
      this.draw();
      this.finish();
    } else this.animate(target);
  },
};
