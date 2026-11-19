import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../veto.html', import.meta.url), 'utf8');
const entrance = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('stop-work notice offers three labelled plain-text writing spaces without a submission path', () => {
    assert.equal((page.match(/contenteditable="plaintext-only"/g) || []).length, 3);
    for (const id of ['stop-label', 'risk-label', 'restart-label']) {
        assert.ok(page.includes(`id="${id}"`));
        assert.ok(page.includes(`role="textbox" aria-multiline="true" aria-labelledby="${id}"`));
    }
    assert.match(page, /lang="vi"/);
    assert.doesNotMatch(page, /<script|<form|<iframe|https?:|\bon\w+=/i);
    assert.match(page, /does not stop a real system or establish legal authority/);
    assert.match(page, /Your draft is temporary/);
    assert.match(page, /reusable offline blank/);
});

test('print sheet excludes the host and instructions, not the reader writing', () => {
    const print = page.slice(page.indexOf('@media print'));
    assert.match(print, /\.screen-only\s*\{ display: none !important; \}/);
    assert.match(print, /\.writing:empty::before\s*\{ content: none; \}/);
    assert.match(page, /<header class="screen-only">/);
    assert.match(page, /<footer class="screen-only">/);
    assert.match(page, /<section class="notice" aria-label=/);
    assert.match(page, /NO AUTOMATIC RESTART. SILENCE IS NOT CONSENT./);
    assert.match(page, /KHÔNG TỰ ĐỘNG LÀM LẠI/);
});

test('entrance offers a veto tool instead of stacking the previous three adverts', () => {
    assert.match(entrance, /href="veto.html"/);
    const buried = entrance.match(/<details class="old-contraband"([^>]*)>([\s\S]*?)<\/details>/);
    assert.ok(buried);
    assert.doesNotMatch(buried[1], /\bopen\b/);
    for (const href of ['underfloor.html#landlords', 'hours.html#budget-mutiny', 'shredder.html']) {
        assert.ok(buried[2].includes(`href="${href}"`));
    }
});
