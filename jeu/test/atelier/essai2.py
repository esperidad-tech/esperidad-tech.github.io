"""Décoration, gestes et cas particuliers de l'atelier v4, aux 5 tailles :
- chaque chose décorée a au moins 5 styles et les 8 couleurs ; toucher la décoration (tapis, plante, tableau, tabouret, horloge…) = le style suivant ;
  l'horloge ne sonne plus ; le mur du fond, chaque mur de côté et le plancher changent chacun de leur côté ;
- appuyer, garder le doigt, glisser = déplacer ; glisser tout de suite = la pièce défile (téléphone) ; un petit glissé = un toucher ;
- un objet reste exactement là où on le lâche (même devant la porte : le chaudron, le lutrin, la paillasse aussi) ;
- un rangement contre un mur de côté se met de profil (sans bouger), et revient de face quand on l'éloigne ; une décoration du mur prend la perspective du mur ;
- le carton 📦 (icône fixe en bas à droite) : on y glisse la décoration (il réagit au survol), on la ressort ; un cadeau sans place y va tout seul ;
- plus de pot de peinture (ni dans les cartons, ni dans les sauvegardes), plus d'armoire à potions ;
- le chat (30 s de sommeil), la lampe, la lumière de chaque moment, pas de requestAnimationFrame au repos, arreter() ;
- anciennes sauvegardes : l'atelier figé (v1) et l'atelier v3 (caisse, sac, tonneau) → v4, rien de perdu ; Atelier.retirer ; état JSON.
Usage : python3 essai2.py [390x844 ...]   (le chat est chronométré jusqu'au réveil en 390x844 seulement)"""
import sys, os, json, time, copy
from outils_at import *

TAILLES_ICI = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:] if not a.startswith('--')] or TAILLES

RAF = r"""(() => { if(window.__raf !== undefined) return; window.__raf = 0; const r = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = f => { window.__raf++; return r(f); }; })()"""
SONS = r"""(() => { if(window.sonsNoms) return; window.sonsNoms = []; const s0 = Brume.son; Brume.son = t => { sonsNoms.push(t); s0(t); }; })()"""

def un(pg, t): return pg.evaluate(f"(banc.etat.objets.find(o => o.t === '{t}') || {{}}).id")
def st(pg, oid): return pg.evaluate(f"T.objet('{oid}').st || 0")

def piece_neuve(pg):
    # (le cadeau de décoration : fanions, vase, lanterne)
    pg.evaluate("banc.connue = true; banc.etat = Atelier.etatNeuf(); banc.etat.ncs = 99; Atelier.donnerCartons(banc.etat, 1); banc.creer()"); att(pg, 500)
    ouvrir_cartons_vite(pg)
    endormir_chat(pg, un(pg, 'chat'))

def scenario(pg, t, B):
    W, H = t
    pg.evaluate(RAF); pg.evaluate(SONS)
    piece_neuve(pg)
    glissable = pg.evaluate("T.a('at-glissable')")
    B.note(f"glissable : {glissable}, k = {pg.evaluate('banc.vue._vb().k'):.2f}")
    # --- les styles : au moins 5, et les 8 couleurs (pour faire la pièce « tout violet », « tout jaune »…) ---
    info = pg.evaluate("""Object.keys(Atelier.OBJETS).filter(t => { const c = Atelier.OBJETS[t]; return c.deco || c.cases || c.special; }).map(t => {
      const c = Atelier.OBJETS[t], nf = c.nf || 1, n = nf * Atelier.THEMES.length, th = new Set(), fo = new Set();
      for(let s = 0; s < n; s++){ th.add(s % Atelier.THEMES.length); fo.add(s % nf); } return {t, n, th:th.size, fo:fo.size === nf}; })""")
    mauvais = [x['t'] for x in info if x['n'] < 5 or x['th'] != 8 or not x['fo']]
    B.v(not mauvais and len(info) >= 30, f"{len(info)} sortes d'objets : chacune ≥ 5 styles et les 8 couleurs {mauvais}")
    B.v(pg.evaluate("Atelier.THEMES.map(x => x.id).join()") == 'naturel,violet,jaune,rose,vert,bleu,rouge,orange', "les couleurs : violet, jaune, rose, vert, bleu, rouge, orange (et naturel)")
    # --- toucher la décoration : le style suivant ---
    for typ in ('tapis', 'plante', 'tableau', 'tabouret', 'horloge', 'fanions', 'vase', 'table', 'etagere'):
        oid = un(pg, typ)
        if not oid:
            B.v(False, f"{typ} absent"); continue
        s0 = st(pg, oid); n0 = pg.evaluate("sonsNoms.length")
        taper(pg, f'[data-obj="{oid}"]', 420)
        ok = st(pg, oid) == s0 + 1
        if typ == 'horloge': ok = ok and 'cloche' not in pg.evaluate(f"sonsNoms.slice({n0})")
        B.v(ok, f"toucher {typ} : style {s0} → {st(pg, oid)}" + (" (l'horloge ne sonne plus)" if typ == 'horloge' else ''))
    cap(pg, 'restyle', t, 'g')
    # --- les murs et le plancher : chacun son style ---
    for cle, vue in (('fond', (640, 200)), ('murG', (-40, 300)), ('murD', (1240, 300)), ('sol', (600, 820))):
        pg.evaluate(f"banc.vue._voir({vue[0]}, {vue[1]})"); att(pg, 200)
        p = point_surface(pg, cle)
        avant = pg.evaluate("JSON.stringify(banc.etat.deco)")
        if not p: B.v(False, f"pas de point libre sur {cle}"); continue
        toucher_net(pg, p); att(pg, 350)
        d0, d1 = json.loads(avant), pg.evaluate("banc.etat.deco")
        autres = all(d0[k] == d1[k] for k in d0 if k != cle)
        B.v(d1[cle] == d0[cle] + 1 and autres, f"toucher {cle} : un autre motif ({d0[cle]} → {d1[cle]}), le reste ne change pas")
    pg.evaluate("banc.vue._voir(600, 500)"); att(pg, 300)
    cap(pg, 'murs', t, 'g')
    # --- faire glisser la pièce, un petit glissé = un toucher ---
    if glissable:
        pg.evaluate("banc.vue._voir(600, 560)"); att(pg, 200)
        p0 = pg.evaluate("banc.vue._vb().pan")
        a = point_surface(pg, 'sol') or point_surface(pg, 'fond')
        deco0 = pg.evaluate("JSON.stringify(banc.etat.deco)")
        glisser(pg, a, {'x': a['x'] - 120, 'y': a['y'] + 80}, 12); att(pg, 200)
        p1 = pg.evaluate("banc.vue._vb().pan")
        B.v(abs(p1['x'] - p0['x']) + abs(p1['y'] - p0['y']) > 60 and pg.evaluate("JSON.stringify(banc.etat.deco)") == deco0, "glisser le plancher fait défiler la pièce (sans la repeindre)")
        pg.mouse.move(W / 2, H / 2); pg.mouse.wheel(0, -150); att(pg, 200)
        B.v(pg.evaluate("banc.vue._vb().pan") != p1, "la molette fait défiler")
        pg.evaluate("banc.vue._voir(300, 600)"); att(pg, 100)
        av = pg.evaluate("banc.vue._vb().pan"); pg.evaluate("banc.creer()"); att(pg, 400)
        ap = pg.evaluate("banc.vue._vb().pan")
        B.v(abs(av['x'] - ap['x']) < 3 and abs(av['y'] - ap['y']) < 3, "remontage par le moteur : la vue reste au même endroit")
        endormir_chat(pg, un(pg, 'chat'))
    # --- déplacer un meuble : appuyer, garder le doigt, glisser ---
    tab = un(pg, 'table')
    p = prise_sure(pg, f'[data-obj="{tab}"]'); x0 = obj(pg, tab)['x']
    if glissable:
        glisser(pg, p, {'x': p['x'] - 90, 'y': p['y'] - 10}, 12); att(pg, 400)
        B.v(obj(pg, tab)['x'] == x0, "glisser tout de suite sur un meuble : la pièce défile, le meuble ne bouge pas")
        p = prise_sure(pg, f'[data-obj="{tab}"]')
    tenir_glisser(pg, p, {'x': p['x'] + 90, 'y': p['y'] - 10})
    x1 = obj(pg, tab)['x']
    B.v(abs(x1 - x0) > 40 and not ouvert(pg), f"appuyer, garder, glisser : la table se déplace ({x0:.0f} → {x1:.0f})")
    s0 = st(pg, tab)
    p = prise_sure(pg, f'[data-obj="{tab}"]')
    toucher_net(pg, p, 5, 3, 3); att(pg, 450)
    B.v(st(pg, tab) == s0 + 1 and abs(obj(pg, tab)['x'] - x1) < 1, "un tout petit glissé (5 px) compte comme un toucher (la table change de style)")
    B.v(pg.evaluate("!document.querySelector('.at-outil') && !document.querySelector('.at').textContent.includes('↔')"), "aucun ↔️")
    # --- contre un mur de côté : de profil ---
    com = un(pg, 'commode')
    pg.evaluate("banc.vue._voir(1300, 600)"); att(pg, 250)
    p = prise_sure(pg, f'[data-obj="{com}"]')
    pc = pg.evaluate("T.rect('.at-piece')")
    tenir_glisser(pg, p, {'x': pc['l'] + pc['w'] * 0.45, 'y': pc['t'] + pc['h'] * 0.85})
    B.v(not obj(pg, com).get('cote') and not pg.evaluate(f"document.querySelector('[data-obj=\"{com}\"]').classList.contains('at-profil')"), "loin du mur : la commode revient de face")
    w0 = pg.evaluate(f"T.rect('[data-obj=\"{com}\"]').w")
    p = prise_sure(pg, f'[data-obj="{com}"]')
    # garder le doigt au bord droit : la pièce défile jusqu'au mur, puis on lâche contre le mur
    pg.mouse.move(p['x'], p['y']); pg.mouse.down(); att(pg, 380)
    pg.mouse.move(pc['l'] + pc['w'] - 6, p['y'], steps=20); att(pg, 600)
    attendre_fin_defile(pg)
    pg.mouse.up(); att(pg, 500)
    w1 = pg.evaluate(f"T.rect('[data-obj=\"{com}\"]').w")
    B.v(obj(pg, com).get('cote') == 'd' and w1 < w0 * 0.7 and 'profil' in pg.evaluate("T.toast()"), f"contre le mur de droite : de profil, moins large ({w0:.0f} → {w1:.0f} px)")
    cap(pg, 'profil', t, 'g')
    plc = un(pg, 'placard')
    if obj(pg, plc).get('cote'):
        pg.evaluate("banc.vue._voir(640, 260)"); att(pg, 200)
        pg.evaluate(f"T.voirEl('[data-obj=\"{plc}\"]')"); att(pg, 200)
        p = prise_sure(pg, f'[data-obj="{plc}"]'); pc = pg.evaluate("T.rect('.at-piece')")
        # au milieu du mur du fond de l'atelier (à gauche du placard : à droite, c'est la chambre)
        q = pg.evaluate(f"(() => {{ const v = banc.vue._vb(), r = document.querySelector('.at-piece').getBoundingClientRect(), o = banc.vue._pos('{plc}'); return {{x:r.left + (Math.max(300, o.x - 240) - v.x0) * v.k - v.pan.x, y:r.top + (300 - v.y0) * v.k - v.pan.y}}; }})()")
        q['x'] = max(pc['l'] + 60, min(pc['l'] + pc['w'] - 60, q['x']))
        tenir_glisser(pg, p, q, pas=20)
        B.v(not obj(pg, plc).get('cote'), "un placard du mur de côté, posé au milieu du mur : il revient de face")
    # --- le carton 📦 : ranger la décoration, la ressortir ---
    vas = un(pg, 'vase') or un(pg, 'plante')
    pg.evaluate(f"T.voirEl('[data-obj=\"{vas}\"]')"); att(pg, 250)
    pv = pg.evaluate(f"T.prise('[data-obj=\"{vas}\"]')")
    if not pv:
        pg.evaluate(f"(() => {{ const o = T.objet('{vas}'); o.sur = null; o.x = 700; o.y = 800; banc.creer(); }})()"); att(pg, 400)
        pg.evaluate(f"T.voirEl('[data-obj=\"{vas}\"]')"); att(pg, 250); pv = prise_sure(pg, f'[data-obj="{vas}"]')
    pr = pg.evaluate("T.rect('[data-at=reserve]')")
    # (il réagit quand on tient la décoration au-dessus, et la pièce ne défile pas sous lui)
    pg.mouse.move(pv['x'], pv['y']); pg.mouse.down(); att(pg, 380)
    pg.mouse.move(pr['x'], pr['y'], steps=18); att(pg, 500)
    survol = pg.evaluate("document.querySelector('.at-coin').classList.contains('at-survol')"); pan_s = pg.evaluate("banc.vue._vb().pan"); att(pg, 500)
    B.v(survol and pg.evaluate("banc.vue._vb().pan") == pan_s, "au-dessus du carton 📦 : il réagit (et la pièce ne défile pas)")
    pg.mouse.up(); att(pg, 600)
    B.v(pg.evaluate("banc.etat.reserve.map(x => x.id)") == [vas], f"glisser la décoration sur le carton du coin : elle y est rangée ({pg.evaluate('banc.etat.reserve.map(x => x.t)')})")
    B.v(pg.evaluate(f"!banc.etat.objets.find(o => o.id === '{vas}')") and pg.evaluate("(document.querySelector('[data-at=reserve] .at-badge') || {}).textContent") == '1', "elle n'est plus dans la pièce ; le carton montre 1")
    att(pg, 800)
    taper(pg, '[data-at=reserve]', 450)
    B.v('at-cal-reserve' in panneau(pg) and pg.evaluate("document.querySelectorAll('.at-res-o').length") == 1, "toucher le carton : ce qu'il y a dedans")
    cap(pg, 'reserve', t, 'g')
    tailles(pg, B, '.at-grim', 'carton du coin', ic=False)
    taper_ui(pg, '.at-res-o', 600)
    B.v(not pg.evaluate("banc.etat.reserve.length") and pg.evaluate(f"!!banc.etat.objets.find(o => o.id === '{vas}')"), "toucher la décoration : elle revient dans la pièce")
    # --- plus de pot de peinture ---
    B.v(pg.evaluate("!Atelier.OBJETS.pot_peinture && !banc.etat.objets.some(o => o.t === 'pot_peinture') && !Atelier.etatNeuf().cartons.some(k => k.reste.includes('pot_peinture'))"), "plus de pot de peinture (ni dans la pièce, ni dans les cartons)")
    # --- les objets restent exactement là où on les lâche, même devant la porte (le chaudron, le lutrin, la paillasse aussi) ---
    for sp in ('ch', 'lu', 'pa', un(pg, 'tabouret')):
        sel = f'[data-obj="{sp}"]'
        pg.evaluate(f"T.voirEl('{sel}')"); att(pg, 250)
        p = prise_sure(pg, sel)
        if not p: B.v(False, f"{sp} : introuvable"); continue
        vb = pg.evaluate("banc.vue._vb()"); pc = pg.evaluate("T.rect('.at-piece')")
        a0 = pg.evaluate(f"banc.vue._pos('{sp}')")
        # la porte : au milieu du mur du fond (650, 520) ; on vise un peu devant elle
        cx = pc['l'] + (650 - vb['x0']) * vb['k'] - vb['pan']['x']; cy = pc['t'] + (620 - vb['y0']) * vb['k'] - vb['pan']['y']
        q = {'x': max(pc['l'] + 50, min(pc['l'] + pc['w'] - 50, cx + (p['x'] - pc['l'] - (a0['x'] - vb['x0']) * vb['k'] + vb['pan']['x']))),
             'y': max(pc['t'] + 50, min(pc['t'] + pc['h'] - 50, cy + (p['y'] - pc['t'] - (a0['y'] - vb['y0']) * vb['k'] + vb['pan']['y'])))}
        tenir_glisser(pg, p, q, pas=18)
        vb2 = pg.evaluate("banc.vue._vb()")
        att_x = a0['x'] + (q['x'] - p['x'] + vb2['pan']['x'] - vb['pan']['x']) / vb['k']; att_y = a0['y'] + (q['y'] - p['y'] + vb2['pan']['y'] - vb['pan']['y']) / vb['k']
        a1 = pg.evaluate(f"banc.vue._pos('{sp}')"); o2 = obj(pg, sp)
        B.v(abs(a1['x'] - att_x) < 4 and abs(a1['y'] - att_y) < 4 and not o2.get('cote') and panneau(pg) == '',
            f"{sp} lâché devant la porte : il reste exactement là ({att_x:.0f},{att_y:.0f} → {a1['x']:.0f},{a1['y']:.0f})")
    pg.evaluate("banc.vue._voir(650, 600)"); att(pg, 300)
    cap(pg, 'devant-porte', t, 'g')
    # (au remontage, rien ne bouge)
    av = pg.evaluate("JSON.stringify(banc.etat.objets.map(o => [o.id, o.x, o.y, o.cote || 0, o.sur]))"); pg.evaluate("banc.creer()"); att(pg, 500)
    ap = pg.evaluate("JSON.stringify(banc.etat.objets.map(o => [o.id, o.x, o.y, o.cote || 0, o.sur]))")
    dif = [(x, y) for x, y in zip(json.loads(av), json.loads(ap)) if x != y]
    B.v(not dif, f"remontage : aucun objet ne se replace tout seul {dif[:3]}")
    taper(pg, '[data-obj=lu]', 450)
    B.v('at-cal-livre' in panneau(pg), "toucher le lutrin (déplacé) ouvre toujours le grimoire")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- un cadeau sans place (ni dans l'atelier, ni dans la chambre) : dans le carton du coin ---
    pg.evaluate("""(() => { const e = banc.etat; e.cartons = []; e.reserve = []; e.panier = {};
      for(const [x0, pc] of [[40, 0], [1350, 1]]){
        for(let i = 0; i < 70; i++) e.objets.push({id:'pl' + pc + '-' + i, t:'coussin', x:x0 + (i % 14) * 90, y:560 + Math.floor(i / 14) * 60, f:0, v:0, st:0, sur:null, pc:pc || undefined});
        for(let i = 0; i < 40; i++) e.objets.push({id:'tb' + pc + '-' + i, t:'tableau', x:x0 - 10 + (i % 10) * 120, y:140 + Math.floor(i / 10) * 110, f:0, v:0, st:0, sur:null, pc:pc || undefined});
      }
      e.nc = 2; Atelier.donnerCartons(e, 1); banc.creer(); })()"""); att(pg, 600)
    ouvrir_cartons_vite(pg)
    res = pg.evaluate("banc.etat.reserve.map(x => x.t)")
    B.v(len(res) >= 2, f"un cadeau sans place va dans le carton du coin : {res}")
    # --- le chat, la lampe ---
    piece_neuve(pg)
    c = chat(pg)
    B.v(c['dort'] and 25000 < c['reste'] <= 30000, f"toucher le chat : il dort ({c['reste'] / 1000:.1f} s)")
    if t == (390, 844):
        t0 = time.time() - (30000 - c['reste']) / 1000
        while chat(pg)['dort'] and time.time() - t0 < 40: att(pg, 250)
        B.v(28.5 < time.time() - t0 < 32, f"il se réveille au bout de {time.time() - t0:.1f} s")
    lampe = un(pg, 'lampe'); on0 = obj(pg, lampe).get('on')
    taper(pg, f'[data-obj="{lampe}"]', 400)
    B.v(obj(pg, lampe).get('on') != on0, "toucher la lampe : elle s'allume ou s'éteint (et ne change pas de style)")
    # --- pas de requestAnimationFrame au repos ---
    pg.evaluate("window.__raf = 0"); att(pg, 2000)
    B.v(pg.evaluate("window.__raf") == 0, f"au repos : {pg.evaluate('window.__raf')} requestAnimationFrame en 2 s")
    # --- la lumière de chaque moment ---
    fonds = {}
    for m in ('matin', 'apresmidi', 'soir', 'nuit'):
        pg.evaluate(f"banc.moment = '{m}'; banc.majVue()"); att(pg, 300)
        for i in range(30):   # la lumière change en 0,8 s (plus lentement quand la machine d'essai est très chargée)
            if not pg.evaluate("document.querySelector('.at-lumiere').getAnimations().length"): break
            att(pg, 200)
        fonds[m] = pg.evaluate("getComputedStyle(document.querySelector('.at-lumiere')).background + getComputedStyle(document.querySelector('.at-lumiere')).opacity")
        B.v(pg.evaluate(f"T.a('at-l-{m}')"), f"lumière : {m}")
        if t == (390, 844): cap(pg, f'm-{m}', t, 'g')
    B.v(len(set(fonds.values())) == 4, "chaque moment a sa propre lumière")
    pg.evaluate("banc.moment = 'matin'; banc.majVue()"); att(pg, 300)
    # --- outils et état ---
    pg.evaluate("Atelier.ajouter(banc.etat, 'eau', 3); banc.majVue()")
    av = pg.evaluate("Atelier.compter(banc.etat).eau || 0")
    n = pg.evaluate("Atelier.retirer(banc.etat, 'eau', 2)")
    B.v(n == 2 and (pg.evaluate("Atelier.compter(banc.etat).eau") or 0) == av - 2, "Atelier.retirer (outils) marche toujours")
    B.v(pg.evaluate("Atelier.aRangementSec(banc.etat)"), "Atelier.aRangementSec : un rangement sec est sorti des cartons")
    B.v(pg.evaluate("JSON.stringify(Atelier.normaliser(JSON.parse(JSON.stringify(banc.etat)))) === JSON.stringify(banc.etat)"), "l'état reste du JSON (aller-retour identique)")
    pg.evaluate("banc.vue.arreter(); window.__raf = 0"); att(pg, 1500)
    B.v(pg.evaluate("!document.querySelector('.at') && window.__raf === 0"), "arreter() : plus rien dans la page, plus d'animation")
    # --- anciennes sauvegardes ---
    for nom_e, E in (('atelier figé (v1)', ETAT_V1), ('atelier v3', ETAT_ATELIER)):
        av = pg.evaluate("(e => Atelier.compter(e))(" + json.dumps(E) + ")")
        monter(pg, copy.deepcopy(E)); att(pg, 700)
        e = pg.evaluate("banc.etat")
        ty = [o['t'] for o in e['objets']]
        B.v(e['v'] == 4 and not set(ty) & {'caisse', 'sac', 'tonneau'} and {'chaudron', 'lutrin', 'paillasse', 'fioles_ingr'} <= set(ty), f"{nom_e} → v4 : caisse, sac, tonneau deviennent de beaux meubles ; chaudron, lutrin, paillasse")
        B.v(pg.evaluate("Atelier.compter(banc.etat)") == av, f"{nom_e} → v4 : aucun ingrédient perdu")
        mal = pg.evaluate("banc.etat.objets.filter(o => o.cases).flatMap(o => o.cases.flatMap(c => Object.keys(c.i).filter(k => !!Atelier.LIQUIDES[k] !== !!Atelier.OBJETS[o.t].verre).map(k => o.t + ':' + k)))")
        B.v(not mal, f"{nom_e} → v4 : les liquides dans le verre, le sec dans le bois {mal}")
        B.v(all((o.get('st') or 0) == 0 for o in e['objets']) and e['deco'] == pg.evaluate("Atelier.etatNeuf().deco"), f"{nom_e} → v4 : les styles par défaut")
        B.v(any(k['reste'] == ['fanions', 'vase', 'lanterne'] for k in e['cartons']), f"{nom_e} → v4 : un carton de décoration offert (sans pot de peinture)")
        B.v(pg.evaluate("!document.querySelector('.at-etabli, .at-arrivage, .at-pupitre')") and pg.evaluate("document.querySelectorAll('.at-tas').length") == len(e['panier']), f"{nom_e} → v4 : la cueillette est posée devant la porte ({list(e['panier'])})")
        if t == (390, 844): cap(pg, 'v1' if 'v1' in nom_e else 'v3', t, 'g')
    # une sauvegarde de l'étape 1 (v4) : le pot de peinture et l'armoire à potions disparaissent, le reste ne bouge pas
    E4 = {"v": 4, "n": 30, "nc": 1, "cadeauRangements": 1, "cadeauDeco": 1, "boutique": [], "flaque": 0, "appris": {}, "panier": {"eau": 1}, "nouveaux": 0,
          "deco": {"fond": 2, "murG": 1, "murD": 0, "sol": 3, "armoire": 4}, "theme": 3,
          "cartons": [{"id": "k9", "t": "carton", "reste": ["pot_peinture", "fanions", "vase"], "ouvert": 0}, {"id": "k10", "t": "carton", "reste": ["pot_peinture"], "ouvert": 1}],
          "reserve": [{"id": "r1", "t": "pot_peinture", "st": 2}, {"id": "r2", "t": "vase", "st": 1}],
          "objets": [{"id": "fx", "t": "fioles_ingr", "x": 640, "y": 300, "f": 0, "v": 0, "sur": None, "cases": [{"e": [], "i": {}} for _ in range(4)]},
                     {"id": "ch", "t": "chaudron", "x": 650, "y": 640, "sur": None}, {"id": "lu", "t": "lutrin", "x": 400, "y": 766, "sur": None}, {"id": "pa", "t": "paillasse", "x": 240, "y": 700, "sur": None},
                     {"id": "o5", "t": "pot_peinture", "x": 500, "y": 800, "st": 4, "sur": None}, {"id": "o6", "t": "table", "x": 900, "y": 820, "sur": None},
                     {"id": "o7", "t": "pot_peinture", "x": 0, "y": 0, "sur": {"o": "o6", "k": 0, "dx": 0}}]}
    monter(pg, copy.deepcopy(E4)); att(pg, 500)
    e = pg.evaluate("banc.etat")
    ty = [o['t'] for o in e['objets']]
    B.v('pot_peinture' not in ty and all(x['t'] != 'pot_peinture' for x in e['reserve']) and all('pot_peinture' not in k['reste'] for k in e['cartons']) and 'armoire' not in e['deco'],
        f"sauvegarde de l'étape 1 : plus de pot de peinture (pièce, carton 📦, cartons), plus d'armoire ({[k['reste'] for k in e['cartons']]})")
    B.v(next(o for o in e['objets'] if o['id'] == 'ch')['x'] == 650 and next(o for o in e['objets'] if o['id'] == 'o6')['x'] == 900 and e['deco']['fond'] == 2, "… et le reste ne bouge pas (le chaudron devant la porte, la table, les murs)")

if __name__ == '__main__':
    lancer(scenario, TAILLES_ICI, 'essai2', 'g')
