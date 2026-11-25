# Version 21 [Romain, 25 nov., 20 h 27 : « Reviens comme c'était avant. Avec les méchants qui explosent quand ils sont étourdis. Qui donnent plein d'encre. »
#  « T'enlèves tous ces builds-là […] c'est quand même un jeu basé sur les runes. » « De base, on a juste la poussée et le trait. »
#  « On n'appuie pas sur un bouton pour lancer un parchemin qui ralentit le temps […] ça peut être une amélioration. »]
# Fabrique logic21.js à partir de logic20.js (qui garde le chronomètre sur le temps du combat) :
#  - comme avant : un sonné éclate d'un coup au trait, chaque golem lâche de l'encre ; le bâton redevient une petite aide ;
#  - plus de rouge, de mortier, de bombe, de porte-dalle ; le bélier ne casse plus les murs (le code reste, éteint par les réglages) ;
#  - on démarre avec le trait (court) et un petit V ; le mur, l'escargot, le bouclier (un cercle) et le ralenti (le sablier) se gagnent dans le grimoire ;
#  - plus de builds du bâton ; dix builds autour des runes, de l'encre, du bouclier, de la chouette.
import os, re
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic20.js')).read()
v18 = open(os.path.join(base, 'logic18.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
def carte18(nom):          # la ligne d'une carte de la version 18 (les builds de runes enlevés en version 19)
    i = v18.index('    ' + nom + ': {'); j = v18.index('\n', i); l = v18[i:j].rstrip(); return (l if l.endswith(',') else l + ',') + '\n'

# ---------- les réglages ----------
rep("  const MOTS = { dalle:", """  // ----- version 21 -----
  Object.assign(CFG, {
    shardEvery: 1, grosShards: null, boltEvery: 0.55, boltDmg: 1, boltPierce: 0,          // comme avant : plein d'encre, le bâton est une petite aide
    gbFirst: 1e9, mortierAt: 1e9, dalleAt: 1e9, bombeAt: 1e9, belierCasse: false,          // la version 20 est éteinte
    vMaxBase: 170, traitMaxBase: 320, domeCost: 4, domeCd: 8,
    // la courbe, refaite pour un jeu de runes sans ralenti au départ (réglée au robot)
    // version 22 [Romain, 21 h 07 : « tu peux remettre un petit peu de difficulté […] vu les améliorations, tu peux quand même y aller »] : plus de golems
    // (version 21 : rate0 0.2, rateAdd 0.1, rateLate 0.1, hpEvery 180, hpGrosEvery 180, hpLateEvery 120, burstDiv 150) ; plus de golems seuls ne durcissait rien (plus de gros = plus de pages) : ils sont aussi plus solides
    rate0: 0.22, rateAdd: 0.18, rateLate: 0.3, hpEvery: 120, hpGrosEvery: 150, hpLate: 1, hpLateEvery: 80, burst0: 3, burstDiv: 90, sideEvery: 240, pageStep: 0.34, pageVite: 99
  });
  const MOTS = { dalle:""")
rep("const SORTS_MAX = 5;", "const SORTS_MAX = 99;")

# ---------- les cartes ----------
i = s.index("    volcan: { fam: 'combo'")
anciens = carte18('orage') + carte18('scribe') + carte18('sanctuaire') + carte18('miroir')
anciens = anciens.replace("of: ['piege', 'chaine']", "of: ['chaine', 'tonnerre']").replace("fam: 'combo', of:", "fam: 'combo', genre: 'rune', of:")
assert anciens.count("genre: 'rune'") == 4, anciens.count("genre: 'rune'")
if not anciens.rstrip().endswith(','): anciens = anciens.rstrip() + ',\n'
neuves = """    mur: { fam: 'sort', nom: 'Rune du mur', ic: '🚧', max: 1, txt: l => 'Une nouvelle rune : trace un arc de cercle, un mur apparaît 3 secondes. Il ralentit les golems et renvoie les braises.' },
    spirale: { fam: 'sort', nom: 'Rune de l’escargot', ic: '🐌', max: 1, txt: l => 'Une nouvelle rune : trace un escargot, tous les golems autour sont repoussés au loin. Elle coûte la moitié de l’encre.' },
    dome: { fam: 'sort', nom: 'Rune du bouclier', ic: '🛡️', max: 3, txt: l => `Une nouvelle rune : trace un cercle fermé. Tes amis sont intouchables ${['', '2,5', '4', '5,5'][l]} secondes. Elle coûte 4 d’encre et se recharge en 8 secondes.` },
    sablier: { fam: 'sort', nom: 'Le sablier', ic: '⏳', max: 3, txt: l => `Quand tu graves, le temps ralentit ${['', 'de moitié', 'beaucoup', 'presque jusqu’à l’arrêt'][l]}, 2 secondes au plus par rune.` },
    grandv: { fam: 'rune', nom: 'Grand V', ic: '📐', max: 3, txt: l => `Ton V peut être ${['', 'une fois et demie plus grand', 'deux fois plus grand', 'aussi grand que tu veux'][l]}.` },
    long: { fam: 'rune', nom: 'Long trait', ic: '📏', max: 2, txt: l => `Ton trait peut ${['', 'traverser la moitié de la salle', 'traverser toute la salle'][l]}.` },
"""
s = s[:i] + neuves + anciens + s[i:]
rep("of: ['pas', 'percant']", "of: ['pas', 'aimant']"); rep("of: ['chouette', 'lourd']", "of: ['chouette', 'chaine']"); rep("of: ['pages', 'aimant']", "of: ['spirale', 'aimant']")
s = s.replace("fam: 'combo', genre: 'baton', of: ['pas', 'aimant']", "fam: 'combo', genre: 'rune', of: ['pas', 'aimant']").replace("fam: 'combo', genre: 'baton', of: ['chouette', 'chaine']", "fam: 'combo', genre: 'rune', of: ['chouette', 'chaine']")
rep("  const lv = (s, id) => s.up[id] || 0;", """  // version 21 : plus de cartes ni de builds du bâton (sauf le tir rapide), plus de pages volantes ; la chaîne part du trait
  for (const k of ['double', 'lourd', 'percant', 'pages', 'etoiles', 'ricochet', 'explosif', 'rayon', 'braise', 'givre', 'foudre', 'gardiennes']) delete CARDS[k];
  CARDS.solide.need = 'mur'; CARDS.epines.need = 'mur';
  { const t0 = CARDS.tornade.txt; CARDS.tornade.txt = l => l === 1 ? 'L’escargot ne coûte plus que 4 d’encre.' : t0(l); }
  Object.assign(CARDS.chaine, { fam: 'rune', txt: l => `Quand tu graves un trait, un éclair part du dernier golem touché et saute sur ${['', '3', '5', '7'][l]} golems.` });
  const lv = (s, id) => s.up[id] || 0;""")
rep("lv(s, id) < CARDS[id].max && (CARDS[id].fam !== 'sort'", "lv(s, id) < CARDS[id].max && (!CARDS[id].need || lv(s, CARDS[id].need) > 0) && (CARDS[id].fam !== 'sort'")

# ---------- le trait qui fait éclater, comme avant (avec l'orage) ----------
a = s.index("  function shatter(s, u, vus) {"); b = s.index("  // un soldat projeté qui cogne quelque chose est sonné", a)
a18 = v18.index("  function shatter(s, u) {"); b18 = v18.index("  // un soldat projeté qui cogne quelque chose est sonné", a18)
s = s[:a] + v18[a18:b18] + s[b:]

# ---------- le ralenti : seulement avec le sablier ----------
rep("    s.lent = brush && s.brushT <= s.cfg.slowMax;\n    const dt = dtReal * (s.lent ? s.cfg.slow : 1);", """    s.slowF = [1, 0.5, 0.3, 0.15][Math.min(3, lv(s, 'sablier'))];
    s.lent = brush && s.slowF < 1 && s.brushT <= s.cfg.slowMax;
    const dt = dtReal * (s.lent ? s.slowF : 1);
    if (s.dome > 0) s.dome -= dt;
    if (s.domeCd > 0) s.domeCd -= dt;""")

# ---------- le bélier ne casse plus les murs ----------
rep("      if (u.type === 'brute') for (const w of s.walls)", "      if (s.cfg.belierCasse && u.type === 'brute') for (const w of s.walls)")
rep("const g = u.type === 'brute' ? f : waypoint(s, u, f)", "const g = s.cfg.belierCasse && u.type === 'brute' ? f : waypoint(s, u, f)")

# ---------- la chaîne part du trait ----------
rep("    if (lv(s, 'chaine')) {\n", "    if (false && lv(s, 'chaine')) {   // version 21 : plus de chaîne automatique\n")
rep("        hit++;\n        if (u.daze > 0) shatter(s, u); else hurt(s, u, s.cfg.traitDmg);\n      }", "        hit++; dernier = u;\n        if (u.daze > 0) shatter(s, u); else hurt(s, u, s.cfg.traitDmg);\n      }\n      if (dernier && !copy && lv(s, 'chaine')) chainFrom(s, dernier, UP.chaineN[lv(s, 'chaine')], 300);")
rep("      const near = (x, y, w) => { const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2));", "      let dernier = null;\n      const near = (x, y, w) => { const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2));")

# ---------- le bouclier (un cercle), les runes à débloquer, les tailles ----------
rep("    if (rune.kind === 'ferme') return 0;", "    if (rune.kind === 'ferme') return lv(s, 'dome') ? s.cfg.domeCost : 0;")
rep("    if (rune.kind === 'ferme') { say(s, 'Un cercle ne fait rien. Trait, V, escargot ou arc de cercle.'); return { ok: false }; }", """    if (rune.kind === 'mur' && !lv(s, 'mur')) { say(s, 'Tu ne connais pas encore la rune du mur : elle est dans le grimoire.'); return { ok: false }; }
    if (rune.kind === 'spirale' && !lv(s, 'spirale')) { say(s, 'Tu ne connais pas encore l’escargot : il est dans le grimoire.'); return { ok: false }; }
    if (rune.kind === 'ferme') { if (!lv(s, 'dome')) { say(s, 'Un cercle ne fait rien… pour l’instant.'); return { ok: false }; } return castDome(s); }
    // au début le V est petit et le trait court : on les raccourcit (les cartes Grand V et Long trait les allongent)
    if (rune.kind === 'poussee') { const M = [1, 1.5, 2, 99][lv(s, 'grandv')] * s.cfg.vMaxBase; for (const k of ['a', 'b']) { const dx = rune[k].x - rune.tip.x, dy = rune[k].y - rune.tip.y, d = Math.hypot(dx, dy); if (d > M) rune = { ...rune, [k]: { x: rune.tip.x + dx / d * M, y: rune.tip.y + dy / d * M } }; } }
    if (rune.kind === 'trait') { const M = [s.cfg.traitMaxBase, 520, 9999][lv(s, 'long')], dx = rune.b.x - rune.a.x, dy = rune.b.y - rune.a.y, d = Math.hypot(dx, dy); if (d > M) { const mx = (rune.a.x + rune.b.x) / 2, my = (rune.a.y + rune.b.y) / 2, k = M / 2 / d; rune = { ...rune, a: { x: mx - dx * k, y: my - dy * k }, b: { x: mx + dx * k, y: my + dy * k } }; } }""")
rep("  // ----- graver une rune -----\n", """  // la rune du bouclier : un cercle fermé ; les amis sont intouchables un moment
  function castDome(s) {
    const c = s.cfg;
    if (s.domeCd > 0) { say(s, `Le bouclier se recharge (encore ${Math.ceil(s.domeCd)} s).`); return { ok: false }; }
    if (s.ink < c.domeCost) { say(s, `Pas assez d’encre (il en faut ${c.domeCost}). Ramasse des éclats.`); return { ok: false }; }
    s.ink -= c.domeCost; s.runes++; s.brushT = 0; s.dome = s.domeMax = [0, 2.5, 4, 5.5][lv(s, 'dome')]; s.domeCd = s.dome + c.domeCd; s.domes = (s.domes || 0) + 1;
    s.fx.push({ k: 'dome', life: 0.5, max: 0.5 }); say(s, `Bouclier ! Tes amis sont intouchables ${String(s.dome).replace('.', ',')} secondes.`);
    return { ok: true, hit: 0, killed: 0 };
  }
  // ----- graver une rune -----
""")
rep("  function hit(s, f, n) {\n", "  function hit(s, f, n) {\n    if (s.dome > 0) { if (((s.domePop = (s.domePop || 0) + 1) % 5) === 1) s.fx.push({ k: 'pop', x: f.x, y: f.y - f.r - 10, t: 'paré !', life: 0.6, max: 0.6, col: '#ffe58a' }); return; }\n")

open(os.path.join(base, 'logic21.js'), 'w').write(s)
print('logic21.js écrit :', len(s), 'caractères')
