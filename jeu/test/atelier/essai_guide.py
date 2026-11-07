"""Le guidage du tutoriel (Atelier.guider), aux 5 tailles :
- un rond lumineux doré (« ✨ Nouveau ! ») autour de la chose à toucher, la vue glisse jusqu'à elle ;
- un toucher ailleurs : « Pas maintenant ! » (rien ne s'ouvre, rien ne bouge) ; la pièce peut toujours glisser ;
- il tient quand le moteur remonte la vue ;
- l'action faite : le rond s'en va, l'événement « atelier:guide-fait » {cible} part, le rappel fait(cible) est appelé ;
- les sept cibles : cueillette, rangement, grimoire, chaudron, paillasse, carton, potion ; guider(null) arrête ; une cible inconnue : false.
Usage : python3 essai_guide.py [390x844 ...]   (AT_INDEX=index-guide.html : le banc du guidage)"""
import sys, os, json, time
from outils_at import *
from essai import glisser_loin, rangement

TAILLES_ICI = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:] if not a.startswith('--')] or TAILLES
ECOUTE = """(() => { window.__faits = []; window.__rappels = []; document.addEventListener('atelier:guide-fait', e => __faits.push(e.detail.cible)); })()"""

def anneau(pg):
    """Le rond (à l'écran) : visible ? sur la pièce ? et le rectangle des choses guidées."""
    return pg.evaluate("""(() => { const g = document.querySelector('.at-guide'); if(!g || g.hidden) return null;
      const r = g.getBoundingClientRect(), p = document.querySelector('.at-piece').getBoundingClientRect(), n = g.querySelector('.at-guide-nouveau');
      return {x:r.left + r.width / 2, y:r.top + r.height / 2, w:r.width, h:r.height, cible:g.dataset.cible,
        visible:r.left + r.width / 2 > p.left && r.left + r.width / 2 < p.right && r.top + r.height / 2 > p.top && r.top + r.height / 2 < p.bottom,
        nouveau:!!n && n.textContent.includes('Nouveau'), guidage:document.querySelector('.at').classList.contains('at-guidage')}; })()""")
def contient(pg, sel, a):
    r = pg.evaluate(f"T.rect({json.dumps(sel)})")
    return r and a and a['x'] - a['w'] / 2 - 4 <= r['x'] <= a['x'] + a['w'] / 2 + 4 and a['y'] - a['h'] / 2 - 4 <= r['y'] <= a['y'] + a['h'] / 2 + 4
def calme_vue(pg, s=6):
    """La vue a fini de glisser (machine d'essai chargée : l'animation peut commencer en retard)."""
    t0 = time.time()
    while time.time() - t0 < s:
        if pg.evaluate("document.querySelector('.at-monde').getAnimations().length === 0"): att(pg, 80); return True
        att(pg, 100)
    return False
def guider(pg, c):
    r = pg.evaluate(f"Atelier.guider('{c}', {{fait:c => __rappels.push(c)}})")
    att(pg, 150); calme_vue(pg)
    return r
def faits(pg): return pg.evaluate("__faits.slice()")

def scenario(pg, t, B):
    W, H = t
    pg.evaluate("banc.connue = true; banc.potions = {}; banc.etat = Atelier.etatNeuf(); banc.creer()"); att(pg, 500)
    pg.evaluate(ECOUTE)
    # --- carton (en premier : la pièce est pleine de cartons) ---
    B.v(guider(pg, 'carton') is True, "Atelier.guider('carton') : d'accord")
    att(pg, 700)
    a = anneau(pg)
    kid = (pg.evaluate("banc.vue._guide()") or [''])[0]
    B.v(a and a['visible'] and a['nouveau'] and a['guidage'] and a['cible'] == 'carton' and contient(pg, f'[data-carton="{kid}"]', a), f"un rond lumineux « ✨ Nouveau ! » autour d'un carton, à l'écran ; le reste attend ({a})")
    cap(pg, 'guide-carton', t, 'g')
    # un toucher ailleurs : « Pas maintenant »
    vb0 = pg.evaluate("banc.vue._vb().pan")
    pg.evaluate("banc.vue._voir(380, 700)"); att(pg, 250)
    p = pg.evaluate("T.prise('[data-obj=lu]')") or pg.evaluate("T.prise('[data-surf=fond]')")
    if p: toucher_net(pg, p); att(pg, 400)
    B.v(p and 'pas maintenant' in (pg.evaluate("T.toast()") or '').lower() and pg.evaluate("document.querySelector('.at-grim').hidden"), f"toucher le lutrin pendant le guidage : « {(pg.evaluate('T.toast()') or '')[:40]} », rien ne s'ouvre")
    B.v(pg.evaluate("!!document.querySelector('.at-toast-lire')"), "… avec 🔊")
    # la pièce peut toujours glisser (téléphone)
    if pg.evaluate("document.querySelector('.at').classList.contains('at-glissable')"):
        pc = pg.evaluate("T.rect('.at-piece')"); pan1 = pg.evaluate("banc.vue._vb().pan")
        q = pg.evaluate("T.prise('[data-surf=sol]')") or {'x': pc['x'], 'y': pc['t'] + pc['h'] * 0.85}
        glisser(pg, q, {'x': q['x'] + 120, 'y': q['y'] + 90}, 10); att(pg, 300)
        pan2 = pg.evaluate("banc.vue._vb().pan")
        if abs(pan2['x'] - pan1['x']) + abs(pan2['y'] - pan1['y']) <= 20:      # (déjà au bord de ce côté : dans l'autre sens)
            glisser(pg, q, {'x': q['x'] - 120, 'y': q['y'] - 90}, 10); att(pg, 300); pan2 = pg.evaluate("banc.vue._vb().pan")
        B.v(abs(pan2['x'] - pan1['x']) + abs(pan2['y'] - pan1['y']) > 20 and 'cueillette' not in faits(pg), f"… la pièce glisse toujours ({pan1} → {pan2})")
    # remonter la vue (le moteur le fait à chaque rendu) : le guidage reste
    pg.evaluate("banc.creer()"); att(pg, 400); calme_vue(pg)
    a = anneau(pg)
    B.v(a and a['cible'] == 'carton' and a['visible'], "la vue remontée : le rond est toujours là, sur le carton")
    taper(pg, '.at-carton', 600)
    B.v(faits(pg) == ['carton'] and pg.evaluate("__rappels.slice()") == ['carton'] and not anneau(pg) and not pg.evaluate("Atelier.guidage()"), f"un objet sorti du carton : « atelier:guide-fait » {faits(pg)}, le rappel, le rond s'en va")
    B.v(not pg.evaluate("document.querySelector('.at').classList.contains('at-guidage')"), "… et tout l'atelier remarche")
    ouvrir_cartons_vite(pg); att(pg, 300)
    # --- cueillette ---
    pg.evaluate("Atelier.ajouter(banc.etat, 'baies', 3); Atelier.ajouter(banc.etat, 'eau', 1); banc.majVue()"); att(pg, 400)
    pg.evaluate("banc.vue._voir(1000, 500)"); att(pg, 200)
    guider(pg, 'cueillette'); att(pg, 700)
    a = anneau(pg)
    B.v(a and a['visible'] and contient(pg, '.at-tas', a), "guider('cueillette') : la vue glisse jusqu'aux ingrédients devant la porte, le rond les entoure")
    cap(pg, 'guide-cueillette', t, 'g')
    p = pg.evaluate("T.prise('[data-obj=ch]')") or pg.evaluate("T.rect('[data-obj=ch]')")
    pg.evaluate("banc.vue._voir(950, 650)"); att(pg, 200); p = pg.evaluate("T.prise('[data-obj=ch]')")
    if p: toucher_net(pg, p); att(pg, 350)
    B.v(pg.evaluate("document.querySelector('.at-grim').hidden") and 'cueillette' not in faits(pg), "toucher le chaudron : rien (pas maintenant)")
    taper(pg, '.at-tas', 500)
    B.v(faits(pg)[-1] == 'cueillette' and not anneau(pg), "toucher la cueillette : fait")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- rangement ---
    guider(pg, 'rangement'); att(pg, 700)
    a = anneau(pg)
    gid = pg.evaluate("banc.vue._guide()") or []
    sec = [g for g in gid if pg.evaluate(f"(() => {{ const o = T.objet('{g}'); const c = o && Atelier.OBJETS[o.t]; return !!(c && c.cases && !c.verre); }})()")]
    B.v(a and a['visible'] and sec, f"guider('rangement') : le rond sur un meuble qui convient aux baies (un tiroir, pas un bocal) {sec}")
    cap(pg, 'guide-rangement', t, 'g')
    cible = sec[0] if sec else rangement(pg, False)
    av = pg.evaluate("banc.etat.panier.baies || 0")
    a2 = prise_sure(pg, '.at-tas[data-tas=baies]')
    tenu = pg.evaluate("banc.vue._sel()")
    if tenu:
        # (elle tient déjà un ingrédient, choisi en touchant la cueillette : elle touche le meuble qui brille, puis une case)
        B.v(pg.evaluate(f"(() => {{ const o = T.objet('{cible}'); return !!Atelier.OBJETS[o.t].verre === !!Atelier.LIQUIDES['{tenu}']; }})()"), f"le rond va sur un meuble qui convient à ce qu'elle tient ({tenu})")
        av = pg.evaluate(f"banc.etat.panier['{tenu}'] || 0")
        taper(pg, f'[data-obj="{cible}"]', 600)
        taper_ui(pg, '.at-ouvert .at-case', 600)
        if not pg.evaluate("document.querySelector('.at-ouvert').hidden"): taper_ui(pg, '.at-ouvert .at-fermer', 300)
    else:
        for essai in range(2):
            glisser_loin(pg, a2, f'[data-obj="{cible}"]'); att(pg, 700)
            if faits(pg)[-1] == 'rangement': break
            a2 = prise_sure(pg, '.at-tas[data-tas=baies]')
    k = tenu or 'baies'
    B.v(faits(pg)[-1] == 'rangement' and (pg.evaluate(f"banc.etat.panier['{k}'] || 0") < av), f"ranger dans le meuble ({k}) : rangé, fait ({faits(pg)})")
    # --- grimoire, chaudron, paillasse ---
    for c, sel, cls in (('grimoire', '[data-obj=lu]', 'at-cal-livre'), ('chaudron', '[data-obj=ch]', ''), ('paillasse', '[data-obj=pa]', '')):
        if not pg.evaluate("document.querySelector('.at-grim').hidden"): taper_ui(pg, '.at-grim .at-fermer', 300)
        pg.evaluate("banc.vue._voir(" + ("1100, 500" if c != 'chaudron' else "200, 500") + ")"); att(pg, 200)
        guider(pg, c); att(pg, 700)
        a = anneau(pg)
        B.v(a and a['visible'] and contient(pg, sel, a), f"guider('{c}') : la vue glisse, le rond l'entoure ({a and {k: round(v) if isinstance(v, float) else v for k, v in a.items()}}, {pg.evaluate(f'T.rect({json.dumps(sel)})')})")
        if c == 'grimoire': cap(pg, 'guide-grimoire', t, 'g')
        taper(pg, sel, 600)
        # (le chaudron sans tout ce qu'il faut : un petit mot au lieu du panneau ; c'est bien lui qu'on a touché)
        B.v(faits(pg)[-1] == c and (c == 'chaudron' or not pg.evaluate("document.querySelector('.at-grim').hidden")), f"le toucher : son panneau s'ouvre, fait ({c})")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- potion ---
    pg.evaluate("banc.potions = {lumiere:1}; banc.majVue()"); att(pg, 600)
    guider(pg, 'potion'); att(pg, 700)
    a = anneau(pg)
    B.v(a and a['visible'] and contient(pg, '.at-flacon', a), "guider('potion') : le rond autour du flacon prêt devant la porte")
    taper(pg, '.at-flacon', 600)
    B.v(faits(pg)[-1] == 'potion', "toucher le flacon : fait")
    taper_ui(pg, '.at-grim .at-fermer', 300)
    # --- arrêter, cible inconnue ---
    guider(pg, 'grimoire'); att(pg, 300)
    pg.evaluate("Atelier.guider(null)"); att(pg, 200)
    B.v(not anneau(pg) and not pg.evaluate("document.querySelector('.at').classList.contains('at-guidage')") and pg.evaluate("Atelier.guidage()") is None, "Atelier.guider(null) : le guidage s'arrête")
    B.v(pg.evaluate("Atelier.guider('licorne')") is False and not anneau(pg), "une cible inconnue : false, rien ne change")
    # plus rien de bloqué : un toucher sur le lutrin ouvre le grimoire
    taper(pg, '[data-obj=lu]', 500)
    B.v('at-cal-livre' in (pg.evaluate("document.querySelector('.at-grim').className") or ''), "après le guidage, tout remarche (le lutrin ouvre le grimoire)")

if __name__ == '__main__':
    lancer(scenario, TAILLES_ICI, 'essai_guide', 'g')
