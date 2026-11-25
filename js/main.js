// Deck controller: scenes, in-scene steps, URL hash, keyboard, touch and rail.

import title from "./scenes/title.js";
import doubleBottom from "./scenes/double-bottom.js";
import supportResistance from "./scenes/support-resistance.js";

const MODULES = { title, "double-bottom": doubleBottom, "support-resistance": supportResistance };

const sections = [...document.querySelectorAll(".scene")];
const scenes = sections.map((el, index) => {
  const mod = MODULES[el.dataset.scene];
  mod.init(el);
  mod.requestStep = (step) => goto(index, step);
  return { el, mod };
});

const rail = {
  count: document.querySelector("[data-rail-count]"),
  title: document.querySelector("[data-rail-title]"),
  progress: document.querySelector("[data-rail-progress]"),
  prev: document.querySelector("[data-prev]"),
  next: document.querySelector("[data-next]"),
};

let current = -1;
let step = 0;

const pad = (n) => String(n).padStart(2, "0");

function goto(index, nextStep = 0, { instant = false } = {}) {
  index = Math.max(0, Math.min(scenes.length - 1, index));
  const changing = index !== current;
  if (changing) {
    if (current >= 0) {
      scenes[current].el.classList.remove("is-active");
      scenes[current].el.setAttribute("aria-hidden", "true");
      scenes[current].mod.leave();
    }
    current = index;
    const { el } = scenes[current];
    el.classList.add("is-active");
    document.body.dataset.theme = el.dataset.theme || "dark";
    el.removeAttribute("aria-hidden");
  }
  const { mod } = scenes[current];
  step = Math.max(0, Math.min(mod.steps - 1, nextStep));
  if (changing) mod.enter(step, instant);
  else mod.go(step, instant);

  const hash = `#${pad(current + 1)}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
  rail.count.innerHTML = `${pad(current + 1)} <span>/ ${pad(scenes.length)}</span>`;
  rail.title.textContent = mod.title;
  const total = scenes.length;
  const within = mod.steps > 1 ? step / (mod.steps - 1) : 1;
  rail.progress.style.width = `${((current + within) / total) * 100}%`;
  rail.prev.disabled = current === 0 && step === 0;
  rail.next.disabled = current === total - 1 && step === mod.steps - 1;
}

function next() {
  const { mod } = scenes[current];
  if (step < mod.steps - 1) goto(current, step + 1);
  else if (current < scenes.length - 1) goto(current + 1, 0);
}

function prev() {
  if (step > 0) goto(current, step - 1);
  else if (current > 0) {
    // land on the finished state of the previous scene
    const target = current - 1;
    goto(target, scenes[target].mod.steps - 1, { instant: true });
  }
}

function fromHash() {
  const n = parseInt((location.hash || "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n - 1 : 0;
}

// --- input
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const onControl = e.target.closest("button, a, input, select, textarea");
  switch (e.key) {
    case "ArrowRight":
    case "PageDown":
      e.preventDefault(); next(); break;
    case " ":
      if (onControl) return;
      e.preventDefault(); next(); break;
    case "ArrowLeft":
    case "PageUp":
      e.preventDefault(); prev(); break;
    case "Home":
      goto(0); break;
    case "End":
      goto(scenes.length - 1); break;
    case "f":
    case "F":
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
      break;
  }
});

rail.next.addEventListener("click", next);
rail.prev.addEventListener("click", prev);
document.querySelectorAll("[data-goto-next]").forEach((b) => b.addEventListener("click", next));

// swipe between scenes, but never while dragging on a chart
let touch = null;
document.addEventListener("touchstart", (e) => {
  if (e.target.closest("canvas, .stage")) return (touch = null);
  touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
document.addEventListener("touchend", (e) => {
  if (!touch) return;
  const dx = e.changedTouches[0].clientX - touch.x;
  const dy = e.changedTouches[0].clientY - touch.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  touch = null;
}, { passive: true });

window.addEventListener("hashchange", () => {
  const i = fromHash();
  if (i !== current) goto(i, 0);
});

goto(fromHash(), 0);
