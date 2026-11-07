"""Planches contact de l'atelier v4 (à lancer après essai.py, essai2.py et jeu.py) :
  captures/planche-telephone.png  au téléphone (390x844) : tous les écrans demandés, dans l'ordre où l'enfant les voit
  captures/planche-tailles.png    les 5 tailles : la pièce, le carton, un gros plan, le grimoire, le chaudron"""
import os
from PIL import Image, ImageDraw, ImageFont
CAP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'captures')
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except Exception:
    F = ImageFont.load_default()
FOND = (12, 14, 30)

TELEPHONE = [
    ('jeu-390x844-1-atelier.png', 'Dans le vrai jeu (matin)'),
    ('n-390x844-02-matin.png', 'La pièce, meubles rangés'),
    ('g-390x844-profil.png', 'Contre le mur : de profil'),
    ('g-390x844-restyle.png', 'Toucher la déco : un autre style'),
    ('g-390x844-murs.png', 'Murs et plancher touchés'),
    ('g-390x844-devant-porte.png', 'Posés devant la porte'),
    ('n-390x844-04-cueillette.png', 'La cueillette devant la porte'),
    ('n-390x844-05-glisse-tiroir.png', 'Glissée dans un placard'),
    ('n-390x844-06-ou-ranger.png', '« Où le ranger ? »'),
    ('n-390x844-07-gros-plan.png', 'Gros plan (🎨, 🏷️)'),
    ('g-390x844-reserve.png', 'Le carton de rangement'),
    ('n-390x844-03-chaudron-rien.png', 'Chaudron : rien de possible'),
    ('n-390x844-10-grimoire.png', 'Le lutrin : le grimoire'),
    ('n-390x844-11-chaudron-choix.png', 'Chaudron : le choix'),
    ('n-390x844-12-preparation.png', 'La préparation'),
    ('n-390x844-13-potions.png', 'Une potion (son flacon)'),
    ('n-390x844-15-analyses.png', 'La paillasse d\'analyse'),
    ('n-390x844-14-flaque.png', 'Ratée : la flaque'),
    ('n-390x844-16-nuit.png', 'La nuit'),
    ('g-390x844-v1.png', 'Une ancienne sauvegarde'),
]
TAILLES = ['360x740', '390x844', '844x390', '800x1280', '1280x800']
PAR_TAILLE = [('02-matin', 'La pièce'), ('04-cueillette', 'Cueillette'), ('07-gros-plan', 'Gros plan'), ('10-grimoire', 'Grimoire'),
              ('11-chaudron-choix', 'Chaudron'), ('13-potions', 'Potions'), ('15-analyses', 'Paillasse')]

def vignette(chemin, titre, h):
    im = Image.open(chemin).convert('RGB')
    im = im.resize((int(im.width * h / im.height), h), Image.LANCZOS)
    c = Image.new('RGB', (im.width, h + 28), (19, 25, 50))
    c.paste(im, (0, 28))
    ImageDraw.Draw(c).text((6, 5), titre, fill=(255, 227, 163), font=F)
    return c

def grille(vigs, cols, nom):
    if not vigs: return
    w = max(v.width for v in vigs); h = max(v.height for v in vigs)
    lignes = (len(vigs) + cols - 1) // cols
    out = Image.new('RGB', (cols * (w + 10) + 10, lignes * (h + 10) + 10), FOND)
    for i, v in enumerate(vigs):
        out.paste(v, (10 + (i % cols) * (w + 10), 10 + (i // cols) * (h + 10)))
    out.save(os.path.join(CAP, nom), optimize=True)
    print(nom, out.size)

manque = [n for n, _ in TELEPHONE if not os.path.exists(os.path.join(CAP, n))]
if manque: print('captures manquantes :', manque)
grille([vignette(os.path.join(CAP, n), t, 600) for n, t in TELEPHONE if os.path.exists(os.path.join(CAP, n))], 6, 'planche-telephone.png')

lignes = []
for t in TAILLES:
    vs = [vignette(p, f'{t} · {titre}', 300) for nom, titre in PAR_TAILLE for p in [os.path.join(CAP, f'n-{t}-{nom}.png')] if os.path.exists(p)]
    if not vs: continue
    l = Image.new('RGB', (sum(v.width for v in vs) + 8 * (len(vs) - 1), max(v.height for v in vs)), FOND)
    x = 0
    for v in vs: l.paste(v, (x, 0)); x += v.width + 8
    lignes.append(l)
if lignes:
    out = Image.new('RGB', (max(l.width for l in lignes) + 20, sum(l.height + 12 for l in lignes) + 10), FOND)
    y = 10
    for l in lignes: out.paste(l, (10, y)); y += l.height + 12
    out.save(os.path.join(CAP, 'planche-tailles.png'), optimize=True)
    print('planche-tailles.png', out.size)
