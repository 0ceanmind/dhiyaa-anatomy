// Roadmap / recap: day 0 → birth on a piecewise time scale; chapters are clickable.
import { svgIn, text, COL, s, tip, drawIn, fadeIn, goToSlideByTitle } from './_kit.js';

const W = 1680, H = 620, Y = 300;
const KX = [[0, 90], [7, 360], [14, 630], [21, 900], [56, 1170], [266, 1600]];
const xOf = d => { for (let i = 0; i < KX.length - 1; i++) { const [a, xa] = KX[i], [b, xb] = KX[i + 1]; if (d <= b) return xa + (xb - xa) * (d - a) / (b - a); } return KX.at(-1)[1]; };
const CHAP = [
  { n: 1, name: 'Week 1', sub: 'Fertilization', d0: 0, d1: 7, c: '#ff6fae', go: 'Fertilization' },
  { n: 2, name: 'Week 2', sub: 'Implantation', d0: 7, d1: 14, c: '#c084fc', go: 'Implantation' },
  { n: 3, name: 'Week 3', sub: 'Gastrulation', d0: 14, d1: 21, c: '#4f9dff', go: 'Gastrulation' },
  { n: 4, name: 'Weeks 3–8', sub: 'Embryonic period', d0: 21, d1: 56, c: '#34d399', go: 'Embryonic period' },
  { n: 5, name: 'Month 3 → birth', sub: 'Fetal period', d0: 56, d1: 266, c: '#ff9f0a', go: 'Fetal period: growth' }
];
const MS = [ // [day, label, detail, showLabel]
  [0, 'Fertilization', 'Ampulla · ≈ day 14 of the cycle', 1], [3.5, 'Morula → uterus', '16 cells · ≈ day 3–4', 0], [5.5, 'Implantation begins', 'Day 5–6', 1],
  [8, 'Bilaminar disc', 'Epiblast + hypoblast', 0], [11.5, 'Implanted', 'Day 11–12', 1], [14, 'Prechordal plate', 'Day 14 · head end', 0],
  [17, 'Gastrulation', 'Three germ layers', 1], [25, 'Cranial neuropore closes', 'Day 25', 0], [28, 'Neural tube closed', 'Caudal neuropore · day 28', 1],
  [35, 'Limb buds', 'Week 5', 0], [42, 'Gut herniates', 'Week 6', 1], [56, 'Fingers & toes', 'Week 8', 0], [84, 'Sex on ultrasound', 'Week 12', 1],
  [133, 'Quickening', 'Month 5', 0], [189, '90% survival', '26–28 weeks', 1], [266, 'Birth', '266 days · 38 weeks', 0]
];

export default {
  mount(el, opts = {}) {
    const svg = svgIn(el, W, H);
    const g = s('g'); svg.append(g);
    // base line + ticks
    const base = s('path', { d: `M${xOf(0)},${Y} L${xOf(266)},${Y}`, stroke: 'rgba(255,255,255,.22)', 'stroke-width': 4, 'stroke-linecap': 'round' }); g.append(base);
    [[0, 'Day 0'], [7, 'Wk 1'], [14, 'Wk 2'], [21, 'Wk 3'], [56, 'Wk 8'], [266, 'Wk 38']].forEach(([d, l]) => {
      g.append(s('line', { x1: xOf(d), x2: xOf(d), y1: Y - 12, y2: Y + 12, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 3 }));
      text(g, xOf(d), Y + 46, l, { size: 22, weight: 650, fill: COL.fg3, anchor: 'middle' });
    });
    // chapter capsules (clickable)
    const caps = CHAP.map((c, i) => {
      const x0 = xOf(c.d0) + 6, x1 = xOf(c.d1) - 6, cg = s('g', { style: 'cursor:pointer' });
      const rect = s('rect', { x: x0, y: Y - 150, width: x1 - x0, height: 108, rx: 26, fill: c.c, 'fill-opacity': .14, stroke: c.c, 'stroke-opacity': .55, 'stroke-width': 2 });
      cg.append(rect, s('rect', { x: x0, y: Y - 22, width: x1 - x0, height: 8, rx: 4, fill: c.c, filter: 'url(#glow)' }));
      text(cg, (x0 + x1) / 2, Y - 98, c.name, { size: 32, weight: 750, anchor: 'middle' });
      text(cg, (x0 + x1) / 2, Y - 62, c.sub, { size: 22, weight: 600, fill: COL.fg2, anchor: 'middle' });
      cg.addEventListener('click', e => { e.stopPropagation(); goToSlideByTitle(c.go); });
      cg.addEventListener('mouseenter', () => rect.setAttribute('fill-opacity', .3));
      cg.addEventListener('mouseleave', () => rect.setAttribute('fill-opacity', .14));
      g.append(cg); return cg;
    });
    // milestones
    const dots = MS.map(([d, t, sub], i) => {
      const show = MS[i][3], up = show ? 1 : 0, yl = Y + (i % 4 === 0 ? 120 : i % 4 === 2 ? 190 : 120);
      const x = xOf(d);
      const mg = s('g', { class: 'hot' });
      const col = CHAP.find(c => d <= c.d1)?.c || '#fff';
      if (show) mg.append(s('line', { x1: x, x2: x, y1: Y + 10, y2: yl - 32, stroke: 'rgba(255,255,255,.2)', 'stroke-width': 2 }));
      mg.append(s('circle', { cx: x, cy: Y, r: show ? 10 : 7, fill: col, filter: 'url(#glow)' }));
      mg.append(s('circle', { cx: x, cy: Y, r: 22, fill: 'transparent' }));
      if (show) text(mg, x, yl, t, { size: 24, weight: 650, anchor: 'middle' });
      tip(mg, t, sub, col);
      g.append(mg); return mg;
    });
    // cross-cutting topics
    const tops = [['Placenta & cord', '#ff5a6e', 'The placenta'], ['Twinning', '#64d2ff', 'Dizygotic vs monozygotic'], ['Birth defects', '#ffcc33', 'Birth defects: scale']];
    const tg = s('g'); g.append(tg);
    tops.forEach(([t, c, go], i) => {
      const x = 520 + i * 330, cg = s('g', { style: 'cursor:pointer' });
      cg.append(s('rect', { x, y: 560, width: 300, height: 56, rx: 28, fill: 'rgba(255,255,255,.06)', stroke: c, 'stroke-opacity': .6, 'stroke-width': 2 }));
      cg.append(s('circle', { cx: x + 30, cy: 588, r: 8, fill: c, filter: 'url(#glow)' }));
      text(cg, x + 50, 597, t, { size: 24, weight: 650 });
      cg.addEventListener('click', e => { e.stopPropagation(); goToSlideByTitle(go); });
      tg.append(cg);
    });
    if (opts.recap) tg.style.display = 'none';
    // travelling glow
    const runner = s('circle', { r: 12, cy: Y, fill: '#fff', filter: 'url(#glow2)' }); g.append(runner);
    let raf, t0 = performance.now();
    const tick = now => { const p = ((now - t0) / 9000) % 1; runner.setAttribute('cx', xOf(0) + (xOf(266) - xOf(0)) * p); raf = requestAnimationFrame(tick); };
    return {
      enter() {
        drawIn(base, 1400);
        caps.forEach((c, i) => fadeIn(c, 600, 300 + i * 140));
        dots.forEach((d, i) => fadeIn(d, 500, (opts.recap ? 300 : 900) + i * (opts.recap ? 220 : 60)));
        t0 = performance.now(); raf = requestAnimationFrame(tick);
      },
      leave() { cancelAnimationFrame(raf); }
    };
  }
};
