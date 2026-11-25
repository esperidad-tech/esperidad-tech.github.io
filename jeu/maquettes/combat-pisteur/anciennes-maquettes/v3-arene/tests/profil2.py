import time,sys,json
from playwright.sync_api import sync_playwright
opts=[{},{'snap':1},{'sansVign':1},{'snap':1,'sansVign':1},{'sansFond':1,'sansVign':1}]
with sync_playwright() as p:
  for o in opts:
    b=p.chromium.launch(args=['--disable-gpu']); ctx=b.new_context(viewport={'width':844,'height':390},device_scale_factor=3,has_touch=True,is_mobile=True)
    pg=ctx.new_page(); cdp=ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.add_init_script("localStorage.setItem('pisteur3_finesse','2');window.__opt=%s"%json.dumps(o))
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1.2); pg.tap('#btnGo'); time.sleep(0.3)
    pg.evaluate("__pt.invincible(true)")
    time.sleep(3); pg.evaluate("window.__f0=performance.now();window.__n=0;(function f(){window.__n++;requestAnimationFrame(f)})()"); time.sleep(8)
    print(o, round(pg.evaluate("__n/(performance.now()-__f0)*1000"),1))
    b.close()
