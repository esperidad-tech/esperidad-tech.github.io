import time,sys,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
  for (w,h,dpr,nom) in [(844,390,3,'téléphone'),(1024,768,2,'tablette')]:
   for fin in ['0','1','2']:
    b=p.chromium.launch(args=['--disable-gpu']); ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=dpr,has_touch=True,is_mobile=True)
    pg=ctx.new_page(); cdp=ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.add_init_script("localStorage.setItem('pisteur3_finesse','%s')"%fin)
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1.2); pg.tap('#btnGo'); time.sleep(0.3)
    pg.evaluate("__pt.invincible(true)")
    time.sleep(3); pg.evaluate("window.__f0=performance.now();window.__n=0;(function f(){window.__n++;requestAnimationFrame(f)})()"); time.sleep(7)
    print(nom,'finesse',fin, round(pg.evaluate("__n/(performance.now()-__f0)*1000"),1), pg.evaluate("__pt.etat().taille"), 'finesse finale',pg.evaluate("__pt.etat().finesse"))
    b.close()
