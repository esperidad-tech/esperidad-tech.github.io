/* ==========================================================
   Brumeval v2 — données communes (rôles, talents, boutique,
   ingrédients, potions, villageois, niveaux)
   ========================================================== */
(function(){
'use strict';
var D = window.DONNEES = {};

D.SYM = {
  lune:{e:'🌙', n:'Lune'}, etoile:{e:'⭐', n:'Étoile'}, soleil:{e:'☀️', n:'Soleil'},
  cle:{e:'🔑', n:'Clé'}, champi:{e:'🍄', n:'Champignon'}, poisson:{e:'🐟', n:'Poisson'},
  arbre:{e:'🌳', n:'Arbre'}, cloche:{e:'🔔', n:'Cloche'}, chapeau:{e:'🎩', n:'Chapeau'},
  /* 12 symboles : 12³ − 12 = 1716 codes (au lieu de 720) ; une faute de frappe tombe sur un vrai code environ 1 fois sur 23.
     Des emojis anciens (affichés même par les vieilles tablettes Android), faciles à nommer et à ne pas confondre. */
  coeur:{e:'❤️', n:'Cœur'}, flamme:{e:'🔥', n:'Flamme'}, chat:{e:'🐱', n:'Chat'}
};
D.ORDRE_SYM = ['lune','etoile','soleil','cle','champi','poisson','arbre','cloche','chapeau','coeur','flamme','chat'];

D.MOMENTS = {
  matin:{nom:'Matin', ic:'🌅'}, apresmidi:{nom:'Après-midi', ic:'☀️'},
  soir:{nom:'Soir', ic:'🌇'}, nuit:{nom:'Nuit', ic:'🌙'}
};

D.ROLES = {
  pisteur:{m:'Pisteur', f:'Pisteuse', ic:'🏹', c:'var(--c-pisteur)', le:'le Pisteur', au:'au Pisteur',
    desc:'Explore le village et la forêt. Suis les traces, trouve les objets cachés, cours, grimpe, tire à l\'arc.',
    tag:'Action et réflexes', onglet:{ic:'🛖', nom:'Cabane'}},
  alchimiste:{m:'Alchimiste', f:'Alchimiste', ic:'⚗️', c:'var(--c-alchimiste)', le:'l\'Alchimiste', au:'à l\'Alchimiste',
    desc:'Cueille des ingrédients, fabrique des potions pour l\'équipe et analyse les objets trouvés.',
    tag:'Mémoire et précision', onglet:{ic:'⚗️', nom:'Atelier'}},
  barde:{m:'Barde', f:'Barde', ic:'🎻', c:'var(--c-barde)', le:'le Barde', au:'au Barde',
    desc:'Parle aux habitants, écoute les ragots et démasque les menteurs.',
    tag:'Écoute et stratégie', onglet:{ic:'📌', nom:'Tableau'}},
  sage:{m:'Sage', f:'Sage', ic:'📜', c:'var(--c-sage)', le:'le Sage', au:'au Sage',
    desc:'Garde le Grand Livre, déchiffre les secrets, donne les codes des moments et fait l\'accusation finale.',
    tag:'Logique · chef d\'enquête', onglet:{ic:'📖', nom:'Grand Livre'}}
};

/* ---------- Niveaux ---------- */
D.SEUILS = [0, 120, 250, 380, 510, 640, 770, 900, 1030, 1160];
D.TITRES = ['Apprenti', 'Débutant', 'Enquêteur', 'Enquêteur confirmé', 'Aventurier', 'Aventurier confirmé', 'Expert', 'Maître', 'Grand Maître', 'Héros de Brumeval'];
D.PALIER_NIVEAU = {1:1, 2:3, 3:5, 4:7};

/* ---------- Talents ----------
   fx.mj : mods ajoutés aux mini-jeux ; fx.acces : clés d'accès ; fx.usages : nombre d'utilisations par enquête */
D.TALENTS = {
  /* Seuls les talents du Barde sont faits (Romain, 11 novembre, 8 h 11 : « on va effacer tous les talents qu'on n'a pas faits pour l'instant »).
     Ceux du Pisteur, de l'Alchimiste et du Sage sont à refaire (Bible §12.51) : pour l'instant, ces trois rôles n'ont pas de talents.
     Une vieille sauvegarde qui en avait les perd sans bruit (M.reparerBoutique, moteur-base.js). */
  /* Barde (nouvel arbre, Romain, 4 novembre : tout se passe dans les interrogatoires ; barde.js branche chaque effet).
     Aucun talent ne dépend d'un autre. Les anciens talents d'une vieille sauvegarde sont changés en ceux-ci (barde.js). */
  tendre:{role:'barde', niv:2, nom:'Tendre l\'oreille', ic:'👂', d:'Écouter aux portes : sur la carte, partout où quelqu\'un se trouve, tu entends ce qu\'il dit, tout le temps et gratuitement. Tout est gardé dans ton Carnet, sur sa page. Et tu entends mieux que tout le monde : dans tes phrases à trous, la première lettre de chaque mot est écrite, et un mot est déjà à sa place.', fx:{oreille:2}},   /* (Romain, 5 novembre, 12 h 31 : plus de limite, plus de phrase à trous aux portes) */
  exiger:{role:'barde', niv:2, nom:'Exige la vérité', ic:'⚖️', d:'À la fin d\'un interrogatoire, tu exiges la vérité : tous ses mensonges deviennent vrais. Deux fois par enquête.', fx:{verite:2}},
  charmeur:{role:'barde', niv:4, nom:'Charmeur', ic:'😊', d:'Tes questions maladroites ne vexent plus jamais personne.', fx:{charmeur:true}},
  physio:{role:'barde', niv:4, nom:'Physionomiste', ic:'🧐', d:'Au début de chaque enquête, tu sais déjà comment ment un des suspects.', fx:{physio:1}},
  rumeur:{role:'barde', niv:6, nom:'Lancer une rumeur', ic:'🗣️', d:'Avec le Pisteur : à la taverne, tu lances une fausse rumeur sur un lieu. Au moment suivant, le Pisteur guette : si quelqu\'un accourt, c\'est le bon lieu. Une fois par enquête.', fx:{rumeur:1}},
  hydromel:{role:'barde', niv:6, nom:'Hydromel des confidences', ic:'🍯', d:'Avec l\'Alchimiste : il fabrique l\'Hydromel et te le donne. Offert pendant un interrogatoire, il fait innocenter un suspect. Une fois par enquête.', fx:{hydromel:1}},
  intuition:{role:'barde', niv:8, nom:'Intuition', ic:'🔮', d:'Une fois par enquête, ton intuition te montre un mensonge que tu n\'avais pas repéré.', fx:{intuition:1}},
  recoupement:{role:'barde', niv:8, nom:'Recoupement', ic:'🧩', d:'Une fois par enquête, tu compares deux phrases de ton Carnet : peuvent-elles être vraies toutes les deux ?', fx:{recoupement:1}},
  reseau:{role:'barde', niv:10, nom:'Réseau d\'informateurs', ic:'🧒', d:'À chaque moment, un enfant du village te glisse une info vraie sur un suspect.', fx:{reseau:true}},
  plaidoirie:{role:'barde', niv:10, nom:'Plaidoirie', ic:'📜', d:'Avec le Sage : une fois par enquête, s\'il accuse un innocent, tu plaides, l\'accusé prouve son innocence et le Sage ne perd pas de cœur.', fx:{plaidoirie:1}}
};
D.TALENTS_PAR_ROLE = {pisteur:{}, alchimiste:{}, barde:{}, sage:{}};
Object.keys(D.TALENTS).forEach(function(id){
  var t = D.TALENTS[id]; t.id = id;
  var r = D.TALENTS_PAR_ROLE[t.role] = D.TALENTS_PAR_ROLE[t.role] || {};
  (r[t.niv] = r[t.niv] || []).push(id);
});

/* ---------- Boutique ----------
   [id, palier, nom, icône, prix, effet, ensemble, fx] */
function O(role, liste){
  liste.forEach(function(a){
    D.OBJETS[a[0]] = {id:a[0], role:role, palier:a[1], nom:a[2], ic:a[3], prix:a[4], d:a[5], ens:a[6] || null, fx:a[7] || {}};
  });
}
D.OBJETS = {};
/* Seuls les objets qui marchent pour de vrai dans les enquêtes 1 et 2 restent en vente (Romain, 11 novembre, 8 h 11 :
   « tous les objets qui marchent pas, on va les enlever pour l'instant »). Les autres (accès que plus rien ne demande,
   grille, ragots, actions, Corbeau…) sont dans D.OBJETS_RETIRES, plus bas. Les boutiques sont à refaire (Bible §12.51, §13.9). */
O('pisteur', [
  ['bottes_souples', 1, 'Bottes souples', '🥾', 35, 'Se cacher : les gardes te repèrent moins vite. Pistes : tu marches plus vite.', null, {mj:{cachette:{zone:1.25}, traces:{vitesse:0.3}}}],
  ['arc_court', 1, 'Arc court de chasseur', '🏹', 40, 'Tir : le viseur tremble moins.', 'chasseur', {mj:{tir:{zone:1.25}}}],
  ['lanterne_sourde', 1, 'Lanterne sourde', '🏮', 40, 'Pistes : ton cercle de vision est plus grand.', 'lune', {mj:{traces:{zone:1.3}}}],
  ['gants_pisteur', 1, 'Gants de pisteur', '🧤', 35, 'Pistes : après chaque obstacle, les pas suivants s\'allument un instant.', null, {mj:{traces:{revele:1}}}],
  ['cape_rodeur', 2, 'Cape de rôdeur', '🧥', 80, 'Se cacher : une ronde de garde en moins.', 'lune', {mj:{cachette:{facile:1}}}],
  ['bottes_vent', 2, 'Bottes de vent', '👢', 90, 'Poursuite : 8 obstacles sans faute suffisent pour te rapprocher. Pistes : tu marches bien plus vite.', 'vent', {mj:{poursuite:{vitesse:0.5}, traces:{vitesse:0.5}}}],
  ['carquois', 2, 'Carquois sans fond', '🎒', 75, 'Tir : des flèches en plus.', 'chasseur', {mj:{tir:{erreurs:2}}}],
  ['arc_elfique', 3, 'Arc elfique', '🏹', 130, 'Tir : le temps ralentit.', 'chasseur', {mj:{tir:{lent:0.65}}}],
  ['lanterne_lune', 3, 'Lanterne de lune', '🌕', 120, 'Pistes : un très grand cercle de vision.', 'lune', {mj:{traces:{zone:1.5}}}],
  ['bracelets_vent', 3, 'Bracelets du vent', '💫', 100, 'Poursuite : une erreur pardonnée.', 'vent', {mj:{poursuite:{erreurs:1}}}],
  ['masque_ombre', 3, 'Masque d\'ombre', '🎭', 120, 'Se cacher : tu deviens presque invisible.', null, {mj:{cachette:{facile:2}}}],
  ['arc_argent', 4, 'Arc d\'argent enchanté', '🏹', 260, 'Tous les tirs deviennent bien plus faciles.', null, {mj:{tir:{facile:3}}}],
  ['bottes_fondateurs', 4, 'Bottes des Fondateurs', '👢', 280, 'Poursuite : bien plus facile, et 8 obstacles sans faute suffisent. Pistes : tu marches très vite.', 'vent', {mj:{poursuite:{facile:3, vitesse:1}, traces:{vitesse:0.6}}}]
]);
O('alchimiste', [
  ['thermometre', 1, 'Thermomètre de cuivre', '🌡️', 40, 'Au chaudron : la jauge précise s\'affiche, avec les chiffres.', 'labo', {mj:{chaudron:{revele:true, zone:1.2}}}],
  ['ceinture_fioles', 1, 'Ceinture à fioles', '🎗️', 40, 'Deux fioles vides en plus à chaque enquête.', null, {fiolesBonus:2}],
  ['alambic', 2, 'Alambic de verre', '⚗️', 85, 'Potions concentrées : une dose de plus.', 'labo', {doses:1}],
  ['loupe_doree', 2, 'Loupe dorée', '🔍', 70, 'Chaque analyse révèle un détail caché.', null, {acces:['detail'], detail:9}],
  ['etal', 2, 'Étal du marché', '🛒', 60, 'Tu peux vendre des potions au marché (2 fois par enquête).', null, {acces:['etal']}],
  ['sac_herbo', 2, 'Sac d\'herboriste', '👜', 65, 'Chaque cueillette rapporte un ingrédient de plus.', null, {cueilletteBonus:1}],
  ['grimoire_rec', 2, 'Grimoire des recettes', '📕', 80, 'Nouvelles recettes : clarté d\'esprit, vérité.', null, {recettes:['clarte', 'verite']}],
  ['chaudron_cuivre', 3, 'Chaudron de cuivre', '🍲', 110, 'Tous les mini-jeux de cuisson sont plus faciles.', 'labo', {mj:{chaudron:{facile:1}, bulles:{facile:1}, melange:{facile:1}}}],
  ['balance_or', 3, 'Balance d\'or', '⚖️', 100, 'Mélange : la zone de réussite est plus large.', null, {mj:{melange:{zone:1.4}}}],
  ['serre', 3, 'Serre enchantée', '🪴', 130, 'Un ingrédient rare pousse dans ton atelier à chaque enquête.', null, {rareGratuit:1}]
]);
O('barde', [
  ['luth_voyage', 1, 'Luth de voyage', '🪕', 40, 'Les mots perdus : un indice (la liste diminue de moitié pour un mot).', null, {mj:{mots:{aide:1}}}],
  ['pendule', 2, 'Pendule de vérité', '🪀', 85, 'Repérer le mensonge : un signe de mensonge en moins.', null, {mj:{mensonge:{signes:1}}}],
  ['carillon', 2, 'Carillon des souvenirs', '🎐', 75, 'Les mots perdus : un mot retrouvé tout seul, et un indice.', null, {mj:{mots:{revele:true, aide:1}}}],
  ['miroir', 3, 'Miroir de vérité', '🪞', 130, 'Dans le reflet, les signes de mensonge durent plus longtemps, et deux signes en moins.', null, {mj:{mensonge:{signes:2, revele:true}}}],
  ['harpe', 4, 'Harpe des Fondateurs', '🪉', 280, 'Tu peux exiger la vérité 4 fois de plus par enquête, à la fin d\'un interrogatoire.', null, {verite:4}]
]);
O('sage', [
  ['loupe_lecture', 1, 'Loupe de lecture', '🔎', 30, 'Déchiffrer : une lettre donnée.', null, {mj:{alphabet:{aide:1}}}],
  ['sablier', 1, 'Sablier', '⏳', 45, 'Mini-jeux à chrono : 5 secondes de plus pour toi.', null, {mjTous:{temps:5}}],
  ['lunettes_sage', 1, 'Lunettes de sage', '👓', 40, 'Plans : la taille du calque est déjà la bonne (plus besoin de zoomer).', null, {mj:{plans:{echelle:1, zone:1.2}}}],
  ['pierre_runes', 2, 'Pierre-runes', '🪨', 65, 'Runes : une rune placée pour toi.', 'runes', {mj:{runes:{aide:1}}}],
  ['baton_cristal', 3, 'Bâton de cristal', '🔮', 130, 'Runes : encore une rune placée pour toi.', 'runes', {mj:{runes:{aide:1}}}],
  ['boule', 3, 'Boule de cristal', '🔮', 140, 'Au moment d\'accuser, deux innocents sont rayés.', null, {stratege:2}],
  ['couronne', 4, 'Couronne de runes', '👑', 260, 'Les runes s\'ouvrent sans mini-jeu.', 'runes', {auto:{runes:9}}]
]);
/* Les objets retirés de la boutique (11 novembre) et leur prix : une vieille sauvegarde qui en avait un est remboursée
   au prix d'achat, une seule fois (M.reparerBoutique, moteur-base.js). Le carnet de ragots était déjà retiré le 5 novembre. */
D.OBJETS_RETIRES = {
  sifflet:30, grappin:45, longue_vue_ch:70, collier:60, pieges:65, amulette_instinct:110, oeil_faucon:300,
  fioles_renf:30, mortier:35, herbier:45, gants_cuir:35, lunettes_alchi:75, oeil_cristal:120, fioles_ether:110, athanor:280, pierre_transmu:260, grand_grimoire:300,
  carnet_ragots:30, bourse:35, bonbons:30, clochette:50, chapeau_plume:35, deguisement:80, cape_scene:65, lettre_maire:60, luth_enchante:120, masque_velours:110,
  plume_rossignol:100, corne:110, anneau:260, registre:300,
  cornet:70,   /* (on écoute aux portes sans limite depuis le 5 novembre : « une écoute de plus » ne servait plus à rien) */
  plume_encre:30, baton_marche:35, cle_archives:50, longue_vue:70, livre_annote:80, cor:75, astrolabe:85, cartes_fond:90, chapeau_etoile:110, banniere:120,
  index:100, grimoire_sage:280, oeil_temps:300
};

/* Les ensembles : seulement ceux dont les trois objets sont encore en vente (11 novembre) */
D.ENSEMBLES = {
  chasseur:{role:'pisteur', nom:'Chasseur', ic:'🦌', bonus:'Tir : encore des flèches en plus.', fx:{mj:{tir:{erreurs:2}}}},
  lune:{role:'pisteur', nom:'Rôdeur de lune', ic:'🌙', bonus:'Pistes : tu vois toutes les empreintes, floues au loin, et ton cercle de vision grandit encore.', fx:{mj:{traces:{nuit:1, zone:1.2}}}},
  vent:{role:'pisteur', nom:'Vent', ic:'🌬️', bonus:'Poursuite : encore plus facile.', fx:{mj:{poursuite:{facile:2}}}},
  labo:{role:'alchimiste', nom:'Laboratoire', ic:'⚗️', bonus:'Chaque potion fait une dose de plus.', fx:{doses:1}},
  runes:{role:'sage', nom:'Runes', ic:'ᚱ', bonus:'Les runes et l\'alphabet secret deviennent bien plus faciles.', fx:{mj:{runes:{facile:3}, alphabet:{aide:2}}}}
};

/* ---------- Alchimie ---------- */
D.INGR = {
  eau:{nom:'Eau de la fontaine', ic:'💧', c:'#5aa9ff'},
  miel:{nom:'Miel des ruches', ic:'🍯', c:'#f3c13e'},
  baies:{nom:'Baies de sureau', ic:'🫐', c:'#7d3aa8'},
  champignon:{nom:'Champignon lumineux', ic:'🍄', c:'#8ff3ff'},
  trefle:{nom:'Trèfle des lièvres', ic:'☘️', c:'#52c05e'},
  brume:{nom:'Brume du lavoir', ic:'🌫️', c:'#c9d3ff'},
  lavande:{nom:'Lavande', ic:'🪻', c:'#a77bf0'},
  pensee:{nom:'Pensées sauvages', ic:'🌼', c:'#ffd84a'},
  menthe:{nom:'Menthe poivrée', ic:'🌿', c:'#3fcf9a'},
  ortie:{nom:'Ortie piquante', ic:'🌱', c:'#2f9e44', rare:true},
  racine:{nom:'Racine du Vieux Chêne', ic:'🪵', c:'#9b6a3c', rare:true},
  lune:{nom:'Poussière de lune', ic:'✨', c:'#eef0ff', rare:true}
};
/* Les sept vraies plantes de l'établi (E3-atelier-des-plantes.md ; plantes.js). Elles ne vont ni au chaudron ni dans les rangements de
   l'atelier : cueillies, elles attendent sur l'établi (P.plantes), et suivent le héros d'une enquête à l'autre (plantes.js, M.S.herbier). */
/* OÙ ELLES POUSSENT (Romain, 12 novembre, 12 h 52 ; cueillette.js ; Bible §13.26) : chaque plante a UN endroit précis de la carte, qu'on ne voit pas.
   L'Alchimiste doit toucher exactement là : alors seulement la plante se montre, avec sa bulle « Cueillir ». C'est l'herbier du Sage qui dit où et quand.
   · x, y : dans les mesures du village (carte.js : 1000 × 1400). Les trois plantes d'au-delà de la brume ont des mesures qui sortent du village
     (le grand monde, monde-*.js : x + 1000, y + 320) ; zone : le banc de brume qu'il faut avoir repoussé (monde-brume.js, ZONES).
   · des : la première enquête où l'endroit existe (2 : celles du village — dès l'enquête 2 on les trouve à l'aveugle, on les cueille et on fait
     leurs potions, Romain, 12 h 45 ; 3 : les lointaines, avec l'herbier du Sage et la brume repoussée).
   · pasAvant : le moment à partir duquel elle se cueille (rien : dès le matin). Plus tard dans la journée, et la nuit, elle se cueille toujours.
   · vit, ou, quand : ce que dit l'herbier (le Sage le lit à voix haute : rien que la plante, là où elle vit, un indice et le moment) ;
     ici : ce que voit l'Alchimiste quand elle la trouve ; tot : quand elle vient trop tôt.
   · aussi : d'autres endroits où pousse la même plante ([{x, y}] ; l'oseille en a deux). Un seul suffit pour la cueillir.
   ⚠️ DEPUIS 15 H 37 (Romain : « c'est trop facile ») : L'HERBIER NE DIT PLUS L'ENDROIT EXACT. « ou » est un INDICE qui fait chercher (« à l'ombre des
   grands rochers », « les herboristes l'aiment beaucoup »…) : jamais le nom du lieu, jamais le détail du dessin. Et l'endroit à toucher est
   exactement le rond qui s'affiche (Carte.R_CACHETTE), pas plus. Trois plantes au village (l'oseille, le souci, le lin), QUATRE au-delà de la
   brume : la mélisse y est partie (15 h 39 : Anselme en réclame pour sa tisane, et « on ne peut la trouver que derrière la brume »). Bible §13.28.
   CHAQUE PLANTE EST LÀ OÙ ELLE POUSSE POUR DE VRAI (Romain, 12 novembre, 13 h 09 : « je veux qu'on apprenne des choses sur la réalité ») : « vit »
   dit son vrai milieu, et l'endroit de la carte est un milieu de cette sorte. Vérifié en ligne le 12 novembre (les sources : E3-atelier-des-plantes.md) :
   l'oseille des prés aime les sols humides ; la mélisse, « herbe aux abeilles », se cueille le matin, la rosée partie ; le souci (du latin « qui suit
   le soleil ») se ferme la nuit et ne se rouvre que quand le soleil est haut, et on le plante près des choux contre les pucerons ; le lin se sème dans
   les champs, sa fleur bleue ne dure qu'un matin, et on récolte ses graines bien sèches ; le lycopode en massue (« patte de loup » ; « pied-de-loup » désigne d'abord une autre plante, le lycope d'Europe, au bord de l'eau : c'est pourquoi le jeu dit « lycopode », 12 novembre 17 h 44) vit sur les landes et les pelouses des
   collines, en terre pauvre et acide, avec la bruyère ; la vesse-de-loup pousse dans les bois, sur le sol, en petits groupes ; le gui n'a pas de
   racine dans la terre, il vit sur les branches (pommiers et peupliers surtout) et reste vert l'hiver. Ajouté à 15 h 37 :
   l'oseille est aussi une plante de potager, qui veut une terre fraîche et humide ; le souci est une plante d'herboriste (« officinal »), on en fait
   des soins pour la peau ; les oiseaux mangent les graines de lin ; les apiculteurs aiment la mélisse près des ruches, et sa tisane aide à dormir ;
   la vesse-de-loup et les sorcières, c'est une légende (l'herbier dit « on raconte que »), pas un fait.
   SI ON DÉPLACE UN ENDROIT : changer x, y, vérifier que l'indice « ou » mène toujours là (sans le dire), garder un milieu qui est le vrai, puis
   `python3 tools/e3-cueillette.py`.
   OÙ SONT LES ENDROITS (pour nous ; l'herbier ne le dit pas) : l'oseille, entre le carré de lavande de l'herboriste et la rivière, ET au bord
   gauche du potager, les pieds dans le ruisseau ; le souci, au bout des rangs de lavande de l'herboriste ; le lin, au pied de l'épouvantail du
   champ ; la mélisse, au pied de la première ruche du Rucher ; le lycopode, au pied de la pierre du nord des Cinq Pierres ; la vesse-de-loup,
   au milieu du Rond des Sorcières ; le gui, sur le pommier à l'échelle du Vieux verger. */
D.PLANTES = {
  oseille:{nom:'L\'oseille', un:'de l\'oseille', ic:'🥬', x:910, y:894, des:2, aussi:[{x:165, y:1316}],
    vit:'Elle a toujours soif.',
    ou:'On en trouve aux abords des potagers et des jardins, là où la terre est très humide.',
    quand:'À toute heure, même la nuit.',
    ici:'Dans l\'herbe mouillée, de grandes feuilles en fer de flèche : de l\'oseille !'},
  souci:{nom:'Le souci', un:'des fleurs de souci', ic:'🏵️', x:790, y:894, des:2, pasAvant:'apresmidi',
    vit:'Une jolie fleur orange, comme un petit soleil : elle soigne la peau.',
    ou:'Les herboristes l\'aiment beaucoup.',
    quand:'Pas avant l\'après-midi : il dort la nuit, et ne s\'ouvre que quand le soleil est haut.',
    ici:'De petits soleils orange, grands ouverts : des soucis !',
    tot:'Des boutons orange, bien fermés. Les soucis dorment encore : ils attendent que le soleil soit haut.'},
  lin:{nom:'Le lin', un:'du lin', ic:'🌾', x:770, y:1112, des:2, pasAvant:'apresmidi',
    vit:'Il pousse dans les champs cultivés.',
    ou:'Les oiseaux raffolent de ses graines : pour les faire fuir, rien ne vaut un épouvantail.',
    quand:'Pas avant l\'après-midi : le matin, la rosée mouille ses graines. Sèches, elles tintent quand on secoue la tige.',
    ici:'Tu secoues une tige : ses petites boules dorées tintent. Du lin, bien sec !',
    tot:'De jolies fleurs bleues… et des boules trempées de rosée. Trop tôt : laisse le soleil sécher les graines.'},
  melisse:{nom:'La mélisse', un:'de la mélisse', ic:'🍃', x:-256, y:878, des:3, zone:'o',
    vit:'On l\'appelle l\'herbe aux abeilles : elles raffolent de ses petites fleurs.',
    ou:'Elle ne pousse plus qu\'au-delà de la brume.',
    quand:'Dès le matin, quand la rosée est partie : c\'est là qu\'elle sent le plus fort.',
    ici:'Les abeilles bourdonnent tout autour. Tu froisses une feuille : ça sent le citron ! De la mélisse.'},
  lycopode:{nom:'Le lycopode', un:'du lycopode', ic:'🌲', rare:true, x:-551, y:548, des:3, zone:'o',
    vit:'On l\'appelle aussi patte de loup. Il rampe au ras du sol, comme une petite branche de sapin.',
    ou:'On le trouve au-delà de la brume, sur les collines battues par le vent, parmi les pierres et la bruyère, là où personne ne sème rien.',
    quand:'À toute heure.',
    ici:'Au pied de la grande pierre, on dirait une petite branche de sapin qui rampe : du lycopode, la patte de loup !'},
  vesse:{nom:'La vesse-de-loup', un:'une vesse-de-loup', ic:'⚪', rare:true, x:229, y:-115, des:3, zone:'n',
    vit:'Un champignon tout rond, qui pousse dans l\'humidité de la forêt sombre, au-delà de la brume.',
    ou:'On raconte que les sorcières s\'en servaient pour leurs incantations.',
    quand:'À toute heure.',
    ici:'Sur la terre du sous-bois, une grosse boule brune, bien mûre : une vesse-de-loup !'},
  gui:{nom:'Le gui', un:'du gui', ic:'🪴', rare:true, x:-221, y:609, des:3, zone:'o',
    vit:'Il ne pousse jamais dans la terre : il vit accroché aux branches des vieux pommiers.',
    ou:'Il se cache au-delà de la brume.',
    quand:'À toute heure : il reste vert même en hiver.',
    ici:'Tu grimpes à l\'échelle. Sur la plus haute branche, une boule verte piquée de perles blanches : du gui !'}
};
/* cuisson = mini-jeu ; pour = rôles qui peuvent s'en servir ; fx = effet quand on l'utilise */
D.POTIONS = {
  /* utile : à quoi elle sert et pour qui, en une ou deux phrases pour un enfant (montré dans le grimoire et l'armoire à potions de l'atelier) */
  revelatrice:{nom:'Encre révélatrice', ic:'🫙', c:'#ff7a59', pour:['sage'], d:'Fait apparaître l\'encre invisible.', fx:{acces:['encre']},
    utile:'Pour le Sage : elle fait apparaître l\'écriture invisible, sur une page blanche ou une lettre blanche. Donne-lui son code !'},
  lumiere:{nom:'Potion de lumière', ic:'💡', c:'#8ff3ff', pour:['pisteur', 'barde', 'sage'], d:'Pour voir dans le noir pendant tout un moment.', fx:{acces:['sombre']},
    utile:'Pour voir dans le noir pendant tout un moment. Le Pisteur en a besoin pour guetter dans le moulin, la nuit.'},
  rapidite:{nom:'Potion de rapidité', ic:'💨', c:'#7cf09a', pour:['pisteur'], d:'Pour courir comme le vent : la poursuite est plus facile.', fx:{mj:{poursuite:{facile:2, lent:0.85}}},
    utile:'Pour le Pisteur : il la boit avant une poursuite, il court comme le vent et rattrape plus facilement.'},
  invisibilite:{nom:'Potion d\'invisibilité', ic:'👻', c:'#c9d3ff', pour:['barde', 'pisteur'], d:'Pour écouter ou se cacher sans être vu.', fx:{acces:['ecoute'], mj:{cachette:{facile:3}}},
    utile:'Pour le Pisteur ou le Barde : quand il faut se cacher pour guetter quelqu\'un, personne ne te voit, c\'est bien plus facile.'},
  verite:{nom:'Potion de vérité', ic:'💬', c:'#ffd84a', pour:['barde'], d:'Démasquer un menteur devient très facile.', fx:{mj:{mensonge:{facile:3, revele:true}}},
    utile:'Pour le Barde : il la boit avant de démasquer quelqu\'un, et le mensonge se voit tout de suite.'},
  clarte:{nom:'Potion de clarté d\'esprit', ic:'🧠', c:'#6cb6ff', pour:['sage'], d:'Déchiffrer et réfléchir devient plus facile.', fx:{mj:{alphabet:{aide:2}, plans:{zone:1.4}, grille:{aide:1}, runes:{aide:1}}},
    utile:'Pour le Sage : ses énigmes deviennent plus faciles, l\'alphabet secret, les vieux plans, la grille et les runes.'},
  fumigene:{nom:'Fumigène', ic:'💨', c:'#9aa3c8', pour:['pisteur', 'barde'], d:'Un nuage de fumée pour se cacher ou s\'enfuir.', fx:{mj:{cachette:{facile:2}, poursuite:{erreurs:1}}},
    utile:'Pour le Pisteur ou le Barde : un nuage de fumée pour se cacher plus facilement, et une chance de plus pendant une poursuite.'},
  eclairante:{nom:'Poudre éclairante', ic:'🌟', c:'#ffe3a3', pour:['pisteur', 'sage'], d:'Éclaire un lieu sombre.', fx:{acces:['sombre']},
    utile:'Pour le Pisteur ou le Sage : elle éclaire un endroit tout noir pendant un moment, comme le moulin la nuit.'},
  /* Élixir du Cœur vaillant : rend 1 cœur d'accusation au Sage (une fois par enquête, jamais plus de 3). Effet géré par le moteur (clé coeur). */
  coeur:{nom:'Élixir du Cœur vaillant', ic:'❤️', c:'#ff5a7a', pour:['sage'], d:'Rend un cœur d\'accusation au Sage, une fois par enquête.', fx:{coeur:1},
    utile:'Pour le Sage : pendant l\'accusation, s\'il a perdu un cœur, il boit l\'élixir et le récupère (une fois par enquête).'},
  /* Hydromel des confidences (talent du Barde) : le Barde donne la recette à l'Alchimiste par un code ; tard = son code
     est ajouté à la fin de la liste des codes (moteur-base.js), pour que les codes déjà connus ne bougent pas. */
  hydromel:{nom:'Hydromel des confidences', ic:'🍯', c:'#f0a830', pour:['barde'], d:'Le Barde l\'offre à un villageois pendant un interrogatoire : il innocente un suspect.', fx:{}, tard:true,
    utile:'Pour le Barde (talent Hydromel des confidences) : il l\'offre à un villageois, qui lui confie qu\'un suspect n\'y est pour rien.'}
};
/* recette : ingrédients dans l'ordre ; secrete = l'ordre et les quantités sont dans le Grand Livre du Sage.
   Toutes les potions se préparent au grand chaudron (mini-jeu 'chaudron', fichier mj-chaudron.js). */
D.RECETTES = {
  revelatrice:{ingr:[['eau', 2], ['miel', 1], ['baies', 3]], cuisson:'chaudron', secrete:true},
  lumiere:{ingr:[['champignon', 2], ['eau', 1]], cuisson:'chaudron'},
  rapidite:{ingr:[['trefle', 2], ['miel', 1]], cuisson:'chaudron'},
  invisibilite:{ingr:[['brume', 2], ['lavande', 1]], cuisson:'chaudron'},
  verite:{ingr:[['pensee', 2], ['miel', 1]], cuisson:'chaudron'},
  clarte:{ingr:[['menthe', 2], ['eau', 1]], cuisson:'chaudron'},
  fumigene:{ingr:[['ortie', 1], ['brume', 1]], cuisson:'chaudron'},
  eclairante:{ingr:[['champignon', 1], ['pensee', 1]], cuisson:'chaudron'},
  coeur:{ingr:[['miel', 2], ['pensee', 1], ['eau', 1]], cuisson:'chaudron'},
  hydromel:{ingr:[['miel', 2], ['lavande', 1], ['pensee', 1], ['eau', 1]], cuisson:'chaudron'}   /* recette difficile : cinq doses, finir dans l'arc-en-ciel */
};

/* ---------- Le grand chaudron ----------
   Les couleurs de la potion, du plus froid au plus chaud. En dessous du violet : ça gèle ; au-dessus du bouillant : ça explose. */
D.ZONES_CHAUDRON = {
  violet:{nom:'violette', grand:'VIOLETTE', dit:'tout en bas, très froide', c:'#8b52e0'},
  bleu:{nom:'bleue', grand:'BLEUE', dit:'froide', c:'#3f86f0'},
  vert:{nom:'verte', grand:'VERTE', dit:'au milieu', c:'#3fcf6a'},
  'arc-en-ciel':{nom:'arc-en-ciel', grand:'ARC-EN-CIEL', dit:'la petite bande au milieu du vert', c:'#ff8fe0'},
  jaune:{nom:'jaune', grand:'JAUNE', dit:'chaude', c:'#ffd23f'},
  rouge:{nom:'rouge', grand:'ROUGE', dit:'très chaude', c:'#f04a35'},
  bouillant:{nom:'bouillante', grand:'BOUILLANTE', dit:'tout en haut, quand ça bouillonne', c:'#ff2410'}
};
D.ORDRE_ZONES = ['violet', 'bleu', 'vert', 'jaune', 'rouge', 'bouillant'];
/* Pour chaque potion : la zone où elle doit finir, et la frise des ingrédients (mêmes ingrédients et quantités que D.RECETTES,
   dans l'ordre). ecart = temps relatif avant la dose (1 = un écart normal ; 0,5 = deux doses presque ensemble aux niveaux élevés). */
var CHAUDRON_FRISES = {
  revelatrice:['rouge', [0, 1, 1.2, 1, 0.45, 1]],
  lumiere:['vert', [0, 0.5, 1.2]],
  rapidite:['vert', [0, 1, 0.6]],
  invisibilite:['vert', [0, 0.45, 1.2]],
  verite:['jaune', [0, 1, 0.5]],
  clarte:['bleu', [0, 0.45, 1.1]],
  fumigene:['bouillant', [0, 1]],
  eclairante:['arc-en-ciel', [0, 0.5]],
  coeur:['rouge', [0, 0.8, 1, 0.6]],
  hydromel:['arc-en-ciel', [0, 0.5, 1, 0.45, 0.8]]
};
D.CHAUDRON = {};
Object.keys(D.RECETTES).forEach(function(id){
  var c = CHAUDRON_FRISES[id] || ['vert', []], frise = [];
  D.RECETTES[id].ingr.forEach(function(x){
    for(var k = 0; k < x[1]; k++){ var i = frise.length; frise.push({ingr:x[0], ecart:c[1][i] !== undefined ? c[1][i] : (i ? 1 : 0)}); }
  });
  D.CHAUDRON[id] = {zone:c[0], frise:frise};
});
/* Les potions que l'Alchimiste savait faire « depuis le début » (lumière, rapidité, invisibilité) sont retirées de son grimoire
   (Romain, 12 novembre, 12 h 52 : « des potions qui servent plus ou moins à rien, ce serait cool qu'on les enlève » ; Bible §13.26).
   Il ne reste que la recette de chaque enquête (l'encre révélatrice à l'enquête 1, la potion de vérité à l'enquête 2), et celles qu'un
   talent ou un objet apporte. D.POTIONS et D.RECETTES les gardent : leurs codes ne bougent pas (codes gelés), et une vieille sauvegarde
   qui en a une fiole peut encore la boire. D'autres potions viendront plus tard (à réfléchir avec Romain). */
D.RECETTES_DE_BASE = [];
D.RECETTES_RETIREES = ['lumiere', 'rapidite', 'invisibilite'];

/* ANCIEN chaudron pas à pas : n'est plus utilisé par l'atelier ni par le Sage (remplacé par D.CHAUDRON).
   Gardé seulement parce que moteur-actions.js le lit encore (recettes passées à l'atelier).
   Étapes de préparation au grand chaudron (dans l'ordre).
   verser {ingr, n} · feu {f:'doux'|'moyen'|'vif'} · tourner {sens:'droite'|'gauche', n:tours}
   attendre {bulles:'petites'|'grosses'} · fiole (mettre en fiole au bon moment) */
D.ETAPES = {
  revelatrice:[{t:'verser', ingr:'eau', n:2}, {t:'feu', f:'doux'}, {t:'verser', ingr:'miel', n:1}, {t:'tourner', sens:'droite', n:3},
    {t:'verser', ingr:'baies', n:3}, {t:'feu', f:'vif'}, {t:'attendre', bulles:'grosses'}, {t:'tourner', sens:'gauche', n:1}, {t:'fiole'}],
  lumiere:[{t:'verser', ingr:'eau', n:1}, {t:'feu', f:'moyen'}, {t:'verser', ingr:'champignon', n:2}, {t:'tourner', sens:'droite', n:2},
    {t:'attendre', bulles:'petites'}, {t:'fiole'}],
  rapidite:[{t:'verser', ingr:'trefle', n:2}, {t:'verser', ingr:'miel', n:1}, {t:'feu', f:'vif'}, {t:'tourner', sens:'gauche', n:4}, {t:'fiole'}],
  invisibilite:[{t:'verser', ingr:'brume', n:2}, {t:'feu', f:'doux'}, {t:'tourner', sens:'droite', n:1}, {t:'verser', ingr:'lavande', n:1},
    {t:'tourner', sens:'gauche', n:1}, {t:'attendre', bulles:'petites'}, {t:'fiole'}],
  verite:[{t:'verser', ingr:'pensee', n:2}, {t:'feu', f:'moyen'}, {t:'verser', ingr:'miel', n:1}, {t:'tourner', sens:'droite', n:2}, {t:'feu', f:'doux'}, {t:'fiole'}],
  clarte:[{t:'verser', ingr:'menthe', n:2}, {t:'verser', ingr:'eau', n:1}, {t:'feu', f:'doux'}, {t:'tourner', sens:'gauche', n:2}, {t:'attendre', bulles:'petites'}, {t:'fiole'}],
  fumigene:[{t:'verser', ingr:'ortie', n:1}, {t:'feu', f:'vif'}, {t:'verser', ingr:'brume', n:1}, {t:'tourner', sens:'droite', n:3}, {t:'fiole'}],
  eclairante:[{t:'verser', ingr:'champignon', n:1}, {t:'verser', ingr:'pensee', n:1}, {t:'feu', f:'moyen'}, {t:'tourner', sens:'gauche', n:2}, {t:'fiole'}]
};
/* Texte d'une recette (Grand Livre du Sage, grimoire) : les ingrédients dans l'ordre, combien, puis la zone de fin.
   Ex. : « 2 eau de la fontaine, puis 1 miel des ruches, puis 3 baies de sureau ; à la fin, garder la potion dans la zone ROUGE du chaudron (très chaude) » */
D.texteEtapes = function(id){
  var R = D.RECETTES[id], C = D.CHAUDRON[id];
  if(!R) return '';
  var s = R.ingr.map(function(x){ return x[1] + ' ' + D.INGR[x[0]].nom.toLowerCase(); }).join(', puis ');
  var Z = C && D.ZONES_CHAUDRON[C.zone];
  if(Z) s += ' ; à la fin, garder la potion ' + (C.zone === 'arc-en-ciel' ? 'dans l\'ARC-EN-CIEL du chaudron (' : 'dans la zone ' + Z.grand + ' du chaudron (') + Z.dit + ')';
  return s;
};
/* Meubles et rangements de l'atelier (ce qui sort des cartons) */
D.MEUBLES = ['etagere', 'commode', 'caisse', 'sac', 'bocaux', 'tapis', 'lampe', 'plante', 'table', 'tabouret', 'tableau', 'horloge', 'chat'];

/* ---------- Villageois (fixes d'une enquête à l'autre) ---------- */
D.PNJ = {
  grosbec:{nom:'Monsieur Grosbec', court:'Grosbec', metier:'le maire', ic:'🎩', pied:5},
  gaspard:{nom:'Gaspard Levain', court:'Gaspard', metier:'le boulanger', ic:'👨‍🍳', pied:5},
  melusine:{nom:'Mélusine Dufil', court:'Mélusine', metier:'la couturière', ic:'👩‍🦰', pied:3},
  basile:{nom:'Basile Potiron', court:'Basile', metier:'le jardinier', ic:'👨‍🌾', pied:5},
  odette:{nom:'Odette Ronron', court:'Odette', metier:'la grand-mère aux sept chats', ic:'👵', pied:3},
  tim:{nom:'Tim', court:'Tim', metier:'le petit ramoneur', ic:'🧒', pied:3},
  victor:{nom:'Victor Lettrier', court:'Victor', metier:'le facteur', ic:'🧔', pied:5},
  anselme:{nom:'Anselme Bourdon', court:'Anselme', metier:'le sonneur de cloches', ic:'👴', pied:5},
  iris:{nom:'Iris Lavandin', court:'Iris', metier:'l\'herboriste', ic:'👩‍🌾', pied:4},
  fortune:{nom:'Fortuné Malin', court:'Fortuné', metier:'le colporteur', ic:'🤠', pied:4},
  silas:{nom:'Silas Sec', court:'Silas', metier:'le garde champêtre', ic:'💂', pied:4},
  farinel:{nom:'Aimé Farinel', court:'Farinel', metier:'le meunier', ic:'🧑‍🌾', pied:5},
  margot:{nom:'Margot Chopine', court:'Margot', metier:'la tavernière', ic:'👩‍🍳', pied:4},
  /* enquête 2 (§ 12.11) : le charretier (nom à confirmer par Romain) */
  bastien:{nom:'Bastien Roulebosse', court:'Bastien', metier:'le charretier', ic:'🛒', pied:5},
  voisin:{nom:'Le voisin', court:'Le voisin', metier:'', ic:'🧓', pied:0},
  /* enquête 3 (§ 13) : le voisin d'Odette devient un vrai villageois (« voisin », au-dessus, reste la porte d'Odette),
     et Léo Mouture, l'apprenti du meunier (un grand gaillard aux bottes énormes) */
  levoisin:{nom:'Le voisin d\'Odette', court:'Le voisin', metier:'le voisin d\'Odette', ic:'🧓', pied:4},
  leo:{nom:'Léo Mouture', court:'Léo', metier:'l\'apprenti du meunier', ic:'🧑', pied:6}
};
/* Où habite chacun, d'une enquête à l'autre (la carte, carte-jeu.js) : une maison dont l'habitant n'est pas dans le registre de
   l'enquête (on ne le connaît pas encore) montre un rond « ? » au lieu de son visage (Romain, 5 novembre, 01 h 20).
   Le registre de l'enquête (E.registre[id].maison) passe avant. (Margot : la taverne ; Farinel : le moulin ; Fortuné : sa carriole.) */
var DOMICILES = {gaspard:'F1', melusine:'L4', victor:'L6', iris:'F4', odette:'L2', tim:'L7', basile:'B3', bastien:'B2', silas:'B1'};
Object.keys(DOMICILES).forEach(function(id){ D.PNJ[id].domicile = DOMICILES[id]; });
/* Le métier en court, avec son icône (les photos du tableau de liège du Barde, le Carnet) */
var METIERS = {grosbec:['maire', '🏛️'], gaspard:['boulanger', '🍞'], melusine:['couturière', '🧵'], basile:['jardinier', '🥕'],
  odette:['grand-mère', '🐈'], tim:['ramoneur', '🧹'], victor:['facteur', '✉️'], anselme:['sonneur', '🔔'], iris:['herboriste', '🌿'],
  fortune:['colporteur', '🧳'], silas:['garde', '🛡️'], farinel:['meunier', '🌾'], margot:['tavernière', '🍺'], bastien:['charretier', '🛒']};   /* 🛒 est au charretier (Romain) : le colporteur prend 🧳 */
Object.keys(METIERS).forEach(function(id){ D.PNJ[id].metierCourt = METIERS[id][0]; D.PNJ[id].icMetier = METIERS[id][1]; });
})();
