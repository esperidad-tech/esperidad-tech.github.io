const { chromium, devices } = require("playwright");
const fs = require("fs");
(async () => {
  const src = fs.readFileSync("pieges-alchimiste.html", "utf8");
  fs.writeFileSync("apercu-v4.html", '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + "</body></html>");
  const app = process.argv[2] === "tab" ? { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1, hasTouch: true } : devices["iPhone 13"];
  const nom = process.argv[2] === "tab" ? "tab-" : "";
  const b = await chromium.launch(); const ctx = await b.newContext({ ...app }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message + " " + (e.stack || "").split("\n").slice(1, 3).join(" | ")));
  await p.goto("file://" + process.cwd() + "/apercu-v4.html"); await p.waitForTimeout(4000);
  await p.screenshot({ path: "v15-" + nom + "a-regles.png" });
  await p.click("#btn-go"); await p.waitForTimeout(900);
  await p.screenshot({ path: "v15-" + nom + "b-debut.png" });
  const garde = () => p.evaluate(() => { const S = window.__v4.etat(); S.pv = 10; });
  for (let i = 0; i < 16; i++) { await p.waitForTimeout(500); await garde(); }
  await p.screenshot({ path: "v15-" + nom + "c-salve.png" });
  // toutes les sortes, en rang
  await p.evaluate(() => { const V = window.__v4, S = V.etat(); S.E.length = 0; S.file.length = 0; S.dir.i = 99; S.dir.seuil = 9; S.palier = 9; S.bossFile.length = 0; S.T.length = 0;
    ["rapide", "bouclier", "lourd", "cracheur", "berserker", "souffleur", "chevalier", "porteur"].forEach((t, i) => V.sortir(t, 28 + i * 43, 150 + (i % 2) * 40));
    V.sortir("colosse", 180, 300); V.sortir("chevalier", 80, 320); V.sortir("lourd", 290, 330); V.sortir("rapide", 130, 380); V.sortir("rapide", 240, 390);
    S.E.forEach(e => { e.etourdi = 30; }); });
  await p.waitForTimeout(700); await garde(); await p.screenshot({ path: "v15-" + nom + "d-sortes.png" });
  // leurs états
  await p.evaluate(() => { const S = window.__v4.etat(); S.E.forEach((e, i) => { const k = i % 6; if (k === 0) e.mouille = 9; if (k === 1) e.panique = 9; if (k === 2) e.enfarine = 9; if (k === 3) e.colle = 9; if (k === 4) e.elec = 9; if (k === 5) e.statue = 9; }); S.E[8].denude = 9; S.E[9].grille = 9; });
  await p.waitForTimeout(500); await garde(); await p.screenshot({ path: "v15-" + nom + "e-etats.png" });
  // les quatre gros boss, et Grosbec qui envoie une grosse salve
  await p.evaluate(() => { const V = window.__v4, S = V.etat(); S.E.length = 0; ["glouton", "frileux", "singe", "sauteur"].forEach((t, i) => { V.boss(t, 55 + i * 84, 230 + (i % 2) * 60); }); S.E.forEach(e => { e.etourdi = 30; }); V.essai.lancerSalve(V.essai.SEUILS[0]); });
  await p.waitForTimeout(1500); await garde(); await p.screenshot({ path: "v15-" + nom + "f-boss.png" });
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(500); await garde(); }
  await p.screenshot({ path: "v15-" + nom + "g-grande.png" });
  await p.evaluate(() => { window.__v4.pb(); });
  for (let i = 0; i < 8; i++) { await p.waitForTimeout(500); await garde(); }
  await p.screenshot({ path: "v15-" + nom + "h-allez.png" });
  console.log("cuits", await p.evaluate(() => GolemsA.cuits + " file " + GolemsA.file), "erreurs", errs);
  await b.close();
})();
