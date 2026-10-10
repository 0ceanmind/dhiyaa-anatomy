// Physiological umbilical herniation of the midgut loop: week 6 → back by week 12.
import { svgIn, text, pill, COL, s, tip, h } from './_kit.js';
import { Smooth, smooth, clamp, lerp, slider } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    // abdomen (front view, schematic) + umbilical cord leaving to the left
    svg.append(s('path', { d: 'M620,120 C860,120 920,330 900,520 C880,720 760,800 620,800 C480,800 420,700 420,560 L420,520 C420,380 420,120 620,120 Z', fill: '#2a1420', stroke: '#e88f7f', 'stroke-width': 5 }));
    text(svg, 700, 170, 'Abdominal cavity', { size: 26, fill: COL.fg2, anchor: 'middle' });
    const cord = s('path', { d: 'M430,430 C300,420 180,420 40,400 L40,600 C180,580 300,600 430,610 Z', fill: '#f3c9c0', opacity: .22, stroke: '#f3c9c0', 'stroke-width': 4 });
    svg.append(cord);
    text(svg, 120, 380, 'Umbilical cord', { size: 26, fill: '#f3c9c0' });
    // liver (growing) and kidneys hint
    const liver = s('path', { d: 'M560,200 C700,170 860,210 870,300 C780,340 640,330 560,290 Z', fill: '#8c3a3a', opacity: .85 });
    svg.append(liver);
    text(svg, 740, 270, 'Liver', { size: 22, fill: '#ffd0c8', anchor: 'middle' });
    // gut: stomach → loop (cranial & caudal limbs) → hindgut
    const gut = s('path', { fill: 'none', stroke: '#ffcc33', 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const vit = s('path', { fill: 'none', stroke: '#ffd60a', 'stroke-width': 8, 'stroke-dasharray': '6 8', opacity: .7 });
    const sma = s('path', { fill: 'none', stroke: '#ff453a', 'stroke-width': 6, opacity: .9 });
    svg.append(gut, vit);
    const lab = s('g', { class: 'hot' }); svg.append(lab);
    pill(lab, 0, 0, 'Midgut loop', '#ffcc33', { size: 26 });
    tip(lab, 'Primary intestinal loop', 'From week 6 the midgut loop herniates into the umbilical cord (Langman: rapid growth of the liver and gut while the abdominal cavity is small). It returns by the end of month 3.', '#ffcc33');
    const big = text(svg, 60, 90, '', { size: 64, weight: 800 }), sub = text(svg, 60, 134, '', { size: 28, weight: 600, fill: COL.fg2 });
    const W = new Smooth(6, 1.8);
    let user = false;
    const sl = slider({ min: 5, max: 12, step: .05, value: 6, label: 'Week', fmt: v => `Week ${Math.floor(v + .02)}`, width: 560, color: '#ffcc33', onInput: v => { user = true; W.set(v); } });
    const ctrl = h('div', { class: 'ctrl', style: { left: '20px', bottom: '6px' } }); ctrl.append(sl); el.append(ctrl);
    let raf;
    const tick = () => {
      const w = W.step(1 / 60);
      const out = smooth(5.6, 7, w) * (1 - smooth(10, 11.8, w));          // fraction of the loop in the cord
      const apex = [lerp(560, 160, out), lerp(520, 505, out)];
      const top = [620, 300], bot = [640, 700];
      gut.setAttribute('d', `M${top[0]},${top[1] - 60} L${top[0]},${top[1]} C${top[0] - 40},${top[1] + 80} ${apex[0] + 140},${apex[1] - 80} ${apex[0]},${apex[1] - 34} C${apex[0] - 50},${apex[1] - 20} ${apex[0] - 50},${apex[1] + 50} ${apex[0]},${apex[1] + 40} C${apex[0] + 160},${apex[1] + 90} ${bot[0] - 60},${bot[1] - 100} ${bot[0]},${bot[1]} L${bot[0] + 120},${bot[1] + 20}`);
      sma.setAttribute('d', `M700,250 C680,360 ${apex[0] + 120},${apex[1]} ${apex[0] + 10},${apex[1] + 4}`);
      vit.setAttribute('d', `M${apex[0] - 30},${apex[1] + 4} C${apex[0] - 90},${apex[1]} ${apex[0] - 140},${apex[1] - 10} ${Math.max(30, apex[0] - 200)},${apex[1] - 6}`);
      vit.setAttribute('opacity', .7 * (1 - smooth(8, 10, w)));
      liver.setAttribute('transform', `translate(${(1 - out) * 0},${0}) scale(${1 + .08 * out})`);
      lab.setAttribute('transform', `translate(${apex[0] - lerp(270, 70, out)},${apex[1] - lerp(-6, 74, out)})`);
      const wf = Math.floor(w + .02);
      big.textContent = w < 6 ? 'In the abdomen' : w < 10 ? 'Herniated into the cord' : w < 11.9 ? 'Returning' : 'Back in the abdomen';
      sub.textContent = `Week ${wf}` + (w < 6 ? ' · loop forming' : w < 10 ? ' · physiological, not a defect' : w < 11.9 ? ' · retraction' : ' · by week 12');
      if (!user) sl.set(w);
      raf = requestAnimationFrame(tick);
    };
    const wk = [5.5, 7, 9, 12];
    return { maxStep: 3, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { user = false; W.set(wk[n]); if (init) W.jump(wk[n]); } };
  }
};
