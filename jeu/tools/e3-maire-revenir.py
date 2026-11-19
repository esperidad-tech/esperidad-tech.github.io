#!/usr/bin/env python3
"""LE MAIRE DE L'APRÈS-MIDI RESTE JOIGNABLE (Romain, 19 novembre, 9 h 29 : « tant qu'on n'a pas lancé le grand dialogue, on peut aller lui
reparler. Et si on lance le grand dialogue, et qu'on quitte la fenêtre, on peut quand même aller lui reparler. Il n'y a que si vraiment on
fait une erreur dans le grand dialogue, là on ne pourra plus lui parler »).
  BRUMEVAL_DIST=<dossier construit> python3 tools/e3-maire-revenir.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
tete = open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split("with sync_playwright() as p:")[0]
erreurs, echecs = [], []
exec(tete)

def indispo(pg):
    return pg.evaluate("() => M.pnjIndispo('grosbec')")
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = debut(b, 'barde', TAB)
    pg.evaluate("() => { M.UI.modal = null; M.P().moment = 1; M.sauver(); M.render(); }"); pg.wait_for_timeout(300)
    # les quatre questions du maire posées, le grand dialogue pas encore ouvert (il manque d'autres villageois)
    pg.evaluate("() => { [0,1,2,3].forEach(function(i){ M.P().vus['barde:grosbec:' + i] = 'ok'; }); M.sauver(); M.render(); }")
    verifier(not pg.evaluate("() => M.besoinOk(M.E().pnj.grosbec.questions[4].besoin)"), 'le grand dialogue attend encore (pas tout demandé à tout le monde)')
    verifier(not indispo(pg), 'tout demandé sauf le grand dialogue : le maire n\'est pas en rouge, on peut revenir le voir')
    # lancé, puis quitté sans finir
    pg.evaluate("() => { var P = M.P(); P.vus['barde:grosbec:4'] = 'ok'; P.grands = P.grands || {}; P.grands.lettre = {e:1, vus:{}, r:'', fini:'', essais:0, ok:1}; M.sauver(); M.render(); }")
    verifier(not indispo(pg), 'le grand dialogue lancé puis quitté : toujours pas en rouge (on le reprend)')
    pg.evaluate("() => { M.P().grands.lettre.fini = 'encore'; M.render(); }")
    verifier(not indispo(pg), 'une deuxième chance (« encore ») : pas en rouge')
    pg.evaluate("() => { M.P().grands.lettre.fini = 'rate'; M.P().vus['grand:lettre'] = 'rate'; M.render(); }")
    verifier(indispo(pg), 'une erreur dans le grand dialogue : là, il est en rouge')
    print('Erreurs de page :', erreurs or 'aucune')
    print('ÉCHECS :', echecs)
