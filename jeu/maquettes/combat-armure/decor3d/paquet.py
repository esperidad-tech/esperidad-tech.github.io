# Range les images rendues dans un seul fichier pour le jeu : ../src/decor.js (window.DECOR).
# python3 paquet.py <dossier des rendus> <decor.js>
# Le fond est un JPEG ; les lanternes et les rochers sont sur une planche JPEG (les couleurs) + un PNG (les découpes) ;
# les deux portes ouvertes sont deux petits JPEG. (D'après le combat du Pisteur, decor3d/paquet.py.)
import os, sys, json, base64, io
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import numpy as np
from PIL import Image, ImageFilter
import salle as S

D = sys.argv[1].rstrip('/') + '/'; SORTIE = sys.argv[2]
info = json.load(open(D + 'info.json')); k = info['k']

def b64(im, fmt, **kw):
    b = io.BytesIO(); im.save(b, fmt, **kw); return 'data:image/%s;base64,' % ('jpeg' if fmt == 'JPEG' else 'png') + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())

def deborder(im):
    """étale la couleur au-delà du bord de la découpe (sinon le JPEG laisse un liseré sombre)"""
    a = np.asarray(im).astype(np.float32) / 255; al = a[..., 3:4]; rgb = a[..., :3] * al; out = a[..., :3].copy(); poids = al.copy()
    for r in (1.5, 3, 6, 12):
        fb = np.dstack([np.asarray(Image.fromarray((rgb[..., i] * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255 for i in range(3)])
        fa = (np.asarray(Image.fromarray((al[..., 0] * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255)[..., None]
        est = fb / np.maximum(fa, 1e-3); manque = (poids < 0.99) & (fa > 0.02)
        out = np.where(manque, out * poids + est * (1 - poids), out); poids = np.where(manque, 1.0, poids)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype('uint8'))

tailles = {}
decor = {'k': k, 'obs': [], 'rocs': [], 'portes': []}
decor['fond'], tailles['fond'] = b64(Image.open(D + 'fond.png').convert('RGB'), 'JPEG', quality=86, subsampling=1, optimize=True)

sp = [('obs', o, Image.open(D + 'obs%02d.png' % o['i']).convert('RGBA')) for o in info['obs']]
sp += [('rocs', o, Image.open(D + 'roc%d.png' % o['i']).convert('RGBA')) for o in info['rocs']]
LMAX = int(900 * k); x = y = hr = 0; places = []
for t, o, im in sorted(sp, key=lambda q: -q[2].height):
    if x + im.width + 2 > LMAX: x = 0; y += hr + 2; hr = 0
    places.append((t, o, im, x, y)); x += im.width + 2; hr = max(hr, im.height)
AW = max(p[3] + p[2].width for p in places); AH = y + hr
atlas = Image.new('RGB', (AW, AH), (20, 20, 26)); masque = Image.new('L', (AW, AH), 0)
for t, o, im, ax, ay in places:
    atlas.paste(deborder(im), (ax, ay)); masque.paste(im.split()[3], (ax, ay))
    e = {'i': o['i'], 'px': round(o['px'], 2), 'py': round(o['py'], 2), 'w': round(im.width / k, 2), 'h': round(im.height / k, 2), 'ax': ax, 'ay': ay, 'aw': im.width, 'ah': im.height}
    if t == 'rocs': e['dx'] = round(o['dx'], 2); e['dy'] = round(o['dy'], 2)
    decor[t].append(e)
for t in ('obs', 'rocs'): decor[t].sort(key=lambda o: o['i'])
decor['atlas'], tailles['planche'] = b64(atlas, 'JPEG', quality=88, subsampling=1, optimize=True)
decor['masque'], tailles['découpes'] = b64(Image.merge('LA', (Image.new('L', (AW, AH), 255), masque)), 'PNG', optimize=True)
for i, p in enumerate(info['portes']):
    e = {'x': round(p['x'], 2), 'y': round(p['y'], 2), 'w': round(p['w'], 2), 'h': round(p['h'], 2)}
    e['img'], tailles['porte%d' % i] = b64(Image.open(D + 'porte%d.png' % i).convert('RGB'), 'JPEG', quality=86, subsampling=1, optimize=True)
    decor['portes'].append(e)
# ce que le jeu dessine par-dessus : les flammes des brasiers, la lumière des lanternes, les yeux des portes, le cœur de la niche
decor['brasiers'] = [{'x': x, 'y': y, 'z': z} for (x, y, z) in S.BRASIERS]
decor['lanternes'] = {n: {'x': p[0], 'y': p[1], 'z': 1.95} for n, p in S.LANTERNES.items()}
decor['yeux'] = []
for rep in (S.GAUCHE, S.DROITE):
    p = rep.P(S.LW / 2, -0.18, S.P_NAIS + S.P_LARG + 0.62); decor['yeux'].append({'x': p[0], 'y': p[1], 'z': p[2]})
decor['coeur'] = {'x': S.NICHE[0], 'y': -1.85, 'z': 4.15}
js = '/* le décor rendu en volume (decor3d/) : fabriqué par paquet.py, ne pas toucher à la main */\nwindow.DECOR=' + json.dumps(decor, separators=(',', ':')) + ';\n'
open(SORTIE, 'w').write(js)
print('decor.js : %d Ko' % (len(js) // 1024), {n: t // 1024 for n, t in tailles.items()}, 'planche', (AW, AH))
