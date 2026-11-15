/* Atelier des sons de Brumeval — les sons des traces de Moustache (le mini-jeu du Pisteur « Suivre les traces », enquête 3 ;
   refait le 15 novembre 2026).
   Leur code vient tel quel du jeu (jeu/src/mj-pistage.js, la fabrique sonsPistage, recopiée par construire-sons.py dans
   EXTRAITS.pistage) : ce qu'on entend ici est ce qu'on entend dans le mini-jeu.
   Ils sont NEUFS : Romain ne les a pas encore écoutés. Ils sont donc marqués 🆕 (neuf:1), pas ✅ ;
   il coche ceux qu'il garde, et touche 🔁 « à refaire » sur ceux qu'il veut changer.
   (15 novembre, 14 h 26 : « tu les fais tous miauler un peu différemment » — une voix par chat, au lieu des trois miaulements de
   Moustache ; le jeu les joue plus ou moins fort selon la distance, à gauche ou à droite. Et le hibou de la forêt.) */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function pistage(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.pistage(function(){ return J.ctx; }, S)[nom](1); }}; }
function liste(l){ return l.map(function(e){ X['pg_' + e[0]] = pistage(e[0], e[2]); return {id:'pg_' + e[0], t:e[1], x:1, neuf:1}; }); }
var section = {id:'mj-pistage', titre:'Traces de Moustache', sous:[
  {id:'pistage-pas', titre:'Pieds du Pisteur', sons:liste([['plouf', 'Dans une flaque', .25], ['floc', 'Dans la boue', .2], ['pouf', 'Dans la farine', .35]])},
  {id:'pistage-chats', titre:'Les sept chats', sons:liste([['m_moustache', 'Moustache', .8], ['m_biscotte', 'Biscotte', .35], ['m_pompon', 'Pompon', .65], ['m_caramel', 'Caramel', .6],
    ['m_mistigri', 'Mistigri', .55], ['m_noisette', 'Noisette', .7], ['m_grisette', 'Grisette', 1.05]])},
  {id:'pistage-autres', titre:'Rues et forêt', sons:liste([['fuite', 'Moustache file', .65], ['course', 'Un chat passe', .65], ['pigeons', 'Les pigeons s’envolent', .6], ['hibou', 'Le hibou', 1.4]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
