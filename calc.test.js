"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { ev, fmt, frac, config } = require("../calc.js");

const reset = () => config({ ang: "DEG", fm: "NORM", ans: 0, V: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, M: 0, x: 0, y: 0 } });
const calc = (e) => fmt(ev(e));
const near = (e, want, tol = 1e-9) => assert.ok(Math.abs(ev(e) - want) < tol, `${e} = ${ev(e)}, wanted ${want}`);

test.beforeEach(reset);

test("arithmetic and precedence", () => {
  assert.equal(calc("2+3×4"), "14");
  assert.equal(calc("(2+3)×4"), "20");
  assert.equal(calc("10÷4"), "2.5");
  assert.equal(calc("7−10"), "-3");
  assert.equal(calc("0.1+0.2"), "0.3");
});

test("powers, including a negative base", () => {
  assert.equal(calc("2^10"), "1024");
  assert.equal(calc("2^(−1)"), "0.5");
  assert.equal(calc("−2^2"), "-4");
  assert.equal(calc("(−2)^2"), "4");
  assert.equal(calc("−(1+1)^2"), "-4");
  assert.equal(calc("3×−2^2"), "-12");
});

test("implicit multiplication, percent and E notation", () => {
  assert.equal(calc("2(3+4)"), "14");
  assert.equal(calc("(1+2)(3+4)"), "21");
  assert.equal(calc("2sin(30)"), "1");
  assert.equal(calc("50%"), "0.5");
  assert.equal(calc("1E3+1"), "1001");
  assert.equal(calc("2.5E-2"), "0.025");
});

test("trigonometry follows the angle unit", () => {
  assert.equal(calc("sin(30)"), "0.5");
  assert.equal(calc("cos(60)"), "0.5");
  assert.equal(calc("tan(45)"), "1");
  assert.equal(calc("sin(180)"), "0");
  assert.equal(calc("asin(0.5)"), "30");
  config({ ang: "RAD" });
  near("sin(π÷2)", 1);
  near("acos(0)", Math.PI / 2);
  config({ ang: "GRAD" });
  near("sin(100)", 1);
});

test("hyperbolic, logs and roots", () => {
  near("sinh(1)", Math.sinh(1));
  assert.equal(calc("log(1000)"), "3");
  assert.equal(calc("ln(ℯ)"), "1");
  assert.equal(calc("lb(8)"), "3");
  assert.equal(calc("logb(2,8)"), "3");
  assert.equal(calc("sqrt(16)"), "4");
  assert.equal(calc("cbrt(27)"), "3");
  assert.equal(calc("root(27,3)"), "3");
  assert.equal(calc("root(−8,3)"), "-2");
});

test("factorial, permutations, combinations", () => {
  assert.equal(calc("5!"), "120");
  assert.equal(calc("0!"), "1");
  assert.equal(calc("(2+1)!"), "6");
  near("0.5!", Math.sqrt(Math.PI) / 2, 1e-9);
  assert.equal(calc("nPr(5,2)"), "20");
  assert.equal(calc("nCr(5,2)"), "10");
  assert.throws(() => calc("(−3)!"));
});

test("integer helpers", () => {
  assert.equal(calc("gcd(12,18)"), "6");
  assert.equal(calc("lcm(4,6)"), "12");
  assert.equal(calc("mod(10,3)"), "1");
  assert.equal(calc("round(2.5)"), "3");
  assert.equal(calc("int(−2.7)"), "-2");
  assert.equal(calc("abs(−4)"), "4");
  assert.equal(calc("sgn(−9)"), "-1");
});

test("calculus: integral, derivative, sum", () => {
  near("integ(x^2,0,3)", 9, 1e-8);
  near("integ(2x,0,5)", 25, 1e-8);
  near("deriv(x^3,2)", 12, 1e-6);
  config({ ang: "RAD" });
  near("integ(sin(x),0,π)", 2, 1e-6);
  near("deriv(sin(x),0)", 1, 1e-6);
  assert.equal(calc("sum(x,1,10)"), "55");
  assert.equal(calc("sum(x^2,1,4)"), "30");
});

test("constants, variables and Ans", () => {
  assert.equal(calc("[c]"), "299792458");
  near("[g]", 9.80665);
  config({ V: { A: 5, B: 3 } });
  assert.equal(calc("A+B"), "8");
  assert.equal(calc("2A+1"), "11");
  config({ ans: 21 });
  assert.equal(calc("Ans×2"), "42");
});

test("display formats", () => {
  assert.equal(calc("1÷3"), "0.333333333333");
  assert.equal(calc("10^15"), "1×10^15");
  config({ fm: "SCI" });
  assert.equal(fmt(12345.678), "1.2345678×10^4");
  config({ fm: "ENG" });
  assert.equal(fmt(12345.678), "12.345678×10^3");
  assert.equal(fmt(0.00042), "420×10^-6");
});

test("fractions (S⇔D)", () => {
  assert.equal(frac(0.75), "3/4");
  assert.equal(frac(-1 / 3), "−1/3");
  assert.equal(frac(2.5), "5/2");
  assert.equal(frac(2), null);
  assert.equal(frac(Math.PI), null);
});

test("errors are raised, not shown as numbers", () => {
  assert.throws(() => calc("1÷0"));
  assert.throws(() => calc("sqrt(−1)"));
  assert.throws(() => calc("2+"));
  assert.throws(() => calc("(1+2"));
  assert.throws(() => calc("foo(2)"));
  assert.throws(() => calc("ln(0)"));
});
