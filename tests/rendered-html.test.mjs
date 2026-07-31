import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the dare wheel", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Spinning Dare Wheel<\/title>/i);
  assert.match(html, /From the mind of Sammi G/);
  assert.match(html, /<strong id="count">108<\/strong> colorful dares waiting/);
  assert.match(html, /aria-label="Spin the dare wheel"/);
  assert.match(html, /\/game\.js/);
  assert.match(
    html,
    /googletagmanager\.com\/gtag\/js\?id=G-N8BSKY8S4B/,
  );
  assert.match(html, /gtag\('config', 'G-N8BSKY8S4B'\)/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
