# paquet-sources.py : met les sources du jeu dans brumeval-sources.zip (dans ce dossier de travail), sans les captures ni les builds.
# La racine du zip = ce dossier de travail (S). Rien n'est publié : le zip est envoyé à Romain dans la conversation.
import os, sys, shutil, zipfile
S = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(S, 'paquet', 'brumeval-sources')
if os.path.exists(W): shutil.rmtree(W)
os.makedirs(W)

EXT_TEST = ('.py', '.js', '.css', '.md', '.json', '.html', '.sh', '.txt')
def copier(rel, filtre=None):
    src = os.path.join(S, rel)
    if os.path.isfile(src):
        d = os.path.join(W, rel); os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy2(src, d); return
    for racine, dossiers, fichiers in os.walk(src):
        dossiers[:] = [x for x in dossiers if x not in ('__pycache__', 'node_modules', 'captures')]
        for f in fichiers:
            p = os.path.join(racine, f)
            if f.endswith('.pyc') or (filtre and not filtre(p)): continue
            d = os.path.join(W, os.path.relpath(p, S)); os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy2(p, d)

for f in os.listdir(os.path.join(S, 'jeu')):
    if f.endswith('.md') or f == 'build.py': copier('jeu/' + f)
copier('jeu/src'); copier('jeu/tools'); copier('jeu/enquete3')   # (l'enquête 3 : ses deux documents de détail, la page, les outils de la page — Bible §13)
copier('jeu/test', lambda p: p.endswith(EXT_TEST) and os.path.getsize(p) < 1000000)
for f in ('favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest'): copier('jeu/dist/' + f)
copier('deploy'); copier('stable'); copier('codes-ck/dump.py'); copier('projet-claude')   # (projet-claude : les consignes du projet « Brumeval » dans Claude)
copier('missions-test', lambda p: p.endswith(('.py', '.sh')))
for f in ('rapide.sh', 'lent-outil.py', 'PASSATION.md', 'paquet-sources.py', 'codes-avant-gel.json'): copier(f)

# les chemins de cette session → chemins relatifs (dans la copie seulement)
def remplacer(rel, a, b):
    p = os.path.join(W, rel); t = open(p).read(); t = t.replace(a, b); open(p, 'w').write(t)
remplacer('rapide.sh', 'S=' + S, 'S=$(cd "$(dirname "$0")" && pwd)')
remplacer('deploy/deployer.sh', 'REPO=/home/claude/esperidad-tech.github.io',
          'S=$(cd "$(dirname "$0")/.." && pwd)\nREPO=${REPO:-/home/claude/esperidad-tech.github.io}\n# Nouvelle session : remplacer la ligne Claude-Session du commit par celle de la session en cours.')
remplacer('deploy/deployer.sh', S, '$S')

Z = os.path.join(S, 'brumeval-sources.zip')
if os.path.exists(Z): os.remove(Z)
with zipfile.ZipFile(Z, 'w', zipfile.ZIP_DEFLATED) as z:
    for racine, _, fichiers in os.walk(W):
        for f in fichiers:
            p = os.path.join(racine, f); z.write(p, os.path.relpath(p, os.path.dirname(W)))
n = sum(len(f) for _, _, f in os.walk(W))
print('%d fichiers, %.1f Mo → %s' % (n, os.path.getsize(Z) / 1e6, Z))
