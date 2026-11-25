import time,base64
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.goto('file:///home/claude/pisteur4/index.html')
    for k in range(200):
        time.sleep(0.25)
        if pg.evaluate("window.__pt?__pt.etat().prepare:0")>=3: break
    d=pg.evaluate("""()=>{const F=__pt.ev('Salle.fond'),c=document.createElement('canvas');c.width=1336;c.height=836;const x=c.getContext('2d');x.drawImage(F,0,0,1336,836);
      __pt.ev("for(const o of OBS)if(!o.fond)Salle.dessinerObstacle(arguments.length?0:0,o,1)".replace('arguments.length?0:0','window.__x'))===0;return c.toDataURL('image/jpeg',0.86);}""") if False else None
    d=pg.evaluate("""()=>{const F=__pt.ev('Salle.fond'),c=document.createElement('canvas');c.width=1336;c.height=836;const x=c.getContext('2d');x.drawImage(F,0,0,1336,836);window.__x=x;
      __pt.ev("OBS.slice().sort((a,b)=>a.y-b.y).forEach(o=>{if(!o.fond)Salle.dessinerObstacle(window.__x,o,1)})");return c.toDataURL('image/jpeg',0.88);}""")
    open('/tmp/p4/salle.jpg','wb').write(base64.b64decode(d.split(',')[1])); print(errs[:3])
