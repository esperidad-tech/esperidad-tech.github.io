# des photos de la version 16 : la salle, Grosbec, les golems, les amis — en fenêtre, en plein écran (ordinateur), sur téléphone
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio, sys
from playwright.async_api import async_playwright
SPAWN = """((list)=>{const S=__test.s;for(const [ty,x,y,ex] of list){const T=G.TYPES[ty],hp=T.hp+G.bonusHp(S,ty);S.soldiers.push(Object.assign({id:S.nextId++,type:ty,x,y,r:T.r,hp,max:hp,vx:0,vy:0,atk:.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0},ex||{}))}})"""
CROWD = "([['costaud',300,230],['brute',360,300],['cogneur',330,190],['cogneur',600,220],['brute',640,290],['lanceur',700,160],['lanceur',180,300],['coureur',250,640],['cogneur',300,690],['brute',640,650],['costaud',700,700],['cogneur',560,720],['coureur',180,420],['cogneur',760,430],['cogneur',120,80],['coureur',760,70],['cogneur',420,300,{daze:3}],['lanceur',520,640,{iron:true}],['cogneur',100,560,{iron:true}]])"
async def main(which):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        errs = []
        for nom, vp, dsf, plein in [('fenetre', {'width': 1280, 'height': 860}, 1, False), ('plein', {'width': 1366, 'height': 768}, 1, True), ('tel', {'width': 390, 'height': 800}, 2, True), ('tablette', {'width': 1024, 'height': 768}, 2, True)]:
            if which and nom not in which: continue
            pg = await (await b.new_context(viewport=vp, device_scale_factor=dsf)).new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append('console: ' + m.text[:300]) if m.type == 'error' else None)
            await pg.goto(PAGE + '?finesse=1' + ('#plein' if plein else ''))
            await pg.wait_for_timeout(900)
            print(nom, 'avant de commencer, cuits [golems, Grosbec, à faire] :', await pg.evaluate('JSON.stringify(__test.cuits)'))
            await pg.click('#bStartPlein' if plein else '#bStart'); await pg.wait_for_timeout(700)
            await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.realT=S.t=200;})()")
            await pg.evaluate(SPAWN + CROWD); await pg.wait_for_timeout(1600)
            await pg.screenshot(path=f'/tmp/s16-{nom}.png')
            if nom == 'fenetre':
                await pg.evaluate("__test.s.fx.push({k:'side',side:1,life:2.4,max:2.4})"); await pg.wait_for_timeout(450)
                await pg.locator('#cv').screenshot(path='/tmp/s16-envoi.png')
                await pg.evaluate("(()=>{const S=__test.s;S.realT=721;})()"); await pg.wait_for_timeout(500)
                await pg.locator('#cv').screenshot(path='/tmp/s16-colere.png')
            ms = await pg.evaluate("(()=>{const a=(window.__ms||[]).slice(-60);return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:0})()")
            print(nom, 'dessin moyen (ms) :', ms, '| finesse', await pg.evaluate('__test.q'), '| cuits', await pg.evaluate('JSON.stringify(__test.cuits)'))
        print('ERREURS :', errs or 'aucune'); await b.close()
asyncio.run(main(sys.argv[1:]))
