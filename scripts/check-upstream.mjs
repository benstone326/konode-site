#!/usr/bin/env node
/**
 * Has ROADMAP.md or CHANGELOG.md moved in the extension repo since this site was
 * last written against them?
 *
 * roadmap.html is a rendering of those two files, and it has drifted before: the
 * site told Firefox users to build from source and load a temporary add-on for
 * months after the add-on went live on AMO. A daily read of the source catches
 * that in a day instead of a quarter.
 *
 * This reports. It does not edit the site. Turning a changelog into page copy is a
 * judgment call every time — what shipped versus what merely landed on main, what
 * a user needs told versus what belongs in a commit message — and a confident
 * wrong claim on a live page is worse than a stale one. So the output is a diff
 * for a human, or for /roadmap-sync, to act on.
 *
 *   node scripts/check-upstream.mjs           report; writes drift.md when it moved
 *   node scripts/check-upstream.mjs --accept  store what upstream says now as the
 *                                             new baseline (run this once the site
 *                                             has actually been updated to match)
 */
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RAW = "https://raw.githubusercontent.com/konabe-studio/konode/main/";
const TRACKED = ["ROADMAP.md", "CHANGELOG.md"];

const root = fileURLToPath(new URL("../", import.meta.url));
const baseline = (name) => join(root, ".upstream", name);
const accept = process.argv.includes("--accept");

/** Line endings are not drift. Compare and store one form only. */
const normalize = (text) => text.replace(/\r\n/g, "\n");

async function fetchUpstream(name) {
  const res = await fetch(RAW + name, { headers: { "user-agent": "konode-site drift check" } });
  if (!res.ok) throw new Error(`${RAW}${name} answered ${res.status} ${res.statusText}`);
  return normalize(await res.text());
}

/** A readable unified diff, without the temp paths git would otherwise print. */
function diff(oldPath, newPath) {
  const run = spawnSync("git", ["diff", "--no-index", "--no-color", "-U3", "--", oldPath, newPath], {
    encoding: "utf8",
  });
  return (run.stdout || "")
    .split("\n")
    .filter((line) => !/^(diff --git |index |--- |\+\+\+ |new file mode |old mode |new mode )/.test(line))
    .join("\n")
    .trim();
}

await mkdir(join(root, ".upstream"), { recursive: true });
const scratch = join(tmpdir(), `konode-drift-${process.pid}`);
await mkdir(scratch, { recursive: true });

const moved = [];

try {
  for (const name of TRACKED) {
    const fresh = await fetchUpstream(name);

    if (accept) {
      await writeFile(baseline(name), fresh);
      continue;
    }

    if (!existsSync(baseline(name))) {
      moved.push({ name, body: `No baseline stored yet for \`${name}\`. Run \`node scripts/check-upstream.mjs --accept\`.` });
      continue;
    }

    const stored = normalize(await readFile(baseline(name), "utf8"));
    if (stored === fresh) continue;

    const freshPath = join(scratch, name);
    await writeFile(freshPath, fresh);
    moved.push({ name, body: "```diff\n" + diff(baseline(name), freshPath) + "\n```" });
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}

if (accept) {
  console.log(`Baseline updated: ${TRACKED.join(", ")}.`);
  process.exit(0);
}

const drifted = moved.length > 0;

if (drifted) {
  const report =
    `# Upstream docs changed\n\n` +
    `\`roadmap.html\` is a rendering of \`ROADMAP.md\` and \`CHANGELOG.md\` in ` +
    `[konabe-studio/konode](https://github.com/konabe-studio/konode). ` +
    `${moved.length === 1 ? "One of them has" : "Both have"} moved since this site was last written against ` +
    `${moved.length === 1 ? "it" : "them"}.\n\n` +
    moved.map(({ name, body }) => `## ${name}\n\n${body}\n`).join("\n") +
    `\n## What to do\n\n` +
    `Run \`/roadmap-sync\` in this repository. It reads both files from upstream, updates ` +
    `\`roadmap.html\` and the pages that follow it, and refreshes the baseline in \`.upstream/\`, ` +
    `which is what closes this issue's reason to exist.\n\n` +
    `Read what shipped separately from what merely landed on \`main\`. The site says "shipped" ` +
    `only about a released version.\n`;
  await writeFile(join(root, "drift.md"), report);
  console.log(`Upstream moved: ${moved.map((m) => m.name).join(", ")}. Wrote drift.md.`);
} else {
  console.log("Upstream is unchanged since the last baseline.");
}

if (process.env.GITHUB_OUTPUT) {
  const { appendFile } = await import("node:fs/promises");
  await appendFile(process.env.GITHUB_OUTPUT, `drifted=${drifted}\n`);
}
