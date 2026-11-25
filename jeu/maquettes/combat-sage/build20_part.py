# Version 20 : la page (le chronomètre sur le temps du combat, le rouge, les golems nouveaux, le Sage sonné, les textes).
# Travaille sur « html » (après build19_part.py), avant qu'on y colle les règles.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)

# ---------- le temps ----------
html = html.replace('s.realT', 's.t')    # le chronomètre et l'heure du combat : le temps du combat
rep("const gdt = dt * (brush && !s.over && !paused ? s.cfg.slow : 1)", "const gdt = dt * (s.lent && !s.over && !paused ? s.cfg.slow : 1)")
rep("G.newGame({ cfg: fast ? { duree: 40, rageAt: [20, 30] } : {} })", "G.newGame({ cfg: fast ? { duree: 75, rageAt: [48, 62], gbFirst: 6, gbEveryDebut: 7, gbEvery: 7, gbEveryRage: 6, dalleAt: 2, bombeAt: 10, mortierAt: 6, mortierEvery: 12 } : {} })")

# ---------- les textes ----------
rep("Maquette n° 19, un essai : plus de codes, il faut tenir 10 minutes (à 10 minutes, Grosbec crie « Assez ! »). Le début se joue au bâton. L’encre se gagne au bâton, pas avec les runes ; le trait n’abat plus d’un coup un golem sonné. Quatorze builds : dix pour le bâton, un par rune.",
    "Maquette n° 20 : il faut tenir 10 minutes de combat (le chronomètre ne compte plus quand le temps est ralenti). Grosbec attaque : quand le sol rougit, sors du rouge et emmène-le loin de tes amis. Quatre golems à part : le porte-dalle, le mortier, le porteur de bombe, et le bélier qui défonce les murs. Les runes sont revenues comme avant : le trait fait éclater les golems sonnés. Quatorze builds : dix pour le bâton, un par rune.")
rep("Un golem sonné perd la moitié de sa vie, et ses éclats touchent ses voisins.", "Un golem sonné éclate d’un coup, et ses éclats font éclater les autres sonnés.")
rep("<b>L’encre se gagne au bâton :</b> un petit golem sur quatre détruit par le bâton lâche un éclat d’encre ; un bélier ou un colosse en lâche toujours un. Un golem détruit par une rune n’en lâche pas. Garde tes runes pour les gros groupes : entre deux vagues, c’est le bâton et ta place qui comptent.",
    "<b>L’encre est rare :</b> un petit golem sur huit lâche un éclat d’encre ; un bélier, un colosse ou un mortier en lâche toujours un. Une rune qui détruit trois golems ou plus en fait tomber un de plus par golem : graver sur un gros groupe se rembourse. Entre deux vagues, c’est le bâton et ta place qui comptent.")
rep("Un trait lui enlève alors la moitié de sa vie (les petits éclatent encore, les gros non).", "Un trait le fait alors éclater d’un coup, quelle que soit sa vie.")
rep("L’encre se gagne au bâton : garde tes runes pour les gros groupes.", "Le ralenti dure deux secondes. L’encre est rare : garde tes runes pour les gros groupes.")
rep("Un trait leur enlève alors la moitié de leur vie.", "Un trait les fait alors éclater.")
rep("'Plus d’encre : elle se gagne au bâton.'", "'Plus d’encre : ramasse des éclats.'")
rep("Mesures (version 19)", "Mesures (version 20)")
rep("toujours plus de golems, et deux vies de plus toutes les 25 secondes.</p>", """toujours plus de golems, et deux vies de plus toutes les HPLATE secondes.</p>
    <p class="note"><b>Le rouge de Grosbec :</b> son poing, son balayage, sa pluie de braises. Le rouge suit le Sage un instant, puis se fige, puis ça tombe. Dedans, le Sage est sonné 2 secondes et lâche son encre, les golems prennent cher, et tes amis perdent de la protection. Emmène le rouge loin d’eux… et sur les golems.</p>
    <p class="note"><b>Les golems à part :</b> le porte-dalle (sa dalle arrête les orbes qui arrivent de face : passe sur le côté ou chasse-le ; elle casse au bout de huit orbes) ; le mortier (il reste au fond et vise le Sage : va le chercher) ; le porteur de bombe (il saute en mourant : loin de tes amis, c’est mieux ; au milieu des golems, c’est encore mieux) ; le bélier (il défonce les murs).</p>""")
rep(".steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}", ".steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}")
rep("""        <h3>4. Le chronomètre</h3>
        <p>Il compte 10 minutes. À zéro, Grosbec crie « Assez ! » : tu as tenu. Si la protection de tes amis tombe à zéro avant, c’est perdu.</p>
      </div>
""", """        <h3>4. Le chronomètre</h3>
        <p>Il compte 10 minutes de combat. À zéro, Grosbec crie « Assez ! » : tu as tenu. Si la protection de tes amis tombe à zéro avant, c’est perdu.</p>
      </div>
      <div class="step">
        <svg viewBox="0 0 240 140" aria-hidden="true">
          <rect width="240" height="140" fill="#1c2440"/>
          <circle cx="96" cy="76" r="46" fill="rgba(255,45,70,.32)" stroke="#ff5a6e" stroke-width="4" stroke-dasharray="10 7"/>
          <circle cx="96" cy="76" r="22" fill="rgba(255,45,70,.45)"/>
          <rect x="66" y="60" width="22" height="22" rx="4" fill="#9aa3b5"/><rect x="100" y="80" width="22" height="22" rx="4" fill="#9aa3b5"/>
          <path d="M150 76h28" stroke="#ffe58a" stroke-width="4" stroke-dasharray="6 5"/>
          <circle cx="200" cy="78" r="13" fill="#3b6fd4" stroke="#ffd23f" stroke-width="3"/><path d="M190 68l10-18 10 18z" fill="#3b6fd4" stroke="#ffd23f" stroke-width="2"/>
          <circle cx="22" cy="22" r="9" fill="#b3263a" stroke="#fff" stroke-width="2"/><circle cx="44" cy="22" r="9" fill="#7a4fc4" stroke="#fff" stroke-width="2"/>
        </svg>
        <h3>5. Le rouge</h3>
        <p>Grosbec frappe là où le sol rougit. Le rouge te suit un instant, puis se fige. Sors-en, et emmène-le loin de tes amis : il les blesse aussi. Les golems, eux, peuvent rester dedans…</p>
      </div>
""")

# ---------- les golems nouveaux ----------
rep("  lanceur: { m: 'lanceur',  sc: 0.68, pas: 25, lourd: 0.4, bw: 38, bh: 20, lh: 16, hw: 20, hh: 25 }    // le frondeur", """  lanceur: { m: 'lanceur',  sc: 0.68, pas: 25, lourd: 0.4, bw: 38, bh: 20, lh: 16, hw: 20, hh: 25 },   // le frondeur
  dalle:   { m: 'bouclier', sc: 0.70, pas: 26, lourd: 0.7, bw: 46, bh: 30, lh: 20, hw: 22, hh: 16 },   // le porte-dalle (version 20)
  mortier: { m: 'lanceur',  sc: 0.95, pas: 22, lourd: 0.8, bw: 52, bh: 28, lh: 22, hw: 28, hh: 34 },   // le mortier : un gros frondeur, un rond rouge à ses pieds
  bombe:   { m: 'trotteur', sc: 0.66, pas: 34, lourd: 0.2, bw: 32, bh: 18, lh: 14, hw: 22, hh: 13 }    // le porteur de bombe : un rôdeur, sa bombe sur le dos""")
rep("const sp = Golems.image(P.m, { yaw: a.yaw, etat, k, pied });", "const sp = Golems.image(P.m, { yaw: a.yaw, etat, k, pied, sansBouclier: u.type === 'dalle' && !u.dalle });")
rep("  if (u.iron) { ctx.globalAlpha = born; const cw = Math.max(15, P.bw * 0.42);", """  if (u.type === 'bombe') { ctx.globalAlpha = born; const by = -P.H * 0.92, br = 9 + Math.sin(t * 14 + u.id) * 1.2; ctx.fillStyle = '#15141c'; ctx.beginPath(); ctx.arc(0, by, br, 0, TAU); ctx.fill(); ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(3, by - br + 1); ctx.lineTo(7, by - br - 7); ctx.stroke(); ctx.fillStyle = Math.sin(t * 20 + u.id) > 0 ? '#ffd23f' : '#ff4d5e'; ctx.beginPath(); ctx.arc(7, by - br - 8, 3.2, 0, TAU); ctx.fill(); }
  if (u.type === 'mortier') { ctx.strokeStyle = '#ff4d5e'; ctx.lineWidth = 3; ctx.globalAlpha = (0.55 + 0.35 * Math.sin(t * 5 + u.id)) * born; ctx.beginPath(); ctx.ellipse(0, 0, P.bw * 0.62, P.bw * 0.24, 0, 0, TAU); ctx.stroke(); }
  if (u.iron) { ctx.globalAlpha = born; const cw = Math.max(15, P.bw * 0.42);""")

# ---------- le rouge ----------
rep("  drawParts(false);\n  for (const p of s.shards) {", "  drawZones(t);\n  drawParts(false);\n  for (const p of s.shards) {")
rep("function drawWall(w, t) {", """// version 20 : le rouge (le poing, le balayage, les braises de Grosbec, l'obus du mortier). Pointillés : il suit le Sage ; trait plein : il est figé.
function drawZones(t) {
  const forme = z => { ctx.beginPath(); if (z.k === 'bande') { if (z.horiz) ctx.rect(-40, z.y - z.half, 980, 2 * z.half); else ctx.rect(z.x - z.half, -40, 2 * z.half, 980); } else ctx.arc(z.x, z.y, z.r, 0, TAU); };
  for (const z of s.zones) {
    const p = 1 - Math.max(0, z.t) / z.T, fige = !(z.suit > 0);
    forme(z); ctx.fillStyle = `rgba(255,45,70,${0.10 + 0.20 * p})`; ctx.fill();
    ctx.lineWidth = fige ? 4 : 2.5; ctx.strokeStyle = `rgba(255,90,110,${fige ? 0.95 : 0.6})`; if (!fige) { ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 60; } ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); if (z.k !== 'bande') ctx.arc(z.x, z.y, z.r * p, 0, TAU); else if (z.horiz) ctx.rect(-40, z.y - z.half * p, 980, 2 * z.half * p); else ctx.rect(z.x - z.half * p, -40, 2 * z.half * p, 980);
    ctx.fillStyle = 'rgba(255,45,70,.28)'; ctx.fill();   // le rouge se remplit : plein, ça tombe
  }
  for (const e of s.fx) if (e.k === 'frappe') { const a = e.life / e.max; forme(e.z); ctx.fillStyle = `rgba(255,235,200,${0.7 * a})`; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,120,60,${a})`; ctx.stroke(); }
}
// ce qui tombe du ciel dans le rouge, juste avant le coup : l'obus, les braises ; et les étoiles du Sage sonné
function drawChutes() {
  for (const z of s.zones) { if (z.k === 'bande' || z.k === 'poing') continue; const h = Math.max(0, z.t) * 620; if (h > 210) continue; const r = z.k === 'obus' ? 10 : 7; ctx.fillStyle = z.k === 'braise' ? '#ffb347' : '#1b1a22'; ctx.beginPath(); ctx.arc(z.x, z.y - h, r, 0, TAU); ctx.fill(); if (z.k !== 'braise') { ctx.strokeStyle = '#c9a25a'; ctx.lineWidth = 2; ctx.stroke(); } }
  if (s.sage.sonne > 0) for (let i = 0; i < 3; i++) { const an = R8.t * 6 + i * TAU / 3; star(s.sage.x + Math.cos(an) * 18, s.sage.y - 46 + Math.sin(an) * 5, 5, '#ffd23f'); }
}
function drawWall(w, t) {""")
rep("  { const px = Math.max(8, Math.round(popSize * k)); for (const e of s.fx) if (e.k === 'pop')", "  drawChutes();\n  { const px = Math.max(8, Math.round(popSize * k)); for (const e of s.fx) if (e.k === 'pop')")
rep("    if (e.k === 'gel') burst(e.x, e.y, 12, { k: 'shard', col: '#d6f6ff', s0: 3, s1: 6, z: 10, v0: 90, v1: 240 });", """    if (e.k === 'gel') burst(e.x, e.y, 12, { k: 'shard', col: '#d6f6ff', s0: 3, s1: 6, z: 10, v0: 90, v1: 240 });
    if (e.k === 'frappe') { const z = e.z; if (z.k === 'bande') { for (let i = 0; i < 24; i++) { const u = Math.random() * 900, v = (Math.random() - .5) * 2 * z.half; burst(z.horiz ? u : z.x + v, z.horiz ? z.y + v : u, 1, { k: 'spark', col: '#ffb347', v0: 60, v1: 220, vz0: 80, vz1: 260, s0: 2, s1: 4, g: 500 }); } } else { burst(z.x, z.y, z.k === 'poing' ? 28 : 10, { k: 'spark', col: '#ffb347', v0: 100, v1: 320, vz0: 80, vz1: 260, s0: 2, s1: 4.5, g: 500 }); dust(z.x, z.y + 10, z.k === 'poing' ? 18 : 6); } }
    if (e.k === 'bloc') burst(e.x, e.y - 14, 3, { k: 'spark', col: '#ffe58a', v0: 60, v1: 160, s0: 1.5, s1: 3, g: 300 });
    if (e.k === 'casse') { burst(e.x, e.y, 14, { k: 'shard', col: '#bff3ff', s0: 3, s1: 6, z: 10, v0: 90, v1: 240 }); dust(e.x, e.y + 10, 10); }
    if (e.k === 'tir') burst(e.x, e.y - 30, 6, { k: 'spark', col: '#ff8a5a', v0: 40, v1: 120, vz0: 120, vz1: 260, s0: 2, s1: 3.5, g: 300 });""")
rep("function gbFx(e, t) {\n", """function gbFx(e, t) {
  if (e.k === 'gbcoup') { gbGeste('envoi', s.sage.x < 450 ? 'G' : 'D', t); GB.mots = { t0: t, txt: e.coup === 'poing' ? 'PRENDS ÇA !' : e.coup === 'bande' ? 'HORS DE MA VUE !' : 'BRÛLE !' }; }
""")
