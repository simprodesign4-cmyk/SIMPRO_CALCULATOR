"use strict";
/* SIMPRO_CALCULATOR probability distributions: normal, binomial, Poisson. */
function lgam(x){if(x<0.5)return Math.log(Math.PI/Math.abs(Math.sin(Math.PI*x)))-lgam(1-x);x-=1;
 const g=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
 let a=0.99999999999980993;const t=x+7.5;g.forEach((c,i)=>a+=c/(x+i+1));return 0.5*Math.log(2*Math.PI)+(x+0.5)*Math.log(t)-t+Math.log(a)}
// standard normal cumulative probability P(Z <= z)
function phi(z){if(z===Infinity)return 1;if(z===-Infinity)return 0;const a=Math.abs(z);let q;
 if(a<3){let sum=a,term=a;for(let n=1;n<300;n++){term*=a*a/(2*n+1);sum+=term;if(term<1e-17*sum)break}q=0.5-Math.exp(-a*a/2)/Math.sqrt(2*Math.PI)*sum}
 else{let f=0;for(let k=100;k>=1;k--)f=k/(a+f);q=Math.exp(-a*a/2)/Math.sqrt(2*Math.PI)/(a+f)}
 return z>=0?1-q:q}
const normPdf=(x,m,s)=>Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));
const normCdf=(x,m,s)=>phi((x-m)/s);
function normArea(a,b,m,s){const za=(a-m)/s,zb=(b-m)/s;return za>=0?phi(-za)-phi(-zb):phi(zb)-phi(za)}
function normInv(p,m,s){if(!(p>0&&p<1))throw new Error("Area must be between 0 and 1");let lo=-40,hi=40;for(let i=0;i<200;i++){const mid=(lo+hi)/2,v=phi(mid);if(v===p){lo=hi=mid;break}if(v<p)lo=mid;else hi=mid}return m+s*(lo+hi)/2}
function binomPdf(k,n,p){if(k<0||k>n)return 0;if(p===0)return k===0?1:0;if(p===1)return k===n?1:0;
 return Math.exp(lgam(n+1)-lgam(k+1)-lgam(n-k+1)+k*Math.log(p)+(n-k)*Math.log1p(-p))}
function binomCdf(k,n,p){if(k<0)return 0;if(k>=n)return 1;let s=0;for(let i=0;i<=k;i++)s+=binomPdf(i,n,p);return Math.min(1,s)}
function binomInv(q,n,p){if(!(q>0&&q<1))throw new Error("Area must be between 0 and 1");let s=0;for(let k=0;k<=n;k++){s+=binomPdf(k,n,p);if(s>=q*(1-1e-12))return k}return n}
const poissonPdf=(k,l)=>k<0?0:Math.exp(-l+k*Math.log(l)-lgam(k+1));
function poissonCdf(k,l){if(k<0)return 0;let s=0;for(let i=0;i<=k;i++)s+=poissonPdf(i,l);return Math.min(1,s)}
function poissonInv(q,l){if(!(q>0&&q<1))throw new Error("Area must be between 0 and 1");let s=0;for(let k=0;k<1e6;k++){s+=poissonPdf(k,l);if(s>=q*(1-1e-12))return k}throw new Error("Math Error")}
if(typeof module!=="undefined")module.exports={phi,normPdf,normCdf,normArea,normInv,binomPdf,binomCdf,binomInv,poissonPdf,poissonCdf,poissonInv};
