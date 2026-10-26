/* AZZAB MOTO — storefront pages */
(function () {
  "use strict";
  const AZ = window.AZ;
  const { esc, icon, money, $, $$, ui } = AZ;
  const D = AZ.data;
  const pages = (AZ.pages = AZ.pages || {});

  const modelOptions = (selected, placeholder = "اختر الموديل") =>
    `<option value="">${placeholder}</option>` +
    D.families.map((f) => `<optgroup label="${esc(f.name)}">${D.models.filter((m) => m.family === f.id).map((m) => `<option value="${m.slug}" ${m.slug === selected ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</optgroup>`).join("");
  const yearOptions = (slug, selected) => {
    const m = AZ.catalog.model(slug);
    return `<option value="">كل السنوات</option>` + (m ? m.years.slice().reverse().map((y) => `<option value="${y}" ${String(y) === String(selected) ? "selected" : ""}>${y}</option>`).join("") : "");
  };
  AZ.modelOptions = modelOptions;
  AZ.yearOptions = yearOptions;

  /* ======================= HOME ======================= */
  pages.home = {
    title: "عزاب موتو | وكيل معتمد TVS — قطع غيار موتوسيكلات وسكوترات TVS",
    render() {
      const best = AZ.catalog.products().filter((p) => p.bestSeller && p.stock > 0).sort((a, b) => b.popularity - a.popularity);
      const total = AZ.catalog.products().length;
      const heroBike = AZ.catalog.model("apache-rtr-200-4v");
      const words = (s, start = 0) => s.split(" ").map((w, i) => `<span class="word" style="--i:${i + start}">${w}</span>`).join(" ");
      return `
      <section class="hero" aria-label="مقدمة" data-anim>
        <div class="container hero-inner">
          <div class="hero-copy">
            <div class="hero-badge fade-up" style="--d:100ms"><span>وكيل معتمد لقطع غيار TVS في مصر</span><span class="seal">${icon("seal")}</span></div>
            <h1>${words("كل قطعة غيار")} <span class="accent">${words("لموتوسيكلك", 3)}</span><br>${words("في مكان واحد.", 4)}</h1>
            <p class="hero-sub fade-up" style="--d:650ms">اختار موديل TVS، اكتشف قطع الغيار المناسبة، واطلبها بسهولة من عزاب موتو.</p>
            <div class="hero-cta fade-up" style="--d:800ms">
              <a class="btn btn-primary btn-lg magnetic" href="#/shop">${icon("bag")}تسوق قطع الغيار</a>
              <a class="btn btn-outline btn-lg magnetic" href="#/motorcycles">${icon("bike")}اختار موتوسيكلك</a>
            </div>
            <div class="hero-stats fade-up" style="--d:950ms">
              <div class="s"><b class="num">${D.models.length}</b><span>موديل TVS</span></div><div class="sep"></div>
              <div class="s"><b class="num">${total}+</b><span>قطعة غيار</span></div><div class="sep"></div>
              <div class="s"><b class="num">27</b><span>محافظة نوصلها</span></div>
            </div>
          </div>
          <div class="hero-visual" data-hero-visual>
            <div class="hero-word" aria-hidden="true">TVS</div>
            <div class="hero-glow"></div><div class="hero-ring"></div>
            <div class="hero-streaks" aria-hidden="true">${[18, 34, 52, 68, 80].map((t, i) => `<span style="top:${t}%;right:${8 + (i % 3) * 6}%;width:${90 + i * 22}px;animation-delay:${i * 0.45}s"></span>`).join("")}</div>
            <div class="parallax" data-parallax style="position:absolute;inset:0"><div class="hero-bike ${heroBike && heroBike.photoCut ? "is-real" : ""}" data-hero-bike>${heroBike && heroBike.photoCut ? `<img class="hero-real" src="${heroBike.photoCut}" alt="${esc(heroBike.name)}" fetchpriority="high">` : `<img class="hero-real" src="${heroBike.image}" alt="${esc(heroBike.name)}">`}<span class="hero-flare" aria-hidden="true"></span></div></div>
            <div class="hero-floor"></div>
            <div class="float-card" style="--d:1.1s;top:8%;right:4%"><span class="ic">${icon("seal")}</span><div>وكيل معتمد<small>قطع TVS الأصلية</small></div></div>
            <div class="float-card" style="--d:1.3s;bottom:12%;left:2%"><span class="ic">${icon("cash")}</span><div>الدفع عند الاستلام<small>في كل المحافظات</small></div></div>
            <div class="float-card" style="--d:1.5s;top:2%;left:6%"><span class="ic">${icon("wrench")}</span><div>القطعة الصح لموديلك<small>فلترة حسب الموديل والسنة</small></div></div>
          </div>
        </div>
      </section>

      <div class="container">
        <form class="finder reveal" data-finder>
          <h3>${icon("bike")}اعثر على القطع المناسبة لموتوسيكلك</h3>
          <div class="finder-grid">
            <div class="field"><label for="fModel">الموديل</label><select class="select" id="fModel" required>${modelOptions(AZ.garage.active() ? AZ.garage.active().model : "")}</select></div>
            <div class="field"><label for="fCat">القسم</label><select class="select" id="fCat"><option value="">كل الأقسام</option>${AZ.catalog.categories().map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>
            <div class="field"><label for="fYear">سنة الصنع</label><select class="select" id="fYear">${yearOptions(AZ.garage.active() ? AZ.garage.active().model : "")}</select></div>
            <button class="btn btn-primary btn-lg" type="submit">${icon("search")}اعرض القطع</button>
          </div>
          <label class="check mt-8"><input type="checkbox" id="fSave" checked> احفظ الموتوسيكل في جراچي لتمييز القطع المتوافقة</label>
        </form>
      </div>

      <div class="ticker" aria-hidden="true" data-anim>
        <div class="ticker-row">${[0, 1].map(() => `<div class="ticker-track">${D.models.map((m) => `<span>${esc(m.short)}</span><i>✦</i>`).join("")}</div>`).join("")}</div>
        <div class="ticker-row rev">${[0, 1].map(() => `<div class="ticker-track">${AZ.catalog.categories().map((c) => `<span>${esc(c.name)}</span><i>●</i>`).join("")}</div>`).join("")}</div>
      </div>

      <section class="explode" data-explode aria-labelledby="explode-h">
        <div class="explode-stage">
          <div class="container explode-head"><div class="eyebrow">من الكاوتش للبوجيه</div><h2 class="section-title" id="explode-h">كل قطعة في موتوسيكلك… عندنا</h2><p class="section-sub">مرّر لأسفل وشوف الموتوسيكل يتفكك لقطع الغيار اللي بنوفرها لكل موديلات TVS.</p></div>
          <div class="explode-canvas">
            <img class="explode-bike" src="${(AZ.catalog.model("apache-rtr-160") || {}).photoCut || (AZ.catalog.model("apache-rtr-200-4v") || {}).photoCut || ""}" alt="" data-ex-bike>
            ${[["brake-disc", "brakes", 14, 22], ["piston", "engine", 86, 18], ["spark-plug", "electrical", 92, 58], ["battery", "batteries", 72, 82], ["chain", "chains", 28, 84], ["shock-absorber", "suspension", 6, 62], ["headlight", "lighting", 50, 15], ["oil-bottle", "oil", 50, 88]].map(([art, cat, x, y], i) => { const c = AZ.catalog.category(cat); return `<a class="ex-part" href="#/shop?cat=${cat}" data-ex-part style="--tx:${x}%;--ty:${y}%;--i:${i}"><img src="assets/img/parts/${art}-orange-t.svg" alt=""><span class="ex-label">${esc(c ? c.name : cat)}<b>${AZ.catalog.products().filter((p) => p.category === cat).length} قطعة</b></span></a>`; }).join("")}
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="models-h">
        <div class="container">
          ${ui.sectionHead("كل موديلات TVS", `<span id="models-h">اختار موتوسيكلك</span>`, "من Apache لـ NTORQ والتوك توك King — كل موديل بقطع غياره المتوافقة.", { href: "#/motorcycles", label: "كل الموديلات" })}
          <div class="pill-tabs mb-16 reveal" role="tablist" data-family-tabs>
            <button class="pill active" data-fam="egypt" role="tab" aria-selected="true">متاح في مصر</button>
            ${D.families.map((f) => `<button class="pill" data-fam="${f.id}" role="tab" aria-selected="false">${esc(f.short)}</button>`).join("")}
            <button class="pill" data-fam="all" role="tab" aria-selected="false">الكل</button>
          </div>
          <div class="models-scroller" data-models></div>
        </div>
      </section>

      <div class="dealer-strip"><div class="container">
        <span class="it">${icon("seal")}وكيل معتمد TVS</span><span class="it">${icon("cash")}الدفع عند الاستلام</span><span class="it">${icon("truck")}شحن لكل المحافظات</span><span class="it">${icon("headset")}مساعدة في اختيار القطعة</span>
      </div></div>

      <section class="section-sm" aria-labelledby="ws-h"><div class="container">
        <div class="workshop reveal">
          <div class="ws-ic">${icon("wrench")}</div>
          <div class="ws-txt"><span class="badge badge-orange">للورش ومراكز الصيانة</span><h2 id="ws-h">خصم خاص لأصحاب الورش ومراكز الصيانة</h2><p>بتشتغل على موتوسيكلات TVS؟ كلمنا على واتساب وابعت اسم الورشة والمحافظة، وهنبعتلك تفاصيل الخصم الخاص.</p></div>
          <a class="btn btn-whatsapp btn-lg magnetic" href="#" data-wa="workshop">${icon("whatsapp")}اطلب خصم الورش</a>
        </div>
      </div></section>

      <section class="section bg-white" aria-labelledby="cats-h">
        <div class="container">
          ${ui.sectionHead("تسوق حسب القسم", `<span id="cats-h">كل اللي موتوسيكلك محتاجه</span>`, null, { href: "#/categories", label: "كل الأقسام" })}
          <div class="grid grid-cats">${AZ.catalog.categories().map((c, i) => ui.catTile(c, i)).join("")}</div>
        </div>
      </section>

      <section class="section" aria-labelledby="best-h">
        <div class="container">
          ${ui.sectionHead("الأكثر طلبًا", `<span id="best-h">القطع الأكثر مبيعًا</span>`, "قطع الصيانة الدورية الأكثر طلبًا لموديلات TVS المنتشرة في مصر.", { href: "#/shop?sort=popular", label: "عرض المزيد" })}
          <div class="pill-tabs mb-16 reveal" data-best-tabs>
            ${[["", "الكل"], ["brakes", "الفرامل"], ["filters", "الفلاتر"], ["electrical", "الكهرباء"], ["tires", "الكاوتش"], ["oil", "الزيوت"]].map(([k, l], i) => `<button class="pill ${i === 0 ? "active" : ""}" data-best="${k}">${l}</button>`).join("")}
          </div>
          <div class="grid grid-products" data-best-grid>${best.slice(0, 8).map(ui.productCard).join("")}</div>
        </div>
      </section>

      ${(() => {
        const deal = AZ.catalog.products().filter((p) => p.oldPrice && p.stock > 3).sort((a, b) => ui.discount(b) - ui.discount(a) || b.popularity - a.popularity)[0];
        if (!deal) return "";
        const off = ui.discount(deal);
        return `<section class="deal" aria-labelledby="deal-h" data-anim><div class="container deal-inner">
          <div class="deal-copy reveal">
            <span class="badge badge-orange">${icon("zap")}عرض اليوم</span>
            <h2 id="deal-h">${esc(deal.name)}</h2>
            <p>${esc(AZ.catalog.compatNames(deal, 3))} · ${deal.classification === "original" ? "أصلي TVS" : "بديل"}</p>
            <div class="deal-price"><b class="num">${money(deal.price)}</b><s class="num">${AZ.moneyText(deal.oldPrice)}</s><span class="deal-off">-${off}%</span></div>
            <div class="countdown" data-countdown aria-label="الوقت المتبقي على العرض">${["ساعة", "دقيقة", "ثانية"].map((l) => `<div><b class="num">00</b><span>${l}</span></div>`).join("")}</div>
            <div class="hero-cta"><button class="btn btn-primary btn-lg magnetic" data-add="${deal.id}">${icon("cart")}أضف للسلة</button><a class="btn btn-lg deal-more" href="#/products/${deal.slug}">التفاصيل</a></div>
            <small class="deal-note">عرض تجريبي لعرض شكل المتجر</small>
          </div>
          <a class="deal-visual reveal-scale" href="#/products/${deal.slug}" aria-label="${esc(deal.name)}"><span class="deal-burst">-${off}%</span><img src="${deal.photo || `assets/img/parts/${deal.art}-${deal.tint}-t.svg`}" alt="${esc(deal.name)}" loading="lazy"></a>
        </div></section>`;
      })()}

      <section class="section-sm" aria-label="عروض">
        <div class="container promo-grid">
          <a class="promo promo-big reveal-scale" href="#/bundles"><span class="stripe"></span><span class="badge badge-orange" style="align-self:flex-start;margin-bottom:12px">${icon("percent")}وفر حتى 15%</span><h3>عروض الصيانة الدورية</h3><p>أطقم صيانة جاهزة لكل موديل: زيت، فلاتر، بوجيه وتيل فرامل بسعر أقل.</p><span class="btn btn-primary">شوف الأطقم ${icon("arrowL")}</span><img src="assets/img/parts/oil-bottle-orange-t.svg" alt="" loading="lazy" style="width:40%;left:2%;bottom:4%"><img src="assets/img/parts/oil-filter-silver-t.svg" alt="" loading="lazy" style="width:26%;left:30%;bottom:-2%"><span class="note">عروض تجريبية</span></a>
          <a class="promo orange reveal-scale" style="--d:100ms" href="#/shop?cat=brakes"><h3>جهّز موتوسيكلك بأفضل قطع الغيار</h3><p>فرامل، كاوتش وإضاءة لأمان أعلى على الطريق.</p><img src="assets/img/parts/brake-disc-silver-t.svg" alt="" loading="lazy" style="width:44%"></a>
          <a class="promo silver reveal-scale" style="--d:200ms" href="#/motorcycles"><h3>اختار القطعة المناسبة لموديلك</h3><p>فلترة دقيقة حسب الموديل وسنة الصنع.</p><img src="${(AZ.catalog.model("star-hlx-150") || {}).cutout}" alt="" loading="lazy" style="width:52%;left:-4%"></a>
        </div>
      </section>

      <section class="section" aria-labelledby="bundles-h">
        <div class="container">
          ${ui.sectionHead("أطقم الصيانة", `<span id="bundles-h">كل اللي محتاجه في طقم واحد</span>`, "أطقم مجمّعة لكل موديل بسعر أقل من شراء القطع منفصلة.", { href: "#/bundles", label: "كل الأطقم" })}
          <div class="grid grid-bundles">${D.bundles.slice(0, 3).map(ui.bundleCard).join("")}</div>
        </div>
      </section>

      ${(() => { const ph = D.models.filter((m) => m.photoLocal || m.photoCut); if (!ph.length) return ""; return `<section class="photo-band" aria-label="موديلات TVS" data-anim>
        <div class="photo-band-track">${ph.map((m, i) => `<a class="photo-tile ${m.photoCut ? "is-cut" : "is-photo"}" href="#/motorcycles/${m.slug}" style="--i:${i}"><img src="${m.photoCut || m.photo}" alt="${esc(m.name)}" loading="lazy"><span><b class="ltr">${esc(m.name)}</b><small>اكتشف قطع الغيار ←</small></span></a>`).join("")}</div>
      </section>`; })()}
      <section class="section dark-section" aria-label="أرقام">
        <div class="container">
          <div class="counters">
            <div class="counter reveal"><b class="num" data-count="${D.models.length}">0</b><span>موديل TVS مدعوم</span></div>
            <div class="counter reveal" style="--d:100ms"><b class="num" data-count="${total}" data-suffix="+">0</b><span>قطعة غيار في الكتالوج</span></div>
            <div class="counter reveal" style="--d:200ms"><b class="num" data-count="12">0</b><span>قسم قطع غيار</span></div>
            <div class="counter reveal" style="--d:300ms"><b class="num" data-count="27">0</b><span>محافظة بنوصلها</span></div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="help-h">
        <div class="container">
          <div class="help-band reveal">
            <div>
              <div class="eyebrow" style="color:var(--orange)">مساعدة فورية</div>
              <h2 id="help-h">مش عارف اسم القطعة؟<br>ابعتلنا صورتها!</h2>
              <p>صوّر القطعة القديمة أو المكان اللي فيه المشكلة وابعتها على واتساب مع موديل الموتوسيكل وسنة الصنع، وفريقنا يحددلك القطعة المناسبة.</p>
              <div class="hero-cta"><a class="btn btn-whatsapp btn-lg magnetic" href="#" data-wa="part">${icon("whatsapp")}ابعت صورة القطعة</a><a class="btn btn-lg" style="background:#23262c;color:#fff" href="#/faq">${icon("info")}الأسئلة الشائعة</a></div>
            </div>
            <div class="phone-mock reveal" data-chat><div class="phone-screen">
              <div class="phone-top"><img src="${ui.LOGO}" alt="">عزاب موتو · وكيل معتمد TVS</div>
              <div class="chat">
                <div class="bubble me"><div class="img" style="background-image:url(assets/img/parts/brake-pads-charcoal-a.svg)"></div>محتاج دي لـ Apache RTR 160 4V موديل 2022</div>
                <div class="bubble them">أهلًا بيك 👋 دي تيل فرامل أمامي، متوفرة أصلي TVS</div>
                <div class="bubble them">تحب نضيفها لطلبك؟ الدفع عند الاستلام ✅</div>
                <div class="bubble me">تمام، ابعتوها 🙏</div>
              </div>
            </div></div>
          </div>
        </div>
      </section>

      <section class="section bg-white" aria-labelledby="why-h">
        <div class="container">
          ${ui.sectionHead("ليه عزاب موتو؟", `<span id="why-h">شريكك في صيانة موتوسيكل TVS</span>`)}
          <div class="grid grid-trust">
            ${[
              ["seal", "وكيل معتمد TVS", "قطع غيار TVS الأصلية لكل الموديلات، مع بدائل موثوقة بوضوح كامل في التصنيف.", true],
              ["bike", "متخصصين في TVS", "كتالوج مبني على موديلات TVS فقط، من Apache وRonin لـ NTORQ وXL100 والتوك توك King."],
              ["wrench", "مساعدة في اختيار القطعة", "مش متأكد؟ ابعتلنا صورة أو رقم القطعة وفريقنا يرشحلك المناسب لموديلك وسنته."],
              ["file", "معلومات واضحة لكل قطعة", "SKU ورقم القطعة وجدول التوافق والمواصفات في صفحة كل منتج."],
              ["cash", "طلب سهل والدفع عند الاستلام", "أطلب في دقيقة، وادفع لما الطلب يوصلك. بدون كروت ولا تحويلات."],
              ["headset", "خدمة عملاء", "متابعة طلبك وأي استفسار على واتساب وبالتليفون."],
            ].map(([ic, t, d, f], i) => `<div class="trust-card reveal ${f ? "featured" : ""}" style="--d:${(i % 3) * 80}ms"><div class="ic">${icon(ic)}</div><h3>${t}</h3><p>${d}</p></div>`).join("")}
          </div>
        </div>
      </section>`;
    },
    mount(root) {
      // models with family tabs
      const host = $("[data-models]", root);
      const showFam = (fam) => {
        const list = fam === "all" ? D.models : fam === "egypt" ? D.models.filter((m) => m.egypt) : D.models.filter((m) => m.family === fam);
        host.innerHTML = list.map((m, i) => ui.modelCard(m, i)).join("");
        host.scrollLeft = 0;
        ui.observe(host);
      };
      showFam("egypt");
      $("[data-family-tabs]", root).addEventListener("click", (e) => {
        const b = e.target.closest("[data-fam]"); if (!b) return;
        $$("[data-fam]", root).forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
        showFam(b.dataset.fam);
      });
      // best sellers tabs
      $("[data-best-tabs]", root).addEventListener("click", (e) => {
        const b = e.target.closest("[data-best]"); if (!b) return;
        $$("[data-best]", root).forEach((x) => x.classList.toggle("active", x === b));
        const list = AZ.catalog.products().filter((p) => p.stock > 0 && (b.dataset.best ? p.category === b.dataset.best : p.bestSeller)).sort((a, c) => c.popularity - a.popularity).slice(0, 8);
        const g = $("[data-best-grid]", root); g.innerHTML = list.map(ui.productCard).join(""); ui.observe(g);
      });
      // finder
      const fm = $("#fModel", root), fy = $("#fYear", root);
      fm.addEventListener("change", () => { fy.innerHTML = yearOptions(fm.value); });
      $("[data-finder]", root).addEventListener("submit", (e) => {
        e.preventDefault();
        if (!fm.value) { fm.focus(); AZ.toast("اختر موديل الموتوسيكل أولًا", { type: "error" }); return; }
        if ($("#fSave", root).checked) AZ.garage.add(fm.value, fy.value);
        const q = new URLSearchParams({ model: fm.value }); if (fy.value) q.set("year", fy.value); if ($("#fCat", root).value) q.set("cat", $("#fCat", root).value);
        AZ.go(`#/shop?${q}`);
      });
      // hero parallax
      const vis = $("[data-hero-visual]", root), par = $("[data-parallax]", root);
      if (!AZ.reduced() && vis) {
        vis.addEventListener("mousemove", (e) => { const r = vis.getBoundingClientRect(); par.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * -18}px, ${((e.clientY - r.top) / r.height - 0.5) * -12}px)`; });
        vis.addEventListener("mouseleave", () => (par.style.transform = ""));
        const word = $(".hero-word", root);
        const onScroll = (y) => { if (y < 900 && word) word.style.transform = `translateY(${y * 0.25}px)`; };
        AZ.onPage("scroll", onScroll);
      }
      // hero drive-in with spinning wheels; wheels then follow scroll
      const bikeEl = $("[data-hero-bike]", root);
      const wheels = bikeEl ? $$(".wheel", bikeEl) : [];
      if (bikeEl && !AZ.reduced() && bikeEl.animate) {
        bikeEl.animate([{ transform: "translateX(-60%) skewX(-6deg)", opacity: 0 }, { transform: "translateX(3%) skewX(2deg)", opacity: 1, offset: 0.8 }, { transform: "none", opacity: 1 }], { duration: 1200, delay: 100, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
        const spins = wheels.map((w) => w.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 380, iterations: Infinity }));
        const t0 = performance.now();
        const brake = (t) => { const k = Math.min(1, (t - t0 - 900) / 1400); spins.forEach((a) => (a.playbackRate = Math.max(0.0001, 1 - Math.max(0, k)))); if (k < 1) requestAnimationFrame(brake); else spins.forEach((a) => a.pause()); };
        requestAnimationFrame(brake);
        let lastY = window.scrollY;
        AZ.onPage("scroll", (y) => { const d = y - lastY; lastY = y; spins.forEach((a) => { if (a.playState === "paused") a.currentTime = ((a.currentTime || 0) + d * 1.6 + 3800) % 380; }); });
        bikeEl.classList.add("lit");
      }
      // exploded view: parts fly out of the bike as the section scrolls
      const ex = $("[data-explode]", root);
      if (ex) {
        const parts = $$("[data-ex-part]", ex), bike = $("[data-ex-bike]", ex);
        let exTop = 0, exH = 1;
        const measureEx = () => { exTop = ex.offsetTop; exH = ex.offsetHeight; };
        const apply = () => {
          const vh = window.innerHeight; const r = { top: exTop - window.scrollY, height: exH };
          let k = AZ.reduced() ? 1 : Math.min(1, Math.max(0, (-r.top + vh * 0.15) / (r.height - vh) ));
          ex.style.setProperty("--k", k.toFixed(3));
          parts.forEach((p, i) => { const kk = Math.min(1, Math.max(0, (k - i * 0.04) / 0.62)); const e = 1 - Math.pow(1 - kk, 3); p.style.setProperty("--e", e.toFixed(3)); p.classList.toggle("on", kk > 0.92); });
          if (bike) bike.style.transform = `translate(-50%,-50%) scale(${1 - k * 0.12}) rotate(${-k * 4}deg)`;
        };
        requestAnimationFrame(() => { measureEx(); apply(); });
        AZ.onPage("scroll", apply);
        const onResize = AZ.debounce(() => { measureEx(); apply(); }, 150);
        window.addEventListener("resize", onResize); window.addEventListener("load", onResize);
      }
      // deal countdown (to midnight, local time)
      const cd = $("[data-countdown]", root);
      if (cd) {
        const cells = $$("b", cd);
        const tick = () => { const now = new Date(); const end = new Date(now); end.setHours(24, 0, 0, 0); let t = Math.max(0, Math.floor((end - now) / 1000)); const v = [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60]; cells.forEach((c, i) => { const s2 = String(v[i]).padStart(2, "0"); if (c.textContent !== s2) { c.textContent = s2; c.classList.remove("flip"); void c.offsetWidth; c.classList.add("flip"); } }); };
        tick(); const iv = setInterval(tick, 1000);
        const prevCleanup = () => clearInterval(iv);
        AZ.onPage("route-leave", prevCleanup);
      }
      // chat bubbles sequence
      const chat = $("[data-chat]", root);
      if (chat) {
        const bub = $$(".bubble", chat);
        const run = () => bub.forEach((b, i) => setTimeout(() => b.classList.add("show"), AZ.reduced() ? 0 : 400 + i * 700));
        if ("IntersectionObserver" in window) { const o = new IntersectionObserver((en) => { if (en[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.3 }); o.observe(chat); } else run();
      }
    },
  };

  /* ======================= SHOP ======================= */
  const SORTS = [["popular", "الأكثر طلبًا"], ["newest", "الأحدث"], ["price-asc", "السعر: من الأقل للأعلى"], ["price-desc", "السعر: من الأعلى للأقل"], ["discount", "أعلى خصم"]];
  function filterProducts(f) {
    let list = AZ.catalog.products();
    if (f.q) { const ids = new Set(AZ.catalog.search(f.q, 2000).map((p) => p.id)); list = list.filter((p) => ids.has(p.id)); }
    if (f.model) list = list.filter((p) => p.compat.some((c) => c.model === f.model && (!f.year || c.years.includes(Number(f.year)))));
    if (f.cat.length) list = list.filter((p) => f.cat.includes(p.category));
    if (f.brand.length) list = list.filter((p) => f.brand.includes(p.brand));
    if (f.cls) list = list.filter((p) => p.classification === f.cls);
    if (f.stock) list = list.filter((p) => p.stock > 0);
    if (f.sale) list = list.filter((p) => p.oldPrice && p.oldPrice > p.price);
    if (f.min) list = list.filter((p) => p.price >= Number(f.min));
    if (f.max) list = list.filter((p) => p.price <= Number(f.max));
    const s = f.sort || "popular";
    list = list.slice().sort((a, b) =>
      s === "price-asc" ? a.price - b.price : s === "price-desc" ? b.price - a.price : s === "newest" ? new Date(b.createdAt) - new Date(a.createdAt) : s === "discount" ? ui.discount(b) - ui.discount(a) : b.popularity - a.popularity
    );
    return list;
  }
  AZ.filterProducts = filterProducts;

  pages.shop = {
    title: "المتجر — قطع غيار TVS | عزاب موتو",
    render(params, query) {
      return `${ui.pageHead("متجر قطع غيار TVS", "فلتر حسب الموديل، السنة، القسم والسعر — أو ابحث برقم القطعة.", [{ label: "المتجر" }])}
      <div class="container shop-layout">
        <aside class="filters card card-pad" data-filters aria-label="الفلاتر"></aside>
        <div>
          <div class="toolbar">
            <button class="btn btn-outline btn-sm" data-filter-open style="display:none">${icon("sliders")}الفلاتر</button>
            <span class="count" data-count-label></span>
            <label class="sr-only" for="sortSel">الترتيب</label>
            <select class="select" id="sortSel" data-sort>${SORTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>
          </div>
          <div class="chips" data-chips></div>
          <div class="grid grid-products" data-grid aria-live="polite"></div>
          <div class="load-more" data-more></div>
        </div>
      </div>
      <button class="btn btn-dark filter-fab" data-filter-open>${icon("sliders")}الفلاتر <span class="badge badge-orange" data-fcount style="height:22px"></span></button>`;
    },
    mount(root, params, query) {
      const qs = new URLSearchParams(query);
      const f = {
        q: qs.get("q") || "", model: qs.get("model") || "", year: qs.get("year") || "",
        cat: (qs.get("cat") || "").split(",").filter(Boolean), brand: (qs.get("brand") || "").split(",").filter(Boolean),
        cls: qs.get("cls") || "", stock: qs.get("stock") === "1", sale: qs.get("sale") === "1",
        min: qs.get("min") || "", max: qs.get("max") || "", sort: qs.get("sort") || "popular",
      };
      if (!f.model && !qs.has("all") && AZ.garage.active() && !f.q && !f.cat.length && !f.sale) { /* respect garage only when explicitly chosen */ }
      let shown = 24;
      const brands = [...new Set(AZ.catalog.products().map((p) => p.brand))].sort();
      const panel = $("[data-filters]", root);
      const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

      const group = (key, title, body, open = true) => `<div class="filter-group ${open ? "" : "collapsed"}" data-fg="${key}"><button type="button" aria-expanded="${open}">${title}${icon("chevU")}</button><div class="fg-body"><div class="fg-inner"><div>${body}</div></div></div></div>`;
      const renderFilters = () => {
        const base = AZ.catalog.products();
        panel.innerHTML = `
          <div class="flex between items-center mb-16"><h3 style="font-size:18px">${icon("sliders")} الفلاتر</h3><button class="btn btn-ghost btn-sm" data-reset>مسح الكل</button></div>
          <div class="field mb-16"><label for="fq">بحث (اسم / SKU / رقم القطعة)</label><input class="input" id="fq" type="search" value="${esc(f.q)}" placeholder="مثال: AZ-BRK-004" data-f="q"></div>
          ${group("model", "الموديل وسنة الصنع", `<div class="form-grid"><select class="select" data-f="model" aria-label="الموديل">${modelOptions(f.model, "كل الموديلات")}</select><select class="select" data-f="year" aria-label="سنة الصنع" ${f.model ? "" : "disabled"}>${yearOptions(f.model, f.year)}</select>${AZ.garage.active() && AZ.garage.active().model !== f.model ? `<button type="button" class="btn btn-outline btn-sm" data-use-garage>${icon("garage")}استخدم موتوسيكلي</button>` : ""}</div>`)}
          ${group("cat", "القسم", `<div class="filter-list">${AZ.catalog.categories().map((c) => `<label class="check"><input type="checkbox" value="${c.id}" data-f="cat" ${f.cat.includes(c.id) ? "checked" : ""}>${esc(c.name)}<span class="c">${base.filter((p) => p.category === c.id).length}</span></label>`).join("")}</div>`)}
          ${group("price", "السعر (ج.م)", `<div class="range-row"><input class="input" type="number" min="0" inputmode="numeric" placeholder="من" value="${esc(f.min)}" data-f="min" aria-label="أقل سعر"><span>—</span><input class="input" type="number" min="0" inputmode="numeric" placeholder="إلى" value="${esc(f.max)}" data-f="max" aria-label="أعلى سعر"></div><div class="flex gap-8 wrap mt-8">${[[0, 500], [500, 1500], [1500, 3000], [3000, ""]].map(([a, b]) => `<button type="button" class="pill" style="height:32px;font-size:12.5px;padding-inline:12px" data-price="${a}-${b}">${b ? `${a}–${b}` : `${a}+`}</button>`).join("")}</div>`)}
          ${group("cls", "التصنيف", `${[["", "الكل"], ["original", "أصلي TVS"], ["aftermarket", "بديل (Aftermarket)"]].map(([v, l]) => `<label class="check"><input type="radio" name="cls" value="${v}" data-f="cls" ${f.cls === v ? "checked" : ""}>${l}</label>`).join("")}`)}
          ${group("brand", "الماركة", `<div class="filter-list">${brands.map((b) => `<label class="check"><input type="checkbox" value="${esc(b)}" data-f="brand" ${f.brand.includes(b) ? "checked" : ""}><span class="ltr">${esc(b)}</span><span class="c">${base.filter((p) => p.brand === b).length}</span></label>`).join("")}</div>`, false)}
          ${group("more", "التوفر والخصومات", `<label class="check"><input type="checkbox" data-f="stock" ${f.stock ? "checked" : ""}>المتوفر فقط</label><label class="check"><input type="checkbox" data-f="sale" ${f.sale ? "checked" : ""}>عليه خصم</label>`)}
          <div class="mobile-apply mt-16" style="display:none;gap:10px"><button class="btn btn-outline" data-reset>إعادة ضبط</button><button class="btn btn-primary" style="flex:1" data-apply>عرض <span data-apply-n></span> نتيجة</button></div>`;
      };

      const activeCount = () => [f.q, f.model, f.year, f.cls, f.min, f.max].filter(Boolean).length + f.cat.length + f.brand.length + (f.stock ? 1 : 0) + (f.sale ? 1 : 0);
      const syncUrl = () => {
        const q = new URLSearchParams();
        ["q", "model", "year", "cls", "min", "max"].forEach((k) => f[k] && q.set(k, f[k]));
        if (f.cat.length) q.set("cat", f.cat.join(","));
        if (f.brand.length) q.set("brand", f.brand.join(","));
        if (f.stock) q.set("stock", "1"); if (f.sale) q.set("sale", "1");
        if (f.sort !== "popular") q.set("sort", f.sort);
        const s = q.toString();
        AZ.replaceUrl(`#/shop${s ? `?${s}` : ""}`);
      };
      const chips = () => {
        const c = [];
        const m = AZ.catalog.model(f.model);
        if (f.q) c.push(["q", `بحث: ${f.q}`]);
        if (m) c.push(["model", m.name]);
        if (f.year) c.push(["year", `سنة ${f.year}`]);
        f.cat.forEach((id) => c.push([`cat:${id}`, (AZ.catalog.category(id) || {}).name]));
        f.brand.forEach((b) => c.push([`brand:${b}`, b]));
        if (f.cls) c.push(["cls", f.cls === "original" ? "أصلي TVS" : "بديل"]);
        if (f.min || f.max) c.push(["price", `السعر ${f.min || 0} – ${f.max || "∞"}`]);
        if (f.stock) c.push(["stock", "المتوفر فقط"]);
        if (f.sale) c.push(["sale", "عليه خصم"]);
        return c.map(([k, l]) => `<span class="chip">${esc(l)}<button data-chip="${esc(k)}" aria-label="إزالة ${esc(l)}">${icon("x")}</button></span>`).join("") + (c.length > 1 ? `<button class="btn btn-ghost btn-sm" data-reset>مسح الكل</button>` : "");
      };
      const renderGrid = (resetShown) => {
        if (resetShown) shown = 24;
        const list = filterProducts(f);
        const m = AZ.catalog.model(f.model);
        $("[data-count-label]", root).innerHTML = `<b>${list.length}</b> منتج${m ? ` متوافق مع <b class="ltr">${esc(m.name)}</b>${f.year ? ` (${f.year})` : ""}` : ""}`;
        $("[data-chips]", root).innerHTML = chips();
        $("[data-sort]", root).value = f.sort;
        const n = activeCount();
        $$("[data-fcount]", root).forEach((e) => (e.textContent = n || ""));
        $$("[data-apply-n]", root).forEach((e) => (e.textContent = list.length));
        const grid = $("[data-grid]", root);
        grid.innerHTML = list.length ? list.slice(0, shown).map(ui.productCard).join("") : `<div style="grid-column:1/-1">${ui.empty("search", "مفيش نتائج مطابقة", "جرّب تقليل الفلاتر أو البحث بكلمة مختلفة. ولو مش لاقي القطعة ابعتلنا صورتها على واتساب.", `<div class="flex gap-8" style="justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" data-reset>مسح الفلاتر</button><a class="btn btn-whatsapp" href="#" data-wa="part">${icon("whatsapp")}اسألنا على واتساب</a></div>`)}</div>`;
        const more = $("[data-more]", root);
        more.innerHTML = list.length > shown ? `<div class="progress"><i style="width:${(shown / list.length) * 100}%"></i></div><span class="small muted">عرض ${shown} من ${list.length}</span><button class="btn btn-outline" data-loadmore>تحميل المزيد</button>` : list.length ? `<span class="small muted">عرض كل ${list.length} منتج</span>` : "";
        ui.observe(grid);
        syncUrl();
      };
      const update = AZ.debounce(() => renderGrid(true), 160);

      renderFilters();
      renderGrid(true);

      panel.addEventListener("input", (e) => {
        const el = e.target; const k = el.dataset.f; if (!k) return;
        if (k === "cat" || k === "brand") f[k] = $$(`[data-f="${k}"]:checked`, panel).map((x) => x.value);
        else if (k === "stock" || k === "sale") f[k] = el.checked;
        else if (k === "model") { f.model = el.value; f.year = ""; renderFilters(); }
        else f[k] = el.value;
        update();
      });
      panel.addEventListener("click", (e) => {
        const g = e.target.closest(".filter-group > button");
        if (g) { const fg = g.parentElement; fg.classList.toggle("collapsed"); g.setAttribute("aria-expanded", !fg.classList.contains("collapsed")); return; }
        const pr = e.target.closest("[data-price]");
        if (pr) { const [a, b] = pr.dataset.price.split("-"); f.min = a === "0" ? "" : a; f.max = b; renderFilters(); renderGrid(true); return; }
        if (e.target.closest("[data-use-garage]")) { const g2 = AZ.garage.active(); f.model = g2.model; f.year = g2.year ? String(g2.year) : ""; renderFilters(); renderGrid(true); return; }
        if (e.target.closest("[data-apply]")) { closeMobile(); window.scrollTo({ top: 0 }); }
      });
      root.addEventListener("click", (e) => {
        if (e.target.closest("[data-reset]")) { Object.assign(f, { q: "", model: "", year: "", cat: [], brand: [], cls: "", stock: false, sale: false, min: "", max: "" }); renderFilters(); renderGrid(true); return; }
        const chip = e.target.closest("[data-chip]");
        if (chip) {
          const k = chip.dataset.chip;
          if (k.startsWith("cat:")) f.cat = f.cat.filter((x) => x !== k.slice(4));
          else if (k.startsWith("brand:")) f.brand = f.brand.filter((x) => x !== k.slice(6));
          else if (k === "price") { f.min = ""; f.max = ""; }
          else if (k === "model") { f.model = ""; f.year = ""; }
          else f[k] = typeof f[k] === "boolean" ? false : "";
          renderFilters(); renderGrid(true); return;
        }
        if (e.target.closest("[data-loadmore]")) { shown += 24; renderGrid(false); return; }
        if (e.target.closest("[data-filter-open]")) openMobile();
      });
      $("[data-sort]", root).addEventListener("change", (e) => { f.sort = e.target.value; renderGrid(true); });

      // mobile drawer behaviour for filter panel
      const ov = $("[data-overlay]");
      const openMobile = () => { panel.classList.add("mobile-open"); ov.classList.add("open"); document.body.style.overflow = "hidden"; $(".mobile-apply", panel).style.display = "flex"; };
      const closeMobile = () => { panel.classList.remove("mobile-open"); ov.classList.remove("open"); document.body.style.overflow = ""; };
      const ovClose = () => { if (panel.classList.contains("mobile-open")) closeMobile(); };
      ov.addEventListener("click", ovClose);
      return () => { ov.removeEventListener("click", ovClose); closeMobile(); };
    },
  };

  /* ======================= MOTORCYCLES ======================= */
  pages.motorcycles = {
    title: "موديلات TVS — اختار موتوسيكلك | عزاب موتو",
    render() {
      return `${ui.pageHead("كل موديلات TVS", `${D.models.length} موديل — اختار موتوسيكلك واكتشف قطع الغيار المتوافقة معاه.`, [{ label: "موديلات TVS" }])}
      <section class="section-sm"><div class="container">
        <div class="pill-tabs mb-16" data-fam-tabs>
          <button class="pill active" data-fam="all">الكل (${D.models.length})</button>
          <button class="pill" data-fam="egypt">متاح في مصر (${D.models.filter((m) => m.egypt).length})</button>
          ${D.families.map((f) => `<button class="pill" data-fam="${f.id}">${esc(f.short)} (${D.models.filter((m) => m.family === f.id).length})</button>`).join("")}
        </div>
        <div data-fam-body></div>
        <p class="small muted mt-24">${icon("info", "")} علامة "متاح في مصر" توضح الموديلات المطروحة رسميًا في السوق المصري؛ وبنوفر قطع غيار باقي موديلات TVS للموتوسيكلات المستوردة.</p>
      </div></section>`;
    },
    mount(root) {
      const body = $("[data-fam-body]", root);
      const show = (fam) => {
        if (fam === "all") {
          body.innerHTML = D.families.map((f) => `<h2 class="section-title reveal" style="font-size:24px;margin:28px 0 14px">${esc(f.name)}</h2><div class="grid grid-models">${D.models.filter((m) => m.family === f.id).map((m, i) => ui.modelCard(m, i)).join("")}</div>`).join("");
        } else {
          const list = fam === "egypt" ? D.models.filter((m) => m.egypt) : D.models.filter((m) => m.family === fam);
          body.innerHTML = `<div class="grid grid-models">${list.map((m, i) => ui.modelCard(m, i)).join("")}</div>`;
        }
        ui.observe(body);
      };
      show("all");
      $("[data-fam-tabs]", root).addEventListener("click", (e) => {
        const b = e.target.closest("[data-fam]"); if (!b) return;
        $$("[data-fam]", root).forEach((x) => x.classList.toggle("active", x === b));
        show(b.dataset.fam);
      });
    },
  };

  pages.model = {
    title: (p) => { const m = AZ.catalog.model(p[0]); return m ? `قطع غيار ${m.name} | عزاب موتو` : "موديل غير موجود"; },
    render(params, query) {
      const m = AZ.catalog.model(params[0]);
      if (!m) return pages.notFound.render();
      const fam = D.families.find((f) => f.id === m.family);
      const bundles = D.bundles.filter((b) => b.model === m.slug);
      const inGarage = AZ.garage.list().some((g) => g.model === m.slug);
      return `<section class="model-hero"><div class="container">
          <div>
            ${ui.crumbs([{ label: "موديلات TVS", href: "#/motorcycles" }, { label: m.short }])}
            <div class="flex gap-8 wrap mb-16">${m.egypt ? `<span class="badge badge-orange">متاح في مصر</span>` : `<span class="badge badge-silver">قطع غيار متوفرة</span>`}<span class="badge badge-dark">${esc(fam.short)}</span></div>
            <h1>${esc(m.name)}</h1>
            <p class="muted mt-8" style="font-size:17px">${esc(m.tagline)}</p>
            <div class="spec-pills">
              <div class="sp"><small>المحرك</small><b>${m.cc ? `${m.cc} cc` : "كهربائي"}</b></div>
              <div class="sp"><small>الفئة</small><b>${esc(fam.short)}</b></div>
              <div class="sp"><small>قطع الغيار</small><b class="num">${AZ.catalog.forModel(m.slug).length}</b></div>
            </div>
            <div class="hero-cta"><button class="btn btn-primary" data-save-garage>${icon("garage")}${inGarage ? "محفوظ في جراچي ✓" : "احفظ في جراچي"}</button><a class="btn btn-outline" href="#/shop?model=${m.slug}">${icon("sliders")}فلترة متقدمة</a></div>
          </div>
          ${m.photoCut ? `<img src="${m.photoCut}" alt="${esc(m.name)}" class="model-real">` : m.photo ? `<figure class="model-photo is-photo"><img src="${m.photo}" alt="${esc(m.name)}"><figcaption>${m.photoLocal ? "صورة حقيقية" : "صورة حقيقية · Wikimedia Commons"}</figcaption></figure>` : `<img src="${m.cutout}" alt="${esc(m.name)} — رسم توضيحي" width="1200" height="760">`}
        </div></section>
        <section class="section-sm"><div class="container">
          <div class="flex between items-center wrap gap-12 mb-16">
            <div><div class="label mb-16" style="margin-bottom:8px">سنة الصنع</div><div class="year-pills" data-years><button class="pill active" data-y="">كل السنوات</button>${m.years.slice().reverse().map((y) => `<button class="pill" data-y="${y}">${y}</button>`).join("")}</div></div>
          </div>
          <div class="pill-tabs mb-16" data-mcats></div>
          <div class="grid grid-products" data-mgrid></div>
          <div class="load-more" data-mmore></div>
        </div></section>
        ${bundles.length ? `<section class="section-sm bg-white"><div class="container">${ui.sectionHead("أطقم الصيانة", `أطقم ${esc(m.short)}`)}<div class="grid grid-bundles">${bundles.map(ui.bundleCard).join("")}</div></div></section>` : ""}`;
    },
    mount(root, params) {
      const m = AZ.catalog.model(params[0]); if (!m) return;
      let year = "", cat = "", shown = 16;
      const draw = () => {
        const all = AZ.catalog.forModel(m.slug, year);
        const cats = AZ.catalog.categories().filter((c) => all.some((p) => p.category === c.id));
        $("[data-mcats]", root).innerHTML = `<button class="pill ${!cat ? "active" : ""}" data-c="">الكل (${all.length})</button>` + cats.map((c) => `<button class="pill ${cat === c.id ? "active" : ""}" data-c="${c.id}">${esc(c.name)} (${all.filter((p) => p.category === c.id).length})</button>`).join("");
        const list = (cat ? all.filter((p) => p.category === cat) : all).sort((a, b) => (b.primaryModel === m.slug) - (a.primaryModel === m.slug) || b.popularity - a.popularity);
        const g = $("[data-mgrid]", root);
        g.innerHTML = list.slice(0, shown).map(ui.productCard).join("") || `<div style="grid-column:1/-1">${ui.empty("package", "لا توجد قطع لهذه السنة", "جرّب سنة أخرى أو تواصل معنا.")}</div>`;
        $("[data-mmore]", root).innerHTML = list.length > shown ? `<button class="btn btn-outline" data-more>عرض المزيد (${list.length - shown})</button>` : "";
        ui.observe(g);
      };
      draw();
      root.addEventListener("click", (e) => {
        const y = e.target.closest("[data-y]");
        if (y) { year = y.dataset.y; shown = 16; $$("[data-y]", root).forEach((x) => x.classList.toggle("active", x === y)); draw(); return; }
        const c = e.target.closest("[data-c]");
        if (c) { cat = c.dataset.c; shown = 16; draw(); return; }
        if (e.target.closest("[data-more]")) { shown += 16; draw(); return; }
        const sg = e.target.closest("[data-save-garage]");
        if (sg) { AZ.garage.add(m.slug, year); sg.innerHTML = `${icon("garage")}محفوظ في جراچي ✓`; AZ.toast(`تم حفظ ${m.name} في جراچي`, { icon: "garage" }); draw(); }
      });
    },
  };

  /* ======================= PRODUCT ======================= */
  pages.product = {
    title: (p) => { const x = AZ.catalog.bySlug(p[0]); return x ? `${x.name} | عزاب موتو` : "منتج غير موجود"; },
    render(params) {
      const p = AZ.catalog.bySlug(params[0]);
      if (!p) return pages.notFound.render();
      const cat = AZ.catalog.category(p.category);
      const off = ui.discount(p);
      const g = AZ.garage.active();
      const fits = AZ.catalog.fits(p, g);
      const gm = g ? AZ.catalog.model(g.model) : null;
      const wished = AZ.wish.has(p.id);
      return `<div class="container">
        <div style="padding-top:20px">${ui.crumbs([{ label: "المتجر", href: "#/shop" }, { label: cat ? cat.name : "", href: `#/shop?cat=${p.category}` }, { label: p.name }])}</div>
        <div class="pd">
          <div class="gallery">
            <div class="g-main" data-zoom tabindex="0" aria-label="تكبير الصورة">
              <img src="${p.gallery[0]}" alt="${esc(p.name)}" data-main-img width="800" height="800">
              <div class="p-badges">${off ? `<span class="badge badge-orange">-${off}%</span>` : ""}${p.bestSeller ? `<span class="badge badge-soft">${icon("zap")}الأكثر طلبًا</span>` : ""}</div>
              <span class="zoom-hint">${icon("zoom")}مرّر للتكبير</span>
              <span class="demo-tag">${p.photo ? "صورة توضيحية للقطعة" : "رسم توضيحي"}</span>
            </div>
            <div class="g-thumbs">${p.gallery.map((src, i) => `<button class="${i === 0 ? "active" : ""}" data-thumb="${src}" aria-label="صورة ${i + 1}"><img src="${src}" alt="" loading="lazy"></button>`).join("")}</div>
          </div>
          <div class="pd-info">
            <div class="flex gap-8 wrap mb-16">${ui.clsBadge(p)}<a class="badge badge-silver" href="#/shop?cat=${p.category}">${esc(cat ? cat.name : "")}</a><span class="badge badge-silver ltr">${esc(p.brand)}</span></div>
            <h1>${esc(p.name)}</h1>
            <div class="pd-meta"><span>SKU: <b>${esc(p.sku)}</b></span><span>رقم القطعة: <b>${esc(p.partNumber)}</b></span></div>
            <div class="pd-price">${p.oldPrice ? `<span class="price-old" style="font-size:17px">${AZ.moneyText(p.oldPrice)}</span>` : ""}<span class="price num">${money(p.price)}</span>${off ? `<span class="badge badge-orange">وفر ${AZ.moneyText(p.oldPrice - p.price)}</span>` : ""}</div>
            <div class="mt-8">${ui.stockBadge(p)}</div>
            ${g && gm ? `<div class="fit-check ${fits ? "yes" : "no"}">${icon(fits ? "checkCircle" : "alert")}<span>${fits ? `متوافقة مع موتوسيكلك <b class="ltr">${esc(gm.name)}</b>${g.year ? ` (${g.year})` : ""}` : `غير مدرجة كمتوافقة مع <b class="ltr">${esc(gm.name)}</b>${g.year ? ` (${g.year})` : ""} — راجع جدول التوافق أو اسألنا`}</span></div>` : `<div class="fit-check neutral">${icon("bike")}<span>اختار موتوسيكلك من <a href="#/garage" style="color:var(--orange-600);font-weight:800">جراچي</a> علشان نأكدلك التوافق.</span></div>`}
            <div class="pd-box">
              <div class="flex items-center gap-12 wrap">
                <span class="label">الكمية</span>
                <div class="qty"><button type="button" data-pq="1" aria-label="زيادة">${icon("plus")}</button><input id="pdQty" type="number" min="1" max="${Math.max(1, p.stock)}" value="1" aria-label="الكمية"><button type="button" data-pq="-1" aria-label="تقليل">${icon("minus")}</button></div>
              </div>
              <div class="pd-actions">
                <button class="btn btn-primary btn-lg" data-add="${p.id}" data-qty-from="#pdQty" ${p.stock <= 0 ? "disabled" : ""}>${icon("cart")}أضف للسلة</button>
                <button class="btn btn-dark btn-lg" data-add="${p.id}" data-qty-from="#pdQty" data-go="#/checkout" ${p.stock <= 0 ? "disabled" : ""}>${icon("zap")}اشتري الآن</button>
                <button class="btn btn-outline btn-lg wish ${wished ? "active" : ""}" data-wish="${p.id}" aria-pressed="${wished}" style="flex:0;min-width:56px;padding:0 16px" aria-label="المفضلة">${icon("heart")}</button>
              </div>
              <a class="btn btn-ghost btn-sm mt-12" href="#" data-wa="product" data-wa-text="${esc(`مرحبًا عزاب موتو 👋\nعندي استفسار عن: ${p.name}\nSKU: ${p.sku}`)}">${icon("whatsapp")}اسأل عن القطعة على واتساب</a>
            </div>
            <div class="info-list">
              <div class="it">${icon("truck")}<div><b>الشحن لكل المحافظات</b><span>من 60 ج.م حسب المحافظة · مجاني فوق ${AZ.moneyText(D.FREE_SHIPPING_OVER)}</span></div></div>
              <div class="it">${icon("cash")}<div><b>الدفع عند الاستلام</b><span>ادفع نقدًا لما الطلب يوصلك</span></div></div>
              <div class="it">${icon("wrench")}<div><b>صاحب ورشة أو مركز صيانة؟</b><span>ليك خصم خاص — <a href="#" data-wa="workshop" style="color:var(--orange-600);font-weight:800">كلمنا على واتساب</a></span></div></div>
              <div class="it">${icon("rotate")}<div><b>استبدال واسترجاع</b><span>خلال 14 يوم للقطع غير المركبة وبحالتها الأصلية</span></div></div>
            </div>
          </div>
        </div>

        <section class="section-sm" style="padding-top:0">
          <div class="tabs" role="tablist" data-ptabs>
            <button class="active" data-tab="desc" role="tab">الوصف</button><button data-tab="specs" role="tab">المواصفات</button><button data-tab="compat" role="tab">التوافق (${p.compat.length})</button><button data-tab="ship" role="tab">الشحن والاسترجاع</button>
          </div>
          <div data-tabpanel="desc"><div class="card card-pad"><p style="font-size:16px">${esc(p.description)}</p><p class="muted mt-12 small">ننصح بتركيب قطع المحرك والفرامل والعفشة في مركز صيانة متخصص. لو محتاج مساعدة في تحديد القطعة المناسبة تواصل معنا.</p></div></div>
          <div data-tabpanel="specs" hidden><div class="table-wrap"><table class="table spec-table"><tbody>${Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div><p class="small muted mt-8">المواصفات إرشادية؛ راجع رقم القطعة مع فريقنا قبل التركيب.</p></div>
          <div data-tabpanel="compat" hidden><div class="table-wrap"><table class="table"><thead><tr><th>الموديل</th><th>سنوات التوافق</th><th></th></tr></thead><tbody>${p.compat.map((c) => { const m = AZ.catalog.model(c.model); return m ? `<tr><td><a class="ltr" style="font-weight:800" href="#/motorcycles/${m.slug}">${esc(m.name)}</a></td><td class="num">${c.years[0]} – ${c.years[c.years.length - 1]}</td><td>${g && g.model === m.slug ? `<span class="badge badge-success">موتوسيكلك</span>` : ""}</td></tr>` : ""; }).join("")}</tbody></table></div></div>
          <div data-tabpanel="ship" hidden><div class="card card-pad prose"><p><b>الشحن:</b> نشحن لكل محافظات مصر. التكلفة من 60 ج.م حسب المحافظة، والمدة المتوقعة 1–8 أيام عمل حسب المنطقة. الطلبات فوق ${AZ.moneyText(D.FREE_SHIPPING_OVER)} شحنها مجاني.</p><p><b>الاسترجاع:</b> تقدر تستبدل أو ترجع القطعة خلال 14 يوم من الاستلام بشرط إنها متركبتش وفي تغليفها الأصلي. القطع الكهربائية بعد التركيب لا تُسترد إلا في حالة عيب صناعة.</p><a class="link-arrow" href="#/policies/returns">سياسة الاسترجاع الكاملة ${icon("arrowL")}</a></div></div>
        </section>

        <section class="section-sm" data-fbt></section>
        <section class="section-sm" style="padding-bottom:80px" data-related></section>
      </div>
      <div class="sticky-buy" data-sticky><div><div class="small muted">${esc(p.name.slice(0, 32))}${p.name.length > 32 ? "…" : ""}</div><div class="price num">${money(p.price)}</div></div><button class="btn btn-primary" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>${icon("cart")}أضف للسلة</button></div>`;
    },
    mount(root, params) {
      const p = AZ.catalog.bySlug(params[0]); if (!p) return;
      // gallery & zoom
      const main = $("[data-main-img]", root), zoom = $("[data-zoom]", root);
      root.addEventListener("click", (e) => {
        const th = e.target.closest("[data-thumb]");
        if (th) { main.style.opacity = 0; setTimeout(() => { main.src = th.dataset.thumb; main.style.opacity = 1; }, 150); $$("[data-thumb]", root).forEach((x) => x.classList.toggle("active", x === th)); return; }
        const pq = e.target.closest("[data-pq]");
        if (pq) { const i = $("#pdQty", root); i.value = Math.min(Math.max(1, Number(i.value) + Number(pq.dataset.pq)), Math.max(1, p.stock)); return; }
        const tb = e.target.closest("[data-tab]");
        if (tb) { $$("[data-tab]", root).forEach((x) => x.classList.toggle("active", x === tb)); $$("[data-tabpanel]", root).forEach((x) => (x.hidden = x.dataset.tabpanel !== tb.dataset.tab)); }
      });
      const setOrigin = (e) => { const r = zoom.getBoundingClientRect(); zoom.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`); zoom.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`); };
      zoom.addEventListener("mousemove", (e) => { if (window.matchMedia("(hover:hover)").matches) { zoom.classList.add("zoom"); setOrigin(e); } });
      zoom.addEventListener("mouseleave", () => zoom.classList.remove("zoom"));
      zoom.addEventListener("click", (e) => { if (!window.matchMedia("(hover:hover)").matches) { setOrigin(e); zoom.classList.toggle("zoom"); } });
      zoom.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoom.classList.toggle("zoom"); } });

      // frequently bought together: same primary model maintenance items
      const pm = p.primaryModel || (p.compat[0] && p.compat[0].model);
      const pool = AZ.catalog.forModel(pm).filter((x) => x.id !== p.id && x.stock > 0 && x.category !== p.category);
      const fbt = [p, ...pool.sort((a, b) => b.popularity - a.popularity).slice(0, 2)];
      if (fbt.length > 1 && p.stock > 0) {
        const tot = fbt.reduce((s, x) => s + x.price, 0);
        $("[data-fbt]", root).innerHTML = `${ui.sectionHead("بيتطلبوا مع بعض", "يتشترى عادة مع القطعة دي")}<div class="card card-pad fbt reveal"><div class="fbt-row">${fbt.map((x, i) => `${i ? `<span class="fbt-plus">+</span>` : ""}<a class="fbt-item" href="#/products/${x.slug}"><img src="${x.image}" alt="" loading="lazy"><span>${esc(x.name)}</span><b class="num">${AZ.moneyText(x.price)}</b></a>`).join("")}</div><div class="flex between items-center wrap gap-12"><div>الإجمالي: <b class="price num">${money(tot)}</b></div><button class="btn btn-primary" data-fbt-add>${icon("cart")}أضف الـ ${fbt.length} للسلة</button></div></div>`;
        $("[data-fbt-add]", root).addEventListener("click", () => { fbt.forEach((x) => AZ.cart.add(x.id, 1)); ui.bumpCart(); AZ.toast(`تمت إضافة ${fbt.length} منتجات للسلة`, { icon: "cart", action: { href: "#/cart", label: "عرض السلة" } }); });
      }
      // related
      const rel = AZ.catalog.products().filter((x) => x.id !== p.id && x.category === p.category && x.compat.some((c) => p.compat.some((d) => d.model === c.model))).sort((a, b) => b.popularity - a.popularity).slice(0, 8);
      if (rel.length) $("[data-related]", root).innerHTML = `${ui.sectionHead("منتجات مشابهة", "قطع ممكن تعجبك", null, { href: `#/shop?cat=${p.category}`, label: "عرض القسم" })}<div class="grid grid-products">${rel.map(ui.productCard).join("")}</div>`;
      ui.observe(root);

      // sticky mobile add to cart
      const sticky = $("[data-sticky]", root);
      const act = $(".pd-actions", root);
      let actBottom = null;
      const onScroll = (y) => { if (actBottom === null) actBottom = act.getBoundingClientRect().bottom + window.scrollY; const show = (typeof y === "number" ? y : window.scrollY) > actBottom; sticky.classList.toggle("show", show); document.body.classList.toggle("has-sticky-buy", show && window.innerWidth < 960); };
      AZ.onPage("scroll", onScroll);
      return () => document.body.classList.remove("has-sticky-buy");
    },
  };

  /* ======================= CATEGORIES ======================= */
  pages.categories = {
    title: "أقسام قطع الغيار | عزاب موتو",
    render() {
      const cats = AZ.catalog.categories();
      return `${ui.pageHead("أقسام قطع الغيار", "12 قسم يغطوا كل احتياجات موتوسيكل TVS.", [{ label: "الأقسام" }])}
      <section class="section-sm"><div class="container">
        <div class="grid grid-cats">${cats.map((c, i) => ui.catTile(c, i)).join("")}</div>
        ${cats.map((c) => {
          const top = AZ.catalog.products().filter((p) => p.category === c.id && p.stock > 0).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
          return `<div class="mt-32">${ui.sectionHead(c.en, esc(c.name), esc(c.desc), { href: `#/shop?cat=${c.id}`, label: "عرض الكل" })}<div class="grid grid-products">${top.map(ui.productCard).join("")}</div></div>`;
        }).join("")}
      </div></section>`;
    },
  };

  /* ======================= OFFERS ======================= */
  pages.offers = {
    title: "العروض والخصومات | عزاب موتو",
    render() {
      const sale = AZ.catalog.products().filter((p) => p.oldPrice && p.oldPrice > p.price && p.stock > 0).sort((a, b) => ui.discount(b) - ui.discount(a));
      const coupons = AZ.storage.get("coupons", null) || D.coupons;
      return `${ui.pageHead("العروض", "خصومات على قطع مختارة وأكواد خصم وأطقم صيانة بسعر أقل.", [{ label: "العروض" }])}
      <section class="section-sm"><div class="container">
        <div class="notice mb-16">${icon("info")}<span>العروض والأكواد المعروضة حاليًا بيانات تجريبية لعرض شكل المتجر، وسيتم استبدالها بعروض المتجر الفعلية.</span></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px">
          ${coupons.filter((c) => c.active).map((c, i) => `<div class="card card-pad reveal" style="--d:${i * 70}ms;border:2px dashed var(--orange-100)"><div class="flex between items-center"><span class="badge badge-orange">${icon("ticket")}كود خصم</span><button class="btn btn-ghost btn-sm" data-copy="${c.code}">${icon("copy")}نسخ</button></div><div style="font-size:26px;font-weight:900;letter-spacing:.06em;margin-top:10px" class="ltr">${esc(c.code)}</div><p class="small muted">${esc(c.label)}</p></div>`).join("")}
        </div>
        <div class="mt-32">${ui.sectionHead("خصومات", `${sale.length} قطعة عليها خصم`)}<div class="grid grid-products">${sale.slice(0, 24).map(ui.productCard).join("")}</div><div class="load-more"><a class="btn btn-outline" href="#/shop?sale=1">عرض كل الخصومات</a></div></div>
        <div class="mt-32">${ui.sectionHead("أطقم الصيانة", "وفر أكتر مع الأطقم", null, { href: "#/bundles", label: "كل الأطقم" })}<div class="grid grid-bundles">${D.bundles.slice(0, 3).map(ui.bundleCard).join("")}</div></div>
      </div></section>`;
    },
    mount(root) {
      root.addEventListener("click", (e) => {
        const b = e.target.closest("[data-copy]"); if (!b) return;
        const code = b.dataset.copy;
        (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => AZ.toast(`تم نسخ الكود ${code}`, { icon: "copy" })).catch(() => AZ.toast(`الكود: ${code}`, { icon: "ticket" }));
      });
    },
  };

  /* ======================= BUNDLES ======================= */
  pages.bundles = {
    title: "أطقم الصيانة | عزاب موتو",
    render() {
      return `${ui.pageHead("أطقم الصيانة", "كل طقم مجمّع لموديل محدد — والخصم بيتطبق تلقائيًا في السلة لما تضيف الطقم كامل.", [{ label: "أطقم الصيانة" }])}
      <section class="section-sm"><div class="container"><div class="grid grid-bundles">${D.bundles.map(ui.bundleCard).join("")}</div></div></section>`;
    },
  };

  /* ======================= SEO per page ======================= */
  const plain = (n) => `${Math.round(n).toLocaleString("en-US")} ج.م`;
  pages.home.seo = () => ({ description: AZ.seo.DEFAULT_DESC });
  pages.shop.seo = (params, query) => {
    const q = new URLSearchParams(query); const c = AZ.catalog.category(q.get("cat")); const m = AZ.catalog.model(q.get("model"));
    if (c) return { description: `${c.name} لموتوسيكلات TVS: ${c.desc}. ${AZ.catalog.products().filter((p) => p.category === c.id).length} منتج أصلي وبديل بأسعار واضحة والدفع عند الاستلام — عزاب موتو وكيل TVS.`, keepQuery: true, crumbs: [{ name: "المتجر", path: "/shop" }, { name: c.name, path: `/shop?cat=${c.id}` }] };
    if (m) return { description: `كل قطع غيار ${m.name} في مكان واحد: فرامل، فلاتر، كهرباء، بطاريات وأكثر. الدفع عند الاستلام.`, keepQuery: true };
    return { description: `متجر قطع غيار TVS: ${AZ.catalog.products().length} قطعة لكل موديلات TVS. فلترة حسب الموديل وسنة الصنع والقسم والسعر. الدفع عند الاستلام.`, crumbs: [{ name: "المتجر", path: "/shop" }] };
  };
  pages.motorcycles.seo = () => ({ description: `قطع غيار لكل موديلات TVS (${D.models.length} موديل): Apache RTR 160 4V وRTR 200 4V وRonin وRaider 125 وStar HLX وNTORQ وJupiter وXL100 والتوك توك King Deluxe.`, crumbs: [{ name: "موديلات TVS", path: "/motorcycles" }] });
  pages.model.seo = (params) => {
    const m = AZ.catalog.model(params[0]); if (!m) return { noindex: true };
    const n = AZ.catalog.forModel(m.slug).length;
    return { description: `قطع غيار ${m.name} الأصلية والبديلة: ${n} قطعة — تيل فرامل، فلاتر، بوجيهات، بطاريات، جنزير وكاوتش. ${m.cc ? `${m.cc} cc · ` : ""}موديلات ${m.years[0]}–${m.years[m.years.length - 1]}. عزاب موتو وكيل معتمد TVS.`, image: m.photoCut || m.photo || m.image, crumbs: [{ name: "موديلات TVS", path: "/motorcycles" }, { name: m.name, path: `/motorcycles/${m.slug}` }] };
  };
  pages.product.seo = (params) => {
    const p = AZ.catalog.bySlug(params[0]); if (!p) return { noindex: true };
    const c = AZ.catalog.category(p.category);
    const url = AZ.seo.abs(`/products/${p.slug}`);
    return {
      type: "product",
      description: `${p.name} — ${p.classification === "original" ? "أصلي TVS" : "بديل"} — السعر ${plain(p.price)}. متوافق مع ${AZ.catalog.compatNames(p, 4)}. رقم القطعة ${p.partNumber}. ${p.stock > 0 ? "متوفر" : "غير متوفر حاليًا"} — الدفع عند الاستلام من عزاب موتو.`,
      image: p.photo || p.image,
      crumbs: [{ name: "المتجر", path: "/shop" }, { name: c ? c.name : "", path: `/shop?cat=${p.category}` }, { name: p.name, path: `/products/${p.slug}` }],
      jsonld: {
        "@type": "Product", name: p.name, sku: p.sku, mpn: p.partNumber, category: c ? c.name : undefined, description: p.description,
        image: p.gallery.map((g) => AZ.seo.abs(g)), brand: { "@type": "Brand", name: p.brand },
        isAccessoryOrSparePartFor: p.compat.slice(0, 10).map((x) => ({ "@type": "Vehicle", name: (AZ.catalog.model(x.model) || {}).name })),
        offers: { "@type": "Offer", url, priceCurrency: "EGP", price: p.price, itemCondition: "https://schema.org/NewCondition", availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@type": "Organization", name: "عزاب موتو" } },
      },
    };
  };
  pages.categories.seo = () => ({ description: "أقسام قطع غيار TVS: قطع الموتور، الفرامل، الكهرباء، البطاريات، الزيوت، الفلاتر، العفشة، الكاوتش، الجنزير والتروس، البودي، الإضاءة والإكسسوارات.", crumbs: [{ name: "الأقسام", path: "/categories" }] });
  pages.offers.seo = () => ({ description: "عروض وخصومات على قطع غيار TVS وأكواد خصم وأطقم صيانة بسعر أقل من عزاب موتو.", crumbs: [{ name: "العروض", path: "/offers" }] });
  pages.bundles.seo = () => ({ description: "أطقم صيانة دورية جاهزة لموتوسيكلات TVS: Apache وRonin وNTORQ وStar HLX وRaider والتوك توك King بسعر أقل.", crumbs: [{ name: "أطقم الصيانة", path: "/bundles" }] });
})();
