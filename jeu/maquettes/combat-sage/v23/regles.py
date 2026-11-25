# Version 23 [Romain, 25 nov., 22 h 40 : « il y a vraiment pas assez d'ennemis. Tu peux doubler le nombre d'ennemis, facile » ;
#  22 h 49 : « tu fais en sorte de doubler le nombre de golems, mais […] qu'à la fin, on ait le même nombre, quoi qu'il arrive, de pages […] Faut pas que ça soit lié au nombre de golems. C'est juste que les pages, elles arrivent. »]
# Fabrique logic23.js à partir de logic21.js : deux fois plus de golems ; les pages tombent à heure fixe (19 en 10 minutes).
import os
ici = os.path.dirname(os.path.abspath(__file__)); base = os.path.dirname(ici)
s = open(os.path.join(base, 'logic21.js')).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
rep("  const MOTS = { dalle:", """  // ----- version 23 : deux fois plus de golems (version 22 : rate0 0.22, rateAdd 0.18, rateLate 0.3, burst0 3, burstDiv 90, maxAlive 75) ; les pages à heure fixe -----
  Object.assign(CFG, { rate0: 0.44, rateAdd: 0.36, rateLate: 0.6, burst0: 6, burstDiv: 45, maxAlive: 130, pageT0: 20, pageGap: 22, pageGapAdd: 1 });
  const MOTS = { dalle:""")
rep("    if (GROS.includes(u.type) && ++s.grosKills >= s.pageNeed) {", "    if (false && GROS.includes(u.type) && ++s.grosKills >= s.pageNeed) {   // version 23 : les pages ne viennent plus des gros")
rep("    grosbec(s, dt);\n", """    grosbec(s, dt);
    // version 23 : les pages tombent à heure fixe, quoi qu'on détruise : à 20 s, puis 23 s après, 24, 25… (19 pages en 10 minutes) ; un peu à l'écart des amis
    s.pageT = (s.pageT ?? s.cfg.pageT0) - dt;
    if (s.pageT <= 0) { s.pageT += s.cfg.pageGap + s.cfg.pageGapAdd * (++s.pageIdx); s.pagesTombees = (s.pagesTombees || 0) + 1; const a = rng(s) * 6.283, d = 170 + rng(s) * 110; s.pages.push({ x: Math.max(60, Math.min(W - 60, 450 + Math.cos(a) * d)), y: Math.max(90, Math.min(H - 60, 445 + Math.sin(a) * d * 0.9)), t: 0 }); say(s, 'Une page du grimoire est tombée ! Va la chercher.', 2.4); }
""")
open(os.path.join(base, 'logic23.js'), 'w').write(s)
print('logic23.js écrit :', len(s), 'caractères')
