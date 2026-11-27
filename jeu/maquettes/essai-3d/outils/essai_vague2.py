# essai_vague2.py : sans abri (touché), et le rouge des cristaux
import sys, time, os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__pilote = true; __essai.h.x = 10.5; __essai.h.y = 18.5; __essai.avancer(0.3); __essai.lancerVague(); __essai.avancer(6.9)')
    time.sleep(0.2); pg.screenshot(path='/tmp/vague/t-touche.png'); print('abrité', pg.evaluate('__essai.abrite()'))
    pg.evaluate('__essai.avancer(1.2)'); time.sleep(0.2); pg.screenshot(path='/tmp/vague/t-rouge.png')
    pg.evaluate('__essai.avancer(0.9)'); time.sleep(0.1); pg.screenshot(path='/tmp/vague/t-eclat.png')
    print('erreurs', err[:5]); b.close()
