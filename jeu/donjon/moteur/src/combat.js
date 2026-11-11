/* combat.js — le combat à l'écran (MOTEUR-DONJON.md §3.2). Il reprend l'écran de la salle d'essai (validé par Romain)
   et JOUE LES ÉVÈNEMENTS des règles (regles.js) : il ne décide jamais d'un résultat.

     DJ.Combat.preparer(salle)          charge et prépare ce qu'il faut (modules des bêtes, décor, cuisson) : pendant l'écran de passage
     DJ.Combat.lancer(partie, salle)    -> Promise : 'victoire' | 'fuite' | 'defaite' (la partie est à jour ; après une fuite ou
                                        une défaite, la dernière sauvegarde est rechargée par les règles)
     DJ.Combat.etat()                   pour les tests : {mode, occupe, tour, sel, geste, photo}

   Règles de Romain tenues ici : pas de bandeau de texte en haut (l'écran reste sombre) ; deux curseurs de volume discrets ;
   les refus en deux mots au-dessus de celui qu'on a touché ; un petit son au toucher des icônes ; le critique reste
   localisé autour de la bête ; aucune lecture vocale sans bouton 🔊 ; boutons jaunes à texte noir pour « aller ». */
(function(){
'use strict';
var SALLE = window.SALLE, DJ = window.DJ, D = window.DonjonDonnees, Regles = window.Regles;
var el = DJ.el, q = DJ.q, qa = DJ.qa, esc = DJ.esc, attendre = DJ.attendre, relancer = DJ.relancer, HER = DJ.HER, hCx = DJ.hCx, hPt = DJ.hPt;
var ORDRE = D.ORDRE, EXPOSES = D.EXPOSES;
var Fx, Son;
function son(){ DJ.son.apply(null, arguments); }
function bruit(id, o, ancien){ return DJ.bruit(id, o, ancien); }
/* le Pisteur lâche la corde 1,32 s après le début du tir ; sa lame touche 0,70 s après le début du coup */
var LACHER = 1.32, LAME = .70;
var E = null;                     /* le combat en cours */
var jeu, fx, fxHaut, hud, bandeEl;

/* ====================================================================== 1. PRÉPARER (pendant l'écran de passage) */
var cuisson = null;
function cuireHeros(){
  if(cuisson) return cuisson;
  var s = Math.min(window.innerWidth / 960, window.innerHeight / 540), dpr = window.devicePixelRatio || 1;
  function res(largeurPx, unites){ return Math.max(.8, Math.min(2.6, largeurPx / unites * s * dpr * 1.25)); }
  var l = [];
  if(SALLE.Fx && SALLE.Fx.cuire) SALLE.Fx.cuire();
  if(window.HerosAnime && window.HerosAnime.preparer && window.Cuire) l.push(window.HerosAnime.preparer(ORDRE.map(function(h){ return {role:h, lk:DJ.LOOK[h]}; }), {res:res(200, 250)}));
  cuisson = Promise.all(l).catch(function(e){ if(window.console) console.warn('cuisson', e); });
  cuisson.res = res;
  return cuisson;
}
var ratPret = null;
function cuireRat(){
  if(ratPret) return ratPret;
  var s = Math.min(window.innerWidth / 960, window.innerHeight / 540), dpr = window.devicePixelRatio || 1;
  ratPret = window.RatAnime && window.RatAnime.preparer && window.Cuire ? Promise.resolve(window.RatAnime.preparer({res:Math.max(.8, Math.min(2.6, 206 / 540 * s * dpr * 1.25))})).catch(function(){}) : Promise.resolve();
  return ratPret;
}
/* les bêtes qui peuvent naître en plein combat */
var NAISSENT = {araignee:['petitearaignee'], bourbe:['tetard']};
function modulesDe(salle){
  var l = [];
  (D.COMBATS[salle].monstres || []).forEach(function(t){
    var m = D.MONSTRES[t].module; if(l.indexOf(m) < 0) l.push(m);
    (NAISSENT[t] || []).forEach(function(x){ var mx = D.MONSTRES[x].module; if(l.indexOf(mx) < 0) l.push(mx); });
  });
  return l;
}
function preparer(salle){
  var mods = modulesDe(salle);
  return Promise.all(mods.map(function(m){ return DJ.charger.bete(m); }))
    .then(function(){ return Promise.all([cuireHeros(), mods.indexOf('rat') >= 0 ? cuireRat() : null, DJ.charger.image(DJ.charger.decor(salle)),
      DJ.charger.image(SALLE.img('fumee-a')), DJ.charger.image(SALLE.img('brume-a')), DJ.charger.image(SALLE.img('brume-b'))]); });
}

/* ====================================================================== 2. CONSTRUIRE L'ÉCRAN */
function lancer(partie, salle){
  Fx = SALLE.Fx; Son = SALLE.Son;
  return preparer(salle).then(function(){
    return new Promise(function(fin){
      E = {partie:partie, salle:salle, c:null, ph:null, A:{h:{}, b:{}}, ordre:[], prises:[], mode:'entree', sel:null, geste:null, choix:[], occupe:true,
        tour:0, domes:{}, toiles:{}, finir:fin, fini:false, nom:D.COMBATS[salle].nom};
      construire();
      E.c = Regles.combat(partie, salle);
      E.ph = E.c.etat();
      jouer(E.c.entree()).then(function(){ q('#combat').classList.add('ouvert'); return attendre(300); }).then(tourHeros);
    });
  });
}
function construire(){
  jeu = q('#jeu'); DJ.fermer(); DJ.taire();
  jeu.innerHTML = '';
  DJ.cssHeros();
  var c = el('div', 'ecran'); c.id = 'combat'; c.className = 'ecran salle-' + E.salle;
  c.innerHTML = '<div id="monde"><div id="secousse"><img class="decor" src="' + DJ.charger.decor(E.salle) + '" alt=""><div id="ambiance"></div><div id="sol-fx"></div><div id="persos"></div><div id="fx"></div><div id="fumee"></div><div id="hud"></div></div></div>' +
    '<div id="haut"><div id="salle-nom"><b>' + esc(E.nom) + '</b><span id="tour-nom"></span></div>' + DJ.curseursVolume() +
    '<button id="fuite" class="sombre" data-act="fuite">🏃 Fuite !</button></div>' +
    '<div id="bande"></div><div id="ecran-fx"></div><div id="fx-haut"></div>';
  jeu.appendChild(c);
  fx = q('#fx'); fxHaut = q('#fx-haut'); hud = q('#hud'); bandeEl = q('#bande');
  Fx.init({fx:fx, sol:q('#sol-fx'), fumee:q('#fumee'), ecran:q('#ecran-fx'), monde:q('#monde'), secousse:q('#secousse')});
  DJ.brancherCurseurs(c);
  /* ce qui se pose par-dessus le décor (la grille des canaux, tant que le passage secret est fermé) */
  try{
    var faits = (E.partie && E.partie.faits) || {}, plus = window.SCENES && window.SCENES.surDecor ? window.SCENES.surDecor(E.salle, {ouvert:!!faits['passage:canaux']}) : [];
    plus.forEach(function(o){
      var b = el('div', 'sur-decor'), w = (o.boite || o).w, h = (o.boite || o).h;
      b.style.cssText = 'position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;width:' + w + 'px;height:' + h + 'px;overflow:hidden;pointer-events:none';
      if(o.arche) b.style.clipPath = b.style.webkitClipPath = 'path("' + o.arche + '")';
      b.innerHTML = '<img alt="" draggable="false" style="position:absolute;left:0;top:0;width:' + o.w + 'px;height:' + o.h + 'px" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(o.svg) + '">';
      q('#secousse').insertBefore(b, q('#ambiance'));
    });
  }catch(e){ if(window.console) console.warn('sur-decor', e); }
  try{ if(window.AMBIANCE && window.AMBIANCE[E.salle]) E.ambiance = window.AMBIANCE[E.salle](q('#ambiance')); }catch(e){}
  var p = q('#persos');
  ORDRE.forEach(function(h){
    var d = el('div', 'perso heros module h-' + h);
    d.style.left = (HER[h].x - 40) + 'px'; d.style.zIndex = 10 + ORDRE.indexOf(h); d.style.visibility = 'hidden';
    d.innerHTML = '<div class="ombre"></div><div class="anneau"><i></i></div><div class="acteur" style="left:40px;top:40px;width:200px;height:240px"></div>' +
      '<div class="check">✓</div><div class="etoiles">💫</div><div class="cri">Fuite !</div>';
    p.appendChild(d);
    E.A.h[h] = window.HerosAnime.creer(q('.acteur', d), h, DJ.LOOK[h]);
    var z = el('div', 'zone'); z.setAttribute('data-act', 'perso'); z.setAttribute('data-type', 'heros'); z.setAttribute('data-id', h);
    z.style.cssText = 'left:' + (hCx(h) - 58) + 'px;top:96px;width:116px;height:276px';
    hud.appendChild(z);
    var pv = el('div', 'pv'); pv.id = 'pv-' + h; pv.style.left = hCx(h) + 'px';
    pv.innerHTML = '<div class="barre"><i></i></div><b></b>';
    hud.appendChild(pv);
  });
  DJ.musiqueCombat(E.salle);
}
function slotH(h){ return q('.h-' + h); }
function B(id){ return E.A.b[id]; }
function photoB(id){ var l = E.ph ? E.ph.betes : []; for(var k = 0; k < l.length; k++) if(l[k].id === id) return l[k]; return null; }

/* une bête arrive : son cadre, sa zone à toucher, sa barre de vie, ses badges */
function creerBete(b, x){
  var rang = E.ordre.length;
  if(x == null) x = DJ.Betes.place(E.salle, b, b._debut ? b._rang : null, E.prises);
  E.prises.push(x);
  var a = DJ.Betes.creer(b, x, q('#persos'), fx);
  a.x0 = x;
  /* devant = à gauche ; celles de derrière passent par-dessus (leur tête recouvre l'arrière de celle de devant), sauf le boss */
  a.el.style.zIndex = b.module === 'bourbe' ? 2 : b._debut ? 4 + b._rang : 9;
  E.A.b[b.id] = a; E.ordre.push(b.id);
  var bd = el('div', 'badges'); bd.id = 'badges-' + b.id; hud.appendChild(bd);
  var z = el('div', 'zone'); z.setAttribute('data-act', 'perso'); z.setAttribute('data-type', 'bete'); z.setAttribute('data-id', b.id); z.id = 'zone-' + b.id;
  if(b.module === 'bourbe') hud.insertBefore(z, hud.firstChild); else hud.appendChild(z);
  var pv = el('div', 'pv monstre' + (b.rang === 'boss' ? ' boss' : b.rang === 'elite' ? ' elite' : '')); pv.id = 'pv-' + b.id;
  pv.innerHTML = (b.rang === 'boss' ? '<em>' + esc(b.nom.split(',')[0]) + '</em>' : '') + '<div class="barre"><i></i></div><b></b>';
  if(b.rang !== 'boss') pv.style.left = (a.cadre.x + a.cadre.w * (a.rat ? .56 : .5)) + 'px';
  hud.appendChild(pv);
  a.pvMax = b.pvMax; a.pv = b.pv;
  return a;
}
function retirerHud(id){ ['zone-', 'pv-', 'badges-'].forEach(function(p){ var e = q('#' + p + id); if(e) e.remove(); }); }
/* une petite bête née en combat rend sa place en partant (une autre pourra y naître) */
function liberer(a){ if(DJ.Betes.AVANT[a.module]){ var k = E.prises.indexOf(a.x0); if(k >= 0) E.prises.splice(k, 1); } }

/* ====================================================================== 3. L'AFFICHAGE DE L'ÉTAT (d'après la photo des règles) */
function majBarres(){
  var ph = E.ph;
  ORDRE.forEach(function(h){
    var e = q('#pv-' + h); if(!e) return;
    var s = ph.heros[h], k = Math.max(0, s.pv / s.pvMax), i = q('i', e);
    i.style.transform = 'scaleX(' + k + ')';
    i.className = k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '';
    q('b', e).textContent = s.pv;
    e.style.opacity = s.avale ? 0 : 1;
  });
  ph.betes.forEach(function(b){
    var e = q('#pv-' + b.id); if(!e) return;
    q('i', e).style.transform = 'scaleX(' + Math.max(0, Math.min(1, b.pv / b.pvMax)) + ')';
    q('b', e).textContent = b.pv;
    e.style.opacity = b.mort ? 0 : 1;
  });
}
/* un chiffre de vie posé tout de suite (pendant qu'on joue une liste, avant la photo finale) */
function barre(cle, pv, pvMax){
  var e = q('#pv-' + cle); if(!e) return;
  var k = Math.max(0, Math.min(1, pv / pvMax)), i = q('i', e);
  i.style.transform = 'scaleX(' + k + ')';
  if(!e.classList.contains('monstre')) i.className = k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '';
  q('b', e).textContent = pv;
}
var CHIPS = {
  enrage:['💢×2', ''], folle:['💢×2', ''], brule:['🔥−4', 'e-feu'], colle:['collé', 'e-colle'], gele:['❄️ gelé', 'e-colle'], tournis:['💫 sonné', 'e-colle'],
  rougeoie:['♨️ plus fort', 'e-feu'], grand:['⬆️ plus fort', ''], boule:['🛡️ en boule', 'e-colle'], haut:['⬆️ trop haut', 'e-colle'], sous:['🌊 sous l\'eau', 'e-colle'],
  gonfle:['🎈 saut ×2', ''], noeud:['🪢 nœud tendu', 'e-colle'], sec:['☀️ tout sec', 'e-feu'],
  colere:['😡 en colère', 'e-rage']            /* (Romain, 11 novembre : les élites et le boss se fâchent) */
};
var ICONE_ATT = {toile:'🕸️', langue:'👅'};
/* un coup préparé emprunte l'animation d'une attaque du module (marteau -> poing…) : donnees.js le dit dans « anim » */
var ANIM_ATT = {};
Object.keys(D.MONSTRES).forEach(function(k){ var A = D.MONSTRES[k].attaques || {}; Object.keys(A).forEach(function(n){ if(A[n].anim) ANIM_ATT[n] = A[n].anim; }); });
function animDe(nom){ return ANIM_ATT[nom] || nom; }
/* LA RUNE DE L'ŒIL (Romain, 11 novembre) : sans elle, personne ne sait qui sera frappé. Avec elle, chaque monstre montre
   sa proie et les dégâts de ce tour, puis (plus petit, après la flèche) ceux du tour suivant.
   LE COUP QUI SE PRÉPARE, lui, se voit toujours (une pastille, un rond rouge sous la bête) ; l'œil dit en plus sur qui il
   tombera : la proie, un sablier pendant l'élan, et — si le Sage voit aussi le tour suivant — les dégâts à venir. */
function tetesVise(l, petit){
  var plusieurs = l.length > 1 || petit, t = plusieurs ? 26 : 32;
  return l.map(function(h){ return '<span class="vise' + (plusieurs ? ' petit' : '') + '" style="border-color:' + HER[h].coul + '"><i class="img-' + h + '" style="' + DJ.tete(h, t, 74, 4) + '"></i></span>'; }).join('');
}
function degatsVise(v){ return v.degats > 0 ? '<b class="vise-dg">−' + v.degats + (v.fois > 1 ? '<small>×' + v.fois + '</small>' : '') + '</b>' : ''; }
function ligneVise(v, petit, apres){
  if(!v.cibles.length) return '';
  var debut = petit ? '<span class="vise-puis">➜</span>' : '<span class="vise-fleche" style="border-right-color:' + HER[v.cibles[0]].coul + '"></span>';
  /* l'élan : la proie et le sablier ; « apres » = le coup lui-même, au tour suivant, si l'œil le voit déjà */
  if(v.prepare) return '<div class="vise-bloc elan' + (petit ? ' puis' : '') + (apres ? ' gros' : '') + '">' + debut + tetesVise(v.cibles, petit) + '<span class="vise-ic">⏳</span>' +
    (apres ? '<span class="vise-puis">➜</span>' + degatsVise(apres) : '') + '</div>';
  return '<div class="vise-bloc' + (petit ? ' puis' : '') + (v.gros ? ' gros' : '') + '">' + debut + tetesVise(v.cibles, petit) +
    (ICONE_ATT[v.attaque] ? '<span class="vise-ic">' + ICONE_ATT[v.attaque] + '</span>' : '') + degatsVise(v) + '</div>';
}
function majBadges(){
  E.ph.betes.forEach(function(b){
    var e = q('#badges-' + b.id); if(!e) return;
    if(b.mort){ e.innerHTML = ''; return; }
    var s = '', v = '';
    if(E.mode !== 'fin'){
      /* (un coup préparé que l'œil voit en entier tient sur une seule ligne : la proie, le sablier, puis les dégâts) */
      var coup = b.vise && b.vise.prepare && b.suite && !b.suite.prepare && b.suite.attaque === b.vise.attaque ? b.suite : null;
      if(b.vise) v += ligneVise(b.vise, false, coup);
      if(b.suite && !coup) v += ligneVise(b.suite, true);
    }
    if(v) s += '<div class="vise-pile">' + v + '</div>';
    var x = '';
    if(b.prepare) x += '<span class="etat e-coup' + (b.prepare === 2 ? ' pret' : '') + '">' + (b.prepare === 2 ? '💥 gros coup !' : '⏳ gros coup bientôt') + '</span>';
    Object.keys(b.etats).forEach(function(n){ var C = CHIPS[n]; if(C) x += '<span class="etat ' + C[1] + '">' + C[0] + '</span>'; });
    if(x) s += '<div class="etats">' + x + '</div>';
    if(e._html !== s){ e.innerHTML = s; e._html = s; }
  });
}
/* les badges et la zone à toucher suivent la bête (elle se dresse, tombe, vole) : on lit ses ancres */
/* les badges se posent au-dessus de la bête ; si elle est tout en haut de l'écran (elle vole), ils passent dessous */
function posBadges(a, haut){
  var y = Math.min(haut.y - 44, 286);            /* jamais sur la rangée des barres de vie (une bête sur le dos a la tête en bas) */
  if(y >= 88) return {x:haut.x, y:y};
  if(a.info.vole || a.info.suspendue){ var c = a.ancre('centre'); return {x:c.x, y:Math.max(96, c.y + 46)}; }
  return {x:haut.x, y:92};
}
function poserBadges(id, a, haut){
  var bd = q('#badges-' + id); if(!bd) return;
  var p = posBadges(a, haut); bd.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) translateX(-50%)';
}
function placer(id){
  var a = B(id), b = photoB(id); if(!a || a.mort) return;
  var haut = a.ancre('haut'), z = q('#zone-' + id);
  poserBadges(id, a, haut);
  if(z){
    var c = a.ancre('centre'), pieds = a.ancre('pieds'), I = a.info, la = I.places >= 3 ? 300 : I.places === 2 ? 190 : Math.min(124, Math.max(84, a.cadre.w * .55));
    var y0 = Math.max(84, Math.min(haut.y, c.y - 44) - 24), y1 = Math.min(372, Math.max(pieds.y, c.y + 44) + 8);
    z.style.cssText = 'left:' + (c.x - la / 2).toFixed(1) + 'px;top:' + y0.toFixed(1) + 'px;width:' + la + 'px;height:' + Math.max(60, y1 - y0).toFixed(1) + 'px';
  }
}
function placerTout(){ E.ordre.forEach(placer); }
/* pendant qu'une liste se joue (les bêtes bougent), on suit leurs têtes à chaque image ; au repos, plus aucune boucle */
var suivi = 0;
function suivre(on){
  if(!on){ suivi++; placerTout(); return; }
  var mon = ++suivi;
  (function pas(){ if(mon !== suivi || !E || E.fini) return; E.ordre.forEach(function(id){ var a = B(id); if(!a || a.mort) return; poserBadges(id, a, a.ancre('haut')); }); requestAnimationFrame(pas); })();
}
function ciblesValides(){
  var o = {betes:[], heros:[], tout:false};
  if(E.mode !== 'cible' || !E.geste) return o;
  var g = E.geste;
  if(g.vise === 'salle'){ o.betes = E.ph.betes.filter(function(b){ return !b.mort; }).map(function(b){ return b.id; }); o.tout = true; return o; }
  if(g.vise === 'equipe'){ o.heros = ORDRE.filter(function(h){ return !E.ph.heros[h].avale; }); o.tout = true; return o; }
  (g.cibles || []).forEach(function(id){ if(HER[id]) o.heros.push(id); else o.betes.push(id); });
  return o;
}
function majScene(){
  var m = E.mode, ph = E.ph, cb = ciblesValides(), aJouer = ph.aJouer || [];
  ORDRE.forEach(function(h){
    var e = slotH(h), s = ph.heros[h]; if(!e) return;
    var tourHeros = m === 'qui' || m === 'gestes' || m === 'cible' || m === 'action';
    e.classList.toggle('joue', tourHeros && (s.joue || (s.entoile && aJouer.indexOf(h) < 0)) && !s.sol);
    e.classList.toggle('sol', !!s.sol);
    e.classList.toggle('avale', !!s.avale);
    var d = (m === 'qui' && aJouer.indexOf(h) >= 0 && !s.avale) || (m === 'cible' && cb.heros.indexOf(h) >= 0 && E.choix.indexOf(h) < 0);
    e.classList.toggle('dispo', d);
    var actif = ((m === 'gestes' || (m === 'cible' && !d) || m === 'action') && E.sel === h) || E.choix.indexOf(h) >= 0;
    if(e.classList.contains('actif') !== actif){ e.classList.toggle('actif', actif); try{ E.A.h[h].choisi(actif); }catch(x){} }
  });
  ph.betes.forEach(function(b){
    var a = B(b.id); if(!a || b.mort) return;
    a.el.classList.toggle('dispo', m === 'cible' && cb.betes.indexOf(b.id) >= 0);
    a.el.classList.toggle('ouvert', !!b.ouvert);
    a.el.classList.toggle('prepare', !!b.prepare);
    a.el.classList.toggle('colere', b.etats.colere !== undefined);
  });
  majBadges();
  var t = q('#tour-nom'); if(t) t.innerHTML = E.tour ? 'Tour ' + E.tour : '';
  var f = q('#fuite'); if(f) f.disabled = E.occupe;
}
function maj(){ E.ph = E.c.etat(); majBarres(); majScene(); bande(); placerTout(); }

/* ====================================================================== 4. LA BANDE DU BAS */
function pvB(h){
  var s = E.ph.heros[h], k = Math.max(0, s.pv / s.pvMax);
  return '<span class="pv-b"><span class="barre"><i class="' + (k <= .25 ? 'bas' : k <= .5 ? 'moyen' : '') + '" style="width:' + (k * 100) + '%"></i></span><b>' + s.pv + '</b></span>';
}
function bande(){
  if(!bandeEl) return;
  var m = E.mode, s = '', ph = E.ph, aJouer = ph.aJouer || [];
  bandeEl.classList.toggle('attend', m === 'action' || m === 'monstres' || m === 'entree');
  if(m === 'qui' || m === 'monstres' || m === 'fin' || m === 'entree' || !E.sel){
    if(m === 'monstres') s += '<div class="b-titre"><small>Tour ' + E.tour + '</small><b>À eux !</b><em>Ils attaquent…</em></div>';
    else if(m === 'fin') s += '<div class="b-titre"><small>Tour ' + E.tour + '</small><b>' + (E.c.fini() === 'victoire' ? 'Victoire !' : 'Fuite !') + '</b></div>';
    else s += '<div class="b-titre"><small>Tour ' + (E.tour || 1) + '</small><b>Qui joue ?</b>' + (m === 'qui' && aJouer.length < 3 ? '<em>' + aJouer.length + ' à jouer</em>' : '') + '</div>';
    s += '<div class="b-qui">' + ORDRE.map(function(h){
      var st = ph.heros[h], pret = m === 'qui' && aJouer.indexOf(h) >= 0, j = m === 'qui' && !pret && !st.sol;
      var cls = st.sol ? ' sol' : (j ? ' joue' : (pret ? ' guide' : ''));
      var etat = st.sol ? 'au sol 💫' : st.avale ? (pret ? 'dans le ventre !' : 'avalé…') : st.entoile && !st.joue ? 'entoilé 🕸️' : j ? 'a joué' : (pret ? 'prêt !' : '');
      return '<button class="b-heros' + cls + '" data-act="heros" data-id="' + h + '"><span class="portrait img-' + h + '" style="' + DJ.tete(h, 76, 116, 10) + '"></span>' +
        '<b>' + D.HEROS[h].nom + '</b>' + pvB(h) + '<em>' + etat + '</em>' + (j && st.joue ? '<span class="ok">✓</span>' : '') + (st.bouclier ? '<span class="bouc-b">🛡️</span>' : '') + '</button>';
    }).join('') + '</div>';
    bandeEl.innerHTML = s;
    return;
  }
  /* Romain, 10 novembre : plus de sac de 3 recettes, l'Alchimiste a TOUTES ses potions ; le Pisteur porte tous ses carquois
     et choisit sa flèche. Les gestes de toujours restent de grandes cartes ; les potions et les flèches spéciales sont de
     petites cartes (l'image d'abord, le nom dessous), toutes visibles d'un coup : un seul toucher, comme avant. */
  var h = E.sel, H = D.HEROS[h], gestes = E.c.gestes(h);
  var base = gestes.filter(function(g){ return g.geste.indexOf('p:') !== 0 && g.geste.indexOf('f:') !== 0; });
  var petites = gestes.filter(function(g){ return g.geste.indexOf('f:') === 0; }).concat(gestes.filter(function(g){ return g.geste.indexOf('p:') === 0 && (h !== 'pisteur' || D.RECETTES[g.geste.slice(2)].fleche); }));
  E.gestes = gestes;
  s += '<div class="b-moi"><span class="portrait img-' + h + '" style="' + DJ.tete(h, 86, 116, 10) + '"></span>' +
    '<button class="b-retour" data-act="retour" aria-label="Changer de héros">↩</button>' +
    '<b class="b-nom">' + H.nom + '</b>' + pvB(h) + '</div>';
  s += '<div class="b-sep"></div><div class="b-sec"><div class="b-lbl">Ses gestes</div><div class="b-cartes' + (petites.length > 4 || base.length > 3 ? ' serre' : '') + '">' + base.map(carte).join('') + '</div></div>';
  if(petites.length){
    /* la petite carte choisie dit ce qu'elle fait, en trois mots, à la place du titre */
    var ch = E.geste && petites.filter(function(g){ return g.geste === E.geste.geste; })[0], lbl = h === 'pisteur' ? 'Ses autres flèches' : 'Ses potions';
    if(ch) lbl = ch.geste.indexOf('p:') === 0 ? D.RECETTES[ch.geste.slice(2)].d : (D.OBJETS[ch.geste.slice(2)].dg || lbl);
    s += '<div class="b-sep"></div><div class="b-sec"><div class="b-lbl' + (ch ? ' dit' : '') + '">' + esc(lbl) + '</div><div class="b-petites n' + petites.length + '">' + petites.map(petite).join('') + '</div></div>';
  }
  bandeEl.innerHTML = s;
}
function carte(g){
  var id = g.geste, R = D.GESTES[id];
  var cls = !g.permis ? ' off' : E.geste && E.geste.geste === id ? ' choisie' : (E.mode === 'gestes' ? ' guide' : '');
  var d = g.permis ? R.d : g.mot;
  return '<button class="carte' + cls + '" data-act="geste" data-id="' + id + '">' +
    '<span class="c-ic">' + R.ic + '</span><b>' + esc(g.nom || R.nom) + '</b><small>' + esc(d || '') + '</small></button>';
}
/* une petite carte : une potion (pour le Pisteur : la flèche trempée dedans) ou un carquois spécial */
function petite(g){
  var id = g.geste, potion = id.indexOf('p:') === 0, R = potion ? D.RECETTES[id.slice(2)] : D.OBJETS[id.slice(2)];
  var cls = !g.permis ? ' off' : E.geste && E.geste.geste === id ? ' choisie' : '';
  var nom = R.petit || R.nom;                                   /* le nom court, sous l'image */
  return '<button class="carte mini' + cls + (nom.length > 10 ? ' long' : '') + '" data-act="geste" data-id="' + id + '" aria-label="' + esc(g.nom || R.nom) + '">' +
    '<span class="c-ic">' + (potion ? DJ.potion(id.slice(2)) : (R.ic || '🏹')) + (potion && E.sel === 'pisteur' ? '<i class="fl">🏹</i>' : '') + '</span><b>' + esc(nom) + '</b></button>';
}
function refus(x, mot, y){ son('clic'); Fx.mot(x, y == null ? 96 : y, mot, 'refus'); }

/* ====================================================================== 5. LE TOUR DES HÉROS : qui, quel geste, sur qui */
function tourHeros(){
  if(!E || E.fini) return;
  E.mode = 'qui'; E.sel = null; E.geste = null; E.choix = []; E.occupe = false;
  suivre(false);
  maj();
}
function choisirHeros(h){
  var s = E.ph.heros[h];
  if((E.ph.aJouer || []).indexOf(h) < 0){
    refus(hCx(h), s.sol ? D.MOTS.sol : s.entoile && !s.joue ? D.MOTS.entoile : D.MOTS.joue);
    return;
  }
  son('clic');
  E.sel = h; E.geste = null; E.choix = []; E.mode = 'gestes';
  bande(); majScene();
}
function choisirGeste(id){
  var g = (E.gestes || E.c.gestes(E.sel)).filter(function(x){ return x.geste === id; })[0];
  if(!g) return;
  bruit('icone', {}, ['clic']);      /* le petit son au toucher d'une icône d'arme ou de potion (Romain, 9 novembre) */
  if(!g.permis){ refus(hCx(E.sel), g.mot || D.MOTS.impossible); return; }
  E.geste = g; E.choix = []; E.mode = 'cible';
  bande(); majScene();
}
function retour(){
  if(E.occupe) return;
  E.sel = null; E.geste = null; E.choix = []; E.mode = 'qui';
  bande(); majScene();
}
function toucherPerso(type, id){
  if(E.occupe) return;
  var cb = ciblesValides(), g = E.geste;
  if(type === 'heros'){
    if(E.mode === 'cible' && cb.heros.indexOf(id) >= 0){
      if(cb.tout) return agir(E.sel, g, null);
      var max = Math.min(g.max || 1, cb.heros.length);
      if(max > 1){
        if(E.choix.indexOf(id) >= 0) return;
        E.choix.push(id); son('clic');
        if(E.choix.length < max){ majScene(); return; }
        return agir(E.sel, g, E.choix.slice());
      }
      return agir(E.sel, g, id);
    }
    if(E.mode === 'cible' && g.vise !== 'bete' && g.vise !== 'devant' && g.vise !== 'salle'){
      var mot = E.c.refus(E.sel, g.geste, id);
      if(mot){ refus(hCx(id), mot); return; }
    }
    if(E.mode === 'qui' || E.mode === 'gestes' || E.mode === 'cible'){ if(id !== E.sel || E.mode === 'qui') choisirHeros(id); }
    return;
  }
  var b = photoB(id), a = B(id); if(!b || b.mort || !a) return;
  if(E.mode === 'cible' && cb.betes.indexOf(id) >= 0) return agir(E.sel, g, cb.tout ? null : id);
  if(E.mode === 'cible' && (g.vise === 'bete' || g.vise === 'devant')){
    var m2 = E.c.refus(E.sel, g.geste, id) || D.MOTS.impossible, hp = a.ancre('haut');
    refus(hp.x, m2, Math.max(96, hp.y - 20));
  }
}

/* ====================================================================== 6. JOUER UNE LISTE D'ÉVÈNEMENTS */
async function agir(h, g, cible){
  E.occupe = true; E.mode = 'action';
  bande(); majScene();
  var avant = E.ph, ev;
  try{ ev = E.c.jouer(h, cible == null ? {geste:g.geste} : {geste:g.geste, cible:cible}); }catch(e){ if(window.console) console.error(e); ev = []; }
  if(ev.length === 1 && ev[0].t === 'refus'){ E.occupe = false; E.mode = 'cible'; refus(hCx(h), ev[0].mot); maj(); return; }
  await jouer(ev, avant);
  await attendre(220);
  return apres();
}
async function apres(){
  if(!E || E.fini) return;
  if(E.c.fini()) return finCombat();
  if((E.c.aJouer() || []).length) return tourHeros();
  /* plus personne ne peut jouer : les monstres */
  E.mode = 'monstres'; E.occupe = true; E.sel = null; E.geste = null;
  maj();
  await attendre(400);
  var avant = E.ph;
  await jouer(E.c.tourMonstres(), avant);
  if(E.c.fini()) return finCombat();
  await attendre(250);
  /* un tour où plus aucun héros ne peut jouer (tous entoilés…) : on enchaîne */
  if(!(E.c.aJouer() || []).length) return apres();
  tourHeros();
}

/* les évènements d'une liste, rangés en blocs : un bloc = ce qui arrive à UNE bête (ou un moment du système) */
var COTE_HEROS = {degats:1, tombe:1, releve:1, soin:1, pare:1, etat:1, passe:1};
function cleDe(ev){
  if(ev.t === 'arrive') return ev.de ? 'b:' + ev.de : 'arrivees';
  /* le geste d'un héros ouvre toujours son propre bloc, même quand il vise une bête : c'est là que le héros s'anime
     (sans cette ligne, le tir, la dague, la potion et la rune étaient rangés avec la bête, et le héros ne bougeait plus) */
  if(GESTES_HEROS[ev.t]) return 's:' + ev.t;
  if(typeof ev.bete === 'string') return 'b:' + ev.bete;
  if(ev.heros && COTE_HEROS[ev.t]) return null;      /* reste dans le bloc en cours (les suites d'une attaque) */
  return 's:' + ev.t;
}
function enBlocs(evs){
  var blocs = [], cur = null;
  evs.forEach(function(ev){
    var k = cleDe(ev);
    if(k === null && cur) { cur.evs.push(ev); return; }
    if(k === null) k = 's:heros';
    if(!cur || cur.cle !== k || k.charAt(0) === 's'){ cur = {cle:k, evs:[]}; blocs.push(cur); }
    cur.evs.push(ev);
  });
  return blocs;
}
function calme(bloc){ return bloc.evs.every(function(e){ return (e.t === 'etat' && e.on === false) || e.t === 'ferme'; }); }
var GESTES_HEROS = {tir:1, dague:1, potion:1, louche:1, herbes:1, rune:1, 'pose-bouclier':1, oeil:1, chatouille:1};

async function jouer(evs, avant){
  if(!evs || !evs.length) return;
  E.avant = avant || E.ph;
  suivre(true);
  var blocs = enBlocs(evs), k = 0, large = false, ctx = {touche:{}};
  while(k < blocs.length){
    var bl = blocs[k];
    try{
      if(bl.cle.charAt(0) === 's' && GESTES_HEROS[bl.evs[0].t]){
        large = await geste(bl.evs[0], evs);
        for(var j = 1; j < bl.evs.length; j++) await un(bl.evs[j], bl, ctx);
        k++;
        /* un geste qui touche toute la salle (le bruit, le nuage, l'éclair) : les bêtes réagissent ensemble, à peine décalées */
        if(large){
          var groupe = [];
          while(k < blocs.length && blocs[k].cle.charAt(0) === 'b'){ groupe.push(blocs[k]); k++; }
          await Promise.all(groupe.map(function(b, n){ return attendre(n * 160).then(function(){ return bloc(b, ctx); }); }));
        }
        continue;
      }
      /* plusieurs bêtes qui se referment ou perdent un état en même temps (la fin du tour) : ensemble */
      if(calme(bl)){
        var cal = [];
        while(k < blocs.length && calme(blocs[k])){ cal.push(blocs[k]); k++; }
        await Promise.all(cal.map(function(b){ return bloc(b, ctx); }));
        continue;
      }
      await bloc(bl, ctx);
    }catch(e){ if(window.console) console.error('évènement', e); }
    k++;
  }
  if(E.gesteEnCours){ var g0 = E.gesteEnCours; E.gesteEnCours = null; await Promise.race([g0, attendre(2500)]); }
  /* les règles font foi : un état qu'un module a posé tout seul sans qu'elles l'annoncent s'enlève */
  try{
    var ph = E.c.etat();
    await Promise.race([Promise.all(ph.betes.map(function(b){ var a = B(b.id); return a && !b.mort ? a.accorder(b.etats, b.ouvert) : null; })), attendre(1500)]);
  }catch(e){}
  suivre(false);
}
async function bloc(bl, ctx){
  var l = bl.evs;
  for(var i = 0; i < l.length; i++){
    var ev = l[i];
    try{
      if(ev.t === 'attaque'){ i = await attaque(l, i, ctx); continue; }
      if(ev.t === 'special' && ev.nom === 'eclosion'){ i = await eclosion(l, i, ctx); continue; }
      if(ev.t === 'arrive'){
        var gr = [ev]; while(i + 1 < l.length && l[i + 1].t === 'arrive'){ gr.push(l[++i]); }
        await arrivees(gr);
        continue;
      }
      if(ev.t === 'degats' && ev.bete && ev.critique && !ev.petit){ i = await critique(l, i, ctx); continue; }
      if(ev.t === 'vise'){ while(i + 1 < l.length && l[i + 1].t === 'vise') i++; E.ph = E.c.etat(); majBadges(); continue; }
      await un(ev, bl, ctx);
    }catch(e){ if(window.console) console.error('évènement ' + ev.t, e); }
  }
}

/* ---------- un évènement simple ---------- */
async function un(ev, bl, ctx){
  var a = ev.bete && typeof ev.bete === 'string' ? B(ev.bete) : null, S = a ? DJ.Betes.SONS[a.module] || {} : {}, p, h = ev.heros;
  switch(ev.t){
    case 'debut': return entreeHeros(ev);
    case 'tour': E.tour = ev.n; var t = q('#tour-nom'); if(t) t.innerHTML = 'Tour ' + ev.n; return;
    case 'passe': Fx.mot(hCx(h), 110, ev.mot, 'refus'); return attendre(450);
    case 'refus': refus(h ? hCx(h) : 480, ev.mot); return;
    case 'fin': return;

    case 'touche':
      if(!a || (ev.critique && !ev.petit)) return;
      ctx.touche[a.id] = 1;
      sonTouche(a, ev);
      return a.touche(ev.coup, a.module === 'roirats' && ev.coup === 'bruit' ? {vers:hPt('alchimiste'), onImpact:function(){ son('morsure'); Fx.tremble(6, 260); }} : null);
    case 'rebond':
      if(!a) return;
      bruit('rebond', {}, ['clic']); if(a.module === 'gardien' || a.module === 'ratcuir') bruit('metal');
      p = a.ancre('haut'); Fx.mot(p.x, Math.max(100, p.y - 6), D.MOTS.rebond, 'refus');
      return a.rebond(ev.coup);
    case 'special': if(!a) return; return special(a, ev, ctx);
    case 'etat':
      if(h) return etatHeros(ev);
      if(!a) return;
      if(ev.nom === 'colere'){                  /* la colère : pas un état du module non plus — une pastille, un rond rouge */
        a.el.classList.toggle('colere', !!ev.on);
        E.ph = E.c.etat(); majBadges();
        return;
      }
      if(ev.nom === 'prepare'){                 /* le coup qui se prépare : pas un état du module, une lueur et une pastille */
        a.el.classList.toggle('prepare', !!ev.on);
        E.ph = E.c.etat(); majBadges();
        if(ev.on){ if(S.cri) bruit(S.cri); return attendre(350); }
        return;
      }
      if(a.rat && ev.on && ev.nom === 'ebloui') bruit('ratLumiere', {enrage:aEtat(a, 'enrage')}, ['couine', 0, 1.3]);
      if(a.rat && ev.on && ev.nom === 'dos') bruit('ratHuile', {cale:1.54, enrage:aEtat(a, 'enrage')}, ['couine', 0, 1.3]);
      if(a.rat && ev.on && ev.nom === 'colle') bruit('ratColle', {enrage:aEtat(a, 'enrage')}, ['splotch']);
      if(ev.on && ev.nom === 'enrage' && a.rat && !ev.deja){ a.etat('enrage', true); return attendre(120); }
      return a.etat(ev.nom, ev.on);
    case 'ouvert':
      if(!a) return;
      bruit('faible'); p = a.ancre('haut'); Fx.mot(p.x - 30, Math.max(100, p.y + 10), '!');
      a.el.classList.add('ouvert');
      return a.ouvert(true);
    case 'ferme': if(!a) return; a.el.classList.remove('ouvert'); return a.ouvert(false);
    case 'colere':                              /* il se fâche : son cri, la salle tremble, le mot au-dessus de lui */
      if(!a) return;
      if(S.cri) bruit(S.cri);
      Fx.tremble(11, 460);
      p = a.ancre('haut'); Fx.mot(p.x, Math.max(104, p.y - 4), D.MOTS.colere, 'refus');
      return attendre(900);
    case 'prepare':                             /* son tour d'élan : il ne frappe pas, et tout le monde voit ce qui arrive */
      if(!a) return;
      if(S.cri) bruit(S.cri);
      p = a.ancre('haut'); Fx.mot(p.x, Math.max(104, p.y - 4), D.MOTS.prepare, 'refus long');
      E.ph = E.c.etat(); majBadges();
      return attendre(900);
    case 'degats':
      if(h) return degatsHeros(ev, null);
      if(!a) return;
      p = a.cible(!!(photoAvant(a.id) || {}).ouvert);
      Fx.chiffre(p.x, Math.max(96, a.ancre('haut').y + 6), '−' + ev.n, ev.n >= 25 ? 'gros' : ev.n <= 2 ? 'petit' : '');
      /* le petit critique d'une flèche sur une bête qui marche par terre : on le dit, pour qu'on comprenne le chiffre */
      if(ev.petit) Fx.mot(p.x, Math.max(104, a.ancre('haut').y - 22), D.MOTS.petitCritique, 'refus long');
      barre(a.id, ev.pv, a.pvMax); a.pv = ev.pv;
      return attendre(160);
    case 'gagne':
      if(!a) return;
      a.pvMax = ev.pvMax; a.pv = ev.pv; barre(a.id, ev.pv, ev.pvMax);
      p = a.ancre('haut'); Fx.chiffre(p.x, Math.max(96, p.y + 6), '+' + ev.n, 'gros');
      return attendre(300);
    case 'mot':
      if(!a) return;
      p = a.ancre('haut'); Fx.mot(p.x, Math.max(104, p.y - 4), ev.texte, 'refus' + (ev.texte.length > 12 ? ' long' : ''));
      return attendre(500);
    case 'mort': if(!a) return; return mort(a, ev);
    case 'brulure':
      if(!a) return;
      son('brule'); if(a.rat) son('couine', .05, 1.1, 1, aEtat(a, 'enrage'));
      p = a.ancre('centre');
      Fx.eclat(p.x, p.y - 10, 150, 'radial-gradient(closest-side,rgba(255,170,60,.85),rgba(255,90,20,0))', 600);
      Fx.chiffre(p.x, Math.max(96, a.ancre('haut').y + 6), '−' + ev.n + ' 🔥', 'feu');
      barre(a.id, ev.pv, a.pvMax); a.pv = ev.pv;
      await (a.rat ? a.touche('feu') : a.touche(/^(ratcuir|araignee|petitearaignee|roirats|gardien)$/.test(a.module) ? 'brulure' : 'feu'));
      return attendre(250);
    case 'saute':
      if(!a) return;
      p = a.ancre('haut');
      Fx.mot(p.x, Math.max(104, p.y), ({colle:'rhââ !', gele:'brrr…', tournis:'💫', noeud:'gniii !', dos:'…', sous:'glou…'})[ev.nom] || '…', 'croc');
      if(a.rat) son('couine', 0, .9, 1.4, aEtat(a, 'enrage'));
      return attendre(750);
    case 'soin': return soin(ev);
    case 'tombe': return tomber(h);
    case 'releve': return relever(ev);
    case 'pare': Fx.bulleTexte(hCx(h), 296, '🛡️ ' + (ev.quoi === 'toile' ? 'La toile glisse !' : 'La langue glisse !'), 'bleu'); son('absorbe'); return attendre(350);
    case 'avale': return avale(ev);
    case 'recrache': return recrache(ev);
  }
}
function photoAvant(id){ var l = E.avant ? E.avant.betes : []; for(var k = 0; k < l.length; k++) if(l[k].id === id) return l[k]; return null; }
function aEtat(a, nom){ var b = photoB(a.id); return !!(b && b.etats && b.etats[nom]); }
function sonTouche(a, ev){
  var S = DJ.Betes.SONS[a.module] || {}, c = ev.coup;
  if(a.rat){
    var enr = aEtat(a, 'enrage');
    if(c === 'fleche' || c === 'fleche-argent' || c === 'fleche-lourde') bruit('ratFleche', {dt:.02, enrage:enr}, ['impact', .8]);
    else if(c === 'dague') bruit('ratDague', {dt:.02, enrage:enr}, ['impact', .8]);
    else if(c === 'feu') bruit('ratFeu', {enrage:enr}, ['feu', 1.4]);
    else if(c === 'nuage') bruit('ratNuage', {enrage:enr});
    return;
  }
  if(c === 'bruit' || c === 'louche') return;      /* le BONG a déjà sonné */
  if(S.touche) bruit(S.touche, {}, ['impact', .8]);
  if(ev.piege && S.cri) bruit(S.cri, {dt:.25});
}
function special(a, ev, ctx){
  var S = DJ.Betes.SONS[a.module] || {}, o = {};
  if(S.tinte) o.onTinte = function(){ bruit(S.tinte, {}, ['clic']); Fx.tremble(3, 160); };
  if(a.module === 'gardien') o.onTinte = function(){ bruit('metal', {}, ['clic']); Fx.tremble(5, 220); };
  if(a.module === 'bourbe'){
    if(ev.nom === 'plonger') bruit(S.plonge);
    if(ev.nom === 'remonter') bruit(S.plonge, {dt:.1});
    if(ev.nom === 'chatouille') bruit(S.rire);
    if(ev.nom === 'recrache') bruit(S.rot);
  }
  return a.special(ev.nom, o, !!ctx.touche[a.id]);
}

/* ---------- l'entrée ---------- */
async function entreeHeros(ev){
  ev.betes.forEach(function(b, k){ b._debut = true; b._rang = k; });
  E.debut = ev;
  ORDRE.forEach(function(h){ (ev.heros[h].objets || []).forEach(function(o){ var n = D.OBJETS[o] && D.OBJETS[o].equipe; try{ if(n && E.A.h[h].equiper) E.A.h[h].equiper(n, true, {discret:true}); }catch(x){} }); });
  E.ph = E.c.etat(); majBarres();
  await attendre(450);
  son('pasHeros', 1.7, 3);
  await Promise.all(EXPOSES.map(function(h, k){
    return attendre(k * 230).then(function(){ slotH(h).style.visibility = 'visible'; return E.A.h[h].entrer(HER[h].x + 260); }).then(function(){ return E.A.h[h].attendre(); });
  }));
  await attendre(250);
}
async function arrivees(gr){
  var debut = gr[0].par === 'debut';
  if(debut){ son('pasRats', 1.5); }
  var faits = gr.map(function(ev){
    var b = ev.bete, deb = (E.debut ? E.debut.betes : []).filter(function(x){ return x.id === b.id; })[0];
    if(deb){ b._debut = true; b._rang = deb._rang; }
    return creerBete(b, ev._x);
  });
  await Promise.all(faits.map(function(a, k){
    return attendre(k * (debut ? 210 : 120)).then(function(){
      var S = DJ.Betes.SONS[a.module] || {};
      if(a.rat) son('couine', .3, 1 + k * .12); else if(S.entree) bruit(S.entree); else if(S.cri) bruit(S.cri, {dt:.3});
      var o = {};
      if(a.module === 'gardien') o.onPas = function(){ bruit(S.pas, {}, ['tombe']); Fx.tremble(7, 300); };
      return a.entrer(gr[k].par, o);
    });
  }));
  E.ph = E.c.etat(); majBarres(); placerTout();
  await attendre(debut ? 250 : 150);
}
/* l'araignée : son cocon brûle, deux œufs tombent ; les petites sortent des œufs, devant */
async function eclosion(l, i, ctx){
  var a = B(l[i].bete), suite = [], j = i + 1;
  while(j < l.length && l[j].t === 'arrive'){ suite.push(l[j]); j++; }
  var places = suite.map(function(ev){ var x = DJ.Betes.place(E.salle, ev.bete, null, E.prises.concat(suite.map(function(s){ return s._x; }).filter(function(v){ return v != null; }))); ev._x = x; return x; });
  var I = DJ.Betes.info('petitearaignee'), vers = places.map(function(x){ return {x:x + I.cadre.w * I.oeuf[0], y:DJ.Betes.SOL - I.cadre.h * I.sol + I.cadre.h * I.oeuf[1]}; });
  if(a){
    bruit((DJ.Betes.SONS.araignee || {}).cri);
    try{ await Promise.resolve(a.acteur.special('eclosion', {scene:fx, vers:vers.map(DJ.versEcran)})).catch(function(){}); }catch(e){}
  }
  if(suite.length) await arrivees(suite);
  return j - 1;
}

/* ---------- les gestes des héros ---------- */
function milieuBetes(){
  var l = E.ordre.map(B).filter(function(a){ return a && !a.mort; });
  if(!l.length) return {x:720, y:230};
  var x = 0, y = 0; l.forEach(function(a){ var c = a.ancre('centre'); x += c.x; y += c.y; });
  return {x:x / l.length, y:y / l.length};
}
var NOMS_POTION = {givre:1, acide:1, huile:1, colle:1};
var SON_POTION = {givre:'potGivre', acide:'potAcide', huile:'potHuile', colle:'potColle'};
/* rend true si le geste touche toute la salle (les bêtes réagissent alors ensemble) */
async function geste(ev, evs){
  var H = E.A.h, a = ev.bete ? B(ev.bete) : null, avant = a ? photoAvant(a.id) : null, to, coul, R;
  switch(ev.t){
    case 'tir':
      to = a.cible(avant && avant.ouvert);
      if(ev.fleche === 'lourde' && (a.module === 'gardien' || a.module === 'ratcuir')) to.metal = true;
      bruit('arc', {cale:LACHER}, ['arc']); bruit('vol', {dt:LACHER});
      if(ev.fleche === 'argent') bruit('flecheArgent', {dt:LACHER}); if(ev.fleche === 'lourde') bruit('flecheLourde', {dt:LACHER});
      await H.pisteur.tirer(fx, to, ev.fleche, {rebond:!!ev.rebond, sol:DJ.Betes.SOL + 6});
      if(ev.defaut === 'traverse'){ /* la flèche transperçante passe à travers la bête de brume : aucun choc */ }
      else if(ev.rebond) bruit(a.module === 'gardien' || a.module === 'ratcuir' ? 'metal' : 'bois'); else bruit('chairF');
      R = D.RECETTES[ev.fleche];
      if(R && !ev.rebond){ son('verre'); Fx.eclabousse(to.x, to.y, R.coul, true); if(SON_POTION[ev.fleche]) bruit(SON_POTION[ev.fleche]); }
      return false;
    case 'dague':
      to = a.cible(avant && avant.ouvert);
      bruit('swish', {cale:LAME}, ['dague']);
      await H.pisteur.dague(fx, {x:Math.max(hCx('pisteur') + 90, a.ancre('centre').x - Math.min(70, a.cadre.w * .3)), y:to.y});
      bruit('chairD');
      return false;
    case 'potion':
      R = D.RECETTES[ev.recette]; coul = NOMS_POTION[ev.recette] ? ev.recette : R.coul;
      to = ev.salle ? milieuBetes() : ev.equipe ? {x:hCx('alchimiste') + 6, y:150} : ev.heros2 ? hPt(ev.heros2) : a ? a.cible(avant && avant.ouvert) : milieuBetes();
      son('bulles', .5);
      await H.alchimiste.preparer(coul);
      son('vole', .5);
      await H.alchimiste.lancer(fx, to, coul);
      son('verre'); if(SON_POTION[ev.recette]) bruit(SON_POTION[ev.recette]);
      Fx.eclabousse(to.x, to.y, R.coul);
      if(ev.salle){ var n = Fx.nuage(to.x, to.y); son('vole', .9); await n.plein; await attendre(250); return true; }
      return false;
    case 'louche':
      to = a ? a.ancre('centre') : milieuBetes();
      var g = H.alchimiste.louche(fx, to);
      await attendre(600);
      if(a && a.rat) bruit('ratLouche', {}, ['bong']); else son('bong');
      for(var k = 0; k < 2; k++) (function(k){ setTimeout(function(){ Fx.onde(to.x, to.y, '#fff1b8', 260, 800); }, 150 + k * 160); })(k);
      Fx.tremble(9, 380);
      E.gesteEnCours = Promise.resolve(g).catch(function(){});
      await attendre(250);
      return true;
    case 'herbes':
      await H.alchimiste.herbes(fx, hPt(ev.heros2));
      return false;
    case 'rune':
      son('magie');
      if(ev.salle){
        var pts = E.ordre.map(B).filter(function(x){ return x && !x.mort; }).map(function(x){ return x.ancre('centre'); });
        bruit('cristal');
        if(H.sage.eclairSalle) await H.sage.eclairSalle(fx, {cibles:pts}); else await H.sage.sort(fx, pts[0] || milieuBetes());
        son('magie', .05);
        return true;
      }
      to = a.ancre('centre');
      await H.sage.sort(fx, to, {cristal:false});
      Fx.eclat(to.x, to.y, 260, 'radial-gradient(closest-side,#fff,rgba(191,248,255,.9) 30%,rgba(63,208,255,.4) 60%,rgba(63,208,255,0))', 600);
      Fx.etincelles(to.x, to.y, 14, ['#ffffff', '#bff8ff', '#8ff3ff']);
      son('magie', .05);
      return false;
    case 'pose-bouclier':
      son('dome'); if(ev.cibles.length > 1) bruit('baton');
      var conts = ev.cibles.map(function(h){ return q('.acteur', slotH(h)); });
      var d = await H.sage.bouclier(fx, conts.length > 1 ? conts : conts[0]);
      ev.cibles.forEach(function(h, k){ E.domes[h] = Array.isArray(d) ? d[k] : d; });
      await attendre(450);
      return false;
    case 'oeil':
      /* le Sage ouvre son livre, un grand œil s'ouvre entre les héros et les monstres, puis les proies apparaissent */
      to = {x:(hCx('pisteur') + milieuBetes().x) / 2, y:150};
      son('magie');
      var oe = el('div', 'oeil-rune', '👁️'); oe.style.left = to.x + 'px'; oe.style.top = to.y + 'px'; fx.appendChild(oe);
      setTimeout(function(){ oe.remove(); }, 1150);
      await Promise.race([Promise.resolve(H.sage.etudier()).catch(function(){}), attendre(950)]);
      Fx.onde(to.x, to.y, '#bff8ff', 320, 700);
      son('magie', .05);
      E.ph = E.c.etat(); majBadges();
      await attendre(450);
      return false;
    case 'chatouille':
      Fx.mot(a ? a.ancre('centre').x : 700, a ? a.ancre('centre').y - 40 : 200, 'guili-guili !', 'croc');
      await attendre(500);
      return false;
  }
  return false;
}
/* ---------- le critique : localisé autour de la bête (Romain, 9 novembre, 16 h 37) ---------- */
/* dt : dans combien de secondes (programmé d'avance sur l'horloge du son, pour rester calé sur l'image) */
function sonCritique(nom, dt){
  var plusTard = function(n){ setTimeout(function(){ son(n); }, (dt || 0) * 1000); };
  if(nom === 'aspire'){ if(!bruit('ratCritique', {partie:'avant', dt:dt})) plusTard('aspire'); return; }
  if(nom === 'boum'){ if(!bruit('ratCritique', {partie:'impact', dt:dt})) plusTard('boum'); return; }
  if(nom === 'explosion'){ bruit('ratCritique', {partie:'explosion', dt:dt}); return; }
}
async function critique(l, i, ctx){
  var ev = l[i], a = B(ev.bete), meurt = l[i + 1] && l[i + 1].t === 'mort' && l[i + 1].bete === ev.bete && l[i + 1].mode === 'explose';
  if(!a) return i;
  var c = a.cible(true);
  barre(a.id, ev.pv, a.pvMax); a.pv = ev.pv;
  if(meurt && a.rat){
    /* le rat : son module fait tout autour de lui (temps suspendu, fumée noire, morceaux, cendres) */
    retirerHud(a.id); liberer(a);
    if(DJ.plantages() >= 2){
      /* la page s'est déjà fermée DEUX fois en plein critique sur cet appareil : le critique le plus simple possible
         (le gros texte, le chiffre, des étincelles), pour qu'on puisse au moins continuer à jouer */
      sonCritique('boum'); Fx.tremble(7, 300);
      if(Fx.texteCritique) Fx.texteCritique(c.x, c.y);
      Fx.chiffre(c.x + 6, c.y + 40, '−' + ev.n, 'crit'); Fx.etincelles(c.x, c.y, 14);
      a.el.style.visibility = 'hidden'; a.mort = true;
      await attendre(1200);
      return i + 1;
    }
    /* le témoin : il dit si la page s'est fermée en plein critique (lu au redémarrage, affiché en bas de « Objets ») ;
       et on compte les images en retard : si le critique rame sur cet appareil, les suivants sont allégés */
    var vt = SALLE.vitesse || 1, tm = [setTimeout(function(){ DJ.temoinCritique('explosion'); }, 1020 / vt)];
    DJ.temoinCritique('debut');
    var mesure = DJ.mesurerCritique();
    await Fx.critique(c.x, c.y, ev.n, function(o){ return a.exploser(fx, o); }, sonCritique, {});
    mesure.fin();
    tm.forEach(clearTimeout); DJ.temoinCritique(false);
    return i + 1;
  }
  sonCritique('aspire');
  if(meurt){
    retirerHud(a.id); liberer(a);
    DJ.temoinCritique('bete');
    var p = a.acteur.exploser(fx), boom = p && p.boom ? Promise.resolve(p.boom) : attendre(420);
    a.mort = true;
    await Promise.race([boom, attendre(1400)]);
    sonCritique('boum'); Fx.tremble(7, 300);
    if(Fx.texteCritique) Fx.texteCritique(c.x, c.y);
    Fx.chiffre(c.x + 6, c.y + 40, '−' + ev.n, 'crit');
    setTimeout(function(){ sonCritique('explosion'); Fx.tremble(5, 240); }, 600 / (SALLE.vitesse || 1));
    await Promise.race([Promise.resolve(p).catch(function(){}), attendre(4200)]);
    DJ.temoinCritique(false);
    a.el.classList.add('restes');
    return i + 1;
  }
  /* un critique qui ne tue pas (un élite, le boss) : le même gros « CRITIQUE ! », et la bête encaisse */
  await attendre(260);
  sonCritique('boum'); Fx.tremble(8, 320);
  if(Fx.texteCritique) Fx.texteCritique(c.x, c.y);
  Fx.chiffre(c.x + 6, c.y + 40, '−' + ev.n, 'crit');
  Fx.etincelles(c.x, c.y, 16);
  var S = DJ.Betes.SONS[a.module] || {}; if(S.touche) bruit(S.touche, {dt:.05});
  await a.touche(ev.cause && /^(fleche|dague)/.test(ev.cause) ? ev.cause : 'dague');
  await attendre(350);
  return i;
}
async function mort(a, ev){
  var S = DJ.Betes.SONS[a.module] || {};
  retirerHud(a.id); liberer(a);
  if(a.rat){ bruit('ratFuite', {dt:.45}, ['fuiteRat']); return a.fuir(); }
  if(S.mort) bruit(S.mort);
  if(ev.mode === 'explose'){ sonCritique('boum'); return a.exploser(fx); }
  if(ev.mode === 'meurt') return a.mourir();
  return a.fuir();
}

/* ---------- l'attaque d'une bête : les coups tombent sur les héros aux moments d'impact ---------- */
async function attaque(l, i, ctx){
  var ev = l[i], a = B(ev.bete), j = i + 1, coups = [], cur = null, apres = [], nomA = ev.anim || ev.nom;
  /* ce qui suit l'attaque et concerne les héros : un groupe par coup (un groupe commence à chaque « degats » ou « pare ») */
  while(j < l.length){
    var s = l[j];
    if(s.heros && !s.bete || (s.heros && (s.t === 'degats' || s.t === 'pare' || s.t === 'avale'))){
      if(s.t === 'degats' || s.t === 'pare' || !cur){ cur = [s]; coups.push(cur); } else cur.push(s);
      j++; continue;
    }
    break;
  }
  if(!a){ for(var z = 0; z < coups.length; z++) for(var y = 0; y < coups[z].length; y++) await un(coups[z][y], null, ctx); return j - 1; }
  var S = DJ.Betes.SONS[a.module] || {}, bloc = q('#badges-' + a.id + ' .vise-bloc');
  if(bloc) bloc.classList.add('mord');
  if(ev.riposte){
    /* un piège en plein tour des héros (la charge du Roi des rats) : le module l'a déjà lancée dans touche() */
    for(var r = 0; r < coups.length; r++) await coup(coups[r], a, ev);
    return j - 1;
  }
  if(a.rat) son('couine', 0, aEtat(a, 'enrage') ? 1 : 1.1, aEtat(a, 'enrage') ? 1.3 : 1, aEtat(a, 'enrage'));
  else if(S.att && S.att[nomA]) bruit(S.att[nomA]); else if(S.cri) bruit(S.cri);
  var joues = 0, attente = [], avale = null;
  coups.forEach(function(g){ g.forEach(function(x){ if(x.t === 'avale') avale = x; }); });
  var vers = ev.cibles.map(function(h){ return hPt(h); });
  if(nomA === 'toile' || nomA === 'langue') vers = [{x:hCx(ev.cibles[0]) + 4, y:214}];
  var nImpacts = a.rat ? (ev.fois || 1) : (nomA === 'brulure' || nomA === 'grouillement' || (nomA === 'pique' && ev.fois > 1)) ? Math.max(1, coups.length) : 1;
  function impact(n){
    /* au dernier impact prévu, tout ce qui reste tombe d'un coup (le saut de Bourbe touche tout le monde en même temps) */
    var jusqu = n >= nImpacts - 1 ? coups.length : Math.min(coups.length, joues + 1);
    if(ev.gros && joues < jusqu) Fx.tremble(13, 480);          /* le coup préparé : la salle en tremble */
    while(joues < jusqu){ attente.push(coup(coups[joues], a, ev)); joues++; }
  }
  var ret = await a.attaquer(nomA, {vers:vers, fois:ev.fois || 1, onImpact:impact, onAvale:function(){ if(avale) bruit(S.gobe); }});
  impact(nImpacts - 1);                      /* par sécurité : tout ce qui n'aurait pas été joué */
  await Promise.all(attente);
  if(bloc) bloc.classList.remove('mord');
  if(nomA === 'toile' && typeof ret === 'function'){
    /* la toile reste sur le héros tant qu'il est entoilé ; arrêtée par un bouclier, elle glisse et s'en va */
    var h0 = ev.cibles[0], prise = coups.some(function(g){ return g.some(function(x){ return x.t === 'etat' && x.nom === 'entoile' && x.on; }); });
    if(prise) E.toiles[h0] = ret; else { try{ ret(); }catch(e){} }
  }
  await attendre(coups.some(function(g){ return g.some(function(x){ return x.t === 'tombe'; }); }) ? 600 : 250);
  return j - 1;
}
/* un coup reçu par un héros : le chiffre, la barre, sa réaction, et ce qui suit (il tombe, il est entoilé, avalé…) */
async function coup(groupe, a, att){
  for(var k = 0; k < groupe.length; k++){
    var ev = groupe[k];
    if(ev.t === 'degats') await degatsHeros(ev, groupe[k + 1] && groupe[k + 1].t === 'tombe' ? groupe[k + 1] : null, a, k);
    else if(ev.t === 'tombe'){ /* déjà joué avec les dégâts */ }
    else await un(ev, null, {touche:{}});
  }
}
async function degatsHeros(ev, tombe, a, rang){
  var h = ev.heros, s = E.ph.heros[h];
  if(a && a.rat){ son('machoire'); son('morsure'); Fx.mot(hCx(h) + 30, 170, 'CROC !', 'croc'); }
  else if(ev.attaque) son('morsure');
  Fx.chiffre(hCx(h), 140 - ((rang || 0) % 3) * 8, '−' + ev.n, ev.bouclier ? 'bleu' : ev.n >= 30 ? 'gros' : '');
  barre(h, ev.pv, s.pvMax);
  if(ev.bouclier && E.domes[h]){ son('absorbe'); try{ E.domes[h].absorber(ev.absorbe); }catch(e){} Fx.bulleTexte(hCx(h), 296, '🛡️ ' + ev.brut + ' → ' + ev.n + ' <small>(' + ev.absorbe + ' absorbés)</small>', 'bleu'); }
  if(ev.cause === 'dalles' || ev.cause === 'os') return;
  var att = animDe(ev.attaque), type = att === 'brulure' ? 'froid' : att === 'grouillement' || att === 'charge' ? 'grouillement' : att === 'poing' ? 'poing' : undefined;
  if(tombe){ slotH(h).classList.add('sol'); son('tombe'); return Promise.resolve(E.A.h[h].tomber()).catch(function(){}); }
  if(ev.attaque === 'langue') return;                    /* il est happé : pas de réaction, la suite (avale) s'en charge */
  return Promise.resolve(E.A.h[h].touche(type)).catch(function(){});
}
function tomber(h){ slotH(h).classList.add('sol'); son('tombe'); return Promise.resolve(E.A.h[h].tomber()).catch(function(){}); }
async function relever(ev){
  var h = ev.heros, A = E.A.h[h];
  slotH(h).classList.remove('sol');
  if(ev.par === 'amulette'){ bruit('amulette', {}, ['coeur']); } else son('coeur');
  for(var k = 0; k < 7; k++) (function(k){
    var e = el('div', 'etincelle', ev.par === 'amulette' ? '✨' : '💖');
    e.style.left = (hCx(h) - 60 + k * 20) + 'px'; e.style.top = (240 - (k % 3) * 24) + 'px'; e.style.animationDelay = (k * 60) + 'ms';
    fx.appendChild(e); setTimeout(function(){ e.remove(); }, 1200);
  })(k);
  Fx.chiffre(hCx(h), 170, '+' + ev.pv, 'soin');
  barre(h, ev.pv, E.ph.heros[h].pvMax);
  await Promise.resolve(A.relever(ev.par === 'amulette' ? {amulette:true} : undefined)).catch(function(){});
  try{ A.attendre(); }catch(e){}
  return attendre(300);
}
async function soin(ev){
  var h = ev.heros, x = hCx(h), y = 200;
  son('soin');
  for(var k = 0; k < 7; k++) (function(k){
    var e = el('div', 'etincelle', ev.par === 'herbes' ? '🌿' : '✨');
    e.style.left = (x - 60 + k * 20) + 'px'; e.style.top = (y + 40 - (k % 3) * 24) + 'px'; e.style.animationDelay = (k * 60) + 'ms';
    fx.appendChild(e); setTimeout(function(){ e.remove(); }, 1200);
  })(k);
  Fx.chiffre(x, y - 30, '+' + ev.n, 'soin');
  barre(h, ev.pv, E.ph.heros[h].pvMax);
  return attendre(ev.par === 'baumelum' ? 180 : 600);
}
async function etatHeros(ev){
  var h = ev.heros, A = E.A.h[h];
  if(ev.nom === 'bouclier'){
    if(!ev.on && E.domes[h]){ var d = E.domes[h]; delete E.domes[h]; try{ await Promise.resolve(d.retirer()); }catch(e){} }
    return;
  }
  if(ev.nom === 'entoile'){
    if(ev.on){ bruit((DJ.Betes.SONS.araignee || {}).att.toile, {dt:.05}); }
    else if(E.toiles[h]){ try{ E.toiles[h](); }catch(e){} delete E.toiles[h]; }
    try{ if(A.entoile) await Promise.resolve(A.entoile(!!ev.on)); }catch(e){}
    if(!ev.on) E.ordre.forEach(function(id){ var a = B(id); if(a && a.module === 'araignee' && a.acteur.retirerToile && !Object.keys(E.toiles).length){ try{ a.acteur.retirerToile(); }catch(e){} } });
  }
}
async function avale(ev){
  var h = ev.heros, a = B(ev.bete);
  try{ if(E.A.h[h].avale) await Promise.resolve(E.A.h[h].avale()); }catch(e){}
  slotH(h).classList.add('avale');
  if(a) a.etat('avale', true);
  return attendre(300);
}
async function recrache(ev){
  var h = ev.heros, a = B(ev.bete), dep = a ? a.ancre('bouche') : {x:640, y:220};
  slotH(h).classList.remove('avale');
  if(a) a.etat('avale', false);
  try{ if(E.A.h[h].recrache) await Promise.resolve(E.A.h[h].recrache(fx, dep)); }catch(e){}
  try{ E.A.h[h].attendre(); }catch(e){}
  return attendre(200);
}

/* ====================================================================== 7. LA FIN : victoire, fuite, défaite */
function nettoyer(){
  E.fini = true; suivi++;
  try{ if(E.ambiance && E.ambiance.arreter) E.ambiance.arreter(); }catch(e){}
  Object.keys(E.A.b).forEach(function(id){ E.A.b[id].arreter(); });
  ORDRE.forEach(function(h){ try{ if(E.A.h[h].arreter) E.A.h[h].arreter(); }catch(e){} });
}
async function finCombat(){
  var res = E.c.fini();
  E.mode = 'fin'; E.occupe = true; E.ph = E.c.etat();
  majBarres(); majScene(); bande(); suivre(false);
  DJ.garder(E.partie);
  if(res === 'victoire') return victoire();
  return fuite(true);
}
async function victoire(){
  var n = E.c.etat().tour, tours = n + ' tour' + (n > 1 ? 's' : '');
  /* les grosses salles (le Gardien, le Roi des rats, Bourbe) durent plus longtemps : on ne dit pas « c'était long » pour 7 tours */
  var CB = D.COMBATS[E.salle] || {}, gros = CB.elite || CB.boss, vite = gros ? 5 : 3, bien = gros ? 9 : 6;
  var t = n <= vite ? 'En ' + tours + ' seulement ! Les murs du donjon vont parler de vous.' : n <= bien ? 'En ' + tours + ' : du beau travail d\'équipe !' : 'En ' + tours + '… C\'était long, mais la salle est propre !';
  var titre = CB.boss ? 'Bourbe est battu !' : 'La salle est à vous !';
  if(CB.boss) t = 'En ' + tours + ' ! Le gros crapaud du puits ne fera plus peur à personne.';
  var fan = bruit('victoire', {}, ['fanfare']);
  if(Son.baisser) Son.baisser((fan && fan.duree || 3) + .2);
  var ce = E;                       /* (si on a déjà quitté l'écran de victoire, la carte a mis sa musique : on n'y touche pas) */
  setTimeout(function(){ DJ.musiqueApresCombat(ce.salle, E !== ce); }, 2200);
  await Promise.all(ORDRE.filter(function(h){ return !E.ph.heros[h].sol; }).map(function(h, k){ return attendre(k * 120).then(function(){ return E.A.h[h].joie(); }); }));
  await attendre(300);
  var f = el('div'); f.id = 'fin';
  f.innerHTML = '<div class="voile"></div><div class="victoire"><div class="rayons"></div>' +
    '<h1>' + titre + DJ.lireBtn(titre) + '</h1>' +
    '<div class="bulle"><span class="txt">' + t + '</span>' + DJ.lireBtn(t) + '</div>' +
    '<div class="bilan"><div><b>' + n + '</b>tour' + (n > 1 ? 's' : '') + '</div></div>' +
    '<button class="aller guide" data-act="combat-fin">Continuer ➜</button></div>';
  q('#combat').appendChild(f);
  E.resultat = 'victoire';
}
function demanderFuite(){
  if(!E || E.occupe || E.fini) return;
  var t = 'On repart de la dernière page de sauvegarde. Les monstres battus depuis reviendront, en pleine forme. Mais tout ce que vous avez trouvé reste à vous.';
  DJ.fenetre('<h2>Fuir la salle ?</h2><div class="ligne">' + t + DJ.lireBtn(t) + '</div>' +
    '<div class="boutons"><button class="sombre" data-act="fermer">Non, on reste</button><button class="aller" data-act="fuir">Oui, on fuit !</button></div>');
}
async function fuite(auto){
  E.mode = 'fin'; E.occupe = true;
  DJ.fermer();
  bande(); majScene();
  if(auto){
    /* les trois héros sont au sol, sonnés (pas morts) : ils se relèvent difficilement, l'un après l'autre, en titubant
       (Romain, 10 novembre), puis ils crient « Fuite ! » et détalent */
    await attendre(1100);
    await Promise.all(ORDRE.map(function(h, k){
      var A = E.A.h[h]; slotH(h).classList.remove('sol', 'avale');
      if(!A.ko) return attendre(k * 280);
      return Promise.resolve(A.relever({sonne:true, retard:k * 280})).catch(function(){});
    }));
    await attendre(350);
  }
  ORDRE.forEach(function(h, k){ setTimeout(function(){ slotH(h).classList.add('crie'); }, k * 120); });
  await attendre(auto ? 1000 : 800);
  var fu = bruit('fuite', {}, ['pasHeros', 1, 3]);
  if(Son.baisser) Son.baisser((fu && fu.duree || 3) + .2);
  ORDRE.forEach(function(h, k){ setTimeout(function(){ try{ E.A.h[h]._etoiles(false); }catch(e){} slotH(h).classList.add('detale'); }, k * 90); });
  await attendre(1200);
  var ev = Regles.fuir(E.partie, E.salle);
  DJ.garder(E.partie);
  DJ.musiqueApresCombat(E.salle);
  E.resultat = auto ? 'defaite' : 'fuite';
  pointFuite(ev, auto);
}
/* « On fait le point » : où l'on repart, et c'est tout (Romain, 10 novembre : plus de Grand Livre ni de sac ici — l'écran
   débordait quand le Grand Livre était rempli, et on ne pouvait plus atteindre le bouton). */
function pointFuite(ev, auto){
  var nomLieu = '';
  (ev || []).forEach(function(x){ if(x.t === 'recharge'){ var L = D.LIEUX[x.lieu]; nomLieu = L ? L.nom : x.lieu; } });
  var rv = 'Retour ' + (nomLieu ? 'à la dernière sauvegarde : ' + nomLieu : 'à la dernière sauvegarde') + '. Les monstres battus depuis sont revenus. Vos trouvailles, elles, sont toujours là.';
  var conte = auto ? 'Les trois héros étaient sonnés… Ils ont filé juste à temps. Et si on essayait autrement ?' : 'Vous en savez plus qu\'avant. Et si on essayait autrement ?';
  var f = el('div'); f.id = 'fin';
  f.innerHTML = '<div class="voile" style="background:rgba(5,3,10,.9)"></div><div class="point court"><h1>On fait le point' + DJ.lireBtn('On fait le point.') + '</h1>' +
    '<div class="case retour"><h3>🚪 On repart</h3><div class="rats-l"><span>' + rv + '</span>' + DJ.lireBtn(rv) + '</div></div>' +
    '<div class="bulle"><span class="txt">' + conte + '</span>' + DJ.lireBtn(conte) + '</div>' +
    '<div class="bas"><button class="aller guide" data-act="combat-fin">Continuer ➜</button></div></div>';
  q('#combat').appendChild(f);
}
function terminer(){
  if(!E) return;
  var r = E.resultat || 'fuite', fin = E.finir;
  nettoyer(); DJ.taire(); DJ.fermer();
  E = null;
  fin(r);
}

/* (8. Le journal du donjon a disparu le 11 novembre : plus d'étude en combat. Le carnet de l'aventurier, ramassé à l'entrée,
   donne toutes les pages au Sage, sur sa tablette.) */

/* ====================================================================== 9. LES DOIGTS */
DJ.toucher(function(a, id, b){
  if(!E) return false;
  if(a === 'fuite'){ demanderFuite(); return true; }
  if(a === 'fuir'){ if(!E.fini && !E.occupe){ fuite(false); } return true; }
  if(a === 'combat-fin'){ terminer(); return true; }
  if(E.occupe || DJ.fenetreOuverte()) return a === 'heros' || a === 'geste' || a === 'retour' || a === 'perso';
  if(a === 'heros'){ choisirHeros(id); return true; }
  if(a === 'geste'){ choisirGeste(id); return true; }
  if(a === 'retour'){ retour(); return true; }
  if(a === 'perso'){ toucherPerso(b.getAttribute('data-type'), id); return true; }
  return false;
});

DJ.Combat = {
  preparer:preparer, lancer:lancer, cuireHeros:cuireHeros,
  etat:function(){ return E ? {mode:E.mode, occupe:E.occupe, tour:E.tour, sel:E.sel, geste:E.geste ? E.geste.geste : null, photo:E.ph, resultat:E.resultat || null, fini:E.fini} : null; },
  /* pour les tests : le combat des règles, les adaptateurs */
  _E:function(){ return E; }
};
})();
