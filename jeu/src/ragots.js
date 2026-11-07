/* ==========================================================
   Brumeval — les ragots de la taverne (une centaine).
   v : vrai (1) ou faux (0). Le joueur ne le saura jamais ragot par ragot.
   sur : les habitants dont parle le ragot (ils ne le racontent pas eux-mêmes).
   des : à partir de quelle enquête on l'entend. enq : piste de cette enquête seulement.
   ========================================================== */
(function(){
'use strict';
var R = [
  /* --- La vie du village (toujours) --- */
  {t:"Gaspard fait son pain la nuit, pendant que tout le monde dort.", v:1, sur:['gaspard']},
  {t:"Gaspard se lève à trois heures du matin pour allumer son four.", v:1, sur:['gaspard']},
  {t:"Gaspard a toujours chaud, même en plein hiver, à cause de son four.", v:1, sur:['gaspard']},
  {t:"Gaspard ne mange jamais de pain : il trouve ça trop sec.", v:0, sur:['gaspard']},
  {t:"Gaspard a inventé une brioche au miel que tout le village adore.", v:1, sur:['gaspard']},
  {t:"Gaspard a un four si grand qu'on pourrait y faire cuire une vache.", v:0, sur:['gaspard']},
  {t:"Odette a sept chats, et elle connaît le nom de chacun.", v:1, sur:['odette']},
  {t:"Odette a douze chats, dont un qui sait parler.", v:0, sur:['odette']},
  {t:"Odette marche avec une canne, mais elle court plus vite que tout le monde.", v:0, sur:['odette']},
  {t:"Odette a été la maîtresse d'école de presque tout le village.", v:1, sur:['odette']},
  {t:"Odette cache des bonbons dans sa canne creuse.", v:0, sur:['odette']},
  {t:"Les chats d'Odette se retrouvent la nuit sur la place, autour de la fontaine.", v:1, sur:['odette']},
  {t:"Le maire ne retire jamais ses gants, même pour manger sa soupe.", v:1, sur:['grosbec']},
  {t:"Le maire a un portrait de lui-même dans chaque pièce de la mairie.", v:0, sur:['grosbec']},
  {t:"Le maire collectionne les cuillères en argent.", v:0, sur:['grosbec']},
  {t:"Victor le facteur connaît l'adresse de tout le monde par cœur.", v:1, sur:['victor']},
  {t:"Victor a perdu tout son sac de lettres dans la rivière, la semaine dernière.", v:0, sur:['victor']},
  {t:"Victor distribue le courrier même sous la neige.", v:1, sur:['victor']},
  {t:"Victor écrit des poèmes en cachette, le soir.", v:1, sur:['victor']},
  {t:"Victor a peur des chiens, même des tout petits.", v:1, sur:['victor']},
  {t:"Victor ne sait pas lire : il reconnaît les lettres à leur odeur.", v:0, sur:['victor']},
  {t:"Anselme sonne la cloche tous les jours à midi pile.", v:1, sur:['anselme']},
  {t:"Anselme est devenu un peu sourd, à force de sonner les cloches.", v:1, sur:['anselme']},
  {t:"Anselme dort dans le clocher, couché à côté de la cloche.", v:0, sur:['anselme']},
  {t:"Anselme connaît le nombre exact de marches du clocher : cent douze.", v:1, sur:['anselme']},
  {t:"Anselme a appris à sonner la cloche avec ses pieds.", v:0, sur:['anselme']},
  {t:"Iris ramasse ses plantes à l'aube, quand la rosée est encore là.", v:1, sur:['iris']},
  {t:"Iris a des ruches derrière l'herboristerie.", v:1, sur:['iris']},
  {t:"Iris peut guérir n'importe quelle maladie avec une seule fleur.", v:0, sur:['iris']},
  {t:"Iris a un chaudron qui fait des bulles tout seul, même sans feu.", v:0, sur:['iris']},
  {t:"Basile parle à ses légumes pour qu'ils poussent mieux.", v:1, sur:['basile']},
  {t:"Basile a fait pousser une citrouille grosse comme une maison.", v:0, sur:['basile']},
  {t:"Basile a un cochon qui s'échappe tout le temps du potager.", v:1, sur:['basile']},
  {t:"Basile a gagné le concours de la plus grosse carotte trois années de suite.", v:1, sur:['basile']},
  {t:"Basile a peur des abeilles et ne s'approche jamais des fleurs.", v:0, sur:['basile']},
  {t:"Margot connaît toutes les chansons du village.", v:1, sur:['margot']},
  {t:"Margot met du sel dans la limonade pour qu'on ait encore plus soif.", v:0, sur:['margot']},
  {t:"Margot ne ferme jamais la taverne avant minuit.", v:1, sur:['margot']},
  {t:"Margot a été pirate quand elle était jeune.", v:0, sur:['margot']},
  {t:"Margot sait quand quelqu'un ment, rien qu'en le regardant.", v:0, sur:['margot']},
  {t:"Farinel chante en travaillant, on l'entend jusqu'au pont.", v:1, sur:['farinel']},
  {t:"Farinel porte des sabots si lourds qu'il ne peut pas courir.", v:0, sur:['farinel']},
  {t:"Farinel fait la meilleure farine de toute la vallée.", v:1, sur:['farinel']},
  {t:"Farinel a peur du noir et dort avec trois bougies.", v:0, sur:['farinel']},
  {t:"Mélusine a les doigts les plus agiles du village.", v:1, sur:['melusine']},
  {t:"Mélusine a tricoté une écharpe de cent mètres pour le maire.", v:0, sur:['melusine', 'grosbec']},
  {t:"Le moulin est le plus vieux bâtiment de Brumeval.", v:1},
  {t:"Le pont grince toujours la veille d'un jour de pluie.", v:1},
  {t:"La rivière gèle tous les hivers, et les enfants y font des glissades.", v:1},
  {t:"Le puits de la place n'a pas de fond.", v:0},
  {t:"Il y a un coffre de pièces d'or au fond de la rivière.", v:0},
  {t:"La brume autour de Brumeval ne se lève jamais complètement.", v:1},
  {t:"Le soir de la Fête des Lanternes, il neige des flocons dorés.", v:0},
  {t:"Toutes les lanternes du village s'allument grâce à la Lanterne d'Or.", v:1},
  {t:"Le pont a été construit par les fondateurs du village.", v:1},
  {t:"Les fondateurs de Brumeval ont planté le Vieux Chêne de leurs mains.", v:0, des:2},
  {t:"La fontaine de la place donne de la limonade une fois par an.", v:0},

  /* --- Ce que tout le monde a appris après une enquête --- */
  {t:"Tim a pris la Lanterne d'Or pour retrouver son chien perdu.", v:1, sur:['tim'], des:2},
  {t:"Tim voulait vendre la Lanterne d'Or à un marchand.", v:0, sur:['tim'], des:2},
  {t:"Le chien de Tim s'appelle Pirate.", v:1, sur:['tim'], des:2},
  {t:"Tim est le plus jeune ramoneur de toute la région.", v:1, sur:['tim'], des:2},
  {t:"Tim a passé toute une nuit dans la forêt, avec son chien.", v:1, sur:['tim'], des:2},
  /* (plus de Corbeau : les ragots de l'ancienne histoire sont retirés, Romain, 4 novembre) */
  {t:"Le maire a une armoire pleine de gants, tous pareils.", v:1, sur:['grosbec'], des:2},
  {t:"Le Vieux Chêne a plus de cinq cents ans.", v:1, des:2},
  {t:"Il y a un énorme trou sous les racines du Vieux Chêne.", v:1, des:2},
  {t:"Le maire a fait couvrir le trou du Vieux Chêne avec de grosses planches.", v:1, sur:['grosbec'], des:2},
  {t:"Au fond du trou du Vieux Chêne, il y a un dragon qui dort.", v:0, des:2},
  {t:"Fortuné vend de tout : des chapeaux, des pastilles et même des lanternes.", v:1, sur:['fortune'], des:3},
  {t:"Fortuné cherchait un trésor sous le moulin.", v:1, sur:['fortune'], des:4},
  {t:"Fortuné a trouvé un coffre rempli d'or sous le moulin.", v:0, sur:['fortune'], des:4},
  {t:"Silas, le garde, écrit tout ce qu'il voit dans un petit carnet noir.", v:1, sur:['silas'], des:4},
  {t:"Sous le moulin, il y a une pierre gravée de quatre symboles.", v:1, des:4},
  {t:"Le maire a gardé pour lui la clé de la trappe du moulin.", v:1, sur:['grosbec'], des:4},

  /* --- Enquête 1 : la Lanterne d'Or --- */
  {t:"Hier soir, on a entendu un chien pleurer du côté de la forêt.", v:1, enq:1},
  {t:"Cette nuit, une petite lumière dorée a dansé entre les arbres de la forêt.", v:1, enq:1},
  {t:"Avant le lever du soleil, quelqu'un de tout petit a couru vers la forêt.", v:1, enq:1},
  {t:"Entre les racines du Vieux Chêne, il y a un trou assez grand pour s'y cacher.", v:1, enq:1},
  {t:"Quelqu'un a laissé une petite écuelle d'eau à la lisière de la forêt.", v:1, enq:1},
  {t:"La Lanterne d'Or a été jetée au fond du puits.", v:0, enq:1},
  {t:"Gaspard a caché la Lanterne dans son four pour faire fondre l'or.", v:0, sur:['gaspard'], enq:1},
  {t:"Basile a enterré la Lanterne au fond de son potager.", v:0, sur:['basile'], enq:1},
  {t:"Victor a emporté la Lanterne dans son sac de facteur.", v:0, sur:['victor'], enq:1},
  {t:"La Lanterne est cachée là-haut, sur les toits du village.", v:0, enq:1},
  {t:"Cette nuit, le moulin a brillé d'une drôle de lumière dorée.", v:0, enq:1},
  {t:"Mélusine avait besoin de la Lanterne pour finir ses écharpes de la fête.", v:0, sur:['melusine'], enq:1},

  /* --- Enquête 2 : la rivière rouge (§ 12.11 : des ragots drôles, plus aucun ragot du Corbeau) --- */
  {t:"Un ours a emporté Odette dans la forêt pour qu'elle lui tricote un pull.", v:0, sur:['odette'], enq:2},
  {t:"Les poissons de la rivière ont rougi de honte.", v:0, enq:2},
  {t:"Le meunier a renversé toute sa confiture de fraises dans la rivière.", v:0, sur:['farinel'], enq:2},
  {t:"C'est le vin de la taverne qui a coulé dans la rivière et l'a rendue rouge.", v:0, sur:['margot'], enq:2},
  {t:"Cette nuit, Mélusine a teint toutes ses robes en rouge dans la rivière.", v:0, sur:['melusine'], enq:2},
  {t:"La rivière va rester rouge pour toujours, maintenant.", v:0, enq:2},
  {t:"Le Vieux Chêne s'est écroulé tout seul, d'un coup, dans un grand boum.", v:0, enq:2},
  {t:"Ce matin, à l'aube, la rivière était déjà toute rouge.", v:1, enq:2},
  {t:"Ce matin, Odette n'est pas venue chercher son pain à la boulangerie.", v:1, sur:['odette', 'gaspard'], enq:2},
  {t:"Quelqu'un a rasé tout le champ de coquelicots d'Iris.", v:1, sur:['iris'], enq:2},
  {t:"Le chemin du Vieux Chêne est gardé jour et nuit par le garde.", v:1, sur:['silas'], enq:2},
  {t:"Un homme en cape noire, avec un grand capuchon, a fait des achats au village.", v:1, enq:2},
  {t:"Le maire dit que la rivière rouge, c'est une mauvaise farce.", v:1, sur:['grosbec'], enq:2},
  {t:"L'eau du lavoir est devenue toute rose, comme un bonbon.", v:1, enq:2},

  /* --- Enquête 3 : les feux du moulin --- */
  {t:"La nuit, des lumières vertes entrent dans le moulin… et n'en ressortent pas.", v:1, enq:3},
  {t:"On a trouvé des tas de terre toute fraîche sous le pont.", v:1, enq:3},
  {t:"Un client de la taverne laisse de la poussière grise partout dans l'escalier.", v:1, enq:3},
  {t:"Cette semaine, quelqu'un a acheté des outils pour creuser.", v:1, enq:3},
  {t:"La nuit, on entend des coups sourds sous le moulin, comme si on tapait dans la terre.", v:1, enq:3},
  {t:"Un homme masqué a vendu une vieille carte à quelqu'un du village.", v:1, enq:3},
  {t:"Les lumières vertes du moulin, ce sont les fantômes des anciens meuniers.", v:0, enq:3},
  {t:"Farinel vend sa farine en cachette à un autre village.", v:0, sur:['farinel'], enq:3},
  {t:"Gaspard prend la farine la nuit pour ne pas avoir à la payer.", v:0, sur:['gaspard'], enq:3},
  {t:"La farine volée est cachée dans la grange du moulin.", v:0, enq:3},
  {t:"Les lumières vertes viennent d'une lanterne magique d'Iris.", v:0, sur:['iris'], enq:3},
  {t:"Le nouveau garde fait ses rondes les yeux fermés.", v:0, sur:['silas'], enq:3}
];
/* Qui raconte : les habitants qui vont à la taverne (et depuis quand ils sont au village). */
var CONTEURS = [
  {id:'margot'}, {id:'basile'}, {id:'farinel'}, {id:'anselme'}, {id:'victor'}, {id:'iris'},
  {id:'odette', jusqua:1}, {id:'gaspard'},   /* Odette a disparu à partir de l'enquête 2 : elle ne raconte plus rien à la taverne */ {id:'melusine'}, {id:'tim', des:2}, {id:'fortune', des:2}, {id:'silas', des:3}
];
/* Deux listes : la vie du village (et ce qu'on a appris des enquêtes passées), et les pistes de chaque enquête. */
var ENQ = {};
R.forEach(function(r){ if(r.enq) (ENQ[r.enq] = ENQ[r.enq] || []).push(r); });
window.RAGOTS = {village:R.filter(function(r){ return !r.enq; }), enquete:ENQ, liste:R, conteurs:CONTEURS};
})();
