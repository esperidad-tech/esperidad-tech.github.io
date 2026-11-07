"""Aperçu des 10 décors des 7 différences (une capture par thème)."""
import sys
from commun import *
from PIL import Image
THEMES = sys.argv[1].split(',') if len(sys.argv) > 1 else ['labo', 'place', 'lisiere', 'taverne', 'marche', 'herboristerie', 'cave', 'baies', 'moulin', 'puits']
NIV = int(sys.argv[2]) if len(sys.argv) > 2 else 3
with sync_playwright() as p:
    nav = p.chromium.launch()
    err = []
    ctx, page = nouvelle_page(nav, 800, 1280, err)
    ims = []
    for th in THEMES:
        lancer(page, 'differences', NIV, {}, {'theme': th})
        page.wait_for_timeout(500)
        r = page.evaluate("() => { const s = document.querySelectorAll('.mjo-d-cadre'); const a = s[0].getBoundingClientRect(), b = s[1].getBoundingClientRect(); return [a.left, a.top, b.right, b.bottom]; }")
        f = f'{CAP}/theme-{th}.png'
        page.screenshot(path=f, clip={'x': r[0], 'y': r[1], 'width': r[2] - r[0], 'height': r[3] - r[1]})
        print(th, [ (d['sorte'], d['objet']) for d in etat(page)['diffs']])
        ims.append(Image.open(f))
    print('erreurs', err)
    w = ims[0].width // 2; h = ims[0].height // 2
    out = Image.new('RGB', (w * 5, h * 2), 'black')
    for k, im in enumerate(ims):
        out.paste(im.resize((w, h)), ((k % 5) * w, (k // 5) * h))
    out.save(f'{CAP}/themes-apercu.png')
    nav.close()
