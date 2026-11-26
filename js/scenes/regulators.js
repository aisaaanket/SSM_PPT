// Scene 04: who runs the market. BSE (1875), then SEBI as regulator (1988/1992),
// then NSE (1992), each lighting up on the timeline.

import { revealSteps, countUp, replayEntrance } from "../lib/steps.js";

export default {
  id: "regulators",
  title: "Regulators and exchanges",
  steps: 4,

  init(root) { this.root = root; },
  enter(step) { replayEntrance(this.root); this.go(step); },
  leave() {},

  go(step) {
    const prev = this.step ?? -1;
    this.step = step;
    revealSteps(this.root, step);
    this.root.querySelectorAll("[data-count]").forEach((b) => {
      const card = b.closest("[data-step]");
      const at = Number(card.dataset.step);
      if (step >= at && at > prev) countUp(b, Number(b.dataset.count), { suffix: b.dataset.suffix || "", duration: 1100 });
    });
  },
};
