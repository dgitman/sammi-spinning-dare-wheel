import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const pages = [
  ['index.html', 'https://spinningdarewheel.com/'],
  ['party-dare-wheel/index.html', 'https://spinningdarewheel.com/party-dare-wheel/'],
  ['dare-wheel-for-friends/index.html', 'https://spinningdarewheel.com/dare-wheel-for-friends/'],
  ['sleepover-dares/index.html', 'https://spinningdarewheel.com/sleepover-dares/'],
  ['funny-dares/index.html', 'https://spinningdarewheel.com/funny-dares/'],
];

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('every indexable page has unique search metadata and valid JSON-LD', () => {
  const titles = new Set();
  const descriptions = new Set();

  for (const [path, canonical] of pages) {
    const html = read(path);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
    const canonicalHref = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];

    assert.ok(title && title.length <= 60, `${path} needs a concise title`);
    assert.ok(description && description.length >= 100 && description.length <= 160, `${path} needs a useful meta description`);
    assert.equal(canonicalHref, canonical, `${path} canonical mismatch`);
    assert.equal(h1Count, 1, `${path} should have exactly one H1`);
    assert.doesNotThrow(() => JSON.parse(jsonLd), `${path} JSON-LD should parse`);
    assert.ok(!titles.has(title), `${path} title should be unique`);
    assert.ok(!descriptions.has(description), `${path} description should be unique`);
    titles.add(title);
    descriptions.add(description);
  }
});

test('internal guide links resolve to local pages', () => {
  for (const [path] of pages) {
    const html = read(path);
    const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]);
    for (const href of hrefs) {
      if (href === '/' || href.startsWith('/#') || href.startsWith('/assets/') || href === '/styles.css') continue;
      const target = href.endsWith('/') ? `${href.slice(1)}index.html` : href.slice(1);
      assert.doesNotThrow(() => statSync(new URL(`../${target}`, import.meta.url)), `${path} has a broken link to ${href}`);
    }
  }
});

test('crawler files advertise every canonical page', () => {
  const robots = read('robots.txt');
  const sitemap = read('sitemap.xml');
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/spinningdarewheel\.com\/sitemap\.xml/);
  for (const [, canonical] of pages) assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `sitemap missing ${canonical}`);
});

test('optimized background is smaller and performance hints are present', () => {
  const png = statSync(new URL('../assets/sky-background.png', import.meta.url)).size;
  const webp = statSync(new URL('../assets/sky-background.webp', import.meta.url)).size;
  assert.ok(webp < png / 4, 'WebP background should be at least 75% smaller');
  for (const [path] of pages) {
    const html = read(path);
    assert.match(html, /sky-background\.webp/);
    assert.match(html, /display=swap/);
  }
});
