/* ==========================================================
   Brumeval — les missions de base (E.etapes[role])
   Quelques missions par rôle, en haut du Carnet (« 🎯 Mes missions ») :
   chacune avec 🔊, et un ✅ « validé » dès qu'elle est accomplie
   (petit son + message). Une pastille 🎯 sur l'onglet Carnet signale
   une mission nouvelle ou fraîchement validée, pas encore vue.
   On ne guide pas pas à pas : après les missions de base, c'est à
   l'équipe de chercher et de déduire.
   Chargé APRÈS moteur-actions.js (ajoute son action à M.A).

   Une mission : {ic, t, fait:[conditions, une seule suffit] | manuel:true (bouton « C'est fait ») | libre:true (sans case)}
   Conditions : celles de M.uneCondition (vu, page, code, et…) et en plus :
     essaye (mini-jeu tenté, réussi ou raté), analyse, potion (fabriquée ou donnée), donne (code donné),
     ingr {baies:3}, rangement (une caisse ou un sac sorti des cartons), apres (n° de moment atteint),
     bavard (habitants interrogés), demasque (aveux obtenus),
     lu (page du Grand Livre ouverte), dictee (recette secrète complète dans le grimoire), ou [une des conditions].
   Une mission validée le reste (on ne recule jamais).
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES;
if(!M) return;
function esc(s){ return M.esc(s); }
var SECS = {caisse:1, sac:1, commode:1, tonneau:1, casier:1};

/* ---------- Conditions ---------- */
function un(b){
  var P = M.P(), S = M.S;
  if(!b || !P) return false;
  if(b.ou) return b.ou.some(un);
  if(b.et) return b.et.every(un);
  if(b.essaye){ var v = P.vus[b.essaye]; return v === 'ok' || v === 'rate'; }
  if(b.fini) return P.vus[b.fini] === 'ok' || !!(M.ferme && M.ferme(b.fini));   /* réussi, ou raté deux fois (fermé : essais.js) */
  if(b.analyse) return !!(P.analyses && P.analyses[b.analyse]);
  if(b.potion) return (S.potions[b.potion] || 0) > 0 || (P.potions && P.potions[b.potion] > 0) || !!(P.donnes && P.donnes['pot:' + b.potion]);
  if(b.donne) return !!(P.donnes && P.donnes[b.donne]);
  if(b.ingr){ var n = M.ingr ? M.ingr() : (S.ingr || {}); return Object.keys(b.ingr).every(function(k){ return (n[k] || 0) >= b.ingr[k]; }); }
  if(b.rangement){
    if(!window.Atelier) return true;
    var A = S.atelier, CAT = window.Atelier.OBJETS || {};   /* un meuble qui a des cases (placard, tiroirs, bocaux…) sorti des cartons */
    return !!A && (A.objets || []).some(function(o){ return o.t !== 'fioles_ingr' && (SECS[o.t] || !!(CAT[o.t] && CAT[o.t].cases)); });   /* les fioles près de la porte sont là dès le début */
  }
  if(b.apres !== undefined) return (P.moment || 0) >= b.apres;
  if(b.lu) return !!P.vus['page:' + b.lu];
  /* dictee : la recette secrète est complète dans le grimoire de l'Alchimiste (le Sage la lui a dictée ; atelier.js, S.atelier.dictees) */
  if(b.dictee){
    var Rd = ((D && D.RECETTES) || {})[b.dictee], dd = S.atelier && S.atelier.dictees && S.atelier.dictees[b.dictee], sortes = {};
    if(!Rd || !Array.isArray(dd)) return false;
    (Rd.ingr || []).forEach(function(x){ sortes[x[0]] = 1; });
    return dd.length > 0 && dd.length >= M.cle(sortes).length;
  }
  if(b.bavard){ var gens = {}; M.cle(P.vus).forEach(function(k){ var p = k.split(':'); if(p[0] === 'barde' && p.length === 3 && P.vus[k] === 'ok' && /^\d+$/.test(p[2])) gens[p[1]] = 1; }); return M.cle(gens).length >= b.bavard; }
  if(b.demasque) return M.cle(P.vus).filter(function(k){ return k.indexOf('verite:') === 0; }).length >= b.demasque;
  return M.uneCondition(b);
}
function liste(l){ return !!(l && l.length && l.some(un)); }
M.condMission = un;

/* ---------- État ---------- */
M.etapesMission = function(){
  var E = M.E(), r = M.role();
  return (E && E.etapes && E.etapes[r]) || [];
};
function etat(){
  var P = M.P();
  if(!P.mission || typeof P.mission !== 'object') P.mission = {faits:{}, manuels:{}, coches:{}, nonLus:M.etapesMission().filter(function(e){ return !e.libre && !e.piste; }).length};
  P.mission.coches = P.mission.coches || {};
  return P.mission;
}
function faite(e, i, Mi){
  if(e.libre || e.piste) return false;
  if(e.manuel) return !!Mi.manuels[i];
  return liste(e.fait);
}

/* Met à jour les missions validées (appelé à chaque rendu). Fête les nouvelles. */
M.majMission = function(){
  try{ if(M.majAventure) M.majAventure(); }catch(e){ console.error(e); }   /* le fil d'aventure du Pisteur (carnet.js) */
  var P = M.P();
  if(!P || P.etape !== 'jeu' || P.defaite) return;
  var L = M.etapesMission(); if(!L.length) return;
  var Mi = etat(), nouvelles = [];
  L.forEach(function(e, i){ if(!Mi.faits[i] && faite(e, i, Mi)){ Mi.faits[i] = 1; Mi.coches[i] = 1; nouvelles.push(e); } });   /* validée : sa case se coche (on peut la décocher) */
  if(!nouvelles.length) return;
  Mi.nonLus = (Mi.nonLus || 0) + nouvelles.length;
  M.sauver();
  var t = nouvelles.length > 1 ? '✅ ' + nouvelles.length + ' missions validées !' : '✅ Mission validée !';
  setTimeout(function(){ M.son('gain'); M.toast(t); }, 450);
};

/* Les endroits des missions, dans l'ordre (pour la carte qui se dévoile) :
   [{i, lieu:[ids], faite, courante}] — seulement les lignes qui ont un « lieu » ; courante = la première pas encore faite. */
M.missionsLieux = function(){
  var P = M.P(); if(!P) return [];
  var L = M.etapesMission(); if(!L.length) return [];
  var Mi = etat(), l = [], dejaCourante = false;
  L.forEach(function(e, i){
    if(e.libre || e.piste) return;
    var f = !!(Mi.faits[i] || Mi.coches[i] || faite(e, i, Mi));
    var c = !f && !dejaCourante; if(c) dejaCourante = true;
    if(e.lieu) l.push({i:i, lieu:[].concat(e.lieu), faite:f, courante:c});
  });
  return l;
};
/* E1 (plantesApres) : le Pisteur ne voit « Ce qui pousse ici » qu'une fois ses missions faites (sinon il s'y perd) */
M.cacherPlantes = function(){
  var E = M.E(), P = M.P();
  if(!E || !P || !E.plantesApres || M.role() !== 'pisteur') return false;
  var L = M.etapesMission(), Mi = etat();
  return L.some(function(e, i){ return !e.libre && !e.piste && !e.manuel && !Mi.faits[i] && !faite(e, i, Mi); });
};

/* Pastille sur l'onglet Carnet : une mission nouvelle ou validée, pas encore vue */
M.badgeMission = function(){
  var P = M.P(); if(!P || P.etape !== 'jeu' || !M.etapesMission().length) return '';
  var Mi = etat();
  return Mi.nonLus > 0 && P.onglet !== 'carnet' ? '<em class="b-badge-mission" aria-label="Nouvelle mission">🎯</em>' : '';
};
M.missionDonne = function(code){
  var P = M.P(); if(!P) return;
  P.donnes = P.donnes || {}; P.donnes[code] = 1; M.sauver();
};

/* ---------- La section « 🎯 Mes missions » du Carnet ---------- */
M.sectionMissions = function(){
  var P = M.P(); if(!P || P.etape !== 'jeu') return '';
  var L = M.etapesMission(); if(!L.length) return '';
  var Mi = etat();
  /* fermée au départ, pour tous (Romain, 5 novembre, 14 h 26) : on la déplie soi-même (Mi.plie === false : dépliée) */
  var plie = Mi.plie !== false;
  Mi.nonLus = 0;
  var R = D.ROLES[M.role()];
  /* repliable (Romain, 5 novembre, 12 h 31 : pour tous les rôles) : le titre est un bouton ; replié, on voit combien sont faites */
  var nb = 0, faites = 0;
  L.forEach(function(e, i){ if(e.libre || e.piste) return; nb++; if(Mi.faits[i] || Mi.coches[i]) faites++; });
  var s = '<section class="b-missions' + (plie ? ' plie' : '') + '" style="--c:' + R.c + '"><h3><button type="button" class="b-mi-plier" data-act="missions-plier" aria-expanded="' + !plie + '">' +
    '<span>🎯 Mes missions</span>' + (nb ? '<small class="b-mi-compte">' + faites + ' / ' + nb + ' ✅</small>' : '') + '<i class="b-mi-fleche" aria-hidden="true">▾</i></button></h3>';
  if(plie) return s + '</section>';
  s += '<ul>';
  L.forEach(function(e, i){
    var fait = !!Mi.faits[i], coche = !!Mi.coches[i];
    var t = e.piste ? 'Piste : ' + e.t : e.t;
    var cls = e.libre ? 'libre' : e.piste ? 'piste' : fait ? 'fait' : 'afaire';
    if(M.tutoClasse) cls += M.tutoClasse(e, i);   /* le tutoriel (tuto.js) : l'étape en cours, celles à venir */
    /* chaque ligne a sa case, que le joueur coche ou décoche lui-même (en plus du ✅ automatique) */
    s += '<li class="' + cls + (coche ? ' coche' : '') + '"><button type="button" class="b-mi-case' + (coche ? ' on' : '') + '" data-act="mission-coche" data-i="' + i + '" aria-pressed="' + coche + '" aria-label="Cocher">' + (coche ? '✓' : '') + '</button>' +
      '<span class="b-mi-ic">' + (e.ic || (e.piste ? '💡' : e.libre ? '🔍' : '🎯')) + '</span><div class="b-mi-corps"><p>' + (e.piste ? '<b>Piste :</b> ' + esc(e.t) : esc(e.t)) + '</p>' + (M.tutoLigne ? M.tutoLigne(e, i) : '') + '</div>' +
      (fait ? '<span class="b-mi-ok">✅<small>validé</small></span>' : '') +
      M.lireBtn(t) + '</li>';
  });
  return s + '</ul></section>';
};

/* Sur l'écran de la lettre : où retrouver ses missions */
M.lettreMission = function(){
  if(!M.etapesMission().length) return '';
  var t = 'Pendant l\'enquête, tes missions sont tout en haut de ton Carnet 📒.';
  return '<p class="b-lettre-mission">🎯 ' + esc(t) + ' ' + M.lireBtn(t) + '</p>';
};

/* Certaines missions se valident sans nouveau rendu (l'atelier sauvegarde sans redessiner) :
   on vérifie doucement toutes les 1,5 s, et on met juste la pastille à jour (sans casser un glisser en cours). */
setInterval(function(){
  try{
    var P = M.P && M.S ? M.P() : null;
    if(!P || P.etape !== 'jeu' || !M.UI || M.UI.ecran !== 'enquete') return;
    var avant = P.mission ? P.mission.nonLus : 0;
    M.majMission();
    if(!P.mission || P.mission.nonLus === avant) return;
    if(P.onglet === 'carnet' && !M.UI.modal){ M.UI.garderDefilement = true; M.render(); return; }
    var sp = document.querySelector('.b-onglets button[data-o="carnet"] span');
    if(sp && !sp.querySelector('.b-badge-mission')) sp.insertAdjacentHTML('beforeend', M.badgeMission());
  }catch(e){}
}, 1500);

/* ---------- Action : cocher / décocher une ligne à la main ----------
   Pour une mission « à dire » (lire à voix haute…), la cocher la valide. */
if(M.A){
  M.A['mission-coche'] = function(el){
    var P = M.P(); if(!P) return;
    var i = +el.dataset.i, e = M.etapesMission()[i]; if(!e) return;
    var Mi = etat();
    if(Mi.coches[i]) delete Mi.coches[i];
    else { Mi.coches[i] = 1; if(e.manuel) Mi.manuels[i] = 1; }
    M.son('clic'); M.sauver(); M.UI.garderDefilement = true; M.render();
  };
  M.A['mission-fait'] = function(el){ M.A['mission-coche'](el); };   /* ancien bouton « C'est fait » */
  M.A['missions-plier'] = function(){ var P = M.P(); if(!P) return; var Mi = etat(); Mi.plie = Mi.plie === false; M.son('clic'); M.sauver(); M.UI.garderDefilement = true; M.render(); };
}
})();
