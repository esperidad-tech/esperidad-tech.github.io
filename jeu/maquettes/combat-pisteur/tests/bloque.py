# Chercher une partie où le robot reste bloqué (une vague qui ne finit pas) : python3 bloque.py [profil] [vague] [graines...]
import sys, json
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI
profil = sys.argv[1] if len(sys.argv) > 1 else 'moyen'
vague = int(sys.argv[2]) if len(sys.argv) > 2 else 2
graines = [int(a) for a in sys.argv[3:]] or list(range(1, 9))
o = {'secondes': 300, 'vague': vague - 1, 'uneVague': True}
if profil == 'moyen': o['moyen'] = True
if profil == 'mal': o['maladroit'] = True
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    pg.evaluate(open(ICI + '/robot.js', encoding='utf8').read())
    for g in graines:
        r = pg.evaluate("(()=>{let x=%d;Math.random=()=>(x=(x*16807)%%2147483647)/2147483647;const r=__sim(%s);r.obs=__pt.etat().obs.filter(o=>o.k==='dalle');return r})()" % (g * 7919 + 13, json.dumps(o)))
        print(g, r['fin'], r['min'], 'min', 'vie', r['vieFin'], flush=True)
        if r['fin'] == 'temps':
            bl = r['bloqueA']; print('   robot', {k: v for k, v in bl['robot'].items() if k not in ('zt', 'ignore')}); print('   P', {k: bl['P'][k] for k in ('x', 'y', 'etat', 'ombre', 'hp')})
            for q in bl['G']: print('    ', q)
            print('    dalles plantées', r['obs'])
    b.close()
