# Konode site — design system

The single source of truth for type, color, radius and spacing on this site.
Every value used in `style.css` is declared here. **If you need a value that
isn't in this file, add it here deliberately rather than inventing a one-off.**

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

| Token | Size | Weight | Tracking | Leading | Used for |
| --- | --- | --- | --- | --- | --- |
| `--fs-display` | `clamp(2.5rem, 5.4vw, 3.75rem)` → 40–60px | 600 | `-0.03em` | 1.05 | Hero `h1` |
| `--fs-h2` | `clamp(1.875rem, 3.4vw, 2.5rem)` → 30–40px | 600 | `-0.02em` | 1.1 | Section headings |
| `--fs-h3` | `0.9375rem` → 15px | 600 | `-0.01em` | 1.35 | Card headings |
| `--fs-lead` | `clamp(0.9375rem, 1.3vw, 1rem)` → 15–16px | 400 | `0` | 1.65 | Hero and section intros |
| `--fs-body` | `1rem` → 16px | 400 | `0` | 1.65 | Body copy |
| `--fs-card` | `0.875rem` → 14px | 400 | `0` | 1.65 | Copy inside cards |
| `--fs-label` | `0.75rem` → 12px | 400 | `0.1–0.18em` | — | Mono labels, eyebrows, proof strip |

Nothing on this site is below 12px, and 12px is used only for mono labels, never
for prose. Negative tracking is applied only at 30px and up, where it's optical
correction. Wide letter-spacing appears only on uppercase mono labels.

The reference mockup set eyebrows and the proof strip at 11px; both were raised
to 12px, which is the floor the guidelines allow.

## Color

Cool near-white base, near-black text, one green accent.

### Surfaces and text

| Token | Value | Contrast on `--bg` | Use |
| --- | --- | --- | --- |
| `--bg` | `#f7f8fa` | — | Page base |
| `--surface` | `#ffffff` | — | Cards, tiles, windows |
| `--surface-2` | `#fbfbfc` | — | Proof strip, hover fills, inline code |
| `--border` | `#ececef` | — | Default borders and hairlines |
| `--border-strong` | `#dfe1e6` | — | Button outlines, hover borders |
| `--fg` | `#11151a` | 16.1 : 1 | Body and headings |
| `--fg-muted` | `#5b6470` | 5.6 : 1 | Secondary copy |
| `--fg-subtle` | `#68707d` | 4.6 : 1 | Mono labels, metric values, footer fine print |

**`--fg-subtle` is deliberately darker than the reference mockup's `#8a929e`.**
That value measures 2.96 : 1, which fails WCAG AA for the small text it was used
on (proof strip, device-card values, auth labels, footer). `#68707d` is the
lightest value that still clears 4.5 : 1.

### Accent

| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#12b76a` | **Non-text only** — dots, the orbit arc, the callout rule, shield icons |
| `--accent-text` | `#0a7a43` | Any accent-colored **text**: eyebrows, links, `Planned`, the E2EE badge |
| `--accent-tint` | `#e7f8f0` | Tinted backgrounds behind the badge and the `self` table column |

The brand green fails AA as text (2.4 : 1 on white), so text uses the darkened
variant: 5.1 : 1 on `--bg`, 5.4 : 1 on white, 4.8 : 1 on `--accent-tint`. That
split is the entire reason both tokens exist.

Primary buttons are **near-black, not green** — white on `#12b76a` is 2.4 : 1 and
would fail. `--fg` on white gives 16 : 1 and is the stronger choice anyway.

## Radius

Capped at 16px. Cards never get 20px+; oversized rounding is a tell. The
reference used 16px cards and a 24px CTA panel — the panel was brought down to
16px for consistency. Full pills are for buttons and chips only.

```css
--r-sm:   8px;   /* inline code, small tags, menu items */
--r-md:  12px;   /* buttons, dashed strip, menu panel */
--r-lg:  16px;   /* cards, tiles, code window, CTA panel */
--r-pill: 999px; /* chips and the menu toggle only */
```

## Spacing

An 8px-based scale. Items inside a group sit tight, groups separate generously.

```css
--s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
--s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;
--s-9: 96px;  --s-10: 128px;
```

Sections use `--s-9` vertical padding; headings always get more space above than
below.

## Layout

```css
--maxw: 1152px;    /* page container */
--maxw-text: 68ch; /* prose on the doc pages — keeps lines in the 65–75ch range */
--gutter: 24px;    /* horizontal page padding, 20px below 480px */
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
--lift:    0 1px 2px rgb(17 21 26 / 0.04), 0 8px 24px -12px rgb(17 21 26 / 0.12);
--lift-lg: 0 1px 2px rgb(17 21 26 / 0.04), 0 20px 50px -30px rgb(17 21 26 / 0.25);
```

## Motion

Interaction only. Transitions touch `transform`, `opacity`, `background-color`,
`border-color` and `color` — **never** `width`, `height`, `padding` or `margin`.

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1); /* ease-out-quint */
--dur: 160ms;
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
