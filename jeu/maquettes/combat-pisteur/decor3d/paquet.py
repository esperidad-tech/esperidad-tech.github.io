# Range les images rendues dans un seul fichier pour le jeu : decor.js (window.DECOR).
# python3 paquet.py <dossier des rendus> <decor.js>
# Le fond est un JPEG ; les obstacles sont sur une planche JPEG (les couleurs) + un PNG (les découpes) : ça passe partout, même
# sur une vieille tablette, et c'est bien plus léger que des PNG.
import sys, json, base64, io
import numpy as np
from PIL import Image, ImageFilter

D = sys.argv[1].rstrip('/') + '/'; SORTIE = sys.argv[2]
info = json.load(open(D + 'info.json')); k = info['k']
Y0 = 1.3
TORCHES = [(2.4, 2.55), (10.12, 2.9), (15.88, 2.9), (23.6, 2.55)]
LAMPES = [(-0.5, 6.2, 2.3), (26.5, 12.4, 2.3)]
PORTES_X = [8.0, 18.0]

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
fond = Image.open(D + 'fond.png').convert('RGB')
decor = {'k': k, 'obs': [], 'portes': []}
decor['fond'], tailles['fond'] = b64(fond, 'JPEG', quality=87, subsampling=1, optimize=True)

# la planche des obstacles
sp = [(o, Image.open(D + 'obs%02d.png' % o['i']).convert('RGBA')) for o in info['obs']]
LMAX = int(1100 * k); x = y = hr = 0; places = []
for o, im in sorted(sp, key=lambda t: -t[1].height):
    if x + im.width + 2 > LMAX: x = 0; y += hr + 2; hr = 0
    places.append((o, im, x, y)); x += im.width + 2; hr = max(hr, im.height)
AW = max(p[2] + p[1].width for p in places); AH = y + hr
atlas = Image.new('RGB', (AW, AH), (20, 20, 26)); masque = Image.new('L', (AW, AH), 0)
for o, im, ax, ay in places:
    atlas.paste(deborder(im), (ax, ay)); masque.paste(im.split()[3], (ax, ay))
    decor['obs'].append({'i': o['i'], 'x': o['x'], 'y': o['y'], 'px': round(o['px'], 2), 'py': round(o['py'], 2), 'w': round(im.width / k, 2), 'h': round(im.height / k, 2), 'ax': ax, 'ay': ay, 'aw': im.width, 'ah': im.height})
decor['obs'].sort(key=lambda o: o['i'])
decor['atlas'], tailles['planche'] = b64(atlas, 'JPEG', quality=88, subsampling=1, optimize=True)
la = Image.merge('LA', (Image.new('L', (AW, AH), 255), masque))
decor['masque'], tailles['découpes'] = b64(la, 'PNG', optimize=True)

for i, p in enumerate(info['portes']):
    e = {'x': round(p['x'], 2), 'y': round(p['y'], 2), 'w': round(p['w'], 2), 'h': round(p['h'], 2), 'dx': PORTES_X[i]}
    for n in 'BC':
        e[n], t = b64(Image.open(D + 'porte%d_%s.png' % (i, n)).convert('RGB'), 'JPEG', quality=86, subsampling=1, optimize=True); tailles['porte%d%s' % (i, n)] = t
    decor['portes'].append(e)
decor['torches'] = [{'x': x, 'y': Y0 + 0.34, 'z': z} for (x, z) in TORCHES]
decor['lampes'] = [{'x': x, 'y': y, 'z': z + 0.02} for (x, y, z) in LAMPES]

js = '/* le décor rendu en volume (decor3d/) : fabriqué par paquet.py, ne pas toucher à la main */\nwindow.DECOR=' + json.dumps(decor, separators=(',', ':')) + ';\n'
open(SORTIE, 'w').write(js)
print('decor.js : %d Ko' % (len(js) // 1024), {n: t // 1024 for n, t in tailles.items()}, 'planche', (AW, AH))
