// Placenta in section: chorionic plate, villous trees, septa, decidua basalis — with maternal & fetal blood flow.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented, rng } from '../ui.js';

export default {
  mount(el, opts = {}) {
    const flow = opts.mode === 'flow';
    const svg = svgIn(el, 1060, 880);
    const R = rng(17);
    const TOP = 150, BASE = 700;
    // intervillous space (maternal blood) + decidua + myometrium
    const ivs = s('rect', { x: 20, y: TOP, width: 1020, height: BASE - TOP, fill: '#3d0a17', class: 'hot' }); svg.append(ivs);
    tip(ivs, 'Intervillous space', 'Filled with <b>maternal blood</b> (≈150 mL at term) from 80–100 eroded spiral arteries; the spaces communicate with each other. Lined by syncytium.', '#ff453a');
    const dec = s('rect', { x: 20, y: BASE, width: 1020, height: 90, fill: '#8a3a52', class: 'hot' }); svg.append(dec);
    tip(dec, 'Decidua basalis', '<b>Maternal part</b> of the placenta.', '#ff5a6e');
    svg.append(s('rect', { x: 20, y: BASE + 90, width: 1020, height: 70, fill: '#5e2236' }));
    const myo = text(svg, 40, BASE + 136, 'Myometrium', { size: 22, fill: COL.fg3 });
    // septa (incomplete)
    [350, 710].forEach(xs => { const g = s('path', { d: `M${xs - 46},${BASE} L${xs - 8},${BASE - 330} Q${xs},${BASE - 350} ${xs + 8},${BASE - 330} L${xs + 46},${BASE} Z`, fill: '#8a3a52', class: 'hot' }); tip(g, 'Placental (decidual) septum', 'Incomplete wall projecting from the decidua into the intervillous space, separating <b>cotyledons</b> (15–20).', '#ff5a6e'); svg.append(g); });
    // chorionic plate
    const cp = s('rect', { x: 20, y: TOP - 46, width: 1020, height: 52, rx: 8, fill: '#9d6fd6', class: 'hot' }); svg.append(cp);
    tip(cp, 'Chorionic plate', 'Fetal side of the placenta (covered by amnion) — carries the chorionic vessels.', '#c084fc');
    // villous trees
    const trees = [], paths = [];
    function branch(x, y, ang, len, w, depth, chain, anchor) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      trees.push([x, y, x2, y2, w]);
      const c = chain.concat([[x2, y2]]);
      if (depth === 0 || (anchor && y2 >= BASE - 4)) { paths.push(c); return; }
      const n = anchor ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const isAnchor = anchor && i === 0;
        const a = isAnchor ? Math.PI / 2 + (R() - .5) * .3 : ang + (i % 2 ? 1 : -1) * (.5 + R() * .5);
        const L = isAnchor ? Math.min(len, (BASE - y2) / Math.max(.3, Math.sin(a))) : len * (.55 + R() * .2);
        branch(x2, y2, a, L, w * .72, isAnchor ? depth : depth - 1, c, isAnchor);
      }
    }
    [180, 530, 880].forEach((x0, k) => branch(x0, TOP, Math.PI / 2 + (R() - .5) * .2, 150, 34, 3, [[x0, TOP]], true));
    const tg = s('g'); svg.append(tg);
    trees.forEach(([x1, y1, x2, y2, w]) => tg.append(s('line', { x1, y1, x2, y2, stroke: '#7d3f9a', 'stroke-width': w + 6, 'stroke-linecap': 'round' })));
    trees.forEach(([x1, y1, x2, y2, w]) => tg.append(s('line', { x1, y1, x2, y2, stroke: '#cf86e0', 'stroke-width': w, 'stroke-linecap': 'round' })));
    trees.forEach(([x1, y1, x2, y2, w]) => { if (w > 9) { tg.append(s('line', { x1: x1 - w * .18, y1, x2: x2 - w * .18, y2, stroke: '#3d8bff', 'stroke-width': Math.max(2, w * .16), 'stroke-linecap': 'round', opacity: .9 }), s('line', { x1: x1 + w * .18, y1, x2: x2 + w * .18, y2, stroke: '#ff453a', 'stroke-width': Math.max(2, w * .16), 'stroke-linecap': 'round', opacity: .9 })); } });
    const vg = s('g', { class: 'hot' }); vg.append(s('rect', { x: 500, y: TOP, width: 60, height: BASE - TOP, fill: 'transparent' })); svg.append(vg);
    tip(vg, 'Villi (chorion frondosum)', '<b>Anchoring</b> (stem) villi reach the decidua basalis; <b>free</b> (nourishing) villi float in the intervillous space. Fetal capillaries inside — microvilli give 4–14 m² of surface.', '#cf86e0');
    // spiral arteries & veins
    const arts = [120, 260, 450, 620, 800, 960], veins = [200, 400, 560, 760, 900];
    arts.forEach(x => { const g = s('path', { d: `M${x},${BASE + 150} q-20,-20 0,-40 q20,-20 0,-40 q-20,-20 0,-40 L${x},${BASE}`, stroke: '#ff453a', 'stroke-width': 9, fill: 'none', class: 'hot' }); tip(g, 'Spiral artery', 'Arterial blood at <b>higher pressure</b> spurts into the intervillous space (80–100 spiral arteries).', '#ff453a'); svg.append(g); });
    veins.forEach(x => { const g = s('path', { d: `M${x},${BASE} L${x},${BASE + 150}`, stroke: '#3d8bff', 'stroke-width': 10, fill: 'none', class: 'hot' }); tip(g, 'Endometrial vein', 'Deoxygenated blood returns at <b>lower pressure</b> to the maternal circulation, carrying fetal CO₂ and waste.', '#3d8bff'); svg.append(g); });
    // umbilical vessels into the chorionic plate
    const um = s('g', { class: 'hot' });
    um.append(s('path', { d: 'M500,0 L500,108', stroke: '#3d8bff', 'stroke-width': 12 }), s('path', { d: 'M560,0 L560,108', stroke: '#3d8bff', 'stroke-width': 12 }), s('path', { d: 'M530,0 L530,108', stroke: '#ff453a', 'stroke-width': 18 }));
    tip(um, 'Umbilical vessels', '<b>2 arteries</b> bring fetal blood (CO₂, waste) to the villi; <b>1 vein</b> returns O₂- and nutrient-rich blood to the fetus.', '#ff453a');
    svg.append(um);
    // labels
    const lab = (x, y, t, c, a = 'start') => { const g = s('g'); g.append(s('rect', { x: a === 'end' ? x - t.length * 14 - 40 : x - 14, y: y - 30, width: t.length * 14 + 54, height: 44, rx: 22, fill: 'rgba(18,18,22,.78)', stroke: 'rgba(255,255,255,.2)' }), s('circle', { cx: a === 'end' ? x - t.length * 14 - 18 : x + 6, cy: y - 8, r: 7, fill: c })); text(g, a === 'end' ? x : x + 22, y, t, { size: 24, weight: 650, anchor: a }); svg.append(g); return g; };
    lab(40, 92, 'Chorionic plate', '#c084fc'); lab(600, 60, 'Umbilical vessels', '#ff453a');
    lab(40, 640, 'Intervillous space', '#ff453a'); lab(1030, 360, 'Stem villus', '#cf86e0', 'end');
    lab(330, 400, 'Septum', '#ff5a6e'); lab(40, BASE + 60, 'Decidua basalis', '#ff5a6e');
    if (flow) { lab(1030, BASE + 60, 'Spiral artery ↑ · vein ↓', '#ff453a', 'end'); }
    // ---- particles ----
    const P = s('g'); svg.append(P);
    const M = [], F = [];
    for (let i = 0; i < 90; i++) {
      const a = arts[i % arts.length], v = veins.reduce((b, x) => Math.abs(x - a) < Math.abs(b - a) ? x : b, veins[0]) + (R() - .5) * 20;
      const peak = [a + (R() - .5) * 220, TOP + 60 + R() * 260];
      const e = s('circle', { r: 6, fill: '#ff5a5a' }); P.append(e);
      M.push({ e, a, v, peak, d: R(), sp: .12 + R() * .08 });
    }
    for (let i = 0; i < 70; i++) {
      const path = paths[i % paths.length]; const e = s('circle', { r: 5 }); P.append(e);
      F.push({ e, path, d: R(), down: i % 2 === 0, sp: .1 + R() * .06 });
    }
    const along = (pts, f) => { const segs = pts.length - 1, t = f * segs, i = Math.min(segs - 1, Math.floor(t)), u = t - i; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; };
    let showM = flow, showF = flow;
    if (flow) {
      const seg = segmented(['Both', 'Maternal', 'Fetal'], i => { showM = i !== 2; showF = i !== 1; });
      const ctrl = h('div', { class: 'ctrl', style: { right: '0px', bottom: '-6px' } }); ctrl.append(seg); el.append(ctrl);
    }
    let raf, t0;
    const tick = now => {
      const t = (now - t0) / 1000;
      M.forEach(o => {
        const f = (t * o.sp + o.d) % 1;
        let x, y;
        if (f < .45) { const u = f / .45, e = 1 - (1 - u) ** 2; x = o.a + (o.peak[0] - o.a) * e * .8; y = BASE - (BASE - o.peak[1]) * e; }
        else { const u = (f - .45) / .55; x = o.peak[0] * .8 + o.a * .2 + (o.v - (o.peak[0] * .8 + o.a * .2)) * u; y = o.peak[1] + (BASE - o.peak[1]) * u * u; }
        o.e.setAttribute('cx', x); o.e.setAttribute('cy', y);
        o.e.setAttribute('fill', f < .45 ? '#ff6a6a' : '#8a6cff');
        o.e.setAttribute('opacity', showM ? .85 : 0);
      });
      F.forEach(o => {
        const f = (t * o.sp + o.d) % 1, [x, y] = along(o.path, o.down ? f : 1 - f);
        o.e.setAttribute('cx', x + (o.down ? -4 : 4)); o.e.setAttribute('cy', y);
        o.e.setAttribute('fill', o.down ? '#5aa2ff' : '#ff5a5a');
        o.e.setAttribute('opacity', showF ? .95 : 0);
      });
      raf = requestAnimationFrame(tick);
    };
    svg.append(myo);
    return { enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
