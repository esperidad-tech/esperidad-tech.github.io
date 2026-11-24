# une partie jouée jusqu'au bout avec le vrai clavier des codes ; la ligne de chiffres de l'écran de pause et de l'écran de fin
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        pg = await (await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)).new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.goto(PAGE + '#rapide-plein'); await pg.wait_for_timeout(1500)
        await pg.click('#bStartPlein'); await pg.wait_for_timeout(500)
        await pg.evaluate("(()=>{const S=__test.s;S.protection=500;S.cfg.protection=500;})()")
        await pg.wait_for_timeout(6000)
        await pg.evaluate("document.getElementById('bPause').click()"); await pg.wait_for_timeout(400)
        print('pause :', await pg.evaluate("document.getElementById('infoMesures').textContent"))
        await pg.screenshot(path='/tmp/s16d-pause.png')
        await pg.evaluate("document.getElementById('bResume').click()"); await pg.wait_for_timeout(21500)
        ann = await pg.evaluate("__test.s.announced"); print('codes criés :', ann)
        for k in ann:
            code = await pg.evaluate(f"G.CODES['{k}']")
            await pg.click('#bCode'); await pg.wait_for_timeout(250)
            for c in code:
                await pg.click(f'#keys [data-c="{c}"]'); await pg.wait_for_timeout(120)
            await pg.wait_for_timeout(900)
            print(' ', k, code, '→ amis vainqueurs :', await pg.evaluate("__test.s.entered"), '| fini :', await pg.evaluate("__test.s.over"))
            if k == ann[1]: await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/s16d-deux-amis.png')
        await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/s16d-cristal.png')
        await pg.wait_for_timeout(1800)
        print('fin :', await pg.evaluate("document.getElementById('infoMesuresFin').textContent"), '| écran de fin visible :', await pg.evaluate("!document.getElementById('ovEnd').hidden"), '|', await pg.evaluate("document.getElementById('endTitle').textContent"))
        await pg.screenshot(path='/tmp/s16d-fin.png')
        print('ERREURS :', errs or 'aucune'); await b.close()
asyncio.run(main())
