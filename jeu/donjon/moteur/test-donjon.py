"""Le donjon complet, par l'écran : flock /tmp/brumeval-pw.lock python3 test-donjon.py

Une tablette 1024 x 768 au doigt. Trois parties :
  1. LA VISITE (index.html?sanscombat=1 : les combats sont tenus pour gagnés) : le sac, le fond du puits, la carte et sa brume,
     chaque salle sans combat et ce qu'on y touche (bourse, sacoche, herbes et fleur à code, coffre à choix, tas d'os, crâne
     secret, couloir aux dalles, page déchirée, lutrin, trois portes, sarcophage et amulette, feu de camp, Moustache, Léo),
     les codes (page de sauvegarde, recette), « 🎒 Objets », la page rechargée en route, et l'écran de fin ;
  2. UN VRAI COMBAT depuis la carte (la salle des rats) : gagné, on revient sur la carte ; la page rechargée en plein combat
     ramène à l'entrée de la salle ; la fuite ramène à la sauvegarde, avec le sac à refaire ;
  3. partout : aucune erreur JavaScript, aucune lecture vocale sans bouton 🔊, et chaque texte de plus de 3 mots a son 🔊.
Des captures dans captures/."""
import os, sys, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
ERREURS, OK = [], []


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


class Jeu:
    def __init__(self, nav, url, nom):
        self.ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
        self.pg = self.ctx.new_page(); self.errs = []; self.nom = nom; self.n = 0
        self.pg.on('pageerror', lambda e: self.errs.append('pageerror: ' + str(e)))
        self.pg.on('console', lambda m: self.errs.append(m.type + ': ' + m.text[:160]) if m.type in ('error', 'warning') else None)
        self.pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        self.pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
        self.pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; }; }catch(e){}")
        self.pg.goto(url); self.pg.wait_for_timeout(700)

    def js(self, code):
        return self.pg.evaluate('() => ' + code)

    def etat(self):
        return self.js('DJ.Explo.etat()')

    def partie(self):
        return self.js('DJ.Explo._X().partie')

    def attends(self, code, ms=40000):
        t = 0
        while t < ms and not self.js(code):
            self.pg.wait_for_timeout(150); t += 150
        return self.js(code)

    def carte(self):
        r = self.attends("DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe"); self.pg.wait_for_timeout(450); return r

    def scene(self, lieu=None):
        r = self.attends("DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe" + (" && DJ.Explo.etat().scene === '%s'" % lieu if lieu else '')); self.pg.wait_for_timeout(600); return r

    def libre(self):
        return self.attends("!DJ.Explo.etat().occupe")

    def tap(self, sel):
        self.pg.tap(sel, force=True); self.pg.wait_for_timeout(300)

    def clic(self, sel):
        self.pg.eval_on_selector(sel, 'e => e.click()'); self.pg.wait_for_timeout(300)

    def va(self, lieu):
        i = self.pg.evaluate("(v) => DJ.Explo.etat().sorties.indexOf(v)", lieu)
        if i < 0:
            verifie(False, f'pas de sortie vers {lieu} depuis {self.etat()["ici"]} (sorties : {self.etat()["sorties"]})'); return False
        self.clic('.cd-sortie[data-i="%d"]' % i); self.pg.wait_for_timeout(500); return True

    def chemin(self, *lieux):
        for l in lieux:
            if not self.va(l): return False
            self.carte()
        return True

    def objet(self, id, option=None):
        self.pg.evaluate("([id, o]) => { var S = DJ.Explo._S(), e = S.o[id]; (o == null ? e : e.options[o]).zone.click(); }", [id, option]); self.pg.wait_for_timeout(400)

    def repartir(self):
        self.libre(); self.tap('#b-repartir'); return self.carte()

    def cap(self, nom):
        self.n += 1; self.pg.screenshot(path=os.path.join(CAP, '%s-%02d-%s.png' % (self.nom, self.n, nom)))

    def sans_lire(self):
        """les textes de plus de 3 mots sans bouton 🔊 (la bulle du conteur, les lignes des fenêtres)"""
        return self.js("""(function(){ var pb = []; document.querySelectorAll('#conteur, #fenetre .ligne:not(.vide):not(.petit), #fin-donjon .bulle').forEach(function(e){
          var t = e.textContent.replace(/🔊/g, '').trim(); if(t.split(/\\s+/).length > 3 && !e.querySelector('.lire')) pb.push(t.slice(0, 40)); }); return pb; })()""")

    def code_montre(self):
        return self.js("[].map.call(document.querySelectorAll('#fenetre .code-gros small'), function(s){ return s.textContent; }).join('-')")

    def fin(self):
        errs = [x for x in self.errs if 'fonts.g' not in x and 'ERR_' not in x]
        verifie(not errs, f'{self.nom} : aucune erreur ni avertissement JavaScript' + (' — ' + ' | '.join(sorted(set(errs))[:4]) if errs else ''))
        verifie(self.js('window.__parle') == 0, f'{self.nom} : aucune lecture vocale toute seule')
        self.ctx.close()


def noms_code(pg, id):
    return pg.evaluate("(id) => DONJON_CODES.code(id).map(function(k){ return DONJON_CODES.SYM[k].n; }).join('-')", id)


def visite(nav):
    print('— La visite (combats tenus pour gagnés)')
    J = Jeu(nav, PAGE + '?nouveau=1&graine=7&sanscombat=1', 'visite'); pg = J.pg
    # le sac
    verifie(J.js("document.querySelectorAll('#sac .recette').length") == 7, 'le sac propose 7 recettes au départ (dont l\'Acide)')
    verifie(J.js("document.querySelector('#sac .aller').disabled"), '« Descendre » attend trois recettes')
    for r in ['feu', 'huile', 'baume', 'colle']:
        J.tap('.recette[data-id="%s"]' % r)
    verifie(J.js("document.querySelectorAll('#sac .recette.choisie').length") == 3, 'le sac refuse une 4e recette')
    verifie(not J.sans_lire(), 'le sac : la bulle du conteur a son 🔊')
    J.cap('sac'); J.tap('[data-act="sac-pret"]')
    verifie(J.scene('puits'), 'on arrive au fond du puits (une salle vue de côté, les trois héros à gauche)')
    verifie(J.js("document.querySelectorAll('#scene .perso.heros').length") == 3 and J.js("!!document.querySelector('#b-repartir.guide')"), 'le puits : rien à prendre, « Repartir » porte le rond jaune')
    J.cap('puits'); J.repartir()
    e = J.etat()
    verifie(e['ecran'] == 'carte' and sorted(e['sorties']) == ['aeration', 'galerie', 'rats'], f'la carte : trois passages partent du puits ({e["sorties"]})')
    verifie(J.js("DJ.Explo._X().V.brume.estVu('puits') && !DJ.Explo._X().V.brume.estVu('rats')"), 'la brume cache tout sauf le puits')
    verifie(J.js("document.querySelectorAll('#explo #volumes .vol').length") == 2, 'la carte a les deux curseurs de volume')
    J.cap('carte')
    # la galerie : la bourse
    J.va('galerie'); J.scene('galerie'); J.objet('bourse'); J.libre(); pg.wait_for_timeout(300)
    verifie(J.partie()['or'] > 0, f'la galerie : la bourse donne de l\'or ({J.partie()["or"]})')
    J.repartir(); J.chemin('puits')
    # l'aération : la sacoche (un objet porté) et les herbes (un objet à code)
    J.va('aeration'); J.scene('aeration'); J.objet('sacoche'); J.libre(); pg.wait_for_timeout(300)
    verifie('sacoche' in J.partie()['heros']['alchimiste']['objets'], 'l\'aération : la sacoche va à l\'Alchimiste')
    J.objet('herbes'); pg.wait_for_selector('#fenetre .code-gros', timeout=15000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'plante:lumiere'), f'les herbes lumineuses montrent leur code pour l\'Alchimiste ({J.code_montre()})')
    verifie(not J.sans_lire(), 'la fenêtre du code : chaque texte a son 🔊 ' + str(J.sans_lire()))
    J.cap('code-herbes'); J.clic('#fenetre .aller'); J.repartir(); J.chemin('puits')
    # la salle des rats (tenue pour gagnée), la réserve et son coffre à choix
    J.va('rats'); J.carte()
    verifie(J.etat()['ici'] == 'rats' and 'combat:rats' in J.partie()['faits'], 'la salle des rats est passée')
    # la réserve (Romain, 10 novembre) : pas de texte en bas, l'équipement du Pisteur au-dessus de sa tête, deux places
    J.va('reserve'); J.scene('reserve')
    verifie(J.js("getComputedStyle(document.querySelector('#conteur')).visibility") == 'hidden' and J.js("document.querySelector('#b-repartir').textContent").startswith('Continuer'), 'la réserve : pas de petit texte en bas ; le bouton dit « Continuer »')
    verifie(J.js("document.querySelectorAll('#plaque-pisteur .pl-case').length") == 2 and J.js("document.querySelectorAll('#plaque-pisteur .pl-case.pleine').length") == 1 and J.partie()['heros']['pisteur']['objets'] == ['fleches-normales'],
            'l\'équipement du Pisteur s\'affiche : deux places, ses flèches normales dans la première')
    J.objet('coffre'); pg.wait_for_timeout(2400); J.libre()
    J.objet('fleches-argent'); pg.wait_for_timeout(400)
    verifie(J.js("(document.querySelector('#hud .nom-objet') || {}).textContent") == 'Flèches de lune', 'on touche un carquois : son nom s\'affiche (« Flèches de lune »)')
    pg.wait_for_timeout(2400); J.libre()
    verifie(J.partie()['heros']['pisteur']['objets'] == ['fleches-normales', 'fleches-argent'] and J.js("document.querySelector('#plaque-pisteur').classList.contains('complet')") and 'Complet' in J.js("document.querySelector('#plaque-pisteur').textContent"),
            'il le prend : l\'équipement est « Complet »')
    verifie(J.js("!document.querySelector('#scene [data-ob=\"fleches-lourdes\"].ob-guide, #scene [data-ob=\"fleches-lourdes\"] .ob-guide')") and J.js("document.querySelector('#b-repartir').classList.contains('guide')"), 'plus de rond jaune sur l\'autre carquois (plus de place) : c\'est « Continuer » qui le porte')
    J.objet('fleches-lourdes'); pg.wait_for_timeout(600)
    verifie(J.js("(document.querySelector('#hud .nom-objet') || {}).textContent") == 'Flèches transperçantes' and J.js("document.querySelector('#plaque-pisteur').classList.contains('choisir')") and len(J.partie()['heros']['pisteur']['objets']) == 2,
            'l\'autre carquois : les mains sont pleines, les deux cases bougent (il faut en reposer un)')
    J.tap('#plaque-pisteur [data-id="fleches-normales"]'); pg.wait_for_timeout(3000); J.libre()
    p = J.partie()
    verifie(p['heros']['pisteur']['objets'] == ['fleches-argent', 'fleches-lourdes'] and J.js("Regles.contenu(DJ.Explo._X().partie, 'reserve').objets") == ['fleches-normales'] and J.js("!!DJ.Explo._S().o['fleches-normales']"),
            'on repose les flèches normales (elles restent au sol de la réserve) : le Pisteur a les deux carquois')
    J.cap('reserve'); J.repartir()
    verifie(J.etat()['ecran'] == 'carte', 'la réserve ne se rouvre pas toute seule : il n\'y a plus rien à prendre sans reposer')
    J.tap('[data-act="entrer"]'); J.scene('reserve'); pg.wait_for_timeout(1200)
    verifie(J.js("!!DJ.Explo._S().o['fleches-normales']") and J.js("document.querySelectorAll('#plaque-pisteur .pl-case.pleine').length") == 2, 'en revenant : les flèches normales sont toujours là, au sol')
    J.repartir(); J.chemin('rats', 'canaux')
    # les égouts tournants
    J.va('egouts'); J.attends("DJ.Explo.etat().ici === 'canaux' && !DJ.Explo.etat().occupe && DJ.Explo._X().partie.faits['combat:egouts']", 30000); J.carte()
    verifie(J.etat()['ici'] == 'canaux', 'les égouts tournants ramènent aux canaux')
    # la page se recharge : on reprend où on était, la brume comprise
    pg.goto(PAGE + '?sanscombat=1'); pg.wait_for_timeout(900); J.carte()
    verifie(J.etat()['ici'] == 'canaux' and J.js("DJ.Explo._X().V.brume.estVu('reserve') && DJ.Explo._X().V.brume.estVu('aeration') && !DJ.Explo._X().V.brume.estVu('toiles')"),
            'la page rechargée : on reprend aux canaux, la brume levée est gardée')
    # la grotte de givre
    J.va('givre'); J.scene('givre'); J.objet('fleur-givre'); pg.wait_for_selector('#fenetre .code-gros', timeout=15000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'plante:givre'), f'la fleur de givre montre son code ({J.code_montre()})')
    J.clic('#fenetre .aller'); J.repartir(); J.chemin('canaux', 'toiles', 'J')
    verifie(sorted(J.etat()['sorties']) == ['dalles', 'eboulis', 'toiles'], f'l\'embranchement : deux chemins (et le retour) ({J.etat()["sorties"]})')
    # le cul-de-sac : le tas d'os (une morsure, puis la page blanche), le crâne secret
    J.va('eboulis'); J.scene('eboulis'); pv = J.partie()['heros']['pisteur']['pv']
    J.objet('tas-os'); pg.wait_for_timeout(3200); J.libre()
    verifie(J.partie()['heros']['pisteur']['pv'] == pv - 10, 'le tas d\'os : à la première fouille, un rat mord le Pisteur (−10)')
    J.objet('tas-os'); pg.wait_for_selector('#fenetre .code-gros', timeout=15000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'page:blanche'), f'la deuxième fouille donne la page blanche et son code ({J.code_montre()})')
    J.clic('#fenetre .aller'); J.libre()
    verifie(J.js("!document.querySelector('#scene .ob-crane .ob-guide, #scene [data-ob=\"crane\"].ob-guide')"), 'rien ne montre le crâne secret (c\'est le plan du Sage qui le dit)')
    J.objet('crane'); pg.wait_for_timeout(3400); J.libre()
    verifie(bool(J.partie()['faits'].get('secret')), 'toucher le bon endroit du mur ouvre le passage secret')
    J.cap('crane'); J.repartir()
    verifie('camp' in J.etat()['sorties'], 'la carte montre le passage secret vers le feu de camp')
    # le couloir aux dalles : l'explication en images, une erreur, puis le bon chemin
    J.chemin('J'); J.va('dalles'); J.scene('dalles')
    verifie(J.js("!!document.querySelector('#fenetre .expli') && !!document.querySelector('#fenetre .aller[data-act=\"dalles-go\"]')"), 'avant les dalles : une explication en images et un bouton jaune')
    verifie(not J.sans_lire(), 'l\'explication des dalles : chaque texte a son 🔊')
    J.cap('dalles-explication'); J.clic('[data-act="dalles-go"]')
    pv = [J.partie()['heros'][h]['pv'] for h in ('sage', 'alchimiste', 'pisteur')]
    J.objet('dalle-6-1'); pg.wait_for_timeout(2200); J.libre()
    pv2 = [J.partie()['heros'][h]['pv'] for h in ('sage', 'alchimiste', 'pisteur')]
    verifie(all(a - b == 15 for a, b in zip(pv, pv2)) and J.partie()['faits'].get('dalles', 0) == 0, f'une dalle sombre : −15 à chacun, et on ne passe pas ({pv} → {pv2})')
    for d in ['dalle-6-0', 'dalle-7-1', 'dalle-8-0', 'dalle-9-1', 'dalle-10-0', 'dalle-11-1']:
        J.objet(d); pg.wait_for_timeout(1200); J.libre()
    verifie(bool(J.partie()['faits'].get('piege:dalles')), 'les six bonnes dalles : le couloir est passé pour toujours')
    J.cap('dalles'); J.repartir()
    verifie('atelier' in J.etat()['sorties'], 'après les dalles, le chemin de l\'atelier est ouvert')
    J.chemin('atelier')
    # la bibliothèque : la page déchirée (à code) et le lutrin (à choix)
    J.va('bibliotheque'); J.scene('bibliotheque')
    verifie(J.js("!DJ.Explo._S().o['page-blanche']"), 'la bibliothèque : pas de page blanche ici (elle est dans le tas d\'os)')
    J.objet('page-dechiree'); pg.wait_for_selector('#fenetre .code-gros', timeout=15000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'page:dechiree'), f'la page déchirée montre son code pour le Sage ({J.code_montre()})')
    J.clic('#fenetre .aller'); J.libre()
    J.objet('lutrin', 0); pg.wait_for_timeout(2800); J.libre()
    verifie('cristal-lune' in J.partie()['heros']['sage']['objets'], 'le lutrin : le Sage prend le cristal de lune')
    J.repartir(); J.chemin('atelier')
    # les trois portes : la gueule mène à la fausse crypte (le sarcophage, l'amulette)
    J.va('portes'); J.scene('portes'); J.cap('portes')
    J.objet('porte-gueule'); J.scene('crypte')
    verifie(J.etat()['scene'] == 'crypte', 'la porte de la gueule mène à la fausse crypte')
    J.objet('sarcophage'); pg.wait_for_timeout(2800); J.libre()
    J.objet('amulette'); pg.wait_for_selector('#fenetre [data-act="qui-porte"]', timeout=10000)
    verifie(J.js("document.querySelectorAll('#fenetre [data-act=\"qui-porte\"]').length") == 3, 'l\'amulette : on choisit qui la porte')
    # le Pisteur a déjà ses deux carquois : lui donner l'amulette, c'est reposer quelque chose (on change d'avis, elle ira à l'Alchimiste)
    J.clic('[data-act="qui-porte"][data-id="pisteur"]'); pg.wait_for_timeout(700)
    verifie(J.js("!!document.querySelector('#plaque-pisteur.choisir')") and 'amulette' not in J.partie()['heros']['pisteur']['objets'], 'l\'amulette pour le Pisteur : ses mains sont pleines, ses cases bougent')
    J.objet('amulette'); pg.wait_for_selector('#fenetre [data-act="qui-porte"]', timeout=10000)
    verifie(J.js("!document.querySelector('#plaque-pisteur.choisir')"), 'on touche autre chose : l\'échange est annulé')
    J.clic('[data-act="qui-porte"][data-id="alchimiste"]'); pg.wait_for_timeout(2600); J.libre()
    verifie('amulette' in J.partie()['heros']['alchimiste']['objets'], 'l\'amulette de vie est portée par l\'Alchimiste')
    J.cap('crypte'); J.repartir(); J.chemin('portes'); J.scene('portes')
    J.objet('porte-oeil'); J.attends("DJ.Explo.etat().ici === 'ossuaire' && DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", 30000); J.carte()
    verifie(J.etat()['ici'] == 'ossuaire', 'la porte de l\'œil mène à l\'ossuaire')
    # le feu de camp : le repos (une fois), un code de sauvegarde, un code de recette, refaire le sac, les objets
    J.va('camp'); J.scene('camp')
    avant = J.partie()['heros']['sage']['pv']
    J.objet('feu'); pg.wait_for_timeout(2600); J.libre()
    verifie(J.partie()['heros']['sage']['pv'] > avant and J.partie()['repos'], f'le feu de camp soigne (le Sage : {avant} → {J.partie()["heros"]["sage"]["pv"]})')
    J.objet('feu'); pg.wait_for_timeout(700)
    verifie(J.partie()['repos'] is True and 'reposés' in J.etat()['texte'], 'le feu ne soigne qu\'une fois entre deux combats')
    J.tap('[data-act="pave"]')
    for k in ['lune', 'cle', 'arbre']:
        J.clic('[data-act="symbole"][data-id="%s"]' % k)
    pg.wait_for_timeout(900)
    verifie(J.partie()['sauvegarde'] and J.partie()['sauvegarde'].get('lieu') == 'camp', 'le code de la page blanche n° 1 sauvegarde au feu de camp')
    J.cap('sauvegarde'); J.clic('#fenetre .aller')
    J.tap('[data-act="pave"]')
    for k in ['lune', 'cle', 'arbre']:
        J.clic('[data-act="symbole"][data-id="%s"]' % k)
    pg.wait_for_timeout(900)
    verifie('déjà servi' in J.js("document.querySelector('#fenetre .ligne').textContent"), 'un code ne marche qu\'une fois')
    J.clic('[data-act="pave-efface"]')
    for k in ['champi', 'coeur', 'cle']:
        J.clic('[data-act="symbole"][data-id="%s"]' % k)
    pg.wait_for_timeout(900)
    verifie('givre' in J.partie()['recettes'], 'le code de l\'Alchimiste apprend la recette du Givre')
    J.clic('#fenetre .aller')
    J.tap('[data-act="refaire-sac"]'); pg.wait_for_selector('#sac', timeout=10000); pg.wait_for_timeout(400)
    verifie(J.js("document.querySelectorAll('#sac .recette').length") == 8 and J.js("document.querySelectorAll('#sac .sac-case').length") == 4, 'au feu de camp, on refait le sac : 8 recettes, 4 places avec la sacoche')
    J.tap('.recette[data-id="givre"]'); J.cap('sac-camp'); J.tap('[data-act="sac-pret"]'); J.scene('camp')
    verifie(len(J.partie()['sac']) == 4 and 'givre' in J.partie()['sac'], f'le nouveau sac est pris ({J.partie()["sac"]})')
    J.tap('[data-act="objets"]')
    verifie(J.js("document.querySelectorAll('#fenetre .code-ligne').length") >= 4 and not J.sans_lire(), '« Objets » : les objets portés, les codes à donner, le sac, chacun avec son 🔊')
    J.cap('objets'); J.clic('#fenetre .fermer'); J.repartir()
    # la fin : le bassin (tenu pour gagné), la porte aux quatre signes, Léo
    J.chemin('bassin'); J.va('porte4'); pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'porte:odette'), f'la porte aux quatre signes donne le code pour le Sage ({J.code_montre()})')
    J.cap('porte4'); J.clic('#fenetre .aller'); J.repartir()
    J.va('leo'); pg.wait_for_selector('#fenetre .code-gros', timeout=40000); pg.wait_for_timeout(300)
    verifie(J.code_montre() == noms_code(pg, 'leo:attrape'), f'Léo : le code pour le Barde ({J.code_montre()})')
    J.cap('leo'); J.clic('#fenetre .aller'); pg.wait_for_selector('#fin-donjon', timeout=10000); pg.wait_for_timeout(500)
    verifie(not J.sans_lire() and J.js("!!document.querySelector('#fin-donjon .aller')"), 'l\'écran de fin, avec son 🔊 et son bouton jaune')
    J.cap('fin')
    J.fin()


def combat(nav):
    print('— Un vrai combat depuis la carte')
    J = Jeu(nav, PAGE + '?nouveau=1&graine=7&vitesse=2', 'combat'); pg = J.pg
    for r in ['feu', 'huile', 'baume']:
        J.tap('.recette[data-id="%s"]' % r)
    J.tap('[data-act="sac-pret"]'); J.scene('puits'); J.repartir()
    J.va('rats')

    def libre(ms=90000):
        return J.attends("(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()", ms)
    verifie(libre(), 'la salle des rats : le combat se lance en arrivant')
    # la page se recharge en plein combat : on revient à l'entrée de la salle (le combat recommence)
    pg.goto(PAGE + '?vitesse=2'); pg.wait_for_timeout(900)
    verifie(libre() and J.js("DJ.Combat.etat().tour") == 1 and J.js("DJ.Explo._X().partie.lieu") == 'rats', 'la page rechargée en plein combat : le combat reprend au début')

    def geste(h, g, sel):
        J.tap('.b-heros[data-id="%s"]' % h); J.tap('.carte[data-id="%s"]' % g); J.clic(sel); pg.wait_for_timeout(300); libre()
    # l'Huile retourne un rat, la flèche du Pisteur fait un critique ; le Sage protège le Pisteur pour finir le tour
    for b in ['b1', 'b2', 'b3']:
        geste('alchimiste', 'p:huile', '#zone-' + b); geste('pisteur', 'fleche', '#zone-' + b)
        if b != 'b3':
            geste('sage', 'bouclier', '.zone[data-type="heros"][data-id="pisteur"]')
    pg.wait_for_selector('#fin [data-act="combat-fin"]', timeout=40000); pg.wait_for_timeout(400)
    verifie(J.js("!!document.querySelector('#fin .victoire')"), 'trois critiques : la victoire')
    J.cap('victoire'); J.tap('#fin [data-act="combat-fin"]'); J.carte()
    verifie(J.etat()['ici'] == 'rats' and sorted(J.etat()['sorties']) == ['canaux', 'puits', 'reserve'], 'après la victoire : la carte, et la suite du chemin')
    # la fuite : aux canaux, on fuit ; retour au fond du puits (la sauvegarde de départ), le sac à refaire
    J.va('canaux'); libre()
    J.tap('#fuite'); J.clic('#fenetre [data-act="fuir"]'); pg.wait_for_selector('#fin [data-act="combat-fin"]', timeout=40000); pg.wait_for_timeout(400)
    verifie(J.js("!!document.querySelector('#fin .point')") and 'Le fond du puits' in J.js("document.querySelector('#fin .retour').textContent"), '« On fait le point » dit où l\'on repart')
    J.cap('point'); J.tap('#fin [data-act="combat-fin"]'); pg.wait_for_selector('#sac', timeout=10000); pg.wait_for_timeout(400)
    verifie(J.js("document.querySelectorAll('#sac .recette.choisie').length") == 3, 'après la fuite : le sac d\'avant est reproposé (on peut le changer)')
    J.tap('[data-act="sac-pret"]'); J.carte()
    p = J.partie()
    verifie(J.etat()['ici'] == 'puits' and 'combat:rats' not in p['faits'] and p.get('fuites', {}).get('canaux') == 1, 'la fuite ramène au fond du puits : les rats sont revenus, la fuite est comptée')
    verifie(p['vus'].get('rats') == 1 and p['vus'].get('canaux') == 1, 'après la fuite, la brume levée est gardée (seuls les monstres reviennent)')
    J.fin()


with sync_playwright() as p:
    nav = p.chromium.launch()
    for f in ([visite, combat] if len(sys.argv) < 2 else [globals()[a] for a in sys.argv[1:]]):
        try:
            f(nav)
        except Exception as ex:
            verifie(False, f'{f.__name__} : le test s\'arrête ({str(ex)[:300]})')
    nav.close()
print(f'\n{len(OK)} vérifications réussies, {len(ERREURS)} échecs')
for x in ERREURS:
    print('  ✗', x)
sys.exit(1 if ERREURS else 0)
