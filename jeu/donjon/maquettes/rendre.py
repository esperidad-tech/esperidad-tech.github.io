import sys
from playwright.sync_api import sync_playwright
JS = open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'maquettes.js')).read()
TAILLES = {'A': (844, 390), 'B': (390, 844), 'C': (390, 844)}
quoi = sys.argv[1:] or ['A', 'B', 'C']
with sync_playwright() as p:
    b = p.chromium.launch()
    for k in quoi:
        w, h = TAILLES[k]
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__), '../../../d-rapide/index.html'))); pg.wait_for_timeout(500)
        pg.add_script_tag(content=JS)
        pg.evaluate("(k) => { var h = MAQ[k](); document.body.innerHTML = '<div id=\"zz\" style=\"position:fixed;inset:0\">' + h + '</div>'; document.body.style.margin = 0; }", k)
        pg.wait_for_timeout(400)
        pg.screenshot(path=f'donjon-{k}.png')
        print(k, errs)
        pg.close()
    b.close()
