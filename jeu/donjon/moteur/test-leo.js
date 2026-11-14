/* test-leo.js — les règles du combat de Léo (src/leo-regles.js), sans navigateur.   node test-leo.js */
'use strict';
var R = require('./src/regles.js'), LR = require('./src/leo-regles.js'), D = R.D, L = LR.L;
var nOk = 0, echecs = [], titre = '';
function section(t){ titre = t; console.log('\n== ' + t); }
function ok(c, m){ if(c){ nOk++; console.log('  ok  ' + m); } else { echecs.push(titre + ' : ' + m); console.log('  ÉCHEC  ' + m); } }
function egal(a, b, m){ ok(JSON.stringify(a) === JSON.stringify(b), m + (JSON.stringify(a) === JSON.stringify(b) ? '' : ' — obtenu ' + JSON.stringify(a) + ', attendu ' + JSON.stringify(b))); }
function partie(g){
  var p = R.nouvellePartie(g || 7);
  p.recettes = D.ORDRE_RECETTES.slice();
  p.heros.sage.objets.push('cristal-lune', 'baton-chene');
  p.heros.pisteur.objets.push('fleches-lourdes', 'fleches-argent');
  return p;
}
function combat(phase, g){ return LR.combat(partie(g), {phase:phase}); }
function tous(ev, t, f){ return ev.filter(function(e){ return e.t === t && (!f || f(e)); }); }
function trouve(ev, t, f){ return tous(ev, t, f)[0] || null; }
/* avancer jusqu'à ce qu'un évènement arrive (rend tous les évènements passés) */
function jusque(c, f, max){
  var tout = [], t0 = c.t;
  while(!c.fini() && c.t - t0 < (max || 60)){ var ev = c.avancer(.05); tout = tout.concat(ev); if(ev.some(f)) break; }
  return tout;
}
/* pareil, mais les héros sont soignés à chaque pas (on regarde Léo, pas la survie) ; sansRats : ses rats sont enlevés */
function jusqueG(c, f, max, sansRats){
  var tout = [], t0 = c.t;
  while(!c.fini() && c.t - t0 < (max || 120)){
    D.ORDRE.forEach(function(h){ var S = c.h[h]; S.pv = S.pvMax; S.sol = false; S.saigne = false; S.etourdi = 0; S.brule = 0; S.attrape = false; });
    c.leo.tenu = null; if(sansRats) c.rats.forEach(function(r){ r.mort = true; });
    var ev = c.avancer(.05); tout = tout.concat(ev); if(ev.some(f)) break;
  }
  return tout;
}
function leo(quoi, att){ return function(e){ return e.t === 'leo' && e.quoi === quoi && (!att || e.att === att); }; }
/* un geste, joué jusqu'au bout de son animation */
function geste(c, h, g, cible){ var ev = c.agir(h, g, cible); if(ev[0].t === 'refus') return ev; var d = c.dureeDe(h, g, [].concat(cible || [])); return ev.concat(c.avancer(d.fin + .06)); }
function g1(c, h, id){ return c.gestes(h).filter(function(x){ return x.geste === id; })[0]; }

section('Les phases et l\'ordre des attaques');
(function(){
  var c = combat(1);
  egal([c.etat().leo.pv, c.etat().leo.pvMax, c.etat().leo.plancher], [10000, 10000, 6000], 'phase 1 : de 10 000 à 6 000');
  egal([combat(2).etat().leo.pv, combat(2).etat().leo.plancher, combat(3).etat().leo.pv, combat(3).etat().leo.plancher], [6000, 3000, 3000, 0], 'phase 2 : de 6 000 à 3 000 ; phase 3 : de 3 000 à 0');
  egal(D.ORDRE.map(function(h){ return c.etat().heros[h].pv; }), [90, 100, 120], 'les héros commencent avec toute leur vie');
  var vus = [];
  while(vus.length < 8 && !c.fini()){ c.avancer(.05).forEach(function(e){ if(e.t === 'leo' && e.quoi === 'prise') vus.push(e.att); }); if(c.fini()) break; D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].attrape = false; }); c.leo.tenu = null; }
  egal(vus.slice(0, 8), ['fleau', 'charge', 'marteau', 'meule', 'crochet', 'cape', 'fleau', 'charge'], 'phase 1 : ses attaques viennent toujours dans le même ordre, en boucle (pas de hasard)');
  var a = combat(1, 11), b = combat(1, 11), ea = [], eb = [];
  for(var i = 0; i < 400; i++){ ea = ea.concat(a.avancer(.05)); eb = eb.concat(b.avancer(.05)); }
  ok(JSON.stringify(ea) === JSON.stringify(eb) && ea.length > 10, 'la même graine donne exactement le même combat');
  var c2 = combat(1, 3), c3 = combat(1, 3), e2 = [], e3 = [];
  for(i = 0; i < 100; i++) e2 = e2.concat(c2.avancer(.05));
  for(i = 0; i < 300; i++) e3 = e3.concat(c3.avancer(.05 / 3));
  egal(tous(e2, 'leo').map(function(e){ return e.quoi + ':' + (e.att || ''); }), tous(e3, 'leo').map(function(e){ return e.quoi + ':' + (e.att || ''); }), 'le combat ne dépend pas du nombre d\'images par seconde');
  ok(!g1(c, 'pisteur', 'f:fleches-argent') && !!g1(c, 'pisteur', 'f:fleches-lourdes'), 'l\'arc de lune est enlevé pendant tout le combat (Romain)');
  ok(!g1(c, 'sage', 'appel'), 'pas de rune d\'appel contre Léo');
})();

section('Les gestes prennent le temps de leur animation');
(function(){
  var c = combat(1), ev = c.agir('pisteur', 'dague', 'leo');
  egal([ev[0].t, ev[0].impact, ev[0].fin], ['geste', L.DUREES.dague.impact, L.DUREES.dague.fin], 'la dague : l\'impact à 0,71 s, le Pisteur est pris 1,99 s');
  egal(c.refus('pisteur', 'fleche', 'leo'), L.MOTS.occupe, 'pendant son geste, le même héros ne peut rien lancer d\'autre');
  ok(!c.refus('alchimiste', 'p:feu', 'leo') && !c.refus('sage', 'oeil'), 'les deux autres, si : les trois héros peuvent être en plein geste en même temps');
  var e2 = c.avancer(.6);
  ok(!trouve(e2, 'degats', function(e){ return e.cible === 'leo'; }), 'avant l\'impact, rien n\'est tombé');
  e2 = c.avancer(.2);
  egal(trouve(e2, 'degats', function(e){ return e.cible === 'leo'; }).n, L.COUPS.dague, 'à l\'impact : ' + L.COUPS.dague + ' sur Léo');
  c.avancer(1.25);
  ok(!c.refus('pisteur', 'dague', 'leo'), 'son animation finie, il peut recommencer');
  egal(c.dureeDe('pisteur', 'p:huile', ['leo']).impact, L.DUREES.fleche.impact, 'la flèche trempée du Pisteur arrive plus vite (1,57 s) que la fiole de l\'Alchimiste (2,54 s)');
  egal(c.dureeDe('alchimiste', 'p:huile', ['leo']).impact, L.DUREES.potion.impact, '… 2,54 s pour la fiole');
})();

section('Les deux boucliers');
(function(){
  var c = combat(1), ev;
  geste(c, 'sage', 'bouclier', 'pisteur');
  egal(c.etat().heros.pisteur.bouclier, 'jaune', 'le bâton normal pose un bouclier jaune');
  c.avancer(20);
  egal(c.h.pisteur.bouclier === 'jaune' || c.h.pisteur.pv < 120, true, 'un bouclier reste posé tant qu\'aucun coup ne l\'a cassé');
  c = combat(1);
  geste(c, 'sage', 'bouclier', 'sage'); geste(c, 'sage', 'bouclier', 'alchimiste'); geste(c, 'sage', 'bouclier', 'pisteur');
  ok(D.ORDRE.every(function(h){ return c.h[h].bouclier === 'jaune'; }), 'on peut en poser trois d\'avance (Romain)');
  ev = jusque(c, leo('impact', 'fleau'));
  var dg = tous(ev, 'degats', function(e){ return e.heros && e.cause === 'fleau'; });
  ok(dg.length === 2 && dg.every(function(e){ return e.bouclier === 'jaune' && e.n === Math.ceil(L.ATTAQUES.fleau.degats * .25); }), 'le fléau frappe deux héros ; le bouclier jaune en arrête 75 %');
  ok(dg.every(function(e){ return c.h[e.heros].bouclier === null; }) && tous(ev, 'bouclier', function(e){ return e.casse; }).length === 2, 'un bouclier touché disparaît');
  c = combat(1);
  geste(c, 'sage', 'a:baton-chene');
  egal([c.h.sage.bouclier, c.h.alchimiste.bouclier, c.h.pisteur.bouclier], ['chene', 'chene', 'chene'], 'le bâton de chêne en pose sur les TROIS héros, d\'un seul geste (Romain, 14 novembre)');
  egal(g1(c, 'sage', 'a:baton-chene').max, 3, '… sa carte accepte trois héros');
  var cj = combat(1); cj.h.pisteur.bouclier = 'jaune'; geste(cj, 'sage', 'a:baton-chene');
  egal([cj.h.sage.bouclier, cj.h.alchimiste.bouclier, cj.h.pisteur.bouclier], ['chene', 'chene', 'jaune'], '… et il n\'écrase pas un bouclier jaune, qui est plus fort');
  ev = jusque(c, leo('impact', 'fleau'));
  dg = tous(ev, 'degats', function(e){ return e.heros && e.cause === 'fleau'; });
  ok(dg.every(function(e){ return e.n === Math.ceil(L.ATTAQUES.fleau.degats * .5); }), 'les boucliers de chêne n\'arrêtent que 50 %');
  /* le marteau : le jaune arrête l'étourdissement, le chêne non */
  c = combat(1); D.ORDRE.forEach(function(h){ c.h[h].bouclier = 'jaune'; });
  jusque(c, leo('impact', 'fleau')); D.ORDRE.forEach(function(h){ c.h[h].bouclier = 'jaune'; });
  jusque(c, leo('impact', 'charge')); D.ORDRE.forEach(function(h){ c.h[h].bouclier = 'jaune'; });
  ev = jusque(c, leo('impact', 'marteau'));
  ok(!trouve(ev, 'etat', function(e){ return e.nom === 'etourdi' && e.on; }), 'le marteau sur un bouclier jaune : pas d\'étourdissement');
  c = combat(1);
  jusque(c, leo('impact', 'fleau')); jusque(c, leo('impact', 'charge')); D.ORDRE.forEach(function(h){ c.h[h].bouclier = 'chene'; c.h[h].pv = c.h[h].pvMax; });
  ev = jusque(c, leo('impact', 'marteau'));
  var et = trouve(ev, 'etat', function(e){ return e.nom === 'etourdi' && e.on; });
  ok(et && et.duree === 3 && c.refus(et.heros, D.HEROS[et.heros].gestes[0] === 'oeil' ? 'bouclier' : D.HEROS[et.heros].gestes[0], et.heros === 'sage' ? 'sage' : 'leo') === L.MOTS.etourdi, 'sur un bouclier de chêne : étourdi trois secondes, il ne peut plus rien faire');
  c.avancer(3.1);
  ok(c.etat().heros[et.heros].etourdi === 0, 'puis il revient à lui');
})();

section('Phase 1 — la charge, l\'huile et la dague');
(function(){
  var c = combat(1), ev;
  jusque(c, leo('impact', 'fleau'));
  D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; });
  jusque(c, leo('prise', 'charge'));
  ev = geste(c, 'pisteur', 'p:huile', 'leo');
  ok(trouve(ev, 'leo-etat', function(e){ return e.nom === 'flaque' && e.on; }) && c.etat().leo.flaque, 'l\'huile fait une flaque sous ses pieds');
  ev = jusque(c, function(e){ return e.t === 'leo' && (e.quoi === 'glisse' || e.quoi === 'impact'); });
  ok(trouve(ev, 'leo', function(e){ return e.quoi === 'glisse'; }) && c.etat().leo.auSol && !trouve(ev, 'degats', function(e){ return e.heros && e.cause === 'charge'; }), 'au moment de charger, il glisse et tombe sur place : personne n\'est touché');
  ev = geste(c, 'pisteur', 'dague', 'leo');
  egal(trouve(ev, 'degats', function(e){ return e.cible === 'leo'; }).n, L.COUPS.dagueSol, 'au sol, la dague lui fait très mal (' + L.COUPS.dagueSol + ' au lieu de ' + L.COUPS.dague + ')');
  ev = jusque(c, leo('debout'));
  ok(!c.etat().leo.auSol, 'puis il se relève');
  /* sans huile : il charge */
  c = combat(1); jusque(c, leo('impact', 'fleau')); D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; });
  ev = jusque(c, leo('impact', 'charge'));
  egal(trouve(ev, 'degats', function(e){ return e.cause === 'charge'; }).n, L.ATTAQUES.charge.degats, 'sans huile ni colle : la charge arrive (' + L.ATTAQUES.charge.degats + ')');
  /* la colle marche aussi */
  c = combat(1); jusque(c, leo('impact', 'fleau')); jusque(c, leo('prise', 'charge'));
  geste(c, 'pisteur', 'p:colle', 'leo');
  ev = jusque(c, function(e){ return e.t === 'leo' && (e.quoi === 'glisse' || e.quoi === 'impact'); });
  ok(!!trouve(ev, 'leo', function(e){ return e.quoi === 'glisse'; }), 'la colle l\'arrête aussi');
})();

section('Phase 1 — la farine, le crochet, le BOUM');
(function(){
  function auCrochet(c){ ['fleau', 'charge', 'marteau', 'meule'].forEach(function(a){ jusque(c, leo('impact', a)); D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].etourdi = 0; }); }); }
  var c = combat(1), ev; auCrochet(c);
  ev = jusque(c, leo('prise', 'crochet'));
  ok(trouve(ev, 'leo-etat', function(e){ return e.nom === 'nuage' && e.on; }) && c.etat().leo.nuage, 'd\'abord la farine : un nuage, il disparaît dedans');
  egal(c.refus('pisteur', 'dague', 'leo'), L.MOTS.farine, 'dans sa farine, il est intouchable (« Dans la farine ! »)');
  ev = jusque(c, leo('impact', 'crochet'));
  var pris = c.etat().leo.tenu, dc = trouve(ev, 'degats', function(e){ return e.cause === 'crochet'; });
  ok(pris && dc.heros === pris && dc.n === L.ATTAQUES.crochet.degats && c.h[pris].attrape && trouve(ev, 'leo', function(e){ return e.quoi === 'tient'; }), 'puis le crochet : un coup énorme (' + L.ATTAQUES.crochet.degats + '), et le héros est tiré dans le nuage');
  ok(c.gestes(pris).every(function(g){ return !g.permis; }), 'le héros attrapé ne peut plus rien faire');
  var autre = pris === 'pisteur' ? 'alchimiste' : 'pisteur', pvPris = c.h[pris].pv, pvLeo = c.leo.pv;
  ev = geste(c, autre, 'p:huile', 'leo');
  ok(!c.h[pris].attrape && trouve(ev, 'leo', function(e){ return e.quoi === 'lache' && e.par === 'huile'; }) && c.leo.pv === pvLeo && c.h[pris].pv === pvPris, 'l\'huile le libère : aucun dégât, ni pour lui ni pour Léo');
  ok(c.etat().leo.nuage, 'le nuage de farine reste');
  ev = geste(c, autre, 'p:feu', 'leo');
  ok(trouve(ev, 'boum') && c.leo.pv === pvLeo - L.BOUM.leo && c.h[pris].pv === pvPris && !c.etat().leo.nuage, 'le feu dans la farine : BOUM, ' + L.BOUM.leo + ' sur Léo, et le héros libéré n\'a rien');
  /* le feu pendant que le héros est encore dedans */
  c = combat(1); auCrochet(c); jusque(c, leo('impact', 'crochet'));
  pris = c.etat().leo.tenu; autre = pris === 'pisteur' ? 'alchimiste' : 'pisteur'; pvPris = c.h[pris].pv; pvLeo = c.leo.pv;
  ev = geste(c, autre, 'p:feu', 'leo');
  ok(trouve(ev, 'boum') && c.leo.pv === pvLeo - L.BOUM.leo && c.h[pris].pv === pvPris - L.BOUM.heros && !c.h[pris].attrape, 'le feu avec le héros encore dedans : BOUM, il en sort, mais il prend ' + L.BOUM.heros + ' (Romain)');
  /* personne ne le libère */
  c = combat(1); auCrochet(c); jusque(c, leo('impact', 'crochet'));
  pris = c.etat().leo.tenu; pvPris = c.h[pris].pv;
  ev = jusque(c, function(e){ return e.t === 'leo' && e.quoi === 'lache'; });
  ok(trouve(ev, 'leo', function(e){ return e.quoi === 'lache' && e.par === 'temps'; }) && c.h[pris].pv === pvPris - L.ATTAQUES.crochet.ecrase && !c.h[pris].attrape, 'personne ne le libère : au bout de sept secondes, Léo l\'écrase (' + L.ATTAQUES.crochet.ecrase + ') et le rejette');
  /* (14 novembre, Romain) « l'écran de farine, il s'arrête jamais. Pour l'enlever, il faut forcément faire du feu. » */
  ok(c.etat().leo.nuage && c.etat().leo.cache, '… et la farine RESTE : il est toujours intouchable');
  c.noir = false;
  ev = jusqueG(c, function(e){ return false; }, 45);
  var attaques = tous(ev, 'leo', function(e){ return e.quoi === 'impact'; }).map(function(e){ return e.att; });
  c.noir = false;
  ok(c.etat().leo.nuage && attaques.length >= 5 && !trouve(ev, 'leo-etat', function(e){ return e.nom === 'nuage' && !e.on; }), 'quarante-cinq secondes plus tard, la farine est toujours là — et il a continué d\'attaquer depuis son nuage (' + attaques.length + ' coups)');
  egal([c.refus('pisteur', 'dague', 'leo'), c.refus('pisteur', 'f:fleches-lourdes', 'leo'), c.refus('alchimiste', 'p:givre', 'leo')], [L.MOTS.farine, L.MOTS.farine, L.MOTS.farine], 'tant qu\'elle est là : ni dague, ni flèche, ni givre (« Dans la farine ! »)');
  var av = c.leo.pv; D.ORDRE.forEach(function(h){ c.h[h].act = null; c.h[h].etourdi = 0; });
  ev = geste(c, 'alchimiste', 'p:feu');
  ok(trouve(ev, 'boum') && !c.etat().leo.nuage && c.leo.pv === Math.max(L.PHASES[1].a, av - L.BOUM.leo), 'seul le feu l\'enlève : BOUM');
  /* le bouclier jaune empêche d'être attrapé */
  c = combat(1); auCrochet(c); jusque(c, leo('prise', 'crochet')); D.ORDRE.forEach(function(h){ c.h[h].bouclier = 'jaune'; });
  ev = jusque(c, leo('impact', 'crochet'));
  ok(!c.etat().leo.tenu && !D.ORDRE.some(function(h){ return c.h[h].attrape; }) && trouve(ev, 'degats', function(e){ return e.cause === 'crochet'; }).n === Math.ceil(L.ATTAQUES.crochet.degats * .25), 'le bouclier jaune : 75 % de moins, et personne n\'est attrapé');
  ev = geste(c, 'pisteur', 'p:feu', 'leo');
  ok(!!trouve(ev, 'boum'), 'il est encore dans son nuage : le feu fait BOUM quand même');
  ev = geste(c, 'pisteur', 'p:feu', 'leo');
  ok(!trouve(ev, 'boum'), 'un seul BOUM par nuage');
})();

section('Phase 1 — la cape et le noir');
(function(){
  /* (14 novembre, Romain) « quand il éteint les torches, ça se rallume jamais » ; « quand tout est noir, tout continue normalement.
     Le seul truc, c'est que Léo est inciblable » ; la lumière du bâton de lune « arrête son attaque en cours » */
  function frais(c){ D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].etourdi = 0; c.h[h].attrape = false; c.h[h].act = null; }); c.leo.tenu = null; }
  function aLaCape(c){ ['fleau', 'charge', 'marteau', 'meule', 'crochet'].forEach(function(a){ jusque(c, leo('impact', a)); frais(c); }); c.leo.nuage = false; }
  var c = combat(1), ev; aLaCape(c);
  egal(c.refus('sage', 'a:cristal-lune'), L.MOTS.clair, 'tant qu\'il fait clair, la lumière du bâton de lune ne sert à rien (« Il fait clair »)');
  geste(c, 'sage', 'oeil');
  ev = jusque(c, leo('impact', 'cape'));
  ok(trouve(ev, 'noir', function(e){ return e.on; }) && c.etat().noir && c.etat().leo.cache, 'la cape : les torches s\'éteignent');
  egal([c.refus('pisteur', 'dague', 'leo'), c.refus('alchimiste', 'p:feu', 'leo'), c.refus('alchimiste', 'p:huile', 'leo')], [L.MOTS.noir, L.MOTS.noir, L.MOTS.noir], 'dans le noir, Léo est intouchable : ni dague, ni feu, ni huile (« Dans le noir ! »)');
  c.h.pisteur.pv = 40;
  ok(!c.refus('alchimiste', 'herbes') && !c.refus('alchimiste', 'p:baume', 'pisteur') && !c.refus('sage', 'bouclier', 'pisteur') && !c.refus('sage', 'a:baton-chene', ['pisteur', 'sage']), '… mais tout le reste continue : on soigne, on pose des boucliers');
  ev = jusque(c, leo('prise'));
  ok(!!c.etat().leo.vise && c.etat().leo.suite[0].att === 'fleau', 'la rune de l\'œil voit dans le noir : sa proie, et ce qu\'il prépare');
  frais(c);
  ev = geste(c, 'sage', 'a:cristal-lune');
  ok(trouve(ev, 'noir', function(e){ return !e.on && e.par === 'lune'; }) && !c.etat().noir && !c.refus('pisteur', 'dague', 'leo'), 'le bâton de lune rallume la salle');
  var coupe = trouve(ev, 'leo', function(e){ return e.quoi === 'coupe'; });
  ok(coupe && coupe.att === 'fleau' && coupe.par === 'lune' && !trouve(ev, 'leo', function(e){ return e.quoi === 'impact'; }) && !trouve(ev, 'degats', function(e){ return e.heros && e.cause === 'fleau'; }), 'la lumière COUPE son attaque : le fléau ne tombe pas');
  ok(L.ECLAIR >= 1, '… et il reste ébloui au moins une seconde (' + L.ECLAIR + ' s)');
  ev = jusque(c, leo('prise'));
  egal(trouve(ev, 'leo', function(e){ return e.quoi === 'prise'; }).att, 'charge', 'l\'attaque coupée est perdue : il passe à la suivante');
  /* entre deux attaques : il reste figé */
  c = combat(1); aLaCape(c); jusque(c, leo('impact', 'cape')); jusque(c, leo('retour')); frais(c);
  var fin0 = c.leo.fin; c.agir('sage', 'a:cristal-lune', null); ev = c.avancer(L.DUREES.lune.impact + .06);
  ok(trouve(ev, 'leo', function(e){ return e.quoi === 'ebloui'; }) && c.leo.fin >= c.leo.tl + L.ECLAIR - .1 && c.leo.fin >= fin0, 'rallumé entre deux attaques : il reste figé une bonne seconde');
  /* le noir ne se lève jamais tout seul */
  c = combat(1); aLaCape(c); jusque(c, leo('impact', 'cape'));
  var t0 = c.t, n0 = 0;
  while(c.t - t0 < 90 && !c.fini()){ c.avancer(.1).forEach(function(e){ if(e.t === 'noir' && !e.on) n0++; }); frais(c); }
  ok(c.etat().noir && n0 === 0 && c.t - t0 >= 89, 'sans la lumière, il fait noir pour toujours (90 secondes plus tard : toujours noir)');
  /* sans bâton de lune : pas d'icône de lumière */
  var p2 = partie(); p2.heros.sage.objets = p2.heros.sage.objets.filter(function(o){ return o !== 'cristal-lune'; });
  var c2 = LR.combat(p2, {phase:1});
  ok(!c2.barre().some(function(x){ return x.geste === 'a:cristal-lune'; }) && c.barre().some(function(x){ return x.geste === 'a:cristal-lune' && x.permis; }), 'sans le bâton de lune, pas d\'icône de lumière ; avec lui, dans le noir, elle est allumée');
  /* un geste parti avant le noir tombe dans le vide */
  c = combat(1); aLaCape(c); jusque(c, leo('elan', 'cape')); frais(c);
  var pv0 = c.leo.pv; c.agir('pisteur', 'f:fleches-lourdes', 'leo'); ev = c.avancer(2.2);
  ok(c.etat().noir && c.leo.pv === pv0 && trouve(ev, 'mot', function(e){ return e.sur === 'leo' && e.texte === L.MOTS.noir; }), 'une flèche partie juste avant le noir tombe dans le vide');
})();

section('La rangée d\'icônes (Romain, 14 novembre)');
(function(){
  function ids(c){ return c.barre().map(function(x){ return x.heros[0] + ':' + x.geste; }).join(' '); }
  egal(ids(combat(1)), 's:oeil s:bouclier s:a:baton-chene s:a:cristal-lune a:p:huile a:p:feu a:p:givre a:herbes a:p:baume a:p:coeur p:dague p:p:huile p:p:feu p:p:givre', 'phase 1 : quatorze icônes — plus de flèche simple, plus de louche, d\'acide, de colle, de fumigène');
  egal(ids(combat(2)), 's:oeil s:rune s:bouclier s:a:baton-chene a:p:huile a:p:feu a:p:acide a:herbes a:p:baume a:p:coeur p:dague p:l:crochet p:l:fleau p:l:marteau p:p:huile p:p:feu', 'phase 2 : les trois outils de Léo, la rune et l\'acide (pour les rats), le feu (il passe par-dessus les rats) ; plus de givre, plus de lumière');
  egal(ids(combat(3)), 's:oeil s:bouclier s:a:baton-chene a:p:givre a:p:huile a:herbes a:p:baume a:p:coeur p:l:faux p:l:gourde p:p:givre p:p:huile', 'phase 3 : la faux, la gourde, le givre et l\'huile ; plus de dague');
  var p0 = R.nouvellePartie(7), c0 = LR.combat(p0, {phase:1});
  egal(ids(c0), 's:oeil s:bouclier a:p:huile a:p:feu a:herbes a:p:baume a:p:coeur p:dague p:p:huile p:p:feu', 'une équipe sans bâtons ni givre : ces icônes-là n\'existent pas');
  var c = combat(1), b;
  function ic(c, h, g){ return c.barre().filter(function(x){ return x.heros === h && x.geste === g; })[0]; }
  ok(!ic(c, 'alchimiste', 'p:baume').permis && ic(c, 'alchimiste', 'p:baume').mot === L.MOTS.forme && !ic(c, 'alchimiste', 'p:coeur').permis, 'tout le monde va bien : le baume et le Cœur vaillant sont éteints');
  /* le baume : le plus blessé, en part de sa vie */
  c.h.pisteur.pv = 70; c.h.sage.pv = 60;
  egal(c.auto('alchimiste', 'p:baume'), ['pisteur'], 'le baume va tout seul au plus blessé, en part de sa vie (le Pisteur à 70/120, pas le Sage à 60/90)');
  var ev = geste(c, 'alchimiste', 'p:baume');
  egal([ev[0].t, ev[0].cible, c.h.pisteur.pv], ['geste', 'pisteur', 110], '… un toucher, pas de cible à choisir');
  /* le Cœur vaillant */
  c.h.sage.sol = true; c.h.sage.pv = 0;
  egal(c.auto('alchimiste', 'p:coeur'), ['sage'], 'le Cœur vaillant relève celui qui est à terre');
  c.h.pisteur.sol = true; c.h.pisteur.pv = 0;
  var vus = {}; for(var i = 0; i < 40; i++) vus[c.auto('alchimiste', 'p:coeur', null, true)[0]] = 1;
  ok(vus.sage && vus.pisteur && Object.keys(vus).length === 2, 'deux héros à terre : l\'un des deux, au hasard (Romain)');
  var av = JSON.stringify(c.leo), r0 = c.R; var tires = 0; c.R = function(){ tires++; return r0(); };
  for(i = 0; i < 20; i++) c.barre();
  ok(tires === 0, 'afficher la rangée d\'icônes ne touche pas au hasard du combat (le combat ne dépend pas du nombre d\'images)');
  c.R = r0;
  /* le bouclier jaune */
  c = combat(1); c.h.alchimiste.pv = 30;
  egal(c.auto('sage', 'bouclier'), ['alchimiste'], 'le bouclier jaune, sans la rune de l\'œil : sur le plus blessé');
  geste(c, 'sage', 'oeil'); jusque(c, leo('prise', 'charge')); D.ORDRE.forEach(function(h){ c.h[h].sol = false; c.h[h].act = null; c.h[h].pv = h === 'alchimiste' ? 30 : c.h[h].pvMax; });
  var proie = c.leo.cibles[0];
  egal(c.auto('sage', 'bouclier'), [proie], 'avec la rune de l\'œil : sur celui que Léo vise (' + proie + ')');
  c.h[proie].bouclier = 'jaune';
  ok(c.auto('sage', 'bouclier')[0] !== proie, 'un héros déjà protégé n\'en reçoit pas un deuxième');
  /* ce qu'on lance va sur Léo ; la rune sur un rat */
  c = combat(2); jusqueG(c, leo('impact', 'sifflet'));
  var rats = c.ratsVivants().map(function(r){ return r.id; });
  egal([c.auto('alchimiste', 'p:huile'), c.auto('sage', 'rune'), c.auto('pisteur', 'dague'), c.auto('pisteur', 'l:marteau')], [['leo'], [rats[0]], [rats[0]], ['leo']], 'phase 2 : l\'huile va sur Léo, la rune sur un rat, la dague sur ce qui est devant, le marteau sur Léo');
  D.ORDRE.forEach(function(h){ c.h[h].act = null; c.h[h].etourdi = 0; });
  geste(c, 'sage', 'rune');
  egal(c.auto('sage', 'rune'), [rats[1]], 'la rune suivante va sur le rat qui n\'est pas encore ébloui');
  /* l'acide : sur un rat cuirassé, rien d'autre */
  ok(!c.barre().filter(function(x){ return x.geste === 'p:acide'; })[0].permis, 'l\'acide, sans rat cuirassé : éteint');
  c.rats.forEach(function(r){ r.mort = true; }); jusqueG(c, leo('impact', 'sifflet'));
  var cuir = c.ratsVivants().filter(function(r){ return r.type === 'ratcuir'; })[0];
  D.ORDRE.forEach(function(h){ c.h[h].act = null; c.h[h].etourdi = 0; });
  egal(c.auto('alchimiste', 'p:acide'), [cuir.id], 'l\'acide va sur un rat cuirassé…');
  geste(c, 'alchimiste', 'p:acide');
  ok(cuir.nu && c.auto('alchimiste', 'p:acide')[0] !== cuir.id, '… et ronge son armure ; le suivant va sur l\'autre');
  /* la gourde */
  c = combat(3); c.h.sage.pv = 20;
  egal(c.auto('pisteur', 'l:gourde'), ['sage'], 'phase 3 : la gourde va au plus blessé');
  /* l'œil : une fois ouvert, son icône a fini de servir */
  c = combat(1); geste(c, 'sage', 'oeil');
  ok(!c.barre().some(function(x){ return x.geste === 'oeil'; }), 'la rune de l\'œil ouverte, son icône disparaît');
  /* un héros pris : ses icônes sont éteintes */
  c = combat(1); c.agir('pisteur', 'dague');
  ok(c.barre().filter(function(x){ return x.heros === 'pisteur'; }).every(function(x){ return !x.permis && x.mot === L.MOTS.occupe; }) && ic(c, 'alchimiste', 'p:feu').permis, 'pendant son geste, les icônes d\'un héros sont éteintes ; celles des autres non');
})();

section('La rune de l\'œil : ses trois prochaines attaques');
(function(){
  var c = combat(1);
  egal(c.etat().leo.suite, null, 'sans la rune de l\'œil : rien');
  geste(c, 'sage', 'oeil');
  var s = c.etat().leo.suite;
  egal(s.map(function(x){ return x.att; }), ['fleau', 'charge', 'marteau'], 'la rune ouverte : ses trois prochaines attaques, dans l\'ordre');
  ok(s.every(function(x){ return x.ic && x.nom; }), 'chacune a son icône');
  jusque(c, leo('prise', 'fleau'));
  s = c.etat().leo.suite;
  ok(s[0].att === 'fleau' && s[0].enCours && s[1].att === 'charge' && s[2].att === 'marteau', 'pendant qu\'il prépare le fléau : le fléau (en cours), puis la charge, puis le marteau');
  jusqueG(c, leo('retour', 'fleau'));
  egal(c.etat().leo.suite.map(function(x){ return x.att; }), ['charge', 'marteau', 'meule'], 'le fléau passé : la charge, le marteau, la meule');
  ok(Object.keys(L.ATTAQUES).every(function(a){ return !!L.ATTAQUES[a].ic; }), 'toutes ses attaques ont une icône');
  c = combat(2); geste(c, 'sage', 'oeil'); jusqueG(c, leo('retour', 'sifflet'));
  var k = c.leo.k; c.leo.k = L.ORDRE[2].length - 1;
  egal(c.etat().leo.suite[0].att, 'poing', 'phase 2 : tant que ses deux rats sont là, le sifflet est sauté');
  c.leo.k = k;
})();

section('La charge se prépare assez longtemps pour l\'huile (Romain, 14 novembre)');
(function(){
  var A = L.ATTAQUES.charge, prepa = A.prise + A.elan;
  ok(prepa - L.DUREES.potion.impact >= 1.5 && prepa - L.DUREES.fleche.impact >= 2.5, 'il se prépare ' + prepa.toFixed(1) + ' s : une fiole d\'huile (2,5 s) laisse ' + (prepa - L.DUREES.potion.impact).toFixed(1) + ' s pour réagir, une flèche ' + (prepa - L.DUREES.fleche.impact).toFixed(1) + ' s');
  var c = combat(1), ev; jusque(c, leo('impact', 'fleau')); D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].act = null; c.h[h].etourdi = 0; });
  jusque(c, leo('prise', 'charge')); c.avancer(1.5);
  c.agir('alchimiste', 'p:huile');
  ev = jusque(c, function(e){ return e.t === 'leo' && (e.quoi === 'glisse' || e.quoi === 'impact'); });
  ok(!!trouve(ev, 'leo', function(e){ return e.quoi === 'glisse'; }), 'une fiole d\'huile lancée une seconde et demie APRÈS qu\'il s\'est mis en position : il glisse quand même');
})();

section('Phase 1 → phase 2 : la vie revient, les armes sont ramassées');
(function(){
  var c = combat(1), ev;
  c.leo.pv = 6050; c.h.pisteur.pv = 12; c.h.sage.sol = true; c.h.sage.pv = 0;
  ev = geste(c, 'pisteur', 'dague', 'leo');
  ok(trouve(ev, 'phase-fin') && c.fini() === 'phase' && c.leo.pv === 6000, 'à 6 000, la phase 1 s\'arrête net (le coup ne déborde pas)');
  egal(c.avancer(5), [], 'pendant la cinématique, plus rien ne bouge');
  ev = c.phaseSuivante();
  egal([c.phase, c.fini(), ev[0].t], [2, null, 'phase'], 'la phase 2 commence');
  egal(D.ORDRE.map(function(h){ return [c.h[h].pv, c.h[h].sol]; }), [[90, false], [100, false], [120, false]], 'tous les héros ont toute leur vie (Romain)');
  egal(c.etat().armes, {crochet:3, fleau:3, marteau:3}, 'le Pisteur ramasse le crochet, le fléau et le marteau : trois coups chacun');
  ok(g1(c, 'pisteur', 'l:crochet').reste === 3 && g1(c, 'pisteur', 'l:marteau').permis, 'elles sont dans ses cartes');
})();

section('Phase 2 — les armes ramassées');
(function(){
  var c = combat(2), ev, pv = c.leo.pv;
  c.leo.fin += 1000;                                   /* (Léo attend : on regarde les armes) */
  ev = geste(c, 'pisteur', 'l:crochet', 'leo');
  egal(pv - c.leo.pv, L.COUPS.crochet, 'le crochet sur Léo : comme deux coups de dague (' + L.COUPS.crochet + ')');
  egal(L.COUPS.crochet, 2 * L.COUPS.dague, '… exactement deux');
  geste(c, 'pisteur', 'l:crochet', 'leo'); ev = geste(c, 'pisteur', 'l:crochet', 'leo');
  ok(trouve(ev, 'arme', function(e){ return e.nom === 'crochet' && e.reste === 0; }) && !g1(c, 'pisteur', 'l:crochet') && c.refus('pisteur', 'l:crochet', 'leo') === L.MOTS.casse, 'au troisième coup il casse, et quitte la bande');
  pv = c.leo.pv; ev = geste(c, 'pisteur', 'l:fleau', 'leo');
  ok(pv - c.leo.pv === L.COUPS.fleau && L.COUPS.fleau < L.COUPS.dague, 'le fléau sur Léo tout seul : moins fort que la dague (' + L.COUPS.fleau + ')');
  /* le marteau coupe la gourde */
  c = combat(2);
  ev = jusqueG(c, leo('prise', 'gourde'), 120, true);
  D.ORDRE.forEach(function(h){ c.h[h].act = null; });
  c.leo.pv = 4000;
  ev = geste(c, 'pisteur', 'l:marteau', 'leo');
  ok(trouve(ev, 'leo', function(e){ return e.quoi === 'coupe' && e.att === 'gourde'; }) && c.leo.pv === 4000 && !trouve(ev, 'soin-leo'), 'le marteau coupe sa gourde : il ne reprend rien (et le marteau ne fait pas de dégâts)');
  /* sans marteau : il boit */
  c = combat(2); jusqueG(c, leo('prise', 'gourde'), 120, true); c.leo.pv = 4000;
  ev = jusqueG(c, leo('impact', 'gourde'), 20, true);
  egal(c.leo.pv, 4000 + L.ATTAQUES.gourde.soin, 'sans marteau, la gourde lui rend ' + L.ATTAQUES.gourde.soin + ' points de vie');
  c = combat(2); jusqueG(c, leo('prise', 'gourde'), 120, true); c.leo.pv = 5900;
  jusqueG(c, leo('impact', 'gourde'), 20, true);
  egal(c.leo.pv, 6000, '… jamais plus que le début de la phase');
  /* le marteau sur une attaque rapide : rien */
  c = combat(2); jusque(c, leo('impact', 'sifflet'));
  c.rats.forEach(function(r){ r.mort = true; });
  ev = geste(c, 'pisteur', 'l:marteau', 'leo');
  egal(c.etat().armes.marteau, 2, 'un coup de marteau dans le vide est un coup perdu');
})();

section('Phase 2 — les rats');
(function(){
  var c = combat(2), ev;
  ev = jusque(c, leo('impact', 'sifflet'));
  var rats = c.etat().rats;
  egal(rats.map(function(r){ return r.type + r.place; }), ['rat0', 'rat1'], 'le sifflet : deux rats, devant Léo (d\'abord des rats d\'égout)');
  egal(c.refus('pisteur', 'dague', 'leo'), L.MOTS.loin, 'la dague ne touche que celui de devant : avec des rats, Léo est trop loin');
  ok(!c.refus('pisteur', 'fleche', 'leo'), 'les flèches, elles, l\'atteignent toujours');
  D.ORDRE.forEach(function(h){ c.h[h].act = null; });
  ev = geste(c, 'pisteur', 'dague', rats[0].id);
  egal(trouve(ev, 'degats', function(e){ return e.cible === rats[0].id; }).n, L.COUPS_RAT.dague, 'la dague sur un rat qui voit clair : presque rien (' + L.COUPS_RAT.dague + ')');
  ev = geste(c, 'sage', 'rune', rats[0].id);
  ok(trouve(ev, 'rat', function(e){ return e.quoi === 'ebloui' && e.id === rats[0].id; }) && c.etat().rats[0].ouvert, 'la rune de lumière l\'éblouit');
  ev = geste(c, 'pisteur', 'dague', rats[0].id);
  ok(trouve(ev, 'rat', function(e){ return e.quoi === 'meurt' && e.id === rats[0].id; }), 'ébloui, la dague l\'abat');
  /* le bâton de lune et le fléau */
  c = combat(2); jusque(c, leo('impact', 'sifflet')); D.ORDRE.forEach(function(h){ c.h[h].act = null; });
  ev = geste(c, 'sage', 'a:cristal-lune');
  egal(tous(ev, 'rat', function(e){ return e.quoi === 'ebloui'; }).length, 2, 'le bâton de lune éblouit les deux rats d\'un coup');
  ev = geste(c, 'pisteur', 'l:fleau', c.etat().rats[0].id);
  egal(tous(ev, 'rat', function(e){ return e.quoi === 'meurt'; }).length, 2, 'le fléau frappe deux cibles : les deux rats éblouis tombent ensemble (Romain)');
  c = combat(2); jusque(c, leo('impact', 'sifflet')); D.ORDRE.forEach(function(h){ c.h[h].act = null; });
  geste(c, 'sage', 'a:cristal-lune'); c.avancer(L.EBLOUI + .2);
  ok(!c.etat().rats[0].ouvert, 'l\'aveuglement ne dure que ' + L.EBLOUI + ' secondes');
  /* le crochet */
  c = combat(2); jusque(c, leo('impact', 'sifflet')); D.ORDRE.forEach(function(h){ c.h[h].act = null; });
  ev = geste(c, 'pisteur', 'l:crochet', c.etat().rats[0].id);
  ok(!!trouve(ev, 'rat', function(e){ return e.quoi === 'meurt'; }), 'le crochet tue un rat d\'un coup');
  /* la deuxième vague : des cuirassés */
  c = combat(2); jusque(c, leo('impact', 'sifflet')); c.rats.forEach(function(r){ r.mort = true; });
  function soigner(){ D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].saigne = false; c.h[h].etourdi = 0; c.h[h].act = null; }); }
  var n = 0; while(n++ < 4000 && c.etat().rats.length === 0){ c.avancer(.05); soigner(); }
  rats = c.etat().rats;
  egal(rats.map(function(r){ return r.type; }), ['ratcuir', 'ratcuir'], 'la deuxième vague : deux rats cuirassés');
  soigner();
  ev = geste(c, 'sage', 'rune', rats[0].id);
  ok(!c.etat().rats[0].ouvert, 'sur l\'armure, la lumière glisse');
  soigner(); ev = geste(c, 'pisteur', 'l:crochet', rats[0].id);
  ok(trouve(ev, 'rat', function(e){ return e.quoi === 'nu'; }) && c.etat().rats[0].nu && c.etat().rats[0].ouvert, 'le crochet casse l\'armure d\'un rat cuirassé');
  soigner(); ev = geste(c, 'pisteur', 'l:crochet', rats[0].id);
  ok(!!trouve(ev, 'rat', function(e){ return e.quoi === 'meurt'; }), '… et le coup d\'après le tue (Romain)');
  soigner(); ev = geste(c, 'alchimiste', 'p:acide', rats[1].id);
  ok(c.etat().rats[0].nu, 'l\'acide ronge l\'armure aussi');
  soigner(); ev = geste(c, 'pisteur', 'dague', rats[1].id);
  ok(!!trouve(ev, 'rat', function(e){ return e.quoi === 'meurt'; }), 'sans armure, la dague l\'abat');
  /* la louche les enrage */
  c = combat(2); jusque(c, leo('impact', 'sifflet')); D.ORDRE.forEach(function(h){ c.h[h].act = null; });
  ev = geste(c, 'alchimiste', 'louche', c.etat().rats[0].id);
  ok(c.etat().rats[0].enrage, 'le piège du donjon tient toujours : le BONG enrage le rat (il mordra deux fois)');
})();

section('Phase 2 — le poing, la faux, le saut');
(function(){
  var c = combat(2), ev;
  jusque(c, leo('impact', 'sifflet')); c.rats.forEach(function(r){ r.mort = true; });
  D.ORDRE.forEach(function(h){ c.h[h].bouclier = 'jaune'; });
  ev = jusque(c, leo('impact', 'poing'));
  ok(D.ORDRE.every(function(h){ return !c.h[h].bouclier; }) && tous(ev, 'degats', function(e){ return e.cause === 'poing'; }).length === 3, 'le coup de poing : tout le monde, et tous les boucliers sautent');
  ev = jusque(c, leo('impact', 'faux'));
  ok(D.ORDRE.every(function(h){ return c.h[h].saigne; }), 'la faux : les trois héros saignent');
  var pv0 = c.h.pisteur.pv; c.leo.fin += 100;
  c.avancer(2);
  egal(pv0 - c.h.pisteur.pv, 2 * 2 * L.SAIGNE.n, 'le saignement : ' + L.SAIGNE.n + ' points, deux fois par seconde (Romain)');
  c.avancer(3);
  ok(c.h.pisteur.saigne, 'il ne s\'arrête pas tout seul');
  D.ORDRE.forEach(function(h){ c.h[h].pv = Math.max(c.h[h].pv, 40); });
  ev = geste(c, 'alchimiste', 'herbes');
  ok(D.ORDRE.every(function(h){ return !c.h[h].saigne; }) && tous(ev, 'soin').length === 3, 'les herbes : 15 pour chacun, et plus personne ne saigne (n\'importe quel soin l\'arrête)');
  /* le bouclier jaune empêche le saignement ; le chêne non */
  c = combat(2); jusque(c, leo('impact', 'sifflet')); c.rats.forEach(function(r){ r.mort = true; });
  jusque(c, leo('impact', 'poing')); c.h.pisteur.bouclier = 'jaune'; c.h.alchimiste.bouclier = 'chene';
  jusque(c, leo('impact', 'faux'));
  egal([c.h.pisteur.saigne, c.h.alchimiste.saigne, c.h.sage.saigne], [false, true, true], 'le bouclier jaune empêche de saigner ; le bouclier de chêne, non');
  /* le saut */
  c = combat(2); jusque(c, leo('impact', 'sifflet')); c.rats.forEach(function(r){ r.mort = true; });
  function soigner(){ D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].saigne = false; c.h[h].etourdi = 0; c.h[h].act = null; c.h[h].bouclier = null; }); }
  ['poing', 'faux', 'charge', 'lancer', 'gourde'].forEach(function(a){ jusque(c, leo('impact', a), 60); soigner(); });
  c.h.alchimiste.bouclier = 'jaune';
  ev = jusque(c, leo('impact', 'saut'), 60);
  egal([c.h.pisteur.etourdi > c.t, c.h.sage.etourdi > c.t, c.h.alchimiste.etourdi > c.t], [true, true, false], 'le saut étourdit tout le monde, sauf celui qui a un bouclier jaune (l\'Alchimiste peut encore soigner)');
  var lr = tous(jusqueG(combat(2), leo('impact', 'lancer'), 80, true), 'degats', function(e){ return e.cause === 'lancer'; });
  ok(lr.length === 2 && lr[0].heros === lr[1].heros && lr[0].brut === L.ATTAQUES.lancer.degats, 'le lancer de rat : le rat mord deux fois le même héros');
})();

section('Phase 3 — insensible, sauf au saignement');
(function(){
  var c = combat(3), ev;
  egal(c.etat().armes, {faux:3, gourde:3}, 'le Pisteur ramasse la faux et la gourde (le marteau est cassé)');
  ev = geste(c, 'pisteur', 'dague', 'leo');
  ok(c.leo.pv === 3000 && trouve(ev, 'degats', function(e){ return e.cible === 'leo'; }).n === 0 && trouve(ev, 'degats', function(e){ return e.cible === 'leo'; }).mot === L.MOTS.insensible, 'la dague : « Insensible ! »');
  ev = geste(c, 'alchimiste', 'p:feu', 'leo');
  ok(c.leo.pv === 3000 && !c.etat().leo.brule, 'le feu non plus');
  function soigner(){ D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].etourdi = 0; c.h[h].brule = 0; c.h[h].act = null; }); }
  soigner(); ev = geste(c, 'pisteur', 'l:faux', 'leo');
  egal(c.etat().leo.saigne, 1, 'la faux le fait saigner');
  soigner(); geste(c, 'pisteur', 'l:faux', 'leo'); soigner(); geste(c, 'pisteur', 'l:faux', 'leo');
  egal([c.etat().leo.saigne, c.etat().armes.faux], [3, 0], 'trois coups de faux : trois saignements, et la faux casse');
  var pv = c.leo.pv; c.leo.fin += 1000; soigner();
  c.avancer(10);
  egal(pv - c.leo.pv, 10 * 2 * 3 * L.SAIGNE.n, 'trois saignements : 15 toutes les demi-secondes, 30 par seconde (Romain)');
  egal(Math.round(3000 / (2 * 3 * L.SAIGNE.n)), 100, '… soit 100 secondes pour ses 3 000 points de vie : il faut tenir 1 minute 40');
  var n = 0; while(!c.fini() && n++ < 3000){ c.avancer(.05); soigner(); }
  egal([c.fini(), c.leo.pv], ['victoire', 0], 'quand le saignement l\'a vidé : victoire');
  /* la gourde */
  c = combat(3); c.h.sage.pv = 9;
  ev = geste(c, 'pisteur', 'l:gourde', 'sage');
  egal([c.h.sage.pv, c.etat().armes.gourde], [90, 2], 'la gourde rend toute sa vie à qui on veut (Romain) ; trois gorgées');
  /* le givre le ralentit */
  c = combat(3); ev = geste(c, 'pisteur', 'p:givre', 'leo');
  ok(c.etat().leo.ralenti, 'le givre le ralentit (dans les trois phases)');
  var tl0 = c.leo.tl; c.avancer(2);
  ok(Math.abs((c.leo.tl - tl0) - 2 * L.RALENTI.k) < .06, 'ralenti, son temps passe presque deux fois moins vite');
})();

section('Phase 3 — ses attaques');
(function(){
  var c = combat(3), ev;
  function soigner(){ D.ORDRE.forEach(function(h){ c.h[h].pv = c.h[h].pvMax; c.h[h].sol = false; c.h[h].etourdi = 0; c.h[h].brule = 0; c.h[h].act = null; c.h[h].bouclier = null; }); }
  ev = jusque(c, leo('impact', 'poing3'));
  egal(trouve(ev, 'degats', function(e){ return e.cause === 'poing3'; }).n, 30, 'le coup de poing : 30 (Romain)');
  soigner(); ev = jusque(c, leo('impact', 'rafale'));
  var d = trouve(ev, 'degats', function(e){ return e.cause === 'rafale'; });
  egal(d.n, Math.round(c.h[d.heros].pvMax * .8), 'la rafale : 80 % de la vie du héros (Romain)');
  soigner(); jusque(c, leo('prise', 'charge')); c.leo.flaque = c.t + 5;
  ev = jusque(c, function(e){ return e.t === 'leo' && (e.quoi === 'glisse' || e.quoi === 'impact'); });
  ok(!!trouve(ev, 'leo', function(e){ return e.quoi === 'glisse'; }), 'la charge se pare toujours à l\'huile ou à la colle');
  soigner(); jusque(c, leo('debout')); soigner(); c.h.alchimiste.bouclier = 'jaune';
  ev = jusque(c, leo('impact', 'hurlement'));
  egal([c.h.pisteur.etourdi > c.t, c.h.alchimiste.etourdi > c.t], [true, false], 'le hurlement étourdit tout le monde ; le bouclier jaune l\'arrête');
  soigner(); ev = jusque(c, leo('impact', 'attrape'));
  var da = tous(ev, 'degats', function(e){ return e.cause === 'attrape'; });
  ok(da.length === 2 && da[0].heros !== da[1].heros && da.every(function(e){ return e.n === Math.round(c.h[e.heros].pvMax * L.ATTAQUES.attrape.part); }), 'il attrape un héros et frappe un autre avec : de gros dégâts sur les deux');
  ok(D.ORDRE.every(function(h){ return !c.h[h].attrape; }), 'le héros attrapé peut encore jouer (Romain)');
  soigner(); ev = jusque(c, leo('impact', 'souffle'));
  ok(D.ORDRE.every(function(h){ return c.h[h].brule > c.t; }), 'le souffle de feu : tout le monde brûle');
  var pv = c.h.pisteur.pv; c.leo.fin += 100; c.avancer(L.BRULE.duree + .3);
  egal([pv - c.h.pisteur.pv, c.etat().heros.pisteur.brule], [L.BRULE.n * (L.BRULE.duree / L.BRULE.pas - 1), false], 'la brûlure s\'arrête toute seule (Romain)');
  /* le bouclier jaune empêche d'être attrapé : le coup est raté pour les deux */
  c = combat(3); jusque(c, leo('impact', 'poing3'));
  ['rafale', 'charge', 'hurlement'].forEach(function(a){ jusque(c, leo('impact', a), 40); soigner(); });
  soigner(); jusque(c, leo('prise', 'attrape'), 40);
  var proie = c.leo.cibles[0]; c.h[proie].bouclier = 'jaune';
  ev = jusque(c, leo('impact', 'attrape'));
  ok(!trouve(ev, 'degats', function(e){ return e.cause === 'attrape'; }), 'un bouclier jaune sur celui qu\'il veut attraper : raté, personne n\'est frappé');
})();

section('La défaite');
(function(){
  var c = combat(1), ev = [];
  while(!c.fini()) ev = ev.concat(c.avancer(.1));
  egal([c.fini(), trouve(ev, 'fin').resultat, trouve(ev, 'fin').phase], ['defaite', 'defaite', 1], 'les trois héros au sol : défaite (sans rien faire, on ne tient pas une minute)');
  ok(c.t < 60, '… en moins d\'une minute');
  c = combat(2); c.h.sage.sol = true; c.h.sage.pv = 0;
  ev = geste(c, 'alchimiste', 'p:coeur', 'sage');
  egal([c.h.sage.sol, c.h.sage.pv], [false, 40], 'le cœur vaillant relève un ami');
  c.avancer(.5); c.h.sage.sol = true; c.h.sage.pv = 0;
  egal(c.refus('alchimiste', 'p:coeur', 'pisteur'), L.MOTS.debout, 'pas sur un héros debout');
})();

console.log(echecs.length ? '\n' + echecs.length + ' ÉCHEC(S) :\n  - ' + echecs.join('\n  - ') + '   (' + nOk + ' vérifications réussies)' : '\nTOUT EST VERT   (' + nOk + ' vérifications réussies)');
process.exit(echecs.length ? 1 : 0);
