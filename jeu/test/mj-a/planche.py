"""Assemble les captures du banc en planches : planche-finale.png (en cours, téléphone + tablette),
planche-resultats.png (intro / gagné / perdu à la tablette), planche-paysage.png (1280x800)."""
import os
from PIL import Image, ImageDraw
ICI = os.path.dirname(os.path.abspath(__file__)); CAP = os.path.join(ICI, 'captures')
JEUX = ['traces','poursuite','cachette','tir','rythme','bulles','melange','temperature','loupe']
def charge(n, h):
    p = os.path.join(CAP, n)
    if not os.path.exists(p): return Image.new('RGB', (int(h * .5), h), (40, 40, 60))
    i = Image.open(p).convert('RGB'); return i.resize((int(i.width * h / i.height), h))
def rangee(noms, h):
    ims = [charge(n, h) for n in noms]; W = sum(i.width for i in ims) + 8 * (len(ims) - 1)
    o = Image.new('RGB', (W, h), (20, 22, 40)); x = 0
    for i in ims: o.paste(i, (x, 0)); x += i.width + 8
    return o
def empile(rs, nom):
    W = max(r.width for r in rs); H = sum(r.height for r in rs) + 8 * (len(rs) - 1)
    o = Image.new('RGB', (W, H), (20, 22, 40)); y = 0
    for r in rs: o.paste(r, (0, y)); y += r.height + 8
    o.save(os.path.join(CAP, nom)); print(nom, o.size)
empile([rangee([f'{j}-390-2jeu.png' for j in JEUX], 640), rangee([f'{j}-800-2jeu.png' for j in JEUX], 640)], 'planche-finale.png')
empile([rangee([f'{j}-800-1intro.png' for j in JEUX], 520), rangee([f'{j}-800-3resultat.png' for j in JEUX], 520), rangee([f'{j}-800-4perdu.png' for j in JEUX], 520)], 'planche-resultats.png')
empile([rangee([f'{j}-1280-jeu.png' for j in JEUX[k:k+3]], 400) for k in (0, 3, 6)], 'planche-paysage.png')
