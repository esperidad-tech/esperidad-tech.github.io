"""Filme les animations des héros (demo.html?film : héros « cuits » comme dans le jeu) et en fait un mp4.

    flock /tmp/brumeval-pw.lock python3 filmer.py           -> heros-anime.mp4 + captures/NN-nom.png (toutes les étapes)
    flock /tmp/brumeval-pw.lock python3 filmer.py nouveau   -> les NOUVELLES armes et réactions seulement :
                                                               heros-armes.mp4 + heros-armes-planche.png (poses clés légendées)
    flock /tmp/brumeval-pw.lock python3 filmer.py 'dague|louche' -> seulement les étapes dont le nom contient « dague » ou « louche »

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
# les nouvelles armes et réactions (CONCEPTION-DONJON.md §6 et §10) : (nom, code, [moments des captures en ms], pause, cadre de la planche)
H_ = (20, 70, 560, 300)        # les trois héros
P_ = (330, 80, 600, 300)       # le Pisteur et la cible
A_ = (170, 80, 680, 300)       # l'Alchimiste et la cible
NOUVEAU = [
    ('Équipement : carquois d\'argent, sacoche, cristal de lune, amulettes', "(DEMO.apparence(false).then(() => { DEMO.equipe('pisteur','carquois-argent'); DEMO.equipe('alchimiste','sacoche'); DEMO.equipe('sage','cristal-lune'); ['pisteur','alchimiste','sage'].forEach(r => DEMO.h[r].equiper('amulette')); return new Promise(s => setTimeout(s, 1400)); }))", [1300], 300, H_),
    ('Pisteur : flèche d\'argent', "DEMO.go('pisteur', 'tirer', 'argent')", [1440, 1620], 700, P_),
    ('Pisteur : carquois lourd, flèche lourde sur du métal', "(DEMO.equipe('pisteur','carquois-lourd'), DEMO.go('pisteur', 'tirer', 'lourde', {metal:true}))", [1500, 1700, 1960], 800, P_),
    ('Pisteur : flèche lourde sur du bois (impact sourd)', "DEMO.go('pisteur', 'tirer', 'lourde')", [1990], 800, P_),
    ('Pisteur : flèche de givre', "DEMO.go('pisteur', 'tirer', 'givre')", [1450, 1640], 700, P_),
    ('Pisteur : flèche d\'acide', "DEMO.go('pisteur', 'tirer', 'acide')", [1450, 1700], 700, P_),
    ('Pisteur : ennemi immunisé, la flèche rebondit', "DEMO.go('pisteur', 'tirer', 'normale', {rebond:true, metal:true})", [1600, 1800, 2150], 900, P_),
    ('Alchimiste : potion de givre', "DEMO.potion('givre')", [2350, 2800], 700, A_),
    ('Alchimiste : potion d\'acide', "DEMO.potion('acide')", [2350, 2850], 700, A_),
    ('Alchimiste : potion d\'huile', "DEMO.potion('huile')", [2800], 700, A_),
    ('Alchimiste : potion de colle', "DEMO.potion('colle')", [2850], 700, A_),
    ('Sage : cristal de lune, l\'éclair illumine toute la salle', "DEMO.go('sage', 'eclair')", [620, 880, 1350], 700, (0, 0, 960, 540)),
    ('Sage : bâton de chêne, double bouclier', "(DEMO.equipe('sage','baton-chene'), DEMO.go('sage', 'double'))", [460, 1000, 1700], 1200, H_),
    ('Sage : les deux dômes disparaissent', "DEMO.retirer()", [], 700, H_),
    ('Alchimiste : brûlure froide (feu follet)', "DEMO.go('alchimiste', 'touche', 'froid')", [130, 650, 1300], 400, H_),
    ('Pisteur : grouillement (Roi des rats)', "DEMO.go('pisteur', 'touche', 'grouillement')", [420, 760, 1050], 400, H_),
    ('Sage : poing du Gardien', "DEMO.go('sage', 'touche', 'poing')", [100, 520, 1100], 400, H_),
    ('Alchimiste : pris dans la toile', "DEMO.go('alchimiste', 'entoile', true).then(() => new Promise(s => setTimeout(s, 1800)))", [420, 1900], 0, H_),
    ('Alchimiste : il déchire la toile', "DEMO.go('alchimiste', 'entoile', false)", [400, 540], 500, H_),
    ('Pisteur : avalé par la langue de Bourbe', "DEMO.go('pisteur', 'avale').then(() => new Promise(s => setTimeout(s, 700)))", [120, 330], 0, P_),
    ('Pisteur : recraché, couvert de bave, il se secoue', "DEMO.go('pisteur', 'recrache')", [360, 900, 1500, 2050], 600, P_),
    ('Sage : l\'amulette de vie le relève (relève dorée)', "DEMO.relevAmulette('sage')", [1700, 2300, 2650, 3350], 800, H_),
]
NOUVEAU_NOMS = set(e[0] for e in NOUVEAU)


def nom_fichier(i, nom):
    s = ''.join(c if c.isalnum() else '-' for c in nom.lower())
    while '--' in s:
        s = s.replace('--', '-')
    return '%02d-%s.png' % (i, s.strip('-')[:48])


def jouer(p, etapes, filmer, planche=None):
    """Une passe : filmer=True enregistre la vidéo (sans captures, pour ne pas gêner le rythme) ;
    filmer=False rejoue les mêmes étapes et prend une capture au milieu de chacune."""
    nav = p.chromium.launch()
    opts = {'viewport': {'width': 960, 'height': 540}}
    if planche is not None and not filmer:
        opts['device_scale_factor'] = 2
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
    page.wait_for_function('window.PRET', timeout=60000)
    if filmer:
        cdp = ctx.new_cdp_session(page)
        cdp.send('Animation.enable')
        cdp.send('Animation.setPlaybackRate', {'playbackRate': k})
    page.wait_for_timeout(800 / k)
    for i, e in enumerate(etapes):
        nom, js, capt, pause = e[:4]
        page.evaluate('t => DEMO.dire(t)', '' if planche is not None and not filmer else nom)
        page.wait_for_timeout(350 / k)
        t0 = time.time()
        page.evaluate('() => { window.__p = Promise.resolve(' + js + ').catch(e => console.error(e)); }')
        if not filmer:
            moments = capt if isinstance(capt, list) else [capt]
            deja = 0
            for j, m in enumerate(moments):
                reste = m - (time.time() - t0) * 1000
                if reste > 0:
                    page.wait_for_timeout(reste)
                f = os.path.join(CAP, nom_fichier(i, nom)) if len(moments) == 1 else os.path.join(CAP, nom_fichier(i, nom).replace('.png', '-%d.png' % (j + 1)))
                page.screenshot(path=f)
                if planche is not None:
                    planche.append((nom, j + 1, len(moments), int(m), f, e[4] if len(e) > 4 else (0, 0, 960, 540)))
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


def faire_planche(cases, sortie):
    """une planche légendée : chaque capture recadrée sur l'action (captures prises en échelle 2), 3 par ligne"""
    from PIL import Image, ImageDraw, ImageFont
    W, Hc, BAR, COL = 600, 340, 30, 3
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    except Exception:
        font = ImageFont.load_default()
    lignes = (len(cases) + COL - 1) // COL
    pl = Image.new('RGB', (W * COL, (Hc + BAR) * lignes), '#0b0810')
    d = ImageDraw.Draw(pl)
    for i, (nom, j, n, ms, f, c) in enumerate(cases):
        im = Image.open(f).convert('RGB')
        x, y, w, h = [v * 2 for v in c]
        im = im.crop((x, y, x + w, y + h))
        k = min(W / im.width, Hc / im.height)
        im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
        X, Y = (i % COL) * W, (i // COL) * (Hc + BAR)
        pl.paste(im, (X + (W - im.width) // 2, Y + BAR + (Hc - im.height) // 2))
        d.rectangle([X, Y, X + W - 1, Y + BAR - 1], fill='#1d1526')
        d.text((X + 8, Y + 6), (nom if len(nom) < 52 else nom[:50] + '…') + ('  (%d/%d, %d ms)' % (j, n, ms) if n > 1 else '  (%d ms)' % ms), fill='#ffe3a3', font=font)
    pl.save(sortie, optimize=True)
    print('planche :', sortie, pl.size)


def main():
    shutil.rmtree(VID, ignore_errors=True)
    os.makedirs(VID)
    os.makedirs(CAP, exist_ok=True)
    for f in glob.glob(os.path.join(CAP, '*.png')):
        os.remove(f)
    global SORTIE
    planche = None
    if FILTRE == 'nouveau':
        etapes, planche, SORTIE = NOUVEAU, [], os.path.join(ICI, 'heros-armes.mp4')
    else:
        tout = ETAPES + NOUVEAU
        etapes = [e for e in tout if any(f in e[0].lower() for f in FILTRE.split('|'))] if FILTRE else tout
    with sync_playwright() as p:
        video, erreurs = jouer(p, etapes, True)
        if not os.environ.get('SANS_CAPTURES'):
            erreurs += jouer(p, etapes, False, planche)[1]
    if planche:
        faire_planche(planche, os.path.join(ICI, 'heros-armes-planche.png'))
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
