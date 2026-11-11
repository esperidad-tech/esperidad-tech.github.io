"""Enquête 3 en construction : le Pisteur, l'Alchimiste et le Sage entrent dans l'enquête sans rien casser (Playwright).
Tant que leurs étapes ne sont pas construites (Bible § 13.14 : 3, 4 et 5), ce robot vérifie seulement que tout s'ouvre :
la lettre, l'écran des missions, les quatre onglets, quelques lieux de la carte, le code de l'après-midi, et pour le Sage son Grand Livre.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-roles.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-roles'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(120)

with sync_playwright() as p:
    b = p.chromium.launch()
    for role in ['pisteur', 'alchimiste', 'sage']:
        print('—', role)
        pg = b.new_context(viewport={'width': 1180, 'height': 820}).new_page()
        pg.set_default_timeout(8000)
        pg.on('console', lambda m, r=role: erreurs.append(f'[{r}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
        pg.on('pageerror', lambda e, r=role: erreurs.append(f'[{r}] PAGEERROR {e}'))
        pg.goto(URL)
        pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]')
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
        pg.click('[data-act=nouvelle-enquete]')
        pg.click('[data-act=lettre-suite]')
        verifier(pg.locator('.b-mm-ligne.moi').count() == 1, 'l\'écran des missions, sa ligne en couleur')
        pg.screenshot(path=f'{OUT}/{role}-missions.png')
        pg.click('[data-act=commencer]'); pg.wait_for_timeout(3200)
        verifier(pg.evaluate("() => M.P().etape === 'jeu' && !M.UI.modal && !M.P().marche"), 'l\'enquête commence ; le maire ne vient que chez le Barde')
        for o in ['carte', 'role', 'carnet', 'code']:
            pg.evaluate(f"() => {{ M.UI.modal = null; M.P().onglet = '{o}'; M.render(); }}"); pg.wait_for_timeout(500)
            pg.screenshot(path=f'{OUT}/{role}-{o}.png')
        verifier(pg.locator('#ma-compteurs').count() == 0, 'pas de compteurs de fleurs sur sa carte')
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }")
        verifier(pg.evaluate("() => !M.pnjCacheCarte('iris') && !M.pnjBulleCarte('fortune')"), 'il voit Iris et Basile, sans bulle')
        for l in ['place', 'mairie', 'boulangerie', 'herboristerie', 'clocher', 'moulin', 'foret', 'puits', 'potager', 'lavoir']:
            ev(pg, 'lieu', {'id': l}); pg.evaluate("() => M.fermer()")
        for m in ['L1', 'L2', 'L4', 'F1', 'B3']:
            ev(pg, 'maison', {'id': m}); pg.evaluate("() => M.fermer()")
        ev(pg, 'maison', {'id': 'L2'})
        verifier('chez sa sœur' in pg.evaluate("() => document.querySelector('#voile').innerText"), 'chez Odette : personne')
        pg.evaluate("() => M.fermer()")
        if role == 'sage':
            pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(600)
            pg.screenshot(path=f'{OUT}/sage-livre.png')
            verifier(pg.evaluate("() => !!M.E().registre.levoisin && !!M.E().registre.leo"), 'le registre connaît le voisin et Léo')
        else:
            seq = pg.evaluate("() => M.code('moment:1')")
            pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }")
            for s in seq: ev(pg, 'sym', {'s': s})
            pg.wait_for_timeout(400)
            verifier(pg.evaluate("() => M.momentId() === 'apresmidi'"), 'le code de l\'après-midi')
            pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }"); pg.wait_for_timeout(400)
            pg.screenshot(path=f'{OUT}/{role}-carte-apresmidi.png')
        pg.context.close()
    b.close()
print('\nErreurs JS :', len(erreurs))
for e in erreurs[:12]: print('  ', e[:300])
print('Vérifications ratées :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if erreurs or echecs else 0)
