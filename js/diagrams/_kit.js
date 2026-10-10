// Shared helpers for SVG/canvas diagrams
import { s, h, svgRoot, tip } from '../ui.js';

export const COL = {
  ecto: '#4f9dff', meso: '#ff5a6e', endo: '#ffcc33', tropho: '#c084fc', syn: '#e45bd0', amnion: '#64d2ff', yolk: '#ffd60a',
  crest: '#34d399', noto: '#ff7a45', oxy: '#ff453a', deoxy: '#3d8bff', green: '#30d158', orange: '#ff9f0a', pink: '#ff6fae',
  violet: '#a78bfa', teal: '#2dd4bf', fg: '#f5f5f7', fg2: '#b4b4bb', fg3: '#7c7c84', line: 'rgba(255,255,255,.14)'
};

export function svgIn(el, w, hgt) { const svg = svgRoot(w, hgt); el.append(svg); addDefs(svg); return svg; }

function addDefs(svg) {
  const d = s('defs');
  d.innerHTML = `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
    <radialGradient id="gOocyte" cx="40%" cy="35%"><stop offset="0" stop-color="#ffe2d6"/><stop offset=".7" stop-color="#ffab90"/><stop offset="1" stop-color="#e8806a"/></radialGradient>
    <radialGradient id="gCell" cx="40%" cy="35%"><stop offset="0" stop-color="#ffe0ea"/><stop offset="1" stop-color="#ff8fab"/></radialGradient>
    <linearGradient id="gTissue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2a4a"/><stop offset="1" stop-color="#4a1630"/></linearGradient>
    <linearGradient id="gUterus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9fb6"/><stop offset="1" stop-color="#d9607e"/></linearGradient>`;
  svg.prepend(d);
}

export function text(parent, x, y, str, { size = 26, weight = 650, fill = COL.fg, anchor = 'start', cls = '', opacity, ls } = {}) {
  const t = s('text', { x, y, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor, class: cls, opacity, 'letter-spacing': ls });
  t.textContent = str; parent.append(t); return t;
}
// Pill label with coloured dot (SVG); returns group
export function pill(parent, x, y, str, color = COL.fg2, { size = 24, anchor = 'start', tt, tb } = {}) {
  const g = s('g', { class: 'pill' });
  const w = str.length * size * .56 + 50, hgt = size + 20;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  g.append(s('rect', { x: x0, y: y - hgt / 2, width: w, height: hgt, rx: hgt / 2, fill: 'rgba(18,18,22,.78)', stroke: 'rgba(255,255,255,.22)' }));
  g.append(s('circle', { cx: x0 + 20, cy: y, r: 6, fill: color, filter: 'url(#glow)' }));
  const t = text(g, x0 + 34, y + size * .36, str, { size, weight: 650 });
  parent.append(g);
  if (tt || tb) tip(g, tt || str, tb || '', color);
  return g;
}
// Pulsing hotspot
export function hotspot(parent, x, y, color, tt, tb, r = 14) {
  const g = s('g', { class: 'hot', style: 'cursor:help' });
  const ring = s('circle', { cx: x, cy: y, r: r * 1.9, fill: 'none', stroke: color, 'stroke-width': 3, opacity: .6 });
  ring.innerHTML = `<animate attributeName="r" values="${r};${r * 2.6};${r}" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0;.8" dur="2.4s" repeatCount="indefinite"/>`;
  g.append(ring, s('circle', { cx: x, cy: y, r, fill: color, filter: 'url(#glow)' }));
  parent.append(g);
  tip(g, tt, tb, color);
  return g;
}
// Stroke draw-in animation
export function drawIn(path, dur = 1200, delay = 0) {
  const L = path.getTotalLength ? path.getTotalLength() : 1000;
  path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
  path.style.transition = 'none';
  requestAnimationFrame(() => requestAnimationFrame(() => { path.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.22,.8,.2,1) ${delay}ms`; path.style.strokeDashoffset = 0; }));
}
export function fadeIn(el, dur = 600, delay = 0) {
  el.style.opacity = 0; el.style.transition = 'none';
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = `opacity ${dur}ms ease ${delay}ms`; el.style.opacity = 1; }));
}
export function goToSlideByTitle(title) {
  const slides = [...document.querySelectorAll('#stage .slide')];
  const i = slides.findIndex(sl => sl.dataset.title === title);
  if (i >= 0 && window.__deck) window.__deck.go(i, { dir: 1 });
}
export { s, h, tip };
