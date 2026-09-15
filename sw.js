'use strict';
const CACHE='led-layout-mobile-316';
const ASSETS=['./','index.html','style.css','mobile.css','effects.js','video.js','core.js','pdf.js','xlsx.js','app.js','mobile.js','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('led-layout-mobile-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url),base=new URL(self.registration.scope);if(e.request.method!=='GET'||url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;const rel=url.pathname.slice(base.pathname.length);if(!ASSETS.includes(rel||'./'))return;e.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(rel||'./');return cached||fetch(e.request);}));});
