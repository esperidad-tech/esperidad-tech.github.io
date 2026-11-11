"""Les images de l'explication du labo (src/labo/86-intro.js) : de vraies vues du labo, prises dans dist/labo.html (la page toute seule).
Fabrique src/labo/12-intro-img.js (INTRO_IMG = {cuir, loupe, micro, ardoise}, en JPEG dans la page). À refaire si le labo change d'aspect,
puis reconstruire le jeu.
   BRUMEVAL_DIST=<dossier construit> python3 tools/labo-intro-images.py"""
import os, io, base64, json
from playwright.sync_api import sync_playwright
from PIL import Image
D = os.environ.get('BRUMEVAL_DIST', os.path.join(os.path.dirname(__file__), '..', 'dist'))
ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', 'src', 'labo', '12-intro-img.js')
L, H = 480, 300            # la taille d'une image (16/10), en pixels
imgs = {}
def prendre(pg, nom, zone=None):
    png = pg.screenshot(clip=zone) if zone else pg.screenshot()
    im = Image.open(io.BytesIO(png)).convert('RGB')
    w, h = im.size; r = L / H
    if w / h > r: nw = int(h * r); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w / r); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((L, H), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=62, optimize=True, progressive=True)
    imgs[nom] = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    print(nom, len(b.getvalue()) // 1024, 'Ko')
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 640})
    # (sur l'image de l'ardoise : jamais un vrai code — un enfant pourrait le lire et le dire à son équipier — mais trois « ? »)
    pg.add_init_script("window.LABO_CFG = {codes:{fil:{pour:\"pour l'équipe\", formes:['❓','❓','❓']}}};")
    pg.goto('file://' + os.path.abspath(os.path.join(D, 'labo.html'))); pg.wait_for_timeout(1200)
    pg.evaluate("() => { window.__labo.mimi.calme = true; var m = document.querySelector('.mimi'); if(m) m.style.display = 'none'; var r = document.querySelector('.barre-haut'); if(r) r.style.visibility = 'hidden'; }")
    clic = lambda sel: pg.click(sel, force=True)
    # 1. le carré de cuir, un échantillon choisi : la paillasse, de près
    clic('#ech-fil'); pg.wait_for_timeout(2300)
    q = pg.locator('#ech-fil').bounding_box()
    cx, cy = q['x'] + q['width'] / 2, q['y'] + q['height'] / 2
    prendre(pg, 'cuir', {'x': max(0, cx - 400), 'y': max(0, cy - 300), 'width': 800, 'height': 500})
    # 2. la loupe, le tiroir et son casier ouverts
    clic('#gLoupe'); pg.wait_for_timeout(1900)
    clic('#tir-g .facade'); pg.wait_for_timeout(1300); clic('#tir-g [data-casier="fils"]'); pg.wait_for_timeout(900)
    prendre(pg, 'loupe')
    clic('#bFermer'); pg.wait_for_timeout(1000)
    # 3. le microscope, au plus petit grossissement
    clic('#ech-fil'); pg.wait_for_timeout(300); clic('#gMicro'); pg.wait_for_timeout(1500)
    prendre(pg, 'micro')
    clic('#bFermer'); pg.wait_for_timeout(1000)
    # 4. le dossier bouclé : le code sur l'ardoise, en grand
    pg.evaluate("() => window.__labo.finir('fil')"); pg.wait_for_timeout(1500)
    clic('#gArdoise'); pg.wait_for_timeout(1800)
    prendre(pg, 'ardoise')
    b.close()
with open(SORTIE, 'w', encoding='utf-8') as f:
    f.write('/* Les images de l\'explication du labo (86-intro.js) : de vraies vues du labo, en JPEG.\n   Refaites par jeu/tools/labo-intro-images.py (ne pas modifier à la main). */\n')
    f.write('var INTRO_IMG = ' + json.dumps(imgs) + ';\n')
print('écrit :', SORTIE, os.path.getsize(SORTIE) // 1024, 'Ko')
