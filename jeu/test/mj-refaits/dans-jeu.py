# Lance les mini-jeux refaits DANS le jeu (index.html, avec tout son CSS) et prend des captures.
import sys
from playwright.sync_api import sync_playwright
idx, out = sys.argv[1], sys.argv[2]
JEUX = [('tir','clocher'),('tir','cerfvolant'),('tir','banderoles'),('cachette','ville'),('cachette','foret'),('cachette','moulin'),('traces','ville')]
with sync_playwright() as p:
    b = p.chromium.launch()
    for vp in [(400, 860), (1180, 760)]:
        for jeu, dec in JEUX:
            pg = b.new_page(viewport={'width':vp[0],'height':vp[1]}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file://' + idx); pg.wait_for_timeout(700)
            pg.evaluate("""(a) => { var pl = document.getElementById('mj-plein'); pl.hidden = false; var prm = MJ.reglages(a[0], 3, {}, {brut:true}); prm.decor = a[1];
              window.__part = MJ.lancer(pl, a[0], prm, function(){}, {titre:a[0] + ' ' + a[1]}); }""", [jeu, dec])
            pg.wait_for_timeout(900); pg.screenshot(path=f'{out}-{jeu}-{dec}-{vp[0]}-intro.png')
            pg.locator('.mj-go').first.click(); pg.wait_for_timeout(2200 if jeu != 'traces' else 3600)
            pg.screenshot(path=f'{out}-{jeu}-{dec}-{vp[0]}.png')
            print(jeu, dec, vp[0], errs[:2] or 'ok')
            pg.close()
    b.close()
