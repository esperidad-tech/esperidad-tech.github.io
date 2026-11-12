/* Atelier des sons de Brumeval — les sons des banderoles de la fête, le tir à l'arc vu de face
   (le mini-jeu du Pisteur, enquête 3 ; 12 novembre 2026).
   Leur code vient tel quel du jeu (jeu/src/mj-visee.js, la fabrique sonsVisee, recopiée par construire-sons.py
   dans EXTRAITS.visee) : ce qu'on entend ici est ce qu'on entend dans le mini-jeu.
   Ils sont NEUFS : Romain ne les a pas encore écoutés. Ils sont donc marqués 🆕 (neuf:1), pas ✅ ;
   il coche ceux qu'il garde, et touche 🔁 « à refaire » sur ceux qu'il veut changer. */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function visee(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.visee(function(){ return J.ctx; }, S)[nom](); }}; }
function liste(l){ return l.map(function(e){ X['vs_' + e[0]] = visee(e[0], e[2]); return {id:'vs_' + e[0], t:e[1], x:1, neuf:1}; }); }
var section = {id:'mj-visee', titre:'Tir aux anneaux', sous:[
  /* la corde qui se tend, la corde lâchée : trois sons chacune ; le jeu en tire un au hasard à chaque tir, chaque fois un peu
     plus grave ou un peu plus aigu (Romain, 12 novembre, 16 h 51). Ici on les écoute un par un, pour garder ou refaire. */
  {id:'visee-arc', titre:'Arc et flèche', sons:liste([['choisir', 'Anneau visé', .25], ['banderA', 'Corde tendue A', .8], ['banderB', 'Corde tendue B', .8], ['banderC', 'Corde tendue C', .8],
    ['tic', 'Le minuteur presse', .05], ['lacherA', 'Corde lâchée A', .25], ['lacherB', 'Corde lâchée B', .3], ['lacherC', 'Corde lâchée C', .2], ['vol', 'La flèche file', 1]])},
  {id:'visee-arrivee', titre:'L’arrivée', sons:liste([['dedans', 'Dans l’anneau', .65], ['bois', 'Dans le bois', .5], ['acote', 'À côté', .55],
    ['accroche', 'Banderole tendue', .45], ['fete', 'Place décorée !', 1.6], ['vide', 'Plus de flèches', .5]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
