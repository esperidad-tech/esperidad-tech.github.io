/* ==========================================================
   API DE GUIDAGE (pour le tutoriel ; 49-guide.js)
     Atelier.guider(cible, {fait:function(cible){…}})  : un rond lumineux doré (« ✨ Nouveau ! ») autour de la chose à toucher,
       la vue glisse jusqu'à elle ; pendant le guidage, le reste de l'atelier est inactif (un toucher ailleurs : « Pas maintenant ! »,
       la pièce peut toujours glisser, les panneaux ouverts marchent). Il tient d'un remontage de la vue à l'autre.
       Cibles : 'cueillette' (toucher ou glisser les ingrédients devant la porte), 'rangement' (ranger un ingrédient : le rond est
       sur le meuble qui lui convient), 'grimoire' (ouvrir le livre du lutrin), 'chaudron' (ouvrir le chaudron), 'paillasse'
       (ouvrir les analyses), 'carton' (sortir un objet d'un carton), 'potion' (toucher le flacon prêt devant la porte).
     Quand c'est fait : le guidage s'arrête, document reçoit CustomEvent('atelier:guide-fait', {detail:{cible}}), et fait(cible) est appelé.
     Atelier.guider(null) : arrête. Atelier.guidage() : la cible en cours (ou null). Renvoie false pour une cible inconnue.
     (Pendant le guidage, Mimi ne fait ni bêtise, ni sortie, ni chasse à la souris.)
   MIMI, ÉTAPE 4 (48-mimi.js)
     Atelier.mjGagne(S, type) : le moteur l'appelle quand l'Alchimiste réussit un de SES mini-jeux (moteur-actions.js, lancer) ;
       la première fois pour chaque type : un accessoire pour le chat (parfois un rare), annoncé à la prochaine ouverture de l'atelier.
       Renvoie {id, nom, rare} ou null. Atelier.ACCESSOIRES : le catalogue.
     Sauvegarde (champs en plus, rien d'enlevé) : etat.garde {a, neuf, annonce, mj}, etat.tama.butin / sortie / souris, objet chat .acc {cou, tete}.
     opts.sansSurprise (bancs d'essai seulement) : pas de sortie ni de souris spontanées.
   ========================================================== */
/* ==========================================================
   Brumeval v2 — l'atelier de l'Alchimiste (window.Atelier)
   Une pièce à décorer et à aménager où TOUT se fait en touchant l'image :
   - toucher = l'action de la chose ; appuyer, garder le doigt, puis glisser = la déplacer ;
   - la décoration (tapis, plante, tableau, murs, plancher…) change de style ou de couleur à chaque toucher ;
   - tout est dessiné dans UNE perspective, celle de la pièce (07-perspective.js) ; chaque chose reste exactement là où on la lâche ;
   - les rangements s'ouvrent en gros plan (ranger, ressortir, étiquettes, 🎨) ; contre un mur de côté, ils se mettent de profil ;
   - la cueillette est posée par terre devant la porte : on la glisse directement dans un rangement ;
   - les potions finies : des flacons posés devant la porte (à quoi elles servent, donner, vendre) ;
   - le lutrin et son grimoire (recettes), le grand chaudron (mini-jeu ; ses fioles vides sur un badge),
     la paillasse d'analyse (objets reçus), le carton de rangement 📦 (une icône fixe en bas à droite de l'écran) ;
   - par une arche du mur de droite : la chambre (même perspective, ses meubles à elle) ; le bouton fixe 🛏️ / ⚗️ en bas à gauche y mène,
     et un objet glissé sur ce bouton (ou sur l'arche) passe dans l'autre pièce ; le vrai matériel d'alchimiste se pose où l'on veut.
   Préfixe CSS : .at-   Dépend de donnees.js (DONNEES) ; utilise MJ.util s'il existe.

   API : Atelier.etatNeuf() · ajouter(etat, ingr, n) · compter(etat) · retirer(etat, ingr, n) · normaliser(etat)
         donnerCartons(etat, n) · aRangementSec(etat) · reglages(niveau, mods) (= MJ.reglages('chaudron', …)) · vue(el, opts) -> {arreter(), maj(opts?)}
   Notes pour le moteur :
   - onChange(etat) sert à SAUVEGARDER : ne pas redessiner la vue dedans (on perdrait un glisser en cours).
   - Après Atelier.ajouter / donnerCartons, ou si fioles/potions/objets changent : vue.maj({…}).
   - « Préparer » ouvre le mini-jeu « Le chaudron » (mj-chaudron.js, à charger avant) par-dessus l'atelier,
     avec opts.niveau, opts.mods (M.modsPour('chaudron').mods) et opts.aides.
   - Les ingrédients viennent des RANGEMENTS (pas de la cueillette restée par terre) et sont retirés quand on les verse : perdus si ça rate.
   - Ce qu'on cueille (Atelier.ajouter) est posé devant la porte (etat.panier, nom gardé pour les sauvegardes).
   - Boutons du moteur dans l'atelier : data-act="donner-potion" | "vendre" | "analyser" (data-id), gérés par le clic global du moteur.
     opts.potions {id:n}, opts.fioles, opts.vendre (bool), opts.actions (actions restantes), opts.sansActions (pas de « · 1 action »),
     opts.analyses [{id, ic, nom, fait:0|1|2, t, detail}] (objets reçus à analyser).
   - potionFinie(id, reussi, detail) est appelé une seule fois, quand l'enfant touche « Continuer »,
     ou s'il abandonne (🏳️ deux fois), ou si arreter() est appelé pendant la préparation (reussi = false).
   - Objets de boutique : thermometre → jauge précise (revele) au chaudron ; chaudron_cuivre → chaudron en cuivre ;
     les objets portés (gants, lunettes, ceinture, sac) ne sont pas posés dans l'atelier.
   ========================================================== */
(function(){
'use strict';

var K = '#24182e';                 /* contour du style retenu */
var W = 1200, H = 860;             /* pièce logique (le cœur ; elle s'agrandit pour remplir l'écran) */
var SOL_MIN = 552, SOL_MAX = 850;  /* bas des objets posés au sol */
var ECH_MUR = 0.84;                /* échelle du mur du fond (perspective) */
var GRILLE = 10;
var uidVue = 0;

function DD(){ return window.DONNEES || {}; }
function util(){ return (window.MJ && window.MJ.util) || null; }
function parNiveau(n, v1, v10, min, max){
  var u = util();
  if(u && u.parNiveau) return u.parNiveau(n, v1, v10, min, max);
  var v = v1 + (v10 - v1) * (n - 1) / 9;
  if(min !== undefined) v = Math.max(min, v);
  if(max !== undefined) v = Math.min(max, v);
  return v;
}
function borne(v, a, b){ return Math.max(a, Math.min(b, v)); }
function esc(s){ return typo(String(s == null ? '' : s)).replace(/[&<>"']/g, function(c){ return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]; }); }
/* la typographie française : pas de « ! » ni de « : » tout seuls au début d'une ligne */
function typo(s){ return s.replace(/ ([!?:;»])/g, ' $1').replace(/« /g, '« '); }
function cles(o){ return Object.keys(o || {}); }
function somme(m){ var t = 0; cles(m).forEach(function(k){ t += m[k] || 0; }); return t; }
function rnd(a, b){ return a + Math.random() * (b - a); }

/* ---------- Ce qui sort des cartons ---------- */
/* Les rangements sont des meubles « classe » (Romain) : placards et petits meubles d'apothicaire au mur,
   étagère à épices, bocaux suspendus, vitrine ; le plancher garde la place pour les tapis et la décoration. */
var CARTONS_DEPART = [
  ['placard', 'etagere', 'tapis', 'lampe', 'plante'],
  ['commode', 'tabouret', 'tableau', 'horloge'],
  ['epices', 'bocaux', 'table', 'chat'],
  ['apothicaire', 'suspendus', 'vitrine']
];
/* Plein de rangements : les anciennes sauvegardes reçoivent ce carton une fois (etat.cadeauRangements) */
var CARTON_RANGEMENTS = ['apothicaire', 'suspendus', 'vitrine'];
/* Les cadeaux (chaque enquête gagnée, chaque niveau) : surtout de la décoration nouvelle */
var CARTONS_SUITE = [
  ['fanions', 'vase', 'lanterne'],
  ['cadre', 'plante', 'coussin'],
  ['lanterne', 'guirlande', 'tapis'],
  ['vase', 'bougies', 'cadre'],
  ['herbes', 'fanions', 'lanterne'],
  ['plante', 'coussin', 'epices'],
  ['tableau', 'vase', 'guirlande'],
  ['lanterne', 'cadre', 'tapis']
];
/* La mise à jour de la décoration : les anciennes sauvegardes reçoivent ce colis une fois (etat.cadeauDeco) */
var CARTON_DECO = ['fanions', 'vase', 'lanterne'];
/* La chambre (étape 2) : deux cartons posés dans la chambre (k.ch), dès le début (et une fois pour les anciennes sauvegardes : etat.cadeauChambre) */
var CARTONS_CHAMBRE = [
  ['lit', 'tapis_grand', 'rideaux', 'chevet', 'lampe_chevet'],
  ['armoire_ch', 'pouf', 'miroir', 'arbre_chat']
];
/* Le vrai matériel d'alchimiste : le premier carton (les anciennes sauvegardes le reçoivent tout de suite : etat.cadeauLabo) */
var CARTON_LABO = ['alambic_labo', 'cornues', 'sablier', 'etagere_fioles'];
/* Les cadeaux de l'étape 2 (la chambre, le laboratoire), en alternance avec les cadeaux de décoration (etat.ncs, etat.nc) */
var CARTONS_SUITE2 = [
  CARTON_LABO,
  ['boule_cristal', 'astrolabe', 'herbes'],
  ['coffre', 'coussin', 'mobile'],
  ['balance', 'carte_ciel', 'ratelier'],
  ['bibliotheque', 'chevet', 'lanterne'],
  ['mortier_pilon', 'plante', 'bougies'],
  ['tapis_grand', 'pouf', 'lampe_chevet']
];
/* Les affaires du chat (étape 3) : un carton dans l'atelier, dès le début (une fois pour les anciennes sauvegardes : etat.cadeauChat) */
var CARTON_CHAT = ['panier', 'gamelle', 'eau', 'distributeur', 'litiere'];
/* Un carton qui contient un meuble de la chambre est posé dans la chambre */
function cartonChambre(l){ return l.some(function(t){ return !!(CAT[t] && CAT[t].chambre); }); }
function nouveauCarton(e, l, ch){ e.n++; var k = {id:'k' + e.n, t:'carton', reste:l.slice(), ouvert:0}; if(ch === undefined ? cartonChambre(l) : ch) k.ch = 1; e.cartons.push(k); return k; }
/* Ce qui n'existe plus : le pot de peinture (« une mauvaise idée », dit Romain) ; il disparaît des sauvegardes et des cartons */
var RETIRES = {pot_peinture:1};
/* Les anciens rangements (caisse, sac, tonneau : « moches », dit Romain) deviennent de beaux meubles, avec leur contenu */
var ANCIENS = {caisse:'placard', sac:'placard', tonneau:'apothicaire'};
/* (23 novembre, Romain : « que le chaudron soit vraiment intégré dans la cheminée, avec impossibilité de le bouger ») LE FOYER : le
   creux de la cheminée, où le grand chaudron est scellé. x : le milieu de la cheminée (monde) ; ow : la demi-largeur de l'ouverture ;
   prof : la profondeur du creux dans le mur ; Z : l'endroit du DEVANT du chaudron (monde : 0 = le mur, plus = vers nous) ;
   ech : la taille du chaudron dans l'âtre (il doit passer entre les deux piliers). */
var FOYER = {x:950, ow:110, prof:150, Z:54, ech:0.92};
/* Les meubles spéciaux : un seul de chaque, toujours dans la pièce (on peut les déplacer — sauf le chaudron, scellé dans le foyer) */
var SPECIAUX = {
  chaudron:{id:'ch', x:950, y:716},
  lutrin:{id:'lu', x:400, y:766},
  paillasse:{id:'pa', x:240, y:640}
};

/* ---------- Les liquides vont dans le verre (bocaux, fioles, vitrine), le reste dans les tiroirs et les placards ---------- */
var LIQUIDES = {eau:1, brume:1, miel:1};
function estLiquide(ingr){ return !!LIQUIDES[ingr]; }

/* ---------- L'état (JSON pur) ----------
   {v:4, n:compteur d'ids, nc:cartons de décoration offerts, ncs:cartons de la chambre et du laboratoire offerts,
    cartons:[{id, t:'carton'|'colis', reste:[types], ouvert:0|1, ch:1 (posé dans la chambre)}],
    objets:[{id, t, x, y, f:0|1, v:variante (le pelage du chat), st:style (forme et couleur), cote:0|'g'|'d' (contre un mur de côté, de profil),
             sur:null|{o:idParent|'cheminee', k, dx}, on:0|1, neuf:0|1, placer:0|1 (à placer au montage), pc:1 (dans la chambre ; sans pc : l'atelier),
             cases:[{e:[étiquettes], i:{ingr:n}}]}],
      (les meubles spéciaux : chaudron 'ch', lutrin du grimoire 'lu', paillasse d'analyse 'pa' ; les fioles d'ingrédients 'fx')
    panier:{ingr:n} (la cueillette, posée par terre devant la porte), nouveaux:n (arrivés depuis la dernière fois),
    reserve:[{id, t, st, v, on}] (le carton de rangement 📦 : la décoration qu'on ne veut pas dans la pièce),
    deco:{fond, murG, murD, sol, fond2, murG2, murD2, sol2} (styles des murs et des planchers : l'atelier, puis la chambre), theme:n (ancien, gardé pour les sauvegardes),
    cadeauChambre:0|1, cadeauLabo:0|1 (les cartons de l'étape 2, une seule fois), cadeauChat:0|1 (le carton des affaires du chat),
    le chat (étape 3) : sur l'objet chat, o.nom, o.b:{faim, soif, amour, jeu, dodo} (0 à 100), o.chaton:1, o.taille, o.ronde:1 ;
      tama:{jeu:secondes de jeu, betise:le moment (en secondes de jeu) de la dernière bêtise, moment:'enquête:moment', portee:{phase, t}},
      betises:[{id, t:'fiole'|'pelote', x, y, pc, c} | {t:'tabouret', o:id}] (à réparer d'un toucher), chezOdette:[{nom, v, enquete}],
    gamelle / eau : o.plein:1 ; tabouret : o.renverse:1,
    (o.x, o.y : là où il est, voir 30-vue.js ; contre un mur de côté, o.pz, o.py : sa profondeur, sa hauteur),
    boutique:[ids d'objets de boutique déjà sortis], flaque:0|1, cadeauRangements:0|1, cadeauDeco:0|1,
    appris:{verre:n, sec:n} (rangements réussis : la petite règle 💧 / 🍃 se cache après 3)}
   Anciennes sauvegardes (v1 de l'atelier figé, v2, v3) : migrées par normaliser(), contenu gardé, styles par défaut. */
function porteFioles(){ return {id:'fx', t:'fioles_ingr', x:0, y:0, f:0, v:0, sur:null, placer:1, cases:[0, 1, 2, 3].map(function(){ return {e:[], i:{}}; })}; }
function decoDepart(){ var d = {}; cles(DECO_NF).forEach(function(k){ d[k] = DECO_DEPART[k] || 0; }); return d; }
function etatNeuf(){
  return {
    v:4, n:CARTONS_DEPART.length + CARTONS_CHAMBRE.length + 1, nc:0, ncs:0,
    cartons:CARTONS_DEPART.map(function(l, i){ return {id:'k' + (i + 1), t:'carton', reste:l.slice(), ouvert:0}; })
      .concat(CARTONS_CHAMBRE.map(function(l, i){ return {id:'k' + (CARTONS_DEPART.length + i + 1), t:'carton', reste:l.slice(), ouvert:0, ch:1}; }))
      .concat([{id:'k' + (CARTONS_DEPART.length + CARTONS_CHAMBRE.length + 1), t:'carton', reste:CARTON_CHAT.slice(), ouvert:0}]),
    objets:[porteFioles()], panier:{}, nouveaux:0, reserve:[], deco:decoDepart(), theme:0,
    boutique:[], flaque:0, appris:{}, cadeauRangements:1, cadeauDeco:1, cadeauChambre:1, cadeauLabo:1, cadeauChat:1,
    tama:{jeu:0, betise:0, portee:{phase:0, t:0}, butin:null}, betises:[], chezOdette:[], garde:{a:[], neuf:[], annonce:[], mj:{}}
  };
}
/* Anciennes sauvegardes (v1) : un liquide rangé dans un tiroir (ou un solide dans un bocal) va dans
   un rangement qui lui convient s'il y a de la place, sinon il retourne devant la porte. */
function reglerVerre(e){
  function verre(o){ return !!((CAT[o.t] || {}).verre); }
  function place(o, j){ var c = (CAT[o.t] || {}).cases; return c && c[j] ? c[j].cap - somme(o.cases[j].i) : 0; }
  var mal = [];
  e.objets.forEach(function(o){
    (o.cases || []).forEach(function(c){
      cles(c.i).forEach(function(k){ if(c.i[k] > 0 && estLiquide(k) !== verre(o)){ mal.push([k, c.i[k]]); delete c.i[k]; } });
    });
  });
  mal.forEach(function(m){
    var k = m[0], n = m[1];
    e.objets.forEach(function(o){
      if(!n || verre(o) !== estLiquide(k)) return;
      (o.cases || []).forEach(function(c, j){
        if(!n) return;
        var ok = c.i[k] > 0 || !somme(c.i), q = ok ? Math.min(n, place(o, j)) : 0;
        if(q > 0){ c.i[k] = (c.i[k] || 0) + q; n -= q; }
      });
    });
    if(n) e.panier[k] = (e.panier[k] || 0) + n;
  });
}
/* Un ancien rangement (caisse, sac, tonneau) devient un beau meuble : son contenu est réparti dans les nouvelles cases */
function remplacerAncien(e, o){
  var t = ANCIENS[o.t], c = CAT[t];
  if(!t || !c) return;
  var vieux = o.cases || [], etq = [], tout = {};
  vieux.forEach(function(cs){ (cs.e || []).forEach(function(x){ if(etq.indexOf(x) < 0) etq.push(x); }); cles(cs.i).forEach(function(k){ if(cs.i[k] > 0) tout[k] = (tout[k] || 0) + cs.i[k]; }); });
  o.t = t;
  o.cases = c.cases.map(function(){ return {e:[], i:{}}; });
  o.cases[0].e = etq.slice(0, 3);
  cles(tout).sort(function(a, b){ return tout[b] - tout[a]; }).forEach(function(k){
    var n = tout[k];
    o.cases.forEach(function(cs, j){
      if(!n) return;
      var q = Math.min(n, c.cases[j].cap - somme(cs.i));
      if(q > 0 && (!somme(cs.i) || cs.i[k] > 0)){ cs.i[k] = (cs.i[k] || 0) + q; n -= q; }
    });
    o.cases.forEach(function(cs, j){ if(!n) return; var q = Math.min(n, c.cases[j].cap - somme(cs.i)); if(q > 0){ cs.i[k] = (cs.i[k] || 0) + q; n -= q; } });
    if(n) e.panier[k] = (e.panier[k] || 0) + n;
  });
  o.sur = null; o.cote = 0; o.placer = 1;
}
function normaliser(e){
  if(!e || typeof e !== 'object') e = {};
  var vide = e.v === undefined && !e.objets && !e.cartons, ancien = e.v !== 4, avant3 = e.v !== 3 && e.v !== 4;
  if(ancien){
    var neuf = etatNeuf();
    /* (« nouveaux » : ce qui était dans l'ancien panier arrive comme une nouveauté, voir plus bas) */
    var cadeaux = {cadeauRangements:1, cadeauDeco:1, cadeauChambre:1, cadeauLabo:1, cadeauChat:1, nouveaux:1, objets:1};
    if(e.cartons === undefined) e.cadeauChambre = 1;      /* les cartons du début (avec ceux de la chambre) */
    cles(neuf).forEach(function(k){ if(!cadeaux[k] && (e[k] === undefined || k === 'v')) e[k] = neuf[k]; });
    if(vide){ e.cadeauRangements = 1; e.cadeauDeco = 1; e.cadeauChambre = 1; e.cadeauLabo = 1; e.cadeauChat = 1; e.objets = neuf.objets; }
  }
  if(!Array.isArray(e.cartons)) e.cartons = [];
  if(!Array.isArray(e.objets)) e.objets = [];
  if(!Array.isArray(e.boutique)) e.boutique = [];
  if(!Array.isArray(e.reserve)) e.reserve = [];
  if(!e.panier || typeof e.panier !== 'object') e.panier = {};
  if(!e.appris || typeof e.appris !== 'object') e.appris = {};
  if(!e.deco || typeof e.deco !== 'object') e.deco = {};
  cles(DECO_NF).forEach(function(k){ if(typeof e.deco[k] !== 'number') e.deco[k] = DECO_DEPART[k] || 0; });
  if(typeof e.theme !== 'number') e.theme = 0;
  if(typeof e.n !== 'number') e.n = 10 + e.objets.length + e.cartons.length;
  if(typeof e.nc !== 'number') e.nc = 0;
  if(typeof e.ncs !== 'number') e.ncs = 0;
  e.cartons.forEach(function(c){ if(c && Array.isArray(c.reste)) c.reste = c.reste.filter(function(t){ return !RETIRES[t]; }); });
  e.cartons = e.cartons.filter(function(c){ return c && Array.isArray(c.reste) && c.reste.length; });
  e.cartons.forEach(function(c){ c.reste = c.reste.map(function(t){ return ANCIENS[t] || t; }); });
  e.reserve = e.reserve.filter(function(x){ return x && x.t && !RETIRES[x.t]; });
  e.reserve.forEach(function(x){ if(ANCIENS[x.t]) x.t = ANCIENS[x.t]; });
  e.objets = e.objets.filter(function(o){ return o && o.t && !RETIRES[o.t]; });
  delete e.deco.armoire;       /* l'armoire à potions n'existe plus : les potions sont des flacons devant la porte */
  e.objets.forEach(function(o){
    if(o.cases && !Array.isArray(o.cases)) o.cases = [];
    (o.cases || []).forEach(function(c){
      if(!Array.isArray(c.e)) c.e = [];
      if(!c.i || typeof c.i !== 'object') c.i = {};
    });
    if(ANCIENS[o.t]) remplacerAncien(e, o);
    /* les fioles d'ingrédients étaient fixées sous l'établi (qui n'existe plus) : elles vont au mur */
    if(o.fixe){ delete o.fixe; o.placer = 1; o.sur = null; }
    /* l'établi est devenu la paillasse d'analyse ; le chat sur le grimoire va sur le lutrin */
    if(o.sur && o.sur.o === 'etabli') o.sur = {o:'pa', k:0, dx:-160};
    if(o.sur && o.sur.o === 'grimoire') o.sur = {o:'lu', k:0, dx:0};
  });
  if(!e.objets.some(function(o){ return o.t === 'fioles_ingr'; })) e.objets.unshift(porteFioles());
  /* les meubles spéciaux (chaudron, lutrin, paillasse) : toujours là, un de chaque */
  cles(SPECIAUX).forEach(function(t){
    var S = SPECIAUX[t], l = e.objets.filter(function(o){ return o.t === t; });
    if(!l.length) e.objets.push({id:S.id, t:t, x:S.x, y:S.y, f:0, v:0, st:0, sur:null});
    else if(l.length > 1) e.objets = e.objets.filter(function(o){ return o.t !== t || o === l[0]; });
  });
  /* (23 novembre) le grand chaudron est scellé dans le foyer : où qu'il ait été posé (même dans la chambre), il y retourne */
  e.objets.forEach(function(o){ if(o.t === 'chaudron') sceller(o); });
  /* le chaudron a maintenant trois formes (10 novembre) : une ancienne sauvegarde garde son chaudron rond, et sa couleur */
  if(!e.chFormes){ e.chFormes = 1; e.objets.forEach(function(o){ if(o.t === 'chaudron') o.st = styleAvec(3, 0, (o.st || 0) % 8); }); }
  /* l'établi des plantes a maintenant cinq formes, comme la paillasse (12 novembre) : une ancienne sauvegarde garde sa couleur, et prend l'établi de bois */
  if(!e.etFormes){ e.etFormes = 1; e.objets.forEach(function(o){ if(o.t === 'etabli') o.st = styleAvec(5, 0, (o.st || 0) % 8); }); if(e.etabli) e.etabli.st = styleAvec(5, 0, (e.etabli.st || 0) % 8); }
  if(avant3 && typeof CAT !== 'undefined') reglerVerre(e);
  /* plein de rangements : une seule fois, un carton de beaux rangements pour les anciennes sauvegardes */
  if(!e.cadeauRangements){
    e.cadeauRangements = 1;
    e.n++;
    e.cartons.push({id:'k' + e.n, t:'carton', reste:CARTON_RANGEMENTS.slice(), ouvert:0});
  }
  /* la nouvelle décoration : un carton cadeau (fanions, vase, lanterne) pour ceux qui avaient déjà un atelier */
  if(!e.cadeauDeco){
    e.cadeauDeco = 1;
    e.n++;
    e.cartons.push({id:'k' + e.n, t:'carton', reste:CARTON_DECO.slice(), ouvert:0});
  }
  /* la chambre : ses deux cartons de meubles, posés dans la chambre ; et le premier carton de matériel d'alchimiste */
  if(!e.cadeauChambre){
    e.cadeauChambre = 1;
    CARTONS_CHAMBRE.forEach(function(l){ nouveauCarton(e, l, 1); });
  }
  if(!e.cadeauLabo){
    e.cadeauLabo = 1;
    nouveauCarton(e, CARTON_LABO, 0);
    e.ncs = Math.max(e.ncs, 1);
  }
  /* les affaires du chat (étape 3) : gamelles, distributeur, panier, dans l'atelier */
  if(!e.cadeauChat){
    e.cadeauChat = 1;
    nouveauCarton(e, CARTON_CHAT, 0);
  }
  /* (16 novembre) la litière de Mimi : une partie déjà commencée la reçoit dans un carton */
  if(!e.cadeauLitiere){
    e.cadeauLitiere = 1;
    if(!e.objets.some(function(o){ return o.t === 'litiere'; }) && !e.cartons.some(function(k){ return (k.reste || []).indexOf('litiere') >= 0; })) nouveauCarton(e, ['litiere'], 0);
  }
  normaliserChat(e);
  e.objets.forEach(function(o){ if(o.pc !== 1) delete o.pc; });
  e.cartons.forEach(function(k){ if(k.ch !== 1) delete k.ch; });
  cles(e.panier).forEach(function(k){ if(!(e.panier[k] > 0)) delete e.panier[k]; });
  if(typeof e.nouveaux !== 'number') e.nouveaux = somme(e.panier);
  e.nouveaux = Math.max(0, Math.min(e.nouveaux, somme(e.panier)));
  e.v = 4;
  return e;
}
/* Le chat, un petit Tamagotchi (étape 3) : ses besoins, ses bêtises, son chaton (voir 47-tamagotchi.js) */
function normaliserChat(e){
  if(!e.tama || typeof e.tama !== 'object') e.tama = {};
  var t = e.tama;
  if(typeof t.jeu !== 'number') t.jeu = 0;
  if(typeof t.betise !== 'number') t.betise = 0;
  if(t.enq !== undefined && typeof t.enq !== 'number') delete t.enq;
  if(!t.portee || typeof t.portee !== 'object') t.portee = {phase:0, t:0};
  if(typeof t.portee.phase !== 'number') t.portee.phase = 0;
  if(typeof t.portee.t !== 'number') t.portee.t = 0;
  if(!Array.isArray(e.betises)) e.betises = [];
  if(!Array.isArray(e.chezOdette)) e.chezOdette = [];
  /* étape 4 : la garde-robe du chat, sa sortie par la chatière (au plus une par moment), la souris */
  if(!e.garde || typeof e.garde !== 'object') e.garde = {};
  ['a', 'neuf', 'annonce'].forEach(function(k){ if(!Array.isArray(e.garde[k])) e.garde[k] = []; e.garde[k] = e.garde[k].filter(function(id, i, l){ return typeof ACC !== 'undefined' && ACC[id] && l.indexOf(id) === i; }); });
  e.garde.neuf = e.garde.neuf.filter(function(id){ return e.garde.a.indexOf(id) >= 0; });
  if(!e.garde.mj || typeof e.garde.mj !== 'object') e.garde.mj = {};
  if(!Array.isArray(e.garde.trav)) e.garde.trav = [];
  e.garde.trav = e.garde.trav.filter(function(k, i, l){ return typeof k === 'string' && l.indexOf(k) === i; }).slice(-600);
  if(t.sortie !== undefined && typeof t.sortie !== 'string') delete t.sortie;
  if(t.souris !== undefined && typeof t.souris !== 'number') delete t.souris;
  if(t.butin && !(typeof t.butin === 'object' && typeof t.butin.ingr === 'string')) t.butin = null;
  if(t.butin === undefined) t.butin = null;
  /* (16 novembre) le Tamagotchi : le coffret, les jouets, les nourritures… (la jauge cachée de la variété et les points de soin
     n'existent plus depuis « la jauge seule » : une vieille sauvegarde les oublie) */
  delete t.varie; delete t.pts; delete t.derniers;
  if(!t.cadeaux || typeof t.cadeaux !== 'object') t.cadeaux = {};
  if(t.dehors && !(typeof t.dehors === 'object' && typeof t.dehors.c === 'string')) t.dehors = null;
  if(t.coffret && !(typeof t.coffret === 'object' && typeof t.coffret.c === 'string' && typeof t.coffret.x === 'number' && typeof t.coffret.y === 'number')) t.coffret = null;
  if(t.dehors === undefined) t.dehors = null;
  if(t.coffret === undefined) t.coffret = null;
  /* (16 novembre au soir, étape 2) les cœurs, les envies, la lassitude. Une sauvegarde d'avant repart d'un bonheur modeste :
     Romain : « j'ai joué 2 secondes et elle est déjà au maximum […] quand on arrive au maximum, ça doit être une vraie réussite » */
  var avantCoeurs = !(t.v >= 2);
  /* (16 novembre, 22 h 22 : « la jauge seule ») les cinq cœurs n'existent plus ; à leur place, cinq familles d'affaires, cachées
     (t.fam : celles qui sont complètes ; t.recus : les coins douillets déjà rapportés dans un coffret) ; une envie garde « d » : elle l'a dite */
  t.v = 3;
  delete t.c; delete t.grands;
  if(!t.las || typeof t.las !== 'object') t.las = {};
  cles(t.las).forEach(function(k){ if(!(t.las[k] > 0)) delete t.las[k]; });
  if(!t.fam || typeof t.fam !== 'object') t.fam = {};
  cles(t.fam).forEach(function(k){ if(t.fam[k] !== 1) delete t.fam[k]; });
  t.recus = (Array.isArray(t.recus) ? t.recus : []).filter(function(x, i, l){ return typeof x === 'string' && l.indexOf(x) === i; });
  t.parc = (Array.isArray(t.parc) ? t.parc : []).filter(function(x, i, l){ return typeof x === 'string' && l.indexOf(x) === i; });      /* (les morceaux du parc à chat déjà arrivés) */
  if(!(t.envie && typeof t.envie === 'object' && typeof t.envie.k === 'string' && typeof t.envie.n === 'number')) t.envie = null;
  if(t.envie && t.envie.d !== 1) delete t.envie.d;
  if(typeof t.envieT !== 'number') t.envieT = t.jeu + 20;
  if(t.envieAvant !== undefined && typeof t.envieAvant !== 'string') delete t.envieAvant;
  if(!e.mimi || typeof e.mimi !== 'object') e.mimi = {};
  var mm = e.mimi, uniq = function(l, ok){ return (Array.isArray(l) ? l : []).filter(function(id, i, a){ return typeof id === 'string' && ok(id) && a.indexOf(id) === i; }); };
  mm.jouets = uniq(mm.jouets, function(id){ return !!JOUETS[id]; }); if(mm.jouets.indexOf('pelote') < 0) mm.jouets.unshift('pelote');
  mm.nour = uniq(mm.nour, function(id){ return !!NOURS[id]; }); if(mm.nour.indexOf('croquettes') < 0) mm.nour.unshift('croquettes');
  mm.soins = uniq(mm.soins, function(id){ return SOINS_SUITE.indexOf(id) >= 0; });
  if(mm.soins.indexOf('photo') < 0) mm.soins.push('photo');      /* (l'appareil photo : à tout le monde, tout de suite) */
  mm.neufs = uniq(mm.neufs, function(id){ return !!JOUETS[id] || SOINS_SUITE.indexOf(id) >= 0; });
  /* (l'album à compléter) une photo par pose (k : PHOTOS) ; un album d'avant garde une photo de chaque pose qu'il avait déjà */
  mm.album = (Array.isArray(mm.album) ? mm.album : []).filter(function(f){ return f && typeof f === 'object' && (typeof f.k === 'string' || typeof f.pose === 'string'); });
  mm.album.forEach(function(f){ if(typeof f.k !== 'string') f.k = /miaou/.test(f.x || '') ? 'miaou' : /baille/.test(f.x || '') ? 'baille' : f.pose === 'saute' ? 'saut' : f.pose === 'tape' ? 'assis' : f.pose; delete f.pose; delete f.x; });
  mm.album = mm.album.filter(function(f, i, l){ return PHOTOS.some(function(P){ return P.k === f.k; }) && l.map(function(g){ return g.k; }).indexOf(f.k) === i; });
  /* (les pelages et les yeux gagnés : des numéros de MimiPantin.CHATS et de MimiPantin.YEUX) */
  if(!mm.peaux || typeof mm.peaux !== 'object') mm.peaux = {};
  var MPn = window.MimiPantin;
  ['p', 'y'].forEach(function(k){ var nb = MPn ? (k === 'p' ? MPn.CHATS.length : MPn.YEUX.length) : 0; mm.peaux[k] = (Array.isArray(mm.peaux[k]) ? mm.peaux[k] : []).filter(function(x, i, l){ return typeof x === 'number' && x >= 0 && x === Math.floor(x) && x < nb && l.indexOf(x) === i; }); });
  if(mm.peauNeuve !== 1) delete mm.peauNeuve;
  var meres = 0;
  e.objets.forEach(function(o){
    if(o.t !== 'chat') return;
    if(!o.b || typeof o.b !== 'object') o.b = {};
    bonheur(o);      /* (avant de toucher aux besoins : une vieille sauvegarde prend son bonheur dans leur moyenne) */
    if(avantCoeurs) o.bh = Math.min(o.bh, BH_APRES);
    delete o.b.dodo;
    ['faim', 'soif', 'propre', 'amour', 'jeu'].forEach(function(k){ if(typeof o.b[k] !== 'number' || !(o.b[k] >= 0)) o.b[k] = 80; o.b[k] = Math.max(BESOIN_MIN, Math.min(100, Math.round(o.b[k]))); });
    if(o.acc !== undefined){ if(!o.acc || typeof o.acc !== 'object') delete o.acc; else ['cou', 'tete'].concat(cles(o.acc)).forEach(function(k){ var id = o.acc[k]; if(id === undefined) return; if(typeof ACC === 'undefined' || !ACC[id] || ACC[id].slot !== k || e.garde.a.indexOf(id) < 0) delete o.acc[k]; }); }
    if(typeof o.nom !== 'string' || !o.nom) o.nom = o.chaton ? 'Pompon' : (meres++ ? 'Minette' : 'Mimi');
    else if(!o.chaton) meres++;
  });
  /* une bêtise à réparer : rien n'est perdu (le tabouret existe toujours, la fiole et la pelote ont leur place) */
  e.betises = e.betises.filter(function(b){
    if(!b || typeof b !== 'object') return false;
    if(b.t === 'tabouret') return e.objets.some(function(o){ return o.id === b.o && o.renverse; });
    return (b.t === 'fiole' || b.t === 'pelote') && typeof b.x === 'number' && typeof b.y === 'number' && typeof b.id === 'string';
  });
  e.objets.forEach(function(o){ if(o.renverse && !e.betises.some(function(b){ return b.t === 'tabouret' && b.o === o.id; })) e.betises.push({t:'tabouret', o:o.id}); });
}
function ajouter(etat, ingr, n){
  normaliser(etat);
  n = n === undefined ? 1 : n;
  if(!ingr || !(n > 0)) return etat;
  etat.panier[ingr] = (etat.panier[ingr] || 0) + n;
  etat.nouveaux = (etat.nouveaux || 0) + n;
  return etat;
}
function compter(etat){
  var t = {};
  if(!etat) return t;
  cles(etat.panier).forEach(function(k){ if(etat.panier[k] > 0) t[k] = (t[k] || 0) + etat.panier[k]; });
  (etat.objets || []).forEach(function(o){
    (o.cases || []).forEach(function(c){
      cles(c.i).forEach(function(k){ if(c.i[k] > 0) t[k] = (t[k] || 0) + c.i[k]; });
    });
  });
  return t;
}
/* Retire n ingrédients (devant la porte d'abord, puis dans les rangements). Renvoie le nombre retiré. */
function retirer(etat, ingr, n){
  normaliser(etat);
  n = n === undefined ? 1 : n;
  var fait = 0;
  var p = Math.min(n, etat.panier[ingr] || 0);
  if(p){ etat.panier[ingr] -= p; fait += p; if(!etat.panier[ingr]) delete etat.panier[ingr]; }
  etat.objets.forEach(function(o){
    (o.cases || []).forEach(function(c){
      if(fait >= n) return;
      var q = Math.min(n - fait, c.i[ingr] || 0);
      if(q){ c.i[ingr] -= q; fait += q; if(!c.i[ingr]) delete c.i[ingr]; }
    });
  });
  etat.nouveaux = Math.max(0, Math.min(etat.nouveaux || 0, somme(etat.panier)));
  return fait;
}
function donnerCartons(etat, n){
  normaliser(etat);
  n = n === undefined ? 1 : n;
  for(var i = 0; i < n; i++){
    var l;
    /* d'abord, en alternance : la chambre et le laboratoire (étape 2), et la décoration */
    if(etat.ncs < CARTONS_SUITE2.length && etat.ncs <= etat.nc){ l = CARTONS_SUITE2[etat.ncs]; etat.ncs++; }
    else { l = CARTONS_SUITE[etat.nc % CARTONS_SUITE.length]; etat.nc++; }
    nouveauCarton(etat, l);
  }
  return etat;
}
/* Pour les missions : un rangement « sec » (tiroirs, placards) est-il sorti des cartons ? */
function aRangementSec(etat){ return !!etat && (etat.objets || []).some(function(o){ var c = CAT[o.t]; return c && c.cases && !c.verre; }); }

/* ---------- Difficulté du chaudron : celle du mini-jeu « Le chaudron » ---------- */
function reglages(niveau, mods){
  var MJ = window.MJ;
  return (MJ && MJ.reglages && MJ.TYPES && MJ.TYPES.chaudron) ? MJ.reglages('chaudron', niveau, mods || {}) : null;
}

/* ==========================================================
   Les couleurs de la décoration : 8 thèmes. Le premier, « naturel », est le dessin d'origine.
   Un objet qui se décore porte un style o.st (un nombre) : sa forme = st % nf, son thème = st % 8.
   nf (le nombre de formes : 1, 3 ou 5) n'a aucun facteur commun avec 8 : en touchant encore et encore,
   on passe par TOUTES les formes et TOUTES les couleurs, et chaque toucher change les deux.
   ========================================================== */
var THEMES = [
  {id:'naturel', nom:'naturel', c:'#c98450'},
  {id:'violet', nom:'violet', c:'#8d5cf0'},
  {id:'jaune', nom:'jaune', c:'#f2c230'},
  {id:'rose', nom:'rose', c:'#f06eaa'},
  {id:'vert', nom:'vert', c:'#4cbb5c'},
  {id:'bleu', nom:'bleu', c:'#3d8ef0'},
  {id:'rouge', nom:'rouge', c:'#e0443a'},
  {id:'orange', nom:'orange', c:'#f58a2a'}
];
var NT = THEMES.length;
function hexRgb(h){ h = String(h).replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function rgbHex(r){ return '#' + r.map(function(v){ v = Math.round(borne(v, 0, 255)); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function melange(a, b, t){ var x = hexRgb(a), y = hexRgb(b); return rgbHex([0, 1, 2].map(function(i){ return x[i] + (y[i] - x[i]) * t; })); }
function clair(c, t){ return melange(c, '#ffffff', t); }
function sombre(c, t){ return melange(c, '#1c1230', t); }

/* Les dégradés d'origine qu'un thème repeint (le bois, la terre cuite, le métal, l'or, la pierre, la toile).
   Pour chaque arrêt : [éclaircir (+) ou assombrir (−), position, opacité?] ; v : dégradé vertical. */
var DEG_THEME = {
  bois:{s:[[0.3, 0], [0, 0.55], [-0.4, 1]]},
  boisC:{s:[[0.45, 0], [0.12, 0.6], [-0.22, 1]]},
  boisH:{s:[[0.55, 0], [0.22, 1]], v:1},
  boisS:{s:[[-0.25, 0], [-0.5, 1]]},
  terre:{s:[[0.35, 0], [0, 0.6], [-0.35, 1]]},
  cuivre:{s:[[0.55, 0], [0.05, 0.5], [-0.42, 1]]},
  metal:{s:[[-0.25, 0], [-0.5, 0.55], [-0.75, 1]]},
  or:{s:[[0.7, 0], [0.18, 0.5], [-0.3, 1]]},
  pierre:{s:[[0.4, 0], [0.12, 0.6], [-0.18, 1]]},
  toile:{s:[[0.62, 0], [0.38, 0.6], [0.1, 1]]}
};
function teinteArret(c, d){ return d >= 0 ? clair(c, d) : sombre(c, -d); }
function defsThemes(){
  var s = '';
  for(var i = 1; i < NT; i++){
    var c = THEMES[i].c;
    cles(DEG_THEME).forEach(function(n){
      var g = DEG_THEME[n];
      s += lin('t' + i + '-' + n, g.s.map(function(a){ return [teinteArret(c, a[0]), a[1]]; }), g.v);
    });
  }
  return s;
}
/* Repeindre un dessin : ses dégradés de bois, de terre, de métal… deviennent ceux du thème */
var RE_THEME = /url\(#atg-(boisC|boisH|boisS|bois|terre|cuivre|metal|or|pierre|toile)\)/g;
function repeindre(svg, ti){ return ti ? svg.replace(RE_THEME, 'url(#atg-t' + ti + '-$1)') : svg; }

/* ---------- Les styles ---------- */
function nfDe(c){ return (c && c.nf) || 1; }
function nStyles(c){ return nfDe(c) * NT; }
function styleAvec(nf, forme, theme){
  for(var s = 0; s < nf * NT; s++) if(s % nf === forme && s % NT === theme) return s;
  return 0;
}
function formeDe(o){ return (o.st || 0) % nfDe(catDe(o)); }
function themeDe(o){ return (o.st || 0) % NT; }
/* Les couleurs d'un thème pour un dessin : principale, claire, foncée ; « naturel » garde les couleurs d'origine */
function couleurs(ti, nat){
  if(!ti) return nat;
  var c = THEMES[ti].c;
  return [c, clair(c, 0.5), sombre(c, 0.38)];
}
/* Le décor des pièces : murs (fond, gauche, droite), plancher — 5 formes chacun.
   La chambre a ses murs et son plancher à elle (fond2, murG2, murD2, sol2), avec un style de départ plus doux (DECO_DEPART). */
var DECO_NF = {fond:5, murG:5, murD:5, sol:5, fond2:5, murG2:5, murD2:5, sol2:5};
var DECO_DEPART = {fond2:37, murG2:37, murD2:37, sol2:0};     /* 37 : des étoiles sur un mur bleu (une chambre de magicienne) */
var NOMS_FOND = ['pierres', 'rayures', 'étoiles', 'boiseries', 'fleurs'];
var NOMS_SOL = ['planches', 'damier', 'chevrons', 'dalles', 'tapis'];
function decoForme(V, cle){ return ((V.etat.deco || {})[cle] || 0) % DECO_NF[cle]; }
function decoTheme(V, cle){ return ((V.etat.deco || {})[cle] || 0) % NT; }

/* ==========================================================
   UNE SEULE PERSPECTIVE pour toute la pièce et tout ce qui s'y trouve (Romain : « il faut suivre la perspective de la pièce »).
   Le monde en 3D : X le long du mur du fond (de gauche à droite), Y la hauteur au-dessus du plancher, Z la distance au mur du fond
   (vers nous). L'œil est loin devant la pièce et au-dessus de tout : on voit le dessus des meubles, des pots, des bocaux.
   Projection (point de fuite (VPX, VPY), mur du fond à Z = 0, son bas à l'écran en y = SOL_Y) :
     s = D_OEIL / (D_OEIL - Z) ;  écran = (VPX + (X - VPX)·s , VPY + (SOL_Y - Y - VPY)·s)
   Le mur du fond est donc vu de face ; les lignes du plancher et des murs de côté vont toutes vers le point de fuite.
   Un objet a son repère : son origine (le milieu du bas de sa face avant), ses axes (de face, ou tourné contre un mur de côté).
   Il se dessine en unités « locales » (1 unité = 1/S_REF unité du monde) avec de petites formes 3D : boîtes, cylindres, disques,
   et ses décorations collées sur une face (une transformation affine les pose sur la face, même de biais).
   ========================================================== */
var VPX = 600, VPY = -300, SOL_Y = 520;
var PROF = 900;                                              /* l'avant du cœur de la pièce (à l'écran : y 860) */
var D_OEIL = PROF / (1 - (SOL_Y - VPY) / (860 - VPY));       /* la distance de l'œil au mur du fond */
var S_REF = 1.22;                                            /* au milieu du plancher, un objet est dessiné à sa taille */
var OEIL = [VPX, SOL_Y - VPY, D_OEIL];                       /* l'œil, dans le monde */
function sZ(Z){ return D_OEIL / (D_OEIL - Z); }
function zS(s){ return D_OEIL * (1 - 1 / s); }
function proj(X, Y, Z){ var s = sZ(Z); return [VPX + (X - VPX) * s, VPY + (SOL_Y - Y - VPY) * s]; }
/* Un point de l'écran sur le plancher, sur le mur du fond, sur un mur de côté (plan X = xm) */
function surSol(x, y){ var s = (y - VPY) / (SOL_Y - VPY); return {X:VPX + (x - VPX) / s, Z:zS(s), s:s}; }
function surCote(x, y, xm){ var s = (x - VPX) / (xm - VPX); s = Math.max(1, s); return {Z:zS(s), Y:SOL_Y - VPY - (y - VPY) / s, s:s}; }
function echelleProf(Z){ return sZ(Z) / S_REF; }
function echelleSol(y){ return (y - VPY) / (SOL_Y - VPY) / S_REF; }

/* ---------- Le repère d'un objet ----------
   o : origine (monde) ; ax : [ex, ey, ez] (monde par unité locale) ; w, h : sa boîte locale (l'origine est en (w/2, h)) */
var AXES_FACE = [[1 / S_REF, 0, 0], [0, -1 / S_REF, 0], [0, 0, -1 / S_REF]];
/* (le chaudron dans le foyer : de face, un peu plus petit — FOYER.ech) */
var AXES_FOYER = AXES_FACE.map(function(a){ return a.map(function(v){ return v * FOYER.ech; }); });
/* Scelle le chaudron dans le foyer : sa place ne dépend plus de rien (ni du doigt, ni de la taille de l'écran) */
function sceller(o){
  var a = proj(FOYER.x, 0, FOYER.Z);
  o.x = Math.round(a[0] * 10) / 10; o.y = Math.round(a[1] * 10) / 10; o.cote = 0; o.sur = null;
  delete o.pz; delete o.py; delete o.pc; delete o.placer;
}
var AXES_G = [[0, 0, -1 / S_REF], [0, -1 / S_REF, 0], [-1 / S_REF, 0, 0]];   /* contre le mur de gauche : il regarde vers la droite */
var AXES_D = [[0, 0, 1 / S_REF], [0, -1 / S_REF, 0], [1 / S_REF, 0, 0]];     /* contre le mur de droite : il regarde vers la gauche */
function axesDe(cote){ return cote === 'g' ? AXES_G : cote === 'd' ? AXES_D : AXES_FACE; }
function repere(o, ax, w, h){
  var a = proj(o[0], o[1], o[2]);
  return {o:o, ax:ax, w:w, h:h, A:a, k:echelleProf(o[2])};
}
function mondeDe(R, x, y, z){
  var dx = x - R.w / 2, dy = y - R.h, ax = R.ax;
  return [R.o[0] + dx * ax[0][0] + dy * ax[1][0] + z * ax[2][0], R.o[1] + dx * ax[0][1] + dy * ax[1][1] + z * ax[2][1], R.o[2] + dx * ax[0][2] + dy * ax[1][2] + z * ax[2][2]];
}

/* ---------- Le contexte de dessin : les points 3D locaux deviennent des points du SVG ----------
   sortie : 'local' (le SVG de l'objet, de taille w × h à l'échelle k) ou 'monde' (le fond de la pièce, en unités du monde) */
function ctx3d(R, monde){
  var c = {R:R, bb:[1e9, 1e9, -1e9, -1e9]};
  c.Q = function(x, y, z){
    var W = mondeDe(R, x, y, z || 0), p = proj(W[0], W[1], W[2]), u, v;
    if(monde){ u = p[0]; v = p[1]; }
    else { u = R.w / 2 + (p[0] - R.A[0]) / R.k; v = R.h + (p[1] - R.A[1]) / R.k; }
    if(u < c.bb[0]) c.bb[0] = u; if(v < c.bb[1]) c.bb[1] = v; if(u > c.bb[2]) c.bb[2] = u; if(v > c.bb[3]) c.bb[3] = v;
    return [u, v];
  };
  c.pt = function(x, y, z){ var q = c.Q(x, y, z); return f1(q[0]) + ',' + f1(q[1]); };
  /* une face est-elle tournée vers l'œil ? (n : normale locale [nx, ny, nz] ; p : un point de la face) */
  c.voit = function(n, p){
    var ax = R.ax, nw = [n[0] * ax[0][0] + n[1] * ax[1][0] + n[2] * ax[2][0], n[0] * ax[0][1] + n[1] * ax[1][1] + n[2] * ax[2][1], n[0] * ax[0][2] + n[1] * ax[1][2] + n[2] * ax[2][2]];
    var W = mondeDe(R, p[0], p[1], p[2]);
    return (OEIL[0] - W[0]) * nw[0] + (OEIL[1] - W[1]) * nw[1] + (OEIL[2] - W[2]) * nw[2] > 0;
  };
  c.dist = function(p){ var W = mondeDe(R, p[0], p[1], p[2]); return Math.hypot(OEIL[0] - W[0], OEIL[1] - W[1], OEIL[2] - W[2]); };
  /* un polygone de points 3D locaux */
  c.poly = function(pts, f, xx){ return P('M' + pts.map(function(q){ return c.pt(q[0], q[1], q[2]); }).join(' L') + ' Z', f, xx); };
  c.ligne = function(pts, col, w, xx){ return T('M' + pts.map(function(q){ return c.pt(q[0], q[1], q[2]); }).join(' L'), col, w, xx); };
  /* une boîte : x0..x1 (largeur), y0..y1 (y0 en haut), z0..z1 (z0 devant) ; f : {face, dessus, cote, arriere} (couleurs) ; deco : {face, dessus} (SVG en plus) */
  c.boite = function(x0, y0, x1, y1, z0, z1, f, xx){
    var faces = [
      {n:[0, 0, -1], p:[[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], f:f.face},
      {n:[0, -1, 0], p:[[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], f:f.dessus || f.face},
      {n:[-1, 0, 0], p:[[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], f:f.cote || f.face},
      {n:[1, 0, 0], p:[[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], f:f.cote || f.face}
    ];
    var vus = faces.filter(function(F){ var m = F.p[0], q = F.p[2]; return F.f && c.voit(F.n, [(m[0] + q[0]) / 2, (m[1] + q[1]) / 2, (m[2] + q[2]) / 2]); });
    vus.sort(function(a, b){ return c.dist(b.p[2]) + c.dist(b.p[0]) - c.dist(a.p[2]) - c.dist(a.p[0]); });
    return vus.map(function(F){ return c.poly(F.p, F.f, xx); }).join('');
  };
  /* des points sur un cercle horizontal (centre cx, cz ; hauteur y) */
  c.cercle = function(cx, cz, r, y, n){
    var l = [];
    n = n || 28;
    for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2; l.push(c.Q(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)); }
    return l;
  };
  /* un disque horizontal (le dessus d'un pot, un tapis rond, l'eau du chaudron) */
  c.disque = function(cx, cz, r, y, f, xx, rz){
    var l = [];
    for(var i = 0; i < 32; i++){ var a = i / 32 * Math.PI * 2; l.push(c.Q(cx + Math.cos(a) * r, y, cz + Math.sin(a) * (rz || r))); }
    return P(lisse(l, true), f, xx);
  };
  /* un cylindre debout : son corps (l'enveloppe des deux cercles) puis son dessus */
  c.cylindre = function(cx, cz, r, yh, yb, f, fh, xx, rb){
    var h = c.cercle(cx, cz, r, yh), b = c.cercle(cx, cz, rb === undefined ? r : rb, yb), env = enveloppe(h.concat(b));
    return P(lisse(env, true, 0.5), f, xx) + (fh === null ? '' : P(lisse(h, true), fh || f, xx));
  };
  /* un SVG dessiné sur la face avant (z) : de face, il ne bouge pas ; de biais, une transformation affine le pose sur la face */
  c.sur = function(svg, z, cx, cy){
    z = z || 0;
    var x = cx === undefined ? R.w / 2 : cx, y = cy === undefined ? R.h / 2 : cy;
    var o = c.Q(x, y, z), ax = c.Q(x + 10, y, z), ay = c.Q(x, y + 10, z);
    var a = (ax[0] - o[0]) / 10, b = (ax[1] - o[1]) / 10, cc = (ay[0] - o[0]) / 10, d = (ay[1] - o[1]) / 10;
    if(Math.abs(a - 1) < 1e-3 && Math.abs(b) < 1e-3 && Math.abs(cc) < 1e-3 && Math.abs(d - 1) < 1e-3 && Math.abs(o[0] - x) < 0.05 && Math.abs(o[1] - y) < 0.05) return svg;
    var e = o[0] - (a * x + cc * y), ff = o[1] - (b * x + d * y);
    return '<g transform="matrix(' + [a, b, cc, d, e, ff].map(function(v){ return v.toFixed(4); }).join(',') + ')">' + svg + '</g>';
  };
  /* la pente d'une face (pour savoir si on la voit beaucoup, un peu…) : de face = 1 */
  c.largeurFace = function(){ var p = c.Q(0, R.h, 0), q = c.Q(R.w, R.h, 0); return Math.abs(q[0] - p[0]) / R.w; };
  return c;
}
/* Une courbe douce qui passe par des points (Catmull-Rom → Bézier) */
function lisse(l, ferme, t){
  t = t === undefined ? 1 : t;
  var n = l.length;
  if(n < 3) return 'M' + l.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L');
  var s = 'M' + f1(l[0][0]) + ',' + f1(l[0][1]);
  var fin = ferme ? n : n - 1;
  for(var i = 0; i < fin; i++){
    var p0 = l[(i - 1 + n) % n], p1 = l[i], p2 = l[(i + 1) % n], p3 = l[(i + 2) % n];
    if(!ferme){ if(i === 0) p0 = p1; if(i + 2 >= n) p3 = p2; }
    s += ' C' + f1(p1[0] + (p2[0] - p0[0]) / 6 * t) + ',' + f1(p1[1] + (p2[1] - p0[1]) / 6 * t) + ' ' + f1(p2[0] - (p3[0] - p1[0]) / 6 * t) + ',' + f1(p2[1] - (p3[1] - p1[1]) / 6 * t) + ' ' + f1(p2[0]) + ',' + f1(p2[1]);
  }
  return s + (ferme ? ' Z' : '');
}
/* L'enveloppe convexe d'un nuage de points (le contour d'un cylindre vu d'en haut) */
function enveloppe(pts){
  var p = pts.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
  function cr(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  var bas = [], haut = [];
  p.forEach(function(q){ while(bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], q) <= 0) bas.pop(); bas.push(q); });
  p.slice().reverse().forEach(function(q){ while(haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], q) <= 0) haut.pop(); haut.push(q); });
  return bas.slice(0, -1).concat(haut.slice(0, -1));
}

/* ==========================================================
   Petits outils de dessin SVG (contour épais, dégradés « jouet »)
   ========================================================== */
var SW = 5;
function P(d, f, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function R(x, y, w, h, rx, f, xx){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>'; }
function Ell(cx, cy, rx, ry, f, xx){ return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>'; }
function Cir(cx, cy, r, f, xx){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (r < 8 ? 2.5 : SW) + '"' + (xx || '') + '/>'; }
function T(d, c, w, xx){ return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (xx || '') + '/>'; }
function G(id){ return 'url(#atg-' + id + ')'; }
function emo(x, y, s, ch, xx){ return '<text x="' + x + '" y="' + y + '" font-size="' + s + '" text-anchor="middle" dominant-baseline="central"' + (xx || '') + '>' + ch + '</text>'; }
function reflet(d, w){ return T(d, '#fff', w || 4, ' opacity=".38"'); }
function F(s){ return {f:0, s:s}; }   /* un calque du dessin (les objets ne se retournent plus : ils suivent la perspective) */
function N(s){ return {f:0, s:s}; }

/* Étiquettes-autocollants : ingrédients + quelques symboles pour le plaisir */
var ETQ_EXTRA = {'x-etoile':'⭐', 'x-coeur':'❤️', 'x-lune':'🌙', 'x-chat':'🐱', 'x-arc':'🌈', 'x-feu':'🔥', 'x-gemme':'💎', 'x-fleur':'🌸'};
var INGR = {};   /* rempli par la vue (opts.ingr) */
function icEtq(id){ return ETQ_EXTRA[id] || (INGR[id] && INGR[id].ic) || '❔'; }
function icIngr(id){ return (INGR[id] && INGR[id].ic) || '❔'; }
function coulIngr(id){ return (INGR[id] && INGR[id].c) || '#9aa3c8'; }

function pastille(x, y, r, ch){
  return '<g class="at-etq-o"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fffaf0" stroke="' + K + '" stroke-width="2.5"/>' + emo(x, y + r * 0.08, r * 1.2, ch) + '</g>';
}
function rangeeEtq(liste, cx, cy, r){
  var n = liste.length, s = '', pas = r * 2.15;
  liste.forEach(function(id, i){ s += pastille(cx + (i - (n - 1) / 2) * pas, cy, r, icEtq(id)); });
  return s;
}
/* Le hublot d'un tiroir, d'une caisse ou d'un sac : GROSSE icône de l'ingrédient principal, et le nombre.
   Vide : un rond pointillé (on voit que c'est un rangement). Lisible d'un coup d'œil sur un téléphone. */
function hublot(x, y, r, cs){
  var l = trier(cs), n = somme(cs.i);
  if(!l.length) return '<g class="at-hublot vide"><circle cx="' + x + '" cy="' + y + '" r="' + (r - 3) + '" fill="rgba(36,24,46,.16)" stroke="rgba(255,246,216,.45)" stroke-width="3" stroke-dasharray="6 5"/></g>';
  var b = r * 0.5;
  return '<g class="at-hublot"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + G('cuivre') + '" stroke="' + K + '" stroke-width="3.5"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + (r - 5) + '" fill="#fff6e0" stroke="' + K + '" stroke-width="1.5"/>' + emo(x, y + r * 0.06, r * 1.32, icIngr(l[0])) +
    (n > 1 ? '<circle cx="' + (x + r * 0.78) + '" cy="' + (y + r * 0.7) + '" r="' + b + '" fill="#24182e" stroke="#fff6d8" stroke-width="2.5"/>' +
      '<text x="' + (x + r * 0.78) + '" y="' + (y + r * 0.7) + '" font-size="' + (b * 1.25) + '" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + n + '</text>' : '') + '</g>';
}
/* Les ingrédients d'une case, du plus nombreux au moins nombreux */
function trier(cs){ return cles(cs.i).filter(function(k){ return cs.i[k] > 0; }).sort(function(a, b){ return cs.i[b] - cs.i[a]; }); }
function apercu(cs, cx, cy, s){
  var l = trier(cs).slice(0, 3), out = '';
  var pos = [[0, 0], [-s * 0.7, s * 0.18], [s * 0.7, s * 0.2]];
  for(var i = l.length - 1; i >= 0; i--) out += emo(cx + pos[i][0], cy + pos[i][1], s, icIngr(l[i]));
  return out;
}

/* ==========================================================
   Dessiner un objet dans la perspective de la pièce.
   ctxObjet(o, R) : le contexte de dessin (les outils 3D de ctx3d + la forme, le thème, le contenu des cases) ;
   dessinObjet(o, R) : {svg, bb (la boîte du dessin, en unités locales), bbD (sans la zone de toucher)}.
   ========================================================== */
function ajouterOutils3d(x){
  /* un corps de révolution (pot, vase, flacon) : prof = [[y, r], …] ; fh : le dessus (au plus haut des cercles), null = pas de dessus */
  x.tour = function(cx, cz, prof, f, fh, xx){
    var pts = [], haut = prof[0];
    prof.forEach(function(q){ pts = pts.concat(x.cercle(cx, cz, q[1], q[0], 28)); if(q[0] < haut[0]) haut = q; });
    return P(lisse(enveloppe(pts), true, 0.5), f, xx) + (fh === null || fh === undefined ? '' : P(lisse(x.cercle(cx, cz, haut[1], haut[0], 28), true), fh, xx));
  };
  /* un ovale debout (une table ovale, un tabouret) */
  x.ovale = function(cx, cz, rx, rz, yh, yb, f, fh, xx){
    function anneau(y){ var l = []; for(var i = 0; i < 32; i++){ var a = i / 32 * Math.PI * 2; l.push(x.Q(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz)); } return l; }
    var h = anneau(yh), b = anneau(yb);
    return P(lisse(enveloppe(h.concat(b)), true, 0.5), f, xx) + (fh === null ? '' : P(lisse(h, true), fh || f, xx));
  };
  /* un cylindre couché ou penché, de a à b (une bûche, un tuyau, une horloge ronde vue de face) ; fa, fb : ses deux bouts */
  x.tube = function(a, b, r, f, fa, fb, xx){
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]) || 1;
    d = [d[0] / L, d[1] / L, d[2] / L];
    var ref = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    var u = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]], lu = Math.hypot(u[0], u[1], u[2]);
    u = [u[0] / lu, u[1] / lu, u[2] / lu];
    var v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
    function anneau(c){ var l = []; for(var i = 0; i < 24; i++){ var t = i / 24 * Math.PI * 2, cs = Math.cos(t) * r, sn = Math.sin(t) * r; l.push(x.Q(c[0] + u[0] * cs + v[0] * sn, c[1] + u[1] * cs + v[1] * sn, c[2] + u[2] * cs + v[2] * sn)); } return l; }
    var A = anneau(a), B = anneau(b), s = P(lisse(enveloppe(A.concat(B)), true, 0.5), f, xx);
    if(fb && x.voit(d, b)) s += P(lisse(B, true), fb, xx);
    if(fa && x.voit([-d[0], -d[1], -d[2]], a)) s += P(lisse(A, true), fa, xx);
    return s;
  };
  /* un dessin posé sur un plan quelconque : le point (x, y) du dessin va en o3 + x·u + y·v (points 3D locaux) */
  x.surPlan = function(svg, o3, u, v, ax, ay){
    ax = ax || 0; ay = ay || 0;
    function M(px, py){ return x.Q(o3[0] + px * u[0] + py * v[0], o3[1] + px * u[1] + py * v[1], o3[2] + px * u[2] + py * v[2]); }
    var p0 = M(ax, ay), px = M(ax + 10, ay), py = M(ax, ay + 10);
    var a = (px[0] - p0[0]) / 10, b = (px[1] - p0[1]) / 10, cc = (py[0] - p0[0]) / 10, d = (py[1] - p0[1]) / 10;
    var e = p0[0] - (a * ax + cc * ay), ff = p0[1] - (b * ax + d * ay);
    return '<g transform="matrix(' + [a, b, cc, d, e, ff].map(function(t){ return t.toFixed(4); }).join(',') + ')">' + svg + '</g>';
  };
  /* un dessin couché sur un dessus horizontal (à la hauteur y) : le haut du dessin va vers le fond */
  x.dessus = function(svg, y, z0){ return x.surPlan(svg, [0, y, z0 === undefined ? x.p / 2 : z0], [1, 0, 0], [0, 0, -1], x.cat.w / 2, 0); };
  /* un polygone 3D dessiné seulement s'il est tourné vers l'œil (n : sa normale locale) */
  x.plan = function(pts, n, f, xx){
    var m = [0, 0, 0];
    pts.forEach(function(q){ m[0] += q[0] / pts.length; m[1] += q[1] / pts.length; m[2] += q[2] / pts.length; });
    return x.voit(n, m) ? x.poly(pts, f, xx) : '';
  };
  /* un rond sur un plan vertical (le cadran d'une horloge…) */
  x.rond = function(cx, cy, z, r, f, xx){
    var l = [];
    for(var i = 0; i < 28; i++){ var a = i / 28 * Math.PI * 2; l.push(x.Q(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z)); }
    return P(lisse(l, true), f, xx);
  };
  /* le devant d'un cercle horizontal (une rangée de briques sur une tour) */
  x.arcAvant = function(cx, cz, r, y, col, w){
    var l = [];
    for(var i = 0; i <= 16; i++){ var a = Math.PI + i / 16 * Math.PI; l.push(x.Q(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)); }
    return T(lisse(l, false), col, w);
  };
  /* une sphère (la boule de cristal) : son contour et son centre à l'écran */
  x.boule = function(cx, cy, cz, r, f, xx){
    var c0 = x.Q(cx, cy, cz), e = x.Q(cx + r, cy, cz), rr = Math.hypot(e[0] - c0[0], e[1] - c0[1]);
    return '<circle cx="' + f1(c0[0]) + '" cy="' + f1(c0[1]) + '" r="' + f1(rr) + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + SW + '"' + (xx || '') + '/>';
  };
  return x;
}
function ctxObjet(o, R){
  var c = catDe(o), st = o.st || 0, x = R ? ajouterOutils3d(ctx3d(R, false)) : {bb:[0, 0, c.w, c.h]};
  x.o = o; x.cat = c; x.v = o.v || 0; x.fo = st % nfDe(c); x.ti = st % NT; x.ic = icObjetBoutique(o.t); x.p = c.p || 40;
  x.X = function(v){ return v; };
  x.cs = (o.cases || []).map(function(k){ return {e:k.e || [], i:k.i || {}}; });
  while(c.cases && x.cs.length < c.cases.length) x.cs.push({e:[], i:{}});
  return x;
}
var TOUCHE_MIN = 92;      /* un petit objet : une zone invisible autour, pour qu'un doigt d'enfant le touche facilement (≥ 48 px) */
function dessinObjet(o, R, vignette){
  var c = catDe(o);
  if(c.plat || !R){
    var x0 = ctxObjet(o, null), s0 = c.d(x0).map(function(l){ return l.s; }).join('');
    var m = vignette ? 0 : Math.max(0, (80 - Math.min(c.w, c.h)) / 2);
    return {svg:(m ? '<rect x="' + (-m) + '" y="' + (-m) + '" width="' + (c.w + 2 * m) + '" height="' + (c.h + 2 * m) + '" fill="transparent"/>' : '') + repeindre(s0, x0.ti),
      bb:[-m, -m, c.w + m, c.h + m], bbD:[0, 0, c.w, c.h], plat:1};
  }
  var x = ctxObjet(o, R), s = c.d(x).map(function(l){ return l.s; }).join(''), p = x.p;
  /* la boîte 3D de l'objet : elle compte toujours dans son cadre, et sert de zone de toucher */
  var coins = [];
  [0, c.w].forEach(function(a){ [0, c.h].forEach(function(b){ [0, p].forEach(function(z){ coins.push(x.Q(a, b, z)); }); }); });
  var ombre = '';
  if(c.z !== 'mur' && c.z !== 'tapis' && !c.sansOmbre){
    var l = [], mx = c.w * 0.04 + 4, mz = p * 0.05 + 4, y = c.h;
    [[-mx, -mz], [c.w / 2, -mz * 1.6], [c.w + mx, -mz], [c.w + mx * 1.5, p / 2], [c.w + mx, p + mz], [c.w / 2, p + mz * 1.4], [-mx, p + mz], [-mx * 1.5, p / 2]].forEach(function(q){ l.push(x.Q(q[0], y, q[1])); });
    ombre = '<path class="at-ombre" d="' + lisse(l, true) + '" fill="rgba(12,6,20,.32)"/>';
  }
  var bbD = x.bb.slice(), hull = enveloppe(coins);
  var hit = '<path d="M' + hull.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z" fill="transparent"/>', bb = bbD.slice();
  if(!vignette){
    var bw = bb[2] - bb[0], bh = bb[3] - bb[1];
    var tm = c.touche || TOUCHE_MIN;
    if(bw < tm || bh < tm){
      var cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, ww = Math.max(bw, tm), hh = Math.max(bh, tm);
      hit += '<rect x="' + f1(cx - ww / 2) + '" y="' + f1(cy - hh / 2) + '" width="' + f1(ww) + '" height="' + f1(hh) + '" rx="' + f1(Math.min(ww, hh) / 3) + '" fill="transparent"/>';
      bb = [Math.min(bb[0], cx - ww / 2), Math.min(bb[1], cy - hh / 2), Math.max(bb[2], cx + ww / 2), Math.max(bb[3], cy + hh / 2)];
    }
  }
  return {svg:ombre + (vignette ? '' : hit) + repeindre(s, x.ti), bb:bb, bbD:bbD};
}
/* La petite image d'un objet (dans les panneaux, le carton du coin) : vue de face, un peu de côté, comme dans la pièce */
function repereVignette(c){
  if(c.z === 'mur') return repere([VPX - 170, 300, (c.p || 40) / S_REF], AXES_FACE, c.w, c.h);
  return repere([VPX - 170, 0, 470], AXES_FACE, c.w, c.h);
}
function svgObjet(o){
  var c = catDe(o), D = dessinObjet(o, c.plat ? null : repereVignette(c), true), b = D.bbD, m = 4;
  return '<svg viewBox="' + [b[0] - m, b[1] - m, b[2] - b[0] + 2 * m, b[3] - b[1] + 2 * m].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
}
/* ==========================================================
   Catalogue des objets de l'atelier — tous dessinés dans la perspective de la pièce (07-perspective.js).
   w, h : la boîte locale (l'ancre = le milieu du bas de la face avant, en (w/2, h)) ; p : la profondeur (vers le fond) ;
   z : 'sol' | 'mur' | 'petit' (par terre ou sur une surface) | 'tapis'
   cases : rangements [{cap, b:[x,y,w,h]}] ; surf : surfaces [{x0, x1, y, z}] (x par rapport au milieu, y par rapport au bas, z la profondeur)
   verre : pour les liquides ; nf : nombre de formes (le style o.st donne la forme et la couleur) ; deco : se décore au toucher
   special : 'chaudron' | 'grimoire' | 'analyses' (le toucher fait cette action) ; profil : se met de profil contre un mur de côté
   d(c) : renvoie une liste de calques N() ; c a les outils 3D (c.boite, c.cylindre, c.disque, c.poly, c.sur, c.surPlan, c.Q…),
   c.fo = la forme, c.ti = le thème (0 naturel), c.cs = le contenu des cases.
   ========================================================== */
var CAT = {};
function def(t, o){ o.t = t; CAT[t] = o; }
function BOIS(){ return {face:G('bois'), dessus:G('boisH'), cote:G('boisS')}; }
function BOISC(){ return {face:G('boisC'), dessus:G('boisH'), cote:G('boisS')}; }
function SOMBRE(){ return {face:G('boisS'), dessus:G('bois'), cote:G('boisS')}; }
function UNI(f, h, s){ return {face:f, dessus:h || f, cote:s || f}; }
/* quatre pieds (les deux de derrière d'abord) */
function pieds(c, xa, xb, y0, y1, za, zb, l, f){
  f = f || SOMBRE();
  return c.boite(xa, y0, xa + l, y1, zb - l, zb, f) + c.boite(xb - l, y0, xb, y1, zb - l, zb, f) + c.boite(xa, y0, xa + l, y1, za, za + l, f) + c.boite(xb - l, y0, xb, y1, za, za + l, f);
}
/* un bocal de verre (cylindre), son contenu qui monte, son couvercle de cuivre (on voit le dessus) et sa grosse icône */
function bocal3d(c, i, cx, cz, r, yh, yb, cs, cap, couv){
  var tot = somme(cs.i), l = trier(cs), s = '<g data-case="' + i + '">', n = '';
  s += c.cylindre(cx, cz, r, yh, yb, G('verre'), null, ' stroke-width="4"');
  if(tot > 0){
    var hh = (yb - yh - 6) * Math.min(1, tot / cap);
    s += c.cylindre(cx, cz, r - 4, yb - 3 - hh, yb - 3, coulIngr(l[0]), clair(coulIngr(l[0]), 0.35), ' stroke-width="0" opacity=".85"');
  }
  s += c.disque(cx, cz, r, yh, 'rgba(255,255,255,.18)', ' stroke-width="3"');
  s += c.cylindre(cx, cz, r * (couv || 0.9), yh - 16, yh + 2, G('cuivre'), G('cuivre'), ' stroke-width="3.5"');
  s += c.sur(T('M' + (cx - r * 0.62) + ',' + (yh + 12) + ' V' + (yb - 10), '#fff', 4, ' opacity=".5"'), cz - r);
  s += '</g>';
  var my = (yh + yb) / 2;
  if(tot > 0){
    n += '<circle cx="' + cx + '" cy="' + my + '" r="' + (r * 0.74) + '" fill="#fff6e0" stroke="' + K + '" stroke-width="2.5" opacity=".95"/>' + emo(cx, my + 1, r * 1.02, icIngr(l[0]));
    if(tot > 1) n += '<circle cx="' + (cx + r * 0.6) + '" cy="' + (my + r * 0.66) + '" r="' + (r * 0.4) + '" fill="#24182e" stroke="#fff6d8" stroke-width="2"/><text x="' + (cx + r * 0.6) + '" y="' + (my + r * 0.66) + '" font-size="' + (r * 0.52) + '" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + tot + '</text>';
  } else n += '<circle cx="' + cx + '" cy="' + my + '" r="' + (r * 0.58) + '" fill="none" stroke="rgba(36,24,46,.3)" stroke-width="3" stroke-dasharray="6 5"/>';
  if(cs.e.length) n += pastille(cx, yh + 6, 8, icEtq(cs.e[0]));
  return s + c.sur(n, cz - r);
}

/* ---------- Les rangements ---------- */
def('commode', {w:250, h:270, p:90, z:'sol', nom:'Commode', ic:'🗄️',
  cases:[{cap:6, b:[28, 44, 194, 62]}, {cap:6, b:[28, 114, 194, 62]}, {cap:6, b:[28, 184, 194, 62]}],
  surf:[{x0:-108, x1:108, y:-256, z:44}],
  d:function(c){
    var s = pieds(c, 30, 220, 248, 270, 6, 84, 20) + c.boite(14, 30, 236, 252, 0, 84, BOIS()) + c.boite(4, 14, 246, 36, -6, 90, UNI(G('boisH'), G('boisH'), G('boisS')));
    var tir = '', etq = '';
    for(var i = 0; i < 3; i++){
      var y = 44 + i * 70;
      tir += '<g data-case="' + i + '">' + R(28, y, 194, 62, 8, G('boisC')) + Cir(50, y + 31, 6.5, G('or')) + Cir(200, y + 31, 6.5, G('or')) + reflet('M38,' + (y + 8) + ' H212', 3) + '</g>';
      etq += hublot(125, y + 31, 28, c.cs[i]) + rangeeEtq(c.cs[i].e.slice(0, 1), 172, y + 31, 10);
    }
    return [N(s + c.sur(tir + reflet('M22,42 V240') + etq, 0))];
  }});

def('bocaux', {w:216, h:118, p:64, z:'petit', verre:true, nom:'Bocaux', ic:'🫙',
  cases:[{cap:4, b:[8, 10, 62, 94]}, {cap:4, b:[77, 10, 62, 94]}, {cap:4, b:[146, 10, 62, 94]}],
  d:function(c){
    var s = c.boite(4, 104, 212, 118, 0, 62, BOIS());
    for(var i = 0; i < 3; i++) s += bocal3d(c, i, 39 + i * 69, 31, 27, 30, 104, c.cs[i], 4);
    return [N(s)];
  }});

/* Le casier : un petit meuble à quatre tiroirs, sur pieds (posé par terre) */
def('casier', {w:190, h:218, p:80, z:'sol', nom:'Casier à tiroirs', ic:'🗃️', surf:[{x0:-80, x1:80, y:-214, z:40}],
  cases:[{cap:4, b:[14, 22, 78, 78]}, {cap:4, b:[98, 22, 78, 78]}, {cap:4, b:[14, 106, 78, 78]}, {cap:4, b:[98, 106, 78, 78]}],
  d:function(c){
    var s = pieds(c, 22, 168, 192, 218, 6, 72, 18) + c.boite(6, 12, 184, 194, 0, 76, SOMBRE()) + c.boite(2, 4, 188, 20, -4, 80, UNI(G('boisH'), G('boisH'), G('boisS'))), t = '', etq = '';
    c.cat.cases.forEach(function(k, i){
      var x = k.b[0], y = k.b[1];
      t += '<g data-case="' + i + '">' + R(x, y, 78, 78, 8, G('boisC')) + Cir(x + 39, y + 71, 4.5, G('or')) + reflet('M' + (x + 8) + ',' + (y + 8) + ' H' + (x + 70), 3) + '</g>';
      etq += hublot(x + 39, y + 36, 27, c.cs[i]);
    });
    return [N(s + c.sur(t + etq, 0))];
  }});

/* Les fioles d'ingrédients : quatre fioles sur une planchette, au mur */
def('fioles_ingr', {w:220, h:76, p:44, z:'mur', verre:true, nom:'Fioles d\'ingrédients', ic:'🧪',
  cases:[0, 1, 2, 3].map(function(i){ return {cap:3, b:[4 + i * 54, 2, 50, 62]}; }),
  d:function(c){
    var s = c.boite(18, 64, 32, 76, 6, 40, SOMBRE()) + c.boite(188, 64, 202, 76, 6, 40, SOMBRE()) + c.boite(2, 56, 218, 66, 0, 44, UNI(G('boisH'), G('boisH'), G('boisS'))), f = '', haut = '';
    for(var i = 0; i < 4; i++){
      var cx = 29 + i * 54, cs = c.cs[i], tot = somme(cs.i), l = trier(cs);
      f += '<g data-case="' + i + '">' +
        P('M' + (cx - 6) + ',10 L' + (cx + 6) + ',10 L' + (cx + 6) + ',20 C' + (cx + 24) + ',24 ' + (cx + 24) + ',56 ' + cx + ',58 C' + (cx - 24) + ',56 ' + (cx - 24) + ',24 ' + (cx - 6) + ',20 Z', G('verre'), ' stroke-width="3.5"');
      if(tot > 0){
        var hh = 26 * Math.min(1, tot / 3);
        f += '<path d="M' + (cx - 19) + ',' + (54 - hh) + ' H' + (cx + 19) + ' V48 C' + (cx + 15) + ',57 ' + (cx - 15) + ',57 ' + (cx - 19) + ',48 Z" fill="' + coulIngr(l[0]) + '" opacity=".9"/>';
        haut += emo(cx, 38, 26, icIngr(l[0]));
      }
      /* bouchon de cire violette : ce sont des fioles d'ingrédients, pas des potions */
      f += R(cx - 8, 2, 16, 10, 3, '#8b5bd6', ' stroke-width="3"') + Ell(cx, 2, 8, 3, '#b48bf0', ' stroke-width="2"') + T('M' + (cx - 13) + ',30 V46', '#fff', 3, ' opacity=".5"') + '</g>';
      if(cs.e.length) haut += pastille(cx + 16, 16, 7, icEtq(cs.e[0]));
    }
    return [N(s + c.sur(f + haut, 22))];
  }});

/* ---------- Les beaux rangements (au mur de préférence) ---------- */
/* Le placard mural : deux portes, une grosse icône dans le hublot de chacune */
def('placard', {w:190, h:184, p:56, z:'mur', nom:'Placard mural', ic:'🚪',
  cases:[{cap:6, b:[16, 30, 76, 132]}, {cap:6, b:[98, 30, 76, 132]}],
  d:function(c){
    var s = c.sur(T('M64,6 L95,-14 L126,6', K, 3) + Cir(95, -14, 4, '#cfc9e6'), c.p) +
      c.boite(8, 18, 182, 168, 0, 56, BOIS()) + c.boite(0, 4, 190, 22, -6, 56, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.boite(4, 164, 186, 178, -4, 56, UNI(G('boisH'), G('boisH'), G('boisS')));
    var p = '', etq = '';
    for(var i = 0; i < 2; i++){
      var x = 16 + i * 82;
      p += '<g data-case="' + i + '">' + R(x, 30, 76, 132, 8, G('boisC')) + R(x + 9, 42, 58, 108, 6, 'none', ' stroke-width="2.5" opacity=".45"') + reflet('M' + (x + 8) + ',38 V150', 3) + '</g>';
      etq += hublot(x + 38, 88, 27, c.cs[i]) + rangeeEtq(c.cs[i].e.slice(0, 1), x + 38, 138, 10);
    }
    return [N(s + c.sur(p + Cir(86, 100, 5, G('or')) + Cir(104, 100, 5, G('or')) + etq, 0))];
  }});

/* Le petit meuble d'apothicaire : six tiroirs à étiquette de laiton, accroché au mur */
def('apothicaire', {w:210, h:204, p:60, z:'mur', nom:'Meuble d\'apothicaire', ic:'🗄️',
  cases:[0, 1, 2, 3, 4, 5].map(function(i){ return {cap:3, b:[14 + (i % 2) * 94, 26 + Math.floor(i / 2) * 58, 88, 52]}; }),
  d:function(c){
    var s = c.boite(14, 196, 36, 204, 6, 50, SOMBRE()) + c.boite(174, 196, 196, 204, 6, 50, SOMBRE()) + c.boite(4, 14, 206, 198, 0, 60, BOIS()) + c.boite(0, 2, 210, 18, -6, 60, UNI(G('boisH'), G('boisH'), G('boisS'))), t = '', etq = '';
    c.cat.cases.forEach(function(k, i){
      var x = k.b[0], y = k.b[1];
      t += '<g data-case="' + i + '">' + R(x, y, 88, 52, 6, G('boisC')) + R(x + 48, y + 8, 32, 12, 2, G('or'), ' stroke-width="2.5"') + Cir(x + 64, y + 36, 4.5, G('or')) + reflet('M' + (x + 6) + ',' + (y + 6) + ' H' + (x + 40), 2.5) + '</g>';
      etq += hublot(x + 24, y + 27, 19, c.cs[i]) + (c.cs[i].e.length ? pastille(x + 64, y + 14, 7, icEtq(c.cs[i].e[0])) : '');
    });
    return [N(s + c.sur(t + etq, 0))];
  }});

/* Le contenu d'un rangement en verre : la couleur de l'ingrédient qui monte, une grosse icône, le nombre */
function contenuVerre(c, cs, cx, bas, haut, cap, r){
  var tot = somme(cs.i), l = trier(cs), s = '', n = '';
  if(tot > 0){
    var hh = (bas - haut) * Math.min(1, tot / cap);
    s += '<rect x="' + (cx - r * 0.8) + '" y="' + (bas - hh) + '" width="' + (r * 1.6) + '" height="' + hh + '" rx="' + (r * 0.35) + '" fill="' + coulIngr(l[0]) + '" opacity=".85"/>';
    var cy = (bas + haut) / 2;
    n += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.78) + '" fill="#fff6e0" stroke="' + K + '" stroke-width="2.5" opacity=".95"/>' + emo(cx, cy + 1, r * 1.08, icIngr(l[0]));
    if(tot > 1) n += '<circle cx="' + (cx + r * 0.62) + '" cy="' + (cy + r * 0.66) + '" r="' + (r * 0.4) + '" fill="#24182e" stroke="#fff6d8" stroke-width="2"/><text x="' + (cx + r * 0.62) + '" y="' + (cy + r * 0.66) + '" font-size="' + (r * 0.52) + '" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + tot + '</text>';
  } else n += '<circle cx="' + cx + '" cy="' + (bas + haut) / 2 + '" r="' + (r * 0.62) + '" fill="none" stroke="rgba(36,24,46,.3)" stroke-width="3" stroke-dasharray="6 5"/>';
  if(cs.e.length) n += pastille(cx, haut - 4, 8, icEtq(cs.e[0]));
  return {s:s, n:n};
}

/* La vitrine : trois étagères derrière une porte vitrée (pour les liquides), posée par terre */
def('vitrine', {w:184, h:272, p:80, z:'sol', verre:true, nom:'Vitrine', ic:'🪟', surf:[{x0:-76, x1:76, y:-268, z:40}],
  cases:[{cap:4, b:[18, 34, 148, 68]}, {cap:4, b:[18, 106, 148, 68]}, {cap:4, b:[18, 178, 148, 62]}],
  d:function(c){
    var s = pieds(c, 18, 166, 254, 272, 6, 70, 16) + c.boite(6, 20, 178, 256, 0, 76, BOIS()) + c.boite(0, 4, 184, 24, -6, 80, UNI(G('boisH'), G('boisH'), G('boisS')));
    var dedans = R(18, 34, 148, 208, 6, '#2e1c10', ' stroke-width="3"'), n = '';
    [102, 174, 240].forEach(function(y){ dedans += R(16, y, 152, 8, 3, G('boisH'), ' stroke-width="3"'); });
    c.cat.cases.forEach(function(k, i){
      var b = k.b, v = contenuVerre(c, c.cs[i], 92, b[1] + b[3] - 2, b[1] + 8, 4, 30);
      dedans += '<g data-case="' + i + '"><rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" fill="transparent"/>' + v.s +
        P('M40,' + (b[1] + b[3] - 2) + ' C34,' + (b[1] + b[3] - 30) + ' 46,' + (b[1] + 22) + ' 46,' + (b[1] + 16) + ' L54,' + (b[1] + 16) + ' C54,' + (b[1] + 22) + ' 66,' + (b[1] + b[3] - 30) + ' 60,' + (b[1] + b[3] - 2) + ' Z', G('verre'), ' stroke-width="3"') +
        P('M124,' + (b[1] + b[3] - 2) + ' C118,' + (b[1] + b[3] - 24) + ' 130,' + (b[1] + 28) + ' 130,' + (b[1] + 22) + ' L138,' + (b[1] + 22) + ' C138,' + (b[1] + 28) + ' 150,' + (b[1] + b[3] - 24) + ' 144,' + (b[1] + b[3] - 2) + ' Z', G('verre'), ' stroke-width="3"') + '</g>';
      n += v.n;
    });
    return [N(s + c.sur(dedans + n + '<g pointer-events="none">' + R(14, 30, 156, 216, 8, G('verre'), ' stroke-width="4"') + T('M92,32 V244', K, 3) + reflet('M24,40 L24,236', 4) + '</g>' + Cir(100, 140, 5, G('or')), 0))];
  }});

/* L'étagère à épices : quatre petits pots de verre sur une planchette murale */
def('epices', {w:214, h:124, p:44, z:'mur', verre:true, nom:'Étagère à épices', ic:'🧂',
  cases:[0, 1, 2, 3].map(function(i){ return {cap:3, b:[14 + i * 49, 30, 40, 70]}; }),
  d:function(c){
    var s = c.sur(R(6, 6, 202, 96, 10, G('boisS')), c.p - 4) + c.boite(18, 112, 32, 124, 6, 40, SOMBRE()) + c.boite(182, 112, 196, 124, 6, 40, SOMBRE()) +
      c.boite(0, 98, 214, 112, 0, 44, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.boite(2, 2, 212, 14, 0, 44, UNI(G('boisH'), G('boisH'), G('boisS')));
    for(var i = 0; i < 4; i++) s += bocal3d(c, i, 33 + i * 49, 22, 18, 44, 98, c.cs[i], 3, 0.92);
    s += c.boite(8, 64, 206, 68, 2, 6, UNI('#c58a4a'));
    return [N(s)];
  }});

/* Les bocaux suspendus : une planche accrochée par deux cordes, trois gros bocaux dessus */
def('suspendus', {w:204, h:180, p:64, z:'mur', verre:true, nom:'Bocaux suspendus', ic:'🫙',
  cases:[0, 1, 2].map(function(i){ return {cap:4, b:[13 + i * 62, 60, 54, 80]}; }),
  d:function(c){
    var s = c.ligne([[14, 140, 60], [102, 10, 64], [190, 140, 60]], '#6b4a2a', 3) + c.sur(Cir(102, 8, 6, '#cfc9e6'), c.p) +
      c.boite(4, 138, 200, 154, 0, 62, BOIS()) + c.ligne([[14, 140, 4], [102, 10, 64], [190, 140, 4]], '#8a6a3a', 3.5);
    for(var i = 0; i < 3; i++) s += bocal3d(c, i, 40 + i * 62, 32, 26, 66, 138, c.cs[i], 4);
    return [N(s)];
  }});

/* ==========================================================
   Les meubles spéciaux (un de chaque, toujours là, on peut les déplacer partout) :
   le grand chaudron, le lutrin du grimoire, la paillasse d'analyse
   ========================================================== */
var DESSIN = {analyses:[], pret:false, cuivre:false};   /* ce que la vue sait (objets reçus, potion possible), pour dessiner */
/* Trois formes de chaudron (10 novembre, 17 h 18 : il a ses bulles « Forme » et « Couleur », comme la paillasse) : le chaudron rond de toujours,
   la marmite droite cerclée de fer, la bassine large et basse. Le bord, le liquide, les anses et les pieds ne changent pas de place
   (tout ce qui s'y accroche reste juste) : seule la panse change. */
var PANSES = [
  [[94, 110], [112, 116], [140, 112], [168, 96], [188, 70], [198, 40]],
  [[94, 110], [104, 115], [150, 115], [184, 110], [198, 96], [204, 62]],
  [[94, 110], [106, 124], [126, 130], [148, 122], [168, 100], [180, 62]]
];
def('chaudron', {w:260, h:214, p:230, z:'sol', special:'chaudron', cls:'at-chp', nf:3, nom:'Grand chaudron', ic:'🍲', surf:null, fixe:1, sansOmbre:1,   /* (fixe : scellé dans le foyer de la cheminée, FOYER) */
  d:function(c){
    var cuivre = DESSIN.cuivre, cz = 116, fo = c.fo || 0, s = '<g class="at-ch-p" data-at="chaudron">';
    var cercleFer = function(y, r){          /* un cercle de fer : seulement sa moitié de devant */
      var l = [], a;
      for(a = 0; a <= 12; a++) l.push([130 - r * Math.cos(Math.PI * a / 12), y, cz - r * Math.sin(Math.PI * a / 12)]);
      return c.ligne(l, K, 8) + c.ligne(l, cuivre ? '#e0a070' : '#8a80aa', 3);
    };
    /* le feu dessous, les trois pieds */
    s += c.tube([70, 204, cz + 26], [190, 204, cz - 26], 8, G('boisS'), null, G('boisH')) + c.tube([70, 204, cz - 26], [190, 204, cz + 26], 8, G('bois'), G('boisH'), G('boisH'));
    s += c.sur('<g class="at-feu-p">' + flammesSVG(130, 204, 0) + '</g>', cz);
    s += c.ligne([[90, 170, cz + 80], [80, 212, cz + 96]], K, 10) + c.ligne([[170, 170, cz + 80], [180, 212, cz + 96]], K, 10);
    var corps = [];
    (PANSES[fo] || PANSES[0]).forEach(function(q){ corps = corps.concat(c.cercle(130, cz, q[1], q[0], 32)); });
    s += P(lisse(enveloppe(corps), true, 0.5), G(cuivre ? 'cuivre' : 'metal')) + c.sur(reflet(fo === 2 ? 'M36,118 C40,140 58,158 84,168' : 'M46,112 C48,140 66,166 90,178', 6), 8);
    if(fo === 1) s += cercleFer(126, 116) + cercleFer(176, 113);
    if(fo === 2) s += cercleFer(112, 128);
    /* (23 novembre) dans le foyer : de petites flammes devant, entre les pieds — on voit que ça chauffe */
    s += c.sur('<g class="at-feu-foyer">' + flammesSVG(130, 213, 0) + '</g>', cz - 56);
    s += c.ligne([[60, 170, cz - 80], [42, 212, cz - 96]], K, 10) + c.ligne([[60, 170, cz - 80], [42, 212, cz - 96]], '#5a5078', 4) +
      c.ligne([[200, 170, cz - 80], [218, 212, cz - 96]], K, 10) + c.ligne([[200, 170, cz - 80], [218, 212, cz - 96]], '#5a5078', 4);
    /* les anses */
    s += c.ligne([[22, 100, cz], [6, 112, cz], [10, 128, cz], [24, 126, cz]], K, 7) + c.ligne([[238, 100, cz], [254, 112, cz], [250, 128, cz], [236, 126, cz]], K, 7);
    /* le bord, l'intérieur, le liquide qui bouillonne */
    s += c.disque(130, cz, 112, 94, cuivre ? '#c98450' : '#5f5582') + c.disque(130, cz, 100, 95, cuivre ? '#a5582a' : '#3a3352');
    s += '<path class="at-liq-p" d="' + lisse(c.cercle(130, cz, 92, 98, 32), true) + '"/>';
    for(var i = 0; i < 5; i++){ var b = c.Q(84 + i * 24, 98, cz - 30 + (i % 2) * 40); s += '<circle class="at-blp" style="animation-delay:' + (i * 0.37).toFixed(2) + 's" cx="' + f1(b[0]) + '" cy="' + f1(b[1]) + '" r="5" fill="rgba(255,255,255,.55)"/>'; }
    s += c.sur('<g class="at-vapeur"><path d="M96,70 C86,52 104,42 94,24"/><path d="M134,64 C124,44 144,34 132,12"/><path d="M168,70 C158,52 176,42 166,26"/></g>', cz);
    return [N(s + '</g>')];
  }});

/* Le lutrin : un grand grimoire ouvert sur un pupitre en pente, qui brille doucement (on voit qu'on peut le toucher) */
def('lutrin', {w:170, h:226, p:80, z:'sol', special:'grimoire', nf:3, nom:'Lutrin du grimoire', ic:'📖', surf:[{x0:-30, x1:30, y:-152, z:50}],
  d:function(c){
    var f = c.fo, cuir = c.ti ? sombre(THEMES[c.ti].c, 0.15) : '#7a2a3a', cz = 40, s = '<g class="at-grimoire-p" data-at="grimoire">';
    s += c.sur('<ellipse class="at-halo at-lu-halo" cx="85" cy="70" rx="100" ry="62" fill="' + G('haloC') + '"/>', cz);
    if(f === 0){        /* pied de bois tourné */
      s += c.boite(40, 206, 130, 224, 12, 68, BOIS()) + c.cylindre(85, cz, 9, 104, 206, G('boisS'), null) + c.cylindre(85, cz, 16, 146, 154, G('boisH'), G('boisH')) + c.cylindre(85, cz, 14, 110, 116, G('boisH'), G('boisH'));
    } else if(f === 1){ /* pied sculpté, dorures */
      s += c.cylindre(85, cz, 40, 212, 224, G('bois'), G('boisH')) + c.cylindre(85, cz, 12, 104, 212, G('bois'), null, '', 18) + c.sur(T('M78,128 C84,136 86,150 80,166 M92,128 C86,136 84,150 90,166', '#f5b945', 3), cz - 14) + c.disque(85, cz, 10, 212, G('or'));
    } else {            /* trépied de fer */
      s += c.ligne([[85, 106, cz], [40, 224, cz + 30]], K, 9) + c.ligne([[85, 106, cz], [130, 224, cz + 30]], K, 9) + c.ligne([[85, 106, cz], [85, 224, cz - 34]], K, 9) +
        c.ligne([[85, 106, cz], [40, 224, cz + 30]], '#6a6290', 4) + c.ligne([[85, 106, cz], [130, 224, cz + 30]], '#6a6290', 4) + c.ligne([[85, 106, cz], [85, 224, cz - 34]], '#6a6290', 4);
    }
    /* le pupitre, en pente vers nous : son bord avant est bas, son bord arrière plus haut */
    var plateau = f === 2 ? G('metal') : G('boisH');
    s += c.poly([[10, 112, 2], [160, 112, 2], [160, 70, 64], [10, 70, 64]], plateau) + c.boite(8, 106, 162, 116, -2, 8, f === 2 ? UNI(G('metal')) : BOIS());
    /* le grimoire ouvert, posé sur la pente */
    var livre = P('M16,4 L154,4 L154,92 L16,92 Z', cuir) +
      P('M24,10 L84,14 L84,88 L26,84 Z', '#f6ecd2') + P('M86,14 L146,10 L144,84 L86,88 Z', '#f6ecd2') +
      T('M36,26 L76,28 M36,38 L76,40 M36,50 L76,52 M36,62 L70,64 M96,28 L134,24 M96,40 L136,36 M96,52 L136,48 M96,64 L128,60', '#a08a6a', 2.5) +
      T('M86,88 L92,112', '#c0392b', 4) + reflet('M30,16 L78,20', 3);
    s += c.surPlan(livre, [0, 108 - 92 * 0.449, 7 + 92 * 0.662], [1, 0, 0], [0, 0.449, -0.662], 85, 48);
    s += c.sur('<g class="at-runes at-lu-runes"><text x="54" y="22" font-size="20" fill="#8ff3ff" text-anchor="middle">✦</text><text x="86" y="6" font-size="16" fill="#bff9ff" text-anchor="middle">ᚱ</text><text x="120" y="20" font-size="19" fill="#8ff3ff" text-anchor="middle">✧</text></g>' +
      '<g class="at-lu-scint"><text x="16" y="52" font-size="14" fill="#fff3a8" text-anchor="middle">✨</text><text x="156" y="44" font-size="12" fill="#fff3a8" text-anchor="middle">✨</text></g>', cz);
    return [N(s + '</g>')];
  }});

/* La paillasse d'analyse (refaite le 10 novembre, d'après la maquette du labo, Bible §12.51) : cinq formes de table, et sur chacune
   TOUJOURS deux tiroirs en haut (fils, poils, plumes à gauche ; pétales, feuilles, grains à droite) et les mêmes outils aux mêmes places :
   au fond, la bougie, la petite étagère surélevée des cinq bocaux, le microscope ; devant, le bocal à bandelettes,
   le carnet de teintures, la loupe, le carré de cuir (les objets reçus sont posés dessus : ceux qui attendent brillent), les cinq coupelles.
   Le bout gauche du plateau reste libre (surf) : on peut y poser quelque chose. Les outils gardent leurs couleurs ; la table prend le thème
   (le marbre aussi : marbre rose, vert… ; son or reste or). On la touche : trois bulles (y aller, changer la forme, changer la couleur). */
def('paillasse', {w:480, h:212, p:130, z:'sol', special:'analyses', profil:true, nf:5, nom:'Paillasse d\'analyse', ic:'🔬', surf:[{x0:-226, x1:-150, y:-122, z:64}],
  d:function(c){
    var f = c.fo, s = '<g class="at-pupitre-p" data-at="analyses">', P2 = c.p, mc = c.ti ? THEMES[c.ti].c : null, Y = 90, k;
    var B2 = ' stroke-width="2"', B25 = ' stroke-width="2.5"', B3 = ' stroke-width="3"', B35 = ' stroke-width="3.5"';
    var OR = UNI('#f5b945', '#ffe08a', '#b8862e');
    var MARBRE = UNI(mc ? melange('#efeaf6', mc, 0.42) : '#efeaf6', mc ? melange('#fbf9fd', mc, 0.3) : '#f7f4fb', mc ? melange('#d9d3ea', mc, 0.52) : '#d6d0e8'), veine = mc ? sombre(mc, 0.18) : '#c9c2dc';
    /* --- le bas du meuble : ce qui change d'une forme à l'autre --- */
    if(f === 0){        /* établi de bois : quatre pieds et une tablette basse */
      s += pieds(c, 24, 456, 146, 212, 8, P2 - 8, 20) + c.boite(30, 186, 450, 196, 16, P2 - 16, UNI(G('boisH')));
    } else if(f === 1){ /* comptoir de pierre sur un meuble à deux portes */
      s += c.boite(20, 146, 460, 210, 6, P2 - 6, BOIS()) + c.sur(R(34, 152, 198, 52, 5, G('boisC'), B35) + R(248, 152, 198, 52, 5, G('boisC'), B35) + Cir(222, 178, 5, '#f5b945') + Cir(258, 178, 5, '#f5b945'), 6);
    } else if(f === 2){ /* marbre et pieds dorés */
      [10, P2 - 12].forEach(function(z){ [40, 160, 320, 440].forEach(function(x, j){ var l = [[x, 146, z], [x + (j < 2 ? -6 : 6), 180, z], [x, 210, z]]; s += c.ligne(l, K, 11) + c.ligne(l, '#f5b945', 5); }); });
    } else if(f === 3){ /* meuble à petits tiroirs (sous les deux grands) */
      var t3 = '';
      for(k = 0; k < 8; k++){ var x3 = 24 + (k % 4) * 109, y3 = 151 + Math.floor(k / 4) * 29; t3 += R(x3, y3, 103, 25, 4, G('boisC'), B3) + Cir(x3 + 51.5, y3 + 12.5, 3.5, '#f5b945'); }
      s += c.boite(14, 146, 466, 210, 6, P2 - 6, BOIS()) + c.sur(t3, 6);
    } else {            /* tréteaux */
      [12, P2 - 12].forEach(function(z){ [[40, 112], [112, 40], [368, 440], [440, 368]].forEach(function(q){ var l = [[q[0], 146, z], [q[1], 210, z]]; s += c.ligne(l, K, 12) + c.ligne(l, '#b06f3e', 6); }); });
      s += c.boite(76, 176, 404, 184, P2 / 2 - 4, P2 / 2 + 4, UNI('#d29a5e'));
    }
    /* --- la ceinture : toujours deux tiroirs en haut, chacun avec sa plaque (trois petits dessins) et sa poignée --- */
    var tir = '';
    [0, 1].forEach(function(n){
      var x = 22 + n * 222, pg = 'M' + (x + 92) + ',134 q15,8 30,0';
      tir += R(x, 113, 214, 29, 4, f === 2 ? MARBRE.face : G('boisC'), B35) + R(x + 72, 116, 70, 12, 2, '#fff6d8', B2) +
        [0, 1, 2].map(function(j){ return '<circle cx="' + (x + 86 + j * 21) + '" cy="122" r="3.2" fill="' + [['#b9a67c', '#6b4a2a', '#4a6aa8'], ['#e8343c', '#6fae5a', '#8a84a0']][n][j] + '"/>'; }).join('') +
        T(pg, K, 6) + T(pg, '#f5b945', 3);
    });
    s += c.boite(12, 108, 468, 146, 3, P2 - 3, f === 2 ? OR : BOIS()) + c.sur(tir, 3);
    /* --- le plateau --- */
    if(f === 1) s += c.boite(2, Y, 478, 109, -3, P2 + 1, UNI(G('pierre'))) + c.sur(reflet('M14,97 H466', 3), -3);
    else if(f === 2) s += c.boite(4, Y, 476, 108, 0, P2, MARBRE) + c.sur(T('M60,96 C120,103 160,92 230,99 M300,94 C350,101 400,94 450,99', veine, 2.5), 0) +
      c.dessus(T('M30,-34 C120,-56 200,-22 300,-48 S420,-30 462,-66 M80,-100 C170,-82 240,-108 330,-90', veine, 2.5, ' opacity=".7"'), Y, 0);
    else s += c.boite(4, Y, 476, 109, 0, P2, f === 4 ? BOIS() : UNI(G('boisH'), G('boisH'), G('boisS')));
    /* --- au fond du plateau, de gauche à droite : le bocal à bandelettes, la bougie, l'étagère des cinq bocaux, le microscope --- */
    var bt = 'M91,' + (Y - 42) + ' h26';
    var fond = R(94, Y - 41, 20, 40, 6, 'rgba(220,245,255,.35)', B25) + '<rect x="96" y="' + (Y - 13) + '" width="16" height="10" rx="3" fill="#cfeaf6" opacity=".8"/>' +
      '<rect x="101.5" y="' + (Y - 41) + '" width="5" height="31" fill="#fffaf0" stroke="' + K + '" stroke-width=".8"/><rect x="102" y="' + (Y - 29) + '" width="4" height="3" fill="#e2553a"/><rect x="102" y="' + (Y - 22) + '" width="4" height="3" fill="#8a3a9a"/>' +
      T(bt, K, 5) + T(bt, '#c98450', 2.5);
    fond += Ell(127, Y - 2, 9, 3.2, '#e0a23a', B25) + R(122.5, Y - 28, 9, 25, 2, '#fffaf0', ' stroke-width="1.8"') +
      '<path d="M127,' + (Y - 29) + ' c-5,-6 -3,-12 0,-17 c3,5 5,11 0,17 Z" fill="#ffc24a" stroke="#e8693c" stroke-width="1.5"/>';
    /* (Romain, 13 novembre, 18 h 48 : plus d'ardoise sur la paillasse d'analyse — le code est donné au retour du labo) */
    fond += R(197, Y - 22, 5, 21, 1, '#94603a', B2) + R(266.5, Y - 22, 5, 21, 1, '#94603a', B2) + R(336, Y - 22, 5, 21, 1, '#94603a', B2) + R(192, Y - 28, 154, 7, 2, '#c98450', B3);
    [['#a9dcff', 0.6], ['#a9dcff', 0.6], ['#9a4f12', 0.9], ['#efe1a0', 0.85], ['#f6f4ee', 1]].forEach(function(b, i){
      var x = 207 + i * 31, y = Y - 28;
      fond += '<rect x="' + (x - 8) + '" y="' + (y - 15) + '" width="16" height="14" rx="3" fill="' + b[0] + '" opacity="' + b[1] + '"/>' +
        R(x - 10, y - 26, 20, 26, 5, 'rgba(220,245,255,.35)', B25) + R(x - 6, y - 32, 12, 7, 2, '#e8b47e', B2) +
        '<rect x="' + (x - 7) + '" y="' + (y - 17) + '" width="14" height="8" rx="1" fill="#fff6d8" stroke="' + K + '" stroke-width="1"/>' +
        (i === 1 ? T('M' + (x - 2) + ',' + (y - 35) + ' q-3,-4 0,-8 q3,-4 0,-8', '#dff6ff', 2, ' opacity=".7"') : '');
    });
    var arc = 'M427,' + (Y - 38) + ' C406,' + (Y - 48) + ' 408,' + (Y - 76) + ' 432,' + (Y - 76);
    fond += Ell(436, Y - 3, 22, 6, '#3a3450', B3) + R(424, Y - 40, 6, 37, 2, '#e0a23a', B25) + R(417, Y - 30, 32, 5, 1, '#3a3450', B2) + T(arc, K, 9) + T(arc, '#e0a23a', 4.5) +
      '<g transform="rotate(16 432 ' + (Y - 58) + ')">' + R(427, Y - 82, 11, 46, 3, '#f5c45a', B25) + R(428, Y - 91, 9, 10, 2, '#3a3450', B2) + '</g>' +
      Cir(407, Y - 60, 9, '#f7cd6a', B25) + '<circle cx="407" cy="' + (Y - 60) + '" r="2.6" fill="#3a3450"/>';
    s += c.sur(fond, 110);
    /* --- à plat sur le plateau : le carnet de teintures, le carré de cuir --- */
    s += c.dessus(R(152, -62, 40, 28, 2, '#7a3a4a', B3) + '<rect x="155" y="-60" width="16" height="24" fill="#f6ecd2"/><rect x="173" y="-60" width="16" height="24" fill="#f6ecd2"/>' + T('M172,-62 V-34', K, 2) +
      R(200, -92, 136, 78, 3, '#cda77a', B35) + '<rect x="206" y="-86" width="124" height="66" rx="2" fill="none" stroke="#5a3418" stroke-width="2" stroke-dasharray="6 5"/>', Y, 0);
    /* --- les coupelles du fond, puis les objets reçus (au plus 3), posés sur le cuir : ceux qui attendent brillent --- */
    var coupe = function(x){ return '<path d="M' + (x - 12) + ',' + (Y - 6) + ' Q' + x + ',' + (Y + 5) + ' ' + (x + 12) + ',' + (Y - 6) + ' Z" fill="rgba(226,246,255,.75)" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<ellipse cx="' + x + '" cy="' + (Y - 6) + '" rx="12" ry="3.4" fill="#f4fbff" stroke="' + K + '" stroke-width="1.8"/><ellipse cx="' + x + '" cy="' + (Y - 5.6) + '" rx="8" ry="1.9" fill="rgba(160,205,230,.7)"/>'; };
    s += c.sur(coupe(358) + coupe(391) + coupe(424), 68);
    var recus = '';
    (DESSIN.analyses || []).slice(0, 3).forEach(function(o, n){
      var x = 232 + n * 36;
      recus += (o.fait ? '' : '<circle class="at-halo at-a-analyser" cx="' + x + '" cy="' + (Y - 20) + '" r="23" fill="' + G('halo') + '"/>') + emo(x, Y - 19, 27, o.ic || '❔') + (o.fait ? emo(x + 13, Y - 32, 13, '✅') : '');
    });
    s += c.sur(recus, 50);
    /* --- devant : deux coupelles, et la loupe couchée --- */
    var manche = 'M122,' + (Y - 3) + ' L144,' + (Y - 1);
    s += c.sur(coupe(374) + coupe(408) + T(manche, K, 7) + T(manche, '#b06f3e', 3.5) + Ell(110, Y - 4, 14, 5.5, '#f5c45a', B25) + '<ellipse cx="110" cy="' + (Y - 4.5) + '" rx="9.5" ry="3.2" fill="rgba(205,240,255,.8)" stroke="' + K + '" stroke-width="1.2"/>', 26);
    return [N(s + '</g>')];
  }});

/* L'établi des plantes (enquête 3, E3-atelier-des-plantes.md §2) : là où l'Alchimiste prépare les potions de la brume avec de vraies
   plantes (plantes.js ; sa page vue de près : src/etabli/). Refait le 12 novembre (Romain : « comme pour la paillasse, je veux qu'il y ait
   plusieurs modèles et plusieurs couleurs ») : cinq formes de table, les mêmes que la paillasse (établi de bois, comptoir de pierre sur un
   buffet, marbre et or, meuble à tiroirs, tréteaux), et sur chacune TOUJOURS les mêmes outils aux mêmes places, comme sur sa page :
   au fond, les bûches, l'alambic de cuivre et son seau, la marmite sur son trépied, le grimoire sur son lutrin, le pressoir, le séchoir ;
   devant, le mortier, la planche et son couteau, le linge et ses plantes, la cruche, le bocal à filtrer. La table prend le thème (le marbre
   aussi ; son or reste or). On le touche : ses bulles (« 🌿 Préparer », Forme, 🎨 Couleur).
   Il n'est dans la pièce que pendant une enquête qui s'en sert (opts.etabli : Atelier.vue le pose et le range tout seul). */
def('etabli', {w:380, h:212, p:110, z:'sol', special:'plantes', profil:true, nf:5, nom:'Établi des plantes', ic:'🌿', surf:null,
  d:function(c){
    var f = c.fo, P2 = c.p, Y = 108, s = '<g class="at-etabli-p" data-at="plantes">', mc = c.ti ? THEMES[c.ti].c : null, k;
    var B2 = ' stroke-width="2"', B25 = ' stroke-width="2.5"', B3 = ' stroke-width="3"';
    var OR = UNI('#f5b945', '#ffe08a', '#b8862e');
    var MARBRE = UNI(mc ? melange('#efeaf6', mc, 0.42) : '#efeaf6', mc ? melange('#fbf9fd', mc, 0.3) : '#f7f4fb', mc ? melange('#d9d3ea', mc, 0.52) : '#d6d0e8'), veine = mc ? sombre(mc, 0.18) : '#c9c2dc';
    /* --- le bas du meuble : ce qui change d'une forme à l'autre --- */
    if(f === 0){        /* établi de bois : quatre pieds et une tablette basse */
      s += pieds(c, 20, 360, 146, 212, 8, P2 - 8, 18) + c.boite(26, 186, 354, 196, 14, P2 - 14, UNI(G('boisH')));
    } else if(f === 1){ /* comptoir de pierre sur un buffet à deux portes */
      s += c.boite(16, 146, 364, 210, 6, P2 - 6, BOIS()) + c.sur(R(28, 152, 156, 52, 5, G('boisC'), B3) + R(196, 152, 156, 52, 5, G('boisC'), B3) + Cir(176, 178, 5, '#f5b945') + Cir(204, 178, 5, '#f5b945'), 6);
    } else if(f === 2){ /* marbre et pieds dorés */
      [10, P2 - 12].forEach(function(z){ [32, 128, 252, 348].forEach(function(x, j){ var l = [[x, 146, z], [x + (j < 2 ? -6 : 6), 180, z], [x, 210, z]]; s += c.ligne(l, K, 11) + c.ligne(l, '#f5b945', 5); }); });
    } else if(f === 3){ /* meuble à petits tiroirs */
      var t3 = '';
      for(k = 0; k < 8; k++){ var x3 = 20 + (k % 4) * 86, y3 = 151 + Math.floor(k / 4) * 29; t3 += R(x3, y3, 80, 25, 4, G('boisC'), B3) + Cir(x3 + 40, y3 + 12.5, 3.5, '#f5b945'); }
      s += c.boite(12, 146, 368, 210, 6, P2 - 6, BOIS()) + c.sur(t3, 6);
    } else {            /* tréteaux */
      [12, P2 - 12].forEach(function(z){ [[32, 90], [90, 32], [290, 348], [348, 290]].forEach(function(q){ var l = [[q[0], 146, z], [q[1], 210, z]]; s += c.ligne(l, K, 12) + c.ligne(l, '#b06f3e', 6); }); });
      s += c.boite(60, 176, 320, 184, P2 / 2 - 4, P2 / 2 + 4, UNI('#d29a5e'));
    }
    /* --- la ceinture : une tringle de laiton, où pendent les ciseaux, la cuillère de bois et un bouquet de lavande --- */
    var tr = 'M24,135 H356';
    s += c.boite(10, 122, 370, 146, 3, P2 - 3, f === 2 ? OR : BOIS()) +
      c.sur(T(tr, K, 5) + T(tr, f === 2 ? '#fff1b8' : '#e0a23a', 2.4) + T('M92,136 v7 M190,136 v8 M288,136 v7', K, 3.4) + '<circle cx="92" cy="145" r="2.6" fill="#5f5872"/><ellipse cx="190" cy="146" rx="2.6" ry="3.4" fill="#c98450" stroke="' + K + '" stroke-width="1"/><ellipse cx="288" cy="146" rx="2.4" ry="3.6" fill="#9a7ae0" stroke="' + K + '" stroke-width="1"/>', 3);
    /* --- le plateau --- */
    if(f === 1) s += c.boite(2, Y, 378, 124, -3, P2 + 1, UNI(G('pierre'))) + c.sur(reflet('M14,114 H366', 3), -3);
    else if(f === 2) s += c.boite(4, Y, 376, 124, 0, P2, MARBRE) + c.sur(T('M50,113 C100,120 130,109 190,116 M240,111 C280,118 320,111 360,116', veine, 2.5), 0) +
      c.dessus(T('M26,-30 C100,-50 160,-20 240,-44 S330,-28 366,-58 M64,-88 C140,-72 190,-94 262,-78', veine, 2.5, ' opacity=".7"'), Y, 0);
    else s += c.boite(4, Y, 376, 124, 0, P2, f === 4 ? BOIS() : UNI(G('boisH'), G('boisH'), G('boisS')));
    /* --- au fond, de gauche à droite : les bûches, l'alambic (son fourneau de briques, son col de cygne, son seau), la marmite sur son trépied,
       le grimoire sur son lutrin, le pressoir, le séchoir --- */
    var fond = '';
    [[22, 0], [34, 0], [28, -10]].forEach(function(q){ fond += '<circle cx="' + q[0] + '" cy="' + (Y - 6 + q[1]) + '" r="6" fill="#8a5a36" stroke="' + K + '" stroke-width="2"/><circle cx="' + q[0] + '" cy="' + (Y - 6 + q[1]) + '" r="3" fill="#e2b87c"/>'; });
    var col = 'M70,' + (Y - 52) + ' C76,' + (Y - 70) + ' 110,' + (Y - 68) + ' 112,' + (Y - 44) + ' L112,' + (Y - 30);
    fond += R(52, Y - 20, 36, 19, 2, '#b0563e', B25) + '<path d="M62,' + (Y - 1) + ' v-7 a8,7 0 0 1 16,0 v7 Z" fill="#170f0c" stroke="' + K + '" stroke-width="1.6"/>' + T('M53,' + (Y - 11) + ' h34', '#e9c9a6', 1, ' opacity=".7"') +
      '<path d="M54,' + (Y - 20) + ' C46,' + (Y - 42) + ' 94,' + (Y - 42) + ' 86,' + (Y - 20) + ' Z" fill="#d98a4a" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' + reflet('M59,' + (Y - 26) + ' C58,' + (Y - 33) + ' 62,' + (Y - 37) + ' 68,' + (Y - 38), 2.6) +
      '<path d="M61,' + (Y - 38) + ' C58,' + (Y - 48) + ' 82,' + (Y - 48) + ' 79,' + (Y - 38) + ' Z" fill="#e0a070" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>' + T(col, K, 7) + T(col, '#e0a070', 3.5) +
      '<path d="M102,' + (Y - 30) + ' h20 l-2,29 h-16 Z" fill="#a5653a" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>' + T('M103,' + (Y - 22) + ' h18 M104,' + (Y - 8) + ' h16', '#3a3450', 2) + '<ellipse cx="112" cy="' + (Y - 30) + '" rx="10" ry="2.6" fill="#8fc6e8" stroke="' + K + '" stroke-width="1.6"/>' +
      R(125, Y - 12, 9, 11, 3, 'rgba(220,245,255,.5)', B2);
    fond += Ell(166, Y - 2, 22, 5, '#8f879f', B2) + T('M152,' + (Y - 24) + ' L147,' + (Y - 2) + ' M180,' + (Y - 24) + ' L185,' + (Y - 2), K, 4.5) + T('M152,' + (Y - 24) + ' L147,' + (Y - 2) + ' M180,' + (Y - 24) + ' L185,' + (Y - 2), '#4a465e', 2) +
      '<path d="M160,' + (Y - 3) + ' c-3,-5 -1,-9 2,-12 c2,4 4,8 -2,12 Z M172,' + (Y - 3) + ' c-3,-6 -1,-10 2,-14 c2,5 4,9 -2,14 Z" fill="#ffc24a" stroke="#e8693c" stroke-width="1.4"/>' +
      '<path d="M146,' + (Y - 48) + ' C142,' + (Y - 32) + ' 152,' + (Y - 22) + ' 166,' + (Y - 21) + ' C180,' + (Y - 22) + ' 190,' + (Y - 32) + ' 186,' + (Y - 48) + ' Z" fill="#4a465e" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' + Ell(166, Y - 48, 20, 5, '#2a2538', B25) +
      T('M172,' + (Y - 48) + ' L184,' + (Y - 70), K, 5) + T('M172,' + (Y - 48) + ' L184,' + (Y - 70), '#c98450', 2.4) + '<g class="at-vapeur"><path d="M158,' + (Y - 56) + ' c-6,-8 6,-12 0,-22"/><path d="M170,' + (Y - 58) + ' c-6,-8 6,-12 0,-20"/></g>';
    /* le lutrin et le grimoire ouvert */
    fond += R(208, Y - 6, 42, 6, 2, '#94603a', B2) + '<path d="M204,' + (Y - 8) + ' L254,' + (Y - 8) + ' L250,' + (Y - 44) + ' L208,' + (Y - 44) + ' Z" fill="#7a2a3a" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M207,' + (Y - 11) + ' L229,' + (Y - 10) + ' L229,' + (Y - 41) + ' L210,' + (Y - 42) + ' Z M251,' + (Y - 11) + ' L229,' + (Y - 10) + ' L229,' + (Y - 41) + ' L248,' + (Y - 42) + ' Z" fill="#f6ecd2" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      T('M233,' + (Y - 36) + ' h11 M233,' + (Y - 30) + ' h12 M233,' + (Y - 24) + ' h10 M233,' + (Y - 18) + ' h12', '#3a2a22', 1.1, ' opacity=".7"') + T('M218,' + (Y - 16) + ' C217,' + (Y - 26) + ' 220,' + (Y - 32) + ' 218,' + (Y - 37), '#3f8f4f', 1.6) + '<circle cx="218" cy="' + (Y - 38) + '" r="2.6" fill="#ff9a1f"/>' +
      T('M228,' + (Y - 9) + ' q-2,6 1,11', '#e8343c', 2.4) + emo(229, Y - 52, 9, '✨');
    /* le pressoir, le séchoir */
    fond += R(266, Y - 8, 50, 8, 2, '#94603a', B25) + R(270, Y - 56, 7, 49, 2, '#7a4a28', B2) + R(305, Y - 56, 7, 49, 2, '#7a4a28', B2) + R(264, Y - 62, 54, 8, 2, '#94603a', B25) +
      R(288, Y - 74, 6, 42, 2, '#b8b4c8', B2) + T('M288,' + (Y - 64) + ' h6 M288,' + (Y - 56) + ' h6 M288,' + (Y - 48) + ' h6 M288,' + (Y - 40) + ' h6', '#7a7690', 1.2) + T('M278,' + (Y - 75) + ' h26', K, 5.5) + T('M278,' + (Y - 75) + ' h26', '#94603a', 2.6) + R(280, Y - 32, 22, 22, 2, '#b06f3e', B2) + T('M286,' + (Y - 31) + ' v20 M291,' + (Y - 31) + ' v20 M296,' + (Y - 31) + ' v20', '#5a3418', 1.2);
    fond += '<path d="M328,' + (Y - 14) + ' C330,' + (Y - 4) + ' 340,' + (Y - 1) + ' 346,' + (Y - 1) + ' C352,' + (Y - 1) + ' 362,' + (Y - 4) + ' 364,' + (Y - 14) + ' Z" fill="#c57e4c" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>' + Ell(346, Y - 14, 18, 4.5, '#f0d0a8', B2) +
      T('M362,' + (Y - 10) + ' V' + (Y - 40), K, 4) + T('M362,' + (Y - 10) + ' V' + (Y - 40), '#94603a', 1.8) + '<g transform="rotate(-5 362 ' + (Y - 44) + ')">' + R(348, Y - 52, 26, 13, 2, '#e9bb80', B2) + T('M352,' + (Y - 47) + ' h18 M354,' + (Y - 43) + ' h14', '#5a3418', 1.1) + '</g>';
    s += c.sur(fond, 84);
    /* --- à plat sur le plateau : le linge de la cueillette --- */
    s += c.dessus(R(150, -46, 100, 36, 2, '#f6f1e4', B25) + '<rect x="154" y="-42" width="92" height="28" rx="1" fill="none" stroke="#c9483f" stroke-width="1.4"/>', Y, 0);
    /* --- devant : le mortier et son pilon, la planche et son couteau, les plantes sur le linge, la cruche, le bocal à filtrer --- */
    var lame = 'M70,' + (Y - 12) + ' L104,' + (Y - 12) + ' L98,' + (Y - 6) + ' L70,' + (Y - 6) + ' Z';
    var dev = '<path d="M20,' + (Y - 20) + ' H56 C56,' + (Y - 5) + ' 46,' + (Y - 1) + ' 38,' + (Y - 1) + ' C30,' + (Y - 1) + ' 20,' + (Y - 5) + ' 20,' + (Y - 20) + ' Z" fill="#cfc8d8" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' + Ell(38, Y - 20, 18, 4.4, '#a8a0b8', B25) +
      '<g transform="rotate(-22 32 ' + (Y - 26) + ')">' + R(28, Y - 46, 8, 28, 4, '#e8dfca', B25) + '</g>' +
      R(62, Y - 5, 62, 6, 2, '#d9a86a', B25) + '<path d="' + lame + '" fill="#dfe6ee" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' + R(102, Y - 13, 18, 8, 3, '#5a3418', B2);
    dev += T('M170,' + (Y - 4) + ' C168,' + (Y - 14) + ' 172,' + (Y - 20) + ' 168,' + (Y - 26) + ' M196,' + (Y - 4) + ' C198,' + (Y - 14) + ' 194,' + (Y - 20) + ' 198,' + (Y - 26) + ' M224,' + (Y - 4) + ' V' + (Y - 22), '#3f8f4f', 2.4) +
      '<circle cx="168" cy="' + (Y - 28) + '" r="4.5" fill="#f08a1e" stroke="' + K + '" stroke-width="1.5"/><circle cx="198" cy="' + (Y - 28) + '" r="4" fill="#6ea8ff" stroke="' + K + '" stroke-width="1.5"/><ellipse cx="224" cy="' + (Y - 25) + '" rx="3.4" ry="6" fill="#c9483f" stroke="' + K + '" stroke-width="1.4"/>' +
      '<ellipse cx="180" cy="' + (Y - 10) + '" rx="6" ry="3" fill="#6fae5a" stroke="' + K + '" stroke-width="1.3" transform="rotate(-24 180 ' + (Y - 10) + ')"/><ellipse cx="212" cy="' + (Y - 12) + '" rx="6" ry="3" fill="#6fae5a" stroke="' + K + '" stroke-width="1.3" transform="rotate(22 212 ' + (Y - 12) + ')"/>';
    dev += '<path d="M278,' + (Y - 2) + ' C270,' + (Y - 14) + ' 272,' + (Y - 28) + ' 280,' + (Y - 32) + ' L281,' + (Y - 40) + ' L293,' + (Y - 40) + ' L294,' + (Y - 32) + ' C302,' + (Y - 28) + ' 304,' + (Y - 14) + ' 296,' + (Y - 2) + ' Z" fill="#8fa6c0" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/>' + T('M274,' + (Y - 18) + ' q13,5 26,0', '#2f5f9a', 2) + T('M296,' + (Y - 33) + ' q10,2 6,14', K, 4) + T('M296,' + (Y - 33) + ' q10,2 6,14', '#8fa6c0', 1.8) +
      R(322, Y - 30, 34, 29, 5, 'rgba(220,245,255,.4)', B25) + '<path d="M318,' + (Y - 32) + ' q20,-8 42,0 l-2,7 q-19,6 -38,0 Z" fill="#f6f1e4" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/>' + T('M320,' + (Y - 26) + ' q19,6 38,0', '#c9483f', 1.6);
    /* (une plante cueillie attend : elle brille sur le linge) */
    if(DESSIN.plantes > 0) dev += '<circle class="at-halo at-a-analyser" cx="196" cy="' + (Y - 16) + '" r="30" fill="' + G('halo') + '"/>';
    s += c.sur(dev, 26);
    return [N(s + '</g>')];
  }});

/* ==========================================================
   Mimi, dessinée de près (16 novembre ; Romain : « insiste bien sur les textures de Mimi, un dessin joli mais pas trop pesant ;
   je veux beaucoup de détails, et travaille beaucoup les animations du chat »).
   - Ses pelages et ses yeux (o.v : un numéro — le pelage, plus 100 × (les yeux + 1) si elle en a changé : MimiPantin.peau, vChat) :
     CHATS[pelage] = [pelage, rayures, ventre, iris clair, iris foncé, reflet, tigrée ?] (0 : Mimi, rousse tigrée) ; MimiPantin.YEUX.
   - Le pelage a son dégradé (plus clair en haut : atg-mim0…2), le ventre aussi (atg-mimv…), les yeux (atg-mimy…), l'oreille (atg-mimo),
     la truffe (atg-mimn) : defsMimi(), posés une fois avec les dégradés de l'atelier.
   - Cinq poses, une seule visible (CSS .at-c-<pose>) : assise, debout (marche, saut, griffes, boule), en boule (elle dort),
     sur le dos (pattes en l'air, coussinets roses), couchée « en pain ».
   - La tête (teteChat) porte toutes ses expressions, montrées par des classes : yeux et pupilles, paupières (clignement, sommeil),
     yeux fermés contents, gueule ouverte (miaou), bâillement, langue, moustaches, deux oreilles qui bougent chacune de leur côté.
   - La queue est en trois morceaux emboîtés : chacun tourne autour de son attache (une vraie vague). Pour qu'aucun trait ne se voie
     aux jointures, elle est dessinée deux fois avec les mêmes morceaux : tous les contours d'abord, puis toute la fourrure.
   - Léger : pas de filtre, pas de flou, pas de motif ; des traits et des dégradés. Une seule pose est peinte à la fois.
   ========================================================== */
/* ⚠️ DEPUIS LE 16 NOVEMBRE AU SOIR, MIMI EST UN PANTIN ARTICULÉ (Romain, 18 h 27 : « travaille beaucoup l'animation de Mimi ») :
   son dessin, son squelette, ses poses et ses gestes sont dans mimi-dessin.js, mimi-pantin.js et mimi-gestes.js (window.MimiPantin).
   Ici, il ne reste que le lien avec l'atelier : pantinDe, chatMonter, teteChat, accPantin.
   L'ANCIEN DESSIN (dessinMimi, teteChatAncienne, queueChat, oeilChat… jusqu'à « Objets de la boutique ») NE SERT PLUS : À RETIRER. */
var MP = window.MimiPantin;
var CHATS = MP.CHATS;
function defsMimi(){ return MP.defs(); }
function idxChat(p){ var i = CHATS.indexOf(p); return i < 0 ? 0 : i; }
/* le numéro d'un chat, remis d'aplomb (son pelage, ses yeux : MimiPantin.peau) — jamais « % 3 » : il y a plus de trois pelages maintenant */
function vChat(v){ var q = MP.peau(v); return MP.numero(q.p, q.y); }
/* ses accessoires, dessinés autour du milieu de sa tête */
function accPantin(acc){ acc = acc || {}; var un = function(k){ return acc[k] && ACC[acc[k]] && ACC[acc[k]].slot === k ? dessinAcc(acc[k], 0, 0) : ''; }; return {cou:un('cou'), tete:un('nez') + un('tete')}; }
/* sa tête seule (les petits portraits : la barre de Mimi, la garde-robe, la boutique) ; (cx, cy) : le milieu de la tête */
/* (p : le numéro du chat — ou, pour l'ancien dessin, sa palette) */
function teteChat(p, cx, cy, acc){ return '<g transform="translate(' + f1(cx) + ',' + f1(cy) + ')">' + MP.tete(Array.isArray(p) ? idxChat(p) : vChat(p), accPantin(acc)) + '</g>'; }
var MC = 3.2;   /* le contour de Mimi : un peu plus fin que les meubles, pour qu'on voie ses détails */
function PM(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (w || MC) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
function FM(d, f, x){ return '<path d="' + d + '" fill="' + f + '"' + (x || '') + '/>'; }
/* un chemin dont les points sont donnés par rapport à (cx, cy) : ['M', dx, dy, 'C', …] (commandes absolues seulement) */
function rp(cx, cy, l){
  var s = '', k = 0;
  l.forEach(function(v){ if(typeof v === 'string'){ s += (s ? ' ' : '') + v; k = 0; } else { s += k % 2 ? ',' + f1(cy + v) : (k ? ' ' : '') + f1(cx + v); k++; } });
  return s;
}
/* un œil : l'iris (dégradé), la pupille fendue (elle s'ouvre en grand quand Mimi joue : .at-c-pup), deux reflets, le trait du dessus */
function oeilChat(i, ex, ey){
  return '<g class="at-c-oeil">' + PM(rp(ex, ey, ['M', -4.8, 0, 'C', -3.8, -4.8, 3.8, -4.8, 4.8, 0, 'C', 3.8, 4.4, -3.8, 4.4, -4.8, 0, 'Z']), G('mimy' + i), 1.5) +
    '<ellipse class="at-c-pup" cx="' + f1(ex) + '" cy="' + f1(ey + 0.2) + '" rx="1.45" ry="3.6" fill="' + K + '"/>' +
    '<circle cx="' + f1(ex + 1.5) + '" cy="' + f1(ey - 1.6) + '" r="1.35" fill="#fff"/><circle cx="' + f1(ex - 1.6) + '" cy="' + f1(ey + 1.8) + '" r=".65" fill="#fff" opacity=".85"/>' +
    T(rp(ex, ey, ['M', -5.1, -0.3, 'C', -3.8, -5.2, 3.8, -5.2, 5.1, -0.3]), K, 2.1) + '</g>';
}
/* la paupière : elle descend du haut (CSS : scaleY) ; en bas, le trait de l'œil fermé */
function paupiereChat(ex, ey, f){
  return '<g class="at-c-pp">' + FM(rp(ex, ey, ['M', -5.9, 0.4, 'C', -4.6, -6.9, 4.6, -6.9, 5.9, 0.4, 'C', 4.6, 5.4, -4.6, 5.4, -5.9, 0.4, 'Z']), f) +
    T(rp(ex, ey, ['M', -5, 2.2, 'Q', 0, 5.2, 5, 2.2]), K, 1.9) + '</g>';
}
/* une oreille (s : -1 à gauche, 1 à droite) : le dehors en fourrure, le dedans rose, trois poils blancs */
function oreilleChat(i, cx, cy, s){
  var X = function(v){ return f1(cx + s * v); }, Y = function(v){ return f1(cy + v); };
  var ext = 'M' + X(4) + ',' + Y(-13) + ' C' + X(7) + ',' + Y(-20) + ' ' + X(13) + ',' + Y(-27) + ' ' + X(17.5) + ',' + Y(-29.5) +
    ' C' + X(19.8) + ',' + Y(-24) + ' ' + X(19.8) + ',' + Y(-14) + ' ' + X(16.6) + ',' + Y(-5) + ' Z';
  var inte = 'M' + X(7.2) + ',' + Y(-13) + ' C' + X(9.2) + ',' + Y(-18) + ' ' + X(13) + ',' + Y(-23) + ' ' + X(16.3) + ',' + Y(-25.4) +
    ' C' + X(17.3) + ',' + Y(-21) + ' ' + X(17.1) + ',' + Y(-14) + ' ' + X(15.1) + ',' + Y(-8.6) + ' Z';
  var poils = 'M' + X(9.4) + ',' + Y(-11) + ' L' + X(11.6) + ',' + Y(-17.4) + ' M' + X(12.4) + ',' + Y(-10.4) + ' L' + X(13.7) + ',' + Y(-18) + ' M' + X(15) + ',' + Y(-9.8) + ' L' + X(15.7) + ',' + Y(-16.2);
  return '<g class="at-c-or at-c-or-' + (s < 0 ? 'g' : 'd') + '">' + PM(ext, G('mim' + i)) + FM(inte, G('mimo')) + T(poils, '#fffaf2', 1.1, ' opacity=".9"') + '</g>';
}
function teteChatAncienne(p, cx, cy, acc){
  acc = acc || {};
  var i = idxChat(p), R = function(l){ return rp(cx, cy, l); };
  var moust = R(['M', -9.6, 5.2, 'C', -14.6, 3.6, -19.4, 3.4, -24, 4.6, 'M', -9.6, 7.4, 'C', -14.6, 7.4, -19.4, 8.2, -23.6, 10.2, 'M', -9.2, 9.4, 'C', -13.6, 11, -17.4, 12.8, -20.6, 15.4,
    'M', 9.6, 5.2, 'C', 14.6, 3.6, 19.4, 3.4, 24, 4.6, 'M', 9.6, 7.4, 'C', 14.6, 7.4, 19.4, 8.2, 23.6, 10.2, 'M', 9.2, 9.4, 'C', 13.6, 11, 17.4, 12.8, 20.6, 15.4]);
  var couvre = function(ex){ return FM(rp(cx + ex, cy - 1.6, ['M', -5.9, 0.4, 'C', -4.6, -6.9, 4.6, -6.9, 5.9, 0.4, 'C', 4.6, 5.4, -4.6, 5.4, -5.9, 0.4, 'Z']), G('mim' + i)); };
  return '<g class="at-c-tete">' + '<g class="at-c-oreilles">' + oreilleChat(i, cx, cy, -1) + oreilleChat(i, cx, cy, 1) + '</g>' +
    (acc.cou && ACC[acc.cou] ? dessinAcc(acc.cou, cx, cy) : '') +
    /* la tête, avec ses touffes de joues */
    PM(R(['M', -16.5, 1, 'C', -18, -9, -10.5, -16.5, 0, -16.5, 'C', 10.5, -16.5, 18, -9, 16.5, 1, 'L', 20.5, 4.2, 'L', 16.8, 6, 'L', 19.6, 9.4, 'L', 14.6, 10.4,
      'C', 10, 16.4, -10, 16.4, -14.6, 10.4, 'L', -19.6, 9.4, 'L', -16.8, 6, 'L', -20.5, 4.2, 'Z']), G('mim' + i)) +
    T(R(['M', -8.4, -13.4, 'C', -4, -15.4, 4, -15.4, 8.4, -13.4]), p[5], 1.5, ' opacity=".8"') +
    (p[6] ? T(R(['M', -6, -15.6, 'C', -5.4, -12, -4.8, -10, -3.6, -8, 'M', 0, -16.4, 'L', 0, -9.8, 'M', 6, -15.6, 'C', 5.4, -12, 4.8, -10, 3.6, -8]), p[1], 2.1) +
      T(R(['M', -16.8, 2.4, 'L', -12.4, 3.4, 'M', -17.6, 5.8, 'L', -13.2, 6, 'M', 16.8, 2.4, 'L', 12.4, 3.4, 'M', 17.6, 5.8, 'L', 13.2, 6]), p[1], 1.6) : '') +
    /* les joues roses, le museau clair et ses petits points, le menton */
    '<ellipse cx="' + f1(cx - 12.4) + '" cy="' + f1(cy + 6.4) + '" rx="2.8" ry="1.6" fill="#ff7a9c" opacity=".3"/><ellipse cx="' + f1(cx + 12.4) + '" cy="' + f1(cy + 6.4) + '" rx="2.8" ry="1.6" fill="#ff7a9c" opacity=".3"/>' +
    FM(R(['M', -9.6, 6.4, 'C', -9.6, 2.2, -3.4, 1.4, 0, 4.4, 'C', 3.4, 1.4, 9.6, 2.2, 9.6, 6.4, 'C', 9.6, 11.4, 3.4, 12.4, 0, 10.6, 'C', -3.4, 12.4, -9.6, 11.4, -9.6, 6.4, 'Z']), G('mimv' + i)) +
    FM(R(['M', -4.2, 10.8, 'C', -3, 14.2, 3, 14.2, 4.2, 10.8, 'Z']), melange(p[2], p[0], 0.3)) +
    [[-4.2, 6.8], [-6.6, 6], [-5.8, 8.8], [4.2, 6.8], [6.6, 6], [5.8, 8.8]].map(function(q){ return '<circle cx="' + f1(cx + q[0]) + '" cy="' + f1(cy + q[1]) + '" r=".75" fill="' + sombre(p[2], 0.5) + '"/>'; }).join('') +
    /* les yeux, et tout ce qui peut les cacher : les paupières (clignement, sommeil), les yeux fermés contents (^ ^) */
    '<g class="at-c-yeux">' + oeilChat(i, cx - 7, cy - 1.6) + oeilChat(i, cx + 7, cy - 1.6) + '</g>' +
    '<g class="at-c-paupieres">' + paupiereChat(cx - 7, cy - 1.6, G('mim' + i)) + paupiereChat(cx + 7, cy - 1.6, G('mim' + i)) + '</g>' +
    '<g class="at-c-ferme">' + couvre(-7) + couvre(7) + T(R(['M', -11.4, -0.4, 'Q', -7, -5, -2.6, -0.4, 'M', 2.6, -0.4, 'Q', 7, -5, 11.4, -0.4]), K, 2.2) + '</g>' +
    /* la truffe, et la bouche dans tous ses états */
    PM(R(['M', -3.3, 2.8, 'C', -3.3, 1.2, 3.3, 1.2, 3.3, 2.8, 'C', 3.3, 4.4, 1.1, 5.7, 0, 5.9, 'C', -1.1, 5.7, -3.3, 4.4, -3.3, 2.8, 'Z']), G('mimn'), 1.3) +
    '<ellipse cx="' + f1(cx - 1) + '" cy="' + f1(cy + 2.4) + '" rx="1" ry=".55" fill="#fff" opacity=".8"/>' +
    '<g class="at-c-bouche">' + T(R(['M', 0, 5.9, 'L', 0, 7.4, 'M', 0, 7.4, 'Q', -2.4, 10.2, -5.2, 8, 'M', 0, 7.4, 'Q', 2.4, 10.2, 5.2, 8]), K, 1.45) + '</g>' +
    '<g class="at-c-gueule">' + PM(R(['M', -4.2, 7.6, 'C', -4.6, 14.8, 4.6, 14.8, 4.2, 7.6, 'C', 2, 9.4, -2, 9.4, -4.2, 7.6, 'Z']), '#5b1d34', 1.4) +
      FM(R(['M', -2.6, 12.4, 'C', -2, 10.4, 2, 10.4, 2.6, 12.4, 'C', 1.4, 13.6, -1.4, 13.6, -2.6, 12.4, 'Z']), '#ff8fab') +
      FM(R(['M', -3.4, 8.4, 'L', -2.6, 10.6, 'L', -1.8, 8.8, 'Z', 'M', 3.4, 8.4, 'L', 2.6, 10.6, 'L', 1.8, 8.8, 'Z']), '#fff') + '</g>' +
    '<g class="at-c-baille">' + PM(R(['M', -6.4, 7, 'C', -7.6, 19.6, 7.6, 19.6, 6.4, 7, 'C', 3.2, 9.2, -3.2, 9.2, -6.4, 7, 'Z']), '#5b1d34', 1.4) +
      FM(R(['M', -4.4, 15.4, 'C', -3.4, 11.8, 3.4, 11.8, 4.4, 15.4, 'C', 2.4, 17.4, -2.4, 17.4, -4.4, 15.4, 'Z']), '#ff8fab') +
      FM(R(['M', -5.2, 8, 'L', -4.2, 11.4, 'L', -3.2, 8.5, 'Z', 'M', 5.2, 8, 'L', 4.2, 11.4, 'L', 3.2, 8.5, 'Z']), '#fff') + '</g>' +
    '<g class="at-c-langue">' + FM(R(['M', -2, 7.4, 'C', -2.4, 11.8, 2.4, 11.8, 2, 7.4, 'Z']), '#ff8fab') + T(R(['M', 0, 8, 'L', 0, 10]), '#e4668a', 0.9) + '</g>' +
    /* les moustaches (un trait sombre très léger dessous : on les voit sur tous les fonds) */
    '<g class="at-c-moust">' + T(moust, K, 1.8, ' opacity=".28"') + T(moust, '#fffdf6', 0.95) + '</g>' +
    (acc.tete && ACC[acc.tete] ? dessinAcc(acc.tete, cx, cy) : '') +
    '</g>';
}
/* La queue : trois morceaux emboîtés (m[k] = [chemin, anneaux]) ; pre : le nom de la pose (les attaches sont dans le CSS : .at-qa1…).
   Contours d'abord, fourrure ensuite : les deux arbres ont les mêmes classes, ils bougent ensemble. Le bout est foncé. */
function queueChat(p, m, pre, bout){
  function nid(f){ return '<g class="at-q1 ' + pre + '1">' + f(0) + '<g class="at-q2 ' + pre + '2">' + f(1) + '<g class="at-q3 ' + pre + '3">' + f(2) + '</g></g></g>'; }
  return '<g class="at-c-queue">' + nid(function(k){ return T(m[k][0], K, 12.4); }) +
    nid(function(k){ return T(m[k][0], p[0], 7.4) + T(m[k][0], p[5], 2, ' opacity=".55" transform="translate(-.6,-1.1)"') + (m[k][1] ? T(m[k][1], p[1], 2.2) : '') + (k === 2 && bout ? T(bout, p[6] ? p[1] : p[2], 7.2) : ''); }) + '</g>';
}
/* une patte qui se pose : le pied et ses doigts */
function piedChat(x, y, f, rx){
  rx = rx || 6;
  return PM('M' + f1(x - rx) + ',' + f1(y + 1.6) + ' C' + f1(x - rx) + ',' + f1(y - 3.6) + ' ' + f1(x + rx) + ',' + f1(y - 3.6) + ' ' + f1(x + rx) + ',' + f1(y + 1.6) + ' Z', f, 2.6) +
    T('M' + f1(x - rx / 3) + ',' + f1(y + 1.2) + ' L' + f1(x - rx / 3) + ',' + f1(y - 0.8) + ' M' + f1(x + rx / 3) + ',' + f1(y + 1.2) + ' L' + f1(x + rx / 3) + ',' + f1(y - 0.8), K, 1.1, ' opacity=".7"');
}
/* un dessous de patte, vu de face (Mimi sur le dos) : le gros coussinet et quatre petits, roses */
function coussinets(x, y, a, f){
  return '<g transform="rotate(' + a + ' ' + f1(x) + ' ' + f1(y) + ')">' + '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="5.4" ry="4.4" fill="' + f + '" stroke="' + K + '" stroke-width="2.4"/>' +
    '<ellipse cx="' + f1(x) + '" cy="' + f1(y + 1.2) + '" rx="2.3" ry="1.8" fill="#ff9fb6"/>' +
    [[-3, -1.6], [-1.1, -2.9], [1.1, -2.9], [3, -1.6]].map(function(q){ return '<circle cx="' + f1(x + q[0]) + '" cy="' + f1(y + q[1]) + '" r=".95" fill="#ff9fb6"/>'; }).join('') + '</g>';
}
/* Le chat est dessiné de profil (il bouge, il marche, il saute) : il reste une image plate, posée dans la pièce à la bonne taille */
def('chat', {w:MP.W, h:MP.H, z:'petit', plat:true, nom:'Petit chat', ic:'🐈',
  d:function(c){ return [N(MP.dessin(vChat(c.v), MP.pose('assis'), accPantin(c.o.acc)))]; }});
/* Tout le chat : l'ombre, les cinq poses, les « z » du sommeil (une pose est montrée par le CSS) */
function dessinMimi(p, acc){
  var i = idxChat(p), F = G('mim' + i), V = G('mimv' + i), S = sombre(p[0], 0.2), blanc = !p[6];   /* (la noire a des chaussettes blanches) */
  var raye = function(d, w){ return p[6] ? T(d, p[1], w || 2.4) : T(d, p[1], w || 2.4, ' opacity=".55"'); };
  var poils = function(d, o){ return T(d, p[5], 1.5, ' opacity="' + (o || 0.7) + '"'); };
  /* ---- assise, de profil (elle regarde à droite) : elle peut se lécher la patte, taper un bocal, pétrir, manger ---- */
  var assis = '<g class="at-c-g-assis">' +
    queueChat(p, [['M33,85 C27,88 20,89 14,87', 'M23.5,85 L23.5,90.8 M17.4,85 L18,90.7'], ['M14,87 C8,85 5,79 6,72', 'M4.8,82.7 L10,80'], ['M6,72 C7,66 10,62 14,60', 'M6.1,63.3 L10.8,66.7']], 'at-qa', 'M12.2,60.8 L14,60') +
    '<g class="at-c-ventre">' + PM('M24,84 C22,72 34,66 52,68 C70,70 78,78 74,88 C66,92 36,92 24,84 Z', F) + FM('M40,82 C46,76 62,76 68,82 C62,88 46,88 40,82 Z', V) + '</g>' +
    '<g class="at-c-buste">' + PM('M30,91 C22,90 19,80 21,70 C23,58 32,49 44,46 C52,44 59,41 65,43 C73,48 77,62 75,80 C75,86 73,90 70,91 Z', F) +
    FM('M27,90 C24,78 29,64 40,62 C50,61 56,70 55,80 C54,86 51,90 47,91 Z', F) + T('M27,86 C24,76 29,64 40,62 C50,61 56,70 55,80', K, 2.4) +
    raye('M44,48.6 C42,55 43,60 46,64 M52,47.8 C50,54 51,58 54,62 M36,51.6 C33,58 33,62 35,66') + raye('M32,70 C37,67.6 43,68.4 48,71.6 M29.6,77.6 C35,75.6 41,76.4 46,79.4', 2) +
    poils('M28,58 C34,51 42,48 50,47.6') + T('M23,66 l-2.4,-1 M22.4,72 l-2.6,.2 M23.4,78 l-2.4,1', K, 1.2, ' opacity=".55"') +
    piedChat(44, 89, F, 9) + '</g>' +
    /* les pattes de devant sortent de sous le plastron : pas de trait en haut, elles naissent dans la fourrure */
    '<g class="at-c-patte-b">' + FM('M56,60 C56,71 57,82 57.6,89 L65.4,89 C65.4,81 65,70 64.6,60 Z', S) + T('M56.4,70 C56.8,78 57.2,84 57.6,88.4', K, 2.8) + T('M65,70 C65.2,78 65.4,84 65.4,88.4', K, 2.8) + piedChat(61.5, 89, S, 5.6) + '</g>' +
    '<g class="at-c-patte">' + FM('M63.4,58 C63.4,70 64.4,81 64.8,89 L74,89 C74,81 73.6,69 72.6,57 Z', blanc ? V : F) + T('M64,70 C64.2,78 64.6,84 64.8,88.4', K, 2.8) + T('M73.4,68 C73.8,77 74,84 74,88.4', K, 2.8) +
      raye('M64.6,81.6 L73.8,81.2 M64.8,85.4 L73.9,85.2', 1.8) + piedChat(69.4, 89, blanc ? V : F, 6.6) + '</g>' +
    /* le plastron : une touffe claire et ébouriffée, par-dessus le haut des pattes */
    FM('M60,46 C68,49.4 72.8,57.4 72.8,67.4 C72.6,72 71.8,75.4 70.4,78 L68.6,74.8 L66.2,77.8 L64.8,74 L61.8,76.2 L61.2,72 L58.2,72.8 L59.4,68.2 L56.4,66.4 L58.8,62.6 L56.6,58.6 L59.2,55 Z', V) +
    T('M63,56 l-1.4,2.6 M65.8,62 l-1.6,2.4 M66.8,69 l-1.6,2.2', sombre(p[2], 0.25), 1.1) +
    teteChat(p, 68, 33, acc) + '</g>';
  /* ---- debout : elle marche, elle saute ; dressée, elle fait ses griffes ou tape la boule ---- */
  /* une jambe : sans trait en haut (elle sort du corps), ses deux bords, son pied ; dx décale toute la jambe */
  var jambe = function(cls, d, g, dr, x, f, dx){
    var t = dx ? ' transform="translate(' + dx + ',0)"' : '';
    return '<g class="at-c-j ' + cls + '"><g' + t + '>' + FM(d, f) + T(g, K, 2.8) + T(dr, K, 2.8) + piedChat(x, 88, f, 5.6) + '</g></g>';
  };
  var arriere = ['M26,58 C24,67 28,74 32,78 L33,88 L41,88 L40.6,78 C44,72 45,64 42,57 Z', 'M26.4,64 C26.8,71 29.6,75.6 32,78 L33,87.4', 'M43.4,62 C43.4,69 42,74 40.6,78 L41,87.4'];
  var avant = ['M70.6,57 C70.6,67 71.4,78 72,88 L80,88 C80,78 79.6,67 79,57 Z', 'M71,68 C71.2,76 71.6,83 72,87.4', 'M79.4,67 C79.8,76 80,83 80,87.4'];
  var debout = '<g class="at-c-g-debout">' +
    jambe('at-c-j1', arriere[0], arriere[1], arriere[2], 37, S, -6) + jambe('at-c-j3', avant[0], avant[1], avant[2], 76, S, -8) +
    queueChat(p, [['M22,56 C17,52 14,47 13,41', 'M13.5,50.7 L18.5,47.8'], ['M13,41 C12,35 12,30 14,25', 'M9.5,32.5 L15.3,32.8'], ['M14,25 C16,20 20,17 24,17', 'M15.9,17.2 L19.5,21.8']], 'at-qd', 'M22,17.1 L24,17') +
    '<g class="at-c-ventre">' + PM('M24,66 C26,80 80,82 86,66 Z', F) + '</g>' +
    PM('M19,63 C15,52 25,45 39,45 C53,44 67,45 79,46 C89,47 93,54 91,63 C89,71 81,73 71,73 C57,74 41,74 31,73 C24,72 20,69 19,63 Z', F) +
    FM('M33,71.4 C44,73.4 62,73.4 74,71.2 L71.6,68.6 L68,70.2 L65.6,67.6 L61.6,69.4 L58.6,66.8 L54.6,69 L51.4,66.6 L47.8,69 L44.6,67 L41.4,69.4 L38,67.8 L35.6,69.8 Z', V) +
    T('M21,58 C28,53 38,56 41,64', K, 2.2) + T('M70,50 C75,52 77,58 76,64', K, 1.8, ' opacity=".45"') +
    raye('M38,45.4 C37.6,50 39,54 41.6,57 M47,44.8 C46.6,50 48,54 50.6,57 M56,44.6 C55.6,50 57,54 59.6,57 M65,44.9 C64.6,50 66,53.6 68.2,56') + raye('M22,64 C26,62 31,63 34,65 M23,69 C27,67.4 31,68 33.4,69.6', 2) +
    poils('M30,47.6 C44,45.4 62,45.2 78,47.6') +
    jambe('at-c-j2', arriere[0], arriere[1], arriere[2], 37, F) + jambe('at-c-j4', avant[0], avant[1], avant[2], 76, blanc ? V : F) +
    teteChat(p, 92, 44, acc) + '</g>';
  /* ---- en boule, elle dort : la queue enroulée devant, la tête posée sur ses pattes ---- */
  var dort = '<g class="at-c-g-dort"><g class="at-respire">' +
    PM('M22,88 C11,78 15,58 38,50 C58,44 86,47 97,61 C105,72 103,84 96,89 C80,91 40,91 22,88 Z', F) +
    raye('M44,51 C42.4,58 44,64 48,68.6 M57,48 C55.4,55 57,61 61,66 M70,48.6 C68.4,55 70,61 74,65.6 M83,53 C81.6,59 83,64 86.4,68 M94,61 C92.6,65 93.4,69 96,72') +
    poils('M32,55 C48,47 74,46 92,56', 0.8) + T('M66,88 C64,76 74,66 88,68', K, 2.2, ' opacity=".55"') +
    PM('M30,90 C29,85 46,84 47,89 Z', blanc ? V : F, 2.6) +
    '<g transform="rotate(-14 34 68)">' + teteChat(p, 34, 68, acc) + '</g></g>' +
    queueChat(p, [['M95,82 C88,88 78,90 68,90', 'M81.9,85.4 L83.4,91.1'], ['M68,90 C58,90 48,90 40,89', 'M64,87.2 L64,92.8 M53,87.1 L53,92.7'], ['M40,89 C33,88 27,86 23,82', 'M30.2,89.6 L32.2,84.2']], 'at-qs', 'M24.6,83.4 L23,82') + '</g>';
  /* ---- sur le dos, les quatre pattes en l'air (on voit ses coussinets) : elle peut attraper le doigt ---- */
  var dos = '<g class="at-c-g-dos">' +
    queueChat(p, [['M24,82 C18,84 12,84 8,80', 'M15.3,80.4 L15.3,86.1'], ['M8,80 C5,76 5,71 8,67', 'M2.9,73.5 L8.6,73.5'], ['M8,67 C10,64 13,62 16,62', '']], 'at-qo', 'M14,62.2 L16,62') +
    '<g class="at-c-dos-ar">' + PM('M30,68 C27,62 24,56 22,50 L28,47 C30,54 33,60 37,66 Z', S) + coussinets(25, 47.6, 24, S) +
      PM('M36,68 C34,61 33,55 33,49 L40,48 C40,55 41,61 44,67 Z', F) + coussinets(36.5, 47.4, 6, F) + '</g>' +
    PM('M17,77 C16,68 27,61 44,60 C60,59 72,61 79,67 C84,73 82,83 72,86 C56,89 34,89 22,86 C19,84 17,81 17,77 Z', F) +
    FM('M24,70 C36,61.6 60,61 74,66 L72.6,68.6 L69.6,67.4 L67.4,70.4 L64,68.8 L61.4,71.6 L58,69.8 L55,72.2 L51.6,70.2 L48,72.2 L44.6,70.2 L41.4,72 L38,70 L35,71.6 L31.6,69.8 L28,71 Z', V) +
    raye('M28,80 C34,78 40,78 44,80.6 M50,82 C56,80 62,80 66,82.6') + poils('M26,64.6 C40,60.4 58,60 72,63.6', 0.6) +
    '<g transform="rotate(-22 88 73)">' + teteChat(p, 88, 73, acc) + '</g>' +
    '<g class="at-c-dos-av">' + '<g class="at-c-dos-av1">' + PM('M55,66 C55,60 55,54 56,48 L62,48 C61,54 61,60 62,66 Z', S) + coussinets(59, 47, -6, S) + '</g>' +
      '<g class="at-c-dos-av2">' + PM('M62,67 C63,61 65,55 67,50 L73,52 C71,57 69,62 69,68 Z', blanc ? V : F) + coussinets(70.4, 50.4, -24, blanc ? V : F) + '</g></g>' + '</g>';
  /* ---- couchée « en pain », les pattes rentrées : elle se repose, les yeux mi-clos ---- */
  var pain = '<g class="at-c-g-pain">' +
    PM('M18,90 C11,80 20,62 42,58 C58,55 76,58 84,68 C90,76 90,86 84,90 Z', F) +
    raye('M36,59.6 C35,65 36.4,70 39.4,74 M47,57.6 C46,63 47.4,68 50.4,72 M58,57.4 C57,62.6 58.4,67.4 61.4,71 M26,64 C25,70 26.6,75 29.4,79') +
    poils('M26,63 C38,57 58,55.6 74,60') +
    FM('M76,62 C84,66 88,74 87,82 L84.6,80.6 L83,84 L80.4,81.6 L78,84.6 L76.6,80.4 L73.6,81 L74.6,76 L71.6,74.6 L74,70 Z', V) +
    PM('M67,90 C66,86 76,85 77,89.6 Z', blanc ? V : F, 2.6) + PM('M75,90 C74,85.6 85,85 86,89.6 Z', blanc ? V : F, 2.6) +
    queueChat(p, [['M24,88 C32,91 42,92 52,91', 'M37.3,88.2 L37.3,93.8'], ['M52,91 C60,90.4 66,89.6 70,88', 'M62.2,87.1 L62.9,92.7'], ['M70,88 C73,87 75,85 76,83', '']], 'at-qp', 'M75.4,84 L76,83') +
    teteChat(p, 80, 50, acc) + '</g>';
  return '<ellipse class="at-c-ombre" cx="58" cy="91" rx="46" ry="5" fill="rgba(0,0,0,.28)"/>' +
    '<g class="at-c-corps">' + dort + assis + debout + dos + pain + '</g>' +
    '<text class="at-zzz" x="40" y="40" font-size="17" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>' +
    '<text class="at-zzz z2" x="50" y="32" font-size="13" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>';
}

/* ---------- Objets de la boutique de l'Alchimiste (eux aussi dans la perspective de la pièce) ---------- */
/* des points le long d'une courbe de Bézier (un tuyau, une anse) */
function bezier3(a, b, c2, d, n){
  var l = [];
  for(var i = 0; i <= n; i++){
    var t = i / n, u = 1 - t;
    l.push([0, 1, 2].map(function(k){ return u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c2[k] + t * t * t * d[k]; }));
  }
  return l;
}
def('alambic', {w:116, h:144, p:60, z:'petit', nom:'Alambic', ic:'⚗️',
  d:function(c){
    var cz = 30, s = c.boite(18, 118, 68, 142, 14, 46, UNI(G('metal'), '#6a6290', '#352c4f')) +
      c.sur('<path class="at-flamme" d="M43,136 c-6,-6 -3,-12 0,-16 c3,4 6,10 0,16 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>', 14);
    s += c.tour(43, cz, [[118, 22], [106, 31], [92, 33], [80, 26], [72, 14]], G('cuivre'), null) + c.cylindre(43, cz, 8, 44, 74, G('cuivre'), G('cuivre'));
    var tuyau = bezier3([43, 46, cz], [58, 16, cz], [92, 20, cz], [97, 88, cz], 12);
    s += c.ligne(tuyau, K, 10) + c.ligne(tuyau, '#e08a4a', 5);
    s += c.tour(97, cz, [[138, 16], [128, 21], [116, 19], [106, 9]], G('verre'), null, ' stroke-width="4"') +
      c.tour(97, cz, [[136, 13], [128, 18], [124, 18.5]], '#8ff3ff', '#bff9ff', ' stroke-width="0" opacity=".85"') + c.cylindre(97, cz, 6, 88, 108, G('verre'), null, ' stroke-width="3.5"');
    s += c.sur(reflet('M24,104 C22,94 26,86 32,82', 3), cz - 30);
    return [N(s)];
  }});
def('thermometre', {w:52, h:144, p:16, z:'mur', nom:'Thermomètre', ic:'🌡️',
  d:function(c){
    return [N(c.boite(6, 6, 46, 138, 0, 14, BOIS()) + c.sur(R(20, 16, 12, 98, 6, '#f6ecd2', ' stroke-width="3"') +
      '<rect class="at-mercure" x="23" y="48" width="6" height="70" rx="3" fill="#e8693c"/>' + Cir(26, 118, 12, '#e8693c') +
      T('M34,30 h6 M34,46 h6 M34,62 h6 M34,78 h6 M34,94 h6', K, 2) + reflet('M12,20 V128', 3), 0))];
  }});
def('balance_or', {w:124, h:116, p:56, z:'petit', nom:'Balance d\'or', ic:'⚖️',
  d:function(c){
    var cz = 28, s = c.tour(62, cz, [[100, 14], [112, 26]], G('or'), G('or')) + c.cylindre(62, cz, 4, 28, 102, G('or'), G('or'));
    var fleau = c.ligne([[14, 32, cz], [110, 32, cz]], K, 8) + c.ligne([[14, 32, cz], [110, 32, cz]], '#f5b945', 4) +
      c.ligne([[14, 32, cz], [4, 72, cz]], '#b8862e', 2) + c.ligne([[14, 32, cz], [24, 72, cz]], '#b8862e', 2) + c.ligne([[110, 32, cz], [100, 72, cz]], '#b8862e', 2) + c.ligne([[110, 32, cz], [120, 72, cz]], '#b8862e', 2) +
      c.cylindre(14, cz, 15, 72, 80, G('or'), '#f7d778', '', 7) + c.cylindre(110, cz, 15, 72, 80, G('or'), '#f7d778', '', 7);
    s += '<g class="at-balance">' + fleau + '</g>' + c.boule(62, 26, cz, 6, G('or'));
    return [N(s)];
  }});
def('mortier', {w:84, h:74, p:70, z:'petit', nom:'Mortier', ic:'🥣',
  d:function(c){
    var cz = 35, s = c.tour(42, cz, [[36, 34], [50, 32], [62, 26], [72, 16]], G('pierre'), '#8c88ad') + c.disque(42, cz, 27, 37, '#4a4668');
    s += c.ligne([[50, 40, cz], [74, 4, cz + 10]], K, 12) + c.ligne([[50, 40, cz], [74, 4, cz + 10]], '#d6d0ee', 6) + c.sur(reflet('M16,44 C18,56 26,62 34,64', 3), cz - 34);
    return [N(s)];
  }});
def('serre', {w:144, h:176, p:100, z:'sol', nom:'Serre enchantée', ic:'🪴',
  d:function(c){
    var s = c.boite(8, 150, 136, 174, 0, 100, BOIS()) + c.poly([[18, 150, 10], [126, 150, 10], [126, 150, 90], [18, 150, 90]], '#5a3a22');
    s += c.sur(P('M40,150 C34,120 30,100 40,80 C50,100 50,124 46,150 Z', G('vert')) + P('M70,150 C66,110 74,80 92,64 C96,96 86,124 78,150 Z', G('vert')) +
      P('M100,150 C98,126 104,108 118,100 C118,120 112,136 106,150 Z', G('vert')) +
      '<circle class="at-lueur" cx="92" cy="62" r="7" fill="#8ff3ff" stroke="' + K + '" stroke-width="3"/><circle class="at-lueur" cx="40" cy="78" r="6" fill="#ff8fb3" stroke="' + K + '" stroke-width="3"/>', 50);
    /* la cloche de verre : une voûte (son devant, son dos et le dessus entre les deux) */
    var arche = function(z){ var l = []; for(var i = 0; i <= 18; i++){ var a = Math.PI - i / 18 * Math.PI; l.push([72 + Math.cos(a) * 56, 72 - Math.sin(a) * 40, z]); } return l; };
    var av = arche(8), ar = arche(92), pts = [];
    av.concat(ar).forEach(function(q){ pts.push(c.Q(q[0], q[1], q[2])); });
    pts.push(c.Q(16, 150, 8), c.Q(128, 150, 8), c.Q(16, 150, 92), c.Q(128, 150, 92));
    s += P(lisse(enveloppe(pts), true, 0.4), G('verre'), ' stroke-width="4"');
    s += c.ligne(av.concat([[128, 150, 8], [16, 150, 8], [16, 72, 8]]), K, 3.5) + c.ligne([[72, 32, 8], [72, 32, 92]], K, 3) + c.ligne([[72, 32, 8], [72, 150, 8]], K, 3) + c.ligne([[16, 104, 8], [128, 104, 8]], K, 3) +
      c.sur(reflet('M26,70 C28,52 40,42 54,38', 4), 8);
    return [N(s)];
  }});
def('athanor', {w:132, h:196, p:110, z:'sol', nom:'Athanor', ic:'🔥',
  d:function(c){
    var cz = 55, s = c.cylindre(66, cz, 48, 64, 194, G('terre'), null), b = '';
    for(var y = 84; y < 190; y += 20) b += c.arcAvant(66, cz, 48.5, y, '#7a3418', 2.5);
    s += b + c.tour(66, cz, [[64, 48], [46, 42], [34, 28], [28, 14]], G('terre'), G('terre')) + c.cylindre(66, cz, 15, 6, 34, G('pierre'), '#4a4668');
    s += c.sur(P('M46,184 L46,138 C46,118 86,118 86,138 L86,184 Z', '#2a1208') + '<ellipse class="at-braise" cx="66" cy="170" rx="16" ry="10" fill="#ff8a3c"/>', cz - 48);
    s += c.sur(reflet('M30,80 V180', 4), cz - 40);
    return [N(s)];
  }});
def('oeil_cristal', {w:84, h:104, p:62, z:'petit', nom:'Œil de cristal', ic:'🔮',
  d:function(c){
    var cz = 31, s = c.sur('<circle class="at-halo" cx="42" cy="46" r="56" fill="' + G('haloC') + '"/>', cz);
    s += c.tour(42, cz, [[78, 15], [90, 20], [102, 26]], G('or'), G('or'));
    s += c.boule(42, 46, cz, 33, G('cristal')) + c.sur('<path class="at-tourne" d="M28,46 C30,30 54,30 56,46 C54,60 34,58 36,46" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>' + reflet('M22,38 C24,26 32,18 42,16', 4), cz - 20);
    return [N(s)];
  }});
var LIVRES = {herbier:['#3f9a6a', '🌿'], grimoire_rec:['#c0392b', '📕'], grand_grimoire:['#6a3fb0', '⭐']};
def('livre', {w:88, h:52, p:66, z:'petit', nom:'Livre', ic:'📗',
  d:function(c){
    var p = LIVRES[c.o.t] || LIVRES.herbier, col = p[0];
    var s = c.boite(8, 44, 82, 50, 4, 62, UNI(sombre(col, 0.2))) + c.boite(10, 30, 80, 44, 6, 60, UNI('#f6ecd2', '#f6ecd2', '#e6d6b0')) +
      c.boite(8, 26, 82, 31, 4, 62, UNI(col, clair(col, 0.12), sombre(col, 0.25))) + c.boite(4, 26, 12, 50, 4, 62, UNI(sombre(col, 0.3)));
    s += c.dessus(T('M20,-14 H76 M20,14 H76', '#ffd36a', 2.5) + emo(48, 0, 22, p[1]), 26, 33);
    return [N(s)];
  }});
def('fioles', {w:112, h:84, p:44, z:'petit', nom:'Fioles', ic:'🧴',
  d:function(c){
    var cols = c.o.t === 'fioles_ether' ? ['#bff9ff', '#e0d0ff', '#bff9ff', '#ffe3a3'] : ['#7cf09a', '#ff7a59', '#8ff3ff', '#ffd84a'], s = c.boite(6, 62, 106, 82, 2, 42, BOIS()), f = '';
    for(var i = 0; i < 4; i++){
      var x = 22 + i * 23;
      f += c.tour(x, 22, [[64, 10], [56, 11], [46, 6]], G('verre'), null, ' stroke-width="3.5"') + c.tour(x, 22, [[63, 8.5], [56, 9.5], [54, 9.5]], cols[i], clair(cols[i], 0.4), ' stroke-width="0"') +
        c.cylindre(x, 22, 4.5, 34, 48, G('verre'), null, ' stroke-width="3"') + c.cylindre(x, 22, 5, 26, 34, '#c58a4a', '#e0a868', ' stroke-width="2.5"');
    }
    s += c.sur(T('M6,72 H106', 'rgba(40,20,10,.35)', 2), 2);
    return [N(s + f)];
  }});
def('etal', {w:204, h:176, p:110, z:'sol', nom:'Étal du marché', ic:'🛒',
  d:function(c){
    var s = c.boite(20, 50, 30, 100, 94, 104, SOMBRE()) + c.boite(174, 50, 184, 100, 94, 104, SOMBRE()) + c.boite(12, 98, 192, 174, 0, 104, BOIS());
    [[52, 34, '#f3c13e', 13], [84, 58, '#7d3aa8', 12], [112, 30, '#52c05e', 13], [146, 62, '#ff7a59', 12], [70, 76, '#ff7a59', 11], [130, 80, '#f3c13e', 11]].sort(function(a, b){ return b[1] - a[1]; })
      .forEach(function(f){ s += c.boule(f[0], 98 - f[3], f[1], f[3], f[2]); });
    s += c.boite(20, 50, 30, 98, 6, 16, SOMBRE()) + c.boite(174, 50, 184, 98, 6, 16, SOMBRE());
    /* l'auvent rayé, en pente vers nous */
    for(var i = 0; i < 8; i++){
      var a = 6 + i * 24, b = a + 24;
      s += c.poly([[a, 36, 108], [b, 36, 108], [b, 60, -8], [a, 60, -8]], i % 2 ? '#f6ecd2' : '#d9544f', ' stroke-width="3"');
    }
    s += c.sur(reflet('M24,108 H180', 3), 0);
    return [N(s)];
  }});
def('socle', {w:88, h:96, p:62, z:'petit', nom:'Objet', ic:'✨',
  d:function(c){
    var cz = 31, s = c.sur('<circle class="at-halo" cx="44" cy="34" r="40" fill="' + G('haloC') + '"/>', cz) + c.boite(16, 60, 72, 94, 8, 54, BOIS()) + c.boite(10, 52, 78, 62, 2, 60, UNI(G('boisH'), G('boisH'), G('boisS')));
    return [N(s + c.sur(emo(44, 30, 40, c.ic || '✨'), cz))];
  }});

['alambic', 'thermometre', 'balance_or', 'mortier', 'serre', 'athanor', 'oeil_cristal', 'livre', 'fioles', 'etal', 'socle'].forEach(function(t){ CAT[t].deco = true; });

/* Les objets de boutique qu'on pose dans l'atelier (les autres se portent sur le héros) */
var BOUTIQUE_DESSIN = {alambic:'alambic', thermometre:'thermometre', balance_or:'balance_or', mortier:'mortier', serre:'serre', athanor:'athanor',
  oeil_cristal:'oeil_cristal', herbier:'livre', grimoire_rec:'livre', grand_grimoire:'livre', fioles_renf:'fioles', fioles_ether:'fioles', etal:'etal',
  loupe_doree:'socle', pierre_transmu:'socle'};
var PORTES = {gants_cuir:1, lunettes_alchi:1, ceinture_fioles:1, sac_herbo:1, chaudron_cuivre:1};
function catDe(o){
  var c = CAT[o.t];
  if(c) return c;
  var b = BOUTIQUE_DESSIN[o.t];
  return b ? CAT[b] : CAT.socle;
}
function icObjetBoutique(id){ var D = DD(); return (D.OBJETS && D.OBJETS[id] && D.OBJETS[id].ic) || '✨'; }

/* ---------- Cartons et colis (posés par terre, dans la même perspective) ---------- */
var CARTON_TAILLE = {carton:[152, 132, 116], colis:[132, 124, 104]};
function dessinCarton(k, RC){
  var x = ajouterOutils3d(ctx3d(RC, false)), s;
  x.p = (CARTON_TAILLE[k.t] || CARTON_TAILLE.carton)[2]; x.cat = {w:RC.w, h:RC.h};
  var l = [], y = RC.h;
  [[-10, -8], [RC.w + 10, -8], [RC.w + 14, x.p + 8], [-14, x.p + 8]].forEach(function(q){ l.push(x.Q(q[0], y, q[1])); });
  var ombre = '<path d="' + lisse(l, true) + '" fill="rgba(12,6,20,.32)"/>';
  if(k.t === 'colis'){
    var V2 = UNI(G('violet'), '#a585ee', '#5537a0'), OR = UNI(G('or'), '#ffe08a', '#b07a1c');
    s = x.boite(10, 46, 122, 122, 4, 100, V2) + x.boite(58, 46, 74, 122, 2, 4, OR) +
      x.boite(4, 30, 128, 48, -2, 106, V2) + x.boite(58, 29, 74, 48, -3, 107, OR) + x.boite(4, 29, 128, 48, 44, 60, OR);
    s += x.sur(P('M66,30 C46,6 30,18 44,30 Z', G('or'), ' stroke-width="4"') + P('M66,30 C86,6 102,18 88,30 Z', G('or'), ' stroke-width="4"') +
      '<text class="at-scintille" x="104" y="12" font-size="22" text-anchor="middle">✨</text>', 52) + x.sur(reflet('M18,58 V112', 4), 4);
  } else {
    var CB = UNI(G('carton'), G('cartonH'), '#b07c46');
    s = '<g class="at-dessus-ouvert">' + x.poly([[8, 44, 112], [144, 44, 112], [144, 8, 128], [8, 8, 128]], '#d9a966') + '</g>' +
      x.boite(8, 44, 144, 128, 0, 112, CB) +
      '<g class="at-dessus-ferme">' + x.poly([[64, 44, 0], [88, 44, 0], [88, 44, 112], [64, 44, 112]], '#efe0b0', ' stroke-width="3"') + '</g>' +
      '<g class="at-dessus-ouvert">' + x.poly([[14, 44, 6], [138, 44, 6], [138, 44, 106], [14, 44, 106]], '#6b4a2a') + '</g>' +
      '<g class="at-rabats">' + x.poly([[8, 44, 0], [8, 44, 112], [-20, 22, 112], [-20, 22, 0]], G('cartonH')) + x.poly([[144, 44, 0], [144, 44, 112], [172, 22, 112], [172, 22, 0]], G('cartonH')) +
        x.poly([[8, 44, 0], [144, 44, 0], [144, 30, -30], [8, 30, -30]], G('cartonH')) + '</g>' +
      x.sur(R(64, 44, 24, 30, 0, '#efe0b0', ' stroke-width="3"') + T('M20,104 h22 M20,112 h14', '#8a5a2a', 3) + emo(118, 100, 20, '✨') + reflet('M16,52 V120', 4), 0);
  }
  var coins = [];
  [0, RC.w].forEach(function(a){ [0, RC.h].forEach(function(b){ [0, x.p].forEach(function(z){ coins.push(x.Q(a, b, z)); }); }); });
  var hull = enveloppe(coins);
  s = ombre + '<path d="M' + hull.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' L') + ' Z" fill="transparent"/>' + s;
  return {svg:s, bb:x.bb.slice()};
}

/* ==========================================================
   La décoration : chaque toucher change la forme ET la couleur (c.fo : la forme, c.ti : le thème, 0 = naturel).
   Le bois, la terre cuite, le métal et l'or sont repeints tout seuls (repeindre) ; les tissus et les fleurs prennent la couleur du thème.
   Tout est dessiné dans la perspective de la pièce : les meubles en boîtes, les pots en cylindres (on voit leur dessus),
   les tapis couchés sur le plancher ; ce qui est plat (un tableau, des fanions) est collé sur son mur.
   ========================================================== */
function coulTh(c, nat){ return c.ti ? THEMES[c.ti].c : nat; }
function palette(c, nat){ return couleurs(c.ti, nat); }
function PLANCHE(){ return UNI(G('boisH'), G('boisH'), G('boisS')); }

def('etagere', {w:224, h:186, p:56, z:'mur', deco:true, nf:3, nom:'Étagère', ic:'📚', surf:[{x0:-98, x1:98, y:-140, z:28}, {x0:-98, x1:98, y:-20, z:28}],
  d:function(c){
    var s = '', P2 = c.p;
    if(c.fo === 2){        /* planches suspendues à des cordes */
      s += c.sur(Cir(20, -6, 4, '#cfc9e6') + Cir(204, -6, 4, '#cfc9e6'), P2) +
        c.ligne([[20, -6, P2], [20, 46, 6]], '#8a6a3a', 3.5) + c.ligne([[204, -6, P2], [204, 46, 6]], '#8a6a3a', 3.5);
    } else if(c.fo === 0){ /* montants contre le mur, petites consoles */
      s += c.boite(10, 4, 24, 182, P2 - 10, P2, SOMBRE()) + c.boite(200, 4, 214, 182, P2 - 10, P2, SOMBRE());
    }
    [46, 166].forEach(function(y){
      s += c.boite(4, y, 220, y + 14, 0, P2, PLANCHE());
      if(c.fo === 0) s += c.boite(14, y + 14, 22, y + 28, 12, P2 - 10, SOMBRE()) + c.boite(202, y + 14, 210, y + 28, 12, P2 - 10, SOMBRE());
      if(c.fo === 1){      /* consoles festonnées sous la planche */
        var f = '';
        for(var x = 12; x < 212; x += 25) f += P('M' + x + ',' + (y + 14) + ' C' + (x + 3) + ',' + (y + 26) + ' ' + (x + 19) + ',' + (y + 26) + ' ' + (x + 22) + ',' + (y + 14) + ' Z', G('bois'), ' stroke-width="3"');
        s += c.sur(f, 2);
      }
      if(c.fo === 2 && y < 100) s += c.ligne([[20, y + 14, 6], [20, 166, 6]], '#8a6a3a', 3.5) + c.ligne([[204, y + 14, 6], [204, 166, 6]], '#8a6a3a', 3.5);
    });
    return [N(s + c.sur(reflet('M14,50 H210', 3), 0))];
  }});

def('table', {w:232, h:138, p:120, z:'sol', deco:true, nf:3, nom:'Table', ic:'🪵', surf:[{x0:-96, x1:96, y:-108, z:60}],
  d:function(c){
    var P2 = c.p, s = '';
    if(c.fo === 1){        /* table ovale sur un pied */
      s += c.ovale(116, P2 / 2, 44, 26, 128, 136, G('bois'), G('boisH')) + c.cylindre(116, P2 / 2, 11, 44, 130, G('boisS'), null) +
        c.ovale(116, P2 / 2, 112, 58, 30, 44, G('bois'), G('boisH'));
      return [N(s + c.dessus(reflet('M60,-30 C90,-44 150,-44 180,-30', 3), 30, P2 / 2))];
    }
    if(c.fo === 2){        /* une nappe à carreaux */
      var p = palette(c, ['#f3e7cb', '#ffffff', '#d9544f']), raie = c.ti ? p[2] : '#d9544f';
      s += c.boite(30, 90, 42, 138, P2 - 22, P2 - 10, SOMBRE()) + c.boite(190, 90, 202, 138, P2 - 22, P2 - 10, SOMBRE()) +
        c.boite(30, 90, 42, 138, 10, 22, SOMBRE()) + c.boite(190, 90, 202, 138, 10, 22, SOMBRE());
      s += c.boite(4, 30, 228, 92, -6, P2 + 6, UNI(p[0], clair(p[0], 0.2), sombre(p[0], 0.12)));
      var car = '';
      for(var x = 36; x < 228; x += 36) car += 'M' + x + ',30 V92 ';
      s += c.sur(T(car + 'M4,62 H228', raie, 4, ' opacity=".55"') + P('M4,90 C30,104 52,90 78,100 C102,90 130,104 154,96 C178,104 200,90 228,98 L228,92 L4,92 Z', p[0]), -6);
      var lg = '';
      for(var z = 10; z < P2; z += 30) lg += c.ligne([[4, 30, z], [228, 30, z]], raie, 4, ' opacity=".5"');
      for(var x2 = 36; x2 < 228; x2 += 36) lg += c.ligne([[x2, 30, -6], [x2, 30, P2 + 6]], raie, 4, ' opacity=".5"');
      return [N(s + lg)];
    }
    /* table de bois à quatre pieds */
    s += c.boite(20, 44, 36, 138, P2 - 22, P2 - 6, SOMBRE()) + c.boite(196, 44, 212, 138, P2 - 22, P2 - 6, SOMBRE()) +
      c.boite(18, 44, 214, 62, 8, P2 - 8, BOIS()) +
      c.boite(20, 44, 36, 138, 6, 22, BOIS()) + c.boite(196, 44, 212, 138, 6, 22, BOIS()) +
      c.boite(6, 30, 226, 46, 0, P2, UNI(G('bois'), G('boisH'), G('boisS')));
    return [N(s + c.dessus(reflet('M30,-40 H200', 3), 30, P2 / 2))];
  }});

def('tabouret', {w:86, h:86, p:80, z:'sol', deco:true, nf:3, nom:'Tabouret', ic:'🪑', surf:[{x0:-26, x1:26, y:-64, z:40}],
  d:function(c){
    var cz = c.p / 2, s = '';
    if(c.o.renverse){      /* le chat l'a fait tomber : couché sur le côté, les pieds en l'air vers la droite (un toucher le relève) */
      var pr = palette(c, ['#9d6ee3', '#c9a8ff', '#5f3fa8']);
      if(c.fo === 2) return [N(c.tube([10, 54, cz], [76, 54, cz], 31, pr[0], pr[1], pr[1]) + c.sur(emo(62, 12, 18, '💫'), cz))];
      var jambe = function(a, b){ return c.ligne([a, b], K, 11) + c.ligne([a, b], '#b06f3e', 5); };
      s += jambe([28, 30, cz], [84, 40, cz + 4]) + jambe([28, 62, cz - 22], [84, 80, cz - 32]) + jambe([28, 62, cz + 22], [84, 80, cz + 34]);
      s += c.fo === 1 ? c.boite(14, 8, 30, 84, cz - 36, cz + 36, UNI(G('bois'), G('boisH'), G('boisS'))) : c.tube([14, 46, cz], [30, 46, cz], 38, G('bois'), G('boisH'), G('boisH'));
      return [N(s + c.sur(emo(60, 14, 18, '💫'), cz))];
    }
    if(c.fo === 1){        /* carré, quatre pieds écartés */
      var pieds4 = [[16, 76], [70, 76], [16, 4], [70, 4]];
      pieds4.forEach(function(q, i){ var a = [q[0] < 43 ? 14 : 72, 84, q[1] > 40 ? 78 : 2]; s += c.ligne([[q[0], 26, q[1]], a], K, 10) + c.ligne([[q[0], 26, q[1]], a], '#b06f3e', 5); if(i === 1) s += c.ligne([[15, 62, 3], [71, 62, 3]], K, 7) + c.ligne([[15, 62, 3], [71, 62, 3]], '#d29a5e', 3); });
      return [N(s + c.boite(8, 16, 78, 28, 2, c.p - 2, UNI(G('bois'), G('boisH'), G('boisS'))))];
    }
    if(c.fo === 2){        /* pouf rembourré */
      var p = palette(c, ['#9d6ee3', '#c9a8ff', '#5f3fa8']);
      s += c.tour(43, cz, [[24, 34], [40, 38], [64, 38], [84, 32]], p[0], p[1]) + c.arcAvant(43, cz, 38, 52, p[2], 3) + c.disque(43, cz, 4, 23, '#fff2c4', ' stroke-width="3"');
      return [N(s)];
    }
    /* rond, trois pieds */
    [[43, 30, 70], [16, 84, 18], [70, 84, 18]].forEach(function(q, i){
      var a = i === 0 ? [43, 84, 76] : [q[0], q[1], q[2] - 12], b = [i === 0 ? 43 : (q[0] < 43 ? 28 : 58), 28, i === 0 ? 58 : 30];
      if(i === 0){ s += c.ligne([b, a], K, 11) + c.ligne([b, a], '#b06f3e', 5); }
      else { s += c.ligne([b, a], K, 11) + c.ligne([b, a], '#b06f3e', 5); }
    });
    s += c.cylindre(43, cz, 36, 20, 30, G('bois'), G('boisH'));
    return [N(s + c.dessus(reflet('M24,-14 C34,-20 52,-20 62,-16', 3), 20, cz))];
  }});

/* Le tapis est couché sur le plancher : on le voit de haut, il fuit vers le fond comme les planches */
var TAPIS = [['#d9544f', '#f5b945', '#8a2f3a'], ['#4f73d9', '#8ff3ff', '#2a3a7d'], ['#3f9a6a', '#ffd36a', '#1f5a3c']];
def('tapis', {w:304, h:4, p:190, z:'tapis', deco:true, nf:3, nom:'Tapis', ic:'🟥',
  d:function(c){
    var p = palette(c, TAPIS[c.fo]), W = c.cat.w, D = c.p, art;
    if(c.fo === 2){        /* rond, avec des fleurs (un ovale couché) */
      var fl = '';
      for(var k = 0; k < 8; k++){ var a2 = k / 8 * Math.PI * 2, fx = W / 2 + Math.cos(a2) * 112, fy = D / 2 + Math.sin(a2) * 66; fl += Cir(f1(fx), f1(fy), 11, p[1], ' stroke-width="3"') + Cir(f1(fx), f1(fy), 4, p[2], ' stroke-width="0"'); }
      art = Ell(W / 2, D / 2, W / 2 - 4, D / 2 - 4, p[0]) + Ell(W / 2, D / 2, W / 2 - 34, D / 2 - 26, 'none', ' stroke-width="4" stroke-dasharray="12 9" opacity=".7"') + Ell(W / 2, D / 2, 46, 28, p[1], ' stroke-width="4"') + fl;
      return [N(c.surPlan(art, [0, 0, D], [1, 0, 0], [0, 0, -1], W / 2, D / 2))];
    }
    var fr = '';
    for(var y = 12; y < D - 6; y += 14) fr += 'M-12,' + y + ' H4 M' + (W - 4) + ',' + y + ' H' + (W + 12) + ' ';
    if(c.fo === 1){        /* à rayures */
      var r = '';
      for(var i = 0; i < 6; i++) r += '<rect x="4" y="' + (14 + i * 30) + '" width="' + (W - 8) + '" height="14" fill="' + p[1] + '" opacity=".9"/>';
      art = T(fr, '#f3e7cb', 4) + R(4, 4, W - 8, D - 8, 6, p[0]) + r + R(4, 4, W - 8, D - 8, 6, 'none');
    } else {
      art = T(fr, '#f3e7cb', 4) + R(4, 4, W - 8, D - 8, 6, p[0]) + R(24, 22, W - 48, D - 44, 4, 'none', ' stroke="' + p[1] + '" stroke-width="5" stroke-dasharray="14 9"') +
        P('M' + (W / 2) + ',' + (D / 2 - 56) + ' L' + (W / 2 + 80) + ',' + (D / 2) + ' L' + (W / 2) + ',' + (D / 2 + 56) + ' L' + (W / 2 - 80) + ',' + (D / 2) + ' Z', p[1], ' stroke-width="4"') +
        P('M' + (W / 2) + ',' + (D / 2 - 28) + ' L' + (W / 2 + 40) + ',' + (D / 2) + ' L' + (W / 2) + ',' + (D / 2 + 28) + ' L' + (W / 2 - 40) + ',' + (D / 2) + ' Z', p[2], ' stroke-width="4"') +
        Cir(52, D / 2, 9, p[1]) + Cir(W - 52, D / 2, 9, p[1]);
    }
    return [N(c.surPlan(art, [0, 0, D], [1, 0, 0], [0, 0, -1], W / 2, D / 2))];
  }});

/* La lampe se touche pour l'allumer */
def('lampe', {w:64, h:106, p:46, z:'petit', deco:true, rangeable:true, nom:'Lampe à huile', ic:'🪔',
  d:function(c){
    var on = c.o.on !== 0, cz = 23;
    var s = (on ? c.sur('<circle class="at-halo" cx="32" cy="40" r="74" fill="' + G('halo') + '"/>', cz) : '') +
      c.tour(32, cz, [[94, 13], [104, 22]], G('cuivre'), G('cuivre')) + c.cylindre(32, cz, 4, 74, 96, G('cuivre'), null) +
      c.tour(32, cz, [[60, 10], [64, 19], [70, 21], [76, 19], [80, 9]], G('cuivre'), null) +
      c.tour(32, cz, [[20, 7], [30, 10], [44, 14], [56, 12], [62, 9]], G('verre'), null, ' stroke-width="4"') +
      c.sur(on ? '<path class="at-flamme" d="M32,54 C24,46 28,38 32,27 C36,38 40,46 32,54 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>' : T('M32,54 V44', K, 3), cz) +
      c.cylindre(32, cz, 8, 10, 20, G('metal'), '#6a6290') + c.sur(reflet('M24,30 C22,40 23,50 26,56', 3), cz - 12);
    return [N(s)];
  }});

/* Les plantes : un pot de terre (on voit la terre dedans), la plante qui en sort */
var BOUTONS = ['#8ff3ff', '#ff8fb3', '#ffd36a'];
def('plante', {w:96, h:146, p:66, z:'petit', deco:true, nf:3, nom:'Plante', ic:'🪴',
  d:function(c){
    var cz = 33, fleur = coulTh(c, BOUTONS[c.fo]), pl;
    var pot = c.cylindre(48, cz, 26, 98, 144, G('terre'), null, '', 18) + c.cylindre(48, cz, 32, 86, 100, G('terre'), G('terre')) + c.disque(48, cz, 26, 88, '#5a3a22', ' stroke-width="3"');
    if(c.fo === 1){        /* cactus fleuri */
      pl = P('M38,92 C34,60 36,30 48,22 C60,30 62,60 58,92 Z', G('vert')) + P('M38,70 C24,70 18,58 20,44 C26,44 30,52 38,56 Z', G('vert')) + P('M58,64 C72,64 78,52 76,40 C70,40 66,48 58,50 Z', G('vert')) +
        T('M44,30 V86 M52,30 V86', '#25703c', 2) + T('M42,40 l-5,-2 M54,48 l5,-2 M42,64 l-5,-2 M54,74 l5,-2', '#fff6d8', 1.5) +
        '<g class="at-lueur">' + Cir(48, 18, 8, fleur) + Cir(48, 18, 3, '#fff2c4', ' stroke-width="0"') + '</g>';
    } else if(c.fo === 2){ /* buisson de fleurs */
      var fl = '';
      [[30, 50], [52, 34], [70, 54], [42, 70], [62, 74], [24, 72]].forEach(function(q){ fl += Cir(q[0], q[1], 8, fleur, ' stroke-width="3"') + Cir(q[0], q[1], 3, '#fff2c4', ' stroke-width="0"'); });
      pl = P('M14,90 C2,64 18,30 48,26 C78,30 94,64 82,90 Z', G('vert')) + T('M30,80 C36,60 46,48 48,30 M66,82 C60,64 54,52 50,40', '#25703c', 2.5) + fl;
    } else {
      pl = '<g class="at-feuilles">' +
        P('M48,92 C30,82 12,62 16,36 C34,46 44,66 48,92 Z', G('vert')) +
        P('M48,92 C64,80 84,60 82,30 C62,42 52,64 48,92 Z', G('vert')) +
        P('M48,93 C40,72 38,40 50,10 C62,40 58,72 48,93 Z', G('vert')) +
        T('M48,90 C44,70 46,40 50,16 M48,90 C38,76 26,58 20,42 M48,90 C60,76 74,56 78,36', '#25703c', 2.5) +
        '<circle class="at-lueur" cx="50" cy="12" r="7" fill="' + fleur + '" stroke="' + K + '" stroke-width="3"/></g>';
    }
    return [N(pot + c.sur(pl, cz) + c.sur(reflet('M28,106 L33,136', 3), cz - 24))];
  }});

/* Ce qui est plat (tableau, horloge, guirlande, fanions…) est collé sur son mur : de biais sur un mur de côté */
def('tableau', {w:146, h:114, p:10, z:'mur', deco:true, nf:3, nom:'Tableau', ic:'🖼️',
  d:function(c){
    var v = c.fo, art, ciel = c.ti ? sombre(THEMES[c.ti].c, 0.55) : null;
    if(v === 0) art = '<rect x="20" y="22" width="106" height="72" fill="' + (ciel || '#1d2550') + '"/><circle cx="102" cy="40" r="10" fill="#ffe9a3"/>' +
      '<path d="M20,80 C40,62 58,72 78,62 C98,52 114,64 126,58 L126,94 L20,94 Z" fill="#2f5a4a"/><rect x="42" y="50" width="12" height="30" fill="#4b3a6a"/><path d="M40,52 L48,40 L56,52 Z" fill="#7d5bd0"/><rect x="46" y="58" width="4" height="6" fill="#ffd36a"/>' +
      '<circle cx="34" cy="32" r="1.6" fill="#fff"/><circle cx="70" cy="30" r="1.6" fill="#fff"/><circle cx="84" cy="46" r="1.3" fill="#fff"/>';
    else if(v === 1) art = '<rect x="20" y="22" width="106" height="72" fill="' + (c.ti ? clair(THEMES[c.ti].c, 0.55) : '#f7c98a') + '"/><circle cx="72" cy="56" r="16" fill="#ff8a5c"/><path d="M20,94 L52,48 L74,76 L94,56 L126,94 Z" fill="#6a4fa0"/><path d="M44,60 L52,48 L60,58 Z" fill="#fff"/>';
    else art = '<rect x="20" y="22" width="106" height="72" fill="' + (ciel || '#2a2147') + '"/><path d="M62,44 L62,34 L84,34 L84,44 C98,50 100,80 73,86 C46,80 48,50 62,44 Z" fill="#8ff3ff" stroke="#24182e" stroke-width="3"/><circle cx="68" cy="64" r="4" fill="#fff" opacity=".7"/><circle cx="40" cy="36" r="2" fill="#ffe9a3"/><circle cx="106" cy="76" r="2" fill="#ffe9a3"/>';
    var s = c.sur(T('M46,10 L73,-6 L100,10', K, 3), c.p);
    if(v === 1) return [N(s + c.sur(Ell(73, 58, 66, 50, '#9a6a1c'), c.p) + c.sur(Ell(73, 58, 66, 50, G('or')) + '<g clip-path="url(#atg-ov)">' + art + '</g>' + Ell(73, 58, 54, 39, 'none', ' stroke-width="3"') + reflet('M28,40 C34,26 50,16 70,14', 3), 0))];
    if(v === 2) return [N(s + c.tube([73, 58, c.p], [73, 58, 0], 54, '#9a6a1c', null, null) + c.sur(Cir(73, 58, 54, G('or')) + '<g clip-path="url(#atg-rd)">' + art + '</g>' + Cir(73, 58, 43, 'none', ' stroke-width="3"') + reflet('M36,34 C44,22 58,16 72,16', 3), 0))];
    return [N(s + c.boite(6, 8, 140, 108, 0, c.p, UNI(G('or'), '#f7d778', '#9a6a1c')) + c.sur(R(17, 19, 112, 78, 3, '#1d2550', ' stroke-width="3"') + art + T('M20,22 H126 V94 H20 Z', K, 3) + reflet('M14,16 H130', 3), 0))];
  }});

/* L'horloge est de la décoration : un toucher, un autre style */
def('horloge', {w:94, h:158, p:30, z:'mur', deco:true, nf:3, nom:'Horloge', ic:'🕰️',
  d:function(c){
    var P2 = c.p, cad = function(cx, cy, r){
      var t = '';
      for(var i = 0; i < 12; i++){ var a = i * Math.PI / 6; t += 'M' + (cx + Math.sin(a) * (r - 5)).toFixed(1) + ',' + (cy - Math.cos(a) * (r - 5)).toFixed(1) + ' L' + (cx + Math.sin(a) * (r - 2)).toFixed(1) + ',' + (cy - Math.cos(a) * (r - 2)).toFixed(1) + ' '; }
      return Cir(cx, cy, r, '#f6ecd2', ' stroke-width="3"') + T(t, K, 2) +
        '<line class="at-aig-h" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r * 0.52) + '" stroke="' + K + '" stroke-width="4" stroke-linecap="round"/>' +
        '<line class="at-aig-m" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r * 0.8) + '" stroke="' + K + '" stroke-width="2.5" stroke-linecap="round"/>' + Cir(cx, cy, 3, K);
    };
    if(c.fo === 1) return [N(c.tube([47, 52, P2 - 8], [47, 52, 0], 44, G('boisS'), null, G('bois')) + c.sur(cad(47, 52, 34) + reflet('M14,40 C18,24 30,14 44,12', 3), -1))];
    if(c.fo === 2){        /* coucou */
      var s = c.boite(12, 42, 82, 114, 0, P2, BOIS()) + c.poly([[4, 46, -4], [47, 6, -4], [90, 46, -4]], G('boisS')) +
        c.plan([[4, 46, -4], [47, 6, -4], [47, 6, P2], [4, 46, P2]], [-40, -43, 0], G('boisS')) + c.plan([[47, 6, -4], [90, 46, -4], [90, 46, P2], [47, 6, P2]], [40, -43, 0], G('boisS'));
      return [N(s + c.sur(R(38, 48, 18, 16, 4, '#2a1d14', ' stroke-width="3"') + emo(47, 57, 12, '🐦') + cad(47, 88, 20) + T('M8,46 C20,52 30,44 47,50 C64,44 74,52 86,46', '#4fb45f', 4), 0) +
        c.ligne([[30, 114, 12], [30, 146, 12]], '#5a4630', 2.5) + c.ligne([[64, 114, 12], [64, 138, 12]], '#5a4630', 2.5) + c.tube([30, 140, 12], [30, 156, 12], 6, G('or'), G('or'), G('or')) + c.tube([64, 132, 12], [64, 148, 12], 6, G('or'), G('or'), G('or')))];
    }
    return [N(c.boite(20, 50, 74, 152, 0, P2, BOIS()) + c.tube([47, 42, P2], [47, 42, 0], 34, G('boisS'), null, G('bois')) +
      c.sur(cad(47, 42, 25) + R(32, 86, 30, 56, 6, '#2a1d14', ' stroke-width="4"') + '<g class="at-balancier">' + T('M47,86 L47,124', '#b8862e', 3) + Cir(47, 127, 8, G('or')) + '</g>' + reflet('M26,60 V140', 3), -1))];
  }});

def('bougies', {w:74, h:88, p:56, z:'petit', deco:true, nf:3, nom:'Bougies', ic:'🕯️',
  d:function(c){
    function fl(x, y, d){ return '<path class="at-flamme" style="animation-delay:' + d + 's" d="M' + x + ',' + y + ' c-5,-6 -3,-12 0,-18 c3,6 5,12 0,18 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>'; }
    var cire = palette(c, ['#f6ecd2', '#fff8e8', '#ffe3a3']), cz = 28, halo = c.sur('<circle class="at-halo" cx="37" cy="30" r="50" fill="' + G('halo') + '"/>', cz);
    function bougie(x, z, r, yh, col, d){ return c.cylindre(x, z, r, yh, 82, col, clair(col, 0.35), ' stroke-width="3.5"') + c.sur(T('M' + x + ',' + yh + ' V' + (yh - 4), K, 2) + fl(x, yh - 4, d), z); }
    if(c.fo === 1){        /* une bougie dans un pot de verre */
      return [N(halo + c.cylindre(37, cz, 22, 34, 86, G('verre'), null, ' stroke-width="4"') + bougie(37, cz, 13, 54, cire[0], 0) + c.cylindre(37, cz, 23, 30, 38, G('cuivre'), null, ' stroke-width="3"'))];
    }
    if(c.fo === 2){        /* chandelier à trois branches */
      return [N(halo + c.tour(37, cz, [[80, 8], [86, 20]], G('or'), G('or')) + c.cylindre(37, cz, 3, 46, 82, G('or'), null, ' stroke-width="3"') +
        c.sur(T('M12,50 C12,62 62,62 62,50', K, 6) + T('M12,50 C12,62 62,62 62,50', '#f5b945', 3), cz) +
        c.cylindre(12, cz, 5, 32, 52, cire[0], clair(cire[0], 0.35), ' stroke-width="3"') + c.cylindre(37, cz, 5, 24, 48, cire[2], clair(cire[2], 0.35), ' stroke-width="3"') + c.cylindre(62, cz, 5, 32, 52, cire[0], clair(cire[0], 0.35), ' stroke-width="3"') +
        c.sur(fl(12, 30, 0) + fl(37, 22, 0.3) + fl(62, 30, 0.6), cz))];
    }
    return [N(halo + c.cylindre(37, cz, 32, 80, 86, G('cuivre'), G('cuivre')) + bougie(22, cz + 10, 7, 44, cire[0], 0) + bougie(52, cz + 8, 7, 52, cire[0], 0.6) + bougie(37, cz - 8, 7, 32, cire[2], 0.3))];
  }});

var COUSSINS = ['#9d6ee3', '#ef7fa8', '#5fcf86'];
def('coussin', {w:126, h:66, p:110, z:'sol', deco:true, nf:3, nom:'Coussin', ic:'🟣', surf:[{x0:-22, x1:22, y:-42, z:55}],     /* (17 novembre : Mimi peut s'y coucher) */
  d:function(c){
    var p = palette(c, [COUSSINS[c.fo], clair(COUSSINS[c.fo], 0.5), sombre(COUSSINS[c.fo], 0.35)]), cz = c.p / 2;
    if(c.fo === 2){        /* un cœur debout */
      var coeur = 'M63,62 C20,44 6,26 18,14 C30,2 52,8 63,24 C74,8 96,2 108,14 C120,26 106,44 63,62 Z';
      return [N(c.sur(P(coeur, p[2]), cz + 10) + c.sur(P(coeur, p[0]) + T('M30,20 C36,14 46,14 52,20', '#fff', 4, ' opacity=".5"'), cz - 10))];
    }
    /* un gros coussin moelleux posé par terre : ses coins arrondis */
    var haut = [], tout = [], y0 = 22, y1 = 64;
    [[10, 8], [63, 2], [116, 8], [122, cz], [116, c.p - 8], [63, c.p - 2], [10, c.p - 8], [4, cz]].forEach(function(q){ haut.push(c.Q(q[0], y0 + (q[1] === cz ? 6 : 0), q[1])); tout.push(c.Q(q[0], y0, q[1]), c.Q(q[0], y1, q[1])); });
    var s = P(lisse(enveloppe(tout), true, 0.9), p[2]) + P(lisse(haut, true), p[0]);
    if(c.fo === 1) s += c.dessus(R(30, -30, 66, 60, 10, p[1], ' stroke-width="3"') + reflet('M24,-40 H70', 4), y0, cz) +
      c.ligne([[10, y0, 8], [-2, y0 - 6, -2]], p[2], 4) + c.ligne([[116, y0, 8], [128, y0 - 6, -2]], p[2], 4);
    else s += c.dessus(T('M40,-24 l5,6 M86,-24 l-5,6 M63,-34 v7 M40,24 l5,-5 M86,24 l-5,-5', K, 2.2) + Cir(63, 0, 6, '#fff2c4') + reflet('M24,-30 C34,-38 50,-40 62,-40', 4), y0 + 4, cz);
    return [N(s)];
  }});

def('guirlande', {w:266, h:74, p:8, z:'mur', deco:true, nf:3, nom:'Guirlande', ic:'✨',
  d:function(c){
    var pts = [[30, 24], [60, 36], [92, 39], [118, 31], [148, 31], [174, 39], [206, 36], [236, 24]], cols = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.55), sombre(THEMES[c.ti].c, 0.1)] : ['#8ff3ff', '#ffd36a', '#ff8fb3'], s = '';
    pts.forEach(function(p, i){
      var x = p[0], y = p[1] + 13, col = cols[i % 3], st = ' class="at-ampoule" style="animation-delay:' + (i * 0.25) + 's"';
      s += R(x - 4, p[1] - 2, 8, 7, 2, '#5a4630', ' stroke-width="2.5"');
      if(c.fo === 1) s += '<path' + st + ' d="M' + x + ',' + (y - 10) + ' L' + (x + 3) + ',' + (y - 3) + ' L' + (x + 10) + ',' + (y - 3) + ' L' + (x + 4) + ',' + (y + 2) + ' L' + (x + 7) + ',' + (y + 10) + ' L' + x + ',' + (y + 5) + ' L' + (x - 7) + ',' + (y + 10) + ' L' + (x - 4) + ',' + (y + 2) + ' L' + (x - 10) + ',' + (y - 3) + ' L' + (x - 3) + ',' + (y - 3) + ' Z" fill="' + col + '" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>';
      else if(c.fo === 2) s += '<path' + st + ' d="M' + x + ',' + (y + 9) + ' C' + (x - 12) + ',' + (y + 1) + ' ' + (x - 10) + ',' + (y - 10) + ' ' + x + ',' + (y - 4) + ' C' + (x + 10) + ',' + (y - 10) + ' ' + (x + 12) + ',' + (y + 1) + ' ' + x + ',' + (y + 9) + ' Z" fill="' + col + '" stroke="' + K + '" stroke-width="2.5"/>';
      else s += '<circle' + st + ' cx="' + x + '" cy="' + y + '" r="8" fill="' + col + '" stroke="' + K + '" stroke-width="3"/>';
    });
    return [N(c.sur(Cir(6, 10, 4, '#cfc9e6') + Cir(260, 10, 4, '#cfc9e6') + T('M6,10 C60,50 100,50 133,26 C166,50 206,50 260,10', '#5a4630', 3) + s, 2))];
  }});

def('herbes', {w:126, h:136, p:26, z:'mur', deco:true, nom:'Herbes séchées', ic:'🌾',
  d:function(c){
    var cols = c.ti ? [[THEMES[c.ti].c, sombre(THEMES[c.ti].c, 0.3)], [clair(THEMES[c.ti].c, 0.35), THEMES[c.ti].c], [sombre(THEMES[c.ti].c, 0.15), sombre(THEMES[c.ti].c, 0.45)]] :
      [['#a77bf0', '#7d5bd0'], ['#4fb45f', '#25703c'], ['#ffd84a', '#c9a227']];
    function bouquet(x, c1, c2){
      return T('M' + x + ',18 V32', '#5a4630', 2.5) + R(x - 6, 28, 12, 8, 3, '#c58a4a', ' stroke-width="2.5"') +
        P('M' + (x - 12) + ',36 C' + (x - 18) + ',70 ' + (x - 8) + ',100 ' + x + ',128 C' + (x + 8) + ',100 ' + (x + 18) + ',70 ' + (x + 12) + ',36 Z', c1) +
        T('M' + x + ',40 V118 M' + (x - 6) + ',50 L' + x + ',66 M' + (x + 6) + ',56 L' + x + ',72 M' + (x - 6) + ',80 L' + x + ',94', c2, 2.5);
    }
    return [N(c.boite(6, 6, 120, 18, 0, c.p, BOIS()) + c.sur(bouquet(30, cols[0][0], cols[0][1]) + bouquet(63, cols[1][0], cols[1][1]) + bouquet(96, cols[2][0], cols[2][1]), 8))];
  }});

/* ---------- La nouvelle décoration (dans les cartons cadeaux) ---------- */
def('fanions', {w:270, h:86, p:6, z:'mur', deco:true, nf:3, nom:'Fanions', ic:'🎏',
  d:function(c){
    var cols = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.5), sombre(THEMES[c.ti].c, 0.2)] : ['#ff8fb3', '#ffd36a', '#8ff3ff', '#a6ef93', '#b796ff'], s = '';
    for(var i = 0; i < 8; i++){
      var x = 24 + i * 31, y = 14 + Math.sin((i + 0.5) / 8 * Math.PI) * 22, col = cols[i % cols.length];
      if(c.fo === 1) s += Cir(x, y + 14, 11, col, ' stroke-width="3"') + Cir(x, y + 14, 4, '#fff6d8', ' stroke-width="0"');
      else if(c.fo === 2) s += P('M' + (x - 12) + ',' + y + ' L' + (x + 12) + ',' + y + ' L' + (x + 12) + ',' + (y + 28) + ' L' + x + ',' + (y + 20) + ' L' + (x - 12) + ',' + (y + 28) + ' Z', col, ' stroke-width="3"');
      else s += P('M' + (x - 13) + ',' + y + ' L' + (x + 13) + ',' + y + ' L' + x + ',' + (y + 34) + ' Z', col, ' stroke-width="3"');
    }
    return [N(c.sur(Cir(6, 10, 4, '#cfc9e6') + Cir(264, 10, 4, '#cfc9e6') + T('M6,10 C70,48 200,48 264,10', '#5a4630', 3) + s, 2))];
  }});

def('cadre', {w:66, h:82, p:40, z:'petit', deco:true, nf:3, nom:'Petit cadre', ic:'🖼️',
  d:function(c){
    var fond = c.ti ? clair(THEMES[c.ti].c, 0.6) : '#bff3ff', img, cadre, dos;
    if(c.fo === 1){ img = emo(33, 38, 26, '❤️'); dos = Ell(33, 40, 28, 34, '#9a6a1c'); cadre = Ell(33, 40, 28, 34, G('or')) + Ell(33, 40, 20, 25, fond, ' stroke-width="3"'); }
    else if(c.fo === 2){ img = emo(33, 40, 24, '⭐'); var et = 'M33,4 L42,26 L64,28 L47,44 L52,68 L33,56 L14,68 L19,44 L2,28 L24,26 Z'; dos = P(et, '#9a6a1c'); cadre = P(et, G('or')) + Cir(33, 40, 15, fond, ' stroke-width="3"'); }
    else { img = emo(33, 40, 28, '🐱'); dos = R(6, 6, 54, 66, 6, '#9a6a1c'); cadre = R(6, 6, 54, 66, 6, G('or')) + R(13, 13, 40, 50, 3, fond, ' stroke-width="3"'); }
    /* debout, un peu penché en arrière sur sa béquille */
    var s = c.ligne([[33, 42, 24], [33, 82, 38]], K, 7) + c.ligne([[33, 42, 24], [33, 82, 38]], '#94603a', 3);
    s += c.surPlan(dos, [0, 2, 34.4], [1, 0, 0], [0, 1, -0.18], 33, 40) + c.surPlan(cadre + img, [0, 2, 28.4], [1, 0, 0], [0, 1, -0.18], 33, 40);
    return [N(s)];
  }});

def('vase', {w:66, h:114, p:56, z:'petit', deco:true, nf:3, nom:'Vase de fleurs', ic:'💐',
  d:function(c){
    var p = palette(c, ['#ff8fb3', '#ffd6e6', '#c0397a']), vase = c.ti ? THEMES[c.ti].c : '#8ff3ff', fl = '', cz = 28;
    if(c.fo === 1){        /* un tournesol */
      for(var i = 0; i < 10; i++){ var a = i / 10 * Math.PI * 2; fl += Ell((33 + Math.cos(a) * 15).toFixed(1), (24 + Math.sin(a) * 15).toFixed(1), 6, 6, c.ti ? p[0] : '#ffd84a', ' stroke-width="2.5"'); }
      fl = T('M33,40 V74', '#25703c', 4) + P('M33,64 C22,56 16,60 14,66 C22,70 28,68 33,64 Z', G('vert'), ' stroke-width="2.5"') + fl + Cir(33, 24, 10, '#7a4524', ' stroke-width="3"');
    } else if(c.fo === 2){ /* des marguerites */
      [[18, 30], [33, 18], [48, 32]].forEach(function(q){ for(var j = 0; j < 6; j++){ var b = j / 6 * Math.PI * 2; fl += Ell((q[0] + Math.cos(b) * 6).toFixed(1), (q[1] + Math.sin(b) * 6).toFixed(1), 4, 4, c.ti ? p[1] : '#ffffff', ' stroke-width="2"'); } fl += Cir(q[0], q[1], 3.5, '#ffd84a', ' stroke-width="2"'); });
      fl = T('M18,36 L28,74 M33,24 L33,74 M48,38 L38,74', '#25703c', 3) + fl;
    } else {               /* des tulipes */
      fl = T('M20,40 L28,74 M33,30 L33,74 M46,40 L38,74', '#25703c', 3.5);
      [[20, 34], [33, 24], [46, 34]].forEach(function(q){ fl += P('M' + (q[0] - 8) + ',' + (q[1] - 10) + ' L' + (q[0] - 4) + ',' + (q[1] - 4) + ' L' + q[0] + ',' + (q[1] - 12) + ' L' + (q[0] + 4) + ',' + (q[1] - 4) + ' L' + (q[0] + 8) + ',' + (q[1] - 10) + ' C' + (q[0] + 9) + ',' + (q[1] + 4) + ' ' + (q[0] - 9) + ',' + (q[1] + 4) + ' ' + (q[0] - 8) + ',' + (q[1] - 10) + ' Z', p[0], ' stroke-width="2.5"'); });
    }
    var s = c.tour(33, cz, [[76, 15], [84, 18], [94, 21], [104, 19], [110, 15], [114, 11]], vase, null) + c.cylindre(33, cz, 17, 70, 78, clair(vase, 0.35), '#24405a', ' stroke-width="3"');
    return [N(s + c.sur(fl, cz) + c.sur(reflet('M20,86 C18,94 20,102 24,106', 3), cz - 18))];
  }});

def('lanterne', {w:86, h:152, p:60, z:'mur', deco:true, nf:3, lumiere:true, nom:'Lanterne', ic:'🏮',
  d:function(c){
    var col = c.ti ? THEMES[c.ti].c : '#ff8a5c', cz = 30, P2 = c.p;
    var s = c.sur('<circle class="at-halo" cx="43" cy="84" r="62" fill="' + G('halo') + '"/>', cz) + c.sur(Cir(43, 0, 4, '#cfc9e6'), P2) + c.ligne([[43, 0, P2], [43, 20, cz + 10], [43, 26, cz]], '#5a4630', 3);
    if(c.fo === 1){        /* lanterne étoile, épaisse */
      var et = 'M43,30 L54,62 L86,64 L60,84 L70,116 L43,96 L16,116 L26,84 L0,64 L32,62 Z';
      s += c.sur(P(et, sombre(col, 0.35)), cz + 8) + c.sur(P(et, col) + P('M43,52 L48,68 L64,69 L51,78 L56,94 L43,84 L30,94 L35,78 L22,69 L38,68 Z', '#fff3c4', ' stroke-width="2"'), cz - 8);
    } else if(c.fo === 2){ /* lampe lune */
      var lune = 'M62,40 C30,36 14,70 26,98 C38,124 74,128 84,104 C64,112 40,100 38,76 C36,58 46,46 62,40 Z';
      s += c.sur(P(lune, '#d8c88a'), cz + 8) + c.sur(P(lune, '#fff3c4') + Cir(58, 60, 4, col, ' stroke-width="2"') + Cir(72, 84, 3, col, ' stroke-width="2"'), cz - 8);
    } else {               /* lanterne de papier ronde */
      s += c.cylindre(43, cz, 14, 24, 34, sombre(col, 0.35), sombre(col, 0.2), ' stroke-width="3"') +
        c.tour(43, cz, [[34, 22], [46, 33], [62, 38], [80, 39], [98, 37], [114, 30], [126, 20]], col, null);
      for(var y = 56; y <= 106; y += 25) s += c.arcAvant(43, cz, (y === 81 ? 39.5 : 37), y, sombre(col, 0.3), 2.5);
      s += c.sur(T('M43,34 C30,60 30,100 43,126 M43,34 C56,60 56,100 43,126', sombre(col, 0.3), 2.5) + reflet('M16,64 C14,74 14,86 18,96', 4), cz - 38) +
        c.cylindre(43, cz, 14, 124, 134, sombre(col, 0.35), null, ' stroke-width="3"') + c.sur(T('M43,134 V150', '#f5b945', 3), cz);
    }
    return [N(s)];
  }});

/* ==========================================================
   La chambre : ses meubles et sa décoration (étape 2), dans la même perspective que tout le reste.
   Tout se décore au toucher (c.fo : la forme, c.ti : le thème) et se range dans le carton 📦.
   chambre:true : sort d'un carton posé dans la chambre (et s'y installe) ; on peut ensuite le mettre où l'on veut, même dans l'atelier.
   ========================================================== */
function etoile(cx, cy, r, f, xx){
  var d = '';
  for(var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? ' L' : 'M') + f1(cx + Math.cos(a) * rr) + ',' + f1(cy + Math.sin(a) * rr); }
  return P(d + ' Z', f, xx || ' stroke-width="3"');
}
function coeurP(cx, cy, r, f, xx){
  return P('M' + cx + ',' + f1(cy + r * 0.9) + ' C' + f1(cx - r * 1.5) + ',' + f1(cy - r * 0.1) + ' ' + f1(cx - r * 0.8) + ',' + f1(cy - r * 1.2) + ' ' + cx + ',' + f1(cy - r * 0.45) +
    ' C' + f1(cx + r * 0.8) + ',' + f1(cy - r * 1.2) + ' ' + f1(cx + r * 1.5) + ',' + f1(cy - r * 0.1) + ' ' + cx + ',' + f1(cy + r * 0.9) + ' Z', f, xx || ' stroke-width="3"');
}
function nuageD(x, y, w, h){
  var r = h / 2;
  return 'M' + f1(x + r) + ',' + f1(y + h) + ' C' + f1(x - r * 0.2) + ',' + f1(y + h) + ' ' + f1(x - r * 0.1) + ',' + f1(y + r * 0.2) + ' ' + f1(x + r * 1.1) + ',' + f1(y + r * 0.5) +
    ' C' + f1(x + w * 0.3) + ',' + f1(y - r * 0.6) + ' ' + f1(x + w * 0.62) + ',' + f1(y - r * 0.5) + ' ' + f1(x + w * 0.68) + ',' + f1(y + r * 0.35) +
    ' C' + f1(x + w + r * 0.2) + ',' + f1(y + r * 0.1) + ' ' + f1(x + w + r * 0.3) + ',' + f1(y + h) + ' ' + f1(x + w - r * 0.4) + ',' + f1(y + h) + ' Z';
}
function nuageP(x, y, w, h, f, xx){ return P(nuageD(x, y, w, h), f, xx); }
/* un croissant de lune (ouvert vers la droite) */
function lune(cx, cy, r, f, xx){
  var hx = f1(cx + r * 0.5), ht = f1(cy - r * 0.866), hb = f1(cy + r * 0.866);
  return P('M' + hx + ',' + ht + ' A' + r + ',' + r + ' 0 1 0 ' + hx + ',' + hb + ' A' + f1(r * 0.95) + ',' + f1(r * 0.95) + ' 0 0 1 ' + hx + ',' + ht + ' Z', f, xx || ' stroke-width="3"');
}
/* une forme plate qui a de l'épaisseur : son dos (plus sombre) un peu derrière, puis sa face */
function epais(c, svgDos, svgFace, z, e){ return c.sur(svgDos, z + (e || 10)) + c.sur(svgFace, z); }
/* un coussin moelleux : une boîte aux coins arrondis (x0..x1, y0 le dessus, y1 le bas, z0..z1) */
function moelleux(c, x0, y0, x1, y1, z0, z1, f, fh, r){
  r = r === undefined ? 10 : r;
  var mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, haut = [], tout = [];
  [[x0 + r, z0], [mx, z0 - 2], [x1 - r, z0], [x1 + 2, mz], [x1 - r, z1], [mx, z1 + 2], [x0 + r, z1], [x0 - 2, mz]].forEach(function(q){
    haut.push(c.Q(q[0], y0, q[1])); tout.push(c.Q(q[0], y0, q[1]), c.Q(q[0], y1, q[1]));
  });
  return P(lisse(enveloppe(tout), true, 0.9), f) + P(lisse(haut, true), fh || f);
}

/* ---------- Le lit : bois, baldaquin, cabane, fer forgé, nuage ---------- */
var LITS = [['#5f8fd9', '#bcd6ff', '#2f4f8f'], ['#e86f9c', '#ffd0e2', '#9c2f5a'], ['#6cbf7a', '#d2f4d6', '#2f7a42'], ['#f2b63c', '#ffe9b0', '#a86f14'], ['#9d7ee8', '#e2d6ff', '#5a3fa8']];
def('lit', {w:330, h:220, p:250, z:'sol', deco:true, chambre:true, profil:true, nf:5, nom:'Lit', ic:'🛏️', surf:[{x0:-110, x1:110, y:-112, z:150}],
  d:function(c){
    var p = palette(c, LITS[c.fo]), P2 = c.p, f = c.fo, s = '', tete = '', pied = '';
    var FER = UNI(G('metal'), '#6a6290', '#352c4f');
    /* la tête du lit, contre le mur (au fond), selon le style */
    if(f === 0){            /* en bois, tête de lit arrondie */
      tete = c.boite(8, 40, 322, 190, P2 - 24, P2, BOIS()) + c.sur(P('M8,60 C8,10 322,10 322,60 L322,64 L8,64 Z', G('boisH')) + R(30, 70, 270, 96, 10, G('boisC'), ' stroke-width="3"') + Cir(165, 36, 7, G('or')), P2 - 24);
      pied = c.boite(8, 126, 322, 190, 0, 18, BOIS());
    } else if(f === 1){     /* à baldaquin : quatre colonnes et un ciel de lit */
      [[8, P2 - 18], [304, P2 - 18]].forEach(function(q){ s += c.boite(q[0], 0, q[0] + 18, 216, q[1], q[1] + 18, BOIS()); });
      tete = c.boite(26, 60, 304, 190, P2 - 20, P2, BOIS()) + c.sur(R(44, 76, 242, 96, 10, p[1], ' stroke-width="3"'), P2 - 20);
      pied = c.boite(8, 0, 26, 216, 0, 18, BOIS()) + c.boite(304, 0, 322, 216, 0, 18, BOIS()) + c.boite(0, -4, 330, 16, -4, P2 + 4, UNI(p[0], clair(p[0], 0.2), sombre(p[0], 0.2))) +
        c.sur(P('M0,16 L330,16 L330,30 C300,46 272,30 246,46 C220,30 192,46 166,30 C138,46 112,30 84,46 C58,30 30,46 0,30 Z', p[0]), -4);
    } else if(f === 2){     /* lit-cabane : un toit de poutres au-dessus */
      var poutre = function(a, b){ return c.ligne([a, b], K, 14) + c.ligne([a, b], '#c98450', 8); };
      s += poutre([18, 190, P2 - 8], [18, 70, P2 - 8]) + poutre([312, 190, P2 - 8], [312, 70, P2 - 8]) + poutre([18, 70, P2 - 8], [165, -6, P2 - 8]) + poutre([312, 70, P2 - 8], [165, -6, P2 - 8]) + poutre([165, -6, P2 - 8], [165, -6, 8]);
      tete = c.boite(26, 90, 304, 190, P2 - 20, P2, BOIS()) + c.sur(etoile(165, 60, 14, '#fff3c4'), P2 - 8);
      pied = poutre([18, 190, 8], [18, 70, 8]) + poutre([312, 190, 8], [312, 70, 8]) + poutre([18, 70, 8], [165, -6, 8]) + poutre([312, 70, 8], [165, -6, 8]);
    } else if(f === 3){     /* fer forgé, avec des boucles */
      tete = c.tube([14, 196, P2 - 10], [14, 40, P2 - 10], 7, G('metal'), null, G('or')) + c.tube([316, 196, P2 - 10], [316, 40, P2 - 10], 7, G('metal'), null, G('or')) +
        c.sur(T('M14,60 C60,20 110,90 165,50 C220,90 270,20 316,60 M14,110 C60,80 110,140 165,104 C220,140 270,80 316,110', K, 8) + T('M14,60 C60,20 110,90 165,50 C220,90 270,20 316,60 M14,110 C60,80 110,140 165,104 C220,140 270,80 316,110', '#a8a2c8', 3.5), P2 - 10);
      pied = c.tube([14, 196, 10], [14, 100, 10], 7, G('metal'), null, G('or')) + c.tube([316, 196, 10], [316, 100, 10], 7, G('metal'), null, G('or')) +
        c.sur(T('M14,120 C90,96 240,96 316,120', K, 8) + T('M14,120 C90,96 240,96 316,120', '#a8a2c8', 3.5), 10);
    } else {                /* lit-nuage, avec des étoiles */
      tete = epais(c, nuageP(-6, 10, 342, 150, sombre(p[1], 0.15)), nuageP(-6, 10, 342, 150, p[1], ' stroke-width="5"') + etoile(60, 60, 13, '#fff3c4') + etoile(270, 44, 9, '#fff3c4') + lune(160, 54, 16, '#fff3c4'), P2 - 16, 10);
      pied = epais(c, nuageP(0, 110, 330, 70, sombre(p[1], 0.15)), nuageP(0, 110, 330, 70, p[1], ' stroke-width="5"'), 0, 10);
    }
    /* le cadre et ses pieds, le matelas, l'oreiller, la couette */
    var cadre = (f === 3 ? FER : BOIS());
    s += tete + pieds(c, 20, 310, 186, 220, 14, P2 - 14, 18, f === 3 ? FER : SOMBRE()) + c.boite(16, 150, 314, 190, 10, P2 - 10, cadre) +
      c.boite(24, 118, 306, 152, 14, P2 - 22, UNI('#f6ecd2', '#fffaf0', '#e4d6b4')) +
      moelleux(c, 60, 104, 270, 120, P2 - 80, P2 - 30, '#e9e0c8', '#fffaf0', 18) +
      c.boite(20, 110, 310, 158, 8, P2 - 96, UNI(p[0], clair(p[0], 0.18), sombre(p[0], 0.22))) +
      c.boite(20, 104, 310, 112, P2 - 112, P2 - 96, UNI(clair(p[0], 0.5), '#fffaf0', clair(p[0], 0.3)));
    var motif = '';
    if(f === 0) for(var i = 0; i < 5; i++) for(var j = 0; j < 3; j++) if((i + j) % 2) motif += '<rect x="' + (30 + i * 54) + '" y="' + (-60 + j * 40) + '" width="52" height="38" rx="5" fill="' + p[1] + '" opacity=".75"/>';
    if(f === 1 || f === 3) motif = T('M30,-40 C110,-50 220,-50 300,-40 M30,10 C110,0 220,0 300,10', p[1], 5, ' stroke-dasharray="12 9"');
    if(f === 2) for(var k = 0; k < 6; k++) motif += Cir(50 + k * 46, -30 + (k % 2) * 34, 8, p[1], ' stroke-width="2.5"');
    if(f === 4) motif = lune(110, -16, 14, p[1], ' stroke-width="2.5"') + etoile(190, -36, 11, '#fff3c4', ' stroke-width="2.5"') + etoile(250, 10, 8, '#fff3c4', ' stroke-width="2.5"');
    s += c.dessus(motif, 110, (P2 - 88) / 2) + c.sur(T('M24,130 H306', sombre(p[0], 0.35), 3, ' opacity=".5"'), 8);
    return [N(s + pied)];
  }});

/* ---------- Le grand tapis : rond à fleurs, d'Orient, étoile, arc-en-ciel, tressé (couché sur le plancher) ---------- */
var GTAPIS = [['#f06eaa', '#ffd0e2', '#a8326a'], ['#c0392b', '#f5b945', '#6b1d16'], ['#3d8ef0', '#fff3c4', '#1f4f9a'], ['#9d6ee3', '#ffd36a', '#4cbb5c'], ['#c98450', '#f3e7cb', '#7d4626']];
def('tapis_grand', {w:440, h:4, p:270, z:'tapis', deco:true, chambre:true, nf:5, nom:'Grand tapis', ic:'🟪',
  d:function(c){
    var p = palette(c, GTAPIS[c.fo]), W = 440, D = 270, cx = W / 2, cy = D / 2, s = '', i;
    if(c.fo === 0){
      var fl = '';
      for(i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2, x = cx + Math.cos(a) * 168, y = cy + Math.sin(a) * 100; fl += Cir(f1(x), f1(y), 13, p[1], ' stroke-width="3"') + Cir(f1(x), f1(y), 5, '#ffd36a', ' stroke-width="0"'); }
      s = Ell(cx, cy, 214, 130, p[0]) + Ell(cx, cy, 140, 82, p[1], ' stroke-width="3" opacity=".6"') + Ell(cx, cy, 64, 38, p[2], ' stroke-width="3"') + fl;
    } else if(c.fo === 1){
      var fr = '';
      for(var y2 = 14; y2 < D - 10; y2 += 14) fr += 'M-14,' + y2 + ' H6 M' + (W - 6) + ',' + y2 + ' H' + (W + 14) + ' ';
      s = T(fr, '#f3e7cb', 4) + R(4, 4, W - 8, D - 8, 8, p[0]) + R(30, 26, W - 60, D - 52, 6, 'none', ' stroke="' + p[1] + '" stroke-width="6" stroke-dasharray="16 10"') +
        P('M' + cx + ',' + (cy - 80) + ' L' + (cx + 110) + ',' + cy + ' L' + cx + ',' + (cy + 80) + ' L' + (cx - 110) + ',' + cy + ' Z', p[1]) + P('M' + cx + ',' + (cy - 40) + ' L' + (cx + 55) + ',' + cy + ' L' + cx + ',' + (cy + 40) + ' L' + (cx - 55) + ',' + cy + ' Z', p[2], ' stroke-width="4"') +
        Cir(70, cy, 13, p[1]) + Cir(W - 70, cy, 13, p[1]);
    } else if(c.fo === 2){
      var e = '';
      for(i = 0; i < 10; i++){ var b = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.48 : 1; e += (i ? ' L' : 'M') + f1(cx + Math.cos(b) * 214 * rr) + ',' + f1(cy + Math.sin(b) * 132 * rr); }
      s = P(e + ' Z', p[0]) + Ell(cx, cy, 56, 34, p[1], ' stroke-width="3"') + etoile(cx, cy, 22, '#fff3c4');
    } else if(c.fo === 3){
      var cols = c.ti ? [p[2], p[0], p[1], clair(p[0], 0.75)] : ['#e0443a', '#f58a2a', '#f2c230', '#4cbb5c'];
      s = Ell(cx, cy, 214, 130, c.ti ? sombre(p[0], 0.15) : '#3d8ef0');
      cols.forEach(function(col, k){ s += Ell(cx, cy, 214 - (k + 1) * 40, 130 - (k + 1) * 24, col, ' stroke-width="3"'); });
      s += nuageP(cx - 90, cy - 20, 80, 40, '#fff', ' stroke-width="3"') + nuageP(cx + 20, cy - 4, 70, 34, '#fff', ' stroke-width="3"');
    } else {
      s = Ell(cx, cy, 214, 130, p[0]);
      for(i = 1; i < 6; i++) s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (214 - i * 34) + '" ry="' + (130 - i * 21) + '" fill="none" stroke="' + (i % 2 ? p[1] : p[2]) + '" stroke-width="12" opacity=".8"/>';
    }
    return [N(c.surPlan(s, [0, 0, D], [1, 0, 0], [0, 0, -1], cx, cy))];
  }});

/* ---------- Les rideaux : devant une fenêtre (le milieu reste ouvert), collés au mur ---------- */
var RIDEAUX = [['#d9544f', '#ff9b8f', '#8a2f3a'], ['#4f73d9', '#a8c4ff', '#2a3a7d'], ['#f2b63c', '#ffe3a3', '#a86f14'], ['#f3f0ff', '#ffffff', '#b9b3d2'], ['#3a2c7a', '#8d7ae0', '#1c1340']];
def('rideaux', {w:260, h:300, p:26, z:'mur', deco:true, chambre:true, fenetre:true, nf:5, nom:'Rideaux', ic:'🪟',
  d:function(c){
    var p = palette(c, RIDEAUX[c.fo]), op = c.fo === 3 ? ' fill-opacity=".62"' : '', s = '';
    function pan(g){   /* un pan de rideau, à gauche (g) ou à droite (miroir) */
      var d, plis;
      if(c.fo === 1 || c.fo === 4){ d = 'M10,14 L78,14 C70,90 52,150 62,190 C72,230 86,262 70,296 L10,296 Z'; plis = 'M28,20 C26,110 22,190 28,290 M48,20 C46,100 40,170 46,286'; }
      else { d = 'M10,14 L74,14 C78,100 70,200 78,296 L10,296 Z'; plis = 'M28,20 V290 M48,20 C50,110 46,200 52,290'; }
      var t = P(d, p[0], op) + T(plis, p[2], 3, ' opacity=".45"');
      if(c.fo === 1) t += R(46, 182, 32, 14, 6, p[1], ' stroke-width="3"') + Cir(62, 189, 6, G('or'));
      if(c.fo === 4){ t += P('M50,180 C60,170 74,170 80,186 C70,200 58,198 50,180 Z', '#ffd36a', ' stroke-width="3"'); [[30, 60], [52, 112], [28, 160], [44, 236]].forEach(function(q){ t += etoile(q[0], q[1], 7, '#fff3c4', ' stroke-width="2"'); }); }
      if(c.fo === 3) t += T('M10,286 C20,296 30,276 40,290 C50,300 60,280 70,292', p[2], 3);
      return g ? t : '<g transform="translate(260,0) scale(-1,1)">' + t + '</g>';
    }
    s = c.sur(pan(1) + pan(0), 10);
    if(c.fo === 2){        /* une cantonnière à festons */
      var fe = 'M4,10 L256,10 L256,44';
      for(var i = 0; i < 6; i++) fe += ' C' + f1(256 - i * 42 - 8) + ',62 ' + f1(256 - i * 42 - 34) + ',62 ' + f1(256 - (i + 1) * 42) + ',44';
      s += c.boite(4, 6, 256, 14, 0, 18, UNI(p[1])) + c.sur(P(fe + ' Z', p[1]) + T('M8,24 H252', p[2], 3, ' opacity=".5"'), 0);
    }
    /* la tringle : un tube qui avance un peu du mur */
    s += c.tube([0, 14, 12], [260, 14, 12], 4.5, '#b8862e', G('or'), G('or')) + c.boule(4, 14, 12, 8, G('or')) + c.boule(256, 14, 12, 8, G('or'));
    return [N(s)];
  }});

/* ---------- Le pouf : rond, poire, cube tricoté, champignon, nuage ---------- */
var POUFS = [['#9d6ee3', '#d6c4ff', '#5f3fa8'], ['#f58a2a', '#ffd0a8', '#a8541a'], ['#4cbb5c', '#c6f0cc', '#2a7a3a'], ['#e0443a', '#ffffff', '#8a2018'], ['#8fc8ff', '#ffffff', '#4a86c8']];
def('pouf', {w:112, h:92, p:104, z:'sol', deco:true, chambre:true, nf:5, nom:'Pouf', ic:'🍄', surf:[{x0:-30, x1:30, y:-66, z:52}],
  d:function(c){
    var p = palette(c, POUFS[c.fo]), cz = c.p / 2;
    if(c.fo === 1) return [N(c.tour(56, cz, [[10, 14], [26, 34], [52, 48], [76, 50], [88, 40], [92, 26]], p[0], null) + c.sur(T('M40,22 C30,42 30,66 38,84', p[2], 3, ' opacity=".5"'), cz - 44))];
    if(c.fo === 2){
      var m = '';
      for(var y = 36; y < 88; y += 12) m += 'M14,' + y + ' q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 q7,-6 14,0 ';
      return [N(c.boite(8, 26, 104, 92, 6, c.p - 6, UNI(p[0], p[1], sombre(p[0], 0.2))) + c.sur(T(m, p[2], 2.5, ' opacity=".45"'), 6) + c.dessus(T('M-30,-30 L30,30 M30,-30 L-30,30', p[2], 3, ' opacity=".4"'), 26, cz))];
    }
    if(c.fo === 3) return [N(c.cylindre(56, cz, 18, 46, 92, '#f6ecd2', null) + c.tour(56, cz, [[12, 20], [22, 40], [36, 52], [50, 54]], p[0], null) +
      c.dessus(Cir(26, -16, 9, p[1], ' stroke-width="2.5"') + Cir(60, 14, 8, p[1], ' stroke-width="2.5"') + Cir(84, -20, 7, p[1], ' stroke-width="2.5"'), 22, cz))];
    if(c.fo === 4) return [N(epais(c, nuageP(4, 30, 104, 60, sombre(p[0], 0.18)), nuageP(4, 30, 104, 60, p[0], ' stroke-width="5"') + T('M30,62 q6,4 12,0 M68,62 q6,4 12,0', K, 2.5) + Ell(56, 72, 5, 3, '#ff9db4', ' stroke-width="0"'), cz - 14, 26))];
    return [N(c.cylindre(56, cz, 48, 30, 90, p[0], p[1]) + c.arcAvant(56, cz, 48.5, 60, p[2], 3) + c.disque(56, cz, 5, 31, p[2]))];
  }});

/* ---------- La table de chevet ---------- */
def('chevet', {w:120, h:122, p:96, z:'sol', deco:true, chambre:true, nf:5, nom:'Table de chevet', ic:'🛋️', surf:[{x0:-40, x1:40, y:-112, z:48}],
  d:function(c){
    var p = palette(c, ['#9d6ee3', '#d6c4ff', '#5f3fa8']), cz = c.p / 2;
    if(c.fo === 1) return [N(c.ovale(60, cz, 30, 24, 114, 122, G('boisS'), G('bois')) + c.cylindre(60, cz, 7, 18, 116, G('bois'), null) + c.ovale(60, cz, 56, 44, 10, 20, G('bois'), G('boisH')))];
    if(c.fo === 2) return [N(c.boite(8, 14, 112, 122, 4, c.p - 4, UNI(G('boisC'), G('boisH'), G('boisS'))) + c.sur(T('M8,50 H112 M8,86 H112 M40,14 V122 M80,14 V122', '#8a5a2a', 3, ' opacity=".55"'), 4) + c.dessus(emo(60, 0, 34, '🧸'), 14, cz))];
    if(c.fo === 3) return [N(c.cylindre(60, cz, 16, 40, 122, '#f6ecd2', null) + c.tour(60, cz, [[10, 26], [22, 48], [34, 58], [42, 60]], c.ti ? p[0] : '#e0443a', null) +
      c.dessus(Cir(30, -14, 7, '#fff') + Cir(64, 12, 6, '#fff') + Cir(92, -16, 7, '#fff'), 12, cz))];
    if(c.fo === 4) return [N(pieds(c, 18, 102, 96, 122, 10, c.p - 10, 12) + c.boite(10, 20, 110, 100, 6, c.p - 6, UNI(c.ti ? p[0] : '#ef7fa8', clair(c.ti ? p[0] : '#ef7fa8', 0.3), sombre(c.ti ? p[0] : '#ef7fa8', 0.25))) +
      c.sur(coeurP(60, 60, 18, p[1]), 6) + c.boite(4, 10, 116, 22, 0, c.p, UNI(G('boisH'), G('boisH'), G('boisS'))))];
    return [N(pieds(c, 14, 106, 104, 122, 8, c.p - 8, 12) + c.boite(8, 18, 112, 106, 4, c.p - 4, BOIS()) +
      c.sur(R(16, 30, 88, 32, 5, G('boisC'), ' stroke-width="3"') + R(16, 68, 88, 32, 5, G('boisC'), ' stroke-width="3"') + Cir(60, 46, 5, G('or')) + Cir(60, 84, 5, G('or')), 4) +
      c.boite(2, 8, 118, 20, 0, c.p, UNI(G('boisH'), G('boisH'), G('boisS'))))];
  }});

/* ---------- La lampe de chevet : elle éclaire toute seule le soir ---------- */
def('lampe_chevet', {w:72, h:104, p:60, z:'petit', deco:true, chambre:true, lumiere:true, nf:5, prefere:['chevet', 'coffre', 'table'], nom:'Lampe de chevet', ic:'💡',
  d:function(c){
    var p = palette(c, [['#f2b63c', '#ffe3a3', '#a86f14'], ['#e0443a', '#ffd0c8', '#8a2018'], ['#fff3c4', '#ffffff', '#c9a227'], ['#ffd84a', '#fff3c4', '#c9a227'], ['#bff3ff', '#ffffff', '#3fa9d6']][c.fo]);
    var cz = 30, halo = c.sur('<circle class="at-halo" cx="36" cy="40" r="66" fill="' + G('halo') + '"/>', cz);
    var pied = c.cylindre(36, cz, 20, 96, 104, G('bois'), G('boisH')) + c.cylindre(36, cz, 4, 56, 98, G('bois'), null);
    if(c.fo === 1) return [N(halo + c.cylindre(36, cz, 11, 50, 104, '#f6ecd2', null) + c.tour(36, cz, [[16, 14], [26, 26], [44, 34], [54, 35]], p[0], null) + c.dessus(Cir(22, -8, 5, '#fff') + Cir(46, 8, 5, '#fff'), 18, cz))];
    if(c.fo === 2) return [N(halo + pied + epais(c, lune(36, 34, 26, sombre(p[0], 0.2), ' stroke-width="4"'), lune(36, 34, 26, p[0], ' stroke-width="4"') + Cir(44, 30, 3, p[2], ' stroke-width="0"'), cz - 4, 8))];
    if(c.fo === 3) return [N(halo + pied + epais(c, etoile(36, 34, 30, sombre(p[0], 0.2), ' stroke-width="4"'), etoile(36, 34, 30, p[0], ' stroke-width="4"') + Cir(36, 36, 6, p[1], ' stroke-width="2"'), cz - 4, 8))];
    if(c.fo === 4) return [N(halo + pied + c.boule(36, 32, cz, 26, p[0]) + c.sur(T('M20,26 C24,18 32,14 40,14', '#fff', 4, ' opacity=".7"'), cz - 24))];
    return [N(halo + pied + c.cylindre(36, cz, 25, 14, 56, p[0], clair(p[0], 0.4), '', 30) + c.arcAvant(36, cz, 29, 48, p[2], 3))];
  }});

/* ---------- L'armoire de la chambre (sur son dessus, le chat aime monter) ---------- */
def('armoire_ch', {w:210, h:300, p:110, z:'sol', deco:true, chambre:true, profil:true, nf:5, nom:'Armoire', ic:'🚪', surf:[{x0:-76, x1:76, y:-290, z:55}],
  d:function(c){
    var p = palette(c, ['#9d6ee3', '#d6c4ff', '#5f3fa8']), P2 = c.p, s = pieds(c, 22, 188, 276, 300, 8, P2 - 8, 20), portes = '';
    s += c.boite(10, 28, 200, 280, 0, P2, BOIS());
    function porte(x, f){ return R(x, 42, 84, 226, 6, f); }
    if(c.fo === 1){
      portes = porte(18, c.ti ? p[0] : '#ef7fa8') + porte(108, c.ti ? p[0] : '#ef7fa8') + coeurP(60, 110, 16, p[1]) + coeurP(150, 110, 16, p[1]) + coeurP(60, 200, 10, p[1]) + coeurP(150, 200, 10, p[1]);
    } else if(c.fo === 2){
      portes = porte(18, G('boisC')) + R(108, 42, 84, 226, 6, '#cfe8ff') + T('M120,72 L170,52 M124,112 L182,82 M126,152 L150,142', '#fff', 5, ' opacity=".75"') + R(30, 62, 60, 80, 6, 'none', ' stroke-width="3" opacity=".5"');
    } else if(c.fo === 3){   /* un petit château : des créneaux, un drapeau */
      for(var i = 0; i < 5; i++) s += c.boite(10 + i * 42, 6, 34 + i * 42, 30, 0, P2, UNI(G('pierre'), '#c9c5e2', '#77729c'));
      s += c.ligne([[105, 6, P2 / 2], [105, -40, P2 / 2]], K, 4) + c.sur(P('M105,-40 L132,-32 L105,-24 Z', c.ti ? p[0] : '#e0443a', ' stroke-width="3"'), P2 / 2);
      portes = P('M18,268 V92 C18,58 102,58 102,92 V268 Z', G('boisC')) + P('M108,268 V92 C108,58 192,58 192,92 V268 Z', G('boisC')) + T('M60,92 V268 M150,92 V268', '#8a5a2a', 3, ' opacity=".5"');
    } else if(c.fo === 4){
      var fl = '';
      [[44, 92], [70, 142], [40, 202], [140, 94], [170, 152], [136, 212]].forEach(function(q, i){ for(var j = 0; j < 5; j++){ var a = j / 5 * Math.PI * 2; fl += Cir(f1(q[0] + Math.cos(a) * 7), f1(q[1] + Math.sin(a) * 7), 5, i % 2 ? p[1] : (c.ti ? p[0] : '#ff8fb3'), ' stroke-width="2"'); } fl += Cir(q[0], q[1], 4, '#ffd36a', ' stroke-width="1.5"'); });
      portes = porte(18, G('boisC')) + porte(108, G('boisC')) + T('M44,102 C50,132 70,142 70,152 M140,104 C150,132 170,142 170,162', '#4fb45f', 3) + fl;
    } else {
      portes = porte(18, G('boisC')) + porte(108, G('boisC')) + R(30, 58, 60, 90, 6, 'none', ' stroke-width="3" opacity=".55"') + R(120, 58, 60, 90, 6, 'none', ' stroke-width="3" opacity=".55"') +
        R(30, 162, 60, 92, 6, 'none', ' stroke-width="3" opacity=".55"') + R(120, 162, 60, 92, 6, 'none', ' stroke-width="3" opacity=".55"');
    }
    if(c.fo !== 3) s += c.boite(2, 12, 208, 32, -6, P2 + 4, UNI(G('boisH'), G('boisH'), G('boisS'))) + (c.fo === 0 ? c.sur(P('M70,12 C80,-12 130,-12 140,12 Z', G('boisH')), -6) : '');
    return [N(s + c.sur(portes + Cir(98, 160, 6, G('or')) + Cir(112, 160, 6, G('or')) + reflet('M20,48 V262', 4), 0))];
  }});

/* ---------- La bibliothèque : des livres de toutes les couleurs (de vrais petits volumes) ---------- */
def('bibliotheque', {w:190, h:262, p:76, z:'sol', deco:true, chambre:true, profil:true, nf:3, nom:'Bibliothèque', ic:'📚', surf:[{x0:-80, x1:80, y:-254, z:38}],
  d:function(c){
    var cols = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.4), sombre(THEMES[c.ti].c, 0.3), clair(THEMES[c.ti].c, 0.7)] : ['#d9544f', '#4f73d9', '#4fb45f', '#f2b63c', '#9d6ee3'];
    var P2 = c.p, s = '', livres = '';
    /* le fond (sombre), les côtés, les rayons */
    s += c.poly([[12, 12, P2], [178, 12, P2], [178, 256, P2], [12, 256, P2]], '#2e1c10');
    if(c.fo === 2){        /* une échelle de bois : deux montants, des planches */
      s += c.boite(8, 4, 20, 262, 4, P2, BOIS()) + c.boite(170, 4, 182, 262, 4, P2, BOIS());
    } else {
      s += c.boite(4, 8, 16, 262, 0, P2, BOIS()) + c.boite(174, 8, 186, 262, 0, P2, BOIS());
    }
    [72, 138, 204].forEach(function(y, r){
      var x = 20;
      for(var i = 0; x < 166; i++){
        var w = 12 + ((i * 7 + r * 3) % 4) * 3, h = 40 + ((i * 5 + r) % 3) * 8, col = cols[(i + r) % cols.length];
        if(x + w > 168) break;
        livres += c.boite(x, y - h, x + w, y, 14 + (i % 3) * 4, P2 - 8, UNI(col, clair(col, 0.35), sombre(col, 0.25)));
        x += w + 1;
      }
      livres += c.boite(14, y, 176, y + 10, 2, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    });
    s += livres + c.boite(14, 252, 176, 262, 2, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    if(c.fo === 1) s += c.boite(0, -6, 190, 12, -4, P2 + 4, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.sur(P('M10,12 C10,-30 180,-30 180,12 Z', G('bois')) + etoile(95, -2, 9, '#fff3c4'), -4);
    else if(c.fo === 0) s += c.boite(0, 2, 190, 14, -4, P2 + 4, UNI(G('boisH'), G('boisH'), G('boisS')));
    return [N(s)];
  }});

/* ---------- Le miroir (au mur, avec une petite épaisseur) ---------- */
def('miroir', {w:104, h:140, p:12, z:'mur', deco:true, chambre:true, nf:5, touche:118, nom:'Miroir', ic:'🪞',
  d:function(c){
    var verre = '#cfe8ff', reflets = T('M36,40 L64,20 M30,62 L70,34', '#fff', 5, ' opacity=".7"'), cad = c.ti ? THEMES[c.ti].c : null, P2 = c.p;
    if(c.fo === 1){
      var r = '';
      for(var i = 0; i < 16; i++){ var a = i / 16 * Math.PI * 2; r += 'M' + f1(52 + Math.cos(a) * 40) + ',' + f1(72 + Math.sin(a) * 40) + ' L' + f1(52 + Math.cos(a) * 52) + ',' + f1(72 + Math.sin(a) * 52) + ' '; }
      return [N(c.sur(T(r, K, 8) + T(r, cad || '#f5b945', 4), P2) + c.tube([52, 72, P2], [52, 72, 0], 40, '#9a6a1c', null, null) + c.sur(Cir(52, 72, 40, G('or')) + Cir(52, 72, 30, verre, ' stroke-width="3"') + T('M38,62 L58,48 M36,78 L64,58', '#fff', 4, ' opacity=".7"'), 0))];
    }
    if(c.fo === 2) return [N(c.boite(10, 8, 94, 134, 0, P2, BOIS()) + c.sur(R(20, 18, 64, 106, 3, verre, ' stroke-width="3"') + reflets, 0))];
    if(c.fo === 3) return [N(epais(c, etoile(52, 72, 54, '#9a6a1c', ' stroke-width="5"'), etoile(52, 72, 54, cad || G('or'), ' stroke-width="5"') + etoile(52, 72, 38, verre, ' stroke-width="3"') + T('M40,66 L56,54', '#fff', 4, ' opacity=".7"'), 0, P2))];
    if(c.fo === 4) return [N(epais(c, coeurP(52, 70, 40, sombre(cad || '#ef7fa8', 0.3), ' stroke-width="5"'), coeurP(52, 70, 40, cad || '#ef7fa8', ' stroke-width="5"') + coeurP(52, 70, 28, verre) + T('M34,52 L48,44', '#fff', 4, ' opacity=".7"'), 0, P2))];
    return [N(c.sur(T('M30,6 L52,-8 L74,6', K, 3), P2) + epais(c, Ell(52, 72, 44, 64, '#9a6a1c'), Ell(52, 72, 44, 64, G('or')) + Ell(52, 72, 34, 54, verre, ' stroke-width="3"') + reflets + Cir(52, 10, 6, cad || '#ff8fb3'), 0, P2))];
  }});

/* ---------- Le mobile : accroché par un bras qui sort du mur, il se balance doucement ---------- */
def('mobile', {w:150, h:160, p:80, z:'mur', deco:true, chambre:true, nf:5, nom:'Mobile', ic:'🌙',
  d:function(c){
    var p = palette(c, [['#fff3c4', '#ffd36a', '#c9a227'], ['#bff3ff', '#ffffff', '#3fa9d6'], ['#ff8fb3', '#ffd0e2', '#a8326a'], ['#a6ef93', '#fff3c4', '#25703c'], ['#b796ff', '#ffd36a', '#5537a0']][c.fo]);
    var cz = 30, bras = c.sur(Cir(75, -4, 5, '#cfc9e6'), c.p) + c.ligne([[75, -4, c.p], [75, -4, cz]], K, 6) + c.ligne([[75, -4, c.p], [75, -4, cz]], '#c98450', 3);
    var formes = [
      function(x, y, r){ return etoile(x, y, r, p[0]); },
      function(x, y, r){ return nuageP(x - r * 1.3, y - r * 0.5, r * 2.6, r * 1.2, p[0], ' stroke-width="3"'); },
      function(x, y, r){ return coeurP(x, y, r * 0.8, p[0]); },
      function(x, y, r){ return P('M' + (x - r) + ',' + y + ' C' + (x - r * 0.4) + ',' + (y - r) + ' ' + (x + r * 0.6) + ',' + (y - r) + ' ' + (x + r) + ',' + y + ' C' + (x + r * 0.4) + ',' + (y - r * 0.2) + ' ' + (x - r * 0.4) + ',' + (y + r * 0.6) + ' ' + (x - r) + ',' + y + ' Z', p[0], ' stroke-width="3"'); },
      function(x, y, r){ return Cir(x, y, r * 0.8, p[0]) + '<ellipse cx="' + x + '" cy="' + y + '" rx="' + f1(r * 1.3) + '" ry="' + f1(r * 0.35) + '" fill="none" stroke="' + p[2] + '" stroke-width="3"/>'; }
    ], fo = formes[c.fo];
    var fils = T('M75,-4 V22 M20,30 V86 M75,22 V112 M130,30 V76', '#5a4630', 2) + T('M14,30 C40,18 110,18 136,30', K, 7) + T('M14,30 C40,18 110,18 136,30', '#c98450', 3);
    return [N(bras + c.sur('<g class="at-mobile">' + fils + fo(20, 100, 16) + lune(75, 130, 20, p[1]) + fo(130, 90, 14) + '</g>', cz))];
  }});

/* ---------- L'arbre à chat : des plateformes pour que le chat grimpe ---------- */
def('arbre_chat', {w:180, h:300, p:120, z:'sol', deco:true, chambre:true, chat:true, nf:5, nom:'Arbre à chat', ic:'🐈',
  surf:[{x0:-62, x1:-20, y:-126, z:60}, {x0:16, x1:60, y:-206, z:60}, {x0:12, x1:68, y:-286, z:60}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#4cbb5c', '#a6ef93', '#25703c'], ['#a9a5c6', '#e8e4ff', '#524d75'], ['#e0443a', '#fff3c4', '#8a2018'], ['#8fc8ff', '#ffffff', '#4a86c8']][c.fo]);
    var cz = c.p / 2, s = c.boite(6, 280, 174, 300, 4, c.p - 4, UNI(p[2], clair(p[2], 0.25), sombre(p[2], 0.2)));
    function poteau(x, y0, y1){
      var t = c.cylindre(x, cz, 10, y0, y1, '#e2c48e', null);
      for(var y = y0 + 12; y < y1 - 4; y += 14) t += c.arcAvant(x, cz, 10.5, y, '#a8854e', 2);
      return t;
    }
    function plat(x0, x1, y){
      var m = (x0 + x1) / 2, r = (x1 - x0) / 2 + 8;
      if(c.fo === 4) return epais(c, nuageP(x0 - 8, y - 24, x1 - x0 + 16, 26, sombre(p[0], 0.15)), nuageP(x0 - 8, y - 24, x1 - x0 + 16, 26, p[0], ' stroke-width="4"'), cz - 10, 20);
      if(c.fo === 1) return c.ovale(m, cz, r, 34, y - 10, y + 4, p[0], p[1]);
      return c.boite(x0 - 8, y - 12, x1 + 8, y + 4, cz - 32, cz + 32, UNI(p[0], p[1], sombre(p[0], 0.2)));
    }
    s += poteau(46, 174, 282) + poteau(132, 94, 282) + plat(16, 76, 174) + plat(104, 164, 94) + poteau(132, 14, 94) + plat(96, 168, 14);
    if(c.fo === 2) s += c.boite(94, -44, 170, 2, cz - 30, cz + 30, UNI(G('pierre'), '#c9c5e2', '#77729c')) + c.sur(P('M119,2 V-18 C119,-30 145,-30 145,-18 V2 Z', '#2a1d14', ' stroke-width="3"'), cz - 30);
    if(c.fo === 3) s += c.cylindre(132, cz, 26, -30, 2, p[0], null) + c.tour(132, cz, [[-60, 4], [-42, 20], [-30, 30]], p[0], null) + c.sur(Cir(132, -14, 8, '#bff3ff', ' stroke-width="3"'), cz - 26);
    if(c.fo === 1) s += c.boule(150, 70, cz, 8, '#ff8fb3') + c.boule(24, 150, cz, 7, '#ffd36a');
    /* la boule qui pend (le chat la tape, elle se balance : .at-ac-boule ; un peu plus bas et plus grosse pour qu'il l'attrape) */
    s += '<g class="at-ac-boule">' + c.ligne([[150, 98, cz - 26], [152, 194, cz - 26]], '#5a4630', 2) + c.boule(152, 205, cz - 26, 11, c.ti ? p[1] : '#ff7a59') + '</g>';
    return [N(s)];
  }});

/* ---------- Le coffre à jouets ---------- */
def('coffre', {w:170, h:118, p:96, z:'sol', deco:true, chambre:true, profil:true, nf:5, nom:'Coffre à jouets', ic:'🧸', surf:[{x0:-60, x1:60, y:-104, z:48}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#3d8ef0', '#fff3c4', '#1f4f9a'], ['#f5b945', '#fff1b8', '#b07a1c'], ['#d7b27a', '#f3e2bf', '#8a6a3a'], ['#f2a65a', '#ffe0bf', '#d9783c']][c.fo]);
    var P2 = c.p, cz = P2 / 2, jouets = c.sur(emo(52, 8, 30, '🧸'), cz) + c.boule(120, 8, cz + 10, 13, '#ff7a59');
    var C3 = UNI(p[0], clair(p[0], 0.25), sombre(p[0], 0.25));
    if(c.fo === 1) return [N(c.boite(8, 22, 162, 118, 4, P2 - 4, C3) + jouets + c.boite(4, 14, 166, 30, 0, P2, UNI(p[2], clair(p[2], 0.2), sombre(p[2], 0.2))) + c.sur(etoile(52, 72, 14, p[1]) + etoile(118, 66, 11, p[1]) + etoile(86, 94, 8, p[1]), 4))];
    if(c.fo === 2){        /* un coffre de pirate : couvercle bombé, ferrures dorées */
      var couv = [];
      for(var i = 0; i <= 10; i++){ var a = Math.PI - i / 10 * Math.PI; couv.push([85 + Math.cos(a) * 75, 46 - Math.sin(a) * 34]); }
      var av = couv.map(function(q){ return [q[0], q[1], 4]; }), ar = couv.map(function(q){ return [q[0], q[1], P2 - 4]; }), pts = [];
      av.concat(ar).forEach(function(q){ pts.push(c.Q(q[0], q[1], q[2])); });
      return [N(c.boite(10, 46, 160, 118, 4, P2 - 4, BOIS()) + P(lisse(enveloppe(pts), true, 0.4), G('boisH')) + c.ligne(av, K, 4) +
        c.sur(T('M40,14 V118 M130,14 V118', K, 9) + T('M40,14 V118 M130,14 V118', '#f5b945', 5) + R(74, 40, 22, 26, 4, G('or')) + Cir(85, 52, 3, K), 4))];
    }
    if(c.fo === 3){        /* un panier tressé */
      var tresse = '';
      for(var y = 34; y < 112; y += 12) tresse += 'M14,' + y + ' q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 q10,-7 20,0 ';
      return [N(c.ovale(85, cz, 78, 44, 26, 118, p[0], p[2]) + jouets + c.sur(T(tresse, p[2], 2.5, ' opacity=".55"'), cz - 44) + c.ligne(bezier3([24, 26, cz], [30, -30, cz], [140, -30, cz], [146, 26, cz], 10), K, 8) + c.ligne(bezier3([24, 26, cz], [30, -30, cz], [140, -30, cz], [146, 26, cz], 10), p[1], 4))];
    }
    if(c.fo === 4) return [N(c.boite(8, 26, 162, 118, 4, P2 - 4, C3) + c.boite(4, 18, 166, 32, 0, P2, C3) +
      c.sur(P('M26,22 L38,-10 L60,18 Z', p[0]) + P('M144,22 L132,-10 L110,18 Z', p[0]) + Ell(60, 66, 8, 10, K) + Ell(110, 66, 8, 10, K) + P('M80,82 l5,5 l5,-5 Z', '#ff8fa8', ' stroke-width="2"') + T('M70,94 q15,10 30,0', K, 3), 0))];
    return [N(c.boite(10, 30, 160, 118, 4, P2 - 4, BOIS()) + jouets + c.boite(4, 20, 166, 36, 0, P2, UNI(G('boisH'), G('boisH'), G('boisS'))) + c.sur(T('M10,62 H160', K, 4) + R(76, 36, 18, 18, 4, G('or')) + reflet('M18,48 V106', 3), 4))];
  }});

/* ==========================================================
   Les affaires du chat (étape 3) : gamelle de croquettes, gamelle d'eau, distributeur de croquettes, panier.
   (L'arbre à chat est dans la chambre.) Tout se décore ; le toucher fait d'abord son action :
   une gamelle vide se remplit, le distributeur remplit la gamelle ; pleine, un toucher change son style.
   ========================================================== */
/* (un dessin sans contour : un reflet, de l'eau) */
function sansTrait(svg){ return svg.split(' stroke="' + K + '" stroke-width="' + SW + '"').join(''); }
var GAMELLES = [['#e0443a', '#ff9b8f', '#8a2018'], ['#3d8ef0', '#bcd6ff', '#1f4f9a'], ['#4cbb5c', '#c6f0cc', '#2a7a3a']];
/* Ce qu'il y a dans la gamelle : des croquettes, de la pâtée, un poisson, des crevettes (la boutique de Mimi) */
function contenuGamelle(c, cz, nour){
  if(nour === 'pate'){
    var s = c.disque(48, cz, 27, 13, '#9a5a34', ' stroke-width="2.5"');
    [[38, -6], [54, 4], [60, -8], [44, 8], [50, -2]].forEach(function(m, i){ var q = c.Q(48 + m[0] - 48 + 0, 11 - (i % 2), cz + m[1]); s += '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="4.4" ry="2.6" fill="' + (i % 2 ? '#c78456' : '#7a4426') + '"/>'; });
    var h = c.Q(42, 10, cz - 4); return s + '<ellipse cx="' + f1(h[0]) + '" cy="' + f1(h[1]) + '" rx="5" ry="1.6" fill="#fff" opacity=".35"/>';
  }
  var a = c.Q(48, 11, cz), b = c.Q(58, 11, cz), k = (b[0] - a[0]) / 10;
  if(nour === 'poisson'){
    var X = function(v){ return f1(a[0] + v * k); }, Y = function(v){ return f1(a[1] + v * k * 0.8); };
    return croquettes(c, 48, cz, 22, 14).split('<ellipse').slice(0, 7).join('<ellipse') +
      '<path d="M' + X(-14) + ',' + Y(0) + ' C' + X(-8) + ',' + Y(-7) + ' ' + X(6) + ',' + Y(-7) + ' ' + X(11) + ',' + Y(0) + ' C' + X(6) + ',' + Y(7) + ' ' + X(-8) + ',' + Y(7) + ' ' + X(-14) + ',' + Y(0) + ' Z" fill="#a9c8e8" stroke="' + K + '" stroke-width="2"/>' +
      '<path d="M' + X(10) + ',' + Y(0) + ' L' + X(17) + ',' + Y(-6) + ' L' + X(17) + ',' + Y(6) + ' Z" fill="#7fa6d0" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="' + X(-8) + '" cy="' + Y(-1) + '" r="' + f1(1.4 * k) + '" fill="' + K + '"/>' + T('M' + X(-3) + ',' + Y(-4) + ' Q' + X(-1) + ',' + Y(0) + ' ' + X(-3) + ',' + Y(4), '#5f86b0', 1.4) +
      T('M' + X(-6) + ',' + Y(-4) + ' C' + X(-2) + ',' + Y(-6) + ' ' + X(3) + ',' + Y(-6) + ' ' + X(7) + ',' + Y(-3), '#fff', 1.2, ' opacity=".7"');
  }
  if(nour === 'festin'){
    var t = '';
    [[-12, -3, 0], [2, -6, 1], [12, 2, 2], [-4, 5, 3], [-16, 6, 4]].forEach(function(m){
      var cx = a[0] + m[0] * k, cy = a[1] + m[1] * k * 0.8, r = 4.6 * k, rot = m[2] * 70;
      t += '<g transform="rotate(' + rot + ' ' + f1(cx) + ' ' + f1(cy) + ')"><path d="M' + f1(cx - r) + ',' + f1(cy) + ' A' + f1(r) + ',' + f1(r) + ' 0 1 1 ' + f1(cx + r * 0.2) + ',' + f1(cy + r * 0.95) + '" fill="none" stroke="' + K + '" stroke-width="' + f1(4.6 * k) + '" stroke-linecap="round"/>' +
        '<path d="M' + f1(cx - r) + ',' + f1(cy) + ' A' + f1(r) + ',' + f1(r) + ' 0 1 1 ' + f1(cx + r * 0.2) + ',' + f1(cy + r * 0.95) + '" fill="none" stroke="#ff9478" stroke-width="' + f1(2.8 * k) + '" stroke-linecap="round"/></g>';
    });
    return croquettes(c, 48, cz, 24, 14).split('<ellipse').slice(0, 6).join('<ellipse') + t;
  }
  return croquettes(c, 48, cz, 26, 14);
}
function croquettes(c, cx, cz, r, y){
  var s = '', n = 0;
  for(var i = 0; i < 14; i++){
    var a = i * 2.39996, rr = r * Math.sqrt((i + 0.5) / 14), q = c.Q(cx + Math.cos(a) * rr, y - (i % 3), cz + Math.sin(a) * rr);
    s += '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="5" ry="3.4" fill="' + (i % 2 ? '#b8743a' : '#d89452') + '" stroke="#5a3418" stroke-width="1.5"/>';
    n++;
  }
  return s;
}
def('gamelle', {w:96, h:40, p:80, z:'petit', deco:true, chat:true, nf:3, nom:'Gamelle de croquettes', ic:'🍗',
  d:function(c){
    var p = palette(c, GAMELLES[c.fo]), cz = 40, s;
    if(c.fo === 1) s = c.tour(48, cz, [[14, 42], [26, 40], [40, 30]], p[0], p[1]) + c.disque(48, cz, 34, 15, sombre(p[0], 0.35));
    else if(c.fo === 2) s = c.cylindre(48, cz, 42, 12, 40, p[0], p[1], '', 38) + c.disque(48, cz, 34, 13, sombre(p[0], 0.35)) + c.sur(T('M24,26 q6,-6 12,0 M60,26 q6,-6 12,0', '#fff', 3, ' opacity=".7"'), cz - 42);
    else s = c.tour(48, cz, [[14, 44], [22, 44], [34, 36], [40, 34]], p[0], p[1]) + c.disque(48, cz, 36, 15, sombre(p[0], 0.35)) + c.sur(emo(48, 28, 14, '🐾'), cz - 40);
    if(c.o.plein) s += contenuGamelle(c, cz, c.o.nour);
    return [N(s)];
  }});
def('eau', {w:96, h:40, p:80, z:'petit', deco:true, chat:true, nf:3, nom:'Gamelle d\'eau', ic:'💧',
  d:function(c){
    var p = palette(c, [['#8fc8ff', '#e2f1ff', '#3d8ef0'], ['#f2b63c', '#ffe9b0', '#a86f14'], ['#b796ff', '#e2d6ff', '#5537a0']][c.fo]), cz = 40, s;
    if(c.fo === 1) s = c.tour(48, cz, [[14, 42], [26, 40], [40, 30]], p[0], p[1]);
    else if(c.fo === 2) s = c.cylindre(48, cz, 42, 12, 40, p[0], p[1], '', 38);
    else s = c.tour(48, cz, [[14, 44], [22, 44], [34, 36], [40, 34]], p[0], p[1]);
    s += c.disque(48, cz, 34, 15, c.o.plein ? '#5fb8ff' : sombre(p[0], 0.35), c.o.plein ? ' stroke-width="3"' : '');
    if(c.o.plein) s += sansTrait(c.disque(36, cz - 8, 12, 14.5, 'rgba(255,255,255,.6)', '', 6));
    return [N(s)];
  }});
/* La litière de Mimi (16 novembre) : un bac de sable ; quand elle y est passée, de petits tas (o.sale) — un toucher, et la pelle passe */
def('litiere', {w:124, h:46, p:96, z:'sol', deco:true, chat:true, nf:3, nom:'Litière', ic:'🪣',
  d:function(c){
    var p = palette(c, [['#5fb8ff', '#d6ecff', '#2f6fae'], ['#8fd06a', '#e2f7d0', '#3f8a2a'], ['#ef7fa8', '#ffd0e2', '#9c2f5a']][c.fo]);
    var s = c.boite(4, 16, 120, 46, 4, c.p - 4, UNI(p[0], p[1], sombre(p[0], 0.25)));
    s += c.poly([[12, 16, 12], [112, 16, 12], [112, 16, c.p - 12], [12, 16, c.p - 12]], '#ead7a2');
    for(var i = 0; i < 22; i++){ var q = c.Q(16 + (i * 37) % 92, 16, 16 + (i * 23) % (c.p - 30)); s += '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="1.4" fill="' + (i % 3 ? '#cbb47c' : '#f6ead0') + '"/>'; }
    s += c.ligne([[30, 16, 30], [44, 16, 42], [58, 16, 34]], '#d8c088', 2) + c.ligne([[70, 16, 60], [86, 16, 70], [98, 16, 58]], '#d8c088', 2);
    if(c.o.sale) [[38, 34], [74, 56], [90, 30]].forEach(function(m){ var q = c.Q(m[0], 15, m[1]); s += '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="6.4" ry="3.6" fill="#8a5a2e" stroke="#4a2a14" stroke-width="1.6"/><ellipse cx="' + f1(q[0] - 1.6) + '" cy="' + f1(q[1] - 1.2) + '" rx="2" ry="1" fill="#c08a5a"/>'; });
    /* la petite pelle, posée contre le bac */
    s += c.ligne([[118, 30, 14], [124, 2, 4]], K, 6) + c.ligne([[118, 30, 14], [124, 2, 4]], '#c98450', 3) + c.sur(R(112, 30, 14, 12, 3, p[1], ' stroke-width="2.4"'), 4);
    return [N(s)];
  }});
/* Le griffoir (un objet de soin qu'on débloque) : un poteau de corde sur un socle, un plateau, un pompon qui pend */
def('griffoir', {w:84, h:170, p:84, z:'sol', deco:true, chat:true, nf:3, nom:'Griffoir', ic:'🪵', surf:[{x0:-20, x1:20, y:-156, z:42}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#9d6ee3', '#d6c4ff', '#5f3fa8'], ['#4cbb5c', '#a6ef93', '#25703c']][c.fo]), cz = c.p / 2;
    var s = c.boite(2, 152, 82, 170, 2, c.p - 2, UNI(p[0], p[1], sombre(p[0], 0.25))) + c.cylindre(42, cz, 13, 26, 152, '#e2c48e', null);
    for(var y = 34; y < 150; y += 7) s += c.arcAvant(42, cz, 13.5, y, '#a8854e', 2);
    s += c.ovale(42, cz, 32, 30, 14, 26, p[0], p[1]) + c.sur(T('M68,24 V50', K, 2.2) + Cir(68, 55, 6, '#ff8fb3') + T('M65,52 l2,2', '#fff', 1.4), 8);
    return [N(s)];
  }});
def('distributeur', {w:86, h:150, p:76, z:'petit', deco:true, chat:true, nf:3, nom:'Distributeur de croquettes', ic:'🥫',
  d:function(c){
    var p = palette(c, [['#f2a65a', '#ffe0bf', '#d9783c'], ['#9d6ee3', '#d6c4ff', '#5f3fa8'], ['#e0443a', '#ffd0c8', '#8a2018']][c.fo]), cz = 38;
    var corps = UNI(p[0], p[1], sombre(p[0], 0.25)), s = c.boite(6, 128, 80, 150, 4, 72, corps);
    if(c.fo === 1){        /* une tour ronde, comme un petit château */
      s += c.cylindre(43, cz, 28, 30, 130, p[0], null) + c.tour(43, cz, [[2, 4], [16, 22], [30, 30]], sombre(p[0], 0.15), null);
    } else if(c.fo === 2){ /* une tête de chat */
      s += c.boite(12, 40, 74, 130, 10, 66, corps) + c.sur(P('M14,40 L22,14 L36,40 Z', p[0]) + P('M72,40 L64,14 L50,40 Z', p[0]) + Cir(32, 62, 5, K) + Cir(54, 62, 5, K) + P('M40,72 l3,3 l3,-3 Z', '#ff8fa8', ' stroke-width="1.5"'), 10);
    } else {
      s += c.boite(12, 40, 74, 130, 10, 66, corps) + c.boite(8, 30, 78, 42, 6, 70, UNI(p[2], p[1], sombre(p[2], 0.2)));
    }
    /* la vitre qui montre les croquettes, la petite trappe */
    s += c.sur(R(24, 54, 38, 46, 6, 'rgba(220,250,255,.55)', ' stroke-width="3"') + croquettesPlates(26, 72, 34) + R(30, 108, 26, 16, 4, sombre(p[0], 0.3), ' stroke-width="3"'), c.fo === 1 ? cz - 28 : 10);
    return [N(s)];
  }});
function croquettesPlates(x, y, w){
  var s = '';
  for(var i = 0; i < 9; i++) s += '<ellipse cx="' + (x + 4 + (i % 3) * (w / 3)) + '" cy="' + (y + Math.floor(i / 3) * 8) + '" rx="5" ry="3.4" fill="' + (i % 2 ? '#b8743a' : '#d89452') + '" stroke="#5a3418" stroke-width="1.5"/>';
  return s;
}
/* Le panier : le chat aime y dormir (osier et coussin, coussin rond, carton) */
def('panier', {w:150, h:70, p:120, z:'sol', deco:true, chat:true, nf:3, nom:'Panier du chat', ic:'🧺', surf:[{x0:-30, x1:30, y:-40, z:60}],
  d:function(c){
    var p = palette(c, [['#c98450', '#f3e7cb', '#7d4626'], ['#ef7fa8', '#ffd0e2', '#9c2f5a'], ['#d7b27a', '#f3e2bf', '#8a6a3a']][c.fo]), cz = c.p / 2, s;
    if(c.fo === 2){        /* un carton : le chat adore ! */
      s = c.boite(8, 20, 142, 70, 6, c.p - 6, UNI(G('carton'), G('cartonH'), '#b07c46')) + c.poly([[14, 20, 12], [136, 20, 12], [136, 20, c.p - 12], [14, 20, c.p - 12]], '#6b4a2a') +
        c.poly([[8, 20, 6], [142, 20, 6], [142, 4, -18], [8, 4, -18]], G('cartonH')) + c.sur(emo(110, 50, 18, '🐾'), 6);
    } else if(c.fo === 1){ /* un gros coussin rond, avec un creux au milieu */
      s = c.ovale(75, cz, 70, 54, 40, 70, p[0], p[1]) + c.disque(75, cz, 44, 40, clair(p[0], 0.25), '', 32) +
        sansTrait(c.disque(75, cz, 30, 42, clair(p[0], 0.45), '', 21)) + c.arcAvant(75, cz, 70.5, 56, p[2], 3) + c.sur(emo(75, 58, 14, '💗'), cz - 54);
    } else {               /* une corbeille en osier, et son coussin */
      s = c.ovale(75, cz, 70, 54, 34, 70, '#c58a4a', null) + c.disque(75, cz, 64, 34, '#7d4f24', ' stroke-width="4"', 49);
      s += c.ovale(75, cz + 2, 56, 41, 42, 50, p[1], clair(p[1], 0.2)) + sansTrait(c.disque(66, cz - 6, 18, 41, 'rgba(255,255,255,.55)', '', 9));
      for(var y = 44; y < 68; y += 8) s += c.arcAvant(75, cz, 70.5, y, '#8a5a2a', 2.5);
      s += c.arcAvant(75, cz, 70.5, 34, K, 9) + c.arcAvant(75, cz, 70.5, 34, '#e0b074', 5);
    }
    return [N(s)];
  }});

/* ==========================================================
   LE PARC À CHAT (17 novembre ; DESIGN-saison1.md §12.66, point 3, et §12.71). Cinq morceaux, qui ne s'achètent pas : un par famille
   d'affaires complète (tama.fam, PARC, parcDonner). Mimi y joue toute seule (chatParc) : elle rampe dans le tunnel, dort dans le hamac,
   tape la souris sur ressort, se cache dans la cabane (sa tête à la porte), grimpe au toboggan et glisse.
   Trois formes chacun, toutes les couleurs (on les touche : elles changent), dans la perspective de la pièce.
   ========================================================== */
def('tunnel_chat', {w:214, h:78, p:84, z:'sol', deco:true, chat:true, parc:true, nf:3, nom:'Tunnel', ic:'🐛', surf:[{x0:-56, x1:56, y:-74, z:42}],
  d:function(c){
    var p = palette(c, [['#f2a65a', '#fff1dc', '#c4612a'], ['#9d6ee3', '#e3d4ff', '#5f3fa8'], ['#4cbb5c', '#e4f9d4', '#25703c']][c.fo]), cz = c.p / 2, y = 42, r = 34, s = '', i;
    var xs = [18, 54, 90, 126, 162, 194], noir = '#2a1d14', Z = function(x){ return cz + 16 - (x - 18) / 176 * 34; };
    /* cinq anneaux de toile, posés un peu en biais : le bout de gauche part vers le fond, celui de droite vient vers nous — on voit
       son ouverture (le noir du dedans). Dessinés du plus loin au plus près. */
    for(i = 0; i < 5; i++) s += c.tube([xs[i], y, Z(xs[i])], [xs[i + 1], y, Z(xs[i + 1])], r, i % 2 ? p[1] : p[0], i === 0 ? noir : null, i === 4 ? noir : null);
    /* (la chenille : deux antennes au bout ; le tunnel à pois) */
    if(c.fo === 2) s += c.ligne([[180, 12, Z(180) - 10], [188, -10, Z(188) - 10]], K, 3) + c.boule(188, -12, Z(188) - 10, 5, p[2]) + c.ligne([[176, 12, Z(176) + 12], [182, -10, Z(182) + 12]], K, 3) + c.boule(182, -12, Z(182) + 12, 5, p[2]);
    if(c.fo === 1) for(i = 0; i < 4; i++) s += c.boule(38 + i * 40, 26 + (i % 2) * 16, Z(38 + i * 40) - r + 4, 6, '#ffffff');
    return [N(s)];
  }});
def('hamac_chat', {w:190, h:122, p:92, z:'sol', deco:true, chat:true, parc:true, nf:3, nom:'Hamac', ic:'🛏️', surf:[{x0:-26, x1:26, y:-44, z:46}],
  d:function(c){
    var p = palette(c, [['#ff8fb3', '#ffd9e8', '#c9507e'], ['#5fb8ff', '#d6efff', '#2f7fc4'], ['#ffd36a', '#fff3c4', '#c98a2c']][c.fo]), cz = c.p / 2, bois = UNI('#c98450', '#e8b98a', '#7d4626'), s = '', i;
    var zf = cz - 26, zb = cz + 26, Y = function(x){ var u = (x - 95) / 80; return 30 + 54 * (1 - u * u); }, xs = [];
    for(i = 0; i <= 10; i++) xs.push(15 + i * 16);
    /* le pied : une traverse par terre et deux patins, deux montants penchés vers le dehors */
    s += c.boite(20, 114, 34, 122, 10, c.p - 10, bois) + c.boite(156, 114, 170, 122, 10, c.p - 10, bois) + c.boite(22, 112, 168, 120, cz - 5, cz + 5, bois);
    s += c.tube([27, 116, cz], [13, 22, cz], 6, '#c98450', null, '#e8b98a') + c.tube([163, 116, cz], [177, 22, cz], 6, '#c98450', null, '#e8b98a');
    /* la toile : le bord du fond, le creux (des bandes, du fond vers nous), le bord de devant ; les cordes */
    s += c.ligne(xs.map(function(x){ return [x, Y(x), zb]; }), K, 9) + c.ligne(xs.map(function(x){ return [x, Y(x), zb]; }), p[2], 5);
    for(i = 0; i < 10; i++) s += c.poly([[xs[i], Y(xs[i]), zb], [xs[i + 1], Y(xs[i + 1]), zb], [xs[i + 1], Y(xs[i + 1]), zf], [xs[i], Y(xs[i]), zf]], c.fo === 2 ? (i % 2 ? p[1] : p[0]) : (i === 4 || i === 5 ? p[1] : p[0]), ' stroke-width="1.5" stroke="' + (c.fo === 2 ? K : 'none') + '"');
    s += c.ligne(xs.map(function(x){ return [x, Y(x), zf]; }), K, 10) + c.ligne(xs.map(function(x){ return [x, Y(x), zf]; }), p[2], 6);
    s += c.ligne([[13, 22, cz], [15, 30, zf]], K, 3) + c.ligne([[13, 22, cz], [15, 30, zb]], K, 3) + c.ligne([[177, 22, cz], [175, 30, zf]], K, 3) + c.ligne([[177, 22, cz], [175, 30, zb]], K, 3);
    if(c.fo === 1) s += c.boule(95, 100, zf - 2, 6, '#ffd36a') + c.ligne([[95, 86, zf], [95, 95, zf - 2]], K, 2.5);      /* (un pompon sous le hamac) */
    return [N(s)];
  }});
def('ressort_souris', {w:84, h:128, p:64, z:'sol', deco:true, chat:true, parc:true, nf:3, nom:'Souris sur ressort', ic:'🐭',
  d:function(c){
    var p = palette(c, [['#b9b3d2', '#f0edff', '#736d8e'], ['#f2a65a', '#fff1dc', '#c4612a'], ['#8fd4c0', '#e0fff6', '#3f8f7a']][c.fo]), cz = c.p / 2, i, r = 'M42,114';
    for(i = 0; i < 6; i++) r += ' L' + (i % 2 ? 53 : 31) + ',' + (106 - i * 9) + '';
    r += ' L42,52';
    var souris = P('M24,38 C24,24 34,16 44,16 C56,16 64,26 64,38 C64,48 54,54 42,54 C32,54 24,48 24,38 Z', p[0]) +
      Cir(30, 20, 8, p[0]) + Cir(30, 20, 4, '#ff9fb6', ' stroke="none"') + Cir(56, 18, 8, p[0]) + Cir(56, 18, 4, '#ff9fb6', ' stroke="none"') +
      Cir(37, 35, 2.6, K, ' stroke="none"') + Cir(51, 35, 2.6, K, ' stroke="none"') + P('M41,42 L47,42 L44,46 Z', '#ff7a9a', ' stroke-width="1.5"') +
      T('M36,44 L22,42 M36,46 L23,50 M52,44 L66,42 M52,46 L65,50', K, 1.4) + T('M62,46 C74,50 76,60 68,64', p[2], 3);
    if(c.fo === 2) souris += P('M38,14 L44,2 L50,14 Z', '#ffd36a', ' stroke-width="2.5"');      /* (un petit chapeau pointu) */
    return [N(c.ovale(42, cz, 30, 24, 116, 128, '#c98450', '#e8b98a')), N('<g class="at-ressort">' + c.sur(T(r, K, 7) + T(r, '#d5d9e2', 3.5) + souris, cz) + '</g>')];
  }});
def('cabane_chat', {w:164, h:158, p:112, z:'sol', deco:true, chat:true, parc:true, nf:3, nom:'Cabane', ic:'🏠',
  d:function(c){
    var p = palette(c, [['#f3e7cb', '#e0443a', '#8a2018'], ['#e3d4ff', '#9d6ee3', '#5f3fa8'], ['#d9f2ff', '#3d8ef0', '#1f5aa8']][c.fo]), z0 = 10, z1 = c.p - 10, s = '';
    var mur = c.ti ? clair(p[0], 0.55) : p[0], toit = c.ti ? p[0] : p[1], bord = c.ti ? p[2] : p[2], g = [[10, 72], [82, 12], [154, 72]];
    s += c.boite(16, 70, 148, 158, z0, z1, UNI(mur, mur, sombre(mur, 0.16)));
    s += c.poly([[16, 72, z0], [82, 16, z0], [148, 72, z0]], mur);
    /* le toit à deux pentes (on ne dessine que celles qu'on voit), qui dépasse un peu devant */
    s += c.plan([[g[0][0], g[0][1], z0 - 6], [g[1][0], g[1][1], z0 - 6], [g[1][0], g[1][1], z1 + 4], [g[0][0], g[0][1], z1 + 4]], [-0.64, -0.77, 0], toit);
    s += c.plan([[g[2][0], g[2][1], z0 - 6], [g[1][0], g[1][1], z0 - 6], [g[1][0], g[1][1], z1 + 4], [g[2][0], g[2][1], z1 + 4]], [0.64, -0.77, 0], sombre(toit, 0.12));
    s += c.ligne([[g[0][0], g[0][1], z0 - 6], [g[1][0], g[1][1], z0 - 6], [g[2][0], g[2][1], z0 - 6]], K, 11) + c.ligne([[g[0][0], g[0][1], z0 - 6], [g[1][0], g[1][1], z0 - 6], [g[2][0], g[2][1], z0 - 6]], bord, 6);
    /* la porte ronde (du noir : le dedans) ; si Mimi est dedans, sa tête à la porte (o.dedans : son numéro, ses habits) */
    var de = c.o && c.o.dedans, porte = P('M56,158 V116 C56,92 108,92 108,116 V158 Z', '#2a1d14', ' stroke-width="4"');
    if(de) porte += '<g transform="translate(82,133) scale(.76)">' + MP.tete(vChat(de.v), accPantin(de.acc)) + '</g>';
    porte += c.fo === 1 ? P('M82,50 l5.5,10.5 l11.5,1.5 l-8.5,8 l2,11.5 l-10.5,-5.5 l-10.5,5.5 l2,-11.5 l-8.5,-8 l11.5,-1.5 Z', '#ffd36a', ' stroke-width="3"') :
      c.fo === 2 ? Cir(82, 62, 11, '#bff3ff', ' stroke-width="4"') + T('M82,51 V73 M71,62 H93', K, 2.5) :
      P('M82,74 C68,64 66,52 74,50 C79,49 82,54 82,56 C82,54 85,49 90,50 C98,52 96,64 82,74 Z', '#ff7fa3', ' stroke-width="3"');
    s += c.sur(porte, z0);
    return [N(s)];
  }});
def('toboggan_chat', {w:232, h:152, p:84, z:'sol', deco:true, chat:true, parc:true, nf:3, nom:'Toboggan', ic:'🛝', surf:[{x0:-106, x1:-58, y:-108, z:42}],
  d:function(c){
    var p = palette(c, [['#5fb8ff', '#d6efff', '#2f7fc4'], ['#ff7a59', '#ffe0d6', '#c9432a'], ['#b796ff', '#efe6ff', '#6a48c4']][c.fo]), z0 = 14, z1 = c.p - 14, bois = UNI('#c98450', '#e8b98a', '#7d4626'), s = '', y;
    var A = [66, 44], B = [224, 148];      /* la glissière : du bord de la plateforme jusqu'au sol */
    function bord(z){ return c.poly([[A[0], A[1] - 12, z], [B[0], B[1] - 12, z], [B[0], B[1], z], [A[0], A[1], z]], p[0]); }
    s += c.boite(8, 50, 18, 152, z1 - 8, z1, bois) + c.boite(56, 50, 66, 152, z1 - 8, z1, bois) + bord(z1);
    s += c.poly([[A[0], A[1], z0], [B[0], B[1], z0], [B[0], B[1], z1], [A[0], A[1], z1]], p[1]);
    s += c.ligne([[A[0] + 20, A[1] + 13, z0 + 14], [B[0] - 30, B[1] - 20, z0 + 14]], '#fff', 4, ' opacity=".7"');
    s += c.boite(4, 40, 68, 50, z0, z1, UNI(p[0], p[1], sombre(p[0], 0.2)));
    s += c.boite(8, 50, 18, 152, z0, z0 + 8, bois) + c.boite(56, 50, 66, 152, z0, z0 + 8, bois);
    for(y = 72; y < 150; y += 22) s += c.ligne([[6, y, z0 + 4], [6, y, z1 - 4]], K, 8) + c.ligne([[6, y, z0 + 4], [6, y, z1 - 4]], '#e8b98a', 4);      /* (l'échelle, sur le côté) */
    s += bord(z0);
    /* (un petit drapeau ; une étoile ; un nuage au bout) */
    if(c.fo === 0) s += c.ligne([[12, 40, z0 + 4], [12, 8, z0 + 4]], K, 4) + c.sur(P('M14,8 L40,16 L14,24 Z', '#ffd36a', ' stroke-width="3"'), z0 + 4);
    if(c.fo === 1) s += c.sur(P('M36,10 l4,8 l9,1 l-6.5,6 l1.5,9 l-8,-4.5 l-8,4.5 l1.5,-9 l-6.5,-6 l9,-1 Z', '#ffd36a', ' stroke-width="3"'), z0);
    return [N(s)];
  }});

/* ==========================================================
   Le vrai matériel d'alchimiste (étape 2) : de la décoration, pour se faire un petit laboratoire.
   Grand alambic, cornues, mortier et pilon, balance, sablier, astrolabe, boule de cristal ;
   au mur : une étagère à fioles, un râtelier d'outils, une carte du ciel (et les herbes séchées).
   Trois formes chacun (et les 8 couleurs) ; tout dans la perspective de la pièce.
   ========================================================== */
function liquide(c, i){
  var l = c.ti ? [THEMES[c.ti].c, clair(THEMES[c.ti].c, 0.4), sombre(THEMES[c.ti].c, 0.2)] : ['#7cf09a', '#ff7a59', '#8ff3ff', '#ffd84a', '#c9a8ff'];
  return l[i % l.length];
}
/* une petite fiole debout (corps de révolution) : x, z au sol de la fiole, b : son bas, h : sa hauteur */
function fiole3d(c, x, z, b, h, col, forme){
  var r = h * 0.3, s;
  if(forme === 1) s = c.tour(x, z, [[b, r * 1.15], [b - h * 0.45, r * 0.4]], G('verre'), null, ' stroke-width="3"') + c.tour(x, z, [[b - 2, r], [b - h * 0.28, r * 0.75]], col, clair(col, 0.4), ' stroke-width="0" opacity=".9"');
  else if(forme === 2) s = c.cylindre(x, z, r * 0.55, b - h * 0.9, b, G('verre'), null, ' stroke-width="3"') + c.cylindre(x, z, r * 0.45, b - h * 0.5, b - 2, col, clair(col, 0.4), ' stroke-width="0"');
  else s = c.tour(x, z, [[b, r * 0.7], [b - h * 0.2, r], [b - h * 0.45, r * 0.75], [b - h * 0.55, r * 0.35]], G('verre'), null, ' stroke-width="3"') + c.tour(x, z, [[b - 2, r * 0.6], [b - h * 0.18, r * 0.85], [b - h * 0.3, r * 0.82]], col, clair(col, 0.4), ' stroke-width="0" opacity=".9"');
  var haut = forme === 2 ? b - h * 0.9 : b - h * 0.55;
  return s + c.cylindre(x, z, Math.max(3, r * 0.32), b - h, haut + 2, G('verre'), null, ' stroke-width="2.5"') + c.cylindre(x, z, Math.max(3.5, r * 0.36), b - h - 6, b - h + 2, '#c58a4a', '#e0a868', ' stroke-width="2"');
}

/* ---------- Le grand alambic ---------- */
def('alambic_labo', {w:156, h:214, p:110, z:'sol', deco:true, nf:3, nom:'Grand alambic', ic:'⚗️',
  d:function(c){
    var col = liquide(c, 2), cz = 50, s = '';
    var bulles = c.sur('<g class="at-bulles"><circle cx="132" cy="170" r="3" fill="#fff" opacity=".8"/><circle cx="138" cy="178" r="2" fill="#fff" opacity=".7"/></g>', cz - 16);
    if(c.fo === 1){        /* en verre, sur un trépied, une flamme bleue */
      s += c.ligne([[64, 150, cz], [30, 212, cz + 30]], K, 6) + c.ligne([[64, 150, cz], [98, 212, cz + 30]], K, 6) + c.ligne([[64, 150, cz], [64, 212, cz - 34]], K, 6) +
        c.sur('<path class="at-flamme" d="M64,150 c-8,-8 -4,-16 0,-22 c4,6 8,14 0,22 Z" fill="#8ff3ff" stroke="#3fa9d6" stroke-width="2"/>', cz) +
        c.tour(64, cz, [[136, 26], [118, 42], [96, 40], [78, 26], [66, 12]], G('verre'), null, ' stroke-width="4"') + c.tour(64, cz, [[132, 22], [118, 37], [108, 38]], liquide(c, 0), clair(liquide(c, 0), 0.4), ' stroke-width="0" opacity=".8"');
    } else {               /* en cuivre, sur un petit four de briques (2 : doré, avec des pierres précieuses) */
      var dore = c.fo === 2;
      s += c.boite(24, 150, 106, 212, cz - 36, cz + 36, UNI(G('terre'), '#e08a5a', '#94441f')) + c.sur(T('M24,170 H106 M24,190 H106 M50,150 V170 M80,170 V190 M50,190 V212', '#7a3418', 2.5) +
        P('M50,212 V188 C50,176 80,176 80,188 V212 Z', '#2a1208') + '<ellipse class="at-braise" cx="65" cy="204" rx="11" ry="6" fill="#ff8a3c"/>', cz - 36);
      s += c.tour(64, cz, [[150, 30], [130, 42], [106, 40], [86, 28], [72, 14]], G(dore ? 'or' : 'cuivre'), null);
      if(dore) s += c.sur(Cir(48, 118, 6, '#8ff3ff', ' stroke-width="2.5"') + Cir(80, 112, 6, '#ff8fb3', ' stroke-width="2.5"'), cz - 40);
    }
    s += c.cylindre(64, cz, 9, 40, 72, G(c.fo === 1 ? 'verre' : 'cuivre'), G('cuivre'));
    var tuyau = bezier3([64, 44, cz], [80, 6, cz], [126, 10, cz], [132, 132, cz - 16], 14);
    s += c.ligne(tuyau, K, 10) + c.ligne(tuyau, c.fo === 1 ? '#d8f6ff' : '#e08a4a', 5);
    s += c.tour(132, cz - 16, [[204, 18], [190, 24], [172, 22], [160, 9]], G('verre'), null, ' stroke-width="4"') + c.tour(132, cz - 16, [[201, 15], [190, 21], [184, 21]], col, clair(col, 0.4), ' stroke-width="0" opacity=".85"') +
      c.cylindre(132, cz - 16, 6, 132, 162, G('verre'), null, ' stroke-width="3"') + bulles;
    return [N(s + c.sur(reflet('M44,110 C42,100 46,92 52,88', 3), cz - 40))];
  }});

/* ---------- Les cornues : deux ou trois fioles au long cou penché, sur un support ---------- */
def('cornues', {w:132, h:112, p:64, z:'petit', deco:true, nf:3, nom:'Cornues', ic:'🧪',
  d:function(c){
    var cz = 32, s = '';
    if(c.fo === 0) s += c.boite(4, 96, 128, 112, 6, 58, BOIS());
    else if(c.fo === 1) s += c.ovale(66, cz, 60, 26, 100, 112, G('metal'), '#6a6290');
    else s += c.boite(8, 98, 124, 112, 8, 56, UNI(G('pierre'), '#c9c5e2', '#77729c'));
    [[34, 0], [92, 1]].forEach(function(q, i){
      var x = q[0], col = liquide(c, i + (c.fo === 2 ? 2 : 0)), b = 98;
      s += c.tour(x, cz, [[b, 14], [b - 16, 24], [b - 34, 20], [b - 44, 8]], G('verre'), null, ' stroke-width="3.5"') + c.tour(x, cz, [[b - 2, 12], [b - 14, 21], [b - 20, 21]], col, clair(col, 0.4), ' stroke-width="0" opacity=".9"');
      var cou = [[x, b - 42, cz], [x + 10, b - 64, cz], [x + 26, b - 72, cz], [x + 40, b - 66, cz]];
      s += c.ligne(cou, K, 10) + c.ligne(cou, '#e6fbff', 5);
    });
    if(c.fo === 2) s += fiole3d(c, 66, cz + 12, 98, 40, liquide(c, 4), 2);
    return [N(s)];
  }});

/* ---------- Le mortier et son pilon ---------- */
def('mortier_pilon', {w:92, h:82, p:76, z:'petit', deco:true, nf:3, nom:'Mortier et pilon', ic:'🥣',
  d:function(c){
    var cz = 38, f = c.fo === 1 ? G('bois') : c.fo === 2 ? G('cuivre') : G('pierre'), haut = c.fo === 1 ? G('boisH') : c.fo === 2 ? '#f0b07a' : '#8c88ad';
    var s = c.tour(46, cz, [[40, 36], [54, 34], [68, 26], [80, 16]], f, haut) + c.disque(46, cz, 29, 41, '#4a4668');
    if(c.fo === 2) s += c.arcAvant(46, cz, 34.5, 52, '#94481f', 3);
    s += c.disque(46, cz + 4, 14, 42, liquide(c, 3), ' stroke-width="0" opacity=".85"');
    s += c.ligne([[54, 44, cz], [80, 2, cz + 12]], K, 13) + c.ligne([[54, 44, cz], [80, 2, cz + 12]], c.fo === 1 ? '#d29a5e' : '#d6d0ee', 7);
    return [N(s + c.sur(reflet('M18,48 C20,60 28,66 36,68', 3), cz - 36))];
  }});

/* ---------- La balance à plateaux ---------- */
def('balance', {w:122, h:112, p:56, z:'petit', deco:true, nf:3, nom:'Balance', ic:'⚖️',
  d:function(c){
    var cz = 28, met = c.fo === 1 ? G('cuivre') : c.fo === 2 ? G('metal') : G('or'), clr = c.fo === 1 ? '#f0b07a' : c.fo === 2 ? '#6a6290' : '#f7d778';
    var s = c.fo === 2 ? c.boite(36, 98, 86, 112, 10, 46, BOIS()) : c.tour(61, cz, [[98, 14], [110, 26]], met, clr);
    s += c.cylindre(61, cz, 4, 28, 100, met, met);
    var fleau = c.ligne([[14, 32, cz], [108, 32, cz]], K, 8) + c.ligne([[14, 32, cz], [108, 32, cz]], c.fo === 2 ? '#a8a2c8' : '#f5b945', 4);
    [[14], [108]].forEach(function(q){ var x = q[0]; fleau += c.ligne([[x, 32, cz], [x - 10, 72, cz]], '#8a6a3a', 2) + c.ligne([[x, 32, cz], [x + 10, 72, cz]], '#8a6a3a', 2) + c.cylindre(x, cz, 15, 72, 80, met, clr, '', 7); });
    fleau += c.sur(emo(14, 64, 14, c.fo === 1 ? '🌿' : '💎') + emo(108, 64, 14, c.fo === 1 ? '🍄' : '⭐'), cz);
    return [N(s + '<g class="at-balance">' + fleau + '</g>' + c.boule(61, 26, cz, 6, met))];
  }});

/* ---------- Le sablier ---------- */
def('sablier', {w:62, h:104, p:62, z:'petit', deco:true, nf:3, nom:'Sablier', ic:'⏳',
  d:function(c){
    var cz = 31, bois = c.fo === 1 ? G('or') : c.fo === 2 ? G('metal') : G('bois'), bh = c.fo === 1 ? '#f7d778' : c.fo === 2 ? '#6a6290' : G('boisH');
    var sable = c.ti ? THEMES[c.ti].c : '#f2c230';
    var s = c.cylindre(31, cz, 28, 94, 104, bois, bh);
    [[8, cz - 14], [54, cz - 14], [31, cz + 24]].forEach(function(q){ if(q[1] > cz) s += c.cylindre(q[0], q[1], 3, 10, 96, bois, null); });
    s += c.tour(31, cz, [[14, 20], [30, 20], [48, 6], [54, 4], [60, 6], [78, 20], [94, 20]], G('verre'), null, ' stroke-width="3"');
    s += c.tour(31, cz, [[30, 15], [44, 7], [52, 3]], sable, clair(sable, 0.3), ' stroke-width="0"') + c.tour(31, cz, [[76, 12], [92, 18]], sable, clair(sable, 0.3), ' stroke-width="0"');
    s += c.sur('<rect class="at-sable" x="30" y="52" width="2" height="26" fill="' + sable + '"/>', cz);
    [[8, cz - 14], [54, cz - 14]].forEach(function(q){ s += c.cylindre(q[0], q[1], 3, 10, 96, bois, null); });
    s += c.cylindre(31, cz, 28, 4, 14, bois, bh);
    return [N(s)];
  }});

/* ---------- L'astrolabe : des anneaux autour d'un petit globe ---------- */
def('astrolabe', {w:112, h:132, p:90, z:'petit', deco:true, nf:3, nom:'Astrolabe', ic:'🧭',
  d:function(c){
    var cz = 45, met = c.fo === 1 ? G('cuivre') : c.fo === 2 ? G('metal') : G('or'), col = c.fo === 2 ? '#a8a2c8' : c.fo === 1 ? '#e08a4a' : '#f5b945';
    var s = c.tour(56, cz, [[116, 12], [124, 26], [132, 34]], c.fo === 2 ? G('metal') : G('bois'), c.fo === 2 ? '#6a6290' : G('boisH')) + c.cylindre(56, cz, 4, 98, 118, met, null);
    function anneau(pts, w){ return T(lisse(pts, true), K, w + 4) + T(lisse(pts, true), col, w); }
    var horiz = [], vert = [], biais = [];
    for(var i = 0; i < 28; i++){
      var a = i / 28 * Math.PI * 2;
      horiz.push(c.Q(56 + Math.cos(a) * 44, 56, cz + Math.sin(a) * 44));
      vert.push(c.Q(56 + Math.cos(a) * 44, 56 + Math.sin(a) * 44, cz));
      biais.push(c.Q(56 + Math.cos(a) * 40, 56 + Math.sin(a) * 40 * 0.6, cz + Math.sin(a) * 40 * 0.8));
    }
    s += anneau(vert, 4) + c.boule(56, 56, cz, c.fo === 1 ? 20 : 16, c.fo === 2 ? G('cristal') : '#4f73d9') +
      c.sur(c.fo === 2 ? '' : P('M46,50 C52,44 60,46 62,52 C58,58 50,60 46,50 Z M60,62 C64,60 68,62 66,66 Z', '#4fb45f', ' stroke-width="2"'), cz - 16) + anneau(horiz, 3.5) + anneau(biais, 3);
    s += c.sur(etoile(56, 4, 8, '#fff3c4', ' stroke-width="2"'), cz);
    return [N(s)];
  }});

/* ---------- La boule de cristal ---------- */
def('boule_cristal', {w:92, h:112, p:70, z:'petit', deco:true, nf:3, nom:'Boule de cristal', ic:'🔮',
  d:function(c){
    var cz = 35, col = c.ti ? clair(THEMES[c.ti].c, 0.4) : ['#bff3ff', '#ffd0e2', '#d6c4ff'][c.fo];
    var s = c.sur('<circle class="at-halo" cx="46" cy="48" r="58" fill="' + G('haloC') + '"/>', cz);
    if(c.fo === 1) s += c.ligne([[46, 86, cz], [20, 112, cz + 24]], K, 7) + c.ligne([[46, 86, cz], [72, 112, cz + 24]], K, 7) + c.ligne([[46, 86, cz], [46, 112, cz - 30]], K, 7) + c.ovale(46, cz, 22, 18, 82, 90, G('metal'), '#6a6290');
    else if(c.fo === 2) s += c.boite(18, 86, 74, 112, 10, 60, BOIS()) + c.boite(14, 80, 78, 88, 6, 64, UNI(G('boisH'), G('boisH'), G('boisS')));
    else s += c.tour(46, cz, [[82, 16], [96, 22], [110, 28]], G('or'), G('or'));
    s += c.boule(46, 48, cz, 34, 'url(#atg-cristal)') + c.sur('<circle cx="46" cy="48" r="26" fill="' + col + '" opacity=".35"/>' +
      '<path class="at-tourne" d="M32,48 C34,32 58,32 60,48 C58,62 38,60 40,48" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>' + reflet('M24,40 C26,28 34,20 44,18', 4), cz - 20);
    return [N(s)];
  }});

/* ---------- Au mur : l'étagère à fioles ---------- */
def('etagere_fioles', {w:190, h:98, p:46, z:'mur', deco:true, nf:3, nom:'Étagère à fioles', ic:'🧴',
  d:function(c){
    var s = c.boite(14, 82, 26, 98, 8, 40, SOMBRE()) + c.boite(164, 82, 176, 98, 8, 40, SOMBRE());
    if(c.fo === 1) s += c.sur(T('M20,-6 L20,82 M170,-6 L170,82', '#8a6a3a', 3) + Cir(20, -6, 4, '#cfc9e6') + Cir(170, -6, 4, '#cfc9e6'), 23);
    s += c.boite(2, 72, 188, 84, 0, 46, c.fo === 2 ? UNI(G('pierre'), '#c9c5e2', '#77729c') : UNI(G('boisH'), G('boisH'), G('boisS')));
    for(var i = 0; i < 5; i++) s += fiole3d(c, 24 + i * 35, 23, 72, 50 + (i % 2) * 10, liquide(c, i), (i + c.fo) % 3);
    return [N(s)];
  }});

/* ---------- Au mur : le râtelier d'outils (louches, cuillères, pinces) ---------- */
def('ratelier', {w:192, h:132, p:30, z:'mur', deco:true, nf:3, nom:'Râtelier d\'outils', ic:'🥄',
  d:function(c){
    var met = c.fo === 1 ? '#e08a4a' : c.fo === 2 ? '#f5b945' : '#a8a2c8';
    var s = c.boite(4, 6, 188, 26, 0, 22, c.fo === 2 ? UNI(G('pierre'), '#c9c5e2', '#77729c') : BOIS());
    var outils = '';
    [[28, 'louche'], [62, 'cuillere'], [96, 'pince'], [130, 'louche'], [164, 'spatule']].forEach(function(q){
      var x = q[0];
      outils += Cir(x, 18, 4, '#cfc9e6');
      if(q[1] === 'louche') outils += T('M' + x + ',20 V96', K, 7) + T('M' + x + ',20 V96', met, 3.5) + P('M' + (x - 14) + ',96 C' + (x - 14) + ',118 ' + (x + 14) + ',118 ' + (x + 14) + ',96 Z', met);
      else if(q[1] === 'cuillere') outils += T('M' + x + ',20 V98', K, 6) + T('M' + x + ',20 V98', met, 3) + Ell(x, 108, 9, 13, met);
      else if(q[1] === 'pince') outils += T('M' + x + ',20 L' + (x - 9) + ',120 M' + x + ',20 L' + (x + 9) + ',120', K, 6) + T('M' + x + ',20 L' + (x - 9) + ',120 M' + x + ',20 L' + (x + 9) + ',120', met, 2.5);
      else outils += T('M' + x + ',20 V92', K, 7) + T('M' + x + ',20 V92', '#c98450', 3.5) + R(x - 10, 92, 20, 30, 4, met);
    });
    return [N(s + c.sur(outils, 12))];
  }});

/* ---------- Au mur : la carte du ciel (à plat, dans son cadre) ---------- */
def('carte_ciel', {w:162, h:132, p:10, z:'mur', deco:true, nf:3, nom:'Carte du ciel', ic:'🗺️',
  d:function(c){
    var fond = c.ti ? sombre(THEMES[c.ti].c, 0.55) : '#1d2550', art = '';
    if(c.fo === 1){        /* un parchemin roulé */
      art = P('M14,14 L148,14 L148,118 L14,118 Z', '#f3e2bf') + T('M30,40 L60,30 L92,56 L126,40 M40,90 L70,74 L104,96', '#8a5a3a', 2.5) +
        etoile(60, 30, 6, '#c0392b', ' stroke-width="1.5"') + etoile(92, 56, 6, '#c0392b', ' stroke-width="1.5"') + etoile(70, 74, 5, '#c0392b', ' stroke-width="1.5"');
      return [N(c.boite(6, 8, 156, 124, 0, c.p, UNI('#e6d3a8')) + c.sur(art, 0) + c.tube([4, 10, 4], [158, 10, 4], 7, '#c9b48a', '#e6d3a8', '#e6d3a8') + c.tube([4, 122, 4], [158, 122, 4], 7, '#c9b48a', '#e6d3a8', '#e6d3a8'))];
    }
    art = '<rect x="16" y="16" width="130" height="100" fill="' + fond + '"/>';
    var st = [[34, 34], [62, 50], [92, 36], [118, 58], [50, 88], [86, 96], [124, 92]];
    st.forEach(function(q){ art += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.5" fill="#fff3c4"/>'; });
    art += T('M34,34 L62,50 L92,36 L118,58 M50,88 L86,96 L124,92', '#bff3ff', 1.5, ' opacity=".7"') + (c.fo === 2 ? lune(120, 30, 12, '#fff3c4', ' stroke-width="2"') : etoile(78, 70, 9, '#ffd36a', ' stroke-width="2"'));
    return [N(c.sur(T('M60,8 L81,-8 L102,8', K, 3), c.p) + c.boite(6, 6, 156, 126, 0, c.p, UNI(c.fo === 2 ? G('bois') : G('or'), '#f7d778', '#9a6a1c')) + c.sur(art + T('M16,16 H146 V116 H16 Z', K, 3), 0))];
  }});
/* ==========================================================
   Décor : dégradés, la pièce, l'établi, le chaudron
   ========================================================== */
/* cls : les arrêts reçoivent une classe (couleurs changées par la lumière du moment, en CSS) */
function lin(id, st, vert, cls){
  return '<linearGradient id="atg-' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '">' +
    st.map(function(s, i){ return '<stop' + (cls ? ' class="at-s-' + cls + i + '"' : '') + ' offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
}
function rad(id, st, cx, cy, r){
  return '<radialGradient id="atg-' + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.5) + '">' +
    st.map(function(s){ return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
}
function svgDefs(){
  return '<svg class="at-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    lin('bois', [['#dc9e63', 0], ['#b06f3e', 0.55], ['#7d4626', 1]]) +
    lin('arc', [['#ff6b6b', 0], ['#ffd84a', 0.3], ['#5fe08a', 0.55], ['#5fb8ff', 0.8], ['#b796ff', 1]]) +
    lin('boisC', [['#ecb882', 0], ['#c98450', 0.6], ['#9a5c31', 1]]) +
    lin('boisH', [['#f3c991', 0], ['#d29a5e', 1]], 1) +
    lin('boisS', [['#94603a', 0], ['#62381d', 1]]) +
    lin('carton', [['#f0c287', 0], ['#d29b5c', 0.6], ['#a87240', 1]]) +
    lin('cartonH', [['#f8dcac', 0], ['#e2b47a', 1]], 1) +
    lin('toile', [['#f4e6c4', 0], ['#d7bf90', 0.6], ['#ab9163', 1]]) +
    lin('metal', [['#5f5582', 0], ['#352c4f', 0.55], ['#1b1529', 1]]) +
    lin('cuivre', [['#ffcf9a', 0], ['#e08a4a', 0.5], ['#94481f', 1]]) +
    lin('verre', [['#ffffff', 0, 0.55], ['#bff3ff', 0.45, 0.16], ['#ffffff', 1, 0.32]]) +
    lin('pierre', [['#a9a5c6', 0], ['#77729c', 0.6], ['#524d75', 1]]) +
    lin('or', [['#fff1b8', 0], ['#f5b945', 0.5], ['#b07a1c', 1]]) +
    lin('vert', [['#a6ef93', 0], ['#4fb45f', 0.55], ['#25703c', 1]]) +
    lin('terre', [['#f0a172', 0], ['#c96a3e', 0.6], ['#94441f', 1]]) +
    lin('violet', [['#b796ff', 0], ['#7d5bd0', 0.6], ['#5537a0', 1]]) +
    lin('murF', [['#2b2148', 0], ['#3e2f5f', 0.6], ['#4a3868', 1]], 1, 'murF') +
    lin('murC', [['#1c1533', 0], ['#2a2048', 1]], 0, 'murC') +
    lin('murC2', [['#2a2048', 0], ['#1c1533', 1]], 0, 'murD') +
    lin('sol', [['#6b3f24', 0], ['#8a5634', 0.45], ['#5c341d', 1]], 1, 'sol') +
    lin('solOmbre', [['#140c18', 0, 0.55], ['#140c18', 1, 0]], 1) +
    lin('ciel', [['#0d1433', 0], ['#26306a', 0.7], ['#4b3f86', 1]], 1, 'ciel') +
    lin('rayon', [['#bff9ff', 0, 0.2], ['#8ff3ff', 1, 0]], 1) +
    rad('halo', [['#ffe9a3', 0, 0.55], ['#ffd36a', 1, 0]]) +
    rad('haloC', [['#bff9ff', 0, 0.55], ['#8ff3ff', 1, 0]]) +
    rad('haloL', [['#fff6d8', 0, 0.6], ['#fff6d8', 1, 0]]) +
    rad('soleil', [['#fff8d8', 0, 0.95], ['#ffe08a', 0.35, 0.6], ['#ffb347', 1, 0]]) +
    rad('feuMur', [['#ff9a4a', 0, 0.22], ['#ff7a3c', 1, 0]]) +
    rad('feuFoyer', [['#ffd36a', 0, 0.95], ['#ff7a3c', 0.5, 0.75], ['#a8391a', 1, 0]]) +
    rad('cristal', [['#f2feff', 0], ['#8ff3ff', 0.5], ['#3fa9d6', 1]], 0.38, 0.32, 0.7) +
    '<clipPath id="atg-fenetre"><path d="M375,300 V150 A75,75 0 0 1 525,150 V300 Z"/></clipPath>' +
    '<clipPath id="atg-ov"><ellipse cx="73" cy="58" rx="54" ry="39"/></clipPath><clipPath id="atg-rd"><circle cx="73" cy="58" r="43"/></clipPath>' +
    defsThemes() + defsMimi() +
    '</defs></svg>';
}


/* ---------- La pièce, dessinée avec la perspective de 07-perspective.js ----------
   Le mur du fond (vu de face) va de x 70 à 1130, du haut (murHaut) au plancher (y 520) ; les murs de côté sont les plans X = 70 et X = 1130,
   le plancher le plan Y = 0. Les motifs des murs de côté et du plancher sont posés sur leur plan (pierres, rayures, planches… vont vers le
   point de fuite). Le haut des murs se voit (on regarde la pièce d'au-dessus, comme une maison de poupée).
   Pour remplir un écran très large, le mur du fond s'agrandit : V.ext = {l, r, t, b}. */
var LARGEUR = 1200;                 /* largeur du cœur de la pièce */
var COTE = 160;                     /* le monde déborde du cœur d'au moins ça de chaque côté (on voit tout le plancher) */
var FEN_DX = 0, CHEM_DX = 200;       /* la fenêtre et la cheminée sont dessinées à leur place d'origine puis décalées */
var FEN_CH = 300;                   /* la fenêtre de la chambre (plus à droite) */
/* L'arche entre les deux pièces : dans le mur de droite de l'atelier, dans le mur de gauche de la chambre (profondeur z0..z1, hauteur des côtés h) */
var ARCHE = {z0:50, z1:370, h:170};
/* la place de l'arche à l'écran (pour ne pas y installer de meuble à la première place) */
function zoneArche(V, s){
  var xm = s ? murG(V) : murD(V), a = proj(xm, ARCHE.h + (ARCHE.z1 - ARCHE.z0) / 2, ARCHE.z0), b = proj(xm, 0, ARCHE.z1);
  return s ? [Math.min(a[0], b[0]) - 10, a[1] - 10, Math.max(a[0], b[0]) + 60, b[1] + 10] : [Math.min(a[0], b[0]) - 60, a[1] - 10, Math.max(a[0], b[0]) + 10, b[1] + 10];
}
var PORTE = {x:650, y:520, w:136, h:206};
function f1(x){ return (Math.round(x * 10) / 10).toString(); }
function tF(y){ return (y - VPY) / (SOL_Y - VPY); }
function xF(xa, y){ return VPX + (xa - VPX) * tF(y); }
function pp(q){ return f1(q[0]) + ',' + f1(q[1]); }
function quad(a, b, c2, d){ return 'M' + pp(a) + ' L' + pp(b) + ' L' + pp(c2) + ' L' + pp(d) + ' Z '; }

/* Les couleurs d'un mur ou du plancher dans un thème (naturel : null, on garde les dégradés qui changent avec le moment) */
function coulMur(ti){ if(!ti) return null; var c = THEMES[ti].c; return [melange(c, '#3a2c5a', 0.2), melange(c, '#3a2c5a', 0.34), melange(c, '#3a2c5a', 0.48)]; }
function coulSol(ti){ if(!ti) return null; var c = THEMES[ti].c; return [melange(c, '#5c341d', 0.3), melange(c, '#5c341d', 0.44), melange(c, '#5c341d', 0.58)]; }
function degFond(id, cs, vert){ return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 0) + '"><stop offset="0" stop-color="' + cs[0] + '"/><stop offset="0.6" stop-color="' + cs[1] + '"/><stop offset="1" stop-color="' + cs[2] + '"/></linearGradient>'; }

/* Le motif d'un mur, dans les coordonnées du mur : u le long du mur (X pour le fond, Z pour un côté), v la hauteur (Y).
   W(u, v) → point de l'écran. Pour le mur du fond, W est l'identité (vu de face) ; pour un mur de côté, la projection. */
function motifPlan(forme, ti, W, u0, u1, H, sens){
  var cl = ti ? clair(THEMES[ti].c, 0.55) : '#ffffff', op = ti ? 0.22 : 0.06, fonce = 'rgba(10,6,20,.3)', s = '', d = '', i, u, v;
  function rect(ua, va, ub, vb){ return quad(W(ua, va), W(ub, va), W(ub, vb), W(ua, vb)); }
  function forme5(cu, cv, r, k){   /* une petite étoile (k = 0) ou une fleur (k = 1) posée sur le mur */
    var t = '';
    if(!k){ for(var j = 0; j < 8; j++){ var a = j / 8 * Math.PI * 2, rr = j % 2 ? r * 0.3 : r; t += (j ? ' L' : 'M') + pp(W(cu + Math.cos(a) * rr * sens, cv + Math.sin(a) * rr)); } return t + ' Z '; }
    for(var p = 0; p < 5; p++){ var b = p / 5 * Math.PI * 2, pu = cu + Math.cos(b) * 7 * sens, pv = cv + Math.sin(b) * 7; t += 'M' + pp(W(pu - 5 * sens, pv)) + ' L' + pp(W(pu, pv + 5)) + ' L' + pp(W(pu + 5 * sens, pv)) + ' L' + pp(W(pu, pv - 5)) + ' Z '; }
    return t;
  }
  if(forme === 0){          /* des pierres, en quinconce */
    for(var r = 0; r * 54 < H; r++){
      var v0 = r * 54 + 3, v1 = Math.min(H, r * 54 + 51), dec = (r % 2) * 50;
      for(u = u0 - ((u0 - dec) % 100 + 100) % 100 - 100 + dec; u < u1; u += 100) if(v1 - v0 > 12) d += rect(Math.max(u0, u + 4), v0, Math.min(u1, u + 96), v1);
    }
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.1 : 0.035) + '" stroke="rgba(10,6,20,.32)" stroke-width="3" stroke-linejoin="round"/>';
  }
  if(forme === 1){          /* des rayures */
    for(u = Math.floor(u0 / 64) * 64; u < u1; u += 64) d += rect(u, 0, u + 30, H);
    var d2 = '';
    for(u = Math.floor(u0 / 64) * 64 + 40; u < u1; u += 64) d2 += rect(u, 0, u + 4, H);
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + op + '"/><path d="' + d2 + '" fill="' + cl + '" fill-opacity="' + (op * 0.8) + '"/>';
  }
  if(forme === 2 || forme === 4){   /* des étoiles, ou des fleurs */
    for(v = 40; v < H; v += 90) for(u = Math.floor(u0 / 90) * 90 + ((v / 90 | 0) % 2) * 45; u < u1; u += 90) d += forme5(u, v, forme === 2 ? 11 : 0, forme === 2 ? 0 : 1);
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (op * (forme === 2 ? 1.4 : 1.3)) + '"/>';
  }
  /* boiseries : un lambris de bois en bas, une baguette, des panneaux */
  var bas = rect(u0, 0, u1, 196), pan = '';
  for(u = Math.floor(u0 / 120) * 120 + 14; u < u1; u += 120) pan += rect(u, 22, u + 92, 172);
  return '<path d="' + bas + '" fill="' + (ti ? sombre(THEMES[ti].c, 0.35) : '#3a2418') + '" fill-opacity="' + (ti ? 0.55 : 0.7) + '"/>' +
    '<path d="' + pan + '" fill="none" stroke="' + cl + '" stroke-opacity="' + (op * 1.8) + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="' + rect(u0, 196, u1, 210) + '" fill="' + (ti ? sombre(THEMES[ti].c, 0.2) : '#6b4a2a') + '" stroke="' + fonce + '" stroke-width="3"/>';
}
/* Le plancher (plan Y = 0) : planches, damier, chevrons, dalles ou moquette, de X xL à xR, de Z 0 à zMax */
function motifSol(forme, ti, xL, xR, zMax){
  var cl = ti ? clair(THEMES[ti].c, 0.35) : '#a87348', trait = 'rgba(40,20,10,.42)', d = '', i, j, X, Z;
  function S(x, z){ return proj(x, 0, z); }
  var pas = 71.7;
  if(forme === 1){        /* damier */
    for(X = xL; X < xR; X += 70) for(Z = 0, j = 0; Z < zMax; Z += 70, j++) if(((X - xL) / 70 + j) % 2 === 0) d += quad(S(X, Z), S(Math.min(xR, X + 70), Z), S(Math.min(xR, X + 70), Z + 70), S(X, Z + 70));
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.55 : 0.4) + '"/>';
  }
  if(forme === 3){        /* dalles de pierre, en quinconce */
    for(Z = 0, j = 0; Z < zMax; Z += 84, j++) for(X = xL - (j % 2) * 42; X < xR; X += 84) d += quad(S(Math.max(xL, X) + 3, Z + 3), S(Math.min(xR, X + 84) - 3, Z + 3), S(Math.min(xR, X + 84) - 3, Z + 81), S(Math.max(xL, X) + 3, Z + 81));
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.38 : 0.28) + '" stroke="' + trait + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  if(forme === 4){        /* moquette à petits points */
    for(Z = 30; Z < zMax; Z += 62) for(X = xL + 36; X < xR; X += 72){
      var c0 = S(X, Z), rx = 7 * sZ(Z), ry = rx * 0.32;
      d += 'M' + f1(c0[0] - rx) + ',' + f1(c0[1]) + ' a' + f1(rx) + ',' + f1(ry) + ' 0 1 0 ' + f1(2 * rx) + ',0 a' + f1(rx) + ',' + f1(ry) + ' 0 1 0 ' + f1(-2 * rx) + ',0 Z ';
    }
    return '<path d="' + d + '" fill="' + cl + '" fill-opacity="' + (ti ? 0.6 : 0.45) + '"/>';
  }
  /* planches (les chevrons : des joints en biais) */
  var l = '', jn = '';
  for(X = xL + pas; X < xR - 1; X += pas) l += 'M' + pp(S(X, 0)) + ' L' + pp(S(X, zMax)) + ' ';
  for(X = xL, i = 0; X < xR - 1; X += pas, i++){
    var xb = Math.min(xR, X + pas);
    if(forme === 0){ for(Z = 40 + (i * 137) % 220; Z < zMax; Z += 240) jn += 'M' + pp(S(X, Z)) + ' L' + pp(S(xb, Z)) + ' '; }
    else { for(Z = 0, j = 0; Z < zMax; Z += 60, j++){ var hautJ = (i + j) % 2 === 0; jn += 'M' + pp(S(X, hautJ ? Z : Z + 60)) + ' L' + pp(S(xb, hautJ ? Z + 60 : Z)) + ' '; } }
  }
  return T(l, trait, 3) + T(jn, trait, 3);
}
function svgFond(V){
  var vb = V.vb, xL = murG(V), xR = murD(V), haut = murHaut(V), H = SOL_Y - haut, bas = vb.y0 + vb.h, gauche = vb.x0, droite = vb.x0 + vb.w;
  /* jusqu'où on voit les murs de côté et le plancher (vers nous) */
  var sMax = Math.max((VPX - gauche) / (VPX - xL), (droite - VPX) / (xR - VPX), (bas - VPY) / (SOL_Y - VPY)) * 1.05, zMax = zS(sMax);
  var zSol = zS((bas - VPY) / (SOL_Y - VPY) * 1.02);
  /* (la chambre a ses murs et son plancher à elle : fond2, murG2, murD2, sol2) */
  var sx = V.salle ? '2' : '';
  var tF0 = decoTheme(V, 'fond' + sx), fF = decoForme(V, 'fond' + sx), tG = decoTheme(V, 'murG' + sx), fG = decoForme(V, 'murG' + sx), tD = decoTheme(V, 'murD' + sx), fD = decoForme(V, 'murD' + sx), tS = decoTheme(V, 'sol' + sx), fS = decoForme(V, 'sol' + sx);
  var defs = '', s = '';
  if(tF0) defs += degFond('atf-fond', coulMur(tF0), 1);
  if(tG) defs += degFond('atf-murG', coulMur(tG).map(function(c){ return sombre(c, 0.25); }), 0);
  if(tD) defs += degFond('atf-murD', coulMur(tD).map(function(c){ return sombre(c, 0.25); }).reverse(), 0);
  if(tS) defs += degFond('atf-sol', coulSol(tS), 1);
  function Wg(u, v){ return proj(xL, v, u); }
  function Wd(u, v){ return proj(xR, v, u); }
  function Wf(u, v){ return [u, SOL_Y - v]; }
  var pG = quad(Wg(0, 0), Wg(0, H), Wg(zMax, H), Wg(zMax, 0)), pD = quad(Wd(0, 0), Wd(0, H), Wd(zMax, H), Wd(zMax, 0));
  var pS = quad(proj(xL, 0, 0), proj(xR, 0, 0), proj(xR, 0, zSol), proj(xL, 0, zSol));
  defs += '<clipPath id="atf-cl-g"><path d="' + pG + '"/></clipPath><clipPath id="atf-cl-d"><path d="' + pD + '"/></clipPath><clipPath id="atf-cl-s"><path d="' + pS + '"/></clipPath><clipPath id="atf-cl-f"><rect x="' + f1(xL) + '" y="' + f1(haut) + '" width="' + f1(xR - xL) + '" height="' + f1(H) + '"/></clipPath>';
  /* au-dessus des murs : la nuit (on regarde la pièce d'en haut) */
  s += '<rect x="' + f1(gauche) + '" y="' + f1(vb.y0) + '" width="' + f1(vb.w) + '" height="' + f1(vb.h) + '" fill="#141028"/>';
  /* le mur du fond (on le touche : un autre papier peint, une autre couleur) */
  s += '<g data-surf="fond' + sx + '"><rect x="' + f1(xL) + '" y="' + f1(haut) + '" width="' + f1(xR - xL) + '" height="' + f1(H) + '" fill="' + (tF0 ? 'url(#atf-fond)' : G('murF')) + '"/>' +
    '<g clip-path="url(#atf-cl-f)">' + motifPlan(fF, tF0, Wf, xL, xR, H, 1) + '</g></g>';
  /* les murs de côté : leur motif posé sur leur plan ; un voile sombre (ils sont dans l'ombre) */
  s += '<g data-surf="murG' + sx + '"><path d="' + pG + '" fill="' + (tG ? 'url(#atf-murG)' : G('murC')) + '"/><g clip-path="url(#atf-cl-g)">' + motifPlan(fG, tG, Wg, 0, zMax, H, -1) + '</g><path d="' + pG + '" fill="rgba(10,6,20,.16)"/></g>';
  s += '<g data-surf="murD' + sx + '"><path d="' + pD + '" fill="' + (tD ? 'url(#atf-murD)' : G('murC2')) + '"/><g clip-path="url(#atf-cl-d)">' + motifPlan(fD, tD, Wd, 0, zMax, H, 1) + '</g><path d="' + pD + '" fill="rgba(10,6,20,.16)"/></g>';
  /* le plancher (on le touche : d'autres planches, un damier, des dalles…) */
  s += '<g data-surf="sol' + sx + '"><path d="' + pS + '" fill="' + (tS ? 'url(#atf-sol)' : G('sol')) + '"/><g clip-path="url(#atf-cl-s)">' + motifSol(fS, tS, xL, xR, zSol) + '</g>' +
    '<path d="' + quad(proj(xL, 0, 0), proj(xR, 0, 0), proj(xR, 0, 150), proj(xL, 0, 150)) + '" fill="' + G('solOmbre') + '"/></g>';
  /* les plinthes, les coins */
  s += P(quad(proj(xL, 0, 0), proj(xR, 0, 0), proj(xR, 14, 0), proj(xL, 14, 0)), G('boisS'), ' stroke-width="4"') +
    P(quad(Wg(0, 0), Wg(zMax, 0), Wg(zMax, 14), Wg(0, 14)), G('boisS'), ' stroke-width="4"') + P(quad(Wd(0, 0), Wd(zMax, 0), Wd(zMax, 14), Wd(0, 14)), G('boisS'), ' stroke-width="4"');
  s += T('M' + pp(Wg(0, H)) + ' L' + pp(Wg(0, 0)) + ' L' + pp(Wg(zMax, 0)) + ' M' + pp(Wd(0, H)) + ' L' + pp(Wd(0, 0)) + ' L' + pp(Wd(zMax, 0)), 'rgba(10,6,20,.5)', 4);
  /* le haut des murs (leur épaisseur, vue d'au-dessus) et la poutre du mur du fond */
  var e = 26;
  s += P(quad(proj(xL - e, H, -e), proj(xR + e, H, -e), proj(xR, H, 0), proj(xL, H, 0)), G('boisH'), ' stroke-width="4"') +
    P(quad(proj(xL - e, H, -e), proj(xL, H, 0), proj(xL, H, zMax), proj(xL - e, H, zMax)), G('boisH'), ' stroke-width="4"') +
    P(quad(proj(xR, H, 0), proj(xR + e, H, -e), proj(xR + e, H, zMax), proj(xR, H, zMax)), G('boisH'), ' stroke-width="4"');
  s += '<rect x="' + f1(xL) + '" y="' + f1(haut) + '" width="' + f1(xR - xL) + '" height="30" fill="' + G('boisS') + '" stroke="' + K + '" stroke-width="5"/>';
  for(var i = Math.ceil((xL + 34 - 104) / 160); 104 + i * 160 < xR - 40; i++) s += R(104 + i * 160, f1(haut + 26), 36, 20, 3, G('boisS'), ' stroke-width="4"');
  s += P(quad(Wg(0, H), Wg(zMax, H), Wg(zMax, H - 30), Wg(0, H - 30)), G('boisS')) + P(quad(Wd(0, H), Wd(zMax, H), Wd(zMax, H - 30), Wd(0, H - 30)), G('boisS'));
  /* l'atelier : la porte (ce qu'on cueille est posé devant), la fenêtre, la cheminée, l'arche vers la chambre ;
     la chambre : sa fenêtre, l'arche vers l'atelier */
  if(V.salle) s += svgFenetre(FEN_CH) + svgArche(V, 'g');
  else s += svgPorte() + svgFenetre(FEN_DX) + svgCheminee(V) + svgArche(V, 'd');
  return '<svg class="at-fond" viewBox="' + [f1(vb.x0), f1(vb.y0), f1(vb.w), f1(vb.h)].join(' ') + '" preserveAspectRatio="none" aria-hidden="true"><defs>' + defs + '</defs>' + s + '</svg>';
}
/* L'arche dans un mur de côté (elle mène à l'autre pièce) : posée sur le plan du mur, avec l'épaisseur du mur et une lumière chaude derrière.
   On la touche (ou le bouton 🛏️ / ⚗️ en bas à gauche) pour passer dans l'autre pièce ; on y lâche un objet pour l'y envoyer. */
function svgArche(V, cote){
  var xm = cote === 'g' ? murG(V) : murD(V), e = cote === 'g' ? -30 : 30, z0 = ARCHE.z0, z1 = ARCHE.z1, h = ARCHE.h, zc = (z0 + z1) / 2, r = (z1 - z0) / 2;
  function contour(x, m){
    var l = [proj(x, 0, z0 + m)];
    for(var i = 0; i <= 20; i++){ var a = Math.PI - i / 20 * Math.PI; l.push(proj(x, h + Math.sin(a) * (r - m), zc + Math.cos(a) * (r - m))); }
    l.push(proj(x, 0, z1 - m));
    return 'M' + l.map(pp).join(' L') + ' Z';
  }
  var id = 'atf-arche-' + cote, cx = proj(xm + e, h * 0.7, zc);
  var s = '<defs><radialGradient id="' + id + '" cx="' + f1(cx[0]) + '" cy="' + f1(cx[1]) + '" r="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".55"/><stop offset="1" stop-color="#2a1d3a" stop-opacity="0"/></radialGradient></defs>';
  s += '<g class="at-arche" data-at="salle">' +
    P(contour(xm, 0), G('pierre'), ' stroke-width="6"') + '<path d="' + contour(xm + e, 14) + '" fill="#1d1430"/>' + '<path d="' + contour(xm + e, 14) + '" fill="url(#' + id + ')"/>' +
    '<path d="' + contour(xm + e, 14) + '" fill="none" stroke="' + K + '" stroke-width="4"/>';
  /* une plaque au-dessus : 🛏️ (vers la chambre) ou ⚗️ (vers l'atelier), posée sur le mur */
  var c = ctx3d(repere([xm, 0, zc], cote === 'g' ? [[0, 0, -1], [0, -1, 0], [-1, 0, 0]] : [[0, 0, 1], [0, -1, 0], [1, 0, 0]], 0, 0), true);
  s += c.sur(Cir(0, -(h + r + 44), 30, G('boisH'), ' stroke-width="5"') + emo(0, -(h + r + 42), 34, cote === 'g' ? '⚗️' : '🛏️'), -2, 0, -(h + r + 44)) + '</g>';
  return s;
}
/* La fenêtre (le ciel change avec le moment : soleil, lune, étoiles) : un rebord de pierre qui avance un peu */
function svgFenetre(dx){
  var cr = ctx3d(repere([450 + dx, SOL_Y - 314, 0], AXES_MONDE, 0, 0), true), rebord = cr.boite(-92, -20, 92, 0, -26, 0, {face:G('boisH'), dessus:G('boisH'), cote:G('boisS')});
  return '<g transform="translate(' + dx + ',0)">' +
    '<g clip-path="url(#atg-fenetre)"><rect x="370" y="70" width="160" height="240" fill="' + G('ciel') + '"/>' +
    '<g class="at-ciel-nuit"><circle cx="478" cy="146" r="48" fill="' + G('haloL') + '"/><circle cx="478" cy="146" r="22" fill="#fff4cf"/><circle cx="486" cy="140" r="5" fill="#f0e2b0"/>' +
      '<circle cx="404" cy="118" r="2" fill="#fff"/><circle cx="420" cy="170" r="1.6" fill="#fff"/><circle cx="508" cy="214" r="1.8" fill="#fff"/><circle cx="398" cy="226" r="1.4" fill="#fff"/></g>' +
    '<g class="at-ciel-soleil"><circle class="at-soleil-halo" cx="450" cy="200" r="70" fill="' + G('soleil') + '"/><circle class="at-soleil" cx="450" cy="200" r="22" fill="#fff3c4"/></g>' +
    '<g class="at-ciel-nuages"><path d="M384,150 c4,-12 22,-12 26,-2 c8,-6 20,0 18,8 H384 Z M462,112 c4,-10 18,-10 22,-2 c6,-4 16,0 14,7 H462 Z" fill="#fff" opacity=".8"/></g>' +
    '<path class="at-collines" d="M370,300 L370,262 C392,250 404,226 420,240 C434,226 452,232 462,246 C476,236 496,232 512,250 L530,256 L530,300 Z" fill="#141a3a"/>' +
    '<path d="M370,282 C400,270 430,288 460,278 C490,268 510,282 530,276 L530,300 L370,300 Z" fill="rgba(200,210,255,.22)"/></g>' +
    '<path d="M375,300 V150 A75,75 0 0 1 525,150 V300 Z" fill="none" stroke="' + K + '" stroke-width="16"/>' +
    '<path d="M375,300 V150 A75,75 0 0 1 525,150 V300 Z" fill="none" stroke="#8a5a3a" stroke-width="8"/>' +
    T('M450,77 V300 M377,196 H523', K, 10) + T('M450,77 V300 M377,196 H523', '#8a5a3a', 5) + '</g>' + rebord;
}
/* La cheminée : le manteau, les piliers et la hotte avancent dans la pièce (leurs côtés et leur dessus se voient) */
var CHEMINEE = {x:950, y:284, x0:-150, x1:150, s:0.86, Y:236, Z:31};
var AXES_MONDE = [[1, 0, 0], [0, -1, 0], [0, 0, -1]];   /* pour le fond : x à droite, y = - la hauteur, z vers le mur (unités du monde) */
function svgCheminee(V){
  var X = 750 + CHEM_DX, c = ctx3d(repere([X, 0, 0], AXES_MONDE, 0, 0), true), s = '', H = SOL_Y - murHaut(V);
  /* (dans ce repère : x vers la droite, y = - la hauteur, z < 0 : vers nous) */
  /* la hotte, jusqu'en haut du mur ; elle s'évase au-dessus du manteau */
  s += c.boite(-120, -H, 120, -284, -46, 0, {face:G('pierre'), cote:G('pierre')}) +
    c.poly([[-120, -284, -46], [-156, -236, -70], [-156, -236, 0], [-120, -284, 0]], G('pierre')) +
    c.poly([[-120, -284, -46], [120, -284, -46], [156, -236, -70], [-156, -236, -70]], G('pierre'));
  var joints = [];
  [470, 414, 358, 302].forEach(function(Y, i){ if(Y < H - 10) joints.push(c.ligne([[-116, -Y, -46], [116, -Y, -46]], 'rgba(36,24,46,.35)', 3)); });
  [[-50, 470, 414], [50, 414, 358], [-30, 358, 302], [20, 470, 414]].forEach(function(q){ if(q[1] < H - 10) joints.push(c.ligne([[q[0], -q[1], -46], [q[0], -q[2], -46]], 'rgba(36,24,46,.35)', 3)); });
  s += joints.join('');
  /* (23 novembre) LE FOYER : un vrai creux dans le mur, où le grand chaudron est scellé (FOYER). Devant, la pierre de l'âtre avance
     dans la pièce ; dedans (tout ce qui dépasse de l'ouverture est coupé) : le mur du fond noirci et ses briques, la joue de droite
     (on regarde la cheminée d'un peu à gauche : celle de gauche ne se voit pas), le sol de pierre et la lueur des braises. */
  var OW = FOYER.ow, PF = FOYER.prof, JT = 'rgba(36,24,46,.38)';
  var ouv = 'M' + (X - OW) + ',522 L' + (X - OW) + ',376 C' + (X - OW) + ',322 ' + (X + OW) + ',322 ' + (X + OW) + ',376 L' + (X + OW) + ',522 Z';
  s += c.poly([[-150, 0, 0], [150, 0, 0], [160, 0, -84], [-160, 0, -84]], G('pierre')) +
    c.ligne([[-54, 0, -3], [-58, 0, -81]], JT, 3) + c.ligne([[54, 0, -3], [58, 0, -81]], JT, 3);
  var fond = '', i, jy;
  for(i = 1; i < 8; i++){
    jy = -i * 27;
    fond += c.ligne([[-OW, jy, PF], [OW, jy, PF]], 'rgba(255,255,255,.07)', 2.5);
    for(var jx = -OW + (i % 2 ? 26 : 52); jx < OW; jx += 52) fond += c.ligne([[jx, jy, PF], [jx, jy + 27, PF]], 'rgba(255,255,255,.07)', 2.5);
  }
  s += '<clipPath id="atc-foyer"><path d="' + ouv + '"/></clipPath>' + P(ouv, '#1b0e0a') +
    '<g clip-path="url(#atc-foyer)">' +
      c.poly([[-OW - 6, -240, PF], [OW + 6, -240, PF], [OW + 6, 0, PF], [-OW - 6, 0, PF]], '#22130f', ' stroke-width="3"') + fond +
      c.poly([[OW, -240, 0], [OW, -240, PF], [OW, 0, PF], [OW, 0, 0]], '#38231c', ' stroke-width="3"') +
      c.poly([[-OW, 0, 0], [OW, 0, 0], [OW, 0, PF], [-OW, 0, PF]], '#4d3d42', ' stroke-width="3"') +
      c.ligne([[-36, 0, 2], [-36, 0, PF]], JT, 2.5) + c.ligne([[38, 0, 2], [38, 0, PF]], JT, 2.5) + c.ligne([[-OW, 0, PF * 0.5], [OW, 0, PF * 0.5]], JT, 2.5) +
      '<ellipse cx="' + f1(c.Q(0, 0, 34)[0]) + '" cy="' + f1(c.Q(0, 0, 34)[1]) + '" rx="96" ry="26" fill="' + G('feuFoyer') + '" opacity=".6"/>' +
      '<ellipse cx="' + X + '" cy="430" rx="120" ry="110" fill="' + G('feuFoyer') + '" opacity=".22"/>' +
    '</g>' + T(ouv, K, SW) +
    /* les deux piliers (plus minces qu'avant : le chaudron passe entre eux) */
    c.boite(-138, -210, -OW, 0, -40, 0, {face:G('pierre'), dessus:G('pierre'), cote:G('pierre')}) + c.boite(OW, -210, 138, 0, -40, 0, {face:G('pierre'), dessus:G('pierre'), cote:G('pierre')});
  /* le manteau (on peut y poser de petites choses) et sa bougie */
  s += c.boite(-166, -236, 166, -206, -62, 0, {face:G('bois'), dessus:G('boisH'), cote:G('boisS')}) +
    c.boite(-144, -270, -128, -236, -40, -28, {face:'#f6ecd2', dessus:'#fffaf0', cote:'#e8dcc0'}) +
    '<path d="' + 'M' + pp(c.Q(-136, -270, -34)) + ' c-5,-6 -3,-12 0,-18 c3,6 5,12 0,18 Z" fill="#ffd36a" stroke="#e8693c" stroke-width="2"/>';
  return s;
}
/* Les lumières qui bougent : en HTML pour que le compositeur les anime sans repeindre le fond */
function fondAnime(V){
  function boite(x, y, w, h){ return 'left:' + pX(V, x) + ';top:' + pY(V, y) + ';width:' + pW(V, w) + ';height:' + pH(V, h); }
  var fx = V.salle ? FEN_CH : FEN_DX, s = '<div class="at-fond-anim" aria-hidden="true">' +
    (V.salle ? '' : '<i class="at-a-mur" style="' + boite(410 + CHEM_DX, 170, 680, 540) + '"></i>') +
    '<i class="at-a-rayon" style="' + boite(352 + fx, 312, 300, 478) + '"></i>' +
    (V.salle ? '' : '<i class="at-a-foyer" style="' + boite(654 + CHEM_DX, 433, 192, 132) + '"></i>') +
    '<span class="at-a-fen" style="' + boite(383 + fx, 83, 134, 213) + '"><i></i></span>';
  for(var i = 0; i < 6; i++) s += '<b class="at-a-pouss" style="left:' + pX(V, 414 + fx + (i * 37) % 170) + ';top:' + pY(V, 387 + (i * 59) % 280) + ';animation-delay:-' + (i * 1.5).toFixed(1) + 's"></b>';
  return s + '</div>';
}

/* ---------- Petits dessins partagés ---------- */
function fiolePetite(x, base, c){
  var plein = !!c;
  return (plein ? '<circle class="at-halo" cx="' + x + '" cy="' + (base - 12) + '" r="20" fill="' + G('haloC') + '"/>' : '') +
    P('M' + (x - 5) + ',' + (base - 34) + ' L' + (x + 5) + ',' + (base - 34) + ' L' + (x + 5) + ',' + (base - 24) + ' C' + (x + 13) + ',' + (base - 20) + ' ' + (x + 13) + ',' + (base - 2) + ' ' + x + ',' + base +
      ' C' + (x - 13) + ',' + (base - 2) + ' ' + (x - 13) + ',' + (base - 20) + ' ' + (x - 5) + ',' + (base - 24) + ' Z', G('verre'), ' stroke-width="3.5"') +
    (plein ? '<path d="M' + (x - 10) + ',' + (base - 13) + ' C' + (x - 9) + ',' + (base - 2) + ' ' + (x + 9) + ',' + (base - 2) + ' ' + (x + 10) + ',' + (base - 13) + ' Z" fill="' + c + '"/>' : '') +
    R(x - 4, base - 40, 8, 7, 2, '#c58a4a', ' stroke-width="2.5"');
}
function flammesSVG(cx, by, l){
  return '<g class="at-flammes">' +
    '<path class="at-fl f1" d="M' + (cx - 46) + ',' + by + ' C' + (cx - 58) + ',' + (by - 22) + ' ' + (cx - 38) + ',' + (by - 34) + ' ' + (cx - 40) + ',' + (by - 52) + ' C' + (cx - 26) + ',' + (by - 38) + ' ' + (cx - 20) + ',' + (by - 24) + ' ' + (cx - 22) + ',' + by + ' Z"/>' +
    '<path class="at-fl f2" d="M' + (cx - 16) + ',' + by + ' C' + (cx - 28) + ',' + (by - 30) + ' ' + (cx - 4) + ',' + (by - 44) + ' ' + (cx - 6) + ',' + (by - 68) + ' C' + (cx + 12) + ',' + (by - 44) + ' ' + (cx + 16) + ',' + (by - 26) + ' ' + (cx + 10) + ',' + by + ' Z"/>' +
    '<path class="at-fl f3" d="M' + (cx + 22) + ',' + by + ' C' + (cx + 14) + ',' + (by - 22) + ' ' + (cx + 34) + ',' + (by - 32) + ' ' + (cx + 30) + ',' + (by - 50) + ' C' + (cx + 46) + ',' + (by - 34) + ' ' + (cx + 52) + ',' + (by - 18) + ' ' + (cx + 42) + ',' + by + ' Z"/>' +
    '</g>' + (l ? R(cx - l, by - 4, l * 2, 12, 6, G('boisS'), ' transform="rotate(-6 ' + cx + ' ' + by + ')"') + R(cx - l, by - 4, l * 2, 12, 6, G('bois'), ' transform="rotate(7 ' + cx + ' ' + by + ')"') : '');
}

/* ==========================================================
   Ce qui est fixe dans la pièce : la porte ; devant elle, la cueillette et les potions prêtes
   (le carton de rangement est une petite icône 📦 fixe, en bas à droite de l'écran)
   ========================================================== */
function svgPorte(){
  var x0 = PORTE.x - PORTE.w / 2, x1 = PORTE.x + PORTE.w / 2, y0 = PORTE.y - PORTE.h, r = PORTE.w / 2, s = '';
  s += P('M' + (x0 - 16) + ',520 V' + (y0 + r) + ' A' + (r + 16) + ',' + (r + 16) + ' 0 0 1 ' + (x1 + 16) + ',' + (y0 + r) + ' V520 Z', G('pierre'));
  var d = 'M' + x0 + ',520 V' + (y0 + r) + ' A' + r + ',' + r + ' 0 0 1 ' + x1 + ',' + (y0 + r) + ' V520 Z';
  s += P(d, G('boisC'));
  var pl = '';
  for(var i = 1; i < 4; i++){ var x = x0 + i * PORTE.w / 4; pl += 'M' + f1(x) + ',' + f1(y0 + r - Math.sqrt(Math.max(0, r * r - Math.pow(x - PORTE.x, 2)))) + ' V518 '; }
  s += T(pl, '#7a4524', 3);
  s += T('M' + (x0 + 4) + ',' + (y0 + 104) + ' H' + (x1 - 4) + ' M' + (x0 + 4) + ',' + (y0 + 172) + ' H' + (x1 - 4), '#3a2a4a', 9) + T('M' + (x0 + 4) + ',' + (y0 + 104) + ' H' + (x1 - 4) + ' M' + (x0 + 4) + ',' + (y0 + 172) + ' H' + (x1 - 4), '#6a5f92', 4);
  s += Cir(PORTE.x, y0 + 52, 20, G('ciel')) + T('M' + PORTE.x + ',' + (y0 + 33) + ' V' + (y0 + 71) + ' M' + (PORTE.x - 19) + ',' + (y0 + 52) + ' H' + (PORTE.x + 19), K, 3);
  s += Cir(x1 - 20, y0 + 140, 7, G('or')) + reflet('M' + (x0 + 12) + ',' + (y0 + 76) + ' V510', 3);
  /* la chatière (étape 4) : un petit volet en bas de la porte, qui bascule quand le chat passe */
  var cx0 = PORTE.x - 30, cx1 = PORTE.x + 30, cy0 = 466;
  s += P('M' + cx0 + ',519 V' + (cy0 + 12) + ' Q' + cx0 + ',' + cy0 + ' ' + (cx0 + 12) + ',' + cy0 + ' H' + (cx1 - 12) + ' Q' + cx1 + ',' + cy0 + ' ' + cx1 + ',' + (cy0 + 12) + ' V519 Z', '#2a1c34', ' stroke-width="4"');
  s += '<g class="at-chatiere-volet">' + P('M' + (cx0 + 5) + ',' + (cy0 + 6) + ' H' + (cx1 - 5) + ' V515 H' + (cx0 + 5) + ' Z', G('boisH'), ' stroke-width="3"') +
    T('M' + (cx0 + 12) + ',' + (cy0 + 20) + ' H' + (cx1 - 12) + ' M' + (cx0 + 12) + ',' + (cy0 + 34) + ' H' + (cx1 - 12), '#b07c46', 2.5) + emo(PORTE.x, cy0 + 27, 14, '🐾') + '</g>';
  s += T('M' + (cx0 - 2) + ',' + (cy0 + 5) + ' H' + (cx1 + 2), K, 5) + T('M' + (cx0 - 2) + ',' + (cy0 + 5) + ' H' + (cx1 + 2), '#6a5f92', 2.5);
  return s;
}

/* Les potions prêtes : des flacons posés par terre devant la porte, devant la cueillette (on les touche : à quoi elle sert, donner, vendre) */
/* Les potions finies : des flacons debout sur le plancher devant la porte, juste devant la cueillette (une rangée) */
var FLACONS = {dy:40, dx:80, w:80, h:104, p:64};
function posFlacon(i, n, rangs){ return {x:TAS.x + (i - (n - 1) / 2) * FLACONS.dx, y:TAS.y + FLACONS.dy + (rangs || 0) * TAS.dy}; }
function dessinFlacon(k, n, R){
  var p = (DD().POTIONS || {})[k] || {}, col = p.c || '#8ff3ff', x = ajouterOutils3d(ctx3d(R, false)), cz = 32, l = [];
  x.p = FLACONS.p; x.cat = {w:FLACONS.w, h:FLACONS.h};
  for(var i = 0; i < 24; i++){ var a = i / 24 * Math.PI * 2; l.push(x.Q(40 + Math.cos(a) * 36, FLACONS.h, cz + Math.sin(a) * 30)); }
  var s = '<path d="' + lisse(l, true) + '" fill="rgba(12,6,20,.32)"/>' +
    x.sur('<circle class="at-halo" cx="40" cy="60" r="46" fill="' + G('haloC') + '"/>', cz) +
    x.tour(40, cz, [[102, 22], [90, 30], [72, 30], [56, 24], [44, 11]], G('verre'), null, ' stroke-width="4"') +
    x.tour(40, cz, [[99, 19], [88, 26.5], [68, 27]], col, clair(col, 0.4), ' stroke-width="0" opacity=".92"') +
    x.cylindre(40, cz, 8, 14, 46, G('verre'), null, ' stroke-width="3.5"') + x.cylindre(40, cz, 10, 2, 16, '#c58a4a', '#e0a868', ' stroke-width="3"') +
    x.sur(T('M22,58 C18,68 18,80 22,88', '#fff', 4, ' opacity=".55"') + emo(40, 82, 26, p.ic || '🧪'), cz - 29);
  if(n > 1) s += x.sur('<circle cx="68" cy="20" r="15" fill="#24182e" stroke="#fff6d8" stroke-width="3"/><text x="68" y="20" font-size="17" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + n + '</text>', cz);
  [[-6, -6], [86, -6], [-6, 104]].forEach(function(q){ x.Q(q[0], q[1], cz - 30); });
  var b = x.bb.slice();
  return {svg:'<rect x="' + f1(b[0]) + '" y="' + f1(b[1]) + '" width="' + f1(b[2] - b[0]) + '" height="' + f1(b[3] - b[1]) + '" fill="transparent"/>' + s, bb:b};
}
var TAS = {x:650, y:606, w:86, h:86, rang:4, dx:98, dy:78};
function posTas(i, n){
  var r = Math.floor(i / TAS.rang), dans = Math.min(TAS.rang, n - r * TAS.rang), col = i % TAS.rang;
  return {x:TAS.x + (col - (dans - 1) / 2) * TAS.dx + (r % 2) * 12, y:TAS.y + r * TAS.dy};
}
/* Un tas de la cueillette : un panier d'osier (une cruche pour les liquides) posé sur le plancher, et sa grosse étiquette ronde */
function dessinTas(k, n, R){
  var col = coulIngr(k), liq = estLiquide(k), x = ajouterOutils3d(ctx3d(R, false)), cz = 30, l = [];
  x.p = 60; x.cat = {w:TAS.w, h:TAS.h};
  for(var i = 0; i < 24; i++){ var a = i / 24 * Math.PI * 2; l.push(x.Q(43 + Math.cos(a) * 40, TAS.h, cz + Math.sin(a) * 30)); }
  var s = '<path d="' + lisse(l, true) + '" fill="rgba(12,6,20,.3)"/>';
  if(liq) s += x.tour(43, cz, [[54, 16], [62, 26], [74, 30], [86, 22]], G('terre'), null) + x.cylindre(43, cz, 13, 46, 56, G('terre'), clair(col, 0.2));
  else {
    s += x.cylindre(43, cz, 36, 58, 86, '#c58a4a', null, '', 30) + x.arcAvant(43, cz, 35, 68, '#8a5a2a', 3) + x.arcAvant(43, cz, 33, 78, '#8a5a2a', 3) +
      x.tour(43, cz, [[50, 18], [54, 28], [58, 33]], col, null, ' stroke-width="3.5"') + x.cylindre(43, cz, 37, 56, 62, '#d9a066', null, ' stroke-width="3.5"');
  }
  s += x.sur('<circle cx="43" cy="40" r="30" fill="' + col + '" stroke="' + K + '" stroke-width="4"/><circle cx="43" cy="40" r="24" fill="#fff6e0" stroke="' + K + '" stroke-width="1.5" opacity=".94"/>' +
    emo(43, 42, 34, icIngr(k)) + (liq ? emo(16, 14, 16, '💧') : '') +
    (n > 1 ? '<circle cx="70" cy="62" r="14" fill="#24182e" stroke="#fff6d8" stroke-width="3"/><text x="70" y="62" font-size="16" font-weight="800" fill="#fff6d8" text-anchor="middle" dominant-baseline="central">' + n + '</text>' : ''), cz - 30);
  [[-6, -12], [92, -12], [-6, 80], [92, 80]].forEach(function(q){ x.Q(q[0], q[1], cz - 30); });     /* (l'étiquette compte dans le cadre : on la touche facilement) */
  var b = x.bb.slice();
  return {svg:'<rect x="' + f1(b[0]) + '" y="' + f1(b[1]) + '" width="' + f1(b[2] - b[0]) + '" height="' + f1(b[3] - b[1]) + '" fill="transparent"/>' + s, bb:b};
}
/* ==========================================================
   Géométrie de la pièce : un « cœur » de 1200 × 860, agrandi pour remplir l'écran (V.ext, V.vb).
   Le « monde » (toute la pièce) fait V.vb × V.k pixels ; sur un téléphone il est plus grand que l'écran et on le fait glisser (V.pan).
   Chaque objet est posé dans la pièce en 3D (07-perspective.js) et dessiné avec la même perspective.
   Où il est (dans l'état) :
   - par terre : (o.x, o.y) = à l'écran, le milieu du bas de sa face avant ; contre un mur de côté (o.cote) : o.pz = sa profondeur ;
   - au mur du fond : (o.x, o.y) = le milieu du bas de son dos, sur le mur ; sur un mur de côté (o.cote) : o.pz, o.py (profondeur, hauteur) ;
   - posé sur un meuble : o.sur = {o:le meuble, k:la surface, dx}.
   Il reste exactement là où on le lâche (même devant la porte) ; seul changement automatique : contre un mur de côté,
   un meuble se met de profil et une décoration du mur prend la perspective de ce mur.
   ========================================================== */
function extDe(V){ return V.ext || {l:COTE, r:COTE, t:0, b:0}; }
/* le mur du fond s'agrandit seulement quand l'écran est plus large que la pièce et ses deux murs de côté */
function murG(V){ return 70 - Math.max(0, extDe(V).l - COTE); }
function murD(V){ return LARGEUR - 70 + Math.max(0, extDe(V).r - COTE); }
function solMax(V){ return 850 + extDe(V).b; }
function murHaut(V){ return 36 - extDe(V).t; }
function hautMur(V){ return SOL_Y - murHaut(V); }
function zMaxSol(V){ return surSol(VPX, solMax(V)).Z; }
function bordG(V, y){ return xF(murG(V), y); }
function bordD(V, y){ return xF(murD(V), y); }
function solXmin(V, y){ return Math.max(V.vb.x0 + 8, bordG(V, y) + 4); }
function solXmax(V, y){ return Math.min(V.vb.x0 + V.vb.w - 8, bordD(V, y) - 4); }
/* positions en % du monde (toute la pièce) */
function pX(V, x){ return ((x - V.vb.x0) / V.vb.w * 100).toFixed(3) + '%'; }
function pY(V, y){ return ((y - V.vb.y0) / V.vb.h * 100).toFixed(3) + '%'; }
function pW(V, w){ return (w / V.vb.w * 100).toFixed(3) + '%'; }
function pH(V, h){ return (h / V.vb.h * 100).toFixed(3) + '%'; }
var POS_CARTONS = [[400, 846], [900, 846], [250, 846], [1050, 846], [120, 780], [1180, 780], [300, 760], [1000, 760]];

/* ---------- Le repère d'un objet (là où il est dans la pièce) ---------- */
function profDe(c){ return (c.p || 40) / S_REF; }              /* sa profondeur dans le monde */
function largDe(c){ return c.w / S_REF; }
/* un objet posé sur un meuble (ou sur le manteau de la cheminée) : l'endroit de la surface (dans le monde) et le sens du meuble */
function surfaceRepere(V, o, prof){
  var c = catDe(o);
  if(o.sur.o === 'cheminee') return {o:[CHEMINEE.x + o.sur.dx * CHEMINEE.s, CHEMINEE.Y, CHEMINEE.Z + profDe(c) / 2], ax:AXES_FACE};
  var par = V.parId[o.sur.o];
  if(!par || par.sur || par === o) return null;
  var cp = catDe(par), sf = (cp.surf || [])[o.sur.k];
  if(!sf) return null;
  var Rp = repereObjet(V, par, (prof || 0) + 1), zc = sf.z !== undefined ? sf.z : (cp.p || 40) / 2;
  return {o:mondeDe(Rp, cp.w / 2 + o.sur.dx, cp.h + sf.y, Math.max(2, zc - (c.p || 40) / 2)), ax:Rp.ax};
}
function repereObjet(V, o, prof){
  var c = catDe(o), xl = murG(V), xr = murD(V);
  if(c.fixe) return repere([FOYER.x, 0, FOYER.Z], AXES_FOYER, c.w, c.h);      /* le chaudron : scellé dans le foyer */
  if(o.sur && (prof || 0) < 3){
    var S = surfaceRepere(V, o, prof);
    if(S) return repere(S.o, S.ax, c.w, c.h);
    /* (le meuble dessous n'est pas là : on le dessine par terre ; reajuster le pose pour de bon) */
    var q0 = surSol(o.x || 600, Math.max(o.y || 0, SOL_MIN + 40));
    return repere([q0.X, 0, q0.Z], AXES_FACE, c.w, c.h);
  }
  var pw = profDe(c);
  if(c.z === 'mur'){
    if(o.cote){
      var Z = o.pz !== undefined ? o.pz : 300, Y = o.py !== undefined ? o.py : SOL_Y - (o.y || 300);
      return repere([o.cote === 'g' ? xl + pw : xr - pw, Y, Z], axesDe(o.cote), c.w, c.h);
    }
    return repere([o.x, SOL_Y - o.y, pw], AXES_FACE, c.w, c.h);
  }
  if(o.cote){
    var z2 = o.pz !== undefined ? o.pz : surSol(o.x, o.y).Z;
    return repere([o.cote === 'g' ? xl + pw : xr - pw, 0, z2], axesDe(o.cote), c.w, c.h);
  }
  var q = surSol(o.x, o.y);
  return repere([q.X, 0, q.Z], AXES_FACE, c.w, c.h);
}
/* Où il est dessiné : x, y (l'ancre à l'écran), s (son échelle), z (l'ordre : ce qui est devant passe devant), R (son repère) */
function posObj(V, o, prof){
  var c = catDe(o), R = repereObjet(V, o, prof), z;
  if(o.sur){
    var par = V.parId[o.sur.o], zp = o.sur.o === 'cheminee' ? 400 : (par ? posObj(V, par, (prof || 0) + 1).z : 1000);
    z = zp + 1 + (o.sur.k || 0) * 0.3 + (o.sur.dx + 300) / 3000;
  } else if(c.z === 'mur') z = (o.cote ? 120 + R.o[2] / 20 : 100) + (SOL_Y - R.o[1]) / 100;
  else {
    /* par terre : d'après le point le plus en avant de l'objet */
    var avant = o.cote ? R.o[2] + largDe(c) / 2 : R.o[2];
    z = (c.z === 'tapis' ? 600 : 1000) + proj(VPX, 0, avant)[1] / (c.z === 'tapis' ? 10 : 1);
  }
  return {x:R.A[0], y:R.A[1], s:R.k, z:z, R:R};
}
/* La boîte de l'objet à l'écran (unités du monde) : [x0, y0, x1, y1] (les 8 coins de sa boîte 3D) */
function boite(o, p){
  var c = catDe(o), R = p.R, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  if(!R) return [p.x - 40, p.y - 80, p.x + 40, p.y];
  [0, c.w].forEach(function(x){ [0, c.h].forEach(function(y){ [0, c.p || 40].forEach(function(z){
    var W = mondeDe(R, x, y, z), q = proj(W[0], W[1], W[2]);
    if(q[0] < x0) x0 = q[0]; if(q[1] < y0) y0 = q[1]; if(q[0] > x1) x1 = q[0]; if(q[1] > y1) y1 = q[1];
  }); }); });
  return [x0, y0, x1, y1];
}
function inter(a, b){
  var w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  return w > 0 && h > 0 ? w * h : 0;
}
function enfantsDe(V, o){ return V.etat.objets.filter(function(e){ return e.sur && e.sur.o === o.id; }); }
/* Les deux pièces : 0 l'atelier, 1 la chambre (o.pc = 1 ; un carton de la chambre : k.ch = 1). Une seule est dessinée à la fois. */
function salleDe(o){ return o && o.pc === 1 ? 1 : 0; }
function ici(V, s){ s = s === undefined ? V.salle : s; return V.etat.objets.filter(function(o){ return salleDe(o) === s; }); }
function cartonsIci(V){ return V.etat.cartons.filter(function(k){ return (k.ch ? 1 : 0) === V.salle; }); }
/* Les meubles qui se mettent de profil contre un mur de côté */
function profilable(c){ return !!c.profil || (!!c.cases && c.z !== 'petit'); }

/* ---------- Poser un objet : exactement là où on le lâche ----------
   (ax, ay) : l'ancre lâchée, à l'écran. On ne fait que garder l'objet dans la pièce (entre les murs, sur le mur). */
function poserSol(V, o, ax, ay){
  var c = catDe(o), xl = murG(V), xr = murD(V), q = surSol(ax, Math.max(ay, SOL_Y + 2)), hw = largDe(c) / 2, pw = profDe(c);
  var Z = borne(q.Z, pw, zMaxSol(V)), X = q.X;
  o.sur = null;
  /* contre un mur de côté : de profil (il garde sa profondeur), sans bouger d'ailleurs */
  if(profilable(c) && c.z !== 'tapis' && (X - hw < xl + 28 || X + hw > xr - 28)){
    o.cote = X - hw < xl + 28 ? 'g' : 'd';
    o.pz = borne(Z, hw + 2, zMaxSol(V));
    var A = proj(o.cote === 'g' ? xl + pw : xr - pw, 0, o.pz);
    o.x = A[0]; o.y = A[1];
    return;
  }
  o.cote = 0; delete o.pz;
  X = borne(X, xl + hw * 0.9, xr - hw * 0.9);
  /* il reste dans ce qu'on voit du monde */
  var s = sZ(Z), A2 = proj(X, 0, Z), lim = c.w * s / S_REF / 2;
  A2[0] = borne(A2[0], V.vb.x0 + lim * 0.6, V.vb.x0 + V.vb.w - lim * 0.6);
  o.x = Math.round(A2[0] * 10) / 10; o.y = Math.round(A2[1] * 10) / 10;
}
function poserMur(V, o, ax, ay){
  var c = catDe(o), xl = murG(V), xr = murD(V), H = hautMur(V), pw = profDe(c), hw = largDe(c) / 2, hh = c.h / S_REF;
  var s0 = sZ(pw), X = VPX + (ax - VPX) / s0, Y = SOL_Y - VPY - (ay - VPY) / s0;
  o.sur = null;
  /* (à l'écran, le mur du fond va de xl à xr ; ce qui est à gauche est sur le mur de gauche. Un objet déjà sur un mur de côté y reste
     tant qu'on ne l'amène pas franchement sur le mur du fond.) */
  var gauche = ax < xl + (o.cote === 'g' ? 70 : 0), droite = ax > xr - (o.cote === 'd' ? 70 : 0);
  if(gauche || droite){
    /* sur un mur de côté : il prend la perspective de ce mur (il reste où on l'a mis) */
    o.cote = gauche ? 'g' : 'd';
    var m = surCote(ax, ay, o.cote === 'g' ? xl + pw : xr - pw);
    o.pz = Math.round(borne(m.Z, hw + 4, zMaxSol(V) - hw)); o.py = Math.round(borne(m.Y, 0, H - hh));
    var A = proj(o.cote === 'g' ? xl + pw : xr - pw, o.py, o.pz);
    o.x = A[0]; o.y = A[1];
    return;
  }
  o.cote = 0; delete o.pz; delete o.py;
  o.x = Math.round(borne(X, xl + hw, xr - hw) * 10) / 10;
  o.y = Math.round((SOL_Y - borne(Y, 0, H - hh)) * 10) / 10;
}
/* Le dessus d'un meuble sous l'endroit visé (pour y poser un petit objet) */
function surfaceSous(V, o, x, y){
  var best = null, c = catDe(o);
  function essai(oid, k, R, sf, pc){
    var cx = ctx3d(R, true), zc = sf.z !== undefined ? sf.z : (pc.p || 40) / 2;
    var g = cx.Q(pc.w / 2 + sf.x0, pc.h + sf.y, zc), d = cx.Q(pc.w / 2 + sf.x1, pc.h + sf.y, zc);
    var dy = y - (g[1] + d[1]) / 2, x0 = Math.min(g[0], d[0]), x1 = Math.max(g[0], d[0]);
    if(x < x0 - 12 || x > x1 + 12 || dy < -64 || dy > 40) return;
    if(!best || Math.abs(dy) < Math.abs(best.dy)){
      var t = Math.abs(d[0] - g[0]) > 1 ? (x - g[0]) / (d[0] - g[0]) : 0.5;
      best = {oid:oid, k:k, dx:sf.x0 + borne(t, 0, 1) * (sf.x1 - sf.x0), x0:sf.x0, x1:sf.x1, dy:dy};
    }
  }
  var Rc = repere([CHEMINEE.x, CHEMINEE.Y, CHEMINEE.Z], AXES_FACE, 0, 0);
  if(!V.salle) essai('cheminee', 0, Rc, {x0:CHEMINEE.x0 * CHEMINEE.s * S_REF, x1:CHEMINEE.x1 * CHEMINEE.s * S_REF, y:0, z:0}, {w:0, h:0, p:0});
  V.etat.objets.forEach(function(p){
    if(p === o || p.sur || salleDe(p) !== V.salle) return;
    var cp = catDe(p);
    if(!cp.surf) return;
    var R = repereObjet(V, p);
    cp.surf.forEach(function(sf, k){ essai(p.id, k, R, sf, cp); });
  });
  if(best){
    var demi = c.w * 0.3, a = best.x0 + demi, b = best.x1 - demi;
    best.dx = a <= b ? borne(best.dx, a, b) : (best.x0 + best.x1) / 2;
    if(best.oid === 'cheminee') best.dx = best.dx / (CHEMINEE.s * S_REF);
    best.dx = Math.round(best.dx / 5) * 5;
  }
  return best;
}
/* (17 novembre) Mimi qu'on porte : lâchée sur un de ses coins douillets (son panier, un coussin, le hamac…), ou tout près, elle s'y
   retrouve — on n'a pas à viser le creux du panier au millimètre. x, y : là où sont ses pattes. */
function coinSous(V, o, x, y){
  var best = null;
  ici(V).forEach(function(p){
    if(p === o || p.sur || !DODO_ICI.test(p.t)) return;
    var cp = catDe(p);
    if(!cp.surf) return;
    var pp = posObj(V, p), b = boite(p, pp);
    if(x < b[0] - 40 || x > b[2] + 40 || y < b[1] - 10 || y > b[3] + 70) return;      /* (elle est à moitié dessus : ça suffit) */
    var cx = ctx3d(pp.R, true);
    cp.surf.forEach(function(sf, k){
      var m = cx.Q(cp.w / 2 + (sf.x0 + sf.x1) / 2, cp.h + sf.y, sf.z !== undefined ? sf.z : (cp.p || 40) / 2), dd = Math.hypot(x - m[0], (y - m[1]) * 0.7);
      if(!best || dd < best.dd) best = {oid:p.id, k:k, dx:Math.round((sf.x0 + sf.x1) / 10) * 5, dd:dd};
    });
  });
  return best;
}
/* Pose un objet à l'endroit lâché : sur un meuble (un petit objet), sur un mur, ou par terre */
function resoudre(V, o, x, y){
  var c = catDe(o);
  if(c.z === 'petit'){
    var sf = surfaceSous(V, o, x, y) || (o.t === 'chat' ? coinSous(V, o, x, y) : null);
    if(sf){ o.sur = {o:sf.oid, k:sf.k, dx:sf.dx}; o.cote = 0; delete o.pz; delete o.py; return; }
  }
  if(c.z === 'mur') poserMur(V, o, x, y);
  else poserSol(V, o, x, y);
}
/* La place qu'un objet prend (pour la première place des nouveaux) : des rectangles sur le plancher (X, Z), le mur du fond (X, Y)
   ou un mur de côté (Z, Y), dans le monde. Un meuble par terre contre un mur prend aussi un peu de ce mur. */
function empreintes(V, o){
  var c = catDe(o);
  if(o.sur || o.t === 'chat') return [];
  var R = repereObjet(V, o), X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9, Z0 = 1e9, Z1 = -1e9;
  [0, c.w].forEach(function(x){ [0, c.h].forEach(function(y){ [0, c.p || 40].forEach(function(z){
    var W = mondeDe(R, x, y, z);
    X0 = Math.min(X0, W[0]); X1 = Math.max(X1, W[0]); Y0 = Math.min(Y0, W[1]); Y1 = Math.max(Y1, W[1]); Z0 = Math.min(Z0, W[2]); Z1 = Math.max(Z1, W[2]);
  }); }); });
  if(c.z === 'tapis') return [{p:'tapis', r:[X0, Z0, X1, Z1]}];
  if(c.z === 'mur') return [o.cote ? {p:o.cote, r:[Z0, Y0, Z1, Y1]} : {p:'fond', r:[X0, Y0, X1, Y1]}];
  var l = [{p:'sol', r:[X0, Z0, X1, Z1]}];
  if(o.cote) l.push({p:o.cote, r:[Z0, 0, Z1, Y1]});
  else if(Z0 < 50) l.push({p:'fond', r:[X0, 0, X1, Y1]});
  return l;
}
/* Trouve une place libre pour un objet qui arrive (sorti d'un carton, ou venu d'une ancienne sauvegarde).
   Ce n'est qu'une première place : ensuite, l'objet reste où l'enfant le met. Les rangements vont de préférence contre les murs de côté.
   Renvoie false s'il n'y a plus vraiment de place (l'objet se chevaucherait trop avec un autre). */
function trouverPlace(V, o){
  var c = catDe(o), best = null, mur = c.z === 'mur', rang = profilable(c);
  /* le tout premier meuble de rangement (le tutoriel de l'enquête 1, au tout début) : de face, sur le mur du fond, pour qu'on le voie bien
     (Romain, 5 novembre, 16 h 27) ; les suivants vont de préférence de profil, contre les murs de côté */
  var premierSec = !!(c.cases && !c.verre && !aRangementSec(V.etat));
  /* (Romain, 16 h 28) les fioles d'ingrédients du départ : de face, au-dessus de la porte ; le premier meuble de rangement : de face,
     à gauche de la fenêtre — on voit bien où vont les ingrédients quand ils se rangent tout seuls */
  var dessusPorte = o.t === 'fioles_ingr' && !V.etat.objets.some(function(p){ return p !== o && p.t === 'fioles_ingr'; });
  if(rang && c.cases && (premierSec || dessusPorte)) rang = false;
  if(o.t === 'etabli') rang = false;       /* (l'établi des plantes : de face, on voit sa tringle et ses flacons) */
  if(c.z === 'petit' && SUR_MEUBLE[o.t] !== 0 && o.t !== 'chat' && o.t !== 'plante' && surSurface(V, o)) return true;
  var sa = salleDe(o);
  /* les rideaux : devant la fenêtre de la pièce */
  if(c.fenetre){ o.cote = 0; o.sur = null; delete o.pz; delete o.py; o.x = 450 + (sa ? FEN_CH : FEN_DX); o.y = 316; garderDansPiece(V, o); return true; }
  /* la place que prennent les autres : sur le plancher, sur le mur du fond, sur un mur de côté (dans le monde, pas à l'écran) */
  var autres = [], ecrans = [], chatsB = [];
  V.etat.objets.forEach(function(p){
    if(p.t === 'chat' && p !== o && salleDe(p) === sa && !p.sur && !c.plat) chatsB.push(boite(p, posObj(V, p)));     /* (on ne cache pas le chat) */
    if(p === o || p.t === 'chat' || salleDe(p) !== sa) return;
    autres = autres.concat(empreintes(V, p));
    var cp = catDe(p);
    if(!p.sur && cp.z !== 'tapis') ecrans.push({b:boite(p, posObj(V, p)), mur:cp.z === 'mur'});
  });
  /* (pour une première place seulement : pas devant la fenêtre, la porte, la cheminée, ni sur la cueillette) */
  var arche = zoneArche(V, sa);
  var gene = sa ? (mur ? [[362 + FEN_CH, 56, 538 + FEN_CH, 320], arche] : [arche]) :
    (mur ? [[362, 56, 538, 320], dessusPorte ? [PORTE.x - PORTE.w / 2 - 12, PORTE.y - PORTE.h - 8, PORTE.x + PORTE.w / 2 + 12, PORTE.y] : [540, 70, 760, 524], [786, 20, 1114, 524], arche] : [[TAS.x - 210, SOL_Y + 10, TAS.x + 210, TAS.y + FLACONS.dy + TAS.dy + 16], arche]);
  /* (l'établi des plantes ne se pose pas non plus sur les cartons pas encore ouverts) */
  if(o.t === 'etabli') cartonsIci(V).forEach(function(k, i){ var tk = CARTON_TAILLE[k.t] || CARTON_TAILLE.carton, pk = POS_CARTONS[i % POS_CARTONS.length]; gene.push([pk[0] - tk[0] / 2, pk[1] - tk[1], pk[0] + tk[0] / 2, pk[1]]); });
  if(!mur && c.h > 150){ var ch = V.parId.ch; if(ch && ch !== o && salleDe(ch) === sa){ var pc = posObj(V, ch); gene.push([pc.x - 170, pc.y - 200, pc.x + 170, 1e4]); } }
  var essai = {t:o.t, st:o.st, v:o.v, cases:o.cases, f:0, cote:0}, pref = mur ? (dessusPorte && !sa ? [PORTE.x, PORTE.y - PORTE.h - 40] : premierSec && !sa ? [250, 250] : [640, 240]) : [700, 790], libre = null;
  function noter(){
    var pe = posObj(V, essai), bb = boite(essai, pe), em = empreintes(V, essai), aire = 1, recouvre = 0, g = 0;
    if(bb[0] < V.vb.x0 || bb[2] > V.vb.x0 + V.vb.w) return;
    em.forEach(function(e){ aire += (e.r[2] - e.r[0]) * (e.r[3] - e.r[1]); autres.forEach(function(a){ if(a.p === e.p) recouvre += inter(e.r, a.r); }); });
    gene.forEach(function(Z){ g += inter(bb, Z); });
    /* (et, un peu, ce qu'il cacherait ou qui le cacherait à l'écran) */
    var cache = 0, derriere = 0, ab = Math.max(1, (bb[2] - bb[0]) * (bb[3] - bb[1]));
    if(c.z !== 'tapis') ecrans.forEach(function(a){ if(a.mur === mur){ var i = inter(bb, a.b); cache += i; if(!mur && a.b[3] > bb[3] + 4) derriere += i; } });
    /* caché derrière un meuble plus en avant (le chaudron…) : on ne le verrait plus, on le choisit seulement s'il n'y a rien d'autre */
    derriere = Math.min(1, derriere / ab);
    var devant = 0;
    if(!mur && c.z !== 'tapis') chatsB.forEach(function(b){ if(b[3] < bb[3] + 4) devant += inter(bb, b) / Math.max(1, (b[2] - b[0]) * (b[3] - b[1])); });
    var sc = Math.hypot(pe.x - pref[0], (pe.y - pref[1]) * 1.4) * 0.3 + recouvre * 0.12 + cache * 0.035 + g * 0.3 + (essai.cote ? (rang ? -300 : 400) : 0);
    var cand = {s:sc, x:essai.x, y:essai.y, cote:essai.cote || 0, pz:essai.pz, py:essai.py, part:recouvre / aire};
    if(!best || sc < best.s) best = cand;
    /* parmi les places libres : de préférence une où il n'est pas caché derrière un meuble plus en avant, et où il ne cache pas le chat
       (cela ne change jamais le choix « dans la pièce ou dans le carton 📦 ») */
    var sc2 = sc + (derriere > 0.3 ? derriere * 3000 : 0) + (devant > 0.3 ? devant * 2000 : 0);
    if(cand.part < 0.25 && (!libre || sc2 < libre.s2)){ libre = cand; libre.s2 = sc2; }
  }
  var xl = murG(V), xr = murD(V);
  if(mur){
    for(var x = xl + 60; x <= xr - 60; x += 20) for(var y = Math.max(160, murHaut(V) + 120); y <= 500; y += 20){ essai.cote = 0; essai.x = x; essai.y = y; delete essai.pz; delete essai.py; noter(); }
    if(rang) ['g', 'd'].forEach(function(cote){ for(var z = 80; z < Math.min(700, zMaxSol(V)); z += 30) for(var yy = 120; yy < hautMur(V) - c.h / S_REF; yy += 30){ essai.cote = cote; essai.pz = z; essai.py = yy; noter(); } });
  } else {
    for(var xs = V.vb.x0 + 40; xs <= V.vb.x0 + V.vb.w - 40; xs += 24) for(var ys = SOL_MIN + 20; ys <= solMax(V); ys += 16){
      poserSol(V, essai, xs, ys);
      if(essai.cote && !rang) continue;
      if(!essai.cote && (Math.abs(essai.x - xs) > 12 || Math.abs(essai.y - ys) > 12)) continue;
      noter();
    }
  }
  if(best && best.part < 0.25 && libre) best = libre;
  if(best){
    o.x = best.x; o.y = best.y; o.cote = best.cote; o.sur = null;
    if(best.pz !== undefined) o.pz = best.pz; else delete o.pz;
    if(best.py !== undefined) o.py = best.py; else delete o.py;
    garderDansPiece(V, o);       /* (sa place à l'écran, d'après sa place sur le mur) */
    return best.part < 0.25;
  }
  if(mur) poserMur(V, o, 640, 220); else poserSol(V, o, 450, 780);
  return false;
}
var SUR_MEUBLE = {chat:0, plante:0, gamelle:0, eau:0, distributeur:0};   /* (les gamelles du chat : par terre)*/
/* Un petit objet (bocaux, lampe, vase…) qui sort d'un carton : sur une étagère, une table ou une commode, s'il y a de la place */
function surSurface(V, o){
  var c = catDe(o), w = c.w * 0.66, best = null;
  V.etat.objets.forEach(function(p){
    if(p === o || p.sur || salleDe(p) !== salleDe(o)) return;
    var cp = catDe(p);
    if(!cp.surf || cp.special === 'grimoire' || p.t === 'chat' || p.t === 'coussin') return;      /* (le coussin : c'est pour Mimi) */
    cp.surf.forEach(function(sf, k){
      var pris = V.etat.objets.filter(function(x){ return x.sur && x.sur.o === p.id && x.sur.k === k; }).map(function(x){ var cx = catDe(x).w * 0.66; return [x.sur.dx - cx / 2, x.sur.dx + cx / 2]; });
      for(var dx = sf.x0 + w / 2; dx <= sf.x1 - w / 2 + 0.1; dx += 10){
        if(pris.some(function(q){ return dx + w / 2 > q[0] && dx - w / 2 < q[1]; })) continue;
        var sc = Math.abs(dx) * 0.2 + (o.t === 'bocaux' && p.t === 'etagere' ? -500 - k * 50 : 0) + (o.t !== 'bocaux' && p.t === 'etagere' ? 90 : 0) + (cp.z === 'mur' ? 0 : 40) + (p.cote ? 60 : 0);
        if(!best || sc < best.s) best = {s:sc, o:p.id, k:k, dx:Math.round(dx / 5) * 5};
      }
    });
  });
  if(!best) return false;
  o.sur = {o:best.o, k:best.k, dx:best.dx}; o.cote = 0;
  return true;
}

/* ==========================================================
   La vue
   ========================================================== */
function son(V, t){ try{ if(V.o.son) V.o.son(t); else if(util()) util().son(t); }catch(e){} }
function lire(V, t){ try{ if(V.o.lire) V.o.lire(t); else if(util()) util().lire(t); }catch(e){} }
function vibrer(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms || 30); }catch(e){} }
function changer(V){ try{ if(V.o.onChange) V.o.onChange(V.etat); }catch(e){ console.error(e); } }
function apres(V, ms, fn){ var t = setTimeout(function(){ V.timers = V.timers.filter(function(x){ return x !== t; }); if(!V.arrete) fn(); }, ms); V.timers.push(t); return t; }
function ecoute(V, cible, type, fn, opt){ cible.addEventListener(type, fn, opt); V.nettoie.push(function(){ cible.removeEventListener(type, fn, opt); }); }
function q(V, sel){ return V.root.querySelector(sel); }
var MOINS_MOUV = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function anim(el, kf, o){ try{ if(MOINS_MOUV && o){ o.duration = Math.min(o.duration || 0, 60); o.iterations = 1; o.delay = 0; } return el.animate(kf, o); }catch(e){ return null; } }

function recettesDe(V){
  var D = DD();
  /* (12 novembre : une liste VIDE est une vraie liste — l'enquête 3 n'a aucune recette au chaudron, ses potions se font à l'établi ;
     avant, une liste vide montrait toutes les recettes du jeu. Sans liste du tout — l'atelier hors du jeu — : toutes.) */
  if(Array.isArray(V.o.recettes)) return V.o.recettes;
  return cles(D.RECETTES || {}).map(function(id){
    var p = (D.POTIONS || {})[id] || {};
    return {id:id, nom:p.nom || id, ic:p.ic || '🧪', c:p.c || '#8ff3ff', connue:!D.RECETTES[id].secrete};
  });
}
function aObjet(V, id){ return (V.o.objets || []).indexOf(id) >= 0; }

function creerObjet(V, t){
  var c = catDe({t:t}), n = V.etat.objets.filter(function(o){ return o.t === t; }).length;
  V.etat.n++;
  var o = {id:'o' + V.etat.n, t:t, x:600, y:700, f:0, v:n % 3, st:0, sur:null, neuf:1};
  if(c.cases) o.cases = c.cases.map(function(){ return {e:[], i:{}}; });
  if(t === 'lampe') o.on = 1;
  return o;
}
/* Les objets achetés à la boutique arrivent dans un colis doré */
function verifierBoutique(V){
  var objs = (V.o.objets || []).filter(function(id){ return !PORTES[id] && BOUTIQUE_DESSIN[id] && V.etat.boutique.indexOf(id) < 0; });
  var colis = V.etat.cartons.filter(function(k){ return k.t === 'colis'; })[0];
  var manque = objs.filter(function(id){ return !colis || colis.reste.indexOf(id) < 0; });
  if(!manque.length) return false;
  if(!colis){ V.etat.n++; colis = {id:'k' + V.etat.n, t:'colis', reste:[], ouvert:0}; V.etat.cartons.push(colis); }
  colis.reste = colis.reste.concat(manque);
  return true;
}
/* Au montage : rien ne bouge (l'enfant met les objets où il veut ; on ne les remet jamais dans une « zone ») ;
   on garde seulement chaque objet dans la pièce (l'écran a peut-être changé de taille). Ce qui vient d'une ancienne sauvegarde (o.placer) trouve une place. */
function garderDansPiece(V, o){
  var c = catDe(o), xl = murG(V), xr = murD(V), hw = largDe(c) / 2, pw = profDe(c);
  if(c.fixe){ sceller(o); return; }
  if(c.z === 'mur'){
    if(o.cote){
      /* (une sauvegarde d'avant la perspective : sa place à l'écran devient une place sur le mur de côté) */
      if(o.pz === undefined || o.py === undefined){ var m = surCote(o.x || 0, o.y || 300, o.cote === 'g' ? xl + pw : xr - pw); o.pz = m.Z; o.py = m.Y; }
      o.pz = Math.round(borne(o.pz, hw + 4, zMaxSol(V)));
      o.py = Math.round(borne(o.py, 0, hautMur(V) - c.h / S_REF));
      var A = proj(o.cote === 'g' ? xl + pw : xr - pw, o.py, o.pz);
      o.x = A[0]; o.y = A[1];
    } else {
      var nx = borne(o.x, xl + hw, xr - hw), Y = SOL_Y - o.y, nY = borne(Y, 0, hautMur(V) - c.h / S_REF);
      if(Math.abs(nx - o.x) > 0.05) o.x = Math.round(nx * 10) / 10;
      if(Math.abs(nY - Y) > 0.05) o.y = Math.round((SOL_Y - nY) * 10) / 10;
    }
    return;
  }
  if(o.cote && !profilable(c)){ o.cote = 0; delete o.pz; }
  if(o.cote){
    o.pz = borne(o.pz !== undefined ? o.pz : surSol(o.x, Math.max(o.y, SOL_Y + 2)).Z, hw + 2, zMaxSol(V));
    var A3 = proj(o.cote === 'g' ? xl + pw : xr - pw, 0, o.pz);
    o.x = A3[0]; o.y = A3[1];
    return;
  }
  var q = surSol(o.x, Math.max(o.y, SOL_Y + 2)), X = borne(q.X, xl + hw * 0.9, xr - hw * 0.9), Z = borne(q.Z, pw, zMaxSol(V));
  if(Math.abs(X - q.X) > 0.5 || Math.abs(Z - q.Z) > 0.5 || !(o.y >= SOL_Y + 2)){ var A2 = proj(X, 0, Z); o.x = Math.round(A2[0] * 10) / 10; o.y = Math.round(A2[1] * 10) / 10; }
}
function reajuster(V){
  var bouge = false, aPlacer = [];
  V.etat.objets.forEach(function(o){
    if(o.placer){ aPlacer.push(o); return; }
    /* posé sur un meuble qui n'existe plus (ou qui est lui-même posé sur quelque chose) : il trouve une autre place */
    if(o.sur && o.sur.o !== 'cheminee'){
      var par = V.parId[o.sur.o], cp = par && catDe(par);
      if(!par || par.sur || par === o || !cp.surf || !cp.surf[o.sur.k]){ o.sur = null; aPlacer.push(o); return; }
    }
    if(o.sur || o.t === 'chat') return;
    var av = JSON.stringify([o.x, o.y, o.cote, o.pz, o.py]);
    garderDansPiece(V, o);
    if(JSON.stringify([o.x, o.y, o.cote, o.pz, o.py]) !== av) bouge = true;
  });
  aPlacer.forEach(function(o){ delete o.placer; trouverPlace(V, o); bouge = true; });
  return bouge;
}

var MOMENTS = {matin:1, apresmidi:1, soir:1, nuit:1};
var K_LISIBLE = 0.62;          /* sur un téléphone, la pièce n'est jamais plus petite que ça : tout reste lisible, on la fait glisser */
var PAN_DEPART = {x:590, y:560};
var PAN_MEMO = null;           /* la vue est remontée à chaque rendu du moteur : on garde l'endroit regardé */
var SALLE_MEMO = 0;            /* … et la pièce où l'on était (l'atelier ou la chambre) */
var POTS_MEMO = null;          /* … et les potions déjà vues : une potion de plus fait briller son flacon, même après un remontage */
function potionsNeuves(V){
  var P = V.o.potions || {}, avant = POTS_MEMO, neuves = [];
  POTS_MEMO = {};
  cles(P).forEach(function(k){ POTS_MEMO[k] = P[k] || 0; if(avant && (P[k] || 0) > (avant[k] || 0)) neuves.push(k); });
  return neuves;
}
/* L'établi des plantes (enquête 3) n'est dans la pièce que pendant une enquête qui s'en sert (opts.etabli) : on le pose — là où il était
   la dernière fois (etat.etabli), sinon à une place libre, de face (trouverPlace : jamais devant la porte, où l'on pose la cueillette et
   le panier des plantes qui attendent) — ou on le range, en retenant sa place, sa forme et sa couleur.
   (12 novembre, 14 h) Avant, il se posait d'office devant la porte (610, 700) et cachait la cueillette : celui qui y est encore, sans
   avoir été bougé, se trouve une vraie place — une seule fois (etat.etPlace). */
function poserEtabli(e, voulu){
  var l = (e.objets || []).filter(function(o){ return o.t === 'etabli'; });
  function dOffice(g){ return g.x === 610 && g.y === 700 && !g.cote; }
  if(voulu){
    if(!l.length){
      var g = e.etabli || {}, o = {id:'et', t:'etabli', x:g.x || 610, y:g.y || 700, f:g.f || 0, v:0, st:g.st || 0, sur:null};
      if(!g.x || (!e.etPlace && dOffice(g))) o.placer = 1;
      e.objets.push(o);
    } else if(!e.etPlace) l.forEach(function(o){ if(dOffice(o) && !o.sur) o.placer = 1; });
    e.etPlace = 1;
  } else if(l.length){
    e.etabli = {x:l[0].x, y:l[0].y, f:l[0].f || 0, st:l[0].st || 0};
    e.objets = e.objets.filter(function(o){ return o.t !== 'etabli' && !(o.sur && o.sur.o === 'et'); });
  }
  return e;
}
function vue(el, opts){
  opts = opts || {};
  var D = DD();
  INGR = opts.ingr || D.INGR || {};
  var V = {
    el:el, o:opts, uid:++uidVue, etat:poserEtabli(normaliser(opts.etat || etatNeuf()), !!opts.etabli),
    mode:'ranger', k:0.5, timers:[], nettoie:[], suivis:[], arrete:false, sel:null, chats:{},
    parId:{}, elO:{}, elK:{}, ouvert:null, mjPartie:null, mjEl:null, grimSel:null, attente:null,
    ext:{l:COTE, r:COTE, t:0, b:0}, vb:{x0:-COTE, y0:0, w:LARGEUR + 2 * COTE, h:860}, pan:{x:0, y:0}, salle:SALLE_MEMO
  };
  if(opts.etat && opts.etat !== V.etat) opts.etat = V.etat;
  /* Le conteneur a-t-il une vraie hauteur ? (le moteur la donne : sous le bandeau, au-dessus des onglets) */
  var hAvant = el.clientHeight;
  V.auto = !(hAvant >= 200);
  var root = V.root = document.createElement('div');
  root.className = 'at';
  root.innerHTML = svgDefs() +
    '<div class="at-piece"><div class="at-monde"><div class="at-fond-box"></div><div class="at-scene"></div><div class="at-halos"></div><div class="at-calque"></div></div>' +
      '<div class="at-lumiere"></div><div class="at-bords"><i class="g"></i><i class="d"></i><i class="h"></i><i class="b"></i></div>' +
      '<div class="at-reperes"></div><div class="at-tient" hidden></div>' +
      '<button type="button" class="at-coin" data-at="reserve" aria-label="Le carton de rangement"><span class="at-coin-ic" aria-hidden="true">📦</span><b class="at-badge" style="display:none"></b></button>' +
      '<button type="button" class="at-salle" data-at="salle" aria-label="L\'autre pièce"><span class="at-salle-ic" aria-hidden="true"></span><b class="at-badge" style="display:none"></b></button>' +
      /* (16 novembre) Mimi : son bouton, et au-dessus sa jauge de bonheur, toujours sous les yeux (la seule jauge qu'on voit) */
      '<button type="button" class="at-mimi-bt" data-at="mimi" aria-label="Les affaires de Mimi" hidden><span class="at-mimi-ic" aria-hidden="true">🐾</span><i class="at-mimi-jauge" aria-hidden="true"><b></b></i><b class="at-badge" style="display:none"></b></button>' +
      /* (l'appareil photo, à côté : Romain, 16 novembre, 21 h 18 — « une petite caméra » ; dessous, où en est l'album) */
      '<button type="button" class="at-photo-bt" data-at="photo" aria-label="Prendre Mimi en photo" hidden><span class="at-photo-ic" aria-hidden="true">📷</span><i class="at-photo-n" aria-hidden="true"></i></button></div>' +
    '<div class="at-mimi-barre" hidden></div>' +
    '<div class="at-ouvert" hidden></div><div class="at-grim" hidden></div><div class="at-toast" hidden></div><div class="at-fantomes"></div>';
  el.appendChild(root);
  V.piece = q(V, '.at-piece'); V.monde = q(V, '.at-monde'); V.scene = q(V, '.at-scene'); V.calque = q(V, '.at-calque'); V.ouvertEl = q(V, '.at-ouvert');
  V.grim = q(V, '.at-grim'); V.toastEl = q(V, '.at-toast'); V.fantomes = q(V, '.at-fantomes'); V.tientEl = q(V, '.at-tient'); V.reperes = q(V, '.at-reperes');
  V.fondEl = q(V, '.at-fond-box'); V.halos = q(V, '.at-halos'); V.elReserve = q(V, '.at-coin'); V.elSalle = q(V, '.at-salle');
  V.elMimi = q(V, '.at-mimi-bt'); V.barreMimi = q(V, '.at-mimi-barre'); V.elPhoto = q(V, '.at-photo-bt');
  majMoment(V);

  if(verifierBoutique(V)) changer(V);
  if(rendreQuittes(V)) changer(V);   /* une préparation laissée en plan (l'appli fermée pendant le chaudron) : ses ingrédients reviennent */
  mise(V, true);
  V.etat.objets.forEach(function(o){ V.parId[o.id] = o; });
  if(reajuster(V)) changer(V);
  dessinerPiece(V);
  var nv = potionsNeuves(V);
  if(nv.length) brillerFlacons(V, nv);
  brancher(V);
  if(window.ResizeObserver){
    var ro = new ResizeObserver(function(){ mise(V); });
    ro.observe(root);
    V.nettoie.push(function(){ ro.disconnect(); });
  }
  if(V.auto || !window.ResizeObserver) ecoute(V, window, 'resize', function(){ mise(V); });
  chatsDemarrer(V);
  tamaMoment(V);
  tamaDemarrer(V);
  /* le guidage du tutoriel (49-guide.js) : il reprend sur la vue remontée */
  VUES.push(V);
  if(GUIDE) apres(V, 60, function(){ guideAppliquer(V, true); });
  /* étape 4 : un ingrédient qu'il rapportait quand l'atelier s'est fermé arrive tout de suite ; les cadeaux gagnés aux mini-jeux sont annoncés */
  if(tama(V).butin) apres(V, 1200, function(){ livrerButin(V, chatsTous(V)[0] || null); });
  /* (16 novembre) Mimi était partie chercher un coffret quand l'atelier s'est fermé : il est là quand même */
  if(tama(V).dehors) apres(V, 1400, function(){ poserCoffret(V, null); });
  majBarre(V);
  annoncerAcc(V);
  apres(V, 1500, function(){ travauxMaj(V); });

  return (V.api = {
    arreter:function(){ arreter(V); },
    maj:function(o2){ maj(V, o2); },
    etat:function(){ return V.etat; },
    /* le chaudron en cours (MJ.lancer) : le moteur le met en pause au lieu de l'abandonner quand on change d'onglet (moteur-actions.js) */
    partie:function(){ return V.mjPartie || null; },
    /* pour les bancs d'essai */
    _vb:function(){ return {x0:V.vb.x0, y0:V.vb.y0, w:V.vb.w, h:V.vb.h, k:V.k, pan:{x:V.pan.x, y:V.pan.y}}; },
    _voir:function(x, y){ centrerSur(V, x, y); },
    _chat:function(id){ var o = chatsDe(V)[0]; var st = o && V.chats[id || o.id]; return st ? {pose:st.pose, dort:st.pose === 'dort', reste:st.dortJusqua ? Math.max(0, st.dortJusqua - Date.now()) : 0, pos:st.pos, tenu:!!st.tenu, chasse:!!st.chasse, depart:!!st.depart, anim:!!st.anim, mv:st.mv ? st.mv.mode || 1 : 0, mode:V.mode, reac:st.derniereReac || null, gauche:!!st.gauche, caresse:st.caresse ? st.caresse.zone : null} : null; },
    _sel:function(){ return V.sel; },
    _pos:function(id){ var o = V.parId[id]; if(!o) return null; var p = o.t === 'chat' ? chatPos(V, o) : posObj(V, o), c = catDe(o), F = cadreEl(V.elO[id]); return {x:p.x, y:p.y, s:p.s, w:c.w, h:c.h, cote:o.cote || 0, cadre:F}; },
    _salle:function(){ return V.salle; },
    _allerSalle:function(s){ changerSalle(V, s); },
    /* le chat (étape 3) : faire passer du temps de jeu (en secondes), une bêtise tout de suite */
    _tama:function(sec){ tamaTic(V, sec || TIC); return JSON.parse(JSON.stringify(V.etat.tama)); },
    _betise:function(){ V.etat.tama.betise = -1e9; return peutEtreBetise(V); },
    _agir:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim || st.tenu) return false; if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; chatPose(V, o, 'assis'); st.reveil = false; chatAgir(V, o); return true; },
    _humeur:function(){ majHumeurs(V); },
    _bonheur:function(id){ var o = V.parId[id]; return o ? bonheur(o) : null; },
    _sortie:function(id){ var o = V.parId[id]; return o ? sortieChat(V, o, true) : false; },
    _peutSortir:function(id){ var o = V.parId[id]; return o ? peutSortir(V, o) : false; },
    _souris:function(){ return sourisPasse(V, true); },
    _jouer:function(id, quoi){ var o = V.parId[id]; return o ? chatJoue(V, o, quoi) : null; },
    /* (le parc à chat) les morceaux qu'on lui doit arrivent ; elle va jouer avec un morceau (quoi : son type) */
    _parcDonner:function(){ return parcDonner(V, true); },
    _parc:function(id, quoi){ var o = V.parId[id] || chatsTous(V)[0]; return o ? chatParc(V, o, quoi) : null; },
    _garde:function(id){ ouvrirGarde(V, id); },
    _acheter:function(a){ acheter(V, a); return true; },
    _travaux:function(plus){ return travauxMaj(V, plus); },      /* (les robots : compter les travaux de l'Alchimiste maintenant) */      /* (les robots : un achat dans la boutique de Mimi, sans passer par ses boutons) */
    _dehors:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); st.pos = chatSolVisible(V); placerEl(V, o); var d = V.elO[id]; if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5); return st.pos; },
    _reveil:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} } if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; placerEl(V, o); chatPose(V, o, 'assis'); chatPlanifier(V, o, 20000); return true; },
    _bulle:function(id){ var d = V.elO[id], b = d && d.querySelector('.at-bulle'); return b && !b.hidden ? b.getAttribute('data-bulle') : null; },
    /* (16 novembre) le Tamagotchi de Mimi : son état ; un soin ; mettre les points du cadeau ; réagir ; la zone sous un point de l'écran */
    _mimi:function(){ var o = chatsTous(V)[0]; return JSON.parse(JSON.stringify({mimi:mimi(V), tama:tama(V), b:o ? o.b : null, bh:o ? bonheur(o) : null, jouet:V.jouet ? V.jouet.id : null, outil:V.outil ? V.outil.t : null, bain:!!V.bain})); },
    _soigner:function(quoi, gain, k){ var o = chatsTous(V)[0]; if(o) soigner(V, o, quoi, gain || 6, k); return o ? bonheur(o) : null; },
    _cadeauPret:function(){ var o = chatsTous(V)[0]; if(!o) return false; o.bh = 100; majBarre(V); return true; },
    /* (code : ce qu'il y aura dedans, « j:laser », « s:brosse »… ; rien : tiré au hasard dans une de ses familles) */
    _cadeau:function(id, code){ var o = V.parId[id] || chatsTous(V)[0]; return o ? cadeauChat(V, o, true, code) : false; },
    /* (la jauge seule) ses familles (cachées), ses envies (cachées une minute), la lassitude */
    _familles:function(){ var o = chatsTous(V)[0], r = {}; FAMILLES.forEach(function(F){ r[F.k] = familleReste(V, F); }); return {fam:JSON.parse(JSON.stringify(tama(V).fam)), reste:r, bh:o ? o.bh : null, las:JSON.parse(JSON.stringify(tama(V).las))}; },
    _contenu:function(){ return contenuCoffret(V); },
    _envie:function(k, dite){ var t = tama(V); if(k === null){ t.envie = null; } else if(k){ t.envie = {k:k, n:t.jeu}; if(dite) t.envie.d = 1; } majHumeurs(V); majBarre(V); return t.envie ? {k:t.envie.k, d:envieDite(V), f:familleEnvie(t.envie.k)} : null; },
    _envieSigne:function(id){ var o = V.parId[id] || chatsTous(V)[0]; return o ? envieSigne(V, o) : false; },
    _enviesPossibles:function(){ return enviesPossibles(V, true); },
    _lasse:function(fam){ return lasse(V, fam); },
    _dodo:function(id){ var o = V.parId[id] || chatsTous(V)[0]; return o ? dodoCoin(V, o, true) : false; },
    _poserSur:function(id, meuble){ var o = V.parId[id], p = V.parId[meuble]; if(!o || !p) return false; chatSaisi(V, o); o.sur = {o:p.id, k:0, dx:0}; placerEl(V, o); chatLache(V, o); return true; },   /* (comme si on la portait dessus) */
    _reagir:function(id, r){ var o = V.parId[id]; if(!o) return false; reagir(V, o, r); return true; },
    /* (le pantin de Mimi, pour les robots : où est sa tête, son dos, son ventre, sa queue à l'écran ; sa pose, ses gestes en cours) */
    _gros:function(){ return grosPlan(V, true); },
    _grosEtat:function(){ var G = V.gros; return G ? {phase:G.phase, E:G.E ? JSON.parse(JSON.stringify(G.E)) : null, gain:G.car ? G.car.gain : 0, lech:!!G.lech, t:tama(V).grosT, jeu:tama(V).jeu} : {phase:null, t:tama(V).grosT, jeu:tama(V).jeu}; },
    _ptChat:function(id, quoi){ var o = V.parId[id], r = o && pantinDe(V, o); return r ? r.point(quoi) : null; },
    _pantin:function(id){ var o = V.parId[id], r = o && pantinDe(V, o); return r ? {nom:r.nom, gestes:r.couv.map(function(c){ return c.nom; }), co:r.co, marche:!!r.mar, glisse:!!r.tw, cap:r.cap, capV:r.capV, vue:r.vueNom, allure:r.mar ? r.all : null} : null; },
    /* (les robots : la faire aller quelque part sur le plancher — au pas, ou plus vite) */
    _va:function(id, x, y, vite){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim) chatArreter(V, o); if(st.t){ clearTimeout(st.t); st.t = null; } st.vite = vite || 1; chatBouger(V, o, chatSol(V, x, y), 'marche', function(){ st.vite = 1; chatPose(V, o, 'assis'); chatPlanifier(V, o, 30000); }); return true; },
    _geste:function(id, nom, opt){ var o = V.parId[id]; return !!(o && gesteChat(V, o, nom, opt)); },
    _zone:function(id, cx, cy){ var o = V.parId[id]; return o ? zoneChat(V, o, {clientX:cx, clientY:cy}) : null; },
    _pose:function(id, p){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim) chatArreter(V, o); if(st.t){ clearTimeout(st.t); st.t = null; } chatPose(V, o, p); chatPlanifier(V, o, 30000); return true; },
    _finJouet:function(){ finJouet(V); },
    /* l'arbre à chat, l'autre pièce (Romain, 5 novembre, 12 h 31) : un jeu à l'arbre tout de suite ('grimpe', 'boule', 'griffe') ;
       aller dans l'autre pièce maintenant ; revenir maintenant ; où il est */
    _arbre:function(id, quoi){ var o = V.parId[id]; if(!o) return null; var st = chatEtat(V, o); if(st.anim || st.tenu) return null; if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; chatPose(V, o, 'assis'); return chatArbre(V, o, quoi); },
    _passe:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; if(st.pose === 'dort') chatPose(V, o, 'assis'); PASSAGE_T = 0; return peutPasser(V, o) ? chatPasse(V, o) : false; },
    _revient:function(id){ var o = V.parId[id]; return o ? chatRevient(V, o, true) : false; },
    _ou:function(id){ var o = V.parId[id], st = o && V.chats[id]; return o ? {salle:salleDe(o), x:o.x, y:o.y, sur:o.sur || null, vu:!!V.elO[id], passe:!!(st && st.passe), pose:st ? st.pose : null, pos:st ? st.pos : null, retour:RETOUR_MEMO[id] ? Math.round(RETOUR_MEMO[id] - Date.now()) : null} : null; },
    _guide:function(){ return guideElements(V).map(function(e){ return e.getAttribute('data-obj') || e.getAttribute('data-tas') || e.getAttribute('data-carton') || e.getAttribute('data-pot') || e.className; }); },
    _flacons:function(){ return (V.elFl || []).map(function(d){ return {k:d._k, n:d._n, cadre:cadreEl(d), neuf:d.classList.contains('at-nouveau')}; }); }
  });
}

function arreter(V){
  if(V.arrete) return;
  V.arrete = true;
  VUES = VUES.filter(function(W){ return W !== V; });
  /* l'atelier se ferme pendant une préparation : on a quitté le chaudron, les ingrédients versés reviennent (Romain, 14 novembre) */
  if(V.mjPartie){ try{ V.mjPartie.arreter(); }catch(e){} V.mjPartie = null; try{ rendreVerses(V); }catch(e){ console.error(e); } }
  V.suivis.slice().forEach(function(f){ f(); });
  V.timers.forEach(clearTimeout); V.timers = [];
  if(V.defile){ clearInterval(V.defile); V.defile = null; }
  V.nettoie.forEach(function(f){ try{ f(); }catch(e){} }); V.nettoie = [];
  cles(V.chats).forEach(function(id){ var r = V.chats[id].rig; if(r) r.detruire(); });      /* (les pantins des chats s'arrêtent avec la vue) */
  try{ V.root.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); }); }catch(e){}
  if(V.root.parentNode) V.root.parentNode.removeChild(V.root);
  if(V.attente){ var a = V.attente, cb = V.o.potionFinie; V.attente = null; setTimeout(function(){ try{ if(cb) cb(a.id, a.reussi, a.detail); }catch(e){ console.error(e); } }, 0); }
}

/* Mise à jour quand le moteur a changé l'état ou les options (ingrédients cueillis, cartons offerts, boutique, moment…) */
function maj(V, o2){
  if(V.arrete) return;
  if(o2) cles(o2).forEach(function(k){ V.o[k] = o2[k]; });
  if(V.o.etat && V.o.etat !== V.etat) V.etat = V.o.etat;
  normaliser(V.etat); poserEtabli(V.etat, !!V.o.etabli);
  INGR = V.o.ingr || DD().INGR || INGR;
  apres(V, 600, function(){ travauxMaj(V); });
  majMoment(V);
  tamaMoment(V);
  var avantK = cles(V.elK);
  if(verifierBoutique(V)) changer(V);
  if(V.mode === 'prep') return;
  if(V.sel && !(V.etat.panier[V.sel] > 0)) V.sel = null;
  mise(V);
  /* (un meuble arrivé entre-temps — l'établi des plantes — se trouve une place) */
  if(V.etat.objets.some(function(o){ return o.placer; })){ V.etat.objets.forEach(function(o){ V.parId[o.id] = o; }); if(reajuster(V)) changer(V); }
  dessinerPiece(V, avantK);
  var nv = potionsNeuves(V);
  if(nv.length) brillerFlacons(V, nv);
  if(V.ouvert) dessinerOuvert(V);
}

/* ---------- La lumière du moment (matin, après-midi, soir, nuit) et les lampes ---------- */
function majMoment(V){
  var m = MOMENTS[V.o.moment] ? V.o.moment : 'matin';
  if(V.moment === m) return;
  if(V.moment) V.root.classList.remove('at-l-' + V.moment);
  V.moment = m;
  V.root.classList.add('at-l-' + m);
  majLumiere(V);
}
function majLumiere(V){
  if(!V.halos) return;
  var tous = ici(V), lampes = tous.filter(function(o){ return o.t === 'lampe' && o.on !== 0; }), chevets = tous.filter(function(o){ return o.t === 'lampe_chevet'; });
  V.root.style.setProperty('--lampes', Math.min(3, lampes.length));
  V.root.classList.toggle('at-lampe-on', lampes.length > 0);
  if(!V.vb) return;
  /* des halos chauds autour des lampes allumées, des bougies et des chandelles fixes (on les voit surtout le soir et la nuit) */
  var h = '';
  function halo(x, y, r, cls){ h += '<i class="at-h ' + (cls || '') + '" style="left:' + pX(V, x) + ';top:' + pY(V, y) + ';width:' + pW(V, r * 2) + ';height:' + pH(V, r * 2) + '"></i>'; }
  lampes.forEach(function(o){ var p = posObj(V, o), c = catDe(o); halo(p.x, p.y - c.h * p.s * 0.62, 230 * p.s, 'lampe'); });
  chevets.forEach(function(o){ var p = posObj(V, o); halo(p.x, p.y - 60 * p.s, 170 * p.s, 'lampe'); });
  tous.filter(function(o){ return o.t === 'bougies'; }).forEach(function(o){ var p = posObj(V, o); halo(p.x, p.y - 60 * p.s, 120 * p.s, 'bougie'); });
  tous.filter(function(o){ return o.t === 'lanterne' || o.t === 'guirlande'; }).forEach(function(o){ var p = posObj(V, o), c = catDe(o); halo(p.x, p.y - c.h * p.s * 0.45, (o.t === 'lanterne' ? 130 : 150) * p.s, 'bougie'); });
  if(!V.salle){ halo(816, 246, 80, 'bougie'); halo(750 + CHEM_DX, 470, 210, 'foyer'); }
  V.halos.innerHTML = h;
}

/* ---------- Mise en page : la pièce prend tout l'écran ----------
   k = pixels par unité. Sur un grand écran toute la pièce tient (on l'agrandit pour remplir) ;
   sur un téléphone, k ne descend pas sous K_LISIBLE : la pièce est plus grande que l'écran et on la fait glisser. */
function mise(V, premier){
  if(V.arrete) return;
  var r = V.root;
  if(V.auto){
    var top = V.el.getBoundingClientRect().top + (window.scrollY || 0);
    var hh = Math.round(Math.max(320, window.innerHeight - top));
    if(r.style.height !== hh + 'px') r.style.height = hh + 'px';
  }
  var w = V.piece.clientWidth, h = V.piece.clientHeight;
  if(!w || !h) return;
  r.classList.toggle('at-paysage', w > h * 1.05 && w >= 600);
  r.classList.toggle('at-petit', Math.min(w, h) < 500);
  var LV = LARGEUR + 2 * COTE;      /* la pièce et ses deux murs de côté */
  var kFit = Math.min(w / LV, h / 860), kMax = Math.max(w / LV, h / 860);
  var k = Math.max(kFit, Math.min(K_LISIBLE, kMax));
  /* pas trop de plancher ou de mur en plus : au-delà, on agrandit et on fait glisser */
  if(h / k > 860 * 1.45) k = h / (860 * 1.45);
  if(w / k > LV * 1.5) k = w / (LV * 1.5);
  /* on fait déjà glisser de côté (téléphone en hauteur) : autant remplir la hauteur, tout est plus gros */
  if(w / k < LV - 1) k = Math.max(k, Math.min(1.05, h / (860 * 1.1)));
  var vw = w / k, vh = h / k, ext = {l:COTE, r:COTE, t:0, b:0};
  if(vw > LV){ ext.l = ext.r = (vw - LARGEUR) / 2; }
  if(vh > 860){ var Y = vh - 860, t = Math.min(Y * 0.3, 300); ext.t = t; ext.b = Y - t; }
  var cle = [w, h, k.toFixed(4)].join(',');
  if(cle === V.miseCle) return;
  var centre = V.miseCle ? centreVue(V) : (PAN_MEMO || PAN_DEPART);
  V.miseCle = cle;
  V.ext = ext;
  V.vb = {x0:-ext.l, y0:-ext.t, w:LARGEUR + ext.l + ext.r, h:860 + ext.t + ext.b};
  V.k = k; V.vw = w; V.vh = h;
  V.mondeW = V.vb.w * k; V.mondeH = V.vb.h * k;
  V.monde.style.width = V.mondeW.toFixed(1) + 'px';
  V.monde.style.height = V.mondeH.toFixed(1) + 'px';
  r.style.setProperty('--k', k.toFixed(4));
  V.fondEl.innerHTML = svgFond(V) + fondAnime(V);
  if(!premier) replacer(V);
  centrerSur(V, centre.x, centre.y, true);
}
/* ---------- Faire glisser la pièce (téléphone) ---------- */
function centreVue(V){ return {x:V.vb.x0 + (V.pan.x + V.vw / 2) / V.k, y:V.vb.y0 + (V.pan.y + V.vh / 2) / V.k}; }
function centrerSur(V, x, y, net){ panA(V, (x - V.vb.x0) * V.k - V.vw / 2, (y - V.vb.y0) * V.k - V.vh / 2, net); }
function panA(V, x, y, net){
  var mx = Math.max(0, V.mondeW - V.vw), my = Math.max(0, V.mondeH - V.vh);
  x = mx > 0 ? borne(x, 0, mx) : -(V.vw - V.mondeW) / 2;
  y = my > 0 ? borne(y, 0, my) : -(V.vh - V.mondeH) / 2;
  V.pan = {x:x, y:y};
  V.monde.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px,0)';
  V.root.classList.toggle('at-glisse-g', mx > 0 && x > 2);
  V.root.classList.toggle('at-glisse-d', mx > 0 && x < mx - 2);
  V.root.classList.toggle('at-glisse-h', my > 0 && y > 2);
  V.root.classList.toggle('at-glisse-b', my > 0 && y < my - 2);
  V.root.classList.toggle('at-glissable', mx > 0 || my > 0);
  PAN_MEMO = centreVue(V);
  if(!net) majReperes(V);
  else apres(V, 0, function(){ majReperes(V); });
}
function panPar(V, dx, dy){ panA(V, V.pan.x + dx, V.pan.y + dy); }
/* Montrer un endroit de la pièce en glissant doucement (repère touché, rangement à trouver…) */
function allerVers(V, x, y){
  var a = {x:V.pan.x, y:V.pan.y};
  centrerSur(V, x, y, true);
  var b = {x:V.pan.x, y:V.pan.y};
  if(Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2) return;
  anim(V.monde, [{transform:'translate3d(' + (-a.x) + 'px,' + (-a.y) + 'px,0)'}, {transform:'translate3d(' + (-b.x) + 'px,' + (-b.y) + 'px,0)'}], {duration:420, easing:'ease-in-out'});
}
/* Une chose importante (objet à analyser, potion neuve) est hors de l'écran : un petit repère au bord, qu'on peut toucher */
/* le cadre d'un élément dessiné dans la pièce (unités du monde) : x le milieu, y le bas, w, h */
function cadreEl(d){
  if(!d || !d._bb || !d._p) return null;
  var b = d._bb, p = d._p, s = p.s, w = d._w, h = d._h;
  var x0 = p.x + (b[0] - w / 2) * s, x1 = p.x + (b[2] - w / 2) * s, y0 = p.y + (b[1] - h) * s, y1 = p.y + (b[3] - h) * s;
  return {x:(x0 + x1) / 2, y:y1, w:x1 - x0, h:y1 - y0};
}
function cadreObjet(V, id){
  var o = V.parId[id];
  if(!o) return null;
  var F = cadreEl(V.elO[id]);
  if(F) return F;
  var b = boite(o, posObj(V, o));
  return {x:(b[0] + b[2]) / 2, y:b[3], w:b[2] - b[0], h:b[3] - b[1]};
}
function cadreFlacons(V){
  var l = (V.elFl || []).map(cadreEl).filter(Boolean);
  if(!l.length) return null;
  var x0 = Math.min.apply(null, l.map(function(f){ return f.x - f.w / 2; })), x1 = Math.max.apply(null, l.map(function(f){ return f.x + f.w / 2; }));
  var y0 = Math.min.apply(null, l.map(function(f){ return f.y - f.h; })), y1 = Math.max.apply(null, l.map(function(f){ return f.y; }));
  return {x:(x0 + x1) / 2, y:y1, w:x1 - x0, h:y1 - y0};
}
function cadreTas(V){ var n = cles(V.etat.panier).length, r = Math.ceil(n / TAS.rang); return {x:TAS.x, y:TAS.y + (r - 1) * TAS.dy + 10, w:Math.min(n, TAS.rang) * TAS.dx, h:r * TAS.dy + 10}; }
function majReperes(V){
  if(!V.reperes) return;
  var l = [];
  /* (seulement ce qui est dans la pièce dessinée ; le reste fait briller le bouton de l'autre pièce) */
  if(somme(V.etat.panier) > 0 && !V.salle) l.push({F:cadreTas(V), ic:'🌿', cle:'arrivage'});
  if(analysesEnAttente(V) > 0 && V.elO.pa) l.push({F:cadreObjet(V, 'pa'), ic:'🔍', cle:'analyses'});
  if((V.elFl || []).some(function(d){ return d.classList.contains('at-nouveau'); })) l.push({F:cadreFlacons(V), ic:'🧪', cle:'potions'});
  if(V.elO.lu && V.elO.lu.classList.contains('at-livre-appel')) l.push({F:cadreObjet(V, 'lu'), ic:'📖', cle:'grimoire'});
  var h = '';
  l.forEach(function(o){
    /* la chose est-elle bien visible (au moins la moitié) ? sinon un repère au bord, du côté où elle est */
    var F = o.F;
    if(!F) return;
    var x0 = (F.x - F.w / 2 - V.vb.x0) * V.k - V.pan.x, x1 = x0 + F.w * V.k, y1 = (F.y - V.vb.y0) * V.k - V.pan.y, y0 = y1 - F.h * V.k;
    var vx = Math.max(0, Math.min(x1, V.vw) - Math.max(x0, 0)), vy = Math.max(0, Math.min(y1, V.vh) - Math.max(y0, 0));
    if(vx >= (x1 - x0) * 0.5 && vy >= (y1 - y0) * 0.5) return;
    var sx = (x0 + x1) / 2, sy = (y0 + y1) / 2, m = 24;
    var cx = borne(sx, 30, V.vw - 30), cy = borne(sy, 30, V.vh - 30);
    var cote = sx <= m ? 'g' : sx >= V.vw - m ? 'd' : sy <= m ? 'h' : 'b';
    h += '<button type="button" class="at-repere at-rep-' + cote + '" data-voir="' + o.cle + '" style="left:' + cx.toFixed(0) + 'px;top:' + cy.toFixed(0) + 'px" aria-label="Voir">' + o.ic + '</button>';
  });
  V.reperes.innerHTML = h;
}

/* Après un changement de taille : tout se replace (et se redessine si sa place dans la pièce a changé) */
function majFlaque(V){ var fl = q(V, '.at-flaque'); if(fl){ var Fl = svgFlaque(V); fl.innerHTML = Fl.svg; placeFixe(V, fl, Fl.F); } }
function replacer(V){
  majFlaque(V);
  placerTas(V);
  placerFlacons(V);
  placerTout(V);
  dessinerBetises(V);
  V.etat.cartons.forEach(function(k, i){ var e = V.elK[k.id]; if(e) placeCarton(V, e, k, i); });
  majIndiceCarton(V);
  majLumiere(V);
  if(GUIDE) guidePlacer(V);
}

/* ---------- La pièce ---------- */
/* la flaque (préparation ratée) : devant le chaudron, où qu'il soit */
function posFlaque(V){
  var ch = V.parId.ch, p = ch ? posObj(V, ch) : {x:950, y:716};
  var y = borne(p.y + 70, SOL_MIN + 40, solMax(V) - 4);
  return {x:borne(p.x - 10, solXmin(V, y) + 110, solXmax(V, y) - 110), y:y, w:220, h:70, z:1000 + p.y + 1};
}
function placeFixe(V, d, F){
  d.style.left = pX(V, F.x - F.w / 2);
  d.style.top = pY(V, F.y - F.h);
  d.style.width = pW(V, F.w);
  d.style.height = pH(V, F.h);
  d.style.zIndex = Math.round((F.z !== undefined ? F.z : 1000 + F.y) * 5);
}
function elFixe(V, cls, F, svg, at){
  var d = document.createElement('div');
  d.className = 'at-fixe ' + cls + (at ? ' at-touche' : '');
  if(at) d.setAttribute('data-at', at);
  placeFixe(V, d, F);
  d.innerHTML = svg;
  return d;
}
/* La flaque, couchée sur le plancher */
function svgFlaque(V){
  var F = posFlaque(V), m = surSol(F.x, F.y), R = repere([m.X, 0, m.Z], AXES_FACE, 220, 4), c = ajouterOutils3d(ctx3d(R, false));
  c.p = 120; c.cat = {w:220, h:4};
  var art = '<path d="M20,60 C10,30 60,14 90,26 C120,4 190,16 196,46 C214,72 170,100 120,92 C80,104 30,98 20,60 Z" fill="#8d8a99" stroke="' + K + '" stroke-width="4"/><ellipse cx="80" cy="50" rx="22" ry="10" fill="#b9b6c6"/>';
  var s = c.surPlan(art, [0, 4, 110], [1, 0, 0], [0, 0, -1], 110, 55) + '<circle class="at-blp" cx="' + f1(c.Q(140, 4, 50)[0]) + '" cy="' + f1(c.Q(140, 4, 50)[1]) + '" r="5" fill="#cfcbe0"/>';
  var b = c.bb;
  return {svg:'<svg viewBox="' + [b[0], b[1], b[2] - b[0], b[3] - b[1]].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + s + '</svg>', F:{x:F.x + (b[0] + b[2]) / 2 * R.k - 110 * R.k, y:F.y + (b[3] - 4) * R.k, w:(b[2] - b[0]) * R.k, h:(b[3] - b[1]) * R.k, z:F.z}};
}
/* La cueillette posée devant la porte : un tas par ingrédient (on le glisse dans un rangement, ou on le touche) */
function dessinerTas(V){
  (V.elTas || []).forEach(function(e){ e.remove(); });
  V.elTas = [];
  var p = V.etat.panier, ks = cles(p).filter(function(k){ return p[k] > 0; });
  ks.forEach(function(k, i){
    var d = document.createElement('div');
    d.className = 'at-tas' + (estLiquide(k) ? ' liquide' : '');
    d.setAttribute('data-tas', k);
    d._k = k; d._n = p[k];
    V.scene.appendChild(d);
    V.elTas.push(d);
  });
  if(V.elNeuf){ V.elNeuf.remove(); V.elNeuf = null; }
  if(ks.length && (V.etat.nouveaux || 0) > 0){
    var b = document.createElement('div');
    b.className = 'at-tas-neuf at-touche';
    b.setAttribute('data-at', 'arrivage');
    b.innerHTML = '<span>✨ Nouveau !</span>';
    V.scene.appendChild(b);
    V.elNeuf = b;
  }
  placerTas(V);
  placerFlacons(V);
}
function placerTas(V){
  var np = (V.plP && V.plP.length && V.elPlP) ? 1 : 0, n = (V.elTas || []).length + np;     /* (le panier des plantes qui attendent : la première place) */
  (V.elTas || []).forEach(function(d, i){
    var q = posTas(i + np, n), m = surSol(q.x, q.y), R = repere([m.X, 0, m.Z], AXES_FACE, TAS.w, TAS.h), D = dessinTas(d._k, d._n, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
    d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
    d.style.left = pX(V, q.x + b[0] - TAS.w / 2); d.style.top = pY(V, q.y + b[1] - TAS.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((TAS.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((TAS.h - b[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', R.k.toFixed(3));
    d.style.zIndex = Math.round((1000 + q.y) * 5);
    d._s = R.k; d._bb = b; d._p = {x:q.x, y:q.y, s:R.k}; d._w = TAS.w; d._h = TAS.h;
  });
  placerBotte(V);
  if(V.elNeuf && n){
    var q0 = posTas(0, n), q1 = posTas(Math.min(n, TAS.rang) - 1, n);
    V.elNeuf.style.left = pX(V, (q0.x + q1.x) / 2 - 85); V.elNeuf.style.top = pY(V, q0.y - TAS.h - 70);
    V.elNeuf.style.width = pW(V, 170); V.elNeuf.style.height = pH(V, 78);
    V.elNeuf.style.zIndex = Math.round((1000 + q0.y) * 5) + 3;
  }
}
/* Les potions finies : des flacons posés par terre devant la porte, comme la cueillette (on touche un flacon : à quoi elle sert, la donner, la vendre) */
function dessinerFlacons(V){
  (V.elFl || []).forEach(function(e){ e.remove(); });
  V.elFl = [];
  var P = V.o.potions || {};
  cles(P).filter(function(k){ return P[k] > 0; }).forEach(function(k){
    var d = document.createElement('div');
    d.className = 'at-flacon at-touche' + (V.flNeufs && V.flNeufs[k] ? ' at-nouveau' : '');
    d.setAttribute('data-at', 'potions');
    d.setAttribute('data-pot', k);
    d._k = k; d._n = P[k];
    V.scene.appendChild(d);
    V.elFl.push(d);
  });
  placerFlacons(V);
}
function placerFlacons(V){
  var l = V.elFl || [], n = l.length, rangs = Math.ceil((cles(V.etat.panier).filter(function(k){ return V.etat.panier[k] > 0; }).length + ((V.plP && V.plP.length) ? 1 : 0)) / TAS.rang);
  l.forEach(function(d, i){
    var q = posFlacon(i, n, rangs), m = surSol(q.x, q.y), R = repere([m.X, 0, m.Z], AXES_FACE, FLACONS.w, FLACONS.h), D = dessinFlacon(d._k, d._n, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
    d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
    d.style.left = pX(V, q.x + b[0] - FLACONS.w / 2); d.style.top = pY(V, q.y + b[1] - FLACONS.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((FLACONS.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((FLACONS.h - b[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', R.k.toFixed(3));
    d.style.zIndex = Math.round((1000 + q.y) * 5);
    d._bb = b; d._p = {x:q.x, y:q.y, s:R.k}; d._w = FLACONS.w; d._h = FLACONS.h; d._s = R.k;
  });
}
/* Une potion de plus : son flacon brille un moment (et un repère au bord le montre s'il est hors de l'écran) */
function brillerFlacons(V, l){
  V.flNeufs = {};
  l.forEach(function(k){ V.flNeufs[k] = 1; });
  (V.elFl || []).forEach(function(d){ d.classList.toggle('at-nouveau', !!V.flNeufs[d._k]); });
  majReperes(V); majSalleBouton(V);
  clearTimeout(V.flT);
  V.flT = apres(V, 7000, function(){ V.flNeufs = null; (V.elFl || []).forEach(function(d){ d.classList.remove('at-nouveau'); }); majReperes(V); majSalleBouton(V); });
}
function dessinerPiece(V, avantK){
  var sc = V.scene;
  sc.innerHTML = '';
  V.parId = {}; V.elO = {}; V.elK = {}; V.elTas = []; V.elNeuf = null; V.elFl = []; V.elPaSigne = null; V.elEtSigne = null; V.elPlP = null; V.plP = null;
  V.etat.objets.forEach(function(o){ V.parId[o.id] = o; });
  /* (la flaque : devant le chaudron, dans sa pièce) */
  if(V.etat.flaque && salleDe(V.parId.ch) === V.salle){
    var Fl = svgFlaque(V), fl = elFixe(V, 'at-flaque', Fl.F, Fl.svg, 'flaque');
    sc.appendChild(fl);
  }
  majDessin(V);
  ici(V).forEach(function(o){ var e = elObjet(V, o); sc.appendChild(e); });
  /* la cueillette et les potions : devant la porte de l'atelier */
  if(!V.salle){ dessinerTas(V); dessinerFlacons(V); }
  majFixes(V);
  cartonsIci(V).forEach(function(k, i){
    var e = elCarton(V, k, i);
    sc.appendChild(e);
    if(avantK && avantK.indexOf(k.id) < 0) anim(e, [{transform:'translateY(-' + Math.round(500 * V.k) + 'px) scale(' + e._s + ')', opacity:0}, {transform:'translateY(0) scale(' + e._s * 1.08 + ',' + e._s * 0.9 + ')', opacity:1, offset:0.75}, {transform:'translateY(0) scale(' + e._s + ')', opacity:1}], {duration:650, easing:'ease-in', delay:i * 120, fill:'backwards'});
  });
  placerTout(V);
  dessinerBetises(V);
  majIndiceCarton(V);
  majLumiere(V);
  majCiblesSel(V);
  majTient(V);
  majReperes(V);
  majSalleBouton(V);
  if(GUIDE) guidePlacer(V);
}
/* ---------- Passer d'une pièce à l'autre (l'arche, le bouton 🛏️ / ⚗️ en bas à gauche) ---------- */
function majSalleBouton(V){
  var b = V.elSalle;
  if(!b) return;
  var autre = 1 - V.salle, ic = b.querySelector('.at-salle-ic'), bd = b.querySelector('.at-badge');
  ic.textContent = autre ? '🛏️' : '⚗️';
  b.setAttribute('aria-label', autre ? 'Aller dans la chambre' : 'Retourner dans l\'atelier');
  /* là-bas, des cartons attendent ; ou dans l'atelier, du nouveau (cueillette, potion, objet à analyser) */
  var nk = V.etat.cartons.filter(function(k){ return (k.ch ? 1 : 0) === autre; }).length;
  var neuf = !autre && ((V.etat.nouveaux || 0) > 0 || !!V.flNeufs || (analysesEnAttente(V) > 0 && salleDe(V.parId.pa) === 0));
  if(bd){ bd.textContent = nk ? nk : '!'; bd.style.display = nk || neuf ? '' : 'none'; }
  b.classList.toggle('at-appel', nk > 0 || neuf);
}
function changerSalle(V, s, opts){
  opts = opts || {};
  if(V.arrete || V.mode !== 'ranger') return;
  s = s ? 1 : 0;
  if(V.salle === s){ if(opts.centre) allerVers(V, opts.centre.x, opts.centre.y); return; }
  fermerBullesPa(V);
  if(V.ouvert) fermerOuvert(V);
  if(V.grim && !V.grim.hidden) fermerGrimoire(V);
  var de = V.salle;
  V.salle = s; SALLE_MEMO = s;
  majFond(V);
  dessinerPiece(V);
  /* on arrive par l'arche : dans la chambre, elle est à gauche ; dans l'atelier, à droite */
  var c = opts.centre || (s ? {x:330, y:560} : {x:900, y:560});
  centrerSur(V, c.x, c.y, true);
  anim(V.monde, [{opacity:0.2, transform:V.monde.style.transform + ' translateX(' + (s > de ? 80 : -80) + 'px)'}, {opacity:1, transform:V.monde.style.transform}], {duration:360, easing:'ease-out'});
  son(V, 'porte');
  if(s && !V.etat.vuChambre){
    V.etat.vuChambre = 1;
    var t = 'Ta chambre ! Touche les cartons pour l\'installer. Pour revenir à l\'atelier : le bouton ⚗️ ou l\'arche.';
    toast(V, '<b>🛏️ ✨</b> ' + esc(t), 6000, t);
    changer(V);
  }
  chatsDemarrer(V);
}
/* Un objet lâché sur l'arche ou sur le bouton de l'autre pièce : il y passe (avec ce qui est posé dessus) ; on le suit */
function envoyerSalle(V, o){
  var s = 1 - V.salle, enf = enfantsDe(V, o);
  [o].concat(enf).forEach(function(x){ if(s) x.pc = 1; else delete x.pc; });
  o.sur = null; o.cote = 0; delete o.pz; delete o.py; o.neuf = 0;
  var avant = V.salle;
  V.salle = s; trouverPlace(V, o); V.salle = avant;
  changerSalle(V, s);
  var F = cadreObjet(V, o.id);
  if(F) centrerSur(V, F.x, F.y - F.h / 2, true);
  etincelles(V, o);
  var nom = catDe(o).nom, t = s ? nom + ' : dans la chambre !' : nom + ' : dans l\'atelier !';
  toast(V, '<b>' + (catDe(o).ic || '✨') + ' ➡️ ' + (s ? '🛏️' : '⚗️') + '</b> ' + esc(t), 3000, t);
  majLumiere(V);
  changer(V);
}
/* Ce que les meubles spéciaux doivent montrer (objets reçus sur la paillasse, chaudron de cuivre) */
function majDessin(V){
  DESSIN.plantes = (typeof V.o.plantes === 'function' ? V.o.plantes() : V.o.plantes) || 0;   /* (enquête 3) les plantes cueillies qui attendent sur l'établi */
  DESSIN.analyses = V.o.analyses || [];
  DESSIN.cuivre = aObjet(V, 'chaudron_cuivre');
}
/* Le contenu changeant : le carton du coin (son nombre), la paillasse (objets reçus), le chaudron (prêt, fioles vides) */
/* (sans ceux dont ce n'est pas encore le tour au tutoriel, a.attend : ils attendent sur le cuir, « Plus tard ! ») */
function analysesEnAttente(V){ return (V.o.analyses || []).filter(function(a){ return !a.fait && !a.attend; }).length; }
/* Le signe de la paillasse (Romain, 11 novembre, 13 h 42 : « un signe bien clair qu'il y a quelque chose à analyser ») : une étiquette
   « 🔬 À analyser ! » qui sautille au-dessus de la paillasse, tant qu'un objet reçu attend son analyse — quel que soit l'ordre
   d'arrivée des codes. La toucher fait comme toucher la paillasse (ses bulles). Cachée quand les bulles sont ouvertes. */
function majSignePa(V){
  var o = V.parId && V.parId.pa, n = analysesEnAttente(V), voir = !!(o && V.elO.pa && n > 0 && V.bullesPa !== 'pa');
  if(!voir){ if(V.elPaSigne){ V.elPaSigne.remove(); V.elPaSigne = null; } return; }
  if(!V.elPaSigne){
    var b = document.createElement('div');
    b.className = 'at-tas-neuf at-pa-signe at-touche';
    b.setAttribute('data-at', 'pa-signe');
    V.scene.appendChild(b);
    V.elPaSigne = b;
  }
  var txt = n > 1 ? '🔬 ' + n + ' à analyser !' : '🔬 À analyser !';
  if(V.elPaSigne._t !== txt){ V.elPaSigne.innerHTML = '<span>' + txt + '</span>'; V.elPaSigne._t = txt; V.elPaSigne.setAttribute('aria-label', txt); }
  var F = cadreObjet(V, 'pa');
  if(!F) return;
  V.elPaSigne.style.left = pX(V, F.x - 110); V.elPaSigne.style.top = pY(V, F.y - F.h - 62);
  V.elPaSigne.style.width = pW(V, 220); V.elPaSigne.style.height = pH(V, 70);
  V.elPaSigne.style.zIndex = Math.round((1000 + F.y) * 5) + 3;
}
/* Le signe de l'établi (comme celui de la paillasse) : « 🌿 À préparer ! » sautille au-dessus de lui tant qu'une plante cueillie attend.
   Le toucher fait comme toucher l'établi (ses bulles). Caché quand ses bulles sont ouvertes. */
function majSigneEt(V){
  var o = V.parId && V.parId.et, n = (typeof V.o.plantes === 'function' ? V.o.plantes() : V.o.plantes) || 0, autre = V.o.etabliSigne || '', voir = !!(o && V.elO.et && (n > 0 || autre) && V.bullesPa !== 'et');
  if(!voir){ if(V.elEtSigne){ V.elEtSigne.remove(); V.elEtSigne = null; } return; }
  if(!V.elEtSigne){
    var b = document.createElement('div');
    b.className = 'at-tas-neuf at-pa-signe at-et-signe at-touche';
    b.setAttribute('data-at', 'et-signe');
    V.scene.appendChild(b);
    V.elEtSigne = b;
  }
  var txt = n > 1 ? '🌿 ' + n + ' à préparer !' : n === 1 ? '🌿 À préparer !' : autre;
  if(V.elEtSigne._t !== txt){ V.elEtSigne.innerHTML = '<span>' + txt + '</span>'; V.elEtSigne._t = txt; V.elEtSigne.setAttribute('aria-label', txt); }
  var F = cadreObjet(V, 'et');
  if(!F) return;
  V.elEtSigne.style.left = pX(V, F.x - 110); V.elEtSigne.style.top = pY(V, F.y - F.h - 62);
  V.elEtSigne.style.width = pW(V, 220); V.elEtSigne.style.height = pH(V, 70);
  V.elEtSigne.style.zIndex = Math.round((1000 + F.y) * 5) + 3;
}
/* Les plantes cueillies qui n'ont pas trouvé de place sur la tringle de l'établi (trois places) : un panier posé devant la porte,
   dans la rangée de la cueillette (la première place), d'où dépassent les plantes qui attendent.
   On le touche : elles vont se pendre s'il reste de la place ; sinon « il n'y a plus de place » (plantes.js : M.rangerPlantes). */
function dessinBotte(V, l, R){
  var x = ajouterOutils3d(ctx3d(R, false)), cz = 30, pts = [], n = l.length, vus = l.slice(0, 4), w = 80, h = 99;
  x.p = 60; x.cat = {w:TAS.w, h:TAS.h};
  for(var i = 0; i < 24; i++){ var a = i / 24 * Math.PI * 2; pts.push(x.Q(43 + Math.cos(a) * 40, TAS.h, cz + Math.sin(a) * 30)); }
  var s = '<path d="' + lisse(pts, true) + '" fill="rgba(12,6,20,.3)"/>' +
    /* l'anse du panier (derrière les plantes) */
    x.sur('<path d="M8,60 C8,2 78,2 78,60" fill="none" stroke="' + K + '" stroke-width="9" stroke-linecap="round"/><path d="M8,60 C8,2 78,2 78,60" fill="none" stroke="#d9a066" stroke-width="4.5" stroke-linecap="round"/>', cz) +
    x.cylindre(43, cz, 36, 58, 86, '#c58a4a', null, '', 30) + x.arcAvant(43, cz, 35, 68, '#8a5a2a', 3) + x.arcAvant(43, cz, 33, 78, '#8a5a2a', 3) +
    x.cylindre(43, cz, 37, 56, 62, '#d9a066', '#7a4f26', ' stroke-width="3.5"') +
    x.sur(vus.map(function(k, j){ var cx = 43 + (j - (vus.length - 1) / 2) * 15; return V.o.planteSVG ? V.o.planteSVG(k, f1(cx - w / 2), 68 - h, w, h) : emo(cx, 30, 30, '🌿'); }).join(''), cz) +
    x.arcAvant(43, cz, 37, 59, '#d9a066', 6) + x.arcAvant(43, cz, 37, 62.5, K, 2.5) + x.arcAvant(43, cz, 37, 55.5, K, 2.5) +
    x.sur('<circle cx="14" cy="66" r="14" fill="#ffd23f" stroke="' + K + '" stroke-width="3"/><text x="14" y="66" font-size="17" font-weight="800" fill="#24182e" text-anchor="middle" dominant-baseline="central">' + n + '</text>', cz - 30);
  [[-6, -38], [92, -38], [-6, 82], [92, 82]].forEach(function(q){ x.Q(q[0], q[1], cz - 30); });
  var b = x.bb.slice();
  return {svg:'<rect x="' + f1(b[0]) + '" y="' + f1(b[1]) + '" width="' + f1(b[2] - b[0]) + '" height="' + f1(b[3] - b[1]) + '" fill="transparent"/>' + s, bb:b};
}
function placerBotte(V){
  var d = V.elPlP, l = V.plP || [];
  if(!d || !l.length) return;
  var nt = (V.elTas || []).length, q = posTas(0, nt + 1), m = surSol(q.x, q.y), R = repere([m.X, 0, m.Z], AXES_FACE, TAS.w, TAS.h), D = dessinBotte(V, l, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
  d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
  d.style.left = pX(V, q.x + b[0] - TAS.w / 2); d.style.top = pY(V, q.y + b[1] - TAS.h);
  d.style.width = pW(V, bw); d.style.height = pH(V, bh);
  d.style.transformOrigin = ((TAS.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((TAS.h - b[1]) / bh * 100).toFixed(2) + '%';
  d.style.setProperty('--s', R.k.toFixed(3));
  d.style.zIndex = Math.round((1000 + q.y) * 5);
}
function majPlantesPorte(V){
  var l = (!V.salle && V.o.plantesPorte) ? V.o.plantesPorte() : [], sig = l.join(','), av = V.plP ? V.plP.join(',') : '';
  if(!l.length){
    if(V.elPlP){ V.elPlP.remove(); V.elPlP = null; }
    V.plP = null;
    if(av){ placerTas(V); placerFlacons(V); }
    return;
  }
  var neuf = !V.elPlP;
  if(neuf){ var b = document.createElement('div'); b.className = 'at-plantes-porte at-touche'; b.setAttribute('data-at', 'plantes-porte'); V.scene.appendChild(b); V.elPlP = b; }
  V.plP = l;
  V.elPlP.setAttribute('aria-label', l.length + (l.length > 1 ? ' plantes attendent' : ' plante attend') + ' devant la porte');
  if(neuf || sig !== av){ placerTas(V); placerFlacons(V); }
}
function majFixes(V){
  var nr = Math.max(0, V.etat.reserve.length - (V.enVol || 0)), rb = V.elReserve && V.elReserve.querySelector('.at-badge');
  if(rb){ rb.textContent = nr; rb.style.display = nr ? '' : 'none'; }
  majDessin(V);
  var pa = V.parId.pa, att = analysesEnAttente(V);
  if(pa && V.elO.pa){
    redessiner(V, pa);
    V.elO.pa.classList.toggle('at-attente', att > 0);
  }
  majSignePa(V);
  majPlantesPorte(V);
  if(V.parId.et && V.elO.et){ redessiner(V, V.parId.et); majSigneEt(V); } else if(V.elEtSigne){ V.elEtSigne.remove(); V.elEtSigne = null; }
  var ch = V.elO.ch;
  if(ch){
    var pret = (V.o.fioles || 0) > 0 && recettesDe(V).some(function(r){ return etatRecette(V, r.id).pret; });
    ch.classList.toggle('at-pret', pret);
    var vb = ch.querySelector('.at-vides');
    if(vb) vb.outerHTML = videsHTML(V);
  }
}
/* Les fioles vides : un petit badge sur le chaudron (il faut une fiole vide pour chaque potion) */
function videsHTML(V){
  var n = V.o.fioles || 0;
  return '<span class="at-vides' + (n ? '' : ' zero') + '" aria-hidden="true"><svg viewBox="0 0 24 34"><path d="M9,2 H15 V11 C21,13 22,30 12,31 C2,30 3,13 9,11 Z" fill="rgba(220,250,255,.75)" stroke="#24182e" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<rect x="8" y="0.5" width="8" height="4" rx="1.5" fill="#c58a4a" stroke="#24182e" stroke-width="1.5"/></svg><b>' + n + '</b></span>';
}
/* Plus de fiole vide : le badge du chaudron clignote un moment (et on le montre) */
function brillerVides(V){
  var ch = V.elO.ch;
  if(!ch) return;
  var F = cadreObjet(V, 'ch');
  if(F) allerVers(V, F.x, F.y - F.h / 2);
  ch.classList.add('at-vides-appel');
  apres(V, 5000, function(){ if(V.elO.ch) V.elO.ch.classList.remove('at-vides-appel'); });
}
function briller(V, el, ms){
  if(!el) return;
  el.classList.add('at-nouveau');
  majReperes(V);
  apres(V, ms || 6000, function(){ el.classList.remove('at-nouveau'); majReperes(V); });
}
function elObjet(V, o){
  var c = catDe(o), d = document.createElement('div');
  d.className = 'at-o at-t-' + c.t + ' at-z-' + c.z + (c.plat ? ' at-plat' : '') + (c.cases ? ' at-rang' : '') + (c.verre ? ' at-verre' : '') + (o.neuf ? ' at-neuf' : '') + (o.cote ? ' at-profil' : '') +
    (c.deco ? ' at-deco' : '') + (c.special ? ' at-special' : '') + (c.cls ? ' ' + c.cls : '');
  d.setAttribute('data-obj', o.id);
  V.elO[o.id] = d;
  if(o.t === 'chat') chatHabiller(V, o, d);
  placerEl(V, o, true);
  if(o.t === 'chat'){ majHumeur(V, o); apres(V, 0, function(){ majBarre(V); }); }   /* (elle sort de son carton : son bouton 🐾 apparaît) */
  return d;
}
/* Le dessin d'un objet (dans la perspective, là où il est) ; un rangement porte en plus sa petite règle (💧 le verre, 🍃 les choses sèches),
   visible quand on tient un ingrédient ; le chaudron, le nombre de fioles vides */
function htmlObjet(V, o, R){
  /* (plus de petit chiffre sur la paillasse : son signe « À analyser ! » le remplace, majSignePa, 11 novembre) */
  var c = catDe(o), D = dessinObjet(o, R), b = D.bb, att = 0;
  return {bb:b, html:'<svg viewBox="' + [b[0], b[1], b[2] - b[0], b[3] - b[1]].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>' +
    (c.cases ? '<span class="at-regle ' + (c.verre ? 'at-regle-v' : 'at-regle-s') + '" aria-hidden="true">' + (c.verre ? '💧' : '🍃') + '</span>' : '') +
    (att ? '<b class="at-badge">' + att + '</b>' : '') + (c.special === 'chaudron' ? videsHTML(V) : '') + (o.t === 'chat' ? bulleHTML(o, V) + bonheurHTML(o) : '')};
}
/* Placer un objet : son ancre (le milieu du bas de sa face avant) à sa place ; son cadre suit son dessin.
   Il se redessine quand sa place dans la pièce change (la perspective n'est pas la même partout). */
function placerEl(V, o, force){
  var d = V.elO[o.id];
  if(!d) return;
  var c = catDe(o), p = o.t === 'chat' ? chatPos(V, o) : posObj(V, o);
  var cle = c.plat ? 'plat' : p.R.o.map(function(v){ return v.toFixed(1); }).join(',') + '|' + (o.cote || '');
  if(force || d._cle !== cle){
    var H = htmlObjet(V, o, c.plat ? null : p.R);
    d.innerHTML = H.html; d._bb = H.bb; d._cle = cle; d._w = c.w; d._h = c.h;
    if(o.t === 'chat') chatMonter(V, o, d);
  }
  var b = d._bb, bw = b[2] - b[0], bh = b[3] - b[1];
  d.style.left = pX(V, p.x + b[0] - c.w / 2);
  d.style.top = pY(V, p.y + b[1] - c.h);
  d.style.width = pW(V, bw);
  d.style.height = pH(V, bh);
  d.style.transformOrigin = ((c.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((c.h - b[1]) / bh * 100).toFixed(2) + '%';
  d.style.setProperty('--s', p.s.toFixed(3));
  d.style.zIndex = V.bain && V.bain.o === o && V.bain.dedans && V.bain.z ? V.bain.z : Math.round(p.z * 5);      /* (dans son baquet : sa place à lui) */
  d._s = p.s; d._p = p;
  if(o.id === 'pa' && V.elPaSigne) majSignePa(V);   /* (la paillasse bouge : son signe la suit) */
  if(o.id === 'et' && V.elEtSigne) majSigneEt(V);   /* (l'établi aussi) */
}
function placerTout(V){ ici(V).forEach(function(o){ placerEl(V, o); }); }
function redessiner(V, o){
  var d = V.elO[o.id];
  if(!d) return;
  placerEl(V, o, true);
  d.classList.toggle('at-neuf', !!o.neuf);
  d.classList.toggle('at-profil', !!o.cote);
}
/* Les cartons arrivés : posés par terre, en avant, sur les côtés (le milieu reste pour la cueillette et les potions) */
function placeCarton(V, d, k, i){
  var t = CARTON_TAILLE[k.t] || CARTON_TAILLE.carton, p = POS_CARTONS[i % POS_CARTONS.length], m = surSol(p[0], p[1]);
  var R = repere([m.X, 0, m.Z], AXES_FACE, t[0], t[1]), D = dessinCarton(k, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
  d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>' +
    '<span class="at-reste">' + new Array(Math.min(6, k.reste.length) + 1).join('<i></i>') + '</span>';
  d.style.left = pX(V, p[0] + b[0] - t[0] / 2);
  d.style.top = pY(V, p[1] + b[1] - t[1]);
  d.style.width = pW(V, bw);
  d.style.height = pH(V, bh);
  d.style.transformOrigin = ((t[0] / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((t[1] - b[1]) / bh * 100).toFixed(2) + '%';
  d.style.setProperty('--s', R.k.toFixed(3));
  d.style.zIndex = Math.round((1000 + p[1]) * 5);
  d._s = R.k; d._p = p; d._t = t;
}
function elCarton(V, k, i){
  var d = document.createElement('div');
  d.className = 'at-carton at-k-' + k.t + (k.ouvert ? ' at-ouvert-c' : '');
  d.setAttribute('data-carton', k.id);
  placeCarton(V, d, k, i);
  V.elK[k.id] = d;
  return d;
}
/* Petite main qui montre le premier carton tant que l'atelier est vide */
function majIndiceCarton(V){
  var m = q(V, '.at-main-indice');
  /* (pas pendant le guidage du tutoriel, ni quand le 📦 du coin a déjà des objets à installer : c'est lui qu'il faut toucher) */
  var montrer = V.mode === 'ranger' && !GUIDE && !V.etat.reserve.length && !ici(V).some(function(o){ var c = catDe(o); return !c.special && o.t !== 'fioles_ingr'; }) && cartonsIci(V).length;
  if(!montrer){ if(m) m.remove(); return; }
  if(!m){ m = document.createElement('div'); m.className = 'at-main-indice'; m.textContent = '👆'; V.calque.appendChild(m); }
  var p = POS_CARTONS[0];
  m.style.left = pX(V, p[0]);
  m.style.top = pY(V, p[1] - 130);
}

/* ---------- L'ingrédient qu'elle tient (choisi dans le carton) : les rangements qui l'acceptent brillent ---------- */
function majCiblesSel(V, kForce){
  var k = kForce !== undefined ? kForce : V.sel;
  V.root.classList.toggle('at-choix', !!k);
  V.etat.objets.forEach(function(o){
    var d = V.elO[o.id], c = catDe(o);
    if(!d || !c.cases) return;
    d.classList.toggle('at-dispo', !!k && !!c.verre === estLiquide(k));
  });
}
function majTient(V){
  var t = V.tientEl, k = V.sel;
  if(!t) return;
  if(!k || !(V.etat.panier[k] > 0)){ V.sel = null; t.hidden = true; t.innerHTML = ''; majCiblesSel(V); return; }
  if(V.ouvert || (V.grim && !V.grim.hidden)){ t.hidden = true; majCiblesSel(V); return; }   /* un gros plan ou un panneau est ouvert */
  var n = V.etat.panier[k];
  t.innerHTML = '<span class="at-tient-j" style="--c:' + coulIngr(k) + '">' + icIngr(k) + '</span><span class="at-tient-t"><b>' + esc(nomIngr(k)) + (n > 1 ? ' ×' + n : '') + '</b><small>' +
    (estLiquide(k) ? '💧 Touche un bocal ou une fiole qui brille' : '🍃 Touche un tiroir ou un placard qui brille') + '</small></span>' +
    '<button type="button" class="at-rond at-tient-x" aria-label="Lâcher">✖</button>';
  t.hidden = false;
  majCiblesSel(V);
}
function nomIngr(k){ return (INGR[k] && INGR[k].nom) || k; }

/* ---------- Bulle d'information (avec 🔊 si l'explication peut être lue) ---------- */
var APPRIS = 3;
function toast(V, html, ms, lu, plus){
  var t = V.toastEl;
  V.toastLu = lu || '';
  t.innerHTML = '<span class="at-toast-t">' + typo(html) + '</span>' + (lu ? '<button type="button" class="at-rond at-toast-lire" aria-label="Écouter">🔊</button>' : '') + (plus || '');
  t.hidden = false;
  t.classList.remove('at-toast-on'); void t.offsetWidth; t.classList.add('at-toast-on');
  clearTimeout(V.toastT);
  V.toastT = apres(V, ms || (lu ? 5000 : 2200), function(){ t.hidden = true; });
}
function prolongerToast(V, ms){
  var t = V.toastEl;
  clearTimeout(V.toastT);
  V.toastT = apres(V, ms, function(){ t.hidden = true; });
}
/* Après une erreur, toutes les petites règles 💧 / 🍃 se montrent un moment */
function montrerRegles(V){
  V.root.classList.add('at-regle-flash');
  clearTimeout(V.regleT);
  V.regleT = apres(V, 4500, function(){ V.root.classList.remove('at-regle-flash'); });
}
/* Le liquide n'a rien à faire dans un tiroir, le sec rien dans un bocal : on explique, on ne perd rien */
var NOM_LIQ = {eau:['L\'eau', 'coulerait'], miel:['Le miel', 'coulerait'], brume:['La brume', 's\'envolerait']};
var NOM_SEC = {baies:['les baies', 'pourriraient'], champignon:['le champignon', 'pourrirait'], trefle:['le trèfle', 'pourrirait'], lavande:['la lavande', 'pourrirait'],
  pensee:['les pensées', 'pourriraient'], menthe:['la menthe', 'pourrirait'], ortie:['l\'ortie', 'pourrirait'], racine:['la racine', 'moisirait'], lune:['la poussière de lune', 'ferait des grumeaux']};
var DE_RANGEMENT = {commode:'du tiroir', casier:'du tiroir', apothicaire:'du tiroir', placard:'du placard'};
function texteMauvaisRangement(k, o){
  if(estLiquide(k)){
    var l = NOM_LIQ[k] || ['Ça', 'coulerait'];
    return l[0] + ' ' + l[1] + ' ' + (DE_RANGEMENT[o.t] || 'de là') + ' ! Les liquides vont dans les bocaux.';
  }
  var s = NOM_SEC[k] || ['ça', 'pourrirait'];
  return (o.t === 'fioles_ingr' ? 'Dans une fiole fermée, ' : 'Dans un bocal fermé, ') + s[0] + ' ' + s[1] + ' ! Les choses sèches vont dans les tiroirs et les placards.';
}
function jetonHTML(k, n, de, on, extra){
  return '<div class="at-jeton' + (on ? ' on' : '') + (estLiquide(k) ? ' liquide' : '') + '" data-ingr="' + k + '" data-de="' + de + '"' + (extra || '') + ' style="--c:' + coulIngr(k) + '"><span>' + icIngr(k) + '</span>' + (n > 1 ? '<b>' + n + '</b>' : '') + '</div>';
}

/* ==========================================================
   Gestes : tout se fait en touchant l'image de l'atelier.
   - toucher une chose : son action (un rangement s'ouvre en gros plan, le chaudron, le grimoire, la paillasse…) ;
     la décoration (tapis, plante, tableau, murs, plancher…) change de style ou de couleur ;
   - appuyer et garder le doigt (un quart de seconde), puis glisser : on déplace le meuble, il reste exactement là où on le lâche
     (au bord de l'écran, la pièce défile ; sur le carton 📦 en bas à droite de l'écran, la décoration se range) ;
   - glisser tout de suite : la pièce défile (téléphone) ; sur un grand écran, le meuble se déplace ;
   - la cueillette posée devant la porte : on la glisse directement dans un rangement.
   ========================================================== */
var SEUIL_GESTE = 9;     /* en pixels : en dessous, c'est un toucher ; au-dessus, un glisser */
var PORTER_LOIN = 30;    /* en pixels : le doigt qui caressait Mimi et s'éloigne d'autant de son pelage l'emmène (on la porte) */
var TENIR = 260;         /* en millisecondes : appuyer et garder le doigt, le meuble se soulève */
function suivre(V, e, cb, seuil){
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, bouge = false, s = seuil === undefined ? SEUIL_GESTE : seuil, s2 = s * s;
  function mv(ev){
    if(ev.pointerId !== id) return;
    var dx = ev.clientX - x0, dy = ev.clientY - y0;
    if(!bouge && dx * dx + dy * dy >= s2){ bouge = true; if(cb.debut) cb.debut(ev); }
    if(bouge && cb.move) cb.move(ev, dx, dy);
  }
  function up(ev){
    if(ev.pointerId !== id) return;
    fin();
    if(cb.up) cb.up(ev, bouge, ev.type === 'pointercancel', ev.clientX - x0, ev.clientY - y0);
  }
  function fin(){
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    V.suivis = V.suivis.filter(function(f){ return f !== fin; });
  }
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
/* Un geste qui ne déplace rien : un toucher fait l'action, un glisser fait défiler la pièce */
function gesteOuDefile(V, e, surToucher, chasse){
  var p0 = {x:V.pan.x, y:V.pan.y};
  suivre(V, e, {
    debut:function(){ V.root.classList.add('at-defile'); },
    move:function(ev, dx, dy){ panA(V, p0.x - dx, p0.y - dy); if(chasse) chasseDoigt(V, ev); },     /* (le chat suit le doigt sur le plancher) */
    up:function(ev, bouge, annule){
      V.root.classList.remove('at-defile');
      if(chasse && bouge) chasseFin(V);
      if(!bouge && !annule && surToucher) surToucher(ev);
    }
  });
}

function brancher(V){
  /* (16 novembre au soir) Mimi suit le doigt des yeux, où qu'il soit dans la pièce (Romain : « ses yeux et sa tête suivent ton doigt ») */
  var vuT = 0;
  function suivre(e){
    var n = Date.now();
    if(V.arrete || n - vuT < 50) return;
    vuT = n;
    chatsDe(V).forEach(function(c){ var r = pantinDe(V, c), s = V.chats[c.id]; if(r && s && s.pose !== 'dort' && !s.passe) r.regard(e.clientX, e.clientY, e.pointerType === 'mouse' ? 900 : 1700); });
  }
  ecoute(V, V.piece, 'pointerdown', suivre); ecoute(V, V.piece, 'pointermove', suivre);
  /* --- la pièce --- */
  ecoute(V, V.piece, 'pointerdown', function(e){
    if(V.arrete || e.button > 0) return;
    V.dernierPointeur = Date.now(); V.enGeste = true;
    var t = e.target;
    if(t.closest('.at-repere') || t.closest('.at-tient')) return;
    /* (16 novembre) la plume ou le point rouge : ils suivent le doigt, partout dans la pièce (sauf sur les boutons) */
    if(V.jouet && V.jouet.doigt && V.mode === 'ranger' && !t.closest('button')){ e.preventDefault(); jouetDoigt(V, e); return; }
    if(V.barreMimi && !V.barreMimi.hidden && !t.closest('.at-mimi-bt')) fermerBarre(V);
    var obj = t.closest('.at-o'), carton = t.closest('.at-carton'), tas = t.closest('.at-tas'), fixe = t.closest('[data-at]'), surf = t.closest('[data-surf]'), bul = t.closest('.at-bulle-pa');
    e.preventDefault();
    /* les bulles de la paillasse : on touche ailleurs (ni une bulle, ni la paillasse), elles s'en vont */
    if(V.bullesPa && !bul && !(obj && obj.getAttribute('data-obj') === V.bullesPa) && !guideBulles(V)) fermerBullesPa(V);
    /* le guidage du tutoriel : seulement ce qui brille (ailleurs : « Pas maintenant », la pièce peut glisser) */
    if(GUIDE && V.mode === 'ranger' && !guideAutorise(V, t)){ gesteOuDefile(V, e, function(){ pasMaintenant(V); }); return; }
    if(V.mode !== 'ranger'){ gesteOuDefile(V, e, null); return; }
    if(bul){ gesteOuDefile(V, e, function(){ bullePaillasse(V, bul.getAttribute('data-bulle')); }); return; }
    if(tas){ glisserTas(V, e, tas.getAttribute('data-tas'), tas); return; }
    if(carton){ gesteOuDefile(V, e, function(){ ouvrirCarton(V, carton.getAttribute('data-carton')); }); return; }
    /* la bulle du chat (ce qu'il demande) : un toucher dit quoi faire */
    if(obj && t.closest('.at-bulle')){ var oc = V.parId[obj.getAttribute('data-obj')]; gesteOuDefile(V, e, function(){ if(oc) bulleChat(V, oc); }); return; }
    if(obj && t.closest('.at-bonheur-hab')){ var oh = obj.getAttribute('data-obj'); gesteOuDefile(V, e, function(){ ouvrirGarde(V, oh); }); return; }
    /* ✕ à côté de sa barre de bonheur : elle s'enlève tout de suite (Romain, 5 novembre, 12 h 31) */
    if(obj && t.closest('.at-bonheur-x')){ var ox = V.parId[obj.getAttribute('data-obj')]; gesteOuDefile(V, e, function(){ if(ox){ cacherBonheur(V, ox); son(V, 'clic'); } }); return; }
    if(obj){
      var o = V.parId[obj.getAttribute('data-obj')];
      if(o) prendreObjet(V, e, o);
      return;
    }
    if(fixe){
      var pot = t.closest('[data-pot]');
      gesteOuDefile(V, e, function(){ action(V, fixe.getAttribute('data-at'), pot ? pot.getAttribute('data-pot') : fixe.getAttribute('data-b')); });
      return;
    }
    gesteOuDefile(V, e, surf ? function(){ restylerSurface(V, surf.getAttribute('data-surf')); } : null, true);
  });
  /* (la souris envoie aussi un « click » après un long glisser : on le reconnaît à l'heure du lâcher) */
  ecoute(V, window, 'pointerup', function(){ if(V.enGeste){ V.enGeste = false; V.dernierPointeur = Date.now(); } }, true);
  /* un clic sans doigt ni souris (clavier, robot d'essai) : même action */
  ecoute(V, V.piece, 'click', function(e){
    var t = e.target, b = t.closest('button');
    if(b && b.hasAttribute('data-voir')){ voir(V, b.getAttribute('data-voir')); return; }
    if(b && b.classList.contains('at-tient-x')){ lacher(V); return; }
    if(Date.now() - (V.dernierPointeur || 0) < 700 || V.mode !== 'ranger') return;
    if(GUIDE && !guideAutorise(V, t)){ pasMaintenant(V); return; }
    var fixe = t.closest('[data-at]'), obj = t.closest('.at-o'), carton = t.closest('.at-carton'), tas = t.closest('.at-tas'), surf = t.closest('[data-surf]'), bul = t.closest('.at-bulle-pa');
    if(bul){ bullePaillasse(V, bul.getAttribute('data-bulle')); return; }
    if(tas){ ouvrirArrivage(V, tas.getAttribute('data-tas')); return; }
    if(carton){ ouvrirCarton(V, carton.getAttribute('data-carton')); return; }
    if(obj && t.closest('.at-bulle')){ var oc = V.parId[obj.getAttribute('data-obj')]; if(oc) bulleChat(V, oc); return; }
    if(obj && t.closest('.at-bonheur-hab')){ ouvrirGarde(V, obj.getAttribute('data-obj')); return; }
    if(obj && t.closest('.at-bonheur-x')){ var ox2 = V.parId[obj.getAttribute('data-obj')]; if(ox2){ cacherBonheur(V, ox2); son(V, 'clic'); } return; }
    if(obj){ var o = V.parId[obj.getAttribute('data-obj')]; if(o) toucherObjet(V, o, e); return; }
    if(fixe){ var pot = t.closest('[data-pot]'); action(V, fixe.getAttribute('data-at'), pot ? pot.getAttribute('data-pot') : fixe.getAttribute('data-b')); return; }
    if(surf) restylerSurface(V, surf.getAttribute('data-surf'));
  });
  /* la molette ou le pavé tactile font défiler la pièce */
  ecoute(V, V.piece, 'wheel', function(e){
    if(!V.root.classList.contains('at-glissable')) return;
    var dx = e.deltaX, dy = e.deltaY;
    if(V.mondeH <= V.vh + 1){ dx += dy; dy = 0; }
    if(V.mondeW <= V.vw + 1){ dy += dx; dx = 0; }
    e.preventDefault();
    panPar(V, dx, dy);
  }, {passive:false});

  /* --- le gros plan d'un rangement --- */
  ecoute(V, V.ouvertEl, 'pointerdown', function(e){
    var j = e.target.closest('[data-de]');
    if(!j || !V.ouvert || V.mode !== 'ranger' || V.ouvert.etq) return;     /* en mode étiquettes, toucher une case colle l'étiquette */
    e.preventDefault();
    var de = j.getAttribute('data-de'), k = j.getAttribute('data-ingr');
    /* elle tient quelque chose pris dans un tiroir : tout le plateau (qui brille) veut dire « remets-le devant la porte » */
    if(de === 'panier' && V.selCase){ V.dernierPointeur = Date.now(); remettreAuCarton(V); return; }
    if(de === 'panier') glisserIngr(V, e, {de:'panier', ingr:k, el:j}, function(){ choisirIngr(V, k); });
    else glisserIngr(V, e, {de:'case', o:V.ouvert.o, ci:+j.getAttribute('data-ci'), ingr:k, el:j}, function(){ choisirDansCase(V, V.ouvert.o, +j.getAttribute('data-ci'), k); });
  });
  ecoute(V, V.ouvertEl, 'click', function(e){
    if(!V.ouvert) return;
    var o = V.parId[V.ouvert.o];
    if(!o) return;
    var b = e.target.closest('button');
    if(b && b.classList.contains('at-fermer')){ fermerOuvert(V); son(V, 'clic'); return; }
    if(b && b.classList.contains('at-peindre')){ restyler(V, o); dessinerOuvert(V); return; }
    if(b && b.classList.contains('at-zoom-etq')){ V.ouvert.etq = !V.ouvert.etq; V.etqSel = null; son(V, 'clic'); dessinerOuvert(V); return; }
    if(b && b.hasAttribute('data-etq')){ V.etqSel = V.etqSel === b.getAttribute('data-etq') ? null : b.getAttribute('data-etq'); son(V, 'clic'); dessinerOuvert(V); return; }
    if(b && b.hasAttribute('data-retire')){ retirerEtiquette(V, o, +b.getAttribute('data-ci'), +b.getAttribute('data-retire'), b); return; }
    if(b && b.classList.contains('at-lire')){ lire(V, b.getAttribute('data-lu') || ''); return; }
    if(e.target.closest('[data-de]') && !V.ouvert.etq) return;          /* déjà traité au toucher */
    var c = e.target.closest('.at-case');
    if(c){ toucherCase(V, o, +c.getAttribute('data-case')); return; }
    if(e.target.closest('.at-plateau') && V.selCase){ remettreAuCarton(V); return; }
    if(e.target === V.ouvertEl){ fermerOuvert(V); }
  });

  /* --- la barre de Mimi (16 novembre) --- */
  ecoute(V, V.barreMimi, 'click', function(e){ var b = e.target.closest('[data-mimi]'); if(b) actionBarre(V, b.getAttribute('data-mimi')); });
  /* --- les grands panneaux : la cueillette, le grimoire, le chaudron, les potions, les analyses, le carton du coin --- */
  ecoute(V, V.grim, 'click', function(e){
    var b = e.target.closest('button');
    /* toucher le fond ferme le panneau ; mais pas le « clic » du doigt qui vient de l'ouvrir : au doigt, il arrive juste après,
       au même endroit, donc sur le fond si le panneau s'est ouvert par une bulle posée hors de la feuille (10 novembre) */
    if(e.target === V.grim){ if(Date.now() - (V.grimA || 0) > 450) fermerGrimoire(V); return; }
    if(!b) return;
    if(b.classList.contains('at-fermer')){ fermerGrimoire(V); son(V, 'clic'); return; }
    if(b.hasAttribute('data-achat')){ acheter(V, b.getAttribute('data-achat')); return; }      /* (la boutique de Mimi) */
    if(b.hasAttribute('data-peindre')){ peindrePanneau(V, b.getAttribute('data-peindre')); return; }
    if(b.hasAttribute('data-lire')){ lire(V, texteRecette(V, b.getAttribute('data-lire'))); return; }
    if(b.classList.contains('at-lire')){ lire(V, b.getAttribute('data-lu') || ''); return; }
    if(b.hasAttribute('data-dicter')){ ouvrirDictee(V, b.getAttribute('data-dicter'), +b.getAttribute('data-j')); guideRafraichir(V); return; }
    if(b.hasAttribute('data-dicte')){ choisirDictee(V, b.getAttribute('data-r'), +b.getAttribute('data-j'), b.getAttribute('data-dicte'), b); return; }
    if(b.classList.contains('at-dicte-x')){ var md = b.closest('.at-dicte'); if(md) md.remove(); guideRafraichir(V); return; }
    if(b.classList.contains('at-rpreparer')){ preparerDepuisLivre(V, b.getAttribute('data-r'), b); return; }
    if(b.classList.contains('at-ch-go')){ demarrer(V, b.getAttribute('data-r'), b); return; }
    if(b.hasAttribute('data-prendre')){
      choisirIngr(V, b.getAttribute('data-prendre')); dessinerArrivage(V);
      /* « où le ranger ? » arrive sous les jetons : sur un petit écran, on le fait monter en vue */
      var ou = V.grim.querySelector('.at-ou');
      if(ou && ou.scrollIntoView) try{ ou.scrollIntoView({block:'nearest', behavior:'smooth'}); }catch(er){ ou.scrollIntoView(false); }
      return;
    }
    if(b.hasAttribute('data-vers')){ var o = V.parId[b.getAttribute('data-vers')]; fermerGrimoire(V); if(o) ouvrir(V, o); return; }
    if(b.classList.contains('at-dans-piece')){ fermerGrimoire(V); majTient(V); montrerRangements(V); return; }
    if(b.hasAttribute('data-pot-voir')){ V.potSel = b.getAttribute('data-pot-voir'); son(V, 'clic'); dessinerPotions(V); return; }
    if(b.hasAttribute('data-res')){ sortirReserve(V, +b.getAttribute('data-res')); return; }
    if(b.hasAttribute('data-acc')){ habiller(V, b.getAttribute('data-acc'), b.getAttribute('data-slot')); return; }
    if(b.hasAttribute('data-peau')){ changerPeau(V, b.getAttribute('data-peau')); return; }
    /* data-act (donner-potion, vendre, analyser) : c'est le moteur qui s'en occupe (clic global) */
  });
  /* --- la bulle : son 🔊 lit l'explication (jamais toute seule) ; 🎨 repeint le chaudron --- */
  ecoute(V, V.toastEl, 'click', function(e){
    if(e.target.closest('.at-toast-lire') && V.toastLu){ lire(V, V.toastLu); prolongerToast(V, 6000); }
    if(e.target.closest('.at-toast-peindre') && V.parId.ch){ restyler(V, V.parId.ch); prolongerToast(V, 4000); }
  });
}

/* Toucher une chose fixe de la pièce */
function action(V, at, pot){
  if(V.mode !== 'ranger' || V.arrete) return;
  if(at === 'grimoire') ouvrirLivre(V);
  else if(at === 'chaudron') ouvrirChaudron(V);
  else if(at === 'potions') ouvrirPotions(V, pot);
  else if(at === 'arrivage') ouvrirArrivage(V);
  else if(at === 'analyses') ouvrirAnalyses(V);
  else if(at === 'pa-signe'){ if(V.parId.pa) bullesPaillasse(V, V.parId.pa); }   /* (le signe « À analyser ! » : comme toucher la paillasse) */
  else if(at === 'et-signe'){ if(V.parId.et) bullesPaillasse(V, V.parId.et); }
  else if(at === 'plantes-porte'){ var rp = V.o.rangerPlantes ? V.o.rangerPlantes() : null; if(rp){ son(V, 'clic'); toast(V, '<b>🌿</b> ' + esc(rp.t), 4600, rp.t); majFixes(V); } }   /* la botte devant la porte → la tringle de l'établi, s'il reste une place */   /* (le signe « À préparer ! » : comme toucher l'établi) */
  else if(at === 'plantes'){ if(V.parId.et) bullesPaillasse(V, V.parId.et); }
  else if(at === 'reserve') ouvrirReserve(V);
  else if(at === 'salle') changerSalle(V, 1 - V.salle);
  else if(at === 'flaque') nettoyerFlaque(V);
  else if(at === 'betise') reparerBetise(V, pot);
  else if(at === 'mimi') ouvrirBarre(V);              /* (16 novembre) la barre de Mimi */
  else if(at === 'photo') prendrePhoto(V);            /* l'appareil photo, à côté du 🐾 */
  else if(at === 'coffret') ouvrirCoffret(V);
  else if(at === 'jcarton') sortirCarton(V);
}
/* Un repère au bord de l'écran a été touché : la pièce glisse jusqu'à la chose */
function voir(V, cle){
  var F = cle === 'arrivage' ? cadreTas(V) : cle === 'analyses' ? cadreObjet(V, 'pa') : cle === 'grimoire' ? cadreObjet(V, 'lu') : cadreFlacons(V);
  if(F) allerVers(V, F.x, F.y - F.h / 2);
  son(V, 'clic');
}

/* ---------- Toucher un objet : son action ; la décoration change de style ---------- */
function toucherObjet(V, o, ev){
  var c = catDe(o), d = V.elO[o.id];
  if(V.mode !== 'ranger') return;
  if(o.t === 'chat'){ chatToucher(V, o); return; }
  if(BULLES_DE[c.special]){ bullesPaillasse(V, o); return; }      /* le chaudron, le lutrin, la paillasse : leurs trois bulles */
  if(c.cases){ ouvrir(V, o); return; }
  if(o.t === 'lampe'){ o.on = o.on === 0 ? 1 : 0; redessiner(V, o); son(V, 'clic'); changer(V); majLumiere(V); rebond(d); return; }
  /* les affaires du chat : d'abord leur action (remplir la gamelle) ; le tabouret renversé se relève */
  if(o.renverse){ relever(V, o); return; }
  if((o.t === 'gamelle' || o.t === 'eau') && !o.plein){ remplir(V, o); return; }
  if(o.t === 'litiere' && o.sale){ nettoyerLitiere(V, o); return; }
  if(o.t === 'cabane_chat' && o.dedans){ var cc = chatsTous(V).filter(function(x){ var s = V.chats[x.id]; return s && s.cabane === o.id; })[0]; if(cc){ cabaneSortir(V, cc, o); return; } }      /* (on frappe à sa porte : elle sort) */
  if(o.t === 'griffoir'){ var cg = chatsDe(V).filter(function(x){ var s = V.chats[x.id]; return s && !s.tenu && !s.depart && !s.caresse && !(V.jouet && V.jouet.o === x); })[0]; if(cg && (!V.griffT || Date.now() - V.griffT > 8000)){ V.griffT = Date.now(); var sg = chatEtat(V, cg); if(sg.anim) chatArreter(V, cg); if(sg.t){ clearTimeout(sg.t); sg.t = null; } chatGriffoir(V, cg, o); son(V, 'clic'); return; } }
  if(o.t === 'distributeur' && parDistributeur(V, o)) return;
  if(c.deco){ restyler(V, o); return; }
  son(V, 'clic');
  rebond(d);
}
function rebond(d){ if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.08 + ',' + d._s * 0.92 + ')', offset:0.35}, {transform:'scale(' + d._s + ')'}], {duration:320, easing:'ease-out'}); }
/* Le style suivant (forme et couleur) d'un objet ; un petit « pouf » d'étoiles */
function restyler(V, o, st){
  var c = catDe(o), d = V.elO[o.id];
  o.st = st === undefined ? ((o.st || 0) + 1) % nStyles(c) : st;
  o.neuf = 0;
  redessiner(V, o);
  if(d) anim(d, [{transform:'scale(' + d._s + ')', filter:'brightness(1.6)'}, {transform:'scale(' + d._s * 1.12 + ',' + d._s * 0.9 + ')', filter:'brightness(1.25)', offset:0.35}, {transform:'scale(' + d._s + ')', filter:'none'}], {duration:360, easing:'ease-out'});
  etincelles(V, o);
  son(V, 'clic');
  if(c.lumiere || o.t === 'bougies') majLumiere(V);
  if(c.special === 'analyses' || c.special === 'chaudron' || c.special === 'plantes') majFixes(V);
  changer(V);
}
function etincelles(V, o){
  var F = cadreObjet(V, o.id) || {x:600, y:600, w:0, h:0}, e = document.createElement('div');
  e.className = 'at-etinc';
  e.style.left = pX(V, F.x); e.style.top = pY(V, F.y - F.h * 0.55);
  e.innerHTML = '<i>✦</i><i>✧</i><i>✦</i><i>✧</i>';
  V.calque.appendChild(e);
  apres(V, 700, function(){ e.remove(); });
}
/* ---------- La paillasse : trois bulles (Romain, 10 novembre, 15 h 36) ----------
   On touche la paillasse : on n'entre pas tout de suite. Trois petites bulles se posent au-dessus d'elle, comme celles de la carte
   (même rebond, même petit bruit) : « 🔬 Analyser » (jaune : c'est elle qui lance), « Forme » et « 🎨 Couleur », qui changent
   la table tout de suite, une forme ou une couleur à la fois. On touche ailleurs : elles s'en vont. */
/* (10 novembre, 17 h 18, Romain : « les bulles forme et couleur, je les veux aussi sur le chaudron et le lutrin ».) Les trois meubles
   spéciaux ont donc les mêmes bulles : celle qui lance, jaune (« 🔬 Analyser », « 🍲 Préparer », « 📖 Lire »), puis « Forme » et « 🎨 Couleur ».
   BULLES_DE : pour chaque meuble spécial, la cible du tutoriel qui va avec, et sa bulle jaune. */
var BULLES_DE = {
  analyses:{cible:'paillasse', ic:'🔬', mot:'Analyser'},
  chaudron:{cible:'chaudron', ic:'🍲', mot:'Préparer'},
  grimoire:{cible:'grimoire', ic:'📖', mot:'Lire'},
  plantes:{cible:'etabli', ic:'🌿', mot:'Préparer'}   /* (enquête 3) l'établi des plantes */
};
/* Le tutoriel montre-t-il le meuble dont les bulles sont ouvertes (ou le meuble id) ? Alors ses bulles restent, et le rond va sur la jaune. */
function guideBulles(V, id){
  var o = V.parId[id || V.bullesPa], B = o && BULLES_DE[catDe(o).special];
  return !!(GUIDE && B && B.cible === GUIDE.cible);
}
function fermerBullesPa(V){
  var b = V.calque && V.calque.querySelector('.at-bulles-pa');
  if(b) b.remove();
  if(V.bullesT){ clearTimeout(V.bullesT); V.bullesT = 0; }
  if(!V.bullesPa) return;
  var g = guideBulles(V), pa = V.bullesPa === 'pa', et = V.bullesPa === 'et';
  V.bullesPa = null;
  if(pa) majSignePa(V);   /* (le signe « À analyser ! » revient) */
  if(et) majSigneEt(V);
  if(g) guidePlacer(V);
}
function placerBullesPa(V){
  var b = V.calque && V.calque.querySelector('.at-bulles-pa'), F = V.bullesPa && cadreObjet(V, V.bullesPa);
  if(!b || !F) return;
  b.style.left = pX(V, F.x); b.style.top = pY(V, F.y - F.h * 0.86); b.style.marginLeft = '0px'; b.style.marginTop = '0px';
  /* jamais coupées par le bord de la pièce : sur un téléphone couché, la paillasse touche le haut de l'écran, les bulles se posent alors sur elle */
  var r = b.getBoundingClientRect(), R0 = (V.piece || V.root).getBoundingClientRect(), dx = 0, dy = 0;
  if(r.left < R0.left + 6) dx = R0.left + 6 - r.left; else if(r.right > R0.right - 6) dx = R0.right - 6 - r.right;
  if(r.top < R0.top + 6) dy = R0.top + 6 - r.top;
  if(dx) b.style.marginLeft = dx.toFixed(1) + 'px';
  if(dy) b.style.marginTop = dy.toFixed(1) + 'px';
}
function veilleBullesPa(V){ if(V.bullesT) clearTimeout(V.bullesT); V.bullesT = apres(V, 9000, function(){ V.bullesT = 0; if(!guideBulles(V)) fermerBullesPa(V); }); }
function bullesPaillasse(V, o){
  var memes = V.bullesPa === o.id, B = BULLES_DE[catDe(o).special] || BULLES_DE.analyses;
  if(V.bullesPa){ fermerBullesPa(V); if(memes){ son(V, 'clic'); return; } }      /* (retoucher le même meuble : ses bulles s'en vont) */
  var b = document.createElement('div');
  b.className = 'at-bulles-pa';
  b.innerHTML = '<button type="button" class="at-bulle-pa at-bulle-go" data-bulle="aller" style="--i:0"><span aria-hidden="true">' + B.ic + '</span>' + B.mot + '</button>' +
    '<button type="button" class="at-bulle-pa" data-bulle="forme" style="--i:1" aria-label="Changer la forme"><svg viewBox="0 0 24 18" aria-hidden="true"><path d="M2,4 H22 V8 H2 Z M5,8 V16 M19,8 V16 M9,8 V11 H15 V8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>Forme</button>' +
    '<button type="button" class="at-bulle-pa" data-bulle="couleur" style="--i:2" aria-label="Changer la couleur"><span aria-hidden="true">🎨</span>Couleur</button>';
  V.calque.appendChild(b); V.bullesPa = o.id;
  if(o.id === 'pa') majSignePa(V);   /* (les bulles de la paillasse remplacent son signe) */
  if(o.id === 'et') majSigneEt(V);
  placerBullesPa(V); veilleBullesPa(V);
  try{ if(window.Brume && Brume.son) Brume.son('pastilles', 3); else son(V, 'clic'); }catch(e){}
  rebond(V.elO[o.id]);
  /* (le tutoriel : son rond passe du meuble à la bulle jaune, une fois qu'elle a fini de rebondir) */
  if(guideBulles(V)){ guidePlacer(V); apres(V, 620, function(){ if(V.bullesPa) guidePlacer(V); }); }
}
function bullePaillasse(V, quoi){
  var o = V.parId[V.bullesPa || 'pa'];
  if(!o) return;
  if(quoi && quoi.indexOf('nour:') === 0){ fermerBullesPa(V); if(o.t === 'gamelle' && !o.plein) remplir(V, o, quoi.slice(5)); return; }   /* (la gamelle de Mimi) */
  if(quoi === 'aller'){
    var sp = catDe(o).special;
    fermerBullesPa(V);
    if(sp === 'plantes'){ son(V, 'clic'); if(V.o.etabli){ try{ V.o.etabli(); }catch(e){ console.error(e); } } return; }   /* l'établi : la page des plantes (plantes.js) */
    if(sp === 'chaudron') ouvrirChaudron(V); else if(sp === 'grimoire') ouvrirLivre(V); else ouvrirAnalyses(V);
    return;
  }
  var nf = nfDe(catDe(o)), fo = formeDe(o), th = themeDe(o);
  restyler(V, o, quoi === 'forme' ? styleAvec(nf, (fo + 1) % nf, th) : styleAvec(nf, fo, (th + 1) % NT));
  placerBullesPa(V); veilleBullesPa(V);
}
/* Toucher un mur ou le plancher : un autre motif, une autre couleur */
function restylerSurface(V, cle){
  if(!DECO_NF[cle] || V.mode !== 'ranger') return;
  V.etat.deco[cle] = ((V.etat.deco[cle] || 0) + 1) % (DECO_NF[cle] * NT);
  majFond(V);
  son(V, 'clic');
  changer(V);
}
function majFond(V){ V.fondEl.innerHTML = svgFond(V) + fondAnime(V); }
/* 🎨 dans un panneau : le lutrin ou le chaudron change de style (et la petite image du panneau aussi).
   (La paillasse n'a plus de 🎨 dans son panneau : sa forme et sa couleur se changent par ses bulles, bullesPaillasse.) */
function peindrePanneau(V, cle){
  if(V.parId[cle]) restyler(V, V.parId[cle]);
  var im = V.grim.querySelector('.at-f-apercu');
  if(im) im.innerHTML = apercuPanneau(V, cle);
}
function apercuPanneau(V, cle){
  var o = V.parId[cle];
  return o ? svgObjet({t:o.t, st:o.st, v:o.v}) : '';
}
/* (Plus de 🎨 dans les panneaux du lutrin et du chaudron, 10 novembre : la forme et la couleur se changent par les bulles du meuble.
   Il reste la petite image du meuble, dans l'en-tête.) */
function boutonPeindre(V, cle){
  return '<span class="at-f-apercu" aria-hidden="true">' + apercuPanneau(V, cle) + '</span>';
}

/* ---------- Déplacer un meuble : appuyer, garder le doigt, puis glisser ----------
   Un glisser tout de suite fait défiler la pièce (téléphone) ; sur un grand écran (rien à faire défiler), il déplace aussi le meuble. */
function prendreObjet(V, e, o){
  var d = V.elO[o.id];
  if(!d) return;
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, pan0 = {x:V.pan.x, y:V.pan.y}, etat = 'attente', g = null, glissable = V.root.classList.contains('at-glissable');
  /* le chat : le doigt qui glisse sur lui le caresse (il ronronne) ; s'il sort du chat, la pièce défile (ou, sur un grand écran, on le déplace) */
  var chat = o.t === 'chat', car = {l:0, n:0, x:x0, y:y0};
  var scelle = !!catDe(o).fixe;      /* (23 novembre) le chaudron du foyer : on le touche (ses bulles), on ne le soulève jamais */
  function surChat(ev){ var r = d.getBoundingClientRect(), mx = r.width * 0.25 + 12, my = r.height * 0.25 + 12; return ev.clientX > r.left - mx && ev.clientX < r.right + mx && ev.clientY > r.top - my && ev.clientY < r.bottom + my; }
  /* le doigt est-il parti pour de bon ? (à plus d'un bon bout de doigt de son pelage : le pantin sait où elle est vraiment) */
  /* (dix fois par seconde au plus : c'est une mesure qui coûte, et le doigt bouge bien plus souvent — « sans que ça rame ») */
  var loinT = 0;
  function loinChat(ev){ var now = Date.now(); if(now - loinT < 90) return false; loinT = now; var r = pantinDe(V, o), ec = r ? r.ecart(ev.clientX, ev.clientY) : null; return ec === null ? !surChat(ev) : ec > PORTER_LOIN; }
  d.classList.add('at-appui');
  function lever(ev){
    etat = 'glisse';
    d.classList.remove('at-appui');
    g = debutGlisseObjet(V, e, o);
    if(ev) g.move(ev);
  }
  /* (16 novembre) le doigt qu'on laisse sur elle la gratte (tête, dos, ventre, queue : caresseDebut) : il ne la soulève pas.
     (17 novembre, Romain : « elle demande qu'on la porte vers son panier. Mais on ne peut plus la porter. ») Le doigt posé sur elle
     qui s'en va pour de bon (à plus d'un bout de doigt de son pelage : PORTER_LOIN) l'emmène : on la porte, on la lâche où on veut (chatPortable, chatPortee). */
  var tm = apres(V, TENIR, function(){
    if(etat !== 'attente') return;
    if(chat){ etat = 'caresse'; d.classList.remove('at-appui'); caresseDebut(V, o, e); return; }
    if(scelle) return;      /* (le doigt qui reste dessus : rien ; quand il se lève, c'est un toucher) */
    vibrer(12); lever(null);
  });
  function mv(ev){
    if(ev.pointerId !== id) return;
    var dx = ev.clientX - x0, dy = ev.clientY - y0;
    if(etat === 'attente' && dx * dx + dy * dy >= SEUIL_GESTE * SEUIL_GESTE){
      clearTimeout(tm);
      if(chat && surChat(ev)){ etat = 'caresse'; d.classList.remove('at-appui'); car.x = ev.clientX; car.y = ev.clientY; caresseDebut(V, o, ev); }
      else if(glissable){ etat = 'defile'; d.classList.remove('at-appui'); V.root.classList.add('at-defile'); }
      else if(scelle || (chat && !chatPortable(V, o))){ etat = 'rien'; d.classList.remove('at-appui'); }
      else lever(ev);
    }
    if(etat === 'caresse'){
      /* le doigt s'en va pour de bon : les caresses s'arrêtent et on l'emmène — sauf si c'est ELLE qui est partie (« Pas la queue ! »,
         le bond hors du bain alors qu'on frotte encore : ce serait la rattraper en plein saut), ou si elle est occupée ailleurs */
      /* (sorti de sa zone de caresses, il est forcément loin : pas besoin de mesurer — un doigt rapide passe de « sur elle » à
         « dehors » entre deux mesures, et elle restait par terre : vu par le robot, au téléphone) */
      var dedans = surChat(ev);
      if((!dedans || loinChat(ev)) && chatPortable(V, o, true)){ caresseFin(V, o); lever(ev); return; }
      if(dedans){
        var dl = Math.hypot(ev.clientX - car.x, ev.clientY - car.y); car.x = ev.clientX; car.y = ev.clientY;
        caresseBouge(V, o, ev, dl);
        return;
      }
      /* le doigt sort du chat : les caresses s'arrêtent */
      caresseFin(V, o);
      if(glissable){ etat = 'defile'; pan0 = {x:V.pan.x + dx, y:V.pan.y + dy}; V.root.classList.add('at-defile'); }
      else etat = 'rien';
    }
    if(etat === 'defile'){ panA(V, pan0.x - dx, pan0.y - dy); chasseDoigt(V, ev); }      /* (le chat suit le doigt qui glisse) */
    else if(etat === 'glisse' && g) g.move(ev);
  }
  function up(ev){
    if(ev.pointerId !== id) return;
    fin();
    clearTimeout(tm);
    d.classList.remove('at-appui');
    var annule = ev.type === 'pointercancel', dx = ev.clientX - x0, dy = ev.clientY - y0;
    /* tablette lente : le minuteur a soulevé le meuble alors que le doigt était déjà levé (avant le quart de seconde) → c'était un toucher */
    if(etat === 'glisse' && g && !annule && dx * dx + dy * dy < SEUIL_GESTE * SEUIL_GESTE && ev.timeStamp - e.timeStamp < TENIR
       && Math.abs(V.pan.x - pan0.x) + Math.abs(V.pan.y - pan0.y) < 1){ g.up(ev, true); etat = 'attente'; }
    if(etat === 'attente'){ if(!annule) toucherObjet(V, o, ev); }
    else if(etat === 'caresse'){ caresseFin(V, o); }
    else if(etat === 'defile'){ V.root.classList.remove('at-defile'); chasseFin(V); }
    else if(g) g.up(ev, annule);
  }
  function fin(){
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    V.suivis = V.suivis.filter(function(f){ return f !== fin; });
  }
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
/* Peut-on le ranger dans le carton du coin ? (la décoration ; un rangement vide aussi) */
function rangeable(o){
  var c = catDe(o);
  if(o.t === 'chat' || c.special) return false;
  if(c.cases) return (o.cases || []).every(function(cs){ return !somme(cs.i); });
  return true;
}
function surReserve(V, ev){
  if(!V.elReserve) return false;
  var r = V.elReserve.getBoundingClientRect();
  return ev.clientX > r.left - 10 && ev.clientX < r.right + 10 && ev.clientY > r.top - 10 && ev.clientY < r.bottom + 10;
}
/* Au-dessus du bouton de l'autre pièce (en bas à gauche) ou de l'arche : l'objet lâché passe dans l'autre pièce */
function surSalle(V, ev){
  var l = [V.elSalle, q(V, '.at-arche')];
  return l.some(function(el){
    if(!el) return false;
    var r = el.getBoundingClientRect(), m = el === V.elSalle ? 10 : 0;
    return r.width > 0 && ev.clientX > r.left - m && ev.clientX < r.right + m && ev.clientY > r.top - m && ev.clientY < r.bottom + m;
  });
}
function debutGlisseObjet(V, e, o){
  var d = V.elO[o.id], chat = o.t === 'chat', range = rangeable(o);
  var enf = enfantsDe(V, o), els = [d].concat(enf.map(function(c){ return V.elO[c.id]; }).filter(Boolean));
  var p0 = chat ? chatPos(V, o) : posObj(V, o), pan0 = {x:V.pan.x, y:V.pan.y}, dernier = null, auBord = 0;
  function decal(ev){ return {dx:ev.clientX - e.clientX + (V.pan.x - pan0.x), dy:ev.clientY - e.clientY + (V.pan.y - pan0.y)}; }
  function poser(ev){ var m = decal(ev); els.forEach(function(x){ x.style.setProperty('--dx', m.dx + 'px'); x.style.setProperty('--dy', m.dy + 'px'); }); }
  function bords(){
    if(!dernier) return;
    var r = V.piece.getBoundingClientRect(), m = 44, vx = 0, vy = 0;
    if(dernier.clientX < r.left + m) vx = -12; else if(dernier.clientX > r.right - m) vx = 12;
    if(dernier.clientY < r.top + m) vy = -12; else if(dernier.clientY > r.bottom - m) vy = 12;
    /* on reste un peu au bord avant que la pièce défile : on peut lâcher sur une chose près du bord sans qu'elle s'en aille */
    /* (au-dessus du carton 📦 : la pièce ne bouge pas, on peut y lâcher l'objet tranquillement) */
    if((range && surReserve(V, dernier)) || surSalle(V, dernier)){ vx = 0; vy = 0; }
    if(vx || vy){ if(!auBord) auBord = Date.now(); if(Date.now() - auBord > 280){ panPar(V, vx, vy); poser(dernier); } }
    else auBord = 0;
  }
  if(chat){ chatSaisi(V, o); chatPortee(V, o); }
  els.forEach(function(x){ x.classList.add('at-leve'); });
  d.style.zIndex = 99000;
  enf.forEach(function(c, i){ var x = V.elO[c.id]; if(x) x.style.zIndex = 99001 + i; });
  son(V, 'clic');
  V.glisse = true;
  if(range && V.elReserve) V.elReserve.classList.add('at-cible-ok');
  if(V.elSalle) V.elSalle.classList.add('at-cible-ok');
  if(V.root.classList.contains('at-glissable')) V.defile = setInterval(bords, 40);
  return {
    move:function(ev){
      dernier = ev; poser(ev);
      if(range && V.elReserve) V.elReserve.classList.toggle('at-survol', surReserve(V, ev));
      var ss = surSalle(V, ev);
      if(V.elSalle) V.elSalle.classList.toggle('at-survol', ss);
      V.root.classList.toggle('at-arche-survol', ss);
    },
    up:function(ev, annule){
      if(V.defile){ clearInterval(V.defile); V.defile = null; }
      V.glisse = false;
      if(V.elReserve){ V.elReserve.classList.remove('at-cible-ok'); V.elReserve.classList.remove('at-survol'); }
      if(V.elSalle){ V.elSalle.classList.remove('at-cible-ok'); V.elSalle.classList.remove('at-survol'); }
      V.root.classList.remove('at-arche-survol');
      els.forEach(function(x){ x.classList.remove('at-leve'); });
      if(!annule && range && surReserve(V, ev)){ rangerDansReserve(V, o); if(chat) chatLache(V, o); return; }
      if(!annule && surSalle(V, ev)){
        els.forEach(function(x){ x.style.removeProperty('--dx'); x.style.removeProperty('--dy'); });
        if(chat){ var stc = chatEtat(V, o); stc.pos = null; stc.tenu = false; }
        envoyerSalle(V, o);
        return;
      }
      var m = decal(ev), nx = p0.x + m.dx / V.k, ny = p0.y + m.dy / V.k;
      var avant = {};
      [o].concat(enf).forEach(function(c){ var pc = posObj(V, c); avant[c.id] = {x:pc.x + m.dx / V.k, y:pc.y + m.dy / V.k, s:pc.s}; });
      var coteAvant = o.cote || 0;
      if(!annule) resoudre(V, o, nx, ny);
      o.neuf = 0;
      els.forEach(function(x){ x.style.removeProperty('--dx'); x.style.removeProperty('--dy'); });
      d.classList.remove('at-neuf');
      if((o.cote || 0) !== coteAvant){
        /* contre un mur de côté (ou décollé du mur) : il se dessine de profil (ou de face) ; ce qui était posé dessus descend par terre */
        redessiner(V, o);
        enf.forEach(function(c){ var pc = avant[c.id]; c.sur = null; resoudre(V, c, pc.x, Math.max(pc.y + 60, SOL_MIN + 40)); });
        if(o.cote){ var tc = 'Contre le mur, de profil : il prend moins de place.'; toast(V, '<b>↔️ 🧱</b> ' + esc(tc), 2600, tc); }
      }
      [o].concat(enf).forEach(function(c){
        placerEl(V, c);
        var x = V.elO[c.id], a = avant[c.id], pn = posObj(V, c);
        if(!x || !a) return;
        var tx = (a.x - pn.x) * V.k, ty = (a.y - pn.y) * V.k, chute = ty < -50 * V.k;
        anim(x, chute ?
          [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + a.s + ')'}, {transform:'translate(0,0) scale(' + pn.s * 1.05 + ',' + pn.s * 0.9 + ')', offset:0.8}, {transform:'translate(0,0) scale(' + pn.s + ')'}] :
          [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + a.s + ')'}, {transform:'translate(0,0) scale(' + pn.s + ')'}],
          {duration:chute ? 420 : 260, easing:chute ? 'ease-in' : 'cubic-bezier(.3,1.5,.5,1)'});
      });
      son(V, 'pas');
      poussiere(V, o);
      if(chat) chatLache(V, o);
      chatsDe(V).forEach(function(c){ if(c !== o) placerEl(V, c); });   /* un chat assis sur ce meuble suit le meuble */
      if(catDe(o).special === 'chaudron' && V.etat.flaque) majFlaque(V);
      majLumiere(V);
      majReperes(V);
      changer(V);
    }
  };
}
/* Un petit « +3 🫐 » qui s'envole au-dessus d'un objet */
function flotter(V, o, txt){
  var F = cadreObjet(V, o.id) || {x:600, y:600, w:0, h:0}, d = document.createElement('div');
  d.className = 'at-flotte';
  d.textContent = txt;
  d.style.left = pX(V, F.x);
  d.style.top = pY(V, F.y - F.h * 0.8);
  V.calque.appendChild(d);
  apres(V, 1000, function(){ d.remove(); });
}
/* Petit nuage de poussière quand un meuble se pose */
function poussiere(V, o){
  var F = cadreObjet(V, o.id) || {x:600, y:600, w:100, h:0}, d = document.createElement('div');
  d.className = 'at-pouf';
  d.style.left = pX(V, F.x);
  d.style.top = pY(V, F.y);
  d.style.width = pW(V, F.w * 1.05);
  d.innerHTML = '<i></i><i></i><i></i><i></i>';
  V.calque.appendChild(d);
  apres(V, 700, function(){ d.remove(); });
}
function secouer(d){
  if(d) anim(d, [{transform:'translateX(0) scale(' + d._s + ')'}, {transform:'translateX(-6px) scale(' + d._s + ')'}, {transform:'translateX(6px) scale(' + d._s + ')'}, {transform:'translateX(0) scale(' + d._s + ')'}], {duration:300});
}
function nettoyerFlaque(V){
  V.etat.flaque = 0;
  var f = q(V, '.at-flaque');
  son(V, 'magie');
  if(f){ anim(f, [{opacity:1, transform:'scale(1)'}, {opacity:0, transform:'scale(.3)'}], {duration:500, fill:'forwards'}); apres(V, 520, function(){ f.remove(); }); }
  changer(V);
}

/* ---------- Le carton de rangement (l'icône 📦, en bas à droite de l'écran) ---------- */
function rangerDansReserve(V, o){
  var d = V.elO[o.id], enf = enfantsDe(V, o);
  enf.forEach(function(c){ var pc = posObj(V, c); c.sur = null; resoudre(V, c, pc.x, Math.max(pc.y + 60, SOL_MIN + 40)); placerEl(V, c); });
  V.etat.objets = V.etat.objets.filter(function(x){ return x !== o; });
  delete V.parId[o.id]; delete V.elO[o.id];
  var item = {id:o.id, t:o.t, st:o.st || 0, v:o.v || 0};
  if(o.on !== undefined) item.on = o.on;
  if(o.cases) item.cases = o.cases;
  V.etat.reserve.push(item);
  if(d){
    var r = V.elReserve.getBoundingClientRect(), rd = d.getBoundingClientRect();
    anim(d, [{transform:'scale(' + d._s + ')', opacity:1}, {transform:'translate(' + (r.left + r.width / 2 - rd.left - rd.width / 2) + 'px,' + (r.top + r.height * 0.3 - rd.top - rd.height / 2) + 'px) scale(' + d._s * 0.15 + ')', opacity:0.2}], {duration:380, easing:'ease-in', fill:'forwards'});
    apres(V, 400, function(){ d.remove(); });
  }
  if(o.t === 'lampe') majLumiere(V);
  apres(V, 380, function(){ majFixes(V); anim(V.elReserve, [{transform:'scale(1)'}, {transform:'scale(1.08,.92)', offset:0.4}, {transform:'scale(1)'}], {duration:300}); });
  son(V, 'porte');
  toast(V, '<b>🧸 ➡️ 📦</b> Rangé dans le carton', 2600, 'Rangé dans le carton.');
  majLumiere(V);
  changer(V);
}
function ouvrirReserve(V){
  ouvrirCalque(V, 'at-cal-reserve', '<div></div>');
  dessinerReserve(V);
  son(V, 'porte');
}
function dessinerReserve(V){
  var l = V.etat.reserve, corps;
  if(!l.length){
    var tv = 'Le carton est vide. Pour y ranger une décoration, garde le doigt dessus, puis glisse-la jusqu\'au carton.';
    corps = '<p class="at-feuille-txt">' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  } else {
    var tr = 'Touche un objet pour l\'installer dans la pièce, un par un.';
    corps = '<p class="at-feuille-txt">' + esc(tr) + ' ' + lireBtn(tr) + '</p><div class="at-res-liste">' + l.map(function(x, i){
      return '<button type="button" class="at-res-o" data-res="' + i + '"><span class="at-res-ic">' + svgObjet({t:x.t, st:x.st, v:x.v, on:x.on, cases:x.cases}) + '</span><b>' + esc(catDe(x).nom) + '</b></button>';
    }).join('') + '</div>';
  }
  V.grim.innerHTML = feuille('at-f-reserve', '<span class="at-f-ic">🧸</span><h3>Le carton de rangement</h3>', corps);
}
function sortirReserve(V, i){
  var x = V.etat.reserve[i];
  if(!x) return;
  V.etat.reserve.splice(i, 1);
  var o = {id:x.id || ('o' + (++V.etat.n)), t:x.t, x:600, y:700, f:0, v:x.v || 0, st:x.st || 0, sur:null, neuf:1};
  if(V.parId[o.id]) o.id = 'o' + (++V.etat.n);
  if(x.on !== undefined) o.on = x.on;
  if(x.cases) o.cases = x.cases;
  else if(catDe(o).cases) o.cases = catDe(o).cases.map(function(){ return {e:[], i:{}}; });   /* (un meuble rangé sans ses cases : on les lui rend) */
  if(V.salle) o.pc = 1;
  trouverPlace(V, o);
  V.etat.objets.push(o);
  V.parId[o.id] = o;
  var d = elObjet(V, o);
  V.scene.appendChild(d);
  placerEl(V, o);
  fermerGrimoire(V);
  var p = posObj(V, o), F = cadreObjet(V, o.id);
  allerVers(V, F ? F.x : p.x, F ? F.y - F.h / 2 : p.y);
  anim(d, [{transform:'scale(' + p.s * 0.2 + ')', opacity:0}, {transform:'scale(' + p.s * 1.12 + ')', opacity:1, offset:0.6}, {transform:'scale(' + p.s + ')'}], {duration:520, easing:'ease-out'});
  majFixes(V);
  majLumiere(V);
  son(V, 'gain');
  changer(V);
}

/* ---------- Ouvrir un carton de meubles : tout va dans le carton du coin 📦 (plus bas, ouvrirCarton) ---------- */
/* (Romain, 5 novembre, 15 h 10) Toucher un carton le vide d'un coup : tout ce qu'il contient file dans le carton de rangement 📦
   du coin (une petite animation par objet, le compteur du 📦 monte à chaque arrivée) ; la pièce reste rangée. On pose ensuite
   les objets soi-même, un par un, en touchant le 📦. Seul ce qui ne se range pas (le chat) s'installe tout de suite dans la pièce.
   (Le grimoire, le chaudron et la table d'analyse sont déjà dans l'atelier : ils ne sont dans aucun carton.) */
function poserDuCarton(V, o, ke){
  trouverPlace(V, o);
  V.etat.objets.push(o);
  V.parId[o.id] = o;
  var d = elObjet(V, o);
  V.scene.appendChild(d);
  placerEl(V, o);
  var p = posObj(V, o), dx = (ke._p[0] - p.x) * V.k, dy = (ke._p[1] - ke._t[1] * ke._s * 0.6 - p.y) * V.k;
  anim(d, [
    {transform:'translate(' + dx + 'px,' + dy + 'px) scale(' + p.s * 0.15 + ')', opacity:0},
    {transform:'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 150 * V.k) + 'px) scale(' + p.s * 1.12 + ')', opacity:1, offset:0.5},
    {transform:'translate(0,0) scale(' + p.s * 1.08 + ',' + p.s * 0.9 + ')', offset:0.85},
    {transform:'translate(0,0) scale(' + p.s + ')'}
  ], {duration:720, easing:'ease-out'});
  if(o.t === 'chat') chatsDemarrer(V);
}
/* Un objet qui vole du carton ouvert jusqu'au 📦 du coin ; à l'arrivée, le compteur monte d'un (V.enVol : ceux encore en l'air) */
function volerVersReserve(V, ke, o, n){
  var fin = function(){ V.enVol = Math.max(0, (V.enVol || 0) - 1); majFixes(V); if(V.elReserve) anim(V.elReserve, [{transform:'scale(1)'}, {transform:'scale(1.18,.86)', offset:0.4}, {transform:'scale(1)'}], {duration:300}); son(V, 'clic'); };
  var cible = V.elReserve, rr = V.root && V.root.getBoundingClientRect();
  if(!cible || !rr || !rr.width){ apres(V, 60 + 170 * n, fin); return; }
  var a = ke.getBoundingClientRect(), b = cible.getBoundingClientRect();
  var x0 = a.left + a.width / 2 - rr.left, y0 = a.top + a.height * 0.35 - rr.top, x1 = b.left + b.width / 2 - rr.left, y1 = b.top + b.height / 2 - rr.top;
  var f = document.createElement('div');
  f.className = 'at-vol'; f.setAttribute('aria-hidden', 'true');
  f.innerHTML = svgObjet({t:o.t, st:o.st, v:o.v, on:o.on, cases:o.cases});
  f.style.left = x0 + 'px'; f.style.top = y0 + 'px';
  V.root.appendChild(f);
  var dx = x1 - x0, dy = y1 - y0;
  var an = anim(f, [
    {transform:'translate(-50%,-50%) scale(.3)', opacity:0},
    {transform:'translate(calc(-50% + ' + dx * 0.25 + 'px), calc(-50% + ' + (dy * 0.25 - 120) + 'px)) scale(1.05)', opacity:1, offset:0.35},
    {transform:'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.35)', opacity:.9}
  ], {duration:760, delay:170 * n, easing:'ease-in', fill:'both'});
  var fait = false, fini = function(){ if(fait) return; fait = true; f.remove(); if(!V.arrete) fin(); };
  if(an){ an.onfinish = fini; an.oncancel = fini; } else apres(V, 60 + 170 * n, fini);
}
function ouvrirCarton(V, kid){
  var k = V.etat.cartons.filter(function(x){ return x.id === kid; })[0], ke = V.elK[kid];
  if(!k || !ke || !k.reste.length) return;
  if(!k.ouvert){ k.ouvert = 1; ke.classList.add('at-ouvert-c'); }
  anim(ke, [{transform:'scale(' + ke._s + ')'}, {transform:'scale(' + ke._s * 1.1 + ',' + ke._s * 0.86 + ')', offset:0.3}, {transform:'scale(' + ke._s * 0.96 + ',' + ke._s * 1.06 + ')', offset:0.6}, {transform:'scale(' + ke._s + ')'}], {duration:380});
  var liste = k.reste.splice(0, k.reste.length), n = 0;
  liste.forEach(function(t){
    if(k.t === 'colis' && V.etat.boutique.indexOf(t) < 0) V.etat.boutique.push(t);
    var o = creerObjet(V, t);
    if(k.ch) o.pc = 1;
    if(!rangeable(o)){ poserDuCarton(V, o, ke); return; }
    var item = {id:o.id, t:o.t, st:o.st || 0, v:o.v || 0};
    if(o.on !== undefined) item.on = o.on;
    if(o.cases) item.cases = o.cases;
    V.etat.reserve.push(item);
    V.enVol = (V.enVol || 0) + 1;
    volerVersReserve(V, ke, o, n++);
  });
  son(V, 'gain');
  majFixes(V);
  if(n){ var tp = 'Tout est dans le carton 📦, en bas à droite : touche-le pour installer tes objets, un par un.'; apres(V, 700 + 170 * n, function(){ toast(V, '<b>📦 ' + n + '</b> ' + esc(tp), 4200, tp); }); }
  V.etat.cartons = V.etat.cartons.filter(function(x){ return x !== k; });
  delete V.elK[kid];
  anim(ke, [{transform:'scale(' + ke._s + ')', opacity:1}, {transform:'scale(' + ke._s * 1.2 + ',' + ke._s * 0.2 + ')', opacity:0}], {duration:450, delay:250, fill:'forwards', easing:'ease-in'});
  apres(V, 720, function(){
    ke.remove();
    V.etat.cartons.forEach(function(x, i){
      var e2 = V.elK[x.id];
      if(!e2) return;
      var n2 = elCarton(V, x, i);
      e2.replaceWith(n2);
    });
  });
  majIndiceCarton(V);
  majLumiere(V);
  changer(V);
}

/* ==========================================================
   Ranger : la cueillette (par terre devant la porte) → les rangements
   - on glisse un tas jusqu'à un rangement de la pièce (dans un tiroir, un bocal…) ;
   - ou on le touche : « où le ranger ? », puis le gros plan.
   ========================================================== */
var TXT_RANGER = 'Glisse un ingrédient jusqu\'à un rangement, ou touche-le puis touche un tiroir, un placard ou un bocal : il va dedans. ' +
  'Les liquides, comme l\'eau, vont dans les bocaux et les fioles. Les choses sèches vont dans les tiroirs et les placards.';
/* Un rangement de la pièce sous le doigt (et sa case, si on vise un tiroir ou un bocal précis) */
function cibleRangement(V, x, y){
  var el = document.elementFromPoint(x, y);
  if(!el || !V.root.contains(el)) return null;
  var od = el.closest('.at-o');
  if(!od) return null;
  var o = V.parId[od.getAttribute('data-obj')];
  if(!o || !catDe(o).cases) return null;
  var gc = el.closest('[data-case]');
  return {o:o, ci:gc ? +gc.getAttribute('data-case') : 0, el:od};
}
function glisserTas(V, e, k, el){
  var n = V.etat.panier[k] || 0;
  if(!n) return;
  var g = null, rr = V.root.getBoundingClientRect(), survol = null, dernier = null, auBord = 0;
  function pose(ev){ if(g) g.style.transform = 'translate(' + (ev.clientX - rr.left) + 'px,' + (ev.clientY - rr.top) + 'px)'; }
  function bords(){
    if(!dernier) return;
    var r = V.piece.getBoundingClientRect(), m = 44, vx = 0, vy = 0;
    if(dernier.clientX < r.left + m) vx = -12; else if(dernier.clientX > r.right - m) vx = 12;
    if(dernier.clientY < r.top + m) vy = -12; else if(dernier.clientY > r.bottom - m) vy = 12;
    if(vx || vy){ if(!auBord) auBord = Date.now(); if(Date.now() - auBord > 280) panPar(V, vx, vy); }
    else auBord = 0;
  }
  suivre(V, e, {
    debut:function(ev){
      g = fantome(V, k, n);
      pose(ev);
      el.classList.add('at-pris');
      V.glisse = true;
      V.avaitCarton = true;
      majCiblesSel(V, k);
      son(V, 'clic');
      if(V.root.classList.contains('at-glissable')) V.defile = setInterval(bords, 40);
    },
    move:function(ev){
      dernier = ev;
      pose(ev);
      var c = cibleRangement(V, ev.clientX, ev.clientY), cel = c ? c.el : null;
      if(cel !== survol){ if(survol) survol.classList.remove('at-survol'); survol = cel; if(survol) survol.classList.add('at-survol'); }
    },
    up:function(ev, bouge, annule){
      V.glisse = false;
      if(V.defile){ clearInterval(V.defile); V.defile = null; }
      if(survol) survol.classList.remove('at-survol');
      el.classList.remove('at-pris');
      majCiblesSel(V);
      if(!bouge){ if(!annule) ouvrirArrivage(V, k); return; }
      var c = annule ? null : cibleRangement(V, ev.clientX, ev.clientY);
      if(g) g.remove();
      if(!c) return;
      var mis = rangerDans(V, {de:'panier', ingr:k}, V.etat.panier[k] || 0, c.o, c.ci);
      apresRangement(V);
      if(mis) flotter(V, c.o, '+' + mis + ' ' + icIngr(k));
    }
  });
}
function fantome(V, ingr, n){
  var g = document.createElement('div');
  g.className = 'at-fantome';
  g.style.setProperty('--c', coulIngr(ingr));
  g.innerHTML = '<span>' + icIngr(ingr) + '</span>' + (n > 1 ? '<b>×' + n + '</b>' : '');
  V.fantomes.appendChild(g);
  return g;
}
function cibleSous(V, x, y){
  var el = document.elementFromPoint(x, y);
  if(!el || !V.root.contains(el)) return null;
  var t = el.closest('[data-cible]');
  if(!t) return null;
  var ty = t.getAttribute('data-cible');
  if(ty === 'case') return {t:'case', o:t.getAttribute('data-obj'), ci:+t.getAttribute('data-case'), el:t};
  return {t:ty, el:t};
}
function dispo(V, src){
  if(src.de === 'panier') return V.etat.panier[src.ingr] || 0;
  var o = V.parId[src.o];
  return o ? ((o.cases[src.ci] || {i:{}}).i[src.ingr] || 0) : 0;
}
function prendre(V, src, n){
  if(src.de === 'panier'){ V.etat.panier[src.ingr] -= n; if(V.etat.panier[src.ingr] <= 0) delete V.etat.panier[src.ingr]; return; }
  var cs = V.parId[src.o].cases[src.ci];
  cs.i[src.ingr] -= n;
  if(cs.i[src.ingr] <= 0) delete cs.i[src.ingr];
}
/* Un jeton du gros plan : on le touche (choisir) ou on le fait glisser vers une case (ranger) */
function glisserIngr(V, e, src, surToucher){
  var n = dispo(V, src);
  if(n <= 0) return;
  var g = null, rr = V.root.getBoundingClientRect(), survol = null;
  function pose(ev){ if(g) g.style.transform = 'translate(' + (ev.clientX - rr.left) + 'px,' + (ev.clientY - rr.top) + 'px)'; }
  suivre(V, e, {
    debut:function(ev){
      g = fantome(V, src.ingr, n);
      pose(ev);
      if(src.el) src.el.classList.add('at-pris');
      V.glisse = true;
      majCasesOk(V, src.ingr);
      son(V, 'clic');
    },
    move:function(ev){
      pose(ev);
      var c = cibleSous(V, ev.clientX, ev.clientY), el = c ? c.el : null;
      if(el !== survol){ if(survol) survol.classList.remove('at-survol'); survol = el; if(survol) survol.classList.add('at-survol'); }
    },
    up:function(ev, bouge, annule){
      V.glisse = false;
      if(survol) survol.classList.remove('at-survol');
      if(src.el) src.el.classList.remove('at-pris');
      if(!bouge){ if(!annule && surToucher) surToucher(); return; }
      var c = annule ? null : cibleSous(V, ev.clientX, ev.clientY);
      if(g) g.remove();
      if(!c){ dessinerOuvert(V); return; }
      if(c.t === 'panier' && src.de === 'case'){ V.selCase = {o:src.o, ci:src.ci, ingr:src.ingr}; remettreAuCarton(V); return; }
      if(c.t === 'case'){
        var o = V.parId[c.o];
        if(o && !(src.de === 'case' && src.o === c.o && src.ci === c.ci)) rangerDans(V, src, n, o, c.ci);
      }
      apresRangement(V);
    }
  });
}
/* Choisir un ingrédient du carton (dans le carton, ou dans le plateau du gros plan) */
function choisirIngr(V, k){
  V.selCase = null;
  V.sel = V.sel === k ? null : k;
  son(V, 'clic');
  if(V.ouvert) dessinerOuvert(V);
  majTient(V);
}
function lacher(V){ V.sel = null; V.selCase = null; majTient(V); if(V.ouvert) dessinerOuvert(V); son(V, 'clic'); }
/* Choisir un ingrédient déjà rangé (pour le déplacer ou le remettre dans le carton) */
function choisirDansCase(V, oid, ci, k){
  if(V.sel){ toucherCase(V, V.parId[oid], ci); return; }
  var s = V.selCase;
  V.selCase = (s && s.o === oid && s.ci === ci && s.ingr === k) ? null : {o:oid, ci:ci, ingr:k};
  son(V, 'clic');
  dessinerOuvert(V);
}
/* Toucher une case du gros plan : y ranger ce qu'on tient, ou y déplacer ce qu'on a pris ailleurs */
function toucherCase(V, o, ci){
  if(!o) return;
  if(V.ouvert && V.ouvert.etq){ if(V.etqSel) collerEtiquette(V, o, ci, V.etqSel); return; }
  if(V.sel){ rangerDans(V, {de:'panier', ingr:V.sel}, V.etat.panier[V.sel] || 0, o, ci); apresRangement(V); return; }
  if(V.selCase){
    var s = V.selCase;
    if(s.o === o.id && s.ci === ci){ V.selCase = null; dessinerOuvert(V); return; }
    var src = {de:'case', o:s.o, ci:s.ci, ingr:s.ingr}, n = dispo(V, src);
    var mis = rangerDans(V, src, n, o, ci);
    if(mis) V.selCase = null;
    apresRangement(V);
    return;
  }
  var cs = o.cases[ci];
  if(!somme(cs.i)){
    var t = somme(V.etat.panier) ? 'Touche un ingrédient en bas, puis touche ce ' + motCase(o) + ' : il va dedans.' : 'Ce ' + motCase(o) + ' est vide. Ce que tu cueilles est posé par terre, devant la porte.';
    toast(V, '<b>👆</b> ' + esc(t), 3600, t);
  }
}
function motCase(o){ return {commode:'tiroir', casier:'tiroir', apothicaire:'tiroir', placard:'placard', bocaux:'bocal', suspendus:'bocal', epices:'pot', vitrine:'rayon', fioles_ingr:'flacon'}[o.t] || 'rangement'; }
function remettreAuCarton(V){
  var s = V.selCase;
  if(!s) return;
  var src = {de:'case', o:s.o, ci:s.ci, ingr:s.ingr}, n = dispo(V, src);
  if(n > 0){
    prendre(V, src, n);
    V.etat.panier[s.ingr] = (V.etat.panier[s.ingr] || 0) + n;
    son(V, 'clic');
    toast(V, '<b>' + icIngr(s.ingr) + ' ↩️ 🚪</b> Remis devant la porte', 2400, 'Remis devant la porte.');
  }
  V.selCase = null;
  apresRangement(V);
}
/* Range n ingrédients dans un rangement. Les liquides (eau, brume, miel) vont dans le verre, le reste dans le bois et la toile.
   On commence par la case touchée, puis une case qui a déjà cet ingrédient, puis une case vide. Renvoie combien sont rangés. */
function rangerDans(V, src, n, o, ci){
  var c = catDe(o), d = V.elO[o.id];
  if(!c.cases || !(n > 0)) return 0;
  if(!!c.verre !== estLiquide(src.ingr)){
    var txt = texteMauvaisRangement(src.ingr, o);
    son(V, 'ko'); secouer(d);
    var el = V.ouvertEl.querySelector('.at-case[data-case="' + ci + '"]');
    if(el) anim(el, [{transform:'translateX(0)'}, {transform:'translateX(-8px)'}, {transform:'translateX(8px)'}, {transform:'translateX(0)'}], {duration:320});
    toast(V, '<b>' + icIngr(src.ingr) + (estLiquide(src.ingr) ? ' ➡️ 🫙' : ' ➡️ 📦') + '</b> ' + esc(txt), 5200, txt);
    montrerRegles(V);
    return 0;
  }
  var idx = o.cases.map(function(x, j){ return j; });
  var ordre = [borne(ci || 0, 0, o.cases.length - 1)]
    .concat(idx.filter(function(j){ return (o.cases[j].i[src.ingr] || 0) > 0; }))
    .concat(idx.filter(function(j){ return !somme(o.cases[j].i); }))
    .concat(idx);
  var reste = n, mis = 0, vu = {};
  ordre.forEach(function(j){
    if(vu[j] || reste <= 0) return;
    vu[j] = 1;
    if(src.de === 'case' && src.o === o.id && src.ci === j) return;
    var place = c.cases[j].cap - somme(o.cases[j].i), q2 = Math.min(reste, place);
    if(q2 > 0){ prendre(V, src, q2); o.cases[j].i[src.ingr] = (o.cases[j].i[src.ingr] || 0) + q2; reste -= q2; mis += q2; }
  });
  if(!mis){ son(V, 'ko'); secouer(d); toast(V, '<b>🚫</b> C\'est plein ! Essaie un autre rangement.', 3200, 'C\'est plein ! Essaie un autre rangement.'); return 0; }
  son(V, 'plouf');
  if(src.de === 'panier'){ var ap = V.etat.appris || (V.etat.appris = {}), sorte = c.verre ? 'verre' : 'sec'; ap[sorte] = Math.min(APPRIS, (ap[sorte] || 0) + 1); }
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.06 + ',' + d._s * 0.94 + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:260});
  V.dernierRange = {o:o.id, ci:ci, ingr:src.ingr, n:mis};
  if(reste > 0){ var tpl = 'C\'est plein ! Il en reste ' + reste + '.'; toast(V, '<b>🚫 ' + icIngr(src.ingr) + '</b> ' + esc(tpl), 3200, tpl); }
  changer(V);
  return mis;
}
/* Après un rangement : le meuble de la pièce, la cueillette par terre, le gros plan, ce qu'elle tient */
function apresRangement(V){
  V.etat.objets.forEach(function(o){ if(catDe(o).cases) redessiner(V, o); });
  majFixes(V);
  dessinerTas(V);
  if(V.sel && !(V.etat.panier[V.sel] > 0)) V.sel = null;
  if(V.ouvert) dessinerOuvert(V);
  majTient(V);
  majReperes(V);
  if(!somme(V.etat.panier) && V.avaitCarton){ V.avaitCarton = false; toast(V, '<b>🌿 ✔</b> Plus rien par terre : tout est rangé !', 3200, 'Plus rien par terre : tout est rangé !'); }
  V.avaitCarton = somme(V.etat.panier) > 0;
}
/* Les rangements de la pièce qui acceptent l'ingrédient tenu brillent ; on glisse jusqu'au premier si aucun n'est visible */
function montrerRangements(V){
  var k = V.sel;
  if(!k) return;
  var bons = V.etat.objets.filter(function(o){ var c = catDe(o); return c.cases && !!c.verre === estLiquide(k); });
  if(!bons.length){ var tb = estLiquide(k) ? 'Il te faut un bocal ou une fiole : ouvre un carton !' : 'Il te faut un tiroir ou un placard : ouvre un carton !'; toast(V, '<b>' + (estLiquide(k) ? '🫙' : '📦') + ' ?</b> ' + esc(tb), 3600, tb); return; }
  if(!bons.some(function(o){ return salleDe(o) === V.salle; })){ changerSalle(V, salleDe(bons[0])); }
  var vus = bons.filter(function(o){ var e = V.elO[o.id]; if(!e) return false; var r = e.getBoundingClientRect(), p = V.piece.getBoundingClientRect(); return r.right > p.left + 20 && r.left < p.right - 20 && r.bottom > p.top + 20 && r.top < p.bottom - 20; });
  var la = bons.filter(function(o){ return salleDe(o) === V.salle; })[0];
  if(!vus.length && la){ var p0 = posObj(V, la), c0 = catDe(la); allerVers(V, p0.x, p0.y - c0.h * p0.s / 2); }
}

/* ---------- Le gros plan d'un rangement ---------- */
function ouvrir(V, o){
  V.toastEl.hidden = true;
  V.ouvert = {o:o.id, etq:false};
  V.selCase = null; V.etqSel = null;
  V.avaitCarton = somme(V.etat.panier) > 0;
  dessinerOuvert(V, true);
  majTient(V);
  son(V, 'porte');
}
function fermerOuvert(V){
  V.ouvert = null; V.selCase = null; V.etqSel = null;
  V.ouvertEl.hidden = true;
  V.ouvertEl.innerHTML = '';
  majTient(V);
}
var DISPO_ZOOM = {commode:'tiroirs', casier:'grille', apothicaire:'grille', placard:'grille', vitrine:'tiroirs', bocaux:'bocaux', suspendus:'bocaux', epices:'fioles', fioles_ingr:'fioles'};
function listeEtq(){ return cles(INGR).concat(cles(ETQ_EXTRA)); }
function majCasesOk(V, k){
  if(!V.ouvert) return;
  var o = V.parId[V.ouvert.o];
  if(!o) return;
  var ok = !!catDe(o).verre === estLiquide(k);
  V.ouvertEl.querySelectorAll('.at-case').forEach(function(e){ e.classList.toggle('at-ok', ok); e.classList.toggle('at-non', !ok); });
}
function dessinerOuvert(V, neuf){
  var st = V.ouvert, ov = V.ouvertEl;
  var o = st && V.parId[st.o];
  if(!o){ fermerOuvert(V); return; }
  var c = catDe(o), verre = !!c.verre, prep = V.mode === 'prep', tenu = V.sel, sc = V.selCase;
  var cases = c.cases.map(function(k, i){
    var cs = o.cases[i], l = trier(cs), tot = somme(cs.i);
    var ok = tenu ? (verre === estLiquide(tenu)) : sc ? (verre === estLiquide(sc.ingr) && !(sc.o === o.id && sc.ci === i)) : false;
    var non = (tenu && !ok) || (sc && verre !== estLiquide(sc.ingr));
    var dedans = l.length ? l.map(function(x){
      var choisi = sc && sc.o === o.id && sc.ci === i && sc.ingr === x;
      return '<button type="button" class="at-chipi' + (choisi ? ' on' : '') + '" data-de="case" data-ci="' + i + '" data-ingr="' + x + '" style="--c:' + coulIngr(x) + '">' +
        '<span>' + icIngr(x) + '</span><b>×' + cs.i[x] + '</b><small>' + esc(nomIngr(x)) + '</small></button>';
    }).join('') : '<span class="at-case-vide">vide</span>';
    var etq = cs.e.map(function(id, j){ return '<button type="button" class="at-etq-g" data-ci="' + i + '" data-retire="' + j + '" aria-label="Décoller"><span>' + icEtq(id) + '</span></button>'; }).join('');
    var places = '';
    for(var j = 0; j < k.cap; j++) places += '<i class="' + (j < tot ? 'p' : '') + '"></i>';
    return '<div class="at-case' + (ok ? ' at-ok' : '') + (non ? ' at-non' : '') + (V.dernierRange && V.dernierRange.o === o.id && V.dernierRange.ci === i ? ' at-vient' : '') + '" data-cible="case" data-obj="' + o.id + '" data-case="' + i + '">' +
      (etq ? '<div class="at-case-etq">' + etq + '</div>' : '') +
      '<div class="at-case-contenu">' + dedans + '</div><div class="at-case-places" aria-label="' + tot + ' sur ' + k.cap + '">' + places + '</div></div>';
  }).join('');
  V.dernierRange = null;
  /* en bas : ce qui attend par terre devant la porte (ou la planche d'étiquettes) */
  var bas;
  if(st.etq){
    bas = '<div class="at-plateau at-planche-etq"><p class="at-plateau-tit">🏷️ Choisis une étiquette, puis touche une case</p><div class="at-planche">' +
      listeEtq().map(function(id){ return '<button type="button" class="at-autoc' + (V.etqSel === id ? ' on' : '') + '" data-etq="' + id + '"><span>' + icEtq(id) + '</span></button>'; }).join('') + '</div></div>';
  } else {
    var p = V.etat.panier, ks = cles(p).filter(function(k){ return p[k] > 0; });
    var tit = sc ? '↩️ Touche ici pour remettre ' + icIngr(sc.ingr) + ' devant la porte' : ks.length ? '🌿 Devant la porte : touche, puis range' : '🌿 Plus rien devant la porte';
    bas = '<div class="at-plateau' + (sc ? ' at-retour' : '') + '" data-cible="panier"><p class="at-plateau-tit">' + tit +
      ' <button type="button" class="at-rond at-lire" data-lu="' + esc(sc ? 'Touche ici pour le remettre devant la porte.' : ks.length ? TXT_RANGER : 'Plus rien devant la porte.') + '" aria-label="Écouter">🔊</button></p>' +
      (ks.length ? '<div class="at-plateau-j">' + ks.map(function(k){
        return '<div class="at-jeton-g' + (tenu === k ? ' on' : '') + (estLiquide(k) ? ' liquide' : '') + '" data-de="panier" data-ingr="' + k + '" style="--c:' + coulIngr(k) + '"><span>' + icIngr(k) + '</span><b>' + esc(nomIngr(k)) + (p[k] > 1 ? ' ×' + p[k] : '') + '</b></div>';
      }).join('') + '</div>' : '') + '</div>';
  }
  var regle = verre ? '<span class="at-zoom-regle v">💧 pour les liquides</span>' : '<span class="at-zoom-regle s">🍃 pour les choses sèches</span>';
  ov.className = 'at-ouvert at-ouv-' + c.t + (prep ? ' at-ouv-prep' : '') + (tenu || sc ? ' at-tient-qqch' : '');
  ov.innerHTML = '<div class="at-zoom">' +
    '<div class="at-zoom-tete"><span class="at-zoom-ic">' + svgObjet({t:o.t, v:o.v, st:o.st, cases:o.cases, on:o.on}) + '</span><div class="at-zoom-nom"><b>' + esc(c.nom) + '</b>' + regle + '</div>' +
      (prep ? '' : '<button type="button" class="at-rond at-peindre" aria-label="Changer la couleur">🎨</button><button type="button" class="at-rond at-zoom-etq' + (st.etq ? ' on' : '') + '" aria-label="Étiquettes">🏷️</button>') +
      '<button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button></div>' +
    '<div class="at-zoom-corps at-disp-' + (DISPO_ZOOM[c.t] || 'grille') + '" style="--n:' + c.cases.length + '">' + cases + '</div>' +
    (prep ? '' : bas) + '</div>';
  ov.hidden = false;
  if(neuf) anim(ov.firstChild, [{transform:'scale(.6)', opacity:0}, {transform:'none', opacity:1}], {duration:260, easing:'cubic-bezier(.3,1.3,.5,1)'});
  var v = ov.querySelector('.at-vient');
  if(v) anim(v, [{transform:'scale(1)'}, {transform:'scale(1.05)', offset:0.4}, {transform:'scale(1)'}], {duration:360});
}
function collerEtiquette(V, o, ci, id){
  var cs = o.cases[ci];
  if(cs.e.indexOf(id) >= 0){ son(V, 'ko'); return; }
  if(cs.e.length >= 3) cs.e.shift();
  cs.e.push(id);
  son(V, 'clic');
  redessiner(V, o);
  dessinerOuvert(V);
  changer(V);
}
function retirerEtiquette(V, o, ci, j, b){
  var cs = o.cases[ci];
  if(V.mode !== 'ranger' || !cs) return;
  anim(b, [{transform:'none', opacity:1}, {transform:'translate(14px,-24px) rotate(40deg) scale(.6)', opacity:0}], {duration:260, fill:'forwards'});
  son(V, 'clic');
  apres(V, 240, function(){
    cs.e.splice(j, 1);
    redessiner(V, o);
    dessinerOuvert(V);
    changer(V);
  });
}

/* ==========================================================
   Les grands panneaux (par-dessus la pièce)
   ========================================================== */
function ouvrirCalque(V, cls, html){
  fermerOuvert(V);
  V.toastEl.hidden = true;
  V.grim.className = 'at-grim ' + cls;
  V.grim.innerHTML = html;
  V.grim.hidden = false;
  V.grimA = Date.now();       /* (l'heure d'ouverture : voir le clic sur le fond, dans brancher) */
  majTient(V);
  anim(V.grim.firstChild, [{transform:'translateY(30px) scale(.94)', opacity:0}, {transform:'none', opacity:1}], {duration:300, easing:'cubic-bezier(.3,1.3,.5,1)'});
}
function fermerGrimoire(V){ V.grim.hidden = true; V.grim.innerHTML = ''; majTient(V); if(GUIDE && GUIDE.cible === 'grimoire') guidePlacer(V); }   /* (le rond revient sur le lutrin) */
function ouvrirGrimoire(V){ ouvrirLivre(V); }      /* (ancien nom) */
function lireBtn(t){ return '<button type="button" class="at-rond at-lire" data-lu="' + esc(t) + '" aria-label="Écouter">🔊</button>'; }
function feuille(cls, titre, corps){
  return '<div class="at-feuille ' + cls + '"><button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button>' +
    '<div class="at-feuille-tete">' + titre + '</div><div class="at-feuille-corps">' + corps + '</div></div>';
}

/* ---------- La cueillette (posée devant la porte) : « où la ranger ? » ---------- */
/* Un toucher sur la cueillette devant la porte : tout se range tout seul (Romain, 5 novembre, 12 h 31 : « c'est trop chiant de ranger »).
   Chaque ingrédient va d'abord là où son étiquette est collée, puis là où il y en a déjà, puis dans une case vide, puis là où il reste
   de la place ; liquides dans le verre (bocaux, fioles), le reste dans les tiroirs et les placards. Ce qui ne trouve pas de place reste
   devant la porte (la fenêtre « Ta cueillette » s'ouvre alors pour le dire). */
/* D'où part chaque ingrédient : son tas devant la porte (en unités de la pièce) */
function departsTas(V){
  var d = {}, mr = V.monde && V.monde.getBoundingClientRect();
  if(!mr || !V.k) return d;
  (V.elTas || []).forEach(function(e){ var r = e.getBoundingClientRect(); if(!r.width) return; d[e._k] = {x:V.vb.x0 + ((r.left + r.right) / 2 - mr.left) / V.k, y:V.vb.y0 + ((r.top + r.bottom) / 2 - mr.top) / V.k}; });
  return d;
}
/* Le voyage des ingrédients (Romain, 5 novembre, 15 h 58) : un par un, lentement, chaque ingrédient s'envole de son tas jusqu'au meuble
   où il se range (la vue glisse jusqu'à lui) ; à l'arrivée, le meuble tressaille, « +3 🫐 » et des étincelles. Rend la durée totale (ms). */
var VOYAGE = 1500, ECART = 1100;
function voyagesRangement(V, mv){
  if(!mv.length) return 0;
  if(MOINS_MOUV){ mv.forEach(function(m){ flotter(V, m.o, '+' + m.q + ' ' + icIngr(m.k)); }); son(V, 'plouf'); return 400; }
  mv.forEach(function(m, i){
    apres(V, i * ECART, function(){
      var F = cadreObjet(V, m.o.id) || {x:600, y:600, w:0, h:0}, a = m.de || {x:F.x, y:F.y + 200}, b = {x:F.x, y:F.y - F.h * 0.5};
      allerVers(V, b.x, b.y);   /* la vue glisse jusqu'au meuble : on voit où il arrive */
      var e = document.createElement('div');
      e.className = 'at-voyage';
      e.innerHTML = '<span>' + icIngr(m.k) + '</span><b>×' + m.q + '</b>';
      e.style.zIndex = 99000;
      V.calque.appendChild(e);
      var hy = Math.min(a.y, b.y) - 160;
      var an = anim(e, [
        {left:pX(V, a.x), top:pY(V, a.y), transform:'translate(-50%,-50%) scale(.6)', opacity:0},
        {left:pX(V, a.x + (b.x - a.x) * 0.15), top:pY(V, a.y - 60), transform:'translate(-50%,-50%) scale(1.15)', opacity:1, offset:0.15},
        {left:pX(V, (a.x + b.x) / 2), top:pY(V, hy), transform:'translate(-50%,-50%) scale(1.1)', opacity:1, offset:0.5},
        {left:pX(V, b.x), top:pY(V, b.y), transform:'translate(-50%,-50%) scale(.75)', opacity:1}
      ], {duration:VOYAGE, easing:'ease-in-out', fill:'forwards'});
      son(V, 'clic');
      apres(V, VOYAGE, function(){
        e.remove();
        var d = V.elO[m.o.id];
        if(d && d._s) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.07 + ',' + d._s * 0.93 + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:320});
        flotter(V, m.o, '+' + m.q + ' ' + icIngr(m.k));
        etincelles(V, m.o);
        son(V, 'plouf');
      });
      if(!an){ e.style.left = pX(V, b.x); e.style.top = pY(V, b.y); }
    });
  });
  return (mv.length - 1) * ECART + VOYAGE + 300;
}
function rangerAuto(V){
  var p = V.etat.panier, mis = 0, reste = 0, ou = {}, mv = [], dep = departsTas(V);
  cles(p).forEach(function(k){
    if(!(p[k] > 0)) return;
    var places = [];
    V.etat.objets.forEach(function(o){
      var c = catDe(o);
      if(!c.cases || !!c.verre !== estLiquide(k) || (o.sur && !V.parId[o.sur.o])) return;
      o.cases.forEach(function(cs, j){
        var cap = c.cases[j] ? c.cases[j].cap : 0, s0 = somme(cs.i), e = cs.e || [];
        if(cap - s0 <= 0) return;
        var rang = e.indexOf(k) >= 0 ? 0 : (cs.i[k] || 0) > 0 ? 1 : (!s0 && !e.length) ? 2 : (!s0 ? 3 : 4);
        places.push({o:o, j:j, cap:cap, rang:rang});
      });
    });
    places.sort(function(a, b){ return a.rang - b.rang; });
    places.forEach(function(x){
      if(!(p[k] > 0)) return;
      var cs = x.o.cases[x.j], q = Math.min(p[k], x.cap - somme(cs.i));
      if(q <= 0) return;
      prendre(V, {de:'panier', ingr:k}, q); cs.i[k] = (cs.i[k] || 0) + q; mis += q;
      ou[x.o.id] = (ou[x.o.id] || '') + icIngr(k);
      var m0 = mv.filter(function(m){ return m.k === k && m.o === x.o; })[0];
      if(m0) m0.q += q; else mv.push({k:k, o:x.o, q:q, de:dep[k]});
    });
    if(p[k] > 0) reste += p[k];
  });
  var duree = 0;
  if(mis){
    duree = voyagesRangement(V, mv);   /* (Romain, 15 h 58 : on voit chaque ingrédient aller lentement jusqu'à son rangement) */
    changer(V);
    try{ guideFait(V, 'rangement'); }catch(e){}
  }
  V.rangeFin = mis ? Date.now() + duree : 0; V.attenteDit = 'regarde';
  return {mis:mis, reste:reste, duree:duree};
}
function ouvrirArrivage(V, k){
  V.etat.nouveaux = 0;
  changer(V);
  var ra = rangerAuto(V);
  if(ra.mis){
    V.avaitCarton = false;   /* (le message vient après le voyage des ingrédients, pas tout de suite) */
    apresRangement(V);
    if(!ra.reste){
      apres(V, ra.duree, function(){ toast(V, '<b>🌿 ✔</b> Tout est rangé !', 2600, 'Tout est rangé !'); });
      V.rangeFin = Date.now() + ra.duree + 2600;   /* le tutoriel attend la fin du message pour montrer la suite (Atelier.rangeEnCours) */
      return;
    }
    k = null;
  }
  if(ra.reste){ var tr = 'Plus de place pour le reste : installe un meuble de plus (ouvre un carton), ou range à la main.'; toast(V, '<b>📦 ?</b> ' + esc(tr), 4200, tr); }
  dessinerTas(V); majReperes(V);
  V.avaitCarton = somme(V.etat.panier) > 0;
  if(k && V.etat.panier[k] > 0){ V.sel = k; V.selCase = null; }
  ouvrirCalque(V, 'at-cal-arrivage', '<div></div>');
  dessinerArrivage(V);
  son(V, 'porte');
}
function dessinerArrivage(V){
  var p = V.etat.panier, ks = cles(p).filter(function(k){ return p[k] > 0; }), k = V.sel && p[V.sel] > 0 ? V.sel : null, corps;
  if(!ks.length){
    var tv = 'Plus rien par terre. Ce que tu cueilles est posé ici, devant la porte.';
    corps = '<p class="at-feuille-txt">' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  } else {
    corps = '<p class="at-feuille-txt">Touche un ingrédient, puis choisis où le ranger. ' + lireBtn(TXT_RANGER) + '</p>' +
      '<div class="at-gros-jetons">' + ks.map(function(x){
        return '<button type="button" class="at-gj' + (x === k ? ' on' : '') + (estLiquide(x) ? ' liquide' : '') + '" data-prendre="' + x + '" style="--c:' + coulIngr(x) + '"><span>' + icIngr(x) + '<i>×' + p[x] + '</i></span><b>' + esc(nomIngr(x)) + '</b></button>';
      }).join('') + '</div>';
    if(k){
      var bons = V.etat.objets.filter(function(o){ var c = catDe(o); return c.cases && !!c.verre === estLiquide(k); });
      var libre = function(o){ var c = catDe(o), n = 0; o.cases.forEach(function(cs, j){ n += Math.max(0, c.cases[j].cap - somme(cs.i)); }); return n; };
      corps += '<div class="at-ou"><p class="at-ou-tit">' + icIngr(k) + ' <b>' + esc(nomIngr(k)) + '</b> va dans ' + (estLiquide(k) ? '💧 un bocal ou une fiole' : '🍃 un tiroir ou un placard') + ' :</p>' +
        (bons.length ? '<div class="at-ou-liste">' + bons.map(function(o){
          var c = catDe(o), n = libre(o);
          return '<button type="button" class="at-ou-b' + (n ? '' : ' plein') + '" data-vers="' + o.id + '"><span class="at-ou-ic">' + svgObjet({t:o.t, v:o.v, st:o.st, cases:o.cases, on:o.on}) + '</span><b>' + esc(c.nom) + '</b><small>' + (n ? n + ' place' + (n > 1 ? 's' : '') : 'plein') + '</small></button>';
        }).join('') + '</div>' : '<p class="at-feuille-txt">Il te faut d\'abord ' + (estLiquide(k) ? 'des bocaux' : 'un tiroir ou un placard') + ' : ouvre un carton de meubles !</p>') +
        (bons.length ? '<button type="button" class="at-gros at-dans-piece">👀 Le chercher dans la pièce</button>' : '') + '</div>';
    }
  }
  V.grim.innerHTML = feuille('at-f-arrivage', '<span class="at-f-ic">🌿</span><h3>Ta cueillette</h3>', corps);
}

/* ---------- Les potions (les flacons devant la porte) : à quoi elles servent, les donner (code), les vendre ---------- */
function ouvrirPotions(V, focus){
  V.potSel = focus || V.potSel;
  ouvrirCalque(V, 'at-cal-potions', '<div></div>');
  dessinerPotions(V);
  son(V, 'clic');
}
function dessinerPotions(V){
  var D = DD(), P = V.o.potions || {}, pots = cles(P).filter(function(k){ return P[k] > 0; }), nf = V.o.fioles || 0, corps = '';
  var fio = '';
  for(var i = 0; i < Math.min(nf, 12); i++) fio += '<i class="at-fv"></i>';
  var tf = nf ? 'Tu as ' + nf + ' fiole' + (nf > 1 ? 's' : '') + ' vide' + (nf > 1 ? 's' : '') + ' : il en faut une pour chaque potion.' : 'Tu n\'as plus de fiole vide : il en faut une pour chaque potion.';
  corps += '<div class="at-fioles-l">' + (fio || '<span class="at-fv-aucune">—</span>') + (nf > 12 ? '<b>+' + (nf - 12) + '</b>' : '') + '<p>' + esc(tf) + '</p>' + lireBtn(tf) + '</div>';
  if(!pots.length){
    var tv = 'Aucune potion pour l\'instant. Prépare-les au grand chaudron : leurs flacons arriveront par terre, devant la porte.';
    corps += '<p class="at-feuille-txt">' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  } else {
    if(!V.potSel || !(P[V.potSel] > 0)) V.potSel = pots[0];
    if(pots.length > 1) corps += '<div class="at-pot-onglets">' + pots.map(function(k){
      var p = (D.POTIONS || {})[k] || {};
      return '<button type="button" class="at-pot-o' + (k === V.potSel ? ' on' : '') + '" data-pot-voir="' + k + '" style="--c:' + (p.c || '#8ff3ff') + '"><span>' + (p.ic || '🧪') + '</span><b>×' + P[k] + '</b></button>';
    }).join('') + '</div>';
    var k = V.potSel, p = (D.POTIONS || {})[k] || {}, ut = utilePotion(k);
    var t = (p.nom || k) + '. ' + ut;
    corps += '<div class="at-pot-carte" style="--c:' + (p.c || '#8ff3ff') + '"><div class="at-pot-gros">' + (p.ic || '🧪') + '</div>' +
      '<div class="at-pot-txt"><h4>' + esc(p.nom || k) + ' <span>×' + P[k] + '</span></h4><p>' + esc(ut) + '</p>' + lireBtn(t) + '</div>' +
      '<div class="at-pot-actions"><button type="button" class="at-gros" data-act="donner-potion" data-id="' + k + '">🎁 Donner à un équipier</button>' +
      (V.o.vendre ? '<button type="button" class="at-gros second" data-act="vendre" data-id="' + k + '">🛒 Vendre au marché</button>' : '') + '</div></div>';
  }
  V.grim.innerHTML = feuille('at-f-potions', '<span class="at-f-ic">🧪</span><h3>Mes potions</h3>', corps);
}

/* ---------- La table d'analyse : les objets reçus ---------- */
function ouvrirAnalyses(V){
  fermerBullesPa(V);
  /* le labo (10 novembre, Bible §12.51) : quand l'enquête a sa fiche de labo, « Analyser » ouvre le labo en plein écran (options.labo,
     donné par le moteur : labo.js). Sinon : le panneau d'analyse d'avant. */
  /* (rien de reçu encore : le panneau d'avant, qui explique comment un objet arrive sur la paillasse) */
  if(typeof V.o.labo === 'function' && (V.o.analyses || []).length){ son(V, 'clic'); V.o.labo(); return; }
  ouvrirCalque(V, 'at-cal-analyses', feuille('at-f-analyses', '<span class="at-f-ic">🔍</span><h3>La paillasse d\'analyse</h3><span class="at-f-apercu" aria-hidden="true">' + apercuPanneau(V, 'pa') + '</span>', corpsAnalyses(V)));
  son(V, 'clic');
}
function corpsAnalyses(V){
  var l = V.o.analyses || [], act = V.o.actions;
  if(!l.length){
    var tv = 'Quand un équipier te donne le code d\'un objet, tape-le dans l\'onglet Code : l\'objet arrivera sur cette paillasse.';
    return '<p class="at-feuille-txt">🔢 ' + esc(tv) + ' ' + lireBtn(tv) + '</p>';
  }
  return '<div class="at-an-liste">' + l.map(function(a){
    var res = a.fait ? (a.t || '') + (a.fait === 2 && a.detail ? ' ' + a.detail : '') : '';
    return '<div class="at-an' + (a.fait ? ' faite' : ' attend') + '"><div class="at-an-ic">' + (a.ic || '❔') + '</div><div class="at-an-txt"><h4>' + esc(a.nom || a.id) + '</h4>' +
      (a.fait ? '<p>' + esc(a.t || '') + '</p>' + (a.fait === 2 && a.detail ? '<p class="at-an-detail">🔍 ' + esc(a.detail) + '</p>' : '') + lireBtn(res) :
        '<p class="at-an-pas">Pas encore analysé.</p>' +
        (act === 0 ? '<p class="at-an-pas">⏳ Plus d\'action pour ce moment.</p>' : '') +
        '<button type="button" class="at-gros" data-act="analyser" data-id="' + a.id + '"' + (act === 0 ? ' disabled' : '') + '>🔬 Analyser' + (V.o.sansActions ? '' : ' · 1 action') + '</button>') +   /* opts.sansActions : une enquête sans points d'action */
      '</div></div>';
  }).join('') + '</div>';
}

/* ---------- Le livre des recettes (lecture seule) et le chaudron (préparer) : deux écrans ---------- */
function rec(V, id){ return recettesDe(V).filter(function(r){ return r.id === id; })[0]; }
function stockRange(V){
  var t = {};
  V.etat.objets.forEach(function(o){ (o.cases || []).forEach(function(c){ cles(c.i).forEach(function(k){ t[k] = (t[k] || 0) + c.i[k]; }); }); });
  return t;
}
function zoneDeRecette(id){
  var D = DD(), C = (D.CHAUDRON || {})[id], Zc = D.ZONES_CHAUDRON || {};
  return C ? {id:C.zone, z:Zc[C.zone] || {nom:C.zone, grand:C.zone, c:'#3fcf6a'}} : null;
}
function texteRecette(V, id){
  var D = DD();
  if(id === 'sage') return 'Demande au Sage de te lire la recette !';
  var r = rec(V, id);
  if(!r) return '';
  if(r.connue === false) return r.nom + '. C\'est une recette secrète : demande au Sage de te la lire !';
  return r.nom + '. ' + (D.texteEtapes ? D.texteEtapes(id) : '') + '.';
}
function puceZone(Zr){
  return Zr ? '<span class="at-chip at-chip-zone' + (Zr.id === 'arc-en-ciel' ? ' ae' : '') + '" style="--z:' + Zr.z.c + '"><em>🎯</em><i class="at-zone-pastille"></i><b>' + esc(Zr.z.grand) + '</b></span>' : '';
}
function pucesRecette(r){
  var R = (DD().RECETTES || {})[r.id], i = 0;
  if(r.connue === false) return '<div class="at-chips">' + (R ? R.ingr : []).map(function(x){ i++; return '<span class="at-chip"><em>' + i + '</em><span class="at-ic-e">❓</span></span>'; }).join('') + '<span class="at-chip at-chip-secret"><span class="at-ic-e">🔒</span></span></div>';
  return '<div class="at-chips">' + (R ? R.ingr : []).map(function(x){
    i++; return '<span class="at-chip"><em>' + i + '</em><span class="at-ic-e">' + icIngr(x[0]) + '</span><b>×' + x[1] + '</b></span>';
  }).join('') + puceZone(zoneDeRecette(r.id)) + '</div>';
}

/* Le grimoire : une fiche par recette. Le nom, les ingrédients (ce qu'on a / ce qu'il faut, en rouge s'il en manque),
   à quoi sert la potion et pour qui (🔊), et « Préparer » (un raccourci vers le chaudron). Les secrètes : ❓ et le Sage. */
function utilePotion(id){ var p = (DD().POTIONS || {})[id] || {}; return p.utile || p.d || ''; }
function ouvrirLivre(V){
  if(V.mode !== 'ranger') return;
  fermerBullesPa(V);
  if(!recettesDe(V).length){ sansRecette(V); return; }
  ouvrirCalque(V, 'at-cal-livre', '<div class="at-livre"></div>');
  dessinerLivre(V);
  son(V, 'page');
}
/* La recette secrète, sous la dictée du Sage (Romain, 4 novembre, 21 h 22) : chaque « ? » (dans l'ordre) ouvre un petit menu
   avec tous les ingrédients ; elle choisit celui que le Sage lui dit. Le bon : la case se remplit (icône, nom, quantité) ;
   un autre : la case tremble (« demande au Sage »), sans rien perdre. Toutes remplies : la recette est connue (V.etat.dictees). */
function groupesRecette(id){
  var R = (DD().RECETTES || {})[id] || {ingr:[]}, vus = {}, ingr = [];
  R.ingr.forEach(function(x){ if(vus[x[0]] === undefined){ vus[x[0]] = ingr.length; ingr.push([x[0], x[1]]); } else ingr[vus[x[0]]][1] += x[1]; });
  return ingr;
}
function dicteeDe(V, id){ var d = V.etat.dictees && V.etat.dictees[id]; return Array.isArray(d) ? d : []; }
function dicteeFinie(V, id){ var g = groupesRecette(id), d = dicteeDe(V, id); return g.length > 0 && d.length >= g.length; }
/* une recette secrète qu'il reste à faire dicter (la première du grimoire) */
function aDicter(V){ return recettesDe(V).filter(function(r){ return r.connue === false && !dicteeFinie(V, r.id); })[0] || null; }
function ouvrirDictee(V, rid, j){
  var f = V.grim.querySelector('[data-fiche="' + rid + '"]'); if(!f) return;
  var vieux = f.querySelector('.at-dicte'); if(vieux) vieux.remove();
  var I = DD().INGR || {}, t = 'Quel ingrédient le Sage te dit ? Ingrédient numéro ' + (j + 1) + '.';
  var m = document.createElement('div');
  m.className = 'at-dicte';
  m.innerHTML = '<p class="at-dicte-t"><b>' + (j + 1) + '</b> ' + esc('Quel ingrédient dit le Sage ?') + ' ' + lireBtn(t) + '<button type="button" class="at-rond at-dicte-x" aria-label="Fermer">✖</button></p>' +
    '<div class="at-dicte-l">' + cles(I).map(function(k){ return '<button type="button" class="at-dicte-i" data-dicte="' + k + '" data-r="' + rid + '" data-j="' + j + '"><span>' + icIngr(k) + '</span><small>' + esc(nomIngr(k)) + '</small></button>'; }).join('') + '</div>';
  var rg = f.querySelector('.at-ringr');   /* juste sous les « ? » */
  if(rg && rg.nextSibling) f.insertBefore(m, rg.nextSibling); else f.appendChild(m);
  son(V, 'clic');
  try{ m.scrollIntoView({block:'nearest', behavior:'smooth'}); }catch(e){}
}
function choisirDictee(V, rid, j, k, b){
  var g = groupesRecette(rid), d = dicteeDe(V, rid).slice();
  if(j !== d.length || !g[j]) return;
  if(g[j][0] !== k){
    son(V, 'ko'); vibrer(40);
    if(b) anim(b, [{transform:'translateX(0)'}, {transform:'translateX(-7px)'}, {transform:'translateX(7px)'}, {transform:'translateX(0)'}], {duration:300});
    var tk = 'Ce n\'est pas ça : demande au Sage de te redire la recette !';
    toast(V, '<b>📜 ❓</b> ' + esc(tk), 3200, tk);
    return;
  }
  d.push(k);
  V.etat.dictees = V.etat.dictees || {};
  V.etat.dictees[rid] = d;
  changer(V);
  son(V, 'ok');
  dessinerLivre(V);
  if(d.length >= g.length){
    /* (Romain, 10 novembre : le grimoire d'abord, la cueillette ensuite) s'il manque des ingrédients, on le dit, en racontant */
    var st = stockRange(V), pan = V.etat.panier || {}, manque = g.filter(function(x){ return (st[x[0]] || 0) + (pan[x[0]] || 0) < x[1]; });
    var tf = manque.length ? 'La recette est complète ! Mais ton atelier n\'a pas tout : il te manque ' + manque.map(function(x){ return ((x[1] - (st[x[0]] || 0) - (pan[x[0]] || 0)) + ' ' + nomIngr(x[0]).toLowerCase()); }).join(' et ') + '. En route pour la cueillette !' :
      'La recette est complète ! Ferme le grimoire et va au grand chaudron.';
    toast(V, '<b>📜 ✔</b> ' + esc(tf), 4200, tf);
    V.rangeFin = Date.now() + 4200; V.attenteDit = 'recette';   /* (le tutoriel attend la fin du message pour montrer la suite) */
    try{ guideFait(V, 'grimoire'); }catch(e){}
  } else guideRafraichir(V);
}
function ficheRecette(V, r){
  var R = (DD().RECETTES || {})[r.id] || {ingr:[]}, e = etatRecette(V, r.id), s = stockRange(V), pan = V.etat.panier, secrete = r.connue === false;
  var ingr = groupesRecette(r.id), dic = secrete ? dicteeDe(V, r.id) : [], dicte = secrete && dic.length >= ingr.length;
  var ligne = ingr.map(function(x, j){
    var k = x[0], a = s[k] || 0, ok = a >= x[1];
    if(secrete && j >= dic.length){
      /* le prochain « ? » s'ouvre (les autres attendent leur tour) ; au tutoriel, le rond lumineux est dessus */
      var lui = j === dic.length;
      return '<button type="button" class="at-ri at-ri-q' + (lui ? ' a-toi' : '') + '" data-dicter="' + r.id + '" data-j="' + j + '"' + (lui ? '' : ' disabled') + ' aria-label="Ingrédient ' + (j + 1) + ' : demande au Sage"><span class="at-ri-ic">❓</span><small>' + (j + 1) + '</small></button>';
    }
    return '<div class="at-ri ' + (ok ? 'ok' : 'ko') + '" data-ingr="' + k + '"><span class="at-ri-ic" style="--c:' + coulIngr(k) + '">' + icIngr(k) +
      '<b>' + (ok ? '✓ ' : '') + Math.min(a, 99) + '/' + x[1] + '</b>' + (!ok && (pan[k] || 0) > 0 ? '<i class="at-ri-carton" title="par terre, devant la porte">🌿</i>' : '') + '</span><small>' + esc(nomIngr(k)) + '</small></div>';
  }).join('');
  var ut = utilePotion(r.id);
  return '<div class="at-rcarte' + (e.pret ? ' pret' : ' manque') + (secrete && !dicte ? ' secrete' : '') + (dicte ? ' dictee' : '') + '" style="--c:' + (r.c || '#8ff3ff') + '" data-fiche="' + r.id + '">' +
    '<h4><span class="at-rec-ic">' + (r.ic || '🧪') + '</span><span>' + esc(r.nom) + '</span>' + lireBtn(r.nom + '. ' + ut) + '</h4>' +
    '<div class="at-ringr">' + ligne + '</div>' +
    (secrete && !dicte ? '<p class="at-rsage">📜 ' + esc('Recette secrète : demande au Sage de te la lire, puis touche les « ? » dans l\'ordre !') + ' <button type="button" class="at-rond" data-lire="sage" aria-label="Écouter">🔊</button></p>' : '') +
    (dicte ? '<p class="at-rsage">📜 ' + esc('Le Sage t\'a dicté la recette.') + '</p>' : '') +
    '<p class="at-rutile">' + esc(ut) + '</p>' +
    '<button type="button" class="at-rpreparer' + (e.pret ? '' : ' ko') + '" data-r="' + r.id + '">🍲 Préparer</button></div>';
}
function dessinerLivre(V){
  var rs = recettesDe(V).slice();
  /* au tutoriel (ou pendant le guidage du grimoire) : la recette à faire dicter tout en haut, sans faire défiler */
  var ad = aDicter(V);
  if(ad && (V.o.tutoriel || (GUIDE && GUIDE.cible === 'grimoire'))) rs = [ad].concat(rs.filter(function(r){ return r.id !== ad.id; }));
  V.grim.innerHTML = '<div class="at-livre at-grimoire"><button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button>' +
    '<div class="at-livre-titre">📖 <span>Le grimoire</span>' + boutonPeindre(V, 'lu') + '</div>' +
    '<div class="at-rcartes">' + rs.map(function(r){ return ficheRecette(V, r); }).join('') + '</div></div>';
  guideRafraichir(V);
}
/* « Préparer » sur une fiche : si tout est rangé, on va au chaudron ; sinon le bouton tremble et ce qui manque clignote */
function preparerDepuisLivre(V, rid, b){
  var e = etatRecette(V, rid);
  if(e.pret){ demarrer(V, rid, b); return; }
  son(V, 'ko'); vibrer(40);
  anim(b, [{transform:'translateX(0)'}, {transform:'translateX(-9px)'}, {transform:'translateX(9px)'}, {transform:'translateX(-5px)'}, {transform:'translateX(0)'}], {duration:360});
  var f = V.grim.querySelector('[data-fiche="' + rid + '"]');
  if(f) f.querySelectorAll('.at-ri.ko').forEach(function(x){ x.classList.remove('at-flash'); void x.offsetWidth; x.classList.add('at-flash'); });
}

/* Le chaudron : ce qu'elle peut préparer TOUT DE SUITE (tous les ingrédients rangés), en gros boutons.
   Rien de possible : le chaudron bouillonne, une petite phrase (🔊) et le grimoire brille. */
function etatRecette(V, id){
  var b = besoinDe(id), s = stockRange(V), pan = V.etat.panier, manquent = [], auPanier = false;
  cles(b).forEach(function(k){
    var m = b[k] - (s[k] || 0);
    if(m > 0){ manquent.push([k, m]); if((pan[k] || 0) > 0) auPanier = true; }
  });
  return {pret:!manquent.length, manquent:manquent, auPanier:auPanier};
}
/* Aucune recette au chaudron dans cette enquête (l'enquête 3 : les potions se font à l'établi, avec les plantes) : le grimoire et le chaudron
   le disent, au lieu de rester muets (V.o.sansRecette : la phrase du jeu, moteur-actions.js) */
function sansRecette(V){
  var t = V.o.sansRecette || 'Aucune recette pour le chaudron aujourd\'hui.';
  son(V, 'bulle'); toast(V, esc(t), 5200, t);
}
function ouvrirChaudron(V){
  if(V.mode !== 'ranger') return;
  fermerBullesPa(V);
  if(!recettesDe(V).length){ sansRecette(V); return; }
  var prets = recettesDe(V).filter(function(r){ return etatRecette(V, r.id).pret; });
  if(!prets.length){
    son(V, 'bulle');
    var ch = V.elO.ch;
    if(ch){ ch.classList.remove('at-bouillonne'); void ch.offsetWidth; ch.classList.add('at-bouillonne'); apres(V, 1700, function(){ ch.classList.remove('at-bouillonne'); }); }
    var t = 'Il te manque des ingrédients : regarde le grimoire 📖';
    toast(V, esc(t), 5200, 'Il te manque des ingrédients : regarde le grimoire.');
    var lu = V.elO.lu;
    if(lu){ lu.classList.add('at-livre-appel'); apres(V, 5200, function(){ if(V.elO.lu) V.elO.lu.classList.remove('at-livre-appel'); majReperes(V); }); majReperes(V); }
    return;
  }
  if(!((V.o.fioles || 0) > 0)){
    son(V, 'ko');
    var tf = 'Il te faut une fiole vide pour mettre la potion.';
    toast(V, '<b>🧪</b> ' + esc(tf), 4600, tf);
    brillerVides(V);
    return;
  }
  ouvrirCalque(V, 'at-cal-chaudron', '<div class="at-livre"></div>');
  dessinerChaudron(V, prets);
  son(V, 'bulle');
}
function dessinerChaudron(V, prets){
  prets = prets || recettesDe(V).filter(function(r){ return etatRecette(V, r.id).pret; });
  var boutons = prets.map(function(r){
    return '<button type="button" class="at-ch-go" data-r="' + r.id + '" style="--c:' + (r.c || '#8ff3ff') + '"><span class="at-ch-go-ic">' + (r.ic || '🧪') + '</span><b>' + esc(r.nom) + '</b><span class="at-ch-go-p">🍲 Préparer</span></button>';
  }).join('');
  var t = prets.length > 1 ? 'Tu peux préparer ' + prets.length + ' potions. Laquelle ?' : 'Tu peux préparer cette potion !';
  V.grim.innerHTML = '<div class="at-livre at-livre-ch"><button type="button" class="at-rond at-fermer" aria-label="Fermer">✖</button>' +
    '<div class="at-ch-titre"><span>🍲</span><h3>Le chaudron</h3>' + boutonPeindre(V, 'ch') + '</div>' +
    '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p>' +
    '<div class="at-ch-boutons">' + boutons + '</div></div>';
}

/* ==========================================================
   Le chat, bien vivant : il dort (il respire, des « z » s'envolent),
   se réveille, se promène, saute sur les meubles, s'assoit, se lèche
   la patte, tape un bocal, s'installe sur le grimoire…
   On le touche : il se roule en boule et dort 30 secondes.
   Tout est fait d'animations Web enchaînées (element.animate) :
   aucune boucle permanente, et jamais de téléportation.
   Sa position du moment n'est pas sauvegardée (seulement sa place à lui,
   quand l'enfant le pose quelque part).
   ========================================================== */
/* (16 novembre, 19 h 56, Romain : « elle va un peu trop lentement. Et quand elle court, c'est encore pire ») : au pas, 135 par seconde
   (c'était 100) ; st.vite la multiplie : vers 2, elle trotte ; au-delà de 3, elle galope (elle traverse l'atelier en moins de deux secondes). */
var CHAT_VITESSE = 135;          /* unités logiques par seconde, au pas */
/* Le plancher est vu d'un peu au-dessus : ce qui s'éloigne monte peu à l'écran. Un pas vers le fond de la pièce avance donc moins,
   à l'écran, qu'un pas de côté : c'est ce qui l'empêche de patiner quand elle monte ou descend (Romain : « je veux pas qu'elle patine
   dans le vide pour remonter »). */
var CHAT_PROF = 0.42;
function chatProfondeur(p){ return p.z >= 600 ? borne(p.z - 1000, SOL_MIN - 40, SOL_MAX + 60) : SOL_MIN - 20; }   /* (sur une étagère du mur : tout au fond) */
var CHAT_SIESTE_TOUCHE = 30000;  /* toucher le chat : il dort 30 secondes */
var POSES = ['dort', 'assis', 'marche', 'saute', 'lave', 'tape', 'mange', 'salut', 'griffe', 'boule', 'dos', 'pain'];   /* (griffe, boule : à l'arbre à chat, dressé sur ses pattes arrière ; dos, pain : 16 novembre) */

function chatsDe(V){ return ici(V).filter(function(o){ return o.t === 'chat'; }); }   /* (les chats de la pièce dessinée) */
function chatEtat(V, o){
  var st = V.chats[o.id];
  if(!st) st = V.chats[o.id] = {pos:null, pose:'dort', dortJusqua:Date.now() + 5000 + Math.random() * 7000, gauche:false, t:null, anim:null, tenu:false};
  return st;
}
/* Une position « vivante » est-elle encore valable (le meuble existe toujours, il est posé par terre) ? */
function posValide(V, pos){
  if(!pos) return false;
  if(!pos.sur) return typeof pos.x === 'number' && typeof pos.y === 'number';
  if(pos.sur.o === 'cheminee') return true;
  var par = V.parId[pos.sur.o];
  return !!(par && !par.sur && (catDe(par).surf || [])[pos.sur.k]);
}
function chatPos(V, o){
  var st = chatEtat(V, o);
  if(st.pos && !posValide(V, st.pos)) st.pos = null;
  /* (le meuble où il était assis est passé dans l'autre pièce : il reprend sa place à lui, il ne flotte jamais en l'air) */
  if(st.pos && st.pos.sur && V.parId[st.pos.sur.o] && salleDe(V.parId[st.pos.sur.o]) !== salleDe(o)) st.pos = null;
  if(!st.pos) return tailleChat(o, posObj(V, o));
  var ps = {t:'chat', x:st.pos.x, y:st.pos.y, sur:st.pos.sur ? {o:st.pos.sur.o, k:st.pos.sur.k, dx:st.pos.sur.dx} : null};
  var p = posObj(V, ps);
  if(st.pos.sur) p.z += 4;    /* sur un meuble, il passe devant ce qui y est posé */
  return tailleChat(o, p);    /* (le chaton est plus petit) */
}
function chatPose(V, o, pose){
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(st.depart && pose !== 'salut') return;      /* Mimi dit au revoir : plus rien ne change sa pose */
  st.pose = pose;
  if(!d) return;
  POSES.forEach(function(p){ d.classList.toggle('at-c-' + p, p === pose); });
  if(st.rig) st.rig.pose(pose);                  /* (le pantin y glisse : jamais d'un coup) */
}
/* Son pantin (MimiPantin, mimi-pantin.js) : remonté chaque fois que son dessin est refait (un habit de plus, le retour dans la pièce).
   Il lit les classes du chat (.at-x-…, .at-c-gauche…) et joue les gestes du même nom : le reste du programme n'a rien à lui dire de plus. */
function chatMonter(V, o, d){
  var st = chatEtat(V, o), sv = d.querySelector('svg');
  if(st.rig){ st.rig.detruire(); st.rig = null; }
  if(!sv) return;
  st.rig = MP.monter(sv, {pose:st.pose, gauche:!!st.gauche, hote:d});
  if(st.butin) st.rig.porter(st.butin);
}
/* (Romain, 19 novembre, 12 h 36) LE LABO : le chat qui saute sur la paillasse est la vraie Mimi du joueur — son pelage, ses yeux et ses
   habits (le premier chat de l'atelier). Le labo (src/labo/20-chat.js) la redessine avec le même pantin. */
window.MimiLabo = function(){
  var a = window.M && window.M.S && window.M.S.atelier, o = a && (a.objets || []).filter(function(x){ return x && x.t === 'chat'; })[0];
  if(!o) return null;
  try{ return {v:vChat(o.v || 0), acc:accPantin(o.acc)}; }catch(e){ return null; }
};
function pantinDe(V, o){ var st = V.chats[o.id]; return st && st.rig && !st.rig.mort ? st.rig : null; }
/* ce qu'elle porte dans la gueule (du SVG ; rien : elle le lâche) — gardé si son dessin est refait */
function butinChat(V, o, svg){ var st = V.chats[o.id], r = pantinDe(V, o); if(st) st.butin = svg || null; if(r) r.porter(svg || ''); }
function gesteChat(V, o, nom, opt){ var r = pantinDe(V, o); return r ? r.geste(nom, opt) : null; }
function chatHabiller(V, o, d){
  var st = chatEtat(V, o);
  d.classList.add('at-c-' + st.pose);
  d.classList.toggle('at-c-gauche', !!st.gauche);
  /* l'élément vient d'être recréé : une animation en cours sur l'ancien ne finira jamais */
  if(st.anim){ st.anim = null; chatPlanifier(V, o, 1500); }
}
function chatPlanifier(V, o, ms){
  var st = chatEtat(V, o);
  if(st.t) clearTimeout(st.t);
  st.t = apres(V, ms, function(){ st.t = null; chatAgir(V, o); });
}
function chatsDemarrer(V){
  chatsDe(V).forEach(function(o){ chatPose(V, o, chatEtat(V, o).pose); chatPlanifier(V, o, 2000 + Math.random() * 3000); });
  /* (un chat de l'autre pièce reviendra par l'arche, un peu plus tard : Romain, 5 novembre, 12 h 31) */
  chatsTous(V).forEach(function(o){ if(salleDe(o) !== V.salle) chatPlanifierRetour(V, o); else delete RETOUR_MEMO[o.id]; });
}

/* ---------- Se déplacer : marcher ou sauter, de là où il est jusqu'à la nouvelle place ---------- */
function chatBouger(V, o, pos, mode, fin){
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(!d || V.arrete){ if(fin) fin(); return; }
  var p0 = chatPos(V, o);
  st.pos = pos;
  var p1 = chatPos(V, o), dx = p1.x - p0.x, dy = p1.y - p0.y, dist = Math.hypot(dx, dy);
  if(dist < 3){ placerEl(V, o); if(fin) fin(); return; }
  if(Math.abs(dx) > 2 + Math.abs(dy) * 0.2) st.gauche = dx < 0;      /* (presque tout droit vers le fond ou vers nous : elle garde son côté) */
  d.classList.toggle('at-c-gauche', st.gauche);
  chatPose(V, o, mode);
  placerEl(V, o);
  var k = V.k, tx = -dx * k, ty = -dy * k, kf, dur, plan = null, rig = pantinDe(V, o), ech = (p1.s || 1) * MP.ECH;
  /* sa direction (une des huit vues du pantin : de dos si elle s'éloigne, de face si elle vient vers nous) et le vrai chemin à faire
     (la profondeur compte plus qu'elle ne se voit à l'écran) */
  var dprof = (mode === 'saute' ? chatProfondeur(p1) - chatProfondeur(p0) : dy) / CHAT_PROF, vrai = Math.hypot(dx, dprof);
  var dir = Math.abs(dx) + Math.abs(dprof) < 14 ? undefined : MP.direction(dx, dprof);
  function tr(x, y, s){ return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')'; }
  d.style.zIndex = Math.round(Math.max(p0.z, p1.z) * 5) + 6;
  if(mode === 'saute'){
    /* le saut (16 novembre au soir, Romain : « je veux pas que ça soit une seule image ») : elle se ramasse sur place et remue les fesses (pre),
       vole en cloche (vol), se réceptionne (post) ; le pantin joue ses gestes sur la même horloge. Jamais deux sauts pareils (MP.planSaut). */
    plan = MP.planSaut(dist, -dy);
    if(MOINS_MOUV){ plan.pre = 0; plan.post = 0; }
    var arc = (Math.abs(dy) * 0.3 + 46) * plan.cloche, T = plan.pre + plan.vol + plan.post, i, v;
    kf = [{transform:tr(tx, ty, p0.s), offset:0}];
    for(i = 0; i <= 10; i++){ v = i / 10; kf.push({transform:tr(tx * (1 - v), ty * (1 - v) - arc * k * 4 * v * (1 - v), p0.s + (p1.s - p0.s) * v), offset:(plan.pre + plan.vol * v) / T}); }
    kf.push({transform:tr(0, 0, p1.s), offset:1});
    dur = T; plan.dx = dx; plan.dy = dy; plan.haut = arc; plan.d = T; plan.dir = dir;
  } else {
    kf = [{transform:tr(tx, ty, p0.s)}, {transform:tr(0, 0, p1.s)}];
    dur = Math.max(st.vite > 1 ? 200 : 380, vrai / (CHAT_VITESSE * (st.vite || 1)) * 1000);   /* (st.vite : elle court après un jouet) */
  }
  var a = anim(d, kf, {duration:dur, easing:'linear'});
  st.anim = a;
  st.mv = {p0:{x:p0.x, y:p0.y}, p1:{x:p1.x, y:p1.y}, mode:mode, dur:dur};
  if(rig && a && !MOINS_MOUV){
    var temps = function(){ return typeof a.currentTime === 'number' ? a.currentTime : null; };
    if(plan){ plan.temps = temps; rig.saut(plan); }
    /* la marche : le pantin sait le chemin à faire dans ses mesures à lui, et où on en est : ses pattes ne patinent pas */
    else rig.marcher({dist:vrai / ech, vit:vrai / ech / (dur / 1000), dir:dir, prog:function(){ var t = temps(); return t === null ? null : t / dur; }});
  }
  function fini(){
    if(st.anim !== a) return;
    st.anim = null;
    if(rig && !plan) rig.arretMarche();
    if(V.arrete) return;
    d.style.zIndex = Math.round(p1.z * 5);
    if(fin) fin();
  }
  if(a) a.onfinish = fini; else fini();
}
/* Un point du plancher (on reste dans la pièce) */
function chatSol(V, x, y){
  y = borne(y, SOL_MIN + 20, solMax(V));
  return {x:borne(x, solXmin(V, y) + 50, solXmax(V, y) - 50), y:y, sur:null};
}
/* Sous les boutons du bas de l'écran (le lit, 🐾 et 📷 à gauche ; le carton 📦 à droite) ? Là, on ne pourrait ni bien la voir ni la toucher.
   (Là où est la vue en ce moment : sur un téléphone, la pièce glisse sous les boutons.) */
function sousBoutons(V, x, y){
  if(!V.k || !V.vw || !V.pan || !V.vb) return false;
  var sx = (x - V.vb.x0) * V.k - V.pan.x, sy = (y - V.vb.y0) * V.k - V.pan.y;
  return sy > V.vh - 104 && (sx < 236 || sx > V.vw - 96);
}
/* Les cartons pas encore ouverts de la pièce : leurs boîtes [x0, y0, x1, y1]. Ils sont posés tout devant : ils cachent ce qui est derrière eux. */
function boitesCartons(V){
  return cartonsIci(V).map(function(k, i){ var tk = CARTON_TAILLE[k.t] || CARTON_TAILLE.carton, pk = POS_CARTONS[i % POS_CARTONS.length]; return [pk[0] - tk[0] / 2, pk[1] - tk[1], pk[0] + tk[0] / 2, pk[1]]; });
}
/* Assis là, serait-il caché derrière le chaudron, l'établi, un grand meuble ou un carton — ou sous les boutons ? (on ne choisit pas ces places-là) */
function chatCache(V, x, y){
  if(sousBoutons(V, x, y)) return true;
  var s = echelleSol(y), cx0 = x - 45 * s, cx1 = x + 45 * s, cy0 = y - 80 * s, aire = (cx1 - cx0) * (y - cy0);
  var bx = boitesCartons(V).filter(function(b){ return b[3] > y; });
  ici(V).forEach(function(o){
    if(o.sur || o.t === 'chat' || o.t === 'tapis') return;
    var c = catDe(o);
    if(c.z !== 'sol') return;
    var p = posObj(V, o);
    if(p.y > y) bx.push(boite(o, p));
  });
  return bx.some(function(b){
    var w = Math.min(cx1, b[2]) - Math.max(cx0, b[0]), h = Math.min(y, b[3]) - Math.max(cy0, b[1]);
    return w > 0 && h > 0 && w * h > aire * 0.45;
  });
}
/* Un point du plancher où on le voit */
function chatSolVisible(V){
  for(var i = 0; i < 12; i++){
    var y = SOL_MIN + 40 + Math.random() * (solMax(V) - SOL_MIN - 60);
    var p = chatSol(V, solXmin(V, y) + 60 + Math.random() * Math.max(10, solXmax(V, y) - solXmin(V, y) - 120), y);
    if(!chatCache(V, p.x, p.y)) return p;
  }
  var y2 = solMax(V) - 10;
  return chatSol(V, solXmin(V, y2) + 80 + Math.random() * Math.max(10, solXmax(V, y2) - solXmin(V, y2) - 160), y2);
}
/* Là où il est : sur un meuble ? */
function chatSurMeuble(V, o){ var st = chatEtat(V, o); return !!(st.pos ? st.pos.sur : o.sur); }
/* Une suite de pas : descendre du meuble si besoin, marcher jusqu'au pied du meuble visé, sauter dessus.
   L'arbre à chat, on y monte et on en descend de plateforme en plateforme (Romain, 5 novembre, 12 h 31 : « qu'il puisse monter dessus ») */
function chatAller(V, o, cible, fin){
  var etapes = [], st0 = chatEtat(V, o), la = st0.pos ? st0.pos.sur : o.sur, aL = surArbre(V, la), aV = surArbre(V, cible.sur), k;
  if(aL && aL === aV){                                 /* déjà sur cet arbre : d'une plateforme à l'autre */
    for(k = la.k; k !== cible.sur.k; ){ k += cible.sur.k > k ? 1 : -1; etapes.push(['saute', {sur:k === cible.sur.k ? cible.sur : platArbre(aL, k)}]); }
  } else {
    if(chatSurMeuble(V, o)){
      var p = chatPos(V, o);
      if(aL){                                          /* il descend de l'arbre : plateforme par plateforme, puis par terre, devant */
        for(k = la.k - 1; k >= 0; k--) etapes.push(['saute', {sur:platArbre(aL, k)}]);
        var pa = posObj(V, aL);
        etapes.push(['saute', chatSol(V, pa.x + (platArbre(aL, 0).dx - 34) * pa.s, Math.min(solMax(V), pa.y + 36))]);
      } else etapes.push(['saute', chatSol(V, p.x + (Math.random() < 0.5 ? -50 : 50), Math.max(p.y + 40, SOL_MIN + 50))]);
    }
    if(cible.sur){
      var pv = aV ? posObj(V, aV) : null, dep = aV ? {x:pv.x + platArbre(aV, 0).dx * pv.s, y:Math.min(solMax(V), pv.y + 28)} : cible.depart;
      etapes.push(['marche', chatSol(V, dep.x, dep.y)]);
      if(aV) for(k = 0; k < cible.sur.k; k++) etapes.push(['saute', {sur:platArbre(aV, k)}]);   /* il grimpe : la plus basse d'abord */
      etapes.push(['saute', {sur:cible.sur}]);
    } else etapes.push(['marche', cible]);
  }
  (function suite(i){
    var st = chatEtat(V, o);
    if(V.arrete || st.tenu) return;
    if(st.touche){ st.touche = false; chatEndormir(V, o); return; }      /* touché pendant un saut : il atterrit puis se roule en boule */
    if(i >= etapes.length){ if(fin) fin(); return; }
    chatBouger(V, o, etapes[i][1], etapes[i][0], function(){ suite(i + 1); });
  })(0);
}
/* Les meubles où il peut sauter (pas trop haut) */
function surfacesChat(V){
  var l = [];
  ici(V).forEach(function(p){
    if(p.sur || p.t === 'chat' || p.cote) return;
    var c = catDe(p);
    if(!c.surf) return;
    var pp = posObj(V, p);
    c.surf.forEach(function(sf, k){
      var dx = Math.round((sf.x0 + sf.x1) / 2 + (Math.random() - 0.5) * (sf.x1 - sf.x0) * 0.4);
      var dep = c.z === 'mur' ? {x:pp.x + dx * pp.s, y:SOL_MIN + 40} : {x:pp.x + dx * pp.s, y:Math.min(solMax(V), pp.y + 28)};
      var h = dep.y - (pp.y + sf.y * pp.s);
      if(h > 20 && h < 430) l.push({sur:{o:p.id, k:k, dx:dx}, depart:dep});
    });
  });
  return l;
}

/* ---------- Ce qu'il a envie de faire ---------- */
function chatAgir(V, o){
  var st = chatEtat(V, o);
  if(V.arrete || !V.parId[o.id] || salleDe(o) !== V.salle) return;     /* (un chat de l'autre pièce attend qu'on y aille) */
  if(V.mode !== 'ranger' || V.glisse || st.tenu || st.anim){ chatPlanifier(V, o, 2500); return; }
  /* (on la caresse, on joue avec elle, elle prend son bain : c'est le jeu qui la mène) */
  if(st.caresse || (V.jouet && V.jouet.o === o) || (V.bain && V.bain.o === o)){ chatPlanifier(V, o, 1500); return; }
  var now = Date.now();
  if(st.pose === 'dort'){
    if(now < st.dortJusqua){ chatPlanifier(V, o, st.dortJusqua - now + 30); return; }
    chatPose(V, o, 'assis');                       /* il se réveille et s'étire */
    st.reveil = true;
    apres(V, 500, function(){ var s2 = V.chats[o.id]; if(s2 && s2.pose === 'assis' && !s2.caresse && !s2.anim){ chatPose(V, o, 'marche'); gesteChat(V, o, 'etire'); } });   /* (elle s'étire pour de bon) */
    chatPlanifier(V, o, 2900);
    return;
  }
  var suite = function(ms){ chatPose(V, o, 'assis'); chatPlanifier(V, o, ms || (2200 + Math.random() * 2800)); };
  st.vite = 1;                                    /* (une course interrompue : elle repart au pas) */
  if(tamaAgir(V, o)) return;                      /* ses besoins d'abord (manger, boire, dormir, demander) ; le chaton joue */
  /* de temps en temps, elle joue toute seule (plus souvent quand elle est heureuse) : un bond, une galipette, sa queue… jamais le même jeu
     deux fois de suite. Ça ne compte pas pour son besoin de jouer : c'est pour le plaisir de la regarder (Romain, 16 novembre au soir). */
  if(!o.chaton && !chatSurMeuble(V, o) && Math.random() < 0.07 + bonheur(o) / 900){ chatJoue(V, o, null, true); return; }
  /* l'arbre à chat de la pièce : il y grimpe, il joue avec la boule, il s'y fait les griffes ;
     de temps en temps, il va faire un tour dans l'autre pièce, par l'arche (Romain, 5 novembre, 12 h 31) */
  if(arbreIci(V) && Math.random() < 0.25 && chatArbre(V, o)) return;
  if(Math.random() < 0.3 && chatParc(V, o)) return;      /* son parc à chat : le tunnel, le hamac, la souris sur ressort, la cabane, le toboggan */
  if(Math.random() < PASSAGE.chance && peutPasser(V, o)){ chatPasse(V, o); return; }
  var r = Math.random() * (st.reveil ? 0.87 : 1);   /* pas de sieste juste après s'être réveillé */
  st.reveil = false;
  if(r < 0.27){                                   /* une petite promenade */
    chatAller(V, o, chatSolVisible(V), function(){ suite(); });
  } else if(r < 0.5){                             /* il saute sur un meuble */
    var l = surfacesChat(V);
    if(!l.length){ suite(); return; }
    chatAller(V, o, l[Math.floor(Math.random() * l.length)], function(){ suite(); });
  } else if(r < 0.61 && V.parId.lu && !V.parId.lu.sur && salleDe(V.parId.lu) === V.salle){   /* il s'installe sur le grimoire… */
    var pl = posObj(V, V.parId.lu);
    chatAller(V, o, {sur:{o:'lu', k:0, dx:0}, depart:{x:pl.x + 70, y:Math.min(solMax(V), pl.y + 26)}}, function(){ chatPose(V, o, 'lave'); chatPlanifier(V, o, 5000 + Math.random() * 4000); });
  } else if(r < 0.73){                            /* il tape un bocal */
    var b = ici(V).filter(function(x){ return x.t === 'bocaux' || x.t === 'fioles_ingr'; })[0];
    if(!b){ suite(); return; }
    var pb = posObj(V, b), cible;
    if(catDe(b).z === 'mur' || b.cote) cible = chatSol(V, pb.x + (pb.x > 600 ? -80 : 80), SOL_MIN + 60);
    else if(b.sur && V.parId[b.sur.o] && !V.parId[b.sur.o].sur && !V.parId[b.sur.o].cote && (catDe(V.parId[b.sur.o]).surf || [])[b.sur.k]){
      var sfs = catDe(V.parId[b.sur.o]).surf[b.sur.k];
      var dx = b.sur.dx + (b.sur.dx > (sfs.x0 + sfs.x1) / 2 ? -95 : 95);
      cible = {sur:{o:b.sur.o, k:b.sur.k, dx:Math.round(borne(dx, sfs.x0 + 20, sfs.x1 - 20))},
        depart:{x:pb.x, y:catDe(V.parId[b.sur.o]).z === 'mur' ? SOL_MIN + 40 : Math.min(solMax(V), posObj(V, V.parId[b.sur.o]).y + 28)}};
    } else {
      cible = chatSol(V, pb.x + 95, pb.y + 4);
      if(chatCache(V, cible.x, cible.y)) cible = chatSol(V, pb.x - 95, pb.y + 4);
      if(chatCache(V, cible.x, cible.y)){ suite(); return; }
    }
    chatAller(V, o, cible, function(){
      var p = chatPos(V, o), d2 = V.elO[o.id];
      st.gauche = pb.x < p.x;
      if(d2) d2.classList.toggle('at-c-gauche', st.gauche);
      chatPose(V, o, 'tape');
      var jar = V.elO[b.id];
      if(jar) anim(jar, [0, -5, 4, -3, 2, 0].map(function(a){ return {transform:'scale(' + jar._s + ') rotate(' + a + 'deg)'}; }), {duration:900, delay:350, iterations:2});
      son(V, 'tic');
      chatPlanifier(V, o, 2600);
    });
  } else if(r < 0.87){                            /* il se lèche la patte */
    chatPose(V, o, 'lave');
    chatPlanifier(V, o, 3000 + Math.random() * 2000);
  } else if(!chatSieste(V, o)){                   /* une petite sieste (souvent dans un de ses coins) */
    chatSeCoucher(V, o);
    st.dortJusqua = now + 12000 + Math.random() * 9000;
    chatPlanifier(V, o, st.dortJusqua - now + 30);
  }
}

/* ---------- Un petit toucher : elle réagit tout de suite, au hasard, jamais deux fois pareil de suite ----------
   (Romain, 16 novembre : « à chaque fois qu'on appuie sur Mimi, tout de suite, elle réagit à notre doigt, mais de façon aléatoire ;
   il y a plusieurs trucs juste en appuyant une fois ».) Si elle dort : elle frémit d'une oreille, ou elle se réveille en bâillant. */
var REACTIONS = ['coeurs', 'miaou', 'oreille', 'cligne', 'penche', 'trille', 'queue', 'eternue', 'roule', 'leche', 'sautille'];
function expression(V, o, cls, ms){
  var d = V.elO[o.id];
  if(!d) return;
  cls.split(' ').forEach(function(c){ d.classList.add(c); clearTimeout(d['_x' + c]); d['_x' + c] = apres(V, ms, function(){ d.classList.remove(c); }); });
}
function chatToucher(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || st.depart || st.tenu) return;
  /* (un câlin d'un toucher : un tout petit peu de bonheur, pas plus de six fois par minute — on ne remplit pas sa jauge en tapotant) */
  var now = Date.now();
  V.taps = (V.taps || []).filter(function(t){ return now - t < 60000; });
  if(V.taps.length < 6){ V.taps.push(now); donner(o, 'amour', 3); bhPlus(o, 0.3); majBarre(V); changer(V); }
  if(st.pose === 'dort'){ reveilChat(V, o); return; }
  if(st.anim && st.mv && st.mv.mode === 'saute'){ coeursChat(V, o); return; }   /* en l'air : elle finit son saut */
  if(st.anim) chatArreter(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  var p = st.pose, couche = p === 'dos' || p === 'pain', dressee = p === 'griffe' || p === 'boule';
  if(dressee){ coeursChat(V, o); sonMimi(V, 'trille'); chatPlanifier(V, o, 2400); return; }
  if(!couche && p !== 'assis') chatPose(V, o, 'assis');
  var l = REACTIONS.filter(function(r){
    if(r === st.derniereReac) return false;
    if(r === 'roule') return !couche && !chatSurMeuble(V, o);
    if(r === 'leche' || r === 'sautille') return !couche;
    return true;
  });
  var r = st.derniereReac = l[Math.floor(Math.random() * l.length)];
  reagir(V, o, r);
  chatPlanifier(V, o, 2800);
}
function reagir(V, o, r){
  var st = chatEtat(V, o);
  if(r === 'coeurs'){ coeursChat(V, o); son(V, 'magie'); expression(V, o, 'at-x-clos', 900); }
  else if(r === 'miaou'){ expression(V, o, 'at-x-miaou', 800); sonMimi(V, 'miaou'); flotter(V, o, 'Miaou !'); }
  else if(r === 'oreille'){ expression(V, o, 'at-x-oreille', 900); son(V, 'tic'); }
  else if(r === 'cligne'){ expression(V, o, 'at-x-cligne', 1500); sonMimi(V, 'ronron'); apres(V, 700, function(){ coeursChat(V, o); }); }
  else if(r === 'penche'){ expression(V, o, 'at-x-penche', 1300); flotter(V, o, '?'); sonMimi(V, 'trille'); }
  else if(r === 'trille'){ expression(V, o, 'at-x-content at-x-miaou', 500); flotter(V, o, 'Mrrrp ?'); sonMimi(V, 'trille'); }
  else if(r === 'queue'){ expression(V, o, 'at-x-queue', 1500); son(V, 'tic'); }
  else if(r === 'eternue'){ expression(V, o, 'at-x-eternue', 700); apres(V, 220, function(){ flotter(V, o, 'Atchoum !'); sonMimi(V, 'atchoum'); }); }
  else if(r === 'leche'){ expression(V, o, 'at-x-langue at-x-clos', 1300); son(V, 'tic'); }
  else if(r === 'sautille'){ expression(V, o, 'at-x-content at-x-joue', 700); coeursChat(V, o); sonMimi(V, 'trille'); }
  else if(r === 'roule'){                                      /* elle se laisse tomber sur le dos… puis se relève */
    var avant = st.pose;
    chatPose(V, o, 'dos'); expression(V, o, 'at-x-content', 600); sonMimi(V, 'roule');
    apres(V, 1900, function(){ var s2 = chatEtat(V, o); if(s2.pose === 'dos' && !s2.caresse && !s2.tenu) chatPose(V, o, avant === 'dos' ? 'assis' : avant); });
  }
}
/* Elle dort et on la touche : une oreille frémit (elle dort toujours), ou elle se réveille, bâille et s'étire */
function reveilChat(V, o){
  var st = chatEtat(V, o);
  if(Math.random() < 0.45 && !st.frem){ st.frem = 1; expression(V, o, 'at-x-oreille', 900); son(V, 'tic'); flotter(V, o, 'zzz…'); return; }
  st.frem = 0; st.dortJusqua = 0;
  chatPose(V, o, 'assis'); expression(V, o, 'at-x-baille', 1300); sonMimi(V, 'baille');
  if(st.t){ clearTimeout(st.t); st.t = null; }
  apres(V, 1400, function(){ if(chatEtat(V, o).pose === 'assis' && !chatEtat(V, o).caresse) chatJoue(V, o, 'etire'); });
}
function chatEndormir(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id];
  placerEl(V, o);
  if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
  chatPose(V, o, 'dort');
  st.dortJusqua = Date.now() + CHAT_SIESTE_TOUCHE;
  chatPlanifier(V, o, CHAT_SIESTE_TOUCHE + 30);
}
function coeursChat(V, o, ic){
  var p = chatPos(V, o);
  for(var i = 0; i < 3; i++){
    var h = document.createElement('span'); h.className = 'at-coeur-vole'; h.textContent = ic || '💜';
    h.style.left = pX(V, p.x + (i - 1) * 26); h.style.top = pY(V, p.y - 104 * p.s);
    h.style.animationDelay = (i * 0.15) + 's';
    V.calque.appendChild(h);
    (function(h){ apres(V, 1500, function(){ h.remove(); }); })(h);
  }
}
/* L'enfant l'attrape pour le poser ailleurs : sa place du moment devient sa place à lui */
function chatSaisi(V, o){
  var st = chatEtat(V, o);
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  st.touche = false;
  if(st.pos){
    if(st.pos.sur) o.sur = {o:st.pos.sur.o, k:st.pos.sur.k, dx:st.pos.sur.dx};
    else { o.sur = null; o.x = st.pos.x; o.y = st.pos.y; }
    st.pos = null;
    placerEl(V, o);
  }
  st.tenu = true;
}
/* Peut-on l'emmener, là, tout de suite ? Pas quand elle est occupée ailleurs (elle sort, elle passe, elle est dans sa cabane : st.tenu),
   ni avec la brosse en main, dans son bain ou en plein jeu. */
/* caressee : le doigt la caressait et s'éloigne — il faut alors que ce soit bien LUI qui s'en aille : elle n'a pas bougé depuis le
   début des caresses (C.ou), et elle n'est pas en train de bondir ou de marcher toute seule. */
function chatPortable(V, o, caressee){
  var st = chatEtat(V, o);
  if(st.tenu || st.depart || st.passe || st.cabane || st.chasse || V.outil || V.bain || V.jouet || GUIDE || V.mode !== 'ranger' || V.arrete) return false;
  if(!caressee) return !st.anim;
  var C = st.caresse, p = C && C.ou ? chatPos(V, o) : null;
  return !!p && !st.anim && Math.abs(p.x - C.ou.x) + Math.abs(p.y - C.ou.y) < 8;
}
/* On la soulève : une sieste s'arrête là (un petit bâillement), elle se laisse porter, les yeux tout ronds */
function chatPortee(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id], dort = st.pose === 'dort';
  st.dortJusqua = 0; st.reveil = false;
  if(st.pose !== 'assis') chatPose(V, o, 'assis');
  if(d) d.classList.add('at-c-portee');
  if(dort){ expression(V, o, 'at-x-baille', 900); sonMimi(V, 'baille'); }
  else sonMimi(V, 'trille');
}
function chatLache(V, o){
  var st = chatEtat(V, o), dp = V.elO[o.id];
  if(dp) dp.classList.remove('at-c-portee');
  st.tenu = false;
  st.pos = null;
  /* (étape 2) posée dans un de ses coins douillets (son panier, un coussin, l'arbre à chat…) : elle pétrit un peu, tourne sur elle-même
     et s'endort. C'est comme ça qu'on lui offre « une sieste douillette » (si c'est son envie du moment : pile poil). */
  var par = o.sur && V.parId[o.sur.o];
  if(par && DODO_ICI.test(par.t) && st.pose !== 'dort' && !o.chaton && !st.depart){
    chatPose(V, o, 'assis'); expression(V, o, 'at-x-petrit at-c-ronron', 1300); sonMimi(V, 'ronron');
    chatPlanifier(V, o, 20000);
    apres(V, 1350, function(){
      var s2 = V.chats[o.id];
      if(!s2 || s2.tenu || s2.caresse || s2.anim || s2.depart || s2.pose !== 'assis' || (V.jouet && V.jouet.o === o)) return;
      if(s2.pos || !o.sur || o.sur.o !== par.id) return;      /* (entre-temps, on l'a reprise et posée ailleurs) */
      chatSeCoucher(V, o);
      s2.dortJusqua = Date.now() + 14000 + Math.random() * 6000;
      chatPlanifier(V, o, s2.dortJusqua - Date.now() + 30);
      apres(V, 1800, function(){ dodoCoin(V, o, true); });
    });
    return;
  }
  if(st.pose !== 'dort') chatPose(V, o, 'assis');
  chatPlanifier(V, o, st.pose === 'dort' ? Math.max(1000, st.dortJusqua - Date.now()) : 3500);
}

/* ==========================================================
   L'arbre à chat (Romain, 5 novembre, 12 h 31 : « Qu'il puisse monter dessus, jouer avec la boule,
   gratter ses pattes sur les colonnes verticales de l'arbre à chat. »)
   Quand un arbre à chat est dans sa pièce, il y va de temps en temps (chatAgir), jamais deux fois de suite pour la même chose :
   - grimpe : de plateforme en plateforme jusqu'en haut (chatAller), puis il s'y couche ou s'y assoit ;
   - boule : sous la boule qui pend, il se dresse et la tape de la patte, elle se balance ;
   - griffe : dressé contre une colonne, il s'y fait les griffes (ses pattes montent et descendent, des traces, des copeaux).
   Moins de mouvement demandé (MOINS_MOUV) : juste la pose, sans sauts ni balancement.
   ========================================================== */
var ARBRE = {poteaux:[[46, 174, 282], [132, 14, 282]], boule:[152, 205, -26], griffes:214};   /* (dans le dessin de l'arbre : x, y du haut, y du bas ; la boule : x, y, z depuis le milieu) */
var ARBRE_JEUX = ['grimpe', 'boule', 'griffe'];
function arbreIci(V){ return ici(V).filter(function(x){ return x.t === 'arbre_chat' && !x.sur && !x.cote; })[0] || null; }
function surArbre(V, sur){ var a = sur && V.parId[sur.o]; return a && a.t === 'arbre_chat' && !a.sur ? a : null; }
function platArbre(a, k){ var sf = catDe(a).surf[k]; return {o:a.id, k:k, dx:Math.round((sf.x0 + sf.x1) / 2)}; }
/* un point du dessin de l'arbre (x, y locaux ; z : la profondeur, le milieu par défaut), à l'écran */
function ptArbre(V, a, lx, ly, lz){
  var R = posObj(V, a).R, q = mondeDe(R, lx, ly, lz === undefined ? (catDe(a).p || 40) / 2 : lz), e = proj(q[0], q[1], q[2]);
  return {x:e[0], y:e[1]};
}
/* (toujours là, à sa pose, dans la pièce dessinée : sinon le jeu s'arrête) */
function enJeu(V, o, d, pose){ var st = V.chats[o.id]; return !!(st && !st.tenu && !st.anim && !V.arrete && V.elO[o.id] === d && st.pose === pose && salleDe(o) === V.salle); }
function chatArbre(V, o, quoi){
  var a = arbreIci(V), st = chatEtat(V, o);
  if(!a || !V.elO[o.id] || st.tenu || st.anim || st.depart || salleDe(o) !== V.salle) return null;
  var l = ARBRE_JEUX.filter(function(j){ return j !== st.dernierArbre; });
  quoi = ARBRE_JEUX.indexOf(quoi) >= 0 ? quoi : l[Math.floor(Math.random() * l.length)];
  st.dernierArbre = quoi;
  if(quoi === 'grimpe') arbreGrimper(V, o, a);
  else if(quoi === 'boule') arbreBoule(V, o, a);
  else arbreGriffer(V, o, a);
  return quoi;
}
/* Il grimpe (le plus souvent tout en haut) ; là-haut, il se couche un moment ou il s'assoit et regarde la pièce */
function arbreGrimper(V, o, a){
  var st = chatEtat(V, o), n = catDe(a).surf.length, k = Math.random() < 0.65 ? n - 1 : n - 2;
  chatAller(V, o, {sur:platArbre(a, k), depart:{x:0, y:0}}, function(){
    if(Math.random() < 0.5){ chatPose(V, o, 'dort'); st.dortJusqua = Date.now() + 9000 + Math.random() * 7000; chatPlanifier(V, o, st.dortJusqua - Date.now() + 30); }
    else { chatPose(V, o, Math.random() < 0.5 ? 'lave' : 'assis'); chatPlanifier(V, o, 4000 + Math.random() * 3000); }
    donner(o, 'jeu', 5); majHumeur(V, o);
  });
}
/* La boule qui pend sous la plateforme du milieu : elle se balance (sens : 1 tapée depuis la gauche, -1 depuis la droite) */
function balancerBoule(V, a, sens){
  var d = V.elO[a.id], g = d && d.querySelector('.at-ac-boule');
  if(!g || MOINS_MOUV) return;
  anim(g, [0, -30, 22, -13, 7, -3, 0].map(function(x){ return {transform:'rotate(' + (x * (sens || 1)) + 'deg)'}; }), {duration:1600, easing:'ease-out'});
}
function arbreBoule(V, o, a){
  var st = chatEtat(V, o), pa = posObj(V, a), b = ptArbre(V, a, ARBRE.boule[0], ARBRE.boule[1], (catDe(a).p || 40) / 2 + ARBRE.boule[2]);
  var y = Math.min(solMax(V), pa.y + 8), sc = echelleSol(y), c = chatSol(V, b.x - 4 * sc, y);
  chatAller(V, o, c, function(){
    var d = V.elO[o.id];
    if(!d) return;
    st.gauche = b.x < chatPos(V, o).x - 30 * sc;                  /* (la boule est devant lui) */
    d.classList.toggle('at-c-gauche', st.gauche);
    chatPose(V, o, 'assis');                                       /* il la regarde… */
    chatPlanifier(V, o, 4200);
    apres(V, 650, function(){
      if(!enJeu(V, o, d, 'assis')) return;
      chatPose(V, o, 'boule');                                     /* … il se dresse et la tape, trois fois */
      [0, 640, 1280].forEach(function(t){
        apres(V, t, function(){
          if(!enJeu(V, o, d, 'boule')) return;
          apres(V, 220, function(){ if(enJeu(V, o, d, 'boule')){ balancerBoule(V, a, st.gauche ? -1 : 1); son(V, 'tic'); } });
        });
      });
      apres(V, 2050, function(){ if(enJeu(V, o, d, 'boule')){ chatPose(V, o, 'assis'); donner(o, 'jeu', 10); majHumeur(V, o); } });
    });
  });
}
/* Des traces de griffes sur la colonne (et quelques copeaux qui tombent) : juste devant l'arbre, derrière le chat */
function griffures(V, a, x, y, s){
  var e = document.createElement('div'), dA = V.elO[a.id];
  e.className = 'at-griffures';
  e.style.left = pX(V, x - 17 * s); e.style.top = pY(V, y - 20 * s); e.style.width = pW(V, 34 * s); e.style.height = pH(V, 40 * s);
  e.style.zIndex = dA ? (parseInt(dA.style.zIndex, 10) || 0) + 1 : 5;
  e.innerHTML = '<svg viewBox="0 0 28 34" aria-hidden="true"><path d="M6,3 L9,29 M14,1 L16,31 M22,3 L23,27"/></svg><i></i><i></i><i></i>';
  V.scene.appendChild(e);
  apres(V, 1700, function(){ e.remove(); });
}
function arbreGriffer(V, o, a){
  var st = chatEtat(V, o), pa = posObj(V, a), y = Math.min(solMax(V), pa.y + 12), sc = echelleSol(y);
  /* la colonne de gauche, lui à gauche (il regarde à droite) ; contre un mur, la grande colonne, lui à droite */
  var q = ARBRE.poteaux[0], pt = ptArbre(V, a, q[0], q[2]), droite = true, x = pt.x - 6 * sc, c = chatSol(V, x, y);
  if(Math.abs(c.x - x) > 8){ q = ARBRE.poteaux[1]; pt = ptArbre(V, a, q[0], q[2]); droite = false; c = chatSol(V, pt.x + 6 * sc, y); }
  chatAller(V, o, c, function(){
    var d = V.elO[o.id];
    if(!d) return;
    st.gauche = !droite; d.classList.toggle('at-c-gauche', st.gauche);
    chatPose(V, o, 'griffe');
    chatPlanifier(V, o, 4300);
    var h = ptArbre(V, a, q[0], ARBRE.griffes, (catDe(a).p || 40) / 2 - 11);
    [250, 1050].forEach(function(t){ apres(V, t, function(){ if(enJeu(V, o, d, 'griffe')){ griffures(V, a, h.x, h.y, pa.s); son(V, 'tic'); } }); });
    apres(V, 2300, function(){ if(enJeu(V, o, d, 'griffe')){ chatPose(V, o, 'lave'); donner(o, 'jeu', 6); majHumeur(V, o); } });   /* puis il se lèche la patte */
  });
}

/* ==========================================================
   Il va faire un tour dans l'autre pièce, par l'arche (Romain, 5 novembre, 12 h 31 : « que le chat il puisse aller dans l'autre pièce aussi »)
   - De temps en temps (chatAgir ; au plus une fois toutes les 90 secondes), s'il n'a besoin de rien : il marche jusqu'à l'arche et passe de l'autre côté.
   - Là-bas (la pièce qu'on ne voit pas), il attend ; il revient au bout d'un moment (plus sûrement s'il a besoin de quelque chose), par l'arche.
     Si on va le voir, il est là, devant l'arche.
   - Jamais quand on le tient, quand on déplace un meuble, pendant une potion (V.mode 'prep'), pendant le guidage du tutoriel,
     ni pendant une sortie par la chatière ; pas dans les bancs d'essai (sansSurprise).
   - Dans l'état : o.pc dit sa pièce ; sa place à lui (o.x, o.y) devient un point du plancher de cette pièce, devant l'arche : il ne se perd jamais.
   ========================================================== */
var PASSAGE = {entre:90000, ailleurs:22000, plus:26000, chance:0.07};
var PASSAGE_T = Date.now();     /* le dernier passage (il tient d'un remontage de la vue à l'autre) */
var RETOUR_MEMO = {};           /* … et quand le chat d'à côté reviendra (par chat) */
/* Le point du plancher devant l'arche, dans la pièce s (à droite dans l'atelier, à gauche dans la chambre) ; dans : un pas dans l'arche */
function devantArche(V, s, dans){
  var zc = (ARCHE.z0 + ARCHE.z1) / 2, X = s ? murG(V) + (dans ? -30 : 70) : murD(V) - (dans ? -30 : 70), q = proj(X, 0, zc);
  return dans ? {x:q[0], y:q[1], sur:null} : chatSol(V, q[0], q[1]);
}
function peutPasser(V, o){
  var st = V.chats[o.id];
  return !GUIDE && !V.arrete && !V.o.sansSurprise && V.mode === 'ranger' && !V.glisse && !V.ouvert && V.grim.hidden && !!st && !st.tenu && !st.anim && !st.depart && !st.chasse &&
    !!V.elO[o.id] && salleDe(o) === V.salle && !tama(V).butin && !besoinUrgent(o) && Date.now() - PASSAGE_T > PASSAGE.entre;
}
/* Il change de pièce (dans l'état) : sa place à lui est devant l'arche de là-bas, par terre,
   et entre les murs de la pièce la plus étroite (un téléphone en hauteur : murs à 70 et LARGEUR - 70), quel que soit l'écran */
function chatDansPiece(V, o, s){
  if(s) o.pc = 1; else delete o.pc;
  var a = devantArche(V, s), y = borne(a.y, SOL_MIN + 20, SOL_MAX), m = 60, st = chatEtat(V, o);
  o.sur = null; if(o.cote) o.cote = 0;
  o.x = Math.round(borne(a.x, xF(70, y) + m, xF(LARGEUR - 70, y) - m) * 10) / 10; o.y = Math.round(y * 10) / 10;
  st.pos = null;
}
function chatPasse(V, o){
  var st = chatEtat(V, o), s = V.salle, id = (V.passeN = (V.passeN || 0) + 1);
  PASSAGE_T = Date.now();
  st.passeId = id;
  chatAller(V, o, devantArche(V, s), function(){
    var d = V.elO[o.id];
    /* (entre-temps : on l'a pris, on déplace un meuble, une potion commence, le guidage… il reste ici) */
    if(st.passeId !== id || !d || V.arrete || V.mode !== 'ranger' || V.glisse || st.tenu || st.depart || GUIDE || salleDe(o) !== V.salle){ if(d && !st.tenu) chatPose(V, o, 'assis'); chatPlanifier(V, o, 2600); return; }
    var p = chatPos(V, o), q = devantArche(V, s, true), k = V.k, vers = 1 - s;
    if(st.t){ clearTimeout(st.t); st.t = null; }
    st.gauche = q.x < p.x; d.classList.toggle('at-c-gauche', st.gauche);
    chatPose(V, o, 'marche');
    st.tenu = true; st.passe = true; d.classList.add('at-c-passe');
    chatDansPiece(V, o, vers);
    changer(V);
    anim(d, [{transform:'translate(0,0) scale(' + d._s + ')', opacity:1}, {transform:'translate(' + ((q.x - p.x) * k).toFixed(1) + 'px,' + ((q.y - p.y) * k).toFixed(1) + 'px) scale(' + (d._s * 0.92).toFixed(3) + ')', opacity:0}], {duration:700, easing:'ease-in', fill:'forwards'});
    var t = nomChat(o) + (vers ? ' va faire un tour dans la chambre.' : ' va faire un tour dans l\'atelier.');
    if(V.toastEl.hidden) toast(V, '<b>🐈 ➡️ ' + (vers ? '🛏️' : '⚗️') + '</b> ' + esc(t), 3000, t);      /* (sans cacher un message plus important) */
    apres(V, 720, function(){
      st.tenu = false; st.passe = false;
      if(V.elO[o.id] === d){ delete V.elO[o.id]; d.remove(); }
      chatPose(V, o, 'assis');                                      /* (là-bas, il s'assoit ; si on est passé dans sa pièce entre-temps, il y est déjà) */
      chatPlanifierRetour(V, o, PASSAGE.ailleurs + Math.random() * PASSAGE.plus);
    });
  });
  return true;
}
function chatPlanifierRetour(V, o, ms){
  var st = chatEtat(V, o), due = ms ? Date.now() + ms : (RETOUR_MEMO[o.id] || Date.now() + PASSAGE.ailleurs + Math.random() * PASSAGE.plus);
  RETOUR_MEMO[o.id] = due;
  clearTimeout(st.retourT);
  st.retourT = apres(V, Math.max(1500, due - Date.now()), function(){ st.retourT = null; chatRevient(V, o); });
}
/* Il revient par l'arche, dans la pièce qu'on regarde (force : tout de suite, pour les bancs d'essai) */
function chatRevient(V, o, force){
  var st = chatEtat(V, o);
  if(V.arrete || !V.parId[o.id] || st.depart) return false;
  if(salleDe(o) === V.salle){ delete RETOUR_MEMO[o.id]; return false; }     /* (on est allé le voir : il est là) */
  if(GUIDE || V.mode !== 'ranger' || V.glisse || (!force && !besoinUrgent(o) && Math.random() < 0.35)){ chatPlanifierRetour(V, o, 9000 + Math.random() * 9000); return false; }
  delete RETOUR_MEMO[o.id];
  var s = V.salle, q = devantArche(V, s, true), a = devantArche(V, s), k = V.k;
  chatDansPiece(V, o, s);
  st.pos = a;                                  /* (là où il est : juste devant l'arche de cet écran-ci) */
  if(st.t){ clearTimeout(st.t); st.t = null; }
  if(st.anim){ var a0 = st.anim; st.anim = null; try{ a0.cancel(); }catch(e){} }
  st.dortJusqua = 0; st.pose = 'marche';
  var d = elObjet(V, o);
  V.scene.appendChild(d);
  st.gauche = q.x > a.x; d.classList.toggle('at-c-gauche', st.gauche);
  st.tenu = true; st.passe = true; d.classList.add('at-c-passe');
  changer(V);
  anim(d, [{transform:'translate(' + ((q.x - a.x) * k).toFixed(1) + 'px,' + ((q.y - a.y) * k).toFixed(1) + 'px) scale(' + (d._s * 0.92).toFixed(3) + ')', opacity:0}, {transform:'translate(0,0) scale(' + d._s + ')', opacity:1}], {duration:700, easing:'ease-out'});
  apres(V, 720, function(){
    st.tenu = false; st.passe = false; d.classList.remove('at-c-passe');
    if(V.elO[o.id] !== d || salleDe(o) !== V.salle) return;
    chatAller(V, o, chatSolVisible(V), function(){ chatPose(V, o, 'assis'); chatPlanifier(V, o, 2600); });
  });
  return true;
}

/* ==========================================================
   Ce que Mimi fait dans son parc à chat (17 novembre ; les morceaux : def('tunnel_chat')… ; leur arrivée : PARC, parcDonner).
   quoi : un type de morceau (les robots) ; sinon un morceau de la pièce au hasard, pas deux fois le même de suite.
   ========================================================== */
function parcBouge(V, g, angles, ms, delai){
  var el = V.elO[g.id];
  if(el) anim(el, angles.map(function(a){ return {transform:'scale(' + el._s + ') rotate(' + a + 'deg)'}; }), {duration:ms || 800, delay:delai || 0});
}
function chatParc(V, o, quoi){
  var st = chatEtat(V, o);
  if(o.chaton || !V.elO[o.id] || st.tenu || st.anim || st.depart || salleDe(o) !== V.salle) return null;
  var tous = ici(V).filter(function(g){ return CAT[g.t] && CAT[g.t].parc && !g.sur && !g.cote && !g.dedans && (!quoi || g.t === quoi); });
  var l = tous.filter(function(g){ return g.id !== st.dernierParc; });
  if(!l.length) l = tous;
  if(!l.length) return null;
  var g = l[Math.floor(Math.random() * l.length)], pg = posObj(V, g), s = pg.s, p = chatPos(V, o);
  var sol = function(dx, dy){ return chatSol(V, pg.x + dx * s, Math.min(solMax(V), Math.max(SOL_MIN + 20, pg.y + dy))); };
  var fin = function(ms){ chatPlanifier(V, o, ms); };
  var la = function(){ var s2 = V.chats[o.id]; return !!s2 && !s2.tenu && !s2.caresse && !s2.depart && !!V.parId[g.id] && !!V.elO[o.id] && salleDe(g) === V.salle; };
  var face = function(x){ st.gauche = x < chatPos(V, o).x; var d2 = V.elO[o.id]; if(d2) d2.classList.toggle('at-c-gauche', st.gauche); };
  st.dernierParc = g.id;
  if(g.t === 'tunnel_chat'){
    /* elle s'aplatit, s'engouffre par le bout du fond et ressort par l'autre, celui qui vient vers nous (elle passe derrière la toile :
       on ne la voit plus, on voit le tunnel gigoter) */
    chatAller(V, o, sol(-132, -8), function(){
      if(!la()) return fin(1500);
      var d = V.elO[o.id]; d.classList.add('at-c-tapi');
      parcBouge(V, g, [0, -2, 2, -1.5, 1.5, 0], 1100, 500); sonMimi(V, 'gratte');
      chatBouger(V, o, sol(132, -10), 'marche', function(){
        var d2 = V.elO[o.id]; if(d2) d2.classList.remove('at-c-tapi');
        chatBouger(V, o, sol(140, 16), 'marche', function(){ face(pg.x); chatPose(V, o, 'assis'); expression(V, o, 'at-x-content', 600); fin(2600); });
      });
    });
    return g.t;
  }
  if(g.t === 'hamac_chat'){
    /* elle saute dedans, le hamac se balance, elle s'y roule en boule */
    chatAller(V, o, {sur:{o:g.id, k:0, dx:0}, depart:{x:pg.x - 78 * s, y:Math.min(solMax(V), pg.y + 22)}}, function(){
      if(!la()) return fin(1500);
      parcBouge(V, g, [0, -4, 3.5, -2.5, 2, -1, 0], 1800);
      chatSeCoucher(V, o);
      st.dortJusqua = Date.now() + 10000 + Math.random() * 8000;
      chatPlanifier(V, o, st.dortJusqua - Date.now() + 30);
    });
    return g.t;
  }
  if(g.t === 'ressort_souris'){
    /* elle s'assoit à côté et tape la souris, qui se balance au bout de son ressort */
    var cote = p.x < pg.x ? -1 : 1;
    chatAller(V, o, sol(cote * 64, 8), function(){
      if(!la()) return fin(1500);
      face(pg.x); chatPose(V, o, 'tape');
      [350, 1150].forEach(function(ms){ apres(V, ms, function(){ var el = V.elO[g.id]; if(!el || !la()) return; el.classList.remove('at-ressort-bat'); void el.offsetWidth; el.classList.add('at-ressort-bat'); son(V, 'tic'); }); });
      apres(V, 2000, function(){ var s2 = V.chats[o.id]; if(s2 && s2.pose === 'tape' && !s2.tenu && !s2.anim && !s2.caresse) chatPose(V, o, 'assis'); });
      fin(3200);
    });
    return g.t;
  }
  if(g.t === 'cabane_chat'){
    /* elle entre dans sa cabane : on ne voit plus que sa tête, à la porte ; au bout d'un moment (ou si on frappe), elle ressort et s'étire */
    chatAller(V, o, sol(0, 18), function(){
      if(!la() || g.dedans) return fin(1500);
      var d = V.elO[o.id];
      st.tenu = true; st.cabane = g.id; d.classList.add('at-c-dehors');
      g.dedans = {v:o.v || 0, acc:o.acc ? JSON.parse(JSON.stringify(o.acc)) : {}};
      redessiner(V, g); parcBouge(V, g, [0, -1.5, 1.5, -1, 0], 600); sonMimi(V, 'roule');
      apres(V, 6000 + Math.random() * 5000, function(){ cabaneSortir(V, o, g); });
    });
    return g.t;
  }
  if(g.t === 'toboggan_chat'){
    /* elle grimpe sur la plateforme, s'assoit en haut… et glisse jusqu'en bas */
    chatAller(V, o, {sur:{o:g.id, k:0, dx:-82}, depart:{x:pg.x - 136 * s, y:Math.min(solMax(V), pg.y + 20)}}, function(){
      if(!la()) return fin(1500);
      st.gauche = false; var d = V.elO[o.id]; if(d) d.classList.remove('at-c-gauche');
      chatPose(V, o, 'assis'); expression(V, o, 'at-x-joue', 900);
      fin(7000);
      apres(V, 1000, function(){
        var s2 = V.chats[o.id];
        if(!la() || s2.anim || s2.pose !== 'assis' || !chatSurMeuble(V, o)) return;
        if(s2.t){ clearTimeout(s2.t); s2.t = null; }
        sonMimi(V, 'roule');
        chatGlisser(V, o, sol(136, 12), function(){ chatPose(V, o, 'assis'); expression(V, o, 'at-x-content', 700); coeursChat(V, o, '✨'); fin(2600); });
      });
    });
    return g.t;
  }
  return null;
}
function cabaneSortir(V, o, g){
  var st = V.chats[o.id];
  if(!st || st.cabane !== g.id) return;
  st.cabane = null; st.tenu = false;
  delete g.dedans;
  if(V.parId[g.id] && V.elO[g.id]){ redessiner(V, g); parcBouge(V, g, [0, 1.5, -1.5, 0], 500); }
  var d = V.elO[o.id];
  if(!d || V.arrete) return;
  /* (la cabane a pu être déplacée pendant qu'elle était dedans : elle ressort devant sa porte, là où elle est maintenant) */
  if(V.parId[g.id] && salleDe(g) === salleDe(o) && !g.sur){ var pg = posObj(V, g); st.pos = chatSol(V, pg.x, Math.min(solMax(V), pg.y + 18 )); placerEl(V, o); d.style.zIndex = Math.round(chatPos(V, o).z * 5); }
  d.classList.remove('at-c-dehors'); chatReparait(d);
  chatPose(V, o, 'marche'); gesteChat(V, o, 'etire');
  apres(V, 1950, function(){ var s2 = V.chats[o.id]; if(s2 && s2.pose === 'marche' && !s2.tenu && !s2.anim && !s2.caresse) chatPose(V, o, 'assis'); });
  chatPlanifier(V, o, 3400);
  changer(V);
}
/* Elle glisse, assise, d'où elle est jusqu'à « pos » (le toboggan) : de plus en plus vite */
function chatGlisser(V, o, pos, fin){
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(!d || V.arrete){ if(fin) fin(); return; }
  var p0 = chatPos(V, o);
  st.pos = pos;
  var p1 = chatPos(V, o), k = V.k, dur = 700;
  st.gauche = p1.x < p0.x; d.classList.toggle('at-c-gauche', st.gauche);
  chatPose(V, o, 'assis'); placerEl(V, o);
  d.style.zIndex = Math.round(Math.max(p0.z, p1.z) * 5) + 6;
  function tr(x, y, s){ return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')'; }
  var a = anim(d, [{transform:tr((p0.x - p1.x) * k, (p0.y - p1.y) * k, p0.s)}, {transform:tr(0, 0, p1.s)}], {duration:dur, easing:'cubic-bezier(.45,0,.9,.55)'});
  st.anim = a;
  st.mv = {p0:{x:p0.x, y:p0.y}, p1:{x:p1.x, y:p1.y}, mode:'saute', dur:dur};      /* (comme un saut : on ne l'arrête pas en route) */
  function fini(){ if(st.anim !== a) return; st.anim = null; if(V.arrete) return; d.style.zIndex = Math.round(p1.z * 5); if(fin) fin(); }
  if(a) a.onfinish = fini; else fini();
}

/* ==========================================================
   Mimi, un vrai petit Tamagotchi (refait le 16 novembre avec Romain ; DESIGN-saison1.md §12.64).
   Romain : « Il faut pas que ça soit utile. Faut que ça soit un jeu, un jouet. Faut qu'elle soit attachante, et qu'on ait envie
   de s'occuper d'elle. » — « Certes une petite corvée, mais si derrière t'es récompensé, c'est plutôt cool. »
   - Rien de ce qu'on fait pour elle ne sert à l'enquête.
   - UNE SEULE JAUGE À L'ÉCRAN : SON BONHEUR (16 novembre, 21 h 18 et 22 h 22, Romain : « la jauge de bonheur, les 5 cœurs, tout ça,
     c'est caché. On garde juste la jauge de bonheur » ; « c'est un peu trop facile de remplir la liste » ; DESIGN-saison1.md §12.69).
     · son bonheur (o.bh, de 0 à 100 ; la barre au-dessus du bouton 🐾, toujours sous les yeux) : il part de bas (BH_DEPART), les soins
       rapportent peu (GAIN_K) et refaire la même chose rapporte de moins en moins (tama.las, LASSE : la lassitude s'oublie avec le
       temps de jeu et à chaque nouveau moment). Ce qui rapporte le plus : ses envies. Il redescend doucement pendant qu'on joue,
       jamais sous BH_MIN : elle n'est jamais malheureuse ;
     · LA BARRE PLEINE : elle file par la chatière et rapporte un coffret (cadeauChat) ; on l'ouvre : le bonheur redescend à BH_APRES,
       et on recommence. Pas de limite par moment (Romain : « je veux qu'on puisse jouer avec Mimi tout le temps ») ;
     · dans le coffret : une chose qu'elle n'a pas encore, tirée au hasard dans une de ses CINQ FAMILLES (FAMILLES : le ventre plein,
       la récré, toute belle, comme une reine, ses envies). Les familles ne s'affichent nulle part. La dernière chose d'une famille
       arrive dans un coffret doré ; une famille complète (tama.fam) vaudra un morceau du parc à chat (le chantier d'après) ;
     · SES ENVIES (tama.envie) : elle ne la dit pas tout de suite. Pendant ENVIE_CACHEE secondes de jeu, on la devine à ce qu'elle
       fait (envieSigne : elle tourne autour de sa gamelle, joue toute seule, n'en finit pas de se laver, pétrit son panier, vient
       réclamer des câlins…) ; ensuite sa bulle dorée la montre. Lui donner pile ça : « Pile poil ! », ENVIE_GAIN de bonheur si on
       a deviné, ENVIE_GAIN_DITE si elle a dû le dire. Autre chose : elle est contente (le gain du soin), sans plus. Une envie passe
       toute seule (ENVIE_DUREE).
   - Ses besoins (o.b : faim 🍗, soif 💧, propreté 🛁, câlins ❤️, jeu 🧶) baissent aussi, jamais sous BESOIN_MIN ; quand l'un est bas,
     une bulle au-dessus de sa tête le dit (on la touche : le conteur raconte quoi faire, et la chose à toucher brille).
   - Chaque soin donne du bonheur (plus s'il répond à ce qu'elle demande ; plus avec une meilleure nourriture) : soigner().
   - Les jouets et les objets de soin (la brosse, le bain, les friandises, le griffoir) ne viennent que des coffrets ; les nourritures,
     les coins douillets et les habits viennent des coffrets ou s'achètent avec les pièces d'or, à petits prix (la boutique de Mimi :
     🐾 puis 🛒).
   - L'APPAREIL PHOTO 📷 a son bouton, à côté du 🐾 ; L'ALBUM EST À COMPLÉTER : quinze poses (PHOTOS), une photo par pose ; une pose déjà
     prise : « Dommage, c'était la même ! » ; des poses rares (au galop, en plein saut, l'étirement, coucou) ; le gros plan viendra avec
     son chantier. À tant de photos, un cadeau (PHOTOS_CADEAUX) : un pelage ou des yeux de plus.
   - SES PELAGES ET SES YEUX (MimiPantin.CHATS, YEUX ; etat.mimi.peaux) se gagnent : avec l'album, et dans les coffrets (ils sont dans
     ses familles). On en change dans sa garde-robe 🎀 (changerPeau). Sur le chat : o.v = son pelage + 100 × (ses yeux + 1) (vChat).
   (DESIGN-saison1.md §12.70.)
   - Une petite bêtise environ toutes les 4 minutes de jeu, jamais plus (une fiole par terre, le tabouret renversé, une pelote déroulée) :
     un toucher remet tout en ordre ; rien n'est jamais perdu.
   - Rien ne baisse quand l'appli est fermée.
   - À partir de l'enquête 4 (PORTEE, des données) : la chatte s'arrondit, un chaton naît, et Mimi part vivre chez Odette
     (etat.chezOdette ; Atelier.chezOdette(etat) pour le village). ⚠️ À revoir avec Romain avant l'enquête 4 : on lui offre maintenant
     des jouets et des habits, la voir partir serait une vraie peine.
   L'état : etat.tama = {jeu, betise, moment, portee, cadeaux, dehors:{c, nom, g}, coffret:{c, x, y, g}, herbe, friand,
     v:3, las:{soin:crans}, fam:{famille:1}, recus:[codes], envie:{k, n, d}, envieT, envieAvant},
   etat.mimi = {jouets, nour, soins, neufs, album:[{k, v, acc, e}], peaux:{p, y}, peauNeuve}, etat.betises, etat.chezOdette, etat.garde ;
   sur le chat : o.b, o.bh, o.acc, o.v (son pelage et ses yeux).
   ========================================================== */
var BESOINS = [
  {k:'faim', ic:'🍗', baisse:4},
  {k:'soif', ic:'💧', baisse:5},
  {k:'propre', ic:'🛁', baisse:2.5},
  {k:'amour', ic:'❤️', baisse:4},
  {k:'jeu', ic:'🧶', baisse:3.5}
];
var DEMANDE = 42;                    /* sous 42, elle le demande (une bulle) */
var BESOIN_MIN = 25, BH_MIN = 8, BH_DEPART = 15, BH_BAISSE = 0.6;   /* les planchers ; le bonheur perd 0,6 par minute de jeu */
var GAIN_K = 0.5;                    /* (étape 2) chaque soin rapporte deux fois moins de bonheur qu'avant… */
var LASSE = [1, 0.5, 0.25, 0.1], LASSE_OUBLI = 150;   /* …et de moins en moins si on refait le même (un cran s'oublie en 2 min 30 de jeu) */
var BH_APRES = 30;                   /* le coffret ouvert, son bonheur redescend là ; une sauvegarde d'avant l'étape 2 aussi */
/* ses envies (en secondes de jeu) : cachée une minute (on la devine à ce qu'elle fait), puis sa bulle la dit ; devinée, elle rapporte plus */
var ENVIE_CACHEE = 60, ENVIE_GAIN = 16, ENVIE_GAIN_DITE = 10, ENVIE_PAUSE = 30, ENVIE_DUREE = 240;
var ENVIE_SIGNE = 0.7;               /* tant qu'elle a une envie : sept fois sur dix, ce qu'elle fait la montre */
var TIC = 15;                        /* les besoins changent toutes les 15 secondes de jeu */
var BETISE_MIN = 240;                /* une bêtise au plus toutes les 4 minutes de jeu */
var PAS_MOMENT = 12;                 /* un nouveau moment de la journée : chaque besoin baisse un peu (jamais sous le plancher) */
/* Le chaton (des données : il arrive à l'enquête 4) : en secondes de jeu ; un nouveau moment compte pour 120 s */
var PORTEE = {enquete:4, ronde:150, naissance:240, depart:420, mere:'Mimi', chatons:['Pompon', 'Caramel', 'Noisette']};
var REPLIQUE_ODETTE = {q:'Comment va %n ?', a:'%n ? Elle est très heureuse ici, avec mes sept chats ! Elle dort sur mon fauteuil, près du feu. Revenez la voir quand vous voulez.'};
var DODO_ICI = /^(panier|lit|pouf|coussin|arbre_chat|coffre|hamac_chat)$/;   /* ses coins pour dormir */

function tama(V){ if(!V.etat.tama || !Array.isArray(V.etat.betises)) normaliserChat(V.etat); return V.etat.tama; }
function chatsTous(V){ return V.etat.objets.filter(function(o){ return o.t === 'chat'; }); }
function nomChat(o){ return o.nom || (o.chaton ? PORTEE.chatons[0] : PORTEE.mere); }
function tailleChat(o, p){ if(o.chaton && o.taille > 0 && o.taille < 1) p.s *= o.taille; return p; }
function besoins(o){
  if(!o.b || typeof o.b !== 'object') o.b = {};
  BESOINS.forEach(function(b){ if(typeof o.b[b.k] !== 'number' || !(o.b[b.k] >= 0)) o.b[b.k] = 80; if(o.b[b.k] < BESOIN_MIN) o.b[b.k] = BESOIN_MIN; });
  return o.b;
}
function besoinUrgent(o){
  var b = besoins(o), pire = null;
  BESOINS.forEach(function(x){ if(b[x.k] < DEMANDE && (!pire || b[x.k] < b[pire.k])) pire = x; });
  return pire;
}
/* (16 novembre : elle n'est jamais triste ni fatiguée ; elle dort quand elle en a envie) */
function humeur(o){ return {triste:false, fatigue:false}; }
/* son bonheur : la seule jauge qu'on voit ; une vieille sauvegarde le prend dans la moyenne de ses anciens besoins */
function bonheur(o){
  if(typeof o.bh !== 'number' || !(o.bh >= 0)){
    var b = o.b || {}, l = ['faim', 'soif', 'amour', 'jeu', 'dodo'].filter(function(k){ return typeof b[k] === 'number'; });
    /* (seule une très vieille sauvegarde — elle avait encore le besoin « dodo » — le prend dans ses besoins ; un chat tout neuf part de BH_DEPART) */
    o.bh = l.length && typeof b.dodo === 'number' ? Math.round(l.reduce(function(s, k){ return s + b[k]; }, 0) / l.length) : BH_DEPART;
  }
  o.bh = borne(Math.round(o.bh * 100) / 100, BH_MIN, 100);
  return Math.round(o.bh);
}
/* (étape 2) un peu plus (ou un peu moins) de bonheur, sans arrondir en route : les tout petits gains d'une caresse comptent pour de bon */
function bhPlus(o, x){ bonheur(o); o.bh = borne(Math.round((o.bh + x) * 100) / 100, BH_MIN, 100); return o.bh; }
function bhPlein(o){ bonheur(o); return o.bh >= 99.5; }
/* le numéro de l'enquête : donné par le moteur (option enquete), sinon celui de la partie en cours */
function enqueteNo(V){
  var n = 0, t = V.etat.tama || {};
  if(typeof V.o.enquete === 'number') n = V.o.enquete;
  else try{ var S = window.M && window.M.S; n = S && S.e ? +S.e.id || 0 : 0; }catch(e){ n = 0; }
  /* (entre deux enquêtes, la partie n'a pas d'enquête en cours : on garde la plus avancée déjà vue) */
  if(n > 0 && V.etat.tama && !(t.enq >= n)) t.enq = n;
  return Math.max(n, t.enq || 0, 1);
}
function donner(o, k, n){ var b = besoins(o); if(k === 'dodo') return; b[k] = borne(Math.round((b[k] + n) * 10) / 10, BESOIN_MIN, 100); }

/* ---------- Le temps de jeu ---------- */
function tamaDemarrer(V){
  tama(V);
  famillesMaj(V, false);      /* (une sauvegarde d'avant « la jauge seule » : ses familles déjà complètes sont notées, sans bruit) */
  /* (personne n'est dans la cabane au début : la vue vient d'être montée) ; les morceaux du parc qu'on lui doit arrivent */
  V.etat.objets.forEach(function(g){ if(g.dedans) delete g.dedans; });
  apres(V, 4500, function(){ parcDonner(V, true); });
  chatsTous(V).forEach(function(o){ besoins(o); if(!o.nom) o.nom = nomChat(o); });
  clearTimeout(V.tamaT);
  V.tamaT = apres(V, TIC * 1000, function(){ tamaTic(V); });
  majHumeurs(V);
}
function tamaTic(V, force){
  if(V.arrete) return;
  var actif = force || (!document.hidden && V.mode === 'ranger');
  if(actif){
    var t = tama(V), dt = force || TIC;
    t.jeu += dt;
    chatsTous(V).forEach(function(o){
      BESOINS.forEach(function(x){ donner(o, x.k, -x.baisse * dt / 60); });
      bhPlus(o, -BH_BAISSE * dt / 60);
    });
    /* (étape 2) la lassitude s'oublie peu à peu ; une envie passe, une autre vient */
    cles(t.las).forEach(function(k){ t.las[k] -= dt / LASSE_OUBLI; if(!(t.las[k] > 0.01)) delete t.las[k]; });
    envieTic(V);
    portee(V, dt);
    if(!V.attenteBetise && !GUIDE && !V.ouvert && V.grim.hidden && t.jeu - t.betise >= BETISE_MIN && Math.random() < (force ? 1 : 0.5)) peutEtreBetise(V);
    /* sa barre est pleine : elle va chercher un coffret (autant de fois qu'on la remplit) ; sinon, parfois, une souris passe */
    if(!force && !V.attenteBetise && !GUIDE && !V.o.sansSurprise){      /* (rien de tout ça pendant le guidage du tutoriel ; sansSurprise : les bancs d'essai) */
      var sortants = chatsDe(V).filter(function(c){ return peutSortir(V, c); });
      if(sortants.length) cadeauChat(V, sortants[0]);
      else if(grosPlan(V)){ /* (le gros plan, §12.76) */ }
      else if(!V.jouet && Math.random() < 0.3) sourisPasse(V);
    }
    famillesMaj(V, !force);      /* (un habit gagné à un mini-jeu, acheté… : une famille peut se compléter par un autre chemin) */
    majHumeurs(V); majBarre(V);
    if(!force && (t.jeu / TIC) % 4 === 0) changer(V);
  }
  if(!force){ clearTimeout(V.tamaT); V.tamaT = apres(V, TIC * 1000, function(){ tamaTic(V); }); }
}
/* Un nouveau moment de la journée (matin, après-midi…) : les besoins baissent un peu, le chaton grandit */
function tamaMoment(V){
  var t = tama(V), cle = enqueteNo(V) + ':' + (V.o.moment || 'matin');
  if(t.moment && t.moment !== cle){
    chatsTous(V).forEach(function(o){ BESOINS.forEach(function(x){ donner(o, x.k, -PAS_MOMENT); }); bhPlus(o, -4); });
    /* (étape 2) un nouveau moment : elle a tout oublié de ce qui la lassait, et son envie d'avant est passée */
    t.las = {};
    if(t.envie){ t.envie = null; t.envieT = t.jeu + 15; }
    portee(V, 120, true);
  }
  t.moment = cle;
}

/* ==========================================================
   La lassitude, ses cinq familles (cachées), ses envies (cachées une minute) — voir le grand commentaire plus haut.
   ========================================================== */
/* --- la lassitude : refaire le même soin rapporte de moins en moins (LASSE), et ça s'oublie avec le temps de jeu ---
   (« dodo:seule », « griffoir:seule » : ce qu'elle fait d'elle-même ; ça lasse pareil, mais ce n'est jamais « pile son envie ») */
function familleSoin(quoi){ var g = String(quoi || '').replace(/:seule$/, ''); return g.indexOf('repas') === 0 ? 'repas' : g; }
function lasse(V, fam){
  var n = borne(tama(V).las[fam] || 0, 0, LASSE.length - 1), i = Math.floor(n), f = n - i, a = LASSE[i], b = LASSE[Math.min(LASSE.length - 1, i + 1)];
  return a + (b - a) * f;
}
function lasser(V, fam){ var l = tama(V).las; l[fam] = Math.min(LASSE.length - 1, (l[fam] || 0) + 1); }

/* --- ses cinq familles d'affaires (cachées : rien ne s'affiche nulle part). Ce que les coffrets apportent, tiré au hasard dans une famille.
   Un code = ce que ouvrirCoffret() sait donner : j: un jouet, n: une nourriture, s: un objet de soin, a: un habit, c: un coin douillet,
   p: un pelage, y: des yeux (les numéros de MimiPantin.CHATS et YEUX ; les autres pelages et yeux se gagnent avec l'album : PHOTOS_CADEAUX).
   d : les d premières choses de la liste viennent d'abord, dans l'ordre (les objets de soin : ils ouvrent de nouveaux jeux) ; le reste, au hasard.
   fin : ce que le conteur dit quand la famille est complète. Tout ce qui existe est dans une famille, et une seule (vérifié par tools/mimi.py). --- */
var FAMILLES = [
  {k:'ventre', l:['s:friandises', 'n:pate', 'n:poisson', 'n:festin', 'p:5'], fin:'Son garde-manger est complet !'},
  {k:'recre', l:['j:plume', 'j:laser', 'j:souris', 'j:grelot', 'j:carton', 'j:herbe'], fin:'Sa caisse à jouets est complète !'},
  {k:'belle', d:2, l:['s:brosse', 's:bain', 'a:noeud_rose', 'a:noeud_bleu', 'a:fleurs', 'a:clochette', 'p:4', 'y:2'], fin:'Elle a tout ce qu\'il faut pour se faire belle !'},
  {k:'reine', d:2, l:['s:griffoir', 'c:coussin', 'a:perles', 'a:arc', 'a:couronne', 'a:mage', 'p:3'], fin:'Elle a tout ce qu\'il faut pour vivre comme une reine !'},
  {k:'envies', l:['a:collier_rouge', 'a:collier_bleu', 'a:collier_vert', 'a:noeud_pap_violet', 'a:noeud_pap_jaune', 'a:foulard', 'a:sorciere', 'a:beret', 'a:fete', 'p:6', 'y:4'], fin:'Sa garde-robe de tous les jours est complète !'}
];
function aChezElle(e, t){      /* (posé dans une pièce, encore dans un carton, ou rangé dans la réserve) */
  return e.objets.some(function(o){ return o.t === t; }) || e.cartons.some(function(k){ return (k.reste || []).indexOf(t) >= 0; }) || e.reserve.some(function(x){ return x.t === t; });
}
function aDeja(V, code){
  var k = code.charAt(0), id = code.slice(2), m = mimi(V), e = V.etat;
  if(k === 'j') return !JOUETS[id] || m.jouets.indexOf(id) >= 0;
  if(k === 'n') return !NOURS[id] || m.nour.indexOf(id) >= 0;
  if(k === 's') return !SOINS[id] || m.soins.indexOf(id) >= 0;
  if(k === 'a') return !ACC[id] || garde(e).a.indexOf(id) >= 0;
  if(k === 'c') return tama(V).recus.indexOf(code) >= 0 || aChezElle(e, id);
  if(k === 'p') return !CHATS[+id] || m.peaux.p.indexOf(+id) >= 0;
  if(k === 'y') return !MP.YEUX[+id] || m.peaux.y.indexOf(+id) >= 0;
  return true;
}
function familleReste(V, F){ return F.l.filter(function(c){ return !aDeja(V, c); }); }
/* Une famille vient de se compléter (par un coffret, un achat, un habit gagné à un mini-jeu) : on le note (tama.fam) — le parc à chat
   lui devra un morceau (le chantier d'après). dit : le conteur l'annonce (un coffret doré le dit lui-même). */
function famillesMaj(V, dit){
  var t = tama(V), neuves = FAMILLES.filter(function(F){ return !t.fam[F.k] && !familleReste(V, F).length; });
  if(!neuves.length) return neuves;
  neuves.forEach(function(F){ t.fam[F.k] = 1; });
  changer(V);
  apres(V, 3600, function(){ parcDonner(V, true); });      /* (une famille complète : un morceau de son parc à chat arrive) */
  if(dit && !V.arrete){
    var tx = neuves.map(function(F){ return F.fin; }).join(' ');
    (function montrer(n){ if(V.arrete) return; if(!V.toastEl.hidden && n < 6){ apres(V, 1500, function(){ montrer(n + 1); }); return; } toast(V, '<b>👑 ✨</b> ' + esc(tx), 6000, tx); sonMimi(V, 'fanfare'); })(0);
  }
  return neuves;
}
/* LE PARC À CHAT : ses morceaux, dans l'ordre où ils arrivent — un par famille complète (peu importe laquelle). Ils ne s'achètent pas.
   tama.parc : ceux qui sont déjà arrivés (dans un carton, au coin de l'atelier). */
var PARC = ['tunnel_chat', 'hamac_chat', 'ressort_souris', 'cabane_chat', 'toboggan_chat'];
function parcDonner(V, dit){
  var t = tama(V), du = PARC.slice(0, Math.min(PARC.length, cles(t.fam).length)).filter(function(x){ return t.parc.indexOf(x) < 0; });
  if(!du.length || V.arrete) return [];
  var av = V.etat.cartons.map(function(k){ return k.id; });
  du.forEach(function(x){ t.parc.push(x); nouveauCarton(V.etat, [x], 0); });
  if(!V.salle) dessinerPiece(V, av);
  changer(V);
  if(dit){
    var c = chatsTous(V)[0], nom = c ? nomChat(c) : PORTEE.mere, quoi = du.map(function(x){ return CAT[x].nom.toLowerCase(); });
    var tx = 'Un grand colis pour le parc à chat de ' + nom + ' : ' + (du.length > 1 ? quoi.slice(0, -1).join(', ') + ' et ' + quoi[quoi.length - 1] : (/^[aeiouh]/.test(quoi[0]) ? 'un ' : quoi[0] === 'cabane' || quoi[0] === 'souris sur ressort' ? 'une ' : 'un ') + quoi[0]) + ' ! ' + (du.length > 1 ? 'Ils attendent dans leurs cartons' : 'Il attend dans son carton') + ', au coin de la pièce 📦.';
    (function montrer(n){ if(V.arrete) return; if(!V.toastEl.hidden && n < 8){ apres(V, 1500, function(){ montrer(n + 1); }); return; } toast(V, '<b>📦 🐈</b> ' + esc(tx), 7000, tx); sonMimi(V, 'debloque'); })(0);
  }
  return du;
}
/* (Le mode d'essai du jeu seulement : « #test » dans l'adresse.) Toutes ses affaires d'un coup : ses cinq familles sont complètes, les
   morceaux de son parc arrivent. Pour essayer le parc, les pelages et les habits sans jouer des heures. L'album, lui, reste à faire. */
function toutDonner(V){
  var m = mimi(V), G = garde(V.etat), t = tama(V), av = V.etat.cartons.map(function(k){ return k.id; });
  cles(MP.HABITS || {}).forEach(function(id){ if(G.a.indexOf(id) < 0) G.a.push(id); });      /* (la malle à déguisements) */
  FAMILLES.forEach(function(F){ F.l.forEach(function(code){
    var k = code.charAt(0), id = code.slice(2);
    if(aDeja(V, code)) return;
    if(k === 'j') m.jouets.push(id);
    else if(k === 'n') m.nour.push(id);
    else if(k === 's'){ m.soins.push(id); if(id === 'griffoir') nouveauCarton(V.etat, ['griffoir'], 0); }
    else if(k === 'a') G.a.push(id);
    else if(k === 'c'){ t.recus.push(code); nouveauCarton(V.etat, [id]); }
    else if(k === 'p') m.peaux.p.push(+id);
    else if(k === 'y') m.peaux.y.push(+id);
  }); });
  if(!V.salle) dessinerPiece(V, av);
  famillesMaj(V, false);
  var tx = 'Essai : toutes ses affaires sont là. Les morceaux de son parc à chat arrivent dans leurs cartons…';
  toast(V, '<b>🧪</b> ' + esc(tx), 5000, tx);
  majBarre(V); changer(V);
}
/* Ce qu'il y aura dans le coffret : une chose qu'elle n'a pas, d'une famille tirée au hasard (parmi celles où il reste quelque chose).
   g : c'est la dernière de sa famille — le coffret est doré. Elle a tout : des friandises. */
function contenuCoffret(V){
  var l = FAMILLES.map(function(F){ return {F:F, r:familleReste(V, F)}; }).filter(function(x){ return x.r.length; });
  if(!l.length) return {c:'f:'};
  var x = l[Math.floor(Math.random() * l.length)], dab = x.F.l.slice(0, x.F.d || 0).filter(function(c){ return x.r.indexOf(c) >= 0; });
  var r = {c:dab.length ? dab[0] : x.r[Math.floor(Math.random() * x.r.length)]};
  if(x.r.length === 1) r.g = 1;
  return r;
}

/* --- ses envies : d'abord cachée (on la devine à ce qu'elle fait : envieSigne), puis dite par une bulle de pensée dorée ;
   lui offrir pile ça rapporte gros ---
   k : ce que soigner() reçoit quand on le fait (« repas:poisson », « jouet:laser », « bain »…), ou « caresse », ou « dodo » */
/* la famille d'une envie : c'est elle que son manège montre (pas l'envie elle-même) */
function familleEnvie(k){
  return {repas:'ventre', eau:'ventre', friandises:'ventre', jouet:'recre', brosse:'belle', bain:'belle', dodo:'reine', griffoir:'reine', caresse:'calin'}[String(k || '').split(':')[0]] || null;
}
/* elle l'a dite (sa bulle dorée est là) ? */
function envieDite(V){ var e = V.etat.tama && V.etat.tama.envie; return !!e && e.d === 1; }
function envieInfo(V, k){
  var p = String(k || '').split(':'), n = chatsTous(V)[0], nom = n ? nomChat(n) : PORTEE.mere;
  if(p[0] === 'repas' && NOURS[p[1]]){
    var a = mimi(V).nour.indexOf(p[1]) >= 0, N = NOURS[p[1]].nom.replace(/^Des /, 'de ').replace(/^De la /, 'de ').replace(/^Du /, 'de ').replace(/^Un /, 'd\'un ');
    return {ic:NOURS[p[1]].ic, dit:nom + ' rêve ' + N.replace(/^de ([aeiouâéèêh])/, 'd\'$1') + '…' + (a ? ' Sa gamelle n\'attend que ça !' : ' Il y en a dans sa boutique 🛒, contre quelques pièces d\'or.'), cibles:['gamelle'], barre:!a};
  }
  if(p[0] === 'eau') return {ic:'💧', dit:nom + ' rêve d\'une grande lampée d\'eau bien fraîche.', cibles:['eau']};
  if(p[0] === 'jouet' && JOUETS[p[1]]) return {ic:JOUETS[p[1]].ic, dit:nom + ' ne pense qu\'à une chose : ' + JOUETS[p[1]].nom + ' ! Elle l\'attend dans sa barre 🐾.', barre:true};
  if(p[0] === 'caresse') return {ic:'✋', dit:nom + ' rêve de gratouilles derrière les oreilles. Longtemps. Très longtemps.'};
  if(p[0] === 'brosse') return {ic:iconeSoin('brosse'), dit:nom + ' rêve d\'un bon coup de brosse. Sa brosse attend dans sa barre 🐾.', barre:true};
  if(p[0] === 'bain') return {ic:'🛁', dit:'Incroyable : ' + nom + ' rêve d\'un bain ! Vite, avant qu\'elle change d\'avis. Il est dans sa barre 🐾.', barre:true};
  if(p[0] === 'friandises') return {ic:'🍬', dit:nom + ' rêve d\'une friandise. Une toute petite. Bon, une moyenne. Le bocal est dans sa barre 🐾.', barre:true};
  if(p[0] === 'griffoir') return {ic:'🪵', dit:nom + ' a les griffes qui la démangent… Son griffoir lui fait de l\'œil !', cibles:['griffoir']};
  if(p[0] === 'dodo') return {ic:'🧺', dit:nom + ' rêve de son coin douillet… mais y aller à pattes, quelle fatigue ! Un doigt posé sur elle, on l\'emmène : elle se laisse porter comme une reine.', cibles:['panier', 'coussin', 'pouf', 'arbre_chat', 'hamac_chat']};
  return null;
}
/* tout ce dont elle peut avoir envie en ce moment (jamais la même deux fois de suite ; parfois un plat qu'elle n'a pas encore) */
function enviesPossibles(V, toutes){
  var m = mimi(V), t = tama(V), l = ['caresse'];
  /* (jamais ce qui l'attend déjà dans sa gamelle : elle irait le manger toute seule, et « pile poil » sans qu'on ait rien fait) */
  var pleines = V.etat.objets.filter(function(g){ return (g.t === 'gamelle' || g.t === 'eau') && g.plein; });
  if(toutes || !pleines.some(function(g){ return g.t === 'eau'; })) l.push('eau');
  m.nour.forEach(function(k){ if(NOURS[k] && (toutes || !pleines.some(function(g){ return g.t === 'gamelle' && (g.nour || 'croquettes') === k; }))) l.push('repas:' + k); });
  m.jouets.forEach(function(id){ if(JOUETS[id] && !(id === 'herbe' && t.herbe === momentCle(V))) l.push('jouet:' + id); });
  ['brosse', 'bain', 'friandises'].forEach(function(id){ if(soinA(V, id)) l.push(id); });
  if(V.etat.objets.some(function(x){ return x.t === 'griffoir'; })) l.push('griffoir');
  if(V.etat.objets.some(function(x){ return DODO_ICI.test(x.t) && x.t !== 'coffre' && x.t !== 'lit'; })) l.push('dodo');
  /* (pendant une enquête, la boutique est ouverte : une fois sur cinq, un plat qu'elle n'a pas encore goûté) */
  var pas = cles(NOURS).filter(function(k){ return m.nour.indexOf(k) < 0; });
  if(toutes) return l.concat(pas.length && bourse(V) !== null ? ['repas:' + pas[0]] : []);      /* (les robots : tout, sans le hasard) */
  if(pas.length && bourse(V) !== null && Math.random() < 0.2) return ['repas:' + pas[0]];
  return l.filter(function(k){ return k !== t.envieAvant; });
}
function envieDe(V, debut){ var e = V.etat.tama && V.etat.tama.envie; return !!e && e.k.indexOf(debut) === 0; }
/* une nouvelle envie : d'abord une famille au hasard (pas celle d'avant, si on a le choix : son manège change), puis une envie dedans */
function envieNouvelle(V){
  var l = enviesPossibles(V), fams = {}, avant = familleEnvie(tama(V).envieAvant);
  if(!l.length) return null;
  l.forEach(function(k){ var f = familleEnvie(k); if(f) (fams[f] = fams[f] || []).push(k); });
  var ks = cles(fams);
  if(ks.length > 1) ks = ks.filter(function(f){ return f !== avant; });
  if(!ks.length) return null;
  var lf = fams[ks[Math.floor(Math.random() * ks.length)]];
  return lf[Math.floor(Math.random() * lf.length)];
}
function envieTic(V){
  var t = tama(V), o = chatsTous(V)[0];
  if(!o || o.chaton || GUIDE || V.o.sansSurprise) return;
  if(t.envie && t.jeu - t.envie.n >= ENVIE_DUREE){ t.envie = null; t.envieT = t.jeu + ENVIE_PAUSE; majHumeur(V, o); }      /* (elle est passée : sans rancune) */
  /* (on n'a pas deviné : au bout d'une minute, sa bulle le dit) */
  if(t.envie && !t.envie.d && t.jeu - t.envie.n >= ENVIE_CACHEE){
    t.envie.d = 1; changer(V); majHumeur(V, o);
    if(V.elO[o.id] && salleDe(o) === V.salle && !chatEtat(V, o).anim){ sonMimi(V, 'trille'); expression(V, o, 'at-x-penche', 900); }
  }
  if(t.envie || t.jeu < t.envieT || t.dehors || t.coffret) return;
  var k = envieNouvelle(V);
  if(!k) return;
  t.envie = {k:k, n:t.jeu};      /* (elle ne dit rien : c'est ce qu'elle va faire, à sa prochaine idée, qui la trahit — tamaAgir, envieSigne) */
  changer(V);
}
function envieEst(V, quoi){
  var e = tama(V).envie;
  return !!e && (e.k === quoi || (e.k === 'jouet:pelote' && quoi === 'jouet'));
}
/* pile ce qu'elle voulait ! */
function envieFaite(V, o){
  var t = tama(V);
  if(!t.envie) return false;
  var devinee = !t.envie.d;
  t.envieAvant = t.envie.k; t.envie = null; t.envieT = t.jeu + ENVIE_PAUSE + Math.floor(Math.random() * 3) * TIC;
  bhPlus(o, devinee ? ENVIE_GAIN : ENVIE_GAIN_DITE);      /* (devinée avant qu'elle le dise : ça rapporte plus) */
  sonMimi(V, 'envie');
  if(V.elO[o.id] && salleDe(o) === V.salle){
    flotter(V, o, '💖 Pile poil !');
    coeursChat(V, o, '💖'); apres(V, 350, function(){ coeursChat(V, o, '✨'); });
    etincelles(V, o);
  }
  majHumeur(V, o); majBarre(V, true); changer(V);
  return true;
}
/* --- Son envie se devine à ce qu'elle fait (Romain, 16 novembre, 22 h 22 : « on voit son envie par rapport à l'endroit ou ce qu'elle
   fait, ce qu'elle montre »). Un manège par famille (ce que la fonction rend, un mot, sert aux robots) :
   · le ventre : elle tourne autour de sa gamelle (de son eau, de sa litière), s'assoit devant, se lèche les babines, nous regarde ;
   · la récré : elle joue toute seule, file ventre à terre d'un bout à l'autre de la pièce ;
   · toute belle : elle n'en finit pas de se laver (huit façons : la toilette du pantin, mimi-gestes.js) ;
   · comme une reine : elle va à son coin douillet (ou à son griffoir), le pétrit, bâille, s'étire à côté — sans s'y installer ;
   · les câlins : elle vient tout devant, s'assoit face à nous, cligne des yeux, fait coucou de la patte, se roule sur le dos.
   Le manège montre la famille, pas la chose : reste à trouver laquelle. --- */
function envieSigne(V, o){
  var t = tama(V), st = chatEtat(V, o), f = t.envie ? familleEnvie(t.envie.k) : null;
  if(!f || !V.elO[o.id] || o.chaton || st.tenu || st.depart || st.pose === 'dort') return false;
  var p = chatPos(V, o), sol = !chatSurMeuble(V, o), suite = function(ms){ chatPlanifier(V, o, ms); };
  var libre = function(pose){ var s = V.chats[o.id]; return !!s && s.pose === pose && !s.tenu && !s.anim && !s.caresse && !s.depart; };
  var face = function(x){ st.gauche = x < chatPos(V, o).x; var d2 = V.elO[o.id]; if(d2) d2.classList.toggle('at-c-gauche', st.gauche); };
  /* une de ses affaires, dans la pièce ; elle va tout près (du côté le plus proche ; de l'autre si elle y est déjà : elle tourne autour), tournée vers elle */
  var une = function(types){ var l = ici(V).filter(function(g){ return types.indexOf(g.t) >= 0 && !g.sur && !g.cote; }); return l.length ? l[Math.floor(Math.random() * l.length)] : null; };
  var pres = function(g, puis){
    var pg = posObj(V, g), y = Math.min(solMax(V), pg.y + 10), cote = p.x < pg.x ? -1 : 1;
    if(sol && Math.abs(p.x - (pg.x + cote * 82 * pg.s)) < 34 && Math.abs(p.y - y) < 40) cote = -cote;
    chatAller(V, o, chatSol(V, pg.x + cote * 82 * pg.s, y), function(){ face(pg.x); chatPose(V, o, 'assis'); puis(pg); });
  };
  if(f === 'ventre'){
    var g = une(t.envie.k === 'eau' ? ['eau'] : Math.random() < 0.3 ? ['litiere'] : ['gamelle']) || une(['gamelle', 'eau', 'litiere', 'distributeur']);
    if(!g) return false;
    pres(g, function(){
      var r = Math.random();
      if(r < 0.4) expression(V, o, 'at-x-langue', 1300);
      else if(r < 0.75){ expression(V, o, 'at-x-penche', 1300); sonMimi(V, 'trille'); }
      else { expression(V, o, 'at-x-miaou', 800); sonMimi(V, 'miaou'); }
      suite(2300 + Math.random() * 1500);
    });
    return 'ventre';
  }
  if(f === 'recre'){
    if(!sol){ chatAller(V, o, chatSolVisible(V), function(){ chatJoue(V, o, null, true); }); return 'recre'; }
    if(Math.random() < 0.4 && chatParc(V, o)) return 'recre';      /* (son parc à chat, s'il y en a un morceau dans la pièce) */
    if(Math.random() < 0.55){      /* elle file de l'autre côté de la pièce, ventre à terre… et joue en arrivant */
      var c = centreVue(V), dx = (p.x < c.x ? 1 : -1) * (260 + Math.random() * 160);
      st.vite = 3.8;
      chatAller(V, o, chatSol(V, p.x + dx, borne(p.y + (Math.random() - 0.5) * 160, SOL_MIN + 50, solMax(V) - 10)), function(){ st.vite = 1; chatJoue(V, o, null, true); });
      return 'recre';
    }
    chatJoue(V, o, null, true);
    return 'recre';
  }
  if(f === 'belle'){
    chatPose(V, o, 'lave');
    suite(5200 + Math.random() * 2800);
    return 'belle';
  }
  if(f === 'reine'){
    var coins = ['panier', 'coussin', 'pouf', 'arbre_chat', 'hamac_chat'];
    var gr = une(t.envie.k === 'griffoir' ? ['griffoir'] : coins) || une(coins.concat(['griffoir', 'lit']));
    if(!gr){ chatPose(V, o, 'assis'); expression(V, o, 'at-x-baille', 1300); sonMimi(V, 'baille'); suite(2800); return 'reine'; }
    pres(gr, function(){
      var r = Math.random();
      if(gr.t === 'griffoir'){ chatPose(V, o, 'tape'); apres(V, 1500, function(){ if(libre('tape')) chatPose(V, o, 'assis'); }); }
      else if(r < 0.45){ expression(V, o, 'at-x-petrit', 1700); sonMimi(V, 'ronron'); }
      else if(r < 0.75){ expression(V, o, 'at-x-baille', 1300); sonMimi(V, 'baille'); }
      else { chatPose(V, o, 'marche'); gesteChat(V, o, 'etire'); apres(V, 1950, function(){ if(libre('marche')) chatPose(V, o, 'assis'); }); }
      suite(2900 + Math.random() * 1500);
    });
    return 'reine';
  }
  /* les câlins */
  var c0 = centreVue(V), devant = chatSol(V, c0.x + (Math.random() - 0.5) * 240, solMax(V) - 30), ess;
  for(ess = 1; ess < 6 && sousBoutons(V, devant.x, devant.y); ess++) devant = chatSol(V, c0.x + (Math.random() - 0.5) * 240, solMax(V) - 30 - 26 * ess);      /* (jamais sous les boutons) */
  var doux = function(){
    var r = Math.random();
    if(r < 0.3){ chatPose(V, o, 'assis'); expression(V, o, 'at-x-cligne', 1500); sonMimi(V, 'ronron'); }
    else if(r < 0.55){ chatPose(V, o, 'salut'); apres(V, 1700, function(){ if(libre('salut')) chatPose(V, o, 'assis'); }); }
    else if(r < 0.8){ chatPose(V, o, 'dos'); gesteChat(V, o, 'gigote', {d:1700}); sonMimi(V, 'roule'); apres(V, 2100, function(){ if(libre('dos')) chatPose(V, o, 'assis'); }); }
    else { chatPose(V, o, 'assis'); expression(V, o, 'at-x-penche', 1300); sonMimi(V, 'trille'); }
    suite(3000 + Math.random() * 1500);
  };
  if(sol && Math.abs(p.y - devant.y) < 60 && Math.abs(p.x - c0.x) < 280) doux(); else chatAller(V, o, devant, doux);
  return 'calin';
}

/* ---------- L'humeur : sa tête, sa bulle ---------- */
/* ce que dit sa bulle : un besoin qui presse d'abord (la bulle blanche) ; sinon son envie du moment, quand elle a fini par la dire
   (la bulle dorée : au bout d'une minute ; avant, c'est à nous de deviner) */
function bulleDe(V, o){
  var u = besoinUrgent(o);
  if(u) return {k:u.k, ic:u.ic, envie:false};
  var t = V && V.etat && V.etat.tama, e = t && t.envie && t.envie.d === 1 && !o.chaton ? envieInfo(V, t.envie.k) : null;
  return e ? {k:'envie', ic:e.ic, envie:true} : null;
}
function bulleHTML(o, V){
  var u = bulleDe(V, o);
  return '<button type="button" class="at-bulle' + (u && u.envie ? ' at-envie' : '') + '"' + (u ? ' data-bulle="' + u.k + '"' : ' hidden') + ' aria-label="Ce que veut le chat"><span>' + (u ? u.ic : '') + '</span><i></i><i></i></button>';
}
function majHumeur(V, o){
  var d = V.elO[o.id];
  if(!d) return;
  var h = humeur(o), u = bulleDe(V, o), b = d.querySelector('.at-bulle');
  d.classList.toggle('at-c-triste', h.triste);
  d.classList.toggle('at-c-fatigue', h.fatigue);
  d.classList.toggle('at-c-ronde', !!o.ronde);
  d.classList.toggle('at-chaton', !!o.chaton);
  if(b){
    b.hidden = !u;
    b.classList.toggle('at-envie', !!(u && u.envie));
    if(u){ var sp = b.querySelector('span'), cle = u.k + '|' + u.ic; b.setAttribute('data-bulle', u.k); if(sp._cle !== cle){ sp._cle = cle; sp.innerHTML = u.ic; } }
  }
}
function majHumeurs(V){ chatsDe(V).forEach(function(o){ majHumeur(V, o); }); }

/* ---------- Les affaires du chat ---------- */
function gamellePleine(V, o, t){ return V.etat.objets.filter(function(g){ return g.t === t && g.plein && salleDe(g) === salleDe(o) && !g.sur; })[0]; }
/* Les nourritures de Mimi : les croquettes sont là dès le début ; les autres s'achètent une fois pour toutes (la boutique de Mimi) */
var NOURS = {
  croquettes:{ic:'🥣', nom:'Des croquettes', gain:6, prix:0, dit:'Des croquettes ! Crac, crac.'},
  pate:{ic:'🥫', nom:'De la pâtée au lapin', gain:10, prix:4, dit:'De la pâtée au lapin, toute fondante !'},
  poisson:{ic:'🐟', nom:'Du poisson frais', gain:13, prix:6, dit:'Du poisson frais du marché ! Ça sent bon jusqu\'au plafond.'},
  festin:{ic:'🦐', nom:'Un festin de crevettes', gain:16, prix:9, dit:'Un festin de crevettes ! Digne d\'une reine des chats.'}
};
/* Toucher la gamelle vide : si elle a plusieurs nourritures, on choisit (des bulles au-dessus de la gamelle) */
function remplir(V, g, nour){
  if(g.t === 'gamelle' && !nour){
    var l = mimi(V).nour.filter(function(k){ return NOURS[k]; });
    if(l.length > 1){ bullesNour(V, g, l); return; }
    nour = 'croquettes';
  }
  g.plein = 1; g.neuf = 0;
  if(g.t === 'gamelle') g.nour = nour || 'croquettes';
  redessiner(V, g);
  var d = V.elO[g.id];
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.12 + ',' + d._s * 0.9 + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:360});
  son(V, g.t === 'eau' ? 'plouf' : 'gain');
  var N = NOURS[g.nour] || NOURS.croquettes, t = g.t === 'eau' ? 'De l\'eau bien fraîche !' : N.dit;
  toast(V, '<b>' + (g.t === 'eau' ? '💧' : N.ic) + '</b> ' + esc(t), 2600, t);
  changer(V);
  /* elle arrive tout de suite si elle a un peu faim (ou soif) */
  chatsDe(V).forEach(function(c){ var b = besoins(c); if((g.t === 'gamelle' && (b.faim < 92 || envieDe(V, 'repas'))) || (g.t === 'eau' && (b.soif < 92 || envieDe(V, 'eau')))) chatPlanifier(V, c, 500); });
}
/* les bulles des nourritures, au-dessus de la gamelle (comme celles de la paillasse) */
function bullesNour(V, g, l){
  if(V.bullesPa) fermerBullesPa(V);
  var b = document.createElement('div');
  b.className = 'at-bulles-pa at-bulles-nour';
  b.innerHTML = l.map(function(k, i){ return '<button type="button" class="at-bulle-pa' + (i === l.length - 1 ? ' at-bulle-go' : '') + '" data-bulle="nour:' + k + '" style="--i:' + i + '"><span aria-hidden="true">' + NOURS[k].ic + '</span>' + esc(NOURS[k].nom.replace(/^(Des|De la|Du|Un) /, '')) + '</button>'; }).join('');
  V.calque.appendChild(b); V.bullesPa = g.id;
  placerBullesPa(V); veilleBullesPa(V);
  try{ if(window.Brume && Brume.son) Brume.son('pastilles', l.length); else son(V, 'clic'); }catch(e){}
  rebond(V.elO[g.id]);
}
/* Le distributeur : les croquettes tombent dans la gamelle la plus proche (dans la pièce) */
function parDistributeur(V, dis){
  var gs = ici(V).filter(function(g){ return g.t === 'gamelle'; });
  if(!gs.length){ var t = 'Il faut une gamelle pour les croquettes !'; toast(V, '<b>🥫 ➡️ ?</b> ' + esc(t), 3200, t); son(V, 'ko'); return true; }
  var pd = posObj(V, dis), g = gs.sort(function(a, b){ var pa = posObj(V, a), pb = posObj(V, b); return Math.hypot(pa.x - pd.x, pa.y - pd.y) - Math.hypot(pb.x - pd.x, pb.y - pd.y); })[0];
  if(g.plein) return false;          /* déjà pleine : le toucher change le style du distributeur */
  var d = V.elO[dis.id];
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 0.94 + ',' + d._s * 1.06 + ')', offset:0.3}, {transform:'scale(' + d._s + ')'}], {duration:420});
  apres(V, 250, function(){ remplir(V, g); });
  return true;
}
function relever(V, o){
  delete o.renverse;
  redessiner(V, o);
  etincelles(V, o);
  son(V, 'pas');
  var t = 'Le tabouret est relevé !';
  toast(V, '<b>🪑 ✔</b> ' + esc(t), 2400, t);
  V.etat.betises = V.etat.betises.filter(function(b){ return !(b.t === 'tabouret' && b.o === o.id); });
  changer(V);
}

/* ---------- Ce que l'enfant fait pour lui ---------- */
/* Sa bulle : le conteur dit ce qu'elle voudrait, et la chose à toucher brille un moment */
function bulleEnvie(V, o){
  var t = tama(V), e = t.envie ? envieInfo(V, t.envie.k) : null;
  if(!e) return;
  toast(V, '<b>💭 ' + e.ic + '</b> ' + esc(e.dit), 6500, e.dit);
  (e.cibles || []).forEach(function(c){ ici(V).filter(function(g){ return g.t === c; }).forEach(function(g){ var d = V.elO[g.id]; if(d){ d.classList.add('at-dispo'); apres(V, 4500, function(){ d.classList.remove('at-dispo'); }); } }); });
  if(e.barre) brillerMimi(V);
  son(V, 'clic');
}
function bulleChat(V, o){
  var u = besoinUrgent(o);
  if(!u){ bulleEnvie(V, o); return; }
  var n = nomChat(o), t, cibles = [];
  if(u.k === 'faim'){ t = n + ' a un petit creux… Son distributeur de croquettes n\'attend que ça. Ou sa gamelle, directement !'; cibles = ['gamelle', 'distributeur']; }
  else if(u.k === 'soif'){ t = n + ' a la langue toute sèche. Sa gamelle d\'eau est vide comme un désert !'; cibles = ['eau']; }
  else if(u.k === 'propre'){
    var lit = ici(V).filter(function(x){ return x.t === 'litiere' && x.sale; })[0];
    t = lit ? 'Pouah ! La litière de ' + n + ' réclame un bon coup de pelle.' : soinA(V, 'brosse') ? n + ' a le poil en bataille. Sa brosse attend dans sa barre 🐾.' : n + ' fait sa toilette toute seule… mais une litière toute propre lui ferait plaisir.';
    cibles = ['litiere'];
  }
  else if(u.k === 'amour') t = n + ' réclame des gratouilles. Pose ton doigt sur sa tête et gratte doucement : écoute-la ronronner !';
  else t = n + ' s\'ennuie à mourir… Ses jouets dorment dans sa barre 🐾.';
  toast(V, '<b>' + u.ic + '</b> ' + esc(t), 6000, t);
  var l = ici(V).filter(function(g){ return cibles.indexOf(g.t) >= 0; });
  if(!l.length && (u.k === 'faim' || u.k === 'soif')){ var t2 = 'Ses gamelles dorment encore dans un carton du coin 📦.'; apres(V, 3000, function(){ toast(V, '<b>📦</b> ' + esc(t2), 4200, t2); }); }
  l.forEach(function(g){ var d = V.elO[g.id]; if(d){ d.classList.add('at-dispo'); apres(V, 4500, function(){ d.classList.remove('at-dispo'); }); } });
  if(u.k === 'jeu' || (u.k === 'propre' && !l.length)) brillerMimi(V);
  son(V, 'clic');
}
/* Caresser (un câlin donné d'un coup : un toucher sur sa bulle, un robot) — elle ronronne, des cœurs s'envolent */
function caresser(V, o, n){
  soigner(V, o, 'caresse', 2 * (n || 1), 'amour');
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(chatArreter(V, o)) chatPlanifier(V, o, 2600);
  else if(st.pose !== 'dort' && !st.anim && !st.tenu) chatPlanifier(V, o, 2600);
  if(d){ d.classList.add('at-c-ronron', 'at-x-clos'); clearTimeout(d._ronron); d._ronron = apres(V, 1400, function(){ d.classList.remove('at-c-ronron', 'at-x-clos'); }); }
  if(!V.coeurT || Date.now() - V.coeurT > 450){ V.coeurT = Date.now(); coeursChat(V, o); sonMimi(V, 'ronron'); }
  majHumeur(V, o);
  changer(V);
}
/* La pelote : elle roule un peu plus loin, le chat lui court après */
function jouerPelote(V, o){
  var st = chatEtat(V, o);
  if(st.tenu) return;
  var p = chatPos(V, o), y = borne(p.y + 50, SOL_MIN + 40, solMax(V) - 10), x = borne(p.x + (Math.random() < 0.5 ? -170 : 170), solXmin(V, y) + 60, solXmax(V, y) - 60);
  var b = document.createElement('div'), s = echelleSol(y);
  b.className = 'at-pelote'; b.textContent = '🧶';
  b.style.left = pX(V, p.x); b.style.top = pY(V, p.y - 10); b.style.fontSize = 'calc(' + (34 * s).toFixed(1) + 'px * var(--k) * 1.6)';
  V.calque.appendChild(b);
  anim(b, [{left:pX(V, p.x), top:pY(V, p.y - 10), transform:'translate(-50%,-50%) rotate(0deg)'}, {left:pX(V, x), top:pY(V, y), transform:'translate(-50%,-50%) rotate(720deg)'}], {duration:900, easing:'ease-out', fill:'forwards'});
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  apres(V, 300, function(){
    chatAller(V, o, {x:x + (x > p.x ? -40 : 40), y:y, sur:null}, function(){
      soigner(V, o, 'jouet:pelote', 10, 'jeu');
      chatJoue(V, o);                                   /* un de ses dix jeux (jamais le même deux fois de suite) */
      apres(V, 700, function(){ b.remove(); coeursChat(V, o); });
    });
  });
}
function chatVaDormir(V, o){
  var pn = ici(V).filter(function(x){ return x.t === 'panier' && !x.sur && !x.cote; })[0], st = chatEtat(V, o);
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  var dodo = function(){ chatPose(V, o, 'dort'); st.dortJusqua = Date.now() + 25000; chatPlanifier(V, o, 25030); majHumeur(V, o); dodoCoin(V, o); };
  if(!pn){ dodo(); return; }
  var pp = posObj(V, pn);
  chatAller(V, o, {sur:{o:pn.id, k:0, dx:0}, depart:{x:pp.x + 90, y:Math.min(solMax(V), pp.y + 20)}}, dodo);
}
/* Il a faim (ou soif) et sa gamelle est pleine : il y va, il mange, la gamelle se vide */
function chatVaManger(V, o, g, k){
  var pg = posObj(V, g), st = chatEtat(V, o), cote = pg.x > 600 ? -1 : 1;
  chatAller(V, o, chatSol(V, pg.x + cote * 70 * pg.s, pg.y + 6), function(){
    st.gauche = cote > 0; var d = V.elO[o.id]; if(d) d.classList.toggle('at-c-gauche', st.gauche);
    chatPose(V, o, 'mange');
    sonMimi(V, k === 'soif' ? 'lape' : 'croque');
    apres(V, 1500, function(){ if(chatEtat(V, o).pose === 'mange') sonMimi(V, k === 'soif' ? 'lape' : 'croque'); });
    chatPlanifier(V, o, 3600);
    apres(V, 3400, function(){
      var nid = NOURS[g.nour] ? g.nour : 'croquettes', N = NOURS[nid];
      g.plein = 0; delete g.nour; redessiner(V, g);
      if(k === 'soif') soigner(V, o, 'eau', 5, 'soif');
      else { soigner(V, o, 'repas:' + nid, N.gain, 'faim'); if(N.gain > 6) apres(V, 400, function(){ coeursChat(V, o); }); }
      chatPose(V, o, 'lave');
      if(k !== 'soif') apres(V, 200, function(){ var dd = V.elO[o.id]; if(dd){ dd.classList.add('at-x-langue'); apres(V, 1600, function(){ dd.classList.remove('at-x-langue'); }); } });
    });
  });
}

/* ---------- Les bêtises (environ une toutes les 4 minutes de jeu, jamais plus ; rien n'est perdu) ---------- */
function peutEtreBetise(V){
  var t = tama(V), l = chatsDe(V).filter(function(o){ var st = V.chats[o.id]; return st && !st.tenu && !st.anim && st.pose !== 'dort'; });
  if(!l.length) return false;
  var o = l[Math.floor(Math.random() * l.length)], choix = [];
  var etag = ici(V).filter(function(x){ var c = catDe(x); return !x.sur && c.z === 'mur' && /etagere|epices|fioles/.test(x.t); });
  var tab = ici(V).filter(function(x){ return x.t === 'tabouret' && !x.sur && !x.renverse; });
  if(etag.length) choix.push('fiole');
  if(tab.length) choix.push('tabouret');
  choix.push('pelote');
  var quoi = choix[Math.floor(Math.random() * choix.length)];
  t.betise = t.jeu;
  V.attenteBetise = true;
  var fin = function(){ V.attenteBetise = false; };
  if(quoi === 'fiole'){
    var e = etag[Math.floor(Math.random() * etag.length)], pe = posObj(V, e), y = borne(SOL_Y + 90, SOL_MIN + 40, solMax(V)), F = cadreObjet(V, e.id);
    var x = borne(F ? F.x : pe.x, solXmin(V, y) + 40, solXmax(V, y) - 40);
    chatAller(V, o, chatSol(V, x + 70, y + 10), function(){
      chatPose(V, o, 'saute');
      apres(V, 500, function(){
        V.etat.n++;
        var b = {id:'b' + V.etat.n, t:'fiole', x:x, y:y, pc:V.salle || undefined, c:['#7cf09a', '#ff8fb3', '#8ff3ff', '#ffd84a'][V.etat.n % 4]};
        V.etat.betises.push(b);
        dessinerBetises(V, b.id);
        chatPose(V, o, 'assis'); chatPlanifier(V, o, 3000);
        var tx = 'Oh ! ' + nomChat(o) + ' a fait tomber une fiole. Touche-la pour la remettre à sa place.';
        toast(V, '<b>🐈 💥 🧪</b> ' + esc(tx), 5200, tx); son(V, 'ko'); changer(V); fin();
      });
    });
  } else if(quoi === 'tabouret'){
    var tb = tab[0], pt = posObj(V, tb);
    chatAller(V, o, chatSol(V, pt.x + 80, pt.y + 6), function(){
      chatPose(V, o, 'saute');
      apres(V, 450, function(){
        tb.renverse = 1; redessiner(V, tb);
        V.etat.betises.push({t:'tabouret', o:tb.id});
        chatPose(V, o, 'assis'); chatPlanifier(V, o, 3000);
        var tx = 'Patatras ! ' + nomChat(o) + ' a renversé le tabouret. Touche-le pour le relever.';
        toast(V, '<b>🐈 💥 🪑</b> ' + esc(tx), 5200, tx); son(V, 'ko'); changer(V); fin();
      });
    });
  } else {
    var p = chatPos(V, o), y2 = borne(p.y + 30, SOL_MIN + 40, solMax(V) - 10), x2 = borne(p.x + (p.x > 600 ? -220 : 220), solXmin(V, y2) + 60, solXmax(V, y2) - 60);
    chatAller(V, o, chatSol(V, x2, y2), function(){
      V.etat.n++;
      var b2 = {id:'b' + V.etat.n, t:'pelote', x0:p.x, y0:Math.max(p.y, SOL_MIN + 30), x:x2, y:y2, pc:V.salle || undefined, c:['#e86f9c', '#5f8fd9', '#f2b63c'][V.etat.n % 3]};
      V.etat.betises.push(b2);
      dessinerBetises(V, b2.id);
      chatPose(V, o, 'lave'); chatPlanifier(V, o, 3000);
      var tx = nomChat(o) + ' a déroulé une pelote de laine partout ! Touche-la pour la rembobiner.';
      toast(V, '<b>🐈 🧶</b> ' + esc(tx), 5200, tx); son(V, 'tic'); changer(V); fin();
    });
  }
  return true;
}
/* Le dessin d'une bêtise, couchée sur le plancher, dans la perspective de la pièce */
function dessinBetise(b){
  if(b.t === 'fiole'){
    var m = surSol(b.x, b.y), R = repere([m.X, 0, m.Z], AXES_FACE, 120, 40), x = ajouterOutils3d(ctx3d(R, false));
    x.p = 80; x.cat = {w:120, h:40};
    var s = sansTrait(x.disque(60, 40, 46, 40, b.c, ' opacity=".7"', 30)) + x.tube([30, 26, 40], [86, 30, 46], 13, G('verre'), null, G('verre')) +
      x.tube([86, 30, 46], [100, 31, 48], 5, G('verre'), null, '#c58a4a') + sansTrait(x.tube([36, 30, 40], [70, 32, 44], 7, b.c, null, null, ' opacity=".85"'));
    return {svg:s, bb:x.bb.slice(), R:R, w:120, h:40};
  }
  var m0 = surSol(b.x0, b.y0), m1 = surSol(b.x, b.y), R2 = repere([m1.X, 0, m1.Z], AXES_FACE, 80, 60), y = ajouterOutils3d(ctx3d(R2, false));
  y.p = 60; y.cat = {w:80, h:60};
  /* le fil de laine qui serpente depuis l'endroit où le chat l'a prise */
  var A = y.Q(40, 60, 30), pts = [];
  for(var i = 0; i <= 10; i++){ var tt = i / 10, X = m1.X + (m0.X - m1.X) * tt, Z = m1.Z + (m0.Z - m1.Z) * tt, W = proj(X + Math.sin(tt * 9) * 30, 0, Z + Math.cos(tt * 7) * 14); pts.push([40 + (W[0] - R2.A[0]) / R2.k, 60 + (W[1] - R2.A[1]) / R2.k]); }
  var s2 = T(lisse(pts, false), b.c, 4) + y.boule(40, 34, 30, 22, b.c) + y.sur(T('M24,26 C34,20 46,22 56,30 M22,38 C34,32 48,34 58,42', sombre(b.c, 0.3), 2.5), 8);
  pts.forEach(function(q){ y.bb[0] = Math.min(y.bb[0], q[0]); y.bb[1] = Math.min(y.bb[1], q[1]); y.bb[2] = Math.max(y.bb[2], q[0]); y.bb[3] = Math.max(y.bb[3], q[1]); });
  return {svg:s2, bb:y.bb.slice(), R:R2, w:80, h:60};
}
function dessinerBetises(V, neuf){
  (V.elB || []).forEach(function(e){ e.remove(); });
  V.elB = [];
  dessinerCoffret(V);     /* (le coffret de Mimi, s'il attend d'être ouvert) */
  V.etat.betises.filter(function(b){ return b.t !== 'tabouret' && (b.pc ? 1 : 0) === V.salle; }).forEach(function(b){
    /* (une zone de toucher d'au moins 120 unités : un doigt d'enfant la touche facilement) */
    var D = dessinBetise(b), bb = D.bb, cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2, hw = Math.max(60, (bb[2] - bb[0]) / 2 + 16), hh = Math.max(60, (bb[3] - bb[1]) / 2 + 16);
    var bx = [cx - hw, cy - hh, cx + hw, cy + hh], bw = bx[2] - bx[0], bh = bx[3] - bx[1], A = D.R.A, k = D.R.k;
    var d = document.createElement('div');
    d.className = 'at-fixe at-touche at-betise'; d.setAttribute('data-at', 'betise'); d.setAttribute('data-b', b.id);
    d.setAttribute('role', 'button'); d.setAttribute('aria-label', b.t === 'fiole' ? 'Ramasser la fiole' : 'Rembobiner la pelote');
    d.innerHTML = '<svg viewBox="' + [bx[0], bx[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true"><rect x="' + f1(bx[0]) + '" y="' + f1(bx[1]) + '" width="' + f1(bw) + '" height="' + f1(bh) + '" rx="' + f1(Math.min(bw, bh) / 3) + '" fill="transparent"/>' + D.svg + '</svg>';
    d.style.left = pX(V, A[0] + bx[0] - D.w / 2); d.style.top = pY(V, A[1] + bx[1] - D.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((D.w / 2 - bx[0]) / bw * 100).toFixed(2) + '% ' + ((D.h - bx[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', k.toFixed(3));
    d.style.zIndex = Math.round((1000 + A[1]) * 5);
    d._s = k;
    V.scene.appendChild(d);
    V.elB.push(d);
    if(neuf === b.id) anim(d, [{transform:'translateY(-' + Math.round(160 * V.k) + 'px) scale(' + k + ') rotate(-40deg)', opacity:0.4}, {transform:'translateY(0) scale(' + k + ')', opacity:1}], {duration:520, easing:'ease-in'});
  });
}
function reparerBetise(V, id){
  var b = V.etat.betises.filter(function(x){ return x.id === id; })[0], d = (V.elB || []).filter(function(e){ return e.getAttribute('data-b') === id; })[0];
  if(!b) return;
  V.etat.betises = V.etat.betises.filter(function(x){ return x !== b; });
  if(d) anim(d, [{transform:'scale(' + d._s + ')', opacity:1}, {transform:'translateY(-' + Math.round(140 * V.k) + 'px) scale(' + d._s * 0.6 + ')', opacity:0}], {duration:450, easing:'ease-in', fill:'forwards'});
  apres(V, 460, function(){ if(d) d.remove(); });
  var t = b.t === 'fiole' ? 'La fiole est remise à sa place !' : 'La pelote est rembobinée !';
  toast(V, '<b>' + (b.t === 'fiole' ? '🧪' : '🧶') + ' ✔</b> ' + esc(t), 2400, t);
  son(V, 'magie');
  changer(V);
}

/* ---------- Le chaton (à partir de l'enquête 4), puis Mimi part vivre chez Odette ---------- */
function portee(V, dt, moment){
  var t = tama(V), P = t.portee;
  if(enqueteNo(V) < PORTEE.enquete || P.phase >= 3) return;
  var meres = chatsTous(V).filter(function(o){ return !o.chaton; });
  if(!meres.length) return;
  var mere = meres[0];
  if(P.phase === 0){ P.phase = 1; P.t = 0; mere.ronde = 1; majHumeur(V, mere);
    if(salleDe(mere) === V.salle){ var t0 = nomChat(mere) + ' a un gros ventre tout rond… il va se passer quelque chose !'; toast(V, '<b>🐈 ✨</b> ' + esc(t0), 5000, t0); }
    changer(V); return; }
  P.t += dt;
  /* (les grands moments se passent sous les yeux de l'enfant : la pièce du chat est à l'écran) */
  var vu = salleDe(mere) === V.salle && V.mode === 'ranger' && !moment;
  if(P.phase === 1 && P.t >= PORTEE.naissance && vu){ naissance(V, mere); P.phase = 2; P.t = 0; changer(V); return; }
  if(P.phase === 2){
    chatsTous(V).forEach(function(c){
      if(!c.chaton) return;
      var tl = Math.round(Math.min(0.86, 0.68 + 0.18 * P.t / PORTEE.depart) * 100) / 100, stc = V.chats[c.id];
      if(tl !== c.taille){ c.taille = tl; if(V.elO[c.id] && !(stc && (stc.anim || stc.tenu))) placerEl(V, c); }     /* il grandit un peu */
    });
    if(P.t >= PORTEE.depart && vu){ departMere(V, mere); P.phase = 3; changer(V); }
  }
}
function naissance(V, mere){
  var pm = chatPos(V, mere), n = chatsTous(V).filter(function(o){ return o.chaton; }).length;
  V.etat.n++;
  var c = {id:'o' + V.etat.n, t:'chat', x:pm.x + 70, y:Math.min(solMax(V), pm.y + 30), f:0, v:(MP.peau(mere.v).p + 1) % 3, st:0, sur:null, chaton:1, taille:0.68, nom:PORTEE.chatons[n % PORTEE.chatons.length], b:{faim:90, soif:90, amour:60, jeu:50, dodo:90}};
  if(mere.pc === 1) c.pc = 1;
  if(mere.sur){ c.x = 600; c.y = 760; }
  mere.ronde = 0;
  V.etat.objets.push(c);
  V.parId[c.id] = c;
  var d = elObjet(V, c);
  V.scene.appendChild(d);
  placerEl(V, c);
  anim(d, [{transform:'scale(' + d._s * 0.2 + ')', opacity:0}, {transform:'scale(' + d._s * 1.15 + ')', opacity:1, offset:0.6}, {transform:'scale(' + d._s + ')'}], {duration:700, easing:'ease-out'});
  majHumeur(V, mere); majHumeur(V, c);
  coeursChat(V, mere); coeursChat(V, c);
  var F = cadreObjet(V, c.id); if(F) allerVers(V, F.x, F.y - 60);
  var t = 'Un chaton est né ! Il s\'appelle ' + c.nom + '. Il a besoin de toi, lui aussi.';
  toast(V, '<b>🐈 💕 🐱</b> ' + esc(t), 6500, t);
  son(V, 'magie');
  chatsDemarrer(V);
}
/* Le départ de Mimi : elle fait au revoir de la patte, puis elle s'en va par la porte (elle vivra chez Odette) */
function departMere(V, mere){
  var st = chatEtat(V, mere), d = V.elO[mere.id];
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  st.tenu = true; st.depart = true;
  chatPose(V, mere, 'salut');
  if(d) d.querySelector('.at-bulle') && (d.querySelector('.at-bulle').hidden = true);
  var t = nomChat(mere) + ' part vivre chez Odette. Tu pourras lui rendre visite au village !';
  toast(V, '<b>🐈 👋 👵</b> ' + esc(t), 8000, t);
  coeursChat(V, mere);
  V.etat.chezOdette.push({nom:nomChat(mere), v:mere.v || 0, enquete:enqueteNo(V), acc:mere.acc ? JSON.parse(JSON.stringify(mere.acc)) : {}});
  /* dans l'état, elle vit déjà chez Odette (même si l'atelier se ferme pendant ses adieux) ; à l'écran, elle dit au revoir puis elle sort */
  var p = chatPos(V, mere);
  V.etat.objets = V.etat.objets.filter(function(o){ return o !== mere; });
  V.etat.objets.forEach(function(o){ if(o.sur && o.sur.o === mere.id) o.sur = null; });
  delete V.parId[mere.id];
  apres(V, 3800, function(){
    var porte = V.salle ? {x:-40, y:640} : {x:PORTE.x, y:SOL_Y + 30};
    if(d) anim(d, [{transform:'translate(0,0) scale(' + d._s + ')', opacity:1}, {transform:'translate(' + ((porte.x - p.x) * V.k).toFixed(0) + 'px,' + ((porte.y - p.y) * V.k).toFixed(0) + 'px) scale(' + (d._s * 0.7) + ')', opacity:0}], {duration:2200, easing:'ease-in', fill:'forwards'});
    apres(V, 2250, function(){
      if(V.elO[mere.id] === d) delete V.elO[mere.id];
      delete V.chats[mere.id];
      if(d) d.remove();
    });
  });
}

/* ---------- Ce qu'il a envie de faire (appelé par chatAgir) : ses besoins d'abord ; le chaton a ses jeux à lui ---------- */
function chatArreter(V, o){
  var st = chatEtat(V, o), a = st.anim, mv = st.mv;
  if(!a || (mv && mv.mode === 'saute')) return false;
  var f = mv && typeof a.currentTime === 'number' ? borne(a.currentTime / mv.dur, 0, 1) : 1;
  st.anim = null;
  try{ a.cancel(); }catch(e){}
  if(mv && !(st.pos && st.pos.sur)) st.pos = {x:mv.p0.x + (mv.p1.x - mv.p0.x) * f, y:mv.p0.y + (mv.p1.y - mv.p0.y) * f, sur:null};
  placerEl(V, o);
  var d = V.elO[o.id];
  if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
  chatPose(V, o, 'assis');
  return true;
}
function miaou(V, o){
  var u = besoinUrgent(o);
  expression(V, o, 'at-x-miaou', 800);
  flotter(V, o, (u ? u.ic + ' ' : '') + 'Miaou !');
  sonMimi(V, 'miaou');
}
/* Ce qu'elle fait d'elle-même : manger ce qui l'attend, demander, aller à sa litière, faire ses griffes, se poser en petit pain,
   se rouler par terre, bâiller (16 novembre : plein de petites vies, sans qu'on ait rien à faire) */
function tamaAgir(V, o){
  var u = besoinUrgent(o), b = besoins(o), gm = gamellePleine(V, o, 'gamelle'), ge = gamellePleine(V, o, 'eau');
  /* (elle y va si elle a un peu faim… ou si c'est son envie du moment, même le ventre plein) */
  if(gm && (b.faim < 92 || envieDe(V, 'repas')) && Math.random() < 0.8){ chatVaManger(V, o, gm, 'faim'); return true; }
  if(ge && (b.soif < 92 || envieDe(V, 'eau')) && Math.random() < 0.8){ chatVaManger(V, o, ge, 'soif'); return true; }
  if(u && Math.random() < 0.35){ chatPose(V, o, 'assis'); miaou(V, o); chatPlanifier(V, o, 4200); return true; }   /* elle demande */
  /* (la jauge seule) elle a une envie : le plus souvent, ce qu'elle fait la montre — tant qu'on ne l'a pas trouvée ; une fois sa bulle
     sortie, deux fois moins souvent (elle l'a dit : inutile de courir partout pendant quatre minutes) */
  if(!u && V.etat.tama.envie && Math.random() < (envieDite(V) ? ENVIE_SIGNE / 2 : ENVIE_SIGNE) && envieSigne(V, o)) return true;
  if(!o.chaton && Math.random() < 0.05 && chatLitiere(V, o)) return true;
  if(Math.random() < 0.07 && chatGriffoir(V, o)) return true;
  if(o.chaton && Math.random() < 0.45) return chatonJoue(V, o);
  var r = Math.random(), surM = chatSurMeuble(V, o);
  if(r < 0.07 && !surM){ chatPose(V, o, 'pain'); chatPlanifier(V, o, 6000 + Math.random() * 6000); return true; }
  if(r < 0.1 && !surM){ reagir(V, o, 'roule'); chatPlanifier(V, o, 2800); return true; }
  if(r < 0.13){ chatPose(V, o, 'assis'); expression(V, o, 'at-x-baille', 1300); sonMimi(V, 'baille'); chatPlanifier(V, o, 2600); return true; }
  return false;
}
/* Les bêtises du chaton : il court après sa queue, il suit sa maman, il bondit sur une ombre */
function chatonJoue(V, o){
  var r = Math.random(), d = V.elO[o.id], p = chatPos(V, o);
  if(r < 0.35 && d){
    chatPose(V, o, 'marche'); gesteChat(V, o, 'tourne');
    apres(V, 1850, function(){ chatPose(V, o, 'assis'); });
    chatPlanifier(V, o, 2800);
    return true;
  }
  var mere = chatsDe(V).filter(function(c){ return !c.chaton; })[0];
  if(r < 0.7 && mere){
    var pm = chatPos(V, mere);
    chatAller(V, o, chatSol(V, pm.x + (pm.x > 600 ? -90 : 90), Math.max(SOL_MIN + 40, pm.y)), function(){ chatPose(V, o, 'lave'); chatPlanifier(V, o, 2500 + Math.random() * 2000); });
    return true;
  }
  var cible = chatSol(V, p.x + (Math.random() < 0.5 ? -110 : 110), p.y + (Math.random() - 0.5) * 40);
  chatBouger(V, o, cible, 'saute', function(){ chatPose(V, o, 'assis'); chatPlanifier(V, o, 1800 + Math.random() * 1500); });
  return true;
}
/* Une sieste : souvent dans un de ses coins (le panier, le lit, le pouf, l'arbre à chat…) */
function chatSieste(V, o){
  var l = surfacesChat(V).filter(function(sf){ var par = V.parId[sf.sur.o]; return par && DODO_ICI.test(par.t); });
  if(!l.length || Math.random() < 0.35) return false;
  var c = l[Math.floor(Math.random() * l.length)], st = chatEtat(V, o);
  chatAller(V, o, c, function(){
    chatSeCoucher(V, o);
    st.dortJusqua = Date.now() + 12000 + Math.random() * 9000;
    chatPlanifier(V, o, st.dortJusqua - Date.now() + 30);
    apres(V, 1800, function(){ dodoCoin(V, o); });      /* (étape 2 : une sieste dans son coin, ça compte) */
  });
  return true;
}
/* Pour le village : qui vit chez Odette (et ce qu'elle en dit) */
function chezOdette(etat){ return ((etat && etat.chezOdette) || []).map(function(c){ return {nom:c.nom, v:c.v, enquete:c.enquete, acc:c.acc || {}}; }); }
function repliqueOdette(etat){
  var l = chezOdette(etat);
  if(!l.length) return null;
  var n = l[0].nom;
  return {q:REPLIQUE_ODETTE.q.replace('%n', n), a:REPLIQUE_ODETTE.a.replace('%n', n), chat:n, v:l[0].v};
}

/* ==========================================================
   Mimi, le chat de l'Alchimiste (étape 4 ; DESIGN-saison1.md, 12.3)
   - Sa barre de bonheur : on le touche, elle apparaît au-dessus de lui (la moyenne de ses besoins) ; elle monte quand on le nourrit,
     le caresse, joue avec lui. À côté, 🎀 ouvre sa garde-robe.
   - La chatière, dans la porte de l'atelier : elle bascule quand il passe.
   - Utile à l'enquête : bien heureux (barre ≥ 80), au plus une fois par moment, il sort par la chatière et revient avec un ingrédient
     dans la gueule (parfois un rare), posé avec la cueillette devant la porte. Pendant une potion, il dresse les oreilles quand on
     verse le bon ingrédient (voir 50-chaudron.js).
   - Ses jeux : une petite souris traverse de temps en temps (il se tapit, remue les fesses, bondit : il l'attrape ou il la rate en
     galipette) ; il suit le doigt qui glisse sur le plancher ; une dizaine de mouvements quand on joue, jamais deux fois le même de suite.
   - Sa garde-robe : colliers, nœuds, clochette, petits chapeaux, en couleurs (et quelques rares qui brillent). On gagne un accessoire
     quand l'Alchimiste réussit un de SES mini-jeux, la première fois pour chaque mini-jeu (Atelier.mjGagne, appelé par le moteur ;
     le chaudron de l'atelier, ici même).
   L'état : etat.garde = {a:[accessoires gagnés], neuf:[pas encore vus], mj:{type:1}, annonce:[déjà annoncés]} ; sur le chat, o.acc = {cou, tete} ;
   etat.tama.sortie (le moment de la dernière sortie), tama.souris (secondes de jeu), tama.butin (l'ingrédient qu'il rapporte, s'il est dehors).
   ========================================================== */
var BONHEUR_SORTIE = 85;            /* barre bien pleine (il arrive à 80 : il faut d'abord bien s'occuper de lui) : il peut aller chercher un ingrédient */
var SOURIS_MIN = 150;               /* une souris au plus toutes les 2 min 30 de jeu */
var BUTIN = ['champignon', 'trefle', 'menthe', 'baies', 'pensee', 'lavande'];   /* ce qu'un chat peut rapporter dans la gueule (pas de liquide !) */
var BUTIN_RARE = ['ortie', 'racine', 'lune'];
var ACC = {
  collier_rouge:{slot:'cou', f:'collier', c:'#e0443a', nom:'Collier rouge'},
  collier_bleu:{slot:'cou', f:'collier', c:'#3d8ef0', nom:'Collier bleu'},
  collier_vert:{slot:'cou', f:'collier', c:'#4cbb5c', nom:'Collier vert'},
  clochette:{slot:'cou', f:'clochette', c:'#e86f9c', nom:'Collier à clochette'},
  noeud_pap_violet:{slot:'cou', f:'papillon', c:'#9d6ee3', nom:'Nœud papillon violet'},
  noeud_pap_jaune:{slot:'cou', f:'papillon', c:'#f2b63c', nom:'Nœud papillon jaune'},
  foulard:{slot:'cou', f:'foulard', c:'#3fcf9a', nom:'Petit foulard'},
  noeud_rose:{slot:'tete', f:'noeud', c:'#ff7fb3', nom:'Nœud rose'},
  noeud_bleu:{slot:'tete', f:'noeud', c:'#5fb8ff', nom:'Nœud bleu ciel'},
  sorciere:{slot:'tete', f:'sorciere', c:'#7b4ac9', nom:'Chapeau de sorcière'},
  beret:{slot:'tete', f:'beret', c:'#d33a3a', nom:'Béret rouge'},
  fete:{slot:'tete', f:'fete', c:'#f2b63c', nom:'Chapeau de fête'},
  fleurs:{slot:'tete', f:'fleurs', c:'#ff8fb3', nom:'Couronne de fleurs'},
  perles:{slot:'cou', f:'perles', c:'#fff6e0', nom:'Collier de perles', rare:true},
  arc:{slot:'cou', f:'collier', c:'arc', nom:'Collier arc-en-ciel', rare:true},
  couronne:{slot:'tete', f:'couronne', c:'#f5c542', nom:'Couronne d\'or', rare:true},
  mage:{slot:'tete', f:'sorciere', c:'#2c3572', nom:'Chapeau de magicien étoilé', rare:true, etoiles:true}
};
var ACC_RARE = 0.15;
/* (17 novembre) les habits rigolos (mimi-habits.js) : une vingtaine de plus, avec leurs petites animations ; h : dessiné par MimiPantin.habit ;
   art : son nom avec son article, pour le conteur ; pl : au pluriel (« des lunettes ») */
cles(MP.HABITS || {}).forEach(function(id){ var h = MP.HABITS[id]; ACC[id] = {slot:h.slot, f:'habit', c:'#fff', nom:h.nom, art:h.art, pl:h.pl, h:1}; });
var ACC_OU = MP.HABITS_OU || [['cou', 'Autour du cou'], ['tete', 'Sur la tête']];

/* (16 novembre : plus de barre posée sur le chat — le toucher lui fait faire une mimique ; son bonheur est dans la barre de Mimi 🐾) */
function bonheurHTML(o){ return ''; }
function cacherBonheur(V, o){}
function montrerBonheur(V, o){ majBarre(V, true); }

/* ---------- La garde-robe ---------- */
function garde(e){ if(!e.garde || typeof e.garde !== 'object') normaliserChat(e); return e.garde; }
/* Un mini-jeu de l'Alchimiste réussi : la première fois pour ce mini-jeu, un accessoire (parfois un rare) ; sinon rien */
function gagnerAcc(e, type){
  var G = garde(e);
  if(!type || G.mj[type]) return null;
  G.mj[type] = 1;
  var libres = cles(ACC).filter(function(id){ return G.a.indexOf(id) < 0; });
  if(!libres.length) return null;
  var rares = libres.filter(function(id){ return ACC[id].rare; }), communs = libres.filter(function(id){ return !ACC[id].rare; });
  var l = (rares.length && (Math.random() < ACC_RARE || !communs.length)) ? rares : communs;
  var id = l[Math.floor(Math.random() * l.length)];
  G.a.push(id); G.neuf.push(id);
  return id;
}
function mjGagne(S, type){
  try{
    if(!S || typeof S !== 'object') return null;
    if(!S.atelier || typeof S.atelier !== 'object') S.atelier = etatNeuf();      /* (pas encore d'atelier : comme le moteur le crée) */
    var e = S.atelier;
    normaliser(e);
    var id = gagnerAcc(e, type);
    return id ? {id:id, nom:ACC[id].nom, rare:!!ACC[id].rare} : null;
  }catch(er){ return null; }
}
/* « Il attend », « Elle attend », « Elles attendent »… : selon l'habit */
function attendAcc(id){ var t = articleAcc(id); return /^des /.test(t) ? (/^des (antennes|oreilles|lunettes)/.test(t) ? 'Elles attendent' : 'Ils attendent') : /^une /.test(t) ? 'Elle attend' : 'Il attend'; }
function nomAcc(id){ var a = ACC[id]; return a ? a.nom.charAt(0).toLowerCase() + a.nom.slice(1) : ''; }
function articleAcc(id){ var a = ACC[id]; if(!a) return ''; if(a.art) return a.art; return (/^(Couronne|Petit foulard)/.test(a.nom) ? (a.nom.indexOf('Couronne') === 0 ? 'une ' : 'un ') : /^(Collier|Nœud|Chapeau|Béret)/.test(a.nom) ? 'un ' : 'un ') + nomAcc(id); }
/* LES HABITS GAGNÉS PAR LE TRAVAIL DE L'ALCHIMISTE (17 novembre ; Bible §12.66, point 4 : « les habits gagnés par le travail de
   l'Alchimiste (une analyse ou une potion finie) » ; Romain, le 16 : « l'Alchimiste a quasiment plus de mini-jeux »). Chaque analyse
   finie, chaque potion finie (au chaudron, ou à l'établi des plantes) : Mimi fouille sa malle à déguisements et en sort un des habits
   rigolos (mimi-habits.js), tant qu'il en reste. Ils ne viennent plus de ses coffrets. etat.garde.trav : les travaux déjà comptés.
   Pas pendant le guidage du tutoriel (ses bulles passeraient devant) : ce qui n'est pas donné l'est à la prochaine ouverture. */
var MALLE_MAX = 3;      /* au plus trois d'un coup (le travail d'avant cette version : compté, mais pas tout récompensé) */
function travauxFaits(V){
  var l = [];
  try{
    var P = window.M && M.P ? M.P() : null, E = window.M && M.E ? M.E() : null;
    if(!P || !E) return l;
    cles(P.analyses || {}).forEach(function(id){ if(P.analyses[id]) l.push('an:' + E.id + ':' + id); });
    cles(P.vus || {}).forEach(function(k){ if(k.indexOf('fiole:') === 0) l.push('fi:' + E.id + ':' + k.slice(6)); });
  }catch(e){}
  return l;
}
function malleReste(G){ return cles(MP.HABITS || {}).filter(function(id){ return G.a.indexOf(id) < 0; }); }
/* des travaux neufs : un habit de la malle pour chacun (au plus MALLE_MAX), et le conteur le dit. plus : des clés en plus (le chaudron) */
function travauxMaj(V, plus){
  if(GUIDE || V.o.tutoriel) return [];
  var G = garde(V.etat), neufs = travauxFaits(V).concat(plus || []).filter(function(k){ return G.trav.indexOf(k) < 0; });
  if(!neufs.length) return [];
  var dons = [];
  neufs.forEach(function(k){
    G.trav.push(k);
    var l = malleReste(G);
    if(!l.length || dons.length >= MALLE_MAX) return;
    var id = l[Math.floor(Math.random() * l.length)];
    G.a.push(id); G.neuf.push(id); G.annonce.push(id); dons.push(id);
  });
  changer(V);
  if(dons.length){
    var c = chatsTous(V)[0], nom = c ? nomChat(c) : PORTEE.mere, quoi = dons.map(articleAcc);
    var t = 'Beau travail d\'Alchimiste ! Pour fêter ça, ' + nom + ' a fouillé sa malle à déguisements : ' + (quoi.length > 1 ? quoi.slice(0, -1).join(', ') + ' et ' + quoi[quoi.length - 1] + ' ! Ils attendent' : quoi[0] + ' ! ' + attendAcc(dons[0])) + ' dans sa garde-robe 🎀.';
    (function montrer(n){ if(V.arrete) return; if(!V.toastEl.hidden && n < 8){ apres(V, 1500, function(){ montrer(n + 1); }); return; } toast(V, '<b>🧳 ✨</b> ' + esc(t), 7000, t); son(V, 'magie'); majBarre(V); })(0);
  }
  return dons;
}
/* Les nouveautés gagnées pendant les mini-jeux : annoncées une fois, à l'ouverture de l'atelier */
function annoncerAcc(V){
  var G = garde(V.etat), l = G.neuf.filter(function(id){ return G.annonce.indexOf(id) < 0; });
  if(!l.length) return;
  l.forEach(function(id){ G.annonce.push(id); });
  var chat = chatsTous(V)[0], nom = chat ? nomChat(chat) : PORTEE.mere, rare = l.some(function(id){ return ACC[id].rare; });
  var t = (rare ? 'Un cadeau rare pour ' : 'Un cadeau pour ') + nom + ' : ' + l.map(articleAcc).join(' et ') + ' ! Il l\'attend dans sa garde-robe, au fond de sa barre 🐾.';
  apres(V, 900, function(){ toast(V, '<b>🎁 ' + (rare ? '✨' : '🎀') + '</b> ' + esc(t), 6500, t); son(V, rare ? 'magie' : 'gain'); });
  changer(V);
}
/* Le dessin d'un accessoire sur la tête du chat (cx, cy : le milieu de sa tête) */
function couleurAcc(a){ return a.c === 'arc' ? 'url(#atg-arc)' : a.c; }
function dessinAcc(id, cx, cy){
  var a = ACC[id];
  if(!a) return '';
  if(a.h){ var hb = MP.habit(id); return cx || cy ? '<g transform="translate(' + f1(cx) + ',' + f1(cy) + ')">' + hb + '</g>' : hb; }
  var c = couleurAcc(a), s = '', f1c = function(v){ return f1(v); };
  if(a.slot === 'cou'){
    var d = 'M' + f1c(cx - 15) + ',' + f1c(cy + 10) + ' Q' + f1c(cx) + ',' + f1c(cy + 21) + ' ' + f1c(cx + 15) + ',' + f1c(cy + 10);
    if(a.f === 'perles'){
      for(var i = 0; i <= 6; i++){ var t = i / 6, px = (1 - t) * (1 - t) * (cx - 15) + 2 * (1 - t) * t * cx + t * t * (cx + 15), py = (1 - t) * (1 - t) * (cy + 10) + 2 * (1 - t) * t * (cy + 21) + t * t * (cy + 10); s += '<circle cx="' + f1c(px) + '" cy="' + f1c(py) + '" r="3.2" fill="' + c + '" stroke="' + K + '" stroke-width="1.4"/><circle cx="' + f1c(px - 1) + '" cy="' + f1c(py - 1) + '" r="1" fill="#fff"/>'; }
      return '<g class="at-acc at-acc-cou at-acc-brille">' + s + '</g>';
    }
    if(a.f === 'collier' || a.f === 'clochette') s += T(d, K, 7.5) + T(d, c, 4.2);
    if(a.f === 'clochette') s += '<circle cx="' + f1c(cx) + '" cy="' + f1c(cy + 21) + '" r="4.6" fill="#f5c542" stroke="' + K + '" stroke-width="1.6"/>' + T('M' + f1c(cx - 2.4) + ',' + f1c(cy + 22.5) + ' h4.8', K, 1.2);
    else if(a.f === 'collier') s += '<circle cx="' + f1c(cx) + '" cy="' + f1c(cy + 19.5) + '" r="2.8" fill="#f5c542" stroke="' + K + '" stroke-width="1.3"/>';
    if(a.f === 'papillon') s += '<path d="M' + f1c(cx) + ',' + f1c(cy + 17) + ' l-9,-5 v11 Z M' + f1c(cx) + ',' + f1c(cy + 17) + ' l9,-5 v11 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + f1c(cx) + '" cy="' + f1c(cy + 17.5) + '" r="2.4" fill="' + sombre(c, 0.25) + '" stroke="' + K + '" stroke-width="1.2"/>';
    if(a.f === 'foulard') s += '<path d="M' + f1c(cx - 13) + ',' + f1c(cy + 11) + ' Q' + f1c(cx) + ',' + f1c(cy + 19) + ' ' + f1c(cx + 13) + ',' + f1c(cy + 11) + ' L' + f1c(cx + 2) + ',' + f1c(cy + 30) + ' Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + f1c(cx - 3) + '" cy="' + f1c(cy + 19) + '" r="1.4" fill="#fff"/><circle cx="' + f1c(cx + 3) + '" cy="' + f1c(cy + 23) + '" r="1.4" fill="#fff"/>';
    return '<g class="at-acc at-acc-cou' + (a.rare ? ' at-acc-brille' : '') + '">' + s + '</g>';
  }
  /* sur la tête (entre les oreilles) */
  var y0 = cy - 12;
  if(a.f === 'noeud') s += '<path d="M' + f1c(cx + 10) + ',' + f1c(cy - 15) + ' l-8,-7 v13 Z M' + f1c(cx + 10) + ',' + f1c(cy - 15) + ' l8,-7 v13 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><circle cx="' + f1c(cx + 10) + '" cy="' + f1c(cy - 15) + '" r="2.6" fill="' + sombre(c, 0.2) + '" stroke="' + K + '" stroke-width="1.2"/>';
  if(a.f === 'sorciere'){
    s += '<ellipse cx="' + f1c(cx) + '" cy="' + f1c(y0) + '" rx="16" ry="3.6" fill="' + c + '" stroke="' + K + '" stroke-width="1.8"/>' +
      '<path d="M' + f1c(cx - 9) + ',' + f1c(y0) + ' L' + f1c(cx + 6) + ',' + f1c(y0 - 28) + ' L' + f1c(cx + 9) + ',' + f1c(y0) + ' Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += a.etoiles ? '<path d="M' + f1c(cx + 1) + ',' + f1c(y0 - 15) + ' l1.6,3.2 3.4,.4 -2.5,2.3 .7,3.4 -3.2,-1.7 -3,1.7 .6,-3.4 -2.5,-2.3 3.4,-.4 Z" fill="#ffe36b"/><circle cx="' + f1c(cx - 3) + '" cy="' + f1c(y0 - 4) + '" r="1.3" fill="#fff"/>' :
      T('M' + f1c(cx - 7.5) + ',' + f1c(y0 - 3) + ' L' + f1c(cx + 8.5) + ',' + f1c(y0 - 3), '#f5c542', 2.4);
  }
  if(a.f === 'beret') s += '<ellipse cx="' + f1c(cx + 2) + '" cy="' + f1c(y0 - 2) + '" rx="14" ry="5.5" fill="' + c + '" stroke="' + K + '" stroke-width="1.8"/>' + T('M' + f1c(cx + 2) + ',' + f1c(y0 - 7) + ' v-4', K, 2.4);
  if(a.f === 'fete'){
    s += '<path d="M' + f1c(cx - 8) + ',' + f1c(y0) + ' L' + f1c(cx) + ',' + f1c(y0 - 22) + ' L' + f1c(cx + 8) + ',' + f1c(y0) + ' Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      T('M' + f1c(cx - 5) + ',' + f1c(y0 - 7) + ' L' + f1c(cx + 5) + ',' + f1c(y0 - 4) + ' M' + f1c(cx - 3) + ',' + f1c(y0 - 14) + ' L' + f1c(cx + 3) + ',' + f1c(y0 - 12), '#e0443a', 2) +
      '<circle cx="' + f1c(cx) + '" cy="' + f1c(y0 - 23) + '" r="3.2" fill="#ff8fb3" stroke="' + K + '" stroke-width="1.4"/>';
  }
  if(a.f === 'fleurs') ['#ff8fb3', '#ffd84a', '#8fd0ff', '#ff8fb3', '#b796ff'].forEach(function(col, i){ var ang = Math.PI * (1.15 + i * 0.175), fx = cx + Math.cos(ang) * 17, fy = cy - 2 + Math.sin(ang) * 15; s += '<circle cx="' + f1c(fx) + '" cy="' + f1c(fy) + '" r="3.6" fill="' + col + '" stroke="' + K + '" stroke-width="1.3"/><circle cx="' + f1c(fx) + '" cy="' + f1c(fy) + '" r="1.2" fill="#fff4a8"/>'; });
  if(a.f === 'couronne') s += '<path d="M' + f1c(cx - 11) + ',' + f1c(y0 + 1) + ' l0,-12 5,6 6,-10 6,10 5,-6 0,12 Z" fill="' + c + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"/><circle cx="' + f1c(cx) + '" cy="' + f1c(y0 - 4) + '" r="2.2" fill="#e0443a"/><circle cx="' + f1c(cx - 6) + '" cy="' + f1c(y0 - 3) + '" r="1.5" fill="#3d8ef0"/><circle cx="' + f1c(cx + 6) + '" cy="' + f1c(y0 - 3) + '" r="1.5" fill="#4cbb5c"/>';
  return '<g class="at-acc at-acc-tete' + (a.rare ? ' at-acc-brille' : '') + '">' + s + '</g>';
}
function accDe(o, slot){ var a = o && o.acc && o.acc[slot]; return a && ACC[a] ? a : null; }
/* La petite image d'un accessoire (dans la garde-robe) : sur une tête de chat */
function vignetteAcc(id, v){
  var a = ACC[id];
  var seul = {}; if(a) seul[a.slot] = id;
  return '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(vChat(v), 57, 18, seul) + '</svg>';
}
function ouvrirGarde(V, oid){
  var o = V.parId[oid] || chatsDe(V)[0];
  if(!o) return;
  V.gardeChat = o.id;
  ouvrirCalque(V, 'at-cal-garde', htmlGarde(V));
  var G = garde(V.etat); if(G.neuf.length || mimi(V).peauNeuve){ G.neuf = []; delete mimi(V).peauNeuve; changer(V); majBarre(V); }
  son(V, 'page');
}
function dessinerGarde(V){ if(!V.parId[V.gardeChat]){ fermerGrimoire(V); return; } V.grim.innerHTML = htmlGarde(V); }
function htmlGarde(V){
  var o = V.parId[V.gardeChat];
  if(!o) return '';
  var G = garde(V.etat), nom = nomChat(o), p = vChat(o.v), neuf = G.neuf.slice();
  var t = G.a.length ? 'La garde-robe de ' + nom + '. Ses habits ne s\'achètent pas : il en arrive un dans ses coffrets, ou quand tu réussis un de tes mini-jeux pour la première fois.' :
    'La garde-robe est encore vide. Les habits ne s\'achètent pas : ils arrivent dans les coffrets de ' + nom + ', ou quand tu réussis un de tes mini-jeux pour la première fois.';
  if(!o.chaton) t += ' Ses pelages et ses yeux, eux, se gagnent avec ses photos 📷 et dans ses coffrets.';
  var corps = '<div class="at-garde-haut"><span class="at-garde-chat">' + '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(p, 57, 18, o.acc || {}) + '</svg></span>' +
    '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p></div>';
  /* (16 novembre) son pelage et ses yeux : ceux qu'elle a gagnés (ses photos, ses coffrets) ; le sien est toujours là */
  if(!o.chaton){
    var q = MP.peau(o.v), PX = mimi(V).peaux, mesP = [q.p].concat(PX.p).filter(function(x, i, l){ return l.indexOf(x) === i; }).sort(function(a, b){ return a - b; });
    var resteP = CHATS.length - mesP.length, resteY = MP.YEUX.length - PX.y.length, vg = function(v){ return '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(v, 57, 18, {}) + '</svg>'; };
    var verrou = function(n){ return n > 0 ? '<span class="at-garde-it at-garde-verrou" aria-label="À gagner"><span class="at-garde-rien">🔒</span><small>' + n + ' à gagner</small></span>' : ''; };
    corps += '<div class="at-garde-slot"><b>Son pelage</b><div class="at-garde-l">' + mesP.map(function(i){
      return '<button type="button" class="at-garde-it' + (q.p === i ? ' on' : '') + '" data-peau="p:' + i + '" aria-label="' + esc(MP.PELAGES[i]) + '">' + vg(MP.numero(i, q.y)) + '<small>' + esc(MP.PELAGES[i]) + '</small></button>'; }).join('') + verrou(resteP) + '</div></div>';
    corps += '<div class="at-garde-slot"><b>Ses yeux</b><div class="at-garde-l">' +
      '<button type="button" class="at-garde-it' + (q.y < 0 ? ' on' : '') + '" data-peau="y:-1" aria-label="Ses yeux à elle">' + vg(MP.numero(q.p, -1)) + '<small>Les siens</small></button>' +
      PX.y.slice().sort(function(a, b){ return a - b; }).map(function(j){
        return '<button type="button" class="at-garde-it' + (q.y === j ? ' on' : '') + '" data-peau="y:' + j + '" aria-label="' + esc(MP.YEUX[j][2]) + '">' + vg(MP.numero(q.p, j)) + '<small>' + esc(MP.YEUX[j][2]) + '</small></button>'; }).join('') + verrou(resteY) + '</div></div>';
  }
  ACC_OU.forEach(function(sl){
    var porte = accDe(o, sl[0]), mes = G.a.filter(function(id){ return ACC[id].slot === sl[0]; }), tous = cles(ACC).filter(function(id){ return ACC[id].slot === sl[0]; });
    corps += '<div class="at-garde-slot"><b>' + esc(sl[1]) + '</b><div class="at-garde-l">' +
      '<button type="button" class="at-garde-it' + (!porte ? ' on' : '') + '" data-acc="" data-slot="' + sl[0] + '" aria-label="Rien"><span class="at-garde-rien">✖</span><small>Rien</small></button>' +
      mes.map(function(id){ var a = ACC[id]; return '<button type="button" class="at-garde-it' + (porte === id ? ' on' : '') + (a.rare ? ' rare' : '') + '" data-acc="' + id + '" data-slot="' + sl[0] + '" aria-label="' + esc(a.nom) + '">' + vignetteAcc(id, o.v) + (neuf.indexOf(id) >= 0 ? '<i class="at-garde-neuf" aria-label="nouveau">✨</i>' : '') + '<small>' + esc(a.nom) + '</small></button>'; }).join('') +
      (tous.length > mes.length ? '<span class="at-garde-it at-garde-verrou" aria-label="À gagner"><span class="at-garde-rien">🔒</span><small>' + (tous.length - mes.length) + ' à gagner</small></span>' : '') +
      '</div></div>';
  });
  return feuille('at-f-garde', '<span class="at-f-ic">🎀</span><h3>La garde-robe de ' + esc(nom) + '</h3>', corps);
}
/* Elle change de pelage (« p:3 ») ou d'yeux (« y:1 » ; « y:-1 » : les siens) — seulement ceux qu'elle a gagnés ; le sien n'est jamais perdu */
function changerPeau(V, code){
  var o = V.parId[V.gardeChat];
  if(!o || o.chaton) return;
  var k = String(code).charAt(0), i = parseInt(String(code).slice(2), 10), q = MP.peau(o.v), PX = mimi(V).peaux;
  if(k === 'p'){ if(!(i >= 0 && i < CHATS.length) || (i !== q.p && PX.p.indexOf(i) < 0)) return; if(PX.p.indexOf(q.p) < 0) PX.p.push(q.p); q.p = i; }
  else if(k === 'y'){ if(!(i === -1 || PX.y.indexOf(i) >= 0)) return; q.y = i; }
  else return;
  o.v = MP.numero(q.p, q.y);
  redessiner(V, o); majHumeur(V, o);
  coeursChat(V, o, '✨');
  son(V, 'magie');
  changer(V); majBarre(V);
  dessinerGarde(V);
}
/* un pelage ou des yeux de plus (une récompense : ses photos, ses coffrets) ; rend ce que le conteur en dit */
function donnerPeau(V, code){
  var k = String(code).charAt(0), i = parseInt(String(code).slice(2), 10), m = mimi(V);
  if(k === 'p' && CHATS[i]){ if(m.peaux.p.indexOf(i) < 0) m.peaux.p.push(i); m.peauNeuve = 1; return 'un nouveau pelage (« ' + MP.PELAGES[i] + ' »)'; }
  if(k === 'y' && MP.YEUX[i]){ if(m.peaux.y.indexOf(i) < 0) m.peaux.y.push(i); m.peauNeuve = 1; return 'de nouveaux yeux (« ' + MP.YEUX[i][2] + ' »)'; }
  return '';
}
function habiller(V, id, slot){
  var o = V.parId[V.gardeChat];
  if(!o || (id && (!ACC[id] || garde(V.etat).a.indexOf(id) < 0))) return;
  if(!o.acc || typeof o.acc !== 'object') o.acc = {};
  if(id) o.acc[ACC[id].slot] = id; else delete o.acc[slot];
  redessiner(V, o); majHumeur(V, o);
  coeursChat(V, o);
  son(V, id ? 'magie' : 'clic');
  changer(V);
  dessinerGarde(V);
}

/* ---------- La chatière : elle bascule quand il passe ---------- */
function chatiere(V){
  V.root.classList.remove('at-chatiere-bat'); void V.root.offsetWidth; V.root.classList.add('at-chatiere-bat');
  son(V, 'tic');
  clearTimeout(V.chatiereT);
  V.chatiereT = apres(V, 900, function(){ V.root.classList.remove('at-chatiere-bat'); });
}

/* ---------- Il sort par la chatière, il revient avec un ingrédient ---------- */
function momentCle(V){ return tama(V).moment || (enqueteNo(V) + ':' + (V.o.moment || 'matin')); }
/* (16 novembre) Bien heureuse, elle sort par la chatière et revient avec un petit coffret dans la gueule (Romain : « elle miaule,
   elle sort dehors, elle va chercher quelque chose, et ensuite elle revient avec un truc dans sa bouche ; elle le pose ; c'est une sorte
   de petit coffret cadeau ; on appuie dessus et là, pouf, on a un nouveau jouet pour Mimi »). Plus d'ingrédient rapporté : elle ne sert
   plus à l'enquête (une vieille sauvegarde qui en attendait un le reçoit encore : livrerButin). */
function peutSortir(V, o){
  var st = V.chats[o.id], t = tama(V);
  /* (la jauge seule) sa barre de bonheur est pleine : elle peut y aller — autant de fois qu'on la remplit, sans limite par moment */
  return !V.salle && salleDe(o) === 0 && !t.butin && !t.dehors && !t.coffret && bhPlein(o) &&
    !!st && !st.tenu && !st.anim && st.pose !== 'dort' && !st.depart && !st.passe && !st.caresse && V.mode === 'ranger' && !V.ouvert && V.grim.hidden && !V.jouet && !V.outil;
}
/* une pluie de cœurs au-dessus d'elle (sa barre est pleine) */
function pluieCoeurs(V, o){ ['💖', '❤️', '✨'].forEach(function(ic, i){ apres(V, i * 260, function(){ if(V.elO[o.id]) coeursChat(V, o, ic); }); }); }
/* force : sans regarder si elle peut (les robots) ; code : ce qu'il y aura dedans (les robots ; sinon contenuCoffret) */
function cadeauChat(V, o, force, code){
  var t = tama(V), st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || (!force && !peutSortir(V, o))) return false;
  var cle = momentCle(V), ct = code ? {c:code} : contenuCoffret(V), grand = !!ct.g;
  if(code){ var Fc = FAMILLES.filter(function(F){ return F.l.indexOf(code) >= 0; })[0]; grand = !!Fc && familleReste(V, Fc).join() === code; }
  t.cadeaux[cle] = (t.cadeaux[cle] || 0) + 1;
  t.dehors = {c:ct.c, nom:nomChat(o)};
  if(grand) t.dehors.g = 1;
  t.envie = null; t.envieT = t.jeu + ENVIE_PAUSE;      /* (son envie du moment est passée : elle a mieux à faire) */
  changer(V);
  var id = (V.sortieN = (V.sortieN || 0) + 1);
  st.sortieId = id;
  if(st.anim) chatArreter(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  /* SA BARRE EST PLEINE : elle miaule, des cœurs partout, une galipette… et elle file (plus longtemps pour un coffret doré) */
  chatPose(V, o, 'assis'); expression(V, o, 'at-x-content at-x-joue', 1200); sonMimi(V, grand ? 'fanfare' : 'miaou'); flotter(V, o, '💖 Miaou !');
  pluieCoeurs(V, o); majHumeur(V, o); majBarre(V, true);
  var tg = 'Du bonheur jusqu\'au bout des moustaches ! ' + nomChat(o) + ' file chercher quelque chose…';
  toast(V, '<b>💖 🐈</b> ' + esc(tg), 5200, tg);
  apres(V, 800, function(){ if(st.sortieId !== id || V.arrete || st.tenu) return; chatPose(V, o, 'marche'); gesteChat(V, o, 'galipette'); });
  if(grand) apres(V, 2000, function(){ if(st.sortieId !== id || V.arrete || st.tenu) return; gesteChat(V, o, 'tourne'); pluieCoeurs(V, o); });
  apres(V, grand ? 4000 : 2000, function(){
    if(st.sortieId !== id || V.arrete) return;
    st.vite = 2.4;                                 /* (elle file : au trot) */
    chatAller(V, o, chatSol(V, PORTE.x + 8, SOL_MIN + 14), function(){
      st.vite = 1;
      if(st.sortieId !== id || V.arrete) return;
      var d2 = V.elO[o.id];
      st.tenu = true; chatPose(V, o, 'marche');
      chatiere(V);
      if(d2) anim(d2, [{opacity:1, transform:'scale(' + d2._s + ')'}, {opacity:0, transform:'translateY(-' + Math.round(10 * V.k) + 'px) scale(' + (d2._s * 0.8) + ')'}], {duration:520, easing:'ease-in', fill:'forwards'});
      apres(V, 520, function(){ var d3 = V.elO[o.id]; if(d3) d3.classList.add('at-c-dehors'); });
      var tx = nomChat(o) + ' file par la chatière… Elle mijote quelque chose !';
      if(V.toastEl.hidden) toast(V, '<b>🐈 🚪</b> ' + esc(tx), 3400, tx);      /* (sans cacher un message plus important) */
      apres(V, 6500 + Math.random() * 2500, function(){ retourChat(V, o, id); });
    });
  });
  /* (quoi qu'il arrive en chemin, le coffret arrive : on ne perd jamais rien — mais seulement celui de CETTE sortie-ci : depuis qu'elle
     peut repartir aussitôt sa barre pleine, ce filet-là ne doit pas poser le coffret de la sortie suivante pendant qu'elle est encore dehors) */
  apres(V, grand ? 32000 : 28000, function(){ if(st.sortieId === id && tama(V).dehors) poserCoffret(V, V.parId[o.id] && V.elO[o.id] ? o : null); });
  return true;
}
function sortieChat(V, o, force){ return cadeauChat(V, o, force); }   /* (l'ancien nom : les robots) */
/* ⚠️ Elle est sortie par la chatière en s'effaçant, et cet effacement « reste » (fill:'forwards') : au retour, il faut l'enlever,
   sinon ELLE RESTE INVISIBLE (elle est là, elle bouge, on ne la voit plus) — le défaut était en ligne depuis le 16 novembre, 16 h 44 ;
   trouvé et corrigé le soir même en regardant les images du robot. */
function chatReparait(d){
  if(!d || !d.getAnimations) return;
  try{ d.getAnimations().forEach(function(a){ var f = a.effect && a.effect.getTiming ? a.effect.getTiming().fill : ''; if(a.playState === 'finished' && (f === 'forwards' || f === 'both')) a.cancel(); }); }catch(e){}
}
function retourChat(V, o, id){
  var st = chatEtat(V, o), d = V.elO[o.id], t = tama(V);
  if(!V.parId[o.id]){ poserCoffret(V, null); return; }
  chatiere(V);
  st.tenu = false;
  if(d){
    d.classList.remove('at-c-dehors');
    chatReparait(d);
    if(t.dehors) butinChat(V, o, (t.dehors.g ? '<svg x="-13" y="-10" width="26" height="24.4" ' : '<svg x="-11" y="-8" width="22" height="20.6" ') + coffretSVG(t.dehors.g).slice(5));      /* (le coffret, dans sa gueule : il suit sa tête) */
    anim(d, [{opacity:0, transform:'translateY(-' + Math.round(10 * V.k) + 'px) scale(' + (d._s * 0.8) + ')'}, {opacity:1, transform:'scale(' + d._s + ')'}], {duration:480, easing:'ease-out'});
  }
  chatPose(V, o, 'assis');
  apres(V, 500, function(){
    if(st.sortieId !== id){ poserCoffret(V, o); return; }
    chatAller(V, o, chatSolVisible(V), function(){ poserCoffret(V, o); chatPose(V, o, 'assis'); expression(V, o, 'at-x-content', 600); chatPlanifier(V, o, 3500); });
  });
}
/* Elle pose le coffret par terre, devant elle */
function poserCoffret(V, o){
  var t = tama(V), b = t.dehors;
  if(!b) return false;
  t.dehors = null;
  var p = o && V.elO[o.id] && salleDe(o) === 0 ? chatPos(V, o) : (V.salle ? {x:600, y:700} : chatSolVisible(V)), st = o ? chatEtat(V, o) : null;
  /* à côté d'elle, assez loin pour qu'elle ne soit pas assise dessus (elle est une fois et demie plus grande depuis le pantin, et le
     grand coffret est plus large : à 70, sa tête le cachait à moitié et on la touchait, elle, au lieu du coffret — vu sur un téléphone) */
  var ec = (b.g ? 134 : 110) * echelleSol(p.y), sg = st && st.gauche ? -1 : 1, y = borne(p.y + 24, SOL_MIN + 40, SOL_MAX - 20);
  var xa = borne(p.x + sg * ec, xF(140, y), xF(LARGEUR - 140, y)), xb = borne(p.x - sg * ec, xF(140, y), xF(LARGEUR - 140, y)), x = xa;
  /* (jamais caché derrière quelque chose, jamais collé à elle contre un mur : de l'autre côté d'elle, sinon une place libre du plancher) */
  if(!V.salle){
    var cand = [[xa, y], [xb, y]].filter(function(q){ return Math.abs(q[0] - p.x) > ec * 0.82; });
    var pl = placeLibre(V, cand.length ? cand : [[xa, y]], b.g ? 66 : 50, b.g ? 92 : 70, o ? {x:p.x, y:p.y, r:ec * 0.8} : null); x = pl.x; y = pl.y;
    if(pl.hors) allerVers(V, x, y - 50);      /* (la seule place libre est hors de l'écran : la pièce glisse jusqu'au coffret) */
    /* (malgré tout, il est derrière elle : elle fait deux pas de côté, pour qu'on le voie et qu'on puisse le toucher) */
    if(o && st && !st.depart && Math.abs(x - p.x) < ec * 0.8 && y < p.y + 30 && y > p.y - ec * 1.2){
      var cx = x, cy = y, pas = (p.x >= x ? 1 : -1) * ec * 1.3;
      apres(V, 700, function(){
        var s2 = V.chats[o.id];
        if(!s2 || s2.tenu || s2.anim || s2.caresse || s2.depart || !V.elO[o.id] || !tama(V).coffret) return;
        var c2 = chatSol(V, cx + pas, Math.min(solMax(V), cy + 26));
        if(Math.abs(c2.x - cx) < ec * 0.8) c2 = chatSol(V, cx - pas, Math.min(solMax(V), cy + 26));
        chatAller(V, o, c2, function(){ chatPose(V, o, 'assis'); chatPlanifier(V, o, 3000); });
      });
    }
  }
  t.coffret = {c:b.c, x:Math.round(x), y:Math.round(y)};
  if(b.g) t.coffret.g = 1;
  if(o){ var d = V.elO[o.id], sp = d && d.querySelector('.at-c-butin'); if(sp) sp.remove(); butinChat(V, o, null); if(d){ d.classList.remove('at-c-dehors'); chatReparait(d); } if(st && st.tenu && !st.depart) st.tenu = false; }
  dessinerCoffret(V, true);
  var tx = b.g ? (b.nom || PORTEE.mere) + ' a rapporté un grand coffret doré ! Celui-là, elle ne le sort pas tous les jours…'
    : (b.nom || PORTEE.mere) + ' a rapporté un petit coffret ! Qu\'est-ce qui peut bien se cacher dedans ?';
  (function montrer(n){ if(V.arrete) return; if(!V.toastEl.hidden && n < 6){ apres(V, 1500, function(){ montrer(n + 1); }); return; } toast(V, '<b>🐈 ' + (b.g ? '👑' : '🎁') + '</b> ' + esc(tx), 6000, tx); })(0);
  sonMimi(V, 'coffret');
  changer(V);
  return true;
}
/* Il pose l'ingrédient avec la cueillette, devant la porte */
function livrerButin(V, o){
  var t = tama(V), b = t.butin;
  if(!b) return false;
  t.butin = null;
  var I = INGR[b.ingr] || {nom:b.ingr, ic:'🌿'};
  ajouter(V.etat, b.ingr, 1);
  if(o){ var d = V.elO[o.id], sp = d && d.querySelector('.at-c-butin'); if(sp) sp.remove(); butinChat(V, o, null); if(d){ d.classList.remove('at-c-dehors'); chatReparait(d); } var st = V.chats[o.id]; if(st && st.tenu && !st.depart) st.tenu = false; }
  if(!V.salle){ dessinerTas(V); placerTas(V); }
  majReperes(V); majSalleBouton(V);
  var tx = (b.nom || PORTEE.mere) + ' t\'a rapporté : ' + I.nom + (b.rare ? ' (un ingrédient rare !)' : '') + '. Il est posé devant la porte, avec la cueillette.';
  /* (si un autre message est à l'écran, celui-ci attend un peu qu'il parte) */
  (function montrer(n){ if(V.arrete) return; if(!V.toastEl.hidden && n < 6){ apres(V, 1500, function(){ montrer(n + 1); }); return; } toast(V, '<b>🐈 ' + (I.ic || '🌿') + (b.rare ? ' ✨' : '') + '</b> ' + esc(tx), 6000, tx); })(0);
  son(V, b.rare ? 'magie' : 'gain');
  if(o) coeursChat(V, o);
  changer(V);
  return true;
}

/* ---------- Ses jeux : une dizaine de mouvements, jamais deux fois le même de suite ---------- */
var JEUX = ['bondir', 'roule', 'galipette', 'tape', 'cache', 'rond', 'etire', 'saut', 'queue', 'fesses'];
/* (plus d'animSvg : tout son corps est animé par son pantin — gesteChat) */
/* Avant de dormir, elle tourne sur elle-même, le nez par terre (comme les vrais chats), puis se roule en boule */
function chatSeCoucher(V, o){
  if(MOINS_MOUV || !pantinDe(V, o) || chatEtat(V, o).pose === 'dort'){ chatPose(V, o, 'dort'); return; }
  chatPose(V, o, 'marche'); gesteChat(V, o, 'couche');
  apres(V, 1500, function(){ var s2 = V.chats[o.id]; if(s2 && !s2.tenu && !s2.caresse && !s2.anim && s2.pose === 'marche' && !(V.jouet && V.jouet.o === o)) chatPose(V, o, 'dort'); });
}
function chatJoue(V, o, quoi, seule){
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || st.tenu || st.depart) return null;
  if(st.anim) chatArreter(V, o);
  var l = JEUX.filter(function(j){ return j !== st.dernierJeu; });
  quoi = quoi && quoi !== st.dernierJeu ? quoi : l[Math.floor(Math.random() * l.length)];
  st.dernierJeu = quoi;
  var p = chatPos(V, o), k = V.k, fin = function(ms){ chatPlanifier(V, o, ms || 2600); };
  if(!seule) donner(o, 'jeu', 8);
  if(quoi === 'bondir'){
    var dir = st.gauche ? -1 : 1, c = chatSol(V, p.x + dir * 120, p.y + (Math.random() - 0.5) * 30);
    chatBouger(V, o, c, 'saute', function(){ chatPose(V, o, 'assis'); fin(); });
  } else if(quoi === 'roule'){            /* elle se roule sur le dos, les pattes en l'air, et gigote */
    chatPose(V, o, 'dos'); gesteChat(V, o, 'gigote', {d:1500});
    apres(V, 1700, function(){ var s1 = V.chats[o.id]; if(s1 && s1.pose === 'dos' && !s1.caresse) chatPose(V, o, 'assis'); }); fin(3000);
  } else if(quoi === 'galipette'){        /* une galipette : elle saute et fait un tour complet, roulée en boule */
    chatPose(V, o, 'marche'); gesteChat(V, o, 'galipette');
    apres(V, 1050, function(){ chatPose(V, o, 'assis'); }); fin(2400);
  } else if(quoi === 'tape'){             /* il tape de la patte */
    chatPose(V, o, 'tape'); apres(V, 1400, function(){ chatPose(V, o, 'assis'); }); fin(2400);
  } else if(quoi === 'cache'){            /* elle s'aplatit, les oreilles couchées… et surgit ! */
    chatPose(V, o, 'marche'); gesteChat(V, o, 'cache');
    apres(V, 2050, function(){ chatPose(V, o, 'assis'); }); fin(3000);
  } else if(quoi === 'rond'){             /* il court en rond */
    var r = 70, pts = [[r, 0], [0, r * 0.45], [-r, 0], [0, -r * 0.45], [0, 0]], i = 0;
    (function tour(){
      if(i >= pts.length || chatEtat(V, o).tenu){ chatPose(V, o, 'assis'); fin(1800); return; }
      var q = pts[i++];
      chatBouger(V, o, chatSol(V, p.x + q[0], p.y + q[1]), 'marche', tour);
    })();
  } else if(quoi === 'etire'){            /* elle s'étire : le devant par terre et les fesses en l'air, puis tout en longueur */
    chatPose(V, o, 'marche'); gesteChat(V, o, 'etire');
    apres(V, 1950, function(){ chatPose(V, o, 'assis'); }); fin(2900);
  } else if(quoi === 'saut'){             /* elle bondit en l'air, sur place */
    chatPose(V, o, 'marche'); gesteChat(V, o, 'bond', {h:15 + Math.random() * 8});
    apres(V, 860, function(){ chatPose(V, o, 'assis'); }); fin(2200);
  } else if(quoi === 'queue'){            /* elle court après sa queue */
    chatPose(V, o, 'marche'); gesteChat(V, o, 'tourne');
    apres(V, 1850, function(){ chatPose(V, o, 'assis'); }); fin(2800);
  } else {                                /* elle se tapit, remue les fesses… et bondit sur place */
    chatPose(V, o, 'marche'); d.classList.add('at-c-tapi', 'at-c-fesses');
    apres(V, 1100, function(){ d.classList.remove('at-c-tapi', 'at-c-fesses'); gesteChat(V, o, 'bond', {d:640, h:12}); });
    apres(V, 1800, function(){ chatPose(V, o, 'assis'); }); fin(2700);
  }
  majHumeur(V, o);
  return quoi;
}

/* ---------- La petite souris : elle traverse, il se tapit, remue les fesses, bondit ---------- */
function dessinSouris(){
  return '<svg viewBox="0 0 60 34" aria-hidden="true"><path d="M4,26 C-2,24 0,16 8,18" fill="none" stroke="#c08a8a" stroke-width="2.6" stroke-linecap="round"/>' +
    '<ellipse cx="26" cy="22" rx="18" ry="11" fill="#b9b3c8" stroke="#24182e" stroke-width="2.6"/>' +
    '<circle cx="38" cy="12" r="7" fill="#d9d3e6" stroke="#24182e" stroke-width="2.4"/><circle cx="38" cy="12" r="3.4" fill="#ffb3c6"/>' +
    '<path d="M38,17 C46,15 52,19 54,23 C50,26 44,26 40,25 Z" fill="#b9b3c8" stroke="#24182e" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="46" cy="20" r="1.8" fill="#24182e"/><circle cx="54.5" cy="23" r="1.6" fill="#ff8fa8"/>' +
    '<path d="M16,31 v2 M32,31 v2" stroke="#24182e" stroke-width="2.4" stroke-linecap="round"/></svg>';
}
function sourisPasse(V, force){
  var t = tama(V);
  if(V.souris || V.mode !== 'ranger' || (!force && (t.jeu - (t.souris || 0) < SOURIS_MIN || !V.grim.hidden || V.ouvert))) return false;
  var chats = chatsDe(V).filter(function(o){ var st = V.chats[o.id]; return st && !st.tenu && st.pose !== 'dort' && !st.depart; });
  if(!chats.length) return false;
  var o = chats[Math.floor(Math.random() * chats.length)], st = chatEtat(V, o), pc = chatPos(V, o);
  t.souris = t.jeu;
  /* elle traverse le plancher d'un bord à l'autre (là où on le voit), toujours un peu DERRIÈRE le chat, et dessinée à sa vraie
     profondeur, avec les meubles (Romain, 16 novembre, 19 h 56 : « la souris, c'est une image qui est posée et elle passe par-dessus
     le chat. Ça, c'est bizarre. Il vaut mieux qu'elle passe derrière ») */
  var y = borne(pc.y - 36, SOL_MIN + 30, solMax(V) - 10), versD = pc.x > 600 ? false : true;
  var x0 = versD ? Math.max(solXmin(V, y) + 20, pc.x - 520) : Math.min(solXmax(V, y) - 20, pc.x + 520), x1 = versD ? Math.min(solXmax(V, y) - 20, pc.x + 560) : Math.max(solXmin(V, y) + 20, pc.x - 560);
  var s = echelleSol(y), m = document.createElement('div'), dur = 4600;
  m.className = 'at-souris' + (versD ? '' : ' g');
  m.innerHTML = dessinSouris();
  m.style.width = 'calc(' + (40 * s).toFixed(1) + 'px * var(--k) * 1.7)';
  var dch = V.elO[o.id], zc = dch ? +dch.style.zIndex || 0 : 0, zm = Math.round(posObj(V, {t:'chat', x:pc.x, y:y, sur:null}).z * 5) - 2;
  m.style.zIndex = zc ? Math.min(zm, zc - 1) : zm;
  V.scene.appendChild(m);
  V.souris = m;
  var am = anim(m, [{left:pX(V, x0), top:pY(V, y)}, {left:pX(V, x1), top:pY(V, y)}], {duration:dur, easing:'linear', fill:'forwards'});
  son(V, 'tic');
  var posM = function(f){ return {x:x0 + (x1 - x0) * f, y:y}; };
  var fini = function(){ if(V.souris === m){ m.remove(); V.souris = null; } };
  apres(V, dur + 80, fini);
  /* le chat la voit : il se tapit (face à elle), remue les fesses, et bondit */
  if(st.anim) chatArreter(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  st.chasse = true;
  apres(V, 500, function(){
    if(chatEtat(V, o).tenu) return;
    var d = V.elO[o.id], p = chatPos(V, o), cible = posM(0.35);
    st.gauche = cible.x < p.x; if(d){ d.classList.toggle('at-c-gauche', st.gauche); d.classList.add('at-c-tapi'); }
    chatPose(V, o, 'marche');
  });
  apres(V, 1200, function(){ var d = V.elO[o.id]; if(d) d.classList.add('at-c-fesses'); });
  apres(V, 2100, function(){
    var d = V.elO[o.id];
    if(d) d.classList.remove('at-c-tapi', 'at-c-fesses');
    if(chatEtat(V, o).tenu){ st.chasse = false; return; }
    var q = posM(0.62), attrape = Math.random() < 0.6;
    chatBouger(V, o, chatSol(V, q.x, q.y), 'saute', function(){
      st.chasse = false;
      donner(o, 'jeu', 25); majHumeur(V, o);
      if(attrape){
        if(am) try{ am.pause(); }catch(e){}
        anim(m, [{transform:'scale(1)', opacity:1}, {transform:'scale(.2) translateY(-60%)', opacity:0}], {duration:420, fill:'forwards'});
        apres(V, 430, fini);
        coeursChat(V, o); flotter(V, o, '🐭 Attrapée !'); son(V, 'magie');
        chatPose(V, o, 'lave'); chatPlanifier(V, o, 3000);
      } else {
        st.dernierJeu = null; chatJoue(V, o, 'galipette'); flotter(V, o, '🐭 Ratée !');
      }
      changer(V);
    });
  });
  return true;
}

/* ---------- Il suit le doigt qui glisse sur le plancher, et essaie de l'attraper ---------- */
function chasseDoigt(V, ev){
  var now = Date.now();
  if(V.mode !== 'ranger' || (V.chasseT && now - V.chasseT < 450)) return;
  V.chasseT = now;
  var r = V.piece.getBoundingClientRect(), wx = V.vb.x0 + (ev.clientX - r.left + V.pan.x) / V.k, wy = V.vb.y0 + (ev.clientY - r.top + V.pan.y) / V.k;
  if(wy < SOL_Y - 10) return;                 /* (seulement sur le plancher) */
  var cibl = chatSol(V, wx, Math.max(wy, SOL_MIN + 20)), best = null, bd = 1e9;
  chatsDe(V).forEach(function(o){
    var st = V.chats[o.id];
    if(!st || st.tenu || st.pose === 'dort' || st.depart || st.chasse || (st.mv && st.anim && st.mv.mode === 'saute')) return;
    var p = chatPos(V, o), dd = Math.hypot(p.x - cibl.x, p.y - cibl.y);
    if(dd < bd && dd < 700){ bd = dd; best = o; }
  });
  if(!best) return;
  var st = chatEtat(V, best);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  if(bd < 70){                                /* il l'a presque : il bondit dessus et tape de la patte */
    if(!st.anim){ chatPose(V, best, Math.random() < 0.5 ? 'tape' : 'saute'); if(st.pose === 'saute') gesteChat(V, best, 'bond', {d:520, h:11}); }
    donner(best, 'jeu', 3);
    chatPlanifier(V, best, 2200);
    return;
  }
  if(st.anim) chatArreter(V, best);
  chatAller(V, best, cibl, function(){ chatPose(V, best, 'tape'); chatPlanifier(V, best, 2200); });
}
function chasseFin(V){
  V.chasseT = 0;
  /* (le doigt est parti : il se rassoit, content, puis retourne à ses affaires) */
  apres(V, 500, function(){ chatsDe(V).forEach(function(o){ var st = V.chats[o.id]; if(st && !st.anim && !st.tenu && !st.chasse && (st.pose === 'tape' || st.pose === 'saute')){ chatPose(V, o, 'assis'); chatPlanifier(V, o, 2500); } }); });
}

/* ---------- Pendant une potion : il dresse les oreilles quand on verse le bon ingrédient (un petit coup de pouce) ---------- */
function chatPotion(V, ov){
  return null;   /* (Romain, 5 novembre, 15 h 58 : plus de chat dans le mini-jeu du chaudron) */
  var o = chatsTous(V).filter(function(c){ return !V.chats[c.id] || !V.chats[c.id].depart; })[0];
  if(!o || bonheur(o) < 45 || tama(V).butin) return null;
  var p = vChat(o.v), el = document.createElement('div');
  el.className = 'at-mj-chat';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="19 -28 76 78">' + teteChat(p, 57, 18, o.acc || {}) + '</svg><span class="at-mj-chat-n">' + esc(nomChat(o)) + '</span>';
  ov.appendChild(el);
  return function(){
    el.classList.remove('at-oreilles'); void el.offsetWidth; el.classList.add('at-oreilles');
    clearTimeout(el._t); el._t = apres(V, 1500, function(){ el.classList.remove('at-oreilles'); });
  };
}

/* ==========================================================
   Mimi, le Tamagotchi (16 novembre) : ses sons, ses soins, ses caresses, ses jouets, ses coffrets, sa barre, sa boutique, son album.
   Le récit est en tête de la partie « Mimi, un vrai petit Tamagotchi », plus haut ; les règles chiffrées sont là-bas (BH_…, ENVIE_…, FAMILLES).
   ========================================================== */

/* >>> LES SONS DE MIMI (ce bloc est recopié tel quel dans l'Atelier des sons : donjon/essai/construire-sons.py)
   Les mêmes briques que le gâteau et le labo ; en plus, une « voix » de chat (une dent de scie qui passe dans deux bouches de filtres)
   et le ronron (un bruit grave battu une vingtaine de fois par seconde). Tout est doux : on est dans un atelier, pas dans un zoo. */
function sonsMimi(audio, sortie){
  function tendre(f, t0, duree, vol, glisse, att, type, filtre){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    if(filtre){ var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filtre; lp.Q.value = 0.5; o.connect(lp); lp.connect(g); } else o.connect(g);
    g.connect(sortie(a)); o.start(t); o.stop(t + duree + 0.03);
  }
  function souffle(t0, duree, vol, f0, f1, q, type){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, n = Math.floor(a.sampleRate * duree), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf;
    f.type = type || 'bandpass'; f.Q.value = q || 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1 || f0, t + duree);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.06, duree * .3)); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  function grains(t0, duree, vol, nb, passeHaut){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr * duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var k = 0; k < nb; k++){ var c = Math.floor(n * Math.random() * .9), l = Math.floor(sr * (.001 + Math.random() * .004)), v = .4 + Math.random() * .6; for(var j = 0; j < l && c + j < n; j++) d[c + j] += (Math.random() * 2 - 1) * v * (1 - j / l); }
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = passeHaut || 2400; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + .02);
  }
  /* la voix : la hauteur glisse de f0 à f1 puis f2, la « bouche » s'ouvre de b0 à b1 puis se ferme vers b2 (mi… a… ou) */
  function voix(t0, duree, f0, f1, f2, b0, b1, b2, vol){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain(), m = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + duree * 0.42); o.frequency.linearRampToValueAtTime(f2, t + duree);
    lfo.frequency.value = 6.5; lg.gain.value = f1 * 0.014; lfo.connect(lg); lg.connect(o.frequency);
    [[1, 6], [2.3, 7]].forEach(function(k){
      var b = a.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = k[1];
      b.frequency.setValueAtTime(b0 * k[0], t); b.frequency.linearRampToValueAtTime(b1 * k[0], t + duree * 0.42); b.frequency.linearRampToValueAtTime(b2 * k[0], t + duree);
      o.connect(b); b.connect(m);
    });
    m.gain.value = 1.6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.05); g.gain.setValueAtTime(vol, t + duree * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    m.connect(g); g.connect(sortie(a));
    o.start(t); lfo.start(t); o.stop(t + duree + 0.05); lfo.stop(t + duree + 0.05);
  }
  function ronron(t0, duree, vol){
    var a = audio(); if(!a) return;
    var t = a.currentTime + t0, sr = a.sampleRate, n = Math.floor(sr * duree), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for(var i = 0; i < n; i++){ var x = i / sr, bat = 0.5 + 0.5 * Math.sin(2 * Math.PI * 24 * x), resp = (x * 1.5) % 1 < 0.55 ? 1 : 0.6; d[i] = (Math.random() * 2 - 1) * bat * bat * resp; }
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'lowpass'; f.frequency.value = 230; f.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.12); g.gain.setValueAtTime(vol, t + duree - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.connect(f); f.connect(g); g.connect(sortie(a)); s.start(t); s.stop(t + duree + 0.02);
  }
  return {
    /* sa voix */
    miaou:function(){ var v = Math.random(); voix(0, .62 + v * .12, 430 + v * 60, 640 + v * 80, 400, 700, 1500, 650, .05); },
    trille:function(){ voix(0, .26, 520, 700, 760, 900, 1200, 1300, .035); tendre(1400, .02, .2, .006, 1700, .01); },   /* « mrrrp ? » */
    baille:function(){ voix(0, .9, 380, 520, 260, 600, 1100, 400, .03); souffle(.1, .7, .01, 800, 400, .7); },
    ronron:function(){ ronron(0, 1.3, .09); },
    grr:function(){ voix(0, .42, 150, 170, 140, 500, 600, 450, .03); },                                                  /* pour jouer, pas pour de vrai */
    atchoum:function(){ souffle(0, .07, .03, 3000, 2600, 1.2); souffle(.1, .22, .05, 4200, 900, .9); tendre(700, .1, .12, .015, 300, .005); },
    roule:function(){ souffle(0, .3, .02, 600, 1400, .8); tendre(392, .05, .14, .02, 523, .01, 'triangle', 1800); },    /* elle se roule par terre */
    /* les repas */
    croque:function(){ for(var i = 0; i < 4; i++) grains(i * .14, .06, .05, 6, 1800); },
    lape:function(){ for(var i = 0; i < 4; i++){ tendre(900 + Math.random() * 300, i * .16, .05, .03, 1400, .003); souffle(i * .16, .05, .012, 2400, 2000, 2); } },
    friandise:function(){ tendre(1175, 0, .06, .03, null, .003, 'triangle', 4000); tendre(1568, .07, .1, .03, null, .003, 'triangle', 4000); grains(.18, .2, .03, 6, 1800); },
    /* les soins */
    brosse:function(){ souffle(0, .2, .03, 2600, 4200, 1.4); },
    mousse:function(){ for(var i = 0; i < 3; i++) tendre(700 + Math.random() * 900, i * .07, .06, .02, 1600 + Math.random() * 600, .004); },
    secoue:function(){ for(var i = 0; i < 6; i++) souffle(i * .06, .05, .02, 2000, 1400, 1.5); },
    gratte:function(){ for(var i = 0; i < 3; i++){ souffle(i * .18, .14, .03, 1400, 900, 1); grains(i * .18, .12, .025, 10, 1200); } },   /* la pelle dans la litière */
    photo:function(){ grains(0, .03, .05, 3, 3000); souffle(.03, .12, .03, 3000, 1200, .8); tendre(2093, .02, .1, .01, null, .003); },
    /* les cadeaux */
    coffret:function(){ tendre(180, 0, .12, .07, 120, .004, 'triangle', 600); tendre(1568, .14, .3, .02, null, .006); tendre(2093, .2, .32, .016, null, .006); },
    ouvre:function(){ grains(0, .1, .03, 8, 2000); [784, 988, 1175, 1568, 1976].forEach(function(f, i){ tendre(f, .08 + i * .07, .32, .04, null, .01, 'triangle', 4000); }); grains(.2, .7, .012, 40, 5000); },
    debloque:function(){ [523, 659, 784, 1047].forEach(function(f, i){ tendre(f, i * .1, .3, .05, null, .01, 'triangle', 3000); }); tendre(1319, .45, .6, .04, null, .02); grains(.4, .6, .012, 30, 5000); },
    /* (étape 2) un cœur gagné : deux notes rondes qui montent ; une envie exaucée : un petit carillon ; le grand cadeau : une fanfare */
    coeur:function(){ tendre(659, 0, .22, .05, null, .012, 'triangle', 2600); tendre(988, .16, .42, .05, null, .012, 'triangle', 3200); tendre(1976, .2, .3, .012, null, .01); },
    envie:function(){ [1319, 1568, 2093, 2637].forEach(function(f, i){ tendre(f, i * .055, .26, .028, null, .006); }); grains(.12, .4, .01, 22, 6000); },
    fanfare:function(){ [523, 523, 659, 784, 1047].forEach(function(f, i){ tendre(f, [0, .13, .26, .39, .56][i], i === 4 ? .7 : .16, .055, null, .01, 'triangle', 3400); tendre(f * 2, [0, .13, .26, .39, .56][i], i === 4 ? .6 : .12, .014, null, .008); }); grains(.56, .8, .014, 46, 5600); },
    /* les jouets */
    laser:function(){ tendre(1760, 0, .08, .012, 2637, .004); },
    plume:function(){ souffle(0, .22, .02, 900, 2600, .7); },
    grelot:function(){ for(var i = 0; i < 3; i++){ var t = i * .09 + Math.random() * .03; tendre(2637, t, .2, .018, null, .002); tendre(3520, t + .005, .16, .01, null, .002); } },
    clef:function(){ for(var i = 0; i < 6; i++) tendre(2400 + (i % 2) * 300, i * .07, .02, .02, null, .002, 'square', 5000); },     /* on remonte la souris */
    couic:function(){ tendre(1800, 0, .1, .03, 2600, .004); tendre(2600, .1, .08, .02, 1900, .004); },
    carton:function(){ tendre(140, 0, .14, .07, 100, .004, 'triangle', 500); souffle(0, .12, .02, 900, 500, .8); },
    herbe:function(){ grains(0, .5, .02, 30, 3000); [659, 880, 1175, 1568].forEach(function(f, i){ tendre(f, .05 + i * .09, .4, .025, f * 1.06, .02); }); }
  };
}
/* <<< LES SONS DE MIMI */
var ctxMimi = null, SONS_MIMI = null;
function audioMimi(){
  try{ if(window.Brume && Brume.sonActif && !Brume.sonActif()) return null; }catch(e){}
  try{ if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; }catch(e){}
  if(!ctxMimi){ try{ var AC = window.AudioContext || window.webkitAudioContext; ctxMimi = AC ? new AC() : null; }catch(e){ ctxMimi = null; } }
  if(ctxMimi && ctxMimi.state === 'suspended') try{ ctxMimi.resume(); }catch(e){}
  return ctxMimi;
}
function sonMimi(V, nom){
  if(V && V.o && V.o.sansSurprise === 'muet') return;
  try{ if(!SONS_MIMI) SONS_MIMI = sonsMimi(audioMimi, function(a){ return a.destination; }); if(SONS_MIMI[nom]) SONS_MIMI[nom](); }catch(e){}
}

/* ---------- Les données ---------- */
var SOINS_SUITE = ['brosse', 'bain', 'friandises', 'griffoir', 'photo'];   /* ses objets de soin (ils arrivent par les coffrets : FAMILLES ; l'appareil photo est à tout le monde) */
var SOINS = {
  brosse:{ic:'brosse', nom:'Brosse', dit:'une brosse toute douce, pour son pelage'},
  bain:{ic:'🛁', nom:'Bain', dit:'une petite baignoire, et du savon qui mousse'},
  friandises:{ic:'🍬', nom:'Friandises', dit:'un bocal de friandises'},
  griffoir:{ic:'🪵', nom:'Griffoir', dit:'un griffoir rien qu\'à elle (il attend dans un carton du coin 📦)'},
  photo:{ic:'📷', nom:'Photo', dit:'un appareil photo, pour remplir son album'}
};
var JOUETS = {
  pelote:{ic:'🧶', nom:'la pelote de laine', dit:'Une pelote toute douce.'},
  plume:{ic:'🪶', nom:'la canne à plume', dit:'Elle va bondir comme une tigresse.'},
  laser:{ic:'🔴', nom:'le petit point rouge', dit:'Le point rouge le plus agaçant du monde !'},
  souris:{ic:'🐭', nom:'la souris mécanique', dit:'Une souris qui ne mord pas : on la remonte avec sa petite clé.'},
  grelot:{ic:'🔔', nom:'la balle à grelot', dit:'Ding, ding ! Impossible de faire la sieste à côté.'},
  carton:{ic:'📦', nom:'le carton à surprises', dit:'Un simple carton… le jouet préféré de tous les chats du monde.'},
  herbe:{ic:'🌿', nom:'l\'herbe à chat', dit:'Une pincée, et elle devient complètement zinzin.'}
};
/* la boutique de Mimi : le confort, à petits prix (les jouets, eux, ne s'achètent pas : ils viennent des coffrets).
   (17 novembre, 07 h 07, Romain : « Enlève aussi tous les objets d'apparence de Mimi dans la boutique. La boutique c'est racheter autre
   chose, les autres objets quoi, pas cela. » Plus un seul habit ici : ils se gagnent — ses coffrets, les mini-jeux.) */
var BOUTIQUE_MIMI = {
  coins:[{t:'panier', ic:'🧺', nom:'Un panier de plus', prix:5}, {t:'coussin', ic:'🟣', nom:'Un coussin moelleux', prix:3}, {t:'arbre_chat', ic:'🐈', nom:'Un arbre à chat', prix:9}]
};
/* L'ALBUM À COMPLÉTER (Romain, 16 novembre, 21 h 18 : « un compteur, une photo sur 15 » ; les doubles : « dommage, c'était la même » ;
   « des animations rares à prendre en photo » ; le gros plan, la plus rare ; « toutes les photos : un très gros cadeau »).
   Une photo par pose. r : sa rareté (1 : elle la prend tout le temps ; 3 : il faut être là au bon moment ; 4 : le gros plan — elle vient
   tout près de nous de temps en temps, §12.76 : la photo la plus rare, et son cadeau à part, GROS_CADEAU). pose, x, g, allure, tr : comment la redessiner dans l'album (MimiPantin.image). */
var PHOTOS = [
  {k:'assis', nom:'Toute sage', r:1, pose:'assis'},
  {k:'marche', nom:'En promenade', r:1, pose:'marche'},
  {k:'dort', nom:'Roulée en boule', r:1, pose:'dort'},
  {k:'lave', nom:'La toilette', r:1, pose:'lave'},
  {k:'mange', nom:'Miam', r:1, pose:'mange'},
  {k:'pain', nom:'En petit pain', r:2, pose:'pain'},
  {k:'dos', nom:'Les pattes en l\'air', r:2, pose:'dos'},
  {k:'miaou', nom:'Miaou !', r:2, pose:'assis', x:'at-x-miaou'},
  {k:'baille', nom:'Le grand bâillement', r:2, pose:'assis', x:'at-x-baille'},
  {k:'griffe', nom:'Les griffes', r:2, pose:'griffe'},
  {k:'etire', nom:'Le grand étirement', r:3, pose:'marche', g:'etire', u:0.26},
  {k:'salut', nom:'Coucou !', r:3, pose:'salut'},
  {k:'saut', nom:'Hop !', r:3, pose:'marche', g:'bond', u:0.52},
  {k:'galop', nom:'Ventre à terre', r:3, pose:'marche', allure:'course', phi:0.62, tr:'translate(36 28) scale(.78)'},      /* (elle est toute en longueur : un peu plus petite, pour tenir dans le cadre) */
  {k:'gros', nom:'Le gros plan', r:4}
];
/* ce que l'album rapporte : à tant de photos, un pelage (p:) ou des yeux (y:) de plus ; l'album complet : le très gros cadeau */
var PHOTOS_CADEAUX = {3:['y:0'], 6:['p:1'], 9:['y:1'], 12:['p:2'], 15:['p:7', 'y:3']};
function photoDe(k){ return PHOTOS.filter(function(P){ return P.k === k; })[0] || null; }
function mimi(V){ var e = V.etat; if(!e.mimi || !Array.isArray(e.mimi.jouets)) normaliserChat(e); return e.mimi; }
function soinA(V, id){ return mimi(V).soins.indexOf(id) >= 0; }
function iconeSoin(id){
  if(id !== 'brosse') return SOINS[id] ? SOINS[id].ic : '';
  /* (17 novembre) une vraie brosse : le dos en bois verni, le coussin rouge, les poils, le manche ; tenue poils en bas */
  return '<svg viewBox="0 0 64 40" aria-hidden="true" class="at-ic-brosse">' +
    '<path d="M38,15 C46,12 56,10 61,12 C63,13 63,17 61,18 C56,20 46,20 38,20 Z" fill="#a0602f" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M44,14 C50,13 55,12.6 58,13.4" stroke="#d9a06a" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M3,17 C3,9 13,7 23,7 C33,7 41,9 41,17 C41,21 36,22 22,22 C9,22 3,21 3,17 Z" fill="#c98450" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M9,12 C14,9.6 24,9.4 32,10.6" stroke="#ecc28c" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M6,21 L38,21 L37,25 L7,25 Z" fill="#c8403a" stroke="#24182e" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M9,25 v8 M13,25 v9 M17,25 v8 M21,25 v9 M25,25 v8 M29,25 v9 M33,25 v8" stroke="#24182e" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M9,25 v8 M13,25 v9 M17,25 v8 M21,25 v9 M25,25 v8 M29,25 v9 M33,25 v8" stroke="#f3e7cb" stroke-width="1.1" stroke-linecap="round"/></svg>';
}

/* ---------- Un soin : du bonheur ; si c'était pile son envie, bien plus ; et si sa barre est pleine, elle file chercher un coffret ---------- */
/* quoi : le soin (repas:<nourriture>, eau, caresse, jouet:<jouet>, brosse, bain, friandises, litiere, griffoir, dodo) ; gain : le bonheur ;
   k : le besoin qu'il comble ; n : de combien (100 par défaut : tout) */
function soigner(V, o, quoi, gain, k, n){
  if(!o) return;
  var u = besoinUrgent(o), fam = familleSoin(quoi), brut = gain;
  if(k){ if(u && u.k === k) brut += 6; donner(o, k, n === undefined ? 100 : n); }
  /* (étape 2) deux fois moins de bonheur qu'avant, et de moins en moins si on refait le même soin */
  var plus = Math.round(brut * GAIN_K * lasse(V, fam) * 100) / 100;
  lasser(V, fam);
  bhPlus(o, plus);
  if(envieEst(V, quoi)) envieFaite(V, o);
  majHumeur(V, o); majBarre(V); changer(V);
  peutEtreCadeau(V);
}
/* sa barre est pleine ? Un instant plus tard (le temps de finir ce qu'elle fait), elle file chercher un coffret */
function peutEtreCadeau(V){
  if(V.o.sansSurprise || GUIDE) return;
  apres(V, 2600, function(){ var c = chatsDe(V).filter(function(x){ return peutSortir(V, x); })[0]; if(c) cadeauChat(V, c); });
}
/* Une sieste dans un de ses coins douillets : un peu de bonheur. portee : c'est nous qui l'y avons portée (si c'était son envie :
   pile poil) ; toute seule, ça ne compte pas pour son envie. */
function dodoCoin(V, o, portee){
  var st = V.chats[o.id], sur = st && st.pos ? st.pos.sur : o.sur, par = sur && V.parId[sur.o];
  if(!st || st.pose !== 'dort' || !par || !DODO_ICI.test(par.t) || o.chaton || st.dodoVu === st.dortJusqua) return false;
  st.dodoVu = st.dortJusqua;
  soigner(V, o, portee ? 'dodo' : 'dodo:seule', 6);
  return true;
}
function brillerMimi(V){ var b = V.elMimi; if(!b) return; b.classList.add('at-dispo'); clearTimeout(V.mimiBrT); V.mimiBrT = apres(V, 5000, function(){ b.classList.remove('at-dispo'); }); }

/* ---------- Le doigt posé sur elle : des mimiques selon l'endroit (Romain : « quand on laisse le doigt et qu'on gratte plutôt vers
   la tête ou plutôt vers la queue, elle fait des mimiques différentes ») ----------
   tête : elle se frotte contre le doigt, ferme les yeux, ronronne ; au bout de deux secondes, elle pétrit.
   dos : elle se cambre, la queue frissonne. ventre : elle se roule sur le dos… et attrape le doigt (un jeu, jamais pour de vrai).
   queue : « Pas la queue ! » — oreilles en arrière, la queue fouette, et au bout d'un moment elle s'éloigne un peu. */
var ZONE_X = {tete:'at-x-tete at-c-ronron', dos:'at-x-dosg at-c-ronron', queue:'at-x-agace', ventre:''};
function zoneChat(V, o, ev){
  /* (le pantin sait où sont vraiment sa tête, son dos, son ventre et sa queue, dans la pose du moment) */
  var r = pantinDe(V, o), z = r ? r.zone(ev.clientX, ev.clientY) : null;
  return z || 'dos';
}
function caresseDebut(V, o, ev){
  var st = chatEtat(V, o);
  if(st.depart || st.tenu || st.caresse) return;
  if(V.bain && !V.bain.dedans) return;      /* (elle va à son baquet : on ne l'arrête pas en chemin) */
  if(st.anim) chatArreter(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  if(/^(marche|saute|tape|lave|mange|salut)$/.test(st.pose)) chatPose(V, o, 'assis');
  st.caresse = {zone:null, t0:Date.now(), tz:Date.now(), gain:0, coeur:0, ronron:0, dist:0, n:0, outil:V.outil ? V.outil.t : null, k:lasse(V, 'caresse'), ou:chatPos(V, o)};
  if(st.caresse.outil){ outilBouge(V, o, ev, 0); }
  else caresseZone(V, o, zoneChat(V, o, ev));
  caresseTic(V, o);
}
function caresseZone(V, o, z){
  var st = chatEtat(V, o), C = st.caresse, d = V.elO[o.id];
  if(!C || !d || z === C.zone) return;
  ['at-x-tete', 'at-x-dosg', 'at-x-agace', 'at-x-attrape', 'at-x-petrit', 'at-x-mordille'].forEach(function(c){ d.classList.remove(c); });
  C.mord = 0;
  if(C.zone !== 'tete' && C.zone !== 'dos') d.classList.remove('at-c-ronron');
  C.zone = z; C.tz = Date.now();
  if(st.pose === 'dort'){
    if(z === 'ventre'){ st.dortJusqua = 0; chatPose(V, o, 'dos'); expression(V, o, 'at-x-baille', 900); sonMimi(V, 'baille'); }
    else if(z === 'queue'){ d.classList.remove('at-c-ronron'); expression(V, o, 'at-x-queue', 1400); return; }
    else { d.classList.add('at-c-ronron'); return; }
  }
  if(z === 'ventre' && st.pose !== 'dos'){ chatPose(V, o, 'dos'); sonMimi(V, 'roule'); }
  if(z === 'queue'){ flotter(V, o, 'Pas la queue !'); sonMimi(V, 'grr'); }
  if(ZONE_X[z]) ZONE_X[z].split(' ').forEach(function(c){ d.classList.add(c); });
}
function caresseBouge(V, o, ev, dl){
  var C = chatEtat(V, o).caresse;
  if(!C) return;
  if(C.outil){ outilBouge(V, o, ev, dl); return; }
  C.dist += dl;
  /* (le doigt bouge des dizaines de fois par seconde : savoir ce qu'il touche — la tête, le dos… — dix fois par seconde suffit,
     et c'est ce calcul-là qui coûte : Romain, « sans que ça rame ») */
  var now = Date.now();
  if(C.tzone && now - C.tzone < 90) return;
  C.tzone = now;
  caresseZone(V, o, zoneChat(V, o, ev));
}
function caresseTic(V, o){
  var st = chatEtat(V, o), C = st.caresse, d = V.elO[o.id], t = tama(V);
  if(!C || V.arrete || !d) return;
  var now = Date.now(), dz = now - C.tz, z = C.zone, gain = 0, gratte = C.dist > 30;
  C.dist = 0;
  if(C.outil){ /* (la brosse, le bain : outilBouge fait tout) */ }
  else if(st.pose === 'dort'){ if(z === 'tete' || z === 'dos'){ gain = 0.25; if(now - C.ronron > 1600){ C.ronron = now; sonMimi(V, 'ronron'); } } }
  else if(z === 'tete'){
    gain = gratte ? 0.75 : 0.5;
    if(dz > 2200 && (st.pose === 'assis' || st.pose === 'pain') && !C.mord) d.classList.add('at-x-petrit');
    /* un très long câlin : elle mordille le doigt, tout doucement, puis le lèche — comme les vrais chats (Romain, 16 novembre au soir) */
    if(dz > 9000 && !C.mord){
      C.mord = 1; d.classList.remove('at-x-tete', 'at-x-petrit');
      expression(V, o, 'at-x-mordille', 2200); flotter(V, o, 'Mmh… miam !'); sonMimi(V, 'grr');
      apres(V, 2300, function(){ if(chatEtat(V, o).caresse === C && C.zone === 'tete'){ d.classList.add('at-x-tete'); C.tz = Date.now(); C.mord = 0; } });
    }
    if(now - C.coeur > 1100){ C.coeur = now; coeursChat(V, o); }
    if(now - C.ronron > 1450){ C.ronron = now; sonMimi(V, 'ronron'); }
  } else if(z === 'dos'){
    gain = gratte ? 0.6 : 0.4;
    if(now - C.coeur > 1600){ C.coeur = now; coeursChat(V, o); }
    if(now - C.ronron > 1450){ C.ronron = now; sonMimi(V, 'ronron'); }
  } else if(z === 'ventre'){
    gain = 0.3;
    if(dz > 700 && !d.classList.contains('at-x-attrape')){ d.classList.add('at-x-attrape'); flotter(V, o, 'Grrr !'); sonMimi(V, 'grr'); C.ronron = now; }
    else if(dz > 700 && now - C.ronron > 1400){ C.ronron = now; sonMimi(V, 'grr'); }
  } else if(z === 'queue' && dz > 1500 && !C.fuite){ C.fuite = 1; fuirQueue(V, o); return; }
  /* (étape 2 : deux fois moins de bonheur qu'avant, et de moins en moins si on enchaîne les câlins — C.k, la lassitude au début du câlin) */
  if(gain && C.gain < 12){ var g2 = gain * GAIN_K * (C.k === undefined ? 1 : C.k); C.gain += gain; donner(o, z === 'ventre' ? 'jeu' : 'amour', gain * 5); bhPlus(o, g2); if(!(C.n++ % 5)) majBarre(V); }
  /* son envie du moment, c'était des gratouilles : au bout de quatre bonnes secondes, c'est gagné */
  if(!C.env && C.gain >= 6 && (z === 'tete' || z === 'dos') && envieEst(V, 'caresse')){ C.env = 1; envieFaite(V, o); }
  st.caresseT = apres(V, 400, function(){ caresseTic(V, o); });
}
/* on insiste sur la queue : elle s'en va un peu plus loin, et se rassoit en regardant ailleurs (elle n'est pas fâchée pour de vrai) */
function fuirQueue(V, o){
  var st = chatEtat(V, o), p = chatPos(V, o);
  caresseFin(V, o, true);
  expression(V, o, 'at-x-agace', 1600);
  if(chatSurMeuble(V, o)){ chatPlanifier(V, o, 1500); return; }
  /* (contre un mur, elle part de l'autre côté) */
  var c = chatSol(V, p.x + (st.gauche ? 120 : -120), p.y + 10);
  if(Math.abs(c.x - p.x) < 70) c = chatSol(V, p.x + (st.gauche ? -120 : 120), p.y + 10);
  chatAller(V, o, c, function(){ chatPose(V, o, 'assis'); expression(V, o, 'at-x-queue', 1200); chatPlanifier(V, o, 3000); });
}
function caresseFin(V, o, fuite){
  var st = chatEtat(V, o), C = st.caresse, d = V.elO[o.id];
  if(!C) return;
  st.caresse = null; clearTimeout(st.caresseT);
  if(C.outil) outilLache(V, o);
  if(d) ['at-x-tete', 'at-x-dosg', 'at-x-agace', 'at-x-attrape', 'at-x-petrit', 'at-x-mordille', 'at-c-ronron'].forEach(function(c){ d.classList.remove(c); });
  if(C.gain >= 3) lasser(V, 'caresse');
  majBarre(V); changer(V);
  peutEtreCadeau(V);      /* (les câlins aussi peuvent finir de remplir sa barre) */
  if(st.pose === 'dort'){ chatPlanifier(V, o, Math.max(1000, st.dortJusqua - Date.now())); return; }
  if(fuite) return;
  if(st.pose === 'dos' && !V.bain) apres(V, 1100, function(){ var s2 = chatEtat(V, o); if(s2.pose === 'dos' && !s2.caresse && !s2.tenu){ chatPose(V, o, 'assis'); sonMimi(V, 'roule'); } });
  chatPlanifier(V, o, 2600);
}

/* ---------- La brosse et le bain : un outil qu'on passe avec le doigt ---------- */
/* une petite chose qui s'envole là où est le doigt (des poils, de la mousse, des gouttes) */
function particule(V, ev, cls, txt, ms){
  var r = V.root.getBoundingClientRect(), p = document.createElement('i');
  p.className = 'at-part ' + cls; if(txt) p.textContent = txt;
  p.style.left = (ev.clientX - r.left + (Math.random() - 0.5) * 20).toFixed(0) + 'px'; p.style.top = (ev.clientY - r.top + (Math.random() - 0.5) * 16).toFixed(0) + 'px';
  p.style.setProperty('--dx', ((Math.random() - 0.5) * 70).toFixed(0) + 'px');
  V.root.appendChild(p);
  apres(V, ms || 900, function(){ p.remove(); });
}
function curseurOutil(V, ev){
  if(!V.outil) return;
  var r = V.root.getBoundingClientRect(), c = V.curseur;
  if(!c){ c = V.curseur = document.createElement('div'); c.className = 'at-curseur at-curseur-' + V.outil.t; c.innerHTML = V.outil.t === 'brosse' ? iconeSoin('brosse') : EPONGE; V.root.appendChild(c); }
  c.style.left = (ev.clientX - r.left).toFixed(0) + 'px'; c.style.top = (ev.clientY - r.top).toFixed(0) + 'px';
}
/* l'éponge du bain : jaune, trouée, sa face verte qui gratte, de la mousse dessus */
var EPONGE = '<svg viewBox="0 0 44 36" aria-hidden="true"><path d="M5,13 Q5,7 11,7 L35,7 Q40,7 40,12 L40,17 L5,17 Z" fill="#4cbb5c" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M5,17 L40,17 L40,25 Q40,31 34,31 L11,31 Q5,31 5,25 Z" fill="#ffd84a" stroke="#24182e" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<circle cx="12" cy="23" r="1.9" fill="#e3ad25"/><circle cx="20" cy="26.5" r="1.4" fill="#e3ad25"/><circle cx="27" cy="22.5" r="2.1" fill="#e3ad25"/><circle cx="34" cy="26" r="1.5" fill="#e3ad25"/>' +
  '<circle cx="14" cy="6" r="4.4" fill="#ffffff" stroke="#a9d3ee" stroke-width="1.2"/><circle cx="21" cy="4.6" r="5" fill="#ffffff" stroke="#a9d3ee" stroke-width="1.2"/><circle cx="28" cy="6.4" r="3.8" fill="#ffffff" stroke="#a9d3ee" stroke-width="1.2"/></svg>';
function outilLache(V){ if(V.curseur){ V.curseur.remove(); V.curseur = null; } }
function prendreBrosse(V){
  var o = chatJoueur(V);
  if(!o || V.bain) return;      /* (pas pendant son bain) */
  V.outil = {t:'brosse', n:0, l:0};
  V.root.classList.add('at-outil');
  var t = 'La brosse est prête ! Passe-la doucement sur le dos de ' + nomChat(o) + ', dans le sens du poil.';
  toast(V, '<b>' + iconeSoin('brosse') + '</b> ' + esc(t), 6000, t);
  clearTimeout(V.outilT); V.outilT = apres(V, 25000, function(){ if(V.outil && V.outil.t === 'brosse') poserOutil(V); });
}
function poserOutil(V){ V.outil = null; V.root.classList.remove('at-outil'); outilLache(V); clearTimeout(V.outilT); }
/* LA BROSSE, DANS LE SENS DU POIL (17 novembre ; Romain, le 16 : « la brosse, elle est pas très bien faite » ; Bible §12.66, point 4 :
   « une vraie brosse, à passer dans le sens du poil »). Ce qui compte : le chemin du doigt le long de son dos, de sa tête vers sa queue
   (l'axe épaules → hanches du pantin). Dans ce sens, 34 points font un bon coup de brosse : des poils, un éclat, elle ronronne, les yeux
   fermés. L'aller-retour marche (le retour ne compte pas, c'est tout). Mais un coup de brosse qui COMMENCE à rebrousse-poil (de sa queue
   vers sa tête) : « Frrr ! », les oreilles en arrière, le poil qui se hérisse ; et au troisième, le conteur explique. */
function brosseBouge(V, o, ev, dl){
  var O = V.outil, d = V.elO[o.id], r = pantinDe(V, o), now = Date.now();
  if(dl === 0 || O.px === undefined){ O.px = ev.clientX; O.py = ev.clientY; O.bon = 0; O.mal = 0; O.debut = 1; O.axe = 0; }
  /* (l'axe de son dos : relu trois fois par seconde, pas à chaque mouvement du doigt) */
  if(r && (!O.axe || now - O.axeT > 330)){ var a = r.point('s'), b = r.point('h'); if(a && b){ var lx = b[0] - a[0], ly = b[1] - a[1], ln = Math.hypot(lx, ly) || 1; O.axe = [lx / ln, ly / ln]; O.axeT = now; } }
  var sx = ev.clientX - O.px, sy = ev.clientY - O.py; O.px = ev.clientX; O.py = ev.clientY;
  if(!O.axe || !(sx || sy)) return;
  var pr = sx * O.axe[0] + sy * O.axe[1];
  if(pr > 0){ O.bon += pr; O.mal = Math.max(0, O.mal - pr); if(O.bon > 8) O.debut = 0; }
  else if(pr < 0){
    O.mal += -pr;
    if(O.mal > 16){
      O.mal = 0;
      particule(V, ev, 'at-part-herisse', '', 800);
      /* (un coup de brosse qui commence à l'envers : elle n'aime pas — pas plus d'une fois toutes les deux secondes et demie) */
      if(O.debut && now - (O.grrT || 0) > 2500){
        O.grrT = now; O.rebours = (O.rebours || 0) + 1;
        expression(V, o, 'at-x-agace', 900); flotter(V, o, 'Frrr !'); sonMimi(V, 'grr');
        d.classList.remove('at-x-dosg', 'at-c-ronron', 'at-x-clos');
        if(O.rebours === 3){ var t = nomChat(o) + ' grogne : à rebrousse-poil, elle déteste ! Une brosse, ça va de sa tête vers sa queue. Comme son poil.'; toast(V, '<b>' + iconeSoin('brosse') + ' 😾</b> ' + esc(t), 6000, t); }
      }
      O.debut = 0;
    }
  }
  if(O.bon < 34) return;
  O.bon = 0; O.n++;
  particule(V, ev, 'at-part-poil', '', 1100); particule(V, ev, 'at-part-poil', '', 1100); particule(V, ev, 'at-part-brille', '', 900);
  sonMimi(V, 'brosse');
  d.classList.add('at-x-dosg', 'at-c-ronron', 'at-x-clos');
  if(O.n % 3 === 0){ coeursChat(V, o); sonMimi(V, 'ronron'); }
  if(O.n >= 9) finBrosse(V, o);
}
function outilBouge(V, o, ev, dl){
  var O = V.outil, d = V.elO[o.id];
  if(!O || !d) return;
  curseurOutil(V, ev);
  if(O.t === 'brosse'){ brosseBouge(V, o, ev, dl); return; }
  O.l += dl;
  if(O.l < 34) return;      /* (un coup de brosse, un coup d'éponge : 34 points de glisser) */
  O.l = 0; O.n++;
  if(O.t === 'bain' && V.bain && V.bain.dedans){
    particule(V, ev, 'at-part-mousse', '', 1500); particule(V, ev, 'at-part-mousse', '', 1500);
    sonMimi(V, 'mousse');
    V.bain.n++; V.bain.dernier = Date.now();
    /* (à la quatrième, la mousse lui chatouille le nez : atchoum !) */
    if(V.bain.n === 4){ expression(V, o, 'at-x-eternue', 700); apres(V, 250, function(){ if(V.bain) flotter(V, o, 'Atchoum !'); sonMimi(V, 'atchoum'); }); }
    if(V.bain.el) V.bain.el.style.setProperty('--bain-mousse', Math.min(1, V.bain.n / 8).toFixed(2));
    if(V.bain.n >= 8) sortieBain(V, true);
  }
}
function finBrosse(V, o){
  poserOutil(V);
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(st.caresse) st.caresse.outil = null;
  apres(V, 900, function(){ if(d) ['at-x-dosg', 'at-c-ronron', 'at-x-clos'].forEach(function(c){ d.classList.remove(c); }); });
  soigner(V, o, 'brosse', 10, 'propre');
  var t = 'Quel pelage ! ' + nomChat(o) + ' brille comme un sou neuf.';
  toast(V, '<b>✨</b> ' + esc(t), 4200, t);
  if(Math.random() < 0.35) apres(V, 1600, function(){ expression(V, o, 'at-x-eternue', 700); var t2 = 'Beurk… une boule de poils ! Bon, ça arrive aux meilleurs chats.'; apres(V, 300, function(){ flotter(V, o, 'Hrrk !'); sonMimi(V, 'atchoum'); toast(V, '<b>🐈 🧶</b> ' + esc(t2), 4200, t2); }); });
}
/* Le bain : une petite baignoire se pose, elle y saute (l'air pas convaincu), on frotte : de la mousse ; huit coups, et elle bondit dehors
   et s'ébroue. Sans frotter pendant quinze secondes, elle file toute seule (rien n'est perdu). */
/* LE BAQUET (17 novembre ; Romain, le 16 : « Le bain, on voit même pas de bain ») : un vrai baquet de bois cerclé de fer, bas et large,
   plein d'eau tiède : un canard qui flotte, un peu de vapeur. Il est en DEUX morceaux, pour qu'elle soit vraiment DEDANS : le fond (derrière
   elle : l'intérieur, l'eau, le canard, la vapeur, le bord du fond) et le devant (devant elle : la paroi et ses cercles, le bord de devant,
   l'eau qui la cache jusqu'à la poitrine, la mousse qui monte quand on frotte). viewBox 0 0 180 94 ; le sol : (90, 92).
   BAQUET.pied : ses pattes sont posées au fond du baquet, 13 unités au-dessus du sol (là, l'eau lui arrive à la poitrine). */
var BAQUET = {w:180, h:94, sol:92, pied:13};
function svgBaquet(face){
  var K2 = K, r1 = function(v){ return Math.round(v * 10) / 10; };
  function pt(cx, cy, rx, ry, a){ return [r1(cx + rx * Math.cos(a)), r1(cy + ry * Math.sin(a))]; }
  function P2(d, f, w, x){ return '<path d="' + d + '" fill="' + f + '" stroke="' + K2 + '" stroke-width="' + (w || 2.4) + '" stroke-linejoin="round" stroke-linecap="round"' + (x || '') + '/>'; }
  var s = '<svg viewBox="0 0 180 94" overflow="visible" aria-hidden="true">';
  if(!face){
    /* l'intérieur (le bois plus sombre), ses douelles ; l'eau ; le canard ; la vapeur ; le bord du fond */
    s += P2('M17,47 A73,12 0 0 1 163,47 A73,12 0 0 1 17,47 Z', '#7a4626', 2);
    [196, 214, 232, 250, 268, 286, 304, 322, 340].forEach(function(g){ var a = pt(90, 47, 73, 12, g * Math.PI / 180); s += '<path d="M' + a[0] + ',' + a[1] + ' L' + r1(a[0] + (90 - a[0]) * 0.07) + ',54" stroke="#5c3219" stroke-width="1.4"/>'; });
    s += '<g class="at-baquet-eau"><path d="M20,52 A70,10 0 0 1 160,52 A70,10 0 0 1 20,52 Z" fill="#8fd0ff" stroke="#4f9fd6" stroke-width="1.6"/>' +
      '<path d="M44,49 Q62,46 80,48 M102,47 Q118,45 134,48" stroke="#e6f6ff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/></g>';
    s += '<g class="at-canard"><ellipse cx="136" cy="51" rx="9" ry="2.4" fill="#5aa8d8" opacity=".5"/>' +
      P2('M128,49 C127,43 133,41 138,43 C141,40 146,40 147,45 C150,45 151,48 148,50 C142,53 132,53 128,49 Z', '#ffd84a', 1.6) +
      P2('M146,42.6 L151.6,43.6 L147,45.4 Z', '#ff9a3c', 1.1) + '<circle cx="143.6" cy="42.4" r="1" fill="' + K2 + '"/>' +
      '<path d="M131,47 Q134,45.4 137,46.6" stroke="#e8b52c" stroke-width="1.3" fill="none"/></g>';
    s += '<g class="at-vapeur"><path d="M62,40 C58,34 66,30 62,24 C59,20 63,16 61,12" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".55"/></g>' +
      '<g class="at-vapeur" style="animation-delay:1.1s"><path d="M104,38 C100,32 108,28 104,22 C101,18 105,14 103,10" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".55"/></g>' +
      '<g class="at-vapeur" style="animation-delay:2.2s"><path d="M84,36 C80,30 88,26 84,20" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity=".45"/></g>';
    s += P2('M8,46 A82,16 0 0 1 172,46 L163,47 A73,12 0 0 0 17,47 Z', '#e3b47c', 2.2);
    return s + '</svg>';
  }
  /* le devant : les douelles (plus sombres sur les côtés), le contour, deux cercles de fer et leurs rivets ; l'eau du devant ; la mousse ; le bord */
  var N = 10, i, fonce = [154, 93, 51], clair = [214, 153, 96];
  for(i = 0; i < N; i++){
    var a0 = i / N * Math.PI, a1 = (i + 1) / N * Math.PI, m = Math.sin((a0 + a1) / 2), c = fonce.map(function(v, k){ return Math.round(v + (clair[k] - v) * m); });
    var h0 = pt(90, 46, 82, 16, a0), h1 = pt(90, 46, 82, 16, a1), b1 = pt(90, 80, 74, 12, a1), b0 = pt(90, 80, 74, 12, a0);
    s += '<path d="M' + h0 + ' L' + h1 + ' L' + b1 + ' L' + b0 + ' Z" fill="rgb(' + c.join(',') + ')" stroke="#6e3f22" stroke-width="1"/>';
  }
  s += '<path d="M8,46 L16,80 A74,12 0 0 0 164,80 L172,46" fill="none" stroke="' + K2 + '" stroke-width="3" stroke-linejoin="round"/>';
  [0.24, 0.76].forEach(function(t){
    var cy = 46 + 34 * t, rx = 82 - 8 * t, ry = 16 - 4 * t, d = 'M' + r1(90 - rx) + ',' + r1(cy) + ' A' + r1(rx) + ',' + r1(ry) + ' 0 0 0 ' + r1(90 + rx) + ',' + r1(cy);
    s += '<path d="' + d + '" fill="none" stroke="' + K2 + '" stroke-width="7.4"/><path d="' + d + '" fill="none" stroke="#7d8794" stroke-width="4.6"/>' +
      '<path d="' + d + '" fill="none" stroke="#b9c2cc" stroke-width="1.2" transform="translate(0,-1.2)"/>';
    [0.32, 0.5, 0.68].forEach(function(f){ var q = pt(90, cy, rx, ry, f * Math.PI); s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="#545c66"/>'; });
  });
  /* l'eau devant elle (elle y est jusqu'à la poitrine), la mousse qui monte quand on frotte (--bain-mousse ; pas « --mousse » : c'est déjà une couleur du jeu, base.css), des bulles qui montent */
  s += '<path class="at-baquet-eau" d="M20,52 A70,10 0 0 0 160,52 Z" fill="#7cc4f0" opacity=".93"/>';
  [[52, 54, 1], [70, 58, 1.2], [92, 59, 1.35], [112, 58, 1.15], [130, 54, 1], [80, 50, 0.9], [104, 50, 0.95]].forEach(function(q, k){
    var x = q[0], y = q[1], z = q[2];
    s += '<g class="at-bain-mousse" style="transition-delay:' + (k * 0.04).toFixed(2) + 's">' +
      ['-6,0,5', '0,-3,6', '6,0,5', '2,2.5,4'].map(function(c){ var v = c.split(','); return '<circle cx="' + r1(x + v[0] * z) + '" cy="' + r1(y + v[1] * z) + '" r="' + r1(v[2] * z) + '" fill="#ffffff" stroke="#a9d3ee" stroke-width="1.2"/>'; }).join('') +
      '<circle cx="' + r1(x - 2 * z) + '" cy="' + r1(y - 4 * z) + '" r="' + r1(1.6 * z) + '" fill="#e4f4ff"/></g>';
  });
  s += '<g class="at-bain-bulles"><circle cx="60" cy="52" r="2.4" fill="none" stroke="#e6f6ff" stroke-width="1.2"/><circle cx="118" cy="51" r="1.8" fill="none" stroke="#e6f6ff" stroke-width="1.1" style="animation-delay:.9s"/><circle cx="96" cy="53" r="2" fill="none" stroke="#e6f6ff" stroke-width="1.1" style="animation-delay:1.7s"/></g>';
  s += P2('M8,46 A82,16 0 0 0 172,46 L163,47 A73,12 0 0 1 17,47 Z', '#e3b47c', 2.2) +
    '<path d="M20,50 A74,13 0 0 0 160,50" fill="none" stroke="#f3d3a4" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
  return s + '</svg>';
}
/* une petite flaque par terre, qui sèche toute seule (quand elle sort du bain et s'ébroue) */
function flaqueEau(V, x, y, z){
  var s = echelleSol(y), el = document.createElement('div');
  el.className = 'at-flaque-eau';
  el.innerHTML = '<svg viewBox="0 0 40 14" aria-hidden="true"><path d="M3,8 C2,3 12,1 20,2 C30,1 39,4 37,8 C36,12 26,13 18,12 C9,13 4,12 3,8 Z" fill="#8fd0ff" stroke="#4f9fd6" stroke-width="1.4" opacity=".75"/><path d="M10,6 Q15,4.6 20,5.4" stroke="#ffffff" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
  el.style.left = pX(V, x); el.style.top = pY(V, y); el.style.width = pW(V, (26 + Math.random() * 18) * s);
  el.style.zIndex = z;
  V.scene.appendChild(el);
  apres(V, 6500, function(){ el.remove(); });
}
function demarrerBain(V){
  var o = chatJoueur(V);
  if(!o || V.bain) return;
  if(chatSurMeuble(V, o)){ chatAller(V, o, chatSolVisible(V), function(){ demarrerBain(V); }); return; }
  var p = chatPos(V, o), y = borne(p.y + 6, SOL_MIN + 50, solMax(V) - 20), x = borne(p.x + 90, solXmin(V, y) + 120, solXmax(V, y) - 120);
  /* (une place dégagée, où on la voit et où le doigt la trouve : rien devant, pas même une gamelle) */
  var pl = placeLibre(V, [[x, y], [borne(p.x - 90, solXmin(V, y) + 120, solXmax(V, y) - 120), y]], 100, 120);
  x = pl.x; y = pl.y;
  if(pl.hors) allerVers(V, x, y - 60);      /* (la seule place libre est hors de l'écran : la pièce glisse jusqu'à lui) */
  var s = echelleSol(y), dos = document.createElement('div'), el = document.createElement('div');
  dos.className = 'at-baquet at-bain-dos'; dos.innerHTML = svgBaquet(false);
  el.className = 'at-baquet at-bain'; el.innerHTML = svgBaquet(true);
  var z0 = Math.round(posObj(V, {t:'chat', x:x, y:y, sur:null}).z * 5);
  [dos, el].forEach(function(e, k){ e.style.left = pX(V, x); e.style.top = pY(V, y); e.style.width = pW(V, BAQUET.w * s); e.style.zIndex = z0 + k; V.scene.appendChild(e);
    anim(e, [{transform:'translate(-50%,-100%) scale(.3)', opacity:0}, {transform:'translate(-50%,-100%) scale(1.06)', opacity:1, offset:.7}, {transform:'translate(-50%,-100%) scale(1)'}], {duration:420, easing:'ease-out'}); });
  sonMimi(V, 'carton');
  V.bain = {o:o, el:el, dos:dos, n:0, dernier:Date.now(), x:x, y:y};
  poserOutil(V);      /* (la brosse qu'on avait en main se range : l'éponge prend sa place) */
  V.outil = {t:'bain', n:0, l:0};
  V.root.classList.add('at-outil');
  var st = chatEtat(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  var t0 = nomChat(o) + ' regarde le baquet… puis toi… puis le baquet. Elle a compris. Elle n\'est pas d\'accord.';
  toast(V, '<b>🛁</b> ' + esc(t0), 4500, t0);
  chatAller(V, o, chatSol(V, x - 95 * s, y + 4), function(){
    if(!V.bain) return;
    /* hop, dedans : ses pattes au fond du baquet (on ne les voit plus), l'eau jusqu'à la poitrine */
    chatBouger(V, o, chatSol(V, x, y - BAQUET.pied * s), 'saute', function(){
      var d = V.elO[o.id];
      if(!V.bain || !d) return;
      st.gauche = false; d.classList.remove('at-c-gauche');
      chatPose(V, o, 'assis'); d.classList.add('at-x-agace', 'at-dans-bain');
      V.bain.dedans = true;
      /* (elle et son baquet gardent, dans l'ordre du dessin, la place du baquet — celle que placeLibre a vérifiée : posée un peu
         plus au fond, au creux du baquet, elle passait derrière un meuble que le baquet, lui, devançait ; vu au téléphone, 17 novembre) */
      V.bain.z = z0; d.style.zIndex = z0; dos.style.zIndex = z0 - 1; el.style.zIndex = z0 + 1;
      /* plouf ! des gouttes, l'eau qui tremble */
      son(V, 'plouf'); flotter(V, o, 'Plouf !');
      el.classList.add('at-plouf'); dos.classList.add('at-plouf'); apres(V, 700, function(){ el.classList.remove('at-plouf'); dos.classList.remove('at-plouf'); });
      var F = cadreObjet(V, o.id);
      if(F) for(var i = 0; i < 8; i++){ var g = document.createElement('i'); g.className = 'at-goutte'; g.style.left = pX(V, x + (Math.random() - 0.5) * 120 * s); g.style.top = pY(V, y - (52 + Math.random() * 20) * s); g.style.setProperty('--dx', ((Math.random() - 0.5) * 90).toFixed(0) + 'px'); V.calque.appendChild(g); (function(g){ apres(V, 950, function(){ g.remove(); }); })(g); }
      var t = nomChat(o) + ' est dans son baquet, l\'air pas du tout convaincu. Frotte-la doucement pour faire mousser !';
      apres(V, 600, function(){ if(V.bain) toast(V, '<b>🛁</b> ' + esc(t), 6000, t); });
      veilleBain(V);
    });
  });
}
function veilleBain(V){ clearTimeout(V.bainT); V.bainT = apres(V, 1500, function(){ if(!V.bain) return; if(Date.now() - V.bain.dernier > 15000) sortieBain(V, false); else veilleBain(V); }); }
function sortieBain(V, propre){
  var B = V.bain;
  if(!B) return;
  V.bain = null; clearTimeout(V.bainT);
  poserOutil(V);
  var o = B.o, d = V.elO[o.id], st = chatEtat(V, o);
  if(st.caresse) st.caresse.outil = null;
  if(d) d.classList.remove('at-x-agace', 'at-dans-bain');
  var p = chatPos(V, o), yb = B.y || p.y, s = echelleSol(yb), sens = p.x < (solXmin(V, yb) + solXmax(V, yb)) / 2 ? 1 : -1;
  /* elle bondit hors du baquet, en avant, du côté où il y a de la place, et s'ébroue : des gouttes partout, des petites flaques qui sèchent */
  chatBouger(V, o, chatSol(V, p.x + sens * 125 * s, yb + 26 * s), 'saute', function(){
    expression(V, o, 'at-x-secoue', 900); sonMimi(V, 'secoue');
    var F = cadreObjet(V, o.id), q = chatPos(V, o), zf = Math.round(q.z * 5) - 2;
    if(F) for(var i = 0; i < 9; i++){ var g = document.createElement('i'); g.className = 'at-goutte'; g.style.left = pX(V, F.x + (Math.random() - 0.5) * F.w * 0.9); g.style.top = pY(V, F.y - F.h * (0.3 + Math.random() * 0.5)); g.style.setProperty('--dx', ((Math.random() - 0.5) * 90).toFixed(0) + 'px'); V.calque.appendChild(g); (function(g){ apres(V, 950, function(){ g.remove(); }); })(g); }
    [[-34, 4], [26, 8], [-6, 14]].forEach(function(f, k){ apres(V, 250 + k * 120, function(){ flaqueEau(V, q.x + f[0] * s, q.y + f[1] * s, zf); }); });
    if(propre){
      apres(V, 900, function(){ chatPose(V, o, 'pain'); expression(V, o, 'at-c-ronron', 2200); coeursChat(V, o); chatPlanifier(V, o, 4500); });
      soigner(V, o, 'bain', 14, 'propre');
      var t = 'Toute propre, toute douce ! ' + nomChat(o) + ' fait semblant d\'être fâchée… mais elle ronronne.';
      toast(V, '<b>🛁 ✨</b> ' + esc(t), 5000, t);
    } else {
      chatPose(V, o, 'assis'); chatPlanifier(V, o, 2600);
      var t2 = nomChat(o) + ' a sauté hors du baquet, toute mouillée ! On réessaiera plus tard.';
      toast(V, '<b>🛁 💨</b> ' + esc(t2), 4500, t2);
    }
  });
  [B.el, B.dos].forEach(function(e){ if(!e) return; anim(e, [{opacity:1}, {opacity:0, transform:'translate(-50%,-100%) scale(.6)'}], {duration:600, delay:700, fill:'forwards'}); });
  apres(V, 1400, function(){ B.el.remove(); if(B.dos) B.dos.remove(); });
}
/* Les friandises : elle donne la patte, puis croque (pas plus d'une fois toutes les 90 secondes) */
function donnerFriandise(V){
  var o = chatJoueur(V), t = tama(V), now = Date.now();
  if(!o || V.bain) return;      /* (pas pendant son bain) */
  if(t.friand && now - t.friand < 90000 && now > t.friand){ var tx = 'Encore ? Gare au petit ventre tout rond ! ' + nomChat(o) + ' en aura une autre tout à l\'heure.'; toast(V, '<b>🍬</b> ' + esc(tx), 4200, tx); return; }
  t.friand = now;
  if(chatSurMeuble(V, o)){ chatAller(V, o, chatSolVisible(V), function(){ friandiseSuite(V, o); }); return; }
  friandiseSuite(V, o);
}
/* LA FRIANDISE QU'ON VOIT VOLER (17 novembre ; Romain, le 16 : « Les friandises, quand on les lance, on les voit pas ») : un petit
   biscuit en forme de poisson part du bouton 🐾, vole en cloche en tournant ; elle le suit des yeux, bondit et l'attrape au vol (« Crac ! »),
   croque, se lèche les babines. Une fois sur quatre, elle le rate : il rebondit par terre devant elle ; elle se tapit, remue les fesses…
   et lui saute dessus. */
var BISCUIT = '<svg viewBox="0 0 30 18" aria-hidden="true"><path d="M2.5,9 C6.5,2 16,1 21,5.6 L27.4,1.6 L26,9 L27.4,16.4 L21,12.4 C16,17 6.5,16 2.5,9 Z" fill="#d98a3d" stroke="#24182e" stroke-width="1.8" stroke-linejoin="round"/>' +
  '<circle cx="8.6" cy="8" r="1.4" fill="#24182e"/><path d="M13,5.6 Q15.4,9 13,12.4 M17,6.6 Q18.8,9 17,11.4" stroke="#a5602a" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M6,6 Q9,4 12,4.4" stroke="#f3c48c" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>';
/* un point de l'écran → la pièce (unités du monde) */
function versMonde(V, cx, cy){ var r = V.piece.getBoundingClientRect(); return {x:(cx - r.left + V.pan.x) / V.k + V.vb.x0, y:(cy - r.top + V.pan.y) / V.k + V.vb.y0}; }
function friandiseSuite(V, o){
  var st = chatEtat(V, o), r = pantinDe(V, o), d = V.elO[o.id];
  chatPose(V, o, 'assis'); expression(V, o, 'at-x-joue', 900); sonMimi(V, 'trille');
  var bt = V.elMimi && V.elMimi.getBoundingClientRect(), te = r && r.point('tete'), p = chatPos(V, o), s = p.s || 1;
  if(!bt || !te || !d || MOINS_MOUV){ friandiseManger(V, o, true); return; }
  var dep = versMonde(V, bt.left + bt.width / 2, bt.top + bt.height / 2), tete = versMonde(V, te[0], te[1]);
  var rate = Math.random() < 0.25, sens = st.gauche ? -1 : 1;
  /* l'arrivée : juste au-dessus de sa tête, là où sera sa gueule au sommet du bond — ou par terre, devant elle */
  var arr = rate ? {x:p.x + sens * 70 * s, y:p.y + 10 * s} : {x:tete.x + sens * 8 * s, y:tete.y - 26 * s};
  var b = document.createElement('div'); b.className = 'at-biscuit'; b.innerHTML = BISCUIT;
  b.style.width = pW(V, 30 * s); b.style.zIndex = 99050;
  V.calque.appendChild(b);
  var T = rate ? 1000 : 860, haut = 150 + Math.abs(arr.x - dep.x) * 0.15, kf = [];
  for(var i = 0; i <= 14; i++){ var u = i / 14, x = dep.x + (arr.x - dep.x) * u, y = dep.y + (arr.y - dep.y) * u - haut * 4 * u * (1 - u); kf.push({left:pX(V, x), top:pY(V, y), transform:'translate(-50%,-50%) rotate(' + Math.round(u * 540) + 'deg)', offset:u}); }
  if(rate){ kf.forEach(function(k){ k.offset = k.offset * 0.72; });
    [[0.82, 18], [0.9, 0], [0.95, 6], [1, 0]].forEach(function(q){ kf.push({left:pX(V, arr.x + sens * q[0] * 10 * s), top:pY(V, arr.y - q[1] * s), transform:'translate(-50%,-50%) rotate(' + (540 + q[0] * 90) + 'deg)', offset:q[0]}); }); }
  var a = anim(b, kf, {duration:T, easing:'linear', fill:'forwards'});
  sonMimi(V, 'friandise');
  if(r){ var regarde = function(){ var q = b.getBoundingClientRect(); if(q.width) r.regard(q.left + q.width / 2, q.top + q.height / 2, 400); }; for(var k = 1; k <= 6; k++) apres(V, k * T / 7, regarde); }
  if(!rate){
    /* elle bondit, la gueule ouverte, et l'attrape au sommet */
    apres(V, T - 430, function(){ if(chatEtat(V, o).tenu) return; gesteChat(V, o, 'bond', {h:24}); expression(V, o, 'at-x-miaou', 520); });
    apres(V, T, function(){
      b.remove();
      if(chatEtat(V, o).tenu){ friandiseManger(V, o, false); return; }
      flotter(V, o, 'Crac !'); sonMimi(V, 'croque');
      var q = r.point('tete'); if(q) for(var m = 0; m < 4; m++) particule(V, {clientX:q[0] + sens * 10, clientY:q[1] + 12}, 'at-part-miette', '', 900);
      apres(V, 450, function(){ friandiseManger(V, o, false); });
    });
    return;
  }
  /* ratée : elle se tapit, remue les fesses… et lui saute dessus */
  apres(V, T * 0.75, function(){ if(chatEtat(V, o).tenu) return; expression(V, o, 'at-c-tapi at-c-fesses', 1150); flotter(V, o, 'Oups…'); });
  apres(V, T + 1050, function(){
    if(chatEtat(V, o).tenu){ b.remove(); return; }
    chatBouger(V, o, chatSol(V, arr.x - sens * 18 * s, arr.y + 2 * s), 'saute', function(){
      b.remove(); flotter(V, o, 'Attrapée !'); sonMimi(V, 'croque');
      friandiseManger(V, o, true);
    });
  });
}
/* elle croque, se lèche les babines ; ça compte comme une friandise (soigner) — par terre : penchée sur sa friandise */
function friandiseManger(V, o, parTerre){
  if(parTerre){ chatPose(V, o, 'mange'); sonMimi(V, 'friandise'); }
  else { chatPose(V, o, 'assis'); gesteChat(V, o, 'croque'); apres(V, 1200, function(){ var r = pantinDe(V, o); if(r) r.sans('croque'); }); }
  soigner(V, o, 'friandises', 8, 'faim', 15);
  apres(V, parTerre ? 1300 : 1250, function(){ chatPose(V, o, 'lave'); expression(V, o, 'at-x-langue', 1200); coeursChat(V, o); chatPlanifier(V, o, 3000); });
}

/* ---------- L'appareil photo et l'album ---------- */
/* la pose qu'elle prend en ce moment (une clé de PHOTOS) : la plus rare d'abord */
function clichePhoto(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id], r = pantinDe(V, o), a = function(c){ return !!d && d.classList.contains(c); }, f = function(g){ return !!r && r.fait(g); };
  if(r && r.mar && r.all === 'course') return 'galop';
  if((st.anim && st.mv && st.mv.mode === 'saute') || f('bond') || f('galipette')) return 'saut';
  if(st.pose === 'salut') return 'salut';
  if(f('etire')) return 'etire';
  if(st.pose === 'griffe' || st.pose === 'boule') return 'griffe';
  if(a('at-x-baille')) return 'baille';
  if(a('at-x-miaou')) return 'miaou';
  if(st.pose === 'dos' || st.pose === 'pain' || st.pose === 'mange' || st.pose === 'lave' || st.pose === 'dort') return st.pose;
  return st.pose === 'marche' || st.pose === 'saute' ? 'marche' : 'assis';
}
function prendrePhoto(V){
  if(V.mode !== 'ranger' || V.arrete) return;
  /* (le gros plan : c'est elle, tout près — la photo la plus rare) */
  var G = V.gros, gros = !!(G && G.el && (G.phase === 'monte' || G.phase === 'la'));
  var o = gros ? G.o : chatsDe(V)[0], st = o ? chatEtat(V, o) : null;
  if(!gros && (!o || !V.elO[o.id] || st.depart || V.elO[o.id].classList.contains('at-c-dehors') || st.passe)){ var t = 'Pas de modèle devant l\'appareil ! Elle n\'est pas dans cette pièce.'; toast(V, '<b>📷</b> ' + esc(t), 3800, t); son(V, 'ko'); return; }
  fermerBarre(V);
  var m = mimi(V), k = gros ? 'gros' : clichePhoto(V, o), P = photoDe(k), deja = m.album.some(function(f){ return f.k === k; }), n = m.album.length, T = PHOTOS.length;
  var f = document.createElement('div'); f.className = 'at-flash'; V.root.appendChild(f); apres(V, 500, function(){ f.remove(); });
  sonMimi(V, 'photo');
  if(deja){
    var td = 'Dommage, c\'était la même ! « ' + P.nom + ' », elle est déjà dans l\'album. ' + n + ' sur ' + T + '.';
    toast(V, '<b>📷 🙈</b> ' + esc(td), 4200, td);
    return;
  }
  m.album.push({k:k, v:vChat(o.v), acc:o.acc ? JSON.parse(JSON.stringify(o.acc)) : {}, e:enqueteNo(V)});
  n++;
  var t2 = 'Clic ! « ' + P.nom + ' » : une nouvelle photo dans l\'album de ' + nomChat(o) + (k === 'gros' ? ' — la plus rare de toutes !' : P.r >= 3 ? ' — et une pose rare !' : ' !') + ' ' + n + ' sur ' + T + '.';
  /* (à tant de photos : un pelage, des yeux… — l'album complet : le très gros cadeau) */
  var cad = (PHOTOS_CADEAUX[n] || []).map(function(c){ return donnerPeau(V, c); }).filter(function(x){ return !!x; });
  /* (la photo du gros plan rapporte, en plus, son cadeau à part : des yeux vairons, un bleu, un doré) */
  var vair = k === 'gros' && m.peaux.y.indexOf(+GROS_CADEAU.slice(2)) < 0 ? donnerPeau(V, GROS_CADEAU) : '';
  if(vair){ t2 += ' Pour la photo la plus rare, un cadeau à part : ' + vair + ', un œil bleu et un œil doré, comme certains vrais chats ! Dans sa garde-robe 🎀.'; if(!cad.length){ apres(V, 300, function(){ sonMimi(V, 'debloque'); }); brillerMimi(V); } }
  if(cad.length){
    t2 += (n >= T ? ' L\'album est complet ! Pour ' + nomChat(o) + ', le plus beau des cadeaux : ' : ' Et un cadeau pour ' + nomChat(o) + ' : ') + cad.join(' et ') + ', dans sa garde-robe 🎀.';
    apres(V, 300, function(){ sonMimi(V, n >= T ? 'fanfare' : 'debloque'); }); brillerMimi(V);
  }
  toast(V, '<b>📷 ' + (cad.length || vair ? '🎁' : '✨') + '</b> ' + esc(t2), cad.length || vair ? 8000 : 4600, t2);
  if(V.elPhoto){ V.elPhoto.classList.remove('at-flash-bt'); void V.elPhoto.offsetWidth; V.elPhoto.classList.add('at-flash-bt'); }
  majBarre(V); changer(V);
}
function imageMimi(f){
  /* (le gros plan : sa grosse tête, mimi-gros.js, tout étonnée, la tête un peu penchée) */
  if(f.k === 'gros') return '<div class="at-photo-chat at-photo-gp">' + MP.grosImage(vChat(f.v), accPantin(f.acc), {pup:0.95, tilt:8, ly:0.1})
    .replace('viewBox="' + MP.GROS_VB + '"', 'viewBox="-30 -42 60 60" preserveAspectRatio="xMidYMax slice"') + '</div>';
  var P = photoDe(f.k) || PHOTOS[0], x = P.x ? ' ' + P.x : '';
  return '<div class="at-o at-t-chat at-plat at-photo-chat at-c-' + esc(P.pose || 'assis') + x + '"><svg viewBox="0 0 ' + MP.W + ' ' + MP.H + '" overflow="visible" aria-hidden="true">' + (P.tr ? '<g transform="' + P.tr + '">' : '') + MP.image(vChat(f.v), P.pose || 'assis', P.x || '', accPantin(f.acc), P) + (P.tr ? '</g>' : '') + '</svg></div>';
}
function ouvrirAlbum(V){
  fermerBarre(V);
  var m = mimi(V), c = chatsTous(V)[0], n = c ? nomChat(c) : PORTEE.mere, nb = m.album.length, T = PHOTOS.length;
  var t = nb >= T ? 'L\'album de ' + n + ' est complet. Quelle star !' :
    nb ? 'L\'album de ' + n + ' : ' + nb + ' photo' + (nb > 1 ? 's' : '') + ' sur ' + T + '. Une seule photo par pose : guette ce qu\'elle fait, et clic ! Les poses rares ne durent qu\'un instant.' :
    'L\'album est encore vide : ' + T + ' poses à photographier. L\'appareil photo 📷 est à côté du bouton 🐾. Guette ce que fait ' + n + ', et clic !';
  var corps = '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p><p class="at-album-n" aria-hidden="true">📷 ' + nb + ' sur ' + T + '</p><div class="at-album">' + PHOTOS.map(function(P){
    var f = m.album.filter(function(g){ return g.k === P.k; })[0];
    return f ? '<figure class="at-photo' + (P.r >= 3 ? ' rare' : '') + '">' + imageMimi(f) + '<figcaption>' + esc(P.nom) + '</figcaption></figure>'
      : '<figure class="at-photo at-photo-vide" aria-label="Une pose à photographier"><div class="at-photo-chat"><span aria-hidden="true">?</span></div><figcaption aria-hidden="true">· · ·</figcaption></figure>';
  }).join('') + '</div>';
  ouvrirCalque(V, 'at-cal-album', feuille('at-f-album', '<span class="at-f-ic">📒</span><h3>L\'album de ' + esc(n) + '</h3>', corps));
  son(V, 'page');
}

/* ==========================================================
   LE GROS PLAN (Romain, 16 novembre, 20 h 00 → 20 h 14 ; Bible §12.67 et §12.76). De temps en temps (la première fois entre 6 et
   9 minutes de jeu, puis toutes les 12 à 18 minutes : « assez rarement […] peut-être les 15 minutes »), elle descend tout en bas de la
   pièce et sort de l'écran par en bas… puis elle grimpe au bord de l'écran, tout près de nous : une patte s'accroche, puis l'autre,
   elle glisse, elle galère ; ses oreilles arrivent, puis sa tête ; elle regarde partout, tout étonnée. Une seule chose à faire : lui
   caresser la tête (elle pousse contre le doigt, ferme les yeux, ronronne, et lèche l'écran pour dire qu'elle est contente). Un simple
   toucher, ou si on la laisse : elle regarde en bas et saute. Puis elle revient dans la pièce, vue de dos.
   Sa tête est dessinée exprès, en grand (mimi-gros.js : MimiPantin.gros, grosRig). C'est la photo la plus rare de l'album, et la
   première rapporte un cadeau à part : des yeux vairons (GROS_CADEAU).
   V.gros : {o, phase:'va' (elle descend) | 'saute' | 'monte' | 'la' | 'part', el, svg, rig, E, t0, …} ; tama.grosT : quand (en secondes
   de jeu) elle pourra revenir.
   ========================================================== */
var GROS_PREMIER = [360, 540], GROS_ENTRE = [720, 1080];      /* (en secondes de jeu : tama.jeu) */
var GROS_ATTEND = 7000, GROS_APRES = 5000, GROS_MAX = 90000;  /* (personne ne la caresse : elle repart ; après la dernière caresse ; au plus) */
var GROS_CADEAU = 'y:5';                                      /* (des yeux vairons : MimiPantin.YEUX[5]) */
/* la montée : [instant (s), réglages] ; entre deux instants qui nomment un réglage, il glisse en douceur (rig.E : voir mimi-gros.js) */
var GROS_KF = [
  [0, {monte:0, patG:30, patD:30, griG:0.4, griD:0.4, pup:0.95, lx:0, ly:-0.5, orG:0, orD:0, tilt:0, dx:0, pau:0, mou:0}],
  [0.3, {patG:30}], [0.6, {patG:0, griG:1}],                  /* une patte s'accroche au bord… */
  [0.95, {patD:30}], [1.25, {patD:0, griD:1}],                /* … puis l'autre */
  [1.55, {patG:0, griG:1}], [1.85, {patG:8, griG:0.25}], [2.15, {patG:8}], [2.45, {patG:0, griG:1}],     /* elle glisse ! … rattrapée */
  [2.55, {monte:0}], [3.05, {monte:0.2}],                     /* les oreilles arrivent */
  [3.15, {orG:0, orD:0}], [3.3, {orG:12, orD:-4}], [3.45, {orG:-4, orD:11}], [3.6, {orG:0, orD:0}],     /* elles écoutent */
  [3.85, {monte:0.2, patG:0, patD:0}], [4.4, {monte:0.54, patG:-2.5, patD:-2.5}],    /* ça pousse… */
  [4.65, {monte:0.45, patG:1, patD:1}],                       /* … ça retombe un peu… */
  [5.2, {monte:1, patG:0, patD:0, ly:0}],                     /* … hop ! toute la tête */
  [5.5, {lx:0, ly:0}], [5.9, {lx:-0.85, ly:-0.12}], [6.35, {lx:-0.85}],    /* elle regarde partout, tout étonnée */
  [6.65, {lx:0.85, ly:-0.18}], [7.1, {lx:0.85}], [7.45, {lx:0, ly:0.1, tilt:0}],
  [7.85, {tilt:10, pup:1}],                                   /* puis nous, la tête penchée */
  [7.95, {pau:0}], [8.07, {pau:1}], [8.21, {pau:0}],          /* un clignement */
  [8.75, {tilt:6}]
];
var GROS_FIN = 8.75, GROS_PRET = 5.2;      /* (la fin de la montée ; à partir de quand on peut la caresser) */
var GROS_PISTES = (function(){
  var P = {};
  GROS_KF.forEach(function(k){ for(var c in k[1]) (P[c] = P[c] || []).push([k[0], k[1][c]]); });
  return P;
})();
function grosPiste(c, s){
  var l = GROS_PISTES[c];
  if(!l) return null;
  if(s <= l[0][0]) return l[0][1];
  for(var i = 1; i < l.length; i++) if(s < l[i][0]){ var a = l[i - 1], b = l[i], u = (s - a[0]) / (b[0] - a[0]); u = u * u * (3 - 2 * u); return a[1] + (b[1] - a[1]) * u; }
  return l[l.length - 1][1];
}
/* elle peut venir ? (le chat, ou null) — rien pendant le tutoriel, un jeu, le bain, une feuille ouverte… et pas si elle dort */
function grosPeut(V){
  var t = tama(V);
  if(V.gros || GUIDE || V.o.tutoriel || V.arrete || V.mode !== 'ranger' || V.glisse || V.ouvert || !V.grim.hidden || V.jouet || V.outil || V.bain || t.dehors || V.attenteBetise) return null;
  var o = chatsDe(V).filter(function(c){ return !c.chaton; })[0], st = o && V.chats[o.id];
  if(!o || !V.elO[o.id] || !st || st.tenu || st.anim || st.caresse || st.depart || st.passe || st.cabane || st.chasse || st.pose === 'dort') return null;
  return o;
}
function grosPret(V){
  /* (pas pendant les parties des robots — navigator.webdriver — : vingt secondes sans elle, au beau milieu, les ferait trébucher ;
     tools/mimi-grosplan.py l'autorise exprès : window.BRUMEVAL_GROS_AUTO) */
  try{ if(navigator.webdriver && !window.BRUMEVAL_GROS_AUTO) return null; }catch(e){}
  var t = tama(V);
  if(!(t.grosT > 0)) t.grosT = t.jeu + GROS_PREMIER[0] + Math.random() * (GROS_PREMIER[1] - GROS_PREMIER[0]);
  return t.jeu >= t.grosT ? grosPeut(V) : null;
}
/* c'est parti (force : tout de suite — les robots, le mode d'essai) */
function grosPlan(V, force){
  var o = force ? grosPeut(V) : grosPret(V);
  if(!o) return false;
  var t = tama(V), st = chatEtat(V, o);
  t.grosT = t.jeu + GROS_ENTRE[0] + Math.random() * (GROS_ENTRE[1] - GROS_ENTRE[0]);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  fermerBarre(V);
  var G = V.gros = {id:(V.grosN = (V.grosN || 0) + 1), o:o, phase:'va'};
  /* elle descend tout en bas de ce qu'on voit, vers nous (de face) — sur un téléphone, le bas de l'écran peut être au-dessus du bord
     du plancher : elle y va quand même, et sort de l'écran */
  var c = centreVue(V), bas = V.vb.y0 + (V.pan.y + V.vh) / V.k;
  var y = Math.min(solMax(V) - 4, bas + 30), x = borne(c.x + (Math.random() - 0.5) * 100, solXmin(V, y) + 90, solXmax(V, y) - 90);
  st.vite = 1.5;
  chatAller(V, o, chatSol(V, x, y), function(){
    st.vite = 1;
    if(V.gros !== G || V.arrete) return;
    grosSaute(V, G);
  });
  /* (quelque chose l'arrête en chemin — on la caresse, on la porte… : tant pis, elle reviendra dans deux minutes) */
  apres(V, 14000, function(){ if(V.gros === G && G.phase === 'va'){ V.gros = null; st.vite = 1; t.grosT = Math.min(t.grosT, t.jeu + 120); } });
  return true;
}
/* hop : elle saute par le bas de l'écran */
function grosSaute(V, G){
  var o = G.o, st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || st.tenu || st.caresse){ V.gros = null; return; }
  G.phase = 'saute';
  st.tenu = true;
  chatPose(V, o, 'marche');
  anim(d, [{transform:'scale(' + d._s + ')', opacity:1}, {transform:'translateY(' + Math.round(-14 * V.k) + 'px) scale(' + d._s + ')', opacity:1, offset:0.3},
    {transform:'translateY(' + Math.round(150 * V.k) + 'px) scale(' + (d._s * 1.12) + ')', opacity:0}], {duration:560, easing:'ease-in', fill:'forwards'});
  apres(V, 560, function(){ d.classList.add('at-c-dehors'); });
  apres(V, 1500 + Math.random() * 900, function(){ grosMonte(V, G); });
}
/* la grosse tête, au bord du bas de l'écran */
function grosMonte(V, G){
  if(V.gros !== G || V.arrete) return;
  var o = G.o, el = document.createElement('div');
  el.className = 'at-gp';
  /* (en trois couches, l'une sur l'autre : le corps, la tête, les pattes — la tête et le corps bougent d'un bloc, sans être redessinés :
     grosRig, R.couches) */
  var vb = 'viewBox="-36 -46 72 70" preserveAspectRatio="xMidYMax meet"';
  el.innerHTML = '<i class="at-gp-ombre" aria-hidden="true"></i><svg class="at-gp-svg at-gp-corps" ' + vb + ' aria-hidden="true"></svg><svg class="at-gp-svg at-gp-tete" ' + vb +
    ' aria-hidden="true"></svg><svg class="at-gp-svg at-gp-pattes" ' + vb + ' role="img" aria-label="' + esc(nomChat(o)) + ', tout près, tout près"></svg>';
  var tmp = document.createElement('div'), L = el.querySelectorAll('svg');
  tmp.innerHTML = '<svg>' + MP.gros(vChat(o.v), accPantin(o.acc)) + '</svg>';
  Array.prototype.slice.call(tmp.firstChild.childNodes).forEach(function(n){
    var dg = n.getAttribute ? n.getAttribute('data-g') : null;
    (dg === 'tete' ? L[1] : dg === 'patG' || dg === 'patD' ? L[2] : L[0]).appendChild(n);
  });
  V.root.appendChild(el);
  V.root.classList.add('at-gp-actif');
  G.el = el; G.svg = L[2]; G.rig = MP.grosRig(el); G.E = G.rig.E;
  G.rig.couches = {corps:L[0], tete:L[1]};
  grosMesure(G);
  G.phase = 'monte'; G.t0 = performance.now(); G.vu = 0; G.der = 0; G.cl = 0; G.or = 0; G.reg = 0; G.lech = 0;
  for(var c in GROS_PISTES) G.E[c] = grosPiste(c, 0);
  G.rig.appliquer(0);
  apres(V, 30, function(){ el.classList.add('at-vu'); });
  apres(V, 560, function(){ if(V.gros === G) sonMimi(V, 'gratte'); });
  apres(V, 1250, function(){ if(V.gros === G) sonMimi(V, 'gratte'); });
  apres(V, 2450, function(){ if(V.gros === G) sonMimi(V, 'gratte'); });
  apres(V, 5500, function(){ if(V.gros === G && G.phase !== 'part') sonMimi(V, 'trille'); });
  /* le doigt : sur sa tête, on la caresse ; un simple toucher, elle repart */
  function dedans(ev){ var e = document.elementFromPoint(ev.clientX, ev.clientY); return !!e && !!e.closest && !!e.closest('.at-gp [data-g="tete"], .at-gp [data-g="patG"], .at-gp [data-g="patD"]'); }
  el.addEventListener('pointerdown', function(ev){
    if(V.gros !== G || G.phase === 'part' || !dedans(ev)) return;
    ev.preventDefault(); ev.stopPropagation();
    try{ (ev.target && ev.target.setPointerCapture ? ev.target : el).setPointerCapture(ev.pointerId); }catch(e){}
    G.doigt = {id:ev.pointerId, x:ev.clientX, y:ev.clientY, t:Date.now(), dist:0, car:false};
    G.fx = ev.clientX; G.fy = ev.clientY;
  });
  /* (ses yeux suivent le doigt, où qu'il soit dans la pièce) */
  G.suivre = function(ev){ G.fx = ev.clientX; G.fy = ev.clientY; G.fv = Date.now(); };
  V.root.addEventListener('pointermove', G.suivre);
  el.addEventListener('pointermove', function(ev){
    if(V.gros !== G) return;
    G.suivre(ev);
    var D = G.doigt;
    if(!D || D.id !== ev.pointerId) return;
    D.dist += Math.hypot(ev.clientX - D.x, ev.clientY - D.y); D.x = ev.clientX; D.y = ev.clientY;
    if(!D.car && (D.dist > 10 || Date.now() - D.t > 320)) grosCaresse(V, G, true);
    if(D.car) G.car.dist += 1;
  });
  function lache(ev){
    var D = G.doigt;
    if(V.gros !== G || !D || D.id !== ev.pointerId) return;
    G.doigt = null;
    if(D.car) grosCaresse(V, G, false);
    /* un simple toucher : « Oh ! », elle redescend tout de suite (Romain : « ou alors on clique dessus, et là, elle redescend direct ») */
    else if(Date.now() - D.t < 320 && D.dist < 12 && performance.now() - G.t0 > GROS_PRET * 1000) grosPart(V, G, 'toucher');
  }
  el.addEventListener('pointerup', lache);
  el.addEventListener('pointercancel', lache);
  grosBoucle(V, G);
}
/* la taille d'une unité du dessin à l'écran, et le menton (le pivot de la tête), pour les couches (relu deux fois par seconde : l'écran
   peut tourner) */
function grosMesure(G){
  var r = G.svg.getBoundingClientRect(), W = r.width, H = r.height;
  G.mesT = Date.now();
  if(!W || !H || !G.rig.couches) return;
  var k = Math.min(W / 72, H / 70), ox = (W - 72 * k) / 2, oy = H - 70 * k;
  if(G.rig.k === k) return;
  G.rig.k = k;
  G.rig.couches.tete.style.transformOrigin = (ox + 36 * k).toFixed(1) + 'px ' + (oy + 60 * k).toFixed(1) + 'px';      /* (le menton : (0, 14) dans le dessin) */
}
/* une caresse commence (oui) ou finit (non) */
function grosCaresse(V, G, oui){
  var o = G.o;
  if(oui){
    if(G.phase !== 'la' && !(G.phase === 'monte' && performance.now() - G.t0 > GROS_PRET * 1000)) return;
    if(G.phase === 'monte'){ G.phase = 'la'; G.vu = Date.now(); }
    G.doigt.car = true;
    G.car = {t0:Date.now(), tic:0, dist:0, gain:G.car ? G.car.gain : 0, k:G.car ? G.car.k : lasse(V, 'caresse'), env:G.car ? G.car.env : 0, coeur:0, ronron:0};
    sonMimi(V, 'ronron');
  } else {
    G.der = Date.now();
    if(G.car){ G.car.fin = Date.now(); }
  }
}
/* les bonheurs d'une caresse, quatre fois par seconde (comme les gratouilles dans la pièce : caresseTic) */
function grosGain(V, G){
  var C = G.car, o = G.o, now = Date.now();
  if(!C || C.fin || now - C.tic < 400) return;
  C.tic = now;
  var gain = C.dist > 2 ? 0.75 : 0.5; C.dist = 0;
  if(C.gain < 14){ C.gain += gain; donner(o, 'amour', gain * 5); bhPlus(o, gain * GAIN_K * (C.k === undefined ? 1 : C.k)); }
  if(!C.env && C.gain >= 6 && envieEst(V, 'caresse')){ C.env = 1; envieFaite(V, o); }
  if(now - C.coeur > 950){ C.coeur = now; grosCoeur(V, G); }
  if(now - C.ronron > 1450){ C.ronron = now; sonMimi(V, 'ronron'); }
}
/* un point de sa tête (unités du dessin) → l'écran (dans V.root) */
function grosEcran(V, G, x, y){
  var m = G.svg.getScreenCTM(), r = V.root.getBoundingClientRect();
  if(!m) return null;
  return {x:m.a * x + m.c * y + m.e - r.left, y:m.b * x + m.d * y + m.f - r.top, k:Math.hypot(m.a, m.b)};
}
function grosCoeur(V, G){
  var E = G.E, p = grosEcran(V, G, E.dx + (Math.random() - 0.5) * 18, (1 - E.monte) * 64 - 28);
  if(!p) return;
  var c = document.createElement('i'); c.className = 'at-gp-coeur'; c.textContent = Math.random() < 0.7 ? '💖' : '✨';
  c.style.left = p.x.toFixed(0) + 'px'; c.style.top = p.y.toFixed(0) + 'px'; c.style.setProperty('--dx', ((Math.random() - 0.5) * 60).toFixed(0) + 'px');
  G.el.appendChild(c);
  apres(V, 1400, function(){ c.remove(); });
}
/* elle lèche l'écran : la langue, et une petite trace mouillée sur la vitre, qui sèche */
function grosLeche(V, G){
  G.lech = performance.now();
  sonMimi(V, 'lape');
  apres(V, 330, function(){
    if(V.gros !== G) return;
    var p = grosEcran(V, G, G.E.dx * 0.6, 19);
    if(!p) return;
    var l = document.createElement('i'); l.className = 'at-gp-lech';
    l.style.left = p.x.toFixed(0) + 'px'; l.style.top = p.y.toFixed(0) + 'px'; l.style.width = (p.k * 11).toFixed(0) + 'px'; l.style.height = (p.k * 7).toFixed(0) + 'px';
    G.el.appendChild(l);
    var m = document.createElement('i'); m.className = 'at-gp-mot'; m.textContent = 'Slurp !';
    m.style.left = (p.x + p.k * 12).toFixed(0) + 'px'; m.style.top = (p.y - p.k * 16).toFixed(0) + 'px';
    G.el.appendChild(m);
    apres(V, 2600, function(){ l.remove(); });
    apres(V, 1300, function(){ m.remove(); });
  });
}
/* elle repart (pourquoi : 'toucher', 'seule', 'fin') : elle regarde en bas… et saute */
function grosPart(V, G, pourquoi){
  if(V.gros !== G || G.phase === 'part') return;
  G.phase = 'part'; G.tp = performance.now(); G.pourquoi = pourquoi;
  G.dep = {}; ['monte', 'patG', 'patD', 'tilt', 'dx', 'lx', 'ly', 'clos', 'ronron', 'orG', 'orD', 'mou', 'langue', 'pup'].forEach(function(c){ G.dep[c] = G.E[c]; });
  if(G.car && !G.car.fin) G.car.fin = Date.now();
  if(pourquoi === 'toucher') sonMimi(V, 'trille');
}
/* l'image d'après (une trentaine de fois par seconde, rien de plus : « sans que ça rame ») */
function grosBoucle(V, G){
  if(V.gros !== G || V.arrete) return;
  requestAnimationFrame(function(now){
    if(V.gros !== G || V.arrete) return;
    if(now - (G.img || 0) < 30){ grosBoucle(V, G); return; }
    var dt = Math.min(0.1, (now - (G.img || now)) / 1000); G.img = now;
    var E = G.E, s = (now - G.t0) / 1000, t = Date.now(), vers = function(c, v, k){ E[c] += (v - E[c]) * Math.min(1, dt * k); };
    if(t - (G.mesT || 0) > 500) grosMesure(G);
    /* (on a quitté l'atelier, ouvert une feuille, changé de mode : elle s'en va) */
    if(G.phase !== 'part' && (V.mode !== 'ranger' || V.ouvert || !V.grim.hidden || V.salle !== salleDe(G.o))) grosPart(V, G, 'fin');
    /* (le doigt posé sur sa tête, sans bouger : au bout d'un tiers de seconde, c'est une caresse aussi) */
    if(G.doigt && !G.doigt.car && t - G.doigt.t > 320) grosCaresse(V, G, true);
    if(G.phase === 'monte'){
      for(var c in GROS_PISTES) E[c] = grosPiste(c, s);
      if(s >= GROS_FIN){ G.phase = 'la'; G.vu = t; }
    } else if(G.phase === 'la'){
      var C = G.car && !G.car.fin ? G.car : null;
      if(C){
        /* on la caresse : elle penche la tête contre le doigt, ferme les yeux, ronronne, les oreilles un peu de côté */
        var q = G.fx !== undefined ? grosDessin(G, G.fx, G.fy) : null, fx = q ? borne(q.x, -22, 22) : 0;
        vers('tilt', borne(fx * 0.8, -16, 16), 5); vers('dx', borne(fx * 0.09, -2.4, 2.4), 4);
        vers('clos', t - C.t0 > 350 ? 1 : 0, 6); vers('pau', E.clos > 0.4 ? 1 : 0, 12);      /* (les yeux fermés de plaisir : l'œil dessous se ferme aussi) */ vers('ronron', 1, 3); vers('orG', 9, 4); vers('orD', 9, 4); vers('mou', 5, 4);
        vers('lx', 0, 4); vers('ly', 0, 4); vers('pup', 0.7, 2);
        grosGain(V, G);
        if(t - C.t0 > 2400 && (!G.lech || now - G.lech > 5600) && !E.langue) grosLeche(V, G);
      } else {
        /* toute seule : elle cligne, bouge une oreille, regarde le doigt (ou autour d'elle), penche un peu la tête */
        vers('clos', 0, 5); vers('ronron', 0, 2); vers('orG', G.orC || 0, 7); vers('orD', G.orC2 || 0, 7); vers('mou', Math.sin(s * 1.3) * 1.5, 3); vers('dx', 0, 3);
        if(t > G.cl){ G.cl = t + 2600 + Math.random() * 2400; G.cli = now; }
        E.pau = G.cli && now - G.cli < 260 ? Math.sin(Math.PI * (now - G.cli) / 260) : 0;
        if(t > G.or){ G.or = t + 2600 + Math.random() * 3600; var u = Math.random(); G.orC = u < 0.4 ? 12 : u < 0.6 ? -5 : 0; G.orC2 = u < 0.4 ? -3 : u < 0.8 ? 11 : 0; apres(V, 260, function(){ G.orC = 0; G.orC2 = 0; }); }
        var suit = G.fv && t - G.fv < 2500 ? grosDessin(G, G.fx, G.fy) : null;
        if(suit){ vers('lx', borne(suit.x / 18, -1, 1), 7); vers('ly', borne((suit.y + 4) / 16, -1, 1), 7); }
        else {
          if(t > G.reg){ G.reg = t + 1400 + Math.random() * 2200; var w = Math.random(); G.rx = w < 0.55 ? 0 : (Math.random() - 0.5) * 1.7; G.ry = w < 0.55 ? 0.1 : (Math.random() - 0.6) * 0.8; G.rt = w < 0.55 ? (Math.random() < 0.5 ? 7 : -7) : 0; }
          vers('lx', G.rx || 0, 5); vers('ly', G.ry || 0, 5); vers('tilt', G.rt || 0, 2.5);
        }
        vers('pup', suit ? 0.85 : 0.6, 2);
        /* personne ne la caresse : elle s'en va (sept secondes après son arrivée, cinq après la dernière caresse) */
        var der = G.der || G.vu;
        if(!G.doigt && t - der > (G.der ? GROS_APRES : GROS_ATTEND)) grosPart(V, G, 'seule');
      }
      if(t - G.vu > GROS_MAX && !C) grosPart(V, G, 'fin');
      /* la langue : sortie, puis rentrée, en trois quarts de seconde */
      E.langue = G.lech && now - G.lech < 760 ? Math.sin(Math.PI * (now - G.lech) / 760) : 0;
      E.monte = 1 + E.langue * 0.05;
    } else if(G.phase === 'part'){
      /* elle regarde en bas (un tiers de seconde)… hop, elle se laisse tomber, les pattes lâchent juste après */
      var u = (now - G.tp) / 1000, D0 = G.dep, ea = function(a, b){ var w = borne((u - a) / (b - a), 0, 1); return w * w * (3 - 2 * w); };
      var r = ea(0, 0.35);
      ['tilt', 'dx', 'clos', 'ronron', 'langue', 'mou'].forEach(function(c){ E[c] = D0[c] * (1 - r); });
      E.lx = D0.lx * (1 - r); E.ly = D0.ly + (1 - D0.ly) * r; E.orG = D0.orG + (-5 - D0.orG) * r; E.orD = D0.orD + (-5 - D0.orD) * r; E.pup = D0.pup + (0.55 - D0.pup) * r; E.pau = 0;
      var f = borne((u - 0.4) / 0.3, 0, 1);
      E.monte = u < 0.4 ? D0.monte + 0.06 * ea(0.3, 0.4) : (D0.monte + 0.06) * (1 - f * f);
      E.patG = D0.patG + (30 - D0.patG) * ea(0.55, 0.8); E.patD = D0.patD + (30 - D0.patD) * ea(0.6, 0.85);
      if(u > 0.95){ grosFini(V, G); return; }
    }
    G.rig.appliquer(s);
    grosBoucle(V, G);
  });
}
/* le doigt (écran) → les unités de sa tête (0, 0 : le milieu de sa tête, quand elle est montée) */
function grosDessin(G, cx, cy){
  var m = G.svg.getScreenCTM();
  if(!m) return null;
  var i = m.inverse();
  return {x:i.a * cx + i.c * cy + i.e - G.E.dx, y:i.b * cx + i.d * cy + i.f + 2 - (1 - G.E.monte) * 64};
}
/* elle a disparu par en bas : on enlève la grosse tête, et elle revient dans la pièce, de dos */
function grosFini(V, G){
  if(G.suivre) V.root.removeEventListener('pointermove', G.suivre);
  if(G.el){ G.el.classList.remove('at-vu'); var el = G.el; apres(V, 400, function(){ el.remove(); }); }
  V.root.classList.remove('at-gp-actif');
  G.phase = 'fini';
  var C = G.car;
  if(C && C.gain >= 3) lasser(V, 'caresse');
  majBarre(V); changer(V);
  apres(V, 900 + Math.random() * 600, function(){ grosRevient(V, G); });
}
function grosRevient(V, G){
  if(V.gros !== G) return;
  V.gros = null;
  var o = G.o, st = V.chats[o.id], d = V.elO[o.id];
  if(st) st.tenu = false;
  if(!d || !st || !V.parId[o.id] || V.arrete) return;
  var c = centreVue(V), bas = V.vb.y0 + (V.pan.y + V.vh) / V.k, y = Math.min(solMax(V) - 4, bas + 10);
  var x = borne(c.x + (Math.random() - 0.5) * 160, solXmin(V, y) + 90, solXmax(V, y) - 90);
  st.pos = chatSol(V, x, y); placerEl(V, o);
  d.classList.remove('at-c-dehors'); chatReparait(d);
  chatPose(V, o, 'marche');
  /* elle remonte par le bas de l'écran… et repart dans la pièce, de dos (elle s'éloigne de nous) */
  anim(d, [{transform:'translateY(' + Math.round(120 * V.k) + 'px) scale(' + d._s + ')'}, {transform:'scale(' + d._s + ')'}], {duration:420, easing:'ease-out'});
  apres(V, 400, function(){
    var s2 = V.chats[o.id];
    if(!s2 || s2.tenu || s2.caresse || s2.anim) return;
    var y2 = borne(y - 200 - Math.random() * 140, SOL_MIN + 40, y - 140), q = chatSol(V, borne(x + (Math.random() - 0.5) * 220, solXmin(V, y2) + 60, solXmax(V, y2) - 60), y2);
    chatAller(V, o, q, function(){ chatPose(V, o, 'assis'); expression(V, o, 'at-x-content', 900); chatPlanifier(V, o, 3200); });
  });
  peutEtreCadeau(V);
}

/* ---------- La litière et le griffoir ---------- */
function nettoyerLitiere(V, l){
  var d = V.elO[l.id], o = chatsTous(V).filter(function(c){ return salleDe(c) === salleDe(l); })[0];
  sonMimi(V, 'gratte');
  if(d) anim(d, [0, -3, 3, -2, 2, 0].map(function(a){ return {transform:'scale(' + d._s + ') rotate(' + a + 'deg)'}; }), {duration:700});
  apres(V, 650, function(){
    delete l.sale; redessiner(V, l); etincelles(V, l);
    var t = 'Hop, la pelle passe : une litière toute propre, ça sent bon le sable chaud !';
    toast(V, '<b>🪣 ✨</b> ' + esc(t), 3800, t);
    if(o) soigner(V, o, 'litiere', 6, 'propre', 45); else changer(V);
  });
}
/* elle y va de temps en temps (on ne la voit pas faire : elle gratte, c'est tout) */
function chatLitiere(V, o){
  var l = ici(V).filter(function(x){ return x.t === 'litiere' && !x.sale && !x.sur; })[0];
  if(!l) return false;
  var pl = posObj(V, l);
  chatAller(V, o, chatSol(V, pl.x, pl.y - 18), function(){
    chatPose(V, o, 'assis'); sonMimi(V, 'gratte');
    apres(V, 1800, function(){ if(!V.parId[l.id]) return; l.sale = 1; redessiner(V, l); donner(o, 'propre', -40); majHumeur(V, o); changer(V); chatBouger(V, o, chatSol(V, pl.x + 110, pl.y + 20), 'saute', function(){ chatPose(V, o, 'lave'); chatPlanifier(V, o, 3200); }); });
  });
  return true;
}
function chatGriffoir(V, o, g){
  var seule = !g;      /* (elle y va d'elle-même : ce n'est pas nous qui lui offrons — ça ne peut pas être « pile son envie ») */
  g = g || ici(V).filter(function(x){ return x.t === 'griffoir' && !x.sur; })[0];
  if(!g) return false;
  var pg = posObj(V, g), y = Math.min(solMax(V), pg.y + 12), droite = pg.x > 600, c = chatSol(V, pg.x + (droite ? 36 : -36) * pg.s, y);
  chatAller(V, o, c, function(){
    var d = V.elO[o.id], st = chatEtat(V, o);
    if(!d) return;
    st.gauche = droite ? true : false; d.classList.toggle('at-c-gauche', st.gauche);
    chatPose(V, o, 'griffe'); chatPlanifier(V, o, 3600);
    [250, 1050, 1850].forEach(function(t){ apres(V, t, function(){ if(enJeu(V, o, d, 'griffe')){ griffures(V, g, pg.x, pg.y - 70 * pg.s, pg.s); sonMimi(V, 'gratte'); } }); });
    apres(V, 2600, function(){ if(enJeu(V, o, d, 'griffe')){ chatPose(V, o, 'lave'); soigner(V, o, seule ? 'griffoir:seule' : 'griffoir', 6, 'jeu', 25); } });
  });
  return true;
}

/* ---------- Les jouets (ils ne viennent que des coffrets) ---------- */
/* le chat avec qui on joue (et s'il n'est pas dans cette pièce, il arrive) */
function chatJoueur(V){
  var l = chatsTous(V).filter(function(c){ var st = V.chats[c.id]; return !(st && st.depart); });
  if(!l.length){ var t0 = 'Pas de chat ici… Ses affaires attendent sagement.'; toast(V, '<b>🐈</b> ' + esc(t0), 3200, t0); return null; }
  var o = l.filter(function(c){ return salleDe(c) === V.salle; })[0];
  if(!o){ o = l[0]; var t = nomChat(o) + ' est de l\'autre côté de l\'arche. Elle arrive en trottinant !'; toast(V, '<b>🐈 💨</b> ' + esc(t), 3800, t); chatRevient(V, o, true); return null; }
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || st.tenu || st.passe || tama(V).dehors){ var t2 = nomChat(o) + ' est occupée… Patience, elle revient tout de suite.'; toast(V, '<b>🐈</b> ' + esc(t2), 3200, t2); return null; }
  if(st.caresse) caresseFin(V, o);
  if(st.anim) chatArreter(V, o);
  if(st.t){ clearTimeout(st.t); st.t = null; }
  if(st.pose === 'dort'){ st.dortJusqua = 0; chatPose(V, o, 'assis'); expression(V, o, 'at-x-baille', 900); }
  return o;
}
function jouer(V, id){
  var m = mimi(V);
  if(!JOUETS[id] || m.jouets.indexOf(id) < 0) return;
  fermerBarre(V);
  if(V.jouet) finJouet(V, true);
  if(V.bain) return;
  var o = chatJoueur(V);
  if(!o) return;
  m.neufs = m.neufs.filter(function(x){ return x !== id; });
  changer(V);
  if(id === 'pelote'){ jouerPelote(V, o); return; }
  if(id === 'herbe'){ jouerHerbe(V, o); return; }
  V.jouet = {id:id, o:o, fin:Date.now() + (id === 'carton' ? 9000 : 14000), bouge:Date.now(), doigt:id === 'plume' || id === 'laser'};
  if(id === 'plume' || id === 'laser') jouetDoigtDebut(V, o);
  else if(id === 'souris') jouerSouris(V, o);
  else if(id === 'grelot') jouerGrelot(V, o, 0);
  else if(id === 'carton') jouerCarton(V, o);
}
function finJouet(V, coupe){
  var J = V.jouet;
  if(!J) return;
  V.jouet = null; clearTimeout(V.jouetT);
  if(J.el){ var e = J.el; anim(e, [{opacity:1}, {opacity:0}], {duration:400, fill:'forwards'}); apres(V, 420, function(){ e.remove(); }); }
  if(J.boite){ var b = J.boite; anim(b, [{opacity:1}, {opacity:0}], {duration:500, delay:400, fill:'forwards'}); apres(V, 950, function(){ b.remove(); }); }
  var o = J.o, d = V.elO[o.id], st = chatEtat(V, o);
  st.vite = 1;
  if(d) d.classList.remove('at-x-joue', 'at-c-tapi', 'at-c-fesses', 'at-dans-boite');
  if(coupe) return;
  soigner(V, o, 'jouet:' + J.id, J.id === 'carton' ? 9 : 10, 'jeu');
  if(st.anim){ chatPlanifier(V, o, 2600); return; }
  chatPose(V, o, 'assis'); expression(V, o, 'at-x-content', 600); coeursChat(V, o); chatPlanifier(V, o, 3000);
}
/* (le doigt dans la pièce : un point du plancher) */
function pointPiece(V, ev){
  var r = V.piece.getBoundingClientRect(), wx = V.vb.x0 + (ev.clientX - r.left + V.pan.x) / V.k, wy = V.vb.y0 + (ev.clientY - r.top + V.pan.y) / V.k;
  return chatSol(V, wx, Math.max(wy, SOL_MIN + 20));
}
/* La plume et le point rouge : ils suivent le doigt, n'importe où sur le plancher ; Mimi les chasse */
function jouetDoigtDebut(V, o){
  var J = V.jouet, p = chatPos(V, o), st = chatEtat(V, o), el = document.createElement('div');
  el.className = 'at-jouet at-jouet-' + J.id;
  el.innerHTML = J.id === 'laser' ? '<i></i>' : '<svg viewBox="0 0 60 140" aria-hidden="true"><path d="M30,0 L30,80" stroke="#7d4626" stroke-width="3"/><path d="M30,78 C18,92 16,116 30,138 C44,116 42,92 30,78 Z" fill="#ff8fb3" stroke="#24182e" stroke-width="2.6"/><path d="M30,84 L30,134 M30,96 l-7,6 M30,108 l-8,7 M30,96 l7,6 M30,108 l8,7 M30,120 l-6,6 M30,120 l6,6" stroke="#c94a7c" stroke-width="1.6" fill="none"/></svg>';
  V.calque.appendChild(el);
  J.el = el;
  posJouet(V, chatSol(V, p.x + (st.gauche ? -200 : 200), p.y + 30));
  var t = J.id === 'laser' ? 'Le point rouge est là ! Promène ton doigt sur le plancher, et regarde-la devenir folle.' : 'La plume danse au bout de sa ficelle. Fais-la voler sur le plancher… et arrête-toi d\'un coup !';
  toast(V, '<b>' + JOUETS[J.id].ic + '</b> ' + esc(t), 5000, t);
  sonMimi(V, J.id === 'laser' ? 'laser' : 'plume');
  expression(V, o, 'at-x-joue', 1500);
  jouetTic(V);
}
function posJouet(V, pt, seul){
  var J = V.jouet;
  if(!J || !J.el) return;
  J.pos = pt; if(!seul) J.bouge = Date.now();
  J.el.style.left = pX(V, pt.x); J.el.style.top = pY(V, pt.y);
  J.el.style.setProperty('--s', echelleSol(pt.y).toFixed(3));
  J.el.style.zIndex = 99000;
}
function jouetDoigt(V, e){
  var id = e.pointerId;
  posJouet(V, pointPiece(V, e));
  function mv(ev){ if(ev.pointerId !== id || !V.jouet) return; posJouet(V, pointPiece(V, ev)); if(V.jouet.id === 'plume' && Math.random() < 0.08) sonMimi(V, 'plume'); }
  function up(ev){ if(ev.pointerId !== id) return; fin(); }
  function fin(){ window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); V.suivis = V.suivis.filter(function(f){ return f !== fin; }); }
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  V.suivis.push(fin);
}
function jouetTic(V){
  var J = V.jouet;
  if(!J || V.arrete) return;
  var o = J.o, st = chatEtat(V, o), d = V.elO[o.id], now = Date.now();
  if(now > J.fin || !d || salleDe(o) !== V.salle){ finJouet(V); return; }
  if(J.id === 'laser' && now - J.bouge > 2200){ J.bouge = now; posJouet(V, chatSolVisible(V), true); sonMimi(V, 'laser'); }
  if(J.doigt && J.pos && !st.anim && !st.tenu){
    var p = chatPos(V, o), dx = J.pos.x - p.x, dy = J.pos.y - p.y, dist = Math.hypot(dx, dy), sx = dx < 0 ? -1 : 1;
    d.classList.add('at-x-joue');
    if(J.id === 'laser'){
      if(dist > 55){ st.vite = dist > 150 ? 4.2 : 2.2; chatBouger(V, o, chatSol(V, J.pos.x - sx * 34, J.pos.y), 'marche', function(){ st.vite = 1; if(V.jouet) chatPose(V, o, 'tape'); }); }
      else if(Math.random() < 0.5){ chatPose(V, o, 'saute'); gesteChat(V, o, 'bond', {d:500, h:10}); apres(V, 520, function(){ if(V.jouet) chatPose(V, o, 'tape'); }); }
      else chatPose(V, o, 'tape');
    } else {
      if(dist > 170){ d.classList.remove('at-c-tapi', 'at-c-fesses'); J.tapi = 0; st.vite = 1.3; chatBouger(V, o, chatSol(V, J.pos.x - sx * 130, J.pos.y), 'marche', function(){ st.vite = 1; }); }
      else if(!J.tapi){ J.tapi = now; st.gauche = dx < 0; d.classList.toggle('at-c-gauche', st.gauche); chatPose(V, o, 'marche'); d.classList.add('at-c-tapi', 'at-c-fesses'); }
      else if(now - J.tapi > 900 && now - J.bouge > 400){
        d.classList.remove('at-c-tapi', 'at-c-fesses'); J.tapi = 0; st.vite = 1.2;
        chatBouger(V, o, chatSol(V, J.pos.x - sx * 18, J.pos.y), 'saute', function(){ st.vite = 1; if(!V.jouet) return; chatPose(V, o, 'tape'); sonMimi(V, 'plume'); if(Math.random() < 0.5) flotter(V, o, 'Attrapée !'); });
      }
    }
  }
  V.jouetT = apres(V, 330, function(){ jouetTic(V); });
}
/* La souris mécanique : on la remonte (cric-cric), elle file en zigzag, Mimi la poursuit et finit par l'attraper */
function jouerSouris(V, o){
  var J = V.jouet, p = chatPos(V, o), el = document.createElement('div');
  el.className = 'at-souris at-souris-meca';
  el.innerHTML = dessinSouris().replace('#b9b3c8', '#9fa6b8').replace('#b9b3c8', '#9fa6b8').replace('</svg>', '<path d="M14,10 v-6 M10,4 h8" stroke="#f5c542" stroke-width="3" stroke-linecap="round"/></svg>');
  var pts = [], y = borne(p.y + 30, SOL_MIN + 40, solMax(V) - 20);
  for(var i = 0; i < 4; i++){ var yy = borne(y + (i % 2 ? -60 : 50), SOL_MIN + 40, solMax(V) - 20); pts.push(chatSol(V, (i % 2 ? solXmin(V, yy) + 140 + Math.random() * 120 : solXmax(V, yy) - 140 - Math.random() * 120), yy)); }
  var dep = chatSol(V, p.x + 90, y);
  el.style.left = pX(V, dep.x); el.style.top = pY(V, dep.y); el.style.width = 'calc(' + (40 * echelleSol(y)).toFixed(1) + 'px * var(--k) * 1.7)'; el.style.zIndex = 99000;
  V.calque.appendChild(el); J.el = el;
  sonMimi(V, 'clef');
  var t = 'Cric, cric, cric… on remonte la souris mécanique ! Et la voilà partie.';
  toast(V, '<b>🐭</b> ' + esc(t), 4000, t);
  var st = chatEtat(V, o);
  chatPose(V, o, 'marche'); var d = V.elO[o.id]; if(d) d.classList.add('at-c-tapi', 'at-x-joue');
  (function etape(i, de){
    if(V.jouet !== J) return;
    if(i >= pts.length){
      /* la fin : elle bondit dessus */
      var dd = V.elO[o.id]; if(dd) dd.classList.remove('at-c-tapi');
      st.vite = 1.3;
      chatBouger(V, o, chatSol(V, de.x - 26, de.y), 'saute', function(){
        st.vite = 1; if(V.jouet !== J) return;
        chatPose(V, o, 'tape'); sonMimi(V, 'couic'); flotter(V, o, 'Attrapée !');
        anim(el, [{transform:'translate(-50%,-100%) rotate(0)'}, {transform:'translate(-50%,-100%) rotate(180deg) scaleY(.8)'}], {duration:400, fill:'forwards'});
        apres(V, 1500, function(){ if(V.jouet === J) finJouet(V); });
      });
      return;
    }
    var a = pts[i], dur = 1100 + Math.random() * 300;
    el.classList.toggle('g', a.x < de.x);
    anim(el, [{left:pX(V, de.x), top:pY(V, de.y)}, {left:pX(V, a.x), top:pY(V, a.y)}], {duration:dur, easing:'linear', fill:'forwards'});
    apres(V, 280, function(){ var dd = V.elO[o.id]; if(dd) dd.classList.remove('at-c-tapi'); if(V.jouet !== J) return; st.vite = 2.6; if(st.anim) chatArreter(V, o); chatAller(V, o, chatSol(V, a.x - (a.x > de.x ? 60 : -60), a.y), function(){ st.vite = 1; }); });
    apres(V, dur, function(){ etape(i + 1, a); });
  })(0, dep);
}
/* La balle à grelot : elle roule, ding-ding ; Mimi court, la tape, elle repart (trois fois) */
function balleSVG(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#ff8fb3" stroke="#24182e" stroke-width="3"/><path d="M5,16 C14,22 26,22 35,16 M8,28 C16,24 24,24 32,28" stroke="#fff3c4" stroke-width="3" fill="none"/><circle cx="20" cy="20" r="5" fill="#f5c542" stroke="#24182e" stroke-width="2"/><circle cx="14" cy="12" r="3" fill="#fff" opacity=".7"/></svg>'; }
function jouerGrelot(V, o, n){
  var J = V.jouet;
  if(V.jouet !== J || !J) return;
  var p = chatPos(V, o), st = chatEtat(V, o);
  if(!J.el){ var el = document.createElement('div'); el.className = 'at-balle'; el.innerHTML = balleSVG(); el.style.zIndex = 99000; V.calque.appendChild(el); J.el = el; J.pos = chatSol(V, p.x + 50, p.y + 6); el.style.left = pX(V, J.pos.x); el.style.top = pY(V, J.pos.y); }
  if(n >= 3){ apres(V, 600, function(){ if(V.jouet === J) finJouet(V); }); return; }
  var y = borne(J.pos.y + (Math.random() - 0.5) * 120, SOL_MIN + 40, solMax(V) - 20), x = J.pos.x > 600 ? solXmin(V, y) + 160 + Math.random() * 200 : solXmax(V, y) - 160 - Math.random() * 200, a = chatSol(V, x, y);
  var e = J.el, de = J.pos, tours = (a.x - de.x) / 40 * 57;
  e.style.width = 'calc(' + (26 * echelleSol(a.y)).toFixed(1) + 'px * var(--k) * 1.7)';
  anim(e, [{left:pX(V, de.x), top:pY(V, de.y), transform:'translate(-50%,-100%) rotate(0deg)'}, {left:pX(V, a.x), top:pY(V, a.y), transform:'translate(-50%,-100%) rotate(' + tours.toFixed(0) + 'deg)'}], {duration:1000, easing:'cubic-bezier(.2,.7,.4,1)', fill:'forwards'});
  J.pos = a; sonMimi(V, 'grelot');
  expression(V, o, 'at-x-joue', 1800);
  apres(V, 250, function(){
    if(V.jouet !== J) return;
    st.vite = 3.6; if(st.anim) chatArreter(V, o);
    chatAller(V, o, chatSol(V, a.x - (a.x > p.x ? 46 : -46), a.y), function(){
      st.vite = 1; if(V.jouet !== J) return;
      chatPose(V, o, 'tape');
      apres(V, 500, function(){ jouerGrelot(V, o, n + 1); });
    });
  });
}
/* Le carton : elle saute dedans, on ne voit plus que ses oreilles ; un toucher sur le carton (ou un peu de patience) : coucou ! */
/* (le carton est bas : quand elle est dedans, sa tête dépasse — deux oreilles, deux yeux qui guettent) */
function cartonSVG(){ return '<svg viewBox="-8 0 166 58" aria-hidden="true"><path d="M8,14 L-6,2 L-4,24 L8,34 Z M142,14 L156,2 L154,24 L142,34 Z" fill="#d29b5c" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/><path d="M8,14 H142 V54 H8 Z" fill="#e2b47a" stroke="#24182e" stroke-width="4" stroke-linejoin="round"/><path d="M8,14 H142" stroke="#a87240" stroke-width="5"/><path d="M60,28 h30 M66,36 h18" stroke="#a87240" stroke-width="3" stroke-linecap="round"/><text x="75" y="50" font-size="12" text-anchor="middle">🐾</text></svg>'; }
function jouerCarton(V, o){
  var J = V.jouet, p = chatPos(V, o), y = borne(p.y + 20, SOL_MIN + 50, solMax(V) - 20), x = borne(p.x + 130, solXmin(V, y) + 120, solXmax(V, y) - 120);
  var pl = placeLibre(V, [[x, y], [borne(p.x - 130, solXmin(V, y) + 120, solXmax(V, y) - 120), y]], 90, 110);
  x = pl.x; y = pl.y;
  if(pl.hors) allerVers(V, x, y - 60);
  var s = echelleSol(y), b = document.createElement('div');
  b.className = 'at-fixe at-touche at-boite'; b.setAttribute('data-at', 'jcarton'); b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Le carton');
  b.innerHTML = cartonSVG();
  b.style.left = pX(V, x); b.style.top = pY(V, y); b.style.width = pW(V, 166 * s);
  b.style.zIndex = Math.round(posObj(V, {t:'chat', x:x, y:y, sur:null}).z * 5) + 4;
  V.scene.appendChild(b); J.boite = b; J.pos = {x:x, y:y};
  anim(b, [{transform:'translate(-50%,-100%) scale(.2)', opacity:0}, {transform:'translate(-50%,-100%) scale(1.08)', opacity:1, offset:.7}, {transform:'translate(-50%,-100%) scale(1)'}], {duration:450, easing:'ease-out'});
  sonMimi(V, 'carton');
  var t = 'Un carton ! Elle n\'a d\'yeux que pour lui…';
  toast(V, '<b>📦</b> ' + esc(t), 3200, t);
  var st = chatEtat(V, o);
  chatAller(V, o, chatSol(V, x - 110 * s, y), function(){
    if(V.jouet !== J) return;
    expression(V, o, 'at-x-joue', 900);
    chatBouger(V, o, chatSol(V, x, y - 6), 'saute', function(){
      var d = V.elO[o.id];
      if(V.jouet !== J || !d) return;
      chatPose(V, o, 'assis'); d.classList.add('at-dans-boite'); d.style.zIndex = parseInt(b.style.zIndex, 10) - 1;
      sonMimi(V, 'carton'); J.dedans = Date.now();
      apres(V, 4200, function(){ if(V.jouet === J && J.dedans) sortirCarton(V); });
    });
  });
}
function sortirCarton(V){
  var J = V.jouet;
  if(!J || J.id !== 'carton') return;
  if(!J.dedans){ son(V, 'clic'); return; }
  J.dedans = 0;
  var o = J.o, d = V.elO[o.id], p = chatPos(V, o);
  if(d) d.classList.remove('at-dans-boite');
  flotter(V, o, 'Coucou !'); sonMimi(V, 'trille'); expression(V, o, 'at-x-content', 600);
  chatBouger(V, o, chatSol(V, p.x - 120, p.y + 16), 'saute', function(){ chatPose(V, o, 'assis'); apres(V, 1200, function(){ if(V.jouet === J) finJouet(V); }); });
}
/* L'herbe à chat : une pincée, et elle se roule, file dans tous les sens, puis se pose, ravie (une fois par moment) */
function jouerHerbe(V, o){
  var t = tama(V), cle = momentCle(V);
  if(t.herbe === cle){ var tx = 'Elle en a déjà eu tout à l\'heure. L\'herbe à chat, c\'est une fois de temps en temps !'; toast(V, '<b>🌿</b> ' + esc(tx), 4200, tx); return; }
  t.herbe = cle;
  var F = cadreObjet(V, o.id);
  if(F) for(var i = 0; i < 9; i++){ var f = document.createElement('i'); f.className = 'at-feuille-herbe'; f.textContent = '🌿'; f.style.left = pX(V, F.x + (Math.random() - 0.5) * F.w); f.style.top = pY(V, F.y - F.h * 1.2); f.style.setProperty('--dx', ((Math.random() - 0.5) * 60).toFixed(0) + 'px'); f.style.animationDelay = (i * 0.06).toFixed(2) + 's'; V.calque.appendChild(f); (function(f){ apres(V, 1600, function(){ f.remove(); }); })(f); }
  sonMimi(V, 'herbe');
  var tx2 = 'Une pincée d\'herbe à chat… et ' + nomChat(o) + ' devient complètement zinzin !';
  toast(V, '<b>🌿</b> ' + esc(tx2), 4500, tx2);
  V.jouet = {id:'herbe', o:o, fin:Date.now() + 15000};
  var J = V.jouet;
  apres(V, 700, function(){ if(V.jouet !== J) return; chatPose(V, o, 'dos'); expression(V, o, 'at-x-content at-x-clos', 1800); sonMimi(V, 'roule'); });
  apres(V, 2600, function(){ if(V.jouet !== J) return; chatPose(V, o, 'assis'); chatJoue(V, o, 'rond'); });
  apres(V, 6200, function(){ if(V.jouet !== J) return; chatPose(V, o, 'dos'); expression(V, o, 'at-x-attrape', 1400); sonMimi(V, 'grr'); });
  apres(V, 8000, function(){ if(V.jouet !== J) return; chatPose(V, o, 'pain'); expression(V, o, 'at-c-ronron', 3000); sonMimi(V, 'ronron'); });
  apres(V, 11000, function(){ if(V.jouet === J){ soigner(V, o, 'jouet:herbe', 14, 'jeu'); V.jouet = null; coeursChat(V, o); chatPlanifier(V, o, 3500); } });
}

/* Une place du plancher où rien ne cache une chose de demi-largeur l et de hauteur h (en mesures du plancher, à l'échelle de l'endroit) :
   on essaie les places proposées, puis des places libres au hasard ; à défaut, la première. Les petits objets comptent aussi. */
/* ev : {x, y, r} — pas derrière ça (Mimi, assise là : elle cacherait ce qu'on pose) */
function placeLibre(V, l, dl, h, ev){
  /* (17 novembre) la cueillette, les flacons de devant la porte et leur « Nouveau ! » : leurs vraies places à l'écran (rien de posé
     dessus ni dessous — leurs bulles passent devant ce qui est plus au fond : le baquet s'y est retrouvé caché, sur un téléphone ; une
     grande zone fixe, d'abord, était trop large : sur un téléphone, elle ne laissait plus une place libre à l'écran) */
  var tas = V.salle || !V.piece || !V.pan ? [] : (V.elTas || []).concat(V.elFl || [], V.elPlP ? [V.elPlP] : [], V.elNeuf ? [V.elNeuf] : []).map(function(e){
    if(!e || e.hidden || !e.isConnected) return null;
    var r = e.getBoundingClientRect();
    if(!r.width || !r.height) return null;
    var a = versMonde(V, r.left, r.top), b = versMonde(V, r.right, r.bottom);
    return [a.x - 10, a.y - 10, b.x + 10, b.y + 10];
  }).filter(Boolean);
  /* combien la chose posée là serait cachée (0 : pas du tout ; 1 : interdit) */
  function cache(x, y){
    if(ev && Math.abs(x - ev.x) < ev.r && y < ev.y + 30 && y > ev.y - ev.r * 2.6) return 1;      /* (ni derrière elle, ni sous sa bulle) */
    var s = echelleSol(y), bx = [x - dl * s, y - h * s, x + dl * s, y], aire = (bx[2] - bx[0]) * (bx[3] - bx[1]), pire = 0;
    var zb = Math.round(posObj(V, {t:'chat', x:x, y:y, sur:null}).z * 5);      /* (sa place dans l'ordre du dessin, à elle, là) */
    /* (ni sur la cueillette et les flacons, ni sous les boutons du bas de l'écran) */
    for(var i = 0; i < tas.length; i++) if(inter(bx, tas[i]) > aire * 0.04) return 1;
    if(sousBoutons(V, x, y) || sousBoutons(V, x - dl * s * 0.8, y) || sousBoutons(V, x + dl * s * 0.8, y)) return 1;
    /* (les cartons pas encore ouverts cachent aussi : ils sont tout devant — vu avec les colis du parc à chat, sur un téléphone) */
    boitesCartons(V).forEach(function(b){ if(b[3] > y) pire = Math.max(pire, inter(bx, b) / aire); });
    ici(V).forEach(function(o){
      if(o.sur || o.t === 'chat' || o.t === 'tapis' || o.cote) return;
      var c = catDe(o); if(c.z === 'mur' || c.z === 'tapis') return;
      /* (devant ou derrière, c'est l'ordre du dessin qui le dit — z —, pas le pied de l'objet : le chaudron et la paillasse, très
         profonds, passent devant ce qui est posé un peu plus bas que leurs pieds ; le baquet s'est retrouvé derrière eux, Mimi dedans,
         invisible — vu par tools/mimi.py, 17 novembre) */
      var p = posObj(V, o); if(Math.round(p.z * 5) < zb - 2) return;
      pire = Math.max(pire, inter(bx, boite(o, p)) / aire);
    });
    /* (rien du tout devant : à 6 % près, le chaudron cachait encore les hanches de Mimi, assise au bord du baquet — vu par
       tools/mimi-soins.py, 17 novembre ; le reste du baquet se voyait, elle non) */
    return pire > 0.015 ? Math.min(1, pire) : 0;
  }
  /* (17 novembre : pas à moitié hors de l'écran non plus — sur un téléphone, le baquet s'est posé au bord gauche, coupé en deux) */
  function horsVue(x, y){
    if(!(V.k && V.pan && V.vb && V.vw)) return false;
    var s = echelleSol(y), ex = function(u){ return (u - V.vb.x0) * V.k - V.pan.x; }, ey = function(u){ return (u - V.vb.y0) * V.k - V.pan.y; };
    return ex(x - dl * s) < 6 || ex(x + dl * s) > V.vw - 6 || ey(y - h * s) < 60 || ey(y) > V.vh - 6;
  }
  for(var i = 0; i < l.length; i++) if(!cache(l[i][0], l[i][1]) && !horsVue(l[i][0], l[i][1])) return {x:l[i][0], y:l[i][1]};
  /* (pas de place là : la place libre la plus proche de ce qu'on voulait, parmi celles qu'on voit à l'écran — sur un téléphone, la
     pièce est plus large que lui ; 17 novembre : une grille sur tout le plancher, plus des essais au hasard ; s'il n'y a vraiment
     rien de libre, la moins cachée) */
  var mieux = null;
  function essai(x, y){
    var c = cache(x, y), hv = horsVue(x, y);
    /* (17 novembre : mieux vaut une place libre juste hors de l'écran — on y fait glisser la pièce : allerVers — qu'une place à moitié
       cachée : au téléphone, le grand coffret s'est posé derrière les cartons pas encore ouverts) */
    var sc = c * 8000 + (hv ? 400 : 0) + Math.hypot(x - l[0][0], y - l[0][1]);
    if(c < 1 && (!mieux || sc < mieux.sc)) mieux = {x:x, y:y, sc:sc, hors:hv};
  }
  var y0 = SOL_MIN + 50, y1 = solMax(V) - 16;
  for(var gy = 0; gy <= 6; gy++) for(var gx = 0; gx <= 10; gx++){
    var y = y0 + (y1 - y0) * gy / 6, xa = solXmin(V, y) + dl + 30, xb = solXmax(V, y) - dl - 30;
    if(xb > xa) essai(xa + (xb - xa) * gx / 10, y);
  }
  for(var k = 0; k < 16; k++){ var q = chatSolVisible(V); essai(borne(q.x, solXmin(V, q.y) + dl + 30, solXmax(V, q.y) - dl - 30), q.y); }
  return mieux ? {x:mieux.x, y:mieux.y, hors:mieux.hors} : {x:l[0][0], y:l[0][1]};
}
/* ---------- Le coffret qu'elle rapporte ---------- */
/* (grand : le coffret doré du grand cadeau — le même, en or, au ruban rouge, avec deux étoiles) */
function coffretSVG(grand){
  if(grand) return coffretSVG().replace(/#f5c542/g, '#e0443a').replace('#ffd36a', '#ff7b6b').replace('#f5b945', '#c92f2f')
    .replace('#9d6ee3', '#f5c542').replace('#7d4fc8', '#e0a52c').replace('#b796ff', '#ffe08a')
    .replace('</svg>', '<path d="M51,2 l1.7,4.3 4.3,1.7 -4.3,1.7 -1.7,4.3 -1.7,-4.3 -4.3,-1.7 4.3,-1.7 Z M11,40 l1.1,2.9 2.9,1.1 -2.9,1.1 -1.1,2.9 -1.1,-2.9 -2.9,-1.1 2.9,-1.1 Z" fill="#fffbe6" stroke="#24182e" stroke-width="1.2" stroke-linejoin="round"/></svg>');
  return '<svg viewBox="0 0 64 60" aria-hidden="true"><ellipse cx="32" cy="56" rx="26" ry="4" fill="rgba(0,0,0,.25)"/>' +
    '<path d="M8,26 H56 V54 H8 Z" fill="#9d6ee3" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/><path d="M8,26 H56 V32 H8 Z" fill="#7d4fc8"/>' +
    '<path d="M28,26 H36 V54 H28 Z" fill="#f5c542" stroke="#24182e" stroke-width="2.4"/>' +
    '<g class="at-cof-couv"><path d="M4,16 H60 V27 H4 Z" fill="#b796ff" stroke="#24182e" stroke-width="3" stroke-linejoin="round"/><path d="M27,16 H37 V27 H27 Z" fill="#f5c542" stroke="#24182e" stroke-width="2.4"/>' +
    '<path d="M32,16 C24,4 12,6 16,12 C18,16 26,16 32,16 C38,16 46,16 48,12 C52,6 40,4 32,16 Z" fill="#ffd36a" stroke="#24182e" stroke-width="2.6" stroke-linejoin="round"/><circle cx="32" cy="15" r="3.4" fill="#f5b945" stroke="#24182e" stroke-width="2"/></g>' +
    '<path d="M12,34 l3,3 M50,38 l-3,3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>';
}
function dessinerCoffret(V, neuf){
  if(V.elCoffret){ V.elCoffret.remove(); V.elCoffret = null; }
  var c = tama(V).coffret;
  if(!c || V.salle) return;
  var s = echelleSol(c.y), d = document.createElement('div');
  d.className = 'at-fixe at-touche at-coffret' + (c.g ? ' at-coffret-grand' : ''); d.setAttribute('data-at', 'coffret'); d.setAttribute('role', 'button'); d.setAttribute('aria-label', 'Ouvrir le coffret de Mimi');
  d.innerHTML = coffretSVG(c.g);
  d.style.left = pX(V, c.x); d.style.top = pY(V, c.y); d.style.width = pW(V, (c.g ? 112 : 84) * s);
  d.style.zIndex = Math.round(posObj(V, {t:'chat', x:c.x, y:c.y, sur:null}).z * 5) + 2;
  V.scene.appendChild(d); V.elCoffret = d;
  if(neuf) anim(d, [{transform:'translate(-50%,-100%) translateY(-60%) scale(.6)', opacity:0}, {transform:'translate(-50%,-100%) scale(1.1,.88)', opacity:1, offset:.7}, {transform:'translate(-50%,-100%)'}], {duration:500, easing:'ease-in'});
}
function ouvrirCoffret(V){
  var t = tama(V), c = t.coffret, el = V.elCoffret;
  if(!c) return;
  t.coffret = null; V.elCoffret = null;
  if(el){ el.classList.add('ouvert'); el.removeAttribute('data-at'); apres(V, 1500, function(){ el.remove(); }); }
  sonMimi(V, 'ouvre');
  /* (entre-temps, on a pu l'acheter à la boutique, ou le gagner à un mini-jeu : alors le coffret apporte autre chose) */
  var code = c.c;
  if(code !== 'f:' && aDeja(V, code)) code = contenuCoffret(V).c;
  var m = mimi(V), k = code.charAt(0), id = code.slice(2), tx, ic, dans = c.g ? 'Dans le grand coffret doré : ' : 'Dans le coffret : ', av;
  /* le coffret est ouvert : son bonheur redescend (Romain : « dès qu'on a la surprise, hop, ça redescend »), et on recommence */
  chatsTous(V).forEach(function(o){ bonheur(o); o.bh = Math.min(o.bh, BH_APRES); });
  if(k === 'j' && JOUETS[id]){
    if(m.jouets.indexOf(id) < 0) m.jouets.push(id);
    if(m.neufs.indexOf(id) < 0) m.neufs.push(id);
    ic = JOUETS[id].ic; tx = dans + JOUETS[id].nom + ' ! ' + JOUETS[id].dit + ' Il l\'attend dans sa barre 🐾.';
    brillerMimi(V);
  } else if(k === 'a' && ACC[id]){
    var G = garde(V.etat);
    if(G.a.indexOf(id) < 0){ G.a.push(id); G.neuf.push(id); G.annonce.push(id); }
    ic = '🎀'; tx = dans + articleAcc(id) + ' ! ' + attendAcc(id) + ' dans sa garde-robe 🎀, dans sa barre 🐾.';
  } else if(k === 'n' && NOURS[id]){
    if(m.nour.indexOf(id) < 0) m.nour.push(id);
    ic = NOURS[id].ic; tx = dans + NOURS[id].nom.toLowerCase() + ' ! La prochaine fois que tu rempliras sa gamelle, tu pourras choisir.';
  } else if(k === 's' && SOINS[id]){
    if(m.soins.indexOf(id) < 0){ m.soins.push(id); m.neufs.push(id); }
    if(id === 'griffoir'){ av = V.etat.cartons.map(function(q){ return q.id; }); nouveauCarton(V.etat, ['griffoir'], 0); if(!V.salle) dessinerPiece(V, av); }
    ic = iconeSoin(id); tx = dans + SOINS[id].dit + ' !' + (id === 'griffoir' ? '' : id === 'friandises' ? ' Il l\'attend dans sa barre 🐾.' : ' Elle l\'attend dans sa barre 🐾.');
    brillerMimi(V);
  } else if(k === 'c' && BOUTIQUE_MIMI.coins.some(function(x){ return x.t === id; })){
    var X = BOUTIQUE_MIMI.coins.filter(function(x){ return x.t === id; })[0];
    if(t.recus.indexOf(code) < 0) t.recus.push(code);
    av = V.etat.cartons.map(function(q){ return q.id; }); nouveauCarton(V.etat, [id]); dessinerPiece(V, av);
    ic = X.ic; tx = dans + X.nom.toLowerCase() + ' ! Il arrive dans un carton, au coin de la pièce 📦.';
  } else if((k === 'p' && CHATS[+id]) || (k === 'y' && MP.YEUX[+id])){
    ic = k === 'p' ? '🎨' : '👀'; tx = dans + donnerPeau(V, code) + ' ! ' + (k === 'p' ? 'Il l\'attend' : 'Ils l\'attendent') + ' dans sa garde-robe 🎀, dans sa barre 🐾.';
    brillerMimi(V);
  } else {
    chatsTous(V).forEach(function(o){ bhPlus(o, 5); });
    ic = '🍬'; tx = 'Des friandises ! Elle en garde une pour toi… ah non, finalement, elle les mange toutes.';
  }
  /* c'était la dernière chose d'une de ses familles : le conteur le dit (et le parc à chat lui devra un morceau : tama.fam) */
  var faites = famillesMaj(V, false);
  if(faites.length){ tx += ' ' + faites.map(function(F){ return F.fin; }).join(' '); apres(V, 250, function(){ sonMimi(V, 'fanfare'); }); }
  if(el){ var r = V.root.getBoundingClientRect(), b = el.getBoundingClientRect(); for(var i = 0; i < (c.g ? 18 : 8); i++) particule(V, {clientX:b.left + b.width / 2, clientY:b.top + b.height * 0.3}, 'at-part-etoile', i % 2 ? '✦' : '✧', c.g ? 1500 : 1100); }
  toast(V, '<b>' + (c.g ? '👑 ' : '🎁 ') + ic + '</b> ' + esc(tx), c.g ? 9000 : 7000, tx);
  majBarre(V); changer(V);
}

/* ---------- La barre de Mimi (🐾, en bas de l'écran) : son bonheur, ses jouets, ses soins, sa boutique, sa garde-robe, son album ----------
   Pas un écran à part (Romain : « j'ai pas envie qu'il y ait d'écran exprès pour Mimi ») : une rangée de boutons par-dessus la pièce.
   Au-dessus du bouton 🐾 : sa jauge de bonheur, toujours sous les yeux (la seule jauge qu'on voit ; le tour du bouton la montre aussi). */
function majBarre(V, flash){
  var b = V.elMimi, c = chatsTous(V)[0];
  if(!b) return;
  var n = c ? bonheur(c) : 0, m = mimi(V), ja = b.querySelector('.at-mimi-jauge b');
  b.style.setProperty('--bh', n);
  b.classList.toggle('plein', !!c && bhPlein(c));
  if(ja && ja._n !== n){ ja._n = n; ja.style.transform = 'scaleX(' + (n / 100).toFixed(2) + ')'; }
  b.setAttribute('aria-label', 'Les affaires de Mimi. Son bonheur : ' + n + ' sur 100');
  var nb = m.neufs.length + garde(V.etat).neuf.length + (m.peauNeuve === 1 ? 1 : 0), badge = b.querySelector('.at-badge');
  if(badge){ badge.textContent = nb ? '✨' : ''; badge.style.display = nb ? '' : 'none'; }
  b.hidden = !c;
  /* l'appareil photo, et où en est l'album (« 3 sur 15 ») */
  if(V.elPhoto){ V.elPhoto.hidden = !c; var pn = V.elPhoto.querySelector('.at-photo-n'), tn = m.album.length + '/' + PHOTOS.length; if(pn && pn._t !== tn){ pn._t = tn; pn.textContent = tn; } V.elPhoto.setAttribute('aria-label', 'Prendre ' + (c ? nomChat(c) : PORTEE.mere) + ' en photo. Son album : ' + m.album.length + ' sur ' + PHOTOS.length); }
  if(V.barreMimi && !V.barreMimi.hidden) V.barreMimi.innerHTML = htmlBarre(V);
  if(flash){ b.classList.remove('at-flash-bt'); void b.offsetWidth; b.classList.add('at-flash-bt'); }
}
function htmlBarre(V){
  var c = chatsTous(V)[0], m = mimi(V), G = garde(V.etat), n = c ? bonheur(c) : 0, nom = c ? nomChat(c) : PORTEE.mere;
  var bt = function(at, ic, txt, neuf, x){ return '<button type="button" class="at-mb-bt' + (x || '') + '" data-mimi="' + at + '"><span class="at-mb-ic" aria-hidden="true">' + ic + '</span><small>' + esc(txt) + '</small>' + (neuf ? '<i class="at-mb-neuf" aria-label="nouveau">✨</i>' : '') + '</button>'; };
  var s = '<div class="at-mb-tete"><span class="at-mb-chat">' + (c ? '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(vChat(c.v), 57, 18, c.acc || {}) + '</svg>' : '') + '</span>' +
    '<span class="at-mb-jauge"><b>' + esc(nom) + '</b><i class="at-mb-barre' + (c && bhPlein(c) ? ' plein' : '') + '"><b style="width:' + n + '%"></b></i></span>' +
    /* (la jauge seule : ni cœurs ni envie ici — son envie se devine à ce qu'elle fait, puis sa bulle la dit) */
    '<button type="button" class="at-rond at-mb-x" data-mimi="x" aria-label="Fermer">✖</button></div><div class="at-mb-l">';
  s += '<span class="at-mb-g">Jouer</span>' + m.jouets.map(function(id){ return bt('j:' + id, JOUETS[id].ic, JOUETS[id].nom.replace(/^(la |le |l')/, '').replace(/^\w/, function(x){ return x.toUpperCase(); }), m.neufs.indexOf(id) >= 0, ' at-mb-jouet'); }).join('');
  var soins = m.soins.filter(function(id){ return id !== 'griffoir' && id !== 'photo'; });      /* (l'appareil photo a son bouton, à côté du 🐾) */
  if(soins.length) s += '<span class="at-mb-g">Soins</span>' + soins.map(function(id){ return bt('s:' + id, iconeSoin(id), SOINS[id].nom, m.neufs.indexOf(id) >= 0); }).join('');
  s += '<span class="at-mb-g">Ses affaires</span>' + bt('garde', '🎀', 'Habits', G.neuf.length > 0 || m.peauNeuve === 1) + bt('shop', '🛒', 'Boutique') + bt('album', '📒', 'Album') +
    /* (le mode d'essai du jeu — « #test » dans l'adresse : toutes ses affaires d'un coup, pour voir son parc sans jouer des heures) */
    (window.M && M.modeDev && M.modeDev() ? bt('essai', '🧪', 'Essai : tout') + bt('essai-gros', '🧪', 'Essai : gros plan') : '');
  return s + '</div>';
}
function ouvrirBarre(V){
  if(!V.barreMimi) return;
  if(!V.barreMimi.hidden){ fermerBarre(V); son(V, 'clic'); return; }
  V.barreMimi.innerHTML = htmlBarre(V);
  V.barreMimi.hidden = false;
  anim(V.barreMimi, [{transform:'translate(-50%,20px)', opacity:0}, {transform:'translate(-50%,0)', opacity:1}], {duration:260, easing:'cubic-bezier(.3,1.3,.5,1)'});
  try{ if(window.Brume && Brume.son) Brume.son('pastilles', 3); else son(V, 'clic'); }catch(e){}
}
function fermerBarre(V){ if(V.barreMimi) V.barreMimi.hidden = true; }
function actionBarre(V, a){
  if(V.mode !== 'ranger' || V.arrete) return;
  if(a === 'x'){ fermerBarre(V); son(V, 'clic'); return; }
  if(a.indexOf('j:') === 0){ jouer(V, a.slice(2)); return; }
  if(a === 's:brosse'){ fermerBarre(V); mimi(V).neufs = mimi(V).neufs.filter(function(x){ return x !== 'brosse'; }); prendreBrosse(V); majBarre(V); return; }
  if(a === 's:bain'){ fermerBarre(V); mimi(V).neufs = mimi(V).neufs.filter(function(x){ return x !== 'bain'; }); demarrerBain(V); majBarre(V); return; }
  if(a === 's:friandises'){ fermerBarre(V); mimi(V).neufs = mimi(V).neufs.filter(function(x){ return x !== 'friandises'; }); donnerFriandise(V); majBarre(V); return; }
  if(a === 'garde'){ fermerBarre(V); var c = chatsTous(V)[0]; if(c) ouvrirGarde(V, c.id); return; }
  if(a === 'shop'){ fermerBarre(V); ouvrirBoutique(V); return; }
  if(a === 'album'){ ouvrirAlbum(V); return; }
  if(a === 'essai'){ fermerBarre(V); toutDonner(V); return; }
  if(a === 'essai-gros'){ fermerBarre(V); if(!grosPlan(V, true)){ var tg = 'Pas maintenant : elle est occupée (ou elle dort).'; toast(V, '<b>🧪</b> ' + esc(tg), 3200, tg); } return; }
}

/* ---------- La boutique de Mimi : le confort, payé en pièces d'or (le moteur donne la bourse : opts.bourse) ---------- */
function bourse(V){ var b = V.o.bourse; try{ return b && typeof b.lire === 'function' ? b.lire() : null; }catch(e){ return null; } }
function ouvrirBoutique(V){ ouvrirCalque(V, 'at-cal-boutique', htmlBoutique(V)); son(V, 'page'); }
function htmlBoutique(V){
  var m = mimi(V), G = garde(V.etat), or = bourse(V), c = chatsTous(V)[0], nom = c ? nomChat(c) : PORTEE.mere;
  var t = 'La boutique de ' + nom + '. Ici, tout est pour elle : de bons petits plats, des coins douillets. Ses jouets et ses habits, eux, ne s\'achètent pas : c\'est elle qui les rapporte !';
  var art = function(ach, ic, nom2, prix, a, rare){
    return '<button type="button" class="at-ach' + (a ? ' a' : '') + (rare ? ' rare' : '') + '" data-achat="' + ach + '"' + (a ? ' disabled' : '') + '><span class="at-ach-ic" aria-hidden="true">' + ic + '</span><small>' + esc(nom2) + '</small><b>' + (a ? '✔ À elle' : '🪙 ' + prix) + '</b></button>';
  };
  var corps = '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p>' + (or === null ? '<p class="at-ach-ferme">La boutique n\'ouvre que pendant une enquête.</p>' : '<p class="at-ach-or">👛 ' + or + ' pièce' + (or > 1 ? 's' : '') + ' d\'or</p>');
  corps += '<div class="at-ach-g"><b>Ses petits plats</b><div class="at-ach-l">' + cles(NOURS).filter(function(k){ return NOURS[k].prix; }).map(function(k){ var N = NOURS[k]; return art('n:' + k, N.ic, N.nom.replace(/^(Des|De la|Du|Un) /, ''), N.prix, m.nour.indexOf(k) >= 0); }).join('') + '</div></div>';
  corps += '<div class="at-ach-g"><b>Ses coins douillets</b><div class="at-ach-l">' + BOUTIQUE_MIMI.coins.map(function(x){ return art('c:' + x.t, x.ic, x.nom, x.prix, false); }).join('') + '</div></div>';
  return feuille('at-f-boutique', '<span class="at-f-ic">🛒</span><h3>La boutique de ' + esc(nom) + '</h3>', corps);
}
function acheter(V, ach){
  var k = ach.charAt(0), id = ach.slice(2), m = mimi(V), G = garde(V.etat), prix = 0, nom = '';
  if(k === 'n' && NOURS[id] && m.nour.indexOf(id) < 0){ prix = NOURS[id].prix; nom = NOURS[id].nom.toLowerCase(); }
  else if(k === 'c'){ var x = BOUTIQUE_MIMI.coins.filter(function(y){ return y.t === id; })[0]; if(!x) return; prix = x.prix; nom = x.nom.toLowerCase(); }
  else return;
  var or = bourse(V);
  if(or === null){ var t0 = 'La boutique n\'ouvre que pendant une enquête.'; toast(V, '<b>🛒</b> ' + esc(t0), 3000, t0); return; }
  if(or < prix){ var t1 = 'Il te manque ' + (prix - or) + ' pièce' + (prix - or > 1 ? 's' : '') + ' d\'or. Les missions en rapportent !'; toast(V, '<b>👛</b> ' + esc(t1), 4000, t1); son(V, 'ko'); return; }
  var ok = false; try{ ok = V.o.bourse.payer(prix); }catch(e){ ok = false; }
  if(!ok) return;
  if(k === 'n') m.nour.push(id);
  else { var av = V.etat.cartons.map(function(c){ return c.id; }); nouveauCarton(V.etat, [id]); dessinerPiece(V, av); }
  sonMimi(V, 'ouvre');
  var c = chatsTous(V)[0], nm = c ? nomChat(c) : PORTEE.mere;
  var t = k === 'n' ? 'Et voilà : ' + nom + ' ! La prochaine fois que tu rempliras sa gamelle, tu pourras choisir.' : 'Et voilà : ' + nom + ' ! Il arrive dans un carton, au coin de la pièce 📦.';
  V.grim.innerHTML = htmlBoutique(V);
  toast(V, '<b>🛒 ✨</b> ' + esc(t), 5000, t);
  majBarre(V); changer(V);
  apres(V, 1200, function(){ famillesMaj(V, true); });      /* (un achat peut compléter une de ses familles) */
}

/* ==========================================================
   Le guidage (pour le tutoriel de l'enquête 1) : Atelier.guider(cible, options)
   - Un rond lumineux (un anneau doré qui pulse, avec « Nouveau ! ») autour de la chose à toucher ; la vue glisse jusqu'à elle.
   - Pendant le guidage, le reste de l'atelier est inactif : un toucher ailleurs ne fait rien d'autre que « Pas maintenant »
     (on peut toujours faire glisser la pièce pour regarder ; les panneaux ouverts, eux, marchent normalement).
   - Quand l'action guidée est faite : le guidage s'arrête, l'événement « atelier:guide-fait » part sur document
     (detail : {cible}) et options.fait(cible) est appelé.
   - Le guidage tient d'un remontage à l'autre de la vue (le moteur la remonte à chaque rendu), jusqu'à Atelier.guider(null).
   Cibles : 'cueillette' (les ingrédients posés devant la porte : les toucher ou les glisser),
     'rangement' (le meuble où ranger le premier ingrédient de la cueillette : fait quand un ingrédient y est rangé),
     'grimoire' (le livre sur le lutrin : fait quand il s'ouvre), 'chaudron' (fait quand le panneau du chaudron s'ouvre),
     'paillasse' (l'analyse : fait quand le panneau des analyses s'ouvre), 'carton' (un carton à ouvrir : fait au premier objet sorti),
     'potion' (le flacon prêt devant la porte : fait quand on le touche).
   ========================================================== */
var GUIDE = null;          /* {cible, fait} : le guidage en cours (il survit aux remontages de la vue) */
var VUES = [];             /* les vues montées (en pratique une seule) */
var GUIDE_CIBLES = {cueillette:1, rangement:1, grimoire:1, chaudron:1, paillasse:1, carton:1, potion:1};
function guider(cible, opts){
  opts = opts || {};
  if(!cible || !GUIDE_CIBLES[cible]){ GUIDE = null; VUES.forEach(function(V){ guideEnlever(V); }); return false; }
  GUIDE = {cible:cible, fait:typeof opts.fait === 'function' ? opts.fait : null, texte:opts.texte || ''};
  VUES.forEach(function(V){ guideAppliquer(V, true); });
  return true;
}
function guideEnCours(){ return GUIDE ? GUIDE.cible : null; }
/* Le meuble où ranger : celui qui convient à l'ingrédient tenu, ou au premier de la cueillette (verre pour les liquides), de préférence là où il y en a déjà */
function meubleGuide(V){
  /* (l'ingrédient qu'elle tient, sinon le premier de la cueillette) */
  var k = (V.sel && V.etat.panier[V.sel] > 0) ? V.sel : cles(V.etat.panier).filter(function(x){ return V.etat.panier[x] > 0; })[0], best = null, note = -1;
  ici(V, 0).forEach(function(o){
    var c = catDe(o);
    if(!c.cases || o.sur && !V.parId[o.sur.o]) return;
    var n = 0;
    if(k){
      if(!!c.verre !== estLiquide(k)) return;
      (o.cases || []).forEach(function(cs, j){ var cap = c.cases[j] ? c.cases[j].cap : 0, s = somme(cs.i); if(cs.i[k] > 0) n = Math.max(n, 3); else if(!s && cap > 0) n = Math.max(n, 2); else if(s < cap) n = Math.max(n, 1); });
    } else n = 1;
    if(n > note){ note = n; best = o; }
  });
  return best;
}
/* Le guidage 'carton', quand les cartons ont tout mis dans le 📦 (Romain, 15 h 10) et qu'aucun meuble de rangement n'est installé :
   d'abord le 📦 du coin, puis, son panneau ouvert, un meuble de rangement (tiroirs, placard…). Ils brillent eux-mêmes (at-guide-q) :
   le rond de la pièce glisse avec elle, eux sont fixes à l'écran. */
function reserveOuverte(V){ return !!(V.grim && !V.grim.hidden && V.grim.querySelector('.at-f-reserve')); }
function guideReserve(V){
  if(!GUIDE || GUIDE.cible !== 'carton' || aRangementSec(V.etat)) return null;
  var i = -1;
  V.etat.reserve.some(function(x, k){ var c = CAT[x.t]; if(c && c.cases && !c.verre){ i = k; return true; } return false; });
  if(i < 0) return null;
  if(reserveOuverte(V)) return V.grim.querySelector('[data-res="' + i + '"]');
  return V.elReserve || null;
}
/* Les éléments de la pièce que le guidage montre (et qui restent actifs) */
function guideElements(V){
  if(!GUIDE) return [];
  var c = GUIDE.cible, l = [];
  if(c === 'cueillette') l = (V.elTas || []).slice();
  else if(c === 'rangement'){ var m = meubleGuide(V); if(m && V.elO[m.id]) l = [V.elO[m.id]]; }
  else if(c === 'grimoire' || c === 'chaudron' || c === 'paillasse'){
    /* le meuble ; ses bulles ouvertes : le rond est sur la jaune (« Lire », « Préparer », « Analyser ») ;
       (le grimoire ouvert : le rond est sur ses « ? », pas sur le lutrin caché dessous) */
    var idm = c === 'grimoire' ? 'lu' : c === 'chaudron' ? 'ch' : 'pa', bg = V.bullesPa === idm && V.calque && V.calque.querySelector('.at-bulle-go');
    if(c === 'grimoire' && grimoireOuvert(V)) l = [];
    else if(bg) l = [bg];
    else if(V.elO[idm]) l = [V.elO[idm]];
  }
  else if(c === 'carton'){ var ks = cartonsIci(V); if(!guideReserve(V) && ks.length && V.elK[ks[0].id]) l = [V.elK[ks[0].id]]; }
  else if(c === 'potion') l = (V.elFl || []).slice();
  return l.filter(Boolean);
}
/* Ce qu'on a le droit de toucher dans la pièce pendant le guidage */
function guideAutorise(V, t){
  if(!GUIDE) return true;
  if(t.closest('.at-repere') || t.closest('.at-tient')) return true;
  var c = GUIDE.cible, els = guideElements(V);
  if(els.some(function(e){ return e.contains(t); })) return true;
  if(V.bullesPa && guideBulles(V) && V.elO[V.bullesPa] && V.elO[V.bullesPa].contains(t)) return true;   /* (retoucher le meuble referme ses bulles) */
  if(c === 'paillasse' && t.closest('.at-pa-signe')) return true;   /* (le signe « À analyser ! » ouvre les bulles de la paillasse) */
  if(c === 'rangement'){                   /* ranger : la cueillette (on la prend) et tous les rangements (on la pose) */
    if(t.closest('.at-tas')) return true;
    var ob = t.closest('.at-o'), o = ob && V.parId[ob.getAttribute('data-obj')];
    if(o && catDe(o).cases) return true;
  }
  if(c === 'cueillette' && t.closest('.at-tas')) return true;
  if(c === 'potion' && t.closest('[data-at=potions]')) return true;
  if(c === 'carton' && (t.closest('.at-carton') || t.closest('[data-at=reserve]'))) return true;
  return false;
}
function pasMaintenant(V){
  var t = 'Pas maintenant ! Touche ce qui brille.';
  toast(V, '<b>✨ 👆</b> ' + esc(t), 2600, t);
  son(V, 'clic');
  var g = V.calque && V.calque.querySelector('.at-guide');
  if(g){ g.classList.remove('at-guide-hop'); void g.offsetWidth; g.classList.add('at-guide-hop'); }
}
/* Le rond lumineux : placé dans la pièce (il glisse avec elle), autour de la chose (ou des choses) à toucher */
function guidePlacer(V){
  var g = V.calque && V.calque.querySelector('.at-guide');
  if(!GUIDE){ if(g) g.remove(); return null; }
  var els = guideElements(V);
  if(!els.length){ if(g) g.hidden = true; return null; }
  var mr = V.monde.getBoundingClientRect(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  els.forEach(function(e){ var r = e.getBoundingClientRect(); if(!r.width && !r.height) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); });
  if(x1 < x0){ if(g) g.hidden = true; return null; }
  /* (en unités du monde : le rond suit la pièce quand elle glisse) */
  var F = {x0:V.vb.x0 + (x0 - mr.left) / V.k, y0:V.vb.y0 + (y0 - mr.top) / V.k, x1:V.vb.x0 + (x1 - mr.left) / V.k, y1:V.vb.y0 + (y1 - mr.top) / V.k};
  var m = 18, w = F.x1 - F.x0 + 2 * m, h = F.y1 - F.y0 + 2 * m, mn = 96;
  if(w < mn){ F.x0 -= (mn - w) / 2; w = mn; } else F.x0 -= m;
  if(h < mn){ F.y0 -= (mn - h) / 2; h = mn; } else F.y0 -= m;
  if(!g){
    g = document.createElement('div');
    g.className = 'at-guide';
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML = '<i class="at-guide-anneau"></i><b class="at-guide-nouveau">✨ Nouveau !</b>';
    V.calque.appendChild(g);
  }
  g.hidden = false;
  g.setAttribute('data-cible', GUIDE.cible);
  g.style.left = pX(V, F.x0); g.style.top = pY(V, F.y0); g.style.width = pW(V, w); g.style.height = pH(V, h);
  return {x:F.x0 + w / 2, y:F.y0 + h, w:w, h:h};
}
function guideAppliquer(V, montrer){
  if(V.arrete || !GUIDE) return;
  /* (tout ce qu'on guide est dans l'atelier ; un carton peut attendre dans la chambre) */
  var c = GUIDE.cible, s = 0;
  var kd = function(n){ return V.etat.cartons.filter(function(k){ return (k.ch ? 1 : 0) === n; }).length; };
  if(c === 'carton' && !guideReserve(V) && !kd(0) && kd(1)) s = 1;
  if(V.salle !== s && V.mode === 'ranger') changerSalle(V, s);
  V.root.classList.add('at-guidage');
  var F = guidePlacer(V);
  if(F && montrer) allerVers(V, F.x, F.y - F.h / 2);
  guideRafraichir(V);
}
function guideEnlever(V){
  if(!V.root) return;
  V.root.classList.remove('at-guidage');
  var g = V.calque && V.calque.querySelector('.at-guide');
  if(g) g.remove();
  guideRafraichir(V);
}
/* Dans le grimoire ouvert, pendant le guidage 'grimoire' : le rond lumineux est sur le prochain « ? » à toucher (un par un) ;
   le menu des ingrédients ouvert, il n'y a pas de rond (elle choisit ce que le Sage lui dit) */
function grimoireOuvert(V){ return !!(V.grim && !V.grim.hidden && V.grim.querySelector('.at-grimoire')); }
function guideRafraichir(V){
  if(!V.grim) return;
  if(GUIDE && GUIDE.cible === 'grimoire' && V.calque) guidePlacer(V);
  [].forEach.call((V.root || V.grim).querySelectorAll('.at-guide-q'), function(x){ x.classList.remove('at-guide-q'); });
  var gr = guideReserve(V);
  if(gr){ gr.classList.add('at-guide-q'); if(V.calque) guidePlacer(V); return; }
  if(!GUIDE || GUIDE.cible !== 'grimoire' || V.grim.querySelector('.at-dicte')) return;
  var ad = aDicter(V), b = ad && V.grim.querySelector('[data-dicter="' + ad.id + '"].a-toi');
  if(b) b.classList.add('at-guide-q');
}
/* L'action guidée est faite : on arrête, et on prévient le moteur */
function guideFait(V, cible){
  if(!GUIDE || GUIDE.cible !== cible) return;
  var fait = GUIDE.fait;
  GUIDE = null;
  VUES.forEach(function(W){ guideEnlever(W); });
  try{ document.dispatchEvent(new CustomEvent('atelier:guide-fait', {detail:{cible:cible}})); }catch(e){}
  try{ if(fait) fait(cible); }catch(e){ console.error(e); }
}
/* (les actions guidées : chacune prévient le guidage quand elle a eu lieu) */
(function(){
  function apresFait(nom, cible, f){ return function(V){ var r = f.apply(this, arguments); try{ guideFait(V, cible); }catch(e){} return r; }; }
  /* le grimoire : fait quand il s'ouvre, sauf s'il reste une recette secrète à faire dicter (alors : quand elle est complète) */
  var ol = ouvrirLivre;
  ouvrirLivre = function(V){ var r = ol.apply(this, arguments); try{ if(!aDicter(V)) guideFait(V, 'grimoire'); else guideRafraichir(V); }catch(e){} return r; };
  ouvrirChaudron = apresFait('ouvrirChaudron', 'chaudron', ouvrirChaudron);
  ouvrirAnalyses = apresFait('ouvrirAnalyses', 'paillasse', ouvrirAnalyses);
  ouvrirPotions = apresFait('ouvrirPotions', 'potion', ouvrirPotions);
  ouvrirArrivage = apresFait('ouvrirArrivage', 'cueillette', ouvrirArrivage);
  var rd = rangerDans;      /* (ranger : fait seulement quand un ingrédient est vraiment rangé) */
  rangerDans = function(V){ var r = rd.apply(this, arguments); if(r > 0) try{ guideFait(V, 'rangement'); }catch(e){} return r; };
  var oc = ouvrirCarton;
  ouvrirCarton = function(V){ var n = V.etat.objets.length + V.etat.reserve.length, r = oc.apply(this, arguments); if(V.etat.objets.length + V.etat.reserve.length > n) guideFait(V, 'carton'); else guideRafraichir(V); return r; };
  /* le 📦 : l'ouvrir ne finit rien (le rond passe sur le meuble à installer) ; en sortir un objet, si */
  var orv = ouvrirReserve;
  ouvrirReserve = function(V){ var r = orv.apply(this, arguments); try{ guideRafraichir(V); }catch(e){} return r; };
  var fg = fermerGrimoire;   /* (le 📦 refermé sans rien choisir : il rebrille) */
  fermerGrimoire = function(V){ var r = fg.apply(this, arguments); try{ if(GUIDE && GUIDE.cible === 'carton') guideRafraichir(V); }catch(e){} return r; };
  var sr = sortirReserve;
  sortirReserve = function(V){ var n = V.etat.objets.length, r = sr.apply(this, arguments); if(V.etat.objets.length > n) try{ guideFait(V, 'carton'); }catch(e){} return r; };
  var mt = majTient;        /* (elle prend un autre ingrédient : le rond va sur un meuble qui lui convient) */
  majTient = function(V){ var r = mt.apply(this, arguments); if(GUIDE && GUIDE.cible === 'rangement') try{ guidePlacer(V); }catch(e){} return r; };
  var gt = glisserTas;
  glisserTas = function(V){ var r = gt.apply(this, arguments); try{ guideFait(V, 'cueillette'); }catch(e){} return r; };
})();

/* ==========================================================
   Préparer une potion : le mini-jeu « Le chaudron » (mj-chaudron.js)
   s'ouvre par-dessus l'atelier. Les ingrédients viennent des
   rangements (pas du panier) et sont retirés au moment où on les verse.
   ========================================================== */
/* Retire un ingrédient des rangements seulement (le panier n'est pas utilisable au chaudron) */
function retirerRange(V, ingr){
  for(var i = 0; i < V.etat.objets.length; i++){
    var o = V.etat.objets[i];
    for(var j = 0; j < (o.cases || []).length; j++){
      var c = o.cases[j];
      if((c.i[ingr] || 0) > 0){ c.i[ingr]--; if(!c.i[ingr]) delete c.i[ingr]; V.derniereCase = c; return o; }
    }
  }
  return null;
}
/* Enquête 1 (le tutoriel, opts.tutoriel) : une préparation ratée ne coûte pas les ingrédients versés,
   ils reviennent dans leur rangement (on peut recommencer autant qu'on veut) */
function rendreVerses(V){
  var l = V.verses || []; V.verses = [];
  l.forEach(function(x){ if(x.c && x.c.i){ x.c.i[x.ingr] = (x.c.i[x.ingr] || 0) + 1; try{ redessiner(V, x.o); }catch(e){} } });
  var note = !!V.etat.verses; delete V.etat.verses;
  if(l.length || note) changer(V);
}
/* (Romain, 14 novembre, 16 h 56 : « quand on quitte le chaudron, il ne faut pas que les ingrédients soient dépensés ») Ce qui est versé
   pendant une préparation est aussi noté dans l'état sauvegardé (etat.verses : le meuble, la case, l'ingrédient). Si l'appli se ferme,
   plante ou se recharge pendant la préparation, ces ingrédients reviennent dans leur rangement à la prochaine ouverture de l'atelier
   (rendreQuittes, dans vue) : une préparation pas finie ne coûte rien. */
function noterVerses(V){
  V.etat.verses = (V.verses || []).map(function(x){ return {o:x.o ? x.o.id : null, c:x.o ? (x.o.cases || []).indexOf(x.c) : -1, i:x.ingr}; });
}
function rendreQuittes(V){
  var l = V.etat.verses; if(!l) return false;
  /* (un autre atelier ouvert en train de préparer, en pause : ce sont ses ingrédients, il les rendra lui-même) */
  if(VUES.some(function(W){ return W !== V && !W.arrete && W.mjPartie && W.etat === V.etat; })) return false;
  delete V.etat.verses;
  if(!Array.isArray(l)) return true;
  l.forEach(function(x){
    if(!x || !x.i) return;
    var o = V.etat.objets.filter(function(b){ return b.id === x.o; })[0], c = o && o.cases ? o.cases[x.c] : null;
    if(c && c.i){ c.i[x.i] = (c.i[x.i] || 0) + 1; return; }
    V.etat.panier[x.i] = (V.etat.panier[x.i] || 0) + 1; V.etat.nouveaux = (V.etat.nouveaux || 0) + 1;   /* (le meuble n'est plus là : devant la porte) */
  });
  return true;
}
function besoinDe(id){
  var R = (DD().RECETTES || {})[id], b = {};
  if(R) R.ingr.forEach(function(x){ b[x[0]] = (b[x[0]] || 0) + x[1]; });
  return b;
}
function manque(V, id){
  var b = besoinDe(id), s = stockRange(V);
  return cles(b).filter(function(k){ return (s[k] || 0) < b[k]; });
}

function demarrer(V, rid, bouton){
  if(V.mjPartie || V.mode !== 'ranger') return;
  var r = rec(V, rid), MJ = window.MJ;
  if(!r || !MJ || !MJ.TYPES || !MJ.TYPES.chaudron){ toast(V, '<b>🚫</b> Le chaudron n\'est pas prêt.'); return; }
  var er = etatRecette(V, rid);
  if(!er.pret){
    son(V, 'ko');
    if(er.auPanier){
      /* encore par terre devant la porte : il faut d'abord les ranger */
      fermerGrimoire(V);
      var t = 'Ces ingrédients sont encore par terre, devant la porte : range-les d\'abord dans les tiroirs et les bocaux !';
      toast(V, '<b>🌿 ➡️ 🗄️</b> ' + esc(t), 4600, t);
      var ct = cadreTas(V);
      allerVers(V, ct.x, ct.y - ct.h / 2);
      (V.elTas || []).forEach(function(e){ briller(V, e, 5000); });
      return;
    }
    if(bouton) anim(bouton, [{transform:'translateX(0)'}, {transform:'translateX(-8px)'}, {transform:'translateX(8px)'}, {transform:'translateX(0)'}], {duration:320});
    toast(V, '<b>🗺️ 🌿</b> Il te manque des ingrédients : va cueillir !', 2800);
    return;
  }
  var ok = true, pourquoi = null;
  /* peutPreparer(rid) : false, ou un texte qui dit pourquoi (une seule potion de vérité par enquête : moteur-actions.js) */
  try{ if(V.o.peutPreparer){ var rp = V.o.peutPreparer(rid); if(typeof rp === 'string'){ ok = false; pourquoi = rp; } else ok = rp !== false; } }catch(e){ ok = false; }
  if(!ok){
    son(V, 'ko'); vibrer(60);
    if(bouton) anim(bouton, [{transform:'translateX(0)'}, {transform:'translateX(-8px)'}, {transform:'translateX(8px)'}, {transform:'translateX(0)'}], {duration:320});
    toast(V, pourquoi ? '<b>🚫 🧪</b> ' + esc(pourquoi) : V.o.sansActions ? '<b>🚫 🧪</b> Plus de fiole vide !' : '<b>🚫 ⏳ 🧪</b> Plus d\'action ou plus de fiole vide !', pourquoi ? 4200 : 2800, pourquoi || undefined);
    return;
  }
  fermerGrimoire(V); fermerOuvert(V);
  V.sel = null; majTient(V);
  V.mode = 'prep';
  V.root.classList.add('at-mode-prep');
  majIndiceCarton(V);
  var mods = {}, aides = (V.o.aides || []).slice();
  cles(V.o.mods).forEach(function(k){ mods[k] = V.o.mods[k]; });
  if(aObjet(V, 'thermometre') && !mods.revele){ mods.revele = true; aides.push({ic:'🌡️', nom:'Thermomètre de cuivre'}); }
  var p = MJ.reglages('chaudron', V.o.niveau || 1, mods);
  p.potion = rid;
  p.connue = r.connue !== false || dicteeFinie(V, rid);   /* la recette secrète que le Sage a dictée (grimoire) : connue */
  p.stock = function(){ return stockRange(V); };
  var ov = document.createElement('div');
  /* (23 novembre) le chaudron prend tout l'écran, comme le labo (at-mj-plein : mj-chaudron.css) ; en pause, il retourne dans l'atelier */
  ov.className = 'at-mj at-mj-plein';
  ov.innerHTML = '<div class="at-mj-cadre"></div>';
  V.root.appendChild(ov);
  /* (étape 4) le chat, dans un coin : il dresse les oreilles quand on verse le bon ingrédient (le mini-jeu n'appelle onVerse que pour le bon) */
  var oreilles = chatPotion(V, ov);
  V.verses = [];
  p.onVerse = function(ingr){ V.derniereCase = null; var o = retirerRange(V, ingr); if(o){ V.verses.push({o:o, c:V.derniereCase, ingr:ingr}); noterVerses(V); redessiner(V, o); } changer(V); if(oreilles) oreilles(); };
  V.mjEl = ov;
  V.attente = {id:rid, reussi:false, detail:'Préparation abandonnée.'};
  /* enquête 1 : chaque essai raté rend les ingrédients versés, et « 🔁 Recommencer » sans fin */
  var partie = MJ.lancer(ov.firstChild, 'chaudron', p, function(res){ finPreparation(V, rid, res); },
    {aides:aides, titre:(r.ic || '🧪') + ' ' + r.nom, lireAuto:false, deuxiemeChance:!!mods.deuxiemeChance,
     reessaisInfinis:!!V.o.tutoriel, tutoriel:!!V.o.tutoriel, surEchec:V.o.tutoriel ? function(){ rendreVerses(V); } : null,
     /* ⏸️ la pause (mj-core.js, Romain, 5 novembre) : le moteur garde l'atelier tel quel pendant qu'on va ailleurs */
     surPause:V.o.surPause ? function(pt){ V.o.surPause(pt, r); } : null});
  V.mjPartie = partie;
  /* un drapeau pour abandonner (deux touchers), dans l'en-tête du mini-jeu */
  var tete = ov.querySelector('.mj-tete'), lireBtn = ov.querySelector('.mj-btn-lire');
  if(tete){
    var ab = document.createElement('button');
    ab.type = 'button'; ab.className = 'at-mj-abandon'; ab.setAttribute('aria-label', 'Abandonner'); ab.textContent = '🏳️';
    ab.onclick = function(){
      if(ab.classList.contains('arme')){ partie.arreter(); finPreparation(V, rid, {reussi:false, detail:'Préparation abandonnée.', raison:'abandon'}); return; }
      ab.classList.add('arme'); ab.textContent = '🏳️?';
      toast(V, '<b>🏳️ ?</b> Touche encore pour abandonner', 2400);
      apres(V, 2600, function(){ ab.classList.remove('arme'); ab.textContent = '🏳️'; });
    };
    tete.insertBefore(ab, lireBtn);
  }
  anim(ov, [{opacity:0, transform:'scale(.96)'}, {opacity:1, transform:'none'}], {duration:260, easing:'ease-out'});
  son(V, 'magie');
}

function finPreparation(V, rid, res){
  if(!V.mjPartie) return;
  res = res || {};
  V.mjPartie = null;
  V.attente = null;
  if(V.mjEl){ V.mjEl.remove(); V.mjEl = null; }
  /* au tutoriel, un essai raté ou abandonné rend les ingrédients ; dans toutes les enquêtes, quitter le chaudron (🏳️) ne coûte rien
     (Romain, 14 novembre) ; une potion ratée pour de vrai, elle, a bien brûlé ses ingrédients (dès l'enquête 2) */
  if(!res.reussi && (V.o.tutoriel || res.raison === 'abandon')) rendreVerses(V);
  V.verses = [];
  if(V.etat.verses){ delete V.etat.verses; changer(V); }
  if(res.raison === 'boum' || res.raison === 'trop' || res.raison === 'tard'){ V.etat.flaque = 1; changer(V); }
  try{ if(V.o.potionFinie) V.o.potionFinie(rid, !!res.reussi, res.detail || res.message || ''); }catch(e){ console.error(e); }
  if(V.arrete) return;
  V.mode = 'ranger';
  V.root.classList.remove('at-mode-prep');
  fermerOuvert(V);
  mise(V);
  dessinerPiece(V);
  var nv = potionsNeuves(V);
  if(nv.length) brillerFlacons(V, nv);
  /* (étape 4) le chaudron est un mini-jeu de l'Alchimiste : la première réussite donne un accessoire au chat */
  if(res.reussi && gagnerAcc(V.etat, 'chaudron')){ changer(V); annoncerAcc(V); }
  /* (17 novembre) une potion finie au chaudron, c'est du travail d'Alchimiste : un habit de la malle de Mimi */
  if(res.reussi) apres(V, 2600, function(){ travauxMaj(V, ['ch:' + enqueteNo(V) + ':' + rid + ':' + Date.now()]); });
  /* un petit effet sur le chaudron de la pièce */
  if(V.elO.ch){
    V.elO.ch.classList.add(res.reussi ? 'at-chp-ok' : 'at-chp-rate');
    var p = (DD().POTIONS || {})[rid] || {};
    if(res.reussi) V.elO.ch.style.setProperty('--liq', p.c || '#8ff3ff');
    apres(V, 2600, function(){ if(V.elO.ch){ V.elO.ch.classList.remove('at-chp-ok', 'at-chp-rate'); V.elO.ch.style.removeProperty('--liq'); } });
  }
}

/* ==========================================================
   Export
   ========================================================== */
window.Atelier = {
  etatNeuf:etatNeuf,
  ajouter:ajouter,
  compter:compter,
  retirer:retirer,
  donnerCartons:donnerCartons,
  normaliser:normaliser,
  reglages:reglages,
  vue:vue,
  OBJETS:CAT,
  ETIQUETTES:ETQ_EXTRA,
  LIQUIDES:LIQUIDES,
  THEMES:THEMES,
  aRangementSec:aRangementSec,
  rangeEnCours:function(){ return VUES.some(function(V){ return !V.arrete && (V.rangeFin || 0) > Date.now(); }); },
  attenteDit:function(){ var V = VUES.filter(function(W){ return !W.arrete && (W.rangeFin || 0) > Date.now(); })[0]; return V ? V.attenteDit || 'regarde' : null; },
  /* le chat (étape 3) : Mimi vit chez Odette après la naissance du chaton (à partir de l'enquête 4) ; la réplique d'Odette, pour le village */
  chezOdette:chezOdette,
  /* le guidage du tutoriel (voir en tête du fichier) */
  guider:guider,
  guidage:guideEnCours,
  /* étape 4 : le moteur l'appelle quand l'Alchimiste réussit un de ses mini-jeux (la première fois pour chacun : un accessoire pour le chat) */
  mjGagne:mjGagne,
  ACCESSOIRES:ACC,
  repliqueOdette:repliqueOdette,
  PORTEE:PORTEE,
  BESOINS_CHAT:BESOINS.map(function(b){ return b.k; }),
  /* Mimi en image, hors de la pièce (l'album photo, les robots) : un <svg> ; pose : 'assis', 'dort', 'marche', 'dos', 'pain'… ; x : des classes .at-x-… */
  imageChat:function(v, pose, x, acc){
    return '<div class="at-o at-t-chat at-plat at-c-' + (pose || 'assis') + (x ? ' ' + x : '') + '"><svg viewBox="0 0 ' + MP.W + ' ' + MP.H + '" overflow="visible" aria-hidden="true">' + MP.image(vChat(v), pose || 'assis', x || '', accPantin(acc)) + '</svg></div>';
  },
  defsHTML:function(){ return svgDefs(); },
  /* (les robots) la vue montée en ce moment, avec ses points d'accès d'essai (_mimi, _cadeau…) */
  _vue:function(){ var l = VUES.filter(function(V){ return !V.arrete; }); return l.length ? l[l.length - 1].api || null : null; },
  /* la fin du message « Potion réussie : … » du moteur : où est la potion (son flacon, devant la porte) */
  OU_POTIONS:' ! Son flacon est posé par terre, devant la porte.'
};
})();
