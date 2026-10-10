// Five placental functions + hormone timing (when each hormone is produced — not concentrations).
import { svgIn, text, COL, s, tip, h } from './_kit.js';

const FN = [
  ['Respiration', 'O₂ / CO₂ by simple diffusion', '#64d2ff', 'Gas exchange: oxygen and carbon dioxide cross by <b>simple diffusion</b>.', '<path d="M38 14v26M38 40c-6 0-18 6-18 22 0 6 4 8 8 8 6 0 10-8 10-16M38 40c6 0 18 6 18 22 0 6-4 8-8 8-6 0-10-8-10-16"/>'],
  ['Nutrition', 'Electrolytes · amino & fatty acids · sugars · vitamins', '#34d399', 'Passage of electrolytes and nutrients — amino acids, fatty acids, carbohydrates, vitamins.', '<path d="M38 66c-14 0-22-12-22-24 0-14 10-20 22-20s22 6 22 20c0 12-8 24-22 24z"/><path d="M38 22c0-6 4-10 10-12"/>'],
  ['Excretion', 'Replaces the kidney', '#ffcc33', 'Removes fetal waste products — it <b>replaces kidney function</b>.', '<path d="M30 16c-10 2-14 14-12 26s10 22 18 20 6-14 2-20-2-10 2-14-2-14-10-12zM46 16c10 2 14 14 12 26s-10 22-18 20"/>'],
  ['Protection', 'Maternal antibodies → passive immunity', '#a78bfa', 'Transmits maternal antibodies → <b>passive immunity</b> for the newborn.', '<path d="M38 10l24 8v18c0 16-10 26-24 32C24 62 14 52 14 36V18z"/>'],
  ['Hormones', 'hCG first · then steroid & peptide hormones', '#ff6fae', 'See the timeline below.', '<circle cx="38" cy="38" r="12"/><path d="M38 10v8M38 58v8M10 38h8M58 38h8M18 18l6 6M52 52l6 6M18 58l6-6M52 24l6-6"/>']
];

export default {
  mount(el) {
    const wrap = h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', gap: '26px' } });
    const row = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '22px' } });
    FN.forEach(([t, p, c, tb, ic]) => { const card = h('div', { class: 'card hot', style: { '--cc': c, padding: '30px 28px' } }); card.innerHTML = `<svg class="ic" viewBox="0 0 76 76" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 10px ${c}88)">${ic}</svg><h3 style="font-size:38px">${t}</h3><p style="font-size:24px">${p}</p>`; tip(card, t, tb, c); row.append(card); });
    wrap.append(row);
    // timeline
    const tl = h('div', { style: { flex: '1', position: 'relative' } }); wrap.append(tl);
    const svg = svgIn(tl, 1680, 300);
    const X0 = 260, X1 = 1640, x = m => X0 + m / 9 * (X1 - X0);
    for (let m = 0; m <= 9; m++) { svg.append(s('line', { x1: x(m), x2: x(m), y1: 20, y2: 270, class: 'grid' })); if (m) text(svg, x(m - .5), 296, `M${m}`, { size: 20, anchor: 'middle', fill: COL.fg3 }); }
    const H = [
      ['hCG', 0, 2, '#ff6fae', 'Human chorionic gonadotropin — secreted by the <b>syncytiotrophoblast</b> in the first 2 months.'],
      ['Progesterone', 4, 9, '#ff9f0a', 'Produced by the placenta by the <b>end of month 4</b>.'],
      ['Estrogen (estriol)', 4, 9, '#ffcc33', 'Produced by the placenta by the end of month 4.'],
      ['Somatomammotropin', 4, 9, '#34d399', 'Placental somatomammotropin — by the end of month 4.'],
      ['Relaxin', 4, 9, '#64d2ff', 'Softens the pelvic ligaments (lecture lists it as placental).']
    ];
    H.forEach(([n, a, b, c, tb], i) => {
      const y = 30 + i * 48, g = s('g', { class: 'hot' });
      text(g, X0 - 20, y + 26, n, { size: 25, weight: 700, anchor: 'end' });
      const r = s('rect', { x: x(a), y: y + 4, width: 0, height: 30, rx: 15, fill: c, opacity: .85 }); g.append(r);
      tip(g, n, tb, c); svg.append(g); r.dataset.w = x(b) - x(a);
    });
    svg.append(s('line', { x1: x(4), x2: x(4), y1: 10, y2: 270, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '6 6' }));
    text(svg, x(4) + 10, 20, 'End of month 4', { size: 20, fill: COL.fg2 });
    el.append(wrap);
    return {
      enter() { [...svg.querySelectorAll('rect[data-w]')].forEach((r, i) => { r.setAttribute('width', 0); r.style.transition = 'none'; requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transition = `width 1.1s cubic-bezier(.22,.8,.2,1) ${i * .12}s`; r.setAttribute('width', r.dataset.w); })); }); }
    };
  }
};
