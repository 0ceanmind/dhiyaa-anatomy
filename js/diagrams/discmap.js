// Dorsal view of the trilaminar disc: mesoderm spreads everywhere except the two membranes; cardiogenic area cranially.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { Smooth, smooth } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const cx = 500, cy = 450, rx = 300, ry = 380;
    const clip = s('clipPath', { id: 'discClip' }); clip.append(s('ellipse', { cx, cy, rx, ry })); svg.querySelector('defs').append(clip);
    svg.append(s('ellipse', { cx, cy, rx: rx + 6, ry: ry + 6, fill: 'none', stroke: 'rgba(255,255,255,.25)', 'stroke-width': 3 }));
    svg.append(s('ellipse', { cx, cy, rx, ry, fill: '#173a7a' }));
    const meso = s('g', { 'clip-path': 'url(#discClip)' }); svg.append(meso);
    const spread = s('ellipse', { cx, cy: cy + 190, rx: 0, ry: 0, fill: '#ff5a6e', opacity: .55 }); meso.append(spread);
    const card = s('path', { d: `M${cx - 240},${cy - 250} C${cx - 200},${cy - 400} ${cx + 200},${cy - 400} ${cx + 240},${cy - 250} C${cx + 160},${cy - 330} ${cx - 160},${cy - 330} ${cx - 240},${cy - 250} Z`, fill: '#ff2f4f', class: 'hot' });
    tip(card, 'Cardiogenic area', 'Mesoderm migrates <b>cranial to the prechordal plate</b> and becomes continuous across the midline → future <b>heart</b>.', '#ff5a6e');
    meso.append(card);
    // arrows
    const arrows = s('g', { opacity: 0 }); svg.append(arrows);
    for (let i = 0; i < 10; i++) { const a = -Math.PI * .95 + i / 9 * Math.PI * 1.9; const x0 = cx + Math.cos(a) * 40, y0 = cy + 150 + Math.sin(a) * 60, x1 = cx + Math.cos(a) * 220, y1 = cy + 120 + Math.sin(a) * 300; arrows.append(s('path', { d: `M${x0},${y0} L${x1},${y1}`, stroke: '#ffd0d6', 'stroke-width': 4, 'marker-end': '' , opacity: .8, 'stroke-linecap': 'round', 'stroke-dasharray': '2 14' })); }
    // primitive streak + node + notochordal process
    svg.append(s('path', { d: `M${cx},${cy + 30} L${cx},${cy + 300}`, stroke: '#0b2a66', 'stroke-width': 18, 'stroke-linecap': 'round' }));
    svg.append(s('path', { d: `M${cx},${cy + 30} L${cx},${cy + 300}`, stroke: '#7cb6ff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: .6 }));
    svg.append(s('circle', { cx, cy: cy + 20, r: 22, fill: '#7cb6ff' }), s('circle', { cx, cy: cy + 20, r: 9, fill: '#061a44' }));
    const noto = s('path', { d: `M${cx},${cy - 4} L${cx},${cy - 230}`, stroke: '#ff7a45', 'stroke-width': 10, 'stroke-dasharray': '16 10', 'stroke-linecap': 'round' }); svg.append(noto);
    // membranes (no mesoderm)
    const oro = s('g', { class: 'hot' }); oro.append(s('ellipse', { cx, cy: cy - 270, rx: 58, ry: 38, fill: '#173a7a', stroke: '#ffd60a', 'stroke-width': 5 }));
    tip(oro, 'Oropharyngeal (buccopharyngeal) membrane', 'At the prechordal plate <b>ectoderm and endoderm stay in contact</b> — no mesoderm. Later ruptures → <b>mouth</b> opening.', '#ffd60a');
    const clo = s('g', { class: 'hot' }); clo.append(s('ellipse', { cx, cy: cy + 335, rx: 40, ry: 26, fill: '#173a7a', stroke: '#ffcc33', 'stroke-width': 5 }));
    tip(clo, 'Cloacal membrane', 'Caudal to the primitive streak — no mesoderm between ectoderm and endoderm. Later ruptures → <b>anal</b> opening.', '#ffcc33');
    svg.append(oro, clo);
    // labels
    const L = (x, y, t, c, anchor = 'start') => { const g = s('g'); g.append(s('circle', { cx: anchor === 'end' ? x + 16 : x - 16, cy: y - 9, r: 7, fill: c })); text(g, x, y, t, { size: 26, anchor }); svg.append(g); return g; };
    L(cx + 90, cy - 262, 'Oropharyngeal membrane', '#ffd60a');
    L(cx + 70, cy + 344, 'Cloacal membrane', '#ffcc33');
    L(cx + 40, cy + 200, 'Primitive streak', '#7cb6ff');
    L(cx + 40, cy + 30, 'Primitive node', '#7cb6ff');
    const ln = L(cx + 26, cy - 130, 'Notochordal process', '#ff7a45');
    const lc = L(cx - 250, cy - 360, 'Cardiogenic area', '#ff5a6e', 'end');
    const lm = L(cx - 330, cy + 60, 'Mesoderm', '#ff5a6e', 'end');
    text(svg, cx, 40, 'Cranial', { size: 22, anchor: 'middle', fill: COL.fg3 });
    text(svg, cx, 870, 'Caudal', { size: 22, anchor: 'middle', fill: COL.fg3 });
    const P = new Smooth(0, 1.8);
    let raf;
    const tick = () => {
      const p = P.step(1 / 60);
      const m = smooth(.1, 1, p);
      spread.setAttribute('rx', 30 + 420 * m); spread.setAttribute('ry', 40 + 560 * m); spread.setAttribute('cy', cy + 190 - 150 * m);
      arrows.setAttribute('opacity', (1 - Math.abs(p - 1) * 1.6) > 0 ? (1 - Math.abs(p - 1) * 1.6) : 0);
      const c = smooth(1.2, 2, p); card.setAttribute('opacity', c); lc.setAttribute('opacity', c);
      lm.setAttribute('opacity', m); noto.setAttribute('opacity', .3 + .7 * m); ln.setAttribute('opacity', m);
      raf = requestAnimationFrame(tick);
    };
    return { maxStep: 2, enter() { raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { P.set(n); if (init) P.jump(n); } };
  }
};
