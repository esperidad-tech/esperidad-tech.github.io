"""Les gestes d'un robot pour la cueillette des sept plantes (src/cueillette.js ; D.PLANTES, donnees.js ; Bible §13.26).
Par les actions du jeu, sans viser la carte : pour les robots qui ont autre chose à vérifier (e3-alchimiste.py, partie3.py, e3-descente.py…).
Le robot qui touche la vraie carte au doigt, endroit par endroit : e3-cueillette.py.

   import cueillette_outils as CU
   CU.bertille(pg)             # au clocher : Anselme sonne Bertille, la brume du nord et de l'ouest recule
   CU.cueillir(pg, 'oseille')  # trouve l'endroit et cueille ; rend le texte de la bulle (None : pas de bouton — trop tôt, déjà cueillie, hors d'atteinte)
   CU.tout(pg)                 # Bertille, puis les sept plantes (le souci et le lin ne se cueillent pas le matin : voir « forcer »)
   CU.tisane(pg)               # rapporter de la mélisse à Anselme (il faut l'avoir cueillie)
Depuis le 12 novembre, 15 h 39 (Bible §13.27) : trois plantes au village, quatre au-delà de la brume (la mélisse y est partie).
"""
VILLAGE = ['oseille', 'souci', 'lin']
LOIN = ['melisse', 'lycopode', 'vesse', 'gui']
TOUTES = VILLAGE + LOIN

def _fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def trouver(pg, pid):
    """touche l'endroit de la plante (par l'action du jeu) ; rend le texte de la fenêtre"""
    pg.evaluate("(id) => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); M.A.cachette({dataset:{id:id}, closest:function(){ return null; }}); }", pid)
    pg.wait_for_timeout(200)
    return pg.evaluate("() => { var e = document.querySelector('#voile'); return e && !e.hidden ? e.innerText.replace(/\\s+/g, ' ') : ''; }")

def cueillir(pg, pid):
    t = trouver(pg, pid)
    b = pg.locator(f'#voile [data-act=cueillir-plante][data-id={pid}]')
    if not b.count():
        _fermer(pg); return None
    # (le bouton est touché par la page elle-même : un clic à ses coordonnées pouvait tomber à côté pendant que la fenêtre finissait d'arriver,
    #  et la plante n'était pas cueillie sans que le robot le sache — vu une fois dans partie3.py le 12 novembre)
    avant = pg.evaluate("(id) => (M.plantes()[id] || 0)", pid)
    pg.evaluate("(id) => { var b = document.querySelector('#voile [data-act=cueillir-plante][data-id=\"' + id + '\"]'); if(b) b.click(); }", pid); pg.wait_for_timeout(200)
    t2 = pg.evaluate("() => { var e = document.querySelector('#voile'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }")
    pris = pg.evaluate("(id) => (M.plantes()[id] || 0)", pid) > avant
    _fermer(pg)
    return (t + ' | ' + t2) if pris else None

def bertille(pg):
    """l'Alchimiste demande à Anselme de sonner Bertille ; rend le texte de la scène"""
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(200)
    b = pg.locator('#voile [data-act=point][data-id=bertille]')
    if not b.count():
        _fermer(pg); return None
    b.first.click(force=True); pg.wait_for_timeout(300)
    t = pg.evaluate("() => { var e = document.querySelector('#voile'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }")
    _fermer(pg)
    return t

def tisane(pg):
    """l'Alchimiste rapporte de la mélisse à Anselme ; rend le texte de la scène (None : le point n'est pas là — pas de mélisse, ou déjà fait)"""
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); M.A.lieu({dataset:{id:'clocher'}, closest:function(){ return null; }}); }"); pg.wait_for_timeout(200)
    b = pg.locator('#voile [data-act=point][data-id=tisane]')
    if not b.count():
        _fermer(pg); return None
    b.first.click(force=True); pg.wait_for_timeout(300)
    t = pg.evaluate("() => { var e = document.querySelector('#voile'); return e ? e.innerText.replace(/\\s+/g, ' ') : ''; }")
    _fermer(pg)
    return t

def tout(pg, forcer=False):
    """Bertille, puis toutes les plantes qui se cueillent à ce moment. forcer : le souci et le lin aussi, même le matin (le robot avance
    l'heure le temps de les cueillir, puis la remet : un raccourci d'essai, pas un geste de joueur). Rend la liste des plantes cueillies."""
    if not pg.evaluate("() => !!M.P().vus['alchimiste:clocher:bertille']"): bertille(pg)
    faites = []
    for pid in TOUTES:
        if cueillir(pg, pid): faites.append(pid)
    if forcer:
        m0 = pg.evaluate("() => M.P().moment")
        reste = [pid for pid in TOUTES if not pg.evaluate("(id) => !!M.P().vus['plante:' + id]", pid)]
        if reste and m0 < 1:
            pg.evaluate("() => { M.P().moment = 1; }")
            for pid in reste:
                if cueillir(pg, pid): faites.append(pid)
            pg.evaluate("(m) => { M.P().moment = m; M.sauver(); M.render(); }", m0)
    return faites
