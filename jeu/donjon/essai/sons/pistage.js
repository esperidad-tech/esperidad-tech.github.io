/* Atelier des sons de Brumeval — les sons des traces de Moustache (le mini-jeu du Pisteur « Suivre les traces », enquête 3 ;
   refait le 15 novembre 2026).
   Leur code vient tel quel du jeu (jeu/src/mj-pistage.js, la fabrique sonsPistage, recopiée par construire-sons.py dans
   EXTRAITS.pistage) : ce qu'on entend ici est ce qu'on entend dans le mini-jeu.
   Ils sont NEUFS : Romain ne les a pas encore écoutés. Ils sont donc marqués 🆕 (neuf:1), pas ✅ ;
   il coche ceux qu'il garde, et touche 🔁 « à refaire » sur ceux qu'il veut changer.
   (Le jeu tire un des trois miaulements au hasard ; il les joue plus ou moins fort selon la distance.) */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function pistage(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.pistage(function(){ return J.ctx; }, S)[nom](1); }}; }
function liste(l){ return l.map(function(e){ X['pg_' + e[0]] = pistage(e[0], e[2]); return {id:'pg_' + e[0], t:e[1], x:1, neuf:1}; }); }
var section = {id:'mj-pistage', titre:'Traces de Moustache', sous:[
  {id:'pistage-pas', titre:'Pieds du Pisteur', sons:liste([['plouf', 'Dans une flaque', .25], ['floc', 'Dans la boue', .2], ['pouf', 'Dans la farine', .35]])},
  {id:'pistage-chats', titre:'Les chats', sons:liste([['miaouA', 'Moustache miaule A', .65], ['miaouB', 'Moustache miaule B', 1], ['miaouC', 'Moustache miaule C', .5],
    ['fuite', 'Moustache file', .65], ['course', 'Un chat passe', .65], ['pigeons', 'Les pigeons s’envolent', .6]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
