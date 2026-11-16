/* Atelier des sons de Brumeval — les sons de Mimi à l'atelier (le Tamagotchi de Mimi, refait le 16 novembre 2026).
   Leur code vient tel quel du jeu (jeu/src/atelier.js, la fabrique sonsMimi, recopiée par construire-sons.py dans
   EXTRAITS.mimi) : ce qu'on entend ici est ce qu'on entend dans l'atelier.
   Ils sont NEUFS : Romain ne les a pas encore écoutés. Ils sont donc marqués 🆕 (neuf:1), pas ✅ ;
   il coche ceux qu'il garde, et touche 🔁 « à refaire » sur ceux qu'il veut changer. */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function mimi(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.mimi(function(){ return J.ctx; }, S)[nom](); }}; }
function liste(l){ return l.map(function(e){ X['mm_' + e[0]] = mimi(e[0], e[2]); return {id:'mm_' + e[0], t:e[1], x:1, neuf:1}; }); }
var section = {id:'mj-mimi', titre:'Mimi à l’atelier', sous:[
  {id:'mimi-voix', titre:'Sa voix', sons:liste([['miaou', 'Miaou', .8], ['trille', 'Mrrrp ?', .5], ['baille', 'Elle bâille', 1], ['ronron', 'Ronron', 1.4],
    ['grr', 'Grr pour jouer', .5], ['atchoum', 'Atchoum', .4], ['roule', 'Elle se roule', .4]])},
  {id:'mimi-soins', titre:'Repas et soins', sons:liste([['croque', 'Elle croque', .6], ['lape', 'Elle lape', .7], ['friandise', 'Une friandise', .45],
    ['brosse', 'La brosse', .25], ['mousse', 'Mousse du bain', .3], ['secoue', 'Elle s’ébroue', .4], ['gratte', 'La litière', .6], ['photo', 'Clic, la photo', .2]])},
  {id:'mimi-cadeaux', titre:'Coffrets et jouets', sons:liste([['coffret', 'Le coffret posé', .55], ['ouvre', 'Le coffret s’ouvre', .9], ['debloque', 'Un nouveau soin', 1.1],
    ['laser', 'Le laser', .1], ['plume', 'La plume', .25], ['grelot', 'Balle à grelot', .4], ['clef', 'Remonter la souris', .45], ['couic', 'Couic !', .2],
    ['carton', 'Le carton', .2], ['herbe', 'L’herbe à chat', .6]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
