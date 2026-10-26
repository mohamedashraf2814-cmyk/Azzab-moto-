/*
 * AZZAB MOTO — demo artwork generator
 * Produces consistent, clearly-illustrative SVG renders for every part type
 * and motorcycle body style. Run:  node scripts/generate-art.js
 * Replace files in assets/img with real product photography when available.
 */
const fs = require("fs");
const path = require("path");

const OUT_PARTS = path.join(__dirname, "..", "assets", "img", "parts");
const OUT_BIKES = path.join(__dirname, "..", "assets", "img", "bikes");
fs.mkdirSync(OUT_PARTS, { recursive: true });
fs.mkdirSync(OUT_BIKES, { recursive: true });

const TINTS = {
  orange: { a: "#FFB25C", b: "#FF8200", c: "#D96800" },
  silver: { a: "#F4F6F9", b: "#BCC4CE", c: "#7D8693" },
  charcoal: { a: "#4A505A", b: "#2A2E35", c: "#121418" },
};

function defs(t) {
  const T = TINTS[t];
  return `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF1F5"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#FF8200" stop-opacity="0.13"/><stop offset="1" stop-color="#FF8200" stop-opacity="0"/></radialGradient>
  <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#17191D" stop-opacity="0.28"/><stop offset="1" stop-color="#17191D" stop-opacity="0"/></radialGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAFBFC"/><stop offset="0.35" stop-color="#C3CAD3"/><stop offset="0.55" stop-color="#EEF1F4"/><stop offset="1" stop-color="#858E9A"/></linearGradient>
  <linearGradient id="metalV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A939F"/><stop offset="0.3" stop-color="#F3F5F8"/><stop offset="0.6" stop-color="#BAC2CC"/><stop offset="1" stop-color="#7A838F"/></linearGradient>
  <linearGradient id="dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A505A"/><stop offset="1" stop-color="#121418"/></linearGradient>
  <linearGradient id="darkV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16181C"/><stop offset="0.35" stop-color="#4C525C"/><stop offset="1" stop-color="#111316"/></linearGradient>
  <linearGradient id="orange" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB25C"/><stop offset="0.5" stop-color="#FF8200"/><stop offset="1" stop-color="#D96800"/></linearGradient>
  <linearGradient id="tint" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.a}"/><stop offset="0.5" stop-color="${T.b}"/><stop offset="1" stop-color="${T.c}"/></linearGradient>
  <linearGradient id="tintV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.c}"/><stop offset="0.35" stop-color="${T.a}"/><stop offset="1" stop-color="${T.c}"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="0.5" stop-color="#DDE6EF" stop-opacity="0.85"/><stop offset="1" stop-color="#9FB1C4" stop-opacity="0.9"/></linearGradient>
  <linearGradient id="red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF6B5E"/><stop offset="1" stop-color="#B3170E"/></linearGradient>
  <linearGradient id="rubber" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A3E45"/><stop offset="1" stop-color="#0E1013"/></linearGradient>
</defs>`;
}

const P = Math.PI;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const f = (n) => Math.round(n * 10) / 10;

function gearPath(cx, cy, rOut, rIn, teeth) {
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * 2 * P;
    const step = (2 * P) / teeth;
    const pts = [
      pt(cx, cy, rIn, a0),
      pt(cx, cy, rOut, a0 + step * 0.22),
      pt(cx, cy, rOut, a0 + step * 0.5),
      pt(cx, cy, rIn, a0 + step * 0.72),
    ];
    pts.forEach((p, j) => (d += (i === 0 && j === 0 ? "M" : "L") + f(p[0]) + " " + f(p[1]) + " "));
  }
  return d + "Z";
}

function ringOf(n, cx, cy, r, fn) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * P;
    const [x, y] = pt(cx, cy, r, a);
    s += fn(f(x), f(y), a, i);
  }
  return s;
}

/* ---------------- PART DRAWINGS (centered ~400,400) ---------------- */
const PARTS = {
  piston: () => `
    <ellipse cx="400" cy="235" rx="140" ry="40" fill="url(#metal)"/>
    <path d="M260 235 L260 520 Q260 560 300 560 L340 560 L340 600 L460 600 L460 560 L500 560 Q540 560 540 520 L540 235 Z" fill="url(#metalV)"/>
    <ellipse cx="400" cy="235" rx="140" ry="40" fill="url(#metal)" stroke="#9AA3AE" stroke-width="3"/>
    <ellipse cx="400" cy="232" rx="104" ry="26" fill="#D7DDE4"/>
    ${[268, 296, 324].map((y, i) => `<rect x="258" y="${y}" width="284" height="12" rx="4" fill="${i === 2 ? "url(#tint)" : "#5E6672"}"/>`).join("")}
    <circle cx="400" cy="440" r="56" fill="url(#dark)"/><circle cx="400" cy="440" r="34" fill="url(#metal)"/>
    <rect x="300" y="430" width="60" height="20" rx="6" fill="#A3ABB6"/><rect x="440" y="430" width="60" height="20" rx="6" fill="#A3ABB6"/>`,

  "gasket-kit": () => `
    <path d="M200 260 Q200 200 260 200 L540 200 Q600 200 600 260 L600 520 Q600 580 540 580 L260 580 Q200 580 200 520 Z" fill="url(#dark)"/>
    <circle cx="400" cy="390" r="120" fill="#EEF1F5"/><circle cx="400" cy="390" r="120" fill="none" stroke="url(#metal)" stroke-width="14"/>
    ${[[250, 250], [550, 250], [250, 530], [550, 530]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#EEF1F5" stroke="url(#metal)" stroke-width="6"/>`).join("")}
    <circle cx="640" cy="620" r="54" fill="none" stroke="url(#tint)" stroke-width="16"/>
    <circle cx="560" cy="650" r="34" fill="none" stroke="url(#orange)" stroke-width="12"/>
    <circle cx="180" cy="630" r="40" fill="none" stroke="#5E6672" stroke-width="12"/>`,

  "clutch-plates": () => `
    ${[0, 1, 2, 3].map((i) => `<g transform="translate(${-i * 34} ${-i * 34})">
      <path d="${gearPath(470, 470, 200, 186, 48)}" fill="${i % 2 ? "url(#metal)" : "url(#tint)"}" stroke="#6B7380" stroke-width="2"/>
      <circle cx="470" cy="470" r="150" fill="${i % 2 ? "#D5DBE2" : "url(#dark)"}"/>
      ${i % 2 ? "" : ringOf(16, 470, 470, 168, (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="#2A2E35"/>`)}
      <circle cx="470" cy="470" r="100" fill="#EEF1F5"/>
    </g>`).join("")}`,

  "brake-pads": () => `
    <g transform="rotate(-8 400 400)">
      <path d="M170 300 Q300 230 430 300 L430 420 Q300 360 170 420 Z" fill="url(#metal)" stroke="#7D8693" stroke-width="4"/>
      <path d="M190 330 Q300 280 410 330 L410 400 Q300 360 190 400 Z" fill="url(#dark)"/>
      <circle cx="205" cy="315" r="12" fill="#EEF1F5"/><circle cx="415" cy="315" r="12" fill="#EEF1F5"/>
    </g>
    <g transform="rotate(8 400 400) translate(200 190)">
      <path d="M170 300 Q300 230 430 300 L430 420 Q300 360 170 420 Z" fill="url(#metal)" stroke="#7D8693" stroke-width="4"/>
      <path d="M190 330 Q300 280 410 330 L410 400 Q300 360 190 400 Z" fill="url(#dark)"/>
      <rect x="280" y="292" width="40" height="16" rx="5" fill="url(#tint)"/>
    </g>
    <path d="M320 640 q40 -40 80 0 q40 40 80 0" fill="none" stroke="url(#orange)" stroke-width="12" stroke-linecap="round"/>`,

  "brake-disc": () => `
    <path d="${(() => { let d = ""; const n = 36; for (let i = 0; i <= n; i++) { const a = (i / n) * 2 * P; const r = i % 2 ? 236 : 222; const [x, y] = pt(400, 400, r, a); d += (i ? "L" : "M") + f(x) + " " + f(y) + " "; } return d + "Z"; })()}" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <circle cx="400" cy="400" r="196" fill="none" stroke="#C8CFD7" stroke-width="2"/>
    ${ringOf(30, 400, 400, 190, (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#5E6672"/>`)}
    ${ringOf(30, 400, 400, 160, (x, y, a, i) => (i % 2 ? `<circle cx="${x}" cy="${y}" r="7" fill="#5E6672"/>` : ""))}
    <circle cx="400" cy="400" r="128" fill="url(#tint)"/>
    ${ringOf(5, 400, 400, 118, (x, y, a) => { const [x2, y2] = pt(400, 400, 60, a); return `<path d="M${x} ${y} L${f(x2)} ${f(y2)}" stroke="#EEF1F5" stroke-width="22" stroke-linecap="round"/>`; })}
    <circle cx="400" cy="400" r="66" fill="url(#dark)"/><circle cx="400" cy="400" r="34" fill="#EEF1F5"/>
    ${ringOf(5, 400, 400, 50, (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="url(#metal)"/>`)}`,

  "brake-lever": () => `
    <path d="M190 520 Q180 470 230 460 L560 360 Q640 340 650 300 L668 310 Q660 380 580 410 L260 520 Q220 540 190 520 Z" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <path d="M250 470 L560 375" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
    <rect x="150" y="440" width="120" height="130" rx="34" fill="url(#dark)"/>
    <circle cx="210" cy="505" r="26" fill="url(#tint)"/><circle cx="210" cy="505" r="10" fill="#17191D"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${600 + i * 0}" y="0" width="0" height="0"/>`).join("")}
    <rect x="260" y="560" width="70" height="28" rx="10" fill="url(#orange)"/>`,

  "spark-plug": () => `
    <g transform="rotate(-30 400 400)">
      <rect x="378" y="110" width="44" height="60" rx="10" fill="url(#metalV)"/>
      <path d="M350 170 L450 170 L462 330 L338 330 Z" fill="#F7F7F5" stroke="#C9CDD2" stroke-width="3"/>
      ${[195, 225, 255, 285].map((y) => `<rect x="346" y="${y}" width="108" height="10" rx="5" fill="#DADDE1"/>`).join("")}
      <path d="M330 330 L470 330 L490 360 L470 420 L330 420 L310 360 Z" fill="url(#metalV)" stroke="#6B7380" stroke-width="3"/>
      <rect x="340" y="420" width="120" height="22" fill="url(#tint)"/>
      <rect x="352" y="442" width="96" height="170" fill="url(#metalV)"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M352 ${452 + i * 15} L448 ${460 + i * 15}" stroke="#7D8693" stroke-width="4"/>`).join("")}
      <path d="M400 612 L400 650 L438 650" fill="none" stroke="#9AA3AE" stroke-width="10" stroke-linecap="round"/>
    </g>`,

  cdi: () => `
    <rect x="230" y="240" width="340" height="280" rx="26" fill="url(#dark)"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${262 + i * 48}" y="260" width="22" height="240" rx="8" fill="#3B4048"/>`).join("")}
    <rect x="300" y="350" width="200" height="64" rx="12" fill="url(#tint)"/>
    <text x="400" y="393" text-anchor="middle" font-family="Arial" font-weight="700" font-size="30" fill="#17191D">CDI</text>
    <rect x="370" y="520" width="60" height="40" rx="8" fill="#2A2E35"/>
    <path d="M385 560 C380 640 300 640 260 690" fill="none" stroke="#FF8200" stroke-width="12" stroke-linecap="round"/>
    <path d="M400 560 C400 650 420 660 470 700" fill="none" stroke="#C0392B" stroke-width="12" stroke-linecap="round"/>
    <path d="M415 560 C430 620 540 630 590 680" fill="none" stroke="#17191D" stroke-width="12" stroke-linecap="round"/>`,

  "ignition-coil": () => `
    <rect x="280" y="210" width="180" height="300" rx="30" fill="url(#darkV)"/>
    ${[250, 290, 330, 370, 410, 450].map((y) => `<rect x="272" y="${y}" width="196" height="14" rx="7" fill="#3B4048"/>`).join("")}
    <rect x="310" y="510" width="120" height="44" rx="10" fill="url(#metalV)"/>
    <path d="M370 210 C370 120 520 120 560 220 L580 300" fill="none" stroke="url(#tint)" stroke-width="22" stroke-linecap="round"/>
    <rect x="555" y="290" width="54" height="120" rx="18" fill="url(#dark)"/>
    <rect x="566" y="400" width="32" height="40" rx="6" fill="url(#metalV)"/>`,

  battery: () => `
    <rect x="210" y="260" width="380" height="330" rx="22" fill="url(#dark)"/>
    <rect x="210" y="260" width="380" height="70" rx="22" fill="url(#tint)"/>
    <rect x="210" y="300" width="380" height="30" fill="url(#tint)"/>
    <rect x="260" y="220" width="56" height="44" rx="8" fill="#C0392B"/><rect x="484" y="220" width="56" height="44" rx="8" fill="#2A2E35" stroke="#7D8693" stroke-width="3"/>
    <text x="288" y="252" text-anchor="middle" font-family="Arial" font-weight="700" font-size="30" fill="#fff">+</text>
    <text x="512" y="252" text-anchor="middle" font-family="Arial" font-weight="700" font-size="30" fill="#fff">−</text>
    <text x="400" y="450" text-anchor="middle" font-family="Arial" font-weight="800" font-size="72" fill="#FFFFFF">12V</text>
    <rect x="300" y="480" width="200" height="12" rx="6" fill="#FF8200"/>
    <rect x="240" y="520" width="320" height="40" rx="8" fill="#20242A"/>`,

  "oil-bottle": () => `
    <path d="M280 300 Q280 250 330 240 L380 230 L380 190 L470 190 L470 230 Q520 240 520 300 L520 600 Q520 630 490 630 L310 630 Q280 630 280 600 Z" fill="url(#darkV)"/>
    <rect x="372" y="150" width="106" height="56" rx="10" fill="url(#tint)"/>
    ${[160, 172, 184, 196].map((y) => `<rect x="372" y="${y}" width="106" height="4" fill="#00000030"/>`).join("")}
    <rect x="280" y="340" width="240" height="210" fill="url(#tint)"/>
    <rect x="300" y="360" width="200" height="60" rx="6" fill="#17191D"/>
    <text x="400" y="402" text-anchor="middle" font-family="Arial" font-weight="800" font-size="34" fill="#FFFFFF">10W-40</text>
    <rect x="300" y="440" width="120" height="10" rx="5" fill="#17191D" opacity="0.6"/><rect x="300" y="462" width="160" height="10" rx="5" fill="#17191D" opacity="0.4"/>
    <text x="400" y="530" text-anchor="middle" font-family="Arial" font-weight="700" font-size="26" fill="#17191D">1L · 4T</text>
    <rect x="296" y="300" width="14" height="300" rx="7" fill="#FFFFFF" opacity="0.12"/>`,

  "oil-filter": () => `
    <rect x="270" y="240" width="260" height="320" rx="26" fill="url(#tintV)"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${282 + i * 21}" y="270" width="8" height="260" rx="4" fill="#00000022"/>`).join("")}
    <ellipse cx="400" cy="240" rx="130" ry="34" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <ellipse cx="400" cy="240" rx="54" ry="14" fill="#5E6672"/>
    <rect x="262" y="540" width="276" height="44" rx="12" fill="url(#metalV)"/>
    <rect x="310" y="370" width="180" height="60" rx="8" fill="#17191D"/>
    <text x="400" y="410" text-anchor="middle" font-family="Arial" font-weight="800" font-size="28" fill="#FF8200">FILTER</text>`,

  "air-filter": () => `
    <g transform="skewX(-12) translate(80 0)">
      <rect x="200" y="230" width="400" height="320" rx="24" fill="url(#tint)"/>
      <rect x="230" y="260" width="340" height="260" rx="10" fill="#F2EAD8"/>
      ${Array.from({ length: 15 }, (_, i) => `<path d="M${244 + i * 22} 262 L${244 + i * 22} 518" stroke="#D8C9A6" stroke-width="10"/>`).join("")}
    </g>`,

  "shock-absorber": () => `
    <g transform="rotate(-18 400 400)">
      <circle cx="400" cy="150" r="38" fill="url(#dark)"/><circle cx="400" cy="150" r="16" fill="#EEF1F5"/>
      <rect x="370" y="170" width="60" height="70" rx="10" fill="url(#darkV)"/>
      <rect x="384" y="230" width="32" height="220" fill="url(#metalV)"/>
      <rect x="350" y="420" width="100" height="200" rx="16" fill="url(#darkV)"/>
      <polyline points="${Array.from({ length: 15 }, (_, i) => `${i % 2 ? 452 : 348},${244 + i * 26}`).join(" ")}" fill="none" stroke="url(#tint)" stroke-width="22" stroke-linejoin="round"/>
      <rect x="338" y="236" width="124" height="18" rx="8" fill="url(#metalV)"/>
      <circle cx="400" cy="650" r="38" fill="url(#dark)"/><circle cx="400" cy="650" r="16" fill="#EEF1F5"/>
    </g>`,

  "front-fork": () => `
    ${[310, 490].map((x) => `
      <rect x="${x - 26}" y="120" width="52" height="34" rx="8" fill="url(#tint)"/>
      <rect x="${x - 22}" y="150" width="44" height="320" fill="url(#metalV)"/>
      <rect x="${x - 34}" y="440" width="68" height="230" rx="18" fill="url(#darkV)"/>
      <rect x="${x - 34}" y="500" width="68" height="12" fill="#FF8200"/>`).join("")}
    <rect x="250" y="200" width="300" height="34" rx="14" fill="url(#dark)"/>
    <rect x="250" y="300" width="300" height="30" rx="14" fill="url(#dark)"/>
    <circle cx="400" cy="660" r="20" fill="url(#metal)"/>`,

  tire: () => `
    <circle cx="400" cy="400" r="250" fill="url(#rubber)"/>
    ${ringOf(36, 400, 400, 232, (x, y, a) => `<rect x="${x - 10}" y="${y - 22}" width="20" height="44" rx="5" fill="#2B2F36" transform="rotate(${f((a * 180) / P + 90)} ${x} ${y})"/>`)}
    <circle cx="400" cy="400" r="190" fill="#1B1E23"/>
    <circle cx="400" cy="400" r="160" fill="url(#metal)"/>
    <circle cx="400" cy="400" r="150" fill="none" stroke="url(#tint)" stroke-width="8"/>
    ${ringOf(5, 400, 400, 120, (x, y, a) => { const [x2, y2] = pt(400, 400, 40, a + 0.4); return `<path d="M${x} ${y} Q${f((x + x2) / 2 + 12)} ${f((y + y2) / 2)} ${f(x2)} ${f(y2)}" stroke="#2A2E35" stroke-width="22" stroke-linecap="round" fill="none"/>`; })}
    <circle cx="400" cy="400" r="46" fill="url(#dark)"/><circle cx="400" cy="400" r="18" fill="#BCC4CE"/>`,

  chain: () => {
    let s = "";
    const n = 13;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = 150 + t * 500;
      const y = 400 + Math.sin(t * P * 1.4) * 120;
      const y2 = 400 + Math.sin(((i + 1) / (n - 1)) * P * 1.4) * 120;
      const ang = (Math.atan2(y2 - y, 500 / (n - 1)) * 180) / P;
      s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
        <rect x="-26" y="-26" width="52" height="52" rx="24" fill="${i % 2 ? "url(#metal)" : "url(#tint)"}" stroke="#5E6672" stroke-width="3"/>
        <circle cx="-12" cy="0" r="8" fill="#5E6672"/><circle cx="12" cy="0" r="8" fill="#5E6672"/></g>`;
    }
    return `<path d="M150 400 ${Array.from({ length: 30 }, (_, i) => { const t = i / 29; return `L${f(150 + t * 500)} ${f(400 + Math.sin(t * P * 1.4) * 120)}`; }).join(" ")}" stroke="#3B4048" stroke-width="20" fill="none"/>` + s;
  },

  sprocket: () => `
    <path d="${gearPath(400, 400, 250, 222, 42)}" fill="url(#tint)" stroke="#7D8693" stroke-width="2"/>
    <circle cx="400" cy="400" r="190" fill="none" stroke="#00000020" stroke-width="4"/>
    ${ringOf(6, 400, 400, 140, (x, y) => `<circle cx="${x}" cy="${y}" r="42" fill="#EEF1F5"/>`)}
    <circle cx="400" cy="400" r="80" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <circle cx="400" cy="400" r="40" fill="#EEF1F5"/>
    ${ringOf(4, 400, 400, 60, (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#5E6672"/>`)}`,

  "body-panel": () => `
    <path d="M150 520 Q160 330 330 260 L620 200 Q680 190 660 250 L600 400 Q560 500 440 540 L200 580 Q150 590 150 520 Z" fill="url(#tint)" stroke="#17191D" stroke-opacity="0.15" stroke-width="4"/>
    <path d="M220 470 Q300 360 470 320 L600 290" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.85"/>
    <path d="M240 520 Q340 430 520 400" fill="none" stroke="#17191D" stroke-width="22" stroke-linecap="round"/>
    <path d="M520 260 L600 245 L580 300 Z" fill="#17191D"/>
    <circle cx="260" cy="530" r="12" fill="url(#metal)"/><circle cx="540" cy="460" r="12" fill="url(#metal)"/>`,

  mirror: () => `
    <path d="M300 640 Q320 520 380 440 L400 452 Q350 530 336 646 Z" fill="url(#metalV)"/>
    <rect x="290" y="620" width="60" height="50" rx="12" fill="url(#dark)"/>
    <g transform="rotate(-14 470 330)">
      <ellipse cx="470" cy="330" rx="200" ry="120" fill="url(#dark)"/>
      <ellipse cx="470" cy="330" rx="178" ry="100" fill="url(#glass)"/>
      <path d="M340 290 Q420 250 520 260" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.8"/>
      <path d="M290 330 A200 120 0 0 1 340 245" stroke="url(#tint)" stroke-width="12" fill="none"/>
    </g>`,

  headlight: () => `
    <path d="M190 400 Q190 230 400 210 Q610 230 610 400 Q610 560 400 590 Q190 560 190 400 Z" fill="url(#dark)"/>
    <path d="M225 400 Q225 260 400 245 Q575 260 575 400 Q575 530 400 555 Q225 530 225 400 Z" fill="url(#glass)"/>
    <path d="M260 330 Q400 280 540 330" stroke="url(#tint)" stroke-width="16" stroke-linecap="round" fill="none"/>
    <circle cx="330" cy="430" r="62" fill="url(#metal)"/><circle cx="330" cy="430" r="34" fill="#FFFFFF"/>
    <circle cx="470" cy="430" r="62" fill="url(#metal)"/><circle cx="470" cy="430" r="34" fill="#FFFFFF"/>
    <path d="M270 300 Q330 270 400 268" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" fill="none"/>`,

  "tail-lamp": () => `
    <path d="M170 380 L560 280 Q640 270 640 340 L640 440 Q640 500 570 500 L200 470 Q150 460 170 380 Z" fill="url(#dark)"/>
    <path d="M210 395 L550 310 Q600 305 602 350 L602 430 Q600 465 560 465 L230 440 Q200 430 210 395 Z" fill="url(#red)"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${270 + i * 50}" y="${375 - i * 9}" width="30" height="${70 + i * 2}" rx="8" fill="#FF8A80" opacity="0.6"/>`).join("")}
    <rect x="610" y="360" width="70" height="40" rx="12" fill="url(#tint)"/>
    <rect x="130" y="420" width="70" height="40" rx="12" fill="url(#orange)"/>`,

  bulb: () => `
    <path d="M400 160 Q540 160 540 300 Q540 380 470 430 L460 480 L340 480 L330 430 Q260 380 260 300 Q260 160 400 160 Z" fill="url(#glass)" stroke="#BCC4CE" stroke-width="4"/>
    <path d="M370 420 L370 330 Q400 290 430 330 L430 420" fill="none" stroke="url(#tint)" stroke-width="8"/>
    <path d="M320 240 Q350 200 400 196" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" fill="none"/>
    <rect x="335" y="480" width="130" height="110" rx="8" fill="url(#metalV)"/>
    ${[505, 530, 555].map((y) => `<rect x="335" y="${y}" width="130" height="8" fill="#7D8693"/>`).join("")}
    <path d="M370 590 L430 590 L410 630 L390 630 Z" fill="url(#dark)"/>`,

  grips: () => `
    ${[[230, 260], [430, 440]].map(([x, y], k) => `<g transform="rotate(-20 ${x + 120} ${y + 60})">
      <rect x="${x}" y="${y}" width="250" height="110" rx="44" fill="url(#darkV)"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${x + 30 + i * 22}" y="${y + 10}" width="10" height="90" rx="5" fill="${k ? "url(#tint)" : "#3B4048"}"/>`).join("")}
      <rect x="${x + 230}" y="${y + 8}" width="40" height="94" rx="14" fill="url(#metalV)"/>
    </g>`).join("")}`,

  "phone-holder": () => `
    <rect x="290" y="150" width="220" height="380" rx="34" fill="url(#dark)"/>
    <rect x="306" y="170" width="188" height="340" rx="24" fill="url(#glass)"/>
    <path d="M270 210 L270 470" stroke="url(#tint)" stroke-width="26" stroke-linecap="round"/>
    <path d="M530 210 L530 470" stroke="url(#tint)" stroke-width="26" stroke-linecap="round"/>
    <rect x="370" y="530" width="60" height="90" fill="url(#metalV)"/>
    <rect x="300" y="610" width="200" height="56" rx="26" fill="url(#dark)"/>
    <circle cx="400" cy="638" r="14" fill="url(#metal)"/>`,

  cable: () => `
    <path d="M180 220 C420 120 640 260 520 380 C420 480 220 360 220 520 C220 640 480 660 640 580" fill="none" stroke="url(#dark)" stroke-width="26" stroke-linecap="round"/>
    <path d="M180 220 C420 120 640 260 520 380 C420 480 220 360 220 520 C220 640 480 660 640 580" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.25"/>
    <rect x="130" y="196" width="70" height="44" rx="10" fill="url(#metalV)" transform="rotate(-18 165 218)"/>
    <rect x="630" y="560" width="70" height="40" rx="10" fill="url(#metalV)" transform="rotate(-20 665 580)"/>
    <circle cx="112" cy="232" r="18" fill="url(#tint)"/><circle cx="712" cy="572" r="16" fill="url(#tint)"/>`,

  bearing: () => `
    <circle cx="400" cy="400" r="230" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <circle cx="400" cy="400" r="190" fill="url(#dark)"/>
    ${ringOf(11, 400, 400, 158, (x, y) => `<circle cx="${x}" cy="${y}" r="30" fill="url(#metal)" stroke="#5E6672" stroke-width="2"/>`)}
    <circle cx="400" cy="400" r="124" fill="url(#tint)"/>
    <circle cx="400" cy="400" r="88" fill="#EEF1F5"/>`,

  horn: () => `
    <circle cx="400" cy="400" r="210" fill="url(#dark)"/>
    <circle cx="400" cy="400" r="176" fill="url(#tint)"/>
    ${[150, 120, 90].map((r) => `<circle cx="400" cy="400" r="${r}" fill="none" stroke="#00000025" stroke-width="6"/>`).join("")}
    <circle cx="400" cy="400" r="54" fill="url(#metal)"/>
    <rect x="380" y="590" width="40" height="80" fill="url(#metalV)"/><rect x="330" y="650" width="140" height="28" rx="10" fill="url(#dark)"/>`,

  "seat-cover": () => `
    <path d="M150 420 Q150 320 280 300 L560 290 Q660 290 660 380 L650 460 Q640 520 560 520 L230 520 Q150 520 150 420 Z" fill="url(#dark)"/>
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${230 + i * 55} 310 L${222 + i * 55} 510" stroke="#3B4048" stroke-width="6"/>`).join("")}
    <path d="M160 440 Q400 470 650 440" stroke="url(#tint)" stroke-width="16" fill="none"/>
    <path d="M230 330 Q420 300 600 320" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.15"/>`,

  "bike-cover": () => `
    <path d="M140 560 Q160 360 330 300 Q420 220 540 260 Q680 300 680 560 Z" fill="url(#tint)"/>
    <path d="M200 520 Q260 380 400 340 Q540 320 620 520" fill="none" stroke="#FFFFFF" stroke-width="6" opacity="0.4"/>
    <ellipse cx="250" cy="560" rx="80" ry="22" fill="#17191D" opacity="0.6"/><ellipse cx="580" cy="560" rx="80" ry="22" fill="#17191D" opacity="0.6"/>
    <rect x="330" y="420" width="160" height="40" rx="8" fill="#17191D"/>
    <text x="410" y="448" text-anchor="middle" font-family="Arial" font-weight="800" font-size="22" fill="#FF8200">AZZAB</text>`,

  "engine-guard": () => `
    <path d="M200 260 Q200 600 400 620 Q600 600 600 260" fill="none" stroke="url(#tint)" stroke-width="42" stroke-linecap="round"/>
    <path d="M200 260 Q200 600 400 620 Q600 600 600 260" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.4"/>
    <path d="M260 420 L540 420" stroke="url(#dark)" stroke-width="26" stroke-linecap="round"/>
    ${[[200, 250], [600, 250]].map(([x, y]) => `<rect x="${x - 40}" y="${y - 30}" width="80" height="50" rx="12" fill="url(#dark)"/>`).join("")}`,

  charger: () => `
    <rect x="230" y="260" width="300" height="220" rx="30" fill="url(#dark)"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${260 + i * 50}" y="280" width="20" height="180" rx="8" fill="#3B4048"/>`).join("")}
    <rect x="300" y="340" width="160" height="60" rx="12" fill="url(#tint)"/>
    <circle cx="340" cy="370" r="10" fill="#17191D"/><rect x="362" y="362" width="80" height="16" rx="8" fill="#17191D"/>
    <path d="M530 370 C620 370 640 470 600 540 C570 600 620 640 680 620" fill="none" stroke="url(#dark)" stroke-width="20" stroke-linecap="round"/>
    <rect x="650" y="590" width="80" height="56" rx="14" fill="url(#tint)"/>
    <path d="M230 420 C150 450 160 560 230 600" fill="none" stroke="url(#dark)" stroke-width="18" stroke-linecap="round"/>
    <rect x="200" y="590" width="70" height="50" rx="10" fill="url(#metalV)"/>`,

  "brake-shoe": () => `
    <g transform="rotate(-10 400 400)">
      <path d="M200 420 A200 200 0 0 1 600 420 L560 420 A160 160 0 0 0 240 420 Z" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
      <path d="M222 400 A180 180 0 0 1 578 400 L548 400 A150 150 0 0 0 252 400 Z" fill="url(#dark)"/>
      <path d="M200 470 A200 200 0 0 0 600 470 L560 470 A160 160 0 0 1 240 470 Z" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
      <path d="M222 490 A180 180 0 0 0 578 490 L548 490 A150 150 0 0 1 252 490 Z" fill="url(#dark)"/>
      <path d="M250 440 q-40 0 -40 -20 M550 440 q40 0 40 -20" stroke="url(#tint)" stroke-width="14" fill="none" stroke-linecap="round"/>
      <rect x="370" y="425" width="60" height="30" rx="8" fill="url(#tint)"/>
    </g>`,
  "carburetor": () => `
    <rect x="300" y="250" width="200" height="200" rx="30" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <rect x="180" y="300" width="140" height="100" rx="16" fill="url(#metalV)"/>
    <rect x="480" y="300" width="140" height="100" rx="16" fill="url(#metalV)"/>
    <circle cx="400" cy="350" r="50" fill="url(#dark)"/><circle cx="400" cy="350" r="26" fill="#EEF1F5"/>
    <rect x="350" y="160" width="100" height="100" rx="14" fill="url(#tint)"/>
    <rect x="340" y="450" width="120" height="140" rx="20" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    <rect x="390" y="590" width="20" height="40" fill="#5E6672"/>`,
};

/* views: a = hero, b = close detail, c = packaged */
function partSVG(kind, tint, view) {
  if (view === "t") {
    // transparent cut-out for dark banners
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${defs(tint)}<ellipse cx="400" cy="700" rx="250" ry="30" fill="url(#shadow)"/><g>${PARTS[kind]()}</g></svg>`;
  }
  const body = PARTS[kind]();
  let inner;
  if (view === "a") inner = `<g>${body}</g>`;
  else if (view === "b") inner = `<g transform="translate(400 400) scale(1.32) rotate(-9) translate(-400 -420)">${body}</g>`;
  else
    inner = `
    <g transform="translate(40 60) scale(0.9)">
      <path d="M90 80 L420 80 L500 150 L500 560 L170 560 L90 490 Z" fill="#17191D"/>
      <path d="M90 80 L420 80 L500 150 L170 150 Z" fill="#2A2E35"/>
      <path d="M170 150 L500 150 L500 560 L170 560 Z" fill="#1E2126"/>
      <rect x="170" y="420" width="330" height="26" fill="#FF8200"/>
      <text x="335" y="510" text-anchor="middle" font-family="Arial" font-weight="800" font-size="40" fill="#E8ECF0" letter-spacing="6">AZZAB</text>
      <text x="335" y="540" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#FF8200" letter-spacing="10">MOTO PARTS</text>
    </g>
    <g transform="translate(330 300) scale(0.58)">${body}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${defs(tint)}
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="400" cy="380" r="360" fill="url(#glow)"/>
  <ellipse cx="400" cy="700" rx="270" ry="34" fill="url(#shadow)"/>
  ${inner}
</svg>`;
}

let count = 0;
for (const kind of Object.keys(PARTS)) {
  for (const tint of Object.keys(TINTS)) {
    for (const view of ["a", "b", "c", "t"]) {
      fs.writeFileSync(path.join(OUT_PARTS, `${kind}-${tint}-${view}.svg`), partSVG(kind, tint, view));
      count++;
    }
  }
}

/* ---------------- MOTORCYCLES (side profile, facing right) ---------------- */
function wheel(cx, cy, r, accent, style) {
  const spokes =
    style === "wire"
      ? ringOf(18, cx, cy, r * 0.66, (x, y) => `<path d="M${cx} ${cy} L${x} ${y}" stroke="#AEB6C0" stroke-width="2.5"/>`)
      : ringOf(style === "scooter" ? 6 : 5, cx, cy, r * 0.62, (x, y, a) => {
          const [x2, y2] = pt(cx, cy, r * 0.18, a + 0.35);
          return `<path d="M${x} ${y} L${f(x2)} ${f(y2)}" stroke="${accent}" stroke-width="${f(r * 0.1)}" stroke-linecap="round"/>`;
        });
  return `<g class="wheel">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#rubber)"/>
    <circle cx="${cx}" cy="${cy}" r="${f(r * 0.76)}" fill="#22262C"/>
    <circle cx="${cx}" cy="${cy}" r="${f(r * 0.7)}" fill="none" stroke="url(#metal)" stroke-width="${f(r * 0.07)}"/>
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="${f(r * 0.6)}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="${f(r * 0.2)}" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="${f(r * 0.08)}" fill="#17191D"/>
  </g>`;
}

function disc(cx, cy, r) {
  return `<g class="wheel"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#metal)" opacity="0.95"/>${ringOf(10, cx, cy, r * 0.75, (x, y) => `<circle cx="${x}" cy="${y}" r="${f(r * 0.08)}" fill="#7D8693"/>`)}<circle cx="${cx}" cy="${cy}" r="${f(r * 0.35)}" fill="#5E6672"/></g>`;
}

const BIKE_BODY = {
  naked: (c, c2) => `
    ${wheel(300, 520, 112, c, "alloy")}${disc(300, 520, 52)}
    <path d="M300 520 L520 470 L540 500 L320 545 Z" fill="url(#dark)"/>
    <path d="M330 512 L520 470" stroke="${c2}" stroke-width="6"/>
    ${wheel(900, 520, 112, c, "alloy")}${disc(900, 520, 62)}
    <path d="M900 520 L815 245" stroke="url(#metalV)" stroke-width="26" stroke-linecap="round"/>
    <path d="M900 520 L850 360" stroke="${c}" stroke-width="30" stroke-linecap="round"/>
    <path d="M840 470 Q900 430 960 470" fill="none" stroke="url(#dark)" stroke-width="16" stroke-linecap="round"/>
    <path d="M500 330 L800 260 L760 420 L560 470 Z" fill="none" stroke="url(#metalV)" stroke-width="14" stroke-linejoin="round"/>
    <path d="M560 330 L700 420 M640 312 L760 420" stroke="url(#metalV)" stroke-width="10"/>
    <path d="M520 360 L720 350 L740 480 L560 500 Q520 470 520 420 Z" fill="url(#darkV)"/>
    ${[380, 400, 420, 440].map((y) => `<rect x="540" y="${y}" width="180" height="7" rx="3" fill="#3B4048"/>`).join("")}
    <circle cx="620" cy="460" r="34" fill="url(#metal)"/><circle cx="620" cy="460" r="14" fill="${c2}"/>
    <path d="M560 500 Q480 560 420 540 L330 500 Q300 490 320 470 L420 470" fill="none" stroke="url(#metalV)" stroke-width="18" stroke-linecap="round"/>
    <path d="M300 470 L330 420 L420 440 L430 480 Z" fill="url(#dark)"/>
    <path d="M380 455 L180 420 Q160 418 165 400 L190 370 Q300 350 400 370 Z" fill="url(#body)"/>
    <path d="M200 360 L400 340 L470 330 L520 345 L420 385 L220 385 Z" fill="url(#dark)"/>
    <path d="M560 300 Q620 230 760 240 L810 275 Q760 360 620 370 L540 360 Z" fill="url(#body)"/>
    <path d="M590 300 Q660 255 760 262" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
    <path d="M610 340 L760 300" stroke="${c2}" stroke-width="10" stroke-linecap="round"/>
    <path d="M800 270 L850 210 Q900 230 885 300 L830 320 Z" fill="url(#body)"/>
    <path d="M845 235 Q880 240 878 285" stroke="url(#glass)" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M760 205 L860 195" stroke="url(#dark)" stroke-width="12" stroke-linecap="round"/>
    <path d="M780 200 L790 230" stroke="url(#metalV)" stroke-width="8"/>
    <circle cx="190" cy="390" r="8" fill="#FF3B30"/>`,

  retro: (c, c2) => `
    ${wheel(300, 520, 112, c2, "alloy")}${disc(300, 520, 46)}
    <path d="M300 520 L520 470 L540 500 L320 545 Z" fill="url(#dark)"/>
    ${wheel(900, 520, 112, c2, "alloy")}${disc(900, 520, 62)}
    <path d="M900 520 L800 250" stroke="url(#darkV)" stroke-width="30" stroke-linecap="round"/>
    <path d="M900 520 L860 410" stroke="#C9A227" stroke-width="30" stroke-linecap="round"/>
    <path d="M840 470 Q900 430 960 470" fill="none" stroke="url(#body)" stroke-width="18" stroke-linecap="round"/>
    <path d="M520 370 L720 360 L740 490 L560 500 Q520 470 520 420 Z" fill="url(#darkV)"/>
    ${[390, 410, 430, 450].map((y) => `<rect x="540" y="${y}" width="180" height="7" rx="3" fill="#3B4048"/>`).join("")}
    <path d="M540 500 Q520 560 420 560 L240 540" fill="none" stroke="url(#metalV)" stroke-width="22" stroke-linecap="round"/>
    <path d="M250 520 L180 525" stroke="url(#dark)" stroke-width="26" stroke-linecap="round"/>
    <path d="M200 360 Q190 330 240 325 L520 330 L520 368 L230 380 Q200 380 200 360 Z" fill="url(#dark)"/>
    <path d="M330 380 L320 430 L430 450 L440 380 Z" fill="url(#body)"/>
    <path d="M220 395 Q200 420 250 440" fill="none" stroke="url(#body)" stroke-width="20" stroke-linecap="round"/>
    <path d="M520 320 Q560 240 680 238 Q790 236 800 290 Q790 360 680 360 L540 362 Z" fill="url(#body)"/>
    <path d="M560 300 Q610 258 720 258" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
    <rect x="610" y="300" width="120" height="28" rx="14" fill="${c2}"/>
    <circle cx="845" cy="270" r="44" fill="url(#dark)"/><circle cx="845" cy="270" r="32" fill="url(#glass)"/><circle cx="845" cy="270" r="14" fill="#FFF7D6"/>
    <path d="M760 215 Q800 200 860 210" stroke="url(#metalV)" stroke-width="12" stroke-linecap="round" fill="none"/>`,

  commuter: (c, c2) => `
    ${wheel(300, 525, 104, c2, "wire")}
    <path d="M300 525 L520 485 L530 505 L310 548 Z" fill="url(#dark)"/>
    <rect x="320" y="485" width="210" height="34" rx="12" fill="url(#body)" transform="rotate(-10 420 500)"/>
    ${wheel(890, 525, 104, c2, "wire")}
    <path d="M890 525 L805 260" stroke="url(#metalV)" stroke-width="20" stroke-linecap="round"/>
    <path d="M890 525 L850 400" stroke="url(#darkV)" stroke-width="24" stroke-linecap="round"/>
    <path d="M830 470 Q890 425 950 470" fill="none" stroke="url(#body)" stroke-width="16" stroke-linecap="round"/>
    <path d="M540 380 L700 370 L715 480 L560 495 Q535 470 535 430 Z" fill="url(#metal)" stroke="#7D8693" stroke-width="3"/>
    ${[400, 420, 440].map((y) => `<rect x="555" y="${y}" width="140" height="6" rx="3" fill="#9AA3AE"/>`).join("")}
    <path d="M560 495 Q520 540 430 545 L220 520" fill="none" stroke="url(#metalV)" stroke-width="18" stroke-linecap="round"/>
    <path d="M250 520 L190 518" stroke="url(#dark)" stroke-width="22" stroke-linecap="round"/>
    <path d="M200 370 L540 350 L560 380 L230 395 Q195 395 200 370 Z" fill="url(#dark)"/>
    <path d="M200 400 L340 395 L360 440 L230 440 Z" fill="url(#body)"/>
    <rect x="186" y="380" width="20" height="18" rx="4" fill="#FF3B30"/>
    <path d="M540 350 Q580 280 690 280 L780 300 Q770 360 690 370 L555 378 Z" fill="url(#body)"/>
    <path d="M580 318 Q630 296 720 296" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.5"/>
    <path d="M620 345 L740 330" stroke="${c2}" stroke-width="8" stroke-linecap="round"/>
    <path d="M790 280 L840 260 Q870 290 850 330 L800 330 Z" fill="url(#body)"/>
    <circle cx="845" cy="300" r="22" fill="url(#glass)"/>
    <path d="M760 240 Q800 230 850 240" stroke="url(#metalV)" stroke-width="10" stroke-linecap="round" fill="none"/>`,

  scooter: (c, c2) => `
    ${wheel(320, 545, 84, c2, "scooter")}
    ${wheel(870, 545, 84, c2, "scooter")}${disc(870, 545, 44)}
    <path d="M870 545 L820 300" stroke="url(#metalV)" stroke-width="22" stroke-linecap="round"/>
    <path d="M820 470 Q870 430 930 470" fill="none" stroke="url(#body)" stroke-width="18" stroke-linecap="round"/>
    <path d="M240 470 Q220 380 300 350 L560 330 Q600 330 610 360 L640 460 L780 460 L780 300 Q790 200 840 190 L860 200 Q870 280 860 380 Q850 470 800 500 L560 500 Q480 520 420 520 L300 520 Q250 515 240 470 Z" fill="url(#body)"/>
    <path d="M270 400 Q300 365 400 360 L540 350" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
    <path d="M300 440 L560 420" stroke="${c2}" stroke-width="10" stroke-linecap="round"/>
    <path d="M610 470 L790 470" stroke="url(#dark)" stroke-width="14" stroke-linecap="round"/>
    <path d="M300 340 Q290 300 340 295 L560 290 Q600 292 600 325 L590 340 Z" fill="url(#dark)"/>
    <path d="M330 520 L520 520 L500 560 L360 560 Z" fill="url(#darkV)"/>
    <path d="M500 540 Q460 590 360 585" fill="none" stroke="url(#metalV)" stroke-width="16" stroke-linecap="round"/>
    <path d="M845 210 L880 230 Q880 270 850 280 Z" fill="url(#glass)"/>
    <path d="M780 170 Q830 150 880 165" stroke="url(#dark)" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path d="M250 430 L232 440" stroke="#FF3B30" stroke-width="12" stroke-linecap="round"/>`,

  faired: (c, c2) => `
    ${wheel(300, 520, 112, c2, "alloy")}${disc(300, 520, 52)}
    <path d="M300 520 L520 470 L540 500 L320 545 Z" fill="url(#dark)"/>
    ${wheel(900, 520, 112, c2, "alloy")}${disc(900, 520, 66)}
    <path d="M900 520 L830 270" stroke="url(#tint)" stroke-width="28" stroke-linecap="round"/>
    <path d="M840 470 Q900 430 960 470" fill="none" stroke="url(#body)" stroke-width="16" stroke-linecap="round"/>
    <path d="M520 360 L720 350 L740 480 L560 500 Q520 470 520 420 Z" fill="url(#darkV)"/>
    <path d="M560 500 Q480 560 420 540 L330 500" fill="none" stroke="url(#metalV)" stroke-width="18" stroke-linecap="round"/>
    <path d="M300 470 L330 420 L420 440 L430 480 Z" fill="url(#dark)"/>
    <path d="M400 420 L190 380 Q170 376 178 360 L210 335 Q320 320 430 340 Z" fill="url(#body)"/>
    <path d="M230 340 L420 318 L500 316 L520 335 L430 360 L240 362 Z" fill="url(#dark)"/>
    <path d="M520 330 Q560 260 700 250 L820 230 Q900 230 905 300 L880 420 Q860 480 760 490 L620 500 Q560 470 560 420 Z" fill="url(#body)"/>
    <path d="M600 330 Q700 290 830 280" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
    <path d="M630 430 L840 380" stroke="${c2}" stroke-width="12" stroke-linecap="round"/>
    <path d="M630 460 L800 425" stroke="#17191D" stroke-width="10" stroke-linecap="round"/>
    <path d="M820 230 L860 175 Q890 200 900 260 Z" fill="url(#glass)"/>
    <path d="M880 300 L905 300" stroke="#FFF7D6" stroke-width="12" stroke-linecap="round"/>
    <circle cx="190" cy="368" r="8" fill="#FF3B30"/>`,

  adventure: (c, c2) => `
    ${wheel(300, 515, 116, c2, "wire")}${disc(300, 515, 50)}
    <path d="M300 515 L520 460 L540 490 L320 540 Z" fill="url(#dark)"/>
    ${wheel(920, 515, 122, c2, "wire")}${disc(920, 515, 60)}
    <path d="M920 515 L810 210" stroke="url(#metalV)" stroke-width="28" stroke-linecap="round"/>
    <path d="M920 515 L870 380" stroke="url(#tint)" stroke-width="32" stroke-linecap="round"/>
    <path d="M860 400 Q920 360 990 400" fill="none" stroke="url(#body)" stroke-width="18" stroke-linecap="round"/>
    <path d="M520 350 L720 340 L740 470 L560 490 Q520 460 520 410 Z" fill="url(#darkV)"/>
    <path d="M540 500 Q460 540 380 430 L330 330" fill="none" stroke="url(#metalV)" stroke-width="18" stroke-linecap="round"/>
    <path d="M200 330 L470 300 L520 320 L440 350 L220 360 Z" fill="url(#dark)"/>
    <path d="M190 320 L330 305 L320 360 L210 380 Z" fill="url(#body)"/>
    <rect x="200" y="280" width="140" height="22" rx="6" fill="url(#metalV)"/>
    <path d="M520 320 Q560 240 700 230 L800 230 Q830 300 760 380 L600 400 L540 380 Z" fill="url(#body)"/>
    <path d="M560 300 Q640 260 760 255" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.5"/>
    <path d="M600 360 L760 330" stroke="${c2}" stroke-width="12" stroke-linecap="round"/>
    <path d="M790 240 L840 130 L880 140 L860 260 Z" fill="url(#glass)"/>
    <path d="M800 250 L860 240 L880 300 L820 320 Z" fill="url(#body)"/>
    <circle cx="858" cy="280" r="16" fill="#FFF7D6"/>
    <path d="M740 200 L840 190" stroke="url(#dark)" stroke-width="12" stroke-linecap="round"/>`,

  tuktuk: (c, c2) => `
    ${wheel(330, 560, 78, c2, "scooter")}
    ${wheel(900, 560, 78, c2, "scooter")}
    <path d="M220 520 L220 300 Q220 250 270 240 L700 220 Q760 220 770 270 L790 520 Z" fill="url(#body)"/>
    <path d="M200 225 Q200 160 280 150 L760 140 Q840 140 850 200 L860 240 L210 255 Z" fill="url(#dark)"/>
    <path d="M200 225 L860 215" stroke="${c2}" stroke-width="10"/>
    <path d="M250 290 L470 282 L470 430 L250 440 Z" fill="url(#glass)" opacity="0.85"/>
    <path d="M500 280 L700 270 L715 420 L500 428 Z" fill="url(#glass)" opacity="0.85"/>
    <path d="M770 260 L880 300 Q930 330 930 400 L930 500 L790 520 Z" fill="url(#body)"/>
    <path d="M800 280 L880 312 L890 410 L810 410 Z" fill="url(#glass)"/>
    <circle cx="930" cy="440" r="20" fill="#FFF7D6"/>
    <path d="M230 470 L780 455" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.4"/>
    <path d="M230 505 L790 495" stroke="${c2}" stroke-width="12" stroke-linecap="round"/>
    <rect x="200" y="500" width="40" height="40" rx="6" fill="#FF3B30"/>
    <path d="M640 520 Q620 590 520 590" fill="none" stroke="url(#metalV)" stroke-width="14" stroke-linecap="round"/>`,

  moped: (c, c2) => `
    ${wheel(320, 530, 96, c2, "wire")}
    ${wheel(860, 530, 96, c2, "wire")}
    <path d="M860 530 L800 270" stroke="url(#metalV)" stroke-width="18" stroke-linecap="round"/>
    <path d="M800 470 Q860 425 920 470" fill="none" stroke="url(#body)" stroke-width="14" stroke-linecap="round"/>
    <path d="M790 280 Q700 360 640 470 L470 480" fill="none" stroke="url(#body)" stroke-width="44" stroke-linecap="round"/>
    <path d="M450 420 L600 410 L600 500 L460 505 Z" fill="url(#darkV)"/>
    <circle cx="530" cy="470" r="24" fill="url(#metal)"/>
    <path d="M320 530 L470 480" stroke="url(#dark)" stroke-width="18"/>
    <path d="M230 380 L430 372 L440 405 L250 412 Q225 405 230 380 Z" fill="url(#dark)"/>
    <path d="M300 410 L440 400 L470 470 L330 480 Z" fill="url(#body)"/>
    <path d="M190 345 L330 345" stroke="url(#metalV)" stroke-width="10" stroke-linecap="round"/>
    <path d="M200 345 L210 410 M320 345 L310 405" stroke="url(#metalV)" stroke-width="8"/>
    <path d="M460 500 Q420 560 300 560" fill="none" stroke="url(#metalV)" stroke-width="14" stroke-linecap="round"/>
    <path d="M770 280 L830 260 Q850 290 830 320 L780 320 Z" fill="url(#body)"/>
    <circle cx="830" cy="290" r="18" fill="url(#glass)"/>
    <path d="M740 235 Q790 225 840 235" stroke="url(#metalV)" stroke-width="10" stroke-linecap="round" fill="none"/>`,
};

const BIKES = [
  ["apache-rtr-160", "naked", "#E8ECF0", "#FF8200"],
  ["apache-rtr-160-4v", "naked", "#B3171D", "#E8ECF0"],
  ["apache-rtr-180", "naked", "#2A2E35", "#FF8200"],
  ["apache-rtr-200-4v", "naked", "#FF8200", "#17191D"],
  ["apache-rtr-310", "naked", "#5A2E8C", "#FF8200"],
  ["apache-rr-310", "faired", "#C8102E", "#17191D"],
  ["apache-rtx", "adventure", "#3A5B3E", "#FF8200"],
  ["ronin-225", "retro", "#3E4A3D", "#FF8200"],
  ["raider-125", "commuter", "#FF8200", "#17191D"],
  ["star-hlx-150", "commuter", "#17191D", "#FF8200"],
  ["star-hlx-125", "commuter", "#B3171D", "#E8ECF0"],
  ["sport", "commuter", "#2C4B7A", "#FF8200"],
  ["radeon", "commuter", "#5B3A29", "#D9B26B"],
  ["star-city-plus", "commuter", "#8C1D1D", "#E8ECF0"],
  ["ntorq-125", "scooter", "#FF8200", "#17191D"],
  ["ntorq-150", "scooter", "#17191D", "#FFD400"],
  ["jupiter-110", "scooter", "#9AA7B5", "#FF8200"],
  ["jupiter-125", "scooter", "#6B2737", "#E8ECF0"],
  ["zest-110", "scooter", "#2BA8A0", "#17191D"],
  ["iqube", "scooter", "#EDEFF2", "#1E88E5"],
  ["orbiter", "scooter", "#1E88E5", "#E8ECF0"],
  ["tvs-x", "faired", "#2A2E35", "#00BFA6"],
  ["xl100", "moped", "#2A5E8C", "#FF8200"],
  ["king-deluxe", "tuktuk", "#1F6F3A", "#FFC400"],
  ["king-deluxe-plus", "tuktuk", "#E8B400", "#17191D"],
];

function bikeSVG(type, color, accent, plainBg) {
  const shade = color;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">${defs("orange")}
  <defs><linearGradient id="body" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/><stop offset="0.25" stop-color="${shade}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs>
  <defs><linearGradient id="bodyshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></linearGradient></defs>
  ${plainBg ? "" : `<rect width="1200" height="760" fill="url(#bg)"/><circle cx="600" cy="360" r="430" fill="url(#glow)"/>`}
  <ellipse cx="600" cy="652" rx="440" ry="30" fill="url(#shadow)"/>
  <g transform="translate(0 0)">${BIKE_BODY[type](color, accent)}</g>
</svg>`;
}

/* Model name plates (typographic, no drawings) — used until a real photo exists */
const OUT_MODELS = path.join(__dirname, "..", "assets", "img", "models");
fs.mkdirSync(OUT_MODELS, { recursive: true });
const PLATES = [
  ["apache-rtr-160", "APACHE", "RTR 160", "160 cc"], ["apache-rtr-160-4v", "APACHE", "RTR 160 4V", "160 cc"], ["apache-rtr-180", "APACHE", "RTR 180", "177 cc"],
  ["apache-rtr-200-4v", "APACHE", "RTR 200 4V", "198 cc"], ["apache-rtr-310", "APACHE", "RTR 310", "312 cc"], ["apache-rr-310", "APACHE", "RR 310", "312 cc"],
  ["apache-rtx", "APACHE", "RTX", "299 cc"], ["ronin-225", "RONIN", "225", "225 cc"], ["raider-125", "RAIDER", "125", "125 cc"],
  ["star-hlx-150", "STAR HLX", "150", "150 cc"], ["star-hlx-125", "STAR HLX", "125", "125 cc"], ["sport", "SPORT", "110", "110 cc"],
  ["radeon", "RADEON", "110", "110 cc"], ["star-city-plus", "STAR CITY+", "110", "110 cc"], ["ntorq-125", "NTORQ", "125", "125 cc"],
  ["ntorq-150", "NTORQ", "150", "150 cc"], ["jupiter-110", "JUPITER", "110", "113 cc"], ["jupiter-125", "JUPITER", "125", "124 cc"],
  ["zest-110", "ZEST", "110", "110 cc"], ["iqube", "iQUBE", "ELECTRIC", "EV"], ["orbiter", "ORBITER", "ELECTRIC", "EV"],
  ["tvs-x", "TVS X", "ELECTRIC", "EV"], ["xl100", "XL", "100", "100 cc"], ["king-deluxe", "KING", "DELUXE", "199 cc"], ["king-deluxe-plus", "KING", "DELUXE PLUS", "199 cc"],
];
for (const [slug, l1, l2, cc] of PLATES) {
  const size1 = l1.length > 8 ? 120 : 150;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4E9EF"/></linearGradient>
  <linearGradient id="o" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB25C"/><stop offset="1" stop-color="#FF8200"/></linearGradient></defs>
  <rect width="1200" height="760" fill="url(#g)"/>
  <text x="600" y="560" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="420" fill="none" stroke="#17191D" stroke-opacity="0.05" stroke-width="3">TVS</text>
  <path d="M0 760 L0 610 L380 760 Z" fill="url(#o)"/><path d="M0 590 L0 560 L500 760 L425 760 Z" fill="#FF8200" opacity="0.35"/>
  <rect x="90" y="150" width="120" height="44" rx="10" fill="#17191D"/><text x="150" y="181" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="24" fill="#FF8200" letter-spacing="4">TVS</text>
  <text x="90" y="${300 + (size1 - 120) / 2}" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="${size1}" fill="#17191D" letter-spacing="2">${l1}</text>
  <text x="94" y="${300 + size1 * 0.95}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="84" fill="#FF8200" letter-spacing="3">${l2}</text>
  <text x="1110" y="690" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="#68707C" letter-spacing="2">${cc}</text>
</svg>`;
  fs.writeFileSync(path.join(OUT_MODELS, `${slug}.svg`), svg);
  count++;
}
console.log(`Generated ${count} SVG files.`);

