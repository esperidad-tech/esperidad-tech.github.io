# version 17 : deux amis au milieu. Photos (fenêtre, plein écran, téléphone), puis une partie entière avec le vrai clavier des codes.
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio
from playwright.async_api import async_playwright
SPAWN = """((list)=>{const S=__test.s;for(const [ty,x,y,ex] of list){const T=G.TYPES[ty],hp=T.hp+G.bonusHp(S,ty);S.soldiers.push(Object.assign({id:S.nextId++,type:ty,x,y,r:T.r,hp,max:hp,vx:0,vy:0,atk:.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0},ex||{}))}})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        # 1. l'écran d'explication et le début, sur ordinateur (fenêtre)
        pg = await (await b.new_context(viewport={'width': 1366, 'height': 900}, device_scale_factor=1.5)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '?finesse=1'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/s17-explication.png')
        await pg.click('#bStart'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.protection=500;S.cfg.protection=500;})()")
        await pg.evaluate(SPAWN + "([['cogneur',300,330],['costaud',600,330],['brute',300,560],['coureur',600,560],['lanceur',760,440],['cogneur',150,440]])")
        await pg.wait_for_timeout(5200); await pg.screenshot(path='/tmp/s17-fenetre.png')
        await pg.close()
        # 2. téléphone, plein écran : une partie entière avec le vrai clavier des codes
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '#rapide-plein'); await pg.wait_for_timeout(1500)
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.protection=500;S.cfg.protection=500;})()")
        await pg.wait_for_timeout(8000); await pg.screenshot(path='/tmp/s17-tel.png')
        await pg.wait_for_timeout(13500)
        ann = await pg.evaluate("__test.s.announced"); print('codes criés :', ann, '| amis :', await pg.evaluate("__test.s.friends.map(f=>f.id)"))
        # l'ancien code du Pisteur : refusé
        await pg.click('#bCode'); await pg.wait_for_timeout(250)
        for c in ['🔥', '🌙', '⭐']:
            await pg.click(f'#keys [data-c="{c}"]'); await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(700); print('ancien code du Pisteur → amis vainqueurs :', await pg.evaluate("__test.s.entered"), '| message :', await pg.evaluate("__test.s.msg"))
        if await pg.evaluate("!document.getElementById('pad').hidden"): await pg.evaluate("document.getElementById('padClose') && document.getElementById('padClose').click()")
        for i, k in enumerate(ann):
            code = await pg.evaluate(f"G.CODES['{k}']")
            if await pg.evaluate("document.getElementById('pad').hidden"): await pg.click('#bCode'); await pg.wait_for_timeout(250)
            for c in code:
                await pg.click(f'#keys [data-c="{c}"]'); await pg.wait_for_timeout(120)
            await pg.wait_for_timeout(900)
            print(' ', k, code, '→ amis vainqueurs :', await pg.evaluate("__test.s.entered"), '| fini :', await pg.evaluate("__test.s.over"), '|', await pg.evaluate("__test.s.msg"))
            if i == 0: await pg.wait_for_timeout(3000); await pg.screenshot(path='/tmp/s17-un-ami.png')
        await pg.wait_for_timeout(3000)
        print('fin :', await pg.evaluate("document.getElementById('endWhy').textContent"), '|', await pg.evaluate("document.getElementById('infoMesuresFin').textContent"), '| écran de fin visible :', await pg.evaluate("!document.getElementById('ovEnd').hidden"))
        await pg.screenshot(path='/tmp/s17-fin.png')
        print('ERREURS :', errs or 'aucune'); await b.close()
asyncio.run(main())
