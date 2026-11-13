/* ==========================================================
   Brumeval — voix naturelles (Piper, dans le navigateur).
   Deux voix téléchargées une seule fois (≈ 120 Mo) puis utilisables sans internet :
   Siwis pour les femmes, Tom pour les hommes ; chaque personnage a sa hauteur.
   Validé par Romain le 2 novembre. Ne marche que sur la version installée (GitHub) :
   ailleurs (aperçu), le jeu garde la voix de l'appareil.

   LE MOTEUR, REFAIT LE 13 NOVEMBRE (Romain : « dès qu'on appuie, le son sort instantanément » ; Bible §12.61).
   Avant : à chaque 🔊, la bibliothèque rechargeait tout (le modèle de 60 Mo, le moteur de calcul, la prononciation) :
   plusieurs secondes sur un iPhone, près d'une minute sur une vieille tablette, l'écran figé pendant ce temps.
   Maintenant :
   1. un travailleur à part (Worker) garde tout en mémoire : une voix se charge UNE fois, ensuite une phrase ne coûte que son calcul,
      et l'écran ne se fige plus ;
   2. un texte se lit phrase par phrase : la première part dès qu'elle est prête, les suivantes se fabriquent pendant qu'on écoute ;
   3. sur un appareil rapide, la première phrase de chaque 🔊 visible à l'écran est préparée d'avance ;
   4. LA RÈGLE : JAMAIS D'ATTENTE. Si la voix naturelle n'est pas prête tout de suite, c'est la voix de l'appareil qui lit, à l'instant.
      Un appareil trop lent pour ces voix (c'est mesuré : V.mode() === 'lent') lit toujours avec sa propre voix et ne charge rien.
   Ne jamais remettre un appel à predict() de la bibliothèque dans le chemin normal : c'est lui qui faisait attendre.
   ========================================================== */
(function(){
'use strict';
var F = 'fr_FR-siwis-medium', H = 'fr_FR-tom-medium';
var MODELES = [{id:F, nom:'Siwis (voix de femme)'}, {id:H, nom:'Tom (voix d\'homme)'}];
/* h = hauteur et débit (1 = normal) */
var CAST = {
  narrateur:{v:F, h:1.00},
  margot:{v:F, h:1.05}, melusine:{v:F, h:1.12}, iris:{v:F, h:0.96}, odette:{v:F, h:0.88}, tim:{v:F, h:1.25},
  gaspard:{v:H, h:1.00}, basile:{v:H, h:0.93}, victor:{v:H, h:1.07}, anselme:{v:H, h:0.86}, fortune:{v:H, h:1.14},
  grosbec:{v:H, h:0.82}, silas:{v:H, h:0.95}, farinel:{v:H, h:1.10}, voisin:{v:H, h:1.03}, bastien:{v:H, h:0.90},
  levoisin:{v:H, h:0.89}, leo:{v:H, h:1.18}
};
var SOURCES = [
  'https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm',
  'https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/+esm'
];
/* ---------- Tablettes Android sans « navigator.storage.getDirectory » (Chrome avant 109, autres navigateurs) ----------
   Le moteur de voix range ses modèles dans le stockage privé du navigateur (OPFS). Quand il n'existe pas,
   on le remplace par une petite copie faite avec IndexedDB (Romain, 3 novembre : « getDirectory is not a function »).
   Seul ce que le moteur utilise : getDirectoryHandle, getFileHandle, createWritable (write, close), getFile, remove, keys. */
(function(){
  try{
    if(!navigator.storage) Object.defineProperty(navigator, 'storage', {value:{}, configurable:true});
    if(typeof navigator.storage.getDirectory === 'function' || !window.indexedDB) return;
  }catch(e){ return; }
  var dbp = null;
  function base(){
    return dbp || (dbp = new Promise(function(ok, ko){
      var r = indexedDB.open('brumeval-voix', 1);
      r.onupgradeneeded = function(){ r.result.createObjectStore('f'); };
      r.onsuccess = function(){ ok(r.result); };
      r.onerror = function(){ dbp = null; ko(r.error); };
    }));
  }
  function op(mode, fn){
    return base().then(function(d){ return new Promise(function(ok, ko){
      var t = d.transaction('f', mode), st = t.objectStore('f'), res;
      var q = fn(st); if(q) q.onsuccess = function(){ res = q.result; };
      t.oncomplete = function(){ ok(res); };
      t.onerror = t.onabort = function(){ ko(t.error || new Error('IndexedDB')); };
    }); });
  }
  function absent(){ var e = new Error('A requested file or directory could not be found.'); e.name = 'NotFoundError'; return e; }
  function sous(chemin){ return op('readonly', function(st){ return st.getAllKeys(); }).then(function(l){ return (l || []).filter(function(k){ return k.indexOf(chemin + '/') === 0; }); }); }
  function fichier(chemin){
    return {kind:'file', name:chemin.split('/').pop(),
      getFile:function(){ return op('readonly', function(st){ return st.get(chemin); }).then(function(b){ if(b === undefined) throw absent(); return b; }); },
      createWritable:function(){
        var morceaux = [];
        return Promise.resolve({
          write:function(x){ morceaux.push(x && x.data !== undefined ? x.data : x); return Promise.resolve(); },
          close:function(){ var b = new Blob(morceaux); return op('readwrite', function(st){ return st.put(b, chemin); }); },
          abort:function(){ morceaux = []; return Promise.resolve(); }
        });
      },
      remove:function(){ return op('readwrite', function(st){ return st.delete(chemin); }); }
    };
  }
  function dossier(chemin){
    return {kind:'directory', name:chemin.split('/').pop(),
      getDirectoryHandle:function(n){ return Promise.resolve(dossier(chemin + '/' + n)); },
      getFileHandle:function(n, o){
        var c = chemin + '/' + n;
        return op('readonly', function(st){ return st.get(c); }).then(function(b){
          if(b !== undefined) return fichier(c);
          if(o && o.create) return op('readwrite', function(st){ return st.put(new Blob([]), c); }).then(function(){ return fichier(c); });
          throw absent();
        });
      },
      removeEntry:function(n){ return op('readwrite', function(st){ return st.delete(chemin + '/' + n); }); },
      remove:function(){ return sous(chemin).then(function(l){ return op('readwrite', function(st){ l.forEach(function(k){ st.delete(k); }); }); }); },
      keys:function(){
        var l = null, i = 0, prefixe = chemin + '/';
        var it = {next:function(){
          return (l ? Promise.resolve(l) : sous(chemin).then(function(x){ l = x.map(function(k){ return k.slice(prefixe.length); }).filter(function(k){ return k.indexOf('/') < 0; }); return l; }))
            .then(function(){ return i < l.length ? {value:l[i++], done:false} : {value:undefined, done:true}; });
        }};
        if(window.Symbol && Symbol.asyncIterator) it[Symbol.asyncIterator] = function(){ return it; };
        return it;
      }
    };
  }
  try{ navigator.storage.getDirectory = function(){ return Promise.resolve(dossier('opfs')); }; }catch(e){}
  /* Blob.text() et Blob.arrayBuffer() (navigateurs anciens) */
  function lireBlob(b, comment){ return new Promise(function(ok, ko){ var r = new FileReader(); r.onload = function(){ ok(r.result); }; r.onerror = function(){ ko(r.error); }; r[comment](b); }); }
  if(window.Blob && !Blob.prototype.arrayBuffer) Blob.prototype.arrayBuffer = function(){ return lireBlob(this, 'readAsArrayBuffer'); };
  if(window.Blob && !Blob.prototype.text) Blob.prototype.text = function(){ return lireBlob(this, 'readAsText'); };
  window.__brumeOpfsSecours = true;
})();

var lib = null, audio = null, jeton = 0;
var V = window.Voix = {pret:false, possible:/^https:/.test(location.protocol) && !/claude\.ai|claudeusercontent/.test(location.hostname), etat:'', erreur:''};

/* ==========================================================
   LES RÉGLAGES DU MOTEUR
   ========================================================== */
/* Le moteur de calcul (ONNX, version 1.18.0 : la même que la bibliothèque) : cdnjs d'abord (c'est l'adresse que les tablettes
   « sans internet » ont déjà gardée), jsDelivr en secours. La prononciation (espeak) : jsDelivr, mêmes adresses qu'avant. */
var ORT_BASES = ['https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/', 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/'];
var PHON = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';
var SEUIL = 600;         /* millisecondes : si la voix naturelle demande plus, on ne fait pas attendre, la voix de l'appareil lit */
var RAPIDE = 0.5;        /* un appareil est « rapide » s'il fabrique la voix au moins deux fois plus vite qu'elle ne se dit */
var MAX_OCTETS = 24e6;   /* les phrases déjà fabriquées, gardées en mémoire (environ neuf minutes de voix) */
var MIN_BOUT = 28, MAX_BOUT = 120;   /* longueur d'un morceau à lire, en lettres */
var CLE_M = 'brumeval-voix-mesure', CLE_T = 'brumeval-voix-temoin';
var ETALON = ['Bienvenue à Brumeval, le village des brumes.', 'Les enquêteurs se retrouvent sur la place du village.', 'Chacun raconte aux autres ce qu\'il a découvert.'];
function rien(){}

/* ==========================================================
   LE TRAVAILLEUR. Cette fonction ne tourne pas ici : son texte part dans un Worker (travailleur()), elle ne voit donc rien du jeu.
   Messages : init {bases, phon} ; voix {id, modele (fichier ou contenu), config} ; dire {id, texte} → {pcm, hz, msPhon, msCalc} ;
   oublier {id} ; fichiers → {l}. Une demande à la fois, dans l'ordre d'arrivée.
   ========================================================== */
function moteur(){
  var bases = [], phonBase = '', base = '', ortPret = null, phonPret = null, sortie = [], sess = {}, conf = {}, fil = Promise.resolve();
  function maintenant(){ return (self.performance && performance.now) ? performance.now() : Date.now(); }
  function chargerOrt(){
    if(ortPret) return ortPret;
    ortPret = new Promise(function(ok, ko){
      var err = null, i;
      for(i = 0; i < bases.length && !base; i++){
        try{ importScripts(bases[i] + 'ort.wasm.min.js'); if(self.ort) base = bases[i]; }catch(e){ err = e; }
      }
      if(!base){ ko(err || new Error('moteur de calcul introuvable')); return; }
      /* un seul fil : GitHub ne permet pas d'en avoir plusieurs (pas de « crossOriginIsolated ») */
      self.ort.env.wasm.numThreads = 1; self.ort.env.wasm.proxy = false; self.ort.env.wasm.wasmPaths = base;
      ok(self.ort);
    });
    ortPret.catch(function(){ ortPret = null; });
    return ortPret;
  }
  /* La prononciation : chargée une fois, puis on rappelle le même programme pour chaque phrase */
  function chargerPhon(){
    if(phonPret) return phonPret;
    phonPret = new Promise(function(ok, ko){
      try{ importScripts(phonBase + '.js'); }catch(e){ ko(e); return; }
      self.createPiperPhonemize({
        noInitialRun:true, noExitRuntime:true,
        print:function(l){ sortie.push(l); }, printErr:function(){},
        locateFile:function(u){ return /\.wasm$/.test(u) ? phonBase + '.wasm' : /\.data$/.test(u) ? phonBase + '.data' : u; }
      }).then(ok, ko);
    });
    phonPret.catch(function(){ phonPret = null; });
    return phonPret;
  }
  /* Les numéros des sons. Ceux du programme de prononciation conviennent aux voix d'aujourd'hui ; une voix plus ancienne,
     à l'alphabet plus petit, est servie avec sa propre table (config.phoneme_id_map). */
  function alphabet(j, c){
    var ids = j.phoneme_ids || [], max = 0, i;
    for(i = 0; i < ids.length; i++) if(ids[i] > max) max = ids[i];
    if(!c.num_symbols || max < c.num_symbols || !c.phoneme_id_map || !j.phonemes) return ids;
    var m = c.phoneme_id_map, r = [].concat(m['^'] || [], m['_'] || []);
    j.phonemes.forEach(function(p){ if(m[p]) r = r.concat(m[p], m['_'] || []); });
    return r.concat(m['$'] || []);
  }
  function prononcer(texte, c){
    return chargerPhon().then(function(mod){
      sortie = [];
      mod.callMain(['-l', c.espeak.voice, '--input', JSON.stringify([{text:texte}]), '--espeak_data', '/espeak-ng-data']);
      var ids = [];
      sortie.forEach(function(l){ var j = null; try{ j = JSON.parse(l); }catch(e){} if(j && j.phoneme_ids) ids = ids.concat(alphabet(j, c)); });
      if(!ids.length) throw new Error('prononciation vide');
      return ids;
    });
  }
  function contenu(x){
    if(x && x.byteLength !== undefined) return Promise.resolve(x);
    return new Promise(function(ok, ko){
      function rate(){ var e = new Error('lecture du fichier'); e.lecture = true; ko(e); }
      try{
        if(x.arrayBuffer) x.arrayBuffer().then(ok, rate);
        else ok(new FileReaderSync().readAsArrayBuffer(x));
      }catch(e){ rate(); }
    });
  }
  function chargerVoix(m){
    return chargerOrt().then(function(){ return contenu(m.modele); }).then(function(buf){
      return self.ort.InferenceSession.create(new Uint8Array(buf), {executionProviders:['wasm']});
    }).then(function(s){
      var vieux = sess[m.id];
      sess[m.id] = s; conf[m.id] = m.config;
      if(vieux && vieux.release) try{ vieux.release(); }catch(e){}
      return chargerPhon();
    }).then(function(){ return {base:base}; });
  }
  function dire(m){
    var c = conf[m.id], s = sess[m.id], t0 = maintenant(), t1 = t0;
    if(!c || !s) return Promise.reject(new Error('voix pas chargée'));
    return prononcer(m.texte, c).then(function(ids){
      t1 = maintenant();
      var n = ids.length, big = new BigInt64Array(n), i, T = self.ort.Tensor;
      for(i = 0; i < n; i++) big[i] = BigInt(ids[i]);
      var feeds = {
        input:new T('int64', big, [1, n]),
        input_lengths:new T('int64', BigInt64Array.from([BigInt(n)]), [1]),
        scales:new T('float32', Float32Array.from([c.inference.noise_scale, c.inference.length_scale, c.inference.noise_w]), [3])
      };
      if(c.speaker_id_map && Object.keys(c.speaker_id_map).length) feeds.sid = new T('int64', BigInt64Array.from([BigInt(0)]), [1]);
      return s.run(feeds);
    }).then(function(r){
      var f = r.output.data, pcm = new Int16Array(f.length), k, x;
      for(k = 0; k < f.length; k++){ x = f[k]; pcm[k] = x >= 1 ? 32767 : x <= -1 ? -32768 : (x * 32768) | 0; }
      return {pcm:pcm, hz:c.audio.sample_rate, msPhon:t1 - t0, msCalc:maintenant() - t1, _t:[pcm.buffer]};
    });
  }
  function oublier(m){
    var s = sess[m.id];
    delete sess[m.id]; delete conf[m.id];
    if(!s || !s.release) return {};
    return Promise.resolve().then(function(){ return s.release(); }).then(function(){ return {}; }, function(){ return {}; });
  }
  function fichiers(){
    var l = [];
    try{ l = performance.getEntriesByType('resource').map(function(x){ return x.name; }); }catch(e){}
    return {l:l, base:base};
  }
  self.onmessage = function(ev){
    var m = ev.data || {};
    if(m.t === 'init'){ bases = m.bases || []; phonBase = m.phon || ''; return; }
    fil = fil.then(function(){
      return m.t === 'voix' ? chargerVoix(m) : m.t === 'dire' ? dire(m) : m.t === 'oublier' ? oublier(m) : m.t === 'fichiers' ? fichiers() : {};
    }).then(function(r){
      r = r || {};
      var t = r._t || [];
      delete r._t; r.n = m.n;
      self.postMessage(r, t);
    }, function(e){
      self.postMessage({n:m.n, err:String((e && e.message) || e || 'erreur'), lecture:!!(e && e.lecture)});
    });
  };
}

/* ---------- Le travailleur, vu d'ici ---------- */
var W = null, wMort = false, wN = 0, attente = {}, wBase = '', echecs = 0;
function travailleur(){
  if(W || wMort) return W;
  try{
    W = new Worker(URL.createObjectURL(new Blob(['(' + moteur.toString() + ')();'], {type:'text/javascript'})));
    W.onmessage = function(ev){
      var m = ev.data || {}, a = attente[m.n];
      if(!a) return;
      delete attente[m.n]; clearTimeout(a.g);
      if(m.err){ var e = new Error(m.err); e.lecture = m.lecture; a.ko(e); } else a.ok(m);
    };
    W.onerror = function(ev){ try{ ev.preventDefault(); }catch(e){} panne((ev && ev.message) || 'le moteur des voix s\'est arrêté'); };
    W.postMessage({t:'init', bases:ORT_BASES, phon:PHON});
  }catch(e){ W = null; wMort = true; V.erreur = e.message; }
  return W;
}
/* Une demande au travailleur ; sans réponse au bout du délai, le moteur est déclaré en panne (la voix de l'appareil prend la suite) */
function demander(msg, transfert, delai){
  return new Promise(function(ok, ko){
    var w = travailleur();
    if(!w){ ko(new Error('pas de moteur')); return; }
    var n = ++wN;
    attente[n] = {ok:ok, ko:ko, g:setTimeout(function(){ if(attente[n]) panne('le moteur des voix ne répond plus'); }, delai || 90000)};
    msg.n = n;
    try{ w.postMessage(msg, transfert || []); }catch(e){ clearTimeout(attente[n].g); delete attente[n]; ko(e); }
  });
}
/* Arrête le travailleur et rend sa mémoire. Les phrases déjà fabriquées restent. */
function liberer(){
  var l = attente, f = file;
  attente = {}; file = [];
  if(W){ try{ W.terminate(); }catch(e){} W = null; }
  voixW = {}; voixPrete = {}; premiers = {}; chargements = 0;
  Object.keys(l).forEach(function(k){ clearTimeout(l[k].g); l[k].ko(new Error('moteur arrêté')); });
  f.forEach(function(j){ rejeter(j, new Error('moteur arrêté')); });
}
function panne(raison){ wMort = true; V.erreur = raison || 'panne'; temoin(0); liberer(); }

/* ---------- Le témoin : la page s'est-elle fermée toute seule pendant le chargement d'une voix ? ----------
   Charger une voix demande beaucoup de mémoire. Si le navigateur ferme la page à ce moment-là deux fois de suite,
   on n'insiste pas sur cet appareil : la voix de l'appareil lit (V.mode() === 'panne'). */
function temoin(pose){ try{ if(pose) localStorage.setItem(CLE_T, '1'); else localStorage.removeItem(CLE_T); }catch(e){} }
function lireMesure(){
  try{ var o = JSON.parse(localStorage.getItem(CLE_M) || 'null'); if(o && typeof o === 'object' && typeof o.r === 'number') return o; }catch(e){}
  return {r:0, c:0, n:0, d:0, p:0, ok:false};
}
function ecrireMesure(){ try{ localStorage.setItem(CLE_M, JSON.stringify(mesure)); }catch(e){} }
/* mesure (gardée d'un lancement à l'autre) : le résultat de la mesure de vitesse, et rien d'autre.
   r = temps de fabrication ÷ durée du son (0,2 = cinq fois plus vite que la parole) ; c = millisecondes par lettre ;
   n = nombre de phrases mesurées ; d = date ; p = fermetures brutales de suite ; ok = classé « rapide ».
   vif (pendant la séance) : la vitesse du moment, qui sert à prévoir l'attente. Un appareil qui rame un moment (il chauffe,
   il fait autre chose) n'est pas déclassé pour autant : ses prévisions s'allongent, et c'est la voix de l'appareil qui lit. */
var mesure = lireMesure(), vif = {r:mesure.r, c:mesure.c}, premiers = {}, etalon = null;
try{
  if(localStorage.getItem(CLE_T)){ localStorage.removeItem(CLE_T); mesure.p = (mesure.p || 0) + 1; ecrireMesure(); }
}catch(e){}
/* une page qu'on quitte ou qu'on met de côté n'est pas une fermeture brutale */
window.addEventListener('pagehide', function(){ temoin(0); });
document.addEventListener('visibilitychange', function(){ if(document.hidden) temoin(0); });

/* 'absent' (voix pas téléchargées), 'inconnu' (pas encore mesuré), 'rapide', 'lent', 'panne' */
function mode(){
  if(!V.pret) return 'absent';
  if(wMort || (mesure.p || 0) >= 2) return 'panne';
  if(!mesure.n) return 'inconnu';
  return mesure.r <= RAPIDE ? 'rapide' : 'lent';
}
V.mode = mode;
/* Combien de fois plus vite que la parole cet appareil fabrique la voix (0 = pas mesuré) : affiché dans les Réglages */
V.vitesse = function(){ return mesure.n && mesure.r > 0 ? Math.round(10 / mesure.r) / 10 : 0; };

/* ---------- Charger une voix dans le travailleur (une seule fois) ---------- */
var voixW = {}, voixPrete = {}, chargements = 0;
function fichierVoix(nom){
  return navigator.storage.getDirectory().then(function(d){ return d.getDirectoryHandle('piper'); })
    .then(function(d){ return d.getFileHandle(nom); }).then(function(h){ return h.getFile(); });
}
function chargerVoix(id){
  if(voixW[id]) return voixW[id];
  var t0 = Date.now();
  temoin(1); chargements++;
  var p = Promise.all([
    fichierVoix(id + '.onnx'),
    fichierVoix(id + '.onnx.json').then(function(b){ return b.text(); }).then(function(t){ return JSON.parse(t); })
  ]).then(function(r){
    return demander({t:'voix', id:id, modele:r[0], config:r[1]}, null, 240000).catch(function(e){
      if(!e.lecture || wMort) throw e;
      /* le travailleur n'arrive pas à lire le fichier lui-même (vieux navigateur) : on lui en passe le contenu */
      return r[0].arrayBuffer().then(function(buf){ return demander({t:'voix', id:id, modele:buf, config:r[1]}, [buf], 240000); });
    });
  }).then(function(m){
    wBase = (m && m.base) || wBase; voixPrete[id] = Date.now() - t0; echecs = 0;
    chargements--;
    if(!chargements) temoin(0);
    if(mesure.p){ mesure.p = 0; ecrireMesure(); }
    return true;
  });
  voixW[id] = p;
  p.catch(function(e){
    chargements = Math.max(0, chargements - 1);
    temoin(0); V.erreur = (e && e.message) || 'voix';
    if(voixW[id] === p) delete voixW[id];
    if(++echecs >= 2 && !wMort) panne(V.erreur);
  });
  return p;
}

/* ---------- Les phrases : la file d'attente et la réserve ----------
   Priorités : 4 = la phrase qu'on attend pour lire maintenant ; 3 = la suite du texte en cours de lecture ;
   2 = les phrases de la mesure de vitesse ; 1 = un texte qui vient d'apparaître à l'écran ; 0 = un texte déjà là.
   Le travailleur ne fait qu'une phrase à la fois. */
var file = [], enCours = null, sons = {}, octets = 0, enLecture = {};
function cle(v, p){ return v + '|' + p; }
function rejeter(j, err){ var l = j.att; j.att = []; l.forEach(function(a){ a.ko(err); }); }
function vouloir(v, phrase, prio){
  var k = cle(v, phrase), j = null, i;
  if(sons[k]){ sons[k].t = Date.now(); return Promise.resolve(sons[k]); }
  if(enCours && enCours.k === k) j = enCours;
  for(i = 0; !j && i < file.length; i++) if(file[i].k === k) j = file[i];
  if(!j){ j = {k:k, v:v, p:phrase, prio:prio, att:[]}; file.push(j); }
  else if(prio > j.prio) j.prio = prio;
  var pr = new Promise(function(ok, ko){ j.att.push({ok:ok, ko:ko}); });
  pomper();
  return pr;
}
function pomper(){
  if(enCours || !file.length) return;
  var m = 0, i;
  for(i = 1; i < file.length; i++) if(file[i].prio > file[m].prio) m = i;   /* la plus pressée ; à égalité, la plus ancienne */
  var j = enCours = file.splice(m, 1)[0];
  chargerVoix(j.v).then(function(){ j.t1 = Date.now(); return demander({t:'dire', id:j.v, texte:j.p}); }).then(function(r){
    var e = ranger(j.k, r);
    mesurer(j, r, e);
    if(enCours === j) enCours = null;
    var l = j.att; j.att = [];
    l.forEach(function(a){ a.ok(e); });
    pomper();
  }, function(err){
    if(enCours === j) enCours = null;
    rejeter(j, err);
    pomper();
  });
}
function enteteWav(n, hz){
  var d = new DataView(new ArrayBuffer(44));
  d.setUint32(0, 1179011410, true); d.setUint32(4, 36 + n * 2, true); d.setUint32(8, 1163280727, true); d.setUint32(12, 544501094, true);
  d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, hz, true); d.setUint32(28, hz * 2, true);
  d.setUint16(32, 2, true); d.setUint16(34, 16, true); d.setUint32(36, 1635017060, true); d.setUint32(40, n * 2, true);
  return d.buffer;
}
function ranger(k, r){
  var n = r.pcm.length, b = new Blob([enteteWav(n, r.hz), r.pcm.buffer], {type:'audio/x-wav'});
  var e = sons[k] = {url:URL.createObjectURL(b), o:b.size, d:n / r.hz, t:Date.now(), ms:(r.msPhon || 0) + (r.msCalc || 0)};
  octets += e.o;
  if(octets > MAX_OCTETS){
    /* trop de sons gardés : les plus anciens s'en vont (jamais ceux du texte en cours de lecture) */
    Object.keys(sons).sort(function(a, c){ return sons[a].t - sons[c].t; }).forEach(function(x){
      if(octets <= MAX_OCTETS * 0.75 || x === k || enLecture[x]) return;
      try{ URL.revokeObjectURL(sons[x].url); }catch(err){}
      octets -= sons[x].o; delete sons[x];
    });
  }
  return e;
}
function mesurer(j, r, e){
  if(document.hidden || !e || !(e.d > 0)) return;
  if(!premiers[j.v]){ premiers[j.v] = 1; return; }   /* la toute première phrase d'une voix est plus lente : la mise en route */
  var ms = (r.msPhon || 0) + (r.msCalc || 0), x = {r:ms / (e.d * 1000), c:ms / Math.max(1, j.p.length)};
  if(!(x.r > 0) || !isFinite(x.r)) return;
  if(etalon){ etalon.push(x); return; }
  if(!(vif.c > 0)){ vif.r = x.r; vif.c = x.c; }
  else { vif.r = vif.r * 0.7 + x.r * 0.3; vif.c = vif.c * 0.7 + x.c * 0.3; }
}
/* Dans combien de millisecondes cette phrase pourrait-elle partir ? (Infinity : on n'en sait rien, ou la voix n'est pas chargée) */
function estimer(v, phrase){
  /* pendant qu'une voix se charge (plusieurs secondes), le travailleur ne fabrique rien */
  if(!mesure.n || !(vif.c > 0) || !voixPrete[v] || wMort || chargements) return Infinity;
  var ms = phrase.length * vif.c + 30;
  if(enCours){
    var reste = Math.max(0, enCours.p.length * vif.c + 30 - (Date.now() - (enCours.t1 || Date.now())));
    if(enCours.k === cle(v, phrase)) return reste;
    ms += reste;
  }
  return ms;
}

/* ---------- Couper un texte en morceaux à lire ----------
   Après un point, un point d'exclamation, d'interrogation ou de suspension (le guillemet fermant reste avec sa phrase).
   Un morceau trop court attend la phrase suivante ; une phrase trop longue se coupe à une virgule. */
function decouper(t){
  var l = [], re = /[^.!?…]*[.!?…]+(?:\s*[»”"')\]])*\s*|[^.!?…]+$/g, m, cur = '', fin;
  while((m = re.exec(t))){
    if(!m[0]){ re.lastIndex++; continue; }
    cur += m[0];
    fin = cur.replace(/\s+$/, '');
    if(fin.length < MIN_BOUT) continue;
    if(/(^|\s)\S\.$/.test(fin)) continue;                                      /* une initiale (« M. ») */
    if(/\d\.$/.test(fin) && /^\d/.test(t.slice(re.lastIndex))) continue;       /* un nombre à virgule écrit avec un point */
    l.push(fin); cur = '';
  }
  cur = cur.replace(/^\s+|\s+$/g, '');
  if(cur){ if(l.length && cur.length < MIN_BOUT) l[l.length - 1] += ' ' + cur; else l.push(cur); }
  var r = [];
  l.forEach(function(p){
    while(p.length > MAX_BOUT){
      var bout = p.slice(0, MAX_BOUT - 10), i = Math.max(bout.lastIndexOf(', '), bout.lastIndexOf(' ; '), bout.lastIndexOf(' : '));
      if(i < 40) break;
      i = p.indexOf(' ', i + 1);
      r.push(p.slice(0, i)); p = p.slice(i + 1);
    }
    r.push(p);
  });
  return r.length ? r : [t];
}
V.decouper = decouper;

function charger(){
  if(lib) return Promise.resolve(lib);
  var i = 0;
  return new Promise(function(ok, ko){
    (function suivant(){
      if(i >= SOURCES.length){ ko(new Error('moteur de voix introuvable')); return; }
      import(SOURCES[i++]).then(function(m){ lib = m; ok(m); }).catch(suivant);
    })();
  });
}
/* Les deux voix sont-elles déjà dans l'appareil ? */
V.verifier = function(){
  if(!V.possible) return Promise.resolve(false);
  return charger().then(function(m){ return m.stored(); }).then(function(st){
    V.pret = MODELES.every(function(x){ return st.indexOf(x.id) >= 0; });
    V.manquants = MODELES.filter(function(x){ return st.indexOf(x.id) < 0; });
    return V.pret;
  }).catch(function(e){ V.erreur = e.message; V.pret = false; return false; });
};
/* Télécharge ce qui manque ; avance(fraction 0..1, texte) */
V.telecharger = function(avance){
  return charger().then(function(m){
    return m.stored().then(function(st){
      var aFaire = MODELES.filter(function(x){ return st.indexOf(x.id) < 0; }), k = 0;
      function suite(){
        if(k >= aFaire.length){ V.pret = true; if(avance) avance(1, 'Voix prêtes !'); demarrer(); return true; }
        var x = aFaire[k];
        return m.download(x.id, function(p){
          var f = p && p.total ? p.loaded / p.total : 0;
          if(avance) avance((k + f) / aFaire.length, 'Téléchargement : ' + x.nom + ' (' + Math.round(f * 100) + ' %)');
        }).then(function(){ k++; return suite(); });
      }
      return suite();
    });
  });
};
V.oublier = function(){
  return charger().then(function(m){ return m.flush(); }).then(function(){
    V.pret = false; demarre = false;
    V.stop(); liberer();
    Object.keys(sons).forEach(function(k){ try{ URL.revokeObjectURL(sons[k].url); }catch(e){} });
    sons = {}; octets = 0;
  });
};
V.stop = function(){
  jeton++;
  if(audio){ try{ audio.onended = audio.onerror = null; audio.pause(); }catch(e){} }
  /* les phrases demandées pour une lecture qu'on vient d'arrêter ne servent plus */
  file = file.filter(function(j){ if(j.prio < 3) return true; rejeter(j, new Error('arrêté')); return false; });
  enLecture = {};
};

/* ---------- Le lecteur : un seul, qu'on réveille pendant le toucher ----------
   (sur iPhone et iPad, un son ne peut partir « plus tard » que d'un lecteur déjà lancé par un toucher) */
var silence = '';
function lecteur(){ if(!audio){ audio = new Audio(); audio.preload = 'auto'; } return audio; }
function amorcer(){
  try{
    if(!silence){
      var n = 800, d = new DataView(new ArrayBuffer(44 + n)), i;
      d.setUint32(0, 1179011410, true); d.setUint32(4, 36 + n, true); d.setUint32(8, 1163280727, true); d.setUint32(12, 544501094, true);
      d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, 8000, true); d.setUint32(28, 8000, true);
      d.setUint16(32, 1, true); d.setUint16(34, 8, true); d.setUint32(36, 1635017060, true); d.setUint32(40, n, true);
      for(i = 0; i < n; i++) d.setUint8(44 + i, 128);
      silence = URL.createObjectURL(new Blob([d.buffer], {type:'audio/x-wav'}));
    }
    var a = lecteur(), p;
    a.onended = a.onerror = null; a.src = silence;
    p = a.play(); if(p && p.catch) p.catch(rien);
  }catch(e){}
}
function jouer(a, url, taux){
  a.src = url;
  a.defaultPlaybackRate = taux; a.playbackRate = taux;   /* la hauteur du personnage : plus vite = plus aigu */
  a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;
  return a.play();
}

/* ---------- La voix de l'appareil : elle part tout de suite ----------
   On vérifie qu'elle parle vraiment (elle dit qu'elle commence, qu'elle avance, qu'elle a fini, ou qu'elle est en train de parler).
   Si rien ne se passe du tout pendant deux secondes, la voix naturelle prend le relais pour cette lecture-là, même lente :
   mieux vaut attendre que ne rien entendre. Deux fois de suite : l'appareil est tenu pour muet jusqu'à la fin de la séance
   (appareilMuet), et c'est la voix naturelle qui lit tout. Une seule preuve qu'il parle, et on ne vérifie plus (appareilVu). */
var appareilVu = false, muets = 0, appareilMuet = !(window.speechSynthesis && window.SpeechSynthesisUtterance);
function parleEncore(){ try{ return !!(speechSynthesis.speaking || speechSynthesis.pending); }catch(e){ return false; } }
function sansVoixFr(){
  try{ var l = speechSynthesis.getVoices() || []; return l.length > 0 && !Array.prototype.some.call(l, function(x){ return /^fr/i.test(x.lang || ''); }); }catch(e){ return false; }
}
function appareil(texte, c, ph, vitesse, fini, mon){
  var u = null, t0 = Date.now(), entendu = false, rate = false, passe = false;
  try{ u = window.M && M.lireAppareil ? M.lireAppareil(texte, fini) : null; }catch(e){}
  if(appareilVu) return;
  function vu(){ entendu = true; appareilVu = true; muets = 0; }
  function relais(sur){
    if(passe || entendu || appareilVu) return;
    passe = true;
    if(sur || ++muets >= 2){ appareilMuet = true; surveillerEcran(); }
    if(mon !== jeton) return;
    try{ speechSynthesis.cancel(); }catch(e){}
    if(window.M){ M.parle = true; if(M.majBoutonStop) M.majBoutonStop(); }
    if(mode() !== 'panne') naturelle(c, ph, vitesse, fini, mon, true); else ancienne(texte, c, vitesse, fini, mon);
  }
  if(!u){ relais(true); return; }   /* l'appareil ne sait pas parler du tout */
  try{
    u.addEventListener('start', vu);
    u.addEventListener('boundary', vu);
    u.addEventListener('end', function(){ if(Date.now() - t0 >= 300) vu(); });   /* (une fin immédiate : elle n'a rien dit) */
    u.addEventListener('error', function(ev){ if(mon === jeton && !/interrupt|cancel/i.test(String((ev && ev.error) || ''))) rate = true; });
  }catch(e){}
  var essais = 0;
  (function guet(){
    setTimeout(function(){
      if(entendu || appareilVu || mon !== jeton) return;
      if(rate || !parleEncore()){ relais(false); return; }
      if(++essais < 4) guet();          /* elle se prépare encore (première phrase, voix en ligne) : on lui laisse du temps */
      else vu();                        /* elle dit qu'elle parle : on la croit */
    }, 2000);
  })();
}

/* ---------- La voix naturelle, morceau par morceau ----------
   ferme : on n'a qu'elle (la voix de l'appareil vient de rester muette), on attend le temps qu'il faut. */
function naturelle(c, ph, vitesse, fini, mon, ferme){
  var i = 0, taux = c.h * (vitesse || 1), garde = null, n;
  ferme = ferme || appareilMuet;
  enLecture = {};
  for(n = 0; n < ph.length; n++){ enLecture[cle(c.v, ph[n])] = 1; vouloir(c.v, ph[n], n ? 3 : 4).catch(rien); }
  if(!sons[cle(c.v, ph[0])]) amorcer();
  /* le moteur cale en route : la voix de l'appareil lit ce qui reste */
  function secours(){
    clearTimeout(garde);
    if(mon !== jeton) return;
    var reste = ph.slice(Math.max(0, i - 1)).join(' ');
    V.stop();   /* le jeton change : plus rien de cette lecture ne bougera */
    if(!ferme && window.M && M.lireAppareil){ try{ M.lireAppareil(reste, fini); return; }catch(e){} }
    if(fini) fini();
  }
  (function suite(){
    clearTimeout(garde);
    if(mon !== jeton) return;
    if(i >= ph.length){ enLecture = {}; if(fini) fini(); return; }
    var p = ph[i++];
    if(!sons[cle(c.v, p)] && !ferme) garde = setTimeout(secours, 4000);
    vouloir(c.v, p, 4).then(function(e){
      clearTimeout(garde);
      if(mon !== jeton) return;
      var a = lecteur(), pr;
      a.onended = suite; a.onerror = suite;
      try{ pr = jouer(a, e.url, taux); }catch(err){ secours(); return; }
      if(pr && pr.catch) pr.catch(function(err){ if(mon === jeton && !(err && err.name === 'AbortError')) secours(); });
    }, function(){ secours(); });
  })();
}
/* Le tout dernier recours (ni moteur, ni voix d'appareil) : la bibliothèque d'avant, lente, plutôt que le silence */
function ancienne(texte, c, vitesse, fini, mon){
  charger().then(function(m){ return m.predict({text:texte, voiceId:c.v}); }).then(function(wav){
    if(mon !== jeton) return;
    var a = lecteur(), url = URL.createObjectURL(wav), pr;
    a.onended = a.onerror = function(){ try{ URL.revokeObjectURL(url); }catch(e){} if(fini) fini(); };
    pr = jouer(a, url, c.h * (vitesse || 1));
    if(pr && pr.catch) pr.catch(function(){ if(mon === jeton && fini) fini(); });
  }).catch(function(e){ V.erreur = e.message; if(mon === jeton && fini) fini(); });
}

/* Lit un texte avec la voix du personnage. Renvoie false si les voix naturelles ne sont pas téléchargées
   (le jeu lit alors lui-même avec la voix de l'appareil : M.lire). Sinon, c'est décidé ici, et ça part tout de suite :
   la voix naturelle si sa première phrase est prête (ou le sera dans l'instant), sinon la voix de l'appareil. */
V.lire = function(texte, qui, vitesse, fini){
  if(!V.pret || !texte) return false;
  var c = CAST[qui] || CAST.narrateur, ph = decouper(texte), md = mode();
  /* l'appareil a des voix, mais aucune en français : la sienne lirait n'importe comment, autant dire qu'il est muet */
  if(!appareilMuet && sansVoixFr()){ appareilMuet = true; surveillerEcran(); }
  V.stop();
  var mon = jeton, moteurOk = md === 'rapide' || (appareilMuet && md !== 'panne');
  if(sons[cle(c.v, ph[0])] || (moteurOk && (appareilMuet || estimer(c.v, ph[0]) <= SEUIL))) naturelle(c, ph, vitesse, fini, mon);
  else if(appareilMuet) ancienne(texte, c, vitesse, fini, mon);
  else {
    appareil(texte, c, ph, vitesse, fini, mon);
    /* la voix de ce personnage n'était pas encore chargée (la voix d'homme, la première fois) : elle le sera pour la prochaine lecture */
    if(md === 'rapide' && !voixW[c.v]) chargerVoix(c.v).catch(rien);
  }
  return true;
};

/* ---------- Préparer d'avance ce qui est à l'écran (appareil rapide seulement) ----------
   La première phrase de chaque bouton 🔊 visible ; les textes qui viennent d'apparaître passent devant.
   Rien pendant un mini-jeu d'action (plein écran verrouillé), ni quand la page n'est pas affichée. */
var obs = null, scanT = null, dejaVus = {}, rattrapages = 0;
function miniJeu(){ var p = document.getElementById('mj-plein'); return !!(p && !p.hidden && /(^|\s)mj-fixe(\s|$)/.test(p.className)); }
function demanderScan(delai){ if(!scanT) scanT = setTimeout(scan, delai || 400); }
function surveillerEcran(){
  if(obs || !window.MutationObserver || !document.body) return;
  obs = new MutationObserver(function(){ rattrapages = 0; demanderScan(200); });
  obs.observe(document.body, {childList:true, subtree:true});
  document.addEventListener('scroll', function(){ demanderScan(700); }, {capture:true, passive:true});
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) demanderScan(400); });
  demanderScan(200);
}
function scan(){
  scanT = null;
  var md = mode();
  if(!(md === 'rapide' || (appareilMuet && md !== 'panne' && md !== 'absent')) || document.hidden || miniJeu() || !window.M) return;
  var l = document.querySelectorAll('.b-lire[data-act="lire"], [data-lire]'), lect = (M.UI && M.UI.lectures) || [];
  /* plus l'appareil est rapide, plus on prépare de textes : 8 au mieux, 2 pour un appareil tout juste « rapide » */
  var haut = window.innerHeight, large = window.innerWidth, max = Math.max(1, Math.min(8, Math.round(0.8 / (vif.r || mesure.r || 1))));
  var vus = {}, neufs = [], vieux = [], caches = 0, i, b, x, qui, r, t, c, p, k;
  for(i = 0; i < l.length && neufs.length + vieux.length < 24; i++){
    b = l[i]; x = null; qui = null;
    if(b.hasAttribute('data-i')){ x = lect[+b.getAttribute('data-i')]; if(x && typeof x === 'object'){ qui = x.qui; x = x.t; } }
    else { x = b.getAttribute('data-lire'); if(!x || x.length < 12 || x.indexOf(' ') < 0) x = null; }
    if(!x) continue;
    r = b.getBoundingClientRect();
    if(!r.width || r.bottom < 0 || r.top > haut || r.right < 0 || r.left > large){ caches++; continue; }
    t = M.nettoyer ? M.nettoyer(x) : String(x);
    if(!t) continue;
    c = CAST[qui] || CAST.narrateur; p = decouper(t)[0]; k = cle(c.v, p);
    if(vus[k]) continue;
    vus[k] = 1;
    (dejaVus[k] ? vieux : neufs).push({v:c.v, p:p, k:k});
  }
  dejaVus = vus;
  var choisis = {};
  neufs.concat(vieux).slice(0, max).forEach(function(o, n){
    choisis[o.k] = 1;
    if(!sons[o.k]) vouloir(o.v, o.p, n < neufs.length ? 1 : 0).catch(rien);
  });
  /* ce qui était demandé pour un écran qu'on a quitté ne sert plus */
  file = file.filter(function(j){ if(j.prio > 1 || choisis[j.k]) return true; rejeter(j, new Error('écran quitté')); return false; });
  /* un bouton pas encore visible (une fenêtre qui arrive en glissant) : on repasse voir, trois fois au plus */
  if(caches && rattrapages < 3){ rattrapages++; demanderScan(1500); }
}
V.preparer = function(){ demanderScan(50); };
V.cast = CAST;
V.SOURCES = SOURCES;
/* « Jouer sans internet » (heros.js) : fait fabriquer une phrase au moteur, sans rien jouer, pour qu'il charge tous ses fichiers
   (moteur de calcul, prononciation), puis en donne la liste (V.listeFichiers) : le travailleur charge ses fichiers de son côté,
   la page ne les voit pas passer. Les modèles, eux, sont déjà dans l'appareil. */
V.listeFichiers = [];
V.prechauffer = function(){
  if(!V.pret) return Promise.resolve(false);
  /* un appareil qui lit avec sa propre voix n'a pas besoin du moteur : rien à garder */
  if(mode() !== 'rapide' && !(appareilMuet && mode() !== 'panne')) return Promise.resolve(false);
  return chargerVoix(F).then(function(){ return demander({t:'dire', id:F, texte:'Brumeval.'}); }).then(function(){ return demander({t:'fichiers'}); }).then(function(m){
    var vu = {}, base = m.base || wBase;
    V.listeFichiers = [base + 'ort.wasm.min.js', PHON + '.js', PHON + '.wasm', PHON + '.data'].concat(m.l || []).filter(function(u){
      if(vu[u] || !/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\//.test(u)) return false;
      vu[u] = 1; return true;
    });
    return true;
  }).catch(function(e){ V.erreur = e.message; return false; });
};

/* ---------- La mise en route ----------
   Appareil pas encore mesuré : on charge une voix, on fabrique trois phrases (sans les jouer) et on garde la meilleure mesure.
   Rapide : le moteur reste prêt et l'écran est préparé d'avance. Lent : on rend la mémoire, la voix de l'appareil lira. */
var demarre = false;
function etalonner(){
  if(!V.pret || etalon || mode() !== 'inconnu') return;
  if(document.hidden || miniJeu()){ setTimeout(etalonner, 5000); return; }
  etalon = [];
  var i = 0;
  (function suite(e){
    /* la première phrase (la mise en route) a déjà pris plus de trois fois sa durée : inutile d'aller plus loin, l'appareil est lent */
    if(i === 1 && e && e.d > 0 && e.ms > e.d * 3000 && !document.hidden){ etalon.push({r:e.ms / (e.d * 1000), c:e.ms / ETALON[0].length}); return true; }
    return i < ETALON.length ? vouloir(F, ETALON[i++], 2).then(suite) : true;
  })().then(function(){
    var l = etalon || [];
    etalon = null;
    if(!l.length) return;   /* la page a été mise de côté pendant la mesure : on recommencera au prochain lancement */
    var r = Math.min.apply(null, l.map(function(x){ return x.r; })), c = Math.min.apply(null, l.map(function(x){ return x.c; }));
    mesure = {r:r, c:c, n:l.length, d:Date.now(), p:0, ok:r <= RAPIDE};
    vif = {r:r, c:c};
    ecrireMesure();
  }, function(e){ etalon = null; V.erreur = (e && e.message) || 'mesure'; }).then(function(){
    if(mode() === 'rapide') chauffer(); else if(appareilMuet) surveillerEcran(); else liberer();
    try{ if(window.M && M.UI && M.UI.ecran === 'reglages' && !M.UI.modal) M.render(); }catch(e){}
  });
}
/* Appareil rapide : les deux voix restent prêtes (celle du conteur d'abord, celle des hommes un peu après) et l'écran est préparé d'avance */
function chauffer(){
  if(!V.pret || mode() !== 'rapide') return;
  chargerVoix(F).then(function(){
    setTimeout(function(){ if(V.pret && mode() === 'rapide' && !voixW[H]) chargerVoix(H).catch(rien); }, 2500);
  }, rien);
  surveillerEcran();
}
function demarrer(){
  if(!V.pret || demarre) return;
  demarre = true;
  var md = mode();
  /* un appareil classé lent est remesuré de temps en temps (une mesure faite un jour où il était très occupé) */
  if(md === 'lent' && Date.now() - (mesure.d || 0) > 14 * 864e5){ mesure.n = 0; md = 'inconnu'; }
  if(md === 'inconnu'){
    /* 1 Go de mémoire ou moins : inutile d'essayer */
    if(navigator.deviceMemory && navigator.deviceMemory <= 1){ mesure = {r:9, c:600, n:1, d:Date.now(), p:0, ok:false}; vif = {r:9, c:600}; ecrireMesure(); return; }
    setTimeout(etalonner, 4000);
  } else if(md === 'rapide'){
    setTimeout(chauffer, 2500);
  }
}
V.demarrer = demarrer;
/* Le bouton « 🔁 Mesurer encore » des Réglages (appareil classé lent ou en panne) : on oublie la mesure et on la refait tout de suite */
V.remesurer = function(){
  if(!V.pret || etalon) return;
  wMort = false; echecs = 0;
  mesure = {r:0, c:0, n:0, d:0, p:0, ok:false}; vif = {r:0, c:0};
  ecrireMesure();
  etalonner();
};
/* Pour les essais et pour le dépannage : l'état du moteur en une ligne */
V.diag = function(){
  return {mode:mode(), vitesse:V.vitesse(), mesure:mesure, vif:vif, voix:Object.keys(voixPrete), chargements:chargements, file:file.length, enCours:!!enCours, sons:Object.keys(sons).length,
    octets:octets, muet:appareilMuet, muets:muets, appareilVu:appareilVu, mort:wMort, erreur:V.erreur, base:wBase};
};
if(V.possible) setTimeout(function(){ V.verifier().then(function(){ demarrer(); if(window.M && M.render && V.pret) try{ M.render(); }catch(e){} }); }, 1500);
})();
