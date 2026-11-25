# Des captures : l'explication, la salle à découvert (les longs regards en lueur), la même dans l'ombre (éventails courts, têtes de mort,
# boutons), le bandage.
import time, json, sys
from playwright.sync_api import sync_playwright
from commun import ouvrir, SORTIE
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    for k in range(400):
        if pg.evaluate("__pt.ev('PS.complet')"): break
        time.sleep(0.25)
    pg.screenshot(path=SORTIE + '/v-regles.png')
    # une scène : trois chiens (un blessé), un faucheur, un javelot ; le Pisteur derrière le muret
    pg.evaluate("""__pt.scene([14.9,15.9,-1.57],[{t:'chien',x:11,y:10.6,fa:-1.57,immobile:1},{t:'chien',x:12.6,y:10.2,fa:-1.2,immobile:1,hp:15},{t:'chien',x:13.8,y:11,fa:0.4,immobile:1},
      {t:'faucheur',x:16.5,y:9.2,fa:3.1,immobile:1},{t:'javelot',x:8,y:10,fa:0,immobile:1,hp:20},{t:'cuirasse',x:15,y:12.8,fa:1.57,immobile:1}]);__pt.ev('P.hp=55;P.bandages=3')""")
    time.sleep(1.2); pg.screenshot(path=SORTIE + '/v-decouvert.png')
    print('à découvert', pg.evaluate("JSON.stringify({n:__pt.etat().nVoient,o:__pt.etat().P.ombre,G:__pt.etat().G.map(g=>[g.type,g.voit,Math.round(g.marge)])})"))
    # personne ne regarde par ici : deux chiens de dos, loin
    pg.evaluate("""__pt.scene([14.9,15.9,-1.57],[{t:'chien',x:11,y:10.6,fa:-1.57,immobile:1},{t:'chien',x:12.6,y:10.2,fa:-1.2,immobile:1,hp:15},{t:'chien',x:13.8,y:11,fa:-0.4,immobile:1},
      {t:'faucheur',x:16.5,y:9.2,fa:3.1,immobile:1},{t:'javelot',x:8,y:10,fa:0,immobile:1,hp:20}]);__pt.ev('P.hp=55;P.bandages=3')""")
    time.sleep(1.0); pg.screenshot(path=SORTIE + '/v-decouvert2.png')
    print('de dos', pg.evaluate("JSON.stringify({n:__pt.etat().nVoient})"))
    pg.evaluate("__pt.appui(4)"); time.sleep(0.9); pg.evaluate("__pt.ev('majRecharges()')"); pg.screenshot(path=SORTIE + '/v-ombre.png')
    print('dans ombre', pg.evaluate("JSON.stringify({o:__pt.etat().P.ombre,ap:__pt.etat().P.aPortee})"))
    pg.evaluate("__pt.appui(4)"); time.sleep(1.5); pg.evaluate("__pt.ev('majRecharges()')"); pg.screenshot(path=SORTIE + '/v-bandage.png')
    print('bandage', pg.evaluate("JSON.stringify({e:__pt.etat().P.etat,b:__pt.etat().P.bandages,hp:__pt.etat().P.hp})"))
    time.sleep(2.0); print('après', pg.evaluate("JSON.stringify({e:__pt.etat().P.etat,b:__pt.etat().P.bandages,hp:__pt.etat().P.hp})"))
    print('ERREURS', errs[:8])
    b.close()
