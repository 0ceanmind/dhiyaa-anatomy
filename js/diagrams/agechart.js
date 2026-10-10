// Dating the embryo: somite count (Table 6.2) and crown–rump length (Table 6.3).
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented, slider, Smooth, clamp, lerp } from '../ui.js';
import { createEmbryo } from './embryo.js';

const T62 = [[20, 1, 4], [21, 4, 7], [22, 7, 10], [23, 10, 13], [24, 13, 17], [25, 17, 20], [26, 20, 23], [27, 23, 26], [28, 26, 29], [30, 34, 35]];
const T63 = [[5, 8, 5], [10, 14, 6], [17, 22, 7], [28, 30, 8]];

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const A = s('g'), B = s('g'); svg.append(A, B);
    // ---------- somite chart ----------
    const X0 = 120, X1 = 980, Y0 = 720, Y1 = 150;
    const x = d => X0 + (d - 20) / 10 * (X1 - X0), y = n => Y0 - n / 36 * (Y0 - Y1);
    for (let n = 0; n <= 35; n += 5) { A.append(s('line', { x1: X0, x2: X1, y1: y(n), y2: y(n), class: 'grid' })); text(A, X0 - 18, y(n) + 8, String(n), { size: 22, anchor: 'end', fill: COL.fg3 }); }
    for (let d = 20; d <= 30; d++) text(A, x(d), Y0 + 40, String(d), { size: 22, anchor: 'middle', fill: COL.fg3 });
    text(A, (X0 + X1) / 2, Y0 + 84, 'Approximate age (days)', { size: 24, anchor: 'middle', fill: COL.fg2 });
    text(A, X0 - 60, Y1 - 40, 'Pairs of somites', { size: 24, fill: COL.fg2 });
    let band = ''; T62.forEach(([d, a], i) => band += `${i ? 'L' : 'M'}${x(d)},${y(a)}`); T62.slice().reverse().forEach(([d, , b]) => band += `L${x(d)},${y(b)}`);
    A.append(s('path', { d: band + 'Z', fill: '#34d399', opacity: .22 }));
    let mid = ''; T62.forEach(([d, a, b], i) => mid += `${i ? 'L' : 'M'}${x(d)},${y((a + b) / 2)}`);
    A.append(s('path', { d: mid, fill: 'none', stroke: '#34d399', 'stroke-width': 5 }));
    T62.forEach(([d, a, b]) => { const g = s('g', { class: 'hot' }); g.append(s('line', { x1: x(d), x2: x(d), y1: y(a), y2: y(b), stroke: '#34d399', 'stroke-width': 10, 'stroke-linecap': 'round' }), s('circle', { cx: x(d), cy: y((a + b) / 2), r: 9, fill: '#fff' })); tip(g, `Day ${d}`, `<b>${a}–${b}</b> pairs of somites (Table 6.2)`, '#34d399'); A.append(g); });
    const cur = s('g'); A.append(cur);
    const vline = s('line', { y1: Y1 - 10, y2: Y0, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '6 6' }); cur.append(vline);
    const ro1 = s('g'); A.append(ro1);
    const r1a = text(ro1, 0, 0, '', { size: 56, weight: 800 }), r1b = text(ro1, 0, 40, '', { size: 24, fill: COL.fg2 });
    // ---------- CRL ----------
    const E = createEmbryo(B, { cx: 420, cy: 470, scale: .62 });
    const cal = s('g'); B.append(cal);
    const cl = s('line', { stroke: '#ffd60a', 'stroke-width': 4, 'stroke-dasharray': '10 8' }), ce1 = s('circle', { r: 9, fill: '#ffd60a' }), ce2 = s('circle', { r: 9, fill: '#ffd60a' });
    cal.append(cl, ce1, ce2);
    const ctext = text(B, 0, 0, 'CRL', { size: 28, weight: 800, fill: '#ffd60a' });
    const rows = s('g', { transform: 'translate(760,240)' }); B.append(rows);
    text(rows, 0, -40, 'Table 6.3', { size: 22, fill: COL.fg3, weight: 700 });
    const rowEls = T63.map(([a, b, wk], i) => { const g = s('g', { transform: `translate(0,${i * 92})` }); const bg = s('rect', { x: -20, y: -46, width: 280, height: 76, rx: 20, fill: 'rgba(255,255,255,.05)' }); g.append(bg); text(g, 0, 0, `${a}–${b} mm`, { size: 32, weight: 750 }); text(g, 0, 26, `≈ week ${wk}`, { size: 22, fill: COL.fg2 }); rows.append(g); return bg; });
    const ro2 = text(B, 760, 650, '', { size: 30, weight: 700, fill: COL.fg2 });
    // ---------- controls ----------
    const D = new Smooth(24, 4), L = new Smooth(12, 4);
    let mode = 0;
    const slD = slider({ min: 20, max: 30, step: 1, value: 24, label: 'Day', fmt: v => `Day ${v}`, width: 480, color: '#34d399', onInput: v => D.set(v) });
    const slL = slider({ min: 5, max: 30, step: .5, value: 12, label: 'CRL', fmt: v => `${v} mm`, width: 480, color: '#ffd60a', onInput: v => L.set(v) });
    const seg = segmented(['Somites · days 20–30', 'Crown–rump length · weeks 5–8'], i => { mode = i; A.style.display = i ? 'none' : ''; B.style.display = i ? '' : 'none'; slD.style.display = i ? 'none' : ''; slL.style.display = i ? '' : 'none'; });
    const ctrl = h('div', { class: 'ctrl', style: { left: '20px', bottom: '0px', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' } });
    ctrl.append(slD, slL); el.append(ctrl);
    const ctrlT = h('div', { class: 'ctrl', style: { right: '0px', top: '0px' } }); ctrlT.append(seg); el.append(ctrlT);
    seg.set(0, true);
    let raf;
    const tick = () => {
      const d = D.step(1 / 60);
      vline.setAttribute('x1', x(d)); vline.setAttribute('x2', x(d));
      let row = T62[0]; T62.forEach(r => { if (d >= r[0] - .5) row = r; });
      r1a.textContent = `${row[1]}–${row[2]}`; r1b.textContent = `pairs of somites · day ${row[0]}`;
      ro1.setAttribute('transform', `translate(${Math.min(x(d) + 24, 760)},${200})`);
      const crl = L.step(1 / 60);
      // map CRL to week (Table 6.3 ranges, interpolated between rows for the drawing)
      const wk = crl <= 8 ? 5 : crl <= 10 ? lerp(5, 6, (crl - 8) / 2) : crl <= 14 ? 6 : crl <= 17 ? lerp(6, 7, (crl - 14) / 3) : crl <= 22 ? 7 : crl <= 28 ? lerp(7, 8, (crl - 22) / 6) : 8;
      const An = E.update(wk);
      cl.setAttribute('x1', An.vertex[0]); cl.setAttribute('y1', An.vertex[1]); cl.setAttribute('x2', An.rump[0]); cl.setAttribute('y2', An.rump[1]);
      ce1.setAttribute('cx', An.vertex[0]); ce1.setAttribute('cy', An.vertex[1]); ce2.setAttribute('cx', An.rump[0]); ce2.setAttribute('cy', An.rump[1]);
      ctext.setAttribute('x', (An.vertex[0] + An.rump[0]) / 2 + 30); ctext.setAttribute('y', (An.vertex[1] + An.rump[1]) / 2);
      const hit = T63.findIndex(([a, b]) => crl >= a && crl <= b);
      rowEls.forEach((r, i) => r.setAttribute('fill', i === hit ? 'rgba(255,214,10,.22)' : 'rgba(255,255,255,.05)'));
      ro2.textContent = hit >= 0 ? `${crl} mm → ≈ week ${T63[hit][2]}` : `${crl} mm → between table rows`;
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 1, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n) { seg.set(n, true); } };
  }
};
