"""QUELS MOMENTS DE LÉO PASSENT SANS UN SON ? (19 novembre, Bible §13.90)
On joue chaque phase 75 secondes sur une copie du donjon construit (les héros agissent au hasard, personne ne meurt), on note
chaque évènement que l'écran joue et chaque son demandé (les sons des héros ne comptent pas).
    flock /tmp/brumeval-pw.lock python3 muets-leo.py sortie [phases] [graines] [secondes]
À LIRE AVEC LA TÊTE : le son d'un coup est demandé pendant son élan et calé sur l'impact : « impact » sort « muet » alors que le
son tombe pile dessus (regarder la ligne « elan » de la même attaque)."""
import sys, os, re, json, random, shutil, collections
from playwright.sync_api import sync_playwright

BUILD = os.path.abspath(sys.argv[1])
PHASES = [int(x) for x in (sys.argv[2] if len(sys.argv) > 2 else '1,2,3').split(',')]
GRAINES = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else '7,11').split(',')]
SECONDES = int(sys.argv[4]) if len(sys.argv) > 4 else 75
COPIE = '/tmp/donjon-audit-leo'
OBJETS = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes'
HEROS = ('icone', 'clic', 'swish', 'chairF', 'chairD', 'arc', 'vol', 'baton', 'cristal', 'potGivre', 'potAcide', 'potHuile', 'potColle', 'magie', 'verre', 'soin', 'coeur', 'dome',
         'absorbe', 'tombe', 'flecheLourde', 'flecheArgent', 'bulles', 'vole', 'dague', 'impact')

shutil.rmtree(COPIE, ignore_errors=True); shutil.copytree(BUILD, COPIE)
p = os.path.join(COPIE, 'index.html'); s = open(p, encoding='utf-8').read()
sig = "function jouer(evs){\n  for(var k = 0; k < evs.length; k++){ try{ noter(evs[k]);"
assert s.count(sig) == 1
s = s.replace(sig, sig + " if(window.__evs){ var __e = evs[k]; window.__evs.push({t:performance.now(), ev:{t:__e.t, quoi:__e.quoi, att:__e.att, nom:__e.nom, on:__e.on, heros:__e.heros || null, id:__e.id || null, par:__e.par, cause:__e.cause, geste:__e.geste}}); }")
open(p, 'w', encoding='utf-8').write(s)

MUETS = collections.Counter(); SONORES = collections.Counter(); SONS_DE = collections.defaultdict(collections.Counter)

def une(nav, phase, graine):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("""window.__evs = []; window.__sons = []; try{ speechSynthesis.speak = function(){}; }catch(e){}
      (function attend(){ var S = window.SALLE && SALLE.Son; if(!S || !S.jouer){ return setTimeout(attend, 20); }
        var j = S.jouer, b = S.bruitage;
        S.jouer = function(n){ window.__sons.push({t:performance.now(), id:String(n), genre:'ancien'}); return j.apply(S, arguments); };
        if(b) S.bruitage = function(id, o){ var r = b.apply(S, arguments); window.__sons.push({t:performance.now(), dt:(o && o.dt) || 0, id:String(id), genre:r ? 'neuf' : 'absent'}); return r; };
      })();""")
    pg.goto('file://' + p + '?combat=leo&vu=1&phase=%d&%s&graine=%d' % (phase, OBJETS, graine))
    pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
    pg.mouse.click(500, 300)
    rnd = random.Random(graine); t = 0
    while t < SECONDES * 1000:
        pg.evaluate("""(r) => { var E = DJ.Leo._E(); if(!E || !E.c || E.cine) return;
          try{ E.c.leo.pv = Math.max(E.c.leo.pv, 3000 + (4 - E.c.phase) * 3000); ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = E.c.h[h]; if(S && !S.sol) S.pv = Math.max(S.pv, 60); }); }catch(e){}
          var hs = ['sage', 'alchimiste', 'pisteur'], h = hs[Math.floor(r[0] * 3)], l = E.c.gestes(h).filter(function(g){ return g.permis; });
          if(!l.length) return; var g = l[Math.floor(r[1] * l.length)], c = g.cibles && g.cibles.length ? g.cibles[Math.floor(r[2] * g.cibles.length)] : undefined;
          try{ DJ.Leo.agir(h, g.geste, c); }catch(e){} }""", [rnd.random(), rnd.random(), rnd.random()])
        pg.wait_for_timeout(900); t += 900
    d = pg.evaluate("() => ({evs:window.__evs, sons:window.__sons})")
    ctx.close()
    evs = [x for x in d['evs'] if x['ev']['t'] in ('leo', 'rat', 'boum', 'noir', 'etat', 'leo-etat', 'soin-leo') and not (x['ev']['t'] == 'etat' and x['ev'].get('heros'))]
    sons = [so for so in d['sons'] if so['genre'] != 'absent' and so['id'] not in HEROS]
    absents = collections.Counter(so['id'] for so in d['sons'] if so['genre'] == 'absent')
    for k, x in enumerate(evs):
        ev = x['ev']
        fin = min(evs[k + 1]['t'] if k + 1 < len(evs) else x['t'] + 1500, x['t'] + 2500)
        la = [so for so in sons if x['t'] - 2 <= so['t'] < max(fin, x['t'] + 120) - 2]
        cle = (phase, ev['t'], str(ev.get('quoi') or ev.get('nom') or ''), str(ev.get('att') or ev.get('par') or ''), '' if ev.get('on') is None else ('on' if ev['on'] else 'off'))
        if la:
            SONORES[cle] += 1
            for so in la: SONS_DE[cle][so['id']] += 1
        else: MUETS[cle] += 1
    print(f'  phase {phase} graine {graine} : {len(evs)} évènements de Léo, {len(sons)} sons' + (' ; sons demandés mais absents : ' + str(dict(absents)) if absents else '') + (' ; ERREURS ' + ' | '.join(errs[:2]) if errs else ''), flush=True)

with sync_playwright() as pw:
    nav = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for ph in PHASES:
        for g in GRAINES:
            try: une(nav, ph, g)
            except Exception as e: print('  raté', ph, g, str(e)[:200], flush=True)
    nav.close()
print('\n=== (phase, évènement, quoi, attaque, état) : fois muet / fois sonore ===')
for cle in sorted(set(list(MUETS) + list(SONORES))):
    m, so = MUETS[cle], SONORES[cle]
    print(f'  {"MUET   " if m and not so else "PARFOIS" if m else "sonore "} {cle} : {m} muet(s), {so} sonore(s)   ' + ', '.join(f'{a}×{b}' for a, b in SONS_DE[cle].most_common(4)))
