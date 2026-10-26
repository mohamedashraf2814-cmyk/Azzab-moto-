/*
 * Import real photos sent by the store.
 *   node scripts/import-photos.js <folder>
 * File names decide where each photo goes:
 *   model--apache-rtr-160-4v.jpg   → photo for that model (slug from data.js)
 *   part--brake-pads.jpg           → photo for every product of that part type (art name)
 *   sku--AZ-BRK-004.jpg            → photo for one product (by SKU)
 * Model photos shot on a white/plain-light background also get a transparent
 * cut-out (…-cut.webp) used in the hero, model cards and model pages.
 * Existing entries in photos.js are kept; new files add to them.
 * Requires sharp.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const src = process.argv[2];
if (!src) { console.error("usage: node scripts/import-photos.js <folder>"); process.exit(1); }
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "photos");
const PHOTOS_JS = path.join(ROOT, "assets", "js", "photos.js");

function readLocal() {
  const js = fs.readFileSync(PHOTOS_JS, "utf8");
  const m = js.match(/const LOCAL = ([\s\S]*?\});/);
  try { return Object.assign({ models: {}, cuts: {}, parts: {}, products: {} }, eval("(" + m[1] + ")")); } catch (e) { return { models: {}, cuts: {}, parts: {}, products: {} }; }
}

/* Remove a plain light background by flood-filling from the borders. Returns null if the border isn't light. */
async function cutout(file, outPath) {
  const { data, info } = await sharp(file).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const isBg = (i) => { const r = data[i], g = data[i + 1], b = data[i + 2]; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mn > 218 && mx - mn < 28; };
  let light = 0, total = 0;
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { total++; if (isBg((y * W + x) * 4)) light++; }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { total++; if (isBg((y * W + x) * 4)) light++; }
  if (light / total < 0.8) return null;
  const mask = Buffer.alloc(W * H, 255);
  const stack = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const p = y * W + x; if (mask[p] === 0 || !isBg(p * 4)) return; mask[p] = 0; stack.push(p); };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) { const p = stack.pop(); const x = p % W, y = (p - x) / W; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  // soften the edge with a 3x3 box blur on the mask
  const soft = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let sum = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { sum += mask[yy * W + xx]; n++; } }
    soft[y * W + x] = Math.round(sum / n);
  }
  const rgba = Buffer.from(data);
  for (let p = 0; p < W * H; p++) rgba[p * 4 + 3] = soft[p];
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).webp({ quality: 90, alphaQuality: 90 }).toFile(outPath);
  return outPath;
}

(async () => {
  const LOCAL = readLocal();
  for (const f of fs.readdirSync(src)) {
    const m = f.match(/^(model|part|sku)--(.+)\.(jpe?g|png|webp|avif)$/i);
    if (!m) { console.warn("skip (name not recognised):", f); continue; }
    const [, kind, key] = m;
    const dir = { model: "models", part: "parts", sku: "products" }[kind.toLowerCase()];
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    const file = path.join(src, f);
    const outRel = `assets/photos/${dir}/${key}.webp`;
    if (dir === "models") {
      await sharp(file).rotate().resize(1200, 900, { fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(ROOT, outRel));
      LOCAL.models[key] = outRel;
      const cutRel = `assets/photos/models/${key}-cut.webp`;
      if (await cutout(file, path.join(ROOT, cutRel))) { LOCAL.cuts[key] = cutRel; console.log("✓ cut-out", cutRel); }
    } else {
      await sharp(file).rotate().resize(1000, 1000, { fit: "contain", background: "#ffffff", withoutEnlargement: false }).flatten({ background: "#ffffff" }).webp({ quality: 85 }).toFile(path.join(ROOT, outRel));
      (dir === "parts" ? LOCAL.parts : LOCAL.products)[key] = outRel;
    }
    console.log("✓", f, "→", outRel);
  }
  let js = fs.readFileSync(PHOTOS_JS, "utf8");
  js = js.replace(/const LOCAL = [\s\S]*?\};/, `const LOCAL = ${JSON.stringify(LOCAL, null, 2)};`);
  fs.writeFileSync(PHOTOS_JS, js);
  console.log("photos.js updated.");
})();
