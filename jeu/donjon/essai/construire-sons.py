#!/usr/bin/env python3
"""Assemble la page d'écoute autonome essai/sons-essai.html (l'Atelier des sons) à partir de essai/sons/.
- Les niveaux de chaque son (pour que tout sonne aussi fort) viennent de sons/niveaux.json (sons/niveaux.py).
- Les choix déjà faits par Romain viennent de la table CHOIX de essai/src/son.js (précochés dans la page).
- Les sons DÉJÀ dans le jeu (« Le jeu », « Mini-jeux », les petits bruits de la salle des rats) sont copiés
  tels quels depuis le code du jeu (jeu/src/*.js, essai/src/son.js) : on n'y change que la sortie (a.destination
  devient la sortie de l'atelier). Chaque morceau est repéré par ses bornes ; si une borne manque, on s'arrête net.
  Le jeu lui-même n'est jamais modifié."""
import os, re, json
ICI = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(ICI, 'sons')
JEU = os.path.join(ICI, '..', '..', 'src')
lire = lambda f: open(f, encoding='utf-8').read()

def entre(texte, debut, fin, garder_fin=False):
    a = texte.index(debut)                       # ValueError si la borne n'existe plus : on le saura
    b = texte.index(fin, a + len(debut))
    return texte[a:b + (len(fin) if garder_fin else 0)]

def remplace(bloc, a, b, n):
    assert bloc.count(a) == n, (a, bloc.count(a), n)
    return bloc.replace(a, b)

def extraits():
    morceaux = []
    # 1) le jeu principal (moteur-base.js) : note, bruit, tendre, feuille, fumee et la table SONS
    mb = lire(os.path.join(JEU, 'moteur-base.js'))
    b = entre(mb, 'function note(f, t0, duree, type, vol, glisse){', 'M.son = function(type, x){')
    b = remplace(b, 'a.destination', 'SORTIE', 7)
    morceaux.append('jeu:function(audio, SORTIE){\n' + b + '\nreturn SONS;\n}')
    # 2) le chaudron (mj-chaudron.js) : la fabrique de sons Sons()
    mc = lire(os.path.join(JEU, 'mj-chaudron.js'))
    b = entre(mc, 'function bruitBlanc(a){', "/* ==========================================================\n   Construction de l'écran")
    b = remplace(b, 'maitre.connect(a.destination)', 'maitre.connect(SORTIE)', 1)
    morceaux.append('chaudron:function(contexte, ctxA, SORTIE){\nvar bruitBuf = null;\n' + b + '\nreturn Sons();\n}')
    # 3) l'observation (mj-observation.js) : Sons(P)
    mo = lire(os.path.join(JEU, 'mj-observation.js'))
    b = entre(mo, 'function Sons(P){', '/* ---------- Bandeau')
    b = remplace(b, 'maitre.connect(a.destination)', 'maitre.connect(SORTIE)', 1)
    morceaux.append('observation:function(audio, ctxA, SORTIE, U, sonActif){\n' + b + '\nreturn Sons;\n}')
    # 4) les mini-jeux du Pisteur et de l'Alchimiste (mj-pisteur-alchi.js) : les petites notes, la gamme, les notes des bulles
    mp = lire(os.path.join(JEU, 'mj-pisteur-alchi.js'))
    b = entre(mp, 'function note(freq, duree){', '\n}', garder_fin=True)
    b = remplace(b, 'g.connect(audioCtx.destination)', 'g.connect(SORTIE)', 1)
    morceaux.append('pisteurNote:function(audioCtx, MJ, SORTIE){\n' + b + '\nreturn note;\n}')
    gamme = re.search(r'var GAMME = (\[[^\]]*\]);', mp).group(1)
    bulles = [int(x) for x in re.findall(r"\{c:'[^']*', f:(\d+),", entre(mp, 'var BULLES_DEF = [', '];'))]
    assert len(bulles) == 8, bulles
    transperce = re.search(r"\[([0-9, ]+)\]\.slice\(0, vol\.nb \+ 1\)", mp).group(1)
    morceaux.append('GAMME:' + gamme)
    morceaux.append('BULLES:' + json.dumps(bulles))
    morceaux.append('TRANSPERCE:[' + transperce + ']')
    # 5) les runes du Sage (mj-sage-codes.js) : le « clac » de pierre
    ms = lire(os.path.join(JEU, 'mj-sage-codes.js'))
    b = entre(ms, 'function clac(fort){', '/* Démo commune')
    b = remplace(b, 'audio.destination', 'SORTIE', 2)
    morceaux.append('sageClac:function(audio, sonActif, SORTIE){\n' + b + '\nreturn clac;\n}')
    # 6) les petits bruits de la salle des rats (essai/src/son.js) : leur petit moteur et la table B
    ss = lire(os.path.join(ICI, 'src', 'son.js'))
    b = entre(ss, 'function t0(dt){', 'S.Son = {')
    aides = '\n'.join(re.search(p, ss).group(0) for p in [r'function hasard\(a, b\)\{[^\n]*\}', r'function tire\(l\)\{[^\n]*\}', r'var VOIX_ENRAGE = \{[^\n]*\};'])
    morceaux.append('salle:function(ctx, A, bruits, revIn, blanc, brun){\nfunction pret(){ return true; }\n' + aides + '\n' + b + '\nreturn B;\n}')
    tb = entre(ss, 'var n = ctx.sampleRate * 2;', '\n    setInterval(programme')
    morceaux.append('bruitsSalle:function(ctx, A){\nvar blanc, brun;\n' + tb + '\nreturn {blanc:blanc, brun:brun};\n}')
    # 7) le labo d'analyses de l'Alchimiste (le labo du jeu : jeu/src/labo/15-sons.js) : ses briques et sa table SONS
    ml = lire(os.path.join(ICI, '..', '..', 'src', 'labo', '15-sons.js'))
    b = entre(ml, 'function note(f, t0, duree, type, vol, glisse){', 'function son(nom, x){')
    b = remplace(b, 'a.destination', 'SORTIE', 4)
    morceaux.append('labo:function(audio, SORTIE){\n' + b + '\nreturn SONS;\n}')
    # 8) le gâteau de la fête (mj-gateau.js) : sa fabrique de sons, entre ses deux bornes (elle reçoit sa sortie : rien à y changer)
    mg = lire(os.path.join(JEU, 'mj-gateau.js'))
    b = entre(mg, 'function sonsGateau(audio, sortie){', '/* <<< LES SONS DU GÂTEAU */')
    morceaux.append('gateau:function(audio, SORTIE){\n' + b + '\nreturn sonsGateau(audio, function(){ return SORTIE; });\n}')
    # 9) l'établi des plantes (jeu/src/etabli/15-sons.js) : sa fabrique de sons, entre ses deux bornes (elle reçoit sa sortie)
    me = lire(os.path.join(JEU, 'etabli', '15-sons.js'))
    b = entre(me, 'function sonsEtabli(audio, sortie){', "/* <<< LES SONS DE L'ÉTABLI */")
    morceaux.append('etabli:function(audio, SORTIE){\n' + b + '\nreturn sonsEtabli(audio, function(){ return SORTIE; });\n}')
    # 10) les banderoles de la fête, le tir à l'arc vu de face (mj-visee.js) : sa fabrique de sons, entre ses deux bornes
    mv = lire(os.path.join(JEU, 'mj-visee.js'))
    b = entre(mv, 'function sonsVisee(audio, sortie){', '/* <<< LES SONS DE LA VISÉE */')
    morceaux.append('visee:function(audio, SORTIE){\n' + b + '\nreturn sonsVisee(audio, function(){ return SORTIE; });\n}')
    choix =entre(ss, 'var CHOIX = S.CHOIX_SONS = {', '};', garder_fin=True)
    table = {k: re.findall(r"'([A-C])'", v) for k, v in re.findall(r'(\w+):\[([^\]]*)\]', choix)}
    return '/* ===== les sons déjà dans le jeu, copiés tels quels (construire-sons.py) ===== */\nwindow.EXTRAITS = {\n' + ',\n'.join(morceaux) + '\n};\n', table

html = lire(os.path.join(S, 'page.html'))
niveaux = {}
p = os.path.join(S, 'niveaux.json')
if os.path.exists(p):
    niveaux = json.load(open(p))
ext, choix = extraits()
js = 'window.NIVEAUX = ' + json.dumps({k: round(v, 3) for k, v in sorted(niveaux.items())}, separators=(',', ':')) + ';\n'
js += '/* les choix de Romain, d\'après la table CHOIX de essai/src/son.js */\nwindow.CHOIX_ROMAIN = ' + json.dumps(choix, separators=(',', ':')) + ';\n'
js += ext
js += '\n'.join(lire(os.path.join(S, f)) for f in ['moteur.js', 'bruitages.js', 'musiques.js', 'bestiaire.js', 'donjon.js', 'leo.js', 'musiques-donjon.js', 'existants.js', 'banc.js', 'catalogue.js', 'labo.js', 'gateau.js', 'etabli.js', 'visee.js', 'page.js'])
assert '</script' not in js.lower()
html = html.replace('/*CSS*/', lire(os.path.join(S, 'page.css'))).replace('/*JS*/', js)
sortie = os.path.join(ICI, 'sons-essai.html')
open(sortie, 'w', encoding='utf-8').write(html)
print(sortie, os.path.getsize(sortie), 'octets', len(niveaux), 'niveaux', len(choix), 'choix de Romain')
