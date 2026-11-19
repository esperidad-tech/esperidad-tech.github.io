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
      ]},
      /* 19 novembre (Romain : « quand il replonge dans l'eau, il n'y a pas de son […] quand le sol est gelé, il n'y a pas vraiment de son […]
         dès qu'un ennemi fait une action, il y a un son ») : les sons neufs de Bourbe (sa sortie de l'eau, le bassin qui gèle, la glace)
         et ceux qui valent pour toutes les bêtes (prise dans la glace, lâchée, une chute). À part, pour que la section de Bourbe reste courte. */
      {id:'e-toutes', titre:'Eau, glace, chutes', sons:[
        {id:'bourbeSort', t:'Bourbe sort', v:'A'}, {id:'bassinGele', t:'Le bassin gèle', v:'A'}, {id:'glaceChoc', t:'Sur la glace', v:'A'}, {id:'glaceCasse', t:'La glace cède', v:'A'},
        {id:'bullesFond', t:'Des bulles', v:'A'}, {id:'gelPris', t:'Bête gelée', v:'A'}, {id:'gelFond', t:'La glace casse', v:'A'}, {id:'beteChute', t:'Elle tombe', v:'A'}
      ]},
      /* LÉO, le boss final (13 novembre, Bible §13.33 : « à chaque attaque de Léo, il faut un son ») — une version de chacun, à valider par Romain */
      {id:'e-leo', titre:'Léo (boss final)', sous:[
        {id:'e-leo1', titre:'Phase 1 : la cape noire', sons:[
          {id:'leoFleau', t:'Le fléau', v:'A'}, {id:'leoCharge', t:'La charge', v:'A'}, {id:'leoMarteau', t:'Le marteau', v:'A'}, {id:'leoMeule', t:'La meule de paille', v:'A'},
          {id:'leoFarine', t:'La farine', v:'A'}, {id:'leoCrochet', t:'Le crochet', v:'A'}, {id:'leoBoum', t:'BOUM (la farine)', v:'A'}, {id:'leoCape', t:'La cape (le noir)', v:'A'}, {id:'leoTorches', t:'Les torches rallumées', v:'A'}
        ]},
        {id:'e-leo2', titre:'Phase 2 : torse nu', sons:[
          {id:'leoSifflet', t:'Le sifflet', v:'A'}, {id:'leoPoing', t:'Le coup de poing', v:'A'}, {id:'leoFaux', t:'La faux', v:'AB'}, {id:'leoSaut', t:'Le saut', v:'A'}, {id:'leoGourde', t:'La gourde (l\'ancienne)', v:'A'}, {id:'leoLancer', t:'Le lancer de rat', v:'A'},
          /* 14 novembre au soir (Bible §13.40) : le nouveau Léo — tous neufs, à écouter */
          {id:'leoFauxTire', t:'Faux tirée', v:'A'}, {id:'leoNaseaux', t:'Les naseaux', v:'A'}, {id:'leoRacle', t:'Pied qui racle', v:'A'}, {id:'leoSac', t:'Le sac', v:'A'},
          {id:'leoBouchon', t:'Le bouchon', v:'A'}, {id:'leoGlou', t:'Glou', v:'A'}, {id:'leoAah', t:'Aaah !', v:'A'}, {id:'leoAura', t:'L\'aura', v:'A'}, {id:'leoBrise', t:'Gourde brisée', v:'A'}
        ]},
        {id:'e-leo12', titre:'Cape et tunique', sons:[
          {id:'leoTunique', t:'Tunique retirée', v:'A'}, {id:'leoJette', t:'Il la jette', v:'A'}, {id:'leoMuscles', t:'Les muscles', v:'A'}
        ]},
        {id:'e-leo3', titre:'Phase 3 : la potion', sons:[
          {id:'leoRafale', t:'La rafale de coups', v:'A'}, {id:'leoHurlement', t:'Le hurlement', v:'A'}, {id:'leoAttrape', t:'Il attrape un héros', v:'A'}, {id:'leoSouffle', t:'Le souffle de feu', v:'A'}
        ]},
        {id:'e-leo4', titre:'Ce qui lui arrive', sons:[
          {id:'leoTouche', t:'Touché', v:'A'}, {id:'leoGlisse', t:'Il glisse', v:'A'}, {id:'leoSonne', t:'Sonné (le marteau)', v:'A'}, {id:'leoSaigne', t:'Une goutte (saignement)', v:'A'}, {id:'leoCasse', t:'Un outil casse', v:'A'},
          {id:'leoRamasse', t:'Le Pisteur ramasse', v:'A'}, {id:'leoDechire', t:'Il arrache sa cape', v:'A'}, {id:'leoPotion', t:'Il boit la potion', v:'A'}, {id:'leoChute', t:'Il tombe', v:'A'}
        ]},
        /* 15 novembre (Bible §13.45) : les cinématiques (la vidéo est muette, le jeu joue ces bruitages) — tous neufs, à écouter */
        {id:'e-cine', titre:'Cinématiques', sons:[
          {id:'cineOutils', t:'Outils qui tombent', v:'A'}, {id:'cineSouffle', t:'Il souffle', v:'A'}, {id:'cineGrogne', t:'Il grogne', v:'A'}, {id:'cinePas', t:'Pas lourd', v:'A'},
          {id:'cineCape', t:'La cape vole', v:'A'}, {id:'cineOnde', t:'Onde de choc', v:'A'}, {id:'cineEssuie', t:'Il s\'essuie', v:'A'}, {id:'cineCrache', t:'Il crache', v:'A'},
          {id:'cineCoeur', t:'Le cœur', v:'A'}, {id:'cineMontee', t:'La potion monte', v:'A'}, {id:'cineChute', t:'Il s\'effondre', v:'A'}, {id:'cinePasEcho', t:'Pas au loin', v:'A'},
          {id:'cineLanterne', t:'La lanterne', v:'A'}, {id:'cinePasEscalier', t:'Pas, escalier', v:'A'}, {id:'cineArmure', t:'Les gardes', v:'A'}, {id:'cineGant', t:'Le gant', v:'A'},
          {id:'cineBague', t:'La bague', v:'A'}, {id:'cineLances', t:'Les lances', v:'A'}, {id:'cineGardes', t:'La charge', v:'A'}, {id:'cineCoup', t:'Le coup final', v:'A'},
          /* 15 novembre, 16 h 57 (Romain) : le cri de Léo (une voix fabriquée), et une musique par film (cine-musiques.js) */
          {id:'cineCri', t:'Le cri', v:'ABC'},
          {id:'cineMusA12', t:'Musique phase 1', v:'A', m:1}, {id:'cineMusB23', t:'Musique phase 2', v:'A', m:1},
          {id:'cineMusFinLeo', t:'Musique Léo parle', v:'A', m:1}, {id:'cineMusFinMaire', t:'Musique du maire', v:'A', m:1},
          /* 15 novembre, 19 h 05 (Romain) : la cinématique de l'entrée (l'homme en cape sort de l'ombre et parle) */
          {id:'cineMusEntree', t:'Musique de l\'entrée', v:'A', m:1, neuf:1},
          /* 16 novembre (Romain) : la cinématique du rassemblement au Vieux Chêne (enquête 2, la nuit) — on est dehors : presque pas d'écho */
          {id:'cineFoule', t:'La foule marche', v:'A', neuf:1}, {id:'cineClameur', t:'« Ouais ! »', v:'A', neuf:1}, {id:'cineFoulePasse', t:'La foule passe', v:'A', neuf:1}, {id:'cineBarriere', t:'La barrière tombe', v:'A', neuf:1},
          {id:'cineVent', t:'Vent de nuit', v:'A', neuf:1}, {id:'cineHibou', t:'La chouette', v:'A', neuf:1}, {id:'cineAllumette', t:'L\'allumette', v:'A', neuf:1}, {id:'cineMeche', t:'La mèche brûle', v:'A', neuf:1},
          {id:'cinePffft', t:'Le fumigène part', v:'A', neuf:1}, {id:'cineOh', t:'« Oh ! »', v:'A', neuf:1}, {id:'cineToux', t:'Quelqu\'un tousse', v:'A', neuf:1}, {id:'cineCourse', t:'Ils accourent', v:'A', neuf:1},
          {id:'cineFouleFuit', t:'La fuite', v:'A', neuf:1},
          {id:'cineMusChene', t:'Musique du rassemblement', v:'A', m:1, neuf:1},
          /* 16 novembre (Romain) : la pub de 30 secondes (jeu/pub) */
          {id:'pubPop', t:'Pub : pop', v:'A', neuf:1}, {id:'pubWhoosh', t:'Pub : fffiou', v:'A', neuf:1}, {id:'pubPlongee', t:'Pub : la plongée', v:'A', neuf:1}, {id:'pubTada', t:'Pub : le titre', v:'A', neuf:1},
          {id:'cineMusPub', t:'Musique de pub', v:'A', m:1, neuf:1},
          /* 17 novembre (Romain) : les deux descentes du donjon (escalier de la crypte, corde du puits) */
          {id:'cineGrille', t:'La grille rouillée', v:'A', neuf:1}, {id:'cineGoutte', t:'Une goutte', v:'A', neuf:1}, {id:'cineCorde', t:'La corde glisse', v:'A', neuf:1}, {id:'cineLueur', t:'La lueur bleue', v:'A', neuf:1},
          {id:'cineMusEscalier', t:'Musique de crypte', v:'A', m:1, neuf:1}, {id:'cineMusPuits', t:'Musique du puits', v:'A', m:1, neuf:1},
          /* 18 novembre (Romain) : les deux descentes refaites en 2D — les pas, la torche qui brûle, la corde, les bêtes, la clé d'Anselme, la pierre de rune */
          {id:'cineTorche', t:'La torche brûle', v:'A', neuf:1}, {id:'cineSouffleFeu', t:'La flamme passe', v:'A', neuf:1}, {id:'cinePasPierre', t:'Pas, pierre', v:'A', neuf:1}, {id:'cinePasHerbe', t:'Pas, herbe', v:'A', neuf:1},
          {id:'cineEtoffe', t:'Une étoffe', v:'A', neuf:1}, {id:'cineChuteTorche', t:'La torche tombe', v:'A', neuf:1}, {id:'cineCordeGrince', t:'La corde grince', v:'A', neuf:1}, {id:'cineAtterrit', t:'Il atterrit', v:'A', neuf:1},
          {id:'cineBetes', t:'Les bêtes détalent', v:'A', neuf:1}, {id:'cineCouinement', t:'Un couinement', v:'A', neuf:1}, {id:'cineCleEntre', t:'La clé entre', v:'A', neuf:1}, {id:'cineCleTourne', t:'La clé tourne', v:'A', neuf:1},
          {id:'cineVentCave', t:'Vent de cave', v:'A', neuf:1}, {id:'cineRune', t:'La rune chante', v:'A', neuf:1}, {id:'cineEclat', t:'Un éclat', v:'A', neuf:1}, {id:'cineHm', t:'« Hm ? »', v:'A', neuf:1},
          /* 17 novembre (Romain) : les quatre films des héros (jeu/pub/heros.js) — la musique de la pub, un air et un instrument par héros */
          {id:'cineMusHerosPisteur', t:'Film du Pisteur', v:'A', m:1, neuf:1}, {id:'cineMusHerosAlchimiste', t:'Film de l\'Alchimiste', v:'A', m:1, neuf:1},
          {id:'cineMusHerosBarde', t:'Film du Barde', v:'A', m:1, neuf:1}, {id:'cineMusHerosSage', t:'Film du Sage', v:'A', m:1, neuf:1},
          /* 18 novembre (Romain : « une cinématique à chaque début d'enquête ») : les trois films du début (film-debut1/2/3.js ; Bible §13.69) — tous neufs, à écouter */
          {id:'cineMusDebut1', t:'Musique début E1', v:'A', m:1, neuf:1}, {id:'cineMusDebut2', t:'Musique début E2', v:'A', m:1, neuf:1}, {id:'cineMusDebut3', t:'Musique début E3', v:'A', m:1, neuf:1},
          {id:'cineNuit', t:'La nuit, dedans', v:'A', neuf:1}, {id:'cineTicTac', t:'La pendule', v:'A', neuf:1}, {id:'cineLanterneOr', t:'La Lanterne d\'Or', v:'A', neuf:1}, {id:'cineFenetre', t:'La fenêtre', v:'A', neuf:1},
          {id:'cinePrise', t:'La main', v:'A', neuf:1}, {id:'cineLueurPart', t:'La lumière part', v:'A', neuf:1}, {id:'cineCourseLegere', t:'Pas légers', v:'A', neuf:1}, {id:'cineTempsPasse', t:'La nuit passe', v:'A', neuf:1},
          {id:'cineOiseaux', t:'Oiseaux du matin', v:'A', neuf:1}, {id:'cinePorteBureau', t:'Porte du bureau', v:'A', neuf:1}, {id:'cineFredonne', t:'Le maire chantonne', v:'A', neuf:1}, {id:'cinePasParquet', t:'Pas, parquet', v:'A', neuf:1},
          {id:'cineStupeur', t:'La stupeur', v:'A', neuf:1}, {id:'cineEnvol', t:'Les pigeons', v:'A', neuf:1},
          {id:'cineRiviere', t:'La rivière', v:'A', neuf:1}, {id:'cineCoq', t:'Le coq', v:'A', neuf:1}, {id:'cineLinge', t:'Le drap plongé', v:'A', neuf:1}, {id:'cineGouttes', t:'Le drap ruisselle', v:'A', neuf:1},
          {id:'cineSursaut', t:'Elle sursaute', v:'A', neuf:1}, {id:'cineCriFemme', t:'Le cri', v:'A', neuf:1}, {id:'cineSeau', t:'Le seau tombe', v:'A', neuf:1}, {id:'cineMurmure', t:'Le village murmure', v:'A', neuf:1},
          {id:'cineAube', t:'L\'aube', v:'A', neuf:1}, {id:'cinePorteMairie', t:'La grande porte', v:'A', neuf:1}, {id:'cinePapier', t:'La lettre', v:'A', neuf:1}, {id:'cineSoupir', t:'Le soulagement', v:'A', neuf:1},
          {id:'cineHourra', t:'Hourra !', v:'A', neuf:1}, {id:'cineFete', t:'La fête commence', v:'A', neuf:1}, {id:'cineClocheJoie', t:'Les cloches', v:'A', neuf:1}, {id:'cineFeteLoin', t:'La fête, loin', v:'A', neuf:1},
          {id:'cineMiaou', t:'Moustache', v:'A', neuf:1},
          {id:'cineMoustacheGrogne', t:'Moustache pas content', v:'A', neuf:1}   /* 19 novembre : remplace le miaou à la fin de debut3 */
        ]}
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
    {id:'repos', t:'Repos (feu)', v:'AB', m:1}, {id:'gardien', t:'Le Gardien', v:'A', m:1}, {id:'roi', t:'Roi des rats', v:'A', m:1}, {id:'boss', t:'Bourbe', v:'ABC', m:1},
    /* 15 novembre, 18 h 29 (Romain) : Léo, une musique par phase — mystérieuse, le combat, terrifiante */
    {id:'leo1', t:'Léo, phase 1', v:'A', m:1, neuf:1}, {id:'leo2', t:'Léo, phase 2', v:'A', m:1, neuf:1}, {id:'leo3', t:'Léo, phase 3', v:'A', m:1, neuf:1},
    /* 19 novembre (Romain : « la continuité de la musique qu'on voit dans la cinématique ») : le pont, joué UNE fois à la fin du film
       d'entrée, par-dessus la musique de la phase 1 qui démarre (il ne tourne pas en boucle : douze secondes, puis il s'éteint) */
    {id:'leoPont', t:'Après le film', v:'A', m:1, neuf:1},
    {id:'finDonjon', t:'Léo retrouvé', v:'AB', m:1}
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
