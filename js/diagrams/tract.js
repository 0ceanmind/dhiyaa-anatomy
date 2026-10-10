// Female reproductive tract (frontal). Mode "fert": ovulation + sperm journey to the ampulla.
import { svgIn, text, COL, s, hotspot, pill, tip } from './_kit.js';
import { rng } from '../ui.js';

const mirror = d => d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (m, x, y) => `${(1000 - +x).toFixed(1)},${y}`);

export function drawTract(parent, { dim = false } = {}) {
  const g = s('g', { opacity: dim ? .55 : 1 }); parent.append(g);
  const tubeR = { isth: 'M612,352 C650,330 690,305 735,305', amp: 'M735,305 C800,300 870,320 885,385', inf: 'M885,385 C890,405 885,425 872,438' };
  const tubeCol = '#f39ab0', tubeDark = '#c25f7c';
  // ovaries + ligaments
  for (const side of [1, -1]) {
    const cx = side > 0 ? 790 : 210;
    g.append(s('path', { d: side > 0 ? 'M600,400 C680,430 740,460 760,470' : mirror('M600,400 C680,430 740,460 760,470'), stroke: '#a8506a', 'stroke-width': 7, fill: 'none', opacity: .7 }));
    const ov = s('ellipse', { cx, cy: 482, rx: 54, ry: 34, fill: '#f6c7d0', stroke: '#e3a3b3', 'stroke-width': 3, transform: `rotate(${side * -18} ${cx} 482)` });
    g.append(ov);
    [[-18, -6, 9], [10, 8, 12], [24, -10, 7], [-4, 14, 6]].forEach(([dx, dy, r]) => g.append(s('circle', { cx: cx + dx * side, cy: 482 + dy, r, fill: '#fff1e8', stroke: '#e9b3a2', 'stroke-width': 2 })));
  }
  // tubes
  for (const side of [1, -1]) {
    const m = side > 0 ? (x => x) : mirror;
    g.append(s('path', { d: m(tubeR.isth), stroke: tubeDark, 'stroke-width': 22, fill: 'none', 'stroke-linecap': 'round' }));
    g.append(s('path', { d: m(tubeR.isth), stroke: tubeCol, 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round' }));
    g.append(s('path', { d: m(tubeR.amp), stroke: tubeDark, 'stroke-width': 40, fill: 'none', 'stroke-linecap': 'round' }));
    g.append(s('path', { d: m(tubeR.amp), stroke: tubeCol, 'stroke-width': 33, fill: 'none', 'stroke-linecap': 'round' }));
    g.append(s('path', { d: m(tubeR.inf), stroke: tubeCol, 'stroke-width': 44, fill: 'none', 'stroke-linecap': 'round' }));
    for (let k = 0; k < 7; k++) { const a = -.6 + k * .32, x0 = 875, y0 = 440; const cx1 = x0 + Math.cos(a + 1.4) * 30, cy1 = y0 + Math.sin(a + 1.4) * 34, ex = x0 + Math.cos(a + 1.1) * 52, ey = y0 + Math.sin(a + 1.1) * 56; const d = `M${x0},${y0} Q${cx1.toFixed(1)},${cy1.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`; g.append(s('path', { d: m(d), stroke: tubeCol, 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' })); }
  }
  // uterus
  g.append(s('path', { d: 'M385,350 C395,270 605,270 615,350 C625,440 580,520 548,565 L538,660 C545,700 570,740 578,800 L422,800 C430,740 455,700 462,660 L452,565 C420,520 375,440 385,350 Z', fill: 'url(#gUterus)', stroke: '#f7b6c6', 'stroke-width': 3 }));
  g.append(s('path', { d: 'M418,368 Q500,342 582,368 Q530,450 506,548 L494,548 Q470,450 418,368 Z', fill: '#5a1830', opacity: .85 }));
  g.append(s('path', { d: 'M500,548 L500,662', stroke: '#5a1830', 'stroke-width': 9, 'stroke-linecap': 'round' }));
  g.append(s('path', { d: 'M470,680 Q500,700 530,680 L548,800 L452,800 Z', fill: '#5a1830', opacity: .55 }));
  return {
    g, pts: { ampulla: [806, 312], isthmus: [702, 309], fimbriae: [884, 432], interstitial: [626, 344], ovaryR: [790, 482], ovaryL: [210, 482], uterus: [500, 420], cervix: [500, 640], internalOs: [500, 556], scar: [462, 540], abdominal: [300, 660] }
  };
}

export default {
  mount(el, opts = {}) {
    const svg = svgIn(el, 1000, 880);
    const T = drawTract(svg);
    const P = T.pts;
    const layer = s('g'); svg.append(layer);
    // paths for animation
    const oPath = s('path', { d: 'M800,470 C860,470 892,440 882,400 C872,350 840,316 806,312', fill: 'none' });
    const spPath = s('path', { d: 'M500,800 L500,662 C500,560 520,420 560,372 C590,345 610,352 640,338 C690,312 730,305 806,312', fill: 'none' });
    layer.append(oPath, spPath);
    const OL = oPath.getTotalLength(), SL = spPath.getTotalLength();
    const oo = s('g'); oo.append(s('circle', { r: 21, fill: 'none', stroke: '#9cc8ff', 'stroke-width': 4, opacity: .8 }), s('circle', { r: 15, fill: 'url(#gOocyte)' }));
    layer.append(oo);
    const flash = s('circle', { cx: P.ampulla[0], cy: P.ampulla[1], r: 30, fill: '#fff', opacity: 0, filter: 'url(#glow2)' }); layer.append(flash);
    const R = rng(3);
    const NS = 36;
    const sp = Array.from({ length: NS }, () => { const g = s('g'); g.append(s('line', { x1: 0, y1: 0, x2: -16, y2: 0, stroke: '#dbe9ff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }), s('ellipse', { rx: 5.5, ry: 3.6, fill: '#eef5ff' })); layer.append(g); return { g, d: R() * .9, off: (R() - .5) * 16, die: .25 + R() * .75, sp: .8 + R() * .5 }; });

    // hotspots & labels
    const hot = s('g'); svg.append(hot);
    hotspot(hot, ...P.ampulla, '#ffd60a', 'Ampulla', 'Widest part of the uterine tube — the usual <b>site of fertilization</b>.');
    pill(hot, 806, 230, 'Ampulla · fertilization', '#ffd60a', { anchor: 'middle' });
    pill(hot, 690, 380, 'Isthmus', COL.fg2, { anchor: 'middle', size: 21 });
    pill(hot, 905, 520, 'Fimbriae', COL.fg2, { anchor: 'middle', size: 21, tt: 'Infundibulum & fimbriae', tb: 'Sweep the ovulated secondary oocyte into the tube.' });
    pill(hot, 790, 560, 'Ovary', '#f6c7d0', { anchor: 'middle', size: 21, tt: 'Ovulation', tb: 'The <b>secondary oocyte</b> is expelled at mid-cycle (≈ day 14).' });
    pill(hot, 500, 440, 'Uterus', '#ff9fb6', { anchor: 'middle', size: 21 });
    pill(hot, 360, 735, 'Cervix', COL.fg2, { anchor: 'middle', size: 21, tt: 'Cervix', tb: 'Sperm pass by tail movements, slowed by <b>cervical mucus</b>. Capacitation begins here (lecture).' });
    const cap = text(svg, 500, 868, '', { size: 26, weight: 650, anchor: 'middle', fill: COL.fg2 });

    let raf, t0;
    const tick = now => {
      const t = ((now - t0) / 1000) % 9;
      // oocyte: 0–2.5 s leaves ovary and reaches ampulla
      const ok = Math.min(1, t / 2.5), op = oPath.getPointAtLength(OL * (1 - Math.pow(1 - ok, 2)));
      oo.setAttribute('transform', `translate(${op.x},${op.y}) scale(${Math.min(1, t / .5)})`);
      // sperm: 2–7 s
      sp.forEach((o, i) => {
        const k = Math.max(0, Math.min(1, (t - 2 - o.d * 1.5) / (4 * o.sp)));
        const alive = k < o.die || o.die > .95;
        const pt = spPath.getPointAtLength(SL * k), p2 = spPath.getPointAtLength(Math.min(SL, SL * k + 2));
        const ang = Math.atan2(p2.y - pt.y, p2.x - pt.x) * 180 / Math.PI;
        const wig = Math.sin(now / 70 + i) * 4;
        o.g.setAttribute('transform', `translate(${pt.x + o.off * (1 - k) * Math.sin(ang)},${pt.y + wig * (1 - k)}) rotate(${ang})`);
        o.g.setAttribute('opacity', k <= 0 ? 0 : alive ? (k > .97 ? .9 : .85) : Math.max(0, 1 - (k - o.die) * 12));
      });
      const f = t > 6.2 && t < 7.4 ? Math.sin((t - 6.2) / 1.2 * Math.PI) : 0;
      flash.setAttribute('opacity', f * .9); flash.setAttribute('r', 30 + f * 30);
      cap.textContent = t < 2.5 ? 'Ovulation → oocyte swept into the tube' : t < 6.2 ? 'Sperm ascend: cervix → uterus → tube' : 'Fertilization in the ampulla';
      raf = requestAnimationFrame(tick);
    };
    return { enter() { t0 = performance.now(); raf = requestAnimationFrame(tick); }, leave() { cancelAnimationFrame(raf); } };
  }
};
