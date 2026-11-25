# Une partie entière du robot, par bouts de 0,4 s : entre deux bouts la page dessine pour de vrai. On vérifie qu'aucune image ne
# plante, et on garde des captures (une par sorte de moment).   python3 partie-vue.py [moyen|mal] [inv]
import sys, json, time
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI, SORTIE
o = {}
if 'moyen' in sys.argv: o['moyen'] = True
if 'mal' in sys.argv: o['maladroit'] = True
if 'inv' in sys.argv: o['invincible'] = True      # pour voir les huit vagues dessinées sans retomber à la première
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    for k in range(400):
        if pg.evaluate("__pt.ev('PS.complet')"): break
        time.sleep(0.25)
    pg.evaluate(open(ICI + '/robot.js', encoding='utf8').read())
    pg.evaluate("__simDebut(%s)" % json.dumps(o))
    vus = set(); t0 = time.time(); lastv = 0
    def shot(n):
        if n in vus: return
        vus.add(n); pg.screenshot(path=f"{SORTIE}/p-{n}.png")
    while time.time() - t0 < 520:
        r = pg.evaluate("__simSuite(0.4)"); time.sleep(0.05)
        if r['vague'] != lastv:
            lastv = r['vague']; print(f"{r['t']:5d} s  vague {r['vague']}  chutes {r['chutes']}", flush=True); time.sleep(0.2); shot(f"vague{r['vague']}")
        for z in r['zones']: shot('zone-' + z.replace('/', '-'))
        if r['obus']: shot('obus')
        if r['ombre']: shot(f"ombre-v{r['vague']}")
        if r['etatP'] in ('plaque', 'sonne', 'vol', 'chaine', 'embuscade', 'assomme', 'aterre', 'bandage'): shot('P-' + r['etatP'])
        if r['mode'] == 'fuite': shot(f"fuite-v{r['vague']}")
        if r['e'] == 'gagne': break
    print('fin', r['e'], r['t'], 's, chutes', r['chutes'], '| captures', len(vus), '| ERREURS', errs[:8])
    b.close()
