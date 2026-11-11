"""Test de la carte du donjon (carte.js) et de sa démo (carte-demo.html) : la géométrie (ids des décors et des scènes,
le graphe, CONCEPTION §7), la brume qui se lève lieu par lieu, le glisser au doigt, les règles de Romain, la mémoire
des toiles (canvas), la fluidité.

    flock /tmp/brumeval-pw.lock python3 test-carte.py           (tout)
    flock /tmp/brumeval-pw.lock python3 test-carte.py --vite    (sans la mesure de fluidité)
Captures dans pages/captures/ (carte-*.png). Refaire la démo avant : python3 pages/assembler.py"""
import os, sys, re
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pages'))
from playwright.sync_api import sync_playwright
from outils_test import Bilan, contexte, page, capture, regles, muet, mesurer_glisse, DONJON

VITE = '--vite' in sys.argv
b = Bilan('Carte')
# les décors de combat et les scènes déjà dessinés (on lit leurs listes dans leurs fichiers)
DECORS = re.search(r"DECORS\.ids\s+\[([^\]]*)\]", open(os.path.join(DONJON, 'decors', 'decors.js'), encoding='utf-8').read()).group(1)
DECORS = re.findall(r"'([^']+)'", DECORS) + ['rats']          # + la salle des rats (essai/)
SCENES = re.findall(r"'([^']+)'", re.search(r"var ORDRE = \[([^\]]*)\]", open(os.path.join(DONJON, 'scenes', 'scenes.js'), encoding='utf-8').read()).group(1))
ALPHA_ICI = """(id) => { var C = CARTE_DONJON, L = C.LIEUX[id] || C.J, cv = document.querySelector('.cd-brume'), x = cv.getContext('2d'), s = cv.width / C.W;
  return x.getImageData(Math.round(L.x * s), Math.round(L.y * s), 1, 1).data[3]; }"""


def geometrie(pg):
    print('\n=== la géométrie ===')
    G = pg.evaluate("""() => { var C = CARTE_DONJON, o = {};
      o.ordre = C.ORDRE.slice(); o.lieux = {}; C.ORDRE.forEach(function(k){ var L = C.LIEUX[k]; o.lieux[k] = {type:L.type, decor:L.decor || null, scene:L.scene || null, d:!!L.d, poly:L.poly.length, signe:L.signe || null, codes:L.codes || []}; });
      C.ouvrirSecrets([]); o.ferme = C.chemin('puits', 'leo'); o.canauxFerme = C.voisins('canaux').map(function(v){ return v.lieu; });
      C.ouvrirSecrets(['c5']); o.chemin = C.chemin('puits', 'leo'); o.secret = C.chemin('puits', 'leo', {secret:true});
      o.c5 = C.LIEN.c5.secret;
      o.lune = C.voisins('toiles').filter(function(v){ return v.porte === 'lune'; })[0] || null;
      o.portes = C.voisins('portes').map(function(v){ return v.lieu + ':' + (v.porte || ''); });
      o.puits = C.voisins('puits').map(function(v){ return v.lieu; });
      o.egouts = C.voisins('egouts').map(function(v){ return v.lieu; });
      o.lieuEn = [C.lieuEn(1200, 750), C.lieuEn(1866, 838), C.lieuEn(100, 100)];
      o.notes = C.PLAN.notes.map(function(n){ return n.type + ':' + n.id; });
      o.passages = C.PLAN.passages.map(function(p){ return p.id + ':' + p.bloque; });
      o.signes = C.PLAN.signes.length; o.dechire = C.PLAN.dechire.length;
      o.secretLien = C.LIEN.secret && C.LIEN.secret.de + '>' + C.LIEN.secret.a;
      o.codesDonjon = Object.keys(DONJON_CODES.CODES);
      return o; }""")
    b.ok(len(G['ordre']) == 20, '20 lieux sur le chemin long : ' + ', '.join(G['ordre']))
    combats = [k for k in G['ordre'] if G['lieux'][k]['type'] == 'combat']
    b.ok(sorted(combats) == sorted(['rats', 'canaux', 'egouts', 'toiles', 'atelier', 'crypte', 'ossuaire', 'bassin']), 'les 8 combats : ' + ', '.join(combats))
    b.ok(all(G['lieux'][k]['decor'] in DECORS for k in combats), 'chaque combat a son décor dessiné (decors/ ou la salle des rats)')
    sans = [k for k in G['ordre'] if G['lieux'][k]['type'] != 'combat']
    b.ok(sorted(sans) == sorted(['puits', 'galerie', 'aeration', 'reserve', 'givre', 'bibliotheque', 'eboulis', 'dalles', 'portes', 'camp', 'porte4', 'leo']), 'les 12 lieux sans combat : ' + ', '.join(sans))
    b.ok(all(G['lieux'][k]['scene'] in SCENES for k in sans), 'chaque lieu sans combat a sa scène (scenes/scenes.js)')
    b.ok(G['lieux']['crypte']['scene'] == 'crypte-sarco', 'la fausse crypte : décor de combat + le sarcophage (scène)')
    b.ok(all(G['lieux'][k]['d'] and G['lieux'][k]['poly'] > 6 for k in G['ordre']), 'chaque lieu a sa forme (chemin SVG et contour)')
    b.ok(G['ferme'] is None and 'toiles' not in G['canauxFerme'] and G['c5'] == 'passage:canaux', 'le passage des canaux à la cave aux toiles est secret : tant qu’il est fermé, aucun chemin ne mène à Léo')
    b.ok(G['chemin'] == ['puits', 'rats', 'canaux', 'toiles', 'dalles', 'atelier', 'portes', 'ossuaire', 'camp', 'bassin', 'porte4', 'leo'], 'une fois ouvert, le bon chemin : ' + ' › '.join(G['chemin'] or []))
    b.ok(G['secret'] == G['chemin'] and not G['secretLien'], 'plus de raccourci du cul-de-sac éboulé au feu de camp (enlevé le 11 novembre : il faisait sauter presque tout le donjon)')
    b.ok(sorted(G['portes']) == sorted(['atelier:', 'ossuaire:oeil', 'crypte:gueule', 'toiles:lune']), 'les trois portes : œil → ossuaire, gueule → fausse crypte, lune → la cave')
    b.ok(G['lune'] and G['lune']['fermee'], 'la porte de la lune ne s’ouvre pas depuis la cave')
    b.ok(sorted(G['puits']) == ['aeration', 'galerie', 'rats'] and G['egouts'] == ['canaux'], 'trois couloirs au fond du puits ; les égouts tournent et ramènent aux canaux')
    b.ok(G['lieuEn'] == ['puits', 'dalles', None], 'lieuEn trouve le lieu sous un point')
    b.ok(sorted(G['notes']) == sorted(['code:rune', 'code:oeil', 'code:dalles', 'encre:roue', 'encre:fleur', 'coin:bourbe']) and G['passages'] == ['vieux:true'] and G['signes'] == 7,
         'les notes du plan : 3 codées (la rune, l’œil, les dalles), 2 à l’encre invisible (la roue, la fleur), Bourbe ; le passage bloqué ; 7 signes')
    tous = set()
    for k in G['ordre']:
        tous.update(G['lieux'][k]['codes'])
    b.ok(tous <= set(G['codesDonjon']), 'les codes des lieux existent dans donjon-codes.js : ' + ', '.join(sorted(tous)))


def parcours(nav, appareil):
    print('\n=== %s ===' % appareil)
    t = 'tab' if appareil == 'tablette' else 'tel'
    ctx = contexte(nav, appareil)
    pg, err = page(ctx, 'carte-demo.html')
    pg.wait_for_function('window.DEMO && DEMO.pret > 0', timeout=60000)
    print('    carte peinte en %d ms (en morceaux, sans longue tâche)' % pg.evaluate('DEMO.pret'))
    if appareil == 'tablette':
        geometrie(pg)
        print('\n=== %s (suite) ===' % appareil)
    m = pg.evaluate("""() => { var a = document.querySelector('.cd-carte'), c = document.querySelector('.cd-brume');
      return {carte:[a.width, a.height], brume:[c.width, c.height], mo:Math.round((a.width * a.height + c.width * c.height * 2) * 4 / 1e6), z:DEMO.vue.z}; }""")
    print('    toiles : carte %s, brume %s → %d Mo (zoom %.2f)' % (m['carte'], m['brume'], m['mo'], m['z']))
    b.ok(m['mo'] <= 40, 'mémoire des toiles raisonnable pour un iPhone (%d Mo ≤ 40)' % m['mo'])
    b.ok(pg.evaluate(ALPHA_ICI, 'puits') < 40 and pg.evaluate(ALPHA_ICI, 'rats') > 200 and pg.evaluate(ALPHA_ICI, 'bassin') > 200, 'au départ : le fond du puits est découvert, la brume cache tout le reste')
    b.ok(pg.locator('.cd-etiq.vu').count() == 1, 'une seule étiquette au départ (le fond du puits)')
    b.ok(pg.locator('.cd-sortie').count() == 3, 'trois chevrons dorés : les trois couloirs du puits')
    regles(b, pg, 'départ'); muet(b, pg, 'départ')
    capture(pg, 'carte-depart-' + t)
    # --- glisser au doigt ---
    p0 = pg.evaluate('DEMO.vue.position()')
    vp = pg.viewport_size
    pg.mouse.move(vp['width'] / 2, vp['height'] / 2); pg.mouse.down(); pg.mouse.move(vp['width'] / 2 - 150, vp['height'] / 2 - 80, steps=8); pg.mouse.up()
    pg.wait_for_timeout(900)
    p1 = pg.evaluate('DEMO.vue.position()')
    b.ok(abs(p1['tx'] - p0['tx']) > 100 and abs(p1['ty'] - p0['ty']) > 50, 'la carte glisse sous le doigt (%d, %d px)' % (p1['tx'] - p0['tx'], p1['ty'] - p0['ty']))
    # --- la brume se lève lieu par lieu ---
    for i in range(3):
        pg.evaluate('DEMO.suivant()'); pg.wait_for_function('!DEMO.occupe()', timeout=30000)
        if i == 0:
            pg.wait_for_timeout(500)
            b.ok(pg.locator('.cd-patch').count() >= 1, 'la brume se lève en fondu (deux voiles qui s’effacent)')
    pg.wait_for_timeout(1700)
    b.ok(pg.evaluate("['galerie','aeration','rats'].every(function(k){ return DEMO.vue.brume.estVu(k); })") and pg.evaluate("!DEMO.vue.brume.estVu('canaux')"), 'trois lieux découverts, pas les autres')
    b.ok(pg.evaluate(ALPHA_ICI, 'rats') < 40 and pg.evaluate(ALPHA_ICI, 'canaux') > 200, 'la brume s’est levée sur la salle des rats, pas sur les canaux')
    b.ok(pg.locator('.cd-patch').count() == 0, 'les voiles du fondu sont retirés à la fin (rien ne reste à animer)')
    b.ok(pg.evaluate('DEMO.ici()') == 'rats' and pg.locator('.cd-etiq.vu').count() == 4, 'le pion est dans la salle des rats ; 4 étiquettes')
    capture(pg, 'carte-trois-' + t)
    # un chevron doré : aller par là
    pg.locator('.cd-sortie').first.click(force=True)
    pg.wait_for_function('!DEMO.occupe()', timeout=30000); pg.wait_for_timeout(1700)
    b.ok(pg.evaluate('DEMO.ici()') != 'rats', 'un chevron doré emmène l’équipe (%s)' % pg.evaluate('DEMO.ici()'))
    # toucher un lieu découvert : le conteur dit son nom
    pg.evaluate("DEMO.vue.centrer('rats')"); pg.wait_for_timeout(200)
    pg.mouse.click(vp['width'] / 2, vp['height'] / 2); pg.wait_for_timeout(300)
    b.ok('La salle des rats' in pg.inner_text('#bulle'), 'toucher un lieu découvert : le conteur dit son nom (avec 🔊)')
    # la mémoire de la brume (pour le moteur : sauvegarde / chargement)
    e = pg.evaluate('JSON.stringify(DEMO.vue.etat().brume)')
    pg.evaluate('DEMO.vue.brume.oublier()')
    b.ok(pg.evaluate(ALPHA_ICI, 'rats') > 200, 'oublier() remet toute la brume')
    pg.evaluate('(e) => DEMO.vue.brume.restaurer(JSON.parse(e))', e)
    b.ok(pg.evaluate(ALPHA_ICI, 'rats') < 40 and pg.evaluate(ALPHA_ICI, 'canaux') > 200, 'restaurer(état) rouvre exactement les mêmes lieux')
    # tout le chemin
    for i in range(16):
        pg.evaluate('DEMO.suivant()'); pg.wait_for_function('!DEMO.occupe()', timeout=60000)
    pg.wait_for_timeout(1700)
    b.ok(pg.evaluate('DEMO.ici()') == 'leo', 'le tour du chemin long finit dans la dernière salle')
    b.ok(pg.evaluate(ALPHA_ICI, 'bassin') < 40 and pg.evaluate(ALPHA_ICI, 'J') < 40, 'le grand bassin et l’embranchement sont découverts')
    capture(pg, 'carte-fin-' + t)
    regles(b, pg, 'fin du tour')
    pg.click('#b-tout'); pg.wait_for_timeout(600)
    pg.evaluate("DEMO.vue.centrer({x:1700, y:900})"); pg.wait_for_timeout(300)
    capture(pg, 'carte-tout-' + t)
    pg.click('#b-nouveau'); pg.wait_for_timeout(1000)
    b.ok(pg.evaluate("DEMO.ici() === 'puits' && !DEMO.vue.brume.estVu('rats')") and pg.evaluate(ALPHA_ICI, 'rats') > 200, '↺ : la brume revient partout, retour au puits')
    muet(b, pg, 'tout le parcours')
    pg.click('#bulle .lire'); pg.wait_for_timeout(100)
    b.ok(pg.evaluate('window.__parle') == 1, 'le 🔊 lit le texte quand on le touche')
    b.ok(not err, 'aucune erreur JavaScript' + ('' if not err else ' : ' + ' | '.join(err[:3])))
    if not VITE:
        pg.evaluate("DEMO.suivant()"); pg.wait_for_function('!DEMO.occupe()', timeout=30000); pg.wait_for_timeout(1600)
        r = mesurer_glisse(nav, ctx, pg, 6, vp['width'] / 2, vp['height'] / 2, ax=vp['width'] * .25, ay=vp['height'] * .2)
        print('    fluidité (glisser la carte, ×6) :', r)
        b.ok(r and r['ips'] >= 50, '≥ 50 images/s en faisant glisser la carte, processeur ×6 (%s)' % (r and r['ips']))
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    for a in ('tablette', 'iphone'):
        parcours(nav, a)
    nav.close()
sys.exit(b.fin())
