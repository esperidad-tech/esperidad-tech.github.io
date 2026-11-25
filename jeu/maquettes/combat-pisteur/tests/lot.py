# Plusieurs parties d'affilée, robots à pas fixes. Une partie = un seul essai (à terre, tout est à refaire).
#   python3 lot.py [bon|moyen|mal] [nombre] [sec=N] [vague=N] [vie=N] [bandages=N] [une]
import sys, json, time
from playwright.sync_api import sync_playwright
from commun import ouvrir, ICI
profil = next((a for a in sys.argv[1:] if a in ('bon', 'moyen', 'mal')), 'bon')
n = next((int(a) for a in sys.argv[1:] if a.isdigit()), 5)
o = {'secondes': next((int(a[4:]) for a in sys.argv[1:] if a.startswith('sec=')), 1800)}
for a in sys.argv[1:]:
    if a.startswith('vague='): o['vague'] = int(a[6:]) - 1
    if a.startswith('vie='): o['vie'] = int(a[4:])
    if a.startswith('bandages='): o['bandages'] = int(a[9:])
    if a == 'une': o['uneVague'] = True
if profil == 'moyen': o['moyen'] = True
if profil == 'mal': o['maladroit'] = True
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p)
    pg.evaluate(open(ICI + '/robot.js', encoding='utf8').read())
    fins = []
    for i in range(n):
        pg.evaluate("(s=>{let x=s;Math.random=()=>(x=(x*16807)%%2147483647)/2147483647})(%d)" % ((i + 1) * 7919 + 13))
        r = pg.evaluate("__sim(%s)" % json.dumps(o)); s = r['stats']
        fins.append((r['fin'], r['vagueAtteinte'], r['min'], r['vieFin'], r['bandagesRestants']))
        print(f"{profil} {i+1}: {r['fin']} à la vague {r['vagueAtteinte']}, {r['min']} min, vie {r['vieFin']}, bandages restants {r['bandagesRestants']} (perdus {s['bandagesPerdus']}) | par vague (s, vie perdue, vie à la fin, bandages) {[(v['s'], v['perdus'], v['vie'], v['bandages']) for v in r['parVague']]}", flush=True)
        print(f"      ombre {r['partDansLOmbre']} vu {r['partVu']} disparaître {r['tempsPourDisparaitre']} | perdus {s['recus']} dont {s['par']} | embuscades {s['embuscades']} assommés {s['assommes']} colères {s['coleres']} (parés {s['pares']}, flairé {s['flaires']}, chaînes {s['chaines']}, boule {s['boules']}) entre eux {s['entreEux']} (tués {s['tuesEntreEux']}) obus {s['obus']} javelots {s['javelots']} duels {r['robot']['duels']}", flush=True)
        if r.get('bloqueA'):
            bl = r['bloqueA']; print('   BLOQUÉ', {k: v for k, v in bl['robot'].items() if k not in ('zt', 'ignore')}); print('   ', bl['P'], bl['phase'])
            for g in bl['G']: print('    ', g)
    gagne = sum(1 for f in fins if f[0] == 'gagné')
    print(f"BILAN {profil} : {gagne} gagnées sur {n} ; vagues atteintes {[f[1] for f in fins]} ; durées {[f[2] for f in fins]} ; ERREURS {errs[:6]}")
    b.close()
