"""« Suivre les traces » (mj-pistage.js), dans la salle des mini-jeux : le nouveau mini-jeu des traces de Moustache (13 novembre).
Pour trois niveaux et deux écrans : l'explication en images et son bouton jaune ; le quartier (toutes les traces sont dans les rues,
chaque bout de piste s'atteint à pied) ; le nombre de fausses pistes et Noisette selon le niveau ; le Pisteur marche vers le doigt et
s'arrête quand on le lève ; on perd au bout d'une mauvaise piste (le jeu dit quel chat c'était), on gagne à la grille de la crypte.
   BRUMEVAL_DIST=<dossier construit> python3 tools/pistage.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
OUT = os.path.join(ICI, '..', 'test', 'pistage'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)
Z = "document.querySelector('.pg').__pistage"
def partie(b, niv, w, h, fin):
    print(f'— niveau {niv}, écran {w} × {h}, {fin}')
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True).new_page(); pg.set_default_timeout(9000)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and 'fonts' not in m.text else None)
    pg.goto('file://' + DIST + f'/salle-mini-jeux.html#jeu=pistage&n={niv}'); pg.wait_for_timeout(900)
    verifier(pg.locator('.mj-go').count() == 1 and pg.locator('.mj-demo canvas, .mj-intro canvas, canvas').count() >= 1, 'l\'explication en images, et le bouton jaune')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-accueil.png')
    pg.locator('.mj-go').first.click(); pg.wait_for_timeout(4300)
    info = pg.evaluate(f"""() => {{ var z = {Z}, M = z.monde; return {{pistes:M.pistes.map(function(P){{ return [P.chat, !!P.bon]; }}), fins:M.fins.length, traces:M.traces.length, ech:z.etat().ech,
      hors:M.traces.filter(function(T){{ return !M.rues.some(function(r){{ return T.x >= r.x && T.x <= r.x + r.w && T.y >= r.y && T.y <= r.y + r.h; }}); }}).length,
      ok:M.fins.map(function(F){{ return z.libre(F.x, F.y); }}).concat([z.libre(M.eglise.fx, M.eglise.fy), z.libre(M.depart.x, M.depart.y)]),
      lieux:M.fins.map(function(F){{ return F.lieu; }})}}; }}""")
    faux = 3 if niv <= 3 else 4 if niv <= 6 else 5 if niv <= 8 else 6
    chats = [c for c, bon in info['pistes']]
    verifier(info['pistes'][0] == ['moustache', True] and info['fins'] == faux and len(set(chats)) == faux + 1, f'la piste de Moustache et {faux} fausses pistes, un chat différent chacune ({chats})')
    verifier(('noisette' in chats) == (niv >= 5), 'Noisette (cinq doigts) seulement à partir du niveau 5')
    verifier(info['hors'] == 0 and all(info['ok']), f'toutes les traces sont dans les rues ({info["traces"]}), et chaque bout de piste s\'atteint à pied')
    verifier(len(set(info['lieux'])) == len(info['lieux']) and info['lieux'].count('voisin') == 1, f'chaque fausse piste finit ailleurs ({info["lieux"]})')
    verifier(5.1 * info['ech'] * 2 <= 40, f'les traces sont petites : {round(5.1 * info["ech"] * 2)} points d\'écran de large')
    verifier(pg.locator('.pg-dit .mj-lire-mini, .pg-dit button').count() >= 1 and 'suit ton doigt' in pg.inner_text('.pg-dit'), 'la bulle du conteur, avec son 🔊')
    # marcher : le doigt posé sous le Pisteur, il descend ; le doigt levé, il s'arrête
    bx = pg.evaluate("() => { var r = document.querySelector('.pg').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    y0 = pg.evaluate(f"() => {Z}.etat().y")
    pg.mouse.move(bx[0], bx[1] + min(110, h * .2)); pg.mouse.down(); pg.wait_for_timeout(1500)   # (sur un téléphone couché, plus bas, c'est la bulle du conteur)
    y1 = pg.evaluate(f"() => {Z}.etat().y"); pg.screenshot(path=f'{OUT}/n{niv}-{w}-marche.png'); pg.mouse.up(); pg.wait_for_timeout(500)
    y2 = pg.evaluate(f"() => {Z}.etat().y"); pg.wait_for_timeout(500); y3 = pg.evaluate(f"() => {Z}.etat().y")
    verifier(y1 - y0 > 60 and abs(y3 - y2) < 1, f'le Pisteur marche vers le doigt ({round(y1 - y0)} en 1,5 s) et s\'arrête quand on le lève')
    verifier(pg.locator('.pg-dit').is_hidden(), 'dès qu\'on marche, la bulle s\'en va')
    # contre un mur : il ne traverse pas les maisons
    pg.mouse.move(bx[0] - 140, bx[1]); pg.mouse.down(); pg.wait_for_timeout(1800); pg.mouse.up()
    e = pg.evaluate(f"() => {{ var z = {Z}, e = z.etat(); return z.libre(e.x, e.y); }}")
    verifier(e, 'il reste dans la rue (les maisons ne se traversent pas)')
    if fin == 'perdu':
        pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.x - F.dx * 50, F.y - F.dy * 50); }}"); pg.wait_for_timeout(300)
        verifier(not pg.evaluate(f"() => {Z}.etat().fini"), 'à l\'entrée de l\'impasse : pas encore perdu')
        pg.screenshot(path=f'{OUT}/n{niv}-{w}-impasse.png')
        pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.x, F.y); }}"); pg.wait_for_timeout(3000)
        t = pg.inner_text('.mj-resultat')
        nom = pg.evaluate(f"() => CHATS.par[{Z}.monde.fins[0].chat].nom")
        verifier('pas Moustache' in t and nom in t, f'au bout d\'une mauvaise piste : perdu, et le jeu dit quel chat c\'était ({t[:90]!r})')
    else:
        pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx - E.dx * 60, E.fy - E.dy * 60); }}"); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{OUT}/n{niv}-{w}-eglise.png')
        pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx, E.fy); }}"); pg.wait_for_timeout(2600)
        t = pg.inner_text('.mj-resultat')
        verifier('crypte' in t.lower() and pg.locator('.mj-resultat.ok').count() == 1, f'à la grille de la crypte : gagné ({t[:70]!r})')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-fin.png')
    pg.context.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    partie(b, 3, 393, 760, 'perdu')
    partie(b, 6, 1180, 820, 'gagné')
    partie(b, 9, 852, 393, 'gagné')
    b.close()
print('ÉCHECS :', echecs)
print('ERREURS :', erreurs[:10])
sys.exit(1 if echecs or erreurs else 0)
