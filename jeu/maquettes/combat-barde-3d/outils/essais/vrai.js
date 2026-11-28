const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 900, height: 700 } });
  const err = []; p.on('pageerror', e => err.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) err.push(m.text()); });
  await p.goto('http://localhost:8811/index.html');
  await p.waitForFunction(() => window.PRET, null, { timeout: 180000 });
  await p.click('#lancer'); await p.waitForTimeout(8000);
  console.log('golems', await p.evaluate(() => window.essai.vivants.map(g => g.nom + ':' + g.etat).join(' ')), 'erreurs', JSON.stringify(err));
  await p.screenshot({ path: '/tmp/claude-0/-home-claude/adfe1f54-7125-553d-8916-ca9cd1938246/scratchpad/photos/vrai.png' });
  await b.close();
})();
