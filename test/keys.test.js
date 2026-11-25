"use strict";
// Keys that the manual and the worked examples rely on must exist on the keypad.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ui = fs.readFileSync(path.join(__dirname, "..", "ui.js"), "utf8");

test("percent is on the keypad (SHIFT then the divide key) and in the OPTN list", () => {
  assert.ok(ui.includes('["÷","%","÷","%"]'), "SHIFT + ÷ should type %");
  assert.ok(ui.includes('["Percent  (50% = 0.5)","%"]'), "OPTN should list percent");
});

test("every key the manual names is present", () => {
  for (const k of ['"SHIFT"', '"ALPHA"', '"OPTN"', '"VARS"', '"MENU"', '"EXIT"', '"X,θ,T"', '"S⇔D"', '"a b/c"', '"(−)"', '"×10ˣ"', '"Ans"', '"="', '"DEL"', '"AC"', '"F1"', '"F6"'])
    assert.ok(ui.includes(k), "missing key " + k);
});

test("the answer key is the = sign, not EXE", () => {
  assert.ok(ui.includes('["=","","!eq","","","exe"]'));
  assert.ok(!ui.includes('["EXE"'));
  assert.ok(ui.includes('["•","x=",".","="]'), "the equation sign sits on SHIFT + the point key");
});

test("square root, cube root and factorial are one SHIFT press away", () => {
  assert.ok(ui.includes('["x²","√","^2","sqrt("]'), "SHIFT + x² is the square root");
  assert.ok(ui.includes('["(","∛","(","cbrt(","F"]'), "SHIFT + ( is the cube root");
  assert.ok(ui.includes('[",","x!",",","!","y"]'), "SHIFT + , is the factorial");
});

test("a lone ! is the factorial sign, not a command", () => {
  assert.ok(ui.includes('a.length>1&&a[0]=="!")cmd(a)'));
  assert.ok(fs.readFileSync(path.join(__dirname, "..", "modes.js"), "utf8").includes('a.length<2||a[0]!="!"'));
});
