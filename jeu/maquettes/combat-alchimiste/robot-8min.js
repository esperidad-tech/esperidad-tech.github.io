const { chromium, devices } = require("playwright");
const fs = require("fs");
const DUREE = +(process.argv[2] || 90000); const VIT = +(process.env.VIT || 3); const IMMORTEL = !!process.env.IMMORTEL;
(async () => {
  const src = fs.readFileSync("pieges-alchimiste.html", "utf8");
  fs.writeFileSync("apercu-v4.html", '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>' + src + "</body></html>");
  const b = await chromium.launch(); const errs = [];
  const quels = (process.argv[3] || "iphone,pc").split(",");
  for (const [nom, opts] of [["iphone", { ...devices["iPhone 13"] }], ["pc", { viewport: { width: 1200, height: 900 } }]].filter(x => quels.includes(x[0]))) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    p.on("pageerror", e => errs.push(nom + ": " + e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(nom + ": " + m.text()); });
    await p.goto("file://" + process.cwd() + "/apercu-v4.html"); await p.waitForTimeout(300);
    await p.screenshot({ path: "v4-regles-" + nom + ".png" });
    await p.click("#btn-go"); await p.waitForTimeout(300);
    await p.evaluate(([v, im]) => { window.__v4.vitesse(v); if (im) setInterval(() => { const S = window.__v4.etat(); if (S && S.enCours) S.pv = Math.max(S.pv, 60); }, 100); }, [VIT, IMMORTEL]);
    let journal = 0, moitie = null;
    const dims = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, vw: innerWidth, vh: innerHeight, bande: document.querySelector(".bande").scrollWidth, bandeW: document.querySelector(".bande").clientWidth }));
    const t0 = Date.now(); let tours = 0, shot = 0, boumShots = 0;
    while (Date.now() - t0 < DUREE) {
      const st = await p.evaluate(() => { const S = window.__v4.etat(); if (!S || !S.enCours) return null; return { L: window.__v4.L, pv: S.pv, B: { x: S.B.x, y: S.B.y }, h: { x: S.hero.x, y: S.hero.y }, E: S.E.map(e => ({ x: e.x, y: e.y, t: e.t, enf: e.enfarine > 0, m: e.mouille > 0 })), O: S.O.filter(o => o.actif).map(o => ({ x: o.x, y: o.y })) }; });
      if (!st) break;
      tours++;
      const J = await p.evaluate(() => { const S = window.__v4.etat(); return { t: Math.round(S.temps), B: Math.round(S.B.pv), pl: Math.round(1200 * Math.max(0, 1 - S.temps / 480)), E: S.E.length, f: S.file.length, pv: Math.round(S.pv), salve: S.dir.i, seuil: S.dir.seuil, bouclier: S.bouclierB > 0, col: S.nColeres, tues: S.tues }; });
      if (J.t >= journal) { journal += 30; console.log(nom, JSON.stringify(J)); }
      if (moitie === null && J.B <= 600) { moitie = J.t; console.log(nom, "moitié à", J.t, "s"); }
      const box = await p.$eval("#cv", c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top }; });
      const scr = (gx, gy) => ({ x: box.x + gx * st.L.s, y: box.y + (st.L.top + gy * 0.75) * st.L.s });
      if (!st.E.length) { await p.waitForTimeout(300); continue; }
      // la grappe la plus dense
      let best = st.E[0], bn = 0;
      st.E.forEach(e => { const n = st.E.filter(o => Math.hypot(o.x - e.x, o.y - e.y) < 60).length; if (n > bn) { bn = n; best = e; } });
      const pres = st.E.filter(e => Math.hypot(e.x - st.h.x, e.y - st.h.y) < 110).length;
      // l'Alchimiste glisse sous la grappe en la gardant alignée avec Grosbec (glisser à la souris)
      const visX = Math.max(30, Math.min(330, best.x + (best.x - st.B.x) * 0.25));
      if (!process.argv[5] && tours % 3 === 0 && Math.abs(visX - st.h.x) > 30) {
        const a = scr(st.h.x, st.h.y - 10), z = scr(visX, st.h.y - 10);
        await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x + (z.x - a.x) / 2, a.y, { steps: 3 }); await p.mouse.move(z.x, z.y, { steps: 3 }); await p.mouse.up();
      }
      let rec, cible, boireIt = false;
      const r = tours % 8;
      const MODE = process.argv[5] || "";
      if (MODE === "boum") {
        // comme Romain : un BOUM sur le groupe le plus proche de l'Alchimiste
        const proche = st.E.slice().sort((a, b) => Math.hypot(a.x - st.h.x, a.y - st.h.y) - Math.hypot(b.x - st.h.x, b.y - st.h.y))[0];
        rec = ["feu", "farine"]; cible = { x: proche.x, y: proche.y };
      }
      else if (st.pv < 40 && tours % 4 === 0) { rec = ["fleur", "fleur"]; boireIt = true; }
      else if (pres >= 5) { rec = ["eau", "eau", "eau"]; cible = { x: st.h.x, y: st.h.y - 50 }; }
      else if (r === 0 || r === 4) { rec = ["eau", "eau"]; cible = { x: st.B.x, y: st.B.y + 80 }; }
      else if (r === 1) { rec = ["acide", "fleur"]; cible = { x: (best.x + st.B.x) / 2, y: (best.y + 140) / 2 }; }
      else if (r === 2) { rec = ["feu", "farine"]; cible = { x: best.x + (best.x - st.B.x) * 0.15, y: best.y + 25 }; }
      else if (r === 3) { rec = ["farine", "acide"]; cible = best; }
      else if (r === 5) { rec = ["farine"]; cible = best; }
      else if (r === 6) { rec = ["feu"]; cible = best; }
      else { rec = tours % 16 === 7 ? ["eau", "fleur"] : ["eau", "acide"]; cible = best; }
      try { for (const id of rec) await p.click(`.pot[data-ing=${id}]`, { timeout: 2000 }); } catch (e) { console.log("clic raté", rec.join(), (await p.evaluate(() => { const S = window.__v4.etat(); return JSON.stringify({ slots: S.slots, vise: !!S.vise, glisse: !!S.glisse, rayon: !!S.rayon, pause: S.pause, fin: !S.enCours }); }))); break; }
      if (boireIt) { const q = scr(st.h.x, st.h.y - 15); await p.mouse.move(q.x, q.y); await p.mouse.down(); await p.mouse.up(); }
      else { const q = scr(Math.max(10, Math.min(350, cible.x)), Math.min(Math.max(cible.y, 10), st.h.y - 60)); await p.mouse.move(q.x, q.y); await p.mouse.down(); await p.mouse.up();
        const apres = await p.evaluate(([x, y]) => { const S = window.__v4.etat(); const el = document.elementFromPoint(x, y); return { n: S.slots.length, el: el && (el.id || el.className), h: S.hero, vise: !!S.vise, glisse: !!S.glisse }; }, [q.x, q.y]);
        if (apres.n) console.log("lancer raté", rec.join(), JSON.stringify(cible), JSON.stringify(q), JSON.stringify(apres)); }
      if (rec.join() === "feu,farine" && boumShots < 2 && Date.now() - t0 > 15000 * (boumShots + 1)) { boumShots++; await p.waitForTimeout(380); await p.screenshot({ path: "v5-boum-" + nom + "-" + boumShots + ".png" }); await p.waitForTimeout(700); await p.screenshot({ path: "v5-apres-" + nom + "-" + boumShots + ".png" }); }
      await p.waitForTimeout(+(process.argv[4] || 420));
      if (shot < 6 && Date.now() - t0 > 25000 * (shot + 1)) { shot++; await p.screenshot({ path: "v9-jeu-" + nom + "-" + shot + ".png" }); }
    }
    await p.waitForTimeout(1600);
    const fin = await p.evaluate(() => { const S = window.__v4.etat(); return { fin: !S.enCours, temps: Math.round(S.temps), pv: Math.round(S.pv), boss: Math.round(S.B.pv), nE: S.E.length, tues: S.tues, coups: S.coupsBoss, chaine: S.chaineMax, combos: S.combosPartie, titre: document.getElementById("fin-titre").textContent }; });
    await p.screenshot({ path: "v9-fin-" + nom + ".png" });
    console.log(nom, JSON.stringify(dims), "tours", tours, JSON.stringify(fin));
    await ctx.close();
  }
  console.log("erreurs:", errs.slice(0, 10));
  await b.close();
})();
