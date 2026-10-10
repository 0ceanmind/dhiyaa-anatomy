// Question bank: practice by lecture, mixed exams, review mistakes. Progress kept in localStorage (best-effort).
const app = document.getElementById('app');
const KEY = 'embryo-qbank-v1';
let DATA, T = {};
const store = {
  get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
  set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { } }
};
let stats = store.get();          // id -> { seen, right, last }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function mastery(topic) {
  const qs = DATA.questions.filter(q => !topic || q.topic === topic);
  const right = qs.filter(q => stats[q.id]?.last === 1).length;
  return { n: qs.length, right, seen: qs.filter(q => stats[q.id]).length };
}
const ring = (pct, col, size = 58) => { const r = size / 2 - 6, C = 2 * Math.PI * r; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="6"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="700" fill="#f5f5f7" font-family="Inter">${Math.round(pct * 100)}%</text></svg>`; };

function home() {
  window.scrollTo(0, 0);
  const all = mastery();
  const wrong = DATA.questions.filter(q => stats[q.id] && stats[q.id].last === 0).length;
  app.innerHTML = `
    <section class="hero">
      <div class="eyebrow" style="font-size:15px;color:#34d399">General Embryology</div>
      <h1>Test yourself.</h1>
      <p>${DATA.questions.length} single-best-answer questions across all eight lectures — fertilization to birth, placenta, twinning and birth defects. Every answer comes with an explanation and its source.</p>
      <div class="note"><b>About these questions.</b> ${esc(DATA.note)}
        <details><summary>What the search found</summary><ul>${DATA.research.summary.map(s => `<li>${esc(s)}</li>`).join('')}</ul></details></div>
    </section>
    <section class="sec">
      <h2>Choose a mode</h2>
      <div class="modes">
        <button class="mode" data-m="exam" data-n="20"><div class="t">Quick exam · 20</div><div class="d">Random mix from all lectures</div></button>
        <button class="mode" data-m="exam" data-n="50"><div class="t">Full exam · 50</div><div class="d">Balanced across the eight lectures</div></button>
        <button class="mode" data-m="unseen"><div class="t">Unseen questions</div><div class="d">${all.n - all.seen} you haven’t answered yet</div></button>
        <button class="mode" data-m="wrong" ${wrong ? '' : 'disabled style="opacity:.45;cursor:default"'}><div class="t">Review mistakes</div><div class="d">${wrong} question${wrong === 1 ? '' : 's'} to revisit</div></button>
      </div>
    </section>
    <section class="sec">
      <h2>Practise by lecture</h2>
      <div class="topics">${DATA.topics.map(t => { const m = mastery(t.key); return `<button class="topic" data-t="${t.key}" style="--tc:${t.color}">${ring(m.right / m.n, t.color)}<div><div class="n">${t.name}</div><div class="m">${m.n} questions · ${t.lecture}</div></div></button>`; }).join('')}</div>
      <div class="row" style="margin-top:22px"><span style="color:var(--fg-3);font-size:14px">Overall mastery ${Math.round(all.right / all.n * 100)}% · ${all.seen}/${all.n} answered</span><button class="link" id="reset" style="margin-left:auto;color:var(--fg-3);background:none;border:0;cursor:pointer;font-family:inherit;font-size:14px">Reset progress</button></div>
    </section>`;
  app.querySelectorAll('.mode').forEach(b => b.onclick = () => {
    const m = b.dataset.m;
    if (m === 'exam') start(examSet(+b.dataset.n), `${b.dataset.n}-question exam`);
    if (m === 'unseen') start(shuffle(DATA.questions.filter(q => !stats[q.id])).slice(0, 30), 'Unseen questions');
    if (m === 'wrong' && wrong) start(shuffle(DATA.questions.filter(q => stats[q.id]?.last === 0)), 'Review mistakes');
  });
  app.querySelectorAll('.topic').forEach(b => b.onclick = () => { const t = T[b.dataset.t]; start(shuffle(DATA.questions.filter(q => q.topic === t.key)), t.name); });
  app.querySelector('#reset').onclick = () => { if (confirm('Reset all saved progress on this device?')) { stats = {}; store.set(stats); home(); } };
}
function examSet(n) {
  const per = Math.ceil(n / DATA.topics.length);
  let out = []; DATA.topics.forEach(t => out = out.concat(shuffle(DATA.questions.filter(q => q.topic === t.key)).slice(0, per)));
  return shuffle(out).slice(0, n);
}

let S;
function start(list, title) {
  if (!list.length) return home();
  S = { list, i: 0, title, answers: [] };
  show();
}
function show() {
  window.scrollTo(0, 0);
  const q = S.list[S.i], t = T[q.topic];
  const order = shuffle([0, 1, 2, 3]);
  S.order = order; S.done = false;
  app.innerHTML = `
    <div class="qhead"><span>${esc(S.title)}</span><span>${S.i + 1} / ${S.list.length}</span></div>
    <div class="qbar"><i style="width:${S.i / S.list.length * 100}%"></i></div>
    <div class="tag" style="--tc:${t.color}">${esc(t.name)} · ${'●'.repeat(q.difficulty)}${'○'.repeat(3 - q.difficulty)}</div>
    <div class="stem">${esc(q.stem)}</div>
    <div class="opts">${order.map((o, k) => `<button class="opt" data-o="${o}"><span class="k">${'ABCD'[k]}</span><span>${esc(q.options[o])}</span></button>`).join('')}</div>
    <div id="fb"></div>
    <div class="qnav"><span class="kbd">Keys: A–D or 1–4 to answer · Enter for next</span><button class="primary" id="next" disabled>${S.i === S.list.length - 1 ? 'See results' : 'Next'}</button></div>`;
  app.querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.o));
  app.querySelector('#next').onclick = next;
}
function answer(o) {
  if (S.done) return; S.done = true;
  const q = S.list[S.i], ok = o === q.answer;
  S.answers.push({ q, o, ok });
  const st = stats[q.id] || { seen: 0, right: 0 }; st.seen++; if (ok) st.right++; st.last = ok ? 1 : 0; stats[q.id] = st; store.set(stats);
  app.querySelectorAll('.opt').forEach(b => { const v = +b.dataset.o; b.disabled = true; if (v === q.answer) b.classList.add('right'); else if (v === o) b.classList.add('wrong'); });
  app.querySelector('#fb').innerHTML = `<div class="fb"><div class="v ${ok ? 'ok' : 'no'}">${ok ? 'Correct' : 'Not quite — answer ' + 'ABCD'[S.order.indexOf(q.answer)]}</div><div class="e">${esc(q.explanation)}</div><div class="src">Source: ${esc(q.source)}</div></div>`;
  const n = app.querySelector('#next'); n.disabled = false; n.focus({ preventScroll: true });
}
function next() { if (!S.done) return; if (S.i < S.list.length - 1) { S.i++; show(); } else results(); }
function results() {
  window.scrollTo(0, 0);
  const right = S.answers.filter(a => a.ok).length, pct = Math.round(right / S.answers.length * 100);
  const by = {}; S.answers.forEach(a => { const k = a.q.topic; by[k] = by[k] || [0, 0]; by[k][1]++; if (a.ok) by[k][0]++; });
  const wrongs = S.answers.filter(a => !a.ok);
  app.innerHTML = `
    <div class="eyebrow" style="font-size:15px;color:${pct >= 70 ? '#30d158' : pct >= 50 ? '#ff9f0a' : '#ff453a'}">${esc(S.title)} · results</div>
    <div class="score">${pct}%</div>
    <p style="font-size:20px;color:var(--fg-2);margin:10px 0 0">${right} of ${S.answers.length} correct</p>
    <div class="bars">${Object.entries(by).map(([k, [r, n]]) => `<div class="b" style="--tc:${T[k].color}"><span class="nm">${esc(T[k].name)}</span><span class="tr"><i style="width:0" data-w="${r / n * 100}"></i></span><span>${r}/${n}</span></div>`).join('')}</div>
    <div class="row" style="margin-top:28px">${wrongs.length ? '<button class="primary" id="retry">Retry the ones I missed</button>' : ''}<button class="ghost" id="back">Back to modes</button></div>
    ${wrongs.length ? `<div class="review"><h2 style="font-size:26px;margin-top:20px">Missed questions</h2>${wrongs.map(a => `<div class="it"><b>${esc(a.q.stem)}</b><br>Correct: <b style="color:#30d158">${esc(a.q.options[a.q.answer])}</b><br>${esc(a.q.explanation)}</div>`).join('')}</div>` : ''}`;
  requestAnimationFrame(() => requestAnimationFrame(() => app.querySelectorAll('.tr i').forEach(i => i.style.width = i.dataset.w + '%')));
  const r = app.querySelector('#retry'); if (r) r.onclick = () => start(shuffle(wrongs.map(a => a.q)), 'Retry missed');
  app.querySelector('#back').onclick = home;
}
document.addEventListener('keydown', e => {
  if (!S || !app.querySelector('.opts')) return;
  const k = e.key.toUpperCase();
  const idx = 'ABCD'.indexOf(k) >= 0 ? 'ABCD'.indexOf(k) : '1234'.indexOf(k);
  if (idx >= 0 && !S.done) { answer(S.order[idx]); e.preventDefault(); }
  else if (e.key === 'Enter' && S.done) { next(); e.preventDefault(); }
});
document.getElementById('homeBtn').onclick = () => { S = null; home(); };
fetch('data/questions.json').then(r => r.json()).then(d => { DATA = d; d.topics.forEach(t => T[t.key] = t); home(); })
  .catch(() => { app.innerHTML = '<p style="color:var(--fg-2)">Could not load the question bank. If you opened this file directly from disk, please use the hosted link (browsers block local file loading).</p>'; });
