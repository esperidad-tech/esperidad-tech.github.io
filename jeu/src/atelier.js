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
def('chaudron', {w:260, h:214, p:230, z:'sol', special:'chaudron', cls:'at-chp', nom:'Grand chaudron', ic:'🍲', surf:null,
  d:function(c){
    var cuivre = DESSIN.cuivre, cz = 116, s = '<g class="at-ch-p" data-at="chaudron">';
    /* le feu dessous, les trois pieds */
    s += c.tube([70, 204, cz + 26], [190, 204, cz - 26], 8, G('boisS'), null, G('boisH')) + c.tube([70, 204, cz - 26], [190, 204, cz + 26], 8, G('bois'), G('boisH'), G('boisH'));
    s += c.sur('<g class="at-feu-p">' + flammesSVG(130, 204, 0) + '</g>', cz);
    s += c.ligne([[90, 170, cz + 80], [80, 212, cz + 96]], K, 10) + c.ligne([[170, 170, cz + 80], [180, 212, cz + 96]], K, 10);
    var corps = [];
    [[94, 110], [112, 116], [140, 112], [168, 96], [188, 70], [198, 40]].forEach(function(q){ corps = corps.concat(c.cercle(130, cz, q[1], q[0], 32)); });
    s += P(lisse(enveloppe(corps), true, 0.5), G(cuivre ? 'cuivre' : 'metal')) + c.sur(reflet('M46,112 C48,140 66,166 90,178', 6), 8);
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

/* La paillasse d'analyse : un grand plan de travail avec les outils de l'alchimiste (fioles, mortier, balance, pince, loupe)
   et, au milieu, les objets reçus (ceux qui attendent brillent). Cinq styles de table (🎨 dans le panneau d'analyse). */
def('paillasse', {w:480, h:212, p:130, z:'sol', special:'analyses', profil:true, nf:5, nom:'Paillasse d\'analyse', ic:'🔬', surf:[{x0:-226, x1:-150, y:-122, z:64}],
  d:function(c){
    var f = c.fo, s = '<g class="at-pupitre-p" data-at="analyses">', P2 = c.p;
    /* la table */
    if(f === 0){        /* établi de bois à tiroirs */
      s += pieds(c, 24, 456, 140, 212, 8, P2 - 8, 20) + c.boite(30, 184, 450, 194, 16, P2 - 16, UNI(G('boisH'))) + c.boite(14, 110, 466, 144, 4, P2 - 4, BOIS());
      var tir = '';
      for(var i = 0; i < 3; i++) tir += R(34 + i * 146, 116, 120, 22, 4, G('boisC'), ' stroke-width="3.5"') + Cir(94 + i * 146, 127, 4, G('or'));
      s += c.sur(tir, 4) + c.boite(4, 90, 476, 112, 0, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    } else if(f === 1){ /* comptoir de pierre sur un meuble */
      s += c.boite(18, 110, 462, 210, 4, P2 - 4, BOIS()) + c.sur(R(34, 122, 196, 76, 6, G('boisC'), ' stroke-width="3.5"') + R(250, 122, 196, 76, 6, G('boisC'), ' stroke-width="3.5"') + Cir(220, 160, 5, G('or')) + Cir(260, 160, 5, G('or')), 4) +
        c.boite(2, 88, 478, 112, -4, P2, UNI(G('pierre'))) + c.sur(reflet('M14,96 H466', 3), -4);
    } else if(f === 2){ /* marbre et pieds dorés */
      [10, P2 - 12].forEach(function(z){ [40, 160, 320, 440].forEach(function(x, j){ s += c.ligne([[x, 110, z], [x + (j < 2 ? -6 : 6), 160, z], [x, 210, z]], K, 11) + c.ligne([[x, 110, z], [x + (j < 2 ? -6 : 6), 160, z], [x, 210, z]], '#f5b945', 5); }); });
      s += c.boite(16, 104, 464, 114, 6, P2 - 6, UNI(G('or'))) + c.boite(4, 88, 476, 106, 0, P2, UNI('#efeaf6', '#f7f4fb', '#d6d0e8')) + c.sur(T('M60,94 C120,102 160,90 230,98 M300,92 C350,100 400,92 450,98', '#c9c2dc', 2.5), 0);
    } else if(f === 3){ /* meuble à petits tiroirs */
      s += c.boite(12, 108, 468, 210, 4, P2 - 4, BOIS());
      var t3 = '';
      for(var j = 0; j < 8; j++){ var x3 = 22 + (j % 4) * 110, y3 = 116 + Math.floor(j / 4) * 44; t3 += R(x3, y3, 102, 38, 5, G('boisC'), ' stroke-width="3.5"') + Cir(x3 + 51, y3 + 19, 4, G('or')); }
      s += c.sur(t3, 4) + c.boite(4, 90, 476, 110, 0, P2, UNI(G('boisH'), G('boisH'), G('boisS')));
    } else {            /* tréteaux */
      [12, P2 - 12].forEach(function(z){ s += c.ligne([[40, 112, z], [112, 210, z]], K, 12) + c.ligne([[112, 112, z], [40, 210, z]], K, 12) + c.ligne([[368, 112, z], [440, 210, z]], K, 12) + c.ligne([[440, 112, z], [368, 210, z]], K, 12) +
        c.ligne([[40, 112, z], [112, 210, z]], '#b06f3e', 6) + c.ligne([[112, 112, z], [40, 210, z]], '#b06f3e', 6) + c.ligne([[368, 112, z], [440, 210, z]], '#b06f3e', 6) + c.ligne([[440, 112, z], [368, 210, z]], '#b06f3e', 6); });
      s += c.boite(76, 156, 404, 164, P2 / 2 - 4, P2 / 2 + 4, UNI('#d29a5e')) + c.boite(4, 92, 476, 112, 0, P2, BOIS());
    }
    /* les outils, posés sur le plateau (au milieu de sa profondeur) */
    var outils = R(102, 56, 98, 10, 3, G('boisH'), ' stroke-width="3.5"') + fiolePetite(120, 92, '#7cf09a') + fiolePetite(151, 92, '#ff8fb3') + fiolePetite(182, 92, '#8ff3ff') +
      T('M226,70 L250,40', K, 10) + T('M226,70 L250,40', '#d6d0ee', 5) + P('M204,66 L256,66 C254,86 244,94 230,94 C216,94 206,86 204,66 Z', G('pierre')) + Ell(230, 66, 26, 6, '#4a4668');
    /* les objets reçus (au plus 3 dessinés) : ceux qui attendent brillent */
    (DESSIN.analyses || []).slice(0, 3).forEach(function(o, k){
      var x = 288 + k * 48;
      outils += (o.fait ? '' : '<circle class="at-halo at-a-analyser" cx="' + x + '" cy="66" r="26" fill="' + G('halo') + '"/>') +
        Ell(x, 88, 20, 6, o.fait ? '#cbbf9c' : '#fff6d8', ' stroke-width="3"') + emo(x, 66, 30, o.ic || '❔') + (o.fait ? emo(x + 15, 52, 14, '✅') : '');
    });
    /* la balance, la pince, la loupe sur son pied */
    outils += R(410, 50, 6, 38, 2, G('or'), ' stroke-width="3"') + T('M392,52 L434,52', K, 6) + T('M392,52 L434,52', '#f5b945', 3) +
      P('M384,70 Q392,78 400,70 Z', G('or'), ' stroke-width="3"') + P('M426,70 Q434,78 442,70 Z', G('or'), ' stroke-width="3"') + T('M392,52 L386,70 M392,52 L398,70 M434,52 L428,70 M434,52 L440,70', '#b8862e', 1.5) +
      T('M446,88 L466,58 M452,88 L462,58', K, 5) + T('M446,88 L466,58 M452,88 L462,58', '#a8a2c8', 2) +
      T('M468,86 L468,20', K, 9) + T('M468,86 L468,20', '#b8862e', 4) + Ell(468, 88, 14, 4, G('or'), ' stroke-width="3"') +
      Cir(444, 4, 24, G('or')) + Cir(444, 4, 17, 'rgba(191,243,255,.55)', ' stroke-width="3"') + T('M432,-4 C436,-10 444,-12 450,-10', '#fff', 3, ' opacity=".8"') + T('M468,20 L460,22', K, 6);
    s += c.sur(outils, P2 / 2);
    return [N(s + '</g>')];
  }});

var CHATS = [['#f2a65a', '#d9783c', '#ffe0bf'], ['#b9b3d2', '#7d7799', '#eceaf6'], ['#4a4060', '#2c2440', '#f3f0ff']];
function teteChat(p, cx, cy, acc){
  acc = acc || {};
  return '<g class="at-c-tete">' + '<g class="at-c-oreilles">' +
    P('M' + (cx - 16) + ',' + (cy - 6) + ' L' + (cx - 18) + ',' + (cy - 24) + ' L' + (cx - 4) + ',' + (cy - 14) + ' Z', p[0], ' stroke-width="4"') +
    P('M' + (cx + 4) + ',' + (cy - 14) + ' L' + (cx + 18) + ',' + (cy - 24) + ' L' + (cx + 16) + ',' + (cy - 6) + ' Z', p[0], ' stroke-width="4"') +
    sansTrait(P('M' + (cx - 14) + ',' + (cy - 9) + ' L' + (cx - 15) + ',' + (cy - 19) + ' L' + (cx - 7) + ',' + (cy - 13) + ' Z', '#ff9db4')) +
    sansTrait(P('M' + (cx + 7) + ',' + (cy - 13) + ' L' + (cx + 15) + ',' + (cy - 19) + ' L' + (cx + 14) + ',' + (cy - 9) + ' Z', '#ff9db4')) + '</g>' +
    (acc.cou && ACC[acc.cou] ? dessinAcc(acc.cou, cx, cy) : '') +
    Ell(cx, cy, 19, 16, p[0]) +
    sansTrait(P('M' + (cx - 8) + ',' + (cy + 6) + ' C' + (cx - 4) + ',' + (cy + 2) + ' ' + (cx + 4) + ',' + (cy + 2) + ' ' + (cx + 8) + ',' + (cy + 6) + ' C' + (cx + 4) + ',' + (cy + 12) + ' ' + (cx - 4) + ',' + (cy + 12) + ' ' + (cx - 8) + ',' + (cy + 6) + ' Z', p[2]) + T('M' + (cx - 8) + ',' + (cy + 6) + ' C' + (cx - 4) + ',' + (cy + 12) + ' ' + (cx + 4) + ',' + (cy + 12) + ' ' + (cx + 8) + ',' + (cy + 6), sombre(p[2], 0.25), 1.5)) +
    '<g class="at-c-yeux">' + Ell(cx - 7, cy - 1, 3.4, 4.4, K, ' stroke-width="1"') + Ell(cx + 7, cy - 1, 3.4, 4.4, K, ' stroke-width="1"') +
      '<circle cx="' + (cx - 6) + '" cy="' + (cy - 2.6) + '" r="1.3" fill="#fff"/><circle cx="' + (cx + 8) + '" cy="' + (cy - 2.6) + '" r="1.3" fill="#fff"/></g>' +
    '<g class="at-c-ferme">' + T('M' + (cx - 10) + ',' + (cy - 1) + ' q3,3 6,0 M' + (cx + 4) + ',' + (cy - 1) + ' q3,3 6,0', K, 2.2) + '</g>' +
    P('M' + (cx - 2.5) + ',' + (cy + 4) + ' l2.5,2.5 l2.5,-2.5 Z', '#ff8fa8', ' stroke-width="1.5"') +
    /* sa bouche dit son humeur : contente, ou un peu triste (il demande quelque chose) ; ses paupières tombent s'il a sommeil */
    '<g class="at-c-bouche">' + T('M' + cx + ',' + (cy + 6.5) + ' q-3,3.5 -6,1 M' + cx + ',' + (cy + 6.5) + ' q3,3.5 6,1', K, 1.6) + '</g>' +
    '<g class="at-c-moue">' + T('M' + (cx - 5) + ',' + (cy + 10) + ' q5,-4 10,0', K, 1.8) + '</g>' +
    '<g class="at-c-paupieres">' + ['M' + (cx - 13.2) + ',' + (cy - 0.4) + ' a6.2,6.6 0 0 1 12.4,0 Z', 'M' + (cx + 0.8) + ',' + (cy - 0.4) + ' a6.2,6.6 0 0 1 12.4,0 Z'].map(function(d){ return '<path d="' + d + '" fill="' + p[0] + '" stroke="' + K + '" stroke-width="1.4" stroke-linejoin="round"/>'; }).join('') + '</g>' +
    T('M' + (cx - 11) + ',' + (cy + 5) + ' l-12,-2 M' + (cx - 11) + ',' + (cy + 8) + ' l-12,2 M' + (cx + 11) + ',' + (cy + 5) + ' l12,-2 M' + (cx + 11) + ',' + (cy + 8) + ' l12,2', K, 1.1) +
    (acc.tete && ACC[acc.tete] ? dessinAcc(acc.tete, cx, cy) : '') +
    '</g>';
}
/* Le chat est dessiné de profil (il bouge, il marche, il saute) : il reste une image plate, posée dans la pièce à la bonne taille */
def('chat', {w:114, h:96, z:'petit', plat:true, nom:'Petit chat', ic:'🐈',
  d:function(c){
    var p = CHATS[c.v % 3], acc = c.o.acc || {};
    var queue = function(d, cls){ return '<g class="' + cls + '">' + T(d, K, 11) + T(d, p[0], 6) + '</g>'; };
    var patte = function(x, y, h, coul, cls){ return '<g class="' + cls + '">' + R(x, y, 9, h, 4, coul) + Ell(x + 4.5, y + h - 1, 6, 3.5, p[2], ' stroke-width="2.5"') + '</g>'; };
    /* roulé en boule, il dort */
    var dort = '<g class="at-c-g-dort"><g transform="translate(0,20)"><g class="at-respire">' +
      P('M88,64 C112,62 112,38 98,40 C106,46 104,58 86,58 Z', p[0]) +
      P('M18,68 C8,48 32,26 62,28 C92,30 102,50 98,68 Z', p[0]) +
      T('M60,32 C58,40 60,46 64,50 M76,34 C74,42 76,48 80,52 M44,34 C44,40 46,44 50,48', p[1], 4) +
      P('M10,68 C2,52 12,38 30,40 C46,42 50,58 44,68 Z', p[0]) +
      P('M13,46 L12,30 L25,40 Z', p[0], ' stroke-width="4"') + P('M33,40 L41,28 L43,46 Z', p[0], ' stroke-width="4"') +
      P('M15,43 L15,35 L21,40 Z', '#ff9db4', ' stroke-width="0"') +
      P('M20,62 C24,58 34,58 40,62 C36,67 24,67 20,62 Z', p[2], ' stroke-width="0"') +
      T('M16,54 q4,3 8,0 M30,54 q4,3 8,0', K, 2.5) + P('M26,59 l3,2 l3,-2 Z', '#ff8fa8', ' stroke-width="1.5"') +
      (acc.tete && ACC[acc.tete] ? '<g transform="translate(-30,18) rotate(-12 57 18)">' + dessinAcc(acc.tete, 57, 30) + '</g>' : '') + '</g></g></g>';
    /* assis, de profil (il regarde à droite) : il peut se lécher la patte ou taper un bocal */
    var assis = '<g class="at-c-g-assis">' + queue('M34,88 C12,90 6,72 16,60 C20,55 26,57 24,63', 'at-c-queue') +
      '<g class="at-c-ventre">' + Ell(52, 80, 30, 14, p[0]) + Ell(56, 82, 18, 8, p[2], ' stroke-width="0"') + '</g>' +
      P('M30,91 C24,74 30,52 50,48 C66,46 76,60 76,76 C76,86 70,91 60,91 Z', p[0]) +
      T('M40,60 C38,70 40,80 44,86 M50,56 C48,64 49,72 52,78', p[1], 4) +
      P('M60,58 C70,60 72,74 66,86 C60,82 58,70 60,58 Z', p[2], ' stroke-width="0"') +
      patte(57, 66, 26, p[1], 'at-c-patte-b') + patte(67, 64, 28, p[0], 'at-c-patte') +
      teteChat(p, 68, 34, acc) + '</g>';
    /* debout, il marche ou il saute */
    var debout = '<g class="at-c-g-debout">' + queue('M22,62 C6,54 6,34 16,26', 'at-c-queue') +
      patte(24, 64, 27, p[1], 'at-c-j at-c-j1') + patte(66, 64, 27, p[1], 'at-c-j at-c-j3') +
      '<g class="at-c-ventre">' + Ell(54, 70, 34, 12, p[0]) + '</g>' +
      P('M18,66 C16,52 30,46 54,46 C76,46 90,50 90,62 C90,72 78,74 56,74 C32,74 18,74 18,66 Z', p[0]) +
      T('M40,48 C38,56 40,64 44,70 M54,47 C52,56 54,64 58,70', p[1], 3.5) +
      patte(34, 66, 26, p[0], 'at-c-j at-c-j2') + patte(76, 66, 26, p[0], 'at-c-j at-c-j4') +
      teteChat(p, 92, 46, acc) + '</g>';
    return [
      N('<ellipse class="at-c-ombre" cx="58" cy="92" rx="46" ry="5" fill="rgba(0,0,0,.28)"/>'),
      N('<g class="at-c-corps">' + dort + assis + debout + '</g>'),
      N('<text class="at-zzz" x="46" y="34" font-size="17" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>' +
        '<text class="at-zzz z2" x="56" y="26" font-size="13" font-weight="700" fill="#bff9ff" text-anchor="middle">z</text>')
    ];
  }});

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
def('coussin', {w:126, h:66, p:110, z:'sol', deco:true, nf:3, nom:'Coussin', ic:'🟣',
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
    if(c.o.plein) s += croquettes(c, 48, cz, 26, 14);
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
    defsThemes() +
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
  /* les deux piliers et le fond noir */
  s += P('M' + (X - 98) + ',522 L' + (X - 98) + ',382 C' + (X - 98) + ',330 ' + (X + 98) + ',330 ' + (X + 98) + ',382 L' + (X + 98) + ',522 Z', '#1b0e0a') +
    '<ellipse cx="' + X + '" cy="508" rx="80" ry="40" fill="' + G('feuFoyer') + '" opacity=".55"/>' +
    c.boite(-138, -210, -98, 0, -40, 0, {face:G('pierre'), dessus:G('pierre'), cote:G('pierre')}) + c.boite(98, -210, 138, 0, -40, 0, {face:G('pierre'), dessus:G('pierre'), cote:G('pierre')});
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
/* Pose un objet à l'endroit lâché : sur un meuble (un petit objet), sur un mur, ou par terre */
function resoudre(V, o, x, y){
  var c = catDe(o);
  if(c.z === 'petit'){
    var sf = surfaceSous(V, o, x, y);
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
    if(!cp.surf || cp.special === 'grimoire' || p.t === 'chat') return;
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
  if(Array.isArray(V.o.recettes) && V.o.recettes.length) return V.o.recettes;
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
function vue(el, opts){
  opts = opts || {};
  var D = DD();
  INGR = opts.ingr || D.INGR || {};
  var V = {
    el:el, o:opts, uid:++uidVue, etat:normaliser(opts.etat || etatNeuf()),
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
      '<button type="button" class="at-salle" data-at="salle" aria-label="L\'autre pièce"><span class="at-salle-ic" aria-hidden="true"></span><b class="at-badge" style="display:none"></b></button></div>' +
    '<div class="at-ouvert" hidden></div><div class="at-grim" hidden></div><div class="at-toast" hidden></div><div class="at-fantomes"></div>';
  el.appendChild(root);
  V.piece = q(V, '.at-piece'); V.monde = q(V, '.at-monde'); V.scene = q(V, '.at-scene'); V.calque = q(V, '.at-calque'); V.ouvertEl = q(V, '.at-ouvert');
  V.grim = q(V, '.at-grim'); V.toastEl = q(V, '.at-toast'); V.fantomes = q(V, '.at-fantomes'); V.tientEl = q(V, '.at-tient'); V.reperes = q(V, '.at-reperes');
  V.fondEl = q(V, '.at-fond-box'); V.halos = q(V, '.at-halos'); V.elReserve = q(V, '.at-coin'); V.elSalle = q(V, '.at-salle');
  majMoment(V);

  if(verifierBoutique(V)) changer(V);
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
  annoncerAcc(V);

  return {
    arreter:function(){ arreter(V); },
    maj:function(o2){ maj(V, o2); },
    etat:function(){ return V.etat; },
    /* le chaudron en cours (MJ.lancer) : le moteur le met en pause au lieu de l'abandonner quand on change d'onglet (moteur-actions.js) */
    partie:function(){ return V.mjPartie || null; },
    /* pour les bancs d'essai */
    _vb:function(){ return {x0:V.vb.x0, y0:V.vb.y0, w:V.vb.w, h:V.vb.h, k:V.k, pan:{x:V.pan.x, y:V.pan.y}}; },
    _voir:function(x, y){ centrerSur(V, x, y); },
    _chat:function(id){ var o = chatsDe(V)[0]; var st = o && V.chats[id || o.id]; return st ? {pose:st.pose, dort:st.pose === 'dort', reste:st.dortJusqua ? Math.max(0, st.dortJusqua - Date.now()) : 0, pos:st.pos, tenu:!!st.tenu, chasse:!!st.chasse, depart:!!st.depart, anim:!!st.anim, mv:st.mv ? st.mv.mode || 1 : 0, mode:V.mode} : null; },
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
    _garde:function(id){ ouvrirGarde(V, id); },
    _dehors:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); st.pos = chatSolVisible(V); placerEl(V, o); var d = V.elO[id]; if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5); return st.pos; },
    _reveil:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} } if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; placerEl(V, o); chatPose(V, o, 'assis'); chatPlanifier(V, o, 20000); return true; },
    _bulle:function(id){ var d = V.elO[id], b = d && d.querySelector('.at-bulle'); return b && !b.hidden ? b.getAttribute('data-bulle') : null; },
    /* l'arbre à chat, l'autre pièce (Romain, 5 novembre, 12 h 31) : un jeu à l'arbre tout de suite ('grimpe', 'boule', 'griffe') ;
       aller dans l'autre pièce maintenant ; revenir maintenant ; où il est */
    _arbre:function(id, quoi){ var o = V.parId[id]; if(!o) return null; var st = chatEtat(V, o); if(st.anim || st.tenu) return null; if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; chatPose(V, o, 'assis'); return chatArbre(V, o, quoi); },
    _passe:function(id){ var o = V.parId[id]; if(!o) return false; var st = chatEtat(V, o); if(st.t){ clearTimeout(st.t); st.t = null; } st.dortJusqua = 0; if(st.pose === 'dort') chatPose(V, o, 'assis'); PASSAGE_T = 0; return peutPasser(V, o) ? chatPasse(V, o) : false; },
    _revient:function(id){ var o = V.parId[id]; return o ? chatRevient(V, o, true) : false; },
    _ou:function(id){ var o = V.parId[id], st = o && V.chats[id]; return o ? {salle:salleDe(o), x:o.x, y:o.y, sur:o.sur || null, vu:!!V.elO[id], passe:!!(st && st.passe), pose:st ? st.pose : null, pos:st ? st.pos : null, retour:RETOUR_MEMO[id] ? Math.round(RETOUR_MEMO[id] - Date.now()) : null} : null; },
    _guide:function(){ return guideElements(V).map(function(e){ return e.getAttribute('data-obj') || e.getAttribute('data-tas') || e.getAttribute('data-carton') || e.getAttribute('data-pot') || e.className; }); },
    _flacons:function(){ return (V.elFl || []).map(function(d){ return {k:d._k, n:d._n, cadre:cadreEl(d), neuf:d.classList.contains('at-nouveau')}; }); }
  };
}

function arreter(V){
  if(V.arrete) return;
  V.arrete = true;
  VUES = VUES.filter(function(W){ return W !== V; });
  if(V.mjPartie){ try{ V.mjPartie.arreter(); }catch(e){} V.mjPartie = null; }
  V.suivis.slice().forEach(function(f){ f(); });
  V.timers.forEach(clearTimeout); V.timers = [];
  if(V.defile){ clearInterval(V.defile); V.defile = null; }
  V.nettoie.forEach(function(f){ try{ f(); }catch(e){} }); V.nettoie = [];
  try{ V.root.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); }); }catch(e){}
  if(V.root.parentNode) V.root.parentNode.removeChild(V.root);
  if(V.attente){ var a = V.attente, cb = V.o.potionFinie; V.attente = null; setTimeout(function(){ try{ if(cb) cb(a.id, a.reussi, a.detail); }catch(e){ console.error(e); } }, 0); }
}

/* Mise à jour quand le moteur a changé l'état ou les options (ingrédients cueillis, cartons offerts, boutique, moment…) */
function maj(V, o2){
  if(V.arrete) return;
  if(o2) cles(o2).forEach(function(k){ V.o[k] = o2[k]; });
  if(V.o.etat && V.o.etat !== V.etat) V.etat = V.o.etat;
  normaliser(V.etat);
  INGR = V.o.ingr || DD().INGR || INGR;
  majMoment(V);
  tamaMoment(V);
  var avantK = cles(V.elK);
  if(verifierBoutique(V)) changer(V);
  if(V.mode === 'prep') return;
  if(V.sel && !(V.etat.panier[V.sel] > 0)) V.sel = null;
  mise(V);
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
  var n = (V.elTas || []).length;
  (V.elTas || []).forEach(function(d, i){
    var q = posTas(i, n), m = surSol(q.x, q.y), R = repere([m.X, 0, m.Z], AXES_FACE, TAS.w, TAS.h), D = dessinTas(d._k, d._n, R), b = D.bb, bw = b[2] - b[0], bh = b[3] - b[1];
    d.innerHTML = '<svg viewBox="' + [b[0], b[1], bw, bh].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>';
    d.style.left = pX(V, q.x + b[0] - TAS.w / 2); d.style.top = pY(V, q.y + b[1] - TAS.h);
    d.style.width = pW(V, bw); d.style.height = pH(V, bh);
    d.style.transformOrigin = ((TAS.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((TAS.h - b[1]) / bh * 100).toFixed(2) + '%';
    d.style.setProperty('--s', R.k.toFixed(3));
    d.style.zIndex = Math.round((1000 + q.y) * 5);
    d._s = R.k; d._bb = b; d._p = {x:q.x, y:q.y, s:R.k}; d._w = TAS.w; d._h = TAS.h;
  });
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
  var l = V.elFl || [], n = l.length, rangs = Math.ceil(cles(V.etat.panier).filter(function(k){ return V.etat.panier[k] > 0; }).length / TAS.rang);
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
  V.parId = {}; V.elO = {}; V.elK = {}; V.elTas = []; V.elNeuf = null; V.elFl = [];
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
  DESSIN.analyses = V.o.analyses || [];
  DESSIN.cuivre = aObjet(V, 'chaudron_cuivre');
}
/* Le contenu changeant : le carton du coin (son nombre), la paillasse (objets reçus), le chaudron (prêt, fioles vides) */
function analysesEnAttente(V){ return (V.o.analyses || []).filter(function(a){ return !a.fait; }).length; }
function majFixes(V){
  var nr = Math.max(0, V.etat.reserve.length - (V.enVol || 0)), rb = V.elReserve && V.elReserve.querySelector('.at-badge');
  if(rb){ rb.textContent = nr; rb.style.display = nr ? '' : 'none'; }
  majDessin(V);
  var pa = V.parId.pa, att = analysesEnAttente(V);
  if(pa && V.elO.pa){
    redessiner(V, pa);
    V.elO.pa.classList.toggle('at-attente', att > 0);
  }
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
  if(o.t === 'chat') majHumeur(V, o);
  return d;
}
/* Le dessin d'un objet (dans la perspective, là où il est) ; un rangement porte en plus sa petite règle (💧 le verre, 🍃 les choses sèches),
   visible quand on tient un ingrédient ; le chaudron, le nombre de fioles vides */
function htmlObjet(V, o, R){
  var c = catDe(o), D = dessinObjet(o, R), b = D.bb, att = c.special === 'analyses' ? (DESSIN.analyses || []).filter(function(a){ return !a.fait; }).length : 0;
  return {bb:b, html:'<svg viewBox="' + [b[0], b[1], b[2] - b[0], b[3] - b[1]].map(f1).join(' ') + '" overflow="visible" aria-hidden="true">' + D.svg + '</svg>' +
    (c.cases ? '<span class="at-regle ' + (c.verre ? 'at-regle-v' : 'at-regle-s') + '" aria-hidden="true">' + (c.verre ? '💧' : '🍃') + '</span>' : '') +
    (att ? '<b class="at-badge">' + att + '</b>' : '') + (c.special === 'chaudron' ? videsHTML(V) : '') + (o.t === 'chat' ? bulleHTML(o) + bonheurHTML(o) : '')};
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
  }
  var b = d._bb, bw = b[2] - b[0], bh = b[3] - b[1];
  d.style.left = pX(V, p.x + b[0] - c.w / 2);
  d.style.top = pY(V, p.y + b[1] - c.h);
  d.style.width = pW(V, bw);
  d.style.height = pH(V, bh);
  d.style.transformOrigin = ((c.w / 2 - b[0]) / bw * 100).toFixed(2) + '% ' + ((c.h - b[1]) / bh * 100).toFixed(2) + '%';
  d.style.setProperty('--s', p.s.toFixed(3));
  d.style.zIndex = Math.round(p.z * 5);
  d._s = p.s; d._p = p;
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
  /* --- la pièce --- */
  ecoute(V, V.piece, 'pointerdown', function(e){
    if(V.arrete || e.button > 0) return;
    V.dernierPointeur = Date.now(); V.enGeste = true;
    var t = e.target;
    if(t.closest('.at-repere') || t.closest('.at-tient')) return;
    var obj = t.closest('.at-o'), carton = t.closest('.at-carton'), tas = t.closest('.at-tas'), fixe = t.closest('[data-at]'), surf = t.closest('[data-surf]');
    e.preventDefault();
    /* le guidage du tutoriel : seulement ce qui brille (ailleurs : « Pas maintenant », la pièce peut glisser) */
    if(GUIDE && V.mode === 'ranger' && !guideAutorise(V, t)){ gesteOuDefile(V, e, function(){ pasMaintenant(V); }); return; }
    if(V.mode !== 'ranger'){ gesteOuDefile(V, e, null); return; }
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
    var fixe = t.closest('[data-at]'), obj = t.closest('.at-o'), carton = t.closest('.at-carton'), tas = t.closest('.at-tas'), surf = t.closest('[data-surf]');
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

  /* --- les grands panneaux : la cueillette, le grimoire, le chaudron, les potions, les analyses, le carton du coin --- */
  ecoute(V, V.grim, 'click', function(e){
    var b = e.target.closest('button');
    if(e.target === V.grim){ fermerGrimoire(V); return; }
    if(!b) return;
    if(b.classList.contains('at-fermer')){ fermerGrimoire(V); son(V, 'clic'); return; }
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
  else if(at === 'reserve') ouvrirReserve(V);
  else if(at === 'salle') changerSalle(V, 1 - V.salle);
  else if(at === 'flaque') nettoyerFlaque(V);
  else if(at === 'betise') reparerBetise(V, pot);
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
  if(c.special === 'chaudron'){ ouvrirChaudron(V); return; }
  if(c.special === 'grimoire'){ ouvrirLivre(V); return; }
  if(c.special === 'analyses'){ ouvrirAnalyses(V); return; }
  if(c.cases){ ouvrir(V, o); return; }
  if(o.t === 'lampe'){ o.on = o.on === 0 ? 1 : 0; redessiner(V, o); son(V, 'clic'); changer(V); majLumiere(V); rebond(d); return; }
  /* les affaires du chat : d'abord leur action (remplir la gamelle) ; le tabouret renversé se relève */
  if(o.renverse){ relever(V, o); return; }
  if((o.t === 'gamelle' || o.t === 'eau') && !o.plein){ remplir(V, o); return; }
  if(o.t === 'distributeur' && parDistributeur(V, o)) return;
  if(c.deco){ restyler(V, o); return; }
  son(V, 'clic');
  rebond(d);
}
function rebond(d){ if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.08 + ',' + d._s * 0.92 + ')', offset:0.35}, {transform:'scale(' + d._s + ')'}], {duration:320, easing:'ease-out'}); }
/* Le style suivant (forme et couleur) d'un objet ; un petit « pouf » d'étoiles */
function restyler(V, o){
  var c = catDe(o), d = V.elO[o.id];
  o.st = ((o.st || 0) + 1) % nStyles(c);
  o.neuf = 0;
  redessiner(V, o);
  if(d) anim(d, [{transform:'scale(' + d._s + ')', filter:'brightness(1.6)'}, {transform:'scale(' + d._s * 1.12 + ',' + d._s * 0.9 + ')', filter:'brightness(1.25)', offset:0.35}, {transform:'scale(' + d._s + ')', filter:'none'}], {duration:360, easing:'ease-out'});
  etincelles(V, o);
  son(V, 'clic');
  if(c.lumiere || o.t === 'bougies') majLumiere(V);
  if(c.special === 'analyses' || c.special === 'chaudron') majFixes(V);
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
/* Toucher un mur ou le plancher : un autre motif, une autre couleur */
function restylerSurface(V, cle){
  if(!DECO_NF[cle] || V.mode !== 'ranger') return;
  V.etat.deco[cle] = ((V.etat.deco[cle] || 0) + 1) % (DECO_NF[cle] * NT);
  majFond(V);
  son(V, 'clic');
  changer(V);
}
function majFond(V){ V.fondEl.innerHTML = svgFond(V) + fondAnime(V); }
/* 🎨 dans un panneau : le lutrin, la paillasse ou le chaudron change de style (et la petite image du panneau aussi) */
function peindrePanneau(V, cle){
  if(V.parId[cle]) restyler(V, V.parId[cle]);
  var im = V.grim.querySelector('.at-f-apercu');
  if(im) im.innerHTML = apercuPanneau(V, cle);
}
function apercuPanneau(V, cle){
  var o = V.parId[cle];
  return o ? svgObjet({t:o.t, st:o.st, v:o.v}) : '';
}
function boutonPeindre(V, cle){
  return '<span class="at-f-apercu" aria-hidden="true">' + apercuPanneau(V, cle) + '</span><button type="button" class="at-rond at-peindre" data-peindre="' + cle + '" aria-label="Changer la couleur">🎨</button>';
}

/* ---------- Déplacer un meuble : appuyer, garder le doigt, puis glisser ----------
   Un glisser tout de suite fait défiler la pièce (téléphone) ; sur un grand écran (rien à faire défiler), il déplace aussi le meuble. */
function prendreObjet(V, e, o){
  var d = V.elO[o.id];
  if(!d) return;
  var id = e.pointerId, x0 = e.clientX, y0 = e.clientY, pan0 = {x:V.pan.x, y:V.pan.y}, etat = 'attente', g = null, glissable = V.root.classList.contains('at-glissable');
  /* le chat : le doigt qui glisse sur lui le caresse (il ronronne) ; s'il sort du chat, la pièce défile (ou, sur un grand écran, on le déplace) */
  var chat = o.t === 'chat', car = {l:0, n:0, x:x0, y:y0};
  function surChat(ev){ var r = d.getBoundingClientRect(), mx = r.width * 0.25 + 12, my = r.height * 0.25 + 12; return ev.clientX > r.left - mx && ev.clientX < r.right + mx && ev.clientY > r.top - my && ev.clientY < r.bottom + my; }
  d.classList.add('at-appui');
  function lever(ev){
    etat = 'glisse';
    d.classList.remove('at-appui');
    g = debutGlisseObjet(V, e, o);
    if(ev) g.move(ev);
  }
  var tm = apres(V, TENIR, function(){ if(etat === 'attente'){ vibrer(12); lever(null); } });
  function mv(ev){
    if(ev.pointerId !== id) return;
    var dx = ev.clientX - x0, dy = ev.clientY - y0;
    if(etat === 'attente' && dx * dx + dy * dy >= SEUIL_GESTE * SEUIL_GESTE){
      clearTimeout(tm);
      if(chat && surChat(ev)){ etat = 'caresse'; d.classList.remove('at-appui'); car.x = ev.clientX; car.y = ev.clientY; }
      else if(glissable){ etat = 'defile'; d.classList.remove('at-appui'); V.root.classList.add('at-defile'); }
      else lever(ev);
    }
    if(etat === 'caresse'){
      if(surChat(ev)){
        car.l += Math.hypot(ev.clientX - car.x, ev.clientY - car.y); car.x = ev.clientX; car.y = ev.clientY;
        while(car.l >= 44){ car.l -= 44; car.n++; caresser(V, o, 1); }
        return;
      }
      /* le doigt sort du chat */
      if(glissable){ etat = 'defile'; pan0 = {x:V.pan.x + dx, y:V.pan.y + dy}; V.root.classList.add('at-defile'); }
      else lever(ev);
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
    else if(etat === 'caresse'){ if(!car.n && !annule) caresser(V, o, 1); }
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
  if(chat) chatSaisi(V, o);
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
  ouvrirCalque(V, 'at-cal-analyses', feuille('at-f-analyses', '<span class="at-f-ic">🔍</span><h3>La paillasse d\'analyse</h3>' + boutonPeindre(V, 'pa'), corpsAnalyses(V)));
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
  if(!recettesDe(V).length) return;
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
    var tf = 'La recette est complète ! Ferme le grimoire et va au grand chaudron.';
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
function ouvrirChaudron(V){
  if(V.mode !== 'ranger') return;
  var prets = recettesDe(V).filter(function(r){ return etatRecette(V, r.id).pret; });
  if(!prets.length){
    son(V, 'bulle');
    var ch = V.elO.ch;
    if(ch){ ch.classList.remove('at-bouillonne'); void ch.offsetWidth; ch.classList.add('at-bouillonne'); apres(V, 1700, function(){ ch.classList.remove('at-bouillonne'); }); }
    var t = 'Il te manque des ingrédients : regarde le grimoire 📖';
    toast(V, esc(t), 5200, 'Il te manque des ingrédients : regarde le grimoire.', '<button type="button" class="at-rond at-toast-peindre" aria-label="Changer la couleur du chaudron">🎨</button>');
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
var CHAT_VITESSE = 135;          /* unités logiques par seconde */
var CHAT_SIESTE_TOUCHE = 30000;  /* toucher le chat : il dort 30 secondes */
var POSES = ['dort', 'assis', 'marche', 'saute', 'lave', 'tape', 'mange', 'salut', 'griffe', 'boule'];   /* (griffe, boule : à l'arbre à chat, dressé sur ses pattes arrière) */

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
}
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
  if(Math.abs(dx) > 2) st.gauche = dx < 0;
  d.classList.toggle('at-c-gauche', st.gauche);
  chatPose(V, o, mode);
  placerEl(V, o);
  var k = V.k, tx = (-dx * k).toFixed(1), ty = (-dy * k).toFixed(1), kf, dur;
  d.style.zIndex = Math.round(Math.max(p0.z, p1.z) * 5) + 6;
  if(mode === 'saute'){
    var arc = (Math.abs(dy) * 0.3 + 46) * k;
    kf = [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + p0.s.toFixed(3) + ')'},
      {transform:'translate(' + (tx / 2).toFixed(1) + 'px,' + (ty / 2 - arc).toFixed(1) + 'px) scale(' + ((p0.s + p1.s) / 2).toFixed(3) + ')', offset:0.5},
      {transform:'translate(0,0) scale(' + p1.s.toFixed(3) + ')'}];
    dur = 620;
  } else {
    kf = [{transform:'translate(' + tx + 'px,' + ty + 'px) scale(' + p0.s.toFixed(3) + ')'}, {transform:'translate(0,0) scale(' + p1.s.toFixed(3) + ')'}];
    dur = Math.max(450, dist / CHAT_VITESSE * 1000);
  }
  var a = anim(d, kf, {duration:dur, easing:mode === 'saute' ? 'cubic-bezier(.3,0,.4,1)' : 'linear'});
  st.anim = a;
  st.mv = {p0:{x:p0.x, y:p0.y}, p1:{x:p1.x, y:p1.y}, mode:mode, dur:dur};
  function fini(){
    if(st.anim !== a) return;
    st.anim = null;
    if(V.arrete) return;
    d.style.zIndex = Math.round(p1.z * 5);
    if(mode === 'saute') anim(d, [{transform:'scale(' + (p1.s * 1.08).toFixed(3) + ',' + (p1.s * 0.9).toFixed(3) + ')'}, {transform:'scale(' + p1.s.toFixed(3) + ')'}], {duration:200});
    if(fin) fin();
  }
  if(a) a.onfinish = fini; else fini();
}
/* Un point du plancher (on reste dans la pièce) */
function chatSol(V, x, y){
  y = borne(y, SOL_MIN + 20, solMax(V));
  return {x:borne(x, solXmin(V, y) + 50, solXmax(V, y) - 50), y:y, sur:null};
}
/* Assis là, serait-il caché derrière le chaudron, l'établi ou un grand meuble ? (on ne choisit pas ces places-là) */
function chatCache(V, x, y){
  var s = echelleSol(y), cx0 = x - 45 * s, cx1 = x + 45 * s, cy0 = y - 80 * s, aire = (cx1 - cx0) * (y - cy0);
  var bx = [];
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
  var now = Date.now();
  if(st.pose === 'dort'){
    if(now < st.dortJusqua){ chatPlanifier(V, o, st.dortJusqua - now + 30); return; }
    chatPose(V, o, 'assis');                       /* il se réveille et s'étire */
    st.reveil = true;
    var d = V.elO[o.id];
    if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + (d._s * 1.12) + ',' + (d._s * 0.9) + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:700});
    chatPlanifier(V, o, 1600);
    return;
  }
  var suite = function(ms){ chatPose(V, o, 'assis'); chatPlanifier(V, o, ms || (2200 + Math.random() * 2800)); };
  if(tamaAgir(V, o)) return;                      /* ses besoins d'abord (manger, boire, dormir, demander) ; le chaton joue */
  /* l'arbre à chat de la pièce : il y grimpe, il joue avec la boule, il s'y fait les griffes ;
     de temps en temps, il va faire un tour dans l'autre pièce, par l'arche (Romain, 5 novembre, 12 h 31) */
  if(arbreIci(V) && Math.random() < 0.25 && chatArbre(V, o)) return;
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
    chatPose(V, o, 'dort');
    st.dortJusqua = now + 12000 + Math.random() * 9000;
    chatPlanifier(V, o, st.dortJusqua - now + 30);
  }
}

/* ---------- On le touche : il se roule en boule et dort 30 secondes ---------- */
function chatToucher(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id], a = st.anim, mv = st.mv;
  son(V, 'magie');
  donner(o, 'amour', 10); majHumeur(V, o); changer(V);      /* un câlin */
  montrerBonheur(V, o);                                       /* sa barre de bonheur (et 🎀 pour l'habiller) */
  if(a && mv && mv.mode === 'saute'){ st.touche = true; coeursChat(V, o); return; }   /* en l'air : il finit son saut */
  if(a){
    /* en marche : il s'arrête là où il est (sa place du moment), sans sauter ailleurs */
    var f = mv && typeof a.currentTime === 'number' ? borne(a.currentTime / mv.dur, 0, 1) : 1;
    st.anim = null;
    try{ a.cancel(); }catch(e){}
    if(mv) st.pos = {x:mv.p0.x + (mv.p1.x - mv.p0.x) * f, y:mv.p0.y + (mv.p1.y - mv.p0.y) * f, sur:null};
  }
  chatEndormir(V, o);
  coeursChat(V, o);
}
function chatEndormir(V, o){
  var st = chatEtat(V, o), d = V.elO[o.id];
  placerEl(V, o);
  if(d) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
  chatPose(V, o, 'dort');
  st.dortJusqua = Date.now() + CHAT_SIESTE_TOUCHE;
  chatPlanifier(V, o, CHAT_SIESTE_TOUCHE + 30);
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + (d._s * 0.86) + ',' + (d._s * 1.1) + ')', offset:0.35}, {transform:'scale(' + d._s + ')'}], {duration:420, easing:'ease-out'});
}
function coeursChat(V, o){
  var p = chatPos(V, o);
  for(var i = 0; i < 3; i++){
    var h = document.createElement('span'); h.className = 'at-coeur-vole'; h.textContent = '💜';
    h.style.left = pX(V, p.x + (i - 1) * 22); h.style.top = pY(V, p.y - 70 * p.s);
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
function chatLache(V, o){
  var st = chatEtat(V, o);
  st.tenu = false;
  st.pos = null;
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
          if(!MOINS_MOUV) animSvg(V, o, [{transform:'translateY(0)'}, {transform:'translateY(-24%)', offset:0.45}, {transform:'translateY(0)'}], {duration:520, easing:'cubic-bezier(.3,0,.4,1)'});
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
   Le chat, un petit Tamagotchi (étape 3). Romain : « Le chat, c'est un élément très très important. »
   - Ses besoins : faim 🍗, soif 💧, câlins ❤️, jeu 🧶, sommeil 💤 (0 à 100, gardés sur le chat : o.b).
     Ils baissent seulement pendant qu'on joue (l'atelier ouvert, l'écran allumé) et un peu à chaque nouveau moment :
     JAMAIS quand l'appli est fermée. Il ne tombe jamais malade, il ne meurt jamais : il a juste l'air un peu triste et il demande
     (une bulle au-dessus de lui ; on la touche pour savoir quoi faire).
   - On lui donne des croquettes (le distributeur ou la gamelle), de l'eau, on le caresse avec le doigt (il ronronne, des cœurs),
     on joue avec la pelote ; il va dormir dans son panier.
   - Une petite bêtise environ toutes les 4 minutes de jeu, jamais plus : une fiole par terre, le tabouret renversé, une pelote déroulée.
     Un toucher remet tout en ordre ; rien n'est jamais perdu.
   - À partir de l'enquête 4 (PORTEE, des données) : la chatte s'arrondit, un chaton naît (un autre pelage), et quand il a un peu grandi,
     Mimi part vivre chez Odette, la grand-mère aux sept chats (etat.chezOdette ; Atelier.chezOdette(etat) pour le village).
   L'état : etat.tama = {jeu (secondes de jeu), betise (le moment de la dernière bêtise), moment, portee:{phase, t}}, etat.betises, etat.chezOdette.
   ========================================================== */
var BESOINS = [
  {k:'faim', ic:'🍗', baisse:5, dit:'%n a faim ! Donne-lui des croquettes : touche le distributeur ou sa gamelle.'},
  {k:'soif', ic:'💧', baisse:6, dit:'%n a soif ! Touche sa gamelle d\'eau pour la remplir.'},
  {k:'amour', ic:'❤️', baisse:5, dit:'%n veut un câlin ! Caresse-le en glissant ton doigt sur lui.'},
  {k:'jeu', ic:'🧶', baisse:4, dit:'%n veut jouer ! Touche la bulle : voilà une pelote.'},
  {k:'dodo', ic:'💤', baisse:3, dit:'%n a sommeil… Touche la bulle : il va faire dodo.'}
];
var DEMANDE = 40, TRISTE = 22;      /* sous 40 il le demande (une bulle) ; sous 22 il a l'air un peu triste */
var TIC = 15;                        /* les besoins changent toutes les 15 secondes de jeu */
var BETISE_MIN = 240;                /* une bêtise au plus toutes les 4 minutes de jeu */
var PAS_MOMENT = 22;                 /* un nouveau moment de la journée : chaque besoin baisse un peu */
/* Le chaton (des données : il arrive à l'enquête 4) : en secondes de jeu ; un nouveau moment compte pour 120 s */
var PORTEE = {enquete:4, ronde:150, naissance:240, depart:420, mere:'Mimi', chatons:['Pompon', 'Caramel', 'Noisette']};
var REPLIQUE_ODETTE = {q:'Comment va %n ?', a:'%n ? Elle est très heureuse ici, avec mes sept chats ! Elle dort sur mon fauteuil, près du feu. Revenez la voir quand vous voulez.'};
var DODO_ICI = /^(panier|lit|pouf|coussin|arbre_chat|coffre)$/;   /* ses coins pour dormir */

function tama(V){ if(!V.etat.tama || !Array.isArray(V.etat.betises)) normaliserChat(V.etat); return V.etat.tama; }
function chatsTous(V){ return V.etat.objets.filter(function(o){ return o.t === 'chat'; }); }
function nomChat(o){ return o.nom || (o.chaton ? PORTEE.chatons[0] : PORTEE.mere); }
function tailleChat(o, p){ if(o.chaton && o.taille > 0 && o.taille < 1) p.s *= o.taille; return p; }
function besoins(o){
  if(!o.b || typeof o.b !== 'object') o.b = {};
  BESOINS.forEach(function(b){ if(typeof o.b[b.k] !== 'number') o.b[b.k] = 80; });
  return o.b;
}
function besoinUrgent(o){
  var b = besoins(o), pire = null;
  BESOINS.forEach(function(x){ if(b[x.k] < DEMANDE && (!pire || b[x.k] < b[pire.k])) pire = x; });
  return pire;
}
function humeur(o){
  var b = besoins(o);
  return {triste:BESOINS.some(function(x){ return b[x.k] < TRISTE; }), fatigue:b.dodo < 30};
}
/* le numéro de l'enquête : donné par le moteur (option enquete), sinon celui de la partie en cours */
function enqueteNo(V){
  var n = 0, t = V.etat.tama || {};
  if(typeof V.o.enquete === 'number') n = V.o.enquete;
  else try{ var S = window.M && window.M.S; n = S && S.e ? +S.e.id || 0 : 0; }catch(e){ n = 0; }
  /* (entre deux enquêtes, la partie n'a pas d'enquête en cours : on garde la plus avancée déjà vue) */
  if(n > 0 && V.etat.tama && !(t.enq >= n)) t.enq = n;
  return Math.max(n, t.enq || 0, 1);
}
function donner(o, k, n){ var b = besoins(o); b[k] = borne(Math.round(b[k] + n), 0, 100); }

/* ---------- Le temps de jeu ---------- */
function tamaDemarrer(V){
  tama(V);
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
      var st = V.chats[o.id], dort = st && st.pose === 'dort' && salleDe(o) === V.salle;
      BESOINS.forEach(function(x){
        if(x.k === 'dodo' && dort) donner(o, 'dodo', 30 * dt / 60);
        else donner(o, x.k, -x.baisse * dt / 60);
      });
    });
    portee(V, dt);
    if(!V.attenteBetise && !GUIDE && !V.ouvert && V.grim.hidden && t.jeu - t.betise >= BETISE_MIN && Math.random() < (force ? 1 : 0.5)) peutEtreBetise(V);
    /* étape 4 : bien heureux, il sort par la chatière chercher un ingrédient (au plus une fois par moment) ; une souris passe */
    if(!force && !V.attenteBetise && !GUIDE && !V.o.sansSurprise){      /* (rien de tout ça pendant le guidage du tutoriel ; sansSurprise : les bancs d'essai) */
      var sortants = chatsDe(V).filter(function(c){ return peutSortir(V, c); });
      if(sortants.length && Math.random() < 0.3) sortieChat(V, sortants[0]);
      else if(Math.random() < 0.35) sourisPasse(V);
    }
    majHumeurs(V);
    if(!force && (t.jeu / TIC) % 4 === 0) changer(V);
  }
  if(!force){ clearTimeout(V.tamaT); V.tamaT = apres(V, TIC * 1000, function(){ tamaTic(V); }); }
}
/* Un nouveau moment de la journée (matin, après-midi…) : les besoins baissent un peu, le chaton grandit */
function tamaMoment(V){
  var t = tama(V), cle = enqueteNo(V) + ':' + (V.o.moment || 'matin');
  if(t.moment && t.moment !== cle){
    chatsTous(V).forEach(function(o){ BESOINS.forEach(function(x){ donner(o, x.k, -PAS_MOMENT); }); });
    portee(V, 120, true);
  }
  t.moment = cle;
}

/* ---------- L'humeur : sa tête, sa bulle ---------- */
function bulleHTML(o){
  var u = besoinUrgent(o);
  return '<button type="button" class="at-bulle"' + (u ? ' data-bulle="' + u.k + '"' : ' hidden') + ' aria-label="Ce que veut le chat"><span>' + (u ? u.ic : '') + '</span><i></i><i></i></button>';
}
function majHumeur(V, o){
  var d = V.elO[o.id];
  if(!d) return;
  var h = humeur(o), u = besoinUrgent(o), b = d.querySelector('.at-bulle');
  d.classList.toggle('at-c-triste', h.triste);
  d.classList.toggle('at-c-fatigue', h.fatigue);
  d.classList.toggle('at-c-ronde', !!o.ronde);
  d.classList.toggle('at-chaton', !!o.chaton);
  if(b){
    b.hidden = !u;
    if(u){ b.setAttribute('data-bulle', u.k); b.querySelector('span').textContent = u.ic; }
  }
}
function majHumeurs(V){ chatsDe(V).forEach(function(o){ majHumeur(V, o); }); }

/* ---------- Les affaires du chat ---------- */
function gamellePleine(V, o, t){ return V.etat.objets.filter(function(g){ return g.t === t && g.plein && salleDe(g) === salleDe(o) && !g.sur; })[0]; }
function remplir(V, g){
  g.plein = 1; g.neuf = 0;
  redessiner(V, g);
  var d = V.elO[g.id];
  if(d) anim(d, [{transform:'scale(' + d._s + ')'}, {transform:'scale(' + d._s * 1.12 + ',' + d._s * 0.9 + ')', offset:0.4}, {transform:'scale(' + d._s + ')'}], {duration:360});
  son(V, g.t === 'eau' ? 'plouf' : 'gain');
  var t = g.t === 'eau' ? 'De l\'eau fraîche !' : 'Des croquettes !';
  toast(V, '<b>' + (g.t === 'eau' ? '💧' : '🍗') + '</b> ' + esc(t), 2000);
  changer(V);
  /* un chat qui en a besoin arrive tout de suite */
  chatsDe(V).forEach(function(c){ var u = besoinUrgent(c); if(u && (u.k === 'faim' && g.t === 'gamelle' || u.k === 'soif' && g.t === 'eau')) chatPlanifier(V, c, 400); });
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
function bulleChat(V, o){
  var u = besoinUrgent(o);
  if(!u) return;
  var t = u.dit.replace('%n', nomChat(o));
  if(u.k === 'amour'){ caresser(V, o, 5); return; }
  if(u.k === 'jeu'){ jouerPelote(V, o); toast(V, '<b>🧶</b> ' + esc(nomChat(o) + ' joue avec la pelote !'), 2600); return; }
  if(u.k === 'dodo'){ var st = chatEtat(V, o); if(!st.tenu){ chatVaDormir(V, o); } toast(V, '<b>💤</b> ' + esc(nomChat(o) + ' va faire dodo.'), 2600); return; }
  /* faim, soif : on montre quoi toucher (le distributeur, les gamelles brillent) */
  toast(V, '<b>' + u.ic + '</b> ' + esc(t), 5200, t);
  var l = ici(V).filter(function(g){ return u.k === 'faim' ? (g.t === 'gamelle' || g.t === 'distributeur') : g.t === 'eau'; });
  if(!l.length){ var t2 = 'Ouvre le carton des affaires du chat : il y a sa gamelle !'; apres(V, 2600, function(){ toast(V, '<b>📦</b> ' + esc(t2), 4200, t2); }); }
  l.forEach(function(g){ var d = V.elO[g.id]; if(d){ d.classList.add('at-dispo'); apres(V, 4000, function(){ d.classList.remove('at-dispo'); }); } });
  son(V, 'clic');
}
/* Caresser : le doigt glisse sur lui (ou un toucher) — il ronronne, des cœurs s'envolent */
function caresser(V, o, n){
  donner(o, 'amour', 6 * (n || 1));
  var d = V.elO[o.id], st = chatEtat(V, o);
  if(chatArreter(V, o)) chatPlanifier(V, o, 2600);
  else if(st.pose !== 'dort' && !st.anim && !st.tenu) chatPlanifier(V, o, 2600);
  if(d){ d.classList.add('at-c-ronron'); clearTimeout(d._ronron); d._ronron = apres(V, 1400, function(){ d.classList.remove('at-c-ronron'); }); }
  if(!V.coeurT || Date.now() - V.coeurT > 450){ V.coeurT = Date.now(); coeursChat(V, o); son(V, 'magie'); }
  majHumeur(V, o);
  montrerBonheur(V, o, 2600);
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
      donner(o, 'jeu', 100); majHumeur(V, o); changer(V);
      chatJoue(V, o);                                   /* un de ses dix jeux (jamais le même deux fois de suite) */
      montrerBonheur(V, o, 3000);
      apres(V, 700, function(){ b.remove(); coeursChat(V, o); });
    });
  });
}
function chatVaDormir(V, o){
  var pn = ici(V).filter(function(x){ return x.t === 'panier' && !x.sur && !x.cote; })[0], st = chatEtat(V, o);
  if(st.anim){ var a = st.anim; st.anim = null; try{ a.cancel(); }catch(e){} }
  if(st.t){ clearTimeout(st.t); st.t = null; }
  var dodo = function(){ chatPose(V, o, 'dort'); st.dortJusqua = Date.now() + 25000; chatPlanifier(V, o, 25030); majHumeur(V, o); };
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
    son(V, k === 'soif' ? 'plouf' : 'tic');
    chatPlanifier(V, o, 3600);
    apres(V, 3400, function(){
      donner(o, k, 100); g.plein = 0; redessiner(V, g); majHumeur(V, o); changer(V);
      chatPose(V, o, 'lave'); montrerBonheur(V, o, 3000);
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
  var c = {id:'o' + V.etat.n, t:'chat', x:pm.x + 70, y:Math.min(solMax(V), pm.y + 30), f:0, v:(mere.v + 1) % 3, st:0, sur:null, chaton:1, taille:0.68, nom:PORTEE.chatons[n % PORTEE.chatons.length], b:{faim:90, soif:90, amour:60, jeu:50, dodo:90}};
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
  flotter(V, o, (u ? u.ic + ' ' : '') + 'Miaou !');
  son(V, 'bulle');
}
function tamaAgir(V, o){
  var u = besoinUrgent(o);
  if(u && Math.random() < 0.75){
    var g = u.k === 'faim' ? gamellePleine(V, o, 'gamelle') : u.k === 'soif' ? gamellePleine(V, o, 'eau') : null;
    if(g){ chatVaManger(V, o, g, u.k); return true; }
    if(u.k === 'dodo'){ chatVaDormir(V, o); return true; }
    if(Math.random() < 0.45){ chatPose(V, o, 'assis'); miaou(V, o); chatPlanifier(V, o, 4200); return true; }   /* il demande */
  }
  if(o.chaton && Math.random() < 0.45) return chatonJoue(V, o);
  return false;
}
/* Les bêtises du chaton : il court après sa queue, il suit sa maman, il bondit sur une ombre */
function chatonJoue(V, o){
  var r = Math.random(), d = V.elO[o.id], p = chatPos(V, o);
  if(r < 0.35 && d){
    chatPose(V, o, 'marche'); d.classList.add('at-c-tourne');
    apres(V, 1700, function(){ d.classList.remove('at-c-tourne'); chatPose(V, o, 'assis'); });
    chatPlanifier(V, o, 2600);
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
    chatPose(V, o, 'dort');
    st.dortJusqua = Date.now() + 12000 + Math.random() * 9000;
    chatPlanifier(V, o, st.dortJusqua - Date.now() + 30);
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

/* ---------- Le bonheur : la moyenne de ses cinq besoins ---------- */
function bonheur(o){ var b = besoins(o), s = 0; BESOINS.forEach(function(x){ s += b[x.k]; }); return Math.round(s / BESOINS.length); }
function bonheurHTML(o){
  var n = bonheur(o);
  return '<div class="at-bonheur" hidden><span class="at-bonheur-c" aria-hidden="true">' + (n >= BONHEUR_SORTIE ? '💖' : n >= 45 ? '💗' : '🩶') + '</span>' +
    '<i class="at-bonheur-barre"><b style="width:' + n + '%"></b></i>' +
    '<button type="button" class="at-bonheur-hab" aria-label="Habiller le chat">🎀</button>' +
    /* une petite croix à côté : on l'enlève tout de suite (Romain, 5 novembre, 12 h 31) */
    '<button type="button" class="at-bonheur-x" aria-label="Fermer"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5,5.5 L14.5,14.5 M14.5,5.5 L5.5,14.5"/></svg></button></div>';
}
/* La barre se cache (au bout d'un moment, ou tout de suite avec ✕) ; le chat reprend sa place parmi les meubles */
function cacherBonheur(V, o){
  var d = V.elO[o.id], el = d && d.querySelector('.at-bonheur');
  if(!el) return;
  clearTimeout(d._bonT);
  el.hidden = true; d.classList.remove('at-c-bonheur');
  var st = V.chats[o.id];
  if(!(st && (st.anim || st.tenu))) d.style.zIndex = Math.round(chatPos(V, o).z * 5);
}
function montrerBonheur(V, o, ms){
  var d = V.elO[o.id];
  if(!d) return;
  var el = d.querySelector('.at-bonheur'), n = bonheur(o);
  if(!el) return;
  var b = el.querySelector('.at-bonheur-barre b'), c = el.querySelector('.at-bonheur-c');
  if(b) b.style.width = n + '%';
  if(c) c.textContent = n >= BONHEUR_SORTIE ? '💖' : n >= 45 ? '💗' : '🩶';
  el.classList.toggle('plein', n >= BONHEUR_SORTIE);
  el.hidden = false;
  d.classList.add('at-c-bonheur');
  d.style.zIndex = 99000;          /* (au-dessus des meubles qui sont devant lui : on voit la barre, on touche 🎀) */
  clearTimeout(d._bonT);
  d._bonT = apres(V, ms || 6500, function(){
    if(V.elO[o.id] === d) cacherBonheur(V, o);
    else { el.hidden = true; d.classList.remove('at-c-bonheur'); }
  });      /* (le temps de toucher 🎀) */
}

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
function nomAcc(id){ var a = ACC[id]; return a ? a.nom.charAt(0).toLowerCase() + a.nom.slice(1) : ''; }
function articleAcc(id){ var a = ACC[id]; if(!a) return ''; return (/^(Couronne|Petit foulard)/.test(a.nom) ? (a.nom.indexOf('Couronne') === 0 ? 'une ' : 'un ') : /^(Collier|Nœud|Chapeau|Béret)/.test(a.nom) ? 'un ' : 'un ') + nomAcc(id); }
/* Les nouveautés gagnées pendant les mini-jeux : annoncées une fois, à l'ouverture de l'atelier */
function annoncerAcc(V){
  var G = garde(V.etat), l = G.neuf.filter(function(id){ return G.annonce.indexOf(id) < 0; });
  if(!l.length) return;
  l.forEach(function(id){ G.annonce.push(id); });
  var chat = chatsTous(V)[0], nom = chat ? nomChat(chat) : PORTEE.mere, rare = l.some(function(id){ return ACC[id].rare; });
  var t = (rare ? 'Un cadeau rare pour ' : 'Un cadeau pour ') + nom + ' : ' + l.map(articleAcc).join(' et ') + ' ! Touche ' + nom + ', puis 🎀 pour l\'habiller.';
  apres(V, 900, function(){ toast(V, '<b>🎁 ' + (rare ? '✨' : '🎀') + '</b> ' + esc(t), 6500, t); son(V, rare ? 'magie' : 'gain'); });
  changer(V);
}
/* Le dessin d'un accessoire sur la tête du chat (cx, cy : le milieu de sa tête) */
function couleurAcc(a){ return a.c === 'arc' ? 'url(#atg-arc)' : a.c; }
function dessinAcc(id, cx, cy){
  var a = ACC[id];
  if(!a) return '';
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
  var p = CHATS[(v || 0) % 3], a = ACC[id];
  return '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(p, 57, 18, {cou:a && a.slot === 'cou' ? id : null, tete:a && a.slot === 'tete' ? id : null}) + '</svg>';
}
function ouvrirGarde(V, oid){
  var o = V.parId[oid] || chatsDe(V)[0];
  if(!o) return;
  V.gardeChat = o.id;
  ouvrirCalque(V, 'at-cal-garde', htmlGarde(V));
  var G = garde(V.etat); if(G.neuf.length){ G.neuf = []; changer(V); }
  son(V, 'page');
}
function dessinerGarde(V){ if(!V.parId[V.gardeChat]){ fermerGrimoire(V); return; } V.grim.innerHTML = htmlGarde(V); }
function htmlGarde(V){
  var o = V.parId[V.gardeChat];
  if(!o) return '';
  var G = garde(V.etat), nom = nomChat(o), p = CHATS[(o.v || 0) % 3], neuf = G.neuf.slice();
  var t = G.a.length ? 'Touche un accessoire pour habiller ' + nom + '. Tu en gagnes un nouveau quand tu réussis un de tes mini-jeux, la première fois pour chacun.' :
    'La garde-robe est encore vide. Tu gagnes un accessoire pour ' + nom + ' quand tu réussis un de tes mini-jeux, la première fois pour chacun : le chaudron, les bulles, le bon mélange…';
  var corps = '<div class="at-garde-haut"><span class="at-garde-chat">' + '<svg viewBox="19 -28 76 78" aria-hidden="true">' + teteChat(p, 57, 18, o.acc || {}) + '</svg></span>' +
    '<p class="at-feuille-txt">' + esc(t) + ' ' + lireBtn(t) + '</p></div>';
  [['cou', 'Autour du cou'], ['tete', 'Sur la tête']].forEach(function(sl){
    var porte = accDe(o, sl[0]), mes = G.a.filter(function(id){ return ACC[id].slot === sl[0]; }), tous = cles(ACC).filter(function(id){ return ACC[id].slot === sl[0]; });
    corps += '<div class="at-garde-slot"><b>' + esc(sl[1]) + '</b><div class="at-garde-l">' +
      '<button type="button" class="at-garde-it' + (!porte ? ' on' : '') + '" data-acc="" data-slot="' + sl[0] + '" aria-label="Rien"><span class="at-garde-rien">✖</span><small>Rien</small></button>' +
      mes.map(function(id){ var a = ACC[id]; return '<button type="button" class="at-garde-it' + (porte === id ? ' on' : '') + (a.rare ? ' rare' : '') + '" data-acc="' + id + '" data-slot="' + sl[0] + '" aria-label="' + esc(a.nom) + '">' + vignetteAcc(id, o.v) + (neuf.indexOf(id) >= 0 ? '<i class="at-garde-neuf" aria-label="nouveau">✨</i>' : '') + '<small>' + esc(a.nom) + '</small></button>'; }).join('') +
      (tous.length > mes.length ? '<span class="at-garde-it at-garde-verrou" aria-label="À gagner"><span class="at-garde-rien">🔒</span><small>' + (tous.length - mes.length) + ' à gagner</small></span>' : '') +
      '</div></div>';
  });
  return feuille('at-f-garde', '<span class="at-f-ic">🎀</span><h3>La garde-robe de ' + esc(nom) + '</h3>', corps);
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
function peutSortir(V, o){
  var st = V.chats[o.id], t = tama(V);
  return !V.salle && salleDe(o) === 0 && t.sortie !== momentCle(V) && !t.butin && bonheur(o) >= BONHEUR_SORTIE &&
    st && !st.tenu && !st.anim && st.pose !== 'dort' && !st.depart && V.mode === 'ranger' && !V.ouvert && V.grim.hidden;
}
function sortieChat(V, o, force){
  var t = tama(V), st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || (!force && !peutSortir(V, o))) return false;
  var rare = Math.random() < 0.12, l = rare ? BUTIN_RARE : BUTIN, ingr = l[Math.floor(Math.random() * l.length)];
  if(!INGR[ingr]) ingr = 'trefle';
  t.sortie = momentCle(V);
  t.butin = {ingr:ingr, nom:nomChat(o), rare:rare ? 1 : 0};
  changer(V);
  var id = (V.sortieN = (V.sortieN || 0) + 1);
  st.sortieId = id;
  chatAller(V, o, chatSol(V, PORTE.x + 8, SOL_MIN + 14), function(){
    if(st.sortieId !== id || V.arrete) return;
    var d2 = V.elO[o.id];
    st.tenu = true; chatPose(V, o, 'marche');
    chatiere(V);
    if(d2) anim(d2, [{opacity:1, transform:'scale(' + d2._s + ')'}, {opacity:0, transform:'translateY(-' + Math.round(10 * V.k) + 'px) scale(' + (d2._s * 0.8) + ')'}], {duration:520, easing:'ease-in', fill:'forwards'});
    apres(V, 520, function(){ var d3 = V.elO[o.id]; if(d3) d3.classList.add('at-c-dehors'); });
    var tx = nomChat(o) + ' sort par la chatière… Il va chercher quelque chose !';
    if(V.toastEl.hidden) toast(V, '<b>🐈 🚪</b> ' + esc(tx), 3200, tx);      /* (sans cacher un message plus important) */
    /* dehors un moment, puis il revient (avec l'ingrédient dans la gueule) */
    apres(V, 6500 + Math.random() * 2500, function(){ retourChat(V, o, id); });
  });
  /* (quoi qu'il arrive en chemin, l'ingrédient arrive : on ne perd jamais rien) */
  apres(V, 22000, function(){ livrerButin(V, o); });
  return true;
}
function retourChat(V, o, id){
  var st = chatEtat(V, o), d = V.elO[o.id], t = tama(V);
  if(!V.parId[o.id]){ livrerButin(V, null); return; }
  chatiere(V);
  st.tenu = false;
  if(d){
    d.classList.remove('at-c-dehors');
    var b = t.butin && INGR[t.butin.ingr], sp = document.createElement('span');
    if(b){ sp.className = 'at-c-butin'; sp.textContent = b.ic || '🌿'; d.appendChild(sp); }
    anim(d, [{opacity:0, transform:'translateY(-' + Math.round(10 * V.k) + 'px) scale(' + (d._s * 0.8) + ')'}, {opacity:1, transform:'scale(' + d._s + ')'}], {duration:480, easing:'ease-out'});
  }
  chatPose(V, o, 'assis');
  apres(V, 500, function(){
    if(st.sortieId !== id) { livrerButin(V, o); return; }
    var pt = posTas(0, 1);
    chatAller(V, o, chatSol(V, pt.x + 90, Math.min(solMax(V), pt.y + 24)), function(){ livrerButin(V, o); chatPose(V, o, 'lave'); chatPlanifier(V, o, 3500); });
  });
}
/* Il pose l'ingrédient avec la cueillette, devant la porte */
function livrerButin(V, o){
  var t = tama(V), b = t.butin;
  if(!b) return false;
  t.butin = null;
  var I = INGR[b.ingr] || {nom:b.ingr, ic:'🌿'};
  ajouter(V.etat, b.ingr, 1);
  if(o){ var d = V.elO[o.id], sp = d && d.querySelector('.at-c-butin'); if(sp) sp.remove(); if(d) d.classList.remove('at-c-dehors'); var st = V.chats[o.id]; if(st && st.tenu && !st.depart) st.tenu = false; }
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
function svgChat(V, o){ var d = V.elO[o.id]; return d && d.querySelector('svg'); }
function animSvg(V, o, kf, opt){
  var sv = svgChat(V, o), st = chatEtat(V, o);
  if(!sv) return null;
  var fx = st.gauche ? 'scaleX(-1) ' : '';
  return anim(sv, kf.map(function(k){ var c = {}; cles(k).forEach(function(x){ c[x] = x === 'transform' ? fx + k[x] : k[x]; }); return c; }), opt);
}
function chatJoue(V, o, quoi){
  var st = chatEtat(V, o), d = V.elO[o.id];
  if(!d || st.tenu || st.depart) return null;
  if(st.anim) chatArreter(V, o);
  var l = JEUX.filter(function(j){ return j !== st.dernierJeu; });
  quoi = quoi && quoi !== st.dernierJeu ? quoi : l[Math.floor(Math.random() * l.length)];
  st.dernierJeu = quoi;
  var p = chatPos(V, o), k = V.k, fin = function(ms){ chatPlanifier(V, o, ms || 2600); };
  donner(o, 'jeu', 8);
  if(quoi === 'bondir'){
    var dir = st.gauche ? -1 : 1, c = chatSol(V, p.x + dir * 120, p.y + (Math.random() - 0.5) * 30);
    chatBouger(V, o, c, 'saute', function(){ chatPose(V, o, 'assis'); fin(); });
  } else if(quoi === 'roule'){            /* il roule sur le dos, les pattes en l'air */
    chatPose(V, o, 'dort');
    animSvg(V, o, [{transform:'rotate(0deg)'}, {transform:'translateY(-6%) rotate(-180deg)', offset:0.35}, {transform:'translateY(-6%) rotate(-180deg)', offset:0.7}, {transform:'rotate(-360deg)'}], {duration:1500, easing:'ease-in-out'});
    apres(V, 1500, function(){ chatPose(V, o, 'assis'); }); fin(2800);
  } else if(quoi === 'galipette'){        /* une galipette : il saute et fait un tour complet */
    chatPose(V, o, 'saute');
    animSvg(V, o, [{transform:'translateY(0) rotate(0deg)'}, {transform:'translateY(-45%) rotate(-180deg)', offset:0.5}, {transform:'translateY(0) rotate(-360deg)'}], {duration:820, easing:'ease-in-out'});
    apres(V, 820, function(){ chatPose(V, o, 'assis'); }); fin(2200);
  } else if(quoi === 'tape'){             /* il tape de la patte */
    chatPose(V, o, 'tape'); apres(V, 1400, function(){ chatPose(V, o, 'assis'); }); fin(2400);
  } else if(quoi === 'cache'){            /* il se cache… et surgit ! */
    chatPose(V, o, 'assis');
    animSvg(V, o, [{transform:'translateY(0) scale(1)', opacity:1}, {transform:'translateY(40%) scale(.4)', opacity:0, offset:0.3}, {transform:'translateY(40%) scale(.4)', opacity:0, offset:0.65}, {transform:'translateY(-18%) scale(1.15)', opacity:1, offset:0.82}, {transform:'translateY(0) scale(1)', opacity:1}], {duration:1900, easing:'ease-in-out'});
    fin(2800);
  } else if(quoi === 'rond'){             /* il court en rond */
    var r = 70, pts = [[r, 0], [0, r * 0.45], [-r, 0], [0, -r * 0.45], [0, 0]], i = 0;
    (function tour(){
      if(i >= pts.length || chatEtat(V, o).tenu){ chatPose(V, o, 'assis'); fin(1800); return; }
      var q = pts[i++];
      chatBouger(V, o, chatSol(V, p.x + q[0], p.y + q[1]), 'marche', tour);
    })();
  } else if(quoi === 'etire'){            /* il s'étire, tout long */
    chatPose(V, o, 'marche'); d.classList.add('at-c-fige');
    animSvg(V, o, [{transform:'scale(1,1)'}, {transform:'scale(1.22,.8)', offset:0.4}, {transform:'scale(1.22,.8)', offset:0.7}, {transform:'scale(1,1)'}], {duration:1600, easing:'ease-in-out'});
    apres(V, 1600, function(){ d.classList.remove('at-c-fige'); chatPose(V, o, 'assis'); }); fin(2600);
  } else if(quoi === 'saut'){             /* il saute en l'air, sur place */
    chatPose(V, o, 'saute');
    animSvg(V, o, [{transform:'translateY(0)'}, {transform:'translateY(-60%)', offset:0.45}, {transform:'translateY(0)'}], {duration:700, easing:'cubic-bezier(.3,0,.4,1)'});
    apres(V, 700, function(){ chatPose(V, o, 'assis'); }); fin(2000);
  } else if(quoi === 'queue'){            /* il court après sa queue */
    chatPose(V, o, 'marche'); d.classList.add('at-c-tourne');
    apres(V, 1700, function(){ d.classList.remove('at-c-tourne'); chatPose(V, o, 'assis'); }); fin(2600);
  } else {                                /* il remue les fesses… et bondit sur place */
    chatPose(V, o, 'marche'); d.classList.add('at-c-tapi', 'at-c-fesses');
    apres(V, 1100, function(){ d.classList.remove('at-c-tapi', 'at-c-fesses'); chatPose(V, o, 'saute'); animSvg(V, o, [{transform:'translateY(0)'}, {transform:'translate(14%,-30%)', offset:0.5}, {transform:'translateY(0)'}], {duration:560}); });
    apres(V, 1700, function(){ chatPose(V, o, 'assis'); }); fin(2600);
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
  /* elle traverse le plancher, à la hauteur du chat, d'un bord à l'autre (là où on le voit) */
  var y = borne(pc.y + (Math.random() < 0.5 ? -40 : 40), SOL_MIN + 30, solMax(V) - 10), versD = pc.x > 600 ? false : true;
  var x0 = versD ? Math.max(solXmin(V, y) + 20, pc.x - 520) : Math.min(solXmax(V, y) - 20, pc.x + 520), x1 = versD ? Math.min(solXmax(V, y) - 20, pc.x + 560) : Math.max(solXmin(V, y) + 20, pc.x - 560);
  var s = echelleSol(y), m = document.createElement('div'), dur = 4600;
  m.className = 'at-souris' + (versD ? '' : ' g');
  m.innerHTML = dessinSouris();
  m.style.width = 'calc(' + (40 * s).toFixed(1) + 'px * var(--k) * 1.7)';
  m.style.zIndex = Math.round((1000 + y) * 5);
  V.calque.appendChild(m);
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
    if(!st.anim){ chatPose(V, best, Math.random() < 0.5 ? 'tape' : 'saute'); if(st.pose === 'saute') animSvg(V, best, [{transform:'translateY(0)'}, {transform:'translateY(-35%)', offset:0.5}, {transform:'translateY(0)'}], {duration:480}); }
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
  var p = CHATS[(o.v || 0) % 3], el = document.createElement('div');
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
  else if(c === 'grimoire'){ if(V.elO.lu && !grimoireOuvert(V)) l = [V.elO.lu]; }   /* (le grimoire ouvert : le rond est sur ses « ? », pas sur le lutrin caché dessous) */
  else if(c === 'chaudron'){ if(V.elO.ch) l = [V.elO.ch]; }
  else if(c === 'paillasse'){ if(V.elO.pa) l = [V.elO.pa]; }
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
  if(l.length) changer(V);
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
  ov.className = 'at-mj';
  ov.innerHTML = '<div class="at-mj-cadre"></div>';
  V.root.appendChild(ov);
  /* (étape 4) le chat, dans un coin : il dresse les oreilles quand on verse le bon ingrédient (le mini-jeu n'appelle onVerse que pour le bon) */
  var oreilles = chatPotion(V, ov);
  V.verses = [];
  p.onVerse = function(ingr){ V.derniereCase = null; var o = retirerRange(V, ingr); if(o){ V.verses.push({o:o, c:V.derniereCase, ingr:ingr}); redessiner(V, o); } changer(V); if(oreilles) oreilles(); };
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
  if(!res.reussi && V.o.tutoriel) rendreVerses(V);   /* (abandon pendant le tutoriel : on rend aussi les ingrédients) */
  V.verses = [];
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
  /* la fin du message « Potion réussie : … » du moteur : où est la potion (son flacon, devant la porte) */
  OU_POTIONS:' ! Son flacon est posé par terre, devant la porte.'
};
})();
