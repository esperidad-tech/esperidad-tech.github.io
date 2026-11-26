# version 28 : de vrais doigts sur la page (tablette et téléphone) : graver, tracer les formes à la main, voir ce que le jeu lit
import asyncio, sys, json, subprocess, os
from playwright.async_api import async_playwright
PAGE = sys.argv[1] if len(sys.argv) > 1 else 'file://' + os.path.dirname(os.path.abspath(__file__)) + '/combat-sage.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/s28-'
D = os.path.dirname(os.path.abspath(__file__))
SORTIE = "const gen=require('fs').readFileSync(process.argv[1],'utf8');const {F,main}=new Function('graine',gen+';return {F,main};')(11);const o={};for(const f of Object.keys(F)){o[f]=[];for(let i=0;i<12;i++)o[f].push(main(f).map(p=>[Math.round(p.x*10)/10,Math.round(p.y*10)/10]));}console.log(JSON.stringify(o));"
FORMES = json.loads(subprocess.check_output(['node', '-e', SORTIE, D + '/formes-a-la-main.js']))
async def doigt(pg, cdp, pts, pas):
    # passe des coordonnées du jeu à l'écran, puis un point tous les « pas » pixels (un doigt à 60 images par seconde)
    sc = await pg.evaluate("(P)=>{const r=cv.getBoundingClientRect(),d=cv.width/r.width,v=view();return P.map(([x,y])=>[r.left+(x*v.k+v.ox)/d,r.top+(y*v.k+v.oy)/d]);}", pts)
    E = [sc[0]]
    for q in sc[1:]:
        if ((q[0] - E[-1][0]) ** 2 + (q[1] - E[-1][1]) ** 2) ** 0.5 >= pas: E.append(q)
    E.append(sc[-1])
    tp = lambda q: [{'x': q[0], 'y': q[1], 'id': 1}]
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': tp(E[0])})
    for q in E[1:]: await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': tp(q)})
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    return len(E)
async def essai(b, nom, vw, vh, dpr, pas):
    pg = await (await b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=dpr, is_mobile=True, has_touch=True)).new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.goto(PAGE + '?finesse=1'); await pg.wait_for_timeout(1200)
    await pg.tap('#bStartPlein'); await pg.wait_for_timeout(600)
    cdp = await pg.context.new_cdp_session(pg)
    await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.protection=999;S.cfg.protection=999;const R0=G.recognize;G.recognize=p=>{const r=R0(p);window.__lu=r;return r;};})()")
    bilan = {}
    for f, L in FORMES.items():
        c = {}
        for pts in L:
            await pg.evaluate("(()=>{const S=__test.s;S.dorees={triangle:true,lune:true,etoile:true};S.ink=0;S.soldiers.length=0;S.pageT=1e9;S.choice=null;document.getElementById('ovChoix').hidden=true;__test.paused=false;setBrush(false);window.__lu=null;})()")
            await pg.evaluate("document.getElementById('bBrush').click()"); await pg.wait_for_timeout(60)   # (le toucher imité de Chrome rate parfois ce bouton après un tracé : on clique par le script)
            await doigt(pg, cdp, pts, pas); await pg.wait_for_timeout(80)
            r = await pg.evaluate("(()=>{const r=window.__lu;return r?(r.kind==='ferme'?(r.forme||'cercle'):(r.kind||'rien')):'pas de tracé';})()")
            c[r] = c.get(r, 0) + 1
        bilan[f] = c
        print(nom.ljust(10), f.ljust(12), c)
    # une étoile pour de vrai, sans encre, avec des golems : ils sont tous détruits
    await pg.evaluate("(()=>{const S=__test.s;S.dorees={triangle:true,lune:true,etoile:true};S.ink=0;setBrush(false);for(let i=0;i<12;i++){const T=G.TYPES.cogneur;S.soldiers.push(Object.assign({id:S.nextId++,type:'cogneur',x:120+i*60,y:150+(i%3)*250,r:T.r,hp:40,max:40,vx:0,vy:0,atk:0.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0}));}})()")
    await pg.tap('#bBrush'); await pg.wait_for_timeout(60)
    await doigt(pg, cdp, FORMES['contour'][0], pas); await pg.wait_for_timeout(250)
    await pg.screenshot(path=OUT + nom + '-etoile.png')
    print(nom.ljust(10), 'étoile sans encre, avec 12 golems : restants', await pg.evaluate("__test.s.soldiers.length"), '| étoile encore là :', await pg.evaluate("__test.s.dorees.etoile"), '| erreurs de page :', errs or 'aucune')
    await pg.close(); return bilan
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        await essai(b, 'tablette', 1024, 768, 2, 9)
        await essai(b, 'téléphone', 390, 844, 3, 7)
        await b.close()
asyncio.run(main())
