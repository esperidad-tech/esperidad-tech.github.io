/* ==========================================================
   Brumeval — deux essais au plus par mini-jeu d'indice, pour toute l'enquête (Romain)
   · 1er échec : on peut réessayer tout de suite, gratuitement : « 🔁 Réessayer (dernière chance) ».
   · 2e échec : le point est fermé jusqu'à la fin de l'enquête ; il reste l'indice partiel (rate / rateNote).
   · Les missions bonus gardent leur essai unique (essaiUnique).
   Clés : 'pisteur:mairie:massif', 'sage:mairie:balcon', 'alchimiste:analyse:fil', 'sage:page:secret',
          'barde:ecoute:depositions', 'demasque:tim'.   P.essais = {clé: nombre d'échecs}
   Pour plus tard (un pouvoir de secours du Sage) : M.rouvrir(clé) redonne un dernier essai.
   Chargé APRÈS moteur-actions.js (les actions l'appellent au moment du jeu).
   ========================================================== */
(function(){
'use strict';
var M = window.M;
if(!M) return;
/* Combien d'essais (Romain, 5 novembre, 13 h 19) : à l'enquête 1 (le tutoriel), autant qu'on veut ; ensuite UN SEUL, partout, jamais de
   deuxième essai (plus de « dernière chance »). Un indice qui ne doit pas bloquer l'enquête garde son p.ouvrePartiel : le raté le donne à moitié. */
var INFINI = 1e9;
Object.defineProperty(M, 'MAX_ESSAIS', {configurable:true, get:function(){ var E = M.S && M.S.e && M.E ? M.E() : null; return E && E.id === 1 ? INFINI : 1; }});
M.essaisInfinis = function(){ return M.MAX_ESSAIS >= INFINI; };
function etat(){ var P = M.P(); if(P) P.essais = P.essais || {}; return P; }
/* Nombre d'échecs. Une vieille sauvegarde n'a pas P.essais : un « raté » déjà là compte pour un échec. */
M.nbEchecs = function(k){
  var P = M.P(); if(!P) return 0;
  var n = (P.essais || {})[k];
  if(typeof n === 'number') return n;
  if(P.vus && P.vus[k] === 'rate') return 1;
  var q = String(k).split(':');
  if(q[1] === 'ecoute' && P.vus && P.vus['ecoute2:' + q[2]]) return 1;
  return 0;
};
/* Un échec de plus ; renvoie le total */
M.echec = function(k){ var P = etat(); if(!P) return 0; var n = M.nbEchecs(k) + 1; P.essais[k] = n; return n; };
M.ferme = function(k){ return M.nbEchecs(k) >= M.MAX_ESSAIS; };
/* Le deuxième essai offert tout de suite (bouton du message d'échec) : il ne coûte pas d'action */
M.essaiGratuit = function(el, k){ return !!(el && el.dataset && el.dataset.gratuit) && M.nbEchecs(k) === M.MAX_ESSAIS - 1; };
/* Rouvrir un point fermé, pour un dernier essai (pas encore utilisé : prévu pour un pouvoir du Sage) */
M.rouvrir = function(k){ var P = etat(); if(!P) return; P.essais[k] = M.MAX_ESSAIS - 1; M.sauver(); };
/* Le texte d'un point fermé : l'indice partiel, puis une phrase gentille */
M.texteFerme = function(x){ return (x && x.ferme) || 'C\'est fini pour cette piste, jusqu\'à la fin de l\'enquête. Tu gardes ce que tu as vu.'; };
M.texteEchec = function(x, n, defaut){
  var t = (x && x.rate) || defaut || 'Raté…';
  return n >= M.MAX_ESSAIS ? t + ' ' + M.texteFerme(x) : t + (M.essaisInfinis() ? ' Tu peux réessayer !' : ' Tu as encore un essai : c\'est ta dernière chance !');
};
/* Le bouton « 🔁 Réessayer (dernière chance) » du message d'échec : m.reessai = {act, id, l…} */
M.boutonReessai = function(m){
  if(!m || !m.reessai) return '';
  var r = m.reessai, d = M.cle(r).filter(function(k){ return k !== 'act'; }).map(function(k){ return ' data-' + k + '="' + M.esc(r[k]) + '"'; }).join('');
  return '<button class="btn magie grand b-reessai" data-act="' + M.esc(r.act) + '" data-gratuit="1"' + d + '>🔁 Réessayer' + (M.essaisInfinis() || r.infini ? '' : ' (dernière chance)') + '</button>';   /* r.infini : un point à essais infinis (p.essaisInfinis) */
};
})();
