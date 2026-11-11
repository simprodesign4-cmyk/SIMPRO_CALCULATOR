"use strict";
/* SIMPRO_CALCULATOR solvers: equations and statistics. Pure maths, no screen code. */
function solveLinear(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);let sc=0;M.forEach(r=>r.forEach(v=>sc=Math.max(sc,Math.abs(v))));
 for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
  if(Math.abs(M[p][c])<1e-12*(sc||1))return null;[M[c],M[p]]=[M[p],M[c]];
  for(let r=0;r<n;r++)if(r!==c){const f=M[r][c]/M[c][c];for(let k=c;k<=n;k++)M[r][k]-=f*M[c][k]}}
 return M.map((r,i)=>r[n]/r[i])}

const cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
const cdv=(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]};
const horner=(c,z)=>{let r=[c[0],0];for(let i=1;i<c.length;i++){r=cm(r,z);r[0]+=c[i]}return r};
// coefficients from the highest power to the constant; returns [{re,im}] sorted
function polyRoots(c){c=c.slice();while(c.length>1&&c[0]===0)c.shift();const n=c.length-1;if(n<1)throw new Error("Degree must be at least 1");
 let z;
 if(n===1)z=[[-c[1]/c[0],0]];
 else if(n===2){const[a,b,cc]=c,D=b*b-4*a*cc,s=Math.sqrt(Math.abs(D));
  if(D>=0){const q=-(b+(b>=0?s:-s))/2,r1=q/a,r2=q!==0?cc/q:r1;z=[[Math.min(r1,r2),0],[Math.max(r1,r2),0]]} // stable form: no cancellation
  else z=[[-b/(2*a),s/(2*a)],[-b/(2*a),-s/(2*a)]]}
 else{const m=c.map(v=>v/c[0]);z=[];let p=[1,0];for(let k=0;k<n;k++){z.push(p);p=cm(p,[0.4,0.9])}
  for(let it=0;it<2000;it++){let mx=0;for(let k=0;k<n;k++){let d=[1,0];for(let j=0;j<n;j++)if(j!==k)d=cm(d,[z[k][0]-z[j][0],z[k][1]-z[j][1]]);const dz=cdv(horner(m,z[k]),d);z[k]=[z[k][0]-dz[0],z[k][1]-dz[1]];mx=Math.max(mx,Math.hypot(dz[0],dz[1]))}if(mx<1e-15)break}
  const dm=m.slice(0,-1).map((v,i)=>v*(n-i));
  for(let k=0;k<n;k++)for(let t=0;t<4;t++){const d=horner(dm,z[k]);if(Math.hypot(d[0],d[1])<1e-14)break;const dz=cdv(horner(m,z[k]),d);z[k]=[z[k][0]-dz[0],z[k][1]-dz[1]]}}
 const out=z.map(([re,im])=>{if(Math.abs(im)<1e-7*(1+Math.abs(re)))im=0;if(Math.abs(re)<1e-9)re=0;return{re,im}});
 out.sort((p,q)=>Math.abs(p.re-q.re)<1e-9?p.im-q.im:p.re-q.re);return out}

// one-variable statistics; fs = whole-number frequencies (optional)
function stats1(xs,fs){fs=fs||xs.map(()=>1);
 if(!xs.length)throw new Error("No data");
 if(fs.some(f=>!(f>0)||!Number.isInteger(f)))throw new Error("Frequencies must be positive whole numbers");
 const P=xs.map((x,i)=>[x,fs[i]]).sort((a,b)=>a[0]-b[0]);let n=0;P.forEach(p=>n+=p[1]);
 const at=i=>{let c=0;for(const p of P){c+=p[1];if(i<c)return p[0]}return P[P.length-1][0]};
 const med=(lo,hi)=>{const m=hi-lo;return m%2?at(lo+(m-1)/2):(at(lo+m/2-1)+at(lo+m/2))/2};
 let s=0,s2=0;P.forEach(([x,f])=>{s+=x*f;s2+=x*x*f});const mean=s/n;let ss=0;P.forEach(([x,f])=>ss+=f*(x-mean)**2);const h=Math.floor(n/2);
 return{n,sum:s,sumSq:s2,mean,sigma:Math.sqrt(ss/n),sx:n>1?Math.sqrt(ss/(n-1)):NaN,min:P[0][0],max:P[P.length-1][0],q1:n>1?med(0,h):P[0][0],med:med(0,n),q3:n>1?med(n-h,n):P[0][0]}}

function stats2(xs,ys){const n=xs.length,sum=a=>a.reduce((s,v)=>s+v,0),mx=sum(xs)/n,my=sum(ys)/n;
 const sxx=sum(xs.map(x=>(x-mx)**2)),syy=sum(ys.map(y=>(y-my)**2));
 return{n,mx,my,sumX:sum(xs),sumY:sum(ys),sumX2:sum(xs.map(x=>x*x)),sumY2:sum(ys.map(y=>y*y)),sumXY:sum(xs.map((x,i)=>x*ys[i])),
  sigX:Math.sqrt(sxx/n),sigY:Math.sqrt(syy/n),sx:n>1?Math.sqrt(sxx/(n-1)):NaN,sy:n>1?Math.sqrt(syy/(n-1)):NaN}}

// straight-line fit, worked from deviations about the means so that large x or y values do not lose accuracy
function linFit(xs,ys){const n=xs.length,mx=xs.reduce((t,v)=>t+v,0)/n,my=ys.reduce((t,v)=>t+v,0)/n;let sxx=0,syy=0,sxy=0;
 for(let i=0;i<n;i++){const dx=xs[i]-mx,dy=ys[i]-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy}
 if(sxx===0||sxx<1e-30*n*(1+mx*mx))throw new Error("Math Error");
 const b=sxy/sxx;return{a:my-b*mx,b,r:syy<=0?NaN:sxy/Math.sqrt(sxx*syy),mx,my}}
// type: lin | quad | log | exp | pow
function regress(type,xs,ys){const n=xs.length;if(n<2)throw new Error("Need at least 2 points");
 const pos=a=>{if(a.some(v=>!(v>0)))throw new Error("Math Error")};
 if(type==="lin"){const{a,b,r,mx,my}=linFit(xs,ys);return{type,a,b,r,predict:x=>my+b*(x-mx),invert:y=>[mx+(y-my)/b]}}
 if(type==="log"){pos(xs);const{a,b,r}=linFit(xs.map(Math.log),ys);return{type,a,b,r,predict:x=>a+b*Math.log(x),invert:y=>[Math.exp((y-a)/b)]}}
 if(type==="exp"){pos(ys);const f=linFit(xs,ys.map(Math.log)),a=Math.exp(f.a),b=f.b;return{type,a,b,r:f.r,predict:x=>a*Math.exp(b*x),invert:y=>[Math.log(y/a)/b]}}
 if(type==="pow"){pos(xs);pos(ys);const f=linFit(xs.map(Math.log),ys.map(Math.log)),a=Math.exp(f.a),b=f.b;return{type,a,b,r:f.r,predict:x=>a*Math.pow(x,b),invert:y=>[Math.pow(y/a,1/b)]}}
 if(type==="quad"){if(n<3)throw new Error("Need at least 3 points");
  const mx=xs.reduce((t,v)=>t+v,0)/n,u=xs.map(x=>x-mx),my=ys.reduce((t,v)=>t+v,0)/n;
  const S=k=>u.reduce((t,v)=>t+Math.pow(v,k),0),T=k=>u.reduce((t,v,i)=>t+Math.pow(v,k)*ys[i],0);
  const sol=solveLinear([[S(4),S(3),S(2)],[S(3),S(2),S(1)],[S(2),S(1),n]],[T(2),T(1),T(0)]);if(!sol)throw new Error("Math Error");
  const[A,B,Cc]=sol;let sr=0,st=0;u.forEach((v,i)=>{sr+=(ys[i]-(A*v*v+B*v+Cc))**2;st+=(ys[i]-my)**2});
  // shift back to the original x: y = A(x-mx)^2 + B(x-mx) + Cc
  return{type,a:A,b:B-2*A*mx,c:Cc-B*mx+A*mx*mx,r2:st===0?NaN:1-sr/st,predict:x=>A*(x-mx)**2+B*(x-mx)+Cc,invert:y=>polyRoots([A,B,Cc-y]).filter(z=>z.im===0).map(z=>z.re+mx)}}
 throw new Error("Unknown regression type")}

if(typeof module!=="undefined")module.exports={solveLinear,polyRoots,stats1,stats2,regress};
