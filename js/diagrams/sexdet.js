// Interactive sex determination: X- or Y-bearing sperm + oocyte (22,X) → 46,XX or 46,XY.
import { svgIn, text, COL, s, tip } from './_kit.js';

export default {
  mount(el) {
    const svg = svgIn(el, 900, 880);
    const oo = s('g', { transform: 'translate(250,250)' });
    oo.append(s('circle', { r: 128, fill: 'none', stroke: '#9cc8ff', 'stroke-width': 8, opacity: .55 }), s('circle', { r: 110, fill: 'url(#gOocyte)', filter: 'url(#glow)' }));
    text(oo, 0, 10, '22,X', { size: 44, weight: 800, anchor: 'middle', fill: '#5a1830' });
    text(oo, 0, 170, 'Oocyte', { size: 26, weight: 650, anchor: 'middle', fill: COL.fg2 });
    svg.append(oo);
    const btn = (y, lab, sub, col, i) => {
      const g = s('g', { style: 'cursor:pointer', transform: `translate(560,${y})` });
      const r = s('rect', { x: 0, y: -50, width: 300, height: 100, rx: 50, fill: 'rgba(255,255,255,.06)', stroke: col, 'stroke-width': 2.5 });
      g.append(r);
      const spm = s('g', { transform: 'translate(54,0)' }); spm.append(s('path', { d: 'M-8,0 C-24,-10 -34,10 -48,0', stroke: '#e6efff', 'stroke-width': 4, fill: 'none' }), s('ellipse', { rx: 13, ry: 9, fill: col }));
      g.append(spm);
      text(g, 96, -4, lab, { size: 30, weight: 750 }); text(g, 96, 28, sub, { size: 21, weight: 600, fill: COL.fg2 });
      g.addEventListener('click', e => { e.stopPropagation(); user = true; choose(i); });
      svg.append(g); return { g, r };
    };
    const bx = btn(170, 'X sperm', '22,X', '#ff6fae', 0), by = btn(340, 'Y sperm', '22,Y', '#4f9dff', 1);
    // travelling sperm
    const mover = s('g', { opacity: 0 }); mover.append(s('path', { d: 'M-10,0 C-30,-12 -44,12 -62,0', stroke: '#e6efff', 'stroke-width': 5, fill: 'none' }), s('ellipse', { rx: 16, ry: 11, fill: '#fff' }));
    svg.append(mover);
    // result
    const res = s('g', { transform: 'translate(450,560)' }); svg.append(res);
    const rTitle = text(res, 0, 0, '', { size: 64, weight: 800, anchor: 'middle' });
    const rSub = text(res, 0, 44, '', { size: 28, weight: 600, anchor: 'middle', fill: COL.fg2 });
    // karyotype bars
    const kar = s('g', { transform: 'translate(90,690)' }); svg.append(kar);
    const sexBars = [];
    for (let i = 0; i < 23; i++) {
      const x = i * 31, hgt = i < 22 ? 110 - i * 3.6 : 0;
      if (i < 22) { kar.append(s('rect', { x, y: 120 - hgt, width: 10, height: hgt, rx: 5, fill: '#5d6475' }), s('rect', { x: x + 13, y: 120 - hgt, width: 10, height: hgt, rx: 5, fill: '#5d6475' })); }
      else { const a = s('rect', { x: x + 6, y: 20, width: 12, height: 100, rx: 6, fill: '#ff6fae' }), b = s('rect', { x: x + 22, y: 20, width: 12, height: 100, rx: 6, fill: '#ff6fae' }); kar.append(a, b); sexBars.push(a, b); }
    }
    text(kar, 0, 160, '22 pairs of autosomes', { size: 21, fill: COL.fg3 });
    text(kar, 22 * 31 + 20, 160, 'Sex pair', { size: 21, fill: COL.fg2, anchor: 'middle' });
    let cur = -1, user = false, timer, raf;
    function choose(i) {
      cur = i;
      [bx, by].forEach((b, k) => b.r.setAttribute('fill', k === i ? (i ? 'rgba(79,157,255,.25)' : 'rgba(255,111,174,.25)') : 'rgba(255,255,255,.06)'));
      const start = performance.now(), from = i ? [614, 340] : [614, 170], to = [250 + 105, 250];
      cancelAnimationFrame(raf);
      const step = now => {
        const k = Math.min(1, (now - start) / 900), e = 1 - Math.pow(1 - k, 3);
        mover.setAttribute('opacity', k < 1 ? 1 : 0);
        mover.setAttribute('transform', `translate(${from[0] + (to[0] - from[0]) * e},${from[1] + (to[1] - from[1]) * e + Math.sin(k * 20) * 6 * (1 - k)}) rotate(180)`);
        if (k < 1) raf = requestAnimationFrame(step); else {
          rTitle.textContent = i ? '46,XY' : '46,XX'; rTitle.setAttribute('fill', i ? '#4f9dff' : '#ff6fae');
          rSub.textContent = i ? 'Male · determined by the Y-bearing sperm' : 'Female · determined by the X-bearing sperm';
          sexBars[1].setAttribute('height', i ? 52 : 100); sexBars[1].setAttribute('y', i ? 68 : 20);
          sexBars[1].setAttribute('fill', i ? '#4f9dff' : '#ff6fae');
        }
      };
      raf = requestAnimationFrame(step);
    }
    return {
      enter() { choose(0); timer = setInterval(() => { if (!user) choose(cur ? 0 : 1); }, 4200); },
      leave() { clearInterval(timer); cancelAnimationFrame(raf); }
    };
  }
};
