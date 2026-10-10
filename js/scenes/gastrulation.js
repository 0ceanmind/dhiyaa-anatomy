// Week 3: bilaminar → trilaminar disc. Disc cut transversely through the primitive streak.
import { create3D, activate, deactivate, THREE, glowSprite } from '../stage3d.js';
import { Smooth, smooth, clamp, rng, lerp } from '../ui.js';

const AX = 2.1, AY = 2.9, CUT = -.55;        // ellipse half-width (x), half-length (cranio-caudal), transverse cut
const STREAK_TOP = .55;                        // node position (shape y)
// shape (x, y) → world (x, h, -y): cranial = far (-z), caudal = near (+z)

function discShape(sx = 1) {
  const s = new THREE.Shape(); const N = 120; let first = true;
  const a0 = Math.asin(CUT / AY);               // start angle where the ellipse meets the cut
  for (let i = 0; i <= N; i++) {
    const a = a0 + (Math.PI - 2 * a0) * i / N;   // sweep over the cranial side
    const x = Math.cos(a) * AX * sx, y = Math.sin(a) * AY;
    first ? (s.moveTo(x, y), first = false) : s.lineTo(x, y);
  }
  s.lineTo(Math.cos(a0) * AX * sx, CUT);
  return s;
}
function layer(h0, h1, color, sx = 1) {
  const g = new THREE.ExtrudeGeometry(discShape(sx), { depth: h1 - h0, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2); g.translate(0, h0, 0);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: .75, emissive: color, emissiveIntensity: .06 }));
  return m;
}

export default {
  mount(el) {
    const G = create3D(el, { fov: 29, camPos: [1.7, 2.9, 6.5], target: [0, .45, -.25], minPolar: .35, maxPolar: 1.45 });
    G.controls.minAzimuthAngle = -.9; G.controls.maxAzimuthAngle = .9;
    const { scene } = G;
    G.lights('soft');
    const R = rng(21);

    const H_HYPO = .3, H_MESO = .42, H_EPI = .5;
    const grp = new THREE.Group(); scene.add(grp);
    const hypo = layer(0, H_HYPO, 0xe2d29a);
    const endo = layer(0, H_HYPO + .002, 0xf5b400);
    const meso = layer(H_HYPO, H_HYPO + H_MESO, 0xe23a52);
    const epi = layer(0, H_EPI, 0x3a7be6);
    grp.add(hypo, endo, meso, epi);

    // primitive streak (groove + folds) and node with pit — on the epiblast surface
    const streak = new THREE.Group(); grp.add(streak);
    const sLen = STREAK_TOP - CUT;
    const groove = new THREE.Mesh(new THREE.BoxGeometry(.13, .06, sLen), new THREE.MeshStandardMaterial({ color: 0x0b2a66, roughness: .4 }));
    groove.position.set(0, 0, -(CUT + sLen / 2));
    const foldG = new THREE.CapsuleGeometry(.075, sLen - .1, 6, 16); foldG.rotateX(Math.PI / 2);
    const foldM = new THREE.MeshStandardMaterial({ color: 0x7cb6ff, roughness: .35, emissive: 0x2a64c8, emissiveIntensity: .35 });
    const foldL = new THREE.Mesh(foldG, foldM), foldR = foldL.clone();
    foldL.position.set(-.14, .02, -(CUT + sLen / 2)); foldR.position.set(.14, .02, -(CUT + sLen / 2));
    const node = new THREE.Mesh(new THREE.TorusGeometry(.17, .085, 18, 40), foldM); node.rotation.x = Math.PI / 2; node.position.set(0, .03, -STREAK_TOP - .08);
    const pit = new THREE.Mesh(new THREE.CircleGeometry(.1, 32), new THREE.MeshBasicMaterial({ color: 0x061a44 })); pit.rotation.x = -Math.PI / 2; pit.position.set(0, .012, -STREAK_TOP - .08);
    streak.add(groove, foldL, foldR, node, pit);
    // prechordal plate marker (cranial)
    const pcp = new THREE.Group(); grp.add(pcp);
    const pcpRing = new THREE.Mesh(new THREE.TorusGeometry(.38, .03, 12, 64), new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true }));
    pcpRing.rotation.x = Math.PI / 2;
    const pcpFill = new THREE.Mesh(new THREE.CircleGeometry(.38, 48), new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true, opacity: .25, depthWrite: false }));
    pcpFill.rotation.x = -Math.PI / 2;
    pcp.add(pcpRing, pcpFill, glowSprite(0xffd60a, 1.6, .5));
    pcp.position.set(0, 0, -(AY - .55));

    // migrating epiblast cells: A = on the dorsal surface, B = in the transverse section (cut face)
    const NA = 210, NB = 300, NT = NA + NB;
    const cellG = new THREE.SphereGeometry(1, 14, 10);
    const cellM = new THREE.MeshStandardMaterial({ roughness: .4, emissiveIntensity: .25 });
    const cells = new THREE.InstancedMesh(cellG, cellM, NT); cells.frustumCulled = false; grp.add(cells);
    const P = [];
    const halfW = y => AX * Math.sqrt(Math.max(0, 1 - (y / AY) ** 2));
    const WFACE = halfW(CUT) - .12;
    for (let i = 0; i < NT; i++) {
      const sec = i >= NA;
      const wave = sec ? (i - NA < 120 ? 0 : 1) : (i < NA * .45 ? 0 : 1);
      const side = R() < .5 ? -1 : 1;
      if (!sec) {
        const y0 = CUT + .05 + R() * (STREAK_TOP - CUT + .9);
        const x0 = side * (.3 + R() * (halfW(y0) - .4));
        P.push({ sec, wave, x0, y0, ys: clamp(y0, CUT + .02, STREAK_TOP), d: R(), s: .042 + R() * .016 });
      } else {
        P.push({ sec, wave, x0: side * (.25 + R() * (WFACE - .25)), hf: R(), xt: side * (.1 + Math.pow(R(), .8) * (WFACE - .1)), ht: R(), d: R(), s: .07 + R() * .02 });
      }
    }
    const cBlue = new THREE.Color(0xdcebff), cYel = new THREE.Color(0xffd23f), cRed = new THREE.Color(0xff5a6e), tmpC = new THREE.Color();
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    for (let i = 0; i < NT; i++) cells.setColorAt(i, cBlue);

    // labels
    const T = new Smooth(0, 1.6);
    const W = (x, h, y) => new THREE.Vector3(x, h, -y);
    G.addLabel('Prechordal plate', { pos: () => pcp.position.clone().add(new THREE.Vector3(0, .4, 0)), dx: 0, dy: -50, color: '#ffd60a', visible: () => T.v < 1.6, tt: 'Prechordal plate', tb: 'Day 14: a localized area of hypoblast becomes <b>columnar</b> — marks the future <b>head end</b> and the central axis.' });
    G.addLabel('Primitive node', { pos: () => node.position.clone().add(new THREE.Vector3(0, epi.position.y + H_EPI, 0)), dx: -150, dy: -40, color: '#7cb6ff', visible: () => T.v > .6 && T.v < 2.6, tt: 'Primitive node (knot)', tb: 'Globular swelling at the cranial end of the streak. Its depression is the <b>primitive pit</b>.' });
    G.addLabel('Primitive streak & groove', { pos: () => W(0, epi.position.y + H_EPI, CUT + .25), dx: 170, dy: 30, color: '#7cb6ff', visible: () => T.v > .6 && T.v < 2.6, tt: 'Primitive streak', tb: 'Epiblast cells proliferate and migrate to the midline at the <b>caudal</b> end. It defines cranial–caudal, dorsal–ventral and left–right axes.' });
    G.addLabel('Epiblast', { pos: () => W(-1.55, epi.position.y + H_EPI / 2, CUT), dx: -110, color: '#4f9dff', visible: () => T.v < 3.5 });
    G.addLabel('Hypoblast', { pos: W(1.55, H_HYPO / 2, CUT), dx: 110, color: '#f3e7b0', visible: () => T.v < 1.6 });
    G.addLabel('Endoderm', { pos: W(1.6, H_HYPO / 2, CUT), dx: 120, dy: 10, color: '#ffc21a', visible: () => T.v > 1.6, tt: 'Embryonic endoderm', tb: 'The first invaginating epiblast cells <b>displace and replace the hypoblast</b>.' });
    G.addLabel('Mesoderm', { pos: W(1.6, H_HYPO + H_MESO / 2, CUT), dx: 120, dy: 0, color: '#ff5a6e', visible: () => T.v > 2.6, tt: 'Intraembryonic mesoderm', tb: 'Cells spread between the epiblast and the new endoderm in all directions — except at the oropharyngeal and cloacal membranes.' });
    G.addLabel('Ectoderm', { pos: () => W(-1.55, epi.position.y + H_EPI / 2, CUT), dx: -110, color: '#4f9dff', visible: () => T.v > 3.5, tt: 'Embryonic ectoderm', tb: 'Epiblast cells that remain. <b>All three germ layers come from the epiblast.</b>' });
    G.addLabel('Cranial', { pos: W(1.2, .1, AY - .2), dx: 60, dy: -20, color: '#7c7c84', visible: () => true });
    G.addLabel('Caudal (cut)', { pos: W(0, -.15, CUT - .35), dy: 34, color: '#7c7c84', visible: () => true });

    G.update = (dt, time) => {
      const t = T.step(dt);
      const st = smooth(.2, 1, t);            // streak forms
      const pE = smooth(1.05, 2, t);          // endoderm wave
      const pM = smooth(2.05, 3, t);          // mesoderm wave
      const ecto = smooth(3.2, 3.9, t);
      // layers
      endo.scale.x = Math.max(.001, pE); endo.visible = pE > .002;
      meso.scale.x = Math.max(.001, pM); meso.visible = pM > .002;
      const lift = H_HYPO + H_MESO * pM; epi.position.y = H_HYPO + (lift - H_HYPO);
      epi.material.color.set(0x3a7be6).lerp(new THREE.Color(0x2459d0), ecto);
      streak.position.y = epi.position.y + H_EPI;
      streak.scale.set(1, 1, Math.max(.001, st)); streak.visible = st > .01;
      streak.position.z = (1 - st) * -(CUT); // grows from the caudal end
      pcp.position.y = epi.position.y + H_EPI + .01;
      pcpRing.material.opacity = 1 - smooth(1.2, 1.8, t); pcpFill.material.opacity = .25 * (1 - smooth(1.2, 1.8, t));
      pcp.visible = t < 1.85;
      const shown = smooth(.5, 1, t) * (1 - smooth(3.5, 4, t) * .85);
      cells.visible = shown > .01;
      const top = epi.position.y + H_EPI, base = epi.position.y;
      const zFace = -CUT + .035;
      for (let i = 0; i < NT; i++) {
        const c = P[i];
        const pw = c.wave ? pM : pE;
        const pre = c.wave ? pE * .2 : 0;
        const u = clamp((Math.max(pw, pre) - c.d * .45) / .55);
        let x, h, z, flask = 0, col = cBlue, k, vis = shown;
        if (!c.sec) {
          if (u < .7) { k = u / .7; x = lerp(c.x0, Math.sign(c.x0) * .1, k * k); z = -lerp(c.y0, c.ys, k); h = top + c.s * .8; flask = smooth(.75, 1, k); }
          else { k = (u - .7) / .3; x = Math.sign(c.x0) * .1 * (1 - k); z = -c.ys; h = top + c.s * .8 - k * .45; flask = 1; vis *= 1 - k; }
          if (c.y0 < CUT) vis = 0;
        } else {
          const hEpi = lerp(base + .06, top - .06, c.hf);
          const hT = c.wave ? lerp(H_HYPO + .08, H_HYPO + H_MESO * Math.max(pM, .35) - .08, c.ht) : lerp(.07, H_HYPO - .07, c.ht);
          z = zFace; vis = smooth(.5, 1, t);
          if (u < .38) { k = u / .38; x = lerp(c.x0, Math.sign(c.x0) * .1, k * k); h = lerp(hEpi, top - .12, k); flask = smooth(.55, 1, k); }
          else if (u < .58) { k = (u - .38) / .2; x = Math.sign(c.x0) * .1 * (1 - k * .5); h = lerp(top - .12, hT, k); flask = 1 - k * .7; }
          else { k = (u - .58) / .42; const e = 1 - (1 - k) ** 2; x = lerp(Math.sign(c.x0) * .05, c.xt, e); h = hT; col = c.wave ? cRed : cYel; }
          if (u <= 0) { x = c.x0; h = hEpi; }
        }
        tmpC.copy(cBlue).lerp(col, c.sec && u > .5 ? clamp((u - .5) / .15) : 0);
        cells.setColorAt(i, tmpC);
        v.set(x, h, z);
        sc.set(c.s * (1 - flask * .35), c.s * (1 + flask * 1.8), c.s * (1 - flask * .35)).multiplyScalar(vis);
        q.identity();
        m4.compose(v, q, sc); cells.setMatrixAt(i, m4);
      }
      cells.instanceMatrix.needsUpdate = true; cells.instanceColor.needsUpdate = true;
    };

    return {
      maxStep: 4,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { T.set(n); if (initial) T.jump(n); }
    };
  }
};
