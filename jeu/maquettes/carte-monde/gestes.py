"""Les gestes de la page du modèle : toucher la brume, les deux boutons, le zoom, glisser au doigt et à la souris."""
import os, sys
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'carte-monde.html')
ok = True
def verifie(nom, cond, detail=''):
    global ok
    print(('  ✓ ' if cond else '  ✗ ') + nom + (' — ' + str(detail) if detail and not cond else ''))
    if not cond: ok = False
with sync_playwright() as p:
    b = p.chromium.launch()
    for nom, (w, h, tactile) in {'ipad couché': (1180, 820, True), 'téléphone': (390, 844, True), 'ordinateur': (1400, 900, False)}.items():
        print(nom)
        erreurs = []
        pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=tactile).new_page()
        pg.on('pageerror', lambda e: erreurs.append(str(e)[:200]))
        pg.goto(URL); pg.wait_for_timeout(600)
        etat = lambda: pg.evaluate("() => ({levees: [].map.call(document.querySelectorAll('.bm-zone.bm-levee'), g => g.dataset.zone), caches: [].map.call(document.querySelectorAll('.mo-contenu.mo-cache'), g => g.dataset.zone), vus: [].map.call(document.querySelectorAll('.mo-etiq-zone.mo-vu'), g => g.dataset.zone), k: __carte.V.k, sl: document.getElementById('vue').scrollLeft, st: document.getElementById('vue').scrollTop, mw: document.getElementById('monde').offsetWidth, vw: document.getElementById('vue').clientWidth, vh: document.getElementById('vue').clientHeight, mh: document.getElementById('monde').offsetHeight})")
        e = etat()
        verifie('au départ : toute la brume, rien de dessiné dessous', e['levees'] == [] and len(e['caches']) == 8 and e['vus'] == [], e)
        verifie('la carte remplit tout l\'écran (pas de bande vide)', e['mw'] >= e['vw'] - 1 and e['mh'] >= e['vh'] - 1, e)
        # le milieu de l'écran = le village : toucher là ne lève rien
        (pg.touchscreen.tap if tactile else pg.mouse.click)(w / 2, h / 2); pg.wait_for_timeout(200)
        verifie('toucher le village ne lève aucune brume', etat()['levees'] == [])
        # toucher la brume en haut à gauche du cadre (zone nord-ouest, ou la zone visible à cet endroit)
        x, y = (60, 140)
        z = pg.evaluate(f"() => {{ var el = document.elementFromPoint({x}, {y}); var g = el && el.closest('.bm-zone'); return g ? g.dataset.zone : null; }}")
        verifie('sous le doigt, en haut à gauche : un banc de brume', z is not None, z)
        (pg.touchscreen.tap if tactile else pg.mouse.click)(x, y); pg.wait_for_timeout(300)
        e = etat()
        verifie(f'toucher la brume lève la zone « {z} », son contenu est dessiné, ses étiquettes aussi', e['levees'] == [z] and z not in e['caches'] and e['vus'] == [z], e)
        verifie('le mot du bas nomme la zone', 'La brume se lève' in pg.inner_text('#mot'), pg.inner_text('#mot'))
        pg.click('#sans'); pg.wait_for_timeout(300)
        e = etat(); verifie('« Sans la brume » : les 8 zones levées', len(e['levees']) == 8 and e['caches'] == [], e)
        verifie('le bouton « Sans la brume » est le jaune', pg.get_attribute('#sans', 'aria-pressed') == 'true' and pg.get_attribute('#avec', 'aria-pressed') == 'false')
        pg.click('#avec'); pg.wait_for_timeout(2100)
        e = etat(); verifie('« Avec la brume » : tout revient, et le contenu est retiré une fois la brume revenue', e['levees'] == [] and len(e['caches']) == 8, e)
        k0 = e['k']; pg.click('#plus'); pg.wait_for_timeout(200); e = etat()
        verifie('＋ zoome', e['k'] > k0 * 1.2, (k0, e['k']))
        cx = (e['sl'] + e['vw'] / 2) / e['k']; cy = (e['st'] + e['vh'] / 2) / e['k']
        verifie('le zoom garde le village au milieu', abs(cx - 1500) < 40 and abs(cy - 1030) < 60, (cx, cy))
        [pg.click('#plus', force=True) for _ in range(3)]; pg.wait_for_timeout(150)
        verifie('au plus gros, ＋ est éteint', pg.is_disabled('#plus'))
        sl0 = etat()['sl']
        if tactile:
            pg.evaluate("() => { document.getElementById('vue').scrollLeft += 300; }")
        else:
            pg.mouse.move(w / 2, h / 2); pg.mouse.down(); pg.mouse.move(w / 2 - 300, h / 2 + 40, steps=8); pg.mouse.up()
        pg.wait_for_timeout(200); e = etat()
        verifie('la carte glisse', abs(e['sl'] - sl0 - 300) < 6, (sl0, e['sl']))
        verifie('glisser ne lève pas de brume', e['levees'] == [], e['levees'])
        for i in range(5): pg.click('#moins', force=True)
        pg.wait_for_timeout(150); verifie('au plus petit, － est éteint', pg.is_disabled('#moins'))
        verifie('aucune erreur', not erreurs, erreurs)
        pg.context.close()
    b.close()
print('TOUT EST BON' if ok else 'IL Y A DES ÉCHECS'); sys.exit(0 if ok else 1)
