// Shared helpers for the light content slides.

import { reducedMotion } from "../candles.js";

/** Mark every [data-step="n"] element in root as on once the step reaches n. */
export function revealSteps(root, step) {
  root.querySelectorAll("[data-step]").forEach((el) => {
    el.classList.toggle("is-on", step >= Number(el.dataset.step));
    el.classList.toggle("is-now", step === Number(el.dataset.step));
  });
}

/** Count a number up into el (Indian digit grouping), e.g. 0 -> 6000 with a suffix. */
export function countUp(el, to, { suffix = "", duration = 900 } = {}) {
  const fmt = (v) => Math.round(v).toLocaleString("en-IN") + suffix;
  if (reducedMotion()) { el.textContent = fmt(to); return; }
  cancelAnimationFrame(el._raf);
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / duration);
    el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

/** Restart the slide's entrance classes each time it is shown. */
export function replayEntrance(root) {
  root.classList.remove("is-entered");
  void root.offsetWidth;
  requestAnimationFrame(() => root.classList.add("is-entered"));
}
