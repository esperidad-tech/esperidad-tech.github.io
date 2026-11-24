// combien coûte chaque morceau du dessin : SANS=gros,lum,golems,fond (téléphone ralenti 4 fois, sans carte graphique)
const { chromium, devices } = require("playwright");
const fs = require("fs");
(async () => {
  const b = await chromium.launch();
  const src = fs.readFileSync("pieges-alchimiste.html", "utf8");
  fs.writeFileSync("apercu-fps.html", '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + "</body></html>");
  for (const sans of (process.env.SANS || "rien").split("/")) {
    const ctx = await b.newContext({ ...devices["iPhone 13"] }); const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await p.goto("file://" + process.cwd() + "/apercu-fps.html");
    for (let i = 0; i < 80; i++) { await p.waitForTimeout(500); const r = await p.evaluate(() => { const A = window.__v4.alchi(); return A && !A.file.length && !A.enVol; }); if (r) break; }
    await p.click("#btn-go");
    await p.evaluate((sans) => { const V = window.__v4, S = V.etat(); S.dir.i = 99; S.dir.seuil = 9; S.palier = 9; setInterval(() => { S.pv = 100; }, 200);
      // une scène fixe : 14 golems de six sortes, qui marchent sur place (retenus), pas de sorts
      const T = ["rapide", "rapide", "bouclier", "lourd", "chevalier", "berserker", "cracheur", "rapide", "bouclier", "lourd", "chevalier", "rapide", "porteur", "souffleur"];
      T.forEach((t, i) => V.sortir(t, 30 + (i % 7) * 50, 170 + Math.floor(i / 7) * 110 + (i % 2) * 30));
      setInterval(() => { S.E.forEach((e, i) => { e.y = Math.min(e.y, 170 + Math.floor(i / 7) * 110 + 60); }); }, 100);
      if (sans.includes("foule")) { T.concat(T.slice(0, 10)).forEach((t, i) => V.sortir(t, 30 + (i % 8) * 43, 150 + Math.floor(i / 8) * 80 + (i % 2) * 25));
        const R = [["feu", "farine"], ["eau", "eau"], ["feu"], ["acide"], ["eau", "fleur"], ["farine", "acide"], ["feu", "feu"]]; let k = 0;
        setInterval(() => { if (!S.enCours) return; const e = S.E[Math.floor(Math.random() * S.E.length)]; S.slots = R[k++ % R.length].slice(); V.lancer(e ? e.x : 180, Math.max(e ? e.y : 250, 160)); }, 900); }
      if (sans.includes("ombres")) { window.__sansOmbres = true; }
      if (sans.includes("gros")) Gros.rafraichir = function () {};
      if (sans.includes("lum")) Decor.lumieres = function () {};
      if (sans.includes("golems")) GolemsA.dessiner = function () {};
    }, sans);
    await p.waitForTimeout(6000);
    const r = await p.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); function f(now) { n++; if (now - t0 < 4000) requestAnimationFrame(f); else res({ fps: Math.round(n / 4), de: window.__v4.perf.de.toFixed(1), av: window.__v4.perf.av.toFixed(1), n: window.__v4.etat().E.length, parts: window.__v4.etat().PA.length, cuits: GolemsA.cuits, leger: window.__v4.leger() }); } requestAnimationFrame(f); }));
    console.log("sans", sans, JSON.stringify(r));
    await ctx.close();
  }
  await b.close();
})();
