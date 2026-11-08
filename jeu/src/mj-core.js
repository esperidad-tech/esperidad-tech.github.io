/* ==========================================================
   Brumeval v2 — cœur des mini-jeux (registre + écran commun)
   Les jeux s'enregistrent avec MJ.enregistrer(type, def).
   Le moteur appelle MJ.reglages(type, niveau, mods) puis
   MJ.lancer(el, type, params, fin, options).
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ = window.MJ || {};
MJ.TYPES = MJ.TYPES || {};
/* iPhone / iPad (Romain, 8 novembre) : glisser le doigt jusqu'en bas de l'écran déclenche « Accès facile » (tout l'écran descend),
   et une page web ne peut pas l'empêcher. Classe html.mj-ios : les mini-jeux plein écran gardent une bande vide en bas
   (mj-core.css), pour que le doigt n'arrive jamais au bord. */
try{ var ua = navigator.userAgent || '';
  if(/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) document.documentElement.classList.add('mj-ios');
}catch(e){}

/* ---------- Outils partagés ---------- */
var U = MJ.util = {
  rand: function(a, b){ return a + Math.random() * (b - a); },
  randInt: function(a, b){ return Math.floor(a + Math.random() * (b - a + 1)); },
  choix: function(arr){ return arr[Math.floor(Math.random() * arr.length)]; },
  melanger: function(arr){ var a = arr.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
  borne: function(v, a, b){ return Math.max(a, Math.min(b, v)); },
  /* Valeur interpolée entre le niveau 1 et le niveau 10 (au-delà : prolongée, bornée par min/max éventuels). */
  parNiveau: function(n, v1, v10, min, max){
    var v = v1 + (v10 - v1) * (n - 1) / 9;
    if(min !== undefined) v = Math.max(min, v);
    if(max !== undefined) v = Math.min(max, v);
    return v;
  },
  /* Boucle d'animation : fn(dt en secondes, t total). Renvoie une fonction d'arrêt. */
  boucle: function(fn){
    var actif = true, t0 = null, avant = null;
    function pas(ts){
      if(!actif) return;
      if(t0 === null){ t0 = ts; avant = ts; }
      var dt = Math.min(0.05, (ts - avant) / 1000); avant = ts;
      if(fn(dt, (ts - t0) / 1000) === false){ actif = false; return; }
      requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
    return function(){ actif = false; };
  },
  html: function(s){ var d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstChild; },
  son: function(t){ try{ if(window.Brume && Brume.son) Brume.son(t); }catch(e){} },
  /* opts facultatif, transmis à la voix du moteur : {qui:'pnjId'} pour choisir la voix du villageois */
  lire: function(t, opts){ try{ if(window.Brume && Brume.lire) Brume.lire(t, opts); }catch(e){} },
  stop: function(){ try{ if(window.Brume && Brume.stop) Brume.stop(); }catch(e){} },
  vibrer: function(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms || 30); }catch(e){} },
  apres: function(ms, fn){ return setTimeout(fn, ms); },
  fmt: function(x, dec){ return String(Math.round(x * Math.pow(10, dec || 0)) / Math.pow(10, dec || 0)).replace('.', ','); }
};

MJ.enregistrer = function(type, def){ def.type = type; MJ.TYPES[type] = def; };

/* La difficulté des mini-jeux (Romain, 4 novembre : « tout recalibrer »).
   Le moteur donne le rang de l'enquête (enquête 1 = 1, enquête 2 = 2…, plus un petit bonus pour certaines missions),
   et le joueur du héros (M.S.heros.joueur, lu par le moteur dans window.MJ_JOUEUR) :
   - enquête 1 (le tutoriel) : niveau 1 pour tout le monde, adultes compris (« Se cacher », trop facile, au niveau 3) ;
   - enfant : enquête n → niveau n (« Se cacher » : n + 2) ;
   - adulte : niveau 5 à l'enquête 2, puis ça monte jusqu'au niveau 10 à l'enquête 10 (5, 6, 6, 7, 8, 8, 9, 9, 10).
   Toujours plafonné à 10 ; l'équipement et les talents du héros (mods.facile) le baissent ensuite.
   La salle des mini-jeux passe opts.brut : le niveau choisi, tel quel. */
MJ.COURBE = {
  enfant:function(e, type){ return e + (type === 'cachette' ? 2 : 0); },
  adulte:function(e, type){ return e <= 1 ? MJ.COURBE.enfant(1, type) : Math.round(5 + (e - 2) * 5 / 8); }   /* l'enquête 1 se joue comme un enfant */
};
MJ.CALIBRAGE = {};   /* l'ancien calibrage par jeu (décalages) est remplacé par MJ.COURBE */
/* Règles propres à un jeu, appliquées après ses réglages (pas une question de difficulté) */
MJ.APRES = {
  poursuite:function(p, mods){   /* 5 obstacles sans faute suffisent pour se rapprocher (4 avec des bottes) */
    p.rattrape = (mods.vitesse || 0) > 0 ? 4 : 5;
    (p.lignes || []).forEach(function(l){ if(l.nom === 'Pour la rattraper') l.val = '2 fois ' + p.rattrape + ' obstacles sans faute'; });
  }
};
MJ.niveauPour = function(type, rang, joueur){
  var e = Math.max(1, rang || 1);
  return Math.min(10, MJ.COURBE[joueur === 'enfant' ? 'enfant' : 'adulte'](e, type));
};
/* opts.brut (salle des mini-jeux, pour recalibrer) : le niveau tel quel ; opts.joueur : 'enfant' ou 'adulte' (sinon window.MJ_JOUEUR) */
MJ.reglages = function(type, niveau, mods, opts){
  var def = MJ.TYPES[type];
  mods = Object.assign({}, mods || {});
  var brut = !!(opts && opts.brut), joueur = (opts && opts.joueur) || window.MJ_JOUEUR || 'adulte';
  var base = brut ? (niveau || 1) : MJ.niveauPour(type, niveau, joueur);
  /* opts.max : jamais plus que ce niveau (la poursuite de Tim, enquête 2 : niveau 4 au plus, Romain, 7 novembre) */
  if(opts && opts.max) base = Math.min(base, opts.max);
  var n = U.borne(base - (mods.facile || 0), 1, 12);
  var p = def && def.reglages ? def.reglages(n, mods) : {};
  if(MJ.APRES[type]) try{ MJ.APRES[type](p, mods, n); }catch(e){}
  p.niveau = niveau || 1;
  p.niveauEffectif = n;
  p.brut = brut;
  p.joueur = brut ? null : joueur;
  p.mods = mods;
  if(!p.lignes) p.lignes = [];
  return p;
};

function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

/* 🔊 à côté de chaque texte de plus de 3 mots (2-3 mots : les enfants lisent seuls).
   Jamais de lecture automatique : on lit seulement quand on appuie. */
function nbMots(s){ return String(s || '').split(/\s+/).filter(function(m){ return /[0-9A-Za-zÀ-ÿ]/.test(m); }).length; }
function boutonLire(texte, cls){
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'mj-lire-mini' + (cls ? ' ' + cls : ''); b.textContent = '🔊';
  b.setAttribute('aria-label', 'Écouter');
  b.onclick = function(ev){
    ev.stopPropagation();
    var t = typeof texte === 'function' ? texte() : texte;
    /* sans les emoji (la voix les lirait mot à mot) */
    try{ t = String(t || '').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\s+/g, ' ').trim(); }catch(e){}
    U.stop(); if(t) U.lire(t);
  };
  return b;
}
/* ajoute un 🔊 dans chaque élément (sel) dont le texte dépasse 3 mots ; lireDe(el) donne le texte à lire */
function ajouterLire(racine, sel, lireDe, vide){
  Array.prototype.forEach.call(racine.querySelectorAll(sel), function(el){
    var t = lireDe ? lireDe(el) : el.textContent;
    if(nbMots(t) > 3) el.appendChild(boutonLire(function(){ return lireDe ? lireDe(el) : t; }));
    else if(vide){ var i = document.createElement('i'); i.className = 'mj-lire-vide'; el.appendChild(i); }
  });
}
MJ.boutonLire = boutonLire; MJ.nbMots = nbMots;

/* ---------- La règle des cœurs, la même dans tous les mini-jeux (Romain, 4 novembre) ----------
   Nombre de cœurs affichés = erreurs encore permises. Plus de cœur : on n'a pas encore perdu,
   mais la prochaine erreur fait perdre (U.plusDeCoeur l'annonce, avec 🔊).
   U.coeurs(restants, total[, casse]) : le HTML de la rangée (le même dessin partout) ;
   casse = numéro du cœur qui vient de se briser (petite animation) ; total 0 : un cœur vide et « 0 » ;
   plus de 8 cœurs : un cœur et « × n ». */
var COEUR_SVG = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15 1.5 11.2 1.5 7 C1.5 3.8 4 1.5 7 1.5 C9.1 1.5 10.9 2.7 12 4.5 C13.1 2.7 14.9 1.5 17 1.5 C20 1.5 22.5 3.8 22.5 7 C22.5 11.2 19 15 12 20.5 Z"/></svg>';
U.COEUR = COEUR_SVG;
MJ.PLUS_DE_COEUR = 'Plus de cœur : attention, la prochaine erreur fait perdre !';
U.coeurs = function(restants, total, casse){
  total = Math.max(0, Math.round(total || 0));
  restants = U.borne(Math.round(restants || 0), 0, total);
  var lab = restants ? restants + ' cœur' + (restants > 1 ? 's' : '') + ' : encore ' + restants + ' erreur' + (restants > 1 ? 's' : '') + ' permise' + (restants > 1 ? 's' : '') : MJ.PLUS_DE_COEUR;
  var s = '';
  if(!total) s = '<span class="mj-coeur perdu">' + COEUR_SVG + '</span><b class="mj-coeurs-n">0</b>';
  else if(total > 8) s = '<span class="mj-coeur' + (restants ? '' : ' perdu') + (casse !== undefined ? ' casse' : '') + '">' + COEUR_SVG + '</span><b class="mj-coeurs-n">× ' + restants + '</b>';
  else for(var i = 0; i < total; i++) s += '<span class="mj-coeur' + (i < restants ? '' : ' perdu') + (i === casse ? ' casse' : '') + '">' + COEUR_SVG + '</span>';
  return '<span class="mj-coeurs' + (restants ? '' : ' mj-coeurs-vide') + '" role="img" aria-label="' + esc(lab) + '">' + s + '</span>';
};
/* Le dernier cœur vient de se briser : un bandeau bien visible dans le mini-jeu (🔊 à côté, jamais lu tout seul) */
U.plusDeCoeur = function(el){
  try{
    var hote = (el && el.closest && (el.closest('.mj-zone') || el.closest('.mj'))) || el;
    if(!hote || !hote.appendChild) return;
    var vieux = hote.querySelector('.mj-plus-coeur'); if(vieux && vieux.parentNode) vieux.parentNode.removeChild(vieux);
    var b = U.html('<div class="mj-plus-coeur" role="alert"><span class="mj-pc-ic">💔</span><b>' + esc(MJ.PLUS_DE_COEUR) + '</b></div>');
    b.appendChild(boutonLire(MJ.PLUS_DE_COEUR));
    hote.appendChild(b);
    /* juste sous la rangée des cœurs, en haut du jeu (Romain, 5 novembre, 19 h 31 : « ce message cache les obstacles ») */
    try{
      var hud = hote.querySelector('[class*="-hud"]'), rh = hud && hud.getBoundingClientRect(), ro = hote.getBoundingClientRect();
      b.style.top = Math.max(6, Math.round(rh && rh.height ? rh.bottom - ro.top + 6 : 8)) + 'px';
    }catch(e2){}
    U.vibrer([60, 50, 60]);
    setTimeout(function(){ b.classList.add('part'); setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); }, 450); }, 3200);
  }catch(e){}
};
MJ.coeurs = U.coeurs; MJ.plusDeCoeur = U.plusDeCoeur;

/* ---------- Écran commun : consigne → jeu → résultat ---------- */
/* ---------- Plein écran verrouillé (Romain, 6 novembre, 0 h 14 et 0 h 40) : ces mini-jeux tiennent dans l'écran, rien ne défile ----------
   (les autres — mensonge, mots, alphabet, grille, dépositions — peuvent défiler). Ce qui dépasse encore (l'accueil d'un jeu sur un
   téléphone couché, son résultat) se serre : un zoom CSS sur la zone qui déborde, jusqu'à 50 % ; dans le jeu lui-même, seulement
   là où l'on touche des boutons (ZOOM_JEU), pas là où l'on glisse le doigt sur un dessin (le zoom y fausserait les positions). */
MJ.PLEIN_ECRAN = {traces:1, poursuite:1, cachette:1, tir:1, bulles:1, melange:1, differences:1, double:1, insectes:1, chaudron:1, plans:1, runes:1};
var ZOOM_JEU = {bulles:1, melange:1, double:1};
function zoneDeborde(e){
  var cs = getComputedStyle(e);
  return /(auto|scroll)/.test(cs.overflowY) && e.clientHeight > 20;
}
MJ.ajusterHauteur = function(racine, type){
  var attente = 0, obs = null;
  function passe(){
    attente = 0;
    if(!racine.isConnected){ if(obs) obs.disconnect(); window.removeEventListener('resize', bientot); return; }
    racine.querySelectorAll(ZOOM_JEU[type] ? '*' : '.mj-intro, .mj-intro *, .mj-resultat, .mj-resultat *').forEach(function(e){
      if(e instanceof SVGElement) return;
      if(!zoneDeborde(e)) return;
      var z = parseFloat(e.style.zoom) || 1;
      for(var n = 0; n < 5; n++){
        var sh = e.scrollHeight, ch = e.clientHeight;
        if(sh > ch + 2 && z > .5){ z = Math.max(.5, Math.round(z * ch / sh * 0.985 * 1000) / 1000); e.style.zoom = String(z); }
        else if(z < 1 && sh < ch * .9){ z = Math.min(1, Math.round(z * ch / sh * 0.97 * 1000) / 1000); e.style.zoom = z >= .999 ? '' : String(z); }
        else break;
      }
    });
  }
  function bientot(){ if(attente) return; attente = setTimeout(passe, 120); }   /* (au plus une fois tous les 120 ms : un chrono qui change sans arrêt ne coûte presque rien) */
  try{ obs = new MutationObserver(bientot); obs.observe(racine, {childList:true, subtree:true}); }catch(e){}
  window.addEventListener('resize', bientot);
  bientot();
};
MJ.lancer = function(el, type, params, fin, options){
  var def = MJ.TYPES[type];
  options = options || {};
  params = params || MJ.reglages(type, 1, {});
  if(!def){ el.innerHTML = '<p>Mini-jeu inconnu : ' + esc(type) + '</p>'; setTimeout(function(){ fin({reussi:true, score:1}); }, 300); return {arreter:function(){}}; }
  var essais = 0, enCours = null, fini = false, arretDemoG = null, enPause = false, decompte = null;
  /* un mini-jeu oublié en pause (ne devrait pas arriver : le moteur n'en lance pas d'autre) : on ne fige pas le nouveau */
  if(window.MJT && MJT.enPause()) MJT.reprendre();
  /* au tutoriel (enquête 1, ou options.tutoriel) : « C'est parti » clignote (la salle des mini-jeux n'a pas de moteur : jamais) */
  function auTuto(){
    if(options.tutoriel) return true;
    try{ var E = window.M && M.E && M.S && M.S.e ? M.E() : null; return !!(E && E.tuto && !window.BRUMEVAL_SANS_TUTO); }catch(e){ return false; }
  }
  var chance = !!(options.deuxiemeChance || (params.mods && params.mods.deuxiemeChance));
  if(options.essaiUnique) chance = false;

  el.innerHTML = '';
  var racine = U.html('<div class="mj mj-' + type + ' mj-role-' + (def.role || 'tous') + '">' +
    '<div class="mj-tete">' +
      '<span class="mj-ic">' + (def.ic || '🎲') + '</span>' +
      '<div class="mj-titres"><b class="mj-nom">' + esc(options.titre || def.nom) + '</b>' +
      '</div>' +
      '<button class="mj-btn-lire" type="button" aria-label="Écouter la consigne">🔊</button>' +
    '</div>' +
    '<div class="mj-scene"></div>' +
  '</div>');
  el.appendChild(racine);
  /* plein écran verrouillé : la classe mj-fixe sur le mini-jeu et sur la fenêtre qui le porte (#mj-plein du jeu, #sl-plein de la salle) */
  var fixe = !!MJ.PLEIN_ECRAN[type], hote = el.closest ? el.closest('#mj-plein, #sl-plein') : null;
  racine.classList.toggle('mj-fixe', fixe); if(hote) hote.classList.toggle('mj-fixe', fixe);
  if(fixe) try{ MJ.ajusterHauteur(racine, type); }catch(e){}
  var scene = racine.querySelector('.mj-scene');
  var consigne = (typeof def.consigne === 'function') ? def.consigne(params) : (def.consigne || '');
  /* la phrase toute simple de l'écran d'accueil (mj-regles.js) ; la longue consigne reste pour la salle */
  var phrase = (MJ.PHRASES && MJ.PHRASES[type]) || def.phrase || consigne;
  if(typeof phrase === 'function') try{ phrase = phrase(params); }catch(e){ phrase = consigne; }
  racine.querySelector('.mj-btn-lire').onclick = function(){ U.stop(); U.lire(phrase); };
  /* (plus de bouton ⏹ dans l'en-tête : Romain, 5 novembre, 12 h 31 ; le ⏹ du moteur, #stop-voix, apparaît pendant la lecture) */

  /* ---------- La pause (Romain, 5 novembre, 11 h 21 : tous les mini-jeux, tous les joueurs, tout le temps) ----------
     ⏸️ dans l'en-tête : tout se fige (mj-temps.js), le mini-jeu se cache (options.cadrePause, sinon le cadre autour de el)
     et options.surPause(partie) laisse le moteur montrer la carte, les codes… partie.reprendre() le remet,
     avec « 3, 2, 1 » quand on était en train de jouer (pas sur l'accueil ni sur le résultat). */
  function cadrePause(){ return options.cadrePause || el.parentNode || el; }
  function mettreEnPause(){
    if(enPause || fini || !window.MJT) return;
    enPause = true;
    U.stop(); U.son('clic');
    try{ var a = document.activeElement; if(a && el.contains(a) && a.blur) a.blur(); }catch(e){}
    MJT.pause(el);
    racine.classList.add('mj-en-pause');
    var c = cadrePause(); if(c && c.classList) c.classList.add('mj-cache');
    try{ if(options.surPause) options.surPause(partie); }catch(e){ if(window.console) console.error(e); }
  }
  function reprendre(){
    if(!enPause || decompte) return;
    var c = cadrePause(); if(c && c.classList) c.classList.remove('mj-cache');
    racine.classList.remove('mj-en-pause');
    var enJeu = !racine.classList.contains('mj-en-intro') && !scene.querySelector('.mj-resultat');
    if(!enJeu || fini){ enPause = false; MJT.reprendre(); return; }
    /* 3, 2, 1… : le temps de remettre les doigts sur l'écran (les vraies horloges : le mini-jeu, lui, est encore figé) */
    var R = MJT.reel, n = 3;
    decompte = U.html('<div class="mj-decompte" aria-live="assertive"><b>3</b></div>');
    racine.appendChild(decompte);
    (function tic(){
      if(!decompte) return;
      if(n === 0 || fini){
        if(decompte.parentNode) decompte.parentNode.removeChild(decompte);
        decompte = null; enPause = false; MJT.reprendre(); return;
      }
      decompte.innerHTML = '<b>' + n + '</b>';
      U.son('tic'); n--;
      R.setTimeout(tic, 600);
    })();
  }
  var partie = {
    arreter:function(){
      fini = true;
      if(decompte && decompte.parentNode) decompte.parentNode.removeChild(decompte);
      decompte = null;
      if(enPause){ enPause = false; var c = cadrePause(); if(c && c.classList) c.classList.remove('mj-cache'); if(window.MJT) MJT.reprendre(); }
      if(arretDemoG){ try{ if(arretDemoG.arreter) arretDemoG.arreter(); else if(typeof arretDemoG === 'function') arretDemoG(); }catch(e){} }
      if(enCours && enCours.arreter) try{ enCours.arreter(); }catch(e){}
      U.stop();
    },
    pause:mettreEnPause,
    reprendre:reprendre,
    enPause:function(){ return enPause; },
    titre:options.titre || def.nom, ic:def.ic || '🎮', type:type
  };
  if(options.surPause && window.MJT){
    var bp = document.createElement('button');
    bp.type = 'button'; bp.className = 'mj-btn-pause'; bp.textContent = '⏸️';
    bp.setAttribute('aria-label', 'Mettre en pause');
    bp.onclick = function(ev){ ev.stopPropagation(); mettreEnPause(); };
    racine.querySelector('.mj-tete').insertBefore(bp, racine.querySelector('.mj-btn-lire'));
  }

  function intro(){
    scene.innerHTML = '';
    /* Écran d'accueil tout simple (demande de Romain, 2 nov. au soir) :
       une grande démo animée avec la main, UNE phrase courte + 🔊, « C'est parti ! ».
       Les réglages restent pour la salle (options.details), repliés. */
    racine.classList.add('mj-en-intro');
    var aidesIc = (options.aides || []).map(function(a){ return '<span title="' + esc(a.nom + (a.effet ? ' · ' + a.effet : '')) + '">' + (a.ic || '✨') + '</span>'; }).join('');
    var lignes = (params.lignes || []).map(function(l){ return '<li><span>' + esc(l.nom) + '</span><b>' + esc(l.val) + '</b></li>'; }).join('');
    var details = options.details ? '<details class="mj-details"><summary>⚙️ Détails du réglage</summary>' +
      '<p class="mj-det-niv">Difficulté ' + params.niveau + (params.niveauEffectif !== params.niveau ? ' → ' + params.niveauEffectif : '') + '</p>' +
      (lignes ? '<ul class="mj-reglages">' + lignes + '</ul>' : '') +
      '<p class="mj-consigne mj-det-consigne">' + esc(consigne) + '</p></details>' : '';
    var bloc = U.html('<div class="mj-intro mj-intro-simple">' +
      '<div class="mj-demo-cadre"><div class="mj-demo"></div></div>' +
      '<div class="mj-phrase-l"><p class="mj-phrase">' + esc(phrase) + '</p></div>' +
      (aidesIc ? '<div class="mj-aides-ic" aria-label="Ce qui t\'aide">' + aidesIc + '</div>' : '') +
      (options.essaiUnique ? '<p class="mj-unique">⚠️ Un seul essai !</p>' : '') +
      details +
      '<button class="btn grand b-aller mj-go' + (auTuto() ? ' mj-go-clignote' : '') + '" type="button">C\'est parti !</button>' +
    '</div>');
    scene.appendChild(bloc);
    var pl = bloc.querySelector('.mj-phrase-l');
    pl.insertBefore(boutonLire(phrase, 'mj-lire-consigne'), pl.firstChild);
    var cadre = bloc.querySelector('.mj-demo-cadre'), demo = bloc.querySelector('.mj-demo');
    /* la démo est dessinée à sa taille naturelle (W0 × H0), puis agrandie pour remplir la place libre */
    var DM = MJ.DEMOS && MJ.DEMOS[type];
    /* exception voulue par Romain (« Repérer le mensonge ») : un catalogue sous la phrase ; là, l'accueil peut défiler */
    try{ var plus = DM && DM.extra ? DM.extra(params) : null; if(plus){ plus.classList.add('mj-defile'); bloc.insertBefore(plus, bloc.querySelector('.mj-details') || bloc.querySelector('.mj-go')); } }catch(e){ if(window.console) console.warn('accueil', type, e); }
    var W0 = (DM && DM.w) || 340, H0 = (DM && DM.h) || 190;
    demo.style.width = W0 + 'px'; demo.style.height = H0 + 'px';
    var arretDemo = null;
    try{ arretDemo = DM && DM.f ? DM.f(demo, params) : (def.demo ? def.demo(demo, params) : null); arretDemoG = arretDemo; }catch(e){ if(window.console) console.warn('démo', type, e); }
    if(!demo.firstChild) cadre.hidden = true;
    /* moins de mouvement demandé : la démo d'un jeu s'arrête sur une image (les démos de mj-regles.js le font seules) */
    try{ if(!(DM && DM.f) && arretDemo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(function(){ try{ if(arretDemo.arreter) arretDemo.arreter(); else if(typeof arretDemo === 'function') arretDemo(); }catch(e){} }, 1600); }catch(e){}
    /* ce qu'une démo ajoute à côté d'elle (ex. le choix « à l'oral / à lire ») sort du cadre */
    while(demo.nextSibling) bloc.insertBefore(cadre.lastChild, cadre.nextSibling);
    /* la démo prend toute la place que laissent la phrase et le bouton (sans faire défiler) */
    function ajuste(){
      if(!bloc.isConnected){ if(ro) ro.disconnect(); return; }
      var cs = getComputedStyle(bloc), libre = bloc.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), n = 0;
      Array.prototype.forEach.call(bloc.children, function(c){ if(c === cadre || c.hidden || c.classList.contains('mj-defile') || getComputedStyle(c).display === 'none') return; libre -= c.offsetHeight; n++; });
      libre -= (parseFloat(cs.rowGap) || 0) * n + ((DM && DM.reserve) || 0);   /* reserve : on laisse voir le début du catalogue */
      var cw = cadre.clientWidth; if(!cw || !bloc.clientHeight) return;
      var k = Math.max(.4, Math.min(cw / W0, Math.max(libre, 150) / H0, 3.2));
      cadre.style.height = Math.round(H0 * k) + 'px';
      demo.style.transform = 'translate(' + Math.round((cw - W0 * k) / 2) + 'px,0) scale(' + k.toFixed(3) + ')';
    }
    var ro = window.ResizeObserver ? new ResizeObserver(ajuste) : null;
    if(ro) ro.observe(bloc); else window.addEventListener('resize', ajuste);
    var det = bloc.querySelector('.mj-details'); if(det) det.addEventListener('toggle', ajuste);
    ajuste(); requestAnimationFrame(ajuste);
    bloc.querySelector('.mj-go').onclick = function(){
      if(arretDemo && arretDemo.arreter) arretDemo.arreter(); else if(typeof arretDemo === 'function') arretDemo();
      if(ro) ro.disconnect();
      racine.classList.remove('mj-en-intro');
      U.stop(); U.son('clic'); jouer();
      if(auTuto() || options.decompte) decompteDepart();
    };
  }

  /* Au tutoriel (enquête 1), un compte à rebours avant de jouer (Romain, 5 novembre, 16 h 32 : « on prend bien le temps de comprendre ») :
     le jeu est déjà dessiné, mais figé (mj-temps.js) ; « 3, 2, 1 », lentement, puis il démarre. Aussi au « 🔁 Recommencer ». */
  function decompteDepart(){
    if(!window.MJT || fini || decompte) return;
    MJT.pause(el);
    var R = MJT.reel, n = 3;
    decompte = U.html('<div class="mj-decompte mj-decompte-depart" aria-live="assertive"><b>3</b></div>');
    racine.appendChild(decompte);
    (function tic(){
      if(!decompte) return;
      if(n === 0 || fini){
        if(decompte.parentNode) decompte.parentNode.removeChild(decompte);
        decompte = null; if(!enPause) MJT.reprendre(); return;
      }
      decompte.innerHTML = '<b>' + n + '</b>';
      U.son('tic'); n--;
      R.setTimeout(tic, 850);
    })();
  }
  function jouer(){
    essais++;
    scene.innerHTML = '';
    var zone = document.createElement('div');
    zone.className = 'mj-zone';
    scene.appendChild(zone);
    var dejaFini = false;
    enCours = def.jouer(zone, params, function(res){
      if(dejaFini) return; dejaFini = true;
      res = res || {};
      if(enCours && enCours.arreter) try{ enCours.arreter(); }catch(e){}
      resultat(res);
    }) || null;
  }

  function resultat(res){
    var ok = !!res.reussi;
    U.son(ok ? 'victoire' : 'echec');
    /* options.reessaisInfinis (le chaudron de l'enquête 1, le tutoriel) : on peut recommencer autant qu'on veut ;
       options.surEchec(res) est appelé à chaque essai raté (l'atelier y rend les ingrédients versés) */
    if(!ok && options.surEchec) try{ options.surEchec(res); }catch(e){ if(window.console) console.error(e); }
    var infini = !ok && !!options.reessaisInfinis;
    var peutRejouer = !ok && (infini || (chance && essais < 2));
    var msg = ok ? (res.message || U.choix(['Bravo !','Magnifique !','Réussi !','Superbe !'])) : (res.message || U.choix(['Raté…','Presque !','Pas cette fois…']));
    var voile = U.html('<div class="mj-resultat ' + (ok ? 'ok' : 'ko') + '">' +
      '<div class="mj-res-ic">' + (ok ? '🌟' : '💨') + '</div>' +
      '<h2>' + esc(msg) + '</h2>' +
      (res.detail ? '<p class="doux">' + esc(res.detail) + '</p>' : '') +
      (peutRejouer ? '<button class="btn grand b-aller mj-rejouer" type="button">' + (infini ? '🔁 Recommencer' : '✨ Deuxième chance') + '</button>' : '') +
      '<button class="btn ' + (peutRejouer ? 'second' : 'grand b-aller') + ' mj-continuer" type="button">Continuer</button>' +
    '</div>');
    if(ok){
      for(var i = 0; i < 14; i++){
        var e = document.createElement('i'); e.className = 'mj-etincelle';
        e.style.setProperty('--a', (i * 360 / 14) + 'deg');
        e.style.setProperty('--d', (60 + Math.random() * 70) + 'px');
        e.style.animationDelay = (Math.random() * .15) + 's';
        voile.appendChild(e);
      }
    }
    scene.appendChild(voile);
    ajouterLire(voile, 'h2'); ajouterLire(voile, 'p.doux');
    var r = voile.querySelector('.mj-rejouer');
    if(r) r.onclick = function(){ U.stop(); jouer(); if(auTuto() || options.decompte) decompteDepart(); };
    voile.querySelector('.mj-continuer').onclick = function(){
      if(fini) return; fini = true; U.stop();
      /* tout ce que le jeu renvoie est transmis (ragots entendus, relecture…) */
      fin(Object.assign({}, res, {reussi: ok, score: res.score === undefined ? (ok ? 1 : 0) : res.score, erreurs: res.erreurs || 0, essais: essais, detail: res.detail || ''}));
    };
  }

  if(options.sansIntro) jouer(); else intro();
  return partie;
};
})();
