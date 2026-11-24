# ----- version 16 : la grande salle vue de haut, Grosbec et ses golems (les modèles du combat du Barde), les amis de dos -----
def rep_n(a, b, n):
    global html
    assert html.count(a) == n, (a[:70], html.count(a)); html = html.replace(a, b)
# les mots : Grosbec, ses golems, les braises de ses frondeurs
rep_n("Le Sage contre le cœur", "Le Sage contre Grosbec", 2)
i0 = html.index("<p>Maquette n° 16 :"); i1 = html.index("</p>", i0)
html = html[:i0] + "<p>Maquette n° 16 : la grande salle de Grosbec vue de haut, Grosbec dans son armure et ses golems (les mêmes que dans le combat du Barde), les trois amis de dos qui l’attaquent. Les règles, les 10 combos et les sons ne changent pas. Le bouton 🎚️ règle le volume ; au clavier, Entrée ou Espace pour graver, 1, 2, 3 pour choisir une carte." + html[i1:]
rep("Tes trois amis cassent chacun un morceau de l’armure de Grosbec, sur leur tablette. Ici, au milieu de la place, le cœur de l’armure envoie ses soldats de pierre sur eux. Toi, le Sage, tu les protèges.",
    "Tes trois amis attaquent Grosbec, chacun sur sa tablette. Ici, dans sa grande salle, Grosbec envoie ses golems sur eux. Toi, le Sage, tu les protèges.")
rep("Son corps arrête les pierres.", "Son corps arrête les braises des frondeurs.")
rep("Chasse-les (V ou escargot) contre un mur, le bord ou un autre soldat : sonnés 3 secondes.", "Chasse-les (V ou escargot) contre un mur, le bord ou un autre golem : sonnés 3 secondes.")
rep("Un soldat sonné éclate, et ses éclats touchent ses voisins.", "Un golem sonné éclate, et ses éclats touchent ses voisins.")
rep("<b>Les chocs :</b> un soldat projeté qui cogne un autre soldat, un mur ou le bord est sonné 3 secondes.", "<b>Les chocs :</b> un golem projeté qui cogne un autre golem, un mur ou le bord est sonné 3 secondes.")
rep("les gros golems (moussus et blancs) lâchent une page dorée", "les gros golems (les béliers et les colosses) lâchent une page dorée")
rep("les gros (moussus et blancs), deux de plus chaque minute.", "les gros (les béliers et les colosses), deux de plus chaque minute.")
rep("Après 10 minutes, deux fois plus de lanceurs.", "Après 10 minutes, deux fois plus de frondeurs (ceux qui crachent des braises).")
rep("<b>La colère du cœur :</b>", "<b>La colère de Grosbec :</b>")
rep("<p>Le cœur attend, lui aussi.</p>", "<p>Grosbec attend, lui aussi.</p>")
rep("const leg = s.heart.bare ? 'Entoure le cœur d’un cercle' :", "const leg = s.heart.bare ? '' :")
rep('aria-label="L’arène du combat"', 'aria-label="La grande salle de Grosbec"')
# la fenêtre du jeu : un peu plus haute que large (la place, et le mur du fond au-dessus)
rep(".stage{position:relative;width:min(calc(100vw - 390px),calc(100svh - 76px));aspect-ratio:1;", ".stage{position:relative;width:min(calc(100vw - 390px),calc((100svh - 76px) * .872));aspect-ratio:900/1032;")
rep(".stage{width:min(100%,calc(100svh - 70px));margin:0 auto}", ".stage{width:min(100%,calc((100svh - 70px) * .872));margin:0 auto}")
# la finesse du dessin : elle baisse toute seule si l'appareil rame (FIN : 1, puis 0,78, 0,61, 0,48, 0,42), et on s'en souvient
rep("function resize() { const r = stage.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.2e6 / Math.max(1, r.width * r.height))); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); bg = null; }",
    """let FIN = 1;   // la finesse du dessin : 1, puis moins si l'appareil rame (on s'en souvient)
const QUAL = { lent: 0, vu: 0, t0: 0, repos: 2.5 };
if ((navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2) FIN = 0.61;   // un vieil appareil : on part léger
try { const q = +localStorage.getItem('sage-finesse'); if (q >= 0.4 && q <= 1) FIN = Math.min(1, Math.round(q / 0.78 * 100) / 100); } catch (e) {}   // on retente un cran plus fin que la dernière fois (l'appareil était peut-être juste occupé)
if (/[?&#]finesse=([\\d.]+)/.test(location.href)) { FIN = Math.min(1, Math.max(0.3, +RegExp.$1)); QUAL.fige = true; }
function resize() { const r = stage.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1.7e6 / Math.max(1, r.width * r.height))) * FIN; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); R8.dpr = cv.width / Math.max(1, r.width); if (bg && bg.getContext) bg.width = bg.height = 0; bg = null; ensureSprites(); }
function finesse(dt) {   // dt : le temps depuis l'image d'avant. Sous 25 images par seconde pendant 1,4 seconde : on dessine un peu moins fin.
  if (dt <= 0 || dt > 0.5 || QUAL.fige) return; QUAL.repos -= dt; if (QUAL.repos > 0) { QUAL.lent = QUAL.vu = QUAL.t0 = 0; return; }
  // une image pendant laquelle on a cuit un dessin (Grosbec, un golem) ne compte pas : ce n'est pas l'appareil qui rame
  if (R8.cuit > 0 || Golems.cuits !== QUAL.gc) { if (R8.cuit > 0) R8.cuit--; QUAL.gc = Golems.cuits; return; }
  QUAL.vu++; QUAL.t0 += dt; if (dt > 0.040) QUAL.lent++;
  if (QUAL.t0 < 1.4) return;
  if (QUAL.lent > QUAL.vu * 0.6 && FIN > 0.42) { FIN = Math.max(0.42, Math.round(FIN * (QUAL.t0 / QUAL.vu > 0.07 ? 61 : 78)) / 100); /* très lent : deux crans d'un coup */ try { localStorage.setItem('sage-finesse', String(FIN)); } catch (e) {} resize(); QUAL.repos = 2; }
  QUAL.lent = QUAL.vu = QUAL.t0 = 0;
}
// pendant qu'on lit l'explication (ou en pause), on prépare les images de Grosbec et des golems, un peu à la fois
setInterval(() => { if (!s || paused) { ensureSprites(); if (GB.kc) cuisson(6); } }, 45);""")
rep("""  if (s && !paused && !s.over) {
    G.step(s, dt, brush);""", """  if (s && !paused && !s.over) {
    if (!document.hidden) finesse(dt);
    G.step(s, dt, brush);""")
rep("window.__test = { get s() { return s; }, set paused(v) { paused = v; } };", "window.__test = { get s() { return s; }, set paused(v) { paused = v; }, get q() { return FIN; }, get cuits() { return [Golems.cuits, Object.keys(GB.im).length, GB.file.length, Golems.file]; }, get caches() { return [TEXTES.size, MOTS.size]; }, mesure() { const t0 = performance.now(); gbCuire('rg'); const t1 = performance.now(), n0 = Golems.cuits; Golems.regler(R8.kg + 0.2); Golems.prevoir(Object.values(GOLEM).map(P => P.m)); Golems.precuire(1e9); const t2 = performance.now(), n = Golems.cuits; Golems.regler(R8.kg); return { grosbec: t1 - t0, golems: n, parGolem: (t2 - t1) / Math.max(1, n), avant: n0 }; } };")
# les messages s'affichent sous l'estrade de Grosbec (plus sur lui)
# le message se pose toujours sous l'estrade, même à la victoire (avant, il descendait sur le Sage)
rep("let y = s.heart.bare ? Math.round(ch * 0.72) : Math.max(96, (R8.hudBottom || 0) + 8);", "let y = Math.max(96, (R8.hudBottom || 0) + 8, Math.round((view().oy + 142 * view().k) * cw / cv.width));")
# écrire du texte à chaque image coûte cher : chaque texte de l'affichage est écrit une fois dans une petite image, puis recopié
i0 = html.index("function text(t, x, y, size, col, align = 'center', weight = 800) {"); i1 = html.index("\n", i0)
html = html[:i0] + """const TEXTES = new Map();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => TEXTES.clear());
function text(t, x, y, size, col, align = 'center', weight = 800) {
  size = Math.round(size); const d = R8.dpr || 1, cle = t + '|' + size + '|' + col + '|' + weight + '|' + d; let sp = TEXTES.get(cle);
  if (!sp) {
    if (TEXTES.size > 160) vider(TEXTES);
    const f = `${weight} ${size}px Nunito, sans-serif`, m = mk(4, 4).getContext('2d'); m.font = f;
    const w = Math.ceil(m.measureText(t).width) + 6, h = Math.ceil(size * 1.7), c = mk(w * d, h * d), g = c.getContext('2d');
    g.scale(d, d); g.font = f; g.fillStyle = col; g.fillText(t, 3, size * 1.2); sp = { c, w, h }; TEXTES.set(cle, sp);
  }
  ctx.drawImage(sp.c, align === 'center' ? x - sp.w / 2 : align === 'right' ? x - sp.w + 3 : x - 3, y - size * 1.2, sp.w, sp.h);
}""" + html[i1:]
rep("ctx.font = `${chip * 0.55}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(C.ic, x + chip / 2, yy + chip * 0.62);", "text(C.ic, x + chip / 2, yy + chip * 0.62, chip * 0.55, '#fff', 'center', 400);")

# --- une ligne de chiffres sur l'écran de pause et sur l'écran de fin : si ça rame sur un vrai appareil, Romain peut la lire à Claude ---
rep("""<div class="row"><button class="b yellow" id="bResume">Reprendre</button></div></div></div>""", """<div class="row"><button class="b yellow" id="bResume">Reprendre</button></div><p class="mes" id="infoMesures"></p></div></div>""")
rep("""    <div class="row"><button class="b yellow" id="bAgain">Rejouer</button></div>""", """    <div class="row"><button class="b yellow" id="bAgain">Rejouer</button></div><p class="mes" id="infoMesuresFin"></p>""")
rep("[hidden]{display:none!important}", "[hidden]{display:none!important}\n.mes{font-size:12px;line-height:1.4;color:#8f9bc4;margin:12px 0 0}")
rep("function finesse(dt) {   // dt :", """const MES = { n: 0, t: 0, sec: 0, nsec: 0, pire: 0, baisses: 0, age: 0 };   // les images comptées pendant la partie
function mesurer(dt) { if (dt <= 0 || dt > 0.5) return; MES.n++; MES.t += dt; MES.age += dt; MES.sec += dt; MES.nsec++; if (MES.sec >= 1) { if (MES.age > 4) MES.pire = MES.pire ? Math.min(MES.pire, Math.round(MES.nsec / MES.sec)) : Math.round(MES.nsec / MES.sec); MES.sec = MES.nsec = 0; } }
function mesuresTxt() { return MES.n < 30 ? '' : `Mesures (version 16) : ${Math.round(MES.n / MES.t)} images par seconde, pire seconde ${MES.pire || '?'} · finesse ${Math.round(FIN * 100)} %, ${MES.baisses} baisse${MES.baisses > 1 ? 's' : ''} · ${Golems.cuits} + ${Object.keys(GB.im).length} images · écran ${innerWidth} × ${innerHeight} (× ${Math.round((devicePixelRatio || 1) * 10) / 10})`; }
function finesse(dt) {   // dt :""")
rep("try { localStorage.setItem('sage-finesse', String(FIN)); } catch (e) {} resize(); QUAL.repos = 2; }", "try { localStorage.setItem('sage-finesse', String(FIN)); } catch (e) {} resize(); QUAL.repos = 2; MES.baisses++; }")
rep("""    if (!document.hidden) finesse(dt);
    G.step(s, dt, brush);""", """    if (!document.hidden) { finesse(dt); mesurer(dt); }
    G.step(s, dt, brush);""")
rep("paused = on; SON.duck(on); $('ovPause').hidden = !on; last = 0; }", "paused = on; SON.duck(on); $('ovPause').hidden = !on; last = 0; if (on) $('infoMesures').textContent = mesuresTxt(); }")
rep("""function finish() {
  const win = s.over === 'win', p = s.protection, max = s.cfg.protection;""", """function finish() {
  $('infoMesuresFin').textContent = mesuresTxt();
  const win = s.over === 'win', p = s.protection, max = s.cfg.protection;""")
rep("paused = false; last = 0; setBrush(false); typed = []; slots(); lastPanel = '';", "paused = false; last = 0; setBrush(false); typed = []; slots(); lastPanel = ''; MES.n = MES.t = MES.sec = MES.nsec = MES.pire = MES.age = 0;")
# les derniers « soldats » qu'on lisait encore
rep("pendant 3 secondes. Les soldats qui s’en approchent sont ralen", "pendant 3 secondes. Les golems qui s’en approchent sont ralen")
rep("` Soldats détruits : ${s.kills}. Runes :", "` Golems détruits : ${s.kills}. Runes :")
