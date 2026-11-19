"""QUELS GESTES DES BÊTES PASSENT SANS UN SON ? (19 novembre, Bible §13.90 — Romain : « dès qu'un ennemi fait une action, il y a un son »)
On joue les combats au hasard sur une copie du donjon construit (sortie/), on note chaque évènement que l'écran joue pour une
bête (et chaque attaque) et chaque son demandé ; un évènement sans aucun son entre lui et le suivant est « muet ».
    flock /tmp/brumeval-pw.lock python3 muets.py sortie [salles] [graines] [tours]
    flock /tmp/brumeval-pw.lock python3 muets.py sortie bassin,crypte 7,11 6
À LIRE AVEC LA TÊTE : un état qui suit un coup (« etat dos » après « touche lumiere ») sort « muet » alors que son bruit est parti
avec le coup, en retard (betes.js, SONS.apres) — regarder la ligne du coup, dans « TOUJOURS SONORES ». Trois à quatre minutes par
salle et par graine ; ne pas en lancer plus de deux à la fois."""
import sys, os, re, json, random, shutil, collections
from playwright.sync_api import sync_playwright

BUILD = os.path.abspath(sys.argv[1])
SALLES = (sys.argv[2] if len(sys.argv) > 2 else 'rats,canaux,egouts,toiles,atelier,crypte,ossuaire,bassin').split(',')
GRAINES = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else '7,11,23').split(',')]
TOURS = int(sys.argv[4]) if len(sys.argv) > 4 else 6
COPIE = '/tmp/donjon-audit-' + SALLES[0]

shutil.rmtree(COPIE, ignore_errors=True); shutil.copytree(BUILD, COPIE)
p = os.path.join(COPIE, 'index.html'); s = open(p, encoding='utf-8').read()
note = " try{ if(window.__evs){ var __e = %s; window.__evs.push({t:performance.now(), q:'%s', ev:{t:__e.t, nom:__e.nom, anim:__e.anim, coup:__e.coup, bete:typeof __e.bete === 'string' ? __e.bete : null, heros:__e.heros || null, on:__e.on, mode:__e.mode, retour:__e.retour, critique:__e.critique, riposte:__e.riposte}}); } }catch(e){}"
for sig, expr, quoi in [('async function un(ev, bl, ctx){', 'ev', 'un'), ('async function attaque(l, i, ctx){', 'l[i]', 'attaque'),
                        ('async function critique(l, i, ctx){', 'l[i]', 'critique'), ('async function eclosion(l, i, ctx){', 'l[i]', 'eclosion')]:
    assert s.count(sig) == 1, sig
    s = s.replace(sig, sig + note % (expr, quoi))
open(p, 'w', encoding='utf-8').write(s)
PAGE = 'file://' + p

MUETS = collections.Counter(); SONORES = collections.Counter(); EXEMPLES = {}; SONS_DE = collections.defaultdict(collections.Counter)

def une(nav, salle, graine):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("""window.__evs = []; window.__sons = [];
      (function attend(){ var S = window.SALLE && SALLE.Son; if(!S || !S.jouer){ return setTimeout(attend, 20); }
        var j = S.jouer, b = S.bruitage;
        S.jouer = function(n){ window.__sons.push({t:performance.now(), id:String(n), genre:'ancien'}); return j.apply(S, arguments); };
        if(b) S.bruitage = function(id, o){ var r = b.apply(S, arguments); window.__sons.push({t:performance.now(), dt:(o && o.dt) || 0, id:String(id), genre:r ? 'neuf' : 'absent'}); return r; };
      })();""")
    pg.goto(PAGE + '?combat=' + salle + '&graine=' + str(graine) + '&potions=toutes&objets=pisteur:fleches-argent,pisteur:fleches-lourdes&vitesse=2')
    rnd = random.Random(graine)

    def etat():
        return pg.evaluate("() => { var e = DJ.Combat.etat(); return e ? {mode:e.mode, occupe:e.occupe, tour:e.tour} : null; }")

    def libre(max_ms=90000):
        t = 0
        while t < max_ms:
            e = etat()
            if e and ((e['mode'] == 'qui' and not e['occupe']) or e['mode'] == 'fin'):
                pg.wait_for_timeout(250); return etat()
            pg.wait_for_timeout(200); t += 200
        return etat()

    libre()
    while True:
        e = etat()
        if not e or e['mode'] == 'fin' or e['tour'] > TOURS: break
        choix = pg.evaluate("""() => { var E = DJ.Combat._E(), l = E.c.aJouer(), o = [];
          l.forEach(function(h){ E.c.gestes(h).forEach(function(g){ if(g.permis) o.push({h:h, g:g.geste, vise:g.vise, cibles:g.cibles || [], max:g.max || 1}); }); });
          return o; }""")
        if not choix:
            pg.wait_for_timeout(500); libre(); continue
        c = rnd.choice(choix)
        pg.tap(f'.b-heros[data-id="{c["h"]}"]', force=True); pg.wait_for_timeout(200)
        try:
            if not pg.query_selector(f'#bande .carte[data-id="{c["g"]}"]'):
                pg.tap('#bande [data-act="arme"][data-id="%s"]' % (c['g'][2:] if c['g'].startswith('a:') else 'baton'), force=True); pg.wait_for_timeout(200)
            pg.tap(f'#bande .carte[data-id="{c["g"]}"]', force=True); pg.wait_for_timeout(200)
        except Exception as ex:
            pg.wait_for_timeout(300); continue
        if c['vise'] in ('salle', 'equipe'):
            sel = '.zone[data-type="bete"]' if c['vise'] == 'salle' else '.zone[data-type="heros"]'
            try: pg.eval_on_selector(sel, 'e => e.click()')
            except Exception: pass
        else:
            n = min(c['max'], len(c['cibles'])) or 1
            for cible in rnd.sample(c['cibles'], n) if c['cibles'] else []:
                try:
                    if cible in ('sage', 'alchimiste', 'pisteur'): pg.tap(f'.zone[data-type="heros"][data-id="{cible}"]', force=True)
                    else: pg.eval_on_selector('#zone-' + cible, 'e => e.click()')
                except Exception: pass
                pg.wait_for_timeout(150)
        pg.wait_for_timeout(300); libre()
    pg.wait_for_timeout(1500)
    d = pg.evaluate("""() => { var E = DJ.Combat._E(), mod = {}; try{ Object.keys(E.A.b).forEach(function(id){ mod[id] = E.A.b[id].module; }); }catch(e){}
      return {evs:window.__evs, sons:window.__sons, mod:mod}; }""")
    ctx.close()
    evs = [x for x in d['evs']]; sons = d['sons']
    for k, x in enumerate(evs):
        ev = x['ev']
        if not ev.get('bete'): continue
        if x['q'] == 'un' and ev['t'] in ('degats', 'ferme', 'gagne', 'mot'): continue      # (un chiffre, une barre : le son est celui du coup)
        fin = evs[k + 1]['t'] if k + 1 < len(evs) else x['t'] + 3000
        # une attaque dure jusqu'au prochain évènement d'une AUTRE attaque ou d'un geste (les dégâts des héros sont dedans)
        if x['q'] in ('attaque', 'critique'):
            j = k + 1
            while j < len(evs) and evs[j]['q'] == 'un' and (evs[j]['ev'].get('heros') or evs[j]['ev'].get('bete') == ev['bete']): j += 1
            fin = evs[j]['t'] if j < len(evs) else x['t'] + 3000
        la = [so for so in sons if x['t'] - 2 <= so['t'] < fin - 2 and so['genre'] != 'absent' and so['id'] not in ('clic', 'icone')]
        mod = d['mod'].get(ev['bete'], re.sub(r'\d+$', '', ev['bete']))
        cle = (mod, x['q'], ev['t'], str(ev.get('anim') or ev.get('nom') or ev.get('coup') or ev.get('mode') or ''), '' if ev.get('on') is None else ('on' if ev['on'] else 'off'))
        if la:
            SONORES[cle] += 1
            for so in la: SONS_DE[cle][so['id']] += 1
        else:
            MUETS[cle] += 1; EXEMPLES.setdefault(cle, f'{salle} graine {graine}')
    print(f'  {salle} graine {graine} : {len(evs)} évènements, {len(sons)} sons' + (' ; ERREURS ' + ' | '.join(errs[:2]) if errs else ''), flush=True)

with sync_playwright() as pw:
    nav = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for sa in SALLES:
        for g in GRAINES:
            try: une(nav, sa, g)
            except Exception as e: print('  raté', sa, g, str(e)[:160], flush=True)
    nav.close()

print('\n=== MUETS (bête, par où, évènement, nom, état) : fois muet / fois avec un son ===')
for cle in sorted(set(list(MUETS) + list(SONORES))):
    m, so = MUETS[cle], SONORES[cle]
    if m: print(f'  {"MUET   " if not so else "PARFOIS"} {cle} : {m} muet(s), {so} sonore(s)  ex. {EXEMPLES.get(cle, "")}' + (('  sons vus : ' + ', '.join(list(SONS_DE[cle])[:5])) if so else ''))
print('\n=== TOUJOURS SONORES ===')
for cle in sorted(SONORES):
    if not MUETS[cle]: print('  ', cle, ':', SONORES[cle], ' ', ', '.join(f'{a}×{b}' for a, b in SONS_DE[cle].most_common(4)))
json.dump({'muets':[[list(k), v] for k, v in MUETS.items()], 'sonores':[[list(k), v] for k, v in SONORES.items()]}, open('/tmp/audit-sons-' + SALLES[0] + '.json', 'w'), ensure_ascii=False)
