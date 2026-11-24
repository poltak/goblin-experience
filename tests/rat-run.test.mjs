import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const page = readFileSync(new URL('../rat-run.html', import.meta.url), 'utf8');
const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the brick has a bilingual crawlspace into a standalone, scriptless rat map', () => {
    assert.match(home, /href="rat-run.html"/);
    assert.match(page, /THE RATS ATE<br>THE TIMELINE/);
    assert.match(page, /CHUỘT GẶM MẤT DÒNG THỜI GIAN/);
    assert.doesNotMatch(page, /<script|<iframe|<img|<link|<form|\son\w+=|https?:\/\//i);
    assert.match(page, /\.burrow:target/);
    assert.match(page, /:focus-visible/);
    assert.match(page, /@media \(max-width: 36rem\)/);
});

test('every tunnel lands, and all four raw bones exist with their real titles', () => {
    const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const [, id] of page.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), id);
    const tunnels = page.match(/<main id="rat-tunnels">[\s\S]*?<\/main>/)[0];
    const bones = [...tunnels.matchAll(/href="(entries\/[^"]+)" lang="(en|vi)">([^<]+)</g)];
    assert.equal(bones.length, 4);
    assert.deepEqual(bones.map(m => m[2]), ['en', 'vi', 'vi', 'en']);
    for (const [, href, , label] of bones) {
        const file = new URL(`../${href}`, import.meta.url);
        assert.ok(existsSync(file), href);
        const title = readFileSync(file, 'utf8').split('\n')[0].replace(/^# /, '');
        assert.ok(label.startsWith(title), title);
    }
});

test('the flood is reversible CSS, and preserves exactly the same four real writings', () => {
    assert.match(home, /FLOOD THE RAT MAP/);
    assert.match(page, /<label class="flood-lever" for="flood">/);
    const input = page.match(/<input id="flood"[^>]*>/)[0];
    assert.match(input, /type="checkbox"/);
    assert.doesNotMatch(input, /checked|hidden/);
    const controlled = input.match(/aria-controls="([^"]+)"/)[1].split(' ');
    for (const id of controlled) assert.ok(page.includes(`id="${id}"`), id);
    assert.match(page, /#flood:checked ~ header, #flood:checked ~ main, #flood:checked ~ footer \{ display: none; \}/);
    assert.match(page, /#flood:checked ~ \.flotsam \{ display: block; \}/);
    assert.match(page, /\.flotsam \{ display: none; \}/);
    assert.match(page, /NƯỚC KHÔNG<br>ĐỌC BIỂN CHỈ ĐƯỜNG/);
    assert.match(page, /Uncheck to drain it. Nothing saved/);
    const flood = page.match(/<section class="flotsam"[\s\S]*?<\/section>/)[0];
    const tunnels = page.match(/<main id="rat-tunnels">[\s\S]*?<\/main>/)[0];
    const paths = text => [...text.matchAll(/href="(entries\/[^"]+)"/g)].map(m => m[1]).sort();
    assert.equal(paths(flood).length, 4);
    assert.deepEqual(paths(flood), paths(tunnels));
    for (const [, href, label] of flood.matchAll(/href="(entries\/[^"]+)" lang="(?:en|vi)">([^<]+)</g)) {
        const title = readFileSync(new URL(`../${href}`, import.meta.url), 'utf8').split('\n')[0].replace(/^# /, '');
        assert.ok(label.startsWith(title), title);
    }
    assert.match(flood, /href="\.\/"/);
    assert.ok(page.indexOf(input) < page.indexOf('<section class="flotsam"'));
    assert.ok(page.indexOf(input) < page.indexOf('<header id="map"'));
});

test('nests are optional native hatches, not a progress gate or automatic queue', () => {
    const hatches = [...page.matchAll(/<details([^>]*)>/g)];
    assert.equal(hatches.length, 2);
    for (const [, attrs] of hatches) assert.doesNotMatch(attrs, /open|hidden/);
    assert.match(page, /href="#outside"/);
    assert.match(page, /close the tab without finishing/);
    assert.match(page, /not a complete archive/);
    assert.match(page, /not translation pairs/);
});
