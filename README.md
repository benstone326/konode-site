# konode-site

The public website for **[Konode](https://github.com/benstone326/Konode)**, a
privacy-first browser-sync extension (bookmarks, tabs, history, and the extension
list to storage you own; no server, no telemetry).

Static HTML and CSS. **No build step, no dependencies, no JavaScript, and zero
external requests** — the fonts are self-hosted, so the site makes the same
promise the extension does.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page |
| `setup.html` | Setup guide: installing, connecting each backend, encryption, second device |
| `troubleshooting.html` | Common failures and fixes |
| `roadmap.html` | What's shipped, in progress, planned, and explicitly not planned |
| `privacy.html` | Privacy policy — the URL used by the Google OAuth consent screen and the Chrome Web Store listing |

Supporting files: `style.css`, `fonts/` (3 woff2, 99 KB total), `icon.svg`,
`icon128.png`, `wordmark.svg`, `sitemap.xml`, `robots.txt`.

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
  loosened deliberately rather than by accident.
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

Currently **`https://konode.vercel.app`**. Every `<link rel="canonical">`, every
`og:url`, the JSON-LD `url`, `sitemap.xml`, and `robots.txt` point there. A
canonical must match where the site is actually served, or search engines will
not index it.

### Moving to konode.app later

Add the domain in Vercel and set it as the **production** domain — Vercel then
308-redirects `konode-site.vercel.app` to it automatically, so there's no
duplicate-content window. Then repoint the plumbing:

```bash
grep -rl 'konode\.vercel\.app' --include='*.html' --include='*.xml' --include='*.txt' . | xargs sed -i 's|konode\.vercel\.app|konode.app|g'
```

That deliberately leaves `mailto:` addresses alone, since the contact address is
not necessarily on the same domain. Check it separately.

Afterwards, update the **Google OAuth consent screen** and the **Chrome Web Store
listing**, both of which point at the privacy-policy URL, and resubmit the
sitemap in Search Console.

A project subpath like `benstone326.github.io/konode-site/` is the weakest option
for search; a real domain is what actually matters.

## Before launch

- [ ] **Contact email in `privacy.html` is `hello@konode.org`** — confirm that address exists, or change it. It's the only contact route in the policy and it's linked from the OAuth consent screen.
- [ ] Point the OAuth consent screen and Chrome Web Store listing at the current privacy-policy URL.
- [ ] Replace the hand-built popup mockup in `index.html` with real screenshots (see the `PRODUCT VISUAL` comment in that file).
- [ ] Re-check the comparison table in `index.html` against each competing project's current documentation.
- [ ] Add an OG image and a `<meta property="og:image">` tag — link previews are currently text-only.
