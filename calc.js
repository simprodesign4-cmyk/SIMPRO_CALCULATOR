"use strict";
/* SIMPRO_CALCULATOR engine (v2): tokenizer -> parser -> evaluator.
   Values are exact fractions (Q), complex numbers (Cx) or plain floats.
   Works in the browser (shared globals with ui.js) and in Node (see test/). */
// SI-defined constants are exact; the rest are CODATA 2022 recommended values. R and sigma follow from the exact ones.
const C={c:299792458,h:6.62607015e-34,g:9.80665,G:6.6743e-11,kB:1.380649e-23,NA:6.02214076e23,q:1.602176634e-19,me:9.1093837139e-31,e0:8.8541878188e-12,mu0:1.25663706127e-6,R:8.31446261815324,sigma:5.670374419184429e-8};
let ans=0,ang="DEG",fm="NORM",fixN=null;
const V={A:0,B:0,C:0,D:0,E:0,F:0,M:0,x:0,y:0};
function config(o){if(o.ang)ang=o.ang;if("fix" in o)fixN=o.fix;if(o.fm)fm=o.fm;if("ans" in o)ans=o.ans;if(o.V)Object.assign(V,o.V)}

// ---- errors
const SYN="Syntax Error",MTH="Math Error",ARG="Argument Error";
class CalcError extends Error{constructor(m){super(m);this.kind=m}}
const err=m=>{throw new CalcError(m)};

// ---- value types
const bgcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b]}return a};
class Q{constructor(n,d=1n){if(d===0n)err(MTH);if(d<0n){n=-n;d=-d}const g=bgcd(n,d)||1n;this.n=n/g;this.d=d/g}num(){return Number(this.n)/Number(this.d)}}
class Cx{constructor(re,im){this.re=re;this.im=im}}
class Str{constructor(s){this.s=s}}
const isQ=v=>v instanceof Q,isC=v=>v instanceof Cx;
const real=v=>isQ(v)?v.num():isC(v)||v instanceof Str?err(ARG):v;
const toC=v=>isC(v)?v:new Cx(real(v),0);
const mkC=(re,im)=>{const m=Math.hypot(re,im)||1;if(Math.abs(im)<1e-14*m)im=0;if(Math.abs(re)<1e-14*m)re=0;return im===0?re:new Cx(re,im)};
const chk=x=>{if(typeof x==="number"&&!isFinite(x))err(MTH);return x};
const intQ=x=>Number.isSafeInteger(x)?new Q(BigInt(x)):x;
const toBig=v=>isQ(v)&&v.d===1n?v.n:(typeof v==="number"&&Number.isInteger(v)?BigInt(v):null);

// ---- arithmetic
const add=(a,b)=>{if(isC(a)||isC(b)){a=toC(a);b=toC(b);return mkC(a.re+b.re,a.im+b.im)}if(isQ(a)&&isQ(b))return new Q(a.n*b.d+b.n*a.d,a.d*b.d);return chk(real(a)+real(b))};
const neg=a=>isQ(a)?new Q(-a.n,a.d):isC(a)?new Cx(-a.re,-a.im):-a;
const sub=(a,b)=>add(a,neg(b));
const mul=(a,b)=>{if(isC(a)||isC(b)){a=toC(a);b=toC(b);return mkC(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re)}if(isQ(a)&&isQ(b))return new Q(a.n*b.n,a.d*b.d);return chk(real(a)*real(b))};
const div=(a,b)=>{if(isC(a)||isC(b)){a=toC(a);b=toC(b);const d=b.re*b.re+b.im*b.im;if(d===0)err(MTH);return mkC((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d)}
 if(isQ(a)&&isQ(b)){if(b.n===0n)err(MTH);return new Q(a.n*b.d,a.d*b.n)}const y=real(b);if(y===0)err(MTH);return chk(real(a)/y)};
function pow(a,b){
 if((isQ(a)?a.n===0n:a===0)&&(isQ(b)?b.n===0n:b===0))err(MTH);
 if(isQ(a)&&isQ(b)&&b.d===1n&&b.n<=400n&&b.n>=-400n){let e=b.n,n=a.n,d=a.d;if(e<0n){if(n===0n)err(MTH);[n,d]=[d,n];e=-e}if(n**e<10n**2000n&&d**e<10n**2000n)return new Q(n**e,d**e)}
 const cx=isC(a)||isC(b)||(real(a)<0&&!Number.isInteger(real(b)));
 if(cx){const x=toC(a),y=toC(b);if(x.re===0&&x.im===0){if(y.re>0)return 0;err(MTH)}const r=Math.log(Math.hypot(x.re,x.im)),t=Math.atan2(x.im,x.re),e=Math.exp(y.re*r-y.im*t),w=y.im*r+y.re*t;return mkC(e*Math.cos(w),e*Math.sin(w))}
 return chk(Math.pow(real(a),real(b)))}

// ---- functions
const rad=v=>ang=="DEG"?v*Math.PI/180:ang=="GRAD"?v*Math.PI/200:v;
const deg=v=>ang=="DEG"?v*180/Math.PI:ang=="GRAD"?v*200/Math.PI:v;
const z=v=>Math.abs(v)<1e-14?0:v;
function gamma(x){if(x<0.5)return Math.PI/(Math.sin(Math.PI*x)*gamma(1-x));x-=1;const g=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];let a=0.99999999999980993,t=x+7.5;g.forEach((c,i)=>a+=c/(x+i+1));return Math.sqrt(2*Math.PI)*Math.pow(t,x+.5)*Math.exp(-t)*a}
const R=real;
const bisqrt=n=>{if(n<2n)return n;let x=BigInt(Math.floor(Math.sqrt(Number(n))));while(x*x>n)x--;while((x+1n)*(x+1n)<=n)x++;return x};
function sqrtV(v){if(isC(v)){const m=Math.hypot(v.re,v.im),r=Math.sqrt((m+v.re)/2),i=Math.sqrt((m-v.re)/2);return mkC(r,v.im<0?-i:i)}
 if(isQ(v)){const s=v.n<0n?-v.n:v.n,a=bisqrt(s),b=bisqrt(v.d);if(a*a===s&&b*b===v.d){const q=new Q(a,b);return v.n<0n?new Cx(0,q.num()):q}}
 const x=R(v);return x<0?new Cx(0,Math.sqrt(-x)):Math.sqrt(x)}
function expV(v){if(isC(v)){const e=Math.exp(v.re);return mkC(e*Math.cos(v.im),e*Math.sin(v.im))}return chk(Math.exp(R(v)))}
function lnV(v){if(isC(v))return mkC(Math.log(Math.hypot(v.re,v.im)),Math.atan2(v.im,v.re));const x=R(v);if(x<=0)err(MTH);return Math.log(x)}
const ints=(...a)=>a.map(v=>{const b=toBig(v);if(b===null)err(ARG);return b});
const lin=(c,f)=>[c,v=>v*f,v=>v/f];
const UNITS={m:lin("len",1),km:lin("len",1000),cm:lin("len",.01),mm:lin("len",.001),in:lin("len",.0254),ft:lin("len",.3048),yd:lin("len",.9144),mi:lin("len",1609.344),
 g:lin("mass",1),kg:lin("mass",1000),lb:lin("mass",453.59237),oz:lin("mass",28.349523125),
 s:lin("time",1),min:lin("time",60),h:lin("time",3600),day:lin("time",86400),
 "m/s":lin("speed",1),"km/h":lin("speed",1/3.6),mph:lin("speed",.44704),
 L:lin("vol",1),mL:lin("vol",.001),gal:lin("vol",3.785411784),
 J:lin("energy",1),kJ:lin("energy",1000),cal:lin("energy",4.184),kWh:lin("energy",3.6e6),eV:lin("energy",1.602176634e-19),
 Pa:lin("press",1),kPa:lin("press",1000),atm:lin("press",101325),bar:lin("press",1e5),psi:lin("press",6894.757293168),
 W:lin("power",1),kW:lin("power",1000),hp:lin("power",745.69987158227),
 deg:lin("ang",1),rad:lin("ang",180/Math.PI),grad:lin("ang",.9),
 "°C":["temp",v=>v,v=>v],"°F":["temp",v=>(v-32)*5/9,v=>v*9/5+32],K:["temp",v=>v-273.15,v=>v+273.15]};
const unit=u=>u instanceof Str&&Object.prototype.hasOwnProperty.call(UNITS,u.s)?UNITS[u.s]:err(ARG);
const FN={
 sin:v=>z(Math.sin(rad(R(v)))),cos:v=>z(Math.cos(rad(R(v)))),tan:v=>{const r=rad(R(v));if(Math.abs(Math.cos(r))<1e-15)err(MTH);return z(Math.tan(r))},
 asin:v=>chk(deg(Math.asin(R(v)))),acos:v=>chk(deg(Math.acos(R(v)))),atan:v=>deg(Math.atan(R(v))),
 sinh:v=>chk(Math.sinh(R(v))),cosh:v=>chk(Math.cosh(R(v))),tanh:v=>Math.tanh(R(v)),asinh:v=>Math.asinh(R(v)),acosh:v=>chk(Math.acosh(R(v))),atanh:v=>chk(Math.atanh(R(v))),
 log:v=>chk(Math.log10(R(v))),ln:lnV,lb:v=>chk(Math.log2(R(v))),logb:(b,v)=>chk(Math.log(R(v))/Math.log(R(b))),exp:expV,
 sqrt:sqrtV,cbrt:v=>chk(Math.cbrt(R(v))),root:(v,n)=>{const x=R(v),k=R(n);return chk(x<0&&k%2?-Math.pow(-x,1/k):Math.pow(x,1/k))},
 abs:v=>isQ(v)?new Q(v.n<0n?-v.n:v.n,v.d):isC(v)?Math.hypot(v.re,v.im):Math.abs(v),
 sgn:v=>isQ(v)?new Q(v.n>0n?1n:v.n<0n?-1n:0n):intQ(Math.sign(R(v))),
 arg:v=>deg(isC(v)?Math.atan2(v.im,v.re):Math.atan2(0,R(v))),conj:v=>isC(v)?new Cx(v.re,-v.im):v,re:v=>isC(v)?v.re:v,im:v=>isC(v)?v.im:0,
 fact:v=>{const n=toBig(v);if(n!==null){if(n<0n||n>170n)err(MTH);let r=1n;for(let i=2n;i<=n;i++)r*=i;return new Q(r)}const x=R(v);return chk(gamma(x+1))},
 nPr:(n,r)=>{const[a,b]=ints(n,r);if(a<0n||b<0n||b>a)err(ARG);let p=1n;for(let i=0n;i<b;i++)p*=a-i;return new Q(p)},
 nCr:(n,r)=>{const[a,b0]=ints(n,r);if(a<0n||b0<0n||b0>a)err(ARG);const b=b0>a-b0?a-b0:b0;let p=1n;for(let i=1n;i<=b;i++)p=p*(a-b+i)/i;return new Q(p)},
 gcd:(a,b)=>{const[x,y]=ints(a,b);return new Q(bgcd(x,y))},
 lcm:(a,b)=>{const[x,y]=ints(a,b);const g=bgcd(x,y);if(g===0n)return new Q(0n);const l=x*y/g;return new Q(l<0n?-l:l)},
 mod:(a,b)=>{const x=toBig(a),y=toBig(b);if(x!==null&&y!==null){if(y===0n)err(MTH);return new Q(x%y)}const d=R(b);if(d===0)err(MTH);return chk(R(a)%d)},
 round:v=>{if(isQ(v)){const s=v.n<0n?-1n:1n,n=s*v.n;return new Q(s*((2n*n+v.d)/(2n*v.d)))}const x=R(v);return intQ(Math.sign(x)*Math.floor(Math.abs(x)+.5))},
 int:v=>isQ(v)?new Q(v.n/v.d):intQ(Math.trunc(R(v))),
 polr:(x,y)=>chk(Math.hypot(R(x),R(y))),polt:(x,y)=>deg(Math.atan2(R(y),R(x))),
 recx:(r,t)=>z(R(r)*Math.cos(rad(R(t)))),recy:(r,t)=>z(R(r)*Math.sin(rad(R(t)))),
 conv:(v,a,b)=>{const A=unit(a),B=unit(b);if(A[0]!==B[0])err(ARG);return chk(B[2](A[1](R(v))))},
 rand:()=>Math.random(),
 ranint:(a,b)=>{const[x,y]=ints(a,b);if(y<x)err(ARG);return new Q(x+BigInt(Math.floor(Math.random()*Number(y-x+1n))))}
};
const LAZY=new Set(["integ","sum","deriv"]);

// ---- tokenizer
function lex(s){const t=[];let i=0;
 while(i<s.length){const c=s[i];if(c===" "){i++;continue}
  if(c==='"'){const j=s.indexOf('"',i+1);if(j<0)err(SYN);t.push({k:"str",v:s.slice(i+1,j)});i=j+1;continue}
  const r=s.slice(i);let m;
  if((m=/^(\d+\.?\d*)°(?:(\d+\.?\d*)′)?(?:(\d+\.?\d*)″)?/.exec(r))){t.push({k:"num",dms:[m[1],m[2],m[3]]});i+=m[0].length;continue}
  if((m=/^(\d+\.?\d*|\.\d+)([Ee][+−-]?\d+)?/.exec(r))){t.push({k:"num",v:m[1],e:m[2]});i+=m[0].length;continue}
  if((m=/^\[(\w+)\]/.exec(r))){t.push({k:"const",v:m[1]});i+=m[0].length;continue}
  if((m=/^[A-Za-z_]+/.exec(r))){t.push({k:"id",v:m[0]});i+=m[0].length;continue}
  if("+−-×÷*/^()!%,=".includes(c)){t.push({k:"op",v:c});i++;continue}
  if(c==="π"||c==="ℯ"){t.push({k:"sym",v:c});i++;continue}
  err(SYN)}
 return t}

// ---- parser (precedence: + - | × ÷ and implicit × | unary minus | ^ | ! %)
function parse(s){const t=lex(s);let p=0;
 const isOp=v=>t[p]&&t[p].k==="op"&&t[p].v===v;
 const startsPrimary=()=>{const k=t[p];return k&&(k.k==="num"||k.k==="const"||k.k==="id"||k.k==="sym"||(k.k==="op"&&k.v==="("))};
 function addsub(){let a=muldiv();while(isOp("+")||isOp("−")||isOp("-")){const o=t[p++].v==="+"?"+":"-";a={t:"bin",o,a,b:muldiv()}}return a}
 function muldiv(){let a=unary();for(;;){if(isOp("×")||isOp("*")){p++;a={t:"bin",o:"*",a,b:unary()}}else if(isOp("÷")||isOp("/")){p++;a={t:"bin",o:"/",a,b:unary()}}else if(startsPrimary())a={t:"bin",o:"*",a,b:unary()};else return a}}
 function unary(){if(isOp("−")||isOp("-")){p++;return{t:"neg",a:unary()}}if(isOp("+")){p++;return unary()}return power()}
 function power(){const a=postfix();if(isOp("^")){p++;return{t:"bin",o:"^",a,b:unary()}}return a}
 function postfix(){let a=primary();while(isOp("!")||isOp("%")){const o=t[p++].v;a=o==="!"?{t:"fn",n:"fact",args:[a]}:{t:"bin",o:"/",a,b:{t:"lit",v:new Q(100n)}}}return a}
 function primary(){const k=t[p++];if(!k)err(SYN);
  if(k.k==="str")return{t:"lit",v:new Str(k.v)};
  if(k.k==="num"){if(k.dms){const ps=x=>x===undefined?new Q(0n):/\./.test(x)?parseFloat(x):new Q(BigInt(x));return{t:"lit",v:add(ps(k.dms[0]),add(div(ps(k.dms[1]),new Q(60n)),div(ps(k.dms[2]),new Q(3600n))))}}if(!k.e&&!k.v.includes("."))return{t:"lit",v:new Q(BigInt(k.v))};return{t:"lit",v:parseFloat(k.v+(k.e?k.e.replace("E","e").replace("−","-"):""))}}
  if(k.k==="const")return{t:"const",v:k.v};
  if(k.k==="sym")return{t:"lit",v:k.v==="π"?Math.PI:Math.E};
  if(k.k==="op"&&k.v==="("){const e=addsub();if(!isOp(")"))err(SYN);p++;return e}
  if(k.k==="id"){const n=k.v;
   if(isOp("(")&&(FN[n]||LAZY.has(n))){p++;const args=[];if(!isOp(")")){do{args.push(addsub())}while(isOp(",")&&++p)}if(!isOp(")"))err(SYN);p++;return{t:"fn",n,args}}
   if(n==="Ans")return{t:"ans"};
   if(!/^[A-FMxyi]+$/.test(n))err(SYN);
   const vs=[...n].map(c=>c==="i"?{t:"lit",v:new Cx(0,1)}:{t:"var",n:c});return vs.reduce((a,b)=>({t:"bin",o:"*",a,b}))}
  err(SYN)}
 const ast=addsub();if(p<t.length)err(SYN);return ast}

// ---- evaluator
function evalNode(n,env){switch(n.t){
 case"lit":return n.v;
 case"const":if(!(n.v in C))err(SYN);return C[n.v];
 case"ans":return ans;
 case"var":return n.n==="x"&&env.x!==undefined?env.x:V[n.n];
 case"neg":return neg(evalNode(n.a,env));
 case"bin":{const a=evalNode(n.a,env),b=evalNode(n.b,env);return n.o==="+"?add(a,b):n.o==="-"?sub(a,b):n.o==="*"?mul(a,b):n.o==="/"?div(a,b):pow(a,b)}
 case"fn":return callFn(n,env)}}
function callFn(n,env){const a=n.args;
 if(LAZY.has(n.n)){const need=n.n==="deriv"?2:3;if(a.length!==need)err(ARG);const f=xv=>evalNode(a[0],{x:xv});const num=xv=>{const v=f(xv);if(isC(v))err(MTH);return R(v)};
  if(n.n==="deriv"){const x0=R(evalNode(a[1],env)),h=1e-3;return chk((-num(x0+2*h)+8*num(x0+h)-8*num(x0-h)+num(x0-2*h))/(12*h))}
  const lo=R(evalNode(a[1],env)),hi=R(evalNode(a[2],env));
  if(n.n==="integ"){const N=2000,h=(hi-lo)/N;let s=num(lo)+num(hi);for(let i=1;i<N;i++)s+=num(lo+i*h)*(i%2?4:2);return chk(s*h/3)}
  const i0=Math.round(lo),i1=Math.round(hi);if(i1-i0>1e6)err(MTH);let s=new Q(0n);for(let i=i0;i<=i1;i++)s=add(s,f(new Q(BigInt(i))));return s}
 const fn=FN[n.n];if(!fn)err(SYN);if(a.length!==fn.length)err(ARG);return fn(...a.map(e=>evalNode(e,env)))}
const cache=new Map();
function ev(s,x){let ast=cache.get(s);if(!ast){ast=parse(s);if(cache.size>300)cache.clear();cache.set(s,ast)}
 const v=evalNode(ast,{x});return chk(v)}
function evNum(s,x){const v=ev(s,x);return isC(v)?NaN:isQ(v)?v.num():v}

// ---- display
function fmtNum(v){if(typeof v!="number"||!isFinite(v))err(MTH);
 if(fixN!==null&&fm=="NORM"){const s=v.toFixed(fixN);return parseFloat(s)===0?s.replace("-",""):s}
 if(fm=="SCI")return v.toExponential(8).replace(/\.?0+e/,"e").replace("e","×10^").replace("^+","^");
 if(fm=="ENG"){if(v==0)return"0";const e=Math.floor(Math.log10(Math.abs(v))/3)*3;return parseFloat((v/10**e).toPrecision(10))+"×10^"+e}
 const s=parseFloat(v.toPrecision(12));return Math.abs(s)>=1e12||(s!=0&&Math.abs(s)<1e-7)?s.toExponential().replace("e","×10^").replace("^+","^"):String(s)}
function fmt(v){if(isQ(v))return fmtNum(v.num());
 if(isC(v)){const im=Math.abs(v.im),is=(im===1?"":fmtNum(im))+"i";return v.re===0?(v.im<0?"-":"")+is:fmtNum(v.re)+(v.im<0?"-":"+")+is}
 return fmtNum(v)}
function frac(v){if(Number.isInteger(v))return null;let h1=1,h0=0,k1=0,k0=1,b=Math.abs(v);for(let i=0;i<30;i++){const a=Math.floor(b),h=a*h1+h0,k=a*k1+k0;h0=h1;h1=h;k0=k1;k1=k;if(k>1e4)return null;if(Math.abs(Math.abs(v)-h/k)<1e-9*Math.abs(v))return(v<0?"−":"")+h+"/"+k;b=1/(b-a);if(!isFinite(b))break}return null}
function fmtExact(v,mixed){const mx=(sg,n,d)=>mixed&&n>d?sg+(n/d)+" "+(n%d)+"/"+d:sg+n+"/"+d;
 if(isQ(v)){if(v.d===1n)return fmt(v);return mx(v.n<0n?"−":"",v.n<0n?-v.n:v.n,v.d)}
 if(isC(v))return fmt(v);const f=frac(v);if(!f)return fmt(v);const m=/^(−?)(\d+)\/(\d+)$/.exec(f);return mx(m[1],BigInt(m[2]),BigInt(m[3]))}
function toDMS(x){if(!isFinite(x))err(MTH);const sg=x<0?"-":"",a=Math.abs(x);let d=Math.floor(a+1e-12),r=(a-d)*60,m=Math.floor(r+1e-9),s=parseFloat(((r-m)*60).toFixed(2));if(s>=60){s-=60;m++}if(m>=60){m-=60;d++}return sg+d+"°"+m+"′"+s+"″"}

if(typeof module!=="undefined")module.exports={ev,evNum,fmt,fmtExact,frac,toDMS,config,C,V};
