/* Les essais du moteur v2, sans navigateur.
   node tests/regles.js verif            → les règles de la suite des coups et des gestes
   node tests/regles.js parties=6 [robots=0.9] [vie=normal] [eclairs2=10] [pilote=bon|moyen] [debut=2]
                                          → des parties entières en mode seul (mon héros joué par le pilote) */
var P3 = require('../src/regles.js');
var Pilote = require('../src/pilote.js');
var A = {}; process.argv.slice(2).forEach(function (a) { var k = a.split('='); A[k[0]] = k.length > 1 ? k[1] : true; });
var soucis = 0, n = 0;
function non(c, m) { n++; if (!c) { soucis++; if (soucis < 40) console.log('  ✗', m); } }

function verif() {
  [1, 47, 512, 999].forEach(function (partie) {
    var su = P3.suite(partie), su2 = JSON.parse(JSON.stringify(su));
    delete P3.__cache;
    // le hasard partagé : deux calculs, la même suite
    non(JSON.stringify(su2) === JSON.stringify(P3.suite(partie)), 'la même suite deux fois');
    // les infos : jamais à soi-même ; élément et partie de deux joueurs différents
    var parRef = {};
    su.infos.forEach(function (x) {
      if (x.cible) non(x.donneur !== x.cible, 'une info chez celui qu\'elle concerne ' + JSON.stringify(x));
      (parRef[x.ref] = parRef[x.ref] || {})[x.quoi] = x.donneur;
      non(x.tFin > x.tA, 'tFin > tA');
    });
    su.faibles.forEach(function (f) { var p = parRef[f.id]; non(p && p.elem && p.part && p.elem !== p.part, 'élément et partie de deux joueurs différents'); });
    // chacun crie autant
    var c = P3.ROLES.map(function (r) { return su.cris[r]; });
    non(Math.max.apply(null, c) - Math.min.apply(null, c) <= 2, 'chacun crie autant ' + c);
    // sur les 6 premières minutes aussi, à peu près
    var c6 = {}; su.infos.forEach(function (x) { if (x.tA < 360) c6[x.donneur] = (c6[x.donneur] || 0) + 1; });
    var v6 = P3.ROLES.map(function (r) { return c6[r]; });
    non(Math.max.apply(null, v6) - Math.min.apply(null, v6) <= 2, 'équilibre sur 6 minutes ' + v6);
    // la faiblesse : 15 à 20 s une fois montée, 22 à 27 au début ; toujours différente de la précédente
    P3.ROLES.forEach(function (h) {
      var l = su.faibles.filter(function (f) { return f.h === h; });
      for (var i = 1; i < l.length; i++) {
        var d = l[i].t - l[i - 1].t, T = l[i - 1].t;
        if (T < 5) non(d >= 21.9 && d <= 27.1, 'faiblesse au début ' + d);
        if (T >= 210 && T < 230) non(d >= 14.8 && d <= 20.1, 'faiblesse vers 3 min 30 ' + d);
        non(d >= 15 * 0.6 - 0.01, 'faiblesse jamais trop serrée ' + d);
        non(!(l[i].elem === l[i - 1].elem && l[i].part === l[i - 1].part), 'la faiblesse change vraiment');
      }
    });
    // les zones : rien avant 30 s ; 9 à 12 s au début, 6 à 9 s vers 3 min 30 ; jamais deux qui se chevauchent
    non(su.zones[0].tA >= 30, 'pas de zone avant 30 s');
    for (var i = 1; i < su.zones.length; i++) {
      var d = su.zones[i].tA - su.zones[i - 1].tA, T = su.zones[i - 1].tA;
      if (T < 32) non(d >= 8.9 && d <= 12.1, 'zones au début ' + d);
      if (T >= 210 && T < 225) non(d >= 5.9 && d <= 9.1, 'zones vers 3 min 30 ' + d);
      non(su.zones[i].tA >= su.zones[i - 1].tI + 0.79, 'deux zones qui se chevauchent');
      non(Math.abs(su.zones[i].tI - su.zones[i].tA - 4) < 0.02, '4 s d\'annonce');
    }
    // les méga attaques : rien avant 60 s ; jamais deux fois de suite sur le même ; pas en même temps qu'une zone
    non(su.megas[0].tA >= 60, 'pas de méga attaque avant 60 s');
    for (i = 1; i < su.megas.length; i++) {
      non(su.megas[i].cible !== su.megas[i - 1].cible, 'deux méga attaques de suite sur le même');
      var dm = su.megas[i].tA - su.megas[i - 1].tA, Tm = su.megas[i - 1].tA;
      if (Tm >= 210 && Tm < 230) non(dm >= 12.9 && dm <= 19, 'méga attaques vers 3 min 30 ' + dm);
    }
    su.megas.forEach(function (m) { su.zones.forEach(function (z) { non(Math.abs(z.tI - m.tI) >= 0.89, 'méga et zone en même temps'); }); non(m.tI - m.tA < 3, 'moins de 3 s'); });
    // vers 10 minutes, c'est vraiment serré
    var z10 = su.zones.filter(function (z) { return z.tA > 570 && z.tA < 630; });
    non(z10.length >= 9, 'vers 10 minutes, au moins 9 zones par minute (' + z10.length + ')');
  });
  // les gestes du héros
  function S0(o) { var S = P3.nouvelle(Object.assign({mode: 'quatre', role: 'sage', partie: 47, debut: 2, eclairs2: 0}, o || {}), 1); S.attente = 0; return S; }
  var S = S0();
  non(P3.lancer(S, 'feu'), 'on lance'); non(!P3.lancer(S, 'glace'), 'pas deux sorts à la fois');
  P3.pas(S, 1, {mx: 1, my: 0}); non(!S.h.lance, 'bouger coupe le sort');
  S = S0(); P3.pas(S, 0.05, {mx: 1, my: 0}); non(!P3.lancer(S, 'feu'), 'on ne lance pas en courant');
  S = S0(); S.h.pv = 40; P3.lancer(S, 'soin'); for (var k = 0; k < 41; k++) P3.pas(S, 0.05, null); non(S.h.pv === 90, 'le soin rend 50 en 2 s (' + S.h.pv + ')');
  S = S0({eclairs2: 10}); S.h.pv = 40; P3.lancer(S, 'soin'); var avant = S.h.pv; for (k = 0; k < 41; k++) P3.pas(S, 0.05, null); non(!S.h.lance && S.h.pv > avant, 'les éclairs ne coupent pas le soin');
  // la bonne combinaison fait mal, la mauvaise rebondit
  S = S0(); for (k = 0; k < 160; k++) P3.pas(S, 0.05, null);
  var f = S.faible; non(!!f, 'une faiblesse au bout de 8 s');
  P3.viser(S, f.part); P3.lancer(S, P3.ELEMS[f.elem]); var b0 = S.boss; for (k = 0; k < 70; k++) P3.pas(S, 0.05, null);
  non(S.boss === b0 - 1 || S.faible !== f, 'le bon sort sur la bonne partie fait mal');
  S = S0(); for (k = 0; k < 160; k++) P3.pas(S, 0.05, null); f = S.faible;
  P3.viser(S, (f.part + 1) % 6); P3.lancer(S, P3.ELEMS[f.elem]); b0 = S.boss; for (k = 0; k < 70; k++) P3.pas(S, 0.05, null);
  non(S.boss === b0 && S.stats.rebonds === 1, 'la mauvaise partie rebondit');
  // une zone : à l'abri on vit, ailleurs on tombe, sous le bouclier on vit
  var z = P3.suite(47).zones[0];
  S = S0(); var L = P3.REG.lieux[z.lieu]; S.h.x = L.x; S.h.y = L.y + 1; while (S.T < z.tI + 0.1) P3.pas(S, 0.05, null); non(P3.vivant(S), 'à l\'abri, la zone ne fait rien');
  S = S0(); L = P3.REG.lieux[(z.lieu + 1) % 3]; S.h.x = L.x; S.h.y = L.y + 1; while (S.T < z.tI + 0.1) P3.pas(S, 0.05, null); non(!P3.vivant(S) && S.h.mort > 9, 'ailleurs, la zone tue d\'un coup');
  S = S0(); S.h.x = L.x; S.h.y = L.y + 1; while (S.T < z.tI - 1) P3.pas(S, 0.05, null); non(P3.bouclier(S), 'le bouclier se lève'); while (S.T < z.tI + 0.1) P3.pas(S, 0.05, null); non(P3.vivant(S), 'le bouclier sauve d\'une zone (le joker)');
  non(!P3.bouclier(S), 'le bouclier se recharge'); while (S.T < z.tI - 1 + 10.05) P3.pas(S, 0.05, null); non(P3.bouclier(S), 'au bout de 10 s il revient');
  // la mort dure 10 s ; on ne tape pas le code mort
  S = S0(); S.h.x = L.x; S.h.y = L.y + 1; while (S.T < z.tI + 0.1) P3.pas(S, 0.05, null);
  non(!P3.taper(S, 'barde', S.symboles.barde), 'on ne tape pas le code quand on est mort');
  for (k = 0; k < 201; k++) P3.pas(S, 0.05, null); non(P3.vivant(S), 'on revient au bout de 10 s');
  // une méga attaque sur moi : sans bouclier je tombe ; avec, non
  var m = P3.suite(47).megas.filter(function (x) { return x.cible === 'sage'; })[0];
  S = S0(); S.T = m.tA - 0.5; S.vus = {}; P3.pas(S, 0.01, null);
  S.h.x = P3.REG.lieux[0].x; S.h.y = P3.REG.lieux[0].y + 1;
  var zs = P3.suite(47).zones; // place-toi toujours à l'abri des zones pour ce test
  while (S.T < m.tI + 0.1) { zs.forEach(function (zz) { if (zz.tA <= S.T && S.T < zz.tI) { var l = P3.REG.lieux[zz.lieu]; S.h.x = l.x; S.h.y = l.y + 1; } }); P3.pas(S, 0.05, null); }
  non(!P3.vivant(S), 'la méga attaque sans bouclier tue');
  // « On reprend » : le dernier point de reprise, la vie de Grosbec gardée
  S = S0(); S.T = 95; S.boss = 7; S.h.mort = 5; P3.reprendre(S); non(S.T === 90 && S.boss === 7 && P3.vivant(S) && S.h.pv === 100, 'On reprend : 90 s, Grosbec gardé, vivant');
  non(P3.pointDeReprise(29.9) === 0 && P3.pointDeReprise(30) === 30, 'les points de reprise');
  // le code : le mien se met tout seul ; trois à taper ; un faux ne passe pas
  S = S0(); S.boss = 0;
  non(!P3.taper(S, 'barde', '❌'), 'un faux symbole'); ['barde', 'pisteur'].forEach(function (r) { P3.taper(S, r, S.symboles[r]); });
  non(!P3.victoire(S), 'pas encore'); P3.taper(S, 'alchimiste', S.symboles.alchimiste); non(P3.victoire(S) && S.etat === 'fini', 'la victoire');
  // le premier combat : une minute, le tambour, tout le monde tombe, le film, le bouton jaune
  S = P3.nouvelle({mode: 'quatre', role: 'pisteur', partie: 3, debut: 1}, 1);
  non(!P3.lancer(S, 'acide') && !P3.bouclier(S), 'pas d\'acide ni de bouclier au premier combat');
  for (k = 0; k < 2000 && S.etat === 'combat'; k++) P3.pas(S, 0.05, null);
  non(S.etat === 'film' && S.T >= 70 && S.T < 72, 'le film arrive après 70 s (' + S.T + ')');
  for (k = 0; k < 200; k++) P3.pas(S, 0.05, null); non(S.etat === 'go' && P3.demarrerC2(S) && S.combat === 2, 'le bouton jaune lance le deuxième combat');
  // mode seul : une info pour un robot, relayée en touchant son portrait
  S = P3.nouvelle({mode: 'seul', role: 'barde', debut: 2, robots: 1}, 9); S.attente = 0;
  var x = null; while (!x && S.T < 60) { P3.pas(S, 0.05, null); x = P3.mesInfos(S).filter(function (i) { return i.cible; })[0]; }
  non(!!x && P3.aRelayer(S, x.cible) && P3.relayer(S, x.cible) && !P3.aRelayer(S, x.cible), 'je relaie une info à un robot');
  console.log(n + ' vérifications, ' + soucis + ' souci(s)');
}

function parties() {
  var N = +(A.parties || 6), res = [];
  var pil = {bon: {reaction: 0.5, relais: 0.8, oubli: 0.03}, moyen: {reaction: 0.9, relais: 1.4, oubli: 0.12}}[A.pilote || 'bon'];
  for (var g = 0; g < N; g++) {
    var S = P3.nouvelle({mode: 'seul', role: P3.ROLES[g % 4], debut: +(A.debut || 2), robots: +(A.robots || 0.9), vie: A.vie || 'normal', eclairs2: +(A.eclairs2 || 10), recharge: +(A.recharge || 10)}, 100 + g);
    S.attente = 0;
    var p = new Pilote(pil), tue = 0, tousMorts = 0;
    while (S.T < 900 && S.etat === 'combat') {
      var e = p.manette(S); P3.pas(S, 0.05, e);
      // les symboles : le pilote tape ceux qu'on lui crie
      S.cris.forEach(function (c) { if (c.sym && S.T > c.t + 1 && P3.vivant(S)) P3.taper(S, c.de, c.sym); });
      var morts = (P3.vivant(S) ? 0 : 1) + Object.keys(S.amis).filter(function (r) { return S.amis[r].mort > 0; }).length;
      if (morts === 4) { tousMorts++; P3.reprendre(S); }
    }
    var bosses = Object.keys(S.amis).map(function (r) { return S.amis[r].boss; });
    res.push({fini: S.etat === 'fini', T: S.T, st: S.stats, bosses: bosses, tousMorts: tousMorts});
  }
  res.forEach(function (r, i) {
    var s = r.st;
    console.log('partie ' + (i + 1) + ' : ' + (r.fini ? 'gagnée en ' + Math.round(r.T) + ' s' : 'pas finie (' + Math.round(r.T) + ' s)') + ' ; mon symbole à ' + (s.symboleT ? Math.round(s.symboleT) : '—') +
      ' s ; morts ' + s.morts + ' (zones ' + s.zonesRatees + '/' + s.zones + ', méga ' + s.megasRatees + '/' + s.megas + ') ; sorts ' + s.justes + ' justes / ' + s.rebonds + ' rebonds ; soins ' + s.soins + ' ; reprises ' + r.tousMorts + ' ; robots ' + r.bosses.join(','));
  });
  var gg = res.filter(function (r) { return r.fini; });
  console.log('gagnées ' + gg.length + ' sur ' + N + (gg.length ? ', en moyenne ' + Math.round(gg.reduce(function (a, r) { return a + r.T; }, 0) / gg.length) + ' s' : ''));
}
if (A.verif) { verif(); process.exitCode = soucis ? 1 : 0; } else parties();
