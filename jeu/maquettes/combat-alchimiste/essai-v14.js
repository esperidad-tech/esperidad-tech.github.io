const { chromium, devices } = require("playwright");
const fs = require("fs");
(async () => {
  const src = fs.readFileSync("pieges-alchimiste.html", "utf8");
  fs.writeFileSync("apercu-v4.html", '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + "</body></html>");
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices["iPhone 13"] }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message + " " + (e.stack || "").split("\n")[1]));
  await p.goto("file://" + process.cwd() + "/apercu-v4.html"); await p.waitForTimeout(5000);
  await p.click("#btn-go"); await p.waitForTimeout(600);
  const vider = () => p.evaluate(() => { const S = window.__v4.etat(); S.E.length = 0; S.file.length = 0; S.dir.i = 99; S.dir.seuil = 9; S.palier = 9; S.bossFile.length = 0; S.T.length = 0; S.BAR.length = 0; S.pv = 10; S.B.pv = 1000; S.gateau = null; });
  const etat = (t) => p.evaluate((t) => { const e = window.__v4.etat().E.find(o => o.t === t); return e ? { pv: Math.round(e.pv), x: Math.round(e.x), y: Math.round(e.y), z: Math.round(e.z), etat: e.etat, ouvert: +e.ouvert.toFixed(1), mange: +(e.mangeT || 0).toFixed(1), dort: +(e.dort || 0).toFixed(1), chaleur: Math.round(e.chaleur), brulant: +e.brulant.toFixed(1), balance: !!e.balance, rebond: e.rebond, cadeaux: e.cadeaux } : null; }, t);
  const garde = () => p.evaluate(() => { const S = window.__v4.etat(); S.pv = 10; });
  const log = [];
  // ---- A. le Glouton
  await vider();
  await p.evaluate(() => { window.__v4.boss("glouton", 180, 180); });
  await p.waitForTimeout(800); await p.screenshot({ path: "v14-a-glouton.png" });
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["farine", "fleur", "fleur"]; window.__v4.lancer(180, S.hero.y - 120); });
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(300); await garde(); const e = await etat("glouton"); if (e && e.mange > 0) break; }
  await p.waitForTimeout(300); await p.screenshot({ path: "v14-b-mange.png" });
  log.push("glouton mange " + JSON.stringify(await etat("glouton")));
  for (let i = 0; i < 15; i++) { await p.waitForTimeout(300); await garde(); const e = await etat("glouton"); if (e && e.dort > 0) break; }
  await p.waitForTimeout(400); await p.screenshot({ path: "v14-c-dort.png" });
  log.push("glouton dort " + JSON.stringify(await etat("glouton")));
  // ---- B. le Frileux
  await vider();
  await p.evaluate(() => { window.__v4.boss("frileux", 180, 260); const e = window.__v4.etat().E[0]; e.etourdi = 30; });
  await p.waitForTimeout(500); await p.screenshot({ path: "v14-d-frileux.png" });
  for (let i = 0; i < 4; i++) { await p.evaluate(() => { const S = window.__v4.etat(), e = S.E[0]; S.slots = ["feu", "feu"]; window.__v4.lancer(e.x, e.y); }); await p.waitForTimeout(700); await garde(); }
  log.push("frileux chaud " + JSON.stringify(await etat("frileux")));
  await p.screenshot({ path: "v14-e-brulant.png" });
  await p.evaluate(() => { const S = window.__v4.etat(), e = S.E[0]; S.slots = ["eau"]; window.__v4.lancer(e.x, e.y); });
  await p.waitForTimeout(600); await p.screenshot({ path: "v14-f-choc.png" });
  log.push("frileux après eau " + JSON.stringify(await etat("frileux")));
  // ---- C. le Singe
  await vider();
  await p.evaluate(() => { window.__v4.boss("singe", 260, 220); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const S = window.__v4.etat(), e = S.E[0]; S.slots = ["feu"]; window.__v4.lancer(e.x, e.y); });
  await p.waitForTimeout(350); log.push("singe esquive " + JSON.stringify(await etat("singe"))); await p.screenshot({ path: "v14-g-esquive.png" });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["eau", "fleur"]; window.__v4.lancer(140, 300); });
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); await garde(); const e = await etat("singe"); if (e && e.balance) break; }
  await p.waitForTimeout(500); await p.screenshot({ path: "v14-h-balance.png" });
  log.push("singe balance " + JSON.stringify(await etat("singe")));
  await p.evaluate(() => { const S = window.__v4.etat(); const t = S.T.find(t => t.type === "lianes"); S.slots = ["feu"]; window.__v4.lancer(t.x, t.y); });
  await p.waitForTimeout(1200); await p.screenshot({ path: "v14-i-massue.png" });
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(300); await garde(); const e = await etat("singe"); if (e && e.cadeaux > 0) break; }
  log.push("singe après " + JSON.stringify(await etat("singe")) + " " + JSON.stringify(await p.evaluate(() => window.__v4.etat().combosPartie)));
  // ---- D. le Sauteur
  await vider();
  await p.evaluate(() => { window.__v4.boss("sauteur", 120, 200); });
  await p.waitForTimeout(600); await p.screenshot({ path: "v14-j-sauteur.png" });
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["farine", "acide"]; window.__v4.lancer(200, 330); });
  for (let i = 0; i < 25; i++) { await p.waitForTimeout(250); await garde(); const e = await etat("sauteur"); if (e && e.rebond >= 2) break; }
  await p.waitForTimeout(500); await p.screenshot({ path: "v14-k-rebond.png" });
  log.push("sauteur rebond " + JSON.stringify(await etat("sauteur")));
  for (let i = 0; i < 25; i++) { await p.waitForTimeout(250); await garde(); const e = await etat("sauteur"); if (e && e.cadeaux > 0) break; }
  await p.waitForTimeout(100); await p.screenshot({ path: "v14-l-boum.png" });
  log.push("sauteur après " + JSON.stringify(await etat("sauteur")));
  // ---- E. le palier 4 : les quatre
  await vider();
  await p.evaluate(() => { const S = window.__v4.etat(); S.palier = 3; window.__v4.paliers(4); });
  await p.waitForTimeout(3600); await p.screenshot({ path: "v14-m-arrivee.png" });
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(500); await garde(); if ((await p.evaluate(() => window.__v4.etat().E.filter(e => e.boss).length)) >= 4) break; }
  await p.waitForTimeout(2500); await garde(); await p.screenshot({ path: "v14-n-quatre.png" });
  log.push("quatre " + await p.evaluate(() => window.__v4.etat().E.map(e => e.t + "@" + Math.round(e.x) + "," + Math.round(e.y)).join(" ")));
  console.log(log.join("\n")); console.log("erreurs", errs);
  await b.close();
})();
