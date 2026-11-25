import time,sys
from playwright.sync_api import sync_playwright
robot=open('/home/claude/pisteur4/tests/robot.js').read()
fin=sys.argv[1] if len(sys.argv)>1 else '2'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--disable-gpu']); ctx=b.new_context(viewport={'width':844,'height':390},device_scale_factor=3,has_touch=True,is_mobile=True)
    pg=ctx.new_page(); cdp=ctx.new_cdp_session(pg)
    pg.goto('file:///home/claude/pisteur4/index.html?finesse='+fin)
    for k in range(600):
        time.sleep(0.25)
        if pg.evaluate("window.__pt?__pt.ev('PS.complet'):false"): break
    cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.evaluate("__pt.demarrer(4)"); time.sleep(0.3)
    pg.evaluate("__pt.invincible(true)"); pg.evaluate("window.__robotChoix=0"); pg.evaluate(robot)
    time.sleep(6); pg.evaluate("window.__prof={}"); time.sleep(16)
    r=pg.evaluate("(()=>{const q=window.__prof;return {n:q.n,ms:q.s.map(v=>+(v/q.n).toFixed(2)),regles:+(q.regles/q.n).toFixed(2),fps:__pt.etat().fps,fin:__pt.etat().finesse,taille:__pt.etat().taille,SB:__pt.ev('Salle.SB'),S:__pt.ev('S')}})()")
    print('fond, fondVivant, sol, tri(obstacles+persos), air+parts, interface :',r)
    b.close()
