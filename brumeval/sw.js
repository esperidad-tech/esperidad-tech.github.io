/* Brumeval : marche sans connexion après la première ouverture.
   Les voix (fichiers de Hugging Face) sont gardées par le moteur de voix lui-même (OPFS) : on ne les copie pas ici. */
var CACHE = 'brumeval-20261103-0205';
var FICHIERS = ['./', './index.html', './salle.html', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FICHIERS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(l){ return Promise.all(l.filter(function(k){ return k !== CACHE && /^brumeval-/.test(k); }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
function aGarder(url){
  var u = new URL(url);
  if(u.origin === self.location.origin) return u.pathname.indexOf('/brumeval/') === 0 && u.pathname.indexOf('/brumeval/voix/') !== 0;
  return u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
}
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET' || !aGarder(e.request.url)) return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r && (r.ok || r.type === 'opaque')){ var copie = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copie); }); }
    return r;
  }).catch(function(){
    return caches.match(e.request).then(function(r){ return r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined) || Response.error(); });
  }));
});
