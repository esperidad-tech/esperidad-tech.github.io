"""« Suivre les traces » (mj-pistage.js), dans la salle des mini-jeux : les traces de Moustache (13 novembre), refait le 15 novembre,
puis le deuxième tour du 15 novembre (14 h 26 : sept chats, flaques en travers, traces qui s'effacent, chats qui effacent ; la forêt).
Quatre parties (trois écrans, les trois moments, la ville et la forêt) :
  - l'explication en images et son bouton jaune ;
  - toujours les sept chats d'Odette : Moustache et six fausses pistes, chacune finit ailleurs, son chat y est assis ;
  - toutes les traces sont dans les rues, aucune sous un passage couvert, dans un obstacle ou dans une flaque ; chaque bout de piste
    s'atteint à pied (les obstacles ne bouchent jamais le chemin) ; on ne traverse pas un obstacle ;
  - les flaques, la boue, la farine (et le gué du ruisseau) barrent la rue d'un mur à l'autre ; sur la piste de Moustache, jamais
    plus de p.ecart sans une flaque ; aucune trace trop pâle pour se voir (elles disparaissent, elles ne restent pas en fantôme) ;
  - les traces changent de matière (le lait, puis l'eau ou la boue) ;
  - le Pisteur marche vers le doigt et s'arrête quand on le lève ; dans une flaque, ses semelles se salissent, puis il laisse
    ses propres traces ;
  - un chat qui passe en courant pose ses traces pour de bon et efface celles qu'il piétine (le morceau du décor est redessiné) ;
  - Moustache miaule, et file entre les barreaux (de la crypte, ou du puits) quand le Pisteur arrive ;
  - la ville : trop près d'un mauvais chat, c'est perdu (« Désolé, tu t'es trompé ») ; la forêt : il file, on continue ;
  - on gagne à la grille de la crypte (la ville) ou au vieux puits (la forêt).
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
def partie(b, niv, w, h, fin, variante, moment):
    foret = variante.startswith('foret')
    print(f'— niveau {niv}, écran {w} × {h}, {variante} ({moment}), {fin}')
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True).new_page(); pg.set_default_timeout(9000)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'Failed to load' not in m.text and 'fonts' not in m.text else None)
    pg.goto('file://' + DIST + f'/salle-mini-jeux.html#jeu=pistage&n={niv}&v={variante}'); pg.wait_for_timeout(900)
    verifier(pg.locator('.mj-go').count() == 1 and pg.locator('.mj-demo canvas, .mj-intro canvas, canvas').count() >= 1, 'l\'explication en images, et le bouton jaune')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-accueil.png')
    pg.locator('.mj-go').first.click(); pg.wait_for_timeout(4300)
    info = pg.evaluate(f"""() => {{ var z = {Z}, M = z.monde, RUE = 78;
      function point(pts, s){{ for(var i = 1; i < pts.length; i++){{ var d = Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); if(s <= d || i === pts.length - 1){{ var u = d ? Math.min(1, s / d) : 0; return {{x:pts[i-1].x + (pts[i].x - pts[i-1].x) * u, y:pts[i-1].y + (pts[i].y - pts[i-1].y) * u}}; }} s -= d; }} return pts[0]; }}
      /* le plus long bout de la piste de Moustache sans flaque (depuis le départ, jusqu'à l'impasse du bout, où Moustache se voit et s'entend) */
      var P0 = M.pistes[0], dern = 0, pire = 0;
      for(var s = 0; s < P0.longueur - 140; s += 4){{ var q = point(P0.lisse, s); if(M.dansTache(q.x, q.y, 0)) dern = s; else pire = Math.max(pire, s - dern); }}
      /* chaque tache barre la rue : au milieu, d'un mur à l'autre (à 9 pas du mur, là où passe le Pisteur) */
      var barre = M.taches.filter(function(T){{ return T.travers; }}).map(function(T){{ var c = Math.cos(T.rot + Math.PI / 2), s2 = Math.sin(T.rot + Math.PI / 2), ok = true;
        for(var l = -(RUE / 2 - 9); l <= RUE / 2 - 9; l += 3){{ var px = T.x + c * l, py = T.y + s2 * l; if(M.dansRue(px, py) && !M.dansTache(px, py, 0)) ok = false; }} return ok; }});
      return {{pistes:M.pistes.map(function(P){{ return [P.chat, !!P.bon]; }}), fins:M.fins.length, traces:M.traces.length, ech:z.etat().ech, moment:z.moment, foret:M.foret, perdre:z.perdre,
      hors:M.traces.filter(function(T){{ return !M.rues.some(function(r){{ return T.x >= r.x && T.x <= r.x + r.w && T.y >= r.y && T.y <= r.y + r.h; }}); }}).length,
      cachees:M.traces.filter(function(T){{ return M.dansArche(T.x, T.y) || M.dansObstacle(T.x, T.y, 2) || M.dansTache(T.x, T.y, -2); }}).length,
      pales:M.traces.filter(function(T){{ return T.al < 0.1; }}).length,
      subs:M.traces.reduce(function(a, T){{ a[T.sub] = (a[T.sub] || 0) + 1; return a; }}, {{}}),
      ok:M.fins.map(function(F){{ return z.libre(F.x, F.y); }}).concat([z.libre(M.eglise.fx, M.eglise.fy), z.libre(M.depart.x, M.depart.y)]),
      obstacles:M.obstacles.map(function(O){{ return z.libre(O.x + O.w / 2, O.y + O.h / 2); }}), arches:M.arches.length, taches:M.taches.map(function(T){{ return T.type; }}),
      barre:barre, pire:Math.round(pire), arbres:M.arbres.length, maisons:M.maisons.length, lieux:M.fins.map(function(F){{ return F.lieu; }}), faux:z.fauxChats()}}; }}""")
    verifier(info['moment'] == moment, f'le moment de la journée : {info["moment"]}')
    chats = [c for c, bon in info['pistes']]
    verifier(info['pistes'][0] == ['moustache', True] and info['fins'] == 6 and len(set(chats)) == 7, f'les sept chats d\'Odette : Moustache et six fausses pistes ({chats})')
    verifier(len(info['faux']) == 6 and all(f['etat'] == 'assis' for f in info['faux']), 'au bout de chaque fausse piste, son chat est assis')
    verifier(info['hors'] == 0 and all(info['ok']), f'toutes les traces sont dans les rues ({info["traces"]}), et chaque bout de piste s\'atteint à pied')
    verifier(info['cachees'] == 0, f'aucune trace sous un passage couvert, dans un obstacle ou au milieu d\'une flaque ({info["cachees"]})')
    verifier(info['pales'] == 0, 'aucune trace trop pâle pour se voir : elles disparaissent pour de bon')
    verifier(info['subs'].get('lait' if not foret else 'eau', 0) > 0 and sum(info['subs'].get(k, 0) for k in ('eau', 'boue', 'farine')) > 0, f'les traces changent de matière : {info["subs"]}')
    verifier(len(info['obstacles']) >= 1 and not any(info['obstacles']), f'des obstacles ({len(info["obstacles"])}), qu\'on ne traverse pas')
    verifier(info['arches'] >= 1 and info['taches'].count('flaque') + info['taches'].count('boue') >= 10, f'des passages couverts ({info["arches"]}) et beaucoup de flaques ({len(info["taches"])})')
    verifier(all(info['barre']), f'chaque flaque barre la rue d\'un mur à l\'autre ({info["barre"].count(False)} qui ne barrent pas)')
    ecart = 280 + (470 - 280) * min(1, max(0, (niv - 1) / 9))
    verifier(info['pire'] <= ecart + 40, f'sur la piste de Moustache, jamais plus de {round(ecart)} pas sans une flaque ({info["pire"]})')
    if foret:
        verifier('ruisseau' in info['taches'] and info['arbres'] > 500 and not info['perdre'], f'la forêt : le gué du ruisseau, {info["arbres"]} arbres et buissons ; on n\'y perd jamais')
        verifier(sum(1 for l in info['lieux'] if l in ('souche', 'terrier', 'mare', 'champignons', 'rochers', 'tronc')) >= 3, f'les fausses pistes partent surtout dans les bois ({info["lieux"]})')
    else:
        verifier(info['maisons'] > 80 and info['perdre'], f'une vraie petite ville : {info["maisons"]} maisons ; on peut y perdre')
        verifier(len(set(info['lieux'])) == len(info['lieux']) and info['lieux'].count('voisin') == 1, f'chaque fausse piste finit ailleurs ({info["lieux"]})')
    verifier(5.1 * info['ech'] * 2 <= 40, f'les traces sont petites : {round(5.1 * info["ech"] * 2)} points d\'écran de large')
    verifier(pg.locator('.pg-dit .mj-lire-mini, .pg-dit button').count() >= 1 and 'suit ton doigt' in pg.inner_text('.pg-dit'), 'la bulle du conteur, avec son 🔊')
    verifier(pg.evaluate(f"() => {Z}.moustache().etat") == 'assis', 'Moustache est assis (devant la grille, ou sur le puits)')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-depart.png')
    # marcher : le doigt posé sous le Pisteur, il descend ; le doigt levé, il s'arrête
    bx = pg.evaluate("() => { var r = document.querySelector('.pg').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    y0 = pg.evaluate(f"() => {Z}.etat().y")
    pg.mouse.move(bx[0], bx[1] + min(110, h * .2)); pg.mouse.down(); pg.wait_for_timeout(1500)
    y1 = pg.evaluate(f"() => {Z}.etat().y"); pg.screenshot(path=f'{OUT}/n{niv}-{w}-marche.png'); pg.mouse.up(); pg.wait_for_timeout(500)
    y2 = pg.evaluate(f"() => {Z}.etat().y"); pg.wait_for_timeout(500); y3 = pg.evaluate(f"() => {Z}.etat().y")
    verifier(y1 - y0 > 60 and abs(y3 - y2) < 1, f'le Pisteur marche vers le doigt ({round(y1 - y0)} en 1,5 s) et s\'arrête quand on le lève')
    verifier(pg.locator('.pg-dit').is_hidden() or 'semelles' in pg.inner_text('.pg-dit'), 'dès qu\'on marche, la bulle s\'en va (ou dit qu\'on a marché dans la flaque)')
    s0 = pg.evaluate(f"() => {Z}.chaussures()")
    verifier(s0['sub'] is not None or pg.evaluate(f"() => {Z}.pas()") == 0, f'tant qu\'il n\'a pas marché dans une flaque, le Pisteur ne laisse aucune trace ({s0})')
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
    pg.wait_for_timeout(1700); pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-coureur.png'); pg.wait_for_timeout(3000)
    pc, ef = pg.evaluate(f"() => {Z}.pasChats()"), pg.evaluate(f"() => {Z}.effacees()")
    verifier(ok and pc > 3 and len(pg.evaluate(f"() => {Z}.coureurs()")) == 0, f'un chat passe en courant, pose ses traces pour de bon ({pc}), puis s\'en va (il en a effacé {ef})')
    # effacer : les traces sous les pattes d'un chat qui court disparaissent du décor
    n = pg.evaluate(f"() => {{ var M = {Z}.monde, T = M.traces.filter(function(t){{ return !t.ef && !t.own; }})[0]; return T ? [M.effacer(T.x, T.y, 2, null), !!T.ef] : [0, false]; }}")
    verifier(n[0] >= 1 and n[1], f'sous les pattes d\'un chat qui court, une trace s\'efface ({n})')
    # Moustache file quand on arrive (dans la forêt, le puits est juste au-delà du bout du chemin)
    pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx - E.dx * 140, E.fy - E.dy * 140); }}"); pg.wait_for_timeout(900)
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-moustache.png')
    verifier(pg.evaluate(f"() => {Z}.moustache().etat") == 'assis', 'de loin, Moustache miaule toujours')
    if fin == 'perdu':
        # (Romain, 14 h 26) trop près d'un mauvais chat : « Désolé, tu t'es trompé, tu n'as pas suivi la bonne trace »
        pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.x - F.dx * 80, F.y - F.dy * 80); }}"); pg.wait_for_timeout(300)
        verifier(not pg.evaluate(f"() => {Z}.etat().fini"), 'à l\'entrée de l\'impasse : pas encore perdu')
        pg.screenshot(path=f'{OUT}/n{niv}-{w}-impasse.png')
        pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.cx - F.dx * 30, F.cy - F.dy * 30); }}"); pg.wait_for_timeout(3200)
        t = pg.inner_text('.mj-resultat')
        nom = pg.evaluate(f"() => CHATS.par[{Z}.monde.fins[0].chat].nom")
        verifier('trompé' in t and 'bonne trace' in t and nom in t, f'près d\'un mauvais chat : perdu, « Désolé, tu t\'es trompé », et le jeu dit quel chat c\'était ({t[:110]!r})')
    else:
        if foret:
            # la forêt : près d'un mauvais chat, il file dans les fougères, et on continue (on n'y perd jamais)
            pg.evaluate(f"() => {{ var z = {Z}, F = z.monde.fins[0]; z.poser(F.cx - F.dx * 30, F.cy - F.dy * 30); }}"); pg.wait_for_timeout(1300)
            et = pg.evaluate(f"() => {Z}.fauxChats()[0].etat")
            dits = ' '.join(pg.evaluate(f"() => {Z}.dits()"))
            verifier(et in ('fuite', 'parti') and not pg.evaluate(f"() => {Z}.etat().fini") and 'reviens sur tes pas' in dits, f'la forêt : près d\'un mauvais chat, il file, le conteur dit de rebrousser chemin, et ce n\'est pas perdu ({et})')
            pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-faux.png')
            pres = f"E.fx + E.dx * 45, E.fy + E.dy * 45"
        else:
            pres = f"E.fx - E.dx * 44, E.fy - E.dy * 44"
        pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser({pres}); }}"); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-arrivee.png')
        verifier(pg.evaluate(f"() => {Z}.moustache().etat") in ('fuite', 'parti') and not pg.evaluate(f"() => {Z}.etat().fini"), 'tout près, Moustache file entre les barreaux (et ce n\'est pas encore gagné)')
        pg.wait_for_timeout(900); pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-parti.png')
        pg.evaluate(f"() => {{ var z = {Z}, E = z.monde.eglise; z.poser(E.fx, E.fy); }}"); pg.wait_for_timeout(2600)
        t = pg.inner_text('.mj-resultat')
        verifier(('puits' if foret else 'crypte') in t.lower() and pg.locator('.mj-resultat.ok').count() == 1, f'au bout : gagné ({t[:70]!r})')
    pg.screenshot(path=f'{OUT}/n{niv}-{w}-{variante}-fin.png')
    pg.context.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    partie(b, 3, 393, 760, 'perdu', 'matin', 'matin')
    partie(b, 6, 1180, 820, 'gagné', 'apresmidi', 'apresmidi')
    partie(b, 9, 852, 393, 'gagné', 'foret', 'nuit')
    partie(b, 4, 1024, 768, 'gagné', 'foretmatin', 'matin')
    b.close()
print('ÉCHECS :', echecs)
print('ERREURS :', erreurs[:10])
sys.exit(1 if echecs or erreurs else 0)
