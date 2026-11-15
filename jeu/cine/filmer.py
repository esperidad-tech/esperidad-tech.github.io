"""Filmer une cinématique, image par image, puis en faire une vidéo :  python3 filmer.py <film> [--fps 30] [--de t0 --a t1]
   → sortie/<film>.mp4 (muette, 1440 × 616 : du 21:9) et sortie/<film>.json (la durée, les sons, les sous-titres).
   La vidéo est muette exprès : le jeu joue les sons de l'Atelier des sons (le volume des réglages compte) à l'instant dit."""
import sys, os, json, subprocess, shutil, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return v
    return d
fps = int(opt('--fps', 30)); de = float(opt('--de', 0)); a = opt('--a', None); crf = opt('--crf', '22')
film = args[0]
SORTIE = os.path.join(ICI, 'sortie'); os.makedirs(SORTIE, exist_ok=True)
IM = '/tmp/cine-images-' + film; shutil.rmtree(IM, ignore_errors=True); os.makedirs(IM)
t0 = time.time()
with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={'width': 1440, 'height': 616})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(ICI, 'page.html'))
    info = pg.evaluate('(n) => { var F = CINE.films[n]; return {nom:F.nom, duree:F.duree, sons:F.sons || [], sousTitres:F.sousTitres || []}; }', film)
    fin = float(a) if a else info['duree']
    n = int(round((fin - de) * fps))
    for k in range(n):
        t = de + k / fps
        pg.evaluate('([n, t]) => { CINE.image(n, t); }', [film, t])
        pg.screenshot(path=os.path.join(IM, '%05d.jpg' % k), type='jpeg', quality=94)
        if k % 60 == 0: print('  image %d / %d (%.0f s)' % (k, n, time.time() - t0), flush=True)
    nav.close()
if errs: print('ERREURS', errs[:5])
mp4 = os.path.join(SORTIE, film + '.mp4')
# le grain du film et un léger vignettage
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(IM, '%05d.jpg'),
                '-vf', 'colorbalance=rs=-.04:bs=.07:rh=.05:bh=-.05,vignette=angle=PI/5,noise=alls=5:allf=t,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf,
                '-profile:v', 'main', '-movflags', '+faststart', '-an', mp4], check=True)
info['fps'] = fps
json.dump(info, open(os.path.join(SORTIE, film + '.json'), 'w'), ensure_ascii=False, indent=1)
print(mp4, '%.1f Mo' % (os.path.getsize(mp4) / 1e6), '%.0f s' % (time.time() - t0))
subprocess.run(['python3', os.path.join(ICI, 'infos.py')], check=True)
