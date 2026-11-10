"""La mémoire pendant le critique, sur iPhone (RAPIDITE.md R9 : « ça quitte le jeu » quand un calque est trop grand).

    flock /tmp/brumeval-pw.lock python3 memoire-critique.py

Émulation iPhone couché (844 x 390, densité 3, tactile). On joue l'Huile puis la flèche du Pisteur : le critique.
Pendant tout le critique, toutes les 60 ms, on relève (même relevé que anim/heros/memoire.py) :
  - le plus grand côté « réel » d'un élément animé (taille x échelles x densité) : R9, jamais plus de 4 096 px ;
  - la mémoire des toiles (canvas) vivantes : elles doivent être vidées après usage ;
  - le nombre d'éléments animés en même temps.
Sort avec le code 1 si R9 n'est pas respectée."""
import os, re, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'salle-rats.html')
DPR = 3
RELEVE = re.search(r'RELEVE = """(.*?)"""', open(os.path.join(ICI, '..', 'anim', 'heros', 'memoire.py'), encoding='utf-8').read(), re.S).group(1).replace('\\\\', '\\')

with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.goto(PAGE); pg.wait_for_timeout(700)
    pg.evaluate("() => { var s = 7; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }")

    def libre():
        for _ in range(300):
            if pg.evaluate("() => (SALLE.etat.mode === 'qui' && !SALLE.etat.occupe)"):
                break
            pg.wait_for_timeout(100)
        pg.wait_for_timeout(150)

    def joue(h, g, c):
        pg.tap(f'.zone[data-type="heros"][data-id="{h}"]', force=True); pg.wait_for_timeout(250)
        pg.tap(f'.carte[data-id="{g}"]', force=True); pg.wait_for_timeout(250)
        pg.tap(f'.zone[data-type="rat"][data-id="{c}"]', force=True)

    for r in ['feu', 'huile', 'baume']:
        pg.tap(f'.recette[data-id="{r}"] b', force=True); pg.wait_for_timeout(120)
    pg.tap('[data-act="descendre"]', force=True); libre()
    repos = pg.evaluate(RELEVE, DPR)
    joue('alchimiste', 'p:huile', 0); libre()
    joue('pisteur', 'fleche', 0)
    pg.wait_for_selector('.ra-scene-fx, .crit-texte', state='attached', timeout=15000)
    pire, toiles, animes = {'px': 0, 'quoi': ''}, 0, 0
    for _ in range(60):
        r = pg.evaluate(RELEVE, DPR)
        if r['pire']['px'] > pire['px']:
            pire = r['pire']
        toiles = max(toiles, r['toiles'])
        animes = max(animes, pg.evaluate("() => document.querySelectorAll('.ra-scene-fx > *').length"))
        pg.wait_for_timeout(60)
    pg.wait_for_timeout(1500)
    fin = pg.evaluate(RELEVE, DPR)
    pg.screenshot(path=os.path.join(ICI, 'captures', 'iphone-apres-critique.png'))
    ctx.close(); nav.close()

print('au repos            : plus grand calque réel %d px (%s), toiles %.1f Mo' % (repos['pire']['px'], repos['pire']['quoi'], repos['toiles'] / 1e6))
print('pendant le critique : plus grand calque réel %d px (%s), toiles %.1f Mo, %d morceaux d\'effet au plus' % (pire['px'], pire['quoi'], toiles / 1e6, animes))
print('après               : toiles %.1f Mo' % (fin['toiles'] / 1e6))
print('erreurs :', err or 'aucune')
ok = pire['px'] <= 4096 and fin['toiles'] <= repos['toiles'] and not err
print('R9 :', 'respectée' if ok else 'NON RESPECTÉE')
sys.exit(0 if ok else 1)
