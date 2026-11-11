/* ==========================================================
   Brumeval — voix naturelles (Piper, dans le navigateur).
   Deux voix téléchargées une seule fois (≈ 120 Mo) puis utilisables sans internet :
   Siwis pour les femmes, Tom pour les hommes ; chaque personnage a sa hauteur.
   Validé par Romain le 2 novembre. Ne marche que sur la version installée (GitHub) :
   ailleurs (aperçu), le jeu garde la voix de l'appareil.
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

var lib = null, audio = null, cache = {}, nCache = 0, jeton = 0;
var V = window.Voix = {pret:false, possible:/^https:/.test(location.protocol) && !/claude\.ai|claudeusercontent/.test(location.hostname), etat:'', erreur:''};
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
        if(k >= aFaire.length){ V.pret = true; if(avance) avance(1, 'Voix prêtes !'); return true; }
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
V.oublier = function(){ return charger().then(function(m){ return m.flush(); }).then(function(){ V.pret = false; }); };
V.stop = function(){ jeton++; if(audio){ try{ audio.pause(); }catch(e){} audio = null; } };
/* Lit un texte avec la voix du personnage ; renvoie false si les voix naturelles ne sont pas prêtes */
V.lire = function(texte, qui, vitesse, fini){
  if(!V.pret || !lib || !texte) return false;
  var c = CAST[qui] || CAST.narrateur, cle = c.v + '|' + texte;
  V.stop();
  var mon = jeton;
  var pret = cache[cle] ? Promise.resolve(cache[cle]) : lib.predict({text:texte, voiceId:c.v}).then(function(wav){
    var url = URL.createObjectURL(wav);
    if(nCache > 60){ Object.keys(cache).forEach(function(k){ URL.revokeObjectURL(cache[k]); }); cache = {}; nCache = 0; }
    cache[cle] = url; nCache++; return url;
  });
  pret.then(function(url){
    if(mon !== jeton) return;
    audio = new Audio(url);
    audio.preservesPitch = false; audio.mozPreservesPitch = false; audio.webkitPreservesPitch = false;
    audio.playbackRate = c.h * (vitesse || 1);
    audio.onended = audio.onerror = function(){ if(fini) fini(); };
    audio.play().catch(function(){ if(fini) fini(); });
  }).catch(function(e){
    V.erreur = e.message;
    /* la voix naturelle n'a pas marché sur cette tablette : on lit quand même, avec la voix de l'appareil */
    if(mon === jeton && window.M && M.lireAppareil){ try{ M.lireAppareil(texte, fini); return; }catch(e2){} }
    if(fini) fini();
  });
  return true;
};
V.cast = CAST;
V.SOURCES = SOURCES;
/* « Jouer sans internet » (heros.js) : fait parler chaque voix une fois, sans rien jouer, pour que le moteur charge
   tous ses fichiers (module, ONNX, phonémiseur) : le service worker les garde au passage. Les modèles, eux, sont déjà dans l'appareil. */
V.prechauffer = function(){
  if(!V.pret) return Promise.resolve(false);
  return charger().then(function(m){
    var k = 0;
    function suite(){
      if(k >= MODELES.length) return true;
      var x = MODELES[k++];
      return Promise.resolve(m.predict({text:'Brumeval.', voiceId:x.id})).catch(function(e){ V.erreur = e.message; }).then(suite);
    }
    return suite();
  }).catch(function(e){ V.erreur = e.message; return false; });
};
if(V.possible) setTimeout(function(){ V.verifier().then(function(){ if(window.M && M.render && V.pret) try{ M.render(); }catch(e){} }); }, 1500);
})();
