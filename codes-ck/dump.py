import sys, json, os
from playwright.sync_api import sync_playwright
d, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + os.path.join(d, 'index.html')); pg.wait_for_timeout(500)
    r = pg.evaluate("() => { var o = {}; [1,2,3].forEach(function(n){ var E = ENQUETES[n]; var c = M.codesEnquete(E).parId, x = {}; Object.keys(c).sort().forEach(function(k){ x[k] = c[k].join('-'); }); o[n] = x; }); return o; }")
    json.dump(r, open(out, 'w'), indent=0, sort_keys=True); b.close()
print('ok')
