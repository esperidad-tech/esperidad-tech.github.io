const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 2 });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("file://" + process.cwd() + "/apercu-v4.html"); await p.waitForTimeout(2500); await p.click("#btn-go"); await p.waitForTimeout(1500);
  for (const [w, h] of [[664, 390], [820, 1180], [390, 664]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(1200); }
  await p.evaluate(() => { const V = window.__v4, S = V.etat(); for (let i = 0; i < 20; i++) V.sortir(["rapide", "lourd", "chevalier", "berserker"][i % 4], 30 + i * 15, 200 + (i % 5) * 40); S.pv = 99; });
  await p.waitForTimeout(2500); await p.screenshot({ path: "v15-redim.png" });
  console.log("cuits", await p.evaluate(() => GolemsA.cuits), "erreurs", errs); await b.close();
})();
