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
  /* la rune de lumière du Sage : le Pisteur la trouve au fond du puits (sans elle, pas d'encre invisible sur le plan) */
  'rune:lumiere':   {code:['flamme','etoile','cle'],     de:'pisteur',    a:'sage',       nom:'La rune de lumière'},
  /* les trouvailles pour le Sage */
  'page:dechiree':  {code:['cle','flamme','poisson'],    de:'pisteur',    a:'sage',       nom:'La page déchirée du plan'},
  'page:blanche':   {code:['cloche','chat','soleil'],    de:'pisteur',    a:'sage',       nom:'Une page blanche'},
  'porte:odette':   {code:['chapeau','lune','coeur'],    de:'pisteur',    a:'sage',       nom:'Un chat gratte à la porte'},
  /* le carnet de l'aventurier, trouvé à l'entrée du donjon (Romain, 11 novembre) : c'est lui que le Sage feuillette */
  'carnet:aventurier': {code:['chapeau','arbre','poisson'], de:'pisteur', a:'sage', nom:'Le carnet de l’aventurier'},
  /* l'étude des monstres (Romain, 10 novembre) : le Sage étudie un monstre en combat, son code entre dans le journal du
     Pisteur ; tapé sur la tablette du Sage, il décolle la page de ce monstre dans le carnet de l'aventurier */
  'etude:rat':         {code:['chat','champi','etoile'],    de:'pisteur', a:'sage', nom:'Étude : le rat d’égout'},
  'etude:ratcuir':     {code:['cle','chapeau','flamme'],    de:'pisteur', a:'sage', nom:'Étude : le rat cuirassé'},
  'etude:chauvesouris':{code:['lune','cloche','champi'],    de:'pisteur', a:'sage', nom:'Étude : la chauve-souris de la brume'},
  'etude:feufollet':   {code:['flamme','soleil','lune'],    de:'pisteur', a:'sage', nom:'Étude : le feu follet'},
  'etude:araignee':    {code:['arbre','chat','coeur'],      de:'pisteur', a:'sage', nom:'Étude : l’araignée des caves'},
  'etude:tetard':      {code:['poisson','chapeau','etoile'],de:'pisteur', a:'sage', nom:'Étude : le têtard du puits'},
  'etude:roirats':     {code:['coeur','chat','cloche'],     de:'pisteur', a:'sage', nom:'Étude : le Roi des rats'},
  'etude:gardien':     {code:['cloche','cle','soleil'],     de:'pisteur', a:'sage', nom:'Étude : le Gardien de rouille'},
  'etude:bourbe':      {code:['poisson','soleil','chapeau'],de:'pisteur', a:'sage', nom:'Étude : Bourbe'},
  /* la fin du donjon, pour le Barde */
  'leo:attrape':    {code:['etoile','arbre','flamme'],   de:'pisteur',    a:'barde',      nom:'Léo attrapé'},
  /* le branchement dans l'enquête 3 (12 novembre ; Bible §13.14, étape 6) : les mêmes symboles que dans l'enquête
     (jeu/src/codes-fixes.js, enquête 3 ; jeu/tools/e3-donjon-codes.js vérifie que les deux fichiers disent la même chose).
     · le maire n'a pas été retenu : Léo file au bruit de ses pas (à la place de « Léo attrapé ») ;
     · le Barde, resté à la fête, donne deux codes au Pisteur, qui les tape ici : la Grosse Marie (toute la vie des trois héros
       revient, une fois, hors combat) et « Le maire est retenu » (à taper avant la dernière salle). */
  'leo:enfui':      {code:['lune','flamme','chat'],      de:'pisteur',    a:'barde',      nom:'Léo s’est enfui'},
  'grosse:marie':   {code:['cloche','cloche','lune'],    de:'barde',      a:'pisteur',    nom:'La Grosse Marie'},
  'maire:retenu':   {code:['chapeau','cle','chapeau'],   de:'barde',      a:'pisteur',    nom:'Le maire est retenu'}
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
