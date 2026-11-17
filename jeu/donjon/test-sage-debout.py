"""Test de la tablette du Sage TENUE DEBOUT (17 novembre, Romain : « une interface claire sur un téléphone tenu droit, sans le tourner »).
Le plan du Sage ne demande plus de tourner l'écran : debout, ses outils passent en haut, sur une ligne, et le plan garde toute la largeur.
On vérifie, sur un téléphone (390×844) et une tablette (820×1180) debout, puis couchés : pas d'écran « Tourne ta tablette », la barre en
haut (debout) ou à droite (couchée), le plan posé sur l'entrée, le glisser, les deux boutons de zoom, la grille de l'alphabet, la rune
qu'on promène, et qu'en tournant l'écran tout se range tout seul.

    flock /tmp/brumeval-pw.lock python3 test-sage-debout.py        (refaire la page avant : python3 pages/assembler.py)
Captures dans pages/captures/ (sage-debout-*.png)."""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'donjon-sage.html')
OUT = os.path.join(ICI, 'pages', 'captures'); os.makedirs(OUT, exist_ok=True)
echecs, erreurs, n = [], [], [0]

def verifier(cond, quoi):
    n[0] += 1; print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def etat(pg):
    return pg.evaluate("""() => { var b = document.querySelector('#barre').getBoundingClientRect(), ba = document.querySelector('#bas').getBoundingClientRect(), t = document.querySelector('#tourne');
      var c = document.querySelector('#couche').getBoundingClientRect();
      return {debout:document.body.classList.contains('debout'), tourne:!t || t.hidden, barre:[b.left, b.top, b.width, b.height], bas:[ba.left, ba.top, ba.width, ba.height], z:window.SAGE.zoom(), plan:[c.left, c.top, c.width, c.height], w:innerWidth, h:innerHeight,
        boutons:[].map.call(document.querySelectorAll('#barre button'), function(x){ var r = x.getBoundingClientRect(); return r.width ? [x.id, r.left, r.top, r.width, r.height] : null; }).filter(Boolean)}; }""")

with sync_playwright() as p:
    b = p.chromium.launch()
    for nom, vue in (('telephone', {'width': 390, 'height': 844}), ('tablette', {'width': 820, 'height': 1180})):
        print(f'— {nom} debout ({vue["width"]}×{vue["height"]})')
        ctx = b.new_context(viewport=vue, has_touch=True, device_scale_factor=2 if nom == 'telephone' else 1)
        pg = ctx.new_page(); pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.goto(PAGE + '?jeton=debout-' + nom); pg.wait_for_timeout(1500)
        e = etat(pg)
        verifier(e['tourne'] and e['debout'], 'pas d\'écran « Tourne ta tablette » ; la page se range debout')
        verifier(e['barre'][1] < 30 and e['barre'][3] < 90 and e['barre'][2] > e['w'] * .8, f'les outils sont en haut, sur une ligne ({[round(x) for x in e["barre"]]})')
        verifier(all(x[1] >= 0 and x[1] + x[3] <= e['w'] + 1 and x[3] >= 44 and x[4] >= 44 for x in e['boutons']), f'tous les boutons tiennent dans la largeur, et font au moins 44 px ({[(x[0], round(x[3]), round(x[4])) for x in e["boutons"]]})')
        verifier(e['z']['z'] > e['z']['fit'] * 1.2 and e['z']['z'] <= .63, f'le plan n\'est pas minuscule : il est approché ({e["z"]["z"]:.2f}, tout le plan tiendrait à {e["z"]["fit"]:.2f})')
        en = pg.evaluate("() => { var C = window.CARTE_DONJON, z = window.SAGE.zoom(), p = C.ETIQ.puits; return [z.tx + (p[0] - z.pv.x) * z.z, z.ty + (p[1] - z.pv.y) * z.z]; }")
        verifier(0 < en[0] < e['w'] and e['barre'][1] + e['barre'][3] < en[1] < e['bas'][1], f'l\'entrée du plan est à l\'écran, entre les outils et le conteur ({round(en[0])}, {round(en[1])})')
        pg.screenshot(path=f'{OUT}/sage-debout-{nom}-1.png')
        # glisser le plan (un vrai glisser, au milieu)
        z0 = pg.evaluate("() => window.SAGE.zoom()")
        cx, cy = e['w'] / 2, (e['barre'][1] + e['barre'][3] + e['bas'][1]) / 2
        pg.mouse.move(cx, cy); pg.mouse.down(); pg.mouse.move(cx - 60, cy - 10, steps=6); pg.mouse.move(cx - 140, cy - 30, steps=6); pg.mouse.up(); pg.wait_for_timeout(300)
        z1 = pg.evaluate("() => window.SAGE.zoom()")
        verifier(z1['tx'] < z0['tx'] - 60 and abs(z1['z'] - z0['z']) < .001, f'le plan glisse sous le doigt ({z0["tx"]:.0f} → {z1["tx"]:.0f})')
        # les boutons de zoom
        pg.locator('#b-plus').click(force=True); pg.wait_for_timeout(450)
        z2 = pg.evaluate("() => window.SAGE.zoom()")
        pg.locator('#b-moins').click(force=True); pg.wait_for_timeout(450); pg.locator('#b-moins').click(force=True); pg.wait_for_timeout(450)
        z3 = pg.evaluate("() => window.SAGE.zoom()")
        verifier(z2['z'] > z1['z'] * 1.2 and z3['z'] < z2['z'] * .6, f'＋ approche, － éloigne ({z1["z"]:.2f} → {z2["z"]:.2f} → {z3["z"]:.2f})')
        # la grille de l'alphabet : sous les outils, dans l'écran
        g0 = pg.evaluate("() => document.querySelector('#grille').hidden")
        pg.locator('#b-grille').click(force=True); pg.wait_for_timeout(400)
        g = pg.evaluate("() => { var e = document.querySelector('#grille'), r = e.getBoundingClientRect(); return {cache:e.hidden, r:[r.left, r.top, r.width, r.height]}; }")
        if g['cache']: pg.locator('#b-grille').click(force=True); pg.wait_for_timeout(400); g = pg.evaluate("() => { var e = document.querySelector('#grille'), r = e.getBoundingClientRect(); return {cache:e.hidden, r:[r.left, r.top, r.width, r.height]}; }")
        verifier(not g['cache'] and g['r'][1] >= e['barre'][1] + e['barre'][3] - 2 and g['r'][0] >= 0 and g['r'][0] + g['r'][2] <= e['w'] + 1, f'la grille de l\'alphabet se pose sous les outils, dans l\'écran ({[round(x) for x in g["r"]]})')
        pg.screenshot(path=f'{OUT}/sage-debout-{nom}-2-grille.png')
        pg.locator('#b-grille').click(force=True); pg.wait_for_timeout(300)
        # la rune : son code, puis on la promène sur l'encre cachée
        pg.locator('#b-code').click(force=True); pg.wait_for_selector('.pave-fen')
        pv = pg.evaluate("() => { var f = document.querySelector('.pave-fen').getBoundingClientRect(); return [f.left, f.top, f.width, f.height]; }")
        verifier(pv[0] >= 0 and pv[0] + pv[2] <= e['w'] + 1 and pv[1] >= 0 and pv[1] + pv[3] <= e['h'] + 1, f'le pavé des codes tient dans l\'écran debout ({[round(x) for x in pv]})')
        for k in ('flamme', 'etoile', 'cle'): pg.locator('.pave [data-sym="%s"]' % k).first.click(force=True)
        pg.wait_for_timeout(900)
        fen = pg.locator('.fen [data-fen-fermer], .fen .aller').first
        if pg.locator('.fen').count(): pg.screenshot(path=f'{OUT}/sage-debout-{nom}-3-rune-fen.png'); fen.click(force=True); pg.wait_for_timeout(600)
        r = pg.evaluate("() => { var e = document.querySelector('#rune'), r = e.getBoundingClientRect(); return {cache:e.hidden, r:[r.left, r.top, r.width, r.height]}; }")
        verifier(not r['cache'] and r['r'][1] + r['r'][3] <= e['h'] + 1 and r['r'][0] >= 0, f'la rune est en bas, dans l\'écran ({[round(x) for x in r["r"]]})')
        # on la promène sur la note « fleur » (encre cachée) : on y va d'abord
        nt = pg.evaluate("() => { var N = window.SAGE.notes.filter(function(n){ return n.id === 'fleur'; })[0]; window.SAGE.centrerSur(N.x, N.y, .7); return [N.x, N.y]; }"); pg.wait_for_timeout(900)
        pos = pg.evaluate("(n) => { var z = window.SAGE.zoom(), r = document.querySelector('#table').getBoundingClientRect(); return [r.left + z.tx + (n[0] - z.pv.x) * z.z, r.top + z.ty + (n[1] - z.pv.y) * z.z]; }", nt)
        rx, ry = r['r'][0] + r['r'][2] / 2, r['r'][1] + r['r'][3] / 2
        pg.mouse.move(rx, ry); pg.mouse.down(); pg.mouse.move(pos[0] - 60, pos[1], steps=10)
        for dx in range(-60, 70, 12):
            for dy in (-16, 0, 16): pg.mouse.move(pos[0] + dx, pos[1] + dy, steps=2)
        pg.mouse.up(); pg.wait_for_timeout(700)
        enc = pg.evaluate("() => { var S = window.SAGE.etat(); return {encre:Object.keys(S.encre || {}).length, finie:Object.keys(S.encreFinie || {})}; }")
        verifier(enc['encre'] > 0 or len(enc['finie']) > 0, f'la rune, promenée debout sur le plan, réveille l\'encre cachée ({enc})')
        pg.screenshot(path=f'{OUT}/sage-debout-{nom}-4-encre.png')
        # on tourne l'écran : tout se range tout seul, dans les deux sens
        pg.set_viewport_size({'width': vue['height'], 'height': vue['width']}); pg.wait_for_timeout(700)
        c = etat(pg)
        verifier(c['tourne'] and not c['debout'] and c['barre'][0] > c['w'] * .7 and c['barre'][3] > c['h'] * .8, f'couché : les outils repassent à droite ({[round(x) for x in c["barre"]]})')
        pg.screenshot(path=f'{OUT}/sage-debout-{nom}-5-couche.png')
        pg.set_viewport_size(vue); pg.wait_for_timeout(700)
        d = etat(pg)
        verifier(d['debout'] and d['barre'][1] < 30 and d['barre'][3] < 90, 'redressé : les outils reviennent en haut')
        ctx.close()
    b.close()
print('\nErreurs JavaScript :', len(erreurs))
for e in erreurs[:6]: print('   ', e[:300])
print(f'Sage debout : {n[0] - len(echecs)} vérifications réussies, {len(echecs)} échecs')
sys.exit(1 if echecs or erreurs else 0)
