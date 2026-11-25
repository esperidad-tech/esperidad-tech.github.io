import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1)
    pg.screenshot(path='/tmp/p3/e-regles.png')
    bb=pg.locator('#btnGo').bounding_box(); print('bouton En garde visible :', bb['y']+bb['height']<=390, bb)
    pg.set_viewport_size({'width':390,'height':844}); time.sleep(0.4); pg.screenshot(path='/tmp/p3/e-tourne.png')
    print('message « tourne » :', pg.evaluate("document.getElementById('tourne').classList.contains('on')"))
    pg.set_viewport_size({'width':844,'height':390}); time.sleep(0.4)
    print('message « tourne » après retour :', pg.evaluate("document.getElementById('tourne').classList.contains('on')"))
    pg.tap('#btnGo'); time.sleep(0.4); pg.evaluate("__pt.ev('invincible=true;P.coeurs=0;toucherP')"); 
    pg.evaluate("__pt.ev('invincible=false;P.invul=0;toucherP(1,P.x+1,P.y,1)')"); time.sleep(0.2)
    pg.evaluate("__pt.ev('P.coeurs=1;P.invul=0;toucherP(1,P.x+1,P.y,1)')"); time.sleep(1.6)
    pg.screenshot(path='/tmp/p3/e-defaite.png'); print('défaite affichée :', pg.locator('#fReprendre').is_visible())
    pg.tap('#fReprendre'); time.sleep(0.5); s=pg.evaluate("__pt.etat()"); print('reprise : vague',s['vague']+1,'coeurs',s['P']['coeurs'],'état',s['etatJeu'])
    print('ERREURS',errs[:5])
