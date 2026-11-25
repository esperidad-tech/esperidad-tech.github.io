import sys, time, json
from playwright.sync_api import sync_playwright
inv='inv' in sys.argv; dur='dur' in sys.argv; mal='mal' in sys.argv; brute='brute' in sys.argv
nom=('inv' if inv else 'robot')+('-dur' if dur else '')+('-mal' if mal else '')+('-brute' if brute else '')
robot=open('/home/claude/pisteur4/tests/robot.js').read()
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:500]))
    pg.goto('file:///home/claude/pisteur4/index.html')
    for k in range(300):
        time.sleep(0.25)
        if pg.evaluate("window.__pt?__pt.etat().prepare:0")>=3: break
    pg.tap('#btnGo'); time.sleep(0.3)
    if inv: pg.evaluate("__pt.invincible(true)")
    if dur: pg.evaluate("__pt.dur(true)")
    if mal: pg.evaluate('window.__robotMal=true')
    if brute: pg.evaluate('window.__robotBrute=true')
    pg.evaluate(robot)
    vus=set(); t0=time.time(); lastv=None; morts=0
    def shot(n):
        if n in vus: return
        vus.add(n); pg.screenshot(path=f'/tmp/p4/{nom}-{n}.png')
    while time.time()-t0<1500:
        time.sleep(0.07)
        s=pg.evaluate("""(()=>{const s=__pt.etat();return {e:s.etatJeu,v:s.vague,c:s.P.coeurs,pe:s.P.etat,ca:s.P.cache,ch:s.choix,garde:s.garde,dir:s.dir,
          G:s.G.map(g=>({t:g.type,e:g.etat,z:g.zone?g.zone.k:null,p:g.zone?g.zone.p:0,r:g.rem})),ob:s.obus.length,on:s.ondes.length,
          fin:s.etatJeu==='fin'&&!!document.querySelector('#fRejouer'),def:s.etatJeu==='fin'&&!!document.querySelector('#fReprendre'),fps:s.fps}})()""")
        for g in s['G']:
            if g['z'] and g['p']>0.6: shot(f"zone-{g['t']}-{g['z']}")
            if g['e'] in ('charge','fauche','estoc','marteau'): shot(f"{g['t']}-{g['e']}")
        if s['on']: shot('onde')
        if s['pe']=='assassin': shot('assassin')
        if s['pe']=='vise': shot('vise')
        if s['garde']=='recherche': shot('recherche')
        for k in ('patrouille','groupes','debusque','assaut'):
            if s['dir'][k]: shot('ordre-'+k)
        if s['ch']: time.sleep(0.3); shot(f"choix-{s['v']}")
        if s['v']!=lastv:
            lastv=s['v']; print(f"{time.time()-t0:6.1f}s vague {s['v']+1} coeurs {s['c']} fps {s['fps']:.0f}", flush=True)
        if s['def']:
            morts+=1; print(f"{time.time()-t0:6.1f}s  à terre pendant la vague {s['v']+1}", flush=True); shot(f"defaite-{morts}")
            if morts>=12: break
            pg.click('#fReprendre'); time.sleep(0.3); continue
        if s['fin']:
            time.sleep(0.4); pg.screenshot(path=f'/tmp/p4/{nom}-fin.png'); break
    st=pg.evaluate("JSON.stringify({stats:__pt.etat().stats,rs:window.__rs,up:__pt.etat().P.up})")
    print(f"FIN {time.time()-t0:.0f}s morts {morts}", st)
    print('ERREURS', errs[:6])
