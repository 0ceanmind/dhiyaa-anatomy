// Feto-fetal transfusion syndrome in a monochorionic placenta: balanced vs unbalanced anastomoses.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented, Smooth, lerp } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    // shared placenta
    const plac = s('path', { d: 'M150,170 C150,80 910,80 910,170 C820,215 240,215 150,170 Z', fill: '#c0283e', class: 'hot' }); svg.append(plac);
    tip(plac, 'One shared placenta', 'Monochorionic twins share a placenta → <b>vascular anastomoses</b> connect their circulations.', '#ff453a');
    text(svg, 530, 66, 'Monochorionic placenta', { size: 26, weight: 700, anchor: 'middle', fill: '#ff8a7a' });
    const ana = s('path', { d: 'M360,160 C450,120 610,120 700,160', stroke: '#ffd60a', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', class: 'hot' }); svg.append(ana);
    tip(ana, 'Placental anastomosis', 'Clinically significant <b>unbalanced</b> connections drive FFTS; chronic unequal red-cell transfer = <b>TAPS</b>.', '#ffd60a');
    const parts = []; for (let i = 0; i < 14; i++) { const c = s('circle', { r: 7, fill: '#ff5a5a' }); svg.append(c); parts.push({ c, d: i / 14 }); }
    const anaPath = ana;
    // cords + sacs + fetuses
    const sacL = s('ellipse', { cx: 300, cy: 520, fill: 'rgba(100,210,255,.12)', stroke: '#64d2ff', 'stroke-width': 6 });
    const sacR = s('ellipse', { cx: 760, cy: 520, fill: 'rgba(100,210,255,.12)', stroke: '#64d2ff', 'stroke-width': 6 });
    svg.append(sacL, sacR);
    const cordL = s('path', { stroke: '#f3c9c0', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }), cordR = s('path', { stroke: '#f3c9c0', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' });
    svg.append(cordL, cordR);
    const fet = (x) => { const g = s('g', { transform: `translate(${x},540)` }); const b = s('ellipse', { rx: 62, ry: 84, cy: 30 }), hd = s('circle', { cy: -70, r: 56 }); g.append(b, hd); svg.append(g); return { g, b, hd }; };
    const F1 = fet(300), F2 = fet(760);
    const lab = (x, y) => { const t1 = text(svg, x, y, '', { size: 32, weight: 800, anchor: 'middle' }), t2 = text(svg, x, y + 36, '', { size: 23, anchor: 'middle', fill: COL.fg2 }), t3 = text(svg, x, y + 66, '', { size: 23, anchor: 'middle', fill: COL.fg2 }); return [t1, t2, t3]; };
    const LL = lab(300, 790), LR = lab(760, 790);
    const hDon = s('rect', { x: 120, y: 300, width: 360, height: 560, fill: 'transparent', class: 'hot' }), hRec = s('rect', { x: 580, y: 300, width: 360, height: 560, fill: 'transparent', class: 'hot' });
    svg.append(hDon, hRec);
    tip(hDon, 'Donor twin', '<b>Oligohydramnios</b> and <b>IUGR</b> may develop (pale, small).', '#ff9f0a');
    tip(hRec, 'Recipient twin', '<b>Polyhydramnios</b>, polycythaemia, heart failure and <b>hydrops</b> in severe disease.', '#ff453a');
    const S = new Smooth(0, 2.5);
    const seg = segmented(['Balanced', 'FFTS'], i => S.set(i), { value: 0 });
    const ctrl = h('div', { class: 'ctrl', style: { right: '0px', top: '0px' } }); ctrl.append(seg); el.append(ctrl);
    let raf, t0;
    const tick = now => {
      const k = S.step(1 / 60), t = (now - t0) / 1000;
      sacL.setAttribute('rx', lerp(170, 110, k)); sacL.setAttribute('ry', lerp(210, 140, k));
      sacR.setAttribute('rx', lerp(170, 215, k)); sacR.setAttribute('ry', lerp(210, 250, k));
      F1.g.setAttribute('transform', `translate(300,540) scale(${lerp(1, .72, k)})`); F2.g.setAttribute('transform', `translate(760,540) scale(${lerp(1, 1.08, k)})`);
      [F1.b, F1.hd].forEach(e => e.setAttribute('fill', k > .5 ? '#f5d3c4' : '#ffb08a'));
      [F2.b, F2.hd].forEach(e => e.setAttribute('fill', k > .5 ? '#ff7a6a' : '#ffb08a'));
      cordL.setAttribute('d', 'M360,175 C340,260 300,320 300,420'); cordR.setAttribute('d', 'M700,175 C720,260 760,320 760,420');
      const L = anaPath.getTotalLength();
      parts.forEach(p => { const f = k > .5 ? (t * .35 + p.d) % 1 : (Math.sin(t * 1.5 + p.d * 6.28) * .5 + .5); const pt = anaPath.getPointAtLength(L * f); p.c.setAttribute('cx', pt.x); p.c.setAttribute('cy', pt.y); p.c.setAttribute('opacity', .9); });
      LL[0].textContent = k > .5 ? 'Donor' : 'Twin A'; LL[1].textContent = k > .5 ? 'Oligohydramnios' : 'Normal fluid'; LL[2].textContent = k > .5 ? 'IUGR' : '';
      LR[0].textContent = k > .5 ? 'Recipient' : 'Twin B'; LR[1].textContent = k > .5 ? 'Polyhydramnios · polycythaemia' : 'Normal fluid'; LR[2].textContent = k > .5 ? 'Heart failure · hydrops' : '';
      LL[0].setAttribute('fill', k > .5 ? '#ff9f0a' : '#f5f5f7'); LR[0].setAttribute('fill', k > .5 ? '#ff453a' : '#f5f5f7');
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 1, enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { seg.set(n); S.set(n); if (init) S.jump(n); } };
  }
};
