"""Banc d'essai du Sage : « L'alphabet secret » et « Assembler les runes » (mj-sage-codes.js).
Usage : python3 build.py && python3 test/sage-codes/essai.py [rapide]
Tout passe par la salle d'entraînement (dist/salle-mini-jeux.html) : [data-jeu=…] puis .mj-go,
sauf les paramètres des enquêtes (dist/index.html, lancés comme le fait le moteur)."""
import sys, random, time, json
from outils import *

RAPIDE = 'rapide' in sys.argv
SYSTEMES = ['pigpen', 'cesar', 'symboles', 'nombres', 'grille', 'miroir', 'morse', 'substitution', 'danseurs']
IMAGES = ['runes', 'carte', 'blason', 'horloge']
bilan = []

def note(ok, quoi, detail=''):
    bilan.append((ok, quoi, detail))
    print(('  OK  ' if ok else '  ÉCHEC ') + quoi + ('  — ' + detail if detail else ''))

def erreurs(pg):
    return [x for x in pg._errs if 'ERR_TUNNEL' not in x and 'fonts.g' not in x and 'Failed to load resource' not in x]

# ======================================================================
#  ALPHABET
# ======================================================================
def test_systeme(pg, s):
    # niveau 5 : 2 cœurs, lettres fausses montrées en rouge
    lancer(pg, 'alphabet', 5, params={'systeme': s})
    a, fausses = remplir(pg, faux=1)
    assert a['systeme'] == s, a['systeme']
    pg.click('.mjs-valider'); pg.wait_for_timeout(300)
    refuse = pg.locator('.mj-resultat').count() == 0 and alpha(pg)['coeurs'] == 1
    rouge = pg.locator('.mjs-case.faux').count() == 1
    note(refuse and rouge, f'{s} : une mauvaise réponse est refusée (un cœur en moins, la case fausse en rouge)', pg.inner_text('.mjs-info'))
    # correction de la case fausse, puis validation
    i = list(fausses)[0]; l = [c['l'] for c in a['cases'] if c['i'] == i][0]
    taper(pg, i, l)
    pg.click('.mjs-valider')
    r = resultat(pg, 6000)
    note(r['ok'] and a['message'] in r['texte'], f'{s} : le robot qui connaît la réponse gagne', f"« {a['message']} » ({a['variante'] or '-'}) dégâts={sum(1 for c in a['cases'] if c['degat'])} clé-manquantes={a['cachees']}")
    quitter(pg)
    # niveau 10 : un seul cœur → une mauvaise validation fait perdre
    lancer(pg, 'alphabet', 10, params={'systeme': s})
    a = alpha(pg)
    remplir(pg, faux=1)
    pg.click('.mjs-valider')
    r = resultat(pg, 5000)
    note(not r['ok'], f'{s} niveau 10 : une mauvaise validation est refusée (perdu, 1 cœur)', r['texte'][:70])
    quitter(pg)
    lancer(pg, 'alphabet', 10, params={'systeme': s})
    a = alpha(pg)
    remplir(pg)
    pg.click('.mjs-valider')
    r = resultat(pg, 6000)
    note(r['ok'], f'{s} niveau 10 : gagné avec la bonne réponse', f"« {a['message']} » dégâts={[c['degat'] for c in a['cases'] if c['degat']]}")
    quitter(pg)

def test_desordre(pg):
    lancer(pg, 'alphabet', 6, params={'systeme': 'symboles', 'message': 'LE CORBEAU VOLE LA NUIT'})
    a = alpha(pg)
    cases = [c for c in a['cases'] if not c['donne']]
    # on commence par la fin, puis le milieu, puis on change d'avis sur une case
    ordre = cases[::-1]
    c0 = ordre[0]
    taper(pg, c0['i'], 'Q')
    t1 = pg.inner_text('.mjs-case[data-i="%d"] .mjs-r' % c0['i'])
    taper(pg, c0['i'], c0['l'])
    t2 = pg.inner_text('.mjs-case[data-i="%d"] .mjs-r' % c0['i'])
    # effacer une case avec ⌫
    c1 = ordre[1]
    taper(pg, c1['i'], c1['l'])
    pg.click('.mjs-case[data-i="%d"]' % c1['i']); pg.click('.mjs-t[data-l="-"]')
    t3 = pg.inner_text('.mjs-case[data-i="%d"] .mjs-r' % c1['i'])
    note(t1 == 'Q' and t2 == c0['l'] and t3 == '', 'remplissage dans le désordre : une case se change et s\'efface', f'{t1}→{t2}, ⌫ → «{t3}»')
    random.shuffle(ordre)
    for c in ordre: taper(pg, c['i'], c['l'])
    vides = pg.evaluate('() => [...document.querySelectorAll(".mjs-case[data-i]")].filter(b => !b.querySelector(".mjs-r").textContent).length')
    pg.click('.mjs-valider')
    r = resultat(pg)
    note(r['ok'] and vides == 0, 'remplissage dans un ordre au hasard : gagné', r['texte'][:60])
    quitter(pg)
    # bouton Valider inactif tant qu'il reste des cases vides
    lancer(pg, 'alphabet', 4, params={'systeme': 'nombres'})
    dis = pg.evaluate('() => document.querySelector(".mjs-valider").disabled')
    note(dis, 'Valider reste grisé tant que le message n\'est pas rempli')
    quitter(pg); quitter(pg)

def test_temps(pg):
    # temps minimum (20 s) : le sablier se vide → perdu, fin appelée une seule fois
    lancer(pg, 'alphabet', 10, params={'systeme': 'morse', 'tempsBase': 0, 'tempsLettre': 0})
    a = alpha(pg)
    t0 = time.time()
    r = resultat(pg, 26000)
    note(not r['ok'] and 'temps' in r['texte'].lower() and a['temps'] == 20, 'le sablier se vide : perdu', f"{a['temps']} s, {round(time.time() - t0)} s attendues — {r['texte'][:60]}")
    quitter(pg)

def test_mods(pg):
    restaurer(pg)
    pg.evaluate('() => localStorage.clear()')
    # aide : N lettres offertes ; zone : cases plus grandes ; erreurs : +cœurs ; temps / lent : plus de temps
    r0 = pg.evaluate('() => MJ.reglages("alphabet", 5, {})')
    r1 = pg.evaluate('() => MJ.reglages("alphabet", 5, {erreurs:1, temps:10, lent:.8, revele:true, zone:1.3, aide:2})')
    note(r1['coeurs'] == r0['coeurs'] + 1 and r1['degats'] < r0['degats'] and r1['zone'] == 1.3 and r1['lent'] == .8 and r1['tempsBonus'] == 10,
         'mods alphabet : erreurs → +1 cœur, revele → moins de dégâts, zone, temps, lent', f"cœurs {r0['coeurs']}→{r1['coeurs']}, dégâts {r0['degats']:.2f}→{r1['degats']:.2f}")
    lancer(pg, 'alphabet', 5, params={'systeme': 'pigpen', 'message': 'MINUIT AU CLOCHER'}, mods={'aide': 3})
    a = alpha(pg)
    donnes = sorted(set(c['l'] for c in a['cases'] if c['donne']))
    w = pg.evaluate('() => document.querySelector(".mjs-case[data-i]").getBoundingClientRect().width')
    note(len(donnes) == 3, 'mod aide : 3 lettres offertes (toutes leurs cases remplies d\'avance)', ','.join(donnes))
    quitter(pg); quitter(pg)
    lancer(pg, 'alphabet', 5, params={'systeme': 'pigpen', 'message': 'MINUIT AU CLOCHER'}, mods={'zone': 1.4})
    w2 = pg.evaluate('() => document.querySelector(".mjs-case[data-i]").getBoundingClientRect().width')
    k2 = pg.evaluate('() => document.querySelector(".mjs-t").getBoundingClientRect().height')
    note(w2 > w * 1.25, 'mod zone : cases et clavier plus grands', f'case {w:.0f}→{w2:.0f} px, touche {k2:.0f} px')
    quitter(pg); quitter(pg)
    restaurer(pg)
    # courbe : dégâts et clé partielle selon le niveau (sur 30 parties construites hors écran)
    courbe = pg.evaluate('''() => {
        const out = {};
        for(const n of [1, 3, 4, 5, 7, 10]){
            let deg = 0, tot = 0, cach = 0, nb = 0, ok = 0;
            for(let k = 0; k < 30; k++){
                const p = MJ.reglages('alphabet', n, {});
                const sys = ['symboles', 'morse', 'substitution', 'pigpen'][k % 4];
                p.systeme = sys;
                const R = MJ.sageCodes.resoudre(p);
                const P = MJ.sageCodes.construire(R, p);
                const L = P.cases.filter(c => c.lettre && !c.donne).length;
                deg += P.cases.filter(c => c.degat).length / L; tot += P.cases.filter(c => c.degat && c.degat.force === 'total').length;
                cach += Object.keys(P.cachees).length; nb++;
                if(MJ.sageCodes.resoluble(P, P.cachees, P.deduit)) ok++;
            }
            out[n] = {degats: +(deg / nb).toFixed(2), totales: +(tot / nb).toFixed(1), cleManquantes: +(cach / nb).toFixed(1), faisables: ok + '/' + nb, temps: MJ.reglages('alphabet', n, {}).tempsLettre.toFixed(1) + ' s/lettre', coeurs: MJ.reglages('alphabet', n, {}).coeurs};
        }
        return out;
    }''')
    for n, v in courbe.items(): print('     niveau', n, v)
    note(all(v['faisables'] == '30/30' for v in courbe.values()), 'chaque partie générée reste faisable (vérificateur de déduction)', 'niveaux 1, 3, 4, 5, 7, 10')
    return courbe

def test_donnees(pg):
    lancer(pg, 'alphabet', 4, params={'systeme': 'cesar', 'message': 'MINUIT A LA GRANDE VOIX', 'lettresDonnees': 'MI'})
    a = alpha(pg)
    d = sorted(set(c['l'] for c in a['cases'] if c['donne']))
    txt = pg.inner_text('.mjs-case.donne .mjs-r') if pg.locator('.mjs-case.donne').count() else ''
    note(d == ['I', 'M'] and txt in 'MI', 'lettresDonnees : les lettres connues sont déjà écrites', ','.join(d))
    # la roue de César tourne avec les boutons et au doigt
    r0 = pg.evaluate('() => +document.querySelector(".mjs-cle").dataset.rot')
    pg.click('.mjs-rbtn[data-r="1"]'); pg.wait_for_timeout(350)
    r1 = pg.evaluate('() => +document.querySelector(".mjs-cle").dataset.rot')
    box = pg.locator('.mjs-roue-svg').bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    pg.mouse.move(cx, box['y'] + 10); pg.mouse.down()
    for k in range(1, 9): pg.mouse.move(cx + box['width'] / 2 * .9 * (k / 8), box['y'] + 10 + box['height'] / 2 * (k / 8))
    pg.mouse.up(); pg.wait_for_timeout(400)
    r2 = pg.evaluate('() => +document.querySelector(".mjs-cle").dataset.rot')
    note(r1 == (r0 + 25) % 26 or r1 == (r0 + 1) % 26, 'roue de César : le bouton fait tourner d\'un cran', f'{r0}→{r1}')
    note(r2 != r1, 'roue de César : on la tourne au doigt (glisser)', f'{r1}→{r2}')
    remplir(pg); pg.click('.mjs-valider')
    r = resultat(pg)
    note(r['ok'], 'roue de César + lettres données : gagné', r['texte'][:60])
    quitter(pg)

def test_clavier_physique(pg):
    lancer(pg, 'alphabet', 3, params={'systeme': 'grille', 'message': 'VA AU PUITS'})
    a = alpha(pg)
    for c in a['cases']:
        if c['donne']: continue
        pg.click('.mjs-case[data-i="%d"]' % c['i']); pg.keyboard.press(c['l'].lower())
    pg.keyboard.press('Enter')
    r = resultat(pg)
    note(r['ok'], 'clavier d\'ordinateur : lettres + Entrée', r['texte'][:50])
    quitter(pg)

# ======================================================================
#  RUNES
# ======================================================================
def runes(pg):
    return pg.evaluate('() => window.__mjsRunes ? __mjsRunes.etat() : null')

def centre_case(pg, pos, k):
    b = pg.locator('.mjs-plateau').bounding_box()
    c = b['width'] / k
    return b['x'] + (pos % k + .5) * c, b['y'] + (pos // k + .5) * c

def toucher(pg, pos, k):
    x, y = centre_case(pg, pos, k)
    pg.mouse.click(x, y)

def glisser(pg, a, b, k):
    x0, y0 = centre_case(pg, a, k); x1, y1 = centre_case(pg, b, k)
    pg.mouse.move(x0, y0); pg.mouse.down()
    for s in range(1, 7): pg.mouse.move(x0 + (x1 - x0) * s / 6, y0 + (y1 - y0) * s / 6)
    pg.mouse.up()

def resoudre_optimal(pg, attente=0):
    """Robot optimal : quarts de tour nécessaires, puis échanges en suivant les cycles."""
    e = runes(pg); k = e['k']
    for t in e['tuiles']:
        for _ in range((4 - t['rot']) % 4):
            toucher(pg, t['pos'], k)
            if attente: pg.wait_for_timeout(attente)
    while True:
        e = runes(pg)
        if e is None: break
        mal = [t for t in e['tuiles'] if t['pos'] != t['home']]
        if not mal: break
        t = mal[0]
        glisser(pg, t['pos'], t['home'], k)
        if attente: pg.wait_for_timeout(attente)
    return e

def test_runes_optimal(pg, niv, image):
    lancer(pg, 'runes', niv, params={'image': image})
    e0 = runes(pg)
    resoudre_optimal(pg)
    r = resultat(pg, 6000)
    note(r['ok'], f'runes {image} niveau {niv} : le robot optimal gagne dans la limite',
         f"{e0['k']}×{e0['k']}, minimum {e0['optimum']}, coups {e0['coups']} (marge {e0['coups'] - e0['optimum']})")
    quitter(pg)
    return e0

def test_runes_hasard(pg):
    lancer(pg, 'runes', 3, params={'image': 'carte'})
    e = runes(pg); k = e['k']; n = 0
    while pg.locator('.mj-resultat').count() == 0 and n < 400:
        e = runes(pg)
        if e is None: break
        if random.random() < .5:
            toucher(pg, random.randrange(k * k), k)
        else:
            a, b = random.sample(range(k * k), 2); glisser(pg, a, b, k)
        n += 1
        if e['coups'] <= 1: pg.wait_for_timeout(50)
    pg.wait_for_timeout(200)
    r = resultat(pg, 4000)
    note(not r['ok'] and 'Tant pis' in r['texte'], 'runes : un joueur au hasard perd quand les coups sont épuisés', f'{n} gestes — ' + r['texte'][:70])
    quitter(pg)

def test_runes_aides(pg):
    pg.evaluate('() => localStorage.clear()')
    # coup de pouce
    lancer(pg, 'runes', 6, params={'image': 'blason'}, mods={'pouce': 1})
    e0 = runes(pg)
    bien0 = sum(1 for t in e0['tuiles'] if t['pos'] == t['home'] and t['rot'] == 0)
    pg.click('.mjs-pouce'); pg.wait_for_timeout(400)
    e1 = runes(pg)
    bien1 = sum(1 for t in e1['tuiles'] if t['pos'] == t['home'] and t['rot'] == 0)
    fixes = sum(1 for t in e1['tuiles'] if t['fixe'])
    dis = pg.evaluate('() => document.querySelector(".mjs-pouce").disabled')
    note(bien1 >= bien0 + 2 and fixes == 2 and e1['coups'] == e0['coups'] and dis, 'coup de pouce : 2 pièces posées et bloquées, sans coûter de coup, une seule fois',
         f'bien placées {bien0}→{bien1}, bloquées {fixes}, coups {e0["coups"]}→{e1["coups"]}')
    resoudre_optimal(pg)
    r = resultat(pg)
    note(r['ok'], 'coup de pouce puis robot optimal : gagné', r['texte'][:50])
    quitter(pg)
    # pièces déjà posées (aide) + plus de coups (erreurs) + moins de pièces (moins)
    lancer(pg, 'runes', 8, params={'image': 'horloge'}, mods={'aide': 3, 'erreurs': 2, 'moins': 1})
    e = runes(pg)
    fixes = [t for t in e['tuiles'] if t['fixe']]
    ok_fixes = len(fixes) == 3 and all(t['pos'] == t['home'] and t['rot'] == 0 for t in fixes)
    # une pièce bloquée ne tourne pas
    toucher(pg, fixes[0]['pos'], e['k']); pg.wait_for_timeout(250)
    e2 = runes(pg)
    note(ok_fixes and e['k'] == 4 and e2['coups'] == e['coups'], 'aide : 3 pièces bloquées à leur place ; moins : 4×4 au lieu de 5×5 ; une pièce bloquée ne compte pas de coup',
         f"k={e['k']}, coups {e['coups']} (minimum {e['optimum']})")
    quitter(pg); quitter(pg)
    restaurer(pg)
    r0 = pg.evaluate('() => MJ.reglages("runes", 8, {})'); r1 = pg.evaluate('() => MJ.reglages("runes", 8, {erreurs:2})')
    note(r1['bonus'] == r0['bonus'] + 6, 'mod erreurs : +3 coups par point', f"bonus {r0['bonus']}→{r1['bonus']}")
    sab = pg.evaluate('() => MJ.TYPES.runes.minuteur === false')
    note(sab, 'runes déclare minuteur:false (le sablier du moteur ne s\'y applique pas)')

def courbe_runes(pg):
    restaurer(pg)
    return pg.evaluate('''() => {
        const out = {};
        for(let n = 1; n <= 10; n++){
            const r = MJ.reglages('runes', n, {});
            out[n] = {grille: r.taille + '×' + r.taille, melange: Math.round(r.fracMel * 100) + '%', tournees: Math.round(r.fracRot * 100) + '%', facteur: +r.facteur.toFixed(2), bonus: r.bonus, pouce: r.pouce};
        }
        return out;
    }''')

# ======================================================================
#  Contrat : fin une seule fois, jamais après arreter
# ======================================================================
def test_contrat(pg):
    restaurer(pg)
    res = pg.evaluate('''async () => {
        const attendre = ms => new Promise(r => setTimeout(r, ms));
        const out = {};
        for(const type of ['alphabet', 'runes']){
            const div = document.createElement('div'); div.style.cssText = 'position:fixed;inset:0;display:flex;z-index:999';
            document.body.appendChild(div);
            let n = 0;
            const p = MJ.reglages(type, 3, {});
            if(type === 'alphabet'){ p.systeme = 'pigpen'; p.message = 'LE CHAT DORT'; }
            const ctl = MJ.TYPES[type].jouer(div, p, () => { n++; });
            // on gagne d'un coup par le crochet, puis on arrête avant la fin programmée
            if(type === 'alphabet'){
                for(const c of __mjsAlpha.cases){ if(c.donne) continue; div.querySelector('.mjs-case[data-i="' + c.i + '"]').click(); div.querySelector('.mjs-t[data-l="' + c.l + '"]').click(); }
                div.querySelector('.mjs-valider').click();
            }
            await attendre(300);
            ctl.arreter();
            await attendre(2600);
            out[type + '_apres_arreter'] = n;
            div.remove();
            // partie normale : fin une seule fois même si on insiste
            const div2 = document.createElement('div'); div2.style.cssText = 'position:fixed;inset:0;display:flex;z-index:999';
            document.body.appendChild(div2);
            let m = 0;
            const p2 = MJ.reglages(type, 3, {});
            if(type === 'alphabet'){ p2.systeme = 'morse'; p2.message = 'LE CHAT DORT'; }
            const ctl2 = MJ.TYPES[type].jouer(div2, p2, () => { m++; });
            if(type === 'alphabet'){
                for(const c of __mjsAlpha.cases){ if(c.donne) continue; div2.querySelector('.mjs-case[data-i="' + c.i + '"]').click(); div2.querySelector('.mjs-t[data-l="' + c.l + '"]').click(); }
                div2.querySelector('.mjs-valider').click(); div2.querySelector('.mjs-valider').click();
            }
            await attendre(2600);
            if(type === 'alphabet') div2.querySelector('.mjs-valider').click();
            ctl2.arreter(); ctl2.arreter();
            await attendre(300);
            out[type + '_fin'] = m;
            out[type + '_crochet_nettoye'] = type === 'alphabet' ? !window.__mjsAlpha : !window.__mjsRunes;
            div2.remove();
        }
        return out;
    }''')
    note(res['alphabet_apres_arreter'] == 0 and res['runes_apres_arreter'] == 0, 'fin() n\'est jamais appelé après arreter()', json.dumps(res))
    note(res['alphabet_fin'] == 1, 'alphabet : fin() appelé une seule fois')
    note(res['alphabet_crochet_nettoye'] and res['runes_crochet_nettoye'], 'arreter() nettoie les crochets et l\'écouteur clavier')

# ======================================================================
#  Paramètres des enquêtes (dist/index.html, lancés comme le moteur)
# ======================================================================
LANCER_ENQ = '''([n, liste, id, type]) => {
    const E = ENQUETES[n], x = E[liste].filter(v => v.id === id)[0];
    const params = MJ.reglages(type, E.niveau + 2, {});
    Object.keys(x.params || {}).forEach(k => params[k] = x.params[k]);
    let div = document.getElementById('banc-mj');
    if(div) div.remove();
    div = document.createElement('div'); div.id = 'banc-mj'; div.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;background:#0b0f22;padding:8px';
    document.body.appendChild(div);
    window.__resEnq = null;
    MJ.lancer(div, type, params, r => { window.__resEnq = r; }, {titre: x.titre, lireAuto: false});
    return {niveau: params.niveauEffectif, params: x.params || null, titre: x.titre};
}'''

def test_enquetes(b):
    for taille in ['tab']:
        pg = page(b, taille, JEU)
        pg.wait_for_timeout(600)
        # e2 « La lettre secrète »
        info = pg.evaluate(LANCER_ENQ, [2, 'pages', 'secret', 'alphabet'])
        pg.click('#banc-mj .mj-go'); pg.wait_for_timeout(400)
        a = alpha(pg)
        note(a['systeme'] == 'pigpen' and a['message'] == 'MINUIT A LA GRANDE VOIX' and info['niveau'] == 4, 'e2 « La lettre secrète » : grilles des fondateurs, message « MINUIT A LA GRANDE VOIX », niveau 4', json.dumps(info['params'], ensure_ascii=False))
        pg.screenshot(path=f'{CAPT}/enquete-e2-secret.png')
        remplir(pg); pg.click('.mjs-valider'); pg.wait_for_selector('#banc-mj .mj-resultat.ok', timeout=6000)
        pg.click('#banc-mj .mj-continuer'); pg.wait_for_timeout(200)
        res = pg.evaluate('() => window.__resEnq')
        note(res and res['reussi'] and res.get('message_dechiffre') == 'MINUIT A LA GRANDE VOIX', 'e2 : gagné, le moteur reçoit reussi + message_dechiffre')
        # e3 « La devise des fondateurs »
        for essai in range(2):
            info = pg.evaluate(LANCER_ENQ, [3, 'bonus', 'devise', 'alphabet'])
            pg.click('#banc-mj .mj-go'); pg.wait_for_timeout(400)
            a = alpha(pg)
            remplir(pg); pg.click('.mjs-valider'); pg.wait_for_selector('#banc-mj .mj-resultat.ok', timeout=6000)
            pg.click('#banc-mj .mj-continuer'); pg.wait_for_timeout(200)
            note(a['message'] == 'ENSEMBLE ON EST PLUS FORTS' and info['niveau'] == 5, f"e3 « La devise des fondateurs » : niveau 5, système tiré au hasard ({a['systeme']}), gagné")
        # e1 « L'horloge de la mairie »
        info = pg.evaluate(LANCER_ENQ, [1, 'bonus', 'horloge', 'runes'])
        pg.click('#banc-mj .mj-go'); pg.wait_for_timeout(500)
        e = runes(pg)
        pg.screenshot(path=f'{CAPT}/enquete-e1-horloge.png')
        resoudre_optimal(pg)
        pg.wait_for_selector('#banc-mj .mj-resultat.ok', timeout=6000)
        note(e['image'] == 'horloge' and info['niveau'] == 3 and e['k'] == 3, f"e1 « L'horloge de la mairie » : image horloge, niveau 3 ({e['k']}×{e['k']}, {e['coups']} coups pour un minimum de {e['optimum']}), gagné")
        # ancien paramètre « symbole » toujours compris
        pg.evaluate('''() => { const d = document.getElementById('banc-mj'); d.innerHTML = ''; const p = MJ.reglages('runes', 3, {}); p.symbole = 'corbeau'; MJ.lancer(d, 'runes', p, () => {}, {sansIntro: true}); }''')
        pg.wait_for_timeout(300)
        e = runes(pg)
        note(e['image'] == 'runes' and e['symbole'] == 'corbeau', 'ancien paramètre runes « symbole » : pierre de runes du corbeau')
        er = erreurs(pg)
        note(not er, f'dist/index.html : aucune erreur console', '; '.join(er)[:200])
        pg.close()

# ======================================================================
#  Trois tailles : pas d'erreur console, rien ne déborde du cadre .mj
# ======================================================================
def test_tailles(b):
    for taille in ['tab', 'pay', 'tel']:
        pg = page(b, taille)
        for jeu in ['alphabet', 'runes']:
            for niv in [3, 10]:
                lancer(pg, jeu, niv, go=False)
                pg.wait_for_timeout(1500)       # la démo tourne
                pg.click('.mj-go'); pg.wait_for_timeout(500)
                deb = pg.evaluate('''() => {
                    const mj = document.querySelector('.mj').getBoundingClientRect();
                    const sels = ['.mjs-valider', '.mjs-clavier', '.mjs-haut', '.mjs-plateau', '.mjs-coups', '.mjs-modele'];
                    const hors = [];
                    for(const s of sels){ const e = document.querySelector(s); if(!e) continue; const r = e.getBoundingClientRect();
                        if(r.left < mj.left - 1 || r.right > mj.right + 1 || r.top < mj.top - 1 || r.bottom > mj.bottom + 1) hors.push(s); }
                    const petits = [...document.querySelectorAll('.mjs-t, .mjs-case[data-i]')].filter(e => { const r = e.getBoundingClientRect(); return r.height < 40; }).length;
                    return {hors, petits, docW: document.documentElement.scrollWidth, vw: innerWidth};
                }''')
                if jeu == 'alphabet':
                    remplir(pg); pg.click('.mjs-valider')
                else:
                    resoudre_optimal(pg)
                r = resultat(pg, 8000)
                note(r['ok'] and not deb['hors'] and deb['docW'] <= deb['vw'] and deb['petits'] == 0, f'{jeu} niveau {niv} à {TAILLES[taille]} : tout tient dans le cadre, cibles ≥ 40 px, gagné', json.dumps(deb))
                quitter(pg)
        er = erreurs(pg)
        note(not er, f'{TAILLES[taille]} : aucune erreur console', '; '.join(er)[:300])
        pg.close()

# ======================================================================
if __name__ == '__main__':
    SECTIONS = [x for x in sys.argv[1:] if x != 'rapide'] or ['alpha', 'runes', 'enquetes', 'tailles']
    with sync_playwright() as p:
        b = p.chromium.launch()
        random.seed(7)
        t0 = time.time()
        if 'alpha' in SECTIONS:
            print('— Alphabet : chaque système —')
            pg = page(b, 'tab')
            for s in SYSTEMES: test_systeme(pg, s)
            print('— Alphabet : désordre, données, mods, clavier —')
            test_desordre(pg)
            test_donnees(pg)
            test_clavier_physique(pg)
            test_mods(pg)
            if not RAPIDE: test_temps(pg)
            note(not erreurs(pg), 'salle (alphabet) : aucune erreur console', '; '.join(erreurs(pg))[:200])
            pg.close()
        if 'runes' in SECTIONS:
            print('— Runes —')
            pg = page(b, 'tab')
            for niv, im in [(1, 'runes'), (3, 'carte'), (4, 'blason'), (5, 'horloge'), (7, 'runes'), (8, 'carte'), (10, 'blason'), (10, 'horloge')]:
                test_runes_optimal(pg, niv, im)
            test_runes_hasard(pg)
            test_runes_aides(pg)
            for n, v in courbe_runes(pg).items(): print('     niveau', n, v)
            note(not erreurs(pg), 'salle (runes) : aucune erreur console', '; '.join(erreurs(pg))[:200])
            test_contrat(pg)
            pg.close()
        if 'enquetes' in SECTIONS:
            print('— Enquêtes —')
            test_enquetes(b)
        if 'tailles' in SECTIONS:
            print('— Trois tailles —')
            test_tailles(b)
        b.close()
        ko = [x for x in bilan if not x[0]]
        print(f'\n{len(bilan) - len(ko)}/{len(bilan)} vérifications réussies en {round(time.time() - t0)} s')
        for x in ko: print('  ÉCHEC :', x[1], '—', x[2])
        sys.exit(1 if ko else 0)
