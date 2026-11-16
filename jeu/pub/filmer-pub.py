"""Filmer la pub (pub.html) : 30 images par seconde → sortie/pub.mp4 (belle qualité, pour Romain) et sortie/pub-jeu.mp4 (plus léger, pour le jeu).
   python3 filmer-pub.py --images 1 3.5 6.5        des images fixes dans /tmp/pub/vues/
   rm -rf /tmp/pub-images ; python3 filmer-pub.py --part 1/2 & python3 filmer-pub.py --part 2/2 & wait ; python3 filmer-pub.py --monter"""
import sys, os, subprocess, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); IM = '/tmp/pub-images'; FPS = 30
a = sys.argv[1:]
def opt(n, d=None): return a[a.index(n) + 1] if n in a else d
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1440, 'height': 616}); errs = []
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
os.makedirs(ICI + '/sortie', exist_ok=True)
for nom, crf in (('pub', '17'), ('pub-jeu', '24')):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(FPS), '-i', IM + '/%05d.jpg', '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', ICI + '/sortie/' + nom + '.mp4'], check=True)
    print(nom + '.mp4', os.path.getsize(ICI + '/sortie/' + nom + '.mp4') // 1024, 'Ko')
