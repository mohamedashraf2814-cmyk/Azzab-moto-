/* AZZAB MOTO — hash router & boot */
(function () {
  "use strict";
  const AZ = window.AZ;
  const { $, $$, ui } = AZ;
  const P = AZ.pages;

  const ROUTES = [
    [/^\/?$/, P.home],
    [/^\/shop\/?$/, P.shop],
    [/^\/motorcycles\/?$/, P.motorcycles],
    [/^\/motorcycles\/([\w-]+)\/?$/, P.model],
    [/^\/products\/([\w-]+)\/?$/, P.product],
    [/^\/categories\/?$/, P.categories],
    [/^\/offers\/?$/, P.offers],
    [/^\/bundles\/?$/, P.bundles],
    [/^\/cart\/?$/, P.cart],
    [/^\/checkout\/?$/, P.checkout],
    [/^\/order-success\/?$/, P.success],
    [/^\/track-order\/?$/, P.track],
    [/^\/wishlist\/?$/, P.wishlist],
    [/^\/login\/?$/, P.login],
    [/^\/register\/?$/, P.register],
    [/^\/account\/?$/, P.account],
    [/^\/account\/orders\/?$/, P.accountOrders],
    [/^\/garage\/?$/, P.garage],
    [/^\/about\/?$/, P.about],
    [/^\/contact\/?$/, P.contact],
    [/^\/faq\/?$/, P.faq],
    [/^\/policies\/([\w-]+)\/?$/, P.policy],
    [/^\/credits\/?$/, P.credits],
  ];

  let mode = null; // "store" | "admin"
  let cleanup = null;
  let lastPath = null;

  function parse() {
    if (AZ.PATH_MODE) {
      if (location.hash.startsWith("#/")) history.replaceState(null, "", location.hash.slice(1));
      return { path: decodeURIComponent(location.pathname) || "/", query: location.search.slice(1) };
    }
    const h = location.hash || "#/";
    const raw = h.startsWith("#/") ? h.slice(1) : "/";
    const [path, query = ""] = raw.split("?");
    return { path: decodeURIComponent(path), query };
  }

  function teardown() {
    if (typeof cleanup === "function") { try { cleanup(); } catch (e) { console.error(e); } }
    cleanup = null;
    AZ.emit("route-leave");
    AZ.clearPage();
  }

  function route() {
    const h = location.hash;
    if (!AZ.PATH_MODE && h && !h.startsWith("#/")) { const el = document.getElementById(h.slice(1)); if (el) el.focus(); return; }
    const { path, query } = parse();
    const app = $("#app");
    teardown();

    // ---------- admin ----------
    const am = path.match(/^\/admin(?:\/([\w-]+))?\/?$/);
    if (am && !AZ.admin) {
      const appSrc = document.querySelector('script[src*="app"]').src; const isMin = /app\.min\.js/.test(appSrc);
    const s = document.createElement("script"); s.src = appSrc.replace(/app(\.min)?\.js/, isMin ? "admin.min.js" : "admin.js"); s.onload = route; document.body.appendChild(s);
      $("#app").innerHTML = `<div style="min-height:60vh;display:grid;place-items:center">جاري تحميل لوحة التحكم…</div>`; mode = null;
      return;
    }
    if (am) {
      mode = "admin";
      document.body.style.overflow = "";
      app.innerHTML = AZ.admin.render(am[1] || "overview");
      document.title = "لوحة التحكم | عزاب موتو";
      AZ.admin.mount(app, am[1] || "overview");
      if (AZ.PATH_MODE) ui.rewriteLinks(app);
      AZ.seo.apply({ noindex: true }, path, query);
      window.scrollTo(0, 0);
      lastPath = path;
      return;
    }

    // ---------- store ----------
    if (mode !== "store") {
      app.innerHTML = ui.shell();
      mode = "store";
      ui.refreshCounts();
      ui.garageBar();
    }
    ui.closeAll(true);
    const wipe = $("[data-wipe]");
    if (false && wipe) {
      wipe.animate([{ clipPath: "inset(0 0 0 0)", opacity: 1 }, { clipPath: "inset(0 0 0 100%)", opacity: 1 }], { duration: 650, easing: "cubic-bezier(.7,0,.2,1)" });
    }
    let page = P.notFound, params = [];
    for (const [re, pg] of ROUTES) { const m = path.match(re); if (m) { page = pg; params = m.slice(1); break; } }
    const main = $("#main");
    main.classList.remove("page-enter"); void main.offsetWidth;
    main.innerHTML = page.render(params, query);
    main.classList.add("page-enter");
    document.title = typeof page.title === "function" ? page.title(params) : page.title || "عزاب موتو";
    if (page.mount) cleanup = page.mount(main, params, query) || null;
    ui.observe(main);
    if (AZ.PATH_MODE) ui.rewriteLinks(app);
    requestAnimationFrame(ui.measure);
    AZ.seo.apply(page.seo ? page.seo(params, query) : null, path, query);
    ui.magnetic(main);
    // active nav
    const base = "#" + (path === "/" ? "/" : "/" + path.split("/")[1]);
    $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === base));
    if (lastPath !== path) window.scrollTo({ top: 0, behavior: "auto" });
    lastPath = path;
  }
  AZ.router = route;

  function boot() {
    ui.bindGlobal();
    window.addEventListener("hashchange", route);
    if (AZ.PATH_MODE) {
      window.addEventListener("popstate", route);
      document.addEventListener("click", (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest("a[href]"); if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
        let href = a.getAttribute("href");
        if (href.startsWith("#/")) href = href.slice(1);
        if (!href.startsWith("/") || href.startsWith("//") || /\.[a-z0-9]+(\?|$)/i.test(href.split("?")[0])) return;
        e.preventDefault();
        if (href !== location.pathname + location.search) history.pushState(null, "", href);
        route();
      });
      if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
    }
    AZ.on("auth", () => { if (/^\/(account|login|register)/.test(parse().path)) route(); });
    route();
    const loader = $("#loader");
    if (loader) loader.remove();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
