# le Barde en volume dans le jeu : gros plans (acte I : luth en main, clavier dans le dos ; acte III : synthé en main, luth dans le dos) et ses gestes
import pathlib, sys
from playwright.sync_api import sync_playwright
from PIL import Image
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri() + '?qualite=3'
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True).new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(2500); ims = []
    def gros_plan():
        pg.screenshot(path='vues/tmp.png'); im = Image.open('vues/tmp.png').convert('RGB'); w, h = im.size; return im.crop((int(w * 0.2), int(h * 0.56), int(w * 0.8), int(h * 0.86)))
    for acte in (0, 2):
        pg.evaluate(f'__barde.nouvellePartie({acte})'); pg.wait_for_timeout(2600); ims.append(gros_plan())
        for touche in ('KeyE', 'KeyZ', 'KeyA'):
            pg.keyboard.press(touche); pg.wait_for_timeout(150); ims.append(gros_plan()); pg.wait_for_timeout(900)
    w, h = ims[0].size; sh = Image.new('RGB', (w * 4, h * 2))
    for i, im in enumerate(ims): sh.paste(im, ((i % 4) * w, (i // 4) * h))
    sh = sh.resize((sh.width * 2 // 3, sh.height * 2 // 3)); sh.save('vues/v9-barde.png'); print(sh.size, 'erreurs :', err or 'aucune'); nav.close()
