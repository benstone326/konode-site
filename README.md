# konode-site

The public website for **[Konode](https://github.com/benstone326/Konode)** — a
privacy-first browser-sync extension (bookmarks, tabs, history & the extension list
to storage you own; no server, no telemetry).

Static site, **zero external requests** (self-hosted Inter font, inline brand mark).
Served via GitHub Pages from the repo root.

- `index.html` — landing page
- `privacy.html` — privacy policy (the URL used by the OAuth consent screen + Chrome
  Web Store listing)
- `style.css` — shared styles (light/dark, responsive)

## Deploy (GitHub Pages)

Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`.
Gives `https://benstone326.github.io/konode-site/` immediately.

To use the custom domain later: add a `CNAME` file containing `konode.org` (or set it
under Settings → Pages → Custom domain) and point DNS at GitHub Pages.

## Local preview

```
python -m http.server 5177
```
