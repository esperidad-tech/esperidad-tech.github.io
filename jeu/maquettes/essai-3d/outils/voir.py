import sys
from playwright.sync_api import sync_playwright
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (844,390)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':W,'height':H},device_scale_factor=2); err=[]
    pg.on('pageerror',lambda e: err.append(str(e))); pg.on('console',lambda m: err.append(m.text) if m.type in('error','warning') else None)
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_function('window.__essai&&window.__essai.pret',timeout=180000)
    pg.wait_for_timeout(1500); pg.screenshot(path='/tmp/barde3d/e-0.png')
    pg.keyboard.down('ArrowLeft'); pg.keyboard.down('ArrowUp'); pg.wait_for_timeout(900); pg.screenshot(path='/tmp/barde3d/e-1.png'); pg.keyboard.up('ArrowLeft'); pg.keyboard.up('ArrowUp')
    pg.wait_for_timeout(500); pg.evaluate("__essai.lancer('feu')"); pg.wait_for_timeout(700); pg.screenshot(path='/tmp/barde3d/e-2.png'); pg.wait_for_timeout(450); pg.screenshot(path='/tmp/barde3d/e-3.png')
    print('ips', pg.evaluate('__essai.ips'), err[:8]); b.close()
