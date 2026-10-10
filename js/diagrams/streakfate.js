// Primitive streak regresses by the end of week 4; defects linked to gastrulation (Langman self-study page).
import { h, s, tip, text, svgIn, COL } from './_kit.js';

export default {
  mount(el) {
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: '520px 1fr 1fr 1fr', gap: '28px', height: '100%', alignItems: 'stretch' } });
    // animated disc
    const panel = h('div', { class: 'card', style: { '--cc': '#4f9dff', padding: '24px', display: 'flex', flexDirection: 'column' } });
    const holder = h('div', { style: { flex: '1', position: 'relative' } });
    panel.append(holder); grid.append(panel);
    const svg = svgIn(holder, 480, 520);
    svg.append(s('ellipse', { cx: 240, cy: 250, rx: 150, ry: 210, fill: '#173a7a', stroke: 'rgba(255,255,255,.25)', 'stroke-width': 3 }));
    const streak = s('line', { x1: 240, x2: 240, stroke: '#7cb6ff', 'stroke-width': 16, 'stroke-linecap': 'round' }); svg.append(streak);
    const node = s('circle', { cx: 240, r: 15, fill: '#7cb6ff' }); svg.append(node);
    const remnant = s('circle', { cx: 240, cy: 448, r: 0, fill: '#ff9f0a', filter: 'url(#glow)' }); svg.append(remnant);
    const wk = text(svg, 240, 506, '', { size: 30, weight: 750, anchor: 'middle' });
    // cards
    const CARDS = [
      { t: 'Sacro\u00adcoccygeal teratoma', p: 'Streak remnant persists', c: '#ff9f0a', tb: 'Remnants of the primitive streak persist in the sacrococcygeal region and proliferate into tumours containing tissues from <b>all three germ layers</b>. <b>Most common tumour in newborns</b> (~1 in 37,000), more common in females; may become malignant.' },
      { t: 'Caudal dysgenesis', p: 'Sirenomelia · too little caudal mesoderm', c: '#ff5a6e', tb: 'Insufficient mesoderm in the caudal-most embryo → hypoplasia/fusion of lower limbs, vertebral anomalies, renal agenesis, imperforate anus, genital anomalies. Associated with <b>maternal diabetes</b> (BRACHYURY/T, WNT, ENGRAILED in mice).' },
      { t: 'Holo\u00adprosen\u00adcephaly', p: 'Alcohol hits the anterior midline', c: '#a78bfa', tb: 'High-dose alcohol at this stage kills cells in the anterior midline → small forebrain, single ventricle, <b>hypotelorism</b>. Happens ~2 weeks after fertilization (~4 weeks after LMP) — often before pregnancy is recognised.' }
    ];
    CARDS.forEach(c => {
      const card = h('div', { class: 'card hot', style: { '--cc': c.c, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' } });
      card.innerHTML = `<div class="tag">Week 3</div><div style="flex:1;display:grid;place-items:center"><div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #fff8, ${c.c} 45%, #0000 72%);box-shadow:0 0 60px ${c.c}66"></div></div><h3>${c.t}</h3><p>${c.p}</p>`;
      tip(card, c.t, c.tb, c.c);
      grid.append(card);
    });
    el.append(grid);
    let raf, t0;
    const tick = now => {
      const t = ((now - t0) / 1000) % 7, k = Math.min(1, Math.max(0, (t - 1) / 4));    // 0 = week 3 · 1 = end of week 4
      const top = 210 + k * 200, len = 220 * (1 - k);
      streak.setAttribute('y1', top); streak.setAttribute('y2', top + len); streak.setAttribute('opacity', 1 - k * .9);
      node.setAttribute('cy', top - 6); node.setAttribute('opacity', 1 - k);
      remnant.setAttribute('r', k > .95 ? 10 * Math.sin((t - 5) * 2) ** 2 + 4 : 0);
      wk.textContent = k < .5 ? 'Week 3 · streak makes mesoderm' : k < 1 ? 'Week 4 · streak regresses' : 'End of week 4 · gone';
      raf = requestAnimationFrame(tick);
    };
    return { enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
