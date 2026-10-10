// LBW vs SGA: Hadlock (1991) estimated-fetal-weight percentiles; drag the baby or pick an example.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { svgPt, clamp } from '../ui.js';

// Hadlock 1991: ln(EFW) = 0.578 + 0.332·GA − 0.00354·GA², SD = 12.7 %
const mean = ga => Math.exp(0.578 + 0.332 * ga - 0.00354 * ga * ga);
const p10 = ga => mean(ga) * (1 - 1.2816 * .127), p90 = ga => mean(ga) * (1 + 1.2816 * .127);

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const X0 = 130, X1 = 1020, Y0 = 700, Y1 = 70, G0 = 24, G1 = 42, WMAX = 5000;
    const x = g => X0 + (g - G0) / (G1 - G0) * (X1 - X0), y = w => Y0 - w / WMAX * (Y0 - Y1);
    [0, 1000, 2000, 3000, 4000, 5000].forEach(v => { svg.append(s('line', { x1: X0, x2: X1, y1: y(v), y2: y(v), class: 'grid' })); text(svg, X0 - 16, y(v) + 8, v.toLocaleString(), { size: 22, anchor: 'end', fill: COL.fg3 }); });
    for (let g = 24; g <= 42; g += 2) text(svg, x(g), Y0 + 36, String(g), { size: 22, anchor: 'middle', fill: COL.fg3 });
    text(svg, (X0 + X1) / 2, Y0 + 74, 'Gestational age (weeks)', { size: 24, anchor: 'middle', fill: COL.fg2 });
    text(svg, X0 - 100, Y1 - 30, 'Estimated fetal weight (g)', { size: 22, fill: COL.fg2 });
    // SGA zone below 10th, curves
    let z = `M${x(G0)},${y(0)}`; for (let g = G0; g <= G1; g += .25) z += `L${x(g)},${y(p10(g))}`; z += `L${x(G1)},${y(0)}Z`;
    svg.append(s('path', { d: z, fill: '#ff5a6e', opacity: .1 }));
    const curve = (f, c, w, dash) => { let d = ''; for (let g = G0; g <= G1; g += .25) d += `${g === G0 ? 'M' : 'L'}${x(g)},${y(f(g))}`; svg.append(s('path', { d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': dash || '' })); };
    curve(p90, '#7c7c84', 3, '8 8'); curve(mean, '#b4b4bb', 4); curve(p10, '#ff5a6e', 5);
    text(svg, x(41.6), y(p90(41.6)) - 12, '90th', { size: 22, anchor: 'end', fill: COL.fg3 });
    text(svg, x(41.6), y(mean(41.6)) - 12, '50th', { size: 22, anchor: 'end', fill: COL.fg2 });
    text(svg, x(41.6), y(p10(41.6)) + 32, '10th', { size: 22, anchor: 'end', fill: '#ff5a6e' });
    // LBW line
    svg.append(s('line', { x1: X0, x2: X1, y1: y(2500), y2: y(2500), stroke: '#ff9f0a', 'stroke-width': 3, 'stroke-dasharray': '10 8' }));
    text(svg, X0 + 14, y(2500) - 14, 'LBW < 2,500 g', { size: 24, weight: 750, fill: '#ff9f0a' });
    // baby point
    const pt = s('g', { style: 'cursor:grab' });
    pt.append(s('circle', { r: 30, fill: 'rgba(255,255,255,.12)' }), s('circle', { r: 16, fill: '#fff', filter: 'url(#glow)' }));
    svg.append(pt);
    const ro = h('div', { class: 'readout', style: { right: '20px', top: '110px', minWidth: '330px' } }); el.append(ro);
    let GA = 39, WT = 2300, drag = false;
    function update() {
      pt.setAttribute('transform', `translate(${x(GA)},${y(WT)})`);
      const lbw = WT < 2500, c10 = p10(GA), c90 = p90(GA);
      const cent = WT < c10 ? ['SGA', '< 10th percentile', '#ff5a6e'] : WT > c90 ? ['> 90th', 'large for dates', '#b4b4bb'] : ['AGA', '10th–90th percentile', '#34d399'];
      ro.innerHTML = `<div class="rl">${GA.toFixed(0)} weeks · ${Math.round(WT).toLocaleString()} g</div>
        <div class="rv" style="color:${cent[2]}">${cent[0]}</div><div class="rs">${cent[1]}</div>
        <div class="rs" style="margin-top:14px">Low birth weight: <b style="color:${lbw ? '#ff9f0a' : '#34d399'}">${lbw ? 'Yes' : 'No'}</b></div>`;
    }
    const move = e => { const p = svgPt(svg, e); GA = clamp(G0 + (p.x - X0) / (X1 - X0) * (G1 - G0), 24, 42); WT = clamp((Y0 - p.y) / (Y0 - Y1) * WMAX, 400, 4900); update(); };
    pt.addEventListener('pointerdown', e => { drag = true; pt.setPointerCapture(e.pointerId); e.stopPropagation(); });
    pt.addEventListener('pointermove', e => { if (drag) move(e); });
    pt.addEventListener('pointerup', () => drag = false);
    pt.addEventListener('click', e => e.stopPropagation());
    // presets
    const P = [['Term · SGA + LBW', 39, 2300], ['Preterm · AGA but LBW', 32, 1900], ['Term · AGA', 39, 3300]];
    const bar = h('div', { class: 'ctrl', style: { left: '120px', bottom: '0px', gap: '12px' } });
    P.forEach(([t, g, w]) => { const b = h('button', { class: 'btn ghost', text: t, style: { fontSize: '22px', padding: '12px 20px' } }); b.onclick = e => { e.stopPropagation(); animTo(g, w); }; bar.append(b); });
    el.append(bar);
    let raf;
    function animTo(g, w) { const g0 = GA, w0 = WT, t0 = performance.now(); cancelAnimationFrame(raf); const st = now => { const k = Math.min(1, (now - t0) / 700), e = 1 - (1 - k) ** 3; GA = g0 + (g - g0) * e; WT = w0 + (w - w0) * e; update(); if (k < 1) raf = requestAnimationFrame(st); }; raf = requestAnimationFrame(st); }
    update();
    return { maxStep: 2, step(n, init) { const [, g, w] = P[n]; if (init) { GA = g; WT = w; update(); } else animTo(g, w); } };
  }
};
