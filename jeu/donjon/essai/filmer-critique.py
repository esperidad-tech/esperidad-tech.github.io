"""Filme le critique de la salle des rats (tablette 1024 x 768) et en tire une planche d'images.

    flock /tmp/brumeval-pw.lock python3 filmer-critique.py   -> captures/critique/crit.mp4, planche.png, im-*.png"""
import os, sys, time, subprocess, glob, shutil
from playwright.sync_api import sync_playwright
LA = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(LA, 'salle-rats.html')
ICI = os.path.join(LA, 'captures', 'critique'); os.makedirs(ICI, exist_ok=True)
VID = os.path.join(ICI, 'video'); shutil.rmtree(VID, ignore_errors=True)
with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width':1024,'height':768}, device_scale_factor=1, has_touch=True, is_mobile=True,
                          record_video_dir=VID, record_video_size={'width':1024,'height':768})
    pg = ctx.new_page(); t0 = time.time()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.goto(PAGE); pg.wait_for_timeout(700)
    pg.evaluate("() => { var s = 7; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }")
    def libre():
        for _ in range(300):
            if pg.evaluate("() => (SALLE.etat.mode === 'qui' && !SALLE.etat.occupe)"): break
            pg.wait_for_timeout(100)
        pg.wait_for_timeout(150)
    for r in ['feu','huile','baume']:
        pg.tap(f'.recette[data-id="{r}"] b', force=True); pg.wait_for_timeout(120)
    pg.tap('[data-act="descendre"]', force=True); libre()
    def joue(h, g, c):
        pg.tap(f'.zone[data-type="heros"][data-id="{h}"]', force=True); pg.wait_for_timeout(250)
        pg.tap(f'.carte[data-id="{g}"]', force=True); pg.wait_for_timeout(250)
        pg.tap(f'.zone[data-type="rat"][data-id="{c}"]', force=True)
    joue('alchimiste', 'p:huile', 0); libre()
    joue('pisteur', 'fleche', 0)
    pg.wait_for_selector('.ra-scene-fx, .crit-texte', state='attached', timeout=15000)
    tc = time.time() - t0
    pg.wait_for_timeout(4200)
    chemin = pg.video.path()
    ctx.close(); nav.close()
print('critique à', round(tc, 2), 's ; erreurs :', errs)
out = os.path.join(ICI, 'crit.mp4')
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(max(0, tc - 0.6)),'-t','4.4','-i',chemin,'-c:v','libx264','-pix_fmt','yuv420p',out], check=True)
for f in glob.glob(os.path.join(ICI, 'im-*.png')): os.remove(f)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',out,'-vf','fps=5,crop=1024:520:0:100,scale=640:-1','-frames:v','20',os.path.join(ICI,'im-%02d.png')], check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',out,'-vf','fps=5,crop=1024:520:0:100,scale=512:-1,tile=4x5','-frames:v','1',os.path.join(ICI,'planche.png')], check=True)
print('ok', out)
