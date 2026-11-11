/* Atelier des sons de Brumeval — les sons du gâteau de la fête (le mini-jeu de l'Alchimiste, 11 novembre 2026).
   Leur code vient tel quel du jeu (jeu/src/mj-gateau.js, la fabrique sonsGateau, recopiée par construire-sons.py
   dans EXTRAITS.gateau) : ce qu'on entend ici est ce qu'on entend dans le mini-jeu.
   Ils sont NEUFS : Romain ne les a pas encore écoutés. Ils sont donc marqués 🆕 (neuf:1), pas ✅ ;
   il coche ceux qu'il garde, et touche 🔁 « à refaire » sur ceux qu'il veut changer.
   (Les petits « pop » des bulles sont ceux des pastilles de la carte : « Le jeu », déjà validés.) */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function gateau(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.gateau(function(){ return J.ctx; }, S)[nom](); }}; }
function liste(l){ return l.map(function(e){ X['g_' + e[0]] = gateau(e[0], e[2]); return {id:'g_' + e[0], t:e[1], x:1, neuf:1}; }); }
var section = {id:'mj-gateau', titre:'Gâteau de fête', sous:[
  {id:'gateau-etages', titre:'Étages et couleurs', sons:liste([['etage', 'Étage posé', .45], ['etageMoins', 'Étage retiré', .3], ['forme', 'Le moule change', .25], ['penche', 'Ça penche', .4],
    ['pate', 'La pâte', .25], ['glacage', 'Le glaçage', .45], ['motif', 'Le motif', .25], ['creme', 'La crème', .4], ['plat', 'Le plat', .35], ['nappe', 'La nappe', .55], ['pinceau', 'Le pinceau', .25]])},
  {id:'gateau-decos', titre:'Une décoration posée', sons:liste([['fruit', 'Un fruit', .25], ['fleur', 'Une fleur', .7], ['bonbon', 'Un bonbon', .25], ['fete', 'Fête', .3], ['farfelu', 'Farfelu', .45],
    ['paillettes', 'Paillettes', .4], ['chantilly', 'Chantilly', .4]])},
  {id:'gateau-gestes', titre:'Gestes et fête', sons:liste([['prend', 'On la soulève', .12], ['tourne', 'Elle tourne', .15], ['poubelle', 'À la poubelle', .4], ['annule', 'Annuler', .2],
    ['plein', 'Plus de place', .3], ['bravo', 'C’est prêt !', 1.6], ['confetti', 'Confettis', .5]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
