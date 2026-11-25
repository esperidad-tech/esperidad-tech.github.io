import sys, time, json
from playwright.sync_api import sync_playwright
mode=sys.argv[1] if len(sys.argv)>1 else 'moyen'
dur='dur' in sys.argv
robot=open('/home/claude/pisteur2/tests/robot.js').read()
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/pisteur2/index.html'); time.sleep(1)
    pg.click('#btnGo'); time.sleep(0.3)
    nom=mode+('-dur' if dur else '')
    if dur:
        pg.click('#btnPause'); time.sleep(0.2); pg.click('#pDur'); pg.click('#pReprendre')
    pg.evaluate(f"window.__robotMode='{mode}'"); pg.evaluate(robot)
    vus=set(); t0=time.time(); last=None
    def shot(n):
        if n in vus: return
        vus.add(n); pg.screenshot(path=f'/tmp/pt/d-{nom}-{n}.png')
    while time.time()-t0<600:
        time.sleep(0.07)
        s=pg.evaluate("(()=>{const s=__pt.etat(),G=s.G;return {e:s.etatJeu,d:s.duelI,c:s.P.coeurs,pe:s.P.etat,lent:s.lent,ge:G?G.etat:null,gt:G?G.type:null,de:G&&G.att?G.att.de:null,so:G&&G.att?G.att.sorte:null,k:G&&G.att&&G.etat==='arme'?G.t/G.att.arme:0,fin:!!document.querySelector('#fRejouer'),fps:s.fps}})()")
        if s['ge']=='arme' and s['k']>0.75: shot(f"{s['gt']}-arme-{s['de']}-{s['so']}")
        if s['ge'] in ('ouvert','sonne'): shot(f"{s['gt']}-{s['ge']}")
        if s['ge']=='genou': shot(f"{s['gt']}-genou")
        if s['ge']=='passe': shot('belier-passe')
        if s['ge']=='entree': shot(f"{s['gt']}-entree")
        if s['pe']=='parade': shot('parade')
        if s['pe']=='esquive': shot('esquive')
        if s['pe']=='siffle': time.sleep(0.5); shot('betes')
        if s['pe']=='acheve': time.sleep(0.15); shot('acheve')
        if s['lent']: shot('ralenti')
        if s['d']!=last:
            last=s['d']; print(f"{time.time()-t0:6.1f}s golem {s['d']+1} ({s['gt']}) coeurs {s['c']} fps {s['fps']:.0f}", flush=True)
        if s['fin']:
            time.sleep(0.4); pg.screenshot(path=f'/tmp/pt/d-{nom}-fin.png'); break
    st=pg.evaluate("JSON.stringify({stats:__pt.etat().stats,rs:window.__rs,fpsMin:__pt.etat().fpsMin})")
    print(f"FIN {time.time()-t0:.0f}s", st)
    print('ERREURS', errs[:5])
    b.close()
