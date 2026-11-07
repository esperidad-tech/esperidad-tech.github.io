"""Planche contact du Sage : chaque code avec ses dégâts, le clavier, les variantes des runes,
les coups qui s'épuisent, le téléphone et le paysage.  →  test/sage-codes/planche-sage-codes.png"""
import random
from PIL import Image, ImageDraw, ImageFont
from outils import *
from essai import resoudre_optimal, runes, toucher, glisser

random.seed(3)
SYSTEMES = ['pigpen', 'cesar', 'symboles', 'nombres', 'grille', 'miroir', 'morse', 'substitution', 'danseurs']
NOMS = {'pigpen': 'Grilles des fondateurs', 'cesar': 'Roue de César', 'symboles': 'Symboles du sorcier', 'nombres': 'Code des nombres',
        'grille': 'Carré des coordonnées', 'miroir': 'Miroir / reflet', 'morse': 'Points et traits', 'substitution': 'Lettres échangées', 'danseurs': 'Petits danseurs'}
vignettes = []   # (titre, chemin, groupe)

def cadre(pg, nom):
    chemin = f'{CAPT}/pl-{nom}.png'
    pg.locator('.mj').first.screenshot(path=chemin)
    return chemin

def partiel(pg, frac=.45):
    a = alpha(pg)
    cs = [c for c in a['cases'] if not c['donne']]
    random.shuffle(cs)
    for c in cs[:int(len(cs) * frac)]: taper(pg, c['i'], c['l'])
    return a

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = page(b, 'tab')
    niveaux = {'pigpen': 6, 'cesar': 7, 'symboles': 6, 'nombres': 8, 'grille': 7, 'miroir': 8, 'morse': 6, 'substitution': 5, 'danseurs': 6}
    for s in SYSTEMES:
        lancer(pg, 'alphabet', niveaux[s], params={'systeme': s})
        a = partiel(pg)
        vignettes.append((f"{NOMS[s]} · niv. {niveaux[s]}", cadre(pg, 'a-' + s), 'alpha'))
        quitter(pg)
    # validation fausse : cases rouges, un cœur perdu
    lancer(pg, 'alphabet', 5, params={'systeme': 'symboles', 'message': 'LE CORBEAU VOLE LA NUIT'})
    remplir(pg, faux=2); pg.click('.mjs-valider'); pg.wait_for_timeout(500)
    vignettes.append(('Validation fausse : 2 lettres rouges, −1 ❤️', cadre(pg, 'a-faux'), 'alpha'))
    quitter(pg)
    # démo (écran de consigne)
    lancer(pg, 'alphabet', 3, params={'systeme': 'pigpen'}, go=False); pg.wait_for_timeout(2300)
    vignettes.append(('Consigne + démo (dans le désordre)', cadre(pg, 'a-intro'), 'alpha'))
    quitter(pg)
    # runes : les 4 images
    restaurer(pg)
    for niv, im in [(5, 'runes'), (8, 'carte'), (4, 'blason'), (3, 'horloge')]:
        lancer(pg, 'runes', niv, params={'image': im})
        e = runes(pg)
        for t in e['tuiles'][:3]:
            for _ in range((4 - t['rot']) % 4): toucher(pg, t['pos'], e['k'])
        pg.wait_for_timeout(400)
        vignettes.append((f"{im} · niv. {niv} · {e['k']}×{e['k']}", cadre(pg, 'r-' + im), 'runes'))
        quitter(pg); quitter(pg)
    # image complète (lueur)
    lancer(pg, 'runes', 4, params={'image': 'carte'})
    resoudre_optimal(pg); pg.wait_for_timeout(700)
    vignettes.append(('Carte reconstituée : lueur', cadre(pg, 'r-complet'), 'runes'))
    pg.wait_for_selector('.mj-resultat'); quitter(pg)
    # les coups s'épuisent
    lancer(pg, 'runes', 6, params={'image': 'horloge'}, mods={'pouce': 1})
    e = runes(pg); k = e['k']
    while runes(pg) and runes(pg)['coups'] > 3: toucher(pg, random.randrange(k * k), k)
    pg.wait_for_timeout(300)
    vignettes.append(('Plus que 3 coups (alerte) + coup de pouce', cadre(pg, 'r-alerte'), 'runes'))
    while runes(pg) and runes(pg)['coups'] > 0: toucher(pg, random.randrange(k * k), k)
    pg.wait_for_timeout(500)
    vignettes.append(('Plus de coups : la pierre s\'éteint', cadre(pg, 'r-eteint'), 'runes'))
    pg.wait_for_selector('.mj-resultat'); pg.wait_for_timeout(400)
    vignettes.append(('« Tant pis… »', cadre(pg, 'r-tantpis'), 'runes'))
    quitter(pg)
    lancer(pg, 'runes', 5, go=False); pg.wait_for_timeout(3200)
    vignettes.append(('Consigne + démo des runes', cadre(pg, 'r-intro'), 'runes'))
    quitter(pg)
    pg.close()
    # téléphone et paysage
    pg = page(b, 'tel')
    lancer(pg, 'alphabet', 5, params={'systeme': 'cesar'}); partiel(pg, .3)
    vignettes.append(('Téléphone 390×844 : roue de César', cadre(pg, 't-cesar'), 'autre'))
    quitter(pg)
    lancer(pg, 'alphabet', 6, params={'systeme': 'danseurs'}); partiel(pg, .3)
    vignettes.append(('Téléphone : petits danseurs', cadre(pg, 't-danse'), 'autre'))
    quitter(pg)
    restaurer(pg)
    lancer(pg, 'runes', 9, params={'image': 'carte'})
    vignettes.append(('Téléphone : carte 5×5', cadre(pg, 't-carte'), 'autre'))
    quitter(pg)
    pg.close()
    pg = page(b, 'pay')
    lancer(pg, 'alphabet', 6, params={'systeme': 'grille'}); partiel(pg, .4)
    vignettes.append(('Paysage 1280×800 : carré des coordonnées', cadre(pg, 'p-grille'), 'large'))
    quitter(pg)
    restaurer(pg)
    lancer(pg, 'runes', 7, params={'image': 'blason'})
    vignettes.append(('Paysage : blason 4×4', cadre(pg, 'p-blason'), 'large'))
    quitter(pg)
    pg.close()
    b.close()

# ---------- assemblage ----------
try:
    police = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    grande = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
except Exception:
    police = grande = ImageFont.load_default()
H = 640   # hauteur d'une vignette portrait
def vignette(chemin, h):
    im = Image.open(chemin).convert('RGB')
    return im.resize((int(im.width * h / im.height), h))
lignes = []
def rangee(items, h):
    ims = [(t, vignette(c, h)) for t, c, g in items]
    return ims
groupes = {
    'Alphabet secret : les 9 codes, parchemin abîmé (niveaux 5 à 8, tablette 800×1280)': [v for v in vignettes if v[2] == 'alpha'],
    'Assembler les runes : 4 images, lueur, coups épuisés': [v for v in vignettes if v[2] == 'runes'],
    'Téléphone 390×844 et paysage 1280×800': [v for v in vignettes if v[2] in ('autre', 'large')],
}
L = 2400; marge = 16
blocs = []
for titre, items in groupes.items():
    ims = rangee(items, H)
    # répartir en lignes de largeur L
    ligne, lg, rows = [], 0, []
    for t, im in ims:
        if ligne and lg + im.width + marge > L: rows.append(ligne); ligne, lg = [], 0
        ligne.append((t, im)); lg += im.width + marge
    if ligne: rows.append(ligne)
    blocs.append((titre, rows))
haut = sum(60 + len(rows) * (H + 58) for _, rows in blocs) + 20
planche = Image.new('RGB', (L, haut), (12, 15, 34))
d = ImageDraw.Draw(planche)
y = 10
for titre, rows in blocs:
    d.text((marge, y + 12), titre, fill=(255, 227, 163), font=grande); y += 60
    for row in rows:
        x = marge
        for t, im in row:
            planche.paste(im, (x, y))
            mots, lignes_t, cur = t.split(' '), [], ''
            for m in mots:
                essai_t = (cur + ' ' + m).strip()
                if d.textlength(essai_t, font=police) > im.width - 8 and cur: lignes_t.append(cur); cur = m
                else: cur = essai_t
            lignes_t.append(cur)
            for j, lt in enumerate(lignes_t[:2]): d.text((x + 4, y + H + 6 + j * 22), lt, fill=(220, 225, 245), font=police)
            x += im.width + marge
        y += H + 58
sortie = os.path.join(ICI, 'planche-sage-codes.png')
planche.save(sortie, optimize=True)
print(sortie, planche.size)
