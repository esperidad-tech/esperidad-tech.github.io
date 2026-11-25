# Vrais gestes tactiles : le pouce gauche qui glisse, le pouce droit sur les boutons.
import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1)
    pg.tap('#btnGo'); time.sleep(0.4); pg.evaluate("__pt.invincible(true)")
    cdp=pg.context.new_cdp_session(pg)
    def touch(kind,pts): cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':x,'y':y,'id':i} for (i,x,y) in pts]})
    e=lambda: pg.evaluate("__pt.etat()")
    s0=e()['P']; print('départ',round(s0['x'],2),round(s0['y'],2))
    # pouce gauche : on pose, on glisse vers la droite et on tient
    touch('touchStart',[(1,150,290)])
    for k in range(1,9): touch('touchMove',[(1,150+k*9,290)]); time.sleep(0.02)
    time.sleep(0.8); s1=e()['P']; print('après glisser à droite',round(s1['x'],2),round(s1['y'],2),'fa',round(s1['fa'],2))
    # on glisse vers le haut
    for k in range(1,9): touch('touchMove',[(1,222,290-k*9)]); time.sleep(0.02)
    time.sleep(0.6); s2=e()['P']; print('après glisser en haut',round(s2['x'],2),round(s2['y'],2),'fa',round(s2['fa'],2))
    # pouce droit sur la dague, sans lâcher le gauche
    bd=pg.locator('#bDague').bounding_box(); dx,dy=bd['x']+bd['width']/2,bd['y']+bd['height']/2
    touch('touchStart',[(1,222,218),(2,dx,dy)]); time.sleep(0.05)
    etats=set()
    for k in range(12): etats.add(e()['P']['etat']); time.sleep(0.03)
    touch('touchEnd',[(1,222,218)]); print('pendant la dague, états vus :',etats)
    touch('touchEnd',[]); time.sleep(0.3)
    # le bond
    bb=pg.locator('#bBond').bounding_box(); bx,by=bb['x']+bb['width']/2,bb['y']+bb['height']/2
    x0=e()['P']['x']; touch('touchStart',[(3,bx,by)]); time.sleep(0.06); st=e()['P']['etat']; touch('touchEnd',[]); time.sleep(0.3)
    print('bond : état juste après',st,'déplacement',round(e()['P']['x']-x0,2),round(e()['P']['y']-s2['y'],2))
    # l'arc
    ba=pg.locator('#bArc').bounding_box(); ax,ay=ba['x']+ba['width']/2,ba['y']+ba['height']/2
    touch('touchStart',[(4,ax,ay)]); time.sleep(0.05); st=e()['P']['etat']; touch('touchEnd',[]); print('arc : état',st)
    # un doigt dans la moitié droite, hors bouton : la dague aussi
    touch('touchStart',[(5,560,120)]); time.sleep(0.08); st=e()['P']['etat']; touch('touchEnd',[]); print('tape à droite : état',st)
    # la pause
    pg.tap('#bPause'); time.sleep(0.3); print('pause ouverte',e()['enPause']); pg.screenshot(path='/tmp/p3/pause.png'); pg.tap('#pReprendre'); time.sleep(0.2); print('reprise',not e()['enPause'])
    # le choix d'un pouvoir (on saute la vague)
    pg.tap('#bPause'); time.sleep(0.2); pg.tap('#pSuivant'); time.sleep(2.6); s=e(); print('choix ouvert',s['choix'],s['choixDispo'])
    pg.screenshot(path='/tmp/p3/choix.png')
    pg.locator('#cartes button.jaune').nth(1).tap(); time.sleep(0.4); s=e(); print('après le choix : vague',s['vague']+1,'pouvoirs',s['P']['up'])
    print('ERREURS',errs[:5])
