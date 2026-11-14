/* leo-regles.js — LE COMBAT DE LÉO, le boss final du donjon (Les Enquêteurs de Brumeval, enquête 3). Aucun affichage.
   Conçu avec Romain le 13 novembre 2026 (Bible §13.33). Pas de DOM, pas de son, pas de minuterie : il tourne dans la page
   (window.LeoRegles) et dans Node (require) — c'est ce qui permet de simuler des milliers de combats (leo-sim.js).

   CE COMBAT N'EST PAS AU TOUR PAR TOUR : IL EST EN TEMPS RÉEL. Léo attaque sans attendre ; on joue aussi vite qu'on peut.
   Ce qui empêche de taper dix fois par seconde : l'animation de chaque geste (D.DUREES, mesurées dans la page : le héros est
   pris pendant toute son animation, et son geste ne « tombe » qu'au moment de l'impact). Un seul joueur tient la tablette ;
   les trois héros peuvent être en plein geste en même temps.

   LE 14 NOVEMBRE (Romain, après son premier essai : « trop difficile », Bible §13.36) :
   · PLUS DE HÉROS À CHOISIR, PLUS DE CIBLE À TOUCHER : une seule rangée d'icônes (c.barre()), seulement celles qui servent dans
     la phase (L.BARRE) ; chaque icône choisit sa cible toute seule (c.auto) ;
   · LE NOIR ne se lève plus tout seul (il faut la lumière du bâton de lune) ; dans le noir, tout continue, mais Léo est
     intouchable ; LA FARINE ne retombe plus toute seule (il faut du feu), et Léo y est intouchable ;
   · la lumière du bâton de lune COUPE l'attaque de Léo ; la charge se prépare plus longtemps (le temps d'y mettre de l'huile) ;
   · le bouclier de chêne protège les trois héros ; la rune de l'œil montre ses trois prochaines attaques.

   =================================================================================================================
   L'API
   =================================================================================================================
   var c = LeoRegles.combat(partie[, {phase:1|2|3, alea}])   un combat, à cette phase ; les héros ont toute leur vie
   c.barre()                       LA RANGÉE D'ICÔNES de la phase : [{heros, geste, nom, vise, permis, mot, auto:[cibles], reste, arme, sorte}]
   c.auto(heros, geste)            la cible que l'icône choisit toute seule ([] : personne à viser)
   c.gestes(heros)                 toutes ses cartes (les règles, les tests) : [{geste, nom, vise:'ennemi'|'heros'|'sol'|'salle'|'equipe', cibles, max, permis, mot, reste, arme}]
   c.refus(heros, geste, cible)    null, ou la raison en deux mots
   c.agir(heros, geste[, cible])   lance le geste -> une liste d'évènements (un refus : [{t:'refus', heros, mot}]) ; sans cible : c.auto
   c.avancer(dt)                   le temps passe (dt en secondes) -> la liste des évènements arrivés pendant ce temps
   c.fini()                        null | 'phase' (Léo est à terre : la cinématique, puis c.phaseSuivante()) | 'victoire' | 'defaite'
   c.phaseSuivante()               la phase d'après commence : toute la vie revient, les armes de Léo sont ramassées
   c.etat()                        une photo du combat, pour l'afficher
   c.t                             le temps écoulé dans cette phase (secondes)

   LES ÉVÈNEMENTS (à jouer dans l'ordre ; l'affichage ne décide jamais d'un résultat)
   {t:'geste', heros, geste, cible, impact:1.57, fin:2.26}        son animation commence ; l'effet tombera dans « impact » secondes
   {t:'annule', heros, cause:'etourdi'|'attrape'|'tombe'}          son geste en cours est perdu
   {t:'refus', heros, mot}
   {t:'degats', cible:'leo'|'r3', n, pv, cause, mot}               un ennemi est blessé (n : 0 = « Insensible ! »)
   {t:'degats', heros, n, pv, brut, bouclier:'jaune'|'chene'|null, cause}
   {t:'soin', heros, n, pv, par} ; {t:'tombe', heros} ; {t:'releve', heros, pv, par}
   {t:'bouclier', heros, on:true, sorte:'jaune'|'chene'} ; {t:'bouclier', heros, on:false, casse:true}
   {t:'etat', heros, nom:'etourdi'|'attrape'|'saigne'|'brule', on, duree}
   {t:'leo', quoi:'prise', att, arme, cibles, duree, cache}       il prend son arme (cache : dans le noir, on ne voit pas laquelle)
   {t:'leo', quoi:'elan', att, cibles, duree}                      il arme son coup : « duree » secondes avant l'impact
   {t:'leo', quoi:'impact', att, cibles}                           le coup tombe (les dégâts suivent)
   {t:'leo', quoi:'retour', att} ; {t:'leo', quoi:'repos'}
   {t:'leo', quoi:'coupe', att, par:'marteau'|'lune'}              son attaque est coupée net (le marteau ; la lumière du bâton de lune)
   {t:'leo', quoi:'ebloui', duree}                                 la lumière le surprend entre deux attaques : il reste figé
   {t:'leo', quoi:'glisse', duree} ; {t:'leo', quoi:'debout'}      il glisse sur l'huile et tombe ; il se relève
   {t:'leo', quoi:'tient', heros, duree}                           il tient un héros dans son nuage de farine
   {t:'leo', quoi:'lache', heros, par:'huile'|'feu'|'temps'}
   {t:'leo-etat', nom:'nuage'|'flaque'|'ralenti'|'brule'|'saigne'|'noirci', on, n}
   {t:'boum', n}                                                   la farine explose
   {t:'noir', on}                                                  les torches s'éteignent (la cape) / se rallument (le bâton de lune, rien d'autre)
   {t:'soin-leo', n, pv}                                           la gourde
   {t:'rat', quoi:'arrive'|'mord'|'ebloui'|'voit'|'nu'|'enrage'|'colle'|'libre'|'meurt', id, type, place, heros, par}
   {t:'arme', nom, reste}                                          une arme ramassée a servi ; reste : 0 = elle casse
   {t:'oeil', heros}                                               la rune de l'œil est ouverte (pour tout le combat)
   {t:'mot', sur:'leo'|'r1'|heros, texte}
   {t:'phase-fin', phase} ; {t:'phase', phase} ; {t:'fin', resultat:'victoire'|'defaite', phase}
   ================================================================================================================= */
(function(global){
'use strict';
var NODE = typeof module !== 'undefined' && module.exports;
var D = NODE ? require('./donnees.js') : global.DonjonDonnees;
var Regles = NODE ? require('./regles.js') : global.Regles;

/* ======================================================================= LES CHIFFRES
   Tout ce qui se règle est ici. Les chiffres de Romain (13 novembre) sont marqués « Romain » : ON NE LES CHANGE PAS sans lui.
   Les autres sortent de la simulation (node leo-sim.js) : trois joueurs — rapide, moyen, lent. */
var L = {};
L.PV = 10000;                                         /* Romain : « il faut qu'il en ait 10 000 » — ses points de vie sont un minuteur */
L.PHASES = {1:{de:10000, a:6000}, 2:{de:6000, a:3000}, 3:{de:3000, a:0}};        /* Romain */
L.CALME = {1:1.0, 2:1.2, 3:.6};                      /* le temps calme entre deux attaques, par phase (secondes) */
L.DEBUT = 2.2;                                        /* le calme du début d'une phase */
/* l'ordre des attaques, en boucle. Romain : PAS au hasard — « un ordre très particulier, que tu calcules ». On l'apprend en jouant. */
L.ORDRE = {
  1:['fleau', 'charge', 'marteau', 'meule', 'crochet', 'cape'],
  2:['sifflet', 'poing', 'faux', 'charge', 'lancer', 'gourde', 'saut'],
  3:['poing3', 'rafale', 'charge', 'hurlement', 'attrape', 'souffle']
};
/* prise : il prend son arme (on la voit) ; elan : il arme son coup ; retour : il revient en garde. cibles : 'un' | 'deux' | 'tous'.
   rapide : presque aucun élan, rien ne l'arrête. part : la part de la vie MAX du héros que le coup enlève. */
L.ATTAQUES = {
  /* ---------- phase 1 : le meunier, en cape noire ---------- */
  fleau:{nom:'Le fléau', ic:'🌾', arme:'fleau', prise:1.0, elan:1.4, retour:.9, degats:42, cibles:'deux'},                 /* Romain : frappe deux héros, assez fort */
  /* (14 novembre, Romain : « que la position dure assez longtemps pour qu'on ait le temps de mettre de l'huile » — une fiole met
     2,5 s à tomber, une flèche 1,6 s : il se prépare 4,4 s) */
  charge:{nom:'La charge', ic:'💨', arme:null, prise:1.4, elan:3.0, retour:.8, degats:58, cibles:'un', glisse:5.0},         /* Romain : huile ou colle juste avant → il tombe sur place */
  marteau:{nom:'Le marteau', ic:'🔨', arme:'marteau', prise:1.0, elan:1.4, retour:.9, degats:38, cibles:'un', etourdit:3.0},  /* Romain : dégâts moyens, et il étourdit */
  meule:{nom:'La meule de paille', ic:'meule', arme:'meule', prise:1.2, elan:1.6, retour:1.0, degats:28, cibles:'tous'},       /* Romain : touche tout le monde, un peu moins fort ; rien ne l'arrête */
  crochet:{nom:'Le crochet', ic:'🪝', arme:'crochet', prise:1.4, elan:1.0, retour:.8, degats:58, cibles:'un', attrape:true, tient:7.0, ecrase:46, farine:3.6},   /* Romain : d'abord la farine, puis un coup énorme qui attrape */
  cape:{nom:'La cape', ic:'🌑', arme:'cape', prise:.8, elan:.8, retour:.6, noir:true},                             /* Romain : les torches s'éteignent ; SEUL le bâton de lune rallume (14 novembre : « ça se rallume jamais ») */
  /* ---------- phase 2 : torse nu, en colère ---------- */
  sifflet:{nom:'Le sifflet', ic:'🐀', arme:'sifflet', prise:.7, elan:.9, retour:.5, rats:true},                             /* Romain : deux rats ; d'abord normaux, puis cuirassés, puis les deux */
  poing:{nom:'Le coup de poing', ic:'👊', arme:null, prise:0, elan:.5, retour:.5, degats:10, cibles:'tous', casse:true, rapide:true},   /* Romain : très rapide, 10, enlève tous les boucliers */
  faux:{nom:'La faux', ic:'🌙', arme:'faux', prise:1.0, elan:1.3, retour:.9, degats:10, cibles:'tous', saigne:true},         /* Romain : un balayage sur les trois, qui fait saigner */
  saut:{nom:'Le saut', ic:'💥', arme:null, prise:.5, elan:1.0, retour:1.0, degats:16, cibles:'tous', etourdit:3.0},         /* Romain : étourdit les trois ; on n'a le temps que d'un bouclier jaune */
  gourde:{nom:'La gourde', ic:'🧴', arme:'gourde', prise:.8, elan:2.4, retour:.6, soin:600},                                /* Romain : il reprend beaucoup de vie ; le marteau l'arrête */
  lancer:{nom:'Le lancer de rat', ic:'🐁', arme:null, prise:0, elan:.55, retour:.5, degats:15, fois:2, cibles:'un', rapide:true},   /* Romain : rapide, le rat mord deux fois */
  /* ---------- phase 3 : la potion ---------- */
  poing3:{nom:'Le coup de poing', ic:'👊', arme:null, prise:0, elan:.5, retour:.6, degats:30, cibles:'un', rapide:true},    /* Romain : 30, très rapide, inarrêtable */
  rafale:{nom:'La rafale de coups', ic:'🥊', arme:null, prise:.8, elan:1.3, retour:1.0, part:.8, cibles:'un'},              /* Romain : environ 80 % de la vie d'un héros */
  hurlement:{nom:'Le hurlement', ic:'📢', arme:null, prise:.7, elan:1.0, retour:.8, cibles:'tous', etourdit:3.2},           /* Romain : étourdit tout le monde ; le bouclier jaune l'arrête */
  attrape:{nom:'Il attrape un héros', ic:'✊', arme:null, prise:.5, elan:.9, retour:1.2, part:.7, cibles:'deux', saisit:true},   /* Romain : il attrape un héros et frappe un autre avec — rapide, dur à contrer */
  souffle:{nom:'Le souffle de feu', ic:'🔥', arme:'potion', prise:1.0, elan:1.2, retour:1.0, degats:22, cibles:'tous', brule:true}   /* Romain : tout le monde brûle ; ça s'arrête tout seul */
};
L.SAIGNE = {n:5, pas:.5};                             /* Romain : « 5 par héros, deux fois par seconde » ; il ne s'arrête qu'avec un soin */
L.BRULE = {n:5, pas:.5, duree:4};                     /* la brûlure du souffle : elle s'arrête toute seule */
L.BOUM = {leo:520, heros:30};                         /* Romain : « 30 points de vie » sur le héros pris dans la farine ; gros dégâts sur Léo */
L.NOIRCI = 2.2;                                       /* après le BOUM, il titube */
L.SONNE = 1.5;                                        /* coupé par le marteau, il reste sonné */
L.ECLAIR = 1.2;                                       /* Romain, 14 novembre : la lumière du bâton de lune coupe son attaque ; il reste ébloui « au moins une seconde » */
/* LA RANGÉE D'ICÔNES, phase par phase (Romain, 14 novembre : « on met uniquement les icônes qui nous intéressent »). Une icône que
   l'équipe n'a pas (une recette, un bâton) n'apparaît pas. Ce qui n'y est pas : les flèches simples (« on va prendre uniquement
   celui qui fait le plus de dégâts : la dague »), la louche, l'acide, la colle (comme l'huile), le fumigène. */
L.BARRE = {
  1:{pisteur:['dague', 'p:huile', 'p:feu', 'p:givre'], alchimiste:['p:huile', 'p:feu', 'p:givre', 'herbes', 'p:baume', 'p:coeur'], sage:['oeil', 'bouclier', 'a:baton-chene', 'a:cristal-lune']},
  /* (phase 2 : l'acide de l'Alchimiste reste — sans lui, les rats cuirassés seraient increvables une fois le crochet cassé ; et le
     feu reste — c'est la seule chose qui touche Léo par-dessus ses rats : sans lui, la simulation met deux fois plus de temps
     à finir la phase, plus de quatre minutes pour un joueur ordinaire) */
  2:{pisteur:['dague', 'l:crochet', 'l:fleau', 'l:marteau', 'p:huile', 'p:feu'], alchimiste:['p:huile', 'p:feu', 'p:acide', 'herbes', 'p:baume', 'p:coeur'], sage:['oeil', 'rune', 'bouclier', 'a:baton-chene']},
  3:{pisteur:['l:faux', 'l:gourde', 'p:givre', 'p:huile'], alchimiste:['p:givre', 'p:huile', 'herbes', 'p:baume', 'p:coeur'], sage:['oeil', 'bouclier', 'a:baton-chene']}
};
L.FLAQUE = 6;                                         /* l'huile ou la colle sous ses pieds tient six secondes */
L.RALENTI = {k:.55, duree:5};                         /* le givre : tout ce qu'il fait va presque deux fois moins vite, cinq secondes */
L.VISEE = {pisteur:4, alchimiste:3, sage:3};          /* qui il vise (au hasard, mais la rune de l'œil le montre) */
/* ce que les gestes des héros lui font. Phase 3 : la potion le rend insensible à TOUT (sauf le saignement de la faux). */
L.COUPS = {fleche:45, lourde:55, dague:90, dagueSol:270, feu:60, acide:30, louche:20, crochet:180, fleau:70};        /* Romain : la dague lui fait très mal quand il est au sol ; le crochet = deux coups de dague */
L.FEU = {n:8, pas:.5, duree:4};                       /* le feu le fait brûler quatre secondes */
L.USAGES = 3;                                         /* Romain : chaque arme ramassée sert trois fois, puis casse */
L.ARMES = {
  crochet:{nom:'Crochet', ic:'🪝', d:'fait très mal', phase:2, vise:'ennemi'},
  fleau:{nom:'Fléau', ic:'🌾', d:'frappe deux cibles', phase:2, vise:'ennemi'},
  marteau:{nom:'Marteau', ic:'🔨', d:'coupe son geste', phase:2, vise:'ennemi'},
  faux:{nom:'Faux', ic:'🌙', d:'fait saigner', phase:3, vise:'ennemi'},
  gourde:{nom:'Gourde', ic:'🧴', d:'toute la vie', phase:3, vise:'heros'}
};
L.GOURDE_SOIN = 1;                                    /* Romain : la gourde rend 100 % de la vie, à qui on veut */
/* les rats de la phase 2 (Romain : « Léo prend un emplacement, les rats deux »). Les mêmes bêtes que dans le donjon. */
L.RATS = {
  rat:{pv:40, degats:13, rythme:3.4, nom:'Rat d\'égout'},
  ratcuir:{pv:70, degats:18, rythme:3.8, nom:'Rat cuirassé'}
};
L.VAGUES = [['rat', 'rat'], ['ratcuir', 'ratcuir'], ['rat', 'ratcuir']];       /* Romain : normaux, puis cuirassés, puis les deux */
L.EBLOUI = 5;                                         /* Romain : « ça dure qu'un temps, l'aveuglement » */
L.COLLE_RAT = 4;
L.COUPS_RAT = {dagueOuvert:80, dague:4, flecheOuvert:20, fleche:3, lourdeCuir:12, lourdeOuvert:90, feu:15, acide:5, fleauOuvert:80, fleau:25, fleauCuir:5, louche:2};
/* LES DURÉES DES GESTES DES HÉROS (secondes) — mesurées dans la page le 13 novembre (les vraies animations de HerosAnime) :
   impact = le moment où le geste tombe ; fin = le héros peut refaire un geste. */
L.DUREES = {
  fleche:{impact:1.57, fin:2.26}, lourde:{impact:1.97, fin:2.67}, dague:{impact:.71, fin:1.99}, arme:{impact:.71, fin:1.99},
  potion:{impact:2.54, fin:2.75}, herbes:{impact:1.1, fin:1.1}, louche:{impact:1.25, fin:1.72},
  rune:{impact:.9, fin:1.56}, lune:{impact:.79, fin:1.82}, bouclier:{impact:.77, fin:1.48}, bouclier2:{impact:1.26, fin:1.5}, oeil:{impact:1.3, fin:2.2},
  gourde:{impact:.8, fin:1.3}
};
L.MOTS = {
  occupe:'Pas encore !', etourdi:'Étourdi !', attrape:'Attrapé !', sol:'Au sol !', noir:'Dans le noir !', farine:'Dans la farine !', loin:'Trop loin !',
  casse:'Cassé !', insensible:'Insensible !', rien:'Rien du tout', personne:'Personne au sol', debout:'Encore debout', fini:'C\'est fini', cible:'Qui viser ?',
  impossible:'Impossible !', glisse:'Ça glisse !', vu:'Il voit tout', boucle:'Déjà protégé', tousse:'Il tousse…', tropTard:'Trop tard !',
  clair:'Il fait clair', forme:'En pleine forme', ebloui:'Ébloui !'
};

function copie(o){ return JSON.parse(JSON.stringify(o)); }

/* ======================================================================= LE COMBAT */
function Combat(p, o){
  o = o || {};
  var self = this;
  this.p = p;
  this.R = o.alea || Regles.alea(((p && p.graine) || 12345) ^ 0x51ed27);
  this.recettes = Regles.potions(p);
  this.objets = {};
  D.EXPOSES.forEach(function(h){ self.objets[h] = (p.heros[h].objets || []).slice(); });
  this.vu = false;                          /* la rune de l'œil : ouverte une fois, elle dure tout le combat */
  this._ev = [];
  this._poser(o.phase || 1);
}
var P = Combat.prototype;

/* le début d'une phase : toute la vie revient (Romain : « à chaque début de phase, les héros sont full vie »), plus aucun état */
P._poser = function(phase){
  var self = this, PH = L.PHASES[phase];
  this.phase = phase; this.t = 0; this.resultat = null;
  this.h = {};
  D.EXPOSES.forEach(function(h){
    var max = self.p.heros[h].pvMax || D.HEROS[h].pv;
    self.h[h] = {pv:max, pvMax:max, sol:false, bouclier:null, etourdi:0, attrape:false, saigne:false, saigneT:0, brule:0, bruleT:0, act:null};
  });
  this.leo = {pv:PH.de, pvMax:L.PV, tl:0, etape:'repos', fin:L.DEBUT, att:null, cibles:[], k:-1, nuage:false, boum:false, tenu:null, tientFin:0,
    flaque:0, ralenti:0, brule:0, bruleT:0, saigne:0, saigneT:0, auSol:false};
  this.noir = false;                        /* il fait noir (la cape) : jusqu'à la lumière du bâton de lune, rien d'autre */
  this.rats = []; this.nRat = this.nRat || 0; this.vague = 0;
  /* les armes de Léo, ramassées par le Pisteur (Romain : trois coups chacune ; le marteau est cassé en phase 3) */
  this.armes = {};
  Object.keys(L.ARMES).forEach(function(a){ if(L.ARMES[a].phase === phase) self.armes[a] = L.USAGES; });
};
P.phaseSuivante = function(){
  if(this.resultat !== 'phase') return [];
  this._poser(this.phase + 1);
  return [{t:'phase', phase:this.phase}];
};
P.fini = function(){ return this.resultat; };

/* ---------- qui est là ---------- */
P.debout = function(){ var self = this; return D.ORDRE.filter(function(h){ return !self.h[h].sol; }); };
P.ratsVivants = function(){ return this.rats.filter(function(r){ return !r.mort; }).sort(function(a, b){ return a.place - b.place; }); };
P.rat = function(id){ for(var i = 0; i < this.rats.length; i++) if(this.rats[i].id === id) return this.rats[i]; return null; };
P.ratOuvert = function(r){ return !r.mort && (r.ebloui > this.t || r.dos > this.t || (r.type === 'ratcuir' && r.nu)); };
P.cuirasse = function(r){ return r.type === 'ratcuir' && !r.nu; };
P.sombre = function(){ return !!this.noir; };
/* la bête de devant, pour la dague et les armes de corps à corps : les rats d'abord, puis Léo */
P.devant = function(){ var v = this.ratsVivants(); return v.length ? v[0].id : 'leo'; };
P.libre = function(h){ var S = this.h[h]; return !!S && !S.sol && !S.act && S.etourdi <= this.t && !S.attrape; };

/* ---------- les cartes d'un héros ---------- */
function ids(l){ return l.map(function(r){ return r.id; }); }
P.gestes = function(h){
  var self = this, S = this.h[h], l = [], ph = this.phase;
  if(!S) return l;
  var bloque = this.resultat ? L.MOTS.fini : S.sol ? L.MOTS.sol : S.attrape ? L.MOTS.attrape : S.etourdi > this.t ? L.MOTS.etourdi : S.act ? L.MOTS.occupe : null;
  var rats = ids(this.ratsVivants()), sombre = this.sombre(), nuage = this.leo.nuage;
  /* qui on peut viser. Romain, 14 novembre : « quand tout est noir, tout continue normalement ; le seul truc, c'est que Léo est
     inciblable, exactement comme dans la fumée blanche ». Dans sa farine : seuls l'huile (elle libère un ami) et le feu (BOUM). */
  var cache = sombre || nuage;
  var ennemis = rats.concat(cache ? [] : ['leo']), motE = sombre ? L.MOTS.noir : nuage ? L.MOTS.farine : L.MOTS.fini;
  var amis = this.debout(), auSol = D.ORDRE.filter(function(x){ return self.h[x].sol; });
  function g(geste, nom, vise, cibles, permis, mot, plus){
    var o = {geste:geste, nom:nom, vise:vise, cibles:cibles, max:1, permis:!bloque && permis, mot:bloque || (permis ? null : mot)};
    if(plus) for(var k in plus) o[k] = plus[k];
    l.push(o); return o;
  }
  D.HEROS[h].gestes.forEach(function(id){
    var G = D.GESTES[id];
    if(id === 'fleche'){
      g(id, G.nom, 'ennemi', ennemis, ennemis.length > 0, motE);
      /* (Romain : pendant tout le combat de Léo, l'arc de lune est enlevé, sans rien dire) */
      self.objets[h].forEach(function(o){ var O = D.OBJETS[o]; if(O && O.fleche && o !== 'fleches-argent') g('f:' + o, O.court || O.nom, 'ennemi', ennemis, ennemis.length > 0, motE); });
    }
    else if(id === 'dague'){ var d = self.devant(), ok = !(d === 'leo' && cache); g(id, G.nom, 'ennemi', ok ? [d] : [], ok, sombre ? L.MOTS.noir : L.MOTS.farine); }
    else if(id === 'oeil') g(id, G.nom, 'salle', [], !self.vu, L.MOTS.vu);
    else if(id === 'rune'){
      g(id, G.nom, 'ennemi', rats, rats.length > 0, L.MOTS.rien);
      /* le bâton de lune : toute la salle — il rallume les torches (et coupe l'attaque de Léo), il aveugle tous les rats */
      if(self.objets[h].indexOf('cristal-lune') >= 0) g('a:cristal-lune', G.nom, 'salle', [], sombre || rats.length > 0, L.MOTS.clair);
    }
    else if(id === 'bouclier'){
      g(id, G.nom, 'heros', amis, amis.length > 0, L.MOTS.personne, {sorte:'jaune'});
      /* (14 novembre, Romain : le bouclier de chêne, moins fort, protège les TROIS héros — dans tout le donjon) */
      if(self.objets[h].indexOf('baton-chene') >= 0) g('a:baton-chene', G.nom, 'heros', amis, amis.length > 0, L.MOTS.personne, {max:3, sorte:'chene'});
    }
    else if(id === 'louche'){ var dv = self.devant(), okL = !(dv === 'leo' && cache); g(id, G.nom, 'ennemi', okL ? [dv] : [], okL, sombre ? L.MOTS.noir : L.MOTS.farine); }
    else if(id === 'herbes') g(id, G.nom, 'equipe', [], amis.length > 0, L.MOTS.personne);
    /* (la rune d'appel n'a rien à appeler ici : pas de carte) */
  });
  /* les armes de Léo, ramassées par le Pisteur */
  if(h === 'pisteur') Object.keys(L.ARMES).forEach(function(a){
    var A = L.ARMES[a], reste = self.armes[a];
    if(reste === undefined) return;
    if(reste <= 0) return;                                           /* cassée : elle a quitté la bande */
    if(A.vise === 'heros') g('l:' + a, A.nom, 'heros', amis, amis.length > 0, L.MOTS.personne, {reste:reste, arme:a});
    else if(a === 'marteau' || a === 'faux'){ var okM = !cache; g('l:' + a, A.nom, 'ennemi', okM ? ['leo'] : [], okM, sombre ? L.MOTS.noir : L.MOTS.farine, {reste:reste, arme:a}); }
    else { var dz = self.devant(), okA = !(dz === 'leo' && cache); g('l:' + a, A.nom, 'ennemi', okA ? [dz] : [], okA, sombre ? L.MOTS.noir : L.MOTS.farine, {reste:reste, arme:a}); }
  });
  /* les potions : l'Alchimiste les lance, le Pisteur y trempe une flèche */
  if(D.HEROS[h].sac) this.recettes.forEach(function(rid){
    var r = D.RECETTES[rid], geste = 'p:' + rid;
    if(h === 'pisteur' && !r.fleche) return;
    if(r.vise === 'bete'){
      /* l'huile et le feu atteignent Léo jusque dans sa farine (c'est comme ça qu'on libère un ami, et que la farine fait BOUM) */
      var c2 = ennemis.slice();
      if(!sombre && nuage && (rid === 'huile' || rid === 'feu')) c2.push('leo');
      g(geste, r.nom, 'ennemi', c2, c2.length > 0, motE);
    }
    else if(r.vise === 'heros') g(geste, r.nom, 'heros', amis, amis.length > 0, L.MOTS.personne);
    else if(r.vise === 'sol') g(geste, r.nom, 'sol', auSol, auSol.length > 0, L.MOTS.personne);
    else g(geste, r.nom, r.vise === 'salle' ? 'salle' : 'equipe', [], true, null);
  });
  return l;
};
/* ---------- LA RANGÉE D'ICÔNES (Romain, 14 novembre) ----------
   « On enlève les icônes des personnages et on met uniquement les icônes qui nous intéressent » ; « on a besoin de cibler
   personne, on a juste besoin de pianoter sur les icônes ». */
function part(S){ return S.pv / S.pvMax; }
P._carte = function(h, geste){ var l = this.gestes(h); for(var i = 0; i < l.length; i++) if(l[i].geste === geste) return l[i]; return null; };
/* la cible qu'une icône choisit toute seule. « tirer » : pour de bon (c.agir) — c'est seulement là qu'on tire au sort entre deux
   héros à terre ; pour l'affichage (c.barre, à chaque image), on ne touche pas au hasard du combat. */
P.auto = function(h, geste, G, tirer){
  var self = this, Z = this.leo;
  G = G || this._carte(h, geste);
  if(!G || G.vise === 'salle' || G.vise === 'equipe') return [];
  var c = G.cibles.slice();
  function bas(l){ return l.slice().sort(function(a, b){ return part(self.h[a]) - part(self.h[b]) || D.ORDRE.indexOf(a) - D.ORDRE.indexOf(b); }); }
  /* le bouclier de chêne : les trois héros (sans écraser un bouclier jaune, qui est plus fort) */
  if(geste === 'a:baton-chene') return c.filter(function(x){ return self.h[x].bouclier !== 'jaune'; });
  /* le bouclier jaune : celui que Léo vise, si la rune de l'œil le montre ; sinon le plus blessé */
  if(geste === 'bouclier'){
    var libres = c.filter(function(x){ return self.h[x].bouclier !== 'jaune'; });
    if(this.vu && (Z.etape === 'prise' || Z.etape === 'elan') && Z.cibles.length){ var vises = libres.filter(function(x){ return Z.cibles.indexOf(x) >= 0; }); if(vises.length) libres = vises; }
    return bas(libres).slice(0, 1);
  }
  /* un soin pour un seul (le baume, la gourde) : le plus blessé (en part de sa vie) ; celui qui saigne compte comme blessé */
  if(G.vise === 'heros'){
    var blesses = c.filter(function(x){ return self.h[x].pv < self.h[x].pvMax || self.h[x].saigne; });
    return bas(blesses).slice(0, 1);
  }
  /* relever : celui qui est à terre ; s'ils sont deux, au hasard (Romain) */
  if(G.vise === 'sol') return c.length ? [c[tirer && c.length > 1 ? Math.floor(this.R() * c.length) % c.length : 0]] : [];
  /* la rune : un rat qu'elle peut éblouir (pas déjà ébloui, pas cuirassé), sinon le premier */
  if(geste === 'rune'){
    var rats = this.ratsVivants().filter(function(r){ return c.indexOf(r.id) >= 0; });
    var bons = rats.filter(function(r){ return !(r.ebloui > self.t) && !self.cuirasse(r); });
    return (bons.length ? bons : rats).slice(0, 1).map(function(r){ return r.id; });
  }
  /* l'acide : sur un rat cuirassé qui a encore son armure (c'est tout ce qu'il sait faire d'utile ici) */
  if(geste === 'p:acide'){
    var cuirs = this.ratsVivants().filter(function(r){ return c.indexOf(r.id) >= 0 && self.cuirasse(r); });
    return cuirs.slice(0, 1).map(function(r){ return r.id; });
  }
  /* le corps à corps (la dague, le crochet, le fléau) : ce qui est devant — c'est déjà la seule cible de la carte */
  if(c.length === 1) return c;
  /* ce qu'on lance (l'huile, le feu, le givre) : toujours sur Léo */
  return c.indexOf('leo') >= 0 ? ['leo'] : [];
};
P.barre = function(){
  var self = this, l = [], B = L.BARRE[this.phase] || {};
  D.ORDRE.forEach(function(h){
    var cartes = self.gestes(h), par = {};
    cartes.forEach(function(g){ par[g.geste] = g; });
    (B[h] || []).forEach(function(id){
      var g = par[id];
      if(!g) return;                                                  /* pas cette recette, pas ce bâton, arme cassée : pas d'icône */
      if(id === 'oeil' && self.vu) return;                            /* la rune de l'œil est ouverte pour tout le combat : son icône a fini de servir */
      var a = self.auto(h, id, g), o = {heros:h, geste:id, nom:g.nom, vise:g.vise, permis:g.permis, mot:g.mot, auto:a};
      if(g.reste != null){ o.reste = g.reste; o.arme = g.arme; }
      if(g.sorte) o.sorte = g.sorte;
      /* personne à viser : l'icône est éteinte, avec son mot */
      if(o.permis && g.vise !== 'salle' && g.vise !== 'equipe' && !a.length){
        o.permis = false;
        o.mot = id === 'bouclier' || id === 'a:baton-chene' ? L.MOTS.boucle : g.vise === 'heros' ? L.MOTS.forme : g.vise === 'sol' ? L.MOTS.personne : self.sombre() ? L.MOTS.noir : self.leo.nuage ? L.MOTS.farine : L.MOTS.rien;
      }
      l.push(o);
    });
  });
  return l;
};
P.refus = function(h, geste, cible){
  var l = this.gestes(h), G = null, i;
  for(i = 0; i < l.length; i++) if(l[i].geste === geste) G = l[i];
  if(!G) return geste && geste.indexOf('l:') === 0 ? L.MOTS.casse : L.MOTS.impossible;
  if(!G.permis) return G.mot || L.MOTS.impossible;
  if(G.vise === 'salle' || G.vise === 'equipe') return null;
  var c = Array.isArray(cible) ? cible : [cible];
  if(!c.length || c[0] == null) return L.MOTS.cible;
  if(c.length > (G.max || 1)) return L.MOTS.impossible;
  for(i = 0; i < c.length; i++) if(G.cibles.indexOf(c[i]) < 0) return G.vise === 'sol' ? L.MOTS.debout : G.vise === 'heros' ? L.MOTS.sol : (geste === 'dague' || geste === 'louche' || geste.indexOf('l:') === 0) ? L.MOTS.loin : L.MOTS.impossible;
  return null;
};

/* ---------- lancer un geste ---------- */
function dureeDe(geste, cibles){
  if(geste === 'fleche') return L.DUREES.fleche;
  if(geste === 'f:fleches-lourdes') return L.DUREES.lourde;
  if(geste.indexOf('f:') === 0) return L.DUREES.fleche;
  if(geste === 'dague') return L.DUREES.dague;
  if(geste === 'l:gourde') return L.DUREES.gourde;
  if(geste.indexOf('l:') === 0) return L.DUREES.arme;
  if(geste === 'herbes') return L.DUREES.herbes;
  if(geste === 'louche') return L.DUREES.louche;
  if(geste === 'rune') return L.DUREES.rune;
  if(geste === 'a:cristal-lune') return L.DUREES.lune;
  if(geste === 'bouclier') return L.DUREES.bouclier;
  if(geste === 'a:baton-chene') return cibles && cibles.length > 1 ? L.DUREES.bouclier2 : L.DUREES.bouclier;
  if(geste === 'oeil') return L.DUREES.oeil;
  return L.DUREES.potion;
}
P.dureeDe = function(h, geste, cibles){ return h === 'pisteur' && geste.indexOf('p:') === 0 ? L.DUREES.fleche : dureeDe(geste, cibles); };
P.agir = function(h, geste, cible){
  /* sans cible : l'icône choisit toute seule (la rangée du 14 novembre) */
  if(cible === undefined){
    var G0 = this._carte(h, geste);
    if(G0 && G0.permis && G0.vise !== 'salle' && G0.vise !== 'equipe'){
      var a0 = this.auto(h, geste, G0, true);
      if(!a0.length){ var B0 = this.barre().filter(function(x){ return x.heros === h && x.geste === geste; })[0]; return [{t:'refus', heros:h, geste:geste, mot:(B0 && B0.mot) || L.MOTS.rien}]; }
      cible = a0.length > 1 ? a0 : a0[0];
    }
  }
  var r = this.refus(h, geste, cible);
  if(r) return [{t:'refus', heros:h, geste:geste, mot:r}];
  var cibles = cible == null ? [] : (Array.isArray(cible) ? cible.slice() : [cible]);
  var d = this.dureeDe(h, geste, cibles), S = this.h[h];
  S.act = {geste:geste, cibles:cibles, impact:this.t + d.impact, fin:this.t + d.fin, fait:false};
  var ev = [{t:'geste', heros:h, geste:geste, cible:cibles.length > 1 ? cibles.slice() : (cibles[0] == null ? null : cibles[0]), impact:d.impact, fin:d.fin}];
  /* une arme ramassée s'use dès qu'on s'en sert */
  if(geste.indexOf('l:') === 0){ var a = geste.slice(2); this.armes[a]--; ev.push({t:'arme', nom:a, reste:this.armes[a]}); }
  return ev;
};
P._annuler = function(ev, h, cause){ var S = this.h[h]; if(S.act && !S.act.fait){ ev.push({t:'annule', heros:h, cause:cause}); } S.act = null; };

/* ---------- le temps passe ---------- */
var PAS = .05;
P.avancer = function(dt){
  var ev = [];
  if(this.resultat) return ev;
  var reste = Math.max(0, +dt || 0);
  while(reste > 1e-9 && !this.resultat){ var d = Math.min(PAS, reste); this._pas(ev, d); reste -= d; }
  return ev;
};
P._pas = function(ev, d){
  var self = this, Z = this.leo, t = (this.t += d);
  /* 1. les gestes des héros : l'impact, puis la fin de l'animation */
  D.ORDRE.forEach(function(h){
    var S = self.h[h], a = S.act;
    if(!a) return;
    if(!a.fait && t >= a.impact){ a.fait = true; self._effet(ev, h, a); }
    if(S.act === a && t >= a.fin) S.act = null;
  });
  if(this.resultat) return;
  /* 2. ce qui coule : le saignement et la brûlure des héros */
  D.ORDRE.forEach(function(h){
    var S = self.h[h];
    if(S.sol) return;
    if(S.saigne && t >= S.saigneT){ S.saigneT += L.SAIGNE.pas; self._perd(ev, h, L.SAIGNE.n, 'saigne'); }
    if(!S.sol && S.brule > 0){
      if(t >= S.brule){ S.brule = 0; ev.push({t:'etat', heros:h, nom:'brule', on:false}); }
      else if(t >= S.bruleT){ S.bruleT += L.BRULE.pas; self._perd(ev, h, L.BRULE.n, 'brule'); }
    }
    if(S.etourdi && t >= S.etourdi){ S.etourdi = 0; ev.push({t:'etat', heros:h, nom:'etourdi', on:false}); }
  });
  if(this._bilan(ev)) return;
  /* 3. Léo : ce qui le ronge (le feu, le saignement de la faux), puis ce qu'il fait */
  if(Z.brule > 0){
    if(t >= Z.brule){ Z.brule = 0; ev.push({t:'leo-etat', nom:'brule', on:false}); }
    else if(t >= Z.bruleT){ Z.bruleT += L.FEU.pas; this._blesseLeo(ev, L.FEU.n, 'brule', true); }
  }
  if(Z.saigne > 0 && t >= Z.saigneT){ Z.saigneT += L.SAIGNE.pas; this._blesseLeo(ev, L.SAIGNE.n * Z.saigne, 'saigne', true); }
  if(this.resultat) return;
  if(Z.flaque && t >= Z.flaque){ Z.flaque = 0; ev.push({t:'leo-etat', nom:'flaque', on:false}); }
  if(Z.ralenti && t >= Z.ralenti){ Z.ralenti = 0; ev.push({t:'leo-etat', nom:'ralenti', on:false}); }
  Z.tl += d * (Z.ralenti > t ? L.RALENTI.k : 1);
  var garde = 0;
  while(Z.tl >= Z.fin && !this.resultat && garde++ < 8) this._leoSuite(ev);
  /* 4. les rats */
  this.rats.forEach(function(r){
    if(r.mort || self.resultat) return;
    if(r.ebloui && t >= r.ebloui){ r.ebloui = 0; ev.push({t:'rat', quoi:'voit', id:r.id}); }
    if(r.dos && t >= r.dos){ r.dos = 0; ev.push({t:'rat', quoi:'libre', id:r.id, de:'dos'}); }
    if(r.colle && t >= r.colle){ r.colle = 0; ev.push({t:'rat', quoi:'libre', id:r.id, de:'colle'}); }
    if(t >= r.prochain){
      r.prochain = t + L.RATS[r.type].rythme;
      if(r.ebloui > t || r.colle > t || r.dos > t) return;                       /* aveuglé, collé, gelé ou retourné : il ne mord pas */
      var h = self._viser(); if(!h) return;
      var fois = r.enrage ? 2 : 1;
      ev.push({t:'rat', quoi:'mord', id:r.id, heros:h, fois:fois});
      for(var k = 0; k < fois; k++) self._frappe(ev, h, L.RATS[r.type].degats, {cause:'rat'});
    }
  });
  this._bilan(ev);
};

/* ---------- les coups sur les héros ---------- */
P._viser = function(sauf){
  var self = this, d = this.debout().filter(function(h){ return !self.h[h].attrape && (!sauf || sauf.indexOf(h) < 0); }), tot = 0, k;
  if(!d.length) d = this.debout().filter(function(h){ return !sauf || sauf.indexOf(h) < 0; });
  if(!d.length) return null;
  for(k = 0; k < d.length; k++) tot += L.VISEE[d[k]];
  var x = this.R() * tot;
  for(k = 0; k < d.length; k++){ x -= L.VISEE[d[k]]; if(x < 0) return d[k]; }
  return d[0];
};
/* un coup de Léo ou d'un rat. Le bouclier jaune arrête 75 % ET les contrôles ; un bouclier de chêne, 50 %, pas les contrôles.
   Romain : « dès qu'on a donné un coup sur le bouclier, hop, il disparaît ». Rend true si les contrôles passent. */
P._frappe = function(ev, h, brut, o){
  var S = this.h[h];
  if(S.sol) return false;
  o = o || {};
  var b = S.bouclier, k = b === 'jaune' ? D.CHIFFRES.bouclier : b === 'chene' ? D.CHIFFRES.bouclierChene : 1, n = brut > 0 ? Math.ceil(brut * k) : 0;
  S.pv = Math.max(0, S.pv - n);
  ev.push({t:'degats', heros:h, n:n, pv:S.pv, brut:brut, bouclier:b || null, cause:o.cause || null});
  if(b){ S.bouclier = null; ev.push({t:'bouclier', heros:h, on:false, casse:true}); }
  if(S.pv <= 0){ this._tombe(ev, h); return false; }
  return b !== 'jaune';
};
/* ce qui coule (le saignement, la brûlure) passe à travers tout */
P._perd = function(ev, h, n, cause){
  var S = this.h[h];
  S.pv = Math.max(0, S.pv - n);
  ev.push({t:'degats', heros:h, n:n, pv:S.pv, brut:n, bouclier:null, cause:cause, coule:true});
  if(S.pv <= 0) this._tombe(ev, h);
};
P._tombe = function(ev, h){
  var S = this.h[h], Z = this.leo;
  this._annuler(ev, h, 'tombe');
  S.sol = true; S.pv = 0; S.bouclier = null; S.saigne = false; S.brule = 0; S.etourdi = 0;
  if(S.attrape){ S.attrape = false; if(Z.tenu === h) Z.tenu = null; }
  ev.push({t:'tombe', heros:h});
};
P._etourdit = function(ev, h, duree){
  var S = this.h[h];
  if(S.sol) return;
  this._annuler(ev, h, 'etourdi');
  S.etourdi = this.t + duree;
  ev.push({t:'etat', heros:h, nom:'etourdi', on:true, duree:duree});
};
P._soin = function(ev, h, n, par){
  var S = this.h[h], avant = S.pv;
  if(S.sol) return;
  S.pv = Math.min(S.pvMax, S.pv + n);
  ev.push({t:'soin', heros:h, n:S.pv - avant, pv:S.pv, par:par});
  /* Romain : « le saignement, il s'arrête que si on met un soin. N'importe quel soin. » */
  if(S.saigne){ S.saigne = false; ev.push({t:'etat', heros:h, nom:'saigne', on:false}); }
};
P._bilan = function(ev){
  if(this.resultat) return true;
  if(!this.debout().length){ this.resultat = 'defaite'; ev.push({t:'fin', resultat:'defaite', phase:this.phase}); return true; }
  return false;
};

/* ---------- les coups sur Léo ---------- */
P._blesseLeo = function(ev, n, cause, coule){
  var Z = this.leo, PH = L.PHASES[this.phase];
  if(this.resultat) return;
  /* phase 3 : la potion le rend insensible à tout, sauf au saignement */
  if(this.phase === 3 && cause !== 'saigne'){ ev.push({t:'degats', cible:'leo', n:0, pv:Z.pv, cause:cause, mot:L.MOTS.insensible}); return; }
  var avant = Z.pv;
  Z.pv = Math.max(PH.a, Z.pv - n);
  var e = {t:'degats', cible:'leo', n:avant - Z.pv, pv:Z.pv, cause:cause};
  if(coule) e.coule = true;
  ev.push(e);
  if(Z.pv <= PH.a) this._finPhase(ev);
};
P._finPhase = function(ev){
  var self = this;
  this.ratsVivants().forEach(function(r){ r.mort = true; ev.push({t:'rat', quoi:'meurt', id:r.id, par:'chef'}); });
  if(this.phase >= 3){ this.resultat = 'victoire'; ev.push({t:'fin', resultat:'victoire', phase:3}); return; }
  this.resultat = 'phase';
  ev.push({t:'phase-fin', phase:this.phase});
};
/* la farine explose (une fois par nuage) */
P._boum = function(ev){
  var Z = this.leo, h = Z.tenu;
  Z.boum = true; Z.nuage = false;
  ev.push({t:'boum', n:L.BOUM.leo});
  ev.push({t:'leo-etat', nom:'nuage', on:false, par:'feu'});
  if(h){
    /* Romain : le héros pris dans la farine se prend 30 — et il en sort */
    Z.tenu = null; this.h[h].attrape = false;
    ev.push({t:'etat', heros:h, nom:'attrape', on:false});
    ev.push({t:'leo', quoi:'lache', heros:h, par:'feu'});
    this._perd(ev, h, L.BOUM.heros, 'boum');
  }
  this._blesseLeo(ev, L.BOUM.leo, 'boum');
  if(this.resultat) return;
  Z.etape = 'noirci'; Z.fin = Z.tl + L.NOIRCI; Z.att = null; Z.cibles = [];
  ev.push({t:'leo-etat', nom:'noirci', on:true, n:L.NOIRCI});
};

/* ---------- l'effet d'un geste, au moment de l'impact ---------- */
P._effet = function(ev, h, a){
  var self = this, g = a.geste, c = a.cibles, Z = this.leo, t = this.t, C = D.CHIFFRES, x = c[0];
  if(g === 'oeil'){ this.vu = true; ev.push({t:'oeil', heros:h}); return; }
  if(g === 'herbes'){ this.debout().forEach(function(y){ self._soin(ev, y, C.herbes, 'herbes'); }); return; }
  if(g === 'bouclier' || g === 'a:baton-chene'){
    var sorte = g === 'bouclier' ? 'jaune' : 'chene';
    c.forEach(function(y){ var S = self.h[y]; if(S.sol || (sorte === 'chene' && S.bouclier === 'jaune')) return; S.bouclier = sorte; ev.push({t:'bouclier', heros:y, on:true, sorte:sorte}); });
    return;
  }
  if(g === 'a:cristal-lune'){
    /* le bâton de lune : la lumière sur toute la salle — elle rallume les torches et aveugle tous les rats */
    if(this.noir){
      this.noir = false; ev.push({t:'noir', on:false, par:'lune'});
      /* Romain, 14 novembre : « que ça arrête son attaque en cours, ça l'interrompt » — au moins une seconde */
      if(Z.etape === 'prise' || Z.etape === 'elan'){
        ev.push({t:'leo', quoi:'coupe', att:Z.att, par:'lune'});
        Z.etape = 'sonne'; Z.fin = Z.tl + L.ECLAIR; Z.att = null; Z.cibles = [];
      }
      else if(Z.etape === 'repos' || Z.etape === 'retour'){
        Z.fin = Math.max(Z.fin, Z.tl + L.ECLAIR);
        ev.push({t:'leo', quoi:'ebloui', duree:L.ECLAIR});
      }
    }
    this.ratsVivants().forEach(function(r){ self._ratLumiere(ev, r); });
    return;
  }
  if(g === 'rune'){ var rr = this.rat(x); if(rr && !rr.mort) this._ratLumiere(ev, rr); return; }
  if(g === 'l:gourde'){ if(!this.h[x].sol) this._soin(ev, x, Math.ceil(this.h[x].pvMax * L.GOURDE_SOIN), 'gourde'); return; }
  if(g.indexOf('p:') === 0 && h !== 'pisteur'){
    var rec = D.RECETTES[g.slice(2)];
    if(rec.soin){ this._soin(ev, x, rec.soin, g.slice(2)); return; }
    if(rec.soinEquipe){ this.debout().forEach(function(y){ self._soin(ev, y, rec.soinEquipe, g.slice(2)); }); return; }
    if(rec.releve){
      var S2 = this.h[x];
      if(S2.sol){ S2.sol = false; S2.pv = Math.min(S2.pvMax, rec.releve); ev.push({t:'releve', heros:x, pv:S2.pv, par:g.slice(2)}); }
      return;
    }
    if(rec.vise === 'salle'){                       /* le fumigène : rien contre Léo (Romain : « peut-être que le fumigène, il sert à rien ») */
      ev.push({t:'mot', sur:'leo', texte:L.MOTS.tousse});
      return;
    }
  }
  /* --- ce qui vise un ennemi --- */
  var coup = g === 'fleche' ? 'fleche' : g === 'f:fleches-lourdes' ? 'lourde' : g.indexOf('f:') === 0 ? 'fleche' : g === 'dague' ? 'dague' : g === 'louche' ? 'louche' : g.indexOf('l:') === 0 ? g.slice(2) : D.RECETTES[g.slice(2)].pouvoir;
  /* le fléau frappe DEUX cibles : celle de devant et la suivante (les rats d'abord, puis Léo) */
  if(coup === 'fleau'){
    var file = ids(this.ratsVivants()); if(!Z.nuage && !this.sombre()) file.push('leo');
    file.slice(0, 2).forEach(function(id){ self._touche(ev, h, id, 'fleau'); });
    return;
  }
  this._touche(ev, h, x, coup);
};
P._ratLumiere = function(ev, r){
  if(this.cuirasse(r)){ ev.push({t:'mot', sur:r.id, texte:L.MOTS.glisse}); return; }
  r.ebloui = this.t + L.EBLOUI;
  ev.push({t:'rat', quoi:'ebloui', id:r.id, duree:L.EBLOUI});
};
P._touche = function(ev, h, id, coup){
  var Z = this.leo, t = this.t, K = L.COUPS;
  if(id !== 'leo'){ var r = this.rat(id); if(r && !r.mort) this._toucheRat(ev, r, coup); else ev.push({t:'mot', sur:'leo', texte:L.MOTS.tropTard}); return; }
  /* --- sur Léo --- */
  /* dans le noir, il est intouchable (un geste parti avant que les torches s'éteignent tombe dans le vide) */
  if(this.sombre()){ ev.push({t:'mot', sur:'leo', texte:L.MOTS.noir}); return; }
  if(Z.nuage){
    /* dans sa farine : seuls l'huile et le feu l'atteignent */
    if(coup === 'feu' && !Z.boum){ this._boum(ev); return; }
    if(coup === 'huile' && Z.tenu){
      var hh = Z.tenu; Z.tenu = null; this.h[hh].attrape = false;
      ev.push({t:'etat', heros:hh, nom:'attrape', on:false});
      ev.push({t:'leo', quoi:'lache', heros:hh, par:'huile'});
      /* il trébuche : son nuage reste encore un moment (le temps d'y mettre le feu) */
      Z.etape = 'farine'; Z.fin = Z.tl + L.ATTAQUES.crochet.farine;
      return;
    }
    ev.push({t:'mot', sur:'leo', texte:L.MOTS.farine});
    return;
  }
  if(coup === 'huile' || coup === 'colle'){
    Z.flaque = t + L.FLAQUE;
    ev.push({t:'leo-etat', nom:'flaque', on:true, n:L.FLAQUE, par:coup});
    return;
  }
  if(coup === 'givre'){
    Z.ralenti = t + L.RALENTI.duree;
    ev.push({t:'leo-etat', nom:'ralenti', on:true, n:L.RALENTI.duree});
    return;
  }
  if(coup === 'marteau'){
    /* Romain : il ne fait pas de dégâts, il lui coupe son geste (c'est fait pour la gourde) */
    var A = Z.att ? L.ATTAQUES[Z.att] : null;
    if(A && !A.rapide && (Z.etape === 'prise' || Z.etape === 'elan')){
      ev.push({t:'leo', quoi:'coupe', att:Z.att, par:'marteau'});
      Z.etape = 'sonne'; Z.fin = Z.tl + L.SONNE; Z.att = null; Z.cibles = [];
    } else ev.push({t:'mot', sur:'leo', texte:L.MOTS.rien});
    return;
  }
  if(coup === 'faux'){
    /* la faux le fait saigner (ça se cumule : trois coups, trois saignements) — la seule chose qui le blesse en phase 3 */
    if(!Z.saigne) Z.saigneT = t + L.SAIGNE.pas;
    Z.saigne++;
    ev.push({t:'leo-etat', nom:'saigne', on:true, n:Z.saigne});
    return;
  }
  if(coup === 'lumiere' || coup === 'nuage'){ ev.push({t:'mot', sur:'leo', texte:L.MOTS.rien}); return; }
  var n = coup === 'dague' ? (Z.auSol ? K.dagueSol : K.dague) : K[coup] || 0;
  this._blesseLeo(ev, n, coup);
  if(coup === 'feu' && this.phase < 3 && !this.resultat){
    if(!Z.brule) Z.bruleT = t + L.FEU.pas;
    Z.brule = t + L.FEU.duree;
    ev.push({t:'leo-etat', nom:'brule', on:true, n:L.FEU.duree});
  }
};
P._toucheRat = function(ev, r, coup){
  var K = L.COUPS_RAT, t = this.t, ouvert = this.ratOuvert(r), cuir = this.cuirasse(r), n = 0;
  function blesse(self, n, cause){
    r.pv = Math.max(0, r.pv - n);
    ev.push({t:'degats', cible:r.id, n:n, pv:r.pv, cause:cause, critique:n >= 60});
    if(r.pv <= 0){ r.mort = true; ev.push({t:'rat', quoi:'meurt', id:r.id, par:cause}); }
  }
  if(coup === 'crochet'){
    /* Romain : le crochet tue un rat d'un coup ; sur un rat cuirassé, il casse l'armure, et le coup d'après le tue */
    if(cuir){ r.nu = true; ev.push({t:'rat', quoi:'nu', id:r.id, par:'crochet'}); return; }
    blesse(this, r.pv, 'crochet'); return;
  }
  if(coup === 'acide'){ if(cuir){ r.nu = true; ev.push({t:'rat', quoi:'nu', id:r.id, par:'acide'}); return; } blesse(this, K.acide, 'acide'); return; }
  if(coup === 'huile'){ if(cuir){ ev.push({t:'mot', sur:r.id, texte:L.MOTS.glisse}); return; } r.dos = t + L.COLLE_RAT; ev.push({t:'rat', quoi:'ebloui', id:r.id, duree:L.COLLE_RAT, par:'huile'}); return; }
  if(coup === 'colle' || coup === 'givre'){ r.colle = t + L.COLLE_RAT; ev.push({t:'rat', quoi:'colle', id:r.id, duree:L.COLLE_RAT, par:coup}); return; }
  if(coup === 'louche'){ if(!r.enrage){ r.enrage = true; ev.push({t:'rat', quoi:'enrage', id:r.id}); } blesse(this, K.louche, 'louche'); return; }
  if(coup === 'dague') n = ouvert ? K.dagueOuvert : cuir ? 2 : K.dague;
  else if(coup === 'fleau') n = ouvert ? K.fleauOuvert : cuir ? K.fleauCuir : K.fleau;
  else if(coup === 'lourde') n = ouvert ? K.lourdeOuvert : r.type === 'ratcuir' ? K.lourdeCuir : K.fleche;
  else if(coup === 'fleche') n = ouvert ? K.flecheOuvert : cuir ? 1 : K.fleche;
  else if(coup === 'feu') n = cuir ? 0 : K.feu;
  else { ev.push({t:'mot', sur:r.id, texte:L.MOTS.rien}); return; }
  if(n <= 0){ ev.push({t:'mot', sur:r.id, texte:L.MOTS.glisse}); return; }
  blesse(this, n, coup);
};

/* ======================================================================= CE QUE FAIT LÉO
   Il a sa propre horloge (Z.tl) : le givre la ralentit. Ses étapes : repos → prise → elan → (l'impact) → retour → repos…
   et, selon ce qui lui arrive : sol (il a glissé), tient / farine (le crochet), noirci (le BOUM), sonne (le marteau). */
P._leoSuite = function(ev){
  var Z = this.leo, A = Z.att ? L.ATTAQUES[Z.att] : null, self = this;
  switch(Z.etape){
    case 'repos': return this._leoPrise(ev);
    case 'prise':
      Z.etape = 'elan'; Z.fin = Z.tl + A.elan;
      ev.push({t:'leo', quoi:'elan', att:Z.att, cibles:Z.cibles.slice(), duree:A.elan, cache:this.sombre()});
      return;
    case 'elan': return this._leoImpact(ev, A);
    case 'tient':
      /* personne ne l'a libéré : Léo l'écrase et le rejette */
      /* (14 novembre, Romain : « l'écran de farine, il s'arrête jamais : il faut forcément faire du feu » — le nuage RESTE) */
      var h = Z.tenu;
      Z.tenu = null;
      if(h && !this.h[h].sol){
        this.h[h].attrape = false;
        ev.push({t:'etat', heros:h, nom:'attrape', on:false});
        ev.push({t:'leo', quoi:'lache', heros:h, par:'temps'});
        this._perd(ev, h, L.ATTAQUES.crochet.ecrase, 'crochet');
      }
      return this._leoRetour(ev, 'crochet');
    case 'farine':
      return this._leoRetour(ev, 'crochet');                             /* (le nuage reste : seul le feu l'enlève) */
    case 'sol':
      Z.auSol = false;
      ev.push({t:'leo', quoi:'debout'});
      return this._leoRepos(ev);
    case 'noirci': ev.push({t:'leo-etat', nom:'noirci', on:false}); return this._leoRepos(ev);
    case 'sonne': return this._leoRepos(ev);
    case 'retour': return this._leoRepos(ev);
  }
  this._leoRepos(ev);
};
P._leoRepos = function(ev){
  var Z = this.leo;
  Z.etape = 'repos'; Z.fin = Z.tl + L.CALME[this.phase]; Z.att = null; Z.cibles = [];
  ev.push({t:'leo', quoi:'repos'});
};
P._leoRetour = function(ev, att){
  var Z = this.leo, A = L.ATTAQUES[att];
  Z.etape = 'retour'; Z.fin = Z.tl + A.retour;
  ev.push({t:'leo', quoi:'retour', att:att});
};
/* il choisit son attaque (la suivante de la boucle) et sa proie, et prend son arme */
P._leoPrise = function(ev){
  var Z = this.leo, ordre = L.ORDRE[this.phase], self = this, nom, A, garde = 0;
  do{
    Z.k = (Z.k + 1) % ordre.length; nom = ordre[Z.k]; A = L.ATTAQUES[nom];
    /* le sifflet ne sert à rien si ses deux rats sont encore là */
  } while(A.rats && this.ratsVivants().length >= 2 && garde++ < ordre.length);
  Z.att = nom; Z.cibles = [];
  if(A.cibles === 'un'){ var h = this._viser(); if(h) Z.cibles = [h]; }
  else if(A.cibles === 'deux'){ var h1 = this._viser(); if(h1){ Z.cibles = [h1]; var h2 = this._viser([h1]); if(h2 && h2 !== h1) Z.cibles.push(h2); } }
  else if(A.cibles === 'tous') Z.cibles = this.debout();
  /* le crochet : il jette d'abord sa farine, et disparaît dedans */
  if(A.attrape){ Z.nuage = true; Z.boum = false; ev.push({t:'leo-etat', nom:'nuage', on:true}); }
  Z.etape = 'prise'; Z.fin = Z.tl + A.prise;
  ev.push({t:'leo', quoi:'prise', att:nom, arme:A.arme, cibles:Z.cibles.slice(), duree:A.prise, cache:this.sombre()});
  if(A.prise <= 0) this._leoSuite(ev);
};
P._leoImpact = function(ev, A){
  var Z = this.leo, self = this, nom = Z.att, t = this.t;
  function vivant(h){ return h && !self.h[h].sol; }
  /* la charge : de l'huile ou de la colle sous ses pieds → il glisse et tombe sur place */
  if(A.glisse && Z.flaque > t){
    Z.flaque = 0; Z.auSol = true;
    ev.push({t:'leo-etat', nom:'flaque', on:false});
    ev.push({t:'leo', quoi:'glisse', duree:A.glisse});
    Z.etape = 'sol'; Z.fin = Z.tl + A.glisse; Z.att = null; Z.cibles = [];
    return;
  }
  /* une proie tombée entre-temps : il en change */
  var cibles = [];
  if(A.cibles === 'tous') cibles = this.debout();
  else Z.cibles.forEach(function(h){ if(!vivant(h) || cibles.indexOf(h) >= 0) h = self._viser(cibles); if(h && cibles.indexOf(h) < 0) cibles.push(h); });
  ev.push({t:'leo', quoi:'impact', att:nom, cibles:cibles.slice()});
  if(A.noir){ this.noir = true; ev.push({t:'noir', on:true}); return this._leoRetour(ev, nom); }
  if(A.rats){
    var libres = [0, 1].filter(function(pl){ return !self.ratsVivants().some(function(r){ return r.place === pl; }); });
    var vague = L.VAGUES[Math.min(this.vague, L.VAGUES.length - 1)]; this.vague++;
    libres.forEach(function(pl, i){
      var type = vague[i % vague.length], r = {id:'r' + (++self.nRat), type:type, pv:L.RATS[type].pv, pvMax:L.RATS[type].pv, place:pl, prochain:t + 1.6 + i * .9, ebloui:0, dos:0, colle:0, nu:false, enrage:false, mort:false};
      self.rats.push(r);
      ev.push({t:'rat', quoi:'arrive', id:r.id, type:type, place:pl, pv:r.pv});
    });
    return this._leoRetour(ev, nom);
  }
  if(A.soin){
    var PH = L.PHASES[this.phase], avant = Z.pv;
    Z.pv = Math.min(PH.de, Z.pv + A.soin);
    ev.push({t:'soin-leo', n:Z.pv - avant, pv:Z.pv});
    return this._leoRetour(ev, nom);
  }
  if(A.saisit){
    /* phase 3 : il attrape le premier, et frappe le second avec. Le bouclier jaune empêche d'être attrapé : le coup est raté. */
    var pris = cibles[0], autre = cibles[1];
    if(!pris) return this._leoRetour(ev, nom);
    if(this.h[pris].bouclier === 'jaune'){
      this.h[pris].bouclier = null;
      ev.push({t:'bouclier', heros:pris, on:false, casse:true});
      ev.push({t:'mot', sur:pris, texte:'Raté !'});
      return this._leoRetour(ev, nom);
    }
    [pris, autre].forEach(function(h){ if(vivant(h)) self._frappe(ev, h, Math.round(self.h[h].pvMax * A.part), {cause:nom}); });
    return this._leoRetour(ev, nom);
  }
  var fois = A.fois || 1;
  cibles.forEach(function(h){
    var passe = false;
    for(var k = 0; k < fois; k++){
      if(!vivant(h)) break;
      var brut = A.part ? Math.round(self.h[h].pvMax * A.part) : (A.degats || 0);
      passe = self._frappe(ev, h, brut, {cause:nom});
    }
    if(!vivant(h) || !passe) return;
    if(A.etourdit) self._etourdit(ev, h, A.etourdit);
    if(A.saigne && !self.h[h].saigne){ self.h[h].saigne = true; self.h[h].saigneT = t + L.SAIGNE.pas; ev.push({t:'etat', heros:h, nom:'saigne', on:true}); }
    if(A.brule){ var S = self.h[h]; if(!S.brule) S.bruleT = t + L.BRULE.pas; S.brule = t + L.BRULE.duree; ev.push({t:'etat', heros:h, nom:'brule', on:true, duree:L.BRULE.duree}); }
    if(A.attrape){
      self._annuler(ev, h, 'attrape');
      self.h[h].attrape = true; Z.tenu = h;
      ev.push({t:'etat', heros:h, nom:'attrape', on:true});
    }
  });
  /* le poing de la phase 2 : il fait sauter tous les boucliers */
  if(A.casse) this.debout().forEach(function(h){ if(self.h[h].bouclier){ self.h[h].bouclier = null; ev.push({t:'bouclier', heros:h, on:false, casse:true}); } });
  if(this._bilan(ev)) return;
  if(A.attrape){
    if(Z.tenu){ Z.etape = 'tient'; Z.fin = Z.tl + A.tient; ev.push({t:'leo', quoi:'tient', heros:Z.tenu, duree:A.tient}); }
    else { Z.etape = 'farine'; Z.fin = Z.tl + A.farine; }                 /* personne d'attrapé : il reste un moment dans son nuage */
    return;
  }
  this._leoRetour(ev, nom);
};

/* les trois prochaines attaques, pour la rune de l'œil : [{att, nom, ic, enCours}] */
P._suite = function(){
  var Z = this.leo, ordre = L.ORDRE[this.phase], l = [], k = Z.k, self = this, garde = 0;
  var rats = this.ratsVivants().length;
  if(Z.att && (Z.etape === 'prise' || Z.etape === 'elan')) l.push({att:Z.att, nom:L.ATTAQUES[Z.att].nom, ic:L.ATTAQUES[Z.att].ic, enCours:true});
  while(l.length < 3 && garde++ < ordre.length * 2){
    k = (k + 1) % ordre.length;
    var A = L.ATTAQUES[ordre[k]];
    if(A.rats && rats >= 2 && l.length === 0) continue;               /* (le sifflet saute tant que ses deux rats sont là) */
    l.push({att:ordre[k], nom:A.nom, ic:A.ic, enCours:false});
  }
  return l;
};

/* ---------- la photo ---------- */
P.etat = function(){
  var self = this, Z = this.leo, t = this.t, A = Z.att ? L.ATTAQUES[Z.att] : null, sombre = this.sombre();
  var o = {phase:this.phase, t:t, fini:this.resultat, noir:sombre, vu:this.vu, heros:{}, rats:[], armes:copie(this.armes)};
  D.EXPOSES.forEach(function(h){
    var S = self.h[h];
    o.heros[h] = {pv:S.pv, pvMax:S.pvMax, sol:S.sol, bouclier:S.bouclier, etourdi:S.etourdi > t ? S.etourdi - t : 0, attrape:S.attrape, saigne:S.saigne, brule:S.brule > t,
      occupe:S.act ? Math.max(0, S.act.fin - t) : 0, geste:S.act ? S.act.geste : null, libre:self.libre(h)};
  });
  o.leo = {pv:Z.pv, pvMax:Z.pvMax, plancher:L.PHASES[this.phase].a, etape:Z.etape, att:Z.att, nom:A ? A.nom : null, arme:A ? A.arme : null,
    reste:Math.max(0, Z.fin - Z.tl), nuage:Z.nuage, tenu:Z.tenu, auSol:Z.auSol, flaque:Z.flaque > t, ralenti:Z.ralenti > t, brule:Z.brule > t, saigne:Z.saigne,
    cache:sombre || Z.nuage,                                          /* intouchable : dans le noir, dans sa farine */
    /* ce que la rune de l'œil montre : sa proie et ce qu'elle va prendre… */
    vise:this.vu && A && (Z.etape === 'prise' || Z.etape === 'elan') && Z.cibles.length ? {cibles:Z.cibles.slice(), degats:A.part ? null : (A.degats || 0), part:A.part || 0, fois:A.fois || 1} : null,
    /* … et ses trois prochaines attaques (Romain, 14 novembre : de petites icônes à ses pieds). La première : celle qu'il prépare
       (enCours), sinon la prochaine. */
    suite:this.vu ? this._suite() : null};
  this.rats.forEach(function(r){
    if(r.mort) return;
    o.rats.push({id:r.id, type:r.type, pv:r.pv, pvMax:r.pvMax, place:r.place, ebloui:r.ebloui > t || r.dos > t, colle:r.colle > t, nu:r.nu, enrage:r.enrage, ouvert:self.ratOuvert(r)});
  });
  return o;
};

var LeoRegles = {L:L, combat:function(p, o){ return new Combat(p, o); }};
if(NODE) module.exports = LeoRegles; else global.LeoRegles = LeoRegles;
})(typeof window !== 'undefined' ? window : this);
