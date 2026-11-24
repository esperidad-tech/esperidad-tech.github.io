# ----- version 12 : les 10 combos à 3 niveaux, la colère du cœur, les sons -----
# les cartes dorées : niveau du combo ; les deux cartes d'origine seulement au niveau 1
rep("""    if (C.fam === 'combo') { b.classList.add('combo'); b.innerHTML = `<span class="ic">${C.ic}</span><span class="fam" style="color:${f[1]}">Combo !</span><span class="nom">${C.nom}</span><span class="niv" style="color:${f[1]}">${G.CARDS[C.of[0]].ic} ${G.CARDS[C.of[0]].nom} + ${G.CARDS[C.of[1]].ic} ${G.CARDS[C.of[1]].nom}</span><span class="txt">${C.txt()}</span>`; }""",
    """    if (C.fam === 'combo') { b.classList.add('combo'); b.innerHTML = `<span class="ic">${C.ic}</span><span class="fam" style="color:${f[1]}">Combo ! ${l > 1 ? 'niveau ' + l : ''}</span><span class="nom">${C.nom}</span>${l === 1 ? `<span class="niv" style="color:${f[1]}">${G.CARDS[C.of[0]].ic} ${G.CARDS[C.of[0]].nom} + ${G.CARDS[C.of[1]].ic} ${G.CARDS[C.of[1]].nom}</span>` : `<span class="niv" style="color:${f[1]}">${'★'.repeat(l)}${'☆'.repeat(3 - l)}</span>`}<span class="txt">${C.txt(l)}</span>`; }""")
rep("""    b.onclick = () => { G.choose(s, id); $('ovChoix').hidden = true;""", """    b.onclick = () => { SON.play(C.fam === 'combo' ? 'combo' : 'card'); G.choose(s, id); $('ovChoix').hidden = true;""")
rep("""  $('ovChoix').hidden = false;
}""", """  $('ovChoix').hidden = false; SON.play('choice');
}""")
# l'aide-mémoire : les 10 combos
rep("""    <p class="note"><b>Les combos :</b> quand tu as deux cartes qui vont ensemble, dont une au niveau 3, une carte dorée « Combo ! » sort à la page suivante. Huit combos à découvrir.</p>""",
    """    <p class="note"><b>Les combos :</b> quand tu as deux cartes qui vont ensemble, dont une au niveau 2, une carte dorée « Combo ! » sort à la page suivante. Chaque combo monte jusqu’au niveau 3, et ils se cumulent : plus tu en as, plus c’est fou.</p>
    <ul class="combos">
      <li>🎳 <b>Golems-boulets</b> : tonnerre + mur solide</li>
      <li>⛈️ <b>Orage</b> : rune piège + lumière en chaîne</li>
      <li>🌋 <b>Volcan</b> : trait brûlant + mur d’épines</li>
      <li>🌠 <b>Pluie d’étoiles</b> : double orbe + tir rapide</li>
      <li>🌟 <b>La comète</b> : pas léger + orbe perçant</li>
      <li>🐙 <b>Le scribe fou</b> : grand encrier + moisson d’encre</li>
      <li>🌀 <b>Tornade de pages</b> : pages volantes + aimant</li>
      <li>🏛️ <b>Sanctuaire</b> : sceau de garde + bouclier</li>
      <li>🦉 <b>Parlement des chouettes</b> : chouette + orbe lourd</li>
      <li>🌗 <b>Rune miroir</b> : trait large + grand encrier</li>
    </ul>
    <p class="note"><b>La colère du cœur :</b> à 12 minutes, puis à 14, les golems arrivent plus vite et plus nombreux. Après 15 minutes, c’est la fureur : des golems cuirassés qu’on ne peut plus sonner, et toujours plus. Personne ne tient éternellement.</p>""")
rep("@media (max-width:1000px)", """.combos{margin:0;padding-left:20px;color:var(--mute);font-size:15px;line-height:1.5}
.tool.off{opacity:.45;position:relative}
.tool.off::after{content:'';position:absolute;left:8px;right:8px;top:50%;height:3px;background:#ff6a7a;transform:rotate(-40deg);border-radius:2px}
@media (max-width:1000px)""")
# les boutons des sons : 🎶 la musique, 🔔 les bruitages
rep("""<div class="tools"><button class="tool" id="bAide\"""", """<div class="tools"><button class="tool" id="bMus" aria-label="Musique" title="Musique">🎶</button><button class="tool" id="bSfx" aria-label="Bruitages" title="Bruitages">🔔</button><button class="tool" id="bAide\"""")
rep("""setPlein(location.hash.includes('plein'));""", """setPlein(location.hash.includes('plein'));
// ----- les sons -----
function soundButtons() { $('bMus').classList.toggle('off', !SON.musOn); $('bSfx').classList.toggle('off', !SON.sfxOn); $('bSfx').textContent = SON.sfxOn ? '🔔' : '🔕'; }
$('bMus').onclick = () => { SON.init(); SON.setMus(!SON.musOn); if (SON.musOn && s && !s.over && $('ovStart').hidden) SON.music(true); soundButtons(); };
$('bSfx').onclick = () => { SON.init(); SON.setSfx(!SON.sfxOn); if (SON.sfxOn) SON.play('tink'); soundButtons(); };
soundButtons();
document.addEventListener('visibilitychange', () => SON.hidden(document.hidden));""")
rep("""function start() {
""", """function start() {
  SON.init(); SON.music(true); SON.play('start');
""")
rep("""  brush = on; stroke = null; strokeLen = 0;""", """  if (s && !s.over && on !== brush) { SON.play(on ? 'brushOn' : 'brushOff'); SON.slow(on); }
  if (!on) SON.slow(false);
  brush = on; stroke = null; strokeLen = 0;""")
rep("""  if (rune.kind) { const r = G.cast(s, rune); if (r.ok || !s.heart.bare) setBrush(false); if (s.over) setTimeout(finish, 1200); }
  else { s.msg""", """  if (rune.kind) { const r = G.cast(s, rune); if (!r.ok) SON.play('fail'); if (r.ok || !s.heart.bare) setBrush(false); if (s.over) setTimeout(finish, 1200); }
  else { SON.play('fail'); s.msg""")
rep("""  if (typed.length < 3) typed.push(b.dataset.c);""", """  if (typed.length < 3) { typed.push(b.dataset.c); SON.play('key'); }""")
rep("""    if (r.ok && s.over) {""", """    SON.play(r.ok ? 'good' : 'bad');
    if (r.ok && s.over) {""")
rep("""function pause(on) { if (!s || s.over) return; closeAide(false); paused = on;""", """function pause(on) { if (!s || s.over) return; closeAide(false); paused = on; SON.duck(on);""")
rep("""    G.step(s, dt, brush);
    if (s.over) setTimeout(finish, 800);""", """    G.step(s, dt, brush);
    SON.watch(s);
    if (s.over) setTimeout(finish, 800);""")
