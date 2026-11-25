# Images par seconde avec un processeur ralenti (téléphone ou vieille tablette), sans carte graphique, robot en jeu.
import time,sys
from playwright.sync_api import sync_playwright
robot=open('/home/claude/pisteur4/tests/robot.js').read()
cas=[(844,390,3,'téléphone',4,2),(1024,768,2,'tablette',4,5),(1024,768,2,'tablette',6,7)]
if len(sys.argv)>1: cas=[cas[int(sys.argv[1])]]
for (w,h,dpr,nom,ral,vag) in cas:
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--disable-gpu']); ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=dpr,has_touch=True,is_mobile=True)
    pg=ctx.new_page(); cdp=ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':ral})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.goto('file:///home/claude/pisteur4/index.html'); t0=time.time()
    for k in range(600):
        time.sleep(0.25)
        if pg.evaluate("window.__pt?__pt.etat().prepare:0")>=3: break
    tc=time.time()-t0
    for k in range(400):
        time.sleep(0.25)
        if pg.evaluate("__pt.ev('PS.complet')"): break
    tcc=time.time()-t0
    pg.evaluate("__pt.demarrer(%d)"%vag); time.sleep(0.3)
    pg.evaluate("__pt.invincible(true)"); pg.evaluate("window.__robotChoix=0"); pg.evaluate(robot)
    pg.evaluate("window.__fp=[];(function f(){const s=__pt.etat();window.__fp.push([s.fps,s.finesse,s.G.length]);setTimeout(f,1000)})()")
    time.sleep(45); fp=pg.evaluate("window.__fp")[4:]
    print(f"{nom} ralenti x{ral}, vague {vag+1} : chargement {tc:.0f} s (tout cuit {tcc:.0f} s) ; images/s moyenne {sum(f[0] for f in fp)/len(fp):.0f}, pire {min(f[0] for f in fp):.0f}, finesse finale {fp[-1][1]}, golems max {max(f[2] for f in fp)}, image {pg.evaluate('__pt.etat().taille')}", errs[:2], flush=True)
    b.close()
