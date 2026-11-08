"""La planche du bestiaire : les 12 fiches en 4 colonnes -> planche.png (à lancer après rendre.py)."""
import os
from PIL import Image
ICI = os.path.dirname(os.path.abspath(__file__))
ORDRE = ['rat', 'ratcuir', 'chauvesouris', 'feufollet', 'araignee', 'tetard', 'roirats', 'gardien', 'meretoiles', 'bourbe', 'gargouille', 'quatresignes']
L, H, M = 560, 760, 24
W = Image.new('RGB', (4 * L + 5 * M, 3 * H + 4 * M), (8, 6, 12))
for k, i in enumerate(ORDRE):
    im = Image.open(os.path.join(ICI, 'fiches', i + '.png')).resize((L, H), Image.LANCZOS)
    W.paste(im, (M + (k % 4) * (L + M), M + (k // 4) * (H + M)))
W.save(os.path.join(ICI, 'planche.png'))
print('ok', W.size)
