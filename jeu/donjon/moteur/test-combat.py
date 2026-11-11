"""Les combats du donjon à l'écran : python3 test-combat.py [salle …]   (sous le verrou : flock /tmp/brumeval-pw.lock …)

Pour chaque salle de combat (toutes par défaut), sur une tablette 1024 x 768 au doigt :
  - le combat se charge, les héros et les bêtes entrent, la bande s'ouvre ;
  - un joueur au hasard joue par l'écran (un héros, un geste permis, une cible permise) pendant 3 tours au plus ;
  - à chaque fois que le jeu rend la main : ce que montre l'écran (barres de vie, bêtes vivantes, zones à toucher) est
    comparé à la photo des règles ; un geste refusé affiche bien son mot ;
  - puis on fuit (le bouton « Fuite ! », la question, « On fait le point », « Repartir ») ;
  - aucune erreur JavaScript, aucun avertissement d'animation, aucune lecture vocale sans bouton 🔊.
Une capture par salle dans captures/."""
import os, sys, json, random
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
SALLES = [a for a in sys.argv[1:] if not a.startswith('-')] or ['rats', 'canaux', 'egouts', 'toiles', 'atelier', 'crypte', 'ossuaire', 'bassin']
SACS = {'rats': 'feu,huile,baume', 'canaux': 'colle,feu,baume', 'egouts': 'feu,huile,colle', 'toiles': 'fumigene,huile,feu', 'atelier': 'acide,feu,baume',
        'crypte': 'colle,fumigene,coeur', 'ossuaire': 'fumigene,colle,baume', 'bassin': 'feu,fumigene,baume'}
ERREURS, OK = [], []


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


def salle(nav, s, graine):
    print('—', s)
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error', 'warning') else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
    # depuis le 10 novembre : toutes les potions, et le Pisteur porte ses deux carquois (il choisit sa flèche)
    pg.goto(PAGE + '?combat=' + s + '&graine=' + str(graine) + '&potions=toutes&objets=pisteur:fleches-argent,pisteur:fleches-lourdes&vitesse=2')
    rnd = random.Random(graine)

    def etat():
        return pg.evaluate("() => { var e = DJ.Combat.etat(); return e ? {mode:e.mode, occupe:e.occupe, tour:e.tour, res:e.resultat} : null; }")

    def libre(max_ms=90000):
        t = 0
        while t < max_ms:
            e = etat()
            if e and ((e['mode'] == 'qui' and not e['occupe']) or e['mode'] == 'fin'):
                pg.wait_for_timeout(250); return etat()
            pg.wait_for_timeout(200); t += 200
        return etat()

    e = libre()
    verifie(bool(e) and e['mode'] == 'qui' and e['tour'] == 1, f'{s} : le combat s\'ouvre, tour 1, aux héros')
    pg.screenshot(path=os.path.join(CAP, f'combat-{s}-1.png'))

    def accord():
        return pg.evaluate("""() => { var E = DJ.Combat._E(), ph = E.c.etat(), pb = [];
          ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var b = document.querySelector('#pv-' + h + ' b'); if(!b || +b.textContent !== ph.heros[h].pv) pb.push(h + ' ' + (b && b.textContent) + '≠' + ph.heros[h].pv); });
          ph.betes.forEach(function(b){ var e = document.querySelector('#pv-' + b.id + ' b'), z = document.querySelector('#zone-' + b.id);
            if(b.mort){ if(z) pb.push(b.id + ' morte mais encore touchable'); return; }
            if(!e || +e.textContent !== b.pv) pb.push(b.id + ' ' + (e && e.textContent) + '≠' + b.pv);
            if(!z) pb.push(b.id + ' sans zone'); else { var r = z.getBoundingClientRect(); if(r.width < 40 || r.height < 40) pb.push(b.id + ' zone trop petite'); }
            var a = E.A.b[b.id]; if(a && !a.rat && a.acteur.etatCourant){ var cur = a.acteur.etatCourant();
              Object.keys(cur).forEach(function(n){ if(cur[n] && n !== 'cible' && n !== 'ouvert' && n !== 'avale' && !(n in b.etats)) pb.push(b.id + ' montre un état en trop : ' + n); });
              if(!!cur.ouvert !== !!b.ouvert) pb.push(b.id + ' point faible : écran ' + !!cur.ouvert + ', règles ' + !!b.ouvert); }
          });
          return pb; }""")

    verifie(not accord(), f'{s} : au départ, l\'écran montre ce que disent les règles ' + str(accord()))
    # (10 novembre : les héros ne s'animaient plus quand leur geste visait une bête — on compte les gestes animés)
    pg.evaluate("""() => { var E = DJ.Combat._E(); window.__anim = {};
      ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var a = E.A.h[h];
        ['tirer', 'dague', 'preparer', 'lancer', 'louche', 'herbes', 'sort', 'eclairSalle', 'bouclier', 'etudier'].forEach(function(m){ var f = a[m]; if(typeof f !== 'function') return;
          a[m] = function(){ window.__anim[h] = (window.__anim[h] || 0) + 1; return f.apply(a, arguments); }; }); }); }""")
    immobiles = []
    tours = 0
    while True:
        e = etat()
        if not e or e['mode'] == 'fin' or e['tour'] > 3:
            break
        # un héros qui peut jouer, un geste permis, une cible permise (tout par l'écran)
        choix = pg.evaluate("""() => { var E = DJ.Combat._E(), l = E.c.aJouer(), o = [];
          l.forEach(function(h){ E.c.gestes(h).forEach(function(g){ if(g.permis) o.push({h:h, g:g.geste, vise:g.vise, cibles:g.cibles || [], max:g.max || 1}); }); });
          return o; }""")
        if not choix:
            pg.wait_for_timeout(500); libre(); continue
        c = rnd.choice(choix)
        pg.evaluate("(h) => { window.__anim[h] = 0; }", c['h'])
        pg.tap(f'.b-heros[data-id="{c["h"]}"]', force=True); pg.wait_for_timeout(200)
        pg.tap(f'.carte[data-id="{c["g"]}"]', force=True); pg.wait_for_timeout(200)
        if c['vise'] in ('salle', 'equipe'):
            sel = '.zone[data-type="bete"]' if c['vise'] == 'salle' else '.zone[data-type="heros"]'
            pg.eval_on_selector(sel, 'e => e.click()')
        else:
            n = min(c['max'], len(c['cibles'])) or 1
            for cible in rnd.sample(c['cibles'], n):
                if cible in ('sage', 'alchimiste', 'pisteur'):
                    pg.tap(f'.zone[data-type="heros"][data-id="{cible}"]', force=True)
                else:
                    pg.eval_on_selector('#zone-' + cible, 'e => e.click()')
                pg.wait_for_timeout(150)
        pg.wait_for_timeout(300)
        e2 = libre()
        if c['g'] != 'chatouiller' and not pg.evaluate("(h) => window.__anim[h] || 0", c['h']):
            immobiles.append(c['h'] + ' ' + c['g'])
        pb = accord()
        if pb:
            verifie(False, f'{s} : après {c["h"]} {c["g"]}, l\'écran et les règles ne disent pas pareil : {pb}')
        tours = e2['tour'] if e2 else tours
    verifie(True, f'{s} : {tours} tours joués au hasard sans blocage')
    verifie(not immobiles, f'{s} : le héros s\'anime à chaque geste' + (' — immobile pour : ' + ', '.join(immobiles[:5]) if immobiles else ''))
    pg.screenshot(path=os.path.join(CAP, f'combat-{s}-2.png'))
    e = etat()
    if e and e['mode'] != 'fin':
        # un refus : un héros qui a déjà joué (ou le premier) puis on fuit
        pg.tap('#fuite', force=True); pg.wait_for_timeout(300)
        verifie(pg.evaluate("() => !!document.querySelector('#fenetre [data-act=\"fuir\"]')"), f'{s} : « Fuite ! » demande d\'abord')
        pg.tap('#fenetre [data-act="fuir"]', force=True)
    try:
        pg.wait_for_selector('#fin [data-act="combat-fin"]', timeout=40000)
        fini = True
    except Exception:
        fini = False
    verifie(fini, f'{s} : la fin s\'affiche (victoire ou « On fait le point »)')
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(CAP, f'combat-{s}-3.png'))
    sans_lire = pg.evaluate("""() => { var pb = []; document.querySelectorAll('#fin .livre-l, #fin .bulle, #fin h1, #fin .rats-l').forEach(function(e){
        var t = e.textContent.replace(/🔊/g, '').trim(); if(t.split(/\\s+/).length > 3 && !e.querySelector('.lire')) pb.push(t.slice(0, 30)); }); return pb; }""") if fini else []
    verifie(not sans_lire, f'{s} : chaque texte de la fin a son 🔊 ' + str(sans_lire))
    if fini:
        pg.tap('#fin [data-act="combat-fin"]', force=True); pg.wait_for_timeout(500)
        verifie(pg.evaluate("() => window.RESULTAT") in ('victoire', 'fuite', 'defaite'), f'{s} : le combat rend son résultat ({pg.evaluate("() => window.RESULTAT")})')
    verifie(pg.evaluate('window.__parle') == 0, f'{s} : aucune lecture vocale toute seule')
    errs = [x for x in errs if 'fonts.g' not in x and 'ERR_' not in x]
    verifie(not errs, f'{s} : aucune erreur ni avertissement JavaScript' + (' — ' + ' | '.join(sorted(set(errs))[:4]) if errs else ''))
    ctx.close()


def oeil(nav):
    """Romain, 11 novembre : la rune de l'œil remplace « Étudier ». Sans elle, personne ne sait qui sera frappé ; avec elle,
    chaque monstre montre sa proie et ses dégâts, pour ce tour et le suivant. Les élites et le boss préparent un gros coup :
    tout le monde le voit se préparer, seul l'œil dit sur qui ; le bouclier en arrête 75 %."""
    print('— la rune de l\'œil, le coup qui se prépare, le bouclier à 75 %')
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
    pg.goto(PAGE + '?combat=atelier&graine=5&potions=toutes&vitesse=3')

    def libre():
        pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=90000, polling=200)
        pg.wait_for_timeout(300)

    def joue(h, g, cible=None):
        pg.tap(f'.b-heros[data-id="{h}"]', force=True); pg.wait_for_timeout(200)
        pg.tap(f'.carte[data-id="{g}"]', force=True); pg.wait_for_timeout(200)
        if cible in ('sage', 'alchimiste', 'pisteur'):
            pg.tap(f'.zone[data-type="heros"][data-id="{cible}"]', force=True)
        elif cible:
            pg.eval_on_selector('#zone-' + cible, 'e => e.click()')
        else:
            pg.eval_on_selector('.zone[data-type="bete"]', 'e => e.click()')
        pg.wait_for_timeout(400); libre()

    # ce que l'écran montre au-dessus des monstres, et ce que disent les règles
    VUE = """() => { var E = DJ.Combat._E(), ph = E.c.etat(), o = {tour:ph.tour, vu:ph.vu, betes:{}, cartes:[]};
      ph.betes.forEach(function(b){ if(b.mort) return; var e = document.querySelector('#badges-' + b.id), a = E.A.b[b.id];
        o.betes[b.id] = {type:b.type, prepare:b.prepare, vise:b.vise, suite:b.suite, tetes:e.querySelectorAll('.vise').length, lignes:e.querySelectorAll('.vise-bloc').length,
          degats:[].map.call(e.querySelectorAll('.vise-dg'), function(x){ return x.textContent; }), sablier:e.querySelectorAll('.vise-bloc.elan').length,
          pastille:(e.querySelector('.etat.e-coup') || {}).textContent || '', pret:!!e.querySelector('.etat.e-coup.pret'), rond:a.el.classList.contains('prepare')}; });
      return o; }"""
    libre()
    v = pg.evaluate(VUE)
    gardien = [k for k in v['betes'] if v['betes'][k]['type'] == 'gardien'][0]
    verifie(v['vu'] == 0 and all(b['tetes'] == 0 and b['lignes'] == 0 for b in v['betes'].values()), 'œil : au départ, personne ne sait qui sera frappé (aucune tête au-dessus des monstres)')
    verifie(not pg.evaluate("() => !!document.querySelector('.b-livre')"), 'plus de bouton « Journal » dans le donjon (le carnet est sur la tablette du Sage)')
    pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(250)
    cartes = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .carte'), function(c){ return c.getAttribute('data-id') + ':' + c.querySelector('b').textContent; })")
    verifie(cartes[:3] == ['oeil:Rune de l\'œil', 'rune:Rune de lumière', 'bouclier:Bouclier'] or cartes[0].startswith('oeil:'), 'le Sage a la rune de l\'œil à la place d\'« Étudier » ' + str(cartes[:3]))
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-0.png'))
    pg.tap('.b-retour', force=True); pg.wait_for_timeout(200)

    # tour 1 : l'œil — ce tour et le suivant
    joue('sage', 'oeil')
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    ok1 = v['vu'] == 2 and all(b['lignes'] >= 1 and b['vise'] and b['degats'] and b['degats'][0] == '−' + str(b['vise']['degats']) for b in v['betes'].values())
    verifie(ok1, 'œil : chaque monstre montre sa proie et ses dégâts de ce tour ' + str({k: b['degats'] for k, b in v['betes'].items()}))
    verifie(g['suite'] and g['suite']['attaque'] == 'marteau' and g['suite']['prepare'] and g['lignes'] == 2 and g['sablier'] == 1, 'œil : et le tour suivant — le Gardien prendra son élan (un sablier, sa proie)')
    proie = g['suite']['cibles'][0]
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-1.png'))
    pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(200)
    verifie(pg.evaluate("() => DJ.Combat.etat().mode") == 'qui', 'le Sage a joué : il ne rejoue pas ce tour-ci')
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('alchimiste', 'herbes', 'pisteur'); joue('pisteur', 'fleche', b0)

    # tour 2 : l'élan, visible de tous
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(v['tour'] == 2 and g['prepare'] == 1 and 'gros coup bientôt' in g['pastille'] and not g['pret'] and g['rond'], 'tour 2 : le Gardien prépare un gros coup, tout le monde le voit (pastille « ' + g['pastille'] + ' », rond rouge)')
    verifie(v['vu'] == 1 and g['vise']['prepare'] and g['vise']['cibles'] == [proie] and g['sablier'] == 1 and not g['degats'], 'tour 2 : l\'œil d\'avant montre encore sa proie (' + proie + '), avec un sablier, sans dégâts')
    mots = pg.evaluate("() => { var E = DJ.Combat._E(), g = E.c.gestes('sage').filter(function(x){ return x.geste === 'oeil'; })[0]; return g.permis; }")
    verifie(mots, 'tour 2 : le Sage peut relancer la rune de l\'œil (elle ne montrait plus que ce tour)')
    joue('sage', 'oeil')
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(v['vu'] == 2 and g['lignes'] == 1 and g['degats'] == ['−85'] and g['suite']['cibles'] == [proie], 'tour 2, œil relancé : une seule ligne — la proie, le sablier, puis −85')
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-2.png'))
    refuse = pg.evaluate("() => { var E = DJ.Combat._E(); E.c.h.sage.joue = false; var g = E.c.gestes('sage').filter(function(x){ return x.geste === 'oeil'; })[0]; E.c.h.sage.joue = true; return [g.permis, g.mot]; }")
    verifie(refuse == [False, 'Déjà vu !'], 'la rune de l\'œil ne se relance pas tant qu\'elle montre déjà le tour suivant (« Déjà vu ! »)')
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('alchimiste', 'herbes', 'pisteur'); joue('pisteur', 'fleche', b0)

    # tour 3 : le coup tombe à la fin du tour ; le bouclier en arrête 75 %
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(v['tour'] == 3 and g['prepare'] == 2 and g['pret'] and 'gros coup' in g['pastille'] and g['degats'] == ['−85'] and g['vise']['cibles'] == [proie], 'tour 3 : « ' + g['pastille'].strip() + ' », −85 sur ' + proie)
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-3.png'))
    pv0 = pg.evaluate("(h) => DJ.Combat._E().c.h[h].pv", proie)
    autres = pg.evaluate("(h) => { var E = DJ.Combat._E(), t = 0; E.c.etat().betes.forEach(function(b){ if(!b.mort && b.type !== 'gardien' && b.vise && b.vise.cibles.indexOf(h) >= 0) t += Math.ceil(b.vise.degats * b.vise.fois * 0.25); }); return t; }", proie)
    joue('sage', 'bouclier', proie)
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('alchimiste', 'herbes', 'sage' if proie != 'sage' else 'pisteur'); joue('pisteur', 'fleche', b0)
    pv1 = pg.evaluate("(h) => DJ.Combat._E().c.h[h].pv", proie)
    ecran = pg.evaluate("(h) => +document.querySelector('#pv-' + h + ' b').textContent", proie)
    verifie(pv0 - pv1 == 22 + autres and ecran == pv1, f'le marteau tombe sur {proie} : 85 → 22 derrière le bouclier ({pv0} → {pv1}), et l\'écran dit pareil')
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(g['prepare'] == 0 and not g['pastille'] and not g['rond'], 'après le coup : plus de pastille, plus de rond rouge')
    verifie(v['vu'] == 0 and all(b['tetes'] == 0 for b in v['betes'].values()), 'tour 4 : l\'œil s\'est refermé, plus aucune tête au-dessus des monstres')
    verifie(pg.evaluate('window.__parle') == 0 and not errs, 'œil : pas de lecture vocale toute seule, pas d\'erreur ' + str(errs[:2]))
    ctx.close()


def huile(nav):
    """Romain, 11 novembre : « s'il se prend une toile, l'Alchimiste peut lui balancer de l'huile et ça le libère. »"""
    print('— l\'huile libère un ami pris dans une toile')
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))

    def libre():
        pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=90000, polling=200)
        pg.wait_for_timeout(300)

    def joue(h, g, cible=None):
        pg.tap(f'.b-heros[data-id="{h}"]', force=True); pg.wait_for_timeout(200)
        pg.tap(f'.carte[data-id="{g}"]', force=True); pg.wait_for_timeout(200)
        if cible in ('sage', 'alchimiste', 'pisteur'):
            pg.tap(f'.zone[data-type="heros"][data-id="{cible}"]', force=True)
        elif cible:
            pg.eval_on_selector('#zone-' + cible, 'e => e.click()')
        else:
            pg.eval_on_selector('.zone[data-type="bete"]', 'e => e.click()')
        pg.wait_for_timeout(400); libre()

    pris = None
    for graine in range(5, 12):
        # l'araignée lance sa toile au premier tour : on cherche une graine où ce n'est pas l'Alchimiste qui la prend
        pg.goto(PAGE + f'?combat=toiles&graine={graine}&potions=toutes&vitesse=3'); libre()
        joue('sage', 'oeil')
        pris = pg.evaluate("() => { var b = DJ.Combat._E().c.etat().betes.filter(function(x){ return x.type === 'araignee'; })[0]; return b.vise && b.vise.attaque === 'toile' ? b.vise.cibles[0] : null; }")
        if pris and pris != 'alchimiste':
            break
    verifie(pris in ('pisteur', 'sage'), f'huile : l\'œil montre qui l\'araignée va entoiler ({pris}, graine {graine})')
    verifie(pg.evaluate("() => { var e = document.querySelector('.vise-bloc .vise-ic'); return !!e && e.textContent === '🕸️'; }"), 'huile : la toile se voit à côté de la proie (🕸️)')
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('alchimiste', 'herbes', 'pisteur'); joue('pisteur', 'fleche', b0)
    e = pg.evaluate("(h) => { var E = DJ.Combat._E(); return {entoile:E.c.h[h].entoile, aJouer:E.c.aJouer()}; }", pris)
    verifie(e['entoile'] and pris not in e['aJouer'], f'huile : au tour 2, {pris} est pris dans la toile (il passerait son tour)')
    pg.tap('.b-heros[data-id="alchimiste"]', force=True); pg.wait_for_timeout(250)
    pg.tap('.carte[data-id="p:huile"]', force=True); pg.wait_for_timeout(300)
    verifie(pg.evaluate("(h) => { var E = DJ.Combat._E(); return E.geste.cibles.indexOf(h) >= 0 && document.querySelector('.h-' + h).classList.contains('dispo'); }", pris), 'huile : la carte « Huile » choisie, l\'ami entoilé porte le rond jaune (on peut la lui lancer)')
    pg.screenshot(path=os.path.join(CAP, 'combat-huile-1.png'))
    pg.tap(f'.zone[data-type="heros"][data-id="{pris}"]', force=True); pg.wait_for_timeout(400); libre()
    e = pg.evaluate("(h) => { var E = DJ.Combat._E(); return {entoile:E.c.h[h].entoile, aJouer:E.c.aJouer(), alch:E.c.h.alchimiste.joue}; }", pris)
    verifie(not e['entoile'] and pris in e['aJouer'] and e['alch'], f'huile : {pris} est libéré, et il peut jouer ce tour-ci')
    pg.screenshot(path=os.path.join(CAP, 'combat-huile-2.png'))
    verifie(not errs, 'huile : aucune erreur JavaScript ' + str(errs[:2]))
    ctx.close()


def potions(nav):
    """Romain, 10 novembre : plus de sac à choisir (toutes les potions) ; le Pisteur porte tous ses carquois et choisit sa flèche."""
    print('— toutes les potions, le choix des flèches')
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.goto(PAGE + '?combat=toiles&graine=5&potions=toutes&objets=pisteur:fleches-argent,pisteur:fleches-lourdes&vitesse=3')

    def libre():
        pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=90000, polling=200)
        pg.wait_for_timeout(250)
    MESURE = """() => { var b = document.querySelector('#bande').getBoundingClientRect(), l = {left:b.right, right:b.right}, o = {ids:[], dehors:[], petites:[]};
      document.querySelectorAll('#bande .carte').forEach(function(c){ var r = c.getBoundingClientRect(), id = c.getAttribute('data-id'); o.ids.push(id); if(c.classList.contains('mini')) o.petites.push(id);
        if(r.right > l.left + 1 || r.bottom > b.bottom + 1 || r.left < b.left) o.dehors.push(id);
        var t = c.querySelector('b'); if(t && t.scrollWidth > c.clientWidth + 1) o.dehors.push(id + ' (nom coupé)'); });
      o.journal = l.right <= b.right + 1 && l.left >= b.left; return o; }"""
    libre()
    pg.tap('.b-heros[data-id="alchimiste"]', force=True); pg.wait_for_timeout(300)
    m = pg.evaluate(MESURE)
    verifie(m['petites'] == ['p:feu', 'p:fumigene', 'p:huile', 'p:colle', 'p:acide', 'p:baume', 'p:coeur', 'p:givre', 'p:baumelum'], f'l\'Alchimiste a ses 9 potions sous la main, toutes visibles ({len(m["petites"])})')
    verifie(not m['dehors'] and m['journal'], 'les cartes tiennent toutes dans la bande ' + str(m['dehors']))
    pg.tap('.carte[data-id="p:fumigene"]', force=True); pg.wait_for_timeout(250)
    verifie(pg.evaluate("() => document.querySelector('.b-lbl.dit').textContent") == 'un gros nuage' and pg.evaluate("() => document.querySelector('.carte[data-id=\"p:fumigene\"]').classList.contains('choisie')"), 'la potion choisie dit ce qu\'elle fait, en trois mots')
    pg.screenshot(path=os.path.join(CAP, 'combat-potions.png'))
    pg.tap('.b-retour', force=True); pg.wait_for_timeout(250)
    pg.tap('.b-heros[data-id="pisteur"]', force=True); pg.wait_for_timeout(300)
    m = pg.evaluate(MESURE)
    verifie(m['ids'][:2] == ['fleche', 'dague'] and m['petites'] == ['f:fleches-argent', 'f:fleches-lourdes', 'p:feu', 'p:huile', 'p:colle', 'p:acide', 'p:givre'], 'le Pisteur choisit sa flèche : la normale, celle de lune, la transperçante, ou une flèche trempée ' + str(m['petites']))
    verifie(not m['dehors'] and m['journal'], 'les cartes du Pisteur tiennent dans la bande ' + str(m['dehors']))
    pg.screenshot(path=os.path.join(CAP, 'combat-fleches.png'))
    # le défaut de la flèche transperçante : elle passe à travers une bête de brume
    f = pg.evaluate("() => { var E = DJ.Combat._E(), m = E.c.vivants().filter(function(x){ return x.type === 'feufollet'; })[0]; return {id:m.id, pv:m.pv}; }")
    pg.tap('.carte[data-id="f:fleches-lourdes"]', force=True); pg.wait_for_timeout(200)
    pg.eval_on_selector('#zone-' + f['id'], 'e => e.click()')
    pg.wait_for_timeout(600); libre()
    r = pg.evaluate("(id) => { var E = DJ.Combat._E(), m = E.c.bete(id); return {pv:m.pv, joue:E.c.h.pisteur.joue}; }", f['id'])
    verifie(r['pv'] == f['pv'] and r['joue'], 'la flèche transperçante passe à travers le feu follet : rien, et le tour du Pisteur est joué')
    verifie(not errs, 'potions et flèches : aucune erreur JavaScript ' + str(errs[:2]))
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    if not SALLES or 'toiles' in SALLES or len(sys.argv) < 2:
        try:
            potions(nav)
        except Exception as ex:
            verifie(False, f'potions : le test s\'arrête ({str(ex)[:200]})')
    if not SALLES or 'atelier' in SALLES or len(sys.argv) < 2:
        try:
            oeil(nav)
        except Exception as ex:
            verifie(False, f'œil : le test s\'arrête ({str(ex)[:200]})')
    if not SALLES or 'toiles' in SALLES or len(sys.argv) < 2:
        try:
            huile(nav)
        except Exception as ex:
            verifie(False, f'huile : le test s\'arrête ({str(ex)[:200]})')
    for k, s in enumerate(SALLES):
        try:
            salle(nav, s, 11 + k)
        except Exception as ex:
            verifie(False, f'{s} : le test s\'arrête ({str(ex)[:200]})')
    nav.close()
print(f'\n{len(OK)} vérifications réussies, {len(ERREURS)} échecs')
for x in ERREURS:
    print('  ✗', x)
sys.exit(1 if ERREURS else 0)
