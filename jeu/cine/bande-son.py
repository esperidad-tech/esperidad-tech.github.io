#!/usr/bin/env python3
"""LA BANDE-SON DES FILMS (Bible §13.45 ; Romain, 15 novembre, 16 h 57 : « une petite musique en fonction de la situation »).

  python3 bande-son.py [a12 b23 finLeo finMaire]        (sous le verrou des tests : flock /tmp/brumeval-pw.lock …)

Pour chaque film :
  1. relit le film (src/films.js : la durée, les bruitages et leur instant, les sous-titres) et met à jour sortie/<film>.json
     (un bruitage déplacé ou un sous-titre retouché n'oblige pas à refilmer les images) ;
  2. rend hors ligne, avec le moteur de l'Atelier des sons, chaque bruitage du film (la version choisie par Romain, sinon la A,
     comme le jeu) et la musique du film (essai/sons/cine-musiques.js : MUSIQUES.cineMus<Film>A), les pose à leur instant et les mélange ;
  3. passe le tout dans le même compresseur que le donjon, puis un limiteur, et l'écrit dans sortie/<film>.mp3 : LA BANDE-SON,
     que le lecteur des films (src/cine-lecteur.js) joue avec la vidéo (la vidéo reste muette) ;
  4. fait une copie « à regarder » pour Romain, avec le son et les sous-titres comme dans le jeu (plus gros, qui s'écrivent
     lettre après lettre) : /tmp/cine/apercus/<film>-avec-son.mp4. On ne lui envoie JAMAIS la vidéo muette seule.
  5. relance infos.py (sortie/cine-infos.js, que le jeu et le donjon embarquent).
"""
import sys, os, re, json, base64, subprocess
import numpy as np
from scipy.io import wavfile
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
SONS = os.path.join(ICI, '..', 'donjon', 'essai', 'sons')
SON_JS = os.path.join(ICI, '..', 'donjon', 'essai', 'src', 'son.js')
SORTIE = os.path.join(ICI, 'sortie')
APERCUS = '/tmp/cine/apercus'
SR = 44100
LARG, HAUT_IMG, HAUT = 1440, 616, 810          # l'image en 21:9, dans un écran 16:9 (deux bandes noires de 97 points)
BANDE = (HAUT - HAUT_IMG) // 2
MUSIQUE = {'entree': 'cineMusEntree', 'a12': 'cineMusA12', 'b23': 'cineMusB23', 'finLeo': 'cineMusFinLeo', 'finMaire': 'cineMusFinMaire', 'chene': 'cineMusChene'}
GAIN_MUSIQUE = 1.4                               # la musique sous les bruitages (environ 10 dB en dessous)


def choix_romain():
    """les versions validées par Romain (la table CHOIX du donjon) : on prend la première ; sinon la A"""
    s = open(SON_JS).read()
    a = s.index('var CHOIX = S.CHOIX_SONS = {'); b = s.index('};', a)
    return {m.group(1): re.findall(r"'([A-Z])'", m.group(2)) for m in re.finditer(r'(\w+):\[([^\]]*)\]', s[a:b])}


def version(choix, id_):
    v = choix.get(id_) or []
    return id_ + (v[0] if v else 'A')


def page_banc():
    os.makedirs(APERCUS, exist_ok=True)
    p = os.path.join(APERCUS, '_banc.html')
    niv = json.load(open(os.path.join(SONS, 'niveaux.json')))
    fichiers = ['moteur.js', 'bruitages.js', 'musiques.js', 'bestiaire.js', 'donjon.js', 'leo.js', 'cine.js', 'musiques-donjon.js', 'cine-musiques.js', 'banc.js']
    scripts = ''.join('<script src="file://%s"></script>' % os.path.abspath(os.path.join(SONS, f)) for f in fichiers)
    open(p, 'w').write('<!doctype html><meta charset="utf-8"><body><script>window.NIVEAUX = %s;</script>%s' % (json.dumps(niv), scripts))
    return 'file://' + p


def rendre(pg, cle, duree):
    r = pg.evaluate('([n, d]) => ATELIER_RENDRE(n, d, {niveau: (window.NIVEAUX || {})[n.replace(/^M:/, "")] || 1})', [cle, duree])
    raw = base64.b64decode(r['b64'])
    return np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float64) / 32767 * r['echelle']


def ass_temps(t):
    return '%d:%02d:%05.2f' % (int(t // 3600), int(t % 3600 // 60), t % 60)


def vitesse(texte, t0, t1):
    """lettres par seconde : la même règle que le lecteur du jeu (cine-lecteur.js, « vitesse ») — la phrase est entière à mi-temps au plus tard"""
    return max(28.0, len(texte) / max(.4, (t1 - t0) * .5))


def sous_titres(st, fichier):
    """les sous-titres du jeu, dans la bande du bas : le nom en jaune, la phrase qui s'écrit lettre après lettre (karaoké invisible → visible)"""
    L = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: %d' % LARG, 'PlayResY: %d' % HAUT, 'WrapStyle: 0', '', '[V4+ Styles]',
         'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
         'Style: Bande,DejaVu Serif,36,&H00D8ECF4,&HFF000000,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,2,50,50,12,1',
         '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    for t0, t1, texte, qui in st:
        phrase = '« ' + texte.replace('\n', ' ') + ' »'
        cs = 100.0 / vitesse(phrase, t0, t1)                  # centièmes de seconde par lettre
        k, acc, morceaux = 0, 0.0, []
        for i, ch in enumerate(phrase):
            acc += cs; n = int(round(acc)) - k; k += n
            morceaux.append('{\\k%d}%s' % (n, ch))
        nom = ('{\\fnDejaVu Sans\\fs21\\c&H4AB8E8&\\2a&H00&\\fsp2\\k0}' + qui.upper() + '\\N{\\r}') if qui else ''
        L.append('Dialogue: 0,%s,%s,Bande,,0,0,0,,%s%s' % (ass_temps(t0), ass_temps(t1), nom, ''.join(morceaux)))
    open(fichier, 'w', encoding='utf-8').write('\n'.join(L) + '\n')


def main():
    films = [a for a in sys.argv[1:] if not a.startswith('--')] or ['a12', 'b23', 'finLeo', 'finMaire']
    choix = choix_romain()
    infos, rendus = {}, {}
    with sync_playwright() as p:
        nav = p.chromium.launch()
        # 1. ce que dit le film aujourd'hui
        pg = nav.new_page()
        pg.goto('file://' + os.path.join(ICI, 'page.html'))
        for f in films:
            d = pg.evaluate('(n) => { var F = CINE.films[n]; return {nom:F.nom, duree:F.duree, sons:F.sons || [], sousTitres:F.sousTitres || []}; }', f)
            fj = os.path.join(SORTIE, f + '.json')
            vieux = json.load(open(fj)) if os.path.exists(fj) else {}
            if abs(vieux.get('duree', d['duree']) - d['duree']) > 1e-6: print('⚠️ %s : la durée a changé (%s → %s) : il faut refilmer (filmer.py)' % (f, vieux.get('duree'), d['duree']))
            vieux.update(d); json.dump(vieux, open(fj, 'w'), ensure_ascii=False, indent=1)
            infos[f] = vieux
        pg.close()
        # 2. les bruitages et les musiques, rendus hors ligne
        pg = nav.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.goto(page_banc())
        pg.wait_for_function('!!(window.BRUITAGES && window.MUSIQUES && window.ATELIER_RENDRE)')
        for f in films:
            for t, id_ in infos[f]['sons']:
                c = version(choix, id_)
                if c not in rendus: rendus[c] = rendre(pg, c, 8)
            if f in MUSIQUE:
                c = 'M:' + version(choix, MUSIQUE[f])
                rendus[(f, c)] = rendre(pg, c, infos[f]['duree'] + .5)
        for e in erreurs: print('ERREUR JS :', e)
        nav.close()
    for f in films:
        d = infos[f]
        n = int(d['duree'] * SR)
        mix = np.zeros((n + 8 * SR, 2))
        for t, id_ in d['sons']:
            x = rendus[version(choix, id_)]; i = int((t + .02) * SR)
            mix[i:i + len(x)] += x
        for k, x in rendus.items():
            if isinstance(k, tuple) and k[0] == f: mix[:len(x)] += x[:len(mix)] * GAIN_MUSIQUE
        mix = mix[:n]
        brut = os.path.join(APERCUS, f + '-brut.wav'); wavfile.write(brut, SR, mix.astype(np.float32))
        # 3. comme dans le donjon (essai/src/son.js) : le compresseur (-16 dB, 4 pour 1), puis un limiteur ; le plus fort à -1 dB
        trait = os.path.join(APERCUS, f + '-trait.wav')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', brut, '-af', 'volume=0.9,acompressor=threshold=-16dB:ratio=4:attack=4:release=200:knee=8,alimiter=limit=0.95:level=false', '-c:a', 'pcm_f32le', trait], check=True)
        m = subprocess.run(['ffmpeg', '-hide_banner', '-i', trait, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        gain = -1 - float(m.split('max_volume:')[1].split('dB')[0])
        mp3 = os.path.join(SORTIE, f + '.mp3')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', trait, '-af', 'volume=%.1fdB' % gain, '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', str(SR), mp3], check=True)
        # 4. la copie à regarder (16:9, les bandes noires, les sous-titres qui s'écrivent)
        ass = os.path.join(APERCUS, f + '.ass'); sous_titres(d['sousTitres'], ass)
        apercu = os.path.join(APERCUS, f + '-avec-son.mp4')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(SORTIE, f + '.mp4'), '-i', mp3,
                        '-vf', 'pad=%d:%d:0:%d:black,subtitles=%s' % (LARG, HAUT, BANDE, ass), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
                        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', apercu], check=True)
        print('%-9s %5.1f s  %2d bruitages + %s  →  %s (%.0f Ko)  et  %s (%.1f Mo)' % (f, d['duree'], len(d['sons']), version(choix, MUSIQUE.get(f, '-')),
              mp3, os.path.getsize(mp3) / 1e3, apercu, os.path.getsize(apercu) / 1e6))
    subprocess.run(['python3', os.path.join(ICI, 'infos.py')], check=True)


if __name__ == '__main__':
    main()
