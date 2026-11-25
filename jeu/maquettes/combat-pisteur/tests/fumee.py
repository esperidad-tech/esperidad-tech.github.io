# La page se charge, démarre, et tourne quelques secondes sans erreur.
import time, json
from playwright.sync_api import sync_playwright
from commun import ouvrir, SORTIE
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    print('chargement', round(tc, 1), 's'); pg.screenshot(path=SORTIE + '/01-regles.png')
    print('ERREURS avant départ', errs[:6])
    pg.tap('#btnGo', force=True); time.sleep(0.8); pg.screenshot(path=SORTIE + '/02-debut.png')
    time.sleep(5); pg.screenshot(path=SORTIE + '/03-apres.png')
    print(pg.evaluate("JSON.stringify((()=>{const s=__pt.etat();return {e:s.etatJeu,ph:s.phase,v:s.vague,nVoient:s.nVoient,G:s.G.map(g=>[g.type,g.etat,g.mode,+g.x.toFixed(1),+g.y.toFixed(1),Math.round(g.marge)]),P:[s.P.x,s.P.y,s.P.hp,s.P.ombre,s.P.bandages],msg:s.msg,fps:s.fps,taille:s.taille}})())"))
    print('ERREURS', errs[:8])
    b.close()
