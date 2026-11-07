"""Planche-contact des jeux d'observation : test/observation/planche-observation.png
Usage : python3 build.py && python3 test/observation/planche.py"""
import os, sys, time, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from commun import *
from robots import *
from PIL import Image, ImageDraw, ImageFont

def police(t):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, t)
    return ImageFont.load_default()

def cadre_images(page):
    return page.evaluate("() => { const s = document.querySelectorAll('.mjo-d-cadre'); const a = s[0].getBoundingClientRect(), b = s[1].getBoundingClientRect(); return {x:Math.min(a.left,b.left), y:Math.min(a.top,b.top), width:Math.max(a.right,b.right)-Math.min(a.left,b.left), height:Math.max(a.bottom,b.bottom)-Math.min(a.top,b.top)}; }")

def trouver(page, n):
    for _ in range(n):
        e = etat(page)
        reste = [d for d in e['diffs'] if not d['ok']]
        if not reste: return
        d = reste[0]; page.mouse.click(d['ecran'][0]['x'], d['ecran'][0]['y']); page.wait_for_timeout(160)
    page.wait_for_timeout(450)

C = {}
random.seed(4)
with sync_playwright() as p:
    nav = p.chromium.launch()
    err = []
    ctx, page = nouvelle_page(nav, 800, 1280, err)
    # 1. les 10 décors, 3 différences entourées
    for th in ['labo', 'place', 'lisiere', 'taverne', 'marche', 'herboristerie', 'cave', 'baies', 'moulin', 'puits']:
        lancer(page, 'differences', 5, {}, {'theme': th})
        trouver(page, 3)
        f = f'{CAP}/pl-theme-{th}.png'; page.screenshot(path=f, clip=cadre_images(page)); C['th-' + th] = f
        page.evaluate("() => { const r = document.querySelector('.mjo-jeu'); }")
    # cueillette : cave + champignons lumineux, puis l'écran de victoire
    lancer(page, 'differences', 4, {}, {'theme': 'cave', 'ingredient': 'champignon'}, go=False)
    page.wait_for_timeout(1200)
    C['ingr-intro'] = f'{CAP}/pl-ingr-intro.png'; page.screenshot(path=C['ingr-intro'])
    page.click('.mj-go'); page.wait_for_timeout(500)
    C['ingr-jeu'] = f'{CAP}/pl-ingr-jeu.png'; page.screenshot(path=C['ingr-jeu'])
    robot_differences(page, 'parfait'); attendre_resultat(page); page.wait_for_timeout(500)
    C['ingr-fin'] = f'{CAP}/pl-ingr-fin.png'; page.screenshot(path=C['ingr-fin'])
    # 2. le double : juste après une bonne réponse (niveau 3), puis niveau 10 (8 symboles, couleurs par famille)
    lancer(page, 'double', 3)
    page.wait_for_timeout(500)
    e = etat(page); s = next(s for s in e['posCarte'] if s['id'] == e['commun'])
    page.mouse.click(s['x'], s['y']); page.wait_for_timeout(260)
    C['double-3'] = f'{CAP}/pl-double-3.png'; page.screenshot(path=C['double-3'])
    lancer(page, 'double', 10)
    page.wait_for_timeout(700)
    C['double-10'] = f'{CAP}/pl-double-10.png'; page.screenshot(path=C['double-10'])
    # 3. les insectes et les deux bocaux ; un « splat »
    lancer(page, 'insectes', 6)
    page.wait_for_timeout(1500)
    C['ins-800'] = f'{CAP}/pl-ins-800.png'; page.screenshot(path=C['ins-800'])
    splats = []
    for k in range(3):
        e = etat(page)
        bons = [b for b in e['insectes'] if b['bon']]
        cible = next((b for b in e['insectes'] if not b['bon'] and 80 < b['x'] < 720 and 260 < b['y'] < 950 and all(math.hypot(b['x'] - g['x'], b['y'] - g['y']) > 70 for g in bons)), None)
        if not cible: page.wait_for_timeout(400); continue
        page.mouse.click(cible['x'], cible['y']); page.wait_for_timeout(130)
        f = f'{CAP}/pl-splat-{k}.png'; page.screenshot(path=f, clip={'x': cible['x'] - 110, 'y': cible['y'] - 110, 'width': 220, 'height': 220}); splats.append(f)
        page.wait_for_timeout(700)
    C['splats'] = splats
    page.wait_for_timeout(1500)
    C['ins-taches'] = f'{CAP}/pl-ins-taches.png'; page.screenshot(path=C['ins-taches'])
    # un gentil touché par erreur : « Oh non ! »
    e = etat(page); g = next((b for b in e['insectes'] if b['bon']), None)
    if g:
        page.mouse.click(g['x'], g['y']); page.wait_for_timeout(200)
        C['ohnon'] = f'{CAP}/pl-ohnon.png'; page.screenshot(path=C['ohnon'], clip={'x': max(0, g['x'] - 140), 'y': max(0, g['y'] - 140), 'width': 280, 'height': 280})
    # 4. l'enchaînement insectes → 7 différences du labo
    lancer(page, 'insectes', 2, {}, {'ensuite': 'differences', 'mauvais': 2, 'ecran': 2})
    t0 = time.time()
    while time.time() - t0 < 30 and not page.query_selector('.mjo-transition'):
        e = etat(page)
        if e and e['jeu'] == 'insectes':
            bons = [b for b in e['insectes'] if b['bon']]
            for b in e['insectes']:
                if not b['bon'] and all(math.hypot(b['x'] - q['x'], b['y'] - q['y']) > 60 for q in bons): page.mouse.click(b['x'], b['y']); break
        page.wait_for_timeout(90)
    page.wait_for_timeout(250)
    C['trans-1'] = f'{CAP}/pl-trans-1.png'; page.screenshot(path=C['trans-1'])
    page.wait_for_timeout(1250)
    C['trans-2'] = f'{CAP}/pl-trans-2.png'; page.screenshot(path=C['trans-2'])
    page.wait_for_timeout(1800)
    C['trans-3'] = f'{CAP}/pl-trans-3.png'; page.screenshot(path=C['trans-3'])
    page.evaluate('window.__partie && window.__partie.arreter()')
    ctx.close()
    # 5. paysage et téléphone
    ctx, page = nouvelle_page(nav, 1280, 800, err)
    lancer(page, 'insectes', 4); page.wait_for_timeout(1500)
    C['ins-1280'] = f'{CAP}/pl-ins-1280.png'; page.screenshot(path=C['ins-1280'])
    lancer(page, 'differences', 4, {}, {'theme': 'marche'}); trouver(page, 2)
    C['diff-1280'] = f'{CAP}/pl-diff-1280.png'; page.screenshot(path=C['diff-1280'])
    ctx.close()
    ctx, page = nouvelle_page(nav, 390, 844, err)
    for jeu, extra in [('differences', {'theme': 'moulin'}), ('double', {}), ('insectes', {})]:
        lancer(page, jeu, 3, {}, extra); page.wait_for_timeout(1400)
        if jeu == 'differences': trouver(page, 2)
        C['tel-' + jeu] = f'{CAP}/pl-tel-{jeu}.png'; page.screenshot(path=C['tel-' + jeu])
    lancer(page, 'insectes', 3, {}, {}, go=False); page.wait_for_timeout(1500)
    C['tel-intro'] = f'{CAP}/pl-tel-intro.png'; page.screenshot(path=C['tel-intro'])
    ctx.close()
    nav.close()
    print('erreurs console :', err)

# ---------- Assemblage ----------
FOND = (19, 25, 50); OR = (255, 227, 163); BRUME = (166, 174, 216)
W = 2400
blocs = []
def titre_bloc(t, sous=''):
    im = Image.new('RGB', (W, 70 if sous else 56), FOND); d = ImageDraw.Draw(im)
    d.text((24, 12), t, fill=OR, font=police(30))
    if sous: d.text((24, 46), sous, fill=BRUME, font=police(17))
    return im
def rangee(fichiers, hauteur, legendes=None, marge=16):
    ims = [Image.open(f).convert('RGB') for f in fichiers]
    ims = [im.resize((max(1, int(im.width * hauteur / im.height)), hauteur)) for im in ims]
    lh = 30 if legendes else 0
    out = Image.new('RGB', (W, hauteur + lh + marge), FOND); d = ImageDraw.Draw(out)
    x = 24
    for k, im in enumerate(ims):
        if x + im.width > W - 10: break
        out.paste(im, (x, 0))
        if legendes: d.text((x + 4, hauteur + 4), legendes[k], fill=BRUME, font=police(18))
        x += im.width + marge
    return out
TH = ['labo', 'place', 'lisiere', 'taverne', 'marche', 'herboristerie', 'cave', 'baies', 'moulin', 'puits']
NOMS = {'labo': "L'étagère du labo", 'place': 'La place', 'lisiere': 'La lisière', 'taverne': 'La taverne', 'marche': "L'étal de potions", 'herboristerie': "Les bouquets d'Iris", 'cave': 'La cave aux champignons', 'baies': 'La forêt aux baies', 'moulin': 'Le moulin', 'puits': 'Le puits'}
blocs.append(titre_bloc('Les 7 différences — les 10 décors (niveau 5, 3 différences déjà entourées)', 'theme : labo · place · lisiere · taverne · marche · herboristerie · cave · baies · moulin · puits'))
blocs.append(rangee([C['th-' + t] for t in TH[:5]], 640, [t + ' · ' + NOMS[t] for t in TH[:5]]))
blocs.append(rangee([C['th-' + t] for t in TH[5:]], 640, [t + ' · ' + NOMS[t] for t in TH[5:]]))
blocs.append(titre_bloc('Cueillette rare : theme « cave », ingredient « champignon »', 'consigne et ligne « À cueillir », champignons lumineux dans la scène, écran de victoire « Tu as trouvé … ! »'))
blocs.append(rangee([C['ingr-intro'], C['ingr-jeu'], C['ingr-fin'], C['diff-1280']], 640, ['intro', 'en jeu (800×1280)', 'victoire', '1280×800 (étal)']))
blocs.append(titre_bloc('Le double — plan projectif (q = 5 : 6 symboles ; q = 7 : 8 symboles, 57 cartes)', 'juste après une bonne réponse (niveau 3) · niveau 10 : 8 symboles, couleurs par famille, tailles et rotations variées'))
blocs.append(rangee([C['double-3'], C['double-10'], C['tel-double']], 700, ['niveau 3 : symbole trouvé', 'niveau 10', 'téléphone 390×844']))
blocs.append(titre_bloc('Le grand ménage du labo — insectes, bocaux, « splat »', 'formes différentes, couleurs trompeuses (insectes teintés) · bocal rouge ☠ « Mauvais insectes », bocal vert ✔ « Bons insectes »'))
blocs.append(rangee([C['ins-800'], C['ins-taches'], C['ins-1280']], 700, ['800×1280, niveau 6', 'après trois « splat »', '1280×800']))
zoom = C['splats'] + ([C['ohnon']] if 'ohnon' in C else [])
blocs.append(rangee(zoom, 300, ['splat'] * len(C['splats']) + (['gentil touché : « Oh non ! »'] if 'ohnon' in C else [])))
blocs.append(titre_bloc('Enchaînement params.ensuite = « differences »', 'labo propre → voile magique → les 7 différences de l’étagère du labo, dans le même mini-jeu (fin appelée une seule fois)'))
blocs.append(rangee([C['trans-1'], C['trans-2'], C['trans-3']], 640, ['fin des insectes', 'transition', '7 différences du labo']))
blocs.append(titre_bloc('Téléphone 390×844'))
blocs.append(rangee([C['tel-differences'], C['tel-double'], C['tel-insectes'], C['tel-intro']], 700, ['différences (moulin)', 'double', 'insectes', 'consigne']))
H = sum(b.height for b in blocs) + 30
out = Image.new('RGB', (W, H), FOND); y = 10
for b in blocs: out.paste(b, (0, y)); y += b.height
dest = os.path.join(ICI, 'planche-observation.png')
out.save(dest, optimize=True)
print(dest, out.size)
