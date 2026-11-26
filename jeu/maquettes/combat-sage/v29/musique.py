# Version 29 [Romain, 27 nov., 0 h 29 : « la mélodie aiguë […] à force, ça peut être un peu relou parce qu'elle est sans discontinu, elle s'arrête jamais.
#  Du coup, je pense qu'il peut y avoir un refrain avec cette mélodie, mais tout le reste, il faut que ça soit […] un peu moins saoulant, […] un peu plus discret,
#  on met juste les basses avec des sons un peu moins stressants »]
# Retouche la musique de sound14.js (dans construire.py : SON19 = musique29(SON19)) :
#  - LE REFRAIN = le thème du combat (la partie A), avec sa mélodie aiguë, comme avant ;
#  - LES COUPLETS (tout le reste) : plus de mélodie aiguë ; seulement la basse, une batterie douce (à demi-temps, sans charleston serré) et une nappe d'accords
#    tenus, grave et douce ; pas d'arpèges aigus, pas de cymbale, pas de « piou » ; le roulement de toms seulement juste avant le refrain ;
#  - l'ordre : l'intro, le refrain, trois couplets, le refrain fort, deux couplets, puis on reprend au refrain (≈ 1 min 30 le tour ; le refrain ≈ 13 s, deux fois par tour).
def musique29(src):
    def rep(a, b):
        nonlocal src
        assert src.count(a) == 1, (a[:80], src.count(a)); src = src.replace(a, b)
    rep("// des bruitages doux, et une musique de combat 8 bits (11 parties ≈ 2 min 30, puis elle change de tonalité à chaque tour)",
        "// des bruitages doux, et une musique de combat 8 bits : un refrain avec la mélodie, des couplets discrets (la basse, une batterie douce, une nappe) ;\n// un tour ≈ 1 min 30, puis elle change de tonalité")
    a = src[src.index("  const SEQ = ["):src.index("  const LOOP = 1,")]
    rep(a, """  const SEQ = [
    { s: 'I', bass: 'drive', dr: 'intro' },
    { s: 'A', bass: 'drive', dr: 'rock', refrain: true },
    { s: 'A2', bass: 'drive', dr: 'doux', calme: true }, { s: 'C', bass: 'half', dr: 'doux', calme: true }, { s: 'G', bass: 'drive', dr: 'doux', calme: true },
    { s: 'A', bass: 'gallop', dr: 'blast', refrain: true, harm: true, pew: true },
    { s: 'B', bass: 'drive', dr: 'doux', calme: true }, { s: 'D', bass: 'half', dr: 'doux', calme: true }
  ];
""")
    rep("const BASSP = { drive: 'R.O.R.O.R.O.R.O.',", "const BASSP = { calme: 'R...O...R...O...', drive: 'R.O.R.O.R.O.R.O.',")
    rep("    intro: { k: 'x.......x.......', s: '', h: '' }", "    intro: { k: 'x.......x.......', s: '', h: '' },\n    doux: { k: 'x.......x.......', s: '........x.......', h: '..x...x...x...x.' }")
    # une nappe : un accord tenu, qui monte et descend doucement
    rep("  function hit(kind, t, k = 1) {", """  function nappe(f, dur, t, g) {
    const os = ac.createOscillator(), e = ac.createGain(); os.type = 'sine'; os.frequency.setValueAtTime(f, t);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + Math.min(0.35, dur * 0.3)); e.gain.setValueAtTime(g, t + dur * 0.7); e.gain.linearRampToValueAtTime(0.0001, t + dur);
    os.connect(e); e.connect(mus); os.start(t); os.stop(t + dur + 0.02);
  }
  function hit(kind, t, k = 1) {""")
    # la mélodie : seulement au refrain (et dans l'intro)
    rep("    if (n) { lead(n, t, tr, st, duty, 0.2);", "    if (n && !E.calme) { lead(n, t, tr, st, duty, 0.2);")
    # la basse : dans les couplets, plus calme tant que la salle n'a pas 3 côtés
    rep("    const bp = BASSP[E.bass][stepI];", "    const BN = E.calme && level < 3 ? 'calme' : E.bass, bp = BASSP[BN][stepI];")
    rep("    if (bp !== '.') { let len = 1; while (stepI + len < 16 && BASSP[E.bass][stepI + len] === '.') len++; simple(hz(C.b + tr + (bp === 'O' ? 12 : bp === '5' ? 7 : 0)), st * len * 0.85, t, 'triangle', 0.3); }",
        "    if (bp !== '.') { let len = 1; while (stepI + len < 16 && BASSP[BN][stepI + len] === '.') len++; simple(hz(C.b + tr + (bp === 'O' ? 12 : bp === '5' ? 7 : 0)), st * len * 0.85, t, 'triangle', E.calme ? 0.27 : 0.3); }\n    // la nappe des couplets : l'accord tenu toute la mesure, grave et doux\n    if (E.calme && stepI === 0) for (const i of C.iv.slice(0, 3)) nappe(hz(C.r - 12 + tr + i + (i < 5 ? 12 : 0)), st * 16, t, 0.05);")
    # la batterie : le roulement de toms seulement juste avant le refrain ; douce dans les couplets
    rep("    const D = DRUM[E.dr], fill = last && E.s !== 'I' && stepI >= 8;", "    const nx = SEQ[secI + 1 < SEQ.length ? secI + 1 : LOOP], D = DRUM[E.dr], fill = last && E.s !== 'I' && stepI >= 8 && nx.refrain, dk = E.calme ? 0.55 : 1;")
    rep("""      if (D.k[stepI] === 'x') hit('kick', t);
      if (D.s[stepI] === 'x') hit('snare', t);
      if (D.h[stepI] === 'x' || (level >= 4 && E.dr !== 'half')) hit('hat', t, stepI % 4 === 2 ? 1 : 0.7);""", """      if (D.k[stepI] === 'x') hit('kick', t, dk);
      if (D.s[stepI] === 'x') hit('snare', t, dk * 0.8);
      if (D.h[stepI] === 'x' || (level >= 4 && !E.calme && E.dr !== 'half')) hit('hat', t, (stepI % 4 === 2 ? 1 : 0.7) * dk * 0.7);""")
    # la cymbale et le « piou » : seulement au refrain ; les arpèges aigus : seulement au refrain
    rep("    if (barI === 0 && stepI === 0 && E.s !== 'I' && level >= 3) hit('crash', t);", "    if (barI === 0 && stepI === 0 && E.refrain && level >= 3) hit('crash', t);")
    rep("    if (level >= 2 || E.s === 'C') { const iv = C.iv,", "    if (!E.calme && level >= 2) { const iv = C.iv,")
    rep("simple(hz(C.r + 12 + tr + tones[stepI % 8]), st * 0.7, t, 'p12', E.s === 'C' ? 0.07 : 0.045, musLP); }", "simple(hz(C.r + 12 + tr + tones[stepI % 8]), st * 0.7, t, 'p12', 0.045, musLP); }")
    return src
