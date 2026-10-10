// Cleavage (1 → 16 cells) and blastocyst formation inside the zona pellucida.
import { create3D, activate, deactivate, THREE, cellMaterial, fresnelMaterial, glowSprite, dustField } from '../stage3d.js';
import { Smooth, smooth, clamp, rng, h, s as S, easeInOut } from '../ui.js';

const R_IN = 1.42, R_Z = 1.62;

// Hierarchical cleavage configurations, relaxed inside a sphere
function buildLevels() {
  const levels = [[{ p: new THREE.Vector3(), ax: new THREE.Vector3(1, 0, 0) }]];
  const radius = L => 1.12 * Math.pow(.5, L / 3);
  for (let L = 1; L <= 4; L++) {
    const prev = levels[L - 1], rc = radius(L), out = [];
    prev.forEach((c, k) => {
      // cleavage plane alternates (meridional / equatorial), with jitter
      const ax = L === 1 ? new THREE.Vector3(1, 0, 0) : L === 2 ? new THREE.Vector3(0, 1, 0) : L === 3 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(R() - .5, R() - .5, R() - .5).normalize();
      ax.x += (R() - .5) * .25; ax.normalize();
      out.push({ p: c.p.clone().addScaledVector(ax, rc * .9), ax }, { p: c.p.clone().addScaledVector(ax, -rc * .9), ax });
    });
    for (let it = 0; it < 260; it++) {
      for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) {
        const d = out[j].p.clone().sub(out[i].p); const l = d.length() || 1e-3, min = rc * 1.86;
        if (l < min) { d.multiplyScalar((min - l) / l * .5); out[i].p.sub(d); out[j].p.add(d); }
      }
      out.forEach(c => { c.p.multiplyScalar(.995); const l = c.p.length(); if (l + rc > R_IN) c.p.multiplyScalar((R_IN - rc) / l); });
    }
    levels.push(out);
  }
  return { levels, radius };
}
let R = rng(5);

function fib(n, i) { const y = 1 - (i + .5) / n * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; return new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r); }

export default {
  mount(el, opts = {}) {
    R = rng(5);
    const blast = opts.mode === 'blastocyst';
    const G = create3D(el, { fov: 30, camPos: [0, 1.4, 8.6], autoRotate: !blast, autoRotateSpeed: .5 });
    const { scene } = G;
    G.lights('soft');
    scene.add(dustField(260, 16, 0x9aa8ff, .045));

    const zMat = fresnelMaterial({ color: 0x8fb8ff, rim: 0xd8e8ff, power: 1.7, opacity: .55, side: THREE.DoubleSide });
    const zona = new THREE.Mesh(new THREE.SphereGeometry(R_Z, 96, 64), zMat); zona.renderOrder = 3;
    scene.add(zona, glowSprite(0xff8fa8, 4.6, .16));

    const { levels, radius } = buildLevels();
    const N = blast ? 64 : 16;
    const mat = cellMaterial({ color: 0xff9db3, rim: 0xffe1ea, rimPow: 2, rimInt: .7, grain: .4, scale: 4, emissive: .05 });
    const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 48, 32), mat, N);
    cells.frustumCulled = false;
    scene.add(cells);
    const cT = new THREE.Color(0xff9db3), cI = new THREE.Color(0xffd166), tmpC = new THREE.Color();
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1);

    // ---------- readout + journey bar (cleavage) ----------
    let readout, dot;
    if (!blast) {
      readout = h('div', { class: 'readout', style: { left: '0px', top: '30px' } }, h('div', { class: 'rl', text: 'Stage' }), h('div', { class: 'rv', text: 'Zygote' }), h('div', { class: 'rs', text: '1 cell' }));
      el.append(readout);
      const svg = S('svg', { viewBox: '0 0 560 120', style: 'position:absolute; right:30px; bottom:34px; width:560px; height:120px; z-index:6; overflow:visible' });
      svg.append(
        S('path', { d: 'M20,70 C120,20 220,110 330,64 S470,40 540,60', fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 26, 'stroke-linecap': 'round' }),
        S('text', { x: 18, y: 112, 'font-size': 22, fill: '#b4b4bb', 'font-weight': 600, text: 'Ampulla' }),
        S('text', { x: 470, y: 112, 'font-size': 22, fill: '#b4b4bb', 'font-weight': 600, text: 'Uterus' }),
        S('text', { x: 200, y: 22, 'font-size': 22, fill: '#7c7c84', 'font-weight': 600, text: 'Uterine tube' })
      );
      dot = S('circle', { r: 13, fill: '#ff9db3', style: 'filter: drop-shadow(0 0 10px #ff6fae)' });
      svg.append(dot); el.append(svg);
      svg.path = svg.querySelector('path');
      G.journey = svg;
    }

    // ---------- blastocyst targets ----------
    let tgt = [], parent = [], fluid, droplets = [];
    if (blast) {
      const NT = 46, NI = 18;
      for (let i = 0; i < NT; i++) tgt.push({ p: fib(NT, i).multiplyScalar(1.3), r: .27, tropho: true });
      for (let i = 0; i < NI; i++) { const a = i * 2.399963, rr = .42 * Math.sqrt((i + .5) / NI); tgt.push({ p: new THREE.Vector3(Math.cos(a) * rr, .86 - rr * .35 - (i % 3) * .1, Math.sin(a) * rr), r: .2, tropho: false }); }
      // assign each target to the nearest morula cell (max 4 per parent)
      const m = levels[4], cap = new Array(16).fill(0);
      tgt.forEach((t, i) => {
        let best = -1, bd = 1e9;
        m.forEach((c, k) => { if (cap[k] >= 4) return; const d = c.p.distanceTo(t.p.clone().multiplyScalar(.8)); if (d < bd) { bd = d; best = k; } });
        cap[best]++; parent[i] = best;
      });
      fluid = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), fresnelMaterial({ color: 0x2f86ff, rim: 0x9fd2ff, power: 1.4, opacity: .55 }));
      fluid.renderOrder = 2; scene.add(fluid);
      for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), fresnelMaterial({ color: 0x2f86ff, rim: 0xbfe2ff, power: 1.2, opacity: .7 })); d.userData.p = new THREE.Vector3(R() - .5, R() - .7, R() - .5).multiplyScalar(1.4); droplets.push(d); scene.add(d); }
      const T = () => P.v;
      G.addLabel('Inner cell mass · embryoblast', { pos: new THREE.Vector3(0, .95, 0), dx: 0, dy: -70, color: '#ffd166', visible: () => T() > 1.6, tt: 'Inner cell mass (embryoblast)', tb: 'Pushed to one side (eccentric) as fluid accumulates. Forms the <b>embryo</b> proper.' });
      G.addLabel('Trophoblast', { pos: fib(46, 30).multiplyScalar(1.38), dx: 90, color: '#ff9db3', visible: () => T() > 1.6, tt: 'Trophoblast', tb: 'Outer layer of flattened cells lining the blastocoel → forms the <b>fetal part of the placenta</b>.' });
      G.addLabel('Blastocoel', { pos: new THREE.Vector3(0, -.35, 0), color: '#64d2ff', visible: () => T() > 1.2, tt: 'Blastocoel', tb: 'The fluid-filled <b>cavity</b> inside the blastocyst. (The blastocyst is the whole structure.)' });
      G.addLabel('Embryonic pole', { pos: new THREE.Vector3(0, 1.75, 0), dy: -20, color: '#b4b4bb', visible: () => T() > 2.5 });
      G.addLabel('Abembryonic pole', { pos: new THREE.Vector3(0, -1.75, 0), dy: 20, color: '#b4b4bb', visible: () => T() > 2.5 });
      G._zl = G.addLabel('Zona pellucida', { pos: new THREE.Vector3(-1, .4, .6).normalize().multiplyScalar(R_Z), dx: -60, color: '#8fb8ff' });
    }

    const P = new Smooth(0, 1.5); // cleavage: 0..4 (log2 cells); blastocyst: 0..4 steps
    const hl = new Smooth(0, 4);
    const names = ['Zygote', '2-cell', '4-cell', '8-cell', 'Morula'];

    G.update = (dt, time) => {
      const p = P.step(dt);
      mat.uniforms.uTime.value = time;
      if (!blast) {
        const L = Math.min(3, Math.floor(p)), f = easeInOut(clamp(p - L));
        const n = Math.pow(2, L + 1);
        for (let i = 0; i < 16; i++) {
          if (i >= n) { m4.makeScale(0, 0, 0); cells.setMatrixAt(i, m4); continue; }
          const par = levels[L][i >> 1], ch = levels[L + 1][i];
          v.lerpVectors(par.p, ch.p, f);
          // during early division, daughters sit inside the parent's outline
          const rr = THREE.MathUtils.lerp(radius(L) * .82, radius(L + 1), f) * (1 + .015 * Math.sin(time * 2 + i));
          sc.setScalar(rr);
          q.setFromAxisAngle(Z, 0);
          m4.compose(v, q, sc); cells.setMatrixAt(i, m4);
        }
        const stage = Math.round(p);
        readout.querySelector('.rv').textContent = names[stage];
        readout.querySelector('.rs').textContent = stage === 4 ? '16 cells · enters uterus ≈ day 3–4' : `${Math.pow(2, stage)} ${stage ? 'blastomeres' : 'cell'}`;
        const path = G.journey.path, len = path.getTotalLength(), pt = path.getPointAtLength(len * clamp(p / 4) * .97);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      } else {
        // 0: morula with fluid droplets · 1: blastocoel/rearrange · 2: ICM · 3: trophoblast · 4: zona degenerates
        const re = smooth(.6, 1.6, p);
        const cut = smooth(1.2, 2, p);
        const hICM = clamp(1 - Math.abs(p - 2) * 1.2), hTro = clamp(1 - Math.abs(p - 3) * 1.2);
        for (let i = 0; i < 64; i++) {
          const t = tgt[i], par = levels[4][parent[i]];
          v.lerpVectors(par.p, t.p, re);
          let r = THREE.MathUtils.lerp(radius(4) * .62, t.r, re);
          // cutaway: hide trophoblast cells facing the camera
          if (t.tropho && t.p.z > .02 && t.p.y < 1.08) r *= 1 - cut;
          if (t.tropho) {
            q.setFromUnitVectors(Z, t.n || (t.n = t.p.clone().normalize()));
            sc.set(r * 1.25, r * 1.25, r * THREE.MathUtils.lerp(1, .42, re));
          } else { q.identity(); sc.setScalar(r); }
          const pulse = t.tropho ? hTro : hICM;
          sc.multiplyScalar(1 + pulse * .08 * (1 + Math.sin(time * 4)));
          m4.compose(v, q, sc); cells.setMatrixAt(i, m4);
          cells.setColorAt(i, tmpC.copy(t.tropho ? cT : cI).lerp(cT, 1 - re));
        }
        cells.instanceColor.needsUpdate = true;
        fluid.scale.setScalar(Math.max(.001, 1.12 * smooth(.7, 1.7, p)));
        fluid.position.set(0, -.12, 0);
        droplets.forEach((d, k) => { const g = smooth(0, .7, p) * (1 - smooth(.8, 1.4, p)); d.scale.setScalar(Math.max(.001, (.1 + .05 * Math.sin(time * 2 + k)) * g)); d.position.copy(d.userData.p); });
        const deg = smooth(3.3, 4, p);
        zMat.uniforms.uOp.value = .55 * (1 - deg * .9);
        zona.scale.setScalar(1 + deg * .1);
        if (G._zl) G._zl.el.firstChild.textContent = deg > .3 ? 'Zona degenerating' : 'Zona pellucida';
      }
      cells.instanceMatrix.needsUpdate = true;
    };
    if (blast) for (let i = 0; i < 64; i++) cells.setColorAt(i, new THREE.Color(0xff9db3));

    return {
      maxStep: 4,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { P.set(n); if (initial) P.jump(n); }
    };
  }
};
