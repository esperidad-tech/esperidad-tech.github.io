# Les combats de la Bible §17.17 rejoués à pas fixes : python3 scenes.py [nom ...]   (voir scenes.js)
import sys, json, time
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    pg.evaluate(open(ICI + '/scenes.js', encoding='utf8').read())
    noms = sys.argv[1:] or pg.evaluate("Object.keys(__S)")
    bilan = []
    for n in noms:
        try:
            r = pg.evaluate("__S.%s()" % n)
        except Exception as e:
            r = {'ok': False, 'erreur': str(e)[:600]}
        bilan.append((n, r.get('ok')))
        print(('OK   ' if r.get('ok') else 'NON  ') + n)
        if n == 'rouges':
            for x in r['R']:
                print('       ', 'évité ' if x['evite'] else 'TOUCHÉ' if x['vu'] else 'PAS VU', x['nom'], '(' + str(x['zone']) + ')', 'vie', x['vie'])
        else:
            print('       ', json.dumps({k: v for k, v in r.items() if k != 'ok'}, ensure_ascii=False))
    print('ERREURS', errs[:6])
    print('BILAN', sum(1 for _, o in bilan if o), '/', len(bilan))
    b.close()
