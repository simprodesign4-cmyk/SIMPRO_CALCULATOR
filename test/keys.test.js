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
  for (const k of ['"SHIFT"', '"ALPHA"', '"OPTN"', '"VARS"', '"MENU"', '"EXIT"', '"X,θ,T"', '"S⇔D"', '"a b/c"', '"(−)"', '"×10ˣ"', '"Ans"', '"EXE"', '"DEL"', '"AC"', '"F1"', '"F6"'])
    assert.ok(ui.includes(k), "missing key " + k);
});
