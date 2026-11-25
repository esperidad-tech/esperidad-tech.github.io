# Version 21 : la page pour le jeu de runes (textes, aide-mémoire, le bouclier, le ralenti du sablier). Travaille sur « html », après build20_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
def bloc21(debut, fin, neuf):
    global html
    i = html.index(debut); j = html.index(fin, i); html = html[:i] + neuf + html[j:]

rep("Maquette n° 20 : il faut tenir 10 minutes de combat (le chronomètre ne compte plus quand le temps est ralenti). Grosbec attaque : quand le sol rougit, sors du rouge et emmène-le loin de tes amis. Quatre golems à part : le porte-dalle, le mortier, le porteur de bombe, et le bélier qui défonce les murs. Les runes sont revenues comme avant : le trait fait éclater les golems sonnés. Quatorze builds : dix pour le bâton, un par rune.",
    "Maquette n° 21 : un jeu de runes. Tu démarres avec un trait court et un petit V, sans ralenti ; le mur, l’escargot, le bouclier et le ralenti se gagnent dans le grimoire. Comme avant : un golem sonné éclate au trait, et chaque golem lâche de l’encre. Plus de rouge, plus de builds du bâton. Il faut tenir 10 minutes de combat.")
rep("Mesures (version 20)", "Mesures (version 21)")
rep("G.newGame({ cfg: fast ? { duree: 75, rageAt: [48, 62], gbFirst: 6, gbEveryDebut: 7, gbEvery: 7, gbEveryRage: 6, dalleAt: 2, bombeAt: 10, mortierAt: 6, mortierEvery: 12 } : {} })", "G.newGame({ cfg: fast ? { duree: 60, rageAt: [40, 50] } : {} })")
# l'explication
html = html.replace(", et son orbe en traverse deux : place-toi dans l’axe de la file.", ", mais doucement : ce sont tes runes qui font le travail.")
rep("<p>Le bouton jaune ralentit le temps. Un trait, un V, un escargot ou un arc de cercle. Le ralenti dure deux secondes. L’encre est rare : garde tes runes pour les gros groupes.</p>", "<p>Le bouton jaune ouvre le parchemin, en plein combat : trace un trait ou un V. Le mur, l’escargot, le bouclier et le ralenti du temps se gagnent dans le grimoire.</p>")
bloc21("      <div class=\"step\">\n        <svg viewBox=\"0 0 240 140\" aria-hidden=\"true\">\n          <rect width=\"240\" height=\"140\" fill=\"#1c2440\"/>\n          <circle cx=\"96\" cy=\"76\" r=\"46\"", "    </div>\n    <div class=\"row essai\"", "")
rep(".steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}", ".steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}")
# l'aide-mémoire
rep("Un golem sonné éclate d’un coup, et ses éclats font éclater les autres sonnés.</p>", "Un golem sonné éclate d’un coup, et ses éclats font éclater les autres sonnés. Au début il est court : la carte Long trait l’allonge.</p>")
rep("Pas plus ouvert qu’un angle droit : 90° au plus.</p>", "Pas plus ouvert qu’un angle droit : 90° au plus. Au début il est petit : la carte Grand V l’agrandit.</p>")
rep("<b>Un escargot : la repousse (la moitié de l’encre)</b>", "<b>Un escargot : la repousse (la moitié de l’encre) — à gagner dans le grimoire</b>")
rep("<b>Un arc de cercle : le mur (2)</b>", "<b>Un arc de cercle : le mur (2) — à gagner dans le grimoire</b>")
rep("<b>L’encre est rare :</b> un petit golem sur huit lâche un éclat d’encre ; un bélier, un colosse ou un mortier en lâche toujours un. Une rune qui détruit trois golems ou plus en fait tomber un de plus par golem : graver sur un gros groupe se rembourse. Entre deux vagues, c’est le bâton et ta place qui comptent.",
    "<b>L’encre :</b> chaque golem détruit lâche un éclat d’encre (un bélier 2, un colosse 3), et une rune qui en détruit trois ou plus en fait tomber encore un par golem. Le bâton tire tout seul, mais doucement : ce sont les runes qui gagnent le combat.")
bloc21("    <p class=\"note\"><b>Les pages du grimoire :</b>", "    <div class=\"friends\" id=\"friends\" hidden></div>", """    <p class="note"><b>Tu démarres avec peu :</b> un trait court et un petit V, sans ralenti. Le reste se gagne dans le grimoire : la rune du mur 🚧, l’escargot 🐌, le bouclier 🛡️ (un cercle fermé : tes amis sont intouchables un moment ; 4 d’encre, 8 secondes de recharge), le sablier ⏳ (le temps ralentit quand tu graves, 2 secondes par rune), le Grand V 📐, le Long trait 📏.</p>
    <p class="note"><b>Les pages du grimoire :</b> les gros golems (les béliers et les colosses) lâchent une page dorée : il faut 1, 1, 1 gros, puis 2, 2, 2, puis 3… Passe dessus : le combat attend, et tu choisis une carte parmi trois.</p>
    <p class="note"><b>Les builds :</b> quand tu as deux cartes qui vont ensemble, dont une au niveau 2, une carte dorée sort à la page suivante. Chaque build monte jusqu’au niveau 3, et ils se cumulent.</p>
    <ul class="combos">
      <li>🌋 <b>Volcan</b> (le trait) : trait brûlant + trait large</li>
      <li>🌗 <b>Rune miroir</b> (toutes les runes) : trait large + grand encrier</li>
      <li>⛈️ <b>Orage</b> (les golems qui éclatent) : lumière en chaîne + V tonnerre</li>
      <li>🎳 <b>Golems-boulets</b> (le V) : V tonnerre + grand encrier</li>
      <li>🌀 <b>Tornade</b> (l’escargot) : rune de l’escargot + aimant</li>
      <li>🏰 <b>Rempart</b> (le mur) : mur d’épines + mur solide</li>
      <li>🐙 <b>Le scribe fou</b> (l’encre) : grand encrier + moisson d’encre</li>
      <li>🏛️ <b>Sanctuaire</b> (la protection) : sceau de garde + bouclier de cristal</li>
      <li>🦉 <b>Parlement des chouettes</b> : la chouette + lumière en chaîne</li>
      <li>🌟 <b>La comète</b> (la course) : pas léger + aimant</li>
    </ul>
    <p class="note"><b>La colère de Grosbec :</b> à 7 min 30, puis à 9 minutes, les golems arrivent plus vite et plus nombreux. À 10 minutes de combat, Grosbec crie « Assez ! » : tu as tenu.</p>
    <p class="note"><b>Ça durcit :</b> toutes les 3 minutes, les golems ont une vie de plus, les gros deux de plus ; après 5 minutes, encore une de plus toutes les 2 minutes. Les grosses vagues arrivent de deux côtés à 4 minutes, de trois à 8 minutes.</p>
""")
rep("${C.genre === 'rune' ? 'Build de rune' : 'Build du bâton'}", "Build")
# le ralenti : seulement avec le sablier
rep("const gdt = dt * (s.lent && !s.over && !paused ? s.cfg.slow : 1)", "const gdt = dt * (s.lent && !s.over && !paused ? (s.slowF || 1) : 1)")
rep("SON.play(on ? 'brushOn' : 'brushOff'); SON.slow(on); }", "SON.play(on ? 'brushOn' : 'brushOff'); SON.slow(on && G.lv(s, 'sablier') > 0); }")
# le bouclier des amis : un dôme doré sur la rosace
rep("function drawChutes() {\n", """function drawChutes() {
  if (s.dome > 0) { const fin = s.dome < 1 ? 0.5 + 0.5 * Math.sin(R8.t * 22) : 1, a = (0.75 + 0.25 * Math.sin(R8.t * 5)) * fin; ctx.save(); ctx.translate(450, 436); ctx.scale(1, 0.8); ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.fillStyle = `rgba(255,224,130,${0.16 * a})`; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,232,150,${0.9 * a})`; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 104, Math.PI, TAU); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.6 * a})`; ctx.stroke(); ctx.beginPath(); ctx.arc(0, -10, 86, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore(); }
""")
rep("    if (e.k === 'bloc') burst(", "    if (e.k === 'dome') for (let i = 0; i < 26; i++) { const an = i / 26 * TAU; burst(450 + Math.cos(an) * 100, 436 + Math.sin(an) * 80, 1, { k: 'spark', col: '#ffe58a', v0: 40, v1: 140, vz0: 60, vz1: 200, s0: 2, s1: 4, g: 300 }); }\n    if (e.k === 'bloc') burst(")
