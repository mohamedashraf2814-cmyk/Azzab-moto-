/* AZZAB MOTO — demo admin dashboard (simulated auth, localStorage persistence) */
(function () {
  "use strict";
  const AZ = window.AZ;
  const { esc, icon, $, $$, ui } = AZ;
  const D = AZ.data;
  const admin = (AZ.admin = {});

  const SECTIONS = [
    ["overview", "dashboard", "نظرة عامة"], ["orders", "package", "الطلبات"], ["products", "boxes", "المنتجات"], ["inventory", "layers", "المخزون"],
    ["categories", "grid", "الأقسام"], ["models", "bike", "الموديلات"], ["customers", "users", "العملاء"], ["promotions", "percent", "العروض والأطقم"],
    ["coupons", "ticket", "الكوبونات"], ["analytics", "chart", "التحليلات"], ["settings", "settings", "الإعدادات"],
  ];
  const statusBadge = (s) => `<span class="badge ${s === "delivered" ? "badge-success" : s === "cancelled" ? "badge-danger" : s === "pending" ? "badge-warn" : "badge-info"}">${D.statusLabels[s]}</span>`;
  const notifBadge = (n) => (n === "manual-sent" ? `<span class="badge badge-success">${icon("whatsapp")}أُرسل يدويًا</span>` : `<span class="badge badge-silver" title="الإرسال التلقائي يتطلب Backend و WhatsApp Business Platform">لم يُرسل · يدوي</span>`);
  const authed = () => AZ.storage.get("adminSession", false);

  /* ---------------- charts (inline SVG) ---------------- */
  const chart = {
    line(points, { h = 220, fmt = (v) => v } = {}) {
      const w = 640, pad = 34;
      const max = Math.max(...points.map((p) => p.v), 1);
      const x = (i) => pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);
      const y = (v) => h - pad - (v / max) * (h - pad * 2);
      const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
      const area = `${d} L${x(points.length - 1)} ${h - pad} L${x(0)} ${h - pad} Z`;
      const grid = [0, 0.25, 0.5, 0.75, 1].map((k) => `<line x1="${pad}" x2="${w - pad}" y1="${y(max * k)}" y2="${y(max * k)}" stroke="#EEF1F4"/><text x="${w - pad + 6}" y="${y(max * k) + 4}" font-size="10" fill="#68707C">${Math.round((max * k) / 1000)}k</text>`).join("");
      return `<div class="chart" dir="ltr"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="رسم بياني للمبيعات">
        <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8200" stop-opacity=".28"/><stop offset="1" stop-color="#FF8200" stop-opacity="0"/></linearGradient></defs>
        ${grid}<path d="${area}" fill="url(#ga)"/><path d="${d}" fill="none" stroke="#FF8200" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:dash 1.4s var(--ease) forwards"/>
        ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="#fff" stroke="#FF8200" stroke-width="2.5" data-tip="${esc(p.label)}: ${esc(fmt(p.v))}"/>${i % Math.ceil(points.length / 7) === 0 ? `<text x="${x(i)}" y="${h - 10}" font-size="10" text-anchor="middle" fill="#68707C">${esc(p.label)}</text>` : ""}`).join("")}
      </svg><div class="tip"></div></div>`;
    },
    bars(items, { fmt = (v) => v } = {}) {
      const max = Math.max(...items.map((i) => i.v), 1);
      return `<div class="mini-bars">${items.map((i) => `<div class="r"><span>${esc(i.label)}</span><b class="num">${esc(fmt(i.v))}</b><div class="b"><i style="width:${(i.v / max) * 100}%"></i></div></div>`).join("")}</div>`;
    },
    donut(items) {
      const total = items.reduce((s, i) => s + i.v, 0) || 1;
      const colors = ["#FF8200", "#17191D", "#9AA3AE", "#1E6FD9", "#12A150", "#D93025"];
      let acc = 0;
      const r = 70, c = 2 * Math.PI * r;
      const segs = items.map((it, k) => { const len = (it.v / total) * c; const s = `<circle r="${r}" cx="100" cy="100" fill="none" stroke="${colors[k % colors.length]}" stroke-width="26" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 100 100)"/>`; acc += len; return s; }).join("");
      return `<div class="flex items-center gap-12 wrap"><svg viewBox="0 0 200 200" style="width:170px;flex-shrink:0">${segs}<text x="100" y="98" text-anchor="middle" font-size="28" font-weight="800" fill="#17191D">${total}</text><text x="100" y="120" text-anchor="middle" font-size="12" fill="#68707C">طلب</text></svg><div class="grid" style="gap:6px;flex:1;min-width:150px">${items.map((it, k) => `<div class="flex items-center gap-8 small"><i style="width:10px;height:10px;border-radius:3px;background:${colors[k % colors.length]}"></i>${esc(it.label)}<b style="margin-inline-start:auto" class="num">${it.v}</b></div>`).join("")}</div></div>`;
    },
  };

  /* ---------------- metrics ---------------- */
  const metrics = () => {
    const orders = AZ.orders.all();
    const valid = orders.filter((o) => o.status !== "cancelled");
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const sold = {};
    valid.forEach((o) => o.items.forEach((i) => (sold[i.id] = (sold[i.id] || 0) + i.qty)));
    const best = Object.entries(sold).sort((a, b) => b[1] - a[1]).map(([id, q]) => ({ p: AZ.catalog.byId(id), q })).filter((x) => x.p);
    const prods = AZ.catalog.products();
    return { orders, valid, revenue, aov: valid.length ? revenue / valid.length : 0, pending: orders.filter((o) => o.status === "pending").length, low: prods.filter((p) => p.stock <= 4), best };
  };

  /* ---------------- shell ---------------- */
  admin.render = (section) => {
    if (!authed()) return admin.login();
    const sec = SECTIONS.find((s) => s[0] === section) || SECTIONS[0];
    return `<div class="admin">
      <aside class="admin-side" data-admin-side>
        <div class="brand-row"><img src="${ui.LOGO}" alt=""><div><b>عزاب موتو</b><div class="small" style="color:#9aa3ae">لوحة التحكم · نسخة عرض</div></div></div>
        ${SECTIONS.map(([k, ic, l]) => `<a href="#/admin/${k}" class="${k === sec[0] ? "active" : ""}">${icon(ic)}${l}</a>`).join("")}
        <div style="margin-top:auto;padding-top:16px;display:grid;gap:4px"><a href="#/">${icon("store")}عرض المتجر</a><a href="#" data-admin-logout>${icon("logout")}خروج</a></div>
      </aside>
      <div class="admin-main">
        <div class="admin-mobile-bar"><button class="icon-btn" data-admin-menu aria-label="القائمة" style="background:#fff">${icon("menu")}</button><b>لوحة التحكم</b><a class="btn btn-outline btn-sm" href="#/" style="margin-inline-start:auto">المتجر</a></div>
        <div class="notice mb-16" style="background:#eef4fd;color:#2c4f80">${icon("info")}<span>لوحة تحكم تجريبية: البيانات والتعديلات محفوظة في هذا المتصفح فقط (LocalStorage)، والدخول محاكاة وليس حماية حقيقية. الربط بقاعدة بيانات وتسجيل دخول آمن يتم مع إضافة الـ Backend.</span></div>
        <div data-admin-body>${(admin.sections[sec[0]] || admin.sections.overview).render()}</div>
      </div>
    </div>
    <div class="overlay" data-overlay></div>
    <div class="modal" data-modal="quick" aria-hidden="true"><div class="modal-card" role="dialog" aria-modal="true" style="width:min(760px,100%)"></div></div>`;
  };
  admin.mount = (root, section) => {
    if (!authed()) return admin.mountLogin(root);
    const sec = admin.sections[section] || admin.sections.overview;
    if (sec.mount) sec.mount(root);
    // chart tooltips
    root.addEventListener("mousemove", (e) => {
      const c = e.target.closest("[data-tip]"); const ch = e.target.closest(".chart");
      if (!ch) return; const tip = ch.querySelector(".tip");
      if (!c) { tip.style.opacity = 0; return; }
      const r = ch.getBoundingClientRect(), cr = c.getBoundingClientRect();
      tip.textContent = c.dataset.tip; tip.style.left = `${cr.left - r.left + cr.width / 2}px`; tip.style.top = `${cr.top - r.top}px`; tip.style.opacity = 1;
    });
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-admin-logout]")) { e.preventDefault(); AZ.storage.remove("adminSession"); AZ.go("#/admin"); }
      if (e.target.closest("[data-admin-menu]")) { $("[data-admin-side]", root).classList.toggle("mobile-open"); $("[data-overlay]", root).classList.toggle("open"); }
      if (e.target.matches("[data-overlay]")) { $("[data-admin-side]", root).classList.remove("mobile-open"); }
    });
  };
  admin.refresh = () => AZ.router();

  admin.login = () => `<div class="admin-login"><form class="card card-pad" data-admin-login style="width:min(420px,100%)" novalidate>
      <div class="center mb-16"><img src="${ui.LOGO}" alt="AZZAB MOTO" style="width:110px;height:110px;border-radius:24px;margin:0 auto 12px"><h1 style="font-size:22px">لوحة تحكم عزاب موتو</h1><p class="muted small">نسخة عرض تجريبية</p></div>
      <div class="form-grid">${AZ.fld("user", "اسم المستخدم", { value: "admin", dir: "ltr" })}${AZ.fld("pass", "كلمة المرور", { type: "password", dir: "ltr", hint: `كلمة المرور التجريبية: <b class="ltr">${AZ.config.ADMIN_DEMO_PASSWORD}</b>` })}
      <button class="btn btn-primary btn-lg btn-block">${icon("lock")}دخول</button></div>
      <div class="demo-note mt-16">${icon("info")}<span>دخول محاكاة للعرض فقط — ليس نظام حماية حقيقي.</span></div>
      <a class="btn btn-ghost btn-sm btn-block mt-12" href="#/">${icon("arrowR")}العودة للمتجر</a></form></div>`;
  admin.mountLogin = (root) => {
    const f = $("[data-admin-login]", root);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = AZ.validate(f, { user: { required: "مطلوب" }, pass: { required: "مطلوب" } });
      if (!v) return;
      if (v.pass !== AZ.config.ADMIN_DEMO_PASSWORD) return AZ.toast("كلمة المرور غير صحيحة", { type: "error" });
      AZ.storage.set("adminSession", true); AZ.router();
    });
  };

  const top = (title, actions = "") => `<div class="admin-top"><h1>${title}</h1><div class="actions">${actions}</div></div>`;
  const modal = (html) => {
    const m = $('[data-modal="quick"]'); m.querySelector(".modal-card").innerHTML = `<button class="icon-btn modal-close" data-close aria-label="إغلاق">${icon("x")}</button><div style="padding:26px">${html}</div>`;
    m.classList.add("open"); $("[data-overlay]").classList.add("open"); document.body.style.overflow = "hidden";
  };
  const closeModal = () => { $$(".modal.open").forEach((m) => m.classList.remove("open")); const o = $("[data-overlay]"); if (o) o.classList.remove("open"); document.body.style.overflow = ""; };

  const sections = (admin.sections = {});

  /* ---------------- overview ---------------- */
  sections.overview = {
    render() {
      const m = metrics();
      const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(2026, 9, 26 - 13 + i); return d; });
      const series = days.map((d) => ({ label: `${d.getDate()}/${d.getMonth() + 1}`, v: m.valid.filter((o) => new Date(o.date).toDateString() === d.toDateString()).reduce((s, o) => s + o.total, 0) }));
      // smooth demo series so the chart has shape
      series.forEach((p, i) => (p.v = p.v + 1800 + Math.round(1400 * Math.sin(i / 1.7) + 900 * ((i * 37) % 5) / 5)));
      const byStatus = Object.keys(D.statusLabels).map((k) => ({ label: D.statusLabels[k], v: m.orders.filter((o) => o.status === k).length })).filter((x) => x.v);
      return `${top("نظرة عامة", `<a class="btn btn-primary btn-sm" href="#/admin/products" data-new-product>${icon("plus")}منتج جديد</a>`)}
        <div class="kpis">
          <div class="stat"><div class="k">${icon("package")}إجمالي الطلبات</div><div class="v num">${m.orders.length}</div><div class="d" style="color:var(--success)">+${m.orders.filter((o) => Date.now() - new Date(o.date) < 7 * 864e5).length} هذا الأسبوع</div></div>
          <div class="stat"><div class="k">${icon("cash")}الإيرادات</div><div class="v num">${Math.round(m.revenue).toLocaleString("en-US")}</div><div class="d muted">ج.م (بدون الملغي)</div></div>
          <div class="stat"><div class="k">${icon("clock")}طلبات معلقة</div><div class="v num" style="color:var(--warn)">${m.pending}</div><div class="d muted">تحتاج تأكيد</div></div>
          <div class="stat"><div class="k">${icon("alert")}مخزون منخفض</div><div class="v num" style="color:var(--danger)">${m.low.length}</div><div class="d muted">4 قطع أو أقل</div></div>
          <div class="stat"><div class="k">${icon("chart")}متوسط الطلب</div><div class="v num">${Math.round(m.aov).toLocaleString("en-US")}</div><div class="d muted">ج.م</div></div>
          <div class="stat"><div class="k">${icon("zap")}الأكثر مبيعًا</div><div class="v" style="font-size:14px;line-height:1.4">${m.best[0] ? esc(m.best[0].p.name) : "—"}</div><div class="d muted">${m.best[0] ? `${m.best[0].q} قطعة` : ""}</div></div>
        </div>
        <div class="admin-grid c-2-1">
          <div class="panel"><h3>المبيعات — آخر 14 يوم <span class="badge badge-silver">ج.م · بيانات تجريبية</span></h3>${chart.line(series, { fmt: AZ.moneyText })}</div>
          <div class="panel"><h3>الطلبات حسب الحالة</h3>${chart.donut(byStatus)}</div>
        </div>
        <div class="admin-grid c-2-1 mt-16">
          <div class="panel"><h3>أحدث الطلبات <a class="link-arrow small" href="#/admin/orders">الكل ${icon("arrowL")}</a></h3><div class="table-wrap"><table class="table"><thead><tr><th>الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>واتساب</th></tr></thead><tbody>${m.orders.slice(0, 6).map((o) => `<tr><td><b class="ltr">${esc(o.id)}</b><div class="small muted">${AZ.dateShort(o.date)}</div></td><td>${esc(o.customer.name)}<div class="small muted">${esc(o.customer.gov)}</div></td><td class="num"><b>${AZ.moneyText(o.total)}</b></td><td>${statusBadge(o.status)}</td><td>${notifBadge(o.notification)}</td></tr>`).join("")}</tbody></table></div></div>
          <div class="panel"><h3>تنبيهات المخزون <a class="link-arrow small" href="#/admin/inventory">المخزون ${icon("arrowL")}</a></h3>${m.low.slice(0, 7).map((p) => `<div class="flex items-center gap-12" style="padding:8px 0;border-bottom:1px solid var(--silver-2)"><img class="thumb" src="${p.image}" alt=""><span class="small" style="flex:1;font-weight:700">${esc(p.name)}</span>${p.stock ? `<span class="badge badge-warn">${p.stock}</span>` : `<span class="badge badge-danger">نفد</span>`}</div>`).join("") || `<p class="muted">لا توجد تنبيهات</p>`}</div>
        </div>
        <div class="panel mt-16"><h3>الأكثر مبيعًا</h3>${chart.bars(m.best.slice(0, 6).map((b) => ({ label: b.p.name, v: b.q })), { fmt: (v) => `${v} قطعة` })}</div>`;
    },
  };

  /* ---------------- orders ---------------- */
  sections.orders = {
    render() {
      return `${top("الطلبات", `<select class="select status-select" data-ofilter style="height:40px"><option value="">كل الحالات</option>${Object.entries(D.statusLabels).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select><input class="input" style="height:40px;width:220px" placeholder="بحث برقم الطلب أو الاسم" data-osearch>`)}
        <div class="notice mb-16">${icon("whatsapp")}<span>إشعارات واتساب التلقائية للعملاء تتطلب Backend وربط معتمد بـ WhatsApp Business Platform. حاليًا يمكنك فتح محادثة برسالة جاهزة وإرسالها يدويًا.</span></div>
        <div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>الطلب</th><th>العميل</th><th>المحافظة</th><th>القطع</th><th>الإجمالي</th><th>الحالة</th><th>واتساب</th><th></th></tr></thead><tbody data-orows></tbody></table></div></div>`;
    },
    mount(root) {
      const draw = () => {
        const st = $("[data-ofilter]", root).value, q = AZ.norm($("[data-osearch]", root).value);
        const list = AZ.orders.all().filter((o) => (!st || o.status === st) && (!q || AZ.norm(`${o.id} ${o.customer.name} ${o.customer.phone}`).includes(q)));
        $("[data-orows]", root).innerHTML = list.map((o) => `<tr><td><b class="ltr">${esc(o.id)}</b><div class="small muted">${AZ.dateShort(o.date)}</div>${o.demo ? `<span class="badge badge-silver" style="height:20px;font-size:10px">تجريبي</span>` : `<span class="badge badge-orange" style="height:20px;font-size:10px">جديد</span>`}</td><td>${esc(o.customer.name)}<div class="small muted ltr">${esc(o.customer.phone)}</div></td><td>${esc(o.customer.gov)}</td><td class="num">${o.items.reduce((s, i) => s + i.qty, 0)}</td><td class="num"><b>${AZ.moneyText(o.total)}</b></td>
          <td><select class="select status-select" data-ostatus="${o.id}" aria-label="حالة الطلب">${Object.entries(D.statusLabels).map(([k, v]) => `<option value="${k}" ${k === o.status ? "selected" : ""}>${v}</option>`).join("")}</select></td>
          <td>${notifBadge(o.notification)}</td><td><div class="row-actions"><button class="icon-btn" data-oview="${o.id}" aria-label="عرض">${icon("eye")}</button><button class="icon-btn" data-owa="${o.id}" aria-label="واتساب العميل" style="color:#1fae54">${icon("whatsapp")}</button></div></td></tr>`).join("") || `<tr><td colspan="8" class="center muted">لا توجد طلبات</td></tr>`;
      };
      draw();
      $("[data-ofilter]", root).addEventListener("change", draw);
      $("[data-osearch]", root).addEventListener("input", AZ.debounce(draw, 150));
      root.addEventListener("change", (e) => { const s = e.target.closest("[data-ostatus]"); if (s) { AZ.orders.update(s.dataset.ostatus, { status: s.value }); AZ.toast(`تم تحديث حالة ${s.dataset.ostatus}`, { icon: "check" }); } });
      root.addEventListener("click", (e) => {
        const v = e.target.closest("[data-oview]");
        if (v) { const o = AZ.orders.find(v.dataset.oview); modal(`<div class="flex between items-center wrap gap-12 mb-16"><h2 class="ltr" style="font-size:22px">${esc(o.id)}</h2>${statusBadge(o.status)}</div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px" class="mb-16"><div class="card card-pad"><div class="small muted">العميل</div><b>${esc(o.customer.name)}</b><div class="ltr small">${esc(o.customer.phone)}</div><div class="small muted">واتساب: <span class="ltr">${esc(o.customer.whatsapp)}</span></div></div><div class="card card-pad"><div class="small muted">العنوان</div><b>${esc(o.customer.gov)} — ${esc(o.customer.city)}</b><div class="small">${esc(o.customer.address)}</div>${o.customer.landmark ? `<div class="small muted">${esc(o.customer.landmark)}</div>` : ""}${o.customer.notes ? `<div class="small" style="color:var(--warn)">ملاحظات: ${esc(o.customer.notes)}</div>` : ""}</div></div><div class="mt-16">${AZ.timeline(o)}</div><div class="mt-16">${AZ.orderTable(o)}</div>`); return; }
        const w = e.target.closest("[data-owa]");
        if (w) {
          const o = AZ.orders.find(w.dataset.owa);
          const num = String(o.customer.whatsapp || o.customer.phone).replace(/\D/g, "").replace(/^0/, "20");
          const text = `مرحبًا ${o.customer.name} 👋\nمعاك عزاب موتو بخصوص طلبك رقم ${o.id}\nحالة الطلب: ${D.statusLabels[o.status]}\nالإجمالي: ${AZ.moneyText(o.total)} (الدفع عند الاستلام)`;
          AZ.openExternal(`https://wa.me/${num}?text=${encodeURIComponent(text)}`);
          AZ.orders.update(o.id, { notification: "manual-sent" }); draw();
        }
      });
    },
  };

  /* ---------------- products (CRUD) ---------------- */
  const ARTS = [...new Set(D.products.map((p) => p.art))];
  const productForm = (p) => {
    const cats = AZ.catalog.categories();
    const compat = new Set((p ? p.compat : []).map((c) => c.model));
    return `<h2 style="font-size:22px" class="mb-16">${p ? "تعديل منتج" : "منتج جديد"}</h2>
      <form class="form-grid cols-2" data-pform novalidate>
        ${AZ.fld("name", "اسم المنتج", { req: 1, value: p ? p.name : "", span: 1 })}
        ${AZ.fld("sku", "SKU", { req: 1, value: p ? p.sku : `AZ-NEW-${String(Date.now()).slice(-4)}`, dir: "ltr" })}
        ${AZ.fld("partNumber", "رقم القطعة", { value: p ? p.partNumber : "", dir: "ltr" })}
        ${AZ.fld("category", "القسم", { req: 1, type: "select", options: cats.map((c) => `<option value="${c.id}" ${p && p.category === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("") })}
        ${AZ.fld("brand", "الماركة", { req: 1, value: p ? p.brand : "TVS", dir: "ltr" })}
        ${AZ.fld("price", "السعر (ج.م)", { req: 1, type: "number", value: p ? p.price : "" })}
        ${AZ.fld("oldPrice", "السعر قبل الخصم (اختياري)", { type: "number", value: p && p.oldPrice ? p.oldPrice : "" })}
        ${AZ.fld("stock", "المخزون", { req: 1, type: "number", value: p ? p.stock : 10 })}
        ${AZ.fld("classification", "التصنيف", { type: "select", options: `<option value="original" ${!p || p.classification === "original" ? "selected" : ""}>أصلي TVS</option><option value="aftermarket" ${p && p.classification === "aftermarket" ? "selected" : ""}>بديل</option>` })}
        ${AZ.fld("art", "صورة العرض", { type: "select", options: ARTS.map((a) => `<option ${p && p.art === a ? "selected" : ""}>${a}</option>`).join("") })}
        ${AZ.fld("tint", "لون الصورة", { type: "select", options: ["orange", "silver", "charcoal"].map((t) => `<option ${p && p.tint === t ? "selected" : ""}>${t}</option>`).join("") })}
        ${AZ.fld("description", "الوصف", { type: "textarea", value: p ? p.description : "", span: 1 })}
        <div class="field span-2"><label>الموديلات المتوافقة</label><div class="filter-list card" style="padding:8px 12px;max-height:200px">${D.models.map((m) => `<label class="check"><input type="checkbox" name="compat" value="${m.slug}" ${compat.has(m.slug) ? "checked" : ""}><span class="ltr">${esc(m.name)}</span></label>`).join("")}</div></div>
        <div class="span-2 flex gap-8"><button class="btn btn-primary">${icon("check")}حفظ</button><button type="button" class="btn btn-outline" data-close>إلغاء</button></div>
      </form>`;
  };
  sections.products = {
    render() {
      return `${top("المنتجات", `<input class="input" style="height:40px;width:220px" placeholder="بحث بالاسم أو SKU" data-psearch><select class="select status-select" style="height:40px" data-pcat><option value="">كل الأقسام</option>${AZ.catalog.categories().map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select><button class="btn btn-primary btn-sm" data-padd>${icon("plus")}منتج جديد</button>`)}
        <div class="panel"><div class="flex between items-center mb-16"><span class="muted small" data-pcount></span><div class="flex gap-8" data-ppager></div></div><div class="table-wrap"><table class="table"><thead><tr><th>المنتج</th><th>SKU</th><th>القسم</th><th>السعر</th><th>المخزون</th><th>التوافق</th><th></th></tr></thead><tbody data-prows></tbody></table></div></div>`;
    },
    mount(root) {
      let page = 0; const per = 20;
      const draw = () => {
        const q = AZ.norm($("[data-psearch]", root).value), cat = $("[data-pcat]", root).value;
        const list = AZ.catalog.products().filter((p) => (!cat || p.category === cat) && (!q || AZ.norm(`${p.name} ${p.sku} ${p.partNumber}`).includes(q)));
        const pages = Math.max(1, Math.ceil(list.length / per)); page = Math.min(page, pages - 1);
        $("[data-pcount]", root).textContent = `${list.length} منتج · صفحة ${page + 1} من ${pages}`;
        $("[data-ppager]", root).innerHTML = `<button class="btn btn-outline btn-sm" data-pg="-1" ${page ? "" : "disabled"}>${icon("chevR")}</button><button class="btn btn-outline btn-sm" data-pg="1" ${page < pages - 1 ? "" : "disabled"}>${icon("chevL")}</button>`;
        $("[data-prows]", root).innerHTML = list.slice(page * per, page * per + per).map((p) => `<tr><td><div class="flex items-center gap-12"><img class="thumb" src="${p.image}" alt=""><div><b style="font-size:13.5px">${esc(p.name)}</b><div class="small muted">${esc(p.brand)} · ${p.classification === "original" ? "أصلي" : "بديل"}</div></div></div></td><td class="ltr small">${esc(p.sku)}</td><td class="small">${esc((AZ.catalog.category(p.category) || {}).name || "—")}</td><td class="num"><b>${AZ.moneyText(p.price)}</b>${p.oldPrice ? `<div class="price-old">${AZ.moneyText(p.oldPrice)}</div>` : ""}</td><td>${p.stock <= 0 ? `<span class="badge badge-danger">نفد</span>` : p.stock <= 4 ? `<span class="badge badge-warn">${p.stock}</span>` : `<span class="num">${p.stock}</span>`}</td><td class="small">${p.compat.length} موديل</td><td><div class="row-actions"><a class="icon-btn" href="#/products/${p.slug}" aria-label="عرض" target="_blank">${icon("eye")}</a><button class="icon-btn" data-pedit="${p.id}" aria-label="تعديل">${icon("pencil")}</button><button class="icon-btn" data-pdel="${p.id}" aria-label="حذف" style="color:var(--danger)">${icon("trash")}</button></div></td></tr>`).join("") || `<tr><td colspan="7" class="center muted">لا توجد منتجات</td></tr>`;
      };
      draw();
      $("[data-psearch]", root).addEventListener("input", AZ.debounce(() => { page = 0; draw(); }, 150));
      $("[data-pcat]", root).addEventListener("change", () => { page = 0; draw(); });
      const openForm = (p) => {
        modal(productForm(p));
        const f = $("[data-pform]");
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = AZ.validate(f, { name: { required: "الاسم مطلوب", min: [3, "قصير"] }, sku: { required: "SKU مطلوب" }, brand: { required: "مطلوب" }, price: { required: "السعر مطلوب" }, stock: { required: "المخزون مطلوب" } });
          if (!v) return;
          const models = $$('input[name="compat"]:checked', f).map((x) => x.value);
          if (!models.length) return AZ.toast("اختر موديل واحد على الأقل", { type: "error" });
          const list = AZ.catalog.products();
          if (list.some((x) => x.sku === v.sku && (!p || x.id !== p.id))) return AZ.toast("SKU مستخدم لمنتج آخر", { type: "error" });
          const art = f.elements.art.value, tint = f.elements.tint.value;
          const data = {
            name: v.name, sku: v.sku, partNumber: f.elements.partNumber.value || v.sku, category: f.elements.category.value, brand: v.brand,
            price: Number(v.price), oldPrice: Number(f.elements.oldPrice.value) || null, stock: Math.max(0, Number(v.stock)),
            classification: f.elements.classification.value, art, tint, description: f.elements.description.value || v.name,
            image: D.partImg(art, tint, "a"), gallery: [D.partImg(art, tint, "a"), D.partImg(art, tint, "b"), D.partImg(art, tint, "c")],
            compat: models.map((slug) => ({ model: slug, years: AZ.catalog.model(slug).years.slice() })),
          };
          if (p) Object.assign(list.find((x) => x.id === p.id), data);
          else list.unshift(Object.assign({ id: `p${Date.now().toString(36)}`, slug: `new-${data.art}-${Date.now().toString(36)}`, specs: { "رقم القطعة": data.partNumber, "الماركة": data.brand }, featured: false, bestSeller: false, popularity: 100, createdAt: new Date().toISOString() }, data));
          const saved = list.find((x) => x.sku === data.sku); if (saved) { saved.specs = Object.assign({}, saved.specs, { "رقم القطعة": data.partNumber, "الماركة": data.brand, "التصنيف": data.classification === "original" ? "أصلي TVS" : "بديل (Aftermarket)" }); }
          AZ.catalog.saveProducts(list); closeModal(); draw(); AZ.toast(p ? "تم حفظ التعديلات" : "تمت إضافة المنتج", { icon: "check" });
        });
      };
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-padd]")) return openForm(null);
        const ed = e.target.closest("[data-pedit]"); if (ed) return openForm(AZ.catalog.byId(ed.dataset.pedit));
        const del = e.target.closest("[data-pdel]");
        if (del) { const p = AZ.catalog.byId(del.dataset.pdel); AZ.confirm(`حذف "${p.name}"؟`, () => { AZ.catalog.saveProducts(AZ.catalog.products().filter((x) => x.id !== p.id)); draw(); AZ.toast("تم حذف المنتج", { icon: "trash" }); }, "حذف"); return; }
        const pg = e.target.closest("[data-pg]"); if (pg) { page += Number(pg.dataset.pg); draw(); }
        if (e.target.closest("[data-close]")) closeModal();
        if (e.target.matches("[data-overlay]")) closeModal();
      });
      document.body.addEventListener("click", function h(e) { if (!document.contains(root)) return document.body.removeEventListener("click", h); if (e.target.closest(".modal [data-close]")) closeModal(); });
      if ((location.hash + location.search).includes("new=1")) openForm(null);
    },
  };

  /* ---------------- inventory ---------------- */
  sections.inventory = {
    render() {
      return `${top("المخزون", `<select class="select status-select" style="height:40px" data-ifilter><option value="low">منخفض ونافد</option><option value="out">نافد فقط</option><option value="">الكل</option></select>`)}
        <div class="panel"><p class="small muted mb-16">عدّل الكمية مباشرة؛ التغيير يُحفظ فورًا ويظهر في المتجر.</p><div class="table-wrap"><table class="table"><thead><tr><th>المنتج</th><th>SKU</th><th>الحالة</th><th>الكمية</th></tr></thead><tbody data-irows></tbody></table></div></div>`;
    },
    mount(root) {
      const draw = () => {
        const f = $("[data-ifilter]", root).value;
        const list = AZ.catalog.products().filter((p) => (f === "low" ? p.stock <= 4 : f === "out" ? p.stock <= 0 : true)).slice(0, 200);
        $("[data-irows]", root).innerHTML = list.map((p) => `<tr><td><div class="flex items-center gap-12"><img class="thumb" src="${p.image}" alt=""><b style="font-size:13.5px">${esc(p.name)}</b></div></td><td class="ltr small">${esc(p.sku)}</td><td>${ui.stockBadge(p)}</td><td><div class="flex gap-8 items-center"><input class="input" type="number" min="0" value="${p.stock}" style="width:90px;height:38px" data-istock="${p.id}" aria-label="الكمية"><button class="btn btn-outline btn-sm" data-irestock="${p.id}">+20</button></div></td></tr>`).join("") || `<tr><td colspan="4" class="center muted">لا يوجد</td></tr>`;
      };
      draw();
      $("[data-ifilter]", root).addEventListener("change", draw);
      const setStock = (id, n) => { const list = AZ.catalog.products(); const p = list.find((x) => x.id === id); p.stock = Math.max(0, n); AZ.catalog.saveProducts(list); };
      root.addEventListener("change", (e) => { const i = e.target.closest("[data-istock]"); if (i) { setStock(i.dataset.istock, Number(i.value)); AZ.toast("تم تحديث المخزون", { icon: "check" }); } });
      root.addEventListener("click", (e) => { const r = e.target.closest("[data-irestock]"); if (r) { const p = AZ.catalog.byId(r.dataset.irestock); setStock(p.id, p.stock + 20); draw(); AZ.toast("تمت إضافة 20 قطعة", { icon: "check" }); } });
    },
  };

  /* ---------------- categories (CRUD) ---------------- */
  sections.categories = {
    render() {
      const prods = AZ.catalog.products();
      return `${top("الأقسام", `<button class="btn btn-primary btn-sm" data-cadd>${icon("plus")}قسم جديد</button>`)}
        <div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>القسم</th><th>الاسم الإنجليزي</th><th>الوصف</th><th>المنتجات</th><th></th></tr></thead><tbody>${AZ.catalog.categories().map((c) => `<tr><td><div class="flex items-center gap-12"><img class="thumb" src="${c.image}" alt=""><b>${esc(c.name)}</b></div></td><td class="ltr small">${esc(c.en)}</td><td class="small muted">${esc(c.desc)}</td><td class="num">${prods.filter((p) => p.category === c.id).length}</td><td><div class="row-actions"><button class="icon-btn" data-cedit="${c.id}" aria-label="تعديل">${icon("pencil")}</button><button class="icon-btn" data-cdel="${c.id}" aria-label="حذف" style="color:var(--danger)">${icon("trash")}</button></div></td></tr>`).join("")}</tbody></table></div></div>`;
    },
    mount(root) {
      const form = (c) => {
        modal(`<h2 style="font-size:22px" class="mb-16">${c ? "تعديل قسم" : "قسم جديد"}</h2><form class="form-grid" data-cform novalidate>${AZ.fld("name", "اسم القسم", { req: 1, value: c ? c.name : "" })}${AZ.fld("en", "الاسم الإنجليزي", { value: c ? c.en : "", dir: "ltr" })}${AZ.fld("desc", "وصف قصير", { value: c ? c.desc : "" })}${AZ.fld("art", "الصورة", { type: "select", options: ARTS.map((a) => `<option ${c && c.art === a ? "selected" : ""}>${a}</option>`).join("") })}<div class="flex gap-8"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" data-close>إلغاء</button></div></form>`);
        const f = $("[data-cform]");
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = AZ.validate(f, { name: { required: "مطلوب" } }); if (!v) return;
          const list = AZ.catalog.categories();
          const data = { name: v.name, en: f.elements.en.value, desc: f.elements.desc.value, art: f.elements.art.value, tint: "orange", image: D.partImg(f.elements.art.value, "orange", "a") };
          if (c) Object.assign(list.find((x) => x.id === c.id), data); else list.push(Object.assign({ id: `cat-${Date.now().toString(36)}` }, data));
          AZ.catalog.saveCategories(list); closeModal(); admin.refresh(); AZ.toast("تم الحفظ", { icon: "check" });
        });
      };
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-cadd]")) return form(null);
        const ed = e.target.closest("[data-cedit]"); if (ed) return form(AZ.catalog.category(ed.dataset.cedit));
        const del = e.target.closest("[data-cdel]");
        if (del) { const n = AZ.catalog.products().filter((p) => p.category === del.dataset.cdel).length; if (n) return AZ.toast(`لا يمكن حذف قسم به ${n} منتج`, { type: "error" }); AZ.catalog.saveCategories(AZ.catalog.categories().filter((c) => c.id !== del.dataset.cdel)); admin.refresh(); }
        if (e.target.closest(".modal [data-close]") || e.target.matches("[data-overlay]")) closeModal();
      });
    },
  };

  /* ---------------- models ---------------- */
  sections.models = {
    render() {
      return `${top("موديلات TVS", `<span class="badge badge-silver">${D.models.length} موديل</span>`)}
        <div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>الموديل</th><th>الفئة</th><th>المحرك</th><th>السنوات</th><th>السوق المصري</th><th>القطع المتوافقة</th><th></th></tr></thead><tbody>${D.models.map((m) => `<tr><td><div class="flex items-center gap-12"><img src="${m.cutout}" alt="" style="width:70px"><b class="ltr">${esc(m.name)}</b></div></td><td class="small">${esc(D.families.find((f) => f.id === m.family).short)}</td><td class="num small">${m.cc ? `${m.cc} cc` : "كهربائي"}</td><td class="num small">${m.years[0]} – ${m.years[m.years.length - 1]}</td><td>${m.egypt ? `<span class="badge badge-orange">متاح</span>` : `<span class="badge badge-silver">مستورد</span>`}</td><td class="num">${AZ.catalog.forModel(m.slug).length}</td><td><a class="btn btn-ghost btn-sm" href="#/motorcycles/${m.slug}" target="_blank">عرض</a></td></tr>`).join("")}</tbody></table></div></div>`;
    },
  };

  /* ---------------- customers ---------------- */
  sections.customers = {
    render() {
      const orders = AZ.orders.all();
      const regs = AZ.auth.users().map((u) => ({ id: u.id, name: u.name, phone: u.phone, gov: "—", bike: null, joined: u.created, registered: true }));
      const list = [...regs, ...D.customers];
      return `${top("العملاء", `<span class="badge badge-silver">${list.length} عميل</span>`)}
        <div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>العميل</th><th>الموبايل</th><th>المحافظة</th><th>الموتوسيكل</th><th>الطلبات</th><th>الإنفاق</th><th>منذ</th></tr></thead><tbody>${list.map((c) => { const os = orders.filter((o) => o.customerId === c.id || o.userId === c.id || o.customer.phone === c.phone); const m = c.bike ? AZ.catalog.model(c.bike) : null; return `<tr><td><b>${esc(c.name)}</b>${c.registered ? ` <span class="badge badge-orange" style="height:20px;font-size:10px">مسجل</span>` : ` <span class="badge badge-silver" style="height:20px;font-size:10px">تجريبي</span>`}</td><td class="ltr small">${esc(c.phone)}</td><td>${esc(c.gov)}</td><td class="ltr small">${m ? esc(m.short) : "—"}</td><td class="num">${os.length}</td><td class="num">${AZ.moneyText(os.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))}</td><td class="small muted">${AZ.dateShort(c.joined)}</td></tr>`; }).join("")}</tbody></table></div></div>`;
    },
  };

  /* ---------------- promotions ---------------- */
  sections.promotions = {
    render() {
      const sale = AZ.catalog.products().filter((p) => p.oldPrice && p.oldPrice > p.price);
      return `${top("العروض والأطقم")}
        <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))"><div class="stat"><div class="k">${icon("percent")}منتجات عليها خصم</div><div class="v num">${sale.length}</div></div><div class="stat"><div class="k">${icon("package")}أطقم صيانة</div><div class="v num">${D.bundles.length}</div></div><div class="stat"><div class="k">${icon("ticket")}كوبونات نشطة</div><div class="v num">${(AZ.storage.get("coupons", null) || D.coupons).filter((c) => c.active).length}</div></div></div>
        <div class="panel"><h3>أطقم الصيانة</h3><div class="table-wrap"><table class="table"><thead><tr><th>الطقم</th><th>الموديل</th><th>القطع</th><th>السعر الأصلي</th><th>سعر الطقم</th><th>التوفير</th></tr></thead><tbody>${D.bundles.map((b) => `<tr><td><b>${esc(b.name)}</b></td><td class="ltr small">${esc(AZ.catalog.model(b.model).short)}</td><td class="num">${b.productIds.length}</td><td class="num">${AZ.moneyText(b.total)}</td><td class="num"><b>${AZ.moneyText(b.price)}</b></td><td><span class="badge badge-success">${b.discount}% · ${AZ.moneyText(b.savings)}</span></td></tr>`).join("")}</tbody></table></div></div>
        <div class="panel mt-16"><h3>منتجات عليها خصم <span class="small muted">لإضافة خصم: عدّل "السعر قبل الخصم" من المنتجات</span></h3><div class="table-wrap"><table class="table"><thead><tr><th>المنتج</th><th>قبل</th><th>بعد</th><th>الخصم</th></tr></thead><tbody>${sale.slice(0, 40).map((p) => `<tr><td class="small"><b>${esc(p.name)}</b></td><td class="num price-old">${AZ.moneyText(p.oldPrice)}</td><td class="num"><b>${AZ.moneyText(p.price)}</b></td><td><span class="badge badge-orange">-${ui.discount(p)}%</span></td></tr>`).join("")}</tbody></table></div></div>`;
    },
  };

  /* ---------------- coupons (CRUD) ---------------- */
  const getCoupons = () => AZ.storage.get("coupons", null) || D.coupons.map((c) => ({ ...c }));
  sections.coupons = {
    render() {
      return `${top("الكوبونات", `<button class="btn btn-primary btn-sm" data-kadd>${icon("plus")}كوبون جديد</button>`)}
        <div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>حد أدنى</th><th>الوصف</th><th>نشط</th><th></th></tr></thead><tbody>${getCoupons().map((c, i) => `<tr><td><b class="ltr">${esc(c.code)}</b></td><td class="small">${c.type === "percent" ? "نسبة" : c.type === "fixed" ? "مبلغ ثابت" : "شحن مجاني"}</td><td class="num">${c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? AZ.moneyText(c.value) : "—"}</td><td class="num">${AZ.moneyText(c.min)}</td><td class="small muted">${esc(c.label)}</td><td><label class="check" style="padding:0"><input type="checkbox" data-ktoggle="${i}" ${c.active ? "checked" : ""} aria-label="تفعيل"></label></td><td><button class="icon-btn" data-kdel="${i}" aria-label="حذف" style="color:var(--danger)">${icon("trash")}</button></td></tr>`).join("")}</tbody></table></div></div>`;
    },
    mount(root) {
      root.addEventListener("change", (e) => { const t = e.target.closest("[data-ktoggle]"); if (t) { const l = getCoupons(); l[t.dataset.ktoggle].active = t.checked; AZ.storage.set("coupons", l); AZ.toast("تم التحديث", { icon: "check" }); } });
      root.addEventListener("click", (e) => {
        const d = e.target.closest("[data-kdel]"); if (d) { const l = getCoupons(); l.splice(Number(d.dataset.kdel), 1); AZ.storage.set("coupons", l); admin.refresh(); return; }
        if (e.target.closest("[data-kadd]")) {
          modal(`<h2 style="font-size:22px" class="mb-16">كوبون جديد</h2><form class="form-grid cols-2" data-kform novalidate>${AZ.fld("code", "الكود", { req: 1, dir: "ltr" })}${AZ.fld("type", "النوع", { type: "select", options: `<option value="percent">نسبة %</option><option value="fixed">مبلغ ثابت</option><option value="shipping">شحن مجاني</option>` })}${AZ.fld("value", "القيمة", { type: "number", value: 10 })}${AZ.fld("min", "حد أدنى للطلب", { type: "number", value: 500 })}${AZ.fld("label", "وصف يظهر للعميل", { req: 1, span: 1 })}<div class="span-2 flex gap-8"><button class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" data-close>إلغاء</button></div></form>`);
          const f = $("[data-kform]");
          f.addEventListener("submit", (ev) => {
            ev.preventDefault();
            const v = AZ.validate(f, { code: { required: "مطلوب", min: [3, "3 أحرف على الأقل"] }, label: { required: "مطلوب" } }); if (!v) return;
            const l = getCoupons(); const code = v.code.toUpperCase().replace(/\s/g, "");
            if (l.some((c) => c.code === code)) return AZ.toast("الكود موجود بالفعل", { type: "error" });
            l.push({ code, type: f.elements.type.value, value: Number(f.elements.value.value) || 0, min: Number(f.elements.min.value) || 0, max: null, label: v.label, active: true });
            AZ.storage.set("coupons", l); closeModal(); admin.refresh(); AZ.toast("تمت إضافة الكوبون", { icon: "ticket" });
          });
        }
        if (e.target.closest(".modal [data-close]") || e.target.matches("[data-overlay]")) closeModal();
      });
    },
  };

  /* ---------------- analytics ---------------- */
  sections.analytics = {
    render() {
      const m = metrics();
      const byCat = AZ.catalog.categories().map((c) => ({ label: c.name, v: m.valid.reduce((s, o) => s + o.items.filter((i) => (AZ.catalog.byId(i.id) || {}).category === c.id).reduce((a, i) => a + i.price * i.qty, 0), 0) })).filter((x) => x.v).sort((a, b) => b.v - a.v);
      const byGov = {}; m.valid.forEach((o) => (byGov[o.customer.gov] = (byGov[o.customer.gov] || 0) + o.total));
      const byModel = {}; m.valid.forEach((o) => o.items.forEach((i) => { const p = AZ.catalog.byId(i.id); if (p && p.primaryModel) byModel[p.primaryModel] = (byModel[p.primaryModel] || 0) + i.qty; }));
      const stockVal = AZ.catalog.products().reduce((s, p) => s + p.price * p.stock, 0);
      return `${top("التحليلات", `<span class="badge badge-silver">بيانات تجريبية</span>`)}
        <div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))"><div class="stat"><div class="k">${icon("boxes")}منتجات</div><div class="v num">${AZ.catalog.products().length}</div></div><div class="stat"><div class="k">${icon("layers")}قيمة المخزون</div><div class="v num">${Math.round(stockVal / 1000).toLocaleString("en-US")}k</div><div class="d muted">ج.م</div></div><div class="stat"><div class="k">${icon("rotate")}نسبة الإلغاء</div><div class="v num">${Math.round((m.orders.filter((o) => o.status === "cancelled").length / m.orders.length) * 100)}%</div></div><div class="stat"><div class="k">${icon("bike")}موديلات</div><div class="v num">${D.models.length}</div></div></div>
        <div class="admin-grid c-1-1">
          <div class="panel"><h3>المبيعات حسب القسم</h3>${chart.bars(byCat, { fmt: AZ.moneyText })}</div>
          <div class="panel"><h3>المبيعات حسب المحافظة</h3>${chart.bars(Object.entries(byGov).map(([label, v]) => ({ label, v })).sort((a, b) => b.v - a.v), { fmt: AZ.moneyText })}</div>
          <div class="panel"><h3>القطع المباعة حسب الموديل</h3>${chart.bars(Object.entries(byModel).map(([k, v]) => ({ label: AZ.catalog.model(k).short, v })).sort((a, b) => b.v - a.v), { fmt: (v) => `${v} قطعة` })}</div>
          <div class="panel"><h3>الكتالوج حسب القسم</h3>${chart.bars(AZ.catalog.categories().map((c) => ({ label: c.name, v: AZ.catalog.products().filter((p) => p.category === c.id).length })), { fmt: (v) => `${v} منتج` })}</div>
        </div>`;
    },
  };

  /* ---------------- settings ---------------- */
  sections.settings = {
    render() {
      const s = AZ.settings.get();
      return `${top("الإعدادات")}
        <div class="admin-grid c-1-1">
          <form class="panel" data-sform novalidate><h3>بيانات التواصل</h3><div class="form-grid">
            ${AZ.fld("whatsapp", "رقم واتساب المتجر (دولي)", { value: s.whatsapp, dir: "ltr", ph: "2010XXXXXXXX", hint: "بالصيغة الدولية بدون + (مثال: 2010…). يُستخدم في كل أزرار واتساب." })}
            ${AZ.fld("phone", "رقم الهاتف", { value: s.phone, dir: "ltr" })}
            ${AZ.fld("email", "البريد الإلكتروني", { value: s.email, dir: "ltr" })}
            ${AZ.fld("address", "عنوان الفرع", { value: s.address })}
            ${AZ.fld("hours", "مواعيد العمل", { value: s.hours })}
            <button class="btn btn-primary">${icon("check")}حفظ</button></div></form>
          <div class="grid" style="gap:16px">
            <div class="panel"><h3>إشعارات واتساب</h3><p class="small muted">الإرسال التلقائي لتأكيد الطلبات يتطلب: Backend، حساب WhatsApp Business Platform معتمد، وقوالب رسائل موافق عليها. الواجهة الحالية جاهزة للربط: كل طلب يحمل حقل <span class="ltr">notification</span> لحالة الإشعار.</p><div class="mt-12">${notifBadge("not-sent")} ${notifBadge("manual-sent")}</div></div>
            <div class="panel"><h3>بيانات العرض</h3><p class="small muted mb-16">إعادة كل المنتجات والأقسام والطلبات والكوبونات للبيانات التجريبية الأصلية (في هذا المتصفح).</p><button class="btn btn-outline" data-reset-demo style="color:var(--danger);border-color:var(--danger)">${icon("refresh")}إعادة ضبط البيانات</button></div>
          </div>
        </div>`;
    },
    mount(root) {
      const f = $("[data-sform]", root);
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const wa = f.elements.whatsapp.value.replace(/\D/g, "");
        if (wa && !/^20\d{10}$/.test(wa)) { f.elements.whatsapp.closest(".field").classList.add("has-error"); f.elements.whatsapp.closest(".field").querySelector(".err").textContent = "اكتب الرقم بالصيغة الدولية لمصر: 20 ثم 10 أرقام"; return; }
        AZ.settings.save({ whatsapp: wa, phone: f.elements.phone.value.trim(), email: f.elements.email.value.trim(), address: f.elements.address.value.trim(), hours: f.elements.hours.value.trim() });
        AZ.toast("تم حفظ الإعدادات", { icon: "check" });
      });
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-reset-demo]")) AZ.confirm("إعادة ضبط كل بيانات العرض؟", () => { AZ.catalog.reset(); AZ.storage.remove("orders"); AZ.orders._o = null; AZ.storage.remove("coupons"); AZ.toast("تمت إعادة الضبط", { icon: "refresh" }); admin.refresh(); }, "إعادة الضبط");
      });
    },
  };
})();
