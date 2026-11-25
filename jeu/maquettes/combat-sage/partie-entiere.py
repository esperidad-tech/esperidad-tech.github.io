# version 20 : l'explication, le rouge et les golems nouveaux (photos), puis une partie courte jusqu'à « ASSEZ ! » sur un téléphone imité
import asyncio, sys, os
from playwright.async_api import async_playwright
PAGE = sys.argv[1] if len(sys.argv) > 1 else 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
OUT = '/tmp/s20-'
MK = """((L)=>{const S=__test.s;for(const [t,x,y,o] of L){const T=G.TYPES[t],hp=T.hp+8;S.soldiers.push(Object.assign({id:S.nextId++,type:t,x,y,r:T.r,hp,max:hp,vx:0,vy:0,atk:0.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0,dalle:t==='dalle'},o||{}));}})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        pg = await (await b.new_context(viewport={'width': 1366, 'height': 900}, device_scale_factor=1.5)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '?finesse=1'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=OUT + 'explication.png')
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(600)
        await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.gbT=1e9;S.mortT=1e9;S.protection=500;S.cfg.protection=500;S.t=200;S.sage.x=450;S.sage.y=640;S.sage.tx=null;})()")
        # 1. les golems nouveaux et le rouge
        await pg.evaluate(MK + "([['dalle',300,620],['dalle',360,700,{dalle:false}],['mortier',820,560],['bombe',560,700],['bombe',610,640],['brute',250,480],['cogneur',520,560],['coureur',600,560],['dalle',450,800]])")
        await pg.evaluate("(()=>{const S=__test.s;S.zones.push({k:'poing',x:450,y:640,r:95,suit:0.4,t:1.3,T:1.6,dmg:6,amis:2},{k:'obus',x:640,y:520,r:72,suit:0,t:0.5,T:1.6,dmg:5,amis:1},{k:'braise',x:250,y:760,r:58,suit:0,t:0.9,T:1.5,dmg:4,amis:1});})()")
        await pg.wait_for_timeout(450); await pg.screenshot(path=OUT + 'rouge-golems.png')
        await pg.wait_for_timeout(1500)
        print('après le poing : sonné', await pg.evaluate("__test.s.sage.sonne>0"), '| encre', await pg.evaluate("__test.s.ink"), '| éclats', await pg.evaluate("__test.s.shards.length"))
        await pg.screenshot(path=OUT + 'sonne.png')
        # 2. le balayage et Grosbec qui frappe
        await pg.evaluate("(()=>{const S=__test.s;S.sage.invul=0;S.sage.sonne=0;S.gbT=0;})()"); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{const S=__test.s;S.zones.push({k:'bande',x:450,y:700,horiz:true,half:70,suit:0,t:1.0,T:1.8,dmg:5,amis:2});})()"); await pg.wait_for_timeout(350)
        await pg.screenshot(path=OUT + 'balayage.png')
        print('mots de Grosbec :', await pg.evaluate("(typeof GB!=='undefined'&&GB.mots)?GB.mots.txt:'?'"))
        await pg.close()
        # 3. téléphone : une partie courte jusqu'au bout
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '#rapide'); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=OUT + 'tel-explication.png', full_page=True)
        await pg.tap('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.protection=400;S.cfg.protection=400;})()")
        vus = set()
        for i in range(46):
            await pg.wait_for_timeout(2000)
            st = await pg.evaluate("(()=>{const S=__test.s;if(S.choice){G.choose(S,S.choice.cards[0]);const o=document.getElementById('choix');}return {t:Math.round(S.t),over:S.over,types:[...new Set(S.soldiers.map(u=>u.type))],z:S.zones.map(z=>z.k),vu:Object.keys(S.vu),choix:!!S.choice,fin:document.getElementById('endTitle')?document.getElementById('endTitle').textContent:''};})()")
            vus |= set(st['types']) | set(st['z'])
            if i == 9: await pg.screenshot(path=OUT + 'tel-jeu.png')
            if st['choix']: await pg.evaluate("(()=>{const c=document.querySelector('#cartes .carte');if(c)c.click();})()")
            if st['over']: break
        await pg.wait_for_timeout(3200)
        print('fin :', st['over'], 'à', st['t'], 's |', await pg.evaluate("document.getElementById('endTitle').textContent"), '| vus :', sorted(vus), '| premières fois :', st['vu'])
        print('mesures :', await pg.evaluate("typeof mesuresTxt==='function'?mesuresTxt():''"))
        await pg.screenshot(path=OUT + 'tel-fin.png')
        print('erreurs de page :', errs or 'aucune')
        await b.close()
asyncio.run(main())
