// Scene 05: primary vs secondary market. A toggle (and the clicker) switches
// between the two flow diagrams: company <-> investors, or seller <-> buyer.

import { replayEntrance } from "../lib/steps.js";

export default {
  id: "markets",
  title: "Primary vs secondary market",
  steps: 2,

  init(root) {
    this.root = root;
    this.buttons = [...root.querySelectorAll("[data-mode]")];
    this.explain = [...root.querySelectorAll("[data-explain]")];
    this.modes = [...root.querySelectorAll("[data-diagram-mode]")];
    this.svg = root.querySelector("[data-diagram]");
    this.buttons.forEach((b) =>
      b.addEventListener("click", () => this.requestStep && this.requestStep(Number(b.dataset.mode)))
    );
  },

  enter(step) { replayEntrance(this.root); this.go(step); },
  leave() { this.svg.pauseAnimations?.(); },

  go(step) {
    this.buttons.forEach((b, k) => b.setAttribute("aria-pressed", String(k === step)));
    this.explain.forEach((el, k) => (el.hidden = k !== step));
    this.modes.forEach((g, k) => (g.style.display = k === step ? "" : "none"));
    this.svg.unpauseAnimations?.();
    this.root.dataset.mode = step;
  },
};
