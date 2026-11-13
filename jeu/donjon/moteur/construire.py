"""Le donjon complet (Les Enquêteurs de Brumeval, enquête 3) — MOTEUR-DONJON.md §1.

    python3 construire.py        -> sortie/ : index.html (le Pisteur), sage.html, alchimiste.html, tenue.html (les héros en tenue
                                    de combat, montrés par le jeu avant la descente), a/ (scripts chargés à la demande : un par
                                    bête), i/ (images : décors, salles, héros, textures)

Rien n'est dessiné ici : on assemble ce qui existe (essai/, anim/, decors/, scenes/, carte.js, pages du Sage et de
l'Alchimiste). Les PNG des salles sont convertis en WebP (une fois : on ne refait que ce qui a changé)."""
import os, sys, json, shutil
ICI = os.path.dirname(os.path.abspath(__file__))
DONJON = os.path.dirname(ICI)
SRC = os.path.join(ICI, 'src')
SORTIE = os.path.join(ICI, 'sortie')
ESSAI = os.path.join(DONJON, 'essai')

BETES = ['ratcuir', 'araignee', 'petitearaignee', 'chauvesouris', 'feufollet', 'tetard', 'roirats', 'gardien', 'bourbe']
# le cœur du jeu, dans cet ordre (tout le reste se charge à la demande)
COEUR = [
    ('sons', [os.path.join(ESSAI, 'sons', f) for f in ['moteur.js', 'bruitages.js', 'bestiaire.js', 'donjon.js', 'leo.js', 'musiques.js', 'musiques-donjon.js']]),
    ('animation', [os.path.join(DONJON, 'anim', 'cuire.js'), os.path.join(DONJON, 'anim', 'heros', 'heros-anime.js')]),
    ('salle d\'essai (son, effets)', [os.path.join(ESSAI, 'src', 'son.js'), os.path.join(ESSAI, 'src', 'effets.js')]),
    ('règles', [os.path.join(DONJON, 'donjon-codes.js'), os.path.join(SRC, 'donnees.js'), os.path.join(SRC, 'regles.js'), os.path.join(SRC, 'leo-regles.js')]),
    ('carte, salles, ambiances', [os.path.join(DONJON, 'carte.js'), os.path.join(DONJON, 'scenes', 'scenes.js'), os.path.join(DONJON, 'scenes', 'objets.js'), os.path.join(DONJON, 'decors', 'ambiance.js')]),
    ('moteur', [os.path.join(SRC, f) for f in ['allure.js', 'noyau.js', 'betes.js', 'combat.js', 'leo-anime.js', 'leo.js', 'explo.js', 'demarrage.js']]),
]
CSS = [os.path.join(ESSAI, 'src', 'jeu.css'), os.path.join(SRC, 'donjon.css')]


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def plus_recent(src, dst):
    return not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst)


def webp(src, dst, qualite=82, largeur=None):
    if not plus_recent(src, dst):
        return
    from PIL import Image
    im = Image.open(src).convert('RGB')
    if largeur and im.width > largeur:
        im = im.resize((largeur, round(im.height * largeur / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=qualite, method=6)


def copier(src, dst):
    if plus_recent(src, dst):
        shutil.copyfile(src, dst)


def images():
    d = os.path.join(SORTIE, 'i'); os.makedirs(d, exist_ok=True)
    # les décors de combat (déjà en WebP), et celui de la salle des rats (la photo de la salle d'essai)
    for f in sorted(os.listdir(os.path.join(DONJON, 'decors', 'webp'))):
        copier(os.path.join(DONJON, 'decors', 'webp', f), os.path.join(d, 'decor-' + f))
    webp(os.path.join(ESSAI, 'img', 'decor.png'), os.path.join(d, 'decor-rats.webp'), 84)
    # les salles sans combat
    for f in sorted(os.listdir(os.path.join(DONJON, 'scenes', 'png'))):
        if f.endswith('.png'):
            webp(os.path.join(DONJON, 'scenes', 'png', f), os.path.join(d, 'scene-' + f[:-4] + '.webp'), 82)
    # les photos des héros (portraits), les textures de fumée
    for f in ['heros-sage.png', 'heros-alchimiste.png', 'heros-pisteur.png', 'fumee-a.png', 'fumee-b.png', 'fumee-c.png', 'brume-a.png', 'brume-b.png', 'flamme.png']:
        copier(os.path.join(ESSAI, 'img', f), os.path.join(d, f))
    # les portraits des monstres, pour la tablette du Sage (pages/portraits/, tirés des fiches du bestiaire)
    pp = os.path.join(DONJON, 'pages', 'portraits')
    for f in sorted(os.listdir(pp)) if os.path.isdir(pp) else []:
        if f.endswith('.webp'):
            copier(os.path.join(pp, f), os.path.join(d, 'portrait-' + f))


def scripts():
    d = os.path.join(SORTIE, 'a'); os.makedirs(d, exist_ok=True)
    copier(os.path.join(DONJON, 'anim', 'rat', 'rat-anime.js'), os.path.join(d, 'rat-anime.js'))
    for b in BETES:
        copier(os.path.join(DONJON, 'anim', 'betes', b, b + '-anime.js'), os.path.join(d, b + '-anime.js'))


def page():
    niv = os.path.join(ESSAI, 'sons', 'niveaux.json')
    code = '/* les niveaux des sons (essai/sons/niveaux.json) */\nwindow.NIVEAUX = ' + (json.dumps({k: round(v, 3) for k, v in sorted(json.load(open(niv)).items())}, separators=(',', ':')) if os.path.exists(niv) else '{}') + ';\n'
    for nom, fichiers in COEUR:
        for f in fichiers:
            if not os.path.exists(f):
                print('  (absent, sauté) :', os.path.relpath(f, DONJON)); continue
            code += '\n/* ===== ' + os.path.relpath(f, DONJON) + ' ===== */\n' + lire(f) + '\n'
    p = lire(os.path.join(SRC, 'page.html'))
    p = p.replace('/*CSS*/', '\n'.join(lire(c) for c in CSS if os.path.exists(c)))
    import datetime
    try:
        from zoneinfo import ZoneInfo
        quand = datetime.datetime.now(ZoneInfo('Europe/Paris'))
    except Exception:
        quand = datetime.datetime.now()
    code = code.replace("'/*VERSION*/'", "'%d/%d à %d h %02d'" % (quand.day, quand.month, quand.hour, quand.minute))   # la version, lisible en bas de « Objets »
    p = p.replace('/*JEU*/', code.replace('</script', '<\\/script'))
    with open(os.path.join(SORTIE, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(p)
    for src, dst in [('donjon-sage.html', 'sage.html'), ('donjon-alchimiste.html', 'alchimiste.html')]:
        if os.path.exists(os.path.join(DONJON, src)):
            shutil.copyfile(os.path.join(DONJON, src), os.path.join(SORTIE, dst))


def tenue():
    # la petite page de la tenue de combat (jeu/src/descente.js la montre dans un cadre) : les héros animés, à l'allure des joueurs
    code = ''
    for f in [os.path.join(DONJON, 'anim', 'cuire.js'), os.path.join(DONJON, 'anim', 'heros', 'heros-anime.js'), os.path.join(SRC, 'allure.js')]:
        code += '\n/* ===== ' + os.path.relpath(f, DONJON) + ' ===== */\n' + lire(f) + '\n'
    p = lire(os.path.join(SRC, 'tenue.html')).replace('/*JEU*/', code.replace('</script', '<\\/script'))
    with open(os.path.join(SORTIE, 'tenue.html'), 'w', encoding='utf-8') as f:
        f.write(p)


def poids():
    tot = 0
    for racine, _, fichiers in os.walk(SORTIE):
        for f in fichiers:
            tot += os.path.getsize(os.path.join(racine, f))
    return tot


if __name__ == '__main__':
    os.makedirs(SORTIE, exist_ok=True)
    images(); scripts(); page(); tenue()
    print('sortie/index.html : %d Ko ; tout le dossier : %.1f Mo' % (os.path.getsize(os.path.join(SORTIE, 'index.html')) / 1024, poids() / 1e6))
