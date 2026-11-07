import json
from playwright.sync_api import sync_playwright
from PIL import Image
S = '/tmp/claude-0/-home-claude/3372a2cf-1f77-5598-a3f4-e1f632bdb837/scratchpad'
data = json.load(open(S + '/mj-donnees.json'))
with sync_playwright() as p:
    b = p.chromium.launch()
    for k in data:
        pg = b.new_page(viewport={'width':820, 'height':1180}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        v = '&v=chien' if k == 'poursuite' else ''
        pg.goto(f'file:///home/claude/brumeval/brumeval-sources/d-rapide/salle-mini-jeux.html#jeu={k}&n=3{v}'); pg.wait_for_timeout(1300)
        if pg.locator('#sl-plein .mj-go').count(): pg.click('#sl-plein .mj-go')
        pg.wait_for_timeout(2600 if k not in ('runes', 'plans', 'grille', 'alphabet') else 1800)
        pg.screenshot(path=f'{S}/point-mj/{k}.png')
        im = Image.open(f'{S}/point-mj/{k}.png').convert('RGB').crop((0, 0, 820, 1180)).resize((410, 590))
        im.save(f'{S}/point-mj/{k}.jpg', quality=72)
        print(k, 'ok' if not errs else errs[:2], flush=True)
        pg.close()
    b.close()
