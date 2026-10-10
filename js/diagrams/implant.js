// Implantation: normal site (sagittal uterus) + embedding sequence day 6 → 12.
import { svgIn, text, COL, s, tip, hotspot, pill } from './_kit.js';
import { Smooth, smooth, clamp, lerp, rng, circlePts, smoothPath } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    // ---- left: sagittal uterus (anterior = left) ----
    const U = s('g', { transform: 'translate(40,90) scale(.86)' }); svg.append(U);
    U.append(s('path', { d: 'M130,140 C120,40 360,20 380,130 C395,230 330,360 290,430 L282,560 L222,560 L214,430 C170,360 120,250 130,140 Z', fill: 'url(#gUterus)', stroke: '#f7b6c6', 'stroke-width': 3 }));
    U.append(s('path', { d: 'M190,150 C200,95 320,90 330,150 C335,230 290,330 256,420 L246,420 C215,330 180,230 190,150 Z', fill: '#5a1830' }));
    U.append(s('path', { d: 'M251,420 L251,560', stroke: '#5a1830', 'stroke-width': 9 }));
    text(U, 255, 20, 'Fundus', { size: 26, anchor: 'middle', fill: COL.fg2 });
    text(U, 70, 300, 'Anterior', { size: 24, anchor: 'middle', fill: COL.fg3 });
    text(U, 450, 300, 'Posterior', { size: 24, anchor: 'middle', fill: COL.fg3 });
    text(U, 252, 610, 'Cervix', { size: 24, anchor: 'middle', fill: COL.fg3 });
    hotspot(U, 336, 168, '#ffd60a', 'Usual implantation site', 'Upper part of the <b>posterior</b> wall of the body of the uterus, near the fundus, near the midline (lecture). Langman 15e: anterior or posterior wall of the body.', 16);
    pill(svg, 245, 700, 'Upper posterior wall', '#ffd60a', { anchor: 'middle' });

    // ---- right: embedding sequence ----
    const Rg = s('g', { transform: 'translate(470,0)' }); svg.append(Rg);
    const SURF = 470;
    Rg.append(s('rect', { x: 0, y: SURF, width: 520, height: 400, rx: 24, fill: 'url(#gTissue)' }));
    const R = rng(6);
    for (let i = 0; i < 9; i++) { const x = 30 + R() * 460, y = SURF + 90 + R() * 260; Rg.append(s('ellipse', { cx: x, cy: y, rx: 14 + R() * 10, ry: 22 + R() * 14, fill: 'none', stroke: '#e7c9a6', 'stroke-width': 6, opacity: .5 })); }
    for (let i = 0; i < 12; i++) Rg.append(s('ellipse', { cx: 20 + R() * 480, cy: SURF + 60 + R() * 300, rx: 7 + R() * 7, ry: 5, fill: '#d93a4a', opacity: .75 }));
    const epiL = s('rect', { x: 0, y: SURF - 8, height: 16, rx: 8, fill: '#f1dcc1' }), epiR = s('rect', { y: SURF - 8, height: 16, rx: 8, fill: '#f1dcc1' });
    Rg.append(epiL, epiR);
    const plug = s('rect', { y: SURF - 7, height: 14, rx: 7, fill: '#fff1c9', opacity: 0 }); Rg.append(plug);
    const syn = s('path', { fill: '#c23a9e', opacity: .95 }); Rg.append(syn);
    const lac = s('g'); Rg.append(lac);
    const LC = Array.from({ length: 10 }, () => { const c = s('ellipse', { rx: 10, ry: 6, fill: '#5a0b2a' }); lac.append(c); return { c, a: R() * Math.PI * 2, r: .86 + R() * .1 }; });
    const blast = s('g'); Rg.append(blast);
    const cyto = s('circle', { r: 112, fill: 'none', stroke: '#c7a0f0', 'stroke-width': 16 }); const cav = s('circle', { r: 104, fill: '#1d2550' });
    const icm = s('ellipse', { cx: 0, cy: 70, rx: 62, ry: 34, fill: '#ffd166' });
    const zona = s('circle', { r: 128, fill: 'none', stroke: '#9cc8ff', 'stroke-width': 6, 'stroke-dasharray': '10 12', opacity: .6 });
    blast.append(cav, cyto, icm, zona);
    const lbl = text(Rg, 260, 60, '', { size: 34, weight: 750, anchor: 'middle' });
    const sub = text(Rg, 260, 100, '', { size: 24, weight: 550, anchor: 'middle', fill: COL.fg2 });
    const L1 = s('g'); Rg.append(L1);
    const tl = (x, y, t, c, tt, tb) => { const g = s('g', { class: 'hot' }); g.append(s('circle', { cx: x, cy: y, r: 7, fill: c })); text(g, x + 16, y + 8, t, { size: 22, weight: 650 }); tip(g, tt || t, tb || '', c); L1.append(g); return g; };
    const lSyn = tl(370, 330, 'Syncytiotrophoblast', '#e45bd0', 'Syncytiotrophoblast', 'Finger-like processes at the <b>embryonic pole</b> invade and burrow into the endometrium.');
    const lCyt = tl(370, 290, 'Cytotrophoblast', '#c7a0f0');
    const lIcm = tl(10, 430, 'Embryoblast', '#ffd166', 'Embryonic pole', 'The blastocyst attaches by its <b>embryonic pole</b> (inner cell mass side).');
    const lPlug = tl(300, SURF - 30, 'Fibrin plug', '#fff1c9');
    const days = [6, 7, 9, 12];
    const titles = ['Day 6 · Zona gone — attachment', 'Day 7 · Syncytium invades', 'Day 9 · Deeper · lacunae', 'Day 11–12 · Fully embedded'];
    const subs = ['Trophoblast contacts the epithelium', 'Embryonic pole burrows into stroma', 'Defect sealed by a fibrin plug', 'Surface epithelium restored'];
    const P = new Smooth(0, 2);
    let raf;
    const tick = now => {
      const p = P.step(1 / 60);
      const cy = lerp(SURF - 120, SURF + 150, smooth(0, 3, p)), cx = 260;
      blast.setAttribute('transform', `translate(${cx},${cy})`);
      zona.setAttribute('opacity', .6 * (1 - smooth(0, .3, p + .3)));
      // syncytium: grows from the embryonic pole (bottom) around the blastocyst
      const cover = smooth(.3, 3, p) * Math.PI;    // half-angle covered, measured from the bottom
      const pts = [];
      for (let i = 0; i <= 90; i++) {
        const a = Math.PI / 2 - cover + (i / 90) * cover * 2;     // around the bottom
        const k = 1 + .18 * (1 + Math.sin(a * 7 + now / 900)) * .5 + .14;
        pts.push([cx + Math.cos(a) * 112 * k, cy + Math.sin(a) * 112 * k]);
      }
      for (let i = 90; i >= 0; i--) { const a = Math.PI / 2 - cover + (i / 90) * cover * 2; pts.push([cx + Math.cos(a) * 118, cy + Math.sin(a) * 118]); }
      syn.setAttribute('d', p > .05 ? smoothPath(pts, true, .3) : '');
      LC.forEach(o => { const a = Math.PI / 2 + (o.a - Math.PI) * (cover / Math.PI); const v = smooth(1.5, 2.2, p); o.c.setAttribute('cx', cx + Math.cos(a) * 112 * (1 + .13)); o.c.setAttribute('cy', cy + Math.sin(a) * 112 * (1 + .13)); o.c.setAttribute('opacity', v); o.c.setAttribute('fill', p > 2.6 ? '#d81e3a' : '#5a0b2a'); });
      // epithelium gap above the embryo closes by day 12
      const gap = p < .6 ? 0 : 280 * (1 - smooth(2.2, 3, p)) * smooth(.6, 1.2, p);
      epiL.setAttribute('width', Math.max(0, cx - gap / 2)); epiR.setAttribute('x', cx + gap / 2); epiR.setAttribute('width', Math.max(0, 520 - cx - gap / 2));
      plug.setAttribute('x', cx - gap / 2); plug.setAttribute('width', gap); plug.setAttribute('opacity', smooth(1.5, 2, p) * (gap > 2 ? 1 : 0));
      lPlug.setAttribute('opacity', Math.abs(p - 2) < .5 ? 1 : 0);
      lSyn.setAttribute('opacity', p > .7 ? 1 : 0); lCyt.setAttribute('opacity', p > .7 ? 1 : 0);
      lIcm.setAttribute('transform', `translate(0,${cy - (SURF - 120) - 0})`); lIcm.setAttribute('opacity', p < 1.3 ? 1 : 0);
      const k = Math.round(clamp(p, 0, 3)); lbl.textContent = titles[k]; sub.textContent = subs[k];
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 3, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
