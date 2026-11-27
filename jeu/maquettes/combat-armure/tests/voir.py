# Ouvre la page, démarre, joue un peu (un robot ou rien), prend des photos.  python3 tests/voir.py [role] [tiers] [secondes] [w h]
import os, sys, asyncio
from playwright.async_api import async_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); PAGE = 'file://' + os.path.join(ICI, '..', 'combat-armure.html')
role = sys.argv[1] if len(sys.argv) > 1 else 'barde'; tiers = int(sys.argv[2]) if len(sys.argv) > 2 else 1; sec = float(sys.argv[3]) if len(sys.argv) > 3 else 6
W, H = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (844, 390)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        err = []
        pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.goto(PAGE + '?role=' + role)
        await pg.evaluate("r=>{localStorage.setItem('armure-reglages',JSON.stringify({role:r,pisteur:15}));}", role)
        await pg.reload()
        await pg.wait_for_function('window.__p2&&window.__p2.pret', timeout=90000)
        await pg.screenshot(path='/tmp/a-debut.png')
        await pg.evaluate('window.__p2.demarrer()')
        if tiers > 1: await pg.evaluate('t=>window.__p2.P2.aller(window.__p2.S,t)', tiers)
        n = int(sec // 2)
        for i in range(n):
            await pg.evaluate("""()=>{const S=window.__p2.S,P2=window.__p2.P2;if(!S.h.lance&&S.h.mort<=0)P2.lancer(S,Math.random()<0.5?'feu':'glace');}""")
            await pg.wait_for_timeout(2000)
            await pg.screenshot(path='/tmp/a-%d.png' % i)
        info = await pg.evaluate('()=>({ips:window.__p2.ips,S:{vie:window.__p2.S.vie,pv:window.__p2.S.h.pv,tirs:window.__p2.S.tirs.length,ph:window.__p2.S.phase},son:window.__p2.SON.ERR,fx:window.__p2.FX.n})')
        print(info); print('\n'.join(err[:12]))
        await b.close()
asyncio.run(main())
