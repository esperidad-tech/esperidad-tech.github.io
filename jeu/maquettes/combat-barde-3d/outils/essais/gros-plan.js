const { chromium } = require('playwright');
const [,, nom, secondes, cx, cy, w, h, extra] = process.argv;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 405, height: 880 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('http://localhost:8811/index.html');
  await p.waitForFunction(() => window.PRET, null, { timeout: 180000 });
  const r = await p.evaluate(([sec, cx, cy, w, h, extra]) => { const E = window.essai; E.fige = true; E.demarrer(); if (extra) eval(extra); E.avancer(+sec);
    // zoom : la caméra ne voit que ce rectangle de l'écran (en pixels CSS), rendu en grand
    const c = E.camera, W = innerWidth, H = innerHeight; c.setViewOffset(W, H, cx - w / 2, cy - h / 2, w, h); E.rendre();
    return E.vivants.map(g => [g.nom, g.etat]); }, [secondes, +cx, +cy, +w, +h, extra || '']);
  console.log(JSON.stringify(r));
  await p.evaluate(() => { document.getElementById('fond').style.display = 'none'; document.body.style.background = '#556'; });
  await p.screenshot({ path: `/tmp/claude-0/-home-claude/adfe1f54-7125-553d-8916-ca9cd1938246/scratchpad/photos/${nom}.png` });
  await b.close();
})();
