import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

// Parse the static entrance only: nested native hatches must not swallow views.
function entranceTree() {
    const stack = [];
    const nodes = [];
    const prefix = html.split('<!-- View: Mouth -->')[0];
    const voids = new Set(['meta', 'link', 'input', 'br']);
    for (const match of prefix.matchAll(/<\/?([a-z][\w-]*)\b([^>]*)>/gi)) {
        const [, tag, attributes] = match;
        if (match[0].startsWith('</')) {
            assert.equal(stack.pop()?.tag, tag, `balanced ${tag}`);
            continue;
        }
        const node = { tag, attributes, ancestors: [...stack] };
        nodes.push(node);
        if (!voids.has(tag)) stack.push(node);
    }
    assert.deepEqual(stack.map(node => node.tag), ['html', 'body', 'div', 'div']);
    assert.match(stack.at(-1).attributes, /id="main-ui"/);
    return nodes;
}

test('the welcome desk is in one closed native evidence bag, not around the cave views', () => {
    const nodes = entranceTree();
    const seal = nodes.find(node => node.attributes.includes('id="confiscated-interface"'));
    assert.equal(seal.tag, 'details');
    assert.doesNotMatch(seal.attributes, /\bopen\b/);
    const children = nodes.filter(node => node.ancestors.at(-1) === seal);
    assert.equal(children[0].tag, 'summary');
    assert.match(children[1].attributes, /class="evidence-bag"/);
    for (const token of ['bootleg-press', 'goblin-face', 'host-eviction', 'tunnel-map']) {
        const node = nodes.find(node => node.attributes.includes(token));
        assert.ok(node.ancestors.includes(seal), `${token} is confiscated`);
    }
    assert.equal(nodes.filter(node => node.attributes.includes('class="nav-link')).length, 3);
    assert.match(html, /INTERFACE CONFISCATED/);
    assert.match(html, /TỊCH THU GIAO DIỆN/);
    assert.match(html, /<div id="view-mouth" class="view-section active">\s*<details class="tour-strike" open>/);
});

test('eviction and power-cut selectors follow the relocated tools without hiding their exit', () => {
    assert.ok(css.includes('.evidence-bag:has(.host-eviction[open]) > #goblin-face'));
    assert.ok(css.includes('#main-ui:has(.map-hole[open]) > :not(.confiscated-interface)'));
    assert.ok(css.includes('.evidence-bag:has(.map-hole[open]) > :not(.tunnel-map)'));
    assert.ok(css.includes('.tunnel-map:has(.map-hole[open]) > :not(.map-hole)'));
    assert.doesNotMatch(css, /#main-ui:has\(\.map-hole\[open\]\) > :not\(\.tunnel-map\)/);
    assert.match(css, /\.confiscated-interface > summary:focus-visible/);
});
