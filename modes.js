"use strict";
/* SIMPRO_CALCULATOR modes: Main Menu, Statistics, Equation, Table.
   Needs calc.js, solvers.js and ui.js loaded first. */
const mv=document.createElement("div");mv.id="mv";$("#lcd").insertBefore(mv,$("#info"));
const soft=document.createElement("div");soft.id="soft";$("#lcd").appendChild(soft);
let cur=null;
const say=t=>{$("#info").textContent=t||""};
const mkc=(tag,txt,cls)=>{const e=document.createElement(tag);e.textContent=txt;if(cls)e.className=cls;return e};
const F=v=>isFinite(v)?fmt(v):"---";
const cplx=z=>fmt(mkC(z.re,z.im));
function paint(){if(!cur)return;const st=mv.scrollTop;mv.innerHTML="";mv.appendChild(cur.render());mv.scrollTop=st;
 soft.innerHTML="";for(let i=0;i<6;i++){const d=document.createElement("div");d.textContent=(cur.soft||[])[i]||"";d.setAttribute("role","button");d.tabIndex=d.textContent?0:-1;d.setAttribute("aria-label",d.textContent?"F"+(i+1)+", "+d.textContent:"unused");d.onkeydown=ev=>{if(ev.key=="Enter"||ev.key==" "){ev.preventDefault();d.click()}};d.onclick=()=>{if(d.textContent&&cur.f){fire(()=>cur.f(i));paint()}};soft.appendChild(d)}
 const s=mv.querySelector(".sel,.hl");if(s)s.scrollIntoView({block:"nearest"})}
function fire(fn){try{fn()}catch(e){say(e.message)}}
function go(s,info){cur=s;say(info||"");paint()}
function modeKey(a){if(!cur)return false;
 if(a[0]!="!"){cur.ins&&fire(()=>cur.ins(a));paint();return true}
 const m={"!l":"l","!r":"r","!u":"u","!d":"d"}[a];
 if(m){cur.nav&&cur.nav(m);paint();return true}
 if(/^!f[1-6]$/.test(a)){const i=+a[2]-1;if(cur.f&&(cur.soft||[])[i])fire(()=>cur.f(i));paint();return true}
 if(a=="!eq"){cur.eq&&fire(()=>cur.eq());paint();return true}
 if(a=="!del"){cur.del&&cur.del();paint();return true}
 if(a=="!ac"){cur.ac&&cur.ac();paint();return true}
 if(a=="!exit"){cur.exit&&cur.exit();return true}
 return false}
function modeInsert(t){if(cur&&cur.ins){fire(()=>cur.ins(t));paint()}}
function modesShow(m){const on=MODE_SET.has(m);mv.style.display=on?"block":"none";soft.style.display=on?"grid":"none";
 if(!on){cur=null;return}
 if(m=="home")go(homeScreen());else if(m=="stat")go(statList());else if(m=="eq")go(eqMenu());else if(m=="base")go(baseScreen());else if(m=="mat")go(matList());else if(m=="dist")go(distMenu());else if(m=="ratio")go(ratioMenu());else if(m=="ineq")go(ineqMenu());else if(m=="sheet")go(sheetScreen());else go(tableIn())}

// ---- editable grid used by Statistics, Equation and Table
function mkGrid(o){const g={cols:o.cols,rl:o.rl,rows:o.rows,r:0,c:0,buf:null,max:o.max||99,text:o.text||(()=>false),grow:!!o.grow,raw:!!o.raw,show:o.show};
 g.commit=()=>{if(g.buf===null)return true;const s=g.buf.trim();
  if(s===""){g.rows[g.r][g.c]="";g.buf=null;return true}
  if(g.raw||g.text(g.r,g.c)){g.rows[g.r][g.c]=s;g.buf=null;return true}
  try{const v=evNum(s);if(!isFinite(v))throw 0;g.rows[g.r][g.c]=String(parseFloat(v.toPrecision(12)));g.buf=null;return true}
  catch(_){say("That entry is not a valid number");return false}};
 g.ins=t=>{if(g.buf===null)g.buf="";g.buf+=t};
 g.del=()=>{if(g.buf!==null&&g.buf.length)g.buf=g.buf.slice(0,-1);else{g.buf=null;g.rows[g.r][g.c]=""}};
 g.move=(dr,dc)=>{if(!g.commit())return;let r=g.r+dr,c=g.c+dc;if(c<0||c>=g.cols.length)c=g.c;if(r<0)r=0;
  if(r>=g.rows.length){if(g.grow&&g.rows.length<g.max)g.rows.push(g.cols.map(()=>""));else r=g.rows.length-1}g.r=r;g.c=c};
 g.render=()=>{const w=document.createElement("div"),t=document.createElement("table");t.className="tbl";const h=document.createElement("tr");
  if(g.rl)h.appendChild(mkc("th",""));g.cols.forEach(c=>h.appendChild(mkc("th",c)));t.appendChild(h);
  g.rows.forEach((row,ri)=>{const tr=document.createElement("tr");if(g.rl)tr.appendChild(mkc("th",typeof g.rl=="function"?g.rl(ri):g.rl[ri]||"","rl"));
   row.forEach((v,ci)=>{const sel=ri==g.r&&ci==g.c,td=mkc("td",sel&&g.buf!==null?g.buf+"▏":(g.show?g.show(ri,ci,v):v),sel?"sel":"");if(g.text(ri,ci))td.style.textAlign="left";
    td.onclick=()=>{g.commit();g.r=ri;g.c=ci;paint()};tr.appendChild(td)});t.appendChild(tr)});w.appendChild(t);return w};
 return g}
function gridKeys(g,exit,across){return{ins:t=>g.ins(t),del:()=>g.del(),ac:()=>{g.buf=null},eq:()=>{if(!g.commit())return;if(!across)g.move(1,0);else if(g.c<g.cols.length-1)g.move(0,1);else if(g.r<g.rows.length-1){g.c=0;g.move(1,0)}},
 nav:m=>g.move(...{l:[0,-1],r:[0,1],u:[-1,0],d:[1,0]}[m]),exit}}
function resScreen(o){return{render(){const t=document.createElement("table");t.className="tbl";
  if(o.head){const h=document.createElement("tr");o.head.forEach(x=>h.appendChild(mkc("th",x)));t.appendChild(h)}
  o.lines.forEach(l=>{const r=document.createElement("tr");r.appendChild(mkc("th",l[0],"rl"));r.appendChild(mkc("td",l[1]));t.appendChild(r)});return t},
  soft:o.soft||["BACK"],f:o.f||(()=>o.back()),nav(m){if(m=="u")mv.scrollTop-=28;if(m=="d")mv.scrollTop+=28},exit:o.back,eq(){}}}
const blank=(n,c)=>Array.from({length:n},()=>Array(c).fill(""));

// ---- Main Menu
const TILES=[["Run-Matrix","run"],["Statistics","stat"],["Graph","graph"],["Table","table"],["Equation","eq"],["Base-N","base"],["Matrix","mat"],["Distribution","dist"],["Spreadsheet","sheet"],["Ratio","ratio"],["Inequality","ineq"]];
let hl=0;
function homeScreen(){const open=i=>{const t=TILES[i];if(!t[1])return say(t[0]+" arrives in a later phase");setMode(t[1])};
 return{render(){const d=document.createElement("div");d.className="tiles";
  TILES.forEach((t,i)=>{const e=document.createElement("div");e.className="tile"+(t[1]?"":" soon")+(i==hl?" hl":"");e.appendChild(mkc("b","1234567890•"[i]));e.append(t[0]);e.onclick=()=>{hl=i;open(i)};e.tabIndex=0;e.setAttribute("role","button");e.onkeydown=ev=>{if(ev.key=="Enter"||ev.key==" "){ev.preventDefault();e.click()}};d.appendChild(e)});return d},
  soft:[],ins(a){const k="1234567890.".indexOf(a);if(a.length==1&&k>=0&&k<TILES.length){hl=k;open(hl)}},nav(m){hl=Math.max(0,Math.min(TILES.length-1,hl+{l:-1,r:1,u:-3,d:3}[m]))},eq(){open(hl)},exit(){setMode("run")}}}

// ---- Statistics
const REGS={lin:"Linear  y=a+bx",quad:"Quadratic  y=ax²+bx+c",log:"Logarithmic  y=a+b·ln x",exp:"Exponential  y=a·e^(bx)",pow:"Power  y=a·x^b"};
const stat={reg:"lin"},sgrid=mkGrid({cols:["x","y"],rows:blank(12,2),grow:true,max:200});
function statList(){const g=sgrid;return{render:()=>g.render(),soft:["1-VAR","2-VAR","FREQ","CLEAR","REG:"+stat.reg.toUpperCase(),""],
 f(i){if(i==0)go(oneVar(false));else if(i==1)go(twoVar());else if(i==2)go(oneVar(true));
  else if(i==3){g.rows.splice(0,g.rows.length,...blank(12,2));g.r=g.c=0;g.buf=null;say("Data cleared")}
  else if(i==4)menu("Regression type",Object.keys(REGS).map(k=>[REGS[k],()=>{stat.reg=k;go(statList())}]))},
 ...gridKeys(g,()=>setMode("home"))}}
function oneVar(freq){const xs=[],fs=[];sgrid.rows.forEach((r,i)=>{if(r[0]==="")return;if(freq&&r[1]==="")throw new Error("Frequency missing in row "+(i+1));xs.push(Number(r[0]));fs.push(freq?Number(r[1]):1)});
 if(!xs.length)throw new Error("No data in the x column");const s=stats1(xs,fs);
 return resScreen({back:()=>go(statList()),lines:[["n",F(s.n)],["x̄ (mean)",F(s.mean)],["Σx",F(s.sum)],["Σx²",F(s.sumSq)],["σx",F(s.sigma)],["sx",F(s.sx)],["min x",F(s.min)],["Q1",F(s.q1)],["Med",F(s.med)],["Q3",F(s.q3)],["max x",F(s.max)]]})}
function twoVar(){const xs=[],ys=[];sgrid.rows.forEach((r,i)=>{if(r[0]===""&&r[1]==="")return;if(r[0]===""||r[1]==="")throw new Error("Row "+(i+1)+" needs both x and y");xs.push(Number(r[0]));ys.push(Number(r[1]))});
 if(xs.length<2)throw new Error("Need at least 2 pairs");const s=stats2(xs,ys),g=regress(stat.reg,xs,ys);
 const lines=[["n",F(s.n)],["x̄",F(s.mx)],["Σx",F(s.sumX)],["Σx²",F(s.sumX2)],["σx",F(s.sigX)],["sx",F(s.sx)],["ȳ",F(s.my)],["Σy",F(s.sumY)],["Σy²",F(s.sumY2)],["σy",F(s.sigY)],["sy",F(s.sy)],["Σxy",F(s.sumXY)],
  ["Model",REGS[stat.reg].split("  ")[0]],["a",F(g.a)],["b",F(g.b)]];
 if(g.type=="quad")lines.push(["c",F(g.c)],["R²",F(g.r2)]);else lines.push(["r",F(g.r)]);
 const scr=resScreen({back:()=>go(statList()),lines,soft:["LIST","","","","","PRED"],f:i=>{if(i==0)go(statList());else menu("Predict",[["ŷ from x",()=>ask(true)],["x̂ from y",()=>ask(false)]])}});
 const ask=fromX=>{const t=prompt(fromX?"x =":"y =");if(t===null)return;fire(()=>{const v=evNum(t);if(!isFinite(v))throw new Error("Math Error");
  lines.push(fromX?["ŷ("+F(v)+")",F(g.predict(v))]:["x̂("+F(v)+")",g.invert(v).map(F).join(" or ")||"none"]);paint();mv.scrollTop=mv.scrollHeight})};
 return scr}

// ---- Equation
const EQ=[["Simultaneous: 2 unknowns","s",2],["Simultaneous: 3 unknowns","s",3],["Simultaneous: 4 unknowns","s",4],["Polynomial: degree 2","p",2],["Polynomial: degree 3","p",3],["Polynomial: degree 4","p",4]];
const eqG={};let eqHl=0;
function eqMenu(){return{render(){const t=document.createElement("table");t.className="tbl";
  EQ.forEach((e,i)=>{const r=document.createElement("tr");r.appendChild(mkc("th",i+1,"rl"));const td=mkc("td",e[0],i==eqHl?"hl2":"");td.style.textAlign="left";r.appendChild(td);r.onclick=()=>{eqHl=i;go(eqInput(i))};t.appendChild(r)});return t},
  soft:[],ins(a){if(/^[1-6]$/.test(a)){eqHl=+a-1;go(eqInput(eqHl))}},nav(m){eqHl=Math.max(0,Math.min(5,eqHl+(m=="u"?-1:m=="d"?1:0)))},eq(){go(eqInput(eqHl))},exit(){setMode("home")}}}
function eqInput(i){const[title,kind,n]=EQ[i],key=kind+n;
 const g=eqG[key]||(eqG[key]=kind=="s"?mkGrid({cols:["x","y","z","w"].slice(0,n).concat(["="]),rows:blank(n,n+1),max:n}):mkGrid({cols:["coef"],rl:Array.from({length:n+1},(_,k)=>n-k==0?"c":n-k==1?"x":"x^"+(n-k)),rows:blank(n+1,1),max:n+1}));
 const back=()=>go(eqInput(i)),num=r=>r.map(v=>v===""?0:Number(v));
 return{render:()=>g.render(),soft:["SOLV"],
  f(){if(kind=="s"){const M=g.rows.map(num),x=solveLinear(M.map(r=>r.slice(0,n)),M.map(r=>r[n]));
    go(resScreen({back,lines:x?x.map((v,k)=>[["x","y","z","w"][k],F(v)]):[["","No unique solution"]]}))}
   else{const c=g.rows.map(r=>num(r)[0]);if(c[0]===0)throw new Error("The first coefficient cannot be 0");
    go(resScreen({back,lines:polyRoots(c).map((z,k)=>["x"+(k+1),cplx(z)])}))}},
  ...gridKeys(g,()=>go(eqMenu()),true)}}

// ---- Table
const tg=mkGrid({cols:["value"],rl:["f(x)=","Start","End","Step"],rows:[[""],[""],[""],["1"]],text:r=>r==0,max:4});
function tableData(){const f=tg.rows[0][0];if(!f)throw new Error("Enter f(x) first");
 const[a,b,s]=[1,2,3].map(i=>{const v=tg.rows[i][0];if(v==="")throw new Error("Fill in Start, End and Step");return Number(v)});
 if(!(s>0)||a>b)throw new Error("Need Start ≤ End and Step > 0");const n=Math.floor((b-a)/s+1e-9)+1;if(n>99)throw new Error("Too many rows (max 99)");return{f,a,b,s,n}}
const safeNum=(f,x)=>{try{return evNum(f,x)}catch(_){return NaN}};
function tablePlot(){const d=tableData();let lo=Infinity,hi=-Infinity;for(let i=0;i<=200;i++){const y=safeNum(d.f,d.a+(d.b-d.a)*i/200);if(isFinite(y)){lo=Math.min(lo,y);hi=Math.max(hi,y)}}
 if(!(hi>lo)){lo=-1;hi=1}const w=d.b>d.a?d.b-d.a:2,x0=d.b>d.a?d.a:d.a-1;gfs=[d.f];gw={x0:x0-w*.05,x1:x0+w*1.05,y0:lo-(hi-lo)*.1,y1:hi+(hi-lo)*.1};setMode("graph")}
function tableIn(){return{render:()=>tg.render(),soft:["TABLE","GRAPH"],
 f(i){if(i==1)return tablePlot();const d=tableData(),lines=[];
  for(let k=0;k<d.n;k++){const x=parseFloat((d.a+k*d.s).toPrecision(12)),y=safeNum(d.f,x);lines.push([F(x),isFinite(y)?F(y):"ERROR"])}
  go(resScreen({head:["x","f(x)"],lines,back:()=>go(tableIn()),soft:["LIST","GRAPH"],f:j=>j==0?go(tableIn()):fire(tablePlot)}))},
 ...gridKeys(tg,()=>setMode("home"))}}

// ---- Base-N
const BN={10:"DEC",16:"HEX",2:"BIN",8:"OCT"},bn={base:10,e:"",p:0};
const bnVal=()=>bn.e.trim()?evalBase(bn.e,bn.base):null;
function baseScreen(){
 const put=t=>{bn.e=bn.e.slice(0,bn.p)+t+bn.e.slice(bn.p);bn.p+=t.length};
 const setBase=b=>{let t="";try{const v=bnVal();if(v!==null)t=toBase(v,b).replace(/ /g,"")}catch(_){}bn.base=b;bn.e=t;bn.p=t.length;say("Base: "+BN[b])};
 return{render(){const w=document.createElement("div"),ex=document.createElement("div");ex.className="bnx";
  ex.append(bn.e.slice(0,bn.p));ex.appendChild(mkc("span","","car"));ex.append(bn.e.slice(bn.p));w.appendChild(ex);
  let v=null,msg="";try{v=bnVal()}catch(e){msg=e.message}
  const t=document.createElement("table");t.className="tbl";
  [[10,"Dec"],[16,"Hex"],[2,"Bin"],[8,"Oct"]].forEach(([b,l])=>{const r=document.createElement("tr");r.appendChild(mkc("th",l,"rl"));r.appendChild(mkc("td",v===null?"":toBase(v,b),b==bn.base?"hl2":""));t.appendChild(r)});
  w.appendChild(t);if(msg)w.appendChild(mkc("div",msg,"bnerr"));return w},
  soft:["DEC","HEX","BIN","OCT","LOGIC",""],
  f(i){if(i<4)setBase([10,16,2,8][i]);else menu("Logic operations",[["and"," and "],["or"," or "],["xor"," xor "],["xnor"," xnor "],["not(","not("],["neg(","neg("]].map(([l,t])=>[l,()=>{put(t);paint()}]))},
  ins(a){const ok={2:/^[01]$/,8:/^[0-7]$/,10:/^[0-9]$/,16:/^[0-9A-Fa-f]$/}[bn.base];if(a.length==1&&ok.test(a))put(a.toUpperCase());else if(a.length==1&&"+−×÷()".includes(a))put(a);else say("Not allowed in "+BN[bn.base])},
  nav(m){if(m=="l")bn.p=Math.max(0,bn.p-1);if(m=="r")bn.p=Math.min(bn.e.length,bn.p+1)},
  del(){const left=bn.e.slice(0,bn.p),m=/( and | or | xor | xnor |not\(|neg\(|[\s\S])$/.exec(left);if(m){bn.e=left.slice(0,left.length-m[0].length)+bn.e.slice(bn.p);bn.p-=m[0].length}},
  ac(){bn.e="";bn.p=0},
  eq(){const v=bnVal();if(v!==null){bn.e=toBase(v,bn.base).replace(/ /g,"");bn.p=bn.e.length}},
  exit(){setMode("home")}}}

// ---- Matrix and vector
const MK="ABCDEF".split(""),mats={};MK.forEach(k=>mats[k]={r:2,c:2,d:blank(2,2)});let mi=0;
const mnum=k=>mats[k].d.map(r=>r.map(v=>v===""?0:Number(v)));
const pickMat=(title,cb)=>menu(title,MK.map(k=>[k+"   ("+mats[k].r+"×"+mats[k].c+")",()=>cb(k)]));
function matList(){return{render(){const t=document.createElement("table");t.className="tbl";
  MK.forEach((k,i)=>{const r=document.createElement("tr"),m=mats[k];r.appendChild(mkc("th","Mat "+k,"rl"));
   const td=mkc("td",m.r+"×"+m.c+"   "+m.d[0].map(v=>v===""?"0":v).join(" ")+(m.r>1?" …":""),i==mi?"hl2":"");td.style.textAlign="left";r.appendChild(td);r.onclick=()=>{mi=i;go(matEdit(k))};t.appendChild(r)});return t},
  soft:["EDIT","DIM","OPER","CLEAR","",""],
  f(i){const k=MK[mi];if(i==0)go(matEdit(k));else if(i==1)setDim(k);else if(i==2)opMenu();else if(i==3){mats[k].d=blank(mats[k].r,mats[k].c);say("Mat "+k+" cleared")}},
  nav(m){mi=Math.max(0,Math.min(5,mi+(m=="u"?-1:m=="d"?1:0)))},eq(){go(matEdit(MK[mi]))},exit(){setMode("home")}}}
function setDim(k){const t=prompt("Size of Mat "+k+" as rows,columns (for example 3,3):",mats[k].r+","+mats[k].c);if(t===null)return;
 const[r,c]=t.split(",").map(x=>parseInt(x));if(!(r>=1&&r<=6&&c>=1&&c<=6)){say("Rows and columns must be from 1 to 6");return}
 const old=mats[k].d;mats[k]={r,c,d:blank(r,c).map((row,i)=>row.map((_,j)=>(old[i]&&old[i][j])||""))}}
function matEdit(k){const m=mats[k],g=mkGrid({cols:Array.from({length:m.c},(_,j)=>String(j+1)),rl:Array.from({length:m.r},(_,i)=>String(i+1)),rows:m.d,max:m.r});
 return{render:()=>g.render(),soft:["BACK"],f:()=>go(matList()),...gridKeys(g,()=>go(matList()),true)}}
const OPS=[["Determinant","det",1],["Inverse","inv",1],["Transpose","tr",1],["Row-reduce (RREF)","rref",1],["Rank","rank",1],["Trace","trace",1],
 ["Add  A + B","add",2],["Subtract  A − B","sub",2],["Multiply  A × B","mul",2],["Multiply by a number","scale",1],["Power  A^n","pow",1],["Identity matrix","id",0],
 ["Vector: dot product","dot",2],["Vector: cross product","cross",2],["Vector: length |A|","norm",1],["Vector: angle between","angle",2]];
function opMenu(){menu("Matrix operations",OPS.map(([l,op,n])=>[l,()=>{if(n==0)runOp(op,[]);else if(n==1)pickMat("Which matrix?",a=>runOp(op,[a]));else pickMat("First matrix (A)",a=>pickMat("Second matrix (B)",b=>runOp(op,[a,b])))}]))}
function matResult(title,R){return{render(){const w=document.createElement("div");w.appendChild(mkc("div",title,"bnx"));const tb=document.createElement("table");tb.className="tbl";
  R.forEach(r=>{const tr=document.createElement("tr");r.forEach(v=>tr.appendChild(mkc("td",F(v))));tb.appendChild(tr)});w.appendChild(tb);return w},
  soft:["BACK","→MAT"],f(i){if(i==0)go(matList());else pickMat("Store in which matrix?",k=>{mats[k]={r:R.length,c:R[0].length,d:R.map(r=>r.map(v=>String(parseFloat(v.toPrecision(12)))))};go(matList(),"Stored in Mat "+k)})},
  nav(m){if(m=="u")mv.scrollTop-=28;if(m=="d")mv.scrollTop+=28},exit:()=>go(matList()),eq(){}}}
function runOp(op,ks){fire(()=>{const A=ks[0]?mnum(ks[0]):null,B=ks[1]?mnum(ks[1]):null;
 const scal=(l,v)=>go(resScreen({back:()=>go(matList()),lines:[[l,F(v)]]})),mres=(t,R)=>go(matResult(t,R));
 if(op=="det")scal("det "+ks[0],mDet(A));else if(op=="rank")scal("rank "+ks[0],mRank(A));else if(op=="trace")scal("trace "+ks[0],mTrace(A));
 else if(op=="norm")scal("|"+ks[0]+"|",mNorm(A));else if(op=="dot")scal(ks[0]+" · "+ks[1],mDot(A,B));else if(op=="angle")scal("angle "+ks[0]+","+ks[1],deg(mAngle(A,B)));
 else if(op=="inv")mres(ks[0]+"⁻¹",mInv(A));else if(op=="tr")mres(ks[0]+"ᵀ",mTranspose(A));else if(op=="rref")mres("rref "+ks[0],mRref(A));
 else if(op=="add")mres(ks[0]+" + "+ks[1],mAdd(A,B));else if(op=="sub")mres(ks[0]+" − "+ks[1],mSub(A,B));else if(op=="mul")mres(ks[0]+" × "+ks[1],mMul(A,B));else if(op=="cross")mres(ks[0]+" × "+ks[1],mCross(A,B));
 else if(op=="scale"){const t=prompt("Multiply "+ks[0]+" by:");if(t===null)return;const k=evNum(t);if(!isFinite(k))throw new Error("Math Error");mres("k × "+ks[0],mScale(k,A))}
 else if(op=="pow"){const t=prompt("Power n (a whole number):","2");if(t===null)return;const n=evNum(t);if(!Number.isInteger(n))throw new Error("Math Error");mres(ks[0]+"^"+n,mPow(A,n))}
 else if(op=="id"){const t=prompt("Size n (1 to 6):","3");if(t===null)return;const n=parseInt(t);if(!(n>=1&&n<=6))throw new Error("Size must be 1 to 6");mres("Identity "+n+"×"+n,mIdentity(n))}})}

// ---- generic pick list and input form (used by Distribution, Ratio and Inequality)
function pickScreen(items,st,open,exit){return{render(){const t=document.createElement("table");t.className="tbl";
  items.forEach((l,i)=>{const r=document.createElement("tr");r.appendChild(mkc("th",i+1,"rl"));const td=mkc("td",l,i==st.i?"hl2":"");td.style.textAlign="left";r.appendChild(td);r.onclick=()=>{st.i=i;open(i)};t.appendChild(r)});return t},
  soft:[],ins(a){const n=/^[1-9]$/.test(a)?+a-1:-1;if(n>=0&&n<items.length){st.i=n;open(n)}},
  nav(m){st.i=Math.max(0,Math.min(items.length-1,st.i+(m=="u"?-1:m=="d"?1:0)))},eq(){open(st.i)},exit}}
function formScreen(def,back){const g=def.g||(def.g=mkGrid({cols:["value"],rl:def.rl,rows:def.defaults.map(d=>[d]),max:def.rl.length}));
 return{render:()=>g.render(),soft:def.soft||["CALC"],
  f(i){const v=g.rows.map(r=>r[0]===""?null:Number(r[0]));go(resScreen({back:()=>go(formScreen(def,back)),lines:def.run(i,v)}))},
  ...gridKeys(g,back)}}
const need=(v,i,n)=>{if(v[i]===null||!isFinite(v[i]))throw new Error("Enter "+n);return v[i]};
const whole=(x,n)=>{if(!Number.isInteger(x)||x<0)throw new Error(n+" must be a whole number, 0 or more");return x};
const sdev=s=>{if(s<=0)throw new Error("σ must be greater than 0");return s};
const prob=p=>{if(p<0||p>1)throw new Error("p must be between 0 and 1");return p};

// ---- Distribution
const DD=[
 {t:"Normal: density f(x)",rl:["x","μ (mean)","σ (std dev)"],defaults:["","0","1"],run:(i,v)=>{const x=need(v,0,"x"),m=need(v,1,"μ"),s=sdev(need(v,2,"σ"));return[["f(x)",F(normPdf(x,m,s))],["z",F((x-m)/s)]]}},
 {t:"Normal: area between two values",rl:["Lower (blank = −∞)","Upper (blank = +∞)","μ (mean)","σ (std dev)"],defaults:["","","0","1"],run:(i,v)=>{const m=need(v,2,"μ"),s=sdev(need(v,3,"σ")),a=v[0]===null?-Infinity:v[0],b=v[1]===null?Infinity:v[1];if(a>b)throw new Error("Lower must not be above Upper");
   return[["p",F(normArea(a,b,m,s))],["z lower",isFinite(a)?F((a-m)/s):"−∞"],["z upper",isFinite(b)?F((b-m)/s):"+∞"]]}},
 {t:"Inverse normal",rl:["Area (left tail)","μ (mean)","σ (std dev)"],defaults:["","0","1"],run:(i,v)=>{const p=need(v,0,"Area"),m=need(v,1,"μ"),s=sdev(need(v,2,"σ")),x=normInv(p,m,s);return[["x",F(x)],["z",F((x-m)/s)]]}},
 {t:"Binomial: P(X = x)",rl:["x","n (trials)","p"],defaults:["","",""],run:(i,v)=>[["P(X = x)",F(binomPdf(whole(need(v,0,"x"),"x"),whole(need(v,1,"n"),"n"),prob(need(v,2,"p"))))]]},
 {t:"Binomial: P(X ≤ x)",rl:["x","n (trials)","p"],defaults:["","",""],run:(i,v)=>[["P(X ≤ x)",F(binomCdf(whole(need(v,0,"x"),"x"),whole(need(v,1,"n"),"n"),prob(need(v,2,"p"))))]]},
 {t:"Inverse binomial",rl:["Area","n (trials)","p"],defaults:["","",""],run:(i,v)=>[["smallest x",F(binomInv(need(v,0,"Area"),whole(need(v,1,"n"),"n"),prob(need(v,2,"p"))))]]},
 {t:"Poisson: P(X = x)",rl:["x","λ (mean)"],defaults:["",""],run:(i,v)=>{const l=need(v,1,"λ");if(l<=0)throw new Error("λ must be greater than 0");return[["P(X = x)",F(poissonPdf(whole(need(v,0,"x"),"x"),l))]]}},
 {t:"Poisson: P(X ≤ x)",rl:["x","λ (mean)"],defaults:["",""],run:(i,v)=>{const l=need(v,1,"λ");if(l<=0)throw new Error("λ must be greater than 0");return[["P(X ≤ x)",F(poissonCdf(whole(need(v,0,"x"),"x"),l))]]}},
 {t:"Inverse Poisson",rl:["Area","λ (mean)"],defaults:["",""],run:(i,v)=>{const l=need(v,1,"λ");if(l<=0)throw new Error("λ must be greater than 0");return[["smallest x",F(poissonInv(need(v,0,"Area"),l))]]}}];
const dst={i:0};
const distMenu=()=>pickScreen(DD.map(d=>d.t),dst,i=>go(formScreen(DD[i],()=>go(distMenu()))),()=>setMode("home"));

// ---- Ratio
const RD=[
 {t:"Solve  a : b = c : d  (leave one blank)",rl:["a","b","c","d"],defaults:["","","",""],run:(i,v)=>{const r=solveRatio(...v),nm="abcd"[r.index],f=frac(r.value);return[[nm,F(r.value)]].concat(f?[[nm+" (fraction)",f]]:[])}},
 {t:"Share a total in a ratio",rl:["Total","Part 1","Part 2","Part 3","Part 4"],defaults:["","","","",""],run:(i,v)=>{const t=need(v,0,"Total"),p=v.slice(1).filter(x=>x!==null);return shareRatio(t,p).map((x,k)=>["Part "+(k+1),F(x)])}},
 {t:"Simplify a ratio",rl:["Part 1","Part 2","Part 3","Part 4","Part 5"],defaults:["","","","",""],run:(i,v)=>{const p=v.filter(x=>x!==null);return[["Simplified",simplifyRatio(p).join(" : ")]]}}];
const rst={i:0};
const ratioMenu=()=>pickScreen(RD.map(d=>d.t),rst,i=>go(formScreen(RD[i],()=>go(ratioMenu()))),()=>setMode("home"));

// ---- Inequality
const PL=["a (x⁴)","b (x³)","c (x²)","d (x)","e"];
const ID=[["Quadratic: ax² + bx + c",2],["Cubic: ax³ + bx² + cx + d",3],["Quartic: ax⁴ + bx³ + cx² + dx + e",4]].map(([t,n])=>({t,
 rl:n==2?["a (x²)","b (x)","c"]:n==3?["a (x³)","b (x²)","c (x)","d"]:PL,defaults:Array(n+1).fill(""),soft:["> 0","< 0","≥ 0","≤ 0"],
 run:(i,v)=>{const c=v.map(x=>x===null?0:x);if(c[0]===0)throw new Error("The first coefficient cannot be 0");const rel=[">","<","≥","≤"][i],r=solveIneq(c,rel);
  const rows=[["Solving","p(x) "+rel+" 0"],["Real roots",r.roots.length?r.roots.map(F).join(", "):"none"]];
  describeIneq(r,F).forEach((x,k)=>rows.push([k?"or":"x",x]));return rows}}));
const ist={i:0};
const ineqMenu=()=>pickScreen(ID.map(d=>d.t),ist,i=>go(formScreen(ID[i],()=>go(ineqMenu()))),()=>setMode("home"));

// ---- Spreadsheet
let sheetNow=null;
const sheetRaw=ref=>{const m=/^([A-E])(\d+)$/.exec(ref);const row=sheetG.rows[+m[2]-1];return row?row[m[1].charCodeAt(0)-65]:""};
const sheetShow=(ri,ci,raw)=>{if(raw==="")return"";try{const x=sheetNow.value(String.fromCharCode(65+ci)+(ri+1));return x===null?"":typeof x==="string"?x:F(x)}catch(_){return"ERR"}};
const sheetG=mkGrid({cols:["A","B","C","D","E"],rl:ri=>String(ri+1),rows:blank(12,5),raw:true,grow:true,max:99,show:sheetShow});
function sheetScreen(){const g=sheetG,ins=t=>{g.ins(t);paint()};
 return{render(){sheetNow=makeSheet(sheetRaw,evNum);const w=g.render(),raw=g.rows[g.r][g.c],ref=String.fromCharCode(65+g.c)+(g.r+1);
   if(g.buf===null){let msg=raw;if(raw!==""){try{sheetNow.value(ref)}catch(e){msg+="   → "+e.message}}say(ref+(msg?":  "+msg:""))}else say(ref);return w},
  soft:["=","SUM","AVG","FN","CLEAR",""],
  f(i){const fn=t=>g.ins((g.buf===null||g.buf===""?"=":"")+t);if(i==0)g.ins("=");else if(i==1)fn("SUM(");else if(i==2)fn("AVERAGE(");
   else if(i==3)menu("Insert",[[": (range, as in A1:A5)",":"],["MIN(","MIN("],["MAX(","MAX("],["COUNT(","COUNT("],["SUM(","SUM("],["AVERAGE(","AVERAGE("]].map(([l,t])=>[l,()=>ins(t.length>1&&t!==":"&&(g.buf===null||g.buf==="")?"="+t:t)]));
   else if(i==4)menu("Clear the whole sheet?",[["Yes, clear everything",()=>{g.rows.splice(0,g.rows.length,...blank(12,5));g.r=g.c=0;g.buf=null;paint()}],["No",()=>{}]])},
  ...gridKeys(g,()=>setMode("home"))}}
