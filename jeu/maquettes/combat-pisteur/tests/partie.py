# Une partie entière jouée par le robot, à pas fixes (sans attendre l'écran) : python3 partie.py [mal] [vague=N] [une] [inv] [sec=N] [graine=N]
import sys, json, time
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI
o = {}
for a in sys.argv[1:]:
    if a == 'mal': o['maladroit'] = True
    elif a == 'moyen': o['moyen'] = True
    elif a == 'une': o['uneVague'] = True
    elif a == 'inv': o['invincible'] = True
    elif a == 'sanssaut': o['sansSaut'] = True
    elif a.startswith('vague='): o['vague'] = int(a[6:]) - 1
    elif a.startswith('sec='): o['secondes'] = int(a[4:])
    elif a.startswith('reaction='): o['reaction'] = float(a[9:])
graine = next((int(a[7:]) for a in sys.argv[1:] if a.startswith('graine=')), None)
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    if graine is not None:
        pg.evaluate("(s=>{let x=s;Math.random=()=>(x=(x*16807)%%2147483647)/2147483647})(%d)" % (graine * 7919 + 13))
    pg.evaluate(open(ICI + '/robot.js', encoding='utf8').read())
    t0 = time.time()
    r = pg.evaluate("__sim(%s)" % json.dumps(o))
    print(json.dumps(r, ensure_ascii=False, indent=1))
    print('calcul', round(time.time() - t0, 1), 's ; ERREURS', errs[:6])
    b.close()
