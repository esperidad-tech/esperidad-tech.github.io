/* ==========================================================
   Brumeval — ce que les habitants disent EN PLUS quand le Barde
   essaie de les démasquer (jeu « Repérer le mensonge »).
   Trois listes :
     - vie      : la vie de tous les jours (vrai ou faux, v)
     - enquete[n].vrai       : des choses vraies sur l'enquête (vagues, jamais le coupable)
     - enquete[n].embrouille : des contre-vérités sur l'enquête (des MENSONGES qui brouillent la piste)
   sur : les habitants dont parle la phrase (ils ne la disent pas eux-mêmes).
   ========================================================== */
(function(){
'use strict';
window.REPLIQUES = {
  vie:[
    {t:"Je vais à la taverne presque tous les soirs.", v:1},
    {t:"La Fête des Lanternes, c'est mon moment préféré de l'année.", v:1},
    {t:"Je connais Brumeval depuis que je suis tout petit.", v:1, sur:['fortune', 'silas']},
    {t:"Je n'aime pas la brume : elle me donne froid jusqu'aux os.", v:1},
    {t:"Le pain de Gaspard est le meilleur de toute la vallée.", v:1, sur:['gaspard']},
    {t:"Quand il y a du vent, je dors très mal.", v:1},
    {t:"Les chats d'Odette viennent souvent dormir devant ma porte.", v:1, sur:['odette']},
    {t:"J'ai un petit carré de fleurs derrière chez moi.", v:1},
    {t:"Le dimanche, je vais me promener jusqu'au pont.", v:1},
    {t:"Je n'ai jamais mis les pieds à la taverne de toute ma vie.", v:0},
    {t:"Je me couche tous les soirs à six heures pile, avant même le dîner.", v:0},
    {t:"Le maire est mon meilleur ami : il me raconte tous ses secrets.", v:0, sur:['grosbec']},
    {t:"Je n'ai jamais goûté une brioche de ma vie.", v:0},
    {t:"Je sais tenir sous l'eau pendant une heure entière.", v:0},
    {t:"J'ai déjà traversé la brume à pied, aller et retour, sans me perdre.", v:0},
    {t:"Je n'ai jamais entendu sonner la cloche du village.", v:0, sur:['anselme']}
  ],
  enquete:{
    1:{
      vrai:[
        {t:"Hier soir, j'ai entendu un chien aboyer, très loin, du côté de la forêt."},
        {t:"Cette nuit, j'ai vu une petite lumière bouger entre les arbres."},
        {t:"Le Vieux Chêne a des racines énormes : on pourrait presque se cacher dessous."},
        {t:"Avant l'aube, j'ai entendu de tout petits pas pressés dans la rue."},
        {t:"La porte de la mairie ferme mal, tout le monde le sait."},
        {t:"Le maire ne prêtait jamais sa Lanterne, à personne.", sur:['grosbec']}
      ],
      embrouille:[
        {t:"J'ai vu Gaspard sortir de la mairie en pleine nuit, avec un gros sac.", sur:['gaspard']},
        {t:"La Lanterne ? Elle est au fond du puits, j'en suis sûr.", sur:[]},
        {t:"Cette nuit, quelqu'un marchait sur les toits avec une lumière dorée."},
        {t:"Basile creusait un grand trou dans son potager cette nuit.", sur:['basile']},
        {t:"Victor est passé à la mairie à minuit, avec son sac de facteur.", sur:['victor']},
        {t:"Le moulin brillait comme de l'or toute la nuit."},
        {t:"Mélusine m'a dit qu'il lui fallait une belle lumière pour travailler la nuit.", sur:['melusine']},
        {t:"C'est un voleur venu d'un autre village : il est déjà loin.", sur:[]},
        {t:"Odette voulait la Lanterne pour éclairer ses chats.", sur:['odette']}
      ]
    },
    2:{
      vrai:[
        {t:"Les lettres arrivent toujours la nuit, jamais le jour."},
        {t:"La dernière lettre du Corbeau est pleine de drôles de symboles."},
        {t:"Cette semaine, le colporteur vendait des plumes noires.", sur:['fortune']},
        {t:"Quelqu'un au village doit beaucoup d'argent, ça se murmure."},
        {t:"Le soir, on voit parfois une silhouette avec une cape près du lavoir."},
        {t:"La grosse cloche sonne un peu bizarrement en ce moment.", sur:['anselme']}
      ],
      embrouille:[
        {t:"Le Corbeau, c'est un vrai oiseau : je l'ai vu glisser une lettre avec son bec !"},
        {t:"Odette sort la nuit avec une grande cape noire, je l'ai vue.", sur:['odette']},
        {t:"Victor lit toutes les lettres avant de les distribuer.", sur:['victor']},
        {t:"Le Corbeau va frapper au puits : c'est écrit dans sa dernière lettre."},
        {t:"La silhouette en cape était immense, au moins deux mètres !"},
        {t:"Les lettres du Corbeau sentent le pain chaud, comme chez Gaspard.", sur:['gaspard']},
        {t:"Margot cache une plume noire derrière son comptoir.", sur:['margot']},
        {t:"Le Corbeau prépare un mauvais coup à la mairie, cette nuit."},
        {t:"Anselme a perdu la clé du clocher depuis des années.", sur:['anselme']}
      ]
    },
    3:{
      vrai:[
        {t:"Les lumières du moulin sont vertes, pas jaunes comme une bougie."},
        {t:"Le matin, il manque toujours un sac de farine. Jamais deux."},
        {t:"La nuit, on entend des coups sourds du côté du moulin."},
        {t:"Il y a de la terre fraîche sous le pont : avant, il n'y en avait pas."},
        {t:"Le moulin est plein de vieux recoins : c'est le plus vieux bâtiment du village."},
        {t:"Il paraît qu'un homme masqué a vendu une vieille carte à quelqu'un d'ici."}
      ],
      embrouille:[
        {t:"Ce sont les fantômes des anciens meuniers qui allument ces lumières."},
        {t:"Farinel vend sa farine en cachette à un autre village.", sur:['farinel']},
        {t:"Gaspard prend la farine la nuit, pour ne pas avoir à la payer.", sur:['gaspard']},
        {t:"La farine volée est cachée dans la grange, sous la paille."},
        {t:"Les lumières vertes viennent d'une lanterne magique d'Iris.", sur:['iris']},
        {t:"Le nouveau garde a les sacs de farine chez lui.", sur:['silas']},
        {t:"Les voleurs arrivent en barque par la rivière, derrière la roue."},
        {t:"Basile nourrit son cochon avec la farine volée.", sur:['basile']},
        {t:"Margot fait des crêpes toutes les nuits. Avec quelle farine, hein ?", sur:['margot']}
      ]
    }
  }
};
/* Ajoute aux répliques d'un habitant 1 à 3 phrases de plus, au hasard :
   une chose vraie (sur l'enquête ou la vie du village), et souvent une contre-vérité qui embrouille. */
window.REPLIQUES.completer = function(rep, qui, enq){
  var B = window.REPLIQUES, E = B.enquete[enq] || {vrai:[], embrouille:[]};
  function ok(r){ return (r.sur || []).indexOf(qui) < 0 && !rep.some(function(x){ return x.texte === r.t; }); }
  function pioche(l){ l = l.filter(ok); return l.length ? l[Math.floor(Math.random() * l.length)] : null; }
  var plus = [];
  var a = Math.random() < .6 ? pioche(E.vrai) : pioche(B.vie);
  if(a) plus.push({texte:a.t, ment:a.v === 0, ajout:true});
  if(Math.random() < .65){ var b = pioche(E.embrouille); if(b) plus.push({texte:b.t, ment:true, ajout:true, embrouille:true}); }
  while(rep.length + plus.length < 4){
    var c = pioche(B.vie.filter(function(r){ return !plus.some(function(x){ return x.texte === r.t; }); }));
    if(!c) break; plus.push({texte:c.t, ment:c.v === 0, ajout:true});
  }
  var tout = rep.slice();
  plus.forEach(function(x){ tout.splice(Math.floor(Math.random() * (tout.length + 1)), 0, x); });
  return tout;
};
})();
