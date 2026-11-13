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


def carte(pg, g):
    """Toucher la carte d'un geste. Pour le Sage, le sort dépend du bâton en main (11 novembre, 16 h 37) : si la carte n'est
    pas dans la bande, on prend d'abord le bâton qu'il faut (« a:<bâton> » : ce bâton ; sinon le bâton normal)."""
    if not pg.query_selector(f'#bande .carte[data-id="{g}"]'):
        pg.tap('#bande [data-act="arme"][data-id="%s"]' % (g[2:] if g.startswith('a:') else 'baton'), force=True); pg.wait_for_timeout(200)
    pg.tap(f'#bande .carte[data-id="{g}"]', force=True); pg.wait_for_timeout(200)


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
        carte(pg, c['g'])
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
        carte(pg, g)
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
    cartes = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .b-combos .carte'), function(c){ return c.getAttribute('data-id') + ':' + c.querySelector('b').textContent; })")
    verifie(cartes == ['oeil:Rune de l\'œil', 'rune:Rune de lumière', 'bouclier:Bouclier de runes', 'appel:Rune d\'appel'], 'les quatre sorts du Sage : l\'œil, la lumière, le bouclier, l\'appel ' + str(cartes))
    seul = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .b-armes .carte'), function(c){ return c.getAttribute('data-id') + (c.classList.contains('enmain') ? '*' : ''); })")
    verifie(seul == ['baton*'], 'sans bâton trouvé : à gauche, son bâton normal, en main ' + str(seul))
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-0.png'))
    pg.tap('.b-retour', force=True); pg.wait_for_timeout(200)

    # tour 1 : l'œil — ce tour et le suivant
    joue('sage', 'oeil')
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    ok1 = v['vu'] == 2 and all(b['lignes'] >= 1 and b['vise'] and b['degats'] and b['degats'][0] == '−' + str(b['vise']['degats']) for b in v['betes'].values())
    verifie(ok1, 'œil : chaque monstre montre sa proie et ses dégâts de ce tour ' + str({k: b['degats'] for k, b in v['betes'].items()}))
    verifie(g['suite'] and g['suite']['attaque'] == 'marteau' and g['suite']['prepare'] and all(b['lignes'] == 1 for b in v['betes'].values()) and g['sablier'] == 0, 'œil : UNE SEULE ligne par monstre, celle de ce tour (Romain, 11 novembre : « une seule ligne, ça suffit ») — le tour suivant n\'est plus affiché')
    proie = g['suite']['cibles'][0]
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-1.png'))
    pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(200)
    verifie(pg.evaluate("() => DJ.Combat.etat().mode") == 'qui', 'le Sage a joué : il ne rejoue pas ce tour-ci')
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('alchimiste', 'herbes', 'pisteur'); joue('pisteur', 'fleche', b0)

    # tour 2 : l'élan, visible de tous ; l'œil, lancé une seule fois, montre toujours ce tour et le suivant (Romain, 16 h 07)
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(v['tour'] == 2 and g['prepare'] == 1 and 'gros coup bientôt' in g['pastille'] and not g['pret'] and g['rond'], 'tour 2 : le Gardien prépare un gros coup, tout le monde le voit (pastille « ' + g['pastille'] + ' », rond rouge)')
    verifie(v['vu'] == 2 and g['vise']['prepare'] and g['vise']['cibles'] == [proie] and g['lignes'] == 1 and g['sablier'] == 1 and g['degats'] == ['−85'], 'tour 2, sans relancer l\'œil : une seule ligne — la proie (' + proie + '), le sablier, puis −85')
    pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(250)
    off = pg.evaluate("() => { var c = document.querySelector('.carte[data-id=\"oeil\"]'); return [c.classList.contains('off'), c.querySelector('small').textContent]; }")
    verifie(off == [True, 'Il voit tout'], 'la rune de l\'œil ne se lance qu\'une fois : sa carte est éteinte et dit « Il voit tout » ' + str(off))
    pg.tap('.carte[data-id="oeil"]', force=True); pg.wait_for_timeout(300)
    verifie(pg.evaluate("() => DJ.Combat.etat().mode") == 'gestes' and not pg.evaluate("() => DJ.Combat._E().c.h.sage.joue"), 'toucher la carte éteinte ne fait rien perdre : le Sage choisit autre chose')
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-2.png'))
    pg.tap('.b-retour', force=True); pg.wait_for_timeout(200)
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('sage', 'rune', b0)
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('alchimiste', 'herbes', 'pisteur'); joue('pisteur', 'fleche', b0)

    # tour 3 : le coup tombe à la fin du tour ; le bouclier en arrête 75 %
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(v['tour'] == 3 and g['prepare'] == 2 and g['pret'] and 'gros coup' in g['pastille'] and g['degats'][0] == '−85' and g['vise']['cibles'] == [proie], 'tour 3 : « ' + g['pastille'].strip() + ' », −85 sur ' + proie)
    pg.screenshot(path=os.path.join(CAP, 'combat-oeil-3.png'))
    autres = pg.evaluate("(h) => { var E = DJ.Combat._E(), t = 0; E.c.etat().betes.forEach(function(b){ if(!b.mort && b.type !== 'gardien' && b.vise && b.vise.cibles.indexOf(h) >= 0) t += Math.ceil(b.vise.degats * b.vise.fois * 0.25); }); return t; }", proie)
    joue('sage', 'bouclier', proie)
    badge = pg.evaluate("() => [].map.call(document.querySelectorAll('.ha-badge'), function(e){ return e.textContent; })")
    verifie(badge and all('−75 %' in t for t in badge), 'le bouclier dit bien « −75 % » (il disait −50 %) ' + str(badge))
    # les herbes soignent maintenant toute l'équipe (un petit montant) : on lit les points de vie après elles
    pvs0 = pg.evaluate("() => { var c = DJ.Combat._E().c; return [c.h.sage.pv, c.h.alchimiste.pv, c.h.pisteur.pv]; }")
    joue('alchimiste', 'herbes', 'sage' if proie != 'sage' else 'pisteur')
    pvs1 = pg.evaluate("() => { var c = DJ.Combat._E().c; return [c.h.sage.pv, c.h.alchimiste.pv, c.h.pisteur.pv]; }")
    maxi = [90, 100, 120]
    verifie(all(pvs1[k] == min(maxi[k], pvs0[k] + 15) for k in range(3)), f'les herbes soignent toute l\'équipe de 15 (Romain, 13 novembre) : {pvs0} → {pvs1}')
    pv0 = pg.evaluate("(h) => DJ.Combat._E().c.h[h].pv", proie)
    b0 = pg.evaluate("() => DJ.Combat._E().c.ciblables()[0].id")
    joue('pisteur', 'fleche', b0)
    pv1 = pg.evaluate("(h) => DJ.Combat._E().c.h[h].pv", proie)
    ecran = pg.evaluate("(h) => +document.querySelector('#pv-' + h + ' b').textContent", proie)
    verifie(pv0 - pv1 == 22 + autres and ecran == pv1, f'le marteau tombe sur {proie} : 85 → 22 derrière le bouclier ({pv0} → {pv1}), et l\'écran dit pareil')
    v = pg.evaluate(VUE); g = v['betes'][gardien]
    verifie(g['prepare'] == 0 and not g['pastille'] and not g['rond'], 'après le coup : plus de pastille, plus de rond rouge')
    verifie(v['vu'] == 2 and all(b['tetes'] >= 1 and b['lignes'] >= 1 for b in v['betes'].values()), 'tour 4 : l\'œil est toujours ouvert, sans avoir été relancé (il dure tout le combat)')
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
        carte(pg, g)
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
    """Romain, 10 novembre : plus de sac à choisir (toutes les potions) ; le Pisteur porte tous ses carquois et choisit sa flèche.
    Le 11 novembre (16 h 07) : « la partie de gauche, c'est pour les armes, et la partie de droite c'est pour les combos avec arc
    plus acide. Mais il faut que ça soit pareil pour les autres personnages. » Et le Sage porte toutes ses armes."""
    print('— les armes à gauche, les combos à droite ; toutes les potions')
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.goto(PAGE + '?combat=toiles&graine=5&potions=toutes&objets=pisteur:fleches-argent,pisteur:fleches-lourdes,sage:cristal-lune,sage:baton-chene&vitesse=3')

    def libre():
        pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=90000, polling=200)
        pg.wait_for_timeout(250)
    MESURE = """() => { var b = document.querySelector('#bande').getBoundingClientRect(), l = {left:b.right, right:b.right}, o = {ids:[], dehors:[], petites:[]};
      document.querySelectorAll('#bande .carte').forEach(function(c){ var r = c.getBoundingClientRect(), id = c.getAttribute('data-id'); o.ids.push(id); if(c.classList.contains('mini')) o.petites.push(id);
        if(r.right > l.left + 1 || r.bottom > b.bottom + 1 || r.left < b.left) o.dehors.push(id);
        var t = c.querySelector('b'); if(t && t.scrollWidth > c.clientWidth + 1) o.dehors.push(id + ' (nom coupé)'); });
      o.journal = l.right <= b.right + 1 && l.left >= b.left;
      o.gauche = [].map.call(document.querySelectorAll('#bande .b-armes .carte'), function(c){ return c.getAttribute('data-id'); });
      o.droite = [].map.call(document.querySelectorAll('#bande .b-combos .carte'), function(c){ return c.getAttribute('data-id'); });
      o.titres = [].map.call(document.querySelectorAll('#bande .b-lbl'), function(e){ return e.textContent; }); return o; }"""
    libre()
    NOMS = "(sel) => [].map.call(document.querySelectorAll('#bande ' + sel + ' .carte'), function(c){ var p = c.querySelector('small'); return c.querySelector('b').textContent + (p ? ' — ' + p.textContent : '') + (c.querySelector('.c-ic img, .c-ic svg:not(.fiole)') ? ' [dessin]' : '') + (c.querySelector('.c-avec svg') ? ' [bâton]' : '') + (c.classList.contains('enmain') ? ' [en main]' : ''); })"
    pg.tap('.b-heros[data-id="alchimiste"]', force=True); pg.wait_for_timeout(300)
    m = pg.evaluate(MESURE)
    verifie(m['petites'] == ['herbes', 'p:feu', 'p:fumigene', 'p:huile', 'p:colle', 'p:acide', 'p:baume', 'p:coeur', 'p:givre', 'p:baumelum'], f'l\'Alchimiste a ses herbes et ses 9 potions sous la main, toutes visibles ({len(m["petites"])})')
    verifie(m['gauche'] == ['louche'] and m['droite'] == m['petites'] and m['titres'] == ['⚔️ Son arme', 'Ses potions'], 'l\'Alchimiste : à gauche son arme (la louche), à droite ses herbes et ses potions ' + str(m['titres']))
    verifie(pg.evaluate(NOMS, '.b-armes') == ['Louche — un grand BONG'], 'la louche a son nom d\'arme ' + str(pg.evaluate(NOMS, '.b-armes')))
    verifie(not m['dehors'] and m['journal'], 'les cartes tiennent toutes dans la bande ' + str(m['dehors']))
    pg.tap('.carte[data-id="herbes"]', force=True); pg.wait_for_timeout(250)
    verifie(pg.evaluate("() => document.querySelector('.b-lbl.dit').textContent") == 'soigne l\'équipe', 'les herbes choisies : « soigne l\'équipe »')
    pg.tap('.carte[data-id="p:fumigene"]', force=True); pg.wait_for_timeout(250)
    verifie(pg.evaluate("() => document.querySelector('.b-lbl.dit').textContent") == 'un gros nuage' and pg.evaluate("() => document.querySelector('.carte[data-id=\"p:fumigene\"]').classList.contains('choisie')"), 'la potion choisie dit ce qu\'elle fait, en trois mots')
    pg.screenshot(path=os.path.join(CAP, 'combat-potions.png'))
    pg.tap('.b-retour', force=True); pg.wait_for_timeout(250)
    # le Pisteur (Romain, 16 h 37) : « arc normal, arc de lune, arc transperçant et la dague. Et après : feu, huile, colle, acide, givre. »
    pg.tap('.b-heros[data-id="pisteur"]', force=True); pg.wait_for_timeout(300)
    m = pg.evaluate(MESURE)
    verifie(m['gauche'] == ['fleche', 'f:fleches-argent', 'f:fleches-lourdes', 'dague'] and m['droite'] == ['p:feu', 'p:huile', 'p:colle', 'p:acide', 'p:givre'] and m['petites'] == m['droite'] and m['titres'] == ['⚔️ Ses armes', 'Ses combos'],
            'le Pisteur : à gauche ses quatre armes, à droite ses cinq combos (la flèche trempée) ' + str(m['gauche']) + str(m['titres']))
    noms = pg.evaluate(NOMS, '.b-armes')
    # (dans cette salle, tout vole : depuis le 11 novembre au soir, la dague y est éteinte et dit « Trop haut ! »)
    volent = pg.evaluate("() => { var c = DJ.Combat._E().c; return !c.aPortee().length; }")
    verifie(noms == ['Arc normal — ce qui vole', 'Arc de lune — bêtes de brume [dessin]', 'Arc transperçant — perce l\'armure [dessin]', 'Dague — ' + ('Trop haut !' if volent else 'celui de devant')], 'ses armes : arc normal, arc de lune, arc transperçant, dague ' + str(noms))
    verifie(not volent or pg.evaluate("() => document.querySelector('#bande .carte[data-id=\"dague\"]').classList.contains('off')"), 'rien ne marche par terre ici : la carte de la dague est éteinte')
    noms = pg.evaluate(NOMS, '.b-combos')
    verifie(noms == ['Feu', 'Huile', 'Colle', 'Acide', 'Givre'], 'ses combos : feu, huile, colle, acide, givre ' + str(noms))
    verifie(not m['dehors'] and m['journal'], 'les cartes du Pisteur tiennent dans la bande ' + str(m['dehors']))
    pg.screenshot(path=os.path.join(CAP, 'combat-fleches.png'))
    # le défaut de l'arc transperçant : sa flèche passe à travers une bête de brume
    f = pg.evaluate("() => { var E = DJ.Combat._E(), m = E.c.vivants().filter(function(x){ return x.type === 'feufollet'; })[0]; return {id:m.id, pv:m.pv}; }")
    pg.tap('.carte[data-id="f:fleches-lourdes"]', force=True); pg.wait_for_timeout(200)
    pg.eval_on_selector('#zone-' + f['id'], 'e => e.click()')
    pg.wait_for_timeout(600); libre()
    r = pg.evaluate("(id) => { var E = DJ.Combat._E(), m = E.c.bete(id); return {pv:m.pv, joue:E.c.h.pisteur.joue}; }", f['id'])
    verifie(r['pv'] == f['pv'] and r['joue'], 'la flèche de l\'arc transperçant passe à travers le feu follet : rien, et le tour du Pisteur est joué')
    # le Sage (Romain, 16 h 37) : « trois bâtons : bâton normal, bâton de lune, bâton de chêne. Et après, il y a les sorts :
    # rune de l'œil, rune de lumière, bouclier de runes, rune d'appel. Tu fais en sorte qu'on puisse choisir les bâtons. »
    libre()
    SAGE = """() => { var E = DJ.Combat._E(), A = E.A.h.sage; return {baton:DJ.Combat.etat().baton, garde:E.partie.heros.sage.baton || null, joue:E.c.h.sage.joue, mode:E.mode,
      lune:A.equipe('cristal-lune'), chene:A.equipe('baton-chene')}; }"""
    if pg.evaluate("() => DJ.Combat.etat().mode") == 'qui' and pg.evaluate("() => DJ.Combat._E().c.aJouer().indexOf('sage') >= 0"):
        pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(300)
        m = pg.evaluate(MESURE)
        verifie(m['gauche'] == ['baton', 'cristal-lune', 'baton-chene'] and m['droite'] == ['oeil', 'rune', 'bouclier', 'appel'] and m['petites'] == [] and m['titres'] == ['⚔️ Ses bâtons', '✨ Ses sorts'],
                'le Sage : à gauche ses trois bâtons, à droite ses quatre sorts ' + str(m['gauche']) + str(m['droite']) + str(m['titres']))
        verifie(not m['dehors'], 'les sept cartes du Sage tiennent dans la bande ' + str(m['dehors']))
        noms = pg.evaluate(NOMS, '.b-armes')
        verifie(noms == ['Bâton normal — rien de spécial [dessin] [en main]', 'Bâton de lune — lumière pour tous [dessin]', 'Bâton de chêne — bouclier pour deux [dessin]'], 'ses bâtons : le normal (en main au départ), celui de lune, celui de chêne ' + str(noms))
        noms = pg.evaluate(NOMS, '.b-combos')
        # (dans la cave aux toiles, tout pend ou vole : la rune d'appel est éteinte et dit pourquoi)
        verifie(noms[:3] == ['Rune de l\'œil — qui sera frappé ?', 'Rune de lumière — une vive lumière', 'Bouclier de runes — protège un ami'] and noms[3].startswith('Rune d\'appel — ') and len(noms) == 4, 'ses sorts, avec le bâton normal : rien de spécial ' + str(noms))
        e = pg.evaluate(SAGE)
        verifie(e['baton'] == 'baton' and not e['lune'] and not e['chene'], 'à l\'écran, le Sage tient son bâton normal (ni cristal, ni chêne) ' + str(e))
        pg.screenshot(path=os.path.join(CAP, 'combat-armes-sage.png'))
        # prendre le bâton de lune : la lumière éclaire toute la salle ; le tour n'est pas joué
        pg.tap('#bande [data-act="arme"][data-id="cristal-lune"]', force=True); pg.wait_for_timeout(400)
        m = pg.evaluate(MESURE); e = pg.evaluate(SAGE); noms = pg.evaluate(NOMS, '.b-combos')
        verifie(e['baton'] == 'cristal-lune' and e['lune'] and not e['chene'] and not e['joue'] and e['mode'] == 'gestes', 'le bâton de lune en main : le Sage le tient à l\'écran, et son tour n\'est pas joué ' + str(e))
        verifie(m['droite'] == ['oeil', 'a:cristal-lune', 'bouclier', 'appel'] and noms[1] == 'Rune de lumière — toute la salle [bâton]' and noms[2] == 'Bouclier de runes — protège un ami', 'avec lui, la rune de lumière éclaire toute la salle (le bouclier ne change pas) ' + str(noms[1:3]))
        verifie(pg.evaluate(NOMS, '.b-armes')[1].endswith('[en main]') and not m['dehors'], 'la carte du bâton de lune porte « en main »')
        pg.screenshot(path=os.path.join(CAP, 'combat-armes-sage-lune.png'))
        # prendre le bâton de chêne : le bouclier protège deux amis d'un seul geste (et la lumière redevient simple)
        pg.tap('#bande [data-act="arme"][data-id="baton-chene"]', force=True); pg.wait_for_timeout(400)
        m = pg.evaluate(MESURE); e = pg.evaluate(SAGE); noms = pg.evaluate(NOMS, '.b-combos')
        verifie(e['baton'] == 'baton-chene' and e['chene'] and not e['lune'] and e['garde'] == 'baton-chene', 'le bâton de chêne en main : il remplace celui de lune, et le choix est gardé pour la suite ' + str(e))
        verifie(m['droite'] == ['oeil', 'rune', 'a:baton-chene', 'appel'] and noms[1] == 'Rune de lumière — une vive lumière' and noms[2] == 'Bouclier de runes — deux amis, moitié [bâton]', 'avec lui, le bouclier protège deux amis (la lumière redevient simple) ' + str(noms[1:3]))
        pg.screenshot(path=os.path.join(CAP, 'combat-armes-sage-chene.png'))
        pg.tap('.carte[data-id="a:baton-chene"]', force=True); pg.wait_for_timeout(250)
        pg.tap('.zone[data-type="heros"][data-id="pisteur"]', force=True); pg.wait_for_timeout(250)
        pg.tap('.zone[data-type="heros"][data-id="alchimiste"]', force=True); pg.wait_for_timeout(500); libre()
        bc = pg.evaluate("() => { var c = DJ.Combat._E().c; return [c.h.pisteur.bouclier, c.h.alchimiste.bouclier, c.h.sage.bouclier, c.h.sage.joue]; }")
        verifie(bc[3] and (bc[:3] == ['chene', 'chene', False] or pg.evaluate("() => DJ.Combat._E().c.tour") > 1), 'le bâton de chêne : le Pisteur et l\'Alchimiste protégés d\'un seul geste ' + str(bc))
        # au tour suivant, il a toujours le bâton de chêne en main
        for h in ('alchimiste', 'pisteur'):
            if pg.evaluate("(h) => DJ.Combat.etat().mode === 'qui' && DJ.Combat._E().c.aJouer().indexOf(h) >= 0", h):
                pg.tap(f'.b-heros[data-id="{h}"]', force=True); pg.wait_for_timeout(200)
                pg.tap('.carte[data-id="%s"]' % ('louche' if h == 'alchimiste' else 'fleche'), force=True); pg.wait_for_timeout(200)
                pg.eval_on_selector('.zone[data-type="bete"]', 'e => e.click()'); pg.wait_for_timeout(500); libre()
        if pg.evaluate("() => DJ.Combat.etat().mode === 'qui' && DJ.Combat._E().c.aJouer().indexOf('sage') >= 0"):
            pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(300)
            verifie(pg.evaluate(SAGE)['baton'] == 'baton-chene' and pg.evaluate(NOMS, '.b-armes')[2].endswith('[en main]'), 'au tour suivant, le bâton de chêne est toujours en main')
            pg.tap('.b-retour', force=True); pg.wait_for_timeout(200)
    verifie(not errs, 'armes, potions et flèches : aucune erreur JavaScript ' + str(errs[:2]))
    ctx.close()


def appel(nav):
    """Romain, 11 novembre (16 h 07) : « une rune pour ramener un ennemi vers lui. Pour qu'après, le Pisteur puisse donner un
    coup de dague. » Dans l'atelier, le Gardien est derrière le rat cuirassé."""
    print('— la rune d\'appel')
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.goto(PAGE + '?combat=atelier&graine=5&potions=toutes&vitesse=3')

    def libre():
        pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=90000, polling=200)
        pg.wait_for_timeout(300)
    PLACES = """() => { var E = DJ.Combat._E(), o = {};
      E.c.vivants().forEach(function(m, i){ var a = E.A.b[m.id], r = a.el.getBoundingClientRect(), z = document.querySelector('#zone-' + m.id).getBoundingClientRect(), pv = document.querySelector('#pv-' + m.id).getBoundingClientRect();
        o[m.type] = {rang:i, milieu:Math.round(r.left + r.width / 2), zone:Math.round(z.left + z.width / 2), pv:Math.round(pv.left + pv.width / 2), dispo:a.el.classList.contains('dispo')}; });
      return o; }"""
    libre()
    av = pg.evaluate(PLACES)
    verifie(av['ratcuir']['rang'] == 0 and av['ratcuir']['milieu'] < av['gardien']['milieu'], 'au départ : le rat cuirassé est devant, le Gardien derrière lui')
    pg.tap('.b-heros[data-id="pisteur"]', force=True); pg.wait_for_timeout(250)
    pg.tap('.carte[data-id="dague"]', force=True); pg.wait_for_timeout(250)
    verifie(not pg.evaluate(PLACES)['gardien']['dispo'] and pg.evaluate(PLACES)['ratcuir']['dispo'], 'la dague ne peut toucher que le rat cuirassé (celui de devant)')
    pg.tap('.b-retour', force=True); pg.wait_for_timeout(200)
    pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(250)
    c = pg.evaluate("() => { var c = document.querySelector('.carte[data-id=\"appel\"]'); return c.querySelector('b').textContent + ' — ' + c.querySelector('small').textContent; }")
    verifie(c == 'Rune d\'appel — amène un monstre', 'le Sage a la rune d\'appel : « ' + c + ' »')
    pg.tap('.carte[data-id="appel"]', force=True); pg.wait_for_timeout(250)
    d = pg.evaluate(PLACES)
    verifie(d['gardien']['dispo'] and not d['ratcuir']['dispo'], 'la rune d\'appel choisie : seul le Gardien porte le rond jaune (le rat cuirassé est déjà devant)')
    pg.screenshot(path=os.path.join(CAP, 'combat-appel-0.png'))
    gid = pg.evaluate("() => DJ.Combat._E().c.vivants().filter(function(m){ return m.type === 'gardien'; })[0].id")
    pg.eval_on_selector('#zone-' + gid, 'e => e.click()')
    pg.wait_for_timeout(500); libre()
    ap = pg.evaluate(PLACES)
    verifie(ap['gardien']['rang'] == 0 and ap['gardien']['milieu'] < ap['ratcuir']['milieu'], f"le Gardien est passé devant, à l'écran aussi (milieu {av['gardien']['milieu']} → {ap['gardien']['milieu']} ; le rat cuirassé {av['ratcuir']['milieu']} → {ap['ratcuir']['milieu']})")
    verifie(abs(ap['gardien']['zone'] - ap['gardien']['milieu']) < 60 and abs(ap['ratcuir']['zone'] - ap['ratcuir']['milieu']) < 60 and ap['gardien']['pv'] < ap['ratcuir']['pv'], 'leurs zones à toucher et leurs barres de vie les ont suivis')
    pg.screenshot(path=os.path.join(CAP, 'combat-appel-1.png'))
    pg.tap('.b-heros[data-id="pisteur"]', force=True); pg.wait_for_timeout(250)
    pg.tap('.carte[data-id="dague"]', force=True); pg.wait_for_timeout(250)
    d = pg.evaluate(PLACES)
    verifie(d['gardien']['dispo'] and not d['ratcuir']['dispo'], 'maintenant, c\'est le Gardien que la dague peut toucher')
    verifie(not errs, 'rune d\'appel : aucune erreur JavaScript ' + str(errs[:2]))
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
        try:
            appel(nav)
        except Exception as ex:
            verifie(False, f'appel : le test s\'arrête ({str(ex)[:200]})')
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
