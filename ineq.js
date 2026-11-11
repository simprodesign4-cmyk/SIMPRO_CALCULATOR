"use strict";
/* SIMPRO_CALCULATOR polynomial inequalities, such as ax^2+bx+c > 0. Needs polyRoots from solvers.js. */
const _pr=typeof polyRoots!=="undefined"?polyRoots:require("./solvers.js").polyRoots;
const ipoly=(c,x)=>c.reduce((s,a)=>s*x+a,0);
// coefs: highest power first; rel: ">" "<" "≥" "≤". Returns {roots, intervals:[{lo,hi,loIn,hiIn}]}
function solveIneq(coefs,rel){const c=coefs.slice();while(c.length>1&&c[0]===0)c.shift();if(c.length<2)throw new Error("Degree must be at least 1");
 let rs=_pr(c).filter(z=>z.im===0).map(z=>z.re).sort((a,b)=>a-b);const roots=[];
 for(const r of rs){const l=roots[roots.length-1];if(l!==undefined&&Math.abs(r-l)<1e-6*(1+Math.abs(r)))roots[roots.length-1]=(l+r)/2;else roots.push(r)}
 const incl=rel==="≥"||rel==="≤",pos=rel===">"||rel==="≥",ok=v=>pos?v>0:v<0;
 const reg=[];const n=roots.length;
 for(let i=0;i<=n;i++){const lo=i===0?-Infinity:roots[i-1],hi=i===n?Infinity:roots[i];
  const t=n===0?0:i===0?roots[0]-1:i===n?roots[n-1]+1:(lo+hi)/2;reg.push({lo,hi,sat:ok(ipoly(c,t)),root:false});
  if(i<n)reg.push({lo:roots[i],hi:roots[i],sat:incl,root:true})}
 const out=[];let cur=null;
 for(const g of reg){if(!g.sat){cur=null;continue}
  if(cur){cur.hi=g.hi;cur.hiIn=g.root}else{cur={lo:g.lo,hi:g.hi,loIn:g.root,hiIn:g.root};out.push(cur)}}
 out.forEach(o=>{if(o.lo===-Infinity)o.loIn=false;if(o.hi===Infinity)o.hiIn=false});
 return{roots,intervals:out}}
// readable text for each interval; fmt turns a number into text
function describeIneq(res,fmt){const{intervals:iv}=res;if(!iv.length)return["No solution"];
 return iv.map(o=>{if(o.lo===-Infinity&&o.hi===Infinity)return"All real x";
  if(o.lo===o.hi)return"x = "+fmt(o.lo);
  if(o.lo===-Infinity)return"x "+(o.hiIn?"≤ ":"< ")+fmt(o.hi);
  if(o.hi===Infinity)return"x "+(o.loIn?"≥ ":"> ")+fmt(o.lo);
  return fmt(o.lo)+(o.loIn?" ≤ ":" < ")+"x"+(o.hiIn?" ≤ ":" < ")+fmt(o.hi)})}
if(typeof module!=="undefined")module.exports={solveIneq,describeIneq};
