# GitHub Profile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `cybr2/cybr2`'s profile README as a hand-crafted, adaptive (light/dark) extension of christian-portfolio-one-phi.vercel.app — bunker-dark palette, editorial type, 7 split-card case studies, SVG skills matrix, themed stat widgets.

**Architecture:** Static assets only. Hand-authored SVGs live in `assets/svg/` as `-light.svg`/`-dark.svg` pairs swapped at render time via `<picture>` + `prefers-color-scheme`. Screenshots are downloaded, downscaled, base64-embedded into the SVGs (GitHub blocks external refs inside SVG images). README composes everything with markdown tables.

**Tech Stack:** Markdown, hand-authored SVG 1.1, Node script using `sharp` (borrowed from sibling portfolio repo) for image optimization, PowerShell for validation/embedding.

**Spec:** `docs/superpowers/specs/2026-08-26-github-profile-redesign-design.md`

## Global Constraints

- Working repo: `C:\coding\cybr2` (branch `main`). All paths below are relative to it.
- Colors (verbatim): canvas dark `#05070A`; surface dark `#0D1117`; border dark `#30363D` / `rgba(255,255,255,0.14)`; heading dark `#FFFFFF`; body dark `#8B9BB0`; muted label dark `#4B5E74`; chip text dark `#C9D4E0`; accent cyan dark `#22D3EE`; status green dark `#3ECF8E`; status amber dark `#FEBC2E`. Light equivalents: canvas `#F9FAFB`, surface `#FFFFFF`, border `rgba(17,24,39,0.15)`, heading `#111827`, body `#4B5E74`, muted `#6B7280`, chip text `#111827`, cyan `#0891B2`, green `#059669`, amber `#D97706`.
- Font stacks (exact strings): headings `font-family="Poppins,'Segoe UI',system-ui,sans-serif"` weight 700 tight letter-spacing (-0.02em); body `font-family="'Inter','Segoe UI',system-ui,sans-serif"`. Never convert text to paths.
- Radii: outer cards 24; inner tiles 12; pills rx=half-height. Dark canvases get 44px-pitch grid lines `stroke="#FFFFFF" stroke-opacity="0.03"`; light canvases `stroke="#111827" stroke-opacity="0.03"`.
- Every SVG: `viewBox` width 1480 (2× logical 740px GitHub column), valid XML, no external refs, no CSS imports, no `<style>` relying on external fonts.
- Case studies base URL: `https://christian-portfolio-one-phi.vercel.app`
- File-size target: ≤250KB per finished SVG (post-embed).
- Commit style: short lowercase imperative, matching repo history (`git commit -m "add banner svg assets"`).
- Do NOT push unless the user explicitly asks.

---

### Task 1: Screenshot pipeline

**Files:**
- Create: `scripts/optimize-images.mjs`
- Create: `assets/img/src/` (downloaded originals, committed for reference)
- Create: `assets/img/*.webp` (optimized, consumed by Tasks 5–6)

**Interfaces:**
- Produces: `assets/img/xietech.webp`, `cascade.webp`, `kindred.webp`, `milktea.webp`, `pahina.webp`, `attendance.webp`, `pursuit.webp` — all ≤800px wide, ≤150KB. Later tasks embed these as base64.

- [ ] **Step 1: Download source screenshots**

```powershell
$base = "https://punsuklvjfxilnoipdfw.supabase.co/storage/v1/object/public/portfolio-media"
$map = @{
  "xietech-img.webp"          = "xietech-src.webp"
  "envision-1.png"            = "cascade-src.png"
  "kindred-visits-img-1.webp" = "kindred-src.webp"
  "milktea-pos-img.webp"      = "milktea-src.webp"
  "pahina-img-1.webp"         = "pahina-src.webp"
  "automation-img-1.webp"     = "attendance-src.webp"
  "icon-1.png"                = "pursuit-src.png"
}
New-Item -ItemType Directory -Force -Path "assets\img\src" | Out-Null
foreach ($k in $map.Keys) {
  Invoke-WebRequest -Uri "$base/$k" -OutFile "assets\img\src\$($map[$k])"
}
Get-ChildItem assets\img\src | Select-Object Name, Length
```

Expected: 7 files listed, each >10KB.

- [ ] **Step 2: Write the optimization script**

Create `scripts/optimize-images.mjs`:

```js
import { createRequire } from "node:module";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  // Fall back to the sibling portfolio repo's install
  sharp = require("C:/coding/personal/portfolio/node_modules/sharp");
}

const SRC = "assets/img/src";
const OUT = "assets/img";
const files = readdirSync(SRC);

for (const f of files) {
  const name = f.replace(/-src\.(webp|png)$/, ".webp");
  const img = sharp(join(SRC, f));
  const meta = await img.metadata();
  let pipeline = img.rotate().resize({
    width: Math.min(meta.width, 800),
    withoutEnlargement: true,
  });
  if (f.endsWith(".png")) {
    pipeline = pipeline.flatten({ background: "#120E2E" }); // pursuit logo transparency -> purple-tinted surface
  }
  const info = await pipeline.webp({ quality: 72 }).toFile(join(OUT, name));
  console.log(`${name}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
}

const oversized = [];
for (const f of readdirSync(OUT)) {
  if (!f.endsWith(".webp")) continue;
  if (statSync(join(OUT, f)).size > 150 * 1024) oversized.push(f);
}
if (oversized.length) {
  console.error("OVERSIZE:", oversized.join(", "));
  process.exit(1);
}
console.log("OK: all optimized images <=150KB");
```

- [ ] **Step 3: Run the script**

Run: `node scripts/optimize-images.mjs` (from repo root)
Expected: 7 lines of `name.webp: WxH, NKB` where W≤800 and N≤150, then `OK`.

If sharp cannot resolve anywhere, run `npm install --no-save --prefix "$env:TEMP\sharp-tmp" sharp` and add `require("$env:TEMP\sharp-tmp/node_modules/sharp")` as another fallback branch before giving up.

- [ ] **Step 4: Verify outputs**

```powershell
Get-ChildItem assets\img\*.webp | Select-Object Name, Length
```
Expected: exactly 7 `.webp` files matching the names in Interfaces.

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-images.mjs assets/img
git commit -m "add optimized project screenshots"
```

---

### Task 2: Banner SVGs

**Files:**
- Create: `assets/svg/banner-dark.svg`
- Create: `assets/svg/banner-light.svg`

**Interfaces:**
- Produces: banner pair referenced by Task 7's README as `assets/svg/banner-light.svg` (default) + `assets/svg/banner-dark.svg` (prefers-color-scheme dark).

Geometry (both variants identical except token values):
- `viewBox="0 0 1480 400"`, `width="1480" height="400"`
- Background rect fill=canvas, rx=24
- Grid: two `<pattern>`-free groups of lines — verticals every 44px starting x=22, horizontals every 44px starting y=22, stroke per Global Constraints opacity 0.03
- Eyebrow text at x=64 y=96: `CYBR / GITHUB`, body stack, font-size 20, letter-spacing 4.4, fill=muted
- Name at x=64 y=196: `Christian Ramirez`, heading stack, font-weight 700, font-size 76, letter-spacing -1.5, fill=heading
- Subtitle at x=64 y=248: `Full-Stack Software Engineer`, body stack, font-size 29, fill=body
- Chip rail baseline row at y=300..344: four rounded rects (rx=17, height 34, fill=surface, stroke=border 1px), each with centered body-stack text font-size 18 fill=chip-text:
  1. `📍 Bulacan, PH`
  2. `⚡ 2+ yrs`
  3. `React · Next.js · Spring Boot`
  4. `● Open to work` — text fill=status green; rect stroke uses green at 35% opacity (`stroke-opacity="0.35"`)
- Chip x positions: 64, 268, 420, 806; widths: 184, 132, 366, 190 (padding ≈32 around measured text at 18px; adjust ±10 if rendering overflows)

- [ ] **Step 1: Write `banner-dark.svg`** with dark tokens: canvas `#05070A`, surface `#0D1117`, border `#30363D`, heading `#FFFFFF`, body `#8B9BB0`, muted `#4B5E74`, chip text `#C9D4E0`, green `#3ECF8E`. Full structure:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1480 400" width="1480" height="400" role="img" aria-label="Christian Ramirez — Full-Stack Software Engineer">
  <rect width="1480" height="400" rx="24" fill="#05070A"/>
  <g stroke="#FFFFFF" stroke-opacity="0.03">
    <!-- verticals x=22..1458 step 44; horizontals y=22..378 step 44 -->
    <path d="M22 0V400M66 0V400M110 0V400M154 0V400M198 0V400M242 0V400M286 0V400M330 0V400M374 0V400M418 0V400M462 0V400M506 0V400M550 0V400M594 0V400M638 0V400M682 0V400M726 0V400M770 0V400M814 0V400M858 0V400M902 0V400M946 0V400M990 0V400M1034 0V400M1078 0V400M1122 0V400M1166 0V400M1210 0V400M1254 0V400M1298 0V400M1342 0V400M1386 0V400M1430 0V400"/>
    <path d="M0 22H1480M0 66H1480M0 110H1480M0 154H1480M0 198H1480M0 242H1480M0 286H1480M0 330H1480M0 374H1480"/>
  </g>
  <text x="64" y="96" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="20" letter-spacing="4.4" fill="#4B5E74">CYBR / GITHUB</text>
  <text x="64" y="196" font-family="Poppins,'Segoe UI',system-ui,sans-serif" font-weight="700" font-size="76" letter-spacing="-1.5" fill="#FFFFFF">Christian Ramirez</text>
  <text x="64" y="248" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="29" fill="#8B9BB0">Full-Stack Software Engineer</text>
  <g>
    <rect x="64" y="300" width="184" height="34" rx="17" fill="#0D1117" stroke="#30363D"/>
    <rect x="268" y="300" width="132" height="34" rx="17" fill="#0D1117" stroke="#30363D"/>
    <rect x="420" y="300" width="366" height="34" rx="17" fill="#0D1117" stroke="#30363D"/>
    <rect x="806" y="300" width="190" height="34" rx="17" fill="#0D1117" stroke="#3ECF8E" stroke-opacity="0.35"/>
    <text x="84" y="323" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="18" fill="#C9D4E0">📍 Bulacan, PH</text>
    <text x="288" y="323" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="18" fill="#C9D4E0">⚡ 2+ yrs</text>
    <text x="440" y="323" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="18" fill="#C9D4E0">React · Next.js · Spring Boot</text>
    <text x="826" y="323" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="18" fill="#3ECF8E">● Open to work</text>
  </g>
</svg>
```

- [ ] **Step 2: Write `banner-light.svg`**

Same geometry/text; swap tokens: canvas `#F9FAFB`, surface `#FFFFFF`, border `rgba(17,24,39,0.15)` → use `#D1D5DB` (SVG-safe equivalent of the spec's rgba), heading `#111827`, body `#4B5E74`, muted `#6B7280`, chip text `#111827`, green `#059669`; grid stroke `#111827` opacity `0.03`.

- [ ] **Step 3: Validate XML + size**

```powershell
foreach ($f in "assets\svg\banner-dark.svg","assets\svg\banner-light.svg") {
  [xml](Get-Content $f -Raw) | Out-Null; "{0} OK ({1} bytes)" -f $f, (Get-Item $f).Length
}
```
Expected: both print OK, well under 250KB.

- [ ] **Step 4: Visual check**

Open both files in a browser (e.g. `Start-Process assets\svg\banner-dark.svg`). Confirm: no text overflow beyond chip rects, grid visible but subtle, name fits one line.

- [ ] **Step 5: Commit**

```bash
git add assets/svg/banner-dark.svg assets/svg/banner-light.svg
git commit -m "add hero banner svg assets"
```

---

### Task 3: Snapshot card SVGs

**Files:**
- Create: `assets/svg/snapshot-dark.svg`
- Create: `assets/svg/snapshot-light.svg`

**Interfaces:**
- Consumes: token system from Global Constraints.
- Produces: snapshot pair used in Task 7's About table right cell.

Geometry:
- `viewBox="0 0 560 420"`, width 560 height 420, rx=24 canvas rect, subtle grid like Task 2 (pitch 44)
- Eyebrow x=40 y=64: `SNAPSHOT`, font-size 16, letter-spacing 3.5, fill=muted
- Three stacked info groups, each: label (body stack, 15px, muted) + value line(s) (heading stack 700 for primary value, body for secondary)
  - y≈120: label `LOCATION`, value `Bulacan, Philippines` (heading, 28)
  - y≈200: label `EDUCATION`, value `BS Computer Science` (heading, 26); second line `St. Clare College of Caloocan · 2022` (body, 19)
  - y≈300: label `CURRENT FOCUS`, value `Frontend delivery · API integration` (body, 19) and `Workflow automation` (body, 19) at y≈330
- Divider hairlines between groups at y=160 and y=250: `<line>` x1=40 x2=520, stroke=border

- [ ] **Step 1: Write `snapshot-dark.svg`** — dark tokens (canvas `#05070A`, border `#30363D`, heading `#FFFFFF`, body `#8B9BB0`, muted `#4B5E74`)
- [ ] **Step 2: Write `snapshot-light.svg`** — light tokens (canvas `#FFFFFF`, border `#D1D5DB`, heading `#111827`, body `#4B5E74`, muted `#6B7280`); omit grid texture on light variant (cleaner against white)
- [ ] **Step 3: Validate** — same `[xml]` parse loop as Task 2 Step 3, expect both OK
- [ ] **Step 4: Visual check** — open in browser; confirm no clipped text at 560 width
- [ ] **Step 5: Commit** — `git add assets/svg/snapshot-*.svg; git commit -m "add about snapshot svg assets"`

---

### Task 4: Skills matrix SVGs

**Files:**
- Create: `assets/svg/skills-matrix-dark.svg`
- Create: `assets/svg/skills-matrix-light.svg`

**Interfaces:**
- Produces: skills-matrix pair used in Task 7 Skills section.

Geometry:
- `viewBox="0 0 1480 620"`, width 1480 height 620, rx=24 canvas, grid texture both variants (subtle)
- Eyebrow x=56 y=72: `FULL-STACK TOOLKIT`, 16px, letter-spacing 3.5, muted; title x=56 y=124: `A toolkit for modern web delivery.` heading stack 700, 40px, heading color
- Tile grid: 2 columns × 4 rows. Tile w=674, h=100, gap x=20 y=16; origin x=56, first tile y=164. Each tile: rect rx=12 fill=surface stroke=border; inside padding 24:
  - Category label: body stack 13px letter-spacing 2.6 uppercase muted, at tileY+38
  - Skill list: body stack 21px fill=chip-text at tileY+74
- Categories/skills (verbatim, order matters):

| Label | Skills |
|---|---|
| LANGUAGES | Java · JavaScript · Python · SQL · HTML · CSS |
| FRONTEND | React.js · Next.js · Vue.js · Tailwind CSS · Responsive UI |
| BACKEND | Spring Boot · Express.js · RESTful APIs · Integration · Auth |
| DATABASES | PostgreSQL · MySQL · MongoDB · SQLite · Redis · DynamoDB |
| AUTOMATION | n8n · Zapier · GoHighLevel · Webhooks |
| CLOUD & DEVOPS | Git · GitHub · AWS · CI/CD · Vercel |
| DEVELOPER TOOLS | Postman · Swagger · VS Code · IntelliJ · Jira |
| ENGINEERING | OOP · SOLID · Data Mapping · System Design |

Row order top→bottom: Languages/Frontend, Backend/Databases, Automation/Cloud & DevOps, Developer Tools/Engineering.

- [ ] **Step 1: Write `skills-matrix-dark.svg`** — dark tokens; tile fill `#0D1117`, stroke `#30363D`
- [ ] **Step 2: Write `skills-matrix-light.svg`** — light tokens; tile fill `#FFFFFF`, stroke `#D1D5DB`
- [ ] **Step 3: Validate + visual check** — XML parse both; browser check that skill lists fit within 626px inner width (shrink skill font to 19px for the longest lists only if overflowing)
- [ ] **Step 4: Commit** — `git add assets/svg/skills-matrix-*.svg; git commit -m "add skills matrix svg assets"`

---

### Task 5: Split Card template (XieTech)

**Files:**
- Create: `assets/svg/proj-xietech-dark.svg`
- Create: `assets/svg/proj-xietech-light.svg`

**Interfaces:**
- Consumes: `assets/img/xietech.webp` from Task 1.
- Produces: THE reference implementation all six cards in Task 6 copy. Template values marked ◆ are substituted per-project (table in Task 6).

Geometry:
- `viewBox="0 0 1480 360"`, width 1480 height 360, rx=24 canvas rect (fill=surface — cards sit ON the page canvas)
- Right screenshot zone: clipPath rect x=880 y=0 w=600 h=360 (rounded right corners via rx on a mask rect — simpler: `<clipPath><path d="M880 0H1456a24 24 0 0 1 24 24v312a24 24 0 0 1-24 24H880Z"/></clipPath>`)
- Inside clip: `<image>` href=`data:image/webp;base64,<B64>` x=900 y=-30 width=640 height=420 preserveAspectRatio="xMidYMin slice" transform="skewX(-4)" — skew applied via transform attribute on the image
- Fade overlay inside clip: `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="◆SURFACE"/><stop offset="0.45" stop-color="◆SURFACE" stop-opacity="0"/></linearGradient><rect x="880" y="0" width="220" height="360" fill="url(#fade)"/>`
- Left content zone x=56:
  - Eyebrow y=78: `◆DISCIPLINE · ◆NN` 15px letter-spacing 3 muted
  - Status pill beside eyebrow (x=56, y=94..126): rect rx=16 h=32 fill=status-color at 8% opacity (`fill-opacity="0.08"`) stroke=status-color 35%; text 16px fill=status-color: `◆STATUS`
  - Title y=182: `◆TITLE` heading stack 700 42px heading-color
  - One-liner y=228: `◆ONELINER` body 21px body-color (keep ≤62 chars or wrap to second line y=258)
  - Tech list y=306: `◆TECH` body 17px muted
  - CTA y=306 anchored right of content zone (text-anchor="end", x=850): `Read case study ↗` 19px fill=accent-cyan

XieTech values (dark variant): SURFACE `#05070A`… wait — cards must contrast against page. Page canvas is `#05070A`; card surface `#0D1117`. So card rect fill `#0D1117`, fade gradient stop-color `#0D1117`. Light: card `#FFFFFF`, fade `#FFFFFF`.

Dark tokens: eyebrow/muted `#4B5E74`, heading `#FFFFFF`, body `#8B9BB0`, tech `#5B6B80`→use `#8B9BB0` at 0.75 opacity, cyan `#22D3EE`. Light: muted `#6B7280`, heading `#111827`, body `#4B5E74`, tech `#4B5E74` opacity 0.75, cyan `#0891B2`.

XieTech content: NN=`01`, DISCIPLINE=`WEBSITE`, STATUS=`Completed` (green), TITLE=`XieTech Public Website`, ONELINER=`Modern corporate website built to scale with business growth.`, TECH=`Next.js · TypeScript · Tailwind CSS`.

- [ ] **Step 1: Base64-encode the screenshot**

```powershell
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("assets\img\xietech.webp")); $b64.Length
Set-Content -Path "$env:TEMP\xietech.b64" -Value $b64 -NoNewline
```
Expected: length printed (roughly 100–200K chars).

- [ ] **Step 2: Write `proj-xietech-dark.svg`**

Build the full SVG per geometry above, inserting `$b64` content into `href="data:image/webp;base64,..."`. Write it via PowerShell string composition so the base64 lands inline:

```powershell
$tpl = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1480 360" width="1480" height="360" role="img" aria-label="XieTech Public Website case study card">
  <defs>
    <clipPath id="shot"><path d="M880 0h552a48 48 0 0 1 48 48v264a48 48 0 0 1-48 48H880Z"/></clipPath>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0D1117"/><stop offset="0.45" stop-color="#0D1117" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1480" height="360" rx="24" fill="#0D1117" stroke="#30363D"/>
  <g clip-path="url(#shot)">
    <image href="data:image/webp;base64,__B64__" x="900" y="-30" width="640" height="430" preserveAspectRatio="xMidYMin slice" transform="skewX(-4)"/>
    <rect x="880" y="0" width="230" height="360" fill="url(#fade)"/>
  </g>
  <text x="56" y="78" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="15" letter-spacing="3" fill="#4B5E74">WEBSITE · 01</text>
  <rect x="56" y="96" width="128" height="32" rx="16" fill="#3ECF8E" fill-opacity="0.08" stroke="#3ECF8E" stroke-opacity="0.35"/>
  <text x="72" y="118" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="16" fill="#3ECF8E">Completed</text>
  <text x="56" y="188" font-family="Poppins,'Segoe UI',system-ui,sans-serif" font-weight="700" font-size="42" letter-spacing="-0.8" fill="#FFFFFF">XieTech Public Website</text>
  <text x="56" y="232" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="21" fill="#8B9BB0">Modern corporate website built to scale with business growth.</text>
  <text x="56" y="306" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="17" fill="#8B9BB0" fill-opacity="0.75">Next.js · TypeScript · Tailwind CSS</text>
  <text x="850" y="306" text-anchor="end" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="19" fill="#22D3EE">Read case study ↗</text>
</svg>
'@
$b64 = [IO.File]::ReadText("$env:TEMP\xietech.b64")
[IO.File]::WriteText("assets\svg\proj-xietech-dark.svg", $tpl.Replace("__B64__", $b64))
```

- [ ] **Step 3: Write `proj-xietech-light.svg`**

Same template with: card fill/stroke → `#FFFFFF` / `#D1D5DB`, fade stops → `#FFFFFF`, muted → `#6B7280`, heading → `#111827`, body → `#4B5E74`, tech → `#4B5E74` opacity 0.75, cyan → `#0891B2`, green → `#059669` (pill fill-opacity 0.08, stroke-opacity 0.35). aria-label unchanged. Same embedded base64.

- [ ] **Step 4: Validate + size audit**

```powershell
foreach ($f in Get-ChildItem assets\svg\proj-xietech-*.svg) {
  [xml](Get-Content $f.FullName -Raw) | Out-Null
  "{0} OK {1}KB" -f $f.Name, [math]::Round($f.Length/1KB)
}
```
Expected: both OK, each ≤250KB.

- [ ] **Step 5: Visual check** — open both in browser: screenshot fills right zone edge-to-edge under fade; skew reads intentional; no white seams at clip edges (if seams appear, widen image x to 890/width 660)
- [ ] **Step 6: Commit** — `git add assets/svg/proj-xietech-*.svg; git commit -m "add xietech split card svgs"`

---

### Task 6: Remaining six Split Cards

**Files:**
- Create: `assets/svg/proj-{cascade,kindred,milktea,pahina,attendance,pursuit}-{dark,light}.svg` (12 files)

**Interfaces:**
- Consumes: Task 5 template (copy verbatim, substitute ◆ values) + Task 1 images.
- Produces: all seven `proj-*` pairs referenced by Task 7.

Substitution table (all other geometry/colors identical to Task 5; discipline numbering continues portfolio order):

| slug | img | B64 src | NN | DISCIPLINE | STATUS | status color (dark/light) | TITLE | ONELINER | TECH |
|---|---|---|---|---|---|---|---|---|---|
| cascade | cascade.webp | cascade.b64 | 02 | WEBSITE | Completed | green/green | Cascade Coat Painting Website | Brand-driven, SEO-complete marketing site system. | Next.js · TypeScript · Tailwind · GSAP |
| kindred | kindred.webp | kindred.b64 | 03 | WEBSITE | Completed | green/green | Kindred Visits Website | Static-exported rebuild of a legacy agency site. | Next.js · TypeScript · GSAP · Static Export |
| milktea | milktea.webp | milktea.b64 | 04 | WEB APP | Planning / UI Design | amber/amber | Milktea POS System | Cashier-first POS concept for drink ordering and reporting. | Spring Boot · Next.js · PostgreSQL |
| pahina | pahina.webp | pahina.b64 | 05 | WEB APP | Completed | green/green | Pahina EBook Store | Full-stack eBook marketplace with admin tooling. | Spring Boot · PostgreSQL · React.js |
| attendance | attendance.webp | attendance.b64 | 06 | AUTOMATION | Completed | green/green | Attendance Monitoring Automation | Tracks time-ins, sends absence warnings, updates records. | GoHighLevel · Workflows · Google Sheets |
| pursuit | pursuit.webp | pursuit.b64 | 07 | MOBILE APP | Completed | green/green | Pursuit — Job Application Tracker | Local-first job pipeline tracker — no account needed. | React Native · Expo · SQLite |

Status pill widths: measure per label at 16px ≈ chars×8.2+32: `Completed`=128 (reuse), `Planning / UI Design`=216.

Pursuit special case: logo image is a square icon — set `<image ... preserveAspectRatio="xMidYMid meet">`, drop the skew transform, center it in the shot zone (x=1060 y=60 width=240 height=240), keep fade.

Status colors: dark green `#3ECF8E`, light green `#059669`, dark amber `#FEBC2E`, light amber `#D97706`.

- [ ] **Step 1: Encode six screenshots** — repeat Task 5 Step 1 for each img (loop over the six slugs writing `%TEMP%\<slug>.b64`)
- [ ] **Step 2: Generate 12 SVGs** — for each slug: copy Task 5's PowerShell template block twice (dark/light), apply the substitution table + Task 5 Step 3 light-token swaps, write file. Process slugs one at a time to keep commands small.
- [ ] **Step 3: Validate all + size audit** — loop `[xml]` parse + KB print over `assets\svg\proj-*.svg` (14 files total). Expected: 14 OK, none >250KB
- [ ] **Step 4: Visual check** — open all 12 in browser; check long titles (`Cascade Coat Painting Website`, `Attendance Monitoring Automation`) fit at 42px within x=56..850 — if any clips, reduce that title to 38px
- [ ] **Step 5: Commit** — `git add assets/svg/proj-*.svg; git commit -m "add remaining six project split cards"`

---

### Task 7: Rewrite README.md

**Files:**
- Modify: `README.md` (full replacement)

**Interfaces:**
- Consumes: all Task 2–6 assets, Task 1 stats params from spec.

- [ ] **Step 1: Replace README.md with the new document**

Exact structure (compose in this order; `<picture>` blocks use this pattern everywhere, swapping filename per section):

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/svg/banner-dark.svg">
  <img alt="Christian Ramirez — Full-Stack Software Engineer. Bulacan, PH. 2+ years experience. React, Next.js, Spring Boot. Open to work." src="./assets/svg/banner-light.svg">
</picture>
```

Document outline:

1. Banner picture block (above)
2. `## About` — HTML table, borderless:

```html
<table>
  <tr>
    <td width="62%" valign="top">

Performance-driven software engineer with 2+ years of experience across frontend development, workflow automation, API integration, and backend systems.

**Current Focus**

- Frontend delivery with Vue.js, React.js, Next.js, and Tailwind CSS
- Backend & automation across APIs, webhooks, CI/CD, and cloud logs
- Building production features end to end

</td>
    <td width="38%" valign="top">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/svg/snapshot-dark.svg">
  <img alt="Snapshot card: Bulacan Philippines, BS Computer Science from St. Clare College of Caloocan 2022, current focus areas." src="./assets/svg/snapshot-light.svg">
</picture>
    </td>
  </tr>
</table>
```

3. `## Skills` — heading + skills-matrix picture block (alt: "Skills matrix: languages, frontend, backend, databases, automation, cloud and DevOps, developer tools, software engineering.")
4. `## Featured Projects` — intro line `Case studies from my portfolio — click any card to read the full breakdown.` Then seven linked picture blocks:

```html
<a href="https://christian-portfolio-one-phi.vercel.app/projects/xietech-public-website">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/svg/proj-xietech-dark.svg">
    <img alt="XieTech Public Website — completed corporate website built with Next.js, TypeScript, Tailwind CSS." src="./assets/svg/proj-xietech-light.svg">
  </picture>
</a>
```

(repeat for cascade-coat-painting-website, kindred-visits-website, milktea-pos-system, pahina-ebook-store, attendance-monitoring-automation, pursuit-job-application-tracker — alt texts mirror each card's title/status/tech)

Blank line required between consecutive `<a>` blocks or GitHub merges them.

5. `## Stats` — table:

```html
<table border="0">
  <tr>
    <td><img alt="GitHub stats: cybr2" src="https://github-readme-stats.vercel.app/api?username=cybr2&show_icons=true&rank_icon=github&bg_color=0D1117&title_color=FFFFFF&text_color=C9D4E0&icon_color=22D3EE&border_color=30363D&border_radius=12"></td>
    <td><img alt="GitHub streak stats: cybr2" src="https://streak-stats.demolab.com?user=cybr2&background=0D1117&border=30363D&border_radius=12&dates=8B9BB0&ring=3ECF8E&fire=E67E22&currStreakNum=FFFFFF&sideNums=C9D4E0&currStreakLabel=22D3EE&sideLabels=8B9BB0"></td>
  </tr>
</table>
<img alt="Top languages: cybr2" src="https://github-readme-stats.vercel.app/api/top-langs/?username=cybr2&layout=compact&langs_count=8&bg_color=0D1117&title_color=FFFFFF&text_color=C9D4E0&border_color=30363D&border_radius=12">
```

6. `## Experience`:

```markdown
**Speedy Global** — Frontend Web Developer · May 2024 – Nov 2024
Built responsive Vue.js/Tailwind pages from Figma designs; integrated APIs for data capture and retrieval.

**Novare Technologies Inc.** — Associate Software Engineer · Nov 2022 – Nov 2023
Data mappings for API payloads, AWS CloudWatch monitoring, Jenkins CI/CD support, unit testing.
```

7. Footer strip (centered, no heading):

```html
<p align="center">
  <a href="mailto:ydoowbernisca2@gmail.com"><img alt="Email" src="https://img.shields.io/badge/Email-ydoowbernisca2@gmail.com-0D1117?style=flat-square&labelColor=0D1117&color=22D3EE"></a>
  <a href="https://www.linkedin.com/in/ydoow/"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-in/ydoow-0D1117?style=flat-square&labelColor=0D1117&logo=linkedin&logoColor=22D3EE"></a>
  <a href="https://christian-portfolio-one-phi.vercel.app/"><img alt="Portfolio" src="https://img.shields.io/badge/Portfolio-christian‑portfolio‑one.phi-0D1117?style=flat-square&labelColor=0D1117&color=22D3EE"></a>
</p>
```

- [ ] **Step 2: Local render check** — serve repo root (`npx serve .` or VS Code Live Server alternative: `python -m http.server` unavailable → prefer `npx -y serve .`) and open the rendered page via any markdown previewer; simpler accepted path: push nothing, open `https://github.com/cybr2/cybr2/preview`? Not real — instead validate structurally:
  - All `srcset`/`src` paths resolve to files on disk:

```powershell
Select-String -Path README.md -Pattern '\./assets/[^\)"]+' -AllMatches |
  ForEach-Object { $_.Matches.Value } | Sort-Object -Unique | ForEach-Object {
    $p = $_ -replace '^\./',''
    if (Test-Path $p) { "OK   $_" } else { "MISS $_" }
  }
```
Expected: every line starts `OK` — zero `MISS`.

- [ ] **Step 3: Link audit**

```powershell
(Select-String -Path README.md -Pattern 'href="(https[^"]+)"' -AllMatches).Matches |
  ForEach-Object Value | Sort-Object -Unique
```
Expected: 7 unique case-study URLs + mailto + linkedin + portfolio URL. Spot-check one case-study URL returns 200 (`Invoke-WebRequest -Method Head -UseBasicParsing <url>` → StatusCode 200).

- [ ] **Step 4: Commit** — `git add README.md; git commit -m "rewrite profile readme with portfolio-matched design"`

---

### Task 8: Cleanup legacy assets

**Files:**
- Delete: `assets/banner.png`, `assets/gmailIcon.png`, `assets/githubIcon.png`, `assets/linkedinIcon.png`, `assets/facebookIcon.png`, `assets/me2.jpg`, `assets/icons/`, `assets/projects/`

- [ ] **Step 1: Confirm zero references** — `Select-String -Path README.md -Pattern 'gmailIcon|githubIcon|linkedinIcon|facebookIcon|me2|banner\.png|icons/|projects/'` → Expected: no matches
- [ ] **Step 2: Delete** — `git rm -r assets/banner.png assets/gmailIcon.png assets/githubIcon.png assets/linkedinIcon.png assets/facebookIcon.png assets/me2.jpg assets/icons assets/projects`
- [ ] **Step 3: Commit** — `git commit -m "remove legacy profile assets"`

---

### Task 9: Final verification

- [ ] **Step 1: Full asset audit**

```powershell
Get-ChildItem assets\svg\*.svg | ForEach-Object {
  [xml](Get-Content $_.FullName -Raw) | Out-Null
  [pscustomobject]@{ Name=$_.Name; KB=[math]::Round($_.Length/1KB) }
} | Format-Table -AutoSize
(Get-ChildItem assets\svg\*.svg).Count
```
Expected: **20** SVGs (banner 2 + snapshot 2 + skills-matrix 2 + projects 14), all parse, all ≤250KB.

- [ ] **Step 2: README structural sanity** — re-run Task 7 Steps 2–3 audits; zero MISS, all links present
- [ ] **Step 3: Mode simulation** — temporarily flip OS/GitHub theme preference isn't possible pre-push; instead open `proj-milktea-light.svg` and `proj-milktea-dark.svg` side by side in a browser and diff visually against approved mockups (amber pill light/dark, fades correct)
- [ ] **Step 4: Report** — summarize results to the user; ask whether to push to `origin main` (pushing publishes the new profile immediately). Do NOT push without explicit approval.
