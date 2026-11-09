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
 soft.innerHTML="";for(let i=0;i<6;i++){const d=document.createElement("div");d.textContent=(cur.soft||[])[i]||"";d.onclick=()=>{if(d.textContent&&cur.f){fire(()=>cur.f(i));paint()}};soft.appendChild(d)}
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
 if(m=="home")go(homeScreen());else if(m=="stat")go(statList());else if(m=="eq")go(eqMenu());else go(tableIn())}

// ---- editable grid used by Statistics, Equation and Table
function mkGrid(o){const g={cols:o.cols,rl:o.rl,rows:o.rows,r:0,c:0,buf:null,max:o.max||99,text:o.text||(()=>false),grow:!!o.grow};
 g.commit=()=>{if(g.buf===null)return true;const s=g.buf.trim();
  if(s===""){g.rows[g.r][g.c]="";g.buf=null;return true}
  if(g.text(g.r,g.c)){g.rows[g.r][g.c]=s;g.buf=null;return true}
  try{const v=evNum(s);if(!isFinite(v))throw 0;g.rows[g.r][g.c]=String(parseFloat(v.toPrecision(12)));g.buf=null;return true}
  catch(_){say("That entry is not a valid number");return false}};
 g.ins=t=>{if(g.buf===null)g.buf="";g.buf+=t};
 g.del=()=>{if(g.buf!==null&&g.buf.length)g.buf=g.buf.slice(0,-1);else{g.buf=null;g.rows[g.r][g.c]=""}};
 g.move=(dr,dc)=>{if(!g.commit())return;let r=g.r+dr,c=g.c+dc;if(c<0||c>=g.cols.length)c=g.c;if(r<0)r=0;
  if(r>=g.rows.length){if(g.grow&&g.rows.length<g.max)g.rows.push(g.cols.map(()=>""));else r=g.rows.length-1}g.r=r;g.c=c};
 g.render=()=>{const w=document.createElement("div"),t=document.createElement("table");t.className="tbl";const h=document.createElement("tr");
  if(g.rl)h.appendChild(mkc("th",""));g.cols.forEach(c=>h.appendChild(mkc("th",c)));t.appendChild(h);
  g.rows.forEach((row,ri)=>{const tr=document.createElement("tr");if(g.rl)tr.appendChild(mkc("th",g.rl[ri]||"","rl"));
   row.forEach((v,ci)=>{const sel=ri==g.r&&ci==g.c,td=mkc("td",sel&&g.buf!==null?g.buf+"▏":v,sel?"sel":"");if(g.text(ri,ci))td.style.textAlign="left";
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
const TILES=[["Run-Matrix","run"],["Statistics","stat"],["Graph","graph"],["Table","table"],["Equation","eq"],["Base-N"],["Matrix"],["Distribution"],["Spreadsheet"]];
let hl=0;
function homeScreen(){const open=i=>{const t=TILES[i];if(!t[1])return say(t[0]+" arrives in a later phase");setMode(t[1])};
 return{render(){const d=document.createElement("div");d.className="tiles";
  TILES.forEach((t,i)=>{const e=document.createElement("div");e.className="tile"+(t[1]?"":" soon")+(i==hl?" hl":"");e.appendChild(mkc("b",i+1));e.append(t[0]);e.onclick=()=>{hl=i;open(i)};d.appendChild(e)});return d},
  soft:[],ins(a){if(/^[1-9]$/.test(a)){hl=+a-1;open(hl)}},nav(m){hl=Math.max(0,Math.min(8,hl+{l:-1,r:1,u:-3,d:3}[m]))},eq(){open(hl)},exit(){setMode("run")}}}

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
