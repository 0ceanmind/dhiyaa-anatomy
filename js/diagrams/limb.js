// Upper-limb development, weeks 5 → 8: bud → hand plate → digital rays → separate fingers.
import { svgIn, text, COL, s, h } from './_kit.js';
import { Smooth, smooth, clamp, lerp, smoothPath, slider } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const defs = svg.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', `
      <linearGradient id="gLimbFl" gradientUnits="userSpaceOnUse" x1="0" y1="590" x2="0" y2="870"><stop offset="0" stop-color="#e8907f"/><stop offset=".5" stop-color="#d47a6c"/><stop offset="1" stop-color="#b85f55" stop-opacity="0"/></linearGradient>
      <linearGradient id="gLimbArm" gradientUnits="userSpaceOnUse" x1="240" y1="700" x2="560" y2="120"><stop offset="0" stop-color="#f29a86"/><stop offset=".55" stop-color="#ffbfa9"/><stop offset="1" stop-color="#ffd8c8"/></linearGradient>
      <radialGradient id="gLimbSheen" gradientUnits="userSpaceOnUse" cx="420" cy="300" r="320"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`);
    const limb = s('g'); svg.append(limb);
    const arm = s('path', { fill: 'url(#gLimbArm)' });
    const hand = s('path', { fill: 'url(#gLimbArm)' });
    const sheen = s('path', { fill: 'url(#gLimbSheen)' });
    const rays = s('g');
    limb.append(arm, hand, sheen, rays);
    for (let i = 0; i < 5; i++) rays.append(s('line', { stroke: '#e37f72', 'stroke-width': 10, 'stroke-linecap': 'round' }));
    // body wall drawn over the limb base so the bud grows out of it; fades out towards the controls
    svg.append(s('path', { d: 'M-40,650 C120,600 360,600 560,700 C660,750 720,820 750,880 L-40,880 Z', fill: 'url(#gLimbFl)' }));
    text(svg, 40, 690, 'Body wall', { size: 22, weight: 650, fill: '#ffe1d8', opacity: .8 });
    const seg = s('g'); svg.append(seg);
    const segL = ['Arm', 'Forearm', 'Hand'].map(t => { const g = s('g'); g.append(s('circle', { r: 7, fill: '#34d399' })); text(g, 16, 8, t, { size: 24, weight: 700 }); seg.append(g); return g; });
    // readout (right, clear of the hand at every stage)
    const big = text(svg, 640, 470, '', { size: 60, weight: 800 });
    const wkT = text(svg, 640, 518, '', { size: 30, weight: 700, fill: '#34d399' });
    const sub = text(svg, 640, 558, '', { size: 26, weight: 600, fill: COL.fg2 });
    const W = new Smooth(5, 1.8);
    let user = false;
    const sl = slider({ min: 5, max: 8, step: .05, value: 5, label: 'Week', fmt: v => `Week ${Math.floor(v + .02)}`, width: 520, color: '#34d399', onInput: v => { user = true; W.set(v); } });
    const ctrl = h('div', { class: 'ctrl', style: { left: '20px', bottom: '6px' } }); ctrl.append(sl); el.append(ctrl);
    const st = { 5: ['Limb bud', 'Outgrowth from the body wall'], 6: ['Hand plate', 'Paddle-shaped · 3 segments'], 7: ['Digital rays', 'Notches between the rays'], 8: ['Fingers formed', 'Webbing regresses'] };
    const A0 = -0.85;                                         // limb axis (up and to the right)
    let raf;
    const tick = () => {
      const w = W.step(1 / 60), k = clamp((w - 5) / 3);
      const base = [250, 680];
      const len = lerp(60, 330, smooth(0, .75, k));          // limb length
      const dir = [Math.cos(A0), Math.sin(A0)];
      const wid = lerp(66, 50, k);
      // arm with elbow (segments appear from week 6)
      const segA = smooth(.25, .6, k);
      const elbow = [base[0] + dir[0] * len * .5, base[1] + dir[1] * len * .5];
      const d2a = A0 - .45 * segA, d2 = [Math.cos(d2a), Math.sin(d2a)];
      const wrist = [elbow[0] + d2[0] * len * .42, elbow[1] + d2[1] * len * .42];
      const n1 = [-dir[1], dir[0]], n2 = [-d2[1], d2[0]];
      const pinch = 1 - .18 * segA, wr = lerp(.95, .72, segA);   // wrist stays full-width while it is still a bud
      arm.setAttribute('d', smoothPath([
        [base[0] + n1[0] * wid * 1.25, base[1] + n1[1] * wid * 1.25], [elbow[0] + n1[0] * wid * pinch, elbow[1] + n1[1] * wid * pinch],
        [wrist[0] + n2[0] * wid * wr * pinch, wrist[1] + n2[1] * wid * wr * pinch], [wrist[0] - n2[0] * wid * wr * pinch, wrist[1] - n2[1] * wid * wr * pinch],
        [elbow[0] - n1[0] * wid * pinch, elbow[1] - n1[1] * wid * pinch], [base[0] - n1[0] * wid * 1.25, base[1] - n1[1] * wid * 1.25]], true, .5));
      // hand plate: outline with digit lobes and receding webs
      const Rp = lerp(62, 90, smooth(0, .5, k));
      const fl = lerp(0, 118, smooth(.3, 1, k));               // finger length
      const web = 1 - smooth(.62, .97, k);                     // webbing between digits
      const hc = [wrist[0] + d2[0] * Rp * lerp(.35, .72, segA), wrist[1] + d2[1] * Rp * lerp(.35, .72, segA)];
      const ang0 = d2a, fingers = [-.95, -.42, 0, .38, .76].map(a => ang0 + a);
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const a = ang0 - Math.PI * .85 + i / 120 * Math.PI * 1.7;
        let f = 0; fingers.forEach((fa, j) => { const sig = .16; f = Math.max(f, Math.exp(-(((a - fa) / sig) ** 2)) * (j === 0 ? .62 : j === 2 ? 1 : .88)); });
        const r = Rp + fl * (web * .55 + (1 - web) * f) * smooth(-.2, .2, Math.cos(a - ang0));
        pts.push([hc[0] + Math.cos(a) * r, hc[1] + Math.sin(a) * r]);
      }
      const hp = smoothPath(pts, true, .4);
      hand.setAttribute('d', hp); sheen.setAttribute('d', hp);
      // digital rays (week 7)
      const rv = smooth(.45, .75, k) * (1 - smooth(.9, 1, k) * .4);
      [...rays.children].forEach((ln, j) => { const fa = fingers[j], l0 = Rp * .35, l1 = Rp + fl * (j === 0 ? .5 : .78) * .8; ln.setAttribute('x1', hc[0] + Math.cos(fa) * l0); ln.setAttribute('y1', hc[1] + Math.sin(fa) * l0); ln.setAttribute('x2', hc[0] + Math.cos(fa) * l1); ln.setAttribute('y2', hc[1] + Math.sin(fa) * l1); ln.setAttribute('opacity', rv); });
      // segment labels (to the left of the limb, clear of the readout)
      const sp = [[(base[0] + elbow[0]) / 2, (base[1] + elbow[1]) / 2], [(elbow[0] + wrist[0]) / 2, (elbow[1] + wrist[1]) / 2], hc];
      segL.forEach((g, i) => { g.setAttribute('transform', `translate(${sp[i][0] - (i === 2 ? Rp + 150 : 160)},${sp[i][1] + (i === 2 ? 10 : 0)})`); g.style.opacity = segA * (i === 0 ? smooth(.5, .7, k) : 1); });
      const wf = Math.min(8, Math.max(5, Math.floor(w + .02)));
      big.textContent = st[wf][0]; wkT.textContent = `Week ${wf}`; sub.textContent = st[wf][1];
      if (!user) sl.set(w);
      raf = requestAnimationFrame(tick);
    };
    const wk = [5, 6, 7, 8];
    return { maxStep: 3, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { user = false; W.set(wk[n]); if (init) W.jump(wk[n]); } };
  }
};
