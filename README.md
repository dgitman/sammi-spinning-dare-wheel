# Spinning Dare Wheel

A dependency-free static site published with GitHub Pages.

Live site: https://spinningdarewheel.com/

The site consists of:

- `index.html` — page structure and analytics
- `styles.css` — layout and visual design
- `game.js` — wheel behavior and dare list
- `assets/sky-background.png` — page background
- `assets/favicon.png` — browser icon
- `assets/social-share.png` — Open Graph and social sharing image

To run it locally, serve the repository directory with any static HTTP server.

SEO metadata is embedded in each HTML page: canonical URLs, search descriptions, Open Graph/Twitter cards, and JSON-LD. The home page describes the WebSite, WebApplication, and WebPage; guide pages include WebPage and BreadcrumbList markup matching visible breadcrumbs.

`sitemap.xml` lists all five canonical pages. Update a page's `lastmod` only when its content changes, and keep its JSON-LD `dateModified` consistent. `robots.txt` allows public pages and rendering assets and advertises the sitemap.

Run checks with `node --test tests/*.test.mjs`. After publishing, validate structured data and inspect the deployed URLs in Google Search Console, then submit `https://spinningdarewheel.com/sitemap.xml`. App rich results require real reviews or ratings; none are claimed here.
