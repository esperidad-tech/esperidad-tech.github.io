const { chromium, devices } = require("playwright");
const fs = require("fs");
(async () => {
  const src = fs.readFileSync("pieges-alchimiste.html", "utf8");
  fs.writeFileSync("apercu-v4.html", '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + "</body></html>");
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices["iPhone 13"] }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message + " " + (e.stack || "").split("\n")[1]));
  await p.goto("file://" + process.cwd() + "/apercu-v4.html"); await p.waitForTimeout(5000);
  await p.click("#btn-go"); await p.waitForTimeout(600);
  const vider = () => p.evaluate(() => { const S = window.__v4.etat(); S.E.length = 0; S.file.length = 0; S.dir.i = 99; S.T.length = 0; S.BAR.length = 0; S.pv = 10; S.B.pv = 1000; });
  const log = [];
  // ---- A. la méga-potion
  await vider();
  await p.evaluate(() => { const V = window.__v4; V.sortir("rapide", 150, 250); V.sortir("rapide", 190, 260); V.sortir("bouclier", 170, 230); V.etat().E.forEach(e => e.etourdi = 5); V.mega(); });
  await p.waitForTimeout(300); await p.screenshot({ path: "v13-a-jauge.png" });
  await p.click("#btn-mega", { force: true }); await p.waitForTimeout(200);
  log.push("arme " + await p.evaluate(() => window.__v4.etat().megaArme));
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["feu", "farine"]; window.__v4.lancer(170, 250); });
  await p.waitForTimeout(350); await p.screenshot({ path: "v13-b-mega1.png" });
  await p.waitForTimeout(500); await p.screenshot({ path: "v13-c-mega2.png" });
  log.push("apres mega " + await p.evaluate(() => { const S = window.__v4.etat(); return S.megaArme + " " + S.mega + " " + S.megaK; }));
  await p.waitForTimeout(1500);
  // ---- B. la lance à incendie
  await vider();
  const avant = await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; V.sortir("rapide", h.x, h.y - 80); V.sortir("lourd", h.x + 5, h.y - 140); V.sortir("chevalier", h.x - 5, h.y - 200); V.sortir("bouclier", h.x, h.y - 250); S.E.forEach(e => e.etourdi = 5); return S.E.map(e => e.t + ":" + Math.round(e.y)).join(" "); });
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["eau", "eau", "eau"]; window.__v4.boire(); S.ptr = { x: S.hero.x, y: 40 }; });
  await p.waitForTimeout(450); await p.screenshot({ path: "v13-d-jet1.png" });
  await p.waitForTimeout(700); await p.screenshot({ path: "v13-e-jet2.png" });
  const apres = await p.evaluate(() => window.__v4.etat().E.map(e => e.t + ":" + Math.round(e.y) + (e.mouille > 0 ? "~" : "")).join(" "));
  log.push("jet avant " + avant + " | après " + apres);
  await p.waitForTimeout(1500);
  // ---- C. le lancer du marteau (liane en feu)
  await vider();
  await p.evaluate(() => { const V = window.__v4; V.sortir("rapide", 170, 300); V.sortir("rapide", 185, 315); V.sortir("rapide", 160, 320); V.etat().E.forEach(e => e.etourdi = 2); const S = V.etat(); S.slots = ["fleur", "eau"]; V.lancer(175, 310); });
  await p.waitForTimeout(700);
  log.push("lianes " + await p.evaluate(() => window.__v4.etat().E.filter(e => e.attrape).length));
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["feu"]; window.__v4.lancer(175, 310); });
  await p.waitForTimeout(1200); await p.screenshot({ path: "v13-f-liane.png" });
  for (let i = 0; i < 12; i++) { await p.waitForTimeout(400); const m = await p.evaluate(() => window.__v4.etat().E.some(e => e.marteau && e.etat === "vol")); if (m) break; }
  await p.waitForTimeout(150); await p.screenshot({ path: "v13-g-marteau.png" });
  log.push("marteau " + await p.evaluate(() => JSON.stringify(window.__v4.etat().combosPartie)));
  await p.waitForTimeout(1500);
  // ---- D. la tornade de feu
  await vider();
  await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; S.slots = ["acide", "fleur"]; V.lancer(h.x, h.y - 70); });
  await p.waitForTimeout(600);
  await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; [[-30, -60], [0, -75], [30, -62], [10, -90]].forEach(d => V.sortir("rapide", h.x + d[0], h.y + d[1])); S.E.forEach(e => e.etourdi = 3); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const S = window.__v4.etat(); S.slots = ["eau", "eau", "eau"]; window.__v4.lancer(S.hero.x, S.hero.y - 100); });
  await p.waitForTimeout(300);
  log.push("tourb " + await p.evaluate(() => window.__v4.etat().E.filter(e => e.tourb).length));
  await p.evaluate(() => { const S = window.__v4.etat(), e = S.E.find(o => o.tourb); if (e) { S.slots = ["feu"]; window.__v4.lancer(e.x, e.y); } });
  await p.waitForTimeout(800); await p.screenshot({ path: "v13-h-tornade.png" });
  log.push("tornade " + await p.evaluate(() => { const S = window.__v4.etat(); return S.E.filter(e => e.tourb && e.tourb.feu).length + " " + JSON.stringify(S.combosPartie); }));
  await p.waitForTimeout(3000);
  // ---- E. la boule de boue
  await vider();
  await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; S.slots = ["farine", "eau"]; V.lancer(h.x, h.y - 120); });
  await p.waitForTimeout(500);
  log.push("traces " + await p.evaluate(() => window.__v4.etat().T.map(t => t.type).join(",")));
  await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; [[-20, -200], [20, -230], [0, -280], [-30, -300]].forEach(d => V.sortir("rapide", h.x + d[0], h.y + d[1])); S.E.forEach(e => e.etourdi = 4); S.slots = ["eau", "eau"]; V.lancer(h.x, h.y - 300); });
  await p.waitForTimeout(500); await p.screenshot({ path: "v13-i-boule1.png" });
  log.push("boule " + await p.evaluate(() => { const S = window.__v4.etat(); return S.BB.map(B => B.n + "/" + Math.round(B.r)).join(" ") + " dans:" + S.E.filter(e => e.dansBoule).length; }));
  await p.waitForTimeout(600); await p.screenshot({ path: "v13-j-boule2.png" });
  for (let i = 0; i < 10; i++) { await p.waitForTimeout(300); if (!(await p.evaluate(() => window.__v4.etat().BB.length))) break; }
  await p.waitForTimeout(150); await p.screenshot({ path: "v13-k-boule3.png" });
  log.push("boule fin " + await p.evaluate(() => { const S = window.__v4.etat(); return S.BB.length + " dans:" + S.E.filter(e => e.dansBoule).length + " pvB:" + Math.round(S.B.pv); }));
  await p.waitForTimeout(1500);
  // ---- F. le berserker en toupie
  await vider();
  await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; S.slots = ["acide", "fleur"]; V.lancer(h.x, h.y - 160); });
  await p.waitForTimeout(600);
  await p.evaluate(() => { const V = window.__v4, S = V.etat(), h = S.hero; V.sortir("berserker", h.x + 10, h.y - 330); V.sortir("rapide", h.x - 25, h.y - 110); V.sortir("rapide", h.x + 30, h.y - 100); S.E[1].etourdi = 5; S.E[2].etourdi = 5; });
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => window.__v4.etat().E.some(e => e.toupie > 0))) break; }
  await p.waitForTimeout(200); await p.screenshot({ path: "v13-l-toupie.png" });
  log.push("toupie " + await p.evaluate(() => JSON.stringify(window.__v4.etat().combosPartie)) + " pv " + await p.evaluate(() => window.__v4.etat().pv));
  console.log(log.join("\n")); console.log("erreurs", errs);
  await b.close();
})();
