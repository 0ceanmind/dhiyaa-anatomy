// Rotating DNA double helix; hovering a genetic-cause category on the slide recolours it.
import { create3D, activate, deactivate, THREE, dustField, glowSprite } from '../stage3d.js';
import { Smooth } from '../ui.js';

export default {
  mount(el, opts, api) {
    const G = create3D(el, { fov: 32, camPos: [0, 0, 11], autoRotate: false, minPolar: .8, maxPolar: 2.3 });
    const { scene } = G;
    G.lights('soft');
    scene.add(dustField(400, 18, 0x9a8cff, .05));
    const helixG = new THREE.Group(); scene.add(helixG); helixG.rotation.z = .5;
    const N = 46, H = 9, RAD = 1.15, TURNS = 2.4;
    const pt = (i, ph) => { const t = i / (N - 1), a = t * TURNS * Math.PI * 2 + ph; return new THREE.Vector3(Math.cos(a) * RAD, (t - .5) * H, Math.sin(a) * RAD); };
    const bbMat = new THREE.MeshStandardMaterial({ color: 0xdfe6ff, roughness: .3, metalness: .1, emissive: 0x334488, emissiveIntensity: .35 });
    [0, Math.PI].forEach(ph => {
      const c = new THREE.CatmullRomCurve3(Array.from({ length: N }, (_, i) => pt(i, ph)));
      helixG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 300, .11, 16), bbMat));
    });
    const pairCols = [0xff6fae, 0x64d2ff, 0xff9f0a, 0x34d399];
    const rungs = [];
    for (let i = 1; i < N - 1; i++) {
      const a = pt(i, 0), b = pt(i, Math.PI), mid = a.clone().add(b).multiplyScalar(.5);
      for (const [p, k] of [[a, 0], [b, 1]]) {
        const len = p.distanceTo(mid);
        const m = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, len, 10), new THREE.MeshStandardMaterial({ color: pairCols[(i * 2 + k) % 4], roughness: .4, emissive: pairCols[(i * 2 + k) % 4], emissiveIntensity: .35 }));
        m.position.copy(p).add(mid).multiplyScalar(.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mid.clone().sub(p).normalize());
        helixG.add(m); rungs.push(m);
      }
      const n1 = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), bbMat); n1.position.copy(a); helixG.add(n1);
      const n2 = n1.clone(); n2.position.copy(b); helixG.add(n2);
    }
    const glow = glowSprite(0x8f7bff, 9, .25); scene.add(glow);

    // hovering a category on the slide tints the helix
    const tint = new THREE.Color(0xdfe6ff), target = new THREE.Color(0xdfe6ff);
    api.slide.querySelectorAll('ul.points li').forEach(li => {
      const c = getComputedStyle(li).getPropertyValue('--dot').trim() || li.style.getPropertyValue('--dot');
      li.addEventListener('mouseenter', () => { try { target.set(c || '#dfe6ff'); } catch (e) { } });
      li.addEventListener('mouseleave', () => target.set(0xdfe6ff));
    });
    const spin = new Smooth(0, 3);
    G.update = (dt, time) => {
      helixG.rotation.y += dt * .35;
      tint.lerp(target, 1 - Math.exp(-dt * 6));
      bbMat.color.copy(tint); bbMat.emissive.copy(tint).multiplyScalar(.35);
      glow.material.color.copy(tint);
      helixG.position.y = Math.sin(time * .6) * .12;
    };
    return { maxStep: 0, enter() { activate(G); }, leave() { deactivate(G); } };
  }
};
