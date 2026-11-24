# combien de temps prend la cuisson d'une image de Grosbec et d'un golem ; et les réserves de textes restent-elles petites ?
import os
PAGE = 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'combat-sage.html')
import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']); errs = []
        for nom, vp, dsf in [('téléphone', {'width': 390, 'height': 844}, 3), ('tablette', {'width': 1024, 'height': 768}, 2)]:
            pg = await (await b.new_context(viewport=vp, device_scale_factor=dsf, is_mobile=True, has_touch=True)).new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
            await pg.goto(PAGE + '#rapide'); await pg.wait_for_timeout(4500)
            avant = await pg.evaluate('__test.cuits')
            await pg.click('#bStart'); await pg.wait_for_timeout(1500)
            q0 = await pg.evaluate('__test.q')
            cdp = await pg.context.new_cdp_session(pg); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
            await pg.wait_for_timeout(9000)
            q1 = await pg.evaluate('__test.q'); cu = await pg.evaluate('__test.cuits'); ca = await pg.evaluate('__test.caches')
            await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
            m = await pg.evaluate('__test.mesure()')
            print(nom, '| cuits pendant la lecture (golems, poses de Grosbec, file Grosbec, file golems) :', avant, '| finesse', q0, '→', q1, '| cuits en jeu :', cu, '| textes, mots :', ca, '| cuisson :', {k: round(v, 1) for k, v in m.items()})
            await pg.close()
        print('ERREURS :', errs or 'aucune'); await b.close()
asyncio.run(main())
