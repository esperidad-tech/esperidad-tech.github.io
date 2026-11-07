import sys, json, urllib.parse, os
from playwright.sync_api import sync_playwright
base = os.path.dirname(os.path.abspath(__file__))
spec = json.loads(sys.argv[1]); out = sys.argv[2]
w = spec.get('w', 300); n = len(spec['items']); cols = spec.get('cols', n)
url = 'file://' + base + '/zoom.html#' + urllib.parse.quote(json.dumps(spec))
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': cols * (w + 8) + 16, 'height': 600})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(300)
    pg.query_selector('#z').screenshot(path=out)
    if errs: print('ERR', errs)
    b.close()
