// Le Sage contre Grosbec — maquette 19 : la grande salle vue de haut, Grosbec et ses golems (ceux du combat du Barde) ; 10 combos à 3 niveaux, la colère de Grosbec
const G = (() => {
  const W = 900, H = 900;
  const CFG = {
    protection: 20, inkMax: 12, inkStart: 8, cost: { trait: 2, poussee: 2, mur: 2, spirale: 'moitie' },
    // version 18 [Romain, 25 nov., 15 h 49 : « que l'attaque de base soit plus importante », « moins d'encre à ramasser », « que ça soit le placement qui soit important »] :
    // le bâton tire plus vite (0,42 s au lieu de 0,55) et son orbe traverse un golem de plus (bien placé dans l'axe d'une file, on en touche deux)
    boltEvery: 0.42, boltDmg: 2, boltPierce: 1, boltRange: 340, boltSpeed: 760, sageSpeed: 300, slow: 0.07,
    shardEvery: 4,   // l'encre est rare : un petit golem sur huit lâche un éclat (1 = chacun, comme jusqu'à la version 17)
    grosShards: [1, 1],   // les éclats des gros : [bélier, colosse] (jusqu'à la version 17 : 2 et 3 ; null = comme avant)
    magnet: 120, pickup: 30,
    traitDmg: 2, traitWidth: 28, shatterR: 85, shatterDmg: 2,
    daze: 3, flyMin: 240, wallLife: 3, wallMax: 520, wallHalf: 15, wallSlowR: 70, wallSlow: 0.45, reflectDmg: 2, vMax: 95,
    repelR: 270, repelV: 1150, pushV: 1100,
    duree: 600, rageAt: [450, 540], shatterPart: 0.5, shatterMin: 4, codeTimes: null, codeBonus: 3, maxAlive: 75, regen: 10,
    rate0: 0.28, rateAdd: 0.5, rateRamp: 240, burst0: 4, burstDiv: 40, burstEvery: 28, rateLate: 1.1, lateFrom: 300, lateRamp: 240, hpLate: 2, hpLateEvery: 25,
    // ça durcit avec le temps (en minutes vraies, comme les combats des amis)
    costaudAt: 120, pageFirst: 1, pageStep: 0.5, pageVite: 6, pageStepTard: 1,   // les pages : il faut 1, 2, 3, 4… gros (jusqu'à la version 17 : 1, 2, 4, 5, 7, 8…) [Romain, 15 h 47 : « mettre plus de livres »]
    hpEvery: 90, hpGrosEvery: 60, hpGros: 2, sideEvery: 210, shootersX2At: 600,
    // les amis libérés
    
    potionCd: 2, puddleR: 85, puddleLife: 5, mudSlow: 0.2, burnT: 4, burnDmg: 1,
    noteCd: 2.5, noteSpeed: 330, noteRange: 520, charmT: 3
  };
  // ----- version 20 -----
  Object.assign(CFG, {
    shardEvery: 8, shatterPart: 1, slowMax: 2, hpLateEvery: 50,
    gbFirst: 50, gbEveryDebut: 24, gbDebutT: 180, gbEvery: 15, gbEveryRage: 10, gbSuit: 0.7, poingR: 95, poingT: 1.6, bandeH: 70, bandeT: 1.8, braiseR: 58, braiseN: 5, braiseT: 1.5,
    sonneT: 2, sonneSpeed: 0.45,
    dalleAt: 70, dalleCoups: 8, bombeAt: 150, bombeR: 95, bombeD: 4, mortierAt: 100, mortierEvery: 22, mortierLoin: 405, obusR: 72, obusT: 1.6, obusSuit: 0.5
  });
  // ----- version 21 -----
  Object.assign(CFG, {
    shardEvery: 1, grosShards: null, boltEvery: 0.55, boltDmg: 1, boltPierce: 0,          // comme avant : plein d'encre, le bâton est une petite aide
    gbFirst: 1e9, mortierAt: 1e9, dalleAt: 1e9, bombeAt: 1e9, belierCasse: false,          // la version 20 est éteinte
    vMaxBase: 170, traitMaxBase: 320, domeCost: 4, domeCd: 8,
    // la courbe, refaite pour un jeu de runes sans ralenti au départ (réglée au robot)
    // version 22 [Romain, 21 h 07 : « tu peux remettre un petit peu de difficulté […] vu les améliorations, tu peux quand même y aller »] : plus de golems
    // (version 21 : rate0 0.2, rateAdd 0.1, rateLate 0.1, hpEvery 180, hpGrosEvery 180, hpLateEvery 120, burstDiv 150) ; plus de golems seuls ne durcissait rien (plus de gros = plus de pages) : ils sont aussi plus solides
    rate0: 0.22, rateAdd: 0.18, rateLate: 0.3, hpEvery: 120, hpGrosEvery: 150, hpLate: 1, hpLateEvery: 80, burst0: 3, burstDiv: 90, sideEvery: 240, pageStep: 0.34, pageVite: 99
  });
  // ----- version 23 : deux fois plus de golems (version 22 : rate0 0.22, rateAdd 0.18, rateLate 0.3, burst0 3, burstDiv 90, maxAlive 75) ; les pages à heure fixe -----
  Object.assign(CFG, { rate0: 0.44, rateAdd: 0.36, rateLate: 0.6, burst0: 6, burstDiv: 45, maxAlive: 130, pageT0: 20, pageGap: 22, pageGapAdd: 1 });
  Object.assign(CFG, { slowMax: 1e9 });   // version 24 : le ralenti dure tant qu'on grave
  const MOTS = { dalle: 'Un porte-dalle ! Sa dalle arrête tes orbes : prends-le de côté, ou chasse-le.', mortier: 'Un mortier, tout au fond ! Il te vise. Va le chercher.', bombe: 'Un porteur de bombe ! Fais-le sauter loin de tes amis.' };
  const GROS = ['brute', 'costaud'];
  // ----- les cartes du grimoire : on en choisit une parmi trois à chaque page ramassée -----
  // l = le niveau qu'on obtient en la prenant (1, 2 ou 3)
  const CARDS = {
    double: { fam: 'baton', nom: 'Double orbe', ic: '✨', max: 3, txt: l => `Le bâton tire ${l + 1} orbes à la fois.` },
    lourd: { fam: 'baton', nom: 'Orbe lourd', ic: '☄️', max: 3, txt: l => `Chaque orbe fait ${l + 2} dégâts au lieu de 2.` },
    rapide: { fam: 'baton', nom: 'Tir rapide', ic: '💨', max: 3, txt: l => ['', 'Le bâton tire plus vite.', 'Le bâton tire encore plus vite.', 'Le bâton tire deux fois plus vite.'][l] },
    percant: { fam: 'baton', nom: 'Orbe perçant', ic: '🎯', max: 3, txt: l => ['', 'L’orbe traverse 3 golems.', 'L’orbe traverse 5 golems.', 'L’orbe traverse toute la file.'][l] },
    encrier: { fam: 'rune', nom: 'Grand encrier', ic: '🖋️', max: 3, txt: l => `${12 + 2 * l} d’encre au lieu de 12, et l’encrier se remplit.` },
    brulant: { fam: 'rune', nom: 'Trait brûlant', ic: '🔥', max: 3, txt: l => `Le trait laisse une ligne de feu pendant ${l + 1} secondes.` },
    epines: { fam: 'rune', nom: 'Mur d’épines', ic: '🌵', max: 3, txt: l => `Le mur blesse les golems collés contre lui (${l} par seconde).` },
    tonnerre: { fam: 'rune', nom: 'V tonnerre', ic: '🌩️', max: 3, txt: l => `Les golems chassés par le V sont sonnés ${['', '1,5', '2,5', '3,5'][l]} secondes.` },
    pages: { fam: 'sort', nom: 'Pages volantes', ic: '📃', max: 3, txt: l => `${l + 1} pages tournent autour du Sage et coupent les golems.` },
    sceau: { fam: 'sort', nom: 'Sceau de garde', ic: '🔆', max: 3, txt: l => l === 1 ? 'Un cercle doré autour des amis blesse les golems qui y entrent.' : 'Le cercle doré grandit et blesse plus souvent.' },
    chaine: { fam: 'sort', nom: 'Lumière en chaîne', ic: '⚡', max: 3, txt: l => `Un éclair saute de golem en golem : ${['', '3', '5', '7'][l]} golems.` },
    bouclier: { fam: 'sort', nom: 'Bouclier de cristal', ic: '💎', max: 3, txt: l => `Chaque ami a un bouclier qui encaisse un coup. Il revient en ${['', '20', '15', '10'][l]} secondes.` },
    chouette: { fam: 'sort', nom: 'La chouette du Sage', ic: '🦉', max: 3, txt: l => `Elle fond sur les frondeurs : ${['', '3', '5', '8'][l]} dégâts.` },
    solide: { fam: 'rune', nom: 'Mur solide', ic: '🧱', max: 3, txt: l => `Le mur dure ${3 + l} secondes au lieu de 3.` },
    large: { fam: 'rune', nom: 'Trait large', ic: '🖌️', max: 3, txt: l => ['', 'Le trait touche plus large.', 'Le trait touche encore plus large.', 'Le trait touche très large.'][l] },
    aimant: { fam: 'cadeau', nom: 'Aimant', ic: '🧲', max: 3, txt: l => 'Les éclats d’encre viennent à toi de plus loin.' },
    pas: { fam: 'cadeau', nom: 'Pas léger', ic: '👟', max: 3, txt: l => ['', 'Le Sage court plus vite.', 'Le Sage court encore plus vite.', 'Le Sage court très vite.'][l] },
    moisson: { fam: 'cadeau', nom: 'Moisson d’encre', ic: '🦑', max: 3, txt: l => `Les gros golems lâchent ${l} éclat${l > 1 ? 's' : ''} d’encre de plus.` },
    // les 14 builds : une carte dorée, 3 niveaux ; elle sort quand on a ses deux cartes (l'une au moins au niveau 2)
    // --- dix builds du bâton (genre: 'baton') ---
    etoiles: { fam: 'combo', genre: 'baton', of: ['double', 'rapide'], nom: 'Pluie d’étoiles', ic: '🌠', max: 3, txt: l => ['', 'Toutes les 5 secondes, 12 étoiles partent tout autour du Sage.', 'Toutes les 3 secondes, et les étoiles rebondissent sur les bords.', 'Chaque étoile qui détruit un golem éclate en 3 étoiles.'][l] },
    ricochet: { fam: 'combo', genre: 'baton', of: ['double', 'percant'], nom: 'Ricochet', ic: '🎱', max: 3, txt: l => ['', 'L’orbe rebondit sur 2 golems de plus.', '4 rebonds, et l’orbe frappe plus fort à chaque rebond.', '8 rebonds, et l’orbe se dédouble au premier.'][l] },
    explosif: { fam: 'combo', genre: 'baton', of: ['double', 'lourd'], nom: 'Orbes explosives', ic: '💥', max: 3, txt: l => ['', 'Chaque orbe explose : les golems autour sont touchés aussi.', 'L’explosion est plus grande, plus forte, et souffle les golems.', 'Un golem détruit par une explosion explose à son tour.'][l] },
    rayon: { fam: 'combo', genre: 'baton', of: ['rapide', 'percant'], nom: 'Le rayon', ic: '🔦', max: 3, txt: l => ['', 'Toutes les 3 secondes, un rayon traverse toute la salle : place-toi dans l’axe.', 'Toutes les 2 secondes, plus large et plus fort.', 'Presque sans arrêt, et il part des deux côtés.'][l] },
    braise: { fam: 'combo', genre: 'baton', of: ['lourd', 'rapide'], nom: 'Orbes de braise', ic: '🔥', max: 3, txt: l => ['', 'Chaque orbe met le feu au golem touché.', 'Le feu brûle plus fort et saute de golem en golem.', 'Un golem qui meurt en brûlant explose en boule de feu.'][l] },
    givre: { fam: 'combo', genre: 'baton', of: ['lourd', 'percant'], nom: 'Orbes de givre', ic: '❄️', max: 3, txt: l => ['', 'Chaque orbe ralentit le golem touché.', 'Au troisième coup, il gèle sur place : gelé, il prend double.', 'Un golem gelé qui casse gèle ses voisins.'][l] },
    foudre: { fam: 'combo', genre: 'baton', of: ['chaine', 'rapide'], nom: 'Bâton de foudre', ic: '⚡', max: 3, txt: l => ['', 'Un tir sur quatre est un éclair qui saute sur 4 golems.', 'Un tir sur trois : 6 golems, et le premier est sonné.', 'Un tir sur deux : 8 golems, plus fort.'][l] },
    gardiennes: { fam: 'combo', genre: 'baton', of: ['pages', 'double'], nom: 'Orbes gardiennes', ic: '🛡️', max: 3, txt: l => ['', '3 orbes tournent tout près du Sage : elles frappent et arrêtent les braises.', '5 orbes : elles repoussent les golems qu’elles touchent.', '8 orbes, et toutes les 4 secondes elles partent en étoile.'][l] },
    comete: { fam: 'combo', genre: 'rune', of: ['pas', 'aimant'], nom: 'La comète', ic: '🌟', max: 3, txt: l => ['', 'Le Sage court plus vite et laisse une large traînée d’étoiles qui brûle fort les golems et arrête les braises.', 'La traînée sonne les golems qui la touchent et renvoie les braises ; le Sage projette ceux qu’il percute.', 'La traînée explose derrière lui : les golems sont sonnés, les sonnés éclatent.'][l] },
    chouettes: { fam: 'combo', genre: 'rune', of: ['chouette', 'chaine'], nom: 'Parlement des chouettes', ic: '🦉', max: 3, txt: l => ['', 'Une deuxième chouette, et chaque coup de bec lance un éclair.', 'Quatre chouettes, et toujours les éclairs !', 'Les chouettes attrapent les golems et les jettent sur les autres.'][l] },
    // --- un build par rune (genre: 'rune') ---
    mur: { fam: 'sort', nom: 'Rune du mur', ic: '🚧', max: 1, txt: l => 'Une nouvelle rune : trace un arc de cercle, un mur apparaît 3 secondes. Il ralentit les golems et renvoie les braises.' },
    spirale: { fam: 'sort', nom: 'Rune de l’escargot', ic: '🐌', max: 1, txt: l => 'Une nouvelle rune : trace un escargot, tous les golems autour sont repoussés au loin. Elle coûte la moitié de l’encre.' },
    dome: { fam: 'sort', nom: 'Rune du bouclier', ic: '🛡️', max: 3, txt: l => `Une nouvelle rune : trace un cercle fermé. Tes amis sont intouchables ${['', '2,5', '4', '5,5'][l]} secondes. Elle coûte 4 d’encre et se recharge en 8 secondes.` },
    sablier: { fam: 'sort', nom: 'Le sablier', ic: '⏳', max: 3, txt: l => `Quand tu graves, le temps ralentit ${['', 'de moitié', 'beaucoup', 'presque jusqu’à l’arrêt'][l]}, 2 secondes au plus par rune.` },
    grandv: { fam: 'rune', nom: 'Grand V', ic: '📐', max: 3, txt: l => `Ton V peut être ${['', 'une fois et demie plus grand', 'deux fois plus grand', 'aussi grand que tu veux'][l]}.` },
    long: { fam: 'rune', nom: 'Long trait', ic: '📏', max: 2, txt: l => `Ton trait peut ${['', 'traverser la moitié de la salle', 'traverser toute la salle'][l]}.` },
    orage: { fam: 'combo', genre: 'rune', of: ['chaine', 'tonnerre'], nom: 'Orage', ic: '⛈️', max: 3, txt: l => ['', 'Un golem qui éclate fait tomber la foudre sur 3 golems autour : ils sont sonnés.', 'La foudre fait éclater les golems déjà sonnés : réaction en chaîne !', 'Toutes les 6 secondes, un orage tombe tout seul sur la place.'][l] },
    scribe: { fam: 'combo', genre: 'rune', of: ['encrier', 'moisson'], nom: 'Le scribe fou', ic: '🐙', max: 3, txt: l => ['', 'Les runes coûtent 1 encre de moins, et l’encre remonte toute seule.', 'Combo ×4 avec une rune : FRÉNÉSIE ! 6 secondes d’encre gratuite.', 'Chaque rune a un écho : elle se relance toute seule juste après. La frénésie arrive dès ×3.'][l] },
    sanctuaire: { fam: 'combo', genre: 'rune', of: ['sceau', 'bouclier'], nom: 'Sanctuaire', ic: '🏛️', max: 3, txt: l => ['', 'Quand un bouclier casse, le sceau sonne tous les golems du cercle.', 'Toutes les 8 secondes, le sceau pulse et projette les golems du cercle au loin.', 'L’onde du sceau fait éclater les golems sonnés.'][l] },
    miroir: { fam: 'combo', genre: 'rune', of: ['large', 'encrier'], nom: 'Rune miroir', ic: '🌗', max: 3, txt: l => ['', 'Chaque rune est recopiée gratuitement de l’autre côté des amis.', 'Trois copies : en face, et un quart de tour de chaque côté.', 'Mandala : sept copies tout autour des amis !'][l] },
    volcan: { fam: 'combo', genre: 'rune', of: ['brulant', 'large'], nom: 'Volcan (le trait)', ic: '🌋', max: 3, txt: l => ['', 'Le feu du trait brûle deux fois plus fort et saute de golem en golem.', 'Un golem qui meurt en brûlant explose en boule de feu et enflamme ses voisins.', 'Les golems en feu courent partout en paniquant, et le trait laisse une coulée de lave.'][l] },
    bowling: { fam: 'combo', genre: 'rune', of: ['tonnerre', 'encrier'], nom: 'Golems-boulets (le V)', ic: '🎳', max: 3, txt: l => ['', 'Le V ne coûte plus que 1. Les golems chassés deviennent des boulets : ils rebondissent partout et renversent tout ce qu’ils touchent.', 'Les golems renversés deviennent boulets à leur tour : réaction en chaîne !', 'Chaque boulet explose à la fin de sa course.'][l] },
    tornade: { fam: 'combo', genre: 'rune', of: ['spirale', 'aimant'], nom: 'Tornade (l’escargot)', ic: '🌀', max: 3, txt: l => ['', 'L’escargot ne coûte plus que 4. Les pages s’envolent en spirale jusqu’au bord de la salle, puis reviennent.', 'L’escargot devient une tornade : elle aspire les golems, puis les recrache sonnés.', 'La tornade dure plus longtemps, se promène vers la foule et déchiquette les golems.'][l] },
    rempart: { fam: 'combo', genre: 'rune', of: ['epines', 'solide'], nom: 'Rempart (l’arc de cercle)', ic: '🏰', max: 3, txt: l => ['', 'Le mur dure 2 secondes de plus et met le feu aux golems qui le touchent.', 'Le mur rejette en arrière les golems qui le touchent : ils sont sonnés.', 'Quand il disparaît, le mur explose.'][l] },
    soin: { fam: 'cadeau', nom: 'Protection', ic: '💙', max: 99, txt: () => '+5 de protection, tout de suite.' }
  };
  const SORTS_MAX = 99;   // il n'y a plus que cinq sorts : plus de limite (une limite pouvait bloquer un build)
  // version 21 : plus de cartes ni de builds du bâton (sauf le tir rapide), plus de pages volantes ; la chaîne part du trait
  for (const k of ['double', 'lourd', 'percant', 'pages', 'etoiles', 'ricochet', 'explosif', 'rayon', 'braise', 'givre', 'foudre', 'gardiennes']) delete CARDS[k];
  CARDS.solide.need = 'mur'; CARDS.epines.need = 'mur';
  { const t0 = CARDS.tornade.txt; CARDS.tornade.txt = l => l === 1 ? 'L’escargot ne coûte plus que 4 d’encre.' : t0(l); }
  Object.assign(CARDS.chaine, { fam: 'rune', txt: l => `Quand tu graves un trait, un éclair part du dernier golem touché et saute sur ${['', '3', '5', '7'][l]} golems.` });
  // version 24 : plus de sablier ; à sa place, la lumière aveuglante
  delete CARDS.sablier;
  // version 25 : la comète est enlevée ; chaque carte n'ouvre plus qu'un seul build
  delete CARDS.comete;
  CARDS.miroir.of = ['long', 'grandv']; CARDS.bowling.of = ['tonnerre', 'solide']; CARDS.rempart.of = ['mur', 'epines'];
  CARDS.orage.of = ['chaine', 'eblouir']; CARDS.chouettes.of = ['chouette', 'pas']; CARDS.sanctuaire.of = ['dome', 'sceau'];
  Object.assign(CARDS.chouette, { txt: l => `Chaque fois que tu graves une rune, la chouette fond sur un golem (les frondeurs d’abord) : ${UP.chouetteD[l]} dégâts. Le reste du temps, elle tourne autour de toi.` });
  Object.assign(CARDS.sceau, { txt: l => `Après chaque rune, un cercle doré brûle autour des amis pendant ${UP.sceauDur[l]} secondes : 1 dégât aux golems qui y sont, ${['', 'chaque seconde', 'toutes les 0,8 seconde', 'toutes les 0,6 seconde'][l]}.` });
  { const t0 = CARDS.orage.txt; CARDS.orage.txt = l => l === 3 ? 'Chaque rune gravée fait tomber la foudre sur 5 golems : ils sont sonnés, et les sonnés éclatent.' : t0(l); }
  CARDS.sanctuaire.txt = l => ['', 'Quand tu graves le bouclier, le sceau sonne tous les golems autour des amis.', 'Quand le bouclier s’éteint, il éclate : les golems autour des amis sont projetés au loin.', 'Cet éclat fait éclater les golems sonnés.'][l];
  { const t0 = CARDS.chouettes.txt; CARDS.chouettes.txt = l => l === 1 ? 'Une deuxième chouette, et chaque coup de bec lance un éclair. Elles fondent toutes à chaque rune gravée.' : t0(l); }
  CARDS.eblouir = { fam: 'rune', nom: 'Lumière aveuglante', ic: '💫', max: 3, txt: l => `Ton trait éblouit les golems qu’il ne détruit pas : ils sont sonnés ${['', '1 seconde', '2 secondes', '3 secondes'][l]}. Un deuxième trait les fait éclater.` };
  const lv = (s, id) => s.up[id] || 0;
  const UP = { // les valeurs, niveau 0 à 3
    rapide: [1, 0.8, 0.65, 0.5], percant: [0, 1, 3, 99], ricoN: [0, 2, 4, 8], boumR: [0, 60, 85, 110], boumD: [0, 1, 2, 3],
    foudreK: [0, 4, 3, 2], foudreN: [0, 4, 6, 8], foudreD: [0, 2, 3, 4], rayonT: [0, 3, 2, 1.2], rayonD: [0, 3, 4, 5], rayonW: [0, 18, 28, 28], gardN: [0, 3, 5, 8], gardR: [0, 62, 70, 80], gardD: [0, 2, 3, 3], brulant: [0, 2, 3, 4], epines: [0, 1, 2, 3], tonnerre: [0, 1.5, 2.5, 3.5],
    pagesN: [0, 2, 3, 4], pagesR: [0, 75, 85, 95], sceauR: [0, 130, 160, 190], sceauT: [0, 1, 0.8, 0.6],
    piegeT: [0, 5, 4, 3], piegeR: [0, 75, 90, 105], chaineN: [0, 3, 5, 7], chaineT: [0, 3, 2.6, 2.2],
    bouclierT: [0, 20, 15, 10], sceauDur: [0, 3, 4, 5], chouetteD: [0, 3, 5, 8], chouetteT: [0, 3.2, 2.6, 2], aimant: [120, 220, 320, 450]
  };
  // un combo est prêt quand on a ses deux cartes, l'une au moins au niveau 2 ; ensuite ses niveaux 2 et 3 sortent aussi
  const comboReady = (s, id) => { const [a, b] = CARDS[id].of; const l = lv(s, id); return l > 0 ? l < 3 : lv(s, a) && lv(s, b) && Math.max(lv(s, a), lv(s, b)) >= 2; };
  // les builds pas encore pris dont « id » est une des deux cartes
  const buildsDe = (s, id) => Object.keys(CARDS).filter(k => CARDS[k].fam === 'combo' && !lv(s, k) && CARDS[k].of.includes(id));
  // prendre « id » fait-il avancer un build commencé ? (l'autre carte est déjà là, et le build n'est pas encore prêt)
  const avance = (s, id) => buildsDe(s, id).some(k => { const o = CARDS[k].of.find(x => x !== id); return lv(s, o) > 0 && !comboReady(s, k); });
  // ce qu'on écrit sous une carte : « Avec X : le build Y » (les builds que cette carte prépare)
  const hint = (s, id) => { if (!CARDS[id] || CARDS[id].fam === 'combo' || id === 'soin') return ''; const B = buildsDe(s, id); if (!B.length) return ''; const pret = B.filter(k => lv(s, CARDS[k].of.find(x => x !== id)) > 0); return pret.length ? 'Avec « ' + CARDS[CARDS[pret[0]].of.find(x => x !== id)].nom + ' » : ' + CARDS[pret[0]].nom : 'Prépare : ' + B.slice(0, 2).map(k => CARDS[k].nom).join(', '); };
  const combosReady = s => Object.keys(CARDS).filter(id => CARDS[id].fam === 'combo' && comboReady(s, id));
  function cardPool(s) {
    const sorts = Object.keys(CARDS).filter(id => CARDS[id].fam === 'sort' && lv(s, id) > 0).length;
    const pool = Object.keys(CARDS).filter(id => id !== 'soin' && CARDS[id].fam !== 'combo' && lv(s, id) < CARDS[id].max && (!CARDS[id].need || lv(s, CARDS[id].need) > 0) && (CARDS[id].fam !== 'sort' || lv(s, id) > 0 || sorts < SORTS_MAX));
    if (s.protection < s.cfg.protection - 4 || pool.length < 3) pool.push('soin');
    return pool;
  }
  function openChoice(s) {
    const pool = cardPool(s), cards = [], ready = combosReady(s);
    if (ready.length) { // un combo prêt sort à coup sûr (les nouveaux d'abord) ; deux s'il y en a beaucoup
      const fresh = ready.filter(id => !lv(s, id)), from = fresh.length ? fresh : ready;
      cards.push(from.splice(Math.floor(rng(s) * from.length), 1)[0]);
      const rest = ready.filter(id => !cards.includes(id)); if (rest.length >= 2) cards.push(rest[Math.floor(rng(s) * rest.length)]);
    }
    // au moins une carte qui fait avancer un build commencé (finir sa paire, ou monter une carte de la paire au niveau 2)
    const av = pool.filter(id => avance(s, id));
    if (av.length && cards.length < 3) { const id = av[Math.floor(rng(s) * av.length)]; cards.push(id); pool.splice(pool.indexOf(id), 1); }
    while (cards.length < 3 && pool.length) cards.push(pool.splice(Math.floor(rng(s) * pool.length), 1)[0]);
    s.choice = { cards };
  }
  function choose(s, id) {
    if (!s.choice || !s.choice.cards.includes(id)) return false;
    const c = s.cfg, l = (s.up[id] || 0) + 1;
    if (id !== 'soin') s.up[id] = l;
    if (id === 'soin') s.protection = Math.min(c.protection, s.protection + 5);
    if (id === 'encrier') { c.inkMax = 12 + 2 * l; s.ink = c.inkMax; }
    if (id === 'aimant') c.magnet = UP.aimant[l];
    if (id === 'bouclier') for (const f of s.friends) { f.shield = 1; f.shieldT = 0; }
    if (id === 'chouette' && !s.owls.length) s.owls.push({ x: s.sage.x, y: s.sage.y - 60, mode: 'tour', t: 0, cd: 1.5, a: 0 });
    if (id === 'chouettes') { const want = l >= 2 ? 4 : 2; while (s.owls.length < want) s.owls.push({ x: s.sage.x, y: s.sage.y - 60, mode: 'tour', t: 0, cd: 0.5 + s.owls.length * 0.4, a: s.owls.length * Math.PI / 2 }); }
    if (id === 'large') c.traitWidth = 28 + 12 * l;
    if (id === 'pas' || id === 'comete') c.sageSpeed = 300 + 60 * lv(s, 'pas') + (lv(s, 'comete') ? 70 : 0);
    if (id === 'solide' || id === 'rempart') c.wallLife = 3 + lv(s, 'solide') + (lv(s, 'rempart') ? 2 : 0);
    s.choice = null; s.pagesTaken++;
    const C = CARDS[id];
    say(s, C.fam === 'combo' ? `Combo ! ${C.nom}${l > 1 ? ` niveau ${l}` : ''} : ${C.txt(l)}` : `${C.nom}${id === 'soin' ? '' : ` (niveau ${l})`} : ${C.txt(l)}`, 3.5);
    return true;
  }
  const TYPES = {
    cogneur: { r: 18, hp: 3, speed: 55, dmg: 1, rate: 1.0, shards: 1 },
    coureur: { r: 13, hp: 1, speed: 118, dmg: 1, rate: 0.8, shards: 1 },
    brute: { r: 23, hp: 7, speed: 48, dmg: 1, rate: 0.9, shards: 2 },
    costaud: { r: 30, hp: 16, speed: 34, dmg: 2, rate: 1.2, shards: 3 },
    lanceur: { r: 16, hp: 2, speed: 60, dmg: 1, rate: 2.4, shards: 1, range: 240 },
    dalle: { r: 20, hp: 6, speed: 46, dmg: 1, rate: 1.0, shards: 1 },
    mortier: { r: 20, hp: 5, speed: 42, dmg: 0, rate: 4.5, shards: 1, encre: true },
    bombe: { r: 15, hp: 3, speed: 88, dmg: 3, rate: 1, shards: 1 }
  };
  const SYMS = ['🔥', '💧', '🌙', '⭐', '🔑', '🍃'];
  // version 17 [Romain, 25 nov. : « que deux personnes à protéger, juste le Barde et l'Alchimiste », « enlève le Pisteur »] :
  // le Pisteur n'est plus dans ce combat (il a le sien, contre la garde de Grosbec) : ni au milieu, ni dans les codes.
  // version 19 [Romain, 25 nov., 16 h 42 : « on laisse tomber l'idée que les autres passent des codes », « le Sage, il doit tenir 10 minutes. À 10 minutes, Grosbec, il dit ça suffit »]
  const CODES = {}, ORDER = [], POSTE = {};
  const HEART = { x: 450, y: 175 };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  function rng(s) { let t = (s.seed = (s.seed + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }

  function newGame(o = {}) {
    const cfg = { ...CFG, ...(o.cfg || {}) };
    if (o.cfg && o.cfg.cost) cfg.cost = { ...CFG.cost, ...o.cfg.cost };
    const s = {
      cfg, W, H, t: 0, realT: 0, seed: o.seed ?? ((Math.random() * 1e9) | 0),
      friends: [
        { id: 'B', nom: 'le Barde', x: 411, y: 443, r: 27, flash: 0, free: false, cd: 0 },
        { id: 'A', nom: "l'Alchimiste", x: 489, y: 443, r: 27, flash: 0, free: false, cd: 0 }],
      sage: { x: 450, y: 600, r: 22, tx: null, ty: null, aim: [0, -1] },
      heart: { bare: false },
      soldiers: [], bolts: [], stones: [], shards: [], walls: [], fx: [], puddles: [], potions: [], notes: [],
      pages: [], choice: null, up: {}, grosKills: 0, pageIdx: 0, pageNeed: cfg.pageFirst, pagesTaken: 0, orbitA: 0, orbitR: 0, tourT: 0, orbitHit: {}, sealT: 0, traps: [], trapT: 2, chainT: 1, firelines: [], owls: [], inkT: 0, novaT: 2, orageLeft: 0, ballChain: 0, strikeN: 0, echoes: [], stormT: 6, trail: [], trailHit: {}, trailD: 0, frenzy: 0, tornados: [], pulseT: 8, rage: 0,
      protection: cfg.protection, ink: cfg.inkStart, boltT: 0, spawnT: 1.5, burstT: 22, regenT: 0,
      announced: [], entered: [], zones: [], vu: {}, combo: 0, comboT: 0, bestCombo: 0, inRune: false, runeKills: 0,
      kills: 0, runes: 0, nextId: 1, over: null, shake: 0, msg: '', msgT: 0
    };
    // l'ordre où les amis finissent leur combat change à chaque partie
    const order = [...ORDER]; for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng(s) * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    // le premier ami gagne un peu après la moitié du temps choisi (à 10 % près), le dernier à la fin
    const times = cfg.codeTimes || [0.55, 1].map((k, i) => Math.round(cfg.duree * k * (i < 1 ? 0.9 + rng(s) * 0.2 : 1)));
    s.order = order; s.codeAt = Object.fromEntries(order.map((id, i) => [id, times[i]]));
    return s;
  }
  const minutes = s => s.t / 60;
  // après 15 minutes, la fureur du cœur : +3 vies à tous toutes les 30 secondes
  const fury = s => Math.max(0, (s.rage || 0) - 2);
  const bonusHp = (s, type) => (GROS.includes(type) ? s.cfg.hpGros * Math.floor(s.t / s.cfg.hpGrosEvery) : Math.floor(s.t / s.cfg.hpEvery)) + 3 * fury(s) + s.cfg.hpLate * (GROS.includes(type) ? 3 : 1) * Math.floor(Math.max(0, s.t - s.cfg.lateFrom) / s.cfg.hpLateEvery);
  const sidesNow = s => Math.min(4, 1 + Math.floor(s.t / s.cfg.sideEvery));
  function say(s, m, d = 1.8) { s.msg = m; s.msgT = d; }
  const targets = s => s.friends.filter(f => !f.free);

  // ----- les soldats -----
  function pickType(s) {
    const t = s.t, r = rng(s);
    if (t > s.cfg.bombeAt && r > 0.93) return 'bombe';
    if (t > s.cfg.dalleAt && r > 0.83 && r <= 0.93) return 'dalle';
    if (t > s.cfg.costaudAt && r < 0.06) return 'costaud';
    if (t > 40 && r < 0.17) return 'lanceur';
    if (t > 25 && r < 0.33) return 'brute';
    if (t > 12 && r < 0.55) return 'coureur';
    return 'cogneur';
  }
  // les deux portes du mur du fond : [gauche, droite] de chacune ; un golem « du haut » sort par l'une des deux
  const PORTES = [[70, 230], [670, 830]];
  const porte = p => { const u = Math.max(0, Math.min(1, (p - 40) / 820)), P = PORTES[u < 0.5 ? 0 : 1], v = u < 0.5 ? u * 2 : (u - 0.5) * 2; return P[0] + v * (P[1] - P[0]); };
  function spawn(s, type, side, twin) {
    const T = TYPES[type], sd = side ?? Math.floor(rng(s) * 4), p = twin ?? rng(s) * 820 + 40, m = -30;
    const xy = [[porte(p), 30], [W - m, p], [p, H - m], [m, p]][sd], hp = T.hp + bonusHp(s, type);
    // pendant la fureur, de plus en plus de golems sont cuirassés : on ne peut plus les sonner
    const iron = fury(s) > 0 && rng(s) < Math.min(0.9, 0.25 + 0.15 * (fury(s) - 1));
    s.soldiers.push({ id: s.nextId++, type, x: xy[0], y: xy[1], r: T.r, hp, max: hp, vx: 0, vy: 0, atk: 0.5, daze: 0, flash: 0, burn: 0, burnCd: 0, burnTick: 0, held: false, fear: 0, dance: 0, charmCd: 0, iron, dalle: type === 'dalle' });
    if (MOTS[type] && !s.vu[type]) { s.vu[type] = 1; say(s, MOTS[type], 4); }
    // après 10 minutes : deux fois plus de lanceurs
    if (type === 'lanceur' && twin === undefined && s.t >= s.cfg.shootersX2At) spawn(s, 'lanceur', sd, Math.max(40, Math.min(860, p + 44)));
  }
  function spawning(s, dt) {
    if (s.heart.bare) return;
    const c = s.cfg, rate = (c.rate0 + c.rateAdd * Math.min(1, s.t / c.rateRamp) + c.rateLate * Math.max(0, Math.min(1, (s.t - c.lateFrom) / c.lateRamp))) * (1 + 0.6 * s.rage);
    s.spawnT -= dt;
    // le mortier : un seul d'abord, deux après 5 minutes, trois quand Grosbec est en colère
    if (s.t > c.mortierAt) { s.mortT = (s.mortT ?? 0) - dt; if (s.mortT <= 0) { s.mortT = c.mortierEvery; const max = 1 + (s.t > 300 ? 1 : 0) + (s.rage > 0 ? 1 : 0); if (s.soldiers.filter(u => u.type === 'mortier' && u.hp > 0).length < max) spawn(s, 'mortier'); } }
    const cap = c.maxAlive + 15 * fury(s);
    if (s.spawnT <= 0 && s.soldiers.length < cap) { spawn(s, pickType(s)); s.spawnT = 1 / rate * (0.6 + rng(s) * 0.8); }
    s.burstT -= dt;
    if (s.burstT <= 0) {
      // toutes les 3 minutes, la grosse vague arrive d'un côté de plus
      const n = c.burst0 + Math.floor(s.t / c.burstDiv), k = sidesNow(s), sides = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) { const j = Math.floor(rng(s) * (i + 1)); [sides[i], sides[j]] = [sides[j], sides[i]]; }
      for (const side of sides.slice(0, k)) {
        for (let i = 0; i < n && s.soldiers.length < cap; i++) spawn(s, pickType(s), side);
        s.fx.push({ k: 'side', side, life: 2.4, max: 2.4 });
      }
      const NOMS = ['par le haut', 'par la droite', 'par le bas', 'par la gauche'];
      say(s, k === 1 ? `Grosse vague ${NOMS[sides[0]]} : ${n} golems !` : k === 4 ? `Grosses vagues de tous les côtés : ${n} golems chacune !` : `Grosses vagues ${sides.slice(0, k).map(i => NOMS[i]).join(' et ')} : ${n} golems chacune !`, 2.6);
      s.burstT = c.burstEvery;
    }
  }

  // ----- version 20 : le rouge (Grosbec, le mortier, la bombe) -----
  const dansZone = (z, p, m = 0) => z.k === 'bande' ? (z.horiz ? Math.abs(p.y - z.y) : Math.abs(p.x - z.x)) < z.half + m : Math.hypot(p.x - z.x, p.y - z.y) < z.r + m;
  function lacher(s, u, mot) { u.dalle = false; s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 22, t: mot || 'dalle tombée !', life: 0.8, max: 0.8, col: '#ffe58a' }); }
  // le Sage touché : sonné 2 secondes (il ne tire plus, ne grave plus, marche au ralenti) et son encre tombe autour de lui
  function sonner(s) {
    const sg = s.sage; if (sg.invul > 0) return;
    sg.sonne = s.cfg.sonneT; sg.invul = s.cfg.sonneT + 1.2; s.sonnes = (s.sonnes || 0) + 1;
    s.fx.push({ k: 'pop', x: sg.x, y: sg.y - 40, t: 'sonné !', life: 0.9, max: 0.9, col: '#ff4d5e' }, { k: 'sonne', x: sg.x, y: sg.y, life: 0.2, max: 0.2 }); s.shake = Math.max(s.shake, 0.25);
    const n = s.ink; s.ink = 0;
    for (let i = 0; i < n; i++) { const a = rng(s) * 6.28, d = 70 + rng(s) * 70; s.shards.push({ x: Math.max(20, Math.min(W - 20, sg.x + Math.cos(a) * d)), y: Math.max(60, Math.min(H - 20, sg.y + Math.sin(a) * d)), t: rng(s) * 6, lock: 0.9 }); }
    if (!s.vu.sonne) { s.vu.sonne = 1; say(s, 'Aïe ! Le Sage est sonné, et son encre est tombée. Ramasse-la !', 3); }
  }
  // le rouge frappe : les golems, le Sage, et les amis s'ils sont dedans
  function frappe(s, z) {
    s.fx.push({ k: 'frappe', z, life: 0.45, max: 0.45 }); s.shake = Math.max(s.shake, z.k === 'poing' ? 0.35 : 0.2);
    for (const u of [...s.soldiers]) if (u.hp > 0 && dansZone(z, u, u.r * 0.5)) { hurt(s, u, z.dmg); s.rougeKills = (s.rougeKills || 0) + (u.hp <= 0 ? 1 : 0); if (z.k === 'poing' && u.hp > 0) stun(s, u); }
    if (dansZone(z, s.sage)) sonner(s);
    const f = targets(s).find(f => dansZone(z, f, f.r * 0.5));
    if (f) { hit(s, f, z.amis); s.rougeAmis = (s.rougeAmis || 0) + z.amis; if (!s.vu.amis) { s.vu.amis = 1; say(s, 'Le rouge a touché tes amis ! Emmène-le loin d’eux.', 3.5); } }
  }
  function zones(s, dt) {
    const sg = s.sage;
    for (const z of s.zones) {
      if (z.suit > 0) { z.suit -= dt; z.x = Math.max(30, Math.min(W - 30, sg.x + (z.ox || 0))); z.y = Math.max(70, Math.min(H - 30, sg.y + (z.oy || 0))); }   // le rouge suit le Sage un instant, puis se fige
      z.t -= dt;
      if (z.t <= 0) { frappe(s, z); if (s.over) return; }
    }
    s.zones = s.zones.filter(z => z.t > 0);
  }
  // Grosbec attaque le Sage : le poing, le balayage, la pluie de braises
  function grosbec(s, dt) {
    if (s.heart.bare) return;
    const c = s.cfg;
    s.gbT = (s.gbT ?? c.gbFirst) - dt;
    if (s.gbT > 0) return;
    s.gbT = (s.rage > 0 ? c.gbEveryRage : s.t < c.gbDebutT ? c.gbEveryDebut : c.gbEvery) * (0.8 + rng(s) * 0.4);   // les trois premières minutes, il frappe moins souvent : le temps d'apprendre
    const k = ['poing', 'bande', 'braises'][Math.floor(rng(s) * 3)], m = Math.floor(minutes(s)), sg = s.sage;
    if (k === 'poing') s.zones.push({ k, x: sg.x, y: sg.y, r: c.poingR, suit: c.gbSuit, t: c.poingT, T: c.poingT, dmg: 6 + Math.floor(1.5 * m), amis: 2 });
    else if (k === 'bande') s.zones.push({ k, x: sg.x, y: sg.y, horiz: rng(s) < 0.5, half: c.bandeH, suit: c.gbSuit, t: c.bandeT, T: c.bandeT, dmg: 5 + m, amis: 2 });
    else for (let i = 0; i < c.braiseN; i++) { const a = rng(s) * 6.28, d = i ? 90 + rng(s) * 130 : 0, T = c.braiseT + 0.18 * i; s.zones.push({ k: 'braise', x: sg.x, y: sg.y, ox: Math.cos(a) * d, oy: Math.sin(a) * d, r: c.braiseR, suit: 0.5, t: T, T, dmg: 4 + m, amis: 1 }); }
    s.fx.push({ k: 'gbcoup', coup: k, life: 1.4, max: 1.4 }); s.coups = (s.coups || 0) + 1;
    if (!s.vu.rouge) { s.vu.rouge = 1; say(s, 'Grosbec frappe ! Sors du rouge… et emmène-le loin de tes amis.', 4); }
  }
  // le porteur de bombe saute : tout ce qui est autour prend (les autres bombes sautent à leur tour)
  function explose(s, u) {
    const c = s.cfg; if ((s.bombN = (s.bombN || 0) + 1) > 14) return;
    s.fx.push({ k: 'boum', x: u.x, y: u.y, R: c.bombeR, life: 0.4, max: 0.4, bombe: true }); s.shake = Math.max(s.shake, 0.25);
    for (const v of [...s.soldiers]) if (v !== u && v.hp > 0 && dist(u, v) < c.bombeR + v.r) hurt(s, v, c.bombeD + Math.floor(minutes(s)));
    if (dist(u, s.sage) < c.bombeR) sonner(s);
    const f = targets(s).find(f => dist(u, f) < c.bombeR + f.r);
    if (f) { hit(s, f, 2); s.bombAmis = (s.bombAmis || 0) + 2; }
  }

  // ----- dégâts -----
  // ce qui vient d'une rune (le trait, le feu du trait, le mur, les boulets, la tornade) ne fait pas tomber d'encre
  const sansEncre = (s, f) => f();   // version 20 : une rune qui détruit redonne de l'encre, comme avant
  function hurt(s, u, n) {
    if (u.hp <= 0) return 0;
    u.hp -= n; u.flash = 0.12;
    s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 8, t: '−' + n, life: 0.7, max: 0.7, col: '#ff8a9a' });
    if (u.hp <= 0) { die(s, u); return 1; }
    return 0;
  }
  function die(s, u) {
    s.kills++;
    if (s.inRune) { s.runeKills++; s.bestCombo = Math.max(s.bestCombo, s.runeKills); }
    let n = 0;
    if (!s.noInk) {   // l'encre se gagne au bâton
      const gros = GROS.includes(u.type);
      n = s.cfg.grosShards && gros ? s.cfg.grosShards[GROS.indexOf(u.type)] : TYPES[u.type].shards;
      if (!gros && !TYPES[u.type].encre && s.cfg.shardEvery > 1) { s.shardN = (s.shardN ?? s.cfg.shardEvery - 1) + 1; if (s.shardN % s.cfg.shardEvery) n = 0; }   // un petit golem sur « shardEvery » (le tout premier en lâche un)
      if (gros) n += lv(s, 'moisson');
      if (s.inRune && s.runeKills >= 3) n += 1;   // une rune sur un gros groupe se rembourse (version 18)
    }
    for (let i = 0; i < n; i++) s.shards.push({ x: u.x + (rng(s) - .5) * 34, y: u.y + (rng(s) - .5) * 34, t: rng(s) * 6 });
    for (let i = 0; i < 8; i++) { const a = rng(s) * 6.28, v = 80 + rng(s) * 160; s.fx.push({ k: 'bit', x: u.x, y: u.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, max: 0.5, col: u.daze > 0 ? '#ffe58a' : '#9aa3b5' }); }
    if (u.type === 'costaud') s.shake = Math.max(s.shake, 0.25);
    if (u.type === 'bombe') explose(s, u);
    // le givre : un golem gelé qui casse gèle ses voisins
    if (lv(s, 'givre') >= 3 && u.frozen > 0 && (s.gelN = (s.gelN || 0) + 1) <= 10) {
      s.fx.push({ k: 'gel', x: u.x, y: u.y, R: 95, life: 0.4, max: 0.4 });
      for (const v of s.soldiers) if (v !== u && v.hp > 0 && dist(u, v) < 95 + v.r) { if (!v.iron && !(v.frozen > 0)) { v.frozen = 1.6; v.chillN = 0; } hurt(s, v, 2); }
    }
    if ((lv(s, 'volcan') >= 2 || lv(s, 'braise') >= 3) && u.burn > 0) {
      s.fx.push({ k: 'fireball', x: u.x, y: u.y, life: 0.5, max: 0.5 });
      for (const v of s.soldiers) if (v !== u && v.hp > 0 && dist(u, v) < 85 + v.r) { if (v.burn <= 0) { v.burn = s.cfg.burnT; v.burnTick = 0.4; } hurt(s, v, 3); }
    }
    if (lv(s, 'etoiles') >= 3 && u.lastStar && s.bolts.length < 260) {
      for (let i = 0; i < 3; i++) { const a = rng(s) * Math.PI * 2; s.bolts.push({ x: u.x, y: u.y, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, life: 0.7, dmg: 2, pierce: 0, hit: [u.id], star: true, small: true, bounce: 1 }); }
    }
    // une page du grimoire : au 2e gros détruit, puis il en faut un de plus à chaque fois (3, 4, 5…)
    if (false && GROS.includes(u.type) && ++s.grosKills >= s.pageNeed) {   // version 23 : les pages ne viennent plus des gros
      s.grosKills = 0; s.pageIdx++; s.pageNeed = s.pageIdx < s.cfg.pageVite ? s.cfg.pageFirst + Math.floor(s.cfg.pageStep * s.pageIdx) : s.cfg.pageFirst + Math.floor(s.cfg.pageStep * (s.cfg.pageVite - 1)) + Math.ceil(s.cfg.pageStepTard * (s.pageIdx - s.cfg.pageVite + 1));
      s.pages.push({ x: Math.max(40, Math.min(W - 40, u.x)), y: Math.max(60, Math.min(H - 40, u.y)), t: 0 });
      say(s, 'Une page du grimoire est tombée ! Passe dessus.', 2.4);
    }
  }
  // un golem sonné, touché par la lumière, « éclate » : depuis la version 19 il ne meurt plus d'office,
  // il perd la moitié de sa vie (au moins 4) et n'est plus sonné ; ses éclats touchent les voisins (les sonnés éclatent à leur tour)
  function shatter(s, u) {
    if (u.hp <= 0) return;
    if (u.iron) { hurt(s, u, 3); return; }
    u.hp = 0; die(s, u);
    s.fx.push({ k: 'burst', x: u.x, y: u.y, R: s.cfg.shatterR, life: 0.4, max: 0.4 });
    s.shake = Math.max(s.shake, 0.15);
    for (const v of s.soldiers) {
      if (v === u || v.hp <= 0 || dist(u, v) > s.cfg.shatterR + v.r) continue;
      if (v.daze > 0) shatter(s, v); else hurt(s, v, s.cfg.shatterDmg);
    }
    if (lv(s, 'orage') && s.orageLeft > 0) {
      const near = s.soldiers.filter(v => v.hp > 0 && v !== u && dist(u, v) < 230).sort((a, b) => dist(u, a) - dist(u, b)).slice(0, Math.min(3, s.orageLeft));
      for (const v of near) {
        if (v.hp <= 0) continue;
        s.orageLeft--; s.fx.push({ k: 'chain', pts: [{ x: u.x, y: u.y }, { x: v.x, y: v.y }], life: 0.35, max: 0.35, gold: true });
        if (lv(s, 'orage') >= 2 && v.daze > 0) shatter(s, v); else { stun(s, v); hurt(s, v, 1); }
      }
    }
  }
  // un soldat projeté qui cogne quelque chose est sonné
  const flying = (s, u) => Math.hypot(u.vx, u.vy) > s.cfg.flyMin;
  function stun(s, u) {
    if (u.iron) return;
    if (u.dalle) lacher(s, u);
    if (u.daze < 0.5) s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 10, t: 'sonné !', life: 0.7, max: 0.7, col: '#ffe58a' });
    u.daze = Math.max(u.daze, s.cfg.daze); u.vx *= 0.15; u.vy *= 0.15;
  }

  // ----- les murs : exactement la forme de l'arc tracé, en épais -----
  function nearOnSeg(a, b, x, y) {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
    const k = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2));
    return { x: a.x + dx * k, y: a.y + dy * k };
  }
  function nearOnWall(w, x, y) {
    let best = null, bd = 1e9;
    for (let i = 1; i < w.pts.length; i++) { const q = nearOnSeg(w.pts[i - 1], w.pts[i], x, y), d = Math.hypot(x - q.x, y - q.y); if (d < bd) { bd = d; best = { x: q.x, y: q.y, d, i }; } }
    return best;
  }
  const wallDist = (w, x, y) => nearOnWall(w, x, y).d;
  function pushOut(w, u) {
    const q = nearOnWall(w, u.x, u.y), m = u.r + w.half;
    if (q.d >= m) return false;
    let nx = (u.x - q.x) / (q.d || 1), ny = (u.y - q.y) / (q.d || 1);
    if (q.d < 0.01) { const a = w.pts[q.i - 1], b = w.pts[q.i], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; nx = -(b.y - a.y) / L; ny = (b.x - a.x) / L; }
    u.x = q.x + nx * m; u.y = q.y + ny * m;
    return true;
  }
  function blocks(w, p, q, r) {
    for (let i = 0; i <= 16; i++) { const t = i / 16; if (wallDist(w, p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t) < r + w.half) return true; }
    return false;
  }
  function waypoint(s, u, tgt) { // contourner le mur : passer par le bout qui raccourcit le chemin
    for (const w of s.walls) {
      if (!blocks(w, u, tgt, u.r)) continue;
      const P = w.pts, n = P.length, m = u.r + w.half + 18;
      const end = (a, b) => { const L = Math.hypot(a.x - b.x, a.y - b.y) || 1; return { x: a.x + (a.x - b.x) / L * m, y: a.y + (a.y - b.y) / L * m }; };
      const ends = [end(P[0], P[Math.min(3, n - 1)]), end(P[n - 1], P[Math.max(0, n - 4)])];
      let best = null, bd = 1e9;
      for (const e of ends) { const d = dist(u, e) + dist(e, tgt); if (d < bd) { bd = d; best = e; } }
      return best;
    }
    return tgt;
  }
  const nearestTarget = (s, u) => targets(s).reduce((b, f) => (!b || dist(u, f) < dist(u, b) ? f : b), null);

  // ----- un pas de jeu -----
  function step(s, dtReal, brush) {
    if (s.over || s.choice) return;
    dtReal = Math.min(dtReal, 0.05);
    // le ralenti de la gravure : 2 secondes au plus par rune, puis le temps reprend
    if (brush) s.brushT = (s.brushT || 0) + dtReal; else s.brushT = 0;
    s.slowF = s.cfg.slow;   // version 24 : le ralenti du début (le combat 14 fois plus lent), pour tout le monde
    s.lent = brush && s.slowF < 1 && s.brushT <= s.cfg.slowMax;
    const dt = dtReal * (s.lent ? s.slowF : 1);
    if (s.dome > 0) { s.dome -= dt; if (s.dome <= 0) s.pulseNow = true; }
    if (s.domeCd > 0) s.domeCd -= dt;
    s.t += dt; s.realT = (s.realT || 0) + dtReal; s.bombN = 0;
    if (s.msgT > 0) s.msgT -= dtReal;
    if (s.shake > 0) s.shake -= dtReal;
    if (s.comboT > 0) s.comboT -= dtReal;
    s.regenT += dt;
    if (s.regenT >= s.cfg.regen) { s.regenT = 0; if (s.protection < s.cfg.protection) s.protection++; }
    // à 10 minutes, Grosbec en a assez : le Sage a tenu
    if (s.t >= s.cfg.duree) { s.over = 'win'; s.heart.bare = true; s.soldiers = []; s.stones = []; s.bolts = []; s.zones = []; s.shake = 0.4; say(s, 'Grosbec : « ASSEZ ! Ça suffit ! »', 6); return; }
    spawning(s, dt);
    grosbec(s, dt);
    // version 23 : les pages tombent à heure fixe, quoi qu'on détruise : à 20 s, puis 23 s après, 24, 25… (19 pages en 10 minutes) ; un peu à l'écart des amis
    s.pageT = (s.pageT ?? s.cfg.pageT0) - dt;
    if (s.pageT <= 0) { s.pageT += s.cfg.pageGap + s.cfg.pageGapAdd * (++s.pageIdx); s.pagesTombees = (s.pagesTombees || 0) + 1; const a = rng(s) * 6.283, d = 170 + rng(s) * 110; s.pages.push({ x: Math.max(60, Math.min(W - 60, 450 + Math.cos(a) * d)), y: Math.max(90, Math.min(H - 60, 445 + Math.sin(a) * d * 0.9)), t: 0 }); say(s, 'Une page du grimoire est tombée ! Va la chercher.', 2.4); }
    for (const w of s.walls) w.life -= dt;
    if (lv(s, 'rempart') >= 3) for (const w of s.walls) if (w.life <= 0) {   // le rempart explose en disparaissant
      const m = w.pts[Math.floor(w.pts.length / 2)]; s.fx.push({ k: 'fireball', x: m.x, y: m.y, life: 0.45, max: 0.45, stone: true }); s.shake = Math.max(s.shake, 0.2);
      sansEncre(s, () => { for (const u of [...s.soldiers]) if (u.hp > 0 && wallDist(w, u.x, u.y) < w.half + u.r + 75) { stun(s, u); hurt(s, u, 5); } });
    }
    s.walls = s.walls.filter(w => w.life > 0);
    // le Sage (il passe à travers ses murs)
    const sg = s.sage;
    if (sg.tx !== null) {
      const dx = sg.tx - sg.x, dy = sg.ty - sg.y, d = Math.hypot(dx, dy);
      if (d > 4) { const v = Math.min(d, s.cfg.sageSpeed * dt * (sg.sonne > 0 ? s.cfg.sonneSpeed : 1)); sg.x += dx / d * v; sg.y += dy / d * v; }
    }
    sg.x = Math.max(sg.r, Math.min(W - sg.r, sg.x)); sg.y = Math.max(sg.r, Math.min(H - sg.r, sg.y));
    for (const f of s.friends) { const d = dist(sg, f), m = sg.r + f.r; if (d < m && d > 0) { sg.x = f.x + (sg.x - f.x) / d * m; sg.y = f.y + (sg.y - f.y) / d * m; } }
    if (sg.sonne > 0) sg.sonne -= dt;
    if (sg.invul > 0) sg.invul -= dt;
    zones(s, dt); if (s.over) return;
    // le bâton tire tout seul (pas quand le Sage est sonné)
    s.boltT -= dt;
    if (s.boltT <= 0 && !(sg.sonne > 0)) {
      const n = 1 + lv(s, 'double'), near = s.soldiers.filter(u => u.hp > 0 && dist(sg, u) < s.cfg.boltRange).sort((a, b) => dist(sg, a) - dist(sg, b));
      if (near.length) {
        for (let i = 0; i < n; i++) {
          const tg = near[i % near.length], off = i >= near.length ? (i % 2 ? 0.18 : -0.18) * Math.ceil(i / near.length) : 0;
          const a = Math.atan2(tg.y - sg.y, tg.x - sg.x) + off;
          if (i === 0) sg.aim = [Math.cos(a), Math.sin(a)];
          s.bolts.push({ x: sg.x, y: sg.y, vx: Math.cos(a) * s.cfg.boltSpeed, vy: Math.sin(a) * s.cfg.boltSpeed, life: s.cfg.boltRange / s.cfg.boltSpeed + 0.1, dmg: s.cfg.boltDmg + lv(s, 'lourd'), pierce: UP.percant[lv(s, 'percant')] + s.cfg.boltPierce, hit: [], staff: true, rico: UP.ricoN[lv(s, 'ricochet')] });
        }
        // le bâton de foudre : un tir sur quatre (puis trois, puis deux) est un éclair qui saute de golem en golem
        const FO = lv(s, 'foudre');
        if (FO && (s.shotN = (s.shotN || 0) + 1) % UP.foudreK[FO] === 0) { chainFrom(s, sg, UP.foudreN[FO], s.cfg.boltRange, UP.foudreD[FO] + lv(s, 'lourd')); if (FO >= 2) stun(s, near[0]); }
        s.boltT = s.cfg.boltEvery * UP.rapide[lv(s, 'rapide')];
      } else s.boltT = 0.1;
    }
    upgrades(s, dt);
    combos(s, dt);
    // les amis libérés aident, chacun avec son pouvoir
    const c = s.cfg;
    for (const f of s.friends) {
      if (!f.free) continue;
      f.cd -= dt; f.cd2 = (f.cd2 || 0) - dt; if (f.shoot > 0) f.shoot -= dt;
      if (f.leap) { f.leap.t -= dt; if (f.leap.t <= 0) f.leap = null; }
      const nearest = R => { let tg = null, b = R; for (const u of s.soldiers) { const d = dist(f, u); if (u.hp > 0 && d < b && !flying(s, u)) { b = d; tg = u; } } return tg; };
      if (f.id === 'A' && f.cd <= 0) {
        // une fiole là où les golems sont le plus serrés : boue, lianes ou feu, au hasard
        let best = null, bn = 0;
        for (const u of s.soldiers) { if (u.hp <= 0 || dist(u, f) > 460 || flying(s, u)) continue; let n = dist(u, { x: 450, y: 445 }) < 220 ? 1.5 : 0; for (const v of s.soldiers) if (dist(u, v) < c.puddleR) n++; if (n > bn) { bn = n; best = u; } }
        if (best) { s.potions.push({ x0: f.x, y0: f.y, x: best.x, y: best.y, t: 0, T: 0.55, kind: ['boue', 'lianes', 'feu'][Math.floor(rng(s) * 3)] }); f.cd = c.potionCd; f.shoot = 0.35; }
      }
      if (f.id === 'B' && f.cd <= 0) {
        // une partition : les golems qu'elle touche font demi-tour, ou se mettent à danser
        const tg = nearest(c.noteRange);
        if (tg) { const d = dist(f, tg) || 1; s.notes.push({ x: f.x, y: f.y, vx: (tg.x - f.x) / d * c.noteSpeed, vy: (tg.y - f.y) / d * c.noteSpeed, life: c.noteRange / c.noteSpeed, kind: ['demitour', 'danse', 'repousse'][Math.floor(rng(s) * 3)], hit: [] }); f.cd = c.noteCd; f.shoot = 0.35; }
      }
    }
    for (const p of s.potions) {
      p.t += dt;
      if (p.t >= p.T) { p.done = true; s.puddles.push({ x: p.x, y: p.y, R: c.puddleR, kind: p.kind, life: c.puddleLife, max: c.puddleLife }); s.fx.push({ k: 'flaque', x: p.x, y: p.y, kind: p.kind, life: 0.4, max: 0.4 }); }
    }
    s.potions = s.potions.filter(p => !p.done);
    for (const p of s.puddles) p.life -= dt;
    s.puddles = s.puddles.filter(p => p.life > 0);
    for (const n of s.notes) {
      n.x += n.vx * dt; n.y += n.vy * dt; n.life -= dt;
      for (const u of s.soldiers) {
        if (u.hp <= 0 || u.charmCd > 0 || n.hit.includes(u.id) || flying(s, u) || Math.hypot(u.x - n.x, u.y - n.y) > u.r + 30) continue;
        n.hit.push(u.id);
        if (n.kind === 'danse') { u.dance = c.charmT; u.fear = 0; }
        else if (n.kind === 'demitour') { u.fear = c.charmT; u.dance = 0; }
        else { const dx = u.x - 450, dy = u.y - 445, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * c.pushV * 0.85; u.vy = dy / d * c.pushV * 0.85; u.daze = 0; u.charmCd = 1; }
        s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 12, t: { danse: 'danse !', demitour: 'demi-tour !', repousse: 'repoussé !' }[n.kind], life: 0.7, max: 0.7, col: { danse: '#ffb3e6', demitour: '#9fd8ff', repousse: '#ffcf7a' }[n.kind] });
      }
    }
    s.notes = s.notes.filter(n => n.life > 0);
    for (const b of s.bolts) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.bounce > 0 && (b.x < 8 || b.x > W - 8 || b.y < 8 || b.y > H - 8)) { if (b.x < 8 || b.x > W - 8) b.vx = -b.vx; if (b.y < 8 || b.y > H - 8) b.vy = -b.vy; b.x = Math.max(8, Math.min(W - 8, b.x)); b.y = Math.max(8, Math.min(H - 8, b.y)); b.bounce--; b.life = Math.max(b.life, 0.9); b.hit = []; }
      for (const u of s.soldiers) {
        if (u.hp <= 0 || (b.hit && b.hit.includes(u.id)) || Math.hypot(u.x - b.x, u.y - b.y) >= u.r + 6) continue;
        // le porte-dalle : sa dalle arrête l'orbe qui arrive de face
        if (u.dalle && !(u.daze > 0)) { const f = nearestTarget(s, u) || sg, hd = dist(u, f) || 1, bv = Math.hypot(b.vx, b.vy) || 1; if ((b.vx * (f.x - u.x) + b.vy * (f.y - u.y)) / (bv * hd) < -0.25) { b.life = 0; s.blocs = (s.blocs || 0) + 1; if ((u.dalleN = (u.dalleN || 0) + 1) >= c.dalleCoups) lacher(s, u, 'dalle cassée !'); s.fx.push({ k: 'bloc', x: u.x + (f.x - u.x) / hd * u.r, y: u.y + (f.y - u.y) / hd * u.r, life: 0.25, max: 0.25 }); break; } }
        if (b.star) u.lastStar = true;
        const GI = b.staff ? lv(s, 'givre') : 0, BR = b.staff ? lv(s, 'braise') : 0, EX = b.staff ? lv(s, 'explosif') : 0;
        hurt(s, u, b.dmg * (GI >= 2 && u.frozen > 0 ? 2 : 1));
        u.lastStar = false;
        if (u.hp > 0) {
          if (GI) { u.chill = 2.5; u.chillN = (u.chillN || 0) + 1; if (GI >= 2 && u.chillN >= 3 && !u.iron && !(u.frozen > 0) && !(u.gelCd > 0)) { u.frozen = 2; u.chillN = 0; s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 10, t: 'gelé !', life: 0.7, max: 0.7, col: '#bfefff' }); } }
          if (BR && u.burnCd <= 0) { if (u.burn <= 0) u.burnTick = 0.5; u.burn = c.burnT; u.burnRune = false; }
        }
        if (EX) boum(s, u, EX, 0);
        if (false) {
          const near = s.soldiers.filter(v => v !== u && v.hp > 0 && dist(u, v) < 150).sort((a, c) => dist(u, a) - dist(u, c)).slice(0, 2);
          for (const v of near) { hurt(s, v, 2); s.fx.push({ k: 'chain', pts: [{ x: u.x, y: u.y }, { x: v.x, y: v.y }], life: 0.22, max: 0.22 }); }
        }
        if (b.pierce > 0) { b.pierce--; b.hit.push(u.id); }
        else if (b.rico > 0) {   // le ricochet : l'orbe repart vers le golem le plus proche qu'elle n'a pas encore touché
          b.hit.push(u.id);
          const libres = s.soldiers.filter(v => v.hp > 0 && !b.hit.includes(v.id) && dist(u, v) < 260).sort((p, q) => dist(u, p) - dist(u, q));
          if (!libres.length) { b.life = 0; break; }
          const RI = lv(s, 'ricochet'), vers = (o, v) => { const d = dist(u, v) || 1; o.x = u.x; o.y = u.y; o.vx = (v.x - u.x) / d * s.cfg.boltSpeed; o.vy = (v.y - u.y) / d * s.cfg.boltSpeed; o.life = 0.5; };
          b.rico--; if (RI >= 2) b.dmg++; vers(b, libres[0]);
          if (RI >= 3 && !b.dedouble && libres[1] && s.bolts.length < 220) { b.dedouble = true; const o = { ...b, hit: [...b.hit] }; vers(o, libres[1]); s.neufs = s.neufs || []; s.neufs.push(o); }
          break;
        }
        else { b.life = 0; break; }
      }
    }
    if (s.neufs && s.neufs.length) { s.bolts.push(...s.neufs); s.neufs = []; }
    s.bolts = s.bolts.filter(b => b.life > 0);
    s.boumN = 0; s.gelN = 0;
    // les soldats
    for (const u of s.soldiers) {
      if (u.flash > 0) u.flash -= dt;
      if (u.charmCd > 0) u.charmCd -= dt;
      if (u.knockCd > 0) u.knockCd -= dt;
      if (u.spit > 0) u.spit -= dt;
      if (u.burnCd > 0) u.burnCd -= dt;
      if (u.burn > 0) { u.burn -= dt; u.burnTick -= dt; if (u.burnTick <= 0) { u.burnTick = 1; const BR = lv(s, 'braise'), dg = c.burnDmg + (lv(s, 'volcan') ? 1 : 0) + (BR >= 2 ? BR - 1 : 0); if (u.burnRune) sansEncre(s, () => hurt(s, u, dg)); else hurt(s, u, dg); if (lv(s, 'volcan') || BR >= 2) for (const v of s.soldiers) if (v !== u && v.hp > 0 && v.burn <= 0 && v.burnCd <= 0 && dist(u, v) < u.r + v.r + 30) { v.burn = c.burnT; v.burnTick = 0.5; v.burnRune = u.burnRune; } } if (u.burn <= 0) u.burnCd = 3; }
      if (u.chill > 0) { u.chill -= dt; if (u.chill <= 0) u.chillN = 0; }
      if (u.gelCd > 0) u.gelCd -= dt;
      if (u.wallCd > 0) u.wallCd -= dt;
      if (u.hp <= 0) continue;
      const fl = flying(s, u);
      if (fl && u.dalle) lacher(s, u);   // chassé par une rune : la dalle tombe
      u.x += u.vx * dt; u.y += u.vy * dt;
      if (u.ball) {
        const sp = Math.hypot(u.vx, u.vy) || 1; if (sp < 650) { u.vx *= 650 / sp; u.vy *= 650 / sp; }
        let bounced = false;
        if (u.x < u.r || u.x > W - u.r) { u.vx = -u.vx; bounced = true; }
        if (u.y < u.r || u.y > H - u.r) { u.vy = -u.vy; bounced = true; }
        u.x = Math.max(u.r, Math.min(W - u.r, u.x)); u.y = Math.max(u.r, Math.min(H - u.r, u.y));
        if (bounced) { u.ball.left--; s.fx.push({ k: 'bonk', x: u.x, y: u.y, life: 0.2, max: 0.2 }); }
        u.ball.t -= dt;
        if (u.ball.left < 0 || u.ball.t <= 0) endBall(s, u);
        continue;
      }
      const fr = Math.exp(-(fl ? 2.6 : 6) * dt); u.vx *= fr; u.vy *= fr;
      // projeté contre le bord : sonné
      if (u.x < u.r || u.x > W - u.r || u.y < u.r || u.y > H - u.r) {
        u.x = Math.max(u.r, Math.min(W - u.r, u.x)); u.y = Math.max(u.r, Math.min(H - u.r, u.y));
        if (fl && !u.spin) stun(s, u);
      }
      // les flaques de l'Alchimiste
      let slow = 1; u.held = false; u.mud = false;
      for (const p of s.puddles) {
        if (Math.hypot(u.x - p.x, u.y - p.y) > p.R) continue;
        if (p.kind === 'boue') { slow = Math.min(slow, c.mudSlow); u.mud = true; }
        else if (p.kind === 'lianes') u.held = true;
        else if (u.burn <= 0 && u.burnCd <= 0) { u.burn = c.burnT; u.burnTick = 0.5; }
      }
      if (u.frozen > 0) { u.frozen -= dt; if (u.frozen <= 0) u.gelCd = 3; continue; }
      if (u.chill > 0) slow = Math.min(slow, 0.55);
      if (u.daze > 0) { u.daze -= dt; continue; }
      if (fl || u.held || u.spin) continue;
      if (u.dance > 0) { u.dance -= dt; if (u.dance <= 0) u.charmCd = 1.5; continue; }
      const T = TYPES[u.type];
      if (lv(s, 'volcan') >= 3 && u.burn > 0) { // ils courent partout en paniquant (et passent le feu)
        u.panicA = (u.panicA ?? rng(s) * 6.28) + (rng(s) - 0.5) * 6 * dt; const v = T.speed * 1.4 * dt; u.x += Math.cos(u.panicA) * v; u.y += Math.sin(u.panicA) * v;
        if (u.x < u.r + 5 || u.x > W - u.r - 5 || u.y < u.r + 5 || u.y > H - u.r - 5) u.panicA += Math.PI; continue;
      }
      if (u.fear > 0) { // demi-tour : il repart vers le bord
        u.fear -= dt; if (u.fear <= 0) u.charmCd = 1.5;
        const dx = u.x - 450, dy = u.y - 445, d = Math.hypot(dx, dy) || 1, v = T.speed * slow * dt * (1 + 0.15 * s.rage); u.x += dx / d * v; u.y += dy / d * v; continue;
      }
      if (u.type === 'mortier') {   // il s'installe loin (hors de portée du bâton depuis le centre) et vise le Sage
        const dc = Math.hypot(u.x - 450, u.y - 445);
        if (dc > c.mortierLoin) { const v = T.speed * slow * dt; u.x += (450 - u.x) / dc * v; u.y += (445 - u.y) / dc * v; }
        else { u.atk -= dt * slow; if (u.atk <= 0) { u.atk = T.rate; s.zones.push({ k: 'obus', x: sg.x, y: sg.y, r: c.obusR, suit: c.obusSuit, t: c.obusT, T: c.obusT, dmg: 5 + Math.floor(minutes(s)), amis: 1, de: { x: u.x, y: u.y } }); s.fx.push({ k: 'tir', x: u.x, y: u.y, life: 0.3, max: 0.3 }); } }
        continue;
      }
      const f = nearestTarget(s, u);
      if (!f) { const d = dist(u, sg) || 1, v = T.speed * dt; u.x += (sg.x - u.x) / d * v; u.y += (sg.y - u.y) / d * v; continue; }
      const d = dist(u, f);
      // le bélier défonce les murs
      if (s.cfg.belierCasse && u.type === 'brute') for (const w of s.walls) if (w.life > 0 && wallDist(w, u.x, u.y) < u.r + w.half + 8) { w.life = 0; const q = nearOnWall(w, u.x, u.y); s.fx.push({ k: 'casse', x: q.x, y: q.y, life: 0.4, max: 0.4 }); s.shake = Math.max(s.shake, 0.15); s.casses = (s.casses || 0) + 1; if (!s.vu.casse) { s.vu.casse = 1; say(s, 'Le bélier a défoncé ton mur !', 2.5); } }
      if (s.walls.some(w => wallDist(w, u.x, u.y) < u.r + w.half + s.cfg.wallSlowR)) slow = Math.min(slow, s.cfg.wallSlow);
      const reach = T.range ? T.range : u.r + f.r + 4;
      if (d > reach) { const g = s.cfg.belierCasse && u.type === 'brute' ? f : waypoint(s, u, f), dg = dist(u, g) || 1, v = T.speed * slow * dt * (1 + 0.15 * s.rage); u.x += (g.x - u.x) / dg * v; u.y += (g.y - u.y) / dg * v; }
      else {
        u.atk -= dt * slow;
        if (u.atk <= 0) {
          u.atk = T.rate;
          if (T.range) { const k = 230 / d; s.stones.push({ x: u.x, y: u.y, vx: (f.x - u.x) * k, vy: (f.y - u.y) * k, life: d / 230 + 0.2 }); }
          else if (u.type === 'bombe') { u.hp = 0; die(s, u); }   // il saute sur l'ami
          else hit(s, f, T.dmg);
          if (s.over) return;
        }
      }
    }
    // les pierres : le corps du Sage les arrête, le mur les renvoie d'où elles viennent
    for (const p of s.stones) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.back) {
        for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(p.x - u.x, p.y - u.y) < u.r + 8) { p.life = 0; if (p.mur) sansEncre(s, () => hurt(s, u, s.cfg.reflectDmg)); else hurt(s, u, s.cfg.reflectDmg); break; }
        continue;
      }
      if (Math.hypot(p.x - sg.x, p.y - sg.y) < sg.r + 9) { p.life = 0; s.fx.push({ k: 'pop', x: sg.x, y: sg.y - 34, t: 'paré !', life: 0.6, max: 0.6, col: '#bfefff' }); continue; }
      if (s.trail.length && lv(s, 'comete') && s.trail.some(q => Math.hypot(p.x - q.x, p.y - q.y) < 32)) { // la traînée de la comète arrête les pierres (et les renvoie, au niveau 2)
        if (lv(s, 'comete') >= 2) { p.back = true; p.vx = -p.vx * 1.4; p.vy = -p.vy * 1.4; p.life = Math.max(p.life, 1.6); s.fx.push({ k: 'pop', x: p.x, y: p.y - 20, t: 'renvoyée !', life: 0.6, max: 0.6, col: '#ffe58a' }); }
        else { p.life = 0; s.fx.push({ k: 'pop2', x: p.x, y: p.y, life: 0.25, max: 0.25 }); }
        continue;
      }
      if (s.walls.some(w => wallDist(w, p.x, p.y) < w.half + 8)) {
        p.back = true; p.mur = true; p.vx = -p.vx * 1.4; p.vy = -p.vy * 1.4; p.life = Math.max(p.life, 1.6);
        s.fx.push({ k: 'pop', x: p.x, y: p.y - 20, t: 'renvoyée !', life: 0.6, max: 0.6, col: '#ffe58a' });
        continue;
      }
      for (const f of targets(s)) if (Math.hypot(p.x - f.x, p.y - f.y) < f.r + 7) { p.life = 0; hit(s, f, 1); break; }
      if (s.over) return;
    }
    s.stones = s.stones.filter(p => p.life > 0);
    // chocs et places
    const all = s.soldiers;
    for (let i = 0; i < all.length; i++) {
      const a = all[i];
      for (let j = i + 1; j < all.length; j++) {
        const b = all[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
        if (d < m && d > 0.01) {
          if (a.ball || b.ball) { if (a.ball) knock(s, a, b, dx / d, dy / d); if (b.ball) knock(s, b, a, -dx / d, -dy / d); }
          else if ((flying(s, a) || flying(s, b)) && !(a.spit > 0 && b.spit > 0) && !a.spin && !b.spin) { stun(s, a); stun(s, b); }
          if (a.burn > 0 && b.burn <= 0 && b.burnCd <= 0) { b.burn = c.burnT; b.burnTick = 0.5; b.burnRune = a.burnRune; }
          else if (b.burn > 0 && a.burn <= 0 && a.burnCd <= 0) { a.burn = c.burnT; a.burnTick = 0.5; a.burnRune = b.burnRune; }
          const o = (m - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
        }
      }
      for (const w of s.walls) {
        if (a.ball) { const q = nearOnWall(w, a.x, a.y); if (q.d < a.r + w.half) { const nx = (a.x - q.x) / (q.d || 1), ny = (a.y - q.y) / (q.d || 1), dot = a.vx * nx + a.vy * ny; if (dot < 0) { a.vx -= 2 * dot * nx; a.vy -= 2 * dot * ny; a.ball.left--; s.fx.push({ k: 'bonk', x: a.x, y: a.y, life: 0.2, max: 0.2 }); } pushOut(w, a); } continue; }
        const fl = flying(s, a), pousse = pushOut(w, a);
        if (pousse && fl) stun(s, a);
        else if (pousse && lv(s, 'rempart') >= 2 && !a.iron && !(a.wallCd > 0)) {   // le rempart rejette en arrière : sonné
          const q = nearOnWall(w, a.x, a.y), nx = (a.x - q.x) / (q.d || 1), ny = (a.y - q.y) / (q.d || 1);
          stun(s, a); a.vx = nx * 560; a.vy = ny * 560; a.wallCd = 1.5; s.fx.push({ k: 'bonk', x: a.x, y: a.y, life: 0.2, max: 0.2 });
        }
      }
      for (const o of s.friends) {
        const dx = a.x - o.x, dy = a.y - o.y, d = Math.hypot(dx, dy), m = a.r + o.r;
        if (d < m && d > 0.01) { if (a.ball) { const nx = dx / d, ny = dy / d, dot = a.vx * nx + a.vy * ny; if (dot < 0) { a.vx -= 2 * dot * nx; a.vy -= 2 * dot * ny; } } else if (flying(s, a) && !a.spin) stun(s, a); a.x = o.x + dx / d * m; a.y = o.y + dy / d * m; }
      }
      { const dx = a.x - sg.x, dy = a.y - sg.y, d = Math.hypot(dx, dy), m = a.r + sg.r; if (d < m && d > 0.01) { a.x = sg.x + dx / d * m; a.y = sg.y + dy / d * m; } }
    }
    s.soldiers = s.soldiers.filter(u => u.hp > 0);
    // les éclats
    for (const p of s.shards) {
      p.t += dt; if (p.lock > 0) { p.lock -= dt; continue; }
      const d = dist(p, sg);
      if (d < s.cfg.magnet) { const v = Math.min(d, 520 * dt); p.x += (sg.x - p.x) / d * v; p.y += (sg.y - p.y) / d * v; }
      if (d < s.cfg.pickup) { p.taken = true; s.ink = Math.min(s.cfg.inkMax, s.ink + 1); }
    }
    s.shards = s.shards.filter(p => !p.taken);
    for (const p of s.pages) p.t += dt;
    if (!brush) { const i = s.pages.findIndex(p => dist(p, sg) < sg.r + 24); if (i >= 0) { s.pages.splice(i, 1); openChoice(s); } }
    for (const f of s.friends) if (f.flash > 0) f.flash -= dt;
    for (const e of s.fx) { e.life -= dtReal; if (e.k === 'bit') { e.x += e.vx * dtReal; e.y += e.vy * dtReal; } }
    s.fx = s.fx.filter(e => e.life > 0);
  }
  // une orbe explosive : les golems autour sont touchés (niveau 2 : soufflés ; niveau 3 : un golem détruit explose à son tour)
  function boum(s, u, L, prof) {
    if ((s.boumN = (s.boumN || 0) + 1) > 14) return;
    const R = UP.boumR[L], d0 = UP.boumD[L];
    s.fx.push({ k: 'boum', x: u.x, y: u.y, R, life: 0.28, max: 0.28 });
    for (const v of [...s.soldiers]) {
      if (v === u || v.hp <= 0) continue; const dx = v.x - u.x, dy = v.y - u.y, d = Math.hypot(dx, dy) || 1; if (d > R + v.r) continue;
      if (L >= 2 && !v.iron && !v.ball) { v.vx += dx / d * 300; v.vy += dy / d * 300; }
      if (hurt(s, v, d0) && L >= 3 && prof < 3) boum(s, v, L, prof + 1);
    }
  }
  // un éclair qui part de « from » et saute de golem en golem
  function chainFrom(s, from, N, R0, dmg = 2) {
    const pts = [{ x: from.x, y: from.y }], done = []; let cur = from, R = R0;
    for (let k = 0; k < N; k++) {
      let tg = null, b = R; for (const u of s.soldiers) { const d = dist(u, cur); if (u.hp > 0 && u !== from && !done.includes(u) && d < b) { b = d; tg = u; } }
      if (!tg) break; done.push(tg); pts.push({ x: tg.x, y: tg.y }); cur = tg; R = 200;
    }
    for (const u of done) hurt(s, u, dmg);
    if (done.length) s.fx.push({ k: 'chain', pts, life: 0.3, max: 0.3 });
    return done.length;
  }
  // ----- les combos jouissifs, à chaque instant -----
  function combos(s, dt) {
    const sg = s.sage, C = { x: 450, y: 445 }, alive = u => u.hp > 0;
    // l'écho du scribe fou : la rune se relance toute seule
    for (const e of s.echoes) {
      e.t -= dt; if (e.t > 0) continue; e.done = true;
      const k0 = s.kills; s.inRune = true; s.runeKills = 0; s.orageLeft = lv(s, 'orage') >= 2 ? 25 : 6;
      castAll(s, e.rune, true); s.fx.push({ k: 'echo', life: 0.4, max: 0.4 });
      s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
    }
    s.echoes = s.echoes.filter(e => !e.done);
    // la tornade : elle aspire, (elle se promène), puis elle recrache
    for (const tn of s.tornados) {
      tn.t -= dt;
      if (tn.L >= 3) { // vers la foule
        let cx = 0, cy = 0, n = 0; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - tn.x, u.y - tn.y) < 420) { cx += u.x; cy += u.y; n++; }
        if (n) { const dx = cx / n - tn.x, dy = cy / n - tn.y, d = Math.hypot(dx, dy) || 1, v = Math.min(d, 120 * dt); tn.x += dx / d * v; tn.y += dy / d * v; }
        const fx = tn.x - C.x, fy = tn.y - C.y, fd = Math.hypot(fx, fy) || 1; if (fd < 150) { tn.x = C.x + fx / fd * 150; tn.y = C.y + fy / fd * 150; } // elle ne marche pas sur les amis
        tn.tick -= dt; if (tn.tick <= 0) { tn.tick = 0.4; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - tn.x, u.y - tn.y) < 110) sansEncre(s, () => hurt(s, u, 2)); }
      }
      if (tn.t > 0) {
        for (const u of s.soldiers) {
          if (!alive(u) || u.ball || u.iron) continue;
          const dx = tn.x - u.x, dy = tn.y - u.y, d = Math.hypot(dx, dy) || 1;
          if (d > tn.R) continue;
          const pull = d > 40 ? 330 : 60; u.vx = dx / d * pull - dy / d * 260; u.vy = dy / d * pull + dx / d * 260; u.spin = true;
        }
      } else {
        tn.done = true;
        for (const u of s.soldiers) { if (!alive(u)) continue; const dx = u.x - tn.x, dy = u.y - tn.y, d = Math.hypot(dx, dy) || 1; if (d < tn.R + 40) { const k = s.cfg.repelV * 0.9; u.vx = dx / d * k; u.vy = dy / d * k; u.spin = false; u.spit = 0.3; if (!u.iron) { u.daze = s.cfg.daze; s.fx.push({ k: 'pop', x: u.x, y: u.y - u.r - 10, t: 'sonné !', life: 0.7, max: 0.7, col: '#ffe58a' }); } } }
        s.fx.push({ k: 'ring', x: tn.x, y: tn.y, R: tn.R, life: 0.6, max: 0.6 }); s.shake = Math.max(s.shake, 0.25);
      }
    }
    s.tornados = s.tornados.filter(t => !t.done);
    if (!s.tornados.length) for (const u of s.soldiers) u.spin = false;
    // la comète : une traînée derrière le Sage, et il fonce dans le tas
    const CO = lv(s, 'comete');
    if (CO) {
      const mv = Math.hypot(sg.x - (sg.px ?? sg.x), sg.y - (sg.py ?? sg.y)); s.trailD += mv;
      if (s.trailD > 22) { s.trailD = 0; s.trail.push({ x: sg.x, y: sg.y, t: 1.8, n: s.trail.length }); }
      for (const id in s.trailHit) { s.trailHit[id] -= dt; if (s.trailHit[id] <= 0) delete s.trailHit[id]; }
      for (const p of s.trail) {
        p.t -= dt;
        for (const u of s.soldiers) if (alive(u) && !s.trailHit[u.id] && Math.hypot(u.x - p.x, u.y - p.y) < u.r + 34) { hurt(s, u, 3); if (CO >= 2 && u.hp > 0) stun(s, u); s.trailHit[u.id] = CO >= 2 ? 1.5 : 0.4; }
        if (p.t <= 0 && CO >= 3 && p.n % 2 === 0) { s.fx.push({ k: 'pop2', x: p.x, y: p.y, life: 0.35, max: 0.35, big: true }); const k0 = s.kills; s.inRune = true; s.runeKills = 0; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - p.x, u.y - p.y) < u.r + 60) { if (u.daze > 0.3) shatter(s, u); else { stun(s, u); hurt(s, u, 3); } } s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; } }
      }
      s.trail = s.trail.filter(p => p.t > 0);
      if (CO >= 2 && mv / Math.max(dt, 1e-3) > 120) for (const u of s.soldiers) {
        if (!alive(u) || u.ball) continue; const dx = u.x - sg.x, dy = u.y - sg.y, d = Math.hypot(dx, dy) || 1;
        if (d < u.r + sg.r + 10) { u.vx = dx / d * 850; u.vy = dy / d * 850; hurt(s, u, 2); stun(s, u); u.vx = dx / d * 850; u.vy = dy / d * 850; s.fx.push({ k: 'bonk', x: u.x, y: u.y, life: 0.2, max: 0.2 }); }
      }
    }
    sg.px = sg.x; sg.py = sg.y;
    // l'orage qui tombe tout seul
    if (lv(s, 'orage') >= 3) {
      if (s.orageVeut && s.soldiers.length) {
        s.orageVeut = false; s.orageLeft = 10; const k0 = s.kills; s.inRune = true; s.runeKills = 0;
        const pool = s.soldiers.filter(alive); for (let i = 0; i < 5 && pool.length; i++) { const v = pool.splice(Math.floor(rng(s) * pool.length), 1)[0]; s.fx.push({ k: 'sky', x: v.x, y: v.y, life: 0.4, max: 0.4 }); if (v.daze > 0) shatter(s, v); else { stun(s, v); hurt(s, v, 1); } }
        s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
      }
    }
    // l'onde du sanctuaire
    const SA = lv(s, 'sanctuaire');
    if (SA >= 2 && s.pulseNow) {
      s.pulseNow = false;
      { const R = UP.sceauR[lv(s, 'sceau')]; const k0 = s.kills; s.inRune = true; s.runeKills = 0;
        for (const u of s.soldiers) {
          if (!alive(u) || Math.hypot(u.x - C.x, u.y - C.y) > R + u.r) continue;
          if (SA >= 3 && u.daze > 0) { shatter(s, u); continue; }
          const dx = u.x - C.x, dy = u.y - C.y, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * s.cfg.pushV * 0.9; u.vy = dy / d * s.cfg.pushV * 0.9; u.daze = 0;
        }
        s.inRune = false; const killed = s.kills - k0; if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
        s.fx.push({ k: 'pulse', R, life: 0.6, max: 0.6 }); s.shake = Math.max(s.shake, 0.18);
      }
    }
    // la colère du cœur : à 12 et à 14 minutes, ils arrivent plus nombreux et plus vite
    const rage = s.t >= s.cfg.rageAt[1] ? 2 : s.t >= s.cfg.rageAt[0] ? 1 : 0;   // la colère de Grosbec, avant la fin
    if (rage > s.rage) { const first = s.rage; s.rage = rage; if (rage <= 3) say(s, rage === 1 ? 'Grosbec se met en colère : les golems arrivent plus vite et plus nombreux !' : rage === 2 ? 'Grosbec est fou de rage !' : 'Grosbec devient fou furieux : plus rien ne l’arrête…', 4); if (first >= 3) return; s.fx.push({ k: 'side', side: 0, life: 2.4, max: 2.4 }); s.fx.push({ k: 'side', side: 2, life: 2.4, max: 2.4 }); s.shake = 0.4; }
  }
  // ----- les pouvoirs des cartes, à chaque instant -----
  function upgrades(s, dt) {
    const sg = s.sage, C = { x: 450, y: 445 }, alive = u => u.hp > 0;
    // pages volantes
    const nP = UP.pagesN[lv(s, 'pages')];
    if (nP) {
      s.orbitA += dt * 3.2;
      let R = UP.pagesR[lv(s, 'pages')];
      if (lv(s, 'tornade')) { s.tourT += dt; R += (330 - R) * (0.5 - 0.5 * Math.cos(s.tourT * Math.PI / 2)); }
      s.orbitR = R;
      for (const id in s.orbitHit) { s.orbitHit[id] -= dt; if (s.orbitHit[id] <= 0) delete s.orbitHit[id]; }
      for (let i = 0; i < nP; i++) {
        const a = s.orbitA + i * Math.PI * 2 / nP, px = sg.x + Math.cos(a) * R, py = sg.y + Math.sin(a) * R;
        for (const u of s.soldiers) if (alive(u) && !s.orbitHit[u.id] && Math.hypot(u.x - px, u.y - py) < u.r + 14) { hurt(s, u, 2); s.orbitHit[u.id] = 0.6; }
      }
    }
    // sceau de garde
    if (lv(s, 'sceau') && s.t - (s.derniereRune ?? -99) < UP.sceauDur[lv(s, 'sceau')]) {
      s.sealT -= dt;
      if (s.sealT <= 0) {
        s.sealT = UP.sceauT[lv(s, 'sceau')]; const R = UP.sceauR[lv(s, 'sceau')]; let n = 0;
        for (const u of s.soldiers) if (alive(u) && dist(u, C) < R) { hurt(s, u, 1); n++; }
        if (n) s.fx.push({ k: 'seal', life: 0.35, max: 0.35 });
      }
    }
    // rune piège
    if (lv(s, 'piege')) {
      s.trapT -= dt;
      if (s.trapT <= 0) {
        let tg = null, b = 360; for (const u of s.soldiers) { const d = dist(u, C); if (alive(u) && !flying(s, u) && d < b) { b = d; tg = u; } }
        if (tg) { s.traps.push({ x: tg.x, y: tg.y, t: 0.7, max: 0.7, R: UP.piegeR[lv(s, 'piege')] }); s.trapT = UP.piegeT[lv(s, 'piege')]; } else s.trapT = 0.5;
      }
      for (const tr of s.traps) {
        tr.t -= dt;
        if (tr.t <= 0 && !tr.done) { tr.done = true; for (const u of s.soldiers) if (alive(u) && Math.hypot(u.x - tr.x, u.y - tr.y) < tr.R + u.r) stun(s, u); s.fx.push({ k: 'trap', x: tr.x, y: tr.y, R: tr.R, life: 0.45, max: 0.45 }); s.shake = Math.max(s.shake, 0.1); }
      }
      s.traps = s.traps.filter(tr => !tr.done);
    }
    // lumière en chaîne
    if (false && lv(s, 'chaine')) {   // version 21 : plus de chaîne automatique
      s.chainT -= dt;
      if (s.chainT <= 0) s.chainT = chainFrom(s, sg, UP.chaineN[lv(s, 'chaine')], 380) ? UP.chaineT[lv(s, 'chaine')] : 0.4;
    }
    // pluie d'étoiles
    if (lv(s, 'etoiles')) {
      s.novaT -= dt;
      if (s.novaT <= 0 && s.soldiers.length) {
        const L = lv(s, 'etoiles'); s.novaT = L >= 2 ? 3 : 5;
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + s.t; s.bolts.push({ x: sg.x, y: sg.y, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, life: 1.3, dmg: s.cfg.boltDmg + lv(s, 'lourd') + 1, pierce: UP.percant[lv(s, 'percant')], hit: [], star: true, staff: true, bounce: L >= 2 ? 2 : 0 }); }
        s.fx.push({ k: 'nova', x: sg.x, y: sg.y, life: 0.5, max: 0.5 });
      }
    }
    // le rayon : il part du Sage vers le golem le plus proche et traverse toute la salle
    const RA = lv(s, 'rayon');
    if (RA) {
      s.rayT = (s.rayT ?? 1) - dt;
      if (s.rayT <= 0) {
        let tg = null, bd = 560; for (const u of s.soldiers) { const d = dist(u, sg); if (alive(u) && d < bd) { bd = d; tg = u; } }
        if (!tg) s.rayT = 0.3;
        else {
          s.rayT = UP.rayonT[RA]; const dx = (tg.x - sg.x) / (bd || 1), dy = (tg.y - sg.y) / (bd || 1), W2 = UP.rayonW[RA], dg = UP.rayonD[RA] + lv(s, 'lourd');
          for (const sens of RA >= 3 ? [1, -1] : [1]) {
            const b = { x: sg.x + dx * 1300 * sens, y: sg.y + dy * 1300 * sens };
            for (const u of [...s.soldiers]) { if (!alive(u)) continue; const q = nearOnSeg(sg, b, u.x, u.y); if (Math.hypot(u.x - q.x, u.y - q.y) < u.r + W2) hurt(s, u, dg); }
            s.fx.push({ k: 'beam', a: { x: sg.x, y: sg.y }, b: { x: Math.max(-40, Math.min(W + 40, b.x)), y: Math.max(-40, Math.min(H + 40, b.y)) }, life: 0.3, max: 0.3, ray: true });
          }
        }
      }
    }
    // les orbes gardiennes : elles tournent tout près du Sage
    const GA = lv(s, 'gardiennes');
    if (GA) {
      s.gardA = (s.gardA || 0) + dt * 4.2; s.gardHit = s.gardHit || {};
      for (const id in s.gardHit) { s.gardHit[id] -= dt; if (s.gardHit[id] <= 0) delete s.gardHit[id]; }
      const n = UP.gardN[GA], R = UP.gardR[GA];
      for (let i = 0; i < n; i++) {
        const a = s.gardA + i * Math.PI * 2 / n, px = sg.x + Math.cos(a) * R, py = sg.y + Math.sin(a) * R;
        for (const u of s.soldiers) if (alive(u) && !s.gardHit[u.id] && Math.hypot(u.x - px, u.y - py) < u.r + 15) {
          s.gardHit[u.id] = 0.5;
          if (GA >= 2 && !u.iron && !u.ball) { const dx = u.x - sg.x, dy = u.y - sg.y, d = Math.hypot(dx, dy) || 1; u.vx = dx / d * 430; u.vy = dy / d * 430; }
          hurt(s, u, UP.gardD[GA] + lv(s, 'lourd'));
        }
        for (const p of s.stones) if (!p.back && Math.hypot(p.x - px, p.y - py) < 20) p.life = 0;
      }
      if (GA >= 3) { s.gardT = (s.gardT ?? 4) - dt; if (s.gardT <= 0 && s.soldiers.length) { s.gardT = 4; for (let i = 0; i < n; i++) { const a = s.gardA + i * Math.PI * 2 / n; s.bolts.push({ x: sg.x + Math.cos(a) * R, y: sg.y + Math.sin(a) * R, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, life: 0.9, dmg: s.cfg.boltDmg + lv(s, 'lourd') + 1, pierce: 2 + UP.percant[lv(s, 'percant')], hit: [], staff: true, star: true, rico: UP.ricoN[lv(s, 'ricochet')] }); } s.fx.push({ k: 'nova', x: sg.x, y: sg.y, life: 0.5, max: 0.5 }); } }
    }
    // encre vive
    if (lv(s, 'scribe')) { s.inkT += dt; if (s.inkT >= 2) { s.inkT = 0; s.ink = Math.min(s.cfg.inkMax, s.ink + 1); } }
    if (s.frenzy > 0) { s.frenzy -= dt; if (s.frenzy <= 0) say(s, 'La frénésie est finie.', 1.5); }
    // bouclier de cristal : il revient
    if (lv(s, 'bouclier')) for (const f of s.friends) if (!f.shield) { f.shieldT -= dt; if (f.shieldT <= 0) { f.shield = 1; f.shieldT = 0; } }
    // les chouettes
    for (const o of s.owls) {
      const L = lv(s, 'chouette'); o.a += dt * 1.6;
      const home = { x: sg.x + Math.cos(o.a) * 55, y: sg.y - 20 + Math.sin(o.a) * 30 };
      if (o.mode === 'tour') {
        o.x += (home.x - o.x) * Math.min(1, dt * 8); o.y += (home.y - o.y) * Math.min(1, dt * 8); o.cd -= dt;
        if (o.cd <= 0 && o.charge > 0) {
          let tg = null, b = 560; for (const u of s.soldiers) { const d = dist(u, sg); if (alive(u) && u.type === 'lanceur' && d < b) { b = d; tg = u; } }
          if (!tg) { b = 380; for (const u of s.soldiers) { const d = dist(u, sg); if (alive(u) && d < b) { b = d; tg = u; } } }
          if (tg) { o.mode = 'pique'; o.tg = tg; o.t = 0; o.x0 = o.x; o.y0 = o.y; o.charge--; } else o.cd = 0.4;
        }
      } else if (o.mode === 'pique') {
        o.t += dt; const k = Math.min(1, o.t / 0.35), tg = o.tg;
        o.x = o.x0 + (tg.x - o.x0) * k; o.y = o.y0 + (tg.y - o.y0) * k;
        if (k >= 1) { if (tg.hp > 0) hurt(s, tg, UP.chouetteD[L]); s.fx.push({ k: 'slash', x: tg.x, y: tg.y, life: 0.3, max: 0.3 }); if (lv(s, 'chouettes')) chainFrom(s, tg, 3, 200);
          if (lv(s, 'chouettes') >= 3 && tg.hp > 0) { // elle le jette sur le plus gros groupe
            let best = null, bn = 0; for (const u of s.soldiers) { if (u === tg || u.hp <= 0) continue; let n = 0; for (const v of s.soldiers) if (dist(u, v) < 110) n++; if (n > bn) { bn = n; best = u; } }
            if (best) { const dx = best.x - tg.x, dy = best.y - tg.y, d = Math.hypot(dx, dy) || 1; tg.vx = dx / d * 950; tg.vy = dy / d * 950; tg.daze = 0; }
          }
          o.mode = 'retour'; o.t = 0; o.x0 = o.x; o.y0 = o.y; o.tg = null; }
      } else {
        o.t += dt; const k = Math.min(1, o.t / 0.45);
        o.x = o.x0 + (home.x - o.x0) * k; o.y = o.y0 + (home.y - o.y0) * k;
        if (k >= 1) { o.mode = 'tour'; o.cd = 0.25; }
      }
    }
    // la ligne de feu du trait brûlant
    for (const fl of s.firelines) {
      fl.life -= dt;
      const { a, b } = fl;
      for (const u of s.soldiers) { if (!alive(u) || u.burn > 0 || u.burnCd > 0) continue; const q = nearOnSeg(a, b, u.x, u.y); if (Math.hypot(u.x - q.x, u.y - q.y) < u.r + (fl.lava ? 34 : 20)) { u.burn = s.cfg.burnT; u.burnTick = 0.3; u.burnRune = true; } }
    }
    s.firelines = s.firelines.filter(fl => fl.life > 0);
    // le mur d'épines
    if (lv(s, 'rempart')) for (const w of s.walls) for (const u of s.soldiers) if (alive(u) && u.burn <= 0 && u.burnCd <= 0 && wallDist(w, u.x, u.y) < w.half + u.r + 14) { u.burn = s.cfg.burnT; u.burnTick = 0.3; u.burnRune = true; }
    const ep = UP.epines[lv(s, 'epines')];
    if (ep) for (const w of s.walls) {
      w.thornT = (w.thornT ?? 0) - dt;
      if (w.thornT > 0) continue;
      w.thornT = 1 / ep;
      for (const u of s.soldiers) if (alive(u) && wallDist(w, u.x, u.y) < w.half + u.r + 12) sansEncre(s, () => hurt(s, u, 1));
    }
  }
  // la fin d'un boulet : il s'arrête sonné (au niveau 3, il explose)
  function endBall(s, u) {
    u.ball = null; u.vx *= 0.1; u.vy *= 0.1;
    if (lv(s, 'bowling') >= 3) {
      s.fx.push({ k: 'fireball', x: u.x, y: u.y, life: 0.45, max: 0.45, stone: true }); s.shake = Math.max(s.shake, 0.15);
      sansEncre(s, () => { for (const v of [...s.soldiers]) if (v.hp > 0 && v !== u && dist(u, v) < 105 + v.r) { stun(s, v); hurt(s, v, 4); } hurt(s, u, 4); });
    }
    if (u.hp > 0) stun(s, u);
  }
  // un boulet qui en touche un autre : il le renverse (et, au niveau 2, en fait un boulet)
  function knock(s, ball, v, nx, ny) {
    if (v.ball || v.knockCd > 0) return;
    if (v.iron) { v.knockCd = 0.5; hurt(s, v, 1); return; }
    v.knockCd = 0.5; s.strikeN++;
    if (s.strikeN === 5) { s.fx.push({ k: 'pop', x: v.x, y: v.y - 40, t: 'STRIKE !', life: 1.2, max: 1.2, col: '#ffd23f' }); s.fx.push({ k: 'strike', x: v.x, y: v.y, life: 0.5, max: 0.5 }); }
    if (lv(s, 'bowling') >= 2 && s.ballChain > 0) { s.ballChain--; v.ball = { left: 3, t: 2.2 }; v.vx = nx * 720; v.vy = ny * 720; v.daze = 0; }
    else { stun(s, v); v.vx += nx * 350; v.vy += ny * 350; }
    sansEncre(s, () => hurt(s, v, 2));
  }
  function hit(s, f, n) {
    if (s.dome > 0) { if (((s.domePop = (s.domePop || 0) + 1) % 5) === 1) s.fx.push({ k: 'pop', x: f.x, y: f.y - f.r - 10, t: 'paré !', life: 0.6, max: 0.6, col: '#ffe58a' }); return; }
    if (f.shield > 0) {
      f.shield = 0; f.shieldT = UP.bouclierT[lv(s, 'bouclier')]; s.fx.push({ k: 'shieldbreak', x: f.x, y: f.y, life: 0.5, max: 0.5 });
      if (false && lv(s, 'sanctuaire')) { const R = UP.sceauR[lv(s, 'sceau')]; for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(u.x - 450, u.y - 445) < R) stun(s, u); s.fx.push({ k: 'trap', x: 450, y: 445, R, life: 0.5, max: 0.5 }); s.shake = Math.max(s.shake, 0.15); }
      return;
    }
    s.protection = Math.max(0, s.protection - n); f.flash = 0.25; s.perdu = (s.perdu || 0) + n;
    s.fx.push({ k: 'pop', x: f.x, y: f.y - f.r - 10, t: '−' + n, life: 0.8, max: 0.8, col: '#ff4d5e' });
    if (n > 1) s.shake = Math.max(s.shake, 0.2);
    if (s.protection <= 0) s.over = 'lose';
  }

  // ----- les codes des autres joueurs -----
  function enterCode(s, seq) {
    for (const id of ORDER) {
      if (s.entered.includes(id)) continue;
      if (CODES[id].every((c, i) => c === seq[i])) {
        s.entered.push(id);
        const f = s.friends.find(x => x.id === id); f.free = true; f.cd = 0.3;
        s.protection = Math.min(s.cfg.protection, s.protection + s.cfg.codeBonus);
        s.fx.push({ k: 'free', x: f.x, y: f.y, life: 1, max: 1 });
        if (s.entered.length === ORDER.length) { s.over = 'win'; s.heart.bare = true; s.soldiers = []; s.stones = []; s.notes = []; s.potions = []; s.puddles = []; s.shake = 0.4; say(s, 'Tes deux amis ont gagné : l’armure tombe !', 6); }
        else say(s, `${cap(f.nom)} vient t’aider ! Protection +${s.cfg.codeBonus}.`, 3);
        return { ok: true, id };
      }
    }
    say(s, 'Ce code ne marche pas. Vérifie !', 2);
    return { ok: false };
  }

  // ----- reconnaître un tracé -----
  function resample(pts, gap) {
    const out = [pts[0]]; let prev = pts[0], acc = 0;
    for (let i = 1; i < pts.length; i++) {
      let p = pts[i], d = Math.hypot(p.x - prev.x, p.y - prev.y);
      while (acc + d >= gap && d > 0) {
        const k = (gap - acc) / d, q = { x: prev.x + (p.x - prev.x) * k, y: prev.y + (p.y - prev.y) * k };
        out.push(q); prev = q; d = Math.hypot(p.x - prev.x, p.y - prev.y); acc = 0;
      }
      acc += d; prev = p;
    }
    if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1]);
    return out;
  }
  const pathLen = pts => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return l; };
  function straight(a, b, pts) { // assez droit pour un bras de V : peu de bosse par rapport à sa longueur
    const L = pathLen(pts), c = Math.hypot(b.x - a.x, b.y - a.y);
    if (!L || c / L < 0.88) return false;
    let sag = 0; for (const p of pts) sag = Math.max(sag, Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / (c || 1));
    return sag / (c || 1) < 0.11;
  }
  function recognize(pts) {
    if (pts.length < 3) return { kind: null };
    const len = pathLen(pts);
    if (len < 60) return { kind: null, why: 'Trop petit.' };
    const a = pts[0], b = pts[pts.length - 1], chord = Math.hypot(b.x - a.x, b.y - a.y);
    let sag = 0; for (const p of pts) sag = Math.max(sag, Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / (chord || 1));
    if (chord / len > 0.93 || (chord / len > 0.86 && sag / (chord || 1) < 0.12)) return { kind: 'trait', a, b };
    const r = resample(pts, 12);
    let turn = 0;
    for (let i = 2; i < r.length; i++) {
      const a1 = Math.atan2(r[i - 1].y - r[i - 2].y, r[i - 1].x - r[i - 2].x), a2 = Math.atan2(r[i].y - r[i - 1].y, r[i].x - r[i - 1].x);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn += d;
    }
    const T = Math.abs(turn);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const diag = Math.hypot(x1 - x0, y1 - y0);
    if (T > 3 * Math.PI) return { kind: 'spirale', x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    if (T > 1.3 * Math.PI && chord < 0.4 * diag) return { kind: 'ferme', poly: pts };
    // on lisse le tracé (le doigt tremble), puis on regarde ses virages
    const f6 = resample(pts, 6), sm = f6.map((p, i) => {
      if (i === 0 || i === f6.length - 1) return p;
      let x = 0, y = 0, n = 0; for (let k = Math.max(0, i - 3); k <= Math.min(f6.length - 1, i + 3); k++) { x += f6[k].x; y += f6[k].y; n++; }
      return { x: x / n, y: y / n };
    });
    const q = resample(sm, 24), turns = [];
    for (let i = 2; i < q.length; i++) {
      const a1 = Math.atan2(q[i - 1].y - q[i - 2].y, q[i - 1].x - q[i - 2].x), a2 = Math.atan2(q[i].y - q[i - 1].y, q[i].x - q[i - 1].x);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turns.push(d);
    }
    let net = 0, abs = 0, corner = 0, ci = 0;
    turns.forEach((d, i) => { net += d; abs += Math.abs(d); const w = Math.abs(d + (turns[i + 1] || 0)); if (w > corner) { corner = w; ci = i + 1; } });
    const deg = x => x * 180 / Math.PI;
    // le V : un seul virage sec
    if (deg(corner) > 45 && corner > 0.6 * Math.abs(net)) {
      // la vraie pointe : le point du tracé d'origine le plus loin de la ligne début-fin, près du virage
      let tip = q[ci], best = -1, k0 = 0, kd = 1e9;
      pts.forEach((p, k) => { const d = Math.hypot(p.x - q[ci].x, p.y - q[ci].y); if (d < kd) { kd = d; k0 = k; } });
      for (let k = Math.max(0, k0 - 12); k <= Math.min(pts.length - 1, k0 + 12); k++) {
        const p = pts[k], d = chord > 20 ? Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / chord : Math.hypot(p.x - a.x, p.y - a.y);
        if (d > best) { best = d; tip = p; }
      }
      const arm1 = q.slice(0, ci + 1), arm2 = q.slice(ci);
      if (arm1.length > 1 && arm2.length > 1 && pathLen(arm1) > 50 && pathLen(arm2) > 50) {
        const u1 = { x: a.x - tip.x, y: a.y - tip.y }, u2 = { x: b.x - tip.x, y: b.y - tip.y };
        const ang = deg(Math.acos(Math.max(-1, Math.min(1, (u1.x * u2.x + u1.y * u2.y) / (Math.hypot(u1.x, u1.y) * Math.hypot(u2.x, u2.y) || 1)))));
        if (ang <= CFG.vMax) {
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = mx - tip.x, dy = my - tip.y, dl = Math.hypot(dx, dy) || 1;
          return { kind: 'poussee', tip, a, b, dir: [dx / dl, dy / dl] };
        }
        if (ang < 160) return { kind: null, why: `V trop ouvert (${Math.round(ang)}°) : 90° au plus, comme un coin de carré.` };
      }
    }
    // l'arc de cercle : un virage doux et régulier, toujours du même côté
    if (corner < 0.6 * Math.abs(net) && deg(Math.abs(net)) > 35 && deg(Math.abs(net)) < 320 && Math.abs(net) > 0.65 * abs && chord > 60) return { kind: 'mur', pts: resample(sm, 16) };
    return { kind: null, why: T > 1.3 * Math.PI ? 'La forme n’est pas fermée.' : 'Rune pas reconnue.' };
  }
  function inside(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  }
  const NOM = { trait: 'Lumière', poussee: 'Le V', mur: 'Mur', spirale: 'Repousse' };
  const inTri = (p, a, b, c, m) => { // dans le triangle, avec une marge m
    const side = (p1, p2) => { const ex = p2.x - p1.x, ey = p2.y - p1.y, L = Math.hypot(ex, ey) || 1; return ((p.x - p1.x) * ey - (p.y - p1.y) * ex) / L; };
    const d1 = side(a, b), d2 = side(b, c), d3 = side(c, a), sg = Math.sign(side(a, b) + side(b, c) + side(c, a)) || 1;
    return d1 * sg > -m && d2 * sg > -m && d3 * sg > -m;
  };
  function costOf(s, rune) {
    if (rune.kind === 'ferme') return lv(s, 'dome') ? s.cfg.domeCost : 0;
    let base = rune.kind === 'spirale' ? (lv(s, 'tornade') ? 4 : s.cfg.inkMax / 2) : s.cfg.cost[rune.kind] ?? 0;
    if (rune.kind === 'poussee' && lv(s, 'bowling')) base = 1;
    return lv(s, 'scribe') ? Math.max(1, base - 1) : base;
  }
  // version 25 : une rune vient d'être gravée → les chouettes repartent, le sceau s'allume, l'orage du niveau 3 tombe
  function runeGravee(s) {
    s.derniereRune = s.t;
    for (const o of s.owls) o.charge = Math.min(2, (o.charge || 0) + 1);
    if (lv(s, 'orage') >= 3) s.orageVeut = true;
  }
  // la rune du bouclier : un cercle fermé ; les amis sont intouchables un moment
  function castDome(s) {
    const c = s.cfg;
    if (s.domeCd > 0) { say(s, `Le bouclier se recharge (encore ${Math.ceil(s.domeCd)} s).`); return { ok: false }; }
    if (s.ink < c.domeCost) { say(s, `Pas assez d’encre (il en faut ${c.domeCost}). Ramasse des éclats.`); return { ok: false }; }
    s.ink -= c.domeCost; s.runes++; s.brushT = 0; runeGravee(s); s.dome = s.domeMax = [0, 2.5, 4, 5.5][lv(s, 'dome')]; s.domeCd = s.dome + c.domeCd; s.domes = (s.domes || 0) + 1;
    if (lv(s, 'sanctuaire')) { const R = UP.sceauR[Math.max(1, lv(s, 'sceau'))]; for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(u.x - 450, u.y - 445) < R + u.r) stun(s, u); s.fx.push({ k: 'trap', x: 450, y: 445, R, life: 0.5, max: 0.5 }); }
    s.fx.push({ k: 'dome', life: 0.5, max: 0.5 }); say(s, `Bouclier ! Tes amis sont intouchables ${String(s.dome).replace('.', ',')} secondes.`);
    return { ok: true, hit: 0, killed: 0 };
  }
  // ----- graver une rune -----
  function cast(s, rune) {
    if (rune.kind === 'mur' && !lv(s, 'mur')) { say(s, 'Tu ne connais pas encore la rune du mur : elle est dans le grimoire.'); return { ok: false }; }
    if (rune.kind === 'spirale' && !lv(s, 'spirale')) { say(s, 'Tu ne connais pas encore l’escargot : il est dans le grimoire.'); return { ok: false }; }
    if (rune.kind === 'ferme') { if (!lv(s, 'dome')) { say(s, 'Un cercle ne fait rien… pour l’instant.'); return { ok: false }; } return castDome(s); }
    // au début le V est petit et le trait court : on les raccourcit (les cartes Grand V et Long trait les allongent)
    if (rune.kind === 'poussee') { const M = [1, 1.5, 2, 99][lv(s, 'grandv')] * s.cfg.vMaxBase; for (const k of ['a', 'b']) { const dx = rune[k].x - rune.tip.x, dy = rune[k].y - rune.tip.y, d = Math.hypot(dx, dy); if (d > M) rune = { ...rune, [k]: { x: rune.tip.x + dx / d * M, y: rune.tip.y + dy / d * M } }; } }
    if (rune.kind === 'trait') { const M = [s.cfg.traitMaxBase, 520, 9999][lv(s, 'long')], dx = rune.b.x - rune.a.x, dy = rune.b.y - rune.a.y, d = Math.hypot(dx, dy); if (d > M) { const mx = (rune.a.x + rune.b.x) / 2, my = (rune.a.y + rune.b.y) / 2, k = M / 2 / d; rune = { ...rune, a: { x: mx - dx * k, y: my - dy * k }, b: { x: mx + dx * k, y: my + dy * k } }; } }
    if (s.sage.sonne > 0) { say(s, 'Le Sage est sonné ! Attends une seconde.'); return { ok: false }; }
    const kind = rune.kind, cost = s.frenzy > 0 ? 0 : costOf(s, rune);
    if (s.ink < cost) { say(s, `Pas assez d’encre (il en faut ${cost}). Ramasse des éclats.`); return { ok: false }; }
    s.ink -= cost; s.runes++; s.brushT = 0; runeGravee(s);
    const k0 = s.kills; s.inRune = true; s.runeKills = 0; s.orageLeft = lv(s, 'orage') >= 2 ? 25 : 6;
    const hit = sansEncre(s, () => castAll(s, rune, false));
    if (lv(s, 'scribe') >= 3 && rune.kind !== 'mur') s.echoes.push({ rune, t: 0.55 });
    s.soldiers = s.soldiers.filter(u => u.hp > 0);
    s.inRune = false;
    const killed = s.kills - k0;
    if (killed >= 3) { s.combo = killed; s.comboT = 1.6; }
    // le scribe fou : la frénésie
    const SC = lv(s, 'scribe');
    if (SC >= 2 && s.frenzy <= 0 && killed >= (SC >= 3 ? 3 : 4)) { s.frenzy = SC >= 3 ? 10 : 6; s.fx.push({ k: 'frenzy', life: 1, max: 1 }); say(s, `FRÉNÉSIE ! ${s.frenzy} secondes d’encre gratuite !`, 2.5); return { ok: true, hit, killed }; }
    if (kind === 'trait') say(s, killed >= 3 ? `Lumière : ${killed} d’un coup !` : hit ? `Lumière : ${hit} touché${hit > 1 ? 's' : ''}.` : 'Lumière… dans le vide.');
    else if (kind === 'mur') say(s, `Un mur courbe, pour ${s.cfg.wallLife} secondes : il ralentit et renvoie les braises.`);
    else if (kind === 'spirale' && lv(s, 'tornade') >= 2) say(s, hit ? `Tornade ! ${hit} golem${hit > 1 ? 's' : ''} aspiré${hit > 1 ? 's' : ''} !` : 'Tornade… dans le vide.');
    else say(s, hit ? `${NOM[kind]} : ${hit} golem${hit > 1 ? 's' : ''} projeté${hit > 1 ? 's' : ''} !` : `${NOM[kind]}… dans le vide.`);
    return { ok: true, hit, killed };
  }
  // une rune et ses copies (la rune miroir : des copies gratuites, tournées autour des amis)
  function castAll(s, rune, echo) {
    let hit = effect(s, rune, echo);
    const M = lv(s, 'miroir');
    if (M) { const angs = M === 1 ? [Math.PI] : M === 2 ? [Math.PI, Math.PI / 2, -Math.PI / 2] : [1, 2, 3, 4, 5, 6, 7].map(k => k * Math.PI / 4); for (const a of angs) hit += effect(s, turnRune(rune, a), true); s.fx.push({ k: 'mirror', n: angs.length, life: 0.6, max: 0.6 }); }
    return hit;
  }
  // tourner une rune autour des amis (pour la rune miroir)
  function turnRune(r, a) {
    const C = { x: 450, y: 445 }, co = Math.cos(a), si = Math.sin(a);
    const T = p => ({ x: C.x + (p.x - C.x) * co - (p.y - C.y) * si, y: C.y + (p.x - C.x) * si + (p.y - C.y) * co });
    const o = { ...r, copy: true };
    if (r.a) o.a = T(r.a); if (r.b) o.b = T(r.b); if (r.tip) o.tip = T(r.tip);
    if (r.dir) o.dir = [r.dir[0] * co - r.dir[1] * si, r.dir[0] * si + r.dir[1] * co];
    if (r.pts) o.pts = r.pts.map(T);
    if (r.x !== undefined) { const q = T(r); o.x = q.x; o.y = q.y; }
    return o;
  }
  // ce que fait une rune (l'original ou une copie)
  function effect(s, rune, copy) {
    const kind = rune.kind; let hit = 0;
    if (kind === 'trait') {
      const { a, b } = rune, dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
      let dernier = null;
      const near = (x, y, w) => { const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2)); return Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t)) < w; };
      for (const u of [...s.soldiers]) {
        if (u.hp <= 0 || !near(u.x, u.y, u.r + s.cfg.traitWidth)) continue;
        hit++; dernier = u;
        if (u.daze > 0) shatter(s, u); else { hurt(s, u, s.cfg.traitDmg); if (u.hp > 0 && !u.iron && lv(s, 'eblouir')) { u.daze = Math.max(u.daze, lv(s, 'eblouir')); s.eblouis = (s.eblouis || 0) + 1; } }
      }
      if (dernier && !copy && lv(s, 'chaine')) chainFrom(s, dernier, UP.chaineN[lv(s, 'chaine')], 300);
      for (const p of s.stones) if (near(p.x, p.y, 34)) p.life = 0;
      s.fx.push({ k: 'beam', a, b, life: 0.45, max: 0.45 });
      if (lv(s, 'brulant')) { const lava = lv(s, 'volcan') >= 3, T = UP.brulant[lv(s, 'brulant')] * (lava ? 1.5 : 1); s.firelines.push({ a, b, life: T, max: T, lava }); }
    }
    if (kind === 'mur') {
      let P = rune.pts;
      const L = pathLen(P), M = s.cfg.wallMax;
      if (L > M) { const cut = Math.floor(P.length * (1 - M / L) / 2); P = P.slice(cut, P.length - cut); }
      const w = { pts: P, half: s.cfg.wallHalf, life: s.cfg.wallLife, max: s.cfg.wallLife };
      s.walls.push(w);
      for (const u of s.soldiers) if (pushOut(w, u)) hit++;
    }
    if (kind === 'spirale' && lv(s, 'tornade') >= 2) {
      const L = lv(s, 'tornade'); s.tornados.push({ x: rune.x, y: rune.y, t: L >= 3 ? 3.2 : 1.6, max: L >= 3 ? 3.2 : 1.6, R: s.cfg.repelR, L, tick: 0 });
      s.fx.push({ k: 'tornado', x: rune.x, y: rune.y, life: 0.4, max: 0.4 });
      for (const u of s.soldiers) if (dist(u, rune) < s.cfg.repelR + u.r) hit++;
    }
    else if (kind === 'spirale') {
      const R = s.cfg.repelR;
      for (const u of s.soldiers) {
        const dx = u.x - rune.x, dy = u.y - rune.y, d = Math.hypot(dx, dy);
        if (d < R + u.r) { hit++; const n = d || 1, k = s.cfg.repelV * (0.65 + 0.35 * (1 - Math.min(1, d / R))); u.vx = dx / n * k; u.vy = dy / n * k; u.daze = 0; }
      }
      s.fx.push({ k: 'ring', x: rune.x, y: rune.y, R, life: 0.6, max: 0.6 });
      s.shake = Math.max(s.shake, 0.22);
    }
    if (kind === 'poussee') { // tout ce qui est dans le V est chassé par l'ouverture
      const tn = UP.tonnerre[lv(s, 'tonnerre')];
      const BW = lv(s, 'bowling'); if (BW && !copy) { s.ballChain = 20; s.strikeN = 0; }
      for (const u of s.soldiers) if (inTri(u, rune.tip, rune.a, rune.b, u.r)) { hit++; u.vx = rune.dir[0] * s.cfg.pushV; u.vy = rune.dir[1] * s.cfg.pushV; u.daze = tn; if (BW && !u.iron) u.ball = { left: 4, t: 3 }; }
      s.fx.push({ k: 'vee', tip: rune.tip, a: rune.a, b: rune.b, dir: rune.dir, life: 0.5, max: 0.5, thunder: tn > 0, copy });
    }
    return hit;
  }
  return { W, H, CFG, TYPES, GROS, SYMS, CODES, ORDER, POSTE, HEART, PORTES, CARDS, UP, newGame, step, recognize, cast, costOf, inside, pathLen, enterCode, dist, bonusHp, sidesNow, minutes, choose, openChoice, cardPool, lv, combosReady, turnRune, hint, avance, dansZone };
})();
if (typeof module !== 'undefined') module.exports = G;
