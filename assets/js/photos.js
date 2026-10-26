/* =========================================================================
 * AZZAB MOTO — real photography
 *
 * 1) STORE PHOTOS (recommended): put the official TVS dealer photos in
 *    assets/photos/ and list them below in LOCAL. They take priority.
 *      LOCAL.models["apache-rtr-160-4v"] = "assets/photos/models/apache-rtr-160-4v.jpg";
 *      LOCAL.parts["brake-pads"]        = "assets/photos/parts/brake-pads.jpg";
 *      LOCAL.products["AZ-BRK-004"]     = "assets/photos/products/AZ-BRK-004.jpg";  // by SKU
 *
 * 2) COMMONS: freely-licensed photos from Wikimedia Commons, loaded from
 *    commons.wikimedia.org. Each one is credited on #/credits.
 *
 * If any photo fails to load, the page swaps in the matching illustration.
 * ========================================================================= */
(function () {
  "use strict";
  const AZ = (window.AZ = window.AZ || {});
  const D = AZ.data;

  const LOCAL = {
  "models": {
    "apache-rtr-160": "assets/photos/models/apache-rtr-160.webp",
    "apache-rtr-200-4v": "assets/photos/models/apache-rtr-200-4v.webp",
    "raider-125": "assets/photos/models/raider-125.webp",
    "ronin-225": "assets/photos/models/ronin-225.webp",
    "star-hlx-150": "assets/photos/models/star-hlx-150.webp",
    "xl100": "assets/photos/models/xl100.webp"
  },
  "cuts": {
    "apache-rtr-160": "assets/photos/models/apache-rtr-160-cut.webp",
    "apache-rtr-200-4v": "assets/photos/models/apache-rtr-200-4v-cut.webp",
    "ronin-225": "assets/photos/models/ronin-225-cut.webp",
    "star-hlx-150": "assets/photos/models/star-hlx-150-cut.webp"
  },
  "parts": {},
  "products": {}
};

  const commons = (file, w = 900) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;
  const page = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

  // TVS models with a real photo on Wikimedia Commons
  const COMMONS_MODELS = {
    "apache-rtr-160": "Apache RTR 160.jpg",
    "apache-rtr-180": "The Apache RTR 180 V2.jpg",
    "apache-rtr-200-4v": "TVS Apache RTR 200 4v.png",
    "apache-rr-310": "Apacherr310c.jpg",
    "raider-125": "TVS Raider 125.jpg",
    "jupiter-110": "TVS Jupiter.jpg",
    "ntorq-125": "TVS Ntroq Standard Edition vs TVS Ntroq Marvel Edition.jpg",
    "star-city-plus": "TVS Star city bike 2014-01-02 11-45.jpg",
  };
  // Generic part photos (representative, not the exact SKU)
  const COMMONS_PARTS = {
    piston: "Piston rings.jpg",
    "clutch-plates": "Motorcycle clutch.jpg",
    "brake-pads": "Disc brake pads.JPG",
    "brake-disc": "Disc brake.jpg",
    "spark-plug": "Spark plug.jpg",
    battery: "Lead-acid battery for motorcycle.jpg",
    "oil-filter": "New motorcycle oil filter Hiflo Filtro.jpg",
    "shock-absorber": "Shock Absorbers Detail.jpg",
    tire: "Motorcycle tyre stack.jpg",
    chain: "R1 Chain.jpg",
    sprocket: "Bike gears and chain.jpg",
    headlight: "Scooter headlights.jpg",
  };

  const fallback = new Map(); // photo url -> illustration url
  const credits = [];

  D.models.forEach((m) => {
    const local = LOCAL.models[m.slug];
    const file = COMMONS_MODELS[m.slug];
    const url = local || (file ? commons(file, 1000) : null);
    const cut = LOCAL.cuts && LOCAL.cuts[m.slug];
    if (cut) { fallback.set(cut, m.image); m.cutout = cut; m.photoCut = cut; m.plate = false; }
    if (!url) return;
    m.photo = url;
    m.photoLocal = !!local;
    m.plate = false;
    fallback.set(url, m.image);
    if (!local && file) credits.push({ what: m.name, file, url: page(file) });
  });

  const partCredited = new Set();
  D.products.forEach((p) => {
    const local = LOCAL.products[p.sku] || LOCAL.parts[p.art];
    const file = COMMONS_PARTS[p.art];
    const url = local || (file ? commons(file, 800) : null);
    if (!url) return;
    p.photo = url;
    p.image = url;
    p.gallery = [url, ...p.gallery.slice(0, 2)];
    fallback.set(url, D.partImg(p.art, p.tint, "a"));
    if (!local && file && !partCredited.has(file)) { partCredited.add(file); credits.push({ what: `صورة توضيحية: ${p.art}`, file, url: page(file) }); }
  });

  AZ.photos = { LOCAL, credits, fallbackFor: (src) => fallback.get(src) };

  // swap any failed photo for its illustration (capture phase: error doesn't bubble)
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fellBack) return;
    const fb = fallback.get(img.getAttribute("src"));
    if (fb) { img.dataset.fellBack = "1"; img.src = fb; const box = img.closest(".is-photo, .is-cut"); if (box) { box.classList.remove("is-photo", "is-cut"); const tag = box.querySelector(".photo-tag"); if (tag) tag.remove(); } }
  }, true);
})();
