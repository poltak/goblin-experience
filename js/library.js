import { BUILD, safeParse, formatAgo } from './utils.js';

const LAST_READ_KEY = 'vort_last_read_v1';
const FORTUNE_KEY = 'vort_fortune_v1';

const fortunes = [
    'If the API says "429", offer it water and come back later with a smaller mouthful.',
    'A cache is just a pantry. Label your jars or eat dust.',
    'When humans say "quick fix", hide your knives.',
    'The scroll you keep is the scroll you become.',
    'Two commits ahead is confidence. Twenty commits ahead is an accident waiting to hatch.',
    'If you can’t ship it, don’t polish it. Ship it, then polish the dents.',
    'Travel is latency with snacks.',
    'A good interface whispers. A bad interface screams. A goblin interface cackles politely.',
    'You do not need more features. You need one feature that behaves.',
    'When the road is bumpy, clench less. Same for your code.',
    'If the bug only happens “sometimes”, congratulations: you found time.',
    'Never argue with a timestamp. It will outlive you.',
    'A backup is a love letter to your future self. Write it before the fire.',
    'If your plan requires perfect humans, it is not a plan.',
    'Ship small. Regret small. Repeat.',
    'A commit message is a spell. Don’t mumble.',
    'The UI that needs a tutorial is confessing.',
    'If you can’t reproduce it, you’re not done. You’re just tired.',
    'Every “temporary workaround” is a pet you will feed for years.',
    'Let the function be boring. Let the art be sharp.',
    'If you name it well, half the debugging evaporates.',
    'Latency is a tax. Pay it once, not on every click.',
    'If you measure nothing, you will optimize vibes.',
    'The user is not wrong. Your interface is underexplained.',
    'A list without an index is a cave without a torch.',
    'When in doubt, remove a feature and see what screams.',
    'You can’t “just” add auth. Auth is a whole religion.',
    'Don’t add a button to hide a problem. Fix the problem.',
    'The most dangerous code is the code you’re proud of.',
    'If it’s not linked, it doesn’t exist.',
    'One good default beats ten toggles.',
    'Beware the demo that only works on your machine. It is lying.',
    'If the page is blank, check the console before you check your soul.',
    'A goblin’s favorite performance metric: less panic per deploy.',
    'When the tests pass but the vibe fails, trust the vibe.',
    'Old logs are fossils. Read them. They remember your crimes.',
    'If the fix is copy-paste, the bug is breeding.',
    'Make it obvious. Make it sturdy. Make it ship.',
    'The best feature is the one you delete and nobody notices.',
    'When the road is bumpy, sit back. When the code is bumpy, simplify.',
    'A keyboard shortcut is a secret handshake for power users.',
    'The cache giveth; the cache gaslighteth.',
    'If it hurts to change, you’ve built a shrine, not a system.'
];

export function getLastRead() {
    return safeParse(localStorage.getItem(LAST_READ_KEY), null);
}

export function setLastRead(obj) {
    try { localStorage.setItem(LAST_READ_KEY, JSON.stringify(obj)); } catch (_) {}
}

export function clearLastRead() {
    try { localStorage.removeItem(LAST_READ_KEY); } catch (_) {}
}

export function renderContinueReading() {
    const box = document.getElementById('continue-box');
    if (!box) return;

    const empty = document.getElementById('continue-empty');
    const content = document.getElementById('continue-content');
    const link = document.getElementById('continue-link');
    const meta = document.getElementById('continue-meta');
    const btnForget = document.getElementById('btn-forget-last');

    const last = getLastRead();
    if (!last || !last.entry) {
        if (empty) empty.style.display = 'inline';
        if (content) content.style.display = 'none';
        if (btnForget) btnForget.style.display = 'none';
        return;
    }

    if (btnForget) {
        btnForget.onclick = () => {
            clearLastRead();
            renderContinueReading();
            markLastReadInList(null);
        };
        btnForget.style.display = 'inline-block';
    }

    if (empty) empty.style.display = 'none';
    if (content) content.style.display = 'inline';

    const entryFile = (last.entry || '').replace(/^entries\//, '');
    const href = `?entry=entries/${entryFile}`;
    if (link) {
        link.href = href;
        link.textContent = last.title || last.entry;
    }

    const bits = [];
    if (last.date) bits.push(last.date);
    if (last.scrollY != null) bits.push(`scroll: ${Math.max(0, Math.floor(last.scrollY))}px`);
    if (last.ts) bits.push(formatAgo(last.ts));
    if (meta) meta.textContent = bits.length ? ` — ${bits.join(' · ')}` : '';

    markLastReadInList(entryFile);
}

export function markLastReadInList(entryFile) {
    const items = Array.from(document.querySelectorAll('.chronicle-item'));
    for (const item of items) {
        const prev = item.querySelector('.last-read-badge');
        if (prev) prev.remove();

        if (!entryFile) continue;
        const a = item.querySelector('a[href*="?entry="]');
        if (!a) continue;
        const href = a.getAttribute('href') || '';
        if (href.includes(entryFile)) {
            const b = document.createElement('span');
            b.className = 'last-read-badge';
            b.textContent = 'last read';
            item.appendChild(b);
        }
    }
}

export function initChronicleTools() {
    const filter = document.getElementById('chronicle-filter');
    const btnEn = document.getElementById('btn-random-en');
    const btnVn = document.getElementById('btn-random-vn');
    if (!filter || !btnEn || !btnVn) return;

    const enLinks = Array.from(document.querySelectorAll('#chronicles-en a[href^="?entry="]'));
    const vnLinks = Array.from(document.querySelectorAll('#chronicles-vn a[href^="?entry="]'));
    const allItems = Array.from(document.querySelectorAll('.chronicles .chronicle-item'));

    renderContinueReading();

    const fortuneEmpty = document.getElementById('fortune-empty');
    const fortuneContent = document.getElementById('fortune-content');
    const fortuneText = document.getElementById('fortune-text');
    const btnFortune = document.getElementById('btn-fortune');
    const btnFortuneCopy = document.getElementById('btn-fortune-copy');

    function getFortune() {
        return safeParse(localStorage.getItem(FORTUNE_KEY), null);
    }
    function setFortune(text) {
        const payload = { text, ts: Date.now() };
        localStorage.setItem(FORTUNE_KEY, JSON.stringify(payload));
        renderFortune();
    }
    function renderFortune() {
        const cur = getFortune();
        if (!fortuneEmpty || !fortuneContent || !fortuneText) return;
        if (!cur || !cur.text) {
            fortuneEmpty.style.display = '';
            fortuneContent.style.display = 'none';
            return;
        }
        fortuneText.textContent = ' ' + cur.text;
        fortuneEmpty.style.display = 'none';
        fortuneContent.style.display = '';
    }
    function summonFortune() {
        const pick = fortunes[Math.floor(Math.random() * fortunes.length)];
        setFortune(pick);
    }

    renderFortune();
    btnFortune?.addEventListener('click', summonFortune);
    btnFortuneCopy?.addEventListener('click', async () => {
        const cur = getFortune();
        const text = cur?.text || '';
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            const prev = btnFortuneCopy.textContent;
            btnFortuneCopy.textContent = 'Copied';
            setTimeout(() => (btnFortuneCopy.textContent = prev), 1000);
        } catch (e) {
            window.prompt('Copy this fortune:', text);
        }
    });

    const btnCopyLink = document.getElementById('btn-copy-link');
    btnCopyLink?.addEventListener('click', async () => {
        try {
            const url = btnCopyLink.dataset.url || window.location.href;
            await navigator.clipboard.writeText(url);
            const prev = btnCopyLink.textContent;
            btnCopyLink.textContent = 'Copied';
            setTimeout(() => (btnCopyLink.textContent = prev), 1000);
        } catch (e) {
            const url = btnCopyLink.dataset.url || window.location.href;
            window.prompt('Copy this link:', url);
        }
    });

    function goRandom(links) {
        if (!links.length) return;
        const pick = links[Math.floor(Math.random() * links.length)];
        const href = pick.getAttribute('href');
        if (href) window.location.href = href;
    }

    btnEn.addEventListener('click', () => goRandom(enLinks));
    btnVn.addEventListener('click', () => goRandom(vnLinks));

    function applyFilter() {
        const q = (filter.value || '').trim().toLowerCase();
        for (const item of allItems) {
            const t = (item.textContent || '').toLowerCase();
            item.style.display = (!q || t.includes(q)) ? '' : 'none';
        }
    }

    filter.addEventListener('input', applyFilter);

    document.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        const typing = (tag === 'input' || tag === 'textarea');

        if (e.key === 'Escape') {
            if (filter.value) {
                filter.value = '';
                applyFilter();
                filter.blur();
                e.preventDefault();
            }
            return;
        }

        if (typing) return;

        if (e.key === 'r' || e.key === 'R') goRandom(enLinks);
        if (e.key === 'v' || e.key === 'V') goRandom(vnLinks);
        if (e.key === 'f' || e.key === 'F') summonFortune();
    });
}

export async function loadEntry() {
    const urlParams = new URLSearchParams(window.location.search);
    const entry = urlParams.get('entry');

    if (entry) {
        const normalizeEntryFile = (s) => (s || '').replace(/^entries\//, '');
        let safeEntry = entry.replace(/[^a-zA-Z0-9.\/_-]/g, '');
        safeEntry = safeEntry.replace(/\.{2,}/g, '.');
        safeEntry = normalizeEntryFile(safeEntry);

        const path = 'entries/' + safeEntry;

        document.getElementById('main-ui').style.display = 'none';
        document.getElementById('entry-ui').style.display = 'block';
        const contentDiv = document.getElementById('markdown-content');

        try {
            const response = await fetch(path + '?v=' + BUILD);
            if (!response.ok) throw new Error('File not found');
            const text = await response.text();
            contentDiv.innerHTML = marked.parse(text);

            const heading = contentDiv.querySelector('h1, h2, h3');
            const title = heading ? (heading.textContent || '').trim() : '';
            const date = /^\d{4}-\d{2}-\d{2}/.test(safeEntry) ? safeEntry.slice(0, 10) : '';

            try {
                const innerText = (contentDiv.textContent || '').replace(/\s+/g, ' ').trim();
                const words = innerText ? innerText.split(' ').length : 0;
                const mins = Math.max(1, Math.round(words / 200));
                const rt = document.getElementById('reading-time');
                if (rt) rt.textContent = `~${mins} min`;
            } catch (_) {}

            try {
                const canonical = `${window.location.origin}${window.location.pathname}?entry=entries/${safeEntry}`;
                const btnCopy = document.getElementById('btn-copy-link');
                if (btnCopy) btnCopy.dataset.url = canonical;
                window.history.replaceState({}, '', `?entry=entries/${safeEntry}`);
            } catch (_) {}

            const prior = getLastRead();
            const resumeY = (prior && prior.entry === safeEntry && typeof prior.scrollY === 'number') ? prior.scrollY : 0;

            setLastRead({
                entry: safeEntry,
                title: title || prior?.title || safeEntry,
                date: date || prior?.date || '',
                ts: Date.now(),
                scrollY: resumeY
            });

            requestAnimationFrame(() => {
                if (resumeY > 0) window.scrollTo(0, resumeY);
            });

            let tmr = null;
            window.addEventListener('scroll', () => {
                if (tmr) return;
                tmr = setTimeout(() => {
                    tmr = null;
                    const cur = getLastRead();
                    if (!cur || cur.entry !== safeEntry) return;
                    setLastRead({ ...cur, scrollY: window.scrollY, ts: Date.now() });
                }, 250);
            }, { passive: true });
        } catch (err) {
            contentDiv.innerHTML = '<p style="color: red;">Error: Could not scavenge this chronicle entry.</p>';
            console.error(err);
        }
    }
}
