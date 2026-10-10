// Abnormal implantation: placenta previa (slider) and ectopic pregnancy (sites + chart).
import { svgIn, text, COL, s, tip, h, hotspot } from './_kit.js';
import { segmented, slider, Smooth, lerp, clamp } from '../ui.js';
import { drawTract } from './tract.js';

const PREVIA = [
  ['Normal placenta', 'Upper uterine segment', '#34d399', 40],
  ['Placenta previa lateralis', 'Lower segment · not related to the internal os', '#ffcc33', 118],
  ['Placenta previa marginalis', 'Edge touches the internal os, without covering it', '#ff9f0a', 145],
  ['Placenta previa partialis', 'Partially covers the internal os', '#ff6a4d', 163],
  ['Placenta previa centralis', 'Completely covers the internal os', '#ff453a', 180]
];
const ECT = [
  ['Ampullary', 70, 'ampulla'], ['Isthmic', 12, 'isthmus'], ['Fimbrial', 11, 'fimbriae'], ['Ovarian', 3, 'ovaryL'],
  ['Interstitial', 2.5, 'interstitial', '2–3%'], ['Abdominal / intraligamentous', 1, 'abdominal'], ['Cervical', .6, 'cervix', '<1%'], ['Cesarean scar', .6, 'scar', '<1%']
];

export default {
  mount(el) {
    const svg = svgIn(el, 1680, 660);
    const A = s('g'), B = s('g'); svg.append(A, B);

    // ---------- placenta previa ----------
    const U = s('g', { transform: 'translate(130,10)' }); A.append(U);
    // uterus (sagittal-ish, os at bottom) — inner contour param: angle 0 = top, clockwise
    const cx = 330, cy = 300, rx = 230, ry = 260;
    U.append(s('path', { d: `M${cx},${cy - ry - 50} C${cx + rx + 120},${cy - ry - 40} ${cx + rx + 80},${cy + 120} ${cx + 70},${cy + ry + 40} L${cx + 46},${cy + ry + 120} L${cx - 46},${cy + ry + 120} L${cx - 70},${cy + ry + 40} C${cx - rx - 80},${cy + 120} ${cx - rx - 120},${cy - ry - 40} ${cx},${cy - ry - 50} Z`, fill: 'url(#gUterus)', stroke: '#f7b6c6', 'stroke-width': 3 }));
    const inner = a => { const t = a * Math.PI / 180; const k = a > 140 ? 1 - (a - 140) / 40 * .78 : 1; return [cx + Math.sin(t) * rx * k, cy - Math.cos(t) * ry]; };
    let cd = ''; for (let a = -180; a <= 180; a += 4) { const [x, y] = inner(Math.abs(a)); cd += `${a === -180 ? 'M' : 'L'}${a < 0 ? 2 * cx - x : x},${y}`; }
    U.append(s('path', { d: cd + 'Z', fill: '#3a1022' }));
    U.append(s('path', { d: `M${cx},${cy + ry - 4} L${cx},${cy + ry + 120}`, stroke: '#3a1022', 'stroke-width': 16 }));
    U.append(s('rect', { x: cx - 160, y: cy + ry - 10, width: 0, height: 0 }));
    const fetus = s('ellipse', { cx: cx - 20, cy: cy - 10, rx: 120, ry: 150, fill: '#1d2550', stroke: '#64d2ff', 'stroke-width': 4, opacity: .8 });
    U.append(fetus);
    const plac = s('path', { fill: '#ff5a6e', stroke: '#ffb3c0', 'stroke-width': 3 }); U.append(plac);
    const os = s('g', { class: 'hot' }); os.append(s('circle', { cx, cy: cy + ry - 2, r: 9, fill: '#fff' })); text(os, cx + 20, cy + ry + 44, 'Internal os', { size: 22, fill: COL.fg2 });
    tip(os, 'Internal os', 'Opening of the cervical canal into the uterine cavity.', '#ffffff'); U.append(os);
    const ro = s('g', { transform: 'translate(820,170)' }); A.append(ro);
    const rT = text(ro, 0, 0, '', { size: 46, weight: 800 }); const rS = text(ro, 0, 52, '', { size: 28, weight: 550, fill: COL.fg2 });
    const risk = s('g', { transform: 'translate(820,340)', class: 'hot' }); A.append(risk);
    text(risk, 0, 0, '⚠ Antepartum haemorrhage', { size: 30, weight: 700, fill: '#ff9f0a' }); text(risk, 0, 44, 'Diagnosed by ultrasound · delivered by Caesarean section', { size: 24, fill: COL.fg2 });
    tip(risk, 'Placenta previa', 'Implantation in the <b>lower uterine segment</b>. May cause severe antepartum haemorrhage — diagnosed by ultrasonography; delivery by Caesarean section.<br><span style="font-size:22px">(Placenta lecture groups these as 3 types: lateralis, marginalis, centralis.)</span>', '#ff453a');
    const Pv = new Smooth(0, 5);
    const sl = slider({ min: 0, max: 4, step: 1, value: 0, label: 'Position', fmt: v => ['Normal', 'Lateralis', 'Marginalis', 'Partialis', 'Centralis'][v], width: 520, color: '#ff5a6e', onInput: v => Pv.set(v) });
    const ctrlA = h('div', { class: 'ctrl', style: { left: '820px', top: '480px' } }); ctrlA.append(sl);

    // ---------- ectopic ----------
    const TG = s('g', { transform: 'translate(20,-30) scale(.76)' }); B.append(TG);
    const T = drawTract(TG, { dim: true });
    const bub = {};
    ECT.forEach(([n, pct, key]) => { const [x, y] = T.pts[key]; const r = 10 + Math.sqrt(pct) * 4.2; const c = s('circle', { cx: x, cy: y, r, fill: '#ff453a', 'fill-opacity': .55, stroke: '#ff8a7a', 'stroke-width': 3, filter: 'url(#glow)' }); TG.append(c); bub[n] = c; });
    const chart = s('g', { transform: 'translate(860,40)' }); B.append(chart);
    text(chart, 0, 0, 'Tubal  95%', { size: 40, weight: 800, fill: '#ff6a7d' });
    text(chart, 270, 0, '· most common', { size: 26, weight: 600, fill: COL.fg2 });
    const bars = ECT.map(([n, pct, key, lab], i) => {
      const y = 60 + i * 66, g = s('g', { class: 'hot' });
      text(g, 0, y + 30, n, { size: 25, weight: 650 });
      g.append(s('rect', { x: 360, y: y + 6, width: 400, height: 32, rx: 16, fill: 'rgba(255,255,255,.07)' }));
      const bar = s('rect', { x: 360, y: y + 6, width: 0, height: 32, rx: 16, fill: i < 3 || i === 4 ? '#ff6a7d' : '#ffb15c' });
      g.append(bar);
      text(g, 780, y + 32, lab || `${pct}%`, { size: 26, weight: 750 });
      tip(g, n, n === 'Ovarian' ? '<b>Primary</b>: implants directly on the ovary.<br><b>Secondary</b>: re-implants on the ovary after a ruptured tubal pregnancy.' : n.startsWith('Abdominal') ? 'Implantation over the abdominal viscera (peritoneal pregnancy).' : i < 3 || i === 4 ? 'Part of the <b>tubal</b> group (95%). Presents with early pregnancy signs, then pain at the side.' : 'Rare site.', '#ff6a7d');
      g.addEventListener('mouseenter', () => { bub[n].setAttribute('fill-opacity', 1); bub[n].setAttribute('r', +bub[n].getAttribute('r') * 1.3); });
      g.addEventListener('mouseleave', () => { bub[n].setAttribute('fill-opacity', .55); bub[n].setAttribute('r', +bub[n].getAttribute('r') / 1.3); });
      chart.append(g); return [bar, pct];
    });
    text(chart, 0, 620, 'Ectopic = implantation outside the uterus · tubal sites bracketed (red)', { size: 21, fill: COL.fg3 });

    const seg = segmented(['Placenta previa', 'Ectopic pregnancy'], i => show(i));
    const ctrl = h('div', { class: 'ctrl', style: { right: '0px', top: '-110px' } }); ctrl.append(seg);
    el.append(ctrl, ctrlA);
    function show(i) {
      A.style.display = i ? 'none' : ''; B.style.display = i ? '' : 'none'; ctrlA.style.display = i ? 'none' : '';
      if (i) bars.forEach(([b, pct], k) => { b.setAttribute('width', 0); setTimeout(() => { b.style.transition = 'width 1s cubic-bezier(.22,.8,.2,1)'; b.setAttribute('width', Math.max(10, pct / 70 * 400)); }, 80 + k * 90); });
    }
    let raf;
    const tick = () => {
      const p = Pv.step(1 / 60);
      const k = Math.floor(clamp(p, 0, 3.999)), f = p - k;
      const ang = lerp(PREVIA[k][3], PREVIA[Math.min(4, k + 1)][3], f);
      // placenta band along the inner wall, centered at ang (degrees, clockwise from top), span ±34°
      let d = '';
      const pts = []; for (let a = ang - 34; a <= ang + 34; a += 2) pts.push(a);
      const P = a => { const aa = ((a % 360) + 360) % 360; const side = aa > 180 ? -1 : 1; const m = aa > 180 ? 360 - aa : aa; const [x, y] = inner(m); return [side < 0 ? 2 * cx - x : x, y]; };
      pts.forEach((a, i) => { const [x, y] = P(a); d += `${i ? 'L' : 'M'}${x},${y}`; });
      pts.slice().reverse().forEach(a => { const [x, y] = P(a); const dx = x - cx, dy = y - (cy + 40), l = Math.hypot(dx, dy) || 1; d += `L${x - dx / l * 46},${y - dy / l * 46}`; });
      plac.setAttribute('d', d + 'Z');
      const st = PREVIA[Math.round(clamp(p, 0, 4))];
      rT.textContent = st[0]; rT.setAttribute('fill', st[2]); rS.textContent = st[1];
      risk.style.opacity = p > .5 ? 1 : .25;
      raf = requestAnimationFrame(tick);
    };
    show(0);
    return { enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
