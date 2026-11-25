import time
from playwright.sync_api import sync_playwright
robot=open('/home/claude/pisteur2/tests/robot.js').read()
for (w,h,dpr,nom) in [(390,844,3,'téléphone'),(768,1024,2,'tablette')]:
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--disable-gpu']); pg=b.new_page(viewport={'width':w,'height':h},device_scale_factor=dpr,has_touch=True,is_mobile=True)
    cdp=pg.context.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.goto('file:///home/claude/pisteur2/index.html'); time.sleep(1); pg.tap('#btnGo'); time.sleep(0.3)
    pg.evaluate("window.__robotMode='moyen'"); pg.evaluate(robot)
    pg.evaluate("window.__fp=[];(function f(){window.__fp.push(__pt.etat().fps);setTimeout(f,1000)})()")
    time.sleep(30); fp=pg.evaluate("window.__fp")[3:]
    print(nom,'ralenti x4 : moyenne',round(sum(fp)/len(fp)),'pire',round(min(fp)))
    b.close()
