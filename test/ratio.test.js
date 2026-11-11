"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { solveRatio, shareRatio, simplifyRatio } = require("../ratio.js");

test("solve a : b = c : d for each blank", () => {
  assert.deepEqual(solveRatio(2, 3, null, 9), { index: 2, value: 6 });
  assert.deepEqual(solveRatio(null, 3, 4, 6), { index: 0, value: 2 });
  assert.deepEqual(solveRatio(2, null, 4, 6), { index: 1, value: 3 });
  assert.deepEqual(solveRatio(2, 3, 4, null), { index: 3, value: 6 });
  assert.equal(solveRatio(1, 4, null, 10).value, 2.5);
});

test("solve needs exactly one blank and no zero divisor", () => {
  assert.throws(() => solveRatio(1, 2, 3, 4), /exactly one/);
  assert.throws(() => solveRatio(1, null, null, 4), /exactly one/);
  assert.throws(() => solveRatio(1, 0, null, 5), /Math Error/);
  assert.throws(() => solveRatio(0, 2, 3, null), /Math Error/);
});

test("share a total in a ratio", () => {
  assert.deepEqual(shareRatio(100, [2, 3]), [40, 60]);
  assert.deepEqual(shareRatio(90, [1, 2, 3]), [15, 30, 45]);
  assert.deepEqual(shareRatio(10, [1, 0, 1]), [5, 0, 5]);
  assert.throws(() => shareRatio(10, [3]), /at least two/);
  assert.throws(() => shareRatio(10, [0, 0]), /Math Error/);
  assert.throws(() => shareRatio(10, [-1, 2]), /negative/);
});

test("simplify a ratio", () => {
  assert.deepEqual(simplifyRatio([6, 9]), [2, 3]);
  assert.deepEqual(simplifyRatio([10, 15, 25]), [2, 3, 5]);
  assert.deepEqual(simplifyRatio([0.5, 1.5]), [1, 3]);
  assert.deepEqual(simplifyRatio([1.25, 0.75]), [5, 3]);
  assert.deepEqual(simplifyRatio([7, 7]), [1, 1]);
  assert.deepEqual(simplifyRatio([0, 4]), [0, 1]);
  assert.throws(() => simplifyRatio([0, 0]), /positive/);
  assert.throws(() => simplifyRatio([5]), /at least two/);
});
