// Head-to-body proportion: ½ CRL (month 3) → ⅓ CHL (month 5) → ¼ CHL (birth). Figures normalised to equal height.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { Smooth, smooth, clamp, lerp } from '../ui.js';

function figure(parent, cx, H, headFrac, sitting, col) {
  const g = s('g'); parent.append(g);
  const top = 640 - H, hd = H * headFrac;
  const head = s('circle', { cx, cy: top + hd / 2, r: hd / 2, fill: col, opacity: .95 });
  const bodyH = sitting ? H - hd : (H - hd) * .5;
  const torso = s('rect', { x: cx - hd * .42, y: top + hd * .92, width: hd * .84, height: bodyH, rx: hd * .35, fill: col, opacity: .85 });
  g.append(torso, head);
  if (!sitting) {
    const legH = H - hd - bodyH + hd * .1, lt = top + hd * .9 + bodyH - hd * .1;
    g.append(s('rect', { x: cx - hd * .36, y: lt, width: hd * .3, height: legH, rx: hd * .15, fill: col, opacity: .8 }), s('rect', { x: cx + hd * .06, y: lt, width: hd * .3, height: legH, rx: hd * .15, fill: col, opacity: .8 }));
  } else {
    g.append(s('rect', { x: cx - hd * .1, y: 640 - hd * .3, width: hd * .7, height: hd * .26, rx: hd * .13, fill: col, opacity: .8 }));
  }
  // measuring bar: head part vs rest
  const bx = cx + 150;
  g.append(s('rect', { x: bx, y: top, width: 18, height: hd, rx: 9, fill: '#ffd60a' }), s('rect', { x: bx, y: top + hd + 6, width: 18, height: H - hd - 6, rx: 9, fill: 'rgba(255,255,255,.25)' }));
  return g;
}

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const F = [
      { x: 170, frac: 1 / 2, sit: true, t: 'Month 3', r: '½', sub: 'of CRL (sitting height)' },
      { x: 520, frac: 1 / 3, sit: false, t: 'Month 5', r: '⅓', sub: 'of CHL (crown–heel)' },
      { x: 860, frac: 1 / 4, sit: false, t: 'Birth', r: '¼', sub: 'of CHL' }
    ];
    const groups = F.map((f, i) => {
      const g = s('g', { class: 'hot' }); svg.append(g);
      figure(g, f.x, 460, f.frac, f.sit, ['#ff9f7a', '#ffb08a', '#ffc09a'][i]);
      text(g, f.x + 40, 730, f.t, { size: 34, weight: 800, anchor: 'middle' });
      text(g, f.x + 40, 790, f.r, { size: 64, weight: 800, anchor: 'middle', fill: '#ffd60a' });
      text(g, f.x + 40, 830, f.sub, { size: 22, anchor: 'middle', fill: COL.fg2 });
      tip(g, f.t, `Head ≈ <b>${f.r}</b> ${f.sub}. Over time body growth accelerates while head growth slows.`, '#ffd60a');
      return g;
    });
    text(svg, 530, 60, 'Figures normalised to the same height', { size: 22, anchor: 'middle', fill: COL.fg3 });
    const P = new Smooth(0, 3);
    let raf;
    const tick = () => { const p = P.step(1 / 60); groups.forEach((g, i) => { g.style.opacity = .25 + .75 * clamp(1 - Math.abs(p - i)); }); raf = requestAnimationFrame(tick); };
    return { maxStep: 2, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
