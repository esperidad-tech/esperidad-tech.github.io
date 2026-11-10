"""Photos d'un meuble spécial dans l'atelier du jeu, pour regarder ses formes et ses couleurs (style = un nombre :
forme = style % (nombre de formes), couleur = style % 8 ; paillasse 5 formes, chaudron 3, lutrin 3).
   python3 tools/photos-paillasse.py <dossier de build> <préfixe des images> [styles...]
   MEUBLE=ch (ou lu, pa par défaut) python3 tools/photos-paillasse.py …"""
import sys, os, json
from playwright.sync_api import sync_playwright
D, PREF = sys.argv[1], sys.argv[2]
ID = os.environ.get('MEUBLE', 'pa'); AT = {'pa':'analyses', 'ch':'chaudron', 'lu':'grimoire'}[ID]
STYLES = [int(x) for x in sys.argv[3:]] or [0]
URL = 'file://' + os.path.join(D, 'index.html')
err = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={'width':1280,'height':800}, device_scale_factor=2).new_page(); pg.set_default_timeout(8000)
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: err.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alicia'); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    o = pg.locator('[data-act=onglet]', has_text='Atelier')
    if o.count(): o.first.click()
    pg.wait_for_timeout(700)
    print('objets:', pg.evaluate("() => JSON.stringify((M.S.atelier.objets||[]).filter(o => ['pa','ch','lu'].includes(o.id)))"))
    for st in STYLES:
        pg.evaluate("a => { var o = M.S.atelier.objets.filter(o => o.id === a[0])[0]; o.st = a[1]; M.render(); }", [ID, st]); pg.wait_for_timeout(500)
        el = pg.locator(f'#atelier-ici [data-at={AT}]').first
        bb = el.bounding_box()
        m = 60
        pg.screenshot(path=f'{PREF}-{st}.png', clip={'x':max(0,bb['x']-m), 'y':max(0,bb['y']-m), 'width':bb['width']+2*m, 'height':bb['height']+2*m})
    pg.screenshot(path=f'{PREF}-piece.png')
    print('ERREURS', err)
    b.close()
