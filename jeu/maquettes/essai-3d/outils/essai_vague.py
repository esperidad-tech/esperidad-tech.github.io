# essai_vague.py : les cristaux qui tombent, la vague de flammes, l'abri, le rouge, l'éclatement — photos dans /tmp/vague
import sys, time, os
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/vague', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('prêt', i/2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', err); b.close(); sys.exit()
    pg.evaluate('window.__pilote = true; __essai.h.x = 10.5; __essai.h.y = 17; __essai.avancer(0.3); __essai.lancerVague()')
    def ph(nom, sec):
        pg.evaluate('__essai.avancer(%f)' % sec); time.sleep(0.15); pg.screenshot(path='/tmp/vague/%s.png' % nom)
    ph('1-chute', 0.8)
    cr = pg.evaluate('__essai.cristaux()'); print('cristaux', cr)
    ph('2-plantes', 0.9)
    # le héros se met à l'abri derrière le premier cristal
    c = cr[0]; pg.evaluate('__essai.h.x = %f; __essai.h.y = %f; __essai.avancer(0.1)' % (c['x'], c['y'] + 1.3)); print('à l\'abri ?', pg.evaluate('__essai.abrite()'))
    ph('3-charge', 1.6)
    ph('4-vague', 1.6)
    ph('5-vague2', 0.9)
    ph('6-feu', 0.9)
    ph('7-rouge', 1.2)
    ph('8-eclat', 0.9)
    ph('9-fin', 2.5)
    print('cristaux', pg.evaluate('__essai.cristaux()'), 'vague', pg.evaluate('__essai.vague.t'))
    print('erreurs', err[:6]); b.close()
