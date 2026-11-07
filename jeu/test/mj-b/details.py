import os, sys
from playwright.sync_api import sync_playwright
ICI=os.path.dirname(os.path.abspath(__file__)); URL='file://'+os.path.join(ICI,'index.html')+'?persos=1'; S=os.path.join(ICI,'captures')
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(400)
    # tic visible
    for niv in (2,8):
        pg.evaluate('([n]) => lancer("mensonge", n, {})',[niv]); pg.wait_for_timeout(300); pg.click('.mj-go')
        pg.wait_for_function("() => document.querySelector('.mjb-portrait.tic')", timeout=40000)
        pg.wait_for_timeout(250 if niv==8 else 600)
        pg.screenshot(path=os.path.join(S,'x-tic-%d.png'%niv))
    for jeu in ('alphabet','runes','plans','ordre'):
        pg.evaluate('([j]) => lancer(j, 8, {aide:1, revele: j==="runes"})',[jeu]); pg.wait_for_timeout(300); pg.click('.mj-go'); pg.wait_for_timeout(700)
        pg.screenshot(path=os.path.join(S,'x-%s-8.png'%jeu))
    pg.evaluate('() => lancer("ragots", 7, {})'); pg.wait_for_timeout(300); pg.click('.mj-go')
    for i in range(5):
        pg.wait_for_timeout(700); pg.click('.mjb-vrai')
    pg.wait_for_timeout(900); pg.screenshot(path=os.path.join(S,'x-recap.png'))
    b.close()
print(errs)
