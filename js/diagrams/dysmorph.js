// Malformation · disruption · deformation · dysplasia drawn as conception → birth timelines.
import { svgIn, text, COL, s, tip } from './_kit.js';

const ROWS = [
  ['Normal development', '#b4b4bb', null, 'Normal'],
  ['Malformation', '#ff5a6e', 'Arises during formation of organs (<b>embryonic period</b>) — primary / intrinsic; complete or partial absence. Genetic and/or environmental. e.g. <b>VSD, ASD, cleft lip/palate, neural tube defect</b>.', 'From the start'],
  ['Disruption', '#ff9f0a', 'Destruction of an <b>already formed</b> structure — secondary / extrinsic, mostly environmental. e.g. transverse limb defects & finger amputation by <b>amniotic bands</b>.', 'Normal, then destroyed'],
  ['Deformation', '#ffcc33', '<b>Mechanical forces</b> deform a normal part — usually musculoskeletal, may be reversible after birth. e.g. congenital dislocation of the hip, talipes (TEV) from compression in oligohydramnios.', 'Normal, then compressed'],
  ['Dysplasia', '#a78bfa', 'Abnormal <b>organization of cells into a tissue</b>; seen wherever that tissue is present. Mostly single-gene, high recurrence. e.g. skeletal dysplasia (mutant <b>FGFR3</b>), ectodermal dysplasia.', 'Abnormal tissue throughout']
];

export default {
  mount(el) {
    const svg = svgIn(el, 1680, 650);
    const X0 = 420, X1 = 1560;
    text(svg, X0, 30, 'Conception', { size: 24, weight: 700, fill: COL.fg2 });
    text(svg, X1, 30, 'Birth', { size: 24, weight: 700, fill: COL.fg2, anchor: 'end' });
    const lines = [];
    ROWS.forEach(([n, c, tb, sub], i) => {
      const y = 90 + i * 118, g = s('g', { class: tb ? 'hot' : '' });
      text(g, 40, y + 10, n, { size: 34, weight: 800, fill: c });
      text(g, 40, y + 44, sub, { size: 22, fill: COL.fg2 });
      const start = s('rect', { x: X0 - 30, y: y - 22, width: 44, height: 44, rx: 8, fill: 'rgba(160,170,255,.35)' });
      let d, dash = '';
      if (i === 0) d = `M${X0},${y} L${X1},${y}`;
      if (i === 1) { d = `M${X0},${y} L${X1},${y}`; dash = '14 12'; g.append(s('path', { d: `M${X0 - 30},${y + 24} L${X0 - 8},${y - 24} L${X0 + 14},${y + 24} Z`, fill: c })); }
      if (i === 2) { d = `M${X0},${y} L${X1},${y}`; }
      if (i === 3) { d = `M${X0},${y} L${(X0 + X1) / 2},${y} Q${(X0 + X1) / 2 + 120},${y + 36} ${X1},${y}`; }
      if (i === 4) { d = `M${X0},${y} L${X1},${y}`; }
      const p = s('path', { d, stroke: c, 'stroke-width': 6, fill: 'none', 'stroke-dasharray': dash });
      if (i !== 1) g.append(start);
      g.append(p);
      if (i === 2) { const xm = X0 + (X1 - X0) * .42; g.append(s('path', { d: `M${xm - 26},${y + 26} L${xm},${y - 26} L${xm + 26},${y + 26} Z`, fill: c })); g.append(s('path', { d: `M${xm + 30},${y} L${X1},${y}`, stroke: c, 'stroke-width': 6, 'stroke-dasharray': '14 12', fill: 'none' })); p.setAttribute('d', `M${X0},${y} L${xm - 30},${y}`); }
      if (i === 3) { const xm = (X0 + X1) / 2 + 40; for (let k = 0; k < 5; k++) g.append(s('line', { x1: xm + k * 18, x2: xm + k * 18, y1: y - 34, y2: y - 8, stroke: c, 'stroke-width': 5 })); g.append(s('path', { d: `M${xm - 20},${y - 8} L${xm + 100},${y - 8} L${xm + 60},${y + 30} Z`, fill: 'rgba(160,170,255,.4)' })); }
      if (i === 4) { for (let x = X0 + 20; x < X1 - 20; x += 38) g.append(s('circle', { cx: x, cy: y, r: 13, fill: 'none', stroke: c, 'stroke-width': 4 })); }
      g.append(s('path', { d: `M${X1 - 4},${y - 20} L${X1 + 30},${y} L${X1 - 4},${y + 20} Z`, fill: c }));
      if (tb) tip(g, n, tb, c);
      g.append(s('rect', { x: 20, y: y - 50, width: X1 + 60, height: 108, fill: 'transparent' }));
      svg.append(g); lines.push(p);
    });
    return { enter() { lines.forEach((p, i) => { const L = p.getTotalLength(); if (p.getAttribute('stroke-dasharray')) return; p.style.transition = 'none'; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; requestAnimationFrame(() => requestAnimationFrame(() => { p.style.transition = `stroke-dashoffset 1.1s cubic-bezier(.22,.8,.2,1) ${i * .15}s`; p.style.strokeDashoffset = 0; })); }); } };
  }
};
