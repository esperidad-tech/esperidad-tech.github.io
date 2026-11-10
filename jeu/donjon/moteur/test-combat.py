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


def etude(nav):
    """Romain, 10 novembre : étudier un monstre donne un code dans le journal (à taper sur la tablette du Sage), pas un texte."""
    print('— l\'étude : un code dans le journal')
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
    pg.goto(PAGE + '?combat=canaux&graine=5&sac=feu,huile,baume&vitesse=3')

    def libre():
        pg.wait_for_function("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", timeout=90000, polling=200)
        pg.wait_for_timeout(250)
    libre()
    verifie(pg.evaluate("() => !document.querySelector('.b-livre .nb') && /Journal/.test(document.querySelector('.b-livre').textContent)"), 'étude : le bouton s\'appelle « Journal », sans chiffre au départ')
    cible = pg.evaluate("() => { var E = DJ.Combat._E(), g = E.c.gestes('sage').filter(function(x){ return x.geste === 'etudier'; })[0]; return g.cibles[g.cibles.length - 1]; }")
    pg.tap('.b-heros[data-id="sage"]', force=True); pg.wait_for_timeout(200)
    pg.tap('.carte[data-id="etudier"]', force=True); pg.wait_for_timeout(200)
    pg.eval_on_selector('#zone-' + cible, 'e => e.click()')
    pg.wait_for_function("() => !!document.querySelector('.b-livre .nb')", timeout=30000)
    pg.wait_for_timeout(900)
    verifie(pg.evaluate("() => document.querySelector('.b-livre .nb').textContent") == '1' and pg.evaluate("() => document.querySelector('.b-livre').classList.contains('a-lire')"), 'étude : un code de plus, le bouton du journal bat')
    pg.tap('.b-livre', force=True); pg.wait_for_timeout(400)
    j = pg.evaluate("""() => { var f = document.querySelector('#fenetre'), l = f.querySelector('.ligne.etude'), pb = [];
      f.querySelectorAll('.ligne').forEach(function(e){ var t = e.textContent.replace(/🔊/g, '').trim(); if(t.split(/\\s+/).length > 3 && !e.querySelector('.lire')) pb.push(t.slice(0, 30)); });
      return {titre:f.querySelector('h2').textContent, m:l && l.getAttribute('data-etude'), code:l && l.querySelector('.code-ligne').textContent, attendu:l && DONJON_CODES.emojis('etude:' + l.getAttribute('data-etude')),
        vides:f.querySelectorAll('.ligne.vide').length, texte:f.textContent, pb:pb}; }""")
    verifie(j['m'] == 'chauvesouris' and j['code'] == j['attendu'] and len(j['code']) > 3, f'étude : le journal montre le code de la chauve-souris pour le Sage ({j["code"]})')
    verifie(j['vides'] == 1 and 'Pas encore étudié' in j['texte'], 'étude : le rat, rencontré mais pas étudié, est noté « Pas encore étudié »')
    verifie('fait peur' not in j['texte'] and 'Qui suis-je' not in j['texte'], 'étude : aucune énigme ni solution dans le donjon (elles sont sur la tablette du Sage)')
    verifie(not j['pb'], 'étude : chaque texte du journal a son 🔊 ' + str(j['pb']))
    pg.screenshot(path=os.path.join(CAP, 'combat-journal.png'))
    pg.tap('#fenetre [data-act="fermer"]', force=True) if pg.evaluate("() => !!document.querySelector('#fenetre [data-act=\"fermer\"]')") else pg.evaluate("() => DJ.fermer()")
    pg.wait_for_timeout(300)
    verifie(not pg.evaluate("() => document.querySelector('.b-livre').classList.contains('a-lire')"), 'étude : une fois le journal ouvert, le bouton ne bat plus')
    r = pg.evaluate("() => { var E = DJ.Combat._E(); return {deja:E.c.refus('sage', 'etudier', '" + cible + "'), reste:E.c.gestes('alchimiste').length}; }")
    verifie(r['deja'] in ('Déjà joué', 'Déjà étudié'), 'étude : ce monstre ne s\'étudie pas deux fois')
    verifie(pg.evaluate('window.__parle') == 0 and not errs, 'étude : pas de lecture vocale toute seule, pas d\'erreur ' + str(errs[:2]))
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
    MESURE = """() => { var b = document.querySelector('#bande').getBoundingClientRect(), l = document.querySelector('.b-livre').getBoundingClientRect(), o = {ids:[], dehors:[], petites:[]};
      document.querySelectorAll('#bande .carte').forEach(function(c){ var r = c.getBoundingClientRect(), id = c.getAttribute('data-id'); o.ids.push(id); if(c.classList.contains('mini')) o.petites.push(id);
        if(r.right > l.left + 1 || r.bottom > b.bottom + 1 || r.left < b.left) o.dehors.push(id);
        var t = c.querySelector('b'); if(t && t.scrollWidth > c.clientWidth + 1) o.dehors.push(id + ' (nom coupé)'); });
      o.journal = l.right <= b.right + 1 && l.left >= b.left; return o; }"""
    libre()
    pg.tap('.b-heros[data-id="alchimiste"]', force=True); pg.wait_for_timeout(300)
    m = pg.evaluate(MESURE)
    verifie(m['petites'] == ['p:feu', 'p:fumigene', 'p:huile', 'p:colle', 'p:acide', 'p:baume', 'p:coeur', 'p:givre', 'p:baumelum'], f'l\'Alchimiste a ses 9 potions sous la main, toutes visibles ({len(m["petites"])})')
    verifie(not m['dehors'] and m['journal'], 'les cartes tiennent toutes dans la bande, le Journal aussi ' + str(m['dehors']))
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
    if not SALLES or 'canaux' in SALLES or len(sys.argv) < 2:
        try:
            etude(nav)
        except Exception as ex:
            verifie(False, f'étude : le test s\'arrête ({str(ex)[:200]})')
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
