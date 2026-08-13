---
description: Rebuild roadmap.html, and the pages that follow it, from the extension repo's ROADMAP.md and CHANGELOG.md
---

Bring this site back in step with the extension repo's documentation.

## Read the source, not the local checkout

Read `ROADMAP.md` and `CHANGELOG.md` from **`konabe-studio/konode`, branch `main`**, over
the network:

- `https://raw.githubusercontent.com/konabe-studio/konode/main/ROADMAP.md`
- `https://raw.githubusercontent.com/konabe-studio/konode/main/CHANGELOG.md`

Do **not** read them from a local clone. That checkout has been 33 commits behind with
uncommitted hand-edits that described an older release, and updating the site from it
would have written the roadmap backwards.

`.upstream/ROADMAP.md` and `.upstream/CHANGELOG.md` are the copies the site was last
written against. Diff the fresh files against those to see exactly what moved; that is
usually a much smaller read than the whole document.

## Separate shipped from landed

The single thing this page gets wrong when it goes wrong: **the site says "shipped" only
about a version a user can actually install.** Work that is merged on `main` but not in a
release belongs under Planned, with the version it is due in.

`CHANGELOG.md` marks this for you — anything under `## [Unreleased]` is not shipped. A
ROADMAP bullet can be subtler: "finished on `main` after 1.2.1" means not shipped.

Check store reality too. The two listings routinely sit a patch apart while a Chrome Web
Store review clears, so "1.2.1 is out" and "1.2.1 is what users have" are different
claims.

## What to update

1. **`roadmap.html`** is the page. Cards carry a badge: `st-shipped` (Shipped),
   `st-beta` (Works — real but not a tested-every-release target), `st-planned`
   (Planned), `st-no` (No, and not coming).
   - Do not hand-edit inside the `<!-- status:start -->` fence. That paragraph is
     generated; change `data/status.json` and run `node scripts/sync-status.mjs`.
   - Version numbers appear on this page only. Keep them off the others.
2. **`index.html`**, **`setup.html`**, **`troubleshooting.html`** follow it. If a claim
   about browsers, backends or store state changed, they change together, or they drift
   apart. They already did once: the site told Firefox users to build from source for
   months after the add-on was live on AMO.
3. **`data/status.json`** if a store version moved. The Chrome half is hand-maintained,
   including `inReview`; the Firefox half is refetched by the script.

## House style

American English. No em dashes or en dashes anywhere a visitor reads. Possessive `'s` is
dropped in constructions like "the browser own OAuth bridge" — match the surrounding
copy rather than correcting it. Cards state what is true and what is not, in that order,
and prefer a specific fact over a reassuring one. Avoid numbers that decay, like a
translation percentage, unless the number is the point.

## Finish

Run `node scripts/sync-status.mjs` and `node scripts/check-upstream.mjs --accept`. The
second one stores the fresh upstream files as the new baseline, which is what stops the
drift workflow from filing the same issue again.

Then show the diff. Do not commit or push unless asked.
