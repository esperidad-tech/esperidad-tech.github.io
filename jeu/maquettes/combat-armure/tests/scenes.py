# Des photos de chaque coup du boss et de chaque sort, dans la vraie page.  python3 tests/scenes.py [role] [scène…]
import os, sys, asyncio
from playwright.async_api import async_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); PAGE = 'file://' + os.path.join(ICI, '..', 'combat-armure.html')
role = sys.argv[1] if len(sys.argv) > 1 else 'barde'
ROCS = "S.colonnes=[{x:5,y:5},{x:8,y:6.6},{x:12.5,y:5.4},{x:14,y:8.2},{x:3.5,y:8.4},{x:10.6,y:8.9}];"
SC = {
  'rocs': (1, "S.forcer='colonnes';S.prochaine=0;", [1.2, 2.3]),
  'vague': (1, ROCS + "S.h.x=8.6;S.h.y=7.4;S.forcer='vague';S.prochaine=0;", [1.4, 2.6, 3.4]),
  'crepite': (1, "S.forcer='crepite';S.prochaine=0;", [2.2, 3.1]),
  'reps': (1, "S.forcer='reparateurs';S.prochaine=0;", [2.0]),
  'sortFeu': (1, "P2.lancer(S,'feu');", [1.6, 3.2, 3.5]),
  'sortGlace': (1, "P2.lancer(S,'glace');", [1.0, 1.65]),
  'givre': (2, "S.forcer='main';S.derniereMain='braise';S.rnd=()=>0.1;S.prochaine=0;", [4.0]),
  'braise': (2, "S.forcer='main';S.derniereMain='givre';S.rnd=()=>0.9;S.prochaine=0;", [4.0]),
  'orbe': (2, "S.forcer='orbe';S.prochaine=0;", [2.0]),
  'rayon': (3, "S.t3.rayon=0;", [1.5, 5.0]),
  'doigts': (3, "S.forcer='doigts';S.prochaine=0;", [1.2, 2.05]),
  'danse': (3, "S.t3.danse=0;", [1.0, 2.6]),
  'coque': (3, "S.t3.coque=0;", [3.0]),
  'crevasse': (3, "S.t3.crev=0;", [1.0, 2.5]),
  'bulle': (1, "P2.symboleTout(S);", [1.5]),
  'cible': (1, "S.forcer='reparateurs';S.prochaine=0;setTimeout(()=>{if(S.reps[0])P2.viser(S,S.reps[0].x,S.reps[0].y);P2.lancer(S,'glace');},1500);", [2.6, 3.3]),
  'porte': (2, "S.orbe={x:S.h.x,y:S.h.y,couleur:'rouge',t:1,porte:true};S.h.orbe=S.orbe;", [0.8]),
  'mort': (1, "S.h.intouchable=0;S.h.pv=10;S.forcer='crepite';S.crepite={cote:S.h.x<9?'g':'d',t:2.8};", [0.6, 4.0]),
}
noms = sys.argv[2:] or list(SC)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        err = []
        pg.on('console', lambda m: err.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: err.append(str(e)))
        await pg.goto(PAGE)
        await pg.evaluate("r=>{localStorage.setItem('armure-reglages',JSON.stringify({role:r,pisteur:0}));}", role)
        await pg.reload()
        await pg.wait_for_function('window.__p2&&window.__p2.pret', timeout=90000)
        for nom in noms:
            ti, js, temps = SC[nom]
            await pg.evaluate('window.__p2.demarrer()')
            await pg.evaluate("t=>{const S=window.__p2.S,P2=window.__p2.P2;if(t>1)P2.aller(S,t);S.prochaine=999;S.t3={rayon:999,coque:999,danse:999,crev:999};S.h.intouchable=999;}", ti)
            await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{const S=window.__p2.S,P2=window.__p2.P2;" + js + "}")
            t0 = 0
            for i, t in enumerate(temps):
                await pg.wait_for_timeout(int((t - t0) * 1000)); t0 = t
                await pg.screenshot(path='/tmp/sc-%s-%d.png' % (nom, i))
            print(nom, 'ok')
        print('ips', await pg.evaluate('window.__p2.ips'), 'sons', await pg.evaluate('window.__p2.SON.ERR'))
        print('\n'.join(err[:12]))
        await b.close()
asyncio.run(main())
