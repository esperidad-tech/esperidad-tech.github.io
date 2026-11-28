import sys, time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): break
        time.sleep(0.5)
    time.sleep(1)
    pg.evaluate('window.__pilote = true; window.__tirage = [[10.5,12.5]]; __essai.h.x = 13.5; __essai.h.y = 15; window.__zoom = 1.6; __essai.avancer(0.3); __essai.lancerVague()')
    pg.evaluate('__essai.avancer(4.6)'); time.sleep(0.4); pg.screenshot(path='/tmp/cr/c1-impact.png')
    print(pg.evaluate("__essai.vague.actifs.map(c=>[c.cratere.material.opacity, c.cratere.visible, c.cratere.scale.x, c.cratere.material.map && c.cratere.material.map.image ? c.cratere.material.map.image.width : 'pas d image'])"))
    pg.evaluate('__essai.avancer(2.0)'); time.sleep(0.4); pg.screenshot(path='/tmp/cr/c2-plante.png')
    pg.evaluate("__essai.vague.actifs.forEach(c=>c.mesh.visible=false); __essai.avancer(0.02)"); time.sleep(0.3); pg.screenshot(path='/tmp/cr/c3-sans-cristal.png')
    pg.evaluate("__essai.vague.actifs.forEach(c=>c.mesh.visible=true)")
    pg.evaluate('__essai.avancer(4.4)'); time.sleep(0.5); pg.screenshot(path='/tmp/cr/c4-abri.png')
    pg.evaluate('__essai.avancer(3.6)'); time.sleep(0.5); pg.screenshot(path='/tmp/cr/c5-eteint.png')
    pg.evaluate('__essai.avancer(1.5)'); time.sleep(0.5); pg.screenshot(path='/tmp/cr/c6-casse.png')
    pg.evaluate('__essai.avancer(0.8)'); time.sleep(0.5); pg.screenshot(path='/tmp/cr/c7-morceaux.png')
    pg.evaluate('__essai.avancer(0.5)'); time.sleep(0.5); pg.screenshot(path='/tmp/cr/c8-efface.png')
    print(err); b.close()
