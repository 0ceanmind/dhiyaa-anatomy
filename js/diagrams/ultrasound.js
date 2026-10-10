// Simulated ultrasound sector with calipers for CRL, BPD, AC and FL (illustrative, not real images).
import { h } from './_kit.js';
import { segmented, fitCanvas, rng, clamp } from '../ui.js';

const MODES = [
  { k: 'CRL', name: 'Crown–rump length', when: 'Weeks 7–14', c: '#ffd60a' },
  { k: 'BPD', name: 'Biparietal diameter', when: 'Weeks 16–30', c: '#64d2ff' },
  { k: 'AC', name: 'Abdominal circumference', when: 'Weeks 16–30', c: '#34d399' },
  { k: 'FL', name: 'Femur length', when: 'Weeks 16–30', c: '#ff9f0a' }
];

export default {
  mount(el) {
    const W = 1040, H = 820;
    const cv = h('canvas', { class: 'dgc' }); el.append(cv);
    const info = h('div', { class: 'readout', style: { right: '10px', top: '10px', minWidth: '360px' } }); el.append(info);
    let mode = 0, ctx, speck, t0 = performance.now(), raf;
    const R = rng(11);
    function makeSpeckle() {
      const c = document.createElement('canvas'); c.width = 520; c.height = 410; const g = c.getContext('2d');
      const img = g.createImageData(520, 410);
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.pow(R(), 3) * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0); return c;
    }
    function resize() { ctx = fitCanvas(cv, W, H); }
    const apex = [W / 2, 40], R0 = 60, R1 = 760, A0 = -0.95, A1 = 0.95;
    const sector = g => { g.beginPath(); g.moveTo(apex[0] + Math.sin(A0) * R0, apex[1] + Math.cos(A0) * R0); g.arc(apex[0], apex[1], R1, Math.PI / 2 - A0, Math.PI / 2 - A1, true); g.lineTo(apex[0] + Math.sin(A1) * R0, apex[1] + Math.cos(A1) * R0); g.arc(apex[0], apex[1], R0, Math.PI / 2 - A1, Math.PI / 2 - A0, false); g.closePath(); };
    function blob(g, x, y, rx, ry, rot, a, fill = true) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.globalAlpha = a; if (fill) g.fill(); else g.stroke(); g.restore(); g.globalAlpha = 1; }
    function caliper(g, x1, y1, x2, y2, col, k) {
      const xe = x1 + (x2 - x1) * k, ye = y1 + (y2 - y1) * k;
      g.strokeStyle = col; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(x1, y1); g.lineTo(xe, ye); g.stroke(); g.setLineDash([]);
      g.fillStyle = col; g.font = '700 30px Inter'; [[x1, y1], [xe, ye]].forEach(([x, y]) => { g.fillText('+', x - 9, y + 10); });
    }
    function draw(now) {
      const g = ctx, t = (now - t0) / 1000, k = clamp((t - .4) / 1.2);
      g.clearRect(0, 0, W, H);
      g.save(); sector(g); g.clip();
      g.fillStyle = '#050505'; g.fillRect(0, 0, W, H);
      g.globalAlpha = .9; g.drawImage(speck, 0, 0, W, H); g.globalAlpha = 1;
      g.filter = 'blur(6px)'; g.fillStyle = '#d8d8d8'; g.strokeStyle = '#e6e6e6'; g.lineWidth = 14;
      const m = MODES[mode].k;
      // uterine wall echoes
      blob(g, W / 2, 700, 420, 60, 0, .25);
      if (m === 'CRL') { blob(g, W / 2 - 80, 360, 70, 62, 0, .8); blob(g, W / 2 + 60, 400, 140, 70, .25, .7); blob(g, W / 2 + 200, 440, 50, 40, 0, .6); blob(g, W / 2, 380, 330, 230, 0, .18, false); }
      if (m === 'BPD') { blob(g, W / 2, 400, 230, 190, .1, .9, false); g.lineWidth = 6; blob(g, W / 2, 400, 4, 150, .1, .7); }
      if (m === 'AC') { g.lineWidth = 12; blob(g, W / 2, 410, 210, 200, 0, .85, false); blob(g, W / 2 - 40, 430, 40, 26, 0, .5); blob(g, W / 2 + 80, 360, 26, 20, 0, .7); }
      if (m === 'FL') { g.lineWidth = 18; g.beginPath(); g.moveTo(W / 2 - 200, 470); g.lineTo(W / 2 + 190, 330); g.globalAlpha = .95; g.stroke(); g.globalAlpha = 1; blob(g, W / 2 + 40, 520, 260, 120, -.3, .2); }
      g.filter = 'none'; g.restore();
      // sector outline + depth scale
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; sector(g); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 1; i < 8; i++) g.fillRect(apex[0] + Math.sin(A1) * (R0 + i * 95) + 8, apex[1] + Math.cos(A1) * (R0 + i * 95), 12, 3);
      const col = MODES[mode].c;
      if (m === 'CRL') caliper(g, W / 2 - 140, 330, W / 2 + 240, 450, col, k);
      if (m === 'BPD') caliper(g, W / 2 - 24, 214, W / 2 + 24, 590, col, k);
      if (m === 'AC') { g.strokeStyle = col; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); g.ellipse(W / 2, 410, 210, 200, 0, 0, Math.PI * 2 * k); g.stroke(); g.setLineDash([]); }
      if (m === 'FL') caliper(g, W / 2 - 200, 470, W / 2 + 190, 330, col, k);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '600 20px Inter'; g.fillText('SIMULATION · not a patient scan', 24, H - 20);
      raf = requestAnimationFrame(draw);
    }
    function setMode(i) { mode = i; t0 = performance.now(); const M = MODES[i]; info.innerHTML = `<div class="rl">${M.k}</div><div class="rv" style="font-size:40px;color:${M.c}">${M.name}</div><div class="rs">${M.when}</div>`; }
    const seg = segmented(MODES.map(m => m.k), setMode);
    const ctrl = h('div', { class: 'ctrl', style: { left: '10px', top: '10px' } }); ctrl.append(seg); el.append(ctrl);
    return {
      maxStep: 3,
      enter() { speck = speck || makeSpeckle(); resize(); raf = requestAnimationFrame(draw); },
      leave() { cancelAnimationFrame(raf); },
      resize() { resize(); },
      step(n) { seg.set(n); setMode(n); }
    };
  }
};
