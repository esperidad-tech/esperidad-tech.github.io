/* demarrage.js — le départ du donjon : reprendre la partie gardée ou en commencer une, puis l'exploration.
   Pour les essais et les tests : index.html?combat=<salle>&potions=feu,huile,baume&objets=pisteur:fleches-argent,sage:cristal-lune&graine=7
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
  DJ.essai = true;                                        /* (un essai ne touche pas à la partie gardée dans l'appareil) */
  var salle = P.combat, partie = Regles.nouvellePartie(P.graine ? +P.graine : Math.floor(Math.random() * 1e9));
  /* &sac=… (ou &potions=…) : les potions que l'Alchimiste a su créer, pour cet essai ; « toutes » : les 9 ; rien : les 7 du départ
     (depuis le 10 novembre, il n'y a plus de sac de 3 recettes : il a toutes ses potions) */
  var liste = P.potions || P.sac;
  if(liste === 'toutes') partie.recettes = D.ORDRE_RECETTES.slice();
  else if(liste) partie.recettes = liste.split(',').filter(function(r){ return D.RECETTES[r]; });
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

function essaiLeo(P){
  DJ.essai = true;                                        /* (un essai ne touche pas à la partie gardée dans l'appareil) */
  var partie = Regles.nouvellePartie(P.graine ? +P.graine : Math.floor(Math.random() * 1e9));
  var liste = P.potions || P.sac;
  if(liste === 'toutes') partie.recettes = D.ORDRE_RECETTES.slice();
  else if(liste) partie.recettes = liste.split(',').filter(function(r){ return D.RECETTES[r]; });
  (P.objets || '').split(',').forEach(function(x){ var k = x.split(':'); if(k.length === 2 && partie.heros[k[0]] && D.OBJETS[k[1]]) partie.heros[k[0]].objets.push(k[1]); });
  if(P.vu && P.vu !== '0') partie.faits['leo:vu'] = 1;    /* (&vu=0 : avec la cinématique d'entrée) */
  window.PARTIE = partie;
  DJ.passage('La dernière salle', function(){ return DJ.Leo.preparer(+P.phase || 1); }).then(function(){ return DJ.Leo.lancer(partie, {phase:+P.phase || 1, vite:+P.leovite || 1}); }).then(function(res){
    window.RESULTAT = res;
    var jeu = q('#jeu'); jeu.innerHTML = '';
    var e = el('div', 'ecran'); e.id = 'essai-fin';
    e.innerHTML = '<div class="pa-nom">' + (res === 'victoire' ? 'Victoire' : 'Retour à la carte') + '</div><button class="aller guide" data-act="essai-encore">Rejouer ↻</button>' +
      '<div class="essai-phases">' + [1, 2, 3].map(function(n){ return '<button class="aller" data-act="essai-phase-' + n + '">Phase ' + n + '</button>'; }).join('') + '</div>' +
      '<div class="ligne petit version">' + DJ.esc(DJ.ligneVersion()) + '</div>';
    jeu.appendChild(e);
  });
  DJ.toucher(function(a){
    if(a === 'essai-encore'){ location.reload(); return true; }
    if(a.indexOf('essai-phase-') === 0){ location.href = location.pathname + '?leo=' + a.slice(12); return true; }
    return false;
  });
}

function demarrer(){
  DJ.brancher();
  DJ.verifierTemoin();
  DJ.sonsProvisoires();
  DJ.cssHeros();
  var P = parametres();
  if(P.vitesse) SALLE.vitesse = +P.vitesse;
  /* (pour les essais) le combat de Léo tout seul : index.html?combat=leo&phase=2&objets=sage:cristal-lune,sage:baton-chene&potions=toutes */
  /* (Romain, 15 novembre, 13 h 01 : « faire en sorte que je sois directement au combat de fin ») l'adresse courte :
     donjon/?leo=1, ?leo=2, ?leo=3 — le combat de Léo tout de suite, à la phase voulue, sans la cinématique d'entrée, avec les deux
     bâtons du Sage, les flèches du Pisteur et toutes les potions. Rien n'est gardé : la descente en cours dans l'appareil reste là. */
  if(P.leo){
    P.combat = 'leo'; P.phase = P.leo;
    if(P.vu == null) P.vu = '1';
    if(!P.objets) P.objets = 'sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent';
    if(!P.potions && !P.sac) P.potions = 'toutes';
  }
  if(P.combat === 'leo') return essaiLeo(P);
  if(P.combat && D.COMBATS[P.combat]) return essaiCombat(P);
  if(DJ.Explo && DJ.Explo.demarrer) return DJ.Explo.demarrer(P);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
