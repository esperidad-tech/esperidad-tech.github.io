# Étape 4 : l'éclatement de chaque cristal, tiré de la vidéo de Romain (une par paire) : chaque image recalée sur la peinture,
# le morceau autour du cristal, 30 images (10 par seconde, de 0,6 s avant l'éclair à 2,4 s après), rangées dans une planche.
import cv2, numpy as np, json, glob
spots = json.load(open('/tmp/cr2/spots.json'))
P = cv2.imread('/mnt/user-data/uploads/b5e242e6-image.png')
VID = {0: '98b8a142', 1: 'd1d1811a', 2: 'a94e2c65', 3: '1378efba', 4: '8a834a9b'}
S = 0.25
g = lambda im: cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32), (5, 5), 0)
ref = g(cv2.resize(P, None, fx=S, fy=S))
M = np.zeros(ref.shape, np.uint8); M[:int(950 * S), :] = 255; M[:int(800 * S), int(1500 * S):int(3300 * S)] = 0
OUT = '/tmp/essai3d/site/nuit/cr/'
for k, v in VID.items():
    F = glob.glob('/mnt/user-data/uploads/%s-*.mp4' % v)[0]; cap = cv2.VideoCapture(F); frames = []; W = np.eye(2, 3, dtype=np.float32)
    while True:
        ok, im = cap.read()
        if not ok: break
        big = cv2.resize(im, (4384, 1872), interpolation=cv2.INTER_CUBIC)
        try: _, W = cv2.findTransformECC(ref, g(cv2.resize(big, None, fx=S, fy=S)), W.copy(), cv2.MOTION_AFFINE, (3, 60, 1e-5), M, 5)
        except cv2.error: pass
        Wf = W.copy(); Wf[:, 2] /= S
        frames.append(cv2.warpAffine(big, Wf, (4384, 1872), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE))
    n = len(frames); print('paire', k, n, 'images')
    for s, sp in enumerate(spots):
        if sp['k'] != k: continue
        x, y, w, h = sp['rect']; x0 = max(0, int(x - 0.35 * w)); x1 = min(4384, int(x + 1.35 * w)); y0 = max(250, int(y - 0.3 * h)); y1 = min(1872, int(y + 1.08 * h))
        mk = cv2.imread(OUT + 'm%02d.png' % s); body = mk[:, :, 1] > 128
        by, bx = np.nonzero(body); by += y; bx += x
        lum = [float(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[by, bx].mean()) for f in frames]
        # l'éclatement : quand la lueur des veines retombe (le cristal a disparu) ; on garde 1 s avant (les veines, l'éclair) et 2 s après
        ip = int(np.argmax(lum)); base = lum[0]; seuil = base + 0.5 * (lum[ip] - base)
        ib = next((i for i in range(ip, n) if lum[i] < seuil), ip + 12); tf = ib / 24.0
        t0 = max(0.0, tf - 1.0); ts = [t0 + i / 10 for i in range(30)]
        tw, th = (x1 - x0) // 2, (y1 - y0) // 2
        cols = max(1, 4096 // tw); rows = int(np.ceil(30 / cols))
        atlas = np.zeros((rows * th, cols * tw, 3), np.uint8)
        for i, t in enumerate(ts):
            f = frames[min(n - 1, int(round(t * 24)))][y0:y1, x0:x1]
            atlas[(i // cols) * th:(i // cols + 1) * th, (i % cols) * tw:(i % cols + 1) * tw] = cv2.resize(f, (tw, th), interpolation=cv2.INTER_AREA)
        cv2.imwrite(OUT + 'e%02d.jpg' % s, atlas, [cv2.IMWRITE_JPEG_QUALITY, 82])
        sp.update(eclat=dict(rect=[x0, y0, x1 - x0, y1 - y0], tuile=[tw, th], cols=cols, n=30, fps=10, eclair=round(tf - t0, 2)))
        print('  endroit', s, 'éclate à %.2f s' % tf, 'planche', atlas.shape)
json.dump(spots, open('/tmp/cr2/spots.json', 'w'))
