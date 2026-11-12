/* Atelier des sons de Brumeval — les sons de l'établi des plantes (l'Alchimiste, enquête 3 ; refait le 12 novembre 2026).
   Leur code vient tel quel du jeu (jeu/src/etabli/15-sons.js, la fabrique sonsEtabli, recopiée par construire-sons.py
   dans EXTRAITS.etabli) : ce qu'on entend ici est ce qu'on entend sur l'établi.
   Ils sont NEUFS : Romain ne les a pas encore écoutés. Ils sont donc marqués 🆕 (neuf:1), pas ✅ ;
   il coche ceux qu'il garde, et touche 🔁 « à refaire » sur ceux qu'il veut changer. */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function etabli(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.etabli(function(){ return J.ctx; }, S)[nom](); }}; }
function liste(l){ return l.map(function(e){ X['et_' + e[0]] = etabli(e[0], e[2]); return {id:'et_' + e[0], t:e[1], x:1, neuf:1}; }); }
var section = {id:'mj-etabli', titre:'Établi des plantes', sous:[
  {id:'etabli-plantes', titre:'Plantes et gestes', sons:liste([['clic', 'Un toucher', .1], ['plante', 'Plante choisie', .3], ['partie', 'Partie prise', .2],
    ['pose', 'Posé sur l’outil', .15], ['bien', 'Le bon geste', .35], ['non', 'Pas ça', .3], ['pouf', 'Pouf, raté', .4], ['nom', 'L’outil parle', .1],
    ['zoom', 'On s’approche', .5], ['dezoom', 'On s’éloigne', .45]])},
  {id:'etabli-outils', titre:'Les outils', sons:liste([['hache', 'Le couteau hache', .12], ['tamis', 'Le tamis', .2], ['pilon', 'Le pilon', .15], ['presse', 'Le pressoir', .6],
    ['goutte', 'Une goutte', .15], ['verse', 'L’eau versée', .6], ['huile', 'L’huile versée', .6], ['filtre', 'Le filtre goutte', .9], ['trempe', 'Ça trempe', .65],
    ['cuillere', 'La cuillère tourne', .5], ['seche', 'Ça sèche', 1.7], ['grille', 'Les épis secoués', .6]])},
  {id:'etabli-feu', titre:'Feu et marmite', sons:liste([['buche', 'Une bûche', .2], ['allumette', 'L’allumette', .6], ['feu', 'Le feu crépite', 1.6], ['mijote', 'Ça mijote', 1.6],
    ['bouillon', 'Gros bouillons', 1.8], ['alambic', 'L’alambic distille', 2.3]])},
  {id:'etabli-fioles', titre:'Fioles, grimoire, sac', sons:liste([['fiole', 'La fiole remplie', .6], ['bouchon', 'Le bouchon', .12], ['potion', 'Potion prête !', 1], ['toutes', 'Les sept potions !', 1.4],
    ['livre', 'Le grimoire s’ouvre', .3], ['page', 'Une page tourne', .25], ['sac', 'Le sac', .3]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
