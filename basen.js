"use strict";
/* SIMPRO_CALCULATOR Base-N: 32-bit two's-complement whole-number arithmetic, like a Casio. */
const bnWrap=v=>BigInt.asIntN(32,v);
function evalBase(src,base){
 const s=src.trim();if(!s)throw new Error("Syntax Error");
 const tk=[],digs=base===16?/^[0-9A-Fa-f]+/:/^[0-9]+/;let i=0;
 while(i<s.length){const r=s.slice(i);let m;
  if(r[0]===" "){i++;continue}
  if((m=/^(xnor|xor|and|or|not|neg)(?![0-9A-Za-z])/i.exec(r))){tk.push({w:m[1].toLowerCase()});i+=m[0].length;continue}
  if((m=digs.exec(r))){let v=0n;for(const ch of m[0]){const d=BigInt(parseInt(ch,16));if(d>=BigInt(base))throw new Error("Syntax Error");v=v*BigInt(base)+d}
   if(v>(base===10?2147483647n:4294967295n))throw new Error("Math Error");tk.push({n:base===10?v:bnWrap(v)});i+=m[0].length;continue}
  if("+-−×÷*/()".includes(r[0])){tk.push({o:r[0]==="−"?"-":r[0]==="*"?"×":r[0]==="/"?"÷":r[0]});i++;continue}
  throw new Error("Syntax Error")}
 let p=0;const isO=o=>tk[p]&&tk[p].o===o,isW=w=>tk[p]&&tk[p].w===w;
 const prim=()=>{const t=tk[p++];if(!t)throw new Error("Syntax Error");if(t.n!==undefined)return t.n;if(t.o==="("){const v=orx();if(!isO(")"))throw new Error("Syntax Error");p++;return v}throw new Error("Syntax Error")};
 const un=()=>{if(isO("-")){p++;return bnWrap(-un())}if(isO("+")){p++;return un()}if(isW("not")){p++;return bnWrap(~un())}if(isW("neg")){p++;return bnWrap(-un())}return prim()};
 const mul=()=>{let a=un();while(isO("×")||isO("÷")){const o=tk[p++].o,b=un();if(o==="×")a=bnWrap(a*b);else{if(b===0n)throw new Error("Math Error");a=bnWrap(a/b)}}return a};
 const add=()=>{let a=mul();while(isO("+")||isO("-")){const o=tk[p++].o,b=mul();a=bnWrap(o==="+"?a+b:a-b)}return a};
 const and=()=>{let a=add();while(isW("and")){p++;a=bnWrap(a&add())}return a};
 const orx=()=>{let a=and();while(isW("or")||isW("xor")||isW("xnor")){const w=tk[p++].w,b=and();a=bnWrap(w==="or"?a|b:w==="xor"?a^b:~(a^b))}return a};
 const v=orx();if(p<tk.length)throw new Error("Syntax Error");return v}
function toBase(v,b){if(b===10)return v.toString();const s=BigInt.asUintN(32,v).toString(b).toUpperCase();if(b!==2)return s;
 return s.padStart(Math.ceil(s.length/4)*4,"0").replace(/(.{4})(?=.)/g,"$1 ")}
if(typeof module!=="undefined")module.exports={evalBase,toBase};
