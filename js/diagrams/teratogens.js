// Teratogen explorer: pick an agent → target organs light up on a newborn silhouette.
import { svgIn, text, COL, s, tip, h } from './_kit.js';

const ORG = { brain: [300, 120], eye: [262, 150], ear: [352, 160], face: [300, 190], heart: [318, 330], limbs: [150, 360], skin: [430, 420], spine: [300, 470], growth: [300, 600], caudal: [300, 560], teeth: [300, 214] };
const GROUPS = [
  { g: 'Infections', c: '#ff5a6e', items: [
    ['Rubella', ['eye', 'heart', 'ear', 'brain', 'teeth'], 'Congenital rubella: <b>cataracts</b>, glaucoma, heart defects (<b>PDA</b>), <b>hearing loss</b>, microcephaly, tooth abnormalities. Classical triad: cataract · cardiac · deafness. Vaccination has nearly eliminated it.'],
    ['Cytomegalovirus', ['brain', 'ear', 'eye'], 'Mother often symptom-free; <b>microcephaly</b>, sometimes fatal. Some normal at birth but later hearing loss, visual impairment, intellectual disability.'],
    ['Herpes simplex', ['eye', 'brain'], 'Rarely (embryonic period): microphthalmia, microcephaly, retinal dysplasia. Usually transmitted <b>during delivery</b> → severe neonatal illness.'],
    ['Varicella (chickenpox)', ['skin', 'limbs', 'eye', 'brain'], 'Skin scarring, limb hypoplasia, eye & CNS defects. Infection <b>&lt;13 wk: 0.4%</b> malformed · <b>13–20 wk: 2%</b>. At labour → fatal neonatal meningoencephalitis.'],
    ['Zika', ['brain'], 'Congenital Zika syndrome: <b>microcephaly</b>.'],
    ['Toxoplasmosis', ['brain', 'eye', 'ear'], 'Undercooked meat, cat faeces. <b>Cerebral calcifications</b> and <b>hydrocephalus</b>; later visual/hearing loss, seizures, intellectual disability.']
  ] },
  { g: 'Physical', c: '#64d2ff', items: [
    ['X-rays', ['brain', 'spine', 'face', 'limbs'], 'Microcephaly, spina bifida, cleft palate, limb defects.'],
    ['Hyperthermia', ['brain', 'spine'], 'Anencephaly, spina bifida, intellectual disability.']
  ] },
  { g: 'Drugs & chemicals', c: '#ff9f0a', items: [
    ['Thalidomide', ['limbs', 'heart'], 'Limb defects (<b>phocomelia</b>) and heart malformations.'],
    ['Phenytoin', ['face', 'brain'], 'Fetal hydantoin syndrome: facial defects, intellectual disability.'],
    ['Valproic acid', ['spine', 'heart', 'face', 'limbs'], 'Fetal valproate syndrome: <b>NTDs</b>; heart, craniofacial and limb anomalies.'],
    ['Isotretinoin (vit A)', ['ear', 'face', 'heart'], 'Isotretinoin embryopathy: small abnormal ears, mandibular hypoplasia, cleft palate, heart defects.'],
    ['Alcohol', ['face', 'brain', 'heart', 'growth'], 'FAS: IUGR, short palpebral fissures, maxillary hypoplasia, indistinct philtrum, thin upper lip, heart defects, intellectual disability (FASD spectrum incl. ARND).'],
    ['Organic mercury', ['brain'], 'Neurological symptoms resembling cerebral palsy.'],
    ['Lead', ['growth', 'brain'], 'Growth retardation, neurological disorders.']
  ] },
  { g: 'Maternal & nutrition', c: '#a78bfa', items: [
    ['Diabetes mellitus', ['spine', 'heart', 'caudal', 'growth'], 'Risk of anomalies <b>3–4×</b>: NTDs, congenital heart defects, <b>caudal dysgenesis (sirenomelia)</b>; stillbirths, large infants. Glucose may affect <b>BRACHYURY</b>. Strict glucose control before conception reduces risk.'],
    ['Iodine deficiency', ['brain', 'growth'], '<b>Endemic cretinism</b>: stunted mental and physical growth.']
  ] }
];

export default {
  mount(el) {
    const wrap = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 600px', gap: '30px', height: '100%' } });
    const left = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' } });
    const right = h('div', { style: { position: 'relative' } });
    wrap.append(left, right); el.append(wrap);
    // body silhouette
    const svg = svgIn(right, 600, 660);
    const B = s('g', { fill: 'rgba(255,255,255,.07)', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 3 });
    B.append(s('circle', { cx: 300, cy: 150, r: 92 }), s('rect', { x: 205, y: 250, width: 190, height: 290, rx: 80 }), s('rect', { x: 120, y: 270, width: 70, height: 220, rx: 35, transform: 'rotate(14 155 270)' }), s('rect', { x: 410, y: 270, width: 70, height: 220, rx: 35, transform: 'rotate(-14 445 270)' }), s('rect', { x: 215, y: 520, width: 72, height: 130, rx: 36 }), s('rect', { x: 313, y: 520, width: 72, height: 130, rx: 36 }));
    svg.append(B);
    const dots = {};
    Object.entries(ORG).forEach(([k, [x, y]]) => { const c = s('circle', { cx: x, cy: y, r: 16, fill: '#fff', opacity: .12 }); svg.append(c); dots[k] = c; });
    const NAMES = { brain: 'CNS', eye: 'Eye', ear: 'Ear', face: 'Face / palate', heart: 'Heart', limbs: 'Limbs', skin: 'Skin', spine: 'Neural tube', growth: 'Growth', caudal: 'Caudal body', teeth: 'Teeth' };
    const LO = { brain: [0, -32, 'middle'], eye: [-28, 8, 'end'], ear: [28, 8, 'start'], face: [-28, 14, 'end'], teeth: [28, 16, 'start'], heart: [30, 8, 'start'], limbs: [-30, 8, 'end'], skin: [30, 8, 'start'], spine: [30, 8, 'start'], caudal: [30, 8, 'start'], growth: [30, 8, 'start'] };
    const lbl = {}; Object.entries(ORG).forEach(([k, [x, y]]) => { const [dx, dy, anchor] = LO[k]; lbl[k] = text(svg, x + dx, y + dy, NAMES[k], { size: 22, weight: 700, opacity: 0, anchor }); });
    // detail
    const detail = h('div', { class: 'card', style: { '--cc': '#ff5a6e', padding: '22px 28px', flex: 'none' } });
    // agent chips
    const groups = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } });
    let active = null;
    function pick(btn, it, col) {
      if (active) active.style.background = ''; active = btn; btn.style.background = col + '44';
      Object.entries(dots).forEach(([k, d]) => { const on = it[1].includes(k); d.setAttribute('fill', on ? col : '#fff'); d.setAttribute('opacity', on ? .95 : .12); d.setAttribute('r', on ? 22 : 16); d.setAttribute('filter', on ? 'url(#glow2)' : ''); lbl[k].setAttribute('opacity', on ? 1 : 0); });
      detail.style.setProperty('--cc', col);
      detail.innerHTML = `<h3 style="font-size:34px;color:${col}">${it[0]}</h3><p style="font-size:24px;line-height:1.38;margin-top:8px">${it[2]}</p>`;
    }
    let first = null;
    GROUPS.forEach(G => {
      const row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } });
      row.append(h('span', { style: { fontSize: '18px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: G.c, width: '100%' }, text: G.g }));
      G.items.forEach(it => { const b = h('button', { class: 'chip', style: { cursor: 'pointer', fontSize: '23px', padding: '8px 16px' }, html: `<span class="dot" style="--cc:${G.c}"></span>${it[0]}` }); b.onclick = e => { e.stopPropagation(); pick(b, it, G.c); }; b.onmouseenter = () => pick(b, it, G.c); row.append(b); if (!first) first = () => pick(b, it, G.c); });
      groups.append(row);
    });
    left.append(groups, detail);
    first();
    return {};
  }
};
