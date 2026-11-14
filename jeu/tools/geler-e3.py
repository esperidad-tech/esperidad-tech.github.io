#!/usr/bin/env python3
"""Geler les codes de l'enquête 3 (14 novembre : l'enquête 3 est ouverte aux joueurs, Bible § 13.39).

Écrit jeu/src/codes-fixes-e3.js à partir d'un jeu construit : tous les codes de l'enquête 3, avec leurs symboles d'aujourd'hui.
Une fois gelé, un code ne change plus jamais de symboles, quoi qu'on ajoute ou retire dans l'enquête (moteur-base.js, codesGeles).

  Depuis jeu/ :   python3 tools/geler-e3.py <dossier construit>            (ou BRUMEVAL_DIST=<dossier construit>)
                  python3 tools/geler-e3.py <dossier construit> --voir     (ne change rien : dit seulement ce qui n'est pas gelé)

QUAND LE RELANCER : dès qu'un code NOUVEAU de l'enquête 3 part en ligne (il a pris un code libre : on le gèle à sa première mise en
ligne, comme pour les enquêtes 1 et 2). Puis reconstruire : le jeu doit donner exactement les mêmes codes (codes-ck/dump.py).
Il s'arrête sans rien écrire si un code déjà gelé n'a plus les mêmes symboles dans le jeu construit (ça ne doit jamais arriver).
Les codes partagés avec le donjon restent dans codes-fixes.js (enquête 3), vérifiés par tools/e3-donjon-codes.js : pas recopiés ici.
"""
import sys, os, json, re, subprocess
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
JEU = os.path.dirname(ICI)
SORTIE = os.path.join(JEU, 'src', 'codes-fixes-e3.js')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
VOIR = '--voir' in sys.argv
D = args[0] if args else os.environ.get('BRUMEVAL_DIST')
if not D or not os.path.isfile(os.path.join(D, 'index.html')):
    sys.exit('Il faut le dossier d\'un jeu construit (index.html) : python3 tools/geler-e3.py <dossier construit>')
D = os.path.abspath(D)


def gel_du_fichier(chemin):
    """Les codes gelés de l'enquête 3 qu'un fichier pose (codes-fixes.js ou codes-fixes-e3.js), lus sans navigateur."""
    if not os.path.isfile(chemin):
        return {}
    js = ("global.window = {ENQUETES:{1:{}, 2:{}, 3:{}}}; require(%s); "
          "process.stdout.write(JSON.stringify(window.ENQUETES[3].codesFixes || {}));") % json.dumps(chemin)
    return json.loads(subprocess.run(['node', '-e', js], check=True, capture_output=True, text=True).stdout)


# 1. les codes de l'enquête 3 dans le jeu construit
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto('file://' + os.path.join(D, 'index.html'))
    pg.wait_for_timeout(500)
    jeu = pg.evaluate("""() => { var c = M.codesEnquete(ENQUETES[3]).parId, x = {};
        Object.keys(c).forEach(function(k){ x[k] = c[k].join('-'); }); return x; }""")
    b.close()

# 2. ce qui est déjà gelé : le pont avec le donjon (codes-fixes.js) et ce fichier-ci
pont = gel_du_fichier(os.path.join(JEU, 'src', 'codes-fixes.js'))
deja = gel_du_fichier(SORTIE)

# 3. rien de gelé ne doit avoir bougé ; aucun doublon
bouges = [k for k in list(pont) + list(deja) if k in jeu and jeu[k] != (pont.get(k) or deja.get(k))]
if bouges:
    sys.exit('ARRÊT, rien n\'est écrit : des codes déjà gelés ont d\'autres symboles dans le jeu construit : ' + ', '.join(sorted(bouges)[:20]))
vus, doubles = {}, []
for k, v in jeu.items():
    if v in vus:
        doubles.append(k + ' = ' + vus[v])
    vus[v] = k
if doubles:
    sys.exit('ARRÊT, rien n\'est écrit : deux codes ont les mêmes symboles : ' + ', '.join(doubles[:20]))

# 4. la nouvelle liste : tout ce que le jeu connaît, plus ce qui était gelé et ne sert plus (un code gelé reste réservé pour toujours)
gel = dict(deja)
gel.update({k: v for k, v in jeu.items() if k not in pont})
neufs = sorted(k for k in gel if k not in deja)
print('Enquête 3 : %d codes dans le jeu, %d gelés avec le donjon (codes-fixes.js), %d gelés ici, dont %d nouveaux.'
      % (len(jeu), len(pont), len(gel), len(neufs)))
if neufs and len(neufs) <= 40:
    print('  Nouveaux : ' + ', '.join(neufs))
if VOIR:
    print('(--voir : rien n\'est écrit.)' if neufs else '(--voir : tout est déjà gelé.)')
    sys.exit(1 if neufs else 0)
if not neufs and os.path.isfile(SORTIE):
    print('Tout est déjà gelé : le fichier ne change pas.')
    sys.exit(0)


def cle(k):   # allure:2 avant allure:10 ; les familles ensemble
    return [int(m) if m.isdigit() else m for m in re.split(r'(\d+)', k)]


lignes, fam, ligne = [], None, ''
for k in sorted(gel, key=cle):
    f = k.split(':')[0]
    un = "'%s':'%s', " % (k.replace("\\", "\\\\").replace("'", "\\'"), gel[k])
    if f != fam or len(ligne) + len(un) > 190:
        if ligne:
            lignes.append(ligne.rstrip())
        ligne, fam = '', f
    ligne += un
if ligne:
    lignes.append(ligne.rstrip())
lignes[-1] = lignes[-1].rstrip(',')

ENTETE = """/* ==========================================================
   Les codes gelés de l'enquête 3 (14 novembre : l'enquête 3 est ouverte aux joueurs — Bible § 13.39)
   FICHIER ÉCRIT PAR tools/geler-e3.py À PARTIR DU JEU CONSTRUIT : NE PAS LE MODIFIER À LA MAIN.
   Comme pour les enquêtes 1 et 2 (codes-fixes.js) : un code gelé ne change plus jamais de symboles, quoi qu'on ajoute ou retire
   dans l'enquête ; un code ajouté plus tard prend un code libre (moteur-base.js, codesGeles). Dès qu'il est en ligne, on le gèle :
       python3 tools/geler-e3.py <dossier construit>      (puis reconstruire et comparer les codes : codes-ck/dump.py)
   Un code retiré de l'enquête reste ici : ses symboles ne resserviront à rien d'autre.
   Les codes partagés avec le donjon ne sont pas ici : ils restent dans codes-fixes.js (enquête 3), que tools/e3-donjon-codes.js
   compare à donjon-codes.js. Ce fichier se charge juste après codes-fixes.js (build.py) et complète sa liste.
   ========================================================== */
(function(){
'use strict';
var G = {
"""
PIED = """
};
var E = window.ENQUETES && window.ENQUETES[3]; if(!E) return;
var F = E.codesFixes = E.codesFixes || {};
Object.keys(G).forEach(function(id){ if(!F[id]) F[id] = G[id]; });   /* codes-fixes.js garde le dernier mot pour le pont avec le donjon */
})();
"""
with open(SORTIE, 'w', encoding='utf-8') as f:
    f.write(ENTETE + '\n'.join(lignes) + PIED)
print('Écrit : ' + os.path.relpath(SORTIE, JEU) + ' — reconstruire, puis vérifier que les codes n\'ont pas bougé (codes-ck/dump.py).')
