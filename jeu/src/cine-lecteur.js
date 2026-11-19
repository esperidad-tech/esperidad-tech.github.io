/* cine-lecteur.js — LE LECTEUR DES CINÉMATIQUES (Bible §13.45), le même dans le donjon (construire.py) et dans le jeu (build.py).
   Romain, 15 novembre : « des cinématiques de film », en 21:9 avec les bandes noires. Ce sont de vrais petits films, fabriqués
   d'avance image par image (jeu/cine/ : filmer.py) : la vidéo est légère. Mais sur Chrome, la page du dessous pouvait empêcher
   l'écran de se rafraîchir (17 novembre) : pendant un film, elle est cachée et ses animations en pause (cacherDessous).
   - La vidéo est MUETTE (elle part toute seule partout, même sur iPhone). LE SON (Romain, 15 novembre, 16 h 57 : une musique) :
     la BANDE-SON du film (o.piste : sortie/<film>.mp3, jeu/cine/bande-son.py — les bruitages de l'Atelier des sons et la musique
     du film, mélangés d'avance) est jouée avec la vidéo sur le contexte audio du jeu (o.audio), déjà débloqué par un toucher ;
     elle s'arrête et repart avec elle. Si elle n'arrive pas : les bruitages seuls, joués à l'instant dit (o.infos.sons, o.son).
     Le volume des réglages compte (o.volume).
   - Les sous-titres sont dans la bande noire du bas (ou sur l'image, en bas, si l'écran est trop allongé), en gros, et ils
     s'écrivent lettre après lettre (Romain, 16 h 57 : « plus gros », « qu'il s'affiche petit à petit ») ; chacun a son 🔊 :
     le toucher arrête le film le temps de la lecture (jamais de lecture toute seule).
   - « Passer ➜ » en haut à droite.
   - Si le film n'arrive pas (pas d'internet, un vieux navigateur), CineLecteur.jouer répond 'echec' : on joue l'ancienne scène.

   CineLecteur.precharger(url) -> Promise (le film téléchargé en entier, gardé en mémoire)
   CineLecteur.prechargerPiste(url) -> Promise (la bande-son téléchargée, gardée en mémoire)
   CineLecteur.jouer({url, piste, audio:function() -> AudioContext, volume:function() -> 0..1,
                      infos:{duree, sons:[[t, id]], sousTitres:[[t0, t1, texte, qui]]}, son:function(id), lire:function(texte, qui),
                      parle:function() -> bool, taire:function(), attente:ms, passer:true,
                      depart:secondes (le film part de cet instant, son début est sauté)}) -> Promise('fini' | 'passe' | 'echec') */
(function(){
'use strict';
var CL = window.CineLecteur = {};
var CACHE = {}, PISTES = {};
var CSS = '.cine-ecran{position:fixed;inset:0;z-index:99990;background:#000;opacity:0;transition:opacity .35s;touch-action:none;-webkit-user-select:none;user-select:none}' +
  '.cine-ecran.on{opacity:1}.cine-cadre{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#000;overflow:hidden}' +
  '.cine-cadre video{display:block;width:100%;height:100%;object-fit:cover;background:#000}' +
  '.cine-st{position:absolute;left:50%;transform:translateX(-50%);width:min(94vw,1100px);text-align:center;color:#f4ecd8;font:600 clamp(20px,3.4vw,36px)/1.3 Georgia,serif;' +
  'text-shadow:0 2px 6px #000,0 0 2px #000;opacity:0;transition:opacity .25s;pointer-events:none;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}' +
  '.cine-st.on{opacity:1}.cine-st.sur{padding:28px 18px 14px;background:linear-gradient(transparent,rgba(0,0,0,.72))}' +
  '.cine-qui{display:block;width:100%;font:700 clamp(13px,1.9vw,19px)/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#e8b84a;margin-bottom:5px}' +
  '.cine-pas{color:transparent;text-shadow:none}' +
  '.cine-lire{pointer-events:auto;flex:none;border:0;border-radius:50%;width:44px;height:44px;font-size:21px;background:rgba(255,255,255,.14);color:#fff;cursor:pointer}' +
  '.cine-lire:active{transform:scale(.92)}' +
  '.cine-passer{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(0,0,0,.4);' +
  'color:#ddd;font:600 15px/1 system-ui,sans-serif;padding:10px 16px;cursor:pointer;z-index:2}' +
  '.cine-attente{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border-radius:50%;background:#e8b84a;animation:cineAtt 1s ease-in-out infinite}' +
  '@keyframes cineAtt{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}' +
  '.cine-ailleurs{position:fixed;inset:0;z-index:99980;background:#000;display:flex;align-items:center;justify-content:center;font-size:44px}' +
  '.cine-ailleurs span{animation:cineAtt 2s ease-in-out infinite}' +
  '.cine-go{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:0;border-radius:16px;background:#ffd23f;color:#111;font:800 22px/1 system-ui,sans-serif;padding:18px 28px;cursor:pointer}';
function style(){ if(document.getElementById('cine-css')) return; var s = document.createElement('style'); s.id = 'cine-css'; s.textContent = CSS; document.head.appendChild(s); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]; }); }

/* LES FILMS TÉLÉCHARGÉS (Romain, 19 novembre : « un bouton téléchargement où on pourrait télécharger toutes les cinématiques d'un coup ») :
   « 🎬 Télécharger les films » (menu ☰, heros.js) range chaque film et sa bande-son dans la boîte « brumeval-films » du navigateur
   (Cache Storage, gardée d'une version du jeu à l'autre ; le service worker ne l'efface pas et ne touche plus aux films).
   Chaque fichier y est rangé sous son adresse suivie de « ?v=<octets du film> » (CINE_INFOS) : un film refait (autre taille) n'est
   plus pris dans la boîte, il revient d'internet, et « Télécharger les films » le remplace. */
var FILMS = CL.BOITE = 'brumeval-films';
function nomFilm(url){ var m = /([^\/?#]+)\.(mp4|mp3)(?:[?#]|$)/.exec(String(url)); return m ? m[1] : null; }
CL.cle = function(url){
  var n = nomFilm(url), I = n && window.CINE_INFOS && window.CINE_INFOS[n];
  try{ var a = new URL(url, location.href); a.search = ''; a.hash = ''; return a.href + (I && I.octets ? '?v=' + I.octets : ''); }catch(e){ return url; }
};
function boite(){ try{ return window.caches && location.protocol !== 'file:' ? caches.open(FILMS) : Promise.resolve(null); }catch(e){ return Promise.resolve(null); } }
function dansLaBoite(url){
  return boite().then(function(c){ return c ? c.match(CL.cle(url)) : null; }).then(function(r){ return r && r.ok ? r : null; }, function(){ return null; });
}
/* la liste des fichiers des films (adresses relatives au jeu : base 'cine/' dans le jeu) */
CL.fichiers = function(base){
  base = base || 'cine/';
  var I = window.CINE_INFOS || {}, l = [];
  Object.keys(I).forEach(function(n){ l.push(base + n + '.mp4'); if(I[n].piste) l.push(base + n + '.mp3'); });
  return l;
};
/* combien de fichiers sont déjà dans la boîte -> Promise({n, total}) */
CL.etatFilms = function(base){
  var l = CL.fichiers(base);
  return boite().then(function(c){
    if(!c) return {n:0, total:l.length, impossible:true};
    return Promise.all(l.map(function(u){ return c.match(CL.cle(u)).then(function(r){ return !!r; }, function(){ return false; }); }))
      .then(function(ok){ return {n:ok.filter(Boolean).length, total:l.length}; });
  }, function(){ return {n:0, total:l.length, impossible:true}; });
};
/* tout télécharger (deux fichiers à la fois) ; progres({fait, total, octets}) ; -> Promise({faits, echecs}) ; les vieilles versions s'en vont */
CL.telechargerTout = function(progres, base){
  var l = CL.fichiers(base), faits = 0, echecs = [], octets = 0, i = 0;
  function dire(){ try{ if(progres) progres({fait:faits + echecs.length, total:l.length, octets:octets}); }catch(e){} }
  try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function(){}); }catch(e){}
  return boite().then(function(c){
    if(!c) throw new Error('pas de stockage');
    dire();
    function un(u){
      var k = CL.cle(u);
      return c.match(k).then(function(r){
        if(r) return r.blob().then(function(b){ octets += b.size; });
        return fetch(u, {cache:'reload'}).then(function(r){
          if(!r.ok) throw new Error('HTTP ' + r.status);
          return r.blob();
        }).then(function(b){
          octets += b.size;
          return c.put(k, new Response(b, {headers:{'Content-Type':/\.mp3$/.test(u) ? 'audio/mpeg' : 'video/mp4', 'Content-Length':String(b.size)}}));
        });
      }).then(function(){ faits++; }, function(){ echecs.push(u); }).then(dire);
    }
    function suivant(){ if(i >= l.length) return Promise.resolve(); return un(l[i++]).then(suivant); }
    return Promise.all([suivant(), suivant()]).then(function(){
      /* les fichiers d'une vieille version (un film refait) : effacés */
      var bonnes = {}; l.forEach(function(u){ bonnes[CL.cle(u)] = 1; });
      return c.keys().then(function(ks){ return Promise.all(ks.filter(function(q){ return !bonnes[q.url]; }).map(function(q){ return c.delete(q); })); }).catch(function(){});
    }).then(function(){ return {faits:faits, echecs:echecs, total:l.length, octets:octets}; });
  });
};
/* télécharger tout le film d'avance (une coupure de réseau au milieu ne le casse plus) ; s'il est dans la boîte des films : pris là, sans internet */
CL.precharger = function(url){
  if(CACHE[url]) return CACHE[url];
  CACHE[url] = new Promise(function(ok){
    if(!window.fetch || !window.URL || !URL.createObjectURL || location.protocol === 'file:'){ ok(url); return; }
    dansLaBoite(url).then(function(r){
      return r || fetch(url).then(function(r){ if(!r.ok) throw new Error(r.status); return r; });
    }).then(function(r){ return r.blob(); })
      .then(function(b){ ok(URL.createObjectURL(b)); })
      .catch(function(){ CACHE[url] = null; ok(url); });
  });
  return CACHE[url];
};
/* la bande-son : téléchargée d'avance aussi (un ArrayBuffer ; on la décode au moment de jouer, sur le contexte du jeu) */
CL.prechargerPiste = function(url){
  if(!url) return Promise.resolve(null);
  if(PISTES[url]) return PISTES[url];
  PISTES[url] = new Promise(function(ok){
    if(!window.fetch || location.protocol === 'file:'){ ok(null); return; }
    dansLaBoite(url).then(function(r){ return r || fetch(url).then(function(r){ if(!r.ok) throw new Error(r.status); return r; }); })
      .then(function(r){ return r.arrayBuffer(); })
      .then(function(b){ ok(b); })
      .catch(function(){ PISTES[url] = null; ok(null); });
  });
  return PISTES[url];
};
function decoder(ctx, ab){
  return new Promise(function(ok){
    try{ var p = ctx.decodeAudioData(ab.slice(0), function(b){ ok(b); }, function(){ ok(null); }); if(p && p.catch) p.catch(function(){ ok(null); }); }
    catch(e){ ok(null); }
  });
}
/* la vitesse d'écriture d'un sous-titre (lettres par seconde) : la phrase est entière à mi-temps au plus tard
   (la même règle que les copies « à regarder » de jeu/cine/bande-son.py) */
function vitesse(texte, t0, t1){ return Math.max(28, texte.length / Math.max(.4, (t1 - t0) * .5)); }
/* LE SON DANS LE JEU (le donjon a le sien : DJ.bruit) : le moteur de l'Atelier des sons et les bruitages des cinématiques
   (build.py : SON_DONJON et essai/sons/cine.js), version A, sur un contexte audio à lui. Rien si le son est coupé (Réglages). */
var ctxJ = null, engJ = null;
CL.sonJeu = function(id){
  try{
    if(window.M && M.S && M.S.options && M.S.options.son === false) return;
    if(!window.Moteur || !window.BRUITAGES) return;
    var fn = window.BRUITAGES[id + 'A']; if(typeof fn !== 'function') return;
    if(!ctxJ){ var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; ctxJ = new AC(); engJ = window.Moteur(ctxJ, {}); }
    if(ctxJ.state === 'suspended') ctxJ.resume();
    var t = ctxJ.currentTime + .02, P = engJ.prise(t, (window.NIVEAUX || {})[id + 'A'] || 1), r = fn(engJ, P) || {duree:1};
    setTimeout(function(){ try{ P.lacher(); }catch(e){} }, ((r.duree || 1) + 5) * 1000);
  }catch(e){ if(window.console) console.warn('son de cinématique', id, e); }
};
/* LA SCÈNE DU DESSOUS SE TAIT PENDANT LE FILM (Romain, 17 novembre, sur Chrome : le film du puits « rame à mort » ; le film de la fin du
   donjon est resté figé sur sa première image alors qu'il se jouait (le jeu a continué, l'écran ne s'est pas rafraîchi). Le fichier
   est léger et il est déjà en mémoire : c'est la page du dessous (brume, flaques, personnages, filtres) qui empêchait Chrome de
   redessiner). Tant que le film passe : tout ce qui est posé dans <body> à côté de l'écran du film est caché (visibility:hidden : la
   mise en page et les défilements ne bougent pas, rien n'est dessiné), et les animations en cours (CSS et Web Animations) sont
   mises en pause. Ça revient comme avant à la fin du film (ou s'il n'arrive pas). Rend la fonction qui remet tout. */
function cacherDessous(ecran){
  var caches = [], figees = [];
  try{
    Array.prototype.forEach.call(document.body.children, function(e){
      if(e === ecran || e.contains(ecran)) return;
      caches.push([e, e.style.getPropertyValue('visibility'), e.style.getPropertyPriority('visibility')]);
      e.style.setProperty('visibility', 'hidden', 'important');        /* (important : une règle du jeu ne peut pas le rallumer) */
    });
  }catch(x){}
  try{
    if(document.getAnimations) document.getAnimations().forEach(function(a){
      var cible = a.effect && a.effect.target;
      if(a.playState !== 'running' || !cible || ecran.contains(cible)) return;
      /* (un élément qui a « transition:.3s » se cache en fondu : ce fondu-là, on le finit tout de suite, sinon il resterait visible à moitié) */
      if(a.transitionProperty === 'visibility'){ try{ a.finish(); }catch(x){} return; }
      a.pause(); figees.push(a);
    });
  }catch(x){}
  return function(){
    caches.forEach(function(c){ try{ if(c[1]) c[0].style.setProperty('visibility', c[1], c[2]); else c[0].style.removeProperty('visibility'); }catch(x){} });
    /* ⚠️ (19 novembre, trouvé dans le combat de Léo, sur Chrome) UN PIÈGE DE CE CACHE-CACHE : un élément animé (Web Animations) et
       dont l'animation vient de FINIR juste avant le film, puis qu'on anime de nouveau juste APRÈS, peut rester caché pour de bon
       avec tout ce qu'il contient (son style calculé reste « visibility:hidden » alors que plus rien ne le demande ; il revient dès
       qu'on touche à son style à lui). Vu sur #secousse (la secousse de la salle) : la salle restait noire après le film. Ni un
       recalcul forcé ici, ni une propriété héritée changée ici n'y font rien : la parade est chez celui qui anime (effets.js,
       `tremble` : il touche au style de l'élément avant de l'animer). À connaître avant d'animer un grand calque autour d'un film. */
    figees.forEach(function(a){ try{ if(a.playState === 'paused') a.play(); }catch(x){} });   /* (une animation annulée entre-temps reste annulée) */
  };
}
/* (pour les robots : une adresse forcée — ou rien, et le film « n'arrive pas ») */
CL.essai = null;
/* (pour les robots : ce que fait le dernier film — la bande-son est-elle là, joue-t-elle, combien de bruitages un par un) */
CL.dernier = {};

/* un film passe-t-il ? (voix.js : pendant un film, le moteur des voix ne prépare rien d'avance — Romain, 19 novembre : les films figés
   sur leur première image, saccadés. Le calcul des voix et le chargement de leurs modèles (60 Mo) prenaient l'appareil pendant le film.) */
CL.enCours = false;
/* LES AUTRES FENÊTRES DU MÊME APPAREIL SE TAISENT PENDANT UN FILM (Romain, 19 novembre, 8 h 25 : il essaie le jeu avec quatre fenêtres
   côte à côte sur un seul ordinateur ; un film seul rame, mais deux films à la fois dans deux fenêtres ne rament plus — parce que deux
   fenêtres sur quatre se taisent alors). Un film qui part le dit aux autres fenêtres du jeu (BroadcastChannel, même appareil seulement) :
   elles se couvrent de noir avec un 🎬 (le jeu du dessous caché, ses animations en pause, ses voix en attente), jusqu'à la fin du film
   (ou sa durée plus 5 secondes, si la fenêtre du film est fermée en route). Sur des tablettes séparées, rien ne change. */
CL.ailleurs = false;
var canal = null, moi = Math.random().toString(36).slice(2), autres = {}, voile = null, rendreVoile = null;
try{ if(window.BroadcastChannel) canal = new BroadcastChannel('brumeval-cine'); }catch(e){ canal = null; }
function dire(m){ try{ if(canal) canal.postMessage(m); }catch(e){} }
function majVoile(){
  var n = Object.keys(autres).length;
  CL.ailleurs = n > 0;
  if(n && !CL.enCours && !voile && document.body){
    style();
    voile = el('div', 'cine-ailleurs', '<span>🎬</span>');
    voile.setAttribute('aria-label', 'Un film passe sur un autre écran');
    document.body.appendChild(voile);
    rendreVoile = cacherDessous(voile);
  } else if((!n || CL.enCours) && voile){
    try{ if(rendreVoile) rendreVoile(); }catch(e){}
    voile.remove(); voile = null; rendreVoile = null;
  }
}
if(canal) canal.onmessage = function(ev){
  var m = ev.data || {};
  if(!m.id || m.id === moi) return;
  if(autres[m.id]){ clearTimeout(autres[m.id]); delete autres[m.id]; }
  if(m.t === 'film') autres[m.id] = setTimeout(function(){ delete autres[m.id]; majVoile(); }, ((+m.duree || 60) + 5) * 1000);
  majVoile();
};
window.addEventListener('pagehide', function(){ if(CL.enCours) dire({t:'fin', id:moi}); });
CL.jouer = function(o){
  style();
  CL.enCours = true;
  majVoile();                                            /* (le voile d'un autre film s'en va : c'est notre film qui passe) */
  dire({t:'film', id:moi, duree:(o.infos && o.infos.duree) || 60});
  return new Promise(function(fin){
    var fini = false, raf = 0, video = null, cues = (o.infos && o.infos.sons || []).map(function(c){ return {t:c[0], id:c[1], fait:false}; });
    var st = (o.infos && o.infos.sousTitres) || [], courant = -1, lecture = null, ecrit = -1, plein = {};
    /* la bande-son : décodée sur le contexte du jeu ; si elle est là, plus de bruitages un par un */
    var bande = null, srcB = null, gainB = null, D = CL.dernier = {bande:false, joue:false, departs:0, bruitages:0};
    function ctxA(){ try{ return o.audio ? o.audio() : null; }catch(e){ return null; } }
    function vol(){ try{ var v = o.volume ? o.volume() : 1; return v == null ? 1 : Math.max(0, Math.min(1, v)); }catch(e){ return 1; } }
    function bandeStop(fondu){
      if(!srcB) return;
      var s0 = srcB, g0 = gainB, c = ctxA(); srcB = null; gainB = null; D.joue = false;
      try{ if(fondu && c){ g0.gain.setTargetAtTime(0, c.currentTime, .1); s0.stop(c.currentTime + .5); } else s0.stop(); }catch(e){}
    }
    function bandeJoue(){
      if(!bande || fini || !video) return;
      bandeStop();
      var c = ctxA(); if(!c) return;
      if(c.state === 'suspended') try{ c.resume(); }catch(e){}
      var off = video.currentTime; if(off >= bande.duration - .05) return;
      try{
        srcB = c.createBufferSource(); srcB.buffer = bande; gainB = c.createGain(); gainB.gain.value = vol();
        /* (elle repart du milieu — après une pause, ou un film lancé avec o.depart : elle monte en 4 centièmes de seconde, sans claquer) */
        if(off > .05){ try{ gainB.gain.setValueAtTime(0, c.currentTime); gainB.gain.linearRampToValueAtTime(vol(), c.currentTime + .04); }catch(e2){} }
        srcB.connect(gainB); gainB.connect(c.destination); srcB.start(0, Math.max(0, off));
        D.joue = true; D.departs++; D.depuis = off;
      }catch(e){ srcB = null; }
    }
    var ecran = el('div', 'cine-ecran'), cadre = el('div', 'cine-cadre'), sous = el('div', 'cine-st'), att = el('div', 'cine-attente');
    ecran.appendChild(cadre); ecran.appendChild(sous); ecran.appendChild(att);
    if(o.passer !== false){ var bp = el('button', 'cine-passer', 'Passer ➜'); bp.setAttribute('data-cine', 'passer'); ecran.appendChild(bp); }
    (o.parent || document.body).appendChild(ecran);
    var rendre = cacherDessous(ecran);                   /* la scène du dessous se tait (rendue à la fin, dans terminer) */
    requestAnimationFrame(function(){ ecran.classList.add('on'); });
    function place(){
      var W = window.innerWidth, H = window.innerHeight, w = Math.min(W, H * 21 / 9), h = w * 616 / 1440, bande = (H - h) / 2;
      cadre.style.width = w + 'px'; cadre.style.height = h + 'px';
      var dedans = bande < 66;
      sous.classList.toggle('sur', dedans);
      if(dedans){ sous.style.top = ''; sous.style.bottom = (bande + 6) + 'px'; sous.style.width = Math.min(w, 980) + 'px'; }
      else { sous.style.bottom = ''; sous.style.top = (bande + h + Math.min(18, bande * .12)) + 'px'; sous.style.width = ''; }
    }
    place(); window.addEventListener('resize', place);
    function terminer(r){
      if(fini) return; fini = true;
      CL.enCours = false;
      dire({t:'fin', id:moi});
      setTimeout(majVoile, 400);                         /* (un autre film passe encore ailleurs : le voile revient, après notre fondu) */
      try{ rendre(); }catch(x){}                          /* la scène du dessous revient (le film se fond en noir par-dessus) */
      cancelAnimationFrame(raf); window.removeEventListener('resize', place);
      if(lecture) clearInterval(lecture);
      bandeStop(true);
      try{ if(video){ video.pause(); video.removeAttribute('src'); video.load(); } }catch(e){}
      if(r === 'passe' && o.taire) try{ o.taire(); }catch(e){}
      ecran.classList.remove('on');
      setTimeout(function(){ ecran.remove(); }, r === 'echec' ? 0 : 380);
      fin(r);
    }
    ecran.addEventListener('click', function(ev){
      var b = ev.target.closest && ev.target.closest('[data-cine]'); if(!b) return;
      ev.stopPropagation();
      var a = b.getAttribute('data-cine');
      if(a === 'passer') terminer('passe');
      if(a === 'lire') ecouter(+b.getAttribute('data-i'));
      if(a === 'go' && video){ b.remove(); video.play().catch(function(){}); }
    });
    /* 🔊 : le film s'arrête le temps de la lecture, puis repart */
    function ecouter(i){
      var s = st[i]; if(!s || !video || !o.lire) return;
      video.pause(); plein[i] = true; ecrit = -1; if(i === courant) ecrire(i, video.currentTime);
      try{ o.lire(s[2], s[3]); }catch(e){}
      var t0 = Date.now(), mini = 600, maxi = 1500 + s[2].length * 95;
      if(lecture) clearInterval(lecture);
      lecture = setInterval(function(){
        var d = Date.now() - t0, parle = o.parle ? o.parle() : false;
        if((d > mini && !parle) || d > maxi){ clearInterval(lecture); lecture = null; if(!fini) video.play().catch(function(){}); }
      }, 120);
    }
    function image(){
      if(fini) return;
      raf = requestAnimationFrame(image);
      if(!video || video.paused) return;
      var t = video.currentTime;
      /* les sons (seulement sans bande-son) : chacun une fois, à son instant (pas ceux qu'on a sautés) */
      if(!bande) cues.forEach(function(c){ if(!c.fait && t >= c.t){ c.fait = true; if(t - c.t < .5 && o.son) try{ D.bruitages++; o.son(c.id); }catch(e){} } });
      var k = -1;
      for(var i = 0; i < st.length; i++) if(t >= st[i][0] && t <= st[i][1]){ k = i; break; }
      if(k !== courant){
        courant = k;
        ecrit = -1;
        if(k < 0){ sous.classList.remove('on'); }
        else {
          var s = st[k];
          /* la phrase entière est posée (invisible) dès le début : elle s'écrit sans que rien ne bouge */
          sous.innerHTML = (s[3] ? '<span class="cine-qui">' + esc(s[3]) + '</span>' : '') + '<span class="cine-txt"><span class="cine-vu"></span><span class="cine-pas"></span></span>' +
            (o.lire ? '<button class="cine-lire" data-cine="lire" data-i="' + k + '" aria-label="Écouter">🔊</button>' : '');
          sous.classList.add('on');
        }
      }
      if(k >= 0) ecrire(k, t);
    }
    /* le sous-titre s'écrit lettre après lettre, au temps du film (s'il s'arrête, l'écriture aussi) */
    function ecrire(k, t){
      var s = st[k], phrase = '« ' + s[2] + ' »', n = plein[k] ? phrase.length : Math.min(phrase.length, Math.floor((t - s[0]) * vitesse(phrase, s[0], s[1])) + 1);
      if(n === ecrit) return;
      ecrit = n;
      var vu = sous.querySelector('.cine-vu'), pas = sous.querySelector('.cine-pas');
      if(vu) vu.textContent = phrase.slice(0, n);
      if(pas) pas.textContent = phrase.slice(n);
    }
    var url = CL.essai != null ? CL.essai : o.url;
    var delai = setTimeout(function(){ terminer('echec'); }, o.attente || 8000);
    /* la bande-son d'abord (2,5 secondes au plus : sinon, les bruitages un par un) */
    var c0 = o.piste && CL.essai == null ? ctxA() : null;
    var attendreBande = !c0 ? Promise.resolve(null) : Promise.race([
      CL.prechargerPiste(o.piste).then(function(ab){ return ab ? decoder(c0, ab) : null; }),
      new Promise(function(ok){ setTimeout(function(){ ok(null); }, 2500); })
    ]);
    Promise.all([url ? CL.precharger(url) : Promise.resolve(null), attendreBande]).then(function(r){
      var src = r[0]; bande = r[1] || null; D.bande = !!bande;
      if(fini) return;
      if(!src){ clearTimeout(delai); terminer('echec'); return; }
      video = document.createElement('video');
      video.muted = true; video.defaultMuted = true; video.playsInline = true;
      video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', ''); video.setAttribute('preload', 'auto');
      video.addEventListener('ended', function(){ terminer('fini'); });
      video.addEventListener('error', function(){ clearTimeout(delai); terminer('echec'); });
      video.addEventListener('playing', function(){ clearTimeout(delai); att.remove(); bandeJoue(); });
      video.addEventListener('pause', function(){ bandeStop(); });
      video.addEventListener('waiting', function(){ bandeStop(); });
      video.src = src;
      /* o.depart (secondes — 19 novembre, le donjon : Léo est déjà à genoux quand le film a12 commence) : le film part de cet
         instant ; son début est sauté (ses bruitages d'avant aussi ; la bande-son suit la vidéo : elle part du même instant) */
      var dep = +o.depart > 0 ? +o.depart : 0;
      if(dep){
        cues.forEach(function(c){ if(c.t < dep) c.fait = true; });
        try{ video.currentTime = dep; }catch(e){}
        video.addEventListener('loadedmetadata', function(){ try{ if(video.currentTime < dep - .05) video.currentTime = dep; }catch(e){} });
      }
      cadre.appendChild(video);
      var p = video.play();
      if(p && p.catch) p.catch(function(){
        /* le navigateur refuse de partir tout seul : un grand bouton jaune */
        clearTimeout(delai); att.remove();
        if(!fini && !ecran.querySelector('.cine-go')){ var g = el('button', 'cine-go', '▶ Regarder'); g.setAttribute('data-cine', 'go'); ecran.appendChild(g); }
      });
      raf = requestAnimationFrame(image);
    });
  });
};
})();
