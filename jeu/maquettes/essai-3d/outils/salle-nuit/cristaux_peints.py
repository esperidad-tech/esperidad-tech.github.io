# Étape 1 : recaler les 10 images de cristaux de Romain sur sa place de nuit, repérer les cristaux, les grouper.
import cv2, numpy as np, json, sys
sys.path.insert(0, '/tmp/salle/gen')
from camera import *
UP = '/mnt/user-data/uploads/'
PLATE = cv2.imread(UP + 'b5e242e6-image.png')
PAIRES = [('caa87e29', '6d6e2578', '98b8a142'), ('ab9fca12', 'f54d70e1', 'd1d1811a'), ('48fde56e', '4cf75f07', 'a94e2c65'),
          ('2eba0053', '1378efba', None), ('354117e4', '993b5f72', '8a834a9b')]
PAIRES[3] = ('2eba0053', '8837c03e', '1378efba')
S = 0.25
g = lambda im: cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
ref = cv2.GaussianBlur(g(cv2.resize(PLATE, None, fx=S, fy=S)), (5, 5), 0)
MASQ = np.zeros(ref.shape, np.uint8); MASQ[:int(950 * S), :] = 255; MASQ[:int(800 * S), int(1500 * S):int(3300 * S)] = 0
def recale(im):
    s = cv2.resize(im, (4384, 1872), interpolation=cv2.INTER_CUBIC) if im.shape[1] != 4384 else im
    W = np.eye(2, 3, dtype=np.float32); ps = cv2.GaussianBlur(g(cv2.resize(s, None, fx=S, fy=S)), (5, 5), 0)
    d = cv2.GaussianBlur(np.abs(ps - ref), (0, 0), 6); m = ((d < 12) * 255).astype(np.uint8); m[:int(700 * S), int(1900 * S):int(2500 * S)] = 0   # (tout ce qui n'a pas changé : le décor et le sol sans cristaux)
    _, W = cv2.findTransformECC(ref, ps, W, cv2.MOTION_AFFINE, (3, 100, 1e-6), m, 5)
    W[:, 2] /= S
    return cv2.warpAffine(s, W, (4384, 1872), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE), W
if __name__ == '__main__':
    infos = []
    for k, (c, r, v) in enumerate(PAIRES):
        C, Wc = recale(cv2.imread(UP + c + '-image.png')); R, Wr = recale(cv2.imread(UP + r + '-image.png'))
        cv2.imwrite('/tmp/cr2/C%d.png' % k, C); cv2.imwrite('/tmp/cr2/R%d.png' % k, R)
        print(k, 'recalage', np.round(Wc, 4).tolist(), np.round(Wr, 4).tolist())
