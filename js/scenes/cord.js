// Umbilical cord: Wharton's jelly + 2 arteries + 1 vein, spirally twisted, with animated flow.
import { create3D, activate, deactivate, THREE } from '../stage3d.js';
import { Smooth, smooth, h, segmented } from '../ui.js';

function flowTexture(c1, c2) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 16; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 256, 0);
  for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? c2 : c1);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 16);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// Build a cord along `curve`; returns { group, arteries:[mesh,mesh], vein, jelly, textures }
export function buildCord(curve, { R = .34, turns = 6, seg = 360, jellyOpacity = .32 } = {}) {
  const group = new THREE.Group();
  const frames = curve.computeFrenetFrames(seg, false);
  const helix = (phase, rad) => {
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, p = curve.getPointAt(t), a = phase + t * turns * Math.PI * 2;
      const n = frames.normals[i], b = frames.binormals[i];
      pts.push(p.clone().addScaledVector(n, Math.cos(a) * rad).addScaledVector(b, Math.sin(a) * rad));
    }
    return new THREE.CatmullRomCurve3(pts);
  };
  const tA = flowTexture('#2f6fe6', '#86b4ff'), tV = flowTexture('#d81e3a', '#ff7b8c');
  tA.repeat.set(turns * 3, 1); tV.repeat.set(turns * 3, 1);
  const matA = new THREE.MeshStandardMaterial({ map: tA, roughness: .35, emissive: 0x0d2a6a, emissiveIntensity: .4 });
  const matV = new THREE.MeshStandardMaterial({ map: tV, roughness: .35, emissive: 0x5a0a18, emissiveIntensity: .4 });
  const vein = new THREE.Mesh(new THREE.TubeGeometry(helix(0, R * .32), seg, R * .34, 20), matV);
  const art1 = new THREE.Mesh(new THREE.TubeGeometry(helix(Math.PI * .72, R * .5), seg, R * .21, 16), matA);
  const art2 = new THREE.Mesh(new THREE.TubeGeometry(helix(Math.PI * 1.28, R * .5), seg, R * .21, 16), matA);
  const jelly = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, R, 40), new THREE.MeshPhysicalMaterial({ color: 0xe9eef7, roughness: .25, transmission: 0, transparent: true, opacity: jellyOpacity, clearcoat: 1, clearcoatRoughness: .2, side: THREE.DoubleSide, depthWrite: false }));
  jelly.renderOrder = 3;
  group.add(vein, art1, art2, jelly);
  return { group, arteries: [art1, art2], vein, jelly, tA, tV };
}

export default {
  mount(el) {
    const G = create3D(el, { fov: 30, camPos: [1.6, 1.8, 12.2], target: [-.2, .1, 0], minPolar: .6, maxPolar: 2.4 });
    const { scene } = G;
    G.lights('soft');
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.4, -1.0, -.8), new THREE.Vector3(-2.2, .4, 0), new THREE.Vector3(0, -.3, .4), new THREE.Vector3(1.8, .4, .6), new THREE.Vector3(2.9, .9, 1.9)]);
    const C = buildCord(curve, { R: .52, turns: 5.5 });
    scene.add(C.group);
    // cross-section cap at the near end
    const end = curve.getPointAt(1), tan = curve.getTangentAt(1);
    const cap = new THREE.Group(); cap.position.copy(end); cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
    const face = new THREE.Mesh(new THREE.CircleGeometry(.52, 64), new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: .6 }));
    const ring = new THREE.Mesh(new THREE.RingGeometry(.52, .56, 64), new THREE.MeshStandardMaterial({ color: 0xcfd8e6 }));
    const vX = new THREE.Mesh(new THREE.RingGeometry(.1, .18, 40), new THREE.MeshStandardMaterial({ color: 0xd81e3a, emissive: 0x5a0a18, emissiveIntensity: .4 }));
    const aX1 = new THREE.Mesh(new THREE.RingGeometry(.04, .11, 32), new THREE.MeshStandardMaterial({ color: 0x2f6fe6, emissive: 0x0d2a6a, emissiveIntensity: .4 }));
    const aX2 = aX1.clone();
    [face, ring, vX, aX1, aX2].forEach((m, i) => { m.position.z = .01 * i; cap.add(m); });
    scene.add(cap);
    const placeX = (art2On) => { vX.position.set(-.06, .1, .03); aX1.position.set(.2, -.14, .04); aX2.position.set(-.24, -.2, .04); aX2.visible = art2On; };
    placeX(true);

    const single = new Smooth(0, 4);
    const a2m = C.arteries[1].material = C.arteries[1].material.clone();
    G.addLabel('Umbilical vein · O₂-rich → fetus', { pos: () => C.vein.geometry.parameters.path.getPointAt(.42), dy: -70, color: '#ff453a', tt: 'Umbilical vein (one)', tb: 'Carries <b>oxygen and nutrients</b> from the placenta to the fetus.' });
    const al = G.addLabel('Umbilical arteries · → placenta', { pos: () => C.arteries[0].geometry.parameters.path.getPointAt(.62), dy: 74, color: '#3d8bff', tt: 'Umbilical arteries (two)', tb: 'Carry fetal <b>CO₂ and waste</b> to the placenta.' });
    G.addLabel('Wharton’s jelly', { pos: curve.getPointAt(.1).add(new THREE.Vector3(0, -.5, 0)), dy: 80, color: '#e9eef7', tt: 'Wharton’s jelly', tb: 'Mucoid connective tissue protecting the vessels. The cord is covered by <b>amnion</b> and is spirally twisted (false knots).' });
    const xl = G.addLabel('Cross-section · 2 arteries + 1 vein', { pos: end.clone(), dx: -60, dy: 120, color: '#f2f4f8' });

    const ctrl = h('div', { class: 'ctrl', style: { left: '20px', bottom: '20px' } });
    ctrl.append(segmented(['Normal cord', 'Single umbilical artery'], i => { single.set(i); }));
    el.append(ctrl);

    G.update = (dt, time) => {
      const s = single.step(dt);
      C.tA.offset.x = -time * .35; C.tV.offset.x = time * .35;   // flow directions
      const k = Math.max(.001, 1 - s);
      a2m.opacity = k; a2m.transparent = k < .999; a2m.depthWrite = k > .5;
      C.arteries[1].visible = k > .02;
      aX2.visible = k > .5;
      al.el.firstChild.textContent = s > .5 ? 'Single umbilical artery' : 'Umbilical arteries · → placenta';
      xl.el.firstChild.textContent = s > .5 ? 'Single artery · 1 in 200 · ~20% defects' : 'Cross-section · 2 arteries + 1 vein';
    };
    return { maxStep: 0, enter() { activate(G); }, leave() { deactivate(G); } };
  }
};
