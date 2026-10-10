// Syndrome vs association vs sequence — with VACTERL letters and the Potter sequence cascade.
import { h, tip } from './_kit.js';

export default {
  mount(el) {
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '26px', height: '100%' } });
    const card = (c, tag, title, body, tt, tb) => { const k = h('div', { class: 'card hot', style: { '--cc': c, display: 'flex', flexDirection: 'column' } }); k.innerHTML = `<div class="tag" style="position:static">${tag}</div><h3 style="font-size:44px;margin-top:8px">${title}</h3>${body}`; tip(k, tt, tb, c); grid.append(k); return k; };
    card('#64d2ff', 'Cause known', 'Syndrome', `<p>Anomalies with a <b style="color:var(--fg)">specific common cause</b> — recurrence risk known</p><div class="chips" style="margin-top:auto;gap:10px"><span class="chip" style="font-size:24px">Down syndrome</span><span class="chip" style="font-size:24px">Van der Woude · IRF6</span></div>`, 'Syndrome', 'Group of anomalies with a <b>specific common cause</b>; cause and recurrence risk are known — chromosomal (e.g. Down) or single gene (e.g. <b>IRF6</b> → Van der Woude: lower-lip pits + cleft lip/palate).');
    const assoc = card('#ffcc33', 'Cause unknown', 'Association', `<p>Non-random clustering — recognising one prompts a search for the others</p><div class="vac" style="margin-top:auto;display:flex;gap:8px;flex-wrap:wrap"></div>`, 'Association', 'Non-random appearance of two or more anomalies together more often than chance — <b>cause not determined</b>.');
    const V = [['V', 'Vertebral anomalies'], ['A', 'Anal atresia'], ['C', 'Cardiac (cardiovascular) anomalies'], ['T', 'Tracheo-oesophageal fistula'], ['E', 'Oesophageal atresia'], ['R', 'Renal / radial anomalies'], ['L', 'Limb defects']];
    const vac = assoc.querySelector('.vac');
    V.forEach(([l, n], i) => { const b = h('span', { class: 'chip hot', style: { fontSize: '34px', fontWeight: 800, padding: '10px 18px', color: '#ffcc33', animation: `pulse 2.4s ${i * .2}s infinite` }, text: l }); tip(b, l + ' — ' + n, 'Part of the <b>VACTERL association</b>.', '#ffcc33'); vac.append(b); });
    const seq = card('#ff5a6e', 'One cause → cascade', 'Sequence', `<p>A single primary factor triggers a cascade — e.g. <b style="color:var(--fg)">Potter sequence</b></p><div class="casc" style="margin-top:22px;display:flex;flex-direction:column;gap:12px"></div>`, 'Potter sequence', 'Oligohydramnios from chronic leakage of amniotic fluid or defective fetal urine output (e.g. renal agenesis) → fetal compression → flattened face, hip dislocation, talipes, <b>lung hypoplasia</b> → death from respiratory failure.');
    const steps = ['Renal agenesis / fluid leak', 'Oligohydramnios', 'Fetal compression', 'Flat face · hip dislocation · talipes · lung hypoplasia', 'Respiratory failure'];
    const casc = seq.querySelector('.casc');
    const nodes = steps.map((t, i) => { const n = h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '27px', fontWeight: 650, opacity: .25, transition: 'opacity .5s, transform .5s', transform: 'translateX(-10px)' } }); n.innerHTML = `<span style="flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:rgba(255,90,110,.2);color:#ff5a6e;font-weight:800;font-size:22px">${i + 1}</span><span>${t}</span>`; casc.append(n); return n; });
    el.append(grid);
    let timer;
    return {
      enter() { let k = 0; nodes.forEach(n => { n.style.opacity = .25; n.style.transform = 'translateX(-10px)'; }); clearInterval(timer); timer = setInterval(() => { if (k < nodes.length) { nodes[k].style.opacity = 1; nodes[k].style.transform = 'none'; k++; } else { clearInterval(timer); } }, 550); },
      leave() { clearInterval(timer); }
    };
  }
};
