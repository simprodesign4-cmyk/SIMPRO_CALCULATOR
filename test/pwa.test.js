"use strict";
// Checks the pieces that make the calculator installable and usable offline.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const html = read("index.html");
const sw = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const precache = JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);

const pngSize = (f) => { const b = fs.readFileSync(path.join(root, f)); assert.equal(b.toString("latin1", 1, 4), "PNG", f + " is not a PNG"); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test("the manifest has what browsers need to offer installation", () => {
  assert.equal(manifest.name, "SIMPRO_CALCULATOR");
  assert.ok(manifest.short_name.length <= 12);
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.start_url && manifest.scope);
  assert.match(manifest.theme_color, /^#[0-9a-f]{6}$/i);
  assert.match(manifest.background_color, /^#[0-9a-f]{6}$/i);
});

test("every manifest icon exists at the size it claims", () => {
  const purposes = new Set();
  for (const i of manifest.icons) {
    const [w, h] = pngSize(i.src);
    assert.equal(`${w}x${h}`, i.sizes, i.src);
    purposes.add(i.purpose);
  }
  assert.ok(purposes.has("any") && purposes.has("maskable"));
  assert.ok(manifest.icons.some((i) => i.sizes === "192x192") && manifest.icons.some((i) => i.sizes === "512x512"));
  assert.deepEqual(pngSize("icons/apple-touch-icon.png"), [180, 180]);
});

test("index.html links the manifest, icons and offline script", () => {
  for (const s of ['rel="manifest" href="manifest.webmanifest"', 'rel="apple-touch-icon"', 'name="theme-color"', 'name="viewport"', '<script src="pwa.js">'])
    assert.ok(html.includes(s), "missing: " + s);
  assert.match(read("pwa.js"), /serviceWorker\.register\("sw\.js"\)/);
});

test("the offline list covers every file the page loads", () => {
  const loaded = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));
  for (const f of loaded) assert.ok(precache.includes(f), `${f} is loaded by index.html but missing from the offline list in sw.js`);
  for (const i of manifest.icons) assert.ok(precache.includes(i.src), i.src + " missing from the offline list");
  assert.ok(precache.includes("./") && precache.includes("manifest.webmanifest"));
});

test("every file in the offline list really exists", () => {
  for (const f of precache) if (f !== "./") assert.ok(fs.existsSync(path.join(root, f)), f + " is listed in sw.js but is not in the folder");
});

test("the service worker handles install, activate and fetch", () => {
  for (const ev of ["install", "activate", "fetch"]) assert.ok(sw.includes(`addEventListener("${ev}"`), ev);
  assert.match(sw, /const CACHE="[\w-]+"/);
});
