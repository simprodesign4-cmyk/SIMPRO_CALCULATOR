"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { ev, evNum, fmt, fmtExact, frac, toDMS, config } = require("../calc.js");

const reset = () => config({ ang: "DEG", fm: "NORM", fix: null, ans: 0, V: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, M: 0, x: 0, y: 0 } });
const calc = (e) => fmt(ev(e));
const near = (e, want, tol = 1e-9) => assert.ok(Math.abs(evNum(e) - want) < tol, `${e} = ${evNum(e)}, wanted ${want}`);
const exact = (e) => fmtExact(ev(e));

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
  assert.throws(() => calc("1÷0"), /Math Error/);
  assert.throws(() => calc("ln(0)"), /Math Error/);
  assert.throws(() => calc("(−3)!"), /Math Error/);
  assert.throws(() => calc("2+"), /Syntax Error/);
  assert.throws(() => calc("(1+2"), /Syntax Error/);
  assert.throws(() => calc("foo(2)"), /Syntax Error/);
  assert.throws(() => calc("3 4 )"), /Syntax Error/);
  assert.throws(() => calc(""), /Syntax Error/);
  assert.throws(() => calc("nCr(2,5)"), /Argument Error/);
  assert.throws(() => calc("sin(1,2)"), /Argument Error/);
});

test("exact fractions stay exact", () => {
  assert.equal(exact("1÷3+1÷6"), "1/2");
  assert.equal(calc("1÷3+1÷6"), "0.5");
  assert.equal(exact("2÷4"), "1/2");
  assert.equal(exact("1÷3×3"), "1");
  assert.equal(exact("−3÷6"), "−1/2");
  assert.equal(exact("(2÷3)^2"), "4/9");
  assert.equal(exact("2^(−3)"), "1/8");
  assert.equal(exact("sqrt(9÷16)"), "3/4");
  assert.equal(exact("0.5"), "1/2");
  assert.equal(exact("sum(1÷x,1,3)"), "11/6");
  assert.equal(exact("50%"), "1/2");
});

test("big exact integers", () => {
  assert.equal(calc("20!"), "2.43290200818×10^18");
  assert.equal(exact("2^64"), "1.84467440737×10^19");
  assert.equal(calc("nCr(50,25)"), "1.26410606438×10^14");
  assert.equal(ev("nCr(50,25)").n, 126410606437752n);
});

test("complex numbers", () => {
  assert.equal(calc("sqrt(−4)"), "2i");
  assert.equal(calc("sqrt(−1)"), "i");
  assert.equal(calc("i×i"), "-1");
  assert.equal(calc("i^2"), "-1");
  assert.equal(calc("(1+2i)×(3−i)"), "5+5i");
  assert.equal(calc("(1+2i)+(3−4i)"), "4-2i");
  assert.equal(calc("(3+4i)÷(1−2i)"), "-1+2i");
  assert.equal(calc("abs(3+4i)"), "5");
  assert.equal(calc("conj(2+3i)"), "2-3i");
  assert.equal(calc("re(2+3i)"), "2");
  assert.equal(calc("im(2+3i)"), "3");
  assert.equal(calc("arg(i)"), "90");
  assert.equal(calc("sqrt(3+4i)"), "2+i");
  assert.equal(calc("exp(0)"), "1");
});

test("parser edge cases", () => {
  assert.equal(calc("2^3^2"), "512");
  assert.equal(calc("−−3"), "3");
  assert.equal(calc("2×−3"), "-6");
  assert.equal(calc("2^−1"), "0.5");
  assert.equal(calc("3!^2"), "36");
  assert.equal(calc("10%×5"), "0.5");
  assert.equal(calc("2π"), "6.28318530718");
  assert.equal(calc("sin(30)cos(60)"), "0.25");
  assert.equal(calc("  1 + 2 "), "3");
  config({ V: { x: 4, y: 3 } });
  assert.equal(calc("xy"), "12");
  assert.equal(calc("2x+y"), "11");
});

test("degrees-minutes-seconds", () => {
  assert.equal(calc("30°30′"), "30.5");
  assert.equal(calc("12°35′15″"), "12.5875");
  assert.equal(calc("1°30′+0°45′"), "2.25");
  assert.equal(calc("sin(30°)"), "0.5");
  assert.equal(toDMS(30.5), "30°30′0″");
  assert.equal(toDMS(12.5875), "12°35′15″");
  assert.equal(toDMS(-0.5), "-0°30′0″");
  assert.equal(toDMS(1.99999999), "2°0′0″");
});

test("polar and rectangular conversion", () => {
  assert.equal(calc("polr(3,4)"), "5");
  assert.equal(calc("polt(0,1)"), "90");
  assert.equal(calc("polt(1,1)"), "45");
  near("recx(2,60)", 1);
  near("recy(2,90)", 2);
  config({ ang: "RAD" });
  near("polt(0,1)", Math.PI / 2);
});

test("unit conversion", () => {
  assert.equal(calc('conv(100,"°C","°F")'), "212");
  assert.equal(calc('conv(32,"°F","°C")'), "0");
  assert.equal(calc('conv(0,"°C","K")'), "273.15");
  near('conv(1,"mi","km")', 1.609344);
  near('conv(1,"kg","lb")', 2.2046226218, 1e-9);
  near('conv(60,"km/h","m/s")', 16.6666666667, 1e-9);
  near('conv(1,"atm","kPa")', 101.325);
  near('conv(180,"deg","rad")', Math.PI);
  assert.equal(calc('conv(2+3,"m","cm")'), "500");
  assert.throws(() => calc('conv(1,"km","kg")'), /Argument Error/);
  assert.throws(() => calc('conv(1,"km","parsec")'), /Argument Error/);
  assert.throws(() => calc('conv(1,"constructor","m")'), /Argument Error/);
  assert.throws(() => calc('conv("km",1,2)'), /Argument Error/);
});

test("decimal places (Fix)", () => {
  config({ fix: 2 });
  assert.equal(fmt(ev("π")), "3.14");
  assert.equal(calc("2÷3"), "0.67");
  assert.equal(calc("5"), "5.00");
  config({ fix: 0 });
  assert.equal(calc("7÷2"), "4");
  config({ fix: 3 });
  assert.equal(fmt(-0.0001), "0.000");
  config({ fix: null });
  assert.equal(calc("2÷3"), "0.666666666667");
});

test("mixed fractions", () => {
  assert.equal(fmtExact(ev("7÷3"), true), "2 1/3");
  assert.equal(fmtExact(ev("−7÷3"), true), "−2 1/3");
  assert.equal(fmtExact(ev("1÷3"), true), "1/3");
  assert.equal(fmtExact(ev("7÷3"), false), "7/3");
  assert.equal(fmtExact(ev("2.75"), true), "2 3/4");
  assert.equal(fmtExact(ev("4÷2"), true), "2");
});
