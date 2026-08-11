# Konode site — review findings (2026-07-27)

Review of the redesigned site (index + setup/roadmap/troubleshooting/privacy,
style.css, DESIGN.md, vercel.json, robots/sitemap, fonts). Overall the design is
strong: WCAG-checked contrast, self-hosted fonts, zero-JS, strict CSP. Most items
below are content/accuracy/polish, not structural. Priority: **[H]igh / [M]ed / [L]ow.**

> **Status: historical record, not a live checklist.** This is the review exactly as
> written on 2026-07-27, kept because `README.md` tracks against it. It has not been
> re-run, and events have overtaken several findings: Firefox shipped on Firefox
> Add-ons on 2026-08-04, the canonical repository was settled as
> `konabe-studio/konode`, the site now serves from `konode.org`, and the header was
> redesigned since. **The current open items are the "Before launch" list in
> `README.md`**, which is maintained. Read what follows for the reasoning behind each
> finding rather than for its status.

## A. Content & factual accuracy (highest external-nitpick risk)

- **[H] Firefox is overclaimed on the homepage but honest on the subpages.**
  Proof strip says "Chromium + Firefox" (index.html:178) and the JSON-LD
  `operatingSystem` lists Firefox (index.html:28–29) — implying shipped Firefox
  support. setup/roadmap/troubleshooting correctly say it's a dev build only (no
  AMO listing; temporary add-on removed on restart). Reconcile: qualify the
  homepage ("Chromium today; Firefox in beta") to match the honest subpages.
- **[H] Comparison table competitor claims** (index.html:349–403). Every
  Floccus / Raindrop.io / xBrowserSync / built-in-sync cell is a claim about
  another project and the most likely "that's wrong" target. Re-verify each vs
  current docs — especially Floccus backends + "E2EE on WebDAV and Drive", and
  built-in "Firefox yes, Chrome optional". The "compared July 2026, check sources"
  hint is good but won't excuse an error.
- **[M] JSON-LD `operatingSystem: "Chrome, Brave, Edge, Firefox"`** — drop Firefox
  (or mark beta) per the item above. Edge is fine (Chromium).
- **[M] Hero device replica shows fabricated status** ("MacBook · this device ·
  Synced 42s ago · 312 items · 18 tabs · E2EE", index.html:152–166). Fine as an
  illustrative visual, but it's not marked decorative, so a screen reader reads it
  as real data. Add `aria-hidden="true"` (like the orbit).
- **[L] JSON sample field names** (index.html:321–328: device/type/updated/e2ee)
  differ from the real SyncPacket (version/device_id/timestamp/data_type/
  encrypted). Labelled "illustrative", so acceptable — but matching the real names
  avoids a "not the real schema" nit.

## B. Fonts & type

- **[OK] Fonts are correct** — 3 self-hosted files present, `@font-face` + preload
  match, OFL. No bug.
- **[L] Only the display font is preloaded** (index.html:12). JetBrains Mono is
  used above the fold (chip, proof strip); consider preloading it too, or accept a
  brief swap.
- **[L] `font-display: swap`** can flash the system fallback for the wordmark on
  first load. `optional` avoids the shift if that bothers you (judgment call).

## C. Accessibility

- **[M] Device replica read as real** — see item A/4 (aria-hidden).
- **[L] Two `<nav aria-label="Main">`** (desktop + mobile menu, index.html:45/53) —
  duplicate landmark labels. Give the menu panel a distinct label.
- **[OK]** Skip link, table caption + scope, DESIGN.md-verified contrast, no-JS
  `<details>` menu — all good.

## D. SEO / social / meta

- **[M] No `og:image` / `twitter:image`** — link shares render with no preview
  image. Add a self-hosted OG image (respects `img-src 'self'`).
- **[L] `theme-color` is light-only** (#f7f8fa) and the site has no dark-mode
  styles (the extension does). Confirm the site is intentionally light-only.
- **[L] Domain is hardcoded** as `konode.vercel.app` in canonical / OG / sitemap /
  JSON-LD — correct now, but update in one pass when the real domain lands.

## E. Security / CSP / config

- **[OK] `connect-src 'none'`** and **`cleanUrls: false`** — no longer relevant.
  The uninstall-feedback form was dropped (feedback is now pull-only: GitHub issues
  + a mailto in the extension's Settings). With no page doing `fetch`, the strict
  `connect-src 'none'` is a clean plus, not a blocker. Nothing to change.
- **[M] JSON-LD under `script-src 'self'`** — verify the browser console shows no
  CSP violation for the inline `<script type="application/ld+json">` block
  (non-executable data blocks are normally allowed). If it complains, add a sha256
  hash to `script-src`.
- **[L] `form-action 'none'`** is fine while the form uses JS `fetch`, brittle if a
  native submit ever happens.
- **[OK]** HSTS / nosniff / frame-ancestors / permissions-policy are good. Add
  `includeSubDomains` to HSTS once on the real domain.

## F. Consistency

- **[M] GitHub URL** — the site uses `github.com/benstone326/Konode` (×20). Confirm
  this is canonical; the extension's store listing / privacy policy reference
  `konabe-studio/konode`. Pick ONE (org + casing) and use it everywhere: site,
  extension README, store listing, OAuth consent screen.
- **[M] Contact `hello@konode.org`** (privacy.html:120) and any `konode.org`
  references — the live domain is `konode.vercel.app`; `konode.org` isn't set up
  yet, so the mailbox/links may not work. Use a working contact until the domain
  lands.

## G. Feedback — decided: pull-only, no site work needed

The uninstall survey (auto-opening form + Supabase collector) was **dropped**
on purpose. An auto-opening page on uninstall is an involuntary phone-home: it
reaches our host (IP + user-agent) whether or not the user fills anything in, and
"no server, no telemetry" is Konode's strongest claim — worth more than the small
amount of exit feedback. A disclosure in the policy doesn't turn an automatic
action into consent.

Feedback is now **pull-only**, already shipped in the extension (Settings →
Advanced → Feedback): a GitHub-issues link and a `mailto:`. Nothing opens or is
sent unless the user clicks, and Konode runs no database.

Consequences for this site:

- **No** `goodbye.html`, **no** `api/feedback.js`, **no** Supabase. (The Supabase
  project and its Vercel env vars can be deleted.)
- **Keep** `privacy.html`'s absolute wording — "we do not run any servers, we do
  not have a database" is accurate again; no caveat needed.
- Optional: add the same two feedback links (GitHub issues + email) to the site
  footer for parity with the extension.
