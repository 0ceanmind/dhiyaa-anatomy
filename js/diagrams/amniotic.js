// Amniotic fluid volume (lecture values) with polyhydramnios / oligohydramnios thresholds.
import { svgIn, text, COL, s, tip } from './_kit.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const X0 = 120, X1 = 1000, Y0 = 760, Y1 = 90;
    const x = w => X0 + (w - 8) / (40 - 8) * (X1 - X0), y = v => Y0 - v / 2200 * (Y0 - Y1);
    [0, 500, 1000, 1500, 2000].forEach(v => { svg.append(s('line', { x1: X0, x2: X1, y1: y(v), y2: y(v), class: 'grid' })); text(svg, X0 - 16, y(v) + 8, v.toLocaleString(), { size: 22, anchor: 'end', fill: COL.fg3 }); });
    [10, 20, 30, 37].forEach(w => text(svg, x(w), Y0 + 38, String(w), { size: 22, anchor: 'middle', fill: COL.fg3 }));
    text(svg, (X0 + X1) / 2, Y0 + 76, 'Weeks', { size: 24, anchor: 'middle', fill: COL.fg2 });
    text(svg, X0 - 80, Y1 - 40, 'Volume (mL)', { size: 24, fill: COL.fg2 });
    // zones
    const poly = s('g', { class: 'hot' }); poly.append(s('rect', { x: X0, y: y(2000), width: X1 - X0, height: y(1500) - y(2000), fill: '#ff453a', opacity: .16 }));
    text(poly, X0 + 20, y(1750) + 10, 'Polyhydramnios · 1,500–2,000 mL', { size: 26, weight: 750, fill: '#ff8a7a' });
    tip(poly, 'Polyhydramnios (excess fluid)', 'Causes: <b>idiopathic 35%</b>, <b>maternal diabetes 25%</b>, CNS malformations (e.g. <b>anencephaly</b>) and GI defects (e.g. <b>oesophageal atresia</b>) that stop the fetus swallowing.', '#ff453a');
    const oligo = s('g', { class: 'hot' }); oligo.append(s('rect', { x: X0, y: y(400), width: X1 - X0, height: y(0) - y(400), fill: '#ff9f0a', opacity: .12 }), s('line', { x1: X0, x2: X1, y1: y(400), y2: y(400), stroke: '#ff9f0a', 'stroke-width': 3, 'stroke-dasharray': '8 8' }));
    text(oligo, X1 - 20, y(400) - 16, 'Oligohydramnios · < 400 mL', { size: 26, weight: 750, fill: '#ffb85c', anchor: 'end' });
    tip(oligo, 'Oligohydramnios (too little fluid)', 'Rare; may result from <b>renal agenesis</b>. The constricted fetus cannot “breathe” fluid into its lungs → <b>lung hypoplasia</b>.', '#ff9f0a');
    // data (lecture): 30 mL @10 wk, 450 mL @20 wk, 800–1,000 mL @37 wk
    const d = `M${x(10)},${y(30)} L${x(20)},${y(450)} L${x(37)},${y(900)}`;
    const line = s('path', { d, fill: 'none', stroke: '#64d2ff', 'stroke-width': 6, 'stroke-linejoin': 'round' }); svg.append(line);
    const pts = [[10, 30, '30 mL'], [20, 450, '450 mL'], [37, 900, '800–1,000 mL']];
    pts.forEach(([w, v, l]) => { const g = s('g', { class: 'hot' }); if (w === 37) g.append(s('line', { x1: x(w), x2: x(w), y1: y(800), y2: y(1000), stroke: '#64d2ff', 'stroke-width': 14, 'stroke-linecap': 'round' })); g.append(s('circle', { cx: x(w), cy: y(v), r: 11, fill: '#fff' })); text(g, x(w) + (w === 10 ? 26 : -20), y(v) + (w === 10 ? 26 : -22), l, { size: 28, weight: 800, anchor: w === 10 ? 'start' : 'end' }); tip(g, `${w} weeks`, `<b>${l}</b> of amniotic fluid (lecture).`, '#64d2ff'); svg.append(g); });
    text(svg, X0 + 20, y(1350), 'Produced by amniotic cells + maternal blood', { size: 22, fill: COL.fg2 });
    text(svg, X0 + 20, y(1250), 'PROM — rupture before contractions: 10% of pregnancies', { size: 22, fill: COL.fg2 });
    return {
      enter() { const L = line.getTotalLength(); line.style.transition = 'none'; line.style.strokeDasharray = L; line.style.strokeDashoffset = L; requestAnimationFrame(() => requestAnimationFrame(() => { line.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.22,.8,.2,1)'; line.style.strokeDashoffset = 0; })); }
    };
  }
};
