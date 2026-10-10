// Length of pregnancy: LNMP vs fertilization age, with preterm / term / post-term zones.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { svgPt, clamp, Smooth } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1680, 640);
    const X0 = 90, X1 = 1600, Y = 300, Wmax = 44;
    const x = w => X0 + w / Wmax * (X1 - X0);
    const Z = [[0, 34, 'Preterm', '#ff9f0a', 'Preterm = less than 37 weeks; the band 34 to < 37 weeks is called late preterm'], [34, 37, 'Late preterm', '#ffcc33', '34 to < 37 weeks'], [37, 42, 'Full term', '#34d399', '37–42 weeks'], [42, 44, 'Post-term', '#ff453a', 'after 42 weeks']];
    Z.forEach(([a, b, t, c, sub]) => {
      const g = s('g', { class: 'hot' });
      g.append(s('rect', { x: x(a), y: Y - 40, width: x(b) - x(a) - 4, height: 80, rx: 18, fill: c, opacity: .3 }));
      text(g, (x(a) + x(b)) / 2, Y + 10, t, { size: b - a > 3 ? 28 : 22, weight: 750, anchor: 'middle' });
      tip(g, t, sub + ' · counted from the LNMP', c); svg.append(g);
    });
    // scales
    for (let w = 0; w <= 44; w += 4) { svg.append(s('line', { x1: x(w), x2: x(w), y1: Y + 46, y2: Y + 60, stroke: COL.fg3, 'stroke-width': 2 })); text(svg, x(w), Y + 92, String(w), { size: 22, anchor: 'middle', fill: COL.fg2 }); }
    text(svg, X0, Y + 130, 'Weeks after the last normal menstrual period (LNMP)', { size: 24, fill: COL.fg2 });
    // fertilization scale (shifted by 2 weeks)
    const FY = Y - 150;
    svg.append(s('line', { x1: x(2), x2: x(44), y1: FY, y2: FY, stroke: 'rgba(255,255,255,.25)', 'stroke-width': 3 }));
    for (let w = 0; w <= 42; w += 4) text(svg, x(w + 2), FY - 18, String(w), { size: 20, anchor: 'middle', fill: COL.fg3 });
    text(svg, X0, FY - 60, 'Weeks after fertilization', { size: 24, fill: COL.fg2 });
    svg.append(s('circle', { cx: x(2), cy: FY, r: 9, fill: '#ff6fae' }));
    text(svg, x(2) + 18, FY + 34, 'Fertilization ≈ 2 wk after LNMP', { size: 21, fill: '#ff6fae' });
    // birth marker
    const bm = s('g', { class: 'hot' });
    bm.append(s('line', { x1: x(40), x2: x(40), y1: FY - 8, y2: Y + 50, stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '6 6' }), s('circle', { cx: x(40), cy: FY, r: 11, fill: '#fff' }));
    text(bm, x(40) - 14, FY - 50, '266 days · 38 wk', { size: 24, weight: 750, anchor: 'end' });
    text(bm, x(40) + 14, Y + 170, '280 days · 40 wk', { size: 30, weight: 800 });
    text(bm, x(40) + 14, Y + 204, 'from LNMP', { size: 22, fill: COL.fg2 });
    tip(bm, 'Time of birth', '<b>280 days (40 weeks)</b> after the onset of the LNMP — more accurately <b>266 days (38 weeks)</b> after fertilization.', '#ffffff');
    svg.append(bm);
    // pointer
    const ptr = s('g'); ptr.append(s('line', { y1: Y - 70, y2: Y + 46, stroke: '#fff', 'stroke-width': 3 }), s('circle', { cy: Y - 78, r: 16, fill: '#fff' }));
    const pl = text(ptr, 0, Y - 108, '', { size: 28, weight: 800, anchor: 'middle' });
    svg.append(ptr);
    const hit = s('rect', { x: X0, y: Y - 120, width: X1 - X0, height: 180, fill: 'transparent', style: 'cursor:ew-resize' }); svg.append(hit);
    const P = new Smooth(39, 6);
    hit.addEventListener('pointermove', e => { const p = svgPt(svg, e); P.set(clamp((p.x - X0) / (X1 - X0) * Wmax, 20, 44)); });
    hit.addEventListener('click', e => e.stopPropagation());
    let raf;
    const tick = () => {
      const w = P.step(1 / 60);
      ptr.setAttribute('transform', `translate(${x(w)},0)`);
      const z = Z.find(([a, b]) => w >= a && w < b) || Z[3];
      pl.textContent = `${w.toFixed(0)} wk · ${z[2]}`; pl.setAttribute('fill', z[3]);
      raf = requestAnimationFrame(tick);
    };
    return { enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
