"""Filme toutes les animations du têtard : python3 filmer.py   (toujours via : flock /tmp/brumeval-pw.lock python3 filmer.py)
Fait deux choses :
  - une vidéo tetard-demo.mp4 (Playwright record_video_dir, puis ffmpeg libx264 -preset veryfast, yuv420p) ;
  - une planche tetard-planche.png : les poses clés en grille, chacune légendée.
Affiche aussi les erreurs de la console (il ne doit y en avoir aucune)."""
import os, sys, glob, shutil, subprocess, time, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
TMP = tempfile.mkdtemp(prefix='tetard-film-')
VID = os.path.join(TMP, 'video')
os.makedirs(VID, exist_ok=True)

# (étiquette, sous-titre, étapes, durée de la prise en ms, attendre la fin ?, capture pour la planche à cette fraction (None = pas de capture))
PLAN = [
    ('entrer', 'il saute hors du bassin et atterrit en flaque', ['entrer'], 1700, True, .32),
    ('attendre', 'il gigote, frétille, la gueule ouverte', ['attendre'], 3600, False, .5),
    ('attaquer', 'petit bond et morsure', ['attaquer'], 1300, True, .45),
    ('flèche', 'il encaisse', ['touche fleche'], 1000, True, .15),
    ('dague', '', ['touche dague'], 1000, True, .2),
    ('feu', '', ['touche feu'], 1100, True, .3),
    ('lumière', 'des étoiles', ['touche lumiere'], 1400, True, .4),
    ('nuage', 'il tousse trois fois (des bulles)', ['touche nuage'], 2700, True, .44),
    ('givre', '', ['touche givre'], 1000, True, .2),
    ('rebond', '', ['touche rebond'], 1000, True, .15),
    ('enragé, brûlé', 'yeux rouges, flammes', ['enrage on', 'brule on'], 2400, False, .6),
    ('calme', '', ['enrage off', 'brule off'], 600, True, None),
    ('collé', '', ['colle on'], 1600, False, .6),
    ('décollé', '', ['colle off'], 500, True, None),
    ('ébloui', '', ['ebloui on'], 1800, False, .6),
    ('', '', ['ebloui off'], 500, True, None),
    ('gelé', 'la flaque gèle, il ne bouge presque plus', ['gele on'], 1800, False, .7),
    ('', '', ['gele off'], 700, True, None),
    ('sur le dos', 'il gigote, le ventre en l\'air', ['dos on'], 2200, False, .7),
    ('', '', ['dos off'], 1000, True, None),
    ('fuir', 'il retourne à l\'eau en se tortillant', ['fuir'], 2400, True, .55),
    ('nouveau', '', ['nouveau', 'entrer'], 1800, True, None),
    ('exploser', 'splatch gluant', ['exploser'], 3800, True, .135),
    ('les restes', 'une petite arête dans la glu', [], 1200, False, .6),
]


def police(t):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, t)
    return ImageFont.load_default()

def planche(captures, sortie):
    W, H, cols = 480, 270, 4
    rows = (len(captures) + cols - 1) // cols
    img = Image.new('RGB', (W * cols, (H + 46) * rows), (12, 9, 18))
    d = ImageDraw.Draw(img)
    f1, f2 = police(19), police(14)
    for i, (f, titre, sous) in enumerate(captures):
        x, y = (i % cols) * W, (i // cols) * (H + 46)
        im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
        img.paste(im, (x, y))
        d.text((x + 10, y + H + 4), titre, fill=(255, 227, 163), font=f1)
        d.text((x + 10, y + H + 26), sous, fill=(191, 167, 122), font=f2)
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
        pg.wait_for_timeout(600)
        for k, (nom, sous, etapes, duree, attendre, cap) in enumerate(PLAN):
            pg.evaluate("([a, b]) => etiquette(a, b)", [nom, sous])
            pg.evaluate("""(etapes) => { window.__fini = false; etapes.reduce((p, e) => p.then(() => etape(e)), Promise.resolve()).then(() => { window.__fini = true; }, (e) => { console.error(String(e && e.stack || e)); window.__fini = true; }); }""", etapes)
            if cap is not None:
                pg.wait_for_timeout(int(duree * cap))
                f = os.path.join(TMP, '%02d.png' % k)
                pg.screenshot(path=f)
                caps.append((f, nom, sous))
                pg.wait_for_timeout(duree - int(duree * cap))
            else:
                pg.wait_for_timeout(duree)
            if attendre:
                pg.wait_for_function('window.__fini', timeout=30000)
        pg.evaluate("etiquette('', '')")
        pg.wait_for_timeout(400)
        ctx.close()
        b.close()
    print('erreurs :', errs)
    webm = glob.glob(os.path.join(VID, '*.webm'))[0]
    mp4 = os.path.join(ICI, 'tetard-demo.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', mp4], check=True)
    planche(caps, os.path.join(ICI, 'tetard-planche.png'))
    shutil.rmtree(TMP, ignore_errors=True)
    print('vidéo :', mp4, '(%.0f s de tournage)' % (time.time() - t0))
    print('planche :', os.path.join(ICI, 'tetard-planche.png'), '(%d poses)' % len(caps))

if __name__ == '__main__':
    main()
