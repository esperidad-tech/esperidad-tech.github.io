"""Banc d'essai de l'atelier v4 : le parcours de l'enfant, à chaque taille (souris = doigt).
Usage : python3 essai.py [390x844 360x740 ...] [--vite]
  pièce vide → cartons de meubles (de beaux rangements, contre les murs de côté, de profil) → le chaudron sans rien
  (il bouillonne, phrase 🔊, le lutrin brille, 🎨 dans la bulle) → la cueillette posée devant la porte (un tas par ingrédient, « Nouveau ! »)
  → un tas glissé jusqu'à un tiroir de la pièce (la pièce défile au bord) → un liquide glissé dans un tiroir : refusé, expliqué, 🔊, rien de perdu
  → un tas touché : « où le ranger ? » → gros plan (ranger, glisser, ressortir, 🎨) → « tout est rangé »
  → le lutrin : le grimoire (une recette prête, une qui manque, 🎨) → le chaudron : le choix → préparation réussie (robot du mini-jeu)
  → la potion : son flacon posé devant la porte (à quoi elle sert, donner, vendre) → « Préparer » depuis le grimoire → ratée (la flaque, devant le chaudron)
  → la paillasse d'analyse (badge, analyser, 🎨 : cinq tables) → la nuit, la lampe.
Tailles : ce qu'on touche ≥ 48 px, les icônes de contenu ≥ 32 px. Aucune erreur console.
--vite : la préparation réussie n'est jouée jusqu'au bout qu'en 390x844 et 1280x800 (ailleurs : ouverte puis abandonnée)."""
import sys, os, json, time
from outils_at import *

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
VITE = '--vite' in sys.argv
TAILLES_ICI = [tuple(int(v) for v in a.split('x')) for a in ARGS] or TAILLES
CUEILLETTE = {'eau': 4, 'miel': 3, 'baies': 4, 'champignon': 1, 'trefle': 3, 'brume': 2}

def glisser_loin(pg, a, cible, max_s=12):
    """Glisser un tas jusqu'à une chose peut-être hors de l'écran : on va au bord, la pièce défile, puis on lâche dessus."""
    pg.mouse.move(a['x'], a['y']); pg.mouse.down(); pg.mouse.move(a['x'] + 4, a['y'] + 4, steps=2)
    r = pg.evaluate("T.rect('.at-piece')"); t0 = time.time(); fin = None; pan_avant = None
    while time.time() - t0 < max_s:
        p = pg.evaluate(f"T.prise({json.dumps(cible)})")
        pan = pg.evaluate("banc.vue._vb().pan")
        # hors de la bande du bord (44 px) où la pièce défile ; tout contre le bord seulement si la pièce ne défile plus
        m = 12 if pan_avant and abs(pan['x'] - pan_avant['x']) + abs(pan['y'] - pan_avant['y']) < 0.5 else 50
        pan_avant = pan
        if p and r['l'] + m < p['x'] < r['l'] + r['w'] - m and r['t'] + m < p['y'] < r['t'] + r['h'] - m:
            pg.mouse.move(p['x'], p['y'], steps=4); att(pg, 60)
            p2 = pg.evaluate(f"T.prise({json.dumps(cible)})")
            if p2: pg.mouse.move(p2['x'], p2['y'], steps=2)
            fin = p2 or p; break
        c = pg.evaluate(f"T.rect({json.dumps(cible)})")
        bx = r['l'] + 8 if c['x'] < r['l'] + r['w'] / 2 else r['l'] + r['w'] - 8
        by = r['t'] + r['h'] / 2 if r['t'] < c['y'] < r['t'] + r['h'] else (r['t'] + 8 if c['y'] < r['t'] else r['t'] + r['h'] - 8)
        pg.mouse.move(bx, by, steps=6); att(pg, 150)
    att(pg, 40); pg.mouse.up(); att(pg, 500)
    return fin

def rangement(pg, liquide):
    """Un rangement de la pièce (sec ou en verre) qui a de la place."""
    return pg.evaluate(f"""(() => {{ const o = banc.etat.objets.find(o => {{ const c = Atelier.OBJETS[o.t]; return c && c.cases && c.z !== 'petit' && !!c.verre === {str(liquide).lower()} &&
      o.cases.some((cs, j) => Object.values(cs.i).reduce((a, b) => a + b, 0) < c.cases[j].cap); }}); return o ? o.id : null; }})()""")

def scenario(pg, t, B):
    W, H = t
    complet = (not VITE) or t in ((390, 844), (1280, 800))
    pg.evaluate("banc.connue = true; banc.vendre = true; banc.fioles = 3; banc.potions = {}; banc.etat = Atelier.etatNeuf(); banc.creer()")
    att(pg, 900)
    r = pg.evaluate("T.rect('.at')")
    B.v(abs(r['t'] - 62) < 2 and abs(r['t'] + r['h'] - (H - 64)) < 2 and abs(r['w'] - W) < 2, f"l'atelier remplit l'espace entre les bandes ({r['t']:.0f}..{r['t'] + r['h']:.0f} sur {H})")
    B.v(pg.evaluate("document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight"), "pas de défilement de la page")
    B.v(pg.evaluate("!document.querySelector('.at-panier, .at-btn-livre, .at-btn-chaudron, .at-outil, .at-arrivage') && !document.querySelector('.at').textContent.includes('↔')"), "ni panier, ni carton de cueillette, ni boutons flottants")
    B.v(pg.evaluate("['ch', 'lu', 'pa'].every(id => !!banc.etat.objets.find(o => o.id === id)) && !document.querySelector('.at-armoire, .at-reserve, [data-obj] .at-pot')"), "le chaudron, le lutrin, la paillasse sont là ; plus d'armoire à potions ni de carton dans la pièce")
    coin = pg.evaluate("(() => { const c = document.querySelector('.at-coin[data-at=reserve]'), r = c && c.getBoundingClientRect(), p = document.querySelector('.at-piece').getBoundingClientRect(); return c ? {dansMonde:!!c.closest('.at-monde'), d:p.right - r.right, b:p.bottom - r.bottom, w:r.width, h:r.height, fond:getComputedStyle(c).backgroundColor} : null; })()")
    B.v(coin and not coin['dansMonde'] and coin['d'] < 20 and coin['b'] < 20 and min(coin['w'], coin['h']) >= 48, f"le carton 📦 : une icône fixe en bas à droite de l'écran ({coin and round(coin['w'])} px)")
    B.v(pg.evaluate("(document.querySelector('[data-obj=ch] .at-vides b') || {}).textContent") == '3', "les fioles vides : un badge sur le chaudron (3)")
    vb = pg.evaluate("banc.vue._vb()")
    B.note(f"k = {vb['k']:.2f} px par unité, glisse : {pg.evaluate('T.a(\"at-glissable\")')}")
    cap(pg, '01-vide', t)
    # --- les cartons de meubles ---
    n = ouvrir_cartons(pg)
    types = pg.evaluate("banc.etat.objets.map(o => o.t)")
    B.v(pg.evaluate(CARTONS_ICI + '.length') == 0, f"cartons de l'atelier ouverts ({n} touchers, {len(types)} objets ; ceux de la chambre l'attendent)")
    B.v(not set(types) & {'caisse', 'sac', 'tonneau'} and {'placard', 'apothicaire', 'vitrine', 'epices', 'suspendus'} <= set(types), "de beaux rangements (placard, apothicaire, vitrine, épices, bocaux suspendus), plus de caisse, de sac ni de tonneau")
    prof = pg.evaluate("banc.etat.objets.filter(o => o.cote).map(o => o.t + ':' + o.cote)")
    B.v(len(prof) >= 3, f"des rangements contre les murs de côté, de profil : {prof}")
    B.v(pg.evaluate("banc.etat.objets.filter(o => o.cote).every(o => document.querySelector('[data-obj=\"' + o.id + '\"]').classList.contains('at-profil'))"), "ils sont dessinés de profil")
    endormir_chat(pg, pg.evaluate("banc.etat.objets.find(o => o.t === 'chat').id"))
    pg.evaluate("banc.vue._voir(600, 600)"); att(pg, 300)
    cap(pg, '02-matin', t)
    if pg.evaluate("T.a('at-glissable')"):
        r0 = pg.evaluate("T.rect('.at-coin')"); f0 = pg.evaluate("getComputedStyle(document.querySelector('.at-coin')).backgroundColor")
        pg.evaluate("banc.vue._voir(100, 300)"); att(pg, 200)
        r1 = pg.evaluate("T.rect('.at-coin')"); f1 = pg.evaluate("getComputedStyle(document.querySelector('.at-coin')).backgroundColor")
        B.v(abs(r0['x'] - r1['x']) < 1 and abs(r0['y'] - r1['y']) < 1 and f0 == f1, "la pièce glisse : le carton 📦 ne bouge pas, ne change pas de couleur")
        pg.evaluate("banc.vue._voir(600, 600)"); att(pg, 200)
    # --- le chaudron sans rien de possible ---
    taper(pg, '[data-at=chaudron]', 450)
    B.v(pg.evaluate("document.querySelector('[data-obj=ch]').classList.contains('at-bouillonne')"), "chaudron sans rien : il bouillonne")
    B.v('regarde le grimoire' in pg.evaluate("T.toast()"), f"chaudron sans rien : « {pg.evaluate('T.toast()').strip()[:60]} »")
    B.v(pg.evaluate("document.querySelector('[data-obj=lu]').classList.contains('at-livre-appel')"), "chaudron sans rien : le lutrin du grimoire brille")
    B.v(panneau(pg) == '', "chaudron sans rien : pas de panneau")
    clic(pg, '.at-toast-lire'); att(pg, 150)
    B.v('grimoire' in pg.evaluate("T.lu()"), "chaudron sans rien : 🔊 lit la phrase")
    st0 = pg.evaluate("T.objet('ch').st || 0")
    clic(pg, '.at-toast-peindre'); att(pg, 300)
    B.v((pg.evaluate("T.objet('ch').st") or 0) == st0 + 1, "🎨 dans la bulle : le chaudron change de couleur")
    cap(pg, '03-chaudron-rien', t)
    att(pg, 500)
    # --- la cueillette, posée devant la porte ---
    pg.evaluate("(c => { for(const k in c) Atelier.ajouter(banc.etat, k, c[k]); banc.majVue(); })(" + json.dumps(CUEILLETTE) + ")")
    att(pg, 500)
    tas = pg.evaluate("[...document.querySelectorAll('.at-tas')].map(e => e.dataset.tas)")
    B.v(sorted(tas) == sorted(CUEILLETTE), f"un tas par ingrédient devant la porte : {tas}")
    B.v(pg.evaluate("!!document.querySelector('.at-tas-neuf')"), "« Nouveau ! » au-dessus de la cueillette")
    amener(pg, '.at-tas')
    tz = pg.evaluate("Math.min(...[...document.querySelectorAll('.at-tas')].map(e => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height)))")
    B.v(tz >= 48, f"les tas se touchent facilement ({tz:.0f} px)")
    cap(pg, '04-cueillette', t)
    # --- glisser un tas directement dans un tiroir de la pièce ---
    sec = rangement(pg, False)
    a = prise_sure(pg, '.at-tas[data-tas=baies]')
    avant = pg.evaluate(f"JSON.stringify(T.objet('{sec}').cases)")
    fin = glisser_loin(pg, a, f'[data-obj="{sec}"]')
    apres_ = pg.evaluate(f"T.objet('{sec}').cases.reduce((n, cs) => n + (cs.i.baies || 0), 0)")
    B.v(fin is not None and apres_ == 4 and not pg.evaluate("banc.etat.panier.baies"), f"glisser le tas de baies jusqu'à « {pg.evaluate(f'T.objet(\"{sec}\").t')} » : rangé ({apres_})")
    cap(pg, '05-glisse-tiroir', t)
    # un liquide dans un tiroir : refusé, expliqué, rien de perdu
    att(pg, 600)
    a = prise_sure(pg, '.at-tas[data-tas=eau]')
    glisser_loin(pg, a, f'[data-obj="{sec}"]')
    txt = pg.evaluate("T.toast()")
    B.v('liquides' in txt and pg.evaluate("banc.etat.panier.eau") == 4, f"de l'eau dans un tiroir : refusé gentiment, rien de perdu (« {txt.strip()[:50]}… »)")
    clic(pg, '.at-toast-lire'); att(pg, 150)
    B.v('bocaux' in pg.evaluate("T.lu()"), "🔊 lit l'explication")
    att(pg, 300)
    # --- toucher un tas : « où le ranger ? » puis le gros plan ---
    taper(pg, '.at-tas[data-tas=eau]', 500)
    B.v('at-cal-arrivage' in panneau(pg) and pg.evaluate("banc.vue._sel()") == 'eau', "toucher le tas d'eau : « Ta cueillette », l'eau est choisie")
    B.v(not pg.evaluate("!!document.querySelector('.at-tas-neuf')") and pg.evaluate("banc.etat.nouveaux") == 0, "vu : « Nouveau ! » s'en va")
    vers = pg.evaluate("[...document.querySelectorAll('.at-ou-b')].map(b => b.dataset.vers)")
    verres = pg.evaluate("banc.etat.objets.filter(o => { const c = Atelier.OBJETS[o.t]; return c && c.cases && c.verre; }).map(o => o.id)")
    B.v(sorted(vers) == sorted(verres), f"l'eau va dans le verre : {len(vers)} rangements proposés")
    cap(pg, '06-ou-ranger', t)
    tailles(pg, B, '.at-grim', 'cueillette')
    sus = pg.evaluate("banc.etat.objets.find(o => o.t === 'suspendus').id")
    taper_ui(pg, f'.at-ou-b[data-vers="{sus}"]', 500)
    B.v(ouvert(pg) and pg.evaluate("document.querySelectorAll('.at-ouvert .at-case.at-ok').length") == 3, "les bocaux suspendus en gros plan, les trois bocaux en vert")
    cap(pg, '07-gros-plan', t)
    tailles(pg, B, '.at-ouvert', 'gros plan des bocaux')
    taper_ui(pg, '.at-ouvert .at-case[data-case="0"]', 450)
    B.v(obj(pg, sus)['cases'][0]['i'].get('eau') == 4, "toucher puis toucher : l'eau rangée")
    pg.evaluate("document.querySelector('.at-ouvert .at-jeton-g[data-ingr=miel]').scrollIntoView({block:'nearest'})"); att(pg, 100)
    glisser(pg, pg.evaluate("T.rect('.at-ouvert .at-jeton-g[data-ingr=miel]')"), pg.evaluate("T.rect('.at-ouvert .at-case[data-case=\"1\"]')"), 16); att(pg, 400)
    B.v(obj(pg, sus)['cases'][1]['i'].get('miel') == 3, "glisser : le miel rangé")
    taper_ui(pg, '.at-ouvert .at-jeton-g[data-ingr=brume]', 200); taper_ui(pg, '.at-ouvert .at-case[data-case="2"]', 400)
    taper_ui(pg, '.at-ouvert .at-case[data-case="2"] .at-chipi', 250)
    taper_ui(pg, '.at-ouvert .at-plateau', 400)
    B.v(pg.evaluate("banc.etat.panier.brume") == 2, "ressortir : la brume retourne devant la porte")
    taper_ui(pg, '.at-ouvert .at-jeton-g[data-ingr=brume]', 200); taper_ui(pg, '.at-ouvert .at-case[data-case="2"]', 400)
    st0 = obj(pg, sus).get('st') or 0
    taper_ui(pg, '.at-ouvert .at-peindre', 300)
    B.v(obj(pg, sus).get('st') == st0 + 1, "🎨 dans le gros plan : le meuble change de couleur")
    taper_ui(pg, '.at-ouvert .at-fermer', 300)
    # le reste : dans un meuble sec, par le gros plan
    for k in ('champignon', 'trefle'):
        taper(pg, f'.at-tas[data-tas={k}]', 450)
        taper_ui(pg, '.at-ou-b:not(.plein)', 500)
        taper_ui(pg, '.at-ouvert .at-case.at-ok', 400)
        if k == 'champignon': cap(pg, '08-gros-plan-sec', t)
        if ouvert(pg) and k != 'trefle': taper_ui(pg, '.at-ouvert .at-fermer', 300)
    B.v(not pg.evaluate("Object.keys(banc.etat.panier).length") and 'tout est rangé' in pg.evaluate("T.toast()"), "« Plus rien par terre : tout est rangé ! »")
    cap(pg, '09-tout-range', t)
    if ouvert(pg): taper_ui(pg, '.at-ouvert .at-fermer', 300)
    B.v(not pg.evaluate("document.querySelectorAll('.at-tas').length"), "plus de tas devant la porte")
    # --- le lutrin : le grimoire ---
    taper(pg, '[data-obj=lu]', 500)
    B.v('at-cal-livre' in panneau(pg), "toucher le lutrin : le grimoire")
    fiches = pg.evaluate("[...document.querySelectorAll('.at-rcarte')].map(f => ({r:f.dataset.fiche, pret:f.classList.contains('pret'), utile:f.querySelector('.at-rutile').textContent.trim()}))")
    par = {f['r']: f for f in fiches}
    B.v(par['revelatrice']['pret'] and not par['lumiere']['pret'], "révélatrice prête, lumière manque")
    st0 = obj(pg, 'lu').get('st') or 0
    taper_ui(pg, '.at-grim .at-peindre', 300)
    B.v(obj(pg, 'lu').get('st') == st0 + 1, "🎨 dans le grimoire : le lutrin change de style")
    cap(pg, '10-grimoire', t)
    tailles(pg, B, '.at-grim', 'grimoire')
    pg.evaluate("document.querySelector('.at-rcarte[data-fiche=lumiere]').scrollIntoView({block:'center'})"); att(pg, 200)
    taper_ui(pg, '.at-rpreparer[data-r=lumiere]', 120)
    B.v(pg.evaluate("document.querySelectorAll('.at-rcarte[data-fiche=lumiere] .at-ri.ko.at-flash').length") >= 1 and not pg.evaluate("!!document.querySelector('.at-mj')"), "« Préparer » rouge : il tremble, ce qui manque clignote")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- le chaudron : le choix, puis la préparation ---
    taper(pg, '[data-obj=ch]', 500)
    ch = pg.evaluate("[...document.querySelectorAll('.at-ch-go')].map(b => b.dataset.r)")
    B.v(ch == ['revelatrice', 'rapidite'], f"le chaudron propose seulement ce qu'on peut faire : {ch}")
    cap(pg, '11-chaudron-choix', t)
    tailles(pg, B, '.at-grim', 'chaudron')
    avant = stock(pg)
    taper_ui(pg, '.at-ch-go[data-r=revelatrice]', 500)
    B.v(pg.evaluate("!!document.querySelector('.at-mj')"), "gros bouton : le mini-jeu commence")
    preparer_mj(pg, 'gagne')
    att(pg, 9000)
    cap(pg, '12-preparation', t)
    if complet:
        finir_mj(pg)
        pg.click('.at-mj .mj-continuer'); att(pg, 700)
        apres_ = stock(pg)
        B.v(pg.evaluate("banc.potions.revelatrice") == 1, f"encre révélatrice réussie ({pg.evaluate('banc.resultats.slice(-1)[0].detail')})")
        B.v(apres_.get('eau', 0) == avant.get('eau', 0) - 2 and apres_.get('baies', 0) == avant.get('baies', 0) - 3, "les ingrédients sont pris dans les rangements")
        fl = pg.evaluate("(() => { const f = banc.vue._flacons().find(x => x.k === 'revelatrice'); return f ? {neuf:f.neuf, x:f.cadre.x, y:f.cadre.y} : null; })()")
        B.v(fl and fl['neuf'] and abs(fl['x'] - 650) < 200 and 600 < fl['y'] < 860, f"la potion : un flacon posé par terre devant la porte, qui brille ({fl})")
    else:
        pg.evaluate("(() => { const b = document.querySelector('.at-mj-abandon'); b.click(); b.click(); })()"); att(pg, 600)
        B.v(not pg.evaluate("!!document.querySelector('.at-mj')"), "abandon (deux touchers sur 🏳️)")
        pg.evaluate("banc.potions = {revelatrice:1}; banc.majVue()"); att(pg, 300)
    # --- la potion : son flacon devant la porte ---
    B.v(pg.evaluate("document.querySelectorAll('.at-flacon[data-at=potions][data-pot]').length") == 1, "un flacon par potion, devant la porte")
    taper(pg, '.at-flacon[data-pot=revelatrice]', 450)
    B.v('at-cal-potions' in panneau(pg), "toucher le flacon : à quoi sert la potion, la donner, la vendre")
    ut = pg.evaluate("DONNEES.POTIONS.revelatrice.utile")
    B.v(pg.evaluate("document.querySelector('.at-pot-carte p').textContent").replace(' ', ' ') == ut, "la même phrase « à quoi elle sert » que le grimoire")
    B.v(pg.evaluate("!!document.querySelector('[data-act=donner-potion][data-id=revelatrice]') && !!document.querySelector('[data-act=vendre][data-id=revelatrice]')"), "donner (code) et vendre")
    cap(pg, '13-potions', t)
    tailles(pg, B, '.at-grim', 'potions')
    taper_ui(pg, '[data-act=donner-potion][data-id=revelatrice]', 400)
    B.v('donner-potion:revelatrice' in pg.evaluate("banc.actes"), "« Donner » passe au moteur (data-act)")
    if panneau(pg): taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- « Préparer » depuis le grimoire, ratée : la flaque devant le chaudron ---
    taper(pg, '[data-obj=lu]', 450)
    pg.evaluate("document.querySelector('.at-rcarte[data-fiche=rapidite]').scrollIntoView({block:'center'})"); att(pg, 200)
    taper_ui(pg, '.at-rpreparer[data-r=rapidite]', 500)
    B.v(pg.evaluate("!!document.querySelector('.at-mj')"), "« Préparer » vert du grimoire : le mini-jeu commence")
    preparer_mj(pg, 'boum', {'buches': 7})
    finir_mj(pg, 200000)
    pg.click('.at-mj .mj-continuer'); att(pg, 800)
    fl = pg.evaluate("T.rect('[data-at=flaque]')"); chr_ = pg.evaluate("T.rect('[data-obj=ch]')")
    B.v(pg.evaluate("banc.etat.flaque") == 1 and fl and abs(fl['x'] - chr_['x']) < chr_['w'], "ratée : une flaque, devant le chaudron")
    pg.evaluate("T.voirEl('[data-at=flaque]')"); att(pg, 300)
    cap(pg, '14-flaque', t)
    taper(pg, '[data-at=flaque]', 700)
    B.v(pg.evaluate("banc.etat.flaque") == 0, "toucher la flaque : nettoyée")
    # --- la paillasse d'analyse ---
    B.v(pg.evaluate("document.querySelector('[data-obj=pa]').classList.contains('at-attente')") and pg.evaluate("(document.querySelector('[data-obj=pa] .at-badge') || {}).textContent") == '1', "la paillasse : un objet attend (badge 1)")
    taper(pg, '[data-obj=pa]', 450)
    B.v('at-cal-analyses' in panneau(pg) and pg.evaluate("document.querySelectorAll('.at-an').length") == 2, "toucher la paillasse : les objets reçus")
    f0 = pg.evaluate("(T.objet('pa').st || 0) % 5")
    taper_ui(pg, '.at-grim .at-peindre', 300)
    B.v(pg.evaluate("(T.objet('pa').st || 0) % 5") == (f0 + 1) % 5, "🎨 : une autre table (cinq styles)")
    cap(pg, '15-analyses', t)
    tailles(pg, B, '.at-grim', "paillasse d'analyse")
    taper_ui(pg, '[data-act=analyser][data-id=fil]', 500)
    B.v('analyser:fil' in pg.evaluate("banc.actes") and not pg.evaluate("document.querySelector('[data-obj=pa]').classList.contains('at-attente')"), "« Analyser » passe au moteur, la paillasse ne brille plus")
    # --- la nuit, la lampe ---
    pg.evaluate("banc.moment = 'nuit'; banc.majVue(); banc.vue._voir(600, 600)"); att(pg, 700)
    B.v(pg.evaluate("T.a('at-l-nuit')"), "la nuit tombe sur l'atelier")
    cap(pg, '16-nuit', t)
    lampe = pg.evaluate("banc.etat.objets.find(o => o.t === 'lampe').id")
    av = obj(pg, lampe).get('on')
    taper(pg, f'[data-obj="{lampe}"]', 500)
    B.v(obj(pg, lampe).get('on') != av, "toucher la lampe : elle s'allume ou s'éteint")
    cap(pg, '17-nuit-lampe', t)
    B.v(len(json.dumps(pg.evaluate("banc.etat"))) < 24000, f"état JSON {len(json.dumps(pg.evaluate('banc.etat')))} octets")

if __name__ == '__main__':
    lancer(scenario, TAILLES_ICI, 'essai', 'n')
