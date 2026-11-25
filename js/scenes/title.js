// Scene 01: title. The tagline drawn as a price journey:
// a sideways range (Learn), a breakout (Analyse), a trend (Grow).

import { CandleChart, candlesFromWaypoints, COLORS } from "../candles.js";

const N = 64;
const SUPPORT = 1000;
const RESIST = 1060;

const candles = candlesFromWaypoints(
  [
    { i: 0, p: 1030, kind: "close" },
    { i: 3, p: 1058, kind: "high" },
    { i: 7, p: 1002, kind: "low" },
    { i: 11, p: 1059, kind: "high" },
    { i: 15, p: 1001, kind: "low" },
    { i: 19, p: 1058, kind: "high" },
    { i: 23, p: 1003, kind: "low" },
    { i: 26, p: 1046, kind: "close" },
    { i: 28, p: 1074, kind: "close" },
    { i: 30, p: 1088, kind: "high" },
    { i: 33, p: 1066, kind: "low" },
    { i: 39, p: 1145, kind: "close" },
    { i: 42, p: 1178, kind: "high" },
    { i: 45, p: 1152, kind: "low" },
    { i: 52, p: 1252, kind: "close" },
    { i: 55, p: 1288, kind: "high" },
    { i: 57, p: 1262, kind: "low" },
    { i: 63, p: 1372, kind: "close" },
  ],
  N,
  { vol: 7, seed: 5 }
);

// exponential moving average of closes, drawn over the trend
function ema(period, from) {
  const k = 2 / (period + 1);
  const out = [];
  let v = candles[from].c;
  for (let i = from; i < N; i++) {
    v = candles[i].c * k + v * (1 - k);
    out.push({ i, p: v });
  }
  return out;
}
const TREND_MA = ema(8, 24).filter((q) => q.i >= 31);

// candle count shown at the end of each phase
const STOP = [27, 35, N];

export default {
  id: "title",
  title: "Smarter trading starts here",
  steps: STOP.length,

  init(root) {
    this.root = root;
    this.words = [...root.querySelectorAll("[data-word]")];
    this.chart = new CandleChart(root.querySelector(".title-chart"), {
      candles,
      // range sits along the bottom, the trend climbs into the top-right,
      // leaving the upper-left for the copy
      yMin: 935,
      yMax: 1545,
      gridStep: 40,
      axis: false,
      maxBody: 22,
      ghost: 0.13,
      pad: { l: 0, r: 0, t: 32, b: 24 },
    });
    this.chart.onResize = () => this.placeWords();
    this.placeWords();
  },

  placeWords() {
    const c = this.chart;
    if (!c.w) return;
    // chart coordinates are relative to the canvas, which sits lower on phones
    const ox = c.canvas.offsetLeft, oy = c.canvas.offsetTop;
    const at = (el, x, y) => {
      el.style.setProperty("--x", `${Math.round(ox + x)}px`);
      el.style.setProperty("--y", `${Math.round(oy + y)}px`);
    };
    const [learn, analyse, grow] = this.words;
    // Learn: sits on the range's ceiling
    at(learn, c.x(9), c.y(RESIST) - 18);
    // Analyse: under the breakout, where the chart leaves open space
    at(analyse, c.x(30), c.y(RESIST) + 22);
    // Grow: above the trend, left of its last candles
    at(grow, c.x(43), c.y(1372) - 10);
  },

  enter(step, instant) { this.go(step, instant); },
  leave() {},

  async go(step, instant = false) {
    const c = this.chart;
    const token = (this._token = Symbol());
    this.words.forEach((el, k) => {
      el.classList.toggle("is-on", k <= step);
      el.classList.toggle("is-current", k === step);
    });

    const want = new Set();
    const put = (id, o) => { want.add(id); c.set(id, { id, ...o }); };
    const faint = "rgba(238,242,247,0.28)";

    put("range", { type: "zone", from: SUPPORT, to: RESIST, fill: "rgba(238,242,247,0.035)", fromI: 0, toI: 26 });
    put("support", { type: "hline", price: SUPPORT, color: faint, width: 1, dash: true, tag: false, toI: 26 });
    if (step === 0) {
      put("resist", { type: "hline", price: RESIST, color: faint, width: 1, dash: true, tag: false, toI: 26 });
    } else {
      // the ceiling the price breaks through turns gold and runs on past the breakout
      put("resist", { type: "hline", price: RESIST, color: COLORS.gold, width: 2, dash: true, tag: false, toI: 36 });
    }
    if (step >= 2) put("ma", { type: "path", points: TREND_MA, color: COLORS.gold, width: 2.5 });
    for (const id of [...c.overlays.keys()]) if (!want.has(id)) c.remove(id);

    const backwards = STOP[step] < c.visible;
    await c.play(STOP[step], { instant: instant || backwards, speed: step === 2 ? 13 : 11 });
    if (token !== this._token) return;
  },
};
