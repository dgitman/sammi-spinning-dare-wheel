import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8');

function game() {
  const context2d = new Proxy({}, { get: () => () => {} });
  const elements = {
    '#wheel': { width: 900, height: 900, getContext: () => context2d, setAttribute() {} },
    '#spin': { disabled: false, addEventListener: (_, handler) => { elements.click = handler; } },
    '#result': { textContent: '' },
    '#count': {},
    '#remaining-label': {},
    '#result-card': { classList: { add() {}, remove() {}, toggle() {} } },
    '#pack': { value: 'all', addEventListener() {} },
    '#difficulty': { value: 'all', addEventListener() {} },
    '#sound': { checked: true },
    '#motion': { checked: false },
    '#loading': { classList: { add() {} } },
  };
  const frames = [];
  const context = createContext({
    document: { readyState: 'complete', querySelector: (selector) => elements[selector] },
    performance: { now: () => 0 },
    requestAnimationFrame: (callback) => frames.push(callback),
  });
  runInContext(source, context);
  return { context, elements, frames };
}

function finish(game, now = 4300) {
  game.elements.click();
  game.elements.click();
  assert.equal(game.frames.length, 1);
  assert.equal(game.elements['#pack'].disabled, true);
  game.frames.shift()(now);
  assert.equal(game.elements['#spin'].disabled, false);
  assert.equal(game.elements['#pack'].disabled, false);
  const text = game.elements['#result'].textContent;
  assert.ok(typeof text === 'string' && text.length > 0);
  assert.notEqual(text, 'The wheel is choosing…');
  // Independently calculate which drawn segment is underneath the pointer.
  const pointerText = runInContext(`active[Math.floor(((fullTurn - rotation) % fullTurn) / (fullTurn / active.length))].text`, game.context);
  assert.equal(text, pointerText);
  return text;
}

test('all 108 dares appear once per round and the next round restarts', () => {
  const instance = game(), seen = new Set();
  for (let i = 0; i < 108; i++) {
    const text = finish(instance);
    assert.ok(!seen.has(text), 'dare repeated before the round ended');
    seen.add(text);
    assert.equal(instance.elements['#count'].textContent, 107 - i);
  }
  assert.equal(seen.size, 108);
  finish(instance);
  assert.equal(instance.elements['#count'].textContent, 107);
});

test('every pack and difficulty has playable, correctly filtered dares', () => {
  for (const pack of ['all', 'party', 'funny', 'creative', 'friends']) {
    for (const difficulty of ['all', 'easy', 'bold']) {
      const instance = game();
      instance.elements['#pack'].value = pack;
      instance.elements['#difficulty'].value = difficulty;
      runInContext('configure()', instance.context);
      const entries = runInContext('active', instance.context);
      assert.ok(entries.length > 0, `${pack}/${difficulty} is empty`);
      for (const dare of entries) {
        assert.ok(pack === 'all' || dare.pack === pack);
        assert.ok(difficulty === 'all' || dare.difficulty === difficulty);
      }
      const seen = new Set();
      for (let i = 0; i < entries.length; i++) {
        const text = finish(instance);
        assert.ok(!seen.has(text)); seen.add(text);
      }
    }
  }
});

test('switching packs preserves history and reduced motion still reveals a dare', () => {
  const instance = game();
  const first = finish(instance);
  instance.elements['#pack'].value = 'friends';
  runInContext('configure()', instance.context);
  instance.elements['#pack'].value = 'all';
  runInContext('configure()', instance.context);
  assert.equal(instance.elements['#count'].textContent, 107);
  instance.elements['#motion'].checked = true;
  assert.notEqual(finish(instance, 180), first);
});

test('unavailable audio never interrupts a spin', () => {
  const instance = game();
  instance.elements['#sound'].checked = true;
  finish(instance);
});
