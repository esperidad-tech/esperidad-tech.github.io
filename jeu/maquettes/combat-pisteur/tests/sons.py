# Les sons du combat, mesurés un par un (version 10). Claude ne peut pas écouter : il fabrique chaque son hors ligne, avec le même
# moteur que le jeu, et il mesure sa force (la crête, et le niveau moyen de son tiers de seconde le plus fort), sa durée, et sa
# hauteur (le « centre » de son énergie, et la part d'aigu au-dessus de 3 000 Hz).
#   python3 tests/sons.py            → le tableau de tous les sons, puis la musique (dans l'ombre, en combat, à chaque niveau ; le colosse)
#   python3 tests/sons.py wav        → écrit aussi les sons dans tests/sons-wav/ (pour les écouter)
#   python3 tests/sons.py regler     → mesure chaque son SANS son niveau, calcule le niveau qui le met à sa place (CIBLE, A_PART),
#                                      et l'écrit dans src/son.js (la table NIV) ; refaire la page et relancer sans « regler » pour vérifier
# « utile » : le niveau du dixième et demi de seconde le plus fort, entre 200 et 4 000 Hz : ce qu'un téléphone ou une tablette rend
# vraiment (le très grave, ils ne le rendent pas). C'est lui qu'on règle.
# Les règles vérifiées (Romain, 26 novembre) : pas de gros sons (crête sous 0,75), pas trop aigus (moins de 12 % d'énergie au-dessus
# de 3 000 Hz, centre sous 1 600 Hz), et les bruits de patrouille plus bas que les coups, eux-mêmes plus bas que les signaux.
import sys, os, base64, time, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from commun import ouvrir

SR = 32000
WAV = len(sys.argv) > 1 and sys.argv[1] == 'wav'
REGLER = len(sys.argv) > 1 and sys.argv[1] == 'regler'
MUSIQUE_SEULE = REGLER and len(sys.argv) > 2 and sys.argv[2] == 'musique'   # (regler musique : ne règle que la musique, les sons gardent leurs niveaux)
CIBLE = {'signal': 0.13, 'zone': 0.10, 'coup': 0.075, 'moi': 0.06, 'patrouille': 0.04}
A_PART = {'renfort': 0.14, 'repere': 0.14, 'colere': 0.14, 'cherche': 0.07, 'cri': 0.10, 'dechaine': 0.12,
          'aie': 0.10, 'chute': 0.11, 'assassin': 0.10, 'bong': 0.09, 'refus': 0.035, 'saut': 0.035, 'ramasse': 0.03, 'perdu': 0.045, 'victoire': 0.07, 'choix': 0.05, 'or': 0.05,
          'aboie': 0.085, 'pasColosse': 0.06, 'iColosse': 0.055, 'iChienGrogne': 0.05, 'boule': 0.075,
          'zBoule': 0.07, 'bond': 0.04, 'soin': 0.05, 'onde': 0.13, 'impact': 0.11, 'bang': 0.09, 'mortier': 0.09, 'acheve': 0.08, 'swishG': 0.04, 'jav': 0.05, 'ting': 0.06, 'porte': 0.06, 'obus': 0.065}
CIBLE_MUSIQUE = 0.017          # (version 11 : Romain, « trop forte, tu peux la réduire de moitié » ; le combat est réglé au même niveau que le mystère)
A_PART.update({'swish1': 0.05, 'swish2': 0.05, 'swish3': 0.065, 'dague1': 0.075, 'dague2': 0.082, 'dague3': 0.12, 'frappe': 0.075,
               'porteOuvre': 0.09, 'porteFerme': 0.07, 'porteClaque': 0.13, 'colosseArrive': 0.16, 'pasColosse': 0.085,
               'gColosse1': 0.13, 'gColosse2': 0.14, 'gColosse3': 0.12, 'gColosse4': 0.13, 'gColosse5': 0.14,
               'zJavelot': 0.11, 'zDalle': 0.115, 'chargeDalle': 0.11, 'jav': 0.07, 'iJavelot': 0.05, 'iDalle': 0.05, 'acheve': 0.1, 'assassin': 0.12})
CLAIRS = {'swish1', 'swish2', 'swish3', 'dague1', 'dague2', 'dague3'}   # la dague du donjon : on la veut claire (Romain), elle a droit à plus d'aigu
ICI = os.path.dirname(os.path.abspath(__file__))
B64 = """async (appel) => { let s0 = 12345; const vrai = Math.random; Math.random = () => { s0 = (s0 * 1664525 + 1013904223) >>> 0; return s0 / 4294967296; };
  let a; try { a = await eval(appel); } finally { Math.random = vrai; } const f = new Float32Array(a), u = new Uint8Array(f.buffer); let s = '';
  for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }"""

def mesure(x):
    cr = float(np.max(np.abs(x))) if len(x) else 0.0
    n = int(SR * 0.3); e = np.cumsum(np.concatenate([[0.0], x.astype(np.float64) ** 2]))
    fort = float(np.sqrt(np.max(e[n:] - e[:-n]) / n)) if len(x) > n else float(np.sqrt(np.mean(x ** 2)))
    seuil = max(cr * 0.03, 1e-4); ou = np.nonzero(np.abs(x) > seuil)[0]; dur = (ou[-1] - ou[0]) / SR if len(ou) else 0.0
    sp = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2; fr = np.fft.rfftfreq(len(x), 1 / SR); tot = sp.sum() or 1
    return cr, fort, dur, float((sp * fr).sum() / tot), float(sp[fr > 3000].sum() / tot), float(sp[fr < 150].sum() / tot)

def utile(x, moyen=False):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[(fr < 200) | (fr > 4000)] = 0; y = np.fft.irfft(X, len(x))
    if moyen: return float(np.sqrt(np.mean(y ** 2)))
    n = int(SR * 0.15); e = np.cumsum(np.concatenate([[0.0], y ** 2])); return float(np.sqrt(np.max(e[n:] - e[:-n]) / n))

def ecrire(nom, x):
    d = os.path.join(ICI, 'sons-wav'); os.makedirs(d, exist_ok=True)
    w = wave.open(os.path.join(d, nom + '.wav'), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()); w.close()

TYPES = {} if REGLER and False else {'repere': ['chien', 'colosse'], 'colere': ['chien', 'belier', 'colosse'], 'cri': ['chien', 'cuirasse'], 'cherche': ['javelot', 'colosse'], 'acheve': ['chien', 'belier', 'colosse']}
with sync_playwright() as p:
    b, pg, errs, tc = ouvrir(p, 844, 390, 1, suffixe='?extrait=non')
    pg.tap('#btnGo', force=True); time.sleep(0.5)
    noms = pg.evaluate('__son.noms()'); sortes = {n: pg.evaluate('__son.sorte(%r)' % n) for n in noms}
    def rendre(appel):
        return np.frombuffer(base64.b64decode(pg.evaluate(B64, appel)), dtype='<f4')
    lignes = []; soucis = []
    GAINS = {}
    if REGLER:
        # (version 11) le réglage en trois passes : la sortie du moteur a un limiteur, donc la crête ne suit pas le volume en ligne droite ;
        # chaque passe repart du niveau trouvé à la précédente
        for passe in range(0 if MUSIQUE_SEULE else 3):
            for n in noms:
                l = []
                for ty in TYPES.get(n, [None]):
                    x = rendre('__son.rendre(%r, 4, %s, %s)' % (n, repr(ty) if ty else 'null', GAINS.get(n, 1.0))); l.append((mesure(x)[0], utile(x)))
                g0 = GAINS.get(n, 1.0); cible = A_PART.get(n, CIBLE[sortes[n]])
                GAINS[n] = float(np.clip(g0 * min(cible / max(1e-5, np.mean([q[1] for q in l])), 0.6 / max(q[0] for q in l)), 0.2, 9))   # (jamais une crête au-dessus de 0,6)
            print('passe', passe + 1, 'faite')
    for n in ([] if REGLER else noms):
        for ty in TYPES.get(n, [None]):
            x = rendre('__son.rendre(%r, 4, %s, false)' % (n, repr(ty) if ty else 'null'))
            cr, fort, dur, centre, aigu, grave = mesure(x); nom = n + ('/' + ty if ty else ''); ut = utile(x); cible = A_PART.get(n, CIBLE[sortes[n]])
            lignes.append((sortes[n], nom, cr, ut, dur, centre, aigu, grave, cible, n))
            if abs(ut / cible - 1) > (0.4 if ty else 0.3) and not (cr > 0.55 and ut < cible): soucis.append('%s : pas à sa place (utile %.3f, voulu %.3f)' % (nom, ut, cible))
            if WAV: ecrire(nom.replace('/', '-'), x)
            if cr > 0.75: soucis.append('%s : trop fort (crête %.2f)' % (nom, cr))
            if cr < 0.02: soucis.append('%s : presque rien (crête %.3f)' % (nom, cr))
            if aigu > (0.6 if n in CLAIRS else 0.12): soucis.append('%s : trop aigu (%.0f %% au-dessus de 3000 Hz)' % (nom, aigu * 100))
            if centre > (3200 if n in CLAIRS else 1600): soucis.append('%s : centre trop haut (%.0f Hz)' % (nom, centre))
    ordre = ['moi', 'patrouille', 'coup', 'zone', 'signal']
    if REGLER:
        import json, re
        if MUSIQUE_SEULE:
            t0 = open(os.path.join(ICI, '..', 'src', 'son.js'), encoding='utf8').read(); niv = json.loads(re.search(r'/\*NIV\*/(.*?)/\*FIN\*/', t0, re.S).group(1))
        else:
            niv = {n: round(GAINS[n], 2) for n in noms}
        x = rendre("__son.musique('calme',1,40,true)")[SR * 8:]; niv['musique'] = round(float(np.clip(CIBLE_MUSIQUE / max(1e-5, utile(x, True)), 0.1, 4)), 2)
        x = rendre("__son.musique('action',1,40,true)")[SR * 8:]; niv['musAction'] = round(float(np.clip(CIBLE_MUSIQUE / max(1e-5, utile(x, True)), 0.1, 4)), 2)
        src = os.path.join(ICI, '..', 'src', 'son.js'); t = open(src, encoding='utf8').read()
        t2 = re.sub(r'/\*NIV\*/.*?/\*FIN\*/', lambda m: '/*NIV*/' + json.dumps(niv, separators=(',', ':')) + '/*FIN*/', t, count=1, flags=re.S); assert t2 != t or '/*NIV*/' in t
        open(src, 'w', encoding='utf8').write(t2); print('niveaux écrits dans src/son.js :', json.dumps(niv)); b.close(); sys.exit(0)
    print('%-11s %-22s %6s %6s %6s %7s %6s %6s %6s' % ('sorte', 'son', 'crête', 'utile', 'durée', 'centre', 'aigu', 'grave', 'voulu'))
    for so in ordre:
        l = [q for q in lignes if q[0] == so]
        for q in sorted(l, key=lambda q: -q[3]):
            print('%-11s %-22s %6.2f %6.3f %5.1fs %6.0fHz %5.1f%% %5.0f%% %6.3f' % (q[0], q[1], q[2], q[3], q[4], q[5], q[6] * 100, q[7] * 100, q[8]))
        if l: print('   → %s : niveau moyen %.3f (de %.3f à %.3f)' % (so, np.mean([q[3] for q in l]), min(q[3] for q in l), max(q[3] for q in l)))
    print()
    for nom, appel in [('ombre vagues 1-2', "__son.musique('calme',0,40)"), ('ombre vagues 3-4', "__son.musique('calme',1,40)"),
                       ('ombre vagues 5-6', "__son.musique('calme',2,40)"), ('ombre vagues 7-8', "__son.musique('calme',3,40)"),
                       ('combat vagues 1-2', "__son.musique('action',0,40)"), ('combat vagues 3-4', "__son.musique('action',1,40)"),
                       ('combat vagues 7-8', "__son.musique('action',3,40)"), ('colosse, combat', "__son.musique('colosse',3,40)"),
                       ('colosse, ombre', "__son.musique('colosseOmbre',3,40)")]:
        x = rendre(appel); x = x[SR * 8:]                                  # (après la montée du début)
        cr, fort, dur, centre, aigu, grave = mesure(x); moy = float(np.sqrt(np.mean(x ** 2)))
        print('%-22s crête %.2f  moyen %.3f  utile %.3f  centre %4.0f Hz  aigu %.1f %%  sous 150 Hz %2.0f %%' % (nom, cr, moy, utile(x, True), centre, aigu * 100, grave * 100))
        if WAV: ecrire(nom.replace(' ', '-').replace(',', ''), x)
        if cr > 0.6: soucis.append('%s : trop forte (crête %.2f)' % (nom, cr))
        if aigu > 0.05: soucis.append('%s : trop aiguë' % nom)
    print('\nERREURS', errs[:5]); print('SOUCIS', len(soucis)); [print('  -', s) for s in soucis]
    b.close()
