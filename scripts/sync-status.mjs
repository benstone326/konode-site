#!/usr/bin/env node
/**
 * Rewrites the store-status paragraph in roadmap.html from data/status.json,
 * after refreshing the machine-readable half of that file from live sources.
 *
 * Which half is which, and why:
 *
 *   - Firefox Add-ons publishes the version it serves through a public read API,
 *     so `firefox.version` is fetched. So is the newest release tag on GitHub.
 *   - The Chrome Web Store has no public read API. Reading a listing means
 *     scraping a page whose markup is not a contract, and being wrong about which
 *     version users are running is worse than being a day late. So `chrome` is
 *     maintained by hand, and this script only says when it has fallen behind.
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

const checkOnly = process.argv.includes("--check");

async function json(url) {
  const res = await fetch(url, { headers: { "user-agent": "konode-site status sync" } });
  if (!res.ok) throw new Error(`${url} answered ${res.status} ${res.statusText}`);
  return res.json();
}

/** Everything below is interpolated into a live page, and some of it came from an API. */
const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const before = await readFile(STATUS_FILE, "utf8");
const status = JSON.parse(before);

const [amo, release] = await Promise.all([json(AMO), json(LATEST_RELEASE)]);
status.firefox.version = amo.current_version.version;
status.latestRelease = release.tag_name;

const fx = status.firefox;
const cr = status.chrome;
const fxLink = `<a href="${esc(fx.url)}">Firefox Add-ons</a>`;
const crLink = `<a href="${esc(cr.url)}">Chrome Web Store</a>`;

let sentence;
if (cr.version === fx.version) {
  sentence =
    `Version ${esc(fx.version)} serves both stores: the ${crLink} listing, published ` +
    `${esc(cr.publishedOn)}, and ${fxLink}, listed since ${esc(fx.listedSince)}. ` +
    `Nothing is waiting on a submission.`;
} else if (cr.inReview) {
  sentence =
    `Version ${esc(fx.version)} serves ${fxLink}, listed there since ${esc(fx.listedSince)}. ` +
    `The ${crLink} listing, published ${esc(cr.publishedOn)}, serves ${esc(cr.version)} until ` +
    `${esc(fx.version)} clears review, and Chrome updates itself once it does. ` +
    `Nothing is waiting on us.`;
} else {
  // Behind and not submitted is a different sentence, because "clears review"
  // would be a claim about work that has not been started.
  sentence =
    `Version ${esc(fx.version)} serves ${fxLink}, listed there since ${esc(fx.listedSince)}. ` +
    `The ${crLink} listing, published ${esc(cr.publishedOn)}, serves ${esc(cr.version)}: ` +
    `${esc(fx.version)} has not been submitted there yet.`;
}

const html = await readFile(PAGE_FILE, "utf8");
const fence = /(<!-- status:start[^>]*-->)[\s\S]*?(<!-- status:end -->)/;
if (!fence.test(html)) {
  throw new Error(
    "roadmap.html has no <!-- status:start --> … <!-- status:end --> fence. " +
      "Refusing to guess where the paragraph belongs.",
  );
}
// Match the file's own line endings. A Windows checkout of this repo is CRLF, CI is
// LF, and writing the wrong one makes the page differ from itself on every run.
const eol = html.includes("\r\n") ? "\r\n" : "\n";
const nextHtml = html.replace(
  fence,
  (_match, open, close) => `${open}${eol}          <p>${sentence}</p>${eol}          ${close}`,
);

// checkedOn is written only when something else moved, so an unchanged day does
// not produce a commit whose entire content is a new date.
const withoutDate = JSON.stringify(status, null, 2) + "\n";
const changed = nextHtml !== html || withoutDate !== before;

const releaseVersion = status.latestRelease.replace(/^v/, "");
if (cr.version !== releaseVersion) {
  // Standing reminder, not an error. It fires on every run until the listing catches
  // up, and the right response is often "nothing yet", so say that rather than
  // reading as an instruction to edit.
  console.warn(
    `note: data/status.json says the Chrome Web Store serves ${cr.version}, and ${releaseVersion} is released.\n` +
      `      That listing cannot be read automatically, so check it: ${cr.url}\n` +
      `      If it has published since, set chrome.version to "${releaseVersion}" and chrome.inReview to false.\n` +
      `      If it is still in review, there is nothing to do and this note is expected.`,
  );
}
if (fx.version !== releaseVersion) {
  console.warn(`note: Firefox Add-ons serves ${fx.version}, and ${releaseVersion} is released.`);
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
