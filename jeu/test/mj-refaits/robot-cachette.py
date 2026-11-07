# Robot : joue « Se cacher » dans la salle (choisit une cachette sûre, la plus haute possible) ; captures à chaque pièce.
import sys, time
from playwright.sync_api import sync_playwright
salle, n, var, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
parties = int(sys.argv[5]) if len(sys.argv) > 5 else 1
res = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for k in range(parties):
        pg = b.new_page(viewport={'width': 420, 'height': 860})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        url = 'file://' + salle + '#jeu=cachette&n=' + n + ('' if var == '-' else '&v=' + var)
        pg.goto(url); pg.wait_for_timeout(1200)
        pg.locator('.mj-go').first.click(); pg.wait_for_timeout(600)
        salle_vue = -1; t0 = time.time(); attente = 0
        while time.time() - t0 < 200:
            if pg.locator('.mj-resultat').count():
                break
            e = pg.evaluate("() => { var t = document.querySelector('.mja-terrain'); return t && t.mjaEtat ? t.mjaEtat() : null; }")
            if not e: pg.wait_for_timeout(200); continue
            if e.get('salle', 0) != salle_vue and not e.get('passage', False) and k == 0:
                salle_vue = e.get('salle', 0); pg.wait_for_timeout(900); pg.screenshot(path=f'{out}-salle{salle_vue}.png')
            if not e['course'] and not e.get('passage', False):
                ici = e['couv'][e['ici']]
                sures = [c for c in e['couv'] if c['acc'] and c['sur']]
                presse = e.get('chasse') or (e.get('odeur') is not None and e['odeur'] > 0.8)
                if sures:
                    sures.sort(key=lambda c: (c['porte'], c['k'], -abs(c['x'] - 180)), reverse=True)
                    best = sures[0]
                    if best['k'] > ici['k'] or best['porte'] or attente > 25 or presse:
                        pg.evaluate(f"() => document.querySelector('.mja-terrain').mjaCourir({best['i']})"); attente = 0
                    else: attente += 1
                else: attente += 1
            pg.wait_for_timeout(120)
        ok = pg.locator('.mj-resultat.ok').count() > 0
        detail = pg.locator('.mj-resultat p.doux').first.inner_text() if pg.locator('.mj-resultat p.doux').count() else '?'
        if k == 0: pg.screenshot(path=f'{out}-fin.png')
        res.append((ok, round(time.time() - t0), detail, errs[:2]))
        pg.close()
    b.close()
for r in res: print(r)
print('réussies', sum(1 for r in res if r[0]), '/', len(res))
