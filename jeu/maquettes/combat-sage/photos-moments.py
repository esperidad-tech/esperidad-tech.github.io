# des photos de moments précis : les golems qui marchent (de quel côté ils sont tournés), ceux qui sautent des galeries, les cuirassés, la victoire
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio
from playwright.async_api import async_playwright
SPAWN = """((list)=>{const S=__test.s;for(const [ty,x,y,ex] of list){const T=G.TYPES[ty],hp=T.hp+G.bonusHp(S,ty);S.soldiers.push(Object.assign({id:S.nextId++,type:ty,x,y,r:T.r,hp,max:hp,vx:0,vy:0,atk:.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0},ex||{}))}})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        pg = await (await b.new_context(viewport={'width': 1366, 'height': 768}, device_scale_factor=1.5)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '?finesse=1#plein'); await pg.wait_for_timeout(900)
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.protection=1e6;S.cfg.protection=1e6;S.realT=S.t=930;S.rage=3;})()")
        # des golems qui arrivent des quatre côtés (comme le jeu les fait naître), dont des cuirassés
        await pg.evaluate(SPAWN + "([['cogneur',120,30],['costaud',200,30],['brute',720,30],['coureur',790,30],['cogneur',930,200],['lanceur',930,420],['brute',930,650],['costaud',930,820],['cogneur',-30,180],['coureur',-30,400],['brute',-30,640,{iron:true}],['cogneur',-30,820,{iron:true}],['cogneur',150,930],['costaud',380,930,{iron:true}],['brute',560,930],['lanceur',760,930]])")
        await pg.wait_for_timeout(230); await pg.screenshot(path='/tmp/s16b-saut.png')
        await pg.wait_for_timeout(1700); await pg.screenshot(path='/tmp/s16b-marche.png')
        # un ami libéré, une salve, puis la victoire
        await pg.evaluate("(()=>{const S=__test.s;S.announced=['P','A','B'];G.enterCode(S,G.CODES.P);G.enterCode(S,G.CODES.A)})()")
        await pg.wait_for_timeout(350); await pg.screenshot(path='/tmp/s16b-touche.png')
        await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/s16b-amis.png')
        await pg.evaluate("(()=>{const S=__test.s;G.enterCode(S,G.CODES.B)})()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path='/tmp/s16b-victoire.png')
        print('ERREURS :', errs or 'aucune', '| fini :', await pg.evaluate('__test.s.over'))
        await b.close()
asyncio.run(main())
