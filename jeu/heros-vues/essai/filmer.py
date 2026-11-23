"""Le film d'essai : python3 filmer.py [sortie.mp4] [--images dossier]  (une image après l'autre dans Chromium, puis ffmpeg)"""
import sys, os, subprocess, shutil
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]; dos = '/tmp/hv-film'
if '--images' in args: i = args.index('--images'); dos = args[i + 1]; del args[i:i + 2]
sortie = args[0] if args else os.path.join(ICI, 'pisteuse-se-tourne.mp4')
shutil.rmtree(dos, ignore_errors=True); os.makedirs(dos)
with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={'width': 720, 'height': 960})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(ICI, 'film.html'))
    n = 0
    while True:
        encore = pg.evaluate('() => window.image()')
        pg.screenshot(path=os.path.join(dos, '%05d.png' % n)); n += 1
        if not encore or n > 2000: break
    if errs: print('ERREURS', errs[:5])
    nav.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(dos, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-movflags', '+faststart', sortie], check=True)
print(n, 'images →', sortie)
