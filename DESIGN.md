---
title: "ChangeHold — The Ledger Book"
subtitle: "The vendor's own debt book, on paper."
tone: honest, warm, firm, small-and-boundaried
character: aged ivory ruled paper lying open on a dark desk; blue-black biro ink for structure; a single committed red ink for money owed; pencil marginalia; brass keeper fittings.
platform: web (PWA), mobile-first, zero dependencies
---

# ChangeHold — The Ledger Book

## Purpose of this document
DESIGN.md is the durable visual design system for ChangeHold, written from the
built app (ground truth, not intention). Generated at finish of the "Ledger Book"
redesign. The app is a zero-dependency vanilla-JS PWA ([PRODUCT.md](./PRODUCT.md))
for tracking cash change forgotten at Nigerian shops.

## Atmosphere
The trader's own debt book, lying open on a warm wooden desk. It is *not* a
neobank or a productivity dashboard; it is a private record with the authority
of a public ledger — firm, legible, and easy to read under phone light in a dim
room. Debt is written in one committed red ink; settled entries are crossed
through in red and stamped VOID; totals carry the double rule of a book balance.
Nothing suggests money moved anywhere else; the book is the record.

## Tokens

### Color
Wireframe tokens first (what the scene is), then semantic mappings.

Primary palette (the scene):
- `#221b12` desk ground (page sits on it in warm shadow)
- `#2b2317` desk highlight
- `#f7f2e5` paper (page surface, body background)
- `#efe8d6` paper-2 (inset slips, note tiles, sheets)
- `#252238` ink (blue-black biro: structure, labels, headings)
- `#b22a1d` red ink (money owed, debt, primary action, focus)
- `#8c1d12` red-deep (pressed shade of primary)
- `#1d6b46` green ink (cleared/paid, all-clear signals)
- `#a8823a` brass (keeper fittings: sheet grab handle, one-off stub tile)
- `#d6c9a8` / `#b8ab87` ruled lines (laid ruling, hairline borders)

Secondary (texturals):
- `#645b4a` ink-soft — muted body text on paper ≥5.99:1
- `#6f6350` ink-faint — pencil marginalia/annotations on paper ≥5:1
- `#f4e3dd` / `rgba(178,42,29,.32)` red-soft / red-edge — debt washes/edges
- `#e4efe6` / `rgba(29,107,70,.35)` green-soft / green-edge — cleared washes/edges

Semantic roles:
- `--surface`, `--surface-2` → `paper-2`; `--line` → `rule-strong`
- `--accent`, `--accent-deep`, `--amber` → red / red-deep (single committed red)
- `--muted` → ink-soft; `--text` → ink; `--bg` → desk

Contrast (WCAG relative luminance on `#f7f2e5`): body ink 13.77:1; muted 5.99:1;
pencil/ink-faint ≥5:1; red 5.80:1; green 5.79:1; paper text on red primary 5.80:1.

### Typography
Two faces, both self-hosted woff2 in `assets/fonts/` and cached in the service
worker (cache `changehold-v2`):
- **Archivo** (400–800, variable) — everything structural; `font-variant-numeric:`
  `tabular-nums` on all money-bearing text so column digits align.
- **Caveat** (500–700, variable) — handwriting/marginalia only: the hero subline
  ("x uncollected change across the shops") and the story label
  ("Read this to the vendor").

Scale (money and structure are big): hero total 56px/800; amounts 22–34px/800;
titles 26px/800; running totals 30px/800; body 14–17px; captions 11.5px/800 with
0.16–0.18em letterspacing for page-head labels and section rules.

### Spacing, radii, depth
- Page max width 560px, hero section, `--radius: 14px`, `--radius-sm: 10px`.
- Depth is *layered paper*: `--shadow-paper` floats the page off the desk;
  slips and the FAB use offset+blur soft shadows; no hard drop-shadows.
- 4px ink sheet-edge strip on the one-off sheet (inset box-shadow, not a border);
  brass 5px grab handle centered on the sheet.

## Components (shipped)

- **Page head / running head** — ink 2px rule under the head; logo wordmark
  "Change" + red "Hold"; ghost Manage action.
- **Hero total** — small caps red label; amount in red with tabular numerals;
  **single rule above, double rule beneath** (book-balance grammar); `cleared`
  variant turns the total green-ink.
- **Shop accounts** — ruled rows (not boxes): biro name, red balance; meta line
  with open-change count; `open` rows get a red "OWED" rotated stamp beside the
  amount and a red bottom rule. Settled rows show green "all settled".
- **One-off stub** — brass-tiled mic icon + label, separated by a double rule;
  its own bottom sheet with brass grab handle.
- **Buttons** — `.btn-primary` solid red ink block with deep-red press edge;
  `.btn-ghost` ink hairline; `.btn-danger` red wash. Icon+label buttons are
  inline-flex with 7px gap.
- **FAB** — red "+" ink stamp, paper ring, bottom-center.
- **Wizard** — ruled tick-sheet (`steps-dots` as boxes you fill in), item options
  as a print-select grid, denomination "note" tiles that *ink* when tapped with
  red "×n" counts, running total in red; review step renders the balance as a
  book total with double rules; settled summary in green with a check stamp.
- **Shop detail** — open entries as ruled slips with OWED stamp; settled entries
  struck through in red with a rotated **VOID** stamp; "Debrief — read to the
  vendor" in Caveat red.
- **Manage / Setup** — underline-fill inputs (2px ink rule, red on focus),
  brass switch-on green tracked toggle, red clear-geo chips, ruled manage rows.
- **Empty states** — dashed brass-rule medallion (storefront / receipt SVG).
- **Toast** — dark ink slip with paper text, dropped over the page.

## Iconography
All icons are inline strokes (`CH.ui.icon`), 1.8px round-cap/lines, `currentColor`,
`aria-hidden`: storefront, pin, mic, receipt, back chevron, close, backspace,
play, check. No emoji or unicode glyphs stand in for icons.

## Motion
Page turns fade + 10px rise (180ms ease). Sheet slides up over a dimmed backdrop
(250ms). Toggle/press affordances are quick 80–150ms transforms.

## States
- Selected ink = red; settled/cleared = green; muted = ink-soft.
- `:focus-visible` = 2.5px red outline, 2px offset; caret red; selection red
  with paper text; webkit scrollbar 10px thumb in ruled-line brown on a
  transparent track (Firefox inherits the platform's default thin overlay).
- FAB scale-down on press; buttons 0.97 on press.

## Theming
Single light theme by design (scene-locked): the trader reads the book under
phone light in bright and dim rooms; the paper page carries the contrast in
both. No dark mode token.

## Accessibility
Body copy ≥4.5:1 (measured above). Interaction targets ≥44px. Two-type system
keeps handwriting to decoration, never reading-critical. All status reflected in
color *and* text/structure (OWED stamps, "OWED", strike-throughs), never color alone.

## Provenance
- **Fonts**: Archivo + Caveat, latin subset variable woff2, self-hosted from
  Google Fonts (OFL) into `assets/fonts/`, cached by the SW (`changehold-v2`).
- **Icons**: authored inline SVG for this build.
- **App icon**: authored SVG ledger slip with red ₦ total + brass ink stamp
  (`icons/icon.svg`, maskable variant); matches the palette above.
- No raster assets ship; the detector's one advisory (laid-paper ruling lines)
  is recorded as an intentional texture in `.impeccable/config.json`.