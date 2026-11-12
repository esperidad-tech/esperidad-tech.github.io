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
  {id:'visee-arc', titre:'Arc et flèche', sons:liste([['choisir', 'Anneau visé', .25], ['bander', 'L’arc se bande', .4], ['tic', 'Le minuteur presse', .05],
    ['lacher', 'La corde claque', .35], ['vol', 'La flèche file', 1]])},
  {id:'visee-arrivee', titre:'L’arrivée', sons:liste([['dedans', 'Dans l’anneau', .65], ['bois', 'Dans le bois', .5], ['acote', 'À côté', .55],
    ['accroche', 'Banderole tendue', .45], ['fete', 'Place décorée !', 1.6], ['vide', 'Plus de flèches', .5]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
