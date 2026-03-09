import { clamp } from './utils.js';

export function initAtmospherics() {
    const key = 'vort_atmo_v1';
    const scan = document.getElementById('atmo-scan');
    const flick = document.getElementById('atmo-flicker');
    const reset = document.getElementById('atmo-reset');
    const readout = document.getElementById('atmo-readout');

    if (!scan || !flick || !reset || !readout) return;

    const defaults = { scan: 12, flicker: 22 };

    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(key) || 'null');
            if (saved && typeof saved.scan === 'number') scan.value = String(clamp(saved.scan, 0, 30));
            if (saved && typeof saved.flicker === 'number') flick.value = String(clamp(saved.flicker, 0, 40));
        } catch (_) {}
    }

    function save() {
        try {
            localStorage.setItem(key, JSON.stringify({
                scan: Number(scan.value),
                flicker: Number(flick.value)
            }));
        } catch (_) {}
    }

    function apply() {
        const scanV = clamp(Number(scan.value), 0, 30);
        const flickV = clamp(Number(flick.value), 0, 40);

        const scanOpacity = (scanV / 30) * 0.22;
        const flickerSeconds = 8 - (flickV / 40) * 6.8;

        document.documentElement.style.setProperty('--scanOpacity', scanOpacity.toFixed(3));
        document.documentElement.style.setProperty('--flickerSeconds', flickerSeconds.toFixed(2));

        readout.textContent = `atmo: scan ${scanV}/30 · flicker ${flickV}/40`;
    }

    scan.addEventListener('input', () => { apply(); save(); });
    flick.addEventListener('input', () => { apply(); save(); });
    reset.addEventListener('click', () => {
        scan.value = String(defaults.scan);
        flick.value = String(defaults.flicker);
        apply();
        save();
    });

    load();
    apply();
}

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

    modal.addEventListener('click', (ev) => {
        if (ev.target === modal) close();
    });

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
            open();
            setTimeout(transmute, 0);
        }
    });
}
