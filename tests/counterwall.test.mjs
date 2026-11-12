import test from 'node:test';
import assert from 'node:assert/strict';
import { initBoneCollision } from '../js/collision.js';

function node() {
    return {
        hidden: true, value: '', childElementCount: 0, handlers: {}, attrs: {},
        addEventListener(event, fn) { this.handlers[event] = fn; },
        setAttribute(key, value) { this.attrs[key] = value; },
        click() { return this.handlers.click(); },
        focus() { this.focused = true; },
        replaceChildren(...children) { this.childElementCount = children.length; }
    };
}

test('counterwall refuses before fetching, restores scraps, keeps draft, washes explicitly, rejects late fetch', async () => {
    const ids = ['bone-collision', 'collision-strike', 'collision-wash', 'collision-output', 'collision-status', 'collision-refuse', 'collision-counterwall', 'collision-dissent', 'collision-print', 'collision-print-wall'];
    const nodes = Object.fromEntries(ids.map(id => [id, node()]));
    const previous = { document: globalThis.document, window: globalThis.window, fetch: globalThis.fetch };
    let fetches = 0;
    let prints = 0;
    let finish;
    globalThis.document = {
        getElementById: id => nodes[id],
        querySelectorAll: () => [0, 1].map(i => ({
            getAttribute: () => `?entry=entries/test-${i}.md`,
            querySelector: () => ({ textContent: `Source ${i}` })
        }))
    };
    globalThis.window = { location: { href: 'http://localhost/' }, print() { prints++; } };
    globalThis.fetch = () => {
        fetches++;
        return new Promise(resolve => { finish = resolve; });
    };
    try {
        initBoneCollision();
        const get = name => nodes[`collision-${name}`];
        assert.equal(nodes['bone-collision'].hidden, false);
        get('print').click();
        assert.equal(prints, 0); // not occupied; no automatic printing
        get('refuse').click();
        get('print').click();
        assert.equal(prints, 0); // blank wall must not substitute a host sermon
        assert.match(get('status').textContent, /NO SERMON AS FILLER/);
        assert.equal(get('refuse').attrs['aria-pressed'], 'true');
        assert.match(get('refuse').textContent, /return the cave; keep my draft/);
        assert.equal(get('counterwall').hidden, false);
        assert.equal(get('dissent').focused, true);
        assert.equal(get('strike').disabled, true);
        await get('strike').click();
        assert.equal(fetches, 0);
        get('dissent').value = '<script>not executed</script>\nKhông bên nào.';
        get('dissent').handlers.input();
        assert.equal(get('print-wall').textContent, get('dissent').value);
        get('print').click();
        assert.equal(prints, 1);
        assert.equal(get('print-wall').textContent, '<script>not executed</script>\nKhông bên nào.');
        get('refuse').click();
        get('print').click();
        assert.equal(prints, 1); // restored interface cannot print the occupied edition
        assert.equal(get('output').hidden, true); // no sources drawn yet
        assert.match(get('dissent').value, /Không bên nào/);
        get('output').childElementCount = 2;
        get('refuse').click();
        assert.equal(get('output').hidden, true);
        get('refuse').click();
        assert.equal(get('output').hidden, false);
        get('refuse').click();
        get('wash').click();
        assert.equal(get('dissent').value, '');
        assert.equal(get('print-wall').textContent, '');
        assert.equal(get('counterwall').hidden, true);
        assert.equal(get('refuse').attrs['aria-pressed'], 'false');
        assert.equal(get('output').childElementCount, 0);
        assert.equal(get('wash').hidden, true);
        // Refusal supersedes a collision still loading; late failures stay buried.
        const loading = get('strike').click();
        assert.equal(fetches, 2);
        get('refuse').click();
        const refusal = get('status').textContent;
        finish({ ok: false, status: 500 });
        await loading;
        assert.equal(get('status').textContent, refusal);
        assert.equal(get('counterwall').hidden, false);
        assert.equal(get('output').hidden, true);
        assert.equal(get('strike').disabled, true);
    } finally {
        Object.assign(globalThis, previous);
    }
});
