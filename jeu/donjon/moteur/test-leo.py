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
  - aucune erreur JavaScript, aucune lecture vocale toute seule ;
  - (14 novembre au soir, Bible §13.40) le nouveau Léo de la phase 2 : ses pièces cuites en images ; la gourde (il boit, le marteau
    la lui fait lâcher : elle se brise, pas de soin) ; la faux (tirée du dos, à deux mains, rangée après) ; la flèche de feu (des
    flammes sur lui) ; la rune de l'œil (ses vraies affaires) ; la cinématique 1 → 2 (la barre descend, la cape, la tunique).
  - (15 novembre, Bible §13.43) l'adresse courte ?leo=1|2|3 : droit au combat, tout l'équipement ; un essai ne garde rien : la
    descente en cours dans l'appareil reste intacte ; à la fin, « Rejouer » et un bouton par phase.   (SEUL=adresse : ce seul test)
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
      var ecran = [].map.call(document.querySelectorAll('#bande .lb-g .carte:not(.vide)'), function(c){ return c.getAttribute('data-h') + '/' + c.getAttribute('data-id') + (c.classList.contains('off') ? '-' : ''); }).join(' ');
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
    e = pg.evaluate("() => { var s = document.querySelector('#leo-suite'), r = s.getBoundingClientRect(), m = document.querySelector('#monde').getBoundingClientRect(), b = document.querySelector('#bande').getBoundingClientRect(); return {on:s.classList.contains('on'), n:s.querySelectorAll('i').length, grand:s.querySelectorAll('i.grand').length, att:[].map.call(s.querySelectorAll('i'), function(i){ return i.getAttribute('data-att'); }), regles:DJ.Leo.etat().photo.leo.suite.map(function(x){ return x.att; }), bas:Math.abs(r.bottom - b.top) < 6, oeil:document.querySelectorAll('#bande .carte[data-id=oeil]').length, vide:document.querySelectorAll('#bande .carte.vide[data-id=oeil]').length, places:[].map.call(document.querySelectorAll('#bande .lb-g[data-h=sage] .carte'), function(c){ return c.getAttribute('data-id'); })}; }")
    verifie(e['on'] and e['n'] == 3 and e['grand'] == 1 and e['att'] == e['regles'], f'la rune de l\'œil : aux pieds de Léo, l\'attaque qui vient (en grand) et les deux suivantes ({e["att"]})')
    verifie(e['bas'] and e['oeil'] == 1 and e['vide'] == 1 and e['places'] == ['oeil', 'bouclier', 'a:baton-chene', 'a:cristal-lune'], f'ces icônes sont tout en bas de la salle ; l\'icône de l\'œil a fini de servir : elle s\'éteint pour de bon, MAIS RESTE À SA PLACE — aucune icône ne bouge (Romain, 15 novembre) ({e["places"]})')
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
    e = pg.evaluate("() => { var e = DJ.Leo.etat(), p = e.photo; return {nom:document.querySelector('#leo-barre em').textContent, pv:p.leo.pv, heros:[p.heros.sage.pv, p.heros.alchimiste.pv, p.heros.pisteur.pv], armes:p.armes, garde:window.PARTIE.faits['leo:phase'], cartes:[].map.call(document.querySelectorAll('#bande .lb-cartes .carte.leo-arme'), function(c){ return c.getAttribute('data-id') + (c.querySelector('.l-usure') ? c.querySelector('.l-usure').textContent : '∞'); })}; }")
    verifie(e['nom'] == 'Léo' and e['pv'] == 6000 and e['heros'] == [90, 100, 120], f'phase 2 : sous la cape, « Léo » ; 6 000 points de vie ; les héros ont toute leur vie ({e["nom"]}, {e["pv"]}, {e["heros"]})')
    verifie(e['garde'] == 2, 'la phase gagnée est gardée toute seule (on reprendrait à la phase 2)')
    verifie(sorted(e['cartes']) == ['l:crochet∞', 'l:fleau∞', 'l:marteau∞'], f'le Pisteur a ramassé le crochet, le fléau et le marteau : ils ne s\'usent plus, pas de compteur (Romain, 15 novembre) ({e["cartes"]})')
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
    verifie(c == ['l:crochet', 'l:fleau', 'l:marteau'] and pg.locator('#bande .carte.vide').count() <= 1, f'après trois coups de crochet, il est toujours là, à sa place : il est infini ({c})')

    print('— 6. Phase 2 → phase 3')
    soigner(pg)
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000)
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = 3030; DJ.Leo.agir('pisteur', 'fleche', 'leo'); }")
    pg.wait_for_function("() => DJ.Leo.etat().cine", timeout=20000); pg.wait_for_timeout(600)
    pg.tap('#leo-cine [data-act=l-passer]', force=True)
    pg.wait_for_function("() => DJ.Leo.etat().phase === 3 && !DJ.Leo.etat().cine", timeout=30000); pg.wait_for_timeout(300)
    e = pg.evaluate("() => { var p = DJ.Leo.etat().photo; return [p.leo.pv, p.armes, window.PARTIE.faits['leo:phase']]; }")
    verifie(e == [3000, {'marteau': 3, 'faux': 3, 'gourde': 3}, 3], f'phase 3 : 3 000 points de vie ; le Pisteur ramasse la faux et la gourde, et garde le marteau ; c\'est gardé ({e})')
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

    print('— 10. Le nouveau Léo de la phase 2 (14 novembre au soir, Bible §13.40)')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&phase=2&' + OBJETS)
    n = pg.evaluate("() => { var E = DJ.Leo._E(); return {neuf:E.leo.nouveau(), cuit:LeoCorps.cuit(), pieces:Object.keys(LeoCorps.DESSINS).length, img:document.querySelectorAll('.lc .lc-p:not(.cache) > img').length, svg:document.querySelectorAll('.lc .lc-p:not(.cache) > svg').length}; }")
    verifie(n['neuf'] and n['cuit'] == n['pieces'] and n['img'] >= 20 and n['svg'] == 0, f'phase 2 : le nouveau Léo, toutes ses pièces cuites en images ({n})')
    def forcer(att):
        pg.evaluate("(a) => { var c = DJ.Leo._E().c, o = LeoRegles.L.ORDRE[c.phase]; c.leo.k = (o.indexOf(a) - 1 + o.length) % o.length; c.leo.fin = c.leo.tl + .05; c.leo.etape = 'repos'; c.leo.att = null; }", att)
    def attendre(js, t=15000):
        pg.wait_for_function(js, timeout=t)
    # la gourde : il la décroche, il boit (la potion coule dans sa bouche), le marteau l'arrête : la gourde se brise, pas de soin
    pg.evaluate("() => { DJ.Leo._E().c.leo.pv = 4000; }")
    forcer('gourde')
    attendre("() => { var z = DJ.Leo._E().c.leo; return z.att === 'gourde' && z.etape === 'elan' && DJ.Leo._E().p2.X.k > .3; }")
    g = pg.evaluate("() => { var C = DJ.Leo._E().leo.corps; return {main:C.etat.gourde, bouchon:C.etat.bouchon, visage:C.etat.visage, flot:!!document.querySelector('.lp-flot'), halo:!!document.querySelector('.lp-halo')}; }")
    verifie(g == {'main': 'main', 'bouchon': False, 'visage': 'boit', 'flot': True, 'halo': True}, f'la gourde : dans sa main, débouchée ; il boit (la potion coule dans sa bouche, le halo vert grandit) ({g})')
    pv0 = pg.evaluate("() => DJ.Leo._E().c.leo.pv")
    pg.tap('#bande .carte[data-h=pisteur][data-id="l:marteau"]', force=True)
    attendre("() => DJ.Leo._E().c.leo.etape === 'sonne'", 6000)
    pg.wait_for_timeout(900)
    c = pg.evaluate("() => { var C = DJ.Leo._E().leo.corps; return {gourde:C.etat.gourde, flot:!!document.querySelector('.lp-flot'), pv:DJ.Leo._E().c.leo.pv, visage:C.etat.visage}; }")
    verifie(c['gourde'] is None and not c['flot'] and c['pv'] <= pv0 and c['visage'] == 'ko', f'le marteau le coupe : la gourde lui échappe et se brise, pas de soin, il est sonné ({c})')
    pg.screenshot(path=os.path.join(CAP, 'leo2-gourde-cassee.png'))
    attendre("() => DJ.Leo._E().leo.corps.etat.gourde === 'ceinture'", 6000)
    verifie(True, 'puis il en a une autre à sa ceinture')
    # la faux : il la tire de son dos, la tient à deux mains, fauche ; puis la remet dans son dos
    forcer('faux')
    attendre("() => { var z = DJ.Leo._E().c.leo; return z.att === 'faux' && z.etape === 'elan'; }")
    f = pg.evaluate("() => { var C = DJ.Leo._E().leo.corps; return [C.etat.faux, C.etat.devantAr, C.etat.visage, !!document.querySelector('.lp-danger')]; }")
    verifie(f == ['main', True, 'effort', True], f'la faux : tirée du dos, à deux mains, l\'effort ; le danger rouge au sol, sous les héros ({f})')
    attendre("() => DJ.Leo._E().c.leo.etape === 'repos'", 8000)
    verifie(pg.evaluate("() => DJ.Leo._E().leo.corps.etat.faux") == 'dos', 'après le coup, la faux retourne dans son dos')
    # la flèche de feu : des flammes sur lui
    attendre("() => DJ.Leo.etat().photo.heros.pisteur.libre", 8000)
    verifie(pg.locator('#bande .carte[data-h=pisteur][data-id="p:feu"]').count() == 0 and pg.locator('#bande .carte[data-h=pisteur][data-id="p:acide"]').count() == 1, 'phase 2 : le Pisteur n\'a plus la flèche de feu ; il a la flèche d\'acide (Romain, 15 novembre)')
    pg.tap('#bande .carte[data-h=alchimiste][data-id="p:feu"]', force=True)
    attendre("() => DJ.Leo.etat().photo.leo.brule", 8000)
    verifie(pg.evaluate("() => !!document.querySelector('.lp-feu')"), 'le feu de l\'Alchimiste : Léo brûle, et ça se voit (des flammes sur lui)')
    # (15 novembre) la clarté : l'annonce de l'attaque, avec sa jauge ; la fluidité : rien ne tourne en boucle sur les héros
    attendre("() => { var Z = DJ.Leo._E().c.leo; return (Z.etape === 'prise' || Z.etape === 'elan') && !!document.querySelector('.lp-annonce span'); }", 20000)
    an = pg.evaluate("() => { var a = document.querySelector('.lp-annonce'), Z = DJ.Leo._E().c.leo; return {att:Z.att, texte:a ? a.querySelector('span').textContent : null, jauge:!!(a && a.querySelector('u'))}; }")
    verifie(bool(an['texte']) and len(an['texte'].split(' ')) <= 3 and an['jauge'], f'pendant qu\'il prépare une attaque, son nom s\'affiche en gros, avec une jauge jusqu\'au coup ({an["att"]} : « {an["texte"]} »)')
    fl = pg.evaluate("() => ({tr:!!SALLE.tempsReel, tissus:!!SALLE.tissusFiges, filtre:getComputedStyle(document.querySelector('#combat .decor')).filter, melange:getComputedStyle(document.querySelector('#leo-lueur')).mixBlendMode, leo:getComputedStyle(DJ.Leo._E().leo.el).filter})")
    verifie(fl['tr'] and fl['tissus'] and fl['filtre'] == 'none' and fl['melange'] == 'normal' and fl['leo'] == 'none', f'la fluidité : le combat est en mode « temps réel » (héros et rats sans boucles, tissus figés) ; plus de filtre sur le décor ni sur Léo, plus de lueur « fondue » ({fl})')
    # la rune de l'œil : ses vraies affaires en icônes
    pg.tap('#bande .carte[data-h=sage][data-id=oeil]', force=True)
    attendre("() => DJ.Leo.etat().photo.leo.suite", 8000)
    forcer('lancer'); pg.wait_for_timeout(200)
    ic = pg.evaluate("() => [].map.call(document.querySelectorAll('#leo-suite i'), function(i){ return i.getAttribute('data-att') + ':' + (i.querySelector('svg') ? 'dessin' : 'emoji'); })")
    verifie(any(x.endswith('dessin') for x in ic), f'la rune de l\'œil montre ses vraies affaires (le rat, la gourde, la faux, le sifflet) ({ic})')
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()

    print('— 11. La cinématique 1 → 2 : il arrache sa cape et sa tunique')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&phase=1&' + OBJETS)
    pg.evaluate("() => { DJ.Leo._E().c._blesseLeo([], 9999, 'test'); }")
    attendre("() => DJ.Leo.etat().cine && !document.querySelector('#combat').classList.contains('ouvert')", 6000)
    h = pg.evaluate("() => { var C = DJ.Leo._E().leo.corps; return [DJ.Leo._E().leo.nouveau(), C.etat.cape, C.etat.capuche, C.etat.tunique]; }")
    verifie(h == [True, True, True, True], f'tout s\'arrête, la barre des sorts descend ; il est encore en cape, capuche et tunique ({h})')
    attendre("() => !DJ.Leo._E().leo.corps.etat.cape", 9000)
    verifie(pg.evaluate("() => document.querySelector('#leo-barre em').textContent") == 'Léo' and pg.evaluate("() => !!document.querySelector('.lp-cape')"), 'il arrache sa cape (elle s\'envole) : c\'est Léo')
    attendre("() => !DJ.Leo._E().leo.corps.etat.tunique", 9000)
    verifie(True, 'puis sa tunique')
    attendre("() => !DJ.Leo.etat().cine && DJ.Leo.etat().phase === 2", 20000)
    fin = pg.evaluate("() => [document.querySelector('#combat').classList.contains('ouvert'), DJ.Leo.etat().barre.filter(function(g){ return g.geste.indexOf('l:') === 0; }).length]")
    verifie(fin == [True, 3], f'la barre remonte ; le Pisteur a ses trois outils ({fin})')
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()

    print('— 12. La phase 3 refaite : Léo sous la potion (15 novembre, Bible §13.42)')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&phase=3&vu=1&' + OBJETS)
    pg.wait_for_timeout(500)
    def att3(js, t=20000):
        pg.wait_for_function(js, timeout=t)
    def calme():
        pg.evaluate("() => { var c = DJ.Leo._E().c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; S.pv = S.pvMax; S.sol = false; S.etourdi = 0; S.act = null; }); }")
    e = pg.evaluate("() => { var E = DJ.Leo._E(), C = E.leo.corps; return {neuf:E.leo.nouveau(), forme:C.etat.forme, potion:document.querySelectorAll('.lc .lc-p:not(.cache)').length, faux:C.etat.faux, gourde:C.etat.gourde, plaies:C.etat.plaies, ech:C.ech, cuit3:document.querySelectorAll('.lc .lc-p:not(.cache) > img').length, filtre:getComputedStyle(E.leo.el).filter}; }")
    verifie(e['neuf'] and e['forme'] == 3 and e['faux'] is None and e['gourde'] is None, f'phase 3 : c\'est le nouveau Léo, sous la potion ; il n\'a plus ni sa faux ni sa gourde ({e})')
    verifie(e['potion'] >= 24 and e['cuit3'] == e['potion'] and e['plaies'] == 0 and e['filtre'] == 'none', f'ses pièces en plus (les veines, les yeux, les trapèzes) sont là, toutes cuites en images ; aucune entaille au début ; aucun filtre ({e["potion"]} pièces)')
    c3 = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .lb-g[data-h=pisteur] .carte'), function(c){ return c.getAttribute('data-id') + (c.querySelector('.l-usure') ? c.querySelector('.l-usure').textContent : '∞'); })")
    verifie('l:gourde∞' in c3 and 'l:faux3' in c3, f'le Pisteur : la gourde volée est infinie, la faux a ses trois coups ({c3})')
    # chaque attaque s'annonce, et se joue sans erreur (les héros sont soignés en douce : on regarde Léo)
    pg.evaluate("() => { window.__soin = setInterval(function(){ var E = DJ.Leo._E(); if(!E || !E.c) return; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = E.c.h[h]; S.pv = S.pvMax; S.sol = false; S.etourdi = 0; }); }, 120); }")
    vues = {}
    for nom in ['poing3', 'rafale', 'charge', 'hurlement', 'attrape', 'souffle']:
        pg.evaluate("(n) => { var c = DJ.Leo._E().c; c.leo.k = LeoRegles.L.ORDRE[3].indexOf(n); }", nom)
        pg.wait_for_function("(n) => { var Z = DJ.Leo._E().c.leo; return Z.att === n && (Z.etape === 'prise' || Z.etape === 'elan') && !!document.querySelector('.lp-annonce span'); }", arg=nom, timeout=40000)
        vues[nom] = pg.evaluate("() => document.querySelector('.lp-annonce span').textContent")
        if nom == 'souffle':
            att3("() => document.querySelectorAll('.lp-flam').length >= 10", 8000)
            fl = pg.evaluate("() => ({n:document.querySelectorAll('.lp-flam').length, img:document.querySelectorAll('img.lp-flam').length})")
            verifie(fl['n'] >= 10, f'le souffle de feu : un vrai jet de flammes ({fl["n"]} flammes, dont {fl["img"]} en image)')
        att3("() => DJ.Leo._E().c.leo.etape === 'retour' || DJ.Leo._E().c.leo.etape === 'repos'", 15000)
        calme()
    verifie(len(vues) == 6 and all(len(v.split(' ')) <= 3 for v in vues.values()), f'les six attaques de la phase 3 s\'annoncent, chacune par son nom ({vues})')
    # le feu : il ne s'arrête plus tout seul ; un soin l'éteint
    att3("() => DJ.Leo.etat().photo.heros.pisteur.brule", 15000)
    pg.evaluate("() => { clearInterval(window.__soin); }")
    pg.evaluate("() => { DJ.Leo._E().c.leo.fin += 60; }"); calme(); pg.wait_for_timeout(5200); calme()
    b1 = pg.evaluate("() => { var p = DJ.Leo.etat().photo.heros; return [p.sage.brule, p.alchimiste.brule, p.pisteur.brule, document.querySelectorAll('.heros.brule').length]; }")
    verifie(b1 == [True, True, True, 3], f'cinq secondes après, les trois héros brûlent toujours (le feu dure jusqu\'au soin) {b1}')
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.alchimiste.libre", timeout=10000)
    pg.tap('#bande .carte[data-h=alchimiste][data-id=herbes]', force=True); pg.wait_for_timeout(1800)
    b2 = pg.evaluate("() => { var p = DJ.Leo.etat().photo.heros; return [p.sage.brule, p.alchimiste.brule, p.pisteur.brule, document.querySelectorAll('.heros.brule').length]; }")
    verifie(b2 == [False, False, False, 0], f'les herbes : le feu s\'éteint sur les trois {b2}')
    # la faux : trois coups, trois entailles rouges qu'on voit, et le sang
    for k in range(3):
        calme(); pg.evaluate("() => { DJ.Leo._E().c.leo.fin += 30; }")
        pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=10000)
        pg.tap('#bande .carte[data-h=pisteur][data-id="l:faux"]', force=True)
        pg.wait_for_function("(n) => DJ.Leo._E().leo.corps.etat.plaies === n", arg=k + 1, timeout=8000)
    pg.wait_for_timeout(900)
    pl = pg.evaluate("() => { var C = DJ.Leo._E().leo.corps; return {plaies:C.etat.plaies, vues:['plaie1', 'plaie2', 'plaie3'].filter(function(n){ return C.pieces[n].vu; }).length, mare:!!document.querySelector('.lp-mare'), saigne:DJ.Leo.etat().photo.leo.saigne, faux:document.querySelectorAll('#bande .carte.vide[data-id=\"l:faux\"]').length}; }")
    verifie(pl['plaies'] == 3 and pl['vues'] == 3 and pl['mare'] and pl['saigne'] == 3, f'trois coups de faux : trois entailles rouges sur son torse, une mare de sang à ses pieds ({pl})')
    verifie(pl['faux'] == 1, 'la faux, usée, s\'éteint — et reste à sa place')
    pg.wait_for_function("() => document.querySelectorAll('.lp-sang').length > 0", timeout=6000)
    verifie(True, 'le sang goutte de ses entailles')
    pg.screenshot(path=os.path.join(CAP, 'leo-3-plaies.png'))
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()


def test_adresse(nav):
    print('— 13. L\'adresse courte donjon/?leo=3 : droit au combat de fin, et la partie gardée reste là (15 novembre, Bible §13.43)')
    CLE = 'brumeval-donjon-partie'
    ctx, pg, errs = ouvrir(nav, '?leo=3')
    pg.wait_for_timeout(400)
    e = pg.evaluate("() => { var p = window.PARTIE, D = window.DonjonDonnees; return {phase:DJ.Leo.etat().phase, sage:p.heros.sage.objets.slice().sort(), pisteur:p.heros.pisteur.objets.slice().sort(), potions:p.recettes.length === D.ORDRE_RECETTES.length, vu:p.faits['leo:vu'], essai:!!DJ.essai}; }")
    verifie(e['phase'] == 3 and e['vu'] == 1 and e['essai'], f'?leo=3 : la phase 3 tout de suite, sans la cinématique d\'entrée ({e})')
    verifie('baton-chene' in e['sage'] and 'cristal-lune' in e['sage'] and 'fleches-lourdes' in e['pisteur'] and 'fleches-argent' in e['pisteur'] and e['potions'], 'les deux bâtons du Sage, les flèches du Pisteur, toutes les potions')
    verifie(pg.evaluate("(k) => localStorage.getItem(k)", CLE) is None, 'l\'essai n\'a rien gardé dans l\'appareil')
    # une descente en cours dans l'appareil : l'essai, gagné jusqu'au bout, ne doit pas y toucher
    pg.evaluate("(k) => localStorage.setItem(k, 'DESCENTE-EN-COURS')", CLE)
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000)
    pg.evaluate("() => { DJ.Leo._E().c.leo.pv = 5; DJ.Leo.agir('pisteur', 'l:faux', 'leo'); }")     # (en phase 3, seule la faux le blesse)
    pg.wait_for_function("() => DJ.Leo.etat().aveu === 0", timeout=40000); pg.wait_for_timeout(300)
    for k in range(5):
        pg.tap('[data-act=l-aveu]', force=True); pg.wait_for_timeout(250)
    pg.wait_for_function("() => window.RESULTAT === 'victoire'", timeout=10000)
    verifie(pg.evaluate("() => window.PARTIE.faits['leo:phase']") == 4 and pg.evaluate("(k) => localStorage.getItem(k)", CLE) == 'DESCENTE-EN-COURS', 'Léo battu dans l\'essai : la descente gardée dans l\'appareil est toujours là, intacte')
    pg.wait_for_selector('#essai-fin .essai-phases button', timeout=8000)
    b = pg.evaluate("() => [].map.call(document.querySelectorAll('#essai-fin button'), function(x){ return x.textContent; })")
    verifie(b == ['Rejouer ↻', 'Phase 1', 'Phase 2', 'Phase 3'], f'à la fin de l\'essai : « Rejouer », et un bouton par phase ({b})')
    pg.screenshot(path=os.path.join(CAP, 'leo-essai-fin.png'))
    pg.tap('#essai-fin [data-act=essai-phase-2]')
    pg.wait_for_function("() => location.search === '?leo=2' && window.DJ && DJ.Leo && DJ.Leo.etat() && DJ.Leo.etat().phase === 2 && !DJ.Leo.etat().cine", timeout=90000)
    verifie(pg.evaluate("(k) => localStorage.getItem(k)", CLE) == 'DESCENTE-EN-COURS', '« Phase 2 » : la phase 2 tout de suite ; la descente gardée n\'a toujours pas bougé')
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()


def test_phase3(nav):
    print('— 14. La phase 3 après l\'essai de Romain (15 novembre, 13 h 54, Bible §13.44) : la rafale comptée, le cri et le marteau, il attrape, la charge')
    ctx, pg, errs = ouvrir(nav, '?leo=3&graine=7')
    pg.wait_for_timeout(400)
    def forcer(att):
        pg.evaluate("""(att) => { var c = DJ.Leo._E().c; clearInterval(window.__f); ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; S.pv = S.pvMax; S.sol = false; S.etourdi = 0; S.brule = 0; S.act = null; S.bouclier = null; });
          window.__f = setInterval(function(){ var e = DJ.Leo._E(); if(e && e.c.leo.etape === 'repos') e.c.leo.k = LeoRegles.L.ORDRE[3].indexOf(att) - 1; }, 40); }""", att)
        pg.wait_for_function("(a) => { var Z = DJ.Leo._E().c.leo; return Z.att === a && Z.etape === 'prise'; }", arg=att, timeout=40000)
    def etape(att, et, t=30000):
        pg.wait_for_function("(a) => { var Z = DJ.Leo._E().c.leo; return Z.att === a[0] && Z.etape === a[1]; }", arg=[att, et], timeout=t)
    pg.evaluate("() => { DJ.Leo._E().c.vu = true; }")
    pg.wait_for_function("() => SALLE.Son.bruitsEnCours && !SALLE.Son.bruitsEnCours()", timeout=90000)
    nb = pg.evaluate("() => SALLE.Son.bruitsPrets()")
    verifie(nb >= 15, f'les sons du combat sont fabriqués à l\'avance ({nb} sons prêts)')
    c3 = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .lb-g[data-h=pisteur] .carte'), function(c){ return c.getAttribute('data-id'); })")
    verifie(c3 == ['l:faux', 'l:gourde', 'l:marteau', 'p:givre', 'p:huile'], f'la rangée du Pisteur en phase 3 : la faux, la gourde, le marteau, le givre, l\'huile ({c3})')
    # la rafale : le bouclier jaune pare trois coups ; l'annonce compte les seize coups ; plus aucun filtre sur le héros frappé
    forcer('rafale')
    pg.tap('#bande .carte[data-h=sage][data-id=bouclier]', force=True)
    etape('rafale', 'coups')
    pg.wait_for_function("() => DJ.Leo._E().c.leo.coup >= 2", timeout=8000)
    pg.tap('#bande .carte[data-h=pisteur][data-id="l:gourde"]', force=True)
    pg.wait_for_function("() => DJ.Leo._E().c.leo.coup >= 7", timeout=8000)
    r = pg.evaluate("""() => { var E = DJ.Leo._E(), h = E.c.leo.cibles[0], a = document.querySelector('.lp-annonce'), H = E.A.h[h];
      return {texte:a ? a.querySelector('span').textContent : '', rouge:!!a && a.classList.contains('coups'), coup:E.c.leo.coup, filtre:getComputedStyle(H.svg).filter, anims:H.svg.getAnimations().length, lueur:!!H._coup,
        etincelles:document.querySelectorAll('.etincelle-fx').length, eclats:document.querySelectorAll('.lp-eclat-r').length}; }""")
    verifie(r['rouge'] and r['texte'].endswith('/ 16') and abs(int(r['texte'].split(' ')[0]) - r['coup']) <= 1, f'pendant la rafale, l\'annonce compte les coups : « {r["texte"]} »')
    verifie(r['filtre'] == 'none' and r['anims'] == 0 and r['lueur'], f'le héros frappé : plus de filtre sur lui, une lueur à la place ({r["filtre"]}, {r["anims"]} animation sur lui)')
    verifie(r['etincelles'] == 0 and r['eclats'] == 1, f'un coup de la rafale ne fabrique plus rien : un seul éclat, relancé, aucune étincelle ({r})')
    pg.screenshot(path=os.path.join(CAP, 'leo-3-rafale.png'))
    etape('rafale', 'retour', 15000)
    r = pg.evaluate("() => { var E = DJ.Leo._E(), h = E.c.leo.cibles[0] || 'sage'; return {coup:E.c.leo.coup, debout:['sage', 'alchimiste', 'pisteur'].every(function(x){ return !E.c.h[x].sol; })}; }")
    verifie(r['coup'] == 16 and r['debout'], f'le bouclier jaune dès l\'annonce, la gourde juste après le premier coup : les seize coups passent, tout le monde est debout ({r})')
    # le cri : le marteau le coupe
    forcer('hurlement')
    pg.tap('#bande .carte[data-h=pisteur][data-id="l:marteau"]', force=True)
    pg.wait_for_function("() => { var Z = DJ.Leo._E().c.leo; return Z.etape === 'sonne' || (Z.att === 'hurlement' && Z.etape === 'retour'); }", timeout=10000)
    r = pg.evaluate("() => { var c = DJ.Leo._E().c; return [c.leo.etape, ['sage', 'alchimiste', 'pisteur'].filter(function(h){ return c.h[h].etourdi > c.t; }).length]; }")
    verifie(r == ['sonne', 0], f'le cri : un coup de marteau pendant qu\'il se prépare le coupe, personne n\'est étourdi ({r})')
    forcer('hurlement'); etape('hurlement', 'retour', 12000)
    r = pg.evaluate("() => { var c = DJ.Leo._E().c; return ['sage', 'alchimiste', 'pisteur'].filter(function(h){ return c.h[h].etourdi > c.t + 5; }).length; }")
    verifie(r == 3, f'le cri sans marteau : les trois héros sont étourdis pour longtemps ({r})')
    # il attrape : le héros est porté par sa main, « IL VA FRAPPER », puis les deux perdent 90 % de leur vie
    forcer('attrape'); etape('attrape', 'porte')
    pg.wait_for_function("() => DJ.Leo._E().p2.X.k > .45", timeout=8000)
    r = pg.evaluate("""() => { var E = DJ.Leo._E(), Z = E.c.leo, s = document.querySelector('.h-' + Z.tenu), m = new DOMMatrix(getComputedStyle(s).transform), a = document.querySelector('.lp-annonce span');
      return {pris:Z.tenu, autre:Z.autre, haut:Math.round(m.f), cote:Math.round(m.e), texte:a ? a.textContent : '', pv:[E.c.h[Z.tenu].pv, E.c.h[Z.tenu].pvMax]}; }""")
    verifie(r['haut'] < -40 and r['cote'] > 100 and r['texte'] == 'IL VA FRAPPER' and r['pv'][0] == r['pv'][1], f'il attrape : le héros est soulevé et porté jusqu\'à Léo, sans dégât ; l\'annonce dit « IL VA FRAPPER » ({r})')
    pris, autre = r['pris'], r['autre']
    pg.screenshot(path=os.path.join(CAP, 'leo-3-porte.png'))
    etape('attrape', 'retour', 8000); pg.wait_for_timeout(250)
    pg.screenshot(path=os.path.join(CAP, 'leo-3-frappe.png'))
    pg.wait_for_timeout(1100)
    r = pg.evaluate("""(l) => { var c = DJ.Leo._E().c; return l.map(function(h){ var S = c.h[h], s = document.querySelector('.h-' + h); return [S.pv, S.pvMax, S.sol, getComputedStyle(s).transform]; }); }""", [pris, autre])
    verifie(all(x[0] == x[1] - int(x[1] * .9) and not x[2] for x in r), f'il frappe le second avec le premier : chacun perd 90 % de sa vie, ils restent debout ({[x[:3] for x in r]})')
    verifie(all(x[3] in ('none', 'matrix(1, 0, 0, 1, 0, 0)') for x in r), 'les deux héros ont retrouvé leur place')
    # la charge : mortelle sans huile
    forcer('charge'); etape('charge', 'retour', 15000)
    r = pg.evaluate("() => { var c = DJ.Leo._E().c; return ['sage', 'alchimiste', 'pisteur'].filter(function(h){ return c.h[h].sol; }).length; }")
    verifie(r == 1, f'la charge de la phase 3, sans huile : le héros percuté tombe ({r})')
    forcer('charge')
    pg.tap('#bande .carte[data-h=alchimiste][data-id="p:huile"]', force=True)
    pg.wait_for_function("() => { var Z = DJ.Leo._E().c.leo; return Z.etape === 'sol' || (Z.att === 'charge' && Z.etape === 'retour'); }", timeout=15000)
    r = pg.evaluate("() => { var c = DJ.Leo._E().c; return [c.leo.etape, ['sage', 'alchimiste', 'pisteur'].filter(function(h){ return c.h[h].sol; }).length]; }")
    verifie(r == ['sol', 0], f'… avec l\'huile lancée dès l\'annonce : il glisse, personne ne tombe ({r})')
    # la gourde : trois secondes
    pg.evaluate("() => { clearInterval(window.__f); var c = DJ.Leo._E().c; c.leo.fin += 30; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; S.pv = S.pvMax; S.sol = false; S.etourdi = 0; S.act = null; }); c.h.sage.pv = 20; }")
    pg.tap('#bande .carte[data-h=pisteur][data-id="l:gourde"]', force=True)
    pg.wait_for_timeout(2300); avant = pg.evaluate("() => DJ.Leo._E().c.h.sage.pv")
    pg.wait_for_timeout(1300); apres = pg.evaluate("() => DJ.Leo._E().c.h.sage.pv")
    verifie(avant == 20 and apres == 90, f'la gourde volée : trois secondes avant de faire son effet ({avant} puis {apres})')
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()


def test_phase1(nav):
    print('— 15. La phase 1 refaite : l\'homme en cape, le nouveau Léo habillé, ses cinq armes et leurs annonces (15 novembre, Bible §13.47)')
    ctx, pg, errs = ouvrir(nav, '?leo=1&graine=7')
    pg.wait_for_timeout(400)
    e = pg.evaluate("() => { var E = DJ.Leo._E(), C = E.leo.corps; return {neuf:E.leo.nouveau(), cape:C.etat.cape, capuche:C.etat.capuche, tunique:C.etat.tunique, arme:C.etat.arme, visages:[].filter.call(document.querySelectorAll('.lc .lc-p:not(.cache)'), function(x){ return /v-/.test(x.getAttribute('data-n') || ''); }).length, ancien:getComputedStyle(E.leo.ancien.el).display, nom:document.querySelector('#leo-barre em').textContent}; }")
    verifie(e['neuf'] and e['cape'] and e['capuche'] and e['tunique'] and e['ancien'] == 'none' and e['arme'] is None, f'phase 1 : c\'est le nouveau Léo, en capuche, tunique et cape ; l\'ancien dessin ne sert plus ; aucune arme en main au repos ({e})')
    verifie(e['nom'] == 'L\'homme en cape', f'il s\'appelle toujours « {e["nom"]} » (son visage reste caché)')
    pg.evaluate("() => { window.__soin = setInterval(function(){ var E = DJ.Leo._E(); if(!E || !E.c) return; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = E.c.h[h]; S.pv = S.pvMax; S.sol = false; S.etourdi = 0; S.attrape = false; }); E.c.leo.tenu = null; if(E.c.leo.pv < 9000) E.c.leo.pv = 9000; }, 120); }")
    vues, armes = {}, {}
    for nom in ['fleau', 'charge', 'marteau', 'meule', 'crochet', 'cape']:
        pg.evaluate("(n) => { var c = DJ.Leo._E().c; c.noir = false; document.querySelector('#combat').classList.remove('noir'); window.__k = setInterval(function(){ var e = DJ.Leo._E(); if(e && e.c.leo.etape === 'repos') e.c.leo.k = LeoRegles.L.ORDRE[1].indexOf(n) - 1; }, 40); }", nom)
        pg.wait_for_function("(n) => { var Z = DJ.Leo._E().c.leo; return Z.att === n && Z.etape === 'elan' && !!document.querySelector('.lp-annonce span'); }", arg=nom, timeout=40000)
        pg.evaluate("() => clearInterval(window.__k)")
        vues[nom] = pg.evaluate("() => document.querySelector('.lp-annonce span').textContent")
        armes[nom] = pg.evaluate("() => DJ.Leo._E().leo.corps.etat.arme")
        if nom == 'meule':
            pg.wait_for_function("() => !!document.querySelector('.leo-meule svg')", timeout=8000)
            verifie(True, 'la meule de paille quitte ses mains et roule sur les héros')
        if nom == 'crochet':
            pg.wait_for_function("() => DJ.Leo._E().c.leo.etape === 'tient'", timeout=8000); pg.wait_for_timeout(300)
            t = pg.evaluate("() => { var a = document.querySelector('.lp-annonce span'); return a ? a.textContent : ''; }")
            verifie(t == 'IL SERRE', f'le crochet a pris un héros : l\'annonce dit « {t} », et sa jauge court jusqu\'à ce qu\'il l\'écrase')
            pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.fin = c.leo.tl + .2; }")
        pg.wait_for_function("() => { var e = DJ.Leo._E().c.leo.etape; return e === 'retour' || e === 'repos'; }", timeout=20000)
        pg.evaluate("() => { var E = DJ.Leo._E(), c = E.c; c.leo.nuage = false; c.leo.boum = false; var n = document.querySelector('#leo-nuage'); if(n) n.classList.remove('on'); E.leo.voile(0); }")
    verifie(len(vues) == 6 and all(len(v.split(' ')) <= 3 for v in vues.values()), f'les six attaques de la phase 1 s\'annoncent, chacune par son nom ({vues})')
    verifie(armes == {'fleau': 'fleau', 'charge': None, 'marteau': 'marteau', 'meule': 'meule', 'crochet': 'crochet', 'cape': None}, f'on voit dans sa main l\'arme qu\'il a sortie ({armes})')
    pg.wait_for_function("() => DJ.Leo._E().c.leo.etape === 'repos'", timeout=20000); pg.wait_for_timeout(200)
    verifie(pg.evaluate("() => DJ.Leo._E().leo.corps.etat.arme") is None, 'l\'attaque finie, il range son arme')
    pg.screenshot(path=os.path.join(CAP, 'leo-1-neuf.png'))
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()


def test_filet(nav):
    print('— 16. Le filet du 15 novembre au soir (Romain, 19 h 28 et 21 h 14 : « ça bug et ça quitte […] s\'il faut qu\'on se retape tout, c\'est pas possible ») : plus de filtre sur les sorts, tous les sons prêts, la phase dans l\'adresse, le témoin')
    ctx, pg, errs = ouvrir(nav, '?leo=2')
    pg.wait_for_timeout(300)
    e = pg.evaluate("""() => { var S = SALLE.Son, p = S.precalcul.etat(); return {bruits:S.bruitsPrets(), enCours:S.bruitsEnCours(), occupe:p.occupe, file:p.file.length, liste:S.bruitsListe().map(function(x){ return x[0]; })}; }""")
    verifie(e['bruits'] >= 24 and not e['enCours'] and not e['occupe'] and not e['file'], f'quand le combat s\'ouvre, tous ses sons sont fabriqués et plus rien ne se fabrique ({e["bruits"]} sons ; en cours : {e["enCours"]}, {e["occupe"]}, {e["file"]})')
    verifie('leoFauxB' in e['liste'] and any(x.startswith('icone') for x in e['liste']) and any(x.startswith('potHuile') for x in e['liste']), 'dont le clic des icônes, la fiole d\'huile et la faux de Léo dans la version que le jeu joue (B)')
    # des sorts des trois héros en même temps (Romain : « un combo des 3 ») : aucun élément filtré, fondu ou masqué n\'apparaît dans la scène
    pg.evaluate("""() => { window.__filtres = {}; window.__sc = setInterval(function(){ var l = document.querySelectorAll('#monde *');
      for(var i = 0; i < l.length; i++){ if(l[i].classList && l[i].classList.contains('cu')) continue;      /* (les pièces cuites des héros : deux sont découpées, depuis toujours — ce ne sont pas des effets de sort) */
        var cs = getComputedStyle(l[i]); if((cs.filter && cs.filter !== 'none') || (cs.mixBlendMode && cs.mixBlendMode !== 'normal') || (cs.clipPath && cs.clipPath !== 'none')) window.__filtres[(l[i].className || l[i].tagName) + ' ' + cs.filter + ' ' + cs.mixBlendMode + ' ' + cs.clipPath] = 1; } }, 80); }""")
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.pisteur.libre", timeout=20000)
    for trio in [[('sage', 'bouclier'), ('alchimiste', 'herbes'), ('pisteur', 'dague')], [('sage', 'oeil'), ('alchimiste', 'p:huile'), ('pisteur', 'p:acide')], [('sage', 'rune'), ('alchimiste', 'p:feu'), ('pisteur', 'l:marteau')], [('sage', 'bouclier'), ('alchimiste', 'p:baume'), ('pisteur', 'l:fleau')]]:
        pg.evaluate("() => { var c = DJ.Leo._E().c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; S.sol = false; S.pv = Math.round(S.pvMax * .6); S.bouclier = null; }); c.leo.pv = 5500; }")
        for h, g in trio:
            c = pg.query_selector('#bande .lb-g .carte[data-h="%s"][data-id="%s"]' % (h, g))
            if c and 'off' not in (c.get_attribute('class') or ''): c.tap(force=True)
        pg.wait_for_timeout(2600)
    f = pg.evaluate("() => { clearInterval(window.__sc); return Object.keys(window.__filtres); }")
    verifie(f == [], f'les trois héros lancent leurs sorts en même temps, quatre fois : aucun filtre, aucun fondu, aucun masque dans la scène {f[:4]}')
    # la phase gagnée s'écrit dans l'adresse : une page qui se recharge (ou qui se ferme toute seule) reprend à cette phase
    pg.evaluate("() => { var c = DJ.Leo._E().c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ c.h[h].sol = false; c.h[h].pv = c.h[h].pvMax; c.h[h].act = null; }); c.leo.pv = 3001; DJ.Leo.agir('pisteur', 'dague', 'leo'); }")
    pg.wait_for_function("() => /[?&]leo=3/.test(location.search)", timeout=30000)
    verifie(True, f'la phase 2 gagnée : l\'adresse d\'essai devient {pg.evaluate("() => location.search")}')
    # le témoin : pendant le combat, l'appareil note où l'on en est ; quitter la page exprès l'efface
    pg.wait_for_function("() => DJ.Leo.etat() && DJ.Leo.etat().phase === 3 && !DJ.Leo.etat().cine", timeout=120000)
    pg.wait_for_function("() => (localStorage.getItem('brumeval-donjon-leo') || '').indexOf('phase 3') === 0", timeout=30000)
    t = pg.evaluate("() => localStorage.getItem('brumeval-donjon-leo')")
    verifie('phase 3 : ' in t, f'pendant le combat, le témoin dit où l\'on en est (« {t.split("|")[0]} »)')
    pg.reload(); pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
    e = pg.evaluate("() => ({phase:DJ.Leo.etat().phase, n:DJ.plantagesLeo(), leger:!!SALLE.leger})")
    verifie(e['phase'] == 3 and e['n'] == 0 and not e['leger'], f'la page rechargée exprès : on reprend à la phase 3, et ce n\'est pas compté comme un plantage ({e})')
    # la page fermée toute seule (le témoin est resté) : compté, dit dans « Pause », et les effets sont allégés
    pg.evaluate("() => { window.removeEventListener('pagehide', function(){}); localStorage.setItem('brumeval-donjon-leo-essai', '1'); }")
    ctx2 = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True, storage_state={'cookies': [], 'origins': []})
    ctx2.close()
    pg.add_init_script("try{ if(!sessionStorage.getItem('une-fois')){ sessionStorage.setItem('une-fois', '1'); localStorage.setItem('brumeval-donjon-leo', 'phase 3 : La charge (il arme son coup), sage bouclier|' + Date.now()); } }catch(e){}")
    pg.goto(PAGE + '?leo=3'); pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
    e = pg.evaluate("() => ({n:DJ.plantagesLeo(), ou:DJ.plantageLeoOu(), leger:!!SALLE.leger})")
    verifie(e['n'] == 1 and 'La charge' in e['ou'] and e['leger'], f'la page fermée toute seule en plein combat : comptée, avec ce qui se passait, et les effets sont allégés ({e})')
    pg.tap('[data-act=l-pause]', force=True); pg.wait_for_timeout(400)
    v = pg.evaluate("() => { var e = document.querySelector('.version'); return e ? e.textContent : ''; }")
    verifie('Version du' in v and 'fermé tout seul 1 fois' in v and 'La charge' in v, f'la fenêtre « Pause » donne la version et le plantage ({v[:150]})')
    pg.evaluate("() => { ['brumeval-donjon-plantages-leo', 'brumeval-donjon-plantage-leo-ou', 'brumeval-donjon-leo'].forEach(function(k){ localStorage.removeItem(k); }); }")
    verifie(errs == [], f'aucune erreur {errs[:3]}')
    ctx.close()


with sync_playwright() as p:
    nav = p.chromium.launch()
    seul = os.environ.get('SEUL')
    if not seul: test(nav)
    if not seul or seul == 'adresse': test_adresse(nav)
    if not seul or seul == 'phase3': test_phase3(nav)
    if not seul or seul == 'phase1': test_phase1(nav)
    if not seul or seul == 'filet': test_filet(nav)
    nav.close()
print(f'\n{len(OK)} vérifications réussies' + (f', {len(ERREURS)} échecs' if ERREURS else ' — tout est bon'))
for e in ERREURS: print('  ✗', e)
sys.exit(1 if ERREURS else 0)
