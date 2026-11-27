import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEntry, renderContinueReading } from '../js/library.js';

const file = '2026-11-27-a-quiet-shelf-is-not-vacant.md';
const entry = `?entry=entries/${file}`;
const key = 'vort_last_read_v1';

test('reading does not punch a time clock; one deliberate bite saves, resumes, and can be removed', async t => {
    const nodes = Object.fromEntries(['main-ui', 'entry-ui', 'markdown-content', 'reader-tooth', 'tooth-note', 'bite-spot',
        'bite-status-en', 'bite-status-vi', 'continue-box', 'continue-empty', 'continue-content', 'continue-link',
        'continue-meta', 'btn-forget-last'].map(id => [id, { style: {} }]));
    nodes['markdown-content'].querySelector = () => ({ textContent: 'A Quiet Shelf Is Not Vacant' });
    const storage = new Map();
    const scrolls = [];
    let denied = false;
    const window = {
        location: { search: entry }, scrollY: 0,
        scrollTo: (x, y) => scrolls.push([x, y]),
        addEventListener: () => assert.fail('Bookmark must not listen to scrolling')
    };
    const environment = {
        window,
        document: { getElementById: id => nodes[id], querySelectorAll: () => [] },
        marked: { parse: text => text },
        fetch: async () => ({ ok: true, text: async () => '<h1>Scratch</h1>' }),
        requestAnimationFrame: fn => fn(),
        localStorage: {
            getItem: k => storage.get(k) ?? null,
            setItem: (k, v) => { if (denied) throw Error('Storage blocked'); storage.set(k, v); },
            removeItem: k => storage.delete(k)
        }
    };
    for (const [name, value] of Object.entries(environment)) {
        const prior = Object.getOwnPropertyDescriptor(globalThis, name);
        Object.defineProperty(globalThis, name, { value, configurable: true });
        t.after(() => prior ? Object.defineProperty(globalThis, name, prior) : delete globalThis[name]);
    }

    await loadEntry();
    assert.equal(nodes['reader-tooth'].hidden, false);
    assert.equal(storage.size, 0);
    window.scrollY = 440;
    nodes['bite-spot'].onclick();
    assert.equal(nodes['bite-status-en'].textContent, 'Tooth lodged.');
    const saved = storage.get(key);
    assert.equal(JSON.parse(saved).scrollY, 440);
    assert.equal(JSON.parse(saved).entry, file);

    window.scrollY = 600;
    await loadEntry();
    assert.deepEqual(scrolls, []);
    assert.equal(storage.get(key), saved);

    renderContinueReading();
    assert.equal(nodes['continue-link'].href, entry + '&resume=tooth');
    window.location.search = '?entry=entries/other.md&resume=tooth';
    await loadEntry();
    assert.deepEqual(scrolls, []);
    window.location.search = nodes['continue-link'].href;
    await loadEntry();
    assert.deepEqual(scrolls, [[0, 440]]);
    assert.equal(storage.get(key), saved);

    denied = true;
    nodes['bite-spot'].onclick();
    assert.match(nodes['bite-status-en'].textContent, /Could not save/);
    assert.equal(storage.get(key), saved);
    nodes['btn-forget-last'].onclick();
    assert.equal(storage.size, 0);
    assert.equal(nodes['continue-content'].style.display, 'none');
});
