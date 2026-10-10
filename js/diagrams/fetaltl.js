// Fetal milestones month by month, with Table 8.2 developmental horizons and Table 8.1 size at the cursor.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { Smooth, clamp, lerp, svgPt } from '../ui.js';

const W0 = 7, W1 = 40;
const MONTHS = [
  [9, 17, 'Months 3–4', '#64d2ff', ['Face more human-like', 'Limbs lengthen', 'Wk 12: primary ossification centres', 'Wk 12: sex visible on ultrasound']],
  [18, 22, 'Month 5', '#34d399', ['Lanugo hair', 'Eyebrows & head hair', 'Quickening — mother feels movement']],
  [23, 26, 'Month 6', '#ffcc33', ['Skin reddish & thin — little fat', 'Born now: great difficulty surviving', 'Respiratory system & CNS immature']],
  [27, 30, 'Month 7', '#ff9f0a', ['26–28 wk: CRL ≈ 25 cm, ≈ 1,100 g', '90% chance of surviving']],
  [31, 40, 'Last 2 months', '#ff6fae', ['Subcutaneous fat → rounded contours', 'Vernix caseosa covers the skin at term']]
];
const HOR = [[7, 'Taste buds'], [10, 'Swallowing'], [15, 'Respiratory movements', '14–16'], [24, 'Sucking'], [25, 'Some sounds heard', '24–26'], [28, 'Eyes sensitive to light']];
const T81 = [[9, 12, '5–8 cm', '10–45 g'], [13, 16, '9–14 cm', '60–200 g'], [17, 20, '15–19 cm', '250–450 g'], [21, 24, '20–23 cm', '500–820 g'], [25, 28, '24–27 cm', '900–1,300 g'], [29, 32, '28–30 cm', '1,400–2,100 g'], [33, 36, '31–34 cm', '2,200–2,900 g'], [37, 38, '35–36 cm', '3,000–3,400 g']];

export default {
  mount(el) {
    const svg = svgIn(el, 1680, 640);
    const X0 = 70, X1 = 1610, AY = 330;
    const x = w => X0 + (w - W0) / (W1 - W0) * (X1 - X0);
    // month blocks (bands)
    const cards = MONTHS.map(([a, b, t, c]) => { const r = s('rect', { x: x(a - .5), y: AY - 26, width: x(b + .5) - x(a - .5), height: 52, rx: 14, fill: c, opacity: .22 }); svg.append(r); text(svg, (x(a - .5) + x(b + .5)) / 2, AY + 9, t, { size: 22, weight: 750, anchor: 'middle' }); return r; });
    for (let w = 8; w <= 40; w += 4) text(svg, x(w), AY + 66, String(w), { size: 21, anchor: 'middle', fill: COL.fg3 });
    text(svg, X1, AY + 100, 'weeks', { size: 21, anchor: 'end', fill: COL.fg3 });
    // developmental horizons (Table 8.2)
    HOR.forEach(([w, t, lab], i) => {
      const g = s('g', { class: 'hot' }), y = AY + 140 + (i % 2) * 64;
      g.append(s('line', { x1: x(w), x2: x(w), y1: AY + 28, y2: y - 26, stroke: 'rgba(255,255,255,.25)', 'stroke-width': 2, 'stroke-dasharray': '4 6' }), s('circle', { cx: x(w), cy: AY + 28, r: 7, fill: '#a78bfa' }));
      text(g, x(w), y, t, { size: 23, weight: 650, anchor: 'middle' });
      text(g, x(w), y + 26, `${lab || w} wk`, { size: 19, anchor: 'middle', fill: '#a78bfa' });
      tip(g, t, `Table 8.2 developmental horizon: <b>${lab || w} weeks</b>.`, '#a78bfa');
      svg.append(g);
    });
    text(svg, X0, AY + 270, 'Table 8.2 · developmental horizons', { size: 20, fill: COL.fg3 });
    // detail panel (top)
    const panel = s('g'); svg.append(panel);
    const pT = text(panel, X0, 70, '', { size: 46, weight: 800 });
    const pItems = [0, 1, 2, 3].map(i => text(panel, X0 + (i % 2) * 720, 130 + Math.floor(i / 2) * 48, '', { size: 30, weight: 600, fill: COL.fg2 }));
    const size = text(svg, X1, 70, '', { size: 30, weight: 750, anchor: 'end' });
    const size2 = text(svg, X1, 110, '', { size: 24, anchor: 'end', fill: COL.fg2 });
    // scrubber
    const knob = s('g', { style: 'cursor:ew-resize' });
    knob.append(s('line', { y1: AY - 70, y2: AY + 30, stroke: '#fff', 'stroke-width': 3 }), s('circle', { cy: AY - 78, r: 20, fill: '#fff' }), s('circle', { cy: AY - 78, r: 7, fill: '#000' }));
    svg.append(knob);
    const hit = s('rect', { x: X0, y: AY - 110, width: X1 - X0, height: 170, fill: 'transparent', style: 'cursor:ew-resize' }); svg.append(hit);
    const Wk = new Smooth(12, 5);
    let drag = false;
    const setFromEvt = e => { const p = svgPt(svg, e); Wk.set(clamp(W0 + (p.x - X0) / (X1 - X0) * (W1 - W0), 9, 40)); };
    hit.addEventListener('pointerdown', e => { drag = true; hit.setPointerCapture(e.pointerId); setFromEvt(e); e.stopPropagation(); });
    hit.addEventListener('pointermove', e => { if (drag) setFromEvt(e); });
    hit.addEventListener('pointerup', () => drag = false);
    hit.addEventListener('click', e => e.stopPropagation());
    let cur = -1, raf;
    const tick = () => {
      const w = Wk.step(1 / 60);
      knob.setAttribute('transform', `translate(${x(w)},0)`);
      const k = MONTHS.findIndex(m => w >= m[0] - .5 && w <= m[1] + .5);
      if (k !== cur && k >= 0) {
        cur = k; const m = MONTHS[k];
        pT.textContent = m[2]; pT.setAttribute('fill', m[3]);
        pItems.forEach((t, i) => t.textContent = m[4][i] ? '• ' + m[4][i] : '');
        cards.forEach((c, i) => c.setAttribute('opacity', i === k ? .55 : .18));
      }
      const r = T81.find(r => w >= r[0] - .5 && w <= r[1] + .5);
      size.textContent = `Week ${Math.round(w)}`; size2.textContent = r ? `CRL ${r[2]} · ${r[3]} (Table 8.1)` : '';
      raf = requestAnimationFrame(tick);
    };
    const stops = [12, 20, 24, 28, 36];
    return { maxStep: 4, enter() { cur = -1; raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); }, step(n, init) { Wk.set(stops[n]); if (init) Wk.jump(stops[n]); } };
  }
};
