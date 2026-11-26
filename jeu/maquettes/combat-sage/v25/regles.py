# Version 25 [Romain, 26 nov., 19 h 28 : « Essaie de corriger ces défauts que tu as remarqués. »]
# Les deux défauts (relevés par Claude à 19 h 24) : quatre builds jouent sans rien graver ; des cartes ouvrent deux ou trois builds à la fois.
# Fabrique logic25.js à partir de logic24.js :
#  - plus rien n'attaque tout seul, sauf le bâton : la chouette et les chouettes fondent quand on grave une rune ; le sceau brûle quelques secondes après une rune ;
#    l'orage du niveau 3 tombe quand on grave ; la comète est enlevée ;
#  - le sanctuaire est refait autour de la rune du bouclier (et plus du bouclier de cristal) ;
#  - chaque carte n'ouvre plus qu'un seul build (9 builds).
import os
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic24.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)

# ---------- les cartes et les builds ----------
rep("  delete CARDS.sablier;", """  delete CARDS.sablier;
  // version 25 : la comète est enlevée ; chaque carte n'ouvre plus qu'un seul build
  delete CARDS.comete;
  CARDS.miroir.of = ['long', 'grandv']; CARDS.bowling.of = ['tonnerre', 'solide']; CARDS.rempart.of = ['mur', 'epines'];
  CARDS.orage.of = ['chaine', 'eblouir']; CARDS.chouettes.of = ['chouette', 'pas']; CARDS.sanctuaire.of = ['dome', 'sceau'];
  Object.assign(CARDS.chouette, { txt: l => `Chaque fois que tu graves une rune, la chouette fond sur un golem (les frondeurs d’abord) : ${UP.chouetteD[l]} dégâts. Le reste du temps, elle tourne autour de toi.` });
  Object.assign(CARDS.sceau, { txt: l => `Après chaque rune, un cercle doré brûle autour des amis pendant ${UP.sceauDur[l]} secondes : 1 dégât aux golems qui y sont, ${['', 'chaque seconde', 'toutes les 0,8 seconde', 'toutes les 0,6 seconde'][l]}.` });
  { const t0 = CARDS.orage.txt; CARDS.orage.txt = l => l === 3 ? 'Chaque rune gravée fait tomber la foudre sur 5 golems : ils sont sonnés, et les sonnés éclatent.' : t0(l); }
  CARDS.sanctuaire.txt = l => ['', 'Quand tu graves le bouclier, le sceau sonne tous les golems autour des amis.', 'Quand le bouclier s’éteint, il éclate : les golems autour des amis sont projetés au loin.', 'Cet éclat fait éclater les golems sonnés.'][l];
  { const t0 = CARDS.chouettes.txt; CARDS.chouettes.txt = l => l === 1 ? 'Une deuxième chouette, et chaque coup de bec lance un éclair. Elles fondent toutes à chaque rune gravée.' : t0(l); }""")
rep("bouclierT: [0, 20, 15, 10],", "bouclierT: [0, 20, 15, 10], sceauDur: [0, 3, 4, 5],")

# ---------- se souvenir de la dernière rune ----------
rep("    s.ink -= c.domeCost; s.runes++; s.brushT = 0;", "    s.ink -= c.domeCost; s.runes++; s.brushT = 0; runeGravee(s);")
rep("    s.ink -= cost; s.runes++; s.brushT = 0;\n", "    s.ink -= cost; s.runes++; s.brushT = 0; runeGravee(s);\n")
rep("  // la rune du bouclier : un cercle fermé ; les amis sont intouchables un moment\n", """  // version 25 : une rune vient d'être gravée → les chouettes repartent, le sceau s'allume, l'orage du niveau 3 tombe
  function runeGravee(s) {
    s.derniereRune = s.t;
    for (const o of s.owls) o.charge = Math.min(2, (o.charge || 0) + 1);
    if (lv(s, 'orage') >= 3) s.orageVeut = true;
  }
  // la rune du bouclier : un cercle fermé ; les amis sont intouchables un moment
""")

# ---------- la chouette : seulement après une rune ----------
rep("        if (o.cd <= 0) {\n          let tg = null, b = 560;", "        if (o.cd <= 0 && o.charge > 0) {\n          let tg = null, b = 560;")
rep("          if (tg) { o.mode = 'pique'; o.tg = tg; o.t = 0; o.x0 = o.x; o.y0 = o.y; } else o.cd = 0.4;", "          if (tg) { o.mode = 'pique'; o.tg = tg; o.t = 0; o.x0 = o.x; o.y0 = o.y; o.charge--; } else o.cd = 0.4;")
rep("        if (k >= 1) { o.mode = 'tour'; o.cd = UP.chouetteT[L]; }", "        if (k >= 1) { o.mode = 'tour'; o.cd = 0.25; }")

# ---------- le sceau : quelques secondes après une rune ----------
rep("    if (lv(s, 'sceau')) {\n      s.sealT -= dt;", "    if (lv(s, 'sceau') && s.t - (s.derniereRune ?? -99) < UP.sceauDur[lv(s, 'sceau')]) {\n      s.sealT -= dt;")

# ---------- l'orage du niveau 3 : quand on grave ----------
rep("    if (lv(s, 'orage') >= 3) {\n      s.stormT -= dt;\n      if (s.stormT <= 0 && s.soldiers.length) {\n        s.stormT = 6;", "    if (lv(s, 'orage') >= 3) {\n      if (s.orageVeut && s.soldiers.length) {\n        s.orageVeut = false;")

# ---------- le sanctuaire autour de la rune du bouclier ----------
rep("      if (lv(s, 'sanctuaire')) { const R = UP.sceauR[lv(s, 'sceau')];", "      if (false && lv(s, 'sanctuaire')) { const R = UP.sceauR[lv(s, 'sceau')];")
rep("    if (SA >= 2 && lv(s, 'sceau')) {\n      s.pulseT -= dt;\n      if (s.pulseT <= 0) {\n        s.pulseT = 8;", "    if (SA >= 2 && s.pulseNow) {\n      s.pulseNow = false;\n      {")
rep("    if (s.dome > 0) s.dome -= dt;", "    if (s.dome > 0) { s.dome -= dt; if (s.dome <= 0) s.pulseNow = true; }")
rep("s.domeCd = s.dome + c.domeCd; s.domes = (s.domes || 0) + 1;", "s.domeCd = s.dome + c.domeCd; s.domes = (s.domes || 0) + 1;\n    if (lv(s, 'sanctuaire')) { const R = UP.sceauR[Math.max(1, lv(s, 'sceau'))]; for (const u of s.soldiers) if (u.hp > 0 && Math.hypot(u.x - 450, u.y - 445) < R + u.r) stun(s, u); s.fx.push({ k: 'trap', x: 450, y: 445, R, life: 0.5, max: 0.5 }); }")

open(os.path.join(base, 'logic25.js'), 'w').write(s)
print('logic25.js écrit :', len(s), 'caractères')
