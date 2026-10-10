// Day-13 conceptus: which layers make the chorion, amnion and yolk sac (interactive highlight).
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented, circlePts, smoothPath, rng } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const cx = 500, cy = 430, R = rng(2);
    const L = {};
    const add = (key, node, tt, tb, color) => { node.classList.add('hl'); if (tt) tip(node, tt, tb, color); svg.append(node); (L[key] = L[key] || []).push(node); return node; };
    // trophoblast with primary villi
    const vil = []; for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, bump = 1 + (i % 4 === 0 ? .1 : 0) + R() * .02; vil.push([cx + Math.cos(a) * 372 * bump, cy + Math.sin(a) * 372 * bump]); }
    add('chorion', s('path', { d: smoothPath(vil, true, .4), fill: '#e45bd0' }), 'Syncytiotrophoblast', 'Outer trophoblast layer with <b>primary villi</b>.', '#e45bd0');
    add('chorion', s('circle', { cx, cy, r: 352, fill: '#c084fc' }), 'Cytotrophoblast', 'Inner trophoblast layer.', '#c084fc');
    add('chorion', s('circle', { cx, cy, r: 322, fill: '#f28c3a' }), 'Somatic extraembryonic mesoderm', 'Lines the cytotrophoblast. <b>Trophoblast + somatic mesoderm = chorion.</b>', '#f28c3a');
    svg.append(s('circle', { cx, cy, r: 298, fill: '#121831' }));
    const ccl = s('g', { class: 'hot' }); text(ccl, cx - 40, cy + 250, 'Chorionic cavity', { size: 26, fill: COL.fg2, anchor: 'middle' }); tip(ccl, 'Chorionic cavity', 'Extraembryonic coelom — formed by coalescing spaces in the extraembryonic mesoderm.', '#64d2ff'); svg.append(ccl);
    // connecting stalk
    add('stalk', s('path', { d: `M${cx - 40},${cy - 300} C${cx - 36},${cy - 230} ${cx - 50},${cy - 200} ${cx - 60},${cy - 160} L${cx + 60},${cy - 160} C${cx + 50},${cy - 200} ${cx + 36},${cy - 230} ${cx + 40},${cy - 300} Z`, fill: '#f28c3a' }), 'Connecting stalk', 'Extraembryonic mesoderm joining embryo to chorion → future <b>umbilical cord</b>.', '#f28c3a');
    // amnion (dome) with somatic mesoderm covering
    const dome = `M${cx - 150},${cy - 40} C${cx - 150},${cy - 200} ${cx + 150},${cy - 200} ${cx + 150},${cy - 40} Z`;
    add('amnion', s('path', { d: dome, fill: '#0f3a66', stroke: '#f28c3a', 'stroke-width': 26 }), 'Somatic mesoderm over the amnion', '<b>Amnioblasts + somatic mesoderm = amnion.</b>', '#f28c3a');
    add('amnion', s('path', { d: dome, fill: '#0f3a66', stroke: '#64d2ff', 'stroke-width': 10 }), 'Amnion & amniotic cavity', 'Amnioblasts line the amniotic cavity; its floor is the epiblast.', '#64d2ff');
    // disc
    add('disc', s('rect', { x: cx - 150, y: cy - 44, width: 300, height: 30, rx: 10, fill: '#2f7df0' }), 'Epiblast', 'Columnar layer — floor of the amniotic cavity.', '#4f9dff');
    add('disc', s('rect', { x: cx - 150, y: cy - 14, width: 300, height: 18, rx: 8, fill: '#f2b600' }), 'Hypoblast', 'Cuboidal layer — roof of the yolk sac.', '#ffcc33');
    // secondary yolk sac + splanchnic mesoderm
    add('yolk', s('path', { d: `M${cx - 140},${cy + 4} C${cx - 150},${cy + 230} ${cx + 150},${cy + 230} ${cx + 140},${cy + 4} Z`, fill: '#4a3a08', stroke: '#ff8a4a', 'stroke-width': 22 }), 'Splanchnic extraembryonic mesoderm', 'Covers the yolk sac.', '#ff8a4a');
    add('yolk', s('path', { d: `M${cx - 140},${cy + 4} C${cx - 150},${cy + 230} ${cx + 150},${cy + 230} ${cx + 140},${cy + 4} Z`, fill: '#4a3a08', stroke: '#ffd60a', 'stroke-width': 7 }), 'Secondary (definitive) yolk sac', 'Smaller sac lined by hypoblast-derived cells.', '#ffd60a');
    add('yolk', s('circle', { cx: cx + 150, cy: cy + 230, r: 28, fill: '#ffd60a', opacity: .8 }), 'Remnant of the exocoelomic cyst', 'Pinched-off remnant of the primary yolk sac.', '#ffd60a');
    // labels
    const lab = (x, y, t, c) => { const g = s('g'); g.append(s('circle', { cx: x - 14, cy: y - 8, r: 7, fill: c })); text(g, x, y, t, { size: 30, weight: 700 }); svg.append(g); return g; };
    lab(870, 120, 'Chorion', '#c084fc'); lab(10, 250, 'Amnion', '#64d2ff'); lab(10, 760, 'Yolk sac', '#ffd60a'); lab(640, 46, 'Connecting stalk', '#f28c3a');
    // highlight control
    const groups = { 0: null, 1: ['chorion'], 2: ['amnion', 'disc'], 3: ['yolk', 'disc'], 4: ['stalk'] };
    const ctrl = h('div', { class: 'ctrl', style: { left: '0px', bottom: '0px' } });
    ctrl.append(segmented(['All', 'Chorion', 'Amnion', 'Yolk sac', 'Stalk'], i => {
      const on = groups[i];
      Object.entries(L).forEach(([k, arr]) => arr.forEach(n => n.style.opacity = !on || on.includes(k) ? 1 : .14));
    }));
    el.append(ctrl);
    return {};
  }
};
