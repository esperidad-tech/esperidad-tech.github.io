/* Atelier des sons de Brumeval — le catalogue : des sections qu'on ouvre et qu'on ferme, imbriquées.
   Un son : {id, t:'titre court', v:'ABC'} (les versions), et son genre :
     (rien) un bruitage (BRUITAGES[id + lettre]) ; m:1 une musique en boucle (MUSIQUES[id + lettre]) ;
     c:1 une couleur de salle, jouée par-dessus le fond du donjon ; salles:1 les trois couleurs déjà choisies ;
     x:'clé' un son déjà dans le jeu (EXISTANTS), joué à l'identique.
   Le statut se calcule tout seul : ✅ si Romain a déjà choisi (table CHOIX du jeu), 🎮 pour les sons du jeu, 🆕 sinon.
   chaines : des enchaînements à écouter (avec les versions cochées), sans case à cocher. */
window.CATALOGUE = [
  {id:'donjon', titre:'Donjon', sous:[
    {id:'heros', titre:'Héros', sous:[
      {id:'h-arc', titre:'Arc et flèches', sons:[
        {id:'arc', t:'L’arc', v:'ABC'}, {id:'vol', t:'Flèche en vol', v:'ABC'}, {id:'chairF', t:'Dans la chair', v:'ABC'}, {id:'bois', t:'Dans le bois', v:'ABC'},
        {id:'flecheArgent', t:'Flèche d’argent', v:'AB'}, {id:'flecheLourde', t:'Flèche lourde', v:'AB'}
      ], chaines:[
        {t:'Tir complet', etapes:[{id:'arc', apres:'moment'}, {id:'vol', apres:'duree'}, {id:'chairF'}, {id:'ratFleche', decal:.02}]},
        {t:'Tir raté', etapes:[{id:'arc', apres:'moment'}, {id:'vol', apres:'duree'}, {id:'bois'}]}
      ]},
      {id:'h-dague', titre:'La dague', sons:[
        {id:'swish', t:'Le swish', v:'ABC'}, {id:'chairD', t:'Dans la chair', v:'ABC'}, {id:'metal', t:'Sur le métal', v:'ABC'}
      ], chaines:[
        {t:'Coup complet', etapes:[{id:'swish', apres:'moment'}, {id:'chairD'}, {id:'ratDague', decal:.01}]},
        {t:'Sur une armure', etapes:[{id:'swish', apres:'moment'}, {id:'metal'}]}
      ]},
      {id:'h-critique', titre:'Coup critique', sons:[{id:'ratCritique', t:'Coup critique', v:'ABC'}]},
      {id:'h-potions', titre:'Les potions', sons:[
        {id:'potGivre', t:'Givre', v:'AB'}, {id:'potAcide', t:'Acide', v:'AB'}, {id:'potHuile', t:'Huile', v:'AB'}, {id:'potColle', t:'Colle', v:'AB'},
        {id:'s_potion', t:'Potion lancée', x:1}
      ]},
      {id:'h-sage', titre:'Le Sage', sons:[
        {id:'cristal', t:'Cristal de lune', v:'AB'}, {id:'baton', t:'Bâton de chêne', v:'AB'},
        {id:'s_page', t:'Il étudie', x:1}, {id:'s_magie', t:'Rune de lumière', x:1}, {id:'s_dome', t:'Le bouclier', x:1}, {id:'s_absorbe', t:'Bouclier mordu', x:1}
      ]},
      {id:'h-soins', titre:'Soins et chutes', sons:[
        {id:'amulette', t:'Amulette de vie', v:'AB'}, {id:'s_soin', t:'Un soin', x:1}, {id:'s_coeur', t:'Cœur vaillant', x:1}, {id:'s_tombe', t:'Un héros tombe', x:1}
      ]},
      {id:'h-combat', titre:'Le combat', sons:[
        {id:'icone', t:'Toucher une icône', v:'ABC'}, {id:'rebond', t:'Ça rebondit', v:'ABC'}, {id:'faible', t:'Point faible ouvert', v:'AB'},
        {id:'s_clic', t:'Choisir', x:1}, {id:'s_pasHeros', t:'Entrée des héros', x:1}, {id:'victoire', t:'Victoire', v:'AB'}, {id:'fuite', t:'Fuite', v:'AB'}
      ]}
    ]},
    {id:'ennemis', titre:'Ennemis', sous:[
      {id:'e-rat', titre:'Rat d’égout', sons:[
        {id:'s_rats', t:'Ils arrivent', x:1}, {id:'s_couine', t:'Il couine', x:1}, {id:'s_morsure', t:'Il mord', x:1}, {id:'s_brule', t:'Il brûle', x:1},
        {id:'ratFleche', t:'Par la flèche', v:'ABC'}, {id:'ratDague', t:'Par la dague', v:'ABC'}, {id:'ratFeu', t:'Par le feu', v:'ABC'},
        {id:'ratLumiere', t:'Par la lumière', v:'ABC'}, {id:'ratLouche', t:'Par la louche', v:'ABC'}, {id:'ratColle', t:'Dans la colle', v:'ABC'},
        {id:'ratHuile', t:'Sur l’huile', v:'ABC'}, {id:'ratNuage', t:'Dans le nuage', v:'ABC'}, {id:'ratFuite', t:'Sa fuite', v:'ABC'}
      ]},
      {id:'e-cuir', titre:'Rat cuirassé', sons:[
        {id:'cuirCri', t:'Son grognement', v:'ABC'}, {id:'cuirTouche', t:'Touché', v:'AB'}, {id:'cuirCasque', t:'Casque qui tombe', v:'AB'}, {id:'cuirFin', t:'Fuite ou chute', v:'AB'}
      ]},
      {id:'e-arai', titre:'Araignée des caves', sons:[
        {id:'araiCri', t:'Son cri', v:'ABC'}, {id:'araiToile', t:'Toile projetée', v:'AB'}, {id:'araiTouche', t:'Touchée', v:'AB'}, {id:'araiMort', t:'Défaite', v:'AB'}
      ]},
      {id:'e-petite', titre:'Petite araignée', sons:[
        {id:'petiteCri', t:'Son cri', v:'AB'}, {id:'petiteTouche', t:'Touchée', v:'AB'}, {id:'petiteMort', t:'Défaite', v:'AB'}
      ]},
      {id:'e-chauve', titre:'Chauve-souris', sons:[
        {id:'chauveCri', t:'Son cri', v:'ABC'}, {id:'chauveAiles', t:'Ses ailes', v:'AB'}, {id:'chauvePique', t:'Le piqué', v:'AB'}, {id:'chauveTouche', t:'Touchée', v:'AB'}, {id:'chauveMort', t:'Défaite', v:'AB'}
      ]},
      {id:'e-follet', titre:'Feu follet', sons:[
        {id:'folletCri', t:'Son murmure', v:'ABC'}, {id:'folletFlamme', t:'Flamme froide', v:'AB'}, {id:'folletTouche', t:'Touché', v:'AB'}, {id:'folletMort', t:'Il s’éteint', v:'AB'}
      ]},
      {id:'e-tetard', titre:'Têtard', sons:[
        {id:'tetardCri', t:'Glouglou', v:'AB'}, {id:'tetardTouche', t:'Touché', v:'AB'}, {id:'tetardMort', t:'Défaite', v:'AB'}
      ]},
      {id:'e-roi', titre:'Roi des rats', sons:[
        {id:'roiCri', t:'Grouillement', v:'ABC'}, {id:'roiAttaque', t:'Son attaque', v:'AB'}, {id:'roiTouche', t:'Touché', v:'AB'}, {id:'roiFin', t:'Défaite', v:'AB'}
      ]},
      {id:'e-gardien', titre:'Gardien de rouille', sons:[
        {id:'gardienPas', t:'Pas de fer', v:'AB'}, {id:'gardienPoing', t:'Son poing', v:'AB'}, {id:'gardienRunes', t:'Ses runes', v:'AB'}, {id:'gardienTouche', t:'Touché', v:'AB'}, {id:'gardienFin', t:'Effondrement', v:'AB'}
      ]},
      {id:'e-bourbe', titre:'Bourbe (boss)', sons:[
        {id:'bourbeCri', t:'Coassement', v:'ABC'}, {id:'bourbeLangue', t:'Sa langue', v:'AB'}, {id:'bourbeGobe', t:'Il gobe', v:'AB'}, {id:'bourbeRot', t:'Le rot', v:'AB'},
        {id:'bourbePlonge', t:'Le plongeon', v:'AB'}, {id:'bourbeSaut', t:'Le saut', v:'AB'}, {id:'bourbeRire', t:'Chatouillé', v:'AB'}, {id:'bourbeTouche', t:'Touché', v:'AB'}, {id:'bourbeFin', t:'Défaite', v:'AB'}
      ]}
    ]},
    {id:'objets', titre:'Objets et salles', sons:[
      {id:'ramasse', t:'Ramasser', v:'AB'}, {id:'coffre', t:'Un coffre', v:'AB'}, {id:'portePierre', t:'Porte de pierre', v:'AB'}, {id:'roueCanaux', t:'Roue des canaux', v:'AB'}, {id:'grilleCanaux', t:'La grille', v:'A'}, {id:'dalles', t:'Piège des dalles', v:'AB'},
      {id:'pageSauve', t:'Page de sauvegarde', v:'AB'}, {id:'codeOk', t:'Code accepté', v:'AB'}, {id:'codeNon', t:'Code refusé', v:'AB'},
      {id:'pasCouloir', t:'Pas (couloir)', v:'ABCD'}, {id:'s_pasCarte', t:'Pas (carte)', x:1}, {id:'s_miaou', t:'Le chat', x:1}, {id:'brumeCarte', t:'Brume (carte)', v:'AB'}, {id:'feuCamp', t:'Feu de camp', v:'AB', m:1}
    ]}
  ]},
  {id:'musiques', titre:'Musiques', sons:[
    {id:'explo', t:'Exploration', v:'ABC', m:1}, {id:'combat', t:'Combat', v:'AB', m:1},
    {id:'salles', t:'Couleurs des salles', salles:1, v:[['puits', 'Puits'], ['toiles', 'Toiles'], ['atelier', 'Atelier']]},
    {id:'canaux', t:'Les canaux', v:'AB', c:1}, {id:'ossuaire', t:'L’ossuaire', v:'AB', c:1},
    {id:'repos', t:'Repos (feu)', v:'AB', m:1}, {id:'gardien', t:'Le Gardien', v:'A', m:1}, {id:'roi', t:'Roi des rats', v:'A', m:1}, {id:'boss', t:'Bourbe', v:'ABC', m:1}, {id:'finDonjon', t:'Léo retrouvé', v:'AB', m:1}
  ]},
  {id:'jeu', titre:'Le jeu', sons:[
    {id:'j_clic', t:'Bouton touché', x:1}, {id:'j_tic', t:'Petit tic', x:1}, {id:'j_ok', t:'Bonne réponse', x:1}, {id:'j_ko', t:'Erreur', x:1},
    {id:'j_gain', t:'Un gain', x:1}, {id:'j_magie', t:'Magie', x:1}, {id:'j_pas', t:'Aller au lieu', x:1}, {id:'j_page', t:'Ouvrir un lieu', x:1},
    {id:'j_feuille', t:'Page du Livre', x:1}, {id:'j_porte', t:'Toc-toc', x:1}, {id:'j_cloche', t:'La cloche', x:1}, {id:'j_pastilles', t:'Pastilles (carte)', x:1},
    {id:'j_fumee', t:'Mensonge en fumée', x:1}, {id:'j_plouf', t:'Plouf', x:1}, {id:'j_bulle', t:'Bulle', x:1}, {id:'j_victoire', t:'Victoire', x:1}, {id:'j_echec', t:'Échec', x:1}
  ]},
  {id:'mj', titre:'Mini-jeux', sous:[
    {id:'mj-tir', titre:'Tir à l’arc', sons:[{id:'j_fleche', t:'La flèche', x:1}, {id:'p_transperce', t:'Transpercé !', x:1}]},
    {id:'mj-chaudron', titre:'Le chaudron', sons:[
      {id:'c_touille', t:'On touille', x:1}, {id:'c_tic', t:'Tic', x:1}, {id:'c_buche', t:'Une bûche', x:1}, {id:'c_plouf', t:'Plouf', x:1}, {id:'c_etoile', t:'Parfait !', x:1},
      {id:'c_erreur', t:'Erreur', x:1}, {id:'c_alerte', t:'Alerte', x:1}, {id:'c_feuBas', t:'Feu bas', x:1}, {id:'c_succes', t:'Potion réussie', x:1},
      {id:'c_boum', t:'Explosion', x:1}, {id:'c_gel', t:'Gelée', x:1}, {id:'c_pschitt', t:'Feu éteint', x:1}, {id:'c_rate', t:'Potion ratée', x:1}
    ]},
    {id:'mj-rythme', titre:'Remuer en rythme', sons:[{id:'p_rythme', t:'Les gouttes', x:1}]},
    {id:'mj-bulles', titre:'Bulles magiques', sons:[{id:'p_bulles', t:'Les notes', x:1}]},
    {id:'mj-insectes', titre:'Ménage du labo', sons:[{id:'o_ecrase', t:'Splotch', x:1}, {id:'o_ohNon', t:'Oh non', x:1}, {id:'o_pop', t:'Pop', x:1}, {id:'o_bocal', t:'Au bocal', x:1}]},
    {id:'mj-diff', titre:'Différences, Double', sons:[{id:'o_ding', t:'Trouvé !', x:1}]},
    {id:'mj-runes', titre:'Les runes', sons:[{id:'r_clac', t:'Clac', x:1}, {id:'r_fin', t:'Assemblées', x:1}]}
  ]}
];
