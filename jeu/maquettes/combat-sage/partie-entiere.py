# version 19 : l'explication, les builds en action (photos), la fenêtre des cartes, une partie courte jusqu'à « ASSEZ ! »
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio
from playwright.async_api import async_playwright
GIVE = """((ids)=>{const S=__test.s;for(const [id,l] of ids){for(let i=G.lv(S,id);i<l;i++){S.choice={cards:[id]};G.choose(S,id);}}S.msg='';})"""
SPAWN = """((n)=>{const S=__test.s,ty=['cogneur','coureur','brute','costaud','lanceur'];for(let i=0;i<n;i++){const t=ty[i%5],T=G.TYPES[t],a=i*2.4,r=200+(i%4)*45,hp=T.hp+G.bonusHp(S,t)+6;S.soldiers.push({id:S.nextId++,type:t,x:450+Math.cos(a)*r,y:445+Math.sin(a)*r*0.9,r:T.r,hp,max:hp,vx:0,vy:0,atk:.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0})}})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        pg = await (await b.new_context(viewport={'width': 1366, 'height': 900}, device_scale_factor=1.5)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '?finesse=1'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/s19-explication.png')
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.protection=500;S.cfg.protection=500;S.realT=200;})()")
        # 1. givre + gardiennes + explosif
        await pg.evaluate(GIVE + "([['double',2],['lourd',2],['percant',1],['pages',1],['givre',2],['gardiennes',2],['explosif',2]])")
        await pg.evaluate(SPAWN + "(26)"); await pg.wait_for_timeout(2600)
        await pg.screenshot(path='/tmp/s19-givre-gardiennes.png')
        # 2. braise + rayon + foudre + ricochet
        await pg.evaluate("(()=>{const S=__test.s;S.soldiers=[];S.up={};S.sage.tx=450;S.sage.ty=640;})()")
        await pg.evaluate(GIVE + "([['double',2],['rapide',2],['percant',2],['lourd',1],['chaine',1],['braise',2],['rayon',3],['foudre',2],['ricochet',2]])")
        await pg.evaluate(SPAWN + "(30)"); await pg.wait_for_timeout(2300)
        await pg.screenshot(path='/tmp/s19-braise-rayon.png')
        # 3. la fenêtre des cartes
        await pg.evaluate("(()=>{const S=__test.s;S.soldiers=[];S.up={double:1,brulant:1};S.pages.push({x:S.sage.x,y:S.sage.y,t:0});})()"); await pg.wait_for_timeout(700)
        await pg.screenshot(path='/tmp/s19-cartes.png')
        print('cartes proposées :', await pg.evaluate("[...document.querySelectorAll('#cartes .carte')].map(c=>c.querySelector('.nom').textContent+' | '+(c.querySelector('.pour')?c.querySelector('.pour').textContent:''))"))
        await pg.close()
        # 4. téléphone : une partie courte (40 s) jusqu'au bout
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '#rapide-plein'); await pg.wait_for_timeout(1500)
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.protection=500;S.cfg.protection=500;})()")
        await pg.wait_for_timeout(9000); await pg.screenshot(path='/tmp/s19-tel.png')
        print('bouton des codes caché :', await pg.evaluate("getComputedStyle(document.getElementById('bCode')).display"))
        for i in range(40):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!document.getElementById('ovChoix').hidden"): await pg.click('#cartes .carte'); 
            if await pg.evaluate("__test.s.over"): break
        await pg.wait_for_timeout(900); await pg.screenshot(path='/tmp/s19-assez.png')
        await pg.wait_for_timeout(2200)
        print('fini :', await pg.evaluate("__test.s.over"), '|', await pg.evaluate("document.getElementById('endTitle').textContent"), '|', await pg.evaluate("document.getElementById('endWhy').textContent"), '|', await pg.evaluate("document.getElementById('infoMesuresFin').textContent"))
        await pg.screenshot(path='/tmp/s19-fin.png')
        print('ERREURS :', errs or 'aucune'); await b.close()
asyncio.run(main())
