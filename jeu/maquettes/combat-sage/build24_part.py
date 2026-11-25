# Version 24 : la page (le ralenti revenu, plus de sablier ; le détail des pouvoirs : dans la marge sur tablette, en message sur téléphone). Travaille sur « html », après build23_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 23 : un jeu de runes.", "Maquette n° 24 : un jeu de runes. Le temps ralentit de nouveau quand tu graves. Touche un de tes pouvoirs pour savoir ce qu’il fait (sur tablette, c’est écrit dans la marge).")
rep("Mesures (version 23)", "Mesures (version 24)")
rep("Tu démarres avec un trait court et un petit V, sans ralenti ; le mur, l’escargot, le bouclier et le ralenti se gagnent dans le grimoire.", "Tu démarres avec un trait court et un petit V ; le mur, l’escargot et le bouclier se gagnent dans le grimoire.")
rep("<p>Le bouton jaune ouvre le parchemin, en plein combat : trace un trait ou un V. Le mur, l’escargot, le bouclier et le ralenti du temps se gagnent dans le grimoire.</p>", "<p>Le bouton jaune ouvre le parchemin : le temps ralentit, trace un trait ou un V. Le mur, l’escargot et le bouclier se gagnent dans le grimoire.</p>")
rep("<b>Tu démarres avec peu :</b> un trait court et un petit V, sans ralenti. Le reste se gagne dans le grimoire : la rune du mur 🚧, l’escargot 🐌, le bouclier 🛡️ (un cercle fermé : tes amis sont intouchables un moment ; 4 d’encre, 8 secondes de recharge), le sablier ⏳ (le temps ralentit quand tu graves, 2 secondes par rune), le Grand V 📐, le Long trait 📏.", "<b>Tu démarres avec peu :</b> un trait court et un petit V. Quand tu graves, le temps ralentit très fort (et le chronomètre aussi : graver ne fait pas gagner de temps). Le reste se gagne dans le grimoire : la rune du mur 🚧, l’escargot 🐌, le bouclier 🛡️ (un cercle fermé : tes amis sont intouchables un moment ; 4 d’encre, 8 secondes de recharge), le Grand V 📐, le Long trait 📏, la Lumière aveuglante 💫 (le trait sonne les golems qu’il ne détruit pas).")
rep("SON.slow(on && G.lv(s, 'sablier') > 0); }", "SON.slow(on); }")
# ---------- le détail des pouvoirs ----------
rep("  for (const id of ids) {\n    if (x + chip > maxX) { x = 8; yy += chip + 4; } // pas de place : on passe à la ligne\n", "  R8.chips = [];\n  for (const id of ids) {\n    if (x + chip > maxX) { x = 8; yy += chip + 4; } // pas de place : on passe à la ligne\n    R8.chips.push({ id, x: x + (R8.col ? 4 : 0), y: yy, w: chip, h: chip });\n")
rep("hudCards(M - 4, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);", "hudCards(M - 4, ch); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); detailPouvoirs(cw, ch, M);")
rep("function hudCards(cw, ch) {", """// version 24, sur tablette : dans la marge de droite, la liste des pouvoirs qu'on a pris et le détail de celui qu'on a touché (au départ : le dernier pris)
function detailPouvoirs(cw, ch, M) {
  const ids = Object.keys(s.up).filter(id => s.up[id] > 0 && G.CARDS[id]); if (!ids.length) return;
  if (!ids.includes(R8.sel)) R8.sel = ids[ids.length - 1];
  if (R8.selN !== ids.length) { R8.selN = ids.length; R8.sel = R8.dernier && ids.includes(R8.dernier) ? R8.dernier : ids[ids.length - 1]; }
  const x0 = cw - M + 14, w = M - 28, bas = ch * 0.95 - 156 - 12; let y = 76;
  text('Tes pouvoirs', x0, y + 12, 13, '#c9a25a', 'left', 800); y += 22;
  const rh = ids.length > 11 ? 19 : 23;
  for (const id of ids) { const C = G.CARDS[id], on = id === R8.sel;
    if (on) { rr(x0 - 6, y - 2, w + 12, rh, 6); ctx.fillStyle = 'rgba(255,210,63,.18)'; ctx.fill(); }
    text(C.ic, x0 + 8, y + rh - 7, 13, '#fff', 'center', 400); text(C.nom.length > 17 ? C.nom.slice(0, 16) + '…' : C.nom, x0 + 21, y + rh - 7, 12, on ? '#ffe58a' : '#dfe6f7', 'left', 700);
    text('●'.repeat(s.up[id]), x0 + w, y + rh - 8, 8, '#ffd23f', 'right', 700);
    R8.chips.push({ id, x: x0 - 6, y: y - 2, w: w + 12, h: rh }); y += rh; }
  const C = G.CARDS[R8.sel], l = s.up[R8.sel]; y += 8;
  ctx.font = '600 12px Nunito, sans-serif'; const lines = wrap(C.txt(l), w), h = lines.length * 16 + 32;
  if (y + h > bas) return;   // pas la place : on touche le pouvoir, et le message le dit
  rr(x0 - 6, y, w + 12, h, 8); ctx.fillStyle = 'rgba(8,12,26,.88)'; ctx.fill(); ctx.strokeStyle = 'rgba(201,162,90,.55)'; ctx.lineWidth = 1; ctx.stroke();
  text(`${C.ic} ${C.nom}`, x0, y + 18, 12.5, '#ffe58a', 'left', 800);
  lines.forEach((ln, i) => text(ln, x0, y + 36 + i * 16, 12, '#dfe6f7', 'left', 600));
  R8.detailVu = true;
}
function hudCards(cw, ch) {""")
rep("cv.addEventListener('pointerdown', e => {\n  if (!s || paused || s.over) return;\n", """cv.addEventListener('pointerdown', e => {
  if (!s || paused || s.over) return;
  // toucher un pouvoir : sur tablette, son détail s'affiche dans la marge ; sinon un petit message dit ce que c'est
  if (!brush) { const r0 = cv.getBoundingClientRect(), px = e.clientX - r0.left, py = e.clientY - r0.top, c = (R8.chips || []).find(c => px >= c.x - 2 && px <= c.x + c.w + 2 && py >= c.y - 2 && py <= c.y + c.h + 2);
    if (c && G.CARDS[c.id]) { e.preventDefault(); R8.sel = c.id; R8.detailVu = false; const C = G.CARDS[c.id], l = s.up[c.id]; if (!R8.col) { s.msg = `${C.ic} ${C.nom} (niveau ${l}) : ${C.txt(l)}`; s.msgT = 5; } else setTimeout(() => { if (!R8.detailVu) { s.msg = `${C.ic} ${C.nom} (niveau ${l}) : ${C.txt(l)}`; s.msgT = 5; } }, 120); SON.play('brushOn'); return; } }
""")
rep("window.__test = { get s() { return s; },", "window.__test = { get s() { return s; }, get chips() { return R8.chips || []; }, get sel() { return R8.sel; }, get detailVu() { return !!R8.detailVu; },")
