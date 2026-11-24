# Photos de chaque combo au niveau 3, à 10 minutes de combat (dans /tmp/combo-*.png). Lancer : python3 photos-combos.py
import os
import asyncio, math, random
from playwright.async_api import async_playwright
random.seed(4)
def ring(n, r0, r1, types, cx=450, cy=445, a0=0, a1=2*math.pi):
    out=[]
    for i in range(n):
        a=random.uniform(a0,a1); r=random.uniform(r0,r1); out.append([random.choice(types), round(cx+math.cos(a)*r), round(cy+math.sin(a)*r)])
    return out
T=['cogneur','cogneur','coureur','brute','lanceur','cogneur','brute','costaud']
SPAWN = """((list)=>{const S=__test.s;for(const [ty,x,y,ex] of list){const T=G.TYPES[ty],hp=T.hp+G.bonusHp(S,ty);S.soldiers.push(Object.assign({id:S.nextId++,type:ty,x,y,r:T.r,hp,max:hp,vx:0,vy:0,atk:.5,daze:0,flash:0,burn:0,burnCd:0,burnTick:0,held:false,fear:0,dance:0,charmCd:0},ex||{}))}})"""
RESET = """((build)=>{const S=__test.s;Object.assign(S,{soldiers:[],fx:[],stones:[],bolts:[],shards:[],pages:[],pageNeed:999,walls:[],traps:[],firelines:[],owls:[],tornados:[],trail:[],echoes:[],puddles:[],potions:[],notes:[],spawnT:1e9,burstT:1e9,realT:600,t:600,frenzy:0,rage:0,combo:0,choice:null,protection:20,up:{},msg:''});S.sage.x=450;S.sage.y=600;S.sage.tx=S.sage.ty=null;
 const add=c=>{S.choice={cards:[c]};G.choose(S,c)};for(const [id,l] of build){if(G.CARDS[id].of)G.CARDS[id].of.forEach(c=>{while(G.lv(S,c)<2)add(c)});while(G.lv(S,id)<l)add(id)}S.choice=null;S.ink=S.cfg.inkMax;S.msg=''})"""
SHOTS = [
 ('bowling', "G.cast(__test.s,{kind:'poussee',tip:{x:450,y:370},a:{x:330,y:200},b:{x:570,y:200},dir:[0,-1]})", 0.55, ring(18,40,170,T,450,250)+ring(16,250,420,T)),
 ('orage', "(()=>{const S=__test.s;S.soldiers.slice(0,14).forEach(u=>u.daze=3);G.cast(S,{kind:'trait',a:{x:200,y:250},b:{x:700,y:250}})})()", 0.25, ring(14,0,120,T,450,250)+ring(20,230,420,T)),
 ('volcan', "G.cast(__test.s,{kind:'trait',a:{x:180,y:300},b:{x:720,y:300}})", 1.6, ring(16,0,110,T,450,290)+ring(18,250,420,T)),
 ('etoiles', "__test.s.novaT=0.05", 0.45, ring(34,200,430,T)),
 ('comete', "(()=>{const S=__test.s;S.sage.x=150;S.sage.y=640;S.sage.tx=760;S.sage.ty=560})()", 1.4, ring(14,0,140,T,450,600)+ring(18,240,420,T)),
 ('scribe', "(()=>{const S=__test.s;S.frenzy=8;S.soldiers.slice(0,10).forEach(u=>u.daze=3);G.cast(S,{kind:'poussee',tip:{x:450,y:380},a:{x:330,y:200},b:{x:570,y:200},dir:[0,-1]});G.cast(S,{kind:'trait',a:{x:200,y:230},b:{x:700,y:230}})})()", 0.62, ring(14,0,130,T,450,240)+ring(18,240,420,T)),
 ('tornade', "G.cast(__test.s,{kind:'spirale',x:450,y:230})", 1.3, ring(14,0,170,T,450,230)+ring(18,240,420,T)),
 ('sanctuaire', "(()=>{const S=__test.s;S.soldiers.slice(0,8).forEach(u=>u.daze=3);S.pulseT=0.05;S.sealT=99})()", 0.28, ring(14,60,180,T)+ring(18,250,420,T)),
 ('chouettes', "", 1.6, ring(34,160,420,T)),
 ('miroir', "G.cast(__test.s,{kind:'trait',a:{x:330,y:235},b:{x:570,y:235}})", 0.2, ring(36,150,330,T)),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        errs=[]
        pg = await (await b.new_context(viewport={'width':760,'height':760}, device_scale_factor=1)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html') + '#plein')
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(500)
        for id, act, wait, crowd in SHOTS:
            await pg.evaluate(RESET+f"([['{id}',3]])")
            await pg.evaluate(SPAWN+"("+str(crowd)+")")
            await pg.wait_for_timeout(250)
            if act: await pg.evaluate(act)
            await pg.wait_for_timeout(int(wait*1000))
            await pg.locator('#cv').screenshot(path=os.path.join('/tmp', f'combo-{id}.png'))
        print('ERREURS', errs); await b.close()
asyncio.run(main())
