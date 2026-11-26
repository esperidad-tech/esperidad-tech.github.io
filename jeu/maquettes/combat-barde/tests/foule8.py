# la foule : un robot paresseux laisse les golems approcher, pour voir s'ils se gênent (version 8)
import pathlib, sys, time
from playwright.sync_api import sync_playwright
from PIL import Image
url = (pathlib.Path(__file__).resolve().parent.parent / 'combat-barde.html').as_uri() + '?qualite=3'
acte = int(sys.argv[1]) if len(sys.argv) > 1 else 3
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
    pg = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(900)
    pg.evaluate(f'__barde.nouvellePartie({acte})'); pg.evaluate('__barde.robot(true,0.04,0.22,0.95)')
    ims = []
    for m in (9, 15, 21, 27):
        pg.wait_for_timeout(6000); pg.screenshot(path='vues/tmp.png'); ims.append(Image.open('vues/tmp.png').convert('RGB').crop((0, 300, 780, 1480)))
    sh = Image.new('RGB', (780 * 4 // 2, 1180 // 2))
    for i, im in enumerate(ims): sh.paste(im.resize((390, 590)), (i * 390, 0))
    sh.save(f'vues/v8-foule-a{acte}.png'); ims[2].save('vues/v8-foule-gros.png')
    print(pg.evaluate('__barde.etat()'), 'erreurs :', err or 'aucune'); nav.close()
