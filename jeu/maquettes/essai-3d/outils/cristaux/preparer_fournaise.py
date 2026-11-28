# preparer_fournaise.py : la fournaise (fond noir) → la vidéo du jeu, posée en lumière (« plus clair que ») devant Grosbec.
#  - le noir du fond est remis à zéro (le bruit de la vidéo ferait sinon un rectangle grisâtre sur la place) ;
#  - les bords s'éteignent en ovale autour du départ du feu (le feu de la vidéo touche les bords) ;
#  - la courbe de lumière (combien le feu éclaire à chaque image) est mesurée pour allumer Grosbec en orange au même rythme.
import cv2, numpy as np, subprocess, json
cap = cv2.VideoCapture('/tmp/hf/fournaise.mp4'); W, H = 960, 540
pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                       '-c:v', 'libx264', '-profile:v', 'main', '-level', '4.0', '-pix_fmt', 'yuv420p', '-crf', '22', '-maxrate', '5M', '-bufsize', '10M',
                       '-movflags', '+faststart', '/tmp/hf/fournaiseJeu/fournaise.mp4'], stdin=subprocess.PIPE)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
CX, CY = 0.5 * W, 0.78 * H
r = np.sqrt(((xx - CX) / (0.5 * W)) ** 2 + ((yy - CY) / np.where(yy < CY, 0.78 * H, 0.22 * H)) ** 2)
ov = 1 - np.clip((r - 0.62) / 0.38, 0, 1); ov = (ov * ov * (3 - 2 * ov))[..., None]
courbe = []; k = 0; planche = []
while True:
    ok, f = cap.read()
    if not ok: break
    f = cv2.resize(f, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)
    f = np.clip((f - 7) * (255 / 248), 0, 255) * ov
    if k > 104: f *= max(0, (120 - k) / 16)       # la fin : jusqu'au noir complet
    courbe.append(float((f[int(0.45 * H):, :].mean() / 255)))
    pr.stdin.write(f.astype(np.uint8).tobytes())
    if k % 12 == 0: planche.append(cv2.resize(f, (240, 135)).astype(np.uint8))
    k += 1
pr.stdin.close(); pr.wait()
m = max(courbe); courbe = [round(c / m, 3) for c in courbe]
json.dump({'fps': 24, 'images': k, 'lumiere': courbe}, open('/tmp/hf/fournaiseJeu/fournaise.json', 'w'))
cv2.imwrite('/tmp/hf/apercu/fournaise-jeu.jpg', np.hstack(planche))
print(k, 'images ; pic de lumière à l\'image', courbe.index(1.0), '; courbe', courbe[::8])
