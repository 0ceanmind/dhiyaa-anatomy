// Table 8.1 — growth in length (CRL) and weight during the fetal period, with gain per 4-week bin.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented, Smooth } from '../ui.js';

const T81 = [[9, 12, 5, 8, 10, 45], [13, 16, 9, 14, 60, 200], [17, 20, 15, 19, 250, 450], [21, 24, 20, 23, 500, 820], [25, 28, 24, 27, 900, 1300], [29, 32, 28, 30, 1400, 2100], [33, 36, 31, 34, 2200, 2900], [37, 38, 35, 36, 3000, 3400]];

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const X0 = 120, X1 = 1020, Y0 = 560, Y1 = 90;
    const x = w => X0 + (w - 8) / (39 - 8) * (X1 - X0);
    const G = s('g'); svg.append(G);
    const axes = s('g'); svg.insertBefore(axes, G);
    for (let w = 9; w <= 38; w += 4) text(svg, x(w), Y0 + 38, String(w), { size: 22, anchor: 'middle', fill: COL.fg3 });
    text(svg, (X0 + X1) / 2, Y0 + 76, 'Gestational age (weeks)', { size: 24, anchor: 'middle', fill: COL.fg2 });
    const unit = text(svg, X0 - 90, Y1 - 36, '', { size: 24, fill: COL.fg2 });
    const zone = s('rect', { y: Y1 - 10, height: Y0 - Y1 + 10, rx: 16, fill: '#64d2ff', opacity: .1 }); G.append(zone);
    const zoneT = text(G, 0, Y1 + 24, '', { size: 24, weight: 700, anchor: 'middle' });
    const band = s('path', { opacity: .25 }), line = s('path', { fill: 'none', 'stroke-width': 6, 'stroke-linejoin': 'round' }); G.append(band, line);
    const dots = s('g'); G.append(dots);
    // gain bars
    const BY = 790;
    text(svg, X0, 680, 'Gain per 4-week bin (computed from Table 8.1 midpoints)', { size: 22, fill: COL.fg3 });
    const bars = s('g'); svg.append(bars);
    let mode = 0;
    function draw(m) {
      mode = m;
      const lo = m ? 4 : 2, hi = m ? 5 : 3, max = m ? 3600 : 38, col = m ? '#ff9f0a' : '#64d2ff';
      const y = v => Y0 - v / max * (Y0 - Y1);
      axes.innerHTML = '';
      const ticks = m ? [0, 1000, 2000, 3000] : [0, 10, 20, 30];
      ticks.forEach(t => { axes.append(s('line', { x1: X0, x2: X1, y1: y(t), y2: y(t), class: 'grid' })); text(axes, X0 - 16, y(t) + 8, m ? t.toLocaleString() : String(t), { size: 22, anchor: 'end', fill: COL.fg3 }); });
      unit.textContent = m ? 'Weight (g)' : 'Crown–rump length (cm)';
      let b = '', l = '';
      T81.forEach((r, i) => { const xm = x((r[0] + r[1]) / 2); b += `${i ? 'L' : 'M'}${xm},${y(r[lo])}`; l += `${i ? 'L' : 'M'}${xm},${y((r[lo] + r[hi]) / 2)}`; });
      T81.slice().reverse().forEach(r => { b += `L${x((r[0] + r[1]) / 2)},${y(r[hi])}`; });
      band.setAttribute('d', b + 'Z'); band.setAttribute('fill', col);
      line.setAttribute('d', l); line.setAttribute('stroke', col);
      const L = line.getTotalLength(); line.style.transition = 'none'; line.style.strokeDasharray = L; line.style.strokeDashoffset = L;
      requestAnimationFrame(() => requestAnimationFrame(() => { line.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.22,.8,.2,1)'; line.style.strokeDashoffset = 0; }));
      dots.innerHTML = '';
      T81.forEach(r => { const g = s('g', { class: 'hot' }); const xm = x((r[0] + r[1]) / 2); g.append(s('line', { x1: xm, x2: xm, y1: y(r[lo]), y2: y(r[hi]), stroke: col, 'stroke-width': 12, 'stroke-linecap': 'round', opacity: .8 }), s('circle', { cx: xm, cy: y((r[lo] + r[hi]) / 2), r: 9, fill: '#fff' })); tip(g, `Weeks ${r[0]}–${r[1]}`, `CRL <b>${r[2]}–${r[3]} cm</b><br>Weight <b>${r[4].toLocaleString()}–${r[5].toLocaleString()} g</b>`, col); dots.append(g); });
      // highlighted phase
      const zx0 = m ? x(30.5) : x(9), zx1 = m ? x(38.6) : x(22);
      zone.setAttribute('x', zx0); zone.setAttribute('width', zx1 - zx0); zone.setAttribute('fill', col);
      zoneT.setAttribute('x', (zx0 + zx1) / 2); zoneT.textContent = m ? 'Last 2 months · +50% of weight' : 'Months 3–5 · fastest in length'; zoneT.setAttribute('fill', col);
      // gain bars
      bars.innerHTML = '';
      const mids = T81.map(r => (r[lo] + r[hi]) / 2), gains = mids.slice(1).map((v, i) => v - mids[i]), gmax = Math.max(...gains);
      gains.forEach((g, i) => { const xm = (x((T81[i][0] + T81[i][1]) / 2) + x((T81[i + 1][0] + T81[i + 1][1]) / 2)) / 2, hgt = g / gmax * 90; const r = s('rect', { x: xm - 30, y: BY - hgt, width: 60, height: hgt, rx: 10, fill: col, opacity: .75 }); bars.append(r); text(bars, xm, BY + 30, m ? `+${Math.round(g)}` : `+${g.toFixed(1)}`, { size: 20, anchor: 'middle', fill: COL.fg2 }); });
    }
    const seg = segmented(['Length (CRL)', 'Weight'], i => draw(i));
    const ctrl = h('div', { class: 'ctrl', style: { right: '0px', top: '-6px' } }); ctrl.append(seg); el.append(ctrl);
    return { maxStep: 1, enter() { draw(mode); }, step(n) { seg.set(n, true); } };
  }
};
