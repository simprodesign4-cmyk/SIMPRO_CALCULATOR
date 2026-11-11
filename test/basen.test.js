"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { evalBase, toBase } = require("../basen.js");

test("numbers in each base", () => {
  assert.equal(evalBase("1010", 2), 10n);
  assert.equal(evalBase("FF", 16), 255n);
  assert.equal(evalBase("ff", 16), 255n);
  assert.equal(evalBase("17", 8), 15n);
  assert.equal(evalBase("255", 10), 255n);
});

test("arithmetic and precedence", () => {
  assert.equal(evalBase("A+B", 16), 21n);
  assert.equal(evalBase("2+3×4", 10), 14n);
  assert.equal(evalBase("(2+3)×4", 10), 20n);
  assert.equal(evalBase("7÷2", 10), 3n);
  assert.equal(evalBase("-7÷2", 10), -3n);
  assert.equal(evalBase("-5+2", 10), -3n);
  assert.equal(evalBase("1010+1", 2), 11n);
});

test("logic operations", () => {
  assert.equal(evalBase("12 and 10", 10), 8n);
  assert.equal(evalBase("12 or 3", 10), 15n);
  assert.equal(evalBase("12 xor 10", 10), 6n);
  assert.equal(evalBase("12 xnor 10", 10), -7n);
  assert.equal(evalBase("not(0)", 10), -1n);
  assert.equal(evalBase("not 5", 10), -6n);
  assert.equal(evalBase("neg(5)", 10), -5n);
  assert.equal(evalBase("1 or 2 and 0", 10), 1n);
  assert.equal(evalBase("F0 AND 3C", 16), 0x30n);
  assert.equal(evalBase("FF xor 0F", 16), 0xF0n);
  assert.equal(evalBase("1100 and 1010", 2), 8n);
});

test("32-bit wrap-around", () => {
  assert.equal(evalBase("7FFFFFFF+1", 16), -2147483648n);
  assert.equal(evalBase("FFFFFFFF", 16), -1n);
  assert.equal(evalBase("2147483647+1", 10), -2147483648n);
  assert.equal(evalBase("80000000", 16), -2147483648n);
});

test("showing a number in every base", () => {
  assert.equal(toBase(255n, 10), "255");
  assert.equal(toBase(255n, 16), "FF");
  assert.equal(toBase(255n, 2), "1111 1111");
  assert.equal(toBase(255n, 8), "377");
  assert.equal(toBase(5n, 2), "0101");
  assert.equal(toBase(-1n, 16), "FFFFFFFF");
  assert.equal(toBase(-1n, 10), "-1");
  assert.equal(toBase(-1n, 8), "37777777777");
  assert.equal(toBase(-2n, 2), "1111 1111 1111 1111 1111 1111 1111 1110");
  assert.equal(toBase(0n, 2), "0000");
});

test("errors", () => {
  assert.throws(() => evalBase("2", 2), /Syntax Error/);
  assert.throws(() => evalBase("9", 8), /Syntax Error/);
  assert.throws(() => evalBase("G", 16), /Syntax Error/);
  assert.throws(() => evalBase("A", 10), /Syntax Error/);
  assert.throws(() => evalBase("", 10), /Syntax Error/);
  assert.throws(() => evalBase("1+", 10), /Syntax Error/);
  assert.throws(() => evalBase("(1", 10), /Syntax Error/);
  assert.throws(() => evalBase("5÷0", 10), /Math Error/);
  assert.throws(() => evalBase("2147483648", 10), /Math Error/);
  assert.throws(() => evalBase("100000000", 16), /Math Error/);
});
