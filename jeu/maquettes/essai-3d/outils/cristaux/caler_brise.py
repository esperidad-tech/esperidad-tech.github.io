# caler_brise.py : la vidéo du cristal qui se brise, calée au pixel sur le cristal planté (l'image où elle commence dans le jeu).
# La caméra de la vidéo ne bouge pas (vérifié : moins de 0,4 px) → une seule déformation (affine, trouvée par ECC sur l'image 0),
# puis les couleurs de l'image 0 ramenées à celles du cristal planté (table par canal, sur le cristal et ses gravats).
import cv2, numpy as np, subprocess
cap = cv2.VideoCapture('/tmp/hf/brise.mp4'); fr = []
while True:
    ok, f = cap.read()
    if not ok: break
    fr.append(f)
p = cv2.imread('/tmp/hf/cristal-plante.png'); H, W = p.shape[:2]
g = lambda f: cv2.GaussianBlur(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1)
w = np.eye(2, 3, dtype=np.float32)
cc, w = cv2.findTransformECC(g(p), g(fr[0]), w, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-7), None, 5)
print('ECC', round(cc, 4), w.round(4).tolist())
al = [cv2.warpAffine(f, w, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE) for f in fr]
# table de couleurs : sur les pixels « pas verts » des deux images
dom = lambda f: f[..., 1].astype(int) - np.maximum(f[..., 0], f[..., 2]).astype(int)
m = (dom(p) < 20) & (dom(al[0]) < 20)
lut = []
for ch in range(3):
    q = np.linspace(0, 100, 101); a = np.percentile(al[0][..., ch][m], q); b = np.percentile(p[..., ch][m], q)
    a = np.maximum.accumulate(a + np.arange(101) * 1e-3)
    lut.append(np.clip(np.interp(np.arange(256), a, b), 0, 255).astype(np.uint8))
# la table ne touche que ce qui n'est pas le fond (le vert reste tel quel, sinon le détourage serait faussé)
out = []
for f in al:
    t = np.dstack([lut[c][f[..., c]] for c in range(3)])
    k = np.clip((25 - dom(f)) / 20, 0, 1)[..., None]
    out.append((f * (1 - k) + t * k).astype(np.uint8))
print('écart image 0 / planté : avant', round(np.abs(fr[0].astype(int) - p).mean(), 2), 'après', round(np.abs(out[0].astype(int) - p).mean(), 2),
      '— sur le cristal :', round(np.abs(out[0].astype(int) - p)[m].mean(), 2))
pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                       '-c:v', 'libx264', '-crf', '8', '-pix_fmt', 'yuv444p', '/tmp/hf/brise-cale.mp4'], stdin=subprocess.PIPE)
for f in out: pr.stdin.write(f.tobytes())
pr.stdin.close(); pr.wait()
cv2.imwrite('/tmp/hf/apercu/brise-controle.jpg', np.hstack([p[600:1150, 100:620], out[0][600:1150, 100:620], (np.abs(out[0].astype(int) - p) * 4).clip(0, 255).astype(np.uint8)[600:1150, 100:620]]))
