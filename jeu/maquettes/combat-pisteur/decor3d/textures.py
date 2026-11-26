# Les images peintes : le long tapis rouge, le tapis rond du milieu, la bannière.
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np, math, random
import os
ICI = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(ICI, 'tex', '')
R = random.Random(11)

def bruit(w, h, ech, seed, oct=4):
    rs = np.random.RandomState(seed); out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(oct):
        s = max(2, int(ech / (2 ** o)))
        g = rs.rand(h // s + 2, w // s + 2).astype(np.float32)
        im = Image.fromarray((g * 255).astype('uint8')).resize((w, h), Image.BICUBIC)
        out += np.asarray(im, np.float32) / 255 * amp; tot += amp; amp *= 0.5
    return out / tot

def tissage(im, force=0.06, seed=3):
    a = np.asarray(im.convert('RGB'), np.float32) / 255; h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    t = (np.sin(xx * 2.2) * np.sin(yy * 2.2)) * force
    n = (np.random.RandomState(seed).rand(h, w) - 0.5) * force * 1.3
    a = np.clip(a * (1 + t[..., None] + n[..., None]), 0, 1)
    return Image.fromarray((a * 255).astype('uint8'))

def usure(im, seed, force=0.3, ech=160):
    a = np.asarray(im.convert('RGB'), np.float32) / 255; h, w = a.shape[:2]
    n = bruit(w, h, ech, seed); m = np.clip((n - 0.5) * 3.2, -1, 1)
    gris = a.mean(2, keepdims=True)
    a = a * (1 + m[..., None] * force * 0.6)
    f = np.clip(-m, 0, 1)[..., None] * force
    a = a * (1 - f) + (gris * 0.8 + 0.06) * f
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'))

# ---- le long tapis : 3 pas de large, 14,5 de long (160 points par pas) ----
def tapis_long():
    P = 160; W, H = int(3 * P), int(14.5 * P)
    im = Image.new('RGB', (W, H), '#7d1c20'); d = ImageDraw.Draw(im)
    # un dégradé en travers : plus sombre sur les bords
    a = np.asarray(im, np.float32); x = np.linspace(-1, 1, W)[None, :, None]
    a = a * (1 - 0.22 * np.abs(x) ** 2.2); im = Image.fromarray(a.astype('uint8')); d = ImageDraw.Draw(im)
    or1, or2, sombre = '#d8ae55', '#8f6a28', '#4d1015'
    for x0, w, c in [(10, 26, or1), (W - 36, 26, or1), (48, 7, or2), (W - 55, 7, or2), (4, 5, sombre), (W - 9, 5, sombre)]:
        d.rectangle([x0, 0, x0 + w, H], fill=c)
    # un filet torsadé dans les bandes d'or
    for x0 in (10, W - 36):
        for y in range(0, H, 22):
            d.polygon([(x0 + 2, y), (x0 + 24, y + 11), (x0 + 2, y + 22)], fill='#b88a36')
    # les losanges
    cx = W // 2; pas = int(1.9 * P)
    for k, y in enumerate(range(int(0.9 * P), H - int(0.6 * P), pas)):
        w2, h2 = int(0.78 * P), int(0.66 * P)
        pts = [(cx, y - h2), (cx + w2, y), (cx, y + h2), (cx - w2, y)]
        d.polygon(pts, fill='#4a0f14'); d.line(pts + [pts[0]], fill=or1, width=7)
        w3, h3 = int(w2 * 0.55), int(h2 * 0.55); p2 = [(cx, y - h3), (cx + w3, y), (cx, y + h3), (cx - w3, y)]
        d.polygon(p2, fill='#8d2326'); d.line(p2 + [p2[0]], fill=or2, width=4)
        d.ellipse([cx - 14, y - 14, cx + 14, y + 14], fill=or1)
        # de petits fleurons entre les losanges
        ym = y + pas // 2
        if ym < H - int(0.5 * P):
            for sx in (-1, 1):
                d.polygon([(cx + sx * 70, ym - 26), (cx + sx * 96, ym), (cx + sx * 70, ym + 26), (cx + sx * 44, ym)], fill=or2)
            d.ellipse([cx - 9, ym - 9, cx + 9, ym + 9], fill='#4a0f14')
    # deux galons en travers aux deux bouts
    for y0 in (26, H - 60):
        d.rectangle([0, y0, W, y0 + 26], fill=or1); d.rectangle([0, y0 + 34, W, y0 + 40], fill=or2)
    im = usure(tissage(im, 0.07), 5, 0.34, 190)
    # les plis : des bandes d'ombre légères en travers
    a = np.asarray(im, np.float32) / 255; yy = np.arange(H)[:, None, None]
    pli = 1 + 0.05 * np.sin(yy / 61.0) + 0.035 * np.sin(yy / 23.0 + 1.3)
    a = np.clip(a * pli, 0, 1)
    # les franges aux deux bouts : transparentes entre les brins
    al = np.ones((H, W), np.float32); fr = 34
    rs = np.random.RandomState(4)
    for x0 in range(0, W, 9):
        l0, l1 = rs.randint(0, 12), rs.randint(0, 12)
        al[:l0, x0:x0 + 9] = 0; al[H - l1:, x0:x0 + 9] = 0
        al[:fr, x0 + 6:x0 + 9] = 0; al[H - fr:, x0 + 6:x0 + 9] = 0
        a[:fr, x0:x0 + 6] = np.array([0.86, 0.72, 0.42]) * (0.75 + 0.25 * rs.rand()); a[H - fr:, x0:x0 + 6] = np.array([0.86, 0.72, 0.42]) * (0.75 + 0.25 * rs.rand())
    rgba = np.dstack([a, al]); Image.fromarray((rgba * 255).astype('uint8'), 'RGBA').save(D + 'tapis_long.png')

# ---- le tapis rond du milieu : sombre, avec une rose des vents en or ----
def tapis_rond():
    N = 1024; im = Image.new('RGB', (N, N), '#1b1d2a'); d = ImageDraw.Draw(im); c = N / 2; Rr = N / 2 - 6
    def cercle(r, **k): d.ellipse([c - r, c - r, c + r, c + r], **k)
    or1, or2, or3 = '#e2ba62', '#a87f36', '#5f4720'
    cercle(Rr, fill='#232536'); cercle(Rr, outline=or1, width=22); cercle(Rr - 26, outline=or3, width=5)
    cercle(Rr * 0.86, fill='#1a1c29'); cercle(Rr * 0.86, outline=or2, width=7)
    # une couronne de dents, comme un cadran
    for i in range(24):
        a = i / 24 * math.tau; da = 0.085 if i % 2 == 0 else 0.05; r0, r1 = Rr * 0.83, Rr * (0.6 if i % 2 == 0 else 0.68)
        pts = [(c + math.cos(a - da) * r0, c + math.sin(a - da) * r0), (c + math.cos(a + da) * r0, c + math.sin(a + da) * r0), (c + math.cos(a) * r1, c + math.sin(a) * r1)]
        d.polygon(pts, fill=or2 if i % 2 == 0 else or3)
    cercle(Rr * 0.56, fill='#2a1a22'); cercle(Rr * 0.56, outline=or1, width=9); cercle(Rr * 0.5, outline=or3, width=4)
    # la rose des vents : huit branches, quatre grandes, quatre petites
    for i in range(8):
        a = i / 8 * math.tau + math.tau / 16 * 0; L = Rr * (0.5 if i % 2 == 0 else 0.33); l = Rr * 0.09
        tip = (c + math.cos(a) * L, c + math.sin(a) * L)
        g = (c + math.cos(a + math.pi / 2) * l, c + math.sin(a + math.pi / 2) * l); dd = (c + math.cos(a - math.pi / 2) * l, c + math.sin(a - math.pi / 2) * l)
        d.polygon([tip, g, (c, c)], fill=or1 if i % 2 == 0 else or2); d.polygon([tip, dd, (c, c)], fill=or2 if i % 2 == 0 else or3)
    cercle(Rr * 0.1, fill='#7d1c20'); cercle(Rr * 0.1, outline=or1, width=6); cercle(Rr * 0.035, fill=or1)
    for i in range(48):
        a = i / 48 * math.tau; r = Rr * 0.93; d.ellipse([c + math.cos(a) * r - 5, c + math.sin(a) * r - 5, c + math.cos(a) * r + 5, c + math.sin(a) * r + 5], fill=or1)
    im = usure(tissage(im, 0.08, 9), 21, 0.3, 200)
    al = Image.new('L', (N, N), 0); ImageDraw.Draw(al).ellipse([c - Rr, c - Rr, c + Rr, c + Rr], fill=255)
    im.putalpha(al.filter(ImageFilter.GaussianBlur(1.2))); im.save(D + 'tapis_rond.png')

# ---- la bannière : 1 pas de large, 2,3 de haut ----
def banniere():
    W, H = 256, 600; im = Image.new('RGB', (W, H), '#7e1d20'); d = ImageDraw.Draw(im)
    a = np.asarray(im, np.float32); x = np.linspace(0, 1, W)[None, :, None]
    a = a * (0.82 + 0.3 * np.sin(x * math.pi * 2.5) ** 2 * 0.6); im = Image.fromarray(np.clip(a, 0, 255).astype('uint8')); d = ImageDraw.Draw(im)
    or1, or2 = '#dcb45a', '#8f6a28'
    d.rectangle([0, H - 600, W, H - 584], fill=or1); d.rectangle([8, 0, 20, H], fill=or1); d.rectangle([W - 20, 0, W - 8, H], fill=or1)
    d.rectangle([26, 0, 30, H], fill=or2); d.rectangle([W - 30, 0, W - 26, H], fill=or2)
    for y in range(120, H - 40, 46): d.rectangle([34, y, W - 34, y + 9], fill='#5e1418')
    cx, cy, r = W // 2, 190, 70
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=or1); d.ellipse([cx - r + 14, cy - r + 14, cx + r - 14, cy + r - 14], fill='#54121a')
    d.polygon([(cx - 30, cy - 30), (cx + 44, cy), (cx - 30, cy + 34), (cx - 12, cy)], fill='#f2d488')
    im = usure(tissage(im, 0.08, 2), 33, 0.3, 90)
    # le bas en pointe, déchiré
    d = ImageDraw.Draw(im)
    for xx in range(4, W, 12): d.rectangle([xx, 0, xx + 5, 22], fill='#b88a36')   # un galon en haut
    im.putalpha(Image.new('L', (W, H), 255)); im.save(D + 'banniere.png')

tapis_long(); tapis_rond(); banniere(); print('textures ok')
