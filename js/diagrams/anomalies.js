// Placental anomalies explorer: number, size, shape, thickness, penetration, cord attachment.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented, smoothPath, rng, Smooth, smooth, lerp, slider } from '../ui.js';

const CATS = [
  { k: 'Number', items: [['Double', 'Two separate placental discs.'], ['Triple', 'Three placental discs.'], ['Accessory (succenturiate)', 'A small accessory lobe connected to the main placenta by vessels running in the membranes.']] },
  { k: 'Size', items: [['Small', 'Abnormally small placenta.'], ['Large', 'Abnormally large placenta.']] },
  { k: 'Shape', items: [['Bilobed', 'Two lobes.'], ['Trilobed', 'Three lobes.'], ['Circumvallate', 'Thick ring of membranes (double fold of chorion & amnion) on the fetal surface; chorionic plate smaller than the decidual plate.'], ['Fenestrated', 'Contains a central defect.']] },
  { k: 'Thickness', items: [['Membranous (diffuse)', 'Thin placenta spread over a wide area of the membranes.']] },
  { k: 'Penetration', items: [['Accreta', 'Villi penetrate beyond the endometrium and attach to the myometrium.'], ['Increta', 'Villi invade into the myometrium.'], ['Percreta', 'Villi pass through the myometrium to the perimetrium (may invade the bladder).']] },
  { k: 'Cord insertion', items: [['Marginal (battledore)', 'Cord attached at the <b>margin</b> — like a badminton racquet.'], ['Velamentous', 'Cord inserts into the <b>membranes</b>; umbilical vessels run through the membranes to reach the placenta.']] }
];

export default {
  mount(el) {
    const svg = svgIn(el, 1680, 650);
    const R = rng(3);
    const stage = s('g', { transform: 'translate(560,40)' }); svg.append(stage);
    const title = text(svg, 1220, 120, '', { size: 46, weight: 800 });
    const desc = s('foreignObject', { x: 1220, y: 150, width: 440, height: 360 }); svg.append(desc);
    const dv = h('div', { style: { fontSize: '28px', lineHeight: '1.35', color: 'var(--fg-2)', fontWeight: 500 } }); desc.append(dv);
    const note = text(svg, 1220, 560, '', { size: 24, weight: 700, fill: '#ff9f0a' });
    const disc = (cx, cy, r, ex = {}) => {
      const pts = []; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, k = 1 + (ex.wob || .03) * Math.sin(a * 5 + (ex.ph || 0)); pts.push([cx + Math.cos(a) * r * k * (ex.sx || 1), cy + Math.sin(a) * r * k]); }
      const g = s('g');
      g.append(s('path', { d: smoothPath(pts, true), fill: ex.fill || '#8a2a40', stroke: '#c95a72', 'stroke-width': 4 }));
      if (!ex.noVessels) for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .3; g.append(s('path', { d: `M${cx + (ex.ix || 0)},${cy + (ex.iy || 0)} Q${cx + Math.cos(a + .3) * r * .5},${cy + Math.sin(a + .3) * r * .5} ${cx + Math.cos(a) * r * .85},${cy + Math.sin(a) * r * .85}`, stroke: i % 2 ? '#3d8bff' : '#ff453a', 'stroke-width': 5, fill: 'none', opacity: .8 })); }
      return g;
    };
    const cord = (x, y, x2 = 260, y2 = 560) => s('path', { d: `M${x},${y} C${x - 60},${y + 80} ${x2 + 60},${y2 - 80} ${x2},${y2}`, stroke: '#f3c9c0', 'stroke-width': 26, fill: 'none', 'stroke-linecap': 'round' });
    function drawShape(cat, i) {
      stage.innerHTML = '';
      const add = n => stage.append(n);
      const C = [320, 280];
      if (cat === 'Number') {
        if (i === 0) { add(disc(190, 270, 150)); add(disc(460, 270, 150, { ph: 2 })); }
        if (i === 1) { add(disc(170, 200, 120)); add(disc(430, 200, 120, { ph: 1 })); add(disc(300, 420, 120, { ph: 3 })); }
        if (i === 2) { add(s('path', { d: 'M300,280 Q470,140 560,140', stroke: '#ff453a', 'stroke-width': 5, fill: 'none', 'stroke-dasharray': '10 8' })); add(disc(280, 300, 200)); add(disc(570, 130, 70, { ph: 1 })); }
        add(cord(i === 2 ? 280 : 300, 300));
      }
      if (cat === 'Size') { add(disc(C[0], C[1], i ? 250 : 120)); add(cord(C[0], C[1])); }
      if (cat === 'Shape') {
        if (i === 0) { add(disc(200, 280, 160)); add(disc(450, 280, 160, { ph: 2 })); add(cord(325, 280)); }
        if (i === 1) { add(disc(190, 220, 140)); add(disc(440, 220, 140, { ph: 2 })); add(disc(315, 430, 140, { ph: 4 })); add(cord(315, 300)); }
        if (i === 2) { add(disc(C[0], C[1], 240)); add(s('circle', { cx: C[0], cy: C[1], r: 175, fill: 'none', stroke: '#f2e6ea', 'stroke-width': 26, opacity: .85 })); add(cord(C[0], C[1])); }
        if (i === 3) { add(disc(C[0], C[1], 240)); add(s('ellipse', { cx: C[0] + 20, cy: C[1] - 10, rx: 70, ry: 55, fill: '#000' })); add(cord(C[0] - 120, C[1] + 60)); }
      }
      if (cat === 'Thickness') { add(disc(C[0], C[1], 290, { fill: 'rgba(138,42,64,.45)', sx: 1.25 })); add(cord(C[0], C[1])); }
      if (cat === 'Cord insertion') {
        if (i === 0) { add(disc(C[0], C[1], 230, { ix: 200, iy: 80 })); add(cord(C[0] + 215, C[1] + 85, 560, 600)); }
        if (i === 1) { add(s('ellipse', { cx: C[0] + 40, cy: C[1], rx: 330, ry: 260, fill: 'rgba(255,255,255,.05)', stroke: 'rgba(255,255,255,.25)', 'stroke-width': 3, 'stroke-dasharray': '8 8' })); add(disc(C[0] - 40, C[1], 190, { noVessels: true })); for (let k = 0; k < 4; k++) add(s('path', { d: `M${C[0] + 300},${C[1] + 120} Q${C[0] + 160},${C[1] + 40 + k * 30} ${C[0] + 100},${C[1] - 60 + k * 50}`, stroke: k % 2 ? '#3d8bff' : '#ff453a', 'stroke-width': 6, fill: 'none' })); add(cord(C[0] + 300, C[1] + 120, 580, 600)); }
      }
      if (cat === 'Penetration') {
        // uterine wall layers + villi depth
        const L = [['Decidua / endometrium', '#c96a85', 120], ['Myometrium', '#8a3a52', 200], ['Perimetrium', '#e6b0bf', 30], ['Bladder', '#e8d36a', 90]];
        let y = 120; L.forEach(([n, c, hh]) => { add(s('rect', { x: 0, y, width: 640, height: hh, fill: c })); add(text(s('g'), 0, 0, '')); const t = text(stage, 650, y + hh / 2 + 9, n, { size: 22, weight: 650 }); y += hh; });
        add(s('rect', { x: 0, y: 40, width: 640, height: 80, fill: '#c084fc', opacity: .7 }));
        text(stage, 650, 88, 'Placenta (villi)', { size: 22, weight: 650 });
        const depth = [160, 300, 470][i];
        for (let k = 0; k < 9; k++) { const xx = 40 + k * 70; add(s('path', { d: `M${xx},118 C${xx - 12},${118 + depth * .4} ${xx + 14},${118 + depth * .7} ${xx},${118 + depth}`, stroke: '#d8b4fe', 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round' })); }
      }
    }
    let ci = 0, ii = 0, subSeg;
    const subWrap = h('div', { class: 'ctrl', style: { left: '560px', bottom: '0px' } }); el.append(subWrap);
    function show(c, i = 0) {
      ci = c; ii = i;
      const C = CATS[c];
      drawShape(C.k, i);
      title.textContent = C.items[i][0]; dv.innerHTML = C.items[i][1];
      note.textContent = C.k === 'Penetration' ? '⚠ Fails to separate → severe postpartum haemorrhage' : C.k === 'Cord insertion' && i === 1 ? 'Vessels in the membranes are unprotected' : '';
      subWrap.innerHTML = '';
      subSeg = segmented(C.items.map(x => x[0]), j => show(ci, j), { value: i }); subWrap.append(subSeg);
    }
    const catSeg = segmented(CATS.map(c => c.k), c => show(c, 0), { vertical: true });
    const ctrl = h('div', { class: 'ctrl', style: { left: '0px', top: '20px' } }); ctrl.append(catSeg); el.append(ctrl);
    show(0, 0);
    const site = h('button', { class: 'btn ghost', text: 'Site → placenta previa', style: { fontSize: '22px', padding: '12px 22px', marginTop: '14px' } });
    site.onclick = e => { e.stopPropagation(); const slides = [...document.querySelectorAll('#stage .slide')]; const k = slides.findIndex(x => x.dataset.title === 'Abnormal implantation'); if (k >= 0) window.__deck.go(k, { dir: -1 }); };
    ctrl.style.flexDirection = 'column'; ctrl.style.alignItems = 'flex-start'; ctrl.append(site);
    return { maxStep: 0 };
  }
};
