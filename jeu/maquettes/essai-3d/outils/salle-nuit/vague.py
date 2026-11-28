# La vague de Romain (sa vidéo faite d'après la place de nuit) : chaque image recalée sur la peinture, gardée de la ligne 250 au bas,
# à moitié de taille, puis encodée (mp4 et webm). La carte « quand le feu arrive ici » se fait ensuite avec arrivee.py.
import cv2, numpy as np, glob, subprocess
P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png')
F = glob.glob('/mnt/user-data/uploads/f258a06a-*.mp4')[0]
S = 0.25
g = lambda im: cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32), (5, 5), 0)
ref = g(cv2.resize(P, None, fx=S, fy=S))
M = np.zeros(ref.shape, np.uint8); M[:int(700 * S), :] = 255; M[:int(700 * S), int(1700 * S):int(2700 * S)] = 0   # (le haut du décor, sans le temple où la boule de feu s'allume)
cap = cv2.VideoCapture(F); W = np.eye(2, 3, dtype=np.float32); i = 0; Y0 = 250
while True:
    ok, im = cap.read()
    if not ok: break
    big = cv2.resize(im, (4384, 1872), interpolation=cv2.INTER_CUBIC)
    try: _, W = cv2.findTransformECC(ref, g(cv2.resize(big, None, fx=S, fy=S)), W.copy(), cv2.MOTION_AFFINE, (3, 60, 1e-5), M, 5)
    except cv2.error: pass
    Wf = W.copy(); Wf[:, 2] /= S
    al = cv2.warpAffine(big, Wf, (4384, 1872), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite('/tmp/vague2/f%03d.png' % i, cv2.resize(al[Y0:], (2192, (1872 - Y0) // 2), interpolation=cv2.INTER_AREA))
    i += 1
print(i, 'images ; recalage final', np.round(W, 4).tolist())
for args, out in [(['-c:v', 'libx264', '-profile:v', 'main', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], 'vague.mp4'),
                  (['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-cpu-used', '4', '-pix_fmt', 'yuv420p'], 'vague.webm')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', '/tmp/vague2/f%03d.png', '-vf', 'crop=2192:810:0:0'] + args + ['-an', '/tmp/essai3d/site/nuit/' + out], check=True)
