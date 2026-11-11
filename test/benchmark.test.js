"use strict";
// Accuracy benchmark. The reference answers in benchmark-data.json were computed independently
// with mpmath (50 digits), SciPy and NumPy, or come from exact definitions (SI units and constants).
// NOTE: these are NOT readings from a physical Casio calculator.
const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("./benchmark-data.json");
const { ev, evNum, fmt, config, C } = require("../calc.js");
const S = require("../solvers.js");
const D = require("../dist.js");
const M = require("../matrix.js");

const close = (got, want, tol, label) => assert.ok(Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)), `${label}: got ${got}, expected ${want}`);
const angleFor = (g) => (g.endsWith("rad") || g === "calculus" ? "RAD" : "DEG");

test("expression results match independent references", () => {
  let n = 0;
  for (const [group, expr, ref, tol] of data.cases) {
    config({ ang: angleFor(group), fm: "NORM", fix: null });
    close(evNum(expr), ref, tol, `${group}: ${expr}`);
    n++;
  }
  assert.ok(n >= 100);
});

test("whole-number results are exact", () => {
  config({ ang: "DEG" });
  const big = (e) => ev(e).n;
  assert.equal(big("25!"), 15511210043330985984000000n);
  assert.equal(big("100!"), 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000n);
  assert.equal(big("2^100"), 1267650600228229401496703205376n);
  assert.equal(big("nCr(100,50)"), 100891344545564193334812497256n);
  assert.equal(big("nPr(20,10)"), 670442572800n);
  assert.equal(big("123456789×987654321"), 121932631112635269n);
  assert.equal(big("gcd(1071,462)"), 21n);
  assert.equal(big("lcm(21,6)"), 42n);
});

test("everyday displays at 12 digits", () => {
  config({ ang: "DEG", fm: "NORM", fix: null });
  const shows = { "π": "3.14159265359", "ℯ": "2.71828182846", "sqrt(2)": "1.41421356237", "1÷7": "0.142857142857", "2÷3": "0.666666666667",
    "10÷3": "3.33333333333", "100÷7": "14.2857142857", "sqrt(2)×sqrt(2)": "2", "0.1×3": "0.3", "1−0.9": "0.1", "0.1+0.2": "0.3",
    "1÷3×3": "1", "sin(30)": "0.5", "cos(60)": "0.5", "tan(45)": "1", "sin(180)": "0", "cos(90)": "0", "log(1000)": "3", "ln(ℯ^5)": "5", "2^0.5×2^0.5": "2" };
  for (const [e, s] of Object.entries(shows)) assert.equal(fmt(ev(e)), s, e);
});

test("physical constants (CODATA 2022 / SI definitions)", () => {
  assert.equal(C.c, 299792458);
  assert.equal(C.h, 6.62607015e-34);
  assert.equal(C.kB, 1.380649e-23);
  assert.equal(C.NA, 6.02214076e23);
  assert.equal(C.q, 1.602176634e-19);
  assert.equal(C.g, 9.80665);
  close(C.R, C.NA * C.kB, 1e-15, "R = NA x kB");
  const hbar = C.h / (2 * Math.PI);
  close(C.sigma, (Math.PI ** 2 * C.kB ** 4) / (60 * hbar ** 3 * C.c ** 2), 1e-12, "sigma from its definition");
  assert.equal(C.me, 9.1093837139e-31);
  assert.equal(C.e0, 8.8541878188e-12);
  assert.equal(C.mu0, 1.25663706127e-6);
  assert.equal(C.G, 6.6743e-11);
  close(C.c * C.c * C.e0 * C.mu0, 1, 1e-9, "c^2 e0 mu0 = 1");
});

test("unit conversions follow exact definitions", () => {
  config({ ang: "DEG" });
  const cases = [['conv(1,"in","cm")', 2.54], ['conv(1,"ft","m")', 0.3048], ['conv(1,"mi","km")', 1.609344], ['conv(1,"lb","kg")', 0.45359237],
    ['conv(1,"oz","g")', 28.349523125], ['conv(1,"gal","L")', 3.785411784], ['conv(1,"atm","Pa")', 101325], ['conv(1,"cal","J")', 4.184],
    ['conv(1,"kWh","J")', 3.6e6], ['conv(1,"eV","J")', 1.602176634e-19], ['conv(−40,"°C","°F")', -40], ['conv(−40,"°F","°C")', -40],
    ['conv(0,"K","°C")', -273.15], ['conv(100,"°C","K")', 373.15], ['conv(212,"°F","°C")', 100], ['conv(1,"hp","W")', 745.69987158227],
    ['conv(90,"km/h","m/s")', 25], ['conv(1,"day","s")', 86400], ['conv(180,"deg","rad")', Math.PI], ['conv(200,"grad","deg")', 180]];
  for (const [e, w] of cases) close(evNum(e), w, 1e-14, e);
});

test("statistics on well-known datasets", () => {
  const a = data.S.anscombe, s1 = S.stats1(a.x), s2 = S.stats2(a.x, a.y), r = S.regress("lin", a.x, a.y);
  close(s1.mean, a.mean_x, 1e-14, "mean x"); close(s1.sx, a.sx, 1e-13, "sx"); close(S.stats1(a.y).sx, a.sy, 1e-13, "sy");
  close(s2.my, a.mean_y, 1e-14, "mean y"); close(r.a, a.a, 1e-12, "intercept"); close(r.b, a.b, 1e-12, "slope"); close(r.r, a.r, 1e-12, "r");
  close(S.stats1(data.S.offset.x).sx ** 2, data.S.offset.var, 1e-9, "variance with a huge offset");
});

test("regression stays accurate when the x values are far from zero", () => {
  const o = data.S.offsetreg, r = S.regress("lin", o.x, o.y);
  close(r.b, o.b, 1e-9, "slope"); close(r.r, o.r, 1e-9, "r");
  close(r.predict(1e6 + 4.5), o.a_at0 + o.b * 4.5, 1e-9, "prediction");
  const q = S.regress("quad", o.x, o.y);
  close(q.predict(1e6 + 4.5), o.quad_pred, 1e-9, "quadratic prediction");
  close(q.a, o.quad_coefs_centered[0], 1e-9, "quadratic x^2 coefficient");
});

test("polynomial regression on a published dataset", () => {
  const h = data.S.heights, q = S.regress("quad", h.x, h.y), l = S.regress("lin", h.x, h.y);
  close(q.a, h.quad[0], 1e-7, "a"); close(q.b, h.quad[1], 1e-7, "b"); close(q.c, h.quad[2], 1e-7, "c");
  close(l.b, h.lin[0], 1e-10, "slope"); close(l.a, h.lin[1], 1e-10, "intercept"); close(l.r, h.r, 1e-12, "r");
});

test("distributions agree with SciPy", () => {
  for (const [kind, arg, ref, tol] of data.D) {
    const g = (v) => assert.ok(Math.abs(v - ref) <= tol * Math.max(Math.abs(ref), 1e-3), `${kind}(${JSON.stringify(arg)}): got ${v}, expected ${ref}`);
    if (kind === "phi") g(D.phi(arg)); else if (kind === "inv") g(D.normInv(arg, 0, 1));
    else if (kind === "bpdf") g(D.binomPdf(...arg)); else if (kind === "bcdf") g(D.binomCdf(...arg));
    else if (kind === "ppdf") g(D.poissonPdf(...arg)); else if (kind === "pcdf") g(D.poissonCdf(...arg));
    else if (kind === "binv") g(D.binomInv(...arg)); else if (kind === "pinv") g(D.poissonInv(...arg));
  }
});

test("matrices", () => {
  const m = data.M, det = M.mDet(m.A4);
  close(det, m.det, 1e-12, "det 4x4");
  M.mInv(m.A4).forEach((row, i) => row.forEach((v, j) => close(v, m.inv[i][j], 1e-12, `inverse[${i}][${j}]`)));
  M.mMul(m.A4, M.mInv(m.A4)).forEach((row, i) => row.forEach((v, j) => close(v, i === j ? 1 : 0, 1e-12, "A x inverse")));
  close(M.mDet(m.hilb), m.hilb4det, 1e-8, "Hilbert 4 determinant");
  const h3 = [[1, 1 / 2, 1 / 3], [1 / 2, 1 / 3, 1 / 4], [1 / 3, 1 / 4, 1 / 5]];
  M.mInv(h3).forEach((row, i) => row.forEach((v, j) => close(v, m.hilbInv[i][j], 1e-9, "Hilbert 3 inverse")));
  assert.equal(M.mDet(m.magic), 0);
  assert.equal(M.mRank(m.magic), 3);
  assert.equal(M.mDet([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 0);
});

test("polynomial roots agree with NumPy", () => {
  for (const [coefs, refRoots] of data.P) {
    const got = S.polyRoots(coefs).map((z) => [z.re, z.im]);
    const multi = coefs.join() === "1,-4,6,-4,1", tol = multi ? 2e-3 : 1e-8;
    assert.equal(got.length, refRoots.length);
    const key = (z) => [Math.round(z[0] / (multi ? 1e-2 : 1e-4)), Math.round(z[1] / (multi ? 1e-2 : 1e-4))];
    const a = got.slice().sort((p, q) => key(p)[0] - key(q)[0] || key(p)[1] - key(q)[1]), b = refRoots.slice().sort((p, q) => key(p)[0] - key(q)[0] || key(p)[1] - key(q)[1]);
    a.forEach((z, i) => { close(z[0], b[i][0], tol, `root re of ${coefs}`); close(z[1], b[i][1], tol, `root im of ${coefs}`); });
  }
});

test("a very small root is not lost to rounding", () => {
  const r = S.polyRoots([1, -1e8, 1]).map((z) => z.re);
  close(r[0] / 1e-8, 1, 1e-12, "small root x1");
  close(r[1] / 1e8, 1, 1e-14, "large root x2");
  const s = S.polyRoots([1, 1e8, 1]).map((z) => z.re);
  close(s[1] / -1e-8, 1, 1e-12, "small negative root");
});

test("undefined results raise errors instead of numbers", () => {
  config({ ang: "DEG" });
  for (const e of ["tan(90)", "tan(270)", "tan(−90)", "0^0", "ln(0)", "log(−1)", "1÷0", "(−8)!", "171!", "asin(2)", "acos(−1.5)", "acosh(0.5)", "atanh(1)", "0^0", "0^(−1)"])
    assert.throws(() => fmt(ev(e)), /Math Error/, e);
  config({ ang: "GRAD" });
  assert.throws(() => fmt(ev("tan(100)")), /Math Error/, "tan(100 grad)");
  config({ ang: "RAD" });
  assert.throws(() => fmt(ev("tan(π÷2)")), /Math Error/, "tan(pi/2) in radians");
  config({ ang: "DEG" });
});
