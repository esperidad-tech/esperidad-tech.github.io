// Sort, pour le calcul du temps de l'enquête 3, tous les textes que les joueurs lisent, rangés par rôle et par moment.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + process.argv[2]);   // la page du Barde (source)
  const barde = await p.evaluate(() => {
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.innerText; };
    const villageois = (liste) => liste.map(v => ({nom: v.nom, signe: v.signe, qs: v.qs.map(q => ({q: q.q, r: q.r, v: q.v || '', alt: q.alt ? (q.alt.q + ' ' + q.alt.r + ' ' + (q.alt.v || '')) : ''}))}));
    const APRESNOMS = ['Mélusine', 'Iris', 'Anselme', 'Farinel', 'Silas', 'Basile'];
    const ecoutes = (l) => l.map(e => e.l.map(x => x[1]).join(' '));
    // la nuit : on relit le HTML pour séparer questions, choix et répliques
    const nuit = NUIT_HTML.map(([t, h]) => {
      const d = document.createElement('div'); d.innerHTML = h;
      const choix = [...d.querySelectorAll('ul.choix')].map(ul => [...ul.querySelectorAll('li')].map(li => ({t: li.querySelector('.t').innerText, rp: li.querySelector('.rp').innerText})));
      d.querySelectorAll('ul.choix').forEach(u => u.remove());
      return {titre: t, choix, reste: d.innerText};
    });
    return {
      decor: txt(decor), mission: txt(mission), mjMatin: txt(mjMatin),
      matin: villageois(MENEURS.concat(AUTRES.filter(v => !APRESNOMS.includes(v.nom)))),
      occupes: OCCUPES.map(o => o[2][0]),
      maire: {qs: MAIRE.qs.map(q => ({q: q.q, r: q.r})), etapes: MAIRE.etapes.map(e => e.choix.map(c => ({t: c.t, rp: c.rp || ''})))},
      fortune: FORTUNE.map(e => ({intro: e.intro, choix: e.choix.map(c => ({t: c.t, rp: c.rp}))})),
      marche: MARCHE.map(v => ({intro: v.intro, choix: v.choix.map(c => ({t: c.t, rp: c.rp}))})),
      ecoutesMatin: ecoutes(ECOUTES),
      aprem: villageois(APREM), ecoutesAprem: ecoutes(ECOUTES_A),
      apremHtml: {maire: txt(APREM_HTML.maire), maison: txt(APREM_HTML.maison)},
      nuit
    };
  });
  await p.goto('file://' + process.argv[3]);   // la page des rôles (source)
  const roles = await p.evaluate(() => ACTIONS.map(a => ({role: a.role, moment: a.moment, titre: a.titre, mj: a.mj || '', ecran: a.ecran || '', besoin: (a.besoin || []).map(c => c.code), donne: (a.donne || []).map(c => c.code)})));
  fs.writeFileSync(process.argv[4], JSON.stringify({barde, roles}, null, 1));
  await b.close();
})();
