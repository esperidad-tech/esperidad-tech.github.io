const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]);
  await p.waitForTimeout(300);
  const vis = () => p.evaluate(() => [...document.querySelectorAll('#onglets-roles ~ [role=tabpanel]')].filter(x => !x.hidden).map(x => x.id).join(','));
  for (const t of ['ensemble', 'pisteur', 'alchimiste', 'sage', 'barde']) {
    await p.click('#o-' + t);
    console.log(t, '→ visible :', await vis(), '| largeur', await p.evaluate(() => document.documentElement.scrollWidth));
  }
  for (const s of ['trame', 'matin', 'aprem', 'nuit', 'suite', 'barde']) {
    await p.click('#bo-' + s);
    const r = await p.evaluate(() => ({ dehors: [...document.querySelectorAll('#onglets-roles ~ [role=tabpanel]')].filter(x => !x.hidden).map(x => x.id).join(','), dedans: [...document.querySelectorAll('#p-barde [role=tabpanel]')].filter(x => !x.hidden).map(x => x.id).join(','), len: [...document.querySelectorAll('#p-barde [role=tabpanel]')].filter(x => !x.hidden).map(x => x.innerText.length).join(',') }));
    console.log('  barde/' + s, JSON.stringify(r));
  }
  await p.click('button[data-t="tendre"]');
  await p.click('#bo-matin');
  console.log('écoutes visibles (matin) :', await p.evaluate(() => [...document.querySelectorAll('#bp-matin .ecoute')].filter(e => getComputedStyle(e).display !== 'none').length));
  await p.click('#o-pisteur'); await p.click('#tout-ouvrir');
  console.log('tiroirs ouverts (pisteur) :', await p.evaluate(() => document.querySelectorAll('#p-pisteur details[open]').length));
  await p.click('#o-barde');
  console.log('retour Barde → sous-onglet visible :', await p.evaluate(() => [...document.querySelectorAll('#p-barde [role=tabpanel]')].filter(x => !x.hidden).map(x => x.id).join(',')));
  await p.screenshot({ path: process.argv[3] });
  console.log('ERREURS', errs);
  await b.close();
})();
