"""Le labo dans le jeu, la toute première fois (enquête 1, tutoriel) : l'explication en images, puis le guide de la première analyse.
Un robot ouvre le labo avec les poils de la fenêtre, regarde l'explication, appuie sur le bouton jaune, puis suit le guide pas à pas :
il touche ce que le rond jaune entoure (au doigt) ; quand le guide ne montre rien (« compare », « cherche »), il fait ce qu'un joueur ferait
(choisir le bon échantillon, attraper avec la pince). Il vérifie : l'explication s'ouvre une seule fois (pas à la deuxième entrée),
chaque étape a sa phrase (jamais « Touche »), le rond est sur sa cible, le dossier est bouclé, le guide s'arrête ; pas d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/labo-guide.py [iphone|tablette]"""
import os, sys, json
from playwright.sync_api import sync_playwright
D = os.environ.get('BRUMEVAL_DIST', os.path.join(os.path.dirname(__file__), '..', 'dist'))
APP = sys.argv[1] if len(sys.argv) > 1 else 'tablette'
ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'labo-guide'); os.makedirs(ICI, exist_ok=True)
echecs, etapes = [], []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(**(p.devices['iPhone 13 landscape'] if APP == 'iphone' else {'viewport': {'width': 1180, 'height': 820}, 'has_touch': True}))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.abspath(os.path.join(D, 'index.html'))); pg.wait_for_timeout(600)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    # le tutoriel reste actif (le guide en dépend) ; on dit seulement que c'est le tour des poils (comme après l'encre)
    pg.evaluate("() => { M.tutoPermet = function(){ return true; }; M.P().recus['obj:fil'] = 1; M.sauver(); }")
    if not pg.evaluate("() => M.tutoActif()"): echecs.append('le tutoriel n\'est pas actif')
    def ouvrir():
        pg.evaluate("() => M.ouvrirLabo()"); pg.wait_for_timeout(1500)
        f = next((x for x in pg.frames if x.parent_frame is not None), None)
        f.wait_for_function('() => !!window.__labo', timeout=8000); f.evaluate("() => { window.__labo.mimi.calme = true; }")
        return f
    f = ouvrir()
    # ---- l'explication en images ----
    n_img = f.locator('.intro img').count(); n_son = f.locator('.intro .b-son').count(); go = f.locator('.intro-go')
    if n_img != 4 or n_son != 4 or not go.count(): echecs.append(f'explication : {n_img} images, {n_son} 🔊, bouton jaune {go.count()}')
    if f.locator('.guide-bandeau').count(): echecs.append('le guide parle par-dessus l\'explication')
    pg.screenshot(path=f'{ICI}/{APP}-00-intro.png')
    if go.count(): bx = go.bounding_box(); pg.touchscreen.tap(bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] / 2); pg.wait_for_timeout(900)
    if f.locator('.intro').count(): echecs.append('l\'explication ne se ferme pas')
    if not pg.evaluate("() => M.S.laboIntro"): echecs.append('le jeu n\'a pas noté l\'explication vue')
    # ---- le guide, pas à pas ----
    etat = lambda: f.evaluate("() => { var S = window.__labo.etat(); return {mode:S.mode, sel:S.sel, zoom:S.zoom, trouves:S.trouves, finis:S.finis, tiroir:S.tiroir, casier:S.casier, occupe:S.occupe}; }")
    vu, photo = set(), 1
    for k in range(160):
        if not pg.evaluate("() => !!document.getElementById('labo-cadre')"): break      # (le dernier pas du guide : retour à l'atelier)
        try: g = f.evaluate("() => window.__labo.guide()")
        except Exception: break
        if not g: echecs.append('pas de guide'); break
        if g['fini']: break
        e = etat()
        if e['occupe'] or not g['cle']: pg.wait_for_timeout(250); continue
        if g['cle'] not in vu:
            vu.add(g['cle']); etapes.append((g['cle'], g['t']))
            if 'Touche' in g['t']: echecs.append(f'« Touche » dans : {g["t"]}')
            if '🔊' not in g['t'] and len(g['t'].split()) > 3: echecs.append(f'pas de 🔊 : {g["t"]}')
            pg.wait_for_timeout(450); pg.screenshot(path=f'{ICI}/{APP}-{photo:02d}-{g["cle"]}.png'); photo += 1
        if g['c']:
            if not g['rond']: pg.wait_for_timeout(300); g = f.evaluate("() => window.__labo.guide()")
            if not g['rond']: echecs.append(f'pas de rond sur {g["c"]} ({g["cle"]})')
            # au doigt, au milieu du rond (comme un enfant)
            r = f.evaluate("() => { var r = document.querySelector('.guide-rond').getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2}; }")
            cad = pg.locator('#labo-cadre').bounding_box()
            pg.touchscreen.tap(cad['x'] + r['x'], cad['y'] + r['y']); pg.wait_for_timeout(1200)
        elif g['cle'].startswith('comp-'):
            t = g['cle'][5:]
            bon = f.evaluate("t => { var o = window.__labo.objets[t]; return o.tiroir + ':' + o.bon; }", t)
            f.click(f'[data-ech="{bon}"]', force=True); pg.wait_for_timeout(2600)
        elif g['cle'] == 'cherche':
            gi = f.evaluate("() => { var S = window.__labo.etat(), it = S.dos[S.dc].items[S.zoom].filter(function(i){ return !i.pris && !(i.min > S.zoom) && i.t === window.__labo.objets[S.dc].requis[1]; }); return it.length ? {x:it[0].x, y:it[0].y} : null; }")
            if not gi: echecs.append('rien à attraper au microscope'); break
            f.evaluate("g => { var S = window.__labo.etat(); S.cx = g.x; S.cy = g.y; window.__labo.rendre(); }", gi); pg.wait_for_timeout(200)
            bx = f.locator('#lentille').bounding_box()   # (déjà en coordonnées de la page ; la vue a pu être retenue au bord : on vise le grain, pas le milieu)
            Sv = f.evaluate("() => ({cx:window.__labo.etat().cx, cy:window.__labo.etat().cy})"); kk = max(1, bx['width'] / 560)
            pg.mouse.click(bx['x'] + bx['width'] / 2 + (gi['x'] - Sv['cx']) * kk, bx['y'] + bx['height'] / 2 + (gi['y'] - Sv['cy']) * kk); pg.wait_for_timeout(1200)
        else:
            pg.wait_for_timeout(300)
    vus_cles = [c for c, _ in etapes]
    for attendu in ('quitter',):
        if attendu not in vus_cles: echecs.append(f'étape « {attendu} » jamais montrée')
    if 'ard' in vus_cles: echecs.append('le guide parle encore de l\'ardoise (enlevée le 13 novembre, Bible §13.35)')
    if not pg.evaluate("() => !document.getElementById('labo-cadre')"): echecs.append('le labo ne s\'est pas refermé à la fin du guide')
    pg.wait_for_timeout(800); pg.screenshot(path=f'{ICI}/{APP}-99-fiche.png')
    if pg.evaluate("() => M.P().analyses.fil || 0") < 1: echecs.append('analyse non notée dans la partie')
    # ---- une deuxième entrée : plus d'explication, plus de guide (une analyse est faite) ----
    pg.evaluate("() => { if(M.fermer) M.fermer(); }"); pg.wait_for_timeout(500)
    f = ouvrir()
    if f.locator('.intro').count(): echecs.append('l\'explication revient à la deuxième entrée')
    if f.evaluate("() => window.__labo.guide()"): echecs.append('le guide revient alors qu\'une analyse est faite')
    if errs: echecs.append(f'erreurs : {errs[:3]}')
    b.close()
print(f'{APP} : {len(etapes)} étapes du guide')
for c, t in etapes: print(f'  {c:12s} {t}')
print('tout est bon' if not echecs else 'ÉCHECS : ' + json.dumps(echecs, ensure_ascii=False))
