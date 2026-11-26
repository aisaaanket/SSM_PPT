// Scene 06: cash (equity) segment. Rows reveal per click; every cell explains
// itself when tapped. A market-hours strip shows the intraday window.

import { revealSteps, replayEntrance } from "../lib/steps.js";

const WHY = {
  ib: ["Intraday buy: allowed", "Buy and sell within the same day. Open positions must be closed by 3:15, or the broker squares them off."],
  is: ["Intraday sell: allowed", "You can sell first and buy back later the same day. This is short selling, and it must be closed before 3:15."],
  db: ["Delivery buy: allowed", "Buy shares and hold them in your demat account for as long as you like."],
  ds: ["Delivery sell: not allowed", "You cannot sell shares you do not own and carry that position overnight. In the cash segment, short selling is intraday only."],
};
const DEFAULT = { 0: "ib", 1: "is", 2: "ds" };

export default {
  id: "cash",
  title: "Cash (equity) segment",
  steps: 3,

  init(root) {
    this.root = root;
    this.whyTitle = root.querySelector("[data-why-title]");
    this.text = root.querySelector("[data-why-text]");
    this.cells = [...root.querySelectorAll("[data-why]")];
    this.cells.forEach((c) => c.addEventListener("click", () => this.explain(c.dataset.why)));
  },

  explain(key) {
    const [t, x] = WHY[key];
    this.whyTitle.textContent = t;
    this.text.textContent = x;
    this.cells.forEach((c) => c.classList.toggle("is-picked", c.dataset.why === key));
    const cell = this.cells.find((c) => c.dataset.why === key);
    if (key === "ds") { cell.classList.remove("is-shake"); void cell.offsetWidth; cell.classList.add("is-shake"); }
  },

  enter(step) { replayEntrance(this.root); this.go(step); },
  leave() {},

  go(step) {
    revealSteps(this.root, step);
    this.root.dataset.step = step;
    if (step === 0) {
      this.whyTitle.textContent = "Tap any cell";
      this.text.textContent = "Each answer explains why it is allowed or not.";
      this.cells.forEach((c) => c.classList.remove("is-picked"));
    } else this.explain(DEFAULT[step]);
  },
};
