// Notochord formation in transverse section: process → canal → fuses/opens → plate → definitive notochord.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { Smooth, smooth, clamp } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const X0 = 60, X1 = 1000, MID = 530;
    // yolk sac below, amniotic cavity above
    svg.append(s('rect', { x: X0, y: 640, width: X1 - X0, height: 200, rx: 30, fill: '#3a2f0a', opacity: .55 }));
    text(svg, MID, 790, 'Yolk sac', { size: 28, anchor: 'middle', fill: '#ffd60a', opacity: .8 });
    text(svg, MID, 140, 'Amniotic cavity', { size: 28, anchor: 'middle', fill: '#64d2ff', opacity: .8 });
    // ectoderm
    svg.append(s('rect', { x: X0, y: 200, width: X1 - X0, height: 70, rx: 14, fill: '#3a7be6' }));
    text(svg, X0 + 20, 245, 'Ectoderm', { size: 26, fill: '#fff' });
    // mesoderm (both sides)
    const mesoL = s('rect', { x: X0, y: 290, width: 330, height: 300, rx: 24, fill: '#e23a52', opacity: .8 });
    const mesoR = s('rect', { x: X1 - 330, y: 290, width: 330, height: 300, rx: 24, fill: '#e23a52', opacity: .8 });
    svg.append(mesoL, mesoR);
    text(svg, X0 + 20, 450, 'Mesoderm', { size: 26, fill: '#fff' });
    // endoderm with a gap that opens & closes
    const endoL = s('rect', { x: X0, y: 600, height: 40, rx: 12, fill: '#f5b400' });
    const endoR = s('rect', { y: 600, height: 40, rx: 12, fill: '#f5b400' });
    svg.append(endoL, endoR);
    text(svg, X1 - 20, 628, 'Endoderm', { size: 26, fill: '#3a2a00', anchor: 'end' });
    // notochord shapes (crossfaded)
    const N = s('g'); svg.append(N);
    const c0 = s('circle', { cx: MID, cy: 430, r: 66, fill: '#ff7a45' });                                  // process (solid)
    const c1 = s('g'); c1.append(s('circle', { cx: MID, cy: 430, r: 70, fill: '#ff7a45' }), s('circle', { cx: MID, cy: 430, r: 30, fill: '#1a0d06' })); // canal
    const arch = 'M460,640 L460,530 A70,70 0 0 1 600,530 L600,640 L570,640 L570,530 A40,40 0 0 0 490,530 L490,640 Z';
    const c2 = s('g'); c2.append(s('path', { d: arch, fill: '#ff7a45' }));                                    // fused + open floor
    const flow = s('g'); for (let i = 0; i < 3; i++) flow.append(s('path', { d: `M${505 + i * 25},700 L${505 + i * 25},560`, stroke: '#ffd60a', 'stroke-width': 4, 'stroke-dasharray': '6 10', 'stroke-linecap': 'round' }));
    c2.append(flow);
    const c3 = s('rect', { x: 440, y: 600, width: 180, height: 40, rx: 10, fill: '#ff7a45' });              // plate in endoderm
    const c4 = s('path', { d: 'M440,600 C460,520 600,520 620,600 Z', fill: '#ff7a45' });                  // folding plate
    const c5 = s('circle', { cx: MID, cy: 470, r: 58, fill: '#ff7a45', filter: 'url(#glow)' });           // definitive
    const shapes = [c0, c1, c2, c3, c5]; shapes.concat([c4]).forEach(x => { N.append(x); x.style.transition = 'opacity .6s'; });
    const names = ['Notochordal process', 'Notochordal canal', 'Fuses with endoderm · floor opens', 'Notochordal plate', 'Definitive notochord'];
    const subs = ['Solid cord of prenotochordal cells', 'Lumen from the primitive pit', 'Canal communicates with the yolk sac', 'Flat plate intercalated in the endoderm', 'Folds into a rod; endoderm reseals beneath'];
    const T = text(svg, MID, 60, '', { size: 38, weight: 800, anchor: 'middle', fill: '#ff9a6e' });
    const ST = text(svg, MID, 100, '', { size: 26, weight: 550, anchor: 'middle', fill: COL.fg2 });
    const hot = s('rect', { x: 440, y: 340, width: 180, height: 320, fill: 'transparent', class: 'hot' }); svg.append(hot);
    tip(hot, 'Notochord', 'Midline rod that defines the axis, gives rigidity, marks the vertebral column and <b>induces the neural plate</b>.', '#ff7a45');
    const P = new Smooth(0, 3);
    let cur = -1, raf;
    const tick = () => {
      const p = P.step(1 / 60), k = Math.round(clamp(p, 0, 4));
      if (k !== cur) {
        cur = k;
        shapes.forEach((x, i) => x.style.opacity = i === k ? 1 : 0);
        c4.style.opacity = 0;
        T.textContent = names[k]; ST.textContent = subs[k];
      }
      const gap = k === 2 ? 140 : k === 3 ? 180 : 0;      // endoderm gap where the notochord sits
      endoL.setAttribute('width', MID - gap / 2 - X0); endoR.setAttribute('x', MID + gap / 2); endoR.setAttribute('width', X1 - MID - gap / 2);
      flow.style.opacity = k === 2 ? .5 + .5 * Math.sin(performance.now() / 300) : 0;
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 4, enter() { cur = -1; raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
