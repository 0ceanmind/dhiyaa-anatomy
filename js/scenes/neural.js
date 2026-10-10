// Neurulation (days 18–28) and somite formation (Table 6.2) on one parametric embryo.
import { create3D, activate, deactivate, THREE, glowSprite } from '../stage3d.js';
import { Smooth, smooth, clamp, lerp, h, slider } from '../ui.js';

const L = 7.2; let W = 1.25;             // length (cranio-caudal along x), half-width of ectoderm sheet
const NU = 72, NV = 170;
const V0 = .56;                       // closure starts here (future cervical region)
// Table 6.2 (Langman 15e): approximate age (days) → number of somites
const SOMITES = [[20, '1–4', 2.5], [21, '4–7', 5.5], [22, '7–10', 8.5], [23, '10–13', 11.5], [24, '13–17', 15], [25, '17–20', 18.5], [26, '20–23', 21.5], [27, '23–26', 24.5], [28, '26–29', 27.5], [30, '34–35', 34.5]];
const REGIONS = [['Occipital', 4, '#a78bfa'], ['Cervical', 8, '#4f9dff'], ['Thoracic', 12, '#34d399'], ['Lumbar', 5, '#ffcc33'], ['Sacral', 5, '#ff9f0a'], ['Coccygeal', 8, '#ff5a6e']];

function somiteCount(d) {
  if (d <= 20) return d < 19.6 ? 0 : SOMITES[0][2] * smooth(19.6, 20, d);
  for (let i = 0; i < SOMITES.length - 1; i++) { const [a, , ca] = SOMITES[i], [b, , cb] = SOMITES[i + 1]; if (d <= b) return lerp(ca, cb, (d - a) / (b - a)); }
  return 34.5;
}
function tableRow(d) { let r = SOMITES[0]; for (const s of SOMITES) if (d >= s[0] - .5) r = s; return r; }

// closure state at position v (0 caudal … 1 cranial) on day d
function closure(v, d) {
  const open = .14 * smooth(18, 19.3, d) + .58 * smooth(19.3, 21.6, d);
  if (d < 21.8) return open;
  const vB = Math.min(1.02, V0 + (1 - V0) * clamp((d - 21.8) / (25 - 21.8)));
  const vA = Math.max(-.02, V0 - V0 * clamp((d - 21.8) / (28 - 21.8)));
  const e = .07;
  const inside = smooth(vA - e, vA, v) * (1 - smooth(vB, vB + e, v));
  return lerp(open, 1, inside);
}
const plateHalf = v => .7 * (1 + .7 * smooth(.74, .98, v));

// u ∈ [-1,1]: |u| ≤ .5 = neural plate, |u| > .5 = surface ectoderm. Writes (lat, dorsal) into out.
function profile(u, c, v, out) {
  const wp = plateHalf(v), Wv = Math.max(wp + .35, W * (1 + .45 * smooth(.74, .98, v)));
  const sgn = Math.sign(u) || 1, phi = c * Math.PI;
  const r = phi > 1e-3 ? wp / phi : 1e6;
  if (Math.abs(u) <= .5) {
    const s = u / .5 * wp;
    if (phi < 1e-3) { out[0] = s; out[1] = 0; return -1; }
    const a = s / wp * phi; out[0] = r * Math.sin(a); out[1] = r * (1 - Math.cos(a)); return -1;
  }
  const t = (Math.abs(u) - .5) / .5;
  const tip = phi > 1e-3 ? [sgn * r * Math.sin(phi), r * (1 - Math.cos(phi))] : [sgn * wp, 0];
  const cl = smooth(.86, 1, c);
  const top = 2 * r + .1;
  const s0 = [lerp(tip[0], 0, cl), lerp(tip[1], top, cl)];
  const cc = [s0[0] + sgn * (.5 + .1 * cl), lerp(s0[1], top, cl) * (1 - .25 * (1 - cl))];
  const pe = [sgn * Wv, -.06];
  const k = 1 - t;
  out[0] = k * k * s0[0] + 2 * k * t * cc[0] + t * t * pe[0];
  out[1] = k * k * s0[1] + 2 * k * t * cc[1] + t * t * pe[1];
  return t;
}

export default {
  mount(el, opts = {}) {
    const som = opts.mode === 'somites';
    W = som ? .5 : 1.15;
    const G = create3D(el, som
      ? { fov: 30, camPos: [0, 12.2, 4.6], target: [0, 0, 0], minPolar: .05, maxPolar: 1.3 }
      : { fov: 30, camPos: [-4.6, 6.6, 7.6], target: [-.3, -.1, 0], minPolar: .2, maxPolar: 1.5 });
    const { scene } = G;
    G.lights('soft');

    // ---- sheet ----
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(NU * NV * 3), col = new Float32Array(NU * NV * 3);
    const plateIdx = [], surfIdx = [];
    for (let j = 0; j < NV - 1; j++) for (let i = 0; i < NU - 1; i++) {
      const a = j * NU + i, b = a + 1, c = a + NU, d = c + 1;
      const uc = ((i + .5) / (NU - 1)) * 2 - 1;
      (Math.abs(uc) <= .5 ? plateIdx : surfIdx).push(a, c, b, b, c, d);
    }
    geo.setIndex([...plateIdx, ...surfIdx]);
    geo.addGroup(0, plateIdx.length, 0); geo.addGroup(plateIdx.length, surfIdx.length, 1);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const plateMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .45, side: THREE.DoubleSide, emissive: 0x0a1a3a, emissiveIntensity: .35 });
    const surfMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .3, side: THREE.DoubleSide, transparent: true, opacity: som ? 0 : .34, depthWrite: false });
    const sheet = new THREE.Mesh(geo, [plateMat, surfMat]);
    sheet.renderOrder = 2;
    scene.add(sheet);
    const cPlate = new THREE.Color(0x2a6cf0), cSurf = new THREE.Color(0xa9c8f2), cCrest = new THREE.Color(0x34d399), tmp = new THREE.Color();

    // notochord
    const noto = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, L * .8, 24), new THREE.MeshStandardMaterial({ color: 0xff7a45, roughness: .4, emissive: 0x7a2a10, emissiveIntensity: .5 }));
    noto.rotation.z = Math.PI / 2; noto.position.set(L * .08, -.26, 0); scene.add(noto);

    // somites (paired)
    const NS = 42;
    const somGeo = new THREE.BoxGeometry(.088, .22, .34, 2, 2, 2);
    { const p = somGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 - .25 * (Math.abs(y) / .11) ** 2 * (Math.abs(z) / .17) ** 2; p.setXYZ(i, x, y * k, z * (1 - .12 * (Math.abs(x) / .044) ** 2)); } somGeo.computeVertexNormals(); }
    const somM = new THREE.MeshStandardMaterial({ roughness: .45, emissiveIntensity: .2 });
    const somites = new THREE.InstancedMesh(somGeo, somM, NS * 2); somites.frustumCulled = false; scene.add(somites);
    const regionOf = k => { let acc = 0; for (const r of REGIONS) { acc += r[1]; if (k < acc) return r; } return REGIONS[5]; };
    for (let k = 0; k < NS * 2; k++) somites.setColorAt(k, new THREE.Color(som ? regionOf(k >> 1)[2] : '#ff6b7f'));
    const somV = k => .735 - k * .0165;   // somite k position along the axis

    // neural crest particles
    const NC = 160;
    const crest = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x0f5c3f, emissiveIntensity: .7, roughness: .4 }), NC);
    crest.frustumCulled = false; scene.add(crest);
    const CR = Array.from({ length: NC }, (_, i) => ({ v: .1 + (i / NC) * .82, sgn: i % 2 ? 1 : -1, r: Math.random(), s: .035 + Math.random() * .025 }));

    const D = new Smooth(som ? 20 : 18, 2.4);
    const xOf = v => (.5 - v) * L;          // cranial on the left
    const out = [0, 0];
    let lastD = -1;

    function build(d) {
      for (let j = 0; j < NV; j++) {
        const v = j / (NV - 1);
        const c = closure(v, d);
        const taper = 1 - .35 * smooth(.18, 0, v);   // caudal end narrower
        for (let i = 0; i < NU; i++) {
          const u = i / (NU - 1) * 2 - 1;
          const t = profile(u, c, v, out);
          const k = (j * NU + i) * 3;
          pos[k] = xOf(v); pos[k + 1] = out[1] * taper; pos[k + 2] = out[0] * taper;
          // colours: neural plate → crest band → surface ectoderm
          const crestBand = t < 0 ? smooth(.4, .5, Math.abs(u)) : 1 - smooth(0, .15, t);
          tmp.copy(t < 0 ? cPlate : cSurf).lerp(cCrest, crestBand * (1 - smooth(.9, 1, c) * .8) * .9);
          col[k] = tmp.r; col[k + 1] = tmp.g; col[k + 2] = tmp.b;
        }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
      geo.computeVertexNormals();
    }

    // ---- UI: slider + readout ----
    const fmtDay = v => `Day ${Math.round(v)}`;
    const ctrl = h('div', { class: 'ctrl', style: { left: '30px', bottom: '24px' } });
    const sl = slider({ min: som ? 20 : 18, max: som ? 30 : 28, step: .1, value: som ? 20 : 18, label: 'Age', fmt: fmtDay, width: 520, color: som ? '#34d399' : '#4f9dff', onInput: v => { D.set(v); user = true; } });
    ctrl.append(sl); el.append(ctrl);
    let user = false;
    const ro = h('div', { class: 'readout', style: som ? { right: '20px', top: '10px', minWidth: '330px' } : { left: '10px', top: '0px', minWidth: '360px' } });
    el.append(ro);
    const neuro = (label, closedDay, d) => `<div class="rs" style="display:flex;justify-content:space-between;gap:20px"><span>${label}</span><b style="color:${d >= closedDay ? '#34d399' : '#ff9f0a'}">${d >= closedDay ? 'closed · day ' + closedDay : 'open'}</b></div>`;
    function readout(d) {
      if (som) {
        const row = tableRow(d);
        ro.innerHTML = `<div class="rl">Table 6.2 · Day ${row[0]}</div><div class="rv">${row[1]}</div><div class="rs">pairs of somites</div>`;
      } else {
        const phase = d < 19.3 ? 'Neural plate' : d < 21.8 ? 'Groove & folds' : d < 25 ? 'Fusion — zipping both ways' : d < 28 ? 'Caudal neuropore closing' : 'Neural tube closed';
        ro.innerHTML = `<div class="rl">Day ${Math.round(d)}</div><div class="rv" style="font-size:40px">${phase}</div>${neuro('Cranial neuropore', 25, d)}${neuro('Caudal neuropore', 28, d)}`;
      }
    }

    // labels
    G.addLabel('Neural plate', { pos: new THREE.Vector3(xOf(.4), .02, -.1), dy: 50, color: '#2f6fe6', visible: () => !som && D.v < 19.6 });
    G.addLabel('Neural folds', { pos: () => new THREE.Vector3(xOf(.25), .9 * smooth(19, 21.5, D.v), -.55), dy: -40, color: '#7cb6ff', visible: () => !som && D.v > 19.6 && D.v < 22.5, tt: 'Neural folds & groove', tb: 'The plate’s edges rise as <b>neural folds</b> with the <b>neural groove</b> between them.' });
    G.addLabel('Neural crest', { pos: () => new THREE.Vector3(xOf(.45), .75, -.7), dy: -30, color: '#34d399', visible: () => !som && D.v > 22.5, tt: 'Neural crest', tb: 'Cells at the junction of neural folds and surface ectoderm separate and migrate away.' });
    G.addLabel('Cranial neuropore', { pos: new THREE.Vector3(xOf(.99), .7, 0), dx: -40, dy: -60, color: '#4f9dff', visible: () => !som && D.v > 21.8 });
    G.addLabel('Caudal neuropore', { pos: new THREE.Vector3(xOf(.02), .35, 0), dx: 40, dy: -60, color: '#34d399', visible: () => !som && D.v > 21.8 });
    G.addLabel('Notochord', { pos: new THREE.Vector3(xOf(.9), -.26, 0), dx: -20, dy: 46, color: '#ff7a45', visible: () => !som && D.v < 20.5 });
    G.addLabel('Somites', { pos: () => new THREE.Vector3(xOf(somV(Math.max(0, somiteCount(D.v) - 3))), .1, -.95), dy: -44, color: '#ff6b7f', visible: () => somiteCount(D.v) > 2 && (som || D.v < 24) });
    G.addLabel('Cranial', { pos: new THREE.Vector3(xOf(1.03) - .3, 0, 0), dx: -30, color: '#7c7c84' });
    G.addLabel('Caudal', { pos: new THREE.Vector3(xOf(-.02) + .3, 0, 0), dx: 30, color: '#7c7c84' });

    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v3 = new THREE.Vector3();
    G.update = (dt, time) => {
      const d = D.step(dt);
      if (Math.abs(d - lastD) > 1e-4) { build(d); lastD = d; readout(d); if (!user) sl.set(d); }
      // somites
      const n = somiteCount(d);
      for (let k = 0; k < NS; k++) {
        const g = clamp(n - k);
        const v = somV(k), c = closure(v, d);
        const w = plateHalf(v);
        const zOff = (c > .9 ? .62 : lerp(w + .32, .62, c)) ;
        for (const sgn of [-1, 1]) {
          v3.set(xOf(v), -.08, sgn * zOff);
          sc.setScalar(Math.max(.001, g));
          m4.compose(v3, q.identity(), sc); somites.setMatrixAt(k * 2 + (sgn > 0 ? 1 : 0), m4);
        }
      }
      somites.instanceMatrix.needsUpdate = true;
      // neural crest: leave the fold crest once that level has fused
      for (let i = 0; i < NC; i++) {
        const p = CR[i], c = closure(p.v, d);
        const wp = plateHalf(p.v), r = wp / (Math.PI * Math.max(c, .05));
        const fused = smooth(.93, 1, c);
        const m = fused * clamp(.25 + .75 * Math.sin(time * .5 + p.r * 6) * .5 + .5 * fused);
        const crestY = c > .05 ? r * (1 - Math.cos(c * Math.PI)) : 0;
        const crestZ = c > .05 ? p.sgn * r * Math.sin(c * Math.PI) : p.sgn * wp;
        v3.set(xOf(p.v), lerp(crestY + .05, crestY - .25 - p.r * .35, m * .8), lerp(crestZ, p.sgn * (.45 + .45 * p.r), m));
        sc.setScalar(som ? 0.0001 : p.s * (c > .5 ? 1 : 0.0001));
        m4.compose(v3, q.identity(), sc); crest.setMatrixAt(i, m4);
      }
      crest.instanceMatrix.needsUpdate = true;
    };

    const days = som ? [20, 24, 28, 30] : [18, 21, 25, 28];
    return {
      maxStep: 3,
      enter() { activate(G); },
      leave() { deactivate(G); },
      step(n, initial) { user = false; D.set(days[n]); if (initial) { D.jump(days[n]); } }
    };
  }
};
