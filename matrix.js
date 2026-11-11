"use strict";
/* SIMPRO_CALCULATOR matrices and vectors. A matrix is an array of rows of numbers. */
const mErr=m=>{throw new Error(m)};
const mClean=A=>A.map(r=>r.map(v=>Math.abs(v)<1e-12?0:v));
const mSame=(A,B)=>{if(A.length!==B.length||A[0].length!==B[0].length)mErr("Dimension Error")};
const mSquare=A=>{if(A.length!==A[0].length)mErr("Dimension Error")};
const mMax=A=>A.reduce((s,r)=>r.reduce((t,v)=>Math.max(t,Math.abs(v)),s),0);
const mAdd=(A,B)=>{mSame(A,B);return A.map((r,i)=>r.map((v,j)=>v+B[i][j]))};
const mSub=(A,B)=>{mSame(A,B);return A.map((r,i)=>r.map((v,j)=>v-B[i][j]))};
const mMul=(A,B)=>{if(A[0].length!==B.length)mErr("Dimension Error");return A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)))};
const mScale=(k,A)=>A.map(r=>r.map(v=>k*v));
const mTranspose=A=>A[0].map((_,j)=>A.map(r=>r[j]));
const mIdentity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
function mDet(A){mSquare(A);const n=A.length,M=A.map(r=>r.slice()),sc=mMax(A);let d=1;
 for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
  if(M[p][c]===0)return 0;if(p!==c){[M[p],M[c]]=[M[c],M[p]];d=-d}d*=M[c][c];
  for(let r=c+1;r<n;r++){const f=M[r][c]/M[c][c];for(let k=c;k<n;k++)M[r][k]-=f*M[c][k]}}
 return Math.abs(d)<1e-14*Math.pow(sc,n)?0:d}
function mInv(A){mSquare(A);const n=A.length,sc=mMax(A),M=A.map((r,i)=>[...r,...mIdentity(n)[i]]);
 for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
  if(Math.abs(M[p][c])<1e-12*(sc||1))mErr("Math Error");[M[c],M[p]]=[M[p],M[c]];const d=M[c][c];for(let k=0;k<2*n;k++)M[c][k]/=d;
  for(let r=0;r<n;r++)if(r!==c){const f=M[r][c];if(f!==0)for(let k=0;k<2*n;k++)M[r][k]-=f*M[c][k]}}
 return mClean(M.map(r=>r.slice(n)))}
function mRref(A){const M=A.map(r=>r.slice()),R=M.length,Cc=M[0].length,tol=1e-12*(mMax(A)||1);let row=0;
 for(let c=0;c<Cc&&row<R;c++){let p=row;for(let r=row+1;r<R;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
  if(Math.abs(M[p][c])<tol)continue;[M[row],M[p]]=[M[p],M[row]];const d=M[row][c];for(let k=0;k<Cc;k++)M[row][k]/=d;
  for(let r=0;r<R;r++)if(r!==row){const f=M[r][c];for(let k=0;k<Cc;k++)M[r][k]-=f*M[row][k]}row++}
 return mClean(M)}
const mRank=A=>mRref(A).filter(r=>r.some(v=>v!==0)).length;
const mTrace=A=>{mSquare(A);return A.reduce((s,r,i)=>s+r[i],0)};
function mPow(A,n){mSquare(A);if(!Number.isInteger(n))mErr("Math Error");if(n<0)return mPow(mInv(A),-n);let R=mIdentity(A.length),B=A;
 while(n>0){if(n&1)R=mMul(R,B);B=mMul(B,B);n=Math.floor(n/2)}return R}
const mVec=A=>{if(A.length!==1&&A[0].length!==1)mErr("Dimension Error");return A.flat()};
function mDot(A,B){const a=mVec(A),b=mVec(B);if(a.length!==b.length)mErr("Dimension Error");return a.reduce((s,v,i)=>s+v*b[i],0)}
function mCross(A,B){const a=mVec(A),b=mVec(B);if(a.length!==3||b.length!==3)mErr("Dimension Error");
 const c=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];return A.length===1?[c]:c.map(v=>[v])}
const mNorm=A=>Math.hypot(...mVec(A));
function mAngle(A,B){const n=mNorm(A)*mNorm(B);if(n===0)mErr("Math Error");return Math.acos(Math.max(-1,Math.min(1,mDot(A,B)/n)))}
if(typeof module!=="undefined")module.exports={mAdd,mSub,mMul,mScale,mTranspose,mIdentity,mDet,mInv,mRref,mRank,mTrace,mPow,mDot,mCross,mNorm,mAngle};
