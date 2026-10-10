// Decidua basalis / capsularis / parietalis, then fusion as the conceptus grows.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { Smooth, smooth, lerp } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    // uterus outline (coronal) and cavity
    const U = 'M250,170 C250,60 750,60 750,170 C770,360 650,560 575,660 L560,800 L440,800 L425,660 C350,560 230,360 250,170 Z';
    svg.append(s('path', { d: U, fill: '#8a3a52', stroke: '#c46a85', 'stroke-width': 4 }));
    text(svg, 880, 420, 'Myometrium', { size: 24, fill: COL.fg3, anchor: 'middle' });
    // decidua parietalis = inner lining band
    const cav = 'M330,190 C330,120 670,120 670,190 C680,330 600,500 520,610 L480,610 C400,500 320,330 330,190 Z';
    const par = s('path', { d: cav, fill: '#2a0f1f', stroke: '#c084fc', 'stroke-width': 34, 'stroke-linejoin': 'round', class: 'hot' });
    tip(par, 'Decidua parietalis', 'Lines the <b>rest</b> of the uterine cavity.', '#c084fc');
    svg.append(par);
    // conceptus attached to the upper right wall
    const g = s('g'); svg.append(g);
    const bas = s('path', { fill: '#ff5a6e', class: 'hot' }); tip(bas, 'Decidua basalis', 'Between the conceptus and the <b>myometrium</b> → forms the <b>maternal part of the placenta</b>.', '#ff5a6e');
    const capsC = s('circle', { fill: 'none', stroke: '#ff9f0a', 'stroke-width': 22, class: 'hot' }); tip(capsC, 'Decidua capsularis', 'Covers the conceptus on the side facing the uterine cavity.', '#ff9f0a');
    const sac = s('circle', { fill: '#1d2550', stroke: '#c084fc', 'stroke-width': 8 });
    const villi = s('path', { fill: 'none', stroke: '#ff8fab', 'stroke-width': 9, 'stroke-linecap': 'round' });
    const emb = s('ellipse', { rx: 30, ry: 18, fill: '#ffd166' });
    g.append(bas, capsC, sac, villi, emb);
    const lab = (t, c) => { const gg = s('g'); gg.append(s('circle', { r: 8, fill: c, filter: 'url(#glow)' })); const tx = text(gg, 18, 9, t, { size: 26 }); svg.append(gg); return gg; };
    const lB = lab('Basalis', '#ff5a6e'), lC = lab('Capsularis', '#ff9f0a'), lP = lab('Parietalis', '#c084fc');
    lP.setAttribute('transform', 'translate(110,460)');
    const fuseT = text(svg, 500, 860, '', { size: 28, weight: 700, anchor: 'middle', fill: COL.fg2 });
    const P = new Smooth(0, 1.6);
    let raf;
    const tick = () => {
      const p = P.step(1 / 60);
      const gr = smooth(0, 1, p);
      const r = lerp(95, 205, gr), wx = 655, wy = 230;           // attachment point on the right wall
      const cx = lerp(560, 470, gr), cy = lerp(250, 330, gr);
      sac.setAttribute('cx', cx); sac.setAttribute('cy', cy); sac.setAttribute('r', r);
      capsC.setAttribute('cx', cx); capsC.setAttribute('cy', cy); capsC.setAttribute('r', r + 15);
      emb.setAttribute('cx', cx + r * .25); emb.setAttribute('cy', cy - r * .05);
      // basalis crescent between sac and the wall
      const a0 = -1.1, a1 = .5; let d = '';
      for (let i = 0; i <= 30; i++) { const a = a0 + (a1 - a0) * i / 30; d += `${i ? 'L' : 'M'}${cx + Math.cos(a) * (r + 16)},${cy + Math.sin(a) * (r + 16)}`; }
      for (let i = 30; i >= 0; i--) { const a = a0 + (a1 - a0) * i / 30; d += `L${cx + Math.cos(a) * (r + 16 + 46)},${cy + Math.sin(a) * (r + 16 + 46)}`; }
      bas.setAttribute('d', d + 'Z');
      // chorion frondosum villi on the basalis side
      let vd = ''; for (let i = 0; i < 9; i++) { const a = a0 + .1 + (a1 - a0 - .2) * i / 8, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; vd += `M${x},${y} l${Math.cos(a) * 30 * gr},${Math.sin(a) * 30 * gr}`; }
      villi.setAttribute('d', vd); villi.setAttribute('opacity', gr);
      lB.setAttribute('transform', `translate(${cx + Math.cos(-.3) * (r + 80)},${cy + Math.sin(-.3) * (r + 80)})`);
      lC.setAttribute('transform', `translate(${Math.min(cx - r - 230, 180)},${cy + r * .7 + 40})`);
      par.setAttribute('stroke-width', 34 - 10 * gr);
      fuseT.textContent = gr > .6 ? 'Capsularis fuses with parietalis → both degenerate · basalis → maternal placenta' : '';
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 1, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
