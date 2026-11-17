"""Filmer un film de héros (heros.html?film=…) : 30 images par seconde → sortie/heros-<film>.mp4 (belle qualité, muette) et
   ../cine/sortie/heros-<film>.mp4 (plus léger : celui du jeu).   <film> : pisteur | alchimiste | barde | sage
   python3 filmer-heros.py <film> --images 1 3.5 6.5        des images fixes dans /tmp/pub/vues/
   python3 filmer-heros.py <film> --planche                 une image par demi-seconde, en planche (pour tout voir d'un coup)
   python3 filmer-heros.py <film> --part 1/2 & python3 filmer-heros.py <film> --part 2/2 & wait ; python3 filmer-heros.py <film> --monter
   LA COPIE À PARTAGER (1920 × 1080, les bandes noires, AVEC le son — jamais la vidéo muette) : les mêmes commandes avec « --grand »
   → /tmp/cine/envoi/brumeval-<film>-1080.mp4. Il faut d'abord la bande-son : cd ../cine && python3 bande-son.py heros<Film>."""
import sys, os, subprocess, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); FPS = 30
a = sys.argv[1:]; FILM = a[0]; assert FILM in ('pisteur', 'alchimiste', 'barde', 'sage'), 'quel film ?'
CINE = 'heros' + FILM.capitalize()                                # son nom dans l'atelier des films (jeu/cine/src/film-heros.js)
GRAND = '--grand' in a; IM = '/tmp/heros-images%s/%s' % ('-grand' if GRAND else '', FILM)
def opt(n, d=None): return a[a.index(n) + 1] if n in a else d
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 616}, device_scale_factor=4 / 3 if GRAND else 1); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + ICI + '/heros.html?film=' + FILM + '&plans=file:///tmp/pub/plans'); pg.wait_for_function('!!window.HEROS'); pg.evaluate('() => document.fonts.ready.then(function(){ return 1; })')
    T = pg.evaluate('HEROS.duree'); n = int(round(T * FPS))
    def image(t, chemin, **o):
        pg.evaluate('(t) => HEROS.image(t)', t)
        pg.evaluate('() => new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); })')
        pg.screenshot(path=chemin, **o)
    if '--images' in a:
        os.makedirs('/tmp/pub/vues', exist_ok=True)
        for x in a[a.index('--images') + 1:]:
            if x.startswith('--'): break
            image(float(x), '/tmp/pub/vues/%s-%05.2f.png' % (FILM, float(x)))
        print('erreurs', errs[:5]); sys.exit(0)
    if '--planche' in a:
        from PIL import Image
        os.makedirs('/tmp/pub/vues/pl', exist_ok=True); pas = float(opt('--pas', .5)); t0 = float(opt('--de', 0)); t1 = float(opt('--a', T)); ims = []; t = t0 + float(opt('--decale', .3))
        while t < t1:
            f = '/tmp/pub/vues/pl/%s-%05.2f.jpg' % (FILM, t); image(t, f, type='jpeg', quality=80); ims.append(Image.open(f).resize((480, 205))); t += pas
        cols = int(opt('--cols', 4)); rows = (len(ims) + cols - 1) // cols; c = Image.new('RGB', (cols * 484, rows * 209), (255, 0, 255))
        for i, im in enumerate(ims): c.paste(im, ((i % cols) * 484, (i // cols) * 209))
        s = '/tmp/pub/vues/planche-film-%s.jpg' % FILM; c.save(s, quality=82); print(s, c.size, 'erreurs', errs[:5]); sys.exit(0)
    if '--monter' not in a:
        os.makedirs(IM, exist_ok=True); k0, k1 = 0, n; part = opt('--part')
        if part: i, N = [int(x) for x in part.split('/')]; k0, k1 = n * (i - 1) // N, n * i // N
        t0 = time.time()
        for k in range(k0, k1):
            image(k / FPS, IM + '/_%05d.jpg' % k, type='jpeg', quality=95); os.replace(IM + '/_%05d.jpg' % k, IM + '/%05d.jpg' % k)
            if k % 150 == 0: print('image', k, '(%.0f s)' % (time.time() - t0), flush=True)
        print('erreurs', errs[:5])
        if part: sys.exit(0)
    b.close()
manque = [k for k in range(n) if not os.path.exists(IM + '/%05d.jpg' % k)]
if manque: print('il manque', len(manque), 'images'); sys.exit(1)
if GRAND:
    son = '/tmp/cine/apercus/%s-trait.wav' % CINE
    if not os.path.exists(son): son = ICI + '/../cine/sortie/%s.mp3' % CINE
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', son, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    gain = -1 - float(m.split('max_volume:')[1].split('dB')[0])            # le plus fort à -1 dB, comme la bande-son du jeu
    os.makedirs('/tmp/cine/envoi', exist_ok=True); sortie = '/tmp/cine/envoi/brumeval-%s-1080.mp4' % FILM
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', IM + '/%05d.jpg', '-i', son,
                    '-vf', 'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black', '-af', 'volume=%.1fdB' % gain, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', sortie], check=True)
    print(sortie, os.path.getsize(sortie) // 1024, 'Ko'); sys.exit(0)
os.makedirs(ICI + '/sortie', exist_ok=True)
for chemin, crf in ((ICI + '/sortie/heros-%s.mp4' % FILM, '17'), (os.path.normpath(ICI + '/../cine/sortie/%s.mp4' % CINE), '24')):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', IM + '/%05d.jpg', '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', chemin], check=True)
    print(chemin, os.path.getsize(chemin) // 1024, 'Ko')
