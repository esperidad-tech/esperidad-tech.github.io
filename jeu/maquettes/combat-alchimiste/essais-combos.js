const { chromium, devices } = require("playwright");
const fs = require("fs");
(async () => {
  const src = fs.readFileSync("pieges-alchimiste.html", "utf8");
  fs.writeFileSync("apercu-v4.html", '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + "</body></html>");
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ ...devices["iPhone 13"] }); const p = await ctx.newPage();
  p.on("pageerror", e => errs.push(e.message + " " + (e.stack || "").split("\n")[1]));
  await p.goto("file://" + process.cwd() + "/apercu-v4.html"); await p.click("#btn-go");
  const ev = (f, a) => p.evaluate(f, a);
  const W = ms => p.waitForTimeout(ms);
  const lancer = (slots, x, y) => ev(([s, x, y]) => { const S = window.__v4.etat(); S.slots = s; window.__v4.lancer(x, y); }, [slots, x, y]);
  // place n automates debout en grappe autour d'un point
  const grappe = (n, x, y, type) => ev(([n, x, y, type]) => { const S = window.__v4.etat(); const L = S.E.filter(e => e.etat === "debout" && !e.statue && !e.lie && !e.attrape && (!type || e.t === type)).slice(0, n);
    L.forEach((e, i) => { e.x = x + (i % 3) * 22 - 22; e.y = y + Math.floor(i / 3) * 22; e.vx = e.vy = 0; e.panique = 0; e.mouille = 0; e.enfarine = 0; e.colle = 0; e.immuFeu = 0; e.cd = 9; }); return L.length; }, [n, x, y, type || null]);
  const combos = () => ev(() => window.__v4.etat().combosPartie);
  await W(9000);
  const essais = {};
  const essai = async (nom, fn, cle) => { const avant = (await combos())[cle] || 0; await fn(); const apres = (await combos())[cle] || 0; essais[nom] = apres > avant ? "OK" : "rien"; };
  await ev(() => { const S = window.__v4.etat(); S.pv = 1000; S.rageT = 999; });
  await essai("CRAC", async () => { await grappe(1, 180, 300); await lancer(["feu"], 180, 300); await W(700); await lancer(["eau"], 180, 300); await W(700); }, "crac");
  await essai("brûlants", async () => { await grappe(3, 120, 280); await lancer(["feu", "feu"], 140, 290); await W(700); await lancer(["farine"], 140, 290); await W(900); }, "brulants");
  await essai("statue", async () => { await grappe(2, 240, 300); await lancer(["eau", "farine"], 250, 300); await W(500); await lancer(["feu"], 250, 300); await W(700); }, "statue");
  const statues = await ev(() => window.__v4.etat().E.filter(e => e.statue > 0).length);
  await essai("statue brisée", async () => { await lancer(["feu", "farine"], 250, 330); await W(900); }, "statue");
  await essai("siamois", async () => { await grappe(4, 180, 260); await lancer(["eau", "farine", "farine"], 190, 270); await W(600); }, "siamois");
  const lies = await ev(() => window.__v4.etat().E.filter(e => e.lie).length);
  await W(200); await p.screenshot({ path: "v7-siamois.png" });
  await essai("bulles", async () => { await grappe(4, 140, 330); await lancer(["acide", "fleur"], 160, 340); await W(500); await lancer(["eau"], 160, 340); await W(700); }, "bulles");
  const enBulle = await ev(() => window.__v4.etat().E.filter(e => e.etat === "bulle").length);
  await W(500); await p.screenshot({ path: "v7-bulles.png" });
  await essai("lance-pierre", async () => { await grappe(3, 220, 350); await lancer(["eau", "fleur"], 230, 360); await W(1500); await lancer(["acide"], 230, 360); await W(500); }, "lancepierre");
  await essai("bain", async () => { await grappe(3, 120, 220); await lancer(["acide", "fleur"], 130, 230); await W(500); await lancer(["farine", "acide"], 140, 230); await W(800); }, "bain");
  await W(400); await p.screenshot({ path: "v7-bain.png" });
  await essai("pop-corn", async () => { await grappe(4, 250, 220); await lancer(["farine", "acide"], 260, 230); await W(2000); await lancer(["feu"], 260, 230); await W(1500); }, "popcorn");
  await essai("tourbillon", async () => {
    const h = await ev(() => { const S = window.__v4.etat(); return { x: S.hero.x, y: S.hero.y }; });
    await lancer(["acide", "fleur", "fleur"], h.x, h.y - 70); await W(500);
    await grappe(4, h.x, h.y - 80); await ev(() => { const S = window.__v4.etat(); S.slots = ["eau", "eau", "eau"]; window.__v4.lancer(S.hero.x, S.hero.y - 50); }); await W(600);
  }, "tourbillon");
  await W(200); await p.screenshot({ path: "v7-tourbillon.png" });
  await essai("miroir", async () => {
    await ev(() => { const S = window.__v4.etat(); const e = S.E.find(e => e.t === "bouclier" && e.etat === "debout") || S.E.find(e => e.etat === "debout"); e.t = "bouclier"; e.shield = true; e.x = S.hero.x; e.y = S.hero.y - 200; e.vx = e.vy = 0; e.cd = 99; e.etourdi = 5;
      S.slots = ["feu", "feu", "feu"]; window.__v4.boire(); S.ptr = { x: e.x + e.r + 6, y: e.y }; });
    await W(1500);
  }, "miroir");
  await p.screenshot({ path: "v7-miroir.png" });
  await essai("électrique", async () => { await grappe(5, 180, 200); await lancer(["eau", "acide"], 180, 210); await W(800); }, "elec");
  // le cracheur et le souffleur : on attend qu'ils arrivent
  await ev(() => { const S = window.__v4.etat(); S.temps = 80; });
  await W(12000);
  const fin = await ev(() => { const S = window.__v4.etat(); return { types: S.E.reduce((m, e) => (m[e.t] = (m[e.t] || 0) + 1, m), {}), boules: S.boules.length, combos: S.combosPartie, boss: Math.round(S.B.pv) }; });
  await p.screenshot({ path: "v7-cracheurs.png" });
  console.log(JSON.stringify(essais), "statues", statues, "liés", lies, "en bulle", enBulle);
  console.log(JSON.stringify(fin));
  console.log("erreurs:", errs.slice(0, 6));
  await b.close();
})();
