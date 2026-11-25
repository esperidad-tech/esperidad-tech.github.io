# Vrais gestes tactiles : le pouce gauche qui glisse, le pouce droit sur les boutons ; les écrans.
import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.goto('file:///home/claude/pisteur4/index.html')
    for k in range(300):
        time.sleep(0.2)
        if pg.evaluate("window.__pt?__pt.etat().prepare:0")>=3: break
    bb=pg.locator('#btnGo').bounding_box(); print('bouton En garde dans l\'écran :', bb['y']+bb['height']<=390, round(bb['y']+bb['height']))
    pg.screenshot(path='/tmp/p4/g-regles.png')
    pg.tap('#btnGo'); time.sleep(0.4); pg.evaluate("__pt.invincible(true)")
    cdp=pg.context.new_cdp_session(pg)
    def touch(kind,pts): cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    e=lambda: pg.evaluate("__pt.etat()")
    ev=lambda s: pg.evaluate("s=>__pt.ev(s)",s)
    s0=e()['P']; print('départ',round(s0['x'],2),round(s0['y'],2),'caché',s0['cache'])
    touch('touchStart',[(1,150,290)])
    for k in range(1,9): touch('touchMove',[(1,150+k*9,290)]); time.sleep(0.02)
    time.sleep(0.7); s1=e()['P']; print('glisser à droite →',round(s1['x']-s0['x'],2),round(s1['y']-s0['y'],2))
    for k in range(1,9): touch('touchMove',[(1,222,290-k*9)]); time.sleep(0.02)
    time.sleep(0.5); s2=e()['P']; print('glisser en haut →',round(s2['x']-s1['x'],2),round(s2['y']-s1['y'],2))
    touch('touchEnd',[]); time.sleep(0.2)
    # caché : l'arc se bande tant qu'on garde le doigt, la flèche part quand on lâche
    ev("G=[];file=[];dernierGroupe=1e9;DIR.oeil.aveugle=tReel+999")
    ba=pg.locator('#bArc').bounding_box(); ax,ay=ba['x']+ba['width']/2,ba['y']+ba['height']/2
    touch('touchStart',[(4,ax,ay)]); time.sleep(0.3); st=e()['P']; print('arc tenu (caché) : état',st['etat'],'charge',round(st['charge'],2)); time.sleep(0.8); st=e()['P']; print('  après 1,1 s : charge',round(st['charge'],2))
    pg.screenshot(path='/tmp/p4/g-vise.png'); touch('touchEnd',[]); time.sleep(0.1); print('  lâché : flèches en vol',ev("fleches.length"),'visée',ev("fleches[0]&&fleches[0].vise"))
    # un rôdeur de dos, tout près : la dague devient un coup d'assassin
    ev("P.x=12;P.y=14.2;P.etat='libre'");ev("const g=nouveauGolem('chien',P.x,P.y-1.6,P.x,P.y-1.6,{role:'garde'});g.etat='normal';g.fa=-Math.PI/2;g.poste={x:g.x,y:g.y};g.posteA=-Math.PI/2;G.push(g);P.fa=-Math.PI/2;P.assCD=0")
    time.sleep(0.15); bd=pg.locator('#bDague').bounding_box(); dx,dy=bd['x']+bd['width']/2,bd['y']+bd['height']/2
    print('  bouton violet :',pg.evaluate("document.getElementById('bDague').classList.contains('ombre')"),pg.evaluate("document.querySelector('#bDague span').textContent"))
    touch('touchStart',[(2,dx,dy)]); time.sleep(0.07); st=e()['P']['etat']; touch('touchEnd',[]); time.sleep(0.5)
    print('dague (caché, rôdeur de dos) : état',st,'| assassinats',e()['stats']['assassinats'],'| golems',len(e()['G']),'| garde',e()['garde'])
    # un saut d'ombre
    ev("const g=nouveauGolem('belier',P.x+4,P.y,P.x+4,P.y,{role:'garde'});g.etat='normal';g.fa=0;g.poste={x:g.x,y:g.y};g.posteA=0;G.push(g);P.ombreCD=0")
    time.sleep(0.15); x0=e()['P']['x']; bbo=pg.locator('#bBond').bounding_box()
    touch('touchStart',[(3,bbo['x']+bbo['width']/2,bbo['y']+bbo['height']/2)]); time.sleep(0.05); touch('touchEnd',[]); time.sleep(0.4)
    print("saut d'ombre : déplacement",round(e()['P']['x']-x0,2),'| sauts',e()['stats']['sauts'],'| caché',e()['P']['cache'])
    pg.screenshot(path='/tmp/p4/g-ombre.png')
    # la pause, le choix d'une carte
    pg.tap('#bPause'); time.sleep(0.3); print('pause',e()['enPause'],'|',pg.inner_text('#pMesures')[:150]); pg.tap('#pReprendre'); time.sleep(0.2)
    ev("P.up.tourbillon=1;P.up.affutee=1;P.up.feutre=1")
    pg.tap('#bPause'); time.sleep(0.2); pg.tap('#pSuivant'); time.sleep(2.8); s=e(); print('choix ouvert',s['choix'],s['choixDispo'])
    pg.screenshot(path='/tmp/p4/g-choix.png')
    hh=pg.evaluate("Array.from(document.querySelectorAll('#cartes .pouvoir')).map(c=>Math.round(c.getBoundingClientRect().bottom))"); print('bas des cartes (écran 390) :',hh)
    pg.locator('#cartes button.jaune').nth(0).tap(); time.sleep(0.4); s=e(); print('après le choix : vague',s['vague']+1,'cartes',s['P']['up'])
    # la défaite puis la reprise
    ev("invincible=false;P.invul=0;P.coeurs=1;toucherP(1,P.x+1,P.y,1)"); time.sleep(1.7); print('défaite affichée',pg.locator('#fReprendre').is_visible()); pg.screenshot(path='/tmp/p4/g-defaite.png')
    pg.tap('#fReprendre'); time.sleep(0.4); s=e(); print('reprise : vague',s['vague']+1,'coeurs',s['P']['coeurs'],'cartes gardées',len(s['P']['up']))
    print('ERREURS',errs[:5])
