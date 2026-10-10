// Placental barrier in a villus cross-section: 4 layers early → 2 at 20 weeks → 3 at term.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { Smooth, smooth, clamp, lerp, rng } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const cx = 420, cy = 450, R = rng(5);
    // maternal blood around the villus
    const mb = s('g'); svg.append(mb);
    for (let i = 0; i < 70; i++) { const a = R() * Math.PI * 2, r = 330 + R() * 80; mb.append(s('ellipse', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, rx: 12, ry: 8, fill: '#ff453a', opacity: .5, transform: `rotate(${R() * 180} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})` })); }
    text(svg, cx, 50, 'Maternal blood (intervillous space)', { size: 24, anchor: 'middle', fill: '#ff8a7a' });
    const syn = s('circle', { cx, cy, r: 300, fill: '#c23a9e' });               // d — syncytiotrophoblast
    const cyto = s('g');                                                         // c — cytotrophoblast cells
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; cyto.append(s('circle', { cx: cx + Math.cos(a) * 252, cy: cy + Math.sin(a) * 252, r: 24, fill: '#d8b4fe', stroke: '#8b5cf6', 'stroke-width': 3 })); }
    const ct = s('circle', { cx, cy, r: 228, fill: '#3b2350' });                // b — connective tissue core
    const ctDots = s('g'); for (let i = 0; i < 60; i++) { const a = R() * Math.PI * 2, r = 70 + R() * 140; ctDots.append(s('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 4, fill: '#a78bfa', opacity: .7 })); }
    const fib = s('circle', { fill: 'none', stroke: '#ffe08a', 'stroke-width': 18, 'stroke-dasharray': '6 10', opacity: 0 });  // fibrinoid
    const cap = s('circle', { fill: '#ff8fa0', stroke: '#ffffff', 'stroke-width': 8 });       // a — endothelium + fetal blood
    svg.append(syn, cyto, ct, ctDots, fib, cap);
    // exchange arrows
    const arr = s('g'); svg.append(arr);
    const aO = s('path', { stroke: '#ff453a', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }), aC = s('path', { stroke: '#3d8bff', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' });
    arr.append(aO, aC);
    const tO = text(svg, 0, 0, '← O₂ · nutrients · antibodies', { size: 24, weight: 700, fill: '#ff8a7a' }), tC = text(svg, 0, 0, 'CO₂ · waste →', { size: 24, weight: 700, fill: '#7cb6ff' });
    // legend
    const LG = [['a', 'Endothelium of fetal vessels', '#ffffff'], ['b', 'Connective tissue', '#a78bfa'], ['c', 'Cytotrophoblast', '#d8b4fe'], ['d', 'Syncytiotrophoblast', '#e45bd0'], ['e', 'Fibrinoid (term)', '#ffe08a']];
    const lgs = LG.map(([k, t, c], i) => { const g = s('g', { transform: `translate(780,${260 + i * 72})`, class: 'hot' }); g.append(s('circle', { r: 18, fill: c, opacity: .9 })); text(g, 0, 8, k, { size: 22, weight: 800, anchor: 'middle', fill: '#000' }); text(g, 32, 9, t, { size: 23, weight: 650 }); tip(g, t, i === 4 ? 'At the end of pregnancy fibrinoid material surrounds the fetal vessels (lecture).' : i === 1 ? 'Lecture calls this “primary mesoderm”; Langman: connective tissue of the villus core.' : '', c); svg.append(g); return g; });
    const big = text(svg, 780, 180, '', { size: 44, weight: 800 });
    const sub = text(svg, 780, 218, '', { size: 24, weight: 600, fill: COL.fg2 });
    const P = new Smooth(0, 2);
    let raf;
    const tick = now => {
      const p = P.step(1 / 60);
      const thin = smooth(.2, 1, p), term = smooth(1.2, 2, p);
      cyto.style.opacity = 1 - thin; ct.setAttribute('r', lerp(228, 296, thin)); ct.setAttribute('fill', thin > .5 ? '#2a1838' : '#3b2350'); ctDots.style.opacity = 1 - thin;
      syn.setAttribute('r', lerp(300, 306, thin));
      // capillary moves from centre to the periphery, touching the syncytium
      const cr = lerp(70, 64, thin), cxx = cx + lerp(0, 220, thin), cyy = cy - lerp(0, 40, thin);
      cap.setAttribute('cx', cxx); cap.setAttribute('cy', cyy); cap.setAttribute('r', cr);
      fib.setAttribute('cx', cxx); fib.setAttribute('cy', cyy); fib.setAttribute('r', cr + 20); fib.setAttribute('opacity', term);
      const show = [1, 1 - thin, 1 - thin, 1, term];
      lgs.forEach((g, i) => g.style.opacity = .2 + .8 * show[i]);
      const k = Math.round(clamp(p, 0, 2));
      big.textContent = ['Early pregnancy', 'Mid-pregnancy (20 wk)', 'End of pregnancy'][k];
      sub.textContent = ['4 layers', '2 layers · Langman: from month 4', '3 layers'][k];
      // arrows across the barrier near the capillary
      const t = (now / 1000) % 2 / 2;
      const x0 = cxx + cr + 12, x1 = cx + 345, ey = cyy;
      const mid = x0 + (x1 - x0) * t;
      aO.setAttribute('d', `M${x1},${ey - 34} L${Math.max(x0, x1 - (x1 - x0) * t)},${ey - 34}`);
      aC.setAttribute('d', `M${x0},${ey + 34} L${Math.min(x1, x0 + (x1 - x0) * t)},${ey + 34}`);
      tO.setAttribute('x', cx - 180); tO.setAttribute('y', 840); tC.setAttribute('x', cx + 150); tC.setAttribute('y', 840);
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 2, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
