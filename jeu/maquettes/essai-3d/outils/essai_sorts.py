# essai_sorts.py : la note (glace, feu, acide) en plein vol, le soin, le saut — images recadrées dans /tmp/sorts
import sys, time, os, json
from playwright.sync_api import sync_playwright
from PIL import Image
os.makedirs('/tmp/sorts', exist_ok=True)
W, H, DSF = 844, 390, 2
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate(\"choisir('barde')\")
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): print('prêt', i / 2, 's'); break
        time.sleep(0.5)
    else: print('PAS PRÊT', pg.evaluate("document.getElementById('charge').textContent"), err)
    pg.evaluate('window.__pilote = true; window.__zoom = 1.6; __essai.taille(); __essai.h.x = 9; __essai.h.y = 8.6; __essai.avancer(0.5)')
    def photo(nom, x, y, z, r=140):
        e = pg.evaluate('__essai.ecran(%f,%f,%f)' % (x, y, z)); pg.screenshot(path='/tmp/sorts/_.png')
        im = Image.open('/tmp/sorts/_.png'); cx, cy = e['x'] * DSF, e['y'] * DSF
        im.crop((int(cx - r * DSF), int(cy - r * DSF), int(cx + r * DSF), int(cy + r * DSF))).save('/tmp/sorts/%s.png' % nom)
    for q, d in [('glace', 1.5), ('feu', 3.0), ('acide', 1.5)]:
        pg.evaluate("__essai.lancer('%s')" % q); pg.evaluate('__essai.avancer(%f)' % (d + 0.22))
        t = pg.evaluate('__essai.tirs'); print(q, t)
        if t: photo('note-' + q, t[-1]['x'], t[-1]['y'], t[-1]['z'], 110)
        pg.evaluate('__essai.avancer(1.6)')
    pg.screenshot(path='/tmp/sorts/salle.png')
    # le soin
    pg.evaluate("__essai.lancer('soin')"); pg.evaluate('__essai.avancer(1.2)'); hh = pg.evaluate('[__essai.h.x, __essai.h.y]'); photo('soin-grattage', hh[0], hh[1], 0.9, 120)
    pg.evaluate('__essai.avancer(1.2)'); photo('soin-1', hh[0], hh[1], 0.9, 120)
    pg.evaluate('__essai.avancer(0.35)'); photo('soin-2', hh[0], hh[1], 0.9, 120)
    pg.evaluate('__essai.avancer(1.5)')
    # le saut : vers la droite, pouce poussé
    pg.evaluate('__essai.h.x = 5; __essai.h.y = 7.5; __essai.joy.mx = 1; __essai.joy.my = 0; __essai.avancer(1.0)')
    x0 = pg.evaluate('__essai.h.x'); pg.evaluate('__essai.sauter(1, 0)'); suite = []
    for k in range(14):
        pg.evaluate('__essai.avancer(1/15)'); r = pg.evaluate('[__essai.h.x, __essai.pieds(), !!__essai.h.saut, __essai.h.sautR]')
        suite.append((round(r[0] - x0, 2), round(min(v[2] for v in r[1].values()), 2), r[2], round(r[3], 2)))
        if k in (3, 6, 9, 12): photo('saut-%d' % k, r[0], 7.5, 0.8, 120)
    print('saut (avancée, pied le plus bas, en l\'air, recharge) :', suite)
    pg.evaluate('__essai.joy.mx = 0; __essai.avancer(1)')
    print('erreurs', err[:5]); b.close()
