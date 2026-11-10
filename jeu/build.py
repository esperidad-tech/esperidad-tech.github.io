#!/usr/bin/env python3
"""Assemble Brumeval v2 en un seul fichier HTML : dist/index.html"""
import os, sys, datetime, json

ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ICI, 'src')
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, 'dist'))  # BRUMEVAL_DIST=/chemin : construit ailleurs (agents en parallèle)
CSS = ['base.css', 'mj-core.css', 'persos.css', 'carte.css', 'mj-pisteur-alchi.css', 'mj-observation.css', 'mj-melange.css', 'mj-bulles.css', 'mj-chaudron.css', 'mj-barde-sage.css', 'mj-sage-plans.css', 'mj-mots.css', 'mj-ragots.css', 'mj-depositions.css', 'mj-sage-codes.css', 'mj-regles.css', 'mj-cachette.css', 'mj-tir.css', 'revision.css', 'atelier.css', 'moteur.css', 'mission.css', 'tableau.css', 'liege.css', 'carnet.css', 'barde.css', 'illus-fin.css', 'livre.css', 'cabane.css', 'heros.css', 'tuto.css']
JS = ['sans-zoom.js', 'donnees.js', 'mj-temps.js', 'mj-core.js', 'persos.js', 'garderobe.js', 'carte.js', 'mj-pisteur-alchi.js', 'mj-observation.js', 'mj-melange.js', 'mj-bulles.js', 'mj-chaudron.js', 'mj-barde-sage.js', 'mj-sage-plans.js', 'mj-mots.js', 'ragots.js', 'mj-ragots.js', 'mj-depositions.js', 'mj-sage-codes.js', 'mj-regles.js', 'mj-cachette.js', 'mj-tir.js', 'revision.js', 'repliques.js', 'voix.js', 'atelier.js',
      'e1.js', 'e2.js', 'e3.js', 'codes-fixes.js', 'souterrains.js', 'moteur-base.js', 'moteur-ecrans.js', 'moteur-roles.js', 'moteur-actions.js', 'mission.js', 'tableau.js', 'liege.js', 'carnet.js', 'essais.js', 'labo.js', 'barde.js', 'livre.js', 'regles.js', 'illus-fin.js', 'carte-jeu.js', 'cabane.js', 'heros.js', 'tuto.js']

# BRUMEVAL_SANS="mj-bulles,mj-chaudron" : laisse de côté des fichiers encore en chantier
FIGE = set(x.strip() for x in os.environ.get('BRUMEVAL_FIGE', '').split(',') if x.strip())
SANS = set(x.strip() for x in os.environ.get('BRUMEVAL_SANS', '').split(',') if x.strip())

def lire(nom):
    if os.path.splitext(nom)[0] in SANS:
        print('  (en chantier, laissé de côté)', nom, file=sys.stderr)
        return ''
    p = os.path.join(SRC, nom)
    # BRUMEVAL_FIGE="mj-pisteur-alchi.js" : prend la dernière version publiée (../stable/) d'un fichier en cours de modification
    if nom in FIGE and os.path.exists(os.path.join(ICI, '..', 'stable', nom)):
        print('  (version figée)', nom, file=sys.stderr)
        p = os.path.join(ICI, '..', 'stable', nom)
    if not os.path.exists(p):
        print('  (absent)', nom, file=sys.stderr)
        return ''
    with open(p, encoding='utf-8') as f:
        return f.read()

# La pause des mini-jeux (Romain, 5 novembre, 11 h 21 ; mj-temps.js) : dans chaque fichier mj-*.js,
# setTimeout, setInterval, requestAnimationFrame, Date.now et performance.now sont ceux de window.MJT,
# qu'on peut figer. Les fichiers restent tels quels dans src/ ; l'enveloppe est mise ici, à l'assemblage.
ENVELOPPE = ('setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'Date', 'performance')
def lire_js(nom):
    t = lire(nom)
    if not t or not nom.startswith('mj-') or nom == 'mj-temps.js':
        return t
    return (';(function(' + ', '.join(ENVELOPPE) + '){\n' + t + '\n}).call(this, MJT.setTimeout, MJT.clearTimeout, MJT.setInterval, MJT.clearInterval, MJT.raf, MJT.caf, MJT.Date, MJT.performance);')

# Le labo d'analyses de l'Alchimiste (10 novembre) : une page à part, faite des morceaux de src/labo/ (les mêmes que la maquette).
# Le jeu la garde dans window.LABO_HTML et l'ouvre dans un cadre, par-dessus l'atelier (src/labo.js).
# dist/labo.html : la même page, toute seule (la maquette, pour l'essayer hors du jeu).
LABO = ['00-head.html', '10-base.js', '15-sons.js', '20-chat.js', '30-donnees.js', '40-dessins.js', '50-scene.js', '60-loupe.js', '70-micro.js', '80-test.js', '90-main.js', '99-foot.html']
def labo_html():
    d = os.path.join(SRC, 'labo')
    if not os.path.isdir(d):
        print('  (absent) src/labo', file=sys.stderr)
        return ''
    t = ''
    for n in LABO:
        with open(os.path.join(d, n), encoding='utf-8') as f:
            t += f.read()
    return t

def main():
    os.makedirs(DIST, exist_ok=True)
    css = '\n'.join(lire(n) for n in CSS)
    js = '\n'.join('/* ===== ' + n + ' ===== */\n' + lire_js(n) for n in JS)
    labo = labo_html()
    if labo:
        js = '/* ===== le labo d\'analyses (src/labo/) ===== */\nwindow.LABO_HTML = ' + json.dumps(labo, ensure_ascii=False) + ';\n' + js
        with open(os.path.join(DIST, 'labo.html'), 'w', encoding='utf-8') as f:
            f.write(labo)
    js = js.replace('</script', '<\\/script')
    date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#1c2447">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Brumeval">
<meta name="description" content="Les Enquêteurs de Brumeval : un jeu d'enquête coopératif à quatre écrans.">
<title>Les Enquêteurs de Brumeval</title>
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Caveat:wght@500;700&family=Macondo&display=swap">
<style>
{css}
</style>
</head>
<body>
<div class="b-ciel" aria-hidden="true"></div>
<div class="b-brume" aria-hidden="true"></div>
<div id="app"></div>
<div id="voile" hidden></div>
<div id="mj-plein" hidden></div>
<div id="mj-parking" aria-hidden="true"></div>
<div id="transition" aria-hidden="true"></div>
<button id="stop-voix" type="button" hidden>⏹ Stop</button>
<div id="toast" role="status" aria-live="polite"></div>
<!-- Brumeval v2 · version de test du {date} -->
<script>window.BRUMEVAL_VERSION = '{date}';</script>
<script>
{js}
</script>
</body>
</html>
'''
    corps = html.split('<body>', 1)[1].rsplit('</body>', 1)[0]
    style = html.split('<style>', 1)[1].split('</style>', 1)[0]
    artefact = ('<title>Les Enquêteurs de Brumeval</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Caveat:wght@500;700&family=Macondo&display=swap">\n'
      '<style>' + style + '</style>\n' + corps)
    with open(os.path.join(DIST, 'brumeval-test.html'), 'w', encoding='utf-8') as f:
        f.write(artefact)
    out = os.path.join(DIST, 'index.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print(out, round(len(html.encode('utf-8')) / 1024), 'Ko')

def salle():
    pa = '--sans-pa' not in sys.argv
    css = '\n'.join(lire(n) for n in ['base.css', 'mj-core.css', 'persos.css'] + (['mj-pisteur-alchi.css'] if pa else []) + ['mj-observation.css', 'mj-melange.css', 'mj-bulles.css', 'mj-chaudron.css', 'mj-barde-sage.css', 'mj-sage-plans.css', 'mj-mots.css', 'mj-ragots.css', 'mj-depositions.css', 'mj-sage-codes.css', 'mj-regles.css'] + (['mj-cachette.css', 'mj-tir.css'] if pa else []) + ['revision.css', 'salle.css'])
    js = '\n'.join('/* ===== ' + n + ' ===== */\n' + lire_js(n) for n in ['donnees.js', 'mj-temps.js', 'mj-core.js', 'persos.js'] + (['mj-pisteur-alchi.js'] if pa else []) + ['mj-observation.js', 'mj-melange.js', 'mj-bulles.js', 'mj-chaudron.js', 'mj-barde-sage.js', 'mj-sage-plans.js', 'mj-mots.js', 'ragots.js', 'mj-ragots.js', 'mj-depositions.js', 'mj-sage-codes.js', 'mj-regles.js'] + (['mj-cachette.js', 'mj-tir.js'] if pa else []) + ['revision.js', 'moteur-base.js', 'salle.js']).replace('</script', '<\\/script')
    page = ('<title>Salle des mini-jeux</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Caveat:wght@500;700&family=Macondo&display=swap">\n'
      '<style>' + css + '</style>\n<main id="salle"></main>\n<div id="sl-plein" hidden></div>\n<script>\n' + js + '\n</script>\n')
    with open(os.path.join(DIST, 'salle-mini-jeux.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    print('salle', round(len(page.encode('utf-8')) / 1024), 'Ko')

if __name__ == '__main__':
    main()
    salle()
