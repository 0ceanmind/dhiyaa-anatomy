// Sperm journey: hundreds of millions in → a few hundred reach the ampulla.
import { svgIn, text, COL, s, tip } from './_kit.js';
import { rng } from '../ui.js';

export default {
  mount(el) {
    const svg = svgIn(el, 1000, 880);
    const CY = 430, X0 = 70, X1 = 880;
    const half = x => { const t = (x - X0) / (X1 - X0); return 250 * Math.pow(1 - t, 1.6) + 22; };
    let top = `M${X0},${CY - half(X0)}`, bot = '';
    for (let x = X0; x <= X1; x += 10) top += ` L${x},${CY - half(x)}`;
    for (let x = X1; x >= X0; x -= 10) bot += ` L${x},${CY + half(x)}`;
    const grad = s('linearGradient', { id: 'fun', x1: 0, x2: 1 }); grad.innerHTML = '<stop offset="0" stop-color="#ff6fae" stop-opacity=".22"/><stop offset="1" stop-color="#ffd60a" stop-opacity=".28"/>';
    svg.querySelector('defs').append(grad);
    svg.append(s('path', { d: top + bot + ' Z', fill: 'url(#fun)', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 2 }));
    const stages = [
      [200, 'Vagina', 'Acidity kills many', 'Deposited in the <b>posterior fornix</b>; many die from vaginal acidity.'],
      [420, 'Cervix', 'Mucus slows them', 'Tail movements carry sperm through, slowly, because of <b>cervical mucus</b>.'],
      [640, 'Uterus & tube', 'Muscular contractions', 'Passage through the uterus and tubes is mainly by their <b>muscular contractions</b>.'],
      [860, 'Ampulla', 'Few hundred', 'Lecture: ≈200 reach the ampulla. Langman 15e: 300–500 reach the site.']
    ];
    stages.forEach(([x, t, sub, tb], i) => {
      svg.append(s('line', { x1: x, x2: x, y1: CY - half(x) - 14, y2: CY + half(x) + 14, stroke: 'rgba(255,255,255,.25)', 'stroke-width': 2, 'stroke-dasharray': '4 8' }));
      const g = s('g', { class: 'hot' });
      text(g, x, 760, t, { size: 26, weight: 700, anchor: 'middle' });
      text(g, x, 796, sub, { size: 20, weight: 550, fill: COL.fg2, anchor: 'middle' });
      g.append(s('rect', { x: x - 100, y: 730, width: 200, height: 80, fill: 'transparent' }));
      tip(g, t, tb, i === 3 ? '#ffd60a' : '#ff6fae');
      svg.append(g);
    });
    text(svg, X0, 108, '200–600', { size: 92, weight: 800 });
    text(svg, X0, 150, 'million deposited', { size: 26, weight: 600, fill: COL.fg2 });
    text(svg, 960, 108, '≈200', { size: 92, weight: 800, anchor: 'end', fill: '#ffd60a' });
    text(svg, 960, 150, 'reach the ampulla', { size: 26, weight: 600, fill: COL.fg2, anchor: 'end' });
    const oo = s('g', { transform: `translate(${X1 + 40},${CY})` });
    oo.append(s('circle', { r: 46, fill: 'none', stroke: '#9cc8ff', 'stroke-width': 5, opacity: .7 }), s('circle', { r: 36, fill: 'url(#gOocyte)', filter: 'url(#glow)' }));
    svg.append(oo);
    text(svg, 500, 860, '≈ 1 in a million make it', { size: 30, weight: 700, anchor: 'middle', fill: COL.fg2 });

    const R = rng(8), N = 240;
    const P = Array.from({ length: N }, (_, i) => { const surv = R(); return { off: (R() * 2 - 1) * .9, ph: R() * 6, sp: .8 + R() * .4, die: X0 + (X1 - X0) * (surv < .04 ? 1.2 : Math.pow(surv, 1.8) * .95), d: R() }; });
    const G = s('g'); svg.insertBefore(G, oo);
    const els = P.map(() => { const c = s('circle', { r: 4.2, fill: '#e8f1ff' }); G.append(c); return c; });
    let raf, t0;
    const tick = now => {
      const T = (now - t0) / 1000;
      P.forEach((p, i) => {
        const k = ((T * .16 * p.sp + p.d) % 1);
        const x = X0 + (X1 - X0) * k;
        const y = CY + p.off * half(x) * .85 + Math.sin(T * 6 + p.ph) * 3;
        const alive = x < p.die;
        els[i].setAttribute('cx', x.toFixed(1)); els[i].setAttribute('cy', y.toFixed(1));
        els[i].setAttribute('opacity', alive ? .85 : Math.max(0, 1 - (x - p.die) / 30) * .5);
      });
      raf = requestAnimationFrame(tick);
    };
    return { enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
