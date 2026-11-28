# Découpe précise d'un objet de la peinture avec SAM (Segment Anything, modèle vit_b via rembg).
# On découpe un morceau d'image autour de l'objet (pour garder la finesse des bords), on donne
# le cadre de l'objet + des points « dedans » / « dehors », et SAM rend le masque.
import cv2, numpy as np
from PIL import Image
_S = None
def session():
    global _S
    if _S is None:
        from rembg import new_session
        _S = new_session('sam')
    return _S
def masque(img, boite, dedans=(), dehors=(), marge=60):
    """img : image BGR entière ; boite : (x0,y0,x1,y1) ; renvoie un masque 0/255 de la taille de img."""
    H, W = img.shape[:2]
    x0, y0, x1, y1 = boite
    cx0, cy0 = max(0, x0 - marge), max(0, y0 - marge)
    cx1, cy1 = min(W, x1 + marge), min(H, y1 + marge)
    crop = img[cy0:cy1, cx0:cx1]
    p = [{'type': 'rectangle', 'data': [x0 - cx0, y0 - cy0, x1 - cx0, y1 - cy0], 'label': 1}]
    p += [{'type': 'point', 'data': [x - cx0, y - cy0], 'label': 1} for x, y in dedans]
    p += [{'type': 'point', 'data': [x - cx0, y - cy0], 'label': 0} for x, y in dehors]
    s = session()
    im = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
    res = s.predict(im, sam_prompt=p)
    m = np.array(res[0].convert('L'))
    out = np.zeros((H, W), np.uint8)
    out[cy0:cy1, cx0:cx1] = (m > 127) * 255
    return out
