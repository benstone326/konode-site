# Konode site — design system

The single source of truth for type, color, radius and spacing on this site.
**If you need a value that isn't in this file, add it here deliberately rather
than inventing a one-off.**

**Every token below is declared in `tokens.css`, and nowhere else.** All five
pages load it first, ahead of `style.css` or `docs.css`. Neither of those has a
`:root` any more, and neither should get one back.

## Why there is a separate tokens file

Until 2026-08-11 the landing page and the doc pages each carried their own
`:root`. The two shared 29 token names and **eight of them held different
values**, so the same name meant different things depending on which page you
were looking at: `--maxw` was 1216px or 1152px, `--s-9` was 120px or 96px,
`--dur` was 180ms or 160ms, `--border` was `#e6e8eb` or `#ececef`. Copying a
rule from one stylesheet to the other silently resized or recolored it.

`docs.css` also used a different vocabulary for the same ideas. Those names were
folded into the landing page's, which is what the merged set uses:

| Was, in `docs.css` | Now |
| --- | --- |
| `--surface` | `--bg-card` |
| `--surface-2` | `--bg-subtle` |
| `--accent-text` | `--accent-solid` |
| `--accent-tint` | `--bg-card-sel` |
| `--fs-label` | `--fs-xs` |
| `--fs-card` | `--fs-sm` |
| `--r-md` / `--r-lg` | `--r-btn` / `--r-card` |
| `--lift` / `--lift-lg` | `--shadow-lm-lg` / `--shadow-lg` |
| `--s-10` | dropped, it was never used |

Four names survived the merge because they name something the landing page has
no equivalent for: `--fg-subtle`, `--danger-text`, `--fs-display` and
`--fs-lead`. `--fs-display` in particular is **not** a duplicate of `--fs-hero`:
a landing hero tops out at 72px and a document title at 60px, and collapsing
them would make one of the two wrong.

The merged set is 57 tokens, every one of them used.

Merging the two exposed a set of literal sizes that bypassed the scale
entirely: `0.8125rem` (13px) seven times in `docs.css`, `.doc h2` and `.doc h3`
pinned at `1.5rem` and `1.0625rem`, and a scatter of odd paddings. Those were
folded into the scale in the same pass, under the rule below.

## Every pixel is even, except borders

**No value on this site is an odd number of pixels.** Sizes, padding, margins,
gaps, offsets and radii all land on a 2px grid. The one exception is the border,
which is 1px because that is what a hairline is, and no browser will thank you
for a 2px one.

The rule holds through `rem` too: `0.8125rem` is 13px and is therefore not
allowed, however even it looks written down. Check the resolved pixel value, not
the decimal.

Three idioms are excused because the number is a sentinel rather than a
measurement, and rounding it would break what it is for:

| Value | What it is |
| --- | --- |
| `999px` | `--r-pill`, meaning "fully round", not a radius |
| `-9999px` | the off-screen position of the skip link before focus |
| `1px` / `-1px` | the visually-hidden clip idiom in `.vh` and `.sr-only` |

Sub-pixel letter-spacing (`-0.8px`, `-0.15px`) is optical tracking rather than
layout, and is not covered.

Where a value has a token, use the token: `padding: var(--s-3)` rather than
`padding: 12px`. The scale is even throughout, so staying on it satisfies the
rule for free.

This is checkable, and the check returns **nothing** on a clean tree. The three
filters are, in order: only real declarations (a line with a `;`, which drops
prose in comments that happens to mention a size), then borders and tracking,
then the three sentinels.

```bash
grep -nE "[^0-9.-]-?[0-9]*[13579]px" *.css | grep ';' \
  | grep -vE "border[^-]|border-(top|right|bottom|left|width)|letter-spacing|[^0-9.-]-?(1|999|9999)px"
```

Verified against injected violations: it catches `font-size: 13px` and
`padding: 7px`, and correctly ignores `border: 1px solid red`.

Two rounding notes worth keeping, because both had a right answer and a wrong
one. **A circle is `border-radius: 50%`**, never half the box width, which is how
`3px` on a 6px dot and `5px` on a 10px one used to sneak in. And the permission
toggle went from a 38×22 track with a 3px inset to **40×24 with a 4px inset**,
because that keeps the knob centred *and* keeps its travel at exactly 16px;
nudging only the inset would have decentred it.

Reviewed against <https://impeccable.style/slop/>; the deviations that were made
on purpose are listed at the bottom.

---

## Typeface

Three faces, each with a job. Self-hosted in `fonts/` — the site makes **zero
external requests** at runtime, which is the same promise the extension makes.

| Role | Face | Files | Notes |
| --- | --- | --- | --- |
| Display | **Schibsted Grotesk** | `schibsted-grotesk-latin.woff2` (47 KB), `schibsted-grotesk-latin-ext.woff2` (21 KB) | Variable, 400–900 in one file. Headings and the wordmark. `latin-ext` carries `ō` for "Kōnabe". |
| Body | **System UI stack** | none | Zero bytes, renders instantly, and native text is what a browser utility should look like. |
| Mono | **JetBrains Mono** | `jetbrains-mono-latin.woff2` (31 KB) | Weight 400. Code, labels, eyebrows, file names, metric values. |

Both downloaded faces are SIL Open Font License 1.1.

Deliberately **not** Inter, even though the reference mockup used it: it's the
most over-used face on the web and reads as a template default.

```css
--font-display: "Schibsted Grotesk", system-ui, sans-serif;
--font-body:    system-ui, "Segoe UI Variable Text", -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
```

## Type scale

Only the size is tokenised. Weight, tracking and leading are set per component,
because they legitimately differ between a 72px hero and an 18px card heading,
and pinning them here just produces a table that drifts.

| Token | Size | Used for |
| --- | --- | --- |
| `--fs-hero` | `clamp(2.5rem, 5.6vw, 4.5rem)` → 40–72px | Landing `h1` (weight 900, `-0.025em`, leading 1) |
| `--fs-display` | `clamp(2.5rem, 5.4vw, 3.75rem)` → 40–60px | Doc-page `h1` (600, `-0.03em`, 1.05) |
| `--fs-h2` | `clamp(1.75rem, 3.2vw, 2.5rem)` → 28–40px | Section headings (600, `-0.8px`, 1.1) |
| `--fs-h3` | `1.125rem` → 18px | Card and block headings (600) |
| `--fs-lead` | `clamp(0.9375rem, 1.3vw, 1rem)` → 15–16px | Doc-page intros |
| `--fs-body` | `1rem` → 16px | Body copy, section leads |
| `--fs-sm` | `0.875rem` → 14px | Copy inside cards, table cells, doc prose |
| `--fs-xs` | `0.75rem` → 12px | Mono labels, eyebrows, footnotes |

Negative tracking is applied only at 28px and up, where it's optical correction.
Wide letter-spacing appears only on uppercase mono labels.

**12px is the floor, and `--fs-xs` is the only thing at it.** Nine mono labels
sat at a literal `11px` until 2026-08-11 (`.pd-node-tag`, `.pd-seal`,
`.pd-limits-head`, `.e2ee-tag` and the rest); they were raised together and now
go through the token. No prose is below 14px anywhere.

Every step in the table is an even number of pixels, which is not a coincidence:
see "Every pixel is even, except borders" above. A few literal sizes survive in
`style.css` and `header.css` (`14px`, `16px`, `18px`, `1.25rem`, `1.75rem`), all
of them even and most of them equal to a token. `header.css` is deliberately
token-free so it can stay self-contained, so its literals are by design.

## Color

Cool near-white base, near-black text, one green accent.

### Surfaces and text

| Token | Value | Contrast on `--bg` | Use |
| --- | --- | --- | --- |
| `--bg` | `#f7f8fa` | — | Page base |
| `--bg-card` | `#ffffff` | — | Cards, tiles, windows |
| `--bg-panel` | `#ffffff` | — | The rounded `.panel` shells |
| `--bg-card-sel` | `#e7f7ef` | — | Table header row, the sealed sample row |
| `--border` | `#e6e8eb` | — | Default borders |
| `--border-hair` | `#ececef` | — | Hairlines and the table shell |
| `--border-strong` | `#d7dbe0` | — | Button outlines, dashed boundaries |
| `--fg` | `#11151a` | 17.2 : 1 | Body and headings |
| `--fg-muted` | `#5b6470` | 5.6 : 1 | Secondary copy, mono labels, footnotes |

There are two text tones, not three. `--fg-muted` is deliberately darker than
the reference mockup's `#8a929e`, which measures 2.96 : 1 and fails WCAG AA for
the small text it was used on. `#5b6470` clears 4.5 : 1 everywhere it lands:
5.64 : 1 on `--bg`, 6.00 : 1 on `--bg-card`, 5.41 : 1 on `--bg-card-sel`.

### The dark panel

| Token | Value | Contrast on `--d-card` | Use |
| --- | --- | --- | --- |
| `--d-bg` | `#0f1216` | — | The Code panel base |
| `--d-card` | `#161a20` | — | The code window inside it |
| `--d-border` | `#2a2f37` | — | Its edges |
| `--d-fg` | `#e6e9ee` | 14.4 : 1 | Headings and code |
| `--d-fg-muted` | `#97a0ad` | 6.6 : 1 | Secondary copy on dark |
| `--d-accent` | `#34d399` | 9.4 : 1 | The eyebrow on dark |
| `--d-subtle` | `#828a97` | 5.0 : 1 | The code-window filename |

**`--d-subtle` used to be `#68707d`**, borrowed straight from the light palette,
where that value was chosen as the *darkest* tone that still passes on white. On
a dark background the requirement runs the other way, and it measured 3.49 : 1
behind the 12px filename in the code bar. Do not reuse a light-palette tone on
the dark panel without re-measuring it; the two ramps move in opposite
directions.

### Accent

| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#12b76a` | **Non-text, non-background-for-text only.** Dots, the travelling packet, the dial glyphs |
| `--accent-solid` | `#0b8348` | Any accent-colored **text**, and any fill that carries white text |
| `--accent-link` | `#0e9d5a` | The highlighted words in the hero `h1`, and nothing else |
| `--on-accent` | `#ffffff` | Text on `--accent-solid` |

The brand green fails AA both ways: `#12b76a` as text is 2.47 : 1 on `--bg`, and
white on `#12b76a` is 2.62 : 1. So `--accent` may never carry text and may never
sit behind it. `--accent-solid` is the variant that can do both: 4.54 : 1 on
`--bg`, 4.82 : 1 on white, and 4.82 : 1 the other way with white on top. That
split is the entire reason two tokens exist, and it is the exact bug that shipped
in the comparison table's Konode column until it was refilled with
`--accent-solid`.

**`--accent-link` is the one exception, and it is size-gated.** At 3.30 : 1 on
`--bg` it clears AA for large text only, which is why it appears exclusively
inside the hero `h1` at 40–72px. Do not reuse it at body size.

Primary buttons are **near-black, not green**, since `--fg` on white gives
17 : 1 and is the stronger choice anyway.

## Radius

Content is capped at 16px: cards never get 20px+, because oversized rounding on
a content box is a tell. Full pills are for buttons and chips only.

```css
--r-sm:    8px;   /* inline code, small tags, menu items, the cipher samples */
--r-btn:  12px;   /* buttons, dashed strip, menu panel */
--r-card: 16px;   /* cards, tiles, code window, table shell */
--r-panel: 40px;  /* the full-width .panel shells only */
--r-pill: 999px;  /* chips, the menu toggle, the AES-256-GCM seal */
```

`--r-panel` is the deliberate exception to the 16px cap. It is not a card; it is
a section-sized shell inset 16px from the viewport, and at that scale 40px reads
as the shape of the section rather than as a rounded box. Nothing smaller than a
full-width section may use it.

## Spacing

An 8px-based scale. Items inside a group sit tight, groups separate generously.

```css
--s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
--s-5: 24px;  --s-6: 32px;  --s-7: 40px;  --s-8: 64px;
--s-9: 120px;
```

Sections use `--s-9` vertical padding; headings always get more space above than
below. The scale stops at `--s-9`: there is no `--s-10`, and nothing on the page
needs a gap larger than a section's own padding.

## Layout

The landing page and the doc pages run on different stylesheets and do not share
a container width. Both are correct; they are just different documents.

```css
/* style.css, the landing page */
--maxw: 1216px;    /* page container */
--gutter: 24px;    /* horizontal page padding */

/* docs.css, the four doc pages */
--maxw: 1152px;
--maxw-text: 80ch; /* prose measure on the doc pages */
```

`--gutter` is a token rather than a literal because the mobile menu panel has to
line up with it.

The comparison table and the SyncPacket block scroll inside their own
`overflow-x: auto` containers. The page body never scrolls horizontally at any
width.

The header nav collapses below 900px into a `<details>` disclosure menu, so it
works with no JavaScript. The install CTA stays visible at every width. The
orbit tiles are hidden below 900px, where there's no room beside the text.

## Elevation

Pick an edge **or** a shadow, never both on the same element:

- **Cards, the code window, the CTA panel, the table** → 1px `--border`, no shadow.
- **Orbit tiles, the device card, the menu panel** → shadow only, no border. These
  are the things that genuinely float.

The reference mockup gave its logo tiles both a border and a wide shadow; the
border was dropped.

```css
--shadow-lm:    0 1px 2px rgb(17 21 26 / 0.05), 0 0 0 1px rgb(17 21 26 / 0.06);
--shadow-lm-lg: 0 1px 2px rgb(17 21 26 / 0.04), 0 8px 24px -12px rgb(17 21 26 / 0.12);
--shadow-tile:  0 1px 1px rgb(17 21 26 / 0.04), 0 8px 12px -6px rgb(17 21 26 / 0.12);
```

`--shadow-lm` carries its own hairline in the second layer, so anything using it
already has an edge and must not also declare a `border`.

## Motion

Interaction only. Transitions touch `transform`, `opacity`, `background-color`,
`border-color` and `color` — **never** `width`, `height`, `padding` or `margin`.

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1); /* ease-out-quint */
--dur: 180ms;
```

No spring or elastic easing. No entrance animations: **all content is visible at
rest.** No pulsing dots, no blinking carets, no marquees.

### The dial plate is the one standing exception

The three hero rings rotate continuously, and they keep rotating under
`prefers-reduced-motion: reduce`. That is deliberate: the motion is decorative,
it never flashes, and one full turn takes 105–190 seconds, far slower than the
rate that triggers vestibular discomfort. Everything else on the site still
collapses its transitions under that query.

Each ring is a single animated element and the tiles are plain children, so the
whole dial costs three animations, not fifty. The tiles keep the seat rotation
(`--a`) rather than cancelling it, so the logos tilt with the ring exactly as
they do in the Figma. Do not add a counter-rotation.

### The packet on the data path

The Privacy section's diagram sends a small dot from the browser node to the
storage node every 3.6 seconds. It passes **behind** the `AES-256-GCM` pill and
out the other side, which is the argument the pill is making: the data is
sealed on the way out rather than parked anywhere. The pill is opaque for
exactly this reason, so the dot disappears into it and re-emerges. Like the
dial, it keeps running under `prefers-reduced-motion: reduce`.

The pill used to read `No Konode server`, and the absence of a middle box was
its whole point. That claim now lives in the copy above the diagram instead
(`.pd-sub`), which is where it has to stay: the diagram no longer asserts it
visually, so nothing else may quietly drop it.

This is the outer edge of what the motion rules above allow, and it is allowed
only because the movement carries the meaning. A second decorative loop
anywhere on the page would not be.

### Scaling the dial

One custom property, `--k` on `.dial`, scales the whole thing. Every dimension
is written as `calc(<desktop px> * var(--k))`: the three radii, the three tile
sizes, the ring offsets, the dial height and its top margin. A breakpoint sets
`--k` and nothing else, so the proportions cannot drift apart.

| Width | `--k` | Dial height | Tiles (big / middle / small) |
| --- | --- | --- | --- |
| default | 1 | 620px | 154 / 122 / 90 |
| ≤ 1200px | 0.8 | 496px | 123 / 98 / 72 |
| ≤ 900px | 0.62 | 384px | 95 / 76 / 56 |
| ≤ 640px | 0.44 | 273px | 68 / 54 / 40 |
| ≤ 360px | 0.36 | 223px | 55 / 44 / 32 |

Spin durations stay fixed at every size, so a smaller dial turns at the same
pace rather than looking faster. The 1px tile border and the tile shadow are
also left unscaled, which keeps the hairline crisp on small screens.

---

## Rules we're holding

- **One script, external, no inline handlers.** `konode.js` swaps the install
  CTA between the Chrome Web Store and AMO, and drives the permission toggles in
  the Privacy section. Plus a JSON-LD data block, which is non-executable and so
  needs no hash. Everything else is CSS. This is what lets `vercel.json` ship a
  strict CSP with `script-src 'self'`.
- **Zero inline styles.** Including the orbit tile positions, which are classes
  (`.p1`–`.p6`) precisely so the CSP can forbid inline styles outright.
- **No decorative anything** beyond the orbit rings: no grid-line background, no
  radial glow, no glassmorphism, no gradient stripes, no gradient text, no
  side-tab accent borders.
- **Accurate iconography only.** The reference mockup's Chrome, Firefox and Brave
  logos were hand-approximated and did not match the real marks, so they were
  dropped rather than shipped wrong. The orbit now carries the storage
  destinations (Drive, GitHub, Nextcloud, a generic WebDAV server) plus two
  concept glyphs, all either correct brand paths or plainly generic.
- **No overlapping tiles.** There is no bottom-centre orbit position because the
  device card sits there and a tile covered it.
- **No placeholder `<img>`.** The hero visual is a real, hand-built replica of the
  extension popup; see the swap note in `index.html`.
- **Copy discipline.** **No em dashes anywhere.** Use a period or a comma
  instead. This is checkable: `grep -c "—" *.html` must return 0. No buzzwords. No aphoristic
  "not this. that." cadence. Claims are limited to what the Konode README
  actually documents, and the SyncPacket example is labelled illustrative.

### Deviations, knowingly

- **Repeated mono eyebrows** (`WHAT SYNCS`, `YOUR STORAGE`, …) and the **hero
  chip** are both on the guidelines' avoid-list. They're kept because they're
  load-bearing to the requested design's structure. If you ever want to drop
  them, the `h2`s stand on their own and nothing else has to change.
- **Two 2-up card grids** (what-syncs, privacy) are close to the "identical card
  grids" pattern. They're differentiated by treatment — hairline-divided cells
  versus separated bordered cards — rather than by layout.
