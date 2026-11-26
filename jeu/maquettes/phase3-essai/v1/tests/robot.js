/* Les essais du moteur, sans navigateur.   node tests/robot.js [verif] [parties=N] [p=0.95] [vitesse=normale] [boss=normal] [depart=1] [sansReprise]
   verif : les règles de la suite des coups (donneur ≠ receveur, équilibre, pas de chevauchement…) et le hasard partagé.
   Sinon : des parties entières jouées par quatre robots ; « On reprend » dès qu'un robot tombe (3 s plus tard). */
var P3 = require('../src/moteur.js');
var A = {}; process.argv.slice(2).forEach(function (a) { var k = a.split('='); A[k[0]] = k.length > 1 ? k[1] : true; });

function verif() {
  var soucis = 0, n = 0;
  function non(c, m) { n++; if (!c) { soucis++; console.log('  ✗', m); } }
  [1, 47, 999].forEach(function (partie) {
    ['lente', 'normale', 'rapide'].forEach(function (vit) {
      for (var essai = 1; essai <= 4; essai++) for (var m = 1; m <= 16; m++) {
        var M = P3.manche(partie, essai, m, vit), M2 = P3.manche(partie, essai, m, vit);
        non(JSON.stringify(M) === JSON.stringify(M2), 'même suite deux fois ' + [partie, essai, m]);
        var parCible = {}, recu = {}, donne = {};
        M.ev.forEach(function (e) {
          non(e.donneur !== e.cible, 'donneur = cible ' + JSON.stringify(e));
          non(e.tI > e.tA, 'tI > tA');
          donne[e.donneur] = (donne[e.donneur] || 0) + 1;
          if (e.k === 'carte') {
            recu[e.cible] = (recu[e.cible] || 0) + 1;
            (parCible[e.cible] = parCible[e.cible] || []).push(e);
            if (m >= 3) non(e.elem !== null && e.part !== null, 'élément et partie dès la manche 3');
            if (m === 1) non(e.elem === null, 'pas d\'élément en manche 1');
          }
        });
        P3.ROLES.forEach(function (ro) {
          var l = (parCible[ro] || []).sort(function (a, b) { return a.tA - b.tA; });
          for (var i = 1; i < l.length; i++) non(l[i].tA >= l[i - 1].tI - 1e-9, 'deux frappes de zone se chevauchent ' + [partie, essai, m, ro]);
          for (var j = 1; j < l.length; j++) if (l[j].elem !== null) non(!(l[j].elem === l[j - 1].elem && l[j].part === l[j - 1].part), 'la garde ne change pas');
        });
        var cartes = P3.ROLES.map(function (ro) { return recu[ro] || 0; });
        non(Math.max.apply(null, cartes) === Math.min.apply(null, cartes), 'chacun reçoit autant de cartes ' + cartes);
        var dons = P3.ROLES.map(function (ro) { return donne[ro] || 0; });
        non(Math.max.apply(null, dons) - Math.min.apply(null, dons) <= 1, 'chacun crie à peu près autant ' + dons + ' ' + [partie, essai, m]);
        var megas = M.ev.filter(function (e) { return e.k === 'mega'; });
        for (var q = 1; q < megas.length; q++) non(megas[q].cible !== megas[q - 1].cible, 'deux méga attaques de suite sur le même');
        if (m > 1 && megas.length) { var mp = P3.manche(partie, essai, m - 1, vit).ev.filter(function (e) { return e.k === 'mega'; });
          if (mp.length) non(mp[mp.length - 1].cible !== megas[0].cible, 'deux méga attaques de suite sur le même, d\'une manche à l\'autre'); }
        if (m <= 4) M.ev.filter(function (e) { return e.k === 'carte'; }).forEach(function (e) {
          non(P3.ANNEAU.some(function (a) { return a[0] === e.donneur && a[1] === e.cible; }), 'l\'anneau jusqu\'à la manche 4');
        });
        if (m >= 6) { var tA = {}; M.ev.forEach(function (e) { if (e.k === 'carte') tA[e.tA] = (tA[e.tA] || 0) + 1; });
          non(Object.keys(tA).some(function (k) { return tA[k] >= 2; }), 'des cartes en même temps dès la manche 6'); }
        if (m >= 9) { var tB = {}; M.ev.forEach(function (e) { if (e.k === 'carte') tB[e.tA] = (tB[e.tA] || 0) + 1; });
          non(Object.keys(tB).some(function (k) { return tB[k] === 4; }), 'les quatre en même temps dès la manche 9'); }
      }
    });
  });
  /* l'ordre change d'un essai à l'autre */
  non(JSON.stringify(P3.manche(47, 1, 6, 'normale').ev) !== JSON.stringify(P3.manche(47, 2, 6, 'normale').ev), 'l\'essai change la suite');
  /* une tablette ne montre jamais la carte qui la concerne */
  P3.ROLES.forEach(function (ro) {
    var P = new P3.Partie({ partie: 47, role: ro });
    for (var t = 0; t < P.M.D; t += 0.1) P.cartes(t).forEach(function (e) { non(e.cible !== ro && e.donneur === ro, 'carte chez le bon donneur'); });
  });
  /* les symboles */
  var s = P3.symboles(47); non(new Set(P3.ROLES.map(function (r) { return s[r]; })).size === 4, 'quatre symboles différents');
  /* le joueur : une frappe de zone, un soin coupé, un bouclier, le tir */
  var J = new P3.Joueur('sage'), M1 = { ev: [{ k: 'carte', id: 1, donneur: 'barde', cible: 'sage', tA: 1, tI: 4, zone: 0, elem: 1, part: 2 }], recharge: 10, D: 10 };
  J.choisirElem(1); J.choisirPart(2); J.avancer(3.9, M1); var b0 = J.boss; non(b0 < J.bossMax, 'le tir porte');
  J.avancer(4.1, M1); non(J.vie === P3.REG.vie - P3.REG.degZone, 'la frappe de zone touche au milieu');
  var J2 = new P3.Joueur('sage'); J2.aller(0, 0.5); J2.avancer(4.1, M1); non(J2.vie === P3.REG.vie, 'à gauche on est à l\'abri');
  var J3 = new P3.Joueur('sage'); J3.vie = 50; J3.soigner(2.5); J3.avancer(4.1, M1); non(J3.vie === 50 - P3.REG.degZone || J3.mort, 'la frappe coupe le soin');
  var M2 = { ev: [{ k: 'mega', id: 1, donneur: 'barde', cible: 'sage', tA: 1, tI: 4 }], recharge: 10, D: 10 };
  var J4 = new P3.Joueur('sage'); J4.avancer(1.5, M2); J4.bouclier(1.5); J4.avancer(5, M2); non(!J4.mort, 'le bouclier arrête la méga attaque'); non(J4.bouclierAttente === 1 && !J4.bouclier(6), 'le bouclier attend la méga attaque suivante');
  var J5 = new P3.Joueur('sage'); J5.avancer(5, M2); non(J5.mort, 'sans bouclier, on tombe');
  var J6 = new P3.Joueur('pisteur'); J6.avancer(5, M2); non(!J6.mort && J6.vie === 100, 'la méga attaque d\'un autre ne fait rien');
  console.log(n + ' vérifications, ' + soucis + ' souci(s)');
  process.exitCode = soucis ? 1 : 0;
}

function partieRobots(o) {
  var T = new P3.Table(o), dt = 0.05, temps = 0, reprises = 0, morts = [], fini = null, mortA = null, mancheMort = null;
  var tueur = {}, bossMortA = {};
  T.surManche = function () {};
  while (temps < (o.max || 900)) {
    T.pas(dt); temps += dt;
    var mo = T.morts();
    if (mo.length && mortA === null) { mortA = temps; mancheMort = T.M().m; morts.push({ m: mancheMort, qui: mo.slice(), cause: T.parties[mo[0]].joueur.journal.filter(function (e) { return e.type === 'mort'; }).pop().pourquoi }); }
    if (mortA !== null && !o.sansReprise && temps - mortA > 3) { reprises++; T.reprendre(mancheMort); mortA = null; }
    if (mortA !== null && o.sansReprise) { morts[morts.length - 1].qui = mo.slice(); if (mo.length === 4) { fini = { perdu: true, t: temps }; break; } }
    P3.ROLES.forEach(function (ro) { if (T.parties[ro].joueur.boss <= 0 && !bossMortA[ro]) bossMortA[ro] = { t: temps, m: T.M().m }; });
    if (P3.ROLES.every(function (ro) { return T.parties[ro].joueur.boss <= 0; })) { fini = { gagne: true, t: temps, m: T.M().m }; break; }
  }
  return { fini: fini, reprises: reprises, morts: morts, bossMortA: bossMortA, m: T.M().m, temps: temps };
}

if (A.verif) verif();
else {
  var N = +(A.parties || 8), res = [];
  for (var g = 1; g <= N; g++) res.push(partieRobots({ partie: 40 + g, graine: g, vitesse: A.vitesse || 'normale', bossVie: A.boss || 'normal',
    depart: +(A.depart || 1), pTous: +(A.p || 0.95), sansReprise: !!A.sansReprise, max: +(A.max || 900) }));
  res.forEach(function (r, i) {
    var f = r.fini ? (r.fini.gagne ? 'gagné en ' + Math.round(r.fini.t) + ' s (manche ' + r.fini.m + ')' : 'tous tombés à ' + Math.round(r.fini.t) + ' s') : 'pas fini (manche ' + r.m + ')';
    var bm = P3.ROLES.map(function (ro) { var b = r.bossMortA[ro]; return ro[0].toUpperCase() + ':' + (b ? 'm' + b.m : '—'); }).join(' ');
    console.log('partie ' + (i + 1) + ' : ' + f + ', ' + r.reprises + ' reprise(s) ; bosses : ' + bm + ' ; morts : ' +
      r.morts.map(function (x) { return 'm' + x.m + ' ' + x.qui.join('+') + ' (' + x.cause + ')'; }).join(', '));
  });
  var g2 = res.filter(function (r) { return r.fini && r.fini.gagne; });
  console.log('gagnées : ' + g2.length + ' sur ' + N + (g2.length ? ', temps moyen ' + Math.round(g2.reduce(function (a, r) { return a + r.fini.t; }, 0) / g2.length) + ' s' : '') +
    ', reprises moyennes ' + (res.reduce(function (a, r) { return a + r.reprises; }, 0) / N).toFixed(1));
}
