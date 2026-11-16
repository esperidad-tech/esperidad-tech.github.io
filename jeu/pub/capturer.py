"""La pub : filmer les extraits du jeu (de vraies images du jeu construit, DIST, et du donjon en ligne dans le dépôt du site).
   python3 capturer.py [plan …]   (sans rien : tous)   → /tmp/pub/plans/<plan>/0000.jpg …   Un robot à la fois (flock /tmp/brumeval-pw.lock)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from outils import *
from playwright.sync_api import sync_playwright
J = 'file://' + DIST + '/index.html'; SA = 'file://' + DIST + '/salle-mini-jeux.html'
ZONE = """() => { var best = null; document.querySelectorAll('canvas, svg, div').forEach(function(e){ var r = e.getBoundingClientRect(); if(r.top >= 100 && r.bottom <= innerHeight + 2 && r.width >= 600 && r.height >= 250){ var a = r.width * r.height; if(!best || a > best.a) best = {a:a, x:r.x, y:r.y, width:r.width, height:r.height}; } }); return best; }"""
def cadre(z, ratio=1440 / 616.):
    """le plus grand rectangle au bon format, au milieu de la zone"""
    w, h = z['width'], z['height']
    if w / h > ratio: nw = h * ratio; return {'x': z['x'] + (w - nw) / 2, 'y': z['y'], 'width': nw, 'height': h}
    nh = w / ratio; return {'x': z['x'], 'y': z['y'] + (h - nh) / 2, 'width': w, 'height': nh}
def accueil(b):
    pg = page(b, 800, 500, 1.8); pg.goto(J); pg.wait_for_timeout(1200); photo(pg, 'accueil')
    pg.click('[data-act=creer]'); pg.wait_for_timeout(700); photo(pg, 'roles'); pg.context.close()
def les_heros(b):
    for i, (role, nom) in enumerate([('pisteur', 'Zoé'), ('alchimiste', 'Tom'), ('barde', 'Inès'), ('sage', 'Noé')]):
        pg = page(b, 800, 500, 2.4); heros(pg, nom, role, J); pg.wait_for_timeout(1200)
        r = pg.evaluate("() => { var best = null; document.querySelectorAll('div').forEach(function(e){ var r = e.getBoundingClientRect(); if(r.x < 60 && r.width > 150 && r.width < 420 && r.height > 380 && (!best || r.width * r.height < best.width * best.height)) best = {x:r.x, y:r.y, width:r.width, height:r.height}; }); return best; }")
        print('héros', role, r); photo(pg, 'heros', i, r); pg.context.close()
def carte(b):
    c = page(b, 1100, 760, 1.5); heros(c, 'Inès', 'barde', J + '#test'); enquete(c, 2, 1); c.click('[data-act=onglet][data-o=carte]', force=True); c.wait_for_timeout(1500)
    c.mouse.move(550, 400)
    for i in range(5): c.mouse.wheel(0, -260); c.wait_for_timeout(250)
    c.wait_for_timeout(900); photo(c, 'carte', 0, {'x': 0, 'y': 46, 'width': 1100, 'height': 650}); c.context.close()
def tables(b):
    for nom, f in [('labo', 'labo.html'), ('etabli', 'etabli.html')]:
        q = page(b, 1000, 428, 1.44); q.goto('file://' + DIST + '/' + f); q.wait_for_timeout(2500)
        q.evaluate("() => { document.querySelectorAll('button, div, a').forEach(function(e){ if(e.children.length < 3 && /^\\s*Maquette/.test(e.textContent || '')) e.style.display = 'none'; }); }")
        q.wait_for_timeout(300); photo(q, nom); q.context.close()
def gateau(b):
    q = page(b, 1000, 640, 1.5); q.goto(SA + '#jeu=gateau'); q.wait_for_timeout(1000); q.locator('.mj-go').first.click(force=True); q.wait_for_timeout(1200)
    z = q.evaluate("() => { var r = document.querySelector('.gt svg').getBoundingClientRect(); return {x:r.x, y:r.y, width:r.width, height:r.height}; }"); clip = cadre(z); n = [0]
    def clic(sel): q.click(sel, force=True); q.wait_for_timeout(110)
    def ouvrir(c):
        if not q.evaluate("(c) => document.querySelector('.gt-ic[data-c=' + c + ']').classList.contains('on')", c): clic('.gt-ic[data-c=%s]' % c)
    def image():
        q.evaluate("() => { document.querySelectorAll('.gt-col, .gt-bas, .gt-conteur, .gt-plateau').forEach(function(e){ e.style.visibility = 'hidden'; }); }")
        q.wait_for_timeout(260); photo(q, 'gateau', n[0], clip); n[0] += 1
        q.evaluate("() => { document.querySelectorAll('.gt-col, .gt-bas, .gt-conteur, .gt-plateau').forEach(function(e){ e.style.visibility = ''; }); }")
    def etat(): return q.evaluate("() => JSON.parse(JSON.stringify(document.querySelector('.gt').__gateau.etat()))")
    image()
    ouvrir('etages')
    for i in range(3): clic('.gt-plateau .gt-bulle[aria-label="Étage en plus"]'); image(); ouvrir('etages')
    # les décorations : la bulle la fait arriver sur le gâteau, puis on la glisse à sa place (des places choisies autour des étages)
    et = q.evaluate("() => Array.from(document.querySelectorAll('.gt-etage')).map(function(e){ var r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })")
    et.sort(key=lambda r: r[1]); print('étages', [[round(v) for v in r] for r in et])
    haut = et[0]; places = [(haut[0] + haut[2] / 2, haut[1] - 6)]
    for r in et[1:]: places += [(r[0] + 16, r[1] - 4), (r[0] + r[2] - 16, r[1] - 4)]
    places += [(et[-1][0] - 40, et[-1][1] + et[-1][3] - 6), (et[-1][0] + et[-1][2] + 40, et[-1][1] + et[-1][3] - 6), (et[2][0] + et[2][2] / 2, et[2][1] + et[2][3] / 2), (et[3][0] + et[3][2] * .3, et[3][1] + et[3][3] / 2), (et[3][0] + et[3][2] * .7, et[3][1] + et[3][3] / 2)]
    k = 0
    for cat in ['fete', 'fruits', 'bonbons', 'fleurs', 'farfelu', 'chantilly', 'fete', 'fruits', 'fleurs', 'bonbons', 'farfelu', 'fete']:
        if k >= len(places): break
        ouvrir(cat); noms = q.evaluate("() => Array.from(document.querySelectorAll('.gt-plateau .gt-bulle')).map(function(e){ return e.getAttribute('aria-label'); })")
        n0 = len(etat()['decos']); nom = noms[(k * 3 + 1) % len(noms)]; clic('.gt-plateau .gt-bulle[aria-label="%s"]' % nom); q.wait_for_timeout(200)
        e = etat()
        if len(e['decos']) <= n0: continue
        clic('.gt-ic[data-c=%s]' % cat)                                                  # (on range les bulles)
        c0 = q.evaluate("(id) => { var e = document.querySelector('.gt-deco[data-id=\\\"' + id + '\\\"] .gt-prise'); if(!e) return null; var r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }", e['decos'][-1]['id'])
        if c0:
            a, bb = c0, places[k]; q.mouse.move(a[0], a[1]); q.mouse.down()
            for i in range(1, 9): q.mouse.move(a[0] + (bb[0] - a[0]) * i / 8, a[1] + (bb[1] - a[1]) * i / 8); q.wait_for_timeout(12)
            q.mouse.up(); q.wait_for_timeout(150)
        k += 1; image()
    print('gâteau :', n[0], 'images'); q.context.close()
def mini(b, nom, h, duree, tenir=None, attente=3500):
    q = page(b, 1000, 640, 1.5, ralenti=True); q.goto(SA + h); q.wait_for_timeout(1000); q.locator('.mj-go').first.click(force=True); q.wait_for_timeout(attente)
    z = q.evaluate(ZONE); print(nom, 'zone', z); clip = cadre(z)
    if tenir: q.mouse.move(z['x'] + z['width'] * tenir[0], z['y'] + z['height'] * tenir[1]); q.mouse.down(); q.wait_for_timeout(400)
    lent(q, .22); filmer(q, nom, duree, clip); q.context.close()
def donjon(b, nom, h, duree, attente, clip, geste=None):
    U = serveur(SITE); d = page(b, 800, 500, 1.8, ralenti=True); d.goto(U + h)
    if attente < 0: d.wait_for_selector('#combat.ouvert', timeout=90000); d.wait_for_timeout(-attente)      # (Léo : dès que le combat s'ouvre)
    else: d.wait_for_timeout(attente)
    if geste:
        try: d.locator('#bande button', has_text=geste).first.click(force=True, timeout=3000)
        except Exception as e: print('geste', geste, 'pas trouvé :', d.evaluate("() => Array.from(document.querySelectorAll('#bande button')).map(function(e){ return e.textContent.trim().slice(0, 14); }).slice(0, 20)"))
    # (on ne garde que la scène : la bande des sorts et la barre du haut sont cachées — le nom du chef n'apparaît pas dans la pub)
    d.evaluate("() => { ['bande', 'haut'].forEach(function(i){ var c = document.getElementById(i); if(c) c.style.visibility = 'hidden'; }); }")
    lent(d, .2); filmer(d, nom, duree, clip); d.context.close()
def cine(b):
    """les quatre extraits de cinématiques : 40 images (1,33 s) prises dans les films déjà faits (jeu/cine/sortie), sans navigateur.
       L'homme en cape n'est jamais nommé et on ne voit jamais son visage (le nom de Léo ne sort pas avant la nuit de l'enquête 3)."""
    import subprocess
    C = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'cine', 'sortie')
    for nom, film, t in [('cine-marche', 'chene', 4.0), ('cine-allumette', 'chene', 19.55), ('cine-fumee', 'chene', 25.2), ('cine-cape', 'entree', 5.8)]:
        d = os.path.join(PLANS, nom); os.makedirs(d, exist_ok=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', os.path.join(C, film + '.mp4'), '-frames:v', '40', '-start_number', '0', '-q:v', '2', os.path.join(d, '%04d.jpg')], check=True)
        print(nom, len(os.listdir(d)), 'images')
PLANS_ = {
    'accueil': accueil, 'heros': les_heros, 'carte': carte, 'tables': tables, 'gateau': gateau, 'cine': cine,
    'pistage': lambda b: mini(b, 'pistage', '#jeu=pistage&n=6&v=apresmidi', 1.6, tenir=(.5, .2)),
    'cachette': lambda b: mini(b, 'cachette', '#jeu=cachette&n=6', 1.4, attente=5000),
    'visee': lambda b: mini(b, 'visee', '#jeu=visee&n=5', .6),
    'cape': lambda b: donjon(b, 'cape', 'donjon/?leo=1', 3.0, -900, {'x': 0, 'y': 9, 'width': 800, 'height': 342}, 'Feu'),
    'bourbe': lambda b: donjon(b, 'bourbe', 'donjon/?combat=bassin&potions=toutes', 1.4, 12000, {'x': 0, 'y': 9, 'width': 800, 'height': 342}),
}
if __name__ == '__main__':
    quoi = sys.argv[1:] or list(PLANS_)
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for n in quoi:
            try: PLANS_[n](b)
            except Exception as e: print('RATÉ', n, ':', str(e)[:300])
        b.close()
