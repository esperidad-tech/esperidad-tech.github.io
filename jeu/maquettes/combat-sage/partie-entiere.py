# version 26 : une scène avec les cinq builds nouveaux (photo), puis la tablette et le téléphone
import asyncio, sys, os
from playwright.async_api import async_playwright
PAGE = sys.argv[1] if len(sys.argv) > 1 else 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/s26-'
MK = "((L)=>{const S=__test.s;for(const [t,x,y,o] of L){const T=G.TYPES[t],hp=T.hp+8;S.soldiers.push(Object.assign({id:S.nextId++,type:t,x,y,r:T.r,hp,max:hp,vx:0,vy:0,atk:0.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0},o||{}));}})"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        pg = await (await b.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=2, is_mobile=True, has_touch=True)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '?finesse=1'); await pg.wait_for_timeout(1200)
        await pg.tap('#bStartPlein'); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.protection=500;S.cfg.protection=500;S.t=200;S.sage.x=450;S.sage.y=640;S.sage.tx=null;for(const id of ['cage','bouclier','bouclier','prison','trace','mine','mine','mines','collier','lasso','dompteur','pure','plume']){S.choice={cards:[id]};G.choose(S,id);}S.ink=S.cfg.inkMax;})()")
        await pg.evaluate(MK + "([['cogneur',690,230],['coureur',720,270],['cogneur',650,280],['brute',250,250,{daze:4}],['cogneur',300,560],['coureur',600,520],['costaud',200,700],['lanceur',800,700]])")
        await pg.evaluate("(()=>{const S=__test.s,p=[];for(let i=0;i<=42;i++){const a=i/40*6.283;p.push({x:700+Math.cos(a)*90,y:250+Math.sin(a)*90});}G.cast(S,G.recognize(p));S.ink=S.cfg.inkMax;G.cast(S,{kind:'trait',a:{x:200,y:250},b:{x:300,y:250}});S.ink=6;G.cast(S,{kind:'trait',a:{x:250,y:600},b:{x:560,y:600}});})()")
        await pg.wait_for_timeout(350)
        print('cages', await pg.evaluate("__test.s.cages.length"), '| domptés', await pg.evaluate("__test.s.allies.length"), '| traces', await pg.evaluate("__test.s.traces.length"), '| rayons surchargés', await pg.evaluate("__test.s.surcharges||0"))
        await pg.screenshot(path=OUT + 'builds.png')
        await pg.wait_for_timeout(2500); await pg.screenshot(path=OUT + 'builds-2.png')
        print('mines qui ont sauté', await pg.evaluate("__test.s.mineBooms||0"), '| domptés encore là', await pg.evaluate("__test.s.allies.length"))
        await pg.close()
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '#rapide'); await pg.wait_for_timeout(1000)
        await pg.tap('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.protection=400;S.cfg.protection=400;})()")
        st = {}
        for i in range(40):
            await pg.wait_for_timeout(2000)
            st = await pg.evaluate("(()=>{const S=__test.s;if(S.choice)G.choose(S,S.choice.cards[0]);return {t:Math.round(S.t),over:S.over,up:Object.keys(S.up)};})()")
            if st['over']: break
        await pg.wait_for_timeout(3200)
        print('téléphone, fin :', st['over'], 'à', st['t'], 's |', await pg.evaluate("document.getElementById('endTitle').textContent"), '| cartes prises :', st['up'])
        print('erreurs de page :', errs or 'aucune')
        await b.close()
asyncio.run(main())
