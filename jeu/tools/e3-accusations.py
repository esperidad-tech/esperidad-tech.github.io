#!/usr/bin/env python3
"""LES ACCUSATIONS ARRIVENT AU FUR ET À MESURE (Romain, 17 novembre, 7 h 50 : « au début, il n'y a rien […] elles arrivent au fur et à mesure
que des codes arrivent […] et tu le dis au Sage : "les accusations sont à jour" »).
Le Sage : rien au début ; le papier d'Odette → OÙ ; la lettre → QUI a écrit ; « Léo a parlé » → QUI sous la cape, et on peut accuser.
  BRUMEVAL_DIST=<dossier construit> python3 tools/e3-accusations.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
tete = open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split("with sync_playwright() as p:")[0]
erreurs, echecs = [], []
exec(tete)
OUT = os.path.join(ICI, '..', 'test', 'e3-accusations'); os.makedirs(OUT, exist_ok=True)

def acc(pg):
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('accusation', true); }"); pg.wait_for_timeout(500)
    return pg.evaluate("""() => { var p = document.querySelector('#livre-ici .lv-page.on'); return {t:p.innerText.replace(/\\s+/g, ' '), q:[].map.call(p.querySelectorAll('.lv-questions li b'), function(b){ return b.textContent; }),
      bouton:p.querySelectorAll('[data-act=accuser]').length, suspects:p.querySelectorAll('.lv-suspect').length}; }""")
def toast(pg):
    return pg.evaluate("() => { var e = document.getElementById('toast'); return e && e.classList.contains('on') ? e.textContent : ''; }")
def carnet(pg):
    return pg.evaluate("() => (M.P().carnet || []).map(function(x){ return x.t; }).join(' | ')")

with sync_playwright() as p:
    b = p.chromium.launch()
    print('— Le Sage (téléphone tenu droit)')
    pg = debut(b, 'sage', TEL)
    a = acc(pg); shot(pg, '0-rien')
    verifier(a['q'] == [] and a['bouton'] == 0 and a['suspects'] == 0 and 'Rien à accuser pour l\'instant' in a['t'], f'au début : rien à accuser, pas de question, pas de bouton, pas de suspects ({a["t"][:70]})')
    verifier(not any(x in a['t'] for x in ['OÙ est Odette', 'fausse lettre', 'cape noire']), 'aucune des trois questions n\'est écrite d\'avance')
    verifier(not any(x in carnet(pg) for x in ['QUI a écrit', 'OÙ est Odette']) and not any('QUI a écrit' in (e.get('t') or '') for e in pg.evaluate("() => M.etapesMission()")), 'ni dans le Carnet, ni dans les missions')
    # le matin : le papier d'Odette (le Barde) → OÙ est Odette ?
    code(pg, 'obj:papier_odette'); fermer(pg); pg.wait_for_timeout(1700)
    verifier('accusations sont à jour' in toast(pg), f'le papier d\'Odette reçu : « Tes accusations sont à jour ! » ({toast(pg)})')
    a = acc(pg); shot(pg, '1-ou')
    verifier(a['q'] == ['OÙ est Odette ?'] and a['suspects'] == 0 and 'D\'autres questions viendront' in a['t'], f'une question : « OÙ est Odette ? » ; pas encore les suspects ({a["q"]})')
    verifier('Une nouvelle question dans tes accusations : « OÙ est Odette ? »' in carnet(pg), 'c\'est noté dans son Carnet')
    pg.locator('#livre-ici .lv-page.on [data-act=accuser]').click(); pg.wait_for_timeout(300)
    verifier('Pas encore' in texte(pg) and pg.locator('#voile [data-act=acc-choix]').count() == 0, 'accuser tout de suite : « Pas encore… »'); fermer(pg)
    # un code qui n'ouvre rien : pas d'annonce
    pg.wait_for_timeout(1500); code(pg, 'obj:herbier'); fermer(pg); pg.wait_for_timeout(1700)
    verifier('accusations' not in toast(pg) and acc(pg)['q'] == ['OÙ est Odette ?'], 'l\'herbier reçu : pas d\'annonce, rien de neuf')
    # l'après-midi : la lettre (le Pisteur) → QUI a écrit la fausse lettre ?
    code(pg, 'moment:1'); fermer(pg); code(pg, 'obj:lettre'); fermer(pg); pg.wait_for_timeout(1700)
    verifier('accusations sont à jour' in toast(pg), 'la lettre reçue : « Tes accusations sont à jour ! »')
    a = acc(pg); shot(pg, '2-qui')
    verifier(a['q'] == ['OÙ est Odette ?', 'QUI a écrit la fausse lettre ?'] and a['suspects'] == 14, f'deux questions, et les quatorze suspects ({a["q"]}, {a["suspects"]})')
    # la nuit : « Léo a parlé » → QUI se cachait sous la cape noire ? et on peut accuser
    code(pg, 'moment:2'); fermer(pg); code(pg, 'info:leo_battu'); fermer(pg); pg.wait_for_timeout(1700)
    a = acc(pg); shot(pg, '3-tout')
    verifier(a['q'] == ['OÙ est Odette ?', 'QUI a écrit la fausse lettre ?', 'QUI se cachait sous la cape noire ?'] and 'Quand toute l\'équipe est d\'accord, accuse' in a['t'], f'les trois questions ({a["q"]})')
    pg.locator('#livre-ici .lv-page.on [data-act=accuser]').click(); pg.wait_for_timeout(300)
    verifier('OÙ est Odette' in texte(pg) and pg.locator('#voile [data-act=acc-choix][data-k=ou]').count() == 10, 'et maintenant, on accuse : la première question, ses dix lieux'); fermer(pg)
    pg.context.close()

    print('— Un Sage qui n\'a rien reçu d\'autre que « Léo a parlé »')
    pg = debut(b, 'sage', TAB)
    code(pg, 'moment:1'); fermer(pg); code(pg, 'moment:2'); fermer(pg); code(pg, 'info:leo_battu'); fermer(pg); pg.wait_for_timeout(1700)
    a = acc(pg)
    verifier(len(a['q']) == 3 and a['bouton'] == 1 and a['suspects'] == 14, f'les trois questions arrivent d\'un coup : on peut toujours finir ({a["q"]})')
    pg.context.close()
    b.close()

print('\nErreurs de page :', erreurs if erreurs else 'aucune')
print('Vérifications ratées :', echecs if echecs else 'aucune')
sys.exit(1 if (erreurs or echecs) else 0)
