"""Filmer la pub (pub.html) : 30 images par seconde → sortie/pub.mp4 (belle qualité, muette) et ../cine/sortie/pub.mp4 (plus léger : celui du jeu).
   python3 filmer-pub.py --images 1 3.5 6.5        des images fixes dans /tmp/pub/vues/
   rm -rf /tmp/pub-images ; python3 filmer-pub.py --part 1/2 & python3 filmer-pub.py --part 2/2 & wait ; python3 filmer-pub.py --monter
   LA COPIE À PARTAGER (pour Romain : 1920 × 1080, les bandes noires, AVEC le son — jamais la vidéo muette) : les mêmes commandes avec
   « --grand » (images dans /tmp/pub-images-grand, un tiers plus fines) → /tmp/cine/envoi/pub-brumeval-1080.mp4. Il faut d'abord la
   bande-son : cd ../cine && python3 bande-son.py pub (elle laisse /tmp/cine/apercus/pub-trait.wav ; sinon on prend sortie/pub.mp3)."""
import sys, os, subprocess, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); IM = '/tmp/pub-images'; FPS = 30
a = sys.argv[1:]
GRAND = '--grand' in a
if GRAND: IM = '/tmp/pub-images-grand'
def opt(n, d=None): return a[a.index(n) + 1] if n in a else d
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 616}, device_scale_factor=4 / 3 if GRAND else 1); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + ICI + '/pub.html?plans=file:///tmp/pub/plans'); pg.wait_for_function('!!window.PUB'); pg.evaluate('() => document.fonts.ready.then(function(){ return 1; })')
    T = pg.evaluate('PUB.duree'); n = int(round(T * FPS))
    def image(t, chemin, **o):
        pg.evaluate('(t) => PUB.image(t)', t)
        pg.evaluate('() => new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); })')
        pg.screenshot(path=chemin, **o)
    if '--images' in a:
        os.makedirs('/tmp/pub/vues', exist_ok=True)
        for x in a[a.index('--images') + 1:]: image(float(x), '/tmp/pub/vues/pub-%05.2f.png' % float(x))
        print('erreurs', errs[:5]); sys.exit(0)
    if '--monter' not in a:
        os.makedirs(IM, exist_ok=True); k0, k1 = 0, n; part = opt('--part')
        if part: i, N = [int(x) for x in part.split('/')]; k0, k1 = n * (i - 1) // N, n * i // N
        t0 = time.time()
        for k in range(k0, k1):
            image(k / FPS, IM + '/_%05d.jpg' % k, type='jpeg', quality=95); os.replace(IM + '/_%05d.jpg' % k, IM + '/%05d.jpg' % k)
            if k % 100 == 0: print('image', k, '(%.0f s)' % (time.time() - t0), flush=True)
        print('erreurs', errs[:5])
        if part: sys.exit(0)
    b.close()
manque = [k for k in range(n) if not os.path.exists(IM + '/%05d.jpg' % k)]
if manque: print('il manque', len(manque), 'images'); sys.exit(1)
if GRAND:
    son = '/tmp/cine/apercus/pub-trait.wav'
    if not os.path.exists(son): son = ICI + '/../cine/sortie/pub.mp3'
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', son, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    gain = -1 - float(m.split('max_volume:')[1].split('dB')[0])            # le plus fort à -1 dB, comme la bande-son du jeu
    os.makedirs('/tmp/cine/envoi', exist_ok=True); sortie = '/tmp/cine/envoi/pub-brumeval-1080.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', IM + '/%05d.jpg', '-i', son,
                    '-vf', 'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black', '-af', 'volume=%.1fdB' % gain, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', sortie], check=True)
    print(sortie, os.path.getsize(sortie) // 1024, 'Ko'); sys.exit(0)
os.makedirs(ICI + '/sortie', exist_ok=True)
# la belle copie (sortie/pub.mp4, muette : on ne l'envoie jamais telle quelle) et celle du jeu, plus légère, rangée avec les autres films (../cine/sortie/pub.mp4)
for chemin, crf in ((ICI + '/sortie/pub.mp4', '17'), (os.path.normpath(ICI + '/../cine/sortie/pub.mp4'), '24')):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', IM + '/%05d.jpg', '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', chemin], check=True)
    print(chemin, os.path.getsize(chemin) // 1024, 'Ko')
