// Presentation engine
import { h } from './ui.js';
import { registry } from './registry.js';
import { resizeCurrent } from './stage3d.js';

const CH = {
  0: { name: 'Introduction', c: '#2997ff', g: '#1d3d8a', g2: '#3a1f5c' },
  1: { name: 'Week 1 · Fertilization', c: '#ff6fae', g: '#6a1f4a', g2: '#2a1d5c' },
  2: { name: 'Week 2 · Implantation', c: '#c084fc', g: '#4a2780', g2: '#5c1f4a' },
  3: { name: 'Week 3 · Gastrulation', c: '#4f9dff', g: '#1d3f8a', g2: '#1f4a5c' },
  4: { name: 'Weeks 3–8 · Embryonic period', c: '#34d399', g: '#145c48', g2: '#1d3d6a' },
  5: { name: 'Month 3 → Birth · Fetal period', c: '#ff9f0a', g: '#6a3d10', g2: '#5c1f2a' },
  6: { name: 'Placenta & umbilical cord', c: '#ff5a6e', g: '#6a1420', g2: '#3a1d5c' },
  7: { name: 'Twinning', c: '#64d2ff', g: '#145a6a', g2: '#1d2f6a' },
  8: { name: 'Birth defects', c: '#ffcc33', g: '#6a5410', g2: '#5c2a1f' },
  9: { name: 'Review', c: '#2997ff', g: '#1d3d8a', g2: '#3a1f5c' }
};
const LECT = {
  w1: 'Fertilization & First Week — Dr. Khizer Hussain Afroze',
  w2: 'Implantation & Second Week — Dr. Khizer Hussain Afroze',
  w3: 'Third Week of Development — Dr. Khizer Hussain Afroze',
  emb: 'Embryonic Period (3–8 wk) — Dr. Khizer Hussain Afroze',
  fet: 'Fetal Period — Prof. Dr. Ehab Elzawawy',
  pla: 'Placenta — Prof. Dr. Ehab Elzawawy',
  bd: 'Birth Defects — Prof. Dr. Ehab Elzawawy',
  tw: 'Twinning — Prof. Dr. Ehab Elzawawy'
};

const stage = document.getElementById('stage');
const slides = [...stage.querySelectorAll('.slide')];
const state = { i: -1, step: 0 };
const insts = new Map(); // slide -> [instances]
const mounting = new Map();

// ---------------- scaling ----------------
function fit() {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  window.__stageScale = s;
  stage.style.transform = `scale(${s})`;
  resizeCurrent();
  const cur = slides[state.i]; if (cur) (insts.get(cur) || []).forEach(x => x.resize && x.resize());
}
addEventListener('resize', fit);

// ---------------- slide setup ----------------
slides.forEach((sl, idx) => {
  const ch = CH[sl.dataset.ch || 0] || CH[0];
  sl.style.setProperty('--accent-ch', sl.dataset.accent || ch.c);
  sl.dataset.idx = idx;
  // citation + source button
  const src = sl.dataset.src;
  let cite = sl.querySelector('.cite');
  if (!cite && (src || sl.dataset.cite)) { cite = h('footer', { class: 'cite' }); sl.append(cite); }
  if (cite && sl.dataset.cite && !cite.textContent.trim()) cite.textContent = sl.dataset.cite;
  if (cite && src) {
    const b = h('button', { class: 'src-btn', type: 'button', text: 'Lecture slides ↗', title: 'Show the original lecture slides' });
    b.addEventListener('click', e => { e.stopPropagation(); openLightbox(parseSrc(src)); });
    cite.prepend(b);
  }
  // synced step lists
  sl.querySelectorAll('ol.steps > li').forEach((li, k) => li.addEventListener('click', e => { e.stopPropagation(); if (slides[state.i] === sl) setStep(k + (+(li.parentElement.dataset.offset || 0))); }));
});

function maxStepOf(sl) {
  let m = +(sl.dataset.steps || 0);
  sl.querySelectorAll('[data-step]').forEach(e => { m = Math.max(m, +e.dataset.step); });
  sl.querySelectorAll('ol.steps').forEach(ol => { m = Math.max(m, ol.children.length - 1 + (+(ol.dataset.offset || 0))); });
  (insts.get(sl) || []).forEach(x => { if (x.maxStep != null) m = Math.max(m, x.maxStep); });
  return m;
}

async function mountSlide(sl) {
  if (insts.has(sl)) return insts.get(sl);
  if (mounting.has(sl)) return mounting.get(sl);
  const p = (async () => {
    const list = [];
    for (const el of sl.querySelectorAll('[data-viz]')) {
      const name = el.dataset.viz;
      const loader = registry[name];
      if (!loader) { console.warn('No viz', name); continue; }
      try {
        const mod = await loader();
        const opts = el.dataset.opts ? JSON.parse(el.dataset.opts) : {};
        const inst = mod.default.mount(el, opts, { slide: sl, setStep: n => slides[state.i] === sl && setStep(n) }) || {};
        list.push(inst);
      } catch (err) { console.error('viz failed', name, err); }
    }
    insts.set(sl, list);
    return list;
  })();
  mounting.set(sl, p);
  return p;
}

// ---------------- navigation ----------------
async function go(i, { step = 0, dir = 1 } = {}) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  const prev = slides[state.i], next = slides[i];
  if (prev === next) { setStep(step); return; }
  if (prev) {
    prev.classList.remove('active');
    prev.classList.toggle('leaving-back', dir > 0);
    (insts.get(prev) || []).forEach(x => x.leave && x.leave());
    hideTip(true);
  }
  state.i = i;
  const list = await mountSlide(next);
  if (slides[state.i] !== next) return; // navigated away while loading
  next.classList.remove('leaving-back');
  void next.offsetWidth;
  next.classList.add('active');
  list.forEach(x => x.enter && x.enter());
  const ms = maxStepOf(next);
  setStep(step === 'last' ? ms : Math.min(step, ms), true);
  const ch = CH[next.dataset.ch || 0] || CH[0];
  document.documentElement.style.setProperty('--glow', ch.g);
  document.documentElement.style.setProperty('--glow2', ch.g2);
  updateChrome();
  history.replaceState(null, '', '#' + (i + 1));
  // preload neighbours
  const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
  idle(() => { [i + 1, i + 2, i - 1].forEach(k => slides[k] && mountSlide(slides[k])); });
}

function setStep(n, initial = false) {
  const sl = slides[state.i]; if (!sl) return;
  const ms = maxStepOf(sl);
  n = Math.max(0, Math.min(ms, n));
  state.step = n;
  sl.querySelectorAll('[data-step]').forEach(e => {
    const k = +e.dataset.step;
    e.classList.toggle('on', k <= n);
    e.classList.toggle('past', k < n);
    if (e.dataset.until != null) e.classList.toggle('on', k <= n && n <= +e.dataset.until);
  });
  sl.querySelectorAll('ol.steps').forEach(ol => {
    const off = +(ol.dataset.offset || 0);
    [...ol.children].forEach((li, k) => { li.classList.toggle('cur', k + off === n); li.classList.toggle('done', k + off < n); });
  });
  (insts.get(sl) || []).forEach(x => x.step && x.step(n, initial));
  updateChrome();
}

function next() {
  const sl = slides[state.i];
  if (state.step < maxStepOf(sl)) setStep(state.step + 1);
  else if (state.i < slides.length - 1) go(state.i + 1, { dir: 1 });
}
function prev() {
  if (state.step > 0) setStep(state.step - 1);
  else if (state.i > 0) go(state.i - 1, { step: 'last', dir: -1 });
}

// ---------------- chrome ----------------
const progress = h('div', { id: 'progress' });
const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const dock = h('div', { id: 'dock' });
const bPrev = h('button', { title: 'Previous (←)', html: icon('<path d="M15 18l-6-6 6-6"/>') });
const count = h('span', { class: 'count' });
const bNext = h('button', { title: 'Next (→ / Space)', html: icon('<path d="M9 18l6-6-6-6"/>') });
const bChap = h('button', { class: 'chap', title: 'Overview (O)' });
const bOv = h('button', { title: 'Overview (O)', html: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>') });
const bFs = h('button', { title: 'Fullscreen (F)', html: icon('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>') });
const bQuiz = h('button', { title: 'Question bank (Q)', html: icon('<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5"/><path d="M12 17.5h.01"/>') + '<span>Quiz</span>' });
const bHelp = h('button', { title: 'Shortcuts (H)', html: icon('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>') });
dock.append(bPrev, count, bNext, h('span', { class: 'sep' }), bChap, bOv, h('span', { class: 'sep' }), bQuiz, bFs, bHelp);
document.body.append(progress, dock);
bPrev.onclick = prev; bNext.onclick = next; bOv.onclick = toggleOverview; bChap.onclick = toggleOverview;
bFs.onclick = toggleFs; bQuiz.onclick = () => window.open('quiz.html', '_blank'); bHelp.onclick = () => help.classList.toggle('open');

function updateChrome() {
  const sl = slides[state.i]; if (!sl) return;
  const ms = maxStepOf(sl);
  const frac = (state.i + (ms ? state.step / (ms + 1) : 0)) / (slides.length - 1);
  progress.style.width = (frac * 100) + '%';
  count.textContent = `${state.i + 1} / ${slides.length}`;
  bChap.textContent = (CH[sl.dataset.ch || 0] || CH[0]).name;
  ovBtns.forEach((b, k) => b.classList.toggle('cur', k === state.i));
}

let uiTimer;
function pokeUI() { document.body.classList.add('ui'); clearTimeout(uiTimer); uiTimer = setTimeout(() => { if (!dock.matches(':hover')) document.body.classList.remove('ui'); }, 2600); }
addEventListener('mousemove', pokeUI, { passive: true });

// Overview
const ov = h('div', { id: 'overview' });
const ovBtns = [];
{
  let lastCh = null, row = null;
  slides.forEach((sl, k) => {
    const ch = sl.dataset.ch || 0;
    if (ch !== lastCh) { ov.append(h('h4', { text: (CH[ch] || CH[0]).name, style: { color: (CH[ch] || CH[0]).c } })); row = h('div', { class: 'row' }); ov.append(row); lastCh = ch; }
    const t = sl.dataset.title || sl.querySelector('h1,h2')?.textContent || `Slide ${k + 1}`;
    const b = h('button', { class: 'ov' }, h('span', { class: 'n', text: String(k + 1).padStart(2, '0') }), h('span', { class: 't', text: t }));
    b.onclick = () => { toggleOverview(false); go(k, { dir: k > state.i ? 1 : -1 }); };
    row.append(b); ovBtns.push(b);
  });
  const c = h('button', { class: 'round close', text: '✕', title: 'Close (Esc)' }); c.onclick = () => toggleOverview(false);
  ov.append(c);
  document.body.append(ov);
}
function toggleOverview(force) { const open = typeof force === 'boolean' ? force : !ov.classList.contains('open'); ov.classList.toggle('open', open); if (open) ovBtns[state.i]?.scrollIntoView({ block: 'center' }); }

// Lightbox (original lecture slides)
const lb = h('div', { id: 'lightbox' });
const lbImg = h('img', { alt: 'Original lecture slide' });
const lbCap = h('figcaption');
const lbPrev = h('button', { class: 'round nav prev', text: '‹' }), lbNext = h('button', { class: 'round nav next', text: '›' }), lbClose = h('button', { class: 'round close', text: '✕' });
lb.append(h('figure', {}, lbImg, lbCap), lbPrev, lbNext, lbClose);
document.body.append(lb);
let lbList = [], lbK = 0;
function parseSrc(src) {
  const out = [];
  src.split('|').forEach(part => { const [key, pages] = part.split(':'); (pages || '').split(',').forEach(p => { p = p.trim(); if (!p) return; const [a, b] = p.split('-').map(Number); for (let n = a; n <= (b || a); n++) out.push({ key, n }); }); });
  return out;
}
function showLb() { const it = lbList[lbK]; if (!it) return; lbImg.src = `assets/lecture/${it.key}-${String(it.n).padStart(2, '0')}.jpg`; lbCap.textContent = `${LECT[it.key] || it.key} · slide ${it.n}   (${lbK + 1}/${lbList.length})`; lbPrev.style.visibility = lbK > 0 ? 'visible' : 'hidden'; lbNext.style.visibility = lbK < lbList.length - 1 ? 'visible' : 'hidden'; }
function openLightbox(list) { lbList = list; lbK = 0; showLb(); lb.classList.add('open'); }
lbPrev.onclick = e => { e.stopPropagation(); lbK = Math.max(0, lbK - 1); showLb(); };
lbNext.onclick = e => { e.stopPropagation(); lbK = Math.min(lbList.length - 1, lbK + 1); showLb(); };
lbClose.onclick = () => lb.classList.remove('open');
lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });

// Help
const help = h('div', { id: 'help', html: `<b>Presenter shortcuts</b><br>
<kbd>→</kbd><kbd>Space</kbd><kbd>PgDn</kbd> next build / slide<br>
<kbd>←</kbd><kbd>PgUp</kbd> previous<br>
<kbd>↓</kbd><kbd>↑</kbd> skip builds (next / prev slide)<br>
<kbd>O</kbd> overview · <kbd>F</kbd> fullscreen<br>
<kbd>B</kbd> black screen · <kbd>Q</kbd> question bank<br>
<kbd>Home</kbd><kbd>End</kbd> first / last · type a number + <kbd>Enter</kbd> to jump<br>
Hover any <b>⊕</b> item or label for details · drag 3D models to rotate` });
document.body.append(help);
const blackout = h('div', { id: 'blackout' }); document.body.append(blackout);

function toggleFs() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }

// ---------------- hover detail card ----------------
const card = h('div', { id: 'tipcard' });
stage.append(card);
let tipEl = null, pinned = false;
function tipContent(el) {
  let tt = el.dataset.tt, tb = el.dataset.tb, tc = el.dataset.tc;
  const child = el.querySelector(':scope > .tip');
  if (child) { tt = child.dataset.t || tt || el.firstChild?.textContent?.trim(); tb = child.innerHTML; tc = child.dataset.c || tc; }
  return { tt, tb, tc };
}
function showTip(el) {
  const { tt, tb, tc } = tipContent(el);
  if (!tt && !tb) return;
  if (tipEl && tipEl !== el) tipEl.classList.remove('tip-on');
  tipEl = el; el.classList.add('tip-on');
  card.innerHTML = `${tt ? `<div class="tt"><span class="sw"></span>${tt}</div>` : ''}<div class="tb">${tb || ''}</div>`;
  card.style.setProperty('--sw', tc || getComputedStyle(slides[state.i]).getPropertyValue('--accent-ch') || '#2997ff');
  // position (stage coords)
  const sc = window.__stageScale || 1, sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
  const ex = (r.left - sr.left) / sc, ey = (r.top - sr.top) / sc, ew = r.width / sc, eh = r.height / sc;
  card.style.left = '0px'; card.style.top = '0px'; card.classList.add('show');
  const cw = card.offsetWidth, chh = card.offsetHeight;
  let x = ex + ew + 28, y = ey + eh / 2 - chh / 2, origin = 'left center';
  if (x + cw > 1880) { x = ex - cw - 28; origin = 'right center'; }
  if (x < 40) { x = Math.min(1880 - cw, Math.max(40, ex + ew / 2 - cw / 2)); y = ey + eh + 22; origin = 'top center'; if (y + chh > 1050) { y = ey - chh - 22; origin = 'bottom center'; } }
  y = Math.max(30, Math.min(1050 - chh, y));
  card.style.left = x + 'px'; card.style.top = y + 'px'; card.style.setProperty('--to', origin);
}
function hideTip(force) { if (pinned && !force) return; pinned = false; card.classList.remove('show', 'pinned'); if (tipEl) tipEl.classList.remove('tip-on'); tipEl = null; }
stage.addEventListener('mouseover', e => { const el = e.target.closest('.hot'); if (el && stage.contains(el) && !pinned) showTip(el); });
stage.addEventListener('mouseout', e => { const el = e.target.closest('.hot'); if (el && !el.contains(e.relatedTarget) && !pinned) hideTip(); });
stage.addEventListener('click', e => {
  const el = e.target.closest('.hot');
  if (el) { e.stopPropagation(); if (pinned && tipEl === el) { hideTip(true); } else { pinned = false; showTip(el); pinned = true; card.classList.add('pinned'); } return; }
  if (pinned && !card.contains(e.target)) hideTip(true);
});

// ---------------- keyboard / touch ----------------
let typed = '', typedT;
addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (blackout.classList.contains('on') && k !== 'F5') { blackout.classList.remove('on'); e.preventDefault(); return; }
  if (/^[0-9]$/.test(k)) { typed += k; clearTimeout(typedT); typedT = setTimeout(() => typed = '', 1500); return; }
  switch (k) {
    case 'ArrowRight': case 'PageDown': case ' ': case 'n': e.preventDefault(); next(); break;
    case 'Enter': e.preventDefault(); if (typed) { go(+typed - 1); typed = ''; } else next(); break;
    case 'ArrowLeft': case 'PageUp': case 'Backspace': case 'p': e.preventDefault(); prev(); break;
    case 'ArrowDown': e.preventDefault(); go(state.i + 1, { dir: 1 }); break;
    case 'ArrowUp': e.preventDefault(); go(state.i - 1, { dir: -1 }); break;
    case 'Home': go(0, { dir: -1 }); break;
    case 'End': go(slides.length - 1); break;
    case 'o': case 'O': toggleOverview(); break;
    case 'f': case 'F': toggleFs(); break;
    case 'b': case 'B': case '.': blackout.classList.toggle('on'); break;
    case 'q': case 'Q': window.open('quiz.html', '_blank'); break;
    case 'h': case 'H': case '?': help.classList.toggle('open'); break;
    case 'Escape': hideTip(true); toggleOverview(false); lb.classList.remove('open'); help.classList.remove('open'); break;
  }
});
let tx = null, ty = null;
addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchend', e => {
  if (tx == null) return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('canvas, input, .seg')) (dx < 0 ? next : prev)();
  tx = null;
}, { passive: true });

// ---------------- boot ----------------
fit();
const startIdx = Math.max(0, (parseInt(location.hash.replace('#', ''), 10) || 1) - 1);
document.fonts.ready.then(() => go(startIdx).then(() => setTimeout(() => document.getElementById('loader')?.classList.add('done'), 250)));
window.__deck = { go, next, prev, setStep, slides, state };
