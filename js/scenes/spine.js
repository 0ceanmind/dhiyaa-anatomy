// Fate of the notochord: rod → vertebral bodies form → persists only as nucleus pulposus (cut-away spine).
import { create3D, activate, deactivate, THREE, glowSprite } from '../stage3d.js';
import { Smooth, smooth, clamp, rng } from '../ui.js';

const NB = 4, BH = .78, DH = .34, RB = 1.0;
function porousTexture(seed, base, dot) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const R = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 380; i++) { g.fillStyle = dot; g.globalAlpha = .25 + R() * .35; g.beginPath(); g.ellipse(R() * 256, R() * 256, 2 + R() * 7, 2 + R() * 5, R() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 1; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function ringTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#cfe0ef' : '#a9c3dc'; g.fillRect(i * 16, 0, 16, 64); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// half solid of revolution (x ≥ 0) with a flat cut face at x = 0 facing the camera
function halfLathe(profile, matSurf, matCut) {
  const g = new THREE.Group();
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 64, 0, Math.PI), matSurf));
  const sh = new THREE.Shape();
  profile.forEach(([r, y], i) => i ? sh.lineTo(r, y) : sh.moveTo(r, y));
  for (let i = profile.length - 1; i >= 0; i--) sh.lineTo(-profile[i][0], profile[i][1]);
  const cut = new THREE.Mesh(new THREE.ShapeGeometry(sh), matCut);
  cut.rotation.y = -Math.PI / 2; cut.position.x = -.002;
  g.add(cut);
  return g;
}

export default {
  mount(el) {
    const G = create3D(el, { fov: 30, camPos: [-7.4, 2.2, 5.6], target: [0, 0, 0], minPolar: .5, maxPolar: 2.3 });
    const { scene } = G;
    G.lights('soft');
    const R = rng(3);
    const total = NB * BH + (NB - 1) * DH, y0 = -total / 2;

    const boneSurf = new THREE.MeshStandardMaterial({ color: 0xeadfcd, roughness: .7, transparent: true, side: THREE.DoubleSide });
    const boneCut = new THREE.MeshStandardMaterial({ map: porousTexture(2, '#e9d9bf', '#b98b6a'), roughness: .85, transparent: true, side: THREE.DoubleSide });
    const discSurf = new THREE.MeshStandardMaterial({ color: 0xbcd4ea, roughness: .35, transparent: true, side: THREE.DoubleSide });
    const discCut = new THREE.MeshStandardMaterial({ map: ringTexture(), roughness: .5, transparent: true, side: THREE.DoubleSide });

    const bodyProfile = []; for (let i = 0; i <= 16; i++) { const t = i / 16, y = -BH / 2 + t * BH; bodyProfile.push([RB * (1 - .1 * Math.sin(t * Math.PI)) * (t === 0 || t === 1 ? .94 : 1), y]); }
    bodyProfile.unshift([0, -BH / 2]); bodyProfile.push([0, BH / 2]);
    const discProfile = [[0, -DH / 2], [RB * .95, -DH / 2], [RB * 1.02, 0], [RB * .95, DH / 2], [0, DH / 2]];
    const bodies = [], discs = [];
    for (let i = 0; i < NB; i++) {
      const b = halfLathe(bodyProfile, boneSurf, boneCut); b.position.y = y0 + i * (BH + DH) + BH / 2; scene.add(b); bodies.push(b);
      if (i < NB - 1) { const d = halfLathe(discProfile, discSurf, discCut); d.position.y = b.position.y + BH / 2 + DH / 2; scene.add(d); discs.push(d); }
    }
    // notochord: one segment per body and per disc
    const notoMat = new THREE.MeshStandardMaterial({ color: 0xff7a45, emissive: 0xff5a1f, emissiveIntensity: .45, roughness: .3 });
    const segB = bodies.map(b => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, BH + .01, 32), notoMat); m.position.y = b.position.y; scene.add(m); return m; });
    const nucMat = new THREE.MeshPhysicalMaterial({ color: 0xff8a50, emissive: 0xff5a1f, emissiveIntensity: .35, roughness: .15, clearcoat: 1, transmission: 0, transparent: true, opacity: .95 });
    const segD = discs.map(d => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), nucMat); m.position.y = d.position.y; scene.add(m); m.add(glowSprite(0xff7a45, 2.2, .35)); return m; });
    // sclerotome mesenchyme particles (condense into bodies)
    const NP = 700;
    const pm = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff6b7f, emissive: 0x7a1020, emissiveIntensity: .4, roughness: .5 }), NP);
    pm.frustumCulled = false; scene.add(pm);
    const PP = Array.from({ length: NP }, () => { const a = R() * Math.PI * 2, r = .3 + R() * 1.6; return { a, r, y: y0 - .2 + R() * (total + .4), s: .03 + R() * .03, ph: R() * 6 }; });

    const T = new Smooth(0, 1.8);
    G.addLabel('Notochord', { pos: () => new THREE.Vector3(0, segB[0].position.y + .1, 0), dx: -130, dy: 0, color: '#ff7a45', visible: () => T.v < 1.6, tt: 'Notochord', tb: 'Rod of mesoderm in the midline — defines the axis and induces the neural tube.' });
    G.addLabel('Sclerotome cells', { pos: new THREE.Vector3(0, y0 + total * .62, 1.5), dx: 60, color: '#ff6b7f', visible: () => T.v < .8, tt: 'Sclerotome', tb: 'Somite cells that surround the notochord and neural tube to build the vertebrae.' });
    G.addLabel('Vertebral body', { pos: () => new THREE.Vector3(0, bodies[2].position.y, RB * .7), dx: 100, color: '#eadfcd', visible: () => T.v > .7 });
    G.addLabel('Intervertebral disc', { pos: () => new THREE.Vector3(0, discs[1].position.y, RB), dx: 120, color: '#bcd4ea', visible: () => T.v > .7 && T.v < 1.6 });
    G.addLabel('Nucleus pulposus', { pos: () => new THREE.Vector3(0, discs[1].position.y, 0), dx: -150, dy: -30, color: '#ff8a50', visible: () => T.v > 1.6, tt: 'Nucleus pulposus', tb: 'The <b>only adult remnant</b> of the notochord — the gel core of each intervertebral disc.' });
    G.addLabel('Annulus fibrosus', { pos: () => new THREE.Vector3(0, discs[0].position.y, RB * .9), dx: 120, color: '#bcd4ea', visible: () => T.v > 1.6 });

    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    G.update = (dt, time) => {
      const t = T.step(dt);
      const form = smooth(.1, 1, t), fate = smooth(1.1, 2, t);
      boneSurf.opacity = boneCut.opacity = form; discSurf.opacity = discCut.opacity = form * .92;
      bodies.forEach((b, i) => { b.visible = form > .01; b.scale.set(.6 + .4 * form, 1, .6 + .4 * form); });
      discs.forEach(d => { d.visible = form > .01; d.scale.set(.6 + .4 * form, 1, .6 + .4 * form); });
      segB.forEach(m => { const k = Math.max(.001, 1 - fate); m.scale.set(k, 1, k); m.visible = fate < .999; });
      segD.forEach((m, i) => { const r = .16 + .3 * fate; m.scale.set(r, THREE.MathUtils.lerp(DH / 2 + .02, .2, fate), r); m.children[0].material.opacity = .15 + .35 * fate; });
      const sh = 1 - smooth(.2, .9, t);
      for (let i = 0; i < NP; i++) {
        const p = PP[i], r = p.r * (1 - .35 * form) + Math.sin(time + p.ph) * .02;
        v.set(Math.cos(p.a) * r, p.y, Math.sin(p.a) * r);
        sc.setScalar(Math.max(.0001, p.s * sh)); m4.compose(v, q, sc); pm.setMatrixAt(i, m4);
      }
      pm.instanceMatrix.needsUpdate = true; pm.visible = sh > .01;
    };

    return {
      maxStep: 2,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { T.set(n); if (initial) T.jump(n); }
    };
  }
};
