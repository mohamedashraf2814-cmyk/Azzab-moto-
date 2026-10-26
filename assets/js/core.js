/* AZZAB MOTO — core runtime: helpers, icons, state, persistence */
(function () {
  "use strict";
  const AZ = (window.AZ = window.AZ || {});
  const D = AZ.data;

  /* ---------------- Config ----------------
   * STORE_WHATSAPP: international format without "+" (e.g. "2010XXXXXXXX").
   * Leave empty until the store provides its official number; it can also be
   * set from Admin › Settings (saved in this browser only). */
  AZ.config = {
    STORE_NAME: "عزاب موتو",
    STORE_NAME_EN: "AZZAB MOTO",
    STORE_WHATSAPP: "201141334668",
    AUTHORIZED_DEALER: true,
    DEALER_LABEL: "وكيل معتمد TVS",
    ADMIN_DEMO_PASSWORD: "admin123",
    STORAGE_PREFIX: "azzab:v1:",
  };

  /* ---------------- Routing helpers ----------------
   * "path" mode (deployed site): clean URLs like /products/slug — needs the host to
   * rewrite unknown paths to index.html (vercel.json / _redirects / 404.html included).
   * "hash" mode (file://, previews): #/products/slug. Templates always write "#/…";
   * in path mode links are rewritten and clicks intercepted. */
  AZ.PATH_MODE = (() => { const m = document.querySelector('meta[name="az-routing"]'); return !!m && m.content === "path" && /^https?:$/.test(location.protocol); })();
  AZ.href = (h) => (AZ.PATH_MODE && h && h.startsWith("#/") ? h.slice(1) : h);
  AZ.go = (h) => { if (AZ.PATH_MODE) { history.pushState(null, "", AZ.href(h)); if (AZ.router) AZ.router(); } else location.hash = h; };
  AZ.replaceUrl = (h) => history.replaceState(null, "", AZ.href(h));

  /* ---------------- DOM helpers ---------------- */
  AZ.$ = (s, r = document) => r.querySelector(s);
  AZ.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  AZ.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ESC[c]);
  AZ.money = (n) => `${Math.round(Number(n) || 0).toLocaleString("en-US")} <small>ج.م</small>`;
  AZ.moneyText = (n) => `${Math.round(Number(n) || 0).toLocaleString("en-US")} ج.م`;
  AZ.date = (iso) => new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  AZ.dateShort = (iso) => new Date(iso).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  AZ.reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  AZ.debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  AZ.uid = () => Math.random().toString(36).slice(2, 9);

  /* ---------------- Icons (stroke, 24px grid) ---------------- */
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>',
    heart: '<path d="M12 20s-7.5-4.4-9.3-9.2C1.5 7.5 3.6 4.5 6.9 4.5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.3 0 5.4 3 4.2 6.3C19.5 15.6 12 20 12 20Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    chevU: '<path d="m18 15-6-6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    truck: '<path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 4 6v6c0 4.6 3.4 8 8 9 4.6-1 8-4.4 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    seal: '<path d="m12 2 2.4 1.8 3 .1.9 2.8 2.4 1.8-.9 2.9.9 2.8-2.4 1.8-.9 2.8-3 .1L12 21l-2.4-1.8-3-.1-.9-2.8-2.4-1.8.9-2.8-.9-2.9 2.4-1.8.9-2.8 3-.1L12 2Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z"/>',
    phone: '<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.6"/>',
    package: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.3l8 4.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.4a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 16v-5M12 16V8M16 16v-3M20 16V6"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.3.6 3.5 2.8 3.5 6"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8" r="1.5"/>',
    ticket: '<path d="M3 8V6h18v2a2.5 2.5 0 0 0 0 5v2H3v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M14 6v2M14 11v2M14 16v2"/>',
    bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h5l4.5 7.5M12 9 10 5H8M14 9l2-3h2.5"/><path d="M9 9l3 7.5h1"/>',
    boxes: '<path d="M3 12h8v9H3zM13 12h8v9h-8zM8 3h8v9H8z"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    facebook: '<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3.5h2V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15V3Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    youtube: '<path d="M21.5 8.2a2.8 2.8 0 0 0-2-2C17.8 5.7 12 5.7 12 5.7s-5.8 0-7.5.5a2.8 2.8 0 0 0-2 2C2 9.9 2 12 2 12s0 2.1.5 3.8a2.8 2.8 0 0 0 2 2c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.8 2.8 0 0 0 2-2c.5-1.7.5-3.8.5-3.8s0-2.1-.5-3.8Z"/><path d="m10 15 5-3-5-3v6Z"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.4 4.4 5 4.6"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    camera: '<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="4"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M20 20c0 1-1 2-3 2h-3"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4"/>',
    home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z"/>',
    store: '<path d="M3 9 5 4h14l2 5M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9ZM5 13v8h14v-8M10 21v-5h4v5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    alert: '<path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17v.5"/>',
    sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
    gauge: '<path d="M12 14l4-5"/><path d="M3.5 18a9 9 0 1 1 17 0"/><circle cx="12" cy="14" r="1.5"/>',
    garage: '<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 16h10"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3"/><path d="M5 3v5h5M19 21v-5h-5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9v.01M18 15v.01"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/>',
    whatsapp: '<path fill="currentColor" stroke="none" d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2.1 22l5.36-1.4a9.8 9.8 0 0 0 4.58 1.16h.01c5.43 0 9.84-4.41 9.84-9.84A9.86 9.86 0 0 0 12.04 2Zm0 18.1h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.18.83.85-3.1-.2-.32a8.16 8.16 0 0 1-1.25-4.36c0-4.52 3.68-8.2 8.27-8.2a8.2 8.2 0 0 1 8.2 8.21c0 4.53-3.69 8.26-8.21 8.26Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.04-.39-1.98-1.23-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.38.1-.5.12-.12.25-.3.37-.45.13-.15.17-.25.25-.42.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.66.31c-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.15-1.17-.06-.1-.23-.17-.48-.29Z"/>',
  };
  AZ.icon = (name, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;

  /* ---------------- Persistence ---------------- */
  const KEY = (k) => AZ.config.STORAGE_PREFIX + k;
  AZ.storage = {
    get(k, fallback) {
      try { const v = localStorage.getItem(KEY(k)); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(k, v) {
      try { localStorage.setItem(KEY(k), JSON.stringify(v)); return true; } catch (e) { return false; }
    },
    remove(k) { try { localStorage.removeItem(KEY(k)); } catch (e) {} },
  };

  /* ---------------- Event bus ---------------- */
  const listeners = {};
  AZ.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  AZ.emit = (ev, data) => (listeners[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } });
  AZ.off = (ev, fn) => { listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn); };
  // listeners that live only while the current page is mounted
  let pageSubs = [];
  AZ.onPage = (ev, fn) => { AZ.on(ev, fn); pageSubs.push([ev, fn]); };
  AZ.clearPage = () => { pageSubs.forEach(([ev, fn]) => AZ.off(ev, fn)); pageSubs = []; };

  /* ---------------- Settings ---------------- */
  AZ.settings = {
    get() { const s = Object.assign({ whatsapp: AZ.config.STORE_WHATSAPP, phone: "", email: "", address: "", hours: "يوميًا من 10 صباحًا حتى 10 مساءً" }, AZ.storage.get("settings", {})); if (!s.whatsapp) s.whatsapp = AZ.config.STORE_WHATSAPP; return s; },
    save(s) { AZ.storage.set("settings", s); AZ.emit("settings"); },
  };

  /* ---------------- Catalog (seed + admin edits) ---------------- */
  AZ.catalog = {
    products() {
      if (!this._p) this._p = AZ.storage.get("products", null) || D.products.map((p) => ({ ...p }));
      return this._p;
    },
    saveProducts(list) { this._p = list; AZ.storage.set("products", list); this._index = null; AZ.emit("catalog"); },
    categories() {
      if (!this._c) this._c = AZ.storage.get("categories", null) || D.categories.map((c) => ({ ...c }));
      return this._c;
    },
    saveCategories(list) { this._c = list; AZ.storage.set("categories", list); AZ.emit("catalog"); },
    reset() { AZ.storage.remove("products"); AZ.storage.remove("categories"); this._p = null; this._c = null; this._index = null; AZ.emit("catalog"); },
    byId(id) { return this.products().find((p) => p.id === id); },
    bySlug(slug) { return this.products().find((p) => p.slug === slug); },
    category(id) { return this.categories().find((c) => c.id === id); },
    model(slug) { return D.models.find((m) => m.slug === slug); },
    forModel(slug, year) {
      return this.products().filter((p) => p.compat.some((c) => c.model === slug && (!year || c.years.includes(Number(year)))));
    },
    fits(p, g) {
      if (!g) return null;
      return p.compat.some((c) => c.model === g.model && (!g.year || c.years.includes(Number(g.year))));
    },
    compatNames(p, max = 2) {
      const names = p.compat.map((c) => (D.models.find((m) => m.slug === c.model) || {}).short).filter(Boolean);
      if (names.length >= D.models.length - 2) return "يناسب معظم موديلات TVS";
      return names.length > max ? `${names.slice(0, max).join("، ")} +${names.length - max}` : names.join("، ");
    },
    search(q, limit = 8) {
      q = norm(q);
      if (!q) return [];
      const terms = q.split(/\s+/).filter(Boolean);
      return this.products()
        .map((p) => {
          const hay = this._hay(p);
          let score = 0;
          for (const t of terms) { if (!hay.includes(t)) return null; score += hay.indexOf(t) === 0 ? 3 : 1; }
          if (norm(p.sku) === q || norm(p.partNumber) === q) score += 50;
          return { p, score: score + p.popularity / 1000 };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.p);
    },
    _hay(p) {
      if (!this._index) this._index = new Map();
      let h = this._index.get(p.id);
      if (!h) {
        const models = p.compat.map((c) => { const m = D.models.find((x) => x.slug === c.model); return m ? m.name : ""; }).join(" ");
        const cat = (this.category(p.category) || {}).name || "";
        h = norm(`${p.name} ${p.sku} ${p.partNumber} ${p.brand} ${cat} ${models}`);
        this._index.set(p.id, h);
      }
      return h;
    },
  };
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[ً-ْ]/g, "").replace(/\s+/g, " ").trim();
  }
  AZ.norm = norm;

  /* ---------------- Cart ---------------- */
  AZ.cart = {
    items() { return AZ.storage.get("cart", []); },
    _save(items) { AZ.storage.set("cart", items); AZ.emit("cart", items); },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    add(id, qty = 1) {
      const p = AZ.catalog.byId(id);
      if (!p || p.stock <= 0) { AZ.toast("المنتج غير متوفر حاليًا", { type: "error" }); return false; }
      const items = this.items();
      const it = items.find((i) => i.id === id);
      const next = Math.min((it ? it.qty : 0) + qty, p.stock);
      if (it) it.qty = next; else items.push({ id, qty: Math.min(qty, p.stock) });
      this._save(items);
      return true;
    },
    setQty(id, qty) {
      const p = AZ.catalog.byId(id);
      let items = this.items();
      if (qty <= 0) items = items.filter((i) => i.id !== id);
      else { const it = items.find((i) => i.id === id); if (it) it.qty = Math.min(qty, p ? p.stock : qty); }
      this._save(items);
    },
    remove(id) { this._save(this.items().filter((i) => i.id !== id)); },
    clear() { AZ.storage.remove("coupon"); AZ.storage.remove("bundles"); this._save([]); },
    lines() {
      return this.items().map((i) => ({ ...i, product: AZ.catalog.byId(i.id) })).filter((l) => l.product);
    },
    coupon() { return AZ.storage.get("coupon", null); },
    applyCoupon(code) {
      code = String(code || "").trim().toUpperCase();
      const list = AZ.storage.get("coupons", null) || D.coupons;
      const c = list.find((x) => x.code === code && x.active);
      if (!c) return { ok: false, msg: "الكود غير صحيح أو منتهي" };
      const sub = this.subtotal();
      if (sub < c.min) return { ok: false, msg: `الكود يتطلب حد أدنى ${AZ.moneyText(c.min)}` };
      AZ.storage.set("coupon", c.code); AZ.emit("cart");
      return { ok: true, msg: c.label };
    },
    removeCoupon() { AZ.storage.remove("coupon"); AZ.emit("cart"); },
    subtotal(lines = this.lines()) { return lines.reduce((s, l) => s + l.product.price * l.qty, 0); },
    totals(gov) {
      const lines = this.lines();
      const subtotal = this.subtotal(lines);
      const list = AZ.storage.get("coupons", null) || D.coupons;
      const code = this.coupon();
      let c = code ? list.find((x) => x.code === code && x.active) : null;
      if (c && subtotal < c.min) c = null;
      let discount = 0;
      if (c && c.type === "percent") discount = Math.min(Math.round((subtotal * c.value) / 100), c.max || Infinity);
      if (c && c.type === "fixed") discount = Math.min(c.value, subtotal);
      const zone = D.shipping.find((s) => s.gov === gov);
      let shipping = zone ? zone.fee : null;
      const free = subtotal >= D.FREE_SHIPPING_OVER || (c && c.type === "shipping");
      if (free) shipping = 0;
      // maintenance bundles: discount applies while every item of an added bundle is in the cart
      const bundles = [...new Set(AZ.storage.get("bundles", []))].map((id) => D.bundles.find((b) => b.id === id)).filter(Boolean)
        .filter((b) => b.productIds.every((pid) => lines.some((l) => l.product.id === pid)));
      const bundleDiscount = bundles.reduce((s, b) => s + b.savings, 0);
      const total = Math.max(0, subtotal - discount - bundleDiscount + (shipping || 0));
      return { lines, subtotal, discount, coupon: c, bundles, bundleDiscount, shipping, free, zone, total, remainingFree: Math.max(0, D.FREE_SHIPPING_OVER - subtotal) };
    },
  };

  /* ---------------- Wishlist ---------------- */
  AZ.wish = {
    ids() { return AZ.storage.get("wishlist", []); },
    has(id) { return this.ids().includes(id); },
    toggle(id) {
      const ids = this.ids();
      const i = ids.indexOf(id);
      if (i >= 0) ids.splice(i, 1); else ids.unshift(id);
      AZ.storage.set("wishlist", ids); AZ.emit("wishlist", ids);
      return i < 0;
    },
  };

  /* ---------------- Garage ---------------- */
  AZ.garage = {
    list() { return AZ.storage.get("garage", []); },
    active() { const l = this.list(); const i = AZ.storage.get("garageActive", 0); return l[i] || l[0] || null; },
    activeIndex() { return AZ.storage.get("garageActive", 0); },
    add(model, year) {
      const l = this.list();
      let idx = l.findIndex((g) => g.model === model && String(g.year || "") === String(year || ""));
      if (idx < 0) { l.push({ id: AZ.uid(), model, year: year ? Number(year) : null }); idx = l.length - 1; }
      AZ.storage.set("garage", l); AZ.storage.set("garageActive", idx); AZ.emit("garage");
    },
    setActive(i) { AZ.storage.set("garageActive", i); AZ.emit("garage"); },
    remove(id) {
      const l = this.list().filter((g) => g.id !== id);
      AZ.storage.set("garage", l); AZ.storage.set("garageActive", 0); AZ.emit("garage");
    },
    clearActive() { AZ.storage.set("garageActive", -1); AZ.emit("garage"); },
  };

  /* ---------------- Auth (simulated, local only) ---------------- */
  AZ.auth = {
    user() { return AZ.storage.get("session", null); },
    users() { return AZ.storage.get("users", []); },
    register(u) {
      const users = this.users();
      if (users.some((x) => x.phone === u.phone)) return { ok: false, msg: "رقم الموبايل مسجل بالفعل" };
      const user = { id: AZ.uid(), name: u.name, phone: u.phone, email: u.email || "", pass: btoa(unescape(encodeURIComponent(u.password))), created: new Date().toISOString() };
      users.push(user); AZ.storage.set("users", users);
      this._login(user); return { ok: true };
    },
    login(phone, password) {
      const u = this.users().find((x) => x.phone === phone && x.pass === btoa(unescape(encodeURIComponent(password))));
      if (!u) return { ok: false, msg: "بيانات الدخول غير صحيحة" };
      this._login(u); return { ok: true };
    },
    _login(u) { AZ.storage.set("session", { id: u.id, name: u.name, phone: u.phone, email: u.email }); AZ.emit("auth"); },
    update(fields) {
      const s = this.user(); if (!s) return;
      const users = this.users(); const u = users.find((x) => x.id === s.id);
      Object.assign(s, fields); if (u) Object.assign(u, fields);
      AZ.storage.set("users", users); AZ.storage.set("session", s); AZ.emit("auth");
    },
    logout() { AZ.storage.remove("session"); AZ.emit("auth"); },
  };

  /* ---------------- Orders ---------------- */
  AZ.orders = {
    all() {
      if (!this._o) this._o = AZ.storage.get("orders", null) || D.orders.map((o) => JSON.parse(JSON.stringify(o)));
      return this._o;
    },
    save(list) { this._o = list; AZ.storage.set("orders", list); AZ.emit("orders"); },
    find(id) { return this.all().find((o) => o.id.toLowerCase() === String(id || "").trim().toLowerCase()); },
    mine() {
      const u = AZ.auth.user();
      const device = AZ.storage.get("myOrders", []);
      return this.all().filter((o) => device.includes(o.id) || (u && o.userId === u.id));
    },
    create(customer, totals) {
      const id = `AZ-${String(Date.now()).slice(-6)}${Math.floor(Math.random() * 9)}`;
      const u = AZ.auth.user();
      const order = {
        id, date: new Date().toISOString(), customer, userId: u ? u.id : null,
        items: totals.lines.map((l) => ({ id: l.product.id, name: l.product.name, sku: l.product.sku, price: l.product.price, qty: l.qty, image: l.product.image })),
        subtotal: totals.subtotal, discount: totals.discount + (totals.bundleDiscount || 0), coupon: totals.coupon ? totals.coupon.code : null,
        bundles: (totals.bundles || []).map((b) => b.name),
        shipping: totals.shipping || 0, total: totals.total, payment: "cod", status: "pending", notification: "not-sent",
      };
      const list = this.all(); list.unshift(order); this.save(list);
      const mine = AZ.storage.get("myOrders", []); mine.unshift(id); AZ.storage.set("myOrders", mine);
      // decrement local inventory (demo)
      const prods = AZ.catalog.products();
      order.items.forEach((it) => { const p = prods.find((x) => x.id === it.id); if (p) p.stock = Math.max(0, p.stock - it.qty); });
      AZ.catalog.saveProducts(prods);
      return order;
    },
    update(id, fields) { const list = this.all(); const o = list.find((x) => x.id === id); if (o) Object.assign(o, fields); this.save(list); },
  };

  /* ---------------- WhatsApp (manual, no automation) ---------------- */
  AZ.wa = {
    link(text) {
      const n = String(AZ.settings.get().whatsapp || "").replace(/\D/g, "");
      return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
    },
    configured() { return !!String(AZ.settings.get().whatsapp || "").replace(/\D/g, ""); },
    orderText(o) {
      const lines = o.items.map((i) => `• ${i.name} × ${i.qty} — ${AZ.moneyText(i.price * i.qty)}`).join("\n");
      return `مرحبًا عزاب موتو 👋\nأود تأكيد طلبي رقم ${o.id}\n\n${lines}\n\nالإجمالي: ${AZ.moneyText(o.total)} (الدفع عند الاستلام)\nالاسم: ${o.customer.name}\nالموبايل: ${o.customer.phone}\nالعنوان: ${o.customer.gov} — ${o.customer.city} — ${o.customer.address}`;
    },
  };

  /* ---------------- External links (real <a> so popup blockers allow it) ---------------- */
  AZ.openExternal = (url) => {
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  };

  /* ---------------- In-page confirm dialog ---------------- */
  AZ.confirm = (message, onYes, yesLabel = "تأكيد") => {
    const wrap = document.createElement("div");
    wrap.className = "confirm-wrap";
    wrap.innerHTML = `<div class="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="cfm-t"><p id="cfm-t">${AZ.esc(message)}</p><div class="flex gap-8"><button class="btn btn-dark" data-yes>${AZ.esc(yesLabel)}</button><button class="btn btn-outline" data-no>إلغاء</button></div></div>`;
    document.body.appendChild(wrap);
    const close = () => { wrap.remove(); document.removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", key);
    wrap.addEventListener("click", (e) => {
      if (e.target.closest("[data-yes]")) { close(); onYes(); }
      else if (e.target.closest("[data-no]") || e.target === wrap) close();
    });
    wrap.querySelector("[data-yes]").focus();
  };

  /* ---------------- SEO: per-page meta + structured data ---------------- */
  AZ.seo = {
    DEFAULT_DESC: "عزاب موتو — وكيل معتمد لقطع غيار TVS في مصر. قطع غيار أصلية وبديلة لكل موديلات TVS: Apache وRonin وRaider وStar HLX وNTORQ وJupiter وXL100 والتوك توك King. الدفع عند الاستلام والشحن لكل المحافظات.",
    origin() { return (document.querySelector('meta[name="az-site"]') || {}).content || location.origin; },
    abs(u) { if (!u) return u; if (/^https?:/.test(u)) return u; return this.origin().replace(/\/$/, "") + "/" + u.replace(/^\//, ""); },
    meta(attr, key, val) {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", val);
    },
    apply(info, path, query) {
      info = info || {};
      const title = document.title;
      const desc = (info.description || this.DEFAULT_DESC).replace(/\s+/g, " ").trim().slice(0, 300);
      const url = this.origin().replace(/\/$/, "") + (path === "/" ? "/" : path) + (info.keepQuery && query ? `?${query}` : "");
      const img = this.abs(info.image || "assets/brand/og-image.jpg");
      this.meta("name", "description", desc);
      this.meta("name", "robots", info.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
      this.meta("property", "og:title", title); this.meta("property", "og:description", desc);
      this.meta("property", "og:url", url); this.meta("property", "og:image", img); this.meta("property", "og:type", info.type || "website");
      this.meta("name", "twitter:title", title); this.meta("name", "twitter:description", desc); this.meta("name", "twitter:image", img);
      let can = document.head.querySelector('link[rel="canonical"]');
      if (!can) { can = document.createElement("link"); can.rel = "canonical"; document.head.appendChild(can); }
      can.href = url;
      let ld = document.getElementById("ld-page");
      if (!ld) { ld = document.createElement("script"); ld.type = "application/ld+json"; ld.id = "ld-page"; document.head.appendChild(ld); }
      const graph = [].concat(info.jsonld || []);
      if (info.crumbs && info.crumbs.length) graph.push({ "@type": "BreadcrumbList", itemListElement: [{ name: "الرئيسية", path: "/" }, ...info.crumbs].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: this.abs(c.path) })) });
      ld.textContent = graph.length ? JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) : "{}";
    },
  };

  /* ---------------- Toast ---------------- */
  AZ.toast = (msg, opts = {}) => {
    let box = AZ.$(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = `toast ${opts.type || ""}`;
    t.innerHTML = `${opts.image ? `<img src="${AZ.esc(opts.image)}" alt="">` : `<span class="ic">${AZ.icon(opts.type === "error" ? "alert" : opts.icon || "check")}</span>`}<span>${AZ.esc(msg)}</span>${opts.action ? `<a href="${AZ.esc(opts.action.href)}">${AZ.esc(opts.action.label)}</a>` : ""}`;
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, opts.duration || 3200);
  };
})();
