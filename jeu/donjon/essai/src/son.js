/* Les sons de la salle des rats : tout est fabriqué avec Web Audio, sans aucun fichier.
   Ils démarrent au premier toucher ; le bouton 🎵/🔇 coupe tout (bruitages et musique). Ce n'est pas une voix :
   la voix du conteur reste seulement sur les boutons 🔊.
   Depuis le 10 novembre : les bruitages et les musiques choisis par Romain dans l'atelier des sons (sons-essai.html)
   viennent du moteur de l'atelier (Moteur, BRUITAGES, MUSIQUES) ; à chaque fois, on tire au hasard parmi les versions
   qu'il a cochées. Les autres petits bruits (pas, page, bulles, dôme…) restent ceux d'ici.
   9 novembre (retours de Romain) : deux volumes séparés (Son.volume('musique' | 'bruitages', v)), un petit son quand on
   touche une icône (« icone », silencieux tant que Romain n'a pas choisi), et pour que le téléphone ne rame plus,
   les musiques et les bruitages les plus lourds sont fabriqués À L'AVANCE (hors ligne, par petits morceaux) puis joués
   comme des enregistrements, en boucle sans couture. Si le navigateur ne sait pas le faire, on les fabrique en direct comme avant. */
(function(){
'use strict';
var S = window.SALLE = window.SALLE || {};
var ctx = null, sortie, bruits, revIn, blanc, brun, actif = true, A = null;
try{ actif = localStorage.getItem('salle-rats-son') !== 'non'; }catch(e){}
/* deux volumes séparés, de 0 à 1 (0 = muet), mémorisés dans ce navigateur */
var VOL = {musique:1, bruitages:1}, BUS = null;
['musique', 'bruitages'].forEach(function(k){ try{ var x = parseFloat(localStorage.getItem('salle-rats-vol-' + k)); if(isFinite(x)) VOL[k] = Math.max(0, Math.min(1, x)); }catch(e){} });

function hasard(a, b){ return a + Math.random() * (b - a); }
function tire(l){ return l[Math.floor(Math.random() * l.length)]; }

/* les choix de Romain (10 novembre) : plusieurs versions cochées = on tire au hasard à chaque fois */
var CHOIX = S.CHOIX_SONS = {
  arc:['A', 'B', 'C'], vol:['A', 'B', 'C'], chairF:['A', 'B', 'C'], bois:['A', 'B', 'C'],
  swish:['A', 'B', 'C'], chairD:['C'], metal:['B'],
  ratFleche:['A', 'B', 'C'], ratDague:['A', 'B', 'C'], ratFeu:['A', 'B', 'C'], ratLumiere:['A', 'B', 'C'],
  ratLouche:['B', 'C'], ratColle:['B', 'C'], ratHuile:['A', 'B'], ratNuage:['A', 'C'], ratFuite:['A'],
  ratCritique:['A', 'C'],       /* refait le 10 novembre ; Romain garde A « Coup de tonnerre » et C « Déflagration » (9 novembre, 10 h 41) */
  explo:['A', 'B', 'C'], combat:['A', 'B'], victoire:['A', 'B'], fuite:['A', 'B'],
  icone:[]                      /* le petit son quand on touche une icône d'arme ou de potion : 3 propositions dans l'Atelier, en attente du choix de Romain */
};
/* un rat enragé crie plus grave et plus rauque */
var VOIX_ENRAGE = {h:.82, rauque:.38, grain:.2};

/* ---------- le montage : bruitages + réverbération de souterrain + ambiance ---------- */
function impulsion(duree, pente){
  var n = Math.floor(ctx.sampleRate * duree), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for(var c = 0; c < 2; c++){
    var d = b.getChannelData(c), lp = 0;
    for(var i = 0; i < n; i++){
      var x = Math.random() * 2 - 1;
      lp = lp + (x - lp) * (0.25 + 0.6 * (1 - i / n));     /* les échos s'assombrissent en s'éteignant */
      d[i] = lp * Math.pow(1 - i / n, pente) * (i < ctx.sampleRate * .012 ? i / (ctx.sampleRate * .012) : 1);
    }
  }
  return b;
}
function demarrer(){
  var AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  if(!ctx){
    try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}   /* sur iPad : jouer même en mode silencieux */
    try{ ctx = new AC(); }catch(e){ ctx = null; return; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
    comp.connect(ctx.destination);
    sortie = ctx.createGain(); sortie.gain.value = actif ? 1 : 0; sortie.connect(comp);
    bruits = ctx.createGain(); bruits.gain.value = .85; bruits.connect(sortie);
    /* le moteur de l'atelier des sons, branché dans la même sortie (le bouton 🔇 coupe tout) ; sa « cave » sert aussi aux petits bruits d'ici */
    if(window.Moteur){
      A = window.Moteur(ctx, {sortie:sortie, volume:1}); A.sfx.gain.value = .9;
      /* deux bus : la musique et les bruitages, chacun avec sa propre part de réverbération (le volume de l'un ne touche pas l'autre) */
      function gn(v){ var g = ctx.createGain(); g.gain.value = v; return g; }
      BUS = {};
      ['musique', 'bruitages'].forEach(function(k){ BUS[k] = {sec:gn(VOL[k]), cave:gn(VOL[k]), grotte:gn(VOL[k])}; BUS[k].sec.connect(A.volume); BUS[k].cave.connect(A.caveIn); BUS[k].grotte.connect(A.grotteIn); });
      A.mus.disconnect(); A.mus.connect(BUS.musique.sec);
      A.sfx.disconnect(); A.sfx.connect(BUS.bruitages.sec);
      var prise0 = A.prise;
      A.prise = function(t, niv, vers){
        var P = prise0(t, niv, vers), b = vers === 'mus' ? BUS.musique : BUS.bruitages;
        P.cave.disconnect(); P.grotte.disconnect(); P.cave.connect(b.cave); P.grotte.connect(b.grotte);
        return P;
      };
      bruits.disconnect(); bruits.connect(BUS.bruitages.sec);
      revIn = BUS.bruitages.cave;
      sfxPre = gn(.95); sfxPre.connect(BUS.bruitages.sec);          /* les bruitages fabriqués à l'avance (leur écho est déjà dedans) */
    }
    else { var rev = ctx.createConvolver(); rev.buffer = impulsion(2.8, 2.6); var revG = ctx.createGain(); revG.gain.value = .55; rev.connect(revG); revG.connect(sortie); revIn = ctx.createGain(); revIn.connect(rev); bruits.gain.value = .85 * VOL.bruitages; }
    var n = ctx.sampleRate * 2;
    /* (mémoire de l'iPhone : le bruit blanc est celui du moteur ; le brun, presque sans aigus, est fabriqué à 12 000 Hz, avec la même pente et le même volume) */
    var srb = Math.min(ctx.sampleRate, 12000), nb = srb * 2, rb = ctx.sampleRate / srb, kb = .02 * rb, l = 0;
    blanc = A ? A.blanc : ctx.createBuffer(1, n, ctx.sampleRate); brun = ctx.createBuffer(1, nb, srb);
    if(!A){ var db = blanc.getChannelData(0); for(var i = 0; i < n; i++) db[i] = Math.random() * 2 - 1; }
    var dr = brun.getChannelData(0);
    for(var j = 0; j < nb; j++){ l = (l + kb * (Math.random() * 2 - 1)) / (1 + kb); dr[j] = l * 3.5 / Math.sqrt(rb); }
    setInterval(programme, 150);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && ctx.state === 'suspended'){ try{ ctx.resume(); }catch(e){} } });
  }
  if(ctx.state === 'suspended' || ctx.state === 'interrupted'){ try{ ctx.resume(); }catch(e){} }
  appliquerMusique();
}
function pret(){ return !!ctx && actif && ctx.state !== 'closed'; }
function pretBruit(){ return pret() && VOL.bruitages > 0; }
var sfxPre = null;
/* Son.volume('musique' | 'bruitages', v) : règle (v de 0 à 1) et mémorise ; sans v, rend la valeur actuelle */
function volume(type, v){
  if(type !== 'musique' && type !== 'bruitages') return null;
  if(v == null) return VOL[type];
  v = Math.max(0, Math.min(1, +v || 0)); VOL[type] = v;
  try{ localStorage.setItem('salle-rats-vol-' + type, String(v)); }catch(e){}
  if(ctx && BUS){ var b = BUS[type], t = ctx.currentTime; [b.sec, b.cave, b.grotte].forEach(function(g){ g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(v, t, .05); }); }
  else if(ctx && type === 'bruitages' && bruits) bruits.gain.setTargetAtTime(.85 * v, ctx.currentTime, .05);
  if(type === 'musique') appliquerMusique();                          /* à zéro, la musique s'arrête vraiment (le téléphone souffle) */
  return v;
}

/* =================== les bruitages de l'atelier (versions tirées au hasard) =================== */
function niveau(cle){ return (window.NIVEAUX || {})[cle] || 1; }
/* id : « arc », « ratFeu »… ; o.dt : retard en secondes ; o.voix : la voix du rat (o.enrage : la voix enragée) ;
   o.partie : pour le critique, « avant », « impact » ou « explosion ». Rend {duree, moment} (ou null). */
/* le critique est joué en plusieurs morceaux (avant, impact, explosion) : on tire sa version UNE fois par coup,
   au premier morceau, et les morceaux suivants (dans les 5 secondes) gardent la même. La A n'a pas de morceau « avant » :
   son ralenti reste silencieux, comme dans la version que Romain a écoutée et gardée. */
var critique = {v:null, quand:0};
function versionDe(id, o){
  if(o.version) return o.version;
  if(PRE.sfxV[id]) return PRE.sfxV[id];                          /* pendant un combat : la version fabriquée à l'avance pour ce combat */
  if(!o.partie) return tire(CHOIX[id]);
  var maintenant = Date.now();
  if(o.partie === 'avant' || !critique.v || maintenant - critique.quand > 5000) critique.v = tire(CHOIX[id]);
  critique.quand = maintenant;
  return critique.v;
}
function bruitage(id, o){
  o = o || {};
  if(!pretBruit() || !A || !window.BRUITAGES || !CHOIX[id] || !CHOIX[id].length) return null;   /* rien de choisi (l'icône) : silence */
  var v = versionDe(id, o), cle = id + v, fn = window.BRUITAGES[cle];
  if(!fn) return null;
  if(o.cale != null && fn.moment != null) o.dt = o.cale - fn.moment;     /* on cale l'instant clé du son sur celui de l'animation */
  var t = ctx.currentTime + .02 + Math.max(0, o.dt || 0);
  /* déjà fabriqué à l'avance : on joue l'enregistrement (presque rien à calculer), remis à sa place à gauche ou à droite */
  var pre = sfxPre && PRE.sfx[cle + (o.partie ? ':' + o.partie : '')];
  if(pre){
    var src = ctx.createBufferSource(), sortiePre = sfxPre, pan = null; src.buffer = pre.buf;
    if(pre.pan && ctx.createStereoPanner){ pan = ctx.createStereoPanner(); pan.pan.value = pre.pan; pan.connect(sfxPre); sortiePre = pan; }
    src.connect(sortiePre); src.start(t);
    src.onended = function(){ try{ src.disconnect(); if(pan) pan.disconnect(); }catch(e){} };
    var C0 = o.partie && window.BRUITAGES.CRITIQUE[v];
    return {duree:C0 ? C0.duree : (PRE.duree[cle] || pre.buf.duration), moment:fn.moment, version:v, pre:true};
  }
  var P = A.prise(t, niveau(cle)), r = null;
  if(o.un) P.un = 1;                                   /* (un seul pas du Gardien, au lieu des deux de l'Atelier) */
  A.voix = o.enrage ? VOIX_ENRAGE : (o.voix || null);
  try{
    if(o.partie){ var C = window.BRUITAGES.CRITIQUE[v]; if(C && C[o.partie]) C[o.partie](A, P, t); r = {duree:C ? C.duree : 3}; }
    else r = window.BRUITAGES[cle](A, P) || {duree:1};
  }catch(e){ if(window.console) console.warn('son', cle, e); r = {duree:1}; }
  A.voix = null;
  r.version = v;
  setTimeout(function(){ P.lacher(); }, ((t - ctx.currentTime) + (r.duree || 1) + 5) * 1000);
  return r;
}

/* =================== la musique ===================
   La salle d'essai : 'explo' (le sac, la fin) et 'combat' (+ la couleur « le puits »).
   Le donjon complet (Romain, 10 novembre : « la musique est très redondante, la boucle est trop petite ») :
     'salle:<zone>'   l'ambiance d'une zone : le fond du donjon + la couleur de la zone (puits, canaux, toiles, atelier,
                      ossuaire) — sur la carte, dans les salles et pendant les combats ordinaires (plus de musique de combat) ;
     'grand:<nom>'    la longue musique d'un grand combat (gardien, roi, boss) ;
     'repos'          le feu de camp (sa musique + le feu qui crépite) ;   'fin' : Léo retrouvé.
   D'une zone à l'autre, ce qui joue déjà (le fond du donjon) n'est pas coupé. */
var MUS = {voulu:null, actuel:null, combat:false};
function musique(nom){ MUS.attendue = null; MUS.voulu = nom || null; appliquerMusique(); }
/* passer à une musique seulement quand elle est fabriquée : en attendant, celle d'avant continue (pas de trou de silence
   au début d'un grand combat, même sur une vieille tablette qui met du temps à fabriquer une longue musique) */
function musiqueDesQuePrete(nom){
  var cles;
  if(!PRE.possible || !ctx){ musique(nom); return; }
  try{ cles = clesDe(nom).filter(function(c){ return !!window.MUSIQUES[c]; }); }catch(e){ musique(nom); return; }
  MUS.attendue = nom;
  Promise.all(cles.map(function(c){ return PRE.demander(c, true); })).then(function(){ if(MUS.attendue === nom) musique(nom); });
}
function famille(c){ return c.replace(/[A-C]$/, ''); }
/* la clé d'une musique : son nom s'il n'y en a qu'une (le puits, le fond du donjon), sinon la version choisie */
function cleMus(f){ return window.MUSIQUES[f] ? f : PRE.cle(f); }
function clesDe(v){
  if(!v) return [];
  if(v === 'combat') return [PRE.cle('combat'), 'puits'];
  if(v === 'explo') return [PRE.cle('explo')];
  if(v === 'repos') return [cleMus('repos'), cleMus('feuCamp')];
  if(v === 'fin') return [cleMus('finDonjon')];
  var k = v.split(':');
  if(k[0] === 'salle') return ['donjon', cleMus(k[1])];
  if(k[0] === 'grand') return [cleMus(k[1])];
  return [cleMus(v)];
}
function appliquerMusique(){
  if(!ctx || !A || !window.MUSIQUES || ctx.state === 'closed') return;
  var v = actif && VOL.musique > 0 ? MUS.voulu : null, cur = MUS.actuel ? MUS.actuel.nom : null;
  if(cur === v) return;
  var now = ctx.currentTime, ancien = MUS.actuel, avant = ancien ? ancien.cles.slice() : [], cles, garde = {};
  try{ cles = clesDe(v).filter(function(c){ return !!window.MUSIQUES[c]; }); }catch(e){ if(window.console) console.warn('musique', v, e); cles = []; }
  if(ancien){
    ancien.fini = true; MUS.actuel = null;
    ancien.cles.forEach(function(c){ var l = ancien.par[c] || []; if(cles.indexOf(c) >= 0 && l.length) garde[c] = l; else l.forEach(function(j){ j.arreter(now, 3); }); });
  }
  PRE.changement(avant, cles, v);
  if(!v) return;
  var M = MUS.actuel = {nom:v, cles:cles, par:{}, fini:false};
  M.arreter = function(t, f){ M.fini = true; Object.keys(M.par).forEach(function(c){ M.par[c].forEach(function(j){ j.arreter(t, f); }); }); };
  cles.forEach(function(c){
    if(garde[c]){ M.par[c] = garde[c]; return; }                       /* elle joue déjà : on ne la coupe pas */
    var l = M.par[c] = [];
    if(!PRE.possible){ l.push(musiqueEnDirect(c, now)); return; }
    var b = PRE.mus[famille(c)];
    if(b && b.cle === c) l.push(jouerBoucle(b));                       /* déjà fabriquée : elle part tout de suite */
    else PRE.demander(c, true).then(function(){                        /* sinon on attend la sienne (quelques secondes) */
      if(MUS.actuel !== M && !(MUS.actuel && MUS.actuel.par[c] === l)) return;
      var b2 = PRE.mus[famille(c)];
      l.push(b2 && b2.cle === c ? jouerBoucle(b2) : musiqueEnDirect(c, ctx.currentTime));   /* raté : en direct, comme avant */
    });
  });
}
/* le combat commence ou finit : les bruitages lourds (l'arc, le critique, la victoire, la fuite) sont fabriqués pour ce
   combat, puis libérés. (Dans la salle d'essai, c'est la musique 'combat' qui le dit.) */
function enCombat(on){
  on = !!on;
  if(MUS.combat === on) return;
  MUS.combat = on;
  if(!PRE.possible) return;
  if(on) setTimeout(function(){ if(MUS.combat) PRE.demander('bruitages'); }, 2500);
  else setTimeout(function(){ if(MUS.combat) return; PRE.sfx = {}; PRE.sfxV = {}; delete PRE.attente.bruitages; }, 9000);
}
/* la musique fabriquée en direct (l'ancienne façon : seulement si le navigateur ne sait pas fabriquer à l'avance) */
function musiqueEnDirect(c, now){
  var t = now + .05, P = A.prise(t, niveau(c), 'mus');
  [P.sec, P.cave, P.grotte].forEach(function(g){ g.gain.setValueAtTime(0, t); g.gain.setTargetAtTime(P.niveau, t, 1.1); });   /* le fondu d'entrée */
  var I = window.MUSIQUES[c](A, P); I.pas(now + 1.2);
  return I;
}
/* une musique fabriquée à l'avance : elle tourne en boucle sans couture, à partir d'un endroit au hasard, avec un fondu d'entrée */
function jouerBoucle(b){
  var t = ctx.currentTime + .05, src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = b.buf; src.loop = true; src.loopStart = b.debut; src.loopEnd = b.fin;
  g.gain.setValueAtTime(0, t); g.gain.setTargetAtTime(1, t, 1.1);
  src.connect(g); g.connect(A.mus);
  src.start(t, b.debut + Math.random() * (b.fin - b.debut));
  return {arreter:function(t2, fondu){
    g.gain.cancelScheduledValues(t2); g.gain.setValueAtTime(g.gain.value, t2); g.gain.setTargetAtTime(0, t2, (fondu || 1.5) / 4);
    try{ src.stop(t2 + (fondu || 1.5) + .3); }catch(e){}
    src.onended = function(){ try{ src.disconnect(); g.disconnect(); }catch(e){} };
  }};
}
function programme(){
  if(!ctx || !MUS.actuel) return;
  var j = ctx.currentTime + 1.2, M = MUS.actuel;
  Object.keys(M.par).forEach(function(c){ M.par[c].forEach(function(I){ if(I.pas) I.pas(j); }); });
}

/* =================== le pré-calcul : fabriquer à l'avance, hors ligne, par petits morceaux ===================
   9 novembre (le critique faisait fermer la page sur l'iPhone, faute de mémoire) : on garde le moins possible en mémoire.
   - Les musiques : en MONO, à 16 000 Hz (rien au-dessus de 8 kHz : moins de −38 dB, on ne l'entend pas), une boucle d'un
     cycle d'accords. UNE seule version gardée par musique (exploration, combat, le puits) ; quand une musique s'arrête,
     on libère sa boucle et on fabrique la prochaine version tirée au hasard, pour la fois suivante.
   - Les bruitages lourds (l'arc, le critique, la victoire, la fuite) : fabriqués seulement pendant le combat, une version
     tirée pour tout le combat, en mono à 32 000 Hz et remis à leur place à gauche ou à droite en les jouant
     (l'explosion C reste en stéréo : son souffle traverse la salle) ; libérés après le combat.
   - Les rats (leur voix change quand ils sont enragés) restent fabriqués en direct. */
var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
var PRE = {possible:!!(OAC && window.Moteur && window.MUSIQUES), mus:{}, sfx:{}, sfxV:{}, prochain:{}, duree:{}, attente:{}, file:[], occupe:false, pireTache:0, taches:{}, fait:0};
var SR_MUS = 16000, SR_SFX = 32000;
/* la longueur de chaque boucle (en secondes) : un cycle d'accords ; C : le fondu entre la fin et le début ; lin : fondu droit (musique rythmée) ;
   n0 : on fait commencer la musique à cette mesure, pour que la boucle garde les deux airs de la boîte à musique (exploration B) */
var BOUCLE = {exploA:{L:44}, exploB:{L:32, n0:7}, exploC:{L:48}, combatA:{L:32 * 60 / 66, C:1.5, lin:true}, combatB:{L:16 * 60 / 84, C:1.5, lin:true}, puits:{L:12},
  /* le donjon complet : des boucles longues (48 à 116 s), pour qu'on n'entende pas la musique « tourner » */
  donjon:{L:56}, toiles:{L:48}, atelier:{L:48}, canauxA:{L:60}, canauxB:{L:60}, ossuaireA:{L:60}, ossuaireB:{L:60},
  reposA:{L:64}, reposB:{L:70.4}, feuCampA:{L:40}, feuCampB:{L:40}, finDonjonA:{L:64}, finDonjonB:{L:64},
  gardienA:{L:128 * 60 / 66, C:1.5, lin:true}, roiA:{L:128 * 60 / 84, C:1.5, lin:true},
  bossA:{L:128 * 60 / 92, C:1.5, lin:true}, bossB:{L:96 * 60 / 76, C:1.5, lin:true}, bossC:{L:128 * 60 / 100, C:1.5, lin:true}};
/* les bruitages lourds : [id, morceau, place à gauche (−) ou à droite (+), stéréo] — une version par combat */
var SFX_PRE = {arc:[[null, -.35]], ratCritique:[['avant', .35], ['impact', .35], ['explosion', .35]], victoire:[[null, 0]], fuite:[[null, -.5]]};
var SFX_DUREE = {arc:3.5, victoire:6.5, fuite:8, avant:3.5, impact:5.5, explosion:8.5};
/* la version d'une musique : celle qui est (ou sera) prête ; tirée au hasard la première fois */
PRE.cle = function(fam){
  if(fam === 'puits') return 'puits';
  if(PRE.mus[fam]) return PRE.mus[fam].cle;
  if(!PRE.prochain[fam]) PRE.prochain[fam] = tire(CHOIX[fam]);
  return fam + PRE.prochain[fam];
};
/* quand la musique change : la musique qui s'arrête libère sa boucle et prépare sa prochaine version ;
   en entrant en combat, on fabrique les bruitages lourds ; en sortant, on les libère */
/* les musiques qu'on garde prêtes même quand elles ne jouent pas. La salle d'essai : l'exploration, le combat, le puits.
   Le donjon complet : seulement son fond commun ; les autres sont libérées en sortant, et refabriquées à la demande. */
function gardees(){ return window.DJ_MUSIQUES_GARDEES || ['explo', 'combat', 'puits']; }
PRE.changement = function(avant, apres, nom){
  if(!PRE.possible) return;
  var fams = apres.map(famille);
  avant.map(famille).forEach(function(f){
    if(fams.indexOf(f) >= 0) return;
    var plusieurs = CHOIX[f] && CHOIX[f].length >= 2, garder = gardees().indexOf(f) >= 0;
    if(!plusieurs && garder) return;                                   /* une seule version, et on la rejoue souvent : on la garde */
    setTimeout(function(){                                             /* (après le fondu de sortie) */
      if(MUS.actuel && MUS.actuel.cles.map(famille).indexOf(f) >= 0) return;
      var ancienne = PRE.mus[f] && PRE.mus[f].cle.slice(-1);
      delete PRE.mus[f];                                               /* sa boucle est libérée */
      if(!plusieurs) return;
      var l = CHOIX[f].filter(function(x){ return x !== ancienne; });
      PRE.prochain[f] = tire(l.length ? l : CHOIX[f]);                 /* la prochaine version, tirée au hasard… */
      if(garder) PRE.demander(f + PRE.prochain[f]);                    /* … et fabriquée tout de suite, pour la fois suivante */
    }, 4000);
  });
  /* la salle d'essai : la musique 'combat' dit qu'on est en combat */
  if(nom === 'combat') enCombat(true);
  else if(avant.length && famille(avant[0]) === 'combat') enCombat(false);
};
/* fabriquer une musique à l'avance, sans la jouer (le donjon : la longue musique d'un grand combat, quand on s'en approche).
   Ce qui était prêt et ne joue pas est libéré : jamais plus d'une musique « d'avance » en mémoire. */
function preparer(nom){
  if(!PRE.possible || !window.MUSIQUES) return;
  var cles; try{ cles = clesDe(nom).filter(function(c){ return !!window.MUSIQUES[c]; }); }catch(e){ return; }
  var fams = cles.map(famille), joue = MUS.actuel ? MUS.actuel.cles.map(famille) : [];
  Object.keys(PRE.mus).forEach(function(f){ if(fams.indexOf(f) < 0 && joue.indexOf(f) < 0 && gardees().indexOf(f) < 0) delete PRE.mus[f]; });
  cles.forEach(function(c){ PRE.demander(c); });
}
function chrono(fn, nom){ var d = performance.now(); try{ return fn(); } finally { var ms = performance.now() - d; PRE.pireTache = Math.max(PRE.pireTache, ms); if(nom) PRE.taches[nom] = Math.max(PRE.taches[nom] || 0, Math.round(ms)); } }
function rendre(off){
  return new Promise(function(ok, ko){
    off.oncomplete = function(e){ ok(e.renderedBuffer); };
    try{ var p = off.startRendering(); if(p && p.then) p.then(ok, ko); }catch(e){ ko(e); }
  });
}
/* une musique : on la fait tourner F secondes pour qu'elle soit bien installée, puis on garde L secondes ; les C secondes d'après sont fondues dans le début */
function rendreMusique(cle){
  var B = (window.DJ_BOUCLES && window.DJ_BOUCLES[cle]) || BOUCLE[cle] || {L:24}, sr = SR_MUS, F = 6, C = B.C || 3, L = B.L, duree = F + L + C, pas = 2;
  var off = new OAC(1, Math.ceil(sr * duree), sr), Ao, I;
  chrono(function(){
    Ao = window.Moteur(off, {horsLigne:true, brut:true, volume:1}); I = window.MUSIQUES[cle](Ao, Ao.prise(0, niveau(cle), 'mus'));
    if(B.n0 && I.gens && I.gens[0]) I.gens[0].n = B.n0;
    I.pas(pas + .5);
  }, 'debut-musique');
  if(off.suspend){
    for(var t = pas; t < duree; t += pas) (function(t){
      off.suspend(t).then(function(){ chrono(function(){ I.pas(Math.min(duree, t + pas + .5)); }, 'morceau-musique'); off.resume(); });
    })(t);
  } else chrono(function(){ I.pas(duree); });
  return rendre(off).then(function(x){
    /* on ne garde que la boucle (de F à F + L) ; son début reçoit, en fondu, ce qui suit sa fin */
    return chrono(function(){
      var n = Math.round(L * sr), nc = Math.round(C * sr), f0 = Math.round(F * sr), a = x.getChannelData(0), y = off.createBuffer(1, n, sr), b = y.getChannelData(0);
      b.set(a.subarray(f0, f0 + n));
      for(var i = 0; i < nc; i++){
        var u = i / nc, wi = B.lin ? u : Math.sin(u * Math.PI / 2), wo = B.lin ? 1 - u : Math.cos(u * Math.PI / 2);
        b[i] = a[f0 + i] * wi + a[f0 + n + i] * wo;
      }
      return {cle:cle, buf:y, debut:0, fin:n / sr};
    }, 'boucle');
  });
}
/* un bruitage lourd, seul dans son petit rendu : mono (sans placement), sauf l'explosion C ; puis coupé à la fin du son */
function rendreUnBruitage(id, v, partie, stereo){
  var cle = id + v, sr = SR_SFX, d = SFX_DUREE[partie || id] || 6, can = stereo ? 2 : 1, off = new OAC(can, Math.ceil(sr * d), sr), Ao;
  if(!stereo) try{ off.createStereoPanner = null; }catch(e){}            /* mono : la place gauche/droite est remise en le jouant */
  chrono(function(){
    Ao = window.Moteur(off, {horsLigne:true, brut:true, volume:1});
    var P = Ao.prise(.02, niveau(cle));
    if(partie){ var C = window.BRUITAGES.CRITIQUE[v]; if(C && C[partie]) C[partie](Ao, P, .02); }
    else { var r = window.BRUITAGES[cle](Ao, P); if(r && r.duree) PRE.duree[cle] = r.duree; }
  }, 'un-bruitage');
  return rendre(off).then(function(x){
    return chrono(function(){
      var ch = [], c, i, n = x.length, fin = 0;
      for(c = 0; c < can; c++) ch.push(x.getChannelData(c));
      for(i = n - 1; i > 0 && !fin; i -= 16) for(c = 0; c < can; c++) if(ch[c][i] > 2e-4 || ch[c][i] < -2e-4){ fin = Math.min(n, i + 16); break; }
      var m = Math.max(1, Math.min(n, fin + Math.floor(sr * .05))), y = off.createBuffer(can, m, sr), fondu = Math.floor(sr * .03);
      for(c = 0; c < can; c++){ var dd = y.getChannelData(c), src = ch[c]; dd.set(src.subarray(0, m)); for(i = Math.max(0, m - fondu); i < m; i++) dd[i] *= (m - i) / fondu; }
      return y;
    }, 'decoupe');
  });
}
/* les bruitages lourds de ce combat : une version tirée par son, l'un après l'autre */
function rendreBruitages(){
  var l = [];
  Object.keys(SFX_PRE).forEach(function(id){
    if(!CHOIX[id] || !CHOIX[id].length) return;
    var v = PRE.sfxV[id] || (PRE.sfxV[id] = tire(CHOIX[id]));
    SFX_PRE[id].forEach(function(e){
      var C = e[0] && window.BRUITAGES.CRITIQUE[v];
      if(e[0] && !(C && C[e[0]])) return;                                /* la A n'a pas de morceau « avant » */
      l.push({id:id, v:v, partie:e[0], pan:e[1], stereo:id === 'ratCritique' && v === 'C' && e[0] === 'explosion'});
    });
  });
  return l.reduce(function(p, e){
    return p.then(function(){
      if(!MUS.combat && PRE.tout_ === undefined) return;                 /* le combat est fini : on n'en fabrique pas plus */
      return rendreUnBruitage(e.id, e.v, e.partie, e.stereo).then(function(y){ PRE.sfx[e.id + e.v + (e.partie ? ':' + e.partie : '')] = {buf:y, pan:e.stereo ? 0 : e.pan}; });
    });
  }, Promise.resolve()).then(function(){ return true; });
}
/* la file d'attente : une chose à la fois, la plus urgente d'abord */
PRE.demander = function(cle, urgent){
  var f = famille(cle);
  if(cle !== 'bruitages' && PRE.mus[f] && PRE.mus[f].cle === cle) return Promise.resolve(PRE.mus[f]);
  if(!PRE.attente[cle]){
    PRE.attente[cle] = new Promise(function(ok){ PRE.file[urgent ? 'unshift' : 'push']({cle:cle, ok:ok}); });
    setTimeout(suivant, 0);
  } else if(urgent){
    var i = PRE.file.map(function(j){ return j.cle; }).indexOf(cle);
    if(i > 0) PRE.file.unshift(PRE.file.splice(i, 1)[0]);
  }
  return PRE.attente[cle];
};
function suivant(){
  if(PRE.occupe) return;
  if(!PRE.file.length){ window.Moteur.oublier(SR_MUS); window.Moteur.oublier(SR_SFX); return; }   /* plus rien à fabriquer : on libère les réserves */
  var j = PRE.file.shift(); PRE.occupe = true;
  var p = j.cle === 'bruitages' ? rendreBruitages() : rendreMusique(j.cle).then(function(b){
    var f = famille(j.cle);
    if(PRE.prochain[f] && f + PRE.prochain[f] === j.cle) delete PRE.prochain[f];
    var joue = MUS.actuel && MUS.actuel.cles.indexOf(j.cle) < 0 && MUS.actuel.cles.map(famille).indexOf(f) >= 0;
    if(!joue) PRE.mus[f] = b;                                          /* (jamais à la place d'une version de la même musique en train de jouer) */
    return b;
  });
  p.then(function(r){ PRE.fait++; return r; }, function(e){ if(window.console) console.warn('pré-calcul', j.cle, e); })
   .then(function(r){ delete PRE.attente[j.cle]; PRE.occupe = false; j.ok(r); setTimeout(suivant, 60); });
}
/* au chargement : la musique d'exploration tirée, celle du combat et le puits (les bruitages lourds : au début du combat) */
function lancerPrecalcul(){
  if(!PRE.possible) return;
  if(window.DJ_MUSIQUES_DEPART){ window.DJ_MUSIQUES_DEPART.forEach(function(f){ try{ PRE.demander(cleMus(f)); }catch(e){} }); return; }   /* le donjon complet dit lesquelles */
  PRE.demander(PRE.cle('explo')); PRE.demander(PRE.cle('combat')); PRE.demander('puits');
}
if(document.readyState === 'complete') setTimeout(lancerPrecalcul, 600);
else window.addEventListener('load', function(){ setTimeout(lancerPrecalcul, 600); });
/* la mémoire prise par ce qui est fabriqué à l'avance (en Mo) */
PRE.memoire = function(){
  var o = 0;
  Object.keys(PRE.mus).forEach(function(k){ o += PRE.mus[k].buf.length * PRE.mus[k].buf.numberOfChannels * 4; });
  Object.keys(PRE.sfx).forEach(function(k){ o += PRE.sfx[k].buf.length * PRE.sfx[k].buf.numberOfChannels * 4; });
  return Math.round(o / 1e5) / 10;
};
/* pour les mesures : fabriquer les trois musiques et les bruitages lourds, et dire quand c'est fini */
PRE.tout = function(){
  if(!PRE.possible) return Promise.resolve({possible:false});
  PRE.tout_ = true;
  var l = [PRE.demander(PRE.cle('explo')), PRE.demander(PRE.cle('combat')), PRE.demander('puits'), PRE.demander('bruitages')];
  return Promise.all(l).then(function(){ delete PRE.tout_; return {pireTache:Math.round(PRE.pireTache), musiques:Object.keys(PRE.mus).length, bruitages:Object.keys(PRE.sfx).length, memoire:PRE.memoire()}; });
};
PRE.etat = function(){ return {taches:PRE.taches, possible:PRE.possible, musiques:Object.keys(PRE.mus).map(function(f){ return PRE.mus[f].cle; }), bruitages:Object.keys(PRE.sfx).length,
  memoire:PRE.memoire(), file:PRE.file.map(function(j){ return j.cle; }), occupe:PRE.occupe}; };

/* la musique baisse pendant une fanfare (sec : combien de temps), puis remonte */
function baisser(sec){
  if(!ctx || !A) return;   /* (A.mus : toute la musique, écho compris quand elle est fabriquée à l'avance) */
  var g = A.mus.gain, now = ctx.currentTime;
  g.cancelScheduledValues(now); g.setValueAtTime(g.value, now);
  g.setTargetAtTime(.28, now, .12); g.setTargetAtTime(1, now + (sec || 3), .7);
}
function t0(dt){ return ctx.currentTime + (dt || 0) + .01; }
/* une sortie : sec vers les bruitages, et un peu (ou beaucoup) dans la réverbération */
function bus(humide, vers){
  var g = ctx.createGain(); g.connect(vers || bruits);
  var h = ctx.createGain(); h.gain.value = humide == null ? .25 : humide; g.connect(h); h.connect(revIn);
  return g;
}
function enveloppe(g, t, gain, a, d, tenue){
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(gain, .0002), t + a);
  if(tenue) g.gain.setValueAtTime(Math.max(gain, .0002), t + a + tenue);
  g.gain.exponentialRampToValueAtTime(.0001, t + a + (tenue || 0) + d);
}
/* un oscillateur (o.f2 : glissando ; o.lp : filtre ; o.vib : vibrato [vitesse, ampleur]) */
function ton(t, o, dest){
  var x = ctx.createOscillator(), g = ctx.createGain(), fin = t + (o.a || .005) + (o.tenue || 0) + o.d;
  x.type = o.type || 'sine';
  x.frequency.setValueAtTime(o.f, t);
  if(o.pts) o.pts.forEach(function(p){ x.frequency.linearRampToValueAtTime(p[1], t + p[0]); });
  if(o.f2) x.frequency.exponentialRampToValueAtTime(o.f2, t + (o.gl || o.d));
  if(o.det) x.detune.value = o.det;
  if(o.vib){ var v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = o.vib[0]; vg.gain.value = o.vib[1]; v.connect(vg); vg.connect(x.frequency); v.start(t); v.stop(fin + .05); }
  enveloppe(g, t, o.g, o.a || .005, o.d, o.tenue);
  var src = x;
  if(o.lp){ var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o.lp, t); if(o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t + (o.lpt || o.d)); f.Q.value = o.lq || .7; x.connect(f); src = f; }
  src.connect(g); g.connect(dest);
  x.start(t); x.stop(fin + .05);
  return x;
}
/* un souffle de bruit filtré (o.type : bandpass, lowpass, highpass ; o.f2 : balayage du filtre) */
function souffle(t, o, dest){
  var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = o.brun ? brun : blanc; s.loop = true;
  f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f, t);
  if(o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + (o.gl || o.d));
  f.Q.value = o.q || 1;
  enveloppe(g, t, o.g, o.a || .003, o.d, o.tenue);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t, Math.random() * 1.5); s.stop(t + (o.a || .003) + (o.tenue || 0) + o.d + .05);
  return g;
}
/* une corde pincée (Karplus-Strong) : la corde de l'arc */
function corde(t, f, duree, gain, dest){
  var d = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), out = ctx.createGain();
  d.delayTime.value = 1 / f; fb.gain.value = .985; lp.type = 'lowpass'; lp.frequency.value = 2600;
  var ex = ctx.createBufferSource(); ex.buffer = blanc;
  var eg = ctx.createGain(); eg.gain.setValueAtTime(gain, t); eg.gain.setValueAtTime(0, t + 2 / f);
  ex.connect(eg); eg.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); d.connect(out); out.connect(dest);
  out.gain.setValueAtTime(1, t); out.gain.exponentialRampToValueAtTime(.0001, t + duree);
  fb.gain.setValueAtTime(.985, t + duree); fb.gain.linearRampToValueAtTime(0, t + duree + .05);
  ex.start(t); ex.stop(t + .05);
  setTimeout(function(){ try{ d.disconnect(); fb.disconnect(); out.disconnect(); }catch(e){} }, (duree + .3) * 1000 + (t - ctx.currentTime) * 1000);
}

/* =================== les bruitages =================== */
var B = {};
/* la course des héros : des bottes sur la pierre */
/* aigu (facultatif) : les mêmes pas, plus haut et plus sautillants — sur la carte du donjon (Romain, 11 novembre, 19 h 21 :
   « ce petit bruit de pas quand ils rentrent dans une salle, tu peux le mettre aussi quand ils se déplacent sur la carte, avec
   un bruit un peu plus aigu, un peu plus rigolo ») */
B.pasHeros = function(duree, n, aigu){
  var o = bus(.3), t = t0(), k = 0;
  n = n || 1; aigu = aigu || 1;
  for(var x = 0; x < duree; x += .15 / Math.max(1, n * .7)){
    var tt = t + x + hasard(0, .02), fort = Math.min(1, .35 + x / duree), saut = aigu > 1 && k % 2 ? 1.18 : 1;
    ton(tt, {f:hasard(95, 125) * aigu * saut, f2:48 * aigu * saut, d:.09 / Math.sqrt(aigu), g:.22 * fort}, o);
    souffle(tt, {type:'bandpass', f:hasard(1400, 2200) * Math.sqrt(aigu), q:.9, d:.05, g:.1 * fort}, o);
    if(k++ % 3 === 0) souffle(tt + .02, {type:'highpass', f:5200, d:.03, g:.025 * fort}, o);   /* les boucles de ceinture */
  }
};
/* le miaulement du chat de la porte aux quatre signes : le même que celui du labo (jeu/src/labo/15-sons.js, « miaou ») —
   deux notes qui glissent, « mi-aou » (Romain, 11 novembre, 19 h 21 : « quand le chat miaule, ce serait bien de lui faire un
   miaulement ») */
B.miaou = function(aigu){
  var o = bus(.25), t = t0(), k = aigu || 1;
  ton(t, {type:'triangle', f:620 * k, f2:940 * k, a:.05, d:.29, g:.16, lp:2400}, o);
  ton(t + .16, {type:'triangle', f:940 * k, f2:560 * k, a:.05, d:.25, g:.14, lp:2200}, o);
};
/* la course des rats : des griffes qui cliquettent, vite */
B.pasRats = function(duree){
  var o = bus(.3), t = t0();
  for(var x = 0; x < duree; x += hasard(.035, .06)){
    souffle(t + x, {type:'highpass', f:hasard(3200, 5200), d:hasard(.01, .02), g:hasard(.03, .08)}, o);
    if(Math.random() < .25) souffle(t + x, {type:'bandpass', f:900, q:2, d:.02, g:.04}, o);
  }
};
/* un couinement de rat (h : la hauteur ; enrage : la voix enragée) — avec la voix de rat de l'atelier si elle est là */
B.couine = function(dt, h, long, enrage){
  if(!pret()) return;
  if(A){
    var tc = t0(dt), P = A.prise(tc, 1);
    A.voix = enrage ? VOIX_ENRAGE : null;
    A.cri(tc, {forme:tire(['iik', 'aie', 'peur']), d:.15 * (long || 1), h:(h || 1) * hasard(.95, 1.05), grain:.6, g:.26}, A.bus(P, {rev:.3, pan:.45}));
    A.voix = null;
    setTimeout(function(){ P.lacher(); }, ((tc - ctx.currentTime) + 4) * 1000);
    return;
  }
  var o = bus(.35), t = t0(dt); h = h || 1; long = long || 1;
  var f = hasard(2100, 2700) * h;
  ton(t, {type:'sine', f:f * .8, pts:[[.04 * long, f * 1.18], [.13 * long, f * .92]], d:.16 * long, a:.012, g:.09, vib:[hasard(24, 34), f * .05]}, o);
  ton(t, {type:'triangle', f:f * 1.6, pts:[[.04 * long, f * 2.3], [.13 * long, f * 1.8]], d:.12 * long, a:.012, g:.025}, o);
};
/* le claquement de mâchoire */
B.machoire = function(dt){
  if(!pret()) return;
  var o = bus(.2), t = t0(dt);
  [0, .05].forEach(function(x){
    souffle(t + x, {type:'bandpass', f:2900, q:4, d:.016, g:.45}, o);
    ton(t + x, {type:'square', f:hasard(480, 560), d:.03, g:.05, lp:1400}, o);
  });
  souffle(t + .07, {type:'lowpass', f:1200, f2:300, d:.1, g:.22}, o);
};
/* la corde de l'arc, puis le sifflement de la flèche */
B.arc = function(){
  if(!pret()) return;
  var o = bus(.25), t = t0();
  corde(t, 104, 1.1, .7, o);
  souffle(t, {type:'bandpass', f:420, q:1.5, d:.06, g:.28}, o);
  souffle(t + .04, {type:'bandpass', f:3600, f2:900, q:9, a:.06, d:.32, g:.28}, bus(.15));
};
/* un coup qui porte (force de 0,5 à 1,5) */
B.impact = function(force, dt){
  if(!pret()) return;
  force = force || 1;
  var o = bus(.3), t = t0(dt);
  ton(t, {f:170, f2:42, d:.22, g:.55 * force}, o);
  souffle(t, {type:'lowpass', f:1100, f2:180, d:.16, g:.4 * force}, o);
  souffle(t, {type:'bandpass', f:2600, q:1, d:.025, g:.22 * force}, o);
};
/* une morsure sur un héros (le choc mou) */
B.morsure = function(dt){
  if(!pret()) return;
  var o = bus(.2), t = t0(dt);
  ton(t, {f:120, f2:55, d:.14, g:.4}, o);
  souffle(t, {type:'lowpass', f:700, d:.1, g:.25}, o);
};
/* le verre qui se brise */
B.verre = function(dt){
  if(!pret()) return;
  var o = bus(.45), t = t0(dt);
  ton(t, {f:4300, d:.09, g:.12}, o);
  souffle(t, {type:'highpass', f:4800, d:.13, g:.22}, o);
  for(var k = 0; k < 11; k++) ton(t + hasard(0, .22), {f:hasard(2500, 8200), d:hasard(.08, .45), g:hasard(.025, .08)}, o);
  souffle(t + .05, {type:'bandpass', f:3600, q:2.5, d:.3, g:.06}, o);
};
/* le feu qui prend, puis crépite (duree) */
B.feu = function(duree, dt){
  if(!pret()) return;
  var o = bus(.3), t = t0(dt); duree = duree || 1.6;
  souffle(t, {type:'bandpass', f:260, f2:2400, q:.8, a:.08, d:.5, g:.3}, o);
  souffle(t, {brun:true, type:'lowpass', f:520, a:.15, tenue:duree * .6, d:duree * .4, g:.22}, o);
  for(var x = 0; x < duree; x += hasard(.02, .07)) souffle(t + x, {type:'bandpass', f:hasard(1200, 5200), q:2, d:hasard(.005, .02), g:hasard(.04, .2) * (1 - x / duree * .6)}, o);
};
/* la brûlure qui revient au tour des rats : un petit souffle et des crépitements */
B.brule = function(dt){ if(!pret()) return; B.feu(.7, dt); };
/* le BONG de la louche : une cloche de métal aux harmoniques tordues */
B.bong = function(){
  if(!pret()) return;
  var o = bus(.55), t = t0(), f = 176;
  souffle(t, {type:'bandpass', f:1300, q:1, d:.04, g:.45}, o);
  ton(t, {f:95, f2:58, d:.16, g:.45}, o);
  [[1, .5, 2.6], [2.0, .2, 1.6], [2.76, .3, 1.9], [4.07, .14, 1.1], [5.4, .12, .8], [6.8, .06, .5], [8.2, .04, .35]].forEach(function(p){
    ton(t, {f:f * p[0], d:p[2], g:p[1] * .5, a:.002}, o);
    ton(t, {f:f * p[0] * 1.004, d:p[2] * .9, g:p[1] * .3, a:.002}, o);
  });
};
/* la toux (h : la hauteur ; les rats toussent aigu) */
B.toux = function(dt, h){
  if(!pret()) return;
  var o = bus(.3), t = t0(dt); h = h || 1;
  [[0, 1], [.2, .7]].forEach(function(p){
    souffle(t + p[0], {type:'bandpass', f:950 * h, q:1.6, a:.008, d:.15, g:.38 * p[1]}, o);
    souffle(t + p[0], {type:'bandpass', f:2500 * h, q:3, a:.008, d:.11, g:.12 * p[1]}, o);
    ton(t + p[0], {type:'sawtooth', f:180 * h, f2:120 * h, d:.12, g:.03 * p[1], lp:900}, o);
  });
};
/* le « splotch » de la colle */
B.splotch = function(dt){
  if(!pret()) return;
  var o = bus(.25), t = t0(dt);
  souffle(t, {type:'lowpass', f:2600, f2:160, q:3, d:.26, g:.5}, o);
  ton(t, {f:430, f2:62, d:.2, g:.38}, o);
  for(var k = 0; k < 4; k++) ton(t + .1 + k * .07, {f:hasard(260, 420), f2:hasard(600, 800), gl:.04, d:.06, g:.07}, o);
};
/* le scintillement magique (la lumière, la rune) */
B.magie = function(dt){
  if(!pret()) return;
  var o = bus(.8), t = t0(dt);
  [1046.5, 1318.5, 1568, 2093, 2637, 3136, 4186].forEach(function(f, k){
    ton(t + k * .045, {type:'triangle', f:f, d:.9, g:.05}, o);
    ton(t + k * .045, {f:f * 2, d:.5, g:.015}, o);
  });
  var g = souffle(t, {type:'highpass', f:6500, a:.1, d:.9, g:.06}, o);
  var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.type = 'square'; lfo.frequency.value = 17; lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); lfo.stop(t + 1.1);
};
/* le dôme du bouclier qui se forme */
B.dome = function(){
  if(!pret()) return;
  var o = bus(.6), t = t0();
  ton(t, {f:170, f2:520, gl:.55, d:1.3, a:.05, g:.14}, o);
  ton(t, {f:173, f2:527, gl:.55, d:1.2, a:.05, g:.1}, o);
  [523.3, 784, 1046.5, 1568].forEach(function(f, k){ ton(t + .2 + k * .03, {f:f, a:.25, d:1.4, g:.045}, o); });
  souffle(t, {type:'bandpass', f:380, f2:1700, q:.8, a:.1, d:.45, g:.12}, o);
};
/* le dôme qui encaisse une morsure */
B.absorbe = function(dt){
  if(!pret()) return;
  var o = bus(.6), t = t0(dt);
  ton(t, {f:1568, d:.6, g:.08}, o); ton(t, {f:2093, d:.5, g:.05}, o); ton(t, {f:784, d:.4, g:.06}, o);
  souffle(t, {type:'bandpass', f:1200, q:3, d:.15, g:.12}, o);
};
/* le GROS boum du critique */
B.boum = function(){
  if(!pret()) return;
  var o = bus(.7), t = t0();
  souffle(t, {type:'highpass', f:1500, d:.06, g:.7}, o);
  ton(t, {f:130, f2:30, gl:1, d:1.5, a:.002, g:1}, o);
  ton(t, {type:'triangle', f:65, f2:28, gl:1.2, d:1.6, g:.4}, o);
  souffle(t, {type:'lowpass', f:2600, f2:110, gl:1.3, d:1.7, a:.003, g:.85}, o);
  souffle(t + .05, {brun:true, type:'lowpass', f:240, d:2.4, a:.08, g:.55}, o);
  for(var k = 0; k < 14; k++) souffle(t + hasard(.03, .5), {type:'bandpass', f:hasard(1500, 6000), q:2, d:hasard(.01, .04), g:hasard(.05, .18)}, o);
};
/* l'aspiration juste avant le critique (le ralenti) */
B.aspire = function(){
  if(!pret()) return;
  var o = bus(.4), t = t0();
  souffle(t, {type:'bandpass', f:300, f2:3000, q:2, a:.28, d:.04, g:.22}, o);
  ton(t, {f:220, f2:880, gl:.3, a:.25, d:.05, g:.05}, o);
};
/* la fuite d'un rat : un couinement qui file, et ses griffes */
B.fuiteRat = function(){
  if(!pret()) return;
  var o = bus(.35), t = t0();
  ton(t, {f:3400, pts:[[.08, 3900], [.4, 1700]], d:.45, a:.01, g:.1, vib:[30, 220]}, o);
  ton(t + .5, {f:3000, pts:[[.25, 1500]], d:.3, a:.01, g:.06, vib:[30, 180]}, o);
  B.pasRats(.9);
};
/* la rage : un grondement et des cris */
B.rage = function(){
  if(!pret()) return;
  var o = bus(.35), t = t0();
  var x = ton(t, {type:'sawtooth', f:105, f2:85, d:.7, a:.05, g:.16, lp:900}, o);
  var am = ctx.createOscillator(), ag = ctx.createGain(); am.frequency.value = 23; ag.gain.value = 40; am.connect(ag); ag.connect(x.frequency); am.start(t); am.stop(t + .8);
  for(var k = 0; k < 3; k++) B.couine(.12 + k * .16, 1.25, .8);
};
/* le Sage tourne une page */
B.page = function(){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  souffle(t, {type:'bandpass', f:2400, f2:4800, q:1, d:.08, g:.16}, o);
  souffle(t + .1, {type:'bandpass', f:2000, f2:4200, q:1, d:.09, g:.12}, o);
};
/* les bulles de la potion qu'on prépare */
B.bulles = function(duree){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  for(var x = 0; x < (duree || .45); x += hasard(.03, .07)) ton(t + x, {f:hasard(180, 420), f2:hasard(500, 900), gl:.04, d:.05, g:hasard(.04, .09)}, o);
};
/* ce qui vole (la fiole, les herbes) */
B.vole = function(duree){
  if(!pret()) return;
  souffle(t0(), {type:'bandpass', f:500, f2:1900, q:1.2, a:(duree || .4) * .5, d:(duree || .4) * .5, g:.12}, bus(.2));
};
/* la dague : un sifflement et la lame */
B.dague = function(){
  if(!pret()) return;
  var o = bus(.25), t = t0();
  souffle(t, {type:'bandpass', f:900, f2:5200, q:3, d:.16, g:.32}, o);
  ton(t + .1, {f:2900, d:.18, g:.05}, o); ton(t + .1, {f:4100, d:.12, g:.03}, o);
};
/* un soin : une petite montée claire */
B.soin = function(){
  if(!pret()) return;
  var o = bus(.6), t = t0();
  [784, 988, 1175, 1568, 1976].forEach(function(f, k){ ton(t + k * .07, {type:'triangle', f:f, d:.55, g:.055}, o); });
};
/* le Cœur vaillant : un battement, puis la montée */
B.coeur = function(){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  [0, .16, .55, .71].forEach(function(x, k){ ton(t + x, {f:k % 2 ? 52 : 62, f2:40, d:.14, g:.6}, o); });
  setTimeout(B.soin, 900);
};
/* un héros tombe */
B.tombe = function(){
  if(!pret()) return;
  var o = bus(.3), t = t0();
  ton(t, {f:95, f2:38, d:.28, g:.55}, o);
  souffle(t, {type:'lowpass', f:450, d:.22, g:.32}, o);
  souffle(t + .03, {type:'bandpass', f:1600, d:.14, g:.07}, o);
};
/* la petite fanfare de victoire */
B.fanfare = function(){
  if(!pret()) return;
  var o = bus(.45), t = t0();
  function cuivre(tt, f, d, g){
    [-7, 7].forEach(function(det){ ton(tt, {type:'sawtooth', f:f, det:det, a:.03, tenue:d * .6, d:d * .4 + .15, g:g, lp:700, lp2:3200, lpt:.08, lq:1.5}, o); });
  }
  [[0, 392, .12], [.14, 523.3, .12], [.28, 659.3, .12], [.42, 784, .3]].forEach(function(n){ cuivre(t + n[0], n[1], n[2], .07); });
  [523.3, 659.3, 784, 1046.5].forEach(function(f){ cuivre(t + .8, f, 1.3, .05); });
  ton(t + .8, {f:98, f2:60, d:.4, g:.5}, o);
  setTimeout(function(){ B.magie(); }, 850);
};
/* un petit toc de doigt (choisir) */
B.clic = function(){
  if(!pret()) return;
  ton(t0(), {f:1250, f2:900, d:.045, g:.035}, bus(.15));
};

S.Son = {
  demarrer:demarrer,
  actif:function(){ return actif; },
  basculer:function(){
    actif = !actif;
    try{ localStorage.setItem('salle-rats-son', actif ? 'oui' : 'non'); }catch(e){}
    if(ctx) sortie.gain.setTargetAtTime(actif ? 1 : 0, ctx.currentTime, .05);
    appliquerMusique();          /* coupé : la musique s'arrête (la tablette souffle) ; remis : elle repart */
    return actif;
  },
  bruitage:bruitage,
  musique:musique,
  musiqueDesQuePrete:musiqueDesQuePrete,
  combat:enCombat,             /* le donjon : un combat commence (true) ou finit (false) — les bruitages lourds sont fabriqués, puis libérés */
  preparer:preparer,
  volume:volume,
  precalcul:{tout:function(){ return PRE.tout(); }, etat:function(){ return PRE.etat(); }, memoire:function(){ return PRE.memoire(); }},
  baisser:baisser,
  musiqueEtat:function(){ return {voulu:MUS.voulu, attendue:MUS.attendue || null, nom:MUS.actuel ? MUS.actuel.nom : null, cles:MUS.actuel ? MUS.actuel.cles.slice() : [], gain:A ? A.mus.gain.value : null,
    joue:MUS.actuel ? Object.keys(MUS.actuel.par).reduce(function(n, c){ return n + MUS.actuel.par[c].length; }, 0) : 0, combat:MUS.combat}; },
  jouer:function(nom){
    if(!pretBruit() || !B[nom]) return;
    try{ B[nom].apply(null, Array.prototype.slice.call(arguments, 1)); }catch(e){ if(window.console) console.warn('son', nom, e); }
  },
  liste:Object.keys(B),
  etat:function(){ return ctx ? ctx.state : 'pas encore'; }
};
})();
