import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const source = readFileSync(new URL('../analytics.js', import.meta.url), 'utf8');
for (const idleSupported of [true, false]) {
  test(`analytics waits for page load and schedules without blocking (idle=${idleSupported})`, () => {
    let onLoad, scheduled;
    const scripts = [];
    const window = {
      addEventListener: (event, handler, options) => { assert.equal(event, 'load'); assert.equal(options.once, true); onLoad = handler; },
      setTimeout: handler => { scheduled = handler; },
    };
    if (idleSupported) window.requestIdleCallback = handler => { scheduled = handler; };
    runInNewContext(source, {
      window,
      document: { readyState: 'loading', createElement: () => ({}), head: { append: script => scripts.push(script) } },
    });
    assert.equal(scripts.length, 0);
    assert.equal(scheduled, undefined);
    onLoad();
    assert.equal(scripts.length, 0);
    scheduled();
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].async, true);
    assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-N8BSKY8S4B');
  });
}
