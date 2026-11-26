# Version 26 : la page des cinq builds nouveaux (textes, aide-mémoire, dessins : la cage, les traces, les golems domptés, le rayon surchargé).
# Travaille sur « html », après build25_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 25 : un jeu de runes.", "Maquette n° 26 : un jeu de runes, avec 14 builds (5 nouveaux : la Prison de cristal, le Calligraphe, le Champ de mines, le Rayon solaire, le Dompteur).")
rep("Mesures (version 25)", "Mesures (version 26)")
rep("la Lumière aveuglante 💫 (le trait sonne les golems qu’il ne détruit pas).", "la Lumière aveuglante 💫 (le trait sonne les golems qu’il ne détruit pas), et la rune de la cage 🔒 (un cercle fermé loin de tes amis enferme les golems ; autour de tes amis, c’est le bouclier).")
rep("      <li>🦉 <b>Parlement des chouettes</b> : la chouette + pas léger</li>\n    </ul>", """      <li>🦉 <b>Parlement des chouettes</b> : la chouette + pas léger</li>
      <li>💠 <b>Prison de cristal</b> (la cage) : rune de la cage + bouclier de cristal</li>
      <li>✍️ <b>Le calligraphe</b> (enchaîner des runes de formes différentes) : plume agile + tir rapide</li>
      <li>💣 <b>Champ de mines</b> (des pièges au sol) : traces de lumière + rune piège</li>
      <li>🌞 <b>Rayon solaire</b> (garder son encre) : encre pure + méditation</li>
      <li>🐂 <b>Le dompteur</b> (des golems dans ton camp) : collier de lumière + lasso de lumière</li>
    </ul>""")
rep("(G.lv(s, 'dome') ? ' · cercle fermé (4)' : '')", "(G.lv(s, 'dome') ? ' · cercle autour des amis : bouclier (4)' : '') + (G.lv(s, 'cage') ? ' · cercle loin des amis : cage (3)' : '')")
# ---------- le rayon surchargé : deux fois plus large ----------
i = html.index("    if (e.k === 'beam') {\n      ctx.lineCap = 'round';"); j = html.index("    if (e.k === 'ring') {", i)
blk = html[i:j]
blk2 = blk.replace("ctx.lineWidth = 80;", "ctx.lineWidth = 80 * (e.sur ? 2.2 : 1);").replace("ctx.lineWidth = 30;", "ctx.lineWidth = 30 * (e.sur ? 2.2 : 1);").replace("ctx.lineWidth = 9;", "ctx.lineWidth = 9 * (e.sur ? 2.2 : 1);")
assert blk2.count('e.sur') == 3, blk
html = html[:i] + blk2 + html[j:]
# ---------- les golems domptés : suivis et dessinés comme les autres, avec un anneau doré ----------
rep("function trackUnits(dt) {\n  const seen = new Set();\n  for (const u of s.soldiers) {", "function trackUnits(dt) {\n  const seen = new Set();\n  for (const u of [...s.soldiers, ...(s.allies || [])]) {")
rep("  for (const u of s.soldiers) { const a = R8.anim.get(u.id); if (a) items.push({ y: u.y + FOOT(u.type), d: () => drawGolem(u, a, t) }); }", """  for (const u of s.soldiers) { const a = R8.anim.get(u.id); if (a) items.push({ y: u.y + FOOT(u.type), d: () => drawGolem(u, a, t) }); }
  for (const u of s.allies || []) { const a = R8.anim.get(u.id); if (a) items.push({ y: u.y + FOOT(u.type), d: () => { const F = FOOT(u.type), R = GOLEM[u.type].bw * 0.62, f = Math.min(1, u.allyT / 2); ctx.save(); ctx.globalAlpha = 0.45 + 0.4 * f; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(u.x, u.y + F, R, R * 0.38, 0, 0, TAU); ctx.stroke(); ctx.restore(); drawGolem(u, a, t); ctx.save(); ctx.fillStyle = '#ffd23f'; ctx.font = '700 18px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('★', u.x, u.y - GOLEM[u.type].H * 1.05); ctx.restore(); } }); }""")
# ---------- les cages et les traces, au sol ; les barreaux de la cage, devant ----------
rep("  drawZones(t);\n", """  drawZones(t);
  for (const tr of s.traces || []) { const f = Math.max(0, tr.t / tr.max), cl = G.lv(s, 'mines') ? '255,150,80' : '255,214,90'; ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = `rgba(${cl},${0.2 + 0.45 * f})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(tr.a.x, tr.a.y); ctx.lineTo(tr.b.x, tr.b.y); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = `rgba(255,250,220,${0.15 + 0.3 * f})`; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  for (const cg of s.cages || []) { const fin = cg.t < 1 ? 0.5 + 0.5 * Math.sin(t * 24) : 1; ctx.save(); ctx.beginPath(); ctx.arc(cg.x, cg.y, cg.R, 0, TAU); ctx.fillStyle = `rgba(150,225,255,${0.13 * fin})`; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(170,235,255,${0.85 * fin})`; ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(255,255,255,${0.5 * fin})`; ctx.beginPath(); ctx.arc(cg.x, cg.y, cg.R - 7, 0, TAU); ctx.stroke(); ctx.restore(); }
""")
rep("  items.sort((a, b) => a.y - b.y).forEach(i => i.d());\n", """  items.sort((a, b) => a.y - b.y).forEach(i => i.d());
  for (const cg of s.cages || []) { const fin = cg.t < 1 ? 0.5 + 0.5 * Math.sin(t * 24) : 1, n = Math.max(10, Math.round(cg.R / 9)); ctx.save(); ctx.globalAlpha = 0.75 * fin; for (let i = 0; i < n; i++) { const an = i / n * TAU, x = cg.x + Math.cos(an) * cg.R, y = cg.y + Math.sin(an) * cg.R; const g = ctx.createLinearGradient(x, y, x, y - 46); g.addColorStop(0, 'rgba(170,235,255,.9)'); g.addColorStop(1, 'rgba(220,250,255,.15)'); ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 46); ctx.stroke(); ctx.fillStyle = '#e6fbff'; ctx.beginPath(); ctx.moveTo(x, y - 52); ctx.lineTo(x + 4, y - 46); ctx.lineTo(x, y - 40); ctx.lineTo(x - 4, y - 46); ctx.fill(); } ctx.restore(); }
""")
