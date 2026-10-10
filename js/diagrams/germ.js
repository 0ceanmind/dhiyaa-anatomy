// Germ-layer derivatives explorer: three columns of hoverable chips.
import { h, tip } from './_kit.js';

const LAYERS = [
  { name: 'Ectoderm', c: '#4f9dff', sub: 'Outer layer', items: [
    ['Epidermis · hair · nails', 'Epidermis of skin and its appendages, plus the <b>mammary glands</b>.'],
    ['Nervous system', 'Brain and spinal cord (neural tube) + <b>pituitary gland</b>.'],
    ['Sense receptors', 'Sensory epithelium of the inner ear, nose and eye.'],
    ['Lens · cornea · lacrimal', 'Lens, outer surface of the cornea and the lacrimal gland.'],
    ['Oral & nasal lining', 'Lining of the oral and nasal cavities (lecture adds salivary glands; Langman: the <b>parotid</b> is ectodermal).'],
    ['Lower anal canal · urethra tip', 'Lining of the lower anal canal (below the pectinate line) and the terminal urethra.'],
    ['External auditory meatus', 'Lining of the external ear canal.'],
    ['Neural crest →', 'A special ectodermal population — see the next slides.']
  ] },
  { name: 'Mesoderm', c: '#ff5a6e', sub: 'Middle layer', items: [
    ['Paraxial → somites', 'Somites → <b>sclerotome</b> (vertebrae, ribs) and <b>dermomyotome</b> (skeletal muscle, dermis of the back).'],
    ['Intermediate → urogenital', '<b>Kidneys</b>, <b>gonads</b> (testis or ovary) and genital ducts of both sexes.'],
    ['Lateral plate · somatic', 'Thoracic and abdominal <b>walls</b>.'],
    ['Lateral plate · splanchnic', '<b>Heart</b> and smooth muscle of the gut and respiratory system.'],
    ['Intraembryonic coelom', 'Pericardial, pleural and peritoneal <b>cavities</b>.'],
    ['Notochord', 'Axial mesoderm → persists as the <b>nucleus pulposus</b>.']
  ] },
  { name: 'Endoderm', c: '#ffcc33', sub: 'Inner layer · gut tube', items: [
    ['Gut epithelium', 'Pharynx (inferior part), oesophagus, stomach, small &amp; large intestine, upper rectum and the <b>upper anal canal</b> (above the pectinate line).'],
    ['Respiratory epithelium', 'Larynx (except epiglottis), trachea, bronchi, bronchioles, alveoli.'],
    ['Liver · gallbladder · pancreas', 'Liver, gallbladder &amp; biliary apparatus, pancreas (including the islets).'],
    ['Thyroid · parathyroids · thymus', 'Thyroid <b>follicular</b> cells, parathyroid glands, thymus.'],
    ['Auditory tube · middle ear', 'Eustachian tube, middle-ear cavity and tympanic membrane mucosa; tonsillar crypt epithelium.'],
    ['Bladder · urethra epithelium', 'Epithelium of the urinary bladder and urethra.']
  ] }
];

export default {
  mount(el) {
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', height: '100%' } });
    LAYERS.forEach((L, k) => {
      const col = h('div', { class: 'card', style: { '--cc': L.c, padding: '30px 30px 26px', display: 'flex', flexDirection: 'column', gap: '18px' } });
      const head = h('div', { style: { display: 'flex', alignItems: 'center', gap: '18px' } });
      // mini trilaminar icon with the layer highlighted
      const icon = `<svg width="86" height="62" viewBox="0 0 86 62">${['#4f9dff', '#ff5a6e', '#ffcc33'].map((c, i) => `<rect x="3" y="${4 + i * 19}" width="80" height="15" rx="7" fill="${c}" opacity="${i === k ? 1 : .18}"/>`).join('')}</svg>`;
      head.innerHTML = icon + `<div><h3 style="font-size:46px;color:${L.c}">${L.name}</h3><div style="font-size:24px;color:var(--fg-2);font-weight:600">${L.sub}</div></div>`;
      col.append(head);
      const chips = h('div', { class: 'chips', style: { gap: '12px', alignContent: 'flex-start' } });
      L.items.forEach(([t, tb]) => { const c = h('span', { class: 'chip hot', style: { '--cc': L.c, fontSize: '26px', padding: '12px 20px' } }); c.innerHTML = `<span class="dot"></span>${t}`; tip(c, t, tb, L.c); chips.append(c); });
      col.append(chips);
      grid.append(col);
    });
    el.append(grid);
    return {};
  }
};
