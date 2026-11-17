#!/usr/bin/env python3
"""LE MAIRE VEXÉ (Romain, 17 novembre, 20 h 16) : accusé à tort (« Mensonge ? ») l'après-midi, le maire ferme sa porte — et la grande conversation
de la lettre (l'après-midi seulement) ne se tient plus. Il part fâché en donnant quand même « La lettre est sur le bureau du maire » (pour le
Pisteur), avec « N'essayez même pas de me demander la lettre d'Odette ! ». Sans ce code, le Pisteur ne voyait jamais le point de la lettre.
Si la grande conversation a eu lieu (réussie, ratée ou piégée), il ne donne rien de plus.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-maire-vexe.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
tete = open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split("with sync_playwright() as p:")[0]
erreurs, echecs = [], []
exec(tete)
OUT = os.path.join(ICI, '..', 'test', 'e3-maire-vexe'); os.makedirs(OUT, exist_ok=True)

def moment(pg, n):
    pg.evaluate("(n) => { M.UI.modal = null; M.P().moment = n; M.sauver(); M.render(); }", n); pg.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch()

    print('— Accusé à tort, sans la grande conversation')
    pg = debut(b, 'barde', TAB); moment(pg, 1)
    ev(pg, 'parler', {'id': 'grosbec'})
    ev(pg, 'question', {'p': 'grosbec', 'i': '0'})
    ev(pg, 'bd-ment', {'p': 'grosbec', 'i': '0'})
    pg.wait_for_timeout(500)
    t = texte(pg)
    shot(pg, 'vexe')
    verifier("n'essayez même pas de me demander la lettre d'odette" in t.replace('’', "'").lower(),f'il dit : « N\'essayez même pas de me demander la lettre d\'Odette ! » ({t[:200]})')
    verifier(pg.evaluate("() => !!M.P().vexe.grosbec") and pg.evaluate("() => !!M.P().vexeAccuse.grosbec"), 'il est bien vexé pour ce moment')
    verifier(pg.evaluate("() => !!M.P().vus['vexe-donne:grosbec']"), 'le code a été donné (vexe-donne:grosbec)')
    verifier('lettre_bureau' in pg.evaluate("() => JSON.stringify(M.P().notes || M.P().carnet || [])") or 'bureau' in pg.evaluate("() => JSON.stringify(M.P())").lower(), 'une note dans le carnet')
    fermer(pg)
    # le code est bien celui que le Pisteur sait taper : le Pisteur le reçoit, le point de la lettre apparaît
    pg.context.close()

    print('— Le code ouvre le point de la lettre chez le Pisteur')
    pg = debut(b, 'pisteur', TAB); moment(pg, 1)
    avant = pg.evaluate("() => M.pointsVisibles('mairie', 'pisteur').map(function(x){ return x.id; })")
    verifier('lettre' not in avant, f'sans le code : pas de point « La lettre, en cachette » ({avant})')
    pg.evaluate("() => { M.P().recus['info:lettre_bureau'] = true; M.sauver(); M.render(); }")
    apres = pg.evaluate("() => M.pointsVisibles('mairie', 'pisteur').map(function(x){ return x.id; })")
    verifier('lettre' in apres, f'avec le code : le point apparaît ({apres})')
    pg.context.close()

    print('— La grande conversation a déjà eu lieu : rien de plus')
    pg = debut(b, 'barde', TAB); moment(pg, 1)
    pg.evaluate("() => { var P = M.P(); P.vus['grand:lettre:fini'] = 1; P.vus['grand:lettre'] = 'rate'; M.sauver(); }")
    ev(pg, 'parler', {'id': 'grosbec'})
    ev(pg, 'question', {'p': 'grosbec', 'i': '0'})
    ev(pg, 'bd-ment', {'p': 'grosbec', 'i': '0'})
    verifier(pg.evaluate("() => !!M.P().vexe.grosbec") and not pg.evaluate("() => !!M.P().vus['vexe-donne:grosbec']"), 'vexé, mais pas de deuxième code (il l\'a déjà eu)')
    pg.context.close()
    b.close()

print('\nErreurs de page :', erreurs if erreurs else 'aucune')
print('Vérifications ratées :', echecs if echecs else 'aucune')
sys.exit(1 if (erreurs or echecs) else 0)
