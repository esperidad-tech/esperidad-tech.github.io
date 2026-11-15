"""Des images fixes d'un film, pour regarder : python3 apercu.py <film> <t1> [t2 …] [--js "window.ESSAI = …"] [--sortie dossier]"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]; js = ''; sortie = '/tmp/cine'
if '--js' in args: i = args.index('--js'); js = args[i + 1]; del args[i:i + 2]
if '--sortie' in args: i = args.index('--sortie'); sortie = args[i + 1]; del args[i:i + 2]
film, temps = args[0], [float(x) for x in args[1:]]
os.makedirs(sortie, exist_ok=True)
with sync_playwright() as p:
    nav = p.chromium.launch(args=['--disable-web-security'])
    pg = nav.new_page(viewport={'width': 1440, 'height': 616})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(ICI, 'page.html'))
    if js: pg.evaluate(js)
    for t in temps:
        pg.evaluate('([n, t]) => { CINE.image(n, t); }', [film, t])
        pg.screenshot(path=os.path.join(sortie, '%s-%05.2f.png' % (film, t)))
        print(os.path.join(sortie, '%s-%05.2f.png' % (film, t)))
    if errs: print('ERREURS', errs[:5])
    nav.close()
