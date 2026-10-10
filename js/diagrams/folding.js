// Embryonic folding: sagittal (head & tail folds) and transverse (lateral folds) sections driven by one slider.
import { svgIn, text, COL, s, tip, h, pill } from './_kit.js';
import { Smooth, smooth, clamp, lerp, slider, smoothPath } from '../ui.js';

const N = 81;
function curve(center, half, phiFn, mirrorFn) {
  // integrate centre-line both ways from s = 0
  const P = new Array(N), mid = (N - 1) / 2, ds = 1 / mid;
  P[mid] = [center[0], center[1]];
  for (let i = mid; i < N - 1; i++) { const sv = i / mid - 1, f = phiFn(sv); P[i + 1] = [P[i][0] + Math.cos(f) * half * ds, P[i][1] + Math.sin(f) * half * ds]; }
  for (let i = mid; i > 0; i--) { const sv = -(i / mid - 1), f = mirrorFn(sv); P[i - 1] = [P[i][0] - Math.cos(f) * half * ds, P[i][1] + Math.sin(f) * half * ds]; }
  return P;
}
function offset(P, d) {
  return P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [p[0] + ty / l * d, p[1] - tx / l * d]; });
}
const at = (P, sv) => P[Math.round((sv + 1) / 2 * (P.length - 1))];
const sub = (P, s0, s1) => P.slice(Math.round((s0 + 1) / 2 * (P.length - 1)), Math.round((s1 + 1) / 2 * (P.length - 1)) + 1);

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const titleL = text(svg, 270, 24, 'Sagittal · head & tail folds', { size: 26, weight: 700, anchor: 'middle', fill: COL.fg2 });
    const titleR = text(svg, 820, 24, 'Transverse · lateral folds', { size: 26, weight: 700, anchor: 'middle', fill: COL.fg2 });
    svg.append(s('line', { x1: 548, x2: 548, y1: 30, y2: 760, stroke: 'rgba(255,255,255,.1)', 'stroke-width': 2 }));
    // ---- sagittal elements ----
    const A = s('g'); svg.append(A);
    const sAmn = s('path', { fill: 'rgba(100,210,255,.07)', stroke: '#64d2ff', 'stroke-width': 4 });
    const sYolk = s('path', { fill: 'rgba(255,214,10,.12)', stroke: '#ffd60a', 'stroke-width': 5 });
    const sStalk = s('path', { stroke: '#f28c3a', 'stroke-width': 30, 'stroke-linecap': 'round', fill: 'none', opacity: .9 });
    const sMeso = s('path', { fill: '#e23a52' });
    const sEcto = s('path', { stroke: '#3a7be6', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' });
    const sNeural = s('path', { stroke: '#2a6cf0', 'stroke-width': 20, fill: 'none', 'stroke-linecap': 'round', opacity: .9 });
    const sEndo = s('path', { stroke: '#f5b400', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' });
    const heart = s('circle', { r: 20, fill: '#ff2f4f', stroke: '#ffd0d6', 'stroke-width': 3 });
    const septum = s('circle', { r: 14, fill: '#ff9f0a' });
    const oro = s('line', { stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' });
    const clo = s('line', { stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' });
    const streak = s('circle', { r: 9, fill: '#7cb6ff' });
    const allant = s('path', { stroke: '#ffd60a', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' });
    A.append(sAmn, sYolk, sStalk, sMeso, sEcto, sNeural, sEndo, allant, heart, septum, oro, clo, streak);
    const lab = s('g'); svg.append(lab);
    const Lh = pill(lab, 0, 0, 'Heart', '#ff2f4f', { size: 22, tt: 'Heart primordium', tb: 'Moves from cranial to the oropharyngeal membrane to the <b>ventral</b> thorax.' });
    const Ls = pill(lab, 0, 0, 'Septum transversum', '#ff9f0a', { size: 22, tt: 'Septum transversum', tb: 'Most cranial mesoderm before folding; ends up caudal to the heart.' });
    const Lo = pill(lab, 0, 0, 'Oropharyngeal membrane', '#ffffff', { size: 22 });
    const Lc = pill(lab, 0, 0, 'Cloacal membrane', '#ffffff', { size: 22 });
    const Lst = pill(lab, 0, 0, 'Primitive streak', '#7cb6ff', { size: 22 });
    const Lal = pill(lab, 0, 0, 'Connecting stalk · allantois', '#f28c3a', { size: 22 });
    const Lfg = pill(lab, 0, 0, 'Foregut', '#ffcc33', { size: 22 }), Lmg = pill(lab, 0, 0, 'Midgut', '#ffcc33', { size: 22, tt: 'Midgut', tb: 'Stays connected to the yolk sac by the <b>vitelline duct</b>.' }), Lhg = pill(lab, 0, 0, 'Hindgut', '#ffcc33', { size: 22 });
    // ---- transverse elements ----
    const B = s('g'); svg.append(B);
    const tAmn = s('path', { fill: 'rgba(100,210,255,.07)', stroke: '#64d2ff', 'stroke-width': 4 });
    const tYolk = s('path', { fill: 'rgba(255,214,10,.12)', stroke: '#ffd60a', 'stroke-width': 5 });
    const tSom = s('path', { stroke: '#ff6fae', 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round' });
    const tSpl = s('path', { stroke: '#ff6fae', 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round' });
    const tEcto = s('path', { stroke: '#3a7be6', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' });
    const tEndo = s('path', { stroke: '#f5b400', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' });
    const tNT = s('circle', { r: 34, fill: '#2a6cf0' }), tNTl = s('circle', { r: 10, fill: '#0a1a3a' }), tNo = s('circle', { r: 12, fill: '#ff7a45' });
    const tPar = [s('rect', { width: 50, height: 70, rx: 18, fill: '#ff5a6e' }), s('rect', { width: 50, height: 70, rx: 18, fill: '#ff5a6e' })];
    B.append(tAmn, tYolk, tSom, tSpl, tEcto, tEndo, tNT, tNTl, tNo, ...tPar);
    const Lgut = pill(lab, 0, 0, 'Gut tube', '#ffcc33', { size: 22 });
    const Lcoel = pill(lab, 0, 0, 'Intraembryonic coelom', '#c084fc', { size: 22, tt: 'Intraembryonic coelom', tb: 'Space between somatic and splanchnic mesoderm → body cavities.' });
    const Lwall = pill(lab, 0, 0, 'Body wall (somatic)', '#ff6fae', { size: 22 });
    const Lamn = pill(lab, 0, 0, 'Amnion', '#64d2ff', { size: 22 });
    const place = (p, xy, dx, dy, op = 1) => { p.setAttribute('transform', `translate(${xy[0] + dx},${xy[1] + dy})`); p.style.opacity = op; };

    const Pg = new Smooth(0, 2.2);
    let user = false;
    const sl = slider({ min: 0, max: 1, step: .01, value: 0, label: 'Folding', fmt: v => `${Math.round(v * 100)}%`, width: 560, color: '#34d399', onInput: v => { user = true; Pg.set(v); } });
    const ctrl = h('div', { class: 'ctrl', style: { left: '20px', bottom: '6px' } }); ctrl.append(sl); el.append(ctrl);

    let raf;
    const tick = () => {
      const p = Pg.step(1 / 60);
      // ===== sagittal =====
      const C = [270, 300 + 40 * p];
      const P = curve(C, 238, sv => p * 3.35 * smooth(.28, 1, sv), sv => p * 2.85 * smooth(.32, 1, sv));
      const ecto = offset(P, 17), endo = offset(P, -17), mU = offset(P, 11), mD = offset(P, -11);
      sEcto.setAttribute('d', smoothPath(ecto, false)); sEndo.setAttribute('d', smoothPath(endo, false));
      sMeso.setAttribute('d', smoothPath([...mU, ...mD.slice().reverse()], true, .4));
      sNeural.setAttribute('d', smoothPath(offset(sub(P, -.72, .86), 33), false));
      const eC = ecto.at(-1), eT = ecto[0], nC = endo.at(-1), nT = endo[0];
      sAmn.setAttribute('d', `M${eC[0]},${eC[1]} C${eC[0] + 120},${eC[1] - 330} ${eT[0] - 120},${eT[1] - 330} ${eT[0]},${eT[1]}`);
      const neck = Math.max(30, Math.hypot(nC[0] - nT[0], nC[1] - nT[1]));
      const ym = Math.max(nC[1], nT[1]) + 70 + 120 * (1 - p * .5);
      sYolk.setAttribute('d', `M${nC[0]},${nC[1]} C${nC[0] + 60},${ym + 60} ${C[0] - 150 + 60 * p},${ym + 200 - 40 * p} ${C[0] - 20},${ym + 190 - 40 * p} C${C[0] + 90},${ym + 180} ${nT[0] - 60 * (1 - p)},${ym + 40} ${nT[0]},${nT[1]}`);
      sStalk.setAttribute('d', `M${eT[0]},${eT[1]} Q${eT[0] - 60},${eT[1] + 120} ${30},${720}`);
      const hp = at(P, .89), sp = at(P, .97), op = at(P, .79), cp = at(P, -.8), stp = at(offset(P, 17), -.9), alp = at(endo, -.94);
      heart.setAttribute('cx', hp[0]); heart.setAttribute('cy', hp[1]);
      septum.setAttribute('cx', sp[0]); septum.setAttribute('cy', sp[1]);
      const o1 = at(ecto, .79), o2 = at(endo, .79); oro.setAttribute('x1', o1[0]); oro.setAttribute('y1', o1[1]); oro.setAttribute('x2', o2[0]); oro.setAttribute('y2', o2[1]);
      const c1 = at(ecto, -.8), c2 = at(endo, -.8); clo.setAttribute('x1', c1[0]); clo.setAttribute('y1', c1[1]); clo.setAttribute('x2', c2[0]); clo.setAttribute('y2', c2[1]);
      streak.setAttribute('cx', stp[0]); streak.setAttribute('cy', stp[1]);
      allant.setAttribute('d', `M${alp[0]},${alp[1]} q${-30},${40} ${-50},${90}`);
      const early = 1 - smooth(.25, .45, p), late = smooth(.65, .9, p);
      place(Lh, hp, 26, -40); place(Ls, sp, 24, 18, early); place(Lo, o2, 20, 40, early); place(Lc, c2, -140, 44, early); place(Lst, stp, -170, -36, early); place(Lal, [60, 700], 0, 0, .3 + .7 * late);
      const g1 = at(endo, .55), g2 = at(endo, 0), g3 = at(endo, -.55);
      place(Lfg, g1, 10, 10, late); place(Lmg, g2, -50, 54, late); place(Lhg, g3, -120, 10, late);
      // ===== transverse =====
      const T0 = [810, 265 + 85 * p];
      let Q = curve(T0, 200, sv => p * Math.PI * 1.05 * smooth(.22, 1, sv), sv => p * Math.PI * 1.05 * smooth(.22, 1, sv));
      // pull ends together as the folds meet ventrally
      const w = smooth(.75, 1, p), e0 = Q[0], e1 = Q.at(-1), tgt = [T0[0], (e0[1] + e1[1]) / 2 + 10 * w];
      Q = Q.map((q, i) => { const sv = i / (N - 1) * 2 - 1, k = smooth(.45, 1, Math.abs(sv)) * w, e = sv < 0 ? e0 : e1; return [q[0] + (tgt[0] - e[0]) * k, q[1] + (tgt[1] - e[1]) * k]; });
      const te = offset(Q, 17), tn = offset(Q, -17);
      tEcto.setAttribute('d', smoothPath(te, false)); tEndo.setAttribute('d', smoothPath(tn, false));
      tSom.setAttribute('d', smoothPath(offset(sub(Q, .36, 1), 8), false) + smoothPath(offset(sub(Q, -1, -.36), 8), false));
      tSpl.setAttribute('d', smoothPath(offset(sub(Q, .36, 1), -8), false) + smoothPath(offset(sub(Q, -1, -.36), -8), false));
      const midE = at(offset(Q, 70), 0); tNT.setAttribute('cx', midE[0]); tNT.setAttribute('cy', midE[1] - 4); tNTl.setAttribute('cx', midE[0]); tNTl.setAttribute('cy', midE[1] - 4);
      const midN = at(offset(Q, 6), 0); tNo.setAttribute('cx', midN[0]); tNo.setAttribute('cy', midN[1]);
      [.17, -.17].forEach((sv, k) => { const pp = at(offset(Q, 30), sv); tPar[k].setAttribute('x', pp[0] - 25); tPar[k].setAttribute('y', pp[1] - 35); });
      const te0 = te[0], te1 = te.at(-1), tn0 = tn[0], tn1 = tn.at(-1);
      const ah = lerp(250, 300, p);
      tAmn.setAttribute('d', `M${te0[0]},${te0[1]} C${te0[0] - 80},${te0[1] - ah} ${te1[0] + 80},${te1[1] - ah} ${te1[0]},${te1[1]}`);
      const yb = Math.max(tn0[1], tn1[1]) + 150 - 60 * p;
      tYolk.setAttribute('d', `M${tn0[0]},${tn0[1]} C${tn0[0] - 50 * (1 - p)},${yb} ${T0[0] - 130},${yb + 120} ${T0[0]},${yb + 120} C${T0[0] + 130},${yb + 120} ${tn1[0] + 50 * (1 - p)},${yb} ${tn1[0]},${tn1[1]}`);
      const gutC = at(tn, 0);
      place(Lgut, [gutC[0], (gutC[1] + tgt[1]) / 2], -60, 20, smooth(.7, 1, p));
      place(Lcoel, at(Q, .5), -40, 60, smooth(.4, .8, p));
      place(Lwall, at(te, .9), 20, 30, smooth(.5, .9, p));
      place(Lamn, [T0[0] + 100, Math.min(te0[1], te1[1]) - 150], 0, 0, 1);
      if (!user) sl.set(p);
      raf = requestAnimationFrame(tick);
    };
    const stops = [0, .5, 1];
    return { maxStep: 2, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { user = false; Pg.set(stops[n]); if (init) Pg.jump(stops[n]); } };
  }
};
