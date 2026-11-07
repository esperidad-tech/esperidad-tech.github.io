"""Planche contact des deux jeux du Sage : test/sage-plans/planche-sage.png
Usage : python3 test/sage-plans/planche.py   (construit et copie la salle comme essai.py)"""
import os, sys, math
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import essai

ICI = essai.ICI
TUILES = os.path.join(ICI, 'captures', 'planche')
os.makedirs(TUILES, exist_ok=True)
POLICE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

DOIGTS_JS = r'''(pts) => {
  let c = document.getElementById('doigts'); if(!c){ c = document.createElement('div'); c.id = 'doigts'; c.style.cssText = 'position:fixed;inset:0;z-index:999;pointer-events:none'; document.body.appendChild(c); }
  c.innerHTML = pts.map(p => '<div style="position:absolute;left:' + (p[0] - 34) + 'px;top:' + (p[1] - 34) + 'px;width:68px;height:68px;border-radius:50%;background:rgba(63,208,255,.55);border:4px solid #fff;box-shadow:0 0 18px #3fd0ff, 0 0 0 3px #06243a"></div>' +
    (p[2] ? '<div style="position:absolute;left:' + (p[0] - 80) + 'px;top:' + (p[1] + 38) + 'px;width:160px;text-align:center;font:800 24px sans-serif;color:#fff;text-shadow:0 0 4px #000,0 0 8px #000">' + p[2] + '</div>' : '')).join('');
}'''

def cap(pg, nom, clip=None):
    f = os.path.join(TUILES, nom + '.png')
    pg.screenshot(path=f, clip=clip)
    return f

def main():
    essai.construire()
    tuiles = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        # --- PLANS : bord brûlé et déchiré (n=8, tablette) ---
        ctx, pg, errs = essai.nouvelle_page(b, 'tab', touch=True)
        cdp = ctx.new_cdp_session(pg)
        for essai_n in range(6):
            pg.evaluate("() => __lancer('plans', 8, {}, {carte:'village'}, true)")
            f = pg.evaluate("() => __racine('.mjp').__test.feuilles[0]")
            if f['brule'] and f['dechire']: break
        pg.evaluate("() => __racine('.mjp').__test.poser({s:1.05, th:-12, tx:-26, ty:18})")
        pg.wait_for_timeout(300)
        tuiles.append((cap(pg, 'p1-brule'), 'Plans n=8 · calque brûlé et déchiré, encre pâlie'))
        # --- PLANS : les gestes (un doigt, deux doigts) ---
        pg.evaluate("() => __lancer('plans', 6, {}, {carte:'moulin', secret:'tunnel'}, true)")
        pg.evaluate("() => __racine('.mjp').__test.poser({s:0.82, th:28, tx:30, ty:-20})")
        box = pg.evaluate("() => { const r = __racine('.mjp-svg').getBoundingClientRect(); return {x:r.x, y:r.y, w:r.width, h:r.height}; }")
        cx, cy = box['x'] + box['w'] / 2, box['y'] + box['h'] / 2
        d0, d1, a0, a1 = 180, 230, 0, -22
        pts = lambda d, a: [(0, cx - math.cos(math.radians(a)) * d / 2, cy - math.sin(math.radians(a)) * d / 2), (1, cx + math.cos(math.radians(a)) * d / 2, cy + math.sin(math.radians(a)) * d / 2)]
        essai.toucher(cdp, 'touchStart', pts(d0, a0))
        for k in range(1, 11):
            t = k / 10
            essai.toucher(cdp, 'touchMove', pts(d0 + (d1 - d0) * t, a0 + (a1 - a0) * t)); pg.wait_for_timeout(20)
        cur = pts(d1, a1)
        pg.evaluate(DOIGTS_JS, [[cur[0][1], cur[0][2], 'pincer'], [cur[1][1], cur[1][2], 'et tourner']])
        tuiles.append((cap(pg, 'p2-gestes'), 'Plans · deux doigts : pincer (zoom) + tourner'))
        essai.toucher(cdp, 'touchEnd', [])
        pg.evaluate("() => { document.getElementById('doigts').innerHTML = ''; }")
        # --- PLANS : plusieurs calques (n=10, après le 1er) ---
        pg.evaluate("() => __lancer('plans', 10, {}, {carte:'puits', secret:'puits'}, true)")
        pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0})")
        pg.wait_for_function("() => __racine('.mjp').__test.etat().k === 1 && !__racine('.mjp').__test.etat().pause", timeout=6000)
        pg.wait_for_timeout(400)
        tuiles.append((cap(pg, 'p3-multi'), 'Plans n=10 · calque 2/3 (1er posé : 1er morceau du secret)'))
        # --- PLANS : la révélation (e3, la cave sous les meules) ---
        ctx.close()
        ctx, pg, errs = essai.nouvelle_page(b, 'tab', url=essai.INDEX)
        pg.add_script_tag(content=essai.AIDE_JS)
        params = pg.evaluate("() => ENQUETES[3].pages.find(p => p.id === 'plan').params")
        pg.evaluate("(x) => __lancer('plans', 5, {}, x, true)", params)
        pg.evaluate("() => __racine('.mjp').__test.poser({s:1, th:0, tx:0, ty:0})")
        pg.wait_for_function("() => __racine('.mjp.gagne')", timeout=6000)
        pg.wait_for_timeout(1700)
        tuiles.append((cap(pg, 'p4-revelation'), 'Plans · e3 réussi : la cave sous les meules'))
        # --- GRILLE n=3 (tablette) ---
        ctx.close()
        ctx, pg, errs = essai.nouvelle_page(b, 'tab')
        pg.evaluate("() => __lancer('grille', 3, {}, null, true)")
        essai.attendre_pret_grille(pg)
        pg.evaluate(r'''() => { const t = __racine('.mjg').__test, E = t.E; let n = 0;
          E.sol.forEach((v, x) => { if(!v && n < 5){ const b = __racine('.mjg-case[data-x="' + x + '"]'); b.click(); n++; } });
          const x1 = E.sol.indexOf(1); const b1 = __racine('.mjg-case[data-x="' + x1 + '"]'); b1.click(); b1.click();
          __racine('.mjg-ind-btn').click(); }''')
        pg.wait_for_timeout(300)
        tuiles.append((cap(pg, 'g1-n3'), 'Grille n=3 · 4 personnes, lieux + objets'))
        ctx.close()
        # --- GRILLE n=10 avec tous ses indices (fenêtre haute pour tout voir) ---
        ctx, pg, errs = essai.nouvelle_page(b, (800, 2000))
        for _ in range(8):
            pg.evaluate("() => __lancer('grille', 10, {aide:1}, null, true)")
            essai.attendre_pret_grille(pg)
            if pg.evaluate("() => __racine('.mjg').__test.E.indices.length") >= 19: break
        pg.evaluate("() => { __racine('.mjg-pouce').click(); }")
        pg.wait_for_timeout(400)
        tuiles.append((cap(pg, 'g2-n10'), 'Grille n=10 · 5 pers., lieux multiples + objets + moments, %d indices' % pg.evaluate("() => __racine('.mjg').__test.E.indices.length")))
        ctx.close()
        # --- e2 : le casse-tête du maire ---
        ctx, pg, errs = essai.nouvelle_page(b, 'pay', url=essai.INDEX)
        pg.add_script_tag(content=essai.AIDE_JS)
        params = pg.evaluate("() => ENQUETES[2].bonus.find(x => x.id === 'casse').params")
        pg.evaluate("(x) => __lancer('grille', 4, {}, x, true)", params)
        essai.attendre_pret_grille(pg)
        tuiles.append((cap(pg, 'g3-e2'), 'Grille · e2 « Le casse-tête du maire » (paysage 1280×800)'))
        ctx.close()
        # --- Téléphone ---
        ctx, pg, errs = essai.nouvelle_page(b, 'tel', touch=True)
        pg.evaluate("() => __lancer('plans', 9, {aide:1}, null, true)")
        pg.wait_for_timeout(500)
        tuiles.append((cap(pg, 't1-plans'), 'Téléphone 390×844 · plans n=9, aide : repères 1'))
        pg.evaluate("() => __lancer('grille', 8, {}, null, true)")
        essai.attendre_pret_grille(pg)
        pg.evaluate(r'''() => { const t = __racine('.mjg').__test, E = t.E; let n = 0;
          E.sol.forEach((v, x) => { if(!v && n < 4){ const b = __racine('.mjg-case[data-x="' + x + '"]'); if(!b.classList.contains('cache')){ b.click(); n++; } } }); }''')
        tuiles.append((cap(pg, 't2-grille'), 'Téléphone · grille n=8 (onglets par catégorie)'))
        ctx.close()
        b.close()
    # --- assemblage ---
    police = ImageFont.truetype(POLICE, 17)
    larg = 340
    cartes = []
    for f, titre in tuiles:
        im = Image.open(f).convert('RGB')
        w = larg * 2 + 12 if im.width > im.height else larg   # paysage : deux colonnes
        im = im.resize((w, int(im.height * w / im.width)))
        cartes.append((im, titre))
    cols = 4
    lignes, l, place = [], [], 0
    for c in cartes:
        n = 2 if c[0].width > larg else 1
        if place + n > cols: lignes.append(l); l, place = [], 0
        l.append(c); place += n
    if l: lignes.append(l)
    H = sum(max(im.height for im, t in l) + 56 for l in lignes) + 70
    W = cols * (larg + 12) + 12
    P = Image.new('RGB', (W, H), (12, 14, 30))
    d = ImageDraw.Draw(P)
    d.text((14, 16), 'Brumeval · Sage : « Superposer les plans » et « La grille de déduction » (mj-sage-plans.js)', font=ImageFont.truetype(POLICE, 22), fill=(255, 227, 163))
    y = 64
    for l in lignes:
        h = max(im.height for im, t in l)
        x = 12
        for i, (im, t) in enumerate(l):
            mots, ligne, ls = t.split(' '), '', []
            for m in mots:
                if d.textlength(ligne + ' ' + m, font=police) > im.width - 4: ls.append(ligne); ligne = m
                else: ligne = (ligne + ' ' + m).strip()
            ls.append(ligne)
            for k, s in enumerate(ls[:2]): d.text((x, y + k * 21), s, font=police, fill=(166, 174, 216))
            P.paste(im, (x, y + 46))
            x += im.width + 12
        y += h + 56
    sortie = os.path.join(ICI, 'planche-sage.png')
    P.save(sortie)
    print(sortie, P.size)

if __name__ == '__main__':
    main()
