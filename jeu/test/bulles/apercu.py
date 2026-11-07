"""Aperçu rapide : intro + partie en cours aux 3 tailles (pour regarder le rendu)."""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'salle-bulles.html')
CAP = os.path.join(ICI, 'captures')
with sync_playwright() as p:
    nav = p.chromium.launch()
    for (w, h) in [(390, 844), (800, 1280), (1280, 800)]:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, has_touch=True)
        ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        page = ctx.new_page()
        err = []
        page.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: err.append(str(e)))
        page.goto(URL, wait_until='domcontentloaded')
        page.click('[data-niv="10"]')
        page.click('[data-jeu="bulles"]')
        page.wait_for_timeout(1800)
        page.screenshot(path=f'{CAP}/apercu-{w}x{h}-intro.png')
        page.click('.mj-go')
        page.wait_for_timeout(2600)
        page.screenshot(path=f'{CAP}/apercu-{w}x{h}-jeu.png')
        print(w, h, 'erreurs:', err)
        ctx.close()
    nav.close()
