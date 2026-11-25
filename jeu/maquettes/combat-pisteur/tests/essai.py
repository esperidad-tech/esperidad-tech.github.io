# Un essai à la main : python3 essai.py fichier.js   (le fichier est évalué dans la page, après scenes.js ; il doit rendre une valeur)
import sys, json
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    pg.evaluate(open(ICI + '/scenes.js', encoding='utf8').read())
    r = pg.evaluate(open(sys.argv[1], encoding='utf8').read())
    print(json.dumps(r, ensure_ascii=False, indent=None)[:6000]); print('ERREURS', errs[:5])
    b.close()
