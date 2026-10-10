// Sperm head close-up: capacitation (coat proteins removed) → acrosome reaction (enzymes released).
import { svgIn, text, COL, s, tip } from './_kit.js';
import { rng, Smooth, smooth, clamp } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const R = rng(4);
    // egg coats on the right: corona cells + zona band
    const coats = s('g'); svg.append(coats);
    const zona = s('path', { d: 'M880,0 C840,220 840,660 880,880 L1000,880 L1000,0 Z', fill: '#9cc8ff', opacity: .25 });
    const zonaEdge = s('path', { d: 'M880,0 C840,220 840,660 880,880', stroke: '#9cc8ff', 'stroke-width': 6, fill: 'none', opacity: .6 });
    coats.append(zona, zonaEdge);
    const corona = Array.from({ length: 26 }, () => { const c = s('ellipse', { cx: 700 + R() * 140, cy: 60 + R() * 760, rx: 22 + R() * 14, ry: 16 + R() * 10, fill: 'url(#gCell)', opacity: .9 }); coats.append(c); return c; });
    const coatLbl = s('g', { class: 'hot' }); text(coatLbl, 760, 40, 'Corona radiata', { size: 22, fill: '#ffb3c7', anchor: 'middle' }); text(coatLbl, 940, 40, 'Zona', { size: 22, fill: '#9cc8ff', anchor: 'middle' });
    tip(coatLbl, 'Egg coats', 'The sperm must cross the <b>corona radiata</b> (follicle cells) and the <b>zona pellucida</b>.', '#9cc8ff'); svg.append(coatLbl);

    // sperm head (pointing right)
    const sp = s('g', { transform: 'translate(420,440)' }); svg.append(sp);
    const tail = s('path', { d: 'M-150,0 C-220,-26 -270,30 -330,0 S-390,-26 -420,6', stroke: '#cfe0ff', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' });
    sp.append(tail);
    sp.append(s('rect', { x: -170, y: -14, width: 70, height: 28, rx: 12, fill: '#b8cdf0' }));                       // midpiece
    sp.append(s('ellipse', { cx: 0, cy: 0, rx: 150, ry: 100, fill: '#dbe7ff', stroke: '#9fb7e6', 'stroke-width': 4 }));  // head membrane
    sp.append(s('ellipse', { cx: -18, cy: 0, rx: 112, ry: 72, fill: '#2b3f73' }));                                     // nucleus
    text(sp, -30, 10, 'Nucleus', { size: 24, fill: '#cfe0ff', anchor: 'middle' });
    const acro = s('path', { d: 'M20,-92 C120,-92 160,-40 160,0 C160,40 120,92 20,92 C70,60 90,30 90,0 C90,-30 70,-60 20,-92 Z', fill: '#34d399', opacity: .9 });
    sp.append(acro);
    const acroLbl = s('g', { class: 'hot' }); text(acroLbl, 130, -120, 'Acrosome', { size: 26, fill: '#34d399', anchor: 'middle' }); tip(acroLbl, 'Acrosome', 'Cap-like vesicle over the head, full of enzymes.', '#34d399'); sp.append(acroLbl);
    // coat proteins (removed during capacitation)
    const prot = Array.from({ length: 34 }, (_, i) => { const a = -Math.PI * .95 + i / 33 * Math.PI * 1.9; const c = s('circle', { cx: Math.cos(a) * 162, cy: Math.sin(a) * 112, r: 9, fill: '#ff9f0a' }); sp.append(c); return { c, a, dr: 40 + R() * 160, da: (R() - .5) * .6 }; });
    // enzymes
    const ENZ = [['Hyaluronidase', '#2dd4bf', 'Disperses the <b>corona radiata</b>.'], ['Trypsin-like enzymes', '#a78bfa', 'Digest the <b>zona pellucida</b>.'], ['Acrosin (zona lysin)', '#ffd60a', 'Softens the <b>zona pellucida</b>.']];
    const enz = Array.from({ length: 90 }, (_, i) => { const k = i % 3; const c = s('circle', { r: 6, fill: ENZ[k][1], opacity: 0 }); svg.append(c); return { c, k, a: (R() - .5) * 1.4, sp: 120 + R() * 380, d: R() * .4 }; });
    const legend = s('g'); svg.append(legend);
    ENZ.forEach(([n, c, tb], i) => { const g = s('g', { class: 'hot' }); g.append(s('circle', { cx: 60, cy: 742 + i * 46, r: 10, fill: c, filter: 'url(#glow)' })); text(g, 84, 751 + i * 46, n, { size: 26 }); tip(g, n, tb, c); legend.append(g); });
    const title = text(svg, 60, 690, '', { size: 30, weight: 750 });
    const ST = new Smooth(0, 1.1);
    let raf, t0 = 0;
    const tick = now => {
      const dt = Math.min(.05, (now - (t0 || now)) / 1000); t0 = now;
      const st = ST.step(dt);
      const cap = smooth(.05, .5, st);
      // capacitation: proteins drift off & fade
      prot.forEach(p => { const r = 1 + cap * p.dr / 160; p.c.setAttribute('cx', Math.cos(p.a + p.da * cap) * 162 * r); p.c.setAttribute('cy', Math.sin(p.a + p.da * cap) * 112 * r); p.c.setAttribute('opacity', 1 - cap); });
      // acrosome reaction
      const ar = smooth(.9, 1.5, st);
      acro.setAttribute('opacity', .9 - ar * .55);
      const time = now / 1000;
      enz.forEach(e => {
        const k = ar > 0 ? ((time * .35 + e.d) % 1) : 0;
        const d = 160 + k * e.sp;
        e.c.setAttribute('cx', 420 + Math.cos(e.a) * d); e.c.setAttribute('cy', 440 + Math.sin(e.a) * d * .8);
        e.c.setAttribute('opacity', ar * (1 - k) * .95);
      });
      corona.forEach((c, i) => c.setAttribute('opacity', .9 - ar * .55 * ((i % 3) / 2)));
      zona.setAttribute('opacity', .25 - ar * .12);
      legend.setAttribute('opacity', .25 + ar * .75);
      title.textContent = st < .95 ? 'Capacitation · glycoprotein coat removed' : 'Acrosome reaction · enzymes released';
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 1, enter() { t0 = 0; raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { if (init) ST.jump(n ? n + .5 : 0); ST.set(n + .5); } };
  }
};
