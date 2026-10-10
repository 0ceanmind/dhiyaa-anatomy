// Oocyte + corona radiata + zona pellucida + swimming sperm.
// mode "cover": ambient swarm · mode "phases": six-phase fertilization stepper.
import { create3D, activate, deactivate, THREE, cellMaterial, dustField, glowSprite, NOISE_GLSL } from '../stage3d.js';
import { Smooth, clamp, smooth, rng } from '../ui.js';

const R_OO = 1.5, R_ZI = 1.62, R_ZO = 1.86;

function zonaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uHard: { value: 0 }, uRip: { value: -1 }, uDir: { value: new THREE.Vector3(1, 0, 0) }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vO; void main(){ vO = normalize(position); vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: NOISE_GLSL + `uniform float uHard, uRip, uTime; uniform vec3 uDir; varying vec3 vN; varying vec3 vV; varying vec3 vO;
      void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.6);
        vec3 soft = vec3(.62,.82,1.); vec3 hard = vec3(1.,.72,.32);
        vec3 c = mix(soft, hard, uHard);
        float g = fbm(vO*7. + uTime*.03);
        float ang = acos(clamp(dot(vO, normalize(uDir)), -1., 1.));
        float wave = uRip > 0. ? exp(-pow((ang - uRip*3.1416)*5., 2.)) * (1.-uRip*.6) : 0.;
        float a = (0.10 + 0.55*f) * (0.75 + .5*g) + uHard*.12 + wave*.55;
        gl_FragColor = vec4(c*(.8+wave*1.6), clamp(a,0.,1.));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide
  });
}

function makeSperm(count, beads = 36) {
  const headGeo = new THREE.SphereGeometry(1, 18, 14); headGeo.scale(.075, .058, .12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xe6f1ff, emissive: 0x6d8fbf, emissiveIntensity: .55, roughness: .35, metalness: .1 });
  const heads = new THREE.InstancedMesh(headGeo, headMat, count);
  const beadGeo = new THREE.SphereGeometry(1, 8, 6);
  const beadMat = new THREE.MeshStandardMaterial({ color: 0xcfe2ff, emissive: 0x5577aa, emissiveIntensity: .5, roughness: .5 });
  const tails = new THREE.InstancedMesh(beadGeo, beadMat, count * beads);
  heads.frustumCulled = tails.frustumCulled = false;
  return { heads, tails, beads };
}

const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), zAxis = new THREE.Vector3(0, 0, 1), sc = new THREE.Vector3();

// write one sperm (head at p, swimming along d) into instance buffers
function writeSperm(S, i, p, d, phase, amp, scale = 1, tailScale = 1) {
  q.setFromUnitVectors(zAxis, d);
  sc.setScalar(scale);
  m4.compose(p, q, sc); S.heads.setMatrixAt(i, m4);
  // perpendicular basis
  v1.crossVectors(d, Math.abs(d.y) > .9 ? zAxis : up).normalize();
  const sp = .027 * scale;
  for (let b = 0; b < S.beads; b++) {
    const t = b / S.beads;
    const off = Math.sin(phase - b * .42) * amp * Math.min(1, t * 2.2) * scale;
    v2.copy(p).addScaledVector(d, -(.13 * scale + b * sp)).addScaledVector(v1, off);
    const r = (.022 - .009 * t) * scale * tailScale;
    sc.setScalar(Math.max(0.0001, r));
    m4.compose(v2, q, sc); S.tails.setMatrixAt(i * S.beads + b, m4);
  }
}

export default {
  mount(el, opts = {}) {
    const cover = opts.mode !== 'phases';
    const G = create3D(el, cover
      ? { fov: 32, camPos: [0, 1.2, 9.2], autoRotate: true, autoRotateSpeed: .35, minPolar: .6, maxPolar: 2.4 }
      : { fov: 34, camPos: [3.2, 2.2, 7.4], autoRotate: false, minPolar: .3, maxPolar: 2.8 });
    if (cover) { G.shiftX = .2; G.shiftY = -.04; }
    const { scene } = G;
    G.lights('soft');
    const R = rng(cover ? 7 : 11);

    // oocyte
    const ooMat = cellMaterial({ color: 0xffa98f, rim: 0xffd7c4, rimPow: 2.2, rimInt: .9, grain: .5, scale: 3.2, emissive: .12 });
    const oocyte = new THREE.Mesh(new THREE.SphereGeometry(R_OO, 96, 64), ooMat);
    oocyte.renderOrder = 1; scene.add(oocyte);
    const ooGlow = glowSprite(0xff8a7a, cover ? 7.5 : 4.4, cover ? .35 : .22); scene.add(ooGlow);

    // zona pellucida
    const zMat = zonaMaterial();
    const zona = new THREE.Mesh(new THREE.SphereGeometry(R_ZO, 96, 64), zMat); zona.renderOrder = 2;
    const zonaIn = new THREE.Mesh(new THREE.SphereGeometry(R_ZI, 64, 48), new THREE.MeshBasicMaterial({ color: 0x9cc8ff, transparent: true, opacity: .05, depthWrite: false, side: THREE.BackSide }));
    scene.add(zona, zonaIn);

    // corona radiata
    const NC = cover ? 760 : 560;
    const cGeo = new THREE.IcosahedronGeometry(1, 3);
    const cMat = cellMaterial({ color: 0xf2a0bb, rim: 0xffe3ee, rimPow: 1.8, rimInt: .75, grain: .45, scale: 7, emissive: .06 });
    const corona = new THREE.InstancedMesh(cGeo, cMat, NC); corona.frustumCulled = false;
    const cData = [];
    for (let i = 0; i < NC; i++) {
      const dir = new THREE.Vector3(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize();
      const r = 1.95 + Math.pow(R(), 1.7) * (cover ? .62 : .5);
      cData.push({ dir, r, s: .05 + R() * .045, ph: R() * 6.28, el: new THREE.Vector3(1 + R() * .5, .7 + R() * .3, .8 + R() * .3) });
    }
    scene.add(corona);
    scene.add(dustField(cover ? 700 : 300, cover ? 26 : 18, 0x8ea2ff, .05));

    // sperm
    const NS = cover ? 46 : 16;
    const S = makeSperm(NS); scene.add(S.heads, S.tails);
    const sp = [];
    const spawn = (o, far = true) => {
      const dir = new THREE.Vector3(R() * 2 - 1, (R() * 2 - 1) * .7, R() * 2 - 1).normalize();
      o.target = dir.clone();
      o.stopR = 2.0 + R() * .45;
      o.r = far ? 6 + R() * 7 : o.stopR + R() * .3;
      o.lat = new THREE.Vector3(R() - .5, R() - .5, R() - .5).multiplyScalar(far ? 3 : 0);
      o.speed = .55 + R() * .5; o.phase = R() * 6.28; o.wig = 9 + R() * 4; o.amp = .05 + R() * .03; o.back = 0;
      o.p = new THREE.Vector3(); o.d = new THREE.Vector3();
    };
    for (let i = 0; i < NS; i++) { const o = {}; spawn(o, cover ? true : false); if (cover) o.r = 2.6 + R() * 11; sp.push(o); }

    // ---------- phases-only props ----------
    const T = new Smooth(0, 1.6);
    const entry = new THREE.Vector3(.72, .38, .58).normalize();
    const pbDir = new THREE.Vector3(-.35, .86, .36).normalize();
    let polar, femP, maleP, chromo, flash, enzyme;
    if (!cover) {
      const pmat = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .7, roughness: .3, transparent: true, opacity: .95 });
      polar = new THREE.Mesh(new THREE.SphereGeometry(.2, 32, 24), cellMaterial({ color: 0xffb9a3, rim: 0xffffff, grain: .4, scale: 6 }));
      femP = new THREE.Mesh(new THREE.SphereGeometry(.27, 32, 24), pmat(0xff5fa2));
      maleP = new THREE.Mesh(new THREE.SphereGeometry(.27, 32, 24), pmat(0x4f9dff));
      femP.add(glowSprite(0xff5fa2, 1.4, .7)); maleP.add(glowSprite(0x4f9dff, 1.4, .7));
      scene.add(polar, femP, maleP);
      // 46 chromosomes (23 maternal pink + 23 paternal blue) on a metaphase plate
      const cg = new THREE.CapsuleGeometry(.018, .11, 4, 8);
      chromo = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ roughness: .4, emissiveIntensity: .6 }), 46);
      const colA = new THREE.Color(0xff5fa2), colB = new THREE.Color(0x4f9dff);
      for (let i = 0; i < 46; i++) chromo.setColorAt(i, i % 2 ? colA : colB);
      chromo.userData.pos = Array.from({ length: 46 }, (_, i) => { const a = i / 46 * Math.PI * 2 * 3.1, rr = .06 + .3 * Math.sqrt(i / 46); return [Math.cos(a) * rr, Math.sin(a) * rr, (R() - .5) * .06, R() * 3]; });
      scene.add(chromo);
      flash = glowSprite(0xffffff, 1.6, 0); scene.add(flash);
      enzyme = glowSprite(0x34d399, 1.2, 0); scene.add(enzyme);
      // labels
      const t = () => T.v;
      G.addLabel('Corona radiata', { pos: new THREE.Vector3(-1.5, -1.6, 1.2).normalize().multiplyScalar(2.45), color: '#f6a7c1', visible: () => t() < 2.6, tt: 'Corona radiata', tb: 'Follicular cells surrounding the oocyte. Penetrated with the help of <b>hyaluronidase</b>, tubal mucosal enzymes and sperm tail movements.' });
      const zl = G.addLabel('Zona pellucida', { pos: new THREE.Vector3(-1, .25, .9).normalize().multiplyScalar(R_ZO), color: '#9cc8ff', visible: () => T.v < 3.4, tt: 'Zona pellucida', tb: 'Glycoprotein coat. After one sperm enters, the <b>zona reaction</b> alters its composition so it becomes impermeable to other sperm.' });
      G.addLabel('Hyaluronidase', { pos: () => S.leadPos || entry, dx: 90, dy: -40, color: '#34d399', visible: () => t() > .15 && t() < 1.05 });
      G.addLabel('2nd polar body', { pos: pbDir.clone().multiplyScalar(R_OO + .16), dx: 0, dy: -46, color: '#ffb9a3', visible: () => t() > 3.35 });
      G.addLabel('Female pronucleus · 22,X', { pos: () => femP.position, dx: -170, dy: 60, color: '#ff5fa2', visible: () => t() > 3.55 && t() < 5.55 });
      G.addLabel('Male pronucleus · 22,X/Y', { pos: () => maleP.position, dx: 150, dy: -64, color: '#4f9dff', visible: () => t() > 4.5 && t() < 5.55 });
      G.addLabel('Ootid', { pos: new THREE.Vector3(0, -R_OO, 0), dy: 40, color: '#ffd7c4', visible: () => t() > 4.6 && t() < 5.4 });
      G.addLabel('Zygote · 46 chromosomes', { pos: new THREE.Vector3(0, 0, 0), dy: 70, color: '#ffffff', visible: () => t() > 5.6, tt: 'Zygote', tb: 'Both pronuclei replicate their DNA, then unite into one diploid set: <b>23 maternal + 23 paternal</b> chromosomes.' });
      G._zl = zl;
    }

    // ---------- animation ----------
    G.update = (dt, time) => {
      const tt = T.step(dt);
      ooMat.uniforms.uTime.value = time; zMat.uniforms.uTime.value = time;
      // corona
      const hard = cover ? 0 : smooth(1.25, 2.1, tt);
      const disperse = cover ? 0 : smooth(2.4, 3.6, tt);
      for (let i = 0; i < NC; i++) {
        const c = cData[i];
        let r = c.r + Math.sin(time * .8 + c.ph) * .015 + disperse * (1.6 + (i % 7) * .35);
        v1.copy(c.dir);
        if (!cover) { // open a tunnel around the lead sperm path
          const ang = v1.angleTo(entry);
          if (ang < .5) { const push = smooth(0, .9, tt) * (1 - ang / .5) * .5; v2.copy(v1).sub(entry).normalize(); v1.addScaledVector(v2, push).normalize(); }
        }
        v1.multiplyScalar(r);
        q.setFromUnitVectors(up, c.dir);
        sc.copy(c.el).multiplyScalar(c.s * (1 - disperse * .6));
        m4.compose(v1, q, sc); corona.setMatrixAt(i, m4);
      }
      corona.instanceMatrix.needsUpdate = true;
      cMat.uniforms.uOp.value = 1 - disperse; cMat.transparent = disperse > .001; cMat.depthWrite = disperse < .3; corona.visible = disperse < .99;
      ooMat.uniforms.uOp.value = cover ? 1 : 1 - .72 * smooth(2.3, 3.2, tt); ooMat.transparent = !cover && tt > 2.3; ooMat.depthWrite = !ooMat.transparent;
      // zona reaction
      zMat.uniforms.uHard.value = hard;
      zMat.uniforms.uDir.value.copy(entry);
      zMat.uniforms.uRip.value = cover ? -1 : (tt > 1.35 && tt < 2.6 ? (tt - 1.35) / 1.25 : -1);
      if (G._zl) G._zl.el.firstChild.textContent = hard > .5 ? 'Zona reaction · hardened' : 'Zona pellucida';

      // sperm
      for (let i = 0; i < NS; i++) {
        const o = sp[i];
        o.phase += dt * o.wig;
        if (cover) {
          if (o.r > o.stopR) o.r -= dt * o.speed * (o.r > 4 ? 1.3 : .6);
          else o.r = o.stopR + Math.sin(time * 2 + i) * .03;
          o.lat.multiplyScalar(1 - dt * .4);
          o.p.copy(o.target).multiplyScalar(o.r).add(o.lat);
          o.d.copy(o.target).multiplyScalar(-1).normalize();
          if (o.r <= o.stopR + .05) { o.stay = (o.stay || 0) + dt; if (o.stay > 9 + (i % 5)) { o.stay = 0; spawn(o, true); } }
          writeSperm(S, i, o.p, o.d, o.phase, o.amp * (o.r > o.stopR + .1 ? 1 : .6));
        } else if (i === 0) {
          // lead sperm along the entry path
          let r;
          if (tt < 1) r = 3.5 - (3.5 - 1.95) * smooth(0, 1, tt);
          else if (tt < 2) r = 1.95 - (1.95 - R_ZI + .02) * smooth(1, 2, tt);
          else if (tt < 3) r = R_ZI - .02 - (R_ZI - 1.12) * smooth(2, 3, tt);
          else if (tt < 4) r = 1.12 - .22 * smooth(3, 4, tt);
          else r = .9;
          o.p.copy(entry).multiplyScalar(r);
          o.d.copy(entry).multiplyScalar(-1);
          const toMale = smooth(4, 4.9, tt);
          // fuse phase: move male pronucleus toward centre
          const fuse = smooth(5, 5.85, tt);
          if (tt > 4) { maleP.position.copy(entry).multiplyScalar(.9 - .62 * fuse); }
          const headScale = 1 - toMale;
          writeSperm(S, 0, o.p, o.d, o.phase, .045 * (1 - smooth(2.6, 3.4, tt)) + .01, Math.max(.001, headScale), 1);
          S.leadPos = o.p;
          maleP.scale.setScalar(Math.max(.001, toMale) * (1 - smooth(5.6, 6, tt) * .7));
          maleP.visible = toMale > .01;
          // enzyme glow + entry flash
          enzyme.position.copy(o.p); enzyme.material.opacity = (tt > .1 && tt < 1.1) ? .7 + Math.sin(time * 8) * .2 : Math.max(0, enzyme.material.opacity - dt * 2);
          flash.position.copy(entry).multiplyScalar(R_OO);
          flash.material.opacity = Math.max(0, 1 - Math.abs(tt - 2.25) * 3) * 1.2;
          flash.scale.setScalar(1 + (tt - 2) * 1.2);
        } else {
          // other sperm stuck in the corona; pushed back after zona reaction
          const back = hard * .45 + disperse * .5;
          const r = o.stopR + back + Math.sin(time * 2 + i) * .03;
          o.p.copy(o.target).multiplyScalar(r);
          o.d.copy(o.target).multiplyScalar(-1);
          writeSperm(S, i, o.p, o.d, o.phase, o.amp * .7, Math.max(.001, 1 - disperse));
        }
      }
      S.heads.instanceMatrix.needsUpdate = true; S.tails.instanceMatrix.needsUpdate = true;

      if (!cover) {
        const pb = smooth(3, 3.6, tt);
        polar.position.copy(pbDir).multiplyScalar(R_OO + .13 * pb);
        polar.scale.setScalar(Math.max(.001, pb));
        const fem = smooth(3.15, 3.9, tt), fuse = smooth(5, 5.85, tt);
        femP.position.copy(pbDir).multiplyScalar(.95 - .67 * fuse);
        femP.scale.setScalar(Math.max(.001, fem) * (1 - smooth(5.6, 6, tt) * .7));
        femP.visible = fem > .01;
        // chromosomes appear as pronuclei unite
        const ch = smooth(5.5, 6, tt);
        chromo.visible = ch > .01;
        const P = chromo.userData.pos;
        for (let i = 0; i < 46; i++) {
          const [x, y, z, ph] = P[i];
          v1.set(x, y, z).multiplyScalar(.4 + .6 * ch); v1.y += Math.sin(time * 1.5 + ph) * .01;
          q.setFromAxisAngle(zAxis, ph); sc.setScalar(ch);
          m4.compose(v1, q, sc); chromo.setMatrixAt(i, m4);
        }
        chromo.instanceMatrix.needsUpdate = true;
        chromo.rotation.y = time * .3;
      }
      ooGlow.material.opacity = (cover ? .28 : .18) + Math.sin(time * .9) * .04;
    };

    return {
      maxStep: cover ? 0 : 5,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { if (cover) return; T.set(n + 1); if (initial && n > 0) T.jump(n + 1); }
    };
  }
};
