# Version 23 : la page (les pages à heure fixe, les textes). Travaille sur « html », après build22_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 22 : un jeu de runes, avec plus de golems qu’en version 21.", "Maquette n° 23 : un jeu de runes. Deux fois plus de golems qu’en version 22. Les pages du grimoire tombent maintenant à heure fixe : toujours 19 en 10 minutes.")
rep("Mesures (version 22)", "Mesures (version 23)")
rep("  const need = s.pageNeed - s.grosKills;", "  const need = Math.max(0, Math.ceil(s.pageT ?? 0));")
rep("  const lab = `📄 encore ${need} gros`,", "  const lab = s.pages.length ? '📄 une page t’attend !' : `📄 page dans ${need} s`,")
rep("<b>Les pages du grimoire :</b> les gros golems (les béliers et les colosses) lâchent une page dorée : il faut 1, 1, 1 gros, puis 2, 2, 2, puis 3… Passe dessus : le combat attend, et tu choisis une carte parmi trois.", "<b>Les pages du grimoire :</b> elles tombent toutes seules, à heure fixe : la première après 20 secondes, puis toutes les 23 à 40 secondes. Toujours 19 pages en 10 minutes, quoi que tu détruises. Elles tombent un peu à l’écart de tes amis : va les chercher. Le combat attend pendant que tu choisis une carte parmi trois.")
n = html.count("Les gros golems lâchent des pages dorées : passe dessus pour choisir un pouvoir, et construis ton build.")
assert n >= 1, n
html = html.replace("Les gros golems lâchent des pages dorées : passe dessus pour choisir un pouvoir, et construis ton build.", "Des pages dorées tombent du grimoire, à heure fixe : va les chercher pour choisir un pouvoir, et construis ton build.")
rep("Et ils sont plus nombreux qu’en version 21.", "Et ils sont deux fois plus nombreux qu’en version 22.")

# ---------- la tablette [Romain, 22 h 51 : « c'est vraiment affreux d'avoir le jeu d'un côté, et du noir de l'autre. […] fais en sorte que le jeu soit au centre de l'écran. Après tu fais un petit habillage joli autour »] ----------
# La salle revient au centre. Les deux marges sont habillées (pierre bleu nuit, cadre de bronze) : les jauges et les pouvoirs à gauche, les boutons et Graver à droite.
rep("col = document.body.classList.contains('plein') && libre >= 0.24 * cv.width && libre >= 250 * (R8.dpr || 1); R8.col = col; return { k, ox: col ? 0 : libre / 2,", "col = document.body.classList.contains('plein') && libre >= 330 * (R8.dpr || 1); R8.col = col; return { k, ox: libre / 2,")
rep("""    const X = G.W * k / dpr + 4, cle = Math.round(cw - X) + '';
    if (R8.colCle !== cle) { R8.colCle = cle; document.body.classList.add('col'); document.body.style.setProperty('--col', cle + 'px'); }
    ctx.translate(X, 0); hud(cw - X, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(X, 0); hudCards(cw - X, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);""", """    const M = (cw - G.W * k / dpr) / 2, cle = Math.round(M) + '';   // M : la largeur de chaque marge
    if (R8.colCle !== cle) { R8.colCle = cle; document.body.classList.add('col'); document.body.style.setProperty('--col', cle + 'px'); }
    const habille = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#0a0f1f'); g.addColorStop(0.5, '#151d38'); g.addColorStop(1, '#0a0f1f'); ctx.fillStyle = g; ctx.fillRect(x0, 0, x1 - x0, ch);
      ctx.strokeStyle = '#8a6a2e'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 5, 5, x1 - x0 - 10, ch - 10); ctx.strokeStyle = 'rgba(201,162,90,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x0 + 10, 10, x1 - x0 - 20, ch - 20);
      ctx.fillStyle = 'rgba(201,162,90,.55)'; for (let yy = ch * 0.5; yy < ch - 190; yy += 70) { const xx = (x0 + x1) / 2; ctx.beginPath(); ctx.moveTo(xx, yy - 8); ctx.lineTo(xx + 6, yy); ctx.lineTo(xx, yy + 8); ctx.lineTo(xx - 6, yy); ctx.fill(); } };
    habille(0, M - 1); habille(cw - M + 1, cw);
    ctx.translate(4, 0); hud(M - 4, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(4, 0); hudCards(M - 4, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);""")
rep("const pw = R8.col ? (cw - 24) / 2 : Math.min(200, cw * 0.4),", "const pw = R8.col ? cw - 16 : Math.min(200, cw * 0.4),")
rep("  // protection\n  panel(cw - 8 - pw, 8, pw, 42);", "  // protection (dans la marge : sous le chronomètre)\n  if (R8.col) ctx.translate(0, 48);\n  panel(cw - 8 - pw, 8, pw, 42);")
rep("  // encre (elle baisse pendant qu'on trace)\n", "  if (R8.col) ctx.translate(0, -48);\n  // encre (elle baisse pendant qu'on trace)\n")
rep("  const iy = 56;\n", "  const iy = R8.col ? 104 : 56;\n")
rep("ctx.setTransform(R8.dpr, 0, 0, R8.dpr, 0, 0); cw = G.W * view().k / R8.dpr; }", "ctx.setTransform(R8.dpr, 0, 0, R8.dpr, 0, 0); ctx.translate(view().ox / R8.dpr, 0); cw = G.W * view().k / R8.dpr; }")
rep("y = R8.col ? 108 : 92, ids =", "y = R8.col ? 146 : 92, ids =")
rep("const chip = R8.col ? 40 : cw < 500 ? 30 : 34;", "const chip = R8.col ? 36 : cw < 500 ? 30 : 34;")
rep("const maxX = R8.col ? cw - 8 :", "const maxX = R8.col ? cw - 4 :")
rep("body.plein.col .tools{right:10px;top:58px}", "body.plein.col .tools{right:calc((var(--col) - 144px) / 2);top:16px}")
rep("Sur tablette, tiens-la en large : la salle se range à gauche, les jauges et le bouton à droite.", "Sur tablette, tenue en large : la salle est au milieu, les jauges à gauche, le bouton Graver à droite.")
