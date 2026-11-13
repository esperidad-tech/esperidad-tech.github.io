/* ==========================================================
   Brumeval v2 — moteur, partie 1 : outils, sons, voix,
   sauvegarde, effets (talents/objets/potions), codes.
   Espace de noms partagé : window.M
   ========================================================== */
(function(){
'use strict';
var M = window.M = window.M || {};
var D = window.DONNEES;

/* ---------- Outils ---------- */
M.esc = function(s){ return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
M.nettoyer = function(t){ return String(t || '').replace(/<[^>]+>/g, ' ').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B50}\u{2B06}\u{2194}-\u{21FF}]/gu, '').replace(/\s+/g, ' ').trim(); };
M.cle = function(o){ return Object.keys(o || {}); };
M.copie = function(o){ return JSON.parse(JSON.stringify(o)); };
/* Générateur pseudo-aléatoire déterministe (mêmes codes sur toutes les tablettes) */
M.alea = function(graine){
  var s = graine >>> 0 || 1;
  return function(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
};

/* ---------- Sons (WebAudio, synthétisés) ---------- */
var ctx = null;
function audio(){
  if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ ctx = null; } }
  if(ctx && ctx.state === 'suspended') try{ ctx.resume(); }catch(e){}
  return ctx;
}
function note(f, t0, duree, type, vol, glisse){
  var a = audio(); if(!a) return;
  var o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, a.currentTime + t0);
  if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, a.currentTime + t0 + duree);
  g.gain.setValueAtTime(0.0001, a.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, a.currentTime + t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + duree);
  o.connect(g); g.connect(a.destination);
  o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + duree + 0.05);
}
function bruit(t0, duree, vol, passe){
  var a = audio(); if(!a) return;
  var n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = passe || 1800;
  s.buffer = buf; g.gain.value = vol || 0.08;
  s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + t0);
}
/* Une note douce : attaque arrondie (pas de clic), fin en fondu ; un triangle passe par un filtre (son chaud, sans aigus durs) */
function tendre(f, t0, duree, vol, glisse, att, type, filtre){
  var a = audio(); if(!a) return;
  var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain(), sortie = g;
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, t);
  if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
  sortie.connect(a.destination);
  o.start(t); o.stop(t + duree + 0.03);
}
/* Une page de papier qu'on tourne (Grand Livre, livre.js) : un souffle doux qui monte puis retombe (bruit filtré),
   un léger froissement (petits grains secs), et la page qui se pose. Environ 0,35 s, tout doux. */
function feuille(){
  var a = audio(); if(!a) return;
  var t = a.currentTime + 0.01, sr = a.sampleRate, dur = 0.36, n = Math.floor(sr * dur);
  function tampon(remplir){ var b = a.createBuffer(1, n, sr); remplir(b.getChannelData(0)); var s = a.createBufferSource(); s.buffer = b; return s; }
  /* le souffle */
  var s1 = tampon(function(d){ for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; });
  var f1 = a.createBiquadFilter(), g1 = a.createGain();
  f1.type = 'bandpass'; f1.Q.value = 0.8;
  f1.frequency.setValueAtTime(700, t); f1.frequency.exponentialRampToValueAtTime(2600, t + 0.15); f1.frequency.exponentialRampToValueAtTime(1100, t + 0.34);
  g1.gain.setValueAtTime(0.0001, t); g1.gain.exponentialRampToValueAtTime(0.05, t + 0.08); g1.gain.exponentialRampToValueAtTime(0.03, t + 0.2); g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  s1.connect(f1); f1.connect(g1); g1.connect(a.destination);
  /* le froissement : des grains de 1 à 4 ms, surtout au milieu du geste */
  var s2 = tampon(function(d){
    for(var k = 0; k < 26; k++){
      var c = Math.floor(n * (0.08 + 0.7 * Math.pow(Math.random(), 1.3))), l = Math.floor(sr * (0.001 + Math.random() * 0.003)), v = 0.35 + Math.random() * 0.65;
      for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random() * 2 - 1) * v * (1 - j / l);
    }
  });
  var f2 = a.createBiquadFilter(), g2 = a.createGain();
  f2.type = 'highpass'; f2.frequency.value = 2800; g2.gain.value = 0.028;
  s2.connect(f2); f2.connect(g2); g2.connect(a.destination);
  /* la page qui se pose */
  var s3 = tampon(function(d){ var m = Math.floor(sr * 0.07); for(var i = 0; i < m; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / m); });
  var f3 = a.createBiquadFilter(), g3 = a.createGain();
  f3.type = 'lowpass'; f3.frequency.value = 520; g3.gain.value = 0.06;
  s3.connect(f3); f3.connect(g3); g3.connect(a.destination);
  s1.start(t); s2.start(t); s3.start(t + 0.26);
  s1.stop(t + dur); s2.stop(t + dur); s3.stop(t + 0.26 + dur);
}
/* Un petit nuage de fumée (le 🤥 du Barde qui s'évapore, Romain, 5 novembre, 21 h 46) : un souffle très doux, à peine audible,
   qui descend (bruit filtré), un peu moins d'une demi-seconde. */
function fumee(){
  var a = audio(); if(!a) return;
  var t = a.currentTime + 0.01, sr = a.sampleRate, dur = 0.5, n = Math.floor(sr * dur);
  var b = a.createBuffer(1, n, sr), d = b.getChannelData(0);
  for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  var s = a.createBufferSource(); s.buffer = b;
  var f = a.createBiquadFilter(), g = a.createGain();
  f.type = 'bandpass'; f.Q.value = 0.7;
  f.frequency.setValueAtTime(1900, t); f.frequency.exponentialRampToValueAtTime(520, t + 0.46);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.022, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
  s.connect(f); f.connect(g); g.connect(a.destination);
  s.start(t); s.stop(t + dur);
}
var SONS = {
  fumee:fumee,   /* le 🤥 qui part en fumée */
  clic:function(){ tendre(523, 0, .055, .045, 440, .005); },   /* un « toc » tout doux */
  ok:function(){ note(660, 0, .1, 'triangle', .1); note(990, .08, .14, 'triangle', .1); },
  ko:function(){ tendre(330, 0, .13, .06, 294, .01, 'triangle', 1100); tendre(247, .1, .2, .055, 220, .01, 'triangle', 900); },   /* deux notes qui descendent : « non » */
  gain:function(){ [784, 988, 1175, 1568].forEach(function(f, i){ note(f, i * .07, .16, 'triangle', .09); }); },
  magie:function(){ [523, 659, 784, 1047, 1319].forEach(function(f, i){ note(f, i * .06, .3, 'sine', .07); }); },
  pas:function(){ tendre(240, 0, .08, .055, 160, .006); tendre(225, .15, .08, .05, 150, .006); },   /* deux pas feutrés */
  fleche:function(){ note(1200, 0, .18, 'sine', .05, 300); bruit(0, .12, .04, 3000); },
  bulle:function(){ note(500, 0, .12, 'sine', .08, 900); },
  plouf:function(){ note(700, 0, .2, 'sine', .08, 200); bruit(.02, .15, .03, 1200); },
  tic:function(){ tendre(988, 0, .035, .022, 880, .003); },   /* un tic très léger */
  victoire:function(){ [523, 659, 784, 1047].forEach(function(f, i){ note(f, i * .11, .25, 'triangle', .11); }); note(1319, .5, .5, 'triangle', .1); },
  echec:function(){ note(392, 0, .2, 'triangle', .08); note(311, .18, .35, 'triangle', .08); },
  /* ouvrir un lieu, un objet, un panneau : un petit « plop » de bois chaud, une note plus haute, et une clochette très légère */
  page:function(){ tendre(392, 0, .11, .07, 330, .008, 'triangle', 1100); tendre(587, .07, .17, .05, null, .01); tendre(1175, .07, .2, .012, null, .012); },
  feuille:feuille,   /* tourner une page du Grand Livre */
  cloche:function(){ note(880, 0, 1.2, 'sine', .1); note(1320, 0, .9, 'sine', .04); },
  porte:function(){ tendre(270, 0, .09, .07, 190, .004, 'triangle', 800); tendre(255, .16, .09, .065, 180, .004, 'triangle', 800); },   /* toc-toc sur une porte en bois */
  /* les pastilles de la carte qui arrivent (Romain, 5 novembre, 11 h 08 : un petit bruit discret et satisfaisant) :
     un « pop » tout doux par pastille, au moment où elle rebondit (70 ms d'écart, moteur.css), chacun un peu plus haut que le précédent */
  pastilles:function(n){
    var gamme = [523, 587, 659, 784, 880, 1047];
    for(var i = 0; i < Math.min(Math.max(n || 1, 1), 6); i++){
      var f = gamme[i], t = .07 * i + .05;
      tendre(f * .72, t, .085, .03, f * 1.18, .005, 'sine', 2600);   /* le pop : une petite note qui remonte */
      tendre(f * 2, t + .012, .05, .006, null, .003);                /* un brin de brillance, à peine audible */
    }
  }
};
M.son = function(type, x){
  if(M.S && M.S.options && M.S.options.son === false) return;
  try{ (SONS[type] || SONS.clic)(x); }catch(e){}
};

/* ---------- Voix (lecture à voix haute) ---------- */
var voixFr = null;
/* Les voix françaises de l'appareil, de la meilleure à la moins bonne :
   les voix « naturelles / neurales / réseau / améliorées » d'abord, puis les voix Google, puis les autres. */
function noteVoix(x){
  var n = (x.name || '') + ' ' + (x.voiceURI || ''), s = 0;
  if(/natural|neural|naturelle|premium|enhanced|améliorée|wavenet|studio/i.test(n)) s += 50;
  if(/network|réseau|online/i.test(n) || x.localService === false) s += 20;
  if(/google/i.test(n)) s += 15;
  if(/(Amélie|Thomas|Audrey|Marie|Denise|Hortense|Julie|Henri|Vivienne|Rémi|Eloise|Celeste)/i.test(n)) s += 10;
  if(/fr[-_]FR/i.test(x.lang)) s += 5;
  if(/compact|espeak|robot/i.test(n)) s -= 40;
  return s;
}
M.voixDispo = function(){
  try{ return speechSynthesis.getVoices().filter(function(x){ return /^fr/i.test(x.lang); }).sort(function(a, b){ return noteVoix(b) - noteVoix(a); }); }catch(e){ return []; }
};
/* Plus de choix de voix dans les Réglages : la meilleure voix française de l'appareil, en secours des voix naturelles */
function choisirVoix(){
  try{ voixFr = M.voixDispo()[0] || null; }catch(e){}
}
M.choisirVoix = choisirVoix;
try{ choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }catch(e){}
M.parle = false;
M.lire = function(texte, opts){
  M.stop();
  var t = M.nettoyer(texte);
  if(!t) return;
  opts = opts || {};
  /* Voix naturelles (version installée) : chaque personnage a sa voix, toujours dès qu'elles sont téléchargées
     (plus de case à cocher ni de vitesse dans les Réglages ; une vieille sauvegarde qui les avait coupées les retrouve) */
  if(window.Voix && Voix.pret){
    M.parle = true; majBoutonStop();
    var ok = Voix.lire(t, opts.qui || 'narrateur', 1, function(){ M.parle = false; majBoutonStop(); });
    if(ok) return;
    M.parle = false;
  }
  M.lireAppareil(t);
};
/* La voix de l'appareil (aussi le secours de voix.js quand une voix naturelle échoue sur une tablette) */
M.lireAppareil = function(t, fini){
  try{
    var u = new SpeechSynthesisUtterance(t);
    u.lang = 'fr-FR'; if(voixFr) u.voice = voixFr;
    u.rate = 0.95; u.pitch = 1;
    u.onend = u.onerror = function(){ M.parle = false; majBoutonStop(); if(fini) fini(); };
    M.parle = true; majBoutonStop();
    speechSynthesis.speak(u);
  }catch(e){ M.parle = false; if(fini) fini(); }
};
M.stop = function(){ try{ speechSynthesis.cancel(); }catch(e){} try{ if(window.Voix) Voix.stop(); }catch(e){} M.parle = false; majBoutonStop(); };
/* Jamais de lecture automatique : quatre tablettes qui parlent en même temps, c'est insupportable. On lit seulement sur un bouton 🔊. */
M.lireAuto = function(){};
function majBoutonStop(){
  var b = document.getElementById('stop-voix');
  if(b) b.hidden = !M.parle;
}
window.Brume = {lire:function(t, o){ return M.lire(t, o); }, stop:function(){ return M.stop(); }, son:function(t, x){ return M.son(t, x); }, sonActif:function(){ return !(M.S && M.S.options && M.S.options.son === false); }};

/* ---------- Sauvegarde (emplacements : plusieurs héros par appareil) ---------- */
var PREFIXE = 'brumeval-v2-';
/* UN HÉROS NE PREND JAMAIS LA PLACE D'UN AUTRE (Romain, 13 novembre, 13 h 57 : « quand on est dans le Pisteur et qu'on appuie sur
   L'enquête, ça efface le personnage et ça lance l'Alchimiste »). La cause : quatre onglets du même navigateur, ouverts AVANT de créer
   les héros — aucun héros n'existe encore, donc chaque onglet prenait l'emplacement 1 ; les quatre héros se sauvaient au même endroit,
   le dernier qui touchait quelque chose écrasait les autres. Tant qu'un onglet restait ouvert, il gardait son héros en mémoire : on ne
   voyait rien. Le premier rechargement (remonter du donjon) relisait l'emplacement… et trouvait le héros d'un autre.
   Maintenant : chaque héros a une identité (S.uid), chaque onglet retient celle qu'il a vue en dernier dans son emplacement (vuUid), et
   M.sauver regarde avant d'écrire : si un AUTRE héros s'y est installé entre-temps, on ne l'écrase pas — on prend un emplacement libre. */
var MAX_EMPL = 8;     /* (on en propose 4 ; les suivants ne servent qu'à ne jamais écraser personne) */
var emMem = null;     /* l'emplacement de cet onglet, si la mémoire de l'onglet (sessionStorage) manque */
var vuUid = {};       /* par emplacement : l'identité que CET onglet y a vue (ou écrite) en dernier */
function uidNeuf(){ return 'h' + Date.now().toString(36) + Math.floor(Math.random() * 1e9).toString(36); }
/* (une sauvegarde d'avant le 13 novembre n'a pas d'identité : on lui en donne une qui ne dépend que du héros, pour que deux onglets
   qui ouvrent le même héros soient d'accord) */
function uidDe(s){ return s ? (s.uid || (s.heros ? 'vieux:' + s.heros.role + ':' + s.heros.nom : null)) : null; }
function lireEmpl(n){ try{ var t = localStorage.getItem(PREFIXE + n); return t ? JSON.parse(t) : null; }catch(e){ return null; } }
function retenirEmpl(n){ emMem = String(n); try{ sessionStorage.setItem('brumeval-emplacement', String(n)); }catch(e){} }
function emplLibre(){ for(var i = 1; i <= MAX_EMPL; i++){ var s = lireEmpl(i); if(!s || !s.heros) return i; } return 0; }
M.emplacement = function(){
  try{ var v = sessionStorage.getItem('brumeval-emplacement'); if(v) return v; }catch(e){}
  return emMem;
};
M.choisirEmplacement = function(n){ retenirEmpl(n); M.S = M.charger(n); };
M.emplacements = function(){
  var l = [];
  for(var i = 1; i <= MAX_EMPL; i++){
    var s = lireEmpl(i); if(s && s.heros) l.push({n:i, s:s});
  }
  return l;
};
/* l'emplacement du héros qui a cette descente dans le donjon en cours (descente.js : en remontant, on retrouve le bon héros à coup sûr) */
M.emplacementDuJeton = function(jeton){
  if(!jeton) return 0;
  for(var i = 1; i <= MAX_EMPL; i++){ var s = lireEmpl(i); if(s && s.heros && s.e && s.e.donjonJeton === jeton) return i; }
  return 0;
};
M.etatNeuf = function(){
  return {v:2, uid:uidNeuf(), heros:null, xp:0, or:0, talents:[], equip:[], ingr:{}, fioles:3, potions:{}, prochaine:1, finies:{}, calepin:[], e:null, journal:{}, legendes:[],
    options:{son:true, lecture:true, vitesse:0.95}};
};
/* L'enquête 1 refaite le 4 novembre après-midi (plus de Corbeau ni de « fer noir », la plume devient « une grande plume noire ») :
   une enquête 1 déjà finie a recopié l'ancienne fin dans le calepin, et l'ancienne plume dans les notes de son carnet.
   Au chargement, on les remet à jour. Seulement ce qui vient de l'enquête 1 : les autres enquêtes ne sont pas touchées. */
var E1_VIEILLE_FIN = /CORBEAU VEILLE|du fer noir/i;
var E1_NOTES = {
  'Odette t\'a donné une plume noire rapportée par son chat.': 'Odette t\'a donné une grande plume noire rapportée par son chat.',
  'Analyse de la plume noire : une plume de corbeau qui sent la lavande. Mystère…': 'Analyse de la plume : une grande plume noire qui sent la lavande. Mystère…',
  'La plume noire de la nuit du vol sentait la lavande.': 'La grande plume noire de la nuit du vol sentait la lavande.'
};
function e1Texte(t){
  if(typeof t !== 'string') return t;
  return E1_NOTES[t] || t.replace(/Plume de corbeau/g, 'Grande plume noire').replace(/plume de corbeau/g, 'grande plume noire');
}
function e1Notes(l){ (Array.isArray(l) ? l : []).forEach(function(n){ if(n && typeof n.t === 'string') n.t = e1Texte(n.t); }); }
var E2_VIEUX = {
  'Devant la fumée rouge du Vieux Chêne, le maire a crié : « Vapeurs toxiques ! »': 'Devant la fumée rouge du Vieux Chêne, Silas a crié : « Vapeurs toxiques ! » Le maire a fait condamner la zone.',
  'Le rassemblement (la nuit) : au Vieux Chêne, une fumée rouge est sortie de sous les branches. Le maire a crié « Reculez, ce sont des vapeurs toxiques ! ». Quelqu\'un s\'est sauvé derrière un buisson.':
    'Le rassemblement (la nuit) : au Vieux Chêne, une fumée rouge est sortie de sous les branches. Silas a crié : « Ce sont des vapeurs toxiques ! Elles montent des sous-sols ! » Le maire : « La zone est condamnée. Rentrez chez vous ! » Quelqu\'un s\'est sauvé derrière un buisson.'
};
function e2Notes(l){ (Array.isArray(l) ? l : []).forEach(function(n){ if(n && typeof n.t === 'string' && E2_VIEUX[n.t]) n.t = E2_VIEUX[n.t]; }); }
M.reparerE1 = function(s){
  if(!s || typeof s !== 'object') return s;
  var E1 = window.ENQUETES && window.ENQUETES[1];
  try{
    /* le calepin : on retire les deux vieilles lignes, on renomme la plume, et on remet les lignes de la nouvelle fin qui manquent (🕳️ le trou, 🪵 les planches), dans l'ordre de la fin */
    if(Array.isArray(s.calepin) && s.calepin.some(function(c){ return c && +c.e === 1; })){
      var gardes = s.calepin.filter(function(c){ return c && +c.e === 1 && !E1_VIEILLE_FIN.test(c.t || ''); });
      gardes.forEach(function(c){ c.t = e1Texte(c.t); });
      var bloc = [];
      ((E1 && E1.fin && E1.fin.calepin) || []).forEach(function(c){
        var x = gardes.filter(function(g){ return g.t === c.t; })[0];
        bloc.push(x || {e:1, ic:c.ic, t:c.t});
      });
      gardes.forEach(function(g){ if(!bloc.some(function(b){ return b.t === g.t; })) bloc.push(g); });
      var l = [], mis = false;
      s.calepin.forEach(function(c){
        if(c && +c.e === 1){ if(!mis){ l = l.concat(bloc); mis = true; } return; }
        l.push(c);
      });
      s.calepin = l;
    }
    /* les notes du carnet de l'enquête 1 : dans le journal (enquête finie), et dans l'enquête en cours si c'est encore l'enquête 1 */
    var J = s.journal && s.journal[1];
    if(J && typeof J === 'object'){
      e1Notes(J.carnet);
      if(Array.isArray(J.recus)) J.recus.forEach(function(r){ if(r && r.nom === 'Plume noire') r.nom = (E1 && E1.objets && E1.objets.plume && E1.objets.plume.nom) || 'Grande plume noire'; });
    }
    if(s.e && typeof s.e === 'object' && +s.e.id === 1) e1Notes(s.e.carnet);
    /* L'enquête 2 (Romain, 5 novembre, 8 h 59 : le maire ne ment jamais) : ce n'est plus lui qui crie « vapeurs toxiques », c'est Silas.
       Le calepin d'une enquête 2 finie, et la note du rassemblement dans le carnet (journal et enquête en cours), sont remis à jour. */
    if(Array.isArray(s.calepin)) s.calepin.forEach(function(c){ if(c && +c.e === 2 && E2_VIEUX[c.t]) c.t = E2_VIEUX[c.t]; });
    var J2 = s.journal && s.journal[2];
    if(J2 && typeof J2 === 'object') e2Notes(J2.carnet);
    if(s.e && typeof s.e === 'object' && +s.e.id === 2) e2Notes(s.e.carnet);
  }catch(e){}
  return M.reparerBoutique(s);
};
/* Les talents pas encore faits et les objets qui ne marchaient pas sont retirés (Romain, 11 novembre, 8 h 11 ; donnees.js).
   Une vieille sauvegarde : les talents qui n'existent plus disparaissent (le choix reviendra quand ils seront refaits),
   les objets retirés sont rendus à Fortuné au prix d'achat, une seule fois ; s.rembourse garde le message à montrer au lancement. */
M.reparerBoutique = function(s){
  if(!s || typeof s !== 'object') return s;
  try{
    if(Array.isArray(s.talents)) s.talents = s.talents.filter(function(id){ return D.TALENTS[id]; });
    if(Array.isArray(s.equip)){
      var rendu = 0;
      s.equip = s.equip.filter(function(id){
        if(D.OBJETS[id]) return true;
        var prix = (D.OBJETS_RETIRES || {})[id];
        if(prix) rendu += prix;
        return false;
      });
      if(rendu){ s.or = Math.max(0, +s.or || 0) + rendu; s.rembourse = {or:((s.rembourse && s.rembourse.or) || 0) + rendu}; }
    }
  }catch(e){}
  return s;
};
M.charger = function(n){
  n = n || 1;
  vuUid[n] = null;
  try{
    var t = localStorage.getItem(PREFIXE + n);
    if(t){
      var s = JSON.parse(t);
      s.uid = uidDe(s) || uidNeuf();   /* (avant de compléter avec l'état neuf, qui apporterait une identité tirée au hasard) */
      vuUid[n] = s.uid;
      var base = M.etatNeuf(); for(var k in base) if(s[k] === undefined) s[k] = base[k];
      return M.reparerE1(s);
    }
  }catch(e){}
  return M.etatNeuf();
};
M.sauver = function(){
  var S = M.S, n = M.emplacement();
  if(!S) return;
  if(!S.uid) S.uid = uidNeuf();
  if(!n){
    /* aucun emplacement choisi (l'écran « Qui joue sur cet écran ? ») : un état sans héros ne s'écrit nulle part — surtout pas
       par-dessus le héros de l'emplacement 1 */
    if(!S.heros) return;
    n = emplLibre(); if(!n) return;
    retenirEmpl(n);
  }
  var la = lireEmpl(n), uidLa = uidDe(la);
  if(la && la.heros && uidLa !== S.uid && uidLa !== vuUid[n]){
    /* un autre héros s'est installé ici depuis notre dernière lecture (un autre onglet) : on ne l'écrase pas */
    if(!S.heros) return;
    var libre = emplLibre(); if(!libre) return;
    n = libre; retenirEmpl(n);
  }
  try{ localStorage.setItem(PREFIXE + n, JSON.stringify(S)); vuUid[n] = S.uid; }catch(e){}
};
M.effacerEmplacement = function(n){ try{ localStorage.removeItem(PREFIXE + n); }catch(e){} vuUid[n] = null; };
/* Lit un fichier de sauvegarde (💾 Sauvegarder du menu ☰, ou l'ancienne « sauvegarde de secours ») ; renvoie l'état, ou null s'il n'est pas bon */
M.lireSauvegarde = function(texte){
  var o;
  try{ o = JSON.parse(String(texte || '').replace(/^﻿/, '')); }catch(e){ return null; }
  var s = o && o.jeu === 'brumeval' && o.etat ? o.etat : (o && o.v === 2 && o.heros ? o : null);
  if(!s || typeof s !== 'object' || !s.heros || typeof s.heros !== 'object') return null;
  if(!D.ROLES[s.heros.role] || typeof s.heros.nom !== 'string' || !s.heros.nom.trim()) return null;
  var base = M.etatNeuf();
  for(var k in base) if(s[k] === undefined || (s[k] === null && base[k] !== null)) s[k] = base[k];
  ['talents', 'equip', 'calepin', 'legendes'].forEach(function(k){ if(!Array.isArray(s[k])) s[k] = []; });
  ['xp', 'or', 'fioles'].forEach(function(k){ s[k] = Math.max(0, +s[k] || 0); });
  s.prochaine = Math.max(1, +s.prochaine || 1);
  ['ingr', 'potions', 'finies', 'journal', 'options'].forEach(function(k){ if(typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = base[k]; });
  s.talents = s.talents.filter(function(id){ return D.TALENTS[id]; });
  s.equip = s.equip.filter(function(id){ return D.OBJETS[id]; });
  if(s.e && (typeof s.e !== 'object' || !window.ENQUETES || !window.ENQUETES[s.e.id])) s.e = null;
  if(s.heros && s.heros.joueur !== 'enfant') s.heros.joueur = 'adulte';   /* qui joue ce héros (enfant / adulte) ; une vieille sauvegarde sans réponse = adulte */
  return M.reparerE1(s);
};

/* ---------- Héros : niveau, effets ---------- */
M.niveau = function(xp){
  var n = 1;
  for(var i = 0; i < D.SEUILS.length; i++) if(xp >= D.SEUILS[i]) n = i + 1;
  var bas = D.SEUILS[n - 1], haut = D.SEUILS[n] === undefined ? null : D.SEUILS[n];
  return {n:n, bas:bas, haut:haut, pct: haut ? Math.round((xp - bas) * 100 / (haut - bas)) : 100, titre:D.TITRES[n - 1]};
};
M.role = function(){ return M.S.heros && M.S.heros.role; };
M.nomRole = function(role, sexe){ var r = D.ROLES[role]; return sexe === 'f' ? r.f : r.m; };
M.talentsEnAttente = function(){
  var n = M.niveau(M.S.xp).n, l = [];
  [2, 4, 6, 8, 10].forEach(function(p){
    if(n >= p){
      var choix = (D.TALENTS_PAR_ROLE[M.role()] || {})[p] || [];
      if(!choix.length) return;   /* (un rôle dont les talents sont encore à faire : rien à choisir) */
      if(!choix.some(function(id){ return M.S.talents.indexOf(id) >= 0; })) l.push(p);
    }
  });
  return l;
};
M.ensemblesComplets = function(){
  var compte = {};
  M.S.equip.forEach(function(id){ var o = D.OBJETS[id]; if(o && o.ens) compte[o.ens] = (compte[o.ens] || 0) + 1; });
  return M.cle(compte).filter(function(e){ return compte[e] >= 3; });
};
M.compteEnsemble = function(ens){ return M.S.equip.filter(function(id){ return D.OBJETS[id] && D.OBJETS[id].ens === ens; }).length; };
/* Sources d'effets permanents : talents, objets, ensembles complets */
M.sources = function(){
  var l = [];
  M.S.talents.forEach(function(id){ var t = D.TALENTS[id]; if(t) l.push({type:'talent', id:id, nom:t.nom, ic:t.ic, fx:t.fx || {}}); });
  M.S.equip.forEach(function(id){ var o = D.OBJETS[id]; if(o) l.push({type:'objet', id:id, nom:o.nom, ic:o.ic, fx:o.fx || {}}); });
  M.ensemblesComplets().forEach(function(id){ var e = D.ENSEMBLES[id]; l.push({type:'ensemble', id:id, nom:'Ensemble ' + e.nom, ic:e.ic, fx:e.fx || {}}); });
  return l;
};
M.fxSomme = function(cle){
  var s = 0;
  M.sources().forEach(function(x){ if(typeof x.fx[cle] === 'number') s += x.fx[cle]; });
  return s;
};
M.fxVrai = function(cle){ return M.sources().some(function(x){ return !!x.fx[cle]; }); };
/* Accès : talents, objets, ensembles, potions bues pour ce moment */
M.acces = function(cle){
  if(M.sources().some(function(x){ return (x.fx.acces || []).indexOf(cle) >= 0; })) return true;
  var P = M.S.e;
  if(P && P.bues){
    return M.cle(P.bues).some(function(pid){
      var pot = D.POTIONS[pid];
      return P.bues[pid] === P.moment && pot && (pot.fx.acces || []).indexOf(cle) >= 0;
    });
  }
  return false;
};
/* Qui peut donner un accès (pour expliquer « ce qui marcherait ») */
M.sourcesAcces = function(cle, role){
  var l = [];
  M.cle(D.TALENTS).forEach(function(id){ var t = D.TALENTS[id]; if(t.role === role && (t.fx.acces || []).indexOf(cle) >= 0) l.push({ic:t.ic, nom:'Talent ' + t.nom}); });
  M.cle(D.OBJETS).forEach(function(id){ var o = D.OBJETS[id]; if(o.role === role && (o.fx.acces || []).indexOf(cle) >= 0) l.push({ic:o.ic, nom:o.nom + ' (boutique)'}); });
  M.cle(D.POTIONS).forEach(function(id){ var p = D.POTIONS[id]; if(p.pour.indexOf(role) >= 0 && (p.fx.acces || []).indexOf(cle) >= 0) l.push({ic:p.ic, nom:p.nom + ' (de l\'Alchimiste)'}); });
  return l;
};
/* Mods d'un mini-jeu + liste des aides affichées */
M.modsPour = function(type, potion){
  var mods = {}, aides = [];
  function ajoute(src, m){
    if(!m) return;
    M.cle(m).forEach(function(k){
      var v = m[k];
      if(typeof v === 'number'){
        if(k === 'lent' || k === 'zone') mods[k] = (mods[k] || 1) * v;
        else mods[k] = (mods[k] || 0) + v;
      } else mods[k] = mods[k] || v;
    });
    aides.push({ic:src.ic, nom:src.nom});
  }
  M.sources().forEach(function(x){
    if(type === 'chaudron' && x.fx.mj){
      var m2 = x.fx.mj.chaudron || x.fx.mj.temperature || x.fx.mj.rythme || x.fx.mj.melange || x.fx.mj.bulles;
      if(m2) ajoute(x, m2);
    } else if(x.fx.mj && x.fx.mj[type]) ajoute(x, x.fx.mj[type]);
    if(x.fx.mjTous && MJ.TYPES[type] && MJ.TYPES[type].minuteur !== false) ajoute(x, x.fx.mjTous);
  });
  if(potion){ var p = D.POTIONS[potion]; if(p && p.fx.mj && p.fx.mj[type]) ajoute({ic:p.ic, nom:p.nom}, p.fx.mj[type]); }
  var P = M.S.e;
  /* (plus de deuxième chance dans les mini-jeux, Romain, 5 novembre, 13 h 19 : P.chances reste, inutilisé, pour la boutique plus tard) */
  return {mods:mods, aides:aides};
};
M.potionsPour = function(type){
  var P = M.S.e; if(!P) return [];
  return M.cle(P.potions || {}).filter(function(pid){
    var p = D.POTIONS[pid];
    return P.potions[pid] > 0 && p && p.fx.mj && p.fx.mj[type];
  });
};

/* ---------- Codes à trois symboles (déterministes) ---------- */
/* Codes de passage (fin d'enquête, enquête suivante, défaite) : on peut les taper en retard,
   sur une tablette qui est déjà dans l'enquête d'à côté, ou depuis le village */
M.codePassage = function(id){ return /^(victoire|suite|defaite):/.test(id); };
M.codesEnquete = function(E){
  if(E._codes) return E._codes;
  if(E.codesFixes) return codesGeles(E);
  var b = codesBruts(E), ids = b.ids, toutes = b.toutes;
  /* Un code d'ici ne doit jamais être un code de passage d'une enquête voisine. Sinon, le code
     « enquête suivante » de l'enquête 1, tapé sur une tablette déjà dans l'enquête 2, était lu comme
     la potion d'invisibilité de l'enquête 2 (« Ce code n'est pas pour toi ») ! Seuls ces codes-là changent. */
  /* Les codes de passage eux-mêmes ne se croisent pas non plus d'une enquête à la suivante (passagesEnquete, ci-dessous) :
     avec 12 symboles, « suite:2 » de l'enquête 2 tombait sur « victoire:2 » de l'enquête 3. */
  var pE = passagesEnquete(E), interdits = {};
  [E.id - 1, E.id + 1].forEach(function(v){
    var V = window.ENQUETES && window.ENQUETES[v]; if(!V) return;
    var pv = passagesEnquete(V);
    M.cle(pv.parId).forEach(function(id){ interdits[pv.parId[id].join('-')] = 1; });
  });
  var parId = {}, parCode = {}, libre = pE.libre;
  ids.forEach(function(id, i){
    var seq = toutes[i];
    if(M.codePassage(id)) seq = pE.parId[id];
    else if(interdits[seq.join('-')]){
      while(libre < toutes.length && interdits[toutes[libre].join('-')]) libre++;
      seq = toutes[libre++];
    }
    parId[id] = seq; parCode[seq.join('-')] = id;
  });
  E._codes = {parId:parId, parCode:parCode};
  return E._codes;
};
/* Une enquête aux codes gelés (codes-fixes.js) : ses codes ne bougent plus, quoi qu'on change dans les enquêtes voisines.
   Un code ajouté après le gel prend le premier code libre (jamais un code déjà pris). On ne regarde pas les voisines ici
   (sinon boucle sans fin) : ce sont les enquêtes non gelées qui évitent les codes gelés (passagesEnquete). */
function codesGeles(E){
  var b = codesBruts(E), F = E.codesFixes, parId = {}, parCode = {}, pris = {};
  M.cle(F).forEach(function(id){ var s = F[id].split('-'); parId[id] = s; parCode[F[id]] = id; pris[F[id]] = 1; });
  /* un code ajouté après le gel ne prend pas non plus un code de passage d'une voisine gelée (lu tard, il serait pris pour lui) ;
     seulement leur gel (codesFixes) : pas de boucle. Les codes déjà gelés ne changent pas. */
  [E.id - 1, E.id + 1].forEach(function(v){ var V = window.ENQUETES && window.ENQUETES[v]; if(V && V.codesFixes) M.cle(V.codesFixes).forEach(function(id){ if(M.codePassage(id)) pris[V.codesFixes[id]] = 1; }); });
  var k = 0;
  b.ids.forEach(function(id){
    if(parId[id]) return;
    while(k < b.toutes.length && pris[b.toutes[k].join('-')]) k++;
    var s = b.toutes[k++]; if(!s) return;
    parId[id] = s; parCode[s.join('-')] = id; pris[s.join('-')] = 1;
  });
  E._codes = {parId:parId, parCode:parCode};
  return E._codes;
}
/* Les codes de passage (fin, suite, défaite) d'une enquête : ceux qui tombent sur un code de passage de l'enquête
   d'avant prennent un code libre. On remonte de l'enquête 1 vers la suivante, donc pas de boucle. */
function passagesEnquete(V){
  if(V._passages) return V._passages;
  if(V.codesFixes){   /* enquête gelée : ses codes de passage sont ceux du gel */
    var g = M.codesEnquete(V), rg = {parId:{}, libre:codesBruts(V).ids.length};
    M.cle(g.parId).forEach(function(id){ if(M.codePassage(id)) rg.parId[id] = g.parId[id]; });
    V._passages = rg; return rg;
  }
  var b = codesBruts(V), avant = window.ENQUETES && window.ENQUETES[V.id - 1], pris = {};
  if(avant){
    var pa = passagesEnquete(avant); M.cle(pa.parId).forEach(function(id){ pris[pa.parId[id].join('-')] = 1; });
    /* l'enquête d'avant est gelée : aucun de ses codes ne doit servir de code de passage ici */
    if(avant.codesFixes){ var ga = M.codesEnquete(avant); M.cle(ga.parId).forEach(function(id){ pris[ga.parId[id].join('-')] = 1; }); }
  }
  var res = {parId:{}, libre:b.ids.length};
  b.ids.forEach(function(id, i){
    if(!M.codePassage(id)) return;
    var seq = b.toutes[i];
    if(pris[seq.join('-')]){
      while(res.libre < b.toutes.length && pris[b.toutes[res.libre].join('-')]) res.libre++;
      seq = b.toutes[res.libre++];
    }
    res.parId[id] = seq;
  });
  V._passages = res;
  return res;
}
function codesBruts(E){
  if(E._codesBruts) return E._codesBruts;
  var ids = [];
  E.moments.forEach(function(m, i){ if(i > 0) ids.push('moment:' + i); });
  M.cle(E.objets || {}).forEach(function(id){ ids.push('obj:' + id); });
  M.cle(E.infos || {}).forEach(function(id){ ids.push('info:' + id); });
  M.cle(D.POTIONS).forEach(function(id){ if(!D.POTIONS[id].tard) ids.push('pot:' + id); });
  ids.push('aide:action');
  ids.push('victoire:0', 'victoire:1', 'victoire:2', 'victoire:3');
  /* Ajoutés à la fin de la liste : les codes déjà connus ne bougent pas */
  ids.push('suite:0', 'suite:1', 'suite:2', 'suite:3', 'defaite:0');
  ['pisteur', 'alchimiste', 'barde'].forEach(function(r){ for(var n = 1; n <= 6; n++) ids.push('aide:' + r + ':' + n); });
  /* Les codes des talents du Barde (barde.js), à la fin eux aussi : l'Hydromel (potion « tard »), la rumeur d'un lieu du OÙ
     (pour le Pisteur), la plaidoirie (pour le Sage), la recette de l'Hydromel (pour l'Alchimiste) */
  M.cle(D.POTIONS).forEach(function(id){ if(D.POTIONS[id].tard) ids.push('pot:' + id); });
  for(var nr = 0; nr < 6; nr++) ids.push('rumeur:' + nr);
  ids.push('plaide:1', 'recette:hydromel');
  /* (enquête 3) E.codesPlus : des codes en plus, à la fin (les fins à variante, les codes d'allure allure:0 … allure:215 : descente.js) */
  (E.codesPlus || []).forEach(function(id){ ids.push(id); });
  var toutes = [];
  D.ORDRE_SYM.forEach(function(a){ D.ORDRE_SYM.forEach(function(b){ D.ORDRE_SYM.forEach(function(c){
    if(!(a === b && b === c)) toutes.push([a, b, c]);
  }); }); });
  var r = M.alea(7919 * E.id + 104729);
  for(var i = toutes.length - 1; i > 0; i--){ var j = Math.floor(r() * (i + 1)); var t = toutes[i]; toutes[i] = toutes[j]; toutes[j] = t; }
  E._codesBruts = {ids:ids, toutes:toutes};
  return E._codesBruts;
}
M.code = function(id){ return M.codesEnquete(M.E()).parId[id]; };
/* (enquête 3) Le code de fin peut porter une variante de la scène finale, pour que toute l'équipe voie la même : E.finVariante(P) rend
   0, 1 ou 2 sur la tablette du Sage (ce qu'il a reçu) ; le code de fin est alors « victoire:<10 × variante + erreurs> » (les codes en
   plus sont dans E.codesPlus). Sans E.finVariante (enquêtes 1 et 2) : toujours 0, les codes « victoire:0 » à « victoire:3 » d'avant. */
M.finVariante = function(){ var E = M.E(), P = M.P(); try{ return (E && P && typeof E.finVariante === 'function' ? +E.finVariante(P) : 0) || 0; }catch(e){ return 0; } };
M.idVictoire = function(erreurs, variante){ return 'victoire:' + (Math.min(+erreurs || 0, 3) + 10 * (variante == null ? M.finVariante() : (+variante || 0))); };
M.codeDe = function(E, id){ return E ? M.codesEnquete(E).parId[id] : null; };
M.idDuCode = function(seq){ var E = M.E(); return E ? (M.codesEnquete(E).parCode[seq.join('-')] || null) : null; };
/* Un code de passage d'une enquête voisine de « autour » : {id, e} ou null */
M.passageVoisin = function(seq, autour){
  var k = seq.join('-'), l = [];
  [autour - 1, autour, autour + 1].forEach(function(v){
    var V = window.ENQUETES[v]; if(!V) return;
    var id = M.codesEnquete(V).parCode[k];
    if(id && M.codePassage(id)) l.push({id:id, e:v});
  });
  return l[0] || null;
};
/* Le code « enquête suivante » qui a mené à l'enquête n. Plus montré nulle part (Romain, 4 novembre, 20 h 41 et 21 h 12) :
   chacun touche le bouton « Enquête N ». Le code « suite » reste dans la liste des codes (tapé par habitude, il marche encore). */
M.codeVenue = function(n){
  return null;
};
M.codeVenueAncien = function(n){
  var S = M.S, F = S.finies && S.finies[n - 1], V = window.ENQUETES[n - 1];
  if(!F || !V || !window.ENQUETES[n]) return null;
  return M.codeDe(V, 'suite:' + Math.min(F.erreurs || 0, 3));
};
/* Codes qui ouvrent un lieu (plan, chemin, passage secret…) : ceux des verrous et des besoins des lieux.
   Toute l'équipe enquête : chacun peut les taper, et le lieu s'ouvre sur sa tablette. {code:[lieux]}
   Sauf les codes des chemins secrets du Pisteur (E.chemins, Romain, 5 novembre, 01 h 30 : le chemin des bûcherons) : pour lui seul. */
M.codesLieux = function(E){
  if(!E) return {};
  if(E._codesLieux) return E._codesLieux;
  var l = {}, seul = {};
  (E.chemins || []).forEach(function(c){ if(c && c.code) seul[c.code] = 1; });
  function voir(besoin, lieu){
    (besoin || []).forEach(function(b){
      if(!b) return;
      if(b.code && /^(info|obj):/.test(b.code) && !seul[b.code]){ l[b.code] = l[b.code] || []; if(l[b.code].indexOf(lieu) < 0) l[b.code].push(lieu); }
      if(b.et) voir(b.et, lieu);
    });
  }
  M.cle(E.lieux || {}).forEach(function(id){ var L = E.lieux[id] || {}; voir(L.verrou && L.verrou.besoin, id); voir(L.besoin, id); });
  E._codesLieux = l;
  return l;
};
M.codePourTous = function(id, E){ return !!M.codesLieux(E || M.E())[id]; };
/* « donne ce code au Pisteur ! », ou, pour un plan : « ce code est pour toute l'équipe : chacun peut le taper ! » */
M.texteDonne = function(code){
  var d = M.destinataire(code);
  if(d === 'barde' && M.surQui && M.surQui(code)) return 'donne ce code au Barde : il le notera sur ' + M.surQui(code) + '.';   /* un renseignement sur un habitant (carnet.js) */
  if(D.ROLES[d]) return 'donne ce code ' + D.ROLES[d].au + ' !';
  if(Array.isArray(d)) return 'donne ce code ' + d.map(function(r){ return D.ROLES[r].au; }).join(' ou ') + ' !';
  if(d === 'tous') return 'ce code est pour toute l\'équipe : chacun peut le taper !';
  return 'donne ce code aux autres joueurs !';
};
/* Une phrase dans l'histoire, sous un code donné (Romain, 23 h 11) : I.dire d'un renseignement ou d'un objet de l'enquête
   (ex. : « Farinel, le meunier, sait peut-être quelque chose : donne ce code au Barde. ») ; sinon null (texteDonne) */
M.direCode = function(code){
  var E = M.E(), p = String(code || '').split(':'), I = E && (p[0] === 'info' ? E.infos : p[0] === 'obj' ? E.objets : null);
  return (I && I[p[1]] && I[p[1]].dire) || null;
};
/* Pour qui est un code */
M.destinataire = function(id){
  var E = M.E(), p = id.split(':'), t = p[0], x = p[1];
  if(t === 'moment') return 'tous-sauf-sage';
  if(t === 'victoire') return 'tous-sauf-sage';
  if((t === 'obj' || t === 'info') && M.codePourTous(id, E)) return 'tous';
  if(t === 'obj') return E.objets[x].pour;
  if(t === 'info') return E.infos[x].pour;
  if(t === 'pot') return D.POTIONS[x].pour;
  if(t === 'suite' || t === 'defaite') return 'tous-sauf-sage';
  if(t === 'aide') return D.ROLES[x] ? x : 'tous';
  /* (enquête 3) le code d'allure du Sage ou de l'Alchimiste (descente.js) ; à la fin de l'histoire, au cachot : celui de n'importe qui, pour tous */
  if(t === 'allure'){ var Pa = M.P(); return Pa && Pa.etape === 'fin' ? 'tous' : 'pisteur'; }
  if(t === 'sac') return 'pisteur';
  if(t === 'donjon') return x === 'plante' ? 'alchimiste' : (x === 'sauve' || x === 'recette') ? 'pisteur' : 'sage';   /* (enquête 3) un code du donjon : descente.js, M.codeDonjon */
  return 'tous';
};
M.nomCode = function(id){
  var E = M.E(), p = id.split(':'), t = p[0], x = p[1];
  if(t === 'obj') return {ic:E.objets[x].ic, nom:E.objets[x].nom};
  if(t === 'info') return {ic:E.infos[x].ic, nom:E.infos[x].nom};
  if(t === 'pot') return {ic:D.POTIONS[x].ic, nom:D.POTIONS[x].nom};
  if(t === 'moment') return {ic:D.MOMENTS[E.moments[+x]].ic, nom:D.MOMENTS[E.moments[+x]].nom};
  if(t === 'aide') return {ic:'💡', nom:'Une action en plus'};
  if(t === 'suite') return {ic:'➡️', nom:'Enquête suivante'};
  if(t === 'defaite') return {ic:'🌫️', nom:'Défaite'};
  if(t === 'sac') return {ic:'🎒', nom:'Le sac de l\'Alchimiste'};
  if(t === 'allure') return {ic:'🛡️', nom:'La tenue de combat'};
  /* (enquête 3) un code du donjon qu'un joueur de l'enquête garde pour un équipier : le givre de l'Alchimiste, que le Pisteur tape DANS le donjon */
  if(t === 'donjon') return x === 'recette' && p[2] === 'givre' ? {ic:'❄️', nom:'Le givre (à taper dans le donjon)'} : x === 'sauve' ? {ic:'📜', nom:'Un sort de sauvegarde (à taper dans le donjon)'} : {ic:'🕯️', nom:'Un code du donjon'};
  return {ic:'🏆', nom:'Victoire'};
};

/* ---------- Enquête en cours ---------- */
M.E = function(){ var P = M.S.e; return P ? window.ENQUETES[P.id] : null; };
M.P = function(){ return M.S.e; };
M.enqueteNeuve = function(id){
  var E = window.ENQUETES[id];
  return {id:id, etape:'lettre', moment:0, actions:2, vus:{}, recus:{}, objets:{}, carnet:[], conv:{}, pages:{}, analyses:{},
    potions:{}, bues:{}, erreurs:0, raye:[], bonus:{}, usages:{}, chances:0, resolu:false, fin:null, onglet:'role', protege:false};
};
M.momentId = function(){ var E = M.E(), P = M.P(); return E.moments[Math.min(P.moment, E.moments.length - 1)]; };
/* Ingrédients : rangés dans l'atelier si le module existe, sinon dans un simple sac */
M.ingr = function(){ var S = M.S; if(window.Atelier && S.atelier) return Atelier.compter(S.atelier); return S.ingr || {}; };
/* (enquête 3) les plantes de l'établi : P.plantes {oseille:1, …}, au plus 3 de chaque (plantes.js) */
M.plantes = function(){ var P = M.P(); return (P && P.plantes) || {}; };
M.ajouterPlante = function(k){ var P = M.P(); if(!P || !D.PLANTES || !D.PLANTES[k]) return; P.plantes = P.plantes || {}; P.plantes[k] = Math.min(3, (P.plantes[k] || 0) + 1); P.vus['plante:' + k] = 1; };
M.ajouterIngr = function(i, n){ var S = M.S; if(window.Atelier){ if(!S.atelier) S.atelier = Atelier.etatNeuf(); Atelier.ajouter(S.atelier, i, n); } else S.ingr[i] = (S.ingr[i] || 0) + n; };
/* Pas de choix de difficulté dans le jeu : les mini-jeux suivent le numéro de l'enquête (+2), puis l'équipement et les talents du héros. */
M.decalage = function(){ return 0; };   /* le moteur donne le rang de l'enquête ; MJ.reglages en tire le niveau selon le joueur (mj-core.js : MJ.COURBE) */
/* Un héros qui n'a encore fini aucune enquête : l'accueil, le village et la lettre sont réduits au strict nécessaire (Romain, 4 novembre) */
M.debutant = function(){ var S = M.S; return !!(S && S.heros) && (+S.prochaine || 1) <= 1 && !(S.finies && Object.keys(S.finies).length); };
M.joueur = function(){ return M.S && M.S.heros && M.S.heros.joueur === 'enfant' ? 'enfant' : 'adulte'; };
M.actionsMax = function(){ return (M.role() === 'alchimiste' ? 3 : 2) + M.fxSomme('actionBonus'); };
/* Une enquête sans points d'action (E.sansActions : l'enquête 1, Romain, 4 novembre, 14 h 13) : rien ne se compte ni ne se dépense,
   aucun bouton n'est grisé faute d'action, pas de « · 1 action », pas de pastilles, pas de réserve du Sage.
   Ce qui limite : le tutoriel (tuto.js), et « un lieu ou un villageois ne donne qu'une chose par moment » (M.rienDePlus, moteur-roles.js).
   Tous les tests d'actions passent par ces trois petites fonctions : les autres enquêtes comptent leurs actions comme avant. */
M.sansActions = function(){ var E = M.S && M.S.e ? M.E() : null; return !!(E && E.sansActions); };
/* Une enquête en construction (E.enEcriture : l'enquête 3, étape par étape, Bible § 13.14) : fermée aux joueurs (« en cours d'écriture »),
   ouverte seulement quand l'adresse porte « test » (…/brumeval/#test : le mode test des Réglages). Pas pour les fichiers ouverts
   à la main ni pour les robots, qui doivent voir le jeu comme les joueurs. */
M.enEcriture = function(E){ return !!(E && E.enEcriture && !/(^|[?#&])test\b/.test(location.search + location.hash)); };
M.peutAgir = function(){ var P = M.P(); return M.sansActions() || !!(P && P.actions > 0); };
M.depenser = function(){ var P = M.P(); if(P && !M.sansActions()) P.actions--; };
M.coutTxt = function(t){ return M.sansActions() ? '' : (t === undefined ? ' · 1 action' : t); };   /* « · 1 action » sur un bouton (ou un autre texte), rien sans actions */
/* Cœurs d'accusation du Sage : 3 par enquête, l'élixir en rend un (jamais plus de 3) */
M.COEURS = 3;
M.coeurs = function(){ var P = M.P(); if(!P) return M.COEURS; return Math.max(0, Math.min(M.COEURS, M.COEURS - (P.erreurs || 0) + (P.coeursBonus || 0))); };
/* Réserve d'actions du Sage : 3 par enquête (+1 Inspiration, +1 Cor), au plus 1 don par équipier et par moment */
M.reserveMax = function(){ return 3 + (M.fxSomme('inspiration') > 0 ? 1 : 0) + (M.acces('cor') ? 1 : 0); };
M.reserve = function(){ var P = M.P(); return P ? Math.max(0, M.reserveMax() - ((P.dons && P.dons.n) || 0)) : 0; };
/* Journal : ce qu'on a appris dans les enquêtes passées (les codes du Sage ne sont pas gardés) */
M.archiver = function(){
  var S = M.S, P = S.e, E = M.E(); if(!P || !E) return;
  S.journal = S.journal || {};
  S.journal[P.id] = {titre:E.titre, e:P.id, tableau:P.tableau ? M.copie(P.tableau) : null, liege:P.liege ? M.copie(P.liege) : null, mission:P.mission ? M.copie(P.mission) : null, revisions:(P.revisions || []).slice(), vus:M.copie(P.vus || {}), carnet:(P.carnet || []).slice(), raye:(P.raye || []).slice(), suspects:(E.qui && E.qui.choix || []).slice(),
    recus:M.cle(P.recus || {}).filter(function(k){ return P.recus[k] && /^(obj|info|pot):/.test(k); }).map(function(k){ try{ return M.nomCode(k); }catch(e){ return null; } }).filter(Boolean)};
  if(P.corbeau) S.journal[P.id].corbeau = P.corbeau;   /* (enquête 3) la réponse du Sage à « QUI est le Corbeau ? », gardée pour la suite de la saison */
};
M.noter = function(texte, ic, cle){
  var P = M.P(); if(!P || !texte) return;
  if(cle && P.carnet.some(function(n){ return n.cle === cle; })) return;
  if(P.carnet.some(function(n){ return n.t === texte; })) return;
  P.carnet.push({t:texte, ic:ic || '📝', m:P.moment, cle:cle || null});
};
/* Conditions : liste d'alternatives, une seule suffit */
M.besoinOk = function(besoin){
  if(!besoin || !besoin.length) return true;
  return besoin.some(M.uneCondition);
};
M.uneCondition = function(b){
  var P = M.P();
  if(b.code){
    if(b.code.indexOf('pot:') === 0){ var pid = b.code.slice(4); return (P.potions[pid] || 0) > 0; }
    return !!P.recus[b.code];
  }
  if(b.acces) return M.acces(b.acces);
  if(b.talent) return M.S.talents.indexOf(b.talent) >= 0;
  if(b.objet) return M.S.equip.indexOf(b.objet) >= 0;
  if(b.moment) return M.momentId() === b.moment;
  if(b.page) return !!P.pages[b.page];
  if(b.analyse) return !!(P.analyses && P.analyses[b.analyse]);   /* une analyse faite (les deux pièces d'or de l'enquête 2) */
  if(b.vu) return !!P.vus[b.vu] && P.vus[b.vu] !== 'rate';   /* un mini-jeu raté ne compte pas comme vu */
  if(b.rate) return P.vus[b.rate] === 'rate';                /* (enquête 3) un mini-jeu raté : la clé d'Anselme ratée fait apparaître le puits */
  if(b.et) return b.et.every(M.uneCondition);                  /* condition « ET » : toutes à la fois */
  if(b.non) return !M.uneCondition(b.non);                     /* (enquête 3) le contraire : le filet de la lettre, si le Sage ne l'a pas encore */
  if(b.ou) return b.ou.some(M.uneCondition);                   /* (enquête 3, 12 novembre) condition « OU », à l'intérieur d'un « ET » */
  if(b.brumeFinie) return !!(M.brumeFinie && M.brumeFinie());   /* (enquête 3, 13 novembre) toutes les plantes d'au-delà de la brume sont cueillies (cueillette.js) */
  if(b.toutDit) return !!(M.toutDit && M.toutDit(b.toutDit));  /* (enquête 3, 12 novembre) tout demandé à ces villageois : un grand dialogue s'ouvre (barde.js) */
  if(b.outil) return (M.S.outils || []).indexOf(b.outil) >= 0; /* outil de saison (coffret de teintures…) */
  return false;
};
/* Consomme une potion si c'est elle qui a ouvert la condition */
M.consommerBesoin = function(besoin){
  if(!besoin || !besoin.length) return;
  var P = M.P();
  var autre = besoin.some(function(b){ return !(b.code && b.code.indexOf('pot:') === 0) && M.uneCondition(b); });
  if(autre) return;
  besoin.forEach(function(b){
    if(b.code && b.code.indexOf('pot:') === 0){ var pid = b.code.slice(4); if(P.potions[pid] > 0){ P.potions[pid]--; } }
  });
};
M.texteBesoin = function(besoin, role){
  var vus = {}, l = [];
  (besoin || []).forEach(function(b){
    if(b.code){
      var n = M.nomCode(b.code), de = '';
      var t = b.code.split(':')[0];
      if(t === 'pot') de = ' (de l\'Alchimiste)';
      else if(t === 'obj' || t === 'info') de = M.codePourTous(b.code) ? ' (un code de l\'équipe : chacun peut le taper dans 🔢 Code)' : ' (un code d\'un équipier)';
      l.push({ic:n.ic, nom:n.nom + de});
    } else if(b.acces){
      M.sourcesAcces(b.acces, role || M.role()).forEach(function(x){ if(!vus[x.nom]){ vus[x.nom] = 1; l.push(x); } });
    } else if(b.et){ M.texteBesoin(b.et.filter(function(x){ return !M.uneCondition(x); }), role).forEach(function(x){ if(!vus[x.nom]){ vus[x.nom] = 1; l.push(x); } });
    } else if(b.outil){ l.push({ic:'🎨', nom:'Le coffret de teintures (ou celui qu\'un habitant te prête)'});
    } else if(b.talent){ var t2 = D.TALENTS[b.talent]; l.push({ic:t2.ic, nom:'Talent ' + t2.nom}); }
    else if(b.objet){ var o = D.OBJETS[b.objet]; l.push({ic:o.ic, nom:o.nom + ' (boutique)'}); }
    else if(b.page){ var E = M.E(), pg = (E.pages || []).filter(function(x){ return x.id === b.page; })[0]; if(pg) l.push({ic:pg.ic, nom:'Ouvrir d\'abord la page « ' + pg.titre + ' »'}); }
  });
  return l;
};
M.adresse = function(maison){ return (window.Carte && Carte.MAISONS && Carte.MAISONS[maison]) ? Carte.MAISONS[maison].adresse : maison; };
M.nomLieu = function(id){
  if(window.Carte && Carte.LIEUX && Carte.LIEUX[id]) return Carte.LIEUX[id].nom;
  if(/^[LFB]\d$/.test(id)) return M.adresse(id);
  return id;
};
M.icLieu = function(id){ return (window.Carte && Carte.LIEUX && Carte.LIEUX[id] && Carte.LIEUX[id].ic) || (/^[LFB]\d$/.test(id) ? '🏠' : '📍'); };
})();
