# Images par seconde avec un processeur ralenti 4 fois (téléphone ou tablette modeste), robot en jeu.
import time
from playwright.sync_api import sync_playwright
robot=open('/home/claude/pisteur3/tests/robot.js').read()
for (w,h,dpr,nom) in [(844,390,3,'téléphone'),(1024,768,2,'tablette')]:
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--disable-gpu']); ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=dpr,has_touch=True,is_mobile=True)
    pg=ctx.new_page(); cdp=ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1.2); pg.tap('#btnGo'); time.sleep(0.3)
    pg.evaluate("__pt.invincible(true)"); pg.evaluate("window.__robotChoix=0"); pg.evaluate(robot)
    pg.evaluate("window.__fp=[];(function f(){const s=__pt.etat();window.__fp.push([s.fps,s.finesse,s.G.length]);setTimeout(f,1000)})()")
    time.sleep(40); fp=pg.evaluate("window.__fp")[3:]
    print(nom,'x4 plus lent : images/s moyenne',round(sum(f[0] for f in fp)/len(fp)),'pire',round(min(f[0] for f in fp)),'finesse finale',fp[-1][1],'golems max',max(f[2] for f in fp), 'taille', pg.evaluate("__pt.etat().taille"))
    pg.screenshot(path=f'/tmp/p3/vitesse-{nom}.png')
    b.close()
