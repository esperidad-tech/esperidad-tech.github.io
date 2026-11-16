"""Enquête 3, la nuit, le Barde : la fête se touche SUR LA CARTE, avec le doigt (16 novembre, Romain, 19 h 48 : « quand il clique sur le
groupement au niveau de la fête, il y a des icônes qui s'affichent un peu bizarrement et on ne peut pas cliquer dessus »).
Avant : la place s'ouvrait dans une bulle de la carte, où les onze visages ne prenaient pas le doigt — toute la nuit était bloquée.
Les autres robots ouvraient la place sans toucher la carte (M.A.lieu) : ils ne le voyaient pas. Celui-ci touche pour de vrai.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-fete-carte.py [iphone]"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
TEL = 'iphone' in sys.argv
VUE = {'width': 390, 'height': 844} if TEL else {'width': 1180, 'height': 820}
OUT = os.path.join(ICI, '..', 'test', 'e3-fete-carte' + ('-iphone' if TEL else ''))
os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def code(pg, cle):
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(400)
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }"); pg.wait_for_timeout(600)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport=VUE, has_touch=True, is_mobile=TEL).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=barde]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Barde'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      M.A['ma-debut'](); var s = M.P().marche; s.f.fini = true; s.f.ouvert = true; s.b = 10; s.or = 0; M.UI.modal = null; M.sauver(); M.render(); }""")
    code(pg, 'moment:1'); code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    pg.wait_for_timeout(1200)
    pg.screenshot(path=f'{OUT}/1-carte.png')
    # la place : on la touche sur la carte (le groupe de visages de la fête, ou son étiquette sur un téléphone)
    vis = pg.locator('#carte-ici .ca-marqueur.presence[data-id=place]')
    cible = vis.first if vis.count() else pg.locator('#carte-ici .ca-lieu[data-id=place]').first
    if TEL: cible.tap()
    else: cible.click()
    pg.wait_for_timeout(900)
    pg.screenshot(path=f'{OUT}/2-fete.png')
    m = pg.evaluate("() => M.UI.modal ? JSON.parse(JSON.stringify(M.UI.modal)) : null")
    verifier(m and m.get('type') == 'lieu' and m.get('id') == 'place' and not m.get('bulle'), f'la place, touchée sur la carte : une grande fenêtre, pas une bulle ({m})')
    tetes = pg.locator('#voile [data-act=gd-fete]')
    verifier(tetes.count() == 11, f'les onze visages de la fête ({tetes.count()})')
    pe = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=gd-fete]'), function(e){ return getComputedStyle(e).pointerEvents; })")
    verifier(pe and all(x != 'none' for x in pe), 'chaque visage prend le doigt')
    mel = pg.locator('#voile [data-act=gd-fete][data-id=melusine]')
    if TEL: mel.tap()
    else: mel.click()
    pg.wait_for_timeout(600)
    m = pg.evaluate("() => M.UI.modal ? JSON.parse(JSON.stringify(M.UI.modal)) : null")
    verifier(m and m.get('type') == 'grand' and m.get('vue') == 'fete' and m.get('qui') == 'melusine', 'Mélusine, touchée : elle parle')
    verifier(pg.evaluate("() => !!M.P().vus['fete:filet:melusine']"), 'sans son aveu de l\'après-midi, elle craque (le filet de la fête)')
    pg.screenshot(path=f'{OUT}/3-melusine.png')
    # la place le jour (le Barde) : toujours une bulle, comme avant
    b.close()

print(('ERREURS : ' + ' | '.join(erreurs[:5])) if erreurs else 'aucune erreur dans la page')
print(f'{len(echecs)} échec(s)' if echecs else 'tout est bon')
sys.exit(1 if echecs or erreurs else 0)
