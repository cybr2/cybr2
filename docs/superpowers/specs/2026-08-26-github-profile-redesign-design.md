# GitHub Profile Redesign — Design Spec

**Date:** 2026-08-26
**Repo:** `cybr2/cybr2` (GitHub profile README)
**Reference:** [christian-portfolio-one-phi.vercel.app](https://christian-portfolio-one-phi.vercel.app/)
**Status:** Approved via visual brainstorming session

## Goal

Redesign the `cybr2/cybr2` special-repository README so the GitHub profile visually extends Christian Ramirez's portfolio: same bunker-dark palette, editorial typography, and bento card language. The profile must adapt to GitHub's light and dark modes.

## Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Deliverable | Full README redesign + hand-crafted SVG assets in-repo |
| Theme strategy | Adaptive light + dark (`<picture>` + `prefers-color-scheme`) |
| Banner | Type-led editorial headline + slim chip rail (no avatar/initials block) |
| Title line | "Full-Stack Software Engineer" only |
| Page structure | Editorial single column |
| Projects | All 7 portfolio case studies as Split Cards |
| Skills | One full-width SVG matrix card |
| Stats | github-readme-stats family, fixed bunker-dark theme |

## Visual System (from portfolio `globals.css`)

### Colors

| Token | Dark | Light |
|---|---|---|
| Canvas | `#05070A` (bunker darkest) | `#F9FAFB` |
| Card surface | `#0D1117` (bunker) | `#FFFFFF` |
| Border | `rgba(255,255,255,0.14)` ≈ `#30363D` | `rgba(17,24,39,0.15)` |
| Heading text | `#FFFFFF` | `#111827` |
| Body text | `#8B9BB0` | `#4B5E74` |
| Muted label / eyebrow | `#4B5E74` | `#6B7280` |
| Chip text | `#C9D4E0` | `#111827` |
| Link / arrow accent | `#22D3EE` | `#0891B2` |
| Status: available/completed | `#3ECF8E` | `#059669` |
| Status: planning | `#FEBC2E` | `#D97706` |

### Typography

- Headings: `Poppins, 'Segoe UI', system-ui, sans-serif`, weight 700, tight tracking
- Body: `'Inter', 'Segoe UI', system-ui, sans-serif`
- Constraint: GitHub's camo proxy blocks webfont loading inside SVG images. The stack above renders Poppins/Inter where installed and degrades gracefully to Segoe UI elsewhere. Do NOT convert text to paths (unmaintainable).

### Shape

- Banner/matrix/cards outer radius: 24px (portfolio `--radius-large`)
- Inner tiles: 12px (`--radius-medium`)
- Chips/status pills: fully rounded (999px)
- Grid texture on dark canvases: 44px pitch lines, `rgba(255,255,255,0.03)`

## Asset Inventory (`assets/svg/`, each `-light.svg` + `-dark.svg`)

| Asset | Content |
|---|---|
| `banner-*` | Eyebrow `CYBR / GITHUB`; H1 "Christian Ramirez"; subtitle "Full-Stack Software Engineer"; chip rail: `📍 Bulacan, PH` · `⚡ 2+ yrs` · `React · Next.js · Spring Boot` · `● Open to work` (green) |
| `snapshot-*` | About-side card: education (BSCS, St. Clare College of Caloocan, 2022), location, focus areas |
| `skills-matrix-*` | 8 tiles, 2-col grid: Languages; Frontend; Backend; Databases; Automation; Cloud & DevOps; Developer Tools; Software Engineering (skill lists mirror portfolio Skills section) |
| `proj-xietech-*` … `proj-pursuit-*` | 7 Split Cards (spec below) |

All SVGs sized ~1480px wide viewBox (2× logical 740px) for crispness.

### Split Card anatomy (per project)

- Left ~62%: eyebrow (`DISCIPLINE · NN`), title (Poppins 700), one-liner, tech list (muted), `Read case study ↗` (cyan accent), status pill near title
- Right ~38%: screenshot skewed −4°, gradient fade from card surface over its left edge
- Whole card wrapped in a markdown link to the case study page

| # | Project | Status | Screenshot source | Case study path |
|---|---|---|---|---|
| 01 | XieTech Public Website | Completed | `xietech-img.webp` | `/projects/xietech-public-website` |
| 02 | Cascade Coat Painting Website | Completed | `envision-1.png` | `/projects/cascade-coat-painting-website` |
| 03 | Kindred Visits Website | Completed | `kindred-visits-img-1.webp` | `/projects/kindred-visits-website` |
| 04 | Milktea POS System | Planning / UI Design | `milktea-pos-img.webp` | `/projects/milktea-pos-system` |
| 05 | Pahina EBook Store | Completed | `pahina-img-1.webp` | `/projects/pahina-ebook-store` |
| 06 | Attendance Monitoring Automation | Completed | `automation-img-1.webp` | `/projects/attendance-monitoring-automation` |
| 07 | Pursuit — Job Application Tracker | Completed | `icon-1.png` (logo on purple-tinted surface) | `/projects/pursuit-job-application-tracker` |

Case studies base URL: `https://christian-portfolio-one-phi.vercel.app`

### Screenshots pipeline

1. Download sources from Supabase storage bucket into `assets/img/src/` (reference only, not referenced by README)
2. Downscale to ≤800px wide, convert to WebP q≈72 (JPEG fallback if WebP unsupported by tooling)
3. Base64-embed into each Split Card SVG (GitHub blocks external references inside SVG images)
4. Target ≤250KB per finished SVG

## README Structure (top to bottom)

1. **Banner** — `<picture>` swap, alt text
2. **About** — markdown table: left = intro sentence + "Current Focus" bullets (from portfolio hero); right = snapshot card
3. **Skills** — heading + full-width skills-matrix SVG
4. **Featured Projects** — 7 linked Split Cards, stacked full width, portfolio discipline order
5. **Stats** — table row: stats + streak; top-langs centered below. Fixed dark theme in both modes (mirrors how the portfolio places scheme-1 dark sections on light pages):
   ```
   stats:      https://github-readme-stats.vercel.app/api?username=cybr2&show_icons=true&rank_icon=github&bg_color=0D1117&title_color=FFFFFF&text_color=C9D4E0&icon_color=22D3EE&border_color=30363D&border_radius=12
   streak:     https://streak-stats.demolab.com?user=cybr2&background=0D1117&border=30363D&border_radius=12&dates=8B9BB0&ring=3ECF8E&fire=E67E22&currStreakNum=FFFFFF&sideNums=C9D4E0&currStreakLabel=22D3EE&sideLabels=8B9BB0
   top-langs:  https://github-readme-stats.vercel.app/api/top-langs/?username=cybr2&layout=compact&langs_count=8&bg_color=0D1117&title_color=FFFFFF&text_color=C9D4E0&border_color=30363D&border_radius=12
   ```
6. **Experience** — compact rows: `Speedy Global — Frontend Web Developer — May–Nov 2024`; `Novare Technologies Inc. — Associate Software Engineer — Nov 2022–Nov 2023`, each with a one-line highlight
7. **Footer strip** — Email · LinkedIn · Portfolio links (themed shields badges), centered

Every image gets descriptive alt text. Old devicon wall, gruvbox stats, legacy project PNGs, `assets/icons/`, social icon PNGs are removed (superseded).

## Error Handling / Edge Cases

- If a stats service is down, markdown alt text shows; acceptable degradation
- SVGs must remain valid XML (emoji via `<text>` are fine; no external CSS/fonts/images)
- Light/dark mismatch impossible by construction: both variants generated from same source geometry

## Verification Plan

- XML-validate every SVG; check embedded-image integrity
- Render-check README locally (VS Code preview or local server) in forced light/dark
- Confirm all 7 case-study links resolve
- File-size audit against targets

## Out of Scope

- Pinned repo descriptions/READMEs, GitHub Actions automation, org-level changes, contribution-graph tricks, portfolio site changes

## Maintenance

- Content edits: edit `README.md` markdown directly
- Visual edits: edit SVG sources (hand-authored, commented structure), regenerate nothing
