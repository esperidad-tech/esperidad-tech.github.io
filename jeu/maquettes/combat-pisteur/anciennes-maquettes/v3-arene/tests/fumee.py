import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1.2)
    pg.screenshot(path='/tmp/p3/01-regles.png')
    pg.tap('#btnGo'); time.sleep(0.5)
    pg.screenshot(path='/tmp/p3/02-debut.png')
    time.sleep(3)
    pg.screenshot(path='/tmp/p3/03-meute.png')
    print(pg.evaluate("JSON.stringify((()=>{const s=__pt.etat();return {e:s.etatJeu,ph:s.phase,v:s.vague,G:s.G.map(g=>[g.type,g.etat,+g.x.toFixed(1),+g.y.toFixed(1)]),P:[s.P.x,s.P.y],msg:s.msg,fps:s.fps,taille:s.taille}})())"))
    print('ERREURS',errs[:8])
