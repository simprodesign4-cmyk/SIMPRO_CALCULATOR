"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const m = require("../matrix.js");

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} is not close to ${b}`);
const nearM = (A, B, tol = 1e-9) => { assert.equal(A.length, B.length); A.forEach((r, i) => r.forEach((v, j) => near(v, B[i][j], tol))); };

test("add, subtract, scale, transpose", () => {
  assert.deepEqual(m.mAdd([[1, 2], [3, 4]], [[5, 6], [7, 8]]), [[6, 8], [10, 12]]);
  assert.deepEqual(m.mSub([[5, 6], [7, 8]], [[1, 2], [3, 4]]), [[4, 4], [4, 4]]);
  assert.deepEqual(m.mScale(2, [[1, -2]]), [[2, -4]]);
  assert.deepEqual(m.mTranspose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]]);
  assert.throws(() => m.mAdd([[1, 2]], [[1], [2]]), /Dimension Error/);
});

test("multiplication", () => {
  assert.deepEqual(m.mMul([[1, 2], [3, 4]], [[5, 6], [7, 8]]), [[19, 22], [43, 50]]);
  assert.deepEqual(m.mMul([[1, 2, 3]], [[1], [2], [3]]), [[14]]);
  assert.throws(() => m.mMul([[1, 2]], [[1, 2]]), /Dimension Error/);
});

test("determinant", () => {
  near(m.mDet([[1, 2], [3, 4]]), -2);
  near(m.mDet([[1, 2, 3], [0, 1, 4], [5, 6, 0]]), 1);
  assert.equal(m.mDet([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 0);
  assert.equal(m.mDet([[1, 2], [2, 4]]), 0);
  near(m.mDet([[2]]), 2);
  assert.throws(() => m.mDet([[1, 2, 3], [4, 5, 6]]), /Dimension Error/);
});

test("inverse", () => {
  nearM(m.mInv([[1, 2, 3], [0, 1, 4], [5, 6, 0]]), [[-24, 18, 5], [20, -15, -4], [-5, 4, 1]]);
  nearM(m.mInv([[4, 7], [2, 6]]), [[0.6, -0.7], [-0.2, 0.4]]);
  nearM(m.mMul([[4, 7], [2, 6]], m.mInv([[4, 7], [2, 6]])), [[1, 0], [0, 1]]);
  assert.throws(() => m.mInv([[1, 2], [2, 4]]), /Math Error/);
  assert.throws(() => m.mInv([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), /Math Error/);
});

test("row reduction and rank", () => {
  nearM(m.mRref([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [[1, 0, -1], [0, 1, 2], [0, 0, 0]]);
  assert.equal(m.mRank([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 2);
  assert.equal(m.mRank([[1, 0], [0, 1]]), 2);
  assert.equal(m.mRank([[0, 0], [0, 0]]), 0);
  nearM(m.mRref([[2, 1, 5], [1, -1, 1]]), [[1, 0, 2], [0, 1, 1]]);
});

test("trace, identity and powers", () => {
  assert.equal(m.mTrace([[1, 2], [3, 4]]), 5);
  assert.deepEqual(m.mIdentity(3), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  assert.deepEqual(m.mPow([[1, 1], [1, 0]], 5), [[8, 5], [5, 3]]);
  assert.deepEqual(m.mPow([[2, 0], [0, 3]], 0), [[1, 0], [0, 1]]);
  nearM(m.mPow([[2, 0], [0, 4]], -1), [[0.5, 0], [0, 0.25]]);
  assert.throws(() => m.mPow([[1, 2]], 2), /Dimension Error/);
});

test("vectors", () => {
  assert.equal(m.mDot([[1, 2, 3]], [[4], [5], [6]]), 32);
  assert.deepEqual(m.mCross([[1, 0, 0]], [[0, 1, 0]]), [[0, 0, 1]]);
  assert.deepEqual(m.mCross([[1], [0], [0]], [[0], [1], [0]]), [[0], [0], [1]]);
  near(m.mNorm([[3, 4]]), 5);
  near(m.mAngle([[1, 0]], [[0, 1]]), Math.PI / 2);
  near(m.mAngle([[1, 1]], [[1, 1]]), 0, 1e-7);
  assert.throws(() => m.mDot([[1, 2]], [[1, 2, 3]]), /Dimension Error/);
  assert.throws(() => m.mCross([[1, 2]], [[3, 4]]), /Dimension Error/);
  assert.throws(() => m.mNorm([[1, 2], [3, 4]]), /Dimension Error/);
  assert.throws(() => m.mAngle([[0, 0]], [[1, 1]]), /Math Error/);
});
