"""Banc d'essai des jeux d'observation de l'Alchimiste (src/mj-observation.js), dans la salle d'entraînement.
Usage : python3 build.py && python3 test/observation/essai.py
  1. aux 3 tailles (390×844, 800×1280, 1280×800), par les vrais boutons de la salle ([data-jeu] puis .mj-go) :
     robot parfait → gagne ; robot étourdi → perd ; fin appelée exactement une fois ; aucune erreur console ;
  2. les 7 différences : les 10 décors gagnés au niveau 10 ; cueillette d'un ingrédient (« Tu as trouvé … ! ») ;
  3. le double : plan projectif d'ordre 5 et 7 vérifié carte par carte (exactement un symbole commun),
     et chaque paire montrée pendant les parties (niveaux 3 et 10) ;
  4. les insectes : niveau 8 (il faut ranger les gentils en les glissant dans le bocal) ;
     enchaînement params.ensuite = 'differences' (fin une seule fois, à la toute fin) ;
  5. contrat : après arreter(), plus de boucle d'animation et fin n'est jamais appelée (aussi pendant l'enchaînement) ;
  6. mods : aide, revele, erreurs, zone.
Résultat : test/observation/bilan.json
"""
import os, sys, json, time, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from commun import *
from robots import *

bilan = {'ok': True, 'tests': {}}
def note(nom, ok, info=''):
    bilan['tests'][nom] = {'ok': bool(ok), 'info': info}
    if not ok: bilan['ok'] = False
    print(('OK     ' if ok else 'ÉCHEC  ') + nom + ('  · ' + str(info) if info != '' else ''), flush=True)

ESPION = """() => {
  if(window.__espion) return; window.__espion = true;
  window.__finsJeu = []; window.__raf = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = f => { window.__raf++; return raf(f); };
  ['differences', 'double', 'insectes'].forEach(t => {
    const def = MJ.TYPES[t], j = def.jouer;
    def.jouer = function(el, p, fin){
      const rec = []; window.__finsJeu.push(rec);
      const r = j.call(this, el, p, res => { rec.push(res); fin(res); });
      window.__jeuEnCours = r;
      return r;
    };
  });
}"""
def fins_jeu(page):
    return page.evaluate('window.__finsJeu[window.__finsJeu.length - 1]')

ROBOT = {'differences': robot_differences, 'double': robot_double, 'insectes': robot_insectes}

def partie_salle(page, jeu, niv, mode):
    """Par les vrais boutons de la salle d'entraînement."""
    page.click('[data-niv="%d"]' % niv)
    page.click('[data-jeu="%s"]' % jeu)
    page.wait_for_selector('.mj-go')
    page.wait_for_timeout(300)
    page.click('.mj-go')
    page.wait_for_timeout(400)
    ROBOT[jeu](page, mode)
    attendre_resultat(page, 60000)
    ok = page.query_selector('.mj-resultat.ok') is not None
    titre = page.inner_text('.mj-resultat h2')
    page.wait_for_timeout(1200)
    rec = fins_jeu(page)
    page.click('.mj-continuer')
    page.wait_for_timeout(250)
    return ok, len(rec), titre, (rec[0] if rec else None)

with sync_playwright() as p:
    nav = p.chromium.launch()

    # ---------- 1. Les trois jeux aux trois tailles, par la salle ----------
    for (w, h) in TAILLES:
        err = []
        ctx, page = nouvelle_page(nav, w, h, err)
        page.evaluate(ESPION)
        boutons = page.evaluate("() => ['differences','double','insectes','loupe'].map(k => !!document.querySelector('[data-jeu=\"' + k + '\"]'))")
        note(f'{w}x{h} salle : boutons differences/double/insectes présents, loupe retirée', boutons == [True, True, True, False], boutons)
        for jeu in ['differences', 'double', 'insectes']:
            ok, nf, titre, res = partie_salle(page, jeu, 3, 'parfait')
            note(f'{w}x{h} {jeu} robot parfait gagne (niveau 3)', ok and nf == 1, f'fins={nf} « {titre} » {res and res.get("detail")}')
            ok, nf, titre, res = partie_salle(page, jeu, 3, 'etourdi')
            note(f'{w}x{h} {jeu} robot étourdi perd (niveau 3)', (not ok) and nf == 1, f'fins={nf} « {titre} » {res and res.get("detail")}')
        note(f'{w}x{h} aucune erreur console', not err, err[:3])
        ctx.close()

    err = []
    ctx, page = nouvelle_page(nav, 800, 1280, err)
    page.evaluate(ESPION)

    # ---------- 2. Les 7 différences : tous les décors, niveau 10 ; cueillette ----------
    themes = page.evaluate('Object.keys(MJ.TYPES.differences.themes)')
    note('differences : 10 décors', len(themes) == 10, themes)
    for th in themes:
        lancer(page, 'differences', 10, {}, {'theme': th})
        e = etat(page)
        robot_differences(page, 'parfait')
        attendre_resultat(page)
        ok = page.query_selector('.mj-resultat.ok') is not None
        page.wait_for_timeout(900)
        note(f'differences « {th} » niveau 10 : {len(e["diffs"])} différences, gagné', ok and len(e['diffs']) == 7 and len(fins_jeu(page)) == 1,
             sorted(set(d['sorte'] for d in e['diffs'])))
    for niv, attendu in [(1, 5), (3, 6), (6, 7)]:
        lancer(page, 'differences', niv)
        e = etat(page)
        note(f'differences niveau {niv} : {attendu} différences, {e["viesMax"]} cœurs', len(e['diffs']) == attendu, [d['sorte'] for d in e['diffs']])
        page.evaluate('window.__jeuEnCours.arreter()')
    for ingr, msg in [('champignon', 'Tu as trouvé des champignons lumineux !'), ('baies', 'Tu as trouvé des baies de sureau !'), ('Fleur de lune', 'Tu as trouvé : Fleur de lune !')]:
        lignes = lancer(page, 'differences', 4, {}, {'ingredient': ingr} if ingr != 'champignon' else {'ingredient': ingr, 'theme': 'cave'}, go=False)
        consigne = page.inner_text('.mj-consigne')
        intro_ok = page.evaluate("() => [...document.querySelectorAll('.mj-reglages li')].some(l => l.textContent.includes('À cueillir'))")
        page.click('.mj-go'); page.wait_for_timeout(400)
        e = etat(page)
        robot_differences(page, 'parfait')
        attendre_resultat(page)
        titre = page.inner_text('.mj-resultat h2')
        page.wait_for_timeout(900)
        note(f'differences cueillette « {ingr} » (décor {e["theme"]}, {e["ingrNb"]} dans la scène)', titre == msg and intro_ok and e['ingrNb'] >= 2, f'« {titre} » · « {consigne[:60]}… »')

    # ---------- 3. Le double : plan projectif ----------
    plan = page.evaluate("""() => {
      const out = {};
      for(const q of [5, 7]){
        const c = MJ.TYPES.double.plan(q);
        let paires = 0, mauvaises = 0, tailles = new Set(c.map(x => x.length)), doublons = c.some(x => new Set(x).size !== x.length);
        const pts = new Set(); c.forEach(x => x.forEach(v => pts.add(v)));
        for(let i = 0; i < c.length; i++) for(let j = i + 1; j < c.length; j++){ paires++; if(c[i].filter(v => c[j].includes(v)).length !== 1) mauvaises++; }
        out[q] = {cartes:c.length, paires:paires, mauvaises:mauvaises, tailles:[...tailles], doublons:doublons, symboles:pts.size};
      }
      const ids = MJ.TYPES.double.symboles.map(s => s.id);
      out.symboles = {n:ids.length, uniques:new Set(ids).size};
      return out;
    }""")
    for q, nb in [('5', 31), ('7', 57)]:
        r = plan[q]
        note(f'double : plan d\'ordre {q} → {r["cartes"]} cartes de {r["tailles"]} symboles, {r["paires"]} paires, toutes avec exactement 1 symbole commun',
             r['cartes'] == nb and r['mauvaises'] == 0 and r['tailles'] == [int(q) + 1] and not r['doublons'] and r['symboles'] == nb, r)
    note('double : 57 symboles dessinés, tous différents', plan['symboles'] == {'n': 57, 'uniques': 57}, plan['symboles'])
    for niv in [3, 10]:
        verifs = []
        lancer(page, 'double', niv)
        robot_double(page, 'parfait', verifs=verifs)
        attendre_resultat(page)
        ok = page.query_selector('.mj-resultat.ok') is not None
        page.wait_for_timeout(900)
        bons = all(v[0] == 1 and v[1] == 1 and v[2] == v[3] and v[4] == v[5] for v in verifs)
        note(f'double niveau {niv} : {len(verifs)} paires montrées, chacune avec exactement 1 symbole commun ({verifs[0][3] if verifs else "?"} symboles par carte), gagné', ok and bons and len(fins_jeu(page)) == 1)

    # ---------- 4. Les insectes : ranger (niveau 8), enchaînement ----------
    journal = []
    lignes = lancer(page, 'insectes', 8)
    robot_insectes(page, 'parfait', journal=journal)
    attendre_resultat(page)
    ok = page.query_selector('.mj-resultat.ok') is not None
    page.wait_for_timeout(1300)
    rec = fins_jeu(page)
    note('insectes niveau 8 : robot parfait écrase les mauvais et range les gentils dans le bocal (glisser)', ok and len(rec) == 1 and sum(1 for j in journal if j.startswith('rangé')) >= 1,
         f'{sum(1 for j in journal if j.startswith("splat"))} écrasés, {sum(1 for j in journal if j.startswith("rangé"))} rangés · {rec[0]["detail"] if rec else ""}')
    for (w, h) in [(800, 1280), (390, 844)]:
        page.set_viewport_size({'width': w, 'height': h})
        journal = []
        lancer(page, 'insectes', 4, {}, {'ensuite': 'differences'})
        robot_insectes(page, 'parfait', journal=journal, bonus=True)
        attendre_resultat(page)
        ok = page.query_selector('.mj-resultat.ok') is not None
        page.wait_for_timeout(1500)
        rec = fins_jeu(page)
        res = rec[0] if rec else {}
        note(f'{w}x{h} insectes + ensuite:differences : insectes puis 7 différences du labo, fin une seule fois', ok and len(rec) == 1 and 'differences' in journal and 'etapes' in res and res['etapes']['differences']['reussi'],
             res.get('detail', ''))
    page.set_viewport_size({'width': 800, 'height': 1280})

    # ---------- 5. Contrat arreter() ----------
    for jeu, extra in [('differences', {'duree': 2}), ('double', {'duree': 2}), ('insectes', {'duree': 2})]:
        lancer(page, jeu, 5, {}, extra)
        page.wait_for_timeout(900)
        page.evaluate('window.__jeuEnCours.arreter()')
        page.wait_for_timeout(200)
        r0 = page.evaluate('window.__raf')
        page.wait_for_timeout(3000)
        r1 = page.evaluate('window.__raf')
        rec = fins_jeu(page)
        note(f'{jeu} : après arreter(), plus de boucle (rAF +{r1 - r0}) et fin jamais appelée', r1 == r0 and len(rec) == 0)
    lancer(page, 'insectes', 2, {}, {'ensuite': 'differences', 'mauvais': 1, 'ecran': 1})
    t0 = time.time()
    while time.time() - t0 < 30 and not page.query_selector('.mjo-transition'):
        e = etat(page)
        if e and e['jeu'] == 'insectes':
            for b in e['insectes']:
                if not b['bon']: page.mouse.click(b['x'], b['y']); break
        page.wait_for_timeout(100)
    trans = page.query_selector('.mjo-transition') is not None
    page.evaluate('window.__jeuEnCours.arreter()')
    page.wait_for_timeout(3500)
    rec = fins_jeu(page)
    note('insectes : arreter() pendant l\'enchaînement → pas d\'étape différences, fin jamais appelée', trans and len(rec) == 0 and not page.query_selector('.mjo-diff'))

    # ---------- 6. Mods ----------
    lancer(page, 'differences', 5, {'aide': 2, 'revele': True, 'erreurs': 2, 'zone': 1.3})
    e = etat(page)
    base = page.evaluate("MJ.reglages('differences', 5, {}).vies")
    nb_sc = page.evaluate("document.querySelectorAll('.mjo-scint').length")
    page.click('.mjo-indice'); page.wait_for_timeout(200)
    ind = page.evaluate("document.querySelectorAll('.mjo-indice-rond').length")
    note('differences mods : aide (💡 montre une différence sur les 2 images), revele (scintillements), erreurs (+2 cœurs)', ind == 2 and nb_sc == 2 * len(e['diffs']) and e['viesMax'] == base + 2, f'indice={ind} scint={nb_sc} cœurs={e["viesMax"]} (base {base})')
    page.evaluate('window.__jeuEnCours.arreter()')
    lancer(page, 'double', 5, {'aide': 1, 'erreurs': 1, 'temps': 10})
    page.wait_for_timeout(500)
    page.click('.mjo-indice'); page.wait_for_timeout(200)
    nb = page.evaluate("document.querySelectorAll('.mjo-sym.indice').length")
    bouc = page.evaluate("document.querySelectorAll('.mjo-coeur.bouclier').length")
    note('double mods : aide (le symbole commun brille sur les 2 cartes), erreurs (+1 bouclier)', nb == 2 and bouc == 1, f'indice={nb} boucliers={bouc}')
    page.evaluate('window.__jeuEnCours.arreter()')
    lancer(page, 'insectes', 5, {'aide': 1, 'revele': True})
    page.wait_for_timeout(300)
    rv = page.evaluate("document.querySelectorAll('.mjo-ins.mauvais .mjo-revele').length")
    page.click('.mjo-indice'); page.wait_for_timeout(200)
    ind = page.evaluate("document.querySelectorAll('.mjo-indice-ins').length")
    note('insectes mods : revele (rond rouge sur les mauvais), aide (un mauvais est montré)', rv >= 1 and ind == 1, f'revele={rv} indice={ind}')
    page.evaluate('window.__jeuEnCours.arreter()')
    lent = page.evaluate("[MJ.reglages('insectes', 5, {}).vitesse, MJ.reglages('insectes', 5, {lent:0.8}).vitesse, MJ.reglages('differences', 5, {}).duree, MJ.reglages('differences', 5, {temps:10}).duree]")
    note('mods lent / temps : insectes plus lents, sablier plus long', lent[1] < lent[0] and lent[3] == lent[2] + 10, lent)
    note('800x1280 : aucune erreur console (tests 2 à 6)', not err, err[:3])
    ctx.close()
    nav.close()

json.dump(bilan, open(os.path.join(ICI, 'bilan.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('\nBILAN :', 'tout est bon' if bilan['ok'] else 'ÉCHECS', '·', sum(1 for t in bilan['tests'].values() if t['ok']), '/', len(bilan['tests']))
