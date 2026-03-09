import { BUILD, dateSeedUTC, mulberry32, fnv1a, clamp } from './utils.js';

export function initSparkMothWall() {
    const canvas = document.getElementById('moth-canvas');
    if (!canvas) return;
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

    if (trailsToggle) trailsToggle.checked = state.trails;

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

        if (readout) readout.textContent = `seed: ${state.seed.toString(16)}`;
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

        const lx = state.hasMouse ? state.mx : cx;
        const ly = state.hasMouse ? state.my : cy;

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

                const ox = p.x - cx;
                const oy = p.y - cy;
                const swirl = 0.0009;

                p.vx += (dx / dist) * pull + (-oy) * swirl;
                p.vy += (dy / dist) * pull + ( ox) * swirl;

                const n = Math.sin((state.t + p.phase) * 0.02);
                p.vx += n * 0.03;
                p.vy += Math.cos((state.t + p.phase) * 0.021) * 0.03;

                p.vx *= 0.92;
                p.vy *= 0.92;

                p.x += p.vx;
                p.y += p.vy;

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
        return { x: ev.clientX - r.left, y: ev.clientY - r.top };
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

    btnReseed?.addEventListener('click', () => reseed());
    btnFreeze?.addEventListener('click', () => {
        state.frozen = !state.frozen;
        btnFreeze.textContent = state.frozen ? 'Unfreeze' : 'Freeze';
    });

    trailsToggle?.addEventListener('change', () => {
        state.trails = trailsToggle.checked;
        savePrefs();
    });

    resize();
    window.addEventListener('resize', () => { resize(); reseed(state.seed); });
    reseed(state.seed);
    requestAnimationFrame(step);
}

export function initRuneDrift() {
    const canvas = document.getElementById('rune-canvas');
    if (!canvas) return;
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

        if (readout) readout.textContent = `chant: ${real.slice(0, 22)}${real.length > 22 ? '…' : ''}`;
        try { localStorage.setItem(storeKey, real); } catch (_) {}

        const rand = mulberry32(state.seed);
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;

        state.stream = Array.from({ length: 140 }, (_, i) => {
            const x = rand() * w;
            const y = rand() * h;
            const g = glyphs[Math.floor(rand() * glyphs.length)];
            return {
                x, y,
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

            if (r.y > h + 24) r.y = -24;
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
    btnJolt?.addEventListener('click', () => { state.jolt = Math.min(8, state.jolt + 4); });
    btnWipe?.addEventListener('click', () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    const castFromInput = () => cast(input.value);
    btnCast?.addEventListener('click', castFromInput);
    input?.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') castFromInput(); });

    resize();
    window.addEventListener('resize', () => { resize(); cast(input.value); });

    let saved = '';
    try { saved = localStorage.getItem(storeKey) || ''; } catch (_) {}
    if (input) input.value = saved;
    cast(saved);
    requestAnimationFrame(step);
}

export function initSigilScriber() {
    const canvas = document.getElementById('sigil-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const btnClear = document.getElementById('btn-sigil-clear');
    const btnSave = document.getElementById('btn-sigil-save');
    const toggleGlow = document.getElementById('toggle-sigil-glow');
    const readout = document.getElementById('sigil-readout');

    const storeKey = 'vort_sigil_v1';
    const state = { drawing: false, last: null, glow: true, strokes: 0 };

    try {
        const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
        if (saved && typeof saved.glow === 'boolean') state.glow = saved.glow;
    } catch (_) {}
    if (toggleGlow) toggleGlow.checked = state.glow;

    function resize() {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function wipe(forget=false) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        state.strokes = 0;
        if (readout) readout.textContent = forget ? 'ink: wiped' : 'ink: rinsed';
        if (forget) try { localStorage.removeItem(storeKey + ':img'); } catch (_) {}
    }

    function restoreImage() {
        let data = null;
        try { data = localStorage.getItem(storeKey + ':img'); } catch (_) {}
        if (!data) return;
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        };
        img.src = data;
    }

    function canvasPoint(ev) {
        const r = canvas.getBoundingClientRect();
        return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    canvas.addEventListener('pointerdown', (ev) => {
        canvas.setPointerCapture(ev.pointerId);
        state.drawing = true;
        state.last = canvasPoint(ev);
    });
    canvas.addEventListener('pointermove', (ev) => {
        if (!state.drawing) return;
        const p = canvasPoint(ev);
        const last = state.last || p;
        const color = getComputedStyle(document.documentElement).getPropertyValue('--goblin').trim() || '#00ff41';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.2;
        if (state.glow) { ctx.shadowBlur = 12; ctx.shadowColor = color; }
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.shadowBlur = 0;
        state.last = p;
        state.strokes++;
    });
    canvas.addEventListener('pointerup', () => {
        state.drawing = false;
        try { localStorage.setItem(storeKey + ':img', canvas.toDataURL('image/png')); } catch (_) {}
    });
    canvas.addEventListener('dblclick', (ev) => {
        const p = canvasPoint(ev);
        const color = getComputedStyle(document.documentElement).getPropertyValue('--goblin').trim() || '#00ff41';
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    });

    btnClear?.addEventListener('click', () => wipe(true));
    btnSave?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = `vort-sigil-${BUILD}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    });
    toggleGlow?.addEventListener('change', () => {
        state.glow = toggleGlow.checked;
        try { localStorage.setItem(storeKey, JSON.stringify({ glow: state.glow })); } catch (_) {}
    });

    resize();
    restoreImage();
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
    const state = { seed: (dateSeedUTC() ^ 0x1a2b3c4d) >>> 0, sym: true };

    try {
        const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
        if (saved && typeof saved.seed === 'number') state.seed = saved.seed >>> 0;
        if (saved && typeof saved.sym === 'boolean') state.sym = saved.sym;
    } catch (_) {}
    if (toggleSym) toggleSym.checked = state.sym;

    function render() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width; canvas.height = rect.height;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const rand = mulberry32(state.seed);
        const drops = 18 + Math.floor(rand() * 22);
        for (let d = 0; d < drops; d++) {
            let x = (canvas.width * 0.5) + (rand() - 0.5) * (canvas.width * 0.18);
            let y = 12 + rand() * (canvas.height * 0.25);
            let vx = (rand() - 0.5) * 1.8, vy = 0.6 + rand() * 1.2;
            for (let i = 0; i < 200; i++) {
                vx += (rand() - 0.5) * 0.22; vy += (rand() - 0.5) * 0.18;
                vx *= 0.92; vy = clamp(vy * 0.98 + 0.04, 0.2, 2.4);
                x += vx; y += vy;
                if (y > canvas.height - 6) break;
                const r = 2.2 + (1 - i/200) * (2.5 + rand() * 2.8);
                ctx.fillStyle = `hsla(${92+rand()*30}, 100%, 56%, ${0.08+(1-i/200)*0.28})`;
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
                if (state.sym) {
                    const mx = canvas.width - x;
                    ctx.beginPath(); ctx.arc(mx, y, r, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
        if (readout) readout.textContent = `blot: seed ${state.seed.toString(16)}`;
        try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (_) {}
    }

    btn?.addEventListener('click', () => { state.seed = (state.seed + 0x9E3779B9) >>> 0; render(); });
    btnSave?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = `vort-inkblot-${BUILD}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
    });
    toggleSym?.addEventListener('change', () => { state.sym = toggleSym.checked; render(); });
    render();
}

export function initCaveDrone() {
    const canvas = document.getElementById('audio-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const btn = document.getElementById('btn-audio-toggle');
    const pitch = document.getElementById('audio-pitch');
    const drift = document.getElementById('audio-drift');
    const grit = document.getElementById('audio-grit');
    const readout = document.getElementById('audio-readout');

    const state = { on: false, ac: null, gain: null, analyser: null, data: null };

    function ensureAudio() {
        if (state.ac) return;
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        state.ac = ac;
        const oscA = ac.createOscillator(); oscA.type = 'sine';
        const gain = ac.createGain(); gain.gain.value = 0;
        const analyser = ac.createAnalyser(); analyser.fftSize = 1024;
        oscA.connect(gain); gain.connect(analyser); analyser.connect(ac.destination);
        oscA.start();
        state.gain = gain; state.analyser = analyser; state.data = new Uint8Array(analyser.frequencyBinCount);
    }

    btn?.addEventListener('click', () => {
        ensureAudio();
        state.on = !state.on;
        state.gain.gain.setTargetAtTime(state.on ? 0.2 : 0, state.ac.currentTime, 0.1);
        if (btn) btn.textContent = state.on ? 'Sleep' : 'Awaken';
    });

    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (state.analyser) {
            state.analyser.getByteFrequencyData(state.data);
            ctx.strokeStyle = '#00ff41'; ctx.beginPath();
            for (let i = 0; i < state.data.length; i++) {
                const x = (i / state.data.length) * canvas.width;
                const y = canvas.height - (state.data[i] / 255) * canvas.height;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        requestAnimationFrame(draw);
    }
    draw();
}

export function initLichenBloom() {
    const canvas = document.getElementById('lichen-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const btnSeed = document.getElementById('btn-lichen-seed');
    const readout = document.getElementById('lichen-readout');

    let cols, rows, cell = 6, a;
    function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width; canvas.height = rect.height;
        cols = Math.floor(canvas.width / cell); rows = Math.floor(canvas.height / cell);
        a = new Uint8Array(cols * rows);
    }
    function seed() {
        a.fill(0);
        for (let i = 0; i < 200; i++) a[Math.floor(Math.random() * a.length)] = 1;
    }
    function step() {
        const next = new Uint8Array(cols * rows);
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                let neighbors = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        neighbors += a[(y + dy) * cols + (x + dx)];
                    }
                }
                const i = y * cols + x;
                if (a[i]) next[i] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                else next[i] = (neighbors === 3) ? 1 : 0;
            }
        }
        a = next;
    }
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        for (let i = 0; i < a.length; i++) {
            if (a[i]) ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, cell, cell);
        }
        step();
        requestAnimationFrame(draw);
    }
    resize(); seed(); draw();
}

export function initCaveConstellations() {
    const canvas = document.getElementById('constellation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const btnSprout = document.getElementById('btn-constellation-sprout');

    let stars = [];
    function sprout() {
        stars = Array.from({ length: 40 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height }));
    }
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41'; ctx.strokeStyle = 'rgba(0,255,65,0.2)';
        stars.forEach(s => {
            ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2); ctx.fill();
            stars.forEach(o => {
                const d = Math.hypot(s.x - o.x, s.y - o.y);
                if (d < 100) { ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(o.x, o.y); ctx.stroke(); }
            });
        });
        requestAnimationFrame(draw);
    }
    sprout(); draw();
    btnSprout?.addEventListener('click', sprout);
}

export function initGeodeGrower() {
    const canvas = document.getElementById('geode-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#8a2be2';
        for(let i=0; i<10; i++) ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 10, 10);
        requestAnimationFrame(draw);
    }
    draw();
}

export function initEchoTopography() {
    const canvas = document.getElementById('topo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff41'; ctx.beginPath();
        for(let i=0; i<canvas.width; i+=20) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        ctx.stroke();
        requestAnimationFrame(draw);
    }
    draw();
}

export function initNeedleOfNoise() {
    const canvas = document.getElementById('compass-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff41'; ctx.save(); ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(Date.now() * 0.001); ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, 50); ctx.stroke();
        ctx.restore(); requestAnimationFrame(draw);
    }
    draw();
}

export function initSporeGarden() {
    const canvas = document.getElementById('spore-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        for(let i=0; i<20; i++) ctx.beginPath(); ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 2, 0, Math.PI*2); ctx.fill();
        requestAnimationFrame(draw);
    }
    draw();
}
