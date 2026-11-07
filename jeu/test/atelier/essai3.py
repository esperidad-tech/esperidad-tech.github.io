"""La chambre et le vrai matériel d'alchimiste (étape 2), aux 5 tailles, avec les règles de l'étape 1
(une seule perspective, placement libre, toucher = autre style, carton 📦 fixe) :
- une arche dans le mur de droite de l'atelier ; le bouton fixe 🛏️ en bas à gauche (avec le nombre de cartons qui attendent) ;
  toucher l'un ou l'autre : la chambre (même perspective, ses murs et son plancher à elle) ; l'arche de la chambre et le bouton ⚗️ ramènent ;
- les deux cartons de la chambre y sont posés : ses meubles s'y installent (les rideaux devant sa fenêtre) ;
- toucher un meuble de la chambre = le style suivant ; ses murs et son plancher changent sans toucher à ceux de l'atelier ;
- un meuble glissé sur le bouton de l'autre pièce y passe (on le suit), et revient ; il reste là où on le lâche ; contre un mur : de profil ;
- le carton 📦 marche aussi dans la chambre ; un objet ressorti du 📦 arrive dans la pièce où l'on est ;
- les cadeaux : le matériel d'alchimiste dans l'atelier (au mur : pas sur la fenêtre, la porte, la cheminée), la chambre, la décoration ;
- chaque nouvel objet : au moins 5 styles et les 8 couleurs, dessiné dans toutes ses formes sans erreur, ≥ 48 px au doigt ;
- une sauvegarde de l'étape 1 : rien ne bouge dans l'atelier, rien n'est perdu ; la chambre arrive avec ses cartons, et le premier carton
  de matériel ; l'état reste du JSON ; pas de requestAnimationFrame au repos.
Usage : python3 essai3.py [390x844 ...]"""
import sys, os, json, time, copy
from outils_at import *

TAILLES_ICI = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:] if not a.startswith('--')] or TAILLES
CHAMBRE = ['lit', 'tapis_grand', 'rideaux', 'chevet', 'lampe_chevet', 'armoire_ch', 'pouf', 'miroir', 'arbre_chat']
LABO = ['alambic_labo', 'cornues', 'sablier', 'etagere_fioles']
NOUVEAUX = ['lit', 'tapis_grand', 'rideaux', 'pouf', 'chevet', 'lampe_chevet', 'armoire_ch', 'bibliotheque', 'miroir', 'mobile', 'arbre_chat', 'coffre',
            'alambic_labo', 'cornues', 'mortier_pilon', 'balance', 'sablier', 'astrolabe', 'boule_cristal', 'etagere_fioles', 'ratelier', 'carte_ciel']
RAF = r"""(() => { if(window.__raf !== undefined) return; window.__raf = 0; const r = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = f => { window.__raf++; return r(f); }; })()"""

def un(pg, t): return pg.evaluate(f"(banc.etat.objets.find(o => o.t === '{t}') || {{}}).id")
def st(pg, oid): return pg.evaluate(f"T.objet('{oid}').st || 0")
def salle(pg): return pg.evaluate("banc.vue._salle()")
def inter(a, b):
    w, h = min(a[2], b[2]) - max(a[0], b[0]), min(a[3], b[3]) - max(a[1], b[1])
    return w * h if w > 0 and h > 0 else 0
def cadre(pg, oid):
    c = pg.evaluate(f"banc.vue._pos('{oid}').cadre")
    return [c['x'] - c['w'] / 2, c['y'] - c['h'], c['x'] + c['w'] / 2, c['y']] if c else None

def vers_bouton(pg, oid, B, nom):
    """Appuyer, garder le doigt sur l'objet, le glisser sur le bouton de l'autre pièce (en bas à gauche), lâcher."""
    s0 = salle(pg)
    p = prise_sure(pg, f'[data-obj="{oid}"]')
    b = pg.evaluate("T.rect('.at-salle')")
    pg.mouse.move(p['x'], p['y']); pg.mouse.down(); att(pg, 380)
    pg.mouse.move(b['x'], b['y'], steps=18); att(pg, 300)
    survol = pg.evaluate("document.querySelector('.at-salle').classList.contains('at-survol')")
    pg.mouse.up(); att(pg, 900)
    o = obj(pg, oid)
    ok = survol and salle(pg) == 1 - s0 and (o.get('pc') == 1) == (s0 == 0) and pg.evaluate(f"!!document.querySelector('[data-obj=\"{oid}\"]')")
    B.v(ok, f"{nom} glissé sur le bouton {'🛏️' if s0 == 0 else '⚗️'} : il passe dans {'la chambre' if s0 == 0 else 'l’atelier'}, on le suit" +
        ('' if ok else f" (survol {survol}, salle {salle(pg)}, objet {o}, prise {p})"))

def scenario(pg, t, B):
    W, H = t
    pg.evaluate(RAF)
    pg.evaluate("banc.connue = true; banc.potions = {}; banc.etat = Atelier.etatNeuf(); banc.creer()"); att(pg, 600)
    # --- l'atelier : l'arche, le bouton 🛏️ avec ses deux cartons ---
    bt = pg.evaluate("(() => { const b = document.querySelector('.at-salle'), r = b.getBoundingClientRect(), p = document.querySelector('.at-piece').getBoundingClientRect(), d = b.querySelector('.at-badge'); return {dansMonde:!!b.closest('.at-monde'), g:r.left - p.left, b:p.bottom - r.bottom, w:r.width, h:r.height, ic:b.textContent, badge:d && d.style.display !== 'none' ? d.textContent : ''}; })()")
    B.v(not bt['dansMonde'] and bt['g'] < 20 and bt['b'] < 20 and min(bt['w'], bt['h']) >= 48 and '🛏' in bt['ic'] and bt['badge'] == '2',
        f"le bouton fixe 🛏️ en bas à gauche ({round(bt['w'])} px), il montre les 2 cartons qui attendent dans la chambre")
    B.v(pg.evaluate("!!document.querySelector('.at-arche[data-at=salle]')"), "une arche dans le mur de droite de l'atelier")
    ouvrir_cartons_vite(pg)
    B.v(pg.evaluate("banc.etat.cartons.length") == 2 and pg.evaluate("banc.etat.cartons.every(k => k.ch === 1)"), "les cartons de l'atelier ouverts ; ceux de la chambre attendent dans la chambre")
    # toucher l'arche : la chambre
    pg.evaluate("banc.vue._voir(1300, 500)"); att(pg, 250)
    taper(pg, '.at-arche', 900)
    B.v(salle(pg) == 1, "toucher l'arche : la chambre")
    B.v('chambre' in pg.evaluate("T.toast()").lower(), f"la première fois : un petit mot (« {pg.evaluate('T.toast()').strip()[:50]}… »)")
    B.v(pg.evaluate("!!document.querySelector('[data-surf=fond2]') && !!document.querySelector('[data-surf=sol2]') && !document.querySelector('[data-surf=fond]')"), "la chambre a ses murs et son plancher à elle")
    B.v(pg.evaluate("document.querySelectorAll('.at-carton').length") == 2 and '⚗' in pg.evaluate("document.querySelector('.at-salle').textContent"), "ses deux cartons sont là ; le bouton devient ⚗️")
    cap(pg, 'chambre-cartons', t, 'c')
    ouvrir_cartons_vite(pg); att(pg, 500)
    ty = pg.evaluate("banc.etat.objets.filter(o => o.pc === 1).map(o => o.t)")
    B.v(sorted(ty) == sorted(CHAMBRE) and pg.evaluate("banc.etat.cartons.length") == 0, f"les meubles de la chambre s'y installent ({len(ty)})")
    B.v(pg.evaluate("banc.etat.objets.filter(o => o.pc === 1).map(o => o.id).every(id => !!document.querySelector('[data-obj=\"' + id + '\"]')) && banc.etat.objets.filter(o => !o.pc).every(o => !document.querySelector('[data-obj=\"' + o.id + '\"]'))"),
        "on ne voit que la chambre (les objets de l'atelier n'y sont pas)")
    rid = un(pg, 'rideaux'); r = obj(pg, rid)
    B.v(abs(r['x'] - 750) < 30 and not r.get('cote'), f"les rideaux devant la fenêtre de la chambre (x {r['x']:.0f})")
    # plus rien ne se recouvre beaucoup (sur le plancher, au mur)
    pg.evaluate("banc.vue._voir(600, 560)"); att(pg, 300)
    cap(pg, 'chambre', t, 'c')
    # --- toucher = le style suivant ; les murs de la chambre changent sans toucher à l'atelier ---
    for typ in ('lit', 'pouf', 'chevet', 'lampe_chevet', 'miroir', 'arbre_chat', 'tapis_grand', 'armoire_ch'):
        oid = un(pg, typ)
        s0 = st(pg, oid)
        taper(pg, f'[data-obj="{oid}"]', 420)
        B.v(st(pg, oid) == s0 + 1, f"toucher {typ} : style {s0} → {st(pg, oid)}")
    for cle, vue in (('fond2', (640, 200)), ('murG2', (-40, 300)), ('murD2', (1240, 300)), ('sol2', (600, 820))):
        pg.evaluate(f"banc.vue._voir({vue[0]}, {vue[1]})"); att(pg, 200)
        p = point_surface(pg, cle)
        if not p: B.v(False, f"pas de point libre sur {cle}"); continue
        avant = pg.evaluate("JSON.stringify(banc.etat.deco)")
        toucher_net(pg, p); att(pg, 350)
        d0, d1 = json.loads(avant), pg.evaluate("banc.etat.deco")
        B.v(d1[cle] == d0[cle] + 1 and all(d0[k] == d1[k] for k in d0 if k != cle), f"toucher {cle} : un autre motif ({d0[cle]} → {d1[cle]}), l'atelier ne change pas")
    pg.evaluate("banc.vue._voir(600, 560)"); att(pg, 300)
    cap(pg, 'chambre-styles', t, 'c')
    # --- contre un mur de la chambre : de profil ; loin du mur : de face ; il reste là où on le lâche ---
    arm = un(pg, 'armoire_ch')
    pg.evaluate("banc.vue._voir(600, 600)"); att(pg, 250)
    p = prise_sure(pg, f'[data-obj="{arm}"]'); pc = pg.evaluate("T.rect('.at-piece')")
    a0 = pg.evaluate(f"banc.vue._pos('{arm}')"); vb = pg.evaluate("banc.vue._vb()")
    # (le milieu du plancher : x 560, y 720 ; le doigt bouge d'autant, sans sortir de l'écran)
    q = {'x': p['x'] + (560 - a0['x']) * vb['k'], 'y': p['y'] + (720 - a0['y']) * vb['k']}
    q['x'] = max(pc['l'] + 30, min(pc['l'] + pc['w'] - 30, q['x'])); q['y'] = max(pc['t'] + 30, min(pc['t'] + pc['h'] - 30, q['y']))
    tenir_glisser(pg, p, q, pas=18)
    a1 = pg.evaluate(f"banc.vue._pos('{arm}')"); vb2 = pg.evaluate("banc.vue._vb()")
    ax = a0['x'] + (q['x'] - p['x'] + vb2['pan']['x'] - vb['pan']['x']) / vb['k']; ay = a0['y'] + (q['y'] - p['y'] + vb2['pan']['y'] - vb['pan']['y']) / vb['k']
    if not a0.get('cote'):
        B.v(abs(a1['x'] - ax) < 4 and abs(a1['y'] - ay) < 4 and not obj(pg, arm).get('cote'), f"l'armoire lâchée au milieu : elle reste exactement là ({ax:.0f},{ay:.0f} → {a1['x']:.0f},{a1['y']:.0f})")
    else:
        B.v(not obj(pg, arm).get('cote'), "l'armoire éloignée du mur : de face")
    # contre le mur de gauche de la chambre
    # le pied du mur de gauche, assez en avant (au-delà de l'arche) ; sur un petit écran, en deux ou trois glissés (comme un enfant)
    # (l'ancre de l'armoire, le milieu du bas de sa face, va au pied du mur : on décale le doigt d'autant)
    cm = {'x': 600 + (70 - 600) * 1.35 + 60, 'y': -300 + 820 * 1.35}
    for essai in range(4):
        if obj(pg, arm).get('cote') == 'g': break
        pg.evaluate("banc.vue._voir(100, 600)"); att(pg, 250)
        p = prise_sure(pg, f'[data-obj="{arm}"]'); vb = pg.evaluate("banc.vue._vb()"); pc = pg.evaluate("T.rect('.at-piece')")
        a0 = pg.evaluate(f"banc.vue._pos('{arm}')")
        cible = {'x': p['x'] + (cm['x'] - a0['x']) * vb['k'], 'y': p['y'] + (cm['y'] - a0['y']) * vb['k']}
        cible['x'] = max(pc['l'] + 30, min(pc['l'] + pc['w'] - 30, cible['x'])); cible['y'] = max(pc['t'] + 30, min(pc['t'] + pc['h'] - 30, cible['y']))
        tenir_glisser(pg, p, cible, pas=20)
        if salle(pg) != 1:     # (lâchée sur l'arche : elle est passée dans l'atelier ; on la ramène et on recommence)
            pg.evaluate(f"(() => {{ const o = banc.etat.objets.find(o => o.id === '{arm}'); o.pc = 1; o.x = 300; o.y = 760; o.cote = 0; delete o.pz; banc.vue._allerSalle(1); banc.majVue(); }})()"); att(pg, 700)
    B.v(obj(pg, arm).get('cote') == 'g' and pg.evaluate(f"document.querySelector('[data-obj=\"{arm}\"]').classList.contains('at-profil')"), "contre le mur de gauche de la chambre : l'armoire se met de profil")
    cap(pg, 'chambre-profil', t, 'c')
    # --- passer d'une pièce à l'autre en glissant sur le bouton ---
    pf = un(pg, 'pouf')
    vers_bouton(pg, pf, B, 'le pouf')
    if salle(pg) == 0:
        cap(pg, 'pouf-atelier', t, 'c')
        vers_bouton(pg, pf, B, 'le pouf')
    # le chat aussi
    taper(pg, '.at-salle', 700)
    B.v(salle(pg) == 0, "toucher le bouton ⚗️ : retour à l'atelier")
    ch = un(pg, 'chat')
    # (le chat bien en vue, pas caché derrière un meuble, puis endormi)
    for i in range(10):
        pg.evaluate(f"banc.vue._reveil('{ch}')"); pg.evaluate(f"banc.vue._dehors('{ch}')"); att(pg, 120)
        pg.evaluate(f"T.voirEl('[data-obj=\"{ch}\"]')"); att(pg, 200)
        if pg.evaluate(f"T.prise('[data-obj=\"{ch}\"] svg')"): break
    endormir_chat(pg, ch)
    vers_bouton(pg, ch, B, 'le chat')
    # --- le carton 📦 dans la chambre : ranger, ressortir (ici) ---
    if salle(pg) != 1: pg.evaluate("banc.vue._allerSalle(1)"); att(pg, 600)
    mir = un(pg, 'miroir')
    pv = prise_sure(pg, f'[data-obj="{mir}"]'); pr = pg.evaluate("T.rect('.at-coin')")
    tenir_glisser(pg, pv, pr, pas=18)
    B.v(pg.evaluate(f"banc.etat.reserve.some(x => x.id === '{mir}')"), "le miroir glissé sur le 📦 depuis la chambre : rangé")
    att(pg, 600); taper(pg, '.at-coin', 450)
    taper_ui(pg, '.at-res-o', 700)
    B.v(obj(pg, mir) and obj(pg, mir).get('pc') == 1 and salle(pg) == 1, "ressorti du 📦 dans la chambre : il arrive dans la chambre")
    # --- les cadeaux : le matériel d'alchimiste dans l'atelier, puis de la décoration, puis la chambre… ---
    pg.evaluate("banc.vue._allerSalle(0)"); att(pg, 500)
    pg.evaluate("Atelier.donnerCartons(banc.etat, 1); banc.majVue()"); att(pg, 900)
    k = pg.evaluate("banc.etat.cartons.slice(-1)[0]")
    B.v(k['reste'] == LABO and not k.get('ch'), f"le premier cadeau : le matériel d'alchimiste, dans l'atelier ({k['reste']})")
    ouvrir_cartons_vite(pg); att(pg, 500)
    labo = [o for o in pg.evaluate("banc.etat.objets") if o['t'] in LABO]
    B.v(len(labo) == 4 and all(not o.get('pc') for o in labo), "il s'installe dans l'atelier")
    ef = un(pg, 'etagere_fioles'); b = cadre(pg, ef)
    zones = {'fenêtre': [362, 56, 538, 320], 'cheminée': [786, 20, 1114, 524], 'porte': [570, 300, 730, 524]}
    mauv = [z for z, r in zones.items() if b and inter(b, r) > (b[2] - b[0]) * (b[3] - b[1]) * 0.25]
    B.v(b and not mauv, f"l'étagère à fioles au mur : ni sur la fenêtre, ni sur la cheminée, ni sur la porte {mauv}")
    pg.evaluate("banc.vue._voir(600, 560)"); att(pg, 300)
    cap(pg, 'labo', t, 'c')
    pg.evaluate("Atelier.donnerCartons(banc.etat, 2); banc.majVue()"); att(pg, 400)
    ks = pg.evaluate("banc.etat.cartons.map(k => [k.reste, k.ch || 0])")
    B.v(len(ks) == 2 and ks[0][1] == 0 and 'fanions' in ks[0][0] and ks[1][0] == ['boule_cristal', 'astrolabe', 'herbes'], f"les cadeaux alternent : décoration, matériel… {ks}")
    # --- chaque nouvel objet : ≥ 5 styles, les 8 couleurs, dessiné dans toutes ses formes, assez grand pour un doigt ---
    info = pg.evaluate("(l => l.map(t => { const c = Atelier.OBJETS[t]; return c ? {t, n:(c.nf || 1) * 8, nf:c.nf || 1, z:c.z} : {t, n:0}; }))(" + json.dumps(NOUVEAUX) + ")")
    B.v(all(x['n'] >= 5 for x in info), f"{len(info)} nouveaux objets : chacun au moins 5 styles et les 8 couleurs {[x['t'] for x in info if x['n'] < 5]}")
    petits = []
    for x in info:
        objs = []
        for f in range(x['nf']):
            i = len(objs)
            d = {"id": f"n{i}", "t": x['t'], "st": f + x['nf'] * f, "sur": None, "pc": 1}
            if x['z'] == 'mur': d.update({"x": 250 + (i % 4) * 230, "y": 300})
            else: d.update({"x": 250 + (i % 4) * 230, "y": 700 + (i // 4) * 80})
            objs.append(d)
        pg.evaluate("(l => { const e = banc.etat; e.objets = e.objets.filter(o => !o.pc).concat(l); e.cartons = []; banc.creer(); banc.vue._allerSalle(1); })(" + json.dumps(objs) + ")"); att(pg, 300)
        tz = pg.evaluate("[...document.querySelectorAll('.at-o[data-obj^=n]')].map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })")
        if not tz or min(tz) < 48: petits.append(f"{x['t']}:{min(tz) if tz else 0:.0f}")
    B.v(not petits, f"chaque forme de chaque nouvel objet se dessine et se touche facilement (≥ 48 px) {petits}")
    # --- une sauvegarde de l'étape 1 : rien ne bouge dans l'atelier ; la chambre et le matériel arrivent ---
    E1 = {"v": 4, "n": 30, "nc": 1, "cadeauRangements": 1, "cadeauDeco": 1, "boutique": [], "flaque": 0, "appris": {}, "panier": {"eau": 1}, "nouveaux": 0,
          "deco": {"fond": 2, "murG": 1, "murD": 0, "sol": 3}, "theme": 0, "cartons": [], "reserve": [],
          "objets": [{"id": "fx", "t": "fioles_ingr", "x": 640, "y": 300, "f": 0, "v": 0, "sur": None, "cases": [{"e": [], "i": {"miel": 2}} for _ in range(4)]},
                     {"id": "ch", "t": "chaudron", "x": 650, "y": 640, "sur": None}, {"id": "lu", "t": "lutrin", "x": 400, "y": 766, "sur": None}, {"id": "pa", "t": "paillasse", "x": 300, "y": 700, "sur": None},
                     {"id": "o6", "t": "table", "x": 900, "y": 820, "sur": None}, {"id": "o7", "t": "commode", "x": 0, "y": 0, "cote": "d", "pz": 600, "sur": None, "cases": [{"e": [], "i": {"baies": 3}}, {"e": [], "i": {}}, {"e": [], "i": {}}]}]}
    av = pg.evaluate("(e => Atelier.compter(e))(" + json.dumps(E1) + ")")
    monter(pg, copy.deepcopy(E1)); att(pg, 600)
    e = pg.evaluate("banc.etat")
    pos = {o['id']: (o['x'], o['y'], o.get('cote', 0), o.get('pz')) for o in e['objets']}
    B.v(pos['ch'][:2] == (650, 640) and pos['o6'][:2] == (900, 820) and pos['o7'][2] == 'd' and pos['o7'][3] == 600 and e['deco']['fond'] == 2,
        "sauvegarde de l'étape 1 : rien ne bouge dans l'atelier (le chaudron, la table, la commode de profil, les murs)")
    B.v(pg.evaluate("Atelier.compter(banc.etat)") == av, "… aucun ingrédient perdu")
    ks = [(k['reste'], k.get('ch', 0)) for k in e['cartons']]
    B.v(sum(1 for k in ks if k[1] == 1) == 2 and any(k[0] == LABO and not k[1] for k in ks), f"… la chambre arrive avec ses deux cartons, et le premier carton de matériel ({len(ks)} cartons)")
    B.v(e['deco']['fond2'] == 37 and pg.evaluate("JSON.stringify(Atelier.normaliser(JSON.parse(JSON.stringify(banc.etat)))) === JSON.stringify(banc.etat)"), "… l'état reste du JSON (aller-retour identique)")
    # --- au repos : pas de requestAnimationFrame ---
    pg.evaluate("banc.vue._allerSalle(1)"); att(pg, 1500)
    pg.evaluate("window.__raf = 0"); att(pg, 2000)
    B.v(pg.evaluate("window.__raf") == 0, f"au repos dans la chambre : {pg.evaluate('window.__raf')} requestAnimationFrame en 2 s")
    pg.evaluate("banc.moment = 'nuit'; banc.majVue()"); att(pg, 900)
    cap(pg, 'chambre-nuit', t, 'c')

if __name__ == '__main__':
    lancer(scenario, TAILLES_ICI, 'essai3', 'c')
