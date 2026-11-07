"""Planche du mini-jeu « Le chaudron » : louche (perspective), zones de couleur, frise, bûches,
réussite, explosion, feu éteint, et l'atelier qui le lance."""
import os
from PIL import Image, ImageDraw, ImageFont
ICI = os.path.dirname(os.path.abspath(__file__))
CAP = os.path.join(ICI, 'captures')
CAPA = os.path.join(ICI, '..', 'atelier', 'captures')
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    FT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 21)
except Exception:
    F = FT = ImageFont.load_default()

def vignette(chemin, titre, h, crop=None):
    im = Image.open(chemin).convert('RGB')
    if crop: im = im.crop(crop)
    im = im.resize((int(im.width * h / im.height), h), Image.LANCZOS)
    c = Image.new('RGB', (im.width, h + 28), (19, 25, 50))
    c.paste(im, (0, 28))
    ImageDraw.Draw(c).text((6, 5), titre, fill=(255, 227, 163), font=F)
    return c

def ligne(titre, items, h):
    ims = [vignette(*it, h) if len(it) == 2 else vignette(it[0], it[1], h, it[2]) for it in items if os.path.exists(it[0])]
    w = sum(i.width for i in ims) + 10 * (len(ims) - 1)
    l = Image.new('RGB', (w, h + 28 + 34), (12, 14, 30))
    ImageDraw.Draw(l).text((2, 4), titre, fill=(143, 243, 255), font=FT)
    x = 0
    for i in ims: l.paste(i, (x, 34)); x += i.width + 10
    return l

T = '800x1280'
SC = (0, 330, 800, 1280)       # la scène du chaudron (sans l'en-tête)
c = lambda n: os.path.join(CAP, f'{T}-{n}.png')
a = lambda n: os.path.join(CAPA, f'1280x800-{n}.png')
lignes = [
  ligne('La louche en vraie perspective (calculée à chaque image)', [(c('louche-devant'), 'Devant : plus grande', SC), (c('louche-trois-quarts'), 'Trois-quarts', SC), (c('louche-cote'), 'Côté : de profil', SC), (c('louche-derriere'), 'Derrière : petite, cachée par le bord', SC)], 330),
  ligne('Les zones de couleur (jauge à droite, curseur blanc, cible encadrée en or)', [(c('zone-' + z), z, SC) for z in ('violet', 'bleu', 'vert', 'arc-en-ciel', 'jaune', 'rouge', 'bouillant')], 300),
  ligne('Frise, bûches et fins', [(c('frise'), 'Frise : les fenêtres défilent'), (c('buches-2'), '2 bûches : le + clignote'), (c('buches-6'), '6 bûches : enlever (−)'), (c('reussite'), 'Réussite : la fiole se remplit'), (c('boum'), 'Boum ! Tout a cramé'), (c('eteint'), 'Le feu s\'est éteint')], 420),
  ligne('L\'atelier lance le chaudron (1280 × 800)', [(a('7b-grimoire-choix'), 'Grimoire : recette + zone'), (a('8a-consigne'), 'Consigne et démo'), (a('8-preparation'), 'Préparation (thermomètre : chiffres)'), (a('9-reussie'), 'Réussie'), (a('10-deborde'), 'Ratée : explosion'), (a('12-flaque'), 'Retour : flaque, potion rangée')], 250),
]
W = max(l.width for l in lignes) + 20
out = Image.new('RGB', (W, sum(l.height + 16 for l in lignes) + 10), (12, 14, 30))
y = 10
for l in lignes:
    out.paste(l, (10, y)); y += l.height + 16
out.save(os.path.join(CAP, 'planche-chaudron.png'), optimize=True)
print(out.size)
