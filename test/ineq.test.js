"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { solveIneq, describeIneq } = require("../ineq.js");

const solve = (c, rel) => describeIneq(solveIneq(c, rel), (x) => String(parseFloat(x.toPrecision(10))));

test("quadratic inequalities", () => {
  assert.deepEqual(solve([1, -3, 2], ">"), ["x < 1", "x > 2"]);
  assert.deepEqual(solve([1, -3, 2], "≥"), ["x ≤ 1", "x ≥ 2"]);
  assert.deepEqual(solve([1, -3, 2], "<"), ["1 < x < 2"]);
  assert.deepEqual(solve([1, -3, 2], "≤"), ["1 ≤ x ≤ 2"]);
  assert.deepEqual(solve([-1, 0, 4], "≥"), ["-2 ≤ x ≤ 2"]);
  assert.deepEqual(solve([-1, 0, 4], ">"), ["-2 < x < 2"]);
});

test("no real roots", () => {
  assert.deepEqual(solve([1, 0, 1], ">"), ["All real x"]);
  assert.deepEqual(solve([1, 0, 1], "≥"), ["All real x"]);
  assert.deepEqual(solve([1, 0, 1], "<"), ["No solution"]);
  assert.deepEqual(solve([-1, 0, -1], "<"), ["All real x"]);
});

test("a repeated root", () => {
  assert.deepEqual(solve([1, -2, 1], ">"), ["x < 1", "x > 1"]);
  assert.deepEqual(solve([1, -2, 1], "≥"), ["All real x"]);
  assert.deepEqual(solve([1, -2, 1], "<"), ["No solution"]);
  assert.deepEqual(solve([1, -2, 1], "≤"), ["x = 1"]);
  assert.deepEqual(solve([1, 0, 0], "≤"), ["x = 0"]);
});

test("cubic and quartic", () => {
  assert.deepEqual(solve([1, -6, 11, -6], ">"), ["1 < x < 2", "x > 3"]);
  assert.deepEqual(solve([1, -6, 11, -6], "<"), ["x < 1", "2 < x < 3"]);
  assert.deepEqual(solve([1, -10, 35, -50, 24], "<"), ["1 < x < 2", "3 < x < 4"]);
  assert.deepEqual(solve([1, -10, 35, -50, 24], "≥"), ["x ≤ 1", "2 ≤ x ≤ 3", "x ≥ 4"]);
});

test("linear and leading zeros", () => {
  assert.deepEqual(solve([2, -4], ">"), ["x > 2"]);
  assert.deepEqual(solve([-2, 4], ">"), ["x < 2"]);
  assert.deepEqual(solve([0, 1, -3, 2], ">"), ["x < 1", "x > 2"]);
  assert.throws(() => solveIneq([0, 5], ">"), /Degree/);
});
