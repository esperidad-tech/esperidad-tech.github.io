"""Filme toutes les animations de la chauve-souris :  flock /tmp/brumeval-pw.lock python3 filmer.py
Fait deux choses :
  - une vidéo chauvesouris-demo.mp4 (Playwright record_video_dir, puis ffmpeg libx264 -preset veryfast, yuv420p) ;
  - une planche chauvesouris-planche.png : les poses clés en grille, chacune légendée.
Affiche aussi les erreurs de la console (il ne doit y en avoir aucune)."""
import os, glob, shutil, subprocess, time, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
ID = 'chauvesouris'
TMP = tempfile.mkdtemp(prefix=ID + '-film-')
VID = os.path.join(TMP, 'video')
os.makedirs(VID, exist_ok=True)

# (étiquette, sous-titre, étapes, durée de la prise (ms), attendre la fin ?, captures [(instant ms, titre, sous-titre)])
PLAN = [
    ('entrer', 'elle arrive en volant', ['entrer'], 1800, True, [(560, 'entrer', 'elle plonge en arrivant')]),
    ('attendre', 'vol sur place, les oreilles écoutent', ['attendre'], 3200, False, [(1500, 'attendre', 'vol sur place, elle écoute (ondes)')]),
    ('attaquer', 'elle se replie et pique', ['attaquer'], 2100, True, [(330, 'piqué : elle se replie', 'elle vise'), (600, 'piqué : en plongée', 'la brume traîne derrière'), (700, 'piqué : CLAC', 'griffes au contact')]),
    ('flèche d\'argent', 'elle la sent : elle se cabre', ['touche fleche-argent'], 1800, True, [(330, 'flèche d\'argent', 'elle se cabre, ailes dressées')]),
    ('bruit', 'BONG ! elle tombe devant', ['touche bruit'], 2400, True, [(260, 'bruit : BONG', 'les oreilles vibrent')]),
    ('au sol', 'sonnée : le point faible est ouvert', ['attendre'], 2000, False, [(1200, 'au sol, sonnée', 'point faible ouvert (il brille)')]),
    ('envol', 'elle repart', ['envol'], 1700, True, []),
    ('colle', 'les ailes collées, elle tombe', ['touche colle'], 2400, True, [(500, 'colle', 'ailes collées, elle se débat')]),
    ('collée au sol', 'elle se débat', ['attendre'], 1600, False, [(900, 'collée au sol', 'point faible ouvert')]),
    ('', '', ['colle off', 'envol'], 2000, True, []),
    ('lumière', 'elle devient folle (piège)', ['touche lumiere'], 2100, True, [(1100, 'lumière : FOLLE', 'les yeux fous, elle hurle')]),
    ('folle', 'deux piqués désordonnés', ['attaquer (folle)'], 3000, True, [(560, 'folle : 1er piqué', 'elle frappe 2 fois'), (1300, 'folle : 2e piqué', '')]),
    ('', '', ['folle off'], 600, True, []),
    ('nuage', 'elle tousse trois fois', ['touche nuage'], 2900, True, [(1150, 'nuage', 'elle tousse (3 fois)')]),
    ('gelée', '', ['gele on'], 1300, True, [(1100, 'gelée', 'le givre sur les ailes')]),
    ('', '', ['gele off'], 700, True, []),
    ('brûlée, enragée', 'flammes, yeux rouges', ['brule on', 'enrage on'], 1600, True, [(1300, 'brûlée + enragée', 'flammes, yeux rouges')]),
    ('', '', ['brule off', 'enrage off'], 500, True, []),
    ('éblouie', '', ['ebloui on'], 1300, True, [(1100, 'éblouie', 'étoiles, yeux plissés')]),
    ('', '', ['ebloui off'], 500, True, []),
    ('fuir', 'demi-tour, zigzag', ['fuir'], 2400, True, [(900, 'fuir', 'elle s\'enfuit en zigzag')]),
    ('nouveau', '', ['nouveau', 'entrer'], 2000, True, []),
    ('exploser', 'le critique', ['exploser'], 4200, True, [(600, 'exploser', 'BOUM'), (1300, 'brume noire', 'lambeaux d\'ailes, touffes de poils'), (3600, 'les restes', 'petit crâne, os, cendre')]),
]


def police(t):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, t)
    return ImageFont.load_default()


def planche(captures, sortie):
    # la zone de combat entière (les héros à gauche, la bête à droite)
    W, H, cols = 600, 250, 4
    rows = (len(captures) + cols - 1) // cols
    img = Image.new('RGB', (W * cols, (H + 50) * rows), (12, 9, 18))
    d = ImageDraw.Draw(img)
    f1, f2 = police(20), police(15)
    for i, (f, titre, sous) in enumerate(captures):
        x, y = (i % cols) * W, (i // cols) * (H + 50)
        im = Image.open(f).convert('RGB').crop((0, 0, 960, 400)).resize((W, H), Image.LANCZOS)
        img.paste(im, (x, y))
        d.text((x + 10, y + H + 5), titre, fill=(255, 227, 163), font=f1)
        d.text((x + 10, y + H + 29), sous, fill=(191, 167, 122), font=f2)
    img.save(sortie)


def main():
    t0 = time.time()
    caps = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1, record_video_dir=VID, record_video_size={'width': 960, 'height': 540})
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type in ('error', 'warning') else None)
        pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film=1')
        pg.wait_for_timeout(700)
        for k, (nom, sous, etapes, duree, attendre, prises) in enumerate(PLAN):
            pg.evaluate("([a, b]) => etiquette(a, b)", [nom, sous])
            pg.evaluate("""(etapes) => { window.__fini = false; etapes.reduce((p, e) => p.then(() => etape(e)), Promise.resolve()).then(() => { window.__fini = true; }, (e) => { console.error(String(e && e.stack || e)); window.__fini = true; }); }""", etapes)
            deja = 0
            for n, (ms, titre, st) in enumerate(prises):
                pg.wait_for_timeout(max(0, ms - deja))
                deja = ms
                f = os.path.join(TMP, '%02d-%d.png' % (k, n))
                pg.screenshot(path=f)
                caps.append((f, titre, st))
            pg.wait_for_timeout(max(0, duree - deja))
            if attendre:
                pg.wait_for_function('window.__fini', timeout=30000)
        pg.evaluate("etiquette('', '')")
        pg.wait_for_timeout(400)
        ctx.close()
        b.close()
    print('erreurs :', errs or 'aucune')
    webm = glob.glob(os.path.join(VID, '*.webm'))[0]
    mp4 = os.path.join(ICI, ID + '-demo.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', mp4], check=True)
    planche(caps, os.path.join(ICI, ID + '-planche.png'))
    shutil.rmtree(TMP, ignore_errors=True)
    print('vidéo :', mp4, '(%.0f s de tournage)' % (time.time() - t0))
    print('planche :', os.path.join(ICI, ID + '-planche.png'), '(%d poses)' % len(caps))


if __name__ == '__main__':
    main()
