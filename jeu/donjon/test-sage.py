"""Test de la tablette du Sage (donjon-sage.html) — les règles de Romain, les codes, les pages blanches, l'encre invisible,
le coin déchiré, la mémoire, la fluidité.

    flock /tmp/brumeval-pw.lock python3 test-sage.py            (tout, avec la mesure de fluidité)
    flock /tmp/brumeval-pw.lock python3 test-sage.py --vite     (sans la mesure de fluidité)
Captures dans pages/captures/ (sage-*.png). Refaire la page avant : python3 pages/assembler.py"""
import os, sys, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pages'))
from playwright.sync_api import sync_playwright
from outils_test import Bilan, contexte, page, capture, regles, muet, mesurer_glisse

VITE = '--vite' in sys.argv
CODES = {'rune:lumiere': ['flamme', 'etoile', 'cle'], 'page:dechiree': ['cle', 'flamme', 'poisson'], 'page:blanche': ['cloche', 'chat', 'soleil'], 'porte:odette': ['chapeau', 'lune', 'coeur'],
         'faux': ['lune', 'lune', 'lune'], 'recette:givre': ['champi', 'coeur', 'cle'],
         'etude:gardien': ['cloche', 'cle', 'soleil'], 'etude:rat': ['chat', 'champi', 'etoile'], 'carnet:aventurier': ['chapeau', 'arbre', 'poisson']}
b = Bilan('Sage')


def clic(pg, sel):
    pg.locator(sel).first.click(force=True)


def taper(pg, nom):
    clic(pg, '#b-code')
    pg.wait_for_selector('.pave-fen')
    for k in CODES[nom]:
        clic(pg, '.pave [data-sym="%s"]' % k)
    pg.wait_for_timeout(450)


def ecran(pg, wx, wy):
    z = pg.evaluate('SAGE.zoom()')
    return z['tx'] + (wx - z['pv']['x']) * z['z'], z['ty'] + (wy - z['pv']['y']) * z['z']


def parcours(nav, appareil):
    print('\n=== %s ===' % appareil)
    t = 'tab' if appareil == 'tablette' else 'tel'
    ctx = contexte(nav, appareil)
    pg, err = page(ctx, 'donjon-sage.html')
    pg.wait_for_timeout(900)
    b.ok(pg.evaluate('!!document.querySelector(".plan-svg")'), 'le plan des Fondateurs est dessiné')
    b.ok(pg.evaluate('document.querySelector(".coin").hidden'), 'le coin déchiré manque au départ')
    # Romain, 10 novembre : la rune se trouve dans le donjon (au fond du puits) ; au départ, le Sage ne l'a pas
    b.ok(not pg.is_visible('#rune') and 'rune' not in pg.inner_text('#bulle').lower(), 'au départ : pas de rune sur la table (le Pisteur doit la trouver), et le conteur n’en parle pas')
    regles(b, pg, 'départ'); muet(b, pg, 'départ')
    capture(pg, 'sage-depart-' + t)
    # --- glisser et zoomer ---
    z0 = pg.evaluate('SAGE.zoom()')
    clic(pg, '#b-plus'); pg.wait_for_timeout(400)
    z1 = pg.evaluate('SAGE.zoom()')
    b.ok(z1['z'] > z0['z'] * 1.3, 'le bouton ＋ approche le plan (%.2f → %.2f)' % (z0['z'], z1['z']))
    pg.mouse.move(400, 300); pg.mouse.down(); pg.mouse.move(330, 260, steps=6); pg.mouse.up(); pg.wait_for_timeout(200)
    z2 = pg.evaluate('SAGE.zoom()')
    b.ok(abs(z2['tx'] - z1['tx']) > 20, 'le plan glisse sous le doigt')
    clic(pg, '#b-moins'); pg.wait_for_timeout(400)
    # --- un code faux, un code pour un autre ---
    taper(pg, 'faux')
    b.ok('ne veut rien dire' in pg.inner_text('.pave-msg'), 'un code faux est refusé gentiment')
    regles(b, pg, 'pavé + refus')
    for k in CODES['recette:givre']:
        clic(pg, '.pave [data-sym="%s"]' % k)
    pg.wait_for_timeout(450)
    b.ok('pour le Pisteur' in pg.inner_text('.pave-msg'), 'le code d’une autre tablette dit à qui il est')
    capture(pg, 'sage-pave-' + t)
    clic(pg, '.pave-fen .fermer')
    # --- page:blanche → une 4e page ---
    taper(pg, 'page:blanche')
    b.ok(pg.is_visible('.scene'), 'page:blanche : la petite scène s’ouvre')
    regles(b, pg, 'scène page blanche')
    clic(pg, '[data-ouvrir]'); pg.wait_for_timeout(300)
    b.ok(pg.locator('.livre .page').count() == 4, 'le Grand Livre a maintenant 4 pages')
    b.ok(pg.is_visible('.livre [data-page="4"].guide'), 'le rond jaune montre la page trouvée')
    regles(b, pg, 'Grand Livre')
    # --- utiliser une page ---
    clic(pg, '.livre [data-page="2"]'); pg.wait_for_timeout(300)
    b.ok('Utiliser cette page' in pg.inner_text('.question'), 'toucher une page demande « Utiliser cette page ? »')
    b.ok(pg.inner_text('.question .aller').strip() == 'Oui, j’écris le sort' and pg.is_visible('.question .sombre'), 'bouton jaune « Oui, j’écris le sort » et bouton sombre « Non »')
    regles(b, pg, 'confirmation')
    clic(pg, '.question [data-non]'); pg.wait_for_timeout(250)
    b.ok(not pg.evaluate('SAGE.etat().pages[2]'), '« Non » ne gâche pas la page')
    clic(pg, '.livre [data-page="2"]'); pg.wait_for_timeout(250); clic(pg, '.question [data-oui]'); pg.wait_for_timeout(2600)
    b.ok(pg.get_attribute('.page-fen .code-grand', 'data-code') == 'sauve:2', 'la page 2 affiche son code (sauve:2) en grand')
    capture(pg, 'sage-page-ecrite-' + t)
    regles(b, pg, 'page écrite')
    clic(pg, '.page-fen [data-fen-fermer].aller'); pg.wait_for_timeout(300)
    b.ok(pg.get_attribute('.livre [data-voir="2"] .code-grand', 'data-code') == 'sauve:2', 'la page utilisée garde son code, lisible')
    b.ok(pg.inner_text('#b-livre .badge') == '3', 'il reste 3 pages blanches')
    capture(pg, 'sage-livre-' + t)
    clic(pg, '.livre .fermer'); pg.wait_for_timeout(200)
    taper(pg, 'page:blanche')
    b.ok('déjà reçu' in pg.inner_text('.pave-msg'), 'un code ne marche qu’une fois (page:blanche)')
    clic(pg, '.pave-fen .fermer')
    # --- la rune de lumière arrive par son code ---
    taper(pg, 'rune:lumiere')
    b.ok(pg.is_visible('.scene') and 'éboulis' in pg.inner_text('.scene') and 'puits' not in pg.inner_text('.scene'), 'rune:lumiere : la petite scène s’ouvre (la pierre trouvée parmi les éboulis ; on ne parle pas du puits : l’entrée peut être la crypte)')
    regles(b, pg, 'scène de la rune')
    capture(pg, 'sage-rune-' + t)
    clic(pg, '.scene [data-fen-fermer].aller'); pg.wait_for_timeout(900)
    b.ok(pg.is_visible('#rune.guide'), 'la rune est posée en bas, et le rond jaune la montre')
    # --- l'encre invisible : la vraie rune, promenée au doigt (souris) sur la grotte de la fleur de givre ---
    # (jusqu'au 11 novembre : sur le cul-de-sac éboulé — le passage secret du crâne a été enlevé à la demande de Romain)
    vide = pg.evaluate('(() => { var c = document.querySelector("canvas.encre[data-note=fleur]"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data, n = 0; for(var i = 3; i < d.length; i += 16) if(d[i] > 0) n++; return n; })()')
    b.ok(vide == 0, 'l’encre est invisible au départ')
    pg.evaluate('SAGE.centrerSur(905, 1188, 1)'); pg.wait_for_timeout(900)
    r = pg.locator('#rune').bounding_box()
    pg.mouse.move(r['x'] + r['width'] / 2, r['y'] + r['height'] / 2); pg.mouse.down()
    for yy in range(1150, 1234, 22):
        for xx in (range(760, 1060, 30) if (yy // 22) % 2 else range(1050, 755, -30)):
            sx, sy = ecran(pg, xx, yy)
            pg.mouse.move(sx, sy + 54)
    pg.mouse.up(); pg.wait_for_timeout(1300)
    S = pg.evaluate('SAGE.etat()')
    b.ok('1' in S['encre'].get('fleur', ''), 'la rune révèle l’encre là où elle passe')
    b.ok(S['encreFinie'].get('fleur'), 'assez révélée, la note se réveille : « ici pousse la fleur qui ne fond jamais »')
    b.ok(not any(n['id'] == 'crane' for n in pg.evaluate('CARTE_DONJON.PLAN.notes')) and not pg.evaluate('!!CARTE_DONJON.LIEN.secret'), 'plus de note « appuie sur le crâne » ni de passage secret vers le feu de camp (enlevés le 11 novembre)')
    vu = pg.evaluate('(() => { var c = document.querySelector("canvas.encre[data-note=fleur]"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data, n = 0; for(var i = 3; i < d.length; i += 16) if(d[i] > 0) n++; return n; })()')
    b.ok(vu > 200, 'l’encre est visible sur le plan (%d points)' % vu)
    b.ok('fleur' in pg.inner_text('#bulle'), 'le conteur dit ce que l’encre révèle')
    capture(pg, 'sage-encre-' + t)
    # l'autre note à l'encre : la rune ne l'a pas touchée
    b.ok(not S['encreFinie'].get('roue'), 'l’autre note à l’encre (la roue) reste cachée tant que la rune n’y passe pas')
    # la roue des canaux : le passage secret vers la salle de la lune, et l'ordre pour la tourner
    r3 = pg.evaluate('(() => { var n = SAGE.notes.filter(function(x){ return x.id === "roue"; })[0], b = n.boite, pts = []; for(var y = b.y + 10; y < b.y + b.h; y += 22) for(var x = b.x + 10; x < b.x + b.w; x += 26) pts.push([x, y]); var r = SAGE.promener(pts, 40); return {fini:!!SAGE.etat().encreFinie.roue, lignes:n.lignes.join(" "), passage:n.passage}; })()')
    b.ok(r3['fini'] and r3['passage'] == 'c5' and '3 à droite' in r3['lignes'] and '1 à gauche' in r3['lignes'] and '2 à droite' in r3['lignes'], 'la rune passée sur les canaux réveille l’ordre de la roue (« %s ») et le passage secret' % r3['lignes'])
    pg.evaluate('SAGE.centrerSur(1620, 1000, 1)'); pg.wait_for_timeout(900)
    capture(pg, 'sage-roue-' + t)
    # --- une note codée : la loupe, la grille, écrire les lettres ---
    pg.evaluate('SAGE.centrerSur(1020, 620, 0.9)'); pg.wait_for_timeout(900)
    sx, sy = ecran(pg, 1019.5, 619.6)
    pg.mouse.click(sx, sy); pg.wait_for_timeout(500)
    b.ok(pg.is_visible('.loupe'), 'toucher une note codée ouvre la loupe (signes en grand + grille)')
    b.ok(pg.locator('.loupe .loupe-l').count() == 17 and pg.is_visible('.loupe .cle-svg'), 'la loupe montre les 17 signes et la grille de l’alphabet secret')
    regles(b, pg, 'loupe')
    for l in 'LARUNEDORTAUPUITX':
        clic(pg, '.loupe [data-l="%s"]' % l)
    b.ok('rien dire' in pg.inner_text('.loupe-msg'), 'une mauvaise lettre : « ça ne veut rien dire »')
    clic(pg, '.loupe .loupe-l[data-i="16"]'); clic(pg, '.loupe [data-l="S"]'); pg.wait_for_timeout(200)
    b.ok(pg.evaluate('SAGE.etat().lues.rune'), 'les bonnes lettres déchiffrent la note « LA RUNE DORT AU PUITS »')
    capture(pg, 'sage-loupe-' + t)
    clic(pg, '.loupe .fermer'); pg.wait_for_timeout(200)
    b.ok(pg.evaluate('document.querySelector("[data-trad=rune]").style.display') == '', 'la traduction est notée au crayon sur le plan')
    # la note du couloir aux dalles : six signes, deux formes seulement (N et B), à côté du petit crâne rouge
    nd = pg.evaluate('(() => { var n = CARTE_DONJON.PLAN.notes.filter(function(x){ return x.id === "dalles"; })[0]; return {x:n.x, y:n.y, l:n.lignes.join("|"), crane:!!n.crane, dit:n.dit}; })()')
    pg.evaluate('SAGE.centrerSur(%f, %f, 0.9)' % (nd['x'], nd['y'])); pg.wait_for_timeout(900)
    sx, sy = ecran(pg, nd['x'], nd['y'])
    pg.mouse.click(sx, sy); pg.wait_for_timeout(500)
    b.ok(pg.is_visible('.loupe') and pg.locator('.loupe .loupe-l').count() == 6 and nd['crane'], 'la note des dalles : six signes dans la loupe, un crâne rouge à côté sur le plan')
    for l in 'NBBNBN':
        clic(pg, '.loupe [data-l="%s"]' % l)
    pg.wait_for_timeout(200)
    b.ok(pg.evaluate('SAGE.etat().lues.dalles') and 'N B B' in pg.inner_text('.loupe-msg'), 'N B B, N B N : le code du couloir aux dalles est déchiffré (noire, blanche, blanche…)')
    capture(pg, 'sage-dalles-' + t)
    clic(pg, '.loupe .fermer'); pg.wait_for_timeout(200)
    # --- le coin déchiré ---
    taper(pg, 'page:dechiree')
    regles(b, pg, 'scène page déchirée')
    clic(pg, '.scene [data-fen-fermer].aller'); pg.wait_for_timeout(1700)
    b.ok(not pg.evaluate('document.querySelector(".coin").hidden'), 'page:dechiree complète le coin du plan (le grand bassin)')
    b.ok('Bourbe' in pg.inner_text('#bulle'), 'le conteur parle de la note sur Bourbe')
    capture(pg, 'sage-coin-' + t)
    # --- Odette ---
    taper(pg, 'porte:odette')
    pg.wait_for_timeout(4300)
    b.ok('Mon gros gris' in pg.inner_text('.odette'), 'porte:odette : la voix d’Odette derrière la porte')
    regles(b, pg, 'scène Odette'); muet(b, pg, 'scène Odette')
    capture(pg, 'sage-odette-' + t)
    clic(pg, '.scene [data-fen-fermer].aller'); pg.wait_for_timeout(300)
    b.ok(pg.evaluate('document.querySelector(".coeur-odette").style.display') == '', 'le petit cœur apparaît près de la porte')
    b.ok('Odette' not in pg.evaluate('document.querySelector(".coeur-odette").textContent') and 'Odette' not in pg.evaluate('document.querySelector(".coin").textContent'), 'le plan ne marque pas « Odette » (Romain, 11 novembre)')
    taper(pg, 'porte:odette')
    b.ok('déjà reçu' in pg.inner_text('.pave-msg'), 'porte:odette ne marche qu’une fois')
    clic(pg, '.pave-fen .fermer')
    taper(pg, 'page:dechiree')
    b.ok('déjà reçu' in pg.inner_text('.pave-msg'), 'page:dechiree ne marche qu’une fois')
    clic(pg, '.pave-fen .fermer')
    # --- le carnet de l'aventurier (Romain, 10 et 11 novembre) : trouvé à l'entrée du donjon ; chaque monstre étudié y décolle une page ---
    clic(pg, '#b-livre'); pg.wait_for_timeout(300)
    b.ok(pg.locator('.livre .bete-vignette').count() == 0 and 'Pas encore de carnet' in pg.inner_text('.livre-betes'), 'Grand Livre : pas encore de carnet (c’est dit)')
    clic(pg, '.livre .fermer'); pg.wait_for_timeout(200)
    taper(pg, 'carnet:aventurier'); pg.wait_for_timeout(700)
    b.ok(pg.is_visible('.scene') and 'carnet' in pg.inner_text('.scene').lower() and 'pouvoir' not in pg.inner_text('.scene') and pg.is_visible('.scene .aller.guide'), 'le code du carnet : une petite scène (« un aventurier », sans autre précision), le rond jaune sur « Je le garde »')
    regles(b, pg, 'le carnet')
    clic(pg, '.scene .aller'); pg.wait_for_timeout(300)
    clic(pg, '#b-livre'); pg.wait_for_timeout(300)
    b.ok(pg.locator('.livre .bete-vignette').count() == 9 and 'collé' not in pg.inner_text('.livre-betes'), 'Grand Livre : le carnet est là, avec toutes ses pages dès le début (Romain, 11 novembre), sans page collée')
    clic(pg, '.livre [data-bete="bourbe"]'); pg.wait_for_timeout(500)
    b.ok(pg.is_visible('.bete-fen') and 'Bourbe' in pg.inner_text('.bete-fen h2') and pg.locator('.bete-fen .recit').count() == 3, 'on peut lire tout de suite la page de Bourbe, sans l’avoir étudié')
    clic(pg, '.bete-fen .aller'); pg.wait_for_timeout(400)
    clic(pg, '.livre .fermer'); pg.wait_for_timeout(200)
    taper(pg, 'etude:gardien'); pg.wait_for_timeout(900)
    b.ok(pg.is_visible('.bete-fen') and 'Gardien de rouille' in pg.inner_text('.bete-fen h2'), 'le code d’étude du Gardien ouvre le carnet à sa page')
    b.ok(pg.evaluate('(() => { var i = document.querySelector(".bete-fen .bete-img img"); return i.complete && i.naturalWidth > 0; })()'), 'on voit le croquis du monstre')
    b.ok(pg.locator('.bete-fen .recit').count() == 2 and pg.locator('.bete-fen .recit .lire').count() == 2 and pg.locator('.bete-fen .enigme, .bete-fen h3').count() == 0, 'le récit de l’aventurier : deux paragraphes, chacun avec son 🔊, sans titres')
    txt = pg.inner_text('.bete-fen .bete-recit').lower()
    b.ok('qui suis-je' not in txt and not any(m in txt for m in ['rune', 'acide', 'givre', 'bouclier', 'fiole', 'louche', 'potion']), 'un récit : pas de question, pas de nom de geste ni de potion')
    b.ok(pg.is_visible('.bete-fen .aller.guide'), 'le rond jaune est sur « C’est noté »')
    regles(b, pg, 'page du monstre')
    capture(pg, 'sage-monstre-' + t)
    clic(pg, '.bete-fen .aller'); pg.wait_for_timeout(300)
    b.ok('Gardien' in pg.inner_text('#bulle'), 'le conteur dit que la page est dans le Grand Livre')
    taper(pg, 'etude:gardien')
    b.ok('déjà reçu' in pg.inner_text('.pave-msg'), 'un code d’étude ne marche qu’une fois')
    clic(pg, '.pave-fen .fermer')
    taper(pg, 'etude:rat'); pg.wait_for_timeout(700)
    b.ok(pg.locator('.bete-fen .recit').count() == 2, 'le rat d’égout : sa page')
    clic(pg, '.bete-fen .aller'); pg.wait_for_timeout(300)
    clic(pg, '#b-livre'); pg.wait_for_timeout(400)
    b.ok(pg.locator('.livre .bete-vignette').count() == 9, 'le Grand Livre garde tout le carnet')
    capture(pg, 'sage-livre-monstres-' + t)
    clic(pg, '.livre [data-bete="gardien"]'); pg.wait_for_timeout(500)
    b.ok(pg.is_visible('.bete-fen') and pg.locator('.bete-fen .bete-intro').count() == 0, 'on rouvre la page du Gardien depuis le Grand Livre')
    clic(pg, '.bete-fen .aller'); pg.wait_for_timeout(400)
    b.ok(pg.is_visible('.livre'), 'en refermant la page, on revient au Grand Livre')
    clic(pg, '.livre .fermer'); pg.wait_for_timeout(200)
    muet(b, pg, 'tout le parcours')
    # --- la mémoire ---
    pg.reload(); pg.wait_for_timeout(1200)
    S = pg.evaluate('SAGE.etat()')
    b.ok(S['pages'].get('2') and S['codes'].get('page:blanche') and S['codes'].get('page:dechiree') and S['codes'].get('porte:odette'), 'après rechargement : pages et codes gardés')
    b.ok(not pg.evaluate('document.querySelector(".coin").hidden') and pg.inner_text('#b-livre .badge') == '3', 'après rechargement : le coin est là, 3 pages blanches restent')
    vu2 = pg.evaluate('(() => { var c = document.querySelector("canvas.encre[data-note=fleur]"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data, n = 0; for(var i = 3; i < d.length; i += 16) if(d[i] > 0) n++; return n; })()')
    b.ok(vu2 > 200 and S['lues'].get('rune') and S['codes'].get('rune:lumiere') and pg.is_visible('#rune'), 'après rechargement : l’encre révélée, la note déchiffrée et la rune restent')
    clic(pg, '#b-livre'); pg.wait_for_timeout(300)
    b.ok(pg.get_attribute('.livre [data-voir="2"] .code-grand', 'data-code') == 'sauve:2' and 'Odette' in pg.inner_text('.livre'), 'après rechargement : le Grand Livre garde la page écrite et la note d’Odette')
    b.ok(pg.locator('.livre .bete-vignette').count() == 9, 'après rechargement : le carnet est toujours dans le Grand Livre, avec toutes ses pages')
    clic(pg, '.livre .fermer')
    capture(pg, 'sage-recharge-' + t)
    # --- un 🔊 parle quand on le touche ---
    clic(pg, '#bulle .lire'); pg.wait_for_timeout(100)
    b.ok(pg.evaluate('window.__parle') == 1, 'le 🔊 lit le texte quand on le touche')
    # --- toucher un nom sur le plan : le conteur le dit ---
    sx, sy = ecran(pg, 1440, 752)
    pg.evaluate('SAGE.centrerSur(1440, 752, 0.8)'); pg.wait_for_timeout(900); sx, sy = ecran(pg, 1440, 760)
    pg.mouse.click(sx, sy); pg.wait_for_timeout(400)
    b.ok('salle des rats' in pg.inner_text('#bulle'), 'toucher un nom du plan : le conteur le lit (avec 🔊)')
    # --- recommencer ---
    clic(pg, '#b-nouveau'); pg.wait_for_timeout(250)
    b.ok('Recommencer' in pg.inner_text('.question'), 'recommencer demande confirmation')
    clic(pg, '.question [data-oui]'); pg.wait_for_timeout(1500)
    S = pg.evaluate('SAGE.etat()')
    b.ok(not S['pages'] and not S['codes'] and pg.evaluate('document.querySelector(".coin").hidden'), 'après « Oui, on recommence » : tout est effacé')
    b.ok(not err, 'aucune erreur JavaScript' + ('' if not err else ' : ' + ' | '.join(err[:3])))
    # --- la fluidité : glisser le plan, processeur ralenti ×6 ---
    if not VITE:
        clic(pg, '#b-plus'); pg.wait_for_timeout(500)
        vp = pg.viewport_size
        m = mesurer_glisse(nav, ctx, pg, 6, vp['width'] * .42, vp['height'] * .45, ax=vp['width'] * .2, ay=vp['height'] * .16)
        print('    fluidité (glisser, ×6) :', m)
        b.ok(m and m['ips'] >= 50, '≥ 50 images/s en faisant glisser le plan, processeur ×6 (%s)' % (m and m['ips']))
        m2 = mesurer_glisse(nav, ctx, pg, 6, vp['width'] * .45, vp['height'] * .4, ax=vp['width'] * .2, ay=vp['height'] * .16,
                            rune=(pg.locator('#rune').bounding_box()['x'] + 30, pg.locator('#rune').bounding_box()['y'] + 30))
        print('    fluidité (promener la rune, ×6) :', m2)
        b.ok(m2 and m2['ips'] >= 45, '≥ 45 images/s en promenant la rune, processeur ×6 (%s)' % (m2 and m2['ips']))
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    for a in ('tablette', 'iphone'):
        parcours(nav, a)
    nav.close()
sys.exit(b.fin())
