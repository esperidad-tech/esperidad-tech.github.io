"""Aperçu rapide : intro + partie de chaque jeu aux 3 tailles (pour regarder le rendu)."""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.abspath(os.path.join(ICI, '..', '..', 'dist', 'salle-mini-jeux.html'))
CAP = os.path.join(ICI, 'captures')
JEUX = sys.argv[1].split(',') if len(sys.argv) > 1 else ['differences', 'double', 'insectes']
NIV = sys.argv[2] if len(sys.argv) > 2 else '3'
TAILLES = [(390, 844), (800, 1280), (1280, 800)]
with sync_playwright() as p:
    nav = p.chromium.launch()
    for (w, h) in TAILLES:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, has_touch=True)
        ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        page = ctx.new_page()
        err = []
        page.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: err.append(str(e)))
        page.goto(URL, wait_until='domcontentloaded')
        for jeu in JEUX:
            page.click('[data-niv="%s"]' % NIV)
            page.click('[data-jeu="%s"]' % jeu)
            page.wait_for_timeout(1500)
            page.screenshot(path=f'{CAP}/apercu-{jeu}-{w}x{h}-intro.png')
            page.click('.mj-go')
            page.wait_for_timeout(2200)
            page.screenshot(path=f'{CAP}/apercu-{jeu}-{w}x{h}-jeu.png')
            page.click('.sl-quitter')
            page.wait_for_timeout(200)
        print(w, h, 'erreurs:', [e for e in err if 'fonts.g' not in e and 'ERR_FAILED' not in e])
        ctx.close()
    nav.close()
