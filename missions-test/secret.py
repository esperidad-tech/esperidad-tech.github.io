import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.environ['BRUMEVAL_DIST'], 'index.html')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_default_timeout(30000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=sage]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', 'S'); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=ecran][data-e=reglages]'); pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.evaluate("""() => { MJ.lancer = function(el, t, pa, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 20); return {arreter:function(){}}; }; }""")
    def code(c):
        for s in pg.evaluate(f"() => M.code('{c}')"): pg.evaluate(f"() => M.A.sym({{dataset:{{s:'{s}'}}}})")
        pg.wait_for_timeout(400); pg.evaluate("() => { M.UI.modal = null; M.render(); }")
    r = {}
    code('pot:revelatrice'); r['potion'] = pg.evaluate("() => M.P().potions.revelatrice")
    pg.evaluate("() => { M.P().actions = 9; M.A['ouvrir-page']({dataset:{id:'blanche'}}); }"); pg.wait_for_timeout(300)
    r['blanche'] = pg.evaluate("() => !!M.P().pages.blanche")
    code('obj:cle_arch'); r['cle'] = pg.evaluate("() => !!M.P().recus['obj:cle_arch']")
    pg.evaluate("() => { M.UI.modal = null; M.P().actions = 9; M.A['ouvrir-page']({dataset:{id:'archives'}}); }"); pg.wait_for_timeout(300)
    r['archives'] = pg.evaluate("() => !!M.P().pages.archives")
    r['secret_ouvrable'] = pg.evaluate("() => M.besoinOk(M.E().pages.filter(function(p){ return p.id === 'secret'; })[0].besoin)")
    pg.evaluate("() => { M.UI.modal = null; M.P().actions = 9; M.A['ouvrir-page']({dataset:{id:'secret'}}); }"); pg.wait_for_timeout(500)
    r['secret'] = pg.evaluate("() => !!M.P().pages.secret")
    r['mission'] = pg.evaluate("() => { M.render(); return JSON.stringify(M.P().mission.faits); }")
    print(r, errs)
    b.close()
