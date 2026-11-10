/* demarrage.js — le départ du donjon : reprendre la partie gardée ou en commencer une, puis l'exploration.
   Pour les essais et les tests : index.html?combat=<salle>&sac=feu,huile,baume&objets=pisteur:fleches-argent,sage:cristal-lune&graine=7
   lance directement un combat (sans carte), et recommence quand il est fini. */
(function(){
'use strict';
var SALLE = window.SALLE, DJ = window.DJ, D = window.DonjonDonnees, Regles = window.Regles;
var q = DJ.q, el = DJ.el;

function parametres(){
  var o = {};
  (location.search || '').replace(/^\?/, '').split('&').forEach(function(x){ if(!x) return; var k = x.split('='); o[decodeURIComponent(k[0])] = decodeURIComponent((k[1] || '').replace(/\+/g, ' ')); });
  return o;
}
/* l'écran de passage : court, sombre, le nom du lieu. C'est là qu'on charge, qu'on décode et qu'on cuit. */
DJ.passage = function(nom, travail){
  var jeu = q('#jeu');
  var p = el('div', 'ecran'); p.id = 'passage';
  p.innerHTML = '<div class="pa-nom">' + DJ.esc(nom) + '</div><div class="pa-points"><i></i><i></i><i></i></div>';
  jeu.appendChild(p);
  var t0 = Date.now();
  return Promise.resolve().then(travail).then(function(r){
    return DJ.attendre(Math.max(0, 700 - (Date.now() - t0))).then(function(){ return r; });
  });
};

/* un combat tout seul, pour les essais */
function essaiCombat(P){
  var salle = P.combat, partie = Regles.nouvellePartie(P.graine ? +P.graine : Math.floor(Math.random() * 1e9));
  if(P.sac) partie.sac = P.sac.split(',').filter(function(r){ return D.RECETTES[r]; });
  else partie.sac = ['feu', 'huile', 'baume'];
  partie.sac.forEach(function(r){ if(partie.recettes.indexOf(r) < 0) partie.recettes.push(r); });
  (P.objets || '').split(',').forEach(function(x){ var k = x.split(':'); if(k.length === 2 && partie.heros[k[0]] && D.OBJETS[k[1]]) partie.heros[k[0]].objets.push(k[1]); });
  if(P.livre) Object.keys(D.MONSTRES).forEach(function(m){ partie.livre[m] = +P.livre; });
  partie.lieu = (Object.keys(D.LIEUX).filter(function(l){ return D.LIEUX[l].combat === salle; })[0]) || partie.lieu;
  window.PARTIE = partie;
  function tour(){
    DJ.passage(D.COMBATS[salle].nom, function(){ return DJ.Combat.preparer(salle); }).then(function(){ return DJ.Combat.lancer(partie, salle); }).then(function(res){
      window.RESULTAT = res;
      var jeu = q('#jeu'); jeu.innerHTML = '';
      var e = el('div', 'ecran'); e.id = 'essai-fin';
      e.innerHTML = '<div class="pa-nom">' + (res === 'victoire' ? 'Victoire' : res === 'fuite' ? 'Fuite' : 'Défaite') + '</div><button class="aller guide" data-act="essai-encore">Rejouer ↻</button>';
      jeu.appendChild(e);
    });
  }
  DJ.toucher(function(a){ if(a === 'essai-encore'){ location.reload(); return true; } return false; });
  tour();
}

function demarrer(){
  DJ.brancher();
  DJ.verifierTemoin();
  DJ.sonsProvisoires();
  DJ.cssHeros();
  var P = parametres();
  if(P.vitesse) SALLE.vitesse = +P.vitesse;
  if(P.combat && D.COMBATS[P.combat]) return essaiCombat(P);
  if(DJ.Explo && DJ.Explo.demarrer) return DJ.Explo.demarrer(P);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
