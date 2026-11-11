"use strict";
// The browser loads calc.js, solvers.js, basen.js and matrix.js as plain scripts that share one global scope.
// A name declared in both would stop the second script from loading at all.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("the engine files load together without name clashes", () => {
  const ctx = vm.createContext({ console });
  for (const f of ["calc.js", "solvers.js", "basen.js", "matrix.js"]) {
    const code = fs.readFileSync(path.join(__dirname, "..", f), "utf8");
    assert.doesNotThrow(() => vm.runInContext(code, ctx, { filename: f }), f);
  }
  assert.equal(vm.runInContext("typeof solveLinear + typeof ev + typeof regress", ctx), "functionfunctionfunction");
});
