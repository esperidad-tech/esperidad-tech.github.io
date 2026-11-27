# empaqueter.py <image.png> <profondeur 16 bits.png> <dossier> : fond.jpg + prof.png (la profondeur sur deux octets : rouge = haut, vert = bas)
import sys, numpy as np
from PIL import Image
im, pr, D = sys.argv[1], sys.argv[2], sys.argv[3]
Image.open(im).convert('RGB').save(D + '/fond.jpg', quality=90, subsampling=0, optimize=True)
import cv2
a = cv2.imread(pr, cv2.IMREAD_UNCHANGED)
if a.ndim == 3: a = a[..., 2]   # (cv2 : bleu, vert, rouge) : la profondeur est dans le rouge
if a.dtype != np.uint16: a = (a.astype(np.float64) / a.max() * 65535)
a = a.astype(np.uint32)
rgb = np.zeros(a.shape + (3,), np.uint8); rgb[..., 0] = a >> 8; rgb[..., 1] = a & 255
Image.fromarray(rgb).save(D + '/prof.png', optimize=True)
print('fond', Image.open(im).size, 'profondeur', a.shape, a.dtype, a.min(), a.max())
