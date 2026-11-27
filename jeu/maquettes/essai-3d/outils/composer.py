# composer.py <dossier final> <sortie> : le fond fini + les deux lanternes, et la profondeur qui va avec (16 bits)
import sys, numpy as np, cv2
from PIL import Image
F, O = sys.argv[1].rstrip('/') + '/', sys.argv[2]
im = Image.open(F + 'fond.png').convert('RGBA')
for i in (0, 1): im.alpha_composite(Image.open(F + 'obs%02d_plein.png' % i).convert('RGBA'))
im.convert('RGB').save(O + '.png')
d = cv2.imread(F + 'fond_brut_prof.png', cv2.IMREAD_UNCHANGED)
p = d[..., 2].copy(); p[d[..., 3] < 32768] = 65535          # hors de la salle : très loin
for i in (0, 1):
    o = cv2.imread(F + 'obs%02d_brut_prof.png' % i, cv2.IMREAD_UNCHANGED); a = cv2.imread(F + 'obs%02d_brut.png' % i, cv2.IMREAD_UNCHANGED)[..., 3]
    m = a > 128; p[m] = np.minimum(p[m], o[..., 2][m])
cv2.imwrite(O + '_prof.png', p)
print(im.size, p.min(), p.max())
