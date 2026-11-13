/* ==========================================================
   Brumeval — les écritures de l'enquête 3 : UNE SEULE SOURCE, pour le labo de l'Alchimiste et pour le Grand Livre du Sage
   (Romain, 13 novembre : le Livre d'or « directement dans le Grand Livre du Sage » ; « l'Alchimiste ne le trouvait pas »)

   · ech : les douze mots du Livre d'or de la fête. l : les lignes ; trois signes se regardent de près — M (un « M » pointu comme des
     dents de scie ; sinon rond comme deux collines), t (la barre du « t » en longue vague ; sinon le petit trait droit), i (un petit
     rond vide sur le « i » ; sinon un point plein). Le reste fait le caractère de chacun : taille, penche (0 : toute droite), gras,
     deco (une petite fleur, de la farine, des pâtés d'encre). tard : il n'a pas encore signé le matin (le Sage ne peut donner le
     livre à l'Alchimiste que l'après-midi, quand tout le monde a signé).
   · La lettre « d'Odette » a les trois signes. DEUX femmes les ont aussi : Mélusine et Margot (Romain : « ça accusait deux femmes,
     et après on devait trouver laquelle était la bonne » ; Bible §13.31, étape 8). Victor, Fortuné et Iris n'en ont qu'un ou deux.
   · odette : la vraie écriture d'Odette (son carnet) — très penchée, un petit chat à côté de ses « O », et AUCUN des trois signes.
     fausse : la lettre, écrite « à la manière d'Odette » (penchée, les petits chats)… mais la main de celle qui l'a écrite se voit :
     les « M », les « t », les « i ». Le Sage compare les deux de ses yeux, sans qu'aucun texte le lui dise.
   Chargé par le jeu (build.py, avant ecritures.js) ET par la page du labo (src/labo/, avant 30-donnees.js).
   ========================================================== */
(function(G){
G.ECRITURES = {
  ech:{
    melusine:{nom:'Mélusine', l:['Mille bisous,', 'Odette, vite !'], M:1, t:1, i:1, tard:1},
    victor:{nom:'Victor', l:['Bien à vous,', 'Madame Odette.'], M:1, i:1, penche:0},
    fortune:{nom:'Fortuné', l:['Mes amitiés !', 'Bon retour.'], M:1, t:1, penche:.2, tard:1},
    iris:{nom:'Iris', l:['Mes iris', 't\'attendent.'], i:1, deco:'fleur', penche:.08},
    margot:{nom:'Margot', l:['Vite, vite,', 'Madame Odette !'], M:1, t:1, i:1, penche:.16, tard:1},
    gaspard:{nom:'Gaspard', l:['Ma brioche', 't\'attend !'], deco:'farine', gras:1},
    basile:{nom:'Basile', l:['Vive les', 'lampions !'], taille:1.3, gras:1, penche:.04},
    tim:{nom:'Tim', l:['Reviens', 'vite !'], deco:'pates', penche:-.08, taille:1.1},
    silas:{nom:'Silas', l:['BON RETOUR.', 'SILAS.'], penche:0, gras:1, taille:.92},
    farinel:{nom:'Farinel', l:['Le moulin', 't\'attend.'], penche:.5, deco:'farine', tard:1},
    anselme:{nom:'Anselme', l:['DONG !'], taille:1.5, gras:1, penche:0},
    maire:{nom:'le maire', l:['Bienvenue chez toi,', 'Odette.'], taille:.62, penche:.24}
  },
  ordre:['gaspard', 'victor', 'iris', 'basile', 'fortune', 'silas', 'tim', 'melusine', 'farinel', 'margot', 'anselme', 'maire'],
  /* la lettre, telle qu'on la voit sous la loupe du labo : quelques mots, et les trois signes de celle qui l'a écrite */
  lettre:{l:['Monsieur le maire,', 'je suis partie…', 'Odette'], M:1, t:1, i:1, penche:.3, encre:'#17151c', papier:'#f3ead2', lettre:true},
  /* celles qui écrivent comme la lettre (le labo : « deux écritures ») */
  bons:['melusine', 'margot'],
  odette:{penche:.3, chatO:1},
  fausse:{penche:.3, chatO:1, M:1, t:1, i:1}
};
})(typeof window !== 'undefined' ? window : this);
