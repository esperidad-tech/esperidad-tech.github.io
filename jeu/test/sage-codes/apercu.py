"""Aperçu rapide : chaque système en plein jeu (python3 apercu.py [taille] [niveau] [systemes…])"""
import sys
from outils import *
taille = sys.argv[1] if len(sys.argv) > 1 else 'tab'
niv = int(sys.argv[2]) if len(sys.argv) > 2 else 6
syst = sys.argv[3:] or ['pigpen', 'cesar', 'symboles', 'nombres', 'grille', 'miroir', 'morse', 'substitution', 'danseurs']
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = page(b, taille)
    for s in syst:
        lancer(pg, 'alphabet', niv, params={'systeme': s})
        a = alpha(pg)
        print(s, a['variante'], a['message'], 'temps', a['temps'], 'deg', [c['degat'] for c in a['cases'] if c['degat']], 'cachees', a['cachees'], 'deduit', a['deduit'])
        pg.screenshot(path=f'{CAPT}/apercu-{taille}-{s}.png')
        pg.click('.sl-quitter'); pg.wait_for_timeout(200)
    print('erreurs', pg._errs)
    b.close()
