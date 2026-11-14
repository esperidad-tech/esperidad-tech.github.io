/* leo-sim.js — LA DIFFICULTÉ DU COMBAT DE LÉO, PROUVÉE PAR LA SIMULATION (Romain, 13 novembre 2026, 17 h 29).
     node leo-sim.js [parties] [--md]         (300 parties par ligne par défaut ; --md : le rapport en Markdown, pour leo-equilibre.md)

   Romain : « il faut 3 simulations : un joueur un peu lent, un joueur normal et un joueur rapide. Je veux qu'un joueur rapide
   s'en sorte, avec pas mal de déboires. Un joueur moyen, il ne va pas s'en sortir. Et un joueur lent, impossible. » Et, pour la
   phase 3 : « à la fin des 1 minute 40, qu'il y ait deux personnes à terre, au moins, et un à qui il reste pas beaucoup de vie ».

   Un joueur = UNE paire de mains (un seul joueur tient la tablette). Chaque geste coûte : le temps de se décider (reac), puis
   UN toucher, à « tap » secondes (depuis le 14 novembre : une seule rangée d'icônes, plus de héros à choisir, plus de cible à
   toucher — c.barre(), c.agir(heros, geste) ; avant : jusqu'à quatre touchers par geste).
   Les animations, elles, durent ce qu'elles durent (LeoRegles.L.DUREES, mesurées dans la page). Le joueur ne voit ce que Léo
   prépare qu'après son temps de réaction.
     rapide : il connaît l'ordre des attaques par cœur (il anticipe : l'huile avant la charge, le bouclier avant le coup)
     moyen  : il réagit à ce qu'il voit, sans anticiper, et se trompe parfois
     lent   : il réagit tard, et se trompe souvent */
'use strict';
var R = require('./src/regles.js'), LR = require('./src/leo-regles.js'), D = R.D, L = LR.L;
var N = +process.argv[2] > 0 ? +process.argv[2] : 300, MD = process.argv.indexOf('--md') >= 0;
/* pour essayer d'autres chiffres sans toucher aux règles : LEO='{"CALME":{"3":1.2},"ATTAQUES":{"rafale":{"part":0.7}}}' node leo-sim.js */
(function fusion(a, b){ for(var k in b){ if(b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') fusion(a[k], b[k]); else a[k] = b[k]; } })(L, process.env.LEO ? JSON.parse(process.env.LEO) : {});

var JOUEURS = {
  rapide:{nom:'Rapide', reac:.30, tap:.28, erreur:.03, anticipe:true},
  moyen:{nom:'Moyen', reac:.65, tap:.45, erreur:.10, anticipe:false},
  lent:{nom:'Lent', reac:1.1, tap:.7, erreur:.22, anticipe:false}
};

function partie(graine){
  var p = R.nouvellePartie(graine);
  p.recettes = D.ORDRE_RECETTES.slice();                                  /* les sept potions, le givre, le baume lumineux */
  p.heros.sage.objets.push('cristal-lune', 'baton-chene');
  p.heros.pisteur.objets.push('fleches-lourdes', 'fleches-argent');
  return p;
}

/* ---------- ce que le joueur décide de faire, maintenant (null : rien) ---------- */
function decider(c, J, M, rnd){
  var E = c.etat(), Z = E.leo, t = c.t, H = E.heros, ph = E.phase;
  function libre(h){ return H[h].libre; }
  /* (14 novembre) il n'a que la rangée d'icônes de la phase ; chaque icône choisit sa cible toute seule */
  var B = c.barre();
  function a(h, geste){ for(var i = 0; i < B.length; i++) if(B[i].heros === h && B[i].geste === geste) return B[i].permis ? B[i] : null; return null; }
  function part(h){ return H[h].sol ? 9 : H[h].pv / H[h].pvMax; }
  var debout = D.ORDRE.filter(function(h){ return !H[h].sol; }), parVie = debout.slice().sort(function(x, y){ return part(x) - part(y); });
  var nus = debout.filter(function(h){ return !H[h].bouclier; }).sort(function(x, y){ return part(x) - part(y); });
  /* ce qu'il sait de l'attaque en cours : il la voit après son temps de réaction (jamais dans le noir) ; le joueur rapide, lui,
     connaît l'ordre par cœur */
  var att = null, cibles = [], reste = 0;
  if(Z.att && (Z.etape === 'prise' || Z.etape === 'elan')){
    var vue = M.vuDepuis !== null && t - M.vuDepuis >= J.reac;
    if(vue || J.anticipe){ att = Z.att; reste = Z.reste + (Z.etape === 'prise' ? L.ATTAQUES[Z.att].elan : 0); if(Z.vise) cibles = Z.vise.cibles; }
  }
  var prochaine = null;
  if(J.anticipe && Z.etape === 'repos'){ var o = L.ORDRE[ph]; prochaine = o[(M.k + 1) % o.length]; }
  function bouc(l){
    l = l.filter(function(h){ return h && !H[h].sol && !H[h].bouclier; });
    if(!l.length || !libre('sage')) return null;
    if(l.length > 1 && a('sage', 'a:baton-chene')) return {heros:'sage', geste:'a:baton-chene'};          /* (les trois héros d'un coup) */
    return a('sage', 'bouclier') ? {heros:'sage', geste:'bouclier'} : null;
  }
  /* (le bouclier jaune choisit tout seul : celui que Léo vise si l'œil est ouvert, sinon le plus blessé) */
  function jaune(h){ if(!h || H[h].sol || H[h].bouclier === 'jaune' || !libre('sage') || !a('sage', 'bouclier')) return null; return {heros:'sage', geste:'bouclier'}; }
  function potion(r, cible){
    /* la flèche du Pisteur arrive plus vite (1,6 s) que la fiole de l'Alchimiste (2,5 s) */
    if(libre('pisteur') && a('pisteur', 'p:' + r) && a('pisteur', 'p:' + r).auto.indexOf(cible) >= 0) return {heros:'pisteur', geste:'p:' + r};
    if(libre('alchimiste') && a('alchimiste', 'p:' + r) && a('alchimiste', 'p:' + r).auto.indexOf(cible) >= 0) return {heros:'alchimiste', geste:'p:' + r};
    return null;
  }
  var x;
  /* le joueur rapide se garde des mains libres : l'Alchimiste avant la faux et le souffle (il faudra soigner tout de suite), le
     Pisteur avant la gourde (le marteau) */
  var gardeAl = J.anticipe && (att === 'faux' || prochaine === 'faux' || att === 'souffle' || att === 'saut' || att === 'hurlement');
  var gardePi = J.anticipe && (att === 'gourde' || prochaine === 'gourde') && !!a('pisteur', 'l:marteau');
  /* 1. le noir : le bâton de lune, tout de suite */
  if(E.noir && libre('sage') && a('sage', 'a:cristal-lune')) return {heros:'sage', geste:'a:cristal-lune', baton:'cristal-lune'};
  /* 1 ter. la gourde : le marteau, avant tout le reste (Romain : « le marteau, c'est pour la gourde ») */
  if(att === 'gourde' && libre('pisteur') && a('pisteur', 'l:marteau') && reste > .75 + J.reac + 2 * J.tap) return {heros:'pisteur', geste:'l:marteau', cible:'leo'};
  /* 1 bis. ça saigne : un soin, tout de suite (les herbes soignent tout le monde d'un coup) */
  var saignent0 = debout.filter(function(h){ return H[h].saigne; });
  if(saignent0.length){
    if(libre('alchimiste') && a('alchimiste', 'herbes')) return {heros:'alchimiste', geste:'herbes'};
    if(libre('pisteur') && a('pisteur', 'l:gourde') && (H.alchimiste.sol || H.alchimiste.etourdi)) return {heros:'pisteur', geste:'l:gourde', cible:saignent0.sort(function(u, v){ return part(u) - part(v); })[0]};
  }
  /* 2. un ami au sol : le cœur vaillant */
  var bas = D.EXPOSES.filter(function(h){ return H[h].sol; });
  if(bas.length && libre('alchimiste') && a('alchimiste', 'p:coeur')) return {heros:'alchimiste', geste:'p:coeur', cible:bas[0]};
  /* 3. la farine ne retombe plus toute seule : le feu (BOUM — et l'ami attrapé en sort) */
  if(Z.nuage && !E.noir){ x = potion('feu', 'leo'); if(x) return x; }
  /* 4. ce que Léo prépare */
  var cible0 = cibles[0] || parVie[0];
  if(att === 'charge' || prochaine === 'charge'){
    if(!Z.flaque && !Z.nuage){
      /* (la flèche du Pisteur d'abord ; l'Alchimiste seulement s'il n'a pas mieux à faire) */
      if(libre('pisteur') && a('pisteur', 'p:huile')) return {heros:'pisteur', geste:'p:huile', cible:'leo'};
      if(!gardeAl && libre('alchimiste') && a('alchimiste', 'p:huile') && reste + (prochaine ? 3 : 0) > 2.6 + 2 * J.tap + J.reac) return {heros:'alchimiste', geste:'p:huile', cible:'leo'};
    }
  }
  if(att === 'gourde' && libre('pisteur') && a('pisteur', 'l:marteau')) return {heros:'pisteur', geste:'l:marteau', cible:'leo'};
  if(att === 'fleau' || prochaine === 'fleau' || att === 'meule' || prochaine === 'meule'){ x = bouc(cibles.length > 1 && att === 'fleau' ? cibles : nus); if(x) return x; }
  if(att === 'marteau' || att === 'crochet' || att === 'rafale' || att === 'attrape'){ x = jaune(cible0); if(x) return x; }
  if(att === 'saut' || att === 'hurlement' || prochaine === 'saut' || prochaine === 'hurlement'){ x = jaune(H.alchimiste.sol ? parVie[0] : 'alchimiste'); if(x) return x; }
  if(att === 'souffle' || att === 'faux'){ x = jaune(H.alchimiste.sol ? parVie[0] : 'alchimiste'); if(x) return x; }
  /* 5. les soins */
  if(libre('alchimiste')){
    var blesses = debout.filter(function(h){ return part(h) < .78; });
    if(parVie.length && part(parVie[0]) < .55 && !(gardeAl && part(parVie[0]) > .3)){
      if(blesses.length >= 2 && part(parVie[0]) > .3 && a('alchimiste', 'herbes')) return {heros:'alchimiste', geste:'herbes'};
      if(a('alchimiste', 'p:baume')) return {heros:'alchimiste', geste:'p:baume', cible:parVie[0]};
    }
    if(blesses.length >= 2 && a('alchimiste', 'herbes')) return {heros:'alchimiste', geste:'herbes'};
  }
  if(ph === 3 && libre('pisteur') && a('pisteur', 'l:gourde') && parVie.length && part(parVie[0]) < .25 && !libre('alchimiste')) return {heros:'pisteur', geste:'l:gourde', cible:parVie[0]};
  if(ph === 3 && libre('pisteur') && a('pisteur', 'l:gourde') && parVie.length && part(parVie[0]) < .3 && Z.saigne >= 3) return {heros:'pisteur', geste:'l:gourde', cible:parVie[0]};
  /* 6. la rune de l'œil, une fois, dans un moment calme */
  if(!E.vu && libre('sage') && Z.etape === 'repos' && a('sage', 'oeil')) return {heros:'sage', geste:'oeil'};
  /* 7. les rats */
  var rats = E.rats.slice().sort(function(u, v){ return u.place - v.place; });
  if(rats.length && !E.noir){
    var front = rats[0], fermes = rats.filter(function(r){ return !r.ouvert; });
    /* les cuirassés : l'acide ronge l'armure (l'Alchimiste et le Pisteur, chacun le sien) ; le crochet, lui, se garde pour Léo */
    var cuirs = rats.filter(function(r){ return r.type === 'ratcuir' && !r.nu; });
    if(cuirs.length){
      M.acide = M.acide || {};
      var c0 = cuirs.filter(function(r){ return !(M.acide[r.id] > t); })[0];
      if(c0){
        if(libre('pisteur') && !gardePi && a('pisteur', 'p:acide')){ M.acide[c0.id] = t + 2.6; return {heros:'pisteur', geste:'p:acide', cible:c0.id}; }
        if(libre('alchimiste') && !gardeAl && a('alchimiste', 'p:acide')){ M.acide[c0.id] = t + 3.6; return {heros:'alchimiste', geste:'p:acide', cible:c0.id}; }
      }
    }
    if(fermes.length && libre('sage')){
      if(a('sage', 'a:cristal-lune') && fermes.filter(function(r){ return r.type !== 'ratcuir' || r.nu; }).length > 1) return {heros:'sage', geste:'a:cristal-lune', baton:'cristal-lune'};
      var f0 = fermes.filter(function(r){ return r.type !== 'ratcuir' || r.nu; })[0];
      if(f0 && a('sage', 'rune')) return {heros:'sage', geste:'rune', cible:f0.id};
    }
    if(libre('pisteur') && !gardePi){
      if(rats.length > 1 && rats[0].ouvert && rats[1].ouvert && a('pisteur', 'l:fleau')) return {heros:'pisteur', geste:'l:fleau', cible:front.id};
      if(front.ouvert && a('pisteur', 'dague')) return {heros:'pisteur', geste:'dague', cible:front.id};
      /* Léo est au sol et un dernier rat barre la route : le crochet le règle d'un coup */
      if(Z.auSol && rats.length === 1 && !(front.type === 'ratcuir' && !front.nu) && a('pisteur', 'l:crochet')) return {heros:'pisteur', geste:'l:crochet', cible:front.id};
    }
  }
  /* 8. faire mal à Léo */
  if(libre('pisteur') && !E.noir && !gardePi){
    if(ph === 3){ if(a('pisteur', 'l:faux')) return {heros:'pisteur', geste:'l:faux', cible:'leo'}; }
    else if(!Z.nuage){
      if(!rats.length){
        if(Z.auSol && a('pisteur', 'dague')) return {heros:'pisteur', geste:'dague', cible:'leo'};
        if(a('pisteur', 'l:crochet')) return {heros:'pisteur', geste:'l:crochet', cible:'leo'};
        if(a('pisteur', 'dague')) return {heros:'pisteur', geste:'dague', cible:'leo'};
      }
    }
  }
  if(libre('alchimiste') && !gardeAl && ph < 3 && !E.noir && !Z.nuage && !Z.brule && a('alchimiste', 'p:feu') && a('alchimiste', 'p:feu').auto.indexOf('leo') >= 0) return {heros:'alchimiste', geste:'p:feu'};
  /* phase 3 : le givre le ralentit pendant qu'il saigne */
  if(ph === 3 && Z.saigne && !Z.ralenti && !E.noir){ x = potion('givre', 'leo'); if(x && !(gardeAl && x.heros === 'alchimiste')) return x; }
  /* 9. le Sage, libre : un bouclier jaune d'avance, sur le plus abîmé */
  if(libre('sage') && nus.length){ x = jaune(nus[0]); if(x) return x; }
  return null;
}
/* une étourderie : un geste permis, pris au hasard */
function auHasard(c, rnd){
  var l = c.barre().filter(function(g){ return g.permis; });
  if(!l.length) return null;
  var g = l[Math.floor(rnd() * l.length)];
  return {heros:g.heros, geste:g.geste};
}
/* combien de touchers pour ce geste */
function touchers(c, M, d){ return 1; }       /* (14 novembre) une icône, un toucher */

/* ---------- une phase, jouée par un joueur ---------- */
function jouerPhase(phase, J, graine){
  var p = partie(graine), c = LR.combat(p, {phase:phase}), rnd = R.alea(graine * 7919 + phase);
  var M = {sel:'pisteur', baton:'baton', vuDepuis:null, k:-1, mains:0, attente:null};
  var PAS = .05, max = 600, minPv = 1e9, tombes = 0, gestes = 0;
  while(!c.fini() && c.t < max){
    var ev = c.avancer(PAS);
    ev.forEach(function(e){
      if(e.t === 'leo' && e.quoi === 'prise'){ M.vuDepuis = c.t; M.k = L.ORDRE[phase].indexOf(e.att); }
      if(e.t === 'leo' && (e.quoi === 'repos' || e.quoi === 'coupe' || e.quoi === 'glisse')) M.vuDepuis = null;
      if(e.t === 'tombe') tombes++;
    });
    if(c.fini()) break;
    /* le geste en cours de saisie arrive au bout de ses touchers */
    if(M.attente && c.t >= M.attente.t){
      var d = M.attente; M.attente = null;
      M.sel = d.heros; if(d.heros === 'sage' && d.baton) M.baton = d.baton;
      var r = c.agir(d.heros, d.geste);
      if(r[0] && r[0].t !== 'refus') gestes++;
      M.mains = c.t + .05;
    }
    if(!M.attente && c.t >= M.mains){
      var dec = rnd() < J.erreur ? auHasard(c, rnd) : decider(c, J, M, rnd);
      if(dec) M.attente = {t:c.t + J.reac + touchers(c, M, dec) * J.tap, heros:dec.heros, geste:dec.geste, cible:dec.cible, baton:dec.baton};
      else M.mains = c.t + .1;
    }
  }
  var E = c.etat(), tot = 0, sol = 0;
  D.ORDRE.forEach(function(h){ tot += E.heros[h].pv; if(E.heros[h].sol) sol++; });
  return {res:c.fini() || 'temps', t:c.t, pv:tot, sol:sol, tombes:tombes, gestes:gestes, leo:E.leo.pv};
}

function stats(phase, J){
  var g = 0, tg = 0, pv = 0, sol = 0, tomb = 0, tp = 0, sol2 = 0, reste = 0;
  for(var i = 1; i <= N; i++){
    var r = jouerPhase(phase, J, i * 131 + phase * 17);
    if(r.res === 'phase' || r.res === 'victoire'){ g++; tg += r.t; pv += r.pv; sol += r.sol; if(r.sol >= 2) sol2++; }
    else { tp += r.t; reste += r.leo - L.PHASES[phase].a; }
    tomb += r.tombes;
  }
  return {gagne:g / N, duree:g ? tg / g : 0, pv:g ? pv / g : 0, sol:g ? sol / g : 0, sol2:g ? sol2 / g : 0, tombes:tomb / N, perdA:N - g ? tp / (N - g) : 0, reste:N - g ? reste / (N - g) : 0};
}
/* (pour d'autres outils : require('./leo-sim.js') rend les joueurs et une phase jouée, sans écrire le rapport) */
module.exports = {JOUEURS:JOUEURS, jouerPhase:jouerPhase, decider:decider, stats:stats};
if(require.main === module){
function pct(x){ return (x * 100).toFixed(0) + ' %'; }
var out = [];
function dire(s){ out.push(s); }
dire('# Le combat de Léo — la difficulté, par la simulation');
dire('');
dire('> Écrit par `node leo-sim.js ' + N + ' --md`, avec les règles de `src/leo-regles.js`. ' + N + ' parties par ligne. Ne pas corriger à la main.');
dire('');
dire('Chaque phase est un combat à part : on y entre avec toute sa vie (310 points pour les trois héros), et une défaite ramène au début de la phase.');
dire('');
dire('| Phase | Joueur | Phase gagnée | Durée | Vie restante | Héros au sol à la fin | Deux au sol ou plus | Chutes par essai | Quand il perd : au bout de | … et il restait à Léo |');
dire('|---|---|---|---|---|---|---|---|---|---|');
var T = {};
[1, 2, 3].forEach(function(ph){
  ['rapide', 'moyen', 'lent'].forEach(function(j){
    var s = T[ph + j] = stats(ph, JOUEURS[j]);
    dire('| ' + ph + ' | ' + JOUEURS[j].nom + ' | ' + pct(s.gagne) + ' | ' + (s.gagne ? s.duree.toFixed(0) + ' s' : '—') + ' | ' + (s.gagne ? s.pv.toFixed(0) : '—') + ' | ' + (s.gagne ? s.sol.toFixed(1) : '—') + ' | ' + (s.gagne ? pct(s.sol2) : '—') + ' | ' + s.tombes.toFixed(1) + ' | ' + (s.gagne < 1 ? s.perdA.toFixed(0) + ' s' : '—') + ' | ' + (s.gagne < 1 ? s.reste.toFixed(0) + ' PV' : '—') + ' |');
  });
});
dire('');
['rapide', 'moyen', 'lent'].forEach(function(j){
  var p = T['1' + j].gagne * T['2' + j].gagne * T['3' + j].gagne, essais = [1, 2, 3].map(function(ph){ var g = T[ph + j].gagne; return g > 0 ? 1 / g : Infinity; });
  dire('- **' + JOUEURS[j].nom + '** (il se décide en ' + JOUEURS[j].reac + ' s, ' + JOUEURS[j].tap + ' s par toucher, une étourderie sur ' + Math.round(1 / JOUEURS[j].erreur) + ') : les trois phases d\'affilée sans tomber ' + pct(p) + ' des fois ; essais par phase : ' + essais.map(function(e){ return isFinite(e) ? e.toFixed(1) : '∞'; }).join(', ') + '.');
});
console.log(out.join('\n'));
if(MD) require('fs').writeFileSync(require('path').join(__dirname, 'leo-equilibre.md'), out.join('\n') + '\n');
}
