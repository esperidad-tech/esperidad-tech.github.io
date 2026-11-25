# Version 24 [Romain, 25 nov., 23 h 35 : « est-ce que tu peux remettre le ralentissement […] le ralentissement maximum là, que tu avais mis au début, quand on fait les dessins ?
#  Essaie de trouver un autre build pour le remplacer »]
# Fabrique logic24.js à partir de logic23.js : le ralenti fort revient dès le départ quand on grave (sans limite de durée : le chronomètre ne compte que le combat) ;
# la carte du sablier disparaît ; à sa place, « Lumière aveuglante » : le trait sonne les golems qu'il ne détruit pas (un deuxième trait les fait éclater).
import os
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic23.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
rep("    s.slowF = [1, 0.5, 0.3, 0.15][Math.min(3, lv(s, 'sablier'))];", "    s.slowF = s.cfg.slow;   // version 24 : le ralenti du début (le combat 14 fois plus lent), pour tout le monde")
rep("  const MOTS = { dalle:", "  Object.assign(CFG, { slowMax: 1e9 });   // version 24 : le ralenti dure tant qu'on grave\n  const MOTS = { dalle:")
rep("  const lv = (s, id) => s.up[id] || 0;", """  // version 24 : plus de sablier ; à sa place, la lumière aveuglante
  delete CARDS.sablier;
  CARDS.eblouir = { fam: 'rune', nom: 'Lumière aveuglante', ic: '💫', max: 3, txt: l => `Ton trait éblouit les golems qu’il ne détruit pas : ils sont sonnés ${['', '1 seconde', '2 secondes', '3 secondes'][l]}. Un deuxième trait les fait éclater.` };
  const lv = (s, id) => s.up[id] || 0;""")
rep("        if (u.daze > 0) shatter(s, u); else hurt(s, u, s.cfg.traitDmg);\n      }\n      if (dernier && !copy", "        if (u.daze > 0) shatter(s, u); else { hurt(s, u, s.cfg.traitDmg); if (u.hp > 0 && !u.iron && lv(s, 'eblouir')) { u.daze = Math.max(u.daze, lv(s, 'eblouir')); s.eblouis = (s.eblouis || 0) + 1; } }\n      }\n      if (dernier && !copy")
open(os.path.join(base, 'logic24.js'), 'w').write(s)
print('logic24.js écrit :', len(s), 'caractères')
