"""Le combat de Léo à l'écran : python3 test-leo.py   (sous le verrou : flock /tmp/brumeval-pw.lock …)

Sur une tablette 1024 x 768 au doigt (les règles elles-mêmes sont vérifiées sans navigateur : node test-leo.js) :
  - le combat s'ouvre sans explication : « L'homme en cape », 10 000 points de vie, les trois héros en bas, les cartes du Pisteur
    (sans l'arc de lune) ; l'écran et les règles disent la même chose ;
  - au doigt : un héros, une carte, une cible (le bouclier jaune sur le Pisteur) ; une carte refusée dit son mot ;
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
      ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var b = document.querySelector('#pv-' + h + ' b'), t = document.querySelector('#lbn-' + h);
        if(!b || +b.textContent !== ph.heros[h].pv) pb.push(h + ' (scène) ' + (b && b.textContent) + '≠' + ph.heros[h].pv);
        if(!t || +t.textContent !== ph.heros[h].pv) pb.push(h + ' (bande) ' + (t && t.textContent) + '≠' + ph.heros[h].pv); });
      var l = document.querySelector('#leo-barre > b'); if(!l || +l.textContent !== ph.leo.pv) pb.push('Léo ' + (l && l.textContent) + '≠' + ph.leo.pv);
      ph.rats.forEach(function(r){ if(!document.querySelector('#zone-' + r.id)) pb.push(r.id + ' sans zone'); });
      return pb; }""")


def soigner(pg, plancher=True):
    pg.evaluate("() => { var c = DJ.Leo._E().c; ['sage', 'alchimiste', 'pisteur'].forEach(function(h){ var S = c.h[h]; if(!S.sol) S.pv = S.pvMax; }); }")


def test(nav):
    print('— 1. Le combat s\'ouvre')
    ctx, pg, errs = ouvrir(nav, '?combat=leo&vu=1&' + OBJETS)
    pg.wait_for_timeout(300)
    e = pg.evaluate("() => { var e = DJ.Leo.etat(); return {phase:e.phase, pv:e.photo.leo.pv, nom:document.querySelector('#leo-barre em').textContent, onglets:document.querySelectorAll('#bande .lb-h').length, sel:e.sel, cartes:[].map.call(document.querySelectorAll('#bande .lb-cartes .carte'), function(c){ return c.getAttribute('data-id'); })}; }")
    verifie(e['phase'] == 1 and e['pv'] == 10000 and e['nom'] == 'L\'homme en cape', f'phase 1 : « L\'homme en cape », 10 000 points de vie ({e["nom"]}, {e["pv"]})')
    verifie(e['onglets'] == 3 and e['sel'] == 'pisteur' and 'fleche' in e['cartes'] and 'dague' in e['cartes'] and 'f:fleches-lourdes' in e['cartes'], f'en bas : les trois héros, et les cartes du Pisteur ({len(e["cartes"])})')
    verifie('f:fleches-argent' not in e['cartes'], 'l\'arc de lune n\'est pas dans la bande (Romain : on l\'enlève sans rien dire)')
    verifie(not pg.query_selector('#conteur') and not pg.query_selector('#leo-cine .leo-aveu') and not pg.evaluate("() => DJ.fenetreOuverte()"), 'aucune explication avant le combat (on apprend en jouant)')
    verifie(accord(pg) == [], f'l\'écran et les règles disent la même chose {accord(pg)}')
    pg.screenshot(path=os.path.join(CAP, 'leo-1.png'))

    print('— 2. Au doigt')
    pg.tap('#bande .lb-h[data-id=sage]', force=True); pg.wait_for_timeout(250)
    c = pg.evaluate("() => [].map.call(document.querySelectorAll('#bande .lb-cartes .carte'), function(c){ return c.getAttribute('data-id'); })")
    verifie(c == ['oeil', 'rune', 'a:cristal-lune', 'bouclier', 'a:baton-chene'], f'le Sage : l\'œil, la rune, la lune, le bouclier jaune et les deux boucliers de chêne ({c})')
    pg.tap('#bande .carte[data-id=bouclier]', force=True); pg.wait_for_timeout(200)
    verifie(pg.evaluate("() => DJ.Leo.etat().geste") == 'bouclier' and pg.locator('#bande .lb-h.cible').count() == 3, 'le bouclier jaune : on choisit qui (les trois onglets clignotent)')
    pg.tap('#bande .lb-h[data-id=pisteur]', force=True); pg.wait_for_timeout(1300)
    verifie(pg.evaluate("() => DJ.Leo.etat().photo.heros.pisteur.bouclier") == 'jaune' and pg.locator('.h-pisteur.bj').count() == 1, 'un toucher sur l\'onglet du Pisteur : il a son bouclier jaune (la bulle « −75 % »)')
    pg.tap('#bande .lb-h[data-id=sage]', force=True); pg.wait_for_timeout(200)
    grise = 'off' in pg.get_attribute('#bande .carte[data-id=rune]', 'class')
    pg.wait_for_function("() => DJ.Leo.etat().photo.heros.sage.libre", timeout=10000)
    pg.tap('#bande .carte[data-id=rune]', force=True); pg.wait_for_timeout(350)
    verifie(grise and pg.evaluate("() => DJ.Leo.etat().photo.heros.sage.libre && DJ.Leo.etat().geste === null"), 'une carte sans cible (la rune, sans rat) est grisée ; la toucher ne lance rien')
    soigner(pg)
    pg.tap('#bande .lb-h[data-id=pisteur]', force=True); pg.wait_for_timeout(200)
    pv0 = pg.evaluate("() => DJ.Leo.etat().photo.leo.pv")
    pg.tap('#bande .carte[data-id=fleche]', force=True); pg.wait_for_timeout(2500)
    pv1 = pg.evaluate("() => DJ.Leo.etat().photo.leo.pv")
    verifie(pv0 - pv1 == 45, f'la flèche n\'a qu\'une cible : elle part toute seule, et Léo perd 45 ({pv0} → {pv1})')
    verifie(accord(pg) == [], f'l\'écran et les règles disent toujours la même chose {accord(pg)}')

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
    pg.evaluate("() => { var c = DJ.Leo._E().c; c.leo.pv = 6030; DJ.Leo.agir('pisteur', 'fleche', 'leo'); }")
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

    print('— 8. La première fois : il sort de l\'ombre')
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
