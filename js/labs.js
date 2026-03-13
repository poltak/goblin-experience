import { BUILD, dateSeedUTC, mulberry32, fnv1a, clamp } from './utils.js';
export function initRuneDrift() {
const canvas = document.getElementById('rune-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const input = document.getElementById('chant-input');
const btnCast = document.getElementById('btn-chant');
const btnJolt = document.getElementById('btn-rune-jolt');
const btnWipe = document.getElementById('btn-rune-wipe');
const readout = document.getElementById('rune-readout');

const storeKey = 'vort_rune_v1';

const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟᛞᛞᛞ'.split('');

const state = {
seed: 1,
t: 0,
jolt: 0,
stream: []
};

function fnv1a(str) {
let h = 2166136261;
for (let i = 0; i < str.length; i++) {
h ^= str.charCodeAt(i);
h = Math.imul(h, 16777619);
}
return (h >>> 0);
}

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function cast(chant) {
const cleaned = (chant || '').trim();
const real = cleaned.length ? cleaned : '...';
state.seed = (fnv1a(real) ^ dateSeedUTC()) >>> 0;

readout.textContent = `chant: ${real.slice(0, 22)}${real.length > 22 ? '…' : ''}`;
try { localStorage.setItem(storeKey, real); } catch (_) {}

const rand = mulberry32(state.seed);
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

state.stream = Array.from({ length: 140 }, (_, i) => {
const x = rand() * w;
const y = rand() * h;
const g = glyphs[Math.floor(rand() * glyphs.length)];
return {
x,
y,
vy: 0.3 + rand() * 1.2,
vx: (rand() - 0.5) * 0.15,
glyph: g,
size: 10 + rand() * 18,
hue: 95 + rand() * 40,
a: 0.35 + rand() * 0.6,
phase: rand() * 1000,
idx: i
};
});

// clean slate
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function wipe() {
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function step() {
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

state.t += 1;

ctx.fillStyle = 'rgba(0,0,0,0.14)';
ctx.fillRect(0, 0, w, h);

const drift = 0.4 + 0.15 * Math.sin(state.t * 0.01);
const wave = Math.max(0, state.jolt);
state.jolt *= 0.92;

for (const r of state.stream) {
const wob = Math.sin((state.t + r.phase) * 0.02) * 0.7;
r.x += r.vx + wob * 0.05 + wave * (0.3 * Math.sin(r.idx));
r.y += r.vy * drift + wave * 0.4;

if (r.y > h + 24) {
r.y = -24;
}
if (r.x < -24) r.x = w + 24;
if (r.x > w + 24) r.x = -24;

const glow = 0.45 + 0.35 * Math.sin((state.t + r.phase) * 0.04);
ctx.font = `${Math.floor(r.size)}px Courier New, monospace`;
ctx.fillStyle = `hsla(${r.hue}, 100%, 60%, ${r.a * glow})`;
ctx.fillText(r.glyph, r.x, r.y);
}

requestAnimationFrame(step);
}

canvas.addEventListener('click', () => { state.jolt = Math.min(6, state.jolt + 3); });
btnJolt.addEventListener('click', () => { state.jolt = Math.min(8, state.jolt + 4); });
btnWipe.addEventListener('click', wipe);

function castFromInput() {
cast(input.value);
}

btnCast.addEventListener('click', castFromInput);
input.addEventListener('keydown', (ev) => {
if (ev.key === 'Enter') castFromInput();
});

resize();
window.addEventListener('resize', () => { resize(); cast(input.value); });

let saved = '';
try { saved = localStorage.getItem(storeKey) || ''; } catch (_) {}
input.value = saved;
cast(saved);
requestAnimationFrame(step);
}
export function initSigilScriber() {
const canvas = document.getElementById('sigil-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const btnClear = document.getElementById('btn-sigil-clear');
const btnSave = document.getElementById('btn-sigil-save');
const toggleGlow = document.getElementById('toggle-sigil-glow');
const readout = document.getElementById('sigil-readout');

const storeKey = 'vort_sigil_v1';

const state = {
drawing: false,
last: null,
glow: true,
strokes: 0
};

try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.glow === 'boolean') state.glow = saved.glow;
} catch (_) {}

toggleGlow.checked = state.glow;

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function goblinInk(alpha=1) {
const c = getComputedStyle(document.documentElement).getPropertyValue('--goblin').trim() || '#00ff41';
// naive: use css var as base color; alpha applied via rgba by drawing shadow
return { color: c, alpha };
}

function wipe(forget=false) {
const rect = canvas.getBoundingClientRect();
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, rect.width, rect.height);
state.strokes = 0;
readout.textContent = forget ? 'ink: wiped' : 'ink: rinsed';
if (forget) {
try { localStorage.removeItem(storeKey + ':img'); } catch (_) {}
}
}

function savePrefs() {
try {
localStorage.setItem(storeKey, JSON.stringify({ glow: state.glow }));
} catch (_) {}
}

function persistImage() {
try {
const data = canvas.toDataURL('image/png');
localStorage.setItem(storeKey + ':img', data);
} catch (_) {}
}

function restoreImage() {
let data = null;
try { data = localStorage.getItem(storeKey + ':img'); } catch (_) {}
if (!data) return;

const img = new Image();
img.onload = () => {
const rect = canvas.getBoundingClientRect();
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, rect.width, rect.height);
ctx.drawImage(img, 0, 0, rect.width, rect.height);
readout.textContent = 'ink: restored';
};
img.src = data;
}

function canvasPoint(ev) {
const r = canvas.getBoundingClientRect();
return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}

function begin(ev) {
state.drawing = true;
state.last = canvasPoint(ev);
readout.textContent = 'ink: scratching';
}

function end() {
if (!state.drawing) return;
state.drawing = false;
state.last = null;
persistImage();
readout.textContent = `ink: set (strokes: ${state.strokes})`;
}

function draw(ev) {
if (!state.drawing) return;
const p = canvasPoint(ev);
const last = state.last || p;

const { color } = goblinInk();

ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = 2.2;

if (state.glow) {
ctx.shadowBlur = 12;
ctx.shadowColor = color;
} else {
ctx.shadowBlur = 0;
}

ctx.strokeStyle = color;
ctx.beginPath();
ctx.moveTo(last.x, last.y);
ctx.lineTo(p.x, p.y);
ctx.stroke();

// inner highlight
ctx.shadowBlur = 0;
ctx.lineWidth = 0.9;
ctx.strokeStyle = 'rgba(255,255,255,0.25)';
ctx.beginPath();
ctx.moveTo(last.x, last.y);
ctx.lineTo(p.x, p.y);
ctx.stroke();

state.last = p;
state.strokes += 1;
}

function punctuate(ev) {
const p = canvasPoint(ev);
const { color } = goblinInk();
ctx.shadowBlur = state.glow ? 18 : 0;
ctx.shadowColor = color;
ctx.fillStyle = color;
ctx.beginPath();
ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
ctx.fill();
ctx.shadowBlur = 0;
persistImage();
}

function download() {
const a = document.createElement('a');
a.download = `vort-sigil-${BUILD}.png`;
a.href = canvas.toDataURL('image/png');
a.click();
readout.textContent = 'ink: exported';
}

// wire
btnClear.addEventListener('click', () => wipe(true));
btnSave.addEventListener('click', download);
toggleGlow.addEventListener('change', () => {
state.glow = toggleGlow.checked;
savePrefs();
});

canvas.addEventListener('pointerdown', (ev) => { canvas.setPointerCapture(ev.pointerId); begin(ev); });
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', end);
canvas.addEventListener('pointercancel', end);
canvas.addEventListener('dblclick', punctuate);

resize();
window.addEventListener('resize', () => { resize(); restoreImage(); });

// init
wipe();
restoreImage();
readout.textContent = 'ink: primed';
}
export function initInkblotMirror() {
const canvas = document.getElementById('inkblot-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: false });

const btn = document.getElementById('btn-inkblot');
const btnSave = document.getElementById('btn-inkblot-save');
const toggleSym = document.getElementById('toggle-inkblot-sym');
const readout = document.getElementById('inkblot-readout');

const storeKey = 'vort_inkblot_v1';

const state = {
seed: (dateSeedUTC() ^ 0x1a2b3c4d) >>> 0,
sym: true
};

// numeric-only seed (avoid spooky JS weirdness)
state.seed = (dateSeedUTC() ^ 0x1a2b3c4d) >>> 0;

try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.seed === 'number') state.seed = saved.seed >>> 0;
if (saved && typeof saved.sym === 'boolean') state.sym = saved.sym;
} catch (_) {}

if (toggleSym) toggleSym.checked = state.sym;

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function save() {
try { localStorage.setItem(storeKey, JSON.stringify({ seed: state.seed, sym: state.sym })); } catch (_) {}
}

function wipe() {
const r = canvas.getBoundingClientRect();
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, r.width, r.height);
}

function drip(rand, x0, y0, maxSteps, mirrorSign) {
const r = canvas.getBoundingClientRect();
const w = r.width, h = r.height;

let x = x0;
let y = y0;
let vx = (rand() - 0.5) * 1.8;
let vy = 0.6 + rand() * 1.2;

for (let i = 0; i < maxSteps; i++) {
// drift
vx += (rand() - 0.5) * 0.22;
vy += (rand() - 0.5) * 0.18;
vx *= 0.92;
vy = Math.max(0.2, Math.min(2.4, vy * 0.98 + 0.04));

x += vx;
y += vy;

if (y > h - 6) break;
if (x < 6) x = 6;
if (x > w - 6) x = w - 6;

const age = i / maxSteps;
const radius = 2.2 + (1 - age) * (2.5 + rand() * 2.8);
const alpha = 0.08 + (1 - age) * 0.28;
const hue = 92 + rand() * 30;

ctx.fillStyle = `hsla(${hue}, 100%, 56%, ${alpha})`;
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();

// mirror if requested
if (state.sym && mirrorSign !== 0) {
const mx = (w * 0.5) + (w * 0.5 - x);
ctx.beginPath();
ctx.arc(mx, y, radius, 0, Math.PI * 2);
ctx.fill();
}

// occasional splat
if (rand() > 0.985) {
const spl = 8 + rand() * 18;
ctx.strokeStyle = `rgba(0,255,65,${0.06 + rand() * 0.12})`;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.arc(x, y, spl, 0, Math.PI * 2);
ctx.stroke();
}
}
}

function render() {
resize();
wipe();

const rand = mulberry32(state.seed);
const r = canvas.getBoundingClientRect();
const w = r.width, h = r.height;

// cave mist
const g = ctx.createRadialGradient(w * 0.55, h * 0.45, 0, w * 0.55, h * 0.45, w * 0.8);
g.addColorStop(0, 'rgba(0,255,65,0.05)');
g.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = g;
ctx.fillRect(0, 0, w, h);

const drops = 18 + Math.floor(rand() * 22);
for (let d = 0; d < drops; d++) {
const x0 = (w * 0.5) + (rand() - 0.5) * (w * 0.18);
const y0 = 12 + rand() * (h * 0.25);
const steps = 140 + Math.floor(rand() * 220);
drip(rand, x0, y0, steps, 1);
}

// border
ctx.strokeStyle = 'rgba(0,255,65,0.10)';
ctx.lineWidth = 1;
ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

if (readout) {
readout.textContent = `blot: seed ${state.seed.toString(16)} | ${state.sym ? 'sym' : 'wild'}`;
}

save();
}

function next() {
state.seed = (state.seed + 0x9E3779B9) >>> 0;
render();
}

function download() {
const a = document.createElement('a');
a.download = `vort-inkblot-${BUILD}.png`;
a.href = canvas.toDataURL('image/png');
a.click();
if (readout) readout.textContent = `blot: exported | seed ${state.seed.toString(16)}`;
}

if (btn) btn.addEventListener('click', next);
if (btnSave) btnSave.addEventListener('click', download);
if (toggleSym) {
toggleSym.addEventListener('change', () => {
state.sym = !!toggleSym.checked;
render();
});
}

canvas.addEventListener('click', () => next());
window.addEventListener('resize', render);

render();
}
export function initCaveDrone() {
const canvas = document.getElementById('audio-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const btn = document.getElementById('btn-audio-toggle');
const pitch = document.getElementById('audio-pitch');
const drift = document.getElementById('audio-drift');
const grit = document.getElementById('audio-grit');
const readout = document.getElementById('audio-readout');

const state = {
on: false,
ac: null,
oscA: null,
oscB: null,
lfo: null,
lfoGain: null,
filter: null,
gain: null,
noise: null,
noiseGain: null,
analyser: null,
data: null,
t: 0
};

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeNoise(ac) {
const len = ac.sampleRate * 2;
const buf = ac.createBuffer(1, len, ac.sampleRate);
const ch = buf.getChannelData(0);
for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * 0.35;
const src = ac.createBufferSource();
src.buffer = buf;
src.loop = true;
return src;
}

function ensureAudio() {
if (state.ac) return;
const ac = new (window.AudioContext || window.webkitAudioContext)();
state.ac = ac;

const oscA = ac.createOscillator();
const oscB = ac.createOscillator();
oscA.type = 'sine';
oscB.type = 'triangle';

const filter = ac.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 420;
filter.Q.value = 1.2;

const gain = ac.createGain();
gain.gain.value = 0.0;

const lfo = ac.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 0.08;
const lfoGain = ac.createGain();
lfoGain.gain.value = 2.0;

const noise = makeNoise(ac);
const noiseGain = ac.createGain();
noiseGain.gain.value = 0.0;

const analyser = ac.createAnalyser();
analyser.fftSize = 1024;
const data = new Uint8Array(analyser.frequencyBinCount);

oscA.connect(filter);
oscB.connect(filter);
noise.connect(filter);

filter.connect(analyser);
analyser.connect(gain);
gain.connect(ac.destination);

lfo.connect(lfoGain);
lfoGain.connect(oscA.frequency);
lfoGain.connect(oscB.frequency);

noise.connect(noiseGain);
noiseGain.connect(filter.frequency);

oscA.start();
oscB.start();
lfo.start();
noise.start();

state.oscA = oscA;
state.oscB = oscB;
state.lfo = lfo;
state.lfoGain = lfoGain;
state.filter = filter;
state.gain = gain;
state.noise = noise;
state.noiseGain = noiseGain;
state.analyser = analyser;
state.data = data;
}

function applyParams() {
if (!state.ac) return;
const base = Number(pitch.value);
const driftAmt = Number(drift.value) / 100;
const gritAmt = Number(grit.value) / 100;

state.oscA.frequency.value = base;
state.oscB.frequency.value = base * 1.01;

state.lfo.frequency.value = 0.04 + driftAmt * 0.35;
state.lfoGain.gain.value = 0.2 + driftAmt * 9.0;

state.filter.frequency.value = 180 + (1 - gritAmt) * 900;
state.filter.Q.value = 0.8 + gritAmt * 6.5;
state.noiseGain.gain.value = gritAmt * 0.02;

readout.textContent = `audio: ${state.on ? 'awake' : 'sleeping'} | pitch ${base}hz`;
}

function setOn(on) {
ensureAudio();
state.on = on;
btn.textContent = on ? 'Sleep' : 'Awaken';

const now = state.ac.currentTime;
state.gain.gain.cancelScheduledValues(now);
state.gain.gain.setValueAtTime(state.gain.gain.value, now);
state.gain.gain.linearRampToValueAtTime(on ? 0.22 : 0.0, now + 0.25);

applyParams();
}

function draw() {
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;
state.t += 1;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

if (state.analyser && state.data) {
state.analyser.getByteFrequencyData(state.data);
const bins = state.data.length;
ctx.strokeStyle = 'rgba(0,255,65,0.8)';
ctx.lineWidth = 2;
ctx.beginPath();
for (let i = 0; i < bins; i += 6) {
const v = state.data[i] / 255;
const x = (i / (bins - 1)) * w;
const y = h - (v * (h * 0.85)) - 8;
if (i === 0) ctx.moveTo(x, y);
else ctx.lineTo(x, y);
}
ctx.stroke();

const avg = state.data.reduce((a,b)=>a+b,0) / (bins * 255);
const grad = ctx.createRadialGradient(w*0.5, h*0.8, 0, w*0.5, h*0.8, w*0.7);
grad.addColorStop(0, `rgba(0,255,65,${0.08 + avg*0.18})`);
grad.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = grad;
ctx.fillRect(0,0,w,h);
} else {
ctx.fillStyle = 'rgba(0,255,65,0.35)';
ctx.font = '16px Courier New, monospace';
ctx.fillText('click Awaken to let the stone hum', 12, 28);
}

requestAnimationFrame(draw);
}

btn.addEventListener('click', async () => {
ensureAudio();
if (state.ac.state === 'suspended') {
try { await state.ac.resume(); } catch (_) {}
}
setOn(!state.on);
});

pitch.addEventListener('input', applyParams);
drift.addEventListener('input', applyParams);
grit.addEventListener('input', applyParams);

resize();
window.addEventListener('resize', resize);

readout.textContent = 'audio: sleeping';
requestAnimationFrame(draw);
}


export function initLichenBloom() {
const canvas = document.getElementById('lichen-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const btnSeed = document.getElementById('btn-lichen-seed');
const btnFreeze = document.getElementById('btn-lichen-freeze');
const toggleTrails = document.getElementById('toggle-lichen-trails');
const brush = document.getElementById('lichen-brush');
const readout = document.getElementById('lichen-readout');

const storeKey = 'vort_lichen_v1';

const state = {
frozen: false,
trails: false,
down: false,
erase: false,
brush: 3,
cols: 0,
rows: 0,
cell: 6,
a: null,
b: null,
age: null,
stepN: 0,
seed: (dateSeedUTC() ^ 0xC0FEBABE) >>> 0
};

try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.trails === 'boolean') state.trails = saved.trails;
if (saved && typeof saved.brush === 'number') state.brush = Math.max(1, Math.min(7, saved.brush));
} catch (_) {}

if (toggleTrails) toggleTrails.checked = state.trails;
if (brush) brush.value = String(state.brush);

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function savePrefs() {
try {
localStorage.setItem(storeKey, JSON.stringify({ trails: state.trails, brush: state.brush }));
} catch (_) {}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// choose cell size based on width (keeps it light)
state.cell = Math.max(5, Math.min(10, Math.floor(rect.width / 120)));
state.cols = Math.floor(rect.width / state.cell);
state.rows = Math.floor(rect.height / state.cell);

const n = state.cols * state.rows;
state.a = new Uint8Array(n);
state.b = new Uint8Array(n);
state.age = new Uint16Array(n);

seed(state.seed);
wipe(true);
draw();
}

function wipe(hard=false) {
if (hard) {
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
}
}

function seed(seedOverride) {
state.seed = (seedOverride ?? ((state.seed + 0x9E3779B9) >>> 0)) >>> 0;
const rand = mulberry32(state.seed);

state.a.fill(0);
state.b.fill(0);
state.age.fill(0);

// a few spore clusters
const clusters = 16;
for (let c = 0; c < clusters; c++) {
const cx = Math.floor(rand() * state.cols);
const cy = Math.floor(rand() * state.rows);
const r = 2 + Math.floor(rand() * 7);
for (let y = -r; y <= r; y++) {
for (let x = -r; x <= r; x++) {
const nx = cx + x;
const ny = cy + y;
if (nx < 0 || ny < 0 || nx >= state.cols || ny >= state.rows) continue;
if (x*x + y*y <= r*r && rand() > 0.25) {
const i = ny * state.cols + nx;
state.a[i] = 1;
state.age[i] = 1 + Math.floor(rand() * 20);
}
}
}
}

if (readout) readout.textContent = `cells: ${state.cols}x${state.rows} | seed: ${state.seed.toString(16)}`;
}

function neighbors(x, y) {
let n = 0;
for (let dy = -1; dy <= 1; dy++) {
for (let dx = -1; dx <= 1; dx++) {
if (dx === 0 && dy === 0) continue;
const xx = x + dx;
const yy = y + dy;
if (xx < 0 || yy < 0 || xx >= state.cols || yy >= state.rows) continue;
n += state.a[yy * state.cols + xx] ? 1 : 0;
}
}
return n;
}

function step() {
// slightly gentler than classic Life
const cols = state.cols, rows = state.rows;
for (let y = 0; y < rows; y++) {
for (let x = 0; x < cols; x++) {
const i = y * cols + x;
const alive = state.a[i] === 1;
const n = neighbors(x, y);

let next = 0;
if (alive) {
next = (n >= 1 && n <= 4) ? 1 : 0;
} else {
next = (n === 3) ? 1 : 0;
}

state.b[i] = next;
if (next) state.age[i] = alive ? Math.min(1200, state.age[i] + 1) : 1;
else state.age[i] = 0;
}
}

// swap
const tmp = state.a;
state.a = state.b;
state.b = tmp;
}

function cellColor(age) {
// age -> hue/brightness; keep cave-green
const a = Math.min(220, age);
const hue = 92 + (a * 0.08);
const light = 30 + (a * 0.12);
const alpha = 0.65 + Math.min(0.35, age / 400);
return `hsla(${hue}, 100%, ${Math.min(72, light)}%, ${alpha})`;
}

function draw() {
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

if (state.trails) {
ctx.fillStyle = 'rgba(0,0,0,0.18)';
ctx.fillRect(0, 0, w, h);
} else {
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);
}

const cell = state.cell;
const cols = state.cols;

// draw living cells
for (let i = 0; i < state.a.length; i++) {
if (!state.a[i]) continue;
const x = (i % cols);
const y = Math.floor(i / cols);
const age = state.age[i];

ctx.fillStyle = cellColor(age);
ctx.fillRect(x * cell, y * cell, cell, cell);

// tiny highlight speckle
if (age > 14 && (i + state.stepN) % 19 === 0) {
ctx.fillStyle = 'rgba(255,255,255,0.14)';
ctx.fillRect(x * cell + 1, y * cell + 1, 1, 1);
}
}

// subtle border grid (barely)
ctx.strokeStyle = 'rgba(0,255,65,0.05)';
ctx.lineWidth = 1;
ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function pointToCell(ev) {
const r = canvas.getBoundingClientRect();
const x = Math.floor((ev.clientX - r.left) / state.cell);
const y = Math.floor((ev.clientY - r.top) / state.cell);
return { x, y };
}

function paintAt(ev) {
const p = pointToCell(ev);
const b = state.brush;
for (let dy = -b; dy <= b; dy++) {
for (let dx = -b; dx <= b; dx++) {
const xx = p.x + dx;
const yy = p.y + dy;
if (xx < 0 || yy < 0 || xx >= state.cols || yy >= state.rows) continue;
if (dx*dx + dy*dy > b*b) continue;
const i = yy * state.cols + xx;
if (state.erase) {
state.a[i] = 0;
state.age[i] = 0;
} else {
state.a[i] = 1;
state.age[i] = Math.max(1, state.age[i]);
}
}
}
}

function loop() {
state.stepN += 1;
if (!state.frozen && state.a) {
// step slower than the other labs
if (state.stepN % 2 == 0) step();
}
draw();
requestAnimationFrame(loop);
}

// wire controls
if (btnSeed) btnSeed.addEventListener('click', () => { seed(); });
if (btnFreeze) btnFreeze.addEventListener('click', () => {
state.frozen = !state.frozen;
btnFreeze.textContent = state.frozen ? 'Unfreeze' : 'Freeze';
});
if (toggleTrails) toggleTrails.addEventListener('change', () => {
state.trails = toggleTrails.checked;
savePrefs();
});
if (brush) brush.addEventListener('input', () => {
state.brush = Math.max(1, Math.min(7, parseInt(brush.value || '3', 10) || 3));
savePrefs();
});

canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
canvas.addEventListener('pointerdown', (ev) => {
canvas.setPointerCapture(ev.pointerId);
state.down = true;
state.erase = (ev.button === 2);
paintAt(ev);
});
canvas.addEventListener('pointermove', (ev) => {
if (!state.down) return;
paintAt(ev);
});
canvas.addEventListener('pointerup', () => { state.down = false; state.erase = false; });
canvas.addEventListener('pointercancel', () => { state.down = false; state.erase = false; });

window.addEventListener('keydown', (ev) => {
if (ev.key === 'l' || ev.key === 'L') seed();
});

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(loop);
}
export function initCaveConstellations() {
const canvas = document.getElementById('constellation-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const btnSprout = document.getElementById('btn-constellation-sprout');
const btnClear = document.getElementById('btn-constellation-clear');
const toggleThreads = document.getElementById('toggle-constellation-threads');
const readout = document.getElementById('constellation-readout');

const storeKey = 'vort_constellations_v1';

const state = {
threads: true,
points: [],
t: 0
};

try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.threads === 'boolean') state.threads = saved.threads;
if (saved && Array.isArray(saved.points)) state.points = saved.points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number').slice(0, 140);
} catch (_) {}

if (toggleThreads) toggleThreads.checked = state.threads;

function save() {
try {
localStorage.setItem(storeKey, JSON.stringify({ threads: state.threads, points: state.points }));
} catch (_) {}
}

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function addStar(x, y) {
state.points.push({ x, y, hue: 90 + (x * 0.08) % 50, tw: Math.random() * 1000 });
if (state.points.length > 140) state.points.shift();
save();
if (readout) readout.textContent = `stars: ${state.points.length}`;
}

function clear() {
state.points = [];
save();
if (readout) readout.textContent = 'stars: 0';
}

function sprout() {
const rect = canvas.getBoundingClientRect();
const rand = mulberry32(dateSeedUTC() ^ 0xC0A57E11);
const n = 18 + Math.floor(rand() * 26);
for (let i = 0; i < n; i++) {
const x = 10 + rand() * (rect.width - 20);
const y = 10 + rand() * (rect.height - 20);
addStar(x, y);
}
if (readout) readout.textContent = `stars: ${state.points.length}`;
}

function dist(a, b) {
const dx = a.x - b.x;
const dy = a.y - b.y;
return Math.sqrt(dx*dx + dy*dy);
}

function draw() {
state.t += 1;
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

// soft nebula
const g = ctx.createRadialGradient(w*0.35, h*0.6, 0, w*0.35, h*0.6, w*0.8);
g.addColorStop(0, 'rgba(0,255,65,0.06)');
g.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = g;
ctx.fillRect(0,0,w,h);

if (state.threads && state.points.length > 1) {
// connect each star to its 2 nearest neighbors
for (let i = 0; i < state.points.length; i++) {
const p = state.points[i];
const others = state.points
.map((q, j) => ({ q, d: dist(p, q), j }))
.filter(x => x.j !== i)
.sort((a,b) => a.d - b.d)
.slice(0, 2);

for (const o of others) {
const q = o.q;
const a = Math.max(0, 0.22 - o.d / 420);
if (a <= 0) continue;
ctx.strokeStyle = `rgba(0,255,65,${a})`;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(p.x, p.y);
ctx.lineTo(q.x, q.y);
ctx.stroke();
}
}
}

for (const p of state.points) {
const tw = 0.4 + 0.6 * Math.sin((state.t + p.tw) * 0.03);
ctx.beginPath();
ctx.fillStyle = `hsla(${p.hue || 110}, 100%, ${60 + tw*12}%, ${0.55 + tw*0.35})`;
ctx.arc(p.x, p.y, 1.2 + tw * 1.6, 0, Math.PI * 2);
ctx.fill();

// tiny cross sparkle sometimes
if (((p.x + p.y + state.t) | 0) % 90 === 0) {
ctx.strokeStyle = 'rgba(255,255,255,0.18)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(p.x - 6, p.y);
ctx.lineTo(p.x + 6, p.y);
ctx.moveTo(p.x, p.y - 6);
ctx.lineTo(p.x, p.y + 6);
ctx.stroke();
}
}

requestAnimationFrame(draw);
}

function point(ev) {
const r = canvas.getBoundingClientRect();
return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}

canvas.addEventListener('click', (ev) => {
const p = point(ev);
addStar(p.x, p.y);
});
canvas.addEventListener('dblclick', () => clear());

if (btnSprout) btnSprout.addEventListener('click', sprout);
if (btnClear) btnClear.addEventListener('click', clear);
if (toggleThreads) {
toggleThreads.addEventListener('change', () => {
state.threads = toggleThreads.checked;
save();
});
}

window.addEventListener('keydown', (ev) => {
if (ev.key === 'c' || ev.key === 'C') sprout();
});

resize();
window.addEventListener('resize', resize);

if (readout) readout.textContent = `stars: ${state.points.length}`;
requestAnimationFrame(draw);
}
export function initGeodeGrower() {
const canvas = document.getElementById('geode-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: false });

const btnSeed = document.getElementById('btn-geode-seed');
const btnFreeze = document.getElementById('btn-geode-freeze');
const btnClear = document.getElementById('btn-geode-clear');
const toggleGlow = document.getElementById('toggle-geode-glow');
const readout = document.getElementById('geode-readout');

const storeKey = 'vort_geode_v1';

const state = {
frozen: false,
glow: true,
seeds: [], // normalized 0..1
segs: [],
t: 0
};

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function fnv1a(str) {
let h = 2166136261;
for (let i = 0; i < str.length; i++) {
h ^= str.charCodeAt(i);
h = Math.imul(h, 16777619);
}
return (h >>> 0);
}

function save() {
try {
localStorage.setItem(storeKey, JSON.stringify({
glow: state.glow,
seeds: state.seeds.slice(0, 60)
}));
} catch (_) {}
}

function load() {
try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.glow === 'boolean') state.glow = saved.glow;
if (saved && Array.isArray(saved.seeds)) {
state.seeds = saved.seeds
.filter(s => s && typeof s.x === 'number' && typeof s.y === 'number')
.map(s => ({ x: clamp(s.x, 0, 1), y: clamp(s.y, 0, 1) }))
.slice(0, 60);
}
} catch (_) {}
if (toggleGlow) toggleGlow.checked = state.glow;
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function point(ev) {
const r = canvas.getBoundingClientRect();
return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}

function addSeed(xPx, yPx) {
const r = canvas.getBoundingClientRect();
const nx = clamp(xPx / Math.max(1, r.width), 0, 1);
const ny = clamp(yPx / Math.max(1, r.height), 0, 1);
state.seeds.unshift({ x: nx, y: ny });
state.seeds = state.seeds.slice(0, 60);
rebuild();
save();
}

function clear() {
state.seeds = [];
state.segs = [];
save();
if (readout) readout.textContent = 'shards: 0';
}

function scatter(n=8) {
const r = canvas.getBoundingClientRect();
for (let i = 0; i < n; i++) {
addSeed(10 + Math.random() * (r.width - 20), 10 + Math.random() * (r.height - 20));
}
}

function rebuild() {
resize();

const r = canvas.getBoundingClientRect();
const w = r.width;
const h = r.height;

// occupancy grid for cheap collision
const cell = 5;
const cols = Math.max(1, Math.floor(w / cell));
const rows = Math.max(1, Math.floor(h / cell));
const occ = new Uint8Array(cols * rows);
const setOcc = (x, y) => {
const cx = clamp(Math.floor(x / cell), 0, cols - 1);
const cy = clamp(Math.floor(y / cell), 0, rows - 1);
occ[cy * cols + cx] = 1;
};
const isOcc = (x, y) => {
const cx = clamp(Math.floor(x / cell), 0, cols - 1);
const cy = clamp(Math.floor(y / cell), 0, rows - 1);
return occ[cy * cols + cx] === 1;
};

const segs = [];
const baseSeed = (dateSeedUTC() ^ fnv1a(BUILD) ^ 0x6E0D3E0D) >>> 0;

for (let i = 0; i < state.seeds.length; i++) {
const s = state.seeds[i];
const seed = (baseSeed ^ ((i + 1) * 0x9E3779B9)) >>> 0;
const rand = mulberry32(seed);

const x0 = s.x * w;
const y0 = s.y * h;

let tips = [{ x: x0, y: y0, a: rand() * Math.PI * 2, life: 0 }];
const hue0 = 260 + rand() * 80; // purple-ish geodes

const maxSegs = 420;
let made = 0;

while (tips.length && made < maxSegs) {
const tip = tips.pop();
let x = tip.x;
let y = tip.y;
let a = tip.a;

const runs = 18 + Math.floor(rand() * 54);
for (let step = 0; step < runs && made < maxSegs; step++) {
const nx = x + Math.cos(a) * (2.2 + rand() * 2.4);
const ny = y + Math.sin(a) * (2.2 + rand() * 2.4);

if (nx < 4 || ny < 4 || nx > w - 4 || ny > h - 4) break;
if (isOcc(nx, ny)) break;

const age = (tip.life + step);
const hue = hue0 + Math.sin(age * 0.03) * 18 + rand() * 8;
const width = 0.7 + rand() * 1.6;

segs.push({ x1: x, y1: y, x2: nx, y2: ny, hue, width, a: 0.22 + rand() * 0.25 });
setOcc(nx, ny);

x = nx; y = ny;
a += (rand() - 0.5) * 0.55; // crystalline kink
made++;

// branch sometimes
if (rand() > 0.94 && tips.length < 26) {
tips.push({ x, y, a: a + (rand() - 0.5) * 1.6, life: age });
}
}
}
}

state.segs = segs;
if (readout) readout.textContent = `shards: ${state.seeds.length}`;
}

function draw() {
const r = canvas.getBoundingClientRect();
const w = r.width, h = r.height;
state.t += state.frozen ? 0 : 1;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

// geode glow background
const g = ctx.createRadialGradient(w * 0.55, h * 0.55, 0, w * 0.55, h * 0.55, w * 0.9);
g.addColorStop(0, 'rgba(120,0,180,0.10)');
g.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = g;
ctx.fillRect(0, 0, w, h);

const pulse = 0.55 + 0.45 * Math.sin(state.t * 0.018);

for (const s of state.segs) {
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = s.width;

if (state.glow) {
ctx.shadowBlur = 14;
ctx.shadowColor = `hsla(${s.hue}, 100%, 70%, ${0.6 * pulse})`;
} else {
ctx.shadowBlur = 0;
}

ctx.strokeStyle = `hsla(${s.hue}, 100%, 62%, ${s.a * (0.65 + 0.35 * pulse)})`;
ctx.beginPath();
ctx.moveTo(s.x1, s.y1);
ctx.lineTo(s.x2, s.y2);
ctx.stroke();

// inner highlight
ctx.shadowBlur = 0;
ctx.lineWidth = Math.max(0.6, s.width * 0.4);
ctx.strokeStyle = 'rgba(255,255,255,0.10)';
ctx.beginPath();
ctx.moveTo(s.x1, s.y1);
ctx.lineTo(s.x2, s.y2);
ctx.stroke();
}

// border
ctx.shadowBlur = 0;
ctx.strokeStyle = 'rgba(0,255,65,0.08)';
ctx.lineWidth = 1;
ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

requestAnimationFrame(draw);
}

// wire
canvas.addEventListener('click', (ev) => {
const p = point(ev);
addSeed(p.x, p.y);
});

if (btnSeed) btnSeed.addEventListener('click', () => scatter(6));
if (btnClear) btnClear.addEventListener('click', clear);
if (btnFreeze) btnFreeze.addEventListener('click', () => {
state.frozen = !state.frozen;
btnFreeze.textContent = state.frozen ? 'Unfreeze' : 'Freeze';
});

if (toggleGlow) {
toggleGlow.addEventListener('change', () => {
state.glow = !!toggleGlow.checked;
save();
});
}

window.addEventListener('keydown', (ev) => {
if (ev.key === 'x' || ev.key === 'X') scatter(10);
});

load();
rebuild();
window.addEventListener('resize', rebuild);
requestAnimationFrame(draw);
}
export function initEchoTopography() {
const canvas = document.getElementById('topo-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: false });

const btnRegen = document.getElementById('btn-topo-regenerate');
const btnFreeze = document.getElementById('btn-topo-freeze');
const btnSave = document.getElementById('btn-topo-save');
const contours = document.getElementById('topo-contours');
const readout = document.getElementById('topo-readout');

const storeKey = 'vort_topo_v1';

const state = {
frozen: false,
seed: (dateSeedUTC() ^ 0xEC402026) >>> 0,
dents: [], // {x:0..1,y:0..1,r:0..1,s:-1..1}
contourCount: 11,
t: 0
};

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function hash2i(ix, iy, seed) {
// cheap deterministic hash: returns 0..1
let h = (ix * 374761393 + iy * 668265263) ^ seed;
h = (h ^ (h >>> 13)) * 1274126177;
h = (h ^ (h >>> 16)) >>> 0;
return h / 4294967296;
}

function smooth(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

function valueNoise(x, y, seed) {
const x0 = Math.floor(x), y0 = Math.floor(y);
const fx = smooth(x - x0);
const fy = smooth(y - y0);

const a = hash2i(x0, y0, seed);
const b = hash2i(x0 + 1, y0, seed);
const c = hash2i(x0, y0 + 1, seed);
const d = hash2i(x0 + 1, y0 + 1, seed);

const ab = lerp(a, b, fx);
const cd = lerp(c, d, fx);
return lerp(ab, cd, fy);
}

function fbm(x, y, seed) {
let v = 0;
let amp = 0.65;
let f = 1;
for (let o = 0; o < 4; o++) {
v += amp * valueNoise(x * f, y * f, (seed + o * 1013) >>> 0);
amp *= 0.5;
f *= 2;
}
return v;
}

function load() {
try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.seed === 'number') state.seed = saved.seed >>> 0;
if (saved && Array.isArray(saved.dents)) {
state.dents = saved.dents
.filter(d => d && typeof d.x === 'number' && typeof d.y === 'number')
.map(d => ({
x: clamp(d.x, 0, 1),
y: clamp(d.y, 0, 1),
r: clamp(typeof d.r === 'number' ? d.r : 0.12, 0.02, 0.45),
s: clamp(typeof d.s === 'number' ? d.s : -0.7, -1, 1)
}))
.slice(0, 36);
}
if (saved && typeof saved.contourCount === 'number') state.contourCount = clamp(saved.contourCount, 4, 18);
} catch (_) {}

if (contours) contours.value = String(state.contourCount);
}

function save() {
try {
localStorage.setItem(storeKey, JSON.stringify({
seed: state.seed,
dents: state.dents.slice(0, 36),
contourCount: state.contourCount
}));
} catch (_) {}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function point(ev) {
const r = canvas.getBoundingClientRect();
return { x: (ev.clientX - r.left), y: (ev.clientY - r.top), w: r.width, h: r.height };
}

function addDent(px, py) {
const r = canvas.getBoundingClientRect();
const nx = clamp(px / Math.max(1, r.width), 0, 1);
const ny = clamp(py / Math.max(1, r.height), 0, 1);

// thumbprint: mostly negative (a depression), sometimes a proud bump
const rand = mulberry32((state.seed ^ ((state.dents.length + 1) * 0x9E3779B9)) >>> 0);
const radius = 0.08 + rand() * 0.13;
const strength = (rand() > 0.86) ? (0.35 + rand() * 0.45) : (-0.65 - rand() * 0.55);

state.dents.unshift({ x: nx, y: ny, r: radius, s: strength });
state.dents = state.dents.slice(0, 36);
save();
}

function heightAt(nx, ny, drift) {
// noise domain: scale up + drift
const x = nx * 6.4 + drift.x;
const y = ny * 4.4 + drift.y;

let h = fbm(x, y, state.seed);
h = (h - 0.45) * 1.35; // center-ish

for (const d of state.dents) {
const dx = nx - d.x;
const dy = ny - d.y;
const dist = Math.sqrt(dx*dx + dy*dy);
const k = Math.max(0, 1 - dist / d.r);
// smooth mound
h += d.s * (k*k) * 0.55;
}

// keep it sane
return clamp(h, -1.0, 1.0);
}

function render() {
const r = canvas.getBoundingClientRect();
const w = r.width, h = r.height;
const cell = Math.max(5, Math.min(9, Math.floor(w / 120)));
const cols = Math.max(2, Math.floor(w / cell));
const rows = Math.max(2, Math.floor(h / cell));

const drift = {
x: 0.35 * Math.sin(state.t * 0.0021),
y: 0.35 * Math.cos(state.t * 0.0017)
};

// compute heights per cell (for contours)
const field = new Float32Array(cols * rows);
let min = 1e9, max = -1e9;
for (let yy = 0; yy < rows; yy++) {
for (let xx = 0; xx < cols; xx++) {
const nx = xx / (cols - 1);
const ny = yy / (rows - 1);
const v = heightAt(nx, ny, drift);
field[yy * cols + xx] = v;
if (v < min) min = v;
if (v > max) max = v;
}
}

// background
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

// fill cells (pseudo-heatmap)
for (let yy = 0; yy < rows; yy++) {
for (let xx = 0; xx < cols; xx++) {
const v = field[yy * cols + xx];
const t = (v - min) / Math.max(1e-6, (max - min));
const hue = 95 + t * 55; // cave-green -> teal-ish
const light = 18 + t * 42;
ctx.fillStyle = `hsl(${hue}, 100%, ${light}%)`;
ctx.fillRect(xx * cell, yy * cell, cell + 1, cell + 1);
}
}

// contours
const nLevels = state.contourCount;
ctx.lineWidth = 1;
for (let l = 1; l < nLevels; l++) {
const level = min + (l / nLevels) * (max - min);
const a = 0.05 + (l / nLevels) * 0.18;
ctx.strokeStyle = `rgba(0,0,0,${0.35})`;
ctx.fillStyle = `rgba(255,255,255,${a})`;

for (let yy = 0; yy < rows - 1; yy++) {
for (let xx = 0; xx < cols - 1; xx++) {
const i = yy * cols + xx;
const v00 = field[i];
const v10 = field[i + 1];
const v01 = field[i + cols];
const v11 = field[i + cols + 1];

// if this cell straddles the contour, draw a thin boxy hint
const lo = Math.min(v00, v10, v01, v11);
const hi = Math.max(v00, v10, v01, v11);
if (level < lo || level > hi) continue;

// cheap: draw little line segments on edges where sign changes
const x = xx * cell;
const y = yy * cell;

ctx.beginPath();
if ((v00 < level) !== (v10 < level)) { ctx.moveTo(x + cell*0.5, y); ctx.lineTo(x + cell*0.5, y + 2); }
if ((v10 < level) !== (v11 < level)) { ctx.moveTo(x + cell, y + cell*0.5); ctx.lineTo(x + cell - 2, y + cell*0.5); }
if ((v01 < level) !== (v11 < level)) { ctx.moveTo(x + cell*0.5, y + cell); ctx.lineTo(x + cell*0.5, y + cell - 2); }
if ((v00 < level) !== (v01 < level)) { ctx.moveTo(x, y + cell*0.5); ctx.lineTo(x + 2, y + cell*0.5); }
ctx.strokeStyle = `rgba(0,0,0,${0.25 + a})`;
ctx.stroke();
}
}
}

// border + readout
ctx.strokeStyle = 'rgba(0,255,65,0.10)';
ctx.lineWidth = 1;
ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

if (readout) {
readout.textContent = `map: seed ${state.seed.toString(16)} | dents ${state.dents.length} | contours ${state.contourCount}`;
}
}

function regen() {
state.seed = (state.seed + 0x9E3779B9) >>> 0;
state.dents = [];
save();
}

function download() {
const a = document.createElement('a');
a.download = `vort-topography-${BUILD}.png`;
a.href = canvas.toDataURL('image/png');
a.click();
}

// wire
if (btnRegen) btnRegen.addEventListener('click', () => { regen(); });
if (btnFreeze) btnFreeze.addEventListener('click', () => {
state.frozen = !state.frozen;
btnFreeze.textContent = state.frozen ? 'Unfreeze' : 'Freeze';
});
if (btnSave) btnSave.addEventListener('click', download);

if (contours) {
contours.addEventListener('input', () => {
state.contourCount = clamp(Number(contours.value), 4, 18);
save();
});
}

canvas.addEventListener('click', (ev) => {
const p = point(ev);
addDent(p.x, p.y);
});

resize();
window.addEventListener('resize', resize);

load();
save();

function loop() {
if (!state.frozen) state.t += 1;
render();
requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
}

export function initNeedleOfNoise() {
const canvas = document.getElementById('compass-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: false });

const readout = document.getElementById('compass-readout');
const btnWaypoint = document.getElementById('btn-compass-waypoint');
const btnClear = document.getElementById('btn-compass-clear');
const btnSave = document.getElementById('btn-compass-save');
const jitter = document.getElementById('compass-jitter');

const KEY = 'vort_compass_v1';

const state = {
t: 0,
jitter: 12,
frozen: false,
hasMouse: false,
mx: 0,
my: 0,
waypoint: null // { x: 0..1, y: 0..1 }
};

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function canvasPoint(ev) {
const r = canvas.getBoundingClientRect();
return { x: ev.clientX - r.left, y: ev.clientY - r.top, w: r.width, h: r.height };
}

function load() {
try {
const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
if (saved && typeof saved.jitter === 'number') state.jitter = clamp(saved.jitter, 0, 30);
if (saved && saved.waypoint && typeof saved.waypoint.x === 'number' && typeof saved.waypoint.y === 'number') {
state.waypoint = { x: clamp(saved.waypoint.x, 0, 1), y: clamp(saved.waypoint.y, 0, 1) };
}
} catch (_) {}

if (jitter) jitter.value = String(state.jitter);
}

function save() {
try {
localStorage.setItem(KEY, JSON.stringify({ jitter: state.jitter, waypoint: state.waypoint }));
} catch (_) {}
}

function setWaypointFromPixels(px, py) {
const r = canvas.getBoundingClientRect();
state.waypoint = {
x: clamp(px / Math.max(1, r.width), 0, 1),
y: clamp(py / Math.max(1, r.height), 0, 1)
};
save();
}

function clear() {
state.waypoint = null;
save();
}

function download() {
const a = document.createElement('a');
a.download = `vort-needle-of-noise-${BUILD}.png`;
a.href = canvas.toDataURL('image/png');
a.click();
}

function render() {
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

const cx = w * 0.5;
const cy = h * 0.54;
const R = Math.min(w, h) * 0.42;

// cave glow
const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
g.addColorStop(0, 'rgba(0,255,65,0.10)');
g.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = g;
ctx.fillRect(0, 0, w, h);

// ring
ctx.strokeStyle = 'rgba(0,255,65,0.55)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(cx, cy, R, 0, Math.PI * 2);
ctx.stroke();

// ticks + pseudo-runes
for (let i = 0; i < 48; i++) {
const a = (i / 48) * Math.PI * 2;
const inner = R - (i % 6 === 0 ? 14 : 8);
const outer = R + (i % 12 === 0 ? 10 : 6);
const x1 = cx + Math.cos(a) * inner;
const y1 = cy + Math.sin(a) * inner;
const x2 = cx + Math.cos(a) * outer;
const y2 = cy + Math.sin(a) * outer;
ctx.strokeStyle = i % 12 === 0 ? 'rgba(0,255,65,0.75)' : 'rgba(0,255,65,0.25)';
ctx.lineWidth = i % 12 === 0 ? 2 : 1;
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.stroke();
}

// target
const target = (() => {
if (state.waypoint) return { x: state.waypoint.x * w, y: state.waypoint.y * h, kind: 'waypoint' };
if (state.hasMouse) return { x: state.mx, y: state.my, kind: 'mouse' };
return { x: cx, y: cy - R * 0.4, kind: 'default' };
})();

// draw waypoint
if (state.waypoint) {
ctx.fillStyle = 'rgba(255,213,74,0.9)';
ctx.beginPath();
ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = 'rgba(255,213,74,0.35)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(target.x, target.y, 12, 0, Math.PI * 2);
ctx.stroke();
}

const dx = target.x - cx;
const dy = target.y - cy;
let ang = Math.atan2(dy, dx);

// noise-jitter (the cave lies)
const j = (state.jitter / 30);
const wobble = Math.sin(state.t * 0.03) * 0.9 + Math.sin(state.t * 0.011 + 2.1) * 0.6;
ang += wobble * j * 0.28;

// needle
const nx = cx + Math.cos(ang) * (R * 0.78);
const ny = cy + Math.sin(ang) * (R * 0.78);

ctx.lineWidth = 3;
ctx.strokeStyle = 'rgba(0,255,65,0.9)';
ctx.beginPath();
ctx.moveTo(cx, cy);
ctx.lineTo(nx, ny);
ctx.stroke();

// tail
ctx.lineWidth = 2;
ctx.strokeStyle = 'rgba(0,255,65,0.25)';
ctx.beginPath();
ctx.moveTo(cx, cy);
ctx.lineTo(cx - Math.cos(ang) * (R * 0.25), cy - Math.sin(ang) * (R * 0.25));
ctx.stroke();

// center eye
ctx.fillStyle = 'rgba(0,0,0,0.95)';
ctx.beginPath();
ctx.arc(cx, cy, 7, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = 'rgba(0,255,65,0.9)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(cx, cy, 7, 0, Math.PI * 2);
ctx.stroke();

// readout
if (readout) {
const deg = ((ang * 180 / Math.PI) + 360) % 360;
const mode = state.waypoint ? 'waypoint' : (state.hasMouse ? 'mouse' : 'north-ish');
readout.textContent = `needle: ${deg.toFixed(1)}° | mode: ${mode}`;
}
}

// wiring
canvas.addEventListener('mousemove', (ev) => {
const p = canvasPoint(ev);
state.mx = p.x;
state.my = p.y;
state.hasMouse = true;
});
canvas.addEventListener('mouseleave', () => state.hasMouse = false);
canvas.addEventListener('click', (ev) => {
const p = canvasPoint(ev);
setWaypointFromPixels(p.x, p.y);
});

if (btnWaypoint) btnWaypoint.addEventListener('click', () => {
if (state.hasMouse) setWaypointFromPixels(state.mx, state.my);
});
if (btnClear) btnClear.addEventListener('click', clear);
if (btnSave) btnSave.addEventListener('click', download);

if (jitter) {
jitter.addEventListener('input', () => {
state.jitter = clamp(Number(jitter.value), 0, 30);
save();
});
}

resize();
window.addEventListener('resize', resize);
load();
save();

function loop() {
state.t += 1;
render();
requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
}

export function initSparkMothWall() {
const canvas = document.getElementById('moth-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const trailsToggle = document.getElementById('toggle-trails');
const btnReseed = document.getElementById('btn-reseed');
const btnFreeze = document.getElementById('btn-freeze');
const readout = document.getElementById('lab-readout');

const state = {
frozen: false,
trails: false,
seed: (dateSeedUTC() ^ 0xA5A5A5A5) >>> 0,
t: 0,
mx: 0,
my: 0,
hasMouse: false,
swarm: []
};

const storeKey = 'vort_lab_v1';
try {
const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
if (saved && typeof saved.trails === 'boolean') state.trails = saved.trails;
} catch (_) {}

trailsToggle.checked = state.trails;

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function reseed(seedOverride) {
state.seed = (seedOverride ?? ((state.seed + 0x9E3779B9) >>> 0)) >>> 0;
const rand = mulberry32(state.seed);
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

state.swarm = Array.from({ length: 80 }, () => {
const angle = rand() * Math.PI * 2;
const r = Math.pow(rand(), 0.35) * Math.min(w, h) * 0.42;
return {
x: w * 0.5 + Math.cos(angle) * r,
y: h * 0.55 + Math.sin(angle) * r,
vx: (rand() - 0.5) * 0.6,
vy: (rand() - 0.5) * 0.6,
hue: 95 + rand() * 40,
phase: rand() * 1000,
size: 0.7 + rand() * 1.8
};
});

readout.textContent = `seed: ${state.seed.toString(16)}`;
}

function savePrefs() {
try {
localStorage.setItem(storeKey, JSON.stringify({ trails: state.trails }));
} catch (_) {}
}

function background() {
if (state.trails) {
ctx.fillStyle = 'rgba(0,0,0,0.10)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
} else {
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
}
}

function step() {
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

if (!state.frozen) state.t += 1;
background();

const cx = w * 0.5;
const cy = h * 0.55;

// lantern point
const lx = state.hasMouse ? state.mx : cx;
const ly = state.hasMouse ? state.my : cy;

// draw lantern glow
const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 140);
grad.addColorStop(0, 'rgba(0,255,65,0.15)');
grad.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, w, h);

for (const p of state.swarm) {
if (!state.frozen) {
const dx = lx - p.x;
const dy = ly - p.y;
const dist = Math.max(18, Math.sqrt(dx*dx + dy*dy));
const pull = 22 / dist;

// orbit around cave-heart
const ox = p.x - cx;
const oy = p.y - cy;
const swirl = 0.0009;

p.vx += (dx / dist) * pull + (-oy) * swirl;
p.vy += (dy / dist) * pull + ( ox) * swirl;

// gentle noise
const n = Math.sin((state.t + p.phase) * 0.02);
p.vx += n * 0.03;
p.vy += Math.cos((state.t + p.phase) * 0.021) * 0.03;

p.vx *= 0.92;
p.vy *= 0.92;

p.x += p.vx;
p.y += p.vy;

// bounds bounce
if (p.x < 4 || p.x > w - 4) p.vx *= -1;
if (p.y < 4 || p.y > h - 4) p.vy *= -1;
p.x = Math.max(4, Math.min(w - 4, p.x));
p.y = Math.max(4, Math.min(h - 4, p.y));
}

const glow = 0.35 + 0.35 * Math.sin((state.t + p.phase) * 0.05);
ctx.beginPath();
ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${0.25 + glow})`;
ctx.arc(p.x, p.y, p.size * (1.2 + glow), 0, Math.PI * 2);
ctx.fill();

// little rune tail
ctx.strokeStyle = `hsla(${p.hue}, 100%, 60%, ${0.18 + glow * 0.3})`;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(p.x, p.y);
ctx.lineTo(p.x - p.vx * 10, p.y - p.vy * 10);
ctx.stroke();
}

requestAnimationFrame(step);
}

function canvasPointFromEvent(ev) {
const r = canvas.getBoundingClientRect();
const x = (ev.clientX - r.left);
const y = (ev.clientY - r.top);
return { x, y };
}

canvas.addEventListener('mousemove', (ev) => {
const p = canvasPointFromEvent(ev);
state.mx = p.x;
state.my = p.y;
state.hasMouse = true;
});
canvas.addEventListener('mouseleave', () => state.hasMouse = false);
canvas.addEventListener('click', (ev) => {
const p = canvasPointFromEvent(ev);
// slap a ripple through velocities
for (const m of state.swarm) {
const dx = m.x - p.x;
const dy = m.y - p.y;
const d = Math.max(12, Math.sqrt(dx*dx + dy*dy));
const kick = 14 / d;
m.vx += (dx / d) * kick;
m.vy += (dy / d) * kick;
}
});

window.addEventListener('keydown', (ev) => {
if (ev.key === 'r' || ev.key === 'R') reseed();
});

btnReseed.addEventListener('click', () => reseed());
btnFreeze.addEventListener('click', () => {
state.frozen = !state.frozen;
btnFreeze.textContent = state.frozen ? 'Unfreeze' : 'Freeze';
});

trailsToggle.addEventListener('change', () => {
state.trails = trailsToggle.checked;
savePrefs();
});

resize();
window.addEventListener('resize', () => { resize(); reseed(state.seed); });

reseed(state.seed);
background();
requestAnimationFrame(loop);
}

export function initSporeGarden() {
const canvas = document.getElementById('spore-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: false });

const btnSeed = document.getElementById('btn-spore-seed');
const btnClear = document.getElementById('btn-spore-clear');
const btnSave = document.getElementById('btn-spore-save');
const readout = document.getElementById('spore-readout');

const state = {
t: 0,
spores: [], // {x, y, age, branches: []}
seed: (dateSeedUTC() ^ 0x5908E) >>> 0
};

function mulberry32(a) {
return function() {
let t = a += 0x6D2B79F5;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
}

function resize() {
const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const rect = canvas.getBoundingClientRect();
canvas.width = Math.floor(rect.width * dpr);
canvas.height = Math.floor(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function addSpore(x, y) {
const rand = mulberry32(state.seed ^ (state.spores.length * 777));
const spore = {
x, y,
age: 0,
hue: 140 + rand() * 60,
growth: []
};
// initial branches
for (let i = 0; i < 4; i++) {
spore.growth.push({
x, y,
angle: (i / 4) * Math.PI * 2 + (rand() - 0.5) * 0.5,
alive: true
});
}
state.spores.push(spore);
if (readout) readout.textContent = `mycelium: ${state.spores.length} clusters`;
}

function clear() {
state.spores = [];
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
if (readout) readout.textContent = 'mycelium: dormant';
}

function grow() {
const rect = canvas.getBoundingClientRect();
const w = rect.width, h = rect.height;

for (const s of state.spores) {
if (s.age > 100) continue;
s.age++;

for (const g of s.growth) {
if (!g.alive) continue;

const rand = mulberry32(state.seed ^ (s.age * 13) ^ (state.spores.indexOf(s) * 91));
const step = 2 + rand() * 3;
const nx = g.x + Math.cos(g.angle) * step;
const ny = g.y + Math.sin(g.angle) * step;

if (nx < 0 || nx > w || ny < 0 || ny > h || rand() > 0.98) {
g.alive = false;
continue;
}

ctx.strokeStyle = `hsla(${s.hue}, 80%, 50%, ${0.6 - s.age * 0.005})`;
ctx.lineWidth = Math.max(0.5, 2 - s.age * 0.02);
ctx.beginPath();
ctx.moveTo(g.x, g.y);
ctx.lineTo(nx, ny);
ctx.stroke();

g.x = nx;
g.y = ny;
g.angle += (rand() - 0.5) * 0.6;

if (rand() > 0.92 && s.growth.length < 50) {
s.growth.push({
x: nx, y: ny,
angle: g.angle + (rand() > 0.5 ? 0.8 : -0.8),
alive: true
});
}
}
}
}

function loop() {
state.t++;
grow();
requestAnimationFrame(loop);
}

canvas.addEventListener('click', (ev) => {
const r = canvas.getBoundingClientRect();
addSpore(ev.clientX - r.left, ev.clientY - r.top);
});

btnSeed.addEventListener('click', () => {
const r = canvas.getBoundingClientRect();
for (let i = 0; i < 5; i++) {
addSpore(Math.random() * r.width, Math.random() * r.height);
}
});

btnClear.addEventListener('click', clear);
btnSave.addEventListener('click', () => {
const a = document.createElement('a');
a.download = `vort-spore-garden.png`;
a.href = canvas.toDataURL('image/png');
a.click();
});

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(loop);
}

export function initVoidPebbles() {
    const canvas = document.getElementById('pebble-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const btnReseed = document.getElementById('btn-pebble-reseed');
    const readout = document.getElementById('pebble-readout');

    const state = {
        seed: (dateSeedUTC() ^ 0x9EB81E) >>> 0,
        pebbles: []
    };

    function mulberry32(a) {
        return function() {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
    }

    function resize() {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function generate() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        const rand = mulberry32(state.seed);
        
        state.pebbles = Array.from({ length: 40 }, () => {
            const size = 10 + rand() * 40;
            return {
                x: rand() * w,
                y: rand() * h,
                r: size,
                hue: rand() * 360,
                sat: 10 + rand() * 20,
                lum: 10 + rand() * 15,
                rot: rand() * Math.PI * 2,
                noise: Array.from({ length: 8 }, () => rand())
            };
        });

        if (readout) readout.textContent = `void: seed ${state.seed.toString(16)}`;
    }

    function draw() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        for (const p of state.pebbles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const r = p.r * (0.8 + p.noise[i] * 0.4);
                const x = Math.cos(ang) * r;
                const y = Math.sin(ang) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            
            ctx.fillStyle = `hsl(${p.hue}, ${p.sat}%, ${p.lum}%)`;
            ctx.fill();
            ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${p.lum + 20}%, 0.3)`;
            ctx.stroke();
            ctx.restore();
        }
    }

    btnReseed?.addEventListener('click', () => {
        state.seed = (state.seed + 1) >>> 0;
        generate();
        draw();
    });

    resize();
    window.addEventListener('resize', () => { resize(); draw(); });
    generate();
    draw();
}

export function initDataCrystals() {
    const canvas = document.getElementById('crystal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const btnGrow = document.getElementById('btn-crystal-grow');
    const btnShatter = document.getElementById('btn-crystal-shatter');
    const readout = document.getElementById('crystal-readout');

    const state = {
        crystals: [],
        seed: (dateSeedUTC() ^ 0xDA7A) >>> 0
    };

    function mulberry32(a) {
        return function() {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
    }

    function resize() {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function grow() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        const rand = mulberry32(state.seed ^ (state.crystals.length * 123));
        
        const x = rand() * w;
        const y = h - 10;
        const height = 40 + rand() * 120;
        const width = 15 + rand() * 30;
        const hue = 180 + rand() * 60; // Cyan to Purple

        state.crystals.push({ x, y, h: height, w: width, hue, points: [
            {dx: -width/2, dy: 0},
            {dx: -width/2, dy: -height * 0.7},
            {dx: 0, dy: -height},
            {dx: width/2, dy: -height * 0.7},
            {dx: width/2, dy: 0}
        ]});
        
        if (readout) readout.textContent = `crystals: ${state.crystals.length}`;
    }

    function draw() {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, rect.width, rect.height);

        for (const c of state.crystals) {
            ctx.beginPath();
            ctx.moveTo(c.x + c.points[0].dx, c.y + c.points[0].dy);
            for (let i = 1; i < c.points.length; i++) {
                ctx.lineTo(c.x + c.points[i].dx, c.y + c.points[i].dy);
            }
            ctx.closePath();
            
            const grad = ctx.createLinearGradient(c.x, c.y, c.x, c.y - c.h);
            grad.addColorStop(0, `hsla(${c.hue}, 100%, 20%, 0.8)`);
            grad.addColorStop(1, `hsla(${c.hue}, 100%, 70%, 0.9)`);
            
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = `hsla(${c.hue}, 100%, 80%, 0.5)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    btnGrow?.addEventListener('click', () => {
        state.seed = (state.seed + 1) >>> 0;
        grow();
        draw();
    });

    btnShatter?.addEventListener('click', () => {
        state.crystals = [];
        draw();
        if (readout) readout.textContent = 'crystals: shattered';
    });

    resize();
    window.addEventListener('resize', () => { resize(); draw(); });
    draw();
}

export function initEchoLattice() {
    const canvas = document.getElementById('echo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const btnPing = document.getElementById('btn-echo-ping');
    const btnClear = document.getElementById('btn-echo-clear');
    const readout = document.getElementById('echo-readout');

    const state = {
        nodes: [],
        pings: [],
        t: 0
    };

    function resize() {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function ping(x, y) {
        state.nodes.push({ x, y, hue: 100 + Math.random() * 60 });
        state.pings.push({ x, y, r: 0, a: 1 });
        if (state.nodes.length > 50) state.nodes.shift();
        if (readout) readout.textContent = `nodes: ${state.nodes.length}`;
    }

    function draw() {
        state.t++;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, w, h);

        // connections
        ctx.lineWidth = 1;
        for (let i = 0; i < state.nodes.length; i++) {
            for (let j = i + 1; j < state.nodes.length; j++) {
                const n1 = state.nodes[i];
                const n2 = state.nodes[j];
                const d = Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2);
                if (d < 100) {
                    ctx.strokeStyle = `rgba(0, 255, 65, ${1 - d/100})`;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }

        // nodes
        for (const n of state.nodes) {
            ctx.fillStyle = `hsl(${n.hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // pings
        for (let i = state.pings.length - 1; i >= 0; i--) {
            const p = state.pings[i];
            p.r += 2;
            p.a -= 0.02;
            if (p.a <= 0) {
                state.pings.splice(i, 1);
                continue;
            }
            ctx.strokeStyle = `rgba(0, 255, 65, ${p.a})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }

    canvas.addEventListener('click', (ev) => {
        const r = canvas.getBoundingClientRect();
        ping(ev.clientX - r.left, ev.clientY - r.top);
    });

    btnPing?.addEventListener('click', () => {
        const r = canvas.getBoundingClientRect();
        ping(Math.random() * r.width, Math.random() * r.height);
    });

    btnClear?.addEventListener('click', () => {
        state.nodes = [];
        state.pings = [];
        if (readout) readout.textContent = 'nodes: 0';
    });

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
}

export function initDigitalFossil() {
    const canvas = document.getElementById('fossil-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const btnDig = document.getElementById('btn-fossil-dig');
    const btnReset = document.getElementById('btn-fossil-reset');
    const readout = document.getElementById('fossil-readout');

    const state = {
        layers: [],
        depth: 0,
        seed: (dateSeedUTC() ^ 0xF0551L) >>> 0
    };

    function mulberry32(a) {
        return function() {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
    }

    function resize() {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function dig() {
        state.depth++;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        const rand = mulberry32(state.seed ^ state.depth);
        
        const layer = {
            y: (state.depth * 20) % h,
            color: `hsl(${140 + rand() * 40}, ${20 + rand() * 30}%, ${10 + rand() * 20}%)`,
            shapes: Array.from({ length: 5 }, () => ({
                x: rand() * w,
                r: 5 + rand() * 15,
                type: rand() > 0.5 ? 'bone' : 'rock'
            }))
        };
        state.layers.push(layer);
        if (state.layers.length > 20) state.layers.shift();
        
        if (readout) readout.textContent = `depth: ${state.depth} spans`;
        draw();
    }

    function draw() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, w, h);

        for (const l of state.layers) {
            ctx.fillStyle = l.color;
            ctx.fillRect(0, l.y, w, 20);
            
            for (const s of l.shapes) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                if (s.type === 'bone') {
                    ctx.fillRect(s.x, l.y + 5, s.r * 2, 5);
                } else {
                    ctx.beginPath();
                    ctx.arc(s.x, l.y + 10, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    btnDig?.addEventListener('click', dig);
    btnReset?.addEventListener('click', () => {
        state.layers = [];
        state.depth = 0;
        if (readout) readout.textContent = 'depth: 0';
        draw();
    });

    resize();
    window.addEventListener('resize', () => { resize(); draw(); });
    draw();
}



