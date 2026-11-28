# essai_vague3.py : les cristaux peints de Romain, sa vague de feu, l'abri, le rouge qui monte, l'éclatement — photos dans /tmp/v3
import sys, time, os
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/v3', exist_ok=True)
tirage = sys.argv[1] if len(sys.argv) > 1 else '[16,17,3]'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): print('prêt', i/2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', err); b.close(); sys.exit()
    pg.evaluate('window.__pilote = true; window.__tirage = %s; __essai.h.x = 10.5; __essai.h.y = 12; __essai.avancer(0.3); __essai.lancerVague()' % tirage)
    def ph(nom, sec, att=0.25):
        pg.evaluate('__essai.avancer(%f)' % sec); time.sleep(att); pg.screenshot(path='/tmp/v3/%s.png' % nom)
        print(nom, pg.evaluate('[__essai.vague.t.toFixed(2), __essai.vague.tw.toFixed(2), JSON.stringify(__essai.cristaux().map(c=>c.etat)), __essai.video(), __essai.vague.touche.toFixed(2), __essai.abrite()]'))
    ph('1-chute', 0.75)
    ph('2-plantes', 1.0)
    cr = pg.evaluate('__essai.cristaux()'); print(cr)
    c = cr[0]
    pg.evaluate('__essai.h.x = %f; __essai.h.y = %f; __essai.avancer(0.05)' % (c['x'], c['y'] + 1.6)); print('abrité ?', pg.evaluate('__essai.abrite()'))
    ph('3-boule', 1.4, 0.6)
    ph('4-vague', 1.2, 0.6)
    ph('5-vague2', 1.0, 0.6)
    ph('6-rouge', 1.2, 0.6)
    ph('7-eclat', 2.3, 0.4)
    ph('8-eclat2', 0.5, 0.3)
    ph('9-eclat3', 0.8, 0.3)
    ph('10-fin', 3.0, 0.3)
    print('erreurs', err[:6]); b.close()
