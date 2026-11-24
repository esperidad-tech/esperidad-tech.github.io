/* ==========================================================
   Les héros « en volume » DANS LE DONJON — un premier essai (Romain, 23 novembre, 18 h 51 : « j'aimerais bien voir ce que ça donne
   dans le donjon. Donc si tu peux commencer à l'incruster dans le donjon. Et il faut qu'il ait sa tenue de combat »).
   Rien n'est changé dans le donjon : la page d'essai (donjon/construire-essai.py) reprend le donjon tel qu'il est en ligne et
   remplace seulement, au moment où il crée les héros, l'ancien Pisteur par la Pisteuse en volume (window.HerosAnime.creer).
   Elle répond aux mêmes ordres que l'ancien (entrer, attendre, choisi, tirer, dague, touche, tomber, relever, joie, entoile, avale,
   recrache, equiper…) : le combat ne voit pas la différence. Les deux autres héros restent les anciens.
   LES EFFETS : l'ancien Pisteur est toujours là, invisible (« l'ombre ») : on lui fait faire les mêmes gestes pour garder ses
   effets (le souffle de givre, le choc du poing, la lumière dorée, les confettis…). Ceux qui dépendent du corps (les étoiles,
   la poussière des pieds, la flèche qui part de l'arc, la lame) sont ses mêmes effets, posés sur le corps de la nouvelle.
   Et ceux des films (la toile, le ruban de la dague, les cristaux de givre, les rats, la bave) sont redessinés sur elle.
   Pas fait : les autres coiffures et apparences (elle est toujours la rousse à queue de cheval), Léo (phase 3 : être attrapée),
   les objets portés (equiper : retenu, pas dessiné sur elle), la flèche colorée encochée selon sa sorte.
   L'ALCHIMISTE EN VOLUME (Romain, 23 novembre, 20 h 46 : « tu peux faire toutes les animations pour l'alchimiste ») : le même
   adaptateur, avec son allure (le garçon au chignon, hv-base.js) et sa garde (HV.POSES.aGarde). Ses gestes à lui (hv-alchimiste.js) :
   preparer, lancer, louche, herbes — leurs effets (la fiole qui vole, le BONG, les feuilles) sont ceux de l'ancien Alchimiste, partis
   de ses mains à lui ; tous les autres ordres sont ceux de la Pisteuse.
   Chargé dans le <head>, AVANT le donjon : il attend que le donjon pose window.HerosAnime pour l'envelopper.
   ========================================================== */
(function(G){
'use strict';
var HV = G.HerosVues, PROTO = null, NUM = 0;
/* (le cadre : la boîte du héros fait 200 × 240 ; elle est 10 % plus grande qu'au premier essai — Romain, 20 h 05 : « elle est plus
   petite ». Ses pieds tombaient là où tombaient ceux de l'ancien (à 231,7 px du haut de la boîte) : pile sur la ligne où le mur
   rejoint le sol, son ombre à moitié sur le pied du mur, sombre — elle avait l'air de flotter devant le mur (Romain, 21 h 32). Ils
   sont maintenant 4,9 px plus bas (le sol, y = 414, à 236,6 px du haut de la boîte) : bien posés SUR le sol, comme les rats.) */
var CADRE = [-21.8, 24.2, 329.6, 395.5], CAP = 55;
/* (les effets des films sont écrits dans les pixels du film — cadre [-130, -64, 560, 560] dans une image de 900 : on garde leurs
   nombres, et le calque des effets prend ce repère-là) */
var KF = 900 / 560, FX0 = (CADRE[0] + 130) * KF, FY0 = (CADRE[1] + 64) * KF;
var O = '#24182e';
function css(){
  if(document.getElementById('hva-css')) return;
  var s = document.createElement('style'); s.id = 'hva-css';
  s.textContent = '.hva{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:1}' +
    '.hva-boite{position:absolute;inset:0;overflow:visible;will-change:transform}.hva-boite>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block}' +
    '.hva-fx{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:2}' +
    /* (le mode léger : une respiration très douce de tout le dessin, depuis les pieds, jouée par la carte graphique) */
    '.hva-leger .hva-boite>svg.hv{transform-origin:50% 94%;animation:hvaRespire 3.6s ease-in-out infinite}@keyframes hvaRespire{0%,100%{transform:none}50%{transform:scale(1.004,1.012)}}' +
    /* (son ombre : au moins aussi grande que celle des autres héros — 130 × 24 —, et plus foncée au milieu : sur le sol sombre du donjon,
       l'ancienne ne se voyait pas et ils avaient l'air de flotter — Romain, 23 novembre, 21 h 32) */
    '.hva-ombre-sol{position:absolute;left:0;top:0;width:100px;height:26px;margin:-13px 0 0 -50px;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(0,0,0,.88),rgba(0,0,0,.66) 55%,rgba(0,0,0,0))}' +
    /* (LE VRAI FLOTTEMENT, enfin trouvé — Romain, 23 novembre, 21 h 54 : « tu me fais encore flotter les héros ») : le donjon fait
       monter et descendre de 4 px, toutes les 1,5 s, chaque héros qu'on peut choisir (`.perso.dispo > .acteur{animation:flotte …}`,
       jeu/donjon/essai/src/jeu.css) — c'est-à-dire presque tout le temps. Coupé ici pour TOUS les héros (les anciens aussi) : ils
       restent posés au sol ; l'anneau doré suffit pour dire qu'on peut les choisir. Dans le vrai donjon, la règle est toujours là. */
    '.perso.heros.dispo>.acteur{animation:none!important}' +
    /* (son ombre et l'anneau de son tour sont dessinés avec elle : ceux de la case du donjon sont cachés) */
    '.perso.hv-volume>.ombre,.perso.hv-volume>.anneau{display:none!important}' +
    /* (l'ancien Pisteur, invisible : seuls ses effets se voient) */
    '.ha.hva-ombre>.ha-boite{visibility:hidden!important}';
  document.head.appendChild(s);
}
function maintenant(){ return (G.performance || Date).now() / 1000; }
function attendre(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function decale(L, dt){ return L.map(function(k){ return [k[0] + dt, k[1]]; }); }
function lisse(a){ a = Math.max(0, Math.min(1, a)); return a * a * (3 - 2 * a); }
function mixe(a, b, t){ return a + (b - a) * t; }
function mixe2(a, b, t){ return [mixe(a[0], b[0], t), mixe(a[1], b[1], t)]; }
/* mélanger deux poses complètes (pour passer en douceur d'un geste interrompu au suivant) */
function melange(A, B, t){
  var R = {}, k;
  for(k in B){ var a = A[k], b = B[k];
    if(typeof b === 'number' && typeof a === 'number') R[k] = a + (b - a) * t;
    else if(b instanceof Array && a instanceof Array) R[k] = b.map(function(v, i){ return (a[i] || 0) + (v - (a[i] || 0)) * t; });
    else R[k] = b; }
  return R;
}
/* une partie d'un geste, de t0 à t1, remise à zéro ; depart : la pose de départ, posée juste au début */
function morceau(Gst, t0, t1, depart){
  var L = Gst.filter(function(k){ return k[0] > t0 + 1e-6 && k[0] <= t1 + 1e-6; }).map(function(k){ return [k[0] - t0 + 0.01, k[1]]; });
  return depart ? [[0.01, depart]].concat(L) : L;
}
function rond(x, y, r, c, o, plus){ return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + c + '"' + (o != null ? ' opacity="' + o.toFixed(2) + '"' : '') + (plus || '') + '/>'; }

/* ==========================================================
   LA PISTEUSE EN VOLUME, avec les ordres de l'ancien Pisteur
   ========================================================== */
/* (leur allure au donjon : la Pisteuse rousse à queue de cheval ; l'Alchimiste, le garçon brun au chignon — les autres apparences ne
   sont pas encore en volume) */
var ALLURES = {
  pisteur:{role:'pisteur', sexe:'f', peau:'p1', cheveux:'roux', yeux:'vert', combat:true},
  alchimiste:{role:'alchimiste', sexe:'m', peau:'p4', cheveux:'noir', yeux:'ambre', coiffure:'courts', combat:true},
  sage:{role:'sage', sexe:'f', peau:'p5', cheveux:'noir', yeux:'ambre', coiffure:'tresse', combat:true}
};
/* L'ALLURE DU JOUEUR (24 novembre, dans le vrai donjon) : ce que le jeu donne au donjon (allure.js, lk = {fille, pe, ch, ir, age,
   coiffure, barbe}) devient les choix des héros en volume : fille ou garçon, la peau, les cheveux, les yeux, l'âge (enfant, adulte,
   âgé). Les héros en volume n'ont que trois coiffures (la queue de cheval, les cheveux courts, la tresse) : on prend la plus proche
   de celle du jeu ; un garçon sans coiffure connue a les cheveux courts. Pas encore de barbe. */
var COIFF_VOL = {queue:'queue', longs:'queue', catogan:'queue', tresses:'tresse', couettes:'tresse', tresse_c:'tresse',
  carre:'courts', chignon:'courts', courte:'courts', epis:'courts', court:'courts', meche:'courts', boucles:'courts', arriere:'courts', milong:'courts', degarni:'courts'};
function allureDe(role, lk){
  var o = {};
  if(!lk) return o;
  function id(L, c){ if(!c || !c[0]) return null; for(var i = 0; i < L.length; i++) if(L[i].c[0] === c[0]) return L[i].id; return null; }
  if(lk.fille === true || lk.fille === false) o.sexe = lk.fille ? 'f' : 'm';
  var pe = id(HV.PEAUX, lk.pe), ch = id(HV.CHEVEUX, lk.ch), ye = id(HV.YEUX, lk.ir);
  if(pe) o.peau = pe; if(ch) o.cheveux = ch; if(ye) o.yeux = ye;
  if(lk.age === 'enfant' || lk.age === 'age') o.age = lk.age;
  var sexe = o.sexe || ALLURES[role].sexe;
  if(COIFF_VOL[lk.coiffure]) o.coiffure = COIFF_VOL[lk.coiffure];
  else if(o.sexe && o.sexe !== ALLURES[role].sexe) o.coiffure = sexe === 'm' ? 'courts' : role === 'sage' ? 'tresse' : 'queue';
  return o;
}

/* LE MODE LÉGER (Romain, 24 novembre, 0 h 11 : « une très vieille tablette… il faut absolument pas que ça rame ») : chaque dessin
   d'un héros en volume est chronométré. Si, sur cet appareil, un dessin coûte en moyenne plus de SEUIL_LEGER ms (une tablette
   ancienne, ou très occupée), toute la page passe en léger :
   - au calme, plus de petite vie dessinée (respiration, clignements, gestes d'attente) : le dessin reste tel quel et ne coûte plus
     rien ; une respiration très légère est jouée par la carte graphique (tout le dessin, depuis les pieds) ;
   - pendant un geste : 20 dessins par seconde au plus (au lieu de 30) ; l'anneau doré ne scintille plus.
   « ?leger=1 » / « ?leger=0 » dans l'adresse : forcé (les essais). */
/* LE PANTIN CUIT (24 novembre, nuit — Romain, 4 h 14 : « les nouveaux personnages, ils font ramer même mon iPhone […] 24 images
   minimum pour toutes les tablettes, même celles qui sont très lentes ») : hv-cuit.js. Le héros n'est plus redessiné à chaque image :
   ses morceaux, dessinés une fois, sont bougés par la carte graphique ; le pantin ne fait plus que tenir à jour la pose (pour les
   effets, l'ombre, la fin des gestes) et s'endort au calme. « ?cuit=0 » dans l'adresse : l'ancien dessin à chaque image (les essais). */
var CUIT = !!HV.Cuit && !/[?&]cuit=0/.test(G.location ? G.location.search : '');
var SEUIL_LEGER = 7, LEGER = {on:false, n:0, somme:0, fixe:false};
(function(){ var m = /[?&]leger=([01])/.exec(G.location ? G.location.search : ''); if(m){ LEGER.on = m[1] === '1'; LEGER.fixe = true; } })();
function noterDessin(ms){
  if(LEGER.fixe || LEGER.on) return;
  LEGER.n++;
  if(LEGER.n <= 6) return;                      /* (les premiers dessins : la page se met en route) */
  LEGER.somme += ms;
  if(LEGER.n === 46 && LEGER.somme / 40 > SEUIL_LEGER){ LEGER.on = true; ((G.HerosVuesDonjon && G.HerosVuesDonjon.toutes) || []).forEach(function(v){ v.leger(); }); }
}
function horloge(){ return G.performance && performance.now ? performance.now() : Date.now(); }
/* (la largeur des boîtes ne change que si la fenêtre change : on ne la relit qu'alors — ombreAuSol) */
var TAILLE_V = 0;
if(G.addEventListener) G.addEventListener('resize', function(){ TAILLE_V++; });
function Volume(cont, lk, creer0, role){
  css();
  var me = this;
  role = ALLURES[role] ? role : 'pisteur';
  this.cont = cont; this.role = role; this.lk = lk || {}; this.ko = false; this._q = Promise.resolve(); this._timers = []; this._veut = false;
  if(getComputedStyle(cont).position === 'static') cont.style.position = 'relative';
  var slot = cont.closest && cont.closest('.perso'); if(slot) slot.classList.add('hv-volume');
  this.racine = document.createElement('div'); this.racine.className = 'hva';
  this.boite = document.createElement('div'); this.boite.className = 'hva-boite';
  this.fx = document.createElement('div'); this.fx.className = 'hva-fx';
  this.racine.appendChild(this.boite); this.racine.appendChild(this.fx);
  cont.appendChild(this.racine);
  /* (en tenue de combat ; « &hommes=1 » dans l'adresse de la page d'essai : les trois héros en garçons — le corps d'homme, hv-corps.js,
     GABARITS ; Romain, 23 novembre, 23 h 53 : « commence par les hommes ») */
  this.h = HV.avec(HV.avec(ALLURES[role], allureDe(role, lk)), G.HV_HOMMES || /[?&]hommes=1/.test(G.location ? G.location.search : '') ? {sexe:'m', coiffure:'courts'} : {});
  this.p = HV.monter(this.boite, this.h, {cadre:CADRE.join(' '), cap:CAP});
  this.p.posi = null; this.p.nom = 'donjonVolume';
  this.svg = this.boite.querySelector('svg');
  /* (son ombre au sol, sous ses pieds, bien visible comme celle des autres héros : Romain, 20 h 05, « les pieds posés sur le sol
     avec une petite ombre au sol […] qu'ils soient vraiment ancrés dans le donjon ») */
  this.ombreSol = document.createElement('div'); this.ombreSol.className = 'hva-ombre-sol';
  this.boite.insertBefore(this.ombreSol, this.svg);
  /* (le calque des effets des films, par-dessus elle, dans le repère du film) */
  this.calque = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.calque.setAttribute('viewBox', [FX0, FY0, CADRE[2] * KF, CADRE[3] * KF].map(function(v){ return v.toFixed(2); }).join(' '));
  this.calque.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none');
  this.boite.appendChild(this.calque);
  this.effets = []; this.idGel = 'hvagel' + (++NUM);
  this.base = role === 'alchimiste' ? HV.POSES.aGarde : role === 'sage' ? HV.POSES.sGarde : HV.POSES.dGarde; this.cles = null; this.t0 = maintenant(); this.tenue = null; this.dernier = this.base;
  /* (c'est l'adaptateur qui dit au pantin quelle pose prendre, à chaque image ; le pantin y ajoute sa petite vie) */
  this.p.courante = function(){ return me.pose(); };
  var d0 = this.p.dessiner;
  /* (cuit : plus de dessin, seulement la pose — le pantin cuit, lui, joue ce qui a été prévu) */
  if(CUIT) d0 = function(){ var P = me.pose(), F = {}, k; for(k in P) F[k] = P[k]; F.cap = CAP; this.F = F; this.anV = this.anC || 0; return true; };     /* (l'anneau : c'est le pantin cuit qui le montre) */
  this.p.dessiner = function(dt){ var t1 = horloge(), r = d0.call(this, dt); if(r !== false){ if(!CUIT) noterDessin(horloge() - t1); this._vides = 0; } else this._vides = (this._vides || 0) + 1; me.apresImage(); return r; };
  /* (au calme — elle respire, cligne des yeux —, 15 dessins par seconde suffisent ; pendant un geste, 30 : la tablette souffle ;
     en léger, 20 au plus — et au calme, quand plus rien ne bouge depuis 8 images, elle s'endort : plus rien à faire à chaque image,
     jusqu'au prochain geste, qui la réveille : HV.reveiller) */
  var im0 = this.p.image;
  this.p.image = function(now){
    var calme = me.calme();
    if(CUIT && me.cuit && me.cuit.pret){ if(calme) return false; if(this.t0 && now - this.t0 < 30) return; return im0.call(this, now); }
    if(LEGER.on && calme && (this._vides || 0) >= 8 && this.tw >= 1 && Math.abs(this.capV - this.cap) < 0.05) return false;
    if(this.t0 && now - this.t0 < (calme ? 64 : LEGER.on ? 48 : 0)) return;
    im0.call(this, now);
  };
  if(LEGER.on) this.leger();
  this.p.vers(CAP, true);
  /* l'ancien héros du même rôle, invisible, pour ses effets */
  try{ this.ombre = creer0(cont, role, lk); this.ombre.racine.classList.add('hva-ombre'); this.ombre._etoiles = function(){};
    /* (24 novembre, la vitesse : invisible, il n'a pas besoin de faire vivre ses tissus et ses cordes à chaque image — c'était, pendant
       les gestes, le plus gros travail de la page) */
    this.ombre._lire = function(){}; this.ombre._pas = function(){};
    cont.appendChild(this.ombre.racine); PROTO = PROTO || Object.getPrototypeOf(this.ombre);
    /* (ses effets à lui — la flèche qui vole, la lame ; la fiole qui vole, le BONG, les feuilles — travaillent sur le nouveau) */
    ['_fleche', '_fleche2', '_impactFleche', '_impactFleche2', '_rebondFleche', '_lame', '_impactDague', '_recul',
      '_fioleVole', '_fioleVole2', '_eclatPotion', '_bong', '_swoosh', '_feuilles',
      '_cercle', '_appel', '_eclair', '_runesMontent', '_dome', '_fil', '_runesLivre', '_idee', '_fondLune', '_eclairSalle'].forEach(function(n){ if(PROTO[n] && !V[n]) V[n] = PROTO[n]; }); }
  catch(e){ this.ombre = null; if(G.console) console.warn('hv-adaptateur : pas d\'ancien héros', e); }
  this._prochainRegard = maintenant() + 2 + Math.random() * 4;
  /* (la fuite : le combat fait partir la case vers la gauche, retournée — elle court, au lieu de glisser en garde) */
  /* (et l'anneau doré à ses pieds suit la case : quand on peut la choisir — « dispo » — et quand c'est son tour — « actif » —,
     comme l'anneau des autres héros, mais dessiné avec elle : l'arrière derrière les bottes, l'avant devant) */
  this.slot = slot;
  if(slot && G.MutationObserver) new MutationObserver(function(){
    if(slot.classList.contains('detale') && !me._fuit){ me._fuit = true; me._finGeste(); me.cles = null; me.trans = null; var t0 = maintenant(); me.course = function(){ return HV.course(maintenant() - t0); };
      /* (cuit : la course est la même boucle, prévue d'avance) */
      me.course.pose = function(u){ return HV.course(u); }; me.course.boucle = HV.COURSE.cycle; me.course.t0 = t0;
      me.p._vides = 0; if(HV.reveiller) HV.reveiller(); if(me.cuit) me.cuitPlan(); }
    me.p.choisi(slot.classList.contains('dispo') || slot.classList.contains('actif'));
  }).observe(slot, {attributes:true, attributeFilter:['class']});
  if(CUIT) this.cuitMonter();
  (G.HerosVuesDonjon.toutes = G.HerosVuesDonjon.toutes || []).push(this);
}
var V = Volume.prototype;

/* ---------- la pose de chaque image ---------- */
V.pose = function(){
  var t = maintenant(), u = t - this.t0, P;
  if(this.course) P = this.course(u);
  else if(this.cles && u < this.fin) P = HV.gesteImage(this.base, this.cles, u);
  else {
    if(this.cles){ var a = this.apres; this.cles = null; this.apresF = typeof a === 'function' ? a : null; this.tenue = a && typeof a !== 'function' ? HV.avec(this.base, a) : null; this.t0 = t; this.trans = null; u = 0; this._finGeste(); }
    P = this.apresF ? this.apresF(u) : this.tenue || this.base;
    /* (en attendant, il ne reste pas à rien faire : toutes les 3 à 5,5 secondes, un geste tiré au sort parmi ceux de tous et ceux de
       son rôle — HV.attentes, hv-attente.js : sur ses gardes, jamais tranquille —, jamais deux fois le même de suite ; chacun à son
       rythme — Romain, 22 h 21 et 22 h 48) */
    if(!this.apresF && !this.tenue && !this.ko && this._veut && !LEGER.on && !this.cuit && t > this._prochainRegard){ this._prochainRegard = t + 3 + Math.random() * 2.5; this.jouer(this.attente()); }
  }
  if(this.trans){ var a2 = (t - this.trans.t) / this.trans.d; if(a2 < 1) P = melange(this.trans.A, P, lisse(a2)); else this.trans = null; }
  this.dernier = P;
  return P;
};
/* le geste d'attente suivant (V.attenteForcee : son nom, pour les films) */
V.attente = function(){
  var L = HV.attentes ? HV.attentes(this.role, this.base) : {ennemis:HV.DONJON.regard}, noms = Object.keys(L), me = this;
  var cand = noms.filter(function(x){ return x !== me._derniereAttente; });
  var n = this.attenteForcee && L[this.attenteForcee] ? this.attenteForcee : (cand[Math.floor(Math.random() * cand.length)] || noms[0]);
  this._derniereAttente = n; this.attenteForcee = null;
  return L[n];
};
/* le mode léger (voir LEGER, plus haut) : plus de petite vie dessinée ; une respiration jouée par la carte graphique */
V.leger = function(){ this.p.leger = true; this.p.auto = false; if(!(G.SALLE && G.SALLE.tempsReel)) this.racine.classList.add('hva-leger'); };      /* (Léo, en temps réel : rien ne tourne en boucle sur les héros) */
V.calme = function(){ return !this.cles && !this.course && !this.apresF && !this.trans && !this.effets.length && !this._glisse && Math.abs((this.p.anV || 0) - (this.p.anC || 0)) < 0.02; };
V._finGeste = function(){ var f = this._quandFini; this._quandFini = null; if(f) f(); };
/* jouer des images clés (sur la garde du donjon) → une promesse, à la fin ; apres : la pose à garder ensuite (ou une fonction du temps) */
V.jouer = function(cles, apres){
  var me = this;
  this._finGeste();
  this.trans = {A:this.dernier, t:maintenant(), d:0.16};
  this.course = null; this.apresF = null; this.tenue = null;
  this.cles = cles; this.fin = cles[cles.length - 1][0]; this.t0 = maintenant(); this.apres = apres || null;
  this.p._vides = 0; if(HV.reveiller) HV.reveiller();          /* (le léger : un geste réveille le dessin) */
  var pr = new Promise(function(r){ me._quandFini = r; });
  if(this.cuit) this.cuitPlan();
  return pr;
};
/* la file des ordres : un à la fois ; sig(v) rend la promesse tout de suite (la flèche a touché), le geste continue */
V.file = function(fn){
  /* (24 novembre — Léo, en temps réel : on pianote, et les gestes s'entassaient dans la file : à la victoire, les héros jouaient encore
     des gestes d'il y a 40 secondes. Un geste d'attaque qui attend son tour est sauté si un plus récent est arrivé après lui : au plus
     un geste de retard. Les chutes, les relevés, la joie ne sont jamais sautés.) */
  var me = this, saute = !!(this._sautable && G.SALLE && G.SALLE.tempsReel), jeton = saute ? (this._jetonS = (this._jetonS || 0) + 1) : 0;
  return new Promise(function(res){
    me._q = me._q.then(function(){
      var fini = false, sig = function(v){ if(!fini){ fini = true; res(v); } };
      if(saute && jeton !== me._jetonS){ sig(); return; }
      return Promise.resolve().then(function(){ return fn.call(me, sig); }).catch(function(e){ if(G.console) console.error('hv-adaptateur', e); }).then(function(v){ sig(v); });
    });
  });
};
V.plus = function(ms, fn){ var me = this, id = setTimeout(function(){ var i = me._timers.indexOf(id); if(i >= 0) me._timers.splice(i, 1); fn(); }, ms); this._timers.push(id); return id; };
/* glisser la boîte (courir, sauter, reculer) : de x0 à x1 pixels en d secondes */
V.glisse = function(x0, x1, d, ease, y){
  var me = this, t0 = maintenant(), tok = this._gl = (this._gl || 0) + 1;
  this._glisse = true; this.p._vides = 0; if(HV.reveiller) HV.reveiller();
  /* (cuit : la boîte glisse par la carte graphique, comme le reste — sur une tablette lente, le fil principal ne la faisait avancer
     que par à-coups) */
  if(this.cuit && this.boite.animate){
    var kf = [], i, a, e;
    for(i = 0; i <= 24; i++){ a = i / 24; e = ease ? ease(a) : a; kf.push({offset:a, transform:'translate(' + (x0 + (x1 - x0) * e).toFixed(1) + 'px,' + (y ? y(a) : 0).toFixed(1) + 'px)'}); }
    if(this._glA) try{ this._glA.cancel(); }catch(x){}
    var an = this._glA = this.boite.animate(kf, {duration:Math.max(1, d * 1000), fill:'forwards'});
    this.dx = x1;
    return an.finished.then(function(){
      if(tok !== me._gl) return;
      me.boite.style.transform = kf[kf.length - 1].transform; an.cancel(); me._glA = null; me._glisse = false;
    }, function(){});
  }
  return new Promise(function(r){ (function pas(){ if(tok !== me._gl) return r(); var a = Math.min(1, (maintenant() - t0) / d), e = ease ? ease(a) : a; me.dx = x0 + (x1 - x0) * e;
    me.boite.style.transform = 'translate(' + me.dx.toFixed(1) + 'px,' + (y ? y(a) : 0).toFixed(1) + 'px)'; if(a < 1) requestAnimationFrame(pas); else { me._glisse = false; r(); } })(); });
};

/* ---------- où sont les choses ---------- */
/* les os de la pose affichée (dans ses mesures) */
/* (24 novembre, la vitesse : calculés une fois par dessin — les effets les redemandaient plusieurs fois par image) */
V.os = function(){ var F = this.p.F; if(F && F === this._osF) return this._os; this._osF = F; this._os = HV.os(this.h, F); return this._os; };
/* un point d'elle (ses mesures) → coordonnées de son SVG */
V.versSvg = function(q){ var P = this.p.F, Vv = HV.outils.vue(HV.capDe(P)); return [150 + q[0] * Vv.c + q[2] * Vv.s, q[1] - Math.max(0, P.leve || 0)]; };
/* … → pixels dans « ref » (la scène des effets du combat, ou son calque fx) */
V.versRef = function(s, ref){
  var R = boite(this.svg), k = R.width / CADRE[2], x = R.left + (s[0] - CADRE[0]) * k, y = R.top + (s[1] - CADRE[1]) * k;
  var Q = boite(ref), kr = (Q.width / (Q.ow || Q.width)) || 1;
  return {x:(x - Q.left) / kr, y:(y - Q.top) / kr};
};
/* (24 novembre, la vitesse : la place d'un élément à l'écran, relue au plus une fois par image — chaque lecture après une écriture
   refait toute la mise en page) */
var BOITES = typeof WeakMap === 'function' ? new WeakMap() : null;
function boite(el){
  var t = horloge(), c = BOITES && BOITES.get(el);
  if(c && t - c.t < 12) return c;
  var r = el.getBoundingClientRect();
  c = {t:t, left:r.left, top:r.top, width:r.width, height:r.height, ow:el.offsetWidth};
  if(BOITES) BOITES.set(el, c);
  return c;
}
/* … → le repère des effets des films */
V.ecranF = function(q){ var s = this.versSvg(q); return [(s[0] + 130) * KF, (s[1] + 64) * KF]; };
/* les repères de l'ancien Pisteur (pour ses effets), posés sur elle */
var REP = {tete:['tete', 0, -30], teteC:['tete', 4, -34], cou:['cou'], chevilleB:['chevilleD'], chevilleA:['chevilleG'], orteilA:['orteilG'], orteilB:['orteilD'], poignee:['poignetG'], bassin:['bassin'], amulette:['cou', 0, 16],
  /* (l'Alchimiste : la marmite pend sous SON poing gauche ; la fiole, les herbes, dans ses mains) */
  marmite:['poignetD', 0, 32], mainA:['poignetG'], mainB:['poignetD'], pince:['poignetD']};
/* (le Sage : le cristal, le pied du bâton, le livre — là où le dernier dessin les a mis : K.rep, dans les mesures du dessin) */
var REP_DESSIN = {cristal:'cristal', 'baton-bas':'batonBas', livre:'livre'};
V.repDessin = function(nom){
  /* (cuit : plus de dessin à chaque image pour les noter — le cristal et le pied du bâton viennent des os, le livre d'un dessin du
     corps de la pose du moment) */
  if(this.cuit && this.p.F){
    var Fq = this.p.F, Vq = HV.outils.vue(HV.capDe(Fq)), Sq = HV.squelette(this.p.K, this.h, Vq, Fq), qq = null;
    if(nom === 'cristal' && Sq.baton) qq = Sq.baton.cristal;
    else if(nom === 'baton-bas' && Sq.baton) qq = Sq.baton.a;
    else if(nom === 'livre'){ if(this._livreF !== Fq){ this._livreF = Fq; try{ HV.morceaux(this.p.K, this.h, Vq, Fq); }catch(e){} } qq = this.p.K.rep && this.p.K.rep.livre; }
    if(qq) return [150 + qq[0], qq[1] - Math.max(0, Fq.leve || 0)];
  }
  var R = this.p.K.rep, q = R && R[REP_DESSIN[nom]];
  return q ? [150 + q[0], q[1] - Math.max(0, (this.p.F && this.p.F.leve) || 0)] : null;
};
V.rep = function(nom, ref){
  var sd = REP_DESSIN[nom] && this.repDessin(nom);
  if(sd) return this.versRef(sd, ref || this.fx);
  var r = REP[nom] || ['bassin'], q = this.os()[r[0]], s = this.versSvg(q);
  return this.versRef([s[0] + (r[1] || 0), s[1] + (r[2] || 0)], ref || this.fx);
};

/* ---------- les effets des films, redessinés sur elle ---------- */
V.effet = function(nom, f, duree){ var e = {nom:nom, t0:maintenant(), f:f, d:duree || 99}; this.effets = this.effets.filter(function(x){ return x.nom !== nom; }); this.effets.push(e); this.p._vides = 0; if(HV.reveiller) HV.reveiller(); return e; };
V.sansEffet = function(nom){ this.effets = this.effets.filter(function(x){ return x.nom !== nom; }); };
/* l'ombre au sol : sous ses pieds (et son bassin, son dos quand elle est couchée), sur le sol ; en l'air, elle rapetisse et pâlit */
V.ombreAuSol = function(){
  var F = this.p.F; if(!F || !this.ombreSol) return;
  var Vv = HV.outils.vue(HV.capDe(F)), b = F.bas || [0, 0, 0], pts = [F.piedG, F.piedD, [b[0], 245 + b[1], b[2]]], xa = 1e9, xb = -1e9, ds = 0;
  if((F.couche || 0) > 0.3) pts.push([b[0], 300, b[2] - 190 * F.couche]);
  pts.forEach(function(q){ var x = 150 + q[0] * Vv.c + q[2] * Vv.s; xa = Math.min(xa, x); xb = Math.max(xb, x); ds += -q[0] * Vv.s + q[2] * Vv.c; });
  /* (24 novembre, la vitesse : la largeur de la boîte n'est relue que si la fenêtre change de taille — la lire après avoir écrit
     forçait toute la mise en page, à chaque image ; et on n'écrit que si l'ombre a bougé) */
  if(!this._largeur || this._largeurV !== TAILLE_V){ this._largeur = this.boite.offsetWidth || 0; this._largeurV = TAILLE_V; if(!this._largeur){ this._largeur = 200; this._largeurV = -1; } }
  var kx = this._largeur / CADRE[2], lv = Math.max(0, F.leve || 0), k = 1 / (1 + lv / 70);
  /* (son milieu un peu sous les semelles : l'ombre s'étale surtout sur le sol, devant le mur) */
  var X = ((xa + xb) / 2 - CADRE[0]) * kx, Y = (421 + 0.13 * ds / pts.length - CADRE[1]) * kx, W = Math.max(140, (xb - xa) * kx + 90) * k;
  var tr = 'translate(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px) scale(' + (W / 100).toFixed(3) + ',' + k.toFixed(3) + ')';
  if(tr !== this._ombreTr){ this._ombreTr = tr; this.ombreSol.style.transform = tr; this.ombreSol.style.opacity = k.toFixed(2); }
};
V.apresImage = function(){
  var t = maintenant(), me = this;
  this.ombreAuSol();
  this.effets = this.effets.filter(function(e){ return t - e.t0 < e.d; });
  if(!this.effets.length){ if(this._calquePlein){ this.calque.innerHTML = ''; this._calquePlein = false; } return; }
  var os = this.os(), s = '';
  this.effets.forEach(function(e){ try{ s += e.f.call(me, t - e.t0, os, t) || ''; }catch(x){ if(G.console) console.error(x); } });
  this.calque.innerHTML = s; this._calquePlein = true;
};
/* le ruban de lumière laissé par le bout de la dague (le film) */
V.ruban = function(trace, garde, T){
  if(garde){ var os = this.os(), w = this.ecranF(os.poignetD), c = this.ecranF(os.coudeD), vx = w[0] - c[0], vy = w[1] - c[1], l = Math.sqrt(vx * vx + vy * vy) || 1; trace.push([w[0] + vx / l * 52, w[1] + vy / l * 52, T]); }
  var s = '';
  trace.forEach(function(q, i){
    if(i === 0) return; var p0 = trace[i - 1], o = 1 - (T - q[2]) / 0.22; if(o <= 0 || q[2] - p0[2] > 0.1) return;
    var d = 'M' + p0[0].toFixed(0) + ' ' + p0[1].toFixed(0) + ' L' + q[0].toFixed(0) + ' ' + q[1].toFixed(0);
    s += '<path d="' + d + '" stroke="#8ff3ff" stroke-width="' + (40 * o).toFixed(1) + '" stroke-linecap="round" opacity="' + (0.22 * o).toFixed(2) + '"/>' +
      '<path d="' + d + '" stroke="#d8fbff" stroke-width="' + (18 * o).toFixed(1) + '" stroke-linecap="round" opacity="' + (0.55 * o).toFixed(2) + '"/>' +
      '<path d="' + d + '" stroke="#fff" stroke-width="' + (6 * o).toFixed(1) + '" stroke-linecap="round" opacity="' + (0.95 * o).toFixed(2) + '"/>';
  });
  return s;
};
V.effetRuban = function(fenetres, duree){
  var trace = [];
  this.effet('ruban', function(u, os, T){ return this.ruban(trace, fenetres.some(function(f){ return u > f[0] && u < f[1]; }), T); }, duree);
};
/* les étoiles qui tournent au-dessus de sa tête (le grand coup de poing : le film) */
function etoilesFilm(u, c){
  var s = '', o = u < 0.15 ? u / 0.15 : u > 0.75 ? Math.max(0, (0.95 - u) / 0.2) : 1, i;
  for(i = 0; i < 4; i++){ var a = u * 7 + i * Math.PI / 2, x = c[0] + 70 * Math.cos(a) + 10, y = c[1] - 70 + 18 * Math.sin(a);
    s += '<path d="M' + x.toFixed(0) + ' ' + (y - 12).toFixed(0) + ' L' + (x + 4).toFixed(0) + ' ' + (y - 3).toFixed(0) + ' L' + (x + 13).toFixed(0) + ' ' + (y - 2).toFixed(0) + ' L' + (x + 6).toFixed(0) + ' ' + (y + 4).toFixed(0) + ' L' + (x + 8).toFixed(0) + ' ' + (y + 13).toFixed(0) +
      ' L' + x.toFixed(0) + ' ' + (y + 8).toFixed(0) + ' L' + (x - 8).toFixed(0) + ' ' + (y + 13).toFixed(0) + ' L' + (x - 6).toFixed(0) + ' ' + (y + 4).toFixed(0) + ' L' + (x - 13).toFixed(0) + ' ' + (y - 2).toFixed(0) + ' L' + (x - 4).toFixed(0) + ' ' + (y - 3).toFixed(0) + ' Z" fill="#ffd23f" stroke="' + O + '" stroke-width="2.5" opacity="' + o.toFixed(2) + '"/>'; }
  return s;
}
/* LE GIVRE (refait une troisième fois — Romain, 20 h 24 : « le gel, c'est toujours moche. Essaie de faire en sorte de mettre un petit
   peu des cristaux et de changer un peu la couleur du personnage, le mettre un petit peu bleu ») : elle bleuit (un filtre de couleur
   posé sur tout son dessin, seulement pendant le givre : gelGel()) et quelques bouquets de cristaux de glace poussent sur sa tête, ses
   épaules, un coude et un genou, tournés vers l'extérieur. o : de 0 à 1 (ils poussent, puis fondent quand elle s'ébroue) */
function givre(me, os, o){
  if(o <= 0) return '';
  var s = '', c = me.ecranF(os.bassin);
  /* (24 novembre : les cristaux de la tête sur le haut du crâne, dans la neige — à -44, ils tombaient sur son visage) */
  [['tete', 0, -135, 1.3], ['epauleG', 0, 0, 1], ['epauleD', 0, 0, 0.9], ['coudeD', 0, 0, 0.75], ['genouG', 0, 0, 0.8]].forEach(function(z, i){
    var q = me.ecranF(os[z[0]]), x = q[0] + z[1], y = q[1] + z[2], dx = x - c[0], dy = y - c[1] - 60, l0 = Math.sqrt(dx * dx + dy * dy) || 1, a0 = Math.atan2(dy / l0, dx / l0);
    [-0.5, 0, 0.45].forEach(function(da, k){
      var a = a0 + da + (i % 2 ? 0.08 : -0.06), l = (k === 1 ? 34 : 24) * z[3] * (0.4 + 0.6 * o), w = (k === 1 ? 8 : 6) * z[3], ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
      var P = [[x + nx * w * 0.5, y + ny * w * 0.5], [x + ca * l * 0.72 + nx * w * 0.5, y + sa * l * 0.72 + ny * w * 0.5], [x + ca * l, y + sa * l], [x + ca * l * 0.72 - nx * w * 0.5, y + sa * l * 0.72 - ny * w * 0.5], [x - nx * w * 0.5, y - ny * w * 0.5]];
      var d = 'M' + P.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
      s += '<path d="' + d + '" fill="url(#' + me.idGel + 'c)" stroke="#3f84b8" stroke-width="2.2" stroke-linejoin="round" opacity="' + Math.min(1, o * 1.4).toFixed(2) + '"/>' +
        '<path d="M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1) + ' L' + P[1][0].toFixed(1) + ' ' + P[1][1].toFixed(1) + ' L' + P[2][0].toFixed(1) + ' ' + P[2][1].toFixed(1) + '" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="' + (0.9 * o).toFixed(2) + '"/>';
    });
  });
  return s;
}
/* LA BRÛLURE FROIDE DU FEU FOLLET, PLUS FORTE (24 novembre — Romain, 9 h 49 : « quand le feu follet frappe, les personnages deviennent
   plus bleus. Et l'effet est un petit peu soft. Il faudrait que tu remettes ça mieux ») : comme l'ancien héros — de la neige gelée qui
   se pose sur sa tête et ses épaules, avec des glaçons qui pendent (elle fond en gouttes à la fin), deux petits nuages de buée devant
   sa bouche ; et (froidFiltre, plus bas) un éclair blanc au moment du coup, puis des couleurs pâles et un liseré bleu glacé autour de
   lui. u : le temps depuis le coup ; o : de 0 à 1 (elle se pose, puis fond) */
function f1(v){ return v.toFixed(1); }
function neige(me, os, o, u){
  if(o <= 0 && u < 2.6) return '';
  var s = '', e = (me.p.K && me.p.K.echelle) || 1;
  var T = me.ecranF(os.tete), Cc = me.ecranF(os.cou || os.tete), EG = me.ecranF(os.epauleG), ED = me.ecranF(os.epauleD);
  function unite(x, y){ var l = Math.sqrt(x * x + y * y) || 1; return [x / l, y / l]; }
  /* (le haut de la tête : dans le prolongement du cou) */
  var up = unite(T[0] - Cc[0], T[1] - Cc[1]); if(up[1] > -0.3) up = [0, -1];
  /* une plaque de neige : un dôme au-dessus, le bord du dessous en festons, des glaçons qui pendent */
  function plaque(c, tg, n, w, h, glacons, graine){
    var k = 0.35 + 0.65 * Math.min(1, o), W = w * e * (0.6 + 0.4 * k), Hh = h * e * k, haut = [], bas = [], i, N = 9;
    for(i = 0; i <= N; i++){ var a = -1 + 2 * i / N, b = Math.pow(Math.max(0, 1 - a * a), 0.55);
      haut.push([c[0] + tg[0] * a * W + n[0] * Hh * b, c[1] + tg[1] * a * W + n[1] * Hh * b]); }
    for(i = N; i >= 0; i--){ var a2 = -1 + 2 * i / N, fe = (i % 2 ? 4.5 : 1.5) * e * k;
      bas.push([c[0] + tg[0] * a2 * W * 0.98 - n[0] * fe, c[1] + tg[1] * a2 * W * 0.98 - n[1] * fe]); }
    var d = 'M' + haut.map(function(p){ return f1(p[0]) + ' ' + f1(p[1]); }).join(' L') + ' L' + bas.map(function(p){ return f1(p[0]) + ' ' + f1(p[1]); }).join(' L') + ' Z';
    var r = '<path d="' + d + '" fill="url(#' + me.idGel + 'n)" stroke="#3f84b8" stroke-width="2.4" stroke-linejoin="round" opacity="' + Math.min(1, o * 1.6).toFixed(2) + '"/>';
    /* (le reflet sur le dessus) */
    var r1 = haut[2], r2 = haut[5];
    r += '<path d="M' + f1(r1[0] - n[0] * 3) + ' ' + f1(r1[1] - n[1] * 3) + ' Q' + f1((r1[0] + r2[0]) / 2 + n[0] * 2) + ' ' + f1((r1[1] + r2[1]) / 2 + n[1] * 2) + ' ' + f1(r2[0] - n[0] * 3) + ' ' + f1(r2[1] - n[1] * 3) + '" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="' + (0.9 * Math.min(1, o)).toFixed(2) + '"/>';
    glacons.forEach(function(g, j){
      var a = g[0], L = g[1] * e * k * (u > 2.6 ? Math.max(0.2, 1 - (u - 2.6) / 0.9) : 1), b0 = [c[0] + tg[0] * a * W - n[0] * 3 * e, c[1] + tg[1] * a * W - n[1] * 3 * e], lw = 4.2 * e;
      if(o > 0.05) r += '<path d="M' + f1(b0[0] - tg[0] * lw) + ' ' + f1(b0[1] - tg[1] * lw) + ' L' + f1(b0[0] - n[0] * L) + ' ' + f1(b0[1] - n[1] * L) + ' L' + f1(b0[0] + tg[0] * lw) + ' ' + f1(b0[1] + tg[1] * lw) + ' Z" fill="#dff5ff" stroke="#3f84b8" stroke-width="1.8" stroke-linejoin="round" opacity="' + Math.min(1, o * 1.6).toFixed(2) + '"/>';
      /* (à la fin, elle fond : une goutte tombe de chaque glaçon) */
      var tg0 = 2.75 + 0.18 * ((graine + j) % 3), ag = u - tg0;
      if(ag > 0 && ag < 0.7){ var gy = 30 * ag + 260 * ag * ag, gx = b0[0] - n[0] * L, gy0 = b0[1] - n[1] * L + gy;
        r += '<path d="M' + f1(gx) + ' ' + f1(gy0 - 9 * e) + ' C' + f1(gx + 5 * e) + ' ' + f1(gy0 - 2 * e) + ' ' + f1(gx + 5 * e) + ' ' + f1(gy0 + 4 * e) + ' ' + f1(gx) + ' ' + f1(gy0 + 4 * e) + ' C' + f1(gx - 5 * e) + ' ' + f1(gy0 + 4 * e) + ' ' + f1(gx - 5 * e) + ' ' + f1(gy0 - 2 * e) + ' ' + f1(gx) + ' ' + f1(gy0 - 9 * e) + ' Z" fill="#bfeaff" stroke="#3f84b8" stroke-width="1.4" opacity="' + (1 - ag / 0.7).toFixed(2) + '"/>'; }
    });
    return r;
  }
  /* (le bonnet de neige : posé sur le haut du crâne, un peu de côté) */
  /* (os.tete est le bas de la tête, au-dessus du cou : le haut du crâne est ~150 plus haut dans ce repère) */
  var tgT = [-up[1], up[0]], cT = [T[0] + up[0] * 100 * e + tgT[0] * 4, T[1] + up[1] * 100 * e + tgT[1] * 4];
  s += plaque(cT, tgT, up, 58, 34, [[-0.62, 26], [-0.1, 34], [0.45, 22], [0.85, 16]], 0);
  /* (les épaules : le long de la ligne des épaules, chacune vers l'extérieur) */
  var ax = unite(ED[0] - EG[0], ED[1] - EG[1]), nE = [ax[1], -ax[0]]; if(nE[1] > 0) nE = [-nE[0], -nE[1]];
  [[EG, -1, 1], [ED, 1, 2]].forEach(function(z){
    var c = [z[0][0] + ax[0] * z[1] * 4 * e + nE[0] * 6 * e, z[0][1] + ax[1] * z[1] * 4 * e + nE[1] * 6 * e];
    s += plaque(c, ax, nE, 40, 19, z[1] < 0 ? [[-0.45, 22], [0.35, 16]] : [[-0.3, 18], [0.5, 24]], z[2]);
  });
  return s;
}
/* deux petits nuages de buée qui sortent de sa bouche (il grelotte) */
function buee(me, os, u){
  var s = '', e = (me.p.K && me.p.K.echelle) || 1, T = me.ecranF(os.tete);
  [0.55, 1.2, 1.85].forEach(function(t0, i){
    var a = (u - t0) / 0.95; if(a <= 0 || a >= 1) return;
    var x = T[0] + (60 + 70 * a) * e, y = T[1] + (-40 - 50 * a) * e, r = (14 + 30 * a) * e, op = 0.8 * (1 - a) * Math.min(1, a * 5);
    s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="' + f1(r * 1.25) + '" ry="' + f1(r) + '" fill="#f2fbff" opacity="' + op.toFixed(2) + '"/>' +
      '<ellipse cx="' + f1(x + r * 0.7) + '" cy="' + f1(y - r * 0.5) + '" rx="' + f1(r * 0.8) + '" ry="' + f1(r * 0.65) + '" fill="#ffffff" opacity="' + (op * 0.8).toFixed(2) + '"/>';
  });
  return s;
}
/* les couleurs du coup de froid, sans filtre (un filtre sur le héros cuit fait tout repeindre à chaque image, et sur iPhone c'est
   le plus cher de tout) : deux voiles posés une fois, dont seule l'opacité bouge (la carte graphique) — un halo bleu glacé DERRIÈRE
   lui (il dépasse de sa silhouette : le liseré bleu) et un voile blanc-bleu PAR-DESSUS lui (l'éclair blanc du coup, puis il reste
   pâle, comme sous la glace), jusqu'à ce qu'il s'ébroue */
V.froidFiltre = function(){
  if(!this._froidV){
    var der = document.createElement('div'), dev = document.createElement('div'), z = 'position:absolute;pointer-events:none;opacity:0;';
    der.style.cssText = z + 'left:29%;right:29%;top:10%;bottom:3%;border-radius:50%;background:radial-gradient(closest-side,rgba(150,225,255,.9),rgba(90,190,255,.5) 62%,rgba(90,190,255,0))';
    dev.style.cssText = z + 'left:34%;right:34%;top:14%;bottom:8%;border-radius:50%;background:radial-gradient(closest-side,rgba(235,250,255,.62),rgba(190,235,255,.36) 55%,rgba(170,225,255,0))';
    this.boite.insertBefore(der, this.svg);
    this.boite.insertBefore(dev, this.calque);
    this._froidV = [der, dev];
  }
  if(this._froidA) this._froidA.forEach(function(a){ try{ a.cancel(); }catch(e){} });
  this._froidA = [
    this._froidV[0].animate([{opacity:0}, {opacity:1, offset:0.05}, {opacity:0.8, offset:0.2}, {opacity:0.75, offset:0.72}, {opacity:0}], {duration:3400, easing:'linear'}),
    this._froidV[1].animate([{opacity:0}, {opacity:1, offset:0.04}, {opacity:0.5, offset:0.14}, {opacity:0.42, offset:0.72}, {opacity:0}], {duration:3400, easing:'linear'})];
};
/* il recule sous le coup, puis grelotte (toute sa boîte, comme l'ancien héros) */
V.secousse = function(){
  var c = this.racine; if(!c || !c.animate) return;
  var k = Math.max(0.6, (this.boite.offsetWidth || 200) / 200), X = function(v){ return {transform:'translateX(' + (v * k).toFixed(1) + 'px)'}; };
  var L = [X(0), X(-18), X(-11), X(-13.5), X(-8.5), X(-13), X(-9), X(-12), X(-9.5), X(-11.5), X(-10), X(-11), X(-10.5), X(0)];
  var off = [0, 0.07, 0.17, 0.22, 0.27, 0.32, 0.37, 0.42, 0.47, 0.52, 0.57, 0.62, 0.67, 1];
  c.animate(L.map(function(f, i){ f.offset = off[i]; return f; }), {duration:1700, easing:'ease-out'});
};
/* (le filtre « elle bleuit » : on passe de ses vraies couleurs, k = 0, à des couleurs glacées, k = 1 — moins vives, tirées vers le
   bleu clair) — plus utilisé au donjon depuis le 24 novembre (froidFiltre, plus haut) ; gardé pour ses dégradés (idGel + 'c', 'n') */
var GEL = [0.68, 0.1, 0.08, 0, 0.02, 0.07, 0.78, 0.14, 0, 0.05, 0.06, 0.14, 0.84, 0, 0.17, 0, 0, 0, 1, 0], NEUTRE = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
V.gelGel = function(k){
  if(!this._gelF){
    var d = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    d.innerHTML = '<filter id="' + this.idGel + '" color-interpolation-filters="sRGB" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="' + NEUTRE.join(' ') + '"/></filter>' +
      '<linearGradient id="' + this.idGel + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4fdff"/><stop offset=".5" stop-color="#c4ecff"/><stop offset="1" stop-color="#7cc4ec"/></linearGradient>' +
      '<linearGradient id="' + this.idGel + 'n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e6f7ff"/><stop offset="1" stop-color="#a9dcf5"/></linearGradient>';
    this.calque.parentNode.insertBefore(this._gelSvg(d), this.calque);
    this._gelF = document.getElementById(this.idGel).firstChild;
  }
  var cible = this.cuit ? this.cuit.racine : this.svg;
  if(k <= 0.001){ cible.style.filter = ''; return; }
  this._gelF.setAttribute('values', GEL.map(function(v, i){ return (NEUTRE[i] + (v - NEUTRE[i]) * k).toFixed(3); }).join(' '));
  cible.style.filter = 'url(#' + this.idGel + ')';
};
/* (les définitions du givre vivent dans un petit SVG à elles, à côté de son dessin) */
V._gelSvg = function(defs){
  var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('style', 'position:absolute;width:0;height:0');
  s.appendChild(defs); return s;
};
/* les rats qui lui grimpent dessus, puis s'enfuient (le film) */
function rats(me, os, u){
  var s = '';
  [['chevilleG', 'genouG', 0.0, -1], ['chevilleD', 'genouD', 0.15, 1], ['chevilleG', 'hancheG', 0.3, 1], ['chevilleD', 'hancheD', 0.45, -1], ['chevilleD', 'genouD', 0.7, -1]].forEach(function(r, i){
    var a = (u - r[2]) / 1.4; if(a < 0) return;
    var A = me.ecranF(os[r[0]]), B = me.ecranF(os[r[1]]), x, y, fuite = Math.max(0, (u - 2.0 - i * 0.06) / 0.6);
    if(fuite <= 0){ var w = Math.min(1, a) * 0.85 + 0.15 * Math.sin(u * 9 + i) * 0.2; x = mixe(A[0], B[0], w) + r[3] * 10; y = mixe(A[1] + 30, B[1], w); }
    else { if(fuite > 1) return; x = A[0] + r[3] * (40 + 260 * fuite); y = A[1] + 30 - 60 * Math.sin(Math.min(1, fuite * 2) * Math.PI) * 0.4 + 40 * fuite; }
    /* (plus gros que dans le film : au donjon elle est petite à l'écran, et les rats doivent se voir — comme ceux de l'ancien) */
    var dx = fuite > 0 ? r[3] : (i % 2 ? 0.3 : -0.3), ang = fuite > 0 ? 0 : -70, G2 = 2.2;
    s += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + (ang * (dx > 0 ? -1 : 1)) + ') scale(' + (dx >= 0 ? G2 : -G2) + ' ' + G2 + ')">' +
      '<path d="M-14 4 Q-34 10 -40 -2" fill="none" stroke="' + O + '" stroke-width="5"/><path d="M-14 4 Q-34 10 -40 -2" fill="none" stroke="#d99aa0" stroke-width="2.5"/>' +
      '<ellipse cx="0" cy="0" rx="17" ry="10" fill="#6b6570" stroke="' + O + '" stroke-width="3"/><circle cx="16" cy="-3" r="7" fill="#6b6570" stroke="' + O + '" stroke-width="3"/>' +
      '<circle cx="12" cy="-10" r="4" fill="#d99aa0" stroke="' + O + '" stroke-width="2"/><circle cx="19" cy="-4" r="1.8" fill="' + O + '"/></g>';
  });
  return s;
}
/* LA TOILE (le film) : des rayons qui partent de sa poitrine, la spirale, les amarres, le cocon de soie ; dech : quand elle la
   déchire (null : pas encore) */
function toile(me, os, u, dech){
  var s = '', SOIE = '#f4f1ea', i, k, N = 16, RX = 150, RY = 230;
  var e = function(n){ return me.ecranF(os[n]); }, eG = e('epauleG'), eD = e('epauleD'), hG = e('hancheG'), hD = e('hancheD'), gG = e('genouG'), gD = e('genouD');
  var cx = (eG[0] + eD[0] + hG[0] + hD[0]) / 4, cy = mixe((eG[1] + eD[1]) / 2, (hG[1] + hD[1]) / 2, 0.35);
  function f(x){ return x.toFixed(1); }
  function fil(d, w, o, c){ return '<path d="' + d + '" fill="none" stroke="' + (c || SOIE) + '" stroke-width="' + w + '" stroke-linecap="round" opacity="' + o.toFixed(2) + '"/>'; }
  if(dech == null){
    var o = Math.min(1, u / 0.25), tr = 3 * Math.sin(u * 9) * (u > 0.33 ? 1 : 0), P = [];
    for(i = 0; i < N; i++){ var an = i / N * Math.PI * 2 + 0.13 * Math.sin(i * 2.3), rr = 1 + 0.12 * Math.sin(i * 1.7); P.push([Math.cos(an) * RX * rr, Math.sin(an) * RY * rr]); }
    [[260, -380], [-230, -380], [380, 20], [-300, 330], [230, 330]].forEach(function(a){ var q = P[Math.round((Math.atan2(a[1], a[0]) / (Math.PI * 2) + 1) * N) % N];
      s += fil('M' + f(cx + q[0] + tr) + ' ' + f(cy + q[1]) + ' L' + f(cx + a[0]) + ' ' + f(cy + a[1]), 2, 0.75 * o); });
    for(i = 0; i < N; i++) s += fil('M' + f(cx + tr) + ' ' + f(cy) + ' L' + f(cx + P[i][0] + tr) + ' ' + f(cy + P[i][1]), 2.2, 0.85 * o);
    for(k = 1; k <= 7; k++){ var fr = k / 7.4, d = '';
      for(i = 0; i < N; i++){ var a0 = P[i], a1 = P[(i + 1) % N], mx = (a0[0] + a1[0]) / 2 * fr * 0.86, my = (a0[1] + a1[1]) / 2 * fr * 0.86;
        d += (i === 0 ? 'M' + f(cx + a0[0] * fr + tr) + ' ' + f(cy + a0[1] * fr) : '') + ' Q' + f(cx + mx + tr) + ' ' + f(cy + my) + ' ' + f(cx + a1[0] * fr + tr) + ' ' + f(cy + a1[1] * fr); }
      s += fil(d, 1.7, 0.8 * o); }
    [[eG, eD, 0.0], [mixe2(eG, hG, 0.5), mixe2(eD, hD, 0.5), 0.1], [hG, hD, 0.2], [mixe2(hG, gG, 0.5), mixe2(hD, gD, 0.5), 0.3], [gG, gD, 0.4]].forEach(function(b, j){
      var a = Math.min(1, Math.max(0, (u - 0.08 - b[2] * 0.5) / 0.25)); if(a <= 0) return;
      var x0 = Math.min(b[0][0], b[1][0]) - 34, x1 = Math.max(b[0][0], b[1][0]) + 34, y0 = (b[0][1] + b[1][1]) / 2 + (j % 2 ? 8 : -6), dy = j % 2 ? -14 : 14;
      var d2 = 'M' + f(x0 + tr) + ' ' + f(y0 - dy) + ' Q' + f((x0 + x1) / 2 + tr) + ' ' + f(y0 + 26) + ' ' + f(x1 + tr) + ' ' + f(y0 + dy);
      s += fil(d2, 13, 0.55 * a * o, '#d9d4c8') + fil(d2, 8, 0.8 * a * o) + fil(d2, 1.4, 0.7 * a * o, '#ffffff');
    });
    return s;
  }
  var a2 = (u - dech) / 0.9; if(a2 > 1 || a2 < 0) return '';
  for(i = 0; i < N; i++){ var an2 = i / N * Math.PI * 2, r1 = 40 + 320 * a2, r2 = r1 + 50;
    s += fil('M' + f(cx + Math.cos(an2) * r1) + ' ' + f(cy + Math.sin(an2) * r1 * 1.3 + 140 * a2 * a2) + ' L' + f(cx + Math.cos(an2 + 0.2) * r2) + ' ' + f(cy + Math.sin(an2 + 0.2) * r2 * 1.3 + 140 * a2 * a2), 3, 0.9 * (1 - a2)); }
  [[260, -380], [-230, -380]].forEach(function(a, j){ var bx = cx + a[0] * 0.55 + 20 * Math.sin(u * 7 + j), by = cy + a[1] * 0.4;
    s += fil('M' + f(cx + a[0]) + ' ' + f(cy + a[1]) + ' Q' + f(cx + a[0] * 0.7) + ' ' + f(cy + a[1] * 0.6) + ' ' + f(bx) + ' ' + f(by), 2, 0.8 * (1 - a2)); });
  return s;
}
/* la bave verte (le crapaud : le film) ; ebroue : depuis quand elle s'ébroue (les gouttes) */
function bave(me, os, o, ebroue){
  if(o <= 0) return '';
  var s = '', f = me.ecranF(os.chevilleG), g = me.ecranF(os.chevilleD);
  s += '<ellipse cx="' + ((f[0] + g[0]) / 2 - 40).toFixed(0) + '" cy="' + (Math.max(f[1], g[1]) + 26).toFixed(0) + '" rx="150" ry="22" fill="#8fd16a" opacity="' + (0.55 * o).toFixed(2) + '"/>';
  ['tete', 'epauleG', 'epauleD', 'coudeD', 'genouG', 'genouD', 'bassin'].forEach(function(n, i){ var q = me.ecranF(os[n]), x = q[0] + (i % 2 ? 8 : -6), y = q[1] + 4, l = 14 + (i % 3) * 8;
    s += '<path d="M' + (x - 9).toFixed(0) + ' ' + y.toFixed(0) + ' Q' + x.toFixed(0) + ' ' + (y - 10).toFixed(0) + ' ' + (x + 9).toFixed(0) + ' ' + y.toFixed(0) + ' L' + (x + 4).toFixed(0) + ' ' + (y + l).toFixed(0) + ' Q' + x.toFixed(0) + ' ' + (y + l + 8).toFixed(0) + ' ' + (x - 4).toFixed(0) + ' ' + (y + l).toFixed(0) + ' Z" fill="#9be07a" stroke="#4f8a37" stroke-width="2" opacity="' + (0.85 * o).toFixed(2) + '"/>'; });
  if(ebroue > 0 && ebroue < 0.75){ var c2 = me.ecranF(os.tete), k2; for(k2 = 0; k2 < 8; k2++){ var an = k2 / 8 * Math.PI * 2 + 0.3, r = 50 + ebroue * 300 * ((k2 % 3) + 2) / 3;
    s += rond(c2[0] + 10 + r * Math.cos(an), c2[1] - 40 + r * 0.7 * Math.sin(an), 7, '#9be07a', Math.max(0, 1 - ebroue / 0.75), ' stroke="#4f8a37" stroke-width="2"'); } }
  return s;
}
/* (les effets de l'ancien, posés sur elle : ils lisent ses repères — rep, fx, boite) */
V._poussiere = function(){ if(PROTO) PROTO._poussiere.call(this); };
V._flash = function(){ if(PROTO) PROTO._flash.call(this); };
V._etoiles = function(on){ if(PROTO) PROTO._etoiles.call(this, on); };
V.ombreFait = function(nom){ var o = this.ombre, a = [].slice.call(arguments, 1); if(!o || !o[nom]) return Promise.resolve(); try{ return Promise.resolve(o[nom].apply(o, a)).catch(function(){}); }catch(e){ return Promise.resolve(); } };

/* ==========================================================
   LES ORDRES DU COMBAT
   ========================================================== */
/* ELLE ARRIVE EN COURANT, et freine (la course et l'arrêt validés par Romain) */
V.entrer = function(dist){
  dist = dist === undefined ? 320 : dist;
  var me = this;
  this.boite.style.transform = 'translateX(' + (-dist) + 'px)';
  return this.file(function(){
    var C = HV.COURSE, A = HV.ARRET, sc = (this.boite.offsetWidth || 200) / CADRE[2] * Math.sin(CAP * Math.PI / 180);
    var v = C.avance / C.cycle * sc, G9 = A.glisse(9) * sc;
    /* (elle commence à freiner à 93 % d'un pas, comme dans le film ; pas plus de 1,6 s de course : au-delà, elle glisse un peu) */
    var n = Math.max(1, Math.min(Math.floor(1.6 / C.cycle - 0.93), Math.round((dist - G9) / v / C.cycle - 0.93))), ts = (n + 0.93) * C.cycle, vr = (dist - G9) / ts;
    var dep = HV.course(ts), cles = HV.arret(), vu = {};
    this._finGeste(); this.cles = null; this.apresF = null; this.tenue = null; this.trans = null; this.t0 = maintenant();
    this.p._vides = 0; if(HV.reveiller) HV.reveiller();
    return new Promise(function(fini){
      me.course = function(u){
        var x, P;
        if(u < ts){ x = -dist + vr * u; P = HV.course(u); }
        else {
          var ua = u - ts; x = -G9 + A.glisse(Math.min(ua, A.duree)) * sc;
          A.poussiere.forEach(function(tp, i){ if(ua >= tp && !vu[i]){ vu[i] = 1; me._poussiere(); } });
          if(ua >= A.duree){ me.course = null; me.boite.style.transform = ''; setTimeout(fini, 0); return HV.gesteImage(dep, cles, A.duree); }
          P = HV.gesteImage(dep, cles, ua);
        }
        me.boite.style.transform = 'translateX(' + Math.min(0, x).toFixed(1) + 'px)';
        return P;
      };
      /* (cuit : la même course, sans rien toucher — pour la prévoir d'avance) */
      me.course.pose = function(u){ return u < ts ? HV.course(u) : HV.gesteImage(dep, cles, Math.min(u - ts, A.duree)); };
      me.course.duree = ts + A.duree; me.course.t0 = me.t0;
      if(me.cuit){
        me.cuitPlan();
        /* (et la boîte avance par la carte graphique : les mêmes positions, prévues d'avance) */
        if(me.boite.animate){
          var kf = [], D2 = ts + A.duree, i2;
          for(i2 = 0; i2 <= 60; i2++){ var u2 = D2 * i2 / 60, x2 = u2 < ts ? -dist + vr * u2 : -G9 + A.glisse(Math.min(u2 - ts, A.duree)) * sc;
            kf.push({offset:i2 / 60, transform:'translateX(' + Math.min(0, x2).toFixed(1) + 'px)'}); }
          var an = me.boite.animate(kf, {duration:D2 * 1000, fill:'forwards'});
          an.startTime = me.t0 * 1000;
          an.finished.then(function(){ an.cancel(); }, function(){});
        }
      }
    });
  });
};
V.attendre = function(){ this._veut = true; return this; };
/* C'EST SON TOUR : l'anneau doré (dessiné avec elle : l'arrière passe derrière ses bottes, l'avant devant), elle se redresse */
V.choisi = function(on){
  on = on !== false;
  if(!this.slot) this.p.choisi(on);
  if(!!this._choisi === on) return Promise.resolve();
  this._choisi = on;
  if(on && !this.ko && !this.cles && !this.course && !this.tenue && !this.apresF) this.jouer(HV.DONJON.choisi);
  return Promise.resolve();
};
V.joie = function(){
  /* (deux victoires, tirées au sort pour chacun : le saut les bras en l'air, ou le saut en tournant sur soi-même — Romain, 21 h 32 ;
     V.joieForcee : 'joie' ou 'joieTour', pour les films) */
  return this.file(function(){ if(this.ko) return null; var g = this.joieForcee || (Math.random() < 0.5 ? 'joie' : 'joieTour');
    return Promise.all([this.jouer(HV.DONJON[g] || HV.DONJON.joie), this.ombreFait('joie')]); });
};
/* ELLE PREND UN COUP : le coup simple, le givre, les rats, le grand coup de poing */
V.touche = function(type, opt){
  var g = type === 'froid' || type === 'brulure' ? 'froid' : type === 'grouillement' ? 'rats' : type === 'poing' ? 'poing' : 'coup';
  return this.file(function(){
    if(this.ko) return null;
    var me = this, L = [this.jouer(HV.DONJON[g])];
    if(g === 'coup') L.push(this.ombreFait('touche'));
    if(g === 'froid'){
      L.push(this.ombreFait('touche', 'froid', opt));
      /* (24 novembre : plus fort — l'éclair, le recul et le grelottement, la neige et ses glaçons, la buée ; voir neige()) */
      this.gelGel(0);
      this.froidFiltre();
      this.secousse();
      this.effet('givre', function(u, os){ var o = u < 0.18 ? u / 0.18 : u < 2.6 ? 1 : Math.max(0, 1 - (u - 2.6) / 0.8); return givre(this, os, o) + neige(this, os, o, u) + buee(this, os, u); }, 3.5);
    }
    if(g === 'rats'){
      this.effet('rats', function(u, os){ return rats(this, os, u); }, 3.0);
    }
    if(g === 'poing'){
      /* (le choc, la lueur, la poussière de l'ancien — la poussière tombe sous son pied de derrière ; elle ne glisse plus : Romain,
         20 h 05, « trop repoussé en arrière […] on a l'impression qu'il flotte ») */
      L.push(this.ombreFait('touche', 'poing', opt));
      this.effet('etoiles', function(u, os){ return u < 0.45 ? '' : etoilesFilm(u - 0.45, this.ecranF(os.tete)); }, 1.4);
    }
    return Promise.all(L);
  });
};
/* ELLE TOMBE SUR LE DOS, sonnée (la chute validée), et reste allongée */
V.tomber = function(){
  this._releve = null;
  return this.file(function(){
    if(this.ko) return null;
    var me = this;
    this.ko = true;
    /* (l'Alchimiste lâche sa fiole s'il en tenait une) */
    this.sansEffet('fiole');
    this.ombreFait('tomber');
    this.plus(860, function(){ if(me.ko) me._etoiles(true); });
    return this.jouer(HV.DONJON.chute.filter(function(k){ return k[0] <= 0.84 + 1e-6; }), HV.SONNEE);
  });
};
/* ELLE SE RELÈVE : comme après la chute ; avec l'amulette, la lumière dorée la soulève d'un coup */
V.relever = function(opt){
  opt = opt || {};
  /* (24 novembre — contre Léo, le combat redemande « relève-toi » à chaque mise à jour tant qu'elle est encore au sol ; chaque demande
     attendait son tour dans la file : à la victoire, 40 secondes de relevés en retard avant la joie. Une seule à la fois.) */
  if(this._releve) return this._releve;
  var me = this, pr = this._releve = this.file(function(){
    var me = this, am = !!opt.amulette;
    this._etoiles(false);
    var L = am ? HV.DONJON.amulette : [[0.01, HV.SONNEE]].concat(decale(HV.RELEVE, 0.5));
    return attendre(opt.retard || 0).then(function(){
      var o = me.ombreFait('relever', opt);
      return Promise.all([me.jouer(L), o]);
    }).then(function(){ me.ko = false; });
  });
  pr.then(function(){ if(me._releve === pr) me._releve = null; });
  return pr;
};
/* ELLE TIRE : le geste validé (la main au carquois, le bras levé haut, la flèche encochée, elle bande, elle lâche à 1,38 s) ;
   la flèche qui vole est celle de l'ancien (toutes les sortes : feu, huile, colle, argent, lourde, rebond…), partie de son arc */
var ANCIENNES = {normale:1, feu:1, huile:1, colle:1};
V.tirer = function(scene, to, type, opt){
  if(type && typeof type === 'object'){ opt = type; type = opt.type; }
  type = type || 'normale'; opt = opt || {};
  if(type === 'rebond'){ type = 'normale'; opt.rebond = true; }
  var me = this, neuve = !ANCIENNES[type] || opt.rebond;
  return this.file(function(sig){
    var fini = this.jouer(HV.DONJON.tir);
    var vole = attendre(1380).then(function(){
      /* (la flèche qui vole part tout entière DEVANT la main de l'arc : sa queue ne passe jamais sur son bras ni sur sa tête —
         Romain, 17 h 44 : « la flèche, quand elle tire, elle passe par-dessus le bras ») */
      var m = me.rep('poignee', scene), dx = to.x - m.x, dy = to.y - m.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      /* (une flèche à sa taille : Romain, 20 h 05, « la flèche qui va sur les ennemis, elle est 10 fois trop grosse ») */
      var k = me.echelle(scene), L = 56 * k, t ={x:m.x + ux * (L + 14 * k), y:m.y + uy * (L + 14 * k)}, n = {x:t.x - ux * L, y:t.y - uy * L};
      if(type === 'lourde' && me._recul) try{ me._recul(); }catch(e){}
      var f = neuve ? me._fleche2 : me._fleche;
      if(!f) return null;
      var r = f.call(me, scene, n, t, to, type, opt);
      /* (sa traînée de lumière, derrière elle, n'apparaît qu'une fois la flèche partie : elle ne passe pas sur son bras) */
      try{ var Ly = scene.querySelector(':scope > .ha-fxs'), w = Ly && Ly.lastElementChild, tr = w && w.firstElementChild;
        if(tr && !tr.querySelector('svg')) tr.animate([{opacity:0}, {opacity:0, offset:0.5}, {opacity:1}], {duration:180, fill:'backwards'}); }catch(e){}
      return r.then(sig);
    });
    return Promise.all([fini, vole]);
  });
};
/* LES INSTANTS CLÉS D'UN GESTE (Romain, 24 novembre, 4 h 14 : « le son, il faut qu'il soit vraiment au même moment que quand il fait
   le mouvement droite-gauche pour frapper […] que les sons soient synchro ») : en secondes depuis le début du geste ; le combat y cale
   ses sons (combat.js). La dague : deux revers (0,54 et 0,90 s) — ou, loin, le saut qui retombe (HV.SAUT.frappe) ; la flèche : 1,38 s. */
V.moments = function(nom, scene, to){
  if(nom === 'tirer') return [1.38];
  if(nom === 'dague' && scene && to){
    var pied = this.rep('chevilleB', scene), k = this.echelle(scene), dx = Math.max(0, to.x - pied.x - 70) / k;
    return dx > SEUIL_SAUT ? [HV.SAUT.frappe] : [0.54, 0.90];
  }
  return [];
};
/* combien de pixels de la scène pour un pixel de sa boîte */
V.echelle = function(scene){ var a = this.racine.getBoundingClientRect(), b = scene.getBoundingClientRect(); return (a.width / (this.racine.offsetWidth || a.width)) / ((b.width / (scene.offsetWidth || b.width)) || 1); };
/* LA DAGUE (Romain, 18 h 51 : « plus violent et plus vers devant […] que le bras entraîne le corps ») : près de l'ennemi, deux grands
   revers, elle avance d'un bond ; loin (le dernier rang), ELLE SAUTE jusqu'à lui, abat la dague en retombant, et revient */
var SEUIL_SAUT = 150;
V.dague = function(scene, to, opt){
  opt = opt || {};
  var me = this;
  return this.file(function(sig){
    var pied = this.rep('chevilleB', scene), k = this.echelle(scene), dx = Math.max(0, to.x - pied.x - 70) / k;
    var coup = function(dernier){
      try{ if(me._impactDague) me._impactDague(scene, to); }catch(e){}
      if(!dernier) return; sig(to); try{ if(opt.onImpact) opt.onImpact(to); }catch(e){ if(G.console) console.error(e); }
    };
    var lame = function(){ try{ if(me._lame) me._lame(scene, to); }catch(e){} };
    /* (24 novembre — Romain, 10 h 17, contre Léo : « quand on appuie en boucle sur la dague […] il devrait sauter sur Léo et donner le
       coup de dague et le son qui soit bien calé au bon moment. Là tout est décalé ») : opt.impact (en secondes) = le moment où les
       règles font tomber le coup (Léo : 0,71 s, et le son est calé dessus) ; tout le geste est joué au rythme qu'il faut pour que la
       lame tombe à cet instant-là — le saut (1,05 s d'habitude) devient plus vif et finit bien avant le geste suivant. */
    var k = 1, imp0 = dx > SEUIL_SAUT ? HV.SAUT.frappe : 0.54;
    if(opt.impact > 0) k = Math.max(0.5, Math.min(1.4, opt.impact / imp0));
    function ms(s){ return s * k * 1000; }
    if(dx > SEUIL_SAUT){
      var S = HV.SAUT;
      this.plus(ms(S.decolle), function(){ me._poussiere(); me.glisse(0, dx, (S.frappe - S.decolle) * k, lisse); });
      this.plus(ms(S.frappe - 0.08), lame);
      this.plus(ms(S.frappe), function(){ coup(true); me._poussiere(); });
      this.plus(ms(S.repart), function(){ me.glisse(dx, 0, (S.revient - S.repart) * k, lisse); });
      this.plus(ms(S.revient), function(){ me._poussiere(); });
      this.effetRuban([[(S.frappe - 0.16) * k, (S.frappe + 0.04) * k]], 2.0 * k);
      return this.jouer(k === 1 ? HV.DONJON.dagueSaut : etirer(HV.DONJON.dagueSaut, k));
    }
    /* (près : elle avance d'un bond pendant qu'elle arme, frappe deux fois, puis recule à sa place) */
    var av = Math.max(0, dx - 30);
    this.plus(ms(0.3), function(){ me.glisse(0, av, 0.22 * k, lisse); });
    this.plus(ms(0.48), lame); this.plus(ms(0.54), function(){ coup(true); });
    this.plus(ms(0.84), lame); this.plus(ms(0.9), function(){ coup(false); });
    this.plus(ms(1.3), function(){ me.glisse(av, 0, 0.36 * k, lisse); });
    this.effetRuban([[0.46 * k, 0.66 * k], [0.84 * k, 1.02 * k]], 1.4 * k);
    return this.jouer(k === 1 ? HV.DONJON.dague : etirer(HV.DONJON.dague, k));
  });
};
/* ==========================================================
   L'ALCHIMISTE : ses gestes à lui (hv-alchimiste.js)
   ========================================================== */
/* (les potions, comme l'ancien : un nom → sa couleur ; givre, acide, huile, colle volent avec leur traînée à elles) */
var POTIONS = {feu:'#ff7a2a', fumigene:'#aab4d2', huile:'#f2b630', colle:'#ece4d0', baume:'#5fd08a', coeur:'#ff5a7a', givre:'#7fd8ff', acide:'#7ae04a'};
var POT2 = {givre:1, acide:1, huile:1, colle:1}, EAU = '#d8e8f2';
/* où est la fiole (dans ses mesures) : sous le poing de SA main droite, un peu au bout */
function fioleOs(os){
  var W = os.poignetG, E = os.coudeG, d = [W[0] - E[0], W[1] - E[1], W[2] - E[2]], l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) || 1;
  return [W[0] + d[0] / l * 7.6, W[1] + d[1] / l * 7.6 + 16, W[2] + d[2] / l * 7.6];
}
/* (devant ou derrière lui, vu d'ici : > 0, plus près de nous que son bassin) */
V.profondeur = function(q, os){ var Vv = HV.outils.vue(HV.capDe(this.p.F)), b = os.bassin; return (-q[0] * Vv.s + q[2] * Vv.c) - (-b[0] * Vv.s + b[2] * Vv.c); };
/* la lueur de la fiole, ses étincelles, la traînée de lumière de la pirouette (dans le repère des films) */
function lueur(x, y, r, c, o){ return rond(x, y, r, c, 0.16 * o) + rond(x, y, r * 0.66, c, 0.22 * o) + rond(x, y, r * 0.36, '#ffffff', 0.3 * o); }
function etincelles(x, y, u, n, c, r0, r1, graine){
  var s = '', i;
  for(i = 0; i < n; i++){ var a = i / n * Math.PI * 2 + graine, r = r0 + (r1 - r0) * u, o = Math.max(0, 1 - u), xx = x + r * Math.cos(a), yy = y + r * Math.sin(a) - 20 * u;
    s += '<path d="M' + xx.toFixed(1) + ' ' + (yy - 7).toFixed(1) + ' L' + (xx + 2).toFixed(1) + ' ' + (yy - 2).toFixed(1) + ' L' + (xx + 7).toFixed(1) + ' ' + yy.toFixed(1) + ' L' + (xx + 2).toFixed(1) + ' ' + (yy + 2).toFixed(1) +
      ' L' + xx.toFixed(1) + ' ' + (yy + 7).toFixed(1) + ' L' + (xx - 2).toFixed(1) + ' ' + (yy + 2).toFixed(1) + ' L' + (xx - 7).toFixed(1) + ' ' + yy.toFixed(1) + ' L' + (xx - 2).toFixed(1) + ' ' + (yy - 2).toFixed(1) + ' Z" fill="' + (i % 2 ? '#ffffff' : c) + '" opacity="' + o.toFixed(2) + '"/>'; }
  return s;
}
/* le poing (dans ses mesures) : un peu au bout du poignet */
function poingOs(os, cle){
  var W = os['poignet' + cle], E = os['coude' + cle], d = [W[0] - E[0], W[1] - E[1], W[2] - E[2]], l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) || 1;
  return [W[0] + d[0] / l * 7.6, W[1] + d[1] / l * 7.6, W[2] + d[2] / l * 7.6];
}
/* IL PRÉPARE UNE POTION (Romain, 21 h 32 : « tu lui fais une préparation. On voit bien qu'il prend ses fioles sur son torse, qui fait
   un mélange ») : une fiole d'eau claire dans la main droite, une fiole de la couleur de la potion dans la gauche ; quand il penche la
   gauche, un filet de potion coule dans la droite, qui prend sa couleur ; il secoue, le mélange s'illumine (un éclat, des étincelles) ;
   puis il attend, la fiole armée, qui luit doucement — jusqu'à ce qu'il la lance */
V.preparer = function(couleur){
  var me = this, A = HV.ALCHI;
  return this.file(function(){
    if(this.ko) return null;
    var c = POTIONS[couleur] || couleur || '#5fd08a';
    this._fioleC = c;
    this.p.K.potion = EAU; this.p.K.potion2 = c;
    /* (vp : le geste est joué plus vite depuis le 24 novembre — HV.ALCHI.VITE ; les moments du filet et des lueurs suivent) */
    var vp = A.VITE || 1;
    this.plus((A.VERSE + 0.16 * vp) * 1000, function(){ me.p.K.potion = c; });
    this.effet('fiole', function(u0, os){
      var f = this.ecranF(fioleOs(os)), s = '', i, u = A.VERSE + (u0 - A.VERSE) / vp;
      /* (le filet de potion : du goulot de la fiole penchée au goulot de l'autre, dans le poing droit) */
      var uv = u - A.VERSE;
      if(uv > 0.02 && uv < 0.36){
        var m = this.ecranF(poingOs(os, 'D')), b = this.ecranF(poingOs(os, 'G')), o = Math.min(1, (uv - 0.02) / 0.06, (0.36 - uv) / 0.08);
        var x0 = m[0] - 14, y0 = m[1] + 6, x1 = b[0], y1 = b[1] - 10, d = 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' Q' + ((x0 + x1) / 2 - 6).toFixed(1) + ' ' + (Math.min(y0, y1) - 4).toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1);
        s += '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="8" stroke-linecap="round" opacity="' + (0.5 * o).toFixed(2) + '"/>' +
          '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round" opacity="' + o.toFixed(2) + '"/>' +
          '<path d="' + d + '" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="' + (0.7 * o).toFixed(2) + '"/>';
        for(i = 0; i < 3; i++){ var a = ((uv * 4 + i / 3) % 1); s += rond(mixe(x1, x1 + (i - 1) * 10, a), y1 - 4 - 10 * Math.sin(a * Math.PI), 2.6 * (1 - a), c, o); }
      }
      if(uv < 0.16) return s;
      /* (elle a pris sa couleur : elle luit) */
      var ue = u - (A.VERSE + 0.16);
      if(ue < 0.35) s += lueur(f[0], f[1], 24 + 50 * ue, c, 1 - ue / 0.35);
      /* (le mélange s'illumine) */
      var ul = u - (A.VERSE + (A.ECLAT - A.VERSE) / vp);
      if(ul > -0.04 && ul < 0.5){ var ol = ul < 0.06 ? Math.max(0, (ul + 0.04) / 0.1) : 1 - (ul - 0.06) / 0.44;
        s += lueur(f[0], f[1], 52, c, ol) + etincelles(f[0], f[1], Math.min(1, Math.max(0, ul) / 0.5), 8, c, 14, 62, 0.4); }
      /* (et elle luit doucement, tant qu'il la tient) */
      return s + lueur(f[0], f[1], 26 + 3 * Math.sin(u * 7), c, 0.7);
    }, 99);
    return this.jouer(A.preparer, A.PRET);
  });
};
/* IL LANCE LA FIOLE : l'élan, le fouet du bras ; elle part (la fiole qui vole et se brise : celle de l'ancien) */
V.lancer = function(scene, to, couleur, opt){
  if(couleur && typeof couleur === 'object'){ opt = couleur; couleur = opt.potion; }
  opt = opt || {};
  var me = this, A = HV.ALCHI;
  return this.file(function(sig){
    var nom = POTIONS[couleur] ? couleur : opt.potion, c = opt.couleur || POTIONS[nom] || (couleur && couleur.charAt && couleur.charAt(0) === '#' ? couleur : null) || this._fioleC || '#ff8a3a';
    var o2 = {}, k; for(k in opt) o2[k] = opt[k];
    if(nom && POT2[nom]) o2._potion = nom;
    this.p.K.potion = c;
    var fini = this.jouer(A.lancer);
    var vole = attendre(A.LACHE * 1000).then(function(){
      var a = me.versRef(me.versSvg(fioleOs(me.os())), scene);
      me.sansEffet('fiole'); me._fioleC = null;
      if(!me._fioleVole) return null;
      return me._fioleVole(scene, a, to, c, o2).then(sig);
    });
    return Promise.all([fini, vole]);
  });
};
/* LA LOUCHE : BONG sur la marmite (à 0,6 s, quand le combat fait sonner le BONG), puis il fait tournoyer sa louche */
V.louche = function(scene, to){
  var me = this, A = HV.ALCHI;
  return this.file(function(){
    if(this.ko) return null;
    this.plus((A.BONG - 0.13) * 1000, function(){ try{ me._swoosh(); }catch(e){} });
    this.plus(A.BONG * 1000, function(){ try{ me._bong(scene); }catch(e){} });
    return this.jouer(A.louche);
  });
};
/* LES HERBES (Romain, 21 h 32 : « la main qui s'ouvre en l'air bien haut, le bras tendu vers le haut, et on voit les pétales qui
   tombent sur les 3 personnes. Ça doit être un joli effet ») : il ouvre la main en l'air, une gerbe de pétales s'envole, puis retombe
   doucement en se balançant sur chacun des héros (pour un seul ami : sur lui seul) ; là où ils arrivent, une douce lumière verte et des
   petites croix qui montent. La promesse est rendue quand les premiers pétales touchent les héros. */
var PETALES = ['#ffd1e6', '#ffffff', '#ffb3d1', '#c8ffb8', '#fff1f7', '#9be88a'];
function cesHeros(scene, to, moi){
  var S = scene.getBoundingClientRect(), ks = (S.width / (scene.offsetWidth || S.width)) || 1, L = [];
  [].forEach.call(document.querySelectorAll('.perso.heros'), function(sl){
    if(sl.classList.contains('avale') || getComputedStyle(sl).visibility === 'hidden') return;
    var a = sl.querySelector('.acteur') || sl, r = a.getBoundingClientRect(); if(r.width < 10) return;
    L.push({x:(r.left + r.width / 2 - S.left) / ks, y0:(r.top + r.height * 0.14 - S.top) / ks, y1:(r.top + r.height * 0.62 - S.top) / ks, w:r.width / ks});
  });
  if(!L.length) return [{x:to.x, y0:to.y - 40, y1:to.y + 60, w:120}];
  /* (pour un seul ami — il n'est pas au milieu de l'équipe — : sur lui seul) */
  if(to && moi && Math.abs(to.x - moi.x) > 40){ L.sort(function(a, b){ return Math.abs(a.x - to.x) - Math.abs(b.x - to.x); }); L = [L[0]]; }
  return L;
}
function pluieDePetales(scene, a, cibles){
  var NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'), W = scene.offsetWidth || 960, H = scene.offsetHeight || 540;
  sv.setAttribute('width', W); sv.setAttribute('height', H); sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  sv.setAttribute('style', 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:6');
  scene.appendChild(sv);
  var N = 16 * cibles.length + 6, P = [], i, t0 = maintenant(), arrive = cibles.map(function(){ return 99; });
  for(i = 0; i < N; i++){
    var k = i % cibles.length, cb = cibles[k], tx = cb.x + (Math.random() - 0.5) * cb.w * 0.7, ty = cb.y0 + Math.random() * (cb.y1 - cb.y0);
    var hx = a.x + (tx - a.x) * (0.25 + 0.2 * Math.random()) + (Math.random() - 0.5) * 70, hy = a.y - 70 - Math.random() * 90;
    var dm = 0.32 + 0.12 * Math.random(), dc = 0.75 + 0.45 * Math.random(), dl = i * 0.012;
    P.push({k:k, tx:tx, ty:ty, hx:hx, hy:hy, dm:dm, dc:dc, dl:dl, ph:Math.random() * 6.3, r0:Math.random() * 360, vr:(Math.random() - 0.5) * 540, c:PETALES[i % PETALES.length], s:0.9 + 0.6 * Math.random()});
    arrive[k] = Math.min(arrive[k], dl + dm + dc);
  }
  var premier = Math.min.apply(null, arrive), fin = Math.max.apply(null, P.map(function(p){ return p.dl + p.dm + p.dc; })) + 0.9;
  return new Promise(function(ok){
    var rendu = false;
    (function image(){
      var t = maintenant() - t0, s = '';
      /* (là où ils arrivent : une douce lumière verte, des petites croix qui montent) */
      cibles.forEach(function(cb, k){ var u = t - arrive[k]; if(u < 0 || u > 0.9) return; var o = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.75, cy = (cb.y0 + cb.y1) / 2;
        s += '<ellipse cx="' + cb.x.toFixed(0) + '" cy="' + cy.toFixed(0) + '" rx="' + (cb.w * (0.2 + 0.15 * u)).toFixed(0) + '" ry="' + ((cb.y1 - cb.y0) * (0.45 + 0.15 * u)).toFixed(0) + '" fill="#bfffb0" opacity="' + (0.14 * o).toFixed(2) + '"/>';
        for(var j = 0; j < 3; j++){ var xx = cb.x + (j - 1) * cb.w * 0.22, yy = cb.y0 + 20 - 50 * u - j * 8;
          s += '<path d="M' + (xx - 6).toFixed(0) + ' ' + yy.toFixed(0) + ' h12 M' + xx.toFixed(0) + ' ' + (yy - 6).toFixed(0) + ' v12" stroke="#7ee07a" stroke-width="4" stroke-linecap="round" opacity="' + o.toFixed(2) + '"/>'; } });
      P.forEach(function(p){
        var u = t - p.dl; if(u < 0) return; var x, y, o = 1;
        if(u < p.dm){ var a1 = u / p.dm, e = 1 - (1 - a1) * (1 - a1); x = mixe(a.x, p.hx, e); y = mixe(a.y, p.hy, e); o = Math.min(1, a1 * 4); }
        else { var a2 = Math.min(1, (u - p.dm) / p.dc), e2 = a2 * a2 * (3 - 2 * a2); x = mixe(p.hx, p.tx, e2) + 14 * Math.sin(u * 5 + p.ph) * (1 - a2 * 0.5); y = mixe(p.hy, p.ty, e2);
          if(a2 >= 1){ var a3 = (u - p.dm - p.dc) / 0.35; if(a3 > 1) return; o = 1 - a3; y += 10 * a3; } }
        var r = p.r0 + p.vr * u, sx = 0.55 + 0.45 * Math.abs(Math.sin(u * 4 + p.ph));
        s += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + r.toFixed(0) + ') scale(' + (p.s * sx).toFixed(2) + ' ' + p.s.toFixed(2) + ')" opacity="' + o.toFixed(2) + '">' +
          '<path d="M0 -7 Q6 -1 0 8 Q-6 -1 0 -7 Z" fill="' + p.c + '" stroke="#b0607e" stroke-width="0.9"/><path d="M0 -4 L0 5" stroke="#ffffff" stroke-width="1" opacity=".7"/></g>';
      });
      sv.innerHTML = s;
      if(!rendu && t >= premier){ rendu = true; ok(); }
      if(t < fin) requestAnimationFrame(image); else { sv.remove(); if(!rendu) ok(); }
    })();
  });
}
V.herbes = function(scene, to, opt){
  opt = opt || {};
  var me = this, A = HV.ALCHI;
  return this.file(function(sig){
    this.effet('pincee', function(u, os){ if(u < 0.3 || u > 0.75) return ''; var m = this.ecranF(os.poignetD); return etincelles(m[0], m[1], (u - 0.3) / 0.45, 5, '#a6ff9a', 6, 34, 0.5); }, 0.8);
    var fini = this.jouer(A.herbes);
    var vole = attendre(A.HERBES * 1000).then(function(){
      var a = me.versRef(me.versSvg(poingOs(me.os(), 'D')), scene), moi = me.rep('tete', scene);
      return pluieDePetales(scene, a, cesHeros(scene, to || moi, moi)).then(function(){ sig(to); try{ if(opt.onImpact) opt.onImpact(to); }catch(e){ if(G.console) console.error(e); } });
    });
    return Promise.all([fini, vole]);
  });
};

/* ==========================================================
   LE SAGE : ses sorts (hv-sage.js) ; les effets sont ceux de l'ancien Sage (le cercle de runes, l'éclair, la rune d'appel, les
   runes qui montent, le dôme, la lumière de la salle, les runes du livre, l'idée), partis de son cristal à elle
   ========================================================== */
function couche(scene){ var c = scene.querySelector(':scope > .ha-fxs'); if(!c){ c = document.createElement('div'); c.className = 'ha-fx ha-fxs'; c.style.zIndex = 5; scene.appendChild(c); } return c; }
function etirer(L, k){ return k === 1 ? L : L.map(function(c){ return [c[0] * k, c[1]]; }); }
/* le cristal s'illumine (une lueur qui grossit, des étincelles) */
V.cristalFlash = function(fort){
  this.effet('flash', function(u){ var s = this.repDessin('cristal'); if(!s) return ''; var f = [(s[0] + 130) * KF, (s[1] + 64) * KF], o = u < 0.12 ? u / 0.12 : 1 - (u - 0.12) / 0.5;
    return lueur(f[0], f[1], (fort ? 60 : 40) + 50 * u, '#8ff3ff', Math.max(0, o)) + etincelles(f[0], f[1], Math.min(1, u / 0.6), 6, '#bff8ff', 12, fort ? 70 : 50, 0.2); }, 0.62);
};
/* LE SORT (et la rune d'appel : opt.appel) : le cristal s'allume ; le cercle de runes ; l'éclair part du cristal (0,72 s). La rune
   d'appel a son geste à elle (HV.SAGE.appel : elle tient, puis elle tire) et son effet à elle (_appelV) ; la promesse est rendue au
   moment où elle tire : le combat fait alors glisser le monstre devant les autres. */
V.sort = function(scene, to, opt){
  opt = opt || {};
  var me = this, S = HV.SAGE, ap = !!(opt.appel && S.appel);
  return this.file(function(sig){
    if(this.ko) return null;
    this.cristalFlash(true);
    this.plus(460, function(){ try{ me._cercle(scene); }catch(e){} });
    var vole = attendre(S.LANCE * 1000).then(function(){
      var a = me.rep('cristal', scene);
      me.cristalFlash(true);
      if(ap) return me._appelV(scene, to, (S.TIRE - S.LANCE) * 1000).then(sig);
      var f = opt.appel ? me._appel : me._eclair;
      return f ? f.call(me, scene, a, to, opt).then(sig) : null;
    });
    return Promise.all([this.jouer(ap ? S.appel : S.sort), vole]);
  });
};
/* LA RUNE D'APPEL, REFAITE (Romain, 23 novembre, 23 h 09 : « l'effet de la rune d'appel, il est pas terrible. Il faudrait que ce soit
   un sort, un effet un peu plus parlant. Qu'on comprenne vraiment ce que c'est ») — elle « amène un monstre » (son bouton : 🧲) :
   une étincelle violette file du cristal jusqu'au monstre ; une RUNE EN FORME D'AIMANT s'imprime sur lui (elle arrive grande, se
   pose, son anneau tourne) et un lasso de lumière se referme autour de lui ; une CHAÎNE de maillons lumineux se déroule du monstre
   jusqu'au cristal et se tend (elle vibre), des chevrons ‹ ‹ ‹ y courent du monstre vers elle — vers les héros ; elle TIRE : la chaîne
   claque et se rembobine dans le cristal, la rune éclate — et le combat fait glisser le monstre devant les autres. Tout est redessiné à
   chaque image (une seconde et demie), dans la scène des effets. tire : dans combien de millisecondes elle tire. */
var VIO = '#c9a2ff', VIO_C = '#f1e6ff', VIO_F = '#8a5cff';
function runeAimant(x, y, sc, rot, o, fl){
  var g = '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(3) + ')" opacity="' + o.toFixed(2) + '">' +
    '<circle r="40" fill="' + VIO_F + '" opacity="' + (0.14 + 0.3 * fl).toFixed(2) + '"/>' +
    '<g transform="rotate(' + rot.toFixed(1) + ')"><circle r="29" fill="none" stroke="' + VIO + '" stroke-width="8" opacity=".35"/><circle r="29" fill="none" stroke="' + VIO_C + '" stroke-width="2.8"/>' +
    '<circle r="22" fill="none" stroke="' + VIO + '" stroke-width="1.8" stroke-dasharray="5 4"/>';
  for(var k = 0; k < 8; k++){ var an = k * Math.PI / 4, c = Math.cos(an), s2 = Math.sin(an); g += '<path d="M' + (33 * c).toFixed(1) + ' ' + (33 * s2).toFixed(1) + ' L' + (38 * c).toFixed(1) + ' ' + (38 * s2).toFixed(1) + '" stroke="' + VIO_C + '" stroke-width="2.4" stroke-linecap="round"/>'; }
  var m = 'M-9.5 -12 L -9.5 1 Q -9.5 12 0 12 Q 9.5 12 9.5 1 L 9.5 -12';
  return g + '</g><path d="' + m + '" fill="none" stroke="' + VIO_F + '" stroke-width="10" opacity=".55"/><path d="' + m + '" fill="none" stroke="' + VIO_C + '" stroke-width="4.6"/>' +
    '<path d="M-13.4 -12 H -5.6 M5.6 -12 H 13.4" stroke="#ff6a8a" stroke-width="4.6"/>' + (fl > 0.05 ? '<circle r="' + (18 + 30 * fl).toFixed(1) + '" fill="#ffffff" opacity="' + (0.5 * fl).toFixed(2) + '"/>' : '') + '</g>';
}
V._appelV = function(scene, to, tire){
  var me = this, NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'), W = scene.offsetWidth || 960, H = scene.offsetHeight || 540;
  sv.setAttribute('width', W); sv.setAttribute('height', H); sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  sv.setAttribute('style', 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:6');
  scene.appendChild(sv);
  var t0 = maintenant(), TV = 0.16, TC = 0.4, TT = Math.max(TC + 0.15, tire / 1000), FIN = TT + 0.5, a0 = me.rep('cristal', scene);
  function f2(v){ return v.toFixed(1); }
  return new Promise(function(ok){
    var rendu = false;
    (function image(){
      var t = maintenant() - t0, s = '', a = a0;
      try{ a = me.rep('cristal', scene) || a0; }catch(e){}
      var dx = to.x - a.x, dy = to.y - a.y, dist = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / dist, uy = dy / dist, ang = Math.atan2(dy, dx) * 180 / Math.PI;
      function P(f){ return [a.x + dx * f, a.y + dy * f]; }
      /* 1. l'étincelle qui file jusqu'au monstre, avec sa traînée */
      if(t < TV){ var e = lisse(t / TV), q = P(e), q0 = P(Math.max(0, e - 0.22));
        s += '<path d="M' + f2(q0[0]) + ' ' + f2(q0[1]) + ' L' + f2(q[0]) + ' ' + f2(q[1]) + '" stroke="' + VIO + '" stroke-width="8" stroke-linecap="round" opacity=".45"/>' +
          '<path d="M' + f2(q0[0]) + ' ' + f2(q0[1]) + ' L' + f2(q[0]) + ' ' + f2(q[1]) + '" stroke="' + VIO_C + '" stroke-width="3" stroke-linecap="round"/>' + rond(q[0], q[1], 9, '#ffffff', 0.95) + rond(q[0], q[1], 16, VIO, 0.35); }
      /* 2. la chaîne : elle se déroule du monstre vers le cristal, se tend (elle vibre), puis se rembobine dans le cristal */
      var c0 = 1, c1 = 1;
      if(t >= TV && t < TC){ c0 = 1 - lisse((t - TV) / (TC - TV)); }
      else if(t >= TC && t < TT){ c0 = 0; }
      else if(t >= TT){ c0 = 0; c1 = 1 - lisse((t - TT) / 0.2); }
      if(c1 - c0 > 0.01 && t >= TV){
        var vib = t >= TC && t < TT ? Math.sin(t * 70) * 1.8 : 0, nx = -uy, ny = ux, L0 = P(c0), L1 = P(c1), tend = t >= TC && t < TT ? 0.5 + 0.5 * Math.sin(t * 18) : 0;
        s += '<path d="M' + f2(L0[0]) + ' ' + f2(L0[1]) + ' L' + f2(L1[0]) + ' ' + f2(L1[1]) + '" stroke="' + VIO_F + '" stroke-width="' + (12 + 4 * tend).toFixed(1) + '" stroke-linecap="round" opacity=".3"/>' +
          '<path d="M' + f2(L0[0]) + ' ' + f2(L0[1]) + ' L' + f2(L1[0]) + ' ' + f2(L1[1]) + '" stroke="' + VIO + '" stroke-width="2" opacity=".9"/>';
        var n = Math.floor((c1 - c0) * dist / 12);
        for(var k = 0; k <= n; k++){
          var fk = c1 - k * 12 / dist; if(fk < c0) break;
          var qk = P(fk), w2 = Math.sin(fk * dist * 0.08 + t * 40) * vib, pe = k % 2;
          s += '<ellipse cx="' + f2(qk[0] + nx * w2) + '" cy="' + f2(qk[1] + ny * w2) + '" rx="7" ry="' + (pe ? 1.6 : 3.6) + '" transform="rotate(' + ang.toFixed(1) + ' ' + f2(qk[0] + nx * w2) + ' ' + f2(qk[1] + ny * w2) + ')" fill="none" stroke="' + (pe ? VIO : VIO_C) + '" stroke-width="2.6"/>';
        }
        /* (les chevrons qui courent du monstre vers elle : « il vient par ici ») */
        if(t >= TC && t < TT) for(var j = 0; j < 3; j++){
          var fj = 1 - (((t - TC) * 1.5 + j / 3) % 1), qj = P(0.08 + 0.84 * fj), oj = Math.min(1, Math.min(fj, 1 - fj) * 5);
          s += '<path d="M8 -10 L -3 0 L 8 10" transform="translate(' + f2(qj[0]) + ' ' + f2(qj[1]) + ') rotate(' + ang.toFixed(1) + ')" fill="none" stroke="#ffffff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" opacity="' + oj.toFixed(2) + '"/>';
        }
      }
      /* 3. la rune-aimant sur le monstre, et le lasso qui se referme autour de lui */
      if(t >= TV){
        var u = t - TV, sc = u < 0.14 ? 1.9 - 0.9 * lisse(u / 0.14) : 1, o = t > TT ? Math.max(0, 1 - (t - TT) / 0.22) : Math.min(1, u / 0.06), fl = u < 0.2 ? 1 - u / 0.2 : t > TT ? Math.max(0, 1 - (t - TT) / 0.15) : 0;
        var la = lisse((u - 0.06) / 0.3), lo = t > TT ? Math.max(0, 1 - (t - TT) / 0.3) : Math.min(1, u / 0.1);
        if(lo > 0.02) s += '<ellipse cx="' + f2(to.x) + '" cy="' + f2(to.y + 6) + '" rx="' + f2(86 - 30 * la) + '" ry="' + f2(46 - 14 * la) + '" fill="none" stroke="' + VIO_F + '" stroke-width="10" opacity="' + (0.3 * lo).toFixed(2) + '"/>' +
          '<ellipse cx="' + f2(to.x) + '" cy="' + f2(to.y + 6) + '" rx="' + f2(86 - 30 * la) + '" ry="' + f2(46 - 14 * la) + '" fill="none" stroke="' + (t > TT ? '#ffffff' : VIO_C) + '" stroke-width="3.2" stroke-dasharray="14 7" opacity="' + lo.toFixed(2) + '"/>';
        if(o > 0.02) s += runeAimant(to.x, to.y - 4, sc * (t > TT ? 1 + 0.5 * (t - TT) : 1), u * 90, o, fl);
      }
      /* 4. elle tire : la rune éclate en étincelles violettes */
      if(t >= TT && t < TT + 0.45){
        var v = (t - TT) / 0.45;
        for(var i = 0; i < 12; i++){ var an2 = i / 12 * 6.283 + 0.4, r2 = 20 + 70 * lisse(v), px = to.x + Math.cos(an2) * r2, py = to.y + Math.sin(an2) * r2 * 0.7 + 20 * v * v;
          s += rond(px, py, 4.5 * (1 - v) + 1, i % 2 ? VIO_C : VIO, 1 - v); }
      }
      sv.innerHTML = s;
      if(!rendu && t >= TT + 0.03){ rendu = true; ok(to); }
      if(t < FIN) requestAnimationFrame(image); else { sv.remove(); if(!rendu) ok(to); }
    })();
  });
};
/* LE BOUCLIER (sur un ami, ou deux avec le bâton de chêne) : le bâton levé, les runes montent, le dôme se pose ; la promesse a
   absorber(n) et retirer(), comme l'ancien */
function groupeDomes(liste){
  var g = liste.slice();
  function choix(i){ return i === undefined ? liste : [liste[i]]; }
  g.absorber = function(n, i){ return Promise.all(choix(i).map(function(b){ return b.absorber(n); })); };
  g.retirer = function(i){ return Promise.all(choix(i).map(function(b){ return b.retirer(); })); };
  return g;
}
V.bouclier = function(scene, cible, opt){
  opt = opt || {};
  var me = this, S = HV.SAGE, k = opt.sorte === 'chene' ? 1 : 1.5, L = couche(scene), liste = cible instanceof Array ? cible : [cible];
  var p = this.file(function(sig){
    /* (24 novembre) le geste ne finit pas avant que les bulles soient posées : avec deux ou trois amis, les fils de lumière
       arrivaient APRÈS la fin du geste, la promesse rendait « rien », et Léo ne pouvait plus enlever ces bulles-là (elles
       s'empilaient : « les héros ont disparu »). Au plus 3 s d'attente (un geste coupé ne pose rien). */
    var pret, posees = new Promise(function(r){ pret = r; });
    function donne(v){ sig(v); pret(); }
    this.cristalFlash(true);
    try{ this._runesMontent(); }catch(e){}
    this.plus(S.DOME * k * 1000, function(){
      var a = me.rep('cristal', scene), domes = [];
      if(liste.length < 2){ var b = me._dome(L, scene, liste[0], opt); donne(b); return; }
      liste.forEach(function(el, i){ Promise.resolve(me._fil ? me._fil(L, scene, a, el, i) : null).then(function(){ domes[i] = me._dome(L, scene, el, opt); if(domes.filter(Boolean).length === liste.length) donne(groupeDomes(domes)); }); });
    });
    return Promise.all([this.jouer(etirer(S.bouclier, k)), Promise.race([posees, attendre(3000)])]).then(function(){});
  });
  p.absorber = function(n, i){ return p.then(function(b){ return b && b.absorber(n, i); }); };
  p.retirer = function(i){ return p.then(function(b){ return b && b.retirer(i); }); };
  return p;
};
/* LE BOUCLIER, REFAIT (Romain, 23 novembre, 23 h 09 : « l'effet du bouclier, il faut qu'il soit mieux fait. Qu'il soit un peu plus fin,
   qu'il entoure vraiment la personne ») : plus le grand dôme d'hexagones posé devant la case ; une BULLE fine, à la taille du héros,
   qui l'entoure vraiment. Elle est dans la boîte du héros (elle le suit) : sa moitié de derrière est DERRIÈRE lui (un voile doré, la
   moitié arrière de l'anneau au sol), sa moitié de devant DEVANT lui (un trait doré fin et sa lueur, un reflet, la moitié avant de
   l'anneau ; son allure : voir « deuxième version », plus bas). Elle naît du sol : l'anneau s'ouvre, elle grandit, le trait monte des
   deux côtés jusqu'au sommet, la bulle s'allume, des étincelles montent. Encaisser (absorber) : elle s'illumine et tremble, « −n
   absorbés » ; se briser (retirer) : elle s'illumine, gonfle, éclate en éclats. Le bouclier du bâton de chêne : la même, en bleu.
   En temps réel (Léo) : rien ne tourne sans fin (comme l'ancien dôme). Un héros qui n'est pas en volume garde l'ancien dôme. */
var PAL_BOUC = {jaune:{trait:'#ffd84a', lueur:'#ffb020', clair:'#fff6c8', fond:'#ffe680'}, bleu:{trait:'#8ff3ff', lueur:'#3fd0ff', clair:'#e8fdff', fond:'#bff8ff'}};
var NB = 0;
function volumeDe(el){
  var L = G.HerosVuesDonjon.toutes || [];
  for(var i = 0; i < L.length; i++){ var c = L[i].cont; if(c === el || (el && el.contains && el.contains(c)) || (c && c.contains && c.contains(el))) return L[i]; }
  return null;
}
function calqueBulle(){ var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', CADRE.join(' ')); s.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none'); return s; }
V._dome = function(L, scene, cible, opt){
  var vol = volumeDe(cible);
  if(!vol && PROTO && PROTO._dome) return PROTO._dome.call(this, L, scene, cible, opt);
  return bulle(vol, opt || {});
};
function bulle(vol, opt){
  var C = PAL_BOUC[opt.sorte === 'chene' ? 'bleu' : 'jaune'], id = 'hvb' + (++NB), figer = !!(G.SALLE && G.SALLE.tempsReel);
  var os = vol.os(), F = vol.p.F || {}, tt = vol.versSvg(os.tete), pa = vol.versSvg(F.piedG || [-25, 386, 0]), pb = vol.versSvg(F.piedD || [25, 386, 0]);
  /* (sa taille : du sol — y 414 — jusqu'au-dessus de la tête ; sa largeur : celle d'un héros et de l'air autour — plus grande depuis
     le 24 novembre, Romain, 9 h 51 : « je le trouve un peu petit » ; avant : rx 72, 78 au-dessus de la tête) */
  var cx = (pa[0] + pb[0]) / 2, G0 = 414, T = tt[1] - 104, rx = 108, H = G0 - T, ry = 17;
  function n1(v){ return v.toFixed(1); }
  var gauche = 'M' + n1(cx - rx) + ' ' + G0 + ' C ' + n1(cx - rx) + ' ' + n1(G0 - H * 0.64) + ' ' + n1(cx - rx * 0.8) + ' ' + n1(T) + ' ' + n1(cx) + ' ' + n1(T);
  var droite = 'M' + n1(cx + rx) + ' ' + G0 + ' C ' + n1(cx + rx) + ' ' + n1(G0 - H * 0.64) + ' ' + n1(cx + rx * 0.8) + ' ' + n1(T) + ' ' + n1(cx) + ' ' + n1(T);
  var forme = gauche + ' C ' + n1(cx + rx * 0.8) + ' ' + n1(T) + ' ' + n1(cx + rx) + ' ' + n1(G0 - H * 0.64) + ' ' + n1(cx + rx) + ' ' + G0 + ' A' + rx + ' ' + ry + ' 0 0 1 ' + n1(cx - rx) + ' ' + G0 + ' Z';
  var arriereSol = 'M' + n1(cx - rx) + ' ' + G0 + ' A' + rx + ' ' + ry + ' 0 0 1 ' + n1(cx + rx) + ' ' + G0, avantSol = 'M' + n1(cx + rx) + ' ' + G0 + ' A' + rx + ' ' + ry + ' 0 0 1 ' + n1(cx - rx) + ' ' + G0;
  /* DEUXIÈME VERSION (Romain, 23 novembre, 23 h 40 : « il est vraiment pas joli. J'aimais bien comment il était un petit peu avant, là,
     avec les runes. Il était un peu transparent. Tu peux même un petit peu l'animer […] Avec un effet de dégradé qui faisait un peu
     bouclier ») : la forme reste celle qui l'entoure (23 h 09 : « plus fin, qu'il entoure vraiment la personne »), mais avec l'allure de
     l'ancien dôme : le dégradé transparent au milieu, plus clair vers le bord ; le fin quadrillage d'hexagones qui monte doucement ; les
     runes posées tout le long de la bulle, qui scintillent ; le double liseré lumineux, le reflet ; l'anneau en pointillés au sol, qui
     tourne. Plus de runes qui tournent autour de lui. */
  var ar = calqueBulle(), av = calqueBulle(), HX = 16.8, HY = 14.56;
  function degrade(nom, o0, o1, o2){ return '<radialGradient id="' + nom + '" gradientUnits="userSpaceOnUse" cx="' + n1(cx) + '" cy="' + n1(G0 - H * 0.42) + '" r="' + n1(H * 0.6) + '"><stop offset="0" stop-color="' + C.lueur + '" stop-opacity="' + o0 + '"/><stop offset=".68" stop-color="' + C.trait + '" stop-opacity="' + o1 + '"/><stop offset="1" stop-color="' + C.clair + '" stop-opacity="' + o2 + '"/></radialGradient>'; }
  function sol(d){ return '<path d="' + d + '" fill="none" stroke="' + C.lueur + '" stroke-width="9" opacity=".12"/><path d="' + d + '" fill="none" stroke="' + C.lueur + '" stroke-width="5" opacity=".2"/><path class="b-pointille" d="' + d + '" fill="none" stroke="' + C.trait + '" stroke-width="2" stroke-dasharray="5 4"/>'; }
  function liseres(d){ return '<path d="' + d + '" pathLength="100" stroke-dasharray="100" fill="none" stroke="' + C.lueur + '" stroke-width="8" opacity=".13"/><path d="' + d + '" pathLength="100" stroke-dasharray="100" fill="none" stroke="' + C.lueur + '" stroke-width="4.6" opacity=".24"/>' +
    '<path d="' + d + '" pathLength="100" stroke-dasharray="100" fill="none" stroke="' + C.trait + '" stroke-width="2" stroke-linecap="round"/>'; }
  ar.innerHTML = '<defs>' + degrade(id + 'g', 0.06, 0.18, 0.55) + '</defs><g class="b-voile" opacity="0"><path d="' + forme + '" fill="url(#' + id + 'g)"/></g><g class="b-sol">' + sol(arriereSol) + '</g>';
  av.innerHTML = '<defs>' + degrade(id + 'h', 0.03, 0.1, 0.4) +
      '<pattern id="' + id + 'p" width="' + HX + '" height="' + HY + '" patternUnits="userSpaceOnUse"><path d="M4.2 0 L 12.6 0 L 16.8 7.28 L 12.6 14.56 L 4.2 14.56 L 0 7.28 Z" fill="none" stroke="' + C.fond + '" stroke-width=".9" opacity=".6"/></pattern>' +
      '<clipPath id="' + id + 'c"><path d="' + forme + '"/></clipPath></defs>' +
    '<g class="b-voile" opacity="0"><path d="' + forme + '" fill="url(#' + id + 'h)"/>' +
      /* (en temps réel — Léo — pas de quadrillage découpé : rien de « masqué » dans la scène pendant les sorts) */
      (figer ? '' : '<g clip-path="url(#' + id + 'c)" opacity=".42"><rect class="b-hex" x="' + n1(cx - rx - 20) + '" y="' + n1(T - 30) + '" width="' + n1(2 * rx + 40) + '" height="' + n1(H + 60) + '" fill="url(#' + id + 'p)"/></g>') +
      '<path class="b-reflet" d="M' + n1(cx - rx * 0.66) + ' ' + n1(T + H * 0.25) + ' Q ' + n1(cx - rx * 0.52) + ' ' + n1(T + H * 0.06) + ' ' + n1(cx - rx * 0.1) + ' ' + n1(T + H * 0.025) + '" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/></g>' +
    '<g class="b-trait">' + liseres(gauche) + liseres(droite) + '</g><g class="b-runes"></g><g class="b-sol">' + sol(avantSol) + '</g>' +
    '<path class="b-eclat" d="' + forme + '" fill="' + C.clair + '" opacity="0"/><g class="b-etinc"></g>';
  vol.boite.insertBefore(ar, vol.svg);
  vol.boite.insertBefore(av, vol.calque);
  /* (le badge du bouclier, au-dessus de la bulle, et la place des mots « −n absorbés ») */
  var k = (vol.boite.offsetWidth || 200) / CADRE[2], haut = document.createElement('div');
  /* (les deux calques grandissent et tremblent depuis le sol, sous le héros) */
  [ar, av].forEach(function(sv){ sv.style.transformOrigin = n1((cx - CADRE[0]) * k) + 'px ' + n1((G0 - CADRE[1]) * k) + 'px'; });
  haut.style.cssText = 'position:absolute;left:' + n1((cx - CADRE[0]) * k) + 'px;top:' + n1((T - CADRE[1]) * k) + 'px;width:0;height:0;z-index:3;pointer-events:none';
  haut.innerHTML = '<div class="ha-badge">🛡️ −' + (opt.pct || 75) + ' %' + (opt.sansTour ? '' : ' · 1 tour') + '</div>';
  vol.boite.appendChild(haut);
  /* --- elle naît du sol --- */
  var anims = [];
  function anime(el, kf, o){ var a = el.animate(kf, o); return a; }
  [ar, av].forEach(function(sv){
    [].forEach.call(sv.querySelectorAll('.b-sol'), function(g){ anime(g, [{transform:'translate(' + n1(cx) + 'px,' + G0 + 'px) scale(.1) translate(' + n1(-cx) + 'px,' + (-G0) + 'px)', opacity:0}, {transform:'translate(' + n1(cx) + 'px,' + G0 + 'px) scale(1.12) translate(' + n1(-cx) + 'px,' + (-G0) + 'px)', opacity:1, offset:.7}, {transform:'none', opacity:1}], {duration:360, easing:'ease-out'}); });
    [].forEach.call(sv.querySelectorAll('.b-voile'), function(g){ g.setAttribute('opacity', '1'); anime(g, [{opacity:0}, {opacity:0, offset:.55}, {opacity:1}], {duration:680, easing:'ease-out'}); });
  });
  [].forEach.call(av.querySelectorAll('.b-trait path'), function(p){ anime(p, [{strokeDashoffset:100}, {strokeDashoffset:100, offset:.25}, {strokeDashoffset:0}], {duration:560, easing:'ease-out', fill:'forwards'}); });
  anime(av.querySelector('.b-eclat'), [{opacity:0}, {opacity:0, offset:.6}, {opacity:.5, offset:.72}, {opacity:0}], {duration:900});
  /* (des étincelles qui montent du sol, dans la bulle) */
  var et = av.querySelector('.b-etinc'), se = '';
  for(var i = 0; i < 9; i++){ var ex = cx + (i / 8 - 0.5) * rx * 1.4, ey = G0 - 8 - (i % 3) * 6; se += '<path d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" fill="' + C.clair + '" transform="translate(' + n1(ex) + ' ' + n1(ey) + ')"/>'; }
  et.innerHTML = se;
  [].forEach.call(et.children, function(p, i){ var ex = cx + (i / 8 - 0.5) * rx * 1.4, ey = G0 - 8 - (i % 3) * 6, mt = H * (0.45 + 0.35 * ((i * 37) % 10) / 10);
    anime(p, [{transform:'translate(' + n1(ex) + 'px,' + n1(ey) + 'px) scale(.3)', opacity:0}, {transform:'translate(' + n1(ex) + 'px,' + n1(ey - mt * 0.3) + 'px) scale(1)', opacity:1, offset:.3}, {transform:'translate(' + n1(ex + (i % 2 ? 6 : -6)) + 'px,' + n1(ey - mt) + 'px) scale(.4)', opacity:0}],
      {duration:900 + (i % 3) * 140, delay:260 + i * 35, easing:'ease-out', fill:'both'}); });
  /* --- les runes posées tout le long de la bulle (comme sur l'ancien dôme) ; elles scintillent chacune à son tour --- */
  var gR = av.querySelector('.b-runes'), sR = '', RU = ['M-6 8 L 0 -8 L 6 8 M-3 2 L 3 2', 'M-4 -8 L -4 8 M-4 -8 L 5 -3 L -4 2', 'M0 -8 L 0 8 M-6 -4 L 6 4 M6 -4 L -6 4', 'M-6 -6 L 6 6 M-6 6 L 6 -6 M0 -8 L 0 8', 'M-5 -8 L -5 8 M-5 0 L 5 -8 M-5 0 L 5 8', 'M0 -8 L 6 0 L 0 8 L -6 0 Z'];
  for(var r1 = 0; r1 < 10; r1++){ var an1 = Math.PI * (0.1 + 0.8 * r1 / 9), x1 = cx - (rx - 11) * Math.cos(an1), y1 = G0 - (H - 18) * Math.sin(an1) * (0.3 + 0.7 * Math.pow(Math.sin(an1), 0.35));
    sR += '<g transform="translate(' + n1(x1) + ' ' + n1(y1) + ') scale(.6)"><path d="' + RU[r1 % RU.length] + '" fill="none" stroke="' + C.lueur + '" stroke-width="6" stroke-linecap="round" opacity=".35"/><path d="' + RU[r1 % RU.length] + '" fill="none" stroke="' + C.clair + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
  gR.innerHTML = sR;
  gR.animate([{opacity:0}, {opacity:0, offset:.55}, {opacity:1}], {duration:900});
  /* (elle vit doucement : les hexagones montent, les runes scintillent, le pointillé du sol tourne, le liseré et le reflet respirent) */
  if(!figer){
    anims.push(av.querySelector('.b-hex').animate([{transform:'translateY(0px)'}, {transform:'translateY(' + (-HY) + 'px)'}], {duration:1800, iterations:Infinity}));
    [].forEach.call(gR.children, function(g, i){ anims.push(g.animate([{opacity:.4}, {opacity:1}], {duration:1200, iterations:Infinity, direction:'alternate', easing:'ease-in-out', delay:-i * 330})); });
    [ar, av].forEach(function(sv){ [].forEach.call(sv.querySelectorAll('.b-pointille'), function(p){ anims.push(p.animate([{strokeDashoffset:0}, {strokeDashoffset:-18}], {duration:1500, iterations:Infinity})); }); });
    anims.push(av.querySelector('.b-trait').animate([{opacity:.8}, {opacity:1}], {duration:1100, iterations:Infinity, direction:'alternate', easing:'ease-in-out', delay:600}));
    anims.push(av.querySelector('.b-reflet').animate([{opacity:.4}, {opacity:.85}], {duration:1700, iterations:Infinity, direction:'alternate', easing:'ease-in-out'}));
  }
  /* (elle sort du sol en grandissant, comme l'ancien dôme) */
  [ar, av].forEach(function(sv){ sv.animate([{transform:'scale(.3,0)'}, {transform:'scale(1.06,1.08)', offset:.6}, {transform:'scale(.98,.97)', offset:.8}, {transform:'none'}], {duration:560, easing:'ease-out'}); });
  function tremble(){ [ar, av].forEach(function(sv){ sv.animate([{transform:'none'}, {transform:'scale(1.05,.95)', offset:.25}, {transform:'scale(.98,1.03)', offset:.6}, {transform:'none'}], {duration:420}); }); }
  var fini = false, poignee;
  /* (24 novembre — le bug de Léo, phase 2 : « les héros ont disparu ») UNE bulle à la fois sur un héros : une nouvelle remplace
     l'ancienne. Avant, des bulles qu'on n'enlevait jamais s'empilaient jusqu'à cacher le héros (voir V.bouclier). */
  if(vol._bulle) try{ vol._bulle.retirer(); }catch(e){}
  vol._bulle = poignee = {
    el:av,
    absorber:function(nb){
      if(fini) return Promise.resolve();
      av.querySelector('.b-eclat').animate([{opacity:.55}, {opacity:0}], {duration:420, easing:'ease-out'});
      tremble();
      var m = document.createElement('div');
      m.textContent = '−' + nb + ' absorbé' + (nb > 1 ? 's' : '');
      m.style.cssText = 'position:absolute;left:0;top:-30px;transform:translate(-50%,-100%);white-space:nowrap;font:800 18px/1 system-ui,"Segoe UI",sans-serif;color:' + C.clair + ';text-shadow:0 0 8px ' + C.lueur + ',0 2px 0 #24182e';
      haut.appendChild(m);
      return m.animate([{transform:'translate(-50%,-80%)', opacity:0}, {transform:'translate(-50%,-100%)', opacity:1, offset:.15}, {transform:'translate(-50%,-180%)', opacity:0}], {duration:1300, easing:'ease-out', fill:'forwards'}).finished.then(function(){ m.remove(); });
    },
    retirer:function(){
      if(fini) return Promise.resolve(); fini = true;
      if(vol._bulle === poignee) vol._bulle = null;
      anims.forEach(function(a){ try{ a.cancel(); }catch(e){} });
      av.querySelector('.b-eclat').animate([{opacity:0}, {opacity:.7, offset:.3}, {opacity:0}], {duration:380, fill:'forwards'});
      /* (des éclats qui volent du contour) */
      var se2 = '', E = [];
      for(var i = 0; i < 14; i++){ var an = Math.PI * (1.05 + 0.9 * i / 13), x = cx + rx * Math.cos(an) * (i % 2 ? 1 : 0.92), y = G0 - H * 0.5 + (H * 0.55) * Math.sin(an) * 0.98; E.push([x, y, an]);
        se2 += '<path d="M0 -5 L4 3 L-4 3 Z" fill="' + (i % 2 ? C.trait : C.clair) + '" transform="translate(' + n1(x) + ' ' + n1(y) + ')"/>'; }
      var gE = document.createElementNS('http://www.w3.org/2000/svg', 'g'); gE.innerHTML = se2; av.appendChild(gE);
      [].forEach.call(gE.children, function(p, i){ var e = E[i], dx2 = Math.cos(e[2]) * 46, dy2 = Math.sin(e[2]) * 30;
        p.animate([{transform:'translate(' + n1(e[0]) + 'px,' + n1(e[1]) + 'px) rotate(0deg)', opacity:1}, {transform:'translate(' + n1(e[0] + dx2) + 'px,' + n1(e[1] + dy2 + 60) + 'px) rotate(' + (i % 2 ? 260 : -260) + 'deg)', opacity:0}], {duration:600, easing:'ease-out', fill:'forwards'}); });
      haut.animate([{opacity:1}, {opacity:0}], {duration:300, fill:'forwards'});
      /* (la bulle gonfle et s'efface ; les éclats, eux, finissent de voler) */
      ar.animate([{transform:'none', opacity:1}, {transform:'scale(1.1,1.06)', opacity:0}], {duration:380, easing:'ease-in', fill:'forwards'});
      [].forEach.call(av.querySelectorAll('.b-voile, .b-runes, .b-sol, .b-trait'), function(g){ g.animate([{opacity:1}, {opacity:1, offset:.3}, {opacity:0}], {duration:400, fill:'forwards'}); });
      return attendre(680).then(function(){ ar.remove(); av.remove(); haut.remove(); });
    }
  };
  return poignee;
}
/* LA LUMIÈRE DANS TOUTE LA SALLE : le bâton tenu haut ; la salle s'illumine (0,78 s) */
V.eclairSalle = function(scene, opt){
  opt = opt || {};
  var me = this, S = HV.SAGE;
  return this.file(function(sig){
    var fond = null;
    this.cristalFlash(true);
    this.plus(300, function(){ try{ var c = me.rep('cristal', scene); fond = me._fondLune(scene, {x:c.x - 4, y:c.y - 30}); }catch(e){} });
    this.plus(S.FLASH * 1000, function(){ me.cristalFlash(true); try{ sig(me._eclairSalle(scene, opt, fond)); }catch(e){ sig(null); } });
    return this.jouer(S.eclairSalle);
  });
};
/* ÉTUDIER : le livre ouvert, des runes s'en échappent ; l'idée s'allume au-dessus de sa tête */
V.etudier = function(){
  var me = this, S = HV.SAGE;
  return this.file(function(){
    if(this.ko) return null;
    this.plus(600, function(){ try{ me._runesLivre(); }catch(e){} });
    this.plus(S.IDEE * 1000, function(){ try{ me._idee(); }catch(e){} me.cristalFlash(false); });
    return this.jouer(S.etudier);
  });
};

/* LA TOILE : collée dans une vraie toile d'araignée, elle se débat (en boucle) ; entoile(false) : elle la déchire */
V.entoile = function(on){
  on = on !== false;
  if(on === !!this._toileV) return Promise.resolve();
  this._toileV = on;
  return this.file(function(){
    var me = this;
    this.ombreFait('entoile', on);
    if(on){
      this.effet('toile', function(u, os){ return toile(this, os, u, null); }, 1e9);
      var debat = function(u){
        var a = Math.sin(u * 3.2), b = Math.max(0, Math.sin(u * 1.6));
        return HV.avec(me.base, HV.avec(HV.COLLEE, {dos:[2 * b, 0, 12 * a], bas:[-3 * a, 30, -4], hoche:6 + 4 * b, plisse:0.4 + 0.4 * b}));
      };
      debat.periode = 2 * Math.PI / 1.6;          /* (cuit : elle se débat en boucle — un tour complet des deux balancements) */
      return this.jouer(HV.DONJON.toile.filter(function(k){ return k[0] <= 0.35 + 1e-6; }), debat).then(function(){ return attendre(500); });
    }
    /* (elle se ramasse et l'ouvre d'un coup : les fils cassent et volent) */
    var L = morceau(HV.DONJON.toile, 1.6, 3.1, HV.COLLEE), dech = 1.92 - 1.6 + 0.01;
    this.plus(dech * 1000, function(){ var t0 = maintenant(); me.effet('toile', function(u, os){ return toile(this, os, maintenant() - t0, 0); }, 1.0); });
    return this.jouer(L);
  });
};
/* LE CRAPAUD : happée par la langue (tirée en avant, elle disparaît) … puis recrachée (en boule, elle retombe assise, couverte de
   bave, s'ébroue et se relève) */
V.avale = function(){
  return this.file(function(){
    var me = this, C = HV.CRAPAUD, D = 460;
    this._etoiles(false);
    this.ombreFait('avale');
    var L = morceau(HV.DONJON.crapaud, C.colle - 0.12, C.avalee);
    var a = this.boite.animate([{transform:'translate(0px,0px)', opacity:1}, {transform:'translate(14px,-4px) rotate(4deg)', opacity:1, offset:.22, easing:'cubic-bezier(.6,0,.9,.4)'},
      {transform:'translate(170px,-46px) rotate(30deg) scale(.42)', opacity:0}], {duration:D, delay:(L[L.length - 1][0] * 1000 - D), fill:'forwards'});
    return Promise.all([this.jouer(L), a.finished]).then(function(){ me._avale = true; me.boite.style.opacity = '0'; me.boite.style.transform = ''; a.cancel(); });
  });
};
V.recrache = function(scene, depuis){
  if(scene && scene.x !== undefined){ depuis = scene; scene = null; }
  return this.file(function(){
    var me = this, C = HV.CRAPAUD, dv = C.pose - C.recrachee, c0 = this.rep('bassin', this.fx);
    var dep = depuis ? (scene ? this.versRefDepuis(scene, depuis) : this.versRefEcran(depuis)) : {x:c0.x + 360, y:c0.y - 60};
    var ox = dep.x - c0.x, oy = dep.y - c0.y, N = 16, kf = [], hautV = Math.max(70, Math.abs(ox) * 0.28);
    for(var i = 0; i <= N; i++){
      var t = i / N, u = 1 - t, mx = ox / 2, my = Math.min(oy, 0) / 2 - hautV, x = u * u * ox + 2 * u * t * mx, y = u * u * oy + 2 * u * t * my;
      kf.push({offset:t, transform:'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (-360 * u).toFixed(1) + 'deg) scale(' + (0.62 + 0.38 * t).toFixed(3) + ')'});
    }
    this.boite.style.opacity = ''; this._avale = false;
    this.ombreFait('recrache', scene, depuis);
    this.boite.animate(kf, {duration:dv * 1000, easing:'linear'});
    /* (la fin de son geste, sans l'essuyage de la figure : le combat attend) */
    var L = morceau(HV.DONJON.crapaud, C.recrachee - 0.01, 4.6), fin = L[L.length - 1][0];
    L.push([fin + 0.5, {}]);
    this.plus(dv * 1000, function(){ var t0 = maintenant(); me.effet('bave', function(u2, os){ var v = maintenant() - t0; return bave(this, os, v < 2.2 ? 1 : Math.max(0, 1 - (v - 2.2) / 0.6), v - (3.05 - C.pose)); }, 3.0); });
    return this.jouer(L);
  });
};
/* un point de la scène (ou de l'écran) → pixels de son calque fx */
V.versRefDepuis = function(scene, p){ var S = scene.getBoundingClientRect(), ks = (S.width / (scene.offsetWidth || S.width)) || 1; return this.versRefEcran({x:S.left + p.x * ks, y:S.top + p.y * ks}); };
V.versRefEcran = function(p){ var Q = this.fx.getBoundingClientRect(), k = (Q.width / (this.fx.offsetWidth || Q.width)) || 1; return {x:(p.x - Q.left) / k, y:(p.y - Q.top) / k}; };
/* les objets : retenus (l'ancien, invisible, les porte ; elle, pas encore) */
V.equiper = function(objet, on, opt){ return this.ombreFait('equiper', objet, on, opt).then(function(v){ return v !== false; }); };
V.equipe = function(objet){ return !!(this.ombre && this.ombre.equipe && this.ombre.equipe(objet)); };
V.expr = function(){};
V.cligner = function(){};
V.arreter = function(){
  this._veut = false; this._timers.forEach(clearTimeout); this._timers = [];
  clearTimeout(this._cuitAttente);
  this._etoiles(false);
  if(this.ombre) try{ this.ombre.arreter(); }catch(e){}
};
V.detruire = function(){ this.arreter(); this.p.detruire(); if(this.cuit) this.cuit.detruire(); this.racine.remove(); if(this.ombre) try{ this.ombre.detruire(); }catch(e){} };

/* ==========================================================
   LE PANTIN CUIT (voir CUIT, plus haut ; hv-cuit.js)
   ========================================================== */
if(G.addEventListener) G.addEventListener('resize', function(){ ((G.HerosVuesDonjon && G.HerosVuesDonjon.toutes) || []).forEach(function(v){ if(v.cuit) v.cuit.ajuster(); }); });
V.cuitMonter = function(){
  var me = this;
  /* (la finesse des morceaux : ce que la boîte fait vraiment à l'écran, en pixels de l'appareil) */
  /* (sa vraie taille à l'écran, scène réduite comprise : sur un téléphone, la scène est plus petite — moins de mémoire pour les toiles) */
  var rw = 0; try{ rw = this.boite.getBoundingClientRect().width; }catch(e){}
  var k = (rw || this.boite.offsetWidth || 200) / CADRE[2], res = Math.max(0.8, Math.min(2, k * (G.devicePixelRatio || 1) * 1.05));
  this.cuit = HV.Cuit.monter(this.boite, this.h, {cadre:CADRE.join(' '), cap:CAP, res:res, K:this.p.K});
  /* (24 novembre — Romain, 9 h 51 : « on a l'impression que le personnage, il est en dehors du bouclier ») le dessin cuit prend la place
     du dessin d'avant, JUSTE APRÈS lui : la moitié de devant de la bulle du bouclier et le calque des effets des films (givre, toile,
     rats…) restent par-dessus le héros, la moitié de derrière dessous. Avant, il était ajouté tout au bout de la boîte : devant tout. */
  this.cuit.racine.style.zIndex = '0';
  this.boite.insertBefore(this.cuit.racine, this.svg ? this.svg.nextSibling : this.calque);
  this.cuit.racine.style.visibility = 'hidden';
  this.cuit.anneauP = this.base;
  this._cuitGen = 0;
  var c0 = this.p.choisi;
  this.p.choisi = function(on){ c0.call(this, on); if(me.cuit) me.cuit.anneau(on); };
  this.cuit.preparer(this.base).then(function(){
    if(!me.cuit || me.cuit.mort) return;
    me.cuit.pret = true;
    if(me.svg) me.svg.style.visibility = 'hidden';
    me.cuit.racine.style.visibility = '';
    me.cuit.ajuster();
    me.cuitPlan();
    /* (24 novembre — Romain : chez Léo, « juste après la cinématique, ça a quitté » : sur iPhone, la page se ferme quand elle prend
       trop de mémoire d'un coup. Chez Léo, la cuisson d'avance attend 3 s que la cinématique soit partie, puis avance doucement) */
    if(G.SALLE && G.SALLE.tempsReel) me.plus(3000, function(){ me.cuitPrecuire(); }); else me.cuitPrecuire();
  });
};
/* ce que le pantin cuit doit jouer, d'après l'état du moment : le geste en cours (ou la course) jusqu'au bout, puis ce qui suit — la
   pose gardée et sa petite vie, ou la boucle d'après (pris dans la toile). Tout est prévu ici, une fois ; la carte graphique joue. */
var DT_CUIT = 1 / 30;
V.cuitPlan = function(){
  var R = this.cuit; if(!R || !R.pret || R.mort) return;
  var me = this, gen = ++this._cuitGen, now = maintenant(), DT = DT_CUIT;
  clearTimeout(this._cuitAttente);
  var S = {cles:this.cles, t0:this.t0, fin:this.fin, base:this.base, apres:this.apres, trans:this.trans, course:this.course};
  function trans(P, t){ if(S.trans){ var a2 = (t - S.trans.t) / S.trans.d; if(a2 < 1) return melange(S.trans.A, P, lisse(a2)); } return P; }
  var images = [], debut = null, finS = null, ensuite, u;
  if(S.course && S.course.pose){
    var c = S.course, c0 = c.t0 != null ? c.t0 : S.t0;
    if(c.boucle){
      var Lc = []; for(u = 0; u < c.boucle; u += DT) Lc.push({t:u, P:c.pose(u)});
      Lc.push({t:c.boucle, P:c.pose(c.boucle)});
      R.jouer(Lc, {boucle:true, debut:c0 * 1000, cle:'course'});
      return;
    }
    for(u = 0; u < c.duree; u += DT) images.push({t:u, P:c.pose(u)});
    images.push({t:c.duree, P:c.pose(c.duree)});
    debut = c0; finS = c0 + c.duree; ensuite = {P:this.base};
  } else if(S.cles){
    for(u = 0; u < S.fin; u += DT) images.push({t:u, P:trans(HV.gesteImage(S.base, S.cles, u), S.t0 + u)});
    images.push({t:S.fin, P:HV.gesteImage(S.base, S.cles, S.fin)});
    debut = S.t0; finS = S.t0 + S.fin;
    var a = S.apres;
    ensuite = typeof a === 'function' ? {f:a, t0:finS} : {P:a ? HV.avec(S.base, a) : S.base};
  } else ensuite = this.apresF ? {f:this.apresF, t0:this.t0} : {P:this.tenue || this.base};
  function apres(){
    if(gen !== me._cuitGen || R.mort) return;
    if(ensuite.f){
      var per = ensuite.f.periode || 4, Lf = [], v;
      for(v = 0; v < per; v += DT) Lf.push({t:v, P:ensuite.f(v)});
      Lf.push({t:per, P:ensuite.f(per)});
      R.jouer(Lf, {boucle:true, debut:(ensuite.t0 != null ? ensuite.t0 : (finS || now)) * 1000});
    } else {
      /* (la petite vie : prévue une fois par pose gardée) */
      R.jouer(R.imagesVie(ensuite.P), {boucle:true, debut:(finS || now) * 1000, cle:ensuite.P === me.base ? 'vie' : null});
      me.cuitAttente();
    }
  }
  if(images.length) R.jouer(images, {debut:debut * 1000}).then(apres);
  else apres();
};
/* LES GESTES D'ATTENTE (hv-attente.js) : toutes les 3 à 5,5 s, au calme, un geste au hasard — seulement s'il est déjà cuit (sinon, on
   attend le suivant ; la cuisson d'avance s'en charge) */
V.cuitAttente = function(){
  var me = this;
  clearTimeout(this._cuitAttente);
  if(!this._veut || this.ko) return;
  this._cuitAttente = setTimeout(function(){
    if(!me.cuit || me.cuit.mort || !me._veut || me.ko) return;
    if(me.cles || me.course || me.apresF || me.tenue || me.effets.length || me._glisse) return me.cuitAttente();
    var g = me.attente(), fin = HV.dureeGeste(g), pret = true, t;
    for(t = 0; t <= fin && pret; t += 0.25) if(me.cuit.aCuire(HV.gesteImage(me.base, g, t))) pret = false;
    if(!pret) return me.cuitAttente();
    me.jouer(g);
  }, (3 + Math.random() * 2.5) * 1000);
};
/* LA CUISSON D'AVANCE : les morceaux de tous ses gestes, un à la fois, quand il ne fait rien (entre deux tours) — ceux de son rôle
   d'abord, puis les coups qu'il prend, la joie, les gestes d'attente. Gardés pour toute la partie (hv-cuit.js, CU.cache). */
V.cuitPrecuire = function(){
  if(/[?&]precuire=0/.test(G.location ? G.location.search : '')) return;          /* (les essais) */
  var me = this, R = this.cuit, b = this.base, D = HV.DONJON, A = HV.ALCHI, S = HV.SAGE, L = [];
  function g(cles){ if(cles && cles.length && cles[0] instanceof Array) L.push(cles); }
  if(this.role === 'pisteur'){ g(D.dague); g(D.dagueSaut); g(D.tir); }
  if(this.role === 'alchimiste' && A){ g(A.preparer); g(A.lancer); g(A.louche); g(A.herbes); }
  if(this.role === 'sage' && S){ g(S.sort); g(S.appel); g(S.bouclier); g(S.eclairSalle); g(S.etudier); }
  /* (24 novembre : la victoire en tournant n'était pas cuite d'avance — son buste restait de face pendant tout le tour) */
  g(D.choisi); g(D.coup); g(D.chute); g([[0.01, HV.SONNEE]].concat(decale(HV.RELEVE, 0.5))); g(D.joie); g(D.joieTour); g(D.froid); g(D.rats); g(D.poing);
  g(D.toile); g(D.crapaud); g(D.amulette);
  var at = HV.attentes ? HV.attentes(this.role, b) : {}; Object.keys(at).forEach(function(n){ g(at[n]); });
  var vies = [b, HV.SONNEE]; if(this.role === 'alchimiste' && A && A.PRET) vies.push(HV.avec(b, A.PRET));
  var i = 0, libre = function(){ return !me.cles && !me.course && !me.effets.length && !me._glisse; };
  (function suite(){
    if(!me.cuit || me.cuit.mort) return;
    var im = [];
    if(i < vies.length){ im = R.imagesVie(vies[i++]).filter(function(x, j){ return j % 3 === 0; }); }
    else {
      var cl = L[i - vies.length]; if(!cl) return; i++;
      /* (tous les dixièmes de seconde : au pas du jeu, 1/30 s, il y avait 50 % de dessins en plus — 61 Mo de toiles au lieu de 40 sur
         un téléphone ; ce qui manque est remplacé par la variante cuite la plus proche — CP.variante, hv-cuit.js) */
      var fin = HV.dureeGeste(cl), t; for(t = 0; t <= fin + 1e-6; t += 0.1) im.push({t:t, P:HV.gesteImage(b, cl, Math.min(t, fin))});
    }
    /* (24 novembre : chez Léo, en temps réel, chaque dessin cuit d'avance est un petit à-coup — on en fait un toutes les 0,15 s) */
    R.cuireImages(im, libre, G.SALLE && G.SALLE.tempsReel ? 150 : 16).then(function(){ setTimeout(suite, 50); });
  })();
};

/* (les gestes d'attaque, qu'on peut sauter en temps réel : V.file) */
['tirer', 'dague', 'preparer', 'lancer', 'louche', 'herbes', 'sort', 'bouclier', 'eclairSalle', 'etudier'].forEach(function(n){
  var f = V[n]; if(typeof f !== 'function') return;
  V[n] = function(){ this._sautable = true; try{ return f.apply(this, arguments); } finally{ this._sautable = false; } };
});
/* ---------- l'enveloppe : quand le donjon pose window.HerosAnime, son « creer » donne la Pisteuse en volume ---------- */
/* (« ?ancien=1 » dans l'adresse : les anciens héros, comme avant le 24 novembre — au cas où) */
var ANCIEN = /[?&]ancien=1/.test(G.location ? G.location.search : ''), VOLUME_FORCE = /[?&]volume=1/.test(G.location ? G.location.search : '');
/* LES TABLETTES TROP LENTES GARDENT LES ANCIENS HÉROS (24 novembre — Romain : « une très vieille tablette… il faut absolument pas que
   ça rame »). Mesuré dans le donjon, processeur ralenti comme une vieille tablette (×4, ×6) : les héros en volume y bougent à 4 ou 5
   images par seconde pendant leurs gestes — ça saccade — alors que les anciens, « cuits » en images, glissent tout seuls. Au premier
   héros créé, on chronomètre donc quatre dessins d'un héros en volume (hors de l'écran) : au-delà de SEUIL_ANCIENS ms par dessin,
   toute la page garde les anciens héros. (Sur la machine d'essai : ~8 ms ; ×2 : ~16 ms.) « ?volume=1 » : les héros en volume quand
   même. La mesure : HerosVuesDonjon.mesure. */
var SEUIL_ANCIENS = 13, TROP_LENT = null;
function mesurer(){
  try{
    var h = HV.avec(ALLURES.pisteur, {}), K = HV.contexte('hvmesure', h), P = HV.avec(HV.POSES.dGarde, {cap:CAP}), d = document.createElement('div');
    d.style.cssText = 'position:absolute;left:-3000px;top:0;width:200px;height:290px;overflow:hidden;pointer-events:none';
    d.innerHTML = '<svg class="hv" viewBox="' + CADRE.join(' ') + '" xmlns="http://www.w3.org/2000/svg" style="width:200px;height:290px">' + HV.defs(K) + '<g class="hv-fig"></g></svg>';
    document.body.appendChild(d);
    var g = d.querySelector('.hv-fig'), i, t0;
    g.innerHTML = HV.dessin(h, P, {K:K}); void d.offsetWidth;                  /* (le premier : la page se met en route) */
    /* (le plus court des cinq : pendant le chargement, la page fait autre chose en même temps — les sons, les images — et la moyenne
       comptait ce travail-là aussi) */
    var ms = 1e9;
    for(i = 0; i < 5; i++){ P.cap = CAP - 6 + i * 3; t0 = horloge(); g.innerHTML = HV.dessin(h, P, {K:K}); void d.offsetWidth; ms = Math.min(ms, horloge() - t0); }
    d.remove();
    return ms;
  }catch(e){ return 0; }
}
/* (24 novembre, 4 h 14 — Romain : « les nouveaux personnages, ils font ramer même mon iPhone » : la mesure ne voit pas la peinture
   du dessin, qui coûte cher sur Safari. TANT QU'ILS NE SONT PAS « CUITS » EN IMAGES, les héros en volume ne viennent plus que sur
   demande : « ?volume=1 » dans l'adresse. Partout ailleurs, les anciens héros.) */
var SUR_DEMANDE = true;
function tropLent(){
  /* (cuits, ils ne coûtent presque rien à chaque image, sur toutes les tablettes : plus de mesure) */
  if(!SUR_DEMANDE && CUIT){ if(TROP_LENT === null){ TROP_LENT = false; if(G.HerosVuesDonjon) G.HerosVuesDonjon.mesure = {ms:0, anciens:false, cuit:true}; } return false; }
  if(SUR_DEMANDE && !VOLUME_FORCE){ if(TROP_LENT === null){ TROP_LENT = true; if(G.HerosVuesDonjon) G.HerosVuesDonjon.mesure = {ms:0, anciens:true, attente:true}; } return true; }
  if(TROP_LENT === null){
    var ms = VOLUME_FORCE ? 0 : mesurer();
    TROP_LENT = ms > SEUIL_ANCIENS;
    if(G.HerosVuesDonjon) G.HerosVuesDonjon.mesure = {ms:Math.round(ms * 10) / 10, anciens:TROP_LENT};
  }
  return TROP_LENT;
}
function envelopper(HA){
  if(!HA || HA.__hv) return HA;
  var creer0 = HA.creer;
  HA.creer = function(cont, role, lk){
    if(!ALLURES[role] || G.HV_ANCIEN || ANCIEN || (G.HV_ROLES && G.HV_ROLES.indexOf(role) < 0) || tropLent()) return creer0.apply(HA, arguments);
    return new Volume(cont, lk, function(c, r, l){ return creer0.call(HA, c, r, l); }, role);
  };
  HA.__hv = true;
  return HA;
}
var ha;
if(G.HerosAnime) ha = envelopper(G.HerosAnime);
Object.defineProperty(G, 'HerosAnime', {configurable:true, get:function(){ return ha; }, set:function(v){ ha = envelopper(v); }});
G.HerosVuesDonjon = {Volume:Volume, CADRE:CADRE};
})(window);
