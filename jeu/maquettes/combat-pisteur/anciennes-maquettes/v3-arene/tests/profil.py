import time,sys
from playwright.sync_api import sync_playwright
robot=open('/home/claude/pisteur3/tests/robot.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--disable-gpu']); ctx=b.new_context(viewport={'width':844,'height':390},device_scale_factor=3,has_touch=True,is_mobile=True)
    pg=ctx.new_page(); cdp=ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.add_init_script("localStorage.setItem('pisteur3_finesse','%s')"%(sys.argv[1] if len(sys.argv)>1 else '0'))
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1.2); pg.tap('#btnGo'); time.sleep(0.3)
    pg.evaluate("__pt.invincible(true)"); pg.evaluate("window.__robotChoix=0")
    if 'robot' in sys.argv: pg.evaluate(robot)
    time.sleep(4); pg.evaluate("window.__prof={}"); time.sleep(15)
    r=pg.evaluate("(()=>{const q=window.__prof;return {n:q.n,ms:q.s.map(v=>+(v/q.n).toFixed(2)),regles:+(q.regles/q.n).toFixed(2),fps:__pt.etat().fps,fin:__pt.etat().finesse,taille:__pt.etat().taille}})()")
    print(r)
    b.close()
