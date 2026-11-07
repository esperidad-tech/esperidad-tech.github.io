/* ==========================================================
   Brumeval v2 — mini-jeux du Barde et du Sage
   mensonge, ordre, ragots (Barde) · alphabet, plans, grille, runes (Sage)
   S'enregistrent dans MJ (voir mj-core.js et ARCHI.md).
   ========================================================== */
(function(){
'use strict';
if(!window.MJ || !MJ.enregistrer){ if(window.console) console.error('mj-barde-sage : mj-core.js doit être chargé avant.'); return; }
var U = MJ.util;
var compteur = 0;

/* ---------- Outils ---------- */
function esc(s){ return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function plage(n){ var a = []; for(var i = 0; i < n; i++) a.push(i); return a; }
function minuteurs(){
  var ids = [], stops = [];
  return {
    t: function(fn, ms){ var id = setTimeout(fn, ms); ids.push(id); return id; },
    i: function(fn, ms){ var id = setInterval(fn, ms); ids.push(id); return id; },
    s: function(f){ stops.push(f); return f; },
    tout: function(){ ids.forEach(function(id){ clearTimeout(id); clearInterval(id); }); ids = []; stops.forEach(function(f){ try{ f(); }catch(e){} }); stops = []; }
  };
}
function lireBtn(t, cls){ return '<button type="button" class="mjb-lire ' + (cls || '') + '" data-lire="' + esc(t) + '" aria-label="Écouter">🔊</button>'; }
function brancherLire(root){
  root.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-lire]');
    if(b && root.contains(b)){ e.stopPropagation(); U.son('clic'); U.lire(b.getAttribute('data-lire')); }
  });
}
/* la règle des cœurs (mj-core.js) : les erreurs permises sont des cœurs ; plus de cœur → la prochaine erreur fait perdre */
function jaugeHTML(total){
  total = Math.max(0, total || 0);
  return '<div class="mjb-jauge" data-total="' + total + '">' + U.coeurs(total, total) + '</div>';
}
function majJauge(root, erreurs){
  var j = root.querySelector('.mjb-jauge'); if(!j) return;
  var t = +j.getAttribute('data-total') || 0, r = Math.max(0, t - erreurs);
  j.innerHTML = U.coeurs(r, t, erreurs <= t ? r : undefined);
  j.classList.remove('choc'); void j.offsetWidth; j.classList.add('choc');
  if(r === 0 && erreurs === t && t > 0) U.plusDeCoeur(root);
}
function secoue(node){ if(!node) return; node.classList.remove('mjb-secoue'); void node.offsetWidth; node.classList.add('mjb-secoue'); }
function sansAccents(s){ return String(s).normalize ? String(s).normalize('NFD').replace(/[̀-ͯ]/g, '') : String(s); }

var IC_PNJ = {grosbec:'🎩', gaspard:'👨‍🍳', melusine:'👩‍🦰', basile:'👨‍🌾', odette:'👵', tim:'🧒', victor:'🧔', anselme:'👴', iris:'👩‍🌾', fortune:'🤠', silas:'💂', farinel:'🧑‍🌾', margot:'👩‍🍳'};
function portraitHTML(id, ic, humeur){
  if(id && window.Persos && Persos.pnj){
    try{ var s = Persos.pnj(id, {anime:true, humeur:humeur || 'normal'}); if(s) return s; }catch(e){}
  }
  return '<span class="mjb-emoji">' + esc(ic || IC_PNJ[id] || '🙂') + '</span>';
}
function aPortrait(id){ return !!(id && window.Persos && Persos.pnj); }

/* Petite démo animée commune : une main qui montre le geste. */
function demo(el, html, duree, etapes){
  el.innerHTML = '<div class="mjb-demo">' + html + '<span class="mjb-main" aria-hidden="true">👆</span></div>';
  var box = el.firstChild, main = box.querySelector('.mjb-main');
  var T = minuteurs();
  var ctx = {
    box: box, T: T,
    q: function(s){ return box.querySelector(s); },
    qa: function(s){ return box.querySelectorAll(s); },
    va: function(x, y){ main.style.left = x + '%'; main.style.top = y + '%'; },
    tape: function(){ main.classList.remove('tape'); void main.offsetWidth; main.classList.add('tape'); U.son('tic'); },
    main: main
  };
  function tour(){ etapes.forEach(function(e){ T.t(function(){ e[1](ctx); }, e[0]); }); T.t(tour, duree); }
  tour();
  return {arreter: T.tout};
}

/* ==========================================================
   BARDE 1 — Repérer le mensonge (v4 : seul le visage trahit)
   Le villageois dit TOUTES ses phrases, jusqu'au bout, sans aucun retour pendant la partie.
   Chaque phrase s'accompagne de 2 (parfois 3) mimiques honnêtes, toutes différentes.
   Une phrase mensongère montre en plus UN SEUL signe du menteur, à un moment au hasard,
   caché parmi les mimiques honnêtes. Le joueur marque les phrases qu'il croit fausses
   (il peut changer d'avis), puis valide à la fin. Le résultat dit seulement s'il a réussi
   et combien de fois il s'est trompé, jamais quelle phrase mentait.
   Tout est tiré au hasard à chaque partie : phrases mensongères (contenu par défaut),
   mimiques, moments.
   mods : revele (signe plus long et un peu plus net : clochette de vérité), aide (+N « Revoir »
          à la fin), erreurs (+N erreurs permises), lent (<1 : tout plus lent), temps (+N s réparties),
          signes (retire N sortes de signes, voir RETRAIT_SIGNES), phrases (N phrases de moins,
          contenu d'exemple seulement, 3 au minimum), indice (N fois « flair » sur la liste finale :
          « Celle-ci est sûrement vraie » sur une phrase vraie, rien sur un mensonge).
   params : pnj, ic, nom, repliques [{texte, ment}] (4 à 6, parfois 2 mensonges ; facultatif :
            listeSignes = signes permis (essais), mensongesAuHasard = redistribuer les mensonges).
   Résultat : {reussi, erreurs, score, message, detail, revus, revision:{type:'mensonge', qui, nom, ic,
            phrases:[{texte, avis}]}} — avis = la marque finale du joueur, jamais la vérité.
   Aucune lecture automatique : seulement les boutons 🔊.
   ========================================================== */
var DEF_MENSONGE = {pnj:'fortune', ic:'🤠'};
var BANQUE_MENSONGE = [
  "Je suis arrivé à Brumeval avant-hier.",
  "Ce matin, j'ai mangé une tartine au miel.",
  "J'ai vendu trois rubans rouges à la couturière.",
  "Hier soir, je me suis couché très tôt.",
  "Je ne suis jamais allé au moulin.",
  "Mon chapeau vient d'une grande ville.",
  "J'ai croisé le facteur près du lavoir.",
  "Je n'aime pas la soupe aux poireaux.",
  "Mon âne s'appelle Biscotte.",
  "Cette nuit, j'ai entendu la cloche sonner.",
  "Je connais bien le chemin de la forêt.",
  "Je range mes pièces dans une chaussette."
];

/* Répertoire : 20 mimiques honnêtes et 7 signes du menteur, tous montrés aux joueurs (décision de Romain, 3 nov.).
   e(c) renvoie l'expression pour Persos.expression ; c.cote = -1 ou 1, c.F = netteté, c.p = réglages.
   d = durée (s) d'une mimique honnête. Tout passe par le visage et la tête : aucun mouvement du cadre. */
function cote(c, g, d){ return c.cote < 0 ? g : d; }
var MIMIQUES = {
  /* --- signes du menteur : les 7 sont expliqués aux joueurs (« Les signes » et l'écran d'accueil) --- */
  coin:        {sorte:'signe', ic:'😏', court:'Yeux de côté + sourire de travers', nom:'Yeux qui glissent sur le côté + petit sourire de travers', e:function(c){ return {regard:cote(c, 'cote-g', 'cote-d'), ampleur:.55 + .3 * c.F, sourire:'coin', bouche:'fermee', vitesse:.24}; }},
  rougeur:     {sorte:'signe', ic:'🌸', court:'Le haut du front rosit', nom:'Le haut du front rosit, lentement', e:function(c){ return {rougeur:.42 + .3 * c.F, vitesseRougeur:c.p.monte || 1.2}; }},
  sueur:       {sorte:'signe', ic:'💧', court:'Une goutte glisse sur le front', nom:'Une fine goutte glisse sur le front pendant toute la phrase', e:function(c){ return {sueur:c.F, sueurDuree:3}; }},
  force:       {sorte:'signe', ic:'😬', court:'Sourire forcé : les yeux ne sourient pas', nom:'Sourire forcé : la bouche sourit, les yeux restent plats', e:function(){ return {sourire:'force', bouche:'fermee', vitesse:.15}; }},
  mordille:    {sorte:'signe', ic:'👄', court:'Il mordille sa lèvre du bas', nom:'Rentre la lèvre du bas et la mordille (2 ou 3 petits coups)', e:function(){ return {bouche:'mordille', vitesse:.08}; }},
  morsure:     {sorte:'signe', ic:'🦷', nom:'Se mord la lèvre, très vite (dents du haut visibles)', e:function(){ return {bouche:'mord', vitesse:.07}; }},
  double:      {sorte:'signe', ic:'😑', nom:'Double clignement rapide', e:function(c){ return {cligne:'double', cligneDuree:c.p.double || .36}; }},
  /* --- signes propres à un personnage (E.tics, enquête 2) : jamais tirés au hasard, absents du catalogue des 7 --- */
  oreilles:    {sorte:'propre', ic:'👂', court:'Ses oreilles deviennent toutes rouges', nom:'Ses deux oreilles deviennent toutes rouges, lentement', e:function(c){ return {oreilles:.62 + .38 * c.F, vitesseRougeur:c.p.monte || 1.2}; }},
  yeuxbas:     {sorte:'propre', ic:'🙄', court:'Baisse les yeux et lève les sourcils', nom:'Baisse les yeux et lève les sourcils en même temps', e:function(){ return {regard:'bas', sourcils:'leves', vitesse:.2}; }},
  /* --- 20 mimiques honnêtes, bien visibles --- */
  pencheD:     {sorte:'vraie', ic:'↗️', nom:'Penche la tête à droite', d:[1.1, 1.6], e:function(){ return {penche:1, vitesse:.32}; }},
  pencheG:     {sorte:'vraie', ic:'↖️', nom:'Penche la tête à gauche', d:[1.1, 1.6], e:function(){ return {penche:-1, vitesse:.32}; }},
  lent:        {sorte:'vraie', ic:'😌', nom:'Ferme les yeux un instant', d:[.85, .85], e:function(){ return {cligne:'lent', cligneDuree:.75}; }},
  reflechit:   {sorte:'vraie', ic:'🤔', nom:'Yeux en l\'air : il réfléchit', d:[1.1, 1.6], e:function(c){ return {regard:cote(c, 'haut-g', 'haut-d'), sourcils:cote(c, 'un', 'un-d'), bouche:'fermee', vitesse:.28}; }},
  petitSourire:{sorte:'vraie', ic:'🙂', nom:'Parle avec un petit sourire', d:[1.2, 1.7], e:function(){ return {sourire:1, vitesse:.25}; }},
  grandSourire:{sorte:'vraie', ic:'😁', nom:'Grand sourire', d:[.9, 1.3], e:function(){ return {sourire:2, bouche:'fermee', vitesse:.22}; }},
  sourireFerme:{sorte:'vraie', ic:'😊', nom:'Sourire bouche fermée', d:[.9, 1.4], e:function(){ return {sourire:1, bouche:'fermee', vitesse:.22}; }},
  rieurs:      {sorte:'vraie', ic:'😄', nom:'Yeux rieurs (joues qui remontent)', d:[.9, 1.4], e:function(){ return {sourire:1, yeuxRieurs:true, bouche:'fermee', vitesse:.26}; }},
  sourcils:    {sorte:'vraie', ic:'😮', nom:'Hausse les deux sourcils', d:[.7, 1.1], e:function(){ return {sourcils:'leves', vitesse:.18}; }},
  unSourcil:   {sorte:'vraie', ic:'🤨', nom:'Hausse un sourcil', d:[.8, 1.2], e:function(c){ return {sourcils:cote(c, 'un', 'un-d'), vitesse:.2}; }},
  concentre:   {sorte:'vraie', ic:'😠', nom:'Fronce les sourcils (concentré)', d:[.9, 1.3], e:function(){ return {sourcils:'fronces', paupieres:.22, vitesse:.22}; }},
  hoche:       {sorte:'vraie', ic:'🙆', nom:'Hoche la tête (oui)', d:[.75, .75], e:function(){ return {hoche:true}; }},
  nonTete:     {sorte:'vraie', ic:'🙅', nom:'Petit « non » de la tête', d:[.85, .85], e:function(){ return {secoue:true}; }},
  pince:       {sorte:'vraie', ic:'😶', nom:'Lèvres pincées', d:[.6, 1], e:function(){ return {bouche:'pincee', vitesse:.12}; }},
  moue:        {sorte:'vraie', ic:'😗', nom:'Fait la moue', d:[.7, 1.1], e:function(){ return {bouche:'moue', vitesse:.14}; }},
  mentonHaut:  {sorte:'vraie', ic:'😤', nom:'Lève le menton', d:[1, 1.5], e:function(){ return {menton:true, vitesse:.3}; }},
  mentonBas:   {sorte:'vraie', ic:'🙇', nom:'Baisse le menton', d:[1, 1.5], e:function(){ return {menton:'bas', vitesse:.3}; }},
  calme:       {sorte:'vraie', ic:'😇', nom:'Regard droit, sourire calme', d:[1.2, 1.7], e:function(){ return {sourire:'doux', bouche:'fermee', paupieres:.28, yeuxRieurs:.25, vitesse:.35}; }},
  surpris:     {sorte:'vraie', ic:'😲', nom:'Grands yeux étonnés', d:[.6, 1], e:function(){ return {grandsYeux:true, sourcils:'leves', bouche:'o', vitesse:.12}; }},
  plisse:      {sorte:'vraie', ic:'😑', nom:'Plisse les yeux', d:[.8, 1.2], e:function(){ return {paupieres:.5, yeuxRieurs:.5, sourcils:'bas', vitesse:.2}; }}
};
var SIGNES_M = Object.keys(MIMIQUES).filter(function(k){ return MIMIQUES[k].sorte === 'signe'; });
/* ordre de retrait par l'équipement (mods.signes) : sueur et rougeur d'abord ; ordre inchangé depuis que les 7 signes sont montrés */
var RETRAIT_SIGNES = ['sueur', 'rougeur', 'mordille', 'force', 'coin', 'double', 'morsure'];
function signesPossibles(n){ return SIGNES_M.filter(function(k){ return RETRAIT_SIGNES.indexOf(k) >= Math.min(n || 0, RETRAIT_SIGNES.length - 1); }); }
var VRAIES_M = Object.keys(MIMIQUES).filter(function(k){ return MIMIQUES[k].sorte === 'vraie'; });
var GESTES_UNIQUES = ['cligne', 'hoche', 'secoue', 'avale'];

/* Déroulé d'une phrase : 2 ou 3 mimiques honnêtes différentes, + 1 signe si elle ment.
   Les signes lents (rougeur, sueur) se superposent ; les autres ont leur propre moment. */
function scenarioMensonge(rep, p, signe){
  function ctx(){ return {cote:Math.random() < .5 ? -1 : 1, F:p.force || .7, p:p}; }
  var nbV = Math.random() < (p.trois || 0) ? 3 : 2;
  var ev = U.melanger(VRAIES_M).slice(0, nbV).map(function(id){
    var m = MIMIQUES[id];
    return {id:id, e:m.e(ctx()), actif:U.rand(m.d[0], m.d[1]) * (p.kMim || 1), retour:.26};
  });
  var couche = null, T = p.signe || .6;
  if(rep.ment && MIMIQUES[signe]){
    var e = MIMIQUES[signe].e(ctx());
    if(signe === 'sueur' || signe === 'rougeur' || signe === 'oreilles') couche = {id:signe, e:e};
    else ev.push({id:signe, signe:true, e:e, retour:.22, actif:signe === 'coin' || signe === 'yeuxbas' ? T : signe === 'force' ? T * 1.2 : signe === 'mordille' ? Math.max(.55, T * .8) :
      signe === 'morsure' ? Math.max(.3, T * .7) : (p.double || .36)});
  }
  ev = U.melanger(ev);
  var debut = .55, finMarge = .45, ecart = .3, occupe = 0;
  ev.forEach(function(x){ occupe += x.actif + ecart; });
  var D = Math.max((2.8 + .05 * rep.texte.length) * (p.kParole || 1), occupe + debut + finMarge);
  var monte = p.monte || 1.2, tient = p.tient || 1, descend = p.descend || 1.2;
  if(couche && (couche.id === 'rougeur' || couche.id === 'oreilles')) D = Math.max(D, monte + tient + descend + 1.1);
  /* le temps libre est réparti au hasard : impossible de guetter un moment précis */
  var libre = D - debut - finMarge - occupe, poids = ev.map(function(){ return Math.random() + .2; }).concat([Math.random() + .2]);
  var somme = poids.reduce(function(a, b){ return a + b; }, 0), t = debut;
  ev.forEach(function(x, k){ t += libre * poids[k] / somme; x.t = t; t += x.actif + ecart; });
  if(couche){
    if(couche.id === 'sueur'){ couche.t = U.rand(.25, .6); couche.actif = D - couche.t - .2; couche.e.sueurDuree = couche.actif + .15; }
    else { couche.actif = monte + tient; couche.t = U.rand(.35, Math.max(.4, D - couche.actif - descend - .2)); couche.descend = descend; }
  }
  return {D:D, ev:ev, couche:couche, signe:rep.ment ? signe : null};
}

/* Joue une phrase sur le visage : la bouche parle, les mimiques passent, puis fin(). */
function jouerPhrase(sc, X, R, root, fin){
  var couche = {}, mim = {};
  function rendre(){
    X(Object.assign({bouche:'parle'}, couche, mim));
    GESTES_UNIQUES.forEach(function(g){ delete mim[g]; });
  }
  root.__signeActif = false;
  rendre();
  sc.ev.forEach(function(x){
    R.t(function(){ mim = Object.assign({}, x.e); if(x.signe) root.__signeActif = x.id; rendre(); }, x.t * 1000);
    R.t(function(){ mim = {vitesse:x.retour}; if(x.signe) root.__signeActif = false; rendre(); }, (x.t + x.actif) * 1000);
  });
  if(sc.couche){
    var cc = sc.couche;
    R.t(function(){ couche = Object.assign({}, cc.e); root.__signeActif = cc.id; rendre(); }, cc.t * 1000);
    R.t(function(){ couche = cc.id === 'rougeur' ? {rougeur:0, vitesseRougeur:cc.descend} : cc.id === 'oreilles' ? {oreilles:0, vitesseRougeur:cc.descend} : {}; root.__signeActif = false; rendre(); }, (cc.t + cc.actif) * 1000);
  }
  R.t(fin, sc.D * 1000);
}

/* Visage animé : portrait expressif, ou repli emoji si Persos n'est pas chargé. */
function visageMensonge(box, pnj, ic){
  var expr = !!(pnj && window.Persos && Persos.pnj && Persos.expression);
  if(expr){
    try{
      var html = Persos.pnj(pnj, {anime:true, expressif:true, cadre:'visage', id:'mjbm' + (++compteur)});
      if(html) box.innerHTML = html; else expr = false;
    }catch(e){ expr = false; }
  }
  if(!expr) box.innerHTML = '<span class="mjb-emoji mjb-m-emoji">' + esc(ic || IC_PNJ[pnj] || '🙂') + '</span>';
  var svg = expr ? box.querySelector('svg') : null, emo = box.querySelector('.mjb-m-emoji');
  return function(e){
    e = e || {};
    if(svg){ Persos.expression(svg, e); return; }
    if(!emo) return;
    emo.className = 'mjb-emoji mjb-m-emoji' + (e.regard && e.regard !== 'centre' ? ' regard' : '') + (e.penche ? ' penche' : '') +
      (e.rougeur ? ' rouge' : '') + (e.sueur ? ' sueur' : '') + (e.sourire ? ' sourit' : '');
  };
}

/* Écran d'aide « Les signes du menteur » : les 7 signes (sauf ceux que l'équipement enlève) */
var TEXTES_AIDE = {
  coin:'Ses yeux glissent sur le côté, avec un petit sourire de travers.',
  rougeur:'Le haut de son front rosit, tout doucement.',
  sueur:'Une fine goutte glisse lentement sur son front.',
  force:'Sa bouche sourit, mais ses yeux ne sourient pas.',
  mordille:'Il rentre sa lèvre du bas et la mordille.',
  morsure:'Il se mord la lèvre, très vite : on voit ses dents.',
  double:'Il cligne des yeux deux fois, très vite.'
};
function aideSignes(hote, pnj, ic, possibles, quandFerme){
  var T = minuteurs();
  var cartes = ['coin', 'force', 'mordille', 'morsure', 'rougeur', 'sueur', 'double'].filter(function(k){ return !possibles || possibles.indexOf(k) >= 0; })
    .map(function(k){ return [k, TEXTES_AIDE[k]]; });
  var vrais = [
    ['sourireFerme', 'Un vrai sourire : ses yeux sourient aussi.'],
    ['reflechit', 'Les yeux en l\'air : il réfléchit.'],
    ['pencheD', 'Il penche la tête.']
  ];
  function carte(k, txt, sorte){
    return '<div class="mjb-m-carte ' + sorte + '" data-m="' + k + '"><div class="mjb-m-mini"></div><p>' + esc(txt) + '</p>' + lireBtn(txt, 'mjb-m-carte-lire') + '</div>';
  }
  var ov = U.html('<div class="mjb-m-aide" role="dialog" aria-label="Les signes du menteur"><div class="mjb-m-aide-boite">' +
    '<h3>🕵️ Les signes du menteur</h3>' +
    '<p class="mjb-m-aide-sous">Il fait toujours plein de petites mimiques. Mais quand il ment, UN de ces signes se glisse parmi elles :</p>' +
    '<div class="mjb-m-cartes">' + cartes.map(function(c){ return carte(c[0], c[1], 'signe'); }).join('') + '</div>' +
    '<h4>✔ Ça, ce n\'est pas un mensonge</h4>' +
    '<div class="mjb-m-cartes">' + vrais.map(function(c){ return carte(c[0], c[1], 'vrai'); }).join('') + '</div>' +
    '<button type="button" class="btn grand mjb-m-aide-ok">👍 J\'ai compris !</button>' +
  '</div></div>');
  hote.appendChild(ov);
  brancherLire(ov);
  var p = {double:.5, monte:.8};
  Array.prototype.forEach.call(ov.querySelectorAll('.mjb-m-carte'), function(cd, i){
    var X = visageMensonge(cd.querySelector('.mjb-m-mini'), pnj, ic);
    var k = cd.dataset.m, m = MIMIQUES[k];
    function boucle(){
      var e = m.e({cote:1, F:1, p:p});
      if(k === 'coin') e.ampleur = 1;
      if(k === 'rougeur') e.rougeur = .8;
      if(k === 'sueur') e.sueurDuree = 2.6;
      X(Object.assign({bouche:'parle'}, e));
      T.t(function(){ X({bouche:'fermee', vitesseRougeur:.8}); }, k === 'sueur' ? 2700 : 1600);
      T.t(boucle, 3400);
    }
    T.t(boucle, 300 + i * 200);
  });
  function fermer(){ T.tout(); U.stop(); if(ov.parentNode) ov.parentNode.removeChild(ov); if(quandFerme){ var q = quandFerme; quandFerme = null; q(); } }
  ov.querySelector('.mjb-m-aide-ok').addEventListener('click', function(){ U.son('clic'); fermer(); });
  return fermer;
}

MJ.enregistrer('mensonge', {
  nom:'Repérer le mensonge', role:'barde', ic:'🤥',
  consigne:"Regarde bien son visage pendant qu'il parle, marque les phrases où il ment, puis valide à la fin.",
  MIMIQUES:MIMIQUES,
  scenario:scenarioMensonge,
  reglages: function(n, mods){
    mods = mods || {};
    var lent = mods.lent && mods.lent > 0 && mods.lent < 1 ? mods.lent : 1;
    var T = U.parNiveau(n, 1.1, .55, .45);          /* durée d'un signe rapide (s) */
    var F = U.parNiveau(n, .85, .6, .5, .85);        /* netteté : reste discrète à tous les niveaux */
    var tient = U.parNiveau(n, 1.5, .8, .6);         /* la rougeur reste au plus fort */
    if(mods.revele){ T *= 1.6; tient *= 1.5; F = Math.min(1, F + .2); }
    T /= lent; tient /= lent;
    var dbl = U.parNiveau(n, .5, .36, .32) * (mods.revele ? 1.3 : 1) / lent;
    var trois = U.parNiveau(n, .15, .6, 0, .8);
    var erreurs = (n <= 3 ? 1 : 0) + (mods.erreurs || 0);
    var revoir = (n <= 3 ? 1 : 0) + (mods.aide || 0);
    var indices = mods.indice || 0, moins = mods.phrases || 0;
    var liste = signesPossibles(mods.signes || 0);
    var connus = liste.length;
    var voit = F >= .8 ? 'un peu' : F >= .66 ? 'à peine' : 'très peu';
    return {signe:T, force:F, double:dbl, monte:1.3 / lent, tient:tient, descend:1.2 / lent, trois:trois,
      kMim:U.parNiveau(n, 1.15, 1, .9) / lent, kParole:U.parNiveau(n, 1.25, 1, .9) / lent, temps:mods.temps || 0,
      nbPhrases:Math.max(3, (n <= 5 ? 4 : 5) - moins), erreurs:erreurs, revoir:revoir, indices:indices, listeSignes:liste,
      lignes:[
        {nom:'Le signe du menteur dure', val:'environ ' + U.fmt(T, 1) + ' s'},
        {nom:'On le voit', val:voit},
        {nom:'Autres mimiques dans chaque phrase', val:trois >= .5 ? '2 ou 3' : '2, parfois 3'},
        {nom:'Signes à surveiller', val:connus + ' sortes' + (mods.signes ? ' (ton équipement en enlève)' : '')},
        {nom:'Erreurs permises', val:erreurs ? String(erreurs) : 'aucune'}
      ].concat(moins ? [{nom:'Phrases en moins', val:String(moins)}] : [])
       .concat(revoir ? [{nom:'Revoir une phrase à la fin', val:revoir + ' fois'}] : [])
       .concat(indices ? [{nom:'Ton flair à la fin (« sûrement vraie »)', val:indices + ' fois'}] : [])
       .concat(mods.revele ? [{nom:'Clochette de vérité', val:'les signes durent plus longtemps'}] : [])};
  },
  demo: function(el, p){
    p = p || {};
    var pnj = (p.pnj && window.Persos && Persos.PNJ && Persos.PNJ[p.pnj]) ? p.pnj : DEF_MENSONGE.pnj;
    var possibles = (p.listeSignes && p.listeSignes.length ? p.listeSignes : SIGNES_M);
    var ordre = ['coin', 'force', 'rougeur', 'mordille', 'sueur'].filter(function(k){ return possibles.indexOf(k) >= 0; });
    if(!ordre.length) ordre = ['coin'];
    var tour = 0, X = null, fermerAide = null;
    var ctl = demo(el,
      '<div class="mjb-d-mens"><div class="mjb-d-mvisage"></div>' +
      '<div class="mjb-d-mbulle"><p class="mjb-d-mtexte"></p><p class="mjb-d-mlegende"></p></div>' +
      '<button class="mjb-d-maccuse" tabindex="-1" aria-hidden="true">🤥</button>' +
      '<button type="button" class="mjb-m-aide-btn">📖 Les signes</button></div>',
      10000, [
        [0, function(c){
          if(!X) X = visageMensonge(c.q('.mjb-d-mvisage'), pnj, p.ic);
          c.box.classList.remove('vu', 'vrai'); c.va(80, 96);
          c.q('.mjb-d-mtexte').textContent = '« Je dors à la taverne. »'; c.q('.mjb-d-mlegende').textContent = '';
          X({bouche:'parle'});
        }],
        [800, function(c){ X({sourire:1, bouche:'fermee', vitesse:.25}); c.box.classList.add('vrai'); c.q('.mjb-d-mlegende').textContent = '😊 Sourire, yeux droits : vrai.'; }],
        [2100, function(){ X({bouche:'parle', penche:1, vitesse:.32}); }],
        [3100, function(c){ X({}); c.box.classList.remove('vrai'); c.q('.mjb-d-mlegende').textContent = ''; }],
        [3600, function(c){ c.q('.mjb-d-mtexte').textContent = '« Cette bague est en or ! »'; X({bouche:'parle'}); }],
        [4300, function(c){
          var k = ordre[tour++ % ordre.length], m = MIMIQUES[k];
          var e = m.e({cote:1, F:1, p:{double:.5, monte:.6}});
          if(k === 'coin') e.ampleur = 1;
          if(k === 'rougeur') e.rougeur = .85;
          if(k === 'sueur') e.sueurDuree = 3;
          X(Object.assign({bouche:'parle'}, e));
          c.q('.mjb-d-mlegende').textContent = m.ic + ' ' + (m.court || m.nom) + ' : il ment !';
        }],
        [5600, function(c){ c.va(84, 74); }],
        [6200, function(c){ c.tape(); c.box.classList.add('vu'); }],
        [7400, function(c){ X({bouche:'fermee', vitesseRougeur:.6}); c.q('.mjb-d-mlegende').textContent = '🤥 Marquée ! À la fin, tu valides.'; }]
      ]);
    var btn = el.querySelector('.mjb-m-aide-btn');
    btn.addEventListener('click', function(e){
      e.stopPropagation(); U.son('page');
      var hote = el.closest('.mj') || el.parentNode;
      if(fermerAide) fermerAide();
      fermerAide = aideSignes(hote, pnj, p.ic, possibles);
    });
    return {arreter:function(){ ctl.arreter(); if(fermerAide) fermerAide(); }};
  },
  jouer: function(el, p, fin){
    var T = minuteurs(), R = minuteurs();
    var donnees = p.repliques && p.repliques.length;
    var rep;
    if(donnees){
      rep = p.repliques.map(function(r){ return {texte:r.texte, ment:!!r.ment}; });
      if(p.mensongesAuHasard){
        var nbM0 = rep.filter(function(r){ return r.ment; }).length || 1;
        var faux = U.melanger(plage(rep.length)).slice(0, nbM0);
        rep.forEach(function(r, i){ r.ment = faux.indexOf(i) >= 0; });
      }
    } else {
      /* contenu d'exemple : phrases et mensonges tirés au hasard à chaque partie */
      var nbP = p.nbPhrases || 4;
      rep = U.melanger(BANQUE_MENSONGE).slice(0, nbP).map(function(t){ return {texte:t, ment:false}; });
      var nbM = nbP >= 5 && Math.random() < .4 ? 2 : 1;
      U.melanger(plage(nbP)).slice(0, nbM).forEach(function(i){ rep[i].ment = true; });
    }
    var pnj = p.pnj || DEF_MENSONGE.pnj;
    var ic = p.ic || IC_PNJ[pnj] || '🙂';
    var nom = p.nom || (window.Persos && Persos.PNJ && Persos.PNJ[pnj] && Persos.PNJ[pnj].nom) || 'Le villageois';
    el.innerHTML =
      '<div class="mjb-jeu mjb-mensonge mjb-barde-fond">' +
        '<div class="mjb-m-haut"><div class="mjb-m-puces">' + rep.map(function(r, i){ return '<button type="button" class="mjb-m-puce futur" data-i="' + i + '" disabled aria-pressed="false" aria-label="Phrase ' + (i + 1) + '"><b>' + (i + 1) + '</b><span>🤥</span></button>'; }).join('') + '</div>' + jaugeHTML(p.erreurs || 0) + '<button type="button" class="mjb-m-signes">📖 Les signes</button></div>' +
        '<div class="mjb-m-scene">' +
          '<div class="mjb-m-visage"></div>' +
          '<div class="mjb-bulle-parole mjb-m-bulle"><p class="mjb-texte"></p>' + lireBtn('', 'mjb-m-lire') + '<div class="mjb-barre"><i></i></div></div>' +
        '</div>' +
        '<div class="mjb-m-actions"><button type="button" class="mjb-gros mjb-accuse" disabled aria-pressed="false"><span class="off">🤥 Mensonge !</span><span class="on">✔ Marquée : mensonge</span></button></div>' +
        '<div class="mjb-m-verdict" hidden>' +
          '<h3>Quelles phrases étaient des mensonges ?</h3>' +
          '<ol class="mjb-m-liste">' + rep.map(function(r, i){
            return '<li data-i="' + i + '"><b class="mjb-m-num">' + (i + 1) + '</b><p>' + esc(r.texte) + '</p>' + lireBtn(r.texte) +
              (p.revoir ? '<button type="button" class="mjb-m-revoir" data-i="' + i + '" aria-label="Revoir la phrase ' + (i + 1) + '">👁️</button>' : '') +
              '<button type="button" class="mjb-m-choix" data-i="' + i + '" aria-pressed="false"><span class="off">Mensonge ?</span><span class="on">🤥 Mensonge</span></button>' +
              '<span class="mjb-m-flair-txt" hidden></span></li>';
          }).join('') + '</ol>' +
          (p.revoir ? '<p class="mjb-m-reste">👁️ Revoir une phrase : encore <b>' + p.revoir + '</b> fois</p>' : '') +
          (p.indices ? '<button type="button" class="btn second petit mjb-m-flair">👃 Utiliser mon flair (encore <b>' + p.indices + '</b>)</button>' : '') +
          '<button type="button" class="btn grand mjb-m-valider">✔ Valider</button>' +
        '</div>' +
      '</div>';
    var root = el.firstChild, visage = root.querySelector('.mjb-m-visage'), bulle = root.querySelector('.mjb-m-bulle');
    var texte = root.querySelector('.mjb-texte'), barre = root.querySelector('.mjb-barre i'), lire = root.querySelector('.mjb-m-lire');
    var puces = root.querySelectorAll('.mjb-m-puce'), accuse = root.querySelector('.mjb-accuse');
    var verdict = root.querySelector('.mjb-m-verdict'), scene = root.querySelector('.mjb-m-scene'), actions = root.querySelector('.mjb-m-actions');
    brancherLire(root);
    var X = visageMensonge(visage, pnj, ic);
    var permis = (Array.isArray(p.listeSignes) && p.listeSignes.length ? p.listeSignes : Array.isArray(p.signes) && p.signes.length ? p.signes : SIGNES_M)
      .filter(function(k){ return MIMIQUES[k] && MIMIQUES[k].sorte === 'signe'; });
    if(!permis.length) permis = SIGNES_M;
    var sac = [];
    function signeSuivant(){ if(!sac.length) sac = U.melanger(permis); return sac.pop(); }
    var scen = rep.map(function(r){ return scenarioMensonge(r, p, r.ment ? signeSuivant() : null); });
    var temps = (p.temps || 0) / Math.max(1, rep.length);
    scen.forEach(function(s){ s.D += temps; });
    var k = -1, phase = 'debut', marques = rep.map(function(){ return false; }), revoir = p.revoir || 0, revus = 0, termine = false;
    var indices = p.indices || 0, flaires = 0;
    root.__scen = scen; root.__rep = rep; root.__signeActif = false;

    function majMarques(){
      marques.forEach(function(m, i){
        puces[i].classList.toggle('marque', m); puces[i].setAttribute('aria-pressed', m ? 'true' : 'false');
        var ch = root.querySelector('.mjb-m-choix[data-i="' + i + '"]');
        if(ch){ ch.setAttribute('aria-pressed', m ? 'true' : 'false'); ch.parentNode.classList.toggle('marque', m); }
      });
      var cible = phase === 'parle' || phase === 'pause' ? k : -1;
      accuse.setAttribute('aria-pressed', cible >= 0 && marques[cible] ? 'true' : 'false');
    }
    function basculer(i){
      if(termine || i < 0 || i >= rep.length || i > k) return;
      marques[i] = !marques[i]; U.son(marques[i] ? 'tic' : 'clic'); U.vibrer(20);
      majMarques();
    }
    function ecrire(t, duree){
      var n = 0, pas = Math.max(1, Math.round(t.length / Math.max(1, duree / .04)));
      texte.textContent = '';
      R.i(function(){ if(n >= t.length) return; n = Math.min(t.length, n + pas); texte.textContent = t.slice(0, n); }, 40);
    }
    /* une phrase : la bouche parle, le texte s'écrit, les mimiques passent */
    function parler(i){
      if(termine) return;
      R.tout(); k = i; phase = 'parle';
      root.dataset.phrase = i; root.dataset.ment = rep[i].ment ? '1' : '0';
      puces[i].classList.remove('futur'); puces[i].classList.add('cur'); puces[i].disabled = false;
      lire.setAttribute('data-lire', rep[i].texte);
      accuse.disabled = false; majMarques();
      var sc = scen[i];
      ecrire(rep[i].texte, Math.min(sc.D * .75, rep[i].texte.length * .06 + .6));
      barre.style.transition = 'none'; barre.style.width = '100%'; void barre.offsetWidth;
      barre.style.transition = 'width ' + sc.D + 's linear'; barre.style.width = '0%';
      jouerPhrase(sc, X, R, root, function(){
        if(termine || k !== i) return;
        R.tout(); texte.textContent = rep[i].texte;
        phase = 'pause'; X({bouche:'fermee'});
        puces[i].classList.remove('cur'); puces[i].classList.add('dite');
        if(Math.random() < .5) R.t(function(){ X({cligne:true}); }, 350);
        R.t(function(){ if(i + 1 < rep.length) parler(i + 1); else juger(); }, 1100);
      });
    }
    /* fin des phrases : le joueur revoit sa liste, change d'avis s'il veut, puis valide */
    function juger(){
      if(termine) return;
      phase = 'verdict'; k = rep.length; root.__signeActif = false;
      root.classList.add('verdict'); bulle.hidden = true; actions.hidden = true; verdict.hidden = false;
      X({});
      majMarques();
    }
    function valider(){
      if(termine || phase !== 'verdict') return;
      var err = 0, nbM = 0, trouves = 0;
      rep.forEach(function(r, i){
        if(r.ment){ nbM++; if(marques[i]) trouves++; else err++; }
        else if(marques[i]) err++;
      });
      var ok = err <= (p.erreurs || 0) && (nbM === 0 || trouves > 0);
      var detail = err === 0 ? 'Tu ne t\'es trompé sur aucune phrase.' :
        'Tu t\'es trompé sur ' + err + ' phrase' + (err > 1 ? 's' : '') + '.' + (ok ? ' C\'est quand même réussi !' : '');
      if(!ok && nbM && !trouves && err <= (p.erreurs || 0)) detail = 'Il a menti, et tu ne l\'as pas démasqué.';
      termine = true; phase = 'fin'; R.tout(); T.tout();
      U.son('clic');
      fin({reussi:ok, erreurs:err, score:Math.max(0, 1 - err / rep.length), message:ok ? 'Démasqué !' : 'Raté…', detail:detail, revus:revus, flaires:flaires,
        revision:{type:'mensonge', qui:pnj, nom:nom, ic:ic, phrases:rep.map(function(r, i){ return {texte:r.texte, avis:!!marques[i]}; })}});
    }
    accuse.addEventListener('click', function(){ if(phase === 'parle' || phase === 'pause') basculer(k); });
    /* « 📖 Les signes » pendant la partie : le villageois se tait ; à la fermeture, il redit la phrase en entier
       (ou passe à la suivante si elle était finie), pour qu'on ne rate pas un mensonge en lisant l'aide. */
    var fermerAideJeu = null;
    root.querySelector('.mjb-m-signes').addEventListener('click', function(e){
      e.stopPropagation(); if(termine || fermerAideJeu) return; U.son('page');
      var avant = phase, i0 = k, reprendre = null;
      if(avant === 'debut' || avant === 'parle' || avant === 'pause'){
        R.tout(); T.tout(); phase = 'aide'; root.__signeActif = false; X({});
        reprendre = function(){ if(termine) return; if(avant === 'pause') (i0 + 1 < rep.length ? parler(i0 + 1) : juger()); else parler(Math.max(0, i0)); };
      }
      fermerAideJeu = aideSignes(root.closest('.mj') || root, pnj, ic, permis, function(){ fermerAideJeu = null; if(reprendre) reprendre(); });
    });
    Array.prototype.forEach.call(puces, function(b){ b.addEventListener('click', function(){ if(phase !== 'verdict') basculer(+b.dataset.i); }); });
    verdict.addEventListener('click', function(e){
      var ch = e.target.closest('.mjb-m-choix'), rv = e.target.closest('.mjb-m-revoir'), va = e.target.closest('.mjb-m-valider'), fl = e.target.closest('.mjb-m-flair');
      if(ch && phase === 'verdict') basculer(+ch.dataset.i);
      else if(fl && phase === 'verdict' && indices > 0 && !fl.disabled){
        /* le flair choisit lui-même une phrase vraie pas encore flairée : il élimine une piste sans désigner le mensonge */
        var lis = verdict.querySelectorAll('.mjb-m-liste li');
        var vraies = rep.map(function(r, q){ return q; }).filter(function(q){ return !rep[q].ment && !lis[q].classList.contains('flaire'); });
        if(!vraies.length){ U.son('ko'); return; }
        var j = vraies[Math.floor(Math.random() * vraies.length)], rowTxt = lis[j].querySelector('.mjb-m-flair-txt');
        indices--; flaires++; U.son('magie');
        rowTxt.textContent = '👃 Ton flair te dit : celle-ci est sûrement vraie.';
        rowTxt.hidden = false; lis[j].classList.add('flaire');
        var rf = fl.querySelector('b'); if(rf) rf.textContent = indices;
        if(indices <= 0){ fl.disabled = true; verdict.classList.add('sans-flair'); }
      }
      else if(rv && phase === 'verdict' && revoir > 0){
        var i = +rv.dataset.i, li = rv.parentNode;
        revoir--; revus++; U.son('page');
        var reste = verdict.querySelector('.mjb-m-reste b'); if(reste) reste.textContent = revoir;
        verdict.classList.add('rejoue'); root.classList.add('rejoue'); li.classList.add('rejoue'); phase = 'rejoue';
        jouerPhrase(scen[i], X, R, root, function(){
          X({}); phase = 'verdict'; verdict.classList.remove('rejoue'); root.classList.remove('rejoue'); li.classList.remove('rejoue');
          if(revoir <= 0) verdict.classList.add('sans-revoir');
        });
      }
      else if(va) valider();
    });
    texte.textContent = nom + ' va parler…';
    X({});
    T.t(function(){ X({cligne:true}); }, 500);
    T.t(function(){ parler(0); }, 1200);
    return {arreter: function(){ termine = true; T.tout(); R.tout(); if(fermerAideJeu) fermerAideJeu(); }};
  }
});

/* ==========================================================
   BARDE 2 — Remettre la conversation dans l'ordre
   mods compris : erreurs (+N), aide (N premiers morceaux placés d'avance).
   params : morceaux [texte] dans l'ordre correct (3 à 6), leurres [texte] (facultatif),
            nbLeurres (réglage : combien de leurres glisser), titre (facultatif).
   ========================================================== */
var DEF_ORDRE = [
  "Dans la brume, deux silhouettes chuchotent.",
  "« Ce soir, à minuit, monte au clocher. »",
  "« Et mes dettes ? Vous avez promis ! »",
  "« Mets ta cape, que personne ne te reconnaisse. »"
];
var DEF_LEURRES = ["« J'adore la soupe aux poireaux ! »", "Un chat miaule sur le toit.", "« Il va pleuvoir des grenouilles ! »"];

MJ.enregistrer('ordre', {
  nom:'La conversation en morceaux', role:'barde', ic:'💬',
  consigne:"Touche les morceaux de la conversation dans le bon ordre : le premier, puis le suivant.",
  reglages: function(n, mods){
    mods = mods || {};
    var erreurs = Math.round(U.parNiveau(n, 4, 0, 0)) + (mods.erreurs || 0);
    var leurres = n >= 6 ? Math.min(3, Math.floor((n - 4) / 2)) : 0;
    return {erreurs:erreurs, nbLeurres:leurres, aide:mods.aide || 0, lignes:[
      {nom:'Erreurs permises', val:String(erreurs)},
      {nom:'Phrases pièges', val:String(leurres)}
    ].concat(mods.aide ? [{nom:'Morceaux déjà placés', val:String(mods.aide)}] : [])};
  },
  demo: function(el){
    return demo(el,
      '<div class="mjb-d-ordre"><div class="mjb-d-slots"><i>1</i><i>2</i><i>3</i></div>' +
      '<div class="mjb-d-cartes"><b data-k="2">💬3</b><b data-k="0">💬1</b><b data-k="1">💬2</b></div></div>',
      5200, [
        [0, function(c){ c.qa('.mjb-d-cartes b').forEach(function(b){ b.className = ''; }); c.qa('.mjb-d-slots i').forEach(function(s){ s.className = ''; }); c.va(50, 95); }],
        [600, function(c){ c.va(50, 72); }], [1000, function(c){ c.tape(); c.q('[data-k="0"]').className = 'pris'; c.qa('.mjb-d-slots i')[0].className = 'plein'; }],
        [1700, function(c){ c.va(80, 72); }], [2100, function(c){ c.tape(); c.q('[data-k="1"]').className = 'pris'; c.qa('.mjb-d-slots i')[1].className = 'plein'; }],
        [2800, function(c){ c.va(20, 72); }], [3200, function(c){ c.tape(); c.q('[data-k="2"]').className = 'pris'; c.qa('.mjb-d-slots i')[2].className = 'plein'; }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs();
    var morceaux = (p.morceaux && p.morceaux.length) ? p.morceaux : DEF_ORDRE;
    var pool = (p.leurres && p.leurres.length) ? p.leurres : DEF_LEURRES;
    var nbL = Math.min(p.nbLeurres || 0, pool.length);
    var aide = Math.min(p.aide || 0, morceaux.length - 1);
    var items = [];
    morceaux.forEach(function(t, k){ if(k >= aide) items.push({t:t, k:k}); });
    U.melanger(pool).slice(0, nbL).forEach(function(t){ items.push({t:t, k:-1}); });
    items = U.melanger(items);
    var suivant = aide, erreurs = 0, termine = false;
    el.innerHTML =
      '<div class="mjb-jeu mjb-ordre mjb-barde-fond">' +
        '<ol class="mjb-frise">' + morceaux.map(function(t, k){
          return '<li class="mjb-slot' + (k < aide ? ' plein aide' : '') + '" data-k="' + k + '"><span class="mjb-num">' + (k + 1) + '</span><p>' + (k < aide ? esc(t) : '') + '</p></li>';
        }).join('') + '</ol>' +
        '<div class="mjb-ligne-etat"><span class="mjb-consigne-mini">👆 Lequel vient ensuite ?</span>' + jaugeHTML(p.erreurs) + '</div>' +
        '<div class="mjb-cartes">' + items.map(function(it, j){
          return '<div class="mjb-carte" role="button" tabindex="0" data-j="' + j + '" data-k="' + it.k + '"><span class="mjb-carte-ic">💬</span><p>' + esc(it.t) + '</p>' + lireBtn(it.t) + '</div>';
        }).join('') + '</div>' +
      '</div>';
    var root = el.firstChild;
    brancherLire(root);
    var slots = root.querySelectorAll('.mjb-slot');
    function marquerSuivant(){ slots.forEach(function(s, k){ s.classList.toggle('cur', k === suivant); }); }
    marquerSuivant();
    root.querySelector('.mjb-cartes').addEventListener('click', function(e){
      if(termine || (e.target.closest && e.target.closest('[data-lire]'))) return;
      var c = e.target.closest('.mjb-carte'); if(!c || c.classList.contains('part')) return;
      var it = items[+c.dataset.j];
      if(it.k === suivant){
        U.son('ok');
        c.classList.add('part');
        var s = slots[suivant];
        s.querySelector('p').textContent = it.t; s.classList.add('plein', 'arrive');
        suivant++; marquerSuivant();
        T.t(function(){ c.remove(); }, 420);
        if(suivant >= morceaux.length){
          termine = true; root.classList.add('gagne');
          T.t(function(){ fin({reussi:true, erreurs:erreurs, message:'Tout est dans l\'ordre !', detail:morceaux.join(' ')}); }, 1200);
        }
      } else {
        erreurs++; U.son('ko'); U.vibrer(60); secoue(c);
        c.classList.add('faux'); T.t(function(){ c.classList.remove('faux'); }, 500);
        majJauge(root, erreurs);
        if(erreurs > (p.erreurs || 0)){ termine = true; T.t(function(){ fin({reussi:false, erreurs:erreurs, message:'Tout s\'embrouille…', detail:'La conversation reste en morceaux.'}); }, 800); }
      }
    });
    return {arreter: function(){ termine = true; T.tout(); }};
  }
});

/* ==========================================================
   BARDE 3 — Vrai ou faux, les ragots
   mods compris : erreurs (+N), aide (N ragots révélés par le carnet de ragots).
   params : ragots [{texte, vrai}], pnj (qui raconte, défaut margot), ic, ouvrirCarnet (fonction facultative)
   Renvoie dans le résultat : resultats [{texte, vrai, reponse}]
   ========================================================== */
var DEF_RAGOTS = {pnj:'margot', ragots:[
  {texte:"Gaspard fait le pain toute la nuit.", vrai:true},
  {texte:"Odette a douze chats.", vrai:false},
  {texte:"Tim est ramoneur.", vrai:true},
  {texte:"Le maire n'enlève jamais ses gants.", vrai:true},
  {texte:"Basile a peur des abeilles.", vrai:false}
]};

MJ.enregistrer('ragots', {
  nom:'Les ragots de la taverne', role:'barde', ic:'🍺',
  consigne:"Écoute chaque ragot. Vrai ou faux ? Aide-toi de ce que tu sais.",
  reglages: function(n, mods){
    mods = mods || {};
    var erreurs = (n <= 3 ? 2 : n <= 6 ? 1 : 0) + (mods.erreurs || 0);
    var immediat = n <= 5;
    return {erreurs:erreurs, immediat:immediat, aide:mods.aide || 0, lignes:[
      {nom:'Erreurs permises', val:String(erreurs)},
      {nom:'La réponse', val:immediat ? 'tout de suite' : 'à la fin'}
    ].concat(mods.aide ? [{nom:'Ragots déjà notés', val:String(mods.aide)}] : [])};
  },
  demo: function(el){
    return demo(el,
      '<div class="mjb-d-ragots"><span class="mjb-d-visage">👩‍🍳</span><div class="mjb-d-bulle">Tim est ramoneur ?</div>' +
      '<div class="mjb-d-vf"><b class="v">✅</b><b class="f">❌</b></div><span class="mjb-d-tampon">VRAI</span></div>',
      4400, [
        [0, function(c){ c.box.classList.remove('vu'); c.va(50, 96); }],
        [1100, function(c){ c.va(33, 76); }],
        [1600, function(c){ c.tape(); c.box.classList.add('vu'); }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs();
    var defaut = !(p.ragots && p.ragots.length);
    var rag = defaut ? DEF_RAGOTS.ragots : p.ragots;
    var pnj = p.pnj || (defaut || !p.ic ? 'margot' : null);
    var ic = p.ic || IC_PNJ[pnj] || '🗣️';
    var indices = {}; U.melanger(plage(rag.length)).slice(0, p.aide || 0).forEach(function(k){ indices[k] = true; });
    var k = 0, erreurs = 0, reponses = [], termine = false, attente = false;
    el.innerHTML =
      '<div class="mjb-jeu mjb-ragots mjb-barde-fond">' +
        '<div class="mjb-salle">' +
          '<div class="mjb-portrait petit">' + portraitHTML(pnj, ic, 'content') + '</div>' +
          '<div class="mjb-bulle-parole"><p class="mjb-texte"></p>' + lireBtn('', 'mjb-lire-ragot') + '<span class="mjb-tampon"></span><span class="mjb-indice"></span></div>' +
        '</div>' +
        '<div class="mjb-ligne-etat"><div class="mjb-pastilles">' + rag.map(function(){ return '<i></i>'; }).join('') + '</div>' + jaugeHTML(p.erreurs) + '</div>' +
        '<div class="mjb-vf"><button type="button" class="mjb-gros mjb-vrai" data-v="1">✅ Vrai</button><button type="button" class="mjb-gros mjb-faux" data-v="0">❌ Faux</button></div>' +
        (typeof p.ouvrirCarnet === 'function' ? '<button type="button" class="btn second petit mjb-carnet">📒 Mon carnet</button>' : '') +
        '<div class="mjb-recap" hidden></div>' +
      '</div>';
    var root = el.firstChild;
    brancherLire(root);
    var texte = root.querySelector('.mjb-texte'), bulle = root.querySelector('.mjb-bulle-parole');
    var tampon = root.querySelector('.mjb-tampon'), indice = root.querySelector('.mjb-indice'), btnLire = root.querySelector('.mjb-lire-ragot');
    var pastilles = root.querySelectorAll('.mjb-pastilles i');
    var carnet = root.querySelector('.mjb-carnet');
    if(carnet) carnet.addEventListener('click', function(){ try{ p.ouvrirCarnet(); }catch(e){} });
    function montrer(){
      var r = rag[k];
      root.dataset.vrai = r.vrai ? '1' : '0';
      pastilles[k].className = 'cur';
      texte.textContent = r.texte; btnLire.setAttribute('data-lire', r.texte);
      tampon.className = 'mjb-tampon'; tampon.textContent = '';
      indice.textContent = indices[k] ? '📒 Ton carnet de ragots dit : ' + (r.vrai ? 'VRAI' : 'FAUX') : '';
      indice.classList.toggle('montre', !!indices[k]);
      bulle.classList.remove('montre'); void bulle.offsetWidth; bulle.classList.add('montre');
      attente = true;
    }
    function recap(){
      termine = true;
      var ok = erreurs <= (p.erreurs || 0);
      var box = root.querySelector('.mjb-recap');
      root.querySelector('.mjb-vf').hidden = true; if(carnet) carnet.hidden = true;
      root.querySelector('.mjb-salle').hidden = true;
      box.hidden = false;
      box.innerHTML = '<h3>' + (ok ? '🍺 Ce que tu as appris' : '🍺 Les vrais ragots') + '</h3><ul>' + rag.map(function(r, q){
        var bon = reponses[q] === r.vrai;
        return '<li class="' + (bon ? 'bon' : 'mauvais') + '" style="animation-delay:' + (q * 0.12) + 's"><span class="mjb-recap-v ' + (r.vrai ? 'v' : 'f') + '">' + (r.vrai ? 'VRAI' : 'FAUX') + '</span><p>' + esc(r.texte) + '</p>' + lireBtn(r.texte) + '<span class="mjb-recap-toi">' + (bon ? '✔' : '✘') + '</span></li>';
      }).join('') + '</ul><button type="button" class="btn grand mjb-fin-ragots">Continuer</button>';
      var finRagots = box.querySelector('.mjb-fin-ragots');
      finRagots.addEventListener('click', function(){
        if(finRagots.disabled) return; finRagots.disabled = true;
        U.stop();
        fin({reussi:ok, erreurs:erreurs, message:ok ? 'Bien vu !' : 'Trop de ragots t\'ont trompé…', detail:(rag.length - erreurs) + ' ragots sur ' + rag.length + ' bien classés.',
          resultats:rag.map(function(r, q){ return {texte:r.texte, vrai:r.vrai, reponse:reponses[q]}; })});
      });
    }
    root.querySelector('.mjb-vf').addEventListener('click', function(e){
      var b = e.target.closest('[data-v]'); if(!b || !attente || termine) return;
      attente = false;
      var v = b.dataset.v === '1', r = rag[k], bon = v === r.vrai;
      reponses[k] = v;
      if(!bon) erreurs++;
      if(p.immediat){
        tampon.textContent = r.vrai ? 'VRAI' : 'FAUX';
        tampon.className = 'mjb-tampon montre ' + (r.vrai ? 'v' : 'f');
        pastilles[k].className = bon ? 'ok' : 'rate';
        if(bon) U.son('ok'); else { U.son('ko'); U.vibrer(60); secoue(bulle); majJauge(root, erreurs); }
      } else {
        pastilles[k].className = 'note'; U.son('page');
      }
      k++;
      T.t(function(){ if(k >= rag.length) recap(); else montrer(); }, p.immediat ? 1300 : 450);
    });
    T.t(montrer, 500);
    return {arreter: function(){ termine = true; T.tout(); }};
  }
});

/* ==========================================================
   SAGE — l'alphabet secret des fondateurs (pigpen)
   ========================================================== */
var X_CHEMINS = ['M4 4L15 15L26 4', 'M4 4L15 15L4 26', 'M26 4L15 15L26 26', 'M4 26L15 15L26 26'];
function glyphe(l, cls){
  var i = l.charCodeAt(0) - 65, p = '', point = false, cx = 15, cy = 15;
  if(i < 0 || i > 25) return '';
  if(i < 18){
    if(i >= 9){ point = true; i -= 9; }
    var r = Math.floor(i / 3), c = i % 3;
    if(r > 0) p += 'M4 4H26';
    if(r < 2) p += 'M4 26H26';
    if(c > 0) p += 'M4 4V26';
    if(c < 2) p += 'M26 4V26';
  } else {
    i -= 18;
    if(i >= 4){ point = true; i -= 4; }
    p = X_CHEMINS[i]; cx = [15, 8, 22, 15][i]; cy = [8, 15, 15, 22][i];
  }
  return '<svg class="mjb-glyphe ' + (cls || '') + '" viewBox="0 0 30 30" aria-hidden="true"><path class="ombre" d="' + p + '"/><path d="' + p + '"/>' + (point ? '<circle cx="' + cx + '" cy="' + cy + '" r="3"/>' : '') + '</svg>';
}
/* Schéma classique des grilles (niveaux élevés) */
function schemaPigpen(){
  var s = '<svg class="mjb-schema" viewBox="0 0 430 112" role="img" aria-label="La clé en grilles">';
  function lettre(x, y, l, point){ return '<text x="' + x + '" y="' + y + '">' + l + '</text>' + (point ? '<circle cx="' + (x + 10) + '" cy="' + (y - 14) + '" r="2.6"/>' : ''); }
  function grille(ox, debut, point){
    var g = '<path d="M' + (ox + 33.3) + ' 6V106M' + (ox + 66.6) + ' 6V106M' + ox + ' 39.3H' + (ox + 100) + 'M' + ox + ' 72.6H' + (ox + 100) + '"/>';
    for(var k = 0; k < 9; k++){ var r = Math.floor(k / 3), c = k % 3; g += lettre(ox + 16.6 + c * 33.3, 6 + 22.6 + r * 33.3, String.fromCharCode(debut + k), point); }
    return g;
  }
  function croix(ox, debut, point){
    var g = '<path d="M' + (ox + 10) + ' 12L' + (ox + 90) + ' 100M' + (ox + 90) + ' 12L' + (ox + 10) + ' 100"/>';
    var pos = [[50, 38], [24, 63], [76, 63], [50, 92]];
    for(var k = 0; k < 4; k++) g += lettre(ox + pos[k][0], pos[k][1], String.fromCharCode(debut + k), point);
    return g;
  }
  s += grille(4, 65, false) + grille(112, 74, true) + croix(220, 83, false) + croix(326, 87, true);
  return s + '</svg>';
}

/* mods compris : erreurs (+N), aide (N lettres différentes révélées), revele (clé dans l'ordre alphabétique).
   params : message (majuscules, espaces), lettresDonnees (tableau ou chaîne de lettres déjà connues). */
MJ.enregistrer('alphabet', {
  nom:'L\'alphabet secret', role:'sage', ic:'🔣',
  consigne:"Regarde le symbole qui brille. Trouve le même dans la clé et touche-le.",
  reglages: function(n, mods){
    mods = mods || {};
    var erreurs = Math.round(U.parNiveau(n, 6, 1, 0)) + (mods.erreurs || 0);
    var cle = mods.revele ? 'liste' : (n <= 3 ? 'liste' : n <= 6 ? 'melangee' : 'grilles');
    var auto = n <= 5 || !!mods.revele;
    return {erreurs:erreurs, cle:cle, autoRemplir:auto, aide:mods.aide || 0, lignes:[
      {nom:'Erreurs permises', val:String(erreurs)},
      {nom:'La clé', val:cle === 'liste' ? 'dans l\'ordre' : cle === 'melangee' ? 'mélangée' : 'en grilles'},
      {nom:'Symboles pareils', val:auto ? 'remplis tout seuls' : 'un par un'}
    ].concat(mods.aide ? [{nom:'Lettres offertes', val:String(mods.aide)}] : [])};
  },
  demo: function(el){
    return demo(el,
      '<div class="mjb-d-alpha"><div class="mjb-d-msg"><span class="cur">' + glyphe('M') + '<b>M</b></span><span>' + glyphe('I') + '<b></b></span><span>' + glyphe('N') + '<b></b></span></div>' +
      '<div class="mjb-d-cle"><i>' + glyphe('A') + 'A</i><i data-l="M">' + glyphe('M') + 'M</i><i>' + glyphe('S') + 'S</i><i>' + glyphe('E') + 'E</i></div></div>',
      4600, [
        [0, function(c){ c.box.classList.remove('vu'); c.va(50, 96); }],
        [900, function(c){ c.va(40, 80); }],
        [1500, function(c){ c.tape(); c.box.classList.add('vu'); }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs();
    var msg = sansAccents(p.message || 'MINUIT AU CLOCHER').toUpperCase().replace(/\s+/g, ' ').trim();
    var cases = msg.split('').map(function(ch){ return {l:ch, lettre:/[A-Z]/.test(ch), rempli:!/[A-Z]/.test(ch)}; });
    var donnees = {};
    String(Array.isArray(p.lettresDonnees) ? p.lettresDonnees.join('') : (p.lettresDonnees || '')).toUpperCase().split('').forEach(function(l){ if(/[A-Z]/.test(l)) donnees[l] = true; });
    var distinctes = []; cases.forEach(function(c){ if(c.lettre && distinctes.indexOf(c.l) < 0 && !donnees[c.l]) distinctes.push(c.l); });
    U.melanger(distinctes).slice(0, Math.min(p.aide || 0, Math.max(0, distinctes.length - 1))).forEach(function(l){ donnees[l] = true; });
    cases.forEach(function(c){ if(c.lettre && donnees[c.l]) { c.rempli = true; c.offert = true; } });
    var erreurs = 0, cur = -1, termine = false;
    // Message découpé en mots
    var html = '', mot = '';
    cases.forEach(function(c, i){
      if(c.l === ' '){ html += '<span class="mjb-mot">' + mot + '</span>'; mot = ''; return; }
      if(!c.lettre){ mot += '<span class="mjb-case autre"><b>' + esc(c.l) + '</b></span>'; return; }
      mot += '<button type="button" class="mjb-case' + (c.rempli ? ' rempli offert' : '') + '" data-i="' + i + '" data-l="' + c.l + '">' + glyphe(c.l) + '<b>' + (c.rempli ? c.l : '') + '</b></button>';
    });
    if(mot) html += '<span class="mjb-mot">' + mot + '</span>';
    var lettres = plage(26).map(function(k){ return String.fromCharCode(65 + k); });
    var cle;
    if(p.cle === 'grilles'){
      cle = '<div class="mjb-cle-grilles">' + schemaPigpen() + '<div class="mjb-clavier">' + lettres.map(function(l){ return '<button type="button" class="mjb-touche lettre" data-l="' + l + '">' + l + '</button>'; }).join('') + '</div></div>';
    } else {
      var ordre = p.cle === 'melangee' ? U.melanger(lettres) : lettres;
      cle = '<div class="mjb-cle">' + ordre.map(function(l){ return '<button type="button" class="mjb-touche" data-l="' + l + '">' + glyphe(l) + '<span>' + l + '</span></button>'; }).join('') + '</div>';
    }
    el.innerHTML =
      '<div class="mjb-jeu mjb-alphabet mjb-sage-fond">' +
        '<div class="mjb-parchemin-feuille"><div class="mjb-message">' + html + '</div></div>' +
        '<div class="mjb-ligne-etat"><span class="mjb-consigne-mini">✨ Quel est ce symbole ?</span>' + jaugeHTML(p.erreurs) + '</div>' +
        '<div class="mjb-cle-titre sur-titre">🔑 La clé des fondateurs</div>' + cle +
      '</div>';
    var root = el.firstChild;
    function caseNode(i){ return root.querySelector('.mjb-case[data-i="' + i + '"]'); }
    function prochaine(depuis){
      for(var j = 0; j < cases.length; j++){ var q = (depuis + j) % cases.length; if(cases[q].lettre && !cases[q].rempli) return q; }
      return -1;
    }
    function choisir(i){
      if(cur >= 0 && caseNode(cur)) caseNode(cur).classList.remove('cur');
      cur = i; root.dataset.cur = i >= 0 ? cases[i].l : '';
      if(i >= 0) caseNode(i).classList.add('cur');
    }
    function remplir(i){
      cases[i].rempli = true;
      var n = caseNode(i); n.classList.remove('cur'); n.classList.add('rempli', 'arrive');
      n.querySelector('b').textContent = cases[i].l;
    }
    function verifierFin(){
      if(cases.every(function(c){ return c.rempli; })){
        termine = true; root.classList.add('gagne'); U.son('magie');
        T.t(function(){ U.lire(msg.toLowerCase()); }, 300);
        T.t(function(){ fin({reussi:true, erreurs:erreurs, message:'Message déchiffré !', detail:'« ' + msg + ' »', message_dechiffre:msg}); }, 2200);
        return true;
      }
      return false;
    }
    root.querySelector('.mjb-message').addEventListener('click', function(e){
      var b = e.target.closest('.mjb-case[data-i]'); if(!b || termine) return;
      var i = +b.dataset.i; if(cases[i].rempli) return;
      U.son('clic'); choisir(i);
    });
    root.addEventListener('click', function(e){
      var t = e.target.closest('.mjb-touche'); if(!t || termine || cur < 0) return;
      var l = t.dataset.l;
      if(l === cases[cur].l){
        U.son('ok');
        t.classList.remove('bon'); void t.offsetWidth; t.classList.add('bon');
        if(p.autoRemplir){ cases.forEach(function(c, i){ if(c.lettre && !c.rempli && c.l === l) remplir(i); }); }
        else remplir(cur);
        if(!verifierFin()) choisir(prochaine(cur + 1));
      } else {
        erreurs++; U.son('ko'); U.vibrer(60);
        t.classList.remove('faux'); void t.offsetWidth; t.classList.add('faux');
        secoue(caseNode(cur));
        majJauge(root, erreurs);
        if(erreurs > (p.erreurs || 0)){ termine = true; T.t(function(){ fin({reussi:false, erreurs:erreurs, message:'Le message reste secret…', detail:'Trop d\'erreurs : l\'encre s\'est brouillée.'}); }, 700); }
      }
    });
    if(!verifierFin()) choisir(prochaine(0));
    return {arreter: function(){ termine = true; T.tout(); }};
  }
});

/* ==========================================================
   SAGE — superposer les plans
   mods compris : erreurs (+N essais ratés permis), zone (× tolérance), aide (repères qui s'allument),
   revele (cadre fantôme de la bonne position), transparence (curseur d'opacité, Lunettes de sage).
   params : passage (texte affiché quand il apparaît), chemin (attribut d d'un tracé SVG en 300×300, facultatif)
   ========================================================== */
var REPERES = [
  {id:'puits', nom:'puits', x:64, y:74},
  {id:'clocher', nom:'clocher', x:216, y:96},
  {id:'fontaine', nom:'fontaine', x:150, y:170},
  {id:'moulin', nom:'moulin', x:242, y:238}
];
function carteActuelle(){
  var s = '<rect width="300" height="300" fill="#2b4a3c"/>' +
    '<path d="M0 0H300V300H0Z" fill="url(#mjbp-sol)"/>' +
    '<path class="riviere" d="M276 -4 C262 60 296 112 280 162 C266 212 292 252 278 304" />' +
    '<path class="riviere-lum" d="M276 -4 C262 60 296 112 280 162 C266 212 292 252 278 304" />';
  // routes
  s += '<g class="routes"><path d="M150 304 V182"/><path d="M-4 172 H136"/><path d="M164 172 H250 V226"/><path d="M150 158 V112 L204 98"/><path d="M64 88 V140 L136 166"/><path d="M226 96 L262 70"/></g>';
  // arbres
  var arbres = [[18,20],[40,14],[62,26],[24,44],[96,18],[118,34],[16,96],[30,128],[20,214],[44,250],[18,280],[96,276],[198,286],[230,276],[120,250],[176,30],[150,40]];
  s += '<g class="arbres">' + arbres.map(function(a){ return '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="11"/><circle class="lum" cx="' + (a[0] - 3) + '" cy="' + (a[1] - 3) + '" r="5"/>'; }).join('') + '</g>';
  // maisons
  var maisons = [[110,140],[176,140],[110,196],[176,196],[110,224],[176,224],[196,150],[226,150],[92,176],[196,190],[226,190],[60,176]];
  s += '<g class="maisons">' + maisons.map(function(m){ return '<rect x="' + (m[0] - 9) + '" y="' + (m[1] - 8) + '" width="18" height="16" rx="2"/><path d="M' + (m[0] - 11) + ' ' + (m[1] - 6) + 'L' + m[0] + ' ' + (m[1] - 15) + 'L' + (m[0] + 11) + ' ' + (m[1] - 6) + 'Z"/>'; }).join('') + '</g>';
  // repères
  s += '<g class="lieux">' +
    '<circle cx="150" cy="170" r="12" class="eau-bord"/><circle cx="150" cy="170" r="8" class="eau"/>' +
    '<rect x="205" y="80" width="22" height="26" rx="2" class="tour"/><path d="M202 82 L216 66 L230 82Z" class="toit"/><circle cx="216" cy="92" r="4" class="cloche"/>' +
    '<circle cx="64" cy="74" r="10" class="pierre"/><circle cx="64" cy="74" r="5" class="trou"/>' +
    '<circle cx="242" cy="238" r="9" class="pierre"/><path d="M242 238 L242 220 M242 238 L260 238 M242 238 L242 256 M242 238 L224 238" class="ailes"/>' +
    '</g>';
  // boussole de la carte
  s += '<g class="boussole" transform="translate(274 278)"><circle r="13"/><path d="M0 -10 L4 0 L0 10 L-4 0Z"/><text y="-15">N</text></g>';
  return s;
}
function parcheminPlan(chemin){
  var bord = 'M14 20 Q40 10 70 18 T130 14 T190 20 T250 12 Q286 16 284 44 Q290 80 282 120 T286 190 T282 250 Q288 284 256 286 Q220 292 180 284 T110 288 T50 284 Q16 290 16 256 Q10 220 18 180 T12 110 T18 50 Q12 24 14 20Z';
  var s = '<path class="feuille" d="' + bord + '"/>';
  s += '<g class="croquis">';
  REPERES.forEach(function(r){
    s += '<g class="marque" data-id="' + r.id + '"><circle cx="' + r.x + '" cy="' + r.y + '" r="14"/><path d="M' + (r.x - 6) + ' ' + (r.y - 6) + 'L' + (r.x + 6) + ' ' + (r.y + 6) + 'M' + (r.x + 6) + ' ' + (r.y - 6) + 'L' + (r.x - 6) + ' ' + (r.y + 6) + '"/><text x="' + r.x + '" y="' + (r.y + 28) + '">' + r.nom + '</text></g>';
  });
  s += '<path class="passage" d="' + esc(chemin) + '"/>';
  s += '<text class="titre" x="150" y="40">Plan des Fondateurs</text>';
  s += '<g class="rose" transform="translate(40 258)"><circle r="14"/><path d="M0 -12 L4 0 L0 12 L-4 0Z M-12 0 L0 -4 L12 0 L0 4Z"/><text y="-17">N</text></g>';
  s += '</g>';
  return s;
}

MJ.enregistrer('plans', {
  nom:'Superposer les plans', role:'sage', ic:'🗺️',
  consigne:"Fais glisser le vieux plan pour que ses croix tombent pile sur la carte. Puis pose-le.",
  reglages: function(n, mods){
    mods = mods || {};
    var tol = U.parNiveau(n, 26, 7, 5) * (mods.zone || 1);
    var rot = n >= 5;
    var erreurs = Math.round(U.parNiveau(n, 4, 1, 0)) + (mods.erreurs || 0);
    var op = U.parNiveau(n, 0.62, 0.38, 0.3);
    return {tolerance:tol, rotation:rot, erreurs:erreurs, opacite:op, guide:n <= 3 || (mods.aide || 0) > 0, revele:!!mods.revele, transparence:!!mods.transparence, lignes:[
      {nom:'Précision demandée', val:tol >= 20 ? 'large' : tol >= 12 ? 'moyenne' : 'très fine'},
      {nom:'Plan tourné', val:rot ? 'oui' : 'non'},
      {nom:'Essais ratés permis', val:String(erreurs)}
    ]};
  },
  demo: function(el){
    return demo(el,
      '<div class="mjb-d-plans"><div class="mjb-d-carte"><i></i></div><div class="mjb-d-parch"><i></i></div></div>',
      4600, [
        [0, function(c){ c.box.classList.remove('vu', 'tire'); c.va(72, 70); }],
        [700, function(c){ c.box.classList.add('tire'); c.va(52, 52); }],
        [2000, function(c){ c.box.classList.add('vu'); }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs();
    var chemin = p.chemin || 'M64 74 C66 118 104 150 150 170';
    var label = p.passage || 'Le passage secret du puits';
    var a = U.rand(0, Math.PI * 2), d = U.rand(48, 80);
    var st = {dx:Math.cos(a) * d, dy:Math.sin(a) * d, r:p.rotation ? U.choix([-90, -60, -45, -30, 30, 45, 60, 90]) : 0};
    var erreurs = 0, termine = false, op = p.opacite || 0.55;
    el.innerHTML =
      '<div class="mjb-jeu mjb-plans mjb-sage-fond">' +
        '<div class="mjb-plans-cadre"><svg class="mjb-plans-svg" viewBox="0 0 300 300" aria-label="La carte et le vieux plan">' +
          '<defs><radialGradient id="mjbp-sol" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3b6150"/><stop offset="1" stop-color="#1d3329"/></radialGradient>' +
          '<linearGradient id="mjbp-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7ecd2"/><stop offset="1" stop-color="#d9c08c"/></linearGradient></defs>' +
          '<g class="carte-actuelle">' + carteActuelle() + '</g>' +
          '<g class="cibles">' + REPERES.map(function(r){ return '<circle class="cible" data-id="' + r.id + '" cx="' + r.x + '" cy="' + r.y + '" r="15"/>'; }).join('') + '</g>' +
          (p.revele ? '<path class="fantome" d="M14 20 H284 V286 H16Z"/>' : '') +
          '<g class="mjb-parch" style="opacity:' + op + '">' + parcheminPlan(chemin) + '</g>' +
          '<path class="passage-lumiere" d="' + esc(chemin) + '"/>' +
          '<text class="passage-nom" x="150" y="292">' + esc(label) + '</text>' +
        '</svg></div>' +
        '<div class="mjb-plans-outils">' +
          (p.rotation ? '<button type="button" class="mjb-rond" data-rot="-15" aria-label="Tourner à gauche">⟲</button><button type="button" class="mjb-rond" data-rot="15" aria-label="Tourner à droite">⟳</button>' : '') +
          (p.transparence ? '<label class="mjb-opacite">👓<input type="range" min="15" max="90" value="' + Math.round(op * 100) + '"></label>' : '') +
          jaugeHTML(p.erreurs) +
        '</div>' +
        '<button type="button" class="mjb-gros mjb-poser">📌 Poser le plan</button>' +
      '</div>';
    var root = el.firstChild, svg = root.querySelector('svg'), parch = root.querySelector('.mjb-parch');
    var cibles = root.querySelectorAll('.cible'), marques = root.querySelectorAll('.marque');
    function pos(r){
      var rad = st.r * Math.PI / 180, x = r.x - 150, y = r.y - 150;
      return {x:150 + x * Math.cos(rad) - y * Math.sin(rad) + st.dx, y:150 + x * Math.sin(rad) + y * Math.cos(rad) + st.dy};
    }
    function rotOk(){ return ((st.r % 360) + 360) % 360 === 0; }
    function aligne(){ return rotOk() && Math.hypot(st.dx, st.dy) <= p.tolerance; }
    function maj(){
      parch.setAttribute('transform', 'translate(' + st.dx.toFixed(1) + ' ' + st.dy.toFixed(1) + ') rotate(' + st.r + ' 150 150)');
      root.dataset.dx = st.dx.toFixed(1); root.dataset.dy = st.dy.toFixed(1); root.dataset.r = st.r;
      if(p.guide){
        REPERES.forEach(function(r, k){
          var q = pos(r), ok = Math.hypot(q.x - r.x, q.y - r.y) <= p.tolerance * 1.15;
          cibles[k].classList.toggle('proche', ok); marques[k].classList.toggle('proche', ok);
        });
      }
    }
    maj();
    var drag = null;
    svg.addEventListener('pointerdown', function(e){
      if(termine) return;
      drag = {x:e.clientX, y:e.clientY, id:e.pointerId};
      try{ svg.setPointerCapture(e.pointerId); }catch(er){}
      root.classList.add('tire');
    });
    svg.addEventListener('pointermove', function(e){
      if(!drag || e.pointerId !== drag.id) return;
      var k = 300 / svg.getBoundingClientRect().width;
      st.dx = U.borne(st.dx + (e.clientX - drag.x) * k, -130, 130);
      st.dy = U.borne(st.dy + (e.clientY - drag.y) * k, -130, 130);
      drag.x = e.clientX; drag.y = e.clientY;
      maj();
    });
    function lacher(){
      if(!drag) return; drag = null; root.classList.remove('tire');
      if(p.guide && aligne()){ st.dx = 0; st.dy = 0; maj(); U.son('tic'); }
    }
    svg.addEventListener('pointerup', lacher);
    svg.addEventListener('pointercancel', lacher);
    root.querySelectorAll('[data-rot]').forEach(function(b){
      b.addEventListener('click', function(){ if(termine) return; st.r += +b.dataset.rot; U.son('clic'); maj(); });
    });
    var range = root.querySelector('.mjb-opacite input');
    if(range) range.addEventListener('input', function(){ parch.style.opacity = range.value / 100; });
    root.querySelector('.mjb-poser').addEventListener('click', function(){
      if(termine) return;
      if(aligne()){
        termine = true; this.disabled = true; st.dx = 0; st.dy = 0; st.r = 0; maj();
        root.classList.add('gagne'); U.son('magie');
        T.t(function(){ U.lire('Un passage secret ! ' + label); }, 500);
        T.t(function(){ fin({reussi:true, erreurs:erreurs, message:'Passage découvert !', detail:label}); }, 2600);
      } else {
        erreurs++; U.son('ko'); U.vibrer(60); secoue(root.querySelector('.mjb-plans-cadre'));
        majJauge(root, erreurs);
        if(erreurs > (p.erreurs || 0)){ termine = true; root.querySelector('.mjb-poser').disabled = true; T.t(function(){ fin({reussi:false, erreurs:erreurs, message:'Les plans ne collent pas…', detail:'Le passage reste caché.'}); }, 700); }
      }
    });
    return {arreter: function(){ termine = true; T.tout(); }};
  }
});

/* ==========================================================
   SAGE — la grille de déduction
   mods compris : erreurs (+N validations ratées), aide (N lignes remplies d'avance).
   params : personnes [texte | {id, nom, ic, pnj}], lieux [texte | {id, nom, ic}], indices [texte | {texte, ic}],
            solution {idPersonne: idLieu} (les noms marchent aussi).
   ========================================================== */
var DEF_GRILLE = {
  personnes:[{id:'tim', nom:'Tim', ic:'🧒'}, {id:'odette', nom:'Odette', ic:'👵'}, {id:'gaspard', nom:'Gaspard', ic:'👨‍🍳'}],
  lieux:[{id:'moulin', nom:'Moulin', ic:'🌾'}, {id:'puits', nom:'Puits', ic:'💧'}, {id:'chene', nom:'Vieux Chêne', ic:'🌳'}],
  indices:["Gaspard livrait du pain au Moulin.", "Tim n'est pas allé au Puits."],
  solution:{tim:'chene', odette:'puits', gaspard:'moulin'}
};
function normListe(l){ return (l || []).map(function(o){ return typeof o === 'string' ? {id:o, nom:o, ic:''} : {id:o.id || o.nom, nom:o.nom || o.id, ic:o.ic || '', pnj:o.pnj}; }); }

MJ.enregistrer('grille', {
  nom:'La grille de déduction', role:'sage', ic:'🧩',
  consigne:"Lis les indices. Mets une croix où c'est impossible, et une coche où c'est sûr.",
  reglages: function(n, mods){
    mods = mods || {};
    var erreurs = Math.round(U.parNiveau(n, 3, 1, 0)) + (mods.erreurs || 0);
    return {erreurs:erreurs, croixAuto:n <= 4, montreFautes:n <= 5, aide:mods.aide || 0, lignes:[
      {nom:'Validations ratées permises', val:String(erreurs)},
      {nom:'Croix automatiques', val:n <= 4 ? 'oui' : 'non'}
    ].concat(mods.aide ? [{nom:'Cases remplies d\'avance', val:String(mods.aide)}] : [])};
  },
  demo: function(el){
    return demo(el,
      '<div class="mjb-d-grille"><b></b><b>🌾</b><b>🌳</b><b>🧒</b><i data-c="0"></i><i data-c="1"></i><b>👵</b><i data-c="2"></i><i data-c="3"></i></div>',
      4800, [
        [0, function(c){ c.qa('.mjb-d-grille i').forEach(function(x){ x.textContent = ''; x.className = ''; }); c.va(50, 96); }],
        [800, function(c){ c.va(64, 50); }],
        [1200, function(c){ c.tape(); var x = c.q('[data-c="1"]'); x.textContent = '✓'; x.className = 'v'; }],
        [1700, function(c){ c.q('[data-c="0"]').textContent = '✗'; c.q('[data-c="3"]').textContent = '✗'; }],
        [2300, function(c){ c.va(50, 76); }],
        [2700, function(c){ c.tape(); var x = c.q('[data-c="2"]'); x.textContent = '✓'; x.className = 'v'; }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs();
    var defaut = !(p.personnes && p.personnes.length && p.lieux && p.lieux.length);
    var pers = normListe(defaut ? DEF_GRILLE.personnes : p.personnes);
    var lieux = normListe(defaut ? DEF_GRILLE.lieux : p.lieux);
    var ind = (defaut ? DEF_GRILLE.indices : (p.indices || [])).map(function(x){ return typeof x === 'string' ? {texte:x} : x; });
    var solBrute = defaut ? DEF_GRILLE.solution : (p.solution || {});
    function idLieu(v){ for(var j = 0; j < lieux.length; j++) if(lieux[j].id === v || lieux[j].nom === v) return j; return -1; }
    var sol = pers.map(function(o){ var v = solBrute[o.id] !== undefined ? solBrute[o.id] : solBrute[o.nom]; return idLieu(v); });
    var etat = pers.map(function(){ return lieux.map(function(){ return ''; }); });
    var fixe = pers.map(function(){ return false; });
    var erreurs = 0, termine = false;
    function icone(o){
      if(o.pnj && window.Persos && Persos.pnj){ try{ return '<span class="mjb-mini-portrait">' + Persos.pnj(o.pnj, {anime:false}) + '</span>'; }catch(e){} }
      return o.ic ? '<span class="mjb-g-ic">' + esc(o.ic) + '</span>' : '';
    }
    function croixAutour(r, c){
      for(var j = 0; j < lieux.length; j++) if(j !== c && etat[r][j] === '') etat[r][j] = 'x';
      for(var i = 0; i < pers.length; i++) if(i !== r && etat[i][c] === '') etat[i][c] = 'x';
    }
    U.melanger(plage(pers.length)).slice(0, Math.min(p.aide || 0, pers.length - 1)).forEach(function(r){
      if(sol[r] < 0) return; fixe[r] = true; etat[r][sol[r]] = 'v'; croixAutour(r, sol[r]);
    });
    el.innerHTML =
      '<div class="mjb-jeu mjb-grille mjb-sage-fond">' +
        '<ol class="mjb-indices">' + ind.map(function(x, k){ return '<li><span class="mjb-num">' + (x.ic ? esc(x.ic) : (k + 1)) + '</span><p>' + esc(x.texte) + '</p>' + lireBtn(x.texte) + '</li>'; }).join('') + '</ol>' +
        '<div class="mjb-tableau" style="--cols:' + lieux.length + '">' +
          '<div class="mjb-coin">' + lireBtn('Mets une croix là où c\'est impossible. Mets une coche là où c\'est sûr. Une seule coche par personne.') + '</div>' +
          lieux.map(function(l){ return '<div class="mjb-entete">' + icone(l) + '<span>' + esc(l.nom) + '</span></div>'; }).join('') +
          pers.map(function(o, r){
            return '<div class="mjb-entete ligne" data-r="' + r + '">' + icone(o) + '<span>' + esc(o.nom) + '</span></div>' +
              lieux.map(function(l, c){ return '<button type="button" class="mjb-cellule" data-r="' + r + '" data-c="' + c + '" aria-label="' + esc(o.nom + ' — ' + l.nom) + '"></button>'; }).join('');
          }).join('') +
        '</div>' +
        '<div class="mjb-legende"><span>Touche : vide → <b class="x">✗</b> → <b class="v">✓</b></span></div>' +
        '<div class="mjb-ligne-etat"><span class="mjb-message-grille"></span>' + jaugeHTML(p.erreurs) + '</div>' +
        '<button type="button" class="mjb-gros mjb-valider">✔ Valider</button>' +
      '</div>';
    var root = el.firstChild;
    brancherLire(root);
    root.dataset.sol = JSON.stringify(sol);
    var msgNode = root.querySelector('.mjb-message-grille');
    function dessiner(){
      root.querySelectorAll('.mjb-cellule').forEach(function(b){
        var r = +b.dataset.r, c = +b.dataset.c, v = etat[r][c];
        b.textContent = v === 'v' ? '✓' : v === 'x' ? '✗' : '';
        b.className = 'mjb-cellule' + (v ? ' ' + v : '') + (fixe[r] ? ' fixe' : '');
      });
    }
    dessiner();
    root.querySelector('.mjb-tableau').addEventListener('click', function(e){
      var b = e.target.closest('.mjb-cellule'); if(!b || termine) return;
      var r = +b.dataset.r, c = +b.dataset.c; if(fixe[r]) return;
      var v = etat[r][c], n = v === '' ? 'x' : v === 'x' ? 'v' : '';
      etat[r][c] = n;
      if(n === 'v' && p.croixAuto) croixAutour(r, c);
      U.son(n === 'v' ? 'tic' : 'clic');
      dessiner();
      b.classList.add('pop');
    });
    root.querySelector('.mjb-valider').addEventListener('click', function(){
      if(termine) return;
      var fautes = [];
      pers.forEach(function(o, r){
        var coches = etat[r].map(function(v, c){ return v === 'v' ? c : -1; }).filter(function(c){ return c >= 0; });
        if(coches.length !== 1 || coches[0] !== sol[r]) fautes.push(r);
      });
      if(!fautes.length){
        termine = true; this.disabled = true; root.classList.add('gagne'); U.son('magie');
        var phrase = pers.map(function(o, r){ return o.nom + ' : ' + (lieux[sol[r]] ? lieux[sol[r]].nom : '?'); }).join(', ');
        T.t(function(){ fin({reussi:true, erreurs:erreurs, message:'Tout est logique !', detail:phrase}); }, 1300);
        return;
      }
      erreurs++; U.son('ko'); U.vibrer(60);
      majJauge(root, erreurs);
      if(p.montreFautes){
        fautes.forEach(function(r){ root.querySelectorAll('[data-r="' + r + '"]').forEach(function(n){ n.classList.remove('mjb-secoue', 'faute'); void n.offsetWidth; n.classList.add('mjb-secoue', 'faute'); }); });
        msgNode.textContent = '🤔 Regarde les lignes en rouge.';
      } else { secoue(root.querySelector('.mjb-tableau')); msgNode.textContent = '🤔 Pas encore…'; }
      T.t(function(){ msgNode.textContent = ''; root.querySelectorAll('.faute').forEach(function(n){ n.classList.remove('faute'); }); }, 2200);
      if(erreurs > (p.erreurs || 0)){ termine = true; root.querySelector('.mjb-valider').disabled = true; T.t(function(){ fin({reussi:false, erreurs:erreurs, message:'Ça ne tient pas debout…', detail:'La grille reste un mystère.'}); }, 800); }
    });
    return {arreter: function(){ termine = true; T.tout(); }};
  }
});

/* ==========================================================
   SAGE — assembler les runes
   mods compris : erreurs (+2 coups par point), aide (N tuiles déjà bien posées et bloquées), revele (symbole en filigrane).
   params : symbole ∈ coeur, corbeau, cle, lune, plume, pisteur, alchimiste, barde, sage, sceau
   ========================================================== */
var SYMBOLES = {
  coeur:{nom:'le Cœur de Brume', d:'M50 84 L18 50 C8 37 15 18 32 18 C42 18 48 25 50 31 C52 25 58 18 68 18 C85 18 92 37 82 50 Z M50 31 L50 84 M32 18 L50 52 L68 18 M18 50 H82'},
  corbeau:{nom:'le Corbeau', d:'M14 62 C28 40 50 32 66 36 L88 28 L74 44 C76 60 62 74 40 76 L26 90 L28 74 C18 72 14 68 14 62 Z M32 60 C46 52 58 52 68 58 M60 44 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0'},
  cle:{nom:'la clé', d:'M14 32 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 Z M24 32 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 Z M42 44 L84 86 M66 68 L76 58 M76 78 L86 68'},
  lune:{nom:'la lune', d:'M60 12 A36 36 0 1 0 88 70 A28 28 0 1 1 60 12 Z M74 30 L78 22 L82 30 L90 34 L82 38 L78 46 L74 38 L66 34 Z'},
  plume:{nom:'la plume', d:'M82 12 C42 22 22 52 20 88 C40 72 64 54 82 12 Z M20 88 L72 28 M38 62 L30 56 M48 50 L40 42 M58 38 L52 30 M44 62 L54 64 M54 50 L64 52'},
  pisteur:{nom:'le sceau de la Pisteuse', d:'M18 82 L80 20 M58 18 L82 18 L82 42 M18 82 L30 84 M18 82 L16 70 M26 74 L38 78 M26 74 L22 62 M8 30 a6 8 0 1 0 12 0 a6 8 0 1 0 -12 0 M29 14 a5 7 0 1 0 10 0 a5 7 0 1 0 -10 0'},
  alchimiste:{nom:'le sceau de l\'Alchimiste', d:'M38 12 H62 M44 12 V40 L22 80 Q20 88 28 88 H72 Q80 88 78 80 L56 40 V12 M30 66 H70 M39 76 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M52 70 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0'},
  barde:{nom:'le sceau de la Barde', d:'M28 18 C14 40 22 72 50 84 C78 72 86 40 72 18 M28 18 L38 30 M72 18 L62 30 M34 32 H66 M40 32 V74 M50 32 V78 M60 32 V74'},
  sage:{nom:'le sceau du Sage', d:'M10 50 C28 22 72 22 90 50 C72 78 28 78 10 50 Z M38 50 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M46 50 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z M50 10 V20 M22 18 L28 26 M78 18 L72 26'},
  sceau:{nom:'les quatre sceaux', d:'M14 50 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0 Z M50 30 L70 50 L50 70 L30 50 Z M50 14 V30 M86 50 H70 M50 86 V70 M14 50 H30'}
};
function hachage(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function aleaGraine(g){ return function(){ g |= 0; g = g + 0x6D2B79F5 | 0; var t = Math.imul(g ^ g >>> 15, 1 | g); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function defsRune(uid, sym){
  var r = aleaGraine(hachage(sym)), fissures = '';
  for(var k = 0; k < 11; k++){
    var x = r() * 100, y = r() * 100, d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1);
    for(var s = 0; s < 3; s++){ x += (r() - 0.5) * 34; y += (r() - 0.5) * 34; d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1); }
    fissures += '<path d="' + d + '"/>';
  }
  var taches = '';
  for(var t = 0; t < 7; t++) taches += '<circle cx="' + (r() * 100).toFixed(1) + '" cy="' + (r() * 100).toFixed(1) + '" r="' + (2 + r() * 5).toFixed(1) + '"/>';
  var dd = SYMBOLES[sym].d;
  return '<svg class="mjb-defs" width="0" height="0" aria-hidden="true"><defs>' +
    '<linearGradient id="' + uid + '-pierre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c7299"/><stop offset=".55" stop-color="#454b78"/><stop offset="1" stop-color="#262a4d"/></linearGradient>' +
    '<g id="' + uid + '">' +
      '<rect width="100" height="100" fill="url(#' + uid + '-pierre)"/>' +
      '<g fill="rgba(255,255,255,.06)">' + taches + '</g>' +
      '<g fill="none" stroke="rgba(10,12,30,.55)" stroke-width="1.1" stroke-linecap="round">' + fissures + '</g>' +
      '<g fill="none" stroke="rgba(255,255,255,.10)" stroke-width=".7" transform="translate(.8 .8)">' + fissures + '</g>' +
      '<rect x="3" y="3" width="94" height="94" rx="7" fill="none" stroke="#c9a75a" stroke-width="2.4"/>' +
      '<circle cx="10" cy="10" r="2.6" fill="#e8c46a"/><path d="M90 84 L84 90" stroke="#c9a75a" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="' + dd + '" fill="none" stroke="rgba(143,243,255,.28)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + dd + '" fill="none" stroke="#bff9ff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</g></defs></svg>';
}

MJ.enregistrer('runes', {
  nom:'Assembler les runes', role:'sage', ic:'🔷',
  consigne:"Touche une pierre pour la tourner. Reconstitue le symbole du modèle.",
  reglages: function(n, mods){
    mods = mods || {};
    var taille = n <= 3 ? 2 : n <= 6 ? 3 : 4;
    var melange = n >= 6;
    var marge = Math.round(U.parNiveau(n, 10, 3, 2)) + 2 * (mods.erreurs || 0);
    return {taille:taille, melange:melange, marge:marge, aide:mods.aide || 0, revele:!!mods.revele, lignes:[
      {nom:'Pierres', val:taille + ' × ' + taille},
      {nom:'Pierres mélangées', val:melange ? 'oui (glisse pour échanger)' : 'non'},
      {nom:'Coups en plus', val:String(marge)}
    ].concat(mods.aide ? [{nom:'Pierres déjà posées', val:String(mods.aide)}] : [])};
  },
  demo: function(el){
    return demo(el,
      '<div class="mjb-d-runes"><i></i><i class="tourne"></i><i></i><i></i></div>',
      4200, [
        [0, function(c){ c.box.classList.remove('vu'); c.va(50, 96); }],
        [800, function(c){ c.va(58, 33); }],
        [1300, function(c){ c.tape(); c.box.classList.add('vu'); }]
      ]);
  },
  jouer: function(el, p, fin){
    var T = minuteurs();
    var sym = SYMBOLES[p.symbole] ? p.symbole : 'coeur';
    var k = p.taille || 3, N = k * k, uid = 'mjbr' + (++compteur);
    var tuiles = plage(N).map(function(h){ return {home:h, pos:h, rot:0, deg:0, fixe:false}; });
    U.melanger(plage(N)).slice(0, Math.min(p.aide || 0, N - 2)).forEach(function(h){ tuiles[h].fixe = true; });
    tuiles.forEach(function(t){ if(!t.fixe){ t.rot = U.randInt(0, 3); t.deg = t.rot * 90; } });
    var libres = tuiles.filter(function(t){ return !t.fixe; });
    if(p.melange){ var poss = U.melanger(libres.map(function(t){ return t.pos; })); libres.forEach(function(t, i){ t.pos = poss[i]; }); }
    if(tuiles.every(function(t){ return t.rot === 0 && t.pos === t.home; })){ libres[0].rot = 1; libres[0].deg = 90; }
    // coups minimum
    var rotMin = tuiles.reduce(function(s, t){ return s + (4 - t.rot) % 4; }, 0);
    var vu = {}, cycles = 0;
    tuiles.forEach(function(t){ if(vu[t.home]) return; cycles++; var c = t; while(!vu[c.home]){ vu[c.home] = true; c = tuiles[c.pos]; } });
    var swapsMin = N - cycles;
    var coups = rotMin + swapsMin + (p.marge || 0);
    var termine = false;
    var cell = 100 / k;
    function tuileA(pos){ for(var i = 0; i < N; i++) if(tuiles[i].pos === pos) return tuiles[i]; return null; }
    el.innerHTML =
      '<div class="mjb-jeu mjb-runes mjb-sage-fond">' + defsRune(uid, sym) +
        '<div class="mjb-runes-haut"><div class="mjb-modele"><svg viewBox="0 0 100 100"><use href="#' + uid + '"/></svg><span>Modèle</span></div>' +
        '<div class="mjb-coups"><span class="mjb-coups-ic">🕯️</span><b>' + coups + '</b><span>coups</span></div></div>' +
        '<div class="mjb-runes-grille" style="--k:' + k + '"></div>' +
        '<p class="mjb-runes-aide">' + (p.melange ? '👆 Touche pour tourner · ✋ glisse pour échanger' : '👆 Touche une pierre pour la tourner') + '</p>' +
      '</div>';
    var root = el.firstChild, grille = root.querySelector('.mjb-runes-grille'), coupsNode = root.querySelector('.mjb-coups b');
    function dessiner(){
      var h = '';
      for(var pos = 0; pos < N; pos++){
        var t = tuileA(pos), hx = (t.home % k) * cell, hy = Math.floor(t.home / k) * cell;
        h += '<div class="mjb-tuile' + (t.fixe ? ' fixe' : '') + '" data-pos="' + pos + '" data-home="' + t.home + '" data-rot="' + t.rot + '">' +
          '<svg viewBox="' + hx + ' ' + hy + ' ' + cell + ' ' + cell + '" style="transform:rotate(' + t.deg + 'deg)"><use href="#' + uid + '"/></svg>' +
          (p.revele ? '<svg class="filigrane" viewBox="' + ((pos % k) * cell) + ' ' + (Math.floor(pos / k) * cell) + ' ' + cell + ' ' + cell + '"><path d="' + SYMBOLES[sym].d + '"/></svg>' : '') +
          (t.fixe ? '<span class="cadenas">🔒</span>' : '') + '</div>';
      }
      grille.innerHTML = h;
    }
    dessiner();
    function resolu(){ return tuiles.every(function(t){ return t.pos === t.home && t.rot % 4 === 0; }); }
    function coup(){
      coups--; coupsNode.textContent = Math.max(0, coups);
      if(resolu()){
        termine = true; root.classList.add('gagne'); U.son('magie');
        T.t(function(){ fin({reussi:true, message:'La rune s\'illumine !', detail:'Tu as reconstitué ' + SYMBOLES[sym].nom + '.'}); }, 1800);
        return;
      }
      if(coups <= 0){
        termine = true; root.classList.add('eteint'); U.son('echec');
        T.t(function(){ fin({reussi:false, message:'La rune s\'est éteinte…', detail:'Plus de coups.'}); }, 900);
      } else if(coups <= 3){ root.querySelector('.mjb-coups').classList.add('alerte'); }
    }
    function tourner(pos){
      var t = tuileA(pos); if(!t || t.fixe) return;
      t.rot = (t.rot + 1) % 4; t.deg += 90;
      var n = grille.querySelector('[data-pos="' + pos + '"]');
      n.dataset.rot = t.rot;
      n.querySelector('svg').style.transform = 'rotate(' + t.deg + 'deg)';
      U.son('tic');
      if(t.rot === 0 && t.pos === t.home){ n.classList.remove('juste'); void n.offsetWidth; n.classList.add('juste'); }
      coup();
    }
    function echanger(a, b){
      var ta = tuileA(a), tb = tuileA(b); if(!ta || !tb || ta.fixe || tb.fixe || a === b) return false;
      ta.pos = b; tb.pos = a; U.son('pas'); dessiner(); coup(); return true;
    }
    var drag = null;
    grille.addEventListener('pointerdown', function(e){
      var n = e.target.closest('.mjb-tuile'); if(!n || termine) return;
      drag = {n:n, x:e.clientX, y:e.clientY, id:e.pointerId, bouge:false};
      try{ n.setPointerCapture(e.pointerId); }catch(er){}
    });
    grille.addEventListener('pointermove', function(e){
      if(!drag || e.pointerId !== drag.id || !p.melange) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if(!drag.bouge && Math.hypot(dx, dy) > 12 && !drag.n.classList.contains('fixe')){ drag.bouge = true; drag.n.classList.add('glisse'); }
      if(drag.bouge) drag.n.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.06)';
    });
    function lacher(e){
      if(!drag) return;
      var d = drag; drag = null;
      if(termine) return;
      if(d.bouge){
        d.n.style.pointerEvents = 'none';
        var cible = document.elementFromPoint(e.clientX, e.clientY);
        d.n.style.pointerEvents = ''; d.n.style.transform = ''; d.n.classList.remove('glisse');
        var c = cible && cible.closest ? cible.closest('.mjb-tuile') : null;
        if(c && c !== d.n) echanger(+d.n.dataset.pos, +c.dataset.pos);
      } else {
        tourner(+d.n.dataset.pos);
      }
    }
    grille.addEventListener('pointerup', lacher);
    grille.addEventListener('pointercancel', function(){ if(drag){ drag.n.style.transform = ''; drag.n.classList.remove('glisse'); drag = null; } });
    return {arreter: function(){ termine = true; T.tout(); }};
  }
});

/* Accès pour le moteur et les tests */
MJ.bardeSage = {glyphe:glyphe, schemaPigpen:schemaPigpen, SYMBOLES:SYMBOLES};
})();
