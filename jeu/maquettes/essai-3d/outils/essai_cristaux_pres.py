# essai_cristaux.py : l'appel des cristaux (mains levées), les 6 chutes, la fournaise, la vague, l'abri en goutte, le bris — photos dans /tmp/cr2
import sys, time, os, json
from playwright.sync_api import sync_playwright
os.makedirs('/tmp/cr2', exist_ok=True)
tirage = '[[4,6],[9,4.5],[15.5,6],[6,11],[12.5,10],[17,13]]'
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:300]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('barde')")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret&&window.__essai.vague.pret)'): print('prêt', i/2); break
        time.sleep(0.5)
    else: print('PAS PRÊT', err); b.close(); sys.exit()
    time.sleep(1.5)
    pg.evaluate('window.__pilote = true; window.__tirage = %s; __essai.h.x = 12.6; __essai.h.y = 11.4; window.__zoom = 1.0; __essai.avancer(0.3); __essai.lancerVague()' % tirage)
    def ph(nom, sec, att=0.3):
        pg.evaluate('__essai.avancer(%f)' % sec); time.sleep(att); pg.screenshot(path='/tmp/cr2/%s.png' % nom)
        print(nom, pg.evaluate('[__essai.vague.t.toFixed(2), __essai.vague.tw.toFixed(2), JSON.stringify(__essai.cristaux().map(c=>c.etat)), __essai.vague.touche.toFixed(2), __essai.abrite(), __essai.ips]'))
    ph('01-charge', 1.5)
    ph('02-mains', 0.75)
    ph('03-chute', 0.9)
    ph('04-impactA', 1.0)
    ph('05-impactB', 0.4)
    ph('06-debris', 0.6)
    ph('07-plantes', 1.4)
    ph('08-fournaise', 1.2, 0.5)
    ph('09-fournaise2', 0.6, 0.5)
    ph('10-vague', 1.0, 0.5)
    ph('11-vague2', 1.2, 0.5)
    ph('12-abris', 1.4, 0.5)
    ph('13-abris2', 1.6, 0.5)
    ph('14-eteint', 1.6, 0.5)
    ph('15-brise', 1.2, 0.4)
    ph('16-brise2', 0.7, 0.4)
    ph('17-brise3', 0.8, 0.4)
    ph('18-fin', 1.4, 0.4)
    print('erreurs', err[:6]); b.close()
