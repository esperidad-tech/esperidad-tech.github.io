/* test-regles.js — les tests des règles du donjon (Node, sans dépendance) :  node test-regles.js
   - la salle des rats donne EXACTEMENT les mêmes résultats que l'essai validé par Romain (essai/src/jeu.js) :
     les règles de l'essai sont recopiées ici (« Essai »), et 3 000 parties au hasard sont jouées des deux côtés avec le même hasard ;
   - chaque combo de chaque monstre : le chemin normal, l'autre chemin, le chemin sans potion, chaque piège qui renforce ;
   - l'immunité des élites et du boss ; les objets et leurs bonus ; les soins ; la rage et la brûlure qui restent ;
   - le critique et le critique surprise ; Bourbe en entier ; les sauvegardes, la fuite, les codes, le tas d'os, les dalles, le feu de camp. */
'use strict';
var path = require('path');
var R = require('./src/regles.js'), D = R.D;
var CODES = require(path.join(__dirname, '..', 'donjon-codes.js')).DONJON_CODES;

var nOk = 0, echecs = [], titre = '';
function section(t){ titre = t; console.log('\n== ' + t); }
function ok(c, quoi){ if(c){ nOk++; console.log('  ok  ' + quoi); } else { echecs.push(titre + ' : ' + quoi); console.log('  ÉCHEC  ' + quoi); } }
function egal(a, b, quoi){ ok(JSON.stringify(a) === JSON.stringify(b), quoi + (JSON.stringify(a) === JSON.stringify(b) ? '' : '  (obtenu ' + JSON.stringify(a) + ', attendu ' + JSON.stringify(b) + ')')); }

/* un hasard écrit d'avance : les valeurs de la liste, puis 0,99 (pas de critique surprise ; la proie = le Pisteur) */
function ecrit(liste){ var l = (liste || []).slice(); var f = function(){ return l.length ? l.shift() : 0.99; }; f.etat = function(){ return 1; }; return f; }
/* un combat tout prêt */
function prep(salle, o){
  o = o || {};
  var p = R.nouvellePartie(o.graine || 5);
  if(o.recettes) p.recettes = o.recettes.slice();
  p.recettes = (o.sac || ['feu', 'fumigene', 'baume']).slice();     /* les potions que l'Alchimiste a su créer (depuis le 10 novembre : plus de sac à choisir) */
  if(o.objets) for(var h in o.objets) p.heros[h].objets = o.objets[h].slice();
  if(o.pv) for(var h2 in o.pv) p.heros[h2].pv = o.pv[h2];
  if(o.livre) p.livre = o.livre;
  p.lieu = salle;
  var c = R.combat(p, salle, {alea:o.alea || ecrit(o.hasard)});
  return {p:p, c:c};
}
function types(ev){ return ev.map(function(e){ return e.t; }); }
function trouve(ev, t, f){ for(var i = 0; i < ev.length; i++) if(ev[i].t === t && (!f || f(ev[i]))) return ev[i]; return null; }
function tous(ev, t, f){ return ev.filter(function(e){ return e.t === t && (!f || f(e)); }); }
function bete(c, type, n){ var l = c.b.filter(function(m){ return m.type === type; }); return l[n || 0]; }
function jouer(c, h, geste, cible){ return c.jouer(h, {geste:geste, cible:cible && cible.id ? cible.id : cible}); }
/* finir le tour : les héros qui restent font un geste sans effet sur les bêtes, puis les monstres jouent */
function finir(c, sauf){
  var ev = [];
  c.aJouer().forEach(function(h){
    if(c.h[h].avale){ ev = ev.concat(c.jouer(h, {geste:'chatouiller'})); return; }
    if(h === 'sage') c.h.sage.joue = true;                     /* (le Sage n'a plus de geste neutre : on le marque comme ayant joué) */
    else if(h === 'alchimiste') ev = ev.concat(c.jouer(h, {geste:'herbes', cible:c.visables()[0]}));
    else { var cb = c.ciblables(); if(cb.length) ev = ev.concat(c.jouer(h, {geste:'p:baume-absent', cible:cb[0].id})); }
  });
  return ev;
}
/* « passer » : le Pisteur n'a pas de geste neutre, alors on le marque comme ayant joué (seulement dans les tests) */
function tourSuivant(c){
  D.ORDRE.forEach(function(h){ if(!c.h[h].sol) c.h[h].joue = true; });
  return c.tourMonstres();
}
function pvHeros(c){ return D.EXPOSES.map(function(h){ return c.h[h].pv; }); }

/* =====================================================================================================================
   0. L'ESSAI : les règles de essai/src/jeu.js, recopiées sans l'affichage (l'ordre des tirages au hasard est le même)
   ===================================================================================================================== */
function Essai(Rnd, sac){
  var HER = {sage:{pv:90, gestes:['rune', 'bouclier']}, alchimiste:{pv:100, gestes:['louche', 'herbes']}, pisteur:{pv:120, gestes:['fleche', 'dague']}};
  var ORDRE = ['sage', 'alchimiste', 'pisteur'], EXPOSES = ['pisteur', 'alchimiste', 'sage'], VISEE = {pisteur:6, alchimiste:2.5, sage:1.5};
  /* 11 novembre (Romain, 13 h 53) : trois chiffres de l'essai ont changé, exprès — la morsure (8 → 13 : « les rats ne font
     pas assez de dégâts »), et le critique : la dague tue toujours un rat ouvert, mais la flèche, sur ce qui marche par terre,
     ne fait plus que le petit critique (20 : il faut deux flèches). À 16 h 07 : les herbes soignent toute l'équipe d'un petit
     montant (10 chacun, au lieu de 20 sur un seul). Tout le reste de l'essai est inchangé. */
  var MORSURE = D.MONSTRES.rat.attaques.morsure.degats, BRULURE = 4, RAT_PV = 40, FLECHE_CRIT = D.CHIFFRES.critique.normal.sol;
  var REC = {feu:{cible:'rat', fleche:true}, fumigene:{cible:'salle', fleche:false}, huile:{cible:'rat', fleche:true}, colle:{cible:'rat', fleche:true}, baume:{cible:'heros', fleche:false}, coeur:{cible:'sol', fleche:false}};
  var GES = {etudier:'rat', rune:'rat', bouclier:'heros', louche:'devant', herbes:'heros', fleche:'rat', dague:'devant'};
  var E = this.E = {tour:0, livre:0, h:{}, r:[], fin:null, sac:sac.slice()};
  ORDRE.forEach(function(h){ E.h[h] = {pv:HER[h].pv, sol:false, joue:false, bouclier:false}; });
  E.r = [0, 1, 2].map(function(i){ return {i:i, pv:RAT_PV, mort:false, ouvert:false, enrage:false, brule:false, colle:false, vise:null}; });
  function vivants(){ return E.r.filter(function(r){ return !r.mort; }); }
  function devant(){ return vivants()[0] || null; }
  function debout(){ return ORDRE.filter(function(h){ return !E.h[h].sol; }); }
  function dispo(){ return ORDRE.filter(function(h){ return !E.h[h].sol && !E.h[h].joue; }); }
  function viser(){
    var d = debout(), tot = 0;
    d.forEach(function(h){ tot += VISEE[h]; });
    var x = Rnd() * tot;
    for(var k = 0; k < d.length; k++){ x -= VISEE[d[k]]; if(x < 0) return d[k]; }
    return d[0];
  }
  function nouveauTour(){ E.tour++; ORDRE.forEach(function(h){ E.h[h].joue = false; }); vivants().forEach(function(r){ r.vise = viser(); }); }
  function blesser(r, n){ r.pv = Math.max(0, r.pv - n); if(r.pv <= 0){ r.mort = true; r.ouvert = false; r.colle = false; } }
  function critique(r){ r.pv = 0; r.mort = true; r.ouvert = false; }
  function soin(h, n, quoi){ var s = E.h[h]; if(quoi === 'coeur'){ s.sol = false; s.pv = 40; } else s.pv = Math.min(HER[h].pv, s.pv + n); }
  function effetPotion(id, r){
    if(id === 'feu'){ r.brule = true; if(r.ouvert) return blesser(r, 30); return blesser(r, 5); }
    if(id === 'huile'){ if(r.ouvert) return; r.ouvert = true; return; }
    if(id === 'colle'){ r.colle = true; return; }
  }
  function fleche(r, potion){
    var surprise = !potion && !r.ouvert && Rnd() < 1 / 8;
    if(r.ouvert) return blesser(r, FLECHE_CRIT);
    if(surprise) return blesser(r, FLECHE_CRIT);
    if(potion) return effetPotion(potion, r);
    blesser(r, 3);
  }
  function faire(h, g, c){
    var r = c.rat, cible = c.heros;
    if(g === 'rune'){ if(!r.ouvert) r.ouvert = true; return; }
    if(g === 'bouclier'){ E.h[cible].bouclier = true; return; }
    if(g === 'louche'){ var d = devant(); blesser(d, d.ouvert ? 10 : 2); vivants().forEach(function(x){ x.enrage = true; }); return; }
    if(g === 'herbes'){ debout().forEach(function(x){ soin(x, D.CHIFFRES.herbes, 'herbes'); }); return; }        /* (11 novembre : un petit soin pour chacun) */
    if(g === 'fleche') return fleche(r, null);
    if(g === 'dague'){ var dv = devant(); if(dv.ouvert) return critique(dv); return blesser(dv, 4); }
    var id = g.slice(2);
    if(h === 'pisteur') return fleche(r, id);
    if(id === 'baume') return soin(cible, 40, 'baume');
    if(id === 'coeur') return soin(cible, 40, 'coeur');
    if(id === 'fumigene') return;
    return effetPotion(id, r);
  }
  function attaque(r){
    var victime = E.h[r.vise] && !E.h[r.vise].sol ? r.vise : EXPOSES.filter(function(x){ return !E.h[x].sol; })[0];
    var n = r.enrage ? 2 : 1;
    for(var k = 0; k < n; k++){
      if(E.h[victime].sol){ var autre = EXPOSES.filter(function(x){ return !E.h[x].sol; })[0]; if(!autre) break; victime = autre; }
      var s = E.h[victime], d = s.bouclier ? Math.ceil(MORSURE * D.CHIFFRES.bouclier) : MORSURE;      /* (11 novembre : le bouclier arrête 75 %) */
      s.pv = Math.max(0, s.pv - d);
      if(s.pv <= 0) s.sol = true;
    }
    r.vise = null;
  }
  function tourDesRats(){
    var liste = vivants();
    for(var k = 0; k < liste.length; k++){
      var r = liste[k];
      if(!debout().length) break;
      if(r.mort) continue;
      if(r.brule){ r.pv = Math.max(0, r.pv - BRULURE); if(r.pv <= 0){ r.mort = true; r.ouvert = false; r.colle = false; continue; } }
      if(r.colle) continue;
      attaque(r);
    }
    if(!debout().length){ E.fin = 'defaite'; return; }
    if(!vivants().length){ E.fin = 'victoire'; return; }
    vivants().forEach(function(r){ r.ouvert = false; r.colle = false; });
    ORDRE.forEach(function(h){ E.h[h].bouclier = false; });
    nouveauTour();
  }
  this.recetteOk = function(h, id){ if(h === 'pisteur') return REC[id].fleche; if(id === 'coeur') return ORDRE.some(function(x){ return E.h[x].sol; }); return true; };
  this.typeCible = function(g){ return g.indexOf('p:') === 0 ? REC[g.slice(2)].cible : GES[g]; };
  this.gestesDe = function(h){ var l = HER[h].gestes.slice(), self = this; if(h !== 'sage') sac.forEach(function(id){ if(self.recetteOk(h, id)) l.push('p:' + id); }); return l; };
  this.vivants = vivants; this.devant = devant; this.debout = debout; this.dispo = dispo;
  this.auSol = function(){ return ORDRE.filter(function(h){ return E.h[h].sol; }); };
  this.agir = function(h, g, c){
    faire(h, g, c);
    E.h[h].joue = true;
    if(!vivants().length){ E.fin = 'victoire'; return; }
    if(!dispo().length) tourDesRats();
  };
  nouveauTour();
}

section('La salle des rats : les mêmes résultats que l\'essai (3 000 parties au hasard, le même hasard des deux côtés)');
(function(){
  var SACS = [['feu', 'huile', 'baume'], ['feu', 'fumigene', 'colle'], ['huile', 'colle', 'coeur'], ['baume', 'coeur', 'fumigene']];
  var ecarts = 0, premier = null, gestesJoues = 0, permisCompares = 0, fins = {victoire:0, defaite:0, long:0};
  function photoEssai(es){
    var E = es.E;
    return JSON.stringify({h:D.ORDRE.map(function(h){ return [E.h[h].pv, E.h[h].sol, E.h[h].joue, E.h[h].bouclier]; }),
      r:E.r.map(function(r){ return r.mort ? [0, true] : [r.pv, r.mort, r.ouvert, r.enrage, r.brule, r.colle, E.fin ? null : r.vise]; }), fin:E.fin, tour:E.fin ? 0 : E.tour});
  }
  function photoRegles(c, p){
    return JSON.stringify({h:D.ORDRE.map(function(h){ var S = c.h[h]; return [S.pv, S.sol, S.joue, !!S.bouclier]; }),
      r:c.b.map(function(m){ return m.mort ? [0, true] : [m.pv, m.mort, m.ouvert !== 0, c.a(m, 'enrage'), c.a(m, 'brule'), c.a(m, 'colle'), m.plan && !c.fini() ? m.plan.cibles[0] : null]; }),
      fin:c.fini(), tour:c.fini() ? 0 : c.tour});
  }
  for(var graine = 1; graine <= 3000; graine++){
    var sac = SACS[graine % SACS.length], choix = R.alea(graine * 7 + 1);
    var es = new Essai(R.alea(graine), sac);
    var p = R.nouvellePartie(1); p.recettes = sac.slice();
    var c = R.combat(p, 'rats', {alea:R.alea(graine)});
    var n = 0;
    while(!es.E.fin && n < 400){
      /* de temps en temps : les mêmes gestes sont permis, sur les mêmes cibles, des deux côtés */
      if(graine % 10 === 0) D.ORDRE.forEach(function(hh){
        var peut = es.dispo().indexOf(hh) >= 0, base = {sage:['rune', 'bouclier'], alchimiste:['louche', 'herbes'], pisteur:['fleche', 'dague']}[hh];
        var tous = base.concat(hh === 'sage' ? [] : sac.map(function(x){ return 'p:' + x; }));
        tous.forEach(function(g2){
          var t2 = es.typeCible(g2), okG = peut && (g2.indexOf('p:') !== 0 || es.recetteOk(hh, g2.slice(2)));
          var cands = t2 === 'heros' || t2 === 'sol' ? D.ORDRE : ['b1', 'b2', 'b3'];
          if(g2 === 'louche' || g2 === 'p:fumigene' || g2 === 'herbes') cands = [null];
          cands.forEach(function(x){
            var okE = okG;
            if(okE && x !== null){
              if(t2 === 'rat') okE = !es.E.r[+x.slice(1) - 1].mort;
              else if(t2 === 'devant') okE = es.devant() && es.devant().i === +x.slice(1) - 1;
              else if(t2 === 'heros') okE = !es.E.h[x].sol;
              else if(t2 === 'sol') okE = es.E.h[x].sol;
            }
            permisCompares++;
            if((c.refus(hh, g2, x) === null) !== !!okE){ ecarts++; premier = premier || ('graine ' + graine + ' : ' + hh + ' ' + g2 + ' sur ' + x + ' — essai ' + (okE ? 'permis' : 'refusé') + ', règles « ' + c.refus(hh, g2, x) + ' »'); }
          });
        });
      });
      var d = es.dispo(), h = d[Math.floor(choix() * d.length)], gl = es.gestesDe(h), g = gl[Math.floor(choix() * gl.length)], t = es.typeCible(g), cib = {}, cible = null;
      if(t === 'rat' || t === 'salle'){ var v = es.vivants(), r = v[Math.floor(choix() * v.length)]; cib.rat = r; cible = 'b' + (r.i + 1); }
      else if(t === 'devant'){ cib.rat = es.devant(); cible = 'b' + (cib.rat.i + 1); }
      else if(t === 'heros'){ var db = es.debout(); cib.heros = db[Math.floor(choix() * db.length)]; cible = cib.heros; }
      else if(t === 'sol'){ var s = es.auSol(); cib.heros = s[Math.floor(choix() * s.length)]; cible = cib.heros; }
      es.agir(h, g, cib);
      var ev = c.jouer(h, {geste:g, cible:cible});
      if(ev[0] && ev[0].t === 'refus'){ ecarts++; premier = premier || ('refus ' + ev[0].mot + ' pour ' + h + ' ' + g + ' (graine ' + graine + ')'); break; }
      if(!c.fini() && !c.aJouer().length) c.tourMonstres();
      n++; gestesJoues++;
      var a = photoEssai(es), b = photoRegles(c, p);
      if(a !== b){ ecarts++; premier = premier || ('graine ' + graine + ', geste ' + n + ' (' + h + ' ' + g + ') : essai ' + a + ' / règles ' + b); break; }
    }
    fins[es.E.fin || 'long']++;
  }
  ok(ecarts === 0, '3 000 parties, ' + gestesJoues + ' gestes : PV, états, proies, tours et fin identiques à l\'essai' + (premier ? ' — premier écart : ' + premier : ''));
  ok(fins.victoire > 300 && fins.defaite > 300, 'des victoires et des défaites dans le lot (' + fins.victoire + ' victoires, ' + fins.defaite + ' défaites)');
  ok(permisCompares > 50000, permisCompares + ' gestes comparés : permis ou refusés pareil des deux côtés (qui peut jouer, sur quelle cible)');
})();

section('La salle des rats : les chiffres de l\'essai, un par un');
(function(){
  var t = prep('rats', {sac:['feu', 'huile', 'colle']}), c = t.c, r1 = c.b[0], r2 = c.b[1], r3 = c.b[2], ev;
  egal([D.HEROS.pisteur.pv, D.HEROS.alchimiste.pv, D.HEROS.sage.pv, D.MONSTRES.rat.pv, D.MONSTRES.rat.attaques.morsure.degats], [120, 100, 90, 40, 13], 'Pisteur 120, Alchimiste 100, Sage 90, rat 40 PV, morsure 13 (8 jusqu\'au 11 novembre)');
  egal(D.VISEE, {pisteur:6, alchimiste:2.5, sage:1.5}, 'les rats visent le Pisteur à 60 %, l\'Alchimiste à 25 %, le Sage à 15 %');
  ev = jouer(c, 'pisteur', 'fleche', r2);
  egal(trouve(ev, 'degats').n, 3, 'une flèche sur un rat fermé : 3');
  ev = jouer(c, 'alchimiste', 'p:feu', r3);
  ok(trouve(ev, 'degats').n === 5 && c.a(r3, 'brule'), 'le feu sur un rat fermé : 5, et il brûle');
  ev = jouer(c, 'sage', 'rune', r1);
  ok(r1.ouvert !== 0 && c.a(r1, 'ebloui') && trouve(ev, 'ouvert').par === 'lumiere', 'la rune de lumière éblouit le rat : point faible ouvert');
  ev = c.tourMonstres();
  egal(trouve(ev, 'brulure').n, 4, 'la brûlure : −4 au tour des rats');
  ok(r1.ouvert === 0 && !c.a(r1, 'ebloui') && trouve(ev, 'ferme'), 'à la fin du tour des rats, le point faible se referme');
  egal(c.h.pisteur.pv, 120 - 39, 'trois morsures de 13 sur le Pisteur');
  ev = jouer(c, 'pisteur', 'dague', r1);
  egal(trouve(ev, 'degats').n, 4, 'la dague sur le rat de devant, fermé : 4');
  egal(c.refus('pisteur', 'dague', r2.id), 'Déjà joué', 'un héros ne joue qu\'une fois par tour (« Déjà joué »)');
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'degats').n === 2 && c.vivants().every(function(m){ return c.a(m, 'enrage'); }), 'la louche : 2 sur le rat de devant, et tous les rats enragés');
  ev = jouer(c, 'sage', 'bouclier', 'pisteur');
  ev = c.tourMonstres();
  var d = tous(ev, 'degats', function(e){ return e.heros === 'pisteur'; });
  ok(d.length === 6 && d.every(function(e){ return e.n === 4 && e.absorbe === 9 && e.bouclier; }), 'enragés, ils mordent deux fois ; le bouclier arrête 75 % (13 → 4)');
  egal(r3.pv, 40 - 5 - 4 - 4, 'la brûlure continue au tour suivant');
  ok(c.vivants().every(function(m){ return c.a(m, 'enrage'); }) && c.a(r3, 'brule'), 'la rage et la brûlure restent d\'un tour à l\'autre');
  ok(!c.h.pisteur.bouclier, 'le bouclier s\'éteint à la fin du tour');
  /* la colle, l'huile, le critique */
  ev = jouer(c, 'alchimiste', 'p:colle', r1);
  ok(c.a(r1, 'colle'), 'la colle colle le rat');
  ev = jouer(c, 'pisteur', 'p:huile', r2);
  ok(r2.ouvert !== 0 && c.a(r2, 'dos'), 'la flèche trempée dans l\'huile retourne le rat');
  c.h.pisteur.joue = false;
  egal(c.refus('pisteur', 'dague', r2.id), 'Trop loin !', 'comme dans l\'essai, la dague ne touche que le rat de devant, même si un autre est sur le dos');
  c.h.pisteur.joue = true;
  ev = jouer(c, 'sage', 'rune', r3);
  ev = c.tourMonstres();
  ok(trouve(ev, 'saute', function(e){ return e.bete === r1.id && e.nom === 'colle'; }) && !c.a(r1, 'colle'), 'le rat collé ne mord pas ce tour-ci, puis la colle s\'en va');
  ev = jouer(c, 'sage', 'rune', r1);
  ev = jouer(c, 'alchimiste', 'louche');
  egal(trouve(ev, 'degats').n, 10, 'la louche sur un rat ouvert : 10');
  var pvR1 = r1.pv;
  ev = jouer(c, 'pisteur', 'p:feu', r1);
  var dg = trouve(ev, 'degats');
  /* Romain, 11 novembre : l'arc ne fait un gros critique que sur ce qui vole, pend à un fil ou nage ; par terre, c'est la dague */
  ok(dg.critique && dg.petit && dg.n === 20 && r1.pv === Math.max(0, pvR1 - 20), 'une flèche (même trempée) sur un rat ouvert : le petit critique (20), quatre fois moins que la dague');
  ok(!c.a(r1, 'brule'), 'la flèche trempée qui fait un critique ne pose pas sa potion');
})();
(function(){
  var t = prep('rats', {sac:['feu', 'baume', 'coeur'], pv:{sage:8}, hasard:[0.99, 0.99, 0.01]}), c = t.c, ev;
  egal(c.b[2].plan.cibles, ['sage'], 'le hasard choisit la proie (tirage 0,01 : le Sage)');
  ev = jouer(c, 'sage', 'rune', c.b[0]);
  ev = jouer(c, 'alchimiste', 'p:feu', c.b[0]);
  egal(trouve(ev, 'degats').n, 30, 'le feu sur un rat ouvert : 30');
  egal(c.refus('alchimiste', 'p:coeur', 'sage'), 'Déjà joué', 'refus : déjà joué');
  egal(c.refus('pisteur', 'p:baume', c.b[0].id), 'Impossible !', 'le Baume ne tient pas sur une flèche (« Impossible ! »)');
  egal(c.refus('pisteur', 'dague', c.b[1].id), 'Trop loin !', 'la dague sur un rat du fond : « Trop loin ! »');
  ev = jouer(c, 'pisteur', 'dague', c.b[0]);
  ok(trouve(ev, 'degats').critique && !trouve(ev, 'degats').petit && trouve(ev, 'degats').n === 80 && c.b[0].mort && trouve(ev, 'mort').mode === 'explose', 'la dague sur un rat ouvert : critique de 80, il explose');
  ev = c.tourMonstres();
  ok(c.h.sage.sol && trouve(ev, 'tombe', function(e){ return e.heros === 'sage'; }), 'à 0 PV, le héros tombe au sol');
  egal(c.refus('sage', 'rune', c.b[1].id), 'Au sol !', 'un héros au sol ne joue pas (« Au sol ! »)');
  egal(c.refus('alchimiste', 'p:coeur', 'pisteur'), 'Encore debout', 'le Cœur vaillant sur un héros debout : « Encore debout »');
  ev = jouer(c, 'alchimiste', 'p:coeur', 'sage');
  ok(!c.h.sage.sol && c.h.sage.pv === 40 && trouve(ev, 'releve').par === 'coeur', 'le Cœur vaillant relève avec 40 PV');
  c.h.pisteur.pv = 50;
  /* la rune de l'œil (Romain, 11 novembre) : sans elle, on ne sait pas qui sera frappé */
  ok(c.etat().vu === 0 && c.etat().betes.every(function(x){ return x.vise === null && x.suite === null; }), 'sans la rune de l\'œil, l\'écran ne sait pas qui les rats vont mordre');
  egal(c.gestes('sage').map(function(g){ return g.geste; }), ['oeil', 'rune', 'bouclier', 'appel'], 'les gestes du Sage : la rune de l\'œil (à la place d\'« Étudier »), la lumière, le bouclier, la rune d\'appel');
  ev = c.jouer('sage', {geste:'oeil'});
  var oe = trouve(ev, 'oeil'), et = c.etat();
  ok(oe && oe.jusque === 'fin' && et.vu === 2 && et.betes.filter(function(x){ return !x.mort; }).every(function(x){ return x.vise && x.vise.cibles.length === 1 && x.vise.degats === 13 && x.suite && x.suite.cibles.length === 1; }),
    'la rune de l\'œil : pour ce tour et le suivant, qui chaque rat va mordre, et combien (13)');
  egal(c.refus('sage', 'oeil'), 'Déjà joué', '(le Sage a joué)');
  var promis = {}; et.betes.forEach(function(x){ if(x.suite) promis[x.id] = x.suite.cibles[0]; });
  tourSuivant(c);
  et = c.etat();
  ok(et.vu === 2 && et.betes.filter(function(x){ return !x.mort && x.vise; }).every(function(x){ return x.vise.cibles[0] === promis[x.id] && x.suite && x.suite.cibles.length === 1; }), 'au tour suivant, chaque rat vise bien celui que le Sage avait vu, et le tour d\'après est encore montré');
  /* Romain, 11 novembre (16 h 07) : « qu'il ait besoin de le faire qu'une seule fois » */
  egal(c.refus('sage', 'oeil'), 'Il voit tout', 'la rune de l\'œil ne se lance qu\'une fois : elle dure tout le combat (« Il voit tout »)');
  var avant = c.h.pisteur.pv;
  ev = jouer(c, 'alchimiste', 'p:baume', 'pisteur');
  egal(trouve(ev, 'soin').n, Math.min(40, 120 - avant), 'le Baume rend 40 (sans dépasser le maximum)');
  tourSuivant(c); tourSuivant(c);
  ok(c.fini() || (c.etat().vu === 2 && c.etat().betes.filter(function(x){ return !x.mort; }).every(function(x){ return x.vise && x.suite; })), 'deux tours plus tard, sans la relancer, le Sage voit toujours ce tour et le suivant');
})();

section('Le critique et le critique surprise');
(function(){
  var t = prep('rats', {hasard:[0.5, 0.5, 0.5, 0.1]}), c = t.c, ev;        /* 3 tirages pour les proies, puis 0,1 < 1/8 */
  ev = jouer(c, 'pisteur', 'fleche', c.b[2]);
  var d = trouve(ev, 'degats');
  ok(d.critique && d.surprise && d.petit && d.n === 20 && !c.b[2].mort && c.b[2].pv === 20, 'une flèche simple sur un rat FERMÉ, tirage sous 1/8 : critique surprise — le petit (20), le rat n\'en meurt pas');
  t = prep('rats', {sac:['feu', 'huile', 'colle'], hasard:[0.5, 0.5, 0.5, 0.1]}); c = t.c;
  ev = jouer(c, 'pisteur', 'p:feu', c.b[2]);
  ok(!trouve(ev, 'degats').critique, 'pas de critique surprise avec une flèche trempée');
  t = prep('atelier', {hasard:[0.5, 0.01]}); c = t.c;
  ev = jouer(c, 'pisteur', 'fleche', bete(c, 'gardien'));
  ok(trouve(ev, 'rebond') && !trouve(ev, 'degats'), 'pas de critique surprise sur un élite : la flèche rebondit');
  t = prep('atelier', {hasard:[0.5, 0.01]}); c = t.c;
  ev = jouer(c, 'pisteur', 'fleche', bete(c, 'ratcuir'));
  var d2 = trouve(ev, 'degats');
  ok(d2.surprise && d2.n === 20 && !bete(c, 'ratcuir').mort && bete(c, 'ratcuir').pv === D.MONSTRES.ratcuir.pv - 20, 'le critique surprise affiche 20 sur le rat cuirassé (70 PV)');
  egal(D.CHIFFRES.critique, {normal:{dague:80, fleche:60, sol:20}, elite:{dague:140, fleche:110, sol:35}, boss:{dague:380, fleche:300, sol:95}}, 'la table des critiques : la dague 80 / 140 / 380 ; la flèche sur ce qui est en hauteur 60 / 110 / 300 ; la flèche sur ce qui marche par terre, quatre fois moins que la dague : 20 / 35 / 95');
  egal(Object.keys(D.MONSTRES).filter(function(k){ return D.MONSTRES[k].hauteur; }).sort(), ['araignee', 'bourbe', 'chauvesouris', 'feufollet', 'tetard'], 'en hauteur (ils volent, pendent à un fil ou nagent) : la chauve-souris, le feu follet, l\'araignée, le têtard, Bourbe');
  /* une chauve-souris tombée : l'arc lui fait le gros critique */
  t = prep('crypte', {}); c = t.c;
  jouer(c, 'alchimiste', 'louche');
  ev = jouer(c, 'pisteur', 'fleche', c.b[1]);
  ok(trouve(ev, 'degats').critique && !trouve(ev, 'degats').petit && trouve(ev, 'degats').n === 60 && c.b[1].mort, 'la flèche sur une chauve-souris ouverte : le gros critique (60), même au fond de la salle');
})();

section('Le rat cuirassé');
(function(){
  var t = prep('atelier', {sac:['acide', 'feu', 'baume']}), c = t.c, rc = bete(c, 'ratcuir'), ev;
  ev = jouer(c, 'pisteur', 'fleche', rc);
  egal(trouve(ev, 'degats').n, 1, 'fermé : une flèche ne lui fait presque rien (1)');
  ev = jouer(c, 'sage', 'rune', rc);
  ok(rc.ouvert === 0 && trouve(ev, 'mot'), 'la lumière glisse sur son casque');
  ev = jouer(c, 'alchimiste', 'p:acide', rc);
  ok(trouve(ev, 'special').nom === 'armure-tombe' && c.a(rc, 'nu') && rc.ouvert === R.FIN, 'chemin normal : l\'acide fait tomber l\'armure, il est ouvert');
  tourSuivant(c);
  ok(rc.ouvert === R.FIN && c.a(rc, 'nu'), 'ce qui est cassé reste cassé : il est encore ouvert au tour suivant');
  ev = jouer(c, 'pisteur', 'dague', rc);
  ok(trouve(ev, 'degats').n === 80 && rc.mort, 'la dague sur la peau nue : critique de 80, il est battu');

  t = prep('atelier', {sac:['givre', 'feu', 'baume'], recettes:D.ORDRE_RECETTES}); c = t.c; rc = bete(c, 'ratcuir');
  ev = jouer(c, 'pisteur', 'p:givre', rc);
  ok(trouve(ev, 'special').nom === 'armure-eclate' && rc.ouvert === R.FIN, 'autre chemin : le givre (ici en flèche) fait éclater l\'armure');
  ev = jouer(c, 'alchimiste', 'p:feu', rc);
  ok(trouve(ev, 'degats').n === 30 && c.a(rc, 'brule') && !c.a(rc, 'rougeoie'), 'sans armure, le feu le brûle (30) au lieu de le renforcer');

  t = prep('atelier', {sac:['huile', 'colle', 'baume']}); c = t.c; rc = bete(c, 'ratcuir');
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'special').nom === 'tournis' && c.a(rc, 'tournis'), 'sans potion : premier coup de louche, il a le tournis');
  ev = tourSuivant(c);
  ok(trouve(ev, 'saute', function(e){ return e.bete === rc.id; }), 'il a le tournis : il ne frappe pas ce tour-ci');
  ev = jouer(c, 'sage', 'rune', rc);
  ok(rc.ouvert === 0, 'la lumière ne sert à rien tant qu\'il a son casque');
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'special').nom === 'casque-tombe' && c.a(rc, 'sans-casque') && !c.a(rc, 'tournis'), 'deuxième coup de louche : le casque tombe');
  tourSuivant(c);
  ev = jouer(c, 'sage', 'rune', rc);
  ok(rc.ouvert !== 0 && c.a(rc, 'ebloui'), 'puis la lumière : il se dresse, ébloui, ouvert');
  ev = jouer(c, 'pisteur', 'fleche', rc);
  ok(trouve(ev, 'degats').critique && rc.pv === 70 - 20, 'critique à la flèche sur ce rat qui marche par terre : 20, il lui reste 50 (c\'est le travail de la dague)');
  tourSuivant(c);
  ok(rc.ouvert === 0 && c.a(rc, 'sans-casque'), 'ébloui, il se referme à la fin du tour ; le casque reste tombé');

  t = prep('atelier', {sac:['feu', 'acide', 'baume']}); c = t.c; rc = bete(c, 'ratcuir');
  ev = jouer(c, 'alchimiste', 'p:feu', rc);
  ok(trouve(ev, 'touche').piege && c.a(rc, 'rougeoie') && !trouve(ev, 'degats'), 'piège : le feu fait rougeoyer son armure (aucun dégât)');
  c.h.pisteur.pv = 120; c.b.forEach(function(m){ if(m.type === 'gardien') m.mort = true; });
  ev = tourSuivant(c);
  egal(trouve(ev, 'degats', function(e){ return e.bete === rc.id; }).brut, D.MONSTRES.ratcuir.attaques['coup-de-tete'].degats + D.MONSTRES.ratcuir.attaques['coup-de-tete'].plusSi.rougeoie, 'rougi, son coup de tête frappe plus fort');
  ev = jouer(c, 'pisteur', 'p:acide', rc);
  ok(!c.a(rc, 'rougeoie') && c.a(rc, 'nu'), 'l\'acide fait quand même tomber l\'armure rougie');
})();

section('La chauve-souris');
(function(){
  var t = prep('crypte', {sac:['colle', 'feu', 'baume']}), c = t.c, a = c.b[0], b = c.b[1], ev;
  ev = jouer(c, 'alchimiste', 'louche');
  ok(a.ouvert !== 0 && b.ouvert !== 0 && c.a(a, 'au-sol') && c.a(b, 'au-sol'), 'chemin normal : le bruit (la louche) les fait tomber toutes les deux, ouvertes');
  /* (13 novembre) la dague ne touche que le premier monstre au sol : celle du fond, même tombée, est trop loin */
  ev = jouer(c, 'pisteur', 'dague', b);
  ok(trouve(ev, 'refus') && !b.mort && !trouve(ev, 'degats'), 'tombée, mais derrière : celle du fond n\'est pas à portée de dague (la dague ne touche que le premier)');
  ok(c.aPortee().length === 1 && c.aPortee()[0] === a, 'à portée de dague : la première, et elle seule');
  /* (pour la suite du test, celle du fond part d'un coup de flèche : elle est en hauteur, l'arc lui fait le gros critique) */
  ev = jouer(c, 'pisteur', 'fleche', b);
  ok(trouve(ev, 'degats').critique && b.mort, 'celle du fond, tombée et ouverte : la flèche lui fait un critique');
  ev = tourSuivant(c);
  ok(trouve(ev, 'attaque', function(e){ return e.bete === a.id; }) && a.ouvert === 0 && !c.a(a, 'au-sol'), 'une chauve-souris tombée attaque quand même (elle se renvole pour piquer), puis elle est refermée');
  var ordre = ev.filter(function(e){ return e.bete === a.id && (e.t === 'etat' || e.t === 'ferme' || e.t === 'attaque'); }).map(function(e){ return e.t + (e.nom ? ':' + e.nom : ''); });
  egal(ordre, ['etat:au-sol', 'ferme', 'attaque:pique'], 'l\'ordre des évènements : elle se renvole (au-sol : non), se referme, PUIS pique');
  ev = jouer(c, 'pisteur', 'p:colle', a);
  ok(a.ouvert !== 0 && c.a(a, 'colle') && c.a(a, 'au-sol'), 'autre chemin : la colle (en flèche) colle ses ailes, elle tombe');
  ev = tourSuivant(c);
  ok(trouve(ev, 'saute', function(e){ return e.bete === a.id; }), 'collée, elle ne pique pas ce tour-ci');
  ev = jouer(c, 'sage', 'rune', a);
  ok(trouve(ev, 'touche').piege && c.a(a, 'folle') && a.ouvert === 0, 'piège : la lumière la rend folle');
  ev = tourSuivant(c);
  egal(trouve(ev, 'attaque', function(e){ return e.bete === a.id; }).fois, 2, 'folle, elle pique deux fois');
  tourSuivant(c);
  ok(c.a(a, 'folle'), 'la folie reste jusqu\'à la fin');
})();

section('Le feu follet');
(function(){
  var t = prep('toiles', {sac:['fumigene', 'feu', 'baume']}), c = t.c, f1 = bete(c, 'feufollet', 0), f2 = bete(c, 'feufollet', 1), ar = bete(c, 'araignee'), ev;
  ev = jouer(c, 'pisteur', 'fleche', f1);
  egal(trouve(ev, 'degats').n, 1, 'fermé : la flèche le traverse (1)');
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(f1.ouvert !== 0 && f2.ouvert !== 0 && c.a(f1, 'visible'), 'chemin normal : dans le nuage, les deux feux follets prennent forme (ouverts)');
  ok(c.a(ar, 'haut') && c.cache(ar), 'piège du nuage : l\'araignée remonte hors d\'atteinte');
  egal(c.refus('sage', 'rune', ar.id), 'Trop haut !', 'on ne peut plus la viser (« Trop haut ! »)');
  tourSuivant(c);
  ok(f1.ouvert === 0 && !c.a(ar, 'haut'), 'à la fin du tour : les feux follets se referment, l\'araignée redescend');
  ev = jouer(c, 'sage', 'rune', f1);
  ok(trouve(ev, 'touche').piege && c.a(f1, 'grand') && f1.pv === 30 - 1 + 30 && f1.pvMax === 60, 'piège : la lumière le fait grandir (+30 PV)');
  ev = jouer(c, 'alchimiste', 'p:feu', f2);
  ok(!trouve(ev, 'degats') && !c.a(f2, 'brule'), 'fermé : le feu ne lui fait rien');
  tourSuivant(c);
  ev = jouer(c, 'sage', 'rune', f1);
  ok(f1.pvMax === 60 && !trouve(ev, 'gagne'), 'il ne grandit qu\'une fois');

  /* sans potion : le bouclier sur sa proie */
  t = prep('toiles', {sac:['huile', 'colle', 'baume'], hasard:[0.99, 0.99, 0.5, 0.99, 0.5]}); c = t.c; f1 = bete(c, 'feufollet', 0); f2 = bete(c, 'feufollet', 1);
  ok(f1.plan.cibles.indexOf('pisteur') >= 0, 'le feu follet montre ses deux proies (' + f1.plan.cibles.join(', ') + ')');
  ev = jouer(c, 'sage', 'bouclier', 'pisteur');
  ev = tourSuivant(c);
  ok(trouve(ev, 'special', function(e){ return e.nom === 'accroche'; }) && c.a(f1, 'accroche') && f1.ouvert !== 0, 'sans potion : sa flamme tombe sur le bouclier, il s\'y accroche, on le voit (ouvert)');
  ev = jouer(c, 'pisteur', 'fleche', f1);
  ok(trouve(ev, 'degats').critique && f1.mort, 'au tour suivant il est encore ouvert : critique');
  t = prep('toiles', {sac:['huile', 'colle', 'baume'], hasard:[0.99, 0.99, 0.5, 0.99, 0.5]}); c = t.c; f1 = bete(c, 'feufollet', 0);
  jouer(c, 'sage', 'bouclier', 'pisteur'); tourSuivant(c);
  ok(c.a(f1, 'accroche') && f1.ouvert !== 0, 'il reste accroché et ouvert pendant tout le tour suivant');
  ev = tourSuivant(c);
  ok(trouve(ev, 'attaque', function(e){ return e.bete === f1.id; }) && f1.ouvert === 0 && !c.a(f1, 'accroche'), 'accroché, il crache quand même ses flammes ; à la fin de ce tour-là il se décroche et se referme');
  /* (13 novembre, 18 h 48) les runes sur lui : son prochain coup frappe QUATRE FOIS plus fort */
  var BR = D.MONSTRES.feufollet.attaques.brulure.degats, d4 = tous(ev, 'degats', function(e){ return e.bete === f1.id; });
  ok(d4.length > 0 && d4.every(function(e){ return e.brut === BR * 4; }), 'avec les runes sur lui, son coup suivant frappe 4 fois plus fort (' + BR + ' → ' + BR * 4 + ')');
  D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; });
  ev = tourSuivant(c);
  d4 = tous(ev, 'degats', function(e){ return e.bete === f1.id; });
  ok(d4.length > 0 && d4.every(function(e){ return e.brut === BR; }), 'les runes parties, il retrouve sa force ordinaire : un seul coup à 4 fois');
})();

section('L\'araignée des caves et ses petites');
(function(){
  var t = prep('toiles', {sac:['huile', 'feu', 'baume'], hasard:[0.3]}), c = t.c, ar = bete(c, 'araignee'), ev;
  egal([ar.plan.nom, ar.plan.cibles], ['toile', ['alchimiste']], 'elle commence par sa toile, et montre sa proie');
  ev = jouer(c, 'sage', 'rune', ar);
  ok(ar.ouvert !== 0 && c.a(ar, 'dos'), 'chemin normal : la lumière la fait tomber sur le dos');
  ev = jouer(c, 'pisteur', 'dague', ar);
  ok(trouve(ev, 'degats').n === 80 && ar.mort, 'critique à la dague : 80, elle est battue (60 PV)');

  t = prep('toiles', {sac:['huile', 'feu', 'baume'], hasard:[0.3]}); c = t.c; ar = bete(c, 'araignee');
  ev = jouer(c, 'alchimiste', 'p:huile', ar);
  ok(ar.ouvert !== 0 && c.a(ar, 'dos') && trouve(ev, 'ouvert').par === 'huile', 'autre chemin : l\'huile sur le fil');
  ev = jouer(c, 'pisteur', 'fleche', ar);
  ok(trouve(ev, 'degats').n === 60 && ar.mort, 'critique à la flèche : 60, juste assez');

  t = prep('toiles', {sac:['huile', 'feu', 'baume'], hasard:[0.3]}); c = t.c; ar = bete(c, 'araignee');
  ev = tourSuivant(c);
  ok(c.h.alchimiste.entoile && trouve(ev, 'etat', function(e){ return e.heros === 'alchimiste' && e.nom === 'entoile' && e.on; }), 'la toile attrape sa proie');
  ok(trouve(ev, 'passe', function(e){ return e.heros === 'alchimiste'; }) && c.aJouer().indexOf('alchimiste') < 0, 'le héros pris dans la toile passe son tour');
  egal(c.refus('alchimiste', 'herbes', 'sage'), 'Entoilé !', 'refus : « Entoilé ! »');
  egal(ar.plan.nom, 'morsure', 'au tour suivant, elle mord');
  ev = tourSuivant(c);
  ok(!c.h.alchimiste.entoile && trouve(ev, 'degats', function(e){ return e.attaque === 'morsure' && e.brut === D.MONSTRES.araignee.attaques.morsure.degats; }), 'il se libère ; elle mord');
  t = prep('toiles', {sac:['huile', 'feu', 'baume'], hasard:[0.3]}); c = t.c; ar = bete(c, 'araignee');
  jouer(c, 'sage', 'bouclier', 'alchimiste');
  ev = tourSuivant(c);
  ok(!c.h.alchimiste.entoile && trouve(ev, 'pare', function(e){ return e.quoi === 'toile'; }), 'le bouclier de runes arrête la toile');

  t = prep('toiles', {sac:['huile', 'feu', 'baume'], hasard:[0.01]}); c = t.c; ar = bete(c, 'araignee');     /* sa toile ira sur le Sage */
  ev = jouer(c, 'alchimiste', 'p:feu', ar);
  var nes = tous(ev, 'arrive');
  ok(trouve(ev, 'touche').piege && trouve(ev, 'special').nom === 'eclosion' && nes.length === 2 && nes[0].bete.type === 'petitearaignee' && c.a(ar, 'oeufs-brulent'), 'piège : le feu fait éclore ses œufs, deux petites araignées arrivent');
  ok(c.b[0].type === 'petitearaignee' && c.b[1].type === 'petitearaignee' && c.devant().type === 'petitearaignee' && c.b[0].pv === 15, 'elles se mettent devant (15 PV chacune)');
  ok(!trouve(ev, 'degats'), 'ce feu-là ne lui fait aucun dégât');
  tourSuivant(c);
  ev = jouer(c, 'alchimiste', 'p:feu', ar);
  ok(tous(ev, 'arrive').length === 0 && trouve(ev, 'degats').n === 5 && c.a(ar, 'brule'), 'les œufs n\'éclosent qu\'une fois : ensuite le feu la brûle comme une autre');
  var pt = c.b[0];
  tourSuivant(c);                              /* le Sage était pris dans la toile : il s'en libère */
  ev = jouer(c, 'sage', 'rune', pt);
  ok(pt.ouvert !== 0, 'la petite araignée s\'ouvre comme sa mère (la lumière)');
  ev = jouer(c, 'pisteur', 'dague', pt);
  ok(pt.mort, 'et un critique la bat');
  t.p.livre = {};
  tourSuivant(c);
})();

section('Le têtard');
(function(){
  var t = prep('bassin'), c = t.c, t1 = c.b[0], t2 = c.b[1], ev;
  ok(t1.type === 'tetard' && c.devant() === t1 && c.b[2].type === 'bourbe', 'dans le grand bassin, les deux têtards sont devant Bourbe');
  ev = jouer(c, 'pisteur', 'fleche', t2);
  ok(t2.mort && trouve(ev, 'mort').mode === 'fuit', 'un seul coup suffit : une flèche le renvoie à l\'eau');
  ev = jouer(c, 'alchimiste', 'louche');
  ok(t1.mort, 'un coup de louche suffit aussi');
})();

/* Les tests qui suivent (élites, boss, objets, soins, fin de combat) datent d'avant les coups préparés et la colère : ils
   regardent les combos et les réactions, pas le rythme. On les joue donc avec le rythme d'avant, et sans colère ; le coup
   préparé et la colère sont testés à part, plus bas. */
var RYTHMES = {gardien:D.MONSTRES.gardien.rythme, roirats:D.MONSTRES.roirats.rythme, bourbe:D.MONSTRES.bourbe.rythme};
var COLERES = {gardien:D.MONSTRES.gardien.colere, roirats:D.MONSTRES.roirats.colere, bourbe:D.MONSTRES.bourbe.colere};
function sansGros(on){
  D.MONSTRES.gardien.rythme = on ? ['poing'] : RYTHMES.gardien;
  D.MONSTRES.roirats.rythme = on ? ['grouillement'] : RYTHMES.roirats;
  D.MONSTRES.bourbe.rythme = on ? ['langue', 'saut'] : RYTHMES.bourbe;
  ['gardien', 'roirats', 'bourbe'].forEach(function(k){ D.MONSTRES[k].colere = on ? null : COLERES[k]; });
}
sansGros(true);
section('Les élites et le boss sont immunisés tant que le point faible est fermé');
(function(){
  ['atelier', 'ossuaire', 'bassin'].forEach(function(salle){
    var type = {atelier:'gardien', ossuaire:'roirats', bassin:'bourbe'}[salle];
    var t = prep(salle, {sac:['feu', 'acide', 'colle']}), c = t.c, m = bete(c, type), ev, pv = m.pv;
    c.b.forEach(function(x){ if(x !== m) x.mort = true; });
    ev = jouer(c, 'pisteur', 'fleche', m);
    ok(trouve(ev, 'rebond') && trouve(ev, 'tir').rebond && m.pv === pv, D.MONSTRES[type].nom + ' : la flèche rebondit');
    tourSuivant(c); c.h.pisteur.pv = 120; c.h.alchimiste.pv = 100; c.h.sage.pv = 90; D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].avale = null; });
    if(type === 'bourbe'){
      /* (11 novembre, 19 h 21) dans l'eau, la dague ne l'atteint pas : « Dans l'eau ! » */
      egal(c.refus('pisteur', 'dague', m.id), 'Dans l\'eau !', 'Bourbe dans l\'eau : la dague ne l\'atteint pas (« Dans l\'eau ! »)');
      egal(c.gestes('pisteur').filter(function(g){ return g.geste === 'dague'; })[0].mot, 'Dans l\'eau !', 'et la carte de la dague le dit');
      c.sac = c.sac.concat(['givre']); jouer(c, 'alchimiste', 'p:givre', m); c.h.alchimiste.joue = false;
    }
    ev = jouer(c, 'pisteur', 'dague', m);
    ok(trouve(ev, 'rebond') && m.pv === pv, D.MONSTRES[type].nom + ' : la dague rebondit' + (type === 'bourbe' ? ' (sur la glace)' : ''));
    if(type !== 'gardien'){
      ev = jouer(c, 'alchimiste', 'p:acide', m);
      ok(trouve(ev, 'rebond') && m.pv === pv, D.MONSTRES[type].nom + ' : l\'acide ne lui fait rien');
    }
    tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].pv = 90; c.h[h].avale = null; });
    ev = jouer(c, 'alchimiste', 'p:colle', m);
    ok(!c.a(m, 'colle') && m.pv === pv, D.MONSTRES[type].nom + ' : la colle ne le retient pas');
    ok(m.pv === pv && !c.a(m, 'brule'), D.MONSTRES[type].nom + ' : aucun dégât, aucune brûlure');
  });
})();

section('Le Gardien de rouille');
(function(){
  var POING = D.MONSTRES.gardien.attaques.poing.degats;
  var t = prep('atelier', {sac:['acide', 'feu', 'baume']}), c = t.c, g = bete(c, 'gardien'), rc = bete(c, 'ratcuir'), ev;
  egal([g.plan.nom, g.plan.cibles], ['poing', ['pisteur']], 'il vise toujours le héros de devant (le Pisteur)');
  ev = jouer(c, 'alchimiste', 'p:acide', g);
  ok(trouve(ev, 'special').nom === 'plaque-tombe' && c.a(g, 'plaque-ouverte') && g.ouvert === 0, 'chemin normal, étape 1 : l\'acide fait tomber la plaque (pas encore ouvert)');
  ev = jouer(c, 'pisteur', 'fleche', g);
  ok(trouve(ev, 'rebond'), 'la plaque tombée ne suffit pas : la flèche rebondit encore');
  ev = jouer(c, 'sage', 'rune', g);
  ok(g.ouvert !== 0 && c.a(g, 'ebloui'), 'étape 2 : la lumière sur le cœur, il est ouvert');
  ev = tourSuivant(c);
  egal(trouve(ev, 'degats', function(e){ return e.bete === g.id; }).brut, D.MONSTRES.gardien.attaques.poing.degats, 'ouvert ou pas, son poing tombe sur le Pisteur');
  ok(g.ouvert === 0 && c.a(g, 'plaque-ouverte'), 'le cœur se referme à la fin du tour ; la plaque reste tombée');
  ev = jouer(c, 'sage', 'rune', g);
  ev = jouer(c, 'pisteur', 'fleche', g);
  egal(trouve(ev, 'degats').n, 35, 'critique à la flèche sur un élite qui marche par terre : 35 (la dague : 140)');
  ok(!g.mort, 'un critique ne tue pas un élite d\'un coup');
  ev = jouer(c, 'alchimiste', 'p:feu', g);
  ok(trouve(ev, 'degats').n === 30 && c.a(g, 'brule') && !c.a(g, 'rougeoie'), 'ouvert, le feu le blesse (30) et le fait brûler');
  rc.mort = true;
  tourSuivant(c);
  jouer(c, 'sage', 'rune', g);
  ev = jouer(c, 'pisteur', 'dague', g);
  egal(trouve(ev, 'degats').n, 140, 'critique à la dague (il est devant, le rat cuirassé est battu) : 140');

  t = prep('atelier', {sac:['givre', 'feu', 'baume'], recettes:D.ORDRE_RECETTES}); c = t.c; g = bete(c, 'gardien');
  ev = jouer(c, 'alchimiste', 'p:givre', g);
  ok(trouve(ev, 'special').nom === 'plaque-eclate' && c.a(g, 'sans-plaque'), 'autre chemin : le givre fait éclater la plaque');
  ev = jouer(c, 'sage', 'rune', g);
  ok(g.ouvert !== 0, 'puis la lumière ouvre le cœur');

  t = prep('atelier', {sac:['huile', 'colle', 'baume']}); c = t.c; g = bete(c, 'gardien');
  jouer(c, 'sage', 'bouclier', 'pisteur');
  ev = tourSuivant(c);
  var dg = trouve(ev, 'degats', function(e){ return e.bete === g.id; });
  ok(dg.bouclier && dg.n === Math.ceil(POING * D.CHIFFRES.bouclier) && trouve(ev, 'special', function(e){ return e.nom === 'entrouvert'; }) && c.a(g, 'plaque-entrouverte'), 'sans potion : il frappe le bouclier (' + POING + ' → ' + Math.ceil(POING / 2) + '), sa plaque s\'entrouvre');
  ev = jouer(c, 'sage', 'rune', g);
  ok(g.ouvert !== 0 && !trouve(ev, 'touche').piege, 'au tour suivant, la lumière passe par la fente : ouvert');
  ev = jouer(c, 'pisteur', 'fleche', g);
  ok(trouve(ev, 'degats').critique, 'critique');
  tourSuivant(c);
  ok(!c.a(g, 'plaque-entrouverte') && g.ouvert === 0, 'la plaque se referme à la fin de ce tour : il faut recommencer');

  t = prep('atelier', {sac:['feu', 'acide', 'baume']}); c = t.c; g = bete(c, 'gardien');
  ev = jouer(c, 'sage', 'rune', g);
  ok(trouve(ev, 'touche').piege && c.a(g, 'enrage') && g.ouvert === 0, 'piège : la lumière avant la plaque, ses runes s\'affolent');
  ev = tourSuivant(c);
  egal(trouve(ev, 'degats', function(e){ return e.bete === g.id; }).brut, 2 * POING, 'ses coups sont doublés (' + 2 * POING + ')…');
  c.h.pisteur.pv = 120; c.h.pisteur.sol = false;
  ev = tourSuivant(c);
  egal(trouve(ev, 'degats', function(e){ return e.bete === g.id; }).brut, 2 * POING, '…pendant deux tours');
  c.h.pisteur.pv = 120; c.h.pisteur.sol = false;
  ok(!c.a(g, 'enrage'), 'puis il se calme');
  ev = jouer(c, 'alchimiste', 'p:feu', g);
  ok(trouve(ev, 'touche').piege && c.a(g, 'rougeoie') && !trouve(ev, 'degats'), 'piège : le feu le chauffe au rouge');
  ev = tourSuivant(c);
  egal(trouve(ev, 'degats', function(e){ return e.bete === g.id; }).brut, POING + D.MONSTRES.gardien.attaques.poing.plusSi.rougeoie, 'rougi, il cogne plus fort, jusqu\'à la fin');
})();

section('Le Roi des rats');
(function(){
  function seul(c){ c.b.forEach(function(m){ if(m.type === 'feufollet') m.mort = true; }); return bete(c, 'roirats'); }
  var t = prep('ossuaire', {sac:['fumigene', 'colle', 'baume']}), c = t.c, roi = seul(c), ev;
  egal(roi.plan.cibles, ['pisteur', 'alchimiste', 'sage'], 'son grouillement vise les trois héros');
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(c.a(roi, 'noeud') && roi.ouvert === 0, 'chemin normal, étape 1 : le nuage, le nœud se tend');
  ev = tourSuivant(c);
  ok(trouve(ev, 'saute', function(e){ return e.bete === roi.id && e.nom === 'noeud'; }) && c.a(roi, 'noeud'), 'ils toussent et tirent chacun de leur côté : pas d\'attaque ; le nœud reste tendu au tour suivant');
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'special', function(e){ return e.nom === 'tirent'; }) && roi.ouvert !== 0 && !c.a(roi, 'noeud'), 'étape 2 : le bruit, le nœud se montre (ouvert)');
  ev = jouer(c, 'pisteur', 'dague', roi);
  egal(trouve(ev, 'degats').n, 140, 'critique à la dague : 140');
  ev = tourSuivant(c);
  ok(trouve(ev, 'attaque', function(e){ return e.bete === roi.id; }) && roi.ouvert === 0, 'ouvert, il attaque quand même ; puis il se referme');
  ok(c.a(roi, 'etale'), 'après leur assaut, ils sont étalés');

  /* sans potion : le bruit juste après leur attaque, avant tout autre geste */
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'special', function(e){ return e.nom === 'panique'; }) && roi.ouvert !== 0, 'sans potion : le bruit en PREMIER geste du tour suivant, c\'est la panique (ouvert)');
  tourSuivant(c);
  ev = jouer(c, 'sage', 'bouclier', 'alchimiste');
  ok(!c.a(roi, 'etale') && trouve(ev, 'etat', function(e){ return e.nom === 'etale' && !e.on; }), 'un autre geste d\'abord : ils se regroupent, c\'est trop tard');
  ev = jouer(c, 'alchimiste', 'louche');
  var ch = trouve(ev, 'attaque', function(e){ return e.nom === 'charge'; });
  ok(trouve(ev, 'touche', function(e){ return e.coup === 'bruit' && e.bete === roi.id; }).piege && ch && ch.cibles[0] === 'alchimiste' && trouve(ev, 'degats', function(e){ return e.heros === 'alchimiste'; }).n === Math.ceil(D.MONSTRES.roirats.attaques.charge.degats * D.CHIFFRES.bouclier),
    'piège : le bruit au mauvais moment, ils chargent l\'Alchimiste (son bouclier en arrête 75 %)');

  t = prep('ossuaire', {sac:['fumigene', 'colle', 'feu']}); c = t.c; roi = seul(c);
  jouer(c, 'alchimiste', 'p:fumigene');
  ev = jouer(c, 'pisteur', 'p:colle', roi);
  ok(trouve(ev, 'special').nom === 'roi-colle' && roi.ouvert !== 0, 'autre chemin : le nuage puis la colle sur le roi');
  tourSuivant(c);
  ok(roi.ouvert !== 0, 'le roi collé reste ouvert jusqu\'à la fin du tour suivant');
  ev = jouer(c, 'pisteur', 'fleche', roi);
  egal(trouve(ev, 'degats').n, 35, 'critique à la flèche sur le Roi des rats : 35 (la dague : 140)');
  tourSuivant(c);
  ok(roi.ouvert === 0, 'puis il se referme');

  t = prep('ossuaire', {sac:['fumigene', 'colle', 'feu']}); c = t.c; roi = seul(c);
  ev = jouer(c, 'pisteur', 'p:colle', roi);
  ok(roi.ouvert === 0 && trouve(ev, 'mot'), 'la colle sans le nuage : rien');
  ev = jouer(c, 'sage', 'rune', roi);
  ok(trouve(ev, 'touche').piege && c.a(roi, 'boule'), 'piège : la lumière, ils se roulent en boule');
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(!c.a(roi, 'noeud') && trouve(ev, 'rebond', function(e){ return e.bete === roi.id; }), 'en boule, plus rien ne passe (même le nuage)');
  ev = tourSuivant(c);
  ok(trouve(ev, 'attaque', function(e){ return e.bete === roi.id; }) && c.a(roi, 'boule'), 'en boule, ils attaquent quand même ; la boule tient au tour suivant');
  tourSuivant(c);
  ok(!c.a(roi, 'boule'), 'la boule se défait après deux tours');
  t = prep('ossuaire', {sac:['fumigene', 'colle', 'feu']}); c = t.c; roi = seul(c);
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'attaque', function(e){ return e.nom === 'charge'; }) && c.h.alchimiste.pv === 100 - D.MONSTRES.roirats.attaques.charge.degats, 'piège : le bruit avant le nuage, ' + D.MONSTRES.roirats.attaques.charge.degats + ' sur l\'Alchimiste');
})();

section('Bourbe, le crapaud du puits');
(function(){
  var t = prep('bassin', {sac:['feu', 'fumigene', 'givre'], recettes:D.ORDRE_RECETTES, hasard:[0.99, 0.99, 0.3]}), c = t.c, bo = bete(c, 'bourbe'), ev;
  egal([bo.plan.nom, bo.plan.cibles], ['langue', ['alchimiste']], 'il commence par la langue, et montre qui il va avaler');
  ev = jouer(c, 'alchimiste', 'p:feu', bo);
  ok(!c.a(bo, 'sec') && trouve(ev, 'mot'), 'dans l\'eau, le feu ne sèche rien');
  ev = jouer(c, 'sage', 'rune', bo);
  ok(!c.a(bo, 'gele') && !c.a(bo, 'berge') && bo.ouvert === 0 && !trouve(ev, 'etat', function(e){ return e.bete === bo.id; }), 'la lumière ne le fait plus sortir de l\'eau (Romain, 11 novembre, 19 h 21)');
  ok(c.aPortee().indexOf(bo) < 0 && !c.auSol(bo), 'dans l\'eau, il n\'est pas à portée de dague');
  c.h.alchimiste.joue = false;
  ev = jouer(c, 'alchimiste', 'p:givre', bo);
  ok(c.a(bo, 'gele') && bo.ouvert === 0 && trouve(ev, 'etat', function(e){ return e.nom === 'gele'; }).tours === 3 && trouve(ev, 'mot', function(e){ return e.bete === bo.id; }), 'étape 1 : le givre gèle le bassin pour 3 tours, il saute sur la glace');
  ok(c.auSol(bo) && c.aPortee().indexOf(bo) < 0, 'sur la glace, la dague pourrait l\'atteindre — mais les têtards sont devant');
  ev = jouer(c, 'pisteur', 'p:feu', bo);
  ok(c.a(bo, 'sec') && !trouve(ev, 'degats'), 'étape 2 : le feu (ici en flèche) sèche sa bave');
  ev = c.tourMonstres();
  ok(c.h.alchimiste.avale === bo.id && trouve(ev, 'avale') && trouve(ev, 'degats', function(e){ return e.heros === 'alchimiste'; }).n === D.MONSTRES.bourbe.attaques.langue.degats, 'la langue : il avale l\'Alchimiste');
  egal(c.gestes('alchimiste').map(function(g){ return g.geste; }), ['chatouiller'], 'le héros avalé n\'a qu\'un geste : Chatouiller');
  egal(c.refus('alchimiste', 'herbes', 'sage'), 'Avalé !', 'refus : « Avalé ! »');
  egal(bo.plan.nom, 'saut', 'le ventre plein, il ne tire pas la langue : il prépare un saut');
  ev = jouer(c, 'alchimiste', 'chatouiller');
  ok(trouve(ev, 'special').nom === 'chatouille' && trouve(ev, 'recrache') && !c.h.alchimiste.avale && c.a(bo, 'dos') && bo.ouvert !== 0, 'sans nuage : chatouillé alors qu\'il est sec, il rit, recrache, et roule sur le dos (ouvert)');
  /* (13 novembre) la dague ne touche que le premier monstre au sol : derrière ses têtards, même sur le dos, Bourbe est trop loin.
     La rune d'appel du Sage l'amène devant. */
  ok(c.aPortee().indexOf(bo) < 0 && !!c.refus('pisteur', 'dague', bo), 'sur le dos, mais derrière ses têtards : pas à portée de dague');
  ok(c.appelables().indexOf(bo) >= 0, 'la rune d\'appel peut l\'amener devant');
  ev = jouer(c, 'sage', 'appel', bo);
  ok(c.aPortee().length === 1 && c.aPortee()[0] === bo, 'appelé devant par le Sage : à portée de dague, et lui seul');
  /* (13 novembre, 17 h 29) ouvert, le feu le blesse ; puis LE critique : la glace fond, il retombe à l'eau, tout est à refaire */
  c.h.alchimiste.joue = false;
  ev = jouer(c, 'alchimiste', 'p:feu', bo);
  ok(trouve(ev, 'degats').n === 30 && c.a(bo, 'brule'), 'ouvert, le feu le blesse (30) et le fait brûler');
  ev = jouer(c, 'pisteur', 'dague', bo);
  egal(trouve(ev, 'degats').n, 380, 'critique à la dague sur le boss : 380');
  ok(bo.ouvert === 0 && !c.a(bo, 'dos') && !c.a(bo, 'sec') && !c.a(bo, 'gele') && !c.auSol(bo) && trouve(ev, 'ferme') && trouve(ev, 'mot', function(e){ return e.texte === 'La glace fond !'; }),
    'dès le critique, la glace fond : il retombe à l\'eau, refermé — tout est à refaire (Romain, 13 novembre)');
  ev = tourSuivant(c);
  ok(trouve(ev, 'brulure', function(e){ return e.bete === bo.id; }), 'la brûlure, elle, continue');
  ok(trouve(ev, 'saute', function(e){ return e.bete === bo.id && e.nom === '_plouf'; }) && !trouve(ev, 'attaque', function(e){ return e.bete === bo.id; }), 'il vient de passer à travers la glace : il ne frappe pas ce tour-ci');
  D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; c.h[h].sol = false; });
  ev = tourSuivant(c);
  ok(trouve(ev, 'attaque', function(e){ return e.bete === bo.id; }) || trouve(ev, 'prepare', function(e){ return e.bete === bo.id; }), 'au tour d\'après, il attaque de nouveau');
  /* le critique à la flèche (300), avec la même suite */
  t = prep('bassin', {sac:['feu', 'fumigene', 'givre'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo); jouer(c, 'pisteur', 'p:feu', bo);
  tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; c.h[h].sol = false; });
  jouer(c, 'alchimiste', 'p:fumigene');
  ev = jouer(c, 'pisteur', 'fleche', bo);
  egal(trouve(ev, 'degats').n, 300, 'critique à la flèche sur le boss : 300');
  ok(bo.ouvert === 0 && !c.a(bo, 'gele') && !c.a(bo, 'dos'), 'et la glace fond aussi après un critique à la flèche');

  /* le chemin normal, avec le nuage */
  t = prep('bassin', {sac:['feu', 'fumigene', 'givre'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo); jouer(c, 'pisteur', 'p:feu', bo);
  tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; c.h[h].sol = false; });
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(c.a(bo, 'dos') && bo.ouvert !== 0 && trouve(ev, 'ouvert').par === 'nuage', 'chemin normal : le givre et le feu, puis le nuage au tour d\'après : sur le dos, ouvert');
  ev = c.tourMonstres();
  ok(!trouve(ev, 'attaque', function(e){ return e.bete === bo.id; }), 'il n\'attaque pas');

  /* sans feu : il sèche tout seul */
  t = prep('bassin', {sac:['fumigene', 'givre', 'baume'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo);
  tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; });
  ok(c.a(bo, 'gele') && !c.a(bo, 'sec'), 'sans feu : un tour sur la glace, pas encore sec');
  ev = tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; });
  ok(c.a(bo, 'sec') && c.a(bo, 'gele') && !c.a(bo, 'berge') && trouve(ev, 'etat', function(e){ return e.nom === 'sec' && e.seul; }), 'deux tours entiers sur la glace : il sèche tout seul, et la glace tient encore un tour');
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(c.a(bo, 'dos') && bo.ouvert !== 0, 'le nuage le renverse');
  t = prep('bassin', {sac:['fumigene', 'givre', 'baume'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo);
  tourSuivant(c); tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; });
  ok(c.a(bo, 'sec') && c.a(bo, 'gele'), 'au troisième tour, il est toujours sur la glace, tout sec');
  ev = tourSuivant(c);
  ok(!c.a(bo, 'sec') && !c.a(bo, 'gele') && !c.auSol(bo), 'si on ne fait rien de plus, la glace fond : il retourne à l\'eau au tour d\'après');

  /* les pièges */
  t = prep('bassin', {sac:['fumigene', 'feu', 'baume']}); c = t.c; bo = bete(c, 'bourbe');
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(trouve(ev, 'touche', function(e){ return e.bete === bo.id; }).piege && c.a(bo, 'gonfle') && bo.ouvert === 0, 'piège : le nuage avant qu\'il soit sec, il gonfle');
  ev = tourSuivant(c);
  var s = tous(ev, 'degats', function(e){ return e.bete === bo.id; });
  ok(trouve(ev, 'attaque', function(e){ return e.bete === bo.id; }).nom === 'saut' && s.length === 3 && s[0].brut === 2 * D.MONSTRES.bourbe.attaques.saut.degats && !c.a(bo, 'gonfle'), 'gonflé, il saute (au lieu de tirer la langue) et son saut frappe double sur tout le monde ; puis il dégonfle');
  D.ORDRE.forEach(function(h){ c.h[h].pv = 90; });
  var avant = c.vivants().length;
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'special', function(e){ return e.nom === 'plonger'; }) && c.a(bo, 'sous') && c.cache(bo), 'piège : le bruit, il plonge (on ne peut plus le viser)');
  egal(c.refus('sage', 'rune', bo.id), 'Sous l\'eau !', 'refus : « Sous l\'eau ! »');
  ev = tourSuivant(c);
  var tet = tous(ev, 'arrive', function(e){ return e.par === 'plongeon'; });
  ok(trouve(ev, 'saute', function(e){ return e.bete === bo.id && e.nom === 'sous'; }), 'sous l\'eau, il ne tire pas la langue ce tour-ci');
  ok(trouve(ev, 'special', function(e){ return e.nom === 'remonter'; }) && tet.length === 2 && !c.a(bo, 'sous'), 'il remonte à la fin du tour avec deux têtards de plus (la louche a renvoyé un des premiers à l\'eau)');
  var ret = trouve(ev, 'attaque', function(e){ return e.bete === bo.id && e.retour; });
  ok(ret && ret.nom === 'saut' && tous(ev, 'degats', function(e){ return e.bete === bo.id && e.attaque === 'saut'; }).length === 3, 'et il retombe sur tout le monde en remontant (un saut) : le bruit ne l\'empêche jamais d\'attaquer');
  ok(c.vivants().filter(function(m){ return m.type === 'tetard'; }).length === 3 && c.b[0].type === 'tetard', 'les nouveaux têtards se mettent devant');
  D.ORDRE.forEach(function(h){ c.h[h].pv = 90; c.h[h].avale = null; });
  jouer(c, 'alchimiste', 'louche'); tourSuivant(c);
  ok(c.vivants().filter(function(m){ return m.type === 'tetard'; }).length <= D.BOURBE.tetardsMax, 'jamais plus de ' + D.BOURBE.tetardsMax + ' têtards à la fois');

  /* le givre */
  t = prep('bassin', {sac:['givre', 'fumigene', 'baume'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  ev = jouer(c, 'alchimiste', 'p:givre', bo);
  ok(c.a(bo, 'gele') && trouve(ev, 'etat', function(e){ return e.nom === 'gele'; }).tours === 3, 'le givre gèle le bassin pour 3 tours');
  tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; });
  ev = jouer(c, 'alchimiste', 'louche');
  ok(trouve(ev, 'mot', function(e){ return e.bete === bo.id; }) && !trouve(ev, 'special') && !c.a(bo, 'sous'), 'bassin gelé : au bruit, il ne peut pas plonger, il se cogne (pas de têtards)');
  ev = tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; });
  ok(c.a(bo, 'sec'), 'sur la glace depuis deux tours : il est sec');
  ev = jouer(c, 'alchimiste', 'p:fumigene');
  ok(c.a(bo, 'dos') && bo.ouvert !== 0, 'et le nuage le renverse');

  /* la langue, le bouclier, le chatouillis mouillé */
  t = prep('bassin', {sac:['feu', 'fumigene', 'baume']}); c = t.c; bo = bete(c, 'bourbe');
  ev = tourSuivant(c);
  ok(c.h.pisteur.avale === bo.id, 'la langue avale le Pisteur');
  ev = jouer(c, 'pisteur', 'chatouiller');
  ok(trouve(ev, 'special').nom === 'recrache' && trouve(ev, 'recrache') && !c.h.pisteur.avale && bo.ouvert === 0, 'chatouillé alors qu\'il est mouillé : il recrache, mais ne se renverse pas');
  ok(c.h.pisteur.joue, 'se libérer a pris le tour du Pisteur');
  ev = tourSuivant(c);
  egal(trouve(ev, 'attaque', function(e){ return e.bete === bo.id; }).nom, 'saut', 'il alterne : après la langue, le saut');
  egal(tous(ev, 'degats', function(e){ return e.bete === bo.id; }).length, 3, 'le saut touche les trois héros');
  D.ORDRE.forEach(function(h){ c.h[h].pv = 90; });
  egal(bo.plan.nom, 'langue', 'puis de nouveau la langue');
  jouer(c, 'sage', 'bouclier', bo.plan.cibles[0]);
  ev = tourSuivant(c);
  ok(trouve(ev, 'pare', function(e){ return e.quoi === 'langue'; }) && !D.ORDRE.some(function(h){ return c.h[h].avale; }), 'le bouclier de runes arrête la langue : personne n\'est avalé');

  /* seul dans le ventre : ce n'est pas une défaite */
  t = prep('bassin', {sac:['feu', 'fumigene', 'baume']}); c = t.c; bo = bete(c, 'bourbe');
  c.b.forEach(function(m){ if(m.type === 'tetard') m.mort = true; });
  tourSuivant(c);
  c.h.alchimiste.sol = true; c.h.alchimiste.pv = 0; c.h.sage.sol = true; c.h.sage.pv = 0;
  ok(c.h.pisteur.avale === bo.id && !c.fini() && c.aJouer().join() === 'pisteur', 'les deux autres au sol, le Pisteur dans le ventre : le combat continue, il peut encore chatouiller');
  jouer(c, 'pisteur', 'chatouiller');
  ev = c.tourMonstres();
  ok(!c.h.pisteur.avale && trouve(ev, 'attaque', function(e){ return e.bete === bo.id && e.cibles.join() === 'pisteur'; }), 'recraché, il est de nouveau seul face à Bourbe');
  /* la mort du chef */
  t = prep('bassin', {sac:['feu', 'fumigene', 'baume']}); c = t.c; bo = bete(c, 'bourbe');
  tourSuivant(c);
  bo.pv = 100; bo.ouvert = 1;
  var qui = D.ORDRE.filter(function(h){ return c.h[h].avale; })[0];
  ev = jouer(c, qui === 'pisteur' ? 'alchimiste' : 'pisteur', qui === 'pisteur' ? 'p:feu' : 'fleche', bo);
  if(!bo.mort){ bo.pv = 1; D.ORDRE.forEach(function(h){ c.h[h].joue = false; }); ev = jouer(c, 'alchimiste', 'p:feu', bo); }
  ok(bo.mort && trouve(ev, 'recrache', function(e){ return e.heros === qui; }) && c.fini() === 'victoire' && tous(ev, 'mort', function(e){ return e.cause === 'chef'; }).length === 2, 'Bourbe battu : il recrache son prisonnier, ses têtards détalent, victoire');
})();

section('Les objets et leurs bonus');
(function(){
  var t = prep('toiles', {objets:{pisteur:['fleches-argent']}, hasard:[0.3]}), c = t.c, f = bete(c, 'feufollet'), ar = bete(c, 'araignee'), ev;   /* la toile ira sur l'Alchimiste */
  ev = jouer(c, 'pisteur', 'f:fleches-argent', f);
  ok(trouve(ev, 'tir').fleche === 'argent' && trouve(ev, 'touche').coup === 'fleche-argent' && trouve(ev, 'degats').n === 10, 'flèches d\'argent : elles touchent le feu follet même fermé (10)');
  tourSuivant(c);
  ev = jouer(c, 'pisteur', 'f:fleches-argent', ar);
  egal(trouve(ev, 'degats').n, 3, 'sur une autre bête, l\'argent ne change rien (3)');
  tourSuivant(c);
  jouer(c, 'alchimiste', 'p:fumigene');
  var f2 = bete(c, 'feufollet', 1);
  ev = jouer(c, 'pisteur', 'f:fleches-argent', f2);
  egal(trouve(ev, 'degats').n, 90, 'flèches d\'argent : le critique est une fois et demie plus fort (60 → 90)');

  t = prep('atelier', {objets:{pisteur:['fleches-lourdes']}, sac:['acide', 'feu', 'baume']}); c = t.c;
  var g = bete(c, 'gardien'), rc = bete(c, 'ratcuir');
  ev = jouer(c, 'pisteur', 'f:fleches-lourdes', rc);
  ok(trouve(ev, 'tir').fleche === 'lourde' && trouve(ev, 'touche').coup === 'fleche-lourde' && trouve(ev, 'degats').n === 12, 'flèches lourdes : 12 sur le rat cuirassé, même fermé (au lieu de 1)');
  rc.pv = 70;
  jouer(c, 'alchimiste', 'p:acide', g); tourSuivant(c);
  ev = jouer(c, 'pisteur', 'f:fleches-lourdes', g);
  ok(trouve(ev, 'tir').fleche === 'lourde' && trouve(ev, 'rebond') && g.pv === 280, 'flèches lourdes : le Gardien fermé reste immunisé (un élite ne se grignote pas)');
  tourSuivant(c); c.h.pisteur.pv = 120; c.h.pisteur.sol = false;
  jouer(c, 'sage', 'rune', g);
  ev = jouer(c, 'pisteur', 'f:fleches-lourdes', g);
  egal(trouve(ev, 'degats').n, 165, 'flèches lourdes : le critique sur le Gardien passe de 110 à 165');
  jouer(c, 'alchimiste', 'p:acide', rc); tourSuivant(c);
  ev = jouer(c, 'pisteur', 'f:fleches-lourdes', rc);
  ok(trouve(ev, 'degats').n === 90 && rc.mort, 'flèches lourdes : 90 sur le rat cuirassé sans armure, il est battu d\'un coup');

  /* Romain, 10 novembre : le Pisteur porte tous ses carquois et CHOISIT sa flèche ; chaque sorte a son défaut */
  t = prep('toiles', {objets:{pisteur:['fleches-normales', 'fleches-argent', 'fleches-lourdes']}, sac:['fumigene', 'feu', 'baume'], hasard:[0.3]}); c = t.c; f = bete(c, 'feufollet');
  egal(c.gestes('pisteur').filter(function(x){ return x.geste === 'fleche' || x.geste.indexOf('f:') === 0; }).map(function(x){ return x.geste; }), ['fleche', 'f:fleches-argent', 'f:fleches-lourdes'], 'trois cartes de flèche : la normale, celle de lune, la transperçante');
  ev = jouer(c, 'pisteur', 'fleche', f);
  ok(trouve(ev, 'tir').fleche === 'normale' && trouve(ev, 'degats').n === 1, 'la flèche normale, même avec les carquois sur le dos : pas de bonus (1 sur le feu follet fermé)');
  tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].pv = 90; c.h[h].entoile = false; });
  jouer(c, 'alchimiste', 'p:fumigene');
  var pvF = f.pv;
  ev = jouer(c, 'pisteur', 'f:fleches-lourdes', f);
  ok(f.ouvert !== 0 && trouve(ev, 'tir').defaut === 'traverse' && trouve(ev, 'mot').texte === 'À travers !' && !trouve(ev, 'degats') && f.pv === pvF, 'la flèche transperçante passe à travers une bête de brume, même ouverte : le tour est perdu');
  t = prep('atelier', {objets:{pisteur:['fleches-normales', 'fleches-argent']}, sac:['acide', 'feu', 'baume']}); c = t.c; rc = bete(c, 'ratcuir');
  jouer(c, 'alchimiste', 'p:acide', rc);
  ev = jouer(c, 'pisteur', 'f:fleches-argent', rc);
  ok(rc.ouvert !== 0 && trouve(ev, 'tir').defaut === 'rebondit' && trouve(ev, 'rebond') && !trouve(ev, 'degats') && rc.pv === 70, 'la flèche de lune rebondit sur le rat cuirassé, même ouvert');
  egal(c.refus('pisteur', 'f:fleches-lourdes', rc.id), 'Déjà joué', '(le Pisteur a joué)');
  t = prep('atelier', {sac:['acide', 'feu', 'baume']}); c = t.c;
  egal(c.refus('pisteur', 'f:fleches-lourdes', bete(c, 'ratcuir').id), 'Pas emporté', 'sans le carquois, pas de flèche transperçante (« Pas emporté »)');

  t = prep('canaux', {objets:{sage:['cristal-lune']}}); c = t.c;
  /* Romain, 11 novembre (16 h 07) : le Sage porte toutes ses armes et choisit en combat — une carte de plus par arme */
  egal(c.gestes('sage').map(function(x){ return x.geste + ':' + x.vise; }), ['oeil:salle', 'rune:bete', 'a:cristal-lune:salle', 'bouclier:heros', 'appel:bete'], 'cristal de lune : une carte de plus (toute la salle), la rune de lumière sur un seul monstre reste là');
  /* (11 novembre, 16 h 37 : le bâton se choisit à part ; le geste « a:<bâton> » est le SORT lancé avec ce bâton) */
  egal(c.gestes('sage').filter(function(x){ return x.geste === 'a:cristal-lune'; })[0].nom, 'Rune de lumière', 'le sort lancé avec le bâton de lune garde son nom de sort');
  egal(D.OBJETS['cristal-lune'].carte.nom + ' / ' + D.OBJETS['baton-chene'].carte.nom + ' / ' + D.BATON.nom, 'Bâton de lune / Bâton de chêne / Bâton normal', 'les trois bâtons du Sage ont leur nom de carte');
  egal(D.GESTES.fleche.arme + ' / ' + D.OBJETS['fleches-argent'].carte.nom + ' / ' + D.OBJETS['fleches-lourdes'].carte.nom + ' / ' + D.GESTES.dague.arme, 'Arc normal / Arc de lune / Arc transperçant / Dague', 'les quatre armes du Pisteur ont leur nom de carte');
  ev = c.jouer('sage', {geste:'a:cristal-lune'});
  ok(trouve(ev, 'rune').salle && bete(c, 'rat').ouvert !== 0 && c.a(bete(c, 'chauvesouris', 0), 'folle') && c.a(bete(c, 'chauvesouris', 1), 'folle'), 'cristal de lune : le rat s\'ouvre… et les deux chauves-souris deviennent folles (puissant, mais dangereux)');

  t = prep('rats', {objets:{sage:['baton-chene']}, hasard:[0.99, 0.99, 0.3]}); c = t.c;
  egal([c.gestes('sage').filter(function(x){ return x.geste === 'bouclier'; })[0].max, c.gestes('sage').filter(function(x){ return x.geste === 'a:baton-chene'; })[0].max], [1, 3], 'bâton de chêne : une carte de plus, qui protège les trois héros (14 novembre) ; le bouclier simple reste là');
  egal(c.refus('sage', 'bouclier', ['pisteur', 'alchimiste']), 'Un seul geste', 'le bouclier simple : toujours un seul héros');
  ev = c.jouer('sage', {geste:'a:baton-chene', cible:['pisteur', 'alchimiste', 'sage']});
  ok(c.h.pisteur.bouclier && c.h.alchimiste.bouclier && c.h.sage.bouclier, 'bâton de chêne : les trois héros protégés');
  ok(c.h.pisteur.bouclier === 'chene' && c.h.alchimiste.bouclier === 'chene' && c.h.sage.bouclier === 'chene', 'ce sont trois boucliers du bâton de chêne');
  ev = tourSuivant(c);
  ok(tous(ev, 'degats', function(e){ return e.bouclier; }).length === 3, 'les trois morsures tombent sur des boucliers');
  /* (13 novembre) le bouclier de chêne n'arrête que la moitié du coup ; le bouclier jaune (bâton normal) en arrête 75 % */
  ok(tous(ev, 'degats', function(e){ return e.bouclier; }).every(function(e){ return e.chene && e.n === Math.ceil(e.brut * D.CHIFFRES.bouclierChene); }) && D.CHIFFRES.bouclierChene === .5 && D.CHIFFRES.bouclier === .25, 'le bouclier de chêne arrête 50 %, le jaune 75 %');
  /* … et il laisse passer la toile, que le bouclier jaune arrête */
  (function(){
    var t2 = prep('toiles', {objets:{sage:['baton-chene']}, hasard:[0.99, 0.99, 0.99]}), c2 = t2.c, ar = bete(c2, 'araignee'), proie = ar.plan.cibles[0], autre = D.ORDRE.filter(function(h){ return h !== proie; })[0];
    c2.jouer('sage', {geste:'a:baton-chene', cible:[proie, autre]});
    var e2 = tourSuivant(c2);
    ok(c2.h[proie].entoile && !trouve(e2, 'pare'), 'la toile passe à travers un bouclier de chêne : le héros est entoilé');
  })();
  t = prep('rats'); c = t.c;
  egal(c.refus('sage', 'bouclier', ['pisteur', 'alchimiste']), 'Un seul geste', 'sans le bâton : un seul héros protégé');
  egal([c.refus('sage', 'a:baton-chene', ['pisteur', 'alchimiste']), c.refus('sage', 'a:cristal-lune')], ['Pas emporté', 'Pas emporté'], 'sans l\'arme, pas de carte (« Pas emporté »)');
  t = prep('rats', {objets:{sage:['cristal-lune', 'baton-chene']}}); c = t.c;
  egal(c.gestes('sage').map(function(x){ return x.geste; }), ['oeil', 'rune', 'a:cristal-lune', 'bouclier', 'a:baton-chene', 'appel'], 'avec ses deux armes, le Sage a six cartes : il choisit en combat');

  t = prep('rats', {objets:{pisteur:['amulette']}, pv:{pisteur:5}}); c = t.c;
  ev = tourSuivant(c);
  ok(trouve(ev, 'releve', function(e){ return e.par === 'amulette'; }) && !c.h.pisteur.sol && c.h.pisteur.objets.indexOf('amulette') < 0, 'amulette de vie : le Pisteur qui tombe se relève tout seul avec 30');
  ok(c.h.pisteur.pv <= 30 && c.h.pisteur.pv > 0, 'il continue le combat (' + c.h.pisteur.pv + ' PV après les autres morsures)');
  c.h.pisteur.pv = 1;
  ev = tourSuivant(c);
  ok(c.h.pisteur.sol, 'l\'amulette ne sert qu\'une fois');
  c.b.forEach(function(m){ m.mort = true; }); c._bilan([]);
  ok(/\|pisteur$/.test(t.p.faits['amulette:utilisee']) && t.p.heros.pisteur.objets.indexOf('amulette') < 0, 'après la victoire, la partie sait que l\'amulette a servi (dans quel combat, et à qui)');

  /* les potions (Romain, 10 novembre) : plus de sac à choisir, plus de sacoche ; l'Alchimiste a toutes celles qu'il a créées */
  var p = R.nouvellePartie(3);
  ok(!('sac' in p) && !R.refaireSac && !R.sacPermis && !D.OBJETS.sacoche && D.LIEUX.aeration.objets.join() === 'herbes', 'plus de sac à remplir, plus de sacoche dans le puits d\'aération');
  egal(R.potions(p), D.RECETTES_DEPART, 'l\'Alchimiste part avec ses sept potions');
  p.lieu = 'rats'; var cp = R.combat(p, 'rats', {alea:ecrit()});
  egal(cp.gestes('alchimiste').filter(function(x){ return x.geste.indexOf('p:') === 0; }).map(function(x){ return x.geste.slice(2); }), D.RECETTES_DEPART, 'en combat, il les a toutes sous la main');
  egal(cp.refus('alchimiste', 'p:givre', 'b1'), 'Pas emporté', 'le givre n\'est pas connu au départ (« Pas emporté »)');
  R.fuir(p); p = R.nouvellePartie(3);
  egal(p.recettes, ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'], 'sept recettes connues au départ (avec l\'acide)');
})();

section('Les soins : le Baume lumineux');
(function(){
  var t = prep('rats', {sac:['baumelum', 'feu', 'baume'], recettes:D.ORDRE_RECETTES, pv:{pisteur:50, alchimiste:95, sage:10}}), c = t.c, ev;
  ev = c.jouer('alchimiste', {geste:'p:baumelum'});
  var n = D.RECETTES.baumelum.soinEquipe;
  egal(pvHeros(c), [50 + n, 100, 10 + n], 'le Baume lumineux soigne ' + n + ' à toute l\'équipe (sans dépasser le maximum)');
  egal(tous(ev, 'soin').length, 3, 'un soin par héros');
})();

section('La fin d\'un combat');
(function(){
  var t = prep('rats', {pv:{sage:3}, hasard:[0.01, 0.01, 0.01]}), c = t.c, p = t.p, ev;
  ev = tourSuivant(c);
  ok(c.h.sage.sol, 'le Sage tombe');
  ok(p.heros.sage.pv === 3 && !p.faits['combat:rats'], 'pendant le combat, la partie n\'est pas touchée');
  c.b.forEach(function(m){ m.pv = 1; });
  D.ORDRE.forEach(function(h){ c.h[h].joue = false; });
  jouer(c, 'pisteur', 'fleche', c.b[0]); jouer(c, 'alchimiste', 'louche');
  D.ORDRE.forEach(function(h){ c.h[h].joue = false; });
  ev = jouer(c, 'pisteur', 'fleche', c.b[2]);
  ok(c.fini() === 'victoire' && trouve(ev, 'fin').resultat === 'victoire', 'tous les monstres battus : victoire');
  ok(p.faits['combat:rats'] === 1 && p.heros.pisteur.pv === c.h.pisteur.pv, 'la partie apprend le résultat : la salle est faite, les PV restants sont gardés');
  ok(p.heros.sage.pv === 1 && p.heros.sage.sol === false, 'le héros tombé se relève après la victoire, sonné, avec 1 PV');
  egal(c.jouer('pisteur', {geste:'fleche', cible:'b1'})[0].mot, 'C\'est fini', 'plus de geste après la fin');
  t = prep('rats', {pv:{pisteur:1, alchimiste:1, sage:1}, hasard:[0.99, 0.5, 0.01]}); c = t.c;
  ev = tourSuivant(c);
  ok(c.fini() === 'defaite' && trouve(ev, 'fin').resultat === 'defaite' && !t.p.faits['combat:rats'] && t.p.heros.pisteur.pv === 1, 'les trois héros au sol : défaite, la partie n\'a pas bougé');
  egal(c.tourMonstres()[0].t, 'refus', 'tourMonstres après la fin : refusé');
  t = prep('rats'); c = t.c;
  egal(c.tourMonstres()[0].mot, 'Pas encore !', 'tourMonstres tant qu\'un héros peut jouer : « Pas encore ! »');
})();

function codeEtude(id){ return !!(CODES.CODES[id] && CODES.CODES[id].a === 'sage' && CODES.CODES[id].de === 'pisteur'); }
sansGros(false);
section('Le journal de l\'aventurier, la rune de l\'œil, les coups préparés');
(function(){
  /* le journal de l'aventurier (Romain, 11 novembre) : un récit, jamais une question, jamais le nom d'un geste, d'une potion ou d'un héros */
  var INTERDITS = ['?', 'rune', 'louche', 'fumigène', 'fiole', 'potion', 'acide', 'givre', 'baume', 'bouclier', 'flèche', 'sage', 'alchimiste', 'pisteur', 'lanterne', 'torche'];
  var trahies = []; Object.keys(D.LIVRE).forEach(function(k){ D.LIVRE[k].forEach(function(t, i){ INTERDITS.forEach(function(w){ if(t.toLowerCase().indexOf(w) >= 0) trahies.push(k + ' ' + i + ' : « ' + w + ' »'); }); }); });
  egal(trahies, [], 'le journal de l\'aventurier : pas de question, pas de nom de geste ni de potion, une seule lampe (à huile)');
  ok(Object.keys(D.LIVRE).every(function(k){ return D.LIVRE[k].length >= 1 && D.LIVRE[k].length <= 3 && D.LIVRE[k].every(function(t){ return t.length <= 290; }); }), 'chaque monstre a sa page : un à trois paragraphes courts');
  ok(Object.keys(D.MONSTRES).every(function(k){ var cle = D.MONSTRES[k].livre || k; return D.LIVRE[cle] && D.LIVRE[cle].length >= 1; }), 'chaque monstre a sa page');
  ok(D.HEROS.sage.gestes.indexOf('etudier') < 0 && !D.GESTES.etudier, 'plus de geste « Étudier » : tout le carnet est ouvert dès que le Sage l\'a');

  /* les coups préparés (Romain, 11 novembre) : les élites et le boss seulement ; un tour sans rien faire, visible de tous, puis un coup très fort */
  var gros = Object.keys(D.MONSTRES).filter(function(k){ var A = D.MONSTRES[k].attaques; return Object.keys(A).some(function(n){ return A[n].prepare; }); });
  egal(gros.sort(), ['bourbe', 'gardien', 'roirats'], 'les coups préparés : les deux élites et le boss, personne d\'autre');
  var t = prep('atelier', {sac:['acide', 'feu', 'baume'], hasard:[0.99]}), c = t.c, g = bete(c, 'gardien'), ev, k;
  function tourBlanc(){ D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].pv = D.HEROS[h].pv; c.h[h].joue = true; }); return c.tourMonstres(); }
  ok(!c.etat().betes[1].prepare, 'le Gardien commence par un coup de poing : rien ne se prépare');
  ev = tourBlanc();
  ok(c.a(g, 'prepare') && c.etat().betes[1].prepare === 1 && c.etat().betes[1].vise === null && trouve(ev, 'etat', function(e){ return e.nom === 'prepare' && e.on; }), 'après son premier coup de poing, il prépare son coup : tout le monde le voit (mais pas sur qui)');
  ev = c.jouer('sage', {geste:'oeil'});
  var v = c.etat().betes[1];
  ok(v.vise.prepare && v.vise.degats === 0 && v.vise.attaque === 'marteau' && v.suite.attaque === 'marteau' && !v.suite.prepare && v.suite.degats === 85 && v.suite.cibles.join() === v.vise.cibles.join(),
    'la rune de l\'œil : ce tour il prépare, au tour suivant le marteau tombe (85) sur ' + v.suite.cibles[0]);
  var proie = v.suite.cibles[0];
  ev = tourBlanc();
  ok(trouve(ev, 'prepare', function(e){ return e.bete === g.id; }) && !trouve(ev, 'degats', function(e){ return e.bete === g.id; }), 'pendant qu\'il prépare, le Gardien ne frappe pas');
  egal(c.etat().betes[1].prepare, 2, 'au tour suivant, tout le monde voit que le coup va tomber (prepare : 2)');
  var ea0 = null;
  D.ORDRE.forEach(function(h){ c.h[h].joue = false; });
  c.jouer('sage', {geste:'bouclier', cible:proie});
  ev = tourBlanc();
  var dm = trouve(ev, 'degats', function(e){ return e.bete === g.id; });
  ea0 = trouve(ev, 'attaque', function(e){ return e.bete === g.id; });
  ok(ea0 && ea0.nom === 'marteau' && ea0.anim === 'poing' && ea0.gros === true, 'l\'attaque dit quelle animation du module elle emprunte (marteau : celle du poing) et que c\'est un gros coup');
  ok(dm && dm.heros === proie && dm.attaque === 'marteau' && dm.brut === 85 && dm.n === Math.ceil(85 * 0.25) && dm.bouclier && !c.a(g, 'prepare'), 'le marteau tombe sur celui que le Sage avait vu ; le bouclier en arrête 75 % (85 → ' + (dm ? dm.n : '?') + ')');
  ok(85 >= D.HEROS.sage.pv - 10 && 85 < D.HEROS.pisteur.pv, 'sans bouclier, ce coup met presque un héros à terre (85 pour 90 à 120 points de vie)');
  ev = tourBlanc();
  ok(trouve(ev, 'attaque', function(e){ return e.bete === g.id; }).nom === 'poing', 'ensuite il reprend ses poings');

  /* l'huile libère un ami pris dans une toile (Romain : « il y a toujours un contre ») */
  t = prep('toiles', {sac:['huile', 'feu', 'baume'], hasard:[0.3]}); c = t.c;
  tourSuivant(c);
  var pris = D.ORDRE.filter(function(h){ return c.h[h].entoile; })[0];
  ok(!!pris && c.refus(pris, pris === 'sage' ? 'rune' : pris === 'pisteur' ? 'fleche' : 'louche', c.vivants()[0].id) === 'Entoilé !', 'l\'araignée entoile un héros (' + pris + ') : il ne peut plus jouer');
  if(pris && pris !== 'alchimiste'){
    var gh = c.gestes('alchimiste').filter(function(x){ return x.geste === 'p:huile'; })[0];
    ok(gh.amis && gh.amis.join() === pris && gh.cibles.indexOf(pris) >= 0, 'l\'huile peut se lancer sur lui');
    ev = c.jouer('alchimiste', {geste:'p:huile', cible:pris});
    ok(!c.h[pris].entoile && trouve(ev, 'etat', function(e){ return e.heros === pris && e.nom === 'entoile' && e.on === false && e.par === 'huile'; }) && c.aJouer().indexOf(pris) >= 0, 'l\'huile le libère tout de suite : il peut jouer ce tour');
  }
})();

section('La rune d\'appel, les herbes pour toute l\'équipe (Romain, 11 novembre, 16 h 07)');
(function(){
  var ev, t, c;
  /* l'atelier : le Gardien est derrière le rat cuirassé, hors de portée de la dague */
  t = prep('atelier', {}); c = t.c;
  var g = bete(c, 'gardien'), rc = bete(c, 'ratcuir');
  var ca = c.gestes('sage').filter(function(x){ return x.geste === 'appel'; })[0];
  ok(ca.permis && ca.vise === 'bete' && ca.cibles.join() === g.id, 'la rune d\'appel : on peut appeler le Gardien (le rat cuirassé est déjà devant)');
  egal([c.refus('sage', 'appel', rc.id), c.refus('pisteur', 'dague', g.id)], ['Déjà devant !', 'Trop loin !'], 'appeler celui de devant : « Déjà devant ! » ; la dague sur le Gardien : « Trop loin ! »');
  ev = jouer(c, 'sage', 'appel', g);
  var ap = trouve(ev, 'appel');
  ok(ap && ap.bete === g.id && ap.ordre.join() === [g.id, rc.id].join() && c.devant() === g && c.etat().betes.filter(function(b){ return b.id === g.id; })[0].position === 0,
    'le Sage appelle le Gardien : il passe devant le rat cuirassé');
  egal([c.refus('pisteur', 'dague', g.id), c.refus('pisteur', 'dague', rc.id)], [null, 'Trop loin !'], 'la dague atteint maintenant le Gardien, et plus le rat cuirassé');
  egal(c.h.sage.joue, true, 'la rune d\'appel prend le tour du Sage');
  /* la salle des rats : le troisième passe devant, c'est lui que la louche et la dague touchent */
  t = prep('rats', {}); c = t.c;
  ev = jouer(c, 'sage', 'appel', c.b[2]);
  egal(trouve(ev, 'appel').ordre, ['b3', 'b1', 'b2'], 'chez les rats : le troisième appelé, l\'ordre devient b3, b1, b2');
  ev = jouer(c, 'alchimiste', 'louche');
  egal(trouve(ev, 'louche').bete, 'b3', 'la louche tape maintenant celui qui a été appelé');
  /* ce qui vole, pend à un fil ou nage ne s'appelle pas */
  t = prep('canaux', {}); c = t.c;
  ca = c.gestes('sage').filter(function(x){ return x.geste === 'appel'; })[0];
  ok(!ca.permis && ca.mot === 'Déjà devant !' && c.refus('sage', 'appel', bete(c, 'chauvesouris', 0).id) === 'Déjà devant !', 'aux canaux : le rat est déjà devant, les chauves-souris ne s\'appellent pas (la carte dit « Déjà devant ! »)');
  t = prep('crypte', {}); c = t.c;
  ca = c.gestes('sage').filter(function(x){ return x.geste === 'appel'; })[0];
  ok(!ca.permis && ca.mot === 'Pas celui-là !', 'dans la crypte, rien que des chauves-souris : « Pas celui-là ! »');
  t = prep('ossuaire', {}); c = t.c;
  egal(c.appelables().length, 0, 'à l\'ossuaire : le Roi des rats est devant, les feux follets volent — personne à appeler');

  /* les herbes : un petit soin pour chacun ; le baume : un gros soin pour un seul */
  t = prep('rats', {sac:['baume', 'feu', 'huile'], pv:{pisteur:50, alchimiste:95, sage:40}}); c = t.c;
  var ch = c.gestes('alchimiste').filter(function(x){ return x.geste === 'herbes'; })[0];
  ok(ch.vise === 'equipe' && ch.max === 0 && ch.permis, 'les herbes ne se visent plus : elles sont pour toute l\'équipe');
  ev = jouer(c, 'alchimiste', 'herbes');
  ok(trouve(ev, 'herbes').equipe && tous(ev, 'soin').length === 3 && c.h.pisteur.pv === 50 + D.CHIFFRES.herbes && c.h.alchimiste.pv === 100 && c.h.sage.pv === 40 + D.CHIFFRES.herbes, 'les herbes : +' + D.CHIFFRES.herbes + ' pour chaque héros debout (sans dépasser le maximum)');
  ok(D.CHIFFRES.herbes === 15 && D.CHIFFRES.herbes * 2 < D.RECETTES.baume.soin && D.RECETTES.baume.vise === 'heros', '(13 novembre) 15 pour chacun, 45 en tout ; le baume reste le gros soin sur un seul ami (' + D.RECETTES.baume.soin + ' contre ' + D.CHIFFRES.herbes + ')');
  t = prep('rats', {pv:{pisteur:50, sage:40}}); c = t.c; c.h.sage.sol = true; c.h.sage.pv = 0;
  ev = jouer(c, 'alchimiste', 'herbes');
  ok(tous(ev, 'soin').every(function(e){ return e.heros !== 'sage'; }) && c.h.sage.pv === 0 && c.h.pisteur.pv === 50 + D.CHIFFRES.herbes, 'un héros au sol n\'est pas soigné par les herbes');
})();

section('La dague ne touche pas ce qui vole (Romain, 11 novembre, 19 h 21)');
(function(){
  var ev, t, c, cd;
  function carteDague(){ return c.gestes('pisteur').filter(function(x){ return x.geste === 'dague'; })[0]; }
  function idsDe(l){ return l.map(function(m){ return m.id; }); }
  /* la salle des rats : tout marche par terre, rien ne change */
  t = prep('rats', {}); c = t.c;
  ok(c.b.every(function(m){ return c.auSol(m); }) && c.devantSol() === c.devant() && carteDague().permis && !c.refus('pisteur', 'dague', c.b[0].id), 'les rats marchent par terre : la dague frappe celui de devant, comme avant');
  /* la fausse crypte : deux chauves-souris en l'air */
  t = prep('crypte', {sac:['colle', 'feu', 'baume']}); c = t.c;
  var a = c.b[0], b = c.b[1];
  cd = carteDague();
  ok(!cd.permis && cd.mot === 'Trop haut !' && !c.aPortee().length && c.devantSol() === null, 'deux chauves-souris en l\'air : la carte de la dague est éteinte et dit « Trop haut ! »');
  egal([c.refus('pisteur', 'dague', a.id), c.refus('pisteur', 'dague', b.id)], ['Trop haut !', 'Trop haut !'], 'la dague sur une chauve-souris qui vole, même celle de devant : « Trop haut ! »');
  var pv = a.pv; ev = jouer(c, 'pisteur', 'dague', a);
  ok(trouve(ev, 'refus') && trouve(ev, 'refus').mot === 'Trop haut !' && a.pv === pv && !c.h.pisteur.joue, 'le coup refusé ne coûte rien : pas de dégâts, le Pisteur n\'a pas joué');
  egal(c.refus('sage', 'appel', b.id), 'Pas celui-là !', 'la rune d\'appel ne tire pas non plus une bête qui vole : « Pas celui-là ! »');
  /* celle du fond tombe (la colle) : c'est elle que la dague atteint, pas celle de devant, qui vole toujours */
  ev = jouer(c, 'alchimiste', 'p:colle', b);
  ok(c.a(b, 'au-sol') && !c.a(a, 'au-sol') && c.devant() === a && c.devantSol() === b, 'la colle fait tomber celle du fond : c\'est elle, la première bête « au sol »');
  egal(idsDe(c.aPortee()), [b.id], 'à portée de dague : seulement celle qui est tombée');
  egal([c.refus('pisteur', 'dague', a.id), c.refus('pisteur', 'dague', b.id)], ['Trop haut !', null], 'celle qui vole : « Trop haut ! » ; celle qui est tombée : on peut');
  ev = jouer(c, 'pisteur', 'dague', b);
  ok(trouve(ev, 'degats') && trouve(ev, 'degats').critique && b.mort, 'la dague sur la chauve-souris tombée : critique, elle est battue');
  /* les canaux : un rat devant, deux chauves-souris en l'air derrière */
  t = prep('canaux', {}); c = t.c;
  var r = bete(c, 'rat'), s1 = bete(c, 'chauvesouris', 0), s2 = bete(c, 'chauvesouris', 1);
  egal(idsDe(c.aPortee()), [r.id], 'aux canaux : la dague n\'atteint que le rat');
  egal([c.refus('pisteur', 'dague', r.id), c.refus('pisteur', 'dague', s1.id)], [null, 'Trop haut !'], 'le rat : on peut ; une chauve-souris : « Trop haut ! »');
  var ca = c.gestes('sage').filter(function(x){ return x.geste === 'appel'; })[0];
  ok(!ca.permis && ca.mot === 'Déjà devant !' && !c.appelables().length, 'la rune d\'appel n\'a personne à tirer : le seul qui marche par terre est déjà devant');
  egal([c.refus('sage', 'appel', r.id), c.refus('sage', 'appel', s1.id)], ['Déjà devant !', 'Déjà devant !'], 'la carte est éteinte : qui qu\'on vise, elle répond « Déjà devant ! »');
  /* la louche les fait tomber : (13 novembre) la dague ne touche quand même que le premier, le rat ; les chauves-souris, derrière lui, sont trop loin */
  ev = jouer(c, 'alchimiste', 'louche');
  ok(c.a(s1, 'au-sol') && c.a(s2, 'au-sol') && idsDe(c.aPortee()).join() === [r.id].join() && !!c.refus('pisteur', 'dague', s1.id), 'après la louche, les deux chauves-souris sont par terre, mais derrière le rat : la dague ne touche que le premier');
  /* la cave aux toiles : l'araignée pend à son fil, les feux follets flottent */
  t = prep('toiles', {}); c = t.c;
  var ar = bete(c, 'araignee'), f1 = bete(c, 'feufollet', 0);
  cd = carteDague();
  ok(!cd.permis && cd.mot === 'Trop haut !' && !c.aPortee().length, 'la cave aux toiles, au départ : rien n\'est à portée de dague (« Trop haut ! »)');
  egal([c.refus('pisteur', 'dague', ar.id), c.refus('pisteur', 'dague', f1.id)], ['Trop haut !', 'Trop haut !'], 'l\'araignée pend, le feu follet flotte : « Trop haut ! »');
  ok(D.MONSTRES.araignee.dague.si.join() === 'dos' && D.MONSTRES.feufollet.dague.si.join() === 'accroche' && D.MONSTRES.chauvesouris.dague.si.join() === 'au-sol' && !D.MONSTRES.rat.dague && !D.MONSTRES.gardien.dague && !D.MONSTRES.roirats.dague,
    'ce qui vole, pend ou flotte a sa règle (l\'araignée : sur le dos ; le feu follet : accroché ; la chauve-souris : au sol) ; ce qui marche n\'en a pas');
})();

section('La colère des élites et du boss (Romain, 11 novembre, 13 h 53)');
(function(){
  var ev, t, c;
  egal(Object.keys(D.MONSTRES).filter(function(k){ return D.MONSTRES[k].colere; }).sort().map(function(k){ return k + ':' + D.MONSTRES[k].colere.si; }), ['bourbe:mi-vie', 'gardien:mi-vie', 'roirats:seul'],
    'ils se fâchent : le Gardien et Bourbe à mi-vie, le Roi des rats quand il n\'a plus ses sbires ; personne d\'autre');

  /* le Gardien : à mi-vie, ses poings frappent double, son marteau cogne plus fort */
  t = prep('atelier', {sac:['acide', 'feu', 'baume'], hasard:[0.99]}); c = t.c;
  var g = bete(c, 'gardien'), rc = bete(c, 'ratcuir');
  egal(c.refus('pisteur', 'dague', g.id), 'Trop loin !', 'la dague ne touche que celui de devant : le Gardien, derrière le rat cuirassé, est « Trop loin ! »');
  jouer(c, 'alchimiste', 'p:acide', rc);
  ev = jouer(c, 'pisteur', 'dague', rc);
  ok(rc.mort && c.refus('sage', 'rune', g.id) === null && c.devant() === g, 'le rat cuirassé battu (l\'acide, puis la dague : 80), le Gardien est devant');
  ev = tourSuivant(c);
  egal(trouve(ev, 'degats', function(e){ return e.bete === g.id; }).brut, 40, 'avant la colère : un coup de poing de 40');
  D.ORDRE.forEach(function(h){ c.h[h].pv = D.HEROS[h].pv; });
  jouer(c, 'alchimiste', 'p:acide', g); jouer(c, 'sage', 'rune', g);
  ev = jouer(c, 'pisteur', 'dague', g);
  ok(trouve(ev, 'degats').n === 140 && g.pv === 140 && c.a(g, 'colere') && trouve(ev, 'colere', function(e){ return e.bete === g.id; }) && trouve(ev, 'etat', function(e){ return e.nom === 'colere' && e.on && e.tours === 'fin'; }),
    'la dague sur le Gardien ouvert : 140 ; à mi-vie (140 sur 280), il se fâche, jusqu\'à la fin');
  ok(c.etat().betes.filter(function(b){ return b.id === g.id; })[0].etats.colere !== undefined, 'la colère se lit dans la photo du combat (etats.colere)');
  c.jouer('sage', {geste:'oeil'});      /* (refusé : il a joué — on regarde les plans autrement) */
  var pl = c._prevu(g, c._planDuTour(g, null));
  ok(pl.prepare && c.a(g, 'prepare'), 'il était en train de prendre son élan : la colère ne change pas ça');
  D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].pv = D.HEROS[h].pv; c.h[h].joue = true; });
  c.tourMonstres();
  D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].pv = D.HEROS[h].pv; c.h[h].joue = true; });
  ev = c.tourMonstres();
  var dm = trouve(ev, 'degats', function(e){ return e.bete === g.id; });
  ok(dm && dm.attaque === 'marteau' && dm.brut === 100, 'en colère, son marteau cogne à 100 (85 + 15)');
  D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].pv = D.HEROS[h].pv; c.h[h].joue = true; });
  ev = c.tourMonstres();
  dm = trouve(ev, 'degats', function(e){ return e.bete === g.id; });
  ok(dm && dm.attaque === 'poing' && dm.brut === 80, 'en colère, ses poings frappent double (80)');

  /* le Roi des rats : quand il n'a plus ses sbires */
  t = prep('ossuaire', {sac:['fumigene', 'colle', 'feu']}); c = t.c;
  var roi = bete(c, 'roirats'), ff = c.b.filter(function(m){ return m.type === 'feufollet'; });
  ev = []; c._blesse(ev, roi, 150, {});
  ok(!c.a(roi, 'colere') && roi.pv === 70, 'le Roi des rats ne se fâche pas à mi-vie : il a encore ses deux feux follets');
  ev = []; c._tue(ev, ff[0], 'meurt');
  ok(!c.a(roi, 'colere'), 'un feu follet de moins : pas encore');
  ev = []; c._tue(ev, ff[1], 'meurt');
  ok(c.a(roi, 'colere') && trouve(ev, 'colere', function(e){ return e.bete === roi.id; }), 'le dernier sbire tombé : le Roi des rats se fâche');
  D.ORDRE.forEach(function(h){ c.h[h].joue = true; });
  ev = c.tourMonstres();
  var gr = tous(ev, 'degats', function(e){ return e.bete === roi.id; });
  ok(gr.length === 3 && gr.every(function(e){ return e.brut === 2 * D.MONSTRES.roirats.attaques.grouillement.degats; }), 'en colère, son grouillement frappe double sur les trois héros (' + 2 * D.MONSTRES.roirats.attaques.grouillement.degats + ')');
  egal(c._prevu(roi, {nom:'ruee', cibles:['pisteur']}).degats, 90, 'en colère, sa ruée cogne à 90 (70 + 20)');

  /* Bourbe : sa phase 2 — à mi-vie il plonge, remonte avec deux têtards en retombant sur tout le monde */
  t = prep('bassin', {sac:['feu', 'fumigene', 'givre'], recettes:D.ORDRE_RECETTES}); c = t.c;
  var bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo); jouer(c, 'pisteur', 'p:feu', bo);
  jouer(c, 'sage', 'appel', bo);   /* (13 novembre) la dague ne touche que le premier : sorti de l'eau, le Sage l'appelle devant ses têtards */
  tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; c.h[h].sol = false; });
  jouer(c, 'alchimiste', 'p:fumigene');
  ok(c.a(bo, 'dos') && c.a(bo, 'gele') && bo.ouvert !== 0, '(Bourbe est sur le dos, sur la glace, ouvert)');
  bo.pv = 520;
  ok(c.aPortee()[0] === bo, '(appelé devant au tour d\'avant, il est à portée de dague)');
  ev = jouer(c, 'pisteur', 'dague', bo);
  ok(bo.pv === 140 && c.a(bo, 'colere') && trouve(ev, 'colere') && trouve(ev, 'special', function(e){ return e.nom === 'plonger'; }) && c.a(bo, 'sous') && !c.a(bo, 'dos') && !c.a(bo, 'gele') && bo.ouvert === 0 && c.cache(bo),
    'à mi-vie, Bourbe se fâche : il se retourne d\'un bond, brise la glace et plonge (son point faible se referme, on ne peut plus le viser)');
  egal(c.refus('sage', 'rune', bo.id), 'Sous l\'eau !', 'sous l\'eau : rien à faire ce tour-ci');
  var tetAvant = c.vivants().filter(function(m){ return m.type === 'tetard'; }).length;
  ev = tourSuivant(c);
  var ret = trouve(ev, 'attaque', function(e){ return e.bete === bo.id && e.retour; });
  ok(trouve(ev, 'special', function(e){ return e.nom === 'remonter'; }) && c.vivants().filter(function(m){ return m.type === 'tetard'; }).length === Math.min(D.BOURBE.tetardsMax, tetAvant + D.BOURBE.tetards) && ret && ret.nom === 'saut' && !c.a(bo, 'sous') && c.a(bo, 'colere'),
    'il remonte à la fin du tour avec deux têtards de plus et retombe sur tout le monde ; il reste en colère');
  egal(c._prevu(bo, {nom:'ecrasement', cibles:['pisteur']}).degats, 100, 'en colère, son écrasement cogne à 100 (80 + 20)');
  ev = []; c._blesse(ev, bo, 10, {});
  ok(!trouve(ev, 'colere') && !c.a(bo, 'sous'), 'il ne se fâche qu\'une fois : pas de deuxième plongeon');
  /* le bassin gelé : il ne peut pas plonger */
  t = prep('bassin', {sac:['givre', 'feu', 'fumigene'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo);
  ok(c.a(bo, 'gele'), '(le bassin est gelé)');
  bo.pv = 510; ev = []; c._blesse(ev, bo, 20, {});
  ok(c.a(bo, 'colere') && c.a(bo, 'sous') && !c.a(bo, 'gele') && trouve(ev, 'special', function(e){ return e.nom === 'plonger'; }) && trouve(ev, 'mot', function(e){ return e.texte === 'Il brise la glace !'; }), 'bassin gelé : en se fâchant, il brise la glace et plonge quand même (« Il brise la glace ! »)');
  /* la louche, elle, ne casse pas la glace */
  t = prep('bassin', {sac:['givre', 'feu', 'fumigene'], recettes:D.ORDRE_RECETTES}); c = t.c; bo = bete(c, 'bourbe');
  jouer(c, 'alchimiste', 'p:givre', bo); tourSuivant(c); D.ORDRE.forEach(function(h){ c.h[h].avale = null; c.h[h].pv = 90; c.h[h].sol = false; });
  ev = jouer(c, 'alchimiste', 'louche');
  ok(c.a(bo, 'gele') && !c.a(bo, 'sous') && trouve(ev, 'mot', function(e){ return e.texte === 'Il se cogne !'; }), 'le bruit, sur la glace : il ne peut pas plonger, il se cogne');
})();

section('Les sauvegardes, la fuite, les codes');
(function(){
  var p = R.nouvellePartie(11), ev;
  ok(p.sauvegarde && p.sauvegarde.lieu === 'puits' && !('livre' in p.sauvegarde), 'la sauvegarde de départ est créée au fond du puits (sans le Grand Livre)');
  egal(Object.keys(p).sort(), ['codes', 'faits', 'fuites', 'graine', 'heros', 'lieu', 'livre', 'or', 'recettes', 'repos', 'sauvegarde', 'v', 'vus'].sort(), 'l\'état de la partie : les champs du cahier des charges (plus « fuites », sans « sac »)');
  ev = R.entrer(p, 'rats');
  ok(trouve(ev, 'combat').salle === 'rats', 'entrer dans la salle des rats : un combat à lancer');
  var c = R.combat(p, 'rats', {alea:ecrit()});
  egal(R.code(p, 'sauve:1')[0].mot, 'Pas en combat !', 'pas de sauvegarde en combat');
  c.h.sage.joue = true;
  c.b.forEach(function(m){ m.pv = 1; });
  c.jouer('pisteur', {geste:'fleche', cible:'b1'}); c.jouer('alchimiste', {geste:'louche'});
  c.tourMonstres();
  c.jouer('pisteur', {geste:'fleche', cible:'b3'});
  ok(c.fini() === 'victoire' && p.faits['combat:rats'], 'la salle des rats est gagnée');
  var pvApres = p.heros.pisteur.pv;
  egal(R.code(p, 'sauve:9')[0].mot, 'Code inconnu', 'un code inconnu est refusé');
  ev = R.code(p, 'sauve:1');
  ok(trouve(ev, 'sauvegarde') && p.sauvegarde.lieu === 'rats' && p.sauvegarde.faits['combat:rats'] === 1 && p.sauvegarde.heros.pisteur.pv === pvApres && p.sauvegarde.codes['sauve:1'] === 1, 'le code sauve:1 enregistre tout : le lieu, les PV, les salles faites, les codes utilisés');
  egal(R.code(p, 'sauve:1')[0].mot, 'Code usé', 'chaque code ne marche qu\'une fois');
  ok(Object.keys(D.CODES).every(function(id){ return CODES.CODES[id] && CODES.CODES[id].a === 'pisteur'; }), 'tous les codes acceptés sont dans donjon-codes.js, à taper sur la tablette du Pisteur');
  egal(CODES.lire(CODES.code('sauve:2'), 'pisteur'), 'sauve:2', 'donjon-codes.js : les trois symboles tapés donnent l\'id du code');
  ev = R.code(p, 'recette:givre');
  ok(trouve(ev, 'recette').id === 'givre' && p.recettes.indexOf('givre') >= 0, 'le code recette:givre apprend la recette Givre');
  R.entrer(p, 'reserve'); R.prendre(p, 'fleches-lourdes');
  R.entrer(p, 'canaux');
  c = R.combat(p, 'canaux', {alea:ecrit()});
  c.h.sage.joue = true;
  c.jouer('alchimiste', {geste:'p:feu', cible:c.b[0].id});
  c.jouer('pisteur', {geste:'fleche', cible:c.b[0].id});
  c.tourMonstres();
  var texte = R.exporter(p), p2 = R.importer(texte);
  ok(p2 && p2.lieu === 'canaux' && !p2.faits['combat:canaux'] && p2.heros.pisteur.pv === pvApres, 'recharger la page en plein combat : on revient à l\'entrée de la salle, avec l\'état d\'avant le combat (le Grand Livre garde la ligne)');
  ok(!R.enCombat(p2) && trouve(R.entrer(p2, 'canaux'), 'combat'), 'et le combat est à relancer');
  ok(R.importer('{pas du json') === null && R.importer('{"v":2}') === null, 'un texte abîmé ou d\'une autre version n\'est pas chargé');
  /* la fuite */
  ev = c.fuir();
  ok(trouve(ev, 'recharge').lieu === 'rats' && p.lieu === 'rats', 'fuir : on repart de la dernière sauvegarde (la salle des rats)');
  /* Romain, 10 novembre : « il n'y a que les monstres qui reviennent en vie, comme à la sauvegarde » */
  ok(p.heros.pisteur.pv === pvApres && !p.faits['combat:canaux'] && p.faits['combat:rats'] === 1, 'les points de vie sont ceux de la sauvegarde ; les rats battus AVANT la sauvegarde restent battus');
  ok(p.heros.pisteur.objets.join() === 'fleches-normales,fleches-lourdes' && p.faits['objet:fleches-lourdes'] === 1 && R.contenu(p, 'reserve').objets.join() === 'fleches-argent', 'les objets trouvés depuis sont gardés (les flèches transperçantes restent au Pisteur, la réserve ne les a plus)');
  ok(p.recettes.indexOf('givre') >= 0 && p.codes['recette:givre'] === 1 && p.codes['sauve:1'] === 1 && p.vus.reserve === 1 && p.vus.canaux === 1, 'la recette tapée depuis, les codes et la brume levée sont gardés aussi');
  ok(!R.enCombat(p) && c.fini() === 'defaite', 'après une fuite, le combat est fini (défaite)');
  egal(p.fuites.canaux, 1, 'la fuite est comptée pour cette salle');
  /* deux fuites au même endroit : plus rien n'est offert (il n'y a plus de code d'étude : le carnet est ouvert) */
  R.entrer(p, 'canaux'); c = R.combat(p, 'canaux', {alea:ecrit()});
  ev = R.fuir(p);
  ok(!trouve(ev, 'livre') && p.fuites.canaux === 2, 'une deuxième fuite dans la même salle : elle est comptée, rien de plus');
  /* la défaite */
  R.entrer(p, 'canaux'); c = R.combat(p, 'canaux', {alea:ecrit()});
  D.ORDRE.forEach(function(h){ c.h[h].pv = 1; });
  D.ORDRE.forEach(function(h){ c.h[h].joue = true; });
  c.tourMonstres();
  ok(c.fini() === 'defaite', 'tomber tous les trois : défaite');
  ev = R.fuir(p);
  ok(p.lieu === 'rats' && p.heros.pisteur.pv === pvApres && p.fuites.canaux === 3, 'la défaite recharge aussi la dernière sauvegarde');
  var g1 = p.graine; R.entrer(p, 'canaux'); R.combat(p, 'canaux'); R.fuir(p);
  ok(p.graine !== g1, 'le hasard ne se répète pas d\'un essai à l\'autre');
  /* un combat gagné APRÈS la sauvegarde, puis une défaite plus loin : ses monstres reviennent, le reste est gardé */
  (function(){
    var q = R.nouvellePartie(5), k;
    q.recettes = ['feu', 'huile', 'baume'];
    R.entrer(q, 'rats'); k = R.combat(q, 'rats', {alea:ecrit()}); k.b.forEach(function(m){ m.pv = 0; m.mort = true; }); k._bilan([]);
    ok(q.faits['combat:rats'] === 1, '(les rats sont battus, sans sauvegarde depuis le fond du puits)');
    R.entrer(q, 'reserve'); R.prendre(q, 'fleches-argent');
    R.entrer(q, 'galerie'); R.prendre(q, 'bourse');
    q.faits['piege:dalles'] = 1; q.faits.secret = 1; q.heros.pisteur.pv = 33;
    R.entrer(q, 'canaux'); k = R.combat(q, 'canaux', {alea:ecrit()});
    var e2 = R.fuir(q), r = trouve(e2, 'recharge');
    ok(r.lieu === 'puits' && q.lieu === 'puits' && r.revenus.join() === 'rats' && !q.faits['combat:rats'] && R.bloque(q, 'rats') === 'combat', 'défaite sans sauvegarde : retour au fond du puits, les rats sont revenus (il faut les rebattre pour passer)');
    ok(q.heros.pisteur.pv === 120 && q.or === D.CHIFFRES.bourse && q.heros.pisteur.objets.indexOf('fleches-argent') >= 0, 'les points de vie sont ceux du départ ; l\'or et les flèches de lune sont gardés');
    ok(q.faits['piege:dalles'] === 1 && q.faits.secret === 1 && q.vus.reserve === 1 && q.vus.galerie === 1, 'les pièges passés, les passages ouverts et la brume levée sont gardés');
    /* l'amulette qui a servi dans un combat annulé est rendue */
    var z = R.nouvellePartie(6); z.recettes = ['feu', 'huile', 'baume'];
    z.heros.sage.objets.push('amulette'); z.faits['objet:amulette'] = 1; R.sauvegarder(z);
    R.entrer(z, 'rats'); k = R.combat(z, 'rats', {alea:ecrit()});
    k.h.sage.objets.splice(k.h.sage.objets.indexOf('amulette'), 1); k.amulette = 'sage';
    k.b.forEach(function(m){ m.pv = 0; m.mort = true; }); k._bilan([]);
    ok(z.faits['amulette:utilisee'] === 'rats|sage' && z.heros.sage.objets.indexOf('amulette') < 0, '(l\'amulette a servi au Sage pendant les rats)');
    R.entrer(z, 'canaux'); R.combat(z, 'canaux', {alea:ecrit()}); R.fuir(z);
    ok(!z.faits['amulette:utilisee'] && z.heros.sage.objets.indexOf('amulette') >= 0, 'les rats sont revenus : l\'amulette qui avait servi contre eux est rendue au Sage');
  })();
  /* le hasard à graine */
  function partieEntiere(graine){
    var q = R.nouvellePartie(graine); q.recettes = ['feu', 'huile', 'baume'];
    var k = R.combat(q, 'rats'), ch = R.alea(99), trace = [];
    while(!k.fini()){
      var hs = k.aJouer();
      if(!hs.length){ trace.push(JSON.stringify(k.tourMonstres())); continue; }
      var gs = k.gestes(hs[0]).filter(function(x){ return x.permis; }), g = gs[Math.floor(ch() * gs.length)];
      trace.push(JSON.stringify(k.jouer(hs[0], {geste:g.geste, cible:g.cibles[Math.floor(ch() * g.cibles.length)]})));
    }
    return trace.join('|');
  }
  ok(partieEntiere(42) === partieEntiere(42) && partieEntiere(42) !== partieEntiere(43), 'la même graine rejoue le même combat, une autre graine en joue un autre');
})();

section('Les salles sans combat');
(function(){
  var p = R.nouvellePartie(21), ev;
  ev = R.entrer(p, 'galerie');
  egal(trouve(ev, 'scene').contenu.objets, ['bourse', 'rune'], 'la galerie effondrée : une bourse, et la pierre de rune du Sage');
  ev = R.prendre(p, 'bourse');
  ok(trouve(ev, 'or').n === D.CHIFFRES.bourse && p.or === D.CHIFFRES.bourse && p.heros.pisteur.objets.length === 1, 'la bourse donne de l\'or et ne prend pas de place');
  egal(R.prendre(p, 'bourse')[0].mot, 'Déjà pris', 'on ne la prend pas deux fois');
  R.entrer(p, 'aeration');
  ev = R.prendre(p, 'herbes');
  ok(trouve(ev, 'code-objet').code === 'plante:lumiere' && trouve(ev, 'code-objet').pour === 'alchimiste' && p.heros.alchimiste.objets.length === 0, 'les herbes lumineuses : un code à donner à l\'Alchimiste (elles ne prennent pas de place)');
  ok(R.objets(p).codes.some(function(x){ return x.code === 'plante:lumiere'; }), 'le code reste consultable dans « Objets »');
  egal(R.prendre(p, 'amulette', 'sage')[0].mot, 'Pas ici !', 'un objet qui n\'est pas dans ce lieu : « Pas ici ! »');
  R.entrer(p, 'reserve');
  /* la réserve (Romain, 10 novembre, 17 h 56) : « qu'on puisse prendre toutes les flèches » — un carquois ne prend pas de place */
  egal(R.nouvellePartie(5).heros.pisteur.objets, ['fleches-normales'], 'le Pisteur part avec ses flèches normales');
  egal(R.contenu(p).objets, ['fleches-argent', 'fleches-lourdes'], 'la réserve : deux carquois à prendre');
  ev = R.prendre(p, 'fleches-argent');
  ok(trouve(ev, 'objet').heros === 'pisteur' && trouve(ev, 'objet').equipe === 'carquois-argent', 'on en prend un : il va au Pisteur');
  ev = R.prendre(p, 'fleches-lourdes');
  ok(trouve(ev, 'objet') && p.heros.pisteur.objets.join() === 'fleches-normales,fleches-argent,fleches-lourdes' && R.enMains(p.heros.pisteur.objets).length === 0, 'et l\'autre aussi : les carquois ne prennent pas de place, ses deux mains restent libres');
  egal(R.contenu(p).objets, [], 'la réserve est vide');
  var cq = R.combat(R.importer(R.exporter(p)), 'toiles');
  egal(cq._carquoisPortes(), ['fleches-argent', 'fleches-lourdes'], 'en combat, il a ses deux carquois spéciaux (et toujours ses flèches normales)');
  R.entrer(p, 'givre');
  egal(trouve(R.prendre(p, 'fleur-givre'), 'code-objet').code, 'plante:givre', 'la fleur de givre : le code plante:givre');
  /* le tas d'os, le crâne */
  R.entrer(p, 'eboulis');
  ev = R.fouiller(p);
  ok(trouve(ev, 'fouille').trouve === 'morsure' && trouve(ev, 'degats').heros === 'pisteur' && p.heros.pisteur.pv === 120 - 10, 'le tas d\'os, première fouille : un rat mord le Pisteur (−10)');
  ev = R.fouiller(p);
  ok(trouve(ev, 'fouille').trouve === 'page' && trouve(ev, 'code-objet').code === 'page:blanche', 'deuxième fouille : la page blanche (code page:blanche, pour le Sage)');
  ev = R.fouiller(p);
  ok(trouve(ev, 'fouille').trouve === null && p.heros.pisteur.pv === 110, 'ensuite : plus rien, et plus de morsure');
  /* (Romain, 11 novembre, 19 h 21 : le passage secret du crâne vers le feu de camp est enlevé) */
  ev = R.crane(p);
  ok(!p.faits.secret && !trouve(ev, 'passage') && ev[0].t === 'refus' && !D.LIEUX.eboulis.crane, 'plus de passage secret au cul-de-sac : le crâne n\'ouvre plus rien');
  egal(R.fouiller(R.nouvellePartie(1))[0].mot, 'Pas ici !', 'on ne fouille que là où il y a un tas d\'os');
  /* les dalles */
  R.entrer(p, 'dalles');
  var pv0 = D.EXPOSES.map(function(h){ return p.heros[h].pv; });
  /* Romain, 10 novembre : le chemin n'est plus « seulement les dalles claires » ; c'est le code du plan du Sage :
     noir, blanc, blanc, noir, blanc, noir. Au premier pas, la dalle du fond est claire (blanche) : il faut la NOIRE, devant. */
  egal(D.DALLES.code, ['noir', 'blanc', 'blanc', 'noir', 'blanc', 'noir'], 'le code des dalles : noir, blanc, blanc, noir, blanc, noir (« N B B, N B N » sur le plan du Sage)');
  var cotes = [0, 1, 2, 3, 4, 5].map(R.dalleSure);
  egal(cotes, ['devant', 'devant', 'fond', 'fond', 'fond', 'fond'], 'la rangée sûre à chaque pas suit le code (la dalle du fond est claire aux pas pairs)');
  ok(cotes.join() !== D.DALLES.sures.join(), 'ce n\'est plus le chemin des seules dalles claires');
  ev = R.dalle(p, 'devant');
  ok(trouve(ev, 'dalle').sure && trouve(ev, 'dalle').element === 'dalle-6-1' && p.faits.dalles === 1, 'premier pas sur la dalle noire (celle de devant) : on avance');
  ev = R.dalle(p, 'fond');
  ok(!trouve(ev, 'dalle').sure && trouve(ev, 'piege').degats === 15 && tous(ev, 'degats').length === 3 && trouve(ev, 'recule').pas === 0, 'la mauvaise dalle : le piège, −15 à toute l\'équipe, et on recule d\'une rangée');
  egal(D.EXPOSES.map(function(h){ return p.heros[h].pv; }), pv0.map(function(x){ return x - 15; }), 'les trois héros ont perdu 15');
  for(var i = 0; i < cotes.length; i++) ev = R.dalle(p, cotes[i]);
  ok(trouve(ev, 'traverse') && p.faits['piege:dalles'] === 1, 'les six bonnes dalles : le couloir est passé');
  ok(R.dalle(p, 'fond')[0].libre, 'ensuite on le traverse librement');
  var q = R.nouvellePartie(2); q.lieu = 'dalles'; D.EXPOSES.forEach(function(h){ q.heros[h].pv = 10; });
  R.dalle(q, 'fond');
  egal(D.EXPOSES.map(function(h){ return q.heros[h].pv; }), [1, 1, 1], 'hors combat, un piège ne fait jamais tomber : il reste 1 PV');
  /* la roue des canaux : le passage secret vers la cave aux toiles (la salle de la lune) */
  (function(){
    var z = R.nouvellePartie(3);
    egal(R.roue(z, 'd')[0].mot, 'Pas ici !', 'la roue : seulement aux canaux');
    z.lieu = 'canaux';
    egal(R.roue(z, 'd')[0].mot, 'Pas ici !', 'la roue ne tourne pas tant que les monstres des canaux sont là');
    ok(!R.contenu(z, 'canaux').roue, '(et la salle ne la propose pas encore)');
    z.faits['combat:canaux'] = 1;
    egal(R.contenu(z, 'canaux').roue, {ouvert:false, crans:0, sur:6}, 'les canaux gagnés : la roue est là, la grille est fermée');
    var e1 = R.roue(z, 'g');
    ok(e1.length === 1 && e1[0].t === 'roue' && e1[0].cran === 1 && z.faits.roue === 'g', 'un cran : la roue tourne, et rien d\'autre ne se passe (aucun indice cran par cran)');
    var der = null; ['g', 'g', 'g', 'g', 'g'].forEach(function(x){ der = R.roue(z, x); });
    ok(trouve(der, 'roue-retour') && !z.faits.roue && !z.faits['passage:canaux'], 'six crans dans le mauvais ordre : la roue revient toute seule, la grille reste fermée');
    D.ROUE.suite.forEach(function(x){ der = R.roue(z, x); });
    ok(trouve(der, 'passage').vers === 'toiles' && z.faits['passage:canaux'] === 1 && R.contenu(z, 'canaux').roue.ouvert, 'trois à droite, un à gauche, deux à droite : la grille se lève, le passage vers la cave aux toiles est ouvert');
    ok(R.roue(z, 'd')[0].libre, 'ensuite la roue tourne dans le vide');
    egal(D.ROUE.suite.join(''), 'dddgdd', 'l\'ordre de la roue est celui du plan du Sage (3 à droite, 1 à gauche, 2 à droite)');
    /* à l'entrée : le carnet de l'aventurier ; la rune de lumière du Sage est dans la deuxième salle (Romain, 11 novembre :
       le donjon est le même qu'on entre par le puits ou par la crypte, seule la pièce d'entrée change) */
    var y = R.nouvellePartie(8);
    egal(R.contenu(y, 'puits').objets, ['carnet'], 'à l\'entrée : le carnet de l\'aventurier, et pas la pierre de rune');
    R.entrer(y, 'galerie');
    egal(R.contenu(y, 'galerie').objets, ['bourse', 'rune'], 'dans la deuxième salle (la galerie effondrée) : la bourse, et la pierre de rune');
    ok(D.OBJETS.carnet.code === 'carnet:aventurier' && CODES.CODES['carnet:aventurier'].a === 'sage' && CODES.CODES['carnet:aventurier'].de === 'pisteur', 'le carnet donne un code pour le Sage (Romain, 11 novembre : « un livre à l\'entrée du puits »)');
    var er = R.prendre(y, 'rune');
    ok(trouve(er, 'code-objet').code === 'rune:lumiere' && trouve(er, 'code-objet').pour === 'sage' && R.objets(y).codes.some(function(c){ return c.code === 'rune:lumiere'; }), 'la prendre donne un code pour le Sage (il reste dans les objets)');
    ok(CODES.CODES['rune:lumiere'] && CODES.CODES['rune:lumiere'].a === 'sage' && D.OBJETS.rune.discret, 'le code rune:lumiere se tape sur la tablette du Sage ; rien ne signale la pierre dans la salle');
    /* une vieille partie déjà passée par la cave aux toiles : son passage est ouvert */
    var v = R.nouvellePartie(9); v.vus.toiles = 1;
    ok(R.importer(R.exporter(v)).faits['passage:canaux'] === 1, 'une partie d\'avant le passage secret, déjà allée à la cave aux toiles, le trouve ouvert');
  })();
  /* les trois portes */
  R.entrer(p, 'portes');
  egal([R.porte(p, 'oeil')[0].vers, R.porte(p, 'gueule')[0].vers, R.porte(p, 'lune')[0].vers], ['ossuaire', 'crypte', 'toiles'], 'les trois portes : l\'œil vers l\'ossuaire, la gueule vers la fausse crypte, la lune vers la cave aux toiles');
  /* la bibliothèque */
  R.entrer(p, 'bibliotheque');
  ok(R.contenu(p).objets.indexOf('page-blanche') < 0 && R.contenu(p).objets.indexOf('page-dechiree') >= 0, 'la bibliothèque : la page déchirée (la page blanche n\'y est pas posée)');
  /* Romain, 11 novembre (16 h 07) : « pour le Sage, on puisse récupérer deux armes. Ou plus, autant d'armes qu'on veut. » */
  egal(R.contenu(p).objets.filter(function(o){ return D.OBJETS[o].arme; }), ['cristal-lune', 'baton-chene'], 'sur le lutrin : le cristal de lune et le bâton de chêne, à prendre tous les deux');
  ev = R.prendre(p, 'baton-chene');
  ok(trouve(ev, 'objet').heros === 'sage', 'le bâton de chêne va au Sage');
  ev = R.prendre(p, 'cristal-lune');
  ok(trouve(ev, 'objet').heros === 'sage' && p.heros.sage.objets.join() === 'baton-chene,cristal-lune' && R.enMains(p.heros.sage.objets).length === 0, 'le cristal aussi : une arme ne prend pas de place dans les mains');
  /* la fausse crypte et l'amulette : deux places par héros */
  ev = R.entrer(p, 'crypte');
  ok(trouve(ev, 'combat').salle === 'crypte' && R.contenu(p).objets.length === 0, 'la fausse crypte : le combat d\'abord, le sarcophage est fermé');
  p.faits['combat:crypte'] = 1;
  ev = R.entrer(p, 'crypte');
  egal(trouve(ev, 'scene').contenu.objets, ['amulette'], 'le combat gagné, le sarcophage s\'ouvre : l\'amulette');
  egal(R.prendre(p, 'amulette')[0].mot, 'Pour qui ?', 'l\'amulette : il faut dire qui la porte');
  /* (les deux places ne servent plus qu'aux objets qui ne sont pas des armes : on les essaie avec deux objets inventés) */
  D.OBJETS['essai-a'] = {nom:'Objet d\'essai A', pour:'sage'}; D.OBJETS['essai-b'] = {nom:'Objet d\'essai B', pour:'sage'};
  p.heros.sage.objets.push('essai-a', 'essai-b');
  ev = R.prendre(p, 'amulette', 'sage');
  ok(ev[0].t === 'plein' && ev[0].objets.join() === 'essai-a,essai-b', 'deux places par héros (les armes n\'en prennent pas) : le Sage a les mains pleines, il faut dire quoi laisser');
  egal(R.prendre(p, 'amulette', 'sage', 'cristal-lune')[0].t, 'plein', 'laisser une arme ne libère pas de place');
  ev = R.prendre(p, 'amulette', 'sage', 'essai-a');
  ok(trouve(ev, 'laisse').objet === 'essai-a' && p.heros.sage.objets.indexOf('amulette') >= 0 && R.enMains(p.heros.sage.objets).length === 2, 'il laisse un objet et prend l\'amulette');
  ok(R.contenu(p).objets.indexOf('essai-a') >= 0, 'l\'objet laissé reste dans la salle');
  ev = R.prendre(p, 'essai-a', null, 'essai-b');
  ok(p.heros.sage.objets.indexOf('essai-a') >= 0 && R.contenu(p).objets.indexOf('essai-b') >= 0, 'et on peut le reprendre en laissant autre chose');
  p.heros.sage.objets = p.heros.sage.objets.filter(function(o){ return o.indexOf('essai-') < 0; }); delete p.faits['pose:essai-b']; delete p.faits['objet:essai-a'];
  delete D.OBJETS['essai-a']; delete D.OBJETS['essai-b'];
  /* le feu de camp */
  R.entrer(p, 'camp');
  p.heros.pisteur.pv = 20; p.heros.alchimiste.pv = 90; p.heros.sage.pv = 1;
  ev = R.repos(p);
  egal(D.EXPOSES.map(function(h){ return p.heros[h].pv; }), [80, 100, 46], 'le feu de camp rend la moitié des PV max à chacun (sans dépasser le maximum)');
  egal(R.repos(p)[0].mot, 'Déjà reposés', 'une seule fois entre deux combats');
  var c = R.combat(p, 'rats', {alea:ecrit()}); c.b.forEach(function(m){ m.mort = true; }); c._bilan([]);
  ok(p.repos === false && R.repos(p)[0].t === 'repos', 'après un combat gagné, le feu de camp peut resservir');
  /* les égouts, la porte, Léo */
  p.faits['combat:egouts'] = 1;
  ev = R.entrer(p, 'egouts');
  egal(trouve(ev, 'boucle').vers, 'canaux', 'les égouts tournants ramènent aux canaux');
  egal(D.COMBATS.egouts.monstres, ['rat'], 'les égouts : un rat errant');
  ev = R.entrer(p, 'porte4');
  ok(trouve(ev, 'code-objet').code === 'porte:odette' && trouve(ev, 'code-objet').pour === 'sage', 'la porte aux quatre signes : le code porte:odette pour le Sage');
  ev = R.entrer(p, 'leo');
  ok(trouve(ev, 'code-objet').code === 'leo:salle' && trouve(ev, 'code-objet').pour === 'barde' && trouve(ev, 'boss') && !trouve(ev, 'fin-donjon') && !p.faits.fin, 'la dernière salle : un code pour le Barde en entrant (leo:salle), Léo est là — le donjon n\'est pas fini');
  ok(R.contenu(p, 'leo').boss === true && R.contenu(p, 'leo').fin === false, '… tant que Léo n\'est pas battu');
  ev = R.bossBattu(p, 'leo');
  ok(trouve(ev, 'code-objet').code === 'leo:battu' && trouve(ev, 'code-objet').pour === 'sage' && trouve(ev, 'fin-donjon') && p.faits.fin === 1 && p.faits['combat:leo'] === 1, 'Léo battu : un code pour le Sage (leo:battu), et la fin du donjon');
  ok(R.objets(p).codes.filter(function(c){ return c.code === 'leo:salle' || c.code === 'leo:battu'; }).length === 2, 'les deux codes de Léo restent dans « Objets »');
  ok(trouve(R.entrer(p, 'leo'), 'fin-donjon') && !trouve(R.entrer(p, 'leo'), 'boss'), 'on y revient : plus de combat, la fin');
  ok(R.code(p, 'maire:retenu')[0].t === 'refus' && !R.leoEnfui, '« Le maire est retenu » et « Léo s\'est enfui » n\'existent plus (Romain, 13 novembre)');
  var carte = null;
  try{ global.window = global; global.document = {createElement:function(){ return {getContext:function(){ return null; }}; }}; require(path.join(__dirname, '..', 'carte.js')); carte = global.CARTE_DONJON; }catch(e){}
  if(carte) ok(Object.keys(D.LIEUX).every(function(id){ return carte.LIEUX[id]; }) && Object.keys(carte.LIEUX).every(function(id){ return D.LIEUX[id]; }), 'les lieux des règles sont exactement ceux de carte.js (' + Object.keys(D.LIEUX).length + ')');
  if(carte) ok(Object.keys(D.COMBATS).every(function(id){ return carte.LIEUX[id].monstres.slice().sort().join() === D.COMBATS[id].monstres.slice().sort().join(); }), 'les monstres de chaque salle sont ceux de carte.js');
})();

section('Les données tiennent debout');
(function(){
  var coups = ['lumiere', 'bruit', 'nuage', 'feu', 'huile', 'colle', 'givre', 'acide', 'louche', 'bouclier', 'chatouille', 'colere', 'critique'], pb = [];       /* (colere : ce qu'il fait en se fâchant) */
  Object.keys(D.MONSTRES).forEach(function(k){
    var M = D.MONSTRES[k];
    Object.keys(M.reactions).forEach(function(cp){ if(coups.indexOf(cp) < 0) pb.push(k + ' : coup inconnu ' + cp); });
    M.rythme.forEach(function(a){ if(!M.attaques[a]) pb.push(k + ' : attaque inconnue ' + a); });
  });
  Object.keys(D.COMBATS).forEach(function(s){ D.COMBATS[s].monstres.forEach(function(m){ if(!D.MONSTRES[m]) pb.push(s + ' : monstre inconnu ' + m); }); });
  ok(pb.length === 0, 'les réactions, les attaques et les salles ne citent que des choses qui existent' + (pb.length ? ' — ' + pb.join(' ; ') : ''));
  /* les noms d'états, d'attaques et de moments spéciaux sont ceux des modules animés (anim/betes/<id>/<id>-anime.js) */
  var fs = require('fs'), inconnus = [], lus = 0;
  var COMMUNS = ['enrage', 'brule', 'colle', 'ebloui', 'gele', 'ouvert', 'dos', 'cible'];
  var A_LA_MAIN = {      /* ces deux modules n'ont pas de liste dans leur « info » : noms relevés dans leur en-tête */
    bourbe:{etats:COMMUNS.concat(['berge', 'sec', 'gonfle', 'avale', 'sous']), specials:['recrache', 'chatouille', 'plonger', 'remonter', 'mouche', 'rot'], attaques:['langue', 'saut']},
    tetard:{etats:COMMUNS, specials:['plouf'], attaques:['morsure']}
  };
  Object.keys(D.MONSTRES).forEach(function(k){
    var M = D.MONSTRES[k], id = M.module, noms = A_LA_MAIN[id];
    if(id === 'rat') return;                       /* RatAnime : l'ancienne API, enveloppée par l'affichage */
    var src = ''; try{ src = fs.readFileSync(path.join(__dirname, '..', 'anim', 'betes', id, id + '-anime.js'), 'utf8'); }catch(e){ inconnus.push(k + ' : module introuvable'); return; }
    function liste(nom){ var m = new RegExp(nom + ":\\s*\\[([^\\]]*)\\]").exec(src.slice(src.indexOf('var INFO'))); return m ? m[1].split(',').map(function(x){ return x.replace(/['\s]/g, ''); }).filter(Boolean) : null; }
    if(!noms){ noms = {etats:liste('etats'), specials:liste('specials'), attaques:liste('attaques')}; }
    if(!noms.etats || !noms.specials || !noms.attaques){ inconnus.push(k + ' : listes illisibles'); return; }
    lus++;
    var etats = {}, specials = {};
    function fait(l){ (l || []).forEach(function(f){ if(f[0] === 'etat' || f[0] === 'retire') etats[f[1]] = 1; if(f[0] === 'special') specials[f[1]] = 1; }); }
    Object.keys(M.reactions).forEach(function(cp){ M.reactions[cp].forEach(function(r){ fait(r.fait); var si = r.si || {}; (si.avec || []).concat(si.sans || [], si.un || []).forEach(function(n){ etats[n] = 1; }); }); });
    Object.keys(M.attaques).forEach(function(a){ fait(M.attaques[a].apres); if(M.rythme.indexOf(a) >= 0 && noms.attaques.indexOf(M.attaques[a].anim || a) < 0) inconnus.push(k + ' : attaque ' + a); if(M.rythme.indexOf(a) < 0 && noms.specials.indexOf(a) < 0) inconnus.push(k + ' : riposte ' + a); });
    (M.passeSi || []).concat(M.tombe || [], M.cache || [], M.blinde || []).forEach(function(n){ etats[n] = 1; });
    Object.keys(etats).forEach(function(n){ if(n.charAt(0) !== '_' && noms.etats.indexOf(n) < 0) inconnus.push(k + ' : état ' + n); });
    Object.keys(specials).forEach(function(n){ if(noms.specials.indexOf(n) < 0) inconnus.push(k + ' : spécial ' + n); });
  });
  ok(inconnus.length === 0 && lus === 9, 'les états, les attaques et les moments spéciaux des 9 monstres animés portent les noms de leurs modules' + (inconnus.length ? ' — ' + inconnus.join(' ; ') : ''));
  /* les chiffres réglés par la simulation sont bien reportés dans CONCEPTION-DONJON.md (§5 et §6) */
  var conc = fs.readFileSync(path.join(__dirname, '..', 'CONCEPTION-DONJON.md'), 'utf8'), M = D.MONSTRES, oublis = [];
  [['coup de tête ' + M.ratcuir.attaques['coup-de-tete'].degats, 'rat cuirassé'], ['brûlent +' + M.ratcuir.attaques['coup-de-tete'].plusSi.rougeoie, 'rat cuirassé rougi'],
   ['piqué ' + M.chauvesouris.attaques.pique.degats, 'chauve-souris'], ['brûlure froide ' + M.feufollet.attaques.brulure.degats, 'feu follet'],
   ['morsure ' + M.araignee.attaques.morsure.degats, 'araignée'], ['morsure ' + M.petitearaignee.attaques.morsure.degats, 'petite araignée'], ['morsure ' + M.tetard.attaques.morsure.degats, 'têtard'],
   ['grouillement ' + M.roirats.attaques.grouillement.degats, 'Roi des rats'], [M.roirats.attaques.charge.degats + ' sur l\'Alchimiste', 'la charge du Roi'],
   ['poing ' + M.gardien.attaques.poing.degats, 'Gardien'], ['+' + M.gardien.attaques.poing.plusSi.rougeoie + ' par coup', 'Gardien rougi'],
   ['langue ' + M.bourbe.attaques.langue.degats, 'langue de Bourbe'], ['saut ' + M.bourbe.attaques.saut.degats, 'saut de Bourbe'],
   ['soigne ' + D.RECETTES.baumelum.soinEquipe + ' à chacun', 'Baume lumineux'], ['fermé (' + D.OBJETS['fleches-argent'].ferme + ')', 'flèches d\'argent'], [D.OBJETS['fleches-lourdes'].ferme + ' même fermé', 'flèches lourdes'],
   [D.CHIFFRES.bourse + ' pièces', 'la bourse'], ['| ' + M.gardien.pv + ' |', 'PV du Gardien'], ['| ' + M.roirats.pv + ' |', 'PV du Roi des rats'], ['| 1 000 |', 'PV de Bourbe']
  ].forEach(function(x){ if(conc.indexOf(x[0]) < 0) oublis.push(x[1] + ' (« ' + x[0] + ' »)'); });
  ok(oublis.length === 0 && M.bourbe.pv === 1000, 'les chiffres de donnees.js sont ceux écrits dans CONCEPTION-DONJON.md' + (oublis.length ? ' — à reporter : ' + oublis.join(' ; ') : ''));
  /* les mots volants et les refus restent courts */
  var longs = [];
  Object.keys(D.MOTS).forEach(function(k){ if(D.MOTS[k].split(' ').filter(function(w){ return /[a-zA-Zéèêàç]/.test(w); }).length > 3) longs.push(D.MOTS[k]); });
  ok(longs.length === 0, 'les refus tiennent en deux ou trois mots' + (longs.length ? ' — ' + longs.join(' ; ') : ''));
})();

section('Dans la page comme dans Node');
(function(){
  var fs = require('fs'), vm = require('vm'), fen = {};
  var ctx = vm.createContext({window:fen, console:console});
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', 'donnees.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', 'regles.js'), 'utf8'), ctx);
  ok(fen.DonjonDonnees && fen.Regles && typeof fen.Regles.combat === 'function', 'sans « module » (comme dans une page) : window.DonjonDonnees et window.Regles sont là');
  var p = fen.Regles.nouvellePartie(9); p.recettes = ['feu', 'huile', 'baume'];
  var c = fen.Regles.combat(p, 'rats'), ev = c.jouer('sage', {geste:'rune', cible:'b1'});
  ok(ev.length === 4 && ev[3].t === 'ouvert' && c.jouer('pisteur', {geste:'dague', cible:'b1'}).pop().mode === 'explose', 'un combat s\'y joue pareil');
  var src = fs.readFileSync(path.join(__dirname, 'src', 'regles.js'), 'utf8') + fs.readFileSync(path.join(__dirname, 'src', 'donnees.js'), 'utf8');
  var code = src.replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/\bdocument\b|\bsetTimeout\b|\bsetInterval\b|\bMath\.random\b|\blocalStorage\b|\bAudio\b|=>|\blet\b|\bconst\b/.test(code), 'les règles et les données : pas de DOM, pas de minuterie, pas de Math.random, pas de son, et un JavaScript que les vieilles tablettes lisent');
})();

section('Le contrat des évènements');
(function(){
  /* tous les types d'évènements que les règles envoient sont dans la liste en tête de regles.js, avec un exemple */
  var fs = require('fs'), src = fs.readFileSync(path.join(__dirname, 'src', 'regles.js'), 'utf8'), tete = src.slice(0, src.indexOf('(function(global){'));
  var ecrits = {}, re = /\{t:'([a-z-]+)'/g, m;
  while((m = re.exec(tete))) ecrits[m[1]] = 1;
  var vus = {}, defauts = [], coupsVus = {}, COUPS = ['fleche', 'fleche-argent', 'fleche-lourde', 'dague', 'feu', 'lumiere', 'louche', 'colle', 'huile', 'nuage', 'givre', 'acide', 'bruit', 'bouclier', 'chatouille'];
  function noter(ev, c){
    if(!Array.isArray(ev)){ defauts.push('pas une liste'); return; }
    ev.forEach(function(e){
      vus[e.t] = 1;
      if(!e.t) defauts.push('évènement sans type');
      if(c && typeof e.bete === 'string' && !c.bete(e.bete)) defauts.push(e.t + ' : bête inconnue ' + e.bete);
      if(typeof e.heros === 'string' && D.EXPOSES.indexOf(e.heros) < 0) defauts.push(e.t + ' : héros inconnu ' + e.heros);
      if(e.t === 'touche' || e.t === 'rebond'){ coupsVus[e.coup] = 1; if(COUPS.indexOf(e.coup) < 0) defauts.push('coup inconnu ' + e.coup); }
      if(e.t === 'degats' && (typeof e.n !== 'number' || typeof e.pv !== 'number' || e.pv < 0)) defauts.push('dégâts mal formés');
    });
  }
  var ch = R.alea(2026), combats = 0;
  Object.keys(D.COMBATS).forEach(function(salle){
    for(var g = 1; g <= 150; g++){
      var p = R.nouvellePartie(g * 13 + salle.length);
      p.recettes = D.ORDRE_RECETTES.slice();
      var rec = D.ORDRE_RECETTES.slice().sort(function(){ return ch() - 0.5; });
      p.recettes = rec.slice(0, 5);
      var carq = ch(); p.heros.pisteur.objets = ['fleches-normales'].concat(carq < 0.33 ? [] : carq < 0.66 ? ['fleches-argent'] : ['fleches-argent', 'fleches-lourdes']).concat(['amulette']);
      p.heros.sage.objets = [ch() < 0.5 ? 'cristal-lune' : 'baton-chene'];
      var c = R.combat(p, salle), n = 0;
      noter(c.entree(), c); combats++;
      while(!c.fini() && n++ < 300){
        var hs = c.aJouer();
        if(!hs.length){ noter(c.tourMonstres(), c); continue; }
        var h = hs[Math.floor(ch() * hs.length)], gs = c.gestes(h).filter(function(x){ return x.permis; }), ge = gs[Math.floor(ch() * gs.length)];
        var cible = ge.cibles.length ? (ge.max === 2 && ge.cibles.length > 1 && ch() < 0.5 ? ge.cibles.slice(0, 2) : ge.cibles[Math.floor(ch() * ge.cibles.length)]) : null;
        var ev = c.jouer(h, {geste:ge.geste, cible:cible});
        if(ev[0] && ev[0].t === 'refus') defauts.push('un geste annoncé comme permis est refusé : ' + salle + ' ' + h + ' ' + ge.geste + ' (' + ev[0].mot + ')');
        noter(ev, c);
        if(ch() < 0.02) noter(c.jouer(h, {geste:'dague', cible:'b99'}), c);          /* un refus de temps en temps */
      }
      if(!c.fini()) noter(c.fuir(), null);
    }
  });
  /* et hors combat */
  var q = R.nouvellePartie(4);
  [R.entrer(q, 'galerie'), R.prendre(q, 'bourse'), R.entrer(q, 'aeration'), R.prendre(q, 'herbes'),
   R.entrer(q, 'reserve'), R.prendre(q, 'fleches-argent'), R.entrer(q, 'bibliotheque'), (D.LIEUX.bibliotheque.coffre = ['cristal-lune', 'baton-chene'], R.choisir(q, 'cristal-lune')), (delete D.LIEUX.bibliotheque.coffre, []), R.entrer(q, 'eboulis'), R.fouiller(q), R.fouiller(q), R.crane(q), R.entrer(q, 'dalles'), R.dalle(q, 'fond'),
   R.dalle(q, 'devant'), R.dalle(q, 'devant'), R.dalle(q, 'fond'), R.dalle(q, 'fond'), R.dalle(q, 'fond'), R.dalle(q, 'fond'), R.entrer(q, 'portes'), R.porte(q, 'oeil'),
   R.entrer(q, 'camp'), R.repos(q), R.code(q, 'sauve:1'), R.code(q, 'recette:givre'), R.entrer(q, 'rats'), R.entrer(q, 'porte4'), R.entrer(q, 'leo'), R.bossBattu(q, 'leo'), R.fuir(q)].forEach(function(ev){ noter(ev, null); });
  q.faits['combat:egouts'] = 1; noter(R.entrer(q, 'egouts'), null);
  q.lieu = 'canaux'; q.faits['combat:canaux'] = 1; ['g', 'g', 'g', 'g', 'g', 'g'].forEach(function(x){ noter(R.roue(q, x), null); }); D.ROUE.suite.forEach(function(x){ noter(R.roue(q, x), null); });
  D.OBJETS['essai-a'] = {nom:'Objet d\'essai A', pour:'sage'}; D.OBJETS['essai-b'] = {nom:'Objet d\'essai B', pour:'sage'};
  q.lieu = 'crypte'; q.faits['combat:crypte'] = 1; q.heros.sage.objets = ['essai-a', 'essai-b'];
  noter(R.prendre(q, 'amulette', 'sage'), null); noter(R.prendre(q, 'amulette', 'sage', 'essai-b'), null);
  delete D.OBJETS['essai-a']; delete D.OBJETS['essai-b'];
  var pasEcrits = Object.keys(vus).filter(function(t){ return !ecrits[t]; }), jamais = Object.keys(ecrits).filter(function(t){ return !vus[t]; });
  ok(pasEcrits.length === 0, combats + ' combats au hasard dans les 8 salles : chaque type d\'évènement envoyé est décrit en tête de regles.js' + (pasEcrits.length ? ' — manquent : ' + pasEcrits.join(', ') : ''));
  ok(jamais.length === 0, 'et chaque type décrit (' + Object.keys(ecrits).length + ') est bien envoyé par les règles' + (jamais.length ? ' — jamais vus : ' + jamais.join(', ') : ''));
  ok(defauts.length === 0, 'les évènements sont bien formés (bêtes et héros connus, coups du contrat, dégâts chiffrés), et un geste annoncé permis n\'est jamais refusé' + (defauts.length ? ' — ' + defauts.slice(0, 4).join(' ; ') : ''));
  ok(COUPS.every(function(k){ return coupsVus[k]; }), 'tous les types de coup du contrat sont passés (' + Object.keys(coupsVus).length + ')' + (COUPS.every(function(k){ return coupsVus[k]; }) ? '' : ' — manquent : ' + COUPS.filter(function(k){ return !coupsVus[k]; }).join(', ')));
})();

console.log('\n' + (echecs.length ? echecs.length + ' ÉCHEC(S) :\n  - ' + echecs.join('\n  - ') : 'TOUT EST VERT') + '   (' + nOk + ' vérifications réussies)');
process.exit(echecs.length ? 1 : 0);
