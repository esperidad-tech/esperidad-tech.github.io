# Images par seconde avec un processeur ralenti (téléphone ou vieille tablette), sans carte graphique, le robot en jeu pour de vrai
# (la vraie boucle, le vrai affichage). La règle de Romain : jamais sous 24 images par seconde.   python3 vitesse.py [numéro du cas]
import time, sys, json
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI
robot = open(ICI + '/robot.js', encoding='utf8').read()
cas = [(844, 390, 3, 'téléphone', 4, 4), (1024, 768, 2, 'tablette', 4, 7), (1024, 768, 2, 'tablette', 6, 7)]
if len(sys.argv) > 1: cas = [cas[int(sys.argv[1])]]
for (w, h, dpr, nom, ral, vag) in cas:
    with sync_playwright() as p:
        b, pg, errs, tc = ouvrir(p, w, h, dpr, args=['--disable-gpu'], ralenti=ral)
        for k in range(600):
            time.sleep(0.25)
            if pg.evaluate("__pt.ev('PS.complet')"): break
        pg.evaluate(robot)
        pg.evaluate("__pt.demarrer(%d);__pt.invincible(true);window.__rb=__robot5({});window.__prof={};window.__ri=setInterval(()=>{const t0=performance.now();const s=__pt.etat();if(s.etatJeu==='jeu')__rb.pas(0.1);window.__rt=(window.__rt||0)+performance.now()-t0},100)" % vag)
        pg.evaluate("window.__fp=[];(function f(){const s=__pt.etat();window.__fp.push([s.fps,s.finesse,s.G.length,s.P.ombre?1:0]);setTimeout(f,1000)})()")
        time.sleep(50); fp = pg.evaluate("window.__fp")[5:]
        om = [f[0] for f in fp if f[3]]; de = [f[0] for f in fp if not f[3]]
        moy = lambda a: round(sum(a) / len(a)) if a else None
        pr = pg.evaluate("JSON.stringify({n:__prof.n,regles:__prof.regles/__prof.n,dessin:__prof.s.map(v=>+(v/__prof.n).toFixed(2)),robot:window.__rt/__prof.n})")
        print('   par image (ms) :', pr, '[fond, fond vivant, sol, personnages, air, interface]')
        print(f"{nom} ralenti x{ral}, vague {vag+1} : chargement {tc:.0f} s ; images/s moyenne {moy([f[0] for f in fp])}, pire {min(f[0] for f in fp):.0f} ; à découvert {moy(de)}, dans l'ombre {moy(om)} ({len(om)} s sur {len(fp)}) ; finesse finale {fp[-1][1]}, golems max {max(f[2] for f in fp)}, image {pg.evaluate('__pt.etat().taille')}", errs[:3], flush=True)
        b.close()
