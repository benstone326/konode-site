#!/usr/bin/env node
/**
 * Rewrites the store-status strip in roadmap.html from data/status.json, after
 * refreshing that file from live sources. No part of it is maintained by hand.
 *
 * Where each number comes from:
 *
 *   - Firefox Add-ons publishes what it serves through a public read API.
 *   - The Chrome Web Store has no read API, but every Chrome install asks the
 *     update endpoint below which version it should be running. That is a
 *     versioned protocol rather than page markup, and its answer is the number
 *     that actually matters: what a browser would install right now.
 *   - The newest release tag comes from GitHub.
 *
 * That endpoint answers HTTP 200 for an extension that no longer exists, and its
 * XML declaration carries a version="1.0" of its own, so a careless read of it
 * yields "1.0" for a delisted extension. Both the shape and the value are checked
 * before anything reaches the page: being a day late still beats publishing a
 * version number that is wrong.
 *
 * roadmap.html is the only page on the site that names a version. Everything else
 * describes the stores without a number, which is why this touches one file.
 *
 *   node scripts/sync-status.mjs            rewrite the page and the data file
 *   node scripts/sync-status.mjs --check    exit 1 if either is out of date
 */
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const STATUS_FILE = new URL("data/status.json", root);
const PAGE_FILE = new URL("roadmap.html", root);

const AMO = "https://addons.mozilla.org/api/v5/addons/addon/konode/";
const LATEST_RELEASE = "https://api.github.com/repos/konabe-studio/konode/releases/latest";

/* prodversion is required: without it the endpoint replies "noupdate" and no
   version at all. It is deliberately set past any real Chrome, so that a
   minimum_chrome_version on some future release cannot quietly hand us an older
   CRX than an up-to-date browser would install. */
const cwsUpdate = (id) =>
  "https://clients2.google.com/service/update2/crx" +
  `?response=updatecheck&prodversion=999.0&acceptformat=crx3&x=id%3D${id}%26uc`;

const UA = { "user-agent": "konode-site status sync" };
const checkOnly = process.argv.includes("--check");

async function fetchText(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url} answered ${res.status} ${res.statusText}`);
  return res.text();
}

const fetchJson = async (url) => JSON.parse(await fetchText(url));

/** Everything below is interpolated into a live page, and all of it came from an API. */
const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const version = (label, value) => {
  if (!/^\d+(\.\d+){0,3}$/.test(String(value))) {
    throw new Error(`${label} reported "${value}", which is not a version number.`);
  }
  return String(value);
};

/** Read from the listing URL rather than stored beside it, so the link a reader
    clicks and the number under it cannot end up describing two extensions. */
function extensionId(listingUrl) {
  const id = new URL(listingUrl).pathname.split("/").filter(Boolean).pop();
  if (!/^[a-p]{32}$/.test(id ?? "")) {
    throw new Error(`No extension id in ${listingUrl}. Refusing to guess it.`);
  }
  return id;
}

async function chromeVersion(listingUrl) {
  const xml = await fetchText(cwsUpdate(extensionId(listingUrl)));
  // Scoped to the <updatecheck> element on purpose. See the note above about the
  // XML declaration: an unscoped version="..." search finds that instead.
  const found = xml.match(/<updatecheck\b[^>]*\bversion="([^"]+)"/);
  if (!found) {
    const status = xml.match(/<app\b[^>]*\bstatus="([^"]+)"/)?.[1] ?? "no status given";
    throw new Error(
      `The Chrome Web Store update endpoint returned no version (app status: ${status}). ` +
        "Refusing to guess what the listing serves.",
    );
  }
  return version("The Chrome Web Store update endpoint", found[1]);
}

const before = await readFile(STATUS_FILE, "utf8");
const status = JSON.parse(before);

const [amo, release, chrome] = await Promise.all([
  fetchJson(AMO),
  fetchJson(LATEST_RELEASE),
  chromeVersion(status.chrome.url),
]);
status.firefox.version = version("Firefox Add-ons", amo.current_version.version);
status.chrome.version = chrome;
status.latestRelease = release.tag_name;

const fx = status.firefox;
const cr = status.chrome;

/* A row per store, because the question a reader has is "what will I get if I
   install right now", and that is a version number per store. Both numbers now
   come from the store itself, so there is nothing left to caption: a state
   column would read "live" on every row of every run, and which release a store
   is still working through is our problem rather than the reader's. */
const rows = [
  { name: "Firefox Add-ons", url: fx.url, serving: fx.version },
  { name: "Chrome Web Store", url: cr.url, serving: cr.version },
];

const block =
  `<ul class="stores">` +
  rows
    .map((r) => `<li><a href="${esc(r.url)}">${esc(r.name)}</a><b>${esc(r.serving)}</b></li>`)
    .join("") +
  `</ul>`;

const html = await readFile(PAGE_FILE, "utf8");
const fence = /(<!-- status:start[^>]*-->)[\s\S]*?(<!-- status:end -->)/;
if (!fence.test(html)) {
  throw new Error(
    "roadmap.html has no <!-- status:start --> … <!-- status:end --> fence. " +
      "Refusing to guess where the strip belongs.",
  );
}
// Match the file's own line endings. A Windows checkout of this repo is CRLF, CI is
// LF, and writing the wrong one makes the page differ from itself on every run.
const eol = html.includes("\r\n") ? "\r\n" : "\n";
const nextHtml = html.replace(
  fence,
  (_match, open, close) => `${open}${eol}          ${block}${eol}          ${close}`,
);

// checkedOn is written only when something else moved, so an unchanged day does
// not produce a commit whose entire content is a new date.
const withoutDate = JSON.stringify(status, null, 2) + "\n";
const changed = nextHtml !== html || withoutDate !== before;

/* Informational only, and it clears itself. A store that is a release behind is
   either still reviewing or still uploading, and either way the strip already
   says the true thing: what that store hands out today. */
const releaseVersion = status.latestRelease.replace(/^v/, "");
for (const [label, serving] of [
  ["Firefox Add-ons", fx.version],
  ["Chrome Web Store", cr.version],
]) {
  if (serving !== releaseVersion) {
    console.warn(
      `note: ${label} serves ${serving}, and ${releaseVersion} is released. ` +
        "Nothing to do; the strip follows the store.",
    );
  }
}

if (checkOnly) {
  console.log(changed ? "roadmap.html is out of date." : "roadmap.html is current.");
  process.exit(changed ? 1 : 0);
}

if (!changed) {
  console.log("Nothing moved.");
  process.exit(0);
}

status.checkedOn = new Date().toISOString().slice(0, 10);
await writeFile(PAGE_FILE, nextHtml);
await writeFile(STATUS_FILE, JSON.stringify(status, null, 2) + "\n");
console.log(`Updated: Firefox ${fx.version}, Chrome ${cr.version}, latest release ${status.latestRelease}.`);
