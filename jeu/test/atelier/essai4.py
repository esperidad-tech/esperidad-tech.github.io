"""Le chat, un petit Tamagotchi (étape 3), aux 5 tailles :
- ses affaires (gamelle de croquettes, gamelle d'eau, distributeur, panier) arrivent dans un carton de l'atelier, posées par terre ; elles se décorent ;
- ses besoins (faim, soif, câlins, jeu, sommeil) baissent seulement pendant qu'on joue, et un peu à chaque nouveau moment ; jamais à l'appli fermée ;
- sous 40 : une bulle (🍗 💧 ❤️ 🧶 💤), ≥ 48 px ; la toucher dit quoi faire ; sous 22 : il a l'air un peu triste (sa bouche), fatigué (ses paupières) ;
- toucher la gamelle vide : des croquettes ; le distributeur remplit la gamelle ; l'eau ; il va manger et boire ; caresser (le doigt glisse) : il ronronne ;
  la pelote ; le dodo dans le panier ;
- une bêtise au plus toutes les 4 minutes de jeu (une fiole par terre, le tabouret renversé, une pelote déroulée) ; un toucher répare ; rien n'est perdu ;
- enquêtes 1 à 3 : un seul chat ; à l'enquête 4 : elle s'arrondit, un chaton naît (un autre pelage, plus petit, ses besoins à lui), puis Mimi dit au revoir
  et part vivre chez Odette (etat.chezOdette, Atelier.repliqueOdette) ; le chaton reste ;
- l'état reste du JSON (aller-retour identique) ; une sauvegarde de l'étape 2 reçoit le carton du chat ; pas de requestAnimationFrame au repos ;
  arreter() : plus rien ne bouge.
Usage : python3 essai4.py [390x844 ...]   (AT_INDEX=index3.html : le banc de l'étape 3)"""
import sys, os, json, time, copy
from outils_at import *

TAILLES_ICI = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:] if not a.startswith('--')] or TAILLES
CHAT_OBJ = ['panier', 'gamelle', 'eau', 'distributeur']
RAF = r"""(() => { if(window.__raf !== undefined) return; window.__raf = 0; const r = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = f => { window.__raf++; return r(f); }; })()"""

def un(pg, t): return pg.evaluate(f"(banc.etat.objets.find(o => o.t === '{t}') || {{}}).id")
def ob(pg, oid): return pg.evaluate(f"banc.etat.objets.find(o => o.id === '{oid}') || null")
def besoins(pg, oid, b):
    pg.evaluate(f"(b => {{ const o = banc.etat.objets.find(o => o.id === '{oid}'); Object.assign(o.b, b); banc.vue._humeur(); }})({json.dumps(b)})")
def classe(pg, oid, c): return pg.evaluate(f"!!document.querySelector('[data-obj=\"{oid}\"]') && document.querySelector('[data-obj=\"{oid}\"]').classList.contains('{c}')")
def visible(pg, sel): return pg.evaluate(f"(() => {{ const e = document.querySelector({json.dumps(sel)}); return !!e && getComputedStyle(e).display !== 'none'; }})()")
def taille_bulle(pg, oid): return pg.evaluate(f"(() => {{ const b = document.querySelector('[data-obj=\"{oid}\"] .at-bulle'); if(!b || b.hidden) return 0; const r = b.getBoundingClientRect(); return Math.min(r.width, r.height); }})()")
def toast(pg): return pg.evaluate("T.toast()") or ''
def attendre(pg, js, s=14):
    t0 = time.time()
    while time.time() - t0 < s:
        if pg.evaluate(js): return True
        att(pg, 250)
    return False
def hasard(pg, v): pg.evaluate(f"Math.random = () => {v}")
def vrai_hasard(pg): pg.evaluate("Math.random = window.__rnd || Math.random")

SANS_BARRE = "document.querySelectorAll('.at-bonheur').forEach(b => b.hidden = true); document.querySelectorAll('.at-c-bonheur').forEach(d => d.classList.remove('at-c-bonheur'))"   # (étape 4 : la barre de bonheur cache la bulle quelques secondes)
def en_vue(pg, oid):
    """Le chat sur un bout de plancher bien visible : entier à l'écran, loin des bords et des boutons du coin (le banc touche ensuite sa bulle, son dos)."""
    for i in range(14):
        pg.evaluate(f"banc.vue._dehors('{oid}')"); att(pg, 120)
        pg.evaluate(f"T.voirEl('[data-obj=\"{oid}\"]')"); att(pg, 250)
        ok = pg.evaluate(f"""(() => {{ const d = document.querySelector('[data-obj="{oid}"]'), p = document.querySelector('.at-piece').getBoundingClientRect();
          if(!d) return false; const r = d.getBoundingClientRect(), m = 70;
          if(r.left < p.left + m || r.right > p.right - m || r.top < p.top + 120 || r.bottom > p.bottom - 90) return false;
          return ['.at-salle', '.at-coin'].every(s => {{ const b = document.querySelector(s).getBoundingClientRect(); return r.right < b.left - 10 || r.left > b.right + 10 || r.bottom < b.top - 10 || r.top > b.bottom + 10; }}); }})()""")
        if ok and pg.evaluate(f"T.prise('[data-obj=\"{oid}\"] svg')"): return True
    return False

def scenario(pg, t, B):
    W, H = t
    pg.evaluate(RAF)
    pg.evaluate("window.__rnd = Math.random")
    pg.evaluate("banc.connue = true; banc.potions = {}; banc.enquete = 1; banc.etat = Atelier.etatNeuf(); banc.creer()"); att(pg, 600)
    # --- les affaires du chat : un carton dans l'atelier ---
    ks = pg.evaluate("banc.etat.cartons.map(k => [k.reste, k.ch || 0])")
    B.v(any(k[0] == CHAT_OBJ and not k[1] for k in ks), "un carton des affaires du chat dans l'atelier (panier, gamelles, distributeur)")
    ouvrir_cartons_vite(pg); att(pg, 500)
    aff = [o for o in pg.evaluate("banc.etat.objets") if o['t'] in CHAT_OBJ]
    B.v(len(aff) == 4 and all(not o.get('pc') and not o.get('sur') for o in aff), f"elles s'installent par terre, dans l'atelier ({[o['t'] for o in aff]})")
    ch = un(pg, 'chat')
    c = ob(pg, ch)
    B.v(c and all(76 <= c['b'][k] <= 80 for k in ('faim', 'soif', 'amour', 'jeu')) and c['b']['dodo'] >= 76 and pg.evaluate(f"!banc.vue._bulle('{ch}')"), f"le chat arrive content (80 partout, pas de bulle) {c and c['b']}")
    # --- les besoins baissent pendant qu'on joue ---
    pg.evaluate("banc.vue._tama(60)"); c1 = ob(pg, ch)
    B.v(c1['b']['faim'] < 80 and c1['b']['soif'] < 80 and pg.evaluate("banc.etat.tama.jeu") >= 60, f"une minute de jeu : il a un peu faim, un peu soif ({c1['b']})")
    # bulle : le besoin le plus fort
    besoins(pg, ch, {'faim': 30, 'soif': 70, 'amour': 70, 'jeu': 70, 'dodo': 70})
    pg.evaluate(f"banc.vue._agir('{ch}')") if False else None
    B.v(pg.evaluate(f"banc.vue._bulle('{ch}')") == 'faim', "faim sous 40 : une bulle 🍗 au-dessus de lui")
    # (on le réveille pour voir la bulle : elle se cache quand il dort ou qu'il marche)
    pg.evaluate(f"(() => {{ const d = document.querySelector('[data-obj=\"{ch}\"]'); }})()")
    pg.evaluate(f"banc.vue._reveil('{ch}')"); att(pg, 300); pg.evaluate(SANS_BARRE)
    attendre(pg, f"(() => {{ const d = document.querySelector('[data-obj=\"{ch}\"]'); return d && !d.classList.contains('at-c-marche') && !d.classList.contains('at-c-saute') && !d.classList.contains('at-c-dort'); }})()", 8)
    pg.evaluate(f"T.voirEl('[data-obj=\"{ch}\"]')"); att(pg, 400)
    tb = taille_bulle(pg, ch)
    B.v(tb >= 48, f"la bulle se touche facilement ({tb:.0f} px)")
    cap(pg, 'bulle-faim', t, 't')
    B.v(classe(pg, ch, 'at-c-triste') is False, "à 30, il demande, sans être triste")
    besoins(pg, ch, {'faim': 12, 'dodo': 25})
    B.v(classe(pg, ch, 'at-c-triste') and classe(pg, ch, 'at-c-fatigue') and visible(pg, f'[data-obj="{ch}"] .at-c-g-assis .at-c-moue, [data-obj="{ch}"] .at-c-g-debout .at-c-moue') is not None,
        "sous 22 : il a l'air un peu triste (sa bouche) ; peu de sommeil : ses paupières tombent")
    # toucher la bulle : ce qu'il faut faire
    if pg.evaluate(f"!!document.querySelector('[data-obj=\"{ch}\"] .at-bulle:not([hidden])')"):
        p = pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] .at-bulle')")
        toucher_net(pg, p); att(pg, 400)
        B.v('croquettes' in toast(pg).lower() and pg.evaluate("document.querySelectorAll('.at-o.at-dispo').length") >= 1, f"toucher la bulle 🍗 : « {toast(pg)[:60]}… » (le distributeur et la gamelle brillent)")
        B.v(pg.evaluate("!!document.querySelector('.at-toast-lire')"), "… avec 🔊 (rien n'est lu tout seul)")
    else: B.v(False, "la bulle n'est pas visible")
    # --- la gamelle : un toucher, des croquettes ; il va manger ---
    gm = un(pg, 'gamelle')
    taper(pg, f'[data-obj="{gm}"]', 500)
    B.v(ob(pg, gm).get('plein') == 1 and ob(pg, gm).get('st', 0) == 0, "toucher la gamelle vide : des croquettes (pas un autre style)")
    cap(pg, 'gamelle', t, 't')
    hasard(pg, 0.1)
    ok = False
    for i in range(4):
        pg.evaluate(f"banc.vue._agir('{ch}')")
        if attendre(pg, f"banc.etat.objets.find(o => o.id === '{ch}').b.faim === 100", 9): ok = True; break
    vrai_hasard(pg)
    B.v(ok and not ob(pg, gm).get('plein'), f"il va à sa gamelle et il mange : il n'a plus faim, la gamelle est vide (faim {ob(pg, ch)['b']['faim']})")
    B.v(not classe(pg, ch, 'at-c-triste') or ob(pg, ch)['b']['dodo'] < 22, "il n'est plus triste")
    # gamelle pleine : un toucher change son style (le chat parti plus loin, pour ne pas le toucher lui)
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch)
    taper(pg, f'[data-obj="{gm}"]', 400); s0 = ob(pg, gm).get('st', 0)
    taper(pg, f'[data-obj="{gm}"]', 400)
    B.v(ob(pg, gm).get('st', 0) == s0 + 1, "gamelle pleine : un toucher change son style")
    # le distributeur remplit la gamelle (vidée)
    pg.evaluate(f"(() => {{ const g = banc.etat.objets.find(o => o.id === '{gm}'); g.plein = 0; banc.majVue(); }})()"); att(pg, 300)
    di = un(pg, 'distributeur')
    taper(pg, f'[data-obj="{di}"]', 900)
    B.v(ob(pg, gm).get('plein') == 1, "toucher le distributeur : les croquettes tombent dans la gamelle")
    # l'eau
    ea = un(pg, 'eau')
    besoins(pg, ch, {'faim': 90, 'soif': 15, 'dodo': 80})
    taper(pg, f'[data-obj="{ea}"]', 500)
    B.v(ob(pg, ea).get('plein') == 1, "toucher la gamelle d'eau : de l'eau fraîche")
    hasard(pg, 0.1)
    ok = False
    for i in range(4):
        pg.evaluate(f"banc.vue._agir('{ch}')")
        if attendre(pg, f"banc.etat.objets.find(o => o.id === '{ch}').b.soif === 100", 9): ok = True; break
    vrai_hasard(pg)
    B.v(ok, "il va boire : il n'a plus soif" + ('' if ok else f" ({pg.evaluate(f'banc.vue._chat(\"{ch}\")')}, besoins {ob(pg, ch)['b']}, eau {ob(pg, ea)})"))
    # --- caresser : le doigt glisse sur lui, il ronronne, des cœurs ; la pièce ne défile pas ---
    besoins(pg, ch, {'amour': 20})
    attendre(pg, f"(() => {{ const d = document.querySelector('[data-obj=\"{ch}\"]'); return d && !d.classList.contains('at-c-marche') && !d.classList.contains('at-c-saute'); }})()", 8)
    pg.evaluate(f"banc.vue._reveil('{ch}')"); pg.evaluate("document.querySelector('.at-toast').hidden = true")
    en_vue(pg, ch)
    vb0 = pg.evaluate("banc.vue._vb().pan"); a0 = ob(pg, ch)['b']['amour']
    ron = False
    for i in range(3):
        r = pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] svg')"); q = pg.evaluate(f"T.prise('[data-obj=\"{ch}\"] svg')") or {'x': r['x'], 'y': r['y']}
        toucher_net(pg, {'x': q['x'], 'y': q['y']}, r['w'] * 0.3 * (1 if i % 2 == 0 else -1), 0, 8)      # (le doigt part de son dos)
        ron = ron or classe(pg, ch, 'at-c-ronron')
        att(pg, 150)
    a1 = ob(pg, ch)['b']['amour']; vb1 = pg.evaluate("banc.vue._vb().pan")
    B.v(a1 > a0 and ron and pg.evaluate("document.querySelectorAll('.at-coeur-vole').length") >= 1, f"caresser (le doigt glisse sur lui) : il ronronne, des cœurs ({a0} → {a1})")
    B.v(abs(vb1['x'] - vb0['x']) < 2 and abs(vb1['y'] - vb0['y']) < 2 and ob(pg, ch).get('pc') != 1, "… la pièce ne défile pas, il ne bouge pas de place")
    cap(pg, 'caresse', t, 't')
    # --- la pelote (bulle 🧶) ---
    besoins(pg, ch, {'amour': 90, 'jeu': 10})
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch); besoins(pg, ch, {}); pg.evaluate(SANS_BARRE)
    attendre(pg, f"(() => {{ const d = document.querySelector('[data-obj=\"{ch}\"]'); return d && !d.classList.contains('at-c-marche') && !d.classList.contains('at-c-saute') && !d.classList.contains('at-c-dort') && !d.classList.contains('at-c-mange'); }})()", 10)
    if pg.evaluate(f"!!document.querySelector('[data-obj=\"{ch}\"] .at-bulle:not([hidden])')") and visible(pg, f'[data-obj="{ch}"] .at-bulle'):
        pg.evaluate("document.querySelector('.at-toast').hidden = true"); att(pg, 100)
        bu = pg.evaluate(f"banc.vue._bulle('{ch}')"); eb = pg.evaluate(f"banc.vue._chat('{ch}')")
        toucher_net(pg, pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] .at-bulle')")); att(pg, 200)
        pe = pg.evaluate("!!document.querySelector('.at-pelote')")
        B.v(pe, "toucher la bulle 🧶 : une pelote roule" + ('' if pe else f" (bulle {bu}, {eb}, besoins {ob(pg, ch)['b']}, « {toast(pg)[:60]} »)"))
        B.v(attendre(pg, f"banc.etat.objets.find(o => o.id === '{ch}').b.jeu === 100", 8), "il court après : il a bien joué")
        att(pg, 1500)      # (il finit de jouer : il s'assoit, puis il décidera tout seul de ce qu'il fait)
    else:
        pg.evaluate(f"(() => {{ const o = banc.etat.objets.find(o => o.id === '{ch}'); }})()")
        B.v(False, f"bulle 🧶 pas visible ({pg.evaluate(f'banc.vue._bulle(\"{ch}\")')}, {pg.evaluate(f'document.querySelector(\"[data-obj={ch}]\").className')})")
    # --- le dodo dans le panier (bulle 💤) ---
    besoins(pg, ch, {'jeu': 90, 'dodo': 10})
    pg.evaluate(f"banc.vue._reveil('{ch}')"); en_vue(pg, ch); besoins(pg, ch, {}); pg.evaluate(SANS_BARRE)
    attendre(pg, f"(() => {{ const d = document.querySelector('[data-obj=\"{ch}\"]'); return d && !d.classList.contains('at-c-marche') && !d.classList.contains('at-c-saute') && !d.classList.contains('at-c-dort'); }})()", 10)
    pn = un(pg, 'panier')
    if pg.evaluate(f"!!document.querySelector('[data-obj=\"{ch}\"] .at-bulle:not([hidden])')") and visible(pg, f'[data-obj="{ch}"] .at-bulle'):
        pg.evaluate("document.querySelector('.at-toast').hidden = true"); att(pg, 100)
        toucher_net(pg, pg.evaluate(f"T.rect('[data-obj=\"{ch}\"] .at-bulle')")); att(pg, 300)
        ok = attendre(pg, f"(() => {{ const c = banc.vue._chat('{ch}'); return c && c.dort && c.pos && c.pos.sur && c.pos.sur.o === '{pn}'; }})()", 22)
        B.v(ok, "toucher la bulle 💤 : il va dormir dans son panier")
        pg.evaluate(f"T.voirEl('[data-obj=\"{pn}\"]')"); att(pg, 400)
        cap(pg, 'panier', t, 't')
        d0 = ob(pg, ch)['b']['dodo']; pg.evaluate("banc.vue._tama(60)")
        B.v(ob(pg, ch)['b']['dodo'] > d0, f"en dormant, il reprend des forces ({d0} → {ob(pg, ch)['b']['dodo']})")
    else: B.v(False, "bulle 💤 pas visible")
    # --- jamais quand l'appli est fermée : l'état ne garde aucune heure ; remonter ne change rien ---
    e0 = pg.evaluate("JSON.stringify(banc.etat.objets.filter(o => o.t === 'chat').map(o => o.b))")
    pg.evaluate("banc.vue.arreter()"); att(pg, 16500)
    e1 = pg.evaluate("JSON.stringify(banc.etat.objets.filter(o => o.t === 'chat').map(o => o.b))")
    B.v(e0 == e1, "l'atelier fermé (arreter) : ses besoins ne bougent plus (16 s)")
    pg.evaluate("banc.creer()"); att(pg, 500)
    e2 = pg.evaluate("JSON.stringify(banc.etat.objets.filter(o => o.t === 'chat').map(o => o.b))")
    B.v(e1 == e2 and 'Date' not in json.dumps(pg.evaluate("banc.etat.tama")), "rouvert : il retrouve ses besoins tels quels (aucune heure dans l'état)")
    # --- un nouveau moment : chaque besoin baisse un peu ---
    b0 = ob(pg, ch)['b']
    pg.evaluate("banc.moment = 'soir'; banc.majVue()"); att(pg, 400)
    b1 = ob(pg, ch)['b']
    B.v(all(b1[k] <= b0[k] for k in b0) and sum(b0.values()) - sum(b1.values()) >= 60, f"un nouveau moment (le soir) : ses besoins baissent un peu ({b0} → {b1})")
    pg.evaluate("banc.moment = 'matin'; banc.majVue()"); att(pg, 300)
    besoins(pg, ch, {'faim': 90, 'soif': 90, 'amour': 90, 'jeu': 90, 'dodo': 90})
    # --- les bêtises ---
    n0 = pg.evaluate("banc.etat.objets.length"); stock0 = pg.evaluate("JSON.stringify(Atelier.compter(banc.etat))")
    for quoi, h in (('fiole', 0.05), ('tabouret', 0.5), ('pelote', 0.97)):
        pg.evaluate(f"banc.vue._reveil('{ch}')"); att(pg, 100)
        hasard(pg, h)
        r = pg.evaluate("banc.vue._betise()")
        vrai_hasard(pg)
        if quoi == 'tabouret': ok = attendre(pg, "banc.etat.objets.some(o => o.t === 'tabouret' && o.renverse)", 14)
        else: ok = attendre(pg, f"banc.etat.betises.some(b => b.t === '{quoi}') && !!document.querySelector('.at-betise')", 14)
        att(pg, 300)
        B.v(r and ok and 'touche' in toast(pg).lower(), f"une bêtise ({quoi}) : « {toast(pg)[:70]}… »")
        vsel = '.at-betise' if quoi != 'tabouret' else '.at-t-tabouret'
        pg.evaluate(f"document.querySelector('{vsel}') && T.voirEl('{vsel}')"); att(pg, 450)
        cap(pg, f'betise-{quoi}', t, 't')
        if quoi == 'tabouret':
            tbid = pg.evaluate("(banc.etat.objets.find(o => o.t === 'tabouret' && o.renverse) || {}).id")
            if tbid: taper(pg, f'[data-obj="{tbid}"]', 500)
            B.v(tbid and not ob(pg, tbid).get('renverse') and not pg.evaluate("banc.etat.betises.length"), "toucher le tabouret renversé : il se relève")
        else:
            tz = pg.evaluate("(() => { const e = document.querySelector('.at-betise'); if(!e) return 0; const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })()")
            taper(pg, '.at-betise', 700)
            B.v(tz >= 48 and not pg.evaluate("banc.etat.betises.length") and not pg.evaluate("!!document.querySelector('.at-betise')"), f"un toucher la répare ({tz:.0f} px au doigt)")
    B.v(pg.evaluate("banc.etat.objets.length") == n0 and pg.evaluate("JSON.stringify(Atelier.compter(banc.etat))") == stock0, "rien n'est perdu (les objets, les ingrédients)")
    # au plus une bêtise toutes les 4 minutes de jeu
    pg.evaluate(f"banc.vue._reveil('{ch}')"); att(pg, 100)
    pg.evaluate("banc.etat.tama.betise = banc.etat.tama.jeu")
    b0 = pg.evaluate("banc.etat.tama.betise")
    for i in range(15): pg.evaluate("banc.vue._tama(15)")
    avant4 = pg.evaluate("banc.etat.tama.betise") == b0 and not pg.evaluate("banc.etat.betises.length") and not pg.evaluate("banc.etat.objets.some(o => o.renverse)")
    pg.evaluate(f"banc.vue._reveil('{ch}')"); att(pg, 100)
    for i in range(3):
        pg.evaluate("banc.vue._tama(15)")
        if pg.evaluate("banc.etat.tama.betise") != b0: break
    ecart = pg.evaluate("banc.etat.tama.betise") - b0
    B.v(avant4 and ecart >= 240, f"pas de bêtise avant 4 minutes de jeu ; la suivante vient après {ecart} s de jeu")
    attendre(pg, "!document.querySelector('.at-c-marche') && !document.querySelector('.at-c-saute')", 14); att(pg, 1500)
    pg.evaluate("(() => { banc.etat.betises = []; banc.etat.objets.forEach(o => { delete o.renverse; }); })()")
    pg.evaluate("banc.majVue()"); att(pg, 300)
    besoins(pg, ch, {'faim': 90, 'soif': 90, 'amour': 90, 'jeu': 90, 'dodo': 90})
    # --- enquêtes 1 à 3 : un seul chat ---
    for n in (2, 3):
        pg.evaluate(f"banc.enquete = {n}; banc.majVue()"); att(pg, 200)
        for i in range(12): pg.evaluate("banc.vue._tama(60)")
    B.v(pg.evaluate("banc.etat.objets.filter(o => o.t === 'chat').length") == 1 and not ob(pg, ch).get('ronde'), "enquêtes 1 à 3 : un seul chat, même après longtemps")
    # --- enquête 4 : elle s'arrondit, un chaton, puis Mimi part chez Odette ---
    pg.evaluate("banc.enquete = 4; banc.majVue()"); att(pg, 200)
    pg.evaluate("banc.vue._tama(15)"); att(pg, 300)
    B.v(ob(pg, ch).get('ronde') == 1 and classe(pg, ch, 'at-c-ronde'), f"enquête 4 : la chatte s'arrondit (« {toast(pg)[:50]}… »)")
    pg.evaluate(f"T.voirEl('[data-obj=\"{ch}\"]')"); att(pg, 300)
    cap(pg, 'ronde', t, 't')
    for i in range(5): pg.evaluate("banc.vue._tama(60)")
    att(pg, 900)
    chats = pg.evaluate("banc.etat.objets.filter(o => o.t === 'chat')")
    kit = [c for c in chats if c.get('chaton')]
    B.v(len(chats) == 2 and len(kit) == 1 and kit[0]['v'] != ob(pg, ch)['v'] and not ob(pg, ch).get('ronde'), f"un chaton est né, avec un autre pelage (« {toast(pg)[:60]}… »)")
    if kit:
        k = kit[0]['id']
        tk = pg.evaluate(f"(() => {{ const a = document.querySelector('[data-obj=\"{ch}\"] svg').getBoundingClientRect(), b = document.querySelector('[data-obj=\"{k}\"] svg').getBoundingClientRect(); return [a.height, b.height]; }})()")
        B.v(tk[1] < tk[0] * 0.85 and set(kit[0]['b']) == {'faim', 'soif', 'amour', 'jeu', 'dodo'}, f"le chaton est plus petit ({tk[1]:.0f} px / {tk[0]:.0f} px), il a ses besoins à lui")
        pg.evaluate(f"banc.vue._dehors('{k}')"); pg.evaluate(f"banc.vue._dehors('{ch}')"); att(pg, 300)
        pg.evaluate(f"T.voirEl('[data-obj=\"{k}\"]')"); att(pg, 500)
        cap(pg, 'chaton', t, 't')
        besoins(pg, k, {'faim': 20})
        B.v(pg.evaluate(f"banc.vue._bulle('{k}')") == 'faim', "le chaton aussi demande (sa bulle)")
        # ses jeux à lui : il court après sa queue
        hasard(pg, 0.1); pg.evaluate(f"(() => {{ const o = banc.etat.objets.find(o => o.id === '{k}'); Object.assign(o.b, {{faim:90}}); }})()")
        ag = pg.evaluate(f"banc.vue._agir('{k}')"); att(pg, 300); vrai_hasard(pg)
        tq = classe(pg, k, 'at-c-tourne')
        B.v(tq, "le chaton a ses jeux à lui (il court après sa queue)" + ('' if tq else f" (agir {ag}, {pg.evaluate(f'banc.vue._chat(\"{k}\")')}, besoins {ob(pg, k)['b']})"))
    # le départ de Mimi
    for i in range(8): pg.evaluate("banc.vue._tama(60)")
    att(pg, 600)
    ts = toast(pg)
    B.v('Odette' in ts and 'visite' in ts and classe(pg, ch, 'at-c-salut') and pg.evaluate("!!document.querySelector('.at-toast-lire')"), f"Mimi fait au revoir de la patte : « {ts[:80]} » (avec 🔊)")
    pg.evaluate(f"T.voirEl('[data-obj=\"{ch}\"]')"); att(pg, 300)
    cap(pg, 'au-revoir', t, 't')
    att(pg, 6800)
    chats = pg.evaluate("banc.etat.objets.filter(o => o.t === 'chat')")
    B.v(len(chats) == 1 and chats[0].get('chaton') and not pg.evaluate(f"!!document.querySelector('[data-obj=\"{ch}\"]')"), "elle est partie ; le chaton reste")
    co = pg.evaluate("Atelier.chezOdette(banc.etat)"); rp = pg.evaluate("Atelier.repliqueOdette(banc.etat)")
    B.v(co and co[0]['nom'] == 'Mimi' and rp and 'Mimi' in rp['a'] and 'Odette' not in rp['a'], f"elle vit chez Odette : {co} ; Odette : « {rp and rp['a'][:60]}… »")
    for i in range(10): pg.evaluate("banc.vue._tama(60)")
    B.v(pg.evaluate("banc.etat.objets.filter(o => o.t === 'chat').length") == 1, "ensuite, plus de départ ni de naissance d'un coup")
    # --- l'état ---
    B.v(pg.evaluate("JSON.stringify(Atelier.normaliser(JSON.parse(JSON.stringify(banc.etat)))) === JSON.stringify(banc.etat)"), "l'état reste du JSON (aller-retour identique)")
    # une sauvegarde de l'étape 2 (sans chat Tamagotchi) : le carton du chat arrive, rien n'est perdu
    E2 = {"v": 4, "n": 40, "nc": 1, "ncs": 1, "cadeauRangements": 1, "cadeauDeco": 1, "cadeauChambre": 1, "cadeauLabo": 1, "boutique": [], "flaque": 0, "appris": {},
          "panier": {"eau": 1}, "nouveaux": 0, "deco": {"fond": 2, "murG": 1, "murD": 0, "sol": 3, "fond2": 37, "murG2": 37, "murD2": 37, "sol2": 0}, "theme": 0, "cartons": [], "reserve": [],
          "objets": [{"id": "fx", "t": "fioles_ingr", "x": 640, "y": 300, "sur": None, "cases": [{"e": [], "i": {"miel": 2}} for _ in range(4)]},
                     {"id": "ch", "t": "chaudron", "x": 950, "y": 700, "sur": None}, {"id": "lu", "t": "lutrin", "x": 400, "y": 766, "sur": None}, {"id": "pa", "t": "paillasse", "x": 240, "y": 640, "sur": None},
                     {"id": "o9", "t": "chat", "x": 700, "y": 800, "sur": None, "v": 2}, {"id": "o10", "t": "lit", "x": 600, "y": 700, "pc": 1, "sur": None}]}
    av = pg.evaluate("(e => Atelier.compter(e))(" + json.dumps(E2) + ")")
    monter(pg, copy.deepcopy(E2)); att(pg, 500)
    e = pg.evaluate("banc.etat"); c9 = [o for o in e['objets'] if o['id'] == 'o9'][0]
    B.v(any(k['reste'] == CHAT_OBJ for k in e['cartons']) and c9['nom'] == 'Mimi' and c9['b']['faim'] == 80 and c9['v'] == 2 and pg.evaluate("Atelier.compter(banc.etat)") == av,
        "une sauvegarde de l'étape 2 : le carton du chat arrive, le chat s'appelle Mimi (son pelage gardé), rien n'est perdu")
    # --- au repos : pas de requestAnimationFrame ---
    pg.evaluate("window.__raf = 0"); att(pg, 2000)
    B.v(pg.evaluate("window.__raf") == 0, f"au repos : {pg.evaluate('window.__raf')} requestAnimationFrame en 2 s")
    # --- ce qu'on touche ≥ 48 px : les affaires du chat ---
    ouvrir_cartons_vite(pg); att(pg, 400)
    petits = []
    for ty in CHAT_OBJ:
        i = un(pg, ty)
        if not i: petits.append(ty + ':absent'); continue
        r = pg.evaluate(f"(() => {{ const r = document.querySelector('[data-obj=\"{i}\"]').getBoundingClientRect(); return Math.min(r.width, r.height); }})()")
        if r < 48: petits.append(f"{ty}:{r:.0f}")
    B.v(not petits, f"les affaires du chat se touchent facilement (≥ 48 px) {petits}")

if __name__ == '__main__':
    lancer(scenario, TAILLES_ICI, 'essai4', 't')
