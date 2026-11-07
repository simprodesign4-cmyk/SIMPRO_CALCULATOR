"use strict";
/* SIMPRO_CALCULATOR interface: keys, screen, graphing, menus. Needs calc.js loaded first. */
const $=s=>document.querySelector(s);
const CN=[["Speed of light c","c"],["Planck h","h"],["Gravity g","g"],["Gravitation G","G"],["Boltzmann k","kB"],["Avogadro N_A","NA"],["Elementary charge q","q"],["Electron mass mₑ","me"],["Permittivity ε₀","e0"],["Permeability μ₀","mu0"],["Gas constant R","R"],["Stefan-Boltzmann σ","sigma"]].map(([l,t])=>[l,"["+t+"]"]);
const OP=[["∫ integral  integ(f,a,b)","integ("],["d/dx derivative  deriv(f,a)","deriv("],["Σ sum  sum(f,a,b)","sum("],["nPr","nPr("],["nCr","nCr("],["x!","!"],["Abs","abs("],["Int","int("],["Round","round("],["Sign","sgn("],["lcm","lcm("],["Random integer (a,b)","ranint("],["log base  logb(b,x)","logb("],["log₂","lb("],["sinh","sinh("],["cosh","cosh("],["tanh","tanh("],["sinh⁻¹","asinh("],["cosh⁻¹","acosh("],["tanh⁻¹","atanh("],["∛","cbrt("]];
// [face, label above (orange; swaps with face when SHIFT is on), action, shift action, alpha letter, class]
const FK=[["F1","Trace","!f1"],["F2","Zoom","!f2"],["F3","V-Window","!f3"],["F4","Sketch","!f4"],["F5","G-Solv","!f5"],["F6","G⇔T","!f6"]];
const TOP=[
["SHIFT","","!shift"],["OPTN","","!optn"],["VARS","","!vars"],["MENU","SET UP","!menu","!setup"],
["ALPHA","","!alpha"],["x²","√","^2","sqrt("],["^","ˣ√","^","root("],["EXIT","","!exit"],
["X,θ,T","x⁻¹","x","^(−1)"],["log","10ˣ","log(","10^(","A"],["ln","eˣ","ln(","ℯ^(","B"],["sin","sin⁻¹","sin(","asin(","C"],["cos","cos⁻¹","cos(","acos(","D"],["tan","tan⁻¹","tan(","atan(","E"],
["a b/c","","÷"],["S⇔D","","!sd"],["(","","(","","F"],[")","",")","","M"],[",","",",","","y"],["→","","!sto"]];
const NUM=[
["7","CONST","7","!const"],["8","Ran#","8","rand()"],["9","gcd","9","gcd("],["DEL","UNDO","!del","!undo","","blue"],["AC","OFF","!ac","!off","","blue"],
["4","CATALOG","4","!optn"],["5","FORMAT","5","!fmt"],["6","","6"],["×","","×"],["÷","","÷"],
["1","","1"],["2","","2"],["3","","3"],["+","","+"],["−","","−"],
["0","","0"],["•","=",".","="],["×10ˣ","π","E","π","","sm"],["(−)","Ans","−","Ans","","sm"],["EXE","","!eq","","","exe"]];
let expr="",pos=0,shift=false,alpha=false,sto=false,done=false,sd=false,lastV=0,hist=[],hi=-1,off=false,mode="run",undo=[];
let gfs=[],gw={x0:-10,x1:10,y0:-7.5,y1:7.5},trace=false,tx=0;
const btns=[];
function ripple(b,e){const r=b.getBoundingClientRect(),s=document.createElement("span");s.className="rip";s.style.left=e.clientX-r.left+"px";s.style.top=e.clientY-r.top+"px";b.appendChild(s);setTimeout(()=>s.remove(),650)}
function mk(el,d,cls,adv){const c=document.createElement("div");c.className="cell"+(adv?" adv":"");const l=document.createElement("div");l.className="lab";const b=document.createElement("button");b.className="key "+(d[5]||"");b.innerHTML="<span class=u></span><span class=f></span>";b._d=d;b._l=l;b.onclick=()=>press(d);b.addEventListener("pointerdown",e=>ripple(b,e));c.append(l,b);if(cls)c.classList.add(cls);el.appendChild(c);btns.push(b)}
FK.forEach(d=>{d[5]="fkb";mk($("#top"),d,"fk",true)});
TOP.forEach((d,i)=>{mk($("#top"),d,"",i>=8&&i<14)});
const dp=document.createElement("div");dp.className="dpad";[["▲","u1","!u"],["◀","l1","!l"],["▶","r1","!r"],["▼","d1","!d"]].forEach(([g,c,a])=>{const b=document.createElement("button");b.className=c;b.textContent=g;b.onclick=()=>press(["","",a]);dp.appendChild(b)});
$("#top").appendChild(dp);
NUM.forEach(d=>mk($("#num"),d,"",false));
document.querySelectorAll(".fkb").forEach(b=>b.closest(".cell").classList.add("fk"));
function labels(){btns.forEach(b=>{const d=b._d,f=d[5]=="fkb",u=!f&&shift&&d[3];b.children[1].textContent=u?d[1]:d[0];b._l.textContent=f?d[1]:d[1]?(u?d[0]:d[1]):"";b.children[0].textContent=d[4]&&!(alpha||0)?d[4]:"";if(alpha&&d[4])b.children[1].textContent=d[4];if(d[2]=="!shift")b.classList.toggle("on",shift);if(d[2]=="!alpha")b.classList.toggle("on",alpha)});
 $("#st").textContent=[shift&&"SHIFT",alpha&&(sto?"STO":"ALPHA"),ang,fm,V.M&&"M"].filter(Boolean).join(" ")}
function resText(v){return sd?(frac(v)||fmt(v)):fmt(v)}
function show(){const e=$("#expr"),r=$("#res");r.classList.remove("err");
 $("#trail").innerHTML="";hist.slice(0,2).reverse().forEach(h=>{const d=document.createElement("div");d.textContent=h.e+"  = "+h.r;$("#trail").appendChild(d)});
 if(done){e.textContent=expr;return}
 e.textContent="";const a=document.createElement("span"),c=document.createElement("span"),b=document.createElement("span");a.textContent=expr.slice(0,pos);c.className="car";b.textContent=expr.slice(pos);e.append(a,c,b);c.scrollIntoView({block:"nearest"});
 if(!expr){r.textContent="";return}try{r.textContent=fmt(ev(expr))}catch(_){r.textContent=""}}
function snap(){undo.push([expr,pos]);if(undo.length>100)undo.shift()}
function insert(t){snap();if(done){expr=/^[+−×÷^%!]/.test(t)?"Ans":"";pos=expr.length;done=false}expr=expr.slice(0,pos)+t+expr.slice(pos);pos+=t.length;show()}
function bounds(){const re=/[a-z][a-zA-Z]*\(|\[\w+\]|Ans|[\s\S]/g,b=[0];let m;while(m=re.exec(expr))b.push(m.index+m[0].length);return b}
function value(){try{return ev(expr||"0")}catch(_){return ans}}
function press(d){
 if(alpha&&d[4]){const ch=d[4];alpha=false;if(sto){sto=false;V[ch]=value();$("#info").textContent=ch+" = "+fmt(V[ch])}else{if(mode=="graph")setMode("run");insert(ch)}labels();return}
 const a=shift&&d[3]?d[3]:d[2];
 if(a=="!shift"){shift=!shift;labels();return}
 if(a=="!alpha"){alpha=!alpha;sto=false;labels();return}
 shift=false;alpha=false;sto=false;
 if(a[0]=="!")cmd(a);else{if(mode=="graph")setMode("run");insert(a)}
 labels()}
function menu(title,items,note){const o=document.createElement("div");o.className="ov";const b=document.createElement("div");b.className="box";b.innerHTML="<h3></h3>";b.firstChild.textContent=title;items.forEach(([l,t])=>{const k=document.createElement("button");k.textContent=l;k.onclick=()=>{o.remove();typeof t=="function"?t():(mode=="graph"&&setMode("run"),insert(t))};b.appendChild(k)});if(note){const p=document.createElement("p");p.textContent=note;b.appendChild(p)}o.onclick=e=>{if(e.target==o)o.remove()};o.appendChild(b);document.body.appendChild(o)}
function recall(){expr=hi<0?"":hist[hi].e;pos=expr.length;done=false;show()}
function flash(t){const r=$("#res");r.textContent=t;r.classList.add("err")}
function eq(){if(!expr)return;if(expr.includes("="))return solve();try{const v=ev(expr);lastV=v;ans=v;const t=resText(v);hist.unshift({e:expr,r:t});hi=-1;$("#expr").textContent=expr;$("#res").textContent=t;done=true;renderHist();show();$("#res").textContent=t}catch(_){flash("Math Error");done=true}}
function solve(){const[l,r]=expr.split("="),f=t=>ev("("+l+")-("+(r||0)+")",t);for(const s of[V.x||1,1,-1,.5,5,-5,10,-10,50]){let x=s;try{for(let i=0;i<80;i++){const h=1e-6*Math.max(1,Math.abs(x)),d=(f(x+h)-f(x-h))/(2*h),n=x-f(x)/d;if(!isFinite(n))break;if(Math.abs(n-x)<1e-13*Math.max(1,Math.abs(x))){x=n;break}x=n}if(isFinite(x)&&Math.abs(f(x))<1e-8){V.x=x;const t="x = "+fmt(x);hist.unshift({e:expr,r:t});hi=-1;done=true;renderHist();show();$("#res").textContent=t;return}}catch(_){}}flash("No solution found");done=true}
function setMode(m){mode=m;$("#scr").style.display=m=="run"?"flex":"none";$("#cv").style.display=m=="graph"?"block":"none";$("#mn").textContent=m=="run"?"Run-Matrix":"Graph";$("#info").textContent="";trace=false;if(m=="graph")draw()}
const COL=["#0b3070","#e4690a","#1a9a50"];
function draw(){const cv=$("#cv"),r=cv.getBoundingClientRect(),dp=devicePixelRatio||1;cv.width=r.width*dp;cv.height=r.height*dp;const g=cv.getContext("2d");g.scale(dp,dp);const W=r.width,H=r.height,{x0,x1,y0,y1}=gw,X=x=>(x-x0)/(x1-x0)*W,Y=y=>H-(y-y0)/(y1-y0)*H;
 g.fillStyle="#fff";g.fillRect(0,0,W,H);
 const st=q=>{const p=10**Math.floor(Math.log10(q/6)),m=q/6/p;return(m<1.5?1:m<3.5?2:m<7.5?5:10)*p};
 g.lineWidth=1;g.strokeStyle="#dce5f5";const sx=st(x1-x0),sy=st(y1-y0);
 for(let x=Math.ceil(x0/sx)*sx;x<=x1;x+=sx){g.beginPath();g.moveTo(X(x),0);g.lineTo(X(x),H);g.stroke()}
 for(let y=Math.ceil(y0/sy)*sy;y<=y1;y+=sy){g.beginPath();g.moveTo(0,Y(y));g.lineTo(W,Y(y));g.stroke()}
 g.strokeStyle="#06142f";g.beginPath();g.moveTo(X(0),0);g.lineTo(X(0),H);g.moveTo(0,Y(0));g.lineTo(W,Y(0));g.stroke();
 g.fillStyle="#5a6f95";g.font="9px sans-serif";g.fillText(+x1.toPrecision(3),W-26,Y(0)-3);g.fillText(+y1.toPrecision(3),X(0)+3,10);
 gfs.forEach((s,k)=>{g.strokeStyle=COL[k];g.lineWidth=2;g.beginPath();let pen=false,py=0;for(let i=0;i<=W;i+=1){const x=x0+i/W*(x1-x0);let y;try{y=ev(s,x)}catch(_){y=NaN}if(!isFinite(y)){pen=false;continue}const yy=Y(y);if(!pen||Math.abs(yy-py)>H*1.5){g.moveTo(i,yy);pen=true}else g.lineTo(i,yy);py=yy}g.stroke()});
 if(trace&&gfs[0]){let y;try{y=ev(gfs[0],tx)}catch(_){y=NaN}if(isFinite(y)){g.fillStyle="#c1380a";g.beginPath();g.arc(X(tx),Y(y),4,0,7);g.fill();$("#info").textContent="x="+fmt(tx)+"  y="+fmt(y)}}
 if(!gfs.length)$("#info").textContent="Type an expression in x, then press G⇔T"}
function fx(i,x){try{return ev(gfs[i],x)}catch(_){return NaN}}
function zoom(f){const cx=(gw.x0+gw.x1)/2,cy=(gw.y0+gw.y1)/2,w=(gw.x1-gw.x0)/2*f,h=(gw.y1-gw.y0)/2*f;gw={x0:cx-w,x1:cx+w,y0:cy-h,y1:cy+h};draw()}
function gsolve(k){if(!gfs.length)return;const n=2000,{x0,x1}=gw,xs=Array.from({length:n+1},(_,i)=>x0+i*(x1-x0)/n),ys=xs.map(x=>fx(0,x));let t="Not found";
 if(k=="root"){const c=(x0+x1)/2;let best=null;for(let i=0;i<n;i++)if(isFinite(ys[i])&&isFinite(ys[i+1])&&ys[i]*ys[i+1]<=0&&Math.abs(ys[i]-ys[i+1])<1e6){let a=xs[i],b=xs[i+1];for(let j=0;j<60;j++){const m=(a+b)/2;(fx(0,a)*fx(0,m)<=0)?b=m:a=m}let r=(a+b)/2;if(Math.abs(r)<1e-9*(x1-x0))r=0;if(best===null||Math.abs(r-c)<Math.abs(best-c))best=r}if(best!==null){tx=best;t="Root: x="+fmt(best)}}
 else if(k=="y"){const v=fx(0,0);if(isFinite(v))t="Y-Icpt: y="+fmt(v)}
 else{let bi=-1;ys.forEach((y,i)=>{if(isFinite(y)&&(bi<0||(k=="max"?y>ys[bi]:y<ys[bi])))bi=i});if(bi>=0){tx=xs[bi];t=(k=="max"?"Max":"Min")+": x="+fmt(xs[bi])+" y="+fmt(ys[bi])}}
 draw();$("#info").textContent=t}
function cmd(a){const r=$("#res");
 if(a=="!ac"){snap();expr="";pos=0;done=false;hi=-1;if(mode=="graph")setMode("run");show();r.textContent=""}
 else if(a=="!exit"){if(document.querySelector(".ov"))return;if(mode=="graph")setMode("run");else if(done){done=false;pos=expr.length;show()}else{snap();expr="";pos=0;show()}}
 else if(a=="!undo"){const u=undo.pop();if(u){expr=u[0];pos=u[1];done=false;show()}}
 else if(a=="!del"){if(done){done=false;pos=expr.length}const b=bounds().filter(v=>v<pos);if(!b.length)return;snap();const p=b[b.length-1];expr=expr.slice(0,p)+expr.slice(pos);pos=p;show()}
 else if(a=="!l"||a=="!r"){const L=a=="!l";
  if(mode=="graph"){const w=gw.x1-gw.x0;if(trace){tx+=(L?-1:1)*w/80;draw()}else{const d=(L?-1:1)*w/10;gw.x0+=d;gw.x1+=d;draw()}return}
  if(done){done=false;pos=expr.length}const b=bounds();pos=L?Math.max(0,...b.filter(v=>v<pos)):Math.min(expr.length,...b.filter(v=>v>pos).concat(expr.length));show()}
 else if(a=="!u"||a=="!d"){const U=a=="!u";
  if(mode=="graph"){const h=gw.y1-gw.y0,d=(U?1:-1)*h/10;gw.y0+=d;gw.y1+=d;draw();return}
  if(U){if(hist.length){hi=Math.min(hi+1,hist.length-1);recall()}}else if(hi>=0){hi--;recall()}}
 else if(a=="!sto"){alpha=true;sto=true}
 else if(a=="!vars"){menu("Variables",Object.keys(V).map(k=>[k+" = "+fmt(V[k]),k]),"Store a value: type it, press →, then a letter key (the small letter on each key).")}
 else if(a=="!sd"){sd=!sd;if(done){$("#res").textContent=resText(lastV)}}
 else if(a=="!fmt"){fm=fm=="NORM"?"SCI":fm=="SCI"?"ENG":"NORM";show();if(done)$("#res").textContent=resText(lastV)}
 else if(a=="!const")menu("Constants",CN);else if(a=="!optn")menu("Functions",OP);
 else if(a=="!menu")menu("Main Menu",[["Run-Matrix (calculate)",()=>setMode("run")],["Graph",()=>openGraph()]],"Coming next: Statistics, Table, Equation, Spreadsheet, Conic, Recursion, Probability.");
 else if(a=="!setup")menu("Set Up",[["Angle: "+ang+"  (tap to change)",()=>{ang=ang=="DEG"?"RAD":ang=="RAD"?"GRAD":"DEG";labels();show()}],["Display: "+fm+"  (tap to change)",()=>cmd("!fmt")],["Output: "+(sd?"Fraction":"Decimal")+"  (tap to change)",()=>cmd("!sd")]]);
 else if(a=="!eq")eq();
 else if(a=="!off"){off=true;expr="";pos=0;done=false;$("#dev").classList.add("offm")}
 else if(a=="!f6"){mode=="graph"?setMode("run"):openGraph()}
 else if(a[1]=="f"){if(mode!="graph"){$("#info").textContent="Press F6 (G⇔T) to open the graph";return}
  if(a=="!f1"){trace=!trace;if(trace&&tx<gw.x0||tx>gw.x1)tx=(gw.x0+gw.x1)/2;draw()}
  else if(a=="!f2")menu("Zoom",[["Zoom in",()=>zoom(.5)],["Zoom out",()=>zoom(2)],["Standard window",()=>{gw={x0:-10,x1:10,y0:-7.5,y1:7.5};draw()}]]);
  else if(a=="!f3"){const t=prompt("Window: xmin, xmax, ymin, ymax",[gw.x0,gw.x1,gw.y0,gw.y1].map(v=>+v.toPrecision(4)).join(", "));if(t){const n=t.split(",").map(Number);if(n.length==4&&n.every(isFinite)&&n[0]<n[1]&&n[2]<n[3]){gw={x0:n[0],x1:n[1],y0:n[2],y1:n[3]};draw()}else flash("Invalid window")}}
  else if(a=="!f4"){const e=expr.replace(/^\s*y\s*=/,"").trim();if(!e)gfs=[];else if(!gfs.includes(e))gfs=[...gfs,e].slice(-3);draw()}
  else if(a=="!f5")menu("G-Solve",[["Root",()=>gsolve("root")],["Maximum",()=>gsolve("max")],["Minimum",()=>gsolve("min")],["Y-Intercept",()=>gsolve("y")]])}}
function openGraph(){const e=expr.replace(/^\s*y\s*=/,"").trim();if(e&&!e.includes("="))gfs=[e];setMode("graph")}
function renderHist(){const h=$("#hl");h.innerHTML="";hist.slice(0,60).forEach(x=>{const d=document.createElement("div");d.className="it";d.innerHTML="<span></span><b></b>";d.children[0].textContent=x.e;d.children[1].textContent="= "+x.r;d.onclick=()=>{expr=x.e;pos=expr.length;done=false;if(mode=="graph")setMode("run");show()};h.appendChild(d)})}
$("#bH").onclick=()=>$("#wrap").classList.toggle("hs");
$("#onb").onclick=()=>{off=false;$("#dev").classList.remove("offm");setMode("run");show()};
function sm(s){$("#dev").classList.toggle("simple",s);$("#mSim").classList.toggle("on",s);$("#mSci").classList.toggle("on",!s)}
$("#mSim").onclick=()=>sm(true);$("#mSci").onclick=()=>sm(false);
addEventListener("resize",()=>{if(mode=="graph")draw()});
document.addEventListener("keydown",e=>{if(off||e.ctrlKey||e.metaKey||e.altKey||document.querySelector(".ov"))return;const k=e.key;
 const typed=()=>{if(mode=="graph")setMode("run")};
 if(/^[0-9.()%!^=]$/.test(k)){typed();insert(k)}else if(k=="+"){typed();insert("+")}else if(k=="-"){typed();insert("−")}else if(k=="*"){typed();insert("×")}else if(k=="/"){e.preventDefault();typed();insert("÷")}
 else if(k==","||/^[xyA-DF]$/.test(k)){typed();insert(k)}else if(k=="Enter"){e.preventDefault();eq()}
 else if(k=="Backspace")cmd("!del");else if(k=="Escape")cmd("!exit");else if(k=="ArrowLeft")cmd("!l");else if(k=="ArrowRight")cmd("!r");else if(k=="ArrowUp"){e.preventDefault();cmd("!u")}else if(k=="ArrowDown"){e.preventDefault();cmd("!d")}});
if(innerWidth>760)$("#wrap").classList.add("hs");
labels();show();
