# Essais ciblés : la dalle qui casse au javelot, les flèches qui font « Bong », le loup d'Elyra, le colosse.
import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/pisteur3/index.html'); time.sleep(1); pg.tap('#btnGo'); time.sleep(0.3)
    ev=lambda s: pg.evaluate("s=>__pt.ev(s)",s)
    ev("invincible=true;demarrer(3,false);invincible=true")
    for k in range(60):
        time.sleep(0.2)
        if ev("G.some(g=>g.type==='dalle'&&g.etat==='normal')"): break
    ev("G=G.filter(g=>g.type==='dalle');file=[];groupeI=9;const g=G[0];g.x=13;g.y=9;g.fa=Math.PI/2;g.cd=99;P.x=13;P.y=12.5;P.fa=-Math.PI/2;P.etat='libre'")
    # une flèche de face
    ev("tirer()"); time.sleep(0.5); print('flèche de face : vie', ev("G[0].hp"),'/',ev("G[0].max"),'(doit rester pleine)')
    for i in range(2):
        ev("const g=G[0];g.x=13;g.y=9;g.fa=Math.PI/2;g.cd=99;g.etat='normal';P.x=13;P.y=12.5;P.fa=-Math.PI/2;P.etat='libre';P.porte=true;majBoutonArc()")
        time.sleep(0.1); ev("tirer()"); time.sleep(0.45)
        print('javelot',i+1,': fissure',ev("G[0].fissure"),'dalle encore là',ev("G[0].aDalle"),'vie',ev("G[0].hp"))
        pg.screenshot(path=f'/tmp/p3/cible-dalle-{i+1}.png')
    # de dos, la flèche passe
    ev("const g=G[0];g.aDalle=true;g.fissure=0;g.hp=g.max;g.x=13;g.y=9;g.fa=-Math.PI/2;g.etat='normal';P.x=13;P.y=12.5;P.fa=-Math.PI/2;P.etat='libre';P.porte=false;majBoutonArc()")
    time.sleep(0.1); ev("tirer()"); time.sleep(0.5); print('flèche de dos : vie', ev("G[0].hp"))
    # le loup d'Elyra
    ev("P.up.sifflet=1;phase='vague';loupT=0"); time.sleep(0.15); print('loups lâchés',ev("loups.length")); time.sleep(0.5); pg.screenshot(path='/tmp/p3/cible-loup.png'); time.sleep(2); print('loups après 2 s',ev("loups.length"))
    # le colosse et son onde
    ev("demarrer(5,false);invincible=true")
    for k in range(80):
        time.sleep(0.2)
        if ev("ondes.length>0"): pg.screenshot(path='/tmp/p3/cible-onde.png'); print('onde lancée'); break
    # le bond par-dessus un muret
    ev("demarrer(0,false);invincible=true;G=[];file=[];groupeI=9;P.x=17.6;P.y=12.2;P.fa=-Math.PI/2;P.etat='libre'")
    time.sleep(0.2); ev("robot.my=-1"); ev("bondDemande=true"); time.sleep(0.4); ev("robot.my=0")
    print('bond par-dessus le muret (y 10.6) : P.y =',round(ev("P.y"),2),'(doit être < 10.2)')
    ev("P.x=5;P.y=6.4;P.etat='libre'"); time.sleep(0.1); ev("robot.my=-1"); ev("bondDemande=true"); time.sleep(0.4); ev("robot.my=0")
    print('bond contre un pilier (y 4.6) : P.y =',round(ev("P.y"),2),'(doit rester > 5.3)')
    print('ERREURS',errs[:5])
