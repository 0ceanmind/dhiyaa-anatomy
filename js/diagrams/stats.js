// Stat tiles / card sets with count-up animation and hover details.
import { h, tip } from './_kit.js';
import { countUp } from '../ui.js';

const SETS = {
  birth: { cols: 4, vsize: 92, tiles: [
    { v: '3,000–3,400', u: 'g', l: 'Usual birth weight', c: '#ff9f0a', tt: 'Birth weight', tb: 'Average 2,500–4,000 g (appropriate for gestational age), mostly 3,000–3,400 g.' },
    { v: '≈50', u: 'cm', l: 'Crown–heel length', c: '#64d2ff', tt: 'CHL', tb: 'Crown–heel length about 50 cm.' },
    { v: '≈36', u: 'cm', l: 'Crown–rump length', c: '#34d399', tt: 'CRL', tb: 'Crown–rump (sitting) length about 36 cm.' },
    { v: '32–38', u: 'cm', l: 'Head circumference', c: '#ff6fae', tt: 'Skull', tb: 'The skull has the <b>largest circumference</b> of the body — important for passage through the birth canal.' }
  ], foot: { t: 'Testes should be in the scrotum', tb: 'Undescended testis at term = cryptorchidism (lecture ultrasound image: unilateral cryptorchidism at 38 weeks).' } },
  defects: { cols: 4, tiles: [
    { v: '3', u: '%', l: 'of live births have a major structural anomaly', c: '#ffcc33', tt: 'Major anomalies', tb: 'Major structural anomalies occur in approximately 3% of live-born infants.' },
    { v: '≈25', u: '%', l: 'of infant deaths', c: '#ff5a6e', tt: 'Infant mortality', tb: 'Birth defects are a <b>leading cause of infant mortality</b> (≈25% of infant deaths).' },
    { v: '15', u: '%', l: 'of newborns have minor anomalies', c: '#64d2ff', tt: 'Minor anomalies', tb: 'Minor anomalies (e.g. microtia) occur in about 15% of newborns and may signal a major malformation.' },
    { v: 'Same', u: '', l: 'frequency in every ethnic group', c: '#34d399', tt: 'Non-discriminatory', tb: 'Frequencies are the same for Asians, African Americans, Latin Americans, Whites and Native Americans.' }
  ] },
  preeclampsia: { cols: 1, tiles: [
    { v: '≈5', u: '%', l: 'of pregnancies', c: '#ff5a6e', ring: 5, tt: 'Preeclampsia', tb: 'Maternal hypertension (with proteinuria and oedema on the lecture figure) in about 5% of pregnancies.' }
  ] },
  iugr: { cols: 4, cards: [
    { t: 'Causes', p: 'Genes · teratogens · infection · maternal health · placenta · twins', c: '#ff9f0a', tb: '<ul><li>Chromosomal abnormalities & gene mutations</li><li>Teratogens</li><li>Congenital infections (rubella, CMV, toxoplasmosis, syphilis)</li><li>Poor maternal health (hypertension, renal & cardiac disease)</li><li>Nutrition, socioeconomic level, smoking, alcohol</li><li>Placental insufficiency</li><li>Multiple births</li></ul>' },
    { t: '1 in 10 babies', p: 'Higher immediate risks', c: '#ff5a6e', tb: 'Neurological problems · congenital malformations · meconium aspiration · hypoglycaemia · hypocalcaemia · respiratory distress syndrome.' },
    { t: 'Lifelong effects', p: '“What happens in the womb does not stay in the womb.”', c: '#a78bfa', tb: 'Greater chance of <b>metabolic syndrome</b> in adulthood: obesity, hypertension, hypercholesterolaemia, cardiovascular disease, type 2 diabetes.' },
    { t: 'IGF-1 vs GH', p: 'IGF-1 drives fetal growth · GH drives postnatal growth', c: '#34d399', tb: '<b>IGF-1</b>: main fetal growth factor; IGF-1 gene mutations → IUGR that continues after birth.<br><b>GH/GHR</b>: postnatal growth. GHR mutations → <b>Laron dwarfism</b> (marked short stature, blue sclera) — <b>no IUGR</b>.' }
  ], extra: 'iugrfig' },
  twintable: { table: true }
};

export default {
  mount(el, opts) {
    const S = SETS[opts.set];
    const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '30px' } });
    const counters = [];
    if (S.tiles) {
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${S.cols}, 1fr)`, gap: '26px' } });
      S.tiles.forEach(t => {
        const card = h('div', { class: 'card hot', style: { '--cc': t.c, padding: '44px 38px', minHeight: S.cols === 1 ? '560px' : '340px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: S.cols === 1 ? 'center' : 'stretch', textAlign: S.cols === 1 ? 'center' : 'left' } });
        if (t.ring != null) {
          const r = 150, C = 2 * Math.PI * r;
          card.innerHTML = `<svg width="380" height="380" viewBox="0 0 380 380" style="margin-bottom:10px"><circle cx="190" cy="190" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="26"/><circle class="ring" cx="190" cy="190" r="${r}" fill="none" stroke="${t.c}" stroke-width="26" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 190 190)" style="transition:stroke-dashoffset 1.6s cubic-bezier(.22,.8,.2,1);filter:drop-shadow(0 0 12px ${t.c})"/><text x="190" y="215" text-anchor="middle" font-size="96" font-weight="800" fill="#f5f5f7" font-family="Inter">${t.v}${t.u}</text></svg><div class="stat"><span class="l" style="font-size:34px">${t.l}</span></div>`;
          card.ring = [card.querySelector('.ring'), C * (1 - t.ring / 100)];
        } else {
          card.innerHTML = `<div class="stat"><span class="v" style="color:${t.c}${S.vsize ? `;font-size:${S.vsize}px` : ''}">${t.v}<small>${t.u}</small></span><span class="l">${t.l}</span></div>`;
        }
        tip(card, t.tt, t.tb, t.c); grid.append(card); counters.push(card);
      });
      wrap.append(grid);
      if (S.foot) { const f = h('div', { class: 'chip hot', style: { alignSelf: 'flex-start', fontSize: '30px', padding: '16px 28px' } }); f.innerHTML = `<span class="dot" style="--cc:#a78bfa"></span>${S.foot.t}`; tip(f, S.foot.t, S.foot.tb, '#a78bfa'); wrap.append(f); }
    }
    if (S.cards) {
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: '1.15fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '24px', height: '100%' } });
      // IUGR figure: appropriate vs symmetrical vs asymmetrical
      const fig = h('div', { class: 'card hot', style: { '--cc': '#ffcc33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gridRow: '1 / 3' } });
      const body = (cx, hr, bw, bh, lab, hi) => `<g><ellipse cx="${cx}" cy="${300 - bh / 2}" rx="${bw}" ry="${bh / 2}" fill="#ffb08a"/><circle cx="${cx}" cy="${300 - bh - hr * .8}" r="${hr}" fill="#ffc09a"/><text x="${cx}" y="350" text-anchor="middle" font-size="24" font-weight="700" fill="${hi}" font-family="Inter">${lab}</text></g>`;
      fig.innerHTML = `<svg viewBox="0 0 470 370" width="100%" style="display:block">${body(75, 46, 46, 120, 'Normal', '#f5f5f7')}${body(235, 34, 34, 88, 'Symmetrical', '#ffcc33')}${body(395, 44, 30, 84, 'Asymmetrical', '#ff9f0a')}</svg><div><h3>IUGR = pathologically small</h3><p>Symmetrical or asymmetrical (head relatively spared)</p></div>`;
      tip(fig, 'IUGR', 'Infants who do not attain their optimal intrauterine growth; pathologically small and at risk of poor outcomes. Can be <b>symmetrical</b> or <b>asymmetrical</b>.', '#ffcc33');
      grid.append(fig);
      S.cards.forEach(c => { const card = h('div', { class: 'card hot', style: { '--cc': c.c, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' } }); card.innerHTML = `<h3>${c.t}</h3><p>${c.p}</p>`; tip(card, c.t, c.tb, c.c); grid.append(card); });
      wrap.append(grid);
    }
    if (S.table) {
      const rows = [['Origin', '2 ova + 2 sperm', '1 zygote → 2 embryos'], ['Genetics', 'Like siblings', 'Identical'], ['Sex', 'Same or different', 'Same'], ['Chorion', 'Dichorionic', 'Di- or monochorionic'], ['Amnion', 'Diamniotic', 'Di- or monoamniotic'], ['Shared placenta', 'No true sharing', 'Possible'], ['FFTS risk', 'No', 'Monochorionic only']];
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '30px', height: '100%' } });
      const tbl = h('div', { class: 'card', style: { padding: '26px 34px' } });
      tbl.innerHTML = `<div style="display:grid;grid-template-columns:1.1fr 1fr 1.2fr;font-size:28px;row-gap:0">
        <div></div><div style="font-weight:800;color:#ff9f0a;padding:10px 0">Dizygotic</div><div style="font-weight:800;color:#64d2ff;padding:10px 0">Monozygotic</div>
        ${rows.map(r => `<div style="color:var(--fg-2);font-weight:600;padding:14px 0;border-top:1px solid var(--line)">${r[0]}</div><div style="padding:14px 0;border-top:1px solid var(--line);font-weight:600">${r[1]}</div><div style="padding:14px 0;border-top:1px solid var(--line);font-weight:600">${r[2]}</div>`).join('')}</div>`;
      const steps = ['Ultrasound: chorionicity & amnionicity', 'Fetal number, viability, growth, anatomy', 'Monochorionic → watch for FFTS, TAPS, IUGR', 'Monoamniotic → watch cord complications', 'Conjoined → define anatomy, refer to a specialised centre'];
      const app = h('div', { class: 'card', style: { '--cc': '#64d2ff', padding: '30px 34px' } });
      app.innerHTML = `<h3 style="margin-bottom:18px">Clinical approach</h3>` + steps.map((s_, i) => `<div style="display:flex;gap:18px;align-items:center;padding:12px 0;border-top:${i ? '1px solid var(--line)' : '0'}"><span style="flex:none;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:rgba(100,210,255,.18);color:#64d2ff;font-weight:800;font-size:24px">${i + 1}</span><span style="font-size:27px;font-weight:600;line-height:1.25">${s_}</span></div>`).join('');
      grid.append(tbl, app); wrap.append(grid);
    }
    el.append(wrap);
    return {
      enter() {
        counters.forEach(c => {
          if (c.ring) { c.ring[0].style.strokeDashoffset = c.ring[0].getAttribute('stroke-dasharray'); requestAnimationFrame(() => requestAnimationFrame(() => c.ring[0].style.strokeDashoffset = c.ring[1])); return; }
          const v = c.querySelector('.v'); if (!v) return;
          const raw = v.firstChild.textContent; const num = parseFloat(raw.replace(/[^\d.]/g, ''));
          if (/^\d+$/.test(raw.trim())) { const node = v.firstChild; const st = performance.now(); const tick = now => { const k = Math.min(1, (now - st) / 1200), e = 1 - (1 - k) ** 3; node.textContent = Math.round(num * e); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
        });
      }
    };
  }
};
