"""Planche contact du mini-jeu « Le bon mélange » à partir des captures de essai.py.
Usage : python3 test/melange/planche.py  →  test/melange/planche-melange.png"""
import os
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
CAP = os.path.join(ICI, 'captures')
SORTIE = os.path.join(ICI, 'planche-melange.png')

RANGS = [
    [('800x1280-1-ambiance', 'L\'ambiance du labo'), ('1280x800-2-etagere', 'L\'étagère des ingrédients'),
     ('800x1280-3b-vol', 'Mélange en cours + compteurs'), ('800x1280-4-simplifie', 'Trop d\'ingrédients : ça tremble')],
    [('800x1280-4b-divise', 'Simplifier : ÷ 2'), ('800x1280-4c-recommence', 'Recommence avec moins'),
     ('800x1280-5-beurk', 'Beurk ! (un cœur de moins)'), ('800x1280-6-victoire', 'Gagné : la fiole se remplit')],
    [('390x844-3-melange', 'Téléphone 390×844'), ('390x844-5-beurk', 'Téléphone : Beurk'), ('1280x800-4-simplifie', 'Paysage 1280×800'),
     ('800x1280-7-aides', 'Avec aides : barre + indice'), ('800x1280-0-consigne', 'Consigne et démo')],
]
H = 620          # hauteur d'une vignette
MARGE, TITRE = 22, 44
FOND, ENCRE = (19, 25, 50), (255, 227, 163)

def police(t):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, t)
    return ImageFont.load_default()

def main():
    f = police(24)
    rangs = []
    for rang in RANGS:
        vign = []
        for nom, titre in rang:
            chemin = os.path.join(CAP, nom + '.png')
            if not os.path.exists(chemin): continue
            im = Image.open(chemin).convert('RGB')
            # on retire la barre de la salle au-dessus du cadre du mini-jeu (captures pleine page)
            if im.height > 700 and 'etagere' not in nom:
                im = im.crop((0, 56, im.width, im.height))
            w = round(im.width * H / im.height)
            vign.append((im.resize((w, H), Image.LANCZOS), titre))
        rangs.append(vign)
    largeur = max(sum(v[0].width for v in r) + MARGE * (len(r) + 1) for r in rangs)
    hauteur = len(rangs) * (H + TITRE + MARGE) + MARGE + 60
    pl = Image.new('RGB', (largeur, hauteur), FOND)
    d = ImageDraw.Draw(pl)
    d.text((MARGE, 18), 'Le bon mélange — nouvelle version (Alchimiste)', fill=ENCRE, font=police(30))
    y = 60 + MARGE
    for r in rangs:
        x = MARGE
        for im, titre in r:
            d.text((x, y), titre, fill=ENCRE, font=f)
            pl.paste(im, (x, y + TITRE))
            d.rectangle((x - 1, y + TITRE - 1, x + im.width, y + TITRE + H), outline=(59, 70, 121), width=2)
            x += im.width + MARGE
        y += H + TITRE + MARGE
    pl.save(SORTIE, optimize=True)
    print(SORTIE, pl.size)

if __name__ == '__main__':
    main()
