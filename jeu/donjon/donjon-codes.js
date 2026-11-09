/* Les codes du prototype du donjon (CONCEPTION-DONJON.md §9) : un seul tableau, partagé par les trois pages
   (le donjon sur la tablette du Pisteur, donjon-sage.html, donjon-alchimiste.html).
   Les 12 symboles et leur ordre sont ceux du jeu (jeu/src/donnees.js : D.SYM, D.ORDRE_SYM).
   Chaque code ne marche qu'une fois (la page qui le reçoit s'en souvient).
   Ces codes ne valent que dans ces pages d'essai : ils ne touchent pas aux codes des enquêtes (gelés pour E1 et E2). */
(function(global){
'use strict';
var SYM = {
  lune:{e:'🌙', n:'Lune'}, etoile:{e:'⭐', n:'Étoile'}, soleil:{e:'☀️', n:'Soleil'},
  cle:{e:'🔑', n:'Clé'}, champi:{e:'🍄', n:'Champignon'}, poisson:{e:'🐟', n:'Poisson'},
  arbre:{e:'🌳', n:'Arbre'}, cloche:{e:'🔔', n:'Cloche'}, chapeau:{e:'🎩', n:'Chapeau'},
  coeur:{e:'❤️', n:'Cœur'}, flamme:{e:'🔥', n:'Flamme'}, chat:{e:'🐱', n:'Chat'}
};
var ORDRE = ['lune','etoile','soleil','cle','champi','poisson','arbre','cloche','chapeau','coeur','flamme','chat'];

/* de : la tablette qui AFFICHE le code ; a : la tablette où on le TAPE */
var CODES = {
  /* les pages blanches du Grand Livre (le Sage les affiche, le Pisteur les tape hors combat : sauvegarde) */
  'sauve:1':        {code:['lune','cle','arbre'],        de:'sage',       a:'pisteur',    nom:'Page blanche n° 1'},
  'sauve:2':        {code:['etoile','cloche','poisson'], de:'sage',       a:'pisteur',    nom:'Page blanche n° 2'},
  'sauve:3':        {code:['soleil','chapeau','champi'], de:'sage',       a:'pisteur',    nom:'Page blanche n° 3'},
  'sauve:4':        {code:['coeur','lune','flamme'],     de:'sage',       a:'pisteur',    nom:'Page blanche trouvée'},
  /* les plantes rares : le Pisteur les trouve, l'Alchimiste les cuisine au chaudron */
  'plante:givre':   {code:['poisson','lune','etoile'],   de:'pisteur',    a:'alchimiste', nom:'Fleur de givre'},
  'plante:lumiere': {code:['arbre','soleil','cloche'],   de:'pisteur',    a:'alchimiste', nom:'Herbes lumineuses'},
  /* les recettes sorties du chaudron : l'Alchimiste les affiche, le Pisteur les tape au feu de camp (ou hors combat) */
  'recette:givre':  {code:['champi','coeur','cle'],      de:'alchimiste', a:'pisteur',    nom:'Recette : Givre'},
  'recette:baumelum':{code:['chat','arbre','lune'],      de:'alchimiste', a:'pisteur',    nom:'Recette : Baume lumineux'},
  /* les trouvailles pour le Sage */
  'page:dechiree':  {code:['cle','flamme','poisson'],    de:'pisteur',    a:'sage',       nom:'La page déchirée du plan'},
  'page:blanche':   {code:['cloche','chat','soleil'],    de:'pisteur',    a:'sage',       nom:'Une page blanche'},
  'porte:odette':   {code:['chapeau','lune','coeur'],    de:'pisteur',    a:'sage',       nom:'Odette est derrière la porte'},
  /* la fin du donjon, pour le Barde */
  'leo:attrape':    {code:['etoile','arbre','flamme'],   de:'pisteur',    a:'barde',      nom:'Léo attrapé'}
};

var parCode = {};
Object.keys(CODES).forEach(function(id){ parCode[CODES[id].code.join('-')] = id; });

global.DONJON_CODES = {
  SYM:SYM, ORDRE:ORDRE, CODES:CODES,
  /* le code (tableau de 3 symboles) d'un id */
  code:function(id){ return CODES[id] ? CODES[id].code.slice() : null; },
  /* l'id d'une suite tapée, si elle est valable sur cette tablette (sinon null) */
  lire:function(seq, tablette){ var id = parCode[seq.join('-')]; return id && (!tablette || CODES[id].a === tablette) ? id : null; },
  /* le code en emojis, pour l'affichage */
  emojis:function(id){ return CODES[id] ? CODES[id].code.map(function(k){ return SYM[k].e; }).join(' ') : ''; }
};
})(typeof window !== 'undefined' ? window : this);
