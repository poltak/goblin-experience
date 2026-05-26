import { BUILD, safeParse, formatAgo } from './utils.js';

const LAST_READ_KEY = 'vort_last_read_v1';
const FORTUNE_KEY = 'vort_fortune_v1';
const SHELF_STATE_KEY = 'vort_shelf_state_v1';

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

function getChronicleMarkId(date, lang) {
    return date && lang ? `mark-${date}-${lang}` : '';
}

function inferChronicleMeta(item) {
    if (!item) return { date: '', lang: '' };

    const currentDate = item.dataset?.chronicleDate || '';
    const currentLang = item.dataset?.chronicleLang || '';
    if (currentDate && currentLang) {
        return { date: currentDate, lang: currentLang };
    }

    const strong = item.querySelector('strong');
    const dateText = (strong?.textContent || '').trim();
    const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
    const date = currentDate || (dateMatch ? dateMatch[1] : '');

    const anchor = item.querySelector('a[href^="?entry="]');
    const href = anchor?.getAttribute('href') || '';
    const entryMatch = href.match(/entries\/([^?#]+)/);
    const entryName = entryMatch ? entryMatch[1] : '';
    const lang = currentLang || (entryName.startsWith('con-') || entryName.includes('-con-') ? 'vn' : 'en');

    return { date, lang };
}

function hydrateChronicleMetadata(items) {
    items.forEach((item) => {
        const meta = inferChronicleMeta(item);
        if (meta.date && !item.dataset.chronicleDate) item.dataset.chronicleDate = meta.date;
        if (meta.lang && !item.dataset.chronicleLang) item.dataset.chronicleLang = meta.lang;
    });
}

function findChronicleContext(entryFile) {
    const normalized = (entryFile || '').replace(/^entries\//, '');
    if (!normalized) return null;

    const currentLink = document.querySelector(`a[href="?entry=entries/${normalized}"]`);
    const currentItem = currentLink?.closest('.chronicle-item');
    const date = currentItem?.dataset?.chronicleDate || (/^\d{4}-\d{2}-\d{2}/.test(normalized) ? normalized.slice(0, 10) : '');
    const lang = currentItem?.dataset?.chronicleLang || (/^\d{4}-\d{2}-\d{2}-con-/.test(normalized) ? 'vn' : 'en');
    if (!date || !lang || !currentItem || !currentLink) return null;

    const markId = getChronicleMarkId(date, lang);
    if (markId && !currentItem.id) currentItem.id = markId;

    return {
        normalized,
        currentItem,
        currentLink,
        date,
        lang,
        markId,
        title: (currentLink.textContent || '').trim() || normalized
    };
}

function findChronicleTwin(entryFile) {
    const context = findChronicleContext(entryFile);
    if (!context) return null;

    const { date, lang } = context;
    const twinLang = lang === 'vn' ? 'en' : 'vn';
    const twinItem = document.querySelector(`.chronicle-item[data-chronicle-date="${date}"][data-chronicle-lang="${twinLang}"]`);
    const twinLink = twinItem?.querySelector('a[href^="?entry="]');
    if (!twinItem || !twinLink) return null;

    return {
        date,
        lang,
        twinLang,
        href: twinLink.getAttribute('href') || '#',
        title: (twinLink.textContent || '').trim() || 'Twin chronicle'
    };
}

function renderTranslationBridge(entryFile) {
    const bridge = document.getElementById('translation-bridge');
    const empty = document.getElementById('translation-bridge-empty');
    const content = document.getElementById('translation-bridge-content');
    const link = document.getElementById('translation-bridge-link');
    const meta = document.getElementById('translation-bridge-meta');
    if (!bridge || !empty || !content || !link || !meta) return;

    const twin = findChronicleTwin(entryFile);
    bridge.style.display = 'block';

    if (!twin) {
        empty.style.display = 'inline';
        content.style.display = 'none';
        link.removeAttribute('href');
        link.textContent = '(loading)';
        meta.textContent = '';
        return;
    }

    empty.style.display = 'none';
    content.style.display = 'inline';
    link.href = twin.href;
    link.textContent = twin.title;
    meta.textContent = twin.twinLang === 'vn' ? ' — Vietnamese shelf twin' : ' — English shelf twin';
}

function renderShelfMarkBridge(entryFile) {
    const bridge = document.getElementById('shelf-mark-bridge');
    const empty = document.getElementById('shelf-mark-bridge-empty');
    const content = document.getElementById('shelf-mark-bridge-content');
    const link = document.getElementById('shelf-mark-bridge-link');
    const meta = document.getElementById('shelf-mark-bridge-meta');
    if (!bridge || !empty || !content || !link || !meta) return;

    const context = findChronicleContext(entryFile);
    bridge.style.display = 'block';

    if (!context) {
        empty.style.display = 'inline';
        content.style.display = 'none';
        link.removeAttribute('href');
        link.textContent = 'Return to this shelf mark';
        meta.textContent = '';
        return;
    }

    const shelfParams = new URLSearchParams();
    shelfParams.set('shelf', context.lang);
    const href = `index.html?${shelfParams.toString()}#${context.markId}`;

    empty.style.display = 'none';
    content.style.display = 'inline';
    link.href = href;
    link.textContent = 'Return to this shelf mark';
    meta.textContent = ` — ${context.lang === 'vn' ? 'Vietnamese' : 'English'} shelf · ${context.date}`;
}

function findChronicleNeighbors(entryFile) {
    const normalized = (entryFile || '').replace(/^entries\//, '');
    if (!normalized) return null;

    const currentLink = document.querySelector(`a[href="?entry=entries/${normalized}"]`);
    const currentItem = currentLink?.closest('.chronicle-item');
    if (!currentItem) return null;

    const lang = currentItem.dataset?.chronicleLang || (/^\d{4}-\d{2}-\d{2}-con-/.test(normalized) ? 'vn' : 'en');
    const shelfId = lang === 'vn' ? '#chronicles-vn' : '#chronicles-en';
    const shelfItems = Array.from(document.querySelectorAll(`${shelfId} .chronicle-item`));
    const index = shelfItems.indexOf(currentItem);
    if (index === -1) return null;

    const linkFor = (item) => {
        if (!item) return null;
        const anchor = item.querySelector('a[href^="?entry="]');
        if (!anchor) return null;
        return {
            href: anchor.getAttribute('href') || '#',
            title: (anchor.textContent || '').trim() || 'Shelf mark'
        };
    };

    return {
        lang,
        total: shelfItems.length,
        position: index + 1,
        newer: linkFor(shelfItems[index - 1] || null),
        older: linkFor(shelfItems[index + 1] || null)
    };
}

function renderChronicleTrail(entryFile) {
    const trail = document.getElementById('chronicle-trail');
    const empty = document.getElementById('chronicle-trail-empty');
    const content = document.getElementById('chronicle-trail-content');
    const older = document.getElementById('chronicle-trail-prev');
    const newer = document.getElementById('chronicle-trail-next');
    const meta = document.getElementById('chronicle-trail-meta');
    if (!trail || !empty || !content || !older || !newer || !meta) return;

    const neighbors = findChronicleNeighbors(entryFile);
    trail.style.display = 'block';

    if (!neighbors) {
        empty.style.display = 'inline';
        content.style.display = 'none';
        meta.textContent = '';
        return;
    }

    const bindTrailLink = (node, data, fallbackText) => {
        if (data?.href) {
            node.href = data.href;
            node.textContent = fallbackText;
            node.classList.remove('trail-link-disabled');
            node.removeAttribute('aria-disabled');
            node.tabIndex = 0;
        } else {
            node.removeAttribute('href');
            node.textContent = `${fallbackText} ∅`;
            node.classList.add('trail-link-disabled');
            node.setAttribute('aria-disabled', 'true');
            node.tabIndex = -1;
        }
    };

    bindTrailLink(older, neighbors.older, 'Older');
    bindTrailLink(newer, neighbors.newer, 'Newer');

    empty.style.display = 'none';
    content.style.display = 'inline';
    meta.textContent = ` — ${neighbors.lang === 'vn' ? 'Vietnamese' : 'English'} shelf, mark ${neighbors.position} of ${neighbors.total}`;
}

function findDayFooting(entryFile) {
    const context = findChronicleContext(entryFile);
    if (!context) return null;

    const items = Array.from(document.querySelectorAll(`.chronicle-item[data-chronicle-date="${context.date}"]`));
    const grouped = { en: [], vn: [], other: [] };

    items.forEach((item) => {
        const anchor = item.querySelector('a[href^="?entry="]');
        if (!anchor) return;
        const lang = item.dataset?.chronicleLang || 'other';
        const bucket = grouped[lang] || grouped.other;
        bucket.push({
            href: anchor.getAttribute('href') || '#',
            title: (anchor.textContent || '').trim() || 'Day footing scrap'
        });
    });

    const total = grouped.en.length + grouped.vn.length + grouped.other.length;
    if (!total) return null;

    return {
        date: context.date,
        lang: context.lang,
        grouped,
        total
    };
}

function renderDayFootingBridge(entryFile) {
    const bridge = document.getElementById('day-footing-bridge');
    const empty = document.getElementById('day-footing-bridge-empty');
    const content = document.getElementById('day-footing-bridge-content');
    const label = document.getElementById('day-footing-bridge-label');
    const links = document.getElementById('day-footing-bridge-links');
    const meta = document.getElementById('day-footing-bridge-meta');
    if (!bridge || !empty || !content || !label || !links || !meta) return;

    const footing = findDayFooting(entryFile);
    bridge.style.display = 'block';

    if (!footing) {
        empty.style.display = 'inline';
        content.style.display = 'none';
        links.textContent = '';
        meta.textContent = '';
        return;
    }

    const segments = [
        footing.grouped.en.length ? { label: 'EN', items: footing.grouped.en } : null,
        footing.grouped.vn.length ? { label: 'VN', items: footing.grouped.vn } : null,
        footing.grouped.other.length ? { label: 'Other', items: footing.grouped.other } : null
    ].filter(Boolean);

    empty.style.display = 'none';
    content.style.display = 'inline';
    label.textContent = `All scraps filed on ${footing.date}`;
    links.textContent = '';

    segments.forEach((segment, segmentIndex) => {
        if (segmentIndex > 0) links.append(document.createTextNode(' · '));
        const prefix = document.createElement('span');
        prefix.className = 'muted';
        prefix.textContent = `${segment.label}: `;
        links.append(prefix);

        segment.items.forEach((item, itemIndex) => {
            if (itemIndex > 0) links.append(document.createTextNode(', '));
            const anchor = document.createElement('a');
            anchor.href = item.href;
            anchor.textContent = item.title;
            links.append(anchor);
        });
    });

    meta.textContent = ` — ${footing.total} scrap${footing.total === 1 ? '' : 's'} across this date`;
}

function findSameDayChronicles(entryFile) {
    const context = findChronicleContext(entryFile);
    if (!context) return null;

    const items = Array.from(document.querySelectorAll(`.chronicle-item[data-chronicle-date="${context.date}"][data-chronicle-lang="${context.lang}"]`));
    const companions = items
        .filter(item => item !== context.currentItem)
        .map((item) => {
            const anchor = item.querySelector('a[href^="?entry="]');
            if (!anchor) return null;
            return {
                href: anchor.getAttribute('href') || '#',
                title: (anchor.textContent || '').trim() || 'Same-day chronicle'
            };
        })
        .filter(Boolean);

    return {
        date: context.date,
        lang: context.lang,
        companions
    };
}

function renderDayBundleBridge(entryFile) {
    const bridge = document.getElementById('day-bundle-bridge');
    const empty = document.getElementById('day-bundle-bridge-empty');
    const content = document.getElementById('day-bundle-bridge-content');
    const label = document.getElementById('day-bundle-bridge-label');
    const sep = document.getElementById('day-bundle-bridge-sep');
    const links = document.getElementById('day-bundle-bridge-links');
    const meta = document.getElementById('day-bundle-bridge-meta');
    if (!bridge || !empty || !content || !label || !sep || !links || !meta) return;

    const bundle = findSameDayChronicles(entryFile);
    bridge.style.display = 'block';

    if (!bundle || !bundle.companions.length) {
        empty.style.display = 'inline';
        content.style.display = 'none';
        links.textContent = '';
        meta.textContent = '';
        return;
    }

    empty.style.display = 'none';
    content.style.display = 'inline';
    label.textContent = bundle.lang === 'vn' ? 'Other Vietnamese scraps from this date' : 'Other English scraps from this date';
    sep.style.display = 'inline';
    links.textContent = '';

    bundle.companions.forEach((item, index) => {
        if (index > 0) links.append(document.createTextNode(' · '));
        const anchor = document.createElement('a');
        anchor.href = item.href;
        anchor.textContent = item.title;
        links.append(anchor);
    });

    meta.textContent = ` — ${bundle.date} · ${bundle.companions.length} neighboring scrap${bundle.companions.length === 1 ? '' : 's'}`;
}

function getShelfState() {
    return safeParse(localStorage.getItem(SHELF_STATE_KEY), null);
}

function setShelfState(state) {
    try {
        localStorage.setItem(SHELF_STATE_KEY, JSON.stringify({
            mode: state?.mode || 'all',
            query: (state?.query || '').trim(),
            ts: Date.now()
        }));
    } catch (_) {}
}

export function initChronicleTools() {
    const filter = document.getElementById('chronicle-filter');
    const btnEn = document.getElementById('btn-random-en');
    const btnVn = document.getElementById('btn-random-vn');
    if (!filter || !btnEn || !btnVn) return;

    const enShelf = document.getElementById('chronicles-en');
    const vnShelf = document.getElementById('chronicles-vn');
    const enLinks = Array.from(document.querySelectorAll('#chronicles-en a[href^="?entry="]'));
    const vnLinks = Array.from(document.querySelectorAll('#chronicles-vn a[href^="?entry="]'));
    const enItems = Array.from(document.querySelectorAll('#chronicles-en .chronicle-item'));
    const vnItems = Array.from(document.querySelectorAll('#chronicles-vn .chronicle-item'));
    const allItems = [...enItems, ...vnItems];
    hydrateChronicleMetadata(allItems);

    const shelfButtons = {
        all: document.getElementById('btn-shelf-all'),
        en: document.getElementById('btn-shelf-en'),
        vn: document.getElementById('btn-shelf-vn'),
        paired: document.getElementById('btn-shelf-paired')
    };
    let shelfMode = 'all';

    renderContinueReading();

    const fortuneEmpty = document.getElementById('fortune-empty');
    const fortuneContent = document.getElementById('fortune-content');
    const fortuneText = document.getElementById('fortune-text');
    const btnFortune = document.getElementById('btn-fortune');
    const btnFortuneCopy = document.getElementById('btn-fortune-copy');
    const btnCopyShelfLink = document.getElementById('btn-copy-shelf-link');
    const ledgerEnCount = document.getElementById('ledger-en-count');
    const ledgerVnCount = document.getElementById('ledger-vn-count');
    const ledgerPairedCount = document.getElementById('ledger-paired-count');
    const ledgerVisibleCount = document.getElementById('ledger-visible-count');
    const ledgerTotalCount = document.getElementById('ledger-total-count');
    const ledgerNote = document.getElementById('ledger-note');
    const shelfTrailheadEmpty = document.getElementById('shelf-trailhead-empty');
    const shelfTrailheadContent = document.getElementById('shelf-trailhead-content');
    const shelfTrailheadMode = document.getElementById('shelf-trailhead-mode');
    const shelfTrailheadSpan = document.getElementById('shelf-trailhead-span');
    const shelfTrailheadFresh = document.getElementById('shelf-trailhead-fresh');
    const shelfTrailheadOld = document.getElementById('shelf-trailhead-old');
    const shelfTrailheadNote = document.getElementById('shelf-trailhead-note');
    const shelfShareTagEmpty = document.getElementById('shelf-share-tag-empty');
    const shelfShareTagContent = document.getElementById('shelf-share-tag-content');
    const shelfShareTagMode = document.getElementById('shelf-share-tag-mode');
    const shelfShareTagQuery = document.getElementById('shelf-share-tag-query');
    const shelfShareTagLink = document.getElementById('shelf-share-tag-link');
    const shelfShareTagNote = document.getElementById('shelf-share-tag-note');
    const twinLanternIndex = document.getElementById('twin-lantern-index');
    const btnTwinLanternNewer = document.getElementById('btn-twin-lantern-newer');
    const btnTwinLanternOlder = document.getElementById('btn-twin-lantern-older');

    const pairCounts = new Map();
    for (const item of allItems) {
        const date = item.dataset.chronicleDate || '';
        const lang = item.dataset.chronicleLang || '';
        if (!date || !lang) continue;
        const cur = pairCounts.get(date) || { en: 0, vn: 0 };
        cur[lang] = (cur[lang] || 0) + 1;
        pairCounts.set(date, cur);
    }
    const pairedDates = new Set(
        Array.from(pairCounts.entries())
            .filter(([, counts]) => counts.en > 0 && counts.vn > 0)
            .map(([date]) => date)
    );

    const sortedPairedDates = Array.from(pairedDates).sort().reverse();
    let twinLanternCursor = 0;

    function clampTwinLanternCursor(index) {
        if (!sortedPairedDates.length) return 0;
        return Math.max(0, Math.min(sortedPairedDates.length - 1, index));
    }

    function renderTwinLantern() {
        const empty = document.getElementById('twin-lantern-empty');
        const content = document.getElementById('twin-lantern-content');
        const dateNode = document.getElementById('twin-lantern-date');
        const countNode = document.getElementById('twin-lantern-count');
        const enNode = document.getElementById('twin-lantern-en');
        const vnNode = document.getElementById('twin-lantern-vn');
        const noteNode = document.getElementById('twin-lantern-note');
        if (!empty || !content || !dateNode || !countNode || !enNode || !vnNode || !noteNode) return;

        countNode.textContent = `paired days: ${sortedPairedDates.length}`;
        if (!sortedPairedDates.length) {
            empty.style.display = 'inline';
            content.style.display = 'none';
            if (btnTwinLanternNewer) btnTwinLanternNewer.disabled = true;
            if (btnTwinLanternOlder) btnTwinLanternOlder.disabled = true;
            return;
        }

        twinLanternCursor = clampTwinLanternCursor(twinLanternCursor);
        const date = sortedPairedDates[twinLanternCursor];
        const enLink = document.querySelector(`.chronicle-item[data-chronicle-date="${date}"][data-chronicle-lang="en"] a[href^="?entry="]`);
        const vnLink = document.querySelector(`.chronicle-item[data-chronicle-date="${date}"][data-chronicle-lang="vn"] a[href^="?entry="]`);
        if (!enLink || !vnLink) {
            empty.style.display = 'inline';
            content.style.display = 'none';
            if (btnTwinLanternNewer) btnTwinLanternNewer.disabled = true;
            if (btnTwinLanternOlder) btnTwinLanternOlder.disabled = true;
            return;
        }

        empty.style.display = 'none';
        content.style.display = 'block';
        dateNode.textContent = `date: ${date}`;
        if (twinLanternIndex) twinLanternIndex.textContent = `pair ${twinLanternCursor + 1} / ${sortedPairedDates.length}`;
        enNode.href = enLink.getAttribute('href') || '#';
        enNode.textContent = (enLink.textContent || '').trim() || 'English chronicle';
        vnNode.href = vnLink.getAttribute('href') || '#';
        vnNode.textContent = (vnLink.textContent || '').trim() || 'Vietnamese chronicle';
        if (btnTwinLanternNewer) btnTwinLanternNewer.disabled = twinLanternCursor === 0;
        if (btnTwinLanternOlder) btnTwinLanternOlder.disabled = twinLanternCursor === sortedPairedDates.length - 1;
        noteNode.textContent = twinLanternCursor === 0
            ? (sortedPairedDates.length > 1
                ? `Newest day with both shelf twins. ${sortedPairedDates.length - 1} older paired day${sortedPairedDates.length === 2 ? '' : 's'} still glow below.`
                : 'Newest day with both shelf twins.')
            : `Paired shelf footing ${twinLanternCursor + 1} of ${sortedPairedDates.length}. The lantern can step newer or older without leaving the bilingual trail.`;
    }

    renderTwinLantern();
    btnTwinLanternNewer?.addEventListener('click', () => {
        twinLanternCursor = clampTwinLanternCursor(twinLanternCursor - 1);
        renderTwinLantern();
    });
    btnTwinLanternOlder?.addEventListener('click', () => {
        twinLanternCursor = clampTwinLanternCursor(twinLanternCursor + 1);
        renderTwinLantern();
    });

    for (const item of allItems) {
        const date = item.dataset.chronicleDate || '';
        const lang = item.dataset.chronicleLang || '';
        const hasTwin = Boolean(date && lang && pairedDates.has(date));
        const fallbackId = `chronicle-mark-${allItems.indexOf(item) + 1}`;
        const markId = getChronicleMarkId(date, lang) || fallbackId;
        if (markId && !item.id) item.id = markId;
        item.dataset.hasTwin = hasTwin ? 'true' : 'false';

        const oldBadge = item.querySelector('.twin-badge');
        if (oldBadge) oldBadge.remove();
        if (!hasTwin) continue;

        const twinLang = lang === 'vn' ? 'en' : 'vn';
        const twinItem = document.querySelector(`.chronicle-item[data-chronicle-date="${date}"][data-chronicle-lang="${twinLang}"]`);
        const twinLink = twinItem?.querySelector('a[href^="?entry="]');
        if (!twinLink) continue;

        const badge = document.createElement('a');
        badge.className = 'twin-badge';
        badge.href = twinLink.getAttribute('href') || '#';
        badge.textContent = lang === 'vn' ? 'EN twin' : 'Bản Việt';
        badge.setAttribute('title', `Open ${twinLang === 'vn' ? 'Vietnamese' : 'English'} twin chronicle for ${date}`);
        badge.setAttribute('aria-label', `Open ${twinLang === 'vn' ? 'Vietnamese' : 'English'} twin chronicle for ${date}`);
        item.appendChild(badge);
    }

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

    function updateShelfUrl() {
        if (window.location.search.includes('entry=')) return window.location.href;

        const params = new URLSearchParams(window.location.search);
        if (shelfMode !== 'all') params.set('shelf', shelfMode);
        else params.delete('shelf');

        const q = (filter.value || '').trim();
        if (q) params.set('q', q);
        else params.delete('q');

        const next = params.toString();
        const url = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash || ''}`;
        window.history.replaceState({}, '', url);
        return `${window.location.origin}${url}`;
    }

    function updateShelfShareTag(query = '') {
        if (!shelfShareTagEmpty || !shelfShareTagContent || !shelfShareTagMode || !shelfShareTagQuery || !shelfShareTagLink || !shelfShareTagNote) return;

        const url = updateShelfUrl() || window.location.href;
        const modeLabel = shelfMode === 'en'
            ? 'English shelf'
            : shelfMode === 'vn'
                ? 'Vietnamese shelf'
                : shelfMode === 'paired'
                    ? 'Twin-day shelf'
                    : 'Both shelves';
        const trimmedQuery = query.trim();

        shelfShareTagEmpty.style.display = 'none';
        shelfShareTagContent.style.display = 'block';
        shelfShareTagMode.textContent = `focus: ${modeLabel.toLowerCase()}`;
        shelfShareTagQuery.textContent = trimmedQuery ? `filter: ${trimmedQuery}` : 'filter: none';
        shelfShareTagLink.href = url;
        shelfShareTagLink.textContent = url;
        shelfShareTagNote.textContent = trimmedQuery || shelfMode !== 'all'
            ? 'This tag will bring a future goblin back to the same shelf footing.'
            : 'This tag points to the broad mouth of the library.';
    }

    function updateShelfLedger(query = '') {
        const total = allItems.length;
        const shelfItems = shelfMode === 'en'
            ? enItems
            : shelfMode === 'vn'
                ? vnItems
                : shelfMode === 'paired'
                    ? allItems.filter(item => item.dataset.hasTwin === 'true')
                    : allItems;
        const visible = shelfItems.filter(item => !item.classList.contains('shelf-hidden')).length;
        if (ledgerEnCount) ledgerEnCount.textContent = String(enItems.length);
        if (ledgerVnCount) ledgerVnCount.textContent = String(vnItems.length);
        if (ledgerPairedCount) ledgerPairedCount.textContent = String(pairedDates.size);
        if (ledgerVisibleCount) ledgerVisibleCount.textContent = String(visible);
        if (ledgerTotalCount) ledgerTotalCount.textContent = String(total);

        if (!ledgerNote) return;
        const latestEn = enLinks[0]?.textContent?.trim() || 'unknown';
        const latestVn = vnLinks[0]?.textContent?.trim() || 'unknown';
        const modeLabel = shelfMode === 'en'
            ? 'English shelf only'
            : shelfMode === 'vn'
                ? 'Vietnamese shelf only'
                : shelfMode === 'paired'
                    ? 'Twin-day shelf marks only'
                    : 'Both shelves';
        const memoryNote = query || shelfMode !== 'all'
            ? ' Shelf memory will keep this footing when you wander off and come back.'
            : '';
        ledgerNote.textContent = query
            ? `${modeLabel}. Filter "${query}" leaves ${visible} shelf marks visible. Freshest EN: ${latestEn}. Freshest VN: ${latestVn}.${memoryNote}`
            : `${modeLabel}. ${total} chronicled scraps across ${pairedDates.size} twin days. Freshest EN: ${latestEn}. Freshest VN: ${latestVn}.${memoryNote}`;
    }

    function updateShelfTrailhead(query = '') {
        if (!shelfTrailheadEmpty || !shelfTrailheadContent || !shelfTrailheadMode || !shelfTrailheadSpan || !shelfTrailheadFresh || !shelfTrailheadOld || !shelfTrailheadNote) return;

        const visibleItems = allItems.filter(item => !item.classList.contains('shelf-hidden'));
        const modeLabel = shelfMode === 'en'
            ? 'English shelf'
            : shelfMode === 'vn'
                ? 'Vietnamese shelf'
                : shelfMode === 'paired'
                    ? 'Twin-day shelf'
                    : 'Both shelves';

        shelfTrailheadMode.textContent = `focus: ${modeLabel.toLowerCase()}`;
        shelfTrailheadSpan.textContent = `span: ${visibleItems.length} mark${visibleItems.length === 1 ? '' : 's'}`;

        if (!visibleItems.length) {
            shelfTrailheadEmpty.style.display = 'inline';
            shelfTrailheadContent.style.display = 'none';
            shelfTrailheadNote.textContent = query
                ? `Nothing matches "${query}" on this shelf footing.`
                : 'Nothing is visible on this shelf footing.';
            return;
        }

        const freshest = visibleItems[0];
        const oldest = visibleItems[visibleItems.length - 1];
        const bindShelfEdge = (node, item) => {
            const anchor = item?.querySelector('a[href^="?entry="]');
            node.href = `#${item?.id || ''}`;
            node.textContent = (anchor?.textContent || '').trim() || 'Untitled shelf mark';
            node.title = (anchor?.textContent || '').trim() || 'Untitled shelf mark';
        };

        bindShelfEdge(shelfTrailheadFresh, freshest);
        bindShelfEdge(shelfTrailheadOld, oldest);
        shelfTrailheadEmpty.style.display = 'none';
        shelfTrailheadContent.style.display = 'block';

        const freshestDate = freshest?.querySelector('strong')?.textContent?.replace(/:\s*$/, '') || 'unknown';
        const oldestDate = oldest?.querySelector('strong')?.textContent?.replace(/:\s*$/, '') || 'unknown';
        shelfTrailheadNote.textContent = query
            ? `${modeLabel} filtered by "${query}". Walk from ${freshestDate} down to ${oldestDate}.`
            : `${modeLabel}. Walk from ${freshestDate} down to ${oldestDate}.`;
    }

    function setShelfMode(mode = 'all') {
        shelfMode = (mode === 'en' || mode === 'vn' || mode === 'paired') ? mode : 'all';

        if (enShelf) enShelf.style.display = (shelfMode === 'vn') ? 'none' : '';
        if (vnShelf) vnShelf.style.display = (shelfMode === 'en') ? 'none' : '';

        for (const [key, btn] of Object.entries(shelfButtons)) {
            if (!btn) continue;
            const active = key === shelfMode;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        }

        applyFilter();
    }

    async function copyShelfLink() {
        const url = updateShelfUrl() || window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            if (!btnCopyShelfLink) return;
            const prev = btnCopyShelfLink.textContent;
            btnCopyShelfLink.textContent = 'Copied';
            setTimeout(() => (btnCopyShelfLink.textContent = prev), 1000);
        } catch (e) {
            window.prompt('Copy this shelf link:', url);
        }
    }

    btnEn.addEventListener('click', () => goRandom(enLinks));
    btnVn.addEventListener('click', () => goRandom(vnLinks));
    btnCopyShelfLink?.addEventListener('click', copyShelfLink);
    shelfButtons.all?.addEventListener('click', () => setShelfMode('all'));
    shelfButtons.en?.addEventListener('click', () => setShelfMode('en'));
    shelfButtons.vn?.addEventListener('click', () => setShelfMode('vn'));
    shelfButtons.paired?.addEventListener('click', () => setShelfMode('paired'));

    function applyFilter() {
        const q = (filter.value || '').trim().toLowerCase();
        for (const item of allItems) {
            const t = (item.textContent || '').toLowerCase();
            const twinMatches = shelfMode !== 'paired' || item.dataset.hasTwin === 'true';
            const matches = (!q || t.includes(q)) && twinMatches;
            item.classList.toggle('shelf-hidden', !matches);
        }
        const exactQuery = filter.value.trim();
        updateShelfLedger(exactQuery);
        updateShelfTrailhead(exactQuery);
        updateShelfShareTag(exactQuery);
        setShelfState({ mode: shelfMode, query: exactQuery });
    }

    const initialParams = new URLSearchParams(window.location.search);
    const rememberedShelf = getShelfState();
    const initialMode = initialParams.get('shelf') || rememberedShelf?.mode || 'all';
    const initialQuery = (initialParams.get('q') || rememberedShelf?.query || '').trim();
    if (initialQuery) filter.value = initialQuery;

    setShelfMode(initialMode);
    filter.addEventListener('input', applyFilter);

    // SPA Navigation: Intercept chronicle links
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (href.startsWith('?entry=')) {
            e.preventDefault();
            window.history.pushState({}, '', href);
            loadEntry();
        } else if (a.classList.contains('back-link')) {
            // If it's the back link, we might want to just go to index.html or use history
            e.preventDefault();
            window.history.pushState({}, '', 'index.html');
            loadEntry();
        }
    });

    window.addEventListener('popstate', () => {
        loadEntry();
    });

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

        if (!typing && e.key === '/') {
            e.preventDefault();
            filter.focus();
            filter.select();
            return;
        }

        if (typing) return;

        if (e.key === '1') {
            e.preventDefault();
            setShelfMode('all');
        }
        if (e.key === '2') {
            e.preventDefault();
            setShelfMode('en');
        }
        if (e.key === '3') {
            e.preventDefault();
            setShelfMode('vn');
        }
        if (e.key === '4') {
            e.preventDefault();
            setShelfMode('paired');
        }
        if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            copyShelfLink();
        }
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

            if (typeof marked === 'undefined') {
                contentDiv.innerHTML = '<p style="color: red;">Error: Marked.js scavenge failed.</p>';
                return;
            }
            contentDiv.innerHTML = marked.parse(text);

            const heading = contentDiv.querySelector('h1, h2, h3');
            const title = heading ? (heading.textContent || '').trim() : '';
            const date = /^\d{4}-\d{2}-\d{2}/.test(safeEntry) ? safeEntry.slice(0, 10) : '';

            renderShelfMarkBridge(safeEntry);
            renderChronicleTrail(safeEntry);
            renderDayFootingBridge(safeEntry);
            renderDayBundleBridge(safeEntry);
            renderTranslationBridge(safeEntry);

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
    } else {
        const mainUI = document.getElementById('main-ui');
        const entryUI = document.getElementById('entry-ui');
        if (mainUI) mainUI.style.display = 'block';
        if (entryUI) entryUI.style.display = 'none';
        const bridge = document.getElementById('translation-bridge');
        if (bridge) bridge.style.display = 'none';
        const shelfMarkBridge = document.getElementById('shelf-mark-bridge');
        if (shelfMarkBridge) shelfMarkBridge.style.display = 'none';
        const trail = document.getElementById('chronicle-trail');
        if (trail) trail.style.display = 'none';
    }
}
