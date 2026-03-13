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
