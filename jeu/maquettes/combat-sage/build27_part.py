# Version 27 : les trois runes dorées du Sage (le triangle, la lune, l'étoile) dans la page. Travaille sur « html », après build26_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 26 : un jeu de runes, avec 14 builds", "Maquette n° 27 : un jeu de runes, avec 14 builds et les trois runes dorées du Sage (le triangle, la lune, l’étoile : une fois par combat chacune). Les builds")
rep("(5 nouveaux : la Prison de cristal, le Calligraphe, le Champ de mines, le Rayon solaire, le Dompteur).", "(dont la Prison de cristal, le Calligraphe, le Champ de mines, le Rayon solaire, le Dompteur).")
rep("Mesures (version 26)", "Mesures (version 27)")
rep("    <p class=\"note\"><b>Les pages du grimoire :</b>", """    <p class="note"><b>Les trois runes dorées</b> (une fois par combat chacune, gratuites ; pour l’essai, tu les as toutes dès le début) : trace un <b>triangle</b> △ : tous les golems sont projetés contre les murs ; une <b>lune</b> ☾ (un croissant, d’un seul trait) : ils sont aveuglés 6 secondes et errent sans frapper ; une <b>étoile</b> ★ à cinq branches, d’un seul trait (la plus dure) : tous les golems de la salle sont détruits. Les cases dorées montrent celles qui te restent ; touche-en une pour savoir ce qu’elle fait.</p>
    <p class="note"><b>Les pages du grimoire :</b>""")
# le rappel des runes, quand on grave
rep("(G.lv(s, 'cage') ? ' · cercle loin des amis : cage (3)' : '')", "(G.lv(s, 'cage') ? ' · cercle loin des amis : cage (3)' : '') + (s.dorees && (s.dorees.triangle || s.dorees.lune || s.dorees.etoile) ? ' · dorées : ' + [['triangle', '△'], ['lune', '☾'], ['etoile', '★']].filter(([k]) => s.dorees[k]).map(([, g]) => g).join(' ') : '')")
# les cases dorées
rep("function hudCards(cw, ch) {", """// version 27 : les trois runes dorées (une case chacune ; grise quand elle a servi)
const DOREES = [['triangle', 'Le triangle d’or', 'tous les golems sont projetés contre les murs, et se cognent.'], ['lune', 'La lune d’or', 'tous les golems sont aveuglés 6 secondes : ils errent sans frapper.'], ['etoile', 'L’étoile d’or', 'tous les golems de la salle sont détruits. Une étoile à cinq branches, d’un seul trait : la plus dure à tracer.']];
function glyphe(f, x, y, r) {
  ctx.beginPath();
  if (f === 'triangle') { for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 3; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 1.05) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 1.05); } ctx.closePath(); }
  else if (f === 'lune') { ctx.arc(x, y, r, Math.PI * 0.3, Math.PI * 1.7); ctx.arc(x + r * 0.45, y, r * 0.78, Math.PI * 1.62, Math.PI * 0.38, true); ctx.closePath(); }
  else { for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } }
}
function drawDorees(x, y, S, gap) {
  if (!s.dorees) return;
  DOREES.forEach(([f], i) => {
    const X = x + i * (S + gap), on = s.dorees[f];
    ctx.save(); ctx.globalAlpha = on ? 1 : 0.3;
    rr(X, y, S, S, S * 0.2); ctx.fillStyle = on ? 'rgba(60,44,8,.88)' : 'rgba(20,20,28,.7)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = on ? '#ffd23f' : '#777'; ctx.stroke();
    glyphe(f, X + S / 2, y + S / 2 + (f === 'triangle' ? S * 0.05 : 0), S * 0.3); ctx.lineWidth = Math.max(2, S * 0.07); ctx.lineJoin = 'round'; ctx.strokeStyle = on ? '#ffe58a' : '#999'; ctx.stroke();
    ctx.restore();
    (R8.chips = R8.chips || []).push({ id: 'd:' + f, dore: f, x: X, y, w: S, h: S });
  });
}
function hudCards(cw, ch) {""")
rep("detailPouvoirs(cw, ch, M);", "detailPouvoirs(cw, ch, M); { const S = Math.min(50, (M - 44) / 3); drawDorees((M - 3 * S - 16) / 2, ch * 0.95 - S - 6, S, 8); }")
rep("hud(cw, ch); hudCards(cw, ch); }", "hud(cw, ch); hudCards(cw, ch); { const S = cw < 500 ? 32 : 38; drawDorees(10, ch - S - 12, S, 6); } }")
# toucher une case dorée : un petit message
rep("    if (c && G.CARDS[c.id]) { e.preventDefault();", "    if (c && c.dore) { e.preventDefault(); const D = DOREES.find(d => d[0] === c.dore); s.msg = `${D[1]}${s.dorees[c.dore] ? '' : ' (déjà utilisée)'} : ${D[2]}`; s.msgT = 5; SON.play('brushOn'); return; }\n    if (c && G.CARDS[c.id]) { e.preventDefault();")
# le golem aveuglé : un « ? » au-dessus de lui
rep("  if (u.iron) { ctx.globalAlpha = born; const cw", "  if (u.aveugle > 0) { ctx.globalAlpha = born * (0.6 + 0.4 * Math.sin(t * 6 + u.id)); ctx.fillStyle = '#c9b8ff'; ctx.font = '800 20px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', Math.sin(t * 3 + u.id) * 6, -P.H * 1.02); ctx.globalAlpha = born; }\n  if (u.iron) { ctx.globalAlpha = born; const cw")
# l'effet d'une rune dorée, par-dessus la salle
rep("function drawChutes() {\n", """function drawChutes() {
  for (const e of s.fx) if (e.k === 'doree') {
    const a = e.life / e.max, p = 1 - a;
    ctx.save();
    if (e.f === 'etoile') { ctx.fillStyle = `rgba(255,250,225,${0.75 * a * a})`; ctx.fillRect(-60, -60, 1020, 1020); }
    if (e.f === 'lune') { ctx.fillStyle = `rgba(16,18,60,${0.55 * Math.sin(Math.PI * p)})`; ctx.fillRect(-60, -60, 1020, 1020); }
    glyphe(e.f, 450, 445, 60 + p * (e.f === 'lune' ? 260 : 520)); ctx.lineJoin = 'round'; ctx.lineWidth = 10 * a + 2; ctx.strokeStyle = `rgba(255,214,90,${a})`; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,240,${a})`; ctx.stroke();
    ctx.restore();
  }
""")
rep("    if (e.k === 'dome') for (let i = 0; i < 26; i++)", "    if (e.k === 'doree') for (let i = 0; i < 60; i++) { const an = i / 60 * TAU; burst(450 + Math.cos(an) * 120, 445 + Math.sin(an) * 100, 1, { k: 'spark', col: i % 2 ? '#ffd23f' : '#fff6c9', v0: 120, v1: 420, vz0: 80, vz1: 260, s0: 2, s1: 5, g: 300 }); }\n    if (e.k === 'dome') for (let i = 0; i < 26; i++)")
