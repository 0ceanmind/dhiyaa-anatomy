// Minor anomalies → chance of a major malformation: 1 → 3%, 2 → 10%, ≥3 → 20%.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { Smooth } from '../ui.js';

const RISK = [[1, 3], [2, 10], [3, 20]];

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const X0 = 140, Y0 = 690, BW = 190, GAP = 90, MAXH = 520;
    const bars = RISK.map(([n, r], i) => {
      const x = X0 + i * (BW + GAP), g = s('g', { class: 'hot' });
      g.append(s('rect', { x, y: Y0 - MAXH, width: BW, height: MAXH, rx: 30, fill: 'rgba(255,255,255,.05)' }));
      const b = s('rect', { x, y: Y0, width: BW, height: 0, rx: 30, fill: ['#ffcc33', '#ff9f0a', '#ff5a6e'][i] });
      g.append(b);
      const v = text(g, x + BW / 2, Y0 - 20, `${r}%`, { size: 64, weight: 800, anchor: 'middle' });
      text(g, x + BW / 2, Y0 + 50, n === 3 ? '≥ 3 minor' : `${n} minor`, { size: 30, weight: 700, anchor: 'middle' });
      // ear icons
      for (let k = 0; k < n; k++) g.append(s('path', { d: `M${x + BW / 2 - (n - 1) * 26 + k * 52},${Y0 + 80} c16,0 24,14 20,28 c-3,10 -12,12 -12,22 c0,8 -8,12 -14,8`, stroke: '#ffb08a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }));
      tip(g, `${n === 3 ? 'Three or more' : n === 1 ? 'One' : 'Two'} minor anomal${n === 1 ? 'y' : 'ies'}`, `<b>${r}%</b> chance of having a major malformation.`, ['#ffcc33', '#ff9f0a', '#ff5a6e'][i]);
      svg.append(g); return { b, v, r };
    });
    text(svg, 140, 100, 'Chance of a major malformation', { size: 30, weight: 700, fill: COL.fg2 });
    const P = new Smooth(0, 3);
    let raf;
    const tick = () => { const p = P.step(1 / 60); bars.forEach((o, i) => { const k = Math.min(1, Math.max(0, p - i + 1)); const hh = o.r / 20 * MAXH * k; o.b.setAttribute('y', Y0 - hh); o.b.setAttribute('height', hh); o.v.setAttribute('y', Y0 - hh - 20); o.v.style.opacity = k; }); raf = requestAnimationFrame(tick); };
    return { maxStep: 2, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n + 1); if (init) P.jump(n); } };
  }
};
