"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSheet } = require("../sheet.js");
const { evNum } = require("../calc.js");

const sheet = (cells) => makeSheet((r) => cells[r] || "", evNum);

test("numbers, text and blanks", () => {
  const s = sheet({ A1: "10", A2: "1÷4", A3: "hello" });
  assert.equal(s.value("A1"), 10);
  assert.equal(s.value("A2"), 0.25);
  assert.equal(s.value("A3"), "hello");
  assert.equal(s.value("A4"), null);
});

test("formulas with cell references", () => {
  const s = sheet({ A1: "10", A2: "20", A3: "=A1+A2", B1: "=A3×2", B2: "=a1+a2", B3: "=2^A1", B4: "=A1÷4" });
  assert.equal(s.value("A3"), 30);
  assert.equal(s.value("B1"), 60);
  assert.equal(s.value("B2"), 30);
  assert.equal(s.value("B3"), 1024);
  assert.equal(s.value("B4"), 2.5);
});

test("a blank cell counts as zero in a formula", () => {
  assert.equal(sheet({ A1: "5", B1: "=A1+A2" }).value("B1"), 5);
});

test("range functions", () => {
  const c = { A1: "10", A2: "20", A3: "30", A4: "text", A5: "", B1: "=SUM(A1:A5)", B2: "=AVERAGE(A1:A3)", B3: "=MAX(A1:A3)-MIN(A1:A3)",
    B4: "=COUNT(A1:A5)", B5: "=sum(a3:a1)", B6: "=AVG(A1:A3)×2", C1: "5", D1: "=SUM(A1:C1)", E1: "=SUM(A1:A3)÷COUNT(A1:A3)" };
  const s = sheet(c);
  assert.equal(s.value("B1"), 60);
  assert.equal(s.value("B2"), 20);
  assert.equal(s.value("B3"), 20);
  assert.equal(s.value("B4"), 3);
  assert.equal(s.value("B5"), 60);
  assert.equal(s.value("B6"), 40);
  assert.equal(s.value("D1"), 75); // A1 + B1 (which is 60) + C1
  assert.equal(s.value("E1"), 20);
});

test("small and large numbers in formulas", () => {
  const s = sheet({ A1: "1E-9", A2: "2.5E12", B1: "=A1×1E9", B2: "=A2+1" });
  assert.equal(s.value("B1"), 1);
  assert.equal(s.value("B2"), 2500000000001);
});

test("errors are reported and passed along", () => {
  const s = sheet({ A1: "=C1", C1: "=A1", B1: "=1÷0", B2: "=B1+1", B3: "=A4", B4: "=SUM(D1:D3)", B5: "=A5+1", A5: "word", B6: "=Z9", B7: "=(" });
  assert.throws(() => s.value("A1"), /Circular/);
  assert.throws(() => s.value("B1"), /Math Error/);
  assert.throws(() => s.value("B2"), /Math Error/);
  assert.equal(s.value("B3"), 0);
  assert.throws(() => s.value("B4"), /No numbers/);
  assert.throws(() => s.value("B5"), /Text used/);
  assert.throws(() => s.value("B6"));
  assert.throws(() => s.value("B7"), /Syntax Error/);
  assert.throws(() => s.value("F1"), /Bad cell/);
});
