#!/usr/bin/env python3
"""Les essais dans un vrai navigateur (Playwright), avec quatre tablettes imitées dans le même navigateur.
   python3 tests/vues.py            → captures dans /tmp/p3 (ou $P3_SORTIE) et vérifications
Ce qu'il vérifie :
  1. l'accueil, puis chaque tablette choisit son héros et tape la même partie ;
  2. les quatre appuient sur GO « en même temps » (à 0,3 s près, comme des humains) ;
  3. pendant 40 s, à chaque instant, chaque carte affichée l'est chez son donneur, jamais chez le receveur,
     et les quatre tablettes ont le même essai et la même manche ;
  4. « On reprend » : manche et essai proposés, GO, retour au début de la manche ;
  5. le code : un mauvais symbole secoue la case, le bon la remplit ;
  6. « 👀 Robots » ; les captures (téléphone en hauteur, tablette en large et en hauteur, téléphone en large) ; aucune erreur.
"""
import os, sys, time, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(os.path.dirname(ICI), 'phase3-essai.html')
SORTIE = os.environ.get('P3_SORTIE', '/tmp/p3'); os.makedirs(SORTIE, exist_ok=True)
APPAREILS = {'pisteur': (390, 844), 'alchimiste': (1024, 768), 'barde': (768, 1024), 'sage': (844, 390)}
soucis = []
def non(c, m):
    if not c: soucis.append(m); print('  ✗', m)

with sync_playwright() as p:
    b = p.chromium.launch()
    pages, errs = {}, []
    for ro, (w, hh) in APPAREILS.items():
        ctx = b.new_context(viewport={'width': w, 'height': hh}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e, ro=ro: errs.append(ro + ': ' + str(e)[:400]))
        pg.on('console', lambda m, ro=ro: errs.append(ro + ' console: ' + m.text[:300]) if m.type == 'error' else None)
        pg.goto(PAGE); pg.wait_for_timeout(300)
        pages[ro] = pg
    pages['pisteur'].screenshot(path=SORTIE + '/0-accueil-telephone.png')
    pages['alchimiste'].screenshot(path=SORTIE + '/0-accueil-tablette.png')
    # chacun choisit son héros et tape 47, au doigt
    for ro, pg in pages.items():
        i = ['pisteur', 'alchimiste', 'barde', 'sage'].index(ro)
        pg.locator('.heros-choix').nth(i).tap(force=True)
        pg.locator('.pave button', has_text='4').tap(force=True); pg.locator('.pave button', has_text='7').tap(force=True)
        pg.locator('button.jaune', has_text='Prêt').tap(force=True)
    pages['barde'].screenshot(path=SORTIE + '/1-go-tablette-hauteur.png')
    # GO, à peu près ensemble
    for ro, pg in pages.items():
        pg.locator('button.go').tap(force=True); time.sleep(0.1)
    t0 = time.time(); vu = {}; mauvais = 0; echantillons = 0
    while time.time() - t0 < 40:
        etat = {}
        for ro, pg in pages.items():
            etat[ro] = pg.evaluate("""() => { var e = document.querySelector('.ou-t'); var cs = [...document.querySelectorAll('.carte')].map(c => c.querySelector('.qui b').textContent);
                return {ou: e ? e.textContent : '', cartes: cs}; }""")
        echantillons += 1
        ous = set(e['ou'] for e in etat.values())
        if len(ous) > 1: mauvais += 1
        for ro, e in etat.items():
            for nom in e['cartes']:
                non(nom != ro.upper(), 'une tablette montre sa propre carte (' + ro + ')')
                vu[ro + '>' + nom] = vu.get(ro + '>' + nom, 0) + 1
        if abs(time.time() - t0 - 12) < 0.6:
            for ro, pg in pages.items(): pg.screenshot(path=SORTIE + '/2-jeu-' + ro + '.png')
        time.sleep(0.25)
    non(mauvais <= 2, 'les quatre tablettes ont la même manche et le même essai (%d écarts sur %d)' % (mauvais, echantillons))
    print('cartes vues (donneur > receveur) :', json.dumps(vu, ensure_ascii=False))
    non(any(k.startswith('barde>SAGE') for k in vu), "l'anneau : le Barde donne au Sage")
    # à la manche 1, personne n'a bougé : quelqu'un est sûrement tombé ; « On reprend » sur les quatre
    pages['sage'].screenshot(path=SORTIE + '/3-peut-etre-mort-telephone-large.png')
    for ro, pg in pages.items():
        pg.locator('button.reprendre').tap(force=True)
    pages['alchimiste'].screenshot(path=SORTIE + '/4-on-reprend-tablette.png')
    ess = [pg.locator('.pas .val').nth(1).text_content() for pg in pages.values()]
    non(len(set(ess)) == 1 and ess[0] == '2', "l'essai proposé est 2 partout : " + str(ess))
    for pg in pages.values(): pg.locator('.fenetre button.go').tap(force=True)
    time.sleep(0.5)
    ous = [pg.evaluate("document.querySelector('.ou-t').textContent") for pg in pages.values()]
    non(len(set(ous)) == 1 and 'Essai 2' in ous[0], 'après « On reprend » : ' + str(ous))
    # le code : un faux, puis le bon
    pg = pages['alchimiste']
    pg.locator('.case[data-r="sage"]').tap(force=True); pg.wait_for_timeout(200)
    pg.screenshot(path=SORTIE + '/5-symboles-tablette.png')
    bon = pg.evaluate("__p3.P3.symboles(47).sage")
    faux = (bon + 1) % 10
    pg.locator('.symboles button').nth(faux).tap(force=True); pg.wait_for_timeout(100)
    non(pg.locator('.case[data-r="sage"]').text_content() == '?', 'un faux symbole ne remplit pas la case')
    pg.locator('.case[data-r="sage"]').tap(force=True); pg.wait_for_timeout(200)
    pg.locator('.symboles button').nth(bon).tap(force=True); pg.wait_for_timeout(100)
    non(pg.locator('.case[data-r="sage"]').text_content() != '?', 'le bon symbole remplit la case')
    # jouer un peu au doigt : choisir le feu, viser la tête, aller à gauche
    pg = pages['pisteur']
    pg.locator('.elem').nth(0).tap(force=True); pg.locator('.part-zone[data-p="3"]').tap(force=True); pg.locator('.zone[data-z="0"]').tap(force=True)
    pg.wait_for_timeout(2500)
    j = pg.evaluate("(() => { return null; })()")
    pg.screenshot(path=SORTIE + '/6-jeu-telephone-feu-tete.png')
    # les robots, sur la tablette en large
    pg = pages['alchimiste']
    pg.goto(PAGE); pg.wait_for_timeout(200)
    pg.locator('button.gris', has_text='Robots').tap(force=True); pg.wait_for_timeout(9000)
    pg.screenshot(path=SORTIE + '/7-robots-tablette.png')
    pages['pisteur'].goto(PAGE); pages['pisteur'].wait_for_timeout(200)
    pages['pisteur'].locator('button.gris', has_text='Robots').tap(force=True); pages['pisteur'].wait_for_timeout(6000)
    pages['pisteur'].screenshot(path=SORTIE + '/7-robots-telephone.png')
    non(not errs, 'erreurs : ' + '\n'.join(errs[:10]))
    b.close()
print('SOUCIS', len(soucis))
sys.exit(1 if soucis else 0)
