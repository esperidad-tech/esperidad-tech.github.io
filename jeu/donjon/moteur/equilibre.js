/* equilibre.js — LA DIFFICULTÉ PROUVÉE PAR LA SIMULATION (MOTEUR-DONJON.md §6).
     node equilibre.js [parties par ligne] [--md]        (2 000 par défaut : environ une minute et demie ; --md réécrit equilibre.md)
   Il joue chaque salle, puis le donjon entier, des milliers de fois, avec les vraies règles (src/regles.js) et quatre équipes :
     maligne        elle a lu le carnet de l'aventurier, ouvre les points faibles dans l'ordre, soigne quand il faut, se sert de
                    la rune de l'œil pour savoir qui protéger, sauvegarde avant les grandes portes
     sans le Sage   elle joue aussi bien, mais n'a pas lu le carnet et ne connaît aucun combo
     tape           flèche, dague, louche, bouclier sur le Pisteur : jamais un point faible ouvert exprès
     au hasard      des gestes permis tirés au hasard
   et, pour y voir plus clair : « tape avec le feu » (celle de la simulation d'hier, qui passe la salle des rats), « à tâtons »
   (sans le Sage, elle essaie des pouvoirs au hasard et retient ce qu'elle voit), et la maligne « distraite » (un geste sur dix,
   ou sur quatre, joué n'importe comment : plus près d'une vraie famille).
   Il vérifie les cibles (la liste est écrite à la fin du rapport) et sort en erreur si l'une d'elles est manquée.
   Pour régler la difficulté : changer un chiffre dans src/donnees.js, relancer, lire le rapport.
   (require('./equilibre.js') depuis un autre script donne les équipes et les outils sans lancer le rapport ; EQ_N fixe alors le nombre de parties.) */
'use strict';
var fs = require('fs'), path = require('path');
var R = require('./src/regles.js'), D = R.D, C = D.CHIFFRES;
var N = parseInt(process.env.EQ_N || process.argv[2], 10) || 2000;
var ECRIRE = process.argv.indexOf('--md') >= 0;
var MAX_TOURS = 40;

/* ===================================================================== ce que les joueurs voient d'un combat */
function a(c, m, n){ return c.a(m, n); }
function cle(type){ return D.MONSTRES[type].livre || type; }
function peut(c, h){ return c.aJouer().indexOf(h) >= 0; }
function dans(c, r){ return c.sac.indexOf(r) >= 0; }
/* LA RUNE DE L'ŒIL (11 novembre) : l'équipe ne sait qui sera frappé que si le Sage regarde (ce tour, et le suivant s'il vient
   de lancer la rune). Sans elle : rien. Le coup qui se prépare (l'état « prepare »), lui, se voit toujours. */
function voit(c){ return c.vu >= c.tour; }
function planDe(c, m){ return voit(c) ? m.plan : null; }
/* ce qu'un monstre devrait enlever ce tour-ci à chaque héros, d'après ce que l'œil montre */
function coupDe(c, m){
  var plan = planDe(c, m);
  if(!plan || plan.prepare || c._un(m, m.def.passeSi)) return null;
  var A = m.def.attaques[plan.nom], d = A.degats, fois = 1, n;
  if(A.foisSi) for(n in A.foisSi) if(a(c, m, n)) fois = Math.max(fois, A.foisSi[n]);
  if(A.plusSi) for(n in A.plusSi) if(a(c, m, n)) d += A.plusSi[n];
  if(A.doubleSi && c._un(m, A.doubleSi)) d *= 2;
  if(A.multSi) for(n in A.multSi) if(a(c, m, n)) d *= A.multSi[n];
  return {cibles:plan.cibles, degats:d * fois, attrape:!!(A.pose || A.avale)};
}
function menace(c, h){
  var t = 0;
  c.vivants().forEach(function(m){ var k = coupDe(c, m); if(k && k.cibles.indexOf(h) >= 0) t += k.degats + (k.attrape ? 25 : 0); });
  return t;
}
function coups(c, h){              /* les dégâts annoncés sur ce héros, sans rien ajouter */
  var t = 0;
  c.vivants().forEach(function(m){ var k = coupDe(c, m); if(k && k.cibles.indexOf(h) >= 0) t += k.degats; });
  return t;
}
function danger(m){             /* ce qu'une bête enlève par tour, à peu près (pour choisir qui abattre d'abord) */
  var A = m.def.attaques[m.def.rythme[0]], n = A.cibles === 'tous' ? 3 : A.cibles === 'deux' ? 2 : 1;
  return (A.degats || 8) * n;
}
/* les pièges graves que la deuxième ligne du Grand Livre apprend : [monstre, pouvoir, sauf si la bête a un de ces états] */
var PIEGES = [
  ['rat', 'bruit', ['enrage']], ['ratcuir', 'feu', ['nu']], ['chauvesouris', 'lumiere', ['folle']], ['feufollet', 'lumiere', ['grand']],
  ['araignee', 'feu', ['_eclos']], ['roirats', 'lumiere', []], ['roirats', 'bruit', ['noeud', 'etale', 'ouvert', 'boule']],
  ['gardien', 'lumiere', ['plaque-ouverte', 'sans-plaque', 'plaque-entrouverte', 'enrage']], ['gardien', 'feu', ['ouvert', 'rougeoie']],
  ['bourbe', 'nuage', ['sec', 'dos', 'sous', 'gonfle']], ['bourbe', 'bruit', ['dos', 'sous', 'gele']]
];

/* ===================================================================== LES ÉQUIPES
   Une équipe = une fonction choisir(c, p, mem, rnd) -> {heros, geste, cible}. mem : ce qu'elle retient pendant la descente. */

/* ---------- au hasard ---------- */
function auHasard(c, p, mem, rnd){
  var hs = c.aJouer(), h = hs[Math.floor(rnd() * hs.length)], gs = c.gestes(h).filter(function(g){ return g.permis; });
  var g = gs[Math.floor(rnd() * gs.length)], cible = g.cibles.length ? g.cibles[Math.floor(rnd() * g.cibles.length)] : null;
  return {heros:h, geste:g.geste, cible:cible};
}
/* ---------- tape sans réfléchir : flèche, dague, louche ; le Sage protège le Pisteur ---------- */
function tape(c, p, mem, rnd){
  var hs = c.aJouer(), h = hs[Math.floor(rnd() * hs.length)];        /* dans n'importe quel ordre */
  if(c.h[h].avale) return {heros:h, geste:'chatouiller'};
  if(h === 'alchimiste') return {heros:h, geste:'louche'};
  if(h === 'sage'){ var am = c.visables(); return {heros:h, geste:'bouclier', cible:am.indexOf('pisteur') >= 0 ? 'pisteur' : am[0]}; }
  var d = c.devant();
  if(c.aPortee().indexOf(d) >= 0 && rnd() < 0.5) return {heros:h, geste:'dague', cible:d.id};
  return {heros:h, geste:'fleche', cible:d.id};
}
/* ---------- tape, avec ce qui fait mal dans le sac (le feu, l'acide) à la place de la louche ---------- */
function tapePotions(c, p, mem, rnd){
  var hs = c.aJouer();
  if(hs.indexOf('alchimiste') >= 0 && !c.h.alchimiste.avale){
    var d = c.devant(), r = dans(c, 'feu') ? 'feu' : dans(c, 'acide') ? 'acide' : null;
    if(r && d) return {heros:'alchimiste', geste:'p:' + r, cible:d.id};
  }
  return tape(c, p, mem, rnd);
}

/* ---------- l'équipe qui réfléchit. o.livre : elle a lu le carnet de l'aventurier (elle connaît les combos) ; o.tatonne : elle
   essaie au hasard ; o.oeil : 'toujours' (le Sage libre regarde un tour, protège le suivant), 'gros' (il ne regarde que pour
   un coup qui se prépare), false (jamais : il protège à l'aveugle le plus fragile) ---------- */
function reflechie(o){
  return function(c, p, mem, rnd){
    var S = peut(c, 'sage'), Al = peut(c, 'alchimiste'), Pi = peut(c, 'pisteur');
    var viv = c.vivants(), cib = c.ciblables(), act;
    mem.vu = mem.vu || {};            /* ce qu'elle a vu marcher : « type:pouvoir » -> 'ouvre' | 'piege' | 'rien' */
    /* o.apprend : L'ÉQUIPE QUI DÉCOUVRE (Romain, 11 novembre). Elle ne connaît aucun combo en entrant. À chaque tour passé
       devant une sorte de monstre, elle en comprend un peu plus (elle essaie, elle lit la page du carnet) : o.apprend lignes
       par tour, 4 lignes = elle sait tout de ce monstre. Elle retient d'une salle à l'autre, et d'un essai à l'autre. */
    if(o.apprend){
      mem.lu = mem.lu || {};
      if(c._luAu !== c.tour){
        if(c.tour > 1){ var deja = {}; viv.forEach(function(m){ var t = cle(m.type); if(!deja[t]){ deja[t] = 1; mem.lu[t] = Math.min(4, (mem.lu[t] || 0) + o.apprend); } }); }
        c._luAu = c.tour;
      }
    }
    function K(m){ return o.apprend ? Math.floor(mem.lu[cle(m.type || m)] || 0) : o.livre ? 4 : 0; }      /* (le carnet, ramassé à l'entrée, a toutes ses pages) */
    var oeil = o.oeil === undefined ? 'toujours' : o.oeil, vois = voit(c);
    function fragile(sauf){ return c.visables().filter(function(x){ return x !== sauf && !c.h[x].bouclier; }).sort(function(x, y){ return (c.h[x].pv - c.h[y].pv) || (D.VISEE[y] - D.VISEE[x]); })[0]; }
    function sait(m, n){ return K(m) >= n; }
    function vuOuvrir(m, pouvoir){ return mem.vu[cle(m.type) + ':' + pouvoir] === 'ouvre'; }
    /* un pouvoir de toute la salle : est-ce qu'elle SAIT qu'il renforce une bête présente ? */
    function interdit(pouvoir, sauf){
      return viv.some(function(m){
        if(m === sauf) return false;
        if(mem.vu[cle(m.type) + ':' + pouvoir] === 'piege') return !PIEGES.some(function(P){ return P[0] === m.type && P[1] === pouvoir && c._un(m, P[2]); });
        return K(m) >= 2 && PIEGES.some(function(P){ return P[0] === m.type && P[1] === pouvoir && !c._un(m, P[2]); });
      });
    }
    function lumiereSure(m){ return true; }       /* (depuis le 11 novembre : la rune de lumière vise toujours un seul monstre ; le cristal a sa carte à lui, que la simulation ne joue pas) */
    /* le bouclier : avec le bâton de chêne (la carte « a:baton-chene »), deux amis à la fois */
    /* (13 novembre) LES DEUX BOUCLIERS : le jaune (bâton normal : un ami, 75 %, il arrête la toile et la langue) ou ceux du bâton
       de chêne (deux amis, 50 % chacun, la toile et la langue passent). La maligne compte ce que chacun épargne, quand l'œil le
       montre ; à l'aveugle, elle en protège deux. */
    function bouc(l){
      l = [].concat(l).filter(function(x, i, t){ return x && t.indexOf(x) === i; });
      var deux = c.porte('sage', 'baton-chene') && l.length > 1;
      if(deux && vois){
        var m1 = menace(c, l[0]), m2 = menace(c, l[1]), pris = viv.some(function(m){ var k = coupDe(c, m); return k && k.attrape && k.cibles.indexOf(l[0]) >= 0; });
        if(pris || m1 * (1 - C.bouclier) >= (m1 + m2) * (1 - C.bouclierChene)) deux = false;
      }
      return {heros:'sage', geste:deux ? 'a:baton-chene' : 'bouclier', cible:deux ? l.slice(0, 2) : l[0]};
    }

    /* 0. dans le ventre de Bourbe : un seul geste (et s'il est sec, c'est même une bonne idée, avant le Pisteur) */
    for(var i = 0; i < D.ORDRE.length; i++){ var hh = D.ORDRE[i]; if(c.h[hh].avale && peut(c, hh)) return {heros:hh, geste:'chatouiller'}; }

    /* 1. relever un ami (le Pisteur d'abord : lui seul achève) */
    if(Al && dans(c, 'coeur')){
      var bas = D.EXPOSES.filter(function(h){ return c.h[h].sol; });
      if(bas.length) return {heros:'alchimiste', geste:'p:coeur', cible:bas[0]};
    }
    /* 2. Bourbe est sec : la fumée le renverse, et sur le dos il n'attaque plus. Rien ne presse davantage. */
    var bo = viv.filter(function(m){ return m.type === 'bourbe' && a(c, m, 'sec') && !a(c, m, 'dos') && !a(c, m, 'sous'); })[0];
    if(bo && Al && dans(c, 'fumigene') && K(bo) >= 1) return {heros:'alchimiste', geste:'p:fumigene'};
    /* 3. le Pisteur achève ce qui est ouvert (une bête abattue ne mord plus) */
    var ouverts = cib.filter(function(m){ return m.ouvert !== 0; });
    if(Pi && ouverts.length) return tirer(c, ouverts);
    /* sans fumée, il faudra chatouiller Bourbe de l'intérieur : quand il est sorti de l'eau et tire la langue, on ne l'arrête pas */
    var gobe = null;
    viv.forEach(function(m){ if(m.type === 'bourbe' && K(m) >= 4 && !dans(c, 'fumigene') && (a(c, m, 'berge') || a(c, m, 'gele')) && !a(c, m, 'dos') && planDe(c, m) && m.plan.nom === 'langue') gobe = m.plan.cibles[0]; });
    /* 3 bis. LE GROS COUP (les élites, le boss) : tout le monde voit qu'il se prépare. Au tour où il tombe, le Sage protège
       la proie si l'œil l'a montrée ; sinon, à l'aveugle, celui que les monstres visent le plus (et le plus fragile avec lui,
       s'il a le bâton). Pendant l'élan, le Sage ouvre l'œil s'il n'a rien de mieux à faire : voir plus bas (8). */
    var gros = viv.filter(function(m){ return a(c, m, 'prepare') && !c._un(m, m.def.passeSi); })[0];
    function probable(sauf){ return c.visables().filter(function(x){ return x !== sauf && !c.h[x].bouclier; }).sort(function(x, y){ return D.VISEE[y] * (c.h[y].pv <= 85 ? 2 : 1) - D.VISEE[x] * (c.h[x].pv <= 85 ? 2 : 1); })[0]; }
    if(S && gros && gros.c.pret){
      var proie = vois && gros.plan && gros.plan.cibles.length ? gros.plan.cibles[0] : probable();
      if(proie && c.visables().indexOf(proie) >= 0 && !c.h[proie].bouclier){
        return bouc([proie, vois ? fragile(proie) : probable(proie)]);
      }
    }
    /* 4. un ami va tomber ce tour-ci (l'œil le montre) : le bouclier s'il suffit, sinon le soin */
    var PART = C.bouclier;                /* ce que le bouclier laisse passer */
    var urg = D.EXPOSES.filter(function(h){ return h !== gobe && !c.h[h].sol && !c.h[h].avale && coups(c, h) * (c.h[h].bouclier ? PART : 1) >= c.h[h].pv; });
    if(urg.length){
      var u = urg[0], brut = coups(c, u);
      if(S && !c.h[u].bouclier && Math.ceil(brut * PART) < c.h[u].pv){
        var autre = c.visables().filter(function(x){ return x !== u; }).sort(function(x, y){ return menace(c, y) - menace(c, x); })[0];
        return bouc([u, autre]);
      }
      if(Al){ var s = soin(c, u, true); if(s) return s; }
      if(S && !c.h[u].bouclier) return {heros:'sage', geste:'bouclier', cible:u};
    }
    /* 5. l'Alchimiste libère un ami pris dans une toile : l'huile le rend à son tour (« il y a toujours un contre ») */
    if(Al && dans(c, 'huile')){
      var pris = D.ORDRE.filter(function(h){ return c.h[h].entoile && !c.h[h].sol && !c.h[h].joue; })[0];
      if(pris) return {heros:'alchimiste', geste:'p:huile', cible:pris};
    }

    /* 6. ouvrir un point faible (ou avancer d'une étape), en commençant par la bête la plus dangereuse qu'on sait ouvrir */
    var pas = [];
    viv.forEach(function(m){ var l = etapes(m); l.forEach(function(e){ e.m = m; pas.push(e); }); });
    /* ce qui ouvre tout de suite ne sert que si le Pisteur peut encore tirer (ou si ça dure) */
    pas = pas.filter(function(e){ return peut(c, e.heros) && (e.dure || Pi || e.etape); });
    if(pas.length){
      pas.sort(function(x, y){ return (y.poids || 0) - (x.poids || 0) || danger(y.m) - danger(x.m); });
      return pas[0];
    }
    /* 6 bis. à tâtons : essayer un pouvoir pas encore essayé sur une bête fermée (c'est comme ça qu'on tombe dans les pièges) */
    if(o.tatonne){ act = tatonner(); if(act) return act; }

    /* 7. l'Alchimiste, libre : soigner, ou faire mal à ce qui est ouvert */
    if(Al){
      var so = soin(c, null, false); if(so) return so;
      /* une fiole qui abat une bête d'un coup (un têtard, une bête ouverte déjà bien entamée) */
      var fioles = ['feu', 'acide'].filter(function(r){ return dans(c, r); }), coupFatal = null;
      cib.forEach(function(m){ fioles.forEach(function(r){ var d = m.ouvert !== 0 ? C.ouvert[r] : (m.def.rang === 'normal' && !(m.def.reactions[r]) ? c._ferm(m, r) : 0); if(!coupFatal && d >= m.pv) coupFatal = {heros:'alchimiste', geste:'p:' + r, cible:m.id}; }); });
      if(coupFatal) return coupFatal;
      var cibleA = cib.filter(function(m){ return m.ouvert !== 0; })[0], fiole = dans(c, 'feu') ? 'feu' : dans(c, 'acide') ? 'acide' : null;
      if(cibleA && fiole) return {heros:'alchimiste', geste:'p:' + fiole, cible:cibleA.id};
      /* sans rien savoir, elle lance ce qui fait mal sur la bête de devant (et tant pis pour les pièges) */
      if(!o.livre && fiole && cib.length && rnd() < 0.5) return {heros:'alchimiste', geste:'p:' + fiole, cible:cib[0].id};
      return {heros:'alchimiste', geste:'herbes'};             /* (les herbes : un petit soin pour toute l'équipe) */
    }
    /* 8. le Sage, libre : s'il voit, le bouclier sur celui (ou ceux) qui va prendre le plus ; sinon il ouvre l'œil (une fois
       lancée, elle dure tout le combat), ou protège à l'aveugle le plus fragile */
    if(S){
      if(oeil && gros && !gros.c.pret && !vois) return {heros:'sage', geste:'oeil'};       /* l'élan : il saura sur qui ça tombe */
      if(!vois && oeil === 'toujours') return {heros:'sage', geste:'oeil'};
      var amis = c.visables().filter(function(x){ return x !== gobe; }).sort(vois ? function(x, y){ return menace(c, y) - menace(c, x) || D.EXPOSES.indexOf(x) - D.EXPOSES.indexOf(y); } : function(x, y){ return (c.h[x].pv - c.h[y].pv) || (D.VISEE[y] - D.VISEE[x]); });
      if(!amis.length) amis = c.visables();
      return bouc(amis);
    }
    /* 9. le Pisteur, libre : une flèche trempée qui avance un combo, sinon le coup qui fait le plus mal */
    if(Pi){
      var fl = pisteurEtape(); if(fl) return fl;
      return tirer(c, cib);
    }
    var hs = c.aJouer(), gs = c.gestes(hs[0]).filter(function(g){ return g.permis; });
    return {heros:hs[0], geste:gs[0].geste, cible:gs[0].cibles[0] || null};

    /* ------ ce qu'on sait faire pour ouvrir cette bête, maintenant ------ */
    function etapes(m){
      var l = [], t = m.type, k = K(m);
      function potion(r, qui){ return {heros:qui || 'alchimiste', geste:'p:' + r, cible:m.id}; }
      function plus(e, x){ for(var z in x) e[z] = x[z]; l.push(e); }
      if(m.ouvert !== 0 || c.cache(m) || c._un(m, m.def.blinde)) return l;
      if(t === 'rat' || t === 'petitearaignee' || t === 'araignee'){
        if((k >= 1 || vuOuvrir(m, 'lumiere')) && lumiereSure(m)) plus({heros:'sage', geste:'rune', cible:m.id}, {});
        else if((k >= 3 || vuOuvrir(m, 'huile')) && dans(c, 'huile')) plus(potion('huile'), {});
      }
      else if(t === 'ratcuir'){
        if((k >= 1 || vuOuvrir(m, 'acide')) && dans(c, 'acide')) plus(potion('acide'), {dure:true, poids:5});
        else if((k >= 3 || vuOuvrir(m, 'givre')) && dans(c, 'givre')) plus(potion('givre'), {dure:true, poids:5});
        else if(k >= 4){
          if(a(c, m, 'sans-casque')){ if(lumiereSure(m)) plus({heros:'sage', geste:'rune', cible:m.id}, {}); }
          else if(c.devant() === m && !interdit('bruit', m)) plus({heros:'alchimiste', geste:'louche'}, {etape:true});
        }
      }
      else if(t === 'chauvesouris'){
        if((k >= 1 || vuOuvrir(m, 'bruit')) && !interdit('bruit', m)) plus({heros:'alchimiste', geste:'louche'}, {poids:2});
        else if((k >= 3 || vuOuvrir(m, 'colle')) && dans(c, 'colle')) plus(potion('colle'), {});
      }
      else if(t === 'feufollet'){
        if((k >= 1 || vuOuvrir(m, 'nuage')) && dans(c, 'fumigene') && !interdit('nuage', m)) plus({heros:'alchimiste', geste:'p:fumigene'}, {poids:3});
        else if(k >= 4 && !a(c, m, 'accroche') && planDe(c, m) && m.plan.cibles.length && c.visables().indexOf(m.plan.cibles[0]) >= 0 && !c.h[m.plan.cibles[0]].bouclier) plus({heros:'sage', geste:'bouclier', cible:m.plan.cibles[0]}, {etape:true});
      }
      else if(t === 'roirats'){
        if(a(c, m, 'noeud')){
          if(k >= 1 || vuOuvrir(m, 'bruit')) plus({heros:'alchimiste', geste:'louche'}, {poids:4});
          else if(k >= 3 && dans(c, 'colle')) plus(potion('colle', 'pisteur'), {dure:true});
        }
        else if(a(c, m, 'etale') && k >= 4 && !dans(c, 'fumigene')) plus({heros:'alchimiste', geste:'louche'}, {poids:9});
        else if(k >= 1 && dans(c, 'fumigene') && !interdit('nuage', m)) plus({heros:'alchimiste', geste:'p:fumigene'}, {etape:true, poids:4});
      }
      else if(t === 'gardien'){
        var sansPlaque = a(c, m, 'plaque-ouverte') || a(c, m, 'sans-plaque');
        if(sansPlaque || a(c, m, 'plaque-entrouverte')){ if((k >= 1 || vuOuvrir(m, 'lumiere')) && lumiereSure(m)) plus({heros:'sage', geste:'rune', cible:m.id}, {poids:4}); }
        else if(k >= 1 && dans(c, 'acide')) plus(potion('acide', Al ? 'alchimiste' : 'pisteur'), {etape:true, poids:6});
        else if(k >= 3 && dans(c, 'givre')) plus(potion('givre', Al ? 'alchimiste' : 'pisteur'), {etape:true, poids:6});
        else if(k >= 4){ var f = D.EXPOSES.filter(function(h){ return !c.h[h].sol && !c.h[h].avale; })[0]; if(f && !c.h[f].bouclier) plus({heros:'sage', geste:'bouclier', cible:f}, {etape:true, poids:4}); }
      }
      else if(t === 'bourbe' && k >= 1 && !a(c, m, 'dos') && !a(c, m, 'sous')){
        /* depuis le 11 novembre (19 h 21) : SEUL LE GIVRE le sort de l'eau (il saute sur la glace) ; la lumière ne lui fait rien */
        var dehors = a(c, m, 'gele');
        if(a(c, m, 'sec')){ if(dans(c, 'fumigene')) plus({heros:'alchimiste', geste:'p:fumigene'}, {dure:true, poids:9}); }
        else if(dehors){ if(dans(c, 'feu')) plus(potion('feu', Al ? 'alchimiste' : 'pisteur'), {etape:true, poids:8}); }
        else if(dans(c, 'givre')){
          /* sans fumée, il faudra le chatouiller : on le sort de l'eau un tour où il prépare un saut (il avalera au suivant) */
          var bonMoment = dans(c, 'fumigene') || !sait(m, 4) || !planDe(c, m) || m.plan.nom === (dans(c, 'feu') ? 'langue' : 'saut');
          if(bonMoment) plus(potion('givre', Al ? 'alchimiste' : 'pisteur'), {etape:true, poids:8});
        }
      }
      return l;
    }
    /* le Pisteur trempe une flèche pour avancer un combo que l'Alchimiste ne peut pas faire ce tour-ci */
    function pisteurEtape(){
      var r = null;
      viv.forEach(function(m){
        if(r || m.ouvert !== 0 || c.cache(m)) return;
        var k = K(m), t = m.type;
        if(t === 'ratcuir' && !a(c, m, 'nu')){ if(k >= 1 && dans(c, 'acide')) r = {heros:'pisteur', geste:'p:acide', cible:m.id}; else if(k >= 3 && dans(c, 'givre')) r = {heros:'pisteur', geste:'p:givre', cible:m.id}; }
        if(t === 'gardien' && !a(c, m, 'plaque-ouverte') && !a(c, m, 'sans-plaque')){ if(k >= 1 && dans(c, 'acide')) r = {heros:'pisteur', geste:'p:acide', cible:m.id}; else if(k >= 3 && dans(c, 'givre')) r = {heros:'pisteur', geste:'p:givre', cible:m.id}; }
        if(t === 'bourbe' && k >= 1 && (a(c, m, 'berge') || a(c, m, 'gele')) && !a(c, m, 'sec') && !a(c, m, 'dos') && dans(c, 'feu')) r = {heros:'pisteur', geste:'p:feu', cible:m.id};
        if(t === 'roirats' && k >= 3 && a(c, m, 'noeud') && dans(c, 'colle') && !Al) r = {heros:'pisteur', geste:'p:colle', cible:m.id};
      });
      return r;
    }
    /* à tâtons : un pouvoir jamais essayé sur ce genre de bête */
    function tatonner(){
      var essais = [];
      cib.forEach(function(m){
        if(m.ouvert !== 0) return;
        var t = cle(m.type);
        function neuf(pv){ return mem.vu[t + ':' + pv] === undefined; }
        if(S && neuf('lumiere')) essais.push({heros:'sage', geste:'rune', cible:m.id, pouvoir:'lumiere', t:t});
        if(Al && neuf('bruit')) essais.push({heros:'alchimiste', geste:'louche', pouvoir:'bruit', t:t});
        if(Al) c.sac.forEach(function(rid){ var rc = D.RECETTES[rid]; if(rc.pouvoir && neuf(rc.pouvoir)) essais.push({heros:'alchimiste', geste:'p:' + rid, cible:rc.vise === 'bete' ? m.id : null, pouvoir:rc.pouvoir, t:t}); });
      });
      if(!essais.length) return null;
      return essais[Math.floor(rnd() * essais.length)];
    }
  };
}
/* le soin de l'Alchimiste : urgent (il faut sauver h) ou de confort (le plus abîmé, si ça vaut un geste) */
function soin(c, h, urgent){
  var am = c.visables().slice().sort(function(x, y){ return (c.h[x].pv / c.h[x].pvMax) - (c.h[y].pv / c.h[y].pvMax); });
  if(!am.length) return null;
  var qui = h || am[0], manque = c.h[qui].pvMax - c.h[qui].pv;
  if(dans(c, 'baumelum')){
    var tot = 0; c.visables().forEach(function(x){ tot += Math.min(D.RECETTES.baumelum.soinEquipe, c.h[x].pvMax - c.h[x].pv); });
    if(tot >= (dans(c, 'baume') ? 41 : 30) && !(urgent && manque > 40 && dans(c, 'baume'))) return {heros:'alchimiste', geste:'p:baumelum'};
  }
  if(dans(c, 'baume') && (manque >= 40 || (urgent && manque >= 20))) return {heros:'alchimiste', geste:'p:baume', cible:qui};
  /* les herbes : un petit soin pour chacun (depuis le 11 novembre) — elles valent le geste dès que deux héros en profitent */
  var gain = 0; c.visables().forEach(function(x){ gain += Math.min(D.CHIFFRES.herbes, c.h[x].pvMax - c.h[x].pv); });
  if(gain >= D.CHIFFRES.herbes * 2 || (urgent && manque > 0) || (gain > 0 && !dans(c, 'baume') && c.h[qui].pv / c.h[qui].pvMax < 0.7)) return {heros:'alchimiste', geste:'herbes'};
  return null;
}
/* le Pisteur choisit sa cible et son arme : d'abord ce qu'il abat d'un coup (le plus dangereux), sinon ce qui fait le plus mal */
function tirer(c, cibles){
  /* depuis le 10 novembre, le Pisteur porte tous ses carquois et choisit sa flèche : la maligne prend celle qui est faite
     pour la bête, jamais celle qui rebondit ou qui passe à travers */
  var carq = c._carquoisPortes().map(function(o){ return {id:o, O:D.OBJETS[o]}; }), portee = c.aPortee(), best = null;
  cibles.forEach(function(m){
    if(c._un(m, m.def.blinde)) return;
    var q = carq.filter(function(x){ return x.O.contre.indexOf(m.type) >= 0; })[0], bonus = !!q, imm = m.def.rang !== 'normal' && m.ouvert === 0;
    var fl = m.ouvert !== 0 ? c.critiqueDe(m, 'fleche', bonus ? q.O.critique : 0) : (bonus && m.def.rang === 'normal') ? q.O.ferme : imm ? 0 : c._ferm(m, 'fleche');
    var dg = portee.indexOf(m) < 0 ? -1 : m.ouvert !== 0 ? c.critiqueDe(m, 'dague') : imm ? 0 : c._ferm(m, 'dague');
    var arme = dg > fl ? 'dague' : (q ? 'f:' + q.id : 'fleche'), d = Math.max(fl, dg), tue = d >= m.pv;
    var note = (tue ? 1000 + danger(m) : 0) + Math.min(d, m.pv) + danger(m) / 100;
    if(!best || note > best.note) best = {note:note, m:m, arme:arme};
  });
  if(!best) return {heros:'pisteur', geste:'fleche', cible:cibles[0] ? cibles[0].id : c.ciblables()[0].id};
  return {heros:'pisteur', geste:best.arme, cible:best.m.id};
}

/* ---------- la maligne, mais distraite : un geste sur quatre est joué n'importe comment (une famille, pas un robot) ---------- */
function distraite(base, part){
  return function(c, p, mem, rnd){
    var act = base(c, p, mem, rnd);
    if(rnd() >= part || c.h[act.heros].avale) return act;
    var gs = c.gestes(act.heros).filter(function(g){ return g.permis; }), g = gs[Math.floor(rnd() * gs.length)];
    return {heros:act.heros, geste:g.geste, cible:g.cibles.length ? g.cibles[Math.floor(rnd() * g.cibles.length)] : null};
  };
}

var EQUIPES = {
  maligne:{nom:'Maligne', choisir:reflechie({livre:true})},
  /* pour mesurer ce que vaut la rune de l'œil : la même, qui ne regarde que les gros coups ; et la même, qui ne regarde jamais */
  oeilGros:{nom:'Maligne, l\'œil seulement pour les gros coups', choisir:reflechie({livre:true, oeil:'gros'})},
  sansOeil:{nom:'Maligne, sans la rune de l\'œil', choisir:reflechie({livre:true, oeil:false})},
  /* les trois équipes de Romain (11 novembre) : celle qui connaît tous les combos = maligne ; celle qui découvre le donjon ;
     celle qui appuie au hasard = hasard */
  decouvre:{nom:'Découvre le donjon (4 tours pour comprendre chaque monstre)', choisir:reflechie({livre:true, apprend:1, tatonne:true})},
  decouvreLent:{nom:'Découvre le donjon, lentement (8 tours par monstre)', choisir:reflechie({livre:true, apprend:0.5, tatonne:true})},
  sansSage:{nom:'Sans le Sage', choisir:reflechie({livre:false})},
  tape:{nom:'Tape sans réfléchir', choisir:tape},
  hasard:{nom:'Au hasard', choisir:auHasard},
  tatons:{nom:'Sans le Sage, à tâtons', choisir:reflechie({livre:false, tatonne:true})},
  tapePotions:{nom:'Tape, avec le feu au lieu de la louche', choisir:tapePotions},
  distraite10:{nom:'Maligne, un geste sur dix au hasard', choisir:distraite(reflechie({livre:true}), 0.10)},
  distraite25:{nom:'Maligne, un geste sur quatre au hasard', choisir:distraite(reflechie({livre:true}), 0.25)}
};

/* ===================================================================== UN COMBAT joué par une équipe */
function jouerCombat(p, salle, equipe, rnd, mem){
  var c = R.combat(p, salle, {alea:rnd}), chaud = false, rouge = false, tombes = 0, garde = 0;
  while(!c.fini() && c.tour <= MAX_TOURS && garde++ < 600){
    if(!c.aJouer().length){
      var evm = c.tourMonstres();
      evm.forEach(function(e){ if(e.t === 'tombe'){ tombes++; chaud = true; } });
      D.EXPOSES.forEach(function(h){ if(!c.h[h].sol && c.h[h].pv <= 0.25 * c.h[h].pvMax) rouge = true; });
      continue;
    }
    var act = equipe.choisir(c, p, mem, rnd), ev = c.jouer(act.heros, act);
    if(ev[0] && ev[0].t === 'refus'){                 /* la politique s'est trompée : n'importe quel geste permis, pour ne pas tourner en rond */
      mem.refus = (mem.refus || 0) + 1; mem.dernierRefus = salle + ' ' + act.heros + ' ' + act.geste + ' ' + ev[0].mot;
      act = auHasard(c, p, mem, rnd); ev = c.jouer(act.heros, act);
    }
    /* ce que l'équipe voit et retient (sans Grand Livre) : ce pouvoir a ouvert, ou renforcé, ce genre de bête */
    if(mem.vu) ev.forEach(function(e, i){
      if(e.t === 'tombe'){ tombes++; chaud = true; }
      if(e.t !== 'touche') return;
      var m = c.bete(e.bete), k = cle(m.type) + ':' + e.coup;
      if(e.piege) mem.vu[k] = 'piege';
      else if(ev.some(function(x, j){ return j > i && x.t === 'ouvert' && x.bete === e.bete && !x.deja; })) mem.vu[k] = 'ouvre';
      else if(mem.vu[k] === undefined) mem.vu[k] = 'rien';
    });
  }
  var res = c.fini() || 'long', pv = 0;
  D.EXPOSES.forEach(function(h){ pv += c.h[h].sol ? 0 : c.h[h].pv; });
  return {res:res, tours:c.tour, pv:pv, chaud:chaud || rouge, rouge:rouge, tombes:tombes, pieges:c.pieges || 0};
}

/* ===================================================================== LES SALLES, UNE PAR UNE (à pleins PV) */
var SALLES = ['rats', 'canaux', 'toiles', 'atelier', 'ossuaire', 'bassin', 'egouts', 'crypte'];
/* ce que l'équipe maligne a déjà lu en arrivant pour la première fois dans chaque salle (une ligne par bête déjà rencontrée) */
var LU_AVANT = {
  rats:{}, canaux:{rat:1}, egouts:{rat:1}, toiles:{rat:1, chauvesouris:1}, atelier:{rat:1, chauvesouris:1, araignee:1, feufollet:1},
  crypte:{rat:1, chauvesouris:1, araignee:1, feufollet:1, gardien:1, ratcuir:1},
  ossuaire:{rat:1, chauvesouris:1, araignee:1, feufollet:1, gardien:1, ratcuir:1},
  bassin:{rat:1, chauvesouris:1, araignee:1, feufollet:1, gardien:1, ratcuir:1, roirats:1}
};
var TOUT_LU = {}; Object.keys(D.LIVRE).forEach(function(k){ TOUT_LU[k] = 4; });      /* (ne sert plus : le carnet de l'aventurier a toutes ses pages dès l'entrée) */
/* depuis le 10 novembre, une étude donne toute la page du monstre d'un coup (un code pour le Sage) : « déjà lu » = tout lu */
Object.keys(LU_AVANT).forEach(function(sa){ Object.keys(LU_AVANT[sa]).forEach(function(k){ LU_AVANT[sa][k] = TOUT_LU[k]; }); });
/* le sac et les objets raisonnables de l'équipe maligne, salle par salle */
var SAC_AVANT_CAMP = ['fumigene', 'acide', 'baume'], SAC_BOSS = ['feu', 'fumigene', 'baume'];
function tenue(p, o){
  o = o || {};
  /* depuis le 10 novembre : plus de sac à choisir. o.sac, quand il est donné, veut dire « l'Alchimiste n'a su créer que
     ces potions-là » (les essais « avec un mauvais sac ») ; sinon il les a toutes. */
  if(o.sac) p.recettes = o.sac.slice();
  p.heros.pisteur.objets = ['fleches-normales'].concat(o.pisteur ? [o.pisteur] : []);
  p.heros.sage.objets = o.sage ? [].concat(o.sage) : [];
  p.heros.alchimiste.objets = [];
  if(o.recettes) o.recettes.forEach(function(r){ if(p.recettes.indexOf(r) < 0) p.recettes.push(r); });
}
function tenueDe(salle, variante){
  var apres = ['atelier', 'crypte', 'ossuaire', 'bassin'].indexOf(salle) >= 0;
  var o = {pisteur:salle === 'rats' ? null : 'fleches-lourdes', sage:['ossuaire', 'bassin', 'crypte'].indexOf(salle) >= 0 ? 'baton-chene' : null};
  /* devant Bourbe, l'équipe maligne a le Givre (la fleur cueillie près des canaux, le chaudron, le code) : depuis le
     11 novembre au soir, lui seul sort Bourbe de l'eau */
  if(salle === 'bassin') o.recettes = ['givre'];
  if(variante) for(var k in variante) o[k] = variante[k];
  return o;
}
function stats(liste){
  var v = liste.filter(function(x){ return x.res === 'victoire'; }), d = liste.filter(function(x){ return x.res === 'defaite'; }), l = liste.filter(function(x){ return x.res === 'long'; });
  function moy(t, f){ return t.length ? t.reduce(function(s, x){ return s + f(x); }, 0) / t.length : 0; }
  return {n:liste.length, victoires:100 * v.length / liste.length, longs:100 * l.length / liste.length,
    tours:moy(v, function(x){ return x.tours; }), pv:moy(v, function(x){ return x.pv; }), toursDefaite:moy(d, function(x){ return x.tours; }),
    chaud:100 * moy(liste, function(x){ return x.chaud ? 1 : 0; }), pieges:moy(liste, function(x){ return x.pieges; })};
}
function salleSeule(salle, idEquipe, o){
  o = o || {};
  var res = [], eq = EQUIPES[idEquipe];
  for(var g = 1; g <= N; g++){
    var p = R.nouvellePartie(g);
    tenue(p, o.tenue || tenueDe(salle));
    p.livre = JSON.parse(JSON.stringify(o.livre || (idEquipe === 'maligne' ? LU_AVANT[salle] : {})));
    if(o.pv) D.EXPOSES.forEach(function(h){ p.heros[h].pv = Math.max(1, Math.round(p.heros[h].pvMax * o.pv)); });
    var mem = {vu:{}};
    res.push(jouerCombat(p, salle, eq, R.alea(g * 7919 + salle.length * 31 + idEquipe.length), mem));
    if(mem.refus) refusTotal += mem.refus, dernierRefus = mem.dernierRefus;
  }
  return stats(res);
}
var refusTotal = 0, dernierRefus = '';

/* ===================================================================== LE DONJON ENTIER
   Le chemin d'une équipe qui suit le plan du Sage : chaque pas est un lieu ; « sauve » : elle tape une page blanche avant. */
function chemin(o){
  var l = ['puits'];
  if(o.sacoche) l.push('aeration');
  l = l.concat(['rats', 'reserve', 'canaux']);
  if(o.egouts) l.push('egouts', 'canaux');
  l = l.concat(['givre', 'toiles']);
  /* (le raccourci du crâne, du cul-de-sac éboulé au feu de camp, a été enlevé le 11 novembre : plus de repos avant l'ossuaire) */
  l = l.concat(['dalles', {sauve:'sauve:1'}, 'atelier', 'bibliotheque', 'portes']);
  if(o.crypte) l.push('crypte', 'portes');
  l = l.concat([{sauve:'sauve:2'}, 'ossuaire', 'camp', {sauve:'sauve:3'}, 'bassin', 'porte4', 'leo']);
  return l;
}
function descente(graine, idEquipe, o){
  var eq = EQUIPES[idEquipe], rnd = R.alea(graine * 104729 + 17), p = R.nouvellePartie(graine), mem = {vu:{}};
  var route = chemin(o), i = 0, iSauve = 0, defaites = 0, journal = {}, chaud = false, tombes = 0, mortA = null, garde = 0;
  if(o.sac) p.recettes = o.sac.slice();                     /* (un essai où l'Alchimiste n'a pas toutes ses potions) */
  while(i < route.length && garde++ < 400){
    var pas = route[i];
    if(typeof pas === 'object'){ if(o.sauve !== false && !p.codes[pas.sauve]){ R.code(p, pas.sauve); iSauve = i; } i++; continue; }
    var ev = R.entrer(p, pas), cb = ev.filter(function(e){ return e.t === 'combat'; })[0];
    if(cb){
      var avant = 0; D.EXPOSES.forEach(function(h){ avant += p.heros[h].pv; });
      var r = jouerCombat(p, cb.salle, eq, rnd, mem);
      var j = journal[cb.salle] = journal[cb.salle] || {essais:0, victoire:false, tours:0, pvAvant:avant, pvApres:0};
      j.essais++;
      if(r.chaud) chaud = true;
      tombes += r.tombes;
      if(r.res !== 'victoire'){
        defaites++; mortA = mortA || cb.salle;
        if(o.sauve === false || defaites > (o.essaisMax == null ? 6 : o.essaisMax)){ return {gagne:false, defaites:defaites, mortA:cb.salle, premiereChute:mortA, journal:journal, chaud:chaud, tombes:tombes}; }
        R.fuir(p, cb.salle); i = iSauve;
        continue;
      }
      j.victoire = true; j.tours = r.tours; j.pvApres = r.pv;
      R.entrer(p, pas);
    }
    /* ce qu'on fait dans les salles sans combat */
    if(pas === 'aeration'){ R.prendre(p, 'herbes'); }
    if(pas === 'reserve' && o.pisteur) R.prendre(p, o.pisteur);
    if(pas === 'givre') R.prendre(p, 'fleur-givre');
    if(pas === 'camp'){
      R.repos(p);
      if(p.faits['combat:ossuaire']){
        /* le Givre est devenu obligatoire contre Bourbe : l'équipe qui a cueilli la fleur tape le code de l'Alchimiste */
        if(o.givre !== false && p.faits['objet:fleur-givre']) R.code(p, 'recette:givre');
      }
    }
    if(pas === 'dalles' && !p.faits['piege:dalles']){
      /* avec le plan du Sage : le code des dalles (« N B B, N B N », depuis le 10 novembre). Sans lui : on essaie, et on
         retient ce qui a mordu. (La simulation lisait encore l'ancienne liste des dalles claires : elle arrivait à l'atelier
         presque morte. Réparé le 11 novembre.) */
      var connu = {}, n = 0;
      while(!p.faits['piege:dalles'] && n++ < 60){
        var k = p.faits.dalles || 0, cote = o.plan !== false ? R.dalleSure(k) : connu[k] || (rnd() < 0.5 ? 'fond' : 'devant');
        var e2 = R.dalle(p, cote);
        if(e2[0].sure) connu[k] = cote; else connu[k] = cote === 'fond' ? 'devant' : 'fond';
      }
    }
    if(pas === 'bibliotheque'){ R.prendre(p, 'page-dechiree'); if(o.sage){ R.prendre(p, 'cristal-lune'); R.prendre(p, 'baton-chene'); } }        /* (le Sage prend ses deux armes) */
    if(pas === 'crypte' && p.faits['combat:crypte'] && !p.faits['objet:amulette']) R.prendre(p, 'amulette', 'pisteur');
    i++;
  }
  /* (13 novembre) « arriver chez Léo » : être entré dans la dernière salle (son combat, en temps réel, a sa propre simulation : leo-sim.js) */
  return {gagne:!!p.faits['code:leo:salle'], defaites:defaites, mortA:null, premiereChute:mortA, journal:journal, chaud:chaud, tombes:tombes, pv:D.EXPOSES.map(function(h){ return p.heros[h].pv; })};
}
function donjon(idEquipe, o, n){
  var l = [];
  for(var g = 1; g <= (n || N); g++) l.push(descente(g, idEquipe, o));
  var gagnes = l.filter(function(x){ return x.gagne; }), r = {n:l.length};
  r.gagne = 100 * gagnes.length / l.length;
  r.traite = 100 * l.filter(function(x){ return x.gagne && x.defaites === 0; }).length / l.length;
  r.un = 100 * l.filter(function(x){ return x.gagne && x.defaites <= 1; }).length / l.length;
  r.deux = 100 * l.filter(function(x){ return x.gagne && x.defaites <= 2; }).length / l.length;
  r.defaites = l.reduce(function(s, x){ return s + x.defaites; }, 0) / l.length;
  r.chaud = 100 * l.filter(function(x){ return x.chaud; }).length / l.length;
  r.tombe = 100 * l.filter(function(x){ return x.tombes > 0; }).length / l.length;
  r.salles = {};
  D.CHEMIN.concat(['egouts', 'crypte']).forEach(function(s){
    var js = l.map(function(x){ return x.journal[s]; }).filter(Boolean), v = js.filter(function(j){ return j.victoire; });
    function moy(t, f){ return t.length ? t.reduce(function(a2, x){ return a2 + f(x); }, 0) / t.length : 0; }
    r.salles[s] = {atteinte:100 * js.length / l.length, passee:100 * v.length / l.length, premier:js.length ? 100 * js.filter(function(j){ return j.victoire && j.essais === 1; }).length / js.length : 0,
      tours:moy(v, function(j){ return j.tours; }), pvAvant:moy(js, function(j){ return j.pvAvant; }), pvApres:moy(v, function(j){ return j.pvApres; })};
  });
  r.chutes = {};
  l.forEach(function(x){ if(x.premiereChute) r.chutes[x.premiereChute] = (r.chutes[x.premiereChute] || 0) + 1; });
  return r;
}

/* (pour les essais : require('./equilibre.js') donne les équipes et les outils, sans lancer le rapport) */
if(require.main !== module){ module.exports = {EQUIPES:EQUIPES, jouerCombat:jouerCombat, salleSeule:salleSeule, descente:descente, donjon:donjon, tenue:tenue, tenueDe:tenueDe, LU_AVANT:LU_AVANT, TOUT_LU:TOUT_LU, menace:menace}; return; }

/* ===================================================================== LE RAPPORT */
var out = [], cibles = [];
function dire(s){ out.push(s == null ? '' : s); }
function p1(x){ return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
function p0(x){ return String(Math.round(x)); }
function cible(okk, texte){ cibles.push({ok:!!okk, texte:texte}); }
function tableau(tetes, lignes){
  dire('| ' + tetes.join(' | ') + ' |');
  dire('|' + tetes.map(function(){ return '---'; }).join('|') + '|');
  lignes.forEach(function(l){ dire('| ' + l.join(' | ') + ' |'); });
  dire();
}

var t0 = Date.now();
dire('# Le donjon du puits — la difficulté, prouvée par la simulation');
dire();
dire('> Écrit par `node equilibre.js ' + N + ' --md` avec les règles de `src/regles.js` et les chiffres de `src/donnees.js`.');
dire('> ' + N + ' parties par ligne. Ne pas corriger ce fichier à la main : changer un chiffre dans `donnees.js`, puis relancer.');
dire();
dire('## Les chiffres retenus');
dire();
dire('Les PV sont ceux des fiches du bestiaire. Les chiffres du rat d\'égout et des héros sont ceux de la salle d\'essai : ils n\'ont pas bougé.');
dire();
tableau(['Monstre', 'Rang', 'PV', 'Attaque'], Object.keys(D.MONSTRES).map(function(k){
  var M = D.MONSTRES[k], att = Object.keys(M.attaques).map(function(n){
    var A = M.attaques[n], t = n + ' ' + A.degats;
    if(A.cibles === 'tous') t += ' sur chaque héros'; else if(A.cibles === 'deux') t += ' sur 2 héros'; else if(A.cibles === 'devant') t += ' sur le héros de devant';
    if(A.foisSi) for(var e in A.foisSi) t += ' (' + A.foisSi[e] + ' fois si « ' + e + ' »)';
    if(A.plusSi) for(var e2 in A.plusSi) t += ' (+' + A.plusSi[e2] + ' si « ' + e2 + ' »)';
    if(A.doubleSi) t += ' (doublé si « ' + A.doubleSi.join(' », « ') + ' »)';
    if(A.pose) t = n + ' : le héros passe son tour'; if(A.avale) t += ', et il avale';
    return t;
  }).join(' ; ');
  return [M.nom, M.rang, String(M.pv), att];
}));
dire('Héros : Pisteur ' + D.HEROS.pisteur.pv + ' PV, Alchimiste ' + D.HEROS.alchimiste.pv + ', Sage ' + D.HEROS.sage.pv + '. Herbes +' + C.herbes + ', Baume +' + D.RECETTES.baume.soin + ', Baume lumineux +' + D.RECETTES.baumelum.soinEquipe + ' à chacun, Cœur vaillant : relève avec ' + D.RECETTES.coeur.releve + ', feu de camp : la moitié des PV max. Bouclier de runes : la moitié des coups. Critique : ' + C.critique.normal.fleche + ' / ' + C.critique.normal.dague + ' (flèche / dague) sur un monstre normal, ' + C.critique.elite.fleche + ' / ' + C.critique.elite.dague + ' sur un élite, ' + C.critique.boss.fleche + ' / ' + C.critique.boss.dague + ' sur le boss.');
dire();
dire('## Les équipes');
dire();
dire('- **Maligne** : le Sage étudie ce qu\'il ne connaît pas, les deux autres se servent tout de suite de ce qu\'il lit ; elle ouvre les points faibles dans l\'ordre, soigne quand un ami va tomber, protège celui qui est visé, sauvegarde avant les trois grandes portes. Sac : Fumigène, Acide, Baume (puis Feu, Fumigène, Baume au feu de camp) ; flèches lourdes ; bâton de chêne.');
dire('- **Sans le Sage** : elle joue aussi bien (soins, boucliers, elle tire sur tout ce qui est ouvert), mais n\'étudie jamais et ne connaît aucun combo.');
dire('- **Tape sans réfléchir** : flèche ou dague sur la bête de devant, coup de louche, bouclier sur le Pisteur.');
dire('- **Au hasard** : des gestes permis tirés au hasard.');
dire('- **À tâtons** (en plus, pour vérifier que « sans le Sage » tient vraiment) : comme « sans le Sage », mais elle essaie sur chaque bête les pouvoirs qu\'elle n\'a jamais essayés, et retient ce qui a ouvert ou renforcé.');
dire();

/* ---------- 1. salle par salle ---------- */
dire('## 1. Salle par salle (on arrive à pleins PV)');
dire();
dire('« Tours » et « PV restants » : la moyenne des combats gagnés (les trois héros ont 310 PV en tout). « Tombe au tour » : la moyenne des combats perdus. « Ni l\'un ni l\'autre » : l\'équipe tient debout à force de soins et de boucliers, mais ne peut rien faire au monstre : il ne lui reste qu\'à fuir. Toutes les équipes ont ici le sac et les objets de la maligne (c\'est le cas le plus favorable pour elles). L\'équipe maligne arrive en ayant lu une ligne sur chaque bête déjà croisée dans les salles d\'avant, rien sur les nouvelles.');
dire();
var PAR_SALLE = {};
SALLES.forEach(function(s){
  var def = D.COMBATS[s], lignes = [];
  PAR_SALLE[s] = {};
  ['maligne', 'sansSage', 'tape', 'tapePotions', 'hasard', 'tatons'].forEach(function(id){
    var st = PAR_SALLE[s][id] = salleSeule(s, id);
    lignes.push([EQUIPES[id].nom, p1(st.victoires) + ' %', st.victoires > 0 ? p1(st.tours) : '—', st.victoires > 0 ? p0(st.pv) : '—', st.toursDefaite > 0 ? p1(st.toursDefaite) : '—', st.longs > 0.05 ? p1(st.longs) + ' %' : '—']);
  });
  dire('### ' + def.nom + ' — ' + def.monstres.map(function(m){ return D.MONSTRES[m].nom; }).join(', '));
  dire();
  tableau(['Équipe', 'Victoires', 'Tours', 'PV restants', 'Tombe au tour', 'Ni l\'un ni l\'autre après 40 tours'], lignes);
});

/* ---------- 2. le soin infini ---------- */
dire('## 2. Le soin infini ne suffit pas');
dire();
var soinMax = Math.max(D.RECETTES.baume.soin, 3 * D.RECETTES.baumelum.soinEquipe, C.herbes);
dire('Le plus gros soin d\'un geste : ' + soinMax + ' PV (Baume ' + D.RECETTES.baume.soin + ' ; Baume lumineux 3 × ' + D.RECETTES.baumelum.soinEquipe + ' ; Herbes ' + C.herbes + '). Ce que les monstres d\'une salle enlèvent par tour, à pleine force et sans piège :');
dire();
var lignesSoin = [];
D.CHEMIN.forEach(function(s, i){
  var tot = 0, detail = [];
  D.COMBATS[s].monstres.forEach(function(m){
    var M = D.MONSTRES[m], moy = 0;
    M.rythme.forEach(function(nom){ var A = M.attaques[nom]; moy += A.degats * (A.cibles === 'tous' ? 3 : A.cibles === 'deux' ? 2 : 1); });
    moy /= M.rythme.length; tot += moy; detail.push(M.nom + ' ' + p0(moy));
  });
  lignesSoin.push([D.COMBATS[s].nom, detail.join(' + '), p0(tot), i === 0 ? 'l\'apprentissage' : tot > soinMax ? 'oui' : 'NON']);
  if(i > 0) cible(tot > soinMax, 'soin : ' + D.COMBATS[s].nom + ' enlève ' + p0(tot) + ' par tour, plus que le plus gros soin (' + soinMax + ')');
});
tableau(['Salle', 'Les monstres', 'Par tour', 'Plus que le soin ?'], lignesSoin);

/* ---------- 3. les mauvaises potions ---------- */
dire('## 3. Avec les « mauvaises » potions : il reste toujours une sortie, plus difficile');
dire();
dire('L\'équipe maligne, le Grand Livre déjà lu en entier (elle est déjà venue), à pleins PV, sans flèches spéciales ni bâton. Trois sacs : le bon ; « Huile, Colle, Cœur vaillant » (aucune des potions attendues, et pas de Baume) ; « Baume, Cœur vaillant, Huile » (que du soin). Aux canaux, aucune potion n\'est nécessaire (le bruit et la lumière sont des gestes) : ils ne sont pas dans ce tableau.');
dire();
var MAUVAIS = {}, lignesM = [];
['toiles', 'atelier', 'ossuaire', 'bassin'].forEach(function(s){
  var bon = salleSeule(s, 'maligne', {livre:TOUT_LU, tenue:s === 'bassin' ? {recettes:['givre']} : {}});      /* toutes ses potions (et le Givre devant Bourbe) */
  var m1 = salleSeule(s, 'maligne', {livre:TOUT_LU, tenue:{sac:['huile', 'colle', 'coeur']}});
  var m2 = salleSeule(s, 'maligne', {livre:TOUT_LU, tenue:{sac:['baume', 'coeur', 'huile']}});
  MAUVAIS[s] = {bon:bon, m1:m1, m2:m2};
  function c3(st){ return p1(st.victoires) + ' % · ' + p1(st.tours) + ' tours · ' + p0(st.pv) + ' PV'; }
  lignesM.push([D.COMBATS[s].nom, c3(bon), c3(m1), c3(m2)]);
  /* le grand bassin est l'exception voulue (Romain, 11 novembre, 19 h 21 : « il n'y a que la glace qui fonctionne ») */
  if(s === 'bassin'){ cible(m1.victoires === 0 && m2.victoires === 0, 'sans le Givre, Bourbe ne se bat pas (voulu : lui seul le sort de l\'eau) : ' + p1(m1.victoires) + ' % et ' + p1(m2.victoires) + ' %'); return; }
  cible(m1.victoires >= 30 && m2.victoires >= 30, 'sortie sans la bonne potion : ' + D.COMBATS[s].nom + ' reste faisable (' + p1(m1.victoires) + ' % et ' + p1(m2.victoires) + ' %)');
  function dur(m){ return m.victoires < bon.victoires - 1 || m.tours > bon.tours + 0.5 || m.pv < bon.pv - 20; }
  cible(dur(m1) && dur(m2), 'sortie sans la bonne potion : ' + D.COMBATS[s].nom + ' est plus difficile qu\'avec le bon sac (moins de victoires, plus de tours ou moins de PV à la fin)');
});
tableau(['Salle', 'Le bon sac', 'Huile, Colle, Cœur', 'Baume, Cœur, Huile'], lignesM);

/* ---------- 4. le donjon entier ---------- */
dire('## 4. Le donjon entier');
dire();
dire('Le chemin long, du fond du puits à Léo. Les PV ne reviennent pas entre les salles ; le feu de camp rend la moitié des PV max, une fois entre deux combats. « D\'une traite » : sans tomber une seule fois. Une défaite recharge la dernière sauvegarde (le Grand Livre garde ce qu\'il a lu) et l\'équipe réessaie.');
dire();
var BASE = {sacoche:false, pisteur:'fleches-lourdes', sage:'baton-chene', crypte:false, plan:true};
var VARIANTES = [
  ['base', 'Maligne (lourdes, bâton)', 'maligne', BASE],
  ['sacoche', '… avec la sacoche (Feu en plus, puis Cœur vaillant)', 'maligne', {sacoche:true, sac4:['fumigene', 'acide', 'baume', 'feu'], sacBoss:['feu', 'fumigene', 'baume', 'coeur'], pisteur:'fleches-lourdes', sage:'baton-chene'}],
  ['argent', '… avec les flèches d\'argent', 'maligne', {pisteur:'fleches-argent', sage:'baton-chene'}],
  ['sansGivre', '… qui n\'a pas cueilli la fleur de givre (pas de Givre contre Bourbe)', 'maligne', {pisteur:'fleches-lourdes', sage:'baton-chene', givre:false}],
  ['cristal', '… avec le cristal de lune au lieu du bâton', 'maligne', {pisteur:'fleches-lourdes', sage:'cristal-lune'}],
  ['crypte', '… qui passe par la fausse crypte (l\'amulette)', 'maligne', {pisteur:'fleches-lourdes', sage:'baton-chene', crypte:true}],
  ['sansSauve', '… sans aucune sauvegarde', 'maligne', {pisteur:'fleches-lourdes', sage:'baton-chene', sauve:false}],
  ['sacRats', '… qui garde le sac de la salle des rats (Feu, Huile, Baume) jusqu\'au feu de camp', 'maligne', {pisteur:'fleches-lourdes', sage:'baton-chene', sac:['feu', 'huile', 'baume']}],
  ['d10', 'Distraite : un geste sur dix joué au hasard', 'distraite10', BASE],
  ['d25', 'Très distraite : un geste sur quatre joué au hasard', 'distraite25', BASE]
];
var DONJ = {}, lignesD = [];
VARIANTES.forEach(function(v){
  var r = donjon(v[2], v[3]); DONJ[v[0]] = r;
  lignesD.push([v[1], p1(r.traite) + ' %', p1(r.un) + ' %', p1(r.deux) + ' %', r.defaites.toFixed(2).replace('.', ','), p0(r.chaud) + ' %', p0(r.tombe) + ' %']);
});
tableau(['Équipe', 'D\'une traite', 'Avec 1 rechargement au plus', 'Avec 2 au plus', 'Défaites par descente', 'Un héros dans le rouge', 'Un héros au sol'], lignesD);
dire('« Un héros dans le rouge » : au moins une fois dans la descente, un héros a fini un tour avec un quart de ses PV ou moins (ou au sol). C\'est ce qu\'on appelle ici un moment chaud. Les deux dernières lignes montrent ce que coûtent les étourderies : c\'est plus près d\'une vraie famille que le robot du haut.');
dire();
var M = DONJ.base;
dire('### L\'équipe maligne, salle après salle');
dire();
tableau(['Salle', 'PV en entrant', 'Gagnée du premier coup', 'Tours', 'PV en sortant'], D.CHEMIN.map(function(s){
  var x = M.salles[s]; return [D.COMBATS[s].nom, p0(x.pvAvant), p1(x.premier) + ' %', p1(x.tours), p0(x.pvApres)];
}));
dire('### Les autres équipes dans le donjon (sans sauvegarde, sans le plan du Sage)');
dire();
var AUTRES = {}, lignesA = [];
[['sansSage', 'Sans le Sage'], ['tape', 'Tape sans réfléchir'], ['tapePotions', 'Tape, avec le feu au lieu de la louche'], ['hasard', 'Au hasard'], ['tatons', 'À tâtons']].forEach(function(e){
  var r = donjon(e[0], {pisteur:'fleches-lourdes', sage:'baton-chene', sauve:false, plan:false, sac:e[0] === 'tape' || e[0] === 'tapePotions' || e[0] === 'hasard' ? ['feu', 'huile', 'baume'] : SAC_AVANT_CAMP});
  AUTRES[e[0]] = r;
  lignesA.push([e[1]].concat(D.CHEMIN.map(function(s){ return p1(r.salles[s].passee) + ' %'; })));
});
tableau(['Équipe'].concat(D.CHEMIN.map(function(s){ return 'passe ' + D.COMBATS[s].nom.replace(/^(La |Le |Les |L')/, ''); })), lignesA);

/* ---------- les cibles ---------- */
var S = PAR_SALLE;
cible(M.traite > 85, 'maligne : elle gagne le donjon d\'une traite plus de 85 % des fois (' + p1(M.traite) + ' %)');
cible(M.chaud >= 30, 'maligne : avec des moments chauds (un héros dans le rouge dans ' + p0(M.chaud) + ' % des descentes)');
['canaux', 'toiles'].forEach(function(s){ cible(S[s].maligne.victoires >= 95 && S[s].maligne.tours <= 4.5, 'maligne : ' + D.COMBATS[s].nom + ' gagnée en 3 ou 4 tours (' + p1(S[s].maligne.tours) + ' tours, ' + p1(S[s].maligne.victoires) + ' %)'); });
['atelier', 'ossuaire', 'bassin'].forEach(function(s){
  cible(S[s].maligne.victoires >= 95, 'maligne : ' + D.COMBATS[s].nom + ' est faisable à pleins PV (' + p1(S[s].maligne.victoires) + ' %)');
  cible(S[s].sansSage.victoires < 5, 'sans le Sage : elle ne bat pas ' + D.COMBATS[s].nom + ' (' + p1(S[s].sansSage.victoires) + ' % de victoires)');
});
cible(AUTRES.sansSage.gagne < 1, 'sans le Sage : personne n\'arrive chez Léo (' + p1(AUTRES.sansSage.gagne) + ' %)');
cible(AUTRES.tatons.gagne < 5, 'à tâtons (sans le Sage, en essayant tout) : personne n\'arrive chez Léo non plus (' + p1(AUTRES.tatons.gagne) + ' %)');
cible(AUTRES.tape.salles.canaux.passee < 5, 'tape sans réfléchir : elle perd dès la salle 2 (' + p1(AUTRES.tape.salles.canaux.passee) + ' % passent les canaux)');
cible(AUTRES.tapePotions.salles.canaux.passee < 15 && AUTRES.tapePotions.salles.toiles.passee < 1, 'tape, avec le feu au lieu de la louche : elle passe les rats, puis tombe aux canaux (' + p1(AUTRES.tapePotions.salles.canaux.passee) + ' % les passent, ' + p1(AUTRES.tapePotions.salles.toiles.passee) + ' % passent la cave)');
cible(S.canaux.tape.victoires < 25 && S.canaux.tape.toursDefaite >= 4.5 && S.canaux.tape.toursDefaite <= 7.5, 'tape sans réfléchir : même à pleins PV, les canaux la font tomber en 5 à 7 tours (' + p1(S.canaux.tape.toursDefaite) + ' tours ; ' + p1(S.canaux.tape.victoires) + ' % de victoires)');
cible(AUTRES.hasard.salles.canaux.passee < 5, 'au hasard : elle perd presque toujours après les rats (' + p1(AUTRES.hasard.salles.canaux.passee) + ' % passent les canaux, ' + p1(AUTRES.hasard.salles.toiles.passee) + ' % la cave)');
cible(S.rats.maligne.victoires >= 99, 'la salle des rats reste l\'apprentissage : la maligne la gagne toujours (' + p1(S.rats.maligne.victoires) + ' %, en ' + p1(S.rats.maligne.tours) + ' tours)');
cible(refusTotal === 0, 'les équipes simulées ne tentent aucun geste refusé (' + refusTotal + (dernierRefus ? ' — ' + dernierRefus : '') + ')');

dire('## 5. Les cibles (MOTEUR-DONJON.md §6)');
dire();
cibles.forEach(function(k){ dire('- ' + (k.ok ? '✅' : '❌') + ' ' + k.texte); });
dire();
var rates = cibles.filter(function(k){ return !k.ok; });
dire(rates.length ? '**' + rates.length + ' cible(s) manquée(s).**' : '**Toutes les cibles sont tenues.**');
dire();

var D10 = DONJ.d10, D25 = DONJ.d25, SANS = DONJ.sansGivre, RATS = DONJ.sacRats;
dire('## 6. Ce qu\'il faut en retenir');
dire();
dire('- **La salle des rats n\'a pas bougé** : mêmes règles, mêmes chiffres que l\'essai (`test-regles.js` rejoue 3 000 parties des deux côtés et compare tout).');
dire('- **Dès les canaux, il faut réfléchir.** Taper sans ouvrir les points faibles, c\'est tomber en ' + Math.floor(S.canaux.tape.toursDefaite) + ' ou ' + Math.ceil(S.canaux.tape.toursDefaite) + ' tours ; l\'équipe qui étudie gagne en 3 ou 4 tours.');
dire('- **Bien joué, on ne perd pas par malchance** : l\'équipe maligne (un robot qui ne se trompe jamais) arrive chez Léo ' + p0(M.traite) + ' fois sur 100 sans tomber, mais presque toujours avec un héros dans le rouge à un moment (' + p0(M.chaud) + ' % des descentes). **Le Givre est obligatoire contre Bourbe** (depuis le 11 novembre, lui seul le sort de l\'eau) : l\'équipe qui n\'a pas cueilli la fleur de givre arrive au bout ' + p1(SANS.gagne) + ' fois sur 100.');
dire('- **Une vraie famille se trompera, et là ça pique** : avec un geste sur dix joué au hasard, ' + p0(D10.traite) + ' % des descentes réussissent d\'une traite (' + p0(D10.un) + ' % avec un rechargement au plus) ; avec un geste sur quatre, ' + p0(D25.traite) + ' % seulement, et ' + D25.defaites.toFixed(1).replace('.', ',') + ' défaites par descente en moyenne. Les pages blanches du Sage servent donc vraiment. Si c\'est trop dur (ou pas assez) à l\'essai, les chiffres à bouger d\'abord sont les dégâts des attaques dans `donnees.js` (le Gardien, les feux follets, les chauves-souris, le saut de Bourbe).');
dire('- **Sans les connaissances du Sage, les élites et le boss ne se battent pas** : 0 victoire contre le Gardien, le Roi des rats et Bourbe. Une équipe très prudente (soins et boucliers) traverse lentement les trois premières salles (une vingtaine de tours aux canaux), tient debout devant le Gardien… et ne peut rien lui faire.');
dire('- **À tâtons**, en essayant tout et en retenant ce qu\'on voit, on tombe parfois sur le combo du Gardien (' + p0(S.atelier.tatons.victoires) + ' % à pleins PV) ou du Roi des rats (' + p0(S.ossuaire.tatons.victoires) + ' %), jamais sur celui de Bourbe, et personne n\'arrive au bout (' + p1(AUTRES.tatons.gagne) + ' %). Les pièges font leur travail.');
dire('- **Presque toujours une sortie** : avec un mauvais sac, chaque salle reste faisable par un chemin plus long ou plus coûteux (tableau 3), **sauf le grand bassin : sans le Givre, Bourbe ne sort pas de l\'eau**. Le plus dur : le Gardien sans Acide, sans Givre et sans Baume (' + p0(MAUVAIS.atelier.m1.victoires) + ' %). Et **le choix du sac compte** : la même équipe maligne qui garde le sac de la salle des rats (Feu, Huile, Baume) doit lire le Grand Livre jusqu\'aux chemins sans potion, les combats durent deux à quatre fois plus longtemps, et elle ne réussit d\'une traite que ' + p0(RATS.traite) + ' fois sur 100 (' + p0(RATS.un) + ' avec un rechargement au plus).');
dire();
dire('### Ce que la simulation ne dit pas');
dire();
dire('- Le robot comprend les énigmes du Grand Livre du premier coup. De vrais joueurs devront parfois relire, ou étudier une deuxième fois.');
dire('- Le robot ne triche pas avec le soin : il n\'attend pas, devant un dernier monstre faible, que le Baume ait remis tout le monde à neuf. Des joueurs patients peuvent le faire (c\'est long). Rien dans les règles ne l\'interdit aujourd\'hui.');
dire('- Les équipes « sans le Sage », « tape » et « au hasard » ont ici le sac idéal. Avec un sac pris au hasard, elles font encore moins bien.');
dire();

var texte = out.join('\n');
console.log(texte);
console.log('(' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
if(ECRIRE){ fs.writeFileSync(path.join(__dirname, 'equilibre.md'), texte + '\n'); console.log('-> equilibre.md'); }
process.exit(rates.length ? 1 : 0);
