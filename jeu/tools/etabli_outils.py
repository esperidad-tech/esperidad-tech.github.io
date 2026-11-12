"""Les gestes d'un robot sur l'établi des plantes (enquête 3), quand il est ouvert DANS le jeu (un cadre : #etabli-cadre, src/plantes.js,
src/etabli/). Partagé par e3-alchimiste.py, partie3.py, e3-descente.py et etabli.py.
Tout se fait au doigt, pour de vrai : on touche le milieu de ce qu'on voit (la page du cadre remplit l'écran : ses coordonnées sont celles de la page).
   vite(pg)            : avant d'ouvrir l'établi — toutes ses animations vont d'un coup (les robots n'attendent pas)
   ouvrir(pg)          : M.ouvrirEtabli(), et on attend que la page du cadre soit prête
   cadre(pg)           : la page du cadre (ou None)
   intro(pg)           : l'explication en images est-elle là ?  fermer_intro(pg) : son bouton jaune
   plante(pg, k, pa)   : on touche la plante k sur le linge, puis sa partie pa (de près)
   outil(pg, o)        : on touche un outil (planche, tamis, mortier, presse, filtre, marmite, alambic, sechoir, fiole)
   porte(pg, quoi)     : on prend la cruche, l'huile, une bûche, une allumette (cruche, huilier, buches, allumettes)
   faire(pg, id)       : toute une potion, geste par geste, en suivant sa recette (PLANTES_DONNEES) ; rend True si elle est faite
   continuer(pg)       : le bouton jaune de la carte « C'est vrai ! »
   etat(pg), texte(pg) : où on en est ; la phrase de la bulle
   livre(pg), sac(pg), fermer_mode(pg), quitter(pg)"""

def vite(pg):
    pg.evaluate("() => { window.BRUMEVAL_ETABLI_VITE = true; }")

def cadre(pg):
    h = pg.query_selector('#etabli-cadre')
    return h.content_frame() if h else None

def ouvrir(pg, attente=4000):
    if not pg.query_selector('#etabli-cadre'):
        pg.evaluate("() => M.ouvrirEtabli()")
    fr = None
    for _ in range(int(attente / 100)):
        fr = cadre(pg)
        try:
            if fr and fr.evaluate("() => !!(window.__etabli && document.querySelector('#g-planche'))"): return fr
        except Exception:
            pass
        pg.wait_for_timeout(100)
    return fr

def libre(pg):
    fr = cadre(pg)
    for _ in range(150):
        if not fr: return False
        try:
            if fr.evaluate("() => window.__etabli.libre()"): return True
        except Exception:
            return False
        pg.wait_for_timeout(60)
    return False

def _milieu(pg, sel):
    fr = cadre(pg)
    return fr.evaluate("(s) => { var e = document.querySelector(s); if(!e) return null; var r = e.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }", sel)

def toucher(pg, sel, attendre=True):
    """un vrai toucher, au milieu de ce que montre sel (dans le cadre)"""
    q = _milieu(pg, sel)
    assert q, 'introuvable dans l\'établi : ' + sel
    pg.mouse.click(q[0], q[1]); pg.wait_for_timeout(70)
    if attendre: libre(pg)

def etat(pg):
    fr = cadre(pg)
    return fr.evaluate("() => { var S = window.__etabli.etat(); return {plante:S.plante, partie:S.partie, n:S.n, ou:S.ou, pos:S.pos, m:S.m && S.m.nom, H:S.H, feux:S.feux, liq:S.liq, faites:Object.keys(S.faites), mode:S.mode, nuit:S.nuit, dispo:S.dispo}; }")

def texte(pg):
    return cadre(pg).evaluate("() => window.__etabli.texte()")

def intro(pg):
    fr = cadre(pg)
    return bool(fr and fr.evaluate("() => !!document.querySelector('.carte.intro')"))

def fermer_intro(pg):
    if intro(pg): toucher(pg, '.carte.intro .b-jaune'); pg.wait_for_timeout(150)

def outil(pg, o):
    toucher(pg, '#g-' + o + ' > rect[fill=transparent]')

def porte(pg, quoi):
    toucher(pg, '#g-' + quoi + ' > rect[fill=transparent]')

def plante(pg, k, pa, pause=120):
    fr = cadre(pg)
    # la plante cueillie attend, pendue à la tringle : on la décroche d'abord (elle se couche sur le linge)
    if fr.evaluate("(k) => !!document.querySelector('#pendue-' + k)", k):
        toucher(pg, '#pendue-' + k + ' > rect[fill=transparent]'); pg.wait_for_timeout(pause + 380)
    toucher(pg, '#plante-' + k + ' .prise'); pg.wait_for_timeout(pause)
    # la plante vient vers nous (un zoom) : on attend qu'elle ne bouge plus
    avant = None
    for _ in range(40):
        q = fr.evaluate("() => { var g = document.querySelector('.plante.zoom'); if(!g) return null; var r = g.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]; }")
        if q and q == avant: break
        avant = q; pg.wait_for_timeout(70)
    # un point qui est bien sur la partie (le milieu de sa boîte peut tomber à côté : une tige en biais)
    q = fr.evaluate("""(pa) => { var g = document.querySelector('.plante.zoom .pl-pa[data-pa=' + pa + ']'); if(!g) return null; var r = g.getBoundingClientRect();
      for(var i = 6; i >= 1; i--) for(var a = 0; a < 12; a++){ var d = (6 - i)/6, x = r.left + r.width/2 + Math.cos(a/12*6.283)*r.width/2*d, y = r.top + r.height/2 + Math.sin(a/12*6.283)*r.height/2*d, el = document.elementFromPoint(x, y);
        if(el && el.closest('.pl-pa') && el.closest('.pl-pa').getAttribute('data-pa') === pa) return [x, y]; }
      return null; }""", pa)
    assert q, f'la partie {pa} de {k} ne se touche pas'
    pg.mouse.click(q[0], q[1]); pg.wait_for_timeout(pause)

def continuer(pg):
    fr = cadre(pg)
    if fr and fr.evaluate("() => !!document.querySelector('.carte.prete')"):
        toucher(pg, '.carte.prete .b-jaune'); pg.wait_for_timeout(120)
        return True
    return False

def recettes(pg):
    return pg.evaluate("() => window.PLANTES_DONNEES")

def faire(pg, pid, R=None, chaque=None):
    """toute la potion pid, geste par geste. chaque(i, etape, etat) : appelé après chaque étape."""
    R = R or recettes(pg)
    r = R['RE'][pid]
    s = etat(pg)
    if s['plante'] != r['plante'] or s['partie'] != r['partie']: plante(pg, r['plante'], r['partie'])
    for i, e in enumerate(r['etapes']):
        o = e['o']
        if e.get('verse'):
            porte(pg, 'cruche'); outil(pg, o)
        else:
            if etat(pg)['ou'] != o: outil(pg, o)
            if o in ('marmite', 'alambic'):
                if e.get('liq') == 'eau': porte(pg, 'cruche'); outil(pg, o)
                if e.get('liq') == 'huile': porte(pg, 'huilier'); outil(pg, o)
                for _ in range(e.get('feu', 0)): porte(pg, 'buches'); outil(pg, o)
                if e.get('feu', 0): porte(pg, 'allumettes'); outil(pg, o)
            if o not in ('filtre', 'sechoir', 'fiole'): outil(pg, o)
        pg.wait_for_timeout(60)
        if chaque: chaque(i, e, etat(pg))
    for _ in range(40):
        s = etat(pg)
        if pid in s['faites'] and s['mode'] == 'prete': break
        pg.wait_for_timeout(100)
    return pid in etat(pg)['faites']

def livre(pg):
    toucher(pg, '#gLivre > rect[fill=transparent]'); pg.wait_for_timeout(150)

def code(pg):
    """les sept potions sont prêtes : toucher l'étagère ouvre la carte du code (il n'y a plus de sac)"""
    fr = cadre(pg)
    if fr and fr.evaluate("() => window.__etabli.etat().mode === 'sac'"): return
    fermer_mode(pg)
    toucher(pg, '#potion-feu > rect[fill=transparent]'); pg.wait_for_timeout(150)
sac = code

def fermer_mode(pg):
    fr = cadre(pg)
    if fr and fr.evaluate("() => !!window.__etabli.etat().mode"):
        toucher(pg, '#bFermer', attendre=False); pg.wait_for_timeout(150)

def quitter(pg):
    fr = cadre(pg)
    if not fr: return
    fermer_mode(pg)
    toucher(pg, '#bQuitter', attendre=False); pg.wait_for_timeout(500)

def sans_son(pg, sel):
    """dans le cadre : les textes de plus de trois mots (p, li, figcaption) qui n'ont pas de bouton 🔊 dans leur ligne"""
    return cadre(pg).evaluate("""(sel) => { var r = [];
      [].forEach.call(document.querySelectorAll(sel + ' p, ' + sel + ' figcaption span'), function(p){
        var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
        var lg = p.closest('.lg, figcaption, .code, .ruban-p');
        if(mots > 3 && !(lg && lg.querySelector('.b-son'))) r.push(t.slice(0, 50)); });
      return r; }""", sel)
