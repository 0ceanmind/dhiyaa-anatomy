// Abnormal fertilization: superfecundation, polyspermy, parthenogenesis — three animated cards.
import { h, s, tip } from './_kit.js';

const icon = (inner) => `<svg viewBox="0 0 300 220" width="100%" height="330" style="display:block;overflow:visible"><defs><radialGradient id="ao" cx="40%" cy="35%"><stop offset="0" stop-color="#ffe2d6"/><stop offset=".7" stop-color="#ffab90"/><stop offset="1" stop-color="#e8806a"/></radialGradient></defs>${inner}</svg>`;
const sperm = (x, y, rot, col = '#e6efff', cls = '') => `<g class="${cls}" transform="translate(${x},${y}) rotate(${rot})"><path d="M-8,0 C-22,-8 -32,8 -46,0" stroke="${col}" stroke-width="4" fill="none"/><ellipse rx="11" ry="7" fill="${col}"/></g>`;
const egg = (x, y, r, extra = '') => `<g transform="translate(${x},${y})"><circle r="${r + 9}" fill="none" stroke="#9cc8ff" stroke-width="5" opacity=".55"/><circle r="${r}" fill="url(#ao)"/>${extra}</g>`;

const CARDS = [
  { t: 'Superfecundation', p: '2+ ova · same cycle · separate coitus', c: '#ff9f0a',
    svg: icon(`${egg(95, 110, 46)}${egg(215, 110, 46)}<g class="sw1">${sperm(30, 40, 30, '#ffd166')}</g><g class="sw2">${sperm(290, 190, 210, '#7cc4ff')}</g>`),
    tip: 'Fertilization of <b>two or more ova</b> released in the <b>same</b> menstrual cycle by sperm from <b>separate acts of coitus</b> (same or another male).<br><br>If the ova come from <b>different cycles</b> → <b>superfetation</b>.' },
  { t: 'Polyspermy', p: '2 sperm → 69 chromosomes (3n)', c: '#ff5a6e',
    svg: icon(`${egg(150, 112, 70, '<text x="0" y="12" text-anchor="middle" font-size="34" font-weight="800" fill="#5a1830">69</text>')}<g class="sw1">${sperm(40, 50, 25)}</g><g class="sw2">${sperm(262, 60, 160)}</g>`),
    tip: 'Fertilization by <b>two sperm</b> → a zygote with an extra set of chromosomes: <b>69 = 3n (triploid)</b>, e.g. 69,XXY. Normally prevented by the cortical &amp; zona reactions.' },
  { t: 'Parthenogenesis', p: 'Unfertilized oocyte cleaves', c: '#a78bfa',
    svg: icon(`<g class="split"><g class="l">${egg(150, 112, 52)}</g></g><text x="150" y="212" text-anchor="middle" font-size="22" font-weight="650" fill="#b4b4bb">no sperm</text>`),
    tip: '“Virgin birth”: cleavage of an <b>unfertilized</b> oocyte producing a growing embryo without a male. Occurs naturally in <b>plants, invertebrates and fish</b>.' }
];

export default {
  mount(el) {
    const wrap = h('div', { class: 'cards', style: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', height: '100%', alignItems: 'stretch' } });
    const style = h('style', { html: `
      @keyframes sw1 { 0%{transform:translate(0,0)} 50%{transform:translate(40px,40px)} 100%{transform:translate(0,0)} }
      @keyframes sw2 { 0%{transform:translate(0,0)} 50%{transform:translate(-40px,-50px)} 100%{transform:translate(0,0)} }
      @keyframes pulseS { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      .abn .sw1 { animation: sw1 3s ease-in-out infinite; } .abn .sw2 { animation: sw2 3.4s ease-in-out infinite; }
      .abn .split .l { transform-origin: 150px 112px; animation: pulseS 2.4s ease-in-out infinite; }` });
    wrap.append(style);
    CARDS.forEach(c => {
      const card = h('div', { class: 'card hot abn', style: { '--cc': c.c, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } });
      card.innerHTML = `<div style="flex:1;display:flex;align-items:center">${c.svg}</div><div><h3>${c.t}</h3><p>${c.p}</p></div>`;
      tip(card, c.t, c.tip, c.c);
      wrap.append(card);
    });
    el.append(wrap);
    return {};
  }
};
