// Full-term placenta: fetal surface (amnion, chorionic vessels, eccentric cord) ↔ maternal surface (cotyledons).
import { create3D, activate, deactivate, THREE } from '../stage3d.js';
import { Smooth, smooth, rng } from '../ui.js';
import { buildCord } from './cord.js';

const RAD = 2.7, TH = .5;
const INS = new THREE.Vector2(.62, .38);   // eccentric cord insertion (x, z)

export default {
  mount(el) {
    const G = create3D(el, { fov: 30, camPos: [0, 7.8, 7.0], target: [0, -.1, .3], minPolar: .2, maxPolar: 1.6 });
    const { scene } = G;
    G.lights('soft');
    const R = rng(13);

    // cotyledon seeds on the maternal side (≈18 lobes)
    const seeds = [];
    while (seeds.length < 18) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * RAD * .9; const p = new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r); if (seeds.every(q => q.distanceTo(p) > .75)) seeds.push(p); }
    const worley = (x, z) => { let d1 = 1e9, d2 = 1e9; for (const s of seeds) { const d = Math.hypot(x - s.x, z - s.y); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; } return [d1, d2]; };

    // lens-shaped disc
    const prof = [];
    const NP = 48;
    for (let i = 0; i <= NP; i++) { const t = i / NP, a = t * Math.PI; const r = Math.sin(a) * RAD, y = Math.cos(a) * TH * (.55 + .45 * Math.sin(a)); prof.push(new THREE.Vector2(Math.max(.0001, r), y)); }
    const geo = new THREE.LatheGeometry(prof, 180);
    const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3);
    const cMat = new THREE.Color(0x5e1020), cGroove = new THREE.Color(0x22050b), cFet = new THREE.Color(0x9d8fb8), cEdge = new THREE.Color(0x6e3a55), tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const rr = Math.hypot(x, z) / RAD;
      if (y < 0) {
        const [d1, d2] = worley(x, z);
        const groove = 1 - smooth(0, .16, d2 - d1);
        const lobe = .07 * (1 - smooth(0, .9, d1));
        y = y - lobe + groove * .1 * (1 - rr * .4);
        tmp.copy(cMat).lerp(cGroove, groove * .9);
        tmp.offsetHSL(0, 0, (R() - .5) * .04);
      } else {
        tmp.copy(cFet).lerp(cEdge, smooth(.8, 1, rr));
      }
      pos.setY(i, y);
      colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const disc = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .55, clearcoat: .6, clearcoatRoughness: .35, sheen: .6, sheenColor: new THREE.Color(0xd8c8ff) }));
    const plac = new THREE.Group(); plac.add(disc); scene.add(plac);

    // fetal-surface height at (x, z)
    const topY = (x, z) => { const r = Math.min(.999, Math.hypot(x, z) / RAD); const a = Math.asin(r); return Math.cos(a) * TH * (.55 + .45 * Math.sin(a)); };
    // chorionic vessels radiating from the eccentric insertion
    const vessels = new THREE.Group(); plac.add(vessels);
    const vMatA = new THREE.MeshStandardMaterial({ color: 0x3567d6, roughness: .35, emissive: 0x0d2a6a, emissiveIntensity: .25 });
    const vMatV = new THREE.MeshStandardMaterial({ color: 0xc0283e, roughness: .35, emissive: 0x4a0a14, emissiveIntensity: .25 });
    function branch(x, z, ang, len, rad, depth, mat) {
      const pts = []; let cx = x, cz = z, a = ang;
      const n = 10;
      for (let i = 0; i <= n; i++) {
        const r = Math.hypot(cx, cz); if (r > RAD * .93) break;
        pts.push(new THREE.Vector3(cx, topY(cx, cz) + rad * .6, cz));
        a += (R() - .5) * .35; cx += Math.cos(a) * len / n; cz += Math.sin(a) * len / n;
      }
      if (pts.length > 2) {
        vessels.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, rad, 10), mat));
        if (depth > 0) for (let k = 0; k < 2; k++) { const p = pts[Math.floor(pts.length * (.35 + .3 * k))]; branch(p.x, p.z, a + (k ? .7 : -.7) + (R() - .5) * .3, len * .55, rad * .66, depth - 1, mat); }
      }
    }
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + R() * .3; branch(INS.x, INS.y, a, 2.4 + R() * .6, .055, 2, i % 2 ? vMatV : vMatA); }

    // umbilical cord rising from the insertion
    const iy = topY(INS.x, INS.y);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(INS.x, iy - .05, INS.y), new THREE.Vector3(INS.x + .1, iy + .9, INS.y + .1), new THREE.Vector3(INS.x + 1.1, iy + 1.7, INS.y + .9), new THREE.Vector3(INS.x + 2.6, iy + 1.9, INS.y + 1.8)]);
    const cord = buildCord(curve, { R: .2, turns: 5, seg: 220, jellyOpacity: .5 });
    plac.add(cord.group);

    // diameter dimension line
    const dim = new THREE.Group(); scene.add(dim);
    const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6 });
    const lineG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-RAD, 0, RAD + .5), new THREE.Vector3(RAD, 0, RAD + .5)]);
    dim.add(new THREE.Line(lineG, lm));
    [-RAD, RAD].forEach(x => dim.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, RAD + .3), new THREE.Vector3(x, 0, RAD + .7)]), lm)));

    const F = new Smooth(0, 2.4);
    const fetal = () => F.v < .5, maternal = () => F.v > .5;
    G.addLabel('Fetal surface · smooth, amnion-covered', { pos: new THREE.Vector3(-1.2, .5, -1.0), dy: -30, color: '#b9a8e6', visible: () => F.v < .15, tt: 'Fetal surface', tb: 'Smooth, covered by <b>amnion</b>; chorionic vessels converge on the umbilical cord.' });
    G.addLabel('Chorionic vessels', { pos: new THREE.Vector3(-1.4, .4, .9), dx: -40, dy: 40, color: '#ff6a7d', visible: () => F.v < .15 });
    G.addLabel('Cord · eccentric insertion', { pos: new THREE.Vector3(INS.x + 1.1, iy + 1.7, INS.y + .9), dx: 40, dy: -50, color: '#e9eef7', visible: () => F.v < .15 });
    G.addLabel('Cotyledons · 15–20', { pos: new THREE.Vector3(-.9, .45, -.6), dy: -40, color: '#ff5a6e', visible: () => F.v > .85, tt: 'Maternal surface', tb: 'Irregular, with <b>15–20 cotyledons</b> separated by deep grooves formed by the <b>placental (decidual) septa</b>.' });
    G.addLabel('Grooves · placental septa', { pos: new THREE.Vector3(1.3, .45, .7), dy: 40, color: '#b4b4bb', visible: () => F.v > .85 });
    G.addLabel('15–25 cm', { pos: new THREE.Vector3(0, 0, RAD + .5), dy: -34, color: '#ffffff' });

    G.update = (dt) => {
      const f = F.step(dt);
      plac.rotation.x = f * Math.PI;
      plac.position.y = Math.sin(f * Math.PI) * .6;
      cord.tA.offset.x -= dt * .3; cord.tV.offset.x += dt * .3;
    };
    return {
      maxStep: 1,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { F.set(n); if (initial) F.jump(n); }
    };
  }
};
