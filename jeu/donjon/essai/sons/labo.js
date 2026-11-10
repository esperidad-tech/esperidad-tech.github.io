/* Atelier des sons de Brumeval — les sons du labo d'analyses de l'Alchimiste (la paillasse vue de près).
   Leur code vient tel quel du labo du jeu (jeu/src/labo/15-sons.js, recopié par construire-sons.py
   dans EXTRAITS.labo) : ce qu'on entend ici est ce qu'on entend dans le jeu (enquête 1) et dans la maquette.
   Romain les a validés d'avance (10 novembre, 15 h 44 : « je te valide automatiquement les sons ; s'il y en a que je veux que
   tu refasses, j'irai te les cocher ») : ils sont marqués ✅, et il touche 🔁 « à refaire » sur ceux qu'il veut changer. */
(function(G){
'use strict';
var X = G.EXISTANTS = G.EXISTANTS || {}, E = G.EXTRAITS || {};
function labo(nom, duree){ return {chemin:'jeu', duree:duree, joue:function(J, S){ E.labo(function(){ return J.ctx; }, S)[nom](); }}; }
function liste(l){ return l.map(function(e){ X['l_' + e[0]] = labo(e[0], e[2]); return {id:'l_' + e[0], t:e[1], x:1, ok:1}; }); }
var section = {id:'mj-labo', titre:'Le labo d’analyses', sous:[
  {id:'labo-paillasse', titre:'La paillasse', sons:liste([['clic', 'Toucher', .15], ['choisir', 'Choisir l’objet', .25], ['non', 'Outil refusé', .3], ['zoom', 'On s’approche', .5], ['dezoom', 'On recule', .45], ['recule', 'Toucher à côté', .2]])},
  {id:'labo-loupe', titre:'Loupe et tiroirs', sons:liste([['loupe', 'La loupe', .85], ['tiroirOuvre', 'Tiroir ouvert', .5], ['tiroirFerme', 'Tiroir refermé', .45], ['casier', 'Un casier', .15], ['carte', 'Un échantillon', .15], ['compare', 'On compare', .75], ['bon', 'C’est le bon', .55], ['faux', 'Raté', .4]])},
  {id:'labo-bocaux', titre:'Bocaux et bougie', sons:liste([['pipette', 'La pipette', .15], ['goutte', 'La goutte', .2], ['chaud', 'L’eau chaude', .55], ['poudre', 'La poudre', .35], ['bulles', 'Petites bulles', .8], ['taches', 'La tache s’étale', .35], ['pince', 'La pince', .12], ['flamme', 'La flamme', 1.2]])},
  {id:'labo-micro', titre:'Le microscope', sons:liste([['molette', 'La molette', .3], ['tropPetit', 'Trop petit', .15], ['prise', 'Grain attrapé', .15], ['coupelle', 'Dans la coupelle', .2], ['acarien', 'L’acarien file', .25]])},
  {id:'labo-couleurs', titre:'Couleurs et code', sons:liste([['monte', 'La bandelette', 2.9], ['papier', 'Un témoin', .15], ['craie', 'La craie', .5]])},
  {id:'labo-mimi', titre:'Mimi', sons:liste([['miaou', 'Miaou', .5], ['ronron', 'Ronron', .85], ['saut', 'Il saute', .25], ['pose', 'Il se pose', .12]])}
]};
var mj = (G.CATALOGUE || []).filter(function(s){ return s.id === 'mj'; })[0];
if(mj) mj.sous.push(section);
})(window);
