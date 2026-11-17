"""Enquête 3 : LE SAGE COMPARE LES ÉCRITURES (17 novembre ; Bible §13.58) — Playwright.
Le Livre d'or n'est plus dans le Grand Livre le matin : le maire le confie au Sage quand il rend le tableau. « Comparer les écritures »
n'existe qu'avec la lettre ET le Livre d'or : la lettre en haut, douze mots à toucher, « Tu en es sûr ? », autant d'essais qu'il veut (Romain, 17 novembre). Mélusine : le code
« L'écriture de Mélusine » pour le Barde, qui ouvre son accusation. Deux ratés : la page se ferme (le filet de la fête reste).
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-ecritures.py
(les outils sont ceux de tools/e3-secret.py)"""
import os
ICI = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(ICI, 'e3-secret.py'), encoding='utf-8').read().split("with sync_playwright() as p:")[0])
OUT = os.path.join(ICI, '..', 'test', 'e3-ecritures'); os.makedirs(OUT, exist_ok=True)

def designer(pg, qui, oui=True):
    page(pg, 'quiecrit')
    b = pg.locator(f'#livre-ici .lv-page.on [data-act=ec-designer][data-id={qui}]')
    b.scroll_into_view_if_needed(); b.click(); pg.wait_for_timeout(300)
    t = texte(pg)
    if oui: pg.locator('#voile [data-act=confirmer-oui]').click(); pg.wait_for_timeout(400)
    return t

def sage_pret(b, vue):
    """un Sage, l'après-midi, le tableau rendu, la lettre reçue"""
    pg = debut(b, 'sage', vue)
    verifier('livredor' not in pages(pg) and 'quiecrit' not in pages(pg), 'le matin : pas de Livre d\'or dans le Grand Livre, pas de page pour comparer')
    pg.evaluate("() => { M.P().vus['sage:mairie:tableau'] = 'ok'; M.sauver(); }")
    moment_suivant(pg, 'sage')
    ev(pg, 'lieu', {'id': 'mairie'}); pg.wait_for_timeout(200)
    if pg.locator('#voile [data-act=explorer]').count(): pg.locator('#voile [data-act=explorer]').first.click(); pg.wait_for_timeout(200)
    pg.locator('#voile [data-act=point][data-id=rendu]').first.click(); pg.wait_for_timeout(400)
    verifier('Livre d\'or' in texte(pg), 'le tableau rendu : le maire confie le Livre d\'or au Sage')
    fermer(pg)
    return pg

with sync_playwright() as p:
    b = p.chromium.launch()
    print('— Le Sage (téléphone) : deux mauvaises mains, la page se ferme')
    pg = sage_pret(b, TEL)
    L = pages(pg)
    verifier('livredor' in L and 'quiecrit' not in L, 'le Livre d\'or est dans le Grand Livre ; sans la lettre, rien à comparer')
    t = page(pg, 'livredor'); shot(pg, 'livredor')
    verifier(pg.locator('#livre-ici .lv-page.on .ec-or-mot').count() == 12 and pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page]').count() == 0 and 'Alchimiste' not in t, 'le Livre d\'or : douze mots, plus de bouton « Donner ce livre à l\'Alchimiste »')
    code(pg, 'obj:lettre')
    verifier('quiecrit' in pages(pg), 'avec la lettre : la page « Comparer les écritures »')
    t = page(pg, 'quiecrit'); shot(pg, 'comparer')
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ec-designer]').count() == 12 and 'essai' not in t and pg.locator('#livre-ici .lv-page.on .ec-compare-l').count() == 1, 'la lettre en haut, douze mots à désigner, et plus un mot sur des essais (pas de carnet : une seule feuille)')
    verifier(not any(x in t for x in ['« M »', '« t »', '« i »', 'pointu', 'vague']), 'rien ne dit quelles lettres regarder')
    t = designer(pg, 'gaspard', oui=False)
    verifier('Tu en es sûr' in t and 'Gaspard' in t and 'essai' not in t, '« Tu en es sûr ? Gaspard aurait écrit la lettre ? » (sans parler d\'essais)')
    pg.locator('#voile .btn.second').first.click(); pg.wait_for_timeout(300)
    # (Romain, 17 novembre, 7 h 10) plus d'essais : il se trompe autant qu'il veut, rien ne se ferme
    designer(pg, 'gaspard'); t = texte(pg)
    verifier('ne se ressemblent pas' in t and 'Cherche encore' in t and 'essai' not in t and pg.locator('#voile .b-donne').count() == 0, f'Gaspard : « {t[:90]} »')
    fermer(pg)
    designer(pg, 'margot'); t = texte(pg)
    verifier('ressemble beaucoup' in t and 'Cherche encore' in t and pg.locator('#voile .b-donne').count() == 0, f'Margot : « {t[:110]} »')
    fermer(pg)
    for q in ['iris', 'victor', 'gaspard', 'margot']:
        designer(pg, q); fermer(pg)
    t = page(pg, 'quiecrit'); shot(pg, 'encore')
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ec-designer]').count() == 12 and 'trouver autrement' not in t and pg.evaluate("() => M.P().vus['sage:ecriture'] !== 'rate' && !M.P().objets['_info:cest_melusine']"), 'six erreurs : les douze mots sont toujours là, rien ne s\'est fermé')
    # une partie en cours où la page s'était fermée (deux ratés, avant ce changement) : elle se rouvre
    pg.evaluate("() => { M.P().vus['sage:ecriture'] = 'rate'; M.sauver(); M.render(); }"); pg.wait_for_timeout(200)
    t = page(pg, 'quiecrit')
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ec-designer]').count() == 12, 'une partie en cours, fermée après deux ratés : la page est rouverte')
    designer(pg, 'melusine'); t = texte(pg)
    verifier('la main de Mélusine' in t and pg.evaluate("() => M.P().vus['sage:ecriture'] === 'ok' && !!M.P().objets['_info:cest_melusine']"), 'et Mélusine, enfin : le code pour le Barde')
    pg.context.close()

    print('— Le Sage (tablette) : avec le carnet d\'Odette ; il désigne Mélusine')
    pg = sage_pret(b, TAB)
    code(pg, 'obj:lettre'); code(pg, 'obj:carnet')
    t = page(pg, 'quiecrit'); shot(pg, 'comparer-tab')
    verifier(pg.locator('#livre-ici .lv-page.on .ec-compare-l').count() == 2 and 'Le carnet d\'Odette' in t, 'avec le carnet : la vraie écriture d\'Odette à côté de la lettre')
    designer(pg, 'melusine'); t = texte(pg); shot(pg, 'melusine')
    verifier('la main de Mélusine' in t and pg.locator('#voile .b-donne').count() == 1 and 'Barde' in t, f'Mélusine : la même main, et un code pour le Barde (« {t[:80]} »)')
    verifier(pg.evaluate("() => M.P().vus['sage:ecriture'] === 'ok' && !!M.P().objets['_info:cest_melusine'] && M.destinataire('info:cest_melusine') === 'barde'"), 'le code « L\'écriture de Mélusine » est à donner, au Barde')
    fermer(pg)
    t = page(pg, 'quiecrit'); shot(pg, 'trouve')
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ec-designer]').count() == 0 and pg.locator('#livre-ici .lv-page.on .ec-or-bon').count() == 1 and pg.locator('#livre-ici .lv-page.on .b-donne').count() == 1, 'la page garde le mot de Mélusine entouré, et le code à redonner')
    seq = pg.evaluate("() => M.code('info:cest_melusine')")
    pg.context.close()

    print('— Le Barde : le code du Sage ouvre l\'accusation de Mélusine')
    pg = debut(b, 'barde', TAB)
    ev(pg, 'ma-debut'); fermer(pg)
    moment_suivant(pg, 'barde')
    vis = lambda pnj: pg.evaluate("(pnj) => M.E().pnj[pnj].questions.map(function(q, i){ return !M.barde.cachee(pnj, q) ? i : -1; }).filter(function(i){ return i >= 0; })", pnj)
    verifier(4 not in vis('melusine') and 4 not in vis('margot'), f'sans le code : ni Mélusine ni Margot ne peuvent être accusées ({vis("melusine")})')
    code(pg, 'info:ecriture')
    verifier(4 not in vis('melusine'), 'l\'ancien code « Deux écritures » n\'ouvre plus rien')
    t = code(pg, 'info:cest_melusine')
    verifier('Mélusine' in t and 4 in vis('melusine') and 4 in vis('margot'), f'le code du Sage : « C\'est vous qui avez écrit la lettre. » ({t[:70]})')
    pg.context.close()
    b.close()

vrais = [e for e in erreurs if 'favicon' not in e]
print('Erreurs de console :', len(vrais))
for e in vrais[:8]: print('   ', e[:300])
if echecs or vrais:
    print(f'RATÉ : {len(echecs)} vérification(s), {len(vrais)} erreur(s)'); sys.exit(1)
print('Tout est bon : le Sage compare les écritures.')
