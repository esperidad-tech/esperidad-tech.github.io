# L'arrière-salle du combat du Pisteur, construite en volume. Les mesures sont celles du jeu (src/monde.js, src/salle.js).
import bpy, bmesh, math, random
from mathutils import Vector, Matrix
import base as B
from base import G, srgb, varier, boite, planche, tour, boule, rivet, rocher, maille, decouper, lampe, sans_ombre, RW, RD, Y0, HM, ZS
from formes2 import prisme, tore, tissu, transformer, pivot_z, disque_uv, fanion
import os
ICI = os.path.dirname(os.path.abspath(__file__))

REG = dict(ambiance=200, face=1500, pilier=260, torche=520, lanterne=800, lune_g=18.0, lune_d=12.0, monde=0.5, lustre=3500, devant=0.9, oeil=260, couloir=620)
PORTES = [8.0, 18.0]                 # là où sortent les renforts (src/vagues.js)
P_LARG, P_NAIS, P_EP = 1.3, 1.9, 0.8  # demi-largeur d'une porte, hauteur où l'arc commence, épaisseur du mur
TORCHES = [(2.4, 2.55), (10.12, 2.9), (15.88, 2.9), (23.6, 2.55)]
LAMPES = [(-0.5, 6.2, 2.3), (26.5, 12.4, 2.3)]
OBS0 = [
    dict(k='pilier', c=1, x=5, y=4.9, r=0.75, h=4.3), dict(k='pilier', c=1, x=21, y=4.9, r=0.75, h=4.3),
    dict(k='pilier', c=1, x=5.2, y=13.7, r=0.75, h=4.3), dict(k='pilier', c=1, x=20.8, y=13.7, r=0.75, h=4.3),
    dict(k='pan', x=8.9, y=8.0, w=3.4, d=0.8, h=2.3), dict(k='pan', x=17.6, y=11.2, w=3.4, d=0.8, h=2.3),
    dict(k='tonneaux', x=16.6, y=6.2, w=3.2, d=1.2, h=0.9),
    dict(k='muret', x=9.4, y=12.4, w=0.8, d=2.8, h=1.0), dict(k='muret', x=14.9, y=14.7, w=2.8, d=0.8, h=1.0),
    dict(k='gravats', c=1, x=10.3, y=4.3, r=1.0, h=0.7), dict(k='gravats', c=1, x=3.3, y=9.3, r=0.85, h=0.6),
    dict(k='chariot', x=21.4, y=8.3, w=2.4, d=1.3, h=1.1),
    dict(k='caisse', x=7.1, y=15.8, w=1.5, d=1.5, h=1.1), dict(k='caisse', x=18.6, y=16.1, w=1.4, d=1.4, h=1.1),
]

SOL = ['#a89a86', '#9d8367', '#8e8d93', '#7e89a4', '#8d818f', '#b39d7b', '#98917f', '#86837d', '#a08f7a', '#7c8496']
MUR = ['#3f455b', '#484e66', '#383d52', '#42485f', '#4d5068', '#3a4056', '#51495a', '#454b63']
MUR_CLAIR = ['#6c7088', '#757a92', '#62677f', '#7a7790']
RUINE = ['#6d7388', '#787d92', '#646a80', '#7f7f8c', '#5c6278', '#858294']
BOIS = ['#b0803f', '#a37236', '#96652e', '#bb8a48', '#8a5a2b']
BOIS_SOMBRE = ['#6b4524', '#5c3a1e', '#74502c', '#52331a']

def M():
    """toutes les matières de la salle"""
    return dict(
        sol=B.pierre('sol', rug=0.78, relief=0.3, fissures=0.6, grain=0.9, poli=0.2, patine=0.3),
        joint=B.pierre('joint', rug=0.95, relief=0.5, fissures=0.0, grain=2.0, patine=0.5),
        mur=B.pierre('mur', rug=0.86, relief=0.45, fissures=0.6, mousse=0.7, salete=0.5),
        ruine=B.pierre('ruine', rug=0.88, relief=0.5, fissures=0.9, mousse=0.5, salete=0.25),
        roc=B.pierre('roc', rug=0.9, relief=0.6, fissures=0.3, grain=1.6),
        bois=B.bois('bois'), bois_y=B.bois('bois_y'), bois_z=B.bois('bois_z'),
        fer=B.metal('fer', '#3b3f4a', rug=0.5, patine='#17181d'),
        bronze=B.metal('bronze', '#c8963f', rug=0.34, patine='#6a4a22'),
        orr=B.metal('or', '#f0c868', rug=0.28, patine='#9a6f2a'),
        braise=B.braise('braise', 1.6, '#ff5a0c', '#ffc040', 7.0), minerai=B.braise('minerai', 1.8, '#ff4a12', '#ffb050', 5.0),
        noir=B.uni('noir', '#07080b', rug=1.0),
        toile=B.uni('toile', None, rug=0.95, objet=True),
        couleur=B.uni('couleur', None, rug=0.55, objet=True),
        verre=B.uni('verre', None, rug=0.12, objet=True),
        potion=B.uni('potion', None, rug=0.3, objet=True, lueur='objet', force=5.0),
        cristal_eteint=B.uni('cristal_eteint', '#3a0c0c', rug=0.15),
        cristal_allume=B.uni('cristal_allume', '#ff5a20', rug=0.3, lueur='#ff3a08', force=2.4),
        flamme=B.uni('flamme', '#ffb040', rug=0.3, lueur='#ffb040', force=6.0),
        feu_couloir=B.uni('feu_couloir', '#ff5a20', rug=1.0, lueur='#ff6a20', force=3.0),
        tapis=B.image('tapis', os.path.join(ICI, 'tex', 'tapis_long.png'), rug=0.95, relief=0.25, alpha=True),
        rond=B.image('rond', os.path.join(ICI, 'tex', 'tapis_rond.png'), rug=0.95, relief=0.25, alpha=True),
        banniere=B.image('banniere', os.path.join(ICI, 'tex', 'banniere.png'), rug=0.9, relief=0.15, alpha=True),
    )

def _bois_axes():
    # les veines suivent l'axe X de la pièce ; pour les planches debout ou en profondeur, on tourne le grain
    for nom, ech in (('bois_y', (9, 0.5, 9)), ('bois_z', (9, 9, 0.5))):
        m = B.MATS[nom]
        for n in m.node_tree.nodes:
            if n.type == 'VECT_MATH' and n.operation == 'MULTIPLY' and tuple(round(v, 2) for v in n.inputs[1].default_value) == (0.5, 9.0, 9.0):
                n.inputs[1].default_value = ech

def pal(R, P, dv=0.07): return varier(srgb(R.choice(P)), R, dv)

# ====================== le sol ======================
def sol(m, R):
    boite('joints', (13, 8.6, -0.21), (30.4, 21.4, 0.3), m['joint'], srgb('#232a22'), biseau=0).pass_index = 1
    y = Y0 - 1.0; rang = 0
    while y < RD + 0.5:
        rh = R.uniform(1.45, 2.0); x = -1.3 - R.uniform(0, 1.6)
        while x < RW + 1.3:
            w = R.uniform(1.5, 3.2)
            cases = [(y, rh)] if R.random() > 0.2 else [(y, rh / 2), (y + rh / 2, rh / 2)]
            for (yy, hh) in cases:
                j = 0.055; dz = R.uniform(-0.014, 0.014)
                boite('dalle', (x + w / 2, yy + hh / 2, -0.15 + dz), (w - j, hh - j, 0.3), m['sol'], pal(R, SOL, 0.09), biseau=0.04, seg=2).pass_index = 1
            x += w
        y += rh; rang += 1

# ====================== le mur du fond, ses deux portes ======================
def dans_porte(x, z, marge=0.0):
    for dx in PORTES:
        u = abs(x - dx)
        if u < P_LARG + marge:
            if z < P_NAIS: return True
            if (x - dx) ** 2 + (z - P_NAIS) ** 2 < (P_LARG + marge) ** 2: return True
    return False

def contour_porte(dx, marge=0.0, n=20, z0=-0.3):
    r = P_LARG + marge; pts = [(dx - r, z0)]
    pts += [(dx - r * math.cos(i / n * math.pi), P_NAIS + r * math.sin(i / n * math.pi)) for i in range(n + 1)]
    pts.append((dx + r, z0))
    return pts

def mur_fond(m, R):
    x0, x1, yc = -1.05, RW + 1.05, Y0 - P_EP / 2
    coupes = [prisme('coupe', contour_porte(dx), Y0 - 1.6, Y0 + 0.6, None, coll='outils', biseau=0) for dx in PORTES]
    rangs = [(0.0, 0.56, 0.07, 1.0, 1.9)]
    z = 0.56
    for hh in (0.47, 0.45, 0.48, 0.46, 0.47, 0.46, 0.51): rangs.append((z, hh, 0.0, 0.7, 1.45)); z += hh
    z_bande = z                                       # 3,86 : le bandeau de bronze
    rangs.append((z_bande + 0.18, 0.23, 0.0, 0.5, 0.9))
    rangs.append((z_bande + 0.41, HM - z_bande - 0.41, 0.07, 1.1, 1.9))
    for k, (z0, hh, sail, lmin, lmax) in enumerate(rangs):
        x = x0 - R.uniform(0, lmin) - (k % 2) * lmin * 0.5
        while x < x1:
            w = R.uniform(lmin, lmax); a, b = max(x, x0), min(x + w, x1); x += w
            if b - a < 0.12: continue
            coins = [dans_porte(px_, pz_) for px_ in (a, b) for pz_ in (z0, z0 + hh)]
            if all(coins) and dans_porte((a + b) / 2, z0 + hh): continue
            haut = k == len(rangs) - 1
            c = pal(R, MUR_CLAIR if (haut or k == 0) else MUR, 0.08)
            if k == 0: c = tuple(v * 0.72 for v in c[:3]) + (1,)
            sl = sail + (R.choice((-0.03, 0.0, 0.0, 0.0, 0.035, 0.06)) if 0 < k < len(rangs) - 2 else 0.0)
            ob = boite('bloc', ((a + b) / 2, yc + sl / 2, z0 + hh / 2), (b - a - 0.035, P_EP + sl, hh - 0.035), m['mur'], c, biseau=0.035)
            touche = any(coins) or any(dans_porte(a + (b - a) * t, z0 + hh * s) for t in (0.25, 0.5, 0.75) for s in (0, 0.5, 1))
            if touche:
                for cp in coupes:
                    if not decouper(ob, cp): bpy.data.objects.remove(ob); ob = None; break
    # le bandeau de bronze et ses rivets
    boite('bandeau', (13, Y0 + 0.02, z_bande + 0.09), (x1 - x0, 0.14, 0.15), m['bronze'], biseau=0.025)
    xx = x0 + 0.3
    while xx < x1: rivet((xx, Y0 + 0.1, z_bande + 0.09), 0.045, m['orr']); xx += 0.62
    boite('liseré', (13, Y0 + 0.03, HM - 0.02), (x1 - x0, 0.2, 0.06), m['bronze'], biseau=0.015)
    for cp in coupes: bpy.data.objects.remove(cp)
    for dx in PORTES: porte(m, R, dx)

def porte(m, R, dx):
    """l'encadrement de pierre claire, le couloir derrière, les battants (fermés et ouverts), l'œil de bronze au-dessus"""
    yf = Y0 + 0.13; yb = Y0 - 0.26; rin, rex = P_LARG, P_LARG + 0.42
    # les piédroits
    for s in (-1, 1):
        z = 0.0
        for hh in (0.52, 0.46, 0.48, 0.44):
            xa = dx + s * rin; xb = dx + s * rex
            boite('piedroit', ((xa + xb) / 2, (yf + yb) / 2, z + hh / 2), (abs(xb - xa) - 0.03, yf - yb, hh - 0.03), m['mur'], pal(R, MUR_CLAIR, 0.07), biseau=0.04)
            z += hh
    # les claveaux de l'arc
    n = 9
    for i in range(n):
        a0 = math.pi * i / n + 0.012; a1 = math.pi * (i + 1) / n - 0.012; cle = i == n // 2
        re = rex + (0.16 if cle else 0.0); ri = rin - (0.03 if cle else 0.0)
        pts = [(dx - ri * math.cos(a0), P_NAIS + ri * math.sin(a0)), (dx - ri * math.cos(a1), P_NAIS + ri * math.sin(a1)),
               (dx - re * math.cos(a1), P_NAIS + re * math.sin(a1)), (dx - re * math.cos(a0), P_NAIS + re * math.sin(a0))]
        prisme('claveau', pts, yb, yf + (0.05 if cle else 0), m['mur'], pal(R, MUR_CLAIR, 0.07), biseau=0.04)
    # la clé de l'arc : une plaque de bronze et un œil de cristal (éteint, ou allumé quand les renforts arrivent)
    zc = P_NAIS + (rin + rex) / 2 + 0.06
    tr = tour('plaque_oeil', [(0.0, 0), (0.31, 0), (0.31, 0.05), (0.24, 0.1), (0.0, 0.1)], (dx, yf + 0.05, zc), m['bronze'], seg=20)
    tr.rotation_euler = (math.pi / 2, 0, 0); tr.scale = (1, 1, 1)
    for etat, mat in (('signal_off', m['cristal_eteint']), ('signal_on', m['cristal_allume'])):
        o = boule('oeil', (dx, yf + 0.13, zc), 0.19, mat, None, etat, ecrase=(1, 0.6, 1), seg=14); o.pass_index = tr.pass_index
    lampe('lum_oeil', (dx, yf + 1.1, zc - 0.2), REG['oeil'], (1.0, 0.3, 0.1), 0.15, 'signal_on')
    # le couloir : un sol de dalles, deux murs de blocs, et au fond la lueur des forges (allumée quand les renforts arrivent)
    yc0 = Y0 - P_EP; z = 0.0
    for s_ in (-1, 1):
        zz = 0.0
        while zz < 3.6:
            yy = yc0
            while yy > yc0 - 5.4:
                L_ = R.uniform(0.8, 1.4)
                boite('bloc_couloir', (dx + s_ * (rin + 0.35), yy - L_ / 2, zz + 0.24), (0.7, L_ - 0.03, 0.46), m['mur'], pal(R, MUR, 0.08), biseau=0.03)
                yy -= L_
            zz += 0.48
    yy = Y0 - 1.0
    while yy > yc0 - 5.4:
        L_ = R.uniform(1.1, 1.7)
        for (xa, xb) in ((dx - rin, dx - 0.2 + R.uniform(-0.3, 0.3)), (None, dx + rin)):
            if xa is None: xa = prec
            boite('dalle_couloir', ((xa + xb) / 2, yy - L_ / 2, -0.15), (xb - xa - 0.05, L_ - 0.05, 0.3), m['sol'], pal(R, SOL, 0.09), biseau=0.04).pass_index = 1
            prec = xb
        yy -= L_
    boite('couloir_plafond', (dx, yc0 - 2.7, 4.3), (2 * rin + 1.4, 5.4, 0.3), m['noir'], biseau=0)
    boite('couloir_fond', (dx, yc0 - 5.3, 1.5), (2 * rin, 0.2, 3.2), m['feu_couloir'], coll='signal_on', biseau=0)
    lampe('lum_couloir', (dx, yc0 - 3.3, 1.3), REG['couloir'], (1.0, 0.36, 0.1), 0.4, 'signal_on')
    # les battants
    for etat, angle in (('porteA', 0.0), ('porteC', math.radians(68))):
        for s in (-1, 1):
            objs = battant(m, R, dx, s, etat)
            if angle: transformer(objs, pivot_z(dx + s * (rin - 0.02), yb - 0.08, -s * angle))

def battant(m, R, dx, s, coll):
    """un battant : cinq planches debout coupées en arc, trois ferrures, un anneau"""
    R2 = random.Random(int(dx * 10) + (3 if s > 0 else 7)); objs = []
    y1 = Y0 - 0.28; y0 = y1 - 0.13; jeu = 0.022; n = 5; lw = (P_LARG - jeu) / n
    ztop = lambda x: P_NAIS + math.sqrt(max(0.0, (P_LARG - 0.03) ** 2 - (x - dx) ** 2)) - 0.02
    for i in range(n):
        xa = dx + s * (jeu + i * lw); xb = dx + s * (jeu + (i + 1) * lw - 0.012)
        if xa > xb: xa, xb = xb, xa
        xm = (xa + xb) / 2
        pts = [(xa, 0.07), (xb, 0.07), (xb, ztop(xb)), (xm, ztop(xm)), (xa, ztop(xa))]
        o = prisme('planche_porte', pts, y0, y1, m['bois_z'], pal(R2, BOIS_SOMBRE, 0.12), coll, biseau=0.02)
        if o: objs.append(o)
    for zb in (0.42, 1.08, 1.72):
        xa = dx + s * 0.06; xb = dx + s * (P_LARG - 0.05)
        objs.append(boite('ferrure', ((xa + xb) / 2, y1 + 0.02, zb), (abs(xb - xa), 0.05, 0.2), m['fer'], None, coll, biseau=0.018))
        k = 0.2
        while k < P_LARG - 0.15:
            objs.append(rivet((dx + s * k, y1 + 0.05, zb), 0.05, m['fer'], coll)); k += 0.26
    # l'anneau, sur sa plaque
    xa = dx + s * 0.3
    pl = tour('plaque', [(0.0, 0), (0.15, 0), (0.15, 0.03), (0.0, 0.04)], (xa, y1 + 0.05, 1.42), m['bronze'], None, coll, seg=14); pl.rotation_euler = (math.pi / 2, 0, 0); objs.append(pl)
    an = tore('anneau', (xa, y1 + 0.1, 1.27), 0.15, 0.028, m['fer'], None, coll, axe='y'); objs.append(an)
    return objs

# ====================== les murs des côtés et le garde-corps du bas ======================
def murs_cotes(m, R):
    ya, yb = Y0 - P_EP, RD + 0.45
    for s in (0, 1):
        xa, xb = (RW, RW + 1.05) if s else (-1.05, 0.0)
        boite('mur_cote', ((xa + xb) / 2, (ya + yb) / 2, 0.78), (xb - xa, yb - ya, 1.56), m['mur'], srgb('#2f3446'), biseau=0.02)
        y = ya
        while y < yb:
            L = min(R.uniform(0.85, 1.5), yb - y)
            boite('chape', ((xa + xb) / 2, y + L / 2, 1.63 + R.uniform(-0.012, 0.012)), (xb - xa + 0.06, L - 0.04, 0.14), m['mur'], pal(R, MUR_CLAIR, 0.08), biseau=0.04)
            y += L
    boite('garde', (13, RD + 0.225, 0.2), (RW + 2.1, 0.45, 0.42), m['mur'], srgb('#2f3446'), biseau=0.02)
    x = -1.05
    while x < RW + 1.05:
        L = min(R.uniform(0.9, 1.6), RW + 1.05 - x)
        boite('chape_bas', (x + L / 2, RD + 0.225, 0.485 + R.uniform(-0.01, 0.01)), (L - 0.04, 0.51, 0.13), m['mur'], pal(R, MUR_CLAIR, 0.08), biseau=0.04)
        x += L

# ====================== la réserve du fond (à la place de l'estrade) ======================
POTIONS = ['#63ff86', '#5cc0ff', '#b98aff', '#ffb648', '#ff6a8a', '#7affea']
LIVRES = ['#7a1f24', '#253a66', '#2f5a3a', '#8a6a3a', '#4a2a5e', '#6a4a2a', '#1f4a5a']

def reserve(m, R):
    xa, xb, ya, yb, h = 10.6, 15.4, Y0, 3.2, 0.9
    # le socle : deux rangs de pierres, un dessus de grandes dalles claires, un liseré de bronze
    for k, z in enumerate((0.0, 0.43)):
        x = xa - R.uniform(0, 0.4)
        while x < xb:
            w = R.uniform(0.75, 1.3); a, b = max(x, xa), min(x + w, xb); x += w
            if b - a < 0.1: continue
            boite('socle', ((a + b) / 2, (ya + yb) / 2, z + 0.21), (b - a - 0.03, yb - ya, 0.4), m['mur'], pal(R, MUR, 0.08), biseau=0.035)
    x = xa
    for w in (1.15, 1.3, 1.2, 1.15):
        boite('socle_dessus', (x + w / 2, (ya + yb) / 2 + 0.03, 0.865), (w - 0.03, yb - ya + 0.08, 0.09), m['mur'], pal(R, MUR_CLAIR, 0.07), biseau=0.03); x += w
    boite('socle_bronze', (13, yb + 0.03, 0.76), (xb - xa + 0.04, 0.05, 0.09), m['bronze'], biseau=0.02)
    xx = xa + 0.2
    while xx < xb: rivet((xx, yb + 0.06, 0.76), 0.035, m['orr']); xx += 0.5
    # l'étagère : trois montants, quatre tablettes, un fond sombre
    e0, e1, yd = 11.05, 14.95, Y0 + 0.5
    boite('etagere_fond', (13, Y0 + 0.04, 2.38), (e1 - e0, 0.05, 2.95), m['bois_z'], srgb('#3e2816'), biseau=0.01)
    for x in (e0, 13.0, e1):
        planche('montant', (x, Y0 + 0.27, h), (x, Y0 + 0.27, 3.9), 0.5, 0.12, m['bois'], pal(R, BOIS_SOMBRE, 0.1), vers=(1, 0, 0))
    niveaux = (1.55, 2.3, 3.05, 3.86)
    for z in niveaux:
        planche('tablette', (e0 - 0.06, Y0 + 0.28, z), (e1 + 0.06, Y0 + 0.28, z), 0.56, 0.09, m['bois'], pal(R, BOIS, 0.1), vers=(0, 0, 1))
    for z in (h + 0.0,) + niveaux[:-1]:
        for (b0, b1) in ((e0 + 0.1, 12.92), (13.08, e1 - 0.1)):
            ranger(m, R, b0, b1, Y0 + 0.3, z + (0.045 if z > h else 0.0))
    # sur le socle : un coffre, des sacs, un tonnelet, un seau, des chandelles
    coffre(m, R, 11.55, 2.55, h)
    for (sx, sy, sr) in ((14.55, 2.5, 0.36), (15.0, 2.75, 0.3), (14.2, 2.85, 0.27)):
        o = rocher('sac', (sx, sy, h + sr * 0.62), sr, m['toile'], varier(srgb('#b59a68'), R, 0.12), R=R, aplati=1.25, bosses=0.12)
        boule('noeud', (sx + R.uniform(-0.05, 0.05), sy, h + sr * 1.4), sr * 0.2, m['toile'], srgb('#8a7448'))
    tonnelet(m, R, 13.55, 2.6, h, 0.27, 0.62)
    tour('seau', [(0.0, 0.0), (0.17, 0.0), (0.21, 0.34), (0.19, 0.34), (0.16, 0.05), (0.0, 0.05)], (12.75, 2.8, h), m['bois_z'], pal(R, BOIS, 0.1), seg=16, cannelures=10, creux=0.03)
    for (cx, cy, ch) in ((12.3, 2.95, 0.22), (12.42, 3.0, 0.14), (12.2, 3.03, 0.1)):
        chandelle(m, cx, cy, h, ch)

def ranger(m, R, x0, x1, y, z):
    """remplit une case d'étagère : des pots, des fioles qui luisent, des livres, des rouleaux"""
    x = x0 + R.uniform(0.02, 0.1)
    while x < x1 - 0.12:
        t = R.random()
        if t < 0.3:      # une rangée de livres
            n = R.randint(2, 5)
            for i in range(n):
                w = R.uniform(0.07, 0.12); hh = R.uniform(0.34, 0.52)
                if x + w > x1 - 0.03: break
                o = boite('livre', (x + w / 2, y, z + hh / 2), (w - 0.012, 0.32, hh), m['couleur'], varier(srgb(R.choice(LIVRES)), R, 0.15), biseau=0.012)
                boite('dos', (x + w / 2, y + 0.165, z + hh * 0.72), (w - 0.012, 0.012, 0.035), m['orr'], biseau=0)
                x += w
            x += R.uniform(0.03, 0.1)
        elif t < 0.58:   # une fiole qui luit
            r = R.uniform(0.085, 0.13); c = srgb(R.choice(POTIONS))
            if x + 2 * r > x1: break
            tour('fiole', [(0.0, 0), (r * 0.8, 0), (r, r * 0.5), (r, r * 1.1), (r * 0.35, r * 1.9), (r * 0.3, r * 2.7), (r * 0.42, r * 2.75), (0.0, r * 2.75)], (x + r, y, z), m['verre'], tuple(v * 0.25 for v in c[:3]) + (1,), seg=12)
            tour('jus', [(0.0, 0.02), (r * 0.82, 0.02), (r, r * 0.5), (r, r * 1.05), (0.0, r * 1.05)], (x + r, y, z), m['potion'], c, seg=12).scale = (1.03, 1.03, 1.0)
            boule('bouchon', (x + r, y, z + r * 2.85), r * 0.36, m['toile'], srgb('#8a6a40'))
            x += 2 * r + R.uniform(0.04, 0.12)
        elif t < 0.85:   # un pot de terre, avec son couvercle
            r = R.uniform(0.1, 0.17); hh = R.uniform(0.26, 0.42)
            if x + 2 * r > x1: break
            tour('pot', [(0.0, 0), (r * 0.7, 0), (r, hh * 0.35), (r * 0.95, hh * 0.75), (r * 0.6, hh * 0.92), (r * 0.66, hh), (0.0, hh)], (x + r, y, z), m['couleur'], varier(srgb(R.choice(['#9a5a3a', '#7a6a58', '#5a6a7a', '#a88a5a', '#6a4a3a'])), R, 0.12), seg=14)
            boule('couvercle', (x + r, y, z + hh), r * 0.3, m['toile'], srgb('#c8b088'), ecrase=(1, 1, 0.5))
            x += 2 * r + R.uniform(0.04, 0.12)
        else:            # des rouleaux couchés
            for i in range(R.randint(1, 3)):
                r = 0.055; L = R.uniform(0.3, 0.42)
                if x + L > x1: break
                o = tour('rouleau', [(0.0, -L / 2), (r, -L / 2), (r, L / 2), (0.0, L / 2)], (x + L / 2, y + 0.02 * i, z + r + i * 0.1), m['toile'], varier(srgb('#d8c8a0'), R, 0.1), seg=10)
                o.rotation_euler = (0, math.pi / 2, R.uniform(-0.15, 0.15))
            x += 0.48

def coffre(m, R, x, y, z):
    w, d, hh = 1.0, 0.62, 0.42
    boite('coffre', (x, y, z + hh / 2), (w, d, hh), m['bois'], pal(R, BOIS_SOMBRE, 0.08), biseau=0.02)
    # le couvercle bombé
    n = 10; pts = [(x - w / 2 - 0.02, z + hh)] + [(x - (w / 2 + 0.02) * math.cos(i / n * math.pi), z + hh + 0.26 * math.sin(i / n * math.pi)) for i in range(n + 1)]
    pr = prisme('couvercle', [(-(d / 2 + 0.02) * math.cos(i / n * math.pi), z + hh + 0.24 * math.sin(i / n * math.pi)) for i in range(n + 1)], 0, w + 0.04, m['bois_y'], pal(R, BOIS_SOMBRE, 0.08), biseau=0.015)
    pr.matrix_local = Matrix.Translation(G(x - w / 2 - 0.02, y, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'Z') @ Matrix.Translation(Vector((0, 0, 0)))
    for sx in (-0.36, 0.0, 0.36):
        boite('ferrure_coffre', (x + sx, y + d / 2 + 0.012, z + hh / 2), (0.09, 0.03, hh + 0.02), m['fer'], biseau=0.01)
        rivet((x + sx, y + d / 2 + 0.03, z + hh * 0.3), 0.03, m['fer']); rivet((x + sx, y + d / 2 + 0.03, z + hh * 0.75), 0.03, m['fer'])
    boite('serrure', (x, y + d / 2 + 0.03, z + hh * 0.86), (0.16, 0.03, 0.18), m['bronze'], biseau=0.015)

def tonnelet(m, R, x, y, z, r, hh, coll='fond'):
    o = [tour('tonnelet', [(0.0, 0), (r * 0.84, 0), (r * 0.95, hh * 0.25), (r, hh * 0.5), (r * 0.95, hh * 0.75), (r * 0.84, hh), (r * 0.74, hh), (r * 0.74, hh - 0.04), (0.0, hh - 0.04)], (x, y, z), m['bois_z'], pal(R, BOIS, 0.1), coll, seg=18, cannelures=12, creux=0.035)]
    for t in (0.14, 0.86):
        rr = r * (0.84 + 0.11 * (1 - abs(t - 0.5) * 2) * 2) + 0.012
        o.append(tour('cercle', [(rr - 0.02, 0), (rr, 0), (rr, 0.07), (rr - 0.02, 0.07)], (x, y, z + hh * t - 0.035), m['fer'], None, coll, seg=18))
    return o

def chandelle(m, x, y, z, hh, coll='fond'):
    tour('chandelle', [(0.0, 0), (0.045, 0), (0.04, hh), (0.0, hh)], (x, y, z), m['toile'], srgb('#e8dcc0'), coll, seg=8)
    boule('flammeche', (x, y, z + hh + 0.05), 0.03, m['flamme'], None, coll, ecrase=(1, 1, 1.6))
    lampe('lum_chandelle', (x, y + 0.05, z + hh + 0.12), 3.0, (1.0, 0.62, 0.28), 0.04)

# ====================== les obstacles ======================
def pilier(m, R, o, coll):
    x, y = o['x'], o['y']; objs = []; C = lambda P_: pal(R, P_, 0.06)
    objs.append(boite('plinthe', (x, y, 0.16), (1.5, 1.5, 0.32), m['ruine'], C(MUR_CLAIR), coll, biseau=0.05))
    objs.append(boite('plinthe2', (x, y, 0.39), (1.32, 1.32, 0.14), m['ruine'], C(MUR_CLAIR), coll, biseau=0.04))
    objs.append(tour('base', [(0.0, 0.46), (0.71, 0.46), (0.73, 0.52), (0.69, 0.6), (0.62, 0.66), (0.0, 0.66)], (x, y, 0), m['ruine'], C(MUR_CLAIR), coll, seg=32))
    for (za, zb) in ((0.66, 1.68), (1.71, 2.7), (2.73, 3.72)):
        objs.append(tour('fut', [(0.0, za), (0.575, za), (0.6, za + 0.035), (0.6, zb - 0.035), (0.575, zb), (0.0, zb)], (x, y, 0), m['ruine'], C(RUINE), coll, seg=64, cannelures=16, creux=0.05))
    for (za, zb) in ((0.68, 0.9), (3.46, 3.7)):
        objs.append(tour('bague', [(0.6, za), (0.645, za + 0.02), (0.645, zb - 0.02), (0.6, zb)], (x, y, 0), m['bronze'], None, coll, seg=32))
        for i in range(12):
            a = i / 12 * math.tau + 0.2
            objs.append(boule('rivet', (x + math.cos(a) * 0.655, y + math.sin(a) * 0.655, (za + zb) / 2), 0.04, m['orr'], None, coll, seg=8))
    objs.append(tour('chapiteau', [(0.0, 3.72), (0.62, 3.72), (0.7, 3.82), (0.78, 3.96), (0.8, 4.1), (0.74, 4.2), (0.0, 4.2)], (x, y, 0), m['ruine'], C(MUR_CLAIR), coll, seg=32))
    # la vasque de bronze et ses braises (les flammes sont dessinées par le jeu)
    objs.append(tour('vasque', [(0.0, 4.2), (0.2, 4.2), (0.26, 4.27), (0.48, 4.4), (0.6, 4.56), (0.62, 4.6), (0.56, 4.6), (0.46, 4.47), (0.0, 4.43)], (x, y, 0), m['bronze'], None, coll, seg=28))
    objs.append(tour('braises', [(0.0, 4.52), (0.52, 4.52), (0.3, 4.6), (0.0, 4.63)], (x, y, 0), m['braise'], None, coll, seg=20))
    objs[-1].pass_index = objs[-2].pass_index
    L = lampe('feu_pilier', (x, y, 5.05), REG['pilier'], (1.0, 0.56, 0.24), 0.3)
    sans_ombre(L, objs, 'sans_ombre_%s' % coll)
    return objs

def mur_de_blocs(m, R, cx, cy, long_, ep, profil, coll, le_long_de='x', chape=False, P_=RUINE, hr=0.46):
    """un pan de mur : des rangs de blocs le long de x (ou de y). profil(u) : la hauteur du mur à l'abscisse u (de −long/2 à long/2)."""
    k = 0; z = 0.0
    while True:
        u = -long_ / 2 - R.uniform(0, 0.3) - (k % 2) * 0.32; pose = False
        while u < long_ / 2:
            w = R.uniform(0.55, 1.0); a, b = max(u, -long_ / 2), min(u + w, long_ / 2); u += w
            if b - a < 0.14: continue
            if min(profil(a + 0.05), profil(b - 0.05), profil((a + b) / 2)) < z + hr - 0.02: continue
            haut = profil((a + b) / 2) < z + 2 * hr - 0.02
            dj = R.uniform(-0.02, 0.02); rot = Matrix.Rotation(R.uniform(-0.03, 0.03) * (2.2 if haut else 1), 3, 'Z')
            t = (b - a - 0.03, ep + R.uniform(-0.03, 0.02), hr - 0.03); c = ((a + b) / 2, dj, z + hr / 2)
            if le_long_de == 'x': boite('bloc', (cx + c[0], cy + c[1], c[2]), t, m['ruine'], pal(R, P_, 0.08), coll, biseau=0.045, rot=rot)
            else: boite('bloc', (cx + c[1], cy + c[0], c[2]), (t[1], t[0], t[2]), m['ruine'], pal(R, P_, 0.08), coll, biseau=0.045, rot=rot)
            pose = True
        z += hr; k += 1
        if not pose or z > 6: break
    if chape:
        u = -long_ / 2 - 0.03
        while u < long_ / 2:
            w = min(R.uniform(0.6, 1.0), long_ / 2 + 0.03 - u); zc = profil(u + w / 2)
            t = (w - 0.03, ep + 0.08, 0.16); c = (u + w / 2, 0, zc + 0.08 + R.uniform(-0.008, 0.008))
            if le_long_de == 'x': boite('chape', (cx + c[0], cy, c[2]), t, m['ruine'], pal(R, MUR_CLAIR, 0.07), coll, biseau=0.04)
            else: boite('chape', (cx, cy + c[0], c[2]), (t[1], t[0], t[2]), m['ruine'], pal(R, MUR_CLAIR, 0.07), coll, biseau=0.04)
            u += w

def pan(m, R, o, coll, sens):
    marches = [(-1.7, 2.3), (0.55, 1.84), (1.15, 1.38)] if sens > 0 else [(-1.7, 1.38), (-1.15, 1.84), (-0.55, 2.3)]
    def profil(u):
        hh = 0
        for (u0, v) in marches:
            if u >= u0 - 1e-6: hh = v
        if sens < 0 and 0.35 < u < 0.95: hh = min(hh, 1.84)
        return hh
    mur_de_blocs(m, R, o['x'], o['y'], o['w'], o['d'], profil, coll)
    # des pierres tombées, restées sur les marches
    for (u0, v) in marches[1:] if sens > 0 else marches[:-1]:
        for i in range(2):
            rocher('eclat', (o['x'] + u0 + R.uniform(0.1, 0.45), o['y'] + R.uniform(-0.2, 0.25), v + 0.07), R.uniform(0.08, 0.15), m['roc'], pal(R, RUINE), coll, R=R, sub=1)
    for i in range(5):
        rocher('eclat', (o['x'] + R.uniform(-1.6, 1.6), o['y'] + 0.4 + R.uniform(0.04, 0.16), 0.05), R.uniform(0.05, 0.11), m['roc'], pal(R, RUINE), coll, R=R, sub=1)

def muret(m, R, o, coll):
    le_long = 'x' if o['w'] > o['d'] else 'y'; L = max(o['w'], o['d']); ep = min(o['w'], o['d'])
    mur_de_blocs(m, R, o['x'], o['y'], L, ep - 0.06, lambda u: 0.84, coll, le_long, chape=True, P_=MUR, hr=0.42)

def caisse(m, R, o, coll):
    x, y, s, hh = o['x'], o['y'], o['w'], o['h']; a = s / 2; e = 0.055; lb = 0.17
    boite('ame', (x, y, hh / 2), (s - 0.1, s - 0.1, hh - 0.1), m['bois'], srgb('#5a3a1c'), coll, biseau=0.01)
    yf = y + a - 0.05                                   # la face tournée vers nous
    n = 5
    for i in range(n):                                  # le fond de la face : des planches debout
        xa = x - a + 0.06 + i * (s - 0.12) / n
        planche('p', (xa + (s - 0.12) / n / 2, yf, 0.05), (xa + (s - 0.12) / n / 2, yf, hh - 0.05), (s - 0.12) / n - 0.012, 0.04, m['bois'], pal(R, BOIS, 0.12), coll, vers=(0, 1, 0))
    for (p0, p1) in (((x - a, yf + e, lb / 2), (x + a, yf + e, lb / 2)), ((x - a, yf + e, hh - lb / 2), (x + a, yf + e, hh - lb / 2)),
                     ((x - a + lb / 2, yf + e, lb), (x - a + lb / 2, yf + e, hh - lb)), ((x + a - lb / 2, yf + e, lb), (x + a - lb / 2, yf + e, hh - lb)),
                     ((x - a + lb, yf + e - 0.012, lb * 0.9), (x + a - lb, yf + e - 0.012, hh - lb * 0.9))):
        planche('cadre', p0, p1, lb, 0.055, m['bois'], pal(R, BOIS_SOMBRE, 0.1), coll, vers=(0, 1, 0))
    zt = hh - 0.03                                      # le dessus : des planches, deux traverses
    for i in range(n):
        ya = y - a + 0.06 + i * (s - 0.12) / n
        planche('p', (x - a + 0.05, ya + (s - 0.12) / n / 2, zt), (x + a - 0.05, ya + (s - 0.12) / n / 2, zt), (s - 0.12) / n - 0.012, 0.045, m['bois'], pal(R, BOIS, 0.12), coll, vers=(0, 0, 1))
    for sx in (-1, 1):
        planche('traverse', (x + sx * (a - lb / 2), y - a, zt + 0.045), (x + sx * (a - lb / 2), y + a, zt + 0.045), lb, 0.05, m['bois'], pal(R, BOIS_SOMBRE, 0.1), coll, vers=(0, 0, 1))
    for sx in (-1, 1):                                  # les coins de fer et leurs rivets
        for (zc, hz) in ((0.11, 0.24), (hh - 0.1, 0.24)):
            boite('coin', (x + sx * (a - 0.1), yf + e + 0.032, zc), (0.24, 0.02, hz), m['fer'], None, coll, biseau=0.008)
            rivet((x + sx * (a - 0.1), yf + e + 0.05, zc), 0.035, m['fer'], coll)
        boite('coin', (x + sx * (a - 0.1), y + a - 0.12, zt + 0.076), (0.24, 0.26, 0.02), m['fer'], None, coll, biseau=0.008)
        boule('rivet', (x + sx * (a - 0.1), y + a - 0.12, zt + 0.09), 0.035, m['fer'], None, coll, ecrase=(1, 1, 0.5), seg=8)

def tonneaux(m, R, o, coll):
    """trois tonneaux couchés en rang, calés par des coins de bois (à la place de la statue renversée)"""
    r = 0.47; L = 1.14
    for i, dx in enumerate((-1.06, 0.0, 1.06)):
        x = o['x'] + dx; y = o['y']; z = r - 0.02; c = pal(R, BOIS, 0.1)
        prof = [(0.0, -L / 2), (r * 0.8, -L / 2), (r * 0.93, -L * 0.25), (r, 0), (r * 0.93, L * 0.25), (r * 0.8, L / 2), (0.0, L / 2)]
        objs = [tour('tonneau', prof, (0, 0, 0), m['bois_z'], c, coll, seg=30, cannelures=15, creux=0.035)]
        for t in (-0.42, -0.2, 0.2, 0.42):
            rr = r * (0.8 + 0.2 * (1 - (abs(t) * 2) ** 1.5)) + 0.014
            objs.append(tour('cercle', [(rr - 0.03, t * L - 0.035), (rr, t * L - 0.035), (rr, t * L + 0.035), (rr - 0.03, t * L + 0.035)], (0, 0, 0), m['fer'], None, coll, seg=30))
        # le fond tourné vers nous : trois planches, une bonde de bronze
        objs.append(tour('fond_t', [(0.0, L / 2 - 0.05), (r * 0.78, L / 2 - 0.05), (r * 0.78, L / 2 - 0.02), (0.0, L / 2 - 0.02)], (0, 0, 0), m['bois'], pal(R, BOIS, 0.1), coll, seg=24))
        for sx in (-0.13, 0.13):
            objs.append(boite('rainure', (sx, 0, L / 2 - 0.02), (0.014, r * 1.4, 0.012), m['noir'], None, coll, biseau=0))
        objs.append(tour('bonde', [(0.0, L / 2 - 0.03), (0.055, L / 2 - 0.03), (0.045, L / 2 + 0.03), (0.0, L / 2 + 0.03)], (0, -r * 0.42, 0), m['bronze'], None, coll, seg=10))
        Mx = Matrix.Translation(G(x, y, z)) @ Matrix.Rotation(math.pi / 2, 4, 'X') @ Matrix.Rotation(R.uniform(-0.5, 0.5), 4, 'Z')
        for ob in objs: ob.matrix_local = Mx @ ob.matrix_local
    for sx in (-1, 1):
        xx = o['x'] + sx * 1.56
        prisme('cale', [(xx - sx * 0.02, 0), (xx + sx * 0.22, 0), (xx - sx * 0.02, 0.2)] if sx > 0 else [(xx + sx * 0.22, 0), (xx - sx * 0.02, 0), (xx - sx * 0.02, 0.2)], o['y'] - 0.2, o['y'] + 0.3, m['bois_y'], pal(R, BOIS_SOMBRE), coll, biseau=0.015)

def chariot(m, R, o, coll):
    x, y = o['x'], o['y']; d = 0.55
    for sx in (-0.72, 0.72):                            # les roues, de face
        for sy in (-d - 0.06, d + 0.06):
            w = tour('roue', [(0.0, -0.05), (0.3, -0.05), (0.32, -0.03), (0.32, 0.03), (0.3, 0.05), (0.0, 0.05)], (0, 0, 0), m['fer'], None, coll, seg=22)
            j = tour('jante', [(0.0, 0.05), (0.2, 0.05), (0.18, 0.075), (0.0, 0.075)], (0, 0, 0), m['bois'], pal(R, BOIS_SOMBRE), coll, seg=16)
            mo = tour('moyeu', [(0.0, 0.07), (0.07, 0.07), (0.05, 0.11), (0.0, 0.11)], (0, 0, 0), m['bronze'], None, coll, seg=10)
            Mx = Matrix.Translation(G(x + sx, y + sy, 0.32)) @ Matrix.Rotation(math.pi / 2, 4, 'X')
            for ob in (w, j, mo): ob.matrix_local = Mx @ ob.matrix_local
    boite('chassis', (x, y, 0.36), (2.0, 2 * d - 0.1, 0.12), m['fer'], None, coll, biseau=0.02)
    # la benne : le devant et le derrière en trapèze, deux côtés penchés, un fond
    trap = [(x - 0.86, 0.42), (x + 0.86, 0.42), (x + 1.16, 1.06), (x - 1.16, 1.06)]
    for (ya, yb) in ((y + d - 0.09, y + d), (y - d, y - d + 0.09)):
        for i in range(3):                              # trois planches en travers
            za, zb = 0.42 + i * 0.213, 0.42 + (i + 1) * 0.213 - 0.012
            xa = lambda z: 0.86 + (z - 0.42) / 0.64 * 0.3
            prisme('benne', [(x - xa(za), za), (x + xa(za), za), (x + xa(zb), zb), (x - xa(zb), zb)], ya, yb, m['bois'], pal(R, BOIS, 0.12), coll, biseau=0.015)
    for sx in (-1, 1):
        planche('cote', (x + sx * 0.86, y, 0.42), (x + sx * 1.16, y, 1.06), 2 * d - 0.14, 0.08, m['bois_y'], pal(R, BOIS, 0.1), coll, vers=(sx, 0, 0.45))
    boite('fond_benne', (x, y, 0.45), (1.75, 2 * d - 0.14, 0.07), m['bois'], pal(R, BOIS_SOMBRE), coll, biseau=0.01)
    for sx in (-0.62, 0.0, 0.62):                       # les ferrures du devant
        boite('ferrure', (x + sx, y + d + 0.012, 0.74), (0.1, 0.03, 0.66), m['fer'], None, coll, biseau=0.012)
        for zz in (0.52, 0.74, 0.96): rivet((x + sx, y + d + 0.035, zz), 0.035, m['fer'], coll)
    boite('rebord', (x, y + d + 0.01, 1.08), (2.36, 0.07, 0.07), m['fer'], None, coll, biseau=0.015)
    # le minerai : des blocs sombres, et quelques-uns qui rougeoient
    for i in range(22):
        px_ = x + R.uniform(-0.95, 0.95); py_ = y + R.uniform(-0.4, 0.4); pz = 0.86 + (1 - abs(px_ - x) / 1.0) * 0.36 * R.uniform(0.5, 1.0) + R.uniform(0, 0.08)
        chaud = R.random() < 0.3
        rocher('minerai', (px_, py_, pz), R.uniform(0.13, 0.24) * (0.6 if chaud else 1), m['minerai'] if chaud else m['roc'], srgb('#2e3038'), coll, R=R, sub=1, aplati=0.9)
    lampe('lum_minerai', (x, y + 0.1, 1.75), 26, (1.0, 0.42, 0.14), 0.25)

def gravats(m, R, o, coll):
    x, y, r, hh = o['x'], o['y'], o['r'], o['h']
    for i in range(30):
        a = R.uniform(0, 6.28); d = r * 0.92 * R.random() ** 0.7; t = 1 - d / r
        rr = R.uniform(0.1, 0.2) + 0.16 * t
        rocher('caillou', (x + math.cos(a) * d, y + math.sin(a) * d * 0.9, max(0.06, hh * t * R.uniform(0.5, 1.0) - rr * 0.2)), rr, m['roc'], pal(R, RUINE + MUR, 0.1), coll, R=R, sub=2, aplati=0.85)
    for i in range(4):                                  # des morceaux de blocs taillés
        a = R.uniform(0, 6.28); d = r * R.uniform(0.2, 0.75)
        rot = Matrix.Rotation(R.uniform(0, 3.1), 3, 'Z') @ Matrix.Rotation(R.uniform(-0.5, 0.5), 3, 'X')
        boite('bloc_tombe', (x + math.cos(a) * d, y + math.sin(a) * d * 0.9, R.uniform(0.14, hh * 0.7)), (R.uniform(0.35, 0.6), R.uniform(0.3, 0.45), R.uniform(0.22, 0.34)), m['ruine'], pal(R, RUINE, 0.08), coll, biseau=0.04, rot=rot)

# ====================== le décor des murs et du sol ======================
def torche(m, R, x, z):
    y = Y0 + 0.34
    boite('bras', (x, Y0 + 0.17, z - 0.36), (0.07, 0.36, 0.07), m['fer'], biseau=0.015)
    planche('jambe', (x, Y0 + 0.02, z - 0.78), (x, Y0 + 0.32, z - 0.4), 0.06, 0.05, m['fer'], None, vers=(1, 0, 0))
    boite('platine', (x, Y0 + 0.02, z - 0.56), (0.2, 0.04, 0.6), m['fer'], biseau=0.015)
    tour('coupe', [(0.0, -0.36), (0.05, -0.36), (0.09, -0.3), (0.2, -0.04), (0.23, 0.0), (0.19, 0.0), (0.15, -0.06), (0.0, -0.1)], (x, y, z), m['bronze'], seg=16)
    tour('braises', [(0.0, -0.05), (0.17, -0.05), (0.0, -0.03)], (x, y, z), m['braise'], seg=12).pass_index = B.IDC[0]
    lampe('feu_torche', (x, y + 0.3, z + 0.35), REG['torche'], (1.0, 0.55, 0.22), 0.14)

def lanterne(m, R, x, y, z):
    tour('pied', [(0.0, 1.7), (0.2, 1.7), (0.2, 1.76), (0.06, 1.8), (0.05, z - 0.2), (0.16, z - 0.17), (0.16, z - 0.13), (0.0, z - 0.13)], (x, y, 0), m['fer'], seg=12)
    for i in range(4):
        a = i / 4 * math.tau + 0.78
        boite('barreau', (x + math.cos(a) * 0.14, y + math.sin(a) * 0.14, z + 0.02), (0.025, 0.025, 0.32), m['fer'], biseau=0.005)
    tour('toit', [(0.0, z + 0.18), (0.2, z + 0.18), (0.05, z + 0.34), (0.03, z + 0.4), (0.0, z + 0.4)], (x, y, 0), m['bronze'], seg=12)
    boule('lueur', (x, y, z + 0.02), 0.09, m['flamme'], ecrase=(1, 1, 1.3))
    lampe('feu_lanterne', (x + (0.5 if x < 0 else -0.5), y, z + 0.1), REG['lanterne'], (1.0, 0.6, 0.26), 0.16)

def banniere(m, R, x):
    zt, zb = 3.72, 1.42
    tg = tour('tringle', [(0.0, -0.66), (0.035, -0.66), (0.035, 0.66), (0.0, 0.66)], (x, Y0 + 0.16, zt), m['bronze'], seg=8); tg.rotation_euler = (0, math.pi / 2, 0)
    for sx in (-0.68, 0.68): boule('pommeau', (x + sx, Y0 + 0.16, zt), 0.06, m['orr'])
    for sx in (-0.5, 0.5): boite('crochet', (x + sx, Y0 + 0.08, zt + 0.0), (0.04, 0.16, 0.04), m['fer'], biseau=0.008)
    ph = R.uniform(0, 6)
    fanion('banniere', x - 0.5, x + 0.5, zb, zt, -0.32, lambda u, v: 0.035 * math.sin(u * 7 + ph) * (1.15 - v) + 0.02 * math.sin(v * 5 + ph), m['banniere'], ypos=Y0 + 0.14)

def ratelier(m, R, x):
    """deux lances croisées derrière un bouclier rond, accrochées au mur"""
    y = Y0 + 0.07; zc = 2.75
    for sx in (-1, 1):
        a = (x - sx * 0.62, y, zc - 1.05); b = (x + sx * 0.62, y, zc + 1.05)
        planche('hampe', a, b, 0.07, 0.06, m['bois'], pal(R, BOIS_SOMBRE, 0.1), vers=(0, 1, 0))
        d = Vector((b[0] - a[0], 0, b[2] - a[2])).normalized(); n = Vector((-d.z, 0, d.x))
        t0 = Vector((b[0], 0, b[2])); p1 = t0 + d * 0.42; g = t0 + n * 0.11; dr = t0 - n * 0.11
        prisme('fer_de_lance', [(g.x, g.z), (p1.x, p1.z), (dr.x, dr.z), ((t0 - d * 0.08).x, (t0 - d * 0.08).z)] if sx > 0 else [(dr.x, dr.z), (p1.x, p1.z), (g.x, g.z), ((t0 - d * 0.08).x, (t0 - d * 0.08).z)], y - 0.02, y + 0.04, m['fer'], biseau=0.012)
    bo = tour('bouclier', [(0.0, 0.0), (0.56, 0.0), (0.56, 0.05), (0.5, 0.09), (0.2, 0.15), (0.0, 0.16)], (x, y + 0.07, zc), m['couleur'], srgb('#7e1d20'), seg=28); bo.rotation_euler = (math.pi / 2, 0, 0)
    bd = tour('bord_bouclier', [(0.47, 0.06), (0.585, 0.03), (0.585, 0.09), (0.47, 0.11)], (x, y + 0.07, zc), m['bronze'], seg=28); bd.rotation_euler = (math.pi / 2, 0, 0)
    um = tour('umbo', [(0.0, 0.14), (0.15, 0.14), (0.11, 0.22), (0.0, 0.25)], (x, y + 0.07, zc), m['orr'], seg=16); um.rotation_euler = (math.pi / 2, 0, 0)
    for i in range(8):
        a = i / 8 * math.tau + 0.39; ob = boule('rivet', (x + math.cos(a) * 0.36, y + 0.19, zc + math.sin(a) * 0.36), 0.035, m['orr'], seg=8); ob.pass_index = bo.pass_index

def chaine(m, R, x, zt, n, y=None):
    y = y if y is not None else Y0 + 0.1
    boite('piton', (x, Y0 + 0.03, zt + 0.12), (0.16, 0.06, 0.16), m['fer'], biseau=0.02)
    for i in range(n):
        o = tore('maillon', (x, y, zt - i * 0.155), 0.07, 0.02, m['fer'], axe='y' if i % 2 == 0 else 'x', ovale=1.45, seg=10, sseg=5)
    zb = zt - n * 0.155
    tore('boucle', (x, y, zb - 0.07), 0.13, 0.03, m['fer'], axe='y', seg=14, sseg=6)

def tapis(m, R):
    ondule = lambda u, v: 0.022 + 0.012 * math.sin(v * 37) * math.sin(u * 3.1) + 0.02 * max(0, math.sin(v * 9.0 + 1.0)) ** 6 + 0.006 * math.sin(u * 20 + v * 50)
    tissu('tapis_long', 11.5, 14.5, 3.38, 17.88, ondule, m['tapis'], nx=10, ny=120)
    disque_uv('tapis_rond', 13, 10.4, 2.6, lambda r, a: 0.062 + 0.006 * math.sin(r * 4 + a * 3), m['rond'])

def cailloux(m, R):
    """de petits cailloux le long des murs et près des ruines : rien qui gêne le passage"""
    pts = []
    for i in range(150):
        t = R.random()
        if t < 0.3: pts.append((R.uniform(0.1, RW - 0.1), Y0 + R.uniform(0.05, 0.7) ** 1.0))
        elif t < 0.5: pts.append((R.uniform(0.08, 0.9), R.uniform(Y0, RD)))
        elif t < 0.7: pts.append((RW - R.uniform(0.08, 0.9), R.uniform(Y0, RD)))
        elif t < 0.8: pts.append((R.uniform(0.2, RW - 0.2), RD - R.uniform(0.05, 0.5)))
        else:
            o = R.choice([o for o in OBS0 if o['k'] in ('pan', 'gravats', 'pilier')]); a = R.uniform(0, 6.28); d = R.uniform(1.0, 1.9) if o['k'] != 'pan' else R.uniform(0.6, 2.0)
            pts.append((o['x'] + math.cos(a) * d * (1.6 if o['k'] == 'pan' else 1), o['y'] + math.sin(a) * d * 0.7))
    for (x, y) in pts:
        if (10.5 < x < 15.5 and y < 3.4) or (11.3 < x < 14.7) or any(abs(x - dx) < 1.5 and y < Y0 + 1.0 for dx in PORTES) or not (0.05 < x < RW - 0.05 and Y0 < y < RD): continue
        if any((o.get('c') and (x - o['x']) ** 2 + (y - o['y']) ** 2 < (o['r'] + 0.05) ** 2) or (not o.get('c') and abs(x - o['x']) < o['w'] / 2 + 0.05 and abs(y - o['y']) < o['d'] / 2 + 0.05) for o in OBS0): continue
        rocher('gravier', (x, y, 0.02), R.uniform(0.03, 0.085), m['roc'], pal(R, RUINE + MUR, 0.12), R=R, sub=1, aplati=0.7).pass_index = 1

# ====================== la lumière ======================
def W(x, y, z): return Vector((x, -y, z * ZS))

def lune(nom, vers, depuis, force, coul, fen_l, fen_h, barres, exclus=None):
    """un rayon de lune : un soleil très doux, et un cache percé d'une fenêtre à barreaux (invisible) qui le découpe"""
    sc = bpy.context.scene; d = (W(*vers) - W(*depuis)).normalized()
    L = bpy.data.lights.new(nom, 'SUN'); L.energy = force; L.color = coul; L.angle = math.radians(1.6)
    ob = bpy.data.objects.new(nom, L); sc.collection.objects.link(ob)
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    c = W(*depuis); ex = d.cross(Vector((0, 0, 1))).normalized(); ey = ex.cross(d).normalized()
    quads = []; G_ = 70
    def q(u0, u1, v0, v1): quads.append([c + ex * u0 + ey * v0, c + ex * u1 + ey * v0, c + ex * u1 + ey * v1, c + ex * u0 + ey * v1])
    a, b = fen_l / 2, fen_h / 2
    q(-G_, -a, -G_, G_); q(a, G_, -G_, G_); q(-a, a, b, G_); q(-a, a, -G_, -b)
    for (kind, t, e) in barres:
        if kind == 'v': q(t - e, t + e, -b, b)
        else: q(-a, a, t - e, t + e)
    vs = [p for qq in quads for p in qq]; fs = [tuple(range(i * 4, i * 4 + 4)) for i in range(len(quads))]
    me = bpy.data.meshes.new(nom + '_cache'); me.from_pydata([tuple(v) for v in vs], [], fs); me.update()
    cache = bpy.data.objects.new(nom + '_cache', me); sc.collection.objects.link(cache)
    cache.visible_camera = False; cache.visible_diffuse = False; cache.visible_glossy = False; cache.visible_transmission = False
    return ob, cache

def lumieres(m, R, lunes=True):
    sc = bpy.context.scene
    w = bpy.data.worlds.new('monde'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.045, 0.06, 0.16, 1); bg.inputs['Strength'].default_value = REG['monde']
    for (x, z) in TORCHES: torche(m, R, x, z)
    for (x, y, z) in LAMPES: lanterne(m, R, x, y, z)
    if lunes:
        l1, c1 = lune('lune_g', (5.2, 13.6, 0), (-12.5, 7.6, 9.2), REG['lune_g'], (0.5, 0.66, 1.0), 3.4, 5.8, [('h', -1.45, 0.08), ('h', 0.0, 0.08), ('h', 1.45, 0.08), ('v', 0.0, 0.08)])
        l2, c2 = lune('lune_d', (21.0, 7.2, 0), (37.5, 2.2, 8.6), REG['lune_d'], (0.52, 0.7, 1.0), 3.0, 4.8, [('h', -1.2, 0.08), ('h', 0.0, 0.08), ('h', 1.2, 0.08), ('v', 0.0, 0.08)])
        for (lum, autre, nom) in ((l1, c2, 'ex1'), (l2, c1, 'ex2')):
            c = bpy.data.collections.new(nom); c.objects.link(autre)
            for co in c.collection_objects: co.light_linking.link_state = 'EXCLUDE'
            lum.light_linking.blocker_collection = c
    # le grand lustre, hors du champ, au-dessus du tapis rond : la flaque chaude du milieu, et des ombres qui partent en étoile
    Sp = bpy.data.lights.new('lustre', 'SPOT'); Sp.energy = REG['lustre']; Sp.color = (1.0, 0.8, 0.58); Sp.spot_size = math.radians(88); Sp.spot_blend = 0.75; Sp.shadow_soft_size = 0.55
    ob = bpy.data.objects.new('lustre', Sp); sc.collection.objects.link(ob); ob.location = W(13, 10.0, 8.5); ob.rotation_euler = (0, 0, 0)
    # un jour très faible qui vient de notre côté, sans ombre : il éclaire les faces tournées vers nous (caisses, portes, murets)
    Dv = bpy.data.lights.new('devant', 'SUN'); Dv.energy = REG['devant']; Dv.color = (1.0, 0.9, 0.8); Dv.use_shadow = False
    ob = bpy.data.objects.new('devant', Dv); sc.collection.objects.link(ob)
    ob.rotation_euler = (W(13, 6, 0) - W(13, 30, 8.5)).normalized().to_track_quat('-Z', 'Y').to_euler()
    # une lumière d'ambiance, très douce, pour qu'on lise toujours le milieu de la salle
    A = bpy.data.lights.new('ambiance', 'AREA'); A.shape = 'RECTANGLE'; A.size = 22; A.size_y = 12; A.energy = REG['ambiance']; A.color = (0.62, 0.7, 1.0)
    ob = bpy.data.objects.new('ambiance', A); sc.collection.objects.link(ob); ob.location = W(13, 10.5, 13); ob.rotation_euler = (0, 0, 0)
    # … et une autre qui vient de notre côté : sans elle, toutes les faces tournées vers nous seraient noires
    F = bpy.data.lights.new('face', 'AREA'); F.shape = 'RECTANGLE'; F.size = 34; F.size_y = 12; F.energy = REG['face']; F.color = (0.74, 0.78, 1.0)
    ob = bpy.data.objects.new('face', F); sc.collection.objects.link(ob); ob.location = W(13, 36, 11)
    ob.rotation_euler = (W(13, 8, 1.2) - W(13, 36, 11)).to_track_quat('-Z', 'Y').to_euler()

# ====================== tout construire ======================
def construire(graine=7, lunes=True):
    sc = B.raz(); R = random.Random(graine); m = M(); _bois_axes()
    sol(m, R); mur_fond(m, R); murs_cotes(m, R); reserve(m, R)
    for x in (3.9, 22.1): banniere(m, R, x)
    for (x, zt, n) in ((5.65, 3.6, 7), (20.35, 3.6, 8), (0.42, 3.5, 6), (25.6, 3.5, 9)): chaine(m, R, x, zt, n)
    for x in (1.35, 24.65): ratelier(m, R, x)
    tapis(m, R); cailloux(m, R)
    for i, o in enumerate(OBS0):
        coll = 'obs_%02d' % i; Ro = random.Random(graine * 100 + i)
        if o['k'] == 'pilier': pilier(m, Ro, o, coll)
        elif o['k'] == 'pan': pan(m, Ro, o, coll, 1 if i == 4 else -1)
        elif o['k'] == 'tonneaux': tonneaux(m, Ro, o, coll)
        elif o['k'] == 'muret': muret(m, Ro, o, coll)
        elif o['k'] == 'gravats': gravats(m, Ro, o, coll)
        elif o['k'] == 'chariot': chariot(m, Ro, o, coll)
        elif o['k'] == 'caisse': caisse(m, Ro, o, coll)
    lumieres(m, R, lunes)
    B.camera()
    return sc
