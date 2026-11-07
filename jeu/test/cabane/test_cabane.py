"""Banc d'essai de la cabane du Pisteur et de sa garde-robe (Playwright).
Usage : BRUMEVAL_DIST=/chemin python3 test/cabane/test_cabane.py
Vérifie : la cabane à 5 tailles d'écran (le Pisteur en grand, la carte presque plein écran sur son chevalet),
le glisser et les flèches, s'habiller sur la cabane (toucher une partie du corps, les vêtements à côté,
les bulles de couleur, refermer en touchant à côté), l'armoire-collection (tout sur un écran),
le zoom à deux doigts de la carte du chevalet, une trouvaille en explorant l'enquête 1, les points « nouveau »,
la sauvegarde (rechargement, passage E1 → E2, ancienne sauvegarde, défaite), le portrait du bandeau, moins de mouvement.
Finit par ERREURS : [] quand tout va bien."""
import os, re
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html')
OUT = os.path.join(ICI, 'captures')
os.makedirs(OUT, exist_ok=True)
ERREURS = []

def verif(cond, msg):
    if not cond:
        ERREURS.append(msg); print('  ✗', msg)
    else:
        print('  ✓', msg)

def page(b, w, h, reduit=False, tactile=False):
    ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce' if reduit else 'no-preference', has_touch=tactile)
    ctx.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste la cabane : l'enquête 1 sans le tutoriel guidé (qui grise la cabane tant que la trame n'est pas faite ; tools/tuto.py le teste)
    pg = ctx.new_page()
    pg.set_default_timeout(30000)
    pg.on('console', lambda m: ERREURS.append(f'[{w}x{h}] console : {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: ERREURS.append(f'[{w}x{h}] PAGEERROR {e}'))
    return pg

def creer(pg, nom='Naïm', sexe=None):
    pg.goto(URL)
    pg.click('[data-act=creer]')
    pg.click('[data-act=crea-role][data-r=pisteur]')
    if sexe: pg.click(f'[data-act=crea-opt][data-k=sexe][data-v={sexe}]')
    pg.click('[data-act=crea-suite]')
    pg.fill('#nom', nom)
    pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]')
    pg.click('[data-act=commencer]')
    pg.evaluate("""() => { MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 50); return {arreter:function(){}}; }; }""")
    pg.wait_for_timeout(200)

def cabane(pg):
    pg.click('[data-act=onglet][data-o=role]')
    pg.wait_for_timeout(350)

def G(pg):
    return pg.evaluate('() => JSON.parse(JSON.stringify(M.S.garde || null))')

def toucher(pg, sel):
    """Touche un morceau du dessin (le premier trait du groupe SVG, comme un doigt posé dessus)."""
    return pg.evaluate("(s) => { var g = document.querySelector(s); if(!g) return false; var el = g.matches('path,circle,ellipse,rect,polygon') ? g : (g.querySelector('path, circle, ellipse, rect, polygon') || g); el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true})); return true; }", sel)

def choix(pg):
    """Ce que montre le panneau des vêtements : [(emplacement, [ids])], et s'il est ouvert."""
    return pg.evaluate("""() => { var c = document.querySelector('.cb-choix'); if(!c || c.hidden) return null;
      return [].map.call(c.querySelectorAll('.cb-choix-slot'), function(s){ var l = [].map.call(s.querySelectorAll('.cb-ic[data-ch=it]'), function(b){ return b.dataset.id; }); var r = s.querySelector('[data-ch=rien]'); return [r ? r.dataset.s : '?', l]; }); }""")

def ouvert(pg, sel):
    return pg.evaluate("(s) => { var e = document.querySelector(s); return !!e && !e.hidden && e.getBoundingClientRect().width > 0; }", sel)

def explorer(pg, lieu, points=()):
    pg.evaluate(f"() => {{ var el = document.createElement('i'); el.dataset.id = '{lieu}'; M.A.lieu(el); }}")
    pg.wait_for_timeout(150)
    pg.click(f'#voile [data-act=explorer][data-id={lieu}]')
    pg.wait_for_timeout(250)
    for p in points:
        pg.click(f'#voile [data-act=point][data-id={p}]')
        pg.wait_for_timeout(350)
        pg.click('#voile .b-decouverte .btn.grand')
        pg.wait_for_timeout(150)

ZONES = {'tete': ['tete', 'yeux', 'bouche'], 'cou': ['bouche', 'cou'], 'corps': ['corps', 'cape'], 'jambes': ['jambes'], 'pieds': ['pieds'], 'mains': ['mains', 'bras', 'arme'], 'carquois': ['fleches', 'carquois']}

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------- 1. La cabane à cinq tailles d'écran ----------
    print('1. La cabane à cinq tailles')
    for (w, h) in [(360, 740), (390, 844), (844, 390), (800, 1280), (1280, 800)]:
        pg = page(b, w, h)
        creer(pg, 'Alicia' if w % 2 else 'Naïm', 'm' if w in (390, 800) else None)
        cabane(pg)
        r = pg.evaluate("""() => {
          var c = document.getElementById('cabane-ici'), t = document.querySelector('.b-onglets'), e = document.querySelector('.b-entete');
          var R = function(el){ var x = el.getBoundingClientRect(); return {l:x.left, t:x.top, w:x.width, h:x.height, b:x.bottom, r:x.right}; };
          var o = {cab:c ? R(c) : null, nav:R(t), tete:R(e), carte:R(document.getElementById('cabane-carte')), cadre:R(document.querySelector('.cb-cadre')), armoire:R(document.querySelector('.cb-armoire')), sac:R(document.querySelector('.cb-sac')),
            haut:R(document.querySelector('.cb-perso [data-zone=tete]')), pieds:R(document.querySelector('.cb-perso [data-zone=pieds]')),
            scroll:document.documentElement.scrollWidth > window.innerWidth + 1, onglet:document.querySelector('.b-onglets [data-o=role]').textContent, vue:M._cabane.vue()};
          return o; }""")
        verif(r['cab'] is not None, f'{w}x{h} : la cabane est le premier onglet')
        verif('Cabane' in r['onglet'] and '🛖' in r['onglet'], f'{w}x{h} : l\'onglet s\'appelle « 🛖 Cabane »')
        verif(abs(r['cab']['t'] - r['tete']['b']) < 3 and abs(r['cab']['b'] - r['nav']['t']) < 3, f'{w}x{h} : la cabane remplit l\'espace entre le bandeau et les onglets ({r["cab"]["t"]:.0f}→{r["cab"]["b"]:.0f})')
        verif(not r['scroll'], f'{w}x{h} : pas de défilement de la page sur le côté')
        fig = r['pieds']['b'] - r['haut']['t']
        verif(fig >= .75 * r['cab']['h'] and r['pieds']['b'] <= r['cab']['b'] + 2, f'{w}x{h} : le Pisteur, en grand, prend presque toute la hauteur ({fig:.0f} px sur {r["cab"]["h"]:.0f})')
        verif(r['cadre']['w'] >= .85 * w or r['cadre']['h'] >= .8 * r['cab']['h'], f'{w}x{h} : le cadre de la carte remplit presque l\'écran ({r["cadre"]["w"]:.0f}×{r["cadre"]["h"]:.0f})')
        verif(r['cadre']['h'] <= r['cab']['h'] and r['cadre']['w'] <= w, f'{w}x{h} : … sans dépasser de l\'écran')
        verif(r['carte']['w'] > 150 and r['carte']['h'] > 150, f'{w}x{h} : la carte du chevalet a une vraie taille ({r["carte"]["w"]:.0f}×{r["carte"]["h"]:.0f})')
        verif(min(r['armoire']['w'], r['armoire']['h'], r['sac']['w'], r['sac']['h']) >= 48, f'{w}x{h} : armoire et sac font au moins 48 px')
        pg.screenshot(path=f'{OUT}/cabane-{w}x{h}.png')
        if (w, h) == (390, 844):
            # ---------- 2. Glisser ----------
            print('2. Glisser la cabane au doigt, et les flèches')
            v0 = pg.evaluate('() => M._cabane.vue().pan')
            box = r['cab']
            pg.mouse.move(box['l'] + 300, box['t'] + 300); pg.mouse.down()
            for i in range(1, 9): pg.mouse.move(box['l'] + 300 - i * 30, box['t'] + 300)
            pg.mouse.up(); pg.wait_for_timeout(100)
            v1 = pg.evaluate('() => M._cabane.vue().pan')
            verif(v1['x'] > v0['x'] + 150, f'glisser vers la gauche montre la droite de la cabane (pan {v0["x"]:.0f} → {v1["x"]:.0f})')
            verif(pg.evaluate('() => !M.UI.modal') and not ouvert(pg, '.cb-choix'), 'glisser n\'a rien ouvert')
            for i in range(4):
                if pg.is_visible('.cb-fleche.d'): pg.click('.cb-fleche.d'); pg.wait_for_timeout(600)
            cd = pg.evaluate('() => { var x = document.querySelector(".cb-cadre").getBoundingClientRect(); return {l:x.left, r:x.right}; }')
            verif(cd['l'] >= 0 and cd['r'] <= w, f'la flèche › va jusqu\'au chevalet : le cadre est tout entier à l\'écran ({cd["l"]:.0f}→{cd["r"]:.0f})')
            verif(not pg.is_visible('.cb-fleche.d'), '… et il n\'y a plus de flèche › après la carte')
            pg.screenshot(path=f'{OUT}/cabane-chevalet-{w}x{h}.png')
            v2 = pg.evaluate('() => M._cabane.vue().pan')
            pg.click('.cb-fleche.g'); pg.wait_for_timeout(600)
            v3 = pg.evaluate('() => M._cabane.vue().pan')
            verif(v3['x'] < v2['x'], 'la flèche ‹ fait revenir vers la gauche')
        pg.close()

    # ---------- 3. S'habiller sur la cabane ----------
    print('3. S\'habiller sur la cabane : toucher une partie du corps, les vêtements à côté, les bulles de couleur')
    pg = page(b, 390, 844)
    creer(pg, 'Naïm', 'm')
    cabane(pg)
    av = pg.evaluate('() => document.querySelector(".b-et-heros").innerHTML')
    verif('data-gs' not in av, 'au départ, le portrait du bandeau ne porte rien de la garde-robe')
    g = G(pg)
    verif(g and len(g['a']) == 6 and not g['p'], f'au départ : 6 vêtements, rien de porté ({len(g["a"]) if g else 0})')
    verif(not ouvert(pg, '.cb-choix') and not ouvert(pg, '.cb-couleurs'), 'rien n\'est ouvert à côté du Pisteur au départ')
    toucher(pg, '.cb-perso [data-zone=tete]'); pg.wait_for_timeout(400)
    c = choix(pg)
    verif(c is not None and not ouvert(pg, '.gr') and not pg.evaluate('() => !!M.UI.modal'), 'toucher la tête montre ses vêtements à côté du Pisteur, sans ouvrir de menu')
    verif(c and [s for s, _ in c] == ZONES['tete'], f'la tête montre : couvre-chefs, yeux et foulard ({[s for s, _ in c] if c else None})')
    ids = [i for _, l in (c or []) for i in l]
    verif(ids and all(i in g['a'] for i in ids), f'seuls les vêtements trouvés sont proposés ({ids})')
    verif(pg.locator('.cb-choix .cb-neuf').count() == len(ids), 'les vêtements tout neufs ont leur petit point « nouveau »')
    verif(not ouvert(pg, '.cb-couleurs'), 'pas de bulles de couleur tant que rien n\'est porté ici')
    t = pg.evaluate("() => { var R = function(s){ var x = document.querySelector(s).getBoundingClientRect(); return [x.left, x.right, x.top, x.bottom]; }; return {ch:R('.cb-choix'), ic:[].map.call(document.querySelectorAll('.cb-choix button'), function(b){ var x = b.getBoundingClientRect(); return Math.min(x.width, x.height); })}; }")
    verif(t['ch'][0] >= 0 and t['ch'][1] <= 390 and t['ch'][3] <= 844, 'le panneau des vêtements tient dans l\'écran')
    verif(min(t['ic']) >= 47.5, f'chaque bouton du panneau fait au moins 48 px ({min(t["ic"]):.2f})')
    pg.screenshot(path=f'{OUT}/habiller-tete.png')
    pg.click('.cb-choix .cb-ic[data-id=capuche_foret]'); pg.wait_for_timeout(250)
    verif(G(pg)['p'].get('tete') == 'capuche_foret', 'toucher la capuche la met')
    verif('data-gs="tete"' in pg.evaluate('() => document.querySelector(".cb-perso").innerHTML'), '… le Pisteur la porte aussitôt')
    verif('data-gs="tete"' in pg.evaluate('() => document.querySelector(".b-et-heros").innerHTML'), '… et le portrait du bandeau aussi')
    verif(ouvert(pg, '.cb-couleurs') and pg.locator('.cb-couleurs .cb-coul').count() == 14, 'les 14 bulles de couleur apparaissent sur le côté')
    bulles = pg.evaluate("() => { var c = document.querySelector('.cb-couleurs').getBoundingClientRect(), h = document.querySelector('.cb-choix').getBoundingClientRect(); return {c:[c.left, c.right], h:[h.left, h.right], t:[].map.call(document.querySelectorAll('.cb-coul'), function(b){ var x = b.getBoundingClientRect(); return Math.min(x.width, x.height); })}; }")
    verif(min(bulles['t']) >= 47.5, f'chaque bulle fait au moins 48 px ({min(bulles["t"]):.2f})')
    verif(bulles['c'][1] <= bulles['h'][0] and bulles['c'][0] >= 0, 'les bulles sont d\'un côté du Pisteur, les vêtements de l\'autre')
    pg.click('.cb-coul[data-c=violet]'); pg.wait_for_timeout(200)
    verif(G(pg)['a']['capuche_foret']['c'] == 'violet', 'toucher une bulle colore le vêtement choisi (capuche violette)')
    pg.click('.cb-coul[data-c=rouge]'); pg.wait_for_timeout(200)
    verif(G(pg)['a']['capuche_foret']['c'] == 'rouge', '… puis une autre bulle, une autre couleur (rouge)')
    verif(pg.locator('.cb-coul.on[data-c=rouge]').count() == 1, 'la bulle de la couleur portée est marquée')
    pg.screenshot(path=f'{OUT}/habiller-couleurs.png')
    pg.click('.cb-choix .cb-ic[data-id=cache_cou]'); pg.wait_for_timeout(200)
    verif(G(pg)['p'].get('bouche') == 'cache_cou', 'le foulard se met depuis la tête aussi')
    pg.click('.cb-coul[data-c=jaune]'); pg.wait_for_timeout(200)
    verif(G(pg)['a']['cache_cou']['c'] == 'jaune' and G(pg)['a']['capuche_foret']['c'] == 'rouge', 'les bulles colorent maintenant le foulard (le dernier choisi), pas la capuche')
    pg.click('.cb-choix [data-ch=rien][data-s=bouche]'); pg.wait_for_timeout(200)
    verif('bouche' not in G(pg)['p'], '✖ enlève le foulard')
    pg.click('.cb-choix .cb-ic[data-id=cache_cou]'); pg.wait_for_timeout(200)
    # toucher à côté : ça se referme
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(250)
    verif(not ouvert(pg, '.cb-choix') and not ouvert(pg, '.cb-couleurs'), 'toucher à côté referme les vêtements et les bulles')
    g = G(pg)
    verif(all(not g['a'][i].get('n') for i in ids), 'les vêtements vus n\'ont plus leur point « nouveau »')
    # chaque partie du corps
    for z, slots in ZONES.items():
        ok = toucher(pg, f'.cb-perso [data-zone={z}]'); pg.wait_for_timeout(250)
        c = choix(pg)
        verif(ok and c is not None and [s for s, _ in c] == slots, f'toucher « {z} » montre {slots} ({[s for s, _ in c] if c else None})')
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(200)
    toucher(pg, '.cb-perso [data-gs=bouche]'); pg.wait_for_timeout(250)
    c = choix(pg)
    verif(c and [s for s, _ in c] == ZONES['cou'] and pg.locator('.cb-choix .cb-ic.sel[data-id=cache_cou]').count() == 1, 'toucher le foulard porté ouvre le cou, foulard choisi')
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(200)
    # le carquois : derrière l'épaule, facile à toucher sans toucher la tête
    q = pg.evaluate("""() => { var g = document.querySelector('.cb-perso [data-zone=carquois]'); if(!g) return null; var r = g.getBoundingClientRect(), n = 0, n2 = 0;
      for(var x = r.left; x < r.right; x += 4) for(var y = r.top; y < r.bottom; y += 4){ var e = document.elementFromPoint(x, y), z = e && e.closest('[data-zone]'); if(z && z.dataset.zone === 'carquois'){ n++; } }
      return {aire:n * 16, l:r.left, r:r.right, t:r.top, b:r.bottom}; }""")
    verif(q and q['aire'] >= 48 * 48 * 2, f'le carquois sort de derrière l\'épaule : une grande surface à toucher ({q["aire"] if q else 0} px²)')
    pg.close()

    # ---------- 3 bis. L'armoire : la collection ----------
    print('3 bis. L\'armoire montre la collection (tout tient sur un écran)')
    for (w, h) in [(360, 740), (390, 844), (1280, 800)]:
        pg = page(b, w, h)
        creer(pg, 'Alicia')
        cabane(pg)
        for i in range(3):
            if pg.is_visible('.cb-fleche.g'): pg.click('.cb-fleche.g'); pg.wait_for_timeout(600)
        pg.click('.cb-armoire'); pg.wait_for_timeout(400)
        verif(ouvert(pg, '.gr'), f'{w}x{h} : toucher l\'armoire ouvre la collection')
        titre = pg.inner_text('.gr-tete h2')
        verif(re.search(r'Garde-robe\s*6\s*/\s*159', titre) is not None, f'{w}x{h} : le titre compte trouvés / total (« {titre.strip()} »)')
        verif(pg.locator('.gr-case').count() == 13, f'{w}x{h} : les 13 emplacements')
        f = pg.evaluate("() => { var d = document.querySelector('.gr-defile'), l = document.querySelector('.gr-cases').getBoundingClientRect(), r = d.getBoundingClientRect(); return {sh:d.scrollHeight, ch:d.clientHeight, bas:l.bottom, fin:r.bottom}; }")
        verif(f['bas'] <= f['fin'] + 1, f'{w}x{h} : les 13 emplacements tiennent sur un écran ({f["bas"]:.0f} ≤ {f["fin"]:.0f})')
        txt = pg.inner_text('.gr')
        verif(pg.locator('.gr .gr-coul, .gr .cb-coul, .gr [data-gr=hasard], .gr .b-lire').count() == 0 and '🎲' not in txt and '🔊' not in txt, f'{w}x{h} : ni palette, ni 🎲, ni 🔊 dans la collection')
        verif('Capuche' not in txt and 'Tunique' not in txt, f'{w}x{h} : pas de noms de vêtements écrits')
        if (w, h) == (390, 844):
            pg.screenshot(path=f'{OUT}/collection.png')
            pg.click('.gr-case[data-s=tete]'); pg.wait_for_timeout(300)
            n = pg.evaluate("() => [document.querySelectorAll('.gr-liste > *').length, document.querySelectorAll('.gr-liste .gr-v:not(.gr-v-ferme)').length, document.querySelectorAll('.gr-liste .gr-v-ferme').length, Object.keys(M.S.garde.a).filter(function(id){ return Garde.ITEMS[id].slot === 'tete'; }).length]")
            verif(n[0] == 18 and n[1] == n[3] and n[1] >= 1 and n[2] == 18 - n[3], f'toucher « Tête » montre ses 18 vêtements dessous : {n[1]} trouvés, {n[2]} encore à trouver')
            pg.screenshot(path=f'{OUT}/collection-tete.png')
            avant = G(pg)['p']
            pg.click('.gr-liste .gr-v:not(.gr-v-ferme)'); pg.wait_for_timeout(200)
            verif(G(pg)['p'] == avant, 'on ne s\'habille pas depuis la collection')
            pg.click('.gr-case[data-s=tete]'); pg.wait_for_timeout(200)
            verif(pg.locator('.gr-liste').count() == 0, 'toucher encore « Tête » replie la liste')
            pg.click('.gr-fermer'); pg.wait_for_timeout(250)
            verif(not ouvert(pg, '.gr'), '✕ referme la collection')
        pg.close()

    # ---------- 3 ter. La carte du chevalet : deux doigts zooment ----------
    print('3 ter. La carte du chevalet : boutons ＋ / −, pas de zoom à deux doigts')
    pg = page(b, 390, 844, tactile=True)
    creer(pg, 'Siham')
    cabane(pg)
    for i in range(4):
        if pg.is_visible('.cb-fleche.d'): pg.click('.cb-fleche.d'); pg.wait_for_timeout(600)
    pg.wait_for_timeout(300)
    r = pg.evaluate("() => { var x = document.getElementById('cabane-carte').getBoundingClientRect(); return {l:x.left, t:x.top, w:x.width, h:x.height}; }")
    pan0 = pg.evaluate('() => M._cabane.vue().pan')
    cdp = pg.context.new_cdp_session(pg)
    cx, cy = r['l'] + r['w'] / 2, r['t'] + r['h'] / 2
    def pts(d): return [{'x': cx - d, 'y': cy, 'id': 1}, {'x': cx + d, 'y': cy, 'id': 2}]
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': pts(110)})
    for d in range(100, 20, -10):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': pts(d)}); pg.wait_for_timeout(30)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(400)
    # plus de zoom à deux doigts (Romain, 3 novembre : sur iPhone, on tirait la carte hors de l'écran) : les boutons ＋ / −
    z = pg.evaluate("() => document.getElementById('cabane-carte').classList.contains('ca-zoome')")
    verif(not z, 'pincer la carte du chevalet ne la zoome plus (les boutons ＋ / − le font)')
    pan1 = pg.evaluate('() => M._cabane.vue().pan')
    verif(abs(pan1['x'] - pan0['x']) < 2, 'pincer la carte ne fait pas glisser la cabane')
    verif(pg.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1 && (window.visualViewport ? visualViewport.scale : 1) === 1'), 'la page elle-même ne zoome pas')
    verif(pg.is_visible('#cabane-carte .ca-zoom-moins') and pg.is_visible('#cabane-carte .ca-zoom-plus'), 'la carte du chevalet a ses boutons ＋ / −')
    pg.click('#cabane-carte .ca-zoom-moins'); pg.wait_for_timeout(450)
    z = pg.evaluate("() => document.getElementById('cabane-carte').classList.contains('ca-zoome')")
    pan2 = pg.evaluate('() => M._cabane.vue().pan')
    verif(z and abs(pan2['x'] - pan0['x']) < 2, 'le bouton − dézoome la carte du chevalet, sans faire glisser la cabane')
    pg.screenshot(path=f'{OUT}/chevalet-zoom.png')
    pg.close()

    # ---------- 4. Les trouvailles de l'enquête 1 (moins souvent, mais plus belles) ----------
    print('4. Les trouvailles : rien pour l\'ordinaire, un rare pour un mini-jeu gagné, un paquet pour une découverte importante')
    pg = page(b, 390, 844)
    creer(pg, 'Naïm', 'm')
    cabane(pg)
    toucher(pg, '.cb-perso [data-zone=tete]'); pg.wait_for_timeout(300)
    pg.click('.cb-choix .cb-ic[data-id=capuche_foret]'); pg.wait_for_timeout(200)
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(200)
    pg.click('[data-act=onglet][data-o=carte]'); pg.wait_for_timeout(250)
    n0 = len(G(pg)['a'])
    explorer(pg, 'mairie', ['fenetre', 'gouttiere'])
    verif(pg.locator('.gr-trouve').count() == 0 and len(G(pg)['a']) == n0, 'entrer dans la mairie et regarder la fenêtre et la gouttière (sans effort) : rien')
    acts = pg.evaluate('() => M.P().actions')
    pg.click('#voile [data-act=point][data-id=massif]'); pg.wait_for_timeout(400)   # le mini-jeu des traces (gagné)
    verif(pg.locator('.gr-trouve').count() == 1, 'gagner le mini-jeu des traces fait apparaître une trouvaille')
    t = pg.locator('.gr-trouve').inner_text() if pg.locator('.gr-trouve').count() else ''
    g = G(pg)
    nouv = [i for i in g['a'] if i not in ('capuche_foret', 'bandeau_simple', 'cache_cou', 'tunique_lin', 'pantalon_toile', 'bottes_cuir')]
    rare = pg.evaluate("(l) => l.length === 1 && !!Garde.ITEMS[l[0]].rare", nouv)
    verif(rare and len(g['a']) == n0 + 1, f'… un seul vêtement, et il est RARE ({nouv})')
    verif('✨ Un vêtement rare' in t and 'Tu as trouvé' in t, f'le texte de la trouvaille : « {t.strip()[:70]} »')
    verif(pg.locator('.gr-trouve .gr-trouve-lire').count() == 1, 'la trouvaille a son bouton 🔊')
    verif(pg.evaluate('() => getComputedStyle(document.querySelector(".gr-trouve")).pointerEvents') == 'none', 'la trouvaille ne bloque pas les touchers (pointer-events : none)')
    pg.click('#voile .b-decouverte .btn.grand'); pg.wait_for_timeout(200)
    verif(pg.is_visible('#voile [data-act=point]'), 'la feuille du lieu reste ouverte, on peut continuer d\'explorer')
    pg.screenshot(path=f'{OUT}/trouvaille-rare.png')
    verif(pg.evaluate('() => M.P().actions') == acts, 'trouver des vêtements ne coûte aucune action')
    try:
        pg.wait_for_function('() => M._cabane.enAttente() === 0 && !document.querySelector(".gr-trouve")', timeout=60000); parti = True
    except Exception:
        parti = False
    verif(parti, 'la trouvaille s\'en va toute seule (vers l\'onglet Cabane)')
    verif(pg.locator('.b-onglets [data-o=role] .cb-onglet-badge').count() == 1, '✨ sur l\'onglet Cabane : il y a du nouveau')
    pg.evaluate('() => M.fermer()'); pg.wait_for_timeout(150)
    # une découverte importante : la fin du premier chapitre (on entre dans la forêt), puis l'indice clé du Vieux Chêne
    n1 = len(G(pg)['a'])
    pg.evaluate("() => { M.P().recus['info:carte'] = true; M.P().actions = 9; M.sauver(); M.render(); }"); pg.wait_for_timeout(200)
    explorer(pg, 'foret')
    verif(pg.locator('.gr-trouve').count() == 1, 'entrer enfin dans la forêt (fin du premier chapitre) : une seule carte de trouvaille…')
    t = pg.locator('.gr-trouve').inner_text() if pg.locator('.gr-trouve').count() else ''
    verif('🎁 Un paquet : 2 trouvailles' in t and pg.locator('.gr-trouve .gr-trouve-img').count() == 2 and len(G(pg)['a']) == n1 + 2, f'… un paquet de 2 vêtements, montrés ensemble (« {t.strip()[:80]} »)')
    pg.screenshot(path=f'{OUT}/trouvaille-paquet-2.png')
    pg.evaluate('() => M.fermer()'); pg.wait_for_timeout(150)
    explorer(pg, 'chene', ['racines'])
    pg.wait_for_timeout(300)
    try:
        pg.wait_for_function("() => [].some.call(document.querySelectorAll('.gr-trouve'), function(e){ return /3 trouvailles/.test(e.textContent); })", timeout=30000); trois = True
    except Exception:
        trois = False
    verif(trois and len(G(pg)['a']) == n1 + 5, f'l\'indice clé (le souffle sous le Vieux Chêne) : un paquet de 3 ({len(G(pg)["a"]) - n1 - 2} de plus)')
    nb_rares = pg.evaluate("() => (document.querySelector('.gr-trouve.paquet') || {querySelectorAll:function(){ return []; }}).querySelectorAll('.gr-trouve-img.rare').length")
    verif(nb_rares <= 1, f'… surtout des vêtements courants (au plus un rare : {nb_rares})')
    pg.screenshot(path=f'{OUT}/trouvaille-paquet-3.png')
    pg.evaluate('() => M.fermer()'); pg.wait_for_timeout(150)
    n_avant = len(G(pg)['a'])
    pg.evaluate("() => { var el = document.createElement('i'); el.dataset.id = 'mairie'; M.A.lieu(el); M.render(); }")
    pg.wait_for_timeout(300)
    verif(len(G(pg)['a']) == n_avant, 'revenir dans un lieu ne redonne rien')
    pg.evaluate('() => M.fermer()'); pg.wait_for_timeout(150)
    # une mission bonus gagnée : un vêtement
    pg.evaluate("() => { M.P().actions = 9; M.A.bonus({dataset:{id:'ballon'}}); }"); pg.wait_for_timeout(600)
    pg.evaluate('() => { M.fermer(); M.render(); }'); pg.wait_for_timeout(300)
    verif(len(G(pg)['a']) == n_avant + 1 and 'gant_archer' in G(pg)['a'], 'gagner la mission bonus du ballon donne un vêtement (gant d\'archer)')
    try:
        pg.wait_for_function('() => M._cabane.enAttente() === 0 && !document.querySelector(".gr-trouve")', timeout=90000)
    except Exception:
        pass
    # le mini-jeu déjà gagné ne redonne rien (première victoire seulement)
    n2 = len(G(pg)['a'])
    pg.evaluate("() => { M.P().vus['pisteur:mairie:massif'] = 'rate'; M.render(); M.P().vus['pisteur:mairie:massif'] = 'ok'; M.render(); }"); pg.wait_for_timeout(300)
    verif(len(G(pg)['a']) == n2, 'regagner le même mini-jeu ne redonne rien')

    # ---------- 5. Les points « nouveau » ----------
    print('5. Les points « nouveau »')
    cabane(pg)
    verif(pg.locator('.cb-armoire .cb-badge').count() == 1, 'l\'armoire montre le nombre de nouveautés')
    toucher(pg, '.cb-perso [data-zone=tete]'); pg.wait_for_timeout(300)
    verif(pg.locator('.cb-choix .cb-ic[data-id=masque_papillon] .cb-neuf').count() == 1, 'à la tête, le masque papillon (le rare des traces) a son point « nouveau »')
    pg.screenshot(path=f'{OUT}/habiller-nouveau.png')
    pg.click('.cb-choix .cb-ic[data-id=masque_papillon]'); pg.wait_for_timeout(200)
    verif(G(pg)['p'].get('yeux') == 'masque_papillon' and pg.locator('.cb-choix .cb-ic[data-id=masque_papillon] .cb-neuf').count() == 0, 'le mettre le porte, et le point disparaît')
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(200)
    # un collier sous un foulard : le collier passe par-dessus
    pg.evaluate("() => { var G = M.etatGarde(); G.a.medaillon = {c:Garde.ITEMS.medaillon.c, n:1, o:++G.n}; M.sauver(); M.render(); }"); pg.wait_for_timeout(300)
    toucher(pg, '.cb-perso [data-zone=cou]'); pg.wait_for_timeout(300)
    pg.click('.cb-choix .cb-ic[data-id=medaillon]'); pg.wait_for_timeout(200)
    pg.click('.cb-choix .cb-ic[data-id=cache_cou]'); pg.wait_for_timeout(250)
    ordre = pg.evaluate("""() => { var f = function(s){ var o = []; [].forEach.call(document.querySelectorAll(s + ' [data-gs]'), function(e){ var g = e.dataset.gs; if(g === 'bouche' || g === 'cou') o.push(g); }); return o.join(','); }; return [f('.cb-perso'), f('.b-et-heros')]; }""")
    verif(ordre[0].endswith('cou') and 'bouche' in ordre[0], f'avec un foulard, le collier est dessiné par-dessus (cabane : {ordre[0]})')
    verif(not ordre[1] or ordre[1].endswith('cou'), f'… et dans le portrait du bandeau ({ordre[1]})')
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(200)
    for i in range(3):
        if pg.is_visible('.cb-fleche.g'): pg.click('.cb-fleche.g'); pg.wait_for_timeout(600)
    pg.click('.cb-armoire'); pg.wait_for_timeout(300)
    verif(pg.locator('.gr-case[data-s=carquois] .gr-case-neuf').count() == 1 and pg.locator('.gr-case[data-s=yeux] .gr-case-neuf').count() == 0, 'dans la collection, « Carquois » a un point, « Yeux » (déjà vu) n\'en a plus')
    pg.click('.gr-case[data-s=carquois]'); pg.wait_for_timeout(200)
    verif(pg.locator('.gr-liste .cb-neuf').count() == 1, 'le carquois d\'écorce (du paquet) a son point dans la liste')
    pg.click('.gr-case[data-s=cou]'); pg.wait_for_timeout(200)
    verif(pg.locator('.gr-case[data-s=carquois] .gr-case-neuf').count() == 0, 'une fois vu, « Carquois » n\'a plus de point')
    pg.click('.gr-fermer'); pg.wait_for_timeout(200)
    verif(pg.locator('.cb-armoire .cb-badge').count() == 1, 'il reste du nouveau (la cape, les bottes, le gant, et ce qu\'on avait au départ)')
    pg.evaluate('() => M._cabane.aller(420, 380)'); pg.wait_for_timeout(100)
    for z in ('corps', 'jambes', 'pieds', 'mains'):
        toucher(pg, f'.cb-perso [data-zone={z}]'); pg.wait_for_timeout(250)
    toucher(pg, '.cb-fond-svg rect'); pg.wait_for_timeout(250)
    # le ✨ de l'onglet Cabane compte aussi ce qui est nouveau sous terre (la carte des sous-sols du chevalet, pas encore regardée ici)
    verif((pg.locator('.b-onglets [data-o=role] .cb-onglet-badge').count() == 0 or pg.evaluate("() => M.nouveauxSousSols() > 0")) and pg.locator('.cb-armoire .cb-badge').count() == 0, 'tout est vu : plus de ✨ sur l\'armoire, ni sur l\'onglet (sauf du nouveau sous terre)')

    # ---------- 6. Sauvegarde : rechargement, E1 → E2 ----------
    print('6. La sauvegarde')
    avant = G(pg)
    pg.reload(); pg.wait_for_timeout(400)
    if pg.is_visible('[data-act=reprendre]'): pg.click('[data-act=reprendre]'); pg.wait_for_timeout(300)
    apres = G(pg)
    verif(apres and apres['p'] == avant['p'] and set(apres['a']) == set(avant['a']), 'après un rechargement, la garde-robe et la tenue sont là')
    verif('data-gs="tete"' in pg.evaluate('() => (document.querySelector(".b-et-heros") || {innerHTML:""}).innerHTML'), 'le bandeau montre encore la tenue après rechargement')
    pg.evaluate("""() => { var S = M.S; S.e.etape = 'fin'; S.e.resolu = true; S.e.fin = {erreurs:0, etape:'recompenses', xp:0, or:0}; S.prochaine = 2; M.sauver(); M.A['nouvelle-enquete'](); }""")
    pg.wait_for_timeout(300)
    verif(pg.evaluate('() => M.E().id') == 2, 'on est passé à l\'enquête 2')
    e2 = G(pg)
    verif(e2['p'] == avant['p'] and set(avant['a']) <= set(e2['a']), 'la garde-robe passe de l\'enquête 1 à l\'enquête 2')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(200)
    pg.evaluate("""() => { MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 50); return {arreter:function(){}}; }; }""")
    n3 = len(G(pg)['a'])
    # (la nouvelle enquête 2, § 12.11 : au carrefour, le garde ; passer derrière son dos, c'est le mini-jeu « Se cacher »)
    pg.evaluate("() => { var a = M.talentsEnAttente(); if(a.indexOf(2) >= 0){ M.S.talents.push(DONNEES.TALENTS_PAR_ROLE[M.role()][2][0]); M.sauver(); M.render(); } }")   # le talent forcé du début de l'enquête 2
    explorer(pg, 'foret', ['branche'])
    verif(len(G(pg)['a']) == n3, 'dans l\'enquête 2, entrer au carrefour et regarder le garde : rien')
    pg.click('#voile [data-act=point][data-id=passer]'); pg.wait_for_timeout(300)
    pg.click('#voile [data-act=mj-go]'); pg.wait_for_timeout(400)   # l'explication avant le mini-jeu, puis le bouton jaune
    verif('cape_aurore' in G(pg)['a'] and len(G(pg)['a']) == n3 + 1, 'passer derrière le dos du garde (Se cacher, très risqué) donne un rare de l\'enquête 2 (cape d\'aurore)')
    pg.evaluate('() => M.fermer()')
    pg.close()

    # ---------- 7. Une ancienne sauvegarde, et la défaite ----------
    print('7. Ancienne sauvegarde et défaite')
    pg = page(b, 800, 1280)
    creer(pg, 'Lia')
    pg.click('[data-act=onglet][data-o=carte]'); pg.wait_for_timeout(200)
    explorer(pg, 'mairie', ['fenetre', 'massif'])
    pg.evaluate('() => M.fermer()')
    pg.evaluate("""() => { delete M.S.garde; M.sauver(); }""")
    pg.reload(); pg.wait_for_timeout(400)
    if pg.is_visible('[data-act=reprendre]'): pg.click('[data-act=reprendre]'); pg.wait_for_timeout(300)
    g = G(pg)
    verif(g and 'masque_papillon' in g['a'] and len(g['a']) == 7, 'une sauvegarde sans garde-robe se charge : vêtements de départ + ce qu\'elle avait déjà gagné')
    verif(pg.locator('.gr-trouve').count() == 0, '… sans trouvaille qui surgit au chargement')
    # une garde-robe des anciennes règles (v1) : elle garde tout, et ce qui est déjà fait ne redonne rien
    pg.evaluate("""() => { var G = M.S.garde; G.v = 1; delete G.a.masque_papillon; G.a.medaillon = {c:'jaune', n:0, o:50}; G.a.fleches_feuille = {c:'vert', n:0, o:51};
      G.f = {'1:l:mairie':1, '1:p:mairie:massif':1}; M.sauver(); }""")
    pg.reload(); pg.wait_for_timeout(400)
    if pg.is_visible('[data-act=reprendre]'): pg.click('[data-act=reprendre]'); pg.wait_for_timeout(300)
    g = G(pg)
    verif(g and 'medaillon' in g['a'] and 'fleches_feuille' in g['a'] and 'masque_papillon' not in g['a'] and g.get('v') == 2, 'une ancienne garde-robe garde tout ce qu\'elle avait trouvé, sans rien redonner pour ce qui est déjà fait')
    verif(pg.locator('.gr-trouve').count() == 0, '… et sans trouvaille au chargement')
    cabane(pg)
    pg.screenshot(path=f'{OUT}/ancienne-sauvegarde.png')
    pg.evaluate('() => M.recommencer()'); pg.wait_for_timeout(300)
    verif(pg.evaluate('() => !M.S.garde'), 'après une défaite, la garde-robe repart à zéro')
    pg.close()

    # ---------- 8. Moins de mouvement ----------
    print('8. Moins de mouvement')
    pg = page(b, 1280, 800, reduit=True)
    creer(pg, 'Siham')
    pg.evaluate("""() => { var G = M.etatGarde(); G.a.cape_poussiere = {c:'gris', n:0, o:99}; G.p.cape = 'cape_poussiere'; G.a.bottes_lumineuses = {c:'turquoise', n:0, o:100}; G.p.pieds = 'bottes_lumineuses'; M.sauver(); M.render(); }""")
    cabane(pg)
    anim = pg.evaluate("""() => { var el = document.querySelector('.cb-perso .pjg-poussiere'); return el ? getComputedStyle(el).animationName : 'absent'; }""")
    verif(anim == 'none', f'les vêtements rares ne bougent plus quand l\'appareil demande moins de mouvement ({anim})')
    pg.close()
    pg = page(b, 1280, 800)
    creer(pg, 'Romain', 'm')
    pg.evaluate("""() => { var G = M.etatGarde(); G.a.cape_poussiere = {c:'gris', n:0, o:99}; G.p.cape = 'cape_poussiere'; M.sauver(); M.render(); }""")
    cabane(pg)
    anim = pg.evaluate("""() => { var el = document.querySelector('.cb-perso .pjg-poussiere'); return el ? getComputedStyle(el).animationName : 'absent'; }""")
    verif(anim == 'pjg-poussiere', f'… et bougent normalement sinon ({anim})')
    pg.screenshot(path=f'{OUT}/cabane-rare.png')
    pg.close()
    b.close()

print('ERREURS :', ERREURS)
