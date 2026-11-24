# La vitesse sur quatre appareils imités (ordinateur sans carte graphique, ralenti 4 à 6 fois).
# python3 vitesse.py                    → la scène très lourde (70 golems, quatre combos au maximum)
# python3 vitesse.py x '' 25 sans       → un moment ordinaire (25 golems, sans combo)
# la vitesse : des images par seconde, avec un processeur ralenti (comme une vieille tablette), sans carte graphique, en plein combat
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio, sys
from playwright.async_api import async_playwright
SPAWN = """((n)=>{const S=__test.s,ty=['cogneur','cogneur','coureur','brute','lanceur','cogneur','brute','costaud'];for(let i=0;i<n;i++){const t=ty[i%8],T=G.TYPES[t],a=i*2.4,r=200+((i*53)%230),hp=40;S.soldiers.push({id:S.nextId++,type:t,x:450+Math.cos(a)*r,y:470+Math.sin(a)*r*0.9,r:T.r,hp,max:hp,vx:0,vy:0,atk:.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0})}})"""
GIVE = """((list)=>{const S=__test.s;for(const [id,l] of list){const add=c=>{S.choice={cards:[c]};G.choose(S,c)};if(G.CARDS[id].of)G.CARDS[id].of.forEach(c=>{while(G.lv(S,c)<2)add(c)});while(G.lv(S,id)<l)add(id)}S.choice=null;S.msg=''})"""
NB = int(sys.argv[3]) if len(sys.argv) > 3 else 70          # combien de golems dans la salle (70 = une scène très lourde ; 25 = un moment ordinaire)
COMBOS = not (len(sys.argv) > 4 and sys.argv[4] == 'sans')   # avec quatre combos au maximum, ou sans
async def mesure(b, nom, vp, dsf, ralenti, fichier, combos=COMBOS):
    cx = await b.new_context(viewport=vp, device_scale_factor=dsf); pg = await cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    await pg.goto(PAGE + (sys.argv[2] if len(sys.argv) > 2 else '') + '#plein'); await pg.wait_for_timeout(1500)
    cdp = await cx.new_cdp_session(pg); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': ralenti})
    await pg.click('#bStartPlein'); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{const S=__test.s;S.spawnT=1e9;S.burstT=1e9;S.realT=S.t=600;S.protection=1e6;S.cfg.protection=1e6;})()")
    if combos: await pg.evaluate(GIVE + "([['etoiles',3],['orage',3],['chouettes',3],['volcan',2]])")
    await pg.evaluate(SPAWN + f"({NB})")
    await pg.evaluate("window.__f=[];(function f(t){window.__f.push(t);requestAnimationFrame(f)})(performance.now())")
    res = []
    for sec in range(8):
        await pg.evaluate(f"(()=>{{const S=__test.s;if(S.soldiers.length<{NB}-10){{const n={NB}-S.soldiers.length;" + SPAWN.replace('((n)=>{', '((n)=>{').rstrip(')') + ")(n)}window.__f=[]})()")
        if sec == 3: await pg.evaluate("(()=>{const S=__test.s;S.ink=12;G.cast(S,{kind:'trait',a:{x:200,y:300},b:{x:700,y:300}});G.cast(S,{kind:'spirale',x:450,y:650})})()")
        await pg.wait_for_timeout(1000)
        n = await pg.evaluate("window.__f.length"); res.append(n)
    ms = await pg.evaluate("(()=>{const a=(window.__ms||[]).slice(-100);return Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10})()")
    q = await pg.evaluate("__test.q") if '16' in fichier else '-'
    print(f'{nom:34s} ralenti x{ralenti} : images/s {res} → moyenne {round(sum(res)/len(res))}, pire {min(res)} | dessin {ms} ms | finesse {q} | golems {await pg.evaluate("__test.s.soldiers.length")}', errs or '')
    await cx.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        f = 'index16.html'   # (un simple nom : la page mesurée est toujours combat-sage.html)
        for nom, vp, dsf, r in [('téléphone 390x844 (écran fin)', {'width': 390, 'height': 844}, 3, 4), ('tablette 1024x768 (écran fin)', {'width': 1024, 'height': 768}, 2, 4), ('vieille tablette 768x1024', {'width': 768, 'height': 1024}, 1, 4), ('grande tablette 800x1280', {'width': 800, 'height': 1280}, 2, 6)]:
            await mesure(b, nom, vp, dsf, r, f)
        await b.close()
asyncio.run(main())
