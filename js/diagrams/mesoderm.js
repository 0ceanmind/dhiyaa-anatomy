// Transverse section: paraxial, intermediate and lateral plate mesoderm; lateral plate splits around the coelom.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { Smooth, smooth, lerp } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const M = 530;
    svg.append(s('rect', { x: 60, y: 120, width: 940, height: 170, rx: 30, fill: '#0f2f55', opacity: .6 }));
    text(svg, M, 180, 'Amniotic cavity', { size: 24, anchor: 'middle', fill: '#64d2ff', opacity: .8 });
    svg.append(s('rect', { x: 60, y: 560, width: 940, height: 210, rx: 30, fill: '#3a2f0a', opacity: .55 }));
    text(svg, M, 720, 'Yolk sac', { size: 24, anchor: 'middle', fill: '#ffd60a', opacity: .8 });
    // ectoderm + neural tube + notochord + endoderm
    svg.append(s('path', { d: 'M80,300 L980,300', stroke: '#3a7be6', 'stroke-width': 26, 'stroke-linecap': 'round' }));
    svg.append(s('circle', { cx: M, cy: 360, r: 52, fill: '#2a6cf0' }), s('circle', { cx: M, cy: 360, r: 16, fill: '#0a1a3a' }));
    svg.append(s('circle', { cx: M, cy: 452, r: 22, fill: '#ff7a45' }));
    svg.append(s('path', { d: 'M80,548 L980,548', stroke: '#f5b400', 'stroke-width': 20, 'stroke-linecap': 'round' }));
    const R = {}; const mk = (key, nodes, color, tt, tb) => { const g = s('g', { class: 'hot' }); nodes.forEach(n => g.append(n)); tip(g, tt, tb, color); svg.append(g); R[key] = g; return g; };
    const both = (f) => [f(1), f(-1)];
    const X = (x, side) => side > 0 ? x : 2 * M - x;
    mk('par', both(sd => s('rect', { x: Math.min(X(400, sd), X(480, sd)), y: 318, width: 80, height: 128, rx: 26, fill: '#ff5a6e' })), '#ff5a6e', 'Paraxial mesoderm', 'Thick plate beside the midline → segments into <b>somites</b> (sclerotome → vertebrae, ribs; dermomyotome → skeletal muscle, dermis).');
    mk('int', both(sd => s('ellipse', { cx: X(352, sd), cy: 400, rx: 26, ry: 40, fill: '#ff9f0a' })), '#ff9f0a', 'Intermediate mesoderm', 'Longitudinal strip between paraxial and lateral plate → <b>urogenital</b> structures: kidneys, gonads, genital ducts.');
    const som = both(sd => s('rect', { x: Math.min(X(110, sd), X(320, sd)), y: 318, width: 210, height: 60, rx: 22, fill: '#ff6fae' }));
    const spl = both(sd => s('rect', { x: Math.min(X(110, sd), X(320, sd)), y: 470, width: 210, height: 60, rx: 22, fill: '#ff6fae' }));
    const fill = both(sd => s('rect', { x: Math.min(X(110, sd), X(320, sd)), y: 360, width: 210, height: 130, fill: '#ff6fae' }));
    const coel = both(sd => s('rect', { x: Math.min(X(120, sd), X(310, sd)), y: 380, width: 190, height: 90, rx: 30, fill: '#1b1030', opacity: 0 }));
    mk('lat', [...fill, ...som, ...spl], '#ff6fae', 'Lateral plate mesoderm', 'Thin lateral mesoderm, split by the <b>intraembryonic coelom</b> into somatic and splanchnic layers.');
    mk('coel', coel, '#c084fc', 'Intraembryonic coelom', 'Becomes the <b>pericardial, pleural and peritoneal</b> cavities.');
    // derivative labels (step 1)
    const D = s('g'); svg.append(D);
    const dl = (x, y, t, sub, c, anchor = 'start') => { const g = s('g'); g.append(s('circle', { cx: anchor === 'end' ? x + 16 : x - 16, cy: y - 9, r: 8, fill: c })); text(g, x, y, t, { size: 26, weight: 750, anchor }); text(g, x, y + 30, sub, { size: 21, fill: COL.fg2, anchor }); D.append(g); return g; };
    dl(130, 70, 'Paraxial → somites', 'Vertebrae · ribs · muscle · dermis', '#ff5a6e');
    dl(980, 70, 'Intermediate → urogenital', 'Kidneys · gonads · genital ducts', '#ff9f0a', 'end');
    dl(130, 820, 'Somatic layer → body wall', 'Thoracic & abdominal walls', '#ff6fae');
    dl(980, 820, 'Splanchnic layer → viscera', 'Heart · gut & airway smooth muscle', '#ff6fae', 'end');
    dl(M + 20, 640, 'Coelom → pericardial · pleural · peritoneal', '', '#c084fc', 'middle');
    // leader lines for labels
    const lines = s('g', { stroke: 'rgba(255,255,255,.25)', 'stroke-width': 2 }); svg.insertBefore(lines, D);
    lines.append(s('path', { d: 'M150,80 L440,320', fill: 'none' }), s('path', { d: 'M900,80 L700,390', fill: 'none' }), s('path', { d: 'M150,800 L210,350', fill: 'none' }), s('path', { d: 'M900,800 L830,500', fill: 'none' }));
    const P = new Smooth(0, 2);
    let raf;
    const tick = () => {
      const p = P.step(1 / 60), sp = smooth(.2, 1, p);
      som.forEach(r => r.setAttribute('y', 318)); spl.forEach(r => r.setAttribute('y', lerp(430, 470, sp)));
      fill.forEach(r => r.setAttribute('opacity', 1 - sp)); coel.forEach(r => r.setAttribute('opacity', sp));
      D.setAttribute('opacity', sp); lines.setAttribute('opacity', sp);
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 1, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
