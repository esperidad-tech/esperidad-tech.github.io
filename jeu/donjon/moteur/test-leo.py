"""Le combat de Léo à l'écran : python3 test-leo.py   (sous le verrou : flock /tmp/brumeval-pw.lock …)

Sur une tablette 1024 x 768 au doigt (les règles elles-mêmes sont vérifiées sans navigateur : node test-leo.js) :
  - le combat s'ouvre sans explication : « L'homme en cape », 10 000 points de vie ; en bas, UNE SEULE RANGÉE D'ICÔNES, rangées par
    héros (Romain, 14 novembre : plus d'onglets de héros, plus de cible à toucher) ; l'écran et les règles disent la même chose ;
  - au doigt : un toucher lance le geste (le bouclier jaune, la dague, le baume sur le plus blessé) ; une icône éteinte dit son mot ;
  - la rune de l'œil : trois petites icônes aux pieds de Léo ; son icône disparaît de la rangée ;
  - le noir (il ne se lève plus tout seul : la lumière du bâton de lune, qui éblouit Léo) et la farine (elle reste : le feu, BOUM) ;
  - la pause ; la défaite (« Réessayer » : la même phase, toute la vie revenue) ;
  - les trois phases (en trichant sur ses points de vie) : chaque cinématique se passe d'un toucher, la phase gagnée est gardée,
    le Pisteur ramasse les outils (trois coups chacun : le crochet casse et quitte la bande) ;
  - la victoire : les cinq phrases de Léo, chacune avec son 🔊 et un bouton jaune ;
  - aucune erreur JavaScript, aucune lecture vocale toute seule.
Des captures dans captures/."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
ERREURS, OK = [], []
OBJETS = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes&graine=7'


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


def ouvrir(nav, q):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error', 'warning') and 'ERR_' not in m.text else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
    pg.goto(PAGE + q)
    pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=90000)
    return ctx, pg, errs


def accord(pg):
    """ce que montre l'écran, comparé à la photo des règles"""
    return pg.evaluate("""() => { var ph = DJ.Leo.etat().photo, pb = [];
      ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var b = document.querySelector('#pv-' + h + ' b');
        if(!b || +b.textContent !== ph.heros[h].pv) pb.push(h + ' (scène) ' + (b && b.textContent) + '≠' + ph.heros[h].pv); });
      /* la rangée d'icônes : exactement celles des règles, allumées ou éteintes pareil */
      var regles = DJ.Leo.etat().barre.map(function(g){ return g.heros + '/' + g.geste + (g.permis ? '' : '-'); }).join(' ');
      var ecran = [].map.call(document.querySelectorAll('#bande .lb-g .carte'), function(c){ return c.getAttribute('data-h') + '/' + c.getAttribute('data-id') + (c.classList.contains('off') ? '-' : ''); }).join(' ');
      if(regles !== ecran) pb.push('la rangée : ' + ecran + ' ≠ ' + regles);
      var l = document.querySelector('#leo-barre > b'); if(!l || +l.textContent !== ph.leo.pv) pb.push('Léo ' + (l && l.textContent) + '≠' + ph.leo.pv);
      ph.rats.forEach(function(r){ if(!document.querySelector('#zone-' + r.id)) pb.push(r.id + ' sans zone'); });
      return pb; }""")


def soigner(pg, plancher=True):
    pg.evaluate("() => { var c = DJ.Leo._E().c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; if(!S.sol) S.pv = S.pvMax; }); }")


def test(nav):
    print('— 1. Le combat s\'ouvre')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&' + OBJETS)
    pg.wait_for_timeout(300)
    e = pg.evaluate("() => { var e = DJ.Leo.etat(); return {phase:e.phase, pv:e.photo.leo.pv, nom:document.querySelector('#leo-barre em').textContent, onglets:document.querySelectorAll('#bande .lb-h, #bande [data-act=l-heros]').length, groupes:[].map.call(document.querySelectorAll('#bande .lb-g'), function(g){ return g.getAttribute('data-h') + ':' + g.querySelectorAll('.carte').length; }), cartes:[].map.call(document.querySelectorAll('#bande .lb-g .carte'), function(c){ return c.getAttribute('data-h')[0] + ':' + c.getAttribute('data-id'); })}; }")
    verifie(e['phase'] == 1 and e['pv'] == 10000 and e['nom'] == 'L\'homme en cape', f'phase 1 : « L\'homme en cape », 10 000 points de vie ({e["nom"]}, {e["pv"]})')
    verifie(e['onglets'] == 0 and e['groupes'] == ['sage:4', 'alchimiste:6', 'pisteur:4'], f'en bas : plus d\'onglets de héros ; une seule rangée d\'icônes, un cadre par héros ({e["groupes"]})')
    verifie(e['cartes'] == ['s:oeil', 's:bouclier', 's:a:baton-chene', 's:a:cristal-lune', 'a:p:huile', 'a:p:feu', 'a:p:givre', 'a:herbes', 'a:p:baume', 'a:p:coeur', 'p:dague', 'p:p:huile', 'p:p:feu', 'p:p:givre'], f'les quatorze icônes de la phase 1 : ni flèche simple, ni arc de lune, ni louche, ni acide, ni colle, ni fumigène ({len(e["cartes"])})')
    verifie(not pg.query_selector('#conteur') and not pg.query_selector('#leo-cine .leo-aveu') and not pg.evaluate("() => DJ.fenetreOuverte()"), 'aucune explication avant le combat (on apprend en jouant)')
    verifie(accord(pg) == [], f'l\'écran et les règles disent la même chose {accord(pg)}')
    g = pg.evaluate("() => { var b = document.querySelector('#bande').getBoundingClientRect(), k = b.width / 960, l = [].map.call(document.querySelectorAll('#bande .lb-g .carte'), function(c){ var r = c.getBoundingClientRect(); return [r.width / k, r.height / k, r.bottom <= b.bottom + 1 && r.right <= b.right + 1 && r.left >= b.left - 1]; }); return {min:[Math.min.apply(null, l.map(function(x){ return x[0]; })), Math.min.apply(null, l.map(function(x){ return x[1]; }))], dedans:l.every(function(x){ return x[2]; })}; }")
    verifie(g['dedans'] and g['min'][0] >= 84 and g['min'][1] >= 58, f'tout tient dans la bande, et chaque icône reste assez grosse pour un doigt (la plus petite : {g["min"][0]:.0f} × {g["min"][1]:.0f})')
    pg.screenshot(path=os.path.join(CAP, 'leo-1.png'))

    print('— 2. Au doigt : on pianote')
    pg.tap('#bande .carte[data-h=sage][data-id=bouclier]', force=True); pg.wait_for_timeout(1300)
    b = pg.evaluate("() => { var p = DJ.Leo.etat().photo; return ['sage', 'alchimiste', 'pisteur'].filter(function(h){ return p.heros[h].bouclier === 'jaune'; }); }")
    verifie(len(b) == 1 and pg.locator('.heros.bj').count() == 1 and pg.locator('#bande .choisie, #bande .cible').count() == 0, f'le bouclier jaune : un seul toucher, personne à choisir — il est posé ({b})')
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.sage.libre", timeout=10000)
    grise = 'off' in pg.get_attribute('#bande .carte[data-h=sage][data-id="a:cristal-lune"]', 'class')
    pg.tap('#bande .carte[data-h=sage][data-id="a:cristal-lune"]', force=True); pg.wait_for_timeout(350)
    verifie(grise and pg.evaluate("() => DJ.Leo.etat().photo.heros.sage.libre"), 'la lumière, quand il fait clair : l\'icône est éteinte ; la toucher ne lance rien')
    soigner(pg)
    pv0 = pg.evaluate("() => DJ.Leo.etat().photo.leo.pv")
    pg.tap('#bande .carte[data-h=pisteur][data-id=dague]', force=True); pg.wait_for_timeout(250)
    occ = pg.evaluate("() => [].every.call(document.querySelectorAll('#bande .lb-g[data-h=pisteur] .carte'), function(c){ return c.classList.contains('off'); }) && [].some.call(document.querySelectorAll('#bande .lb-g[data-h=alchimiste] .carte'), function(c){ return !c.classList.contains('off'); })")
    pg.wait_for_timeout(1000)
    pv1 = pg.evaluate("() => DJ.Leo.etat().photo.leo.pv")
    verifie(pv0 - pv1 == 90, f'la dague : un toucher, et Léo perd 90 ({pv0} → {pv1})')
    verifie(occ, 'pendant son geste, les icônes du Pisteur sont éteintes ; pas celles des autres')
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.h.pisteur.pv = 30; c.h.sage.pv = 60; }")
    pg.tap('#bande .carte[data-h=alchimiste][data-id="p:baume"]', force=True); pg.wait_for_timeout(3000)
    e = pg.evaluate("() => { var p = DJ.Leo.etat().photo; return [p.heros.pisteur.pv >= 60, p.heros.sage.pv <= 60]; }")
    verifie(e == [True, True], 'le baume : un toucher, il va tout seul au plus blessé (le Pisteur)')
    soigner(pg)
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.sage.libre", timeout=10000)
    pg.tap('#bande .carte[data-h=sage][data-id=oeil]', force=True); pg.wait_for_timeout(2600)
    e = pg.evaluate("() => { var s = document.querySelector('#leo-suite'), r = s.getBoundingClientRect(), m = document.querySelector('#monde').getBoundingClientRect(), b = document.querySelector('#bande').getBoundingClientRect(); return {on:s.classList.contains('on'), n:s.querySelectorAll('i').length, grand:s.querySelectorAll('i.grand').length, att:[].map.call(s.querySelectorAll('i'), function(i){ return i.getAttribute('data-att'); }), regles:DJ.Leo.etat().photo.leo.suite.map(function(x){ return x.att; }), bas:Math.abs(r.bottom - b.top) < 6, oeil:document.querySelectorAll('#bande .carte[data-id=oeil]').length}; }")
    verifie(e['on'] and e['n'] == 3 and e['grand'] == 1 and e['att'] == e['regles'], f'la rune de l\'œil : aux pieds de Léo, l\'attaque qui vient (en grand) et les deux suivantes ({e["att"]})')
    verifie(e['bas'] and e['oeil'] == 0, 'ces icônes sont tout en bas de la salle ; et l\'icône de l\'œil a quitté la rangée')
    verifie(accord(pg) == [], f'l\'écran et les règles disent toujours la même chose {accord(pg)}')
    pg.screenshot(path=os.path.join(CAP, 'leo-oeil.png'))

    print('— 3. La pause')
    t0 = pg.evaluate("() => DJ.Leo._E().c.t")
    pg.tap('[data-act=l-pause]', force=True); pg.wait_for_timeout(900)
    t1 = pg.evaluate("() => DJ.Leo._E().c.t"); pg.wait_for_timeout(600); t2 = pg.evaluate("() => DJ.Leo._E().c.t")
    verifie(pg.evaluate("() => DJ.fenetreOuverte()") and abs(t2 - t1) < .02 and pg.locator('#fenetre [data-act=lire]').count() == 1, 'le bouton « Pause » : une fenêtre (avec son 🔊), et le temps s\'arrête')
    pg.tap('#fenetre [data-act=fermer].aller', force=True); pg.wait_for_timeout(500)
    verifie(pg.evaluate("() => DJ.Leo._E().c.t") > t2, '« Reprendre » : le combat repart')

    print('— 4. La défaite')
    pg.evaluate("() => { var c = DJ.Leo._E().c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ c.h[h].pv = 1; c.h[h].bouclier = null; }); }")
    pg.wait_for_function("() => DJ.Leo.etat().photo.fini === 'defaite'", timeout=40000)
    pg.wait_for_selector('#fenetre [data-act=l-encore]', timeout=10000); pg.wait_for_timeout(300)
    t = pg.inner_text('#fenetre')
    verifie('trop fort' in t and pg.locator('#fenetre [data-act=lire]').count() == 1 and 'aller' in pg.get_attribute('#fenetre [data-act=l-encore]', 'class'), f'les trois héros au sol : « … est trop fort… pour l\'instant », un 🔊, un bouton jaune « Réessayer » ({t[:40]})')
    pg.screenshot(path=os.path.join(CAP, 'leo-defaite.png'))
    pg.tap('#fenetre [data-act=l-encore]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat() && !DJ.Leo.etat().cine && DJ.Leo.etat().photo.fini === null", timeout=30000)
    e = pg.evaluate("() => { var p = DJ.Leo.etat().photo; return [DJ.Leo.etat().phase, p.leo.pv, p.heros.sage.pv, p.heros.alchimiste.pv, p.heros.pisteur.pv, p.heros.sage.sol]; }")
    verifie(e == [1, 10000, 90, 100, 120, False], f'« Réessayer » : la même phase, Léo et les héros avec toute leur vie ({e})')

    print('— 5. Phase 1 → phase 2')
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000)
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = 6030; DJ.Leo.agir('pisteur', 'dague'); }")
    pg.wait_for_function("() => DJ.Leo.etat().cine", timeout=20000); pg.wait_for_timeout(2300)
    pg.screenshot(path=os.path.join(CAP, 'leo-cine12.png'))
    verifie(pg.locator('#leo-cine [data-act=l-passer]').count() == 1, 'la cinématique : un bouton « Passer »')
    pg.tap('#leo-cine [data-act=l-passer]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat().phase === 2 && !DJ.Leo.etat().cine", timeout=30000); pg.wait_for_timeout(300)
    e = pg.evaluate("() => { var e = DJ.Leo.etat(), p = e.photo; return {nom:document.querySelector('#leo-barre em').textContent, pv:p.leo.pv, heros:[p.heros.sage.pv, p.heros.alchimiste.pv, p.heros.pisteur.pv], armes:p.armes, garde:window.PARTIE.faits['leo:phase'], cartes:[].map.call(document.querySelectorAll('#bande .lb-cartes .carte.leo-arme'), function(c){ return c.getAttribute('data-id') + c.querySelector('.l-usure').textContent; })}; }")
    verifie(e['nom'] == 'Léo' and e['pv'] == 6000 and e['heros'] == [90, 100, 120], f'phase 2 : sous la cape, « Léo » ; 6 000 points de vie ; les héros ont toute leur vie ({e["nom"]}, {e["pv"]}, {e["heros"]})')
    verifie(e['garde'] == 2, 'la phase gagnée est gardée toute seule (on reprendrait à la phase 2)')
    verifie(sorted(e['cartes']) == ['l:crochet3', 'l:fleau3', 'l:marteau3'], f'le Pisteur a ramassé le crochet, le fléau et le marteau : trois coups chacun ({e["cartes"]})')
    pg.wait_for_function("() => DJ.Leo.etat().photo.rats.length === 2", timeout=30000); pg.wait_for_timeout(700)
    verifie(accord(pg) == [] and pg.locator('#hud .zone[data-type=ennemi]').count() == 3, 'le sifflet : deux rats, chacun avec sa zone à toucher')
    pg.screenshot(path=os.path.join(CAP, 'leo-2.png'))
    # le crochet, trois fois : sur un rat (il n'y a qu'une cible : ça part tout seul), puis sur ce qui vient
    for k in range(3):
        soigner(pg)
        pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000)
        if k == 2: pg.evaluate("() => { DJ.Leo._E().c.rats.forEach(function(r){ r.mort = true; }); }")
        pg.evaluate("() => { var g = DJ.Leo._E().c.gestes('pisteur').filter(function(x){ return x.geste === 'l:crochet'; })[0]; DJ.Leo.agir('pisteur', 'l:crochet', g.cibles[0]); }")
        pg.wait_for_timeout(2200)
    c = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .lb-cartes .carte.leo-arme'), function(c){ return c.getAttribute('data-id'); })")
    verifie('l:crochet' not in c and len(c) == 2, f'au troisième coup, le crochet casse : il quitte la bande ({c})')

    print('— 6. Phase 2 → phase 3')
    soigner(pg)
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000)
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = 3030; DJ.Leo.agir('pisteur', 'fleche', 'leo'); }")
    pg.wait_for_function("() => DJ.Leo.etat().cine", timeout=20000); pg.wait_for_timeout(600)
    pg.tap('#leo-cine [data-act=l-passer]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat().phase === 3 && !DJ.Leo.etat().cine", timeout=30000); pg.wait_for_timeout(300)
    e = pg.evaluate("() => { var p = DJ.Leo.etat().photo; return [p.leo.pv, p.armes, window.PARTIE.faits['leo:phase']]; }")
    verifie(e == [3000, {'faux': 3, 'gourde': 3}, 3], f'phase 3 : 3 000 points de vie ; le Pisteur ramasse la faux et la gourde ; c\'est gardé ({e})')
    pg.evaluate("() => DJ.Leo.agir('pisteur', 'dague', 'leo')"); pg.wait_for_timeout(1000)
    verifie(pg.evaluate("() => DJ.Leo.etat().photo.leo.pv") == 3000, 'la dague ne lui fait plus rien (« Insensible ! »)')
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000); soigner(pg)
    pg.evaluate("() => DJ.Leo.agir('pisteur', 'l:faux', 'leo')"); pg.wait_for_timeout(1700)
    e = pg.evaluate("() => [DJ.Leo.etat().photo.leo.saigne, DJ.Leo.etat().photo.leo.pv < 3000, document.querySelector('#leo-etats').textContent]")
    verifie(e[0] == 1 and e[1] and '🩸' in e[2], f'la faux : il saigne, et ses points de vie descendent ({e})')
    pg.screenshot(path=os.path.join(CAP, 'leo-3.png'))

    print('— 7. La victoire : Léo parle')
    pg.evaluate("() => { DJ.Leo._E().c.leo.pv = 5; }")
    pg.wait_for_function("() => DJ.Leo.etat().aveu === 0", timeout=40000); pg.wait_for_timeout(300)
    aveux, lire, jaune = [], [], []
    for k in range(5):
        aveux.append(pg.inner_text('.leo-aveu .bulle .txt')); lire.append(pg.locator('.leo-aveu .bulle [data-act=lire]').count())
        jaune.append('aller' in pg.get_attribute('[data-act=l-aveu]', 'class'))
        if k == 1: pg.screenshot(path=os.path.join(CAP, 'leo-aveu.png'))
        pg.tap('[data-act=l-aveu]', force=True); pg.wait_for_timeout(250)
    attendus = pg.evaluate("() => DJ.Leo.AVEUX")
    verifie(aveux == ['« ' + a + ' »' for a in attendus] and len(attendus) == 5, 'Léo, battu, dit ses cinq phrases, mot pour mot (celles que Romain a validées)')
    verifie(lire == [1] * 5 and all(jaune), 'chacune a son 🔊, et un bouton jaune pour la suite')
    pg.wait_for_function("() => window.RESULTAT === 'victoire'", timeout=10000)
    verifie(pg.evaluate("() => window.PARTIE.faits['leo:phase']") == 4, 'après la dernière phrase : la victoire')
    verifie(pg.evaluate("() => window.__parle") == 0, 'aucune lecture vocale toute seule')
    verifie(errs == [], f'aucune erreur ni avertissement JavaScript {errs[:3]}')
    ctx.close()

    print('— 8. La farine et le noir ne partent plus tout seuls')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&leovite=3&' + OBJETS)
    pg.evaluate("() => { window.__soin = setInterval(function(){ var E = DJ.Leo._E(); if(!E) return; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = E.c.h[h]; if(!S.sol) S.pv = S.pvMax; }); }, 60); }")
    pg.wait_for_function("() => DJ.Leo.etat().photo.leo.nuage", timeout=60000)
    pg.wait_for_function("() => DJ.Leo.etat().photo.noir", timeout=60000); pg.wait_for_timeout(500)
    e = pg.evaluate("() => { var b = {}; DJ.Leo.etat().barre.forEach(function(g){ b[g.heros[0] + ':' + g.geste] = g.permis; }); return {noir:document.querySelector('#combat').classList.contains('noir'), nuage:DJ.Leo.etat().photo.leo.nuage, lum:b['s:a:cristal-lune'], feu:b['a:p:feu'], dague:b['p:dague'], herbes:b['a:herbes'], bouc:b['s:bouclier'] || b['s:a:baton-chene']}; }")
    verifie(e['noir'] and e['nuage'], 'la cape : il fait noir — et la farine du crochet est toujours là')
    verifie(e['lum'] and not e['feu'] and not e['dague'] and e['herbes'], f'dans le noir : Léo est intouchable (la dague et le feu sont éteints), mais on soigne, et la lumière est allumée ({e})')
    pg.screenshot(path=os.path.join(CAP, 'leo-noir.png'))
    pg.wait_for_timeout(6000)
    verifie(pg.evaluate("() => DJ.Leo.etat().photo.noir && DJ.Leo.etat().photo.leo.nuage"), 'dix-huit secondes de combat plus tard : toujours noir, toujours la farine')
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.sage.libre", timeout=20000)
    pg.tap('#bande .carte[data-h=sage][data-id="a:cristal-lune"]', force=True)
    pg.wait_for_function("() => !DJ.Leo.etat().photo.noir", timeout=10000); pg.wait_for_timeout(250)
    e = pg.evaluate("() => { var b = {}; DJ.Leo.etat().barre.forEach(function(g){ b[g.heros[0] + ':' + g.geste] = g.permis; }); return {clair:!document.querySelector('#combat').classList.contains('noir'), etape:DJ.Leo.etat().photo.leo.etape, nuage:DJ.Leo.etat().photo.leo.nuage, feu:b['a:p:feu'] || b['p:p:feu'], dague:b['p:dague']}; }")
    verifie(e['clair'] and e['etape'] in ('sonne', 'repos', 'retour', 'tient', 'farine'), f'la lumière du bâton de lune : les torches se rallument, et Léo est arrêté net ({e["etape"]})')
    verifie(e['nuage'] and not e['dague'], 'il est encore dans sa farine : la dague reste éteinte')
    pg.wait_for_function("() => DJ.Leo.etat().barre.some(function(g){ return g.geste === 'p:feu' && g.permis; })", timeout=20000)
    qui = pg.evaluate("() => DJ.Leo.etat().barre.filter(function(g){ return g.geste === 'p:feu' && g.permis; })[0].heros")
    pv0 = pg.evaluate("() => DJ.Leo.etat().photo.leo.pv")
    pg.tap(f'#bande .carte[data-h={qui}][data-id="p:feu"]', force=True)
    pg.wait_for_function("() => !DJ.Leo.etat().photo.leo.nuage", timeout=10000); pg.wait_for_timeout(300)
    pv1 = pg.evaluate("() => DJ.Leo.etat().photo.leo.pv")
    verifie(pv0 - pv1 >= 500 and not pg.evaluate("() => document.querySelector('#leo-nuage').classList.contains('on')"), f'le feu dans la farine : BOUM ({pv0} → {pv1}), le nuage est parti')
    pg.screenshot(path=os.path.join(CAP, 'leo-boum.png'))
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()

    print('— 9. La première fois : il sort de l\'ombre')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&' + OBJETS)
    verifie(pg.evaluate("() => window.PARTIE.faits['leo:vu']") == 1 and pg.evaluate("() => DJ.Leo.etat().phase") == 1, 'la première arrivée : une courte entrée, puis le combat')
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    test(nav)
    nav.close()
print(f'\n{len(OK)} vérifications réussies' + (f', {len(ERREURS)} échecs' if ERREURS else ' — tout est bon'))
for e in ERREURS: print('  ✗', e)
sys.exit(1 if ERREURS else 0)
