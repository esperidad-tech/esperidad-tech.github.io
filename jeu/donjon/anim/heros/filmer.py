"""Filme toutes les animations des héros (demo.html?film) et en fait un mp4.

    python3 filmer.py            -> heros-anime.mp4 + captures/NN-nom.png (au milieu de chaque animation)
    python3 filmer.py 'dague|louche' -> seulement les étapes dont le nom contient « dague » ou « louche »

Playwright (Python) doit être installé ; ffmpeg aussi.

L'enregistrement vidéo de Chromium sans écran ne suit pas le rythme quand la page est chargée
(il ne garde que 6 à 10 images par seconde). On filme donc la page au ralenti (temps ralenti x RALENTI :
animations CSS et Web Animations par le protocole DevTools, minuteurs et horloges par un petit script),
puis ffmpeg remet la vidéo à la bonne vitesse : elle est fluide et fidèle au vrai rythme.
"""
import os, sys, glob, shutil, subprocess, time
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
VID = os.path.join(ICI, 'video')
CAP = os.path.join(ICI, 'captures')
SORTIE = os.path.join(ICI, 'heros-anime.mp4')
FILTRE = sys.argv[1].lower() if len(sys.argv) > 1 else ''
RALENTI = float(os.environ.get('RALENTI', '0.3333'))
HORLOGE = """(() => { const K = %s; const pn = performance.now.bind(performance), t0 = pn();
  performance.now = () => t0 + (pn() - t0) * K;
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window), raf = window.requestAnimationFrame.bind(window);
  window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / K, ...a);
  window.setInterval = (f, ms, ...a) => si(f, (ms || 0) / K, ...a);
  window.requestAnimationFrame = f => raf(t => f(t0 + (t - t0) * K));
})();""" % RALENTI

T = "['sage','alchimiste','pisteur']"
# (nom affiché, code JS qui renvoie une promesse, moment de la capture en ms, pause après en ms)
ETAPES = [
    ('Tous : ils arrivent en courant', "Promise.all(['pisteur','alchimiste','sage'].map((r, i) => { DEMO.h[r].boite.style.transform = 'translateX(-600px)'; return new Promise(s => setTimeout(s, i * 280)).then(() => DEMO.h[r].entrer(460 - i * 30)); }))", 700, 300),
    ('Tous : l\'attente (respiration, clignements, petits gestes)', "(Object.values(DEMO.h).forEach(x => x._gestesVite = true), new Promise(s => setTimeout(s, 6500)))", 3000, 0),
    ('Pisteur : choisi', "(DEMO.choix('pisteur'), new Promise(s => setTimeout(s, 900)))", 500, 0),
    ('Pisteur : flèche', "DEMO.go('pisteur', 'tirer', 'normale')", 1000, 700),
    ('Pisteur : flèche de feu', "DEMO.go('pisteur', 'tirer', 'feu')", 1250, 700),
    ('Pisteur : flèche d\'huile', "DEMO.go('pisteur', 'tirer', 'huile')", 1250, 700),
    ('Pisteur : flèche de colle', "DEMO.go('pisteur', 'tirer', 'colle')", 1250, 700),
    ('Pisteur : coup de dague', "DEMO.go('pisteur', 'dague')", 650, 800),
    ('Alchimiste : choisi', "(DEMO.choix('alchimiste'), new Promise(s => setTimeout(s, 900)))", 500, 0),
    ('Alchimiste : préparer une potion verte', "DEMO.go('alchimiste', 'preparer', '#5fd08a')", 450, 500),
    ('Alchimiste : lancer la fiole', "DEMO.go('alchimiste', 'lancer')", 650, 900),
    ('Alchimiste : préparer une potion violette', "DEMO.go('alchimiste', 'preparer', '#c07aff')", 700, 400),
    ('Alchimiste : lancer la fiole', "DEMO.go('alchimiste', 'lancer')", 900, 900),
    ('Alchimiste : coup de louche, BONG !', "DEMO.go('alchimiste', 'louche')", 650, 700),
    ('Alchimiste : des herbes pour le Sage', "DEMO.go('alchimiste', 'herbes')", 750, 900),
    ('Sage : choisi', "(DEMO.choix('sage'), new Promise(s => setTimeout(s, 900)))", 500, 0),
    ('Sage : sort de lumière', "DEMO.go('sage', 'sort')", 640, 800),
    ('Sage : bouclier de runes sur le Pisteur', "DEMO.go('sage', 'bouclier')", 900, 1200),
    ('Sage : le bouclier absorbe 2', "DEMO.absorber()", 300, 600),
    ('Sage : le bouclier disparaît', "DEMO.retirer()", 150, 700),
    ('Sage : étudier le livre', "DEMO.go('sage', 'etudier')", 1300, 600),
    ('Pisteur : touché', "(DEMO.choix('sage'), DEMO.go('pisteur', 'touche'))", 150, 400),
    ('Alchimiste : touché', "DEMO.go('alchimiste', 'touche')", 150, 400),
    ('Sage : touché', "DEMO.go('sage', 'touche')", 150, 400),
    ('Alchimiste : tombe, sonné', "DEMO.go('alchimiste', 'tomber').then(() => new Promise(s => setTimeout(s, 1600)))", 1500, 0),
    ('Alchimiste : se relève', "DEMO.go('alchimiste', 'relever')", 700, 600),
    ('Pisteur : tombe, sonné', "DEMO.go('pisteur', 'tomber').then(() => new Promise(s => setTimeout(s, 1400)))", 1600, 0),
    ('Pisteur : se relève', "DEMO.go('pisteur', 'relever')", 700, 600),
    ('Sage : tombe, sonné', "DEMO.go('sage', 'tomber').then(() => new Promise(s => setTimeout(s, 1400)))", 1600, 0),
    ('Sage : se relève', "DEMO.go('sage', 'relever')", 700, 600),
    ('Tous : victoire !', "Promise.all(" + T + ".map(r => DEMO.h[r].joie()))", 450, 800),
    ('Autres apparences : ils arrivent', "(DEMO.apparence(true), Promise.all(['pisteur','alchimiste','sage'].map((r, i) => { DEMO.h[r].boite.style.transform = 'translateX(-600px)'; return new Promise(s => setTimeout(s, i * 280)).then(() => DEMO.h[r].entrer(460 - i * 30)); })))", 800, 400),
    ('Autres apparences : flèche, fiole, sort', "DEMO.go('pisteur', 'tirer', 'feu').then(() => DEMO.go('alchimiste', 'lancer')).then(() => DEMO.go('sage', 'sort'))", 1100, 800),
    ('Autres apparences : victoire !', "Promise.all(" + T + ".map(r => DEMO.h[r].joie()))", 450, 1200),
]


def nom_fichier(i, nom):
    s = ''.join(c if c.isalnum() else '-' for c in nom.lower())
    while '--' in s:
        s = s.replace('--', '-')
    return '%02d-%s.png' % (i, s.strip('-')[:48])


def jouer(p, etapes, filmer):
    """Une passe : filmer=True enregistre la vidéo (sans captures, pour ne pas gêner le rythme) ;
    filmer=False rejoue les mêmes étapes et prend une capture au milieu de chacune."""
    nav = p.chromium.launch()
    opts = {'viewport': {'width': 960, 'height': 540}}
    if filmer:
        opts.update(record_video_dir=VID, record_video_size={'width': 960, 'height': 540})
    ctx = nav.new_context(**opts)
    k = RALENTI if filmer else 1
    if filmer:
        ctx.add_init_script(HORLOGE)
    page = ctx.new_page()
    erreurs = []
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    page.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
    page.goto('file://' + os.path.join(ICI, 'demo.html') + '?film')
    if filmer:
        cdp = ctx.new_cdp_session(page)
        cdp.send('Animation.enable')
        cdp.send('Animation.setPlaybackRate', {'playbackRate': k})
    page.wait_for_timeout(800 / k)
    for i, (nom, js, capt, pause) in enumerate(etapes):
        page.evaluate('t => DEMO.dire(t)', nom)
        page.wait_for_timeout(350 / k)
        t0 = time.time()
        page.evaluate('() => { window.__p = Promise.resolve(' + js + ').catch(e => console.error(e)); }')
        if not filmer:
            page.wait_for_timeout(capt)
            page.screenshot(path=os.path.join(CAP, nom_fichier(i, nom)))
        page.evaluate('() => window.__p')
        page.wait_for_timeout(pause / k)
        if filmer:
            print('%-58s %.1f s' % (nom, (time.time() - t0) * k))
    page.evaluate('() => DEMO.dire("")')
    page.wait_for_timeout(500 / k)
    video = page.video.path() if filmer else None
    ctx.close()
    nav.close()
    return video, erreurs


def main():
    shutil.rmtree(VID, ignore_errors=True)
    os.makedirs(VID)
    os.makedirs(CAP, exist_ok=True)
    for f in glob.glob(os.path.join(CAP, '*.png')):
        os.remove(f)
    etapes = [e for e in ETAPES if any(f in e[0].lower() for f in FILTRE.split('|'))] if FILTRE else ETAPES
    with sync_playwright() as p:
        video, erreurs = jouer(p, etapes, True)
        if not os.environ.get('SANS_CAPTURES'):
            erreurs += jouer(p, etapes, False)[1]
    if erreurs:
        print('ERREURS DANS LA PAGE :')
        for e in erreurs[:20]:
            print('  ', e)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', video, '-vf', 'setpts=PTS*%s' % RALENTI, '-r', '30',
                    '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', SORTIE], check=True)
    print('vidéo :', SORTIE)
    print('captures :', CAP)


if __name__ == '__main__':
    main()
