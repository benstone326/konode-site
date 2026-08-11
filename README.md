# konode-site

The public website for **[Konode](https://github.com/konabe-studio/konode)**, a
privacy-first browser-sync extension (bookmarks, tabs, history, and the extension
list to storage you own; no server, no telemetry).

Static HTML and CSS. **No build step, no dependencies, and zero external
requests** — the fonts and logos are self-hosted, so the site makes the same
promise the extension does.

The only script is `konode.js` (~1 KB), which swaps the install CTA between the
Chrome Web Store and AMO based on the visitor's browser. It is an external file
with no inline handlers, so `vercel.json` keeps `script-src 'self'`.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page — rebuilt from Figma (`QFxxUawJu5bwrCRZ8u1aSg`, node `59:65`), styled by `style.css` |
| `setup.html` | Setup guide: installing, connecting each backend, encryption, second device |
| `troubleshooting.html` | Common failures and fixes |
| `roadmap.html` | What's shipped, in progress, planned, and explicitly not planned |
| `privacy.html` | Privacy policy — the URL used by the Google OAuth consent screen and the Chrome Web Store listing |

The four doc pages still run on `docs.css`, a copy of the previous stylesheet.
Only their header has been redesigned; the body of those pages is untouched.

Stylesheets, and which pages load them:

| File | Loaded by | Contains |
| --- | --- | --- |
| `header.css` | all 5 pages | the floating pill header and mobile menu — self-contained, depends on neither token set |
| `style.css` | `index.html` | the landing page design system, from the Figma variables |
| `docs.css` | the 4 doc pages | the previous stylesheet, minus its old header rules |

Supporting files: `konode.js`, `assets/` (12 brand SVGs exported from Figma),
`fonts/` (3 woff2, 99 KB total), `icon.svg`, `icon128.png`, `wordmark.svg`,
`sitemap.xml`, `robots.txt`.

### The brand mark

`icon.svg` is the **Favicon** component from the Figma dial plate: a `#12b76a`
squircle (48/128 corner radius) with the white Konode glyph at 56% of the tile.
It replaced the old triangle-and-three-nodes mark. `wordmark.svg` and
`icon128.png` are both derived from it, so if the mark changes, regenerate all
three. `icon128.png` was rasterised from `icon.svg` at 128×128.

The hero dial plate carries the eight logos the Figma uses — Drive, **Konode**,
Nextcloud, pCloud, Koofr, Fastmail, WebDAV, GitHub. MEGA is deliberately *not*
in the dial, matching the Figma, since it is not a shipped backend.

### The Privacy section

`#privacy` is the one section not taken from the Figma, which only had a
heading and placeholder cards there (`61:1405`). It has four blocks: who can
see what, where the data travels, a live permission readout, and the limits.

Every claim in it is sourced from a page in this repo, and they have to stay in
step. If any of these change, the section changes with them:

| Claim | Source |
| --- | --- |
| Permissions are requested on enable, not at install | `privacy.html`, "What data Konode accesses" |
| No servers, so nothing to receive your data | `privacy.html`, "Where your data goes" |
| Credentials live in local extension storage | `privacy.html`, "Your credentials" |
| A lost passphrase is unrecoverable | `troubleshooting.html`, "Encryption" |

The permission toggles are the second half of `konode.js`. They bail out on any
page without the form, so the doc pages pay nothing for them.

### Where the product facts come from

`roadmap.html` is a rendering of **`ROADMAP.md` in the extension repo**, and the
Firefox and backend claims on `setup.html`, `troubleshooting.html` and the
landing page follow it. When that file changes, re-read it and update all four
pages together, or they drift apart. They already did once: the site was still
telling Firefox users to build from source and load a temporary add-on months
after 1.2.0 went live on AMO.

MEGA has no storage card on purpose. It is on the roadmap, not shipped, and a
card in that grid reads as an available option no matter what badge it carries.

### The Encryption section

`#encryption` sits between Storage and Privacy and is the one place the page
argues for end-to-end encryption on its own terms. It draws the **boundary**
(what happens inside the browser, and what crosses out of it) rather than the
route, because the data path in `#privacy` already draws the route. Keep it that
way: two browser-to-storage diagrams on one page is one too many.

It also has to keep saying **optional**. Encryption is off until the user sets a
passphrase, and the pill on the data path now reads `AES-256-GCM`, which on its
own would imply always-on. The word "optional" in this section's lead, the "if
you set a passphrase" in the first data-path node, and the "with a passphrase
set" in `.pd-sub` are the three places that stop it being an overclaim. Do not
quietly drop any of them.

That pill used to read `No Konode server`, and its absence-of-a-middle-box
argument is now carried by `.pd-sub` in words. See `DESIGN.md`, "The packet on
the data path".

### Known gaps

- **`DESIGN.md` has drifted from `style.css`.** The doc claims to be the single
  source of truth for every token, but the names and several values no longer
  match what the stylesheet actually declares: `--surface` / `--fg-subtle` /
  `--r-lg` / `--lift` are documented and do not exist, the shipped names are
  `--bg-card` / `--fg-muted` / `--r-card` / `--shadow-lm`, and `--maxw` (1152 vs
  1216), `--s-9` (96 vs 120) and `--dur` (160 vs 180) all disagree. The design
  reasoning in it is still sound and worth reading; the token table is not
  reliable. Reconcile it against `style.css` in one pass.

**[`DESIGN.md`](DESIGN.md) is the design system** — every color, type step,
radius and spacing value the site uses. Read it before changing anything visual,
and add new values there rather than inventing one-offs.

## Local preview

```bash
python -m http.server 5177
```

## Deploy

Pick **one** canonical host. Serving the same content on two domains splits your
SEO signal between them.

### Vercel (recommended)

No build configuration needed. Import the repo, leave the framework preset as
**Other**, and leave the build command empty; `vercel.json` handles the rest.

What `vercel.json` does, and why:

- **Strict `Content-Security-Policy`.** Only possible because the site has no
  JavaScript and no inline `style=` attributes. If you ever add either, this
  header will block it — that's the point, but it means the CSP has to be
  loosened deliberately rather than by accident. Verified that the inline
  `<script type="application/ld+json">` block does **not** violate
  `script-src 'self'` (non-executable data blocks are exempt), so it needs no
  hash. `connect-src` is `'none'` because nothing on the site makes requests; it
  has to become `'self'` the moment any page does a `fetch`.
- **`cleanUrls: false`.** Turning it on would 308-redirect `/privacy.html` to
  `/privacy`, and that URL is registered with the Google OAuth consent screen and
  the Chrome Web Store listing.
- **`Strict-Transport-Security: max-age=31536000`** — one year, no
  `includeSubDomains`, no `preload`. Browsers will refuse plain HTTP on the
  domain for a year after a visit.
- **Immutable caching on `fonts/`**, one-day revalidation on CSS and images, and
  `max-age=0, must-revalidate` on HTML so content edits go live immediately.

Note that `vercel.json` is schema-validated on deploy and rejects unknown
properties, so it can't carry `//` comment keys. Explanations live here instead.

### GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`. The
`.nojekyll` file is already present. Gives
`https://benstone326.github.io/konode-site/` immediately.

Note that Pages ignores `vercel.json`, so you get none of the security or caching
headers there.

## Canonical domain

**`https://konode.org`**, and the site is served there today. Every
`<link rel="canonical">`, every `og:url`, the JSON-LD `url`, `sitemap.xml`, and
`robots.txt` point at it, with no `konode.vercel.app` left in the HTML. A
canonical must match where the site is actually served, or search engines will
not index it.

Vercel 308-redirects the `.vercel.app` name to the production domain on its own,
so there is no duplicate-content window to manage.

### If the domain ever moves again

Repoint the plumbing in one pass:

```bash
grep -rl 'konode\.org' --include='*.html' --include='*.xml' --include='*.txt' . | xargs sed -i 's|konode\.org|the-new-domain|g'
```

Check `mailto:` addresses separately — that command rewrites them too, and the
contact address is not necessarily on the same domain as the site.

Afterwards, update the **Google OAuth consent screen** and the **Chrome Web Store
listing**, both of which point at the privacy-policy URL, and resubmit the
sitemap in Search Console.

A project subpath like `benstone326.github.io/konode-site/` is the weakest option
for search; a real domain is what actually matters.

## Before launch

Tracked against `SITE-REVIEW.md`. Open items only:

- [ ] **Contact email `hello@konode.org`.** The domain is live now, so the address
      at least looks right, but that says nothing about MX records. Send a test mail
      to it and confirm something arrives. GitHub issues is offered alongside it in
      the policy, so a dead mailbox is not a dead end, but it is still a broken
      promise on the privacy policy.
- [ ] **OG image** — add a self-hosted image plus `og:image` / `twitter:image`, and
      switch `twitter:card` to `summary_large_image`. Previews are text-only today.
- [ ] **Real product screenshots.** The page currently shows no picture of the
      extension anywhere. The hero is the dial plate, and the hand-built popup
      replica this item used to point at was removed in the redesign, along with
      the `PRODUCT VISUAL` comment it referenced. The natural home is the "What
      syncs" section, one capture per stream. Needs real captures from the
      extension; nothing here can be hand-built without becoming a mockup again.
- [ ] Add `includeSubDomains` to the HSTS header. The real domain is live, so this
      is now actionable — but it commits every `konode.org` subdomain to HTTPS for a
      year, so add it only once you know nothing plain-HTTP needs to live under one.
- [ ] Re-check the comparison table periodically; it is dated in the page itself.

Decided, for the record:

- **Canonical GitHub URL is `konabe-studio/konode`.** Both that and
  `benstone326/Konode` exist and are public; the site was moved onto
  `konabe-studio/konode` (26 links) because the extension repo, its store listing
  and its privacy policy already use it. Nothing to change on the extension side.
- **Site is light-only.** No dark-mode styles and a light-only `theme-color`
  (`#f7f8fa`, matching `--bg`), even though the extension has dark mode.
  Deliberate, not an oversight.
- **`font-display: swap`** kept over `optional`. `optional` would more often drop
  the webfont entirely on a slow first load; a brief swap is the better trade for a
  text-heavy site.
- **Raindrop.io dropped from the comparison.** Its pricing page 404s and the claims
  could not be verified, and it's a bookmark manager rather than a browser-sync
  tool. The decision was recorded here well before the column actually came out of
  the table; it is out now, leaving four columns. Floccus and xBrowserSync claims
  were re-verified against their own sites on 27 July 2026.
- **The Konode column contrast is fixed.** It filled with `--accent` (`#12b76a`),
  which measured 2.6 : 1 against its white text and failed WCAG AA. It now fills
  with `--accent-solid` (`#0b8348`), at 4.8 : 1.
