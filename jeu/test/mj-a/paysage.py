import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'index.html')
CAP = os.path.join(ICI, 'captures')
JEUX = ['traces','poursuite','cachette','tir','rythme','bulles','melange','temperature','loupe']
with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width':1280, 'height':800}, has_touch=True)
    page = ctx.new_page()
    err = []
    page.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: err.append(str(e)))
    page.goto(URL); page.wait_for_timeout(300)
    for j in JEUX:
        page.evaluate("([t]) => window.lancerJeu(t, 7, {})", [j])
        page.wait_for_timeout(1500)
        if j in ('traces','loupe'): page.screenshot(path=f'{CAP}/{j}-1280-intro.png')
        page.click('.mj-go')
        page.wait_for_timeout(2600)
        page.screenshot(path=f'{CAP}/{j}-1280-jeu.png')
    # changement de jeu pendant l'intro : la démo doit s'arrêter seule
    page.evaluate("window.lancerJeu('traces', 1, {})"); page.wait_for_timeout(800)
    page.evaluate("document.getElementById('banc').innerHTML = ''"); 
    logs = []
    page.on('console', lambda m: logs.append(m.text))
    page.wait_for_timeout(3000)
    print('sons après fermeture :', [l for l in logs if '[son]' in l][:5])
    print('erreurs :', err)
    nav.close()
