# essai_salle_p.py : le Pisteur dans sa salle peinte (28 novembre) : vue d'ensemble, derrière / devant les obstacles,
# près des cristaux (sa lumière, son ombre), les portes des renforts. Le temps du jeu pas à pas (window.__pilote).
# Servir site/ sur le port 8766 (python3 outils/serveur_csp.py site 8766), puis : python3 outils/essai_salle_p.py [sortie.png]
import time, sys, os, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
W, H, DSF = 844, 390, 2
os.makedirs('/tmp/salle_p', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e))); pg.on('console', lambda m: err.append(m.text[:200]) if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html'); pg.evaluate("choisir('pisteur')")
    for i in range(240):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    print('prêt', pg.evaluate('!!(window.__essai&&window.__essai.pret)'), err[:3])
    av = lambda s: pg.evaluate('__essai.avancer(%f)' % s)
    photos = []
    def place(x, y, a=-1.5708):
        pg.evaluate('__essai.h.x = %f; __essai.h.y = %f; __essai.h.a = %f; __essai.joy.mx = 0; __essai.joy.my = 0' % (x, y, a)); av(0.6)
    def photo(titre, plein=False, r=150):
        pg.screenshot(path='/tmp/salle_p/_.png'); im = Image.open('/tmp/salle_p/_.png').convert('RGB')
        if plein: c = im.resize((844, 390))
        else:
            e = pg.evaluate('__essai.ecran(__essai.h.x, __essai.h.y, 0.8)'); x, y = e['x'] * DSF, e['y'] * DSF
            c = im.crop((int(x - r * DSF), int(y - r * DSF * 0.9), int(x + r * DSF), int(y + r * DSF * 0.9))).resize((300, 270))
        ImageDraw.Draw(c).text((6, 4), titre, fill='yellow'); photos.append(c)
    pg.evaluate('window.__pilote = true; __essai.taille()')
    SJ = pg.evaluate('__essai.SJ'); OB = {o['nom']: o for o in SJ['objets']}
    def boite(n):
        o = OB[n]
        if o.get('rond'): return o['x'], o['y'] - o['r'], o['y'] + o['r']
        xs = [q[0] for q in o['poly']]; ys = [q[1] for q in o['poly']]; return (min(xs) + max(xs)) / 2, min(ys), max(ys)
    libre = lambda x, y: pg.evaluate('__essai.libre(%f, %f)' % (x, y))
    def pres(x, y):   # la case libre la plus proche
        for r in [0, 0.2, 0.4, 0.6, 0.8]:
            for dx, dy in [(0, 0), (r, 0), (-r, 0), (0, -r), (0, r)]:
                if libre(x + dx, y + dy): return x + dx, y + dy
        return x, y
    d = SJ['depart']; place(d['x'], d['y']); photo('départ (vue du jeu)', plein=True)
    pg.evaluate('window.__zoom = 0.34; __essai.taille()'); av(0.3); photo('toute la salle', plein=True)
    pg.evaluate('window.__zoom = 1.8; __essai.taille()')
    for n in ['pilier_av_g', 'pan_g', 'pan_d', 'tonneaux', 'muret_d', 'caisse_av_d', 'chariot', 'bric_caisses']:
        x, y0, y1 = boite(n)
        place(*pres(x, y0 - 0.55), 1.57); photo('derrière ' + n)
        if n in ('pilier_av_g', 'pan_g', 'caisse_av_d'): place(*pres(x, y1 + 0.5), -1.57); photo('devant ' + n)
    for L in SJ['lumieres']:
        if L['nom'] in ('pilier_fd_g', 'pilier_av_d', 'torche_g'): place(*pres(L['x'] + 1.2, L['y'] + 1.0), -1.57); photo('près de la lumière ' + L['nom'])
    # contre les murs : son ombre doit monter sur le mur, pas passer derrière
    place(*pres(15.5, 1.0), -1.57); photo('contre le mur du fond')
    place(*pres(2.3, 9.0), 0); photo('contre le mur de gauche')
    # le mur du bas : on pousse vers nous 2 s ; on ne doit pas monter dessus
    place(*pres(12.6, 17.0), -1.57); pg.evaluate('__essai.joy.mx = 0; __essai.joy.my = 1'); av(2.5); pg.evaluate('__essai.joy.my = 0'); av(0.2)
    yb = pg.evaluate('__essai.h.y'); photo('poussé vers le mur du bas : y=%.2f' % yb); print('mur du bas : le héros s\'arrête à y =', round(yb, 2), '(dos du mur', SJ['murBas']['y0'], ')')
    # les coins des baignoires
    for (t, x, y) in [('coin baignoire g', 3.0, 19.6), ('coin baignoire d', 28.6, 19.6)]:
        place(*pres(x, y), -1.57); photo(t + (' (libre)' if libre(pg.evaluate('__essai.h.x'), pg.evaluate('__essai.h.y')) else ' (BLOQUÉ)'))
    pr = SJ['portes'][0]; place(*pres(pr['x'], pr['y'] + 1.2), -1.57); pg.evaluate('__essai.renforts(0)'); av(1.0); photo('porte g : alerte', r=220); av(1.5); photo('porte g : ouverte', r=220); av(4.0); photo('porte g : refermée', r=220)
    place(*pres(15.5, 11.0)); pg.evaluate('__essai.joy.mx = 1; __essai.joy.my = 0'); av(1.2); photo('course vers la droite')
    n = len(photos); S = Image.new('RGB', (844 * 2, 390 * 2 + 270 * ((n - 2 + 5) // 6)), (0, 0, 0))
    S.paste(photos[0], (0, 0)); S.paste(photos[1], (844, 0)); S2 = photos[0]
    for i, c in enumerate(photos[2:]): S.paste(c, (300 * (i % 6) - 0, 390 + 270 * (i // 6)))
    S = S.crop((0, 0, 1800, 390 + 270 * ((n - 2 + 5) // 6)))
    S.save(sys.argv[1] if len(sys.argv) > 1 else '/tmp/salle_p/planche.png'); print('erreurs', err[:5]); b.close()
