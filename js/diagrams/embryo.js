// Procedural embryo (lateral view) morphing from week 4 to week 8.
import { svgIn, text, COL, s, tip, h, pill } from './_kit.js';
import { Smooth, smooth, clamp, lerp, smoothPath, slider } from '../ui.js';

const D2R = Math.PI / 180;
export function createEmbryo(parent, { cx = 500, cy = 450, scale = 1 } = {}) {
  const g = s('g'); parent.append(g);
  const defs = parent.ownerSVGElement ? parent.ownerSVGElement.querySelector('defs') : parent.querySelector('defs');
  if (defs && !defs.querySelector('#gEmb')) {
    const gr = s('radialGradient', { id: 'gEmb', cx: '40%', cy: '35%', r: '75%' });
    gr.innerHTML = '<stop offset="0" stop-color="#ffd9c7"/><stop offset=".6" stop-color="#ffab95"/><stop offset="1" stop-color="#e57f74"/>';
    defs.append(gr);
    const gl = s('linearGradient', { id: 'gLimb', x1: 0, y1: 0, x2: 1, y2: 1 }); gl.innerHTML = '<stop offset="0" stop-color="#ffe3d6"/><stop offset="1" stop-color="#ffb8a2"/>'; defs.append(gl);
  }
  const cord = s('path', { fill: '#f3c9c0', stroke: '#e9a99f', 'stroke-width': 3, opacity: .9 });
  const herni = s('ellipse', { fill: '#ffb27a', stroke: '#f08a4a', 'stroke-width': 3, opacity: 0 });
  const lower = s('path', { fill: 'url(#gLimb)', stroke: '#c9665c', 'stroke-width': 3.5 });
  const body = s('path', { fill: 'url(#gEmb)', stroke: '#f6b3a3', 'stroke-width': 3 });
  const heart = s('circle', { fill: '#ff8f84', stroke: '#f6b3a3', 'stroke-width': 3 });
  const head = s('circle', { fill: 'url(#gEmb)', stroke: '#f6b3a3', 'stroke-width': 3 });
  const somites = s('g'); const arches = s('g');
  const upper = s('path', { fill: 'url(#gLimb)', stroke: '#c9665c', 'stroke-width': 3.5 });
  const digitsU = s('g'), digitsL = s('g');
  const eye = s('g'); const eyeO = s('circle', { fill: '#3a1d26' }), eyeL = s('circle', { fill: '#f6b3a3', opacity: .6 }); eye.append(eyeO, eyeL);
  const ear = s('path', { fill: 'none', stroke: '#c8706a', 'stroke-width': 5, 'stroke-linecap': 'round' });
  const nose = s('circle', { fill: '#ffb39f', stroke: '#e88f80', 'stroke-width': 2 });
  g.append(cord, herni, body, heart, somites, arches, head, lower, digitsL, upper, digitsU, eye, ear, nose);
  for (let i = 0; i < 18; i++) somites.append(s('circle', { r: 7, fill: '#ffc6b4', stroke: '#e99a8c', 'stroke-width': 1.5 }));
  for (let i = 0; i < 4; i++) arches.append(s('path', { fill: 'none', stroke: '#c75d55', 'stroke-width': 9, 'stroke-linecap': 'round' }));
  for (let i = 0; i < 5; i++) { digitsU.append(s('line', { stroke: '#ffcdbb', 'stroke-linecap': 'round' })); digitsL.append(s('line', { stroke: '#ffcdbb', 'stroke-linecap': 'round' })); }
  const anchors = {};

  function limbPath(base, dir, len, wid, bend, plate) {
    // simple limb: proximal segment → (elbow) → hand/foot plate
    const n = [-dir[1], dir[0]];
    const elbow = [base[0] + dir[0] * len * .55, base[1] + dir[1] * len * .55];
    const d2 = [Math.cos(Math.atan2(dir[1], dir[0]) + bend), Math.sin(Math.atan2(dir[1], dir[0]) + bend)];
    const tipP = [elbow[0] + d2[0] * len * .45, elbow[1] + d2[1] * len * .45];
    const n2 = [-d2[1], d2[0]];
    const P = [
      [base[0] + n[0] * wid, base[1] + n[1] * wid], [elbow[0] + n[0] * wid * .8, elbow[1] + n[1] * wid * .8],
      [tipP[0] + n2[0] * plate, tipP[1] + n2[1] * plate], [tipP[0] + d2[0] * plate * .9, tipP[1] + d2[1] * plate * .9],
      [tipP[0] - n2[0] * plate, tipP[1] - n2[1] * plate], [elbow[0] - n[0] * wid * .8, elbow[1] - n[1] * wid * .8], [base[0] - n[0] * wid, base[1] - n[1] * wid]
    ];
    return { d: smoothPath(P, true, .55), tip: tipP, dir: d2, n: n2 };
  }

  function update(w) {
    const k = clamp((w - 4) / 4);                     // 0 → week 4, 1 → week 8
    const Rb = (200 + 70 * k) * scale;
    const th0 = (-112 + 10 * k) * D2R, th1 = (172 - 62 * k) * D2R;
    const C = [cx - 40 * scale + 40 * k * scale, cy + 10 * scale];
    const P = sv => { const a = th0 + (th1 - th0) * sv; return [C[0] + Math.cos(a) * Rb, C[1] + Math.sin(a) * Rb, a]; };
    const T = (64 + 66 * k) * scale;
    const tw = sv => T * (.62 + .38 * Math.sin(Math.PI * Math.min(1, sv / .62))) * (1 - smooth(.7, 1, sv) * (.92 - .3 * k));
    const outer = [], inner = [];
    const NS = 46;
    for (let i = 0; i <= NS; i++) { const sv = i / NS; const [x, y, a] = P(sv); const t = tw(sv); outer.push([x + Math.cos(a) * t, y + Math.sin(a) * t]); inner.push([x - Math.cos(a) * t * .95, y - Math.sin(a) * t * .95]); }
    // tail regresses
    const tailEnd = 1 - .18 * k;
    const outerC = outer.filter((_, i) => i / NS <= tailEnd), innerC = inner.filter((_, i) => i / NS <= tailEnd);
    body.setAttribute('d', smoothPath([...outerC, ...innerC.reverse()], true, .5));
    // head
    const [hx0, hy0, ha] = P(.02);
    const Hr = (96 + 92 * k) * scale;
    const hc = [hx0 + Math.cos(ha + 1.2) * Hr * .55 - 18 * k * scale, hy0 + Math.sin(ha + 1.2) * Hr * .55 - 10 * scale];
    head.setAttribute('cx', hc[0]); head.setAttribute('cy', hc[1]); head.setAttribute('r', Hr);
    anchors.vertex = [hc[0] + 10 * scale, hc[1] - Hr];
    const [rx, ry, ra] = P(Math.min(tailEnd, .86 - .1 * k)); anchors.rump = [rx + Math.cos(ra) * tw(.8) * .9, ry + Math.sin(ra) * tw(.8) * .9];
    // heart prominence (ventral = toward C)
    const [hx, hy, ha2] = P(.3);
    const hb = (1 - smooth(.35, .9, k)) * T * .85;
    heart.setAttribute('cx', hx - Math.cos(ha2) * T * .55); heart.setAttribute('cy', hy - Math.sin(ha2) * T * .55); heart.setAttribute('r', Math.max(.1, hb)); heart.setAttribute('opacity', hb > 2 ? 1 : 0);
    anchors.heart = [hx - Math.cos(ha2) * T * 1.1, hy - Math.sin(ha2) * T * 1.1];
    // pharyngeal arches (weeks 4–5)
    const archA = 1 - smooth(.25, .6, k);
    [...arches.children].forEach((p, i) => {
      const [ax, ay, aa] = P(.06 + i * .045);
      const bx = ax - Math.cos(aa) * T * .62, by = ay - Math.sin(aa) * T * .62;
      p.setAttribute('d', `M${bx + Math.cos(aa + 1.57) * 30},${by + Math.sin(aa + 1.57) * 30} Q${bx - Math.cos(aa) * 26},${by - Math.sin(aa) * 26} ${bx - Math.cos(aa + 1.57) * 30},${by - Math.sin(aa + 1.57) * 30}`);
      p.setAttribute('opacity', archA * (i < 3 ? 1 : .6)); p.setAttribute('stroke-width', 9 * scale);
    });
    anchors.arches = (() => { const [ax, ay, aa] = P(.1); return [ax - Math.cos(aa) * T * 1.1, ay - Math.sin(aa) * T * 1.1]; })();
    // somites along the back (weeks 4–5)
    const somA = 1 - smooth(.2, .55, k);
    [...somites.children].forEach((c, i) => { const sv = .12 + i * .042; const [x, y, a] = P(sv); const t = tw(sv); c.setAttribute('cx', x + Math.cos(a) * t * .72); c.setAttribute('cy', y + Math.sin(a) * t * .72); c.setAttribute('r', 7 * scale); c.setAttribute('opacity', sv < tailEnd ? somA : 0); });
    // cord
    const [ux, uy, ua] = P(.56);
    const cb = [ux - Math.cos(ua) * tw(.56) * .8, uy - Math.sin(ua) * tw(.56) * .8];
    const cend = [cb[0] - 260 * scale, cb[1] + 150 * scale];
    const cw = (26 + 10 * k) * scale;
    cord.setAttribute('d', `M${cb[0]},${cb[1] - cw} C${cb[0] - 120 * scale},${cb[1] - cw - 20 * scale} ${cend[0] + 60 * scale},${cend[1] - cw} ${cend[0]},${cend[1] - cw} L${cend[0]},${cend[1] + cw} C${cend[0] + 60 * scale},${cend[1] + cw} ${cb[0] - 120 * scale},${cb[1] + cw - 20 * scale} ${cb[0]},${cb[1] + cw} Z`);
    anchors.cordBase = cb; anchors.cordMid = [cb[0] - 120 * scale, cb[1] - 6 * scale];
    // limbs: upper bud ~ week 5, lower slightly later
    const uk = smooth(4.7, 8, w), lk = smooth(5.0, 8.2, w);
    const limb = (sv, kk, el, dg, side) => {
      const [x, y, a] = P(sv);
      const base = [x + Math.cos(a) * tw(sv) * .15, y + Math.sin(a) * tw(sv) * .15];
      const dir = [Math.cos(a + (side ? 2.55 : 2.8)), Math.sin(a + (side ? 2.55 : 2.8))];
      const len = (16 + 205 * kk) * scale, wid = (16 + 20 * kk) * scale, plate = (18 + 18 * kk) * scale;
      const L = limbPath(base, dir, len, wid, (side ? .7 : -.75) * smooth(.35, .8, kk), plate);
      el.setAttribute('d', L.d); el.setAttribute('opacity', smooth(.0, .08, kk));
      const dig = smooth(.62, .95, kk);
      [...dg.children].forEach((ln, i) => { const off = (i - 2) * plate * .42; const sx = L.tip[0] + L.n[0] * off + L.dir[0] * plate * .5, sy = L.tip[1] + L.n[1] * off + L.dir[1] * plate * .5; const dl = plate * (.5 + .25 * (i === 2)) * dig; ln.setAttribute('x1', sx); ln.setAttribute('y1', sy); ln.setAttribute('x2', sx + (L.dir[0] + L.n[0] * (i - 2) * .12) * dl); ln.setAttribute('y2', sy + (L.dir[1] + L.n[1] * (i - 2) * .12) * dl); ln.setAttribute('stroke-width', plate * .34); ln.setAttribute('opacity', dig); });
      return L.tip;
    };
    anchors.upperLimb = limb(.36, uk, upper, digitsU, 0);
    anchors.lowerLimb = limb(.7, lk, lower, digitsL, 1);
    // face
    const eA = smooth(4.6, 5.4, w);
    eye.setAttribute('transform', `translate(${hc[0] - Hr * .38},${hc[1] + Hr * .02})`);
    eyeO.setAttribute('r', Hr * (.08 + .07 * eA)); eyeL.setAttribute('r', Hr * .05 * eA); eye.setAttribute('opacity', .35 + .65 * eA);
    anchors.eye = [hc[0] - Hr * .38, hc[1]];
    const ea = smooth(5.5, 8, w);
    const ex = hc[0] + Hr * .2, ey = hc[1] + Hr * .28;
    ear.setAttribute('d', ea < .05 ? `M${ex},${ey} a6,6 0 1 0 1,0` : `M${ex - Hr * .05 * ea},${ey - Hr * .16 * ea} C${ex + Hr * .14 * ea},${ey - Hr * .2 * ea} ${ex + Hr * .16 * ea},${ey + Hr * .14 * ea} ${ex - Hr * .02},${ey + Hr * .16 * ea}`);
    ear.setAttribute('stroke-width', 5 * scale);
    anchors.ear = [ex, ey];
    const nA = smooth(5.5, 7.5, w);
    nose.setAttribute('cx', hc[0] - Hr * .93); nose.setAttribute('cy', hc[1] + Hr * .18); nose.setAttribute('r', Hr * .09 * nA); nose.setAttribute('opacity', nA);
    anchors.nose = [hc[0] - Hr, hc[1] + Hr * .18];
    anchors.head = hc; anchors.Hr = Hr;
    return anchors;
  }
  return { g, update, anchors, herni, cord };
}

export default {
  mount(el, opts = {}) {
    const svg = svgIn(el, 1060, 880);
    const E = createEmbryo(svg, { cx: 580, cy: 470, scale: .8 });
    const W = new Smooth(4, 1.4);
    const lab = s('g'); svg.append(lab);
    const L = {
      arches: pill(lab, 0, 0, 'Pharyngeal arches', '#ff8f84', { tt: 'Pharyngeal arches', tb: 'Appear in weeks <b>4–5</b> and shape the external appearance (Fig. 17.3: 25 d, 28 d, 5 wk).' }),
      heart: pill(lab, 0, 0, 'Heart bulge', '#ff5a6e'),
      upper: pill(lab, 0, 0, 'Upper limb', '#ffcc33', { tt: 'Limbs', tb: 'Buds ~week 5 → grow, 3 segments → digital rays → fingers & toes by <b>week 8</b>.' }),
      lower: pill(lab, 0, 0, 'Lower limb', '#ffcc33'),
      eye: pill(lab, 0, 0, 'Eye', '#64d2ff'), ear: pill(lab, 0, 0, 'Ear', '#a78bfa'), cord: pill(lab, 0, 0, 'Umbilical cord', '#f3c9c0')
    };
    const wk = text(svg, 60, 90, '', { size: 64, weight: 800 });
    const wsub = text(svg, 60, 132, '', { size: 26, weight: 600, fill: COL.fg2 });
    let user = false;
    let sl = null;
    if (!opts.auto) {
      sl = slider({ min: 4, max: 8, step: .05, value: 4, label: 'Week', fmt: v => `Week ${Math.floor(v + .02)}`, width: 520, color: '#34d399', onInput: v => { user = true; W.set(v); } });
      const ctrl = h('div', { class: 'ctrl', style: { left: '20px', bottom: '10px' } }); ctrl.append(sl); el.append(ctrl);
    }
    const subs = { 4: 'C-shaped · arches · somites', 5: 'Limb buds · eye · larger head', 6: 'Hand plates · herniation begins', 7: 'Digital rays · face forming', 8: 'Fingers & toes · human-like' };
    let raf, t0;
    const place = (p, xy, dx = 30, dy = 0, show = true) => { p.setAttribute('transform', `translate(${xy[0] + dx},${xy[1] + dy})`); p.style.opacity = show ? 1 : 0; };
    const tick = now => {
      if (opts.auto) { const t = ((now - t0) / 1000) % 12; W.set(t < 9 ? 4 + 4 * (t / 9) : 8); }
      const w = W.step(1 / 60);
      const A = E.update(w);
      const wf = Math.floor(w + .02);
      wk.textContent = `Week ${wf}`; wsub.textContent = subs[Math.min(8, Math.max(4, wf))];
      place(L.arches, A.arches, -230, 0, w < 5.6);
      place(L.heart, A.heart, -200, 30, w < 4.9);
      place(L.upper, A.upperLimb, -250, -10, w > 4.9);
      place(L.lower, A.lowerLimb, 40, 70, w > 5.3);
      place(L.eye, A.eye, -150, -60, w > 4.8);
      place(L.ear, A.ear, 40, 30, w > 5.6);
      place(L.cord, A.cordMid, -250, 100, true);
      if (sl && !user) sl.set(w);
      raf = requestAnimationFrame(tick);
    };
    const wks = [4, 5, 6, 7, 8];
    return {
      maxStep: opts.auto ? 0 : 4,
      enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); },
      leave() { cancelAnimationFrame(raf); },
      step(n, init) { if (opts.auto) return; user = false; W.set(wks[n]); if (init) W.jump(wks[n]); }
    };
  }
};
