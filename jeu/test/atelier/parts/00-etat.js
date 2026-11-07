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
     opts.potions {id:n}, opts.fioles, opts.vendre (bool), opts.actions (actions restantes),
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
var CARTON_CHAT = ['panier', 'gamelle', 'eau', 'distributeur'];
/* Un carton qui contient un meuble de la chambre est posé dans la chambre */
function cartonChambre(l){ return l.some(function(t){ return !!(CAT[t] && CAT[t].chambre); }); }
function nouveauCarton(e, l, ch){ e.n++; var k = {id:'k' + e.n, t:'carton', reste:l.slice(), ouvert:0}; if(ch === undefined ? cartonChambre(l) : ch) k.ch = 1; e.cartons.push(k); return k; }
/* Ce qui n'existe plus : le pot de peinture (« une mauvaise idée », dit Romain) ; il disparaît des sauvegardes et des cartons */
var RETIRES = {pot_peinture:1};
/* Les anciens rangements (caisse, sac, tonneau : « moches », dit Romain) deviennent de beaux meubles, avec leur contenu */
var ANCIENS = {caisse:'placard', sac:'placard', tonneau:'apothicaire'};
/* Les meubles spéciaux : un seul de chaque, toujours dans la pièce (on peut les déplacer) */
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
  if(t.sortie !== undefined && typeof t.sortie !== 'string') delete t.sortie;
  if(t.souris !== undefined && typeof t.souris !== 'number') delete t.souris;
  if(t.butin && !(typeof t.butin === 'object' && typeof t.butin.ingr === 'string')) t.butin = null;
  if(t.butin === undefined) t.butin = null;
  var meres = 0;
  e.objets.forEach(function(o){
    if(o.t !== 'chat') return;
    if(!o.b || typeof o.b !== 'object') o.b = {};
    ['faim', 'soif', 'amour', 'jeu', 'dodo'].forEach(function(k){ if(typeof o.b[k] !== 'number' || !(o.b[k] >= 0)) o.b[k] = 80; o.b[k] = Math.max(0, Math.min(100, Math.round(o.b[k]))); });
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
