import time,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:400])); pg.on('console',lambda m: errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    pg.goto('file:///home/claude/pisteur4/index.html'); t0=time.time()
    for k in range(200):
        time.sleep(0.25)
        if pg.evaluate("window.__pt?__pt.etat().prepare:0")>=3: break
    print('chargement',round(time.time()-t0,1),'s'); pg.screenshot(path='/tmp/p4/01-regles.png')
    print('ERREURS avant départ',errs[:6])
    pg.tap('#btnGo'); time.sleep(0.6); pg.screenshot(path='/tmp/p4/02-debut.png')
    time.sleep(4); pg.screenshot(path='/tmp/p4/03-apres.png')
    print(pg.evaluate("JSON.stringify((()=>{const s=__pt.etat();return {e:s.etatJeu,ph:s.phase,v:s.vague,garde:s.garde,G:s.G.map(g=>[g.type,g.etat,g.role,+g.x.toFixed(1),+g.y.toFixed(1)]),P:[s.P.x,s.P.y,s.P.cache],msg:s.msg,fps:s.fps,taille:s.taille}})())"))
    print('ERREURS',errs[:8])
