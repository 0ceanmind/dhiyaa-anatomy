// Shared helpers: DOM/SVG builders, tweening, controls, math
export const SVGNS = 'http://www.w3.org/2000/svg';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
}
export function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  setAttrs(el, attrs);
  for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
}
function setAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
}
export function svgRoot(w, h_, cls = 'dg') {
  return s('svg', { class: cls, viewBox: `0 0 ${w} ${h_}`, preserveAspectRatio: 'xMidYMid meet' });
}

// ---------- math ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a));
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutBack = t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export function rng(seed = 1) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function hexToRgb(hx) { const n = parseInt(hx.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mixHex(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; }

// ---------- tween ----------
export function tween({ from = 0, to = 1, dur = 800, ease = easeInOut, delay = 0, onUpdate, onDone }) {
  let raf, start, dead = false;
  const tick = now => {
    if (dead) return;
    if (start == null) start = now + delay;
    const t = clamp((now - start) / dur);
    if (now >= start) onUpdate && onUpdate(lerp(from, to, ease(t)), t);
    if (t < 1) raf = requestAnimationFrame(tick); else onDone && onDone();
  };
  raf = requestAnimationFrame(tick);
  return () => { dead = true; cancelAnimationFrame(raf); };
}
// Smoothly animated scalar that can be retargeted (spring-ish damping)
export class Smooth {
  constructor(v = 0, k = 7) { this.v = v; this.t = v; this.k = k; }
  set(t) { this.t = t; }
  jump(v) { this.v = this.t = v; }
  step(dt) { dt *= (window.__ff || 1); this.v += (this.t - this.v) * (1 - Math.exp(-this.k * dt)); if (Math.abs(this.t - this.v) < 1e-4) this.v = this.t; return this.v; }
  get done() { return this.v === this.t; }
}
// rAF loop that only runs while active
export function loop(fn) {
  let raf = null, last = 0, t = 0;
  const tick = now => { const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt; fn(dt, t); raf = requestAnimationFrame(tick); };
  return {
    start() { if (raf == null) { last = 0; raf = requestAnimationFrame(tick); } },
    stop() { if (raf != null) cancelAnimationFrame(raf); raf = null; },
    get running() { return raf != null; }
  };
}

// ---------- tips ----------
// Attach hover-detail content to any element (HTML or SVG)
export function tip(el, title, body, color) {
  el.classList.add('hot');
  el.dataset.tt = title || '';
  el.dataset.tb = body || '';
  if (color) el.dataset.tc = color;
  return el;
}

// ---------- controls ----------
export function segmented(options, onChange, { value = 0, vertical = false, cls = '' } = {}) {
  const wrap = h('div', { class: `seg ${vertical ? 'vert' : ''} ${cls}` });
  const btns = options.map((o, i) => {
    const b = h('button', { type: 'button', html: typeof o === 'string' ? o : o.label });
    b.addEventListener('click', e => { e.stopPropagation(); set(i, true); });
    wrap.append(b); return b;
  });
  function set(i, fire) { btns.forEach((b, j) => b.classList.toggle('on', i === j)); wrap.value = i; if (fire) onChange && onChange(i); }
  set(value, false);
  wrap.set = set;
  return wrap;
}
export function slider({ min = 0, max = 100, step = 1, value = 0, label = '', fmt = v => v, color, width = 560, onInput }) {
  const wrap = h('div', { class: 'slider' });
  const lab = label ? h('span', { class: 'lab', text: label }) : null;
  const inp = h('input', { type: 'range', class: 'rng', min, max, step, value });
  inp.style.width = width + 'px';
  if (color) inp.style.setProperty('--rc', color);
  const val = h('span', { class: 'val' });
  const upd = (fire = true) => {
    const v = +inp.value;
    inp.style.setProperty('--p', ((v - min) / (max - min) * 100) + '%');
    val.innerHTML = fmt(v);
    if (fire) onInput && onInput(v);
  };
  inp.addEventListener('input', () => upd(true));
  inp.addEventListener('keydown', e => e.stopPropagation());
  ['pointerdown', 'click'].forEach(ev => inp.addEventListener(ev, e => e.stopPropagation()));
  if (lab) wrap.append(lab);
  wrap.append(inp, val);
  wrap.input = inp;
  wrap.set = (v, fire = false) => { inp.value = v; upd(fire); };
  upd(false);
  return wrap;
}

// ---------- canvas helpers ----------
export function fitCanvas(canvas, w, h_) {
  const sc = (window.__stageScale || 1) * Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(w * sc); canvas.height = Math.round(h_ * sc);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(sc, 0, 0, sc, 0, 0);
  return ctx;
}
// Convert a pointer event to SVG user coords
export function svgPt(svg, e) {
  const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}
// Convert a pointer event into element-local virtual (unscaled) px
export function localPt(el, e) {
  const r = el.getBoundingClientRect(), sc = window.__stageScale || 1;
  return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
}

// Polyline morph helpers
export function lerpPts(A, B, t) { return A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]); }
export function ptsToPath(P, close = true) {
  if (!P.length) return '';
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 1; i < P.length; i++) d += `L${P[i][0].toFixed(1)},${P[i][1].toFixed(1)}`;
  return close ? d + 'Z' : d;
}
// Smooth closed/open path through points (Catmull-Rom → Bezier)
export function smoothPath(P, close = true, tension = .5) {
  const n = P.length; if (n < 2) return '';
  const g = i => close ? P[(i + n) % n] : P[clamp(i, 0, n - 1)];
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return close ? d + 'Z' : d;
}
export function circlePts(cx, cy, r, n = 64, start = -Math.PI / 2, ry = r) {
  return Array.from({ length: n }, (_, i) => { const a = start + i / n * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry]; });
}
export function fmtNum(v) { return Math.round(v).toLocaleString('en-US'); }

// Count-up animation for elements with data-count
export function countUp(el, to, dur = 1400, decimals = 0) {
  const from = 0;
  return tween({ from, to, dur, ease: easeOut, onUpdate: v => { el.textContent = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US'); } });
}
