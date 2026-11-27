# La salle de l'armure (phase 2 de l'enquête 10, les trois de devant), construite en volume.
# Les mesures sont celles du jeu (src/regles.js : REG.salle, REG.armure, REG.lanternes, REG.rep.portes) : NE PAS LES CHANGER ICI SEULES.
#   x : de 0 (à gauche) à 18 ; y : de 0 (le mur du fond) à 10,5 (le bord de devant) ; z : la hauteur.
#   Les deux coins du fond sont coupés en biais (3,4 pas) : une porte au milieu de chaque mur en biais (les réparateurs).
#   L'armure se tient au fond, devant une grande niche pleine de tuyaux : le drainage de l'énergie d'Elyra.
#   Les deux lanternes (la dorée à gauche, la rouge à droite) la nourrissent par des rigoles d'or creusées dans le sol.
# Ce que le jeu dessine lui-même par-dessus : l'armure, les flammes des brasiers, la lumière des lanternes, les rochers qui tombent.
import bpy, math, random, os, sys
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from mathutils import Vector, Matrix
import base as B
from base import G, srgb, varier, boite, planche, tour, boule, rivet, rocher, maille, lampe, ZS, RW, RD, HM
from formes2 import prisme, tore

REG = dict(monde=0.4, ambiance=95, face=620, brasier=560, lanterne=620, armure=700, puits=3400, niche=180, couloir=420)
COIN = 3.4                                   # les coins coupés (REG.salle.coin)
ARMURE = (9.0, 1.25)
LANTERNES = {'or': (1.2, 5.6), 'rouge': (16.8, 5.6)}
EP = 0.8                                     # l'épaisseur des murs
NICHE = (9.0, 2.9, 2.55)                     # la niche de l'armure : son milieu, sa demi-largeur, où l'arc commence
P_LARG, P_NAIS = 0.78, 1.5                   # une porte : sa demi-largeur, où son arc commence
LW = COIN * math.sqrt(2)                     # la longueur d'un mur en biais

SOL = ['#7a7062', '#6f6455', '#65646a', '#5c6474', '#6a5f6b', '#82735c', '#716c64', '#605d59', '#76695b', '#59606f', '#857866', '#4f5563']
MUR = ['#3c4256', '#454b62', '#363b4f', '#40465c', '#4a4d64', '#383e53', '#4d4657', '#42485f']
MUR_CLAIR = ['#666a82', '#70758c', '#5d627a', '#74718a']
ROC = ['#9a958f', '#8d8a8c', '#a39a8c', '#868c98', '#958b84']

def M():
    return dict(
        sol=B.pierre('sol', rug=0.74, relief=0.32, fissures=0.65, grain=0.9, poli=0.25, patine=0.35),
        joint=B.pierre('joint', rug=0.95, relief=0.5, fissures=0.0, grain=2.0, patine=0.5),
        mur=B.pierre('mur', rug=0.86, relief=0.45, fissures=0.6, mousse=0.25, salete=0.55),
        roc=B.pierre('roc', rug=0.9, relief=0.6, fissures=0.35, grain=1.6, salete=0.3),
        fer=B.metal('fer', '#3a3e49', rug=0.5, patine='#16171c'),
        bronze=B.metal('bronze', '#c08e3c', rug=0.36, patine='#5e4120'),
        orr=B.metal('or', '#efc566', rug=0.28, patine='#946a28'),
        cuivre=B.metal('cuivre', '#b8693c', rug=0.42, patine='#3f5a4c'),
        bois=B.bois('bois'),
        noir=B.uni('noir', '#050608', rug=1.0),
        rigole_or=B.uni('rigole_or', '#ffd27a', rug=0.3, lueur='#ffb43c', force=2.2, metallic=0.6),
        rigole_rouge=B.uni('rigole_rouge', '#ff8a6a', rug=0.3, lueur='#ff3a1c', force=2.2, metallic=0.6),
        coeur=B.uni('coeur', '#ffcf7a', rug=0.3, lueur='#ff9a2a', force=5.0),
        verre_or=B.uni('verre_or', '#ffe2a0', rug=0.15, lueur='#ffc04a', force=4.0),
        verre_rouge=B.uni('verre_rouge', '#ffa08a', rug=0.15, lueur='#ff3a22', force=4.0),
        braise=B.braise('braise', 1.6, '#ff5a0c', '#ffc040', 7.0),
        oeil=B.uni('oeil', '#3a0b0b', rug=0.2, lueur='#ff2a10', force=0.6),
        couloir=B.uni('couloir', '#2a1410', rug=1.0, lueur='#ff4a18', force=0.25),
    )

def pal(R, P, dv=0.07): return varier(srgb(R.choice(P)), R, dv)

# ====================== un mur : son repère (le long du mur u, vers l'extérieur v, la hauteur z) ======================
class Repere:
    def __init__(self, S, d, n):
        self.S, self.d, self.n = S, d, n          # le départ, la direction du mur, la normale vers l'intérieur (dans le jeu)
        self.ang = math.atan2(-d[1], d[0])        # (la scène : y vers le haut)
    def P(self, u, v, z):
        return (self.S[0] + u * self.d[0] - v * self.n[0], self.S[1] + u * self.d[1] - v * self.n[1], z)
    def bloc(self, nom, u0, u1, v0, v1, z0, z1, mat, coul, biseau=0.035, coll='fond'):
        c = self.P((u0 + u1) / 2, (v0 + v1) / 2, (z0 + z1) / 2)
        return boite(nom, c, (u1 - u0, v1 - v0, z1 - z0), mat, coul, coll, biseau, rot=Matrix.Rotation(self.ang, 3, 'Z'))
    def coin_arc(self, nom, uc, zs, r0, r1, a0, a1, v0, v1, mat, coul, coll='fond'):
        """un claveau : un morceau d'anneau (l'arc d'une ouverture) entre les angles a0 et a1"""
        pts = []
        for (r, a) in ((r0, a0), (r0, a1), (r1, a1), (r1, a0)):
            for v in (v0, v1): pts.append(self.P(uc + r * math.cos(a), v, zs + r * math.sin(a)))
        vs = [G(*p) for p in pts]
        f = [(0, 2, 4, 6), (1, 7, 5, 3), (0, 1, 3, 2), (2, 3, 5, 4), (4, 5, 7, 6), (6, 7, 1, 0)]
        ob = maille(nom, vs, f, mat, coul, coll, lisse=False)
        bev = ob.modifiers.new('b', 'BEVEL'); bev.width = 0.025; bev.segments = 2
        return ob

ARR = Repere((0.0, 0.0), (1.0, 0.0), (0.0, 1.0))
s2 = 1 / math.sqrt(2)
GAUCHE = Repere((COIN, 0.0), (-s2, s2), (s2, s2))
DROITE = Repere((RW - COIN, 0.0), (s2, s2), (-s2, s2))

def mur(m, R, rep, u0, u1, ouvertures, hm=HM, chape=True):
    """un mur de blocs, de u0 à u1 ; ouvertures : [(milieu, demi-largeur, où l'arc commence, épaisseur des claveaux)]"""
    rangs = [(0.0, 0.52, 0.06, 1.0, 1.9)]; z = 0.52
    while z < hm - 0.75:
        hh = R.uniform(0.44, 0.52); rangs.append((z, hh, 0.0, 0.7, 1.45)); z += hh
    rangs.append((z, hm - z, 0.06, 1.1, 1.9))
    def ouvert(u, z0):
        for (uc, hw, zs, ev) in ouvertures:
            w = hw + ev
            if z0 < zs: lim = w
            elif z0 < zs + w: lim = math.sqrt(max(0.0, w * w - (z0 - zs) ** 2))
            else: continue
            if abs(u - uc) < lim: return (uc, lim)
        return None
    for k, (z0, hh, sail, lmin, lmax) in enumerate(rangs):
        u = u0 - R.uniform(0, lmin) - (k % 2) * lmin * 0.5
        while u < u1:
            w = R.uniform(lmin, lmax); a, b = max(u, u0), min(u + w, u1); u += w
            # (les blocs qui tombent dans une ouverture sont coupés à son bord)
            segs = [(a, b)]
            for (uc, hw, zs, ev) in ouvertures:
                ww = hw + ev; zz = max(z0, 0.0)
                lim = ww if zz < zs else (math.sqrt(max(0.0, ww * ww - (zz - zs) ** 2)) if zz < zs + ww else 0)
                if lim <= 0: continue
                nouv = []
                for (p, q) in segs:
                    if q <= uc - lim or p >= uc + lim: nouv.append((p, q)); continue
                    if p < uc - lim: nouv.append((p, uc - lim))
                    if q > uc + lim: nouv.append((uc + lim, q))
                segs = nouv
            for (p, q) in segs:
                if q - p < 0.14: continue
                haut = k == len(rangs) - 1
                c = pal(R, MUR_CLAIR if (haut or k == 0) else MUR, 0.08)
                if k == 0: c = tuple(v * 0.72 for v in c[:3]) + (1,)
                sl = sail + (R.choice((-0.03, 0.0, 0.0, 0.0, 0.035, 0.06)) if 0 < k < len(rangs) - 1 else 0.0)
                rep.bloc('bloc', p + 0.0175, q - 0.0175, -sl, EP, z0 + 0.0175, z0 + hh - 0.0175, m['mur'], c)
    # les claveaux et les montants de chaque ouverture
    for (uc, hw, zs, ev) in ouvertures:
        n = max(7, int(math.pi * (hw + ev / 2) / 0.42))
        for i in range(n):
            a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
            rep.coin_arc('claveau', uc, zs, hw, hw + ev, a0 + 0.012, a1 - 0.012, -0.08, EP, m['mur'], pal(R, MUR_CLAIR, 0.06))
        # la clé de voûte, un peu plus grande, en bronze
        rep.coin_arc('cle', uc, zs, hw - 0.02, hw + ev + 0.1, math.pi / 2 - 0.13, math.pi / 2 + 0.13, -0.16, EP, m['bronze'], None)
        z = 0.0
        while z < zs - 0.05:
            hh = min(R.uniform(0.42, 0.6), zs - z)
            for s in (-1, 1):
                ua, ub = (uc + s * hw, uc + s * (hw + ev))
                rep.bloc('montant', min(ua, ub) + 0.015, max(ua, ub) - 0.015, -0.08, EP, z + 0.015, z + hh - 0.015, m['mur'], pal(R, MUR_CLAIR, 0.06))
            z += hh
    if chape:   # la corniche, en haut
        rep.bloc('corniche', u0 - 0.05, u1 + 0.05, -0.12, EP + 0.1, hm, hm + 0.16, m['mur'], pal(R, MUR_CLAIR, 0.05), biseau=0.04)
        rep.bloc('liseré', u0 - 0.05, u1 + 0.05, -0.05, 0.02, hm - 1.42, hm - 1.3, m['bronze'], None, biseau=0.015)

# ====================== le sol ======================
def sol(m, R):
    boite('joints', (9, 4.6, -0.21), (22, 17, 0.3), m['joint'], srgb('#20251f'), biseau=0).pass_index = 1
    y = -2.4
    while y < RD + 1.2:
        rh = R.uniform(1.25, 2.0); x = -1.0 - R.uniform(0, 1.4)
        while x < RW + 1.0:
            w = R.uniform(1.5, 3.0)
            cases = [(y, rh)] if R.random() > 0.2 else [(y, rh / 2), (y + rh / 2, rh / 2)]
            for (yy, hh) in cases:
                cx, cy = x + w / 2, yy + hh / 2
                if cy < -0.1 and abs(cx - 9) > 3.2: continue          # (seulement le fond de la niche, derrière le mur)
                j = 0.055; dz = R.uniform(-0.014, 0.014)
                boite('dalle', (cx, cy, -0.15 + dz), (w - j, hh - j, 0.3), m['sol'], pal(R, SOL, 0.13), biseau=0.05, seg=2, rot=Matrix.Rotation(R.uniform(-0.012, 0.012), 3, 'Z')).pass_index = 1
            x += w
        y += rh
    # le grand cercle de bronze autour de l'armure (à moitié caché sous elle), et ses rivets
    for (r, e) in ((2.35, 0.07), (2.75, 0.045)):
        ob = tore('cercle', (ARMURE[0], ARMURE[1], 0.0), r, e, m['bronze'], None, axe='z', seg=64, sseg=6); ob.scale = (1, 0.35, 1)
    for i in range(28):
        a = i / 28 * math.tau
        if math.sin(a) < -0.35: continue
        boule('clou', (ARMURE[0] + math.cos(a) * 2.55, ARMURE[1] + math.sin(a) * 2.55, 0.01), 0.05, m['orr'], ecrase=(1, 1, 0.45), seg=8)

def rigoles(m, R):
    """l'énergie des lanternes vers l'armure : deux rigoles d'or et de rouge, creusées dans le sol"""
    for nom, (lx, ly), sx in (('or', LANTERNES['or'], 1), ('rouge', LANTERNES['rouge'], -1)):
        ax = ARMURE[0] - sx * 2.38 * 0.83; ay = ARMURE[1] + 2.38 * 0.56
        pts = [(lx + sx * 0.6, ly), (lx + sx * 2.3, ly), (lx + sx * 3.9, ly - 1.6), (ax - sx * 0.9, ay + 0.3), (ax, ay)]
        for k in range(len(pts) - 1):
            a, b = pts[k], pts[k + 1]
            planche('rigole_bord', (a[0], a[1], 0.0), (b[0], b[1], 0.0), 0.2, 0.045, m['bronze'], None, vers=(0, 0, 1))
            planche('rigole', (a[0], a[1], 0.025), (b[0], b[1], 0.025), 0.085, 0.03, m['rigole_' + nom], None, vers=(0, 0, 1))
            boule('noeud', (b[0], b[1], 0.02), 0.13, m['bronze'], ecrase=(1, 1, 0.4), seg=10)

# ====================== les murs ======================
def murs(m, R):
    mur(m, R, ARR, COIN - 0.45, RW - COIN + 0.45, [(NICHE[0], NICHE[1], NICHE[2], 0.5)])
    for rep in (GAUCHE, DROITE):
        mur(m, R, rep, -0.45, LW + 0.45, [(LW / 2, P_LARG, P_NAIS, 0.3)])
    # les murs bas des côtés (on voit le haut ; derrière, le noir)
    for s in (0, 1):
        xa, xb = (RW, RW + 0.9) if s else (-0.9, 0.0)
        ya, yb = COIN - 0.2, RD + 0.6
        boite('mur_cote', ((xa + xb) / 2, (ya + yb) / 2, 0.62), (xb - xa, yb - ya, 1.24), m['mur'], srgb('#2c3143'), biseau=0.02)
        y = ya
        while y < yb:
            L = min(R.uniform(0.8, 1.4), yb - y)
            boite('chape', ((xa + xb) / 2, y + L / 2, 1.31 + R.uniform(-0.012, 0.012)), (xb - xa + 0.08, L - 0.04, 0.14), m['mur'], pal(R, MUR_CLAIR, 0.08), biseau=0.04)
            y += L
    # le bord de devant : une marche, et le noir
    x = -0.9
    while x < RW + 0.9:
        L = min(R.uniform(0.9, 1.6), RW + 0.9 - x)
        boite('marche', (x + L / 2, RD + 0.42, -0.06 + R.uniform(-0.01, 0.01)), (L - 0.04, 0.5, 0.2), m['mur'], pal(R, MUR_CLAIR, 0.08), biseau=0.04)
        x += L
    boite('vide', (9, RD + 2.2, -1.2), (24, 3, 0.3), m['noir'], biseau=0)
    # les gros piliers aux angles (là où le mur en biais rejoint le mur bas)
    for (x, y) in ((-0.15, COIN - 0.1), (RW + 0.15, COIN - 0.1)):
        boite('pilier', (x, y, HM / 2), (1.0, 1.0, HM), m['mur'], pal(R, MUR, 0.06), biseau=0.05)
        boite('socle_pilier', (x, y, 0.25), (1.2, 1.2, 0.5), m['mur'], pal(R, MUR_CLAIR, 0.06), biseau=0.05)
        boite('chapiteau', (x, y, HM + 0.1), (1.25, 1.25, 0.3), m['mur'], pal(R, MUR_CLAIR, 0.06), biseau=0.05)
        for z in (1.5, 3.1, 4.7): boite('bague', (x, y, z), (1.06, 1.06, 0.1), m['bronze'], None, biseau=0.02)

def niche(m, R):
    """la niche derrière l'armure : un fond de tuyaux, le grand anneau du drainage, son cœur d'or et de rouge"""
    uc, hw, zs = NICHE; yb = -2.3
    boite('fond_niche', (uc, yb - 0.1, HM / 2), (2 * hw + 1.2, 0.2, HM), m['mur'], srgb('#272b3a'), biseau=0.02)
    for (x, r, c) in ((6.55, 0.16, 'bronze'), (7.1, 0.11, 'cuivre'), (7.55, 0.14, 'bronze'), (10.45, 0.14, 'bronze'), (10.9, 0.11, 'cuivre'), (11.45, 0.16, 'bronze')):
        tour('tuyau', [(r, 0.0), (r, zs + hw - 0.25)], (x, yb + 0.25, 0.0), m[c], seg=14)
        for z in (0.6, 1.8, 3.0, 4.2):
            if z < zs + hw - 0.4: tour('collier', [(r + 0.03, z), (r + 0.03, z + 0.09)], (x, yb + 0.25, 0.0), m['fer'], seg=14)
    # le grand anneau, debout, au fond (on le voit au-dessus des épaules de l'armure)
    tore('anneau', (uc, yb + 0.3, 4.15), 1.25, 0.13, m['bronze'], None, axe='y', seg=48, sseg=8)
    tore('anneau2', (uc, yb + 0.32, 4.15), 0.92, 0.07, m['orr'], None, axe='y', seg=40, sseg=6)
    for i in range(8):
        a = i / 8 * math.tau
        planche('rayon', (uc + math.cos(a) * 0.35, yb + 0.33, 4.15 + math.sin(a) * 0.35), (uc + math.cos(a) * 1.15, yb + 0.33, 4.15 + math.sin(a) * 1.15), 0.09, 0.06, m['fer'], None)
    boule('coeur', (uc, yb + 0.45, 4.15), 0.34, m['coeur'], seg=16)
    # les gros tuyaux qui descendent du cœur vers le dos de l'armure
    for s in (-1, 1):
        planche('tuyau_dos', (uc + s * 0.35, yb + 0.45, 3.85), (uc + s * 0.55, -0.4, 3.1), 0.2, 0.2, m['cuivre'], None, vers=(0, 1, 0))
    # des chaînes qui pendent du haut de la niche
    for (x, n) in ((6.9, 6), (8.1, 4), (9.9, 5), (11.1, 7)):
        for i in range(n):
            z = zs + hw - 0.15 - i * 0.19
            tore('maillon', (x, yb + 0.6, z), 0.07, 0.022, m['fer'], None, axe='x' if i % 2 else 'y', seg=10, sseg=5)
    lampe('niche', (uc, yb + 1.2, 4.0), REG['niche'], (1.0, 0.62, 0.3), 0.5)

def pilastres(m, R):
    """les deux grands pilastres de chaque côté de la niche, et leurs brasiers"""
    for x in (NICHE[0] - NICHE[1] - 0.95, NICHE[0] + NICHE[1] + 0.95):
        boite('pilastre', (x, 0.18, HM / 2), (0.86, 0.5, HM), m['mur'], pal(R, MUR, 0.05), biseau=0.04)
        boite('base_pilastre', (x, 0.26, 0.22), (1.06, 0.66, 0.44), m['mur'], pal(R, MUR_CLAIR, 0.05), biseau=0.04)
        boite('chapiteau', (x, 0.24, HM - 0.12), (1.05, 0.62, 0.26), m['mur'], pal(R, MUR_CLAIR, 0.05), biseau=0.04)
        for z in (1.2, 4.3): boite('bague', (x, 0.44, z), (0.9, 0.08, 0.1), m['bronze'], None, biseau=0.02)
        brasier(m, x, 0.75, 2.6)

BRASIERS = [(NICHE[0] - NICHE[1] - 0.95, 0.75, 2.6), (NICHE[0] + NICHE[1] + 0.95, 0.75, 2.6), (0.42, COIN + 0.45, 2.3), (RW - 0.42, COIN + 0.45, 2.3)]

def brasier(m, x, y, z):
    planche('bras', (x, y - 0.42, z - 0.5), (x, y, z - 0.12), 0.07, 0.06, m['fer'], None, vers=(1, 0, 0))
    tour('coupe', [(0.0, -0.32), (0.05, -0.32), (0.09, -0.27), (0.22, -0.04), (0.25, 0.0), (0.21, 0.0), (0.16, -0.06), (0.0, -0.1)], (x, y, z), m['bronze'], seg=16)
    tour('braises', [(0.0, -0.05), (0.19, -0.05), (0.0, -0.03)], (x, y, z), m['braise'], seg=12)
    lampe('feu', (x, y + 0.25, z + 0.4), REG['brasier'], (1.0, 0.55, 0.22), 0.15)

def portes(m, R):
    """une porte au milieu de chaque mur en biais : le couloir sombre, les battants (fermés : A ; ouverts : C), l'œil au-dessus"""
    for i, rep in enumerate((GAUCHE, DROITE)):
        uc = LW / 2
        # le couloir : un fond, un sol, un peu de lumière rouge qui vient de loin
        rep.bloc('couloir_fond', uc - 1.2, uc + 1.2, EP + 1.4, EP + 1.6, 0, P_NAIS + P_LARG + 0.4, m['couloir'], None, biseau=0)
        rep.bloc('couloir_sol', uc - 1.2, uc + 1.2, 0.0, EP + 1.5, -0.2, 0.0, m['sol'], srgb('#4a4440'), biseau=0)
        for s in (-1, 1):
            rep.bloc('couloir_mur', uc + s * (P_LARG + 0.05) - 0.06, uc + s * (P_LARG + 0.05) + 0.06, EP, EP + 1.5, 0, P_NAIS + P_LARG, m['mur'], srgb('#2a2e3c'), biseau=0)
        # les battants fermés (collection porteA) et ouverts (porteC)
        for etat in ('A', 'C'):
            for s in (-1, 1):
                L = P_LARG - 0.02
                if etat == 'A':
                    u0, u1 = (uc - L, uc - 0.01) if s < 0 else (uc + 0.01, uc + L)
                    rep.bloc('battant', min(u0, u1), max(u0, u1), 0.3, 0.42, 0.02, P_NAIS + 0.35, m['bois'], pal(R, ['#7a5530', '#6b4826'], 0.05), biseau=0.02, coll='porte' + etat)
                    for z in (0.35, 1.05, 1.6):
                        rep.bloc('ferrure', min(u0, u1) + 0.03, max(u0, u1) - 0.03, 0.27, 0.31, z, z + 0.09, m['fer'], None, biseau=0.01, coll='porte' + etat)
                else:   # ouverts : rabattus contre les murs du couloir
                    ua = uc + s * (P_LARG - 0.04)
                    rep.bloc('battant', ua - 0.06, ua + 0.06, 0.5, 0.5 + L, 0.02, P_NAIS + 0.35, m['bois'], pal(R, ['#7a5530', '#6b4826'], 0.05), biseau=0.02, coll='porte' + etat)
        # l'œil de bronze au-dessus de la porte (il s'allume quand un réparateur arrive : le jeu le dessine)
        c = rep.P(uc, -0.12, P_NAIS + P_LARG + 0.62)
        boule('oeil_monture', c, 0.15, m['bronze'], ecrase=(1, 0.5, 1), seg=12)
        boule('oeil', rep.P(uc, -0.18, P_NAIS + P_LARG + 0.62), 0.085, m['oeil'], ecrase=(1, 0.6, 1), seg=10)
        L = lampe('couloir', rep.P(uc, EP + 1.0, 1.4), REG['couloir'], (1.0, 0.32, 0.12), 0.3, coll='porteC')

def lanterne(m, R, nom, x, y, coll):
    """une des deux lanternes : un socle de pierre, un pied de bronze, une grande lanterne à pagode (la lumière : dorée ou rouge)"""
    tour('socle', [(0.0, 0.0), (0.56, 0.0), (0.56, 0.18), (0.5, 0.22), (0.44, 0.22), (0.42, 0.42), (0.47, 0.46), (0.0, 0.46)], (x, y, 0.0), m['mur'], srgb('#5b5f74'), coll=coll, seg=8, lisse=False)
    tour('pied', [(0.0, 0.46), (0.2, 0.46), (0.2, 0.52), (0.08, 0.58), (0.07, 1.42), (0.18, 1.5), (0.0, 1.52)], (x, y, 0.0), m['bronze'], coll=coll, seg=16)
    zc = 1.95
    for i in range(6):
        a = i / 6 * math.tau + 0.26
        boite('montant', (x + math.cos(a) * 0.28, y + math.sin(a) * 0.28, zc), (0.045, 0.045, 0.82), m['bronze'], coll=coll, biseau=0.01)
    tour('verre', [(0.0, zc - 0.38), (0.24, zc - 0.36), (0.27, zc), (0.24, zc + 0.36), (0.0, zc + 0.38)], (x, y, 0.0), m['verre_' + nom], coll=coll, seg=16)
    tour('bas_lanterne', [(0.0, zc - 0.5), (0.34, zc - 0.46), (0.36, zc - 0.4), (0.0, zc - 0.38)], (x, y, 0.0), m['orr'], coll=coll, seg=6, lisse=False)
    tour('toit', [(0.0, zc + 0.4), (0.46, zc + 0.4), (0.44, zc + 0.46), (0.2, zc + 0.62), (0.12, zc + 0.78), (0.05, zc + 0.96), (0.0, zc + 1.0)], (x, y, 0.0), m['orr'], coll=coll, seg=6, lisse=False)
    boule('pointe', (x, y, zc + 1.03), 0.06, m['orr'], coll=coll, seg=8)
    lampe('lanterne_' + nom, (x + (0.55 if x < 9 else -0.55), y + 0.35, zc + 0.05), REG['lanterne'], (1.0, 0.72, 0.32) if nom == 'or' else (1.0, 0.26, 0.14), 0.25)

def gravats(m, R):
    """les cailloux tombés du plafond, le long des murs (hors du chemin)"""
    tas = [(4.0, 0.5, 6), (14.0, 0.5, 6), (2.2, 1.0, 4), (15.8, 1.0, 4), (0.55, 3.9, 5), (17.45, 3.9, 5), (0.45, 9.3, 4), (17.55, 8.6, 5), (0.5, 6.8, 2), (17.5, 6.6, 2), (6.6, 0.35, 3), (11.4, 0.35, 3)]
    for (x, y, n) in tas:
        for i in range(n):
            r = R.uniform(0.09, 0.3) * (1.3 if i == 0 else 1)
            rocher('caillou', (x + R.uniform(-0.45, 0.45), y + R.uniform(-0.25, 0.25), r * 0.4), r, m['roc'], pal(R, MUR_CLAIR, 0.1), R=R, aplati=0.7)
    for i in range(26):   # de petits éclats partout sur le sol, très bas
        x, y = R.uniform(0.6, RW - 0.6), R.uniform(1.0, RD - 0.3)
        if (x - ARMURE[0]) ** 2 + (y - ARMURE[1]) ** 2 < 6: continue
        r = R.uniform(0.04, 0.09)
        rocher('eclat', (x, y, r * 0.3), r, m['roc'], pal(R, MUR_CLAIR, 0.1), R=R, aplati=0.6, sub=1)

# ====================== les rochers qui tombent (rendus un par un, le jeu les pose où il veut) ======================
ROCS = 6
import bmesh
def roc_casse(nom, c, r, h, mat, coul, coll, R, cube=False, coupes=4):
    """un rocher cassé : une boule cabossée (ou un bloc taillé) dont on a fait sauter des éclats (des faces plates, des arêtes vives)"""
    bm = bmesh.new()
    if cube:
        bmesh.ops.create_cube(bm, size=1.6)
        bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=3, use_grid_fill=True)
        for v in bm.verts: v.co = Vector((v.co.x + R.uniform(-0.025, 0.025), v.co.y + R.uniform(-0.025, 0.025), v.co.z + R.uniform(-0.025, 0.025)))
    else:
        bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
        axes = [Vector((R.uniform(-1, 1), R.uniform(-1, 1), R.uniform(-0.6, 1))).normalized() for _ in range(9)]
        amp = [R.uniform(-0.3, 0.3) for _ in axes]
        for v in bm.verts:
            n = v.co.normalized(); k = 1.0
            for a, mm in zip(axes, amp): k += mm * max(0.0, n.dot(a)) ** 3
            v.co = n * k
    for i in range(coupes):
        a = R.uniform(0, math.tau); el = R.uniform(-0.15, 0.9)
        nrm = Vector((math.cos(a) * math.cos(el), math.sin(a) * math.cos(el), math.sin(el))).normalized()
        d = R.uniform(0.5, 0.78)
        res = bmesh.ops.bisect_plane(bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces), plane_co=nrm * d, plane_no=nrm, clear_outer=True)
        ed = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
        if ed: bmesh.ops.holes_fill(bm, edges=ed)
    nrm = Vector((0, 0, -1)); res = bmesh.ops.bisect_plane(bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces), plane_co=Vector((0, 0, -0.82)), plane_no=nrm, clear_outer=True)
    ed = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
    if ed: bmesh.ops.holes_fill(bm, edges=ed)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    zs = [v.co.z for v in bm.verts]; z0, z1 = min(zs), max(zs)
    for v in bm.verts: v.co = Vector((v.co.x * r, v.co.y * r * 0.9, (v.co.z - z0) / (z1 - z0) * h))
    me = bpy.data.meshes.new(nom); bm.to_mesh(me); bm.free(); B._fini(me, True, 24)
    ob = bpy.data.objects.new(nom, me); ob.location = G(*c); ob.rotation_euler = (0, 0, R.uniform(0, 6.28))
    me.materials.append(mat); ob.color = coul
    return B.poser(ob, coll)

def roc_tombe(m, i, x=9.0, y=6.0):
    """un rocher tombé du plafond : 1,2 pas de large, 1,15 de haut (REG.colonnes) ; les deux derniers sont des morceaux de voûte taillés"""
    R = random.Random(300 + i); coll = 'roc_%d' % i
    if i < 4:
        roc_casse('roc', (x, y, 0.0), 0.62, 1.12, m['roc'], pal(R, ROC, 0.08), coll, R, coupes=5)
        for k in range(R.randint(1, 3)):   # des éclats tombés avec lui
            a = R.uniform(0, math.tau)
            roc_casse('roc_bout', (x + math.cos(a) * 0.55, y + abs(math.sin(a)) * 0.35, 0.0), R.uniform(0.14, 0.24), R.uniform(0.15, 0.28), m['roc'], pal(R, ROC, 0.1), coll, R, coupes=3)
    else:   # un bloc de la voûte : des faces taillées, une moulure, des coins cassés
        roc_casse('bloc_voute', (x, y, 0.0), 0.56, 1.05, m['mur'], pal(R, ROC, 0.06), coll, R, cube=True, coupes=3)
        for k in range(3):
            roc_casse('eclat_voute', (x + R.uniform(-0.6, 0.6), y + R.uniform(0.3, 0.5), 0.0), R.uniform(0.1, 0.18), R.uniform(0.1, 0.2), m['roc'], pal(R, ROC, 0.1), coll, R, coupes=2)

# ====================== la lumière ======================
def W(x, y, z): return Vector((x, -y, z * ZS))

def lumieres(m, R):
    sc = bpy.context.scene
    w = bpy.data.worlds.new('monde'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.045, 0.055, 0.15, 1); bg.inputs['Strength'].default_value = REG['monde']
    for (x, y, z) in BRASIERS[2:]: brasier(m, x, y, z)
    # la lumière d'or de l'armure (son cœur, ses lanternes d'épaule) : une flaque chaude devant elle
    A = bpy.data.lights.new('armure', 'AREA'); A.shape = 'DISK'; A.size = 2.4; A.energy = REG['armure']; A.color = (1.0, 0.7, 0.36)
    ob = bpy.data.objects.new('armure', A); sc.collection.objects.link(ob); ob.location = W(ARMURE[0], ARMURE[1] + 0.9, 3.2)
    ob.rotation_euler = (W(ARMURE[0], ARMURE[1] + 3.6, 0) - W(ARMURE[0], ARMURE[1] + 0.9, 3.2)).to_track_quat('-Z', 'Y').to_euler()
    # le puits de lumière froide : une fente dans la voûte (d'où tombent les rochers), qui éclaire le milieu de la salle
    Sp = bpy.data.lights.new('puits', 'SPOT'); Sp.energy = REG['puits']; Sp.color = (0.56, 0.7, 1.0); Sp.spot_size = math.radians(24); Sp.spot_blend = 0.6; Sp.shadow_soft_size = 0.4
    ob = bpy.data.objects.new('puits', Sp); sc.collection.objects.link(ob); ob.location = W(7.0, 3.0, 16)
    ob.rotation_euler = (W(8.4, 6.6, 0) - W(7.0, 3.0, 16)).to_track_quat('-Z', 'Y').to_euler()
    # un jour très faible de notre côté, sans ombre
    Dv = bpy.data.lights.new('devant', 'SUN'); Dv.energy = 0.7; Dv.color = (1.0, 0.9, 0.8); Dv.use_shadow = False
    ob = bpy.data.objects.new('devant', Dv); sc.collection.objects.link(ob)
    ob.rotation_euler = (W(9, 4, 0) - W(9, 24, 8)).normalized().to_track_quat('-Z', 'Y').to_euler()
    Am = bpy.data.lights.new('ambiance', 'AREA'); Am.shape = 'RECTANGLE'; Am.size = 16; Am.size_y = 9; Am.energy = REG['ambiance']; Am.color = (0.62, 0.7, 1.0)
    ob = bpy.data.objects.new('ambiance', Am); sc.collection.objects.link(ob); ob.location = W(9, 5.5, 11)
    F = bpy.data.lights.new('face', 'AREA'); F.shape = 'RECTANGLE'; F.size = 24; F.size_y = 9; F.energy = REG['face']; F.color = (0.74, 0.78, 1.0)
    ob = bpy.data.objects.new('face', F); sc.collection.objects.link(ob); ob.location = W(9, 26, 9)
    ob.rotation_euler = (W(9, 4, 1.2) - W(9, 26, 9)).to_track_quat('-Z', 'Y').to_euler()

def construire(graine=11):
    sc = B.raz(); R = random.Random(graine); m = M()
    sol(m, R); rigoles(m, R); murs(m, R); niche(m, R); pilastres(m, R); portes(m, R); gravats(m, R)
    lanterne(m, R, 'or', *LANTERNES['or'], coll='obs_00')
    lanterne(m, R, 'rouge', *LANTERNES['rouge'], coll='obs_01')
    for i in range(ROCS): roc_tombe(m, i)
    lumieres(m, R)
    B.camera()
    return sc
