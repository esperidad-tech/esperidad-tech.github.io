import sys
from outils import *
taille = sys.argv[1] if len(sys.argv) > 1 else 'tab'
niv = int(sys.argv[2]) if len(sys.argv) > 2 else 5
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = page(b, taille)
    for im in ['runes', 'carte', 'blason', 'horloge']:
        lancer(pg, 'runes', niv, params={'image': im})
        e = pg.evaluate('() => __mjsRunes.etat()')
        print(im, 'k', e['k'], 'coups', e['coups'], 'opt', e['optimum'])
        pg.screenshot(path=f'{CAPT}/runes-{taille}-{im}.png')
        pg.click('.sl-quitter'); pg.wait_for_timeout(200)
    print('erreurs', [x for x in pg._errs if 'ERR_TUNNEL' not in x])
    b.close()
