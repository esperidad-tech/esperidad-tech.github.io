# le Barde et Grosbec bougent en rythme : six instants d'un temps (combat), puis six instants de deux temps (méga refrain)
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri() + '?qualite=3'
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(3500); pg.evaluate('__barde.nouvellePartie(0)'); pg.wait_for_timeout(2600); ims = []
    def serie(n, pas):
        for i in range(n):
            pg.screenshot(path='vues/tmp.png'); im = Image.open('vues/tmp.png').convert('RGB'); w, h = im.size
            ims.append((im.crop((int(w * 0.3), int(h * 0.62), int(w * 0.7), int(h * 0.86))), im.crop((int(w * 0.12), 0, int(w * 0.88), int(h * 0.36))).resize((int(w * 0.4), int(h * 0.36 * 0.4 / 0.76))))); pg.wait_for_timeout(pas)
    serie(6, 70)
    pg.evaluate("document.getElementById('bPause').click()"); pg.wait_for_timeout(300); mes = pg.evaluate("document.getElementById('infoMesures').textContent"); pg.evaluate("document.getElementById('bMega').click()"); pg.wait_for_timeout(4200)
    serie(6, 130)
    w, h = ims[0][0].size; h2 = ims[0][1].size[1]; sh = Image.new('RGB', (w * 6, (h + h2) * 2))
    for i, (a, b) in enumerate(ims): sh.paste(b, ((i % 6) * w, (i // 6) * (h + h2))); sh.paste(a, ((i % 6) * w, (i // 6) * (h + h2) + h2))
    sh.save('vues/v10-rythme.png'); print(sh.size, '|', mes, '| erreurs :', err or 'aucune'); nav.close()
