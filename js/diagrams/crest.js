// Neural crest: cells stream from the neural folds to their derivatives.
import { svgIn, text, COL, s, tip } from './_kit.js';

const D = [
  ['Facial bones', 'Pharyngeal-arch skeleton of the face', '#ffcc33', 'Bones of the face from the <b>pharyngeal arches</b>.<br><span style="font-size:22px">Lecture also lists laryngeal cartilages; Langman 15e derives the 4th/6th-arch laryngeal cartilages from lateral plate mesoderm.</span>'],
  ['Pia & arachnoid', 'Leptomeninges', '#64d2ff', 'The <b>leptomeninges</b> covering brain and spinal cord.'],
  ['Ganglia', 'Sensory & autonomic', '#a78bfa', 'Sensory (incl. <b>dorsal root</b>) and autonomic ganglia.'],
  ['Schwann cells', 'Myelinate peripheral nerves', '#4f9dff', 'Form myelin around peripheral nerve fibres.'],
  ['Heart outflow septum', 'Conotruncal septum', '#ff5a6e', 'Lecture: “heart septa”. Langman: neural crest forms the <b>conotruncal (outflow-tract) septum</b>.'],
  ['Adrenal medulla', 'Chromaffin cells', '#ff9f0a', 'Chromaffin cells of the <b>suprarenal medulla</b>.'],
  ['Melanocytes', 'Skin pigment cells', '#f5f5f7', 'Pigment cells of the skin.']
];

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const cx = 500, cy = 450, R = 330;
    // centre: neural tube section with crest cells
    const c = s('g', { transform: `translate(${cx},${cy})` }); svg.append(c);
    c.append(s('circle', { r: 120, fill: 'rgba(52,211,153,.08)', stroke: 'rgba(52,211,153,.35)', 'stroke-width': 2 }));
    c.append(s('path', { d: 'M-110,-40 C-60,-60 60,-60 110,-40', stroke: '#a9c8f2', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }));
    c.append(s('circle', { cy: 20, r: 52, fill: '#2a6cf0' }), s('circle', { cy: 20, r: 18, fill: '#0a1a3a' }));
    [[-30, -44], [0, -50], [30, -44], [-50, -30], [50, -30]].forEach(([x, y]) => c.append(s('circle', { cx: x, cy: y, r: 9, fill: '#34d399', filter: 'url(#glow)' })));
    text(c, 0, 108, 'Neural crest', { size: 28, weight: 800, anchor: 'middle', fill: '#34d399' });
    const paths = [];
    D.forEach(([t, sub, col, tb], i) => {
      const a = -Math.PI / 2 + i / D.length * Math.PI * 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * .92;
      const p = s('path', { d: `M${cx + Math.cos(a) * 125},${cy + Math.sin(a) * 115} Q${cx + Math.cos(a + .35) * R * .6},${cy + Math.sin(a + .35) * R * .55} ${x},${y}`, fill: 'none', stroke: col, 'stroke-opacity': .25, 'stroke-width': 3, 'stroke-dasharray': '4 10' });
      svg.append(p); paths.push([p, col]);
      const g = s('g', { class: 'hot' });
      g.append(s('circle', { cx: x, cy: y, r: 38, fill: 'rgba(20,20,24,.9)', stroke: col, 'stroke-width': 3 }), s('circle', { cx: x, cy: y, r: 14, fill: col, filter: 'url(#glow)' }));
      const right = Math.cos(a) >= -0.05, ty = y + (Math.abs(Math.sin(a)) > .9 ? (Math.sin(a) < 0 ? -86 : 74) : 10);
      const tx = Math.abs(Math.sin(a)) > .9 ? x : x + (right ? 52 : -52), anc = Math.abs(Math.sin(a)) > .9 ? 'middle' : right ? 'start' : 'end';
      text(g, tx, ty, t, { size: 28, weight: 750, anchor: anc });
      text(g, tx, ty + 32, sub, { size: 20, weight: 550, anchor: anc, fill: COL.fg2 });
      tip(g, t, tb, col);
      svg.append(g);
    });
    // migrating cells
    const cells = []; for (let i = 0; i < 42; i++) { const e = s('circle', { r: 6, fill: '#34d399' }); svg.append(e); cells.push({ e, k: i % D.length, d: Math.random() }); }
    let raf, t0;
    const tick = now => {
      const t = (now - t0) / 1000;
      cells.forEach(o => { const [p, col] = paths[o.k], L = p.getTotalLength(), f = (t * .18 + o.d) % 1; const pt = p.getPointAtLength(L * f); o.e.setAttribute('cx', pt.x); o.e.setAttribute('cy', pt.y); o.e.setAttribute('fill', col); o.e.setAttribute('opacity', Math.sin(f * Math.PI)); });
      raf = requestAnimationFrame(tick);
    };
    return { enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
