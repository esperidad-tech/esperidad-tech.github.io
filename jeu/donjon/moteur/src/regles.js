/* regles.js — TOUT LE CALCUL du donjon du puits (Les Enquêteurs de Brumeval, enquête 3). Aucun affichage.
   Pas de DOM, pas de son, pas de minuterie : il tourne dans la page (window.Regles) et dans Node (require).
   Les tableaux sont dans donnees.js (à charger avant, dans la page). Le mode d'emploi pour l'affichage et
   l'exploration, monstre par monstre : moteur/REGLES.md. Les tests : node test-regles.js.

   =================================================================================================================
   L'API
   =================================================================================================================
   Regles.alea(graine)                  un générateur de hasard à graine : R() rend un nombre de 0 à 1 ; R.etat() sa graine
   Regles.nouvellePartie(graine)        l'état complet de la partie (MOTEUR-DONJON.md §3.5), avec la sauvegarde de départ

   LE COMBAT
   var c = Regles.combat(partie, salle[, {alea}])   un combat ; la partie n'est PAS touchée avant la victoire (sauf le Grand Livre)
   c.entree()                           les évènements du début : debut, arrive…, tour, vise…
   c.gestes(heros)                      tous ses gestes : [{geste, nom, vise, permis, mot, cibles, max}]
   c.refus(heros, geste, cible)         null, ou la raison en deux mots (« Trop loin ! »)
   c.jouer(heros, {geste, cible})       joue le geste -> une liste d'évènements (un refus : [{t:'refus', …}])
   c.aJouer()                           les héros qui peuvent encore jouer ce tour-ci ; vide : c'est aux monstres
   c.tourMonstres()                     le tour des monstres, la fin du tour, et le début du tour suivant
   c.fini()                             null | 'victoire' | 'defaite'
   c.etat()                             une photo du combat, pour l'afficher ou le réafficher
   c.fuir()                             la fuite : pareil que Regles.fuir(partie, salle)
   Regles.fuir(partie[, salle])         on repart de la dernière sauvegarde : les monstres battus depuis reviennent, tout le reste est gardé (Regles.recharger : le même)

   HORS COMBAT (chaque action rend une liste d'évènements ; un refus : [{t:'refus', mot}])
   Regles.entrer(partie, lieu)          on arrive dans un lieu : ce qui s'y passe
   Regles.contenu(partie, lieu)         ce qu'il y a à faire dans un lieu maintenant (pour afficher ou réafficher)
   Regles.bloque(partie, lieu)          null, ou ce qui empêche de traverser ce lieu : 'combat' ou 'dalles'
   Regles.prendre(partie, objet[, heros[, laisser]])    toucher un objet (2 places par héros)
   Regles.choisir(partie, objet[, laisser])             choisir un des deux objets d'un coffre
   Regles.fouiller(partie)              le tas d'os
   Regles.crane(partie)                 le crâne secret (le passage vers le feu de camp)
   Regles.roue(partie, 'd' | 'g')       la roue des canaux, un cran à droite ou à gauche (le passage secret vers la cave aux toiles)
   Regles.dalle(partie, 'fond' | 'devant')              un pas dans le couloir aux dalles
   Regles.porte(partie, 'oeil' | 'gueule' | 'lune')     la salle aux trois portes
   Regles.repos(partie)                 le feu de camp
   Regles.code(partie, id)              un code tapé (sauve:1…4, recette:givre, recette:baumelum)
   Regles.potions(partie)                               les potions de l'Alchimiste (toutes celles qu'il a créées : plus de sac à choisir)
   Regles.enMains([objets])                             les objets qui prennent une place (pas les carquois)
   Regles.sauvegarder(partie)           (appelée par le code sauve:N) ;  Regles.objets(partie) : ce que portent les héros
   Regles.exporter(partie) / Regles.importer(texte)     pour le localStorage (recharger la page n'est pas une fuite)

   =================================================================================================================
   LES ÉVÈNEMENTS — le contrat avec l'affichage. Chaque action rend une LISTE, à jouer dans l'ordre.
   « bete » est l'id d'un monstre du combat ('b1', 'b2'…) ; « heros » : 'pisteur', 'alchimiste' ou 'sage'.
   Les durées (« tours ») : 1 = jusqu'à la fin du tour des monstres de ce tour ; 2 = jusqu'à la fin du tour suivant ; 3 : un de plus ;
   'fin' = jusqu'à la fin du combat ; 'geste' = jusqu'au premier geste des héros du tour suivant. L'affichage n'a rien à compter :
   quand un état finit, les règles envoient {t:'etat', …, on:false} (et {t:'ferme'} pour un point faible).
   test-regles.js vérifie que chaque type écrit ici est envoyé, et que rien d'autre ne l'est.
   =================================================================================================================
   --- le déroulement d'un combat ---
   {t:'debut', salle:'canaux', nom:'Les canaux de la ville d\'avant', betes:[{id:'b1', type:'rat', module:'rat', nom:'Rat d\'égout', rang:'normal', pv:40, pvMax:40, position:0}, …], heros:{pisteur:{pv:120, pvMax:120, sol:false, objets:[]}, …}}
   {t:'arrive', bete:{id:'b4', type:'tetard', module:'tetard', nom:'Têtard du puits', rang:'normal', pv:15, pvMax:15, position:0}, par:'debut' | 'eclosion' | 'plongeon', de:'b3'}
                                                    position 0 = devant ; « de » : la mère (éclosion) ou Bourbe (plongeon)
   {t:'tour', n:2}                                  un nouveau tour commence : aux héros
   {t:'vise', bete:'b1', attaque:'morsure', cibles:['pisteur']}       ce que la bête prépare, et sur qui (à montrer au-dessus d'elle)
   {t:'passe', heros:'sage', mot:'Entoilé !'}       ce héros ne jouera pas ce tour-ci (il est pris dans la toile)
   {t:'refus', heros:'pisteur', geste:'dague', mot:'Trop loin !'}     rien ne s'est passé (hors combat : {t:'refus', mot:'Pas ici !'})
   {t:'fin', resultat:'victoire' | 'defaite', tours:4, heros:{pisteur:{pv:52, sol:false}, alchimiste:{…}, sage:{…}}}
   --- les gestes des héros (toujours le premier évènement de la liste rendue par jouer) ---
   {t:'tir', heros:'pisteur', bete:'b2', fleche:'normale' | 'argent' | 'lourde' | 'feu' | 'huile' | 'colle' | 'givre' | 'acide', rebond:false}
   {t:'dague', heros:'pisteur', bete:'b1'}
   {t:'potion', heros:'alchimiste', recette:'feu', bete:'b1'}         ou heros2:'sage' (Baume, Cœur vaillant), salle:true (Fumigène), equipe:true (Baume lumineux)
   {t:'louche', heros:'alchimiste', bete:'b1'}      le BONG ; bete : celle de devant, qui prend le coup (ou null) ; le bruit suit pour toutes
   {t:'herbes', heros:'alchimiste', equipe:true}             les herbes : un petit soin pour chaque héros debout (un {t:'soin'} par héros suit)
   {t:'appel', heros:'sage', bete:'b2', ordre:['b2', 'b1']}   la rune d'appel : cette bête passe devant ; ordre : les vivantes, de devant à derrière
   {t:'rune', heros:'sage', bete:'b1'}              ou salle:true avec le cristal de lune
   {t:'pose-bouclier', heros:'sage', cibles:['pisteur']}              deux cibles avec le bâton de chêne
   {t:'oeil', heros:'sage', jusque:3, plans:[{bete, dans:0|1, attaque, cibles, degats, fois, prepare, gros}]}   la rune de l'œil
   {t:'prepare', bete:'b1', attaque:'marteau'}       il prépare son coup : rien ce tour (l'état « prepare » est posé dès le début du tour)
   {t:'chatouille', heros:'pisteur', bete:'b3'}     le héros avalé chatouille Bourbe
   --- ce qui arrive aux bêtes ---
   {t:'touche', bete:'b1', coup:'lumiere', piege:false}   sa réaction : acteur.touche(coup). piege:true : ça le renforce. critique:true : c'est un critique (voir degats).
                                                         petit:true (sur touche et sur degats) : le petit critique d'une flèche sur une bête qui marche par terre.
                                                    Les coups : fleche, fleche-argent, fleche-lourde, dague, feu, lumiere, louche, colle, huile, nuage, givre,
                                                    acide, bruit, bouclier (son attaque est tombée sur un bouclier de runes), chatouille (Bourbe)
   {t:'rebond', bete:'b2', coup:'fleche'}           immunisé (ou en boule) : acteur.touche('rebond')
   {t:'special', bete:'b2', nom:'plaque-tombe'}     un moment propre à la bête : acteur.special(nom)
   {t:'etat', bete:'b1', nom:'ebloui', on:true, tours:1}              (deja:true : il l'avait déjà, il dure plus longtemps ; seul:true : Bourbe a séché tout seul)
   {t:'etat', bete:'b1', nom:'ebloui', on:false}
   {t:'ouvert', bete:'b1', par:'lumiere', tours:1}  son point faible s'ouvre : acteur.etat('ouvert', true)
   {t:'ferme', bete:'b1'}                           il se referme : acteur.etat('ouvert', false)
   {t:'degats', bete:'b1', n:60, pv:0, critique:true, surprise:false, cause:'fleche'}     n : le chiffre à montrer ; pv : ce qu'il lui reste
   {t:'gagne', bete:'b2', n:30, pv:60, pvMax:60}    il gagne des PV (le feu follet qui grandit)
   {t:'mot', bete:'b1', texte:'Il rougeoie !'}      deux mots à faire voler au-dessus de la bête
   {t:'colere', bete:'b1'}                                 un élite ou le boss se fâche (l'état « colere » vient d'être posé, jusqu'à la fin)
   {t:'mort', bete:'b1', mode:'fuit' | 'explose' | 'meurt', cause:'fleche'}    explose : le critique mortel ; cause:'chef' : son chef est tombé, il détale
   --- le tour des monstres ---
   {t:'brulure', bete:'b1', n:4, pv:12}             il brûle encore (juste avant son attaque)
   {t:'saute', bete:'b1', nom:'colle'}              il n'attaque pas ce tour-ci, à cause de cet état
   {t:'attaque', bete:'b1', nom:'morsure', cibles:['pisteur'], fois:2}     riposte:true : un piège, en plein tour des héros ; retour:true : Bourbe remonte
   {t:'degats', heros:'pisteur', n:4, pv:96, brut:8, bouclier:true, absorbe:4, bete:'b1', attaque:'morsure'}    hors combat : {t:'degats', heros, n, pv, brut, cause:'dalles'}
   {t:'pare', heros:'sage', bete:'b1', quoi:'toile'}                  le bouclier de runes arrête la toile ou la langue
   {t:'etat', heros:'sage', nom:'entoile', on:true, tours:1}          les états des héros : 'entoile' et 'bouclier'
   {t:'avale', bete:'b3', heros:'pisteur'}          Bourbe l'avale
   {t:'recrache', bete:'b3', heros:'pisteur'}       il le recrache
   {t:'tombe', heros:'pisteur'}                     il tombe au sol
   {t:'releve', heros:'pisteur', pv:40, par:'coeur' | 'amulette'}
   {t:'soin', heros:'pisteur', n:20, pv:80, par:'herbes' | 'baume' | 'baumelum' | 'repos'}
   --- le Grand Livre ---
   --- hors combat ---
   {t:'lieu', id:'reserve', nom:'La réserve'}
   {t:'combat', salle:'canaux'}                     il faut lancer ce combat : Regles.combat(partie, 'canaux')
   {t:'scene', lieu:'reserve', contenu:{…}}         ce qu'il y a à faire ici (le même objet que Regles.contenu)
   {t:'boucle', vers:'canaux'}                      les égouts tournants ramènent aux canaux
   {t:'objet', objet:'amulette', heros:'alchimiste', equipe:'amulette'}        il s'envole vers ce héros (equipe : le nom pour HerosAnime.equiper)
   {t:'or', n:25, total:25}
   {t:'code-objet', objet:'fleur-givre', code:'plante:givre', pour:'alchimiste'}   un code à montrer, pour un autre joueur (objet:null : la porte, Léo)
   {t:'plein', heros:'sage', objets:['cristal-lune', 'baton-chene'], objet:'amulette'}   ses deux places sont prises : rappeler avec « laisser »
   {t:'laisse', objet:'baton-chene', heros:'sage', lieu:'crypte'}
   {t:'coffre', lieu:'reserve', pris:'fleches-lourdes', reste:'fleches-argent'}
   {t:'fouille', n:1, trouve:'morsure' | 'page' | null}
   {t:'passage', de:'canaux', vers:'toiles'}                          le passage secret s'ouvre (la roue des canaux ; celui du crâne est enlevé)
   {t:'roue', sens:'d', cran:2, sur:6}                                 la roue des canaux tourne d'un cran (libre:true : la grille est déjà levée)
   {t:'roue-retour', crans:6}                                          le dernier cran, et l'ordre était faux : la roue revient toute seule
   {t:'dalle', pas:0, cote:'fond', sure:true, element:'dalle-6-0'}    element : l'id de la dalle dans scenes.js
   {t:'piege', quoi:'dalles', degats:15}            suivi d'un {t:'degats'} par héros
   {t:'recule', pas:0}                              on recule d'une rangée (pas : où on se retrouve)
   {t:'traverse', lieu:'dalles'}                    le couloir est passé (pour toujours ; libre:true : il l'était déjà)
   {t:'porte', signe:'oeil', vers:'ossuaire'}
   {t:'repos'}                                      le feu de camp : suivi d'un {t:'soin', par:'repos'} par héros
   {t:'recette', id:'givre', nom:'Givre'}           une recette de plus est connue
   {t:'sauvegarde', code:'sauve:1', lieu:'toiles'}
   {t:'recharge', lieu:'puits', salle:'canaux', fuites:1, revenus:['rats']}   après une fuite ou une défaite ; revenus : les salles dont les monstres sont revenus
   {t:'fin-donjon'}
   ================================================================================================================= */
(function(global){
'use strict';
var NODE = typeof module !== 'undefined' && module.exports;
var D = NODE ? require('./donnees.js') : global.DonjonDonnees;
var C = D.CHIFFRES, MOTS = D.MOTS;
var FIN = 9999;       /* une durée « jusqu'à la fin du combat » */
var GESTE = -1;       /* une durée « jusqu'au premier geste des héros du tour suivant » */

/* ======================================================================= le hasard à graine */
function alea(graine){
  var a = (graine | 0) || 1;
  function R(){
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  R.etat = function(){ return a >>> 0; };
  return R;
}
function copie(o){ return JSON.parse(JSON.stringify(o)); }
function refus(mot, plus){ var e = {t:'refus', mot:mot}; if(plus) for(var k in plus) e[k] = plus[k]; return [e]; }
function duree(d){ return d === 'fin' ? FIN : d === 'geste' ? GESTE : d; }
function dureeDite(d){ return d === FIN ? 'fin' : d === GESTE ? 'geste' : d; }

/* ======================================================================= la partie */
function nouvellePartie(graine){
  var p = {
    v:1, graine:(graine >>> 0) || 12345,
    lieu:'puits', vus:{puits:1},
    faits:{},
    heros:{},
    recettes:D.RECETTES_DEPART.slice(),          /* les potions que l'Alchimiste a su créer : il les a toutes avec lui */
    livre:{},
    codes:{},
    or:0, repos:false,
    fuites:{},
    sauvegarde:null
  };
  D.EXPOSES.forEach(function(h){ p.heros[h] = {pv:D.HEROS[h].pv, pvMax:D.HEROS[h].pv, sol:false, objets:(D.HEROS[h].objets || []).slice()}; });
  sauvegarder(p);                    /* la sauvegarde de départ, au fond du puits */
  return p;
}
/* la copie de l'état, sans ce qui ne dépend pas des sauvegardes (le Grand Livre, le compte des fuites) */
function sauvegarder(p){
  var s = {};
  Object.keys(p).forEach(function(k){ if(k !== 'sauvegarde' && k !== 'livre' && k !== 'fuites') s[k] = copie(p[k]); });
  p.sauvegarde = s;
  return s;
}
function enCombat(p){ return !!(p._combat && !p._combat.fini()); }
function poserCombat(p, c){ try{ Object.defineProperty(p, '_combat', {value:c, writable:true, configurable:true, enumerable:false}); }catch(e){ p._combat = c; } }
function exporter(p){ return JSON.stringify(p); }
function importer(txt){
  try{
    var p = typeof txt === 'string' ? JSON.parse(txt) : copie(txt);
    if(!p || p.v !== 1 || !p.heros || !p.heros.pisteur) return null;
    if(!p.fuites) p.fuites = {};
    if(!p.livre) p.livre = {};
    /* une partie d'avant le passage secret des canaux, déjà allée plus loin : son passage est ouvert */
    if(p.vus && (p.vus.toiles || p.faits['combat:toiles'])) p.faits[D.ROUE.ouvre] = 1;
    /* une partie d'avant le 10 novembre au soir : plus de sac ni de sacoche, et le Pisteur porte tous ses carquois */
    delete p.sac; delete p.faits['sac:ouvert']; delete p.faits['pose:fleches-normales'];
    D.EXPOSES.forEach(function(h){ if(p.heros[h]) p.heros[h].objets = (p.heros[h].objets || []).filter(function(o){ return !!D.OBJETS[o]; }); });
    if(p.heros.pisteur.objets.indexOf('fleches-normales') < 0) p.heros.pisteur.objets.unshift('fleches-normales');
    if(!p.recettes || !p.recettes.length) p.recettes = D.RECETTES_DEPART.slice();
    if(!p.sauvegarde) sauvegarder(p);
    else if(p.sauvegarde.heros) D.EXPOSES.forEach(function(h){ var a = p.sauvegarde.heros[h]; if(a && a.objets) a.objets = a.objets.filter(function(o){ return !!D.OBJETS[o]; }); });
    return p;
  }catch(e){ return null; }
}
/* les potions de l'Alchimiste, dans l'ordre de l'étagère */
function potions(p){ return D.ORDRE_RECETTES.filter(function(r){ return (p.recettes || []).indexOf(r) >= 0; }); }
/* les objets qui prennent une place dans les mains (les carquois n'en prennent pas : le Pisteur les porte tous) */
/* (un carquois et une arme ne prennent pas de place : on les porte tous, et on choisit en combat) */
function sansPlace(o){ return !!(D.OBJETS[o] && (D.OBJETS[o].carquois || D.OBJETS[o].arme)); }
function enMains(l){ return (l || []).filter(function(o){ return !sansPlace(o); }); }

/* les monstres rencontrés : p.livre[monstre] = 0. Romain, 11 novembre : plus d'« étude » dans le donjon. Le carnet d'un
   aventurier, ramassé à l'entrée, donne toutes les pages au Sage ; en combat, sa rune de l'œil dit qui sera frappé, et de
   combien. (La simulation met p.livre[monstre] au-dessus de 0 pour dire « l'équipe sait tout de ce monstre ».) */
function rencontrer(p, type){ var cle = (D.MONSTRES[type] && D.MONSTRES[type].livre) || type; if(p.livre[cle] === undefined) p.livre[cle] = 0; }
/* ======================================================================= la fuite, la défaite
   Romain, 10 novembre (17 h 47 et 17 h 56) : « quand on doit refaire le donjon, c'est juste les ennemis qu'on doit refaire,
   pas la recherche d'objets. Il n'y a que les monstres qui reviennent en vie, comme à la sauvegarde. »
   On repart donc de l'endroit de la dernière sauvegarde, avec les points de vie de ce moment-là, et les monstres battus
   DEPUIS sont revenus. Tout le reste est gardé : les objets, les coffres, l'or, les pièges passés, les passages ouverts,
   la brume levée, les codes, les recettes, le journal. */
function fuir(p, salle){
  var c = p._combat, ev = [];
  if(!salle && c) salle = c.salle;
  if(c){ c.resultat = c.resultat || 'fuite'; poserCombat(p, null); }
  var livre = p.livre, fuites = p.fuites = p.fuites || {}, s = p.sauvegarde, g = p.graine, revenus = [];
  if(salle){
    fuites[salle] = (fuites[salle] || 0) + 1;
  }
  /* les monstres battus depuis la sauvegarde reviennent */
  Object.keys(p.faits).forEach(function(k){
    if(k.indexOf('combat:') === 0 && !s.faits[k]){ delete p.faits[k]; revenus.push(k.slice(7)); }
  });
  /* l'amulette qui a servi dans un de ces combats-là est rendue à celui qui la portait (s'il a encore une place, sinon elle l'attend ici) */
  var am = p.faits['amulette:utilisee'];
  if(am && !s.faits['amulette:utilisee']){
    delete p.faits['amulette:utilisee'];
    var qui = String(am).split('|')[1], H = p.heros[qui];
    if(H && enMains(H.objets).length < C.places && H.objets.indexOf('amulette') < 0) H.objets.push('amulette');
    else { delete p.faits['objet:amulette']; p.faits['pose:amulette'] = s.lieu; }
  }
  /* on repart de l'endroit de la sauvegarde, avec les points de vie de ce moment-là */
  p.lieu = s.lieu; p.vus[s.lieu] = 1;
  if(s.vus && s.vus['@de'] !== undefined) p.vus['@de'] = s.vus['@de']; else delete p.vus['@de'];
  D.EXPOSES.forEach(function(h){ var a = s.heros[h], b = p.heros[h]; if(a && b){ b.pv = a.pv; b.pvMax = a.pvMax; b.sol = !!a.sol; } });
  p.repos = !!s.repos;
  p.graine = (Math.imul(g ^ 0x9E3779B9, 0x85EBCA6B) >>> 0) || 1;    /* le hasard ne se répète pas d'un essai à l'autre */
  ev.unshift({t:'recharge', lieu:p.lieu, salle:salle || null, fuites:salle ? fuites[salle] : 0, revenus:revenus});
  return ev;
}

/* ======================================================================= LE COMBAT */
function Combat(p, salle, o){
  o = o || {};
  var def = D.COMBATS[salle], self = this;
  if(!def) throw new Error('Regles.combat : salle inconnue « ' + salle + ' »');
  this.p = p; this.salle = salle; this.nom = def.nom;
  this._graineDeLaPartie = !o.alea;
  this.R = o.alea || alea(p.graine);
  this.tour = 0; this.resultat = null; this.num = 0;
  this.sac = potions(p);                     /* toutes les potions créées (plus de sac à choisir) */
  this.h = {};
  D.EXPOSES.forEach(function(h){
    var H = p.heros[h];
    self.h[h] = {pv:H.pv, pvMax:H.pvMax, sol:!!H.sol || H.pv <= 0, joue:false, bouclier:false, entoile:false, avale:null, objets:H.objets.slice()};
  });
  this.amulette = false;                 /* l'amulette a servi pendant ce combat */
  this.vu = 0;                           /* la rune de l'œil : jusqu'à quel tour le Sage voit ce que préparent les monstres */
  this.b = [];
  this._ev = [];
  this._ev.push({t:'debut', salle:salle, nom:def.nom, betes:[], heros:this._photoHeros()});
  def.monstres.forEach(function(type){ var m = self._creer(type); self.b.push(m); });
  this.b.forEach(function(m){ rencontrer(p, m.type); });
  this.b.forEach(function(m, i){ var r = self._resume(m, i); self._ev[0].betes.push(r); self._ev.push({t:'arrive', bete:r, par:'debut'}); });
  poserCombat(p, this);
  this._nouveauTour(this._ev);
}
var P = Combat.prototype;

P._creer = function(type){
  var def = D.MONSTRES[type];
  return {id:'b' + (++this.num), type:type, def:def, pv:def.pv, pvMax:def.pv, mort:false, e:{}, ouvert:0, par:null, plan:null, suite:null, nAtt:0, c:{}};
};
P._resume = function(m, pos){ return {id:m.id, type:m.type, module:m.def.module, nom:m.def.nom, rang:m.def.rang, pv:m.pv, pvMax:m.pvMax, position:pos == null ? this.b.indexOf(m) : pos}; };
P._photoHeros = function(){
  var o = {}, self = this;
  D.EXPOSES.forEach(function(h){ var H = self.h[h]; o[h] = {pv:H.pv, pvMax:H.pvMax, sol:H.sol, objets:H.objets.slice()}; });
  return o;
};
P._sauveGraine = function(){ if(this._graineDeLaPartie) this.p.graine = this.R.etat(); };

/* ---------- qui est là ---------- */
P.bete = function(id){ if(id && typeof id === 'object') id = id.id; for(var i = 0; i < this.b.length; i++) if(this.b[i].id === id) return this.b[i]; return null; };
P.vivants = function(){ return this.b.filter(function(m){ return !m.mort; }); };
P.a = function(m, nom){ return nom === 'ouvert' ? m.ouvert !== 0 : m.e[nom] !== undefined; };
P._un = function(m, liste){ var self = this; return !!liste && liste.some(function(n){ return self.a(m, n); }); };
P.cache = function(m){ return this._un(m, m.def.cache); };                         /* on ne peut pas le viser */
P.ciblables = function(){ var self = this; return this.vivants().filter(function(m){ return !self.cache(m); }); };
P.devant = function(){ return this.ciblables()[0] || null; };                      /* la bête de devant */
/* LA DAGUE NE TOUCHE PAS CE QUI EST EN L'AIR (Romain, 11 novembre, 19 h 21 : « avec la dague, on ne peut pas toucher ceux
   qui volent, ceux qui sont en l'air »). def.dague = {si:[états]} : ce monstre vole, pend à son fil ou reste dans l'eau ;
   la dague ne l'atteint que dans ces états-là (tombé au sol, sur le dos, accroché à un bouclier, sorti de l'eau).
   « Celui de devant », pour la dague, c'est donc le premier monstre AU SOL de la file. */
P.auSol = function(m){ return !m.def.dague || this._un(m, m.def.dague.si); };
P.devantSol = function(){ var self = this; return this.ciblables().filter(function(m){ return self.auSol(m); })[0] || null; };
/* à portée de dague : le premier monstre au sol, et ceux qui sont tombés (où qu'ils soient dans la file) */
P.aPortee = function(){ var self = this, d = this.devantSol(); return this.ciblables().filter(function(m){ return m === d || (self.auSol(m) && self._un(m, m.def.tombe)); }); };
/* ceux que la rune d'appel peut amener devant : ils sont au sol, on peut les viser, et ils ne sont pas déjà devant */
P.appelables = function(){ var self = this, d = this.devantSol(); return this.ciblables().filter(function(m){ return m !== d && self.auSol(m); }); };
/* pourquoi la dague ne peut rien : « Trop haut ! » (tout vole ou pend), « Dans l'eau ! » (Bourbe) */
P._motDague = function(){ var c = this.ciblables(); if(!c.length) return this._motCache(); var d = c[c.length - 1].def.dague; return MOTS[(d && d.mot) || 'haut']; };
P.debout = function(){ var self = this; return D.ORDRE.filter(function(h){ return !self.h[h].sol; }); };
P.visables = function(){ var self = this; return D.ORDRE.filter(function(h){ return !self.h[h].sol && !self.h[h].avale; }); };
P.porte = function(h, objet){ return this.h[h].objets.indexOf(objet) >= 0; };
/* les carquois spéciaux du Pisteur (ses flèches normales, il les a toujours) */
P._carquoisPortes = function(){ return this.h.pisteur.objets.filter(function(o){ return D.OBJETS[o] && D.OBJETS[o].fleche; }); };
function ids(l){ return l.map(function(m){ return m.id; }); }
P.gestes = function(h){
  var self = this, H = this.h[h], l = [];
  if(this.resultat || !H || H.sol || H.joue || H.entoile) return l;
  if(H.avale) return [{geste:'chatouiller', nom:D.GESTES.chatouiller.nom, vise:'salle', permis:true, mot:null, cibles:[], max:0}];
  var cib = ids(this.ciblables()), amis = this.visables(), auSol = D.ORDRE.filter(function(x){ return self.h[x].sol; });
  function g(geste, nom, vise, cibles, permis, mot, max){ l.push({geste:geste, nom:nom, vise:vise, permis:permis, mot:permis ? null : mot, cibles:cibles, max:max == null ? (vise === 'salle' || vise === 'equipe' ? 0 : 1) : max}); }
  /* les armes que ce héros porte et qui changent ce geste : une carte de plus par arme (« a:<objet> ») */
  function armes(base, fn){ H.objets.forEach(function(o){ var O = D.OBJETS[o]; if(O && O.arme && O.carte && O.carte.base === base) fn('a:' + o, O); }); }
  D.HEROS[h].gestes.forEach(function(id){
    var G = D.GESTES[id];
    if(id === 'fleche'){
      g(id, G.nom, 'bete', cib, cib.length > 0, self._motCache());
      /* une carte par carquois spécial : le Pisteur choisit la flèche qu'il tire (« f:<objet> ») */
      if(h === 'pisteur') self._carquoisPortes().forEach(function(o){ g('f:' + o, D.OBJETS[o].court || D.OBJETS[o].nom, 'bete', cib, cib.length > 0, self._motCache()); });
    }
    else if(id === 'dague'){ var p = ids(self.aPortee()); g(id, G.nom, 'devant', p, p.length > 0, self._motDague()); }
    else if(id === 'oeil'){        /* la rune de l'œil : une fois lancée, elle dure tout le combat (« Il voit tout ») */
      var deja = self.vu >= self.tour;
      g(id, G.nom, 'salle', [], !deja && self.vivants().length > 0, deja ? MOTS.vu : MOTS.fini);
    }
    else if(id === 'rune'){
      g(id, G.nom, 'bete', cib, cib.length > 0, self._motCache());
      armes(id, function(a, O){ g(a, G.nom, 'salle', [], true, null); });               /* avec le bâton de lune (le cristal) : toute la salle */
    }
    else if(id === 'bouclier'){
      g(id, G.nom, 'heros', amis, amis.length > 0, MOTS.personne, 1);
      armes(id, function(a, O){ g(a, G.nom, 'heros', amis, amis.length > 0, MOTS.personne, O.carte.max || 1); });      /* avec le bâton de chêne : deux amis */
    }
    else if(id === 'appel'){       /* la rune d'appel : un monstre qui marche par terre, et qui n'est pas déjà devant */
      var loin = ids(self.appelables()), parTerre = self.ciblables().some(function(x){ return self.auSol(x); });
      g(id, G.nom, 'bete', loin, loin.length > 0, parTerre ? MOTS.devant : cib.length ? MOTS.pasLui : self._motCache());
    }
    else if(id === 'louche') g(id, G.nom, 'salle', [], true, null);
    else if(id === 'herbes') g(id, G.nom, 'equipe', [], amis.length > 0, MOTS.personne);
  });
  if(D.HEROS[h].sac) this.sac.forEach(function(rid){
    var r = D.RECETTES[rid], geste = 'p:' + rid;
    if(h === 'pisteur'){
      if(!r.fleche) g(geste, r.nom, 'bete', [], false, MOTS.impossible);
      else g(geste, r.nom, 'bete', cib, cib.length > 0, self._motCache());
    }
    else if(r.vise === 'bete'){
      /* l'huile se lance aussi sur un ami pris dans une toile : elle le libère (r.libere) */
      var pris = r.libere ? D.ORDRE.filter(function(x){ return self.h[x][r.libere] && !self.h[x].sol; }) : [];
      g(geste, r.nom, 'bete', cib.concat(pris), cib.length + pris.length > 0, self._motCache());
      if(pris.length) l[l.length - 1].amis = pris;
    }
    else if(r.vise === 'heros') g(geste, r.nom, 'heros', amis, amis.length > 0, MOTS.personne);
    else if(r.vise === 'sol') g(geste, r.nom, 'sol', auSol, auSol.length > 0, MOTS.personne);
    else g(geste, r.nom, r.vise, [], true, null);            /* salle, equipe */
  });
  return l;
};
P._motCache = function(){
  var v = this.vivants();
  for(var i = 0; i < v.length; i++) if(this.cache(v[i])) return v[i].e.sous !== undefined ? MOTS.eau : MOTS.haut;
  return MOTS.fini;
};
P.aJouer = function(){
  var self = this;
  if(this.resultat) return [];
  return D.ORDRE.filter(function(h){ return self.gestes(h).some(function(g){ return g.permis; }); });
};
P.refus = function(h, geste, cible){
  var H = this.h[h];
  if(this.resultat) return MOTS.fini;
  if(!H) return MOTS.impossible;
  if(H.sol) return MOTS.sol;
  if(H.joue) return MOTS.joue;
  if(H.entoile) return MOTS.entoile;
  if(H.avale && geste !== 'chatouiller') return MOTS.avale;
  var l = this.gestes(h), g = null;
  for(var i = 0; i < l.length; i++) if(l[i].geste === geste) g = l[i];
  if(!g) return geste && (geste.indexOf('p:') === 0 && D.RECETTES[geste.slice(2)] || geste.indexOf('f:') === 0 && D.OBJETS[geste.slice(2)]) ? (D.HEROS[h].sac ? MOTS.absent : MOTS.impossible) : geste && geste.indexOf('a:') === 0 && D.OBJETS[geste.slice(2)] ? MOTS.absent : MOTS.impossible;
  if(!g.permis) return g.mot;
  if(g.vise === 'salle' || g.vise === 'equipe') return null;
  var c = Array.isArray(cible) ? cible : [cible];
  c = c.map(function(x){ return x && typeof x === 'object' ? x.id : x; });
  if(!c.length || c[0] == null) return MOTS.cible;
  if(c.length > g.max) return MOTS.seul;
  if(g.amis && c.length === 1 && g.amis.indexOf(c[0]) >= 0) return null;         /* l'huile sur un ami entoilé */
  for(var k = 0; k < c.length; k++){
    if(g.cibles.indexOf(c[k]) >= 0) continue;
    if(g.vise === 'heros') return this.h[c[k]] && this.h[c[k]].avale ? MOTS.avale : MOTS.sol;
    if(g.vise === 'sol') return MOTS.debout;
    var m = this.bete(c[k]);
    if(!m || m.mort) return MOTS.fini;
    if(this.cache(m)) return m.e.sous !== undefined ? MOTS.eau : MOTS.haut;
    if(geste === 'appel') return m === this.devantSol() ? MOTS.devant : MOTS.pasLui;       /* déjà devant, ou il vole, pend ou nage */
    if(geste === 'dague' && !this.auSol(m)) return MOTS[m.def.dague.mot || 'haut'];        /* il vole, il pend, il est dans l'eau */
    return MOTS.loin;
  }
  return null;
};

/* ---------- les états des bêtes ---------- */
P._etat = function(ev, m, nom, d){
  d = duree(d);
  var avant = m.e[nom], muet = nom.charAt(0) === '_';        /* un nom qui commence par _ : une note des règles, rien à montrer */
  if(avant === undefined){ m.e[nom] = d; if(!muet) ev.push({t:'etat', bete:m.id, nom:nom, on:true, tours:dureeDite(d)}); }
  else if(avant !== FIN && (d === FIN || d > avant)){ m.e[nom] = d; if(!muet) ev.push({t:'etat', bete:m.id, nom:nom, on:true, tours:dureeDite(d), deja:true}); }
};
P._retire = function(ev, m, nom){ if(m.e[nom] !== undefined){ delete m.e[nom]; if(nom.charAt(0) !== '_') ev.push({t:'etat', bete:m.id, nom:nom, on:false}); } };
P._ouvre = function(ev, m, d, par){
  d = duree(d);
  if(m.ouvert === 0){ m.ouvert = d; m.par = par || null; ev.push({t:'ouvert', bete:m.id, par:par || null, tours:dureeDite(d)}); }
  else if(m.ouvert !== FIN && (d === FIN || d > m.ouvert)){ m.ouvert = d; ev.push({t:'ouvert', bete:m.id, par:par || null, tours:dureeDite(d), deja:true}); }
};
P._ferme = function(ev, m){ if(m.ouvert !== 0){ m.ouvert = 0; m.par = null; ev.push({t:'ferme', bete:m.id}); } };
P._immunise = function(m){ return m.def.rang !== 'normal' && m.ouvert === 0; };
P._ferm = function(m, coup){ var f = m.def.ferme; return f && f[coup] != null ? f[coup] : C.ferme[coup] || 0; };
P._regle = function(m, coup){
  var l = m.def.reactions && m.def.reactions[coup];
  if(!l) return null;
  for(var i = 0; i < l.length; i++){
    var si = l[i].si, self = this, ok = true;
    if(si){
      if(si.avec && !si.avec.every(function(n){ return self.a(m, n); })) ok = false;
      if(si.sans && si.sans.some(function(n){ return self.a(m, n); })) ok = false;
      if(si.un && !si.un.some(function(n){ return self.a(m, n); })) ok = false;
    }
    if(ok) return l[i];
  }
  return null;
};

/* ---------- les dégâts sur une bête ---------- */
P._blesse = function(ev, m, n, info){
  info = info || {};
  m.pv = Math.max(0, m.pv - n);
  var e = {t:'degats', bete:m.id, n:n, pv:m.pv, critique:!!info.critique, surprise:!!info.surprise, cause:info.cause || null};
  if(info.petit) e.petit = true;               /* le petit critique d'une flèche sur une bête qui marche par terre */
  ev.push(e);
  if(m.pv <= 0) this._tue(ev, m, info.critique && !info.petit ? 'explose' : m.def.fin, info.cause);
  else this._colere(ev, m);
};
/* LA COLÈRE (Romain, 11 novembre, 13 h 53) : les élites et le boss « se fâchent ». colere:{si:'mi-vie'} : quand il n'a plus
   que la moitié de sa vie ; colere:{si:'seul'} : quand il n'a plus personne avec lui (le Roi des rats sans ses sbires).
   L'état « colere » dure jusqu'à la fin : ses attaques le lisent (doubleSi, foisSi, plusSi dans D.MONSTRES). */
/* (appelée après chaque blessure et chaque mort) */
P._colere = function(ev, m){
  var K = m.def.colere;
  if(!K || m.mort || this.a(m, 'colere')) return;
  if(K.si === 'seul' ? this.vivants().length > 1 : m.pv > m.pvMax / 2) return;
  m.e.colere = FIN;
  ev.push({t:'etat', bete:m.id, nom:'colere', on:true, tours:'fin'});
  ev.push({t:'colere', bete:m.id});
  /* sa « phase 2 » : ce qu'il fait en se fâchant (reactions.colere dans D.MONSTRES — Bourbe plonge chercher ses têtards) */
  var r = this._regle(m, 'colere');
  if(r && r.fait) this._faire(ev, m, r.fait, null);
};
P._tue = function(ev, m, mode, cause){
  var self = this;
  m.mort = true; m.ouvert = 0; m.e = {}; m.plan = null;
  ev.push({t:'mort', bete:m.id, mode:mode, cause:cause || null});
  D.ORDRE.forEach(function(h){ if(self.h[h].avale === m.id){ self.h[h].avale = null; ev.push({t:'recrache', bete:m.id, heros:h}); } });
  /* le chef est tombé : ses petits détalent */
  if(m.def.chef) this.vivants().forEach(function(x){ x.mort = true; x.ouvert = 0; x.e = {}; ev.push({t:'mort', bete:x.id, mode:'fuit', cause:'chef'}); });
  this.vivants().forEach(function(x){ self._colere(ev, x); });          /* celui qui reste seul peut se fâcher */
};

/* ---------- un pouvoir arrive sur une bête : sa règle, ou la réaction ordinaire ---------- */
P._pouvoir = function(ev, m, coup, src){
  if(m.mort) return;
  if(this._un(m, m.def.blinde)){ ev.push({t:'rebond', bete:m.id, coup:coup}); return; }
  var r = this._regle(m, coup);
  if(!r || (!r.fait && r.defaut)){ this._ordinaire(ev, m, coup, src, false); return; }
  ev.push({t:'touche', bete:m.id, coup:coup, piege:!!r.piege});
  if(r.piege) this.pieges = (this.pieges || 0) + 1;
  if(r.fait) this._faire(ev, m, r.fait, src);
  if(r.defaut && !m.mort) this._ordinaire(ev, m, coup, src, true);
};
P._ordinaire = function(ev, m, coup, src, sansTouche){
  var imm = this._immunise(m), n;
  function touche(){ if(!sansTouche) ev.push({t:'touche', bete:m.id, coup:coup, piege:false}); }
  if(coup === 'feu' || coup === 'acide' || coup === 'louche'){
    if(imm){ if(!sansTouche) ev.push({t:'rebond', bete:m.id, coup:coup}); return; }
    n = m.ouvert !== 0 ? C.ouvert[coup] : this._ferm(m, coup);
    touche();
    if(coup === 'feu' && (n > 0 || m.ouvert !== 0)) this._etat(ev, m, 'brule', 'fin');
    if(n > 0) this._blesse(ev, m, n, {cause:coup});
    return;
  }
  if(coup === 'colle' || coup === 'givre'){
    touche();
    if(m.def.rang !== 'normal'){ ev.push({t:'mot', bete:m.id, texte:MOTS.tropFort}); return; }
    this._etat(ev, m, coup === 'colle' ? 'colle' : 'gele', 1);
    return;
  }
  touche();          /* lumière, bruit, nuage, huile… : rien de plus (dans le nuage, il tousse) */
};
P._faire = function(ev, m, fait, src){
  var self = this;
  fait.forEach(function(f){
    if(m.mort && f[0] !== 'mot') return;
    switch(f[0]){
      case 'etat': self._etat(ev, m, f[1], f[2]); break;
      case 'retire': self._retire(ev, m, f[1]); break;
      case 'ouvre': self._ouvre(ev, m, f[1], f[2]); break;
      case 'ferme': self._ferme(ev, m); break;
      case 'special': ev.push({t:'special', bete:m.id, nom:f[1]}); break;
      case 'mot': ev.push({t:'mot', bete:m.id, texte:f[1]}); break;
      case 'gagne': m.pv += f[1]; m.pvMax += f[1]; ev.push({t:'gagne', bete:m.id, n:f[1], pv:m.pv, pvMax:m.pvMax}); break;
      case 'naissent': self._naissent(ev, m, f[1], f[2], 'eclosion'); break;
      case 'riposte':
        var h = f[2] === 'auteur' ? (src && src.heros) : f[2];
        if(!h || self.h[h].sol || self.h[h].avale) h = D.EXPOSES.filter(function(x){ return !self.h[x].sol && !self.h[x].avale; })[0];
        if(h){ ev.push({t:'attaque', bete:m.id, nom:f[1], cibles:[h], fois:1, riposte:true}); self._frappe(ev, h, m.def.attaques[f[1]].degats, m, f[1], m.def.attaques[f[1]]); }
        break;
    }
  });
};
/* des petites bêtes arrivent DEVANT (elles protègent les autres de la dague et de la louche) */
P._naissent = function(ev, mere, type, n, par){
  for(var i = 0; i < n; i++){
    var m = this._creer(type);
    rencontrer(this.p, type);
    this.b.splice(i, 0, m);
    ev.push({t:'arrive', bete:this._resume(m, i), par:par, de:mere.id});
  }
};

/* ---------- le critique du Pisteur ---------- */
/* combien ferait un critique sur cette bête : la dague fait les gros dégâts ; l'arc aussi sur ce qui est en hauteur (vole,
   pend à un fil, nage), mais quatre fois moins sur ce qui marche par terre. bonus : le multiplicateur d'une flèche spéciale
   sur le monstre pour lequel elle est faite (elle frappe alors comme en hauteur). */
P.critiqueDe = function(m, arme, bonus){
  var T = C.critique[m.def.rang], base = arme !== 'fleche' ? T[arme] : (m.def.hauteur || bonus) ? T.fleche : T.sol;
  return Math.round(base * (bonus ? bonus : 1));
};
P._critique = function(ev, m, arme, coup, bonus, surprise){
  var n = this.critiqueDe(m, arme, bonus), petit = arme === 'fleche' && !m.def.hauteur && !bonus, et = {t:'touche', bete:m.id, coup:coup, piege:false, critique:true};
  if(petit) et.petit = true;                   /* (le petit critique : l'écran le montre comme un coup ordinaire, sans le grand spectacle) */
  ev.push(et);
  this._blesse(ev, m, n, {critique:true, surprise:!!surprise, cause:arme, petit:petit});
};

/* ---------- JOUER un geste ---------- */
P.jouer = function(h, a){
  a = a || {};
  var geste = a.geste, cible = a.cible, r = this.refus(h, geste, cible), ev = [], self = this;
  if(r) return [{t:'refus', heros:h, geste:geste, mot:r}];
  /* ce qui ne dure que jusqu'au premier geste du tour (le Roi des rats étalé) */
  var fugaces = [];
  this.vivants().forEach(function(m){ for(var n in m.e) if(m.e[n] === GESTE) fugaces.push([m, n]); });
  var cibles = (Array.isArray(cible) ? cible : [cible]).map(function(x){ return x && typeof x === 'object' ? x.id : x; });
  var m = this.bete(cibles[0]), H = this.h[h];

  if(geste === 'oeil') this._oeil(ev, h);
  else if(geste === 'rune'){ ev.push({t:'rune', heros:h, bete:m.id}); this._pouvoir(ev, m, 'lumiere', {heros:h}); }
  else if(geste === 'a:cristal-lune'){
    ev.push({t:'rune', heros:h, salle:true});
    this.vivants().forEach(function(x){ self._pouvoir(ev, x, 'lumiere', {heros:h}); });
  }
  else if(geste === 'appel'){
    /* le monstre appelé passe devant tous les autres (il devient celui que la dague et la louche touchent) */
    var premier = this.b.indexOf(this.vivants()[0]);
    this.b.splice(this.b.indexOf(m), 1); this.b.splice(premier, 0, m);
    ev.push({t:'appel', heros:h, bete:m.id, ordre:ids(this.vivants())});
  }
  else if(geste === 'bouclier' || geste === 'a:baton-chene'){
    ev.push({t:'pose-bouclier', heros:h, cibles:cibles.slice()});
    cibles.forEach(function(x){ self.h[x].bouclier = true; ev.push({t:'etat', heros:x, nom:'bouclier', on:true, tours:1}); });
  }
  else if(geste === 'louche'){
    /* le BONG : la bête de devant prend le coup, puis le bruit court dans toute la salle */
    var d = this.devant();
    ev.push({t:'louche', heros:h, bete:d ? d.id : null});
    if(d) this._pouvoir(ev, d, 'louche', {heros:h});
    this.vivants().forEach(function(x){ self._pouvoir(ev, x, 'bruit', {heros:h}); });
  }
  else if(geste === 'herbes'){
    /* les herbes : un petit soin pour chaque héros debout (le baume, lui, soigne beaucoup un seul ami) */
    ev.push({t:'herbes', heros:h, equipe:true});
    this.visables().forEach(function(x){ self._soin(ev, x, C.herbes, 'herbes'); });
  }
  else if(geste === 'fleche') this._fleche(ev, m, null, null);
  else if(geste.indexOf('f:') === 0) this._fleche(ev, m, null, D.OBJETS[geste.slice(2)]);
  else if(geste === 'dague'){
    ev.push({t:'dague', heros:h, bete:m.id});
    if(this._un(m, m.def.blinde)) ev.push({t:'rebond', bete:m.id, coup:'dague'});
    else if(m.ouvert !== 0) this._critique(ev, m, 'dague', 'dague', 0, false);
    else if(this._immunise(m)) ev.push({t:'rebond', bete:m.id, coup:'dague'});
    else { var nd = this._ferm(m, 'dague'); ev.push({t:'touche', bete:m.id, coup:'dague', piege:false}); if(nd > 0) this._blesse(ev, m, nd, {cause:'dague'}); }
  }
  else if(geste === 'chatouiller'){
    var b = this.bete(H.avale);
    ev.push({t:'chatouille', heros:h, bete:b.id});
    this._pouvoir(ev, b, 'chatouille', {heros:h});
    if(H.avale){ H.avale = null; ev.push({t:'recrache', bete:b.id, heros:h}); }
  }
  else {                                   /* une recette du sac */
    var rid = geste.slice(2), rec = D.RECETTES[rid];
    if(h === 'pisteur') this._fleche(ev, m, rid, null);
    else if(rec.libere && D.ORDRE.indexOf(cibles[0]) >= 0){        /* sur un ami pris dans une toile : il est libre, et peut jouer ce tour */
      ev.push({t:'potion', heros:h, recette:rid, heros2:cibles[0]});
      this.h[cibles[0]][rec.libere] = false;
      ev.push({t:'etat', heros:cibles[0], nom:rec.libere, on:false, par:rid});
    }
    else if(rec.soin){ ev.push({t:'potion', heros:h, recette:rid, heros2:cibles[0]}); this._soin(ev, cibles[0], rec.soin, rid); }
    else if(rec.releve){
      var S = this.h[cibles[0]];
      ev.push({t:'potion', heros:h, recette:rid, heros2:cibles[0]});
      S.sol = false; S.pv = rec.releve; S.entoile = false;
      ev.push({t:'releve', heros:cibles[0], pv:S.pv, par:rid});
    }
    else if(rec.soinEquipe){
      ev.push({t:'potion', heros:h, recette:rid, equipe:true});
      this.visables().forEach(function(x){ self._soin(ev, x, rec.soinEquipe, rid); });
    }
    else if(rec.vise === 'salle'){
      ev.push({t:'potion', heros:h, recette:rid, salle:true});
      this.vivants().forEach(function(x){ self._pouvoir(ev, x, rec.pouvoir, {heros:h}); });
    }
    else { ev.push({t:'potion', heros:h, recette:rid, bete:m.id}); this._pouvoir(ev, m, rec.pouvoir, {heros:h}); }
  }
  H.joue = true;
  fugaces.forEach(function(f){ if(!f[0].mort && f[0].e[f[1]] === GESTE) self._retire(ev, f[0], f[1]); });
  this._bilan(ev);
  this._sauveGraine();
  return ev;
};
P._soin = function(ev, h, n, par){
  var S = this.h[h], avant = S.pv;
  S.pv = Math.min(S.pvMax, S.pv + n);
  ev.push({t:'soin', heros:h, n:S.pv - avant, pv:S.pv, par:par});
};
/* la flèche du Pisteur. potion : la recette où elle a trempé (ou null). q : le carquois spécial choisi (D.OBJETS[...], ou
   null pour les flèches normales ; une flèche trempée est toujours une flèche normale).
   Romain, 10 novembre : le Pisteur CHOISIT sa flèche, et chaque sorte a son défaut : la flèche de lune rebondit sur l'armure,
   la transperçante passe à travers les bêtes de brume (même point faible ouvert : le tour est perdu). */
P._fleche = function(ev, m, potion, q){
  var bonus = !!q && q.contre.indexOf(m.type) >= 0, coup = q ? q.coup : 'fleche', nom = potion || (q ? q.fleche : 'normale');
  if(q && q.rebondit && q.rebondit.indexOf(m.type) >= 0){
    ev.push({t:'tir', heros:'pisteur', bete:m.id, fleche:nom, rebond:true, defaut:'rebondit'});
    ev.push({t:'rebond', bete:m.id, coup:coup}); return;
  }
  if(q && q.traverse && q.traverse.indexOf(m.type) >= 0){
    ev.push({t:'tir', heros:'pisteur', bete:m.id, fleche:nom, rebond:false, defaut:'traverse'});
    ev.push({t:'mot', bete:m.id, texte:MOTS.traverse}); return;
  }
  /* le critique surprise : une flèche simple, sur un monstre normal au point faible fermé */
  var surprise = !potion && m.ouvert === 0 && m.def.rang === 'normal' && this.R() < C.surprise;
  var blinde = this._un(m, m.def.blinde);
  /* les flèches spéciales touchent « même fermé » les monstres normaux ; un élite reste immunisé (leur bonus, c'est le critique) */
  var perce = bonus && m.def.rang === 'normal';
  var rebond = !blinde && m.ouvert === 0 && !surprise && !potion && this._immunise(m);
  ev.push({t:'tir', heros:'pisteur', bete:m.id, fleche:nom, rebond:rebond || blinde});
  if(blinde){ ev.push({t:'rebond', bete:m.id, coup:coup}); return; }
  if(m.ouvert !== 0) return this._critique(ev, m, 'fleche', coup, bonus ? q.critique : 0, false);
  if(surprise) return this._critique(ev, m, 'fleche', coup, bonus ? q.critique : 0, true);
  if(potion) return this._pouvoir(ev, m, D.RECETTES[potion].pouvoir, {heros:'pisteur', fleche:true});
  if(rebond){ ev.push({t:'rebond', bete:m.id, coup:coup}); return; }
  var n = perce ? q.ferme : this._ferm(m, 'fleche');
  ev.push({t:'touche', bete:m.id, coup:coup, piege:false});
  if(n > 0) this._blesse(ev, m, n, {cause:'fleche'});
};

/* ---------- un coup sur un héros ---------- */
P._frappe = function(ev, h, brut, m, nom, A){
  var S = this.h[h], bouc = S.bouclier, d = bouc ? Math.ceil(brut * C.bouclier) : brut;
  if(brut > 0){
    S.pv = Math.max(0, S.pv - d);
    var e = {t:'degats', heros:h, n:d, pv:S.pv, brut:brut, bouclier:bouc, absorbe:brut - d, bete:m.id, attaque:nom};
    ev.push(e);
    if(S.pv <= 0){
      if(S.objets.indexOf('amulette') >= 0){
        S.objets.splice(S.objets.indexOf('amulette'), 1); this.amulette = h;
        S.pv = C.amulette; ev.push({t:'releve', heros:h, pv:S.pv, par:'amulette'});
      } else { S.sol = true; S.entoile = false; ev.push({t:'tombe', heros:h}); }
    }
  }
  if(A && !S.sol){
    if(A.pose){
      if(bouc) ev.push({t:'pare', heros:h, bete:m.id, quoi:nom});
      else { S[A.pose] = true; ev.push({t:'etat', heros:h, nom:A.pose, on:true, tours:1}); }
    }
    if(A.avale){
      if(bouc) ev.push({t:'pare', heros:h, bete:m.id, quoi:nom});
      else { S.avale = m.id; ev.push({t:'avale', bete:m.id, heros:h}); }
    }
  }
  return bouc;
};

/* ---------- le début d'un tour : chaque bête choisit son attaque et sa proie ---------- */
P._viser = function(){
  var d = this.visables(), tot = 0, k;
  if(!d.length) return null;
  for(k = 0; k < d.length; k++) tot += D.VISEE[d[k]];
  var x = this.R() * tot;
  for(k = 0; k < d.length; k++){ x -= D.VISEE[d[k]]; if(x < 0) return d[k]; }
  return d[0];
};
P._nomAttaque = function(m, avance){
  var self = this, nom = m.def.rythme[(m.nAtt + (avance || 0)) % m.def.rythme.length], A = m.def.attaques[nom];
  /* Bourbe n'avale personne s'il a déjà quelqu'un dans le ventre ; gonflé, il saute */
  if(A.avale && (D.ORDRE.some(function(h){ return self.h[h].avale === m.id; }) || (m.def.attaques.saut && this.a(m, 'gonfle')))) nom = 'saut';
  return nom;
};
/* le hasard choisit la proie d'une attaque (avance : 1 pour l'attaque d'après). sansPoser : ne touche pas à m.plan */
P._planifier = function(m, avance, sansPoser){
  var nom = this._nomAttaque(m, avance), A = m.def.attaques[nom], cibles = [], self = this;
  if(A.cibles === 'un'){ var h = this._viser(); if(h) cibles = [h]; }
  else if(A.cibles === 'deux'){
    var h1 = this._viser(); if(h1) cibles = [h1];
    var reste = this.visables().filter(function(x){ return x !== h1; });
    if(reste.length){
      var tot = 0; reste.forEach(function(x){ tot += D.VISEE[x]; });
      var x2 = this.R() * tot, h2 = reste[0];
      for(var k = 0; k < reste.length; k++){ x2 -= D.VISEE[reste[k]]; if(x2 < 0){ h2 = reste[k]; break; } }
      cibles.push(h2);
    }
  }
  else if(A.cibles === 'tous') cibles = D.EXPOSES.filter(function(x){ return !self.h[x].sol && !self.h[x].avale; });
  else if(A.cibles === 'devant'){ var f = D.EXPOSES.filter(function(x){ return !self.h[x].sol && !self.h[x].avale; })[0]; if(f) cibles = [f]; }
  var plan = {nom:nom, cibles:cibles};
  if(!sansPoser) m.plan = plan;
  return plan;
};
/* Ce que le monstre fera ce tour-ci. suite : ce qu'il avait prévu au tour d'avant, si le Sage l'a regardé (la rune de l'œil).
   LES COUPS PRÉPARÉS (attaque « prepare ») : le monstre choisit sa proie, passe un tour à préparer (m.c.pret = false), puis
   frappe au tour suivant (m.c.pret = true), sur la même proie (m.c.coup). */
P._planDuTour = function(m, suite){
  var nom = this._nomAttaque(m, 0), A = m.def.attaques[nom];
  if(A.prepare){
    if(!m.c.coup || m.c.coup.nom !== nom){
      var p0 = suite && suite.nom === nom ? suite : this._planifier(m, 0, true);
      m.c.coup = {nom:nom, cibles:p0.cibles.slice()}; m.c.pret = false;
    }
    return {nom:nom, cibles:m.c.coup.cibles.slice(), prepare:!m.c.pret};
  }
  if(suite && suite.nom === nom && !suite.prepare) return {nom:nom, cibles:suite.cibles.slice()};
  return this._planifier(m, 0, true);
};
/* ce qu'il fera au tour d'après (pour la rune de l'œil) : sa proie est choisie dès maintenant, et gardée */
P._prevoir = function(m){
  var passe = this._un(m, m.def.passeSi);
  if(m.plan && m.plan.prepare) return {nom:m.plan.nom, cibles:m.plan.cibles.slice(), prepare:passe};        /* son coup préparé tombera au tour suivant */
  var av = m.plan && !passe ? 1 : 0, p = this._planifier(m, av, true);
  if(m.def.attaques[p.nom].prepare) p.prepare = true;          /* un coup préparé commence par un tour de préparation */
  return p;
};
/* les dégâts d'un plan, avec ce que le monstre a sur le dos maintenant (rougeoie, enragé, gonflé…) */
P._prevu = function(m, plan){
  var A = m.def.attaques[plan.nom], d = A.degats, fois = 1, n;
  if(A.foisSi) for(n in A.foisSi) if(this.a(m, n)) fois = Math.max(fois, A.foisSi[n]);
  if(A.plusSi) for(n in A.plusSi) if(this.a(m, n)) d += A.plusSi[n];
  if(A.doubleSi && this._un(m, A.doubleSi)) d *= 2;
  return {attaque:plan.nom, cibles:plan.cibles.slice(), degats:plan.prepare ? 0 : d, fois:fois, prepare:!!plan.prepare, gros:!!A.prepare};
};
/* LA RUNE DE L'ŒIL (Romain, 11 novembre) : le Sage voit, pour ce tour et le suivant, qui chaque monstre va frapper et combien.
   Sans elle, personne ne le sait (etat() ne le dit pas). Depuis 16 h 07 : lancée une fois, elle dure tout le combat (TOUJOURS). */
var TOUJOURS = 9999;
P._oeil = function(ev, h){
  var self = this;
  this.vivants().forEach(function(m){ if(!m.suite) m.suite = self._prevoir(m); });
  this.vu = TOUJOURS;
  ev.push({t:'oeil', heros:h, jusque:'fin', plans:this.intentions()});
};
/* ce que le Sage voit en ce moment : [{bete, dans:0 (ce tour) | 1 (le suivant), attaque, cibles, degats, fois, prepare, gros}] */
P.intentions = function(){
  var self = this, l = [];
  if(this.vu < this.tour) return l;
  function note(m, plan, dans){ var o = self._prevu(m, plan); o.bete = m.id; o.dans = dans; l.push(o); }
  this.vivants().forEach(function(m){
    if(m.plan && !self._un(m, m.def.passeSi)) note(m, m.plan, 0);
    if(self.vu > self.tour && m.suite) note(m, m.suite, 1);
  });
  return l;
};
P._nouveauTour = function(ev){
  var self = this;
  this.tour++;
  D.ORDRE.forEach(function(h){ self.h[h].joue = false; });
  ev.push({t:'tour', n:this.tour});
  this.vivants().forEach(function(m){
    var suite = m.suite;
    m.plan = null; m.suite = null;
    if(self._un(m, m.def.passeSi)) return;            /* sur le dos, sous l'eau… : il ne prépare rien (un coup préparé attend) */
    var p = m.plan = self._planDuTour(m, suite);
    /* un coup qui se prépare : tout le monde le voit, dès le début du tour */
    if(m.def.attaques[p.nom].prepare && !self.a(m, 'prepare')){ m.e.prepare = FIN; ev.push({t:'etat', bete:m.id, nom:'prepare', on:true, tours:'fin'}); }
    ev.push({t:'vise', bete:m.id, attaque:p.nom, cibles:p.cibles.slice(), prepare:!!p.prepare});
  });
  /* l'œil ouvert : le Sage voit aussi le tour d'après (la proie est tirée au sort maintenant, et reprise telle quelle) */
  if(this.vu > this.tour) this.vivants().forEach(function(m){ if(!m.suite) m.suite = self._prevoir(m); });
  D.ORDRE.forEach(function(h){ if(self.h[h].entoile && !self.h[h].sol) ev.push({t:'passe', heros:h, mot:MOTS.entoile}); });
  this._sauveGraine();
};

/* ---------- le tour des monstres ---------- */
P.tourMonstres = function(){
  var ev = [], self = this;
  if(this.resultat) return [{t:'refus', mot:MOTS.fini}];
  if(this.aJouer().length) return [{t:'refus', mot:MOTS.pasEncore}];
  /* celui qui était pris dans la toile a passé son tour : il la déchire */
  D.ORDRE.forEach(function(h){ if(self.h[h].entoile){ self.h[h].entoile = false; ev.push({t:'etat', heros:h, nom:'entoile', on:false}); } });
  var liste = this.vivants();
  for(var k = 0; k < liste.length; k++){
    var m = liste[k];
    if(!this.debout().length) break;
    if(m.mort) continue;
    if(this.a(m, 'brule')){
      m.pv = Math.max(0, m.pv - C.brulure);
      ev.push({t:'brulure', bete:m.id, n:C.brulure, pv:m.pv});
      if(m.pv <= 0){ this._tue(ev, m, m.def.fin, 'brulure'); continue; }
    }
    var saute = null;
    (m.def.passeSi || []).forEach(function(n){ if(!saute && self.a(m, n)) saute = n; });
    if(saute){ ev.push({t:'saute', bete:m.id, nom:saute}); continue; }
    this._attaque(ev, m);
  }
  if(!this._bilan(ev)){
    this._finTour(ev);
    if(!this._bilan(ev)) this._nouveauTour(ev);
  }
  this._sauveGraine();
  return ev;
};
P._attaque = function(ev, m){
  var self = this;
  if(!m.plan) m.plan = this._planDuTour(m, null);
  var nom = this._nomAttaque(m);
  if(nom !== m.plan.nom) m.plan = this._planDuTour(m, null);        /* il a changé d'idée (gonflé, ou le ventre plein) */
  var A = m.def.attaques[nom], plan = m.plan;
  if(A.prepare && !m.c.pret){                                       /* il prépare son coup : rien ce tour-ci, et tout le monde le voit */
    m.c.pret = true;
    if(!this.a(m, 'prepare')){ m.e.prepare = FIN; ev.push({t:'etat', bete:m.id, nom:'prepare', on:true, tours:'fin'}); }
    ev.push({t:'prepare', bete:m.id, attaque:nom});
    return;
  }
  function valide(h){ return h && !self.h[h].sol && !self.h[h].avale; }
  function secours(pris){ return D.EXPOSES.filter(function(x){ return valide(x) && pris.indexOf(x) < 0; })[0]; }
  var cibles = [];
  if(A.cibles === 'tous') cibles = D.EXPOSES.filter(valide);
  else if(A.cibles === 'devant'){ var f = secours([]); if(f) cibles = [f]; }
  else plan.cibles.forEach(function(h){ if(!valide(h) || cibles.indexOf(h) >= 0) h = secours(cibles); if(h) cibles.push(h); });
  if(!cibles.length) return;
  /* une bête tombée qui sait se relever (la chauve-souris se renvole, l'araignée remonte) le fait AVANT d'attaquer :
     son point faible se referme à ce moment-là (les héros ont déjà tous joué : ça ne change rien pour eux) */
  if(m.def.seReleve){
    var tombee = false;
    (m.def.tombe || []).forEach(function(nm){ if(self.a(m, nm)){ tombee = true; self._retire(ev, m, nm); } });
    if(tombee && m.ouvert !== FIN) this._ferme(ev, m);
  }
  var fois = 1, degats = A.degats, n;
  if(A.foisSi) for(n in A.foisSi) if(this.a(m, n)) fois = Math.max(fois, A.foisSi[n]);
  if(A.plusSi) for(n in A.plusSi) if(this.a(m, n)) degats += A.plusSi[n];
  if(A.doubleSi && this._un(m, A.doubleSi)) degats *= 2;
  var ea = {t:'attaque', bete:m.id, nom:nom, cibles:cibles.slice(), fois:fois};
  if(A.anim) ea.anim = A.anim;                 /* (un coup préparé emprunte l'animation d'une attaque du module) */
  if(A.prepare) ea.gros = true;
  ev.push(ea);
  var surBouclier = false;
  if(A.cibles === 'un'){
    /* comme dans la salle des rats : s'il frappe plusieurs fois et que sa proie tombe, il passe au suivant */
    var victime = cibles[0];
    for(var k = 0; k < fois; k++){
      if(!valide(victime)){ victime = secours([]); if(!victime) break; }
      if(this._frappe(ev, victime, degats, m, nom, A)) surBouclier = true;
    }
  } else cibles.forEach(function(h){ if(valide(h) && self._frappe(ev, h, degats, m, nom, A)) surBouclier = true; });
  m.nAtt++;
  if(A.prepare){ m.c.pret = false; m.c.coup = null; if(this.a(m, 'prepare')) this._retire(ev, m, 'prepare'); }     /* le coup préparé est tombé */
  if(A.consomme) this._retire(ev, m, A.consomme);
  if(A.apres) this._faire(ev, m, A.apres, null);
  /* son coup est tombé sur un bouclier de runes : certains s'y laissent prendre (feu follet, Gardien) */
  if(surBouclier && m.def.reactions && m.def.reactions.bouclier) this._pouvoir(ev, m, 'bouclier', null);
};
/* la fin du tour des monstres : ce qui s'ouvre se referme, les états d'un tour s'en vont, les boucliers s'éteignent */
P._finTour = function(ev){
  var self = this;
  this.vivants().forEach(function(m){
    if(m.type === 'bourbe') self._bourbeAvant(ev, m);
    var partis = [];
    Object.keys(m.e).forEach(function(n){
      var d = m.e[n];
      if(d === FIN || d === GESTE) return;
      if(d <= 1){ partis.push(n); self._retire(ev, m, n); } else m.e[n] = d - 1;
    });
    if(m.ouvert !== 0 && m.ouvert !== FIN){ if(m.ouvert <= 1) self._ferme(ev, m); else m.ouvert--; }
    if(m.type === 'bourbe') self._bourbeApres(ev, m, partis);
  });
  D.ORDRE.forEach(function(h){ if(self.h[h].bouclier){ self.h[h].bouclier = false; ev.push({t:'etat', heros:h, nom:'bouclier', on:false}); } });
};
/* Bourbe : sur la glace depuis 2 tours entiers, il sèche tout seul (et la glace tient alors encore un tour sous lui, tout
   raide). Depuis le 11 novembre (19 h 21), seul le givre le sort de l'eau : il n'y a plus de « berge ». */
P._bourbeAvant = function(ev, m){
  var B = D.BOURBE, hors = this.a(m, 'gele') && !this.a(m, 'dos') && !this.a(m, 'sous');
  if(!hors){ if(!this.a(m, 'dos')) m.c.hors = 0; return; }
  m.c.hors = (m.c.hors || 0) + 1;
  if(m.c.hors >= B.secApres && !this.a(m, 'sec')){
    ev.push({t:'etat', bete:m.id, nom:'sec', on:true, tours:'fin', seul:true}); m.e.sec = FIN;
    var reste = 1 + B.secReste;
    if(m.e.gele < reste){ m.e.gele = reste; ev.push({t:'etat', bete:m.id, nom:'gele', on:true, tours:reste, deja:true}); }
  }
};
/* Bourbe : il retourne à l'eau quand la glace a fondu ou qu'il se remet sur ses pattes (il passe alors à travers la glace) ;
   il remonte avec ses têtards */
P._bourbeApres = function(ev, m, partis){
  var B = D.BOURBE, self = this;
  if(partis.indexOf('dos') >= 0){ this._retire(ev, m, 'gele'); this._retire(ev, m, 'sec'); m.c.hors = 0; }
  else if(!this.a(m, 'dos') && partis.indexOf('gele') >= 0 && !this.a(m, 'gele')){ this._retire(ev, m, 'sec'); m.c.hors = 0; }
  if(partis.indexOf('sous') >= 0){
    ev.push({t:'special', bete:m.id, nom:'remonter'});
    var la = this.vivants().filter(function(x){ return x.type === 'tetard'; }).length, n = Math.max(0, Math.min(B.tetards, B.tetardsMax - la));
    if(n) this._naissent(ev, m, 'tetard', n, 'plongeon');
    /* il remonte d'un bond : son retour éclabousse tout le monde (un saut, en plus de son rythme).
       Sans cela, taper sur la marmite à chaque tour l'empêcherait d'attaquer pour toujours. */
    var A = m.def.attaques[B.retour], cibles = D.EXPOSES.filter(function(h){ return !self.h[h].sol && !self.h[h].avale; });
    if(A && cibles.length){
      var d = A.degats * (A.doubleSi && this._un(m, A.doubleSi) ? 2 : 1);
      ev.push({t:'attaque', bete:m.id, nom:B.retour, cibles:cibles.slice(), fois:1, retour:true});
      cibles.forEach(function(h){ self._frappe(ev, h, d, m, B.retour, A); });
      if(A.consomme) this._retire(ev, m, A.consomme);
    }
  }
};

/* ---------- la fin du combat ---------- */
P._bilan = function(ev){
  if(this.resultat) return true;
  if(!this.vivants().length) return this._fin(ev, 'victoire');
  if(!this.debout().length) return this._fin(ev, 'defaite');
  return false;
};
P._fin = function(ev, res){
  var self = this, p = this.p, o = {};
  this.resultat = res;
  if(res === 'victoire'){
    /* la partie apprend le résultat : les PV restants (un héros tombé se relève, sonné, avec 1 PV), l'amulette usée */
    D.EXPOSES.forEach(function(h){
      var S = self.h[h], H = p.heros[h];
      H.pv = S.sol || S.pv <= 0 ? 1 : S.pv; H.sol = false; H.objets = S.objets.slice();
      o[h] = {pv:H.pv, sol:S.sol};
    });
    if(this.amulette) p.faits['amulette:utilisee'] = this.salle + '|' + this.amulette;     /* (dans quel combat, et qui la portait) */
    p.faits['combat:' + this.salle] = 1;
    p.repos = false;
  } else D.EXPOSES.forEach(function(h){ o[h] = {pv:self.h[h].pv, sol:self.h[h].sol}; });
  ev.push({t:'fin', resultat:res, tours:this.tour, heros:o});
  if(res === 'victoire') poserCombat(p, null);
  return true;
};
P.fini = function(){ return this.resultat === 'fuite' ? 'defaite' : this.resultat; };
P.entree = function(){ return this._ev.slice(); };
P.fuir = function(){ if(this.resultat === 'victoire') return refus(MOTS.fini); return fuir(this.p, this.salle); };
P.etat = function(){
  var self = this, o = {salle:this.salle, nom:this.nom, tour:this.tour, fini:this.fini(), sac:this.sac.slice(), heros:{}, betes:[], aJouer:this.aJouer()};
  /* la rune de l'œil : 0 = on ne sait pas qui sera frappé ; 1 = le Sage voit ce tour ; 2 = ce tour et le suivant */
  o.vu = this.vu < this.tour ? 0 : this.vu > this.tour ? 2 : 1;
  D.EXPOSES.forEach(function(h){ var S = self.h[h]; o.heros[h] = {pv:S.pv, pvMax:S.pvMax, sol:S.sol, joue:S.joue, bouclier:S.bouclier, entoile:S.entoile, avale:S.avale, objets:S.objets.slice()}; });
  this.b.forEach(function(m, i){
    var e = {}; Object.keys(m.e).forEach(function(n){ e[n] = dureeDite(m.e[n]); });
    o.betes.push({id:m.id, type:m.type, module:m.def.module, nom:m.def.nom, rang:m.def.rang, pv:m.pv, pvMax:m.pvMax, mort:m.mort, position:i,
      ouvert:m.ouvert !== 0, etats:e, cache:!m.mort && self.cache(m),
      prepare:m.mort || !m.e.prepare ? 0 : m.c.pret ? 2 : 1,              /* un gros coup, visible de tous : 1 = il prend son élan ce tour-ci ; 2 = le coup tombe à la fin de ce tour */
      vise:o.vu && m.plan && !m.mort && !self._un(m, m.def.passeSi) ? self._prevu(m, m.plan) : null,
      suite:o.vu === 2 && m.suite && !m.mort ? self._prevu(m, m.suite) : null});
  });
  return o;
};
function combat(p, salle, o){ return new Combat(p, salle, o); }

/* ======================================================================= HORS COMBAT */
function contenu(p, lieu){
  lieu = lieu || p.lieu;
  var L = D.LIEUX[lieu], f = p.faits, o = {lieu:lieu, nom:L ? L.nom : lieu};
  if(!L) return o;
  var gagne = L.combat ? !!f['combat:' + L.combat] : true;
  if(L.combat){ o.combat = L.combat; o.gagne = gagne; }
  o.objets = [];
  if(gagne || !L.apresCombat) (L.objets || []).forEach(function(id){ if(!f['objet:' + id] && !f['pose:' + id]) o.objets.push(id); });
  Object.keys(f).forEach(function(k){ if(k.indexOf('pose:') === 0 && f[k] === lieu) o.objets.push(k.slice(5)); });
  if(L.coffre) o.coffre = {options:L.coffre.slice(), pris:f['coffre:' + lieu] || null};
  if(L.tas) o.tas = {fouilles:f.os || 0, reste:(f.os || 0) < 2};
  if(L.crane) o.crane = {ouvert:!!f.secret};
  if(L.piege === 'dalles') o.dalles = {pas:f.dalles || 0, sur:D.DALLES.pas, passe:!!f['piege:dalles']};
  if(L.roue && gagne) o.roue = {ouvert:!!f[D.ROUE.ouvre], crans:(f.roue || '').length, sur:D.ROUE.suite.length};
  if(L.portes) o.portes = L.portes;
  if(L.repos) o.repos = {permis:!p.repos};
  if(L.donne) o.code = {id:donneDe(p, L), pour:L.pour};
  if(L.boucle) o.boucle = L.boucle;
  if(L.fin) o.fin = true;
  return o;
}
/* ce qui empêche de TRAVERSER un lieu (la carte dit où mènent les couloirs, les règles disent si on passe) :
   null, ou 'combat' (des monstres à battre d'abord), ou 'dalles' (le couloir piégé n'est pas encore passé) */
function bloque(p, lieu){
  var L = D.LIEUX[lieu];
  if(!L) return null;
  if(L.combat && !p.faits['combat:' + L.combat]) return 'combat';
  if(L.piege === 'dalles' && !p.faits['piege:dalles']) return 'dalles';
  return null;
}
/* le code que donne un lieu. Dans l'enquête 3 (p.enquete : la descente vient de l'enquête), la dernière salle donne « Léo s'est
   enfui » à la place de « Léo attrapé » quand le Pisteur n'a pas tapé « Le maire est retenu » (le maire descend trop tôt). Une fois
   donné, le code ne change plus. Hors de l'enquête (le donjon tout seul), rien ne change : Léo est attrapé. */
function leoEnfui(p){ var L = D.LIEUX.leo; return !!(p.enquete && L.sansMaire && !p.faits['code:' + L.donne] && (p.faits['code:' + L.sansMaire] || !p.codes['maire:retenu'])); }
function donneDe(p, L){ return L.sansMaire && L === D.LIEUX.leo && leoEnfui(p) ? L.sansMaire : L.donne; }
function entrer(p, lieu){
  var L = D.LIEUX[lieu];
  if(!L) return refus(MOTS.pasIci);
  if(enCombat(p)) return refus(MOTS.combat);
  p.lieu = lieu; p.vus[lieu] = 1;
  var ev = [{t:'lieu', id:lieu, nom:L.nom}];
  if(L.combat && !p.faits['combat:' + L.combat]){
    ev.push({t:'combat', salle:L.combat});
    return ev;
  }
  if(L.donne){ var dn = donneDe(p, L); p.faits['code:' + dn] = 1; ev.push({t:'code-objet', objet:null, code:dn, pour:L.pour}); }
  ev.push({t:'scene', lieu:lieu, contenu:contenu(p, lieu)});
  if(L.boucle) ev.push({t:'boucle', vers:L.boucle});
  if(L.fin){ p.faits.fin = 1; ev.push({t:'fin-donjon'}); }
  return ev;
}
/* poser un objet dans les mains d'un héros (2 places) ; rend null si c'est fait, ou la liste d'évènements du refus */
function donner(p, ev, id, heros, laisser){
  var O = D.OBJETS[id], h = O.pour === 'tous' ? heros : O.pour, H = p.heros[h];
  if(!H) return refus(MOTS.pourQui, {objet:id});
  if(!sansPlace(id) && enMains(H.objets).length >= C.places){      /* (un carquois, une arme ne prennent pas de place) */
    if(!laisser || H.objets.indexOf(laisser) < 0 || sansPlace(laisser)) return [{t:'plein', heros:h, objets:enMains(H.objets), objet:id}];
    H.objets.splice(H.objets.indexOf(laisser), 1);
    delete p.faits['objet:' + laisser]; p.faits['pose:' + laisser] = p.lieu;
    ev.push({t:'laisse', objet:laisser, heros:h, lieu:p.lieu});
  }
  H.objets.push(id);
  ev.push({t:'objet', objet:id, heros:h, equipe:O.equipe || null});
  return null;
}
function prendre(p, id, heros, laisser){
  var O = D.OBJETS[id], c = contenu(p), ev = [];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!O || c.objets.indexOf(id) < 0) return refus(p.faits['objet:' + id] ? MOTS.pris : MOTS.pasIci, {objet:id});
  if(O.or){ p.or += C.bourse; ev.push({t:'or', n:C.bourse, total:p.or}); }
  else if(O.code) ev.push({t:'code-objet', objet:id, code:O.code, pour:O.pour});
  else { var r = donner(p, ev, id, heros, laisser); if(r) return r; }
  p.faits['objet:' + id] = 1; delete p.faits['pose:' + id];
  return ev;
}
function choisir(p, id, laisser){
  var L = D.LIEUX[p.lieu], ev = [];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || !L.coffre || L.coffre.indexOf(id) < 0) return refus(MOTS.pasIci, {objet:id});
  if(p.faits['coffre:' + p.lieu]) return refus(MOTS.pris, {objet:id});
  var r = donner(p, ev, id, null, laisser); if(r) return r;
  p.faits['coffre:' + p.lieu] = id; p.faits['objet:' + id] = 1;
  ev.push({t:'coffre', lieu:p.lieu, pris:id, reste:L.coffre.filter(function(x){ return x !== id; })[0]});
  return ev;
}
function perdre(p, ev, h, n, cause){          /* un piège hors combat : il reste toujours au moins 1 PV */
  var H = p.heros[h], avant = H.pv;
  H.pv = Math.max(C.plancher, H.pv - n);
  ev.push({t:'degats', heros:h, n:avant - H.pv, pv:H.pv, brut:n, cause:cause});
}
function fouiller(p){
  var L = D.LIEUX[p.lieu], ev = [];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || !L.tas) return refus(MOTS.pasIci);
  var n = p.faits.os || 0;
  if(n === 0){ p.faits.os = 1; ev.push({t:'fouille', n:1, trouve:'morsure'}); perdre(p, ev, 'pisteur', C.os, 'rat-des-os'); }
  else if(n === 1){
    p.faits.os = 2; p.faits['objet:page-blanche'] = 1;
    ev.push({t:'fouille', n:2, trouve:'page'});
    ev.push({t:'code-objet', objet:'page-blanche', code:D.OBJETS['page-blanche'].code, pour:'sage'});
  }
  else ev.push({t:'fouille', n:n + 1, trouve:null});
  return ev;
}
function crane(p){
  var L = D.LIEUX[p.lieu];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || !L.crane) return refus(MOTS.pasIci);
  var deja = !!p.faits.secret;
  p.faits.secret = 1; p.vus.camp = p.vus.camp || 1;
  return [{t:'passage', de:p.lieu, vers:'camp', deja:deja}];
}
/* la rangée sûre au pas n° k, d'après le code des couleurs (la dalle du fond est claire aux pas pairs) */
function dalleSure(k){
  var T = D.DALLES;
  if(!T.code) return T.sures[k];
  return (T.code[k] === 'blanc') === (k % 2 === 0) ? 'fond' : 'devant';
}
/* la roue des canaux : un cran à droite ('d') ou à gauche ('g') ; au dernier cran, la grille se lève… ou la roue revient */
function roue(p, sens){
  var L = D.LIEUX[p.lieu], T = D.ROUE;
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || !L.roue || (L.combat && !p.faits['combat:' + L.combat])) return refus(MOTS.pasIci);
  if(sens !== 'd' && sens !== 'g') return refus(MOTS.cible);
  if(p.faits[T.ouvre]) return [{t:'roue', sens:sens, libre:true}];
  var s = (p.faits.roue || '') + sens, ev = [{t:'roue', sens:sens, cran:s.length, sur:T.suite.length}];
  if(s.length < T.suite.length){ p.faits.roue = s; return ev; }
  delete p.faits.roue;
  if(s === T.suite.join('')){ p.faits[T.ouvre] = 1; ev.push({t:'passage', de:p.lieu, vers:T.vers}); }
  else ev.push({t:'roue-retour', crans:s.length});
  return ev;
}
function dalle(p, cote){
  var L = D.LIEUX[p.lieu], T = D.DALLES, ev = [];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || L.piege !== 'dalles') return refus(MOTS.pasIci);
  if(cote !== 'fond' && cote !== 'devant') return refus(MOTS.cible);
  if(p.faits['piege:dalles']) return [{t:'traverse', lieu:p.lieu, libre:true}];
  var pas = p.faits.dalles || 0, sure = dalleSure(pas) === cote;
  ev.push({t:'dalle', pas:pas, cote:cote, sure:sure, element:'dalle-' + (6 + pas) + '-' + (cote === 'fond' ? 0 : 1)});
  if(sure){
    pas++;
    if(pas >= T.pas){ delete p.faits.dalles; p.faits['piege:dalles'] = 1; ev.push({t:'traverse', lieu:p.lieu}); }
    else p.faits.dalles = pas;
  } else {
    ev.push({t:'piege', quoi:'dalles', degats:T.degats});
    D.EXPOSES.forEach(function(h){ perdre(p, ev, h, T.degats, 'dalles'); });
    pas = Math.max(0, pas - 1); p.faits.dalles = pas;
    ev.push({t:'recule', pas:pas});
  }
  return ev;
}
function porte(p, signe){
  var L = D.LIEUX[p.lieu];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || !L.portes || !L.portes[signe]) return refus(MOTS.pasIci);
  return [{t:'porte', signe:signe, vers:L.portes[signe]}];
}
function repos(p){
  var L = D.LIEUX[p.lieu], ev = [{t:'repos'}];
  if(enCombat(p)) return refus(MOTS.combat);
  if(!L || !L.repos) return refus(MOTS.pasIci);
  if(p.repos) return refus(MOTS.repos);
  D.EXPOSES.forEach(function(h){
    var H = p.heros[h], avant = H.pv;
    H.pv = Math.min(H.pvMax, H.pv + Math.ceil(H.pvMax * C.repos)); H.sol = false;
    ev.push({t:'soin', heros:h, n:H.pv - avant, pv:H.pv, par:'repos'});
  });
  p.repos = true;
  return ev;
}
function code(p, id){
  var def = D.CODES[id];
  if(enCombat(p)) return refus(MOTS.combat, {code:id});
  if(!def) return refus(MOTS.inconnu, {code:id});
  if(p.codes[id]) return refus(MOTS.use, {code:id});
  p.codes[id] = 1;
  if(def.sauve){ sauvegarder(p); return [{t:'sauvegarde', code:id, lieu:p.lieu}]; }
  /* (l'enquête 3) la Grosse Marie sonne avant minuit : toute la vie des trois héros revient, et ceux qui étaient au sol se relèvent */
  if(def.marie){
    var evm = [{t:'marie', code:id}];
    D.EXPOSES.forEach(function(h){ var H = p.heros[h], avant = H.pv; H.pv = H.pvMax; H.sol = false; evm.push({t:'soin', heros:h, n:H.pv - avant, pv:H.pv, par:'marie'}); });
    return evm;
  }
  /* (l'enquête 3) le Barde retient le maire à la fête : Léo ne s'enfuira pas (leoEnfui) */
  if(def.maire) return [{t:'maire', code:id}];
  if(p.recettes.indexOf(def.recette) < 0) p.recettes.push(def.recette);
  return [{t:'recette', id:def.recette, nom:D.RECETTES[def.recette].nom}];
}
function objets(p){
  var o = {heros:{}, codes:[], or:p.or, recettes:potions(p)};
  D.EXPOSES.forEach(function(h){ o.heros[h] = p.heros[h].objets.slice(); });
  Object.keys(D.OBJETS).forEach(function(id){ if(D.OBJETS[id].code && p.faits['objet:' + id]) o.codes.push({objet:id, code:D.OBJETS[id].code, pour:D.OBJETS[id].pour}); });
  Object.keys(D.LIEUX).forEach(function(l){ var L = D.LIEUX[l];
    if(L.donne && p.faits['code:' + L.donne]) o.codes.push({objet:null, code:L.donne, pour:L.pour});
    if(L.sansMaire && p.faits['code:' + L.sansMaire]) o.codes.push({objet:null, code:L.sansMaire, pour:L.pour}); });
  return o;
}

var Regles = {
  D:D, FIN:FIN, alea:alea,
  nouvellePartie:nouvellePartie, combat:combat, fuir:fuir, enCombat:enCombat,
  entrer:entrer, contenu:contenu, bloque:bloque, recharger:fuir, prendre:prendre, choisir:choisir, fouiller:fouiller, crane:crane, dalle:dalle, dalleSure:dalleSure, roue:roue, porte:porte,
  repos:repos, code:code, potions:potions, enMains:enMains, leoEnfui:leoEnfui,
  sauvegarder:sauvegarder, objets:objets, exporter:exporter, importer:importer
};
if(NODE) module.exports = Regles; else global.Regles = Regles;
})(typeof window !== 'undefined' ? window : this);
