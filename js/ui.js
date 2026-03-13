import { pickByDay } from './utils.js';

export function initGoblinFace() {
    const face = document.getElementById('goblin-face');
    if (!face) return;
    face.addEventListener('click', () => {
        const lines = [
            'HSSSS. (affectionate)',
            'Stop poking the UI. I\'m busy being art.',
            'If you click me again, I\'ll add more CSS.',
            'Nice. You found the goblin\'s big red button.'
        ];
        const msg = pickByDay(lines);
        face.title = msg;
        if (navigator.vibrate) navigator.vibrate(20);
    });
}

export function initNavigation(onViewChange) {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');

    function showView(viewId) {
        sections.forEach(s => s.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));

        const target = document.getElementById(`view-${viewId}`);
        const link = document.querySelector(`.nav-link[data-view="${viewId}"]`);

        if (target && link) {
            target.classList.add('active');
            link.classList.add('active');
            window.location.hash = viewId;
            if (onViewChange) onViewChange(viewId);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            showView(link.dataset.view);
        });
    });

    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
        showView(hash);
    }

    const entry = new URLSearchParams(window.location.search).get('entry');
    if (entry) {
        showView('library');
    }

    return { showView };
}

export function initThemeSwitchboard() {
    const key = 'vort_theme_v1';
    const readout = document.getElementById('theme-readout');

    const themes = {
        dank: {
            name: 'Dank',
            vars: {
                '--bg': '#0f1210',
                '--fg': '#d4d4d4',
                '--goblin': '#00ff41',
                '--shadow': '#000',
                '--panel': '#1b1f1c',
                '--panel2': '#0a0d0b'
            }
        },
        moss: {
            name: 'Moss',
            vars: {
                '--bg': '#07110b',
                '--fg': '#dbffe8',
                '--goblin': '#5dff7e',
                '--shadow': '#000',
                '--panel': '#062214',
                '--panel2': '#03140b'
            }
        },
        ash: {
            name: 'Ash',
            vars: {
                '--bg': '#141414',
                '--fg': '#e6e6e6',
                '--goblin': '#b7ffce',
                '--shadow': '#000',
                '--panel': '#1a1a1a',
                '--panel2': '#101010'
            }
        }
    };

    function applyTheme(id) {
        const t = themes[id] || themes.dank;
        for (const [k, v] of Object.entries(t.vars)) {
            document.documentElement.style.setProperty(k, v);
        }
        if (readout) readout.textContent = `theme: ${t.name.toLowerCase()}`;
        try { localStorage.setItem(key, id); } catch (_) {}
    }

    let saved = 'dank';
    try { saved = localStorage.getItem(key) || saved; } catch (_) {}
    applyTheme(saved);

    document.getElementById('theme-dank')?.addEventListener('click', () => applyTheme('dank'));
    document.getElementById('theme-moss')?.addEventListener('click', () => applyTheme('moss'));
    document.getElementById('theme-ash')?.addEventListener('click', () => applyTheme('ash'));
}
