import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/pisteur2/index.html'); time.sleep(0.8)
    pg.screenshot(path='/tmp/pt/g-regles.png')
    pg.tap('#btnGo')
    r=pg.evaluate("(()=>{const r=document.getElementById('jeu').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
    cx=r[0]+r[2]/2; cy=r[1]+r[3]*0.55
    ok={'parade':False,'esquive':False,'taille':False,'eclat':False}
    t0=time.time()
    while time.time()-t0<60 and not all(ok.values()):
        s=pg.evaluate("(()=>{const s=__pt.etat(),G=s.G;return G?{e:G.etat,de:G.att?G.att.de:null,so:G.att?G.att.sorte:null,tti:G.att?G.att.arme-G.t:9,par:s.stats.parades,esq:s.stats.esquives+s.stats.parfaites,coups:s.stats.coups,ecl:s.stats.eclats}:null})()")
        if not s: time.sleep(0.05); continue
        if s['e']=='arme' and s['tti']<0.32 and s['so']!='rouge' and (not ok['parade'] or ok['esquive']):
            dx={'g':-90,'d':90}.get(s['de'],0); dy=-90 if s['de']=='h' else 0
            pg.mouse.move(cx,cy); pg.mouse.down(); pg.mouse.move(cx+dx*0.5,cy+dy*0.5,steps=2); pg.mouse.move(cx+dx,cy+dy,steps=2); pg.mouse.up()
            time.sleep(0.05)
            if not ok['parade']:
                ok['parade']=pg.evaluate("__pt.etat().stats.parades")>0
                if ok['parade']: pg.screenshot(path='/tmp/pt/g-parade.png')
        elif s['e']=='arme' and s['tti']<0.3 and (ok['parade'] and not ok['esquive'] or s['so']=='rouge'):
            pg.tap('#esqD' if s['de']=='g' else '#esqG'); time.sleep(0.5)
            ok['esquive']=pg.evaluate("__pt.etat().stats.esquives+__pt.etat().stats.parfaites")>0
        elif s['e'] in ('ouvert','sonne'):
            pg.mouse.move(cx-60,cy); pg.mouse.down(); pg.mouse.move(cx,cy,steps=2); pg.mouse.move(cx+60,cy,steps=2); pg.mouse.up()
            ok['taille']=pg.evaluate("__pt.etat().stats.coups")>0
        elif s['e']=='genou':
            pg.screenshot(path='/tmp/pt/g-genou.png'); pg.touchscreen.tap(cx,cy); time.sleep(0.6)
            ok['eclat']=pg.evaluate("__pt.etat().stats.eclats")>0
        elif s['e']=='garde' and ok['parade'] and ok['esquive'] and ok['taille'] and not ok['eclat']:
            pg.evaluate("(()=>{const G=__pt.etat().G;G.pv=1})()")
        time.sleep(0.03)
    print(ok, pg.evaluate("(()=>{const s=__pt.etat();return [s.G?s.G.etat:null,s.G?s.G.pv:null,s.P.etat,s.stats.eclats,s.duelI]})()")); print('ERREURS',errs)
    pg.screenshot(path='/tmp/pt/g-fin.png'); b.close()
