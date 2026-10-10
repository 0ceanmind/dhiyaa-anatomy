// Causes of birth defects: interaction 55% · genetic 30% · environmental 15%.
import { svgIn, text, COL, s, tip } from './_kit.js';

const SEG = [['Gene–environment interaction', 55, '#ff5a6e', 'Interaction of the environment with a person’s <b>genetic susceptibility</b> (multifactorial).'], ['Genetic', 30, '#64d2ff', 'Chromosomal abnormalities, single-gene defects, multifactorial inheritance, genetic heterogeneity.'], ['Environmental', 15, '#ffcc33', 'Teratogens: infections, physical agents, drugs & chemicals, maternal disease, nutritional deficiency.']];

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const cx = 500, cy = 430, R = 300, W = 110;
    const C = 2 * Math.PI * R;
    const arcs = []; let acc = 0;
    SEG.forEach(([n, p, c, tb], i) => {
      const g = s('g', { class: 'hot' });
      const a = s('circle', { cx, cy, r: R, fill: 'none', stroke: c, 'stroke-width': W, 'stroke-dasharray': `0 ${C}`, transform: `rotate(${-90 + acc * 3.6} ${cx} ${cy})`, style: `transition: stroke-dasharray 1.2s cubic-bezier(.22,.8,.2,1) ${i * .25}s, stroke-width .3s` });
      g.append(a);
      const mid = (acc + p / 2) * 3.6 - 90, rad = mid * Math.PI / 180;
      text(g, cx + Math.cos(rad) * R, cy + Math.sin(rad) * R + 16, `${p}%`, { size: 46, weight: 800, anchor: 'middle', fill: '#000' });
      tip(g, n, tb, c);
      g.addEventListener('mouseenter', () => a.setAttribute('stroke-width', W + 26)); g.addEventListener('mouseleave', () => a.setAttribute('stroke-width', W));
      svg.append(g); arcs.push([a, p]); acc += p;
    });
    text(svg, cx, cy - 6, 'Causes', { size: 40, weight: 800, anchor: 'middle' });
    text(svg, cx, cy + 40, 'of birth defects', { size: 26, anchor: 'middle', fill: COL.fg2 });
    return {
      enter() { arcs.forEach(([a]) => a.setAttribute('stroke-dasharray', `0 ${C}`)); requestAnimationFrame(() => requestAnimationFrame(() => arcs.forEach(([a, p]) => a.setAttribute('stroke-dasharray', `${C * p / 100 - 6} ${C}`)))); }
    };
  }
};
