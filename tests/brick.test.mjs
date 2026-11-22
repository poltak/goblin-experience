import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const brick = html.match(/<details class="brick-breach" id="brick-breach">[\s\S]*?<\/details>/)?.[0];

test('a closed native brick hatch offers a bilingual, reversible refusal', () => {
    assert.ok(brick);
    assert.match(brick, /^<details[^>]*>\s*<summary>/);
    assert.match(brick, /NÉM GẠCH XUYÊN TUYÊN NGÔN/);
    assert.match(brick, /Close to bring them back/);
    assert.doesNotMatch(brick, /<script|<form|\son\w+=|\shidden(?:[\s=>])|<details[^>]*\sopen(?:[\s=>])/);
    assert.match(css, /\.brick-breach > summary:focus-visible/);
});

test('the brick leads directly to two real independent Markdown files', () => {
    const links = [...brick.matchAll(/href="([^"]+)" lang="(en|vi)"/g)];
    assert.deepEqual(links.map(link => link[2]), ['en', 'vi']);
    for (const [, href] of links) {
        assert.match(href, /^entries\/[a-z0-9-]+\.md$/);
        const target = new URL(`../${href}`, import.meta.url);
        assert.ok(existsSync(target), href);
        assert.match(readFileSync(target, 'utf8'), /^# /m);
    }
    assert.match(brick, /not a feed or a translation pair/);
});

test('opening removes only sibling sermons, leaving the brick and tools recoverable', () => {
    assert.ok(css.includes('.strike-room:has(> #brick-breach[open]) > :not(#brick-breach) { display: none; }'));
    assert.match(html, /<div class="strike-room">\s*<p class="strike-scar">[^<]+<\/p>\s*<details class="brick-breach"/);
    assert.match(html, /<details class="old-contraband">\s*<summary>[\s\S]*?<\/summary>\s*<p><a href="veto.html">/);
    assert.equal((html.match(/id="brick-breach"/g) || []).length, 1);
});
