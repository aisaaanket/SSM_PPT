// Scene: support & resistance — the viewer finds the levels by dragging,
// then watches the breakout and the old ceiling turn into a floor.

import { CandleChart, candlesFromWaypoints, pivots, COLORS } from "../candles.js";

const N = 72;
const SUPPORT = 1482;
const RESIST = 1548;
const TOL = 7; // a swing within this many points of the line counts as a touch

const candles = candlesFromWaypoints(
  [
    { i: 0, p: 1506, kind: "close" },
    { i: 5, p: 1548, kind: "high" },
    { i: 12, p: 1482, kind: "low" },
    { i: 19, p: 1549, kind: "high" },
    { i: 27, p: 1481, kind: "low" },
    { i: 34, p: 1547, kind: "high" },
    { i: 41, p: 1483, kind: "low" },
    { i: 47, p: 1532, kind: "close" },
    { i: 51, p: 1566, kind: "close" },
    { i: 54, p: 1572, kind: "high" },
    { i: 58, p: 1551, kind: "low" },
    { i: 65, p: 1594, kind: "high" },
    { i: 71, p: 1586, kind: "close" },
  ],
  N,
  { vol: 4.5, seed: 21 }
);

const { lows, highs } = pivots(candles.slice(0, 46), 3);
const STOP = [46, 52, 60, N];

export default {
  id: "support-resistance",
  title: "Support and resistance",
  steps: STOP.length,

  init(root) {
    this.root = root;
    this.items = [...root.querySelectorAll(".steps li")];
    this.toast = root.querySelector(".toast");
    this.status = root.querySelector("[data-status]");
    this.found = { support: false, resist: false };
    this.chart = new CandleChart(root.querySelector("canvas"), {
      candles,
      yMin: 1450,
      yMax: 1610,
      gridStep: 20,
    });
    this.chart.onDrag = () => this.score();
    this.chart.onDragEnd = () => this.score(true);
    root.querySelector("[data-show]").addEventListener("click", () => this.showMe());
    this.items.forEach((li, k) =>
      li.addEventListener("click", () => this.requestStep && this.requestStep(k))
    );
  },

  enter(step, instant) { this.go(step, instant); },
  leave() {},

  touches(price, kind) {
    const idx = kind === "support" ? lows : highs;
    return idx
      .filter((i) => Math.abs((kind === "support" ? candles[i].l : candles[i].h) - price) <= TOL)
      .map((i) => ({ i, p: kind === "support" ? candles[i].l : candles[i].h }));
  },

  score(final = false) {
    const c = this.chart;
    const s = c.get("support"), r = c.get("resist");
    if (!s || !r) return;
    const st = this.touches(s.price, "support");
    const rt = this.touches(r.price, "resist");
    c.set("sDots", { type: "dots", points: st, color: COLORS.bull });
    c.set("rDots", { type: "dots", points: rt, color: COLORS.bear });
    s.label = `Support: ${st.length} ${st.length === 1 ? "touch" : "touches"}`;
    r.label = `Resistance: ${rt.length} ${rt.length === 1 ? "touch" : "touches"}`;
    this.found.support = st.length >= 3;
    this.found.resist = rt.length >= 3;
    s.width = this.found.support ? 2.5 : 1.5;
    r.width = this.found.resist ? 2.5 : 1.5;
    s.dash = !this.found.support;
    r.dash = !this.found.resist;
    c.draw();

    const both = this.found.support && this.found.resist;
    this.status.textContent = both
      ? "Both levels found. Press Next to see what happens when price breaks out."
      : this.found.support
        ? "Support found. Now drag the red line to where sellers keep stepping in."
        : this.found.resist
          ? "Resistance found. Now drag the green line to where buyers keep stepping in."
          : "Drag each line until it touches three turning points.";
    if (final && both && !this.celebrated) {
      this.celebrated = true;
      this.flash("Both levels found: price turned at each one three times", true);
    }
  },

  showMe() {
    const c = this.chart;
    if (c.get("support")) c.get("support").price = SUPPORT;
    if (c.get("resist")) c.get("resist").price = RESIST;
    this.score(true);
  },

  flash(text, good) {
    const t = this.toast;
    t.textContent = text;
    t.classList.toggle("is-good", !!good);
    t.classList.add("is-visible");
    clearTimeout(this._tt);
    this._tt = setTimeout(() => t.classList.remove("is-visible"), 3200);
  },

  async go(step, instant = false) {
    const c = this.chart;
    const token = (this._token = Symbol());
    this.items.forEach((li, k) => {
      li.classList.toggle("is-done", k < step);
      li.classList.toggle("is-current", k === step);
    });
    this.root.querySelector("[data-show]").hidden = step !== 0;

    const want = new Set();
    const put = (id, o) => { want.add(id); c.set(id, { id, ...o }); };

    if (step === 0) {
      // keep wherever the viewer left the lines; start them deliberately off-level
      const sp = c.get("support")?.price ?? 1508;
      const rp = c.get("resist")?.price ?? 1524;
      put("support", { type: "hline", price: sp, color: COLORS.bull, draggable: true, snap: 1, min: 1455, max: 1600, dash: true, labelBelow: true });
      put("resist", { type: "hline", price: rp, color: COLORS.bear, draggable: true, snap: 1, min: 1455, max: 1600, dash: true });
      want.add("sDots"); want.add("rDots");
    } else {
      put("support", { type: "hline", price: SUPPORT, color: COLORS.bull, width: 2.5, label: "Support 1,482", labelBelow: true });
      put("resist", { type: "hline", price: RESIST, color: COLORS.bear, width: 2.5, label: step === 0 ? "" : "Resistance 1,548", toI: step >= 2 ? 50 : null, labelAt: 46 });
      put("sDots", { type: "dots", points: this.touches(SUPPORT, "support"), color: COLORS.bull });
      put("rDots", { type: "dots", points: this.touches(RESIST, "resist"), color: COLORS.bear });
    }
    if (step >= 1) put("bo", { type: "marker", i: 51, dir: "above", text: "Breakout: closes above 1,548", color: COLORS.gold });
    if (step >= 2) {
      put("flip", { type: "zone", from: 1542, to: 1556, fill: "rgba(255,184,0,0.12)", fromI: 52, toI: 62, label: "Old ceiling, new floor", color: COLORS.gold });
      put("retest", { type: "marker", i: 58, dir: "below", text: "Retest holds: buy", color: COLORS.bull });
    }
    for (const id of [...c.overlays.keys()]) if (!want.has(id)) c.remove(id);

    if (step === 0) this.score();
    else this.status.textContent = "Support sits near 1,482 and resistance near 1,548: three touches each.";

    const backwards = STOP[step] < c.visible;
    await c.play(STOP[step], { instant: instant || backwards, speed: 14 });
    if (token !== this._token) return;
  },
};
