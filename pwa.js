"use strict";
/* Registers the offline service worker and shows an Install button when the browser offers one. */
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
let installEvt=null;
const installBtn=()=>document.getElementById("bInst");
addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;if(installBtn())installBtn().hidden=false});
addEventListener("appinstalled",()=>{installEvt=null;if(installBtn())installBtn().hidden=true});
document.addEventListener("DOMContentLoaded",()=>{const b=installBtn();if(b)b.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice;installEvt=null;b.hidden=true}});
