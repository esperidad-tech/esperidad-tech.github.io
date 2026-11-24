// la planche des golems du combat de l'Alchimiste (version 15) : chaque sorte, de face, tournée, ses gestes, ses états
const { chromium } = require("playwright");
const fs = require("fs");
function golemsOuverts(t) {
  const a = "return { TYPES, PAL, peindre,", b = "function sol(x, r) { //";
  if (!t.includes(a) || !t.includes(b)) throw new Error("golems.js a changé : revoir l'ouverture");
  return t.replace(a, "return { PEINTRES, O_: { plaque, roc, veines, oeil, dents, pointe, fourneau, membre, coude, patte, bras, sol, glace, allure, pattes, braise, BRONZE, FER, ROC, OS, OR, NOIR }, TYPES, PAL, peindre,").replace(b, "function sol(x, r) { if (sol.off) return; //");
}
(async () => {
  const quoi = process.argv[2] || "tous";
  const code = fs.readFileSync("modeles/outils.js", "utf8") + "\n" + golemsOuverts(fs.readFileSync("modeles/golems.js", "utf8")) + "\n" + fs.readFileSync("golems-alchimiste.js", "utf8");
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1, viewport: { width: 1500, height: 1000 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message + " " + (e.stack || "").split("\n").slice(1, 3).join(" ")));
  await p.setContent('<body style="margin:0;background:#16303a"><canvas id=c></canvas><script>' + code + "</script></body>");
  const dt = await p.evaluate((quoi) => {
    const A = { tous: ["rapide", "bouclier", "lourd", "cracheur", "berserker", "souffleur", "chevalier", "porteur", "colosse"], boss: ["glouton", "frileux", "singe", "sauteur"] }[quoi];
    const SPEC = { bouclier: [{ sansBouclier: true }], chevalier: [{ grille: true }, { yaw: 1, grille: true, etat: "frappe" }], porteur: [{ porte: 1 }, { porte: 1, yaw: -1, etat: "arme" }], colosse: [{ denude: true }, { denude: true, yaw: 1 }],
      glouton: [{ bouche: 1 }, { dort: true, gonfle: true }], frileux: [{ chaud: 0.5 }, { chaud: 1 }], singe: [{ etat: "arme", yaw: 1 }], sauteur: [{ ressort: 0.5 }, { ressort: 0 }], berserker: [{ etat: "charge" }], souffleur: [{ etat: "arme" }, { etat: "frappe" }], cracheur: [{ etat: "frappe" }] };
    const Z = quoi === "boss" ? 2.4 : 2.2, CW = quoi === "boss" ? 230 : 165, CH = quoi === "boss" ? 250 : 200, cols = [{ yaw: 0 }, { yaw: 1 }, { yaw: -1, k: 4, pied: 1 }, { yaw: 0, etat: "arme" }, { yaw: 0, etat: "frappe" }];
    const c = document.getElementById("c"); c.width = CW * 9; c.height = CH * A.length + 20; const g = c.getContext("2d"); g.fillStyle = "#1b3a45"; g.fillRect(0, 0, c.width, c.height);
    GolemsA.regler(Z * 1.2); const t0 = performance.now(); let n = 0;
    A.forEach((ty, j) => {
      const base0 = ty === "sauteur" ? { ressort: 1 } : {};
      const liste = cols.map(o => Object.assign({ k: 2, pied: 0, etat: "marche" }, base0, o)).concat((SPEC[ty] || []).map(o => Object.assign({ yaw: 0, k: 2, pied: 0, etat: "marche" }, base0, o)));
      liste.forEach((o, i) => { GolemsA.dessiner(g, ty, i * CW + CW / 2, j * CH + CH - 14, Z, o); n++; });
      [["mouille", 0], ["farine", 0], ["boue", 0], ["statue", 0], ["feu", 0], ["elec", 0]].slice(0, 9 - liste.length).forEach((q, i) => { GolemsA.dessiner(g, ty, (liste.length + i) * CW + CW / 2, j * CH + CH - 14, Z, Object.assign({ yaw: 0, k: 2, pied: 0, etat: "marche" }, base0), q[0]); });
      g.fillStyle = "#fff"; g.font = "13px sans-serif"; g.fillText(ty + " → " + GolemsA.MODELE[ty].m + " (" + Math.round(GolemsA.haut(ty)) + ")", 6, j * CH + 16);
    });
    return Math.round((performance.now() - t0) / n * 10) / 10;
  }, quoi);
  const h = await p.evaluate(() => document.getElementById("c").height);
  await p.setViewportSize({ width: 1500, height: Math.min(h, 1900) });
  await p.screenshot({ path: "planche-v15-" + quoi + ".png" }); console.log(quoi, dt, "ms par golem ; erreurs", errs); await b.close();
})();
