# --- version 19 (25 novembre) : tenir 10 minutes sans codes, les nouvelles règles des runes, 14 builds ---
# (lancé par exec après build18_part.py : « html » et « rep » existent déjà)
def bloc(debut, fin, neuf):
    global html
    assert html.count(debut) == 1, (debut[:70], html.count(debut))
    i0 = html.index(debut); i1 = html.index(fin, i0 + len(debut)); html = html[:i0] + neuf + html[i1:]

# ---------- les textes ----------
bloc("<p>Maquette n° 18 :", "</p>", "<p>Maquette n° 19, un essai : plus de codes, il faut tenir 10 minutes (à 10 minutes, Grosbec crie « Assez ! »). Le début se joue au bâton. L’encre se gagne au bâton, pas avec les runes ; le trait n’abat plus d’un coup un golem sonné. Quatorze builds : dix pour le bâton, un par rune. Le bouton 🎚️ règle le volume ; au clavier, Entrée ou Espace pour graver, 1, 2, 3 pour choisir une carte.")
rep("<h2>Tiens jusqu’à ce que tes amis gagnent</h2>", "<h2>Tiens 10 minutes</h2>")
rep("Tes deux amis, le Barde et l’Alchimiste, attaquent Grosbec, chacun sur sa tablette. Ici, dans sa grande salle, Grosbec envoie ses golems sur eux. Toi, le Sage, tu les protèges.", "Tes deux amis, le Barde et l’Alchimiste, attaquent Grosbec. Lui envoie ses golems sur eux. Toi, le Sage, tu les protèges pendant 10 minutes : au bout du chronomètre, Grosbec en a assez.")
rep("Les gros golems lâchent des pages dorées : passe dessus pour choisir un pouvoir.", "Les gros golems lâchent des pages dorées : passe dessus pour choisir un pouvoir, et construis ton build.")
rep("<p>Le bouton jaune ralentit le temps. Un trait, un V, un escargot ou un arc de cercle. L’encre est rare : garde-la pour les gros groupes.</p>", "<p>Le bouton jaune ralentit le temps. Un trait, un V, un escargot ou un arc de cercle. L’encre se gagne au bâton : garde tes runes pour les gros groupes.</p>")
rep("<h3>3. Les combos</h3>", "<h3>3. Les chocs</h3>")
rep("sonnés 3 secondes. Un trait les fait éclater.</p>\n      </div>", "sonnés 3 secondes. Un trait leur enlève alors la moitié de leur vie.</p>\n      </div>")
# l'image « 4 » : c'étaient les codes ; c'est le chronomètre
bloc("""          <circle cx="54" cy="56" r="22" fill="#e8833a" stroke="#ffd23f" stroke-width="4"/>""", "        </svg>", """          <circle cx="120" cy="62" r="40" fill="#0b1020" stroke="#ffd23f" stroke-width="5"/>
          <path d="M120 62V34M120 62l18 12" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
          <rect x="108" y="10" width="24" height="10" rx="4" fill="#ffd23f"/>
          <rect x="50" y="112" width="140" height="12" rx="6" fill="#3a2632"/><rect x="50" y="112" width="92" height="12" rx="6" fill="#ffd23f"/>
          <text x="204" y="72" text-anchor="middle" font-size="20" font-family="Fredoka,sans-serif" fill="#fff">10</text>
""")
rep("<h3>4. Les codes</h3>", "<h3>4. Le chronomètre</h3>")
bloc("        <p>Quand un ami gagne son combat, il te crie son code", "</p>", "        <p>Il compte 10 minutes. À zéro, Grosbec crie « Assez ! » : tu as tenu. Si la protection de tes amis tombe à zéro avant, c’est perdu.")
bloc("""    <div class="row essai" id="essai">""", """    <div class="row"><button class="b yellow" id="bStart">""", """    <div class="row essai" id="essai" hidden></div>
""")
rep("""<button class="codebtn" id="bCode">Taper un code</button>""", """<button class="codebtn" id="bCode" hidden>Taper un code</button>""")
rep("""aria-label="Les runes et les codes" title="Les runes et les codes">""", """aria-label="Les runes et les builds" title="Les runes et les builds">""")
# l'aide-mémoire
bloc("<b>Un trait : la lumière (2)</b><p>", "</p>", "<b>Un trait : la lumière (2)</b><p>Fait 2 à ceux qu’il traverse. Un golem sonné perd la moitié de sa vie, et ses éclats touchent ses voisins.")
bloc("""    <p class="note"><b>L’encre est rare :</b>""", "</p>", """    <p class="note"><b>L’encre se gagne au bâton :</b> un petit golem sur quatre détruit par le bâton lâche un éclat d’encre ; un bélier ou un colosse en lâche toujours un. Un golem détruit par une rune n’en lâche pas. Garde tes runes pour les gros groupes : entre deux vagues, c’est le bâton et ta place qui comptent.""")
bloc("""    <p class="note"><b>Les chocs :</b>""", "</p>", """    <p class="note"><b>Les chocs :</b> un golem projeté qui cogne un autre golem, un mur ou le bord est sonné 3 secondes. Un trait lui enlève alors la moitié de sa vie (les petits éclatent encore, les gros non).""")
bloc("""    <p class="note"><b>L’ami venu t’aider</b>""", """    <p class="note"><b>Les pages du grimoire :</b>""", "")
bloc("""    <p class="note"><b>Les pages du grimoire :</b>""", "</p>", """    <p class="note"><b>Les pages du grimoire :</b> les gros golems (les béliers et les colosses) lâchent une page dorée : vite au début (il faut 1, 1, 2, 2, 3, 3 gros), puis un gros de plus à chaque page. Le Sage passe dessus : tu choisis un pouvoir parmi trois, chacun jusqu’au niveau 3. Le grimoire propose toujours une carte qui fait avancer un build commencé.""")
bloc("""    <p class="note"><b>Les combos :</b>""", """    <p class="note"><b>La colère de Grosbec :</b>""", """    <p class="note"><b>Les builds :</b> quand tu as deux cartes qui vont ensemble, dont une au niveau 2, une carte dorée sort à la page suivante. Chaque build monte jusqu’au niveau 3, et ils se cumulent.</p>
    <p class="note"><b>Dix builds du bâton :</b></p>
    <ul class="combos">
      <li>🌠 <b>Pluie d’étoiles</b> : double orbe + tir rapide</li>
      <li>🎱 <b>Ricochet</b> : double orbe + orbe perçant</li>
      <li>💥 <b>Orbes explosives</b> : double orbe + orbe lourd</li>
      <li>🔦 <b>Le rayon</b> : tir rapide + orbe perçant</li>
      <li>🔥 <b>Orbes de braise</b> : orbe lourd + tir rapide</li>
      <li>❄️ <b>Orbes de givre</b> : orbe lourd + orbe perçant</li>
      <li>⚡ <b>Bâton de foudre</b> : lumière en chaîne + tir rapide</li>
      <li>🛡️ <b>Orbes gardiennes</b> : pages volantes + double orbe</li>
      <li>🌟 <b>La comète</b> : pas léger + orbe perçant</li>
      <li>🦉 <b>Parlement des chouettes</b> : chouette + orbe lourd</li>
    </ul>
    <p class="note"><b>Un build par rune :</b></p>
    <ul class="combos">
      <li>🌋 <b>Volcan</b> (le trait) : trait brûlant + trait large</li>
      <li>🎳 <b>Golems-boulets</b> (le V) : V tonnerre + grand encrier</li>
      <li>🌀 <b>Tornade</b> (l’escargot) : pages volantes + aimant</li>
      <li>🏰 <b>Rempart</b> (l’arc de cercle) : mur d’épines + mur solide</li>
    </ul>
""")
bloc("""    <p class="note"><b>La colère de Grosbec :</b>""", "</p>", """    <p class="note"><b>La colère de Grosbec :</b> à 7 min 30, puis à 9 minutes, les golems arrivent plus vite et plus nombreux. À 10 minutes, Grosbec crie « Assez ! Ça suffit ! » : tu as tenu.""")
bloc("""    <p class="note"><b>Ça durcit :</b>""", "</p>", """    <p class="note"><b>Ça durcit :</b> le début se joue au bâton. Toutes les 90 secondes, les golems ont une vie de plus ; les gros, deux de plus chaque minute. Les grosses vagues arrivent de deux côtés à 3 min 30, de trois à 7 minutes. Après 5 minutes, ça monte pour de bon : toujours plus de golems, et deux vies de plus toutes les 25 secondes.""")
bloc("""    <h2>Les codes de tes amis</h2>""", """    <div class="row"><button class="b" id="bPause">""", """    <div class="friends" id="friends" hidden></div>
""")
rep("s.msg = 'Plus d’encre : ramasse des éclats.';", "s.msg = 'Plus d’encre : elle se gagne au bâton.';")
rep("`Mesures (version 18) :", "`Mesures (version 19) :")

# ---------- le chronomètre à la place des amis vainqueurs ----------
bloc("  text(s.over === 'win' ? 'L’armure tombe !' : `Amis vainqueurs :", "  // protection\n", """  { const reste = Math.max(0, Math.ceil(s.cfg.duree - s.realT)), k = Math.min(1, s.realT / s.cfg.duree);
    text(s.over === 'win' ? 'Tu as tenu !' : `Tiens encore ${Math.floor(reste / 60)}:${String(reste % 60).padStart(2, '0')}`, 18, 8 + fs + 6, fs, '#f3c9d0', 'left', 800);
    ctx.fillStyle = '#3a2632'; rr(18, 36, pw - 20, 8, 2); ctx.fill(); if (k > 0.01) { ctx.fillStyle = s.rage ? '#ff6b5e' : '#ffd23f'; rr(18, 36, (pw - 20) * k, 8, 2); ctx.fill(); } }
""")
rep("s = G.newGame({ cfg: fast ? { codeTimes: [10, 20] } : { duree: dureeAmis * 60 } });", "s = G.newGame({ cfg: fast ? { duree: 40, rageAt: [20, 30] } : {} });")
rep("    if (s.over) setTimeout(finish, 800);", "    if (s.over) setTimeout(finish, s.over === 'win' ? 2300 : 800);")
rep("  $('endTitle').textContent = win ? 'L’armure tombe !' : 'Perdu';", "  $('endTitle').textContent = win ? (s.cfg.duree >= 600 ? 'Tu as tenu 10 minutes !' : 'Tu as tenu !') : 'Perdu';")
bloc("  $('endWhy').textContent = (win ? `Tes deux amis ont gagné,", " + ` Golems détruits :", "  const BU = Object.keys(G.CARDS).filter(k => G.CARDS[k].fam === 'combo' && G.lv(s, k)).map(k => `${G.CARDS[k].ic} ${G.CARDS[k].nom.replace(/ \\(.*/, '')} ${G.lv(s, k)}`);\n  $('endWhy').textContent = (win ? `Grosbec en a assez : tes deux amis sont saufs. Protection restante : ${p} sur ${max}.` : `La protection est tombée à zéro après ${m} min ${sec}.`) + (BU.length ? ` Tes builds : ${BU.join(', ')}.` : ' Aucun build.')")

# ---------- Grosbec : plus de fissures ni de cristal ; à la fin, « ASSEZ ! ÇA SUFFIT ! » ----------
rep("const gbFissures = () => Math.round(s.entered.length * 3 / G.ORDER.length);", "const gbFissures = () => 0;   // version 19 : plus de codes, le casque ne se fend plus")
rep("  if (s.over === 'win') return 'fin';", "")
rep("won = s.over === 'win', bob = won ? 0 :", "won = false, bob = won ? 0 :")
rep("GB.mots = { t0: t, txt: s.rage === 1 ? 'ASSEZ !' : 'RRAAAH !' }; }", "GB.mots = { t0: t, txt: s.rage === 1 ? 'ÉCRASEZ-LES !' : 'RRAAAH !' }; }\n  if (s.over === 'win' && !GB.fini) { GB.fini = true; GB.g = { nom: 'silence', t0: t }; GB.mots = { t0: t, txt: 'ASSEZ ! ÇA SUFFIT !' }; }")
rep("if (R8.jeu !== s) { R8.jeu = s; GB.g = null; GB.rage = 0;", "if (R8.jeu !== s) { R8.jeu = s; GB.fini = false; GB.g = null; GB.rage = 0;")

# ---------- la fenêtre des cartes : le genre du build, et ce que la carte prépare ----------
rep("""<span class="fam" style="color:${f[1]}">Combo ! ${l > 1 ? 'niveau ' + l : ''}</span>""", """<span class="fam" style="color:${f[1]}">${C.genre === 'rune' ? 'Build de rune' : 'Build du bâton'}${l > 1 ? ' · niveau ' + l : ''}</span>""")
rep("""<span class="txt">${C.txt(l || 1)}</span>`;\n    b.onclick""", """<span class="txt">${C.txt(l || 1)}</span>${G.hint(s, id) ? `<span class="pour">${G.hint(s, id)}</span>` : ''}`;\n    b.onclick""")
rep("[hidden]{display:none!important}", "[hidden]{display:none!important}\n.carte .pour{display:block;margin-top:6px;font-size:12px;line-height:1.3;color:#ffcf66;font-weight:700}")

# ---------- les dessins des nouveaux builds ----------
# les orbes : orange avec la braise, bleu clair avec le givre
rep("  for (const b of s.bolts) {\n    if (b.arrow) {", "  const orbCol = b => b.staff && G.lv(s, 'braise') ? '#ffb347' : b.staff && G.lv(s, 'givre') ? '#c9f2ff' : (b.dmg || 1) > 2 ? '#fff3c4' : '#ffffff';\n  for (const b of s.bolts) {\n    if (b.arrow) {")
rep("ctx.fillStyle = (b.dmg || 1) > 1 ? '#fff3c4' : '#ffffff'; ctx.fillRect(b.x - br, b.y - br, br * 2, br * 2); continue; }", "ctx.fillStyle = orbCol(b); ctx.fillRect(b.x - br, b.y - br, br * 2, br * 2); continue; }")
rep("    ctx.fillStyle = (b.dmg || 1) > 1 ? '#fff3c4' : '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, br, 0, TAU); ctx.fill();\n  }", "    ctx.fillStyle = orbCol(b); ctx.beginPath(); ctx.arc(b.x, b.y, br, 0, TAU); ctx.fill();\n  }")
rep("    const br = 4.5 + ((b.dmg || 1) - 1) * 1.6,", "    const br = 4.5 + Math.min(6, ((b.dmg || 1) - 2) * 1.3),")
# les orbes gardiennes, tout près du Sage
rep("  if (G.lv(s, 'pages')) drawOrbitPages(t);", """  if (G.lv(s, 'pages')) drawOrbitPages(t);
  if (G.lv(s, 'gardiennes')) { const GA = G.lv(s, 'gardiennes'), n = G.UP.gardN[GA], R = G.UP.gardR[GA], sg = s.sage;
    for (let i = 0; i < n; i++) { const a = (s.gardA || 0) + i * TAU / n, x = sg.x + Math.cos(a) * R, y = sg.y + Math.sin(a) * R; ctx.globalAlpha = 0.85; ctx.drawImage(R8.spr.glowCyan, x - 17, y - 17, 34, 34); ctx.globalAlpha = 1; ctx.fillStyle = '#e9fbff'; ctx.beginPath(); ctx.arc(x, y, 6.5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6fe3ff'; ctx.lineWidth = 2; ctx.stroke(); } }""")
# l'explosion d'une orbe, et l'éclat de givre
rep("    if (e.k === 'pop2') { if (lueurs++ < 10) {", """    if (e.k === 'boum') { const R = e.R * (1.25 - a * 0.55); ctx.strokeStyle = `rgba(255,214,120,${a})`; ctx.lineWidth = 5 * a + 1; ctx.beginPath(); ctx.arc(e.x, e.y, R, 0, TAU); ctx.stroke(); ctx.fillStyle = `rgba(255,236,170,${a * 0.28})`; ctx.fill(); }
    if (e.k === 'gel') { const R = e.R * (1.2 - a * 0.5); ctx.strokeStyle = `rgba(190,240,255,${a})`; ctx.lineWidth = 5 * a + 1; ctx.beginPath(); ctx.arc(e.x, e.y, R, 0, TAU); ctx.stroke(); ctx.fillStyle = `rgba(190,240,255,${a * 0.25})`; ctx.fill(); }
    if (e.k === 'pop2') { if (lueurs++ < 10) {""")
rep("    if (e.k === 'pop2') burst(e.x, e.y + 10, 10, { k: 'spark',", """    if (e.k === 'boum') burst(e.x, e.y + 6, 6, { k: 'spark', col: '#ffd67a', v0: 90, v1: 240, s0: 2, s1: 3.5, g: 200 });
    if (e.k === 'gel') burst(e.x, e.y, 12, { k: 'shard', col: '#d6f6ff', s0: 3, s1: 6, z: 10, v0: 90, v1: 240 });
    if (e.k === 'pop2') burst(e.x, e.y + 10, 10, { k: 'spark',""")
# un golem gelé (un glaçon bleu clair) ; un golem ralenti par le givre (un liseré)
rep("  if (u.burn > 0) {\n    const cx = u.x, cy = fy - P.lh - P.bh * 0.55;", """  if (u.frozen > 0 || u.chill > 0) {
    const hh = P.H * 1.02, ww = P.bw * 1.25, gele = u.frozen > 0;
    ctx.fillStyle = gele ? 'rgba(170,232,255,.5)' : 'rgba(170,232,255,.16)'; ctx.strokeStyle = gele ? 'rgba(235,250,255,.95)' : 'rgba(200,240,255,.4)'; ctx.lineWidth = gele ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(u.x - ww * 0.5, fy + 3); ctx.lineTo(u.x - ww * 0.58, fy - hh * 0.55); ctx.lineTo(u.x - ww * 0.2, fy - hh); ctx.lineTo(u.x + ww * 0.3, fy - hh * 0.96); ctx.lineTo(u.x + ww * 0.58, fy - hh * 0.5); ctx.lineTo(u.x + ww * 0.5, fy + 3); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (u.burn > 0) {\n    const cx = u.x, cy = fy - P.lh - P.bh * 0.55;""")
# (les sons des nouveaux effets — « boum » et « gel » — sont branchés dans construire : SON19)
