"""Le gâteau de la fête (mj-gateau.js) : le robot joue dans la salle des mini-jeux, puis dans le jeu lui-même.
1. la salle, sur une tablette couchée : l'accueil en images, les deux colonnes d'icônes, les bulles de chaque icône, les étages,
   la pâte, le glaçage, le motif, la crème, la table ; une décoration posée, tournée, déplacée, tirée depuis sa bulle, jetée,
   « annuler » ; le pinceau (une décoration, la pâte, le glaçage, le motif, la crème, le plat, la nappe) ; les bulles ne cachent
   jamais le gâteau ; les 70 décorations, dont un quart bougent ; la limite ; le minuteur ; « C'est prêt ! », « Retoucher », « À la fête ! » ;
2. la salle, sur un téléphone debout, une tablette debout, un téléphone couché : tout tient dans l'écran, les bulles ne cachent
   pas le gâteau ; le minuteur arrive à zéro : le gâteau part à la fête ;
3. le jeu (index.html) : le mini-jeu lancé par le moteur, en plein écran, la pause (le temps s'arrête), la fin.
   BRUMEVAL_DIST=<dossier construit> python3 tools/gateau.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
SALLE = 'file://' + os.path.join(DIST, 'salle-mini-jeux.html') + '#jeu=gateau&n=1'
JEU = 'file://' + os.path.join(DIST, 'index.html')
PHOTOS = os.path.join(ICI, '..', 'test')
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)
def page(b, w, h):
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=False).new_page(); pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    return pg
def clic(pg, sel): pg.click(sel, force=True); pg.wait_for_timeout(90)
def etat(pg): return pg.evaluate("() => JSON.parse(JSON.stringify(document.querySelector('.gt').__gateau.etat()))")
def icone(pg, c):
    """ouvre les bulles d'une icône (si elles ne le sont pas déjà)"""
    if not pg.evaluate(f"() => document.querySelector('.gt-ic[data-c={c}]').classList.contains('on')"): clic(pg, f'.gt-ic[data-c={c}]')
    pg.wait_for_timeout(120)
def bulle(pg, nom): clic(pg, f'.gt-plateau .gt-bulle[aria-label="{nom}"]')
def nb_bulles(pg): return pg.locator('.gt-plateau .gt-bulle').count()
def centre(pg, sel):
    r = pg.evaluate("(s) => { var e = document.querySelector(s); if(!e) return null; var r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }", sel)
    return r
def glisser(pg, a, b, pas=8):
    pg.mouse.move(a[0], a[1]); pg.mouse.down()
    for i in range(1, pas + 1): pg.mouse.move(a[0] + (b[0] - a[0]) * i / pas, a[1] + (b[1] - a[1]) * i / pas); pg.wait_for_timeout(12)
    pg.mouse.up(); pg.wait_for_timeout(120)
# les bulles cachent-elles le gâteau ? (la surface commune, en pixels carrés)
CACHE = """() => {
  var p = document.querySelector('.gt-plateau'); if(!p || p.hidden) return -1;
  var s = 0, bs = p.querySelectorAll('.gt-bulle, .gt-titre');
  document.querySelectorAll('.gt-etage').forEach(function(e){ var z = e.getBoundingClientRect();
    bs.forEach(function(b){ var r = b.getBoundingClientRect(), ox = Math.min(r.right, z.right) - Math.max(r.left, z.left), oy = Math.min(r.bottom, z.bottom) - Math.max(r.top, z.top); if(ox > 1 && oy > 1) s += ox * oy; }); });
  return Math.round(s);
}"""
# tout tient-il dans le mini-jeu ? (les icônes, les bulles, les boutons : rien ne dépasse du cadre, rien ne défile)
DEDANS = """() => {
  var R = document.querySelector('.gt').getBoundingClientRect(), dehors = [];
  document.querySelectorAll('.gt-ic, .gt-bulle, .gt-titre, .gt-bas > button, .gt-poubelle, .gt-conteur:not([hidden]), .gt-final:not([hidden]) button, .gt-final-dit').forEach(function(e){
    var r = e.getBoundingClientRect(); if(!r.width) return;
    if(r.left < R.left - 1 || r.right > R.right + 1 || r.top < R.top - 1 || r.bottom > R.bottom + 1) dehors.push(e.className + ' ' + Math.round(r.left) + ',' + Math.round(r.top));
  });
  var h = document.querySelector('#sl-plein, #mj-plein:not([hidden])') || document.documentElement, g = document.querySelector('.mj-gateau');
  return {dehors:dehors, defile:h.scrollHeight > h.clientHeight + 2 || h.scrollWidth > h.clientWidth + 2 || g.scrollHeight > g.clientHeight + 2};
}"""
QUATRE = """() => { var e = document.querySelector('.gt').__gateau.etat();
  e.etages = [{forme:'rond', penche:false, pate:'chocolat', glacage:'blanc', motif:'coulant', creme:'perles', cremeC:'rose'},
    {forme:'cannele', penche:false, pate:'fraise', glacage:'menthe', motif:'pois', creme:'rosettes', cremeC:'blanc'},
    {forme:'pans', penche:true, pate:'arcenciel', glacage:'lavande', motif:'moitie', creme:'etoiles', cremeC:'citron'},
    {forme:'carre', penche:true, pate:'citron', glacage:'framboise', motif:'rayures', creme:'nuages', cremeC:'blanc'}]; e.sel = 3; }"""
GAUCHE = ['etages', 'pate', 'glacage', 'motif', 'creme', 'table', 'couleurs']
DROITE = ['fruits', 'fleurs', 'bonbons', 'fete', 'farfelu', 'paillettes', 'chantilly']
ICONES = GAUCHE + DROITE
# un point de l'écran où l'on touche bien ce morceau-là (data-p) de cet étage-là
POINT = """(a) => { var e = document.querySelector('.gt-etage[data-k="' + a.k + '"]'), r = e.getBoundingClientRect();
  for(var y = r.top + 4; y < r.bottom - 2; y += 4) for(var x = r.left + 6; x < r.right - 4; x += 6){
    var el = document.elementFromPoint(x, y), p = el && el.closest ? el.closest('[data-p]') : null;
    if(p && p.getAttribute('data-p') === a.p && el.closest('.gt-etage') === e) return [x, y]; }
  return null; }"""
def temps(pg, v=None): return pg.evaluate("(v) => document.querySelector('.gt').__gateau.temps(v === null ? undefined : v)", v)

with sync_playwright() as p:
    b = p.chromium.launch()
    os.makedirs(PHOTOS, exist_ok=True)

    print('— 1. La salle, tablette couchée')
    pg = page(b, 1180, 820); pg.goto(SALLE); pg.wait_for_timeout(900)
    verifier(pg.locator('.mj-gateau .mj-demo .gtd-cadre svg').count() == 2 and 'Cinq minutes' in pg.inner_text('.mj-phrase'), 'l\'accueil : l\'explication en images et la phrase (« Cinq minutes… »)')
    verifier(pg.evaluate("() => { var g = document.querySelector('.mj-go'), c = getComputedStyle(g); return /255, 224, 138|232, 169, 58/.test(c.backgroundImage) && c.color === 'rgb(17, 17, 17)'; }"), '« C\'est parti ! » : jaune, texte noir')
    verifier(pg.evaluate("() => document.getElementById('sl-plein').classList.contains('mj-large') && document.querySelector('.sl-cadre').getBoundingClientRect().width > 1100"), 'le mini-jeu prend toute la largeur de l\'écran')
    pg.wait_for_timeout(2300); pg.screenshot(path=os.path.join(PHOTOS, 'gateau-accueil.png'))
    clic(pg, '.mj-go'); pg.wait_for_timeout(500)
    verifier(pg.locator('.gt-gauche .gt-ic').count() == 7 and pg.locator('.gt-droite .gt-ic').count() == 7, '7 icônes à gauche, 7 à droite')
    verifier(pg.locator('.gt-ic.gt-appel').count() == 1 and pg.locator('.gt-conteur:not([hidden]) .mj-lire-mini').count() == 1, 'au début : une icône appelle le doigt, le conteur dit un mot (avec son 🔊)')
    verifier(pg.locator('.gt-fond path').count() > 300 and 'blur' in pg.evaluate("() => getComputedStyle(document.querySelector('.gt-fond')).filter") and pg.locator('.gt-scene .gt-table rect').count() >= 1,
             'derrière : la place en fête, un peu floue ; devant, bien nets : la table et le gâteau')
    t0 = temps(pg); pg.wait_for_timeout(1300); t1 = temps(pg)
    verifier(299 < t0 <= 300 and .9 < t0 - t1 < 1.9 and pg.inner_text('.gt-temps b') in ('4:59', '4:58'), f'le minuteur : 5 minutes, et il descend ({pg.inner_text(".gt-temps b")})')
    an = pg.evaluate("() => { var A = MJ.GATEAU_ART; return [A.ANIMEES.length, A.ANIMEES.filter(function(k){ return A.DECOS[k].anime && A.DECOS[k].dessin().indexOf('class=\"gta ') >= 0; }).length]; }")
    verifier(an[0] == an[1] and an[0] * 4 >= 70, f'{an[0]} décorations sur 70 bougent toutes seules (un quart au moins)')
    c = pg.evaluate("() => MJ.GATEAU.compte()")
    print('     ', c)
    verifier(c['unEtage'] >= 500000 and c['decorations'] == 70 and c['couleursParDecoration'] == 9, f"sans une seule décoration : {c['unEtage']:,} gâteaux à un étage ; 70 décorations, 9 couleurs chacune".replace(',', ' '))
    # les étages
    icone(pg, 'etages')
    verifier(nb_bulles(pg) == 7 and pg.locator('.gt-ic.gt-appel').count() == 0 and pg.locator('.gt-conteur:not([hidden])').count() == 0, 'Étages : 7 bulles ; l\'icône n\'appelle plus, le conteur se tait')
    verifier(pg.evaluate("() => document.querySelector('.gt-bulle[aria-label=\"Étage en moins\"]').disabled"), 'un seul étage : « en moins » est grisé')
    for i in range(3): bulle(pg, 'Étage en plus')
    e = etat(pg)
    verifier(len(e['etages']) == 4 and e['sel'] == 3 and pg.locator('.gt-etage').count() == 4, 'trois étages de plus : 4 étages, le dernier est choisi')
    verifier(pg.evaluate("() => document.querySelector('.gt-bulle[aria-label=\"Étage en plus\"]').disabled") and pg.locator('.gt-num').count() == 4, 'pas plus de 4 ; les 4 numéros d\'étage dans la bulle du titre')
    bulle(pg, 'Carré'); bulle(pg, 'Penché')
    e = etat(pg)
    verifier(e['etages'][3]['forme'] == 'carre' and e['etages'][3]['penche'] and 'skewX' in pg.get_attribute('.gt-etage[data-k="3"]', 'transform'), 'le dernier étage : carré et penché')
    verifier(pg.locator('.gt-sel').count() == 1, 'l\'étage choisi porte son liseré')
    clic(pg, '.gt-num >> nth=0'); icone(pg, 'pate')
    verifier(nb_bulles(pg) == 12 and etat(pg)['sel'] == 0, 'Pâte : 12 bulles ; l\'étage 1 choisi par son numéro')
    bulle(pg, 'Chocolat'); icone(pg, 'glacage')
    verifier(etat(pg)['etages'][0]['pate'] == 'chocolat' and nb_bulles(pg) == 15, 'pâte au chocolat ; Glaçage : 14 couleurs et « sans »')
    bulle(pg, 'Sans glaçage'); icone(pg, 'motif'); n = nb_bulles(pg); bulle(pg, 'À pois')
    e = etat(pg)['etages'][0]
    verifier(n == 6 and e['glacage'] == 'rose' and e['motif'] == 'pois', 'Motif : 6 bulles ; un motif sans glaçage en met un')
    icone(pg, 'creme'); n = nb_bulles(pg); bulle(pg, 'Menthe')
    e = etat(pg)['etages'][0]
    verifier(n == 16 and e['creme'] == 'rosettes' and e['cremeC'] == 'menthe', 'Crème : 5 formes, « sans », 10 couleurs ; une couleur sans crème en met une')
    icone(pg, 'table'); n = nb_bulles(pg); avant = pg.inner_html('.gt-plat') + pg.inner_html('.gt-table'); bulle(pg, 'Pierre à runes'); bulle(pg, 'Nuit étoilée')
    e = etat(pg)
    verifier(n == 12 and e['plat'] == 'runes' and e['nappe'] == 'nuit' and pg.inner_html('.gt-plat') + pg.inner_html('.gt-table') != avant, 'Table : 6 plats, 6 nappes ; le plat et la nappe changent')
    # toucher un étage du gâteau
    icone(pg, 'pate'); z = centre(pg, '.gt-etage[data-k="1"]'); pg.mouse.click(z[0], z[1] + 20); pg.wait_for_timeout(150)
    verifier(etat(pg)['sel'] == 1 and pg.locator('.gt-num.on').inner_text() == '2', 'toucher un étage du gâteau : il est choisi')
    # les bulles ne cachent pas le gâteau
    pg.evaluate(QUATRE)
    pire = 0
    for c2 in ICONES:
        clic(pg, f'.gt-ic[data-c={c2}]'); pg.wait_for_timeout(600); pire = max(pire, pg.evaluate(CACHE))
        d = pg.evaluate(DEDANS)
        if d['dehors'] or d['defile']: verifier(False, f'{c2} : tout tient dans le mini-jeu {d}')
    verifier(pire == 0, f'un gâteau de 4 étages : les bulles des 14 icônes ne le cachent jamais (au pire {pire} px²)')
    pg.screenshot(path=os.path.join(PHOTOS, 'gateau-bulles.png'))
    # une décoration : posée, tournée, déplacée
    icone(pg, 'fruits'); n0 = len(etat(pg)['decos']); bulle(pg, 'Fraise'); pg.wait_for_timeout(200)
    e = etat(pg); d = e['decos'][-1]
    verifier(len(e['decos']) == n0 + 1 and d['d'] == 'fraise' and d['r'] == 0, 'toucher la bulle « Fraise » : elle arrive sur le gâteau')
    verifier(pg.locator('.gt-conteur:not([hidden])').count() == 1 and 'tourne' in pg.inner_text('.gt-conteur'), 'le conteur explique le geste (une seule fois)')
    verifier(pg.inner_text('.gt-titre b') == 'Fraise', 'son nom s\'écrit dans la bulle du titre')
    sel = f'.gt-deco[data-id="{d["id"]}"] .gt-prise'
    c0 = centre(pg, sel); pg.mouse.click(c0[0], c0[1]); pg.wait_for_timeout(350)
    e2 = etat(pg)['decos'][-1]
    verifier(e2['r'] == 45 and 'rotate(45deg)' in pg.get_attribute(f'.gt-deco[data-id="{d["id"]}"] .gt-deco-r', 'style') and abs(e2['x'] - d['x']) < .01, 'un petit coup de doigt : elle tourne d\'un cran, dans le sens des aiguilles d\'une montre, sans bouger')
    pg.mouse.click(c0[0], c0[1]); pg.wait_for_timeout(250)
    verifier(etat(pg)['decos'][-1]['r'] == 90, 'encore un : 90°')
    cible = [c0[0] - 150, c0[1] + 180]; glisser(pg, c0, cible)
    e3 = etat(pg)['decos'][-1]; c1 = centre(pg, sel)
    verifier(e3['r'] == 90 and abs(c1[0] - cible[0]) < 3 and abs(c1[1] - cible[1]) < 3, 'glisser : elle suit le doigt, elle garde son tour')
    # tirer une décoration depuis sa bulle
    cb = centre(pg, '.gt-bulle[aria-label="Cerises"]'); cible = [c1[0] + 240, c1[1] + 60]; n0 = len(etat(pg)['decos']); glisser(pg, cb, cible, 12)
    e = etat(pg); d2 = e['decos'][-1]; c2 = centre(pg, f'.gt-deco[data-id="{d2["id"]}"] .gt-prise')
    verifier(len(e['decos']) == n0 + 1 and d2['d'] == 'cerises' and abs(c2[0] - cible[0]) < 3 and abs(c2[1] - cible[1]) < 3, 'tirer la bulle « Cerises » jusqu\'au gâteau : elle se pose où on la lâche')
    # la poubelle, puis « annuler »
    cp = centre(pg, '.gt-poubelle'); n0 = len(etat(pg)['decos']); glisser(pg, c2, cp, 10); pg.wait_for_timeout(350)
    verifier(len(etat(pg)['decos']) == n0 - 1 and pg.locator(f'.gt-deco[data-id="{d2["id"]}"]').count() == 0, 'glissée sur la poubelle : elle disparaît')
    clic(pg, '.gt-annuler')
    e = etat(pg)
    verifier(len(e['decos']) == n0 and e['decos'][-1]['d'] == 'cerises', '« annuler » : elle revient')
    # le pinceau : toutes les couleurs se changent
    icone(pg, 'couleurs'); n = nb_bulles(pg); bulle(pg, 'Bleu'); pg.wait_for_timeout(150)
    verifier(n == 9 and 'pinceau magique' in pg.inner_text('.gt-conteur') and pg.locator('.gt-conteur .mj-lire-mini').count() == 1, 'Couleurs : 8 couleurs et « d\'origine » ; le conteur explique le pinceau (avec son 🔊)')
    dd = etat(pg)['decos'][-1]; cz = centre(pg, f'.gt-deco[data-id="{dd["id"]}"] .gt-prise'); pg.mouse.click(cz[0], cz[1]); pg.wait_for_timeout(250)
    e = etat(pg)['decos'][-1]; html = pg.inner_html(f'.gt-deco[data-id="{dd["id"]}"]')
    verifier(e['t'] == '#2f9bff' and e['r'] == dd['r'] and '#c81e3a' not in html and '#5fbf5a' in html, 'avec le pinceau bleu, toucher les cerises : elles deviennent bleues (leur feuille reste verte), sans tourner')
    for part, k, cle in [('pate', 0, 'pate'), ('glacage', 0, 'glacage'), ('creme', 0, 'cremeC'), ('motif', 1, 'motifC')]:
        pt = pg.evaluate(POINT, {'k': k, 'p': part})
        if pt: pg.mouse.click(pt[0], pt[1]); pg.wait_for_timeout(480)   # (l'étage repeint fait un petit « pouf » : on attend qu'il se repose)
        verifier(bool(pt) and etat(pg)['etages'][k].get(cle) == '#2f9bff', f'le pinceau sur un étage : {part}')
    bulle(pg, 'Vert'); zp = centre(pg, '.gt-plat'); pg.mouse.click(zp[0], zp[1] + 26); pg.wait_for_timeout(150)
    zt = pg.evaluate("() => { var r = document.querySelector('.gt-bas').getBoundingClientRect(), R = document.querySelector('.gt').getBoundingClientRect(); return [R.left + R.width * .3, r.top - 14]; }"); pg.mouse.click(zt[0], zt[1]); pg.wait_for_timeout(150)
    e = etat(pg)
    verifier(e.get('platC') == '#3fd44a' and e.get('nappeC') == '#3fd44a' and pg.locator('.gt-table pattern').count() == 1, 'le pinceau vert sur le plat, puis sur la nappe : ils sont repeints')
    pg.screenshot(path=os.path.join(PHOTOS, 'gateau-pinceau.png'))
    bulle(pg, "D'origine"); pg.mouse.click(cz[0], cz[1]); pg.wait_for_timeout(200)
    verifier(not etat(pg)['decos'][-1].get('t') and '#c81e3a' in pg.inner_html(f'.gt-deco[data-id="{dd["id"]}"]'), '« d\'origine » : les cerises retrouvent leur rouge')
    clic(pg, '.gt-annuler'); verifier(etat(pg)['decos'][-1].get('t') == '#2f9bff', '« annuler » marche aussi pour le pinceau')
    icone(pg, 'table'); bulle(pg, 'Porcelaine'); bulle(pg, 'Vichy rouge')
    e = etat(pg); verifier(not e.get('platC') and not e.get('nappeC'), 'choisir un plat ou une nappe dans « Table » lui rend ses couleurs')
    # les 70 décorations, et la limite
    pg.evaluate("() => { var e = document.querySelector('.gt').__gateau.etat(); e.decos.length = 0; }"); clic(pg, '.gt-ic[data-c=fruits]'); clic(pg, '.gt-ic[data-c=fruits]')
    total = 0
    for c2 in DROITE:
        icone(pg, c2)
        for i in range(nb_bulles(pg)): pg.click(f'.gt-plateau .gt-bulle >> nth={i}', force=True); total += 1
    pg.wait_for_timeout(300)
    e = etat(pg)
    verifier(total == 70 and len(e['decos']) == 70 and len(set(x['d'] for x in e['decos'])) == 70, 'les 70 décorations se posent toutes')
    places = set((round(x['x']), round(x['y'])) for x in e['decos'])
    verifier(len(places) >= 40, f'elles n\'arrivent pas toutes au même endroit ({len(places)} endroits)')
    pg.screenshot(path=os.path.join(PHOTOS, 'gateau-70.png'))
    for i in range(12): pg.click('.gt-plateau .gt-bulle >> nth=0', force=True)
    pg.wait_for_timeout(200)
    verifier(len(etat(pg)['decos']) == 80 and 'n\'en peut plus' in pg.inner_text('.gt-conteur'), 'pas plus de 80 : le conteur prévient')
    # tous les sons du gâteau se jouent sans erreur
    verifier(pg.evaluate("() => { var n = 0; Object.keys(MJ.GATEAU.sons).forEach(function(k){ MJ.GATEAU.sons[k](); n++; }); return n; }") >= 25, 'les sons du gâteau se jouent tous')
    verifier(pg.evaluate("() => { var e = document.querySelector('.gt-decos .gta'); return !!e && getComputedStyle(e).animationName !== 'none'; }") and pg.evaluate("() => getComputedStyle(document.querySelector('.gt-eclat')).animationName") == 'gt-eclat',
             'sur le gâteau : les décorations animées bougent, et les éclats scintillent')
    # la fête
    clic(pg, '.gt-pret'); pg.wait_for_timeout(900)
    verifier(pg.locator('.gt.gt-fini').count() == 1 and pg.locator('.gt-pluie i').count() > 30 and pg.locator('.gt-final-dit .mj-lire-mini').count() == 1, '« C\'est prêt ! » : les icônes s\'en vont, les confettis tombent, le conteur parle (avec son 🔊)')
    verifier(pg.evaluate("() => { var g = document.querySelector('.gt-fete'), c = getComputedStyle(g); return /255, 224, 138|232, 169, 58/.test(c.backgroundImage) && c.color === 'rgb(17, 17, 17)'; }"), '« À la fête ! » : jaune, texte noir')
    d = pg.evaluate(DEDANS); verifier(not d['dehors'] and not d['defile'], f'la fête tient dans l\'écran {d}')
    pg.screenshot(path=os.path.join(PHOTOS, 'gateau-fete.png'))
    clic(pg, '.gt-retouche'); pg.wait_for_timeout(200)
    verifier(pg.locator('.gt.gt-fini').count() == 0 and pg.locator('.gt-pluie i').count() == 0 and pg.locator('.gt-bas .gt-pret').is_visible(), '« Retoucher » : on reprend le gâteau')
    t0 = temps(pg); pg.wait_for_timeout(800); verifier(.4 < t0 - temps(pg) < 1.4, 'et le temps repart')
    clic(pg, '.gt-pret'); pg.wait_for_timeout(300); clic(pg, '.gt-fete'); pg.wait_for_timeout(500)
    verifier('Quel gâteau' in pg.inner_text('.mj-resultat h2') and '4 étages et 80 décorations' in pg.inner_text('.mj-resultat'), '« À la fête ! » : « Quel gâteau ! », 4 étages et 80 décorations')
    clic(pg, '.mj-continuer'); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => document.getElementById('sl-plein').hidden"), '« Continuer » : retour à la salle')
    pg.context.close()

    for nom, w, h in [('téléphone debout', 390, 844), ('tablette debout', 820, 1180), ('téléphone couché', 844, 390)]:
        print('— 2. La salle,', nom)
        pg = page(b, w, h); pg.goto(SALLE); pg.wait_for_timeout(800); clic(pg, '.mj-go'); pg.wait_for_timeout(500)
        d = pg.evaluate(DEDANS); verifier(not d['dehors'] and not d['defile'], f'au début, tout tient dans l\'écran {d if d["dehors"] or d["defile"] else ""}')
        pg.evaluate(QUATRE); pire = 0; ko = []
        for c2 in ICONES:
            clic(pg, f'.gt-ic[data-c={c2}]'); pg.wait_for_timeout(600); pire = max(pire, pg.evaluate(CACHE))
            d = pg.evaluate(DEDANS)
            if d['dehors'] or d['defile']: ko.append((c2, d))
            if c2 == 'farfelu': pg.screenshot(path=os.path.join(PHOTOS, f'gateau-{w}x{h}.png'))
        verifier(not ko, f'les bulles des 14 icônes tiennent dans l\'écran {ko[:2] if ko else ""}')
        # (sur un téléphone couché, l'écran est trop bas pour un gâteau de 4 étages et 19 bulles : elles peuvent mordre un peu dessus)
        verifier(pire == 0 or h < 500, f'elles ne cachent pas le gâteau de 4 étages (au pire {pire} px²)')
        icone(pg, 'fete'); bulle(pg, 'Bougie'); pg.wait_for_timeout(200)
        dd = etat(pg)['decos'][-1]; c0 = centre(pg, f'.gt-deco[data-id="{dd["id"]}"] .gt-prise'); pg.mouse.click(c0[0], c0[1]); pg.wait_for_timeout(200)
        verifier(etat(pg)['decos'][-1]['r'] == 45, 'la bougie se pose et tourne')
        # le minuteur arrive à zéro : le gâteau part à la fête tel qu'il est, sans « Retoucher »
        temps(pg, 30.3); pg.wait_for_timeout(500); verifier(pg.locator('.gt-temps.gt-presse').count() == 1, 'à trente secondes de la fin, le minuteur rougit')
        temps(pg, 1.1); pg.wait_for_timeout(2100)
        verifier(pg.locator('.gt.gt-fini').count() == 1 and pg.locator('.gt-retouche').count() == 0 and 'cinq minutes' in pg.inner_text('.gt-final-dit') and pg.locator('.gt-final-dit .mj-lire-mini').count() == 1,
                 'à zéro : la fête commence toute seule, sans « Retoucher » ; le conteur le dit (avec son 🔊)')
        d = pg.evaluate(DEDANS); verifier(not d['dehors'] and not d['defile'], f'la fête tient dans l\'écran {d if d["dehors"] or d["defile"] else ""}')
        haut = pg.evaluate("() => { var f = document.querySelector('.gt-final').getBoundingClientRect(), bas = 0; document.querySelectorAll('.gt-etage').forEach(function(e){ bas = Math.max(bas, e.getBoundingClientRect().bottom); }); return [Math.round(bas), Math.round(f.top)]; }")
        verifier(haut[0] <= haut[1] + 2, f'à la fête, la phrase du conteur ne cache pas le gâteau (le gâteau finit à {haut[0]}, la phrase commence à {haut[1]})')
        pg.screenshot(path=os.path.join(PHOTOS, f'gateau-fete-{w}x{h}.png'))
        pg.context.close()

    print('— 3. Dans le jeu')
    pg = page(b, 1180, 820); pg.goto(JEU)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Alchimiste'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { window.__fin = null; M.lancerMJ('gateau', 1, null, {sansPotion:true, titre:'Le gâteau de la fête'}, function(res){ window.__fin = res; }); }"); pg.wait_for_timeout(400)
    # (le moteur montre d'abord sa fenêtre « avant le mini-jeu », avec son bouton jaune)
    if pg.locator('#voile [data-act=mj-go]').count(): pg.click('#voile [data-act=mj-go]')
    elif pg.locator('#voile .b-aller').count(): pg.click('#voile .b-aller >> nth=0')
    pg.wait_for_timeout(500)
    verifier(pg.locator('#mj-plein .mj-gateau').count() == 1 and pg.evaluate("() => { var p = document.getElementById('mj-plein'); return p.classList.contains('mj-fixe') && p.classList.contains('mj-large'); }"), 'le moteur ouvre le mini-jeu, en plein écran verrouillé, sur toute la largeur')
    if pg.locator('.mj-go').count(): clic(pg, '.mj-go')
    pg.wait_for_timeout(500)
    verifier(pg.locator('#mj-plein .gt-ic').count() == 14, 'les 14 icônes')
    d = pg.evaluate(DEDANS); verifier(not d['dehors'] and not d['defile'], f'tout tient dans l\'écran {d if d["dehors"] or d["defile"] else ""}')
    icone(pg, 'farfelu'); bulle(pg, 'Moustache'); icone(pg, 'etages'); bulle(pg, 'Étage en plus'); pg.wait_for_timeout(300)
    verifier(len(etat(pg)['decos']) == 1 and len(etat(pg)['etages']) == 2, 'on y joue : un chat, un étage de plus')
    pg.screenshot(path=os.path.join(PHOTOS, 'gateau-jeu.png'))
    if pg.locator('.mj-btn-pause').count():
        clic(pg, '.mj-btn-pause'); pg.wait_for_timeout(300)
        verifier(pg.evaluate("() => !!M.mjPause"), 'la pause : le mini-jeu se met de côté')
        t0 = temps(pg); pg.wait_for_timeout(1500); verifier(abs(t0 - temps(pg)) < .05, 'pendant la pause, le temps s\'arrête')
        pg.evaluate("() => M.reprendreMJ()"); pg.wait_for_timeout(2600)
        verifier(pg.evaluate("() => !M.mjPause && !MJT.enPause()") and pg.locator('#mj-plein .gt-ic').count() == 14 and len(etat(pg)['decos']) == 1 and t0 - temps(pg) < 1.5, 'on reprend (« 3, 2, 1 ») : le gâteau est toujours là, le temps repart')
    else: verifier(False, 'le bouton pause')
    clic(pg, '.gt-pret'); pg.wait_for_timeout(300); clic(pg, '.gt-fete'); pg.wait_for_timeout(400); clic(pg, '.mj-continuer'); pg.wait_for_timeout(400)
    r = pg.evaluate("() => window.__fin")
    verifier(bool(r) and r.get('reussi') and r['gateau']['etages'] == 2 and r['gateau']['chats'] == 1 and r['gateau']['parDeco'].get('moustache') == 1, 'la fin : réussi, avec le résumé du gâteau (2 étages, 1 chat)')
    verifier(pg.evaluate("() => document.getElementById('mj-plein').hidden"), 'le mini-jeu se referme')
    pg.context.close()
    b.close()
print('\nErreurs JS :', len(erreurs))
for e in erreurs[:12]: print('  ', e[:300])
print('Vérifications ratées :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if erreurs or echecs else 0)
