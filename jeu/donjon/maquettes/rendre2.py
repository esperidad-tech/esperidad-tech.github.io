import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(ICI, 'combat.js')).read()
JEU = os.environ.get('JEU', '/home/claude/brumeval/brumeval-sources/d-rapide/index.html')
quoi = sys.argv[1:] or ['pisteur', 'alchimiste', 'sage']
with sync_playwright() as p:
    b = p.chromium.launch()
    for r in quoi:
        pg = b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + JEU); pg.wait_for_timeout(400)
        pg.add_script_tag(content=JS)
        pg.evaluate("(r) => { document.body.innerHTML = '<div style=\"position:fixed;inset:0\">' + COMBAT.scene(r) + '</div>'; document.body.style.margin = 0; }", r)
        pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(ICI, f'combat-{r}.png'))
        print(r, errs); pg.close()
    b.close()
