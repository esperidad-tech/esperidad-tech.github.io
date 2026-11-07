// Sort la page des rôles (Pisteur, Alchimiste, Sage) en markdown : actions, codes, schémas.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + process.argv[2]);
  const md = await p.evaluate(() => {
    const NOMS = {pisteur:'Pisteur', alchimiste:'Alchimiste', sage:'Sage', barde:'Barde', tous:'tout le monde'};
    const M = {matin:'Le matin', aprem:"L'après-midi", nuit:'La nuit'};
    const n = (r) => NOMS[r] || r;
    const L = [];
    L.push("# Enquête 3 « La lettre d'Odette » — les actions du Pisteur, de l'Alchimiste et du Sage");
    L.push('');
    L.push("Export de la page « La lettre d'Odette » (onglets Pisteur, Alchimiste, Sage et schémas), 6 novembre 2026. Les dialogues du Barde sont dans le fichier `E3-dialogues-et-trame.md`.");
    L.push('');
    L.push("Étiquette **(proposé, à valider)** : une idée de Claude que Romain n'a pas encore validée.");
    L.push('');
    for (const r of ['pisteur', 'alchimiste', 'sage']) {
      L.push('## ' + n(r)); L.push('');
      L.push(INTRO[r]); L.push('');
      for (const m of ['matin', 'aprem', 'nuit']) {
        const as = ACTIONS.filter(a => a.role === r && a.moment === m);
        if (!as.length) continue;
        L.push('### ' + M[m]); L.push('');
        for (const a of as) {
          L.push('#### ' + a.titre + (a.propose ? ' (proposé, à valider)' : '') + ' — ' + (a.lieu || ''));
          if (a.mj) L.push('- **Mini-jeu** : ' + a.mj);
          (a.besoin || []).forEach(c => L.push('- **Il lui faut** : « ' + c.code + ' » (de ' + n(c.de) + (c.note ? ' ; ' + c.note : '') + ')' + (c.propose ? ' (proposé)' : '')));
          if (a.fait) L.push('- **Ce qu\'il fait** : ' + a.fait);
          if (a.ecran) L.push('- **Son écran** : ' + a.ecran);
          (a.donne || []).forEach(c => L.push('- **Il donne** : « ' + c.code + ' » → ' + c.pour.map(n).join(', ') + (c.note ? ' (' + c.note + ')' : '')));
          if (a.note) L.push('- **Note** : ' + a.note);
          L.push('');
        }
      }
    }
    L.push('## Tous les codes de l\'enquête 3, moment par moment'); L.push('');
    for (const m of ['matin', 'aprem', 'nuit']) {
      L.push('### ' + M[m]); L.push('');
      L.push('| De | Code | Pour | Note |'); L.push('| --- | --- | --- | --- |');
      BARDE.filter(x => x.moment === m).forEach(x => L.push(`| Barde | ${x.code} | ${x.pour.map(n).join(', ')} | ${x.note || ''} |`));
      ACTIONS.filter(a => a.moment === m && a.donne).forEach(a => a.donne.forEach(d => { if (d.pour.length === 1 && d.pour[0] === a.role) return; L.push(`| ${n(a.role)} | ${d.code} | ${d.pour.map(n).join(', ')} | ${d.note || ''} |`); }));
      L.push('');
    }
    L.push('## Les schémas (qui fait quoi, dans l\'ordre)'); L.push('');
    const ch = (etapes) => etapes.map((e, i) => `${i + 1}. **${e[0].map(n).join(' + ')}** : ${e[1]}`).join('\n');
    const lab = {avant:'Pour commencer', clocher:'Par le clocher (chemin court)', puits:'Par le puits (chemin long)', apres:'Les deux chemins arrivent au même endroit'};
    const titres = {matin:'Le matin', aprem:"L'après-midi", fourche:'La fourche : préparer les deux chemins (fin d\'après-midi)', nuit:'La nuit'};
    for (const k of Object.keys(CHAINES)) {
      const v = CHAINES[k];
      L.push('### ' + titres[k]); L.push('');
      if (Array.isArray(v)) { v.forEach(g => { L.push('**' + g.titre + '**'); L.push(''); L.push(ch(g.etapes)); L.push(''); }); continue; }
      for (const sk of Object.keys(v)) { L.push('**' + (lab[sk] || sk) + '**'); L.push(''); L.push(ch(v[sk])); L.push(''); }
    }
    return L.join('\n');
  });
  fs.writeFileSync(process.argv[3], md);
  await b.close();
})();
