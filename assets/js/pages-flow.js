/* AZZAB MOTO — cart, checkout, account & info pages */
(function () {
  "use strict";
  const AZ = window.AZ;
  const { esc, icon, money, $, $$, ui } = AZ;
  const D = AZ.data;
  const pages = (AZ.pages = AZ.pages || {});
  const govOptions = (sel) => `<option value="">اختر المحافظة</option>` + D.shipping.map((s) => `<option ${s.gov === sel ? "selected" : ""}>${s.gov}</option>`).join("");

  /* ---------------- tiny schema validator ---------------- */
  const PHONE = /^01[0125]\d{8}$/;
  const toEnDigits = (s) => String(s || "").replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\s|-/g, "");
  AZ.validate = (form, rules) => {
    let ok = true, first = null;
    const values = {};
    Object.entries(rules).forEach(([name, checks]) => {
      const el = form.elements[name]; if (!el) return;
      let v = el.type === "checkbox" ? el.checked : el.value.trim();
      if (checks.phone) v = toEnDigits(v);
      values[name] = v;
      let err = "";
      if (checks.required && !v) err = checks.required;
      else if (v && checks.min && String(v).length < checks.min[0]) err = checks.min[1];
      else if (v && checks.phone && !PHONE.test(v)) err = checks.phone;
      else if (v && checks.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err = checks.email;
      else if (checks.match && v !== form.elements[checks.match[0]].value) err = checks.match[1];
      const field = el.closest(".field");
      if (field) { field.classList.toggle("has-error", !!err); const e = field.querySelector(".err"); if (e) e.textContent = err; }
      el.setAttribute("aria-invalid", err ? "true" : "false");
      if (err) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok ? values : null;
  };
  const fld = (name, label, opts = {}) => `<div class="field ${opts.span ? "span-2" : ""}"><label for="f_${name}">${label}${opts.req ? ` <span class="req">*</span>` : ""}</label>${
    opts.type === "select" ? `<select class="select" id="f_${name}" name="${name}">${opts.options}</select>` :
    opts.type === "textarea" ? `<textarea class="textarea" id="f_${name}" name="${name}" placeholder="${esc(opts.ph || "")}">${esc(opts.value || "")}</textarea>` :
    `<input class="input" id="f_${name}" name="${name}" type="${opts.type || "text"}" value="${esc(opts.value || "")}" placeholder="${esc(opts.ph || "")}" ${opts.dir ? `dir="${opts.dir}"` : ""} ${opts.auto ? `autocomplete="${opts.auto}"` : ""} ${opts.inputmode ? `inputmode="${opts.inputmode}"` : ""}>`
  }${opts.hint ? `<span class="hint">${opts.hint}</span>` : ""}<span class="err" role="alert"></span></div>`;
  AZ.fld = fld;

  const summary = (t, opts = {}) => `
    ${opts.items ? `<div class="mb-16">${t.lines.map((l) => `<div class="flex gap-12 items-center" style="padding:8px 0"><div style="position:relative"><img src="${l.product.image}" alt="" style="width:56px;height:56px;border-radius:12px;background:var(--bg)"><span class="badge badge-dark" style="position:absolute;top:-8px;left:-8px;height:22px;min-width:22px;padding:0 6px">${l.qty}</span></div><span class="small" style="flex:1;font-weight:700">${esc(l.product.name)}</span><b class="small num">${AZ.moneyText(l.product.price * l.qty)}</b></div>`).join("")}</div>` : ""}
    <div class="sum-row"><span>الإجمالي الفرعي</span><b class="num">${AZ.moneyText(t.subtotal)}</b></div>
    ${t.discount ? `<div class="sum-row"><span>خصم الكوبون (${esc(t.coupon.code)})</span><span class="discount num">- ${AZ.moneyText(t.discount)}</span></div>` : ""}
    ${t.bundleDiscount ? `<div class="sum-row"><span>خصم أطقم الصيانة</span><span class="discount num">- ${AZ.moneyText(t.bundleDiscount)}</span></div>` : ""}
    <div class="sum-row"><span>الشحن${t.zone ? ` (${esc(t.zone.gov)})` : ""}</span><b class="num">${t.free ? `<span class="discount">مجاني</span>` : t.shipping == null ? `<span class="muted small">حسب المحافظة</span>` : AZ.moneyText(t.shipping)}</b></div>
    ${t.zone ? `<div class="small muted">مدة التوصيل المتوقعة: ${esc(t.zone.eta)}</div>` : ""}
    <div class="sum-row total"><span>الإجمالي</span><span class="num">${money(t.total)}</span></div>`;

  /* ======================= CART ======================= */
  pages.cart = {
    title: "سلة التسوق | عزاب موتو",
    render() { return `${ui.pageHead("سلة التسوق", null, [{ label: "السلة" }])}<div class="container" data-cart-root></div>`; },
    mount(root) {
      let gov = AZ.storage.get("lastGov", "");
      const draw = () => {
        const t = AZ.cart.totals(gov);
        const host = $("[data-cart-root]", root);
        if (!t.lines.length) { host.innerHTML = `<div class="section-sm">${ui.empty("bag", "السلة فاضية", "اختار موديل موتوسيكلك واكتشف قطع الغيار المناسبة له.", `<div class="flex gap-8" style="justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="#/shop">تسوق الآن</a><a class="btn btn-outline" href="#/motorcycles">اختار موتوسيكلك</a></div>`)}</div>`; ui.observe(host); return; }
        const pct = Math.min(100, (t.subtotal / D.FREE_SHIPPING_OVER) * 100);
        host.innerHTML = `<div class="two-col">
          <div class="card card-pad">
            <div class="flex between items-center mb-16"><h2 style="font-size:20px">${AZ.cart.count()} منتج</h2><button class="btn btn-ghost btn-sm" data-clear>${icon("trash")}إفراغ السلة</button></div>
            ${t.bundles.length ? `<div class="notice mb-16" style="background:var(--success-50);color:#0b7a3b">${icon("package")}<span>تم تطبيق خصم ${t.bundles.map((b) => esc(b.name)).join("، ")}</span></div>` : ""}
            ${t.lines.map((l) => { const g = AZ.garage.active(); const fit = AZ.catalog.fits(l.product, g); return `<div class="line-item"><a href="#/products/${l.product.slug}"><img src="${l.product.image}" alt=""></a><div style="flex:1;min-width:0">
              <a class="t" href="#/products/${l.product.slug}">${esc(l.product.name)}</a>
              <div class="s ltr">${esc(l.product.sku)} · ${esc(l.product.partNumber)}</div>
              ${fit === true ? `<span class="fit-tag">${icon("checkCircle")}متوافقة مع موتوسيكلك</span>` : fit === false ? `<span class="fit-tag" style="color:var(--warn)">${icon("alert")}راجع التوافق مع موتوسيكلك</span>` : ""}
              <div class="r"><div class="qty sm"><button data-qty="${l.product.id}" data-d="1" aria-label="زيادة">${icon("plus")}</button><input value="${l.qty}" readonly aria-label="الكمية"><button data-qty="${l.product.id}" data-d="-1" aria-label="تقليل">${icon("minus")}</button></div>
              <span class="small muted num">${AZ.moneyText(l.product.price)} × ${l.qty}</span><b class="num">${AZ.moneyText(l.product.price * l.qty)}</b>
              <button class="icon-btn rm" data-remove="${l.product.id}" aria-label="حذف">${icon("trash")}</button></div></div></div>`; }).join("")}
          </div>
          <aside class="aside"><div class="card card-pad">
            <h3 style="font-size:18px" class="mb-16">ملخص الطلب</h3>
            <div class="free-ship">${t.remainingFree > 0 ? `أضف <b>${AZ.moneyText(t.remainingFree)}</b> للشحن المجاني` : `<b>طلبك مؤهل للشحن المجاني</b>`}<div class="bar"><i style="width:${pct}%"></i></div></div>
            <div class="field mb-16"><label for="cGov">احسب الشحن</label><select class="select" id="cGov" data-gov>${govOptions(gov)}</select></div>
            <div class="field mb-16"><label for="cCoupon">كود الخصم</label>${t.coupon ? `<div class="flex between items-center" style="padding:10px 12px;border-radius:12px;background:var(--success-50)"><b class="ltr" style="color:var(--success)">${esc(t.coupon.code)}</b><button class="btn btn-ghost btn-sm" data-rm-coupon>إزالة</button></div>` : `<form class="coupon-row" data-coupon><input class="input" id="cCoupon" placeholder="AZZAB10" aria-label="كود الخصم"><button class="btn btn-dark">تطبيق</button></form><span class="hint">جرّب: AZZAB10 · WELCOME100 · FREESHIP</span>`}</div>
            ${summary(t)}
            <a class="btn btn-primary btn-lg btn-block mt-16" href="#/checkout">إتمام الطلب ${icon("arrowL")}</a>
            <p class="small muted center mt-12">${icon("cash", "")} الدفع عند الاستلام فقط</p>
            <a class="small center" href="#" data-wa="workshop" style="display:block;margin-top:6px;color:var(--orange-600);font-weight:800">صاحب ورشة؟ اطلب الخصم الخاص على واتساب</a>
          </div></aside></div>`;
      };
      draw();
      AZ.onPage("cart", draw);
      root.addEventListener("change", (e) => { if (e.target.matches("[data-gov]")) { gov = e.target.value; AZ.storage.set("lastGov", gov); draw(); } });
      root.addEventListener("submit", (e) => {
        if (!e.target.matches("[data-coupon]")) return;
        e.preventDefault();
        const r = AZ.cart.applyCoupon(e.target.querySelector("input").value);
        AZ.toast(r.msg, { type: r.ok ? "" : "error", icon: "ticket" });
      });
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-rm-coupon]")) AZ.cart.removeCoupon();
        if (e.target.closest("[data-clear]")) AZ.confirm("هل تريد إفراغ السلة؟", () => AZ.cart.clear(), "إفراغ السلة");
      });
    },
  };

  /* ======================= CHECKOUT ======================= */
  pages.checkout = {
    title: "إتمام الطلب | عزاب موتو",
    render() {
      if (!AZ.cart.lines().length) return `${ui.pageHead("إتمام الطلب", null, [{ label: "إتمام الطلب" }])}<div class="container section-sm">${ui.empty("bag", "السلة فاضية", "أضف منتجات للسلة الأول.", `<a class="btn btn-primary" href="#/shop">تسوق الآن</a>`)}</div>`;
      const u = AZ.auth.user() || {};
      const saved = AZ.storage.get("lastAddress", {});
      return `${ui.pageHead("إتمام الطلب", null, [{ label: "السلة", href: "#/cart" }, { label: "إتمام الطلب" }])}
      <div class="container two-col">
        <form class="card card-pad" data-checkout novalidate>
          <div class="steps"><span class="st done"><i>${icon("check")}</i>السلة</span><span class="line"></span><span class="st cur"><i>2</i>بيانات التوصيل</span><span class="line"></span><span class="st"><i>3</i>تأكيد الطلب</span></div>
          <h2 style="font-size:20px" class="mb-16">${icon("user", "")} بيانات العميل</h2>
          <div class="form-grid cols-2">
            ${fld("name", "الاسم بالكامل", { req: 1, value: u.name || saved.name, auto: "name", span: 1 })}
            ${fld("phone", "رقم الموبايل", { req: 1, value: u.phone || saved.phone, dir: "ltr", auto: "tel", inputmode: "tel", ph: "01xxxxxxxxx" })}
            ${fld("whatsapp", "رقم الواتساب", { req: 1, value: saved.whatsapp || u.phone, dir: "ltr", inputmode: "tel", ph: "01xxxxxxxxx" })}
            <label class="check span-2"><input type="checkbox" data-same ${!saved.whatsapp || saved.whatsapp === saved.phone ? "checked" : ""}> رقم الواتساب هو نفس رقم الموبايل</label>
          </div>
          <h2 style="font-size:20px" class="mb-16 mt-24">${icon("pin", "")} عنوان التوصيل</h2>
          <div class="form-grid cols-2">
            ${fld("gov", "المحافظة", { req: 1, type: "select", options: govOptions(saved.gov || AZ.storage.get("lastGov", "")) })}
            ${fld("city", "المدينة / المنطقة", { req: 1, value: saved.city })}
            ${fld("address", "العنوان بالتفصيل", { req: 1, value: saved.address, span: 1, ph: "الشارع، رقم العمارة، الدور، الشقة" })}
            ${fld("landmark", "علامة مميزة (اختياري)", { value: saved.landmark, span: 1, ph: "بجوار…" })}
            ${fld("notes", "ملاحظات التوصيل (اختياري)", { type: "textarea", span: 1, ph: "مثال: الاتصال قبل الوصول" })}
          </div>
          <h2 style="font-size:20px" class="mb-16 mt-24">${icon("cash", "")} طريقة الدفع</h2>
          <div class="radio-card"><span class="ic">${icon("cash")}</span><div><b>الدفع عند الاستلام</b><div class="small muted">ادفع نقدًا للمندوب لما الطلب يوصلك. لا يتطلب أي بيانات بنكية.</div></div><span style="margin-inline-start:auto;color:var(--orange)">${icon("checkCircle")}</span></div>
          <label class="check mt-16"><input type="checkbox" name="agree"> أوافق على <a href="#/policies/terms" style="color:var(--orange-600);font-weight:700">الشروط والأحكام</a> و<a href="#/policies/returns" style="color:var(--orange-600);font-weight:700">سياسة الاسترجاع</a></label>
          <span class="err small" data-agree-err style="color:var(--danger)"></span>
          <button class="btn btn-primary btn-lg btn-block mt-16" type="submit" data-place>${icon("check")}تأكيد الطلب — <span data-place-total></span></button>
        </form>
        <aside class="aside"><div class="card card-pad"><h3 style="font-size:18px" class="mb-16">طلبك</h3><div data-sum></div></div></aside>
      </div>`;
    },
    mount(root) {
      const form = $("[data-checkout]", root); if (!form) return;
      const draw = () => { const t = AZ.cart.totals(form.elements.gov.value); $("[data-sum]", root).innerHTML = summary(t, { items: true }); $("[data-place-total]", root).textContent = AZ.moneyText(t.total); };
      draw();
      const same = $("[data-same]", root);
      const syncWa = () => { if (same.checked) { form.elements.whatsapp.value = form.elements.phone.value; form.elements.whatsapp.closest(".field").style.display = "none"; } else form.elements.whatsapp.closest(".field").style.display = ""; };
      syncWa();
      same.addEventListener("change", syncWa);
      form.elements.phone.addEventListener("input", syncWa);
      form.elements.gov.addEventListener("change", draw);
      AZ.onPage("cart", draw);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        syncWa();
        const v = AZ.validate(form, {
          name: { required: "من فضلك اكتب اسمك", min: [3, "الاسم قصير جدًا"] },
          phone: { required: "رقم الموبايل مطلوب", phone: "اكتب رقم موبايل مصري صحيح (11 رقم يبدأ بـ 01)" },
          whatsapp: { required: "رقم الواتساب مطلوب", phone: "رقم واتساب غير صحيح" },
          gov: { required: "اختر المحافظة" },
          city: { required: "اكتب المدينة أو المنطقة" },
          address: { required: "اكتب العنوان بالتفصيل", min: [8, "من فضلك اكتب العنوان بتفاصيل أكثر"] },
          landmark: {}, notes: {},
        });
        const agreeErr = $("[data-agree-err]", root);
        agreeErr.textContent = form.elements.agree.checked ? "" : "يجب الموافقة على الشروط لإتمام الطلب";
        if (!v || !form.elements.agree.checked) return;
        const t = AZ.cart.totals(v.gov);
        // re-check stock
        const bad = t.lines.find((l) => l.qty > l.product.stock);
        if (bad) { AZ.toast(`الكمية المطلوبة من "${bad.product.name}" غير متاحة`, { type: "error" }); return; }
        const btn = $("[data-place]", root); btn.disabled = true; btn.innerHTML = "جاري تأكيد الطلب…";
        AZ.storage.set("lastAddress", v); AZ.storage.set("lastGov", v.gov);
        setTimeout(() => {
          const order = AZ.orders.create(v, t);
          AZ.cart.clear();
          AZ.go(`#/order-success?id=${encodeURIComponent(order.id)}`);
        }, 600);
      });
    },
  };

  /* ======================= ORDER SUCCESS ======================= */
  const orderTable = (o) => `<div class="table-wrap"><table class="table"><thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th></tr></thead><tbody>${o.items.map((i) => `<tr><td><div class="flex items-center gap-12"><img class="thumb" src="${i.image}" alt=""><span style="font-weight:700">${esc(i.name)}</span></div></td><td class="num">${i.qty}</td><td class="num">${AZ.moneyText(i.price * i.qty)}</td></tr>`).join("")}</tbody></table></div>
    <div class="mt-16" style="max-width:380px;margin-inline-start:auto">
      <div class="sum-row"><span>الإجمالي الفرعي</span><b class="num">${AZ.moneyText(o.subtotal)}</b></div>
      ${o.discount ? `<div class="sum-row"><span>الخصم</span><span class="discount num">- ${AZ.moneyText(o.discount)}</span></div>` : ""}
      <div class="sum-row"><span>الشحن</span><b class="num">${o.shipping ? AZ.moneyText(o.shipping) : "مجاني"}</b></div>
      <div class="sum-row total"><span>الإجمالي (عند الاستلام)</span><span class="num">${money(o.total)}</span></div>
    </div>`;
  AZ.orderTable = orderTable;

  pages.success = {
    title: "تم استلام طلبك | عزاب موتو",
    render(params, query) {
      const id = new URLSearchParams(query).get("id");
      const o = AZ.orders.find(id);
      if (!o) return `${ui.pageHead("الطلب غير موجود", null)}<div class="container section-sm">${ui.empty("package", "لم نعثر على الطلب", "تأكد من رقم الطلب أو تابع طلباتك من حسابك.", `<a class="btn btn-primary" href="#/track-order">تتبع طلب</a>`)}</div>`;
      return `<div class="container" style="max-width:900px">
        <div class="success-hero"><div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>
          <h1 style="font-size:clamp(26px,4vw,38px);font-weight:900">شكرًا ${esc(o.customer.name.split(" ")[0])}! طلبك وصلنا</h1>
          <p class="muted mt-8">رقم الطلب <b class="ltr" style="color:var(--charcoal);font-size:18px">${esc(o.id)}</b> · ${AZ.date(o.date)}</p>
          <p class="muted">هنراجع الطلب ونتواصل معاك على <b class="ltr">${esc(o.customer.phone)}</b> لتأكيد ميعاد التوصيل.</p>
        </div>
        <div class="card card-pad mb-16">
          <div class="flex between items-center wrap gap-12 mb-16"><h2 style="font-size:19px">تفاصيل الطلب</h2><span class="badge badge-warn">${D.statusLabels[o.status]}</span></div>
          ${orderTable(o)}
          <div class="mt-16 small muted">${icon("pin", "")} ${esc(o.customer.gov)} — ${esc(o.customer.city)} — ${esc(o.customer.address)}</div>
        </div>
        <div class="card card-pad mb-16" style="background:var(--bg)">
          <div class="flex gap-12 items-center wrap"><span style="color:#1fae54">${icon("whatsapp")}</span><div style="flex:1;min-width:220px"><b>تأكيد سريع على واتساب (اختياري)</b><div class="small muted">اضغط لفتح واتساب برسالة جاهزة فيها ملخص طلبك. الرسالة بتتبعت منك يدويًا.</div></div><a class="btn btn-whatsapp" href="#" data-wa-order="${esc(o.id)}">${icon("whatsapp")}أرسل ملخص الطلب</a></div>
        </div>
        <div class="flex gap-8 wrap" style="justify-content:center;padding-bottom:60px"><a class="btn btn-primary" href="#/track-order?id=${encodeURIComponent(o.id)}&phone=${encodeURIComponent(o.customer.phone)}">${icon("truck")}تتبع الطلب</a><a class="btn btn-outline" href="#/shop">متابعة التسوق</a></div>
      </div>`;
    },
    mount(root) {
      root.addEventListener("click", (e) => {
        const b = e.target.closest("[data-wa-order]"); if (!b) return;
        e.preventDefault();
        const o = AZ.orders.find(b.dataset.waOrder);
        if (!AZ.wa.configured()) AZ.toast("رقم واتساب المتجر لم يُضبط بعد — اختر جهة الاتصال يدويًا", { icon: "info" });
        AZ.openExternal(AZ.wa.link(AZ.wa.orderText(o)));
        AZ.orders.update(o.id, { notification: "manual-sent" });
      });
    },
  };

  /* ======================= TRACK ORDER ======================= */
  const STEPS = [["pending", "تم استلام الطلب", "package"], ["confirmed", "تم تأكيد الطلب", "checkCircle"], ["processing", "جاري التجهيز", "wrench"], ["shipped", "مع شركة الشحن", "truck"], ["delivered", "تم التسليم", "home"]];
  const timeline = (o) => {
    if (o.status === "cancelled") return `<div class="notice" style="background:var(--danger-50);color:var(--danger)">${icon("alert")}<span>تم إلغاء هذا الطلب. للاستفسار تواصل معنا.</span></div>`;
    const idx = STEPS.findIndex((s) => s[0] === o.status);
    return `<div class="timeline">${STEPS.map(([k, l, ic], i) => `<div class="tl-step ${i <= idx ? "done" : ""} ${i === idx ? "cur" : ""}"><span class="tl-dot">${icon(ic)}</span><div><b>${l}</b><span>${i <= idx ? (i === 0 ? AZ.date(o.date) : "تم") : "في الانتظار"}</span></div></div>`).join("")}</div>`;
  };
  AZ.timeline = timeline;
  pages.track = {
    title: "تتبع الطلب | عزاب موتو",
    render(params, query) {
      const q = new URLSearchParams(query);
      return `${ui.pageHead("تتبع طلبك", "اكتب رقم الطلب ورقم الموبايل المسجل في الطلب.", [{ label: "تتبع الطلب" }])}
      <div class="container two-col" style="grid-template-columns:minmax(0,1fr)">
        <form class="card card-pad" data-track novalidate style="max-width:720px;width:100%;margin-inline:auto">
          <div class="form-grid cols-2">${fld("id", "رقم الطلب", { req: 1, value: q.get("id") || "", dir: "ltr", ph: "AZ-260000" })}${fld("phone", "رقم الموبايل", { req: 1, value: q.get("phone") || "", dir: "ltr", inputmode: "tel", ph: "01xxxxxxxxx" })}</div>
          <button class="btn btn-primary btn-lg btn-block mt-16">${icon("search")}تتبع</button>
          <p class="small muted mt-12">للتجربة: ${AZ.orders.all().slice(3, 5).map((o) => `<button type="button" class="btn btn-ghost btn-sm ltr" data-demo="${o.id}|${o.customer.phone}">${o.id}</button>`).join(" ")}</p>
        </form>
        <div data-track-out style="max-width:720px;width:100%;margin-inline:auto"></div>
      </div>`;
    },
    mount(root, params, query) {
      const form = $("[data-track]", root);
      const run = () => {
        const v = AZ.validate(form, { id: { required: "اكتب رقم الطلب" }, phone: { required: "اكتب رقم الموبايل", phone: "رقم موبايل غير صحيح" } });
        if (!v) return;
        const o = AZ.orders.find(v.id);
        const out = $("[data-track-out]", root);
        if (!o || o.customer.phone !== v.phone) { out.innerHTML = `<div class="card card-pad">${ui.empty("search", "لم نعثر على الطلب", "تأكد من رقم الطلب ورقم الموبايل. ولو محتاج مساعدة تواصل معنا.")}</div>`; ui.observe(out); return; }
        out.innerHTML = `<div class="card card-pad reveal in"><div class="flex between items-center wrap gap-12 mb-16"><div><h2 style="font-size:20px" class="ltr">${esc(o.id)}</h2><span class="small muted">${AZ.date(o.date)} · ${o.items.length} منتج · ${AZ.moneyText(o.total)}</span></div><span class="badge badge-soft">${D.statusLabels[o.status]}</span></div>${timeline(o)}<details class="mt-24"><summary style="cursor:pointer;font-weight:800">تفاصيل المنتجات</summary><div class="mt-16">${orderTable(o)}</div></details></div>`;
      };
      form.addEventListener("submit", (e) => { e.preventDefault(); run(); });
      root.addEventListener("click", (e) => { const d = e.target.closest("[data-demo]"); if (d) { const [i, p] = d.dataset.demo.split("|"); form.elements.id.value = i; form.elements.phone.value = p; run(); } });
      if (new URLSearchParams(query).get("id")) run();
    },
  };

  /* ======================= WISHLIST ======================= */
  pages.wishlist = {
    title: "المفضلة | عزاب موتو",
    render() { return `${ui.pageHead("المفضلة", null, [{ label: "المفضلة" }])}<section class="section-sm"><div class="container" data-wl></div></section>`; },
    mount(root) {
      const draw = () => {
        const list = AZ.wish.ids().map((id) => AZ.catalog.byId(id)).filter(Boolean);
        const h = $("[data-wl]", root);
        h.innerHTML = list.length ? `<div class="flex between items-center mb-16"><span class="muted">${list.length} منتج</span><button class="btn btn-dark btn-sm" data-wl-all>${icon("cart")}أضف المتوفر للسلة</button></div><div class="grid grid-products">${list.map(ui.productCard).join("")}</div>` : ui.empty("heart", "المفضلة فاضية", "اضغط على ♡ في أي منتج علشان تحفظه هنا.", `<a class="btn btn-primary" href="#/shop">تصفح المنتجات</a>`);
        ui.observe(h);
      };
      draw();
      AZ.onPage("wishlist", draw);
      root.addEventListener("click", (e) => { if (e.target.closest("[data-wl-all]")) { let n = 0; AZ.wish.ids().forEach((id) => { const p = AZ.catalog.byId(id); if (p && p.stock > 0 && AZ.cart.add(id, 1)) n++; }); ui.bumpCart(); AZ.toast(`تمت إضافة ${n} منتج للسلة`, { icon: "cart" }); } });
    },
  };

  /* ======================= AUTH ======================= */
  const authShell = (title, sub, form) => `<div class="auth-wrap">
      <div class="auth-art"><img class="bike" src="${(AZ.catalog.model("ronin-225") || {}).cutout}" alt=""><h2>عزاب موتو</h2><p>وكيل معتمد TVS — احفظ موتوسيكلاتك، تابع طلباتك، واطلب أسرع.</p></div>
      <div class="auth-form"><div class="card card-pad"><a class="brand mb-16" href="#/"><span class="brand-logo"><img src="${ui.LOGO}" alt="AZZAB MOTO"></span></a><h1 style="font-size:26px">${title}</h1><p class="muted mb-16">${sub}</p>${form}</div></div></div>`;
  const demoNote = `<div class="demo-note mt-16">${icon("info")}<span>نسخة عرض: الحساب محفوظ في هذا المتصفح فقط وليس نظام دخول حقيقي. سيتم ربطه بنظام آمن عند إضافة الـ Backend.</span></div>`;
  pages.login = {
    title: "تسجيل الدخول | عزاب موتو",
    render() {
      if (AZ.auth.user()) return `<div class="container section-sm">${ui.empty("user", "أنت مسجل دخول بالفعل", "", `<a class="btn btn-primary" href="#/account">حسابي</a>`)}</div>`;
      return authShell("أهلًا بيك تاني", "سجل دخولك برقم الموبايل.", `<form data-login novalidate class="form-grid">${fld("phone", "رقم الموبايل", { req: 1, dir: "ltr", inputmode: "tel", auto: "tel", ph: "01xxxxxxxxx" })}${fld("password", "كلمة المرور", { req: 1, type: "password", auto: "current-password" })}<button class="btn btn-primary btn-lg btn-block">${icon("user")}تسجيل الدخول</button><p class="center small">معندكش حساب؟ <a href="#/register" style="color:var(--orange-600);font-weight:800">أنشئ حساب</a></p></form>${demoNote}`);
    },
    mount(root, params, query) {
      const f = $("[data-login]", root); if (!f) return;
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = AZ.validate(f, { phone: { required: "رقم الموبايل مطلوب", phone: "رقم موبايل غير صحيح" }, password: { required: "كلمة المرور مطلوبة" } });
        if (!v) return;
        const r = AZ.auth.login(v.phone, v.password);
        if (!r.ok) return AZ.toast(r.msg, { type: "error" });
        AZ.toast("تم تسجيل الدخول", { icon: "user" });
        AZ.go(new URLSearchParams(query).get("next") || "#/account");
      });
    },
  };
  pages.register = {
    title: "إنشاء حساب | عزاب موتو",
    render() {
      return authShell("إنشاء حساب جديد", "احفظ بياناتك وموتوسيكلاتك واطلب أسرع.", `<form data-register novalidate class="form-grid">${fld("name", "الاسم بالكامل", { req: 1, auto: "name" })}${fld("phone", "رقم الموبايل", { req: 1, dir: "ltr", inputmode: "tel", auto: "tel", ph: "01xxxxxxxxx" })}${fld("email", "البريد الإلكتروني (اختياري)", { type: "email", dir: "ltr", auto: "email" })}${fld("password", "كلمة المرور", { req: 1, type: "password", auto: "new-password", hint: "6 أحرف على الأقل" })}${fld("password2", "تأكيد كلمة المرور", { req: 1, type: "password", auto: "new-password" })}<button class="btn btn-primary btn-lg btn-block">إنشاء الحساب</button><p class="center small">عندك حساب؟ <a href="#/login" style="color:var(--orange-600);font-weight:800">سجل دخول</a></p></form>${demoNote}`);
    },
    mount(root) {
      const f = $("[data-register]", root);
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = AZ.validate(f, { name: { required: "الاسم مطلوب", min: [3, "الاسم قصير جدًا"] }, phone: { required: "رقم الموبايل مطلوب", phone: "رقم موبايل غير صحيح" }, email: { email: "بريد إلكتروني غير صحيح" }, password: { required: "كلمة المرور مطلوبة", min: [6, "6 أحرف على الأقل"] }, password2: { required: "أكد كلمة المرور", match: ["password", "كلمتا المرور غير متطابقتين"] } });
        if (!v) return;
        const r = AZ.auth.register(v);
        if (!r.ok) return AZ.toast(r.msg, { type: "error" });
        AZ.toast(`أهلًا ${v.name.split(" ")[0]}! تم إنشاء حسابك`, { icon: "user" });
        AZ.go("#/account");
      });
    },
  };

  /* ======================= ACCOUNT ======================= */
  const accNav = (cur) => `<nav class="acc-nav card" style="padding:8px">${[["#/account", "dashboard", "نظرة عامة"], ["#/account/orders", "package", "طلباتي"], ["#/garage", "garage", "جراچي"], ["#/wishlist", "heart", "المفضلة"]].map(([h, ic, l]) => `<a href="${h}" class="${cur === h ? "active" : ""}">${icon(ic)}${l}</a>`).join("")}<a href="#" data-logout>${icon("logout")}تسجيل الخروج</a></nav>`;
  const needLogin = (next) => `${ui.pageHead("حسابي", null, [{ label: "حسابي" }])}<div class="container section-sm">${ui.empty("user", "سجل دخولك الأول", "سجل دخول أو أنشئ حساب لمتابعة طلباتك وحفظ بياناتك. تقدر كمان تتابع أي طلب من صفحة تتبع الطلب.", `<div class="flex gap-8" style="justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="#/login?next=${encodeURIComponent(next)}">تسجيل الدخول</a><a class="btn btn-outline" href="#/register">إنشاء حساب</a><a class="btn btn-ghost" href="#/track-order">تتبع طلب</a></div>`)}</div>`;
  const bindLogout = (root) => root.addEventListener("click", (e) => { if (e.target.closest("[data-logout]")) { e.preventDefault(); AZ.auth.logout(); AZ.toast("تم تسجيل الخروج", { icon: "logout" }); AZ.go("#/"); } });

  const orderRow = (o) => `<tr><td><b class="ltr">${esc(o.id)}</b></td><td>${AZ.date(o.date)}</td><td class="num">${o.items.reduce((s, i) => s + i.qty, 0)}</td><td class="num"><b>${AZ.moneyText(o.total)}</b></td><td><span class="badge ${o.status === "delivered" ? "badge-success" : o.status === "cancelled" ? "badge-danger" : "badge-warn"}">${D.statusLabels[o.status]}</span></td><td><a class="btn btn-ghost btn-sm" href="#/track-order?id=${encodeURIComponent(o.id)}&phone=${encodeURIComponent(o.customer.phone)}">تتبع</a></td></tr>`;

  pages.account = {
    title: "حسابي | عزاب موتو",
    render() {
      const u = AZ.auth.user();
      if (!u) return needLogin("#/account");
      const mine = AZ.orders.mine();
      const g = AZ.garage.active(); const gm = g ? AZ.catalog.model(g.model) : null;
      return `${ui.pageHead(`أهلًا، ${u.name.split(" ")[0]}`, "إدارة حسابك وطلباتك.", [{ label: "حسابي" }])}
      <div class="container acc-layout">${accNav("#/account")}
        <div class="grid" style="gap:16px">
          <div class="stat-cards">
            <div class="stat"><div class="k">${icon("package")}الطلبات</div><div class="v num">${mine.length}</div></div>
            <div class="stat"><div class="k">${icon("cash")}إجمالي المشتريات</div><div class="v num">${AZ.moneyText(mine.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))}</div></div>
            <div class="stat"><div class="k">${icon("heart")}المفضلة</div><div class="v num">${AZ.wish.ids().length}</div></div>
            <div class="stat"><div class="k">${icon("garage")}موتوسيكلاتي</div><div class="v num">${AZ.garage.list().length}</div></div>
          </div>
          <div class="card card-pad"><div class="flex between items-center mb-16"><h2 style="font-size:19px">آخر الطلبات</h2><a class="link-arrow" href="#/account/orders">كل الطلبات ${icon("arrowL")}</a></div>
            ${mine.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>رقم الطلب</th><th>التاريخ</th><th>القطع</th><th>الإجمالي</th><th>الحالة</th><th></th></tr></thead><tbody>${mine.slice(0, 4).map(orderRow).join("")}</tbody></table></div>` : `<p class="muted">لسه معملتش طلبات. <a href="#/shop" style="color:var(--orange-600);font-weight:800">ابدأ التسوق</a></p>`}
          </div>
          <div class="admin-grid c-1-1" style="display:grid;gap:16px">
            <form class="card card-pad" data-profile novalidate><h2 style="font-size:19px" class="mb-16">بياناتي</h2><div class="form-grid">${fld("name", "الاسم", { value: u.name })}${fld("phone", "الموبايل", { value: u.phone, dir: "ltr" })}${fld("email", "البريد الإلكتروني", { value: u.email, dir: "ltr", type: "email" })}<button class="btn btn-dark">حفظ التعديلات</button></div></form>
            <div class="card card-pad"><h2 style="font-size:19px" class="mb-16">موتوسيكلي</h2>${gm ? `<img src="${gm.cutout}" alt="" style="width:100%;max-width:340px"><b class="ltr" style="font-size:18px">${esc(gm.name)}</b>${g.year ? ` <span class="muted">(${g.year})</span>` : ""}<div class="flex gap-8 mt-12 wrap"><a class="btn btn-primary btn-sm" href="#/shop?model=${gm.slug}">القطع المتوافقة</a><a class="btn btn-outline btn-sm" href="#/garage">إدارة جراچي</a></div>` : `<p class="muted mb-16">لم تضف موتوسيكل بعد.</p><a class="btn btn-primary btn-sm" href="#/garage">${icon("plus")}أضف موتوسيكلك</a>`}</div>
          </div>
        </div>
      </div>`;
    },
    mount(root) {
      bindLogout(root);
      const f = $("[data-profile]", root); if (!f) return;
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = AZ.validate(f, { name: { required: "الاسم مطلوب", min: [3, "الاسم قصير"] }, phone: { required: "الموبايل مطلوب", phone: "رقم غير صحيح" }, email: { email: "بريد غير صحيح" } });
        if (!v) return; AZ.auth.update(v); AZ.toast("تم حفظ بياناتك", { icon: "check" });
      });
    },
  };
  pages.accountOrders = {
    title: "طلباتي | عزاب موتو",
    render() {
      const u = AZ.auth.user();
      if (!u) return needLogin("#/account/orders");
      const mine = AZ.orders.mine();
      return `${ui.pageHead("طلباتي", "سجل طلباتك على هذا المتصفح وحسابك.", [{ label: "حسابي", href: "#/account" }, { label: "طلباتي" }])}
      <div class="container acc-layout">${accNav("#/account/orders")}
        <div>${mine.length ? mine.map((o) => `<details class="card card-pad mb-16"><summary style="cursor:pointer;list-style:none"><div class="flex between items-center wrap gap-12"><div><b class="ltr" style="font-size:17px">${esc(o.id)}</b><div class="small muted">${AZ.date(o.date)} · ${o.items.length} منتج</div></div><div class="flex items-center gap-12"><b class="num">${AZ.moneyText(o.total)}</b><span class="badge ${o.status === "delivered" ? "badge-success" : o.status === "cancelled" ? "badge-danger" : "badge-warn"}">${D.statusLabels[o.status]}</span></div></div></summary><div class="mt-24">${timeline(o)}<div class="mt-24">${orderTable(o)}</div></div></details>`).join("") : `<div class="card">${ui.empty("package", "لا توجد طلبات بعد", "أول طلب ليك هيظهر هنا.", `<a class="btn btn-primary" href="#/shop">ابدأ التسوق</a>`)}</div>`}</div>
      </div>`;
    },
    mount(root) { bindLogout(root); },
  };

  /* ======================= GARAGE ======================= */
  pages.garage = {
    title: "جراچي — موتوسيكلاتي | عزاب موتو",
    render() {
      return `${ui.pageHead("جراچي", "احفظ موتوسيكلاتك علشان نميّز لك القطع المتوافقة في كل المتجر.", [{ label: "جراچي" }])}
      <div class="container two-col">
        <div data-garage-list></div>
        <aside class="aside"><form class="card card-pad" data-garage-add><h3 style="font-size:18px" class="mb-16">${icon("plus", "")} أضف موتوسيكل</h3><div class="form-grid">
          <div class="field"><label for="gModel">الموديل</label><select class="select" id="gModel" required>${AZ.modelOptions("")}</select></div>
          <div class="field"><label for="gYear">سنة الصنع</label><select class="select" id="gYear">${AZ.yearOptions("")}</select></div>
          <div data-g-preview></div>
          <button class="btn btn-primary btn-block">${icon("garage")}احفظ في جراچي</button></div></form></aside>
      </div>`;
    },
    mount(root) {
      const draw = () => {
        const list = AZ.garage.list(); const ai = AZ.garage.activeIndex();
        const h = $("[data-garage-list]", root);
        h.innerHTML = list.length ? `<div class="grid" style="gap:12px">${list.map((g, i) => { const m = AZ.catalog.model(g.model); if (!m) return ""; const n = AZ.catalog.forModel(g.model, g.year).length; return `<div class="garage-card ${i === ai ? "active" : ""}"><img src="${m.cutout}" alt=""><div style="flex:1;min-width:0"><b class="ltr" style="font-size:17px;display:block;text-align:right">${esc(m.name)}</b><span class="small muted">${g.year ? `موديل ${g.year} · ` : ""}${n} قطعة متوافقة</span><div class="flex gap-8 wrap mt-8">${i === ai ? `<span class="badge badge-orange">${icon("check")}الموتوسيكل النشط</span>` : `<button class="btn btn-outline btn-sm" data-g-active="${i}">اجعله النشط</button>`}<a class="btn btn-ghost btn-sm" href="#/shop?model=${m.slug}${g.year ? `&year=${g.year}` : ""}">عرض القطع</a><button class="btn btn-ghost btn-sm" data-g-rm="${g.id}" aria-label="حذف">${icon("trash")}</button></div></div></div>`; }).join("")}</div>${ai >= 0 ? `<button class="btn btn-ghost btn-sm mt-12" data-g-off>إيقاف تمييز القطع المتوافقة</button>` : ""}` : `<div class="card">${ui.empty("garage", "جراچك فاضي", "أضف موديل موتوسيكلك وسنة الصنع، وهنميّز لك القطع المتوافقة بعلامة ✓ في كل المتجر.")}</div>`;
        ui.observe(h);
      };
      draw();
      AZ.onPage("garage", draw);
      const gm = $("#gModel", root), gy = $("#gYear", root), pv = $("[data-g-preview]", root);
      gm.addEventListener("change", () => { gy.innerHTML = AZ.yearOptions(gm.value); const m = AZ.catalog.model(gm.value); pv.innerHTML = m ? `<img src="${m.cutout}" alt="" style="width:100%;animation:bikeIn .8s var(--ease) both">` : ""; });
      $("[data-garage-add]", root).addEventListener("submit", (e) => { e.preventDefault(); if (!gm.value) { gm.focus(); return AZ.toast("اختر الموديل", { type: "error" }); } AZ.garage.add(gm.value, gy.value); AZ.toast("تم الحفظ في جراچي", { icon: "garage" }); });
      root.addEventListener("click", (e) => {
        const a = e.target.closest("[data-g-active]"); if (a) return AZ.garage.setActive(Number(a.dataset.gActive));
        const r = e.target.closest("[data-g-rm]"); if (r) return AZ.garage.remove(r.dataset.gRm);
        if (e.target.closest("[data-g-off]")) AZ.garage.clearActive();
      });
    },
  };

  /* ======================= INFO PAGES ======================= */
  pages.about = {
    title: "من نحن | عزاب موتو",
    render() {
      return `${ui.pageHead("من نحن", "عزاب موتو — وكيل معتمد لقطع غيار TVS.", [{ label: "من نحن" }])}
      <section class="section-sm"><div class="container">
        <div class="help-band reveal" style="background:linear-gradient(135deg,#17191d,#2a2e35)"><div><div class="eyebrow" style="color:var(--orange)">قصتنا</div><h2>متخصصين في TVS<br>من الموتوسيكل للتوك توك</h2><p>عزاب موتو متجر متخصص في قطع غيار TVS بصفته وكيل معتمد. بنغطي عائلة TVS كاملة: موتوسيكلات Apache وRonin، موديلات التجوال زي Raider وStar HLX، سكوترات NTORQ وJupiter، الموديلات الكهربائية، وموتوسيكل الخدمة XL100 والتوك توك King.</p><p>هدفنا إنك توصل للقطعة الصح لموديلك من غير لف ولا تخمين: كتالوج منظم حسب الموديل والسنة، معلومات واضحة لكل قطعة، ودفع عند الاستلام.</p></div><img src="${ui.LOGO}" alt="AZZAB MOTO" style="width:min(320px,100%);margin-inline:auto;border-radius:32px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6)"></div>
        <div class="grid grid-trust mt-32">${[["seal", "وكيل معتمد", "قطع TVS الأصلية مع تصنيف واضح لأي بديل."], ["bike", "كل موديلات TVS", `${D.models.length} موديل من كل الفئات.`], ["headset", "دعم فني", "مساعدة في تحديد القطعة بالصورة أو رقم القطعة."]].map(([ic, t, d], i) => `<div class="trust-card reveal" style="--d:${i * 80}ms"><div class="ic">${icon(ic)}</div><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
      </div></section>`;
    },
  };

  pages.contact = {
    title: "تواصل معنا | عزاب موتو",
    render() {
      return `${ui.pageHead("تواصل معنا", "فريقنا جاهز يساعدك تختار القطعة الصح.", [{ label: "تواصل معنا" }])}
      <div class="container two-col">
        <form class="card card-pad" data-contact novalidate><h2 style="font-size:20px" class="mb-16">ابعتلنا رسالتك</h2><div class="form-grid cols-2">
          ${fld("name", "الاسم", { req: 1 })}${fld("phone", "رقم الموبايل", { req: 1, dir: "ltr", inputmode: "tel", ph: "01xxxxxxxxx" })}
          <div class="field span-2"><label for="f_model">الموتوسيكل (اختياري)</label><select class="select" id="f_model" name="model">${AZ.modelOptions("", "اختر الموديل")}</select></div>
          ${fld("msg", "رسالتك", { req: 1, type: "textarea", span: 1, ph: "اكتب اسم القطعة أو وصف المشكلة…" })}</div>
          <button class="btn btn-whatsapp btn-lg btn-block mt-16">${icon("whatsapp")}أرسل عبر واتساب</button>
          <p class="small muted mt-12">هتتفتح رسالة واتساب جاهزة ببياناتك، وانت اللي بتبعتها.</p>
        </form>
        <aside class="aside"><div class="card card-pad"><h3 style="font-size:18px" class="mb-16">بيانات التواصل</h3><ul class="grid" style="gap:12px" data-footer-contact>${ui.contactList()}</ul><div class="notice mt-16">${icon("info")}<span>بيانات التواصل الرسمية تُضاف من لوحة التحكم ← الإعدادات.</span></div></div></aside>
      </div>`;
    },
    mount(root) {
      const f = $("[data-contact]", root);
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = AZ.validate(f, { name: { required: "الاسم مطلوب" }, phone: { required: "الموبايل مطلوب", phone: "رقم غير صحيح" }, msg: { required: "اكتب رسالتك", min: [5, "الرسالة قصيرة"] } });
        if (!v) return;
        const m = AZ.catalog.model(f.elements.model.value);
        const text = `مرحبًا عزاب موتو 👋\nالاسم: ${v.name}\nالموبايل: ${v.phone}${m ? `\nالموتوسيكل: ${m.name}` : ""}\n\n${v.msg}`;
        if (!AZ.wa.configured()) AZ.toast("رقم واتساب المتجر لم يُضبط بعد — اختر جهة الاتصال يدويًا", { icon: "info" });
        AZ.openExternal(AZ.wa.link(text));
      });
    },
  };

  const FAQ = [
    ["هل عزاب موتو وكيل معتمد لـ TVS؟", "أيوه، عزاب موتو وكيل معتمد لقطع غيار TVS. وكل منتج مكتوب عليه بوضوح إذا كان أصلي TVS أو بديل (Aftermarket)."],
    ["إزاي أعرف إن القطعة مناسبة لموتوسيكلي؟", "أضف موتوسيكلك وسنة الصنع في جراچي، وكل القطع المتوافقة هتظهر عليها علامة ✓. وكمان كل صفحة منتج فيها جدول توافق بالموديلات والسنين. ولو لسه مش متأكد ابعتلنا صورة القطعة على واتساب."],
    ["إيه طرق الدفع المتاحة؟", "الدفع عند الاستلام فقط. بتدفع نقدًا للمندوب لما الطلب يوصلك."],
    ["الشحن بياخد قد إيه وبكام؟", "بنشحن لكل محافظات مصر. التكلفة من 60 ج.م حسب المحافظة، والمدة المتوقعة من يوم لـ 8 أيام عمل. الطلبات فوق 3000 ج.م شحنها مجاني."],
    ["أقدر أرجع أو أستبدل القطعة؟", "أيوه، خلال 14 يوم من الاستلام بشرط إن القطعة متركبتش وفي تغليفها الأصلي. القطع الكهربائية بعد التركيب بتتبدل في حالة عيب الصناعة فقط."],
    ["عندي موتوسيكل TVS مستورد مش موجود في مصر، ألاقي قطعه؟", "الكتالوج بيغطي كل موديلات TVS حتى المش مطروحة رسميًا في مصر زي Apache RTR 310 وJupiter وNTORQ 150. ولو قطعة مش موجودة تواصل معانا ونطلبهالك."],
    ["إيه الفرق بين الأصلي والبديل؟", "الأصلي هو قطعة TVS الأصلية. البديل (Aftermarket) قطعة من ماركة تانية بمواصفات مناسبة وسعر أقل غالبًا. التصنيف مكتوب على كل منتج."],
    ["هل في خصم لأصحاب الورش ومراكز الصيانة؟", "أيوه، في خصم خاص لأصحاب الورش ومراكز الصيانة. كلمنا على واتساب 01141334668 وابعت اسم الورشة والمحافظة وهنبعتلك التفاصيل."],
    ["إزاي أتابع طلبي؟", "من صفحة تتبع الطلب برقم الطلب ورقم الموبايل، أو من حسابك ← طلباتي."],
  ];
  pages.faq = {
    title: "الأسئلة الشائعة | عزاب موتو",
    render() {
      return `${ui.pageHead("الأسئلة الشائعة", null, [{ label: "الأسئلة الشائعة" }])}<section class="section-sm"><div class="container" style="max-width:860px">${FAQ.map(([q, a], i) => `<div class="acc-item reveal ${i === 0 ? "open" : ""}" style="--d:${i * 50}ms"><button aria-expanded="${i === 0}" aria-controls="faq${i}">${esc(q)}${icon("plus")}</button><div class="acc-panel" id="faq${i}" role="region"><div><p>${esc(a)}</p></div></div></div>`).join("")}
        <div class="card card-pad mt-24 center"><h3>لسه عندك سؤال؟</h3><p class="muted mt-8 mb-16">كلمنا على واتساب وهنرد عليك.</p><a class="btn btn-whatsapp" href="#" data-wa="general">${icon("whatsapp")}تواصل معنا</a></div></div></section>`;
    },
    mount(root) {
      root.addEventListener("click", (e) => { const b = e.target.closest(".acc-item > button"); if (!b) return; const it = b.parentElement; it.classList.toggle("open"); b.setAttribute("aria-expanded", it.classList.contains("open")); });
    },
  };

  const POLICIES = {
    shipping: ["سياسة الشحن", `<h2>مناطق الشحن</h2><p>نشحن لكل محافظات جمهورية مصر العربية.</p><h2>التكلفة والمدة</h2><div class="table-wrap"><table class="table"><thead><tr><th>المحافظة</th><th>تكلفة الشحن</th><th>المدة المتوقعة</th></tr></thead><tbody>${D.shipping.map((s) => `<tr><td>${s.gov}</td><td class="num">${AZ.moneyText(s.fee)}</td><td>${s.eta}</td></tr>`).join("")}</tbody></table></div><p class="mt-16">الطلبات التي تتجاوز ${AZ.moneyText(D.FREE_SHIPPING_OVER)} تُشحن مجانًا. المدد تقديرية وقد تتأثر بالعطلات الرسمية.</p><h2>الدفع</h2><p>الدفع عند الاستلام فقط.</p>`],
    returns: ["سياسة الاستبدال والاسترجاع", `<h2>مدة الاسترجاع</h2><p>يمكنك طلب الاستبدال أو الاسترجاع خلال 14 يومًا من تاريخ الاستلام.</p><h2>الشروط</h2><ul><li>أن تكون القطعة غير مركبة وبحالتها الأصلية.</li><li>وجود التغليف الأصلي وفاتورة الطلب.</li><li>القطع الكهربائية بعد التركيب تُستبدل في حالة عيب الصناعة فقط.</li><li>الزيوت والسوائل المفتوحة لا تُسترد.</li></ul><h2>تكلفة الإرجاع</h2><p>في حالة عيب الصناعة أو خطأ في الطلب من جهتنا نتحمل تكلفة الشحن. غير ذلك يتحمل العميل تكلفة الإرجاع.</p>`],
    privacy: ["سياسة الخصوصية", `<p>نستخدم بياناتك (الاسم، رقم الموبايل، العنوان) فقط لتنفيذ طلبك والتواصل معك بخصوصه.</p><h2>في هذا الإصدار</h2><p>هذا الإصدار من الموقع يحفظ بياناتك (السلة، المفضلة، الطلبات، الحساب) داخل متصفحك فقط ولا يرسلها لأي خادم.</p><h2>مشاركة البيانات</h2><p>لا نبيع بياناتك ولا نشاركها إلا مع شركة الشحن بالقدر اللازم لتوصيل الطلب.</p>`],
    terms: ["الشروط والأحكام", `<ul><li>الأسعار المعروضة بالجنيه المصري وقابلة للتغيير، والسعر المعتمد هو سعر وقت تأكيد الطلب.</li><li>يتم تأكيد الطلب هاتفيًا قبل الشحن.</li><li>الصور توضيحية وقد يختلف شكل القطعة الفعلي حسب إصدار الموديل.</li><li>نوصي بتركيب القطع الفنية في مركز صيانة متخصص.</li><li>TVS علامة تجارية مملوكة لشركة TVS Motor Company.</li></ul>`],
  };
  pages.policy = {
    title: (p) => `${(POLICIES[p[0]] || ["السياسات"])[0]} | عزاب موتو`,
    render(params) {
      const pol = POLICIES[params[0]];
      if (!pol) return pages.notFound.render();
      return `${ui.pageHead(pol[0], null, [{ label: pol[0] }])}<section class="section-sm"><div class="container" style="max-width:860px"><div class="card card-pad prose">${pol[1]}</div><div class="flex gap-8 wrap mt-16">${Object.entries(POLICIES).filter(([k]) => k !== params[0]).map(([k, v]) => `<a class="pill" style="display:inline-flex;align-items:center" href="#/policies/${k}">${v[0]}</a>`).join("")}</div></div></section>`;
    },
  };

  pages.credits = {
    title: "حقوق الصور | عزاب موتو",
    render() {
      const c = (AZ.photos && AZ.photos.credits) || [];
      return `${ui.pageHead("حقوق الصور", "الصور الحقيقية المستخدمة في الموقع وتراخيصها.", [{ label: "حقوق الصور" }])}<section class="section-sm"><div class="container" style="max-width:860px"><div class="card card-pad prose"><p>الصور الحقيقية للموديلات والقطع مأخوذة من Wikimedia Commons بتراخيص حرة (مثل CC BY-SA). صفحة كل صورة فيها اسم المصوّر ونوع الترخيص. صور القطع توضيحية للنوع وليست صورة القطعة المحددة. باقي الصور رسومات توضيحية خاصة بالموقع.</p><div class="table-wrap mt-16"><table class="table"><thead><tr><th>العنصر</th><th>الملف على Wikimedia Commons</th></tr></thead><tbody>${c.map((x) => `<tr><td>${esc(x.what)}</td><td><a class="ltr" href="${esc(x.url)}" target="_blank" rel="noopener" style="color:var(--orange-600);font-weight:700">${esc(x.file)}</a></td></tr>`).join("")}</tbody></table></div><p class="mt-16 small muted">TVS وأسماء موديلاتها علامات تجارية مملوكة لـ TVS Motor Company.</p></div></div></section>`;
    },
  };

  pages.notFound = {
    title: "الصفحة غير موجودة | عزاب موتو",
    render() { return `<div class="container section">${ui.empty("alert", "الصفحة غير موجودة", "الرابط ده مش موجود أو اتنقل. جرّب البحث أو ارجع للرئيسية.", `<div class="flex gap-8" style="justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="#/">الرئيسية</a><a class="btn btn-outline" href="#/shop">المتجر</a></div>`)}</div>`; },
  };

  /* ======================= SEO per page ======================= */
  ["cart", "checkout", "success", "wishlist", "login", "register", "account", "accountOrders", "garage", "notFound"].forEach((k) => { if (pages[k]) pages[k].seo = () => ({ noindex: true }); });
  pages.track.seo = () => ({ description: "تتبع طلبك من عزاب موتو برقم الطلب ورقم الموبايل." });
  pages.about.seo = () => ({ description: "عزاب موتو وكيل معتمد لقطع غيار TVS في مصر — متخصصين في كل موديلات TVS من الموتوسيكلات والسكوترات والكهربائي للتوك توك King.", crumbs: [{ name: "من نحن", path: "/about" }] });
  pages.contact.seo = () => ({ description: "تواصل مع عزاب موتو على واتساب لاختيار قطعة الغيار المناسبة لموتوسيكل TVS بتاعك.", crumbs: [{ name: "تواصل معنا", path: "/contact" }] });
  pages.faq.seo = () => ({ description: "أسئلة شائعة عن قطع غيار TVS والشحن والدفع عند الاستلام والاسترجاع في عزاب موتو.", crumbs: [{ name: "الأسئلة الشائعة", path: "/faq" }], jsonld: { "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) } });
  pages.policy.seo = (params) => ({ description: `${(POLICIES[params[0]] || ["سياسات المتجر"])[0]} — عزاب موتو.` });
  pages.credits.seo = () => ({ noindex: true });
})();
