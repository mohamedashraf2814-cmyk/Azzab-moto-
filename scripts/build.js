/*
 * Production build: bundles + minifies JS/CSS, writes sitemap.xml / robots.txt,
 * stamps the service-worker version, and prerenders crawlable HTML into index.html.
 *   node scripts/build.js [https://your-domain.com]
 * Requires esbuild (npx esbuild works too).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const SITE = (process.argv[2] || process.env.SITE_URL || "https://azzab-moto.vercel.app").replace(/\/$/, "");
const ESBUILD = process.env.ESBUILD || (fs.existsSync("/opt/npm-tools/node_modules/esbuild/bin/esbuild") ? "/opt/npm-tools/node_modules/esbuild/bin/esbuild" : "esbuild");
const r = (p) => path.join(ROOT, p);

const STORE = ["data.js", "photos.js", "core.js", "ui.js", "pages-store.js", "pages-flow.js", "app.js"];
fs.mkdirSync(r("assets/dist"), { recursive: true });
const bundleSrc = STORE.map((f) => `/* ${f} */\n` + fs.readFileSync(r(`assets/js/${f}`), "utf8")).join("\n;\n");
fs.writeFileSync(r("assets/dist/app.src.js"), bundleSrc);
const min = (inFile, outFile, extra = []) => execFileSync(ESBUILD, [inFile, "--minify", "--charset=utf8", "--target=es2019", `--outfile=${outFile}`, "--log-level=warning", ...extra]);
min(r("assets/dist/app.src.js"), r("assets/dist/app.min.js"));
min(r("assets/js/admin.js"), r("assets/dist/admin.min.js"));
execFileSync(ESBUILD, [r("assets/css/styles.css"), "--minify", "--charset=utf8", `--outfile=${r("assets/dist/styles.min.css")}`, "--log-level=warning"]);
fs.unlinkSync(r("assets/dist/app.src.js"));

// data for sitemap + prerender
global.window = {}; global.document = { addEventListener() {} };
require(r("assets/js/data.js")); require(r("assets/js/photos.js"));
const D = global.window.AZ.data;
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ["/", "1.0", "daily"], ["/shop", "0.9", "daily"], ["/motorcycles", "0.9", "weekly"], ["/categories", "0.8", "weekly"], ["/offers", "0.8", "daily"],
  ["/bundles", "0.7", "weekly"], ["/about", "0.5", "monthly"], ["/contact", "0.5", "monthly"], ["/faq", "0.5", "monthly"], ["/track-order", "0.4", "monthly"],
  ["/policies/shipping", "0.3", "yearly"], ["/policies/returns", "0.3", "yearly"], ["/policies/privacy", "0.2", "yearly"], ["/policies/terms", "0.2", "yearly"],
  ...D.models.map((m) => [`/motorcycles/${m.slug}`, "0.8", "weekly"]),
  ...D.categories.map((c) => [`/shop?cat=${c.id}`, "0.7", "weekly"]),
  ...D.products.map((p) => [`/products/${p.slug}`, "0.6", "weekly"]),
];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
fs.writeFileSync(r("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr, cf]) => `  <url><loc>${esc(SITE + u)}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(r("robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\nDisallow: /account\n\nSitemap: ${SITE}/sitemap.xml\n`);

// crawlable prerender (replaced by the app on load)
const pre = `<div class="prerender">
<header><h1>عزاب موتو — وكيل معتمد TVS: قطع غيار موتوسيكلات وسكوترات TVS في مصر</h1>
<p>قطع غيار أصلية وبديلة لكل موديلات TVS: Apache وRonin وRaider وStar HLX وNTORQ وJupiter وXL100 والتوك توك King. الدفع عند الاستلام والشحن لكل المحافظات.</p></header>
<nav aria-label="موديلات TVS"><h2>موديلات TVS</h2><ul>${D.models.map((m) => `<li><a href="/motorcycles/${m.slug}">قطع غيار ${esc(m.name)}</a></li>`).join("")}</ul></nav>
<nav aria-label="الأقسام"><h2>أقسام قطع الغيار</h2><ul>${D.categories.map((c) => `<li><a href="/shop?cat=${c.id}">${esc(c.name)} — ${esc(c.desc)}</a></li>`).join("")}</ul></nav>
<nav aria-label="روابط"><ul><li><a href="/shop">المتجر</a></li><li><a href="/offers">العروض</a></li><li><a href="/bundles">أطقم الصيانة</a></li><li><a href="/faq">الأسئلة الشائعة</a></li><li><a href="/contact">تواصل معنا</a></li></ul></nav>
</div>`;
let html = fs.readFileSync(r("index.html"), "utf8");
html = html.replace(/<!--PRERENDER-->[\s\S]*?<!--\/PRERENDER-->/, `<!--PRERENDER-->${pre}<!--/PRERENDER-->`);
const oldSite = (html.match(/name="az-site" content="([^"]+)"/) || [])[1];
if (oldSite && oldSite !== SITE) html = html.split(oldSite).join(SITE);
fs.writeFileSync(r("index.html"), html);
fs.copyFileSync(r("index.html"), r("404.html")); // GitHub Pages deep-link fallback

// service worker version + cache-busting query on bundles
const ver = Date.now().toString(36);
html = html.replace(/assets\/dist\/(app|styles)\.min\.(js|css)(\?v=\w+)?/g, (m, a, b) => `assets/dist/${a}.min.${b}?v=${ver}`);
fs.writeFileSync(r("index.html"), html);
fs.copyFileSync(r("index.html"), r("404.html"));
let sw = fs.readFileSync(r("sw.js"), "utf8").replace(/const VERSION = "[^"]*";/, `const VERSION = "${ver}";`);
fs.writeFileSync(r("sw.js"), sw);

const kb = (f) => (fs.statSync(r(f)).size / 1024).toFixed(0) + " KB";
console.log(`built: app.min.js ${kb("assets/dist/app.min.js")}, admin.min.js ${kb("assets/dist/admin.min.js")}, styles.min.css ${kb("assets/dist/styles.min.css")}; sitemap ${urls.length} URLs; sw ${ver}; site ${SITE}`);
