"""Enquête 3 : l'accusation et la fin animée (Playwright) — la fin décidée par Romain le 13 novembre (Bible §13.33 et §13.35).

  le Sage : tant qu'il n'a pas reçu « Léo a parlé » (le code du Pisteur, à la fin du donjon), il ne peut pas accuser (« Pas encore… ») ;
    il le reçoit ; les trois accusations, dans l'ordre : OÙ est Odette ? QUI a écrit la fausse lettre ? QUI se cachait sous la cape
    noire ? ; une mauvaise accusation coûte un cœur ; plus de question du Corbeau ; le code de fin ;
    la fin : six images, chacune avec son 🔊 — quatre petites scènes animées (le maire descend, « Qu'avez-vous fait à Léo ? », la bague,
    « Gardes ! Attrapez-les ! »), le cachot et sa plume noire, puis « Fin de l'enquête 3… mais ce n'est que le début. » ; le calepin ;
  le cachot : sous l'image, mon code d'apparence et le pavé ; le code d'un ami tapé, il n'est plus une ombre ; les quatre : plus de pavé ;
  les autres tablettes : le code de fin du Sage donne la même fin ;
  ce qui est retiré : « Retenir le maire », « Léo attrapé / enfui », « Ce que Léo a dit », le Corbeau ;
  l'enquête 2 : ses codes de fin n'ont pas bougé.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-fin.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-fin'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom, attendre=400):
    n[0] += 1; pg.wait_for_timeout(attendre); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e && !e.hidden ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle, garder=False, seq=None):
    seq = seq or pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(450)
    t = texte(pg)
    if not garder: fermer(pg)
    return t

def sans_son(pg, sel='#voile'):
    return pg.evaluate("""(sel) => { var r = [];
      [].forEach.call(document.querySelectorAll(sel + ' p'), function(p){
        if(p.classList.contains('doux')) return;
        var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
        var a = p.querySelector('.b-lire') || (p.nextElementSibling && p.nextElementSibling.classList.contains('b-lire') ? p.nextElementSibling : null);
        if(mots > 3 && !a) r.push(t.slice(0, 50)); });
      return r; }""", sel)

def debut(b, nom, role, enquete=3):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true; window.BRUMEVAL_SANS_DONJON = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click(f'[data-act=mode-test][data-i="{enquete}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; }")
    return pg

def nuit_sage(pg):
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)

def accuser(pg, qui, ou, cape):
    """les trois accusations, dans l'ordre de Romain : OÙ, QUI a écrit, QUI sous la cape"""
    pg.evaluate("() => { M.UI.modal = null; M.A.accuser(); }"); pg.wait_for_timeout(250)
    pg.locator(f'#voile [data-act=acc-choix][data-k=ou][data-v={ou}]').click(); pg.wait_for_timeout(200)
    pg.locator(f'#voile [data-act=acc-choix][data-k=qui][data-v={qui}]').click(); pg.wait_for_timeout(200)
    pg.locator(f'#voile [data-act=acc-choix][data-k=quoi][data-v={cape}]').click(); pg.wait_for_timeout(200)
    pg.locator('#voile [data-act=acc-valider]').click(); pg.wait_for_timeout(350)

def diapo(pg):
    return pg.evaluate("""() => { var a = document.querySelector('.b-fin-slide'); if(!a) return null;
      return {n:+a.dataset.n, t:a.querySelector('p').textContent, son:!!a.querySelector('.b-lire'), scene:(a.querySelector('.sf-scene') || {className:''}).className,
        gens:a.querySelectorAll('.sf-gens').length, gardes:a.querySelectorAll('.sf-garde').length, bulles:[].map.call(a.querySelectorAll('.sf-bulle'), function(b){ return b.textContent; }),
        prison:!!a.querySelector('.b-prison'), plume:!!a.querySelector('.b-prison-plume'), points:document.querySelectorAll('.b-points i').length,
        pave:a.querySelectorAll('.b-prison-codes [data-act=sym]').length, connus:a.querySelectorAll('.b-prison-ombre.connu').length, ombres:a.querySelectorAll('.b-prison-ombre').length}; }""")

def histoire(pg, nom, capt=True):
    """toute la fin, image par image : rend la liste des diapos"""
    l = []
    for i in range(12):
        d = diapo(pg)
        if not d: break
        l.append(d)
        if capt: shot(pg, f'{nom}-{i + 1}', 2600 if i < 5 else 7400)
        pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    return l


with sync_playwright() as p:
    b = p.chromium.launch()
    # ======================================================================== ce qui est retiré
    print('— Ce qui est retiré (Romain, 13 novembre, 18 h 08)')
    pg = debut(b, 'Barde', 'barde')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    E = pg.evaluate("() => { var E = M.E(); return {retenir:!!E.retenir, corbeau:!!E.corbeau, leo:!!(E.grands && E.grands.leo), infos:Object.keys(E.infos).filter(function(k){ return /^(leo_|maire_)/.test(k); }).sort(), missions:E.etapes.barde.map(function(x){ return x.t; }).join(' | ')}; }")
    verifier(not E['retenir'] and not E['corbeau'] and not E['leo'], '« Retenir le maire », la question du Corbeau et la scène de Léo chez le Barde n\'existent plus')
    verifier(E['infos'] == ['leo_battu', 'leo_la'], f'les codes de Léo : « L\'homme en cape est là ! » (pour le Barde) et « Léo a parlé » (pour le Sage) ; plus de « Léo attrapé », « Léo s\'est enfui », « Ce que Léo a dit », « Le maire est retenu » ({E["infos"]})')
    verifier('retiens-le' not in E['missions'] and 'Tes amis se battent' in E['missions'], 'la mission de la nuit du Barde : plus « retiens-le », mais « Tes amis se battent, tout au fond ! »')
    pg.context.close()

    # ======================================================================== le Sage : pas avant que Léo ait parlé
    print('— Le Sage : l\'accusation attend Léo, puis les trois questions, la fin')
    pg = debut(b, 'Sage', 'sage')
    nuit_sage(pg)
    pg.evaluate("() => { M.UI.modal = null; M.A.accuser(); }"); pg.wait_for_timeout(250)
    t = texte(pg)
    verifier('Pas encore' in t and 'homme en cape' in t and pg.locator('#voile [data-act=acc-choix]').count() == 0 and not sans_son(pg), f'sans « Léo a parlé », le Sage ne peut pas accuser : « Pas encore… » (avec son 🔊) ({t[:60]})')
    fermer(pg)
    t = code(pg, 'info:leo_battu', True)
    verifier('Léo a parlé' in t and 'apprenti du meunier' in t and 'le maire qui a tout préparé' in t and 'ville entière' in t and 'Place aux accusations' in t and not sans_son(pg), f'le Sage reçoit « Léo a parlé » : ce que Léo a dit, « Place aux accusations ! » ({t[:50]})')
    fermer(pg)
    verifier(pg.evaluate("() => M.finVariante()") == 2 and pg.evaluate("() => M.idVictoire(1)") == 'victoire:21', 'le code de fin : toujours la scène où Léo est là')
    c0 = pg.evaluate("() => M.coeurs()")
    pg.evaluate("() => { M.UI.modal = null; M.A.accuser(); }"); pg.wait_for_timeout(250)
    verifier('OÙ est Odette' in texte(pg) and pg.locator('#voile [data-act=acc-choix][data-k=ou]').count() == 10, 'la première question : « OÙ est Odette ? »')
    pg.locator('#voile [data-act=acc-choix][data-k=ou][data-v=clocher]').click(); pg.wait_for_timeout(200)
    verifier('QUI a écrit la fausse lettre' in texte(pg), 'la deuxième : « QUI a écrit la fausse lettre ? »')
    pg.locator('#voile [data-act=acc-choix][data-k=qui][data-v=melusine]').click(); pg.wait_for_timeout(200)
    verifier('QUI se cachait sous la cape noire' in texte(pg) and pg.locator('#voile [data-act=acc-choix][data-k=quoi] .b-suspect-img').count() == 10, 'la troisième : « QUI se cachait sous la cape noire ? », dix visages')
    shot(pg, 'cape')
    pg.locator('#voile [data-act=acc-choix][data-k=quoi][data-v=farinel]').click(); pg.wait_for_timeout(200)
    verifier(pg.locator('#voile .b-acc-choix').count() == 3 and pg.locator('#voile .b-acc-choix .b-acc-img').count() == 2, 'le résumé : trois réponses, deux visages et un lieu')
    shot(pg, 'resume')
    pg.locator('#voile [data-act=acc-valider]').click(); pg.wait_for_timeout(350)
    verifier('pas ça' in texte(pg) and pg.evaluate("() => M.coeurs()") == c0 - 1, 'une mauvaise accusation (Farinel sous la cape) : un cœur de moins'); fermer(pg)
    accuser(pg, 'melusine', 'clocher', 'leo')
    t = texte(pg)
    verifier('Bravo' in t and 'Corbeau' not in t and pg.locator('#voile [data-act=corbeau-choix]').count() == 0 and pg.locator('#voile [data-act=fin-sage]').count() == 1, f'la bonne accusation (au clocher, Mélusine, Léo) : « Bravo », le code de fin — plus de question du Corbeau ({t[:50]})')
    att = pg.evaluate("() => M.code('victoire:21')")
    vu = pg.evaluate("() => { var c = M.codesEnquete(M.E()); return c.parCode[M.code(M.idVictoire(1)).join('-')]; }")
    verifier(vu == 'victoire:21' and len(att) == 3, f'le code de fin montré : une erreur ({vu})')
    shot(pg, 'victoire')
    pg.locator('#voile [data-act=fin-sage]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.P().fin.variante") == 2 and pg.evaluate("() => M.P().fin.erreurs") == 1, 'la fin commence')
    verifier(pg.locator('.b-code-fin').count() == 1, 'pendant l\'histoire, le Sage garde le code de fin sous la main')
    # image par image ; au cachot (la cinquième), on s'arrête pour les codes d'apparence
    D = []
    img = {}
    for i in range(4):
        D.append(diapo(pg)); shot(pg, f'sage-{i + 1}', 2600)
        img[i] = pg.evaluate("() => { var a = document.querySelector('.b-fin-slide'); return {aterre:a.querySelectorAll('.sf-aterre').length, bulles:[].map.call(a.querySelectorAll('.sf-bulle'), function(b){ return b.textContent; }).join(' | ')}; }")
        pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    verifier(img[1]['aterre'] == 1 and 'Léo !' in img[1]['bulles'] and 'Qu\'avez-vous fait' in img[1]['bulles'] and 'trop parlé' not in img[1]['bulles'], f'dans l\'image : Léo est à terre, et le maire fait l\'étonné (« Léo ! », « Qu\'avez-vous fait ?! ») ({img[1]})')
    verifier('Attrapez-les' in img[3]['bulles'] and 'Enfermez' not in img[3]['bulles'], f'dans l\'image des gardes : « Gardes ! Attrapez-les ! », comme dans le texte ({img[3]["bulles"]})')
    d = diapo(pg); D.append(d)
    verifier(d['prison'] and d['plume'] and 'cachot' in d['t'] and d['ombres'] == 3 and d['connus'] == 0 and d['pave'] == 12, f'la cinquième image : le cachot, la plume noire, trois ombres, et le pavé des codes d\'apparence ({d["ombres"]} ombres, {d["pave"]} touches)')
    verifier('Ton code' in pg.inner_text('.b-prison-codes') and pg.locator('.b-prison-codes [data-act=lire], .b-prison-codes .b-lire').count() >= 1, 'sous l\'image : « Montre ton code à tes amis… », mon code, un 🔊')
    shot(pg, 'cachot-ombres', 7400)
    moi = pg.evaluate("() => M.code(M.allureCodeFin())")
    for sym in moi: pg.locator(f'.b-prison-codes [data-act=sym][data-s="{sym}"]').click(); pg.wait_for_timeout(120)
    pg.wait_for_timeout(600)
    verifier(diapo(pg)['connus'] == 0 and pg.evaluate("() => M.P().etape") == 'fin', 'mon propre code tapé : rien ne change (« C\'est ton code à toi ! »)')
    amis = pg.evaluate("() => ['pisteur', 'alchimiste', 'barde'].map(function(r, i){ return M.code('allure:' + M.allureNumero(r, {sexe:i % 2 ? 'm' : 'f', peau:'p' + (i + 2), cheveux:['roux', 'noir', 'blond'][i]})); })")
    for k, seq in enumerate(amis):
        for sym in seq: pg.locator(f'.b-prison-codes [data-act=sym][data-s="{sym}"]').click(); pg.wait_for_timeout(120)
        pg.wait_for_timeout(600)
        d = diapo(pg)
        verifier(d['connus'] == k + 1 and d['n'] == 4, f'le code d\'apparence d\'un ami tapé : il n\'est plus une ombre ({d["connus"]} sur 3)')
    d = diapo(pg)
    verifier(d['pave'] == 0 and 'réunis' in pg.inner_text('.b-fin-slide'), 'les quatre héros sont là : plus de pavé, « Vous voilà réunis… derrière les barreaux. »')
    al = pg.evaluate("() => M.P().allures")
    verifier(al['pisteur'] == {'sexe': 'f', 'peau': 'p2', 'cheveux': 'roux'} and al['barde'] == {'sexe': 'f', 'peau': 'p4', 'cheveux': 'blond'} and al['alchimiste']['sexe'] == 'm', f'chacun avec sa peau et ses cheveux ({al})')
    shot(pg, 'cachot-quatre', 1200)
    pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    D.append(diapo(pg)); shot(pg, 'sage-6', 800)
    pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    verifier(len(D) == 6 and all(d['points'] == 6 for d in D), f'six images ({len(D)})')
    verifier(all(d['son'] for d in D), 'chaque image a son 🔊')
    verifier([d['scene'].split('sf-e3-')[-1].split(' ')[0] if 'sf-e3-' in d['scene'] else '' for d in D] == ['minuit', 'leo', 'bague', 'gardes', '', ''], f'quatre petites scènes animées, dans l\'ordre ({[d["scene"][-12:] for d in D]})')
    verifier('des pas descendent' in D[0]['t'] and D[0]['gardes'] == 2 and 'DONG' not in D[0]['t'] and 'inuit' not in D[0]['t'], 'la crypte : le maire descend avec Silas et deux gardes ; ni minuit ni « DONG »')
    verifier('Que s\'est-il passé ici' in D[1]['t'] and 'Qu\'avez-vous fait à Léo' in D[1]['t'] and D[1]['gens'] == 3, f'« Que s\'est-il passé ici ? Léo ! Qu\'avez-vous fait à Léo ? » — Léo est dans l\'image ({D[1]["t"][:50]})')
    verifier('bague en argent' in D[2]['t'] and 'Beaucoup trop loin' in D[2]['t'] and 'Attrapez-les' in D[3]['t'] and 'Monsieur le maire' in D[3]['t'] and D[3]['gardes'] == 2, 'la bague (« Vous êtes allés trop loin »), puis Silas (« Monsieur le maire… ? ») et « Gardes ! Attrapez-les ! »')
    verifier('Fin de l\'enquête 3' in D[5]['t'] and 'ce n\'est que le début' in D[5]['t'] and not D[5]['prison'], 'la dernière image : « Fin de l\'enquête 3… mais ce n\'est que le début. »')
    verifier(pg.evaluate("() => window.__lus.length") == 0, 'rien ne s\'est lu tout seul')
    cal = pg.evaluate("() => M.S.calepin.filter(function(c){ return c.e === 3; }).map(function(c){ return c.t; })")
    verifier(len(cal) == 8 and any('tête de corbeau' in c for c in cal) and any('quatre signes' in c and 'toujours' in c for c in cal) and any('ville entière' in c for c in cal) and any('jamais voulu être meunier' in c for c in cal), f'le calepin de fin : huit notes (la bague, Odette toujours derrière la porte, la ville sous Brumeval, Léo) ({len(cal)})')
    verifier(pg.evaluate("() => M.P().fin.etape") == 'recompenses' and pg.locator('h1').first.inner_text() == 'Enquête résolue !', 'puis « Enquête résolue ! »')
    shot(pg, 'resolue')
    codeFin = att
    pg.context.close()

    # ======================================================================== les autres tablettes : le code de fin
    print('— Les autres tablettes : le code de fin')
    pg = debut(b, 'Pisteur', 'pisteur')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.code('victoire:21')") == codeFin, 'le même code sur une autre tablette')
    code(pg, 'victoire:21', True); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.P().etape") == 'fin' and pg.evaluate("() => M.P().fin.variante") == 2 and pg.evaluate("() => M.P().fin.erreurs") == 1, 'le Pisteur tape le code de fin du Sage : la fin, une erreur')
    Dp = histoire(pg, 'pisteur', False)
    verifier(len(Dp) == 6 and [d['t'] for d in Dp] == [d['t'] for d in D], 'sa scène finale est la même, mot pour mot')
    pg.context.close()
    pg = debut(b, 'Alchi', 'alchimiste')
    a = pg.evaluate("() => { var l = [], vus = {}; ['sage', 'alchimiste', 'pisteur', 'barde'].forEach(function(r){ ['f', 'm'].forEach(function(sx){ ['p1', 'p6'].forEach(function(pe){ ['brun', 'rose'].forEach(function(ch){ var n = M.allureNumero(r, {sexe:sx, peau:pe, cheveux:ch}), d = M.allureDe(n); l.push(d.role === r && d.sexe === sx && d.peau === pe && d.cheveux === ch && !vus[n]); vus[n] = 1; }); }); }); }); return [l.every(Boolean), M.allureNumero('sage', {sexe:'f', peau:'p1', cheveux:'brun'}), M.allureNumero('pisteur', {sexe:'f', peau:'p1', cheveux:'brun'}), M.allureNumero('barde', {sexe:'m', peau:'p6', cheveux:'rose'})]; }")
    verifier(a == [True, 0, 216, 431], f'les codes d\'apparence : les 216 du Sage et de l\'Alchimiste n\'ont pas bougé, ceux du Pisteur et du Barde viennent après (216 à 431) {a}')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    t = code(pg, 'allure:300', True)
    verifier(pg.evaluate("() => !(M.P().allures || {}).pisteur && !(M.P().allures || {}).barde") and 'équipier' in texte(pg), 'avant la fin, un code d\'apparence ne se tape que chez le Pisteur (comme avant)')
    pg.context.close()

    # ======================================================================== l'enquête 2 : rien ne change
    print('— L\'enquête 2')
    pg = debut(b, 'Sage2', 'sage', 2)
    verifier(pg.evaluate("() => M.finVariante()") == 0 and pg.evaluate("() => M.idVictoire(2)") == 'victoire:2' and pg.evaluate("() => M.code('victoire:2').join('-')") == 'coeur-lune-flamme', 'enquête 2 : pas de variante, ses codes de fin n\'ont pas bougé')
    pg.evaluate("() => { M.UI.modal = null; M.A.accuser(); }"); pg.wait_for_timeout(250)
    verifier(pg.locator('#voile [data-act=acc-choix][data-k=qui]').count() > 3 and 'Pas encore' not in texte(pg), 'enquête 2 : le Sage accuse quand il veut, et d\'abord « QUI »')
    pg.context.close()
    b.close()

print()
if erreurs: print('ERREURS DE PAGE :'); [print('  ', e[:300]) for e in erreurs[:12]]
if echecs: print(f'{len(echecs)} ÉCHEC(S) :'); [print('  ✗', e) for e in echecs]
else: print('Tout est bon.')
sys.exit(1 if (echecs or erreurs) else 0)
