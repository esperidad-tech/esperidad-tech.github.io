"""Réunit ce que disent les films (sortie/<film>.json : la durée, les sons, les sous-titres ; sortie/<film>.mp3 : la bande-son) dans sortie/cine-infos.js,
   que le jeu et le donjon embarquent (build.py, donjon/moteur/construire.py). Lancé par filmer.py après chaque film."""
import os, json, glob
ICI = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(ICI, 'sortie')
infos = {}
for f in sorted(glob.glob(os.path.join(S, '*.json'))):
    n = os.path.splitext(os.path.basename(f))[0]
    d = json.load(open(f))
    infos[n] = {'duree': d['duree'], 'sons': d.get('sons', []), 'sousTitres': d.get('sousTitres', []),
                'octets': os.path.getsize(os.path.join(S, n + '.mp4')) if os.path.exists(os.path.join(S, n + '.mp4')) else 0}
    # la bande-son (bande-son.py) : les bruitages et la musique, mélangés d'avance ; le lecteur la joue avec la vidéo
    if os.path.exists(os.path.join(S, n + '.mp3')): infos[n]['piste'] = 1
open(os.path.join(S, 'cine-infos.js'), 'w').write('/* les cinématiques (jeu/cine : infos.py, ne pas modifier à la main) — la durée, les sons, les sous-titres de chaque film */\n'
    'window.CINE_INFOS = ' + json.dumps(infos, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('cine-infos.js :', ', '.join(infos))
