// Scene: 2B (double bottom) — the trap below support, then the buy.
// Levels come straight from the seminar deck: 220 → 200 → 210 → 195, buy above 210, SL 195.

import { CandleChart, candlesFromWaypoints, COLORS } from "../candles.js";

const N = 46;
const ENTRY = 210;
const DEFAULT_SL = 195;
const DEFAULT_TARGET = 240;

const candles = candlesFromWaypoints(
  [
    { i: 0, p: 216, kind: "close" },
    { i: 2, p: 220, kind: "high" },
    { i: 10, p: 200, kind: "low" },
    { i: 16, p: 210, kind: "high" },
    { i: 23, p: 195, kind: "low" },
    { i: 29, p: 207, kind: "close" },
    { i: 31, p: 213, kind: "close" },
    { i: 36, p: 226, kind: "close" },
    { i: 42, p: 241, kind: "high" },
    { i: 45, p: 236, kind: "close" },
  ],
  N,
  { vol: 1.6, seed: 11 }
);

// candle index where each narration step ends
const STOP = [11, 17, 25, 32, N];

export default {
  id: "double-bottom",
  title: "2B: the double bottom",
  steps: STOP.length,

  init(root) {
    this.root = root;
    this.items = [...root.querySelectorAll(".steps li")];
    this.ticket = root.querySelector(".ticket");
    this.toast = root.querySelector(".toast");
    this.out = {
      entry: root.querySelector("[data-entry]"),
      sl: root.querySelector("[data-sl]"),
      target: root.querySelector("[data-target]"),
      risk: root.querySelector("[data-risk]"),
      reward: root.querySelector("[data-reward]"),
      rr: root.querySelector("[data-rr]"),
    };
    this.chart = new CandleChart(root.querySelector("canvas"), {
      candles,
      yMin: 188,
      yMax: 248,
      gridStep: 5,
    });
    this.chart.onDrag = () => this.updateTicket();
    this.chart.onDragEnd = () => {
      if (Math.floor(this.chart.visible) >= N) this.showOutcome();
    };
    root.querySelector("[data-replay]").addEventListener("click", () => this.replay());
    root.querySelector("[data-reset]").addEventListener("click", () => this.resetLevels());
    this.items.forEach((li, k) =>
      li.addEventListener("click", () => this.requestStep && this.requestStep(k))
    );
  },

  enter(step, instant) { this.go(step, instant); },
  leave() {},

  async go(step, instant = false) {
    const c = this.chart;
    const token = (this._token = Symbol());
    this.items.forEach((li, k) => {
      li.classList.toggle("is-done", k < step);
      li.classList.toggle("is-current", k === step);
    });

    // overlays are a pure function of the step, so going backwards is safe
    const want = new Set();
    const put = (id, o) => { want.add(id); c.set(id, { id, ...o }); };

    put("top", { type: "marker", i: 2, dir: "above", text: "220", color: COLORS.muted, ink: COLORS.paper });
    put("b1", { type: "marker", i: 10, dir: "below", text: "Bottom 200", color: COLORS.paper });
    if (step >= 1) {
      put("neck", { type: "hline", price: ENTRY, color: COLORS.gold, dash: true, label: "Trigger line 210", fromI: 10 });
    }
    if (step >= 2) {
      put("trap", { type: "zone", from: 195, to: 200, fill: "rgba(229,72,77,0.12)", fromI: 20, toI: 26 });
      put("b2", { type: "marker", i: 23, dir: "below", text: "2B: breaks to 195,\nthen fails", color: COLORS.bear });
    }
    if (step >= 3) {
      const sl = c.get("sl")?.price ?? DEFAULT_SL;
      const tg = c.get("target")?.price ?? DEFAULT_TARGET;
      put("sl", { type: "hline", price: sl, color: COLORS.bear, label: "Stop-loss", labelBelow: true, draggable: true, snap: 1, min: 180, max: ENTRY - 1, fromI: 23 });
      put("target", { type: "hline", price: tg, color: COLORS.bull, label: "Target", draggable: true, snap: 1, min: ENTRY + 1, max: 248, fromI: 23 });
      put("buy", { type: "marker", i: 31, dir: "above", text: "Buy above 210", color: COLORS.bull, price: candles[31].h });
    }
    for (const id of [...c.overlays.keys()]) if (!want.has(id)) c.remove(id);

    this.ticket.classList.toggle("is-visible", step >= 3);
    this.toast.classList.remove("is-visible");
    this.updateTicket();

    // stepping back jumps; stepping forward plays the candles out
    const backwards = STOP[step] < c.visible;
    await c.play(STOP[step], { instant: instant || backwards, speed: step === 4 ? 7 : 9 });
    if (token !== this._token) return;
    if (step === 4) this.showOutcome();
  },

  replay() {
    this.chart.visible = 0;
    this.chart.draw();
    this.requestStep && this.requestStep(0);
  },

  resetLevels() {
    const c = this.chart;
    if (c.get("sl")) c.get("sl").price = DEFAULT_SL;
    if (c.get("target")) c.get("target").price = DEFAULT_TARGET;
    c.draw();
    this.updateTicket();
    if (Math.floor(c.visible) >= N) this.showOutcome();
  },

  updateTicket() {
    const sl = this.chart.get("sl")?.price ?? DEFAULT_SL;
    const tg = this.chart.get("target")?.price ?? DEFAULT_TARGET;
    const risk = ENTRY - sl;
    const reward = tg - ENTRY;
    this.out.entry.textContent = ENTRY;
    this.out.sl.textContent = sl;
    this.out.target.textContent = tg;
    this.out.risk.textContent = `${risk} pts`;
    this.out.reward.textContent = `${reward} pts`;
    this.out.rr.textContent = `1 : ${(reward / risk).toFixed(1).replace(/\.0$/, "")}`;
  },

  showOutcome() {
    // walk the candles after entry: which level was touched first?
    const sl = this.chart.get("sl")?.price ?? DEFAULT_SL;
    const tg = this.chart.get("target")?.price ?? DEFAULT_TARGET;
    let result = "open";
    for (let i = 32; i < N; i++) {
      if (candles[i].l <= sl) { result = "sl"; break; }
      if (candles[i].h >= tg) { result = "target"; break; }
    }
    const t = this.toast;
    t.classList.remove("is-good");
    if (result === "target") {
      t.textContent = `Target hit: +${tg - ENTRY} points for ${ENTRY - sl} risked`;
      t.classList.add("is-good");
    } else if (result === "sl") {
      t.textContent = `Stopped out at ${sl}: the stop was too tight for this swing`;
    } else {
      t.textContent = `Price never reached ${tg}. The trade is still open`;
    }
    t.classList.add("is-visible");
  },
};
