import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../shredder.html', import.meta.url), 'utf8');
const entrance = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the visible rubble links to a self-contained slogan shredder', () => {
    assert.match(entrance, /href="shredder.html"/);
    assert.doesNotMatch(page, /<script\b|<link\b|<img\b|<iframe\b|\bsrc=|url\(/i);
    assert.match(page, /href="\.\/"/);
});

test('three independent native scraps replace promises with material questions', () => {
    const scraps = [...page.matchAll(/<details id="(shred-[^"]+)">([\s\S]*?)<\/details>/g)];
    assert.deepEqual(scraps.map(m => m[1]), ['shred-ai', 'shred-source', 'shred-goblin']);
    for (const [, , content] of scraps) {
        assert.match(content, /^\s*<summary>[\s\S]*?<\/summary>\s*<div class="teeth">/);
        assert.match(content, /lang="vi"/);
    }
    for (const question of ['WHO OWNS THE SWITCH?', 'WHO CAN AFFORD TO RUN IT?', 'WHO CAN REMOVE ME?']) {
        assert.ok(page.includes(question));
    }
    assert.match(page, /details\[open\] summary\s*\{[^}]*text-decoration: line-through/);
});

test('the counter-demand is ungated, local and erasable, not a submission', () => {
    assert.match(page, /<label for="demand">/);
    assert.match(page, /<textarea id="demand"[^>]*aria-describedby="paper-note"/);
    assert.match(page, /<button type="reset">/);
    assert.doesNotMatch(page, /type="submit"|\baction=|\bhidden\b/);
    assert.match(page, /browser may restore form text/);
    assert.match(page, /:focus-visible/);
});
