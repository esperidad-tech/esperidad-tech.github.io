"""Prototype « La salle des rats » (donjon de Brumeval) — version 2 (animée, sonore).

    python3 construire.py             -> refait les images (img/*.png, à 2x) puis salle-rats.html
    python3 construire.py --vite      -> garde les images déjà faites, refait seulement salle-rats.html
    python3 construire.py --sans-modules -> sans aucun module : les acteurs en images fixes (comme avant)
Les deux modules d'animation (pièces articulées) sont branchés par défaut : des copies rangées dans modules/
(modules/rat-anime.js et modules/heros-anime.js).

Étape 1 : Playwright dessine les SVG du jeu (dessins.js = copie de combat2.js avec des exports en plus ;
          le rat vient du bestiaire) et les photographie en PNG transparents ; puis les textures (fumée, brume, flamme).
Étape 2 : un seul fichier autonome salle-rats.html (images en base64, CSS et JS dedans).
La v1 est gardée dans salle-rats-v1.html (et ses sources dans v1/)."""
import sys, os, base64, json
ICI = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ICI, 'img')
SRC = os.path.join(ICI, 'src')
BESTIAIRE = '/home/claude/brumeval/brumeval-sources/jeu/donjon/bestiaire'
ANIM = os.path.join(os.path.dirname(ICI), 'anim')
# les modules d'animation (livrés à part) : ils remplacent les images fixes des acteurs quand on les branche
# cuire.js (copie de jeu/donjon/anim/cuire.js) : la « cuisson » des acteurs en images, pour la fluidité (jeu/donjon/RAPIDITE.md)
MODULES = {'cuire': os.path.join(ICI, 'modules', 'cuire.js'), 'rat': os.path.join(ICI, 'modules', 'rat-anime.js'), 'heros': os.path.join(ICI, 'modules', 'heros-anime.js')}
JS = ['son.js', 'effets.js', 'acteurs.js', 'jeu.js']   # dans cet ordre

W, Y, SOL = 960, 372, 340          # la scène : 960 de large, le décor s'arrête à la bande (372), le sol à 340
HEROS = ['sage', 'alchimiste', 'pisteur']
POTIONS = ['feu', 'fumigene', 'huile', 'colle', 'baume', 'coeur']
RAT_VB = '-14 128 568 280'         # le cadre du rat dans son dessin (540 x 430) : sans le vide au-dessus
RAT_W = 300                        # sa taille de photo (x2) : 300 x 148
# les yeux du rat : rouges dans le dessin du bestiaire ; jaunes au début du combat (règle du 9 novembre)
YEUX_JAUNES = {'#ff4a2a': '#ffc81e', '#7a0a14': '#8a5a00', '#ffb0a0': '#fff4b0', '#ff2a2a': '#ffd21e'}


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def fumee(seed, base, ombre, clair, op=1, dens=1.15):
    """une bouffée de fumée en volutes : un disque flou déformé par un bruit, avec des creux d'ombre et un bord clair"""
    return f'''<svg viewBox="0 0 200 200" width="200" height="200" style="display:block">
<defs>
 <radialGradient id="g{seed}"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".5" stop-color="#fff" stop-opacity=".92"/><stop offset=".8" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <filter id="f{seed}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency=".021" numOctaves="4" seed="{seed}" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="62" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="2.2" result="b0"/>
  <feComponentTransfer in="b0" result="b"><feFuncA type="linear" slope="{dens}"/></feComponentTransfer>
  <feFlood flood-color="{base}" result="c"/><feComposite in="c" in2="b" operator="in" result="fond"/>
  <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="{seed + 7}" result="t2"/>
  <feColorMatrix in="t2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -1.05" result="m"/>
  <feFlood flood-color="{ombre}" result="oc"/><feComposite in="oc" in2="m" operator="in" result="o1"/><feComposite in="o1" in2="b" operator="in" result="creux"/>
  <feOffset in="b" dx="-5" dy="-7" result="dec"/><feComposite in="b" in2="dec" operator="out" result="bord"/>
  <feFlood flood-color="{clair}" result="cc"/><feComposite in="cc" in2="bord" operator="in" result="lum"/><feGaussianBlur in="lum" stdDeviation="3" result="lum2"/>
  <feMerge><feMergeNode in="fond"/><feMergeNode in="creux"/><feMergeNode in="lum2"/></feMerge>
 </filter>
</defs>
<circle cx="100" cy="104" r="66" fill="url(#g{seed})" filter="url(#f{seed})" opacity="{op}"/>
</svg>'''


FLAMME = '''<svg viewBox="0 0 60 96" width="60" height="96" style="display:block;overflow:visible">
<defs>
 <radialGradient id="fl1" cx=".5" cy=".72" r=".62"><stop offset="0" stop-color="#fffbe0"/><stop offset=".28" stop-color="#ffe070"/><stop offset=".58" stop-color="#ff9a1a"/><stop offset=".85" stop-color="#ff4a10" stop-opacity=".85"/><stop offset="1" stop-color="#c81e08" stop-opacity="0"/></radialGradient>
 <radialGradient id="fl2" cx=".5" cy=".7" r=".5"><stop offset="0" stop-color="#ffb030" stop-opacity=".7"/><stop offset="1" stop-color="#ff5010" stop-opacity="0"/></radialGradient>
 <filter id="flb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
 <filter id="flt" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs>
<ellipse cx="30" cy="66" rx="30" ry="34" fill="url(#fl2)" filter="url(#flb)"/>
<path d="M30 4 C 36 22 52 34 52 58 C 52 78 42 92 30 92 C 18 92 8 78 8 60 C 8 44 20 38 22 22 C 27 30 28 36 30 40 C 33 28 32 16 30 4 Z" fill="url(#fl1)" filter="url(#flt)"/>
<path d="M30 46 C 34 56 40 62 40 72 C 40 82 35 88 30 88 C 25 88 20 82 20 74 C 20 66 26 62 30 46 Z" fill="#fffbe8" opacity=".85" filter="url(#flt)"/>
</svg>'''


def images():
    from playwright.sync_api import sync_playwright
    os.makedirs(IMG, exist_ok=True)
    js = [lire(os.path.join(ICI, 'dessins.js')), lire(os.path.join(BESTIAIRE, 'base.js')),
          lire(os.path.join(BESTIAIRE, 'betes', '01-rat.js'))]
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1000, 'height': 700}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.set_content('<!doctype html><html><head><style>html,body{margin:0;background:transparent}'
                       '.mq-abs{position:absolute}#c{position:absolute;left:0;top:0}</style></head><body><div id="c"></div></body></html>')
        for s in js:
            pg.add_script_tag(content=s)

        def photo(nom, html, w, h, apres=None, opaque=False):
            if w > 1000:
                pg.set_viewport_size({'width': w, 'height': h})
            pg.evaluate("([h, w, hh]) => { var c = document.getElementById('c'); c.style.width = w + 'px'; c.style.height = hh + 'px'; c.innerHTML = h; }", [html, w, h])
            if apres:
                pg.evaluate(apres)
            pg.wait_for_timeout(250)
            f = os.path.join(IMG, nom + '.png')
            pg.screenshot(path=f, clip={'x': 0, 'y': 0, 'width': w, 'height': h}, omit_background=True)
            try:    # la même image, mieux compressée (sans aucune perte)
                from PIL import Image
                im = Image.open(f)
                if opaque:
                    im = im.convert('RGB')
                im.save(f, 'PNG', optimize=True)
            except ImportError:
                pass
            print('  ', nom, w, 'x', h, errs or '')
            errs.clear()

        # le décor : la crypte, sa lumière de lune, l'avant-plan et la vignette (tout est derrière les héros)
        photo('decor', pg.evaluate(f"""() => '<div style="position:relative;width:{W}px;height:{Y}px;overflow:hidden">' +
            COMBAT.decor({W}, {Y}, {SOL}) + COMBAT.lumiere({W}, {Y}, {SOL}) + COMBAT.avantPlan({W}, {Y}, {SOL}) + COMBAT.vignette({W}, {Y}) + '</div>'"""), W, Y, opaque=True)
        # les trois héros : 200 x 240, posés à (40, 40) dans une photo de 280 x 320 (leurs halos dépassent)
        for h in HEROS:
            photo('heros-' + h, pg.evaluate(f"""() => '<div style="position:absolute;left:40px;top:40px;width:200px;height:240px">' + COMBAT.{h}(COMBAT.DEFAUT.{h}) + '</div>'"""), 280, 320)
        # le rat : sans son ombre ni sa flaque (le jeu met une ombre sous lui), recadré ; yeux rouges et yeux jaunes
        rh = round(RAT_W * 280 / 568)
        rat = pg.evaluate("() => BESTIAIRE.rat.dessin()")
        jaune = rat
        for a, c in YEUX_JAUNES.items():
            jaune = jaune.replace(a, c)
        coupe = f"""() => {{ var s = document.querySelector('#c svg'); s.setAttribute('viewBox', '{RAT_VB}');
                var g = s.querySelector(':scope > g'); for(var k = 0; k < 6; k++) g.removeChild(g.firstElementChild); }}"""
        photo('rat-rouge', rat, RAT_W, rh, apres=coupe)
        photo('rat-jaune', jaune, RAT_W, rh, apres=coupe)
        # les recettes du sac
        for t in POTIONS:
            photo('potion-' + t, pg.evaluate(f"() => COMBAT.potion('{t}')"), 72, 99)
        # les textures : fumée du fumigène (gris-bleu), brume noire du critique, flamme
        for k, seed in enumerate([3, 11, 23]):
            photo('fumee-' + 'abc'[k], fumee(seed, '#aab4d2', '#5a6488', '#eef2ff'), 200, 200)
        for k, seed in enumerate([5, 17]):
            photo('brume-' + 'ab'[k], fumee(seed, '#30243e', '#060309', '#b4a2cc', dens=1.9), 200, 200)
        photo('flamme', FLAMME, 60, 96)
        # l'image de choc du critique (deux images très brèves, façon manga) : des rayons depuis le centre, en 1920 x 1080
        choc = '<div style="width:1920px;height:1080px;background:{f};background-image:radial-gradient(circle at 960px 540px,{c} 0,{c} {r1}px,rgba({rgb},0) {r2}px),repeating-conic-gradient(from {d}deg at 960px 540px,{c} 0deg {e}deg,rgba({rgb},0) {e}deg 11deg)"></div>'
        photo('choc-a', choc.format(f='#05020a', c='#ffffff', rgb='255,255,255', r1=34, r2=90, d=0, e=2.2), 1920, 1080, opaque=True)
        photo('choc-b', choc.format(f='#fffbea', c='#05020a', rgb='5,2,10', r1=26, r2=70, d=5, e=1.6), 1920, 1080, opaque=True)
        b.close()


def assembler(actifs):
    imgs = {}
    for f in sorted(os.listdir(IMG)):
        if f.endswith('.png') and f != 'rat.png':
            with open(os.path.join(IMG, f), 'rb') as fh:
                imgs[f[:-4]] = 'data:image/png;base64,' + base64.b64encode(fh.read()).decode()
    code = ''
    for nom in actifs:
            m = MODULES[nom]
            if os.path.exists(m):
                code += '\n/* ===== module : ' + os.path.basename(m) + ' ===== */\n' + lire(m) + '\n'
                print('module branché :', m)
            else:
                print('MODULE ABSENT :', m)
    # le moteur de l'atelier des sons (sons/) : les bruitages et les musiques choisis par Romain, avec leurs niveaux
    if '--sans-sons' not in sys.argv:
        niv = os.path.join(ICI, 'sons', 'niveaux.json')
        code += '\n/* ===== les niveaux des sons (sons/niveaux.json) ===== */\nwindow.NIVEAUX = ' + (json.dumps({k: round(v, 3) for k, v in sorted(json.load(open(niv)).items())}, separators=(',', ':')) if os.path.exists(niv) else '{}') + ';\n'
        for f in ['moteur.js', 'bruitages.js', 'musiques.js']:
            code += '\n/* ===== sons/' + f + ' ===== */\n' + lire(os.path.join(ICI, 'sons', f)) + '\n'
        print('sons de l\'atelier branchés')
    for f in JS:
        code += '\n/* ===== ' + f + ' ===== */\n' + lire(os.path.join(SRC, f)) + '\n'
    page = lire(os.path.join(SRC, 'page.html'))
    page = page.replace('/*CSS*/', lire(os.path.join(SRC, 'jeu.css')))
    page = page.replace('/*IMAGES*/', 'window.IMAGES = ' + json.dumps(imgs) + ';')
    page = page.replace('/*JEU*/', code.replace('</script', '<\\/script'))
    sortie = os.path.join(ICI, 'salle-rats.html')
    with open(sortie, 'w', encoding='utf-8') as f:
        f.write(page)
    print('salle-rats.html :', round(os.path.getsize(sortie) / 1024), 'Ko')


if __name__ == '__main__':
    if '--vite' not in sys.argv or not os.path.exists(os.path.join(IMG, 'flamme.png')):
        print('Images :')
        images()
    if os.path.exists(os.path.join(SRC, 'page.html')):
        actifs = [] if '--sans-modules' in sys.argv else (['rat', 'heros'] if '--sans-cuisson' in sys.argv else ['cuire', 'rat', 'heros'])
        assembler(actifs)
