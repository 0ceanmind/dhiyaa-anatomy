// Week 2: the implanted conceptus as a sliced 3D specimen (Langman Figs 4.1–4.6 orientation:
// uterine epithelium below, embryonic disc toward the deep endometrium).
import { create3D, activate, deactivate, THREE, glowSprite } from '../stage3d.js';
import { Smooth, smooth, clamp, rng } from '../ui.js';

const C = new THREE.Vector3(0, .15, 0);

// cheap deterministic 3D value noise
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const bump = (x, y, z, amp) => 1 + amp * (noise3(x * 1.7 + 3, y * 1.7, z * 1.7) - .5) * 2 + amp * .5 * (noise3(x * 4, y * 4 + 7, z * 4) - .5);

function grainTexture(seed = 1, tint = 255) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const R = rng(seed); g.fillStyle = `rgb(${tint},${tint},${tint})`; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const r = 2 + R() * 7; g.fillStyle = `rgba(0,0,0,${.04 + R() * .08})`; g.beginPath(); g.arc(R() * 256, R() * 256, r, 0, 7); g.fill(); }
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${.05 + R() * .08})`; g.beginPath(); g.arc(R() * 256, R() * 256, 1 + R() * 3, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}

// A hemispherical shell (z ≤ 0) with a flat cut face at z = 0.
function halfShell(rOut, rIn, color, { amp = 0, capColor, opacity = 1, seg = 72, innerColor } = {}) {
  const g = new THREE.Group();
  const tex = grainTexture(Math.round(rOut * 100));
  tex.repeat.set(3, 3);
  const mk = (c, side, op) => new THREE.MeshStandardMaterial({ color: c, map: tex, roughness: .62, metalness: 0, side, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
  const outer = new THREE.SphereGeometry(rOut, seg, seg * .75, Math.PI, Math.PI);
  if (amp) {
    const p = outer.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = bump(x, y, z, amp); p.setXYZ(i, x * k, y * k, z * k); }
    outer.computeVertexNormals();
  }
  const mOut = mk(color, THREE.FrontSide, opacity);
  g.add(new THREE.Mesh(outer, mOut));
  if (rIn > 0) g.add(new THREE.Mesh(new THREE.SphereGeometry(rIn, seg, seg * .75, Math.PI, Math.PI), mk(innerColor != null ? new THREE.Color(innerColor) : new THREE.Color(color).multiplyScalar(.7), THREE.BackSide, opacity)));
  // cut face
  const shape = new THREE.Shape(); const N = 160;
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, x = Math.cos(a) * rOut, y = Math.sin(a) * rOut; const k = amp ? bump(x, y, 0, amp) : 1; i ? shape.lineTo(x * k, y * k) : shape.moveTo(x * k, y * k); }
  if (rIn > 0) { const hole = new THREE.Path(); hole.absarc(0, 0, rIn, 0, Math.PI * 2, true); shape.holes.push(hole); }
  const capGeo = new THREE.ShapeGeometry(shape, 64);
  const capTex = tex.clone(); capTex.repeat.set(.6, .6); capTex.needsUpdate = true;
  const mCap = new THREE.MeshStandardMaterial({ color: capColor || new THREE.Color(color).lerp(new THREE.Color(0xffffff), .12), map: capTex, roughness: .7, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity >= 1 });
  const cap = new THREE.Mesh(capGeo, mCap); cap.position.z = .002;
  g.add(cap);
  g.userData.mats = [mOut, mCap, ...(g.children[1]?.material ? [g.children[1].material] : [])];
  g.setOpacity = op => g.userData.mats.forEach(m => { m.opacity = op; m.transparent = op < .999; m.depthWrite = op >= .999; });
  return g;
}

function endometriumTexture() {
  const W = 1200, H = 720, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const R = rng(4);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a2a63'); gr.addColorStop(1, '#2d3f7c');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${.02 + R() * .05})`; g.beginPath(); g.ellipse(R() * W, R() * H, 2 + R() * 4, 1 + R() * 2, R() * 3, 0, 7); g.fill(); }
  // uterine glands (coiled, secretory)
  for (let i = 0; i < 16; i++) {
    const x = R() * W, y = 60 + R() * (H - 200), rx = 12 + R() * 14, ry = 18 + R() * 20;
    if (Math.hypot(x - W / 2, (y - (H - (2.6 + .15) / 6 * H))) < 300) continue;
    g.fillStyle = 'rgba(232,206,176,.75)'; g.beginPath(); g.ellipse(x, y, rx, ry, R() * 3, 0, 7); g.fill();
    g.fillStyle = '#5d79b8'; g.beginPath(); g.ellipse(x, y, rx * .55, ry * .55, R() * 3, 0, 7); g.fill();
  }
  // maternal capillaries
  for (let i = 0; i < 30; i++) { g.fillStyle = '#d93a4a'; g.beginPath(); g.ellipse(R() * W, R() * (H - 120), 6 + R() * 12, 4 + R() * 7, R() * 3, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(1 / 10, 1 / 6); t.offset.set(.5, 2.6 / 6);
  return t;
}

export default {
  mount(el) {
    const G = create3D(el, { fov: 30, camPos: [3.0, 1.0, 10.6], target: [0, -.05, 0], minPolar: 1.0, maxPolar: 1.9 });
    G.controls.minAzimuthAngle = -.75; G.controls.maxAzimuthAngle = .75;
    const { scene } = G;
    G.lights('soft');
    const R = rng(9);

    // endometrium block with a hole for the conceptus
    const sh = new THREE.Shape(); sh.moveTo(-5.2, -2.6); sh.lineTo(5.2, -2.6); sh.lineTo(5.2, 3.4); sh.lineTo(-5.2, 3.4); sh.lineTo(-5.2, -2.6);
    const hole = new THREE.Path(); const N = 120;
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, x = Math.cos(a) * 2.3, y = Math.sin(a) * 2.3; const k = bump(x, y, 0, .07); i ? hole.lineTo(x * k * 1.04, y * k * 1.04 + C.y) : hole.moveTo(x * k * 1.04, y * k * 1.04 + C.y); }
    sh.holes.push(hole);
    const endoGeo = new THREE.ExtrudeGeometry(sh, { depth: 3.4, bevelEnabled: false, curveSegments: 64 });
    endoGeo.translate(0, 0, -3.4);
    const endoMat = new THREE.MeshStandardMaterial({ map: endometriumTexture(), roughness: .8 });
    const sideMat = new THREE.MeshStandardMaterial({ color: 0x2d3f7c, roughness: .8 });
    const endo = new THREE.Mesh(endoGeo, [endoMat, sideMat]);
    scene.add(endo);
    // uterine epithelium (bottom surface) with implantation defect that closes
    const epiMat = new THREE.MeshStandardMaterial({ color: 0xf1dcc1, roughness: .6 });
    const epiL = new THREE.Mesh(new THREE.BoxGeometry(1, .26, 3.42), epiMat), epiR = epiL.clone();
    scene.add(epiL, epiR);
    const plug = new THREE.Mesh(new THREE.BoxGeometry(1, .24, 3.4), new THREE.MeshStandardMaterial({ color: 0xfff1c9, roughness: .9, transparent: true, opacity: 1 }));
    scene.add(plug);

    // conceptus
    const root = new THREE.Group(); root.position.copy(C); scene.add(root);
    const syn = halfShell(2.25, 1.96, 0xc23a9e, { amp: .07, capColor: 0xd14aa9 });
    const cyt = halfShell(1.96, 1.74, 0xb68ae6, { capColor: 0xc7a0f0, innerColor: 0x231a4a });
    root.add(syn, cyt);
    // lacunae on the syncytium cut face → fill with maternal blood
    const lac = [];
    for (let i = 0; i < 22; i++) {
      const a = R() * Math.PI * 2, r = 2.0 + R() * .17;
      const m = new THREE.Mesh(new THREE.CircleGeometry(.07 + R() * .06, 20), new THREE.MeshBasicMaterial({ color: 0x5a0b2a, transparent: true }));
      m.position.set(Math.cos(a) * r, Math.sin(a) * r, .006); m.scale.y = .6 + R() * .5; m.rotation.z = a;
      root.add(m); lac.push(m);
    }
    // maternal sinusoids next to the conceptus (eroded at day 11–12)
    const sinus = [];
    for (let i = 0; i < 10; i++) {
      const a = -.2 + i / 10 * Math.PI * 1.4 + R() * .2, r = 2.45 + R() * .25;
      const m = new THREE.Mesh(new THREE.CircleGeometry(.11 + R() * .07, 24), new THREE.MeshBasicMaterial({ color: 0xe0303f, transparent: true, opacity: 0 }));
      m.position.set(Math.cos(a) * r, Math.sin(a) * r + C.y, .008); m.scale.y = .55;
      scene.add(m); sinus.push(m);
    }
    // extraembryonic mesoderm (fills, then splits around the chorionic cavity)
    const eemFill = halfShell(1.74, 0, 0xf4a259, { capColor: 0xf3b27a, opacity: .9 });
    const somatic = halfShell(1.74, 1.6, 0xf28c3a, { capColor: 0xf6a35c });
    const chorCav = halfShell(1.6, 0, 0x1b2a55, { capColor: 0x16244d, opacity: .96 });
    root.add(eemFill, chorCav, somatic);
    // coelomic spaces appearing inside EEM
    const spaces = [];
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI - .25 + R() * (Math.PI + .5), r = 1.3 + R() * .3;
      const m = new THREE.Mesh(new THREE.CircleGeometry(.06 + R() * .09, 24), new THREE.MeshBasicMaterial({ color: 0x1b2a55, transparent: true }));
      m.position.set(Math.cos(a) * r, Math.sin(a) * r, .012); root.add(m); spaces.push(m);
    }
    // embryonic disc + amnion + yolk sacs
    const disc = new THREE.Group(); disc.position.set(0, .55, 0); root.add(disc);
    const halfCyl = (r, hgt, color) => {
      const g = new THREE.Group();
      const side = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hgt, 64, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color, roughness: .5, side: THREE.DoubleSide }));
      const capS = new THREE.Shape(); capS.absarc(0, 0, r, Math.PI, Math.PI * 2, false); capS.lineTo(-r, 0);
      const top = new THREE.Mesh(new THREE.CircleGeometry(r, 64, 0, Math.PI), new THREE.MeshStandardMaterial({ color, roughness: .5, side: THREE.DoubleSide }));
      top.rotation.x = -Math.PI / 2; top.position.y = hgt / 2; const bot = top.clone(); bot.position.y = -hgt / 2;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(2 * r, hgt), new THREE.MeshStandardMaterial({ color, roughness: .8, emissive: color, emissiveIntensity: .18 }));
      face.position.z = .004;
      g.add(side, top, bot, face); return g;
    };
    const epiblast = halfCyl(1.0, .26, 0x2f7df0); epiblast.position.y = .13;
    const hypoblast = halfCyl(1.0, .14, 0xf2b600); hypoblast.position.y = -.07;
    disc.add(epiblast, hypoblast);
    // amniotic cavity: dome above epiblast
    const amn = new THREE.Group(); amn.position.y = .26; disc.add(amn);
    const amnShell = new THREE.Mesh(new THREE.SphereGeometry(1.03, 64, 32, Math.PI, Math.PI, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x8fd9ff, roughness: .35, transparent: true, opacity: .85, side: THREE.DoubleSide }));
    amnShell.scale.y = .62;
    const amnFace = new THREE.Mesh(new THREE.CircleGeometry(.98, 64, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0f4778, roughness: .3, emissive: 0x0f4778, emissiveIntensity: .3 }));
    amnFace.scale.y = .58; amnFace.position.z = .004;
    const amnRim = new THREE.Mesh(new THREE.RingGeometry(.98, 1.05, 64, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x8fd9ff })); amnRim.scale.y = .6; amnRim.position.z = .006;
    amn.add(amnShell, amnFace, amnRim);
    // primary yolk sac (Heuser's membrane) & secondary yolk sac
    const ysP = new THREE.Group(); ysP.position.set(0, -.55, 0); root.add(ysP);
    const ysPShell = new THREE.Mesh(new THREE.SphereGeometry(1.15, 64, 48, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: .4, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
    const ysPRim = new THREE.Mesh(new THREE.RingGeometry(1.11, 1.17, 96), new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true })); ysPRim.position.z = .01;
    const ysPFace = new THREE.Mesh(new THREE.CircleGeometry(1.11, 96), new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true, opacity: .12 })); ysPFace.position.z = .008;
    ysP.add(ysPShell, ysPFace, ysPRim);
    const ysS = new THREE.Group(); ysS.position.set(0, -.05, 0); root.add(ysS);
    const ysSShell = new THREE.Mesh(new THREE.SphereGeometry(.62, 64, 48, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffd60a, roughness: .45, side: THREE.DoubleSide }));
    const ysSFace = new THREE.Mesh(new THREE.CircleGeometry(.56, 64), new THREE.MeshStandardMaterial({ color: 0xc99a00, roughness: .5, emissive: 0x5c4708, emissiveIntensity: .4 })); ysSFace.position.z = .01;
    const ysSRim = new THREE.Mesh(new THREE.RingGeometry(.56, .64, 64), new THREE.MeshStandardMaterial({ color: 0xf28c3a })); ysSRim.position.z = .012; // splanchnic EEM covering
    ysS.add(ysSShell, ysSFace, ysSRim);
    const cyst = new THREE.Mesh(new THREE.CircleGeometry(.22, 40), new THREE.MeshStandardMaterial({ color: 0xffd60a })); cyst.position.set(.2, -1.25, .015); root.add(cyst);
    // connecting stalk (toward the deep side)
    const stalkGeo = new THREE.CylinderGeometry(.22, .3, 1, 32, 1, false, Math.PI / 2, Math.PI);
    const stalk = new THREE.Mesh(stalkGeo, new THREE.MeshStandardMaterial({ color: 0xf28c3a, roughness: .55, side: THREE.DoubleSide }));
    stalk.position.set(.45, 1.38, 0); stalk.rotation.z = -.35; root.add(stalk);
    const sk = new THREE.Shape(); sk.moveTo(-.28, 1.28); sk.quadraticCurveTo(.1, 1.45, .3, 1.3); sk.lineTo(.72, 1.74); sk.quadraticCurveTo(.4, 1.8, .12, 1.74); sk.lineTo(-.28, 1.28);
    const stalkFace = new THREE.Mesh(new THREE.ShapeGeometry(sk, 24), new THREE.MeshStandardMaterial({ color: 0xf28c3a, roughness: .6, emissive: 0xf28c3a, emissiveIntensity: .25 }));
    stalkFace.position.z = .03; root.add(stalkFace);

    const glow = glowSprite(0xff3048, 3.8, 0); glow.position.set(0, C.y, -.5); scene.add(glow);

    // labels
    const D = new Smooth(0, 2.2);
    const at = (k) => () => Math.abs(D.v - k) < .5;
    const from = (k) => () => D.v > k - .5;
    const P = (x, y) => new THREE.Vector3(x, y + C.y, .02);
    G.addLabel('Syncytiotrophoblast', { pos: P(-1.6, -1.45), dx: -150, dy: 40, color: '#e45bd0', visible: at(0), tt: 'Syncytiotrophoblast', tb: 'Outer layer: cells lose their membranes → a <b>multinucleated</b> mass that invades the endometrium.' });
    G.addLabel('Cytotrophoblast', { pos: P(1.55, -.95), dx: 150, dy: 30, color: '#c084fc', visible: at(0), tt: 'Cytotrophoblast', tb: 'Inner, <b>cellular</b> (mononuclear) layer of the trophoblast.' });
    G.addLabel('Epiblast · columnar', { pos: P(-.85, .85), dx: -170, dy: -10, color: '#4f9dff', visible: () => D.v < 2.5, tt: 'Epiblast', tb: 'Layer facing the amniotic cavity; cells become <b>columnar</b>.' });
    G.addLabel('Hypoblast · cuboidal', { pos: P(-.85, .63), dx: -175, dy: 34, color: '#ffcc33', visible: () => D.v < 2.5, tt: 'Hypoblast', tb: 'Layer facing the blastocyst cavity; cells become <b>cuboidal</b>. Epiblast + hypoblast = <b>bilaminar germ disc</b>.' });
    G.addLabel('Amniotic cavity', { pos: P(.3, 1.15), dx: 120, dy: -70, color: '#8fd9ff', visible: () => D.v < 2.5, tt: 'Amniotic cavity', tb: 'Appears <b>within the epiblast</b>; lined by <b>amnioblasts</b>, floor formed by epiblast. Filled with amniotic fluid.' });
    G.addLabel('Trophoblastic lacunae', { pos: P(2.05, -.5), dx: 150, dy: 10, color: '#ff6a7d', visible: at(1), tt: 'Lacunae', tb: 'Vacuoles in the syncytium (day 9) that fuse into a <b>lacunar network</b>.' });
    G.addLabel('Primary yolk sac', { pos: P(.4, -.9), dx: 150, dy: 40, color: '#ffd60a', visible: at(1), tt: 'Primary yolk sac (exocoelomic cavity)', tb: 'Hypoblast cells line the blastocyst cavity as <b>Heuser’s (exocoelomic) membrane</b>.' });
    G.addLabel('Fibrin plug', { pos: new THREE.Vector3(0, -2.45, 1.7), dy: -46, color: '#fff1c9', visible: at(1) });
    G.addLabel('Maternal blood → lacunae', { pos: P(2.1, .9), dx: 130, dy: -40, color: '#ff453a', visible: at(2), tt: 'Uteroplacental circulation', tb: 'Days 11–12: syncytiotrophoblast erodes maternal <b>sinusoids</b>; maternal blood enters the lacunae (Langman 15e, Ch. 4).' });
    G.addLabel('Extraembryonic mesoderm', { pos: P(-1.15, -.6), dx: -160, dy: 50, color: '#f4a259', visible: at(2), tt: 'Extraembryonic mesoderm', tb: 'New cells between the cytotrophoblast and the yolk sac; they separate amnion & yolk sac from the trophoblast.' });
    G.addLabel('Chorionic cavity', { pos: P(-1.05, -.55), dx: -150, dy: 40, color: '#64d2ff', visible: from(3), tt: 'Extraembryonic coelom (chorionic cavity)', tb: 'Spaces in the extraembryonic mesoderm coalesce. Mesoderm splits into <b>somatic</b> (lines trophoblast, covers amnion) and <b>splanchnic</b> (covers yolk sac) layers.' });
    G.addLabel('Secondary yolk sac', { pos: P(.45, -.35), dx: 160, dy: 40, color: '#ffd60a', visible: from(3) });
    G.addLabel('Connecting stalk → umbilical cord', { pos: P(.65, 1.75), dx: 170, dy: -40, color: '#f28c3a', visible: from(3) });

    G.update = (dt, time) => {
      const d = D.step(dt);
      // epithelium defect closes (day 8 open → day 9 plug → day 12 healed)
      const gap = 1.6 * (1 - smooth(1.5, 2.4, d));
      const half = (10.4 - gap) / 2;
      epiL.scale.x = half; epiR.scale.x = half;
      epiL.position.set(-gap / 2 - half / 2, -2.6 + .13, -1.7); epiR.position.set(gap / 2 + half / 2, -2.6 + .13, -1.7);
      plug.scale.x = Math.max(.001, gap); plug.position.set(0, -2.6 + .12, -1.7);
      plug.material.opacity = smooth(.5, 1, d); plug.visible = gap > .01 && d > .5;
      // lacunae appear (day 9), fill with blood (day 11–12)
      const l = smooth(.5, 1.1, d), blood = smooth(1.5, 2.1, d);
      lac.forEach((m, i) => { m.scale.x = Math.max(.001, l); m.material.color.setRGB(.35 + .55 * blood, .04 + .1 * blood, .16 + .05 * blood); });
      sinus.forEach(m => { m.material.opacity = smooth(1.3, 2, d); });
      glow.material.opacity = blood * (1 - smooth(2.6, 3, d) * .5) * (.35 + .1 * Math.sin(time * 3));
      // yolk sacs
      const pys = smooth(.5, 1.1, d) * (1 - smooth(2.4, 3, d));
      ysP.visible = pys > .01; ysPShell.material.opacity = .45 * pys; ysPRim.material.opacity = pys; ysPFace.material.opacity = .14 * pys;
      const sys = smooth(2.5, 3.1, d); ysS.visible = sys > .01; ysS.scale.setScalar(Math.max(.001, sys));
      cyst.visible = sys > .2; cyst.scale.setScalar(Math.max(.001, sys));
      // EEM: fill → spaces → chorionic cavity
      const eem = smooth(1.4, 2, d), cav = smooth(2.4, 3, d);
      eemFill.visible = eem > .01 && cav < .99; eemFill.scale.setScalar(Math.max(.001, .9 + .1 * eem)); eemFill.setOpacity(eem * (1 - cav));
      spaces.forEach((m, i) => { const s = smooth(1.8, 2.3, d) * (1 - cav); m.scale.setScalar(Math.max(.001, s * (1 + cav))); m.visible = s > .01; });
      chorCav.visible = cav > .01; chorCav.setOpacity(cav);
      somatic.visible = cav > .01; somatic.setOpacity(cav);
      stalk.visible = cav > .05; stalk.scale.set(1, Math.max(.001, cav), 1); stalkFace.visible = cav > .05; stalkFace.material.opacity = cav; stalkFace.material.transparent = cav < .99;
      // disc rises slightly as the cavity forms; amniotic cavity grows
      amn.scale.set(1, .6 + .4 * smooth(0, 1.5, d), 1);
      disc.position.y = .55 + .1 * cav;
    };

    return {
      maxStep: 3,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { D.set(n); if (initial) D.jump(n); }
    };
  }
};
