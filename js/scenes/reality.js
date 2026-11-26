// Scene 03: the reality check. A grid of 100 people answers each statistic:
// 13 of 100 Indians invest, 5 use mutual funds; then, of 100 traders, 95 lose.

import { revealSteps, countUp, replayEntrance } from "../lib/steps.js";

const CAPS = [
  ["Out of every 100 Indians", "Each dot is one person."],
  ["Out of every 100 Indians", "13 invest in the share market."],
  ["Out of every 100 Indians", "13 invest; 5 of them through mutual funds."],
  ["Out of every 100 traders", "95 lose money. Only 5 earn."],
];

export default {
  id: "reality",
  title: "The reality check",
  steps: 4,

  init(root) {
    this.root = root;
    this.dots = [...root.querySelectorAll(".s3-dot")];
    this.cap = root.querySelector("[data-cap]");
    this.legend = root.querySelector("[data-legend]");
    this.grid = root.querySelector("[data-grid]");
  },

  enter(step) { replayEntrance(this.root); this.go(step); },
  leave() {},

  go(step) {
    const prev = this.step ?? -1;
    this.step = step;
    revealSteps(this.root, step);
    this.cap.textContent = CAPS[step][0];
    this.legend.textContent = CAPS[step][1];
    this.grid.dataset.view = step === 3 ? "traders" : "people";
    // which dots light up, and in what colour
    this.dots.forEach((d, k) => {
      let state = "";
      if (step === 3) state = k < 95 ? "lose" : "earn";
      else if (step === 2) state = k < 5 ? "mf" : k < 13 ? "invest" : "";
      else if (step === 1) state = k < 13 ? "invest" : "";
      d.dataset.state = state;
    });
    // count up the numbers revealed on this click
    this.root.querySelectorAll(".s3-stat").forEach((li) => {
      const b = li.querySelector("[data-count]");
      const on = step >= Number(li.dataset.step);
      if (on && (Number(li.dataset.step) > prev || prev === -1)) countUp(b, Number(b.dataset.count), { suffix: "%" });
      else if (!on) b.textContent = "0%";
    });
  },
};
