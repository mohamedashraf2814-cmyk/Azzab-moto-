/* AZZAB MOTO — shared UI components & global interactions */
(function () {
  "use strict";
  const AZ = window.AZ;
  const { esc, icon, money, $, $$ } = AZ;
  const D = AZ.data;
  const ui = (AZ.ui = {});
  const LOGO = "assets/brand/azzab-logo.webp";
  ui.LOGO = LOGO;

  /* ---------------- small pieces ---------------- */
  ui.stockBadge = (p) => {
    if (p.stock <= 0) return `<span class="stock out">غير متوفر</span>`;
    if (p.stock <= 4) return `<span class="stock low">متبقي ${p.stock} فقط</span>`;
    return `<span class="stock in">متوفر</span>`;
  };
  ui.discount = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  ui.clsBadge = (p) => (p.classification === "original" ? `<span class="badge badge-dark">${icon("seal")}أصلي TVS</span>` : `<span class="badge badge-silver">بديل</span>`);
  ui.crumbs = (items) => `<nav class="crumbs" aria-label="مسار التصفح"><a href="#/">الرئيسية</a>${items.map((it) => `${icon("chevL")}${it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`}`).join("")}</nav>`;
  ui.pageHead = (title, sub, crumbs) => `<section class="page-head"><div class="container">${ui.crumbs(crumbs || [{ label: title }])}<h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div></section>`;
  ui.empty = (ic, title, text, cta) => `<div class="empty reveal"><div class="ic">${icon(ic)}</div><h3>${esc(title)}</h3><p>${text}</p>${cta || ""}</div>`;
  ui.sectionHead = (eyebrow, title, sub, link) => `<div class="section-head reveal"><div><div class="eyebrow">${esc(eyebrow)}</div><h2 class="section-title">${title}</h2>${sub ? `<p class="section-sub">${sub}</p>` : ""}</div>${link ? `<a class="link-arrow" href="${link.href}">${esc(link.label)}${icon("arrowL")}</a>` : ""}</div>`;

  /* ---------------- Product card ---------------- */
  ui.productCard = (p, i = 0) => {
    const g = AZ.garage.active();
    const fits = AZ.catalog.fits(p, g);
    const off = ui.discount(p);
    const wished = AZ.wish.has(p.id);
    return `<article class="p-card reveal ${fits ? "fits" : ""}" style="--d:${(i % 4) * 70}ms" data-pid="${p.id}">
      <a class="p-media ${p.photo ? "is-photo" : ""}" href="#/products/${p.slug}" aria-label="${esc(p.name)}">
        <img class="main" src="${p.image}" alt="${esc(p.name)}" loading="lazy" width="400" height="400">
        <img class="alt" src="${p.gallery[1] || p.image}" alt="" loading="lazy" width="400" height="400">
      </a>
      <div class="p-badges">${off ? `<span class="badge badge-orange">-${off}%</span>` : ""}${p.bestSeller ? `<span class="badge badge-soft">${icon("zap")}الأكثر طلبًا</span>` : ""}</div>
      <div class="p-actions">
        <button class="icon-btn wish ${wished ? "active" : ""}" data-wish="${p.id}" aria-label="${wished ? "إزالة من المفضلة" : "إضافة للمفضلة"}" aria-pressed="${wished}">${icon("heart")}</button>
        <button class="icon-btn quick" data-quick="${p.id}" aria-label="عرض سريع">${icon("eye")}</button>
      </div>
      <div class="p-body">
        <div class="p-meta"><span class="sku">${esc(p.sku)}</span>${p.classification === "original" ? `<span class="badge badge-dark" style="height:22px;font-size:11px">أصلي TVS</span>` : `<span class="badge badge-silver" style="height:22px;font-size:11px">بديل</span>`}</div>
        <h3 class="p-title"><a href="#/products/${p.slug}">${esc(p.name)}</a></h3>
        ${fits ? `<span class="fit-tag">${icon("checkCircle")}يناسب موتوسيكلك</span>` : `<div class="p-compat">${icon("bike")}<span>${esc(AZ.catalog.compatNames(p))}</span></div>`}
        ${ui.stockBadge(p)}
        <div class="p-foot">
          <div class="price num">${money(p.price)}</div>${p.oldPrice ? `<div class="price-old">${AZ.moneyText(p.oldPrice)}</div>` : ""}
        </div>
        <button class="add-wide" data-add="${p.id}" aria-label="أضف ${esc(p.name)} للسلة" ${p.stock <= 0 ? "disabled" : ""}><span class="l1">${icon("cart")}${p.stock <= 0 ? "غير متوفر" : "أضف للسلة"}</span><span class="l2">${icon("check")}تمت الإضافة</span></button>
      </div>
    </article>`;
  };

  /* ---------------- Model card ---------------- */
  ui.modelCard = (m, i = 0, opts = {}) => {
    const count = AZ.catalog.forModel(m.slug).length;
    return `<a class="m-card reveal" href="#/motorcycles/${m.slug}" style="--d:${(i % 4) * 70}ms;--mc:${m.family === "electric" ? "#1E88E5" : "#FF8200"}" data-model="${m.slug}">
      <div class="m-top">${m.egypt ? `<span class="badge badge-orange">متاح في مصر</span>` : ""}${m.family === "electric" ? `<span class="badge badge-info">${icon("zap")}كهربائي</span>` : ""}</div>
      <div class="m-media ${m.photoCut ? "is-cut" : m.photo ? "is-photo" : ""}"><img src="${m.photoCut || m.photo || m.image}" alt="${esc(m.name)}" loading="lazy" width="600" height="380">${m.photo ? `<span class="photo-tag">${icon("camera")}صورة حقيقية</span>` : ""}</div>
      <div class="m-body">
        <h3>${esc(m.name)}</h3>
        <div class="t">${esc(m.tagline)} · ${m.cc ? `${m.cc} cc` : "كهربائي"}</div>
        <div class="row"><span class="badge badge-silver">${count} قطعة غيار</span><span class="cta">${esc(opts.cta || "اكتشف قطع الغيار")}${icon("arrowL")}</span></div>
      </div>
    </a>`;
  };

  /* ---------------- Category tile ---------------- */
  ui.CAT_HUES = { engine: [215, 18], brakes: [8, 85], electrical: [45, 95], batteries: [145, 45], oil: [32, 95], filters: [180, 45], suspension: [205, 70], tires: [220, 12], chains: [260, 30], body: [20, 90], lighting: [50, 100], accessories: [330, 55] };
  ui.catTile = (c, i = 0, href) => {
    const n = AZ.catalog.products().filter((p) => p.category === c.id).length;
    const hue = ui.CAT_HUES[c.id] || [28, 100];
    const cut = c.art ? `assets/img/parts/${c.art}-${c.tint || "orange"}-t.svg` : c.image;
    return `<a class="cat-tile reveal" style="--d:${(i % 6) * 60}ms;--h:${hue[0]};--s:${hue[1]}%" href="${href || `#/shop?cat=${c.id}`}">
      <span class="cat-glow"></span>
      <img src="${cut}" alt="" loading="lazy" width="200" height="200">
      <div class="cat-txt"><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><span class="n">${n} منتج ${icon("arrowL")}</span></div>
    </a>`;
  };

  /* ---------------- Bundle card ---------------- */
  ui.bundleCard = (b, i = 0) => {
    const m = AZ.catalog.model(b.model);
    const items = b.productIds.map((id) => AZ.catalog.byId(id)).filter(Boolean);
    const avail = items.every((p) => p.stock > 0);
    return `<article class="bundle-card reveal" style="--d:${(i % 3) * 80}ms">
      <div class="bundle-head"><img src="${b.image}" alt="" loading="lazy"><div><span class="badge badge-orange save">وفر ${AZ.moneyText(b.savings)}</span><h3>${esc(b.name)}</h3><div class="small" style="color:#b9c0c9;margin-top:4px">${m ? `<a href="#/motorcycles/${m.slug}" style="color:inherit">${esc(m.name)}</a>` : ""} · ${items.length} قطع</div></div></div>
      <ul class="bundle-items">${items.map((p) => `<li><img src="${p.image}" alt="" loading="lazy"><span><a href="#/products/${p.slug}">${esc(p.name)}</a></span><b class="num">${AZ.moneyText(p.price)}</b></li>`).join("")}</ul>
      <div class="bundle-foot"><div><div class="price-old">${AZ.moneyText(b.total)}</div><div class="price num">${money(b.price)}</div></div><button class="btn btn-primary btn-sm" data-add-bundle="${b.id}" ${avail ? "" : "disabled"}>${icon("cart")}${avail ? "أضف الطقم" : "غير متوفر"}</button></div>
    </article>`;
  };

  /* bundle price is applied as a coupon-like line discount: we add items and store bundle discount */
  ui.addBundle = (id) => {
    const b = D.bundles.find((x) => x.id === id);
    if (!b) return;
    b.productIds.forEach((pid) => AZ.cart.add(pid, 1));
    const bs = AZ.storage.get("bundles", []);
    bs.push(b.id); AZ.storage.set("bundles", bs);
    AZ.toast(`تمت إضافة ${b.name} للسلة`, { image: b.image, action: { href: "#/cart", label: "عرض السلة" } });
    ui.bumpCart();
  };

  /* ---------------- Layout: announce / header / footer ---------------- */
  const ANNOUNCE = [
    `<span class="dot"></span><b>وكيل معتمد TVS</b> — قطع غيار لكل موديلات TVS في مكان واحد`,
    `<b>خصم خاص</b> لأصحاب الورش ومراكز الصيانة — كلمنا على واتساب`,
    `الدفع عند الاستلام في كل محافظات مصر`,
    `شحن مجاني للطلبات فوق <b>${D.FREE_SHIPPING_OVER.toLocaleString("en-US")} ج.م</b>`,
    `مش عارف اسم القطعة؟ ابعتلنا صورتها على واتساب`,
  ];
  const NAV = [
    ["#/", "الرئيسية"], ["#/shop", "المتجر"], ["#/motorcycles", "موديلات TVS"], ["#/categories", "الأقسام"],
    ["#/offers", "العروض"], ["#/bundles", "أطقم الصيانة"], ["#/about", "من نحن"], ["#/contact", "تواصل معنا"],
  ];

  ui.shell = () => `
    <a class="skip-link" href="#main">تخطي إلى المحتوى</a>
    <div class="scroll-progress" data-progress aria-hidden="true"></div>
    <div class="route-wipe" data-wipe aria-hidden="true"><img src="${LOGO}" alt=""></div>
    <div class="announce" role="region" aria-label="إعلانات"><div class="container"><div class="announce-track">${ANNOUNCE.map((a, i) => `<div class="announce-item ${i === 0 ? "active" : ""}">${a}</div>`).join("")}</div></div></div>
    <header class="site-header" id="siteHeader">
      <div class="container header-row">
        <button class="icon-btn only-mobile menu-toggle" data-open="nav" aria-label="القائمة">${icon("menu")}</button>
        <a class="brand" href="#/" aria-label="عزاب موتو — الرئيسية">
          <span class="brand-logo"><img src="${LOGO}" alt="AZZAB MOTO" width="58" height="58"></span>
          <span class="brand-text"><strong>عزاب موتو</strong><small>${icon("seal")}وكيل معتمد TVS</small></span>
        </a>
        <nav class="main-nav" aria-label="القائمة الرئيسية">${NAV.slice(0, 6).map(([h, l]) => `<a href="${h}" data-nav="${h}">${l}</a>`).join("")}</nav>
        <form class="header-search" role="search" data-search-form>
          ${icon("search")}
          <input type="search" placeholder="ابحث باسم القطعة، الموديل أو رقم القطعة…" aria-label="بحث" autocomplete="off" data-search-input>
          <div class="search-suggest" data-suggest></div>
        </form>
        <div class="header-actions">
          <button class="icon-btn" data-install hidden aria-label="ثبّت التطبيق" title="ثبّت التطبيق">${icon("download")}</button>
          <button class="icon-btn only-mobile search-toggle" data-open="search" aria-label="بحث">${icon("search")}</button>
          <a class="icon-btn" href="#/garage" aria-label="جراچي">${icon("garage")}<span class="count" data-garage-count></span></a>
          <a class="icon-btn hide-sm" href="#/wishlist" aria-label="المفضلة">${icon("heart")}<span class="count" data-wish-count></span></a>
          <a class="icon-btn hide-sm" href="#/account" aria-label="حسابي">${icon("user")}</a>
          <button class="icon-btn" data-open="cart" aria-label="سلة التسوق">${icon("bag")}<span class="count" data-cart-count></span></button>
        </div>
      </div>
    </header>
    <div data-garage-bar></div>
    <main id="main" tabindex="-1"></main>
    <footer class="site-footer">${ui.footer()}</footer>
    <div class="overlay" data-overlay></div>
    <aside class="drawer right" data-drawer="nav" aria-label="القائمة" aria-hidden="true">
      <div class="drawer-head"><a class="brand" href="#/"><span class="brand-logo" style="width:46px;height:46px"><img src="${LOGO}" alt="AZZAB MOTO"></span><span><strong style="font-weight:900">عزاب موتو</strong><br><small class="muted">وكيل معتمد TVS</small></span></a><button class="icon-btn" data-close aria-label="إغلاق">${icon("x")}</button></div>
      <div class="drawer-body"><nav class="mobile-nav">
        ${[["#/", "home", "الرئيسية"], ["#/shop", "store", "المتجر"], ["#/motorcycles", "bike", "موديلات TVS"], ["#/categories", "grid", "الأقسام"], ["#/offers", "percent", "العروض"], ["#/bundles", "package", "أطقم الصيانة"], ["#/garage", "garage", "جراچي"], ["#/wishlist", "heart", "المفضلة"], ["#/account", "user", "حسابي"], ["#/track-order", "truck", "تتبع الطلب"], ["#/about", "seal", "من نحن"], ["#/faq", "info", "الأسئلة الشائعة"], ["#/contact", "phone", "تواصل معنا"]].map(([h, ic, l]) => `<a href="${h}" data-nav="${h}">${icon(ic)}${l}</a>`).join("")}
      </nav></div>
      <div class="drawer-foot" style="display:grid;gap:8px"><button class="btn btn-dark btn-block" data-install hidden>${icon("download")}ثبّت تطبيق عزاب موتو</button><a class="btn btn-whatsapp btn-block" href="#" data-wa="general">${icon("whatsapp")}كلمنا على واتساب</a><a class="small center" href="#" data-wa="workshop" style="color:var(--orange-600);font-weight:800">خصم خاص لأصحاب الورش ومراكز الصيانة</a></div>
    </aside>
    <aside class="drawer left" data-drawer="cart" aria-label="سلة التسوق" aria-hidden="true"></aside>
    <aside class="drawer right" data-drawer="search" aria-label="بحث" aria-hidden="true" style="width:min(520px,100vw)">
      <div class="drawer-head"><h3>${icon("search")}البحث</h3><button class="icon-btn" data-close aria-label="إغلاق">${icon("x")}</button></div>
      <div class="drawer-body"><div class="header-search" style="display:block;max-width:none">${icon("search")}<input type="search" placeholder="ابحث باسم القطعة، الموديل أو رقم القطعة…" aria-label="بحث" data-search-input data-mobile></div><div data-mobile-results class="mt-16"></div></div>
    </aside>
    <div class="modal" data-modal="quick" aria-hidden="true"><div class="modal-card" role="dialog" aria-modal="true" aria-label="عرض سريع"></div></div>
    <a class="wa-float" href="#" data-wa="general" aria-label="واتساب">${icon("whatsapp")}</a>
    <button class="back-top" data-top aria-label="العودة للأعلى">${icon("arrowUp")}</button>
    <div class="install-card" data-install-card hidden role="dialog" aria-label="تثبيت التطبيق">
      <img src="${LOGO}" alt="" width="52" height="52">
      <div class="ic-txt"><b>ثبّت تطبيق عزاب موتو</b><span data-install-msg>افتح المتجر بضغطة من الشاشة الرئيسية وتابع طلباتك بسهولة.</span></div>
      <div class="ic-act"><button class="btn btn-primary btn-sm" data-install-go>تثبيت</button><button class="btn btn-ghost btn-sm" data-install-close>لاحقًا</button></div>
    </div>`;

  ui.footer = () => `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><img src="${LOGO}" alt="AZZAB MOTO" width="120" height="120" loading="lazy"><p>عزاب موتو — وكيل معتمد لقطع غيار TVS في مصر. موتوسيكلات، سكوترات، كهربائي وتوك توك: القطعة الصح لموديلك، والدفع عند الاستلام.</p><p class="mt-8"><a href="#" data-wa="workshop" style="color:var(--orange);font-weight:800">خصم خاص لأصحاب الورش ومراكز الصيانة ←</a></p>
          <div class="socials"><a href="#" aria-label="فيسبوك" data-social>${icon("facebook")}</a><a href="#" aria-label="إنستجرام" data-social>${icon("instagram")}</a><a href="#" aria-label="تيك توك" data-social>${icon("tiktok")}</a><a href="#" aria-label="يوتيوب" data-social>${icon("youtube")}</a></div></div>
        <div><h4>الأقسام</h4><ul>${D.categories.slice(0, 7).map((c) => `<li><a href="#/shop?cat=${c.id}">${esc(c.name)}</a></li>`).join("")}</ul></div>
        <div><h4>روابط سريعة</h4><ul><li><a href="#/motorcycles">موديلات TVS</a></li><li><a href="#/offers">العروض</a></li><li><a href="#/bundles">أطقم الصيانة</a></li><li><a href="#/garage">جراچي</a></li><li><a href="#/track-order">تتبع الطلب</a></li><li><a href="#/faq">الأسئلة الشائعة</a></li><li><a href="#/admin">لوحة التحكم</a></li></ul></div>
        <div><h4>السياسات</h4><ul><li><a href="#/policies/shipping">سياسة الشحن</a></li><li><a href="#/policies/returns">الاستبدال والاسترجاع</a></li><li><a href="#/policies/privacy">سياسة الخصوصية</a></li><li><a href="#/policies/terms">الشروط والأحكام</a></li><li><a href="#/credits">حقوق الصور</a></li></ul></div>
        <div><h4>تواصل معنا</h4><ul data-footer-contact>${ui.contactList()}</ul></div>
      </div>
      <div class="footer-wordmark" aria-hidden="true">AZZAB</div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} عزاب موتو — جميع الحقوق محفوظة. TVS علامة تجارية مملوكة لـ TVS Motor Company.</span><span>الأسعار والمخزون في هذا الإصدار بيانات تجريبية</span></div>
    </div>`;

  ui.contactList = () => {
    const s = AZ.settings.get();
    const v = (x, ph) => (x ? esc(x) : `<span style="opacity:.6">${ph}</span>`);
    return `<li class="flex gap-8 items-center">${icon("whatsapp")}<a class="ltr" href="#" data-wa="general">${v(s.whatsapp ? s.whatsapp.replace(/^20/, "0") : "", "رقم واتساب — يُضاف من الإعدادات")}</a></li>
      <li class="flex gap-8 items-center">${icon("phone")}<span class="ltr">${v(s.phone, "رقم الهاتف — يُضاف لاحقًا")}</span></li>
      <li class="flex gap-8 items-center">${icon("mail")}<span>${v(s.email, "البريد الإلكتروني — يُضاف لاحقًا")}</span></li>
      <li class="flex gap-8 items-center">${icon("pin")}<span>${v(s.address, "عنوان الفرع — يُضاف لاحقًا")}</span></li>
      <li class="flex gap-8 items-center">${icon("clock")}<span>${esc(s.hours)}</span></li>`;
  };

  ui.garageBar = () => {
    const g = AZ.garage.active();
    const host = $("[data-garage-bar]");
    if (!host) return;
    if (!g) { host.innerHTML = ""; return; }
    const m = AZ.catalog.model(g.model);
    if (!m) { host.innerHTML = ""; return; }
    const n = AZ.catalog.forModel(g.model, g.year).length;
    host.innerHTML = `<div class="garage-bar"><div class="container"><img src="${m.cutout}" alt=""><span>بتتسوق لـ <b class="ltr">${esc(m.name)}</b>${g.year ? ` موديل <b>${g.year}</b>` : ""} — <b>${n}</b> قطعة متوافقة</span><a class="link" href="#/shop?model=${m.slug}${g.year ? `&year=${g.year}` : ""}">عرض القطع</a><a class="link" href="#/garage" style="margin-inline-start:auto">تغيير الموتوسيكل</a></div></div>`;
  };

  /* ---------------- Counters in header ---------------- */
  ui.refreshCounts = () => {
    $$("[data-cart-count]").forEach((e) => { const n = AZ.cart.count(); e.textContent = n || ""; e.dataset.n = n; });
    $$("[data-wish-count]").forEach((e) => { const n = AZ.wish.ids().length; e.textContent = n || ""; e.dataset.n = n; });
    $$("[data-garage-count]").forEach((e) => { const n = AZ.garage.list().length; e.textContent = n || ""; e.dataset.n = n; });
  };
  ui.bumpCart = () => { $$("[data-cart-count]").forEach((e) => { e.classList.remove("bump"); void e.offsetWidth; e.classList.add("bump"); }); };

  /* ---------------- Drawers & modals ---------------- */
  let lastFocus = null;
  ui.open = (name) => {
    ui.closeAll(true);
    lastFocus = document.activeElement;
    const el = $(`[data-drawer="${name}"]`);
    if (!el) return;
    if (name === "cart") ui.renderCartDrawer();
    el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    $("[data-overlay]").classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => { const f = el.querySelector("input, button, a"); if (f) f.focus(); }, 80);
  };
  ui.openModal = (name, html) => {
    ui.closeAll(true);
    lastFocus = document.activeElement;
    const m = $(`[data-modal="${name}"]`);
    m.querySelector(".modal-card").innerHTML = html;
    m.classList.add("open"); m.setAttribute("aria-hidden", "false");
    $("[data-overlay]").classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => { const f = m.querySelector("button"); if (f) f.focus(); }, 60);
  };
  ui.closeAll = (silent) => {
    $$(".drawer.open, .modal.open").forEach((e) => { e.classList.remove("open"); e.setAttribute("aria-hidden", "true"); });
    const o = $("[data-overlay]"); if (o) o.classList.remove("open");
    document.body.style.overflow = "";
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  };

  ui.renderCartDrawer = () => {
    const el = $('[data-drawer="cart"]');
    if (!el) return;
    const t = AZ.cart.totals();
    const pct = Math.min(100, (t.subtotal / D.FREE_SHIPPING_OVER) * 100);
    el.innerHTML = `<div class="drawer-head"><h3>${icon("bag")}سلة التسوق <span class="badge badge-silver">${AZ.cart.count()}</span></h3><button class="icon-btn" data-close aria-label="إغلاق">${icon("x")}</button></div>
      <div class="drawer-body">${t.lines.length ? `
        <div class="free-ship">${t.remainingFree > 0 ? `أضف <b>${AZ.moneyText(t.remainingFree)}</b> واحصل على شحن مجاني` : `<b>مبروك!</b> طلبك مؤهل للشحن المجاني`}<div class="bar"><i style="width:${pct}%"></i></div></div>
        ${t.lines.map((l, i) => `<div class="mini-item" style="animation-delay:${i * 50}ms"><img src="${l.product.image}" alt=""><div style="flex:1;min-width:0"><a class="t" href="#/products/${l.product.slug}">${esc(l.product.name)}</a><div class="small muted ltr">${esc(l.product.sku)}</div>
          <div class="flex items-center between mt-8"><div class="qty sm"><button data-qty="${l.product.id}" data-d="1" aria-label="زيادة">${icon("plus")}</button><input value="${l.qty}" readonly aria-label="الكمية"><button data-qty="${l.product.id}" data-d="-1" aria-label="تقليل">${icon("minus")}</button></div><b class="num">${AZ.moneyText(l.product.price * l.qty)}</b></div></div>
          <button class="icon-btn rm" data-remove="${l.product.id}" aria-label="حذف" style="width:34px;height:34px">${icon("trash")}</button></div>`).join("")}`
        : ui.empty("bag", "السلة فاضية", "ابدأ باختيار موديل موتوسيكلك واكتشف القطع المناسبة.", `<a class="btn btn-primary" href="#/shop" data-close>تسوق الآن</a>`)}</div>
      ${t.lines.length ? `<div class="drawer-foot"><div class="sum-row"><span>الإجمالي الفرعي</span><b class="num">${AZ.moneyText(t.subtotal)}</b></div>${t.discount ? `<div class="sum-row"><span>خصم الكوبون</span><span class="discount num">- ${AZ.moneyText(t.discount)}</span></div>` : ""}${t.bundleDiscount ? `<div class="sum-row"><span>خصم الأطقم</span><span class="discount num">- ${AZ.moneyText(t.bundleDiscount)}</span></div>` : ""}<p class="small muted mb-16">الشحن يُحسب حسب المحافظة · الدفع عند الاستلام</p><div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><a class="btn btn-outline" href="#/cart">عرض السلة</a><a class="btn btn-primary" href="#/checkout">إتمام الطلب</a></div></div>` : ""}`;
    el.querySelectorAll(".empty.reveal").forEach((e) => e.classList.add("in"));
  };

  /* ---------------- Quick view ---------------- */
  ui.quickView = (id) => {
    const p = AZ.catalog.byId(id);
    if (!p) return;
    const cat = AZ.catalog.category(p.category);
    ui.openModal("quick", `<button class="icon-btn modal-close" data-close aria-label="إغلاق">${icon("x")}</button>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0">
        <div style="background:#f3f5f8"><img src="${p.image}" alt="${esc(p.name)}" style="width:100%;aspect-ratio:1;object-fit:cover"></div>
        <div style="padding:28px">
          <div class="flex gap-8 wrap">${ui.clsBadge(p)}<span class="badge badge-silver">${esc(cat ? cat.name : "")}</span></div>
          <h2 style="font-size:24px;margin-top:12px">${esc(p.name)}</h2>
          <div class="pd-meta"><span>SKU: <b>${esc(p.sku)}</b></span><span>رقم القطعة: <b>${esc(p.partNumber)}</b></span></div>
          <div class="pd-price">${p.oldPrice ? `<span class="price-old">${AZ.moneyText(p.oldPrice)}</span>` : ""}<span class="price num" style="font-size:30px">${money(p.price)}</span></div>
          <div class="mt-8">${ui.stockBadge(p)}</div>
          <p class="muted mt-12 small">${esc(p.description)}</p>
          <div class="p-compat mt-12" style="white-space:normal">${icon("bike")}<span>${esc(AZ.catalog.compatNames(p, 6))}</span></div>
          <div class="pd-actions"><button class="btn btn-primary" data-add="${p.id}" data-close-after ${p.stock <= 0 ? "disabled" : ""}>${icon("cart")}أضف للسلة</button><a class="btn btn-outline" href="#/products/${p.slug}">التفاصيل الكاملة</a></div>
        </div>
      </div>`);
  };

  /* ---------------- Search ---------------- */
  ui.searchResults = (q) => {
    const res = AZ.catalog.search(q, 7);
    const ms = D.models.filter((m) => AZ.norm(m.name).includes(AZ.norm(q))).slice(0, 3);
    if (!res.length && !ms.length) return `<div class="suggest-head">لا توجد نتائج لـ "${esc(q)}"</div>`;
    return `${ms.length ? `<div class="suggest-head">موديلات</div>${ms.map((m) => `<a class="suggest-item" href="#/motorcycles/${m.slug}"><img src="${m.cutout}" alt="" style="object-fit:contain"><div><div class="t ltr">${esc(m.name)}</div><div class="s">${AZ.catalog.forModel(m.slug).length} قطعة غيار</div></div></a>`).join("")}` : ""}
      ${res.length ? `<div class="suggest-head">قطع غيار</div>${res.map((p) => `<a class="suggest-item" href="#/products/${p.slug}"><img src="${p.image}" alt=""><div><div class="t">${esc(p.name)}</div><div class="s ltr">${esc(p.sku)} · ${esc(p.partNumber)}</div></div><span class="p num">${AZ.moneyText(p.price)}</span></a>`).join("")}` : ""}
      <a class="suggest-item" href="#/shop?q=${encodeURIComponent(q)}" style="justify-content:center;font-weight:800;color:var(--orange-600)">عرض كل النتائج ${icon("arrowL")}</a>`;
  };

  /* ---------------- Fly-to-cart ---------------- */
  ui.fly = (fromEl, img) => {
    if (AZ.reduced() || !fromEl) return;
    const target = $("[data-open='cart']");
    if (!target) return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const f = document.createElement("div");
    f.className = "fly";
    f.innerHTML = `<img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover">`;
    f.style.left = `${a.left + a.width / 2 - 35}px`; f.style.top = `${a.top + a.height / 2 - 35}px`;
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    f.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx * 0.6}px, ${dy - 80}px) scale(0.7)`, opacity: 1, offset: 0.6 }, { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.2 }], { duration: 750, easing: "cubic-bezier(.5,0,.2,1)" }).onfinish = () => { f.remove(); ui.bumpCart(); };
  };

  ui.burst = (el) => {
    if (AZ.reduced() || !el || !el.animate) return;
    const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 12; i++) {
      const d = document.createElement("i"); d.className = "spark";
      d.style.left = `${cx}px`; d.style.top = `${cy}px`; d.style.background = i % 3 ? "#FF8200" : "#FFC27A";
      document.body.appendChild(d);
      const a = (i / 12) * Math.PI * 2, dist = 34 + (i % 4) * 12;
      d.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(.2)`, opacity: 0 }], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => d.remove();
    }
  };

  /* ---------------- Effects: reveal, counters, magnetic ---------------- */
  ui.rewriteLinks = (root = document) => { $$('a[href^="#/"]', root).forEach((a) => a.setAttribute("href", a.getAttribute("href").slice(1))); };
  let io;
  ui.observe = (root = document) => {
    if (AZ.PATH_MODE) ui.rewriteLinks(root);
    if (!("IntersectionObserver" in window) || AZ.reduced()) { $$(".reveal, .reveal-scale", root).forEach((e) => e.classList.add("in")); ui.counters(root, true); return; }
    if (!io) io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); if (en.target.dataset.count != null) ui.countUp(en.target); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".reveal:not(.in), .reveal-scale:not(.in), [data-count]", root).forEach((e) => io.observe(e));
    if (!ui._animIO) ui._animIO = new IntersectionObserver((ents) => ents.forEach((en) => en.target.classList.toggle("is-off", !en.isIntersecting)), { rootMargin: "100px" });
    $$("[data-anim]", root).forEach((e) => ui._animIO.observe(e));
  };
  ui.countUp = (el) => {
    const end = Number(el.dataset.count); const suffix = el.dataset.suffix || "";
    if (AZ.reduced()) { el.textContent = end.toLocaleString("en-US") + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e).toLocaleString("en-US") + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  ui.counters = (root, instant) => { $$("[data-count]", root).forEach((e) => (instant ? (e.textContent = Number(e.dataset.count).toLocaleString("en-US") + (e.dataset.suffix || "")) : null)); };
  ui.magnetic = (root = document) => {
    if (AZ.reduced() || !window.matchMedia("(hover: hover)").matches) return;
    $$(".magnetic", root).forEach((el) => {
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`; });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  };

  /* ---------------- 3D tilt on cards ---------------- */
  ui.bindTilt = () => {
    if (AZ.reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.addEventListener("mousemove", (e) => {
      const c = e.target.closest(".p-card, .m-card, .cat-tile, .bundle-card");
      document.querySelectorAll(".tilting").forEach((x) => { if (x !== c) { x.classList.remove("tilting"); x.style.transform = ""; } });
      if (!c) return;
      const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      c.classList.add("tilting");
      c.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-6px)`;
      c.style.setProperty("--gx", `${(px + 0.5) * 100}%`); c.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    });
  };

  /* ---------------- PWA install ---------------- */
  ui.pwa = { evt: null };
  ui.bindInstall = () => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (standalone) return;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(navigator.userAgent);
    // shown on every new visit; "لاحقًا" hides it for the rest of this visit only
    const dismissed = () => { try { return sessionStorage.getItem("azzab:installDismissed") === "1"; } catch (e) { return false; } };
    const card = () => $("[data-install-card]");
    const msg = (html) => { const m = $("[data-install-msg]"); if (m) m.innerHTML = html; };
    const openCard = () => { const c = card(); if (c && !dismissed()) { c.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("show"))); } };
    const closeCard = () => { const c = card(); if (c) { c.classList.remove("show"); setTimeout(() => (c.hidden = true), 350); } try { sessionStorage.setItem("azzab:installDismissed", "1"); } catch (e) {} };
    $$("[data-install]").forEach((b) => (b.hidden = false));
    if (isIOS) msg("على آيفون: اضغط زر المشاركة <b>⬆︎</b> في Safari ثم اختار <b>«إضافة إلى الشاشة الرئيسية»</b>.");
    // pop up as soon as the visitor lands
    setTimeout(openCard, 1200);
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); ui.pwa.evt = e; openCard(); });
    window.addEventListener("appinstalled", () => { $$("[data-install]").forEach((b) => (b.hidden = true)); closeCard(); AZ.toast("تم تثبيت تطبيق عزاب موتو", { icon: "check" }); });
    const install = async () => {
      if (ui.pwa.evt) { ui.pwa.evt.prompt(); const r = await ui.pwa.evt.userChoice.catch(() => ({})); ui.pwa.evt = null; if (r && r.outcome === "accepted") closeCard(); return; }
      if (isIOS) { msg("اضغط زر المشاركة <b>⬆︎</b> أسفل الشاشة في Safari، ثم <b>«إضافة إلى الشاشة الرئيسية»</b>، ثم <b>«إضافة»</b>."); const c = card(); if (c) { c.hidden = false; c.classList.add("show"); } return; }
      msg(isAndroid ? "افتح قائمة المتصفح <b>⋮</b> واختار <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>." : "من شريط العنوان اضغط أيقونة التثبيت <b>⊕</b> أو من قائمة المتصفح اختار <b>«تثبيت عزاب موتو»</b>.");
      const c = card(); if (c) { c.hidden = false; c.classList.add("show"); }
    };
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-install], [data-install-go]")) { e.preventDefault(); if (!e.target.closest("[data-install-card]")) ui.closeAll(true); install(); }
      if (e.target.closest("[data-install-close]")) closeCard();
    });
  };

  /* ---------------- Global delegated events ---------------- */
  ui.docH = 1;
  ui.measure = () => { ui.docH = document.documentElement.scrollHeight; };
  ui.bindGlobal = () => {
    ui.bindInstall();
    window.addEventListener("resize", AZ.debounce(ui.measure, 200));
    window.addEventListener("load", ui.measure);
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-add],[data-add-bundle],[data-wish],[data-quick],[data-open],[data-close],[data-overlay],[data-qty],[data-remove],[data-wa],[data-top],[data-social]");
      if (!t) return;
      if (t.matches("[data-overlay]")) return ui.closeAll();
      if (t.dataset.add) {
        e.preventDefault();
        const qtyInput = t.dataset.qtyFrom ? $(t.dataset.qtyFrom) : null;
        const qty = qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1;
        const p = AZ.catalog.byId(t.dataset.add);
        if (AZ.cart.add(t.dataset.add, qty)) {
          const card = t.closest(".p-card");
          ui.fly(card ? card.querySelector(".p-media") : t, p.image);
          ui.burst(t);
          if (t.classList.contains("add-wide")) { t.classList.add("added"); clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("added"), 1500); }
          AZ.toast(`تمت الإضافة: ${p.name}`, { image: p.image, action: { href: "#/cart", label: "عرض السلة" } });
          if (t.hasAttribute("data-close-after")) ui.closeAll();
          if (t.dataset.go) AZ.go(t.dataset.go);
        }
        return;
      }
      if (t.dataset.addBundle) { e.preventDefault(); return ui.addBundle(t.dataset.addBundle); }
      if (t.dataset.wish) {
        e.preventDefault();
        const on = AZ.wish.toggle(t.dataset.wish);
        $$(`[data-wish="${t.dataset.wish}"]`).forEach((b) => { b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
        AZ.toast(on ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة", { icon: "heart" });
        return;
      }
      if (t.dataset.quick) { e.preventDefault(); return ui.quickView(t.dataset.quick); }
      if (t.dataset.open) { e.preventDefault(); return ui.open(t.dataset.open); }
      if (t.hasAttribute("data-close")) { if (t.tagName !== "A") e.preventDefault(); return ui.closeAll(t.tagName === "A"); }
      if (t.dataset.qty) {
        const it = AZ.cart.items().find((i) => i.id === t.dataset.qty);
        const p = AZ.catalog.byId(t.dataset.qty);
        const next = (it ? it.qty : 0) + Number(t.dataset.d);
        if (p && next > p.stock) return AZ.toast(`المتاح ${p.stock} فقط من هذا المنتج`, { type: "error" });
        AZ.cart.setQty(t.dataset.qty, next);
        return;
      }
      if (t.dataset.remove) { AZ.cart.remove(t.dataset.remove); AZ.toast("تم حذف المنتج من السلة", { icon: "trash" }); return; }
      if (t.dataset.wa) {
        e.preventDefault();
        const msg = t.dataset.wa === "workshop" ? "مرحبًا عزاب موتو 👋\nأنا صاحب ورشة / مركز صيانة وعايز أعرف تفاصيل الخصم الخاص.\nاسم الورشة: \nالمحافظة: " : t.dataset.wa === "part" ? "مرحبًا عزاب موتو 👋\nمحتاج قطعة غيار ومش عارف اسمها، هبعتلكم صورتها.\nالموتوسيكل: \nالموديل/السنة: " : t.dataset.waText || "مرحبًا عزاب موتو 👋\nعندي استفسار عن قطع غيار TVS.";
        if (!AZ.wa.configured()) AZ.toast("رقم واتساب المتجر لم يُضبط بعد — اختر جهة الاتصال يدويًا", { icon: "info", duration: 4200 });
        AZ.openExternal(AZ.wa.link(msg));
        return;
      }
      if (t.hasAttribute("data-top")) return window.scrollTo({ top: 0, behavior: AZ.reduced() ? "auto" : "smooth" });
      if (t.hasAttribute("data-social")) { e.preventDefault(); AZ.toast("روابط السوشيال ميديا تُضاف عند تسليم الحسابات الرسمية", { icon: "info" }); }
    });

    document.addEventListener("keydown", (e) => { if (e.key === "Escape") ui.closeAll(); });
    // clear a field's validation error as soon as it is edited
    document.addEventListener("input", (e) => { const f = e.target.closest && e.target.closest(".field.has-error"); if (f) { f.classList.remove("has-error"); const er = f.querySelector(".err"); if (er) er.textContent = ""; } });

    // search
    const doSearch = AZ.debounce((input) => {
      const q = input.value.trim();
      if (input.hasAttribute("data-mobile")) { $("[data-mobile-results]").innerHTML = q ? ui.searchResults(q) : `<p class="muted small">جرّب: "تيل فرامل Apache" أو "بطارية" أو رقم القطعة</p>`; return; }
      const box = input.parentElement.querySelector("[data-suggest]");
      if (!q) { box.classList.remove("open"); return; }
      box.innerHTML = ui.searchResults(q); box.classList.add("open");
    }, 140);
    document.addEventListener("input", (e) => { if (e.target.matches("[data-search-input]")) doSearch(e.target); });
    document.addEventListener("submit", (e) => {
      if (!e.target.matches("[data-search-form]")) return;
      e.preventDefault();
      const q = e.target.querySelector("input").value.trim();
      e.target.querySelector("[data-suggest]").classList.remove("open");
      AZ.go(`#/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    });
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("[data-search-input][data-mobile]") && e.key === "Enter") { AZ.go(`#/shop?q=${encodeURIComponent(e.target.value.trim())}`); ui.closeAll(true); }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".header-search")) $$("[data-suggest].open").forEach((b) => b.classList.remove("open"));
      if (e.target.closest(".suggest-item")) { $$("[data-suggest].open").forEach((b) => b.classList.remove("open")); ui.closeAll(true); const i = $("[data-search-input]"); if (i) i.blur(); }
    });

    // header scroll state + back to top
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = $("#siteHeader"); if (h) h.classList.toggle("scrolled", y > 10);
        const bt = $("[data-top]"); if (bt) bt.classList.toggle("show", y > 900);
        const pr = $("[data-progress]"); if (pr) pr.style.transform = `scaleX(${Math.min(1, y / Math.max(1, ui.docH - window.innerHeight))})`;
        AZ.emit("scroll", y);
        ticking = false;
      });
    }, { passive: true });

    // live updates
    AZ.on("cart", () => { ui.refreshCounts(); if ($('[data-drawer="cart"].open')) ui.renderCartDrawer(); });
    AZ.on("wishlist", ui.refreshCounts);
    AZ.on("garage", () => { ui.refreshCounts(); ui.garageBar(); });
    AZ.on("settings", () => { const f = $("[data-footer-contact]"); if (f) f.innerHTML = ui.contactList(); });

    // rotating announcement
    const items = $$(".announce-item");
    let ai = 0;
    if (items.length > 1 && !AZ.reduced()) setInterval(() => {
      const cur = items[ai]; ai = (ai + 1) % items.length; const nx = items[ai];
      cur.classList.remove("active"); cur.classList.add("leave");
      nx.classList.remove("leave"); nx.classList.add("active");
      setTimeout(() => cur.classList.remove("leave"), 650);
    }, 4200);
  };
})();
