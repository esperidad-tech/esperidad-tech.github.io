"""« Suivre les traces » (mj-pistage.js), dans la salle des mini-jeux : les traces de Moustache (13 novembre), refait le 15 novembre.
Pour trois niveaux, trois écrans et les trois moments (matin, après-midi, nuit) :
  - l'explication en images et son bouton jaune ;
  - le quartier : toutes les traces sont dans les rues, aucune sous un passage couvert, dans un obstacle ou dans une flaque ;
    chaque bout de piste s'atteint à pied (les obstacles ne bouchent jamais le chemin) ; on ne traverse pas un obstacle ;
  - les traces changent de matière (le lait, puis l'eau, la boue ou la farine) ;
  - le nombre de fausses pistes et Noisette selon le niveau ;
  - le Pisteur marche vers le doigt et s'arrête quand on le lève ; dans une flaque, ses semelles se salissent, puis il laisse
    ses propres traces ;
  - un chat qui passe en courant laisse des traces fraîches, puis s'en va ;
  - Moustache miaule devant la grille, et file entre les barreaux quand le Pisteur arrive ;
  - on perd au bout d'une mauvaise piste (le jeu dit quel chat c'était), on gagne à la grille de la crypte.
   BRUMEVAL_DIST=<dossier construit> python3 tools/pistage.py"""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
OUT = os.path.join(ICI, '..', 'test', 'pistage'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)
Z = "document.querySelector('.pg').__pistage"
def partie(b, niv, w, h, fin, moment):
    print(f'— niveau {niv}, écran {w} × {h}, {moment}, {fin}')
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True).new_page(); pg.set_default_timeout(9000)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and 'fonts' not in m.text else None)
    pg.goto('file://' + DIST + f'/salle-mini-jeux.html#jeu=pistage&n={niv}&v={moment}'); pg.wait_for_timeout(900)
    verifier(pg.locator('.mj-go').count() == 1 and pg.locator('.mj-demo canvas, .mj-intro canvas, canvas').count() >= 1, 'l\'explication en images, et le bouton jaune')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-accueil.png')
    pg.locator('.mj-go').first.click(); pg.wait_for_timeout(4300)
    info = pg.evaluate(f"""() => {{ var z = {Z}, M = z.monde; return {{pistes:M.pistes.map(function(P){{ return [P.chat, !!P.bon]; }}), fins:M.fins.length, traces:M.traces.length, ech:z.etat().ech, moment:z.moment,
      hors:M.traces.filter(function(T){{ return !M.rues.some(function(r){{ return T.x >= r.x && T.x <= r.x + r.w && T.y >= r.y && T.y <= r.y + r.h; }}); }}).length,
      cachees:M.traces.filter(function(T){{ return M.dansArche(T.x, T.y) || M.dansObstacle(T.x, T.y, 2) || M.dansTache(T.x, T.y, -2); }}).length,
      subs:M.traces.reduce(function(a, T){{ a[T.sub] = (a[T.sub] || 0) + 1; return a; }}, {{}}),
      ok:M.fins.map(function(F){{ return z.libre(F.x, F.y); }}).concat([z.libre(M.eglise.fx, M.eglise.fy), z.libre(M.depart.x, M.depart.y)]),
      obstacles:M.obstacles.map(function(O){{ return z.libre(O.x + O.w / 2, O.y + O.h / 2); }}), arches:M.arches.length, taches:M.taches.map(function(T){{ return T.type; }}),
      maisons:M.maisons.length, lieux:M.fins.map(function(F){{ return F.lieu; }})}}; }}""")
    verifier(info['moment'] == moment, f'le moment de la journée : {info["moment"]}')
    faux = 3 if niv <= 3 else 4 if niv <= 6 else 5 if niv <= 8 else 6
    chats = [c for c, bon in info['pistes']]
    verifier(info['pistes'][0] == ['moustache', True] and info['fins'] == faux and len(set(chats)) == faux + 1, f'la piste de Moustache et {faux} fausses pistes, un chat différent chacune ({chats})')
    verifier(('noisette' in chats) == (niv >= 5), 'Noisette (cinq doigts) seulement à partir du niveau 5')
    verifier(info['hors'] == 0 and all(info['ok']), f'toutes les traces sont dans les rues ({info["traces"]}), et chaque bout de piste s\'atteint à pied')
    verifier(info['cachees'] == 0, f'aucune trace sous un passage couvert, dans un obstacle ou au milieu d\'une flaque ({info["cachees"]})')
    verifier(info['subs'].get('lait', 0) > 0 and sum(info['subs'].get(k, 0) for k in ('eau', 'boue', 'farine')) > 0, f'les traces changent de matière : {info["subs"]}')
    verifier(len(info['obstacles']) >= 1 and not any(info['obstacles']), f'des obstacles ({len(info["obstacles"])}), qu\'on ne traverse pas')
    verifier(info['arches'] >= 1 and info['taches'].count('flaque') >= 2, f'des passages couverts ({info["arches"]}) et des flaques ({info["taches"]})')
    verifier(info['maisons'] > 80, f'une vraie petite ville : {info["maisons"]} maisons')
    verifier(len(set(info['lieux'])) == len(info['lieux']) and info['lieux'].count('voisin') == 1, f'chaque fausse piste finit ailleurs ({info["lieux"]})')
    verifier(5.1 * info['ech'] * 2 <= 40, f'les traces sont petites : {round(5.1 * info["ech"] * 2)} points d\'écran de large')
    verifier(pg.locator('.pg-dit .mj-lire-mini, .pg-dit button').count() >= 1 and 'suit ton doigt' in pg.inner_text('.pg-dit'), 'la bulle du conteur, avec son 🔊')
    verifier(pg.evaluate(f"() => {Z}.moustache().etat") == 'assis', 'Moustache est assis devant la grille')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-{moment}-depart.png')
    # marcher : le doigt posé sous le Pisteur, il descend ; le doigt levé, il s'arrête
    bx = pg.evaluate("() => { var r = document.querySelector('.pg').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    y0 = pg.evaluate(f"() => {Z}.etat().y")
    pg.mouse.move(bx[0], bx[1] + min(110, h * .2)); pg.mouse.down(); pg.wait_for_timeout(1500)
    y1 = pg.evaluate(f"() => {Z}.etat().y"); pg.screenshot(path=f'{OUT}/n{niv}-{w}-marche.png'); pg.mouse.up(); pg.wait_for_timeout(500)
    y2 = pg.evaluate(f"() => {Z}.etat().y"); pg.wait_for_timeout(500); y3 = pg.evaluate(f"() => {Z}.etat().y")
    verifier(y1 - y0 > 60 and abs(y3 - y2) < 1, f'le Pisteur marche vers le doigt ({round(y1 - y0)} en 1,5 s) et s\'arrête quand on le lève')
    verifier(pg.locator('.pg-dit').is_hidden(), 'dès qu\'on marche, la bulle s\'en va')
    verifier(pg.evaluate(f"() => {Z}.pas()") == 0, 'tant qu\'il n\'a pas marché dans une flaque, le Pisteur ne laisse aucune trace')
    pg.mouse.move(bx[0] - 140, bx[1]); pg.mouse.down(); pg.wait_for_timeout(1800); pg.mouse.up()
    verifier(pg.evaluate(f"() => {{ var z = {Z}, e = z.etat(); return z.libre(e.x, e.y); }}"), 'il reste dans la rue (les maisons ne se traversent pas)')
    # une flaque : les semelles mouillées, puis ses propres traces
    pg.evaluate(f"() => {{ var z = {Z}, l = z.monde.taches.filter(function(t){{ return t.type === 'flaque' && z.libre(t.x, t.y); }}), T = l[0] || z.monde.taches[0]; z.poser(T.x, T.y); }}"); pg.wait_for_timeout(300)
    sem = pg.evaluate(f"() => {Z}.chaussures()")
    verifier(sem['sub'] == 'eau' and sem['c'] == 1, f'dans une flaque, les semelles sont mouillées ({sem})')
    verifier('semelles' in pg.inner_text('.pg-dit'), 'le conteur le dit')
    # sortir de la flaque en marchant, vers une direction libre
    d = pg.evaluate(f"""() => {{ var z = {Z}, e = z.etat(), best = null; [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(v){{ var ok = 0; for(var k = 1; k < 30; k++) if(z.libre(e.x + v[0] * k * 4, e.y + v[1] * k * 4)) ok++; else break; if(!best || ok > best[1]) best = [v, ok]; }}); return best[0]; }}""")
    pg.evaluate(f"() => {Z}.aller({d[0] * 120}, {d[1] * 120})"); pg.wait_for_timeout(1400); pg.evaluate(f"() => {Z}.aller(null)")
    np = pg.evaluate(f"() => {Z}.pas()")
    verifier(np >= 3, f'en sortant de la flaque, le Pisteur laisse ses propres traces ({np})')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-semelles.png')
    # un chat qui passe en courant
    pg.evaluate(f"() => {{ var z = {Z}, M = z.monde; z.poser(M.gx[1], M.gy[0]); }}"); pg.wait_for_timeout(200)
    pg.evaluate(f"() => {Z}.aller(0, 120)"); pg.wait_for_timeout(300); pg.evaluate(f"() => {Z}.aller(null)")
    ok = pg.evaluate(f"() => {Z}.coureur()")
    pg.wait_for_timeout(1700); pg.screenshot(path=f'{OUT}/n{niv}-{w}-coureur.png'); pg.wait_for_timeout(3000)
    verifier(ok and pg.evaluate(f"() => {Z}.pasChats()") > 5 and len(pg.evaluate(f"() => {Z}.coureurs()")) == 0, 'un chat passe en courant, laisse des traces fraîches, puis s\'en va')
    # Moustache file quand on arrive
    pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx - E.dx * 140, E.fy - E.dy * 140); }}"); pg.wait_for_timeout(900)
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-moustache.png')
    verifier(pg.evaluate(f"() => {Z}.moustache().etat") == 'assis', 'de loin, Moustache miaule toujours')
    if fin == 'perdu':
        pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.x - F.dx * 50, F.y - F.dy * 50); }}"); pg.wait_for_timeout(300)
        verifier(not pg.evaluate(f"() => {Z}.etat().fini"), 'à l\'entrée de l\'impasse : pas encore perdu')
        pg.screenshot(path=f'{OUT}/n{niv}-{w}-impasse.png')
        pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.x, F.y); }}"); pg.wait_for_timeout(3000)
        t = pg.inner_text('.mj-resultat')
        nom = pg.evaluate(f"() => CHATS.par[{Z}.monde.fins[0].chat].nom")
        verifier('pas Moustache' in t and nom in t, f'au bout d\'une mauvaise piste : perdu, et le jeu dit quel chat c\'était ({t[:90]!r})')
    else:
        pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx - E.dx * 44, E.fy - E.dy * 44); }}"); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{OUT}/n{niv}-{w}-eglise.png')
        verifier(pg.evaluate(f"() => {Z}.moustache().etat") in ('fuite', 'parti') and not pg.evaluate(f"() => {Z}.etat().fini"), 'tout près, Moustache file entre les barreaux (et ce n\'est pas encore gagné)')
        pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx, E.fy); }}"); pg.wait_for_timeout(2600)
        t = pg.inner_text('.mj-resultat')
        verifier('crypte' in t.lower() and pg.locator('.mj-resultat.ok').count() == 1, f'à la grille de la crypte : gagné ({t[:70]!r})')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-fin.png')
    pg.context.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    partie(b, 3, 393, 760, 'perdu', 'matin')
    partie(b, 6, 1180, 820, 'gagné', 'apresmidi')
    partie(b, 9, 852, 393, 'gagné', 'nuit')
    b.close()
print('ÉCHECS :', echecs)
print('ERREURS :', erreurs[:10])
sys.exit(1 if echecs or erreurs else 0)
