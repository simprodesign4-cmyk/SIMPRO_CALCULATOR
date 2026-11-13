"use strict";
// Checks the privacy policy page that Google Play requires.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const page = fs.readFileSync(path.join(root, "privacy-policy.html"), "utf8");
const text = page.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("the policy page is a complete, mobile-friendly page", () => {
  assert.match(page, /<html lang="en">/);
  assert.match(page, /name="viewport"/);
  assert.match(page, /<title>Privacy Policy - SIMPRO_CALCULATOR<\/title>/);
  assert.match(page, /Effective \d{1,2} \w+ \d{4}/);
});

test("the policy says what the calculator stores and what it does not collect", () => {
  for (const s of ["does not collect", "no accounts, no adverts, no analytics and no trackers", "local storage", "GitHub Pages", "Google Play", "Children", "Contact", "Changes to this policy"])
    assert.ok(text.includes(s) || page.includes(s), "missing: " + s);
});

test("the calculator links to the policy and keeps a copy offline", () => {
  assert.ok(fs.readFileSync(path.join(root, "ui.js"), "utf8").includes("privacy-policy.html"));
  assert.ok(fs.readFileSync(path.join(root, "sw.js"), "utf8").includes('"privacy-policy.html"'));
});
