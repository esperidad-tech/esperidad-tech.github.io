/* Brumeval : marche sans connexion après la première ouverture (le réseau d'abord, la copie gardée en secours).
   Les voix (fichiers de Hugging Face) sont gardées par le moteur de voix lui-même (OPFS) : on ne les copie jamais ici.
   « 📥 Jouer sans internet » (menu ☰, heros.js) demande par message de tout garder tout de suite : le jeu, la salle,
   les icônes, le manifeste, les polices utilisées, et, si les voix sont là, les fichiers du moteur des voix. */
var CACHE = 'brumeval-20261104-2039';
var EXT = 'brumeval-ext';   /* polices et moteur des voix (adresses avec numéro de version) : gardés d'une version du jeu à l'autre */
var FICHIERS = ['./', './index.html', './salle.html', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
/* jsDelivr : le moteur des voix (vits-web) et ce qu'il importe ; cdnjs : le moteur ONNX ; Google : les polices */
var HOTES = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FICHIERS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(l){ return Promise.all(l.filter(function(k){ return k !== CACHE && k !== EXT && /^brumeval-/.test(k); }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
function aGarder(url){
  var u = new URL(url);
  if(u.origin === self.location.origin) return u.pathname.indexOf('/brumeval/') === 0 && u.pathname.indexOf('/brumeval/voix/') !== 0;
  return HOTES.indexOf(u.hostname) >= 0;   /* jamais Hugging Face (les modèles des voix sont dans l'OPFS) */
}
function boite(url){ return new URL(url).origin === self.location.origin ? CACHE : EXT; }
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET' || !aGarder(e.request.url)) return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r && (r.ok || r.type === 'opaque')){ var copie = r.clone(); caches.open(boite(e.request.url)).then(function(c){ c.put(e.request, copie); }); }
    return r;
  }).catch(function(){
    return caches.match(e.request, {ignoreVary:true}).then(function(r){ return r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined) || Response.error(); });
  }));
});

/* ---------- « Jouer sans internet » : garder tout de suite une liste de fichiers ----------
   message {type:'brumeval-garder', urls:[…], polices:[css Google]} avec un MessagePort ;
   réponses {fait, total} puis {fini:true, faits:[…], echecs:[…]} */
function garderUn(url){
  if(!aGarder(url)) return Promise.reject(new Error('pas gardé'));
  var meme = new URL(url).origin === self.location.origin;
  return fetch(new Request(url, meme ? {cache:'reload'} : {mode:'cors', credentials:'omit', cache:'reload'})).then(function(r){
    if(!r || !r.ok) throw new Error('HTTP ' + (r ? r.status : '?'));
    return caches.open(boite(url)).then(function(c){ return c.put(url, r.clone()); }).then(function(){ return r; });
  });
}
/* La feuille de style des polices, puis les fichiers woff2 qu'elle cite (alphabets latin et latin étendu : le français) */
function polices(css){
  return garderUn(css).then(function(r){ return r.text(); }).then(function(t){
    var l = [], m, re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{[^}]*?url\(([^)]+)\)/g;
    while((m = re.exec(t))) if(m[1] === 'latin' || m[1] === 'latin-ext') l.push(m[2].replace(/['"]/g, ''));
    if(!l.length){ var re2 = /url\(([^)]+)\)/g; while((m = re2.exec(t))) l.push(m[1].replace(/['"]/g, '')); }
    return l;
  });
}
function garder(d, dire){
  var liste = [], vu = {}, faits = [], echecs = [];
  function ajoute(u){ try{ u = new URL(u, self.registration.scope).href; }catch(x){ return; } if(!vu[u] && aGarder(u)){ vu[u] = 1; liste.push(u); } }
  FICHIERS.forEach(ajoute);
  (d.urls || []).forEach(ajoute);
  var css = (d.polices || []).filter(function(u){ return aGarder(u); }), fait = 0;
  dire({fait:0, total:liste.length + css.length});
  return Promise.all(css.map(function(c){
    return polices(c).then(function(l){ faits.push(c); l.forEach(ajoute); }, function(){ echecs.push(c); }).then(function(){ fait++; });
  })).then(function(){
    var total = liste.length + css.length, i = 0;
    dire({fait:fait, total:total});
    function suivant(){
      if(i >= liste.length) return Promise.resolve();
      var u = liste[i++];
      return garderUn(u).then(function(){ faits.push(u); }, function(){ echecs.push(u); }).then(function(){ fait++; dire({fait:fait, total:total}); return suivant(); });
    }
    return Promise.all([suivant(), suivant(), suivant()]);
  }).then(function(){ dire({fini:true, faits:faits, echecs:echecs}); });
}
self.addEventListener('message', function(e){
  var d = e.data || {};
  if(d.type !== 'brumeval-garder') return;
  var port = e.ports && e.ports[0];
  function dire(m){ try{ if(port) port.postMessage(m); else if(e.source) e.source.postMessage(m); }catch(x){} }
  e.waitUntil(garder(d, dire).catch(function(x){ dire({fini:true, faits:[], echecs:['erreur : ' + x.message]}); }));
});
