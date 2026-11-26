# Fabrique la maquette du combat du Sage : python3 construire.py → combat-sage.html (un seul fichier, tout dedans)
# 1. v16/assembler.py refait render16.js (les dessins) à partir de render15.js et des morceaux de v16/ ;
# 2. la page ui7.html reçoit les retouches des versions 8 à 20 (ici, puis build12_part.py, build14_part.py, build16_part.py, build17_part.py, build18_part.py, build19_part.py, build20_part.py, build21_part.py, build22_part.py, build23_part.py, build24_part.py, build25_part.py) ;
# 3. on y colle les règles (logic21.js, fabriqué par v21/regles.py à partir de logic20.js, lui-même fabriqué par v20/regles.py à partir de logic19.js, lui-même fabriqué par v19/regles.py à partir de logic18.js), les sons (sound14.js) et les modèles du combat du Barde (barde/, retouchés par modeles_barde.py).
import os, sys, subprocess
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
subprocess.run([sys.executable, D + '/v16/assembler.py'], check=True)
subprocess.run([sys.executable, D + '/v19/regles.py'], check=True)   # refait logic19.js à partir de logic18.js
subprocess.run([sys.executable, D + '/v20/regles.py'], check=True)   # refait logic20.js à partir de logic19.js
subprocess.run([sys.executable, D + '/v21/regles.py'], check=True)   # refait logic21.js à partir de logic20.js
subprocess.run([sys.executable, D + '/v23/regles.py'], check=True)   # refait logic23.js à partir de logic21.js
subprocess.run([sys.executable, D + '/v24/regles.py'], check=True)   # refait logic24.js à partir de logic23.js
subprocess.run([sys.executable, D + '/v25/regles.py'], check=True)   # refait logic25.js à partir de logic24.js
import re
HPLATE = int(re.search(r'hpLateEvery: (\d+),', open(D + '/v20/regles.py').read()).group(1))
from modeles_barde import modeles
ui=open(D+'/ui7.html').read().split('\n')
new=ui[:181]+ui[192:195]+['', open(D+'/render16.js').read()]+ui[303:]
html='\n'.join(new)
def rep(a,b):
    global html
    assert html.count(a)==1,(a[:70],html.count(a)); html=html.replace(a,b)
rep("Maquette n° 7, en temps réel : V qui chasse, escargot rare, mur en arc de cercle, et les codes des amis. Ronds et carrés, sans sons.","Maquette n° 16 : 10 combos à 3 niveaux, de plus en plus fous, la colère du cœur, et les sons : une musique de combat 8 bits et des bruitages doux (boutons 🎶 et 🔔 en haut à droite). Au clavier, Entrée ou Espace pour graver, 1, 2, 3 pour choisir une carte.")
rep("  render();\n  requestAnimationFrame(loop);","  render(dt);\n  requestAnimationFrame(loop);")
rep('  let y = 96;','  let y = s.heart.bare ? Math.round(ch * 0.72) : 96;')
# --- le plein écran ---
rep("@media (max-width:1000px)","""/* plein écran : le jeu prend toute la page, l'aide-mémoire devient un volet */
.tools{position:absolute;right:8px;top:56px;display:flex;gap:6px}
.tool{width:44px;height:44px;border-radius:12px;border:2px solid #2b365a;background:rgba(15,21,40,.88);color:var(--ink);font-size:21px;cursor:pointer;display:grid;place-items:center;padding:0}
.tool svg{width:24px;height:24px}
#bAide,.closeaide{display:none}
body.plein{overflow:hidden}
body.plein header,body.plein .panel{display:none}
body.plein .game{display:block;padding:0}
body.plein .stage{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;aspect-ratio:auto;border:0;border-radius:0;margin:0}
body.plein #bAide{display:grid}
body.plein .closeaide{display:block}
body.plein.aide .panel{display:grid;position:fixed;top:0;right:0;bottom:0;width:min(380px,92vw);overflow:auto;z-index:4;border-radius:18px 0 0 18px;box-shadow:-10px 0 40px rgba(0,0,0,.6);align-content:start}
@media (max-width:1000px)""")
rep("""    <button class="brush" id="bBrush">Graver<small>la rune</small></button>""","""    <button class="brush" id="bBrush">Graver<small>la rune</small></button>
    <div class="tools"><button class="tool" id="bAide" aria-label="Les runes et les codes" title="Les runes et les codes">📜</button><button class="tool" id="bPlein" aria-label="Plein écran" title="Plein écran"></button></div>""")
rep("""  <section class="panel" aria-label="Les runes du Sage">
    <h2>Les quatre runes</h2>""","""  <section class="panel" aria-label="Les runes du Sage">
    <div class="row closeaide"><button class="b" id="bAideClose">Fermer et reprendre</button></div>
    <h2>Les quatre runes</h2>""")
rep("""    <div class="row"><button class="b yellow" id="bStart">Commencer</button></div>""","""    <div class="row"><button class="b yellow" id="bStart">Commencer</button><button class="b yellow" id="bStartPlein">Commencer en plein écran</button></div>""")
rep("const toWorld = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * G.W, y: (e.clientY - r.top) / r.height * G.H }; };",
    "const toWorld = e => { const r = cv.getBoundingClientRect(), d = cv.width / r.width, v = view(); return { x: ((e.clientX - r.left) * d - v.ox) / v.k, y: ((e.clientY - r.top) * d - v.oy) / v.k }; };")
rep("const fast = location.hash === '#rapide';","const fast = location.hash.includes('rapide');")
rep("function pause(on) { if (!s || s.over) return; paused = on;","function pause(on) { if (!s || s.over) return; closeAide(false); paused = on;")
rep("  $('pad').hidden = true; $('ovStart').hidden = true; $('ovEnd').hidden = true; $('ovPause').hidden = true;\n}",
    "  $('pad').hidden = true; $('ovStart').hidden = true; $('ovEnd').hidden = true; $('ovPause').hidden = true; closeAide(false);\n  if (document.body.classList.contains('plein')) pleinAPI();\n}")
rep("$('bHow').onclick = () => { pause(true);","$('bHow').onclick = () => { $('bStartPlein').hidden = true; pause(true);")
rep("s = G.newGame(); paused = true; friendsPanel();\n}","""// ----- le plein écran -----
const ICON_IN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const ICON_OUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function pleinAPI() { const d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen; if (f && !isFs()) try { const p = f.call(d); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
function sortieAPI() { const f = document.exitFullscreen || document.webkitExitFullscreen; if (f && isFs()) try { const p = f.call(document); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
function setPlein(on) {
  document.body.classList.toggle('plein', on); closeAide(true);
  $('bPlein').innerHTML = on ? ICON_OUT : ICON_IN;
  const lab = on ? 'Quitter le plein écran' : 'Plein écran'; $('bPlein').setAttribute('aria-label', lab); $('bPlein').title = lab;
  if (on) pleinAPI(); else sortieAPI();
}
let fsWas = false;
const onFs = () => { const now = isFs(); if (fsWas && !now && document.body.classList.contains('plein')) setPlein(false); fsWas = now; };
document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
$('bPlein').onclick = () => setPlein(!document.body.classList.contains('plein'));
$('bStartPlein').onclick = () => { setPlein(true); start(); };
// le volet d'aide (en plein écran) : il met le jeu en attente
let aidePaused = false;
function closeAide(resume) {
  if (!document.body.classList.contains('aide')) return;
  document.body.classList.remove('aide');
  if (aidePaused) { aidePaused = false; if (resume && s && !s.over) { paused = false; last = 0; } }
}
$('bAide').onclick = () => {
  if (document.body.classList.contains('aide')) return closeAide(true);
  document.body.classList.add('aide');
  if (s && !s.over && !paused && $('ovStart').hidden) { paused = true; aidePaused = true; }
};
$('bAideClose').onclick = () => closeAide(true);
setPlein(location.hash.includes('plein'));
s = G.newGame(); paused = true; friendsPanel();\n}""")
rep("s = G.newGame(); paused = true; friendsPanel();\n}","s = G.newGame(); paused = true; friendsPanel();\nwindow.__test = { get s() { return s; }, set paused(v) { paused = v; } };\n}")

# ----- version 9 -----
rep("""    <p class="note">Le cercle n’est pas une rune de combat : c’est la grande rune de cristal, gardée pour enfermer le cœur à la fin.</p>""",
    """    <p class="note"><b>Les amis venus t’aider :</b> le Pisteur tire des salves de flèches et saute à la dague sur le golem qui s’approche trop. L’Alchimiste lance une fiole toutes les 2 secondes : de la boue qui colle, des lianes qui bloquent ou du feu. Le Barde envoie des partitions : les golems touchés font demi-tour ou se mettent à danser.</p>
    <p class="note"><b>Ça durcit :</b> toutes les 2 minutes, les golems ont une vie de plus ; les gros (moussus et blancs), deux de plus chaque minute. Toutes les 3 minutes, les grosses vagues arrivent d’un côté de plus. Après 10 minutes, deux fois plus de lanceurs.</p>""")
rep("""        <p>Quand un ami gagne, il te crie son code : tape-le vite, il vient t’aider. Après les trois, entoure le cœur d’un cercle.</p>""",
    """        <p>Quand un ami gagne son combat, il te crie son code : tape-le, il vient t’aider avec son pouvoir. Les trois codes : c’est gagné.</p>""")
rep("""    <div class="row"><button class="b yellow" id="bStart">Commencer</button>""",
    """    <div class="row essai" id="essai"><span>Pour l’essai, tes amis finissent leur combat vers :</span><button class="b" data-min="4">4 min</button><button class="b on" data-min="8">8 min</button><button class="b" data-min="12">12 min</button></div>
    <div class="row"><button class="b yellow" id="bStart">Commencer</button>""")
rep("text(s.heart.bare ? 'Le cœur est à nu !' : `Amis vainqueurs", "text(s.over === 'win' ? 'L’armure tombe !' : `Amis vainqueurs")
rep("function resize() { const r = stage.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);",
    "function resize() { const r = stage.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.2e6 / Math.max(1, r.width * r.height)));")
rep("  render(dt);\n  requestAnimationFrame(loop);", "  const r0 = performance.now(); render(dt); (window.__ms = window.__ms || []).push(performance.now() - r0); if (window.__ms.length > 200) window.__ms.shift();\n  requestAnimationFrame(loop);")
rep("@media (max-width:1000px)", """.essai{align-items:center;color:var(--mute);font-size:15px}
.essai .b.on{border-color:var(--yellow);color:var(--yellow)}
@media (max-width:1000px)""")
rep("""  s = G.newGame(fast ? { cfg: { codeTimes: [10, 18, 26] } } : {});""",
    """  s = G.newGame({ cfg: fast ? { codeTimes: [10, 18, 26] } : { duree: dureeAmis * 60 } });""")
rep("""const fast = location.hash.includes('rapide');""","""const fast = location.hash.includes('rapide');
let dureeAmis = 8;
$('essai').addEventListener('click', e => { const b = e.target.closest('[data-min]'); if (!b) return; dureeAmis = +b.dataset.min; [...$('essai').querySelectorAll('[data-min]')].forEach(x => x.classList.toggle('on', x === b)); });""")
rep("""    const r = G.enterCode(s, typed);
    if (r.ok) {""","""    const r = G.enterCode(s, typed);
    if (r.ok && s.over) { $('pad').hidden = true; typed = []; slots(); setTimeout(finish, 2400); return; }
    if (r.ok) {""")
rep("""  $('endTitle').textContent = win ? 'Le cœur est enfermé !' : 'Perdu';""","""  $('endTitle').textContent = win ? 'L’armure tombe !' : 'Perdu';""")
rep("""  $('endWhy').textContent = (win ? `Protection restante : ${p} sur ${max}.` :""","""  $('endWhy').textContent = (win ? `Tes trois amis ont gagné, et tu les as protégés pendant ${m} min ${sec}. Protection restante : ${p} sur ${max}.` :""")
# l'heure du combat, discrète, dans la case de la protection (pour l'essai)
rep("""  text(`Protection : ${s.protection}`, cw - pw + 2, 8 + fs + 6, fs, '#bfefff', 'left', 800);""",
    """  text(`Protection : ${s.protection}`, cw - pw + 2, 8 + fs + 6, fs, '#bfefff', 'left', 800);
  text(`${Math.floor(s.realT / 60)}:${String(Math.floor(s.realT % 60)).padStart(2, '0')}`, cw - 18, 8 + fs + 6, fs - 1, '#8f9bb8', 'right', 700);""")

# ----- version 10 : les pages du grimoire -----
rep("  let y = s.heart.bare ? Math.round(ch * 0.72) : 96;", "  let y = s.heart.bare ? Math.round(ch * 0.72) : Math.max(96, (R8.hudBottom || 0) + 8);")
rep("""<div class="ov" id="ovPause" hidden>""", """<div class="ov" id="ovChoix" hidden><div class="card choixcard"><h2>Une page du grimoire !</h2><p>Choisis un pouvoir. Le combat attend.</p><div class="cartes" id="cartes"></div></div></div>
<div class="ov" id="ovPause" hidden>""")
rep("@media (max-width:1000px)", """.choixcard{max-width:900px}
.cartes{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.carte{display:grid;gap:8px;justify-items:center;text-align:center;background:#111a33;border:2px solid var(--line);border-radius:18px;padding:16px 12px;color:var(--ink);font:inherit;cursor:pointer;transition:transform .12s}
.carte:hover,.carte:focus-visible{transform:translateY(-3px);border-color:var(--yellow)}
.carte .ic{font-size:46px;line-height:1}
.carte .fam{font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.carte .nom{font-size:20px;font-weight:800}
.carte .niv{font-size:13px;font-weight:800;border-radius:99px;padding:2px 10px;background:#22305a}
.carte .txt{font-size:16px;color:#c9d3ee;line-height:1.35}
.carte.combo{background:linear-gradient(160deg,#3a2a08,#1a1430 70%);border-color:#ffb000 !important;box-shadow:0 0 22px rgba(255,176,0,.35)}
@media (max-width:620px){.cartes{grid-template-columns:1fr;gap:8px}.carte{grid-template-columns:auto 1fr;justify-items:start;text-align:left;padding:10px 12px;column-gap:12px}.carte .ic{grid-row:span 4;font-size:38px;align-self:center}.carte .nom{font-size:17px}.carte .txt{font-size:14px}}
@media (max-width:1000px)""")
rep("""  if (s && !paused && !s.over) {
    G.step(s, dt, brush);
    if (s.over) setTimeout(finish, 800);
  }""","""  if (s && !paused && !s.over) {
    G.step(s, dt, brush);
    if (s.over) setTimeout(finish, 800);
    if (s.choice && $('ovChoix').hidden) showChoice();
  }""")
rep("""function pause(on) {""","""// ----- la fenêtre des cartes -----
const FAM = { baton: ['Le bâton', '#6fe3ff'], rune: ['Les runes', '#ffd23f'], sort: ['Nouveau sort', '#c77dff'], cadeau: ['Cadeau', '#7ef0a0'], combo: ['Combo !', '#ffb000'] };
function showChoice() {
  if (brush) setBrush(false);
  const box = $('cartes'); box.innerHTML = '';
  for (const id of s.choice.cards) {
    const C = G.CARDS[id], l = id === 'soin' ? 0 : G.lv(s, id) + 1, f = FAM[C.fam];
    const b = document.createElement('button'); b.className = 'carte'; b.style.borderColor = f[1] + '66';
    if (C.fam === 'combo') { b.classList.add('combo'); b.innerHTML = `<span class="ic">${C.ic}</span><span class="fam" style="color:${f[1]}">Combo !</span><span class="nom">${C.nom}</span><span class="niv" style="color:${f[1]}">${G.CARDS[C.of[0]].ic} ${G.CARDS[C.of[0]].nom} + ${G.CARDS[C.of[1]].ic} ${G.CARDS[C.of[1]].nom}</span><span class="txt">${C.txt()}</span>`; }
    else b.innerHTML = `<span class="ic">${C.ic}</span><span class="fam" style="color:${f[1]}">${C.fam === 'sort' && l > 1 ? 'Sort' : f[0]}</span><span class="nom">${C.nom}</span>${l ? `<span class="niv" style="color:${f[1]}">${l === 1 ? (C.fam === 'sort' ? 'nouveau' : 'niveau 1') : 'niveau ' + l}</span>` : ''}<span class="txt">${C.txt(l || 1)}</span>`;
    b.onclick = () => { G.choose(s, id); $('ovChoix').hidden = true; last = 0; if (document.activeElement) document.activeElement.blur(); };
    box.appendChild(b);
  }
  $('ovChoix').hidden = false;
}
function pause(on) {""")
rep("""        <p>Garde le doigt sur l’arène : le Sage y court. Son bâton tire tout seul. Son corps arrête les pierres.</p>""",
    """        <p>Garde le doigt sur l’arène : le Sage y court. Son bâton tire tout seul. Son corps arrête les pierres. Les gros golems lâchent des pages dorées : touche-les pour choisir un pouvoir.</p>""")
rep("""    <p class="note"><b>Ça durcit :</b>""","""    <p class="note"><b>Les pages du grimoire :</b> les gros golems (moussus et blancs) lâchent une page dorée : la première au premier gros détruit, puis au bout de 3, 5, 7… gros. Le Sage va la toucher : tu choisis un pouvoir parmi trois (le bâton, les runes, un nouveau sort, ou un cadeau). 4 sorts au plus, chaque pouvoir monte jusqu’au niveau 3.</p>
    <p class="note"><b>Ça durcit :</b>""")

# ----- version 11 -----
rep("addEventListener('keydown', e => { if (e.code === 'Space' && s && !paused && !s.over) { e.preventDefault(); setBrush(!brush); } });",
    """// au clavier : Entrée ou Espace pour graver (toujours, même après une carte), 1, 2, 3 pour choisir une carte
addEventListener('keydown', e => {
  if (!s || s.over) return;
  if (!$('ovChoix').hidden) { const i = ['1', '2', '3'].indexOf(e.key); if (i >= 0) { e.preventDefault(); const b = $('cartes').children[i]; if (b) b.click(); } else if (e.key === 'Enter' || e.code === 'Space') e.preventDefault(); return; }
  if (paused || !$('ovStart').hidden || !$('ovEnd').hidden) return;
  if (e.code === 'Space' || e.key === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); setBrush(!brush); }
});
// un bouton touché à la souris ne garde pas la main sur le clavier
document.addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.id !== 'bStart') setTimeout(() => b.blur(), 0); });""")
rep("""les gros golems (moussus et blancs) lâchent une page dorée : la première au premier gros détruit, puis au bout de 3, 5, 7… gros.""",
    """les gros golems (moussus et blancs) lâchent une page dorée : la première au premier gros détruit, puis au bout de 2, 4, 5, 7, 8… gros.""")
rep("""4 sorts au plus, chaque pouvoir monte jusqu’au niveau 3.</p>""",
    """4 sorts au plus, chaque pouvoir monte jusqu’au niveau 3.</p>
    <p class="note"><b>Les combos :</b> quand tu as deux cartes qui vont ensemble, dont une au niveau 3, une carte dorée « Combo ! » sort à la page suivante. Huit combos à découvrir.</p>""")
rep("""Le Barde envoie des partitions : les golems touchés font demi-tour ou se mettent à danser.""",
    """Le Barde envoie des partitions : les golems touchés font demi-tour, se mettent à danser, ou sont repoussés au loin (et sonnés s’ils cognent quelque chose).""")
rep("""toutes les 2 minutes, les golems ont une vie de plus ; les gros (moussus et blancs), deux de plus chaque minute.""",
    """toutes les 90 secondes, les golems ont une vie de plus ; les gros (moussus et blancs), deux de plus chaque minute.""")

exec(open(D+'/build12_part.py').read())
exec(open(D+'/build14_part.py').read())
exec(open(D+'/build16_part.py').read())
exec(open(D+'/build17_part.py').read())
exec(open(D+'/build18_part.py').read())
exec(open(D+'/build19_part.py').read())
exec(open(D+'/build20_part.py').read())
html = html.replace('HPLATE', str(HPLATE))
exec(open(D+'/build21_part.py').read())
exec(open(D+'/build22_part.py').read())
exec(open(D+'/build23_part.py').read())
exec(open(D+'/build24_part.py').read())
exec(open(D+'/build25_part.py').read())
# les sons : les nouveaux effets de la version 19 (l'explosion d'une orbe, l'éclat de givre) jouent des sons qui existent déjà
SON19 = open(D+'/sound14.js').read(); _a = "bonk: 'bonk', pop2: 'trap',"; assert SON19.count(_a) == 1; SON19 = SON19.replace(_a, "bonk: 'bonk', boum: 'bonk', gel: 'glass', gbcoup: 'side', frappe: 'fireball', casse: 'glass', sonne: 'fail', dome: 'good', pop2: 'trap',")
logic='\n'.join(l for l in open(D+'/logic25.js').read().split('\n') if 'module.exports' not in l)
open(D+'/combat-sage.html','w').write(html.replace('/*LOGIC*/',logic + '\n' + SON19 + '\n' + modeles()))
print('construit')
