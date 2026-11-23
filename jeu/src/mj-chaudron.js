/* ==========================================================
   Brumeval v2 — mini-jeu « Le chaudron » (Alchimiste)
   Version simplifiée (Romain, 4 novembre, 11 h 26) :
   - Le FEU fait monter la température : chaque bûche ajoutée fait monter la barre, et plus il y a
     de bûches, plus elle monte vite (même vitesse à tous les niveaux). Le bois se consume vite
     (à tous les niveaux) : quand il ne reste qu'une bûche, l'icône « remettre du bois » brille.
     6 bûches au plus (au-delà, rien ne se passe).
   - TOUILLER (dans un sens ou dans l'autre) fait redescendre la barre, avec de l'inertie :
     elle continue de descendre un peu quand on s'arrête. Ce qui change avec le niveau :
     l'inertie, la largeur des zones, les ingrédients qui passent, les cœurs.
   - Trop chaud (en haut de la jauge) : ça EXPLOSE, perdu. Plus assez de bois (en bas) :
     ça GÈLE, perdu. Près du haut, le chaudron bout à gros bouillons et tremble.
   - Les INGRÉDIENTS : la frise montre seulement le code couleur de chaque ingrédient, dans
     l'ordre de la recette ; on verse celui dont le carré est dans la zone 🍲 (niveaux 1-2 :
     il y attend ; ensuite il la traverse et compte comme oublié s'il en sort). Les caisses :
     seulement les ingrédients du laboratoire (params.stock). Mauvais ingrédient, trop tôt ou
     oublié : l'écran tremble, une flèche le dit, −1 cœur (3 au niveau 1 ; règle des cœurs :
     cœurs = erreurs permises, sans cœur la prochaine erreur fait perdre).
   - À la fin : garder la potion dans sa zone de couleur jusqu'à ce que la fiole se remplisse.
   - Durée : environ deux fois moins longue qu'avant (≈ 50 s au lieu de 106 à 137 s).
   Préfixe CSS : .mjc-   Dépend de mj-core.js et donnees.js.
   params (en plus des réglages) : potion (id), stock {ingr:n} ou function(){ return {ingr:n}; } (facultatif : les caisses
   montrent seulement les ingrédients du stock ; sans stock, la salle montre la recette et 3 autres), décompté et rendu dans reste),
   connue (false = recette secrète : la frise montre des ❓),
   onVerse(ingr) (facultatif : appelé seulement pour le bon ingrédient, au moment où on le verse ;
   l'atelier s'en sert pour son stock et pour les oreilles de Mimi).
   Résultat : {reussi, message, detail, score, erreurs, raison, reste:{ingr:n}}
   (raison : ok, boum = la potion a débordé, gel, mauvais, tot, oubli, lent)
   ========================================================== */
(function(){
'use strict';
var MJ = window.MJ;
if(!MJ || !MJ.util){ console.error('mj-chaudron : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util, K = '#24182e', NS = 'http://www.w3.org/2000/svg';
function DD(){ return window.DONNEES || {}; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]; }); }
var uid = 0;

/* ---------- Géométrie de la scène (viewBox 0 0 400 380) ---------- */
var CX = 200, CY = 170, RL = 118, SINA = 0.36, COSA = Math.sqrt(1 - SINA * SINA), DP = 520;
var RIM = {cx:200, cy:157, rxo:144, ryo:53, rxi:128, ryi:46};
var LOUCHE = {r:64, L:168, a:0.55, b:0.83, haut:14};
var KSTIR = 0.95;                       /* (démo de secours) chaleur par radian/s de louche */
var MAX_BUCHES = 6;                     /* au-delà, on ne peut plus en ajouter */
/* La température (échelle 0 = gel … 100 = explosion), la même à tous les niveaux :
   chaque bûche chauffe de FEU_K unités/s, la potion perd FROID unités/s (neutre à 2 bûches) ;
   une bûche ajoutée donne un petit coup de chaud (FEU_COUP) ; touiller un tour par seconde refroidit de TOUILLE unités/s. */
var FEU_K = 1.6, FROID = 3.2, FEU_COUP = 3, TOUILLE = 9, BRULE = 6.5;
var CHOCS = {eau:-5, miel:3, baies:4, champignon:-3, trefle:2, brume:-7, lavande:-3, pensee:3, menthe:-5, ortie:6, racine:3, lune:-6};
/* (les six bûches du feu, leur place et leur dessin : MJ.chaudronDessin.BUCHES, mj-chaudron-dessin.js) */
/* La palette du chaudron (Romain, 4 novembre) : une couleur unie bien à part par ingrédient (pas de motif), pour les carrés
   allumés de la frise et les pastilles de la carte de la recette. Les boîtes, elles, n'ont pas de couleur : c'est la recette
   qui fait le lien couleur → ingrédient. D.INGR garde ses couleurs à lui (le mélange et les teintures de l'enquête 3). */
/* Romain, 13 h 26 : la couleur de chaque ingrédient = la couleur majoritaire de son icône (mesurée sur les émojis
   Noto, ceux des tablettes Android) ; tant pis si plusieurs verts se ressemblent. */
var CODES = {
  eau:{c:'#4ec1f5'}, miel:{c:'#e07f14'}, baies:{c:'#5165cb'}, champignon:{c:'#ff521a'},
  trefle:{c:'#8bc02b'}, brume:{c:'#e3e8ea'}, lavande:{c:'#9a6cf0'}, pensee:{c:'#febb02'},
  menthe:{c:'#5b9821'}, ortie:{c:'#99c23b'}, racine:{c:'#ad7156'}, lune:{c:'#fdd835'}
};
function codeDe(k){ return CODES[k] || {c:(((window.DONNEES || {}).INGR || {})[k] || {}).c || '#888'}; }
/* (23 novembre) LE DÉCOR : plus de chalet. C'est la cheminée de l'atelier vue de près, dessinée par mj-chaudron-dessin.js
   (MJ.chaudronDessin) à la taille de l'écran : voir disposer(), dans jouer. */
function Dessin(){ return MJ.chaudronDessin || {}; }
var COUL = {violet:'#8b52e0', bleu:'#3f86f0', vert:'#3fcf6a', jaune:'#ffd23f', rouge:'#f04a35', bouillant:'#ff2410'};
var ORDRE = ['violet', 'bleu', 'vert', 'jaune', 'rouge', 'bouillant'];
var COEUR = '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 C5 15 1.5 11.2 1.5 7 C1.5 3.8 4 1.5 7 1.5 C9.1 1.5 10.9 2.7 12 4.5 C13.1 2.7 14.9 1.5 17 1.5 C20 1.5 22.5 3.8 22.5 7 C22.5 11.2 19 15 12 20.5 Z"/></svg>';

function proj(X, Y, Z){
  var depth = Z * COSA + Y * SINA, s = DP / (DP - depth);
  return {x:CX + X * s, y:CY + (-Y * COSA + Z * SINA) * s, s:s};
}
function wrap(a){ while(a > Math.PI) a -= 2 * Math.PI; while(a < -Math.PI) a += 2 * Math.PI; return a; }
function f1(x){ return (Math.round(x * 10) / 10).toString(); }

/* ---------- Les zones de couleur (échelle 0 = gel … 100 = explosion) ---------- */
function zones(R){
  var vW = R.vertW, rest = 100 - vW, froid = rest * 0.42, chaud = rest - froid, Z = {};
  Z.violet = [0, froid * 0.48];
  Z.bleu = [Z.violet[1], froid];
  Z.vert = [froid, froid + vW];
  Z.centre = froid + vW / 2;
  Z['arc-en-ciel'] = [Z.centre - R.aeW / 2, Z.centre + R.aeW / 2];
  Z.jaune = [Z.vert[1], Z.vert[1] + chaud * 0.3];
  Z.rouge = [Z.jaune[1], Z.jaune[1] + chaud * 0.33];
  Z.bouillant = [Z.rouge[1], 100];
  return Z;
}
function zoneDe(h, Z){
  if(h >= Z['arc-en-ciel'][0] && h <= Z['arc-en-ciel'][1]) return 'arc-en-ciel';
  for(var i = 0; i < ORDRE.length; i++) if(h < Z[ORDRE[i]][1]) return ORDRE[i];
  return 'bouillant';
}
function dans(h, nom, Z){ var b = Z[nom]; return h >= b[0] && h <= b[1]; }
function hexRgb(h){ var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function couleur(h, Z){
  var pts = [[0, '#5a2aa8']].concat(ORDRE.map(function(z){ return [(Z[z][0] + Z[z][1]) / 2, COUL[z]]; })).concat([[100, '#ff1200']]);
  for(var i = 0; i < pts.length - 1; i++){
    if(h <= pts[i + 1][0]){
      var a = hexRgb(pts[i][1]), b = hexRgb(pts[i + 1][1]), t = U.borne((h - pts[i][0]) / Math.max(0.01, pts[i + 1][0] - pts[i][0]), 0, 1);
      return 'rgb(' + a.map(function(v, k){ return Math.round(v + (b[k] - v) * t); }).join(',') + ')';
    }
  }
  return '#ff1200';
}
function gradJauge(Z){
  var s = [];
  ORDRE.forEach(function(z){ s.push(COUL[z] + ' ' + Z[z][0].toFixed(1) + '%', COUL[z] + ' ' + Z[z][1].toFixed(1) + '%'); });
  return 'linear-gradient(to top,' + s.join(',') + ')';
}
function infoZone(nom){ var Zc = DD().ZONES_CHAUDRON || {}; return Zc[nom] || {nom:nom, grand:String(nom).toUpperCase(), c:COUL[nom] || '#3fcf6a', dit:''}; }

/* ---------- Choix d'une potion (salle d'entraînement) ---------- */
function choisirPotion(n){
  var C = DD().CHAUDRON || {}, ids = Object.keys(C);
  if(!ids.length) return null;
  /* aux niveaux élevés, on préfère les recettes longues */
  var poids = ids.map(function(id){ return 1 + Math.max(0, n - 4) * 0.25 * C[id].frise.length; }), tot = poids.reduce(function(a, b){ return a + b; }, 0), r = Math.random() * tot;
  for(var i = 0; i < ids.length; i++){ r -= poids[i]; if(r <= 0) return ids[i]; }
  return ids[0];
}

/* ==========================================================
   Sons synthétisés (WebAudio) : un gain maître par partie, coupé
   net par arreter(). Rien si le son est coupé dans les options,
   ni avant le premier geste de l'enfant (règle des navigateurs).
   ========================================================== */
var ctxA = null, bruitBuf = null;
function sonActif(){ try{ if(window.Brume && Brume.sonActif) return !!Brume.sonActif(); }catch(e){} return true; }
function contexte(){
  if(!sonActif()) return null;
  try{ if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; }catch(e){}
  if(!ctxA){ try{ var AC = window.AudioContext || window.webkitAudioContext; ctxA = AC ? new AC() : null; }catch(e){ ctxA = null; } }
  if(ctxA && ctxA.state === 'suspended') try{ ctxA.resume(); }catch(e){}
  return ctxA;
}
function bruitBlanc(a){
  if(bruitBuf && bruitBuf.sampleRate === a.sampleRate) return bruitBuf;
  var n = a.sampleRate * 2, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return (bruitBuf = b);
}
function Sons(){
  var maitre = null, coupe = false, touille = null, mijote = null, accBulle = 0;
  function sortie(){
    if(coupe) return null;
    var a = contexte(); if(!a) return null;
    if(!maitre){ maitre = a.createGain(); maitre.gain.value = 0.85; maitre.connect(a.destination); }
    return maitre;
  }
  /* une note courte (f0 → f1) */
  function note(type, f0, f1, t0, dur, vol){
    var o = sortie(); if(!o) return;
    try{
      var a = ctxA, t = a.currentTime + (t0 || 0), s = a.createOscillator(), g = a.createGain();
      s.type = type; s.frequency.setValueAtTime(f0, t); if(f1) s.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.015, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(g); g.connect(o); s.start(t); s.stop(t + dur + 0.03);
    }catch(e){}
  }
  /* un souffle de bruit filtré (filtre qui glisse de fq0 à fq1) */
  function souffle(t0, dur, vol, filtre, fq0, fq1, q){
    var o = sortie(); if(!o) return;
    try{
      var a = ctxA, t = a.currentTime + (t0 || 0), s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = bruitBlanc(a); f.type = filtre || 'lowpass'; f.Q.value = q || 0.8;
      f.frequency.setValueAtTime(fq0, t); if(fq1) f.frequency.exponentialRampToValueAtTime(fq1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(o); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }catch(e){}
  }
  /* un son continu (bruit en boucle → filtre → gain), réglé à chaque image */
  function continu(filtre, fq, q){
    var o = sortie(); if(!o) return null;
    try{
      var a = ctxA, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = bruitBlanc(a); s.loop = true; f.type = filtre; f.frequency.value = fq; f.Q.value = q; g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(o); s.start();
      return {s:s, f:f, g:g};
    }catch(e){ return null; }
  }
  function regle(c, vol, fq){
    if(!c) return;
    try{ var t = ctxA.currentTime; c.g.gain.setTargetAtTime(vol, t, 0.09); if(fq) c.f.frequency.setTargetAtTime(fq, t, 0.09); }catch(e){}
  }
  var api = {
    /* à chaque image : clapotis de la louche (suit la vitesse) et bouillonnement (suit la chaleur) */
    maj:function(dt, omega, h, actif){
      if(coupe || !sortie()) return;
      var w = Math.min(14, Math.abs(omega));
      if(!touille && w > 0.4) touille = continu('bandpass', 400, 1.6);
      if(touille) regle(touille, actif ? Math.min(0.16, w * 0.016) : 0, 260 + w * 75);
      var chaud = Math.max(0, Math.min(1, (h - 25) / 75));
      if(!mijote && chaud > 0.05) mijote = continu('lowpass', 300, 0.7);
      if(mijote) regle(mijote, actif ? 0.012 + chaud * chaud * 0.07 : 0, 220 + chaud * 600);
      if(!actif) return;
      accBulle += dt * (0.3 + chaud * chaud * 9);
      if(accBulle >= 1){
        accBulle = 0;
        var f = 180 + Math.random() * 260 + chaud * 220;
        note('sine', f, f * (1.6 + Math.random() * 0.8), 0, 0.05 + Math.random() * 0.06, 0.012 + chaud * 0.035);
      }
    },
    tic:function(){ note('sine', 1350, 1100, 0, 0.04, 0.05); },
    tock:function(){ note('triangle', 210, 150, 0, 0.09, 0.16); souffle(0, 0.04, 0.08, 'highpass', 2500); },
    crepite:function(){
      for(var i = 0; i < 9; i++) souffle(i * 0.045 + Math.random() * 0.03, 0.025, 0.05 + Math.random() * 0.05, 'bandpass', 1800 + Math.random() * 2500, null, 2);
      souffle(0, 0.5, 0.04, 'lowpass', 900, 300);
    },
    retire:function(){ souffle(0, 0.35, 0.07, 'bandpass', 2400, 500, 1.2); note('triangle', 260, 120, 0.05, 0.18, 0.08); },
    plouf:function(){ note('sine', 560, 140, 0, 0.22, 0.14); souffle(0.02, 0.3, 0.06, 'lowpass', 2200, 400); note('sine', 900, 1500, 0.12, 0.06, 0.03); },
    etoile:function(){ [1319, 1568, 2093].forEach(function(f, i){ note('sine', f, 0, i * 0.06, 0.25, 0.04); }); },
    erreur:function(){ note('square', 200, 150, 0, 0.16, 0.035); note('square', 150, 120, 0.13, 0.18, 0.03); },
    alerte:function(){ note('triangle', 660, 0, 0, 0.14, 0.05); note('triangle', 520, 0, 0.16, 0.2, 0.045); },
    feuBas:function(){ note('sine', 330, 260, 0, 0.3, 0.05); },
    feuHaut:function(){ note('sine', 520, 700, 0, 0.22, 0.045); note('sine', 700, 900, 0.2, 0.18, 0.035); },
    succes:function(){ [523, 659, 784, 1047, 1319].forEach(function(f, i){ note('triangle', f, 0, i * 0.09, 0.45, 0.09); }); note('sine', 2093, 0, 0.5, 0.8, 0.04); },
    boum:function(){ note('sine', 110, 28, 0, 1.0, 0.45); souffle(0, 1.3, 0.35, 'lowpass', 2600, 120); souffle(0.05, 0.4, 0.15, 'highpass', 3000); },
    pschitt:function(){ souffle(0, 1.1, 0.12, 'bandpass', 3500, 400, 0.9); note('triangle', 300, 90, 0.1, 0.8, 0.05); },
    gel:function(){ [2637, 2093, 1760, 1319].forEach(function(f, i){ note('sine', f, f * 0.98, i * 0.08, 0.35, 0.04); }); souffle(0, 0.5, 0.04, 'highpass', 5000); },
    rate:function(){ note('triangle', 392, 0, 0, 0.2, 0.07); note('triangle', 311, 0, 0.18, 0.35, 0.07); },
    /* fin de partie : les sons continus s'éteignent doucement */
    calme:function(){ regle(touille, 0); regle(mijote, 0); },
    couper:function(){
      coupe = true;
      [touille, mijote].forEach(function(c){ if(c) try{ c.s.stop(); c.s.disconnect(); }catch(e){} });
      touille = mijote = null;
      if(maitre){ try{ maitre.gain.cancelScheduledValues(ctxA.currentTime); maitre.gain.setValueAtTime(0, ctxA.currentTime); maitre.disconnect(); }catch(e){} maitre = null; }
    }
  };
  return api;
}

/* ==========================================================
   Construction de l'écran (jeu et démo)
   ========================================================== */
function construire(el, P, demo){
  var D = DD(), id = ++uid, C = (D.CHAUDRON || {})[P.potion] || {zone:'vert', frise:[]}, Zi = infoZone(C.zone);
  /* les caisses : seulement les ingrédients vraiment là dans le laboratoire (le stock de l'atelier) ;
     sans stock (salle d'entraînement) : ceux de la recette et 3 autres. Toujours ceux de la recette. */
  var I = D.INGR || {}, tous = Object.keys(I), stock = null, voulus = {};
  try{ stock = typeof P.stock === 'function' ? P.stock() : (P.stock || null); }catch(e){ stock = null; }
  C.frise.forEach(function(f){ voulus[f.ingr] = 1; });
  if(stock) Object.keys(stock).forEach(function(k){ if(stock[k] > 0) voulus[k] = 1; });
  else U.melanger(tous.filter(function(k){ return !voulus[k]; })).slice(0, 3).forEach(function(k){ voulus[k] = 1; });
  var ingrs = tous.filter(function(k){ return voulus[k]; });
  Object.keys(voulus).forEach(function(k){ if(ingrs.indexOf(k) < 0) ingrs.push(k); });
  /* (23 novembre) le chaudron, son feu, ses six bûches, la flèche à deux pointes : dessinés par mj-chaudron-dessin.js */
  var svg = Dessin().svg(id, demo);
  /* La carte de la recette, à côté de la frise (Romain) : chaque ingrédient dans l'ordre, avec sa couleur, son icône, son nom
     et le nombre à verser ; la frise, elle, ne montre que les couleurs. Recette secrète : seulement des ❓. */
  var groupes = [];
  C.frise.forEach(function(f){ var g = groupes[groupes.length - 1]; if(g && g.ingr === f.ingr) g.n++; else groupes.push({ingr:f.ingr, n:1}); });
  var connueR = P.connue !== false, lireRec = 'La recette : ' + groupes.map(function(g){ var x = I[g.ingr] || {nom:g.ingr}; return g.n + ' ' + String(x.nom).toLowerCase(); }).join(', puis ') + '.';
  /* (23 novembre) la recette est une page épinglée dans le décor, à gauche de l'âtre : une ligne par ingrédient, la fiole en bas */
  var recette = '<div class="mjc-recette"><i class="mjc-rec-clou"></i><b class="mjc-rec-t">La recette</b>' + (connueR ? groupes.map(function(g, k){
      var x = I[g.ingr] || {ic:'❔', c:'#888', nom:g.ingr};
      return '<span class="mjc-rec-i" data-g="' + k + '" style="--c:' + codeDe(g.ingr).c + '"><b>' + g.n + '</b><i class="mjc-rec-c"></i>' +
        '<span class="mjc-rec-ic">' + icDe(g.ingr, x) + '</span><em>' + esc(nomCourt(g.ingr, x)) + '</em></span>';
    }).join('') : '<span class="mjc-rec-i secret" style="--c:#8d8a99"><i class="mjc-rec-c">❓</i><em>Recette secrète</em></span>') +
    /* la dernière étape : la fiole (la zone à tenir n'apparaît sur la jauge qu'à ce moment-là) */
    '<span class="mjc-rec-i mjc-rec-fin"><span class="mjc-rec-ic">🧪</span></span></div>';
  lireRec += ' Et à la fin, la fiole : garde la potion dans la zone qui s\'allume sur la jauge.';
  /* (23 novembre) les ingrédients : des bocaux de verre posés sur la poutre de la cheminée (l'ingrédient dessiné dedans, son nom sur
     l'étiquette, son icône pendue au goulot) ; la frise glisse dans la face de la poutre, juste dessous */
  var Ds = Dessin();
  var boites = ingrs.map(function(k){
    var x = I[k] || {ic:'❔', c:'#888', nom:k};
    return '<button type="button" class="mjc-boite" data-ingr="' + k + '" aria-label="' + esc(x.nom) + '">' + Ds.bocal(k, {nom:esc(nomCourt(k, x)), court:esc(NOMS_ETROITS[k] || nomCourt(k, x)), ic:icDe(k, x)}) + '</button>';
  }).join('');
  /* deux étages seulement : l'en-tête du mini-jeu (le nom, les cœurs, ⏸️ 🏳️ 🔊 : mj-core.js) et la poutre (.mjc-haut) ; la recette,
     le thermomètre et la réserve de bois sont dans le décor (.mjc-scene), placés par disposer() */
  var r = U.html('<div class="mjc' + (demo ? ' mjc-demo' : '') + '">' +
    /* (.mjc-dessus : le dessus de la poutre, vu d'un peu au-dessus comme le chaudron — les bocaux sont posés dessus, pas contre le mur) */
    (demo ? '' : '<div class="mjc-haut"><div class="mjc-boites">' + boites + '</div><div class="mjc-dessus" aria-hidden="true"></div>' +
      '<div class="mjc-frise"><div class="mjc-zone-f"></div><div class="mjc-piste"></div><div class="mjc-fl-next" hidden><i></i></div></div></div>') +
    '<div class="mjc-scene">' + (demo ? '' : '<div class="mjc-decor-b" aria-hidden="true"></div><div class="mjc-lums" aria-hidden="true"><i class="mjc-lum a"></i><i class="mjc-lum b"></i><i class="mjc-lum c"></i></div>') + svg +
      (demo ? '' : recette + Ds.reserve(id)) +
      '<div class="mjc-jauge"><span class="mjc-j-ic">' + Ds.icFeu + '</span><div class="mjc-j-tube"><i class="mjc-j-ae"></i><i class="mjc-j-vert"></i><i class="mjc-j-cible"></i><i class="mjc-j-curseur"><b></b></i></div><span class="mjc-j-ic">' + Ds.icGivre + '</span></div>' +
      '<div class="mjc-bulle" hidden></div><div class="mjc-danger" hidden></div><div class="mjc-fin" hidden></div>' +
    '</div>' + (demo ? '' : '<div class="mjc-vies"></div><div class="mjc-err" hidden></div><div class="mjc-oups" hidden></div>') + '</div>');
  el.appendChild(r);
  var q = function(s){ return r.querySelector(s); };
  var rec = q('.mjc-recette');
  if(rec && connueR && MJ.boutonLire) rec.appendChild(MJ.boutonLire(lireRec, 'mjc-rec-lire'));   /* 🔊 : jamais lu tout seul */
  return {
    groupes:groupes, recItems:[].slice.call(r.querySelectorAll('.mjc-rec-i[data-g]')),
    id:id, racine:r, svg:q('.mjc-svg'), C:C, ingrs:ingrs, zoneCible:C.zone, Zi:Zi,
    liq:q('.mjc-liq'), ae:q('.mjc-ae'), tour:q('.mjc-tour'), givre:q('.mjc-givre'), vapeur:q('.mjc-vapeur'),
    bordArriere:q('.mjc-bord-arriere'), ride:q('.mjc-ride'), cuilleron:q('.mjc-cuilleron'), mancheIn:q('.mjc-manche-in'), manche:q('.mjc-manche'), reflet:q('.mjc-reflet'), pommeau:q('.mjc-pommeau'),
    flammes:[].slice.call(r.querySelectorAll('.mjc-flammes')), lueur:q('.mjc-lueur-feu'), tas:q('.mjc-tas'),
    /* les six bûches, rangées par leur numéro (dans le dessin, elles sont dans l'ordre « du fond vers nous ») */
    buches:[].slice.call(r.querySelectorAll('.mjc-buche')).sort(function(a, b){ return a.getAttribute('data-i') - b.getAttribute('data-i'); }),
    decorB:q('.mjc-decor-b'), lums:q('.mjc-lums'), rec:q('.mjc-recette'), jaugeB:q('.mjc-jauge'),
    chauffe:q('.mjc-chauffe'), refroidit:q('.mjc-refroidit'),
    jauge:q('.mjc-j-tube'), curseur:q('.mjc-j-curseur'), jAe:q('.mjc-j-ae'), jCible:q('.mjc-j-cible'), jVert:q('.mjc-j-vert'),
    frise:q('.mjc-frise'), piste:q('.mjc-piste'), zoneF:q('.mjc-zone-f'), flNext:q('.mjc-fl-next'), boites:q('.mjc-boites'), vies:q('.mjc-vies'), bulle:q('.mjc-bulle'), fin:q('.mjc-fin'), scene:q('.mjc-scene'),
    err:q('.mjc-err'), oups:q('.mjc-oups'), danger:q('.mjc-danger'), plus:q('.mjc-plus')
  };
}

/* L'icône d'un ingrédient dans le chaudron. Les pensées (Romain, 13 novembre : « le petit carré qui arrive n'est pas de la bonne couleur
   par rapport à l'icône ») : l'émoji 🌼 n'a pas la même couleur partout (jaune sur les tablettes Android, pâle sur un iPhone). Ici, une
   petite pensée dessinée, aux pétales jaunes comme son carré (la pensée sauvage a souvent des pétales jaunes, avec des traits violets au cœur). */
var PENSEE_SVG = '<svg class="mjc-ic-svg" viewBox="-20 -20 40 40" aria-hidden="true" focusable="false">' +
  '<g stroke="#24182e" stroke-width="1.6" stroke-linejoin="round">' +
  '<ellipse cx="-7" cy="-9" rx="8" ry="9" fill="#ffc21a"/><ellipse cx="7" cy="-9" rx="8" ry="9" fill="#ffc21a"/>' +
  '<ellipse cx="-11" cy="2" rx="8.5" ry="7.5" fill="#febb02"/><ellipse cx="11" cy="2" rx="8.5" ry="7.5" fill="#febb02"/>' +
  '<path d="M-10 6 C -10 18 10 18 10 6 C 6 3 -6 3 -10 6 Z" fill="#ffd23f"/></g>' +
  '<path d="M0 3 L -5 -4 M0 3 L 5 -4 M0 3 L 0 11 M0 3 L -7 6 M0 3 L 7 6" stroke="#6a3aa8" stroke-width="1.6" stroke-linecap="round"/>' +
  '<circle cx="0" cy="3" r="2.6" fill="#ff8a1a" stroke="#24182e" stroke-width="1.2"/></svg>';
function icDe(k, x){ return k === 'pensee' ? PENSEE_SVG : ((x && x.ic) || '❔'); }
/* Le nom écrit sous l'icône d'une caisse : un seul mot */
var NOMS_COURTS = {lune:'Lune', pensee:'Pensées'};
var NOMS_ETROITS = {champignon:'Champi'};     /* quand les caisses sont étroites (téléphone) */
function nomCourt(k, x){ return NOMS_COURTS[k] || String((x && x.nom) || k).split(/[ '’]/)[0]; }

/* Point de la scène SVG → coordonnées dans un élément (tient compte du cadrage) */
function versEl(E, x, y, el){
  var m = E.svg.getScreenCTM(), r = el.getBoundingClientRect();
  if(!m) return {x:0, y:0};
  var p = E.svg.createSVGPoint(); p.x = x; p.y = y; p = p.matrixTransform(m);
  return {x:p.x - r.left, y:p.y - r.top};
}
/* La louche, recalculée à chaque image à partir de son angle (vraie perspective) */
function dessinerLouche(E, theta){
  var c = Math.cos(theta), s = Math.sin(theta), L = LOUCHE;
  var B = [L.r * c, -2, L.r * s];
  var dir = [L.a * c, L.b, L.a * s];
  var t0 = (L.haut + 2) / (L.L * L.b);
  function pt(t){ return proj(B[0] + dir[0] * L.L * t, B[1] + dir[1] * L.L * t, B[2] + dir[2] * L.L * t); }
  var pB = pt(0), pM = pt(t0), pH = pt(1);
  function quad(p0, p1, w0, w1){
    var dx = p1.x - p0.x, dy = p1.y - p0.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    return [[p0.x + nx * w0, p0.y + ny * w0], [p1.x + nx * w1, p1.y + ny * w1], [p1.x - nx * w1, p1.y - ny * w1], [p0.x - nx * w0, p0.y - ny * w0]];
  }
  function str(q){ return q.map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  var w = function(p, base){ return base * p.s; };
  E.mancheIn.setAttribute('points', str(quad(pB, pM, w(pB, 5.5), w(pM, 6))));
  E.manche.setAttribute('points', str(quad(pM, pH, w(pM, 6), w(pH, 8.5))));
  /* reflet : un filet clair du côté de la lumière (en haut à gauche) */
  var dx = pH.x - pM.x, dy = pH.y - pM.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  if(nx > 0 || (nx === 0 && ny > 0)){ nx = -nx; ny = -ny; }
  var r0 = [pM.x + nx * w(pM, 2.5), pM.y + ny * w(pM, 2.5)], r1 = [pH.x + nx * w(pH, 4), pH.y + ny * w(pH, 4)];
  E.reflet.setAttribute('points', str(quad({x:r0[0], y:r0[1]}, {x:r1[0], y:r1[1]}, w(pM, 1.4), w(pH, 2))));
  E.pommeau.setAttribute('cx', pH.x.toFixed(1)); E.pommeau.setAttribute('cy', pH.y.toFixed(1)); E.pommeau.setAttribute('r', (8.5 * pH.s).toFixed(1));
  E.ride.setAttribute('cx', pB.x.toFixed(1)); E.ride.setAttribute('cy', pB.y.toFixed(1)); E.ride.setAttribute('rx', (24 * pB.s).toFixed(1)); E.ride.setAttribute('ry', (24 * pB.s * SINA).toFixed(1));
  E.cuilleron.setAttribute('cx', (pB.x - c * 10 * pB.s).toFixed(1)); E.cuilleron.setAttribute('cy', (pB.y + 3).toFixed(1)); E.cuilleron.setAttribute('rx', (20 * pB.s).toFixed(1)); E.cuilleron.setAttribute('ry', (20 * pB.s * SINA).toFixed(1));
  E.tour.setAttribute('transform', 'translate(' + CX + ',' + CY + ') scale(1,' + SINA + ') rotate(' + (theta * 180 / Math.PI).toFixed(1) + ') translate(' + (-CX) + ',' + (-CY) + ')');
  /* au fond, le manche passe derrière le bord du chaudron (fondu continu selon l'angle) */
  E.bordArriere.setAttribute('opacity', Math.max(0, Math.min(1, -s * 2.5)).toFixed(2));
}

/* La jauge : bandes de couleur, arc-en-ciel, cible */
function preparerJauge(E, Z, nomCible){
  E.jauge.style.background = gradJauge(Z);
  E.jAe.style.bottom = Z['arc-en-ciel'][0] + '%';
  E.jAe.style.height = (Z['arc-en-ciel'][1] - Z['arc-en-ciel'][0]) + '%';
  var b = Z[nomCible] || Z.vert;
  E.jCible.style.bottom = b[0] + '%';
  E.jCible.style.height = (b[1] - b[0]) + '%';
}

/* ==========================================================
   Le mini-jeu
   ========================================================== */
MJ.enregistrer('chaudron', {
  nom:'Le chaudron', role:'alchimiste', ic:'🍲',
  codes:CODES,      /* la palette du chaudron (la démo de mj-regles.js s'en sert) */
  consigne:function(p){
    var C = (DD().CHAUDRON || {})[p.potion] || {zone:'vert'}, Z = infoZone(C.zone);
    return 'Le bois chauffe la potion : touche le tas de bois pour ajouter une bûche, la barre monte. Le bois brûle vite, pense à en remettre ! ' +
      'Touille avec ton doigt pour refroidir, dans le sens que tu veux : la barre descend, et elle continue un peu quand tu t\'arrêtes. Trop chaud, ça explose ; trop froid, ça gèle. ' +
      'Quand un carré s\'allume dans la zone de la poutre, regarde sa couleur sur la recette et touche le bon bocal. Tu ne peux verser que quand la barre est dans le vert. Si tu te trompes, tu perds un cœur. ' +
      'À la fin, garde la potion dans la zone ' + Z.nom + ' jusqu\'à ce que la fiole se remplisse.';
  },
  /* niveau 1 = le tutoriel (3 cœurs, l'ingrédient attend dans la zone, une flèche, barre légère, zones larges) ; jusqu'au niveau 10 :
     barre plus lourde (inertie), zones plus étroites, ingrédients qui traversent la zone (niveau 3+), doses rapprochées,
     fin chronométrée (niveau 3+), moins de cœurs, plus de flèche (niveau 4+). Le feu et le bois : pareils à tous les niveaux. */
  reglages:function(n, mods){
    var P = U.parNiveau, zone = mods.zone > 0 ? mods.zone : 1, lent = mods.lent > 0 ? mods.lent : 1, temps = mods.temps || 0;
    var r = {
      attend:n < 2,                                              /* niveau 1 (le tutoriel) : l'ingrédient attend dans la zone */
      fenetre:P(n, 9, 2, 1.6) / lent + temps * 0.5,              /* le temps qu'il met à traverser la zone (s) : lent au niveau 1, très vite au 10 */
      duree:P(n, 52, 48, 45) + temps * 2,                        /* durée visée de la version de midi (environ la moitié d'avant) */
      marge:P(n, 11, 9, 8),                                      /* le temps laissé pour la fin (aller dans la zone, remplir la fiole) */
      ecartMax:14,                                               /* jamais plus de 14 s entre deux ingrédients */
      ecartMin:P(n, 1, 0.45, 0.45),                              /* doses rapprochées aux niveaux hauts (D.CHAUDRON : ecart) */
      debut0:P(n, 3.5, 2.5, 2),                                  /* (l'attente avant le premier carré, version de midi) */
      debut:P(n, 2.5, 1.5, 1.2),
      raccourci:10,                                              /* Romain, 13 h 06 : 10 s de moins à chaque niveau, même vitesse de défilement */
      buches:3,
      combustion:BRULE / lent,                                   /* une bûche brûle en… (s) : vite, à tous les niveaux */
      tau:P(n, 0.8, 2.2, 0.6, 2.6),                              /* inertie : la barre continue de descendre… (s) */
      chocs:P(n, 0.5, 1, 0.4),                                   /* un ingrédient pousse un peu la barre */
      vertW:Math.min(50, P(n, 40, 18, 14) * zone),
      aeW:Math.min(16, P(n, 12, 6, 5) * zone),
      tenue:2.5,                                                 /* fiole à remplir dans la zone de fin (s) : toujours 2,5 s, quel que soit le niveau (Romain, 13 h 20) */
      finaleMax:P(n, 60, 20, 16) / lent + temps * 2,             /* le temps pour finir (aller dans la zone, remplir la fiole) : 60 s au niveau 1, 20 s au 10 */
      zoneFin:P(n, 1, 0.5, 0.4),                                 /* la taille de la zone de fin : normale au niveau 1, moitié au 10 */
      vies:3 + (mods.erreurs || 0),                              /* cœurs = erreurs d'ingrédient permises : toujours 3, à tous les niveaux (Romain, 13 h 20) */
      fleche:n <= 3,
      aideTuto:n <= 1,                                           /* niveau 1 (enquête 1) : « ? » puis l'icône dans la zone, grosse flèche rouge à la fin */
      aide:mods.aide || 0, revele:!!mods.revele,
      indices:true
    };
    r.potion = choisirPotion(n);
    function s(x){ return U.fmt(x, 1) + ' s'; }
    r.lignes = [
      {nom:'Les ingrédients', val:r.attend ? 'avancent doucement et attendent dans la zone' : 'traversent la zone en ' + s(r.fenetre)},
      {nom:'Une bûche brûle en', val:s(r.combustion)},
      {nom:'La barre continue de descendre (inertie)', val:s(r.tau)},
      {nom:'Largeur de la zone verte', val:Math.round(r.vertW) + ' %'},
      {nom:'Pour finir la potion', val:s(r.finaleMax)},
      {nom:'Taille de la zone de fin', val:Math.round(r.zoneFin * 100) + ' %'},
      {nom:'Cœurs (erreurs permises)', val:String(r.vies)},
      {nom:'Durée visée', val:'environ ' + Math.round(r.duree) + ' s'}
    ];
    return r;
  },

  demo:function(el, p){
    var E = construire(el, {potion:p.potion}, true), R = MJ.TYPES.chaudron.reglages(3, {}), Z = zones(R);
    preparerJauge(E, Z, 'vert');
    var theta = Math.PI / 2, h = Z.centre, t = 0, main = U.html('<div class="mjc-main">👆</div>');
    E.scene.appendChild(main);
    E.buches.forEach(function(b, i){ b.style.display = i < 4 ? '' : 'none'; });
    E.racine.classList.add('mjc-z-vert');
    var stop = U.boucle(function(dt){
      t += dt;
      /* (23 novembre) comme dans le jeu : on touille dans un sens, puis dans l'autre, et les deux refroidissent ; la main s'arrête, le feu réchauffe */
      var ph = t % 6.4, tourne = ph < 2 || (ph >= 3.2 && ph < 5.2), sens = ph < 3.2 ? 1 : -1, w = tourne ? 5.5 * sens : 0;
      theta += w * dt;
      h = U.borne(h + (tourne ? -14 : 9) * dt, Z.bleu[0] + 4, Z.rouge[1] - 4);
      dessinerLouche(E, theta);
      E.liq.style.fill = couleur(h, Z);
      E.curseur.style.bottom = h + '%';
      E.racine.classList.toggle('mjc-demo-refroidit', tourne);
      var p2 = proj(LOUCHE.r * Math.cos(theta), 0, LOUCHE.r * Math.sin(theta)), m = versEl(E, p2.x, p2.y, E.scene);
      main.style.transform = 'translate(' + m.x.toFixed(1) + 'px,' + m.y.toFixed(1) + 'px)';
    });
    return {arreter:function(){ stop(); }};
  },

  jouer:function(el, R, fin){
    var D = DD(), I = D.INGR || {};
    if(!R.potion) R.potion = choisirPotion(R.niveauEffectif || 3);
    var E = construire(el, R, false), C = E.C, Z = zones(R), cible = C.zone, total = C.frise.length;
    /* l'arc-en-ciel est la bande la plus étroite : on le tient un peu moins longtemps */
    var tenueFin = R.tenue;   /* 2,5 s partout, arc-en-ciel compris */
    var connue = R.connue !== false, stock = typeof R.stock === 'function' ? R.stock() : (R.stock ? Object.assign({}, R.stock) : null);
    preparerJauge(E, Z, cible);
    /* la zone de fin : taille normale au niveau 1 (celle du niveau 1), moitié au niveau 10 (R.zoneFin), au milieu de la zone de la potion */
    var zm = (R.mods && R.mods.zone > 0) ? R.mods.zone : 1, Z1 = zones({vertW:Math.min(50, 40 * zm), aeW:Math.min(16, 12 * zm)});
    var cz = (Z[cible][0] + Z[cible][1]) / 2, dz1 = (Z1[cible][1] - Z1[cible][0]) * (R.zoneFin || 1) / 2;
    var zFin = [Math.max(1, cz - dz1), Math.min(98, cz + dz1)];
    E.jCible.style.bottom = zFin[0] + '%'; E.jCible.style.height = (zFin[1] - zFin[0]) + '%';
    /* niveau 1 : la grosse flèche rouge qui montrera la zone de fin sur la jauge (elle n'apparaît qu'à la fin) */
    if(R.aideTuto && E.jauge){ var flF = U.html('<i class="mjc-j-fleche" aria-hidden="true"><b></b></i>'); flF.style.bottom = ((zFin[0] + zFin[1]) / 2) + '%'; E.jauge.appendChild(flF); }
    function dansFin(h){ return h >= zFin[0] && h <= zFin[1]; }
    /* pendant les ingrédients, on ne verse que dans le vert : la bande verte de la jauge est soulignée doucement */
    if(E.jVert){ E.jVert.style.bottom = Z.vert[0] + '%'; E.jVert.style.height = (Z.vert[1] - Z.vert[0]) + '%'; }
    /* pendant les ingrédients : aucune zone ni 🎯 sur la jauge (seulement ne pas exploser ni geler) ; elle apparaît à la fin */
    E.racine.classList.add('mjc-sans-cible');
    if(cible === 'arc-en-ciel') E.racine.classList.add('mjc-cible-ae');
    if(R.revele) E.racine.classList.add('mjc-revele');
    var stops = [], timers = [], A = Sons();
    function ecoute(c, t, f, o){ c.addEventListener(t, f, o); stops.push(function(){ c.removeEventListener(t, f, o); }); }
    function apres(ms, f){ var x = setTimeout(function(){ if(!S.fini) f(); }, ms); timers.push(x); return x; }

    /* --- l'état --- */
    var S = {
      t:0, tf:0, h:Z.centre, v:0, L:Math.min(MAX_BUCHES, R.buches || 3), braise:0, theta:Math.PI / 2, omega:0, tient:null, doigt:null,
      vies:R.vies, erreurs:0, etoiles:0, fini:false, termine:false, pause:false,
      fen:[], finale:null, tenue:0, zone:'vert', indice:'', R:R, Z:Z, cible:cible, zFin:zFin
    };
    MJ.TYPES.chaudron._dernier = S;

    /* --- la frise : un petit carré de la couleur de chaque dose (rien d'autre), dans l'ordre de la recette.
       f.a = l'instant (horloge de la frise S.tf) où il entre dans la zone 🍲 ; les doses sont réparties pour que
       la partie dure environ R.duree. Niveaux 1-2 (R.attend) : la frise s'arrête quand le prochain carré est au milieu de la zone. --- */
    var poids = C.frise.map(function(f, i){ return i ? Math.max(R.ecartMin, f.ecart || 1) : 0; }), somme = poids.reduce(function(a, b){ return a + b; }, 0);
    var deb0 = R.debut0 === undefined ? R.debut : R.debut0;
    var pas = somme ? U.borne((R.duree - R.marge - deb0) / somme, 2.5, R.ecartMax) : 0, a0 = R.debut;
    var gDe = [], gk = -1;     /* le groupe de la carte de la recette de chaque dose (2 eau de suite = un seul groupe) */
    C.frise.forEach(function(f, i){ if(!i || C.frise[i - 1].ingr !== f.ingr) gk++; gDe.push(gk); });
    /* jamais deux carrés allumés ensemble : le suivant n'entre dans la zone qu'une fois le précédent sorti (ou, au niveau 1, arrêté au milieu) */
    var ecartMini0 = R.attend ? R.fenetre / 2 + 1 : R.fenetre + 0.5;
    /* 10 s de moins (13 h 06), à la même vitesse : on prend les écarts de la version de midi et on retire ce qu'il faut
       (moins l'attente avant le premier carré), sans descendre sous un écart minimum. Au-dessous de « le précédent est sorti »,
       le carré suivant peut entrer dans la zone pendant que le précédent y est encore : il reste gris (seul le premier s'allume). */
    var ecartMini = R.attend ? R.fenetre / 2 + 0.5 : R.fenetre * 0.8 + 0.3;
    var g0 = poids.map(function(p, i){ return i ? Math.max(pas * p, ecartMini0) : 0; });
    var mou = g0.reduce(function(s, g, i){ return s + (i ? Math.max(0, g - ecartMini) : 0); }, 0);
    var reste = Math.max(0, (R.raccourci || 0) - (deb0 - R.debut)), kr = mou > 0 ? Math.min(1, reste / mou) : 0;
    var ecarts = g0.map(function(g, i){ return i ? g - kr * Math.max(0, g - ecartMini) : 0; });
    S.planAvant = deb0 + g0.reduce(function(s, g){ return s + g; }, 0);
    C.frise.forEach(function(f, i){
      if(i) a0 += ecarts[i];
      /* gris hors de la zone ; il prend sa couleur unie quand il est allumé dans la zone (classe zone) */
      /* niveau 1 : un « ? » sur le carré gris ; allumé dans la zone, l'icône de l'ingrédient apparaît (💧…) */
      var aideT = R.aideTuto && connue, icT = aideT ? icDe(f.ingr, I[f.ingr]) : '';
      var d = U.html('<div class="mjc-ing' + (connue ? '' : ' secret') + (aideT ? ' aide' : '') + '" style="--c:' + (connue ? codeDe(f.ingr).c : '#8d8a99') + '">' +
        (connue ? (aideT ? '<i class="mjc-ing-q">?</i><i class="mjc-ing-ic">' + icT + '</i>' : '') : '<i>❓</i>') + '</div>');
      E.piste.appendChild(d);
      S.fen.push({ingr:f.ingr, a:a0, fait:false, el:d, g:gDe[i]});
    });
    /* la carte de la recette suit : l'ingrédient à verser brille, ceux qui sont faits sont cochés */
    function majRecette(){
      var nx = prochain();
      E.recItems.forEach(function(el, k){
        var fs = S.fen.filter(function(f){ return f.g === k; });
        el.classList.toggle('fait', fs.length > 0 && fs.every(function(f){ return f.fait; }));
        el.classList.toggle('ici', !!nx && nx.g === k);
      });
    }
    S.duree = R.duree; S.planApres = a0;   /* l'instant où le dernier carré entre dans la zone (avant / après le raccourci) */
    var recette = {};
    C.frise.forEach(function(f){ recette[f.ingr] = 1; });
    var G = {w:320, zl:6, zr:110, sq:44, pps:30};
    S.G = G;
    function mesurer(){
      /* la zone : 60 % de la frise, au milieu ; les carrés la traversent de droite à gauche */
      var w = E.frise.clientWidth || 320, zw = Math.round(w * 0.6);
      G.w = w; G.zl = Math.round((w - zw) / 2); G.zr = G.zl + zw;
      G.sq = (S.fen[0] && S.fen[0].el.offsetWidth) || 44;
      G.pps = (zw + G.sq - 12) / R.fenetre;
      E.zoneF.style.left = G.zl + 'px'; E.zoneF.style.width = zw + 'px';
      /* les bocaux : des rangées égales (12 → 1 rangée de 12, 2 de 6 ou 3 de 4), jamais un bocal tout seul ; leur taille suit la place
         (plus petits sur un écran bas, pour laisser le chaudron respirer) */
      var nb = E.ingrs.length, cols = nb, ecranBas = E.racine.clientHeight < 430;
      for(var r = 1; r <= nb; r++){ cols = Math.ceil(nb / r); if(w / cols >= 62 || (r > 1 && w / cols >= 52)) break; }
      var bw = Math.max(42, Math.min(ecranBas ? 50 : 74, Math.floor(w / cols) - 6)), rangs = Math.ceil(nb / cols);
      E.boites.style.setProperty('--bw', bw + 'px');
      /* (minmax(0, …) : les bocaux rétrécissent plutôt que de faire déborder l'écran) */
      E.boites.style.gridTemplateColumns = 'repeat(' + cols + ',minmax(0,' + bw + 'px))';
      E.boites.style.columnGap = Math.max(2, Math.min(40, Math.floor((w - 8 - cols * bw) / Math.max(1, cols - 1)))) + 'px';
      E.boites.classList.toggle('mjc-etroit', bw < 62);
      /* plusieurs rangées : celles du haut ont chacune leur planche ; la dernière est posée sur la poutre */
      [].forEach.call(E.boites.children, function(b, i){ b.classList.toggle('mjc-sur-planche', i < (rangs - 1) * cols); });
      S.fen.forEach(function(f){ f.fige = false; });
    }
    /* bord gauche du carré (px) ; dans la zone dès qu'il y entre, jusqu'à ce qu'il en sorte */
    function posL(f){ return G.zr - 6 - (S.tf - f.a) * G.pps; }
    /* seul le premier carré pas encore versé peut être allumé (jamais deux à la fois) */
    function dansZone(f){ if(f.fait || S.tf < f.a - 1e-6 || f !== prochain()) return false; return posL(f) + G.sq >= G.zl + 6; }
    function prochain(){ for(var i = 0; i < S.fen.length; i++) if(!S.fen[i].fait) return S.fen[i]; return null; }
    function arretDe(f){ return f.a + (G.zr - 6 - (G.zl + G.zr) / 2 + G.sq / 2) / G.pps; }
    /* (23 novembre) LA MISE EN PLACE DU DÉCOR, à chaque taille d'écran. Le chaudron est posé en bas de la scène, au milieu de l'âtre,
       aussi grand que la place le permet ; l'âtre (mj-chaudron-dessin.js, decor) est redessiné autour de lui ; la recette va sur le
       montant de gauche, le thermomètre sur celui de droite, la réserve de bois en bas à gauche. Sur un écran étroit (un téléphone
       debout), les montants sont minces : la recette et le thermomètre mordent sur l'âtre, au-dessus et à côté du chaudron.
       Les effets de fin et les lumières se placent par rapport au chaudron grâce à --fx, --fy, --fw et --feuy (mj-chaudron.css). */
    var dispo = {w:0, h:0};
    function px(el, l, t, w, h){ if(!el) return; el.style.left = l.toFixed(1) + 'px'; el.style.top = t.toFixed(1) + 'px'; if(w !== undefined) el.style.width = w.toFixed(1) + 'px'; if(h !== undefined) el.style.height = h.toFixed(1) + 'px'; }
    function disposer(){
      var W = E.scene.clientWidth, H = E.scene.clientHeight;
      if(!W || !H || (W === dispo.w && H === dispo.h)) return;
      dispo.w = W; dispo.h = H;
      /* trois allures : large (une tablette couchée, un ordinateur : de vrais montants, le mur de l'atelier de chaque côté),
         moyen (une tablette debout : des montants moyens) et étroit (un téléphone debout : des montants minces) ; bas : un téléphone couché */
      var large = W >= 640 && W >= H * 1.05, moyen = W >= 640 && !large, bas = H < 330;
      var mj = large ? U.borne(W * 0.12, 84, 150) : (moyen ? W * 0.085 : Math.max(14, W * 0.055)), mx = large ? U.borne(W * 0.06, 0, 80) : 0, jw = bas ? 34 : (large || moyen ? 50 : 40);
      var L = {W:W, H:H, large:large || moyen, JX0:Math.round(mx), JX1:Math.round(W - mx), OX0:Math.round(mx + mj), OX1:Math.round(W - mx - mj)};
      L.av = bas ? 10 : (large ? 26 : 18); L.tr = bas ? 8 : (large ? 16 : 12);
      L.FY = Math.round(H - U.borne(H * 0.07, 10, 60) - L.av - L.tr);
      L.VP = {x:W / 2, y:-U.borne(H * 0.22, 60, 160)}; L.s = large ? 0.74 : 0.78; L.planche = large || moyen ? 120 : 74;
      /* le chaudron : son dessin fait 460 unités de large (avec la flèche) et 418 de la cuillère au bord de devant de l'âtre
         (sur un écran bas, le haut de la cuillère passe derrière la poutre : le chaudron y gagne en taille) */
      var surJ = large || (moyen && mj >= jw + 8);   /* le thermomètre tient sur le montant de droite */
      var place = (L.OX1 - L.OX0) - (surJ ? 0 : jw * 0.8), sc = Math.min(place / 440, (L.FY - 4) / (bas ? 352 : 418), 1.6);
      L.sc = sc; L.cx = L.OX0 + place / 2 + 10 * sc; L.cy = L.FY - 62 * sc;
      px(E.svg, L.cx - 230 * sc, L.cy - 392 * sc, 460 * sc, 462 * sc);
      if(E.decorB) E.decorB.innerHTML = Dessin().decor(L, E.id);
      var st = E.scene.style;
      st.setProperty('--fx', L.cx.toFixed(1) + 'px'); st.setProperty('--fy', (L.cy - 222 * sc).toFixed(1) + 'px'); st.setProperty('--fw', (288 * sc).toFixed(1) + 'px'); st.setProperty('--feuy', (L.cy - 40 * sc).toFixed(1) + 'px');
      /* le thermomètre */
      var jh, jt;
      if(bas){ jh = L.FY - 12; jt = 6; }
      else if(large){ jt = Math.max(10, L.FY * 0.07); jh = Math.min(420, L.FY - jt - Math.max(16, L.FY * 0.1)); }
      else { jh = U.borne(L.FY * 0.64, 150, moyen ? 460 : 390); jt = Math.max(6, L.FY - 10 - jh); }
      px(E.jaugeB, surJ ? L.OX1 + (mj - jw) / 2 : W - jw - 3, jt, jw, jh);
      /* la recette épinglée : sur le montant de gauche s'il est assez large, sinon en haut à gauche de l'âtre (resserrée : .mini) */
      if(E.rec){
        /* (large : la page est clouée sur le montant et dépasse un peu sur le mur, à gauche — il faut la place d'écrire « Champignon ») */
        var rw = bas ? 72 : (large ? Math.min(176, mj + mx - 14) : (moyen ? 150 : 82));
        if(rw < 130) rw = Math.min(rw, 82);   /* pas la place des noms : la petite page, avec les dessins seulement */
        E.rec.classList.toggle('mini', rw < 104);
        E.rec.classList.toggle('serre', bas || (!large && !moyen && H < 430));
        px(E.rec, large ? Math.max(6, Math.min(L.JX0 + (mj - rw) / 2, L.OX0 - 6 - rw)) : (moyen ? 8 : L.OX0 + 4), bas ? 5 : (large ? 24 : 10), rw);
        /* un nom trop long pour sa ligne s'écrit plus petit, jamais coupé */
        [].forEach.call(E.rec.querySelectorAll('.mjc-rec-i:not(.secret) em'), function(em){
          em.style.fontSize = '';
          if(em.clientWidth && em.scrollWidth > em.clientWidth + 1) em.style.fontSize = (1.1 * Math.max(0.66, em.clientWidth / em.scrollWidth)).toFixed(2) + 'rem';
        });
      }
      /* la réserve de bois (sa boîte : 174 × 242 unités ; le bas du porte-bûches est à 219 unités du haut) : au pied du montant de
         gauche ; sur un écran bas, dans l'âtre, à gauche du chaudron ; sur un écran étroit, dans le coin d'en bas à gauche */
      if(E.tas){
        var kt = bas ? 0.5 : (large ? U.borne(mj / 150, 0.7, 1.05) : (moyen ? 0.95 : 0.72));
        if(bas) px(E.tas, L.OX0 + 6, L.FY - 4 - 219 * kt, 174 * kt, 242 * kt);
        else if(large) px(E.tas, L.JX0 + mj / 2 - 74 * kt, L.FY + L.av * 0.5 - 219 * kt, 174 * kt, 242 * kt);
        else px(E.tas, -4, H - 5 - 219 * kt, 174 * kt, 242 * kt);
      }
    }
    disposer(); requestAnimationFrame(disposer);
    /* (quand la belle écriture est chargée, les noms de la recette changent de largeur : on refait la mise en place) */
    if(document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(function(){ dispo.w = 0; disposer(); });
    if(window.ResizeObserver){ var roS = new ResizeObserver(disposer); roS.observe(E.scene); stops.push(function(){ roS.disconnect(); }); }
    mesurer(); majRecette();
    if(window.ResizeObserver){ var ro = new ResizeObserver(mesurer); ro.observe(E.frise); stops.push(function(){ ro.disconnect(); }); }

    /* --- les cœurs (mj-core.js : la même rangée partout ; cœurs = erreurs encore permises) --- */
    function majVies(casse){ E.vies.innerHTML = U.coeurs(S.vies, R.vies, casse ? S.vies : undefined); }
    /* (23 novembre) les cœurs montent dans l'en-tête du mini-jeu, entre le nom de la potion et ⏸️ 🏳️ 🔊 : un seul bandeau en haut */
    (function(){
      var hote = E.racine.closest && E.racine.closest('.mj'), tete = hote && hote.querySelector('.mj-tete'), titres = tete && tete.querySelector('.mj-titres');
      if(!tete || !E.vies) return;
      tete.insertBefore(E.vies, titres ? titres.nextSibling : tete.firstChild);
      stops.push(function(){ if(E.vies.parentNode) E.vies.parentNode.removeChild(E.vies); });
    })();
    majVies();

    /* --- bûches --- */
    function majBuches(){
      E.buches.forEach(function(b, i){ b.style.display = i < S.L ? '' : 'none'; b.classList.toggle('brule', i === S.L - 1); });
      /* le feu grandit avec le bois (dessiné à sa taille pour 3 bûches) ; sa lumière sur les murs aussi (--feu, mj-chaudron.css) */
      var echF = 'scale(' + (S.L ? Math.min(1.22, 0.58 + S.L * 0.14) : 0).toFixed(2) + ',' + (S.L ? Math.min(1.38, 0.43 + S.L * 0.19) : 0).toFixed(2) + ')';
      E.flammes.forEach(function(g){ g.style.transform = echF; });
      E.lueur.style.opacity = (S.L ? Math.min(1, 0.3 + S.L * 0.18) : 0).toFixed(2);
      E.racine.style.setProperty('--feu', (S.L ? Math.min(1, 0.28 + S.L * 0.175) : 0).toFixed(2));
      E.racine.setAttribute('data-buches', S.L);
      E.racine.classList.toggle('mjc-bois-vite', S.L <= 1);   /* presque plus de bois : l'icône « remettre du bois » brille */
      E.racine.classList.toggle('mjc-bois-fleche', !!R.aideTuto && S.L <= 1 && !S.fini);   /* (le tutoriel : la flèche rouge arrive, et repart dès 2 bûches) */
    }
    majBuches();
    function bulle(html, cls){
      E.bulle.innerHTML = html; E.bulle.className = 'mjc-bulle ' + (cls || ''); E.bulle.hidden = false;
      E.bulle.style.animation = 'none'; void E.bulle.offsetWidth; E.bulle.style.animation = '';
      clearTimeout(S.bulleT); S.bulleT = apres(1300, function(){ E.bulle.hidden = true; });
    }
    /* une bûche de plus : la barre monte (un petit coup de chaud tout de suite, puis le feu chauffe plus) ; 6 au plus */
    function ajouterBuche(){
      if(S.fini || S.termine) return;
      if(S.L >= MAX_BUCHES){
        A.tic(); bulle('<b>🪵 Plein !</b>');
        if(E.tas && E.tas.animate) E.tas.animate([{transform:'translateX(-4px)'}, {transform:'translateX(4px)'}, {transform:'none'}], {duration:220});
        return;
      }
      if(!S.L) S.braise = 0;
      S.L++;
      S.v += FEU_COUP;
      A.tock(); apres(280, function(){ A.crepite(); });
      /* la bûche arrive de la réserve (à gauche) et se pose à sa place dans le feu */
      var nb = E.buches[S.L - 1];
      if(nb){
        /* une bûche neuve : ni noircie ni rougeoyante (elle avait gardé l'allure de celle qui s'était consumée à sa place) */
        var c0 = nb.querySelector('.mjc-charbon'), e0 = nb.querySelector('.mjc-ember');
        if(c0) c0.setAttribute('opacity', '0'); if(e0) e0.setAttribute('opacity', '0');
        avant['ch' + S.L] = avant['em' + S.L] = undefined;
      }
      if(nb && nb.animate) nb.animate([{transform:'translate(-130px,-70px) rotate(-18deg)', opacity:0}, {transform:'none', opacity:1}], {duration:300, easing:'ease-out'});
      majBuches();
      bulle('<b>🪵 +1 🔥</b>');
    }
    /* (essais seulement : on ne retire plus de bûche dans le jeu) */
    function retirerBuche(){
      if(S.fini || S.L <= 0) return;
      S.L--; majBuches();
    }

    /* --- verser un ingrédient --- */
    /* on verse l'ingrédient dont le carré est dans la zone 🍲 ; sinon (mauvais, trop tôt) : une erreur d'ingrédient */
    function verser(ingr, btn){
      if(S.fini || S.termine) return;
      if(S.finale || S.fen.every(function(f){ return f.fait; })){
        /* tout est versé : il reste à finir la potion (pas une erreur) */
        if(btn && btn.animate) btn.animate([{transform:'translateX(-4px)'}, {transform:'translateX(4px)'}, {transform:'none'}], {duration:200});
        bulle('<b>🎯 ' + esc(E.Zi.grand) + '</b>', 'cible');
        return;
      }
      /* on ne verse que si la température est dans le VERT : sinon rien n'est versé, pas de cœur perdu, une petite bulle */
      if(!dans(S.h, 'vert', Z)){
        if(btn && btn.animate) btn.animate([{transform:'translateX(-5px)'}, {transform:'translateX(5px)'}, {transform:'none'}], {duration:240});
        A.tic(); montrerOups('🌡️ Remets le chaudron dans le vert !', btn || E.zoneF, 'doux');
        return;
      }
      var dz = S.fen.filter(dansZone);
      var bonne = dz.filter(function(f){ return f.ingr === ingr; })[0];
      if(!bonne){
        /* un carré est allumé, mais ce n'est pas lui : mauvais ingrédient ; aucun carré allumé : trop tôt (une erreur aussi) */
        if(dz.length) erreur('mauvais', btn, dz[0].ingr);
        else erreur('tot', btn, ingr);
        return;
      }
      bonne.fait = true; bonne.verse = true;
      bonne.el.classList.add('fait'); majRecette();
      if(stock && stock[ingr] > 0) stock[ingr]--;
      /* le crochet de l'atelier (stock des rangements, oreilles de Mimi) : seulement le bon ingrédient, au moment où on le verse */
      if(R.onVerse) try{ R.onVerse(ingr); }catch(e){}
      chute(ingr, btn);
      S.v += (CHOCS[ingr] || 0) * R.chocs * 1.6;
      var z = zoneDe(S.h, Z);
      if(z === 'arc-en-ciel'){ S.etoiles++; bulle('<b>⭐ Parfait !</b>', 'ae'); apres(560, function(){ A.etoile(); }); }
      else if(z === 'vert'){ S.etoiles++; bulle('<b>✔</b>'); }
      else bulle('<b>✔</b>');
      if(S.fen.every(function(f){ return f.fait; })) apres(600, lancerFinale);
    }
    function chute(ingr, btn){
      var x = I[ingr] || {ic:'❔'}, g = U.html('<span class="mjc-tombe">' + icDe(ingr, x) + '</span>'), sc = E.scene.getBoundingClientRect(), arr = versEl(E, CX, CY, E.scene);
      var depart = btn ? btn.getBoundingClientRect() : {left:sc.left + arr.x, top:sc.top, width:0, height:0};
      var x0 = depart.left + depart.width / 2 - sc.left, y0 = depart.top + depart.height / 2 - sc.top;
      g.style.left = x0 + 'px'; g.style.top = y0 + 'px';
      E.scene.appendChild(g);
      var dx = arr.x - x0, dy = arr.y - y0;
      if(g.animate) g.animate([{transform:'translate(-50%,-50%)'}, {transform:'translate(calc(-50% + ' + dx * 0.5 + 'px), calc(-50% + ' + (dy * 0.5 - 40) + 'px)) scale(1.1)', offset:0.45}, {transform:'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.4)', opacity:0.6}], {duration:520, easing:'ease-in', fill:'forwards'});
      apres(520, function(){
        g.remove();
        A.plouf();
        var p = U.html('<span class="mjc-plouf"><i></i><i></i><i></i><i></i><i></i></span>');
        p.style.left = arr.x + 'px'; p.style.top = arr.y + 'px';
        E.scene.appendChild(p);
        apres(700, function(){ p.remove(); });
      });
    }
    /* Une erreur d'ingrédient : l'écran tremble (et rougit), une flèche dit pourquoi, −1 cœur.
       Règle des cœurs : sans cœur, cette erreur fait perdre ; le dernier cœur perdu, on prévient. */
    var OUPS = {
      mauvais:'Attention, ce n\'était pas le bon ingrédient !',
      tot:'Attention, attends qu\'un carré s\'allume dans la zone !',
      oubli:'Trop tard ! Le carré est sorti de la zone.'
    };
    function erreur(raison, btn, ingr){
      if(S.fini || S.termine) return;
      S.erreurs++;
      A.erreur(); U.vibrer([80, 40, 80]);
      if(btn && btn.animate) btn.animate([{transform:'translateX(-7px)'}, {transform:'translateX(7px)'}, {transform:'translateX(-4px)'}, {transform:'none'}], {duration:300});
      ecranRouge();
      montrerOups(OUPS[raison] || OUPS.mauvais, btn || E.zoneF);
      if(S.vies <= 0){ echec(raison, ingr); return; }
      S.vies--; majVies(true);
      /* « Plus de cœur » : à la même place que la phrase d'erreur (qui s'en va), en haut de la scène, jamais sur la recette ni les caisses */
      if(S.vies === 0) apres(1500, function(){ if(E.oups) E.oups.hidden = true; U.plusDeCoeur(E.racine, {sous:E.racine.querySelector('.mjc-haut'), aGauche:E.scene.querySelector('.mjc-jauge')}); });
    }
    function ecranRouge(){
      var o = E.err; if(!o) return;
      o.hidden = false; o.style.animation = 'none'; void o.offsetWidth; o.style.animation = '';
      E.racine.classList.remove('mjc-tremble'); void E.racine.offsetWidth; E.racine.classList.add('mjc-tremble');
      clearTimeout(S.errT); S.errT = setTimeout(function(){ o.hidden = true; E.racine.classList.remove('mjc-tremble'); }, 900); timers.push(S.errT);
    }
    /* la phrase de l'erreur, avec son 🔊. Toujours EN HAUT DE LA SCÈNE, sous les caisses, à gauche de la jauge (Romain, 8 novembre :
       au niveau 10, « Trop tard ! » se posait sur la rangée des caisses et empêchait de verser le suivant). La flèche montre la caisse
       touchée ; sans caisse (un carré oublié), pas de flèche. */
    function montrerOups(txt, cible, cls){
      var o = E.oups; if(!o) return;
      o.innerHTML = '<b>' + esc(txt) + '</b>';
      o.appendChild(MJ.boutonLire(txt));
      o.hidden = false; o.classList.remove('haut'); o.classList.toggle('doux', cls === 'doux');
      var caisse = cible && cible.closest && cible.closest('.mjc-boites') ? cible : null;
      o.classList.toggle('sans-fleche', !caisse);
      var rr = E.racine.getBoundingClientRect(), rs = E.scene.getBoundingClientRect();
      var jg = E.scene.querySelector('.mjc-jauge'), rj = jg && jg.getBoundingClientRect();
      var droite = rj && rj.width ? rj.left - rr.left - 4 : rr.width - 8;   /* jusqu'à la jauge, sans la cacher */
      var w = Math.max(160, Math.min(droite - 8, 320));
      var cx = caisse ? (function(rc){ return rc.left + rc.width / 2 - rr.left; })(caisse.getBoundingClientRect()) : droite / 2;
      var x = U.borne(cx - w / 2, 8, Math.max(8, droite - w));
      o.style.width = w + 'px'; o.style.left = x + 'px'; o.style.top = (rs.top - rr.top + (caisse ? 16 : 8)) + 'px';
      o.style.setProperty('--ax', Math.round(U.borne(cx - x, 18, w - 18)) + 'px');
      o.style.animation = 'none'; void o.offsetWidth; o.style.animation = '';
      clearTimeout(S.oupsT); S.oupsT = setTimeout(function(){ o.hidden = true; }, 2600); timers.push(S.oupsT);
    }
    /* (niveaux 3+) un carré sorti de la zone sans qu'on le verse : oublié, une erreur (−1 cœur).
       Avant, il comptait comme fait : on pouvait tout laisser passer, perdre ses cœurs et réussir la potion sans rien y mettre.
       Maintenant (Romain, 5 novembre, 12 h 31) la frise repart de lui : il revient, avec tous ceux d'après (ceux déjà versés restent versés),
       et la frise défile plus vite pour que la partie ne dure pas plus longtemps que prévu (au plus 1,7 fois plus vite). */
    var VITESSE_MAX = 1.7;
    function manquee(f){
      erreur('oubli', null, f.ingr);
      if(S.fini || S.termine) return;
      var i0 = S.fen.indexOf(f), decale = (S.tf + 0.9) - f.a;
      for(var i = i0; i < S.fen.length; i++){ var x = S.fen[i]; if(x.fait) continue; x.a += decale; x.fige = false; x.z = false; x.el.classList.remove('zone', 'rate'); }
      if(S.finReelle === undefined) S.finReelle = S.planApres + R.fenetre;   /* (la fin prévue de la frise, en secondes de jeu) */
      var der = S.fen[S.fen.length - 1], reste = der.a + R.fenetre - S.tf, budget = Math.max(reste / VITESSE_MAX, S.finReelle - S.t);
      S.vitesse = U.borne(reste / Math.max(budget, 0.1), 1, VITESSE_MAX);
      f.el.classList.remove('revient'); void f.el.offsetWidth; f.el.classList.add('revient');
      majRecette();
    }
    /* tous les ingrédients sont passés : la fiole se remplit tant que la potion est dans sa zone */
    function lancerFinale(){
      if(S.finale || S.termine) return;
      var d = U.html('<div class="mjc-ing mjc-ing-fin' + (cible === 'arc-en-ciel' ? ' ae' : '') + (R.finaleMax ? ' limite' : '') + '" style="--c:' + E.Zi.c + '"><i>🧪</i><b class="mjc-tenue"></b><u class="mjc-limite"></u></div>');
      E.piste.appendChild(d);
      var cpt = U.html('<span class="mjc-compte">⏳ ' + Math.round(R.finaleMax) + ' s</span>');
      E.zoneF.appendChild(cpt);
      S.finale = {t0:S.t, el:d, barre:d.querySelector('.mjc-tenue'), lim:d.querySelector('.mjc-limite'), cpt:cpt};
      E.racine.classList.remove('mjc-verrou');
      E.racine.classList.add('mjc-phase-fin');
      E.zoneF.style.setProperty('--c', E.Zi.c);
      E.racine.classList.remove('mjc-sans-cible'); E.racine.classList.add('mjc-cible-apparait');   /* hop : la zone apparaît sur la jauge */
      if(R.aideTuto) E.racine.classList.add('mjc-fin-guidee');   /* niveau 1 : la frise se vide, la grosse flèche rouge montre la zone */
      E.recItems.forEach(function(el){ el.classList.remove('ici'); });
      var rf = E.racine.querySelector('.mjc-rec-fin'); if(rf) rf.classList.add('ici');
      bulle('<b>🎯 ' + esc(E.Zi.grand) + '</b>', 'cible');
    }

    /* --- touiller --- */
    function versSvg(ev){
      var m = E.svg.getScreenCTM(); if(!m) return {x:0, y:0};
      var p = E.svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
      var r = p.matrixTransform(m.inverse()); return {x:r.x, y:r.y};
    }
    function angle(p){ return Math.atan2((p.y - CY) / SINA, p.x - CX); }
    ecoute(E.svg, 'pointerdown', function(e){
      if(S.fini) return;
      var a = e.target.closest('[data-act]');
      if(a){
        e.preventDefault();
        if(a.getAttribute('data-act') === 'bois') ajouterBuche(); else retirerBuche();
        return;
      }
      var p = versSvg(e);
      if(Math.pow((p.x - CX) / 160, 2) + Math.pow((p.y - (CY - 30)) / 110, 2) > 1) return;
      e.preventDefault();
      S.tient = e.pointerId; S.doigt = angle(p); S.theta = S.theta + wrap(S.doigt - S.theta);
      E.racine.classList.add('mjc-touille');
    });
    /* (23 novembre) la réserve de bois est un dessin à part, posé dans le décor : on la touche pour ajouter une bûche */
    if(E.tas) ecoute(E.tas, 'pointerdown', function(e){ if(S.fini) return; e.preventDefault(); ajouterBuche(); });
    ecoute(window, 'pointermove', function(e){ if(S.tient === e.pointerId) S.doigt = angle(versSvg(e)); });
    function lacher(e){ if(S.tient === e.pointerId){ S.tient = null; E.racine.classList.remove('mjc-touille'); } }
    ecoute(window, 'pointerup', lacher);
    ecoute(window, 'pointercancel', lacher);
    ecoute(E.boites, 'pointerdown', function(e){
      var b = e.target.closest('.mjc-boite');
      if(!b) return;
      e.preventDefault();
      b.classList.remove('appui'); void b.offsetWidth; b.classList.add('appui');
      A.tic();
      verser(b.getAttribute('data-ingr'), b);
    });

    /* --- fin de partie --- */
    function finir(res, ms){
      S.fini = true; E.racine.classList.remove('mjc-bois-fleche');
      res.erreurs = S.erreurs;
      res.reste = stock;
      apres2(ms, function(){
        /* les messages d'erreur ne restent pas sous l'écran du résultat */
        if(E.oups) E.oups.hidden = true;
        var hote = E.racine.closest && (E.racine.closest('.mj-zone') || E.racine.closest('.mj')), pc = hote && hote.querySelector('.mj-plus-coeur');
        if(pc && pc.parentNode) pc.parentNode.removeChild(pc);
        fin(res);
      });
    }
    function apres2(ms, f){ var x = setTimeout(f, ms); timers.push(x); }
    function echec(raison, ingr){
      if(S.termine) return;
      S.termine = true;
      E.bulle.hidden = true;
      var deTrop = 'Plus de cœur : c\'était l\'erreur de trop. ';
      var M = {
        boum:['Boum ! Ça a explosé', 'Trop chaud : la potion a explosé. Touille pour la refroidir, et pas trop de bois !', 'boum'],
        gel:['La potion a gelé', 'Trop froid : il n\'y avait plus assez de bois. Remets une bûche quand l\'icône brille !', 'gel'],
        mauvais:['Mauvais ingrédient !', deTrop + (ingr && I[ingr] ? 'Il fallait ' + I[ingr].ic + ' ' + I[ingr].nom + '.' : 'Suis la recette à la lettre.'), 'rate'],
        tot:['Pas encore !', deTrop + 'Il faut attendre que le carré de l\'ingrédient soit dans la zone.', 'rate'],
        oubli:['Trop tard !', deTrop + 'Il fallait verser ' + (ingr && I[ingr] ? I[ingr].ic + ' ' + I[ingr].nom : 'l\'ingrédient') + ' quand son carré était dans la zone.', 'rate'],
        pasPris:['La potion n\'a pas pris', 'Il fallait garder la potion dans la zone ' + E.Zi.nom + ' jusqu\'à ce que la fiole se remplisse.', 'rate']
      }[raison] || ['Raté…', '', 'rate'];
      A.calme();
      if(M[2] === 'boum') A.boum(); else if(M[2] === 'gel') A.gel(); else if(M[2] === 'eteint') A.pschitt(); else A.rate();
      E.racine.classList.add('mjc-fin-' + M[2]);
      E.fin.hidden = false;
      E.fin.className = 'mjc-fin ' + M[2];
      E.fin.innerHTML = (M[2] === 'boum' ? '<i class="mjc-eclair"></i><span class="mjc-debris">' + new Array(10).join('<i></i>') + '</span><i class="mjc-fumee"></i><i class="mjc-fumee f2"></i>' :
        M[2] === 'gel' ? '<i class="mjc-glace"></i><span class="mjc-cristaux">❄️ ❄️ ❄️</span>' :
        M[2] === 'eteint' ? '<i class="mjc-fumee grise"></i><i class="mjc-fumee grise f2"></i>' : '<i class="mjc-fumee grise"></i>') +
        '<b class="mjc-fin-txt">' + esc(M[0]) + '</b>';
      finir({reussi:false, message:M[0], detail:M[1], score:0, raison:raison}, 1900);
    }
    function reussir(){
      if(S.termine) return;
      S.termine = true;
      E.bulle.hidden = true;
      E.racine.classList.add('mjc-fin-ok');
      E.fin.hidden = false;
      E.fin.className = 'mjc-fin ok';
      E.fin.style.setProperty('--c', E.Zi.c);
      E.fin.innerHTML = '<span class="mjc-halo-ok"></span><span class="mjc-fiole"><svg viewBox="0 0 80 110"><path d="M30,8 H50 V30 C72,40 74,86 40,100 C6,86 8,40 30,30 Z" fill="rgba(255,255,255,.18)" stroke="' + K + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<clipPath id="mjcf' + E.id + '"><path d="M30,8 H50 V30 C72,40 74,86 40,100 C6,86 8,40 30,30 Z"/></clipPath><rect class="mjc-fiole-niv" clip-path="url(#mjcf' + E.id + ')" x="0" y="0" width="80" height="110" fill="' + (cible === 'arc-en-ciel' ? 'url(#mjca' + E.id + ')' : E.Zi.c) + '"/>' +
        '<rect x="28" y="2" width="24" height="10" rx="3" fill="#c58a4a" stroke="' + K + '" stroke-width="3"/><path d="M22,48 C18,60 18,74 24,84" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/></svg></span>' +
        '<span class="mjc-etoiles">' + new Array(13).join('<i></i>') + '</span><b class="mjc-fin-txt">Potion réussie !</b>';
      A.calme(); A.succes();
      var det = '⭐ ' + S.etoiles + ' sur ' + total + ' ingrédient' + (total > 1 ? 's' : '') + ' versé' + (total > 1 ? 's' : '') + ' dans le vert' + (S.erreurs ? ' · ' + S.erreurs + ' erreur' + (S.erreurs > 1 ? 's' : '') : '') + '.';
      finir({reussi:true, message:'Potion réussie !', detail:det, score:total ? S.etoiles / total : 1, raison:'ok'}, 2200);
    }

    /* --- la boucle --- */
    var avant = {coul:'', zone:'', curseur:-1, indice:'', bois:false, danger:''};
    function pasBoucle(dt){
      if(S.fini) return false;
      if(S.pause){ rendu(dt); return true; }
      S.t += dt;
      /* le bois se consume (vite, à tous les niveaux) */
      if(S.L > 0){ S.braise += dt; if(S.braise >= R.combustion){ S.braise -= R.combustion; S.L--; majBuches(); } }
      /* la louche (elle s'arrête vite quand on la lâche : c'est la barre qui a de l'inertie) */
      if(S.tient !== null && S.doigt !== null){
        var d = wrap(S.doigt - S.theta);
        S.theta += d;
        S.omega += (d / Math.max(dt, 0.008) - S.omega) * Math.min(1, dt * 10);
      } else {
        S.theta += S.omega * dt;
        S.omega *= Math.exp(-dt / 0.25);
      }
      S.omega = U.borne(S.omega, -16, 16);
      /* la température : le feu la fait monter (plus il y a de bûches, plus vite), touiller (dans un sens ou dans l'autre)
         la fait descendre ; la barre suit avec de l'inertie (R.tau, plus forte aux niveaux hauts) */
      var cibleV = FEU_K * S.L * (R.mods && R.mods.lent > 0 ? R.mods.lent : 1) - FROID - TOUILLE * Math.abs(S.omega) / (2 * Math.PI);
      S.v += (cibleV - S.v) * (1 - Math.exp(-dt / R.tau));
      S.h += S.v * dt;
      if(S.h >= 100){ S.h = 100; rendu(dt); echec('boum'); return false; }
      if(S.h <= 0){ S.h = 0; rendu(dt); echec('gel'); return false; }
      /* la frise : niveaux 1-2, elle attend que le carré dans la zone soit versé ; sinon, un carré sorti est oublié */
      S.tf += dt * (S.vitesse || 1);   /* (plus vite après un ingrédient oublié : manquee) */
      var nx = prochain();
      if(R.attend && nx){ var st = arretDe(nx); if(S.tf > st) S.tf = Math.max(st, S.tf - dt); }
      if(!R.attend){
        for(var i = 0; i < S.fen.length; i++){
          var f = S.fen[i];
          if(!f.fait && S.tf > f.a && posL(f) + G.sq < G.zl + 6){ manquee(f); if(S.termine){ rendu(dt); return false; } }
        }
      }
      if(S.finale){
        if(dansFin(S.h)) S.tenue += dt; else S.tenue = Math.max(0, S.tenue - dt);
        if(S.tenue >= tenueFin){ rendu(dt); reussir(); return false; }
        if(R.finaleMax && S.t - S.finale.t0 > R.finaleMax){ rendu(dt); echec('pasPris'); return false; }
      }
      sonsImage(dt);
      rendu(dt);
      return true;
    }
    /* sons de chaque image et alertes douces (pas trop insistantes) */
    var alerte = {danger:'', tZone:-99, feu:'', tFeu:-99};
    /* tout en haut de la jauge, ça va exploser ; tout en bas, ça va geler */
    function danger(){ return S.h >= Z.bouillant[0] ? 'chaud' : (S.h <= Z.violet[1] ? 'froid' : ''); }
    function sonsImage(dt){
      A.maj(dt, S.omega, S.h, true);
      var dg = danger();
      if(dg && dg !== alerte.danger && S.t - alerte.tZone > 3){ A.alerte(); alerte.tZone = S.t; }
      alerte.danger = dg;
      var feu = S.L <= 1 ? 'bas' : '';
      if(feu && (feu !== alerte.feu || S.t - alerte.tFeu > 8)){ A.feuBas(); alerte.tFeu = S.t; }
      alerte.feu = feu;
    }
    /* n'écrit dans le DOM que ce qui a changé (tablettes modestes) */
    function pose(cle, el, prop, val){ if(avant[cle] !== val){ avant[cle] = val; if(prop.charAt(0) === '@') el.setAttribute(prop.slice(1), val); else el.style[prop] = val; } }
    function rendu(){
      if(Math.abs(S.theta - (avant.theta === undefined ? 1e9 : avant.theta)) > 0.003){ avant.theta = S.theta; dessinerLouche(E, S.theta); }
      var hr = Math.round(S.h * 2) / 2;
      if(hr !== avant.curseur){
        avant.curseur = hr;
        E.liq.style.fill = couleur(S.h, Z);
        E.curseur.style.bottom = S.h.toFixed(1) + '%';
        if(R.revele) E.curseur.firstChild.textContent = Math.round(S.h);
      }
      var z = zoneDe(S.h, Z);
      if(z !== avant.zone){
        if(avant.zone) E.racine.classList.remove('mjc-z-' + avant.zone);
        E.racine.classList.add('mjc-z-' + z);
        avant.zone = z; S.zone = z;
      }
      pose('givre', E.givre, 'opacity', U.borne(1 - S.h / Math.max(1, Z.violet[1]), 0, 1).toFixed(1));
      pose('vapeur', E.vapeur, 'opacity', U.borne((S.h - Z.vert[0]) / (100 - Z.vert[0]), 0, 1).toFixed(1));
      /* braise de la bûche qui brûle */
      var bl = E.buches[S.L - 1];
      if(bl){
        var pr = S.braise / R.combustion;
        if(!bl._ch){ bl._ch = bl.querySelector('.mjc-charbon'); bl._em = bl.querySelector('.mjc-ember'); }
        pose('ch' + S.L, bl._ch, '@opacity', (pr * 0.75).toFixed(1));
        pose('em' + S.L, bl._em, '@opacity', (0.3 + pr * 0.7).toFixed(1));
      }
      /* la frise défile : chaque carré avance vers la zone 🍲 ; versé, il s'efface sur place */
      var dus = {}, pret = false;
      S.fen.forEach(function(f){
        if(!f.fige){
          f.el.style.transform = 'translateX(' + Math.round(posL(f)) + 'px)';
          if(f.verse) f.fige = true;
        }
        var z = dansZone(f);
        if(z){ dus[f.ingr] = 1; pret = true; }
        if(z !== !!f.z){ f.z = z; f.el.classList.toggle('zone', z); }
      });
      if(pret !== !!avant.pret){ avant.pret = pret; E.zoneF.classList.toggle('pret', pret); }
      /* la petite flèche : le prochain carré à verser (niveaux 1 à 3) */
      var nx = R.fleche && !S.finale ? prochain() : null, fx = nx ? posL(nx) + G.sq / 2 : -99;
      if(nx && fx < G.w + 12){
        if(E.flNext.hidden) E.flNext.hidden = false;
        E.flNext.style.transform = 'translateX(' + Math.round(fx) + 'px)';
      } else if(!E.flNext.hidden) E.flNext.hidden = true;
      if(S.finale){
        S.finale.el.style.transform = 'translateX(' + Math.round((G.zl + G.zr) / 2 - G.sq / 2) + 'px)';
        pose('barre', S.finale.barre, 'transform', 'scaleX(' + U.borne(S.tenue / tenueFin, 0, 1).toFixed(2) + ')');
        if(R.finaleMax) pose('lim', S.finale.lim, 'transform', 'scaleX(' + U.borne(1 - (S.t - S.finale.t0) / R.finaleMax, 0, 1).toFixed(2) + ')');
        S.finale.el.classList.toggle('dedans', dansFin(S.h));
        /* le compte à rebours, calme : les secondes qui restent (orange dans les 10 dernières) */
        var rest = Math.max(0, Math.ceil(R.finaleMax - (S.t - S.finale.t0)));
        if(rest !== avant.compte){ avant.compte = rest; S.finale.cpt.textContent = '⏳ ' + rest + ' s'; S.finale.cpt.classList.toggle('vite', rest <= 10); }
      }
      /* l'aide : la bonne caisse brille quand son carré est dans la zone */
      if(R.aide) E.boites.querySelectorAll('.mjc-boite').forEach(function(b){ b.classList.toggle('due', !!dus[b.getAttribute('data-ingr')]); });
      /* pendant les ingrédients, hors du vert : les pots sont verrouillés (grisés, 🌡️) et la bande verte de la jauge pulse */
      var verrou = !S.finale && !S.termine && !dans(S.h, 'vert', Z);
      if(verrou !== !!avant.verrou){ avant.verrou = verrou; E.racine.classList.toggle('mjc-verrou', verrou); }
      /* près du haut : ça bout à gros bouillons et le chaudron tremble ; près du bas : ça gèle */
      var dg = danger();
      if(dg !== avant.danger){
        avant.danger = dg;
        E.racine.classList.toggle('mjc-bout', dg === 'chaud');
        E.racine.classList.toggle('mjc-gele', dg === 'froid');
        if(dg){ E.danger.innerHTML = dg === 'chaud' ? '🌋 Ça va exploser !' : '🧊 Ça va geler !'; E.danger.className = 'mjc-danger ' + dg; E.danger.hidden = false; }
        else E.danger.hidden = true;
      }
      /* indices : touiller quand ça monte trop ; remettre du bois quand ça descend trop */
      if(R.indices){
        /* pendant les ingrédients, pas de zone : on montre seulement quand ça devient trop chaud ou trop froid */
        var ref = S.finale ? S.zFin : Z.vert, ind = '';   /* pendant les ingrédients : revenir dans le vert pour pouvoir verser */
        if(S.h > ref[1] - 1.5 && S.v > -1) ind = 'refroidit';
        else if(S.h < ref[0] + 1.5 && S.v < 1) ind = 'bois';
        if(ind !== avant.indice){
          E.racine.classList.toggle('mjc-indice-refroidit', ind === 'refroidit');
          E.racine.classList.toggle('mjc-indice-bois', ind === 'bois');
          avant.indice = ind;
        }
      }
    }
    rendu(0);
    var arret = U.boucle(pasBoucle);
    S.api = {
      pause:function(b){ S.pause = !!b; if(b) A.calme(); },
      chaleur:function(h){ S.h = h; S.v = 0; avant.curseur = -1; rendu(0); },
      vitesse:function(v){ S.v = v; },
      angle:function(a){ S.theta = a; S.omega = 0; rendu(0); },
      buches:function(n){ S.L = U.borne(n, 0, MAX_BUCHES); majBuches(); },
      verser:function(ingr){ verser(ingr, E.boites.querySelector('[data-ingr="' + ingr + '"]')); },
      dansZone:function(){ return S.fen.filter(dansZone).map(function(f){ return f.ingr; }); },
      ajouterBuche:ajouterBuche, retirerBuche:retirerBuche
    };
    return {arreter:function(){
      S.fini = true; E.racine.classList.remove('mjc-bois-fleche');
      A.couper();
      arret();
      stops.forEach(function(f){ try{ f(); }catch(e){} });
      timers.forEach(clearTimeout);
    }};
  }
});
})();
