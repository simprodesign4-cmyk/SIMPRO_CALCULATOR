"use strict";
/* SIMPRO_CALCULATOR service worker: keeps a copy of the app so it opens with no internet.
   Online it always fetches the newest files first; offline it uses the saved copy.
   Raise the number in CACHE when you publish a new version. */
const CACHE="simpro-calculator-v3";
const ASSETS=["./","index.html","style.css","calc.js","solvers.js","basen.js","matrix.js","dist.js","ratio.js","ineq.js","sheet.js","ui.js","modes.js","pwa.js",
 "manifest.webmanifest","privacy-policy.html","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png","icons/favicon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res})
  .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==="navigate"?caches.match("index.html"):Response.error()))))});
