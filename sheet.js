"use strict";
/* SIMPRO_CALCULATOR spreadsheet: cells A-E, rows 1-99. Cells hold numbers, text, or formulas such as =A1+A2 or =SUM(A1:A5). */
// raw(ref) gives the typed text of a cell ("" when empty); evNum evaluates an expression to a number.
function makeSheet(raw,evNum){const cache=new Map(),visiting=new Set();
 const cellOf=r=>{const m=/^([A-E])(\d{1,2})$/i.exec(r);if(!m||+m[2]<1)throw new Error("Bad cell "+r);return[m[1].toUpperCase().charCodeAt(0)-65,+m[2]]};
 const refOf=(c,r)=>String.fromCharCode(65+c)+r;
 function value(ref){ref=refOf(...cellOf(ref));
  if(cache.has(ref)){const v=cache.get(ref);if(v instanceof Error)throw v;return v}
  if(visiting.has(ref))throw new Error("Circular reference");visiting.add(ref);
  try{const v=compute(raw(ref));cache.set(ref,v);return v}catch(e){cache.set(ref,e);throw e}finally{visiting.delete(ref)}}
 function compute(txt){const s=(txt||"").trim();if(s==="")return null;
  if(s[0]!=="="){try{return evNum(s)}catch(_){return s}}
  return expand(s.slice(1))}
 const num=v=>{if(v===null)return 0;if(typeof v==="string")throw new Error("Text used in a formula");return v};
 function range(fn,a,b){const[c1,r1]=cellOf(a),[c2,r2]=cellOf(b),nums=[];
  for(let c=Math.min(c1,c2);c<=Math.max(c1,c2);c++)for(let r=Math.min(r1,r2);r<=Math.max(r1,r2);r++){const v=value(refOf(c,r));if(typeof v==="number")nums.push(v)}
  if(fn==="COUNT")return nums.length;if(!nums.length)throw new Error("No numbers in "+a+":"+b);
  if(fn==="SUM")return nums.reduce((s,x)=>s+x,0);if(fn==="MIN")return Math.min(...nums);if(fn==="MAX")return Math.max(...nums);
  return nums.reduce((s,x)=>s+x,0)/nums.length}
 const lit=v=>"("+String(v).replace("e","E")+")";
 function expand(f){
  f=f.replace(/\b(SUM|AVERAGE|AVG|MIN|MAX|COUNT)\(\s*([A-Ea-e]\d{1,2})\s*:\s*([A-Ea-e]\d{1,2})\s*\)/gi,(_,fn,a,b)=>lit(range(fn.toUpperCase()==="AVG"?"AVERAGE":fn.toUpperCase(),a,b)));
  f=f.replace(/\b([A-Ea-e]\d{1,2})\b/g,(_,r)=>lit(num(value(r))));
  return evNum(f)}
 return{value}}
if(typeof module!=="undefined")module.exports={makeSheet};
