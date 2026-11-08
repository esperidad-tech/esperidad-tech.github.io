"""Maquettes de la carte d'exploration du donjon : python3 rendre.py [debut milieu plan] -> explo-debut.png, explo-milieu.png, plan-sage.png (à 2x)."""
import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
SRC = '/home/claude/brumeval/brumeval-sources/jeu/donjon/maquettes/combat2.js'
COMBAT = open(SRC).read().replace('window.COMBAT = {scene:scene};', 'window.COMBAT = {scene:scene, pisteur:pisteur, alchimiste:alchimiste, sage:sage, DEFAUT:DEFAUT};')
JS = open(os.path.join(ICI, 'donjon.js')).read()
PLAN = open(os.path.join(ICI, 'plan.js')).read() if os.path.exists(os.path.join(ICI, 'plan.js')) else ''
NOMS = {'debut': 'explo-debut.png', 'impasse': 'explo-impasse.png', 'milieu': 'explo-milieu.png', 'plan': 'plan-sage.png', 'tout': 'controle-tout.png'}
quoi = sys.argv[1:] or ['debut', 'impasse', 'milieu', 'plan', 'tout']
HTML = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}</style></head><body></body></html>'
with sync_playwright() as p:
    b = p.chromium.launch()
    for q in quoi:
        pg = b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pg.set_content(HTML)
        pg.add_script_tag(content=COMBAT)
        pg.add_script_tag(content=JS)
        if PLAN:
            pg.add_script_tag(content=PLAN)
        pg.evaluate("""() => { var D = COMBAT.DEFAUT; window.HEROS = {};
          ['pisteur','alchimiste','sage'].forEach(function(r){ window.HEROS[r] = COMBAT[r](D[r]).replace('viewBox="0 0 250 300"', 'viewBox="74 4 100 100"'); }); }""")
        if q == 'plan':
            pg.evaluate("() => { document.body.innerHTML = PLAN_SAGE(); }")
        else:
            pg.evaluate("(q) => { document.body.innerHTML = EXPLO.vue(q); }", q)
        pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(ICI, NOMS[q]))
        print(q, errs)
        pg.close()
    b.close()
