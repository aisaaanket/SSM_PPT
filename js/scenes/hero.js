// Scene: hero — a 3D field of live candles drifting past, behind the SMISHA mark.

import * as THREE from "../../vendor/three.module.min.js";
import { reducedMotion } from "../candles.js";

const COLS = 46;
const ROWS = 12;
const GAP_X = 1.0;
const GAP_Z = 2.6;
const SPEED = 0.55; // world units per second

function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default {
  id: "hero",
  title: "Smarter trading starts here",
  steps: 1,

  init(root) {
    this.root = root;
    const canvas = root.querySelector(".hero-canvas");
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch (e) {
      canvas.remove(); // no WebGL: the navy background and copy still stand
      return;
    }
    const r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setClearColor(0x040d1a, 1);

    const scene = (this.scene = new THREE.Scene());
    scene.fog = new THREE.Fog(0x040d1a, 10, 42);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camBase = new THREE.Vector3(6, 4.6, 11);
    this.camera.position.copy(this.camBase);

    scene.add(new THREE.AmbientLight(0x8fa6c4, 0.9));
    const key = new THREE.DirectionalLight(0xffd27a, 1.6);
    key.position.set(-6, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x4f7bd6, 0.7);
    rim.position.set(8, 3, -10);
    scene.add(rim);

    // gold floor grid
    const grid = new THREE.GridHelper(80, 80, 0xffb800, 0xffb800);
    grid.material.transparent = true;
    grid.material.opacity = 0.08;
    grid.position.y = -2.2;
    scene.add(grid);

    // candles: one instanced mesh for bodies, one for wicks
    const count = COLS * ROWS;
    const bodyGeo = new THREE.BoxGeometry(0.56, 1, 0.56);
    const wickGeo = new THREE.BoxGeometry(0.07, 1, 0.07);
    const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.2 });
    const wickMat = new THREE.MeshBasicMaterial();
    this.bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, count);
    this.wicks = new THREE.InstancedMesh(wickGeo, wickMat, count);
    scene.add(this.bodies, this.wicks);

    // each row is its own price series, generated as a random walk
    const rand = (this.rand = rng(4242));
    this.rows = [];
    for (let rI = 0; rI < ROWS; rI++) {
      const row = { level: (rand() - 0.5) * 2, drift: (rand() - 0.45) * 0.08, series: [] };
      for (let c = 0; c < COLS; c++) row.series.push(this.nextCandle(row));
      this.rows.push(row);
    }
    this.offset = 0;
    this.green = new THREE.Color(0x22b07d);
    this.red = new THREE.Color(0xe5484d);
    this.m = new THREE.Matrix4();
    this.writeAll();

    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener("pointermove", (e) => {
      this.pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      this.pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
  },

  nextCandle(row) {
    const r = this.rand;
    // mean-revert gently so rows stay in frame
    row.drift += (r() - 0.5) * 0.12 - row.level * 0.02;
    row.drift = Math.max(-0.35, Math.min(0.35, row.drift));
    const o = row.level;
    const c = o + row.drift + (r() - 0.5) * 0.5;
    row.level = c;
    const h = Math.max(o, c) + r() * 0.35;
    const l = Math.min(o, c) - r() * 0.35;
    return { o, c, h, l };
  },

  writeAll() {
    const { m } = this;
    let k = 0;
    for (let rI = 0; rI < ROWS; rI++) {
      const row = this.rows[rI];
      const z = -rI * GAP_Z;
      for (let cI = 0; cI < COLS; cI++, k++) {
        const s = row.series[cI];
        const x = (cI - COLS * 0.55) * GAP_X - this.offset;
        const bh = Math.max(0.06, Math.abs(s.c - s.o));
        m.makeScale(1, bh, 1);
        m.setPosition(x, (s.o + s.c) / 2, z);
        this.bodies.setMatrixAt(k, m);
        m.makeScale(1, s.h - s.l, 1);
        m.setPosition(x, (s.h + s.l) / 2, z);
        this.wicks.setMatrixAt(k, m);
        const col = s.c >= s.o ? this.green : this.red;
        this.bodies.setColorAt(k, col);
        this.wicks.setColorAt(k, col);
      }
    }
    this.bodies.instanceMatrix.needsUpdate = true;
    this.wicks.instanceMatrix.needsUpdate = true;
    this.bodies.instanceColor.needsUpdate = true;
    this.wicks.instanceColor.needsUpdate = true;
  },

  resize() {
    if (!this.renderer) return;
    const canvas = this.renderer.domElement;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // narrow screens: pull back so the field still reads
    this.camera.fov = width / height < 0.9 ? 58 : 42;
    this.camera.updateProjectionMatrix();
    this.render(0);
  },

  render(dt) {
    const p = this.pointer;
    p.x += (p.tx - p.x) * Math.min(1, dt * 2.5);
    p.y += (p.ty - p.y) * Math.min(1, dt * 2.5);
    this.camera.position.set(this.camBase.x + p.x * 1.4, this.camBase.y - p.y * 0.8, this.camBase.z);
    this.camera.lookAt(3, 0, -9);
    this.renderer.render(this.scene, this.camera);
  },

  tick(t) {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(0.05, (t - (this.last || t)) / 1000));
    this.last = t;
    this.offset += SPEED * dt;
    // when a full candle has scrolled out, shift every row and print a new candle
    while (this.offset >= GAP_X) {
      this.offset -= GAP_X;
      for (const row of this.rows) {
        row.series.shift();
        row.series.push(this.nextCandle(row));
      }
    }
    this.writeAll();
    this.render(dt);
    this.raf = requestAnimationFrame((tt) => this.tick(tt));
  },

  enter() {
    if (!this.renderer) return;
    this.active = true;
    this.resize();
    if (reducedMotion()) return; // a still frame, no drift
    this.last = 0;
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },

  leave() {
    this.active = false;
    cancelAnimationFrame(this.raf);
  },

  go() {},
};
