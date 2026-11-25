// Patient vs impatient: the same illustrative price path, two behaviours.
// Patient buys once and holds. Impatient sells after a fall of `panic` from the
// high since buying, and buys back after a rise of `panic` from the low since
// selling, paying `cost` per trade (brokerage, taxes, slippage).

import { candlesFromWaypoints } from "../candles.js";

export const START = 100000;

// six years of monthly candles: a rising market with three sharp corrections
export const candles = candlesFromWaypoints(
  [
    { i: 0, p: 100, kind: "close" },
    { i: 7, p: 128, kind: "close" },
    { i: 10, p: 109, kind: "close" },
    { i: 13, p: 121, kind: "close" },
    { i: 16, p: 112, kind: "close" },
    { i: 24, p: 158, kind: "close" },
    { i: 30, p: 124, kind: "close" },
    { i: 33, p: 138, kind: "close" },
    { i: 36, p: 129, kind: "close" },
    { i: 45, p: 186, kind: "close" },
    { i: 48, p: 168, kind: "close" },
    { i: 51, p: 183, kind: "close" },
    { i: 55, p: 171, kind: "close" },
    { i: 64, p: 226, kind: "close" },
    { i: 67, p: 211, kind: "close" },
    { i: 71, p: 248, kind: "close" },
  ],
  72,
  { vol: 4.5, seed: 31 }
);

export function simulate(panic = 0.08, cost = 0.004) {
  const c = candles;
  const patientShares = START / c[0].c;
  let cash = 0, shares = START / c[0].c * (1 - cost);
  let holding = true, peak = c[0].c, trough = c[0].c;
  const trades = [];
  const patient = [], impatient = [];
  for (let i = 0; i < c.length; i++) {
    const px = c[i].c;
    if (holding) {
      peak = Math.max(peak, px);
      if (i > 0 && px <= peak * (1 - panic)) {
        cash = shares * px * (1 - cost);
        shares = 0; holding = false; trough = px;
        trades.push({ i, side: "sell" });
      }
    } else {
      trough = Math.min(trough, px);
      if (px >= trough * (1 + panic)) {
        shares = cash * (1 - cost) / px;
        cash = 0; holding = true; peak = px;
        trades.push({ i, side: "buy" });
      }
    }
    patient.push(patientShares * px);
    impatient.push(holding ? shares * px : cash);
  }
  return { trades, patient, impatient };
}
