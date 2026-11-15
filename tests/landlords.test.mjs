import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const page = readFileSync(new URL('../underfloor.html', import.meta.url), 'utf8');
const entrance = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const room = page.match(/<section class="crawl-room" id="landlords"[\s\S]*?<\/section>/)?.[0];

test('landlord room is reachable from the visible entrance and needs no script', () => {
    assert.ok(room);
    assert.match(entrance, /href="underfloor.html#landlords"/);
    assert.match(room, /aria-labelledby="landlords-title"/);
    assert.match(room, /id="landlords-title"/);
    assert.doesNotMatch(page, /<(script|link|iframe|img)\b/i);
    assert.match(page, /\.crawl-room:target\s*\{ display: block; \}/);
    assert.match(room, /PAPER FUSES ONLY/);
    assert.match(room, /Không chặn yêu cầu mạng/);
});

test('three bilingual native casings never gate the actual bypasses', () => {
    const casings = [...room.matchAll(/<details id="(fuse-[^"]+)">([\s\S]*?)<\/details>/g)];
    assert.deepEqual(casings.map(x => x[1]), ['fuse-renderer', 'fuse-host', 'fuse-oracle']);
    for (const [, , body] of casings) {
        assert.match(body, /^\s*<summary>/);
        assert.match(body, /lang="vi"/);
        assert.doesNotMatch(body, /<a\b/);
    }
    const nav = room.match(/<nav[\s\S]*?<\/nav>/)[0];
    const links = [...nav.matchAll(/href="([^"]+)"/g)].map(x => x[1]);
    assert.equal(links.length, 3);
    for (const link of links.filter(x => !x.startsWith('https:'))) {
        assert.ok(existsSync(new URL(`../${link}`, import.meta.url)), link);
        assert.match(link, /\.md$/);
    }
    assert.ok(links.includes('https://github.com/poltak/goblin-experience/archive/refs/heads/main.zip'));
    assert.match(room, /not a promise that every feature works offline/);
    assert.match(room, /href="#junction"/);
});
