import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEntry } from '../js/library.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('all five continuation bridges are below the scratch in one closed native hatch', () => {
    const match = html.match(/<details id="conveyor-hatch"([^>]*)>([\s\S]*?)<\/details>/);
    assert.ok(match);
    assert.doesNotMatch(match[1], /\bopen\b/);
    assert.match(match[2], /^\s*<summary>/);
    assert.ok(html.indexOf('id="markdown-content"') < match.index);
    for (const id of ['shelf-mark-bridge', 'chronicle-trail', 'day-footing-bridge', 'day-bundle-bridge', 'translation-bridge']) {
        assert.ok(match[2].includes(`id="${id}"`), id);
        assert.equal(html.split(`id="${id}"`).length, 2, `${id} remains unique`);
    }
    assert.equal(html.split('id="markdown-content"').length, 2);
    assert.match(html, /THE BELT ENDS HERE/);
    assert.match(html, /BĂNG CHUYỀN DỪNG Ở ĐÂY/);
});

test('navigation and failed entry loads reclose the hatch without storage or extra requests', async () => {
    const previous = { document: globalThis.document, window: globalThis.window, fetch: globalThis.fetch, error: console.error };
    const nodes = Object.fromEntries(['conveyor-hatch', 'text-mutiny', 'main-ui', 'entry-ui', 'markdown-content'].map(id => [id, { open: true, style: {} }]));
    let requests = 0;
    globalThis.document = { getElementById: id => nodes[id] };
    globalThis.window = { location: { search: '' } };
    globalThis.fetch = async () => { requests++; return { ok: false }; };
    console.error = () => {};
    try {
        await loadEntry();
        assert.equal(nodes['conveyor-hatch'].open, false);
        assert.equal(requests, 0);
        nodes['conveyor-hatch'].open = true;
        window.location.search = '?entry=entries/missing.md';
        await loadEntry();
        assert.equal(nodes['conveyor-hatch'].open, false);
        assert.equal(requests, 1);
        assert.match(nodes['markdown-content'].innerHTML, /Could not scavenge/);
    } finally {
        globalThis.document = previous.document;
        globalThis.window = previous.window;
        globalThis.fetch = previous.fetch;
        console.error = previous.error;
    }
});
