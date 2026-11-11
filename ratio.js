"use strict";
/* SIMPRO_CALCULATOR ratios: solve a:b = c:d, share a total, simplify. */
const rgcd=(a,b)=>b?rgcd(b,a%b):a;
// a:b = c:d with exactly one value null (blank); returns {index, value}
function solveRatio(a,b,c,d){const v=[a,b,c,d],blanks=v.filter(x=>x===null).length;
 if(blanks!==1)throw new Error("Leave exactly one value blank");
 const i=v.indexOf(null),[A,B,C,D]=v,bad=()=>{throw new Error("Math Error")};let x;
 if(i===0){if(D===0)bad();x=B*C/D}else if(i===1){if(C===0)bad();x=A*D/C}else if(i===2){if(B===0)bad();x=A*D/B}else{if(A===0)bad();x=B*C/A}
 return{index:i,value:x}}
function shareRatio(total,parts){if(parts.length<2)throw new Error("Give at least two parts");
 if(parts.some(p=>!(p>=0)))throw new Error("Parts must not be negative");const sum=parts.reduce((s,p)=>s+p,0);
 if(sum===0)throw new Error("Math Error");return parts.map(p=>total*p/sum)}
function simplifyRatio(parts){if(parts.length<2)throw new Error("Give at least two parts");
 if(parts.some(p=>!(p>=0))||parts.every(p=>p===0))throw new Error("Parts must be positive numbers");
 for(let k=0;k<=6;k++){const f=Math.pow(10,k),ints=parts.map(p=>Math.round(p*f));
  if(parts.every((p,i)=>Math.abs(p*f-ints[i])<1e-9*Math.max(1,p*f))){const g=ints.reduce((s,x)=>rgcd(s,x),0);return ints.map(x=>x/g)}}
 throw new Error("Cannot simplify this ratio")}
if(typeof module!=="undefined")module.exports={solveRatio,shareRatio,simplifyRatio};
