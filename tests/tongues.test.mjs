import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const wall = html.match(/<section class="tongue-mutiny"[\s\S]*?<\/section>/)?.[0];

test('the entrance gives Vietnamese the big type through an enabled native control', () => {
    assert.ok(wall);
    assert.match(wall, /<label[^>]*for="tongue-coup"/);
    assert.match(wall, /<input id="tongue-coup" type="checkbox" checked aria-describedby="tongue-note">/);
    assert.match(wall, /id="tongue-note"/);
    assert.match(wall, /TIẾNG VIỆT KHÔNG PHẢI PHỤ ĐỀ/);
    assert.match(wall, /Both voices stay/);
    assert.match(wall, /this wall only/);
    assert.match(wall, /Không dịch, xếp hạng hay lưu lựa chọn/);
    assert.doesNotMatch(wall, /<script|<form|\bon\w+=|\bhidden\b/);
});

test('the coup swaps size and underline without hiding or visually reordering the voices', () => {
    const resting = css.match(/^\.tongue-wall \{([^}]+)\}/m)[1];
    const coup = css.match(/^\.tongue-mutiny:has\(#tongue-coup:checked\) \.tongue-wall \{([^}]+)\}/m)[1];
    assert.match(resting, /--en-size: clamp\(2rem, 8vw, 4.5rem\); --vi-size: 1rem/);
    assert.match(coup, /--en-size: 1rem; --vi-size: clamp\(2rem, 8vw, 4.5rem\)/);
    assert.match(coup, /--en-cut: 0px; --vi-cut: 8px/);
    assert.match(css, /#front-wall-en \{ font-size: var\(--en-size\)/);
    assert.match(css, /#front-wall-vi \{ font-size: var\(--vi-size\)/);
    const rules = css.split('/* The welcome desk')[0];
    assert.doesNotMatch(rules.split('@media print')[0], /display: none|\border:|row-reverse|column-reverse/);
    assert.match(css, /#tongue-coup:focus-visible/);
});

test('existing writable-wall identities and language annotations survive the mutation', () => {
    for (const lang of ['en', 'vi']) {
        assert.equal((html.match(new RegExp(`id="front-wall-${lang}"`, 'g')) || []).length, 1);
        assert.match(wall, new RegExp(`id="front-wall-${lang}" lang="${lang}"`));
    }
    assert.match(html, /id="wall-paint-form"/);
    assert.match(html, /id="bone-doors"/);
});
