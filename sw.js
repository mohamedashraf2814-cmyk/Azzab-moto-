/* AZZAB MOTO service worker — offline shell + fast repeat visits */
const VERSION = "mvoj0q83";
const SHELL = `azzab-shell-${VERSION}`;
const RUNTIME = `azzab-rt-${VERSION}`;
const PRECACHE = ["/", "/index.html", "/assets/dist/app.min.js", "/assets/dist/styles.min.css", "/assets/brand/azzab-logo.webp", "/manifest.webmanifest", "/assets/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => ![SHELL, RUNTIME].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trim(name, max) { const c = await caches.open(name); const keys = await c.keys(); for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]); }

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // page navigations: network first, fall back to the cached app shell (works offline)
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(SHELL).then((c) => c.put("/index.html", copy)); return res; }).catch(() => caches.match("/index.html")));
    return;
  }
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  const isAsset = sameOrigin && /\.(js|css|svg|png|jpe?g|webp|avif|woff2?|webmanifest)$/.test(url.pathname);
  if (!isAsset && !isFont) return;
  // stale-while-revalidate for assets and fonts
  e.respondWith(caches.open(RUNTIME).then(async (c) => {
    const hit = await c.match(req);
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) { c.put(req, res.clone()); trim(RUNTIME, 400); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
