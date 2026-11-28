const { chromium } = require('playwright');
const [,, nom, W, H, liste] = process.argv;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +(process.env.DSF || 1) });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('http://localhost:8811/index.html');
  await p.waitForFunction(() => window.PRET, null, { timeout: 180000 });
  await p.evaluate(() => { const E = window.essai; E.fige = true; E.demarrer(); document.getElementById('lancer').hidden = true; });
  let t = 0;
  for (const s of liste.split(',').map(Number)) {
    const r = await p.evaluate(d => { const E = window.essai; E.avancer(d); E.rendre(); return E.vivants.map(g => g.nom[0] + g.nom[1] + ':' + g.etat).join(' '); }, s - t); t = s;
    console.log(s, r);
    await p.screenshot({ path: `/tmp/claude-0/-home-claude/adfe1f54-7125-553d-8916-ca9cd1938246/scratchpad/photos/${nom}-${String(s).padStart(4, '0')}.png` });
  }
  await b.close();
})();
