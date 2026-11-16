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
# un long film, en plusieurs morceaux filmés EN MÊME TEMPS (un par cœur de la machine), puis le montage :
#   rm -rf /tmp/cine-images-chene ; filmer.py chene --part 1/2 &  filmer.py chene --part 2/2 & wait ; filmer.py chene --monter
part = opt('--part', None); monter = '--monter' in args
if monter: args.remove('--monter')
# --saute : ne refait pas une image déjà filmée ; --envers : de la dernière à la première (deux robots sur le même morceau se rejoignent au milieu)
saute = '--saute' in args; envers = '--envers' in args
for x in ('--saute', '--envers'):
    if x in args: args.remove(x)
film = args[0]
SORTIE = os.path.join(ICI, 'sortie'); os.makedirs(SORTIE, exist_ok=True)
IM = '/tmp/cine-images-' + film
if not part and not monter: shutil.rmtree(IM, ignore_errors=True)
os.makedirs(IM, exist_ok=True)
t0 = time.time()
with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={'width': 1440, 'height': 616})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(ICI, 'page.html'))
    info = pg.evaluate('(n) => { var F = CINE.films[n]; return {nom:F.nom, duree:F.duree, sons:F.sons || [], sousTitres:F.sousTitres || [], ailleurs:F.ailleurs || null}; }', film)
    # un film dont l'image se fait ailleurs (la pub : jeu/pub/filmer-pub.py) n'est inscrit ici que pour sa bande-son : on ne le filme pas (on écraserait sa vidéo)
    if info.pop('ailleurs'): print('« %s » ne se filme pas ici : son image se fait dans %s (voir film-%s.js).' % (film, pg.evaluate('(n) => CINE.films[n].ailleurs', film), film)); sys.exit(1)
    fin = float(a) if a else info['duree']
    n = int(round((fin - de) * fps))
    k0, k1 = 0, n
    if part: i, N = [int(x) for x in part.split('/')]; k0, k1 = n * (i - 1) // N, n * i // N
    if monter: k0 = k1 = 0
    for k in (range(k1 - 1, k0 - 1, -1) if envers else range(k0, k1)):
        if saute and os.path.exists(os.path.join(IM, '%05d.jpg' % k)): continue
        t = de + k / fps
        pg.evaluate('([n, t]) => { CINE.image(n, t); }', [film, t])
        # (une image lourde — beaucoup de fumée — n'est pas toujours peinte quand la photo part : on laisse passer deux rafraîchissements)
        pg.evaluate('() => new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); })')
        pg.screenshot(path=os.path.join(IM, '_%05d.jpg' % k), type='jpeg', quality=94); os.replace(os.path.join(IM, '_%05d.jpg' % k), os.path.join(IM, '%05d.jpg' % k))
        if k % 60 == 0: print('  image %d / %d (%.0f s)' % (k, n, time.time() - t0), flush=True)
    nav.close()
if errs: print('ERREURS', errs[:5])
if part: print('morceau', part, 'filmé : images', k0, 'à', k1 - 1, '(%.0f s)' % (time.time() - t0)); sys.exit(0)
manque = [k for k in range(n) if not os.path.exists(os.path.join(IM, '%05d.jpg' % k))]
if manque: print('IL MANQUE', len(manque), 'images (la première :', manque[0], ')'); sys.exit(1)
mp4 = os.path.join(SORTIE, film + '.mp4')
# le grain du film et un léger vignettage
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(IM, '%05d.jpg'),
                '-vf', 'colorbalance=rs=-.04:bs=.07:rh=.05:bh=-.05,vignette=angle=PI/5,noise=alls=5:allf=t,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf,
                '-profile:v', 'main', '-movflags', '+faststart', '-an', mp4], check=True)
info['fps'] = fps
json.dump(info, open(os.path.join(SORTIE, film + '.json'), 'w'), ensure_ascii=False, indent=1)
print(mp4, '%.1f Mo' % (os.path.getsize(mp4) / 1e6), '%.0f s' % (time.time() - t0))
subprocess.run(['python3', os.path.join(ICI, 'infos.py')], check=True)
