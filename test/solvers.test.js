"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { solveLinear, polyRoots, stats1, stats2, regress } = require("../solvers.js");

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} is not close to ${b}`);
const nearAll = (a, b, tol = 1e-9) => { assert.equal(a.length, b.length); a.forEach((v, i) => near(v, b[i], tol)); };
const roots = (c) => polyRoots(c).map((z) => [z.re, z.im]);

test("simultaneous equations", () => {
  nearAll(solveLinear([[1, 1], [1, -1]], [3, 1]), [2, 1]);
  nearAll(solveLinear([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3]), [2, 3, -1]);
  nearAll(solveLinear([[2, 1, 1, 1], [1, 3, 2, 1], [1, 0, 0, 1], [0, 1, 2, 3]], [11, 17, 5, 20]), [1, 2, 3, 4], 1e-9);
  nearAll(solveLinear([[0, 1], [1, 0]], [5, 7]), [7, 5]);
});

test("simultaneous equations with no unique answer", () => {
  assert.equal(solveLinear([[1, 2], [2, 4]], [3, 6]), null);
  assert.equal(solveLinear([[1, 1], [1, 1]], [1, 2]), null);
  assert.equal(solveLinear([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [1, 2, 3]), null);
  assert.equal(solveLinear([[1, 1, 1, 1], [1, -1, 1, -1], [1, 2, 3, 4], [0, 0, 1, 1]], [10, -2, 30, 7]), null);
});

test("quadratic roots", () => {
  assert.deepEqual(roots([1, -3, 2]), [[1, 0], [2, 0]]);
  assert.deepEqual(roots([1, 0, 1]), [[0, -1], [0, 1]]);
  assert.deepEqual(roots([1, -2, 1]), [[1, 0], [1, 0]]);
  const z = roots([1, 2, 5]);
  nearAll(z[0], [-1, -2]); nearAll(z[1], [-1, 2]);
  assert.deepEqual(roots([2, -4, -6]), [[-1, 0], [3, 0]]);
});

test("cubic and quartic roots", () => {
  const c = roots([1, -6, 11, -6]);
  c.forEach((z, i) => nearAll(z, [i + 1, 0], 1e-8));
  const u = roots([1, 0, 0, -1]);
  nearAll(u[0], [-0.5, -Math.sqrt(3) / 2]); nearAll(u[1], [-0.5, Math.sqrt(3) / 2]); nearAll(u[2], [1, 0]);
  const q = roots([1, 0, 0, 0, -1]);
  nearAll(q[0], [-1, 0]); nearAll(q[1], [0, -1]); nearAll(q[2], [0, 1]); nearAll(q[3], [1, 0]);
  const w = roots([1, -10, 35, -50, 24]);
  w.forEach((z, i) => nearAll(z, [i + 1, 0], 1e-8));
});

test("every root really satisfies the polynomial", () => {
  const p = [2, -3, -11, 6, 5];
  for (const z of polyRoots(p)) {
    let re = p[0], im = 0;
    for (let i = 1; i < p.length; i++) { [re, im] = [re * z.re - im * z.im + p[i], re * z.im + im * z.re]; }
    assert.ok(Math.hypot(re, im) < 1e-8, `residual ${Math.hypot(re, im)}`);
  }
});

test("one-variable statistics", () => {
  const s = stats1([1, 2, 3, 4, 5]);
  assert.equal(s.n, 5); assert.equal(s.sum, 15); assert.equal(s.sumSq, 55); assert.equal(s.mean, 3);
  near(s.sx, Math.sqrt(2.5)); near(s.sigma, Math.sqrt(2));
  assert.equal(s.min, 1); assert.equal(s.max, 5); assert.equal(s.med, 3); assert.equal(s.q1, 1.5); assert.equal(s.q3, 4.5);
  const e = stats1([4, 1, 3, 2]);
  assert.equal(e.med, 2.5); assert.equal(e.q1, 1.5); assert.equal(e.q3, 3.5);
  assert.equal(stats1([7]).med, 7);
  assert.ok(Number.isNaN(stats1([7]).sx));
});

test("statistics with frequencies", () => {
  const s = stats1([1, 2], [3, 1]);
  assert.equal(s.n, 4); assert.equal(s.mean, 1.25); assert.equal(s.med, 1); assert.equal(s.sum, 5);
  assert.throws(() => stats1([1, 2], [1, 0]), /whole numbers/);
  assert.throws(() => stats1([1, 2], [1, 1.5]), /whole numbers/);
  assert.throws(() => stats1([]), /No data/);
});

test("two-variable statistics", () => {
  const s = stats2([1, 2, 3], [2, 4, 6]);
  assert.equal(s.n, 3); assert.equal(s.sumXY, 28); assert.equal(s.mx, 2); assert.equal(s.my, 4);
  near(s.sx, 1); near(s.sy, 2);
});

test("linear regression", () => {
  const r = regress("lin", [1, 2, 3], [2, 4, 6]);
  near(r.a, 0); near(r.b, 2); near(r.r, 1); near(r.predict(4), 8); nearAll(r.invert(8), [4]);
  const n = regress("lin", [1, 2, 3, 4], [8, 6, 4, 2]);
  near(n.b, -2); near(n.r, -1);
  assert.throws(() => regress("lin", [2, 2, 2], [1, 2, 3]), /Math Error/);
  assert.throws(() => regress("lin", [1], [1]), /at least 2/);
});

test("other regression models", () => {
  const q = regress("quad", [-2, -1, 0, 1, 2], [4, 1, 0, 1, 4]);
  near(q.a, 1); near(q.b, 0); near(q.c, 0); near(q.r2, 1); near(q.predict(3), 9);
  nearAll(q.invert(9).sort(), [-3, 3], 1e-6);
  const l = regress("log", [1, Math.E, Math.E ** 2], [1, 3, 5]);
  near(l.a, 1); near(l.b, 2); near(l.r, 1);
  const e = regress("exp", [0, 1, 2, 3], [0, 1, 2, 3].map((x) => 2 * Math.exp(0.5 * x)));
  near(e.a, 2); near(e.b, 0.5); near(e.predict(4), 2 * Math.exp(2));
  const p = regress("pow", [1, 2, 3, 4], [3, 12, 27, 48]);
  near(p.a, 3); near(p.b, 2); near(p.predict(5), 75, 1e-8);
  assert.throws(() => regress("log", [0, 1, 2], [1, 2, 3]), /Math Error/);
  assert.throws(() => regress("exp", [1, 2, 3], [1, -2, 3]), /Math Error/);
  assert.throws(() => regress("quad", [1, 2], [1, 2]), /at least 3/);
});
