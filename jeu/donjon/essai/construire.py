"""Prototype « La salle des rats » (donjon de Brumeval).

    python3 construire.py           -> refait les images (img/*.png, à 2x) puis salle-rats.html
    python3 construire.py --vite    -> garde les images déjà faites, refait seulement salle-rats.html

Étape 1 : Playwright dessine les SVG du jeu (dessins.js = copie de combat2.js avec des exports en plus ;
          le rat vient du bestiaire) et les photographie en PNG transparents.
Étape 2 : un seul fichier autonome salle-rats.html (images en base64, CSS et JS dedans)."""
import sys, os, base64, json
ICI = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ICI, 'img')
SRC = os.path.join(ICI, 'src')
BESTIAIRE = '/home/claude/brumeval/brumeval-sources/jeu/donjon/bestiaire'

W, Y, SOL = 960, 372, 340          # la scène : 960 de large, le décor s'arrête à la bande (372), le sol à 340
HEROS = ['sage', 'alchimiste', 'pisteur']
POTIONS = ['feu', 'fumigene', 'huile', 'colle', 'baume', 'coeur']
RAT_VB = '-14 128 568 280'         # le cadre du rat dans son dessin (540 x 430) : sans le vide au-dessus
RAT_W = 300                        # sa taille de photo (x2) : 300 x 148


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


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

        def photo(nom, html, w, h, apres=None):
            pg.evaluate("([h, w, hh]) => { var c = document.getElementById('c'); c.style.width = w + 'px'; c.style.height = hh + 'px'; c.innerHTML = h; }", [html, w, h])
            if apres:
                pg.evaluate(apres)
            pg.wait_for_timeout(250)
            f = os.path.join(IMG, nom + '.png')
            pg.screenshot(path=f, clip={'x': 0, 'y': 0, 'width': w, 'height': h}, omit_background=True)
            try:    # la même image, mieux compressée (sans aucune perte) : le décor passe de 1,3 Mo à 0,8 Mo
                from PIL import Image
                im = Image.open(f)
                if nom == 'decor':
                    im = im.convert('RGB')   # le décor remplit tout le cadre : pas besoin de transparence
                im.save(f, 'PNG', optimize=True)
            except ImportError:
                pass
            print('  ', nom, w, 'x', h, errs or '')
            errs.clear()

        # le décor : la crypte, sa lumière de lune, l'avant-plan et la vignette (tout est derrière les héros)
        photo('decor', pg.evaluate(f"""() => '<div style="position:relative;width:{W}px;height:{Y}px;overflow:hidden">' +
            COMBAT.decor({W}, {Y}, {SOL}) + COMBAT.lumiere({W}, {Y}, {SOL}) + COMBAT.avantPlan({W}, {Y}, {SOL}) + COMBAT.vignette({W}, {Y}) + '</div>'"""), W, Y)
        # les trois héros : 200 x 240, posés à (40, 40) dans une photo de 280 x 320 (leurs halos dépassent)
        for h in HEROS:
            photo('heros-' + h, pg.evaluate(f"""() => '<div style="position:absolute;left:40px;top:40px;width:200px;height:240px">' + COMBAT.{h}(COMBAT.DEFAUT.{h}) + '</div>'"""), 280, 320)
        # le rat : sans son ombre ni sa flaque (le jeu met une ombre sous lui), recadré
        rh = round(RAT_W * 280 / 568)
        photo('rat', pg.evaluate("() => BESTIAIRE.rat.dessin()"), RAT_W, rh,
              apres=f"""() => {{ var s = document.querySelector('#c svg'); s.setAttribute('viewBox', '{RAT_VB}');
                var g = s.querySelector(':scope > g'); for(var k = 0; k < 6; k++) g.removeChild(g.firstElementChild); }}""")
        # les recettes du sac
        for t in POTIONS:
            photo('potion-' + t, pg.evaluate(f"() => COMBAT.potion('{t}')"), 72, 99)
        b.close()


def assembler():
    imgs = {}
    for f in sorted(os.listdir(IMG)):
        if f.endswith('.png'):
            with open(os.path.join(IMG, f), 'rb') as fh:
                imgs[f[:-4]] = 'data:image/png;base64,' + base64.b64encode(fh.read()).decode()
    page = lire(os.path.join(SRC, 'page.html'))
    page = page.replace('/*CSS*/', lire(os.path.join(SRC, 'jeu.css')))
    page = page.replace('/*IMAGES*/', 'window.IMAGES = ' + json.dumps(imgs) + ';')
    page = page.replace('/*JEU*/', lire(os.path.join(SRC, 'jeu.js')))
    sortie = os.path.join(ICI, 'salle-rats.html')
    with open(sortie, 'w', encoding='utf-8') as f:
        f.write(page)
    print('salle-rats.html :', round(os.path.getsize(sortie) / 1024), 'Ko')
    for k, v in imgs.items():
        print('  ', k, round(len(v) * 3 / 4 / 1024), 'Ko')


if __name__ == '__main__':
    if '--vite' not in sys.argv or not os.path.exists(os.path.join(IMG, 'decor.png')):
        print('Images :')
        images()
    if os.path.exists(os.path.join(SRC, 'page.html')):
        assembler()
