"use strict";
// Colour contrast (WCAG 2.1) for the main text and background pairs used in style.css,
// plus a few markup checks that help screen readers and zooming.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const pairs = [
  ["orange labels on the dark blue body", "#ff9a3d", "#071f4d"], ["orange labels, lighter top of the body", "#ff9a3d", "#0c2f6b"],
  ["key text on a white key", "#000000", "#e3eaf6"], ["alpha letter on a white key", "#0b3070", "#ffffff"],
  ["DEL and AC text (top of the blue)", "#ffffff", "#2b6cd6"], ["DEL and AC text (bottom of the blue)", "#ffffff", "#1a52b5"],
  ["screen text", "#06142f", "#f4f8ff"], ["earlier lines on the screen", "#4f6288", "#f4f8ff"], ["error text on the screen", "#c1380a", "#f4f8ff"],
  ["screen title bar", "#ffffff", "#0b3070"], ["screen status text", "#ffb066", "#0b3070"], ["soft key labels", "#06142f", "#e8eefb"],
  ["selected cell", "#06142f", "#ffd9b3"], ["menu tile number", "#0b3070", "#e8eefb"], ["history list", "#b9ccf0", "#061a42"],
  ["header buttons", "#a9c3f2", "#04122c"], ["active header button", "#07224f", "#ffffff"], ["install button", "#04122c", "#ff9a3d"],
];

const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8").toLowerCase();
const inCss = (hex) => css.includes(hex) || (/^#(.)\1(.)\2(.)\3$/.test(hex) && css.includes("#" + hex[1] + hex[3] + hex[5]));

test("the colours checked here really are the ones in style.css", () => {
  for (const [name, fg, bg] of pairs) for (const c of [fg, bg]) assert.ok(inCss(c), `${name}: ${c} is not used in style.css, so this test would be checking the wrong colour`);
});

test("text and background colours are easy to read (at least 4.5 to 1)", () => {
  for (const [name, fg, bg] of pairs) assert.ok(ratio(fg, bg) >= 4.5, `${name}: ${ratio(fg, bg).toFixed(2)} to 1 (${fg} on ${bg})`);
});

test("the page can be zoomed and is labelled for screen readers", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(html, /<html lang="en">/);
  assert.ok(!/user-scalable\s*=\s*(no|0)/i.test(html) && !/maximum-scale/i.test(html), "zooming must not be blocked");
  for (const s of ['id="res" role="status" aria-live="polite"', 'id="info" role="status" aria-live="polite"', 'aria-label="Calculator screen"', 'aria-label="Expression"', 'id="bHelp"'])
    assert.ok(html.includes(s), "missing: " + s);
});
