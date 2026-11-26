# Version 28 : la nouvelle lecture des runes dorées (logic28.js) ; dans la page, seulement les textes. Travaille sur « html », après build27_part.py.
def rep(a, b, n=1):
    global html
    assert html.count(a) == n, (a[:80], html.count(a)); html = html.replace(a, b)
rep("Maquette n° 27 : un jeu de runes, avec 14 builds et les trois runes dorées du Sage (le triangle, la lune, l’étoile : une fois par combat chacune).",
    "Maquette n° 28 : un jeu de runes, avec 14 builds et les trois runes dorées du Sage (le triangle, la lune, l’étoile : une fois par combat chacune ; elles sont maintenant lues sur de vrais dessins à la main).")
rep("Mesures (version 27)", "Mesures (version 28)")
rep("une <b>étoile</b> ★ à cinq branches, d’un seul trait (la plus dure) : tous les golems de la salle sont détruits.",
    "une <b>étoile</b> ★ à cinq branches, d’un seul trait (croisée, ou juste le contour) : tous les golems de la salle sont détruits.")
rep("Une étoile à cinq branches, d’un seul trait : la plus dure à tracer.", "Une étoile à cinq branches, d’un seul trait : croisée, ou juste le contour.")
# le doigt : on prend tous les petits points que la tablette envoie entre deux images (sinon une pointe tracée vite est coupée)
rep("""  if (brush && stroke) {
    const q = stroke[stroke.length - 1], d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d > 3) { stroke.push(p); strokeLen += d; }
    return;
  }""", """  if (brush && stroke) {
    const L = e.getCoalescedEvents ? e.getCoalescedEvents() : []; for (const ev of (L.length ? L : [e])) { const p = toWorld(ev), q = stroke[stroke.length - 1], d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d > 3) { stroke.push(p); strokeLen += d; } }
    return;
  }""")
# les runes dorées sont gratuites : on peut graver sans encre tant qu'il en reste une
rep("  if (on && s && s.ink < 1 && !s.heart.bare) { s.msg = 'Plus d’encre : ramasse des éclats.'; s.msgT = 1.6; return; }",
    "  if (on && s && s.ink < 1 && !s.heart.bare && !(s.dorees && (s.dorees.triangle || s.dorees.lune || s.dorees.etoile))) { s.msg = 'Plus d’encre : ramasse des éclats.'; s.msgT = 1.6; return; }")
