"""Mimi, le chat de l'Alchimiste (étape 4 ; DESIGN-saison1.md 12.3), aux 5 tailles :
- toucher le chat : sa barre de bonheur au-dessus de lui (la moyenne de ses besoins), 🎀 à côté (≥ 48 px) ; elle monte quand on s'occupe de lui ;
- la chatière dans la porte de l'atelier ; bien heureux (≥ 80), il sort par la chatière (elle bascule) et revient avec un ingrédient (pas un liquide),
  posé avec la cueillette ; au plus une fois par moment ; parfois un rare ; un atelier fermé pendant sa sortie : l'ingrédient arrive quand même ;
- la souris : il se tapit, remue les fesses, bondit (attrapée ou ratée) ; dix jeux, jamais deux fois le même de suite ; il suit le doigt sur le plancher ;
- la garde-robe : un accessoire par mini-jeu de l'Alchimiste réussi (la première fois seulement ; Atelier.mjGagne), annoncé à l'ouverture,
  on l'habille (cou, tête, rien) ; les rares brillent ; tout reste dans la sauvegarde ;
- pendant une potion (390x844) : il dresse les oreilles quand on verse le bon ingrédient ; la potion réussie donne un accessoire ;
- l'état reste du JSON ; une sauvegarde de l'étape 3 garde tout ; pas de requestAnimationFrame au repos.
Usage : python3 essai5.py [390x844 ...]   (AT_INDEX=index4.html : le banc de l'étape 4)"""
import sys, os, json, time, copy
from outils_at import *

TAILLES_ICI = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:] if not a.startswith('--')] or TAILLES
RAF = r"""(() => { if(window.__raf !== undefined) return; window.__raf = 0; const r = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = f => { window.__raf++; return r(f); }; })()"""
JEUX = ['bondir', 'roule', 'galipette', 'tape', 'cache', 'rond', 'etire', 'saut', 'queue', 'fesses']

def ob(pg, oid): return pg.evaluate(f"banc.etat.objets.find(o => o.id === '{oid}') || null")
def besoins(pg, oid, b): pg.evaluate(f"(b => {{ const o = banc.etat.objets.find(o => o.id === '{oid}'); Object.assign(o.b, b); banc.vue._humeur(); }})({json.dumps(b)})")
def toast(pg): return pg.evaluate("T.toast()") or ''
def attendre(pg, js, s=14):
    t0 = time.time()
    while time.time() - t0 < s:
        if pg.evaluate(js): return True
        att(pg, 150)
    return False
def en_vue(pg, oid):
    for i in range(14):
        pg.evaluate(f"banc.vue._dehors('{oid}')"); att(pg, 120)
        pg.evaluate(f"T.voirEl('[data-obj=\"{oid}\"]')"); att(pg, 250)
        ok = pg.evaluate(f"""(() => {{ const d = document.querySelector('[data-obj="{oid}"]'), p = document.querySelector('.at-piece').getBoundingClientRect();
          if(!d) return false; const r = d.getBoundingClientRect(), m = 70;
          if(r.left < p.left + m || r.right > p.right - m || r.top < p.top + 140 || r.bottom > p.bottom - 90) return false;
          return ['.at-salle', '.at-coin'].every(s => {{ const b = document.querySelector(s).getBoundingClientRect(); return r.right < b.left - 10 || r.left > b.right + 10 || r.bottom < b.top - 10 || r.top > b.bottom + 10; }}); }})()""")
        if ok and pg.evaluate(f"T.prise('[data-obj=\"{oid}\"] svg')"): return True
    return False
def barre(pg, oid):
    return pg.evaluate(f"""(() => {{ const e = document.querySelector('[data-obj="{oid}"] .at-bonheur'); if(!e || e.hidden) return null;
      const h = e.querySelector('.at-bonheur-hab').getBoundingClientRect(), b = document.querySelector('[data-obj="{oid}"] .at-bulle');
      return {{w:parseFloat(e.querySelector('b').style.width), hab:Math.min(h.width, h.height), bulle:!!b && getComputedStyle(b).display !== 'none'}}; }})()""")

TOASTS = "(() => { window.__toasts = []; new MutationObserver(() => { const t = document.querySelector('.at-toast'); if(t && !t.hidden) __toasts.push(t.textContent); }).observe(document.querySelector('.at-toast'), {childList:true, subtree:true, attributes:true}); })()"
CLASSES = "(id => { window.__cl = []; const d = document.querySelector('[data-obj=\"' + id + '\"]'); new MutationObserver(() => __cl.push(d.className)).observe(d, {attributes:true, attributeFilter:['class']}); })"
def toasts(pg): return ' | '.join(pg.evaluate("window.__toasts || []"))

def scenario(pg, t, B):
    W, H = t
    pg.evaluate(RAF)
    pg.evaluate("banc.connue = true; banc.potions = {}; banc.enquete = 1; banc.etat = Atelier.etatNeuf(); banc.creer()"); att(pg, 500)
    ouvrir_cartons_vite(pg); att(pg, 400)
    ch = pg.evaluate("banc.etat.objets.find(o => o.t === 'chat').id")
    B.v(pg.evaluate("!!document.querySelector('.at-fond-box .at-chatiere-volet')"), "la chatière, en bas de la porte de l'atelier")
    # --- la barre de bonheur ---
    besoins(pg, ch, {'faim': 40, 'soif': 50, 'amour': 30, 'jeu': 40, 'dodo': 60})
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch)
    taper(pg, f'[data-obj="{ch}"] svg', 300); calme(pg, f'[data-obj="{ch}"] .at-bonheur', 8000); att(pg, 300)
    b1 = barre(pg, ch); bo = pg.evaluate(f"banc.vue._bonheur('{ch}')")
    B.v(b1 and abs(b1['w'] - bo) <= 1 and b1['hab'] >= 48 and not b1['bulle'], f"toucher le chat : sa barre de bonheur ({b1 and b1['w']} %, la moyenne de ses besoins), 🎀 à côté ({b1 and round(b1['hab'])} px)")
    cap(pg, 'barre', t, 'm')
    besoins(pg, ch, {'faim': 100, 'soif': 100})
    pg.evaluate(f"banc.vue._reveil('{ch}')"); taper(pg, f'[data-obj="{ch}"] svg', 300)
    b2 = barre(pg, ch)
    B.v(b2 and b1 and b2['w'] > b1['w'], f"nourri, abreuvé : la barre monte ({b1 and b1['w']} → {b2 and b2['w']} %)")
    # --- la garde-robe : vide au début ---
    pg.evaluate(f"banc.vue._garde('{ch}')"); att(pg, 400)
    B.v('vide' in (pg.evaluate("document.querySelector('.at-grim').textContent") or '') and pg.evaluate("document.querySelectorAll('.at-garde-verrou').length") == 2, "🎀 : la garde-robe, encore vide (« tu gagnes un accessoire en réussissant un de tes mini-jeux »)")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # gagner : un accessoire par mini-jeu de l'Alchimiste, la première fois seulement
    pg.evaluate("Math.__r = Math.random; Math.random = () => 0.5")
    g1 = pg.evaluate("Atelier.mjGagne({atelier:banc.etat}, 'bulles')"); g1b = pg.evaluate("Atelier.mjGagne({atelier:banc.etat}, 'bulles')")
    g2 = pg.evaluate("Atelier.mjGagne({atelier:banc.etat}, 'melange')")
    pg.evaluate("Math.random = () => 0.01"); g3 = pg.evaluate("Atelier.mjGagne({atelier:banc.etat}, 'rythme')")
    pg.evaluate("Math.random = Math.__r")
    B.v(g1 and g1b is None and g2 and g2['id'] != g1['id'] and g3 and g3['rare'], f"un accessoire par mini-jeu réussi, la première fois seulement ; parfois un rare ({g1 and g1['nom']}, {g2 and g2['nom']}, {g3 and g3['nom']})")
    pg.evaluate("banc.creer()"); pg.evaluate(TOASTS)
    vu = attendre(pg, "(window.__toasts || []).some(t => t.toLowerCase().includes('cadeau'))", 8)
    B.v(vu and '🔊' in toasts(pg), f"à l'ouverture de l'atelier : « {toasts(pg)[:70]}… » (avec 🔊)")
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch)
    taper(pg, f'[data-obj="{ch}"] svg', 300)
    pg.evaluate("document.querySelector('.at-toast').hidden = true")
    calme(pg, f'[data-obj="{ch}"] .at-bonheur', 8000)
    r = pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] .at-bonheur-hab')")
    if r: toucher_net(pg, r); att(pg, 300)
    attendre(pg, "document.querySelectorAll('.at-garde-it').length > 0", 6); calme(pg, '.at-grim .at-feuille')
    its = pg.evaluate("[...document.querySelectorAll('.at-garde-it[data-acc]')].map(b => b.dataset.acc)")
    B.v(r and 'at-cal-garde' in pg.evaluate("document.querySelector('.at-grim').className") and sorted([i for i in its if i]) == sorted([g1['id'], g2['id'], g3['id']]) and its.count('') == 2,
        f"toucher 🎀 : la garde-robe, ses trois accessoires et « Rien » ({its})")
    B.v(pg.evaluate("document.querySelectorAll('.at-garde-neuf').length") == 3 and pg.evaluate("banc.etat.garde.neuf.length") == 0, "… marqués ✨ nouveaux (vus maintenant)")
    calme(pg, '.at-grim .at-feuille'); att(pg, 200)
    tailles(pg, B, '.at-grim', 'garde-robe', ic=False)
    cap(pg, 'garde', t, 'm')
    for g in (g1, g2, g3):
        pg.evaluate(f"document.querySelector('.at-garde-it[data-acc=\"{g['id']}\"]').click()"); att(pg, 250)
    acc = ob(pg, ch).get('acc') or {}
    slots = {pg.evaluate(f"Atelier.ACCESSOIRES['{g['id']}'].slot") for g in (g1, g2, g3)}
    B.v(set(acc.keys()) == slots and all(acc[s] in (g1['id'], g2['id'], g3['id']) for s in acc), f"on l'habille : {acc}")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    B.v(all(pg.evaluate(f"!!document.querySelector('[data-obj=\"{ch}\"] .at-acc-{s}')") for s in acc), "il les porte (dessinés sur lui)")
    B.v(pg.evaluate(f"!!document.querySelector('[data-obj=\"{ch}\"] .at-acc-brille')") == (g3['id'] in acc.values()), "le rare brille")
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch)
    cap(pg, 'habille', t, 'm')
    # « Rien »
    pg.evaluate(f"banc.vue._garde('{ch}')"); att(pg, 300)
    s0 = list(acc.keys())[0]
    pg.evaluate(f"document.querySelector('.at-garde-it[data-acc=\"\"][data-slot=\"{s0}\"]').click()"); att(pg, 250)
    B.v(s0 not in (ob(pg, ch).get('acc') or {}), f"« Rien » : il enlève ce qu'il a {'au cou' if s0 == 'cou' else 'sur la tête'}")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- il sort par la chatière, il revient avec un ingrédient ---
    besoins(pg, ch, {'faim': 95, 'soif': 95, 'amour': 95, 'jeu': 95, 'dodo': 95})
    pg.evaluate(f"banc.vue._reveil('{ch}')"); att(pg, 100)
    B.v(pg.evaluate(f"banc.vue._peutSortir('{ch}')"), f"bien heureux ({pg.evaluate(f'banc.vue._bonheur(\"{ch}\")')} %) : il peut aller chercher un ingrédient")
    pan0 = pg.evaluate("JSON.stringify(banc.etat.panier)")
    pg.evaluate("window.__bat = 0; new MutationObserver(() => { if(document.querySelector('.at').classList.contains('at-chatiere-bat')) __bat++; }).observe(document.querySelector('.at'), {attributes:true, attributeFilter:['class']})")
    pg.evaluate("document.querySelector('.at-toast').hidden = true"); pg.evaluate(TOASTS)
    B.v(pg.evaluate(f"banc.vue._sortie('{ch}')"), "il y va")
    if attendre(pg, "__bat >= 1", 16):
        pg.evaluate("banc.vue._voir(650, 520)"); cap(pg, 'sortie', t, 'm')
    dehors = attendre(pg, f"document.querySelector('[data-obj=\"{ch}\"]').classList.contains('at-c-dehors')", 16)
    B.v(dehors and 'chatière' in toasts(pg) and pg.evaluate("__bat") >= 1, f"il sort par la chatière (elle bascule) : « {toasts(pg)[:70]}… »")
    rentre = attendre(pg, "Object.values(banc.etat.panier).reduce((a, b) => a + b, 0) > 0", 30)
    pan = pg.evaluate("banc.etat.panier"); ing = list(pan.keys())
    attendre(pg, "(window.__toasts || []).some(t => t.includes('rapporté'))", 14)
    B.v(rentre and len(ing) == 1 and pan[ing[0]] == 1 and not pg.evaluate(f"Atelier.LIQUIDES['{ing[0]}']") and 'rapporté' in toasts(pg) and pg.evaluate("__bat") >= 2,
        f"il revient (la chatière rebascule) avec un ingrédient, posé avec la cueillette : {pan}")
    pg.evaluate(f"T.voirEl('[data-obj=\"{ch}\"]')"); att(pg, 400); cap(pg, 'retour', t, 'm')
    B.v(not pg.evaluate(f"banc.vue._peutSortir('{ch}')") and pg.evaluate("banc.etat.tama.sortie") == pg.evaluate("banc.etat.tama.moment"), "au plus une fois par moment")
    pg.evaluate("banc.moment = 'soir'; banc.majVue()"); att(pg, 300)
    besoins(pg, ch, {'faim': 95, 'soif': 95, 'amour': 95, 'jeu': 95, 'dodo': 95}); pg.evaluate(f"banc.vue._reveil('{ch}')"); att(pg, 100)
    B.v(pg.evaluate(f"banc.vue._peutSortir('{ch}')"), "au moment suivant, il peut ressortir")
    # un rare ; l'atelier fermé pendant qu'il est dehors : l'ingrédient arrive quand même
    pg.evaluate("Math.__r = Math.random; Math.random = () => 0.05")
    pg.evaluate(f"banc.vue._sortie('{ch}')")
    pg.evaluate("Math.random = Math.__r")
    bu = pg.evaluate("banc.etat.tama.butin")
    n0 = pg.evaluate("Object.values(banc.etat.panier).reduce((a, b) => a + b, 0)")
    pg.evaluate("banc.vue.arreter()"); att(pg, 300); pg.evaluate("banc.creer()"); pg.evaluate(TOASTS)
    attendre(pg, f"Object.values(banc.etat.panier).reduce((a, b) => a + b, 0) > {n0}", 8); att(pg, 300)
    n1 = pg.evaluate("Object.values(banc.etat.panier).reduce((a, b) => a + b, 0)")
    B.v(bu and bu['ingr'] in ('ortie', 'racine', 'lune') and n1 == n0 + 1 and pg.evaluate(f"banc.etat.panier['{bu['ingr']}']") >= 1 and not pg.evaluate("banc.etat.tama.butin") and 'rare' in (toasts(pg) + toast(pg)),
        f"parfois un rare ({bu and bu['ingr']}) ; l'atelier fermé pendant sa sortie : il arrive quand même ({n0} → {n1})")
    pg.evaluate("banc.moment = 'matin'; banc.majVue()"); att(pg, 300)
    besoins(pg, ch, {'faim': 80, 'soif': 80, 'amour': 80, 'jeu': 80, 'dodo': 80})      # (plus bien assez heureux pour ressortir tout seul pendant la suite)
    # --- la souris ---
    besoins(pg, ch, {'faim': 80, 'soif': 80, 'amour': 80, 'jeu': 40, 'dodo': 80})
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch)
    j0 = ob(pg, ch)['b']['jeu']
    pg.evaluate("window.__flotte = []; new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => { if(n.classList && n.classList.contains('at-flotte')) __flotte.push(n.textContent); }))).observe(document.querySelector('.at-calque'), {childList:true})")
    pg.evaluate(CLASSES, ch)
    B.v(pg.evaluate("banc.vue._souris()") and pg.evaluate("!!document.querySelector('.at-souris')"), "une petite souris traverse")
    tapi = attendre(pg, "__cl.some(c => c.includes('at-c-tapi'))", 6)
    fesses = attendre(pg, "__cl.some(c => c.includes('at-c-fesses'))", 6)
    cap(pg, 'souris', t, 'm')
    fin = attendre(pg, "!document.querySelector('.at-souris') && __flotte.length > 0", 10)
    B.v(tapi and fesses, "le chat se tapit, remue les fesses…")
    B.v(fin and ob(pg, ch)['b']['jeu'] > j0 and any(x in ' '.join(pg.evaluate('__flotte')) for x in ('Attrapée', 'Ratée')), f"… et bondit : {pg.evaluate('__flotte')} (jeu {j0} → {ob(pg, ch)['b']['jeu']})")
    # --- dix jeux, jamais deux fois le même de suite ---
    noms = []
    for i in range(14):
        if i == 4: pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch)
        pg.evaluate(f"banc.vue._reveil('{ch}')"); noms.append(pg.evaluate(f"banc.vue._jouer('{ch}')")); att(pg, 450)
        if i == 4: cap(pg, 'jeu', t, 'm')
    B.v(all(n in JEUX for n in noms) and all(a != b for a, b in zip(noms, noms[1:])) and len(set(noms)) >= 5, f"ses jeux, jamais deux fois le même de suite : {noms}")
    B.v(all(pg.evaluate(f"banc.vue._jouer('{ch}', '{q}') === '{q}' || banc.vue._jouer('{ch}', '{q}') === '{q}'") for q in JEUX), "les dix jeux marchent : " + ', '.join(JEUX))
    att(pg, 2500)
    # --- il suit le doigt qui glisse sur le plancher ---
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch); att(pg, 200)
    c0 = pg.evaluate(f"banc.vue._pos('{ch}')"); rc = pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] svg')"); pc = pg.evaluate("T.rect('.at-piece')")
    dirx = -1 if rc['x'] > pc['l'] + pc['w'] / 2 else 1
    # (un point du plancher libre, à côté de lui : le doigt glisse sur le plancher, pas sur un meuble)
    a = pg.evaluate(f"""(() => {{ const r = document.querySelector('[data-obj="{ch}"] svg').getBoundingClientRect(), p = document.querySelector('.at-piece').getBoundingClientRect();
      for(const dy of [0.9, 0.7, 1.1, 0.5]) for(const dx of [130, -130, 180, -180, 90, -90, 230, -230]){{
        const x = r.left + r.width / 2 + dx, y = r.top + r.height * dy;
        if(x < p.left + 60 || x > p.right - 60 || y < p.top + 60 || y > p.bottom - 90) continue;
        const e = document.elementFromPoint(x, y);
        if(e && !e.closest('.at-o, .at-carton, .at-tas, [data-at], button') && e.closest('[data-surf^=sol]')) return {{x, y, dx}};
      }} return null; }})()""") or {'x': rc['x'] + dirx * min(130, pc['w'] * 0.3), 'y': rc['y'] + rc['h'] * 0.5, 'dx': dirx * 130}
    dirx = 1 if a['dx'] > 0 else -1        # (le doigt part du plancher et s'éloigne du chat : il le suit)
    MONDE = "(p => { const r = document.querySelector('.at-piece').getBoundingClientRect(), v = banc.vue._vb(); return {x:v.x0 + (p.x - r.left + v.pan.x) / v.k, y:v.y0 + (p.y - r.top + v.pan.y) / v.k}; })"
    e0 = pg.evaluate(f"banc.vue._chat('{ch}')")
    pg.mouse.move(a['x'], a['y']); pg.mouse.down()
    pg.mouse.move(a['x'] + dirx * 14, a['y'] + 3)        # (le doigt glisse tout de suite : ce n'est pas « appuyer, garder »)
    dist = lambda c, q: ((c['x'] - q['x']) ** 2 + (c['y'] - q['y']) ** 2) ** 0.5
    gain = 0
    for i in range(1, 9):
        f = {'x': a['x'] + dirx * (14 + i * 6), 'y': a['y'] + 3 + i * 2}
        pg.mouse.move(f['x'], f['y'], steps=2); att(pg, 230)
        q = pg.evaluate(MONDE, f)             # (le point du plancher sous le doigt, pendant qu'il glisse ; la pièce peut glisser aussi)
        gain = max(gain, dist(c0, q) - dist(pg.evaluate(f"banc.vue._pos('{ch}')"), q))      # (pendant qu'il glisse : après, le chat retourne à ses affaires)
    pg.mouse.up(); att(pg, 300)
    B.v(gain > 30, f"il suit le doigt qui glisse sur le plancher (il s'en est rapproché de {gain:.0f})" + ('' if gain > 30 else f" {e0} {a}"))
    # --- l'état ---
    B.v(pg.evaluate("JSON.stringify(Atelier.normaliser(JSON.parse(JSON.stringify(banc.etat)))) === JSON.stringify(banc.etat)"), "l'état reste du JSON (aller-retour identique)")
    e3 = pg.evaluate("(() => { const e = JSON.parse(JSON.stringify(banc.etat)); delete e.garde; delete e.tama.butin; delete e.tama.sortie; delete e.tama.souris; e.objets.forEach(o => { delete o.acc; }); return e; })()")
    av = pg.evaluate("(e => Atelier.compter(e))(" + json.dumps(e3) + ")")
    e3['objets'][[o['t'] for o in e3['objets']].index('chat')]['acc'] = {'cou': 'licorne', 'tete': 'beret'}
    n = pg.evaluate("(e => { const x = Atelier.normaliser(e); return {g:x.garde, acc:x.objets.find(o => o.t === 'chat').acc, n:Atelier.compter(x)}; })(" + json.dumps(e3) + ")")
    B.v(n['g'] == {'a': [], 'neuf': [], 'annonce': [], 'mj': {}} and n['acc'] == {} and n['n'] == av, "une sauvegarde de l'étape 3 : la garde-robe arrive vide, rien n'est perdu (un accessoire inconnu ou pas gagné : enlevé)")
    # --- au repos : pas de requestAnimationFrame ---
    pg.evaluate("banc.creer()"); att(pg, 2500)
    pg.evaluate("window.__raf = 0"); att(pg, 2000)
    B.v(pg.evaluate("window.__raf") == 0, f"au repos : {pg.evaluate('window.__raf')} requestAnimationFrame en 2 s")
    # --- pendant une potion : les oreilles ; la potion réussie, un accessoire (une seule taille : c'est long) ---
    if t == (390, 844):
        pg.evaluate("Atelier.ajouter(banc.etat, 'eau', 1); Atelier.ajouter(banc.etat, 'champignon', 2); banc.majVue()"); att(pg, 400)
        for ingr, liq in (('eau', True), ('champignon', False)):
            oid = pg.evaluate(f"""(() => {{ const o = banc.etat.objets.find(o => {{ const c = Atelier.OBJETS[o.t]; return c && c.cases && !!c.verre === {str(liq).lower()} && o.cases.some((cs, j) => Object.values(cs.i).reduce((a, b) => a + b, 0) === 0); }}); return o && o.id; }})()""")
            pg.evaluate(f"(() => {{ const o = banc.etat.objets.find(o => o.id === '{oid}'); const cs = o.cases.find(cs => !Object.values(cs.i).reduce((a, b) => a + b, 0)); cs.i['{ingr}'] = (cs.i['{ingr}'] || 0) + banc.etat.panier['{ingr}']; delete banc.etat.panier['{ingr}']; banc.majVue(); }})()")
        att(pg, 400)
        besoins(pg, ch, {'faim': 90, 'soif': 90, 'amour': 90, 'jeu': 90, 'dodo': 90})
        taper(pg, '[data-obj=ch]', 500)
        taper_ui(pg, '.at-ch-go[data-r=lumiere]', 500)
        B.v(pg.evaluate("!!document.querySelector('.at-mj .at-mj-chat')"), "pendant la potion : le chat, dans un coin")
        pg.evaluate("window.__oreilles = 0; new MutationObserver(() => { const e = document.querySelector('.at-mj-chat'); if(e && e.classList.contains('at-oreilles')) __oreilles++; }).observe(document.querySelector('.at-mj .at-mj-chat'), {attributes:true, attributeFilter:['class']})")
        preparer_mj(pg, 'gagne')
        ore = attendre(pg, "__oreilles > 0", 90)
        cap(pg, 'oreilles', t, 'm')
        B.v(ore, "il dresse les oreilles quand on verse le bon ingrédient")
        finir_mj(pg); pg.click('.at-mj .mj-continuer'); att(pg, 1500)
        B.v(pg.evaluate("banc.potions.lumiere") == 1 and pg.evaluate("banc.etat.garde.mj.chaudron") == 1 and 'cadeau' in toast(pg).lower(), f"la potion réussie (un mini-jeu de l'Alchimiste) : un accessoire, annoncé (« {toast(pg)[:50]}… »)")

if __name__ == '__main__':
    lancer(scenario, TAILLES_ICI, 'essai5', 'm')
