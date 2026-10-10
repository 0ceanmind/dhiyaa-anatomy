// Dizygotic vs monozygotic origin — two looping mini-animations.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { clamp, smooth } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const row = (y, title, sub, col) => { text(svg, 40, y - 150, title, { size: 40, weight: 800, fill: col }); text(svg, 40, y - 112, sub, { size: 24, fill: COL.fg2 }); svg.append(s('line', { x1: 40, x2: 1020, y1: y + 140, y2: y + 140, stroke: 'rgba(255,255,255,.08)', 'stroke-width': 2 })); };
    row(260, 'Dizygotic · fraternal', '2 oocytes + 2 sperm → 2 zygotes', '#ff9f0a');
    row(680, 'Monozygotic · identical', '1 zygote → splits into 2 embryos', '#64d2ff');
    const egg = (r) => { const g = s('g'); g.append(s('circle', { r: r + 9, fill: 'none', stroke: '#9cc8ff', 'stroke-width': 4, opacity: .6 }), s('circle', { r, fill: 'url(#gOocyte)' })); return g; };
    const spermG = () => { const g = s('g'); g.append(s('path', { d: 'M-8,0 C-22,-8 -32,8 -46,0', stroke: '#e6efff', 'stroke-width': 4, fill: 'none' }), s('ellipse', { rx: 11, ry: 7, fill: '#e6efff' })); return g; };
    const sac = (col) => { const g = s('g'); g.append(s('circle', { r: 92, fill: 'none', stroke: '#c084fc', 'stroke-width': 10 }), s('circle', { r: 70, fill: 'rgba(100,210,255,.12)', stroke: '#64d2ff', 'stroke-width': 5 }), s('ellipse', { rx: 26, ry: 36, fill: '#ffb08a' })); return g; };
    // DZ
    const dz = s('g'); svg.append(dz);
    const e1 = egg(40), e2 = egg(40), s1 = spermG(), s2 = spermG(); dz.append(e1, e2, s1, s2);
    const d1 = sac(), d2 = sac(); dz.append(d1, d2);
    const dzTag = text(dz, 760, 400, 'DCDA always · sex may differ', { size: 26, weight: 700, anchor: 'middle', fill: '#ff9f0a' });
    // MZ
    const mz = s('g'); svg.append(mz);
    const z = egg(46), sm = spermG(); mz.append(z, sm);
    const c1 = s('circle', { r: 28, fill: 'url(#gCell)' }), c2 = s('circle', { r: 28, fill: 'url(#gCell)' }); mz.append(c1, c2);
    const m1 = sac(), m2 = sac(); mz.append(m1, m2);
    const mzTag = text(mz, 760, 820, 'Identical · membranes depend on timing', { size: 26, weight: 700, anchor: 'middle', fill: '#64d2ff' });
    const hz = s('g', { class: 'hot' }); hz.append(s('rect', { x: 20, y: 80, width: 1020, height: 360, fill: 'transparent' })); tip(hz, 'Dizygotic twins', 'Two oocytes ovulated and fertilized by two sperm. Genetically like siblings. Each has its own chorion and amnion (<b>DCDA</b>); placentas separate or fused. Influenced by maternal age, parity, family history, assisted reproduction.', '#ff9f0a'); svg.insertBefore(hz, dz);
    const hm = s('g', { class: 'hot' }); hm.append(s('rect', { x: 20, y: 500, width: 1020, height: 360, fill: 'transparent' })); tip(hm, 'Monozygotic twins', 'One fertilized ovum gives rise to two embryos — genetically identical, same sex. <b>Monozygotic ≠ automatically monochorionic.</b>', '#64d2ff'); svg.insertBefore(hm, mz);
    let raf, t0;
    const tick = now => {
      const t = ((now - t0) / 1000) % 6;
      // DZ: sperm reach two eggs (0–1.5), eggs become sacs (2–3.5)
      const a = smooth(0, 1.5, t), b = smooth(2, 3.4, t);
      e1.setAttribute('transform', `translate(${260},${250}) scale(${1 - b})`); e2.setAttribute('transform', `translate(${460},${250}) scale(${1 - b})`);
      s1.setAttribute('transform', `translate(${100 + 110 * a},${200 + 40 * a})`); s2.setAttribute('transform', `translate(${620 - 110 * a},${200 + 40 * a}) rotate(180)`);
      s1.setAttribute('opacity', 1 - b); s2.setAttribute('opacity', 1 - b);
      d1.setAttribute('transform', `translate(${660},${260}) scale(${b})`); d2.setAttribute('transform', `translate(${880},${260}) scale(${b})`);
      dzTag.setAttribute('opacity', b);
      // MZ: sperm → zygote (0–1.2), splits (1.5–2.8), sacs (3–4.4)
      const c = smooth(0, 1.2, t), sp = smooth(1.4, 2.6, t), d = smooth(3, 4.4, t);
      sm.setAttribute('transform', `translate(${120 + 120 * c},${670})`); sm.setAttribute('opacity', 1 - c);
      z.setAttribute('transform', `translate(${300},${680}) scale(${1 - sp})`);
      c1.setAttribute('transform', `translate(${300 - 40 * sp},${680}) scale(${sp * (1 - d)})`); c2.setAttribute('transform', `translate(${300 + 40 * sp},${680}) scale(${sp * (1 - d)})`);
      m1.setAttribute('transform', `translate(${660},${680}) scale(${d})`); m2.setAttribute('transform', `translate(${880},${680}) scale(${d})`);
      mzTag.setAttribute('opacity', d);
      raf = requestAnimationFrame(tick);
    };
    return { enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
