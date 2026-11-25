# version 21 : sur une tablette imitée (1024 × 768) — l'explication, la petite fenêtre, le plein écran, le bouclier, la fenêtre des cartes ;
# puis une partie courte jusqu'à « ASSEZ ! » sur un téléphone imité
import asyncio, sys, os
from playwright.async_api import async_playwright
PAGE = sys.argv[1] if len(sys.argv) > 1 else 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/s21-'
CERCLE = "(()=>{const S=__test.s,p=[];for(let i=0;i<=42;i++){const a=i/40*6.283;p.push({x:450+Math.cos(a)*90,y:445+Math.sin(a)*90});}return G.cast(S,G.recognize(p)).ok;})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        for nom, bouton in (('tablette-fenetre', '#bStart'), ('tablette-plein', '#bStartPlein')):
            pg = await (await b.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=2, is_mobile=True, has_touch=True)).new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
            await pg.goto(PAGE + '?finesse=1'); await pg.wait_for_timeout(1200)
            if nom == 'tablette-fenetre': await pg.screenshot(path=OUT + 'tablette-explication.png')
            await pg.tap(bouton); await pg.wait_for_timeout(700)
            await pg.evaluate("(()=>{const S=__test.s;S.t=150;S.protection=500;S.cfg.protection=500;for(const id of ['dome','mur','brulant']){S.choice={cards:[id]};G.choose(S,id);}S.ink=12;})()")
            await pg.wait_for_timeout(2500)
            r = await pg.evaluate("(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return [Math.round(c.width),Math.round(c.height),innerWidth,innerHeight];})()")
            print(nom, ': la salle fait', r[0], '×', r[1], 'dans un écran de', r[2], '×', r[3])
            if nom == 'tablette-plein':
                print('bouclier lancé :', await pg.evaluate(CERCLE)); await pg.wait_for_timeout(500)
            await pg.screenshot(path=OUT + nom + '.png')
            if nom == 'tablette-plein':
                await pg.evaluate("(()=>{const S=__test.s;S.soldiers=[];S.pages.push({x:S.sage.x,y:S.sage.y,t:0});})()"); await pg.wait_for_timeout(700)
                await pg.screenshot(path=OUT + 'tablette-cartes.png')
                print('cartes :', await pg.evaluate("[...document.querySelectorAll('#cartes .carte')].map(c=>c.querySelector('.nom').textContent).join(' | ')"))
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
            if i == 8: await pg.screenshot(path=OUT + 'tel-jeu.png')
            if st['over']: break
        await pg.wait_for_timeout(3200)
        print('téléphone, fin :', st['over'], 'à', st['t'], 's |', await pg.evaluate("document.getElementById('endTitle').textContent"), '| cartes prises :', st['up'])
        print('mesures :', await pg.evaluate("typeof mesuresTxt==='function'?mesuresTxt():''"))
        print('erreurs de page :', errs or 'aucune')
        await b.close()
asyncio.run(main())
