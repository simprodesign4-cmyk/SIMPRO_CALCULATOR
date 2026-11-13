"use strict";
// Guards the "fit to the screen, no scrolling" layout rules in style.css.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

test("the page never scrolls and uses the real visible height", () => {
  assert.match(css, /html,body\{height:100%;overflow:hidden/);
  assert.match(css, /height:100dvh/);
  assert.match(css, /overscroll-behavior:none/);
});

test("the keys share the height they are given", () => {
  assert.match(css, /#top\{flex:5 1 0/);
  assert.match(css, /#num\{flex:4 1 0;grid-template-rows:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /\.key,\.fk \.key,\.n5 \.key\{flex:1 1 0;height:auto/);
});

test("phones turned sideways get a three-column layout", () => {
  assert.match(css, /orientation:landscape\) and \(max-height:620px\)/);
  assert.match(css, /grid-template-columns:minmax\(0,\.9fr\) minmax\(0,1\.5fr\) minmax\(0,1\.15fr\)/);
});
