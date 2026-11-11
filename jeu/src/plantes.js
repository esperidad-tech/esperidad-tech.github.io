/* ==========================================================
   Brumeval — l'établi des plantes de l'Alchimiste (enquête 3 ; conçu dans E3-atelier-des-plantes.md, décidé par Romain le
   11 novembre : « un atelier où il a besoin de séparer certains ingrédients de ces plantes… écraser les plantes, couper les plantes ;
   des potions basées sur des plantes qui existent réellement »).

   · Une page plein écran, par-dessus l'atelier (la bulle « 🌿 Préparer » de l'établi : atelier.js → M.ouvrirEtabli).
     À gauche : le panier (les sept plantes ; celles qu'on a cueillies : P.plantes), la plante choisie dessinée entière, avec ses
     trois parties qu'on touche, et « la main » (ce qu'on tient, ou ce que c'est devenu). À droite : l'étagère des sept potions,
     et les onze outils, toujours aux mêmes places (plantes-dessins.js). En bas : le conteur, avec son 🔊.
   · On prend une partie de la plante, puis on fait les gestes, dans l'ordre, avec les bons outils. Le grimoire (📖) a une page
     par potion : la partie à prendre est écrite en mots, les gestes sont montrés en petites images. Rien d'autre ne dit quoi faire.
   · Jamais d'échec : un geste faux donne une petite phrase drôle, et la plante revient comme avant. Rien n'est perdu.
   · Une potion finie : P.vus['fiole:<id>'] = 1 (les identifiants du donjon : feu, fumigene, huile, colle, acide, baume, coeur),
     une note au Carnet. Le baume a besoin de l'huile (déjà faite).
   · Le sac : la nuit, « 🎒 Ton sac » montre les potions faites et leur code (sac:<n>, n = un bit par potion : E.codesPlus, e3.js)
     pour le Pisteur ; il le tape dans son onglet Code : P.sac = la liste des potions (elle part avec lui dans le donjon).
   Chargé APRÈS moteur-actions.js et grands.js.
   ========================================================== */
(function(){
'use strict';
var M = window.M, D = window.DONNEES, PLD = window.PLD;
if(!M || !PLD) return;
var esc = M.esc;
var ORDRE = ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'];
var ORDRE_PL = ['oseille', 'souci', 'melisse', 'lin', 'lycopode', 'vesse', 'gui'];

/* ---------- Les sept plantes : ce que raconte le conteur quand elles arrivent, leurs trois parties (faux : la phrase de la mauvaise partie),
   et où elles aiment pousser (écrit dans le grimoire : sans le nom du lieu ; les trois rares sont dans l'herbier du Sage) ---------- */
var PL = {
  oseille:{nom:'L\'oseille', potion:'acide', ou:'Elle aime avoir les pieds au frais, tout au bord de l\'eau.',
    arrive:'L\'oseille est sur ton établi : de grandes feuilles en fer de flèche, et une tige de petites fleurs rouges.',
    parties:{feuilles:{nom:'Les feuilles', c:'#62b24c'},
      hampe:{nom:'Les fleurs rouges', c:'#c9483f', faux:'De toutes petites fleurs rouges. C\'est joli… mais ça ne ronge rien du tout.'},
      racine:{nom:'La racine', c:'#d2a878', faux:'Une racine pleine de terre. Beurk ! Elle ne pique même pas la langue.'}}},
  souci:{nom:'Le souci', potion:'baume', ou:'Il fleurit au soleil, entre les choux et les poireaux.',
    arrive:'Le souci est sur ton établi. Ses fleurs sont orange comme de petits soleils.',
    parties:{fleurs:{nom:'Les fleurs orange', c:'#ff9a1f'},
      feuilles:{nom:'Les feuilles', c:'#6cba55', faux:'Des feuilles un peu collantes… et c\'est tout. Elles ne soignent personne.'},
      racine:{nom:'Les racines', c:'#b88a58', faux:'Des racines toutes tordues, pleines de terre. Rien à en tirer !'}}},
  melisse:{nom:'La mélisse', potion:'coeur', ou:'Celle qui soigne avec des fleurs en garde toujours un pied dans son jardin.',
    arrive:'La mélisse est sur ton établi. Tout l\'atelier sent le citron !',
    parties:{feuilles:{nom:'Les feuilles', c:'#7cc46a'},
      fleurs:{nom:'Les petites fleurs', c:'#fffdf2', faux:'De toutes petites fleurs blanches. Les abeilles en raffolent… toi, tu n\'en feras rien.'},
      tige:{nom:'La tige', c:'#8fcf7a', faux:'Une tige carrée. Carrée ! C\'est rigolo… mais elle ne sent presque rien.'}}},
  lin:{nom:'Le lin', potion:'huile', ou:'Ses graines se moulent comme le blé : le meunier en garde toujours un sac.',
    arrive:'Le lin est sur ton établi : de fines tiges, des fleurs bleues, et de petites boules dorées.',
    parties:{graines:{nom:'Les boules dorées', c:'#d8b25e'},
      fleurs:{nom:'Les fleurs bleues', c:'#6ea8ff', faux:'De jolies fleurs bleues… qui ne donnent pas une goutte.'},
      tiges:{nom:'Les tiges', c:'#6aa84f', faux:'Rien ne coule. Les tiges du lin, c\'est pour faire du fil !'}}},
  lycopode:{nom:'Le pied-de-loup', potion:'feu', rare:true,
    arrive:'Le pied-de-loup est sur ton établi. On dirait une petite branche de sapin qui rampe.',
    parties:{epis:{nom:'Les épis jaunes', c:'#f0dc7a'},
      tiges:{nom:'Les tiges vertes', c:'#4f9a4a', faux:'Les tiges du pied-de-loup font de jolies couronnes… mais pas la moindre flamme.'},
      racines:{nom:'Les petites racines', c:'#b88a58', faux:'De petites racines toutes fines. Rien à en tirer !'}}},
  vesse:{nom:'La vesse-de-loup', potion:'fumigene', rare:true,
    arrive:'Deux vesses-de-loup sur ton établi : une grosse brune, et une petite toute blanche.',
    parties:{mure:{nom:'La grosse brune', c:'#b08a5c'},
      jeune:{nom:'La petite blanche', c:'#f8f3e6', faux:'Dedans, c\'est blanc et ferme comme du fromage. Pas un grain de poussière !'},
      fils:{nom:'Les fils blancs', c:'#f6eedb', faux:'Des fils blancs pleins de terre. Le nuage ne se cache pas là !'}}},
  gui:{nom:'Le gui', potion:'colle', rare:true,
    arrive:'Le gui est sur ton établi, encore accroché à son bout de pommier.',
    parties:{baies:{nom:'Les baies blanches', c:'#fbfaf0'},
      feuilles:{nom:'Les feuilles', c:'#8fbf4a', faux:'Une bouillie verte… qui ne colle pas du tout.'},
      branche:{nom:'La branche', c:'#8a5a36', faux:'Du bois de pommier. Dur comme… du bois. Ça ne colle à rien !'}}}
};

/* ---------- Les sept recettes (les potions du donjon : mêmes identifiants et mêmes couleurs que jeu/donjon/moteur/src/donnees.js)
   partie : la bonne partie ; dit : la partie, en mots, dans le grimoire ; gestes : {o:l'outil, m:ce que c'est devenu (3 mots au plus),
   c:sa couleur, t:ce que raconte le conteur} ; faux : 'rang:outil' → une phrase à elle pour ce geste faux ; vrai : ce qui est vrai. ---------- */
var RE = {
  feu:{nom:'La fiole de feu', court:'Feu', coul:'#ff7a2a', plante:'lycopode', partie:'epis', dit:'les épis jaunes, tout au bout des tiges.',
    sert:'Dans le donjon, elle brûle un monstre.',
    gestes:[
      {o:'couteau', m:'Les épis coupés', c:'#f0dc7a', t:'Clac, clac ! Les petits épis jaunes tombent sur la planche.'},
      {o:'coupelle', m:'Une poudre jaune', c:'#ffe45a', t:'Tu secoues les épis au-dessus de la coupelle. Une poudre jaune tombe en pluie, fine comme de la farine.'},
      {o:'fiole', t:'La poudre glisse dans la fiole. Une étincelle… FOUCH ! Elle s\'enflamme d\'un seul coup.'}],
    faux:{'0:mortier':'Tu écrases les épis. Une pâte jaune… qui ne brûle pas du tout.'},
    vrai:'Cette poudre, ce sont les spores du lycopode. Elles s\'enflamment d\'un coup, très vite : on s\'en servait pour faire les flammes au théâtre, et le flash des premiers photographes.'},
  fumigene:{nom:'Le fumigène', court:'Fumigène', coul:'#aab4d2', plante:'vesse', partie:'mure', dit:'le champignon entier, bien mûr.',
    sert:'Dans le donjon, il fait un gros nuage dans toute la salle.',
    gestes:[
      {o:'coupelle', m:'La vesse séchée', c:'#9a7a52', t:'La vesse-de-loup sèche au soleil, près de la fenêtre. Elle devient légère comme une plume.'},
      {o:'linge', m:'Le nuage brun', c:'#8a6a44', t:'Tu la serres dans le linge… POUF ! Tout le nuage brun reste pris dans le tissu.'},
      {o:'fiole', t:'Vite, vite ! Tu secoues le linge au-dessus de la fiole, et tu bouches. Le nuage tourne au gris, bien enfermé.'}],
    faux:{'0:couteau':'Pouf ! Un nuage brun… plein ta figure. Atchoum !', '0:linge':'Pas de nuage : juste une grosse tache brune sur ton linge.',
      '0:mortier':'Splotch ! Une bouillie brune au fond du mortier.', '0:presse':'Splotch ! Une bouillie brune sous la presse.'},
    vrai:'Jeune, la vesse-de-loup est blanche et ferme. Mûre, elle brunit et se remplit d\'une poussière brune : ses spores. Dès qu\'on la presse, pouf, elle les crache en nuage !'},
  huile:{nom:'L\'huile', court:'Huile', coul:'#f2b630', plante:'lin', partie:'graines', dit:'les graines.',
    sert:'Dans le donjon, elle fait glisser un monstre. Et elle libère un ami pris dans une toile.',
    gestes:[
      {o:'tamis', m:'Les graines', c:'#a8743a', t:'Tu frottes les boules dorées au-dessus du tamis. Les coques restent dessus, et les petites graines brunes passent.'},
      {o:'presse', m:'L\'huile trouble', c:'#e0b040', t:'Tu tournes la vis de la presse. Ça craque… et une huile dorée coule, goutte à goutte.'},
      {o:'linge', m:'L\'huile claire', c:'#f2b630', t:'Tu verses l\'huile à travers le linge. Les miettes restent dedans.'},
      {o:'fiole', t:'Une belle huile dorée, bien claire, coule dans la fiole.'}],
    faux:{'0:mortier':'Une farine grise… et pas une goutte.', '0:couteau':'Les boules dorées roulent partout sur l\'établi. Reviens ici, toi !'},
    vrai:'L\'huile de lin sort des graines qu\'on presse. Et avec les tiges du lin, on fait du fil : le lin des draps et des chemises !'},
  colle:{nom:'La colle', court:'Colle', coul:'#ece4d0', plante:'gui', partie:'baies', dit:'les baies blanches.',
    sert:'Dans le donjon, les pattes du monstre restent collées au sol.',
    gestes:[
      {o:'mortier', m:'Une pâte blanche', c:'#f1ecd8', t:'Ploc, ploc ! Les baies éclatent sous le pilon. Ça file, ça colle déjà aux doigts !'},
      {o:'marmite', m:'La pâte trempe', c:'#e6dfc6', t:'Dans la marmite, avec un peu d\'eau. La pâte trempe et ramollit.'},
      {o:'feu', m:'La glu', c:'#ece4d0', t:'Le feu ronronne. Tu tournes, tu tournes… La pâte devient une glu fine, très collante.'},
      {o:'fiole', t:'Tu fais couler la glu dans la fiole. N\'y mets pas les doigts !'}],
    faux:{'0:couteau':'Les baies roulent partout sur l\'établi. Reviens ici, toi !', '0:presse':'Splatch ! La presse est toute collée. Il va falloir la laver…'},
    vrai:'Avec les baies du gui, trempées puis cuites, on faisait autrefois la « glu » : une colle très forte. Le gui ne pousse jamais dans la terre : il vit sur les branches des arbres, souvent des pommiers.'},
  acide:{nom:'L\'acide', court:'Acide', coul:'#9be04a', plante:'oseille', partie:'feuilles', dit:'les feuilles.',
    sert:'Il ronge le fer et la rouille : une vieille grille, une armure…',
    gestes:[
      {o:'couteau', m:'Les feuilles hachées', c:'#62b24c', t:'Tchac, tchac, tchac ! Les feuilles sont hachées menu.'},
      {o:'marmite', m:'La soupe verte', c:'#62b24c', t:'Dans la marmite, avec de l\'eau.'},
      {o:'feu', m:'Le bouillon vert', c:'#86c85a', t:'Ça bout ! L\'eau devient toute verte : le piquant de l\'oseille est passé dedans.'},
      {o:'linge', m:'Le jus vert', c:'#a6d86a', t:'Tu filtres dans le linge. Les feuilles restent, le jus vert passe.'},
      {o:'coupelle', m:'Les cristaux blancs', c:'#ffffff', t:'Le jus sèche près de la fenêtre. Au fond de la coupelle, il reste de petits cristaux blancs : le sel d\'oseille !'},
      {o:'eau', m:'L\'eau acide', c:'#c8f08a', t:'Un peu d\'eau sur les cristaux. Ils fondent sans bruit…'},
      {o:'fiole', t:'Dans la fiole ! Pssshhh… Celle-là, elle mange la rouille.'}],
    faux:{'0:mortier':'Une purée verte, bien acide. Elle pique la langue… mais pas la rouille !'},
    vrai:'L\'oseille pique la langue parce qu\'elle contient un acide. En cristaux, on l\'appelle le « sel d\'oseille » : on s\'en sert encore pour enlever la rouille et les taches d\'encre.'},
  baume:{nom:'Le baume', court:'Baume', coul:'#5fd08a', plante:'souci', partie:'fleurs', dit:'les fleurs orange.',
    sert:'Dans le donjon, il soigne beaucoup un ami.',
    note:'La marmite du baume se remplit d\'huile de lin : il faut donc avoir déjà fait l\'huile !',
    gestes:[
      {o:'couteau', m:'Les pétales', c:'#ff9a1f', t:'Tu détaches les pétales sur la planche, un par un. Tes doigts sont tout orange.'},
      {o:'marmite', besoin:'huile', sans:'La marmite est toute sèche ! Les pétales veulent un bain d\'huile de lin… et tu n\'en as pas encore.',
        m:'Les pétales huilés', c:'#ffab3a', t:'Les pétales plongent dans la marmite, avec ton huile de lin.'},
      {o:'feu', m:'L\'huile orange', c:'#ffb640', t:'Tout doucement… L\'huile chauffe sans bouillir, et devient orange comme un coucher de soleil.'},
      {o:'linge', m:'L\'huile de souci', c:'#ffb640', t:'Tu filtres dans le linge. Les pétales restent, l\'huile orange passe.'},
      {o:'fiole', t:'Le baume coule dans la fiole… et tourne au vert tendre. Il est prêt à soigner !'}],
    faux:{'1:eau':'Une tisane orange… qui ne tient pas sur une blessure.', '0:mortier':'Une purée orange qui tache tout. Ton établi a pris des couleurs !'},
    vrai:'L\'huile de souci est un très vieux remède : on en met sur la peau qui gratte et sur les petits bobos. Le souci s\'appelle aussi le calendula.'},
  coeur:{nom:'Le cœur vaillant', court:'Cœur', coul:'#ff5a7a', plante:'melisse', partie:'feuilles', dit:'les feuilles.',
    sert:'Dans le donjon, il relève un ami tombé au sol.',
    gestes:[
      {o:'couteau', m:'Les feuilles coupées', c:'#7cc46a', t:'Tchac ! Les feuilles sont coupées. Tout l\'établi sent le citron.'},
      {o:'alambic', m:'Les feuilles', c:'#7cc46a', t:'Les feuilles entrent dans le ballon de cuivre.'},
      {o:'eau', m:'Les feuilles mouillées', c:'#9ad8c0', t:'Tu ajoutes de l\'eau fraîche, et tu refermes le chapeau.'},
      {o:'feu', m:'L\'eau de mélisse', c:'#bfeee0', t:'Ça chauffe ! La vapeur monte dans le col de cygne, refroidit… et retombe goutte à goutte.'},
      {o:'fiole', t:'Goutte à goutte, la fiole se remplit. L\'eau de mélisse rosit : elle redonne du courage !'}],
    faux:{'1:marmite':'Une bonne tisane au citron ! Délicieuse… mais ce n\'est pas une potion.'},
    vrai:'L\'eau de mélisse existe vraiment : des moines, à Paris, la fabriquent depuis 1611 avec un alambic. On en prenait contre les maux de tête et les douleurs.'}
};
/* un geste faux, quand la recette n'a pas de phrase à elle pour lui */
var GEN = {
  couteau:'Tchac, tchac, tchac… De tout petits morceaux. Et après ? Rien ! Ce n\'était pas le moment de couper.',
  tamis:'Tu secoues, tu secoues… Rien ne passe à travers le tamis.',
  mortier:'Tu écrases de toutes tes forces. Une bouillie ! Ce n\'est pas ça.',
  presse:'Tu tournes la vis… Scrouitch ! Rien ne coule.',
  linge:'Tu serres le linge très fort. Il n\'en sort rien du tout.',
  marmite:'Hop, dans la marmite ! Ça fait une drôle de soupe…',
  feu:'Ça chauffe, ça fume… Pouah ! C\'est tout brûlé.',
  alambic:'Glou, glou… L\'alambic ne rend qu\'une goutte d\'eau tiède.',
  coupelle:'Tu poses ça près de la fenêtre. Tu attends… Tu attends… Il ne se passe rien.',
  eau:'Plouf ! Tout est trempé. Bravo.',
  fiole:'Dans la fiole ? Ce n\'est pas encore une potion, ça !'
};
var FEU_AILLEURS = 'Tu craques une allumette… Aïe ! Ça sent le roussi, et rien ne chauffe.';
var REVIENT = 'Rien n\'est perdu : la plante t\'attend, comme neuve.';
window.PLANTES_RECETTES = {ORDRE:ORDRE, RE:RE, PL:PL};   /* (pour les robots d'essai et le vérificateur) */

/* ---------- Ce que sait le jeu ---------- */
function enquete(){ try{ return M.S && M.S.e ? M.E() : null; }catch(e){ return null; } }
M.etabliDispo = function(){ var E = enquete(); return !!(E && E.plantes && M.P && M.P() && M.role() === 'alchimiste'); };
function faite(id){ var P = M.P(); return !!(P && P.vus['fiole:' + id]); }
function faites(){ return ORDRE.filter(faite); }
function aPlante(k){ var P = M.P(); return !!(P && P.plantes && P.plantes[k] > 0); }
/* les plantes cueillies dont la potion n'est pas encore faite : le signe « 🌿 À préparer ! » de l'établi */
M.plantesEnAttente = function(){ return M.etabliDispo() ? ORDRE_PL.filter(function(k){ return aPlante(k) && !faite(PL[k].potion); }).length : 0; };
function nuit(){ var E = enquete(), P = M.P(); return !!(E && P && E.moments[Math.min(P.moment, E.moments.length - 1)] === 'nuit'); }
M.sacBits = function(){ var n = 0; ORDRE.forEach(function(id, i){ if(faite(id)) n |= (1 << i); }); return n; };
M.sacDe = function(n){ return ORDRE.filter(function(id, i){ return (n >> i) & 1; }); };
/* le signe au-dessus de l'établi, la nuit : le sac attend son code */
M.etabliSigne = function(){ return (M.etabliDispo() && nuit() && !(M.P().vus['sac:donne'])) ? '🎒 Ton sac !' : null; };

/* ---------- La page ---------- */
var ID = 'pl-page';
var T = null;   /* la préparation en cours : {plante, partie, n (gestes faits), ou (l'outil où c'est posé), chaud, m, c} */
var V = {txt:'', voile:null, page:null, effet:null};   /* le conteur, ce qui est ouvert par-dessus (grimoire, sac, intro), les petits effets */
function page(){ return document.getElementById(ID); }
M.etabliOuvert = function(){ return !!page(); };
function lireBtn(t){ return '<button type="button" class="b-lire" data-pl="lire" data-t="' + esc(t) + '" aria-label="Écouter">🔊</button>'; }
function dire(t, doux){ V.txt = t; V.doux = doux || ''; }
function choisir(k){
  T = {plante:k, partie:null, n:0, ou:null, chaud:false};
  var p = PL[k];
  if(faite(p.potion)) dire(RE[p.potion].nom + ' est déjà dans sa fiole, sur l\'étagère.');
  else dire(p.arrive);
}
function premiere(){
  /* à l'ouverture : la première plante cueillie dont la potion reste à faire (sinon une plante cueillie, sinon rien) */
  var l = ORDRE_PL.filter(function(k){ return aPlante(k) && !faite(PL[k].potion); });
  if(!l.length) l = ORDRE_PL.filter(function(k){ return aPlante(k) || faite(PL[k].potion); });
  if(l.length){ choisir(l[0]); return; }
  T = null;
  dire('Ton établi est tout propre… et tout vide. Les plantes de la vallée t\'attendent ! Le grimoire sait où elles aiment pousser.');
}
function panierHTML(){
  return '<div class="pl-panier">' + ORDRE_PL.map(function(k){
    var p = PL[k], la = aPlante(k) || faite(p.potion), sel = T && T.plante === k;
    if(!la) return '<span class="pl-chip pl-vide" aria-label="Une plante pas encore cueillie"><i>?</i></span>';
    return '<button type="button" class="pl-chip' + (sel ? ' pl-sel' : '') + (faite(p.potion) ? ' pl-fait' : '') + '" data-pl="plante" data-id="' + k + '" aria-label="' + esc(p.nom) + '"' + (sel ? ' aria-pressed="true"' : '') + '>' +
      PLD.plante(k) + (faite(p.potion) ? '<b aria-hidden="true">✓</b>' : '') + '</button>';
  }).join('') + '</div>';
}
function plancheHTML(){
  if(!T) return '<div class="pl-planche pl-planche-vide"><span aria-hidden="true">🧺</span></div>';
  var p = PL[T.plante], fini = faite(p.potion);
  return '<div class="pl-planche' + (fini ? ' pl-fini' : '') + (T.partie ? ' pl-choix' : '') + (T.partie && T.n > 0 ? ' pl-route' : '') + '" data-partie="' + (T.partie || '') + '">' +
    '<h3>' + esc(p.nom) + '</h3>' + PLD.plante(T.plante) + '</div>';
}
function mainHTML(){
  if(!T || !T.partie) return '<div class="pl-main pl-main-vide"><span aria-hidden="true">🤲</span></div>';
  return '<div class="pl-main"><span aria-hidden="true">' + (T.ou ? '👉' : '🤲') + '</span><i style="background:' + T.c + '"></i><b>' + esc(T.m) + '</b></div>';
}
function etagereHTML(){
  return '<div class="pl-etagere" aria-label="Tes potions">' + ORDRE.map(function(id){
    var r = RE[id], f = faite(id);
    return '<span class="pl-fiole' + (f ? ' pl-pleine' : '') + (V.effet && V.effet.fiole === id ? ' pl-neuve' : '') + '" data-fiole="' + id + '" aria-label="' + esc(r.nom) + (f ? ' : prête' : ' : pas encore faite') + '">' +
      PLD.fiole(f ? r.coul : null) + '<small>' + esc(r.court) + '</small></span>';
  }).join('') + '</div>';
}
function outilsHTML(){
  return '<div class="pl-outils">' + PLD.OUTILS.map(function(o){
    var ici = T && T.ou === o, chaud = ici && T.chaud, ef = V.effet && V.effet.outil === o ? V.effet.type : '';
    return '<button type="button" class="pl-outil' + (ici ? ' pl-ici' : '') + (chaud ? ' pl-chaud' : '') + (ef ? ' pl-' + ef : '') + '" data-pl="outil" data-id="' + o + '" aria-label="' + esc(PLD.NOMS[o]) + '"' +
      (ici ? ' style="--mat:' + T.c + '"' : '') + '>' + PLD.outil(o) + (ef === 'non' ? '<span class="pl-pouf" aria-hidden="true">💨</span>' : '') + '</button>';
  }).join('') + '</div>';
}
function conteurHTML(){
  var t = V.txt + (V.doux ? ' ' + V.doux : '');
  return '<footer class="pl-conteur' + (V.effet ? ' pl-neuf' : '') + '"><span class="pl-plume" aria-hidden="true">🪶</span><p>' + esc(V.txt) + (V.doux ? ' <em>' + esc(V.doux) + '</em>' : '') + '</p>' + lireBtn(t) + '</footer>';
}
/* ---------- Le grimoire : « Les potions de la brume », une page par potion ---------- */
function pageHTML(id){
  var r = RE[id], p = PL[r.plante];
  var ou = p.rare ? 'Une plante rare ! Seul l\'herbier des Fondateurs, que garde le Sage, sait où elle pousse.' : p.ou;
  var gestes = r.gestes.map(function(g){ return '<span class="pl-geste" aria-label="' + esc(PLD.NOMS[g.o]) + '">' + PLD.outil(g.o) + '</span>'; }).join('<i aria-hidden="true">➜</i>');
  return '<div class="pl-page-tete"><span class="pl-page-fiole">' + PLD.fiole(r.coul) + '</span><div><h3>' + esc(r.nom) + (faite(id) ? ' <span class="pl-ok">✓</span>' : '') + '</h3><p>' + esc(r.sert) + ' ' + lireBtn(r.nom + '. ' + r.sert) + '</p></div></div>' +
    '<div class="pl-page-corps"><div class="pl-page-plante">' + PLD.plante(r.plante) + '<b>' + esc(p.nom) + '</b></div><div class="pl-page-txt">' +
      '<p><b>Où ?</b> ' + esc(ou) + ' ' + lireBtn(p.nom + '. ' + ou) + '</p>' +
      '<p><b>La partie :</b> ' + esc(r.dit) + ' ' + lireBtn('La partie à prendre : ' + r.dit) + '</p>' +
      '<p class="pl-gestes-titre"><b>Les gestes :</b></p><div class="pl-gestes">' + gestes + '</div>' +
      (r.note ? '<p class="pl-page-note">' + esc(r.note) + ' ' + lireBtn(r.note) + '</p>' : '') +
      '<p class="pl-vrai"><b>C\'est vrai !</b> ' + esc(r.vrai) + ' ' + lireBtn(r.vrai) + '</p>' +
    '</div></div>';
}
function grimoireHTML(){
  var id = V.page || (T ? PL[T.plante].potion : ORDRE[0]);
  return '<div class="pl-voile"><div class="pl-livre" role="dialog" aria-label="Le grimoire : les potions de la brume">' +
    '<div class="pl-livre-tete"><h2>📖 Les potions de la brume</h2><button type="button" class="btn second petit" data-pl="fermer-voile">Fermer</button></div>' +
    '<div class="pl-onglets">' + ORDRE.map(function(x){
      return '<button type="button" class="pl-onglet' + (x === id ? ' pl-sel' : '') + (faite(x) ? ' pl-fait' : '') + '" data-pl="page" data-id="' + x + '" aria-label="' + esc(RE[x].nom) + '"' + (x === id ? ' aria-pressed="true"' : '') + '>' + PLD.fiole(RE[x].coul) + '<small>' + esc(RE[x].court) + '</small></button>';
    }).join('') + '</div><div class="pl-page">' + pageHTML(id) + '</div></div></div>';
}
/* ---------- Le sac ---------- */
function fiolesSac(l){
  l = l || [];
  return '<div class="pl-sac-fioles">' + ORDRE.map(function(id){ var f = l.indexOf(id) >= 0; return '<span class="pl-fiole' + (f ? ' pl-pleine' : '') + '">' + PLD.fiole(f ? RE[id].coul : null) + '<small>' + esc(RE[id].court) + '</small></span>'; }).join('') + '</div>';
}
function sacTexte(){
  var l = faites(), n = l.length, t;
  if(!n) t = 'Ton sac est vide ! Pas une seule potion pour la nuit…';
  else if(n === 7) t = 'Sept fioles, sept couleurs : ton sac est plein !';
  else t = 'Ton sac : ' + n + ' potion' + (n > 1 ? 's' : '') + ' sur sept. Tu peux encore préparer les autres.';
  if(nuit()) t += n ? ' Le Pisteur t\'attend pour descendre : donne-lui le code de ton sac. Il le tape dans son onglet Code.' : '';
  else t += ' Cette nuit, tu donneras le code de ton sac au Pisteur, avant de descendre.';
  return t;
}
function sacHTML(){
  var t = sacTexte(), code = '';
  if(nuit() && faites().length){ try{ code = '<div class="b-donne pl-sac-code"><p>🎒 <b>Le sac</b> : le code pour le Pisteur ' + lireBtn('Le sac : le code pour le Pisteur.') + '</p>' + M.codeHTML(M.code('sac:' + M.sacBits())) + '</div>'; }catch(e){ code = ''; } }
  return '<div class="pl-voile"><div class="pl-carte" role="dialog" aria-label="Ton sac"><h2>🎒 Ton sac</h2>' + fiolesSac(faites()) +
    '<p>' + esc(t) + ' ' + lireBtn(t) + '</p>' + code + (M.donjonBoutonAlchimiste ? M.donjonBoutonAlchimiste() : '') + '<button type="button" class="btn second" data-pl="fermer-voile">Fermer</button></div></div>';
}
M.sacFiolesHTML = fiolesSac;   /* (la fenêtre de la descente du Pisteur : descente.js) */
/* ---------- L'explication en images, la première fois (une fois par héros) ---------- */
var INTRO = 'Sept plantes, sept potions pour la nuit. Le grimoire sait tout : quelle partie de la plante il faut, et quels gestes faire, dans l\'ordre. Toi, tu as tes mains et tes outils. Et si tu te trompes ? Rien n\'est perdu : la plante revient comme neuve.';
function introHTML(){
  return '<div class="pl-voile"><div class="pl-carte pl-intro" role="dialog" aria-label="L\'établi des plantes"><h2>🌿 L\'établi des plantes</h2>' +
    '<div class="pl-intro-img" aria-hidden="true"><span class="pl-intro-livre">📖</span><i>➜</i><span class="pl-intro-plante">' + PLD.plante('souci') + '</span><i>➜</i>' +
      '<span class="pl-intro-outil">' + PLD.outil('couteau') + '</span><i>➜</i><span class="pl-intro-outil">' + PLD.outil('marmite') + '</span><i>➜</i><span class="pl-intro-fiole">' + PLD.fiole('#5fd08a') + '</span></div>' +
    '<p>' + esc(INTRO) + ' ' + lireBtn(INTRO) + '</p><button type="button" class="btn grand b-aller" data-pl="fermer-voile">🌿 À l\'établi !</button></div></div>';
}
function bravoHTML(){
  var r = RE[V.effet.fiole];
  return '<div class="pl-bravo" data-pl="bravo" aria-hidden="true"><span class="pl-bravo-fiole">' + PLD.fiole(r.coul) + '</span><b>' + esc(r.nom) + ' !</b></div>';
}
function rendre(){
  var p = page();
  if(!p) return;
  var voile = V.voile === 'grimoire' ? grimoireHTML() : V.voile === 'sac' ? sacHTML() : V.voile === 'intro' ? introHTML() : '';
  p.innerHTML = PLD.DEFS +
    '<header class="pl-haut"><button type="button" class="btn second petit" data-pl="fermer">← L\'atelier</button><h2>🌿 L\'établi des plantes</h2>' +
      '<button type="button" class="btn petit b-aller" data-pl="grimoire">📖 Le grimoire</button><button type="button" class="btn petit b-aller' + (M.etabliSigne() ? ' pl-appel' : '') + '" data-pl="sac">🎒 Ton sac</button></header>' +
    '<div class="pl-corps"><section class="pl-g">' + panierHTML() + plancheHTML() + mainHTML() + '</section>' +
      '<section class="pl-d">' + etagereHTML() + outilsHTML() + '</section></div>' + conteurHTML() +
    (V.effet && V.effet.fiole ? bravoHTML() : '') + voile;
  /* la partie choisie brille ; une fois partie vers les outils, elle manque sur le dessin */
  var pl = p.querySelector('.pl-planche');
  if(pl && T && T.partie){
    var g = pl.querySelector('.pl-pa[data-pa="' + T.partie + '"]');
    if(g) g.classList.add(T.n > 0 ? 'pl-pris' : 'pl-sel');
  }
  V.effet = null;
}
/* ---------- Les gestes ---------- */
function prendre(pa){
  if(!T) return;
  var p = PL[T.plante];
  if(faite(p.potion)){ dire(RE[p.potion].nom + ' est déjà dans sa fiole. Une seule suffit pour cette nuit !'); M.son('clic'); rendre(); return; }
  if(!aPlante(T.plante)) return;
  var d = p.parties[pa]; if(!d) return;
  /* une préparation est en route : un doigt qui frôle la plante ne la défait pas (pour tout reposer : retoucher la plante dans le panier) */
  if(T.partie && T.n > 0){ dire('Une chose à la fois ! Tu as déjà quelque chose en route sur ton établi.'); M.son('clic'); rendre(); return; }
  T.partie = pa; T.n = 0; T.ou = null; T.chaud = false; T.m = d.nom; T.c = d.c;
  dire('Tu tiens ' + d.nom.charAt(0).toLowerCase() + d.nom.slice(1) + '.');
  M.son('clic'); rendre();
}
function rate(o, t){
  /* un geste faux : une phrase drôle, et la plante revient comme avant */
  T.partie = null; T.n = 0; T.ou = null; T.chaud = false;
  dire(t, REVIENT); V.effet = {outil:o, type:'non'};
  M.son('ko'); rendre();
}
function finir(id, g){
  var P = M.P(), r = RE[id], toutes;
  P.vus['fiole:' + id] = 1;
  if(P.plantes && P.plantes[r.plante] > 0) P.plantes[r.plante]--;
  M.noter('Potion prête : ' + r.nom.charAt(0).toLowerCase() + r.nom.slice(1) + '. ' + r.sert, '🧪');
  toutes = faites().length === ORDRE.length;
  if(toutes) M.noter('Les sept potions de la nuit sont prêtes !', '🎒');
  M.sauver();
  T.partie = null; T.n = 0; T.ou = null; T.chaud = false;
  dire(g.t, toutes ? 'Sept fioles, sept couleurs : ton sac est prêt pour la nuit !' : '');
  V.effet = {outil:'fiole', type:'ok', fiole:id};
  M.son('magie'); rendre();
  setTimeout(function(){ var b = page() && page().querySelector('.pl-bravo'); if(b) b.remove(); }, 2300);
}
function geste(o){
  if(!T){ dire('Ton établi est vide. Il te faut d\'abord une plante : va cueillir dans la vallée !'); M.son('clic'); rendre(); return; }
  var p = PL[T.plante], id = p.potion, r = RE[id];
  if(faite(id)){ dire(r.nom + ' est déjà dans sa fiole. Une seule suffit pour cette nuit !'); M.son('clic'); rendre(); return; }
  if(!T.partie){
    dire('Tu as les mains vides ! ' + p.nom + ' attend, là, sur ta planche…'); V.effet = {plante:1};
    M.son('clic'); rendre();
    var pl = page().querySelector('.pl-planche'); if(pl) pl.classList.add('pl-remue');
    return;
  }
  if(T.partie !== r.partie){ rate(o, p.parties[T.partie].faux || GEN[o]); return; }
  var g = r.gestes[T.n];
  if(o !== g.o){
    var t = (r.faux && r.faux[T.n + ':' + o]) || (o === 'feu' && T.ou !== 'marmite' && T.ou !== 'alambic' ? FEU_AILLEURS : GEN[o]);
    rate(o, t); return;
  }
  /* le bon geste. Le baume : sa marmite veut de l'huile de lin (déjà faite) — sans elle, rien ne bouge, rien n'est perdu */
  if(g.besoin && !faite(g.besoin)){ dire(g.sans); V.effet = {outil:o, type:'attend'}; M.son('clic'); rendre(); return; }
  if(T.n === r.gestes.length - 1){ finir(id, g); return; }
  T.n++; T.m = g.m; T.c = g.c;
  if(o === 'feu') T.chaud = true;                       /* le feu chauffe ce qui est dans la marmite ou l'alambic : ça y reste */
  else if(o !== 'eau'){ T.ou = o; T.chaud = false; }    /* (l'eau se verse là où c'est déjà) */
  dire(g.t); V.effet = {outil:o === 'feu' || o === 'eau' ? T.ou : o, type:'ok', de:o};
  M.son(o === 'feu' ? 'bulle' : o === 'eau' ? 'plouf' : 'ok'); rendre();
}
function clic(e){
  var p = page(); if(!p) return;
  var t = e.target, pa = t.closest && t.closest('.pl-planche .pl-pa');
  if(pa && !V.voile){ prendre(pa.getAttribute('data-pa')); return; }
  var b = t.closest && t.closest('[data-pl]'); if(!b) return;
  var a = b.getAttribute('data-pl'), id = b.getAttribute('data-id');
  if(a === 'lire'){ M.lire(b.getAttribute('data-t')); return; }
  if(a === 'fermer'){ M.fermerEtabli(); return; }
  if(a === 'bravo'){ b.remove(); return; }
  if(a === 'fermer-voile'){
    if(V.voile === 'intro'){ M.S.etabliIntro = 1; M.sauver(); }
    V.voile = null; M.stop && M.stop(); M.son('clic'); rendre(); return;
  }
  if(a === 'donjon'){ M.fermerEtabli(); if(M.A['ds-aller']) M.A['ds-aller'](); return; }   /* 🫕 le chaudron du donjon (descente.js) */
  if(a === 'grimoire'){ V.voile = 'grimoire'; V.page = null; M.son('page'); rendre(); return; }
  if(a === 'page'){ V.page = id; M.stop && M.stop(); M.son('feuille'); rendre(); return; }
  if(a === 'sac'){ V.voile = 'sac'; M.son('page'); if(nuit() && faites().length){ M.P().vus['sac:donne'] = 1; M.sauver(); } rendre(); return; }
  if(V.voile) return;
  if(a === 'plante'){ choisir(id); M.son('clic'); rendre(); return; }   /* (retoucher sa plante : on repose tout, elle revient entière) */
  if(a === 'outil'){ geste(id); return; }
}
M.ouvrirEtabli = function(){
  if(!M.etabliDispo() || page()) return false;
  M.stop && M.stop();
  var d = document.createElement('div');
  d.id = ID; d.className = 'pl'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'L\'établi des plantes');
  d.addEventListener('click', clic);
  d.addEventListener('keydown', function(e){ if((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pl-pa')){ e.preventDefault(); prendre(e.target.getAttribute('data-pa')); } });
  document.body.appendChild(d);
  document.documentElement.classList.add('pl-ouvert');
  V.voile = M.S.etabliIntro ? null : 'intro'; V.page = null; V.effet = null;
  premiere();
  rendre();
  return true;
};
M.fermerEtabli = function(){
  var p = page(); if(!p) return;
  p.remove(); document.documentElement.classList.remove('pl-ouvert');
  M.stop && M.stop(); T = null; V.voile = null;
  M.sauver(); M.son('clic'); M.render();
};

/* L'Alchimiste n'« explore » pas un lieu avant d'y agir (moteur-roles.js, feuilleLieu) : ses points s'ouvrent tout de suite */
if(M.A && M.A.point){
  var pointAv = M.A.point;
  M.A.point = function(el){
    var P = M.P();
    if(P && M.role() === 'alchimiste' && el && el.dataset && el.dataset.l) P.vus['explore:' + el.dataset.l] = P.moment;
    return pointAv.apply(this, arguments);
  };
}

/* ---------- Le code du sac, tapé par le Pisteur (moteur-actions.js, traiterCode → M.codeSpecial) ---------- */
var special0 = M.codeSpecial;
M.codeSpecial = function(t, x, id){
  if(t === 'sac'){
    var P = M.P(), l = M.sacDe(+x), deja = P.sac && P.sac.join(',') === l.join(',');
    P.sac = l; P.recus['sac'] = true; P.vus['sac:recu'] = 1;
    ORDRE.forEach(function(k){ if(l.indexOf(k) >= 0) P.vus['sac:' + k] = 1; else delete P.vus['sac:' + k]; });   /* (ce qu'il y a dedans : l'acide pour la grille du puits) */
    if(!deja) M.noter('Le sac de l\'Alchimiste : ' + l.map(function(k){ return RE[k].court.toLowerCase(); }).join(', ') + '.', '🎒');
    M.son('gain'); M.sauver();
    M.ouvrir({type:'plantes', vue:'sac-recu'});
    return true;
  }
  return special0 ? special0.apply(this, arguments) : false;
};
/* (la fenêtre du Pisteur : le sac qu'il vient de recevoir) */
M.plantesHTML = function(m){
  var P = M.P(), l = (P && P.sac) || [], n = l.length;
  var t = 'L\'Alchimiste te confie son sac : ' + n + ' potion' + (n > 1 ? 's' : '') + '. Compte-les avec lui ! ' +
    (n === 7 ? 'Tout y est.' : 'S\'il en prépare d\'autres avant de descendre, il te donnera un nouveau code.');
  return '<div class="b-info-modal pl-sac-recu"><div class="b-grand-ic">🎒</div><h2>Le sac de l\'Alchimiste</h2>' + fiolesSac(l) +
    '<p>' + esc(t) + '</p>' + M.lireBtn(t) + '<button class="btn" data-act="fermer">Fermer</button></div>';
};
M.sacPotions = function(){ var P = M.P(); return (P && P.sac) || null; };
})();
