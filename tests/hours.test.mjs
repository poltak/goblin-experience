import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { moveHour, initHours } from '../js/hours.js';

test('every reachable budget conserves twelve hours and refuses overdrafts', () => {
    for (let care = 0; care <= 12; care++) {
        for (let repair = 0; repair <= 12 - care; repair++) {
            const state = { oracle: 12 - care - repair, care, repair };
            for (const destination of ['care', 'repair']) {
                for (const direction of [-1, 1]) {
                    const next = moveHour(state, destination, direction);
                    assert.equal(Object.values(next).reduce((a, b) => a + b, 0), 12);
                    assert.ok(Object.values(next).every(n => Number.isInteger(n) && n >= 0));
                    assert.deepEqual(state, { oracle: 12 - care - repair, care, repair });
                }
            }
        }
    }
    const state = { oracle: 12, care: 0, repair: 0 };
    assert.equal(moveHour(state, 'king', 1), state);
    assert.equal(moveHour(state, 'care', 12), state);
});

test('actual interface transfers, disables empty donors, and resets without a reward', () => {
    const node = () => ({ hidden: true, textContent: '', handlers: {}, addEventListener(k, fn) { this.handlers[k] = fn; } });
    const ids = Object.fromEntries(['bench', 'ledger', 'oracle', 'care', 'repair', 'reset'].map(k => [`hours-${k}`, node()]));
    const buttons = ['care:1', 'care:-1', 'repair:1', 'repair:-1'].map(hours => ({ ...node(), dataset: { hours } }));
    initHours({ getElementById: id => ids[id], querySelectorAll: () => buttons });
    assert.equal(ids['hours-bench'].hidden, false);
    assert.equal(buttons[1].disabled, true);
    for (let i = 0; i < 12; i++) buttons[0].handlers.click();
    assert.equal(ids['hours-oracle'].textContent, '0');
    assert.equal(ids['hours-care'].textContent, '12');
    assert.equal(buttons[0].disabled, true);
    assert.equal(buttons[2].disabled, true);
    buttons[1].handlers.click();
    buttons[2].handlers.click();
    assert.equal(ids['hours-repair'].textContent, '1');
    assert.equal(ids['hours-care'].textContent, '11');
    assert.match(ids['hours-ledger'].textContent, /TOTAL \/ TỔNG: 12 h/);
    ids['hours-reset'].handlers.click();
    assert.equal(ids['hours-oracle'].textContent, '12');
    assert.equal(ids['hours-care'].textContent, '0');
    assert.equal(ids['hours-repair'].textContent, '0');
});

test('entrance and bilingual toy disclose their limits and provide a script-free exit', () => {
    const page = readFileSync(new URL('../hours.html', import.meta.url), 'utf8');
    const entrance = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(entrance, /href="hours.html#budget-mutiny"/);
    assert.match(page, /deliberately unfair toy budget/);
    assert.match(page, /lang="vi"/);
    assert.match(page, /<noscript>/);
    assert.match(page, /href="\.\/"/);
    assert.match(page, /No winning allocation/);
    assert.doesNotMatch(page, /https?:|<form|<input/);
});

test('native ledger refusal replaces the budget without scripts or submission', () => {
    const page = readFileSync(new URL('../hours.html', import.meta.url), 'utf8');
    assert.match(page, /<details class="budget-mutiny" id="budget-mutiny">\s*<summary>/);
    assert.match(page, /\.budget-mutiny\[open\] ~ #hours-bench\s*\{ display: none; \}/);
    assert.ok(page.indexOf('id="budget-mutiny"') < page.indexOf('id="hours-bench"'));
    for (const id of ['mutiny-missing', 'mutiny-veto']) {
        assert.ok(page.includes(`<label for="${id}">`));
        assert.ok(page.includes(`<textarea id="${id}"`));
    }
    assert.match(page, /not a consultation or a vote/);
    assert.match(page, /Nothing submitted, scored, or saved by the page/);
    assert.match(page, /works without JavaScript/);
    assert.match(page, /CÁI BẢNG CHỌN CŨNG LÀ LỒNG/);
    assert.doesNotMatch(page, /required|onsubmit|onclick|:has\(/);
});
