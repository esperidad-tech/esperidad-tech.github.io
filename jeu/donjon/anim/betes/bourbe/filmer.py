"""Filme toutes les animations de Bourbe : python3 filmer.py   (toujours via : flock /tmp/brumeval-pw.lock python3 filmer.py)
Fait deux choses :
  - une vidéo bourbe-demo.mp4 (Playwright record_video_dir, puis ffmpeg libx264 -preset veryfast, yuv420p) ;
  - une planche bourbe-planche.png : les poses clés en grille, chacune légendée.
Affiche aussi les erreurs de la console (il ne doit y en avoir aucune)."""
import os, sys, glob, shutil, subprocess, time, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
TMP = tempfile.mkdtemp(prefix='bourbe-film-')
VID = os.path.join(TMP, 'video')
os.makedirs(VID, exist_ok=True)

# (étiquette, sous-titre, étapes, durée de la prise en ms, attendre la fin ?, capture pour la planche à cette fraction (None = pas de capture))
PLAN = [
    ('entrer', 'il émerge de l\'eau noire, puis ouvre l\'œil', ['entrer'], 6600, True, .52),
    ('attendre', 'la gorge gonfle, il cligne, il bave', ['attendre'], 5200, False, .55),
    ('mouche', 'il gobe une mouche au vol', ['mouche'], 3600, True, .66),
    ('rebond', 'immunisé : la flèche rebondit, il nargue', ['touche rebond'], 2600, True, .45),
    ('langue', 'la langue attrape un héros', ['langue'], 3400, True, .25),
    ('avalé', 'repu : une bosse se promène dans son ventre', [], 3000, False, .5),
    ('chatouille', 'chatouillé de l\'intérieur : il rit, recrache, roule sur le dos', ['chatouille'], 8600, True, .2),
    ('sur le dos', 'le point faible ouvert palpite', ['ouvert on'], 2600, False, .6),
    ('coup', 'ouille ! (flèche lourde)', ['touche fleche-lourde'], 1700, True, .12),
    ('debout', '', ['ouvert off', 'dos off'], 1800, True, None),
    ('lumière', 'la lumière dans l\'eau : il cligne, gêné', ['touche lumiere'], 2400, True, .4),
    ('berge', 'il monte sur la berge', ['berge on'], 2800, True, .9),
    ('feu', 'le feu sur la bave', ['touche feu'], 2000, True, .3),
    ('sec', 'sa peau sèche et se craquelle', ['sec on'], 2600, True, .8),
    ('nuage', 'il tousse trois fois…', ['touche nuage'], 3400, True, .45),
    ('sur le dos', '…et roule sur le dos', ['dos on'], 2200, True, .95),
    ('fin du combo', '', ['dos off', 'sec off', 'berge off'], 3600, True, None),
    ('gonflé', 'nuage avant feu : il gonfle', ['gonfle on'], 2600, True, .95),
    ('saut double', 'énorme, il bondit et retombe', ['saut'], 3600, True, .3),
    ('dégonflé', '', ['gonfle off'], 2200, True, None),
    ('saut', 'il bondit hors de l\'eau : gerbe et onde de choc', ['saut'], 3000, True, .36),
    ('bruit', 'le bruit le fait sursauter', ['touche bruit'], 1800, True, .3),
    ('plonger', 'il plonge sous l\'eau (les têtards sortent)', ['plonger'], 2600, True, .55),
    ('sous l\'eau', 'des bulles, la lueur de son œil', [], 2400, False, None),
    ('remonter', 'il surgit de l\'eau', ['remonter'], 3000, True, .5),
    ('givre', 'le givre sur le bassin : l\'eau gèle', ['touche givre', 'gele on'], 3600, True, .9),
    ('dégel', '', ['gele off'], 1600, True, None),
    ('enragé, brûlé', 'les yeux rouges, des flammes qui restent', ['enrage on', 'brule on'], 3600, False, .7),
    ('calme', '', ['enrage off', 'brule off'], 900, True, None),
    ('collé', 'la colle : il tire sur sa main', ['colle on'], 3600, False, .6),
    ('décollé', '', ['colle off'], 700, True, None),
    ('louche', 'BONG sur la couronne', ['touche louche'], 1700, True, .2),
    ('acide', 'sa peau grésille', ['touche acide'], 1900, True, .4),
    ('bouclier', 'il se cogne au bouclier de runes', ['touche bouclier'], 1900, True, .25),
    ('huile', 'il glisse et bat des bras', ['touche huile'], 2100, True, .45),
    ('mourir', 'il se dégonfle, rote, coule ventre en l\'air', ['mourir'], 8400, True, .52),
    ('nouveau', '', ['nouveau', 'entrer'], 6600, True, None),
    ('exploser', 'le coup critique : l\'explosion du boss', ['exploser'], 6800, True, .17),
    ('les restes', 'des os et de la vase', [], 1500, False, .6),
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
    mp4 = os.path.join(ICI, 'bourbe-demo.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', mp4], check=True)
    planche(caps, os.path.join(ICI, 'bourbe-planche.png'))
    shutil.rmtree(TMP, ignore_errors=True)
    print('vidéo :', mp4, '(%.0f s de tournage)' % (time.time() - t0))
    print('planche :', os.path.join(ICI, 'bourbe-planche.png'), '(%d poses)' % len(caps))

if __name__ == '__main__':
    main()
