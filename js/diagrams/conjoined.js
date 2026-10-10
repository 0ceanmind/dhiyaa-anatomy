// Conjoined twins: the point of union names the type.
import { svgIn, text, COL, s, tip, h } from './_kit.js';
import { segmented } from '../ui.js';

const TYPES = [
  ['Thoracopagus', 'Chest', 'Joined at the thorax — the heart may be shared.'],
  ['Omphalopagus', 'Abdomen (umbilicus)', 'Joined at the abdomen (umbilical region) — liver or GIT may be shared.'],
  ['Pygopagus', 'Sacrum / buttocks', 'Back-to-back at the sacral region.'],
  ['Ischiopagus', 'Pelvis', 'Joined at the pelvis, bodies end-to-end.'],
  ['Craniopagus', 'Head', 'Joined at the head — nervous-system structures may be shared.']
];

function body(g, x, y, rot, flip = 1) {
  const b = s('g', { transform: `translate(${x},${y}) rotate(${rot}) scale(${flip},1)` });
  const f = '#ffb08a';
  b.append(s('circle', { cx: 0, cy: -150, r: 62, fill: '#ffc09a' }));
  b.append(s('rect', { x: -58, y: -92, width: 116, height: 170, rx: 50, fill: f }));
  b.append(s('rect', { x: -96, y: -78, width: 34, height: 130, rx: 17, fill: f, transform: 'rotate(18 -79 -78)' }), s('rect', { x: 62, y: -78, width: 34, height: 130, rx: 17, fill: f, transform: 'rotate(-18 79 -78)' }));
  b.append(s('rect', { x: -52, y: 66, width: 40, height: 140, rx: 20, fill: f }), s('rect', { x: 12, y: 66, width: 40, height: 140, rx: 20, fill: f }));
  g.append(b);
}

export default {
  mount(el) {
    const svg = svgIn(el, 1060, 880);
    const art = s('g'); svg.append(art);
    const big = text(svg, 530, 90, '', { size: 56, weight: 800, anchor: 'middle', fill: '#c084fc' });
    const sub = text(svg, 530, 134, '', { size: 28, weight: 600, anchor: 'middle', fill: COL.fg2 });
    function draw(i) {
      art.innerHTML = '';
      const C = [530, 480];
      if (i === 0) { body(art, C[0] - 95, C[1], -8, 1); body(art, C[0] + 95, C[1], 8, -1); }
      if (i === 1) { body(art, C[0] - 100, C[1] - 20, -4, 1); body(art, C[0] + 100, C[1] - 20, 4, -1); }
      if (i === 2) { body(art, C[0] - 85, C[1] - 40, 20, 1); body(art, C[0] + 85, C[1] - 40, -20, -1); }
      if (i === 3) { body(art, C[0] - 230, C[1] + 10, -90, 1); body(art, C[0] + 230, C[1] + 10, 90, 1); }
      if (i === 4) { body(art, C[0], C[1] + 220, 0, 1); body(art, C[0], C[1] - 230, 180, 1); }
      const J = [[C[0], C[1] - 40], [C[0], C[1] + 20], [C[0], C[1] + 20], [C[0], C[1] + 10], [C[0], C[1] - 5]][i];
      const glow = s('ellipse', { cx: J[0], cy: J[1], rx: 64, ry: 54, fill: '#c084fc', opacity: .55, filter: 'url(#glow2)' });
      glow.innerHTML = '<animate attributeName="opacity" values=".25;.7;.25" dur="2s" repeatCount="indefinite"/>';
      art.append(glow);
      big.textContent = TYPES[i][0]; sub.textContent = 'Union at the ' + TYPES[i][1].toLowerCase();
      tip(glow, TYPES[i][0], TYPES[i][2], '#c084fc');
    }
    const seg = segmented(TYPES.map(t => t[0]), draw);
    const ctrl = h('div', { class: 'ctrl', style: { left: '0px', bottom: '0px', flexWrap: 'wrap' } }); ctrl.append(seg); el.append(ctrl);
    draw(0);
    return { maxStep: 4, step(n) { seg.set(n); draw(n); } };
  }
};
