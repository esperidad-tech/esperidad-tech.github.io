import sys
from playwright.sync_api import sync_playwright
f='file://'+__import__('os').path.abspath('dist/salle-mini-jeux.html')
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_context(viewport={'width':800,'height':1280}).new_page()
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(500)
    print('jeux:', pg.eval_on_selector_all('[data-jeu]', 'l=>l.map(x=>x.dataset.jeu)'))
    def partie(gagner, nom):
        pg.click('[data-niv="3"]'); pg.click('[data-jeu="mots"]'); pg.wait_for_timeout(400)
        # passer l'intro du mini-jeu
        for sel in ['.mj-go', 'text=Jouer', 'text=C\'est parti']:
            if pg.locator(sel).count(): pg.locator(sel).first.click(); break
        pg.wait_for_timeout(600)
        pg.screenshot(path='../verif-mots-'+nom+'-0.png')
        n=pg.locator('[data-trou]').count(); print(nom, 'trous', n, 'mots', pg.locator('[data-mot]').count())
        # solution: lire les bons mots via le DOM n'est pas possible; on remplit par essai via JS interne : on prend le mot attendu depuis les params
        for i in range(n):
            pg.locator('[data-trou]').nth(i).click()
            mots=pg.eval_on_selector_all('[data-mot]:not([disabled])', 'l=>l.map(x=>x.textContent)')
            att = pg.evaluate('i=>window.__mmAttendu ? window.__mmAttendu[i] : null', i)
            choix = att if gagner else ([m for m in mots if m!=att] or mots)[0]
            if gagner and i>0: pass
            pg.locator('[data-mot]:not([disabled])', has_text=choix).first.click(); pg.wait_for_timeout(80)
        pg.screenshot(path='../verif-mots-'+nom+'-1.png')
        pg.click('.mm-valider'); pg.wait_for_timeout(900)
        pg.screenshot(path='../verif-mots-'+nom+'-2.png')
        print(nom, 'texte fin:', pg.inner_text('#sl-plein')[:200].replace('\n',' | '))
    partie(True,'gagne')
    pg.locator('.sl-quitter, .mj-continuer').first.click() if pg.locator('.mj-continuer').count() else None
    pg.wait_for_timeout(500)
    partie(False,'perdu')
    for sel in ['text=Continuer','text=Retour','.sl-quitter']:
        if pg.locator(sel).count(): pg.locator(sel).first.click(); break
    pg.wait_for_timeout(600)
    print('journal:', pg.inner_text('.sl-journal') if pg.locator('.sl-journal').count() else '-')
    print('errs', errs)
    b.close()
