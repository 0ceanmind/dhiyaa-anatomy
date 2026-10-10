// One shared WebGL renderer; each 3D slide owns a scene that is attached on enter.
import * as THREE from 'three';
import { OrbitControls } from './../vendor/three/addons/OrbitControls.js';
import { RoomEnvironment } from './../vendor/three/addons/RoomEnvironment.js';
import { h, tip } from './ui.js';

let renderer = null, envTex = null, current = null, raf = null, lastT = 0, elapsed = 0;
const tmp = new THREE.Vector3();

function ensure() {
  if (renderer) return renderer;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'gl';
  const pm = new THREE.PMREMGenerator(renderer);
  envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  window.addEventListener('resize', () => current && resize(current));
  return renderer;
}

function resize(inst) {
  const el = inst.container;
  const w = el.clientWidth || 1, hgt = el.clientHeight || 1;
  const sc = (window.__stageScale || 1) * Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(sc);
  renderer.setSize(w, hgt, false);
  inst.camera.aspect = w / hgt;
  if (inst.shiftX || inst.shiftY) inst.camera.setViewOffset(w, hgt, -w * (inst.shiftX || 0), -hgt * (inst.shiftY || 0), w, hgt);
  inst.camera.updateProjectionMatrix();
  inst.w = w; inst.h = hgt;
  inst.onResize && inst.onResize(w, hgt);
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!current) return;
  const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now; elapsed += dt;
  if (current.controls) current.controls.update();
  current.update && current.update(dt, elapsed);
  renderer.render(current.scene, current.camera);
  projectLabels(current);
}

function projectLabels(inst) {
  if (!inst.labels.length) return;
  const cam = inst.camera, w = inst.w, hgt = inst.h;
  for (const L of inst.labels) {
    const p = typeof L.pos === 'function' ? L.pos() : L.pos;
    if (L.obj) { L.obj.updateWorldMatrix(true, false); tmp.copy(p).applyMatrix4(L.obj.matrixWorld); } else tmp.copy(p);
    tmp.project(cam);
    const vis = (L.visible ? L.visible() : true) && tmp.z < 1;
    L.el.classList.toggle('hide', !vis);
    const x = (tmp.x * .5 + .5) * w + (L.dx || 0), y = (-tmp.y * .5 + .5) * hgt + (L.dy || 0);
    L.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
  }
}

/**
 * Create a 3D instance bound to a container.
 * opts: { fov, camPos:[x,y,z], target:[x,y,z], orbit:true, autoRotate:false, minDist, maxDist, zoom:false }
 */
export function create3D(container, opts = {}) {
  ensure();
  const scene = new THREE.Scene();
  scene.environment = envTex;
  const camera = new THREE.PerspectiveCamera(opts.fov || 35, 16 / 9, 0.05, 400);
  camera.position.set(...(opts.camPos || [0, 0, 10]));
  const target = new THREE.Vector3(...(opts.target || [0, 0, 0]));
  camera.lookAt(target);
  const inst = {
    THREE, scene, camera, container, labels: [], w: 1, h: 1, controls: null, update: null,
    addLabel(text, { pos, obj, color, tt, tb, visible, dx, dy, cls } = {}) {
      const el = h('div', { class: `lbl3d ${cls || ''}`, html: text });
      if (color) el.style.setProperty('--lc', color);
      if (tt || tb) tip(el, tt || text, tb || '', color);
      container.append(el);
      const L = { el, pos: pos || new THREE.Vector3(), obj, visible, dx, dy };
      inst.labels.push(L);
      return L;
    },
    lights(preset = 'soft') {
      const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, preset === 'bright' ? 1.2 : 0.8);
      const key = new THREE.DirectionalLight(0xffffff, preset === 'bright' ? 2.4 : 1.8); key.position.set(4, 6, 5);
      const rim = new THREE.DirectionalLight(0x88aaff, 1.2); rim.position.set(-6, 2, -4);
      scene.add(hemi, key, rim);
      return { hemi, key, rim };
    }
  };
  if (opts.orbit !== false) {
    const c = new OrbitControls(camera, renderer.domElement);
    c.target.copy(target); c.enableDamping = true; c.dampingFactor = 0.07;
    c.enableZoom = !!opts.zoom; c.enablePan = false; c.rotateSpeed = 0.6;
    c.autoRotate = !!opts.autoRotate; c.autoRotateSpeed = opts.autoRotateSpeed || 0.6;
    if (opts.minPolar != null) c.minPolarAngle = opts.minPolar;
    if (opts.maxPolar != null) c.maxPolarAngle = opts.maxPolar;
    if (opts.minDist) c.minDistance = opts.minDist; if (opts.maxDist) c.maxDistance = opts.maxDist;
    c.enabled = false; c.update();
    inst.controls = c;
    container.classList.add('grab');
  }
  return inst;
}

export function activate(inst) {
  ensure();
  current = inst;
  inst.container.prepend(renderer.domElement);
  if (inst.controls) inst.controls.enabled = true;
  resize(inst);
  // render one frame immediately so the slide fades in with content
  renderer.render(inst.scene, inst.camera); projectLabels(inst);
  if (raf == null) { lastT = 0; raf = requestAnimationFrame(frame); }
}
export function deactivate(inst) {
  if (inst.controls) inst.controls.enabled = false;
  if (current === inst) current = null;
}
export function resizeCurrent() { if (current) resize(current); }
export { THREE };

// ---------- shared materials / shaders ----------
export function fresnelMaterial({ color = 0xffffff, rim = 0xffffff, power = 2.2, opacity = 1, intensity = 1.0, additive = false, side = THREE.FrontSide } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uRim: { value: new THREE.Color(rim) }, uPow: { value: power }, uOp: { value: opacity }, uInt: { value: intensity } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform vec3 uRim; uniform float uPow; uniform float uOp; uniform float uInt; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), uPow); vec3 c = mix(uColor, uRim, f) * uInt; gl_FragColor = vec4(c, clamp(uOp * (0.25 + f), 0., 1.));
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, side, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
  });
}
export function glowSprite(color = 0xffffff, size = 1, opacity = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  const sp = new THREE.Sprite(m); sp.scale.setScalar(size); return sp;
}
export function dustField(n = 400, radius = 30, color = 0x8899ff, size = 0.06) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const r = radius * (0.35 + Math.random() * 0.65), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1); p[i * 3] = r * Math.sin(ph) * Math.cos(th); p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); p[i * 3 + 2] = r * Math.cos(ph); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color, size, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  return new THREE.Points(g, m);
}
// Value noise (GLSL) for organic surfaces
export const NOISE_GLSL = `
float hash(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=.5; } return s; }`;
// Organic "cell" material: lit base colour + fbm granules + fresnel rim
export function cellMaterial({ color = 0xffb3c7, rim = 0xffffff, rimPow = 2.4, rimInt = .8, grain = .35, scale = 5, opacity = 1, emissive = 0.08 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(color) }, uRim: { value: new THREE.Color(rim) }, uPow: { value: rimPow }, uRimI: { value: rimInt }, uGrain: { value: grain }, uScale: { value: scale }, uTime: { value: 0 }, uOp: { value: opacity }, uEm: { value: emissive } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vIC;
      void main(){ vec4 lp = vec4(position,1.); vec3 nn = normal; vIC = vec3(-1.);
        #ifdef USE_INSTANCING_COLOR
          vIC = instanceColor;
        #endif
        #ifdef USE_INSTANCING
          lp = instanceMatrix * lp; nn = mat3(instanceMatrix) * nn; vP = position + vec3(instanceMatrix[3].xyz)*3.1;
        #else
          vP = position;
        #endif
        vec4 wp = modelMatrix*lp; vec4 mv = viewMatrix*wp; vN = normalize(normalMatrix*nn); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: NOISE_GLSL + `uniform vec3 uCol; uniform vec3 uRim; uniform float uPow, uRimI, uGrain, uScale, uTime, uOp, uEm; varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vIC;
      void main(){ vec3 n = normalize(vN); vec3 uC = vIC.x >= 0. ? vIC : uCol; float nd = clamp(dot(n, normalize(vec3(.45,.7,.55))),0.,1.);
        float g = fbm(vP*uScale + vec3(0., uTime*.05, 0.));
        vec3 base = uC * (0.38 + 0.62*nd) * (1.0 - uGrain*.5 + uGrain*g);
        float f = pow(1. - abs(dot(n, normalize(vV))), uPow);
        vec3 c = base + uRim*f*uRimI + uC*uEm;
        gl_FragColor = vec4(c, uOp);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`,
    transparent: opacity < 1, depthWrite: opacity >= 1
  });
}
// Smooth damp helper for 3D props
export function damp(cur, target, k, dt) { return cur + (target - cur) * (1 - Math.exp(-k * dt)); }
