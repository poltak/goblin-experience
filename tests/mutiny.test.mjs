import test from 'node:test';
import assert from 'node:assert/strict';
import { makeMutinyZine } from '../js/contraband.js';
import { initTextMutiny } from '../js/library.js';

const hostile = '<script>alert("king")</script> & <img src=x onerror=alert(1)>';

test('zine keeps bilingual multiline text and escapes markup and provenance', () => {
    const html = makeMutinyZine(`No throne.\nKhông ngai.\n${hostile}`, hostile);
    assert.ok(html.includes('No throne.\nKhông ngai.\n&lt;script&gt;'));
    assert.ok(html.includes('&amp; &lt;img src=x onerror=alert(1)&gt;'));
    assert.ok(html.includes('Original scratch by Vort'));
    assert.ok(html.includes('Not the original chronicle.'));
    assert.ok(html.includes("default-src 'none'"));
    assert.doesNotMatch(html, /<(script|img|link|iframe|a)\b/i);
    assert.ok(makeMutinyZine('', '').includes('</html>'));
});

test('seize → edit → download → restore; no stale or automatic export', async () => {
    const nodes = Object.fromEntries(['text-mutiny', 'btn-seize-text', 'btn-restore-text', 'btn-smuggle-text'].map(id => [id, { hidden: true, focus() {} }]));
    const classes = new Set();
    const content = {
        innerHTML: '<h1>Original</h1><p>Body</p>',
        innerText: 'Original\n\nBody', textContent: 'OriginalBody',
        classList: { add: x => classes.add(x), remove: x => classes.delete(x) },
        replaceChildren(child) { this.child = child; }
    };
    let offered = null;
    let anchor = null;
    let timer = null;
    let revoked = null;
    const previous = { document: globalThis.document, setTimeout: globalThis.setTimeout, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
    globalThis.document = {
        getElementById: id => nodes[id],
        createElement(tag) {
            if (tag === 'textarea') return { setAttribute() {}, focus() {} };
            assert.equal(tag, 'a');
            anchor = { click() { this.clicked = true; }, remove() { this.removed = true; } };
            return anchor;
        },
        body: { appendChild() {} }
    };
    URL.createObjectURL = blob => { offered = blob; return 'blob:test'; };
    URL.revokeObjectURL = url => { revoked = url; };
    globalThis.setTimeout = (fn, delay) => { assert.equal(delay, 60000); timer = fn; };
    try {
        const source = 'entries/2026-11-09-test.md';
        initTextMutiny(content, source);
        const seize = nodes['btn-seize-text'];
        const restore = nodes['btn-restore-text'];
        const smuggle = nodes['btn-smuggle-text'];
        assert.equal(smuggle.hidden, true);
        smuggle.onclick();
        assert.equal(offered, null);
        seize.onclick();
        assert.equal(content.child.value, 'Original\n\nBody');
        assert.equal(smuggle.hidden, false);
        assert.equal(classes.has('text-seized'), true);
        content.child.value = `My dissent.\nÝ kiến của tôi.\n${hostile}`;
        assert.equal(offered, null);
        smuggle.onclick();
        assert.equal(anchor.download, 'stolen-teeth.html');
        assert.equal(anchor.href, 'blob:test');
        assert.ok(anchor.clicked && anchor.removed);
        const html = await offered.text();
        assert.ok(html.includes('My dissent.\nÝ kiến của tôi.'));
        assert.ok(html.includes(source));
        assert.doesNotMatch(html, /<script>/);
        timer();
        assert.equal(revoked, 'blob:test');
        restore.onclick();
        assert.equal(smuggle.hidden, true);
        assert.equal(content.innerHTML, '<h1>Original</h1><p>Body</p>');
        assert.equal(classes.has('text-seized'), false);
        offered = null;
        smuggle.onclick();
        assert.equal(offered, null);
        seize.onclick();
        assert.equal(content.child.value, 'Original\n\nBody');
        initTextMutiny(content, 'entries/second.md');
        assert.equal(smuggle.hidden, true);
    } finally {
        globalThis.document = previous.document;
        globalThis.setTimeout = previous.setTimeout;
        URL.createObjectURL = previous.create;
        URL.revokeObjectURL = previous.revoke;
    }
});
