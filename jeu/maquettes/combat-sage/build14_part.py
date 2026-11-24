# ----- version 14 : un curseur de volume pour la musique et un pour les bruitages -----
rep("""<div class="tools"><button class="tool" id="bMus" aria-label="Musique" title="Musique">🎶</button><button class="tool" id="bSfx" aria-label="Bruitages" title="Bruitages">🔔</button>""",
    """<div class="tools"><button class="tool" id="bSon" aria-label="Le volume" title="Le volume">🎚️</button>""")
rep("""    <div class="tools">""", """    <div class="sonpanel" id="sonPanel" hidden>
      <label><span>🎶 Musique</span><input type="range" id="vMus" min="0" max="200" step="5" value="100"><b id="vMusT">100 %</b></label>
      <label><span>🔔 Bruitages</span><input type="range" id="vSfx" min="0" max="200" step="5" value="100"><b id="vSfxT">100 %</b></label>
    </div>
    <div class="tools">""")
rep("@media (max-width:1000px)", """.sonpanel{position:absolute;right:8px;top:108px;z-index:3;display:grid;gap:10px;background:rgba(15,21,40,.95);border:2px solid #2b365a;border-radius:14px;padding:12px 14px;min-width:min(330px,80vw)}
.sonpanel label{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;font-weight:800;font-size:15px;color:var(--ink)}
.sonpanel input{width:100%;min-width:120px;height:34px;accent-color:var(--yellow);cursor:pointer}
.sonpanel b{min-width:52px;text-align:right;color:var(--yellow)}
.tool.on{border-color:var(--yellow)}
@media (max-width:1000px)""")
rep("""function soundButtons() { $('bMus').classList.toggle('off', !SON.musOn); $('bSfx').classList.toggle('off', !SON.sfxOn); $('bSfx').textContent = SON.sfxOn ? '🔔' : '🔕'; }
$('bMus').onclick = () => { SON.init(); SON.setMus(!SON.musOn); if (SON.musOn && s && !s.over && $('ovStart').hidden) SON.music(true); soundButtons(); };
$('bSfx').onclick = () => { SON.init(); SON.setSfx(!SON.sfxOn); if (SON.sfxOn) SON.play('tink'); soundButtons(); };
soundButtons();""", """// le volume : deux curseurs (0 = coupé, 100 % = normal, jusqu'à 200 %)
function soundUI() {
  for (const [k, id] of [['mus', 'vMus'], ['sfx', 'vSfx']]) { const v = Math.round((k === 'mus' ? SON.vMus : SON.vSfx) * 100); $(id).value = v; $(id + 'T').textContent = v ? v + ' %' : 'coupé'; }
  $('bSon').textContent = SON.vMus + SON.vSfx === 0 ? '🔇' : '🎚️';
}
$('bSon').onclick = () => { SON.init(); $('sonPanel').hidden = !$('sonPanel').hidden; $('bSon').classList.toggle('on', !$('sonPanel').hidden); };
$('vMus').addEventListener('input', e => { SON.init(); SON.setVol('mus', e.target.value / 100); if (SON.vMus > 0 && !SON.playing && s && !s.over && $('ovStart').hidden) SON.music(true); soundUI(); });
let tinkT = 0;
$('vSfx').addEventListener('input', e => { SON.init(); SON.setVol('sfx', e.target.value / 100); const n = performance.now(); if (n - tinkT > 150) { tinkT = n; SON.play('pick'); } soundUI(); });
for (const id of ['vMus', 'vSfx']) $(id).addEventListener('change', e => e.target.blur());
// toucher ailleurs ferme le volet du volume
document.addEventListener('pointerdown', e => { if (!$('sonPanel').hidden && !e.target.closest('#sonPanel') && !e.target.closest('#bSon')) { $('sonPanel').hidden = true; $('bSon').classList.remove('on'); } });
soundUI();""")
rep("(boutons 🎶 et 🔔 en haut à droite)", "(bouton 🎚️ en haut à droite : un curseur pour la musique, un pour les bruitages)")
