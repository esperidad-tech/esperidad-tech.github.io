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
# LES FILMS REFAITS QUI ATTENDENT LE « OUI » DE ROMAIN (18 novembre, Bible §13.69). Le jeu embarque cette fiche : si elle décrit un film
# refait alors que le site joue encore l'ancien, ses sous-titres et ses sons tombent au mauvais moment. Tant qu'un film refait n'est pas
# en ligne, la fiche de l'ANCIEN (celui du site) est gardée dans sortie/attente/<film>.json, et une mise en ligne du jeu se construit avec
#   BRUMEVAL_FILMS_ATTENTE=puits,escalier python3 cine/infos.py     (puis : python3 cine/infos.py, pour remettre la fiche des sources)
# Quand le film refait part en ligne (avec sa vidéo et sa bande-son) : on efface sa fiche de sortie/attente/.
for n in [x for x in os.environ.get('BRUMEVAL_FILMS_ATTENTE', '').split(',') if x]:
    infos[n] = json.load(open(os.path.join(S, 'attente', n + '.json')))
    print('  (en attente : la fiche de « %s » est celle du film encore en ligne, %s s)' % (n, infos[n]['duree']))
open(os.path.join(S, 'cine-infos.js'), 'w').write('/* les cinématiques (jeu/cine : infos.py, ne pas modifier à la main) — la durée, les sons, les sous-titres de chaque film */\n'
    'window.CINE_INFOS = ' + json.dumps(infos, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('cine-infos.js :', ', '.join(infos))
