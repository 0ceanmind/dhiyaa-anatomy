// Monozygotic twinning: day of splitting → membranes (DCDA / MCDA / MCMA / conjoined).
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { slider, Smooth, smooth, clamp, lerp } from '../ui.js';

const TYPES = [
  { d: [1, 3], k: 'DCDA', n: 'Dichorionic · Diamniotic', what: 'Blastomeres separate (before the chorion forms)', c: '#ff9f0a', pl: 'Two placentas (may fuse)' },
  { d: [4, 8], k: 'MCDA', n: 'Monochorionic · Diamniotic', what: 'Inner cell mass splits (after chorion, before amnion)', c: '#ffcc33', pl: 'One shared placenta' },
  { d: [9, 13], k: 'MCMA', n: 'Monochorionic · Monoamniotic', what: 'Embryonic disc splits (after the amnion forms)', c: '#ff5a6e', pl: 'One placenta · one amniotic sac' },
  { d: [14, 15], k: 'Conjoined', n: 'Incomplete separation', what: 'Disc separates incompletely (after day 13)', c: '#c084fc', pl: 'Shared structures' }
];

export default {
  mount(el) {
    const svg = svgIn(el, 1680, 650);
    // ---- left: what splits ----
    const L = s('g', { transform: 'translate(200,300)' }); svg.append(L);
    text(svg, 200, 40, 'What splits', { size: 26, weight: 700, anchor: 'middle', fill: COL.fg2 });
    const stA = s('g'); // two-cell / morula
    stA.append(s('circle', { r: 120, fill: 'none', stroke: '#9cc8ff', 'stroke-width': 6, opacity: .5 }));
    const bA = s('circle', { cx: -50, r: 56, fill: 'url(#gCell)' }), bB = s('circle', { cx: 50, r: 56, fill: 'url(#gCell)' }); stA.append(bA, bB);
    const stB = s('g'); // blastocyst with ICM split
    stB.append(s('circle', { r: 130, fill: '#1d2550', stroke: '#ff9db3', 'stroke-width': 18 }));
    const icm1 = s('ellipse', { cx: -36, cy: -82, rx: 34, ry: 22, fill: '#ffd166' }), icm2 = s('ellipse', { cx: 36, cy: -82, rx: 34, ry: 22, fill: '#ffd166' }); stB.append(icm1, icm2);
    const stC = s('g'); // bilaminar disc within amnion
    stC.append(s('path', { d: 'M-130,10 C-130,-130 130,-130 130,10 Z', fill: 'rgba(100,210,255,.15)', stroke: '#64d2ff', 'stroke-width': 6 }));
    const dc1 = s('rect', { x: -120, y: 10, width: 110, height: 26, rx: 8, fill: '#3a7be6' }), dc2 = s('rect', { x: 10, y: 10, width: 110, height: 26, rx: 8, fill: '#3a7be6' }); stC.append(dc1, dc2);
    stC.append(s('path', { d: 'M-130,40 C-130,170 130,170 130,40 Z', fill: 'rgba(255,214,10,.15)', stroke: '#ffd60a', 'stroke-width': 5 }));
    const stD = s('g'); stD.append(s('rect', { x: -120, y: 10, width: 240, height: 26, rx: 8, fill: '#3a7be6' }), s('circle', { cx: 0, cy: 23, r: 26, fill: '#c084fc', opacity: .7, filter: 'url(#glow)' }));
    L.append(stA, stB, stC, stD);
    const what = text(svg, 200, 520, '', { size: 24, weight: 650, anchor: 'middle', fill: COL.fg2 });
    svg.append(s('path', { d: 'M420,300 L520,300', stroke: 'rgba(255,255,255,.4)', 'stroke-width': 4, 'marker-end': '' }), s('path', { d: 'M505,288 L522,300 L505,312', stroke: 'rgba(255,255,255,.4)', 'stroke-width': 4, fill: 'none' }));
    // ---- middle: uterus with membranes ----
    const U = s('g', { transform: 'translate(820,320)' }); svg.append(U);
    U.append(s('path', { d: 'M-260,-200 C-260,-300 260,-300 260,-200 C280,0 160,200 40,250 L-40,250 C-160,200 -280,0 -260,-200 Z', fill: '#5a2036', stroke: '#c46a85', 'stroke-width': 5 }));
    const pl1 = s('path', { fill: '#c0283e' }), pl2 = s('path', { fill: '#c0283e' }); U.append(pl1, pl2);
    const chor1 = s('ellipse', { fill: 'none', stroke: '#c084fc', 'stroke-width': 12 }), chor2 = s('ellipse', { fill: 'none', stroke: '#c084fc', 'stroke-width': 12 });
    const amn1 = s('ellipse', { fill: 'rgba(100,210,255,.12)', stroke: '#64d2ff', 'stroke-width': 6 }), amn2 = s('ellipse', { fill: 'rgba(100,210,255,.12)', stroke: '#64d2ff', 'stroke-width': 6 });
    const f1 = s('ellipse', { rx: 34, ry: 48, fill: '#ffb08a' }), f2 = s('ellipse', { rx: 34, ry: 48, fill: '#ffb08a' });
    const bridge = s('ellipse', { rx: 30, ry: 24, fill: '#ffb08a' });
    U.append(chor1, chor2, amn1, amn2, f1, f2, bridge);
    // legend
    const lg = s('g', { transform: 'translate(40,600)' }); svg.append(lg);
    [['Chorion', '#c084fc'], ['Amnion', '#64d2ff'], ['Placenta', '#c0283e']].forEach(([t, c], i) => { lg.append(s('circle', { cx: i * 170, cy: 0, r: 9, fill: c })); text(lg, i * 170 + 18, 8, t, { size: 22, fill: COL.fg2 }); });
    // ---- right: readout ----
    const big = text(svg, 1180, 200, '', { size: 92, weight: 800 });
    const nm = text(svg, 1180, 250, '', { size: 30, weight: 700 });
    const days = text(svg, 1180, 300, '', { size: 28, weight: 600, fill: COL.fg2 });
    const plT = text(svg, 1180, 346, '', { size: 26, weight: 600, fill: COL.fg2 });
    text(svg, 1180, 440, 'Later split → more shared membranes', { size: 26, weight: 700, fill: '#ffd60a' });
    const D = new Smooth(2, 3);
    let user = false;
    const sl = slider({ min: 1, max: 15, step: 1, value: 2, label: 'Day of split', fmt: v => `Day ${v}${v > 13 ? '+' : ''}`, width: 440, color: '#64d2ff', onInput: v => { user = true; D.set(v); } });
    const ctrl = h('div', { class: 'ctrl', style: { right: '0px', bottom: '40px' } }); ctrl.append(sl); el.append(ctrl);
    let raf;
    const tick = () => {
      const d = D.step(1 / 60), di = Math.round(d);
      const T = TYPES.find(t => di >= t.d[0] && di <= t.d[1]) || TYPES[3];
      const k = TYPES.indexOf(T);
      // stage art
      [stA, stB, stC, stD].forEach((g, i) => g.style.opacity = i === k ? 1 : 0);
      const sp = (Math.sin(performance.now() / 500) + 1) / 2;
      bA.setAttribute('cx', -50 - 14 * sp); bB.setAttribute('cx', 50 + 14 * sp);
      icm1.setAttribute('cx', -36 - 10 * sp); icm2.setAttribute('cx', 36 + 10 * sp);
      dc1.setAttribute('x', -120 - 8 * sp); dc2.setAttribute('x', 10 + 8 * sp);
      what.textContent = T.what;
      // membranes
      const sep = k === 0 ? 1 : 0, oneAmn = k >= 2;
      const x1 = k === 3 ? -40 : -110, x2 = k === 3 ? 40 : 110;
      if (k === 0) { chor1.setAttribute('cx', -120); chor1.setAttribute('cy', 0); chor1.setAttribute('rx', 118); chor1.setAttribute('ry', 150); chor2.setAttribute('cx', 120); chor2.setAttribute('cy', 0); chor2.setAttribute('rx', 118); chor2.setAttribute('ry', 150); chor2.style.opacity = 1; }
      else { chor1.setAttribute('cx', 0); chor1.setAttribute('cy', 0); chor1.setAttribute('rx', 235); chor1.setAttribute('ry', 165); chor2.style.opacity = 0; }
      if (!oneAmn) { [amn1, amn2].forEach((a, i) => { a.setAttribute('cx', i ? 120 : -120); a.setAttribute('cy', 10); a.setAttribute('rx', 92); a.setAttribute('ry', 124); a.style.opacity = 1; }); }
      else { amn1.setAttribute('cx', 0); amn1.setAttribute('cy', 10); amn1.setAttribute('rx', 205); amn1.setAttribute('ry', 135); amn2.style.opacity = 0; }
      f1.setAttribute('cx', x1); f1.setAttribute('cy', 20); f2.setAttribute('cx', x2); f2.setAttribute('cy', 20);
      bridge.setAttribute('cx', 0); bridge.setAttribute('cy', 20); bridge.style.opacity = k === 3 ? 1 : 0;
      // placentas on the upper wall
      const disc = (cx, w) => `M${cx - w},-205 C${cx - w},-250 ${cx + w},-250 ${cx + w},-205 C${cx + w * .5},-185 ${cx - w * .5},-185 ${cx - w},-205 Z`;
      if (k === 0) { pl1.setAttribute('d', disc(-120, 90)); pl2.setAttribute('d', disc(120, 90)); pl2.style.opacity = 1; } else { pl1.setAttribute('d', disc(0, 170)); pl2.style.opacity = 0; }
      big.textContent = T.k; big.setAttribute('fill', T.c); nm.textContent = T.n;
      days.textContent = `Days ${T.d[0]}${T.d[1] > 13 ? '+' : '–' + T.d[1]}`.replace('Days 14+', 'After day 13');
      plT.textContent = T.pl;
      if (!user) sl.set(Math.round(d));
      raf = requestAnimationFrame(tick);
    };
    const stops = [2, 6, 11, 14];
    return { maxStep: 3, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { user = false; D.set(stops[n]); if (init) D.jump(stops[n]); } };
  }
};
