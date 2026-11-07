"use strict";
/* SIMPRO_CALCULATOR engine: maths, expression evaluation and number formatting.
   Works in the browser (shared globals with ui.js) and in Node (see test/). */
const C={c:299792458,h:6.62607015e-34,g:9.80665,G:6.6743e-11,kB:1.380649e-23,NA:6.02214076e23,q:1.602176634e-19,me:9.1093837015e-31,e0:8.8541878128e-12,mu0:1.25663706212e-6,R:8.314462618,sigma:5.670374419e-8};

let ans=0,ang="DEG",fm="NORM";
const V={A:0,B:0,C:0,D:0,E:0,F:0,M:0,x:0,y:0};
function config(o){if(o.ang)ang=o.ang;if(o.fm)fm=o.fm;if("ans" in o)ans=o.ans;if(o.V)Object.assign(V,o.V)}
const rad=v=>ang=="DEG"?v*Math.PI/180:ang=="GRAD"?v*Math.PI/200:v;
const deg=v=>ang=="DEG"?v*180/Math.PI:ang=="GRAD"?v*200/Math.PI:v;
const z=v=>Math.abs(v)<1e-14?0:v;
function gamma(x){if(x<0.5)return Math.PI/(Math.sin(Math.PI*x)*gamma(1-x));x-=1;const g=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];let a=0.99999999999980993,t=x+7.5;g.forEach((c,i)=>a+=c/(x+i+1));return Math.sqrt(2*Math.PI)*Math.pow(t,x+.5)*Math.exp(-t)*a}
const fact=n=>Number.isInteger(n)&&n>=0&&n<=170?(()=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r})():(n<0&&Number.isInteger(n)?NaN:gamma(n+1));
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const M={sin:v=>z(Math.sin(rad(v))),cos:v=>z(Math.cos(rad(v))),tan:v=>z(Math.tan(rad(v))),asin:v=>deg(Math.asin(v)),acos:v=>deg(Math.acos(v)),atan:v=>deg(Math.atan(v)),
sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,log:Math.log10,ln:Math.log,lb:Math.log2,logb:(b,v)=>Math.log(v)/Math.log(b),sqrt:Math.sqrt,cbrt:Math.cbrt,
root:(v,n)=>v<0&&n%2?-Math.pow(-v,1/n):Math.pow(v,1/n),abs:Math.abs,sgn:Math.sign,fact,rand:Math.random,ranint:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),round:Math.round,int:Math.trunc,mod:(a,b)=>a%b,gcd,lcm:(a,b)=>Math.abs(a*b)/gcd(a,b),
nPr:(n,r)=>fact(n)/fact(n-r),nCr:(n,r)=>fact(n)/(fact(r)*fact(n-r)),
integ:(f,a,b)=>{const n=2000,h=(b-a)/n;let s=ev(f,a)+ev(f,b);for(let i=1;i<n;i++)s+=ev(f,a+i*h)*(i%2?4:2);return s*h/3},
sum:(f,a,b)=>{let s=0;for(let i=Math.round(a);i<=Math.round(b);i++)s+=ev(f,i);return s},
deriv:(f,a)=>{const h=1e-3;return(-ev(f,a+2*h)+8*ev(f,a+h)-8*ev(f,a-h)+ev(f,a-2*h))/(12*h)}};
function split(s,i){let d=0,p=[],st=i;for(let k=i;k<s.length;k++){const c=s[k];if(c=="(")d++;else if(c==")"){if(d==0){p.push(s.slice(st,k));return[p,k]}d--}else if(c==","&&d==0){p.push(s.slice(st,k));st=k+1}}throw Error("paren")}
function ev(s,x){
 const S=[];
 s=s.replace(/Ans/g,"("+ans+")").replace(/\[(\w+)\]/g,(_,k)=>"("+C[k]+")");
 for(const n of["integ","sum","deriv"]){let i,f=0;while((i=s.indexOf(n+"(",f))>=0){const[p,e]=split(s,i+n.length+1);S.push(p[0]);const r=n+"(#"+(S.length-1)+(p.length>1?","+p.slice(1).join(","):"")+")";s=s.slice(0,i)+r+s.slice(e+1);f=i+n.length+1}}
 s=s.replace(/−(\d+\.?\d*|\([^()]*\))\^(\d+\.?\d*|\([^()]*\))/g,"−($1^$2)").replace(/ℯ/g,"(2.718281828459045)").replace(/π/g,"(3.141592653589793)").replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/\^/g,"**").replace(/%/g,"/100").replace(/(\d|\.)E([+-]?\d)/g,"$1@$2");
 let i;while((i=s.indexOf("!"))>=0){let j;if(s[i-1]==")"){let d=0;for(j=i-1;j>=0;j--){if(s[j]==")")d++;if(s[j]=="("&&--d==0)break}}else{const m=/(\d+\.?\d*)$/.exec(s.slice(0,i));if(!m)throw Error("fact");j=i-m[1].length}s=s.slice(0,j)+"fact("+s.slice(j,i)+")"+s.slice(i+1)}
 s=s.replace(/[a-zA-Z_]+/g,w=>w=="x"?"x":/^[A-FMy]$/.test(w)?"V."+w:"M."+w).replace(/(\d|\))(?=[a-zA-Z(])/g,"$1*").replace(/\)(?=\d)/g,")*").replace(/@/g,"e").replace(/#(\d+)/g,"S[$1]");
 return Function("M","x","S","V",'"use strict";return '+s)(M,x===undefined?V.x:x,S,V)}
function fmt(v){if(typeof v!="number"||!isFinite(v))throw Error("math");
 if(fm=="SCI")return v.toExponential(8).replace(/\.?0+e/,"e").replace("e","×10^").replace("^+","^");
 if(fm=="ENG"){if(v==0)return"0";const e=Math.floor(Math.log10(Math.abs(v))/3)*3;return parseFloat((v/10**e).toPrecision(10))+"×10^"+e}
 const s=parseFloat(v.toPrecision(12));return Math.abs(s)>=1e12||(s!=0&&Math.abs(s)<1e-7)?s.toExponential().replace("e","×10^").replace("^+","^"):String(s)}
function frac(v){if(Number.isInteger(v))return null;let h1=1,h0=0,k1=0,k0=1,b=Math.abs(v);for(let i=0;i<30;i++){const a=Math.floor(b),h=a*h1+h0,k=a*k1+k0;h0=h1;h1=h;k0=k1;k1=k;if(k>1e4)return null;if(Math.abs(Math.abs(v)-h/k)<1e-9*Math.abs(v))return(v<0?"−":"")+h+"/"+k;b=1/(b-a);if(!isFinite(b))break}return null}


if(typeof module!=="undefined")module.exports={ev,fmt,frac,config,M,C,V};
