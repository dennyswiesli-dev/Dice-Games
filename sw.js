const CACHE='dreissiger-v4';
const ASSETS=['./','./index.html','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim();});
const isAppShell = url => url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url = new URL(e.request.url);
  if(isAppShell(url)){
    // App-Shell (index.html): immer zuerst das Netz versuchen, damit Updates
    // sofort ankommen. Nur bei fehlendem Netz auf den Cache zurückfallen.
    e.respondWith(fetch(e.request).then(resp=>{
      const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return resp;}).catch(()=>caches.match('./index.html'))));
});
