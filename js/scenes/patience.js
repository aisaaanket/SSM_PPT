// Scene 02: Buffett's quote, dramatised. Two investors on the same price path:
// the patient one holds, the impatient one panic-sells dips and chases rallies.

import { CandleChart, reducedMotion } from "../candles.js";
import { candles, simulate, START } from "../lib/patience-sim.js";

const PALETTE = {
  bull: "#7fd6a4",
  bear: "#e8b863",
  grid: "rgba(253,248,240,0.08)",
  axis: "rgba(253,248,240,0.5)",
  bg: "#065a40",
  paper: "#fdf8f0",
  muted: "rgba(253,248,240,0.7)",
};
const N = candles.length;
const STOP = [0, N, N];

const inr = (v) => "₹" + Math.round(v).toLocaleString("en-IN");

export default {
  id: "patience",
  title: "Impatient to patient",
  steps: 3,

  init(root) {
    this.root = root;
    this.lines = [...root.querySelectorAll("[data-qline]")];
    this.el = {
      patient: root.querySelector("[data-patient]"),
      impatient: root.querySelector("[data-impatient]"),
      trades: root.querySelector("[data-trades]"),
      gap: root.querySelector("[data-gap]"),
      gapBar: root.querySelector("[data-gap-bar]"),
      result: root.querySelector("[data-result]"),
      panic: root.querySelector("[data-panic]"),
      panicOut: root.querySelector("[data-panic-out]"),
      cardP: root.querySelector("[data-card='patient']"),
      cardI: root.querySelector("[data-card='impatient']"),
      coins: root.querySelector("[data-coins]"),
      replay: root.querySelector("[data-replay]"),
    };
    this.chart = new CandleChart(root.querySelector(".s2-chart"), {
      candles,
      yMin: 80,
      yMax: 262,
      gridStep: 40,
      axis: false,
      ghost: 0.16,
      maxBody: 12,
      palette: PALETTE,
      pad: { l: 8, r: 8, t: 18, b: 22 },
    });
    this.chart.onFrame = (v) => this.updateCounters(v);
    this.run();
    this.el.panic.addEventListener("input", () => {
      this.run();
      this.chart.draw();
      this.updateCounters(this.chart.visible);
      if (this.step === 2) this.showResult(false);
    });
    this.el.replay.addEventListener("click", () => {
      this.chart.visible = 0;
      this.requestStep && this.requestStep(1);
    });
  },

  run() {
    const pct = Number(this.el.panic.value);
    this.el.panicOut.textContent = `${pct}%`;
    this.sim = simulate(pct / 100);
    this.chart.set("trades", {
      type: "trades",
      points: this.sim.trades,
      buy: "#7fd6a4",
      sell: "#f1cf7c",
      ring: "rgba(1,40,28,0.9)",
    });
  },

  updateCounters(visible) {
    const k = Math.max(0, Math.min(N - 1, Math.floor(visible) - 1));
    const started = visible >= 1;
    const p = started ? this.sim.patient[k] : START;
    const im = started ? this.sim.impatient[k] : START;
    this.el.patient.textContent = inr(p);
    this.el.impatient.textContent = inr(im);
    const done = this.sim.trades.filter((t) => t.i < visible - 0.2).length;
    this.el.trades.textContent = `${done} ${done === 1 ? "trade" : "trades"}`;
  },

  showResult(animate = true) {
    const P = this.sim.patient[N - 1];
    const I = this.sim.impatient[N - 1];
    const gap = P - I;
    this.el.gap.textContent = inr(gap);
    this.el.gapBar.style.setProperty("--share", `${Math.max(0.04, Math.min(1, gap / P))}`);
    this.el.result.classList.add("is-visible");
    if (animate) this.flyCoins(Math.min(8, Math.max(3, this.sim.trades.length)));
  },

  flyCoins(n) {
    // gold coins travel from the impatient card to the patient card: the money
    // the impatient trader handed over by selling low and buying back high
    if (reducedMotion()) return;
    const box = this.el.coins.getBoundingClientRect();
    const a = this.el.cardI.getBoundingClientRect();
    const b = this.el.cardP.getBoundingClientRect();
    const from = { x: a.left + a.width * 0.5 - box.left, y: a.top + a.height * 0.45 - box.top };
    const to = { x: b.left + b.width * 0.5 - box.left, y: b.top + b.height * 0.45 - box.top };
    for (let k = 0; k < n; k++) {
      const coin = document.createElement("span");
      coin.className = "s2-coin";
      this.el.coins.appendChild(coin);
      const lift = 60 + k * 6;
      const anim = coin.animate(
        [
          { transform: `translate(${from.x}px, ${from.y}px) scale(0.6)`, opacity: 0 },
          { transform: `translate(${from.x}px, ${from.y - 10}px) scale(1)`, opacity: 1, offset: 0.12 },
          { transform: `translate(${(from.x + to.x) / 2}px, ${Math.min(from.y, to.y) - lift}px) scale(1.1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${to.x}px, ${to.y}px) scale(0.7)`, opacity: 0 },
        ],
        { duration: 1100, delay: k * 140, easing: "cubic-bezier(0.33, 0, 0.2, 1)", fill: "backwards" }
      );
      anim.onfinish = () => coin.remove();
    }
  },

  enter(step, instant) { this.go(step, instant); },
  leave() {},

  async go(step, instant = false) {
    this.step = step;
    const token = (this._token = Symbol());
    this.root.classList.toggle("is-playing", step >= 1);
    this.lines.forEach((el) => el.classList.add("is-on"));
    if (step < 2) this.el.result.classList.remove("is-visible");
    this.el.replay.hidden = step < 1;

    const backwards = STOP[step] < this.chart.visible;
    await this.chart.play(STOP[step], { instant: instant || backwards, speed: 16 });
    this.updateCounters(this.chart.visible);
    if (token !== this._token) return;
    if (step === 2) this.showResult(!instant);
  },
};
