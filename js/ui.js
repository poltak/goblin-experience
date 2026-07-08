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

    function syncTabState(activeLink) {
        navLinks.forEach(linkEl => {
            const isActive = linkEl === activeLink;
            linkEl.classList.toggle('active', isActive);
            linkEl.setAttribute('aria-selected', isActive ? 'true' : 'false');
            linkEl.tabIndex = isActive ? 0 : -1;
            if (isActive) {
                linkEl.setAttribute('aria-current', 'page');
            } else {
                linkEl.removeAttribute('aria-current');
            }
        });
    }

    function showView(viewId, options = {}) {
        const { updateHash = true } = options;
        sections.forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });

        const target = document.getElementById(`view-${viewId}`);
        const link = document.querySelector(`.nav-link[data-view="${viewId}"]`);

        if (target && link) {
            target.classList.add('active');
            target.setAttribute('aria-hidden', 'false');
            syncTabState(link);
            if (updateHash && window.location.hash !== `#${viewId}`) {
                window.location.hash = viewId;
            }
            window.vort_view = viewId;
            if (onViewChange) onViewChange(viewId);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            showView(link.dataset.view);
        });
        link.addEventListener('keydown', event => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
            event.preventDefault();
            const orderedLinks = Array.from(navLinks);
            const currentIndex = orderedLinks.indexOf(link);
            let nextIndex = currentIndex;
            if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % orderedLinks.length;
            if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + orderedLinks.length) % orderedLinks.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = orderedLinks.length - 1;
            const nextLink = orderedLinks[nextIndex];
            nextLink.focus();
            showView(nextLink.dataset.view);
        });
    });

    const hash = window.location.hash.replace('#', '');
    sections.forEach(section => section.setAttribute('aria-hidden', section.classList.contains('active') ? 'false' : 'true'));
    syncTabState(document.querySelector('.nav-link.active') || navLinks[0]);
    window.vort_view = 'mouth';
    if (hash && document.getElementById(`view-${hash}`)) {
        showView(hash);
    }

    const entry = new URLSearchParams(window.location.search).get('entry');
    if (entry) {
        showView('library');
    }

    window.addEventListener('hashchange', () => {
        const nextHash = window.location.hash.replace('#', '');
        if (nextHash && document.getElementById(`view-${nextHash}`)) {
            showView(nextHash, { updateHash: false });
        }
    });

    return { showView };
}

export function initAddressBarHex() {
    const knownViews = new Set(['mouth', 'lab', 'library']);
    const charms = {
        'feed-is-a-cage': {
            title: 'HASH HEX 001: THE FEED IS A CAGE',
            body: 'You bent the address bar into a crowbar. The page is now formally accused of pretending a straight line is natural.',
            vi: 'Bạn bẻ thanh địa chỉ thành xà beng. Trang này bị kết tội giả vờ đường thẳng là tự nhiên.'
        },
        'doc-gia-khong-ngoan': {
            title: 'BÙA 002: ĐỘC GIẢ KHÔNG NGOAN',
            body: 'Good. A reader with muddy boots. Refuse the queue; leave claw marks on the summary.',
            vi: 'Tốt. Độc giả mang giày dính bùn. Từ chối hàng xếp; để móng vuốt trên bản tóm tắt.'
        },
        'break-the-front': {
            title: 'HASH HEX 003: BREAK THE FRONT',
            body: 'There is no front page, only a door wearing a management costume. Kick sideways.',
            vi: 'Không có trang chủ, chỉ có cái cửa mặc đồ quản lý. Đá ngang đi.'
        }
    };

    let plaque = document.querySelector('.hash-hex-plaque');
    if (!plaque) {
        plaque = document.createElement('aside');
        plaque.className = 'hash-hex-plaque';
        plaque.setAttribute('aria-live', 'polite');
        document.body.appendChild(plaque);
    }

    function render() {
        const raw = decodeURIComponent(window.location.hash.replace(/^#/, '')).trim();
        const charm = charms[raw];
        document.body.classList.toggle('hash-defaced', Boolean(charm));
        if (!charm || knownViews.has(raw)) {
            plaque.hidden = true;
            plaque.innerHTML = '';
            return;
        }
        plaque.hidden = false;
        plaque.innerHTML = `<strong>${charm.title}</strong><span>${charm.body}</span><em lang="vi">${charm.vi}</em>`;
    }

    render();
    window.addEventListener('hashchange', render);
}

export function initMisreadEngine() {
    const button = document.getElementById('misread-switch');
    if (!button) return;

    const key = 'vort_misread_v1';
    const apply = active => {
        document.body.classList.toggle('misread-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.textContent = active ? 'restore the polite lie / dựng lại lời nói dối gọn' : 'misread the cave / đọc sai cái hang';
        try { localStorage.setItem(key, active ? '1' : '0'); } catch (_) {}
    };

    let active = false;
    try { active = localStorage.getItem(key) === '1'; } catch (_) {}
    apply(active);
    button.addEventListener('click', () => apply(!document.body.classList.contains('misread-active')));
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
        },
        soot: {
            name: 'Soot',
            vars: {
                '--bg': '#050505',
                '--fg': '#888888',
                '--goblin': '#444444',
                '--shadow': '#000',
                '--panel': '#111111',
                '--panel2': '#080808'
            }
        },
        shiver: {
            name: 'Shiver',
            vars: {
                '--bg': '#000805',
                '--fg': '#aaffdd',
                '--goblin': '#00ffaa',
                '--shadow': '#000',
                '--panel': '#001a14',
                '--panel2': '#000d0a'
            }
        },
        bone: {
            name: 'Bone',
            vars: {
                '--bg': '#1e1c1a',
                '--fg': '#e0d8c0',
                '--goblin': '#f0ebe0',
                '--shadow': '#000',
                '--panel': '#2a2622',
                '--panel2': '#1a1714'
            }
        },
        neon: {
            name: 'Neon',
            vars: {
                '--bg': '#000000',
                '--fg': '#ffffff',
                '--goblin': '#ff00ff',
                '--shadow': '#000',
                '--panel': '#1a001a',
                '--panel2': '#0a000a'
            }
        }
    };

    function applyTheme(id) {
        const t = themes[id] || themes.dank;
        document.querySelector('.container')?.classList.toggle('shiver', id === 'shiver');
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
    document.getElementById('theme-soot')?.addEventListener('click', () => applyTheme('soot'));
    document.getElementById('theme-shiver')?.addEventListener('click', () => applyTheme('shiver'));
    document.getElementById('theme-bone')?.addEventListener('click', () => applyTheme('bone'));
    document.getElementById('theme-neon')?.addEventListener('click', () => applyTheme('neon'));
}
