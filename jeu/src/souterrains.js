/* ==========================================================
   Brumeval — les sous-sols du village (la carte du Pisteur, lui seul la voit)
   « Lui, c'est vraiment le gars qui s'occupe des cartes. Il connaît tous les lieux.
     Dès qu'il explore et découvre, ça met à jour sa carte. »

   window.SOUTERRAINS = {
     lieux : les lieux « souterrains » (en plus, un lieu d'enquête peut porter souterrain:true dans E.lieux).
             Les fouiller ne coûte aucune action au Pisteur (M.fouilleGratuite, carte-jeu.js).
     elements : ce qu'on découvre sous le village. Chacun :
       id, enquete (l'enquête où il se découvre), revele (conditions, une seule suffit :
       les mêmes que partout, {vu:'pisteur:lieu:point'}, {code:'info:…'}…), et son type :
       - 'mystere' : un point d'interrogation (x, y, ic, nom, t = ce qu'il a senti ou vu ; on le touche pour relire) ;
       - 'salle'   : un endroit sous terre où l'on peut aller (lieu = id de E.lieux, qui s'ouvre quand on le touche) ;
       - 'entree'  : où l'on descend depuis la surface (x, y, ic, nom) ;
       - 'passage' : un tunnel qui relie (pts = la ligne, de : / a : ce qu'il relie ; bouche:true = éboulé ; escalier:true).
     Une découverte est gardée toute la saison (M.S.sousSols) et s'efface après une défaite (nouveau héros).

     Prévu pour les enquêtes 4 et plus (rien n'est encore branché, voir DESIGN-saison1.md, chapitre 8) :
     ecoute : grilles d'écoute {id, enquete, x, y, lieu, ecoute:id d'une écoute, revele} ;
     surveillance : {enquete:{moment:[{rue:[[x,y]…], qui:'silas'}]}} : rues gardées, seulement sur sa carte ;
     traces : {enquete:{moment:[{de:'lieu', a:'lieu', pts:[[x,y]…], qui}]}} : traces fraîches à suivre, seulement sur sa carte.
   }
   Positions en unités de la carte (1000 × 1400), comme Carte.LIEUX.
   ========================================================== */
(function(){
'use strict';
window.SOUTERRAINS = {
  lieux:['salle_coeur', 'tunnel_chene', 'tunnel_moulin', 'crypte', 'tunnel_puits'],
  elements:[
    /* Enquête 1 : deux mystères, rien de plus */
    {id:'q_chene', type:'mystere', enquete:1, x:286, y:186, ic:'❔', nom:'Sous le Vieux Chêne', revele:[{vu:'pisteur:chene:racines'}],
      t:'Entre les racines du Vieux Chêne, de l\'air froid sort de la terre… Il y a peut-être un trou, tout en dessous.'},
    {id:'q_puits', type:'mystere', enquete:1, x:118, y:352, ic:'❔', nom:'Au fond du puits', revele:[{vu:'pisteur:puits:grille'}],
      t:'Sous la grille rouillée, le puits descend tout noir. Jusqu\'où va-t-il ?'},
    /* Enquête 2 : les choses bizarres que le Pisteur a repérées (Romain, 5 novembre, 13 h 19 : « le Pisteur, il veut repérer les trucs
       bizarres ») ; le chemin des bûcherons, lui, est un chemin secret en surface (e2.js, E.chemins) */
    {id:'q_chene_trou', type:'mystere', enquete:2, x:322, y:226, ic:'🪨', nom:'Le trou du Vieux Chêne', revele:[{vu:'pisteur:chene:ouvriers'}, {vu:'pisteur:chene:rochers'}],
      t:'On a bouché le trou du Vieux Chêne avec de gros rochers bien rangés. De l\'air froid passe encore entre les pierres… Qu\'est-ce qu\'on veut cacher là-dessous ?'},
    {id:'q_moulin_porte', type:'mystere', enquete:2, x:812, y:440, ic:'🚪', nom:'Une porte cachée au moulin', revele:[{vu:'pisteur:moulin:guet'}, {vu:'pisteur:moulin:alambics'}],
      t:'La nuit, une porte cachée s\'est ouverte dans le mur du moulin, puis s\'est fondue dans le mur. Il y a une pièce cachée là-dedans !'},
    {id:'q_crypte', type:'mystere', enquete:2, x:700, y:640, ic:'🗝️', nom:'La crypte du clocher', revele:[{vu:'pisteur:moulin:suivre'}],
      t:'La nuit, l\'homme en cape noire du moulin est entré dans la crypte du clocher avec une clé, et a refermé à clé derrière lui. Qu\'y a-t-il en bas ?'},
    /* Enquête 2 : la crypte sous le clocher, dès que son passage est trouvé */
    {id:'entree_clocher', type:'entree', enquete:2, x:660, y:548, ic:'🔔', nom:'Le clocher', revele:[{code:'info:passage_crypte'}]},
    {id:'escalier_crypte', type:'passage', enquete:2, de:'entree_clocher', a:'crypte', escalier:true, pts:[[660,572],[668,600],[665,624]], revele:[{code:'info:passage_crypte'}]},
    {id:'crypte', type:'salle', enquete:2, lieu:'crypte', x:665, y:650, ic:'🕯️', nom:'La crypte', revele:[{code:'info:passage_crypte'}]},
    {id:'eboulis_crypte', type:'passage', enquete:2, de:'crypte', bouche:true, pts:[[640,672],[600,700],[562,722]], revele:[{vu:'pisteur:crypte:eboulement'}],
      t:'Un tas de pierres bouche le tunnel, vers le centre du village.'},
    /* Enquête 3 : le vieux tunnel, du pont au moulin */
    {id:'entree_pont', type:'entree', enquete:3, x:915, y:742, ic:'🌉', nom:'Le pont', revele:[{code:'info:passage_tunnel'}]},
    {id:'tunnel_pont_moulin', type:'passage', enquete:3, de:'entree_pont', a:'tunnel_moulin', pts:[[905,722],[884,640],[874,560],[864,486]], revele:[{code:'info:passage_tunnel'}]},
    {id:'tunnel_moulin', type:'salle', enquete:3, lieu:'tunnel_moulin', x:876, y:585, ic:'🕳️', nom:'Le vieux tunnel', revele:[{code:'info:passage_tunnel'}]},
    {id:'q_moulin', type:'mystere', enquete:3, x:852, y:448, ic:'🪨', nom:'Sous le moulin', revele:[{vu:'pisteur:tunnel_moulin:tunnel'}],
      t:'Au bout du tunnel, un éboulement. Juste au-dessus, de la terre toute fraîche : quelqu\'un a creusé sous le moulin !'}
  ],
  ecoute:[],
  surveillance:{},
  traces:{}
};
})();
