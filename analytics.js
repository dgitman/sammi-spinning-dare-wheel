// Keep analytics configuration queued in the HTML; load the library after initial rendering.
function loadAnalytics() {
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-N8BSKY8S4B';
  script.async = true;
  document.head.append(script);
}
function scheduleAnalytics() {
  if ('requestIdleCallback' in window) window.requestIdleCallback(loadAnalytics, { timeout: 1500 });
  else window.setTimeout(loadAnalytics, 0);
}
if (document.readyState === 'complete') scheduleAnalytics();
else window.addEventListener('load', scheduleAnalytics, { once: true });
