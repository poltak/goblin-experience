import { clamp } from './utils.js';
export function initGoblinWhisperStone() {
const modal = document.getElementById('goblin-modal');
const toast = document.getElementById('goblin-toast');
const input = document.getElementById('goblin-input');
const output = document.getElementById('goblin-output');
const btnGo = document.getElementById('btn-goblinify');
const btnCopy = document.getElementById('btn-goblin-copy');
const btnClose = document.getElementById('btn-goblin-close');
const readout = document.getElementById('goblin-readout');

if (!modal || !input || !output || !btnGo || !btnClose) return;

// lightweight styling so it's usable even if CSS got eaten.
try {
if (!document.getElementById('goblin-modal-style')) {
const s = document.createElement('style');
s.id = 'goblin-modal-style';
s.textContent = `
.goblin-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.72);z-index:9999;padding:14px;}
.goblin-modal[aria-hidden="false"]{display:flex;}
.goblin-modal-card{max-width:900px;width:100%;background:#0b0f0c;border:1px solid #00ff41;box-shadow:0 0 0 1px #00ff4120 inset;padding:14px;}
.goblin-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media(max-width:760px){.goblin-modal-grid{grid-template-columns:1fr;}}
#goblin-input{width:100%;min-height:120px;background:#000;color:#00ff41;border:1px dashed #00ff4188;padding:8px;font-family:inherit;}
.goblin-output{min-height:120px;background:#000;border:1px dashed #00ff4188;padding:8px;color:#d4d4d4;white-space:pre-wrap;}
.goblin-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#001900;border:1px solid #00ff41;color:#9cffb0;padding:6px 10px;display:none;z-index:10000;}
.goblin-toast[aria-hidden="false"]{display:block;}
`;
document.head.appendChild(s);
}
} catch (_) {}

function showToast(msg) {
if (!toast) return;
toast.textContent = msg;
toast.setAttribute('aria-hidden', 'false');
setTimeout(() => toast.setAttribute('aria-hidden', 'true'), 1200);
}

function open() {
modal.setAttribute('aria-hidden', 'false');
if (readout) readout.textContent = 'stone: listening';
setTimeout(() => input.focus(), 0);
}

function close() {
modal.setAttribute('aria-hidden', 'true');
if (readout) readout.textContent = 'stone: dormant';
}

function goblinify(text) {
const t = (text || '').trim();
if (!t) return '(the stone demands an offering)';

const lower = t.toLowerCase();
if (lower.includes('snack')) {
return 'SNACK detected. The stone is pleased. Proceed, human.';
}

const swaps = [
[/please/gi, 'beg'],
[/deploy/gi, 'unleash'],
[/bug/gi, 'cave-beetle'],
[/server/gi, 'surface shrine'],
[/auth/gi, 'identity ritual'],
[/quick/gi, 'reckless'],
[/fix/gi, 'exorcise'],
[/error/gi, 'howl'],
[/homepage/gi, 'cave mouth'],
[/article/gi, 'chronicle']
];

let out = t;
for (const [re, rep] of swaps) out = out.replace(re, rep);

// cave seasoning
out = out
.replace(/\bI\b/g, 'I (a humble goblin)')
.replace(/\bmy\b/gi, 'my damp')
.replace(/\byou\b/gi, 'you, comrade');

return `HSSS… ${out}`;
}

function transmute() {
const res = goblinify(input.value);
output.textContent = res;
if (readout) readout.textContent = 'stone: warmed';
}

btnGo.addEventListener('click', transmute);
btnClose.addEventListener('click', close);

if (btnCopy) {
btnCopy.addEventListener('click', async () => {
const text = output.textContent || '';
if (!text) return;
try {
await navigator.clipboard.writeText(text);
showToast('Copied');
} catch (_) {
window.prompt('Copy this:', text);
}
});
}

// close on backdrop click
modal.addEventListener('click', (ev) => {
if (ev.target === modal) close();
});

// global keybinds
document.addEventListener('keydown', (ev) => {
const typing = ['input','textarea'].includes((ev.target?.tagName || '').toLowerCase());

if (ev.key === 'g' || ev.key === 'G') {
if (modal.getAttribute('aria-hidden') === 'false') close();
else open();
ev.preventDefault();
return;
}

if (ev.key === 'Escape') {
if (modal.getAttribute('aria-hidden') === 'false') {
close();
ev.preventDefault();
}
return;
}

if (ev.key === 'Enter' && ev.ctrlKey && !typing) {
// allow Ctrl+Enter anywhere to open + transmute
open();
setTimeout(transmute, 0);
}
});
}
