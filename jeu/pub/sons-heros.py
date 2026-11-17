"""Les bruits des quatre films des héros, tirés du montage (heros.js) → ../cine/src/film-heros.js (l'atelier des films ne fait que leur
   bande-son : bande-son.py herosPisteur herosAlchimiste herosBarde herosSage). À relancer dès qu'une coupe ou un mot bouge dans heros.js.
   Un « pop » par mot qui surgit, un « fffiou » quand une image chasse l'autre, « Ouais ! » pour l'équipe, les étincelles pour « Joue le… ! »."""
import os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__)); NOMS = {'pisteur': 'Le film du Pisteur', 'alchimiste': 'Le film de l\'Alchimiste', 'barde': 'Le film du Barde', 'sage': 'Le film du Sage'}
L = ['/* film-heros.js — LES QUATRE FILMS DES HÉROS (Romain, 17 novembre). ÉCRIT PAR jeu/pub/sons-heros.py À PARTIR DU MONTAGE (jeu/pub/heros.js) : NE PAS LE MODIFIER À LA MAIN.',
     '   Ces films ne sont PAS filmés ici : leur image vient de jeu/pub/ (heros.html, filmer-heros.py). Ils sont inscrits ici pour leur bande-son',
     '   (bande-son.py herosPisteur…) et pour la fiche du jeu (cine-infos.js). Les bruits tombent sur les coupes du montage. */']
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for f in NOMS:
        pg.goto('file://' + ICI + '/heros.html?film=' + f); pg.wait_for_function('!!window.HEROS')
        d = pg.evaluate("() => ({T:HEROS.duree, plans:HEROS.plans.map(function(p){ return [p[0], p[3].entree || '']; }), mots:HEROS.FILMS[HEROS.film].mots.map(function(m){ return m[0]; })})")
        s = [[.5, 'pubPop'], [1.0, 'pubPop']]
        s += [[round(t - .05, 2), 'pubWhoosh'] for t, e in d['plans'] if e in ('pousse', 'balai', 'zoom')]
        s += [[t, 'pubPop'] for t in d['mots']]
        s += [[23.95, 'pubWhoosh'], [24.55, 'cineClameur'], [26.25, 'pubTada']]
        s.sort(key=lambda x: x[0])
        L.append("CINE.films.heros%s = {\n  nom:%s, duree:%s, ailleurs:'jeu/pub',\n  sons:%s,\n  sousTitres:[],\n  etat:function(){ return {cam:{x:0, y:-300, z:1500, focus:1500}, acteurs:[]}; }\n};" % (f.capitalize(), json.dumps(NOMS[f], ensure_ascii=False), d['T'], json.dumps(s)))
        print(f, len(s), 'bruits')
    b.close()
open(os.path.join(ICI, '..', 'cine', 'src', 'film-heros.js'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
