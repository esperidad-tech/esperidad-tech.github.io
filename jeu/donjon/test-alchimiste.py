"""Test de la tablette de l'Alchimiste (donjon-alchimiste.html) — les règles de Romain, les codes des plantes, le chaudron
(explication en images, les trois étapes, la recette et son code), la mémoire, la fluidité du touillage.

    flock /tmp/brumeval-pw.lock python3 test-alchimiste.py           (tout)
    flock /tmp/brumeval-pw.lock python3 test-alchimiste.py --vite    (sans la mesure de fluidité)
Captures dans pages/captures/ (alchi-*.png). Refaire la page avant : python3 pages/assembler.py"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pages'))
from playwright.sync_api import sync_playwright
from outils_test import Bilan, contexte, page, capture, regles, muet, mesurer_glisse

VITE = '--vite' in sys.argv
CODES = {'plante:givre': ['poisson', 'lune', 'etoile'], 'plante:lumiere': ['arbre', 'soleil', 'cloche'], 'sauve:1': ['lune', 'cle', 'arbre'], 'faux': ['chat', 'chat', 'chat']}
RECETTE = {'givre': ['eau', 'givre', 'lune'], 'lumiere': ['miel', 'herbes', 'lavande']}
CODE_RECETTE = {'givre': 'recette:givre', 'lumiere': 'recette:baumelum'}
b = Bilan('Alchimiste')


def clic(pg, sel):
    pg.locator(sel).first.click(force=True)


def taper(pg, nom):
    clic(pg, '#b-code')
    pg.wait_for_selector('.pave-fen')
    for k in CODES[nom]:
        clic(pg, '.pave [data-sym="%s"]' % k)
    pg.wait_for_timeout(450)


def cuisiner(pg, plante, t, vrai_doigt=False, captures=True):
    clic(pg, '[data-cuisiner="%s"]' % plante); pg.wait_for_timeout(400)
    b.ok(pg.is_visible('.explication') and pg.locator('.explication figure').count() == 3, 'avant le mini-jeu : l’explication en 3 images')
    b.ok(pg.inner_text('.explication .aller').strip() == 'On cuisine !', 'et le bouton jaune « On cuisine ! »')
    regles(b, pg, 'explication'); muet(b, pg, 'explication')
    if captures:
        capture(pg, 'alchi-explication-' + t)
    clic(pg, '.explication [data-go]'); pg.wait_for_timeout(500)
    # 1. verser : un mauvais bocal d'abord, puis les bons dans l'ordre
    mauvais = [x for x in pg.eval_on_selector_all('.bocal', 'l => l.map(b => b.dataset.ing)') if x not in RECETTE[plante]][0]
    clic(pg, '.bocal[data-ing="%s"]' % mauvais); pg.wait_for_timeout(300)
    b.ok('Pas celui-là' in pg.inner_text('#bulle-jeu'), 'un mauvais ingrédient : « Pas celui-là ! » (sans punition)')
    clic(pg, '.bocal[data-ing="%s"]' % RECETTE[plante][1]); pg.wait_for_timeout(300)
    b.ok(pg.evaluate('ALCHI.partie().verse') == 0, 'le bon ingrédient, mais pas dans l’ordre : refusé')
    if captures:
        capture(pg, 'alchi-verser-' + t)
    regles(b, pg, 'étape 1')
    for ing in RECETTE[plante]:
        clic(pg, '.bocal[data-ing="%s"]' % ing); pg.wait_for_timeout(1000)
    b.ok(pg.evaluate('ALCHI.partie().etape') == 2, 'les trois ingrédients versés dans l’ordre : on passe à la louche')
    b.ok(pg.locator('.carte-recette li.fait').count() == 3, 'la recette coche les trois ingrédients')
    # 2. touiller
    if vrai_doigt:
        bx = pg.locator('#ch-jeu').bounding_box()
        cx, cy, r = bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] * .42, min(bx['width'], bx['height']) * .3
        pg.mouse.move(cx + r, cy); pg.mouse.down()
        for i in range(1, 140):
            a = i * .17
            pg.mouse.move(cx + math.cos(a) * r, cy + math.sin(a) * r * .6)
            if pg.evaluate('ALCHI.partie() && ALCHI.partie().etape') != 2:
                break
        pg.mouse.up()
    else:
        pg.evaluate('ALCHI.touiller(Math.PI * 2 * 1.4)')
        b.ok(pg.evaluate('ALCHI.partie().tours') == 1, 'un tour de louche compté')
        if captures:
            capture(pg, 'alchi-touiller-' + t)
        pg.evaluate('ALCHI.touiller(Math.PI * 2 * 1.7)')
    pg.wait_for_timeout(800)
    b.ok(pg.evaluate('ALCHI.partie().etape') == 3, 'trois tours de louche' + (' (au doigt)' if vrai_doigt else '') + ' : on passe au feu')
    regles(b, pg, 'étape 3')
    # 3. souffler
    for i in range(5):
        clic(pg, '#soufflet'); pg.wait_for_timeout(250)
        if i == 2 and captures:
            capture(pg, 'alchi-souffler-' + t)
    pg.wait_for_timeout(3400)
    b.ok(pg.is_visible('.resultat'), 'cinq coups de soufflet : ça bout, la recette apparaît')
    b.ok(pg.get_attribute('.resultat .code-grand', 'data-code') == CODE_RECETTE[plante], 'la recette montre son code (%s)' % CODE_RECETTE[plante])
    regles(b, pg, 'résultat'); muet(b, pg, 'résultat')
    if captures:
        capture(pg, 'alchi-recette-' + t)
    clic(pg, '[data-ranger]'); pg.wait_for_timeout(500)
    rid = 'givre' if plante == 'givre' else 'baumelum'
    b.ok(pg.get_attribute('[data-recette="%s"] .code-grand' % rid, 'data-code') == CODE_RECETTE[plante], 'la recette reste dans le livre, avec son code lisible')


def parcours(nav, appareil):
    print('\n=== %s ===' % appareil)
    t = 'tab' if appareil == 'tablette' else 'tel'
    ctx = contexte(nav, appareil)
    pg, err = page(ctx, 'donjon-alchimiste.html')
    pg.wait_for_timeout(700)
    ids = pg.eval_on_selector_all('#recettes .recette', 'l => l.map(r => r.dataset.recette)')
    b.ok(ids == ['feu', 'fumigene', 'huile', 'colle', 'baume', 'coeur'], 'les 6 recettes du départ (comme la salle d’essai) : ' + ', '.join(ids))
    regles(b, pg, 'départ'); muet(b, pg, 'départ')
    capture(pg, 'alchi-depart-' + t)
    taper(pg, 'faux')
    b.ok('ne veut rien dire' in pg.inner_text('.pave-msg'), 'un code faux est refusé gentiment')
    for k in CODES['sauve:1']:
        clic(pg, '.pave [data-sym="%s"]' % k)
    pg.wait_for_timeout(450)
    b.ok('pour le Pisteur' in pg.inner_text('.pave-msg'), 'le code d’une autre tablette dit à qui il est')
    regles(b, pg, 'pavé')
    clic(pg, '.pave-fen .fermer')
    # --- la fleur de givre ---
    taper(pg, 'plante:givre')
    b.ok(pg.is_visible('.plante-fen'), 'plante:givre : la fleur arrive (petite scène)')
    regles(b, pg, 'arrivée de la plante')
    capture(pg, 'alchi-plante-' + t)
    clic(pg, '.plante-fen [data-fen-fermer].aller'); pg.wait_for_timeout(300)
    b.ok(pg.is_visible('[data-plante="givre"]') and pg.is_visible('[data-cuisiner="givre"].guide'), 'la fleur attend près du chaudron, le bouton jaune « Cuisiner » porte le rond jaune')
    taper(pg, 'plante:givre')
    b.ok('déjà reçu' in pg.inner_text('.pave-msg'), 'un code ne marche qu’une fois (plante:givre)')
    clic(pg, '.pave-fen .fermer')
    # « Plus tard » : la plante attend toujours
    clic(pg, '[data-cuisiner="givre"]'); pg.wait_for_timeout(300); clic(pg, '[data-quitter]'); pg.wait_for_timeout(300)
    b.ok(pg.is_visible('[data-cuisiner="givre"]'), '« Plus tard » : la fleur attend encore')
    cuisiner(pg, 'givre', t)
    # --- la mémoire ---
    pg.reload(); pg.wait_for_timeout(700)
    S = pg.evaluate('ALCHI.etat()')
    b.ok(S['recettes'] == ['givre'] and S['plantes'].get('givre') == 'cuite' and S['codes'].get('plante:givre'), 'après rechargement : la recette Givre et la plante cuite sont gardées')
    b.ok(pg.get_attribute('[data-recette="givre"] .code-grand', 'data-code') == 'recette:givre' and not pg.is_visible('[data-cuisiner]'), 'après rechargement : le livre montre Givre et son code, plus rien à cuisiner')
    # --- les herbes lumineuses, touillées au vrai doigt ---
    taper(pg, 'plante:lumiere'); clic(pg, '.plante-fen [data-fen-fermer].aller'); pg.wait_for_timeout(300)
    cuisiner(pg, 'lumiere', t, vrai_doigt=True, captures=False)
    capture(pg, 'alchi-livre-' + t)
    regles(b, pg, 'livre complet')
    taper(pg, 'plante:lumiere')
    b.ok('déjà reçu' in pg.inner_text('.pave-msg'), 'plante:lumiere ne marche qu’une fois')
    clic(pg, '.pave-fen .fermer')
    muet(b, pg, 'tout le parcours')
    clic(pg, '#bulle .lire'); pg.wait_for_timeout(100)
    b.ok(pg.evaluate('window.__parle') == 1, 'le 🔊 lit le texte quand on le touche')
    # --- recommencer ---
    clic(pg, '#b-nouveau'); pg.wait_for_timeout(250)
    b.ok('Recommencer' in pg.inner_text('.question'), 'recommencer demande confirmation')
    clic(pg, '.question [data-oui]'); pg.wait_for_timeout(1200)
    S = pg.evaluate('ALCHI.etat()')
    b.ok(not S['recettes'] and not S['codes'] and pg.locator('#recettes .recette').count() == 6, 'après « Oui, on recommence » : retour aux 6 recettes du départ')
    b.ok(not err, 'aucune erreur JavaScript' + ('' if not err else ' : ' + ' | '.join(err[:3])))
    # --- la fluidité : touiller au doigt, processeur ×6 ---
    if not VITE:
        taper(pg, 'plante:givre'); clic(pg, '.plante-fen [data-fen-fermer].aller'); pg.wait_for_timeout(300)
        clic(pg, '[data-cuisiner="givre"]'); pg.wait_for_timeout(300); clic(pg, '.explication [data-go]'); pg.wait_for_timeout(400)
        for ing in RECETTE['givre']:
            clic(pg, '.bocal[data-ing="%s"]' % ing); pg.wait_for_timeout(1000)
        pg.evaluate('ALCHI.sansFin = true')   # la mesure touille sans finir la potion
        bx = pg.locator('#ch-jeu').bounding_box()
        # on touille en très gros cercles lents : les trois tours ne seront pas finis pendant la mesure
        m = mesurer_glisse(nav, ctx, pg, 6, bx['x'] + bx['width'] / 2, bx['y'] + bx['height'] * .42, ax=bx['width'] * .3, ay=bx['height'] * .18, duree=2.0)
        print('    fluidité (touiller, ×6) :', m)
        b.ok(m and m['ips'] >= 45, '≥ 45 images/s en touillant, processeur ×6 (%s)' % (m and m['ips']))
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    for a in ('tablette', 'iphone'):
        parcours(nav, a)
    nav.close()
sys.exit(b.fin())
