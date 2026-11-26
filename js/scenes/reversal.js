// Scene 07: reversal candles. Left: a downtrend ends with a long red candle and a
// green one (buy). Right: an uptrend ends with a long green candle and a red one (sell).

import { CandleChart, candlesFromWaypoints } from "../candles.js";
import { revealSteps, replayEntrance } from "../lib/steps.js";

const PALETTE = {
  bull: "#1f9d6b",
  bear: "#d64545",
  grid: "rgba(2,45,29,0.07)",
  axis: "rgba(2,45,29,0.4)",
  bg: "#fffaf2",
  paper: "#022d1d",
};

function build(dir) {
  const down = dir === "buy";
  const c = candlesFromWaypoints(
    down
      ? [{ i: 0, p: 160, kind: "close" }, { i: 6, p: 150, kind: "close" }, { i: 9, p: 153, kind: "close" }, { i: 15, p: 134, kind: "close" }, { i: 17, p: 137, kind: "close" }, { i: 20, p: 126, kind: "close" }, { i: 23, p: 124, kind: "close" }]
      : [{ i: 0, p: 100, kind: "close" }, { i: 6, p: 110, kind: "close" }, { i: 9, p: 107, kind: "close" }, { i: 15, p: 126, kind: "close" }, { i: 17, p: 123, kind: "close" }, { i: 20, p: 134, kind: "close" }, { i: 23, p: 136, kind: "close" }],
    24,
    { vol: 2.2, seed: down ? 41 : 43 }
  ).slice(0, 21);
  const last = c[20].c;
  // the two signal candles
  if (down) {
    c.push({ o: last, c: last - 9, h: last + 0.8, l: last - 10 });
    c.push({ o: last - 9.5, c: last - 1, h: last, l: last - 10.6 });
  } else {
    c.push({ o: last, c: last + 9, h: last + 10, l: last - 0.8 });
    c.push({ o: last + 9.5, c: last + 1, h: last + 10.6, l: last });
  }
  return c;
}

export default {
  id: "reversal",
  title: "Reversal candles",
  steps: 3,

  init(root) {
    this.root = root;
    this.charts = {};
    for (const dir of ["buy", "sell"]) {
      const candles = build(dir);
      const ps = candles.flatMap((x) => [x.h, x.l]);
      const lo = Math.min(...ps), hi = Math.max(...ps);
      const chart = new CandleChart(root.querySelector(`[data-chart="${dir}"]`), {
        candles, yMin: lo - 6, yMax: hi + 8, gridStep: 10, axis: false, maxBody: 16,
        palette: PALETTE, pad: { l: 14, r: 34, t: 24, b: 30 },
      });
      // leave room on the right so the signal candles are not on the edge
      chart.slot = () => chart.plotW / (candles.length + 3);
      this.charts[dir] = { chart, n: candles.length };
    }
  },

  enter(step) { replayEntrance(this.root); this.go(step); },
  leave() {},

  async go(step) {
    revealSteps(this.root, step);
    const show = (dir, full) => {
      const { chart, n } = this.charts[dir];
      const target = full ? n : n - 2;
      const back = target < chart.visible;
      if (full) {
        const i = n - 1;
        chart.set("sig", {
          type: "marker", i, dir: dir === "buy" ? "below" : "above",
          text: dir === "buy" ? "Buy" : "Sell",
          size: Math.max(15, Math.round(chart.h * 0.05)),
          color: dir === "buy" ? PALETTE.bull : PALETTE.bear,
          fill: "#ffffff", ink: dir === "buy" ? PALETTE.bull : PALETTE.bear,
        });
        chart.set("zone", { type: "zone", from: dir === "buy" ? chart.candles[n - 2].l - 1.5 : chart.candles[n - 2].l, to: dir === "buy" ? chart.candles[n - 2].h : chart.candles[n - 2].h + 1.5, fill: "rgba(183,133,42,0.12)", fromI: n - 2, toI: n - 1 });
      } else { chart.remove("sig"); chart.remove("zone"); }
      return chart.play(target, { instant: back, speed: 12 });
    };
    if (step === 0) { show("buy", false); show("sell", false); }
    if (step === 1) { show("buy", true); show("sell", false); }
    if (step === 2) { show("buy", true); show("sell", true); }
  },
};
