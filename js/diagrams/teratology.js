// Principles of teratology + the sensitive period (no stage completely safe).
import { h, tip, svgIn, s, text, COL } from './_kit.js';

const P = [
  ['Genotype', 'Of the fetus — and the maternal genome', '#64d2ff', 'The fetal genotype and how it interacts with the environment; the <b>maternal genome</b> also matters.'],
  ['Timing', 'Weeks 3–8 most sensitive', '#ff5a6e', 'Developmental stage at exposure: the <b>embryonic period (weeks 3–8)</b> is the most sensitive; <b>no stage is completely safe</b>.'],
  ['Dose & duration', 'More exposure, more effect', '#ff9f0a', 'Manifestations depend on the dose and duration of exposure to a teratogen.'],
  ['Mechanism', 'Specific ways on cells', '#a78bfa', 'Teratogens act in specific ways — inhibiting a biochemical or molecular process, cell death, decreased proliferation, etc.'],
  ['Outcome', 'Death · malformation · IUGR · functional', '#34d399', 'Manifestations: death, malformation, intrauterine growth restriction and functional disorders.']
];

export default {
  mount(el) {
    const wrap = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' } });
    const lede = h('div', { class: 'lede', style: { margin: 0, fontSize: '30px' }, html: '1940s: <b>Gregg</b> linked maternal <b>rubella</b> to defects; <b>thalidomide</b> proved drugs cross the placenta.' });
    wrap.append(lede);
    const row = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' } });
    P.forEach(([t, p, c, tb], i) => { const k = h('div', { class: 'card hot', style: { '--cc': c, padding: '28px 26px' } }); k.innerHTML = `<div style="font-size:54px;font-weight:800;color:${c};line-height:1">${i + 1}</div><h3 style="font-size:36px;margin-top:12px">${t}</h3><p style="font-size:24px">${p}</p>`; tip(k, t, tb, c); row.append(k); });
    wrap.append(row);
    // sensitivity band
    const band = h('div', { style: { flex: '1', position: 'relative' } }); wrap.append(band);
    const svg = svgIn(band, 1680, 200);
    const X0 = 60, X1 = 1620, x = w => X0 + w / 38 * (X1 - X0);
    const seg = (a, b, c, op, t, sz = 26, cap) => { const g = s('g', { class: 'hot' }); g.append(s('rect', { x: x(a), y: 60, width: x(b) - x(a) - 4, height: 70, rx: 18, fill: c, opacity: op })); text(g, (x(a) + x(b)) / 2, 104, t, { size: sz, weight: 750, anchor: 'middle' }); if (cap) text(g, (x(a) + x(b)) / 2, 172, cap, { size: 24, weight: 700, anchor: 'middle', fill: c }); svg.append(g); return g; };
    tip(seg(0, 2, '#7c7c84', .35, 'Wk 1–2', 19), 'Weeks 1–2', 'Before the embryonic period.', '#b4b4bb');
    tip(seg(2, 8, '#ff5a6e', .75, 'Weeks 3–8', 26, 'Most sensitive'), 'Embryonic period', 'Organogenesis — the <b>most sensitive</b> period for inducing birth defects.', '#ff5a6e');
    tip(seg(8, 38, '#ff9f0a', .3, 'Fetal period · less sensitive — but no stage is completely safe'), 'Fetal period', 'Lower susceptibility, but <b>no stage of development is completely safe</b>.', '#ff9f0a');
    text(svg, X0, 40, 'Sensitivity to teratogens (weeks after fertilization)', { size: 22, fill: COL.fg3 });
    el.append(wrap);
    return {};
  }
};
