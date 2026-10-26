/* =========================================================================
 * AZZAB MOTO — TVS Authorized Dealer — STORE DATA
 * Model names reflect the public TVS lineup. Prices, stock, part numbers,
 * specifications, compatibility years, orders and customers are DEMO DATA
 * for this frontend and must be replaced with real store data before launch.
 * ========================================================================= */
(function () {
  "use strict";
  const AZ = (window.AZ = window.AZ || {});
  const IMG = "assets/img/";
  const partImg = (art, tint, v) => `${IMG}parts/${art}-${tint}-${v}.svg`;
  const yrs = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* ---------------- Families ---------------- */
  const families = [
    { id: "apache", name: "Apache — رياضي", short: "Apache" },
    { id: "retro", name: "Ronin — نيو ريترو", short: "Ronin" },
    { id: "commuter", name: "موتوسيكلات التجوال", short: "تجوال" },
    { id: "scooter", name: "سكوترات", short: "سكوتر" },
    { id: "electric", name: "كهربائي", short: "كهربائي" },
    { id: "moped", name: "موتوسيكل خدمة", short: "خدمة" },
    { id: "three", name: "تروسيكل / توك توك", short: "توك توك" },
  ];

  /* ---------------- Full TVS lineup ----------------
   * kind: engine layout used to pick the right parts list
   * tier: price multiplier for parts
   * egypt: officially offered in the Egyptian market (per public launch news) */
  const M = [
    ["apache-rtr-160", "TVS Apache RTR 160", "apache", "sport", 160, 1.25, false, yrs(2018, 2025), "الأسطورة الرياضية الكلاسيكية"],
    ["apache-rtr-160-4v", "TVS Apache RTR 160 4V", "apache", "sport", 160, 1.3, true, yrs(2019, 2026), "أربع صمامات وأداء أعلى"],
    ["apache-rtr-180", "TVS Apache RTR 180", "apache", "sport", 177, 1.3, false, yrs(2018, 2024), "قوة إضافية بنفس الروح"],
    ["apache-rtr-200-4v", "TVS Apache RTR 200 4V", "apache", "sport", 198, 1.45, true, yrs(2019, 2026), "قمة عائلة RTR"],
    ["apache-rtr-310", "TVS Apache RTR 310", "apache", "sport", 312, 2.2, false, yrs(2023, 2026), "نيكد فائق الأداء"],
    ["apache-rr-310", "TVS Apache RR 310", "apache", "sport", 312, 2.3, false, yrs(2018, 2026), "سوبرسبورت بتصميم حلبات"],
    ["apache-rtx", "TVS Apache RTX", "apache", "sport", 299, 2.1, false, yrs(2025, 2026), "أدفنشر للطرق الطويلة"],
    ["ronin-225", "TVS Ronin", "retro", "sport", 225, 1.6, true, yrs(2022, 2026), "ستايل كلاسيكي بروح عصرية"],
    ["raider-125", "TVS Raider 125", "commuter", "commuter", 125, 1.05, true, yrs(2021, 2026), "شبابي واقتصادي"],
    ["star-hlx-150", "TVS Star HLX 150", "commuter", "commuter", 150, 1.05, true, yrs(2018, 2026), "تحمّل للطرق المصرية"],
    ["star-hlx-125", "TVS Star HLX 125", "commuter", "commuter", 125, 1.0, true, yrs(2018, 2026), "اقتصادي وعملي للشغل"],
    ["sport", "TVS Sport", "commuter", "commuter", 110, 0.95, false, yrs(2018, 2026), "اقتصادي في الاستهلاك"],
    ["radeon", "TVS Radeon", "commuter", "commuter", 110, 0.95, false, yrs(2018, 2026), "متين بتفاصيل كروم"],
    ["star-city-plus", "TVS Star City+", "commuter", "commuter", 110, 0.95, false, yrs(2018, 2026), "راحة يومية في المشاوير"],
    ["ntorq-125", "TVS NTORQ 125", "scooter", "scooter", 125, 1.1, true, yrs(2018, 2026), "سكوتر رياضي للمدينة"],
    ["ntorq-150", "TVS NTORQ 150", "scooter", "scooter", 150, 1.2, false, yrs(2025, 2026), "أقوى سكوتر في عائلة NTORQ"],
    ["jupiter-110", "TVS Jupiter 110", "scooter", "scooter", 113, 1.0, false, yrs(2018, 2026), "سكوتر عائلي عملي"],
    ["jupiter-125", "TVS Jupiter 125", "scooter", "scooter", 124, 1.05, false, yrs(2021, 2026), "مساحة وراحة أكبر"],
    ["zest-110", "TVS Zest 110", "scooter", "scooter", 110, 0.95, false, yrs(2018, 2026), "خفيف وسهل القيادة"],
    ["iqube", "TVS iQube", "electric", "electric", 0, 1.4, false, yrs(2020, 2026), "سكوتر كهربائي ذكي"],
    ["orbiter", "TVS Orbiter", "electric", "electric", 0, 1.2, false, yrs(2025, 2026), "كهربائي اقتصادي للمدينة"],
    ["tvs-x", "TVS X", "electric", "electric", 0, 2.0, false, yrs(2023, 2026), "كهربائي بريميوم"],
    ["xl100", "TVS XL100", "moped", "moped", 100, 0.85, true, yrs(2018, 2026), "للشغل والتوصيل"],
    ["king-deluxe", "TVS King Deluxe", "three", "three", 199, 1.2, true, yrs(2018, 2026), "التوك توك الأكثر انتشارًا"],
    ["king-deluxe-plus", "TVS King Deluxe Plus", "three", "three", 199, 1.25, false, yrs(2020, 2026), "راحة أكبر للركاب"],
  ];
  const models = M.map(([slug, name, family, kind, cc, tier, egypt, years, tagline]) => ({
    slug, name, short: name === "TVS X" ? name : name.replace("TVS ", ""), family, kind, cc, tier, egypt, years, tagline,
    image: `${IMG}models/${slug}.svg`, cutout: `${IMG}models/${slug}.svg`, plate: true,
  }));

  /* ---------------- Categories ---------------- */
  const categories = [
    { id: "engine", name: "قطع الموتور", en: "Engine Parts", art: "piston", tint: "silver", desc: "بساتم، جوانات، كلتش وكاربريتر" },
    { id: "brakes", name: "أنظمة الفرامل", en: "Braking Systems", art: "brake-disc", tint: "orange", desc: "تيل، ديسكات، فحمات وأسلاك" },
    { id: "electrical", name: "الكهرباء", en: "Electrical Parts", art: "cdi", tint: "orange", desc: "CDI، بوجيهات، موبينات وشواحن" },
    { id: "batteries", name: "البطاريات", en: "Batteries", art: "battery", tint: "orange", desc: "بطاريات جافة وجل لكل الموديلات" },
    { id: "oil", name: "الزيوت", en: "Engine Oil", art: "oil-bottle", tint: "orange", desc: "زيوت موتور، فتيس وفرامل" },
    { id: "filters", name: "الفلاتر", en: "Filters", art: "oil-filter", tint: "orange", desc: "فلاتر زيت، هواء وبنزين" },
    { id: "suspension", name: "العفشة", en: "Suspension", art: "shock-absorber", tint: "orange", desc: "مساعدين، شوك أمامية ورمان بلي" },
    { id: "tires", name: "الكاوتش", en: "Tires", art: "tire", tint: "orange", desc: "كاوتش أمامي وخلفي بكل المقاسات" },
    { id: "chains", name: "الجنزير والتروس", en: "Chains & Sprockets", art: "sprocket", tint: "orange", desc: "أطقم جنزير وتروس" },
    { id: "body", name: "البودي", en: "Body Panels", art: "body-panel", tint: "orange", desc: "رفارف، جانبيات ومرايات" },
    { id: "lighting", name: "الإضاءة", en: "Lighting", art: "headlight", tint: "orange", desc: "فوانيس أمامي وخلفي ولمبات" },
    { id: "accessories", name: "الإكسسوارات", en: "Accessories", art: "phone-holder", tint: "orange", desc: "حوامل، كادونات وأغطية" },
  ].map((c) => ({ ...c, image: partImg(c.art, c.tint, "a") }));

  /* ---------------- Model-specific parts templates ----------------
   * [key, name, category, art, basePrice, kinds it applies to, specs] */
  const ICE = ["sport", "commuter", "scooter", "moped", "three"];
  const GEARED = ["sport", "commuter", "moped"];
  const PT = [
    ["piston", "طقم بستم وشنابر STD", "engine", "piston", 2300, ICE, { "المقاس": "STD (قياسي)" }],
    ["gasket", "طقم جوانات موتور كامل", "engine", "gasket-kit", 720, ICE, { "المحتوى": "جوان وش سلندر + كارتير + سيلات" }],
    ["clutch", "طقم أسطوانات كلتش", "engine", "clutch-plates", 1050, [...GEARED, "three"], { "المحتوى": "فايبر + حديد" }],
    ["auto-clutch", "طقم كلتش أوتوماتيك (فحمات)", "engine", "clutch-plates", 980, ["scooter"], { "النوع": "كلتش طرد مركزي CVT" }],
    ["carb", "كاربريتر كامل", "engine", "carburetor", 1900, ["commuter", "moped", "three"], { "النوع": "كاربريتر بخاخ واحد" }],
    ["front-pads", "تيل فرامل أمامي", "brakes", "brake-pads", 380, ["sport", "commuter", "scooter", "electric"], { "الموضع": "أمامي" }],
    ["rear-pads", "تيل فرامل خلفي", "brakes", "brake-pads", 360, ["sport", "electric"], { "الموضع": "خلفي" }],
    ["shoes", "فحمات فرامل خلفي (درام)", "brakes", "brake-shoe", 290, ["commuter", "scooter", "moped", "three"], { "النوع": "درام" }],
    ["disc", "ديسك فرامل أمامي", "brakes", "brake-disc", 1700, ["sport", "commuter", "scooter", "electric"], { "الموضع": "أمامي" }],
    ["cdi", "وحدة CDI / ECU", "electrical", "cdi", 1250, ICE, { "الجهد": "12 فولت" }],
    ["controller", "كنترولر الموتور الكهربائي", "electrical", "cdi", 5200, ["electric"], { "النوع": "كنترولر BLDC" }],
    ["charger", "شاحن أصلي", "electrical", "charger", 3100, ["electric"], { "المدخل": "220 فولت" }],
    ["plug", "بوجيه", "electrical", "spark-plug", 170, ICE, { "النوع": "نيكل" }],
    ["coil", "موبينة (ملف إشعال)", "electrical", "ignition-coil", 820, ICE, { "الجهد": "12 فولت" }],
    ["battery", "بطارية 12V", "batteries", "battery", 1400, [...ICE, "electric"], { "الجهد": "12 فولت" }],
    ["oil-filter", "فلتر زيت", "filters", "oil-filter", 150, ["sport", "three"], { "النوع": "ورقي" }],
    ["air-filter", "فلتر هواء", "filters", "air-filter", 270, ICE, { "النوع": "ورقي مكسّر" }],
    ["shock", "مساعد خلفي", "suspension", "shock-absorber", 2100, ["sport", "commuter", "scooter", "electric", "moped", "three"], { "النوع": "هيدروليك" }],
    ["fork", "طقم سوست وجلب شوكة أمامية", "suspension", "front-fork", 1500, ["sport", "commuter", "moped"], { "المحتوى": "2 سوستة + 2 جلبة + 2 سيل" }],
    ["front-tire", "كاوتش أمامي", "tires", "tire", 1500, ["sport", "commuter", "scooter", "electric", "moped", "three"], { "الموضع": "أمامي" }],
    ["rear-tire", "كاوتش خلفي", "tires", "tire", 1800, ["sport", "commuter", "scooter", "electric", "moped", "three"], { "الموضع": "خلفي" }],
    ["chain-kit", "طقم جنزير وتروس", "chains", "chain", 1900, GEARED, { "المحتوى": "جنزير + ترس أمامي + ترس خلفي" }],
    ["sprocket", "ترس خلفي", "chains", "sprocket", 450, GEARED, { "الموضع": "خلفي" }],
    ["panel", "جانبية بودي", "body", "body-panel", 1100, ["sport", "commuter", "scooter", "electric", "three"], { "الخامة": "ABS" }],
    ["mirrors", "مرايات جانبية (جوز)", "body", "mirror", 480, ["sport", "commuter", "scooter", "electric", "moped", "three"], { "العدد": "2" }],
    ["headlight", "فانوس أمامي", "lighting", "headlight", 1700, ["sport", "commuter", "scooter", "electric", "moped", "three"], { "النوع": "حسب الموديل" }],
    ["taillight", "فانوس خلفي", "lighting", "tail-lamp", 950, ["sport", "commuter", "scooter", "electric", "three"], { "النوع": "حسب الموديل" }],
    ["guard", "واقي موتور (كراش بار)", "accessories", "engine-guard", 1800, ["sport"], { "الخامة": "صلب مطلي" }],
  ];

  /* ---------------- Universal products ---------------- */
  const UNI = [
    ["زيت موتور 10W-40 نصف تخليقي — 1 لتر", "oil", "oil-bottle", "orange", 520, null, ["sport", "commuter", "moped", "three"], "RoadMax", "aftermarket", { "اللزوجة": "10W-40", "المواصفة": "JASO MA2" }],
    ["زيت موتور TVS أصلي 10W-30 للسكوتر — 800 مل", "oil", "oil-bottle", "silver", 440, null, ["scooter"], "TVS", "original", { "اللزوجة": "10W-30", "المواصفة": "JASO MB" }],
    ["زيت موتور 15W-50 تخليقي بالكامل — 1 لتر", "oil", "oil-bottle", "charcoal", 890, 990, ["sport"], "TVS", "original", { "اللزوجة": "15W-50", "المواصفة": "JASO MA2" }],
    ["زيت فتيس سكوتر — 120 مل", "oil", "oil-bottle", "silver", 140, null, ["scooter"], "TVS", "original", { "اللزوجة": "80W-90" }],
    ["زيت فرامل DOT4 — 250 مل", "oil", "oil-bottle", "charcoal", 210, null, ["sport", "commuter", "scooter", "electric"], "ProGrip", "aftermarket", { "المواصفة": "DOT 4" }],
    ["منظف وشحم جنزير — 400 مل", "oil", "oil-bottle", "orange", 320, 380, ["sport", "commuter", "moped"], "ChainPro", "aftermarket", { "الحجم": "400 مل" }],
    ["زيت شوكة أمامية 10W — 500 مل", "oil", "oil-bottle", "charcoal", 280, null, ["sport", "commuter", "moped"], "RoadMax", "aftermarket", { "اللزوجة": "10W" }],
    ["فلتر بنزين داخلي", "filters", "oil-filter", "charcoal", 110, null, ["sport", "commuter", "scooter", "moped", "three"], "FlowFilter", "aftermarket", { "المقاس": "6 مم" }],
    ["كلاكس ديسك 12 فولت", "electrical", "horn", "orange", 260, null, null, "VoltEdge", "aftermarket", { "شدة الصوت": "105 ديسيبل" }],
    ["كلاكس مزدوج عالي الصوت", "electrical", "horn", "charcoal", 490, 560, null, "VoltEdge", "aftermarket", { "شدة الصوت": "115 ديسيبل" }],
    ["كابلات توصيل بطارية نحاس", "batteries", "cable", "orange", 220, null, null, "VoltEdge", "aftermarket", { "الطول": "60 سم" }],
    ["رمان بلي عجلة أمامية", "suspension", "bearing", "orange", 240, null, null, "RoadMax", "aftermarket", { "المقاس": "6301-2RS" }],
    ["طقم رمان بلي ستيرنج", "suspension", "bearing", "silver", 380, null, ["sport", "commuter", "moped"], "RoadMax", "aftermarket", { "النوع": "رولمان مخروطي" }],
    ["سلك كلتش", "engine", "cable", "charcoal", 190, null, ["sport", "commuter", "moped", "three"], "RoadMax", "aftermarket", { "الطول": "حسب الموديل" }],
    ["سلك فرامل خلفي", "brakes", "cable", "silver", 140, null, ["commuter", "scooter", "moped"], "RoadMax", "aftermarket", { "الطول": "حسب الموديل" }],
    ["ذراع فرامل ألومنيوم قابل للضبط", "brakes", "brake-lever", "orange", 950, 1100, ["sport"], "ProGrip", "aftermarket", { "الخامة": "ألومنيوم CNC", "مستويات الضبط": "6" }],
    ["لمبة هالوجين H4 12V 35/35W", "lighting", "bulb", "silver", 120, null, ["commuter", "scooter", "moped", "three"], "LumaRide", "aftermarket", { "القدرة": "35/35 وات" }],
    ["لمبة LED للفانوس الأمامي", "lighting", "bulb", "orange", 450, 520, ["commuter", "scooter", "moped", "three"], "LumaRide", "aftermarket", { "القدرة": "18 وات", "اللون": "أبيض 6000K" }],
    ["مرايات رياضية CNC", "body", "mirror", "orange", 890, 990, ["sport", "commuter"], "ShieldGear", "aftermarket", { "الخامة": "ألومنيوم CNC", "العدد": "2" }],
    ["حامل موبايل ألومنيوم مقاوم للاهتزاز", "accessories", "phone-holder", "orange", 650, 750, null, "ShieldGear", "aftermarket", { "المقاس المناسب": "4.7 – 7 بوصة" }],
    ["جلد كادون رياضي (جوز)", "accessories", "grips", "orange", 280, null, ["sport", "commuter", "moped"], "ProGrip", "aftermarket", { "القطر": "22 مم" }],
    ["جلد كادون كلاسيك (جوز)", "accessories", "grips", "charcoal", 190, null, null, "ProGrip", "aftermarket", { "القطر": "22 مم" }],
    ["كفر مقعد مضاد للماء", "accessories", "seat-cover", "orange", 350, null, null, "ShieldGear", "aftermarket", { "الخامة": "جلد صناعي" }],
    ["غطاء موتوسيكل كامل مقاوم للمطر", "accessories", "bike-cover", "orange", 750, null, ["sport", "commuter", "moped"], "ShieldGear", "aftermarket", { "المقاس": "XL" }],
    ["غطاء سكوتر مقاوم للمطر", "accessories", "bike-cover", "silver", 620, null, ["scooter", "electric"], "ShieldGear", "aftermarket", { "المقاس": "L" }],
  ];

  const CAT_CODE = { engine: "ENG", brakes: "BRK", electrical: "ELC", batteries: "BAT", oil: "OIL", filters: "FLT", suspension: "SUS", tires: "TYR", chains: "CHN", body: "BDY", lighting: "LGT", accessories: "ACC" };
  const DESC = {
    engine: "قطعة موتور لاستعادة أداء الموتور وكفاءته. يُفضّل التركيب في مركز صيانة متخصص.",
    brakes: "جزء أساسي في منظومة الفرامل للحفاظ على ثبات التوقف والأمان على الطريق.",
    electrical: "مكون كهربائي للحفاظ على كفاءة منظومة الإشعال والكهرباء.",
    batteries: "بطارية لتشغيل سلس وثابت مع الحفاظ على كفاءة المنظومة الكهربائية.",
    oil: "سائل صيانة دورية يحمي الأجزاء المتحركة ويطيل عمرها.",
    filters: "فلتر صيانة دورية يحمي الموتور من الشوائب ويحافظ على الأداء.",
    suspension: "جزء من منظومة العفشة لراحة القيادة وثبات أفضل على الطرق المختلفة.",
    tires: "كاوتش بتصميم مداس مناسب للاستخدام اليومي داخل المدينة وخارجها.",
    chains: "منظومة نقل الحركة للحفاظ على سلاسة التعشيق وتقليل الضوضاء.",
    body: "قطعة بودي بمقاس مطابق للموديل لاستعادة الشكل الأصلي.",
    lighting: "إضاءة واضحة للرؤية الليلية وزيادة ظهورك على الطريق.",
    accessories: "إكسسوار عملي يضيف راحة وحماية لاستخدامك اليومي.",
  };
  const TINT_ROT = ["orange", "silver", "charcoal"];

  let seed = 11;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const round5 = (n) => Math.round(n / 5) * 5;
  const catCounters = {};
  const products = [];

  function makeProduct({ name, cat, art, tint, price, oldPrice, compat, brand, cls, specs, key, model }) {
    const i = products.length;
    catCounters[cat] = (catCounters[cat] || 0) + 1;
    const code = CAT_CODE[cat];
    const stockRoll = rnd();
    const stock = stockRoll < 0.05 ? 0 : stockRoll < 0.14 ? 1 + Math.floor(rnd() * 4) : 6 + Math.floor(rnd() * 55);
    const partNumber = `PN-${(10437 + i * 377).toString(36).toUpperCase()}${(i * 7) % 10}`;
    const p = {
      id: `p${String(i + 1).padStart(3, "0")}`,
      slug: `${code.toLowerCase()}-${key || art}-${model || "u"}-${i + 1}`,
      sku: `AZ-${code}-${String(catCounters[cat]).padStart(3, "0")}`,
      partNumber,
      name, category: cat, art, tint, price, oldPrice: oldPrice || null,
      image: partImg(art, tint, "a"),
      gallery: [partImg(art, tint, "a"), partImg(art, tint, "b"), partImg(art, tint, "c")],
      stock,
      compat,
      description: `${name} — ${DESC[cat]}`,
      specs: Object.assign({ "رقم القطعة": partNumber, "الماركة": brand, "التصنيف": cls === "original" ? "أصلي TVS" : "بديل (Aftermarket)" }, specs || {}),
      brand, classification: cls,
      featured: false, bestSeller: false,
      popularity: Math.floor(40 + rnd() * 960),
      createdAt: new Date(2026, 2 + Math.floor(rnd() * 7), 1 + Math.floor(rnd() * 27)).toISOString(),
      primaryModel: model || null,
    };
    products.push(p);
    return p;
  }

  // model-specific parts (genuine TVS)
  models.forEach((m, mi) => {
    PT.filter((t) => t[5].includes(m.kind)).forEach((t, ti) => {
      const [key, label, cat, art, base, , specs] = t;
      const price = round5(base * m.tier * (0.94 + rnd() * 0.12));
      const discounted = rnd() < 0.18;
      makeProduct({
        key, model: m.slug,
        name: `${label} ${m.short}`,
        cat, art, tint: TINT_ROT[(mi + ti) % 3],
        price: discounted ? round5(price * 0.88) : price,
        oldPrice: discounted ? price : null,
        compat: [{ model: m.slug, years: m.years.slice() }],
        brand: "TVS", cls: "original", specs,
      });
    });
  });

  // universal / multi-model parts
  UNI.forEach((u) => {
    const [name, cat, art, tint, price, oldPrice, kinds, brand, cls, specs] = u;
    const ms = models.filter((m) => !kinds || kinds.includes(m.kind));
    makeProduct({
      name, cat, art, tint, price, oldPrice, brand, cls, specs,
      compat: ms.map((m) => ({ model: m.slug, years: m.years.slice() })),
    });
  });

  // merchandising flags
  const popularKeys = ["Apache RTR 160 4V", "Apache RTR 200 4V", "NTORQ 125", "Star HLX 150", "King Deluxe", "Raider 125", "Ronin", "XL100"];
  products.forEach((p, i) => {
    const egyptHit = popularKeys.some((k) => p.name.endsWith(k));
    p.bestSeller = (egyptHit && ["front-pads", "oil-filter", "air-filter", "plug", "chain-kit", "battery", "shoes", "rear-tire"].some((k) => p.slug.includes(`-${k}-`))) || (!p.primaryModel && i % 3 === 0);
    p.featured = egyptHit && i % 4 === 0;
    if (p.bestSeller) p.popularity += 600;
  });

  /* ---------------- Bundles ---------------- */
  const pick = (model, keys) => keys.map((k) => products.find((p) => p.primaryModel === model && p.slug.includes(`-${k}-${model}-`))).filter(Boolean).map((p) => p.id);
  const uni = (frag) => products.find((p) => !p.primaryModel && p.name.includes(frag)).id;
  const bundleDefs = [
    ["apache-160-4v-service", "طقم الصيانة الدورية Apache RTR 160 4V", "apache-rtr-160-4v", ["oil-filter", "air-filter", "plug", "front-pads"], ["10W-40", "منظف وشحم"], 12, "oil-filter", "orange"],
    ["apache-200-performance", "طقم أداء Apache RTR 200 4V", "apache-rtr-200-4v", ["oil-filter", "air-filter", "plug", "front-pads", "rear-pads"], ["15W-50"], 10, "brake-disc", "orange"],
    ["ntorq-maintenance", "طقم صيانة NTORQ 125", "ntorq-125", ["air-filter", "plug", "front-pads", "shoes"], ["10W-30", "زيت فتيس"], 12, "oil-bottle", "silver"],
    ["ronin-care", "طقم العناية Ronin", "ronin-225", ["oil-filter", "air-filter", "front-pads", "rear-pads"], ["15W-50", "منظف وشحم"], 12, "chain", "orange"],
    ["hlx-150-service", "طقم صيانة Star HLX 150", "star-hlx-150", ["air-filter", "plug", "shoes", "front-pads"], ["10W-40"], 15, "spark-plug", "silver"],
    ["raider-tuneup", "طقم تظبيط Raider 125", "raider-125", ["air-filter", "plug", "coil", "clutch"], ["10W-40"], 10, "air-filter", "charcoal"],
    ["king-tuktuk-service", "طقم صيانة التوك توك King Deluxe", "king-deluxe", ["oil-filter", "air-filter", "plug", "shoes", "clutch"], ["10W-40"], 15, "brake-shoe", "orange"],
    ["xl100-work-kit", "طقم الشغل XL100", "xl100", ["air-filter", "plug", "shoes", "chain-kit"], ["10W-40"], 12, "sprocket", "charcoal"],
  ];
  const bundles = bundleDefs.map(([slug, name, model, keys, unis, discount, art, tint], i) => {
    const ids = [...pick(model, keys), ...unis.map(uni)];
    const total = ids.reduce((s, id) => s + products.find((p) => p.id === id).price, 0);
    const price = round5(total * (1 - discount / 100));
    return { id: `b${i + 1}`, slug, name, model, productIds: ids, total, price, savings: total - price, discount, image: partImg(art, tint, "c") };
  });

  /* ---------------- Shipping (estimates) ---------------- */
  const shipping = [
    ["القاهرة", 60, "1 – 3 أيام عمل"], ["الجيزة", 60, "1 – 3 أيام عمل"], ["القليوبية", 65, "2 – 3 أيام عمل"], ["الإسكندرية", 75, "2 – 4 أيام عمل"],
    ["البحيرة", 80, "2 – 4 أيام عمل"], ["الغربية", 80, "2 – 4 أيام عمل"], ["المنوفية", 75, "2 – 4 أيام عمل"], ["الدقهلية", 80, "2 – 4 أيام عمل"],
    ["الشرقية", 75, "2 – 4 أيام عمل"], ["كفر الشيخ", 85, "3 – 5 أيام عمل"], ["دمياط", 85, "3 – 5 أيام عمل"], ["بورسعيد", 85, "3 – 5 أيام عمل"],
    ["الإسماعيلية", 85, "3 – 5 أيام عمل"], ["السويس", 85, "3 – 5 أيام عمل"], ["الفيوم", 85, "2 – 4 أيام عمل"], ["بني سويف", 90, "3 – 5 أيام عمل"],
    ["المنيا", 95, "3 – 5 أيام عمل"], ["أسيوط", 100, "3 – 6 أيام عمل"], ["سوهاج", 105, "4 – 6 أيام عمل"], ["قنا", 110, "4 – 6 أيام عمل"],
    ["الأقصر", 115, "4 – 7 أيام عمل"], ["أسوان", 120, "4 – 7 أيام عمل"], ["البحر الأحمر", 130, "5 – 7 أيام عمل"], ["الوادي الجديد", 140, "5 – 8 أيام عمل"],
    ["مطروح", 130, "5 – 7 أيام عمل"], ["شمال سيناء", 140, "5 – 8 أيام عمل"], ["جنوب سيناء", 140, "5 – 8 أيام عمل"],
  ].map(([gov, fee, eta]) => ({ gov, fee, eta }));
  const FREE_SHIPPING_OVER = 3000;

  /* ---------------- Coupons ---------------- */
  const coupons = [
    { code: "AZZAB10", type: "percent", value: 10, min: 1000, max: 500, label: "خصم 10% (حتى 500 ج.م) على الطلبات فوق 1000 ج.م", active: true },
    { code: "WELCOME100", type: "fixed", value: 100, min: 800, label: "خصم 100 ج.م على الطلبات فوق 800 ج.م", active: true },
    { code: "SERVICE15", type: "percent", value: 15, min: 2500, max: 800, label: "خصم 15% على الطلبات فوق 2500 ج.م", active: true },
    { code: "FREESHIP", type: "shipping", value: 0, min: 1500, label: "شحن مجاني للطلبات فوق 1500 ج.م", active: true },
  ];

  /* ---------------- Demo customers & orders ---------------- */
  const names = ["أحمد السيد", "محمد عبد الرحمن", "محمود حسن", "كريم مصطفى", "عمر خالد", "يوسف إبراهيم", "مصطفى عادل", "علي حسين", "حسام فتحي", "إسلام نبيل", "شريف جمال", "طارق سمير", "هاني رمضان", "ياسر عبد الله", "عمرو صلاح", "سارة محمود"];
  const govs = ["القاهرة", "الجيزة", "الفيوم", "الإسكندرية", "الشرقية", "المنيا", "الدقهلية", "أسيوط", "القليوبية", "الغربية"];
  const egyptModels = models.filter((m) => m.egypt);
  const customers = names.map((n, i) => ({
    id: `c${String(i + 1).padStart(2, "0")}`,
    name: n,
    phone: `0100000${String(1000 + i * 37).slice(-4)}`,
    gov: govs[i % govs.length],
    bike: egyptModels[i % egyptModels.length].slug,
    joined: new Date(2026, i % 9, 1 + ((i * 3) % 27)).toISOString(),
  }));

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "delivered", "delivered", "cancelled"];
  const orders = Array.from({ length: 24 }, (_, i) => {
    const c = customers[i % customers.length];
    const own = products.filter((p) => p.compat.some((x) => x.model === c.bike));
    const n = 1 + Math.floor(rnd() * 3);
    const items = Array.from({ length: n }, () => {
      const p = own[Math.floor(rnd() * own.length)];
      return { id: p.id, name: p.name, price: p.price, qty: 1 + Math.floor(rnd() * 2), image: p.image };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const ship = shipping.find((s) => s.gov === c.gov) || shipping[0];
    const fee = subtotal >= FREE_SHIPPING_OVER ? 0 : ship.fee;
    const date = new Date(2026, 9, 25 - Math.floor(i * 1.6), 10 + (i % 9), (i * 13) % 60);
    return {
      id: `AZ-${260000 + i * 73}`,
      date: date.toISOString(),
      customer: { name: c.name, phone: c.phone, whatsapp: c.phone, gov: c.gov, city: "—", address: "عنوان تجريبي", landmark: "", notes: "" },
      customerId: c.id,
      items, subtotal, discount: 0, shipping: fee, total: subtotal + fee,
      payment: "cod",
      status: i < 3 ? "pending" : statuses[i % statuses.length],
      notification: i % 5 === 0 ? "manual-sent" : "not-sent",
      demo: true,
    };
  });

  const statusLabels = { pending: "قيد المراجعة", confirmed: "تم التأكيد", processing: "جاري التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

  AZ.data = { families, models, categories, products, bundles, shipping, FREE_SHIPPING_OVER, coupons, customers, orders, statusLabels, partImg };
})();
