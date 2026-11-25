# Version 22 : la mise en page tablette [Romain, 25 nov., 21 h 07 : « fais-moi une version tablette aussi […] ce jeu se joue portable et tablette »]
# Tenue en large (ou sur un grand écran), en plein écran : la salle se range à gauche, les jauges, les pouvoirs et le bouton Graver vont dans une colonne à droite.
# Sur un grand écran tactile, « Commencer » prend déjà toute la place. Travaille sur « html », après build21_part.py.
import re as _re
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 21 : un jeu de runes.", "Maquette n° 22 : un jeu de runes, avec plus de golems qu’en version 21. Sur tablette, tiens-la en large : la salle se range à gauche, les jauges et le bouton à droite.")
rep("Mesures (version 21)", "Mesures (version 22)")
rep("function view() { const k = Math.min(cv.width / G.W, cv.height / (G.H + TOP)); return { k, ox: (cv.width - G.W * k) / 2, oy: TOP * k + (cv.height - (G.H + TOP) * k) / 2 }; }",
    "function view() { const k = Math.min(cv.width / G.W, cv.height / (G.H + TOP)), libre = cv.width - G.W * k, col = document.body.classList.contains('plein') && libre >= 0.24 * cv.width && libre >= 250 * (R8.dpr || 1); R8.col = col; return { k, ox: col ? 0 : libre / 2, oy: TOP * k + (cv.height - (G.H + TOP) * k) / 2 }; }")
rep("  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\n  hud(cw, ch);\n  hudCards(cw, ch);", """  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (R8.col) {   // la colonne de droite : les jauges et les pouvoirs s'y rangent, la salle reste dégagée
    const X = G.W * k / dpr + 4, cle = Math.round(cw - X) + '';
    if (R8.colCle !== cle) { R8.colCle = cle; document.body.classList.add('col'); document.body.style.setProperty('--col', cle + 'px'); }
    ctx.translate(X, 0); hud(cw - X, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(X, 0); hudCards(cw - X, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  } else { if (R8.colCle) { R8.colCle = ''; document.body.classList.remove('col'); } hud(cw, ch); hudCards(cw, ch); }""")
rep("  const pw = Math.min(200, cw * 0.4), fs = cw < 500 ? 13 : 15;\n  const panel =", "  const pw = R8.col ? (cw - 24) / 2 : Math.min(200, cw * 0.4), fs = R8.col ? 14 : cw < 500 ? 13 : 15;\n  const panel =")
rep("  let y = Math.max(96, (R8.hudBottom || 0) + 8, Math.round((view().oy + 142 * view().k) * cw / cv.width));", """  let y = Math.max(96, (R8.hudBottom || 0) + 8, Math.round((view().oy + 142 * view().k) * cw / cv.width));
  if (R8.col) { y = Math.max(96, Math.round((view().oy + 142 * view().k) / R8.dpr)); ctx.setTransform(R8.dpr, 0, 0, R8.dpr, 0, 0); cw = G.W * view().k / R8.dpr; }   // les messages restent au milieu de la salle""")
n0 = html.count("    const leg = s.heart.bare ? '' : ")
assert n0 == 1, n0
html = _re.sub(r"    const leg = s\.heart\.bare \? '' : [^\n]*\n", "    const leg = 'trait (2) · V (2)' + (G.lv(s, 'spirale') ? ' · escargot (½)' : '') + (G.lv(s, 'mur') ? ' · arc de cercle (2)' : '') + (G.lv(s, 'dome') ? ' · cercle fermé (4)' : '');   // seulement les runes qu'on connaît\n", html, count=1)
rep("  const fs = cw < 500 ? 13 : 15, y = 92, ids =", "  const fs = R8.col ? 14 : cw < 500 ? 13 : 15, y = R8.col ? 108 : 92, ids =")
rep("  let x = 8; const chip = cw < 500 ? 30 : 34;", "  let x = 8; const chip = R8.col ? 40 : cw < 500 ? 30 : 34;")
rep("const maxX = cw < 700 ? cw * 0.6 : Math.max(cw * 0.35, 260);", "const maxX = R8.col ? cw - 8 : cw < 700 ? cw * 0.6 : Math.max(cw * 0.35, 260);")
rep("body.plein{overflow:hidden}", "body.plein{overflow:hidden}\nbody.plein.col .brush{right:calc(var(--col) / 2 - 78px);bottom:5%;width:156px;font-size:25px}\nbody.plein.col .tools{right:10px;top:58px}")
# sur un grand écran tactile, « Commencer » prend déjà toute la place (sans demander le plein écran au navigateur)
rep("  if (on) pleinAPI(); else sortieAPI();", "  if (on && !setPlein.sansAPI) pleinAPI(); else if (!on) sortieAPI();\n  setPlein.sansAPI = false;")
rep("$('bStart').onclick = start;", "const grandEcran = () => Math.min(innerWidth, innerHeight) >= 600 && (navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches);\n$('bStart').onclick = () => { if (grandEcran()) { setPlein.sansAPI = true; setPlein(true); } start(); };")
rep("toutes les 3 minutes, les golems ont une vie de plus, les gros deux de plus ; après 5 minutes, encore une de plus toutes les 2 minutes.", "toutes les 2 minutes, les golems ont une vie de plus (les gros, deux de plus toutes les 2 min 30) ; après 5 minutes, encore une de plus toutes les 80 secondes. Et ils sont plus nombreux qu’en version 21.")
