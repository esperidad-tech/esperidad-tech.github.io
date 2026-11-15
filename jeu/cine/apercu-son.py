#!/usr/bin/env python3
"""Fabrique, pour Romain, une copie « à regarder » d'un film : AVEC les bruitages et les sous-titres dedans.

Les vrais films du jeu sont muets et sans texte (sortie/<film>.mp4) : c'est le jeu qui joue les bruitages de l'Atelier
à l'instant dit et qui écrit les sous-titres dans la bande noire du bas. Une vidéo envoyée seule ne montre donc ni l'un
ni l'autre. Cet outil refait ce que fait le jeu, pour qu'on puisse juger un film sans ouvrir le jeu :
  - chaque bruitage du film (sortie/<film>.json) est rendu hors ligne (le même moteur que l'Atelier des sons, version A
    comme le jeu tant que Romain n'a rien choisi), à son niveau (essai/sons/niveaux.json), posé à son instant, mélangé ;
  - l'image est mise dans un écran 16:9 avec les deux bandes noires, et les sous-titres sont écrits dans la bande du bas
    (le nom de celui qui parle en jaune, la phrase entre « »), comme dans le jeu.

  python3 apercu-son.py a12 b23 finLeo finMaire      -> /tmp/cine/apercus/<film>-avec-son.mp4
  (sous le verrou des tests : flock /tmp/brumeval-pw.lock python3 apercu-son.py …)

Ce n'est PAS ce que le jeu met en ligne : seulement une copie pour regarder. Pas de musique de fond (dans le donjon,
celle du combat continue derrière le film).
"""
import sys, os, json, base64, subprocess
import numpy as np
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
SONS = os.path.join(ICI, '..', 'donjon', 'essai', 'sons')
SORTIE = '/tmp/cine/apercus'
SR = 44100
LARG, HAUT_IMG = 1440, 616
HAUT = 810                      # 16:9
BANDE = (HAUT - HAUT_IMG) // 2  # 97 points en haut et en bas


def page_banc():
    os.makedirs(SORTIE, exist_ok=True)
    p = os.path.join(SORTIE, '_banc.html')
    niv = json.load(open(os.path.join(SONS, 'niveaux.json')))
    fichiers = ['moteur.js', 'bruitages.js', 'musiques.js', 'bestiaire.js', 'donjon.js', 'leo.js', 'cine.js', 'musiques-donjon.js', 'banc.js']
    scripts = ''.join('<script src="file://%s"></script>' % os.path.abspath(os.path.join(SONS, f)) for f in fichiers)
    open(p, 'w').write('<!doctype html><meta charset="utf-8"><body><script>window.NIVEAUX = %s;</script>%s' % (json.dumps(niv), scripts))
    return 'file://' + p


def rendre(pg, cle):
    r = pg.evaluate('([n, d]) => ATELIER_RENDRE(n, d, {niveau: (window.NIVEAUX || {})[n] || 1})', [cle, 8])
    raw = base64.b64decode(r['b64'])
    return np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(np.float64) / 32767 * r['echelle'], r['sr']


def ass_temps(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return '%d:%02d:%05.2f' % (h, m, s)


def sous_titres(st, fichier):
    """les sous-titres du jeu, dans la bande noire du bas"""
    lignes = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: %d' % LARG, 'PlayResY: %d' % HAUT, 'WrapStyle: 0', '',
              '[V4+ Styles]',
              'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
              'Style: Bande,DejaVu Serif,28,&H00D8ECF4,&H00D8ECF4,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,2,60,60,18,1',
              '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    for t0, t1, texte, qui in st:
        nom = ('{\\fnDejaVu Sans\\fs17\\c&H4AB8E8&\\fsp2}' + qui.upper() + '\\N') if qui else ''
        lignes.append('Dialogue: 0,%s,%s,Bande,,0,0,0,,{\\fad(120,120)}%s{\\r}« %s »' % (ass_temps(t0), ass_temps(t1), nom, texte.replace('\n', ' ')))
    open(fichier, 'w', encoding='utf-8').write('\n'.join(lignes) + '\n')


def main():
    films = [a for a in sys.argv[1:] if not a.startswith('--')] or ['a12', 'b23', 'finLeo', 'finMaire']
    infos = {f: json.load(open(os.path.join(ICI, 'sortie', f + '.json'))) for f in films}
    cles = sorted({s[1] + 'A' for f in films for s in infos[f]['sons']})
    rendus = {}
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page()
        erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.goto(page_banc())
        pg.wait_for_function('!!(window.BRUITAGES && window.ATELIER_RENDRE)')
        manquent = pg.evaluate('(l) => l.filter(k => typeof BRUITAGES[k] !== "function")', cles)
        if manquent: print('sons introuvables :', manquent)
        for c in cles:
            if c in manquent: continue
            rendus[c] = rendre(pg, c)
        for e in erreurs: print('ERREUR JS :', e)
        nav.close()
    for f in films:
        d = infos[f]
        n = int((d['duree'] + 1) * SR)
        mix = np.zeros((n, 2))
        for t, id_ in d['sons']:
            c = id_ + 'A'
            if c not in rendus: continue
            x, sr = rendus[c]
            i = int((t + .02) * SR)
            k = min(len(x), n - i)
            if k > 0: mix[i:i + k] += x[:k]
        mix = mix[:int(d['duree'] * SR)]
        pic = float(np.max(np.abs(mix))) if len(mix) else 0
        wav = os.path.join(SORTIE, f + '.wav')
        from scipy.io import wavfile
        wavfile.write(wav, SR, mix.astype(np.float32))      # (en flottants : le compresseur, plus bas, fait ce que fait le jeu)
        ass = os.path.join(SORTIE, f + '.ass')
        sous_titres(d['sousTitres'], ass)
        sortie = os.path.join(SORTIE, f + '-avec-son.mp4')
        vf = 'pad=%d:%d:0:%d:black,subtitles=%s' % (LARG, HAUT, BANDE, ass)
        # le son comme dans le donjon (essai/src/son.js) : le bus des bruitages (× 0,9), le compresseur (-16 dB, 4 pour 1),
        # un peu d'écho de souterrain ; puis un limiteur pour ne jamais saturer
        af = 'volume=0.9,acompressor=threshold=-16dB:ratio=4:attack=4:release=200:knee=8,aecho=0.8:0.6:70|140:0.22|0.12,alimiter=limit=0.95:level=false'
        trait = os.path.join(SORTIE, f + '-trait.wav')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', af, '-c:a', 'pcm_f32le', trait], check=True)
        # (puis on remonte le tout, pour qu'on l'entende sur un téléphone : le plus fort à -1 dB)
        m = subprocess.run(['ffmpeg', '-hide_banner', '-i', trait, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        mx = float(m.split('max_volume:')[1].split('dB')[0])
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(ICI, 'sortie', f + '.mp4'), '-i', trait,
                        '-vf', vf, '-af', 'volume=%.1fdB' % (-1 - mx), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', sortie], check=True)
        print('%-9s %5.1f s  %2d bruitages  %2d sous-titres  pic %.2f  -> %s (%.1f Mo)' % (f, d['duree'], len(d['sons']), len(d['sousTitres']), pic, sortie, os.path.getsize(sortie) / 1e6))


if __name__ == '__main__':
    main()
