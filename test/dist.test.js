"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const d = require("../dist.js");

const near = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} is not close to ${b}`);
const rel = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.abs(b), `${a} is not relatively close to ${b}`);

test("normal density and cumulative probability", () => {
  near(d.normPdf(0, 0, 1), 0.3989422804014327);
  near(d.normPdf(12, 10, 2), 0.3989422804014327 / 2 * Math.exp(-0.5));
  near(d.phi(0), 0.5);
  near(d.phi(1), 0.8413447460685429);
  near(d.phi(1.96), 0.9750021048517795);
  near(d.phi(3), 0.9986501019683699);
  near(d.phi(-1), 0.15865525393145707);
  near(d.normCdf(110, 100, 10), 0.8413447460685429);
});

test("normal tails stay accurate", () => {
  rel(d.phi(-3), 0.0013498980316301);
  rel(d.phi(-6), 9.865876450376946e-10);
  rel(d.phi(-10), 7.619853024160527e-24);
  assert.equal(d.phi(-Infinity), 0);
  assert.equal(d.phi(Infinity), 1);
});

test("normal area between two values", () => {
  near(d.normArea(-1, 1, 0, 1), 0.6826894921370859);
  near(d.normArea(-Infinity, 1.96, 0, 1), 0.9750021048517795);
  rel(d.normArea(3, Infinity, 0, 1), 0.0013498980316301);
  near(d.normArea(90, 110, 100, 10), 0.6826894921370859);
  near(d.normArea(-Infinity, Infinity, 0, 1), 1);
});

test("inverse normal", () => {
  near(d.normInv(0.975, 0, 1), 1.959963984540054, 1e-10);
  near(d.normInv(0.5, 10, 2), 10);
  near(d.normInv(0.025, 0, 1), -1.959963984540054, 1e-10);
  near(d.normInv(0.9, 100, 15), 100 + 15 * 1.2815515655446004, 1e-9);
  assert.throws(() => d.normInv(0, 0, 1), /between 0 and 1/);
  assert.throws(() => d.normInv(1, 0, 1), /between 0 and 1/);
});

test("binomial", () => {
  near(d.binomPdf(3, 10, 0.5), 0.1171875);
  near(d.binomCdf(3, 10, 0.5), 0.171875);
  near(d.binomPdf(0, 5, 0.2), 0.32768);
  near(d.binomCdf(10, 10, 0.3), 1);
  assert.equal(d.binomPdf(11, 10, 0.5), 0);
  assert.equal(d.binomPdf(0, 4, 0), 1);
  assert.equal(d.binomPdf(4, 4, 1), 1);
  assert.equal(d.binomInv(0.5, 10, 0.5), 5);
  assert.equal(d.binomInv(0.171875, 10, 0.5), 3);
  near(d.binomPdf(500, 1000, 0.5), 0.025225018, 1e-8);
});

test("poisson", () => {
  near(d.poissonPdf(2, 3), 0.22404180765538775);
  near(d.poissonCdf(2, 3), 0.42319008112684353);
  near(d.poissonPdf(0, 1), Math.exp(-1));
  assert.equal(d.poissonInv(0.5, 3), 3);
  assert.equal(d.poissonInv(0.42319008112684353, 3), 2);
  assert.equal(d.poissonCdf(-1, 3), 0);
});
