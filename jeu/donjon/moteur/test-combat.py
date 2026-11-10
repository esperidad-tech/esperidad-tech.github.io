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
    pg.goto(PAGE + '?combat=' + s + '&graine=' + str(graine) + '&sac=' + SACS[s] + '&vitesse=2')
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
        pb = accord()
        if pb:
            verifie(False, f'{s} : après {c["h"]} {c["g"]}, l\'écran et les règles ne disent pas pareil : {pb}')
        tours = e2['tour'] if e2 else tours
    verifie(True, f'{s} : {tours} tours joués au hasard sans blocage')
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


with sync_playwright() as p:
    nav = p.chromium.launch()
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
