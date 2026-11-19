#!/usr/bin/env python3
"""LES TENUES DE MÉLUSINE, REÇUES (Romain, 19 novembre, 10 h 22 : « quand on tape ce code, ce serait cool qu'il y ait une fenêtre avec la
tenue en question […] tu fais en sorte qu'il ait la tête, les yeux, la coiffure, la couleur de peau, l'âge […] un bouton super, ok »).
Le Pisteur, le Sage, l'Alchimiste : le code « Les tenues de Mélusine » tapé → une fenêtre, son héros en tenue (donjon/tenue.html, avec son
allure), et « 👍 Super, OK ! ».   BRUMEVAL_DIST=<dossier construit, avec donjon/> python3 tools/e3-tenues.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
tete = open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split("with sync_playwright() as p:")[0]
erreurs, echecs = [], []
exec(tete)
OUT = os.path.join(ICI, '..', 'test', 'e3-tenues'); os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for role in ('pisteur', 'sage', 'alchimiste'):
        print('— ' + role)
        pg = debut(b, role, TAB)
        pg.evaluate("() => { M.S.heros = Object.assign(M.S.heros || {}, {sexe:'f', peau:'p5', cheveux:'roux', age:'enfant'}); M.P().moment = 2; M.sauver(); M.render(); }")
        seq = pg.evaluate("() => M.code('obj:tenues')")
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
        for s0 in seq: ev(pg, 'sym', {'s': s0})
        pg.wait_for_timeout(1500)
        m = pg.evaluate("() => M.UI.modal ? {type:M.UI.modal.type, vue:M.UI.modal.vue} : null")
        verifier(m == {'type': 'descente', 'vue': 'tenueMel'}, f'{role} : la fenêtre de sa tenue ({m})')
        src = pg.evaluate("() => { var f = document.querySelector('#voile iframe.ds-tenue'); return f ? f.src : ''; }")
        verifier('tenue.html' in src and ('h=' + role) in src and 'p5.roux' in src and '.enf' in src, f'{role} : son héros à lui, en tenue (sa peau, ses cheveux, son âge) ({src[-80:]})')
        verifier('Super, OK' in pg.evaluate("() => document.querySelector('#voile').innerText"), f'{role} : « 👍 Super, OK ! »')
        pg.wait_for_timeout(2500); shot(pg, 'tenue-' + role)
        pg.context.close()
    b.close()
print('Erreurs de page :', erreurs or 'aucune')
print('ÉCHECS :', echecs)
